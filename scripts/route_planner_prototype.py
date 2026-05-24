"""Proof-of-concept safe routing over a landslide susceptibility raster.

This script:
- loads a susceptibility raster with Rasterio,
- converts it into a weighted cost surface,
- finds a shortest route that ignores susceptibility,
- finds a safest route that prefers low-susceptibility cells,
- compares the routes, prints summary statistics, and
- saves a visualization with both routes overlaid on the raster.

The code is intentionally modular so it can later move into a FastAPI
backend or be called from a React + Leaflet dashboard.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence, Tuple

import matplotlib.pyplot as plt
import networkx as nx
import numpy as np
import rasterio
from affine import Affine
from rasterio.plot import plotting_extent
from rasterio.windows import Window, transform as window_transform


Coordinate = Tuple[float, float]
GridPoint = Tuple[int, int]


@dataclass
class RouteResult:
    name: str
    grid_path: List[GridPoint]
    lonlat_path: List[Coordinate]
    route_length_km: float
    average_risk: float
    max_risk: float
    total_cost: float


def load_raster(raster_path: str | Path) -> dict:
    """Load the raster and return the first band plus metadata."""
    raster_path = Path(raster_path)
    with rasterio.open(raster_path) as src:
        array = src.read(1, masked=True)
        return {
            "array": array,
            "transform": src.transform,
            "crs": src.crs,
            "bounds": src.bounds,
            "profile": src.profile,
            "path": raster_path,
        }


def create_cost_surface(susceptibility: np.ndarray, risk_multiplier: float = 10.0) -> np.ndarray:
    """Convert susceptibility values into a positive movement cost surface.

    A cell with higher susceptibility becomes more expensive to traverse.
    """
    values = np.asarray(susceptibility, dtype=np.float32)
    values = np.ma.filled(values, np.nan)
    values = np.clip(values, 0.0, 1.0)
    cost = 1.0 + values * risk_multiplier
    cost[~np.isfinite(cost)] = np.inf
    return cost


def _clip_window_to_bounds(row_min: int, row_max: int, col_min: int, col_max: int, height: int, width: int) -> Window:
    row_min = max(0, row_min)
    col_min = max(0, col_min)
    row_max = min(height, row_max)
    col_max = min(width, col_max)
    return Window(col_min, row_min, max(1, col_max - col_min), max(1, row_max - row_min))


def _window_for_points(src: rasterio.io.DatasetReader, start: Coordinate, end: Coordinate, padding_cells: int = 75) -> Window:
    start_row, start_col = src.index(*start)
    end_row, end_col = src.index(*end)

    row_min = min(start_row, end_row) - padding_cells
    row_max = max(start_row, end_row) + padding_cells + 1
    col_min = min(start_col, end_col) - padding_cells
    col_max = max(start_col, end_col) + padding_cells + 1

    return _clip_window_to_bounds(row_min, row_max, col_min, col_max, src.height, src.width)


def _block_reduce_mean(array: np.ndarray, factor_y: int, factor_x: int) -> np.ndarray:
    """Downsample by mean pooling, padding at the bottom/right if needed."""
    if factor_y <= 1 and factor_x <= 1:
        return np.asarray(array)

    arr = np.asarray(array, dtype=np.float32)
    pad_y = (-arr.shape[0]) % factor_y
    pad_x = (-arr.shape[1]) % factor_x
    if pad_y or pad_x:
        arr = np.pad(arr, ((0, pad_y), (0, pad_x)), mode="edge")

    new_h = arr.shape[0] // factor_y
    new_w = arr.shape[1] // factor_x
    reduced = arr.reshape(new_h, factor_y, new_w, factor_x).mean(axis=(1, 3))
    return reduced


def _reduce_index(index: int, factor: int) -> int:
    return int(index // max(1, factor))


def _prepare_analysis_window(
    src: rasterio.io.DatasetReader,
    susceptibility: np.ndarray,
    start: Coordinate,
    end: Coordinate,
    max_dim: int = 180,
    padding_cells: int = 75,
) -> dict:
    """Extract a manageable analysis window and optionally downsample it."""
    window = _window_for_points(src, start, end, padding_cells=padding_cells)
    row_off, col_off = int(window.row_off), int(window.col_off)
    window_array = susceptibility[row_off : row_off + int(window.height), col_off : col_off + int(window.width)]

    factor_y = max(1, int(np.ceil(window_array.shape[0] / max_dim)))
    factor_x = max(1, int(np.ceil(window_array.shape[1] / max_dim)))
    reduced_array = _block_reduce_mean(window_array, factor_y, factor_x)

    start_row, start_col = src.index(*start)
    end_row, end_col = src.index(*end)
    local_start = (start_row - row_off, start_col - col_off)
    local_end = (end_row - row_off, end_col - col_off)

    reduced_start = (_reduce_index(local_start[0], factor_y), _reduce_index(local_start[1], factor_x))
    reduced_end = (_reduce_index(local_end[0], factor_y), _reduce_index(local_end[1], factor_x))

    reduced_start = (
        int(np.clip(reduced_start[0], 0, reduced_array.shape[0] - 1)),
        int(np.clip(reduced_start[1], 0, reduced_array.shape[1] - 1)),
    )
    reduced_end = (
        int(np.clip(reduced_end[0], 0, reduced_array.shape[0] - 1)),
        int(np.clip(reduced_end[1], 0, reduced_array.shape[1] - 1)),
    )

    base_transform = window_transform(window, src.transform)
    reduced_transform = base_transform * Affine.scale(factor_x, factor_y)

    return {
        "window": window,
        "array": reduced_array,
        "transform": reduced_transform,
        "start": reduced_start,
        "end": reduced_end,
        "factor_y": factor_y,
        "factor_x": factor_x,
    }


def build_graph(cost_surface: np.ndarray) -> nx.Graph:
    """Build an 8-neighbor grid graph from a 2D cost surface."""
    graph = nx.Graph()
    height, width = cost_surface.shape

    for row in range(height):
        for col in range(width):
            if not np.isfinite(cost_surface[row, col]):
                continue

            node = (row, col)
            graph.add_node(node)

            for d_row, d_col in ((0, 1), (1, 0), (1, 1), (1, -1)):
                n_row = row + d_row
                n_col = col + d_col
                if not (0 <= n_row < height and 0 <= n_col < width):
                    continue
                if not np.isfinite(cost_surface[n_row, n_col]):
                    continue

                step = float(np.hypot(d_row, d_col))
                edge_cost = float((cost_surface[row, col] + cost_surface[n_row, n_col]) / 2.0 * step)
                graph.add_edge(node, (n_row, n_col), weight=edge_cost)

    return graph


def _heuristic_factory(goal: GridPoint, cost_surface: np.ndarray):
    min_cost = float(np.nanmin(cost_surface[np.isfinite(cost_surface)])) if np.isfinite(cost_surface).any() else 1.0

    def heuristic(node: GridPoint, _goal: GridPoint = goal) -> float:
        return float(np.hypot(node[0] - _goal[0], node[1] - _goal[1]) * min_cost)

    return heuristic


def find_shortest_route(cost_surface: np.ndarray, start: GridPoint, end: GridPoint) -> List[GridPoint]:
    """Find the shortest route ignoring susceptibility by using a uniform cost grid."""
    uniform_cost = np.where(np.isfinite(cost_surface), 1.0, np.inf)
    graph = build_graph(uniform_cost)
    return nx.shortest_path(graph, start, end, weight="weight", method="dijkstra")


def find_safest_route(cost_surface: np.ndarray, start: GridPoint, end: GridPoint) -> List[GridPoint]:
    """Find the safest route using susceptibility-weighted costs."""
    graph = build_graph(cost_surface)
    heuristic = _heuristic_factory(end, cost_surface)
    return nx.astar_path(graph, start, end, heuristic=heuristic, weight="weight")


def _grid_path_to_lonlat(path: Sequence[GridPoint], transform) -> List[Coordinate]:
    coords: List[Coordinate] = []
    for row, col in path:
        lon, lat = rasterio.transform.xy(transform, row, col, offset="center")
        coords.append((float(lon), float(lat)))
    return coords


def _haversine_km(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    radius_km = 6371.0088
    lon1_r, lat1_r = np.radians([lon1, lat1])
    lon2_r, lat2_r = np.radians([lon2, lat2])
    dlon = lon2_r - lon1_r
    dlat = lat2_r - lat1_r
    a = np.sin(dlat / 2.0) ** 2 + np.cos(lat1_r) * np.cos(lat2_r) * np.sin(dlon / 2.0) ** 2
    return float(2.0 * radius_km * np.arcsin(np.sqrt(a)))


def calculate_route_statistics(
    path: Sequence[GridPoint],
    susceptibility_surface: np.ndarray,
    transform,
    total_cost: float,
) -> dict:
    """Calculate route statistics for a given path."""
    lonlat_path = _grid_path_to_lonlat(path, transform)
    route_length_km = 0.0
    for (lon1, lat1), (lon2, lat2) in zip(lonlat_path[:-1], lonlat_path[1:]):
        route_length_km += _haversine_km(lon1, lat1, lon2, lat2)

    risks = np.array([float(susceptibility_surface[row, col]) for row, col in path], dtype=np.float32)
    risks = risks[np.isfinite(risks)]

    return {
        "lonlat_path": lonlat_path,
        "route_length_km": route_length_km,
        "average_risk": float(risks.mean()) if risks.size else float("nan"),
        "max_risk": float(risks.max()) if risks.size else float("nan"),
        "total_cost": float(total_cost),
    }


def _accumulate_path_cost(path: Sequence[GridPoint], cost_surface: np.ndarray) -> float:
    total_cost = 0.0
    for (r1, c1), (r2, c2) in zip(path[:-1], path[1:]):
        step = float(np.hypot(r2 - r1, c2 - c1))
        step_cost = float((cost_surface[r1, c1] + cost_surface[r2, c2]) / 2.0 * step)
        total_cost += step_cost
    return total_cost


def plot_routes(
    raster_array: np.ndarray,
    transform,
    shortest_path: Sequence[GridPoint],
    safest_path: Sequence[GridPoint],
    start: GridPoint,
    end: GridPoint,
    output_path: str | Path | None = None,
    show: bool = False,
) -> None:
    """Plot the raster and overlay the shortest and safest routes."""
    extent = plotting_extent(raster_array, transform)

    fig, axes = plt.subplots(1, 2, figsize=(16, 7), constrained_layout=True)
    panels = [
        (axes[0], shortest_path, "Shortest route (ignores susceptibility)", "tab:cyan"),
        (axes[1], safest_path, "Safest route (weighted by susceptibility)", "tab:red"),
    ]

    for ax, path, title, color in panels:
        im = ax.imshow(raster_array, extent=extent, origin="upper", cmap="viridis", alpha=0.92)
        path_coords = _grid_path_to_lonlat(path, transform)
        if path_coords:
            xs = [pt[0] for pt in path_coords]
            ys = [pt[1] for pt in path_coords]
            ax.plot(xs, ys, color=color, linewidth=2.5, label=title, zorder=3)
        start_lon, start_lat = rasterio.transform.xy(transform, start[0], start[1], offset="center")
        end_lon, end_lat = rasterio.transform.xy(transform, end[0], end[1], offset="center")
        ax.scatter([start_lon], [start_lat], c="white", edgecolors="black", s=90, marker="o", label="Start", zorder=4)
        ax.scatter([end_lon], [end_lat], c="gold", edgecolors="black", s=90, marker="*", label="End", zorder=4)
        ax.set_title(title)
        ax.set_xlabel("Longitude")
        ax.set_ylabel("Latitude")
        ax.legend(loc="lower left", fontsize=9)

    fig.colorbar(im, ax=axes.ravel().tolist(), shrink=0.85, label="Susceptibility")

    if output_path is not None:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(output_path, dpi=200, bbox_inches="tight")
        print(f"Saved route comparison figure to: {output_path}")

    if show:
        plt.show()
    plt.close(fig)


def _format_delta(new_value: float, old_value: float) -> str:
    delta = new_value - old_value
    pct = (delta / old_value * 100.0) if old_value else float("inf")
    return f"{delta:+.2f} ({pct:+.1f}%)"


def run_route_prototype(
    raster_path: str | Path,
    start: Coordinate,
    end: Coordinate,
    output_figure: str | Path | None = None,
    max_dim: int = 180,
    padding_cells: int = 75,
    risk_multiplier: float = 10.0,
    show: bool = False,
) -> dict:
    """Run the full proof-of-concept routing workflow."""
    raster_info = load_raster(raster_path)

    with rasterio.open(raster_info["path"]) as src:
        if not (src.bounds.left <= start[0] <= src.bounds.right and src.bounds.bottom <= start[1] <= src.bounds.top):
            raise ValueError("Start coordinate is outside the raster bounds.")
        if not (src.bounds.left <= end[0] <= src.bounds.right and src.bounds.bottom <= end[1] <= src.bounds.top):
            raise ValueError("End coordinate is outside the raster bounds.")

        prep = _prepare_analysis_window(
            src,
            raster_info["array"],
            start,
            end,
            max_dim=max_dim,
            padding_cells=padding_cells,
        )

    susceptibility_window = np.asarray(prep["array"], dtype=np.float32)
    cost_surface = create_cost_surface(susceptibility_window, risk_multiplier=risk_multiplier)

    start_rc = prep["start"]
    end_rc = prep["end"]

    shortest_path = find_shortest_route(cost_surface, start_rc, end_rc)
    safest_path = find_safest_route(cost_surface, start_rc, end_rc)

    shortest_total_cost = _accumulate_path_cost(shortest_path, np.where(np.isfinite(cost_surface), 1.0, np.inf))
    safest_total_cost = _accumulate_path_cost(safest_path, cost_surface)

    shortest_stats = calculate_route_statistics(shortest_path, susceptibility_window, prep["transform"], shortest_total_cost)
    safest_stats = calculate_route_statistics(safest_path, susceptibility_window, prep["transform"], safest_total_cost)

    print("\nGeoShield AI - Safe Routing Prototype")
    print("=" * 44)
    print(f"Raster: {raster_path}")
    print(f"Start (lon, lat): {start}")
    print(f"End   (lon, lat): {end}")
    print(f"Analysis window shape: {susceptibility_window.shape}")
    print(f"Risk multiplier: {risk_multiplier:.1f}")
    print()
    print("Shortest Route")
    print(f"  Length (km): {shortest_stats['route_length_km']:.3f}")
    print(f"  Average risk: {shortest_stats['average_risk']:.4f}")
    print(f"  Maximum risk: {shortest_stats['max_risk']:.4f}")
    print(f"  Total cost: {shortest_stats['total_cost']:.3f}")
    print()
    print("Safest Route")
    print(f"  Length (km): {safest_stats['route_length_km']:.3f}")
    print(f"  Average risk: {safest_stats['average_risk']:.4f}")
    print(f"  Maximum risk: {safest_stats['max_risk']:.4f}")
    print(f"  Total cost: {safest_stats['total_cost']:.3f}")
    print()
    print("Comparison")
    print(f"  Distance increase: {_format_delta(safest_stats['route_length_km'], shortest_stats['route_length_km'])}")
    print(f"  Risk reduction (avg): {_format_delta(shortest_stats['average_risk'], safest_stats['average_risk'])}")
    print(f"  Max risk reduction: {_format_delta(shortest_stats['max_risk'], safest_stats['max_risk'])}")

    plot_routes(
        raster_array=susceptibility_window,
        transform=prep["transform"],
        shortest_path=shortest_path,
        safest_path=safest_path,
        start=start_rc,
        end=end_rc,
        output_path=output_figure,
        show=show,
    )

    return {
        "shortest": shortest_stats,
        "safest": safest_stats,
        "comparison": {
            "distance_increase_km": safest_stats["route_length_km"] - shortest_stats["route_length_km"],
            "average_risk_reduction": shortest_stats["average_risk"] - safest_stats["average_risk"],
            "maximum_risk_reduction": shortest_stats["max_risk"] - safest_stats["max_risk"],
        },
    }


def _default_coordinates(raster_path: Path) -> tuple[Coordinate, Coordinate]:
    with rasterio.open(raster_path) as src:
        left, bottom, right, top = src.bounds
        start = (left + 0.10 * (right - left), bottom + 0.18 * (top - bottom))
        end = (right - 0.10 * (right - left), top - 0.18 * (top - bottom))
    return start, end


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Safe route planning prototype for GeoShield AI")
    parser.add_argument("--raster", type=str, default="data/outputs/susceptibility_map.tif", help="Path to susceptibility raster")
    parser.add_argument("--start-lon", type=float, default=None, help="Start longitude")
    parser.add_argument("--start-lat", type=float, default=None, help="Start latitude")
    parser.add_argument("--end-lon", type=float, default=None, help="End longitude")
    parser.add_argument("--end-lat", type=float, default=None, help="End latitude")
    parser.add_argument("--max-dim", type=int, default=180, help="Maximum grid dimension after downsampling")
    parser.add_argument("--padding-cells", type=int, default=75, help="Padding around the start/end window")
    parser.add_argument("--risk-multiplier", type=float, default=10.0, help="Risk multiplier used in the cost surface")
    parser.add_argument("--output-figure", type=str, default="data/outputs/figures/safe_route_demo.png", help="Where to save the comparison figure")
    parser.add_argument("--show", action="store_true", help="Show the figure interactively")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    raster_path = Path(args.raster)

    if args.start_lon is None or args.start_lat is None or args.end_lon is None or args.end_lat is None:
        start, end = _default_coordinates(raster_path)
    else:
        start = (args.start_lon, args.start_lat)
        end = (args.end_lon, args.end_lat)

    run_route_prototype(
        raster_path=raster_path,
        start=start,
        end=end,
        output_figure=args.output_figure,
        max_dim=args.max_dim,
        padding_cells=args.padding_cells,
        risk_multiplier=args.risk_multiplier,
        show=args.show,
    )


if __name__ == "__main__":
    main()
