from pathlib import Path

import folium
import geopandas as gpd
from localtileserver import TileClient, get_leaflet_tile_layer

PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUTS_DIR = PROJECT_ROOT / "data" / "outputs"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

SUSCEPTIBILITY_TIF = OUTPUTS_DIR / "susceptibility_map.tif"
LANDSLIDE_POINTS = PROCESSED_DIR / "inventory" / "landslides_epsg4326.geojson"

if not SUSCEPTIBILITY_TIF.exists():
    raise FileNotFoundError(f"Missing raster: {SUSCEPTIBILITY_TIF}")

m = folium.Map(location=[27.8, 85.8], zoom_start=9, tiles="OpenStreetMap")

# Add susceptibility raster tiles
client = TileClient(str(SUSCEPTIBILITY_TIF))
layer = get_leaflet_tile_layer(client, opacity=0.7)
layer.add_to(m)

# Add landslide points overlay (if available)
if LANDSLIDE_POINTS.exists():
    gdf = gpd.read_file(LANDSLIDE_POINTS)
    folium.GeoJson(gdf, name="Landslide Points").add_to(m)

folium.LayerControl().add_to(m)

out_html = OUTPUTS_DIR / "susceptibility_map.html"
m.save(str(out_html))
print(f"Saved web map: {out_html}")
