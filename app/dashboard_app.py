import json
from pathlib import Path

from flask import Flask, jsonify, render_template_string, request
import geopandas as gpd
import numpy as np
import rasterio
from localtileserver import TileClient

PROJECT_ROOT = Path(r"D:/Side_Projects/Geoshield_ai")
PROCESSED_RASTER_DIR = PROJECT_ROOT / "data" / "processed" / "rasters" / "aligned"
PROCESSED_VECTOR_DIR = PROJECT_ROOT / "data" / "processed" / "vectors"
PROCESSED_INVENTORY_DIR = PROJECT_ROOT / "data" / "processed" / "inventory"
OUTPUTS_DIR = PROJECT_ROOT / "data" / "outputs"
MODEL_PATH = PROJECT_ROOT / "models" / "random_forest.pkl"

SUSCEPTIBILITY_TIF = OUTPUTS_DIR / "susceptibility_map.tif"

RASTER_PATHS = {
    "slope": PROCESSED_RASTER_DIR / "slope_aligned.tif",
    "rainfall": PROCESSED_RASTER_DIR / "rainfall_aligned.tif",
    "ndvi": PROCESSED_RASTER_DIR / "ndvi_aligned.tif",
    "road_distance": PROCESSED_RASTER_DIR / "road_distance.tif",
    "river_distance": PROCESSED_RASTER_DIR / "river_distance.tif",
    "landcover": PROCESSED_RASTER_DIR / "landcover_aligned.tif",
}

VECTOR_PATHS = {
    "boundary": PROCESSED_VECTOR_DIR / "reprojected" / "boundary_epsg4326.shp",
    "roads": PROCESSED_VECTOR_DIR / "clipped" / "roads_clip.shp",
    "rivers": PROCESSED_VECTOR_DIR / "clipped" / "rivers_clip.shp",
    "landslides": PROCESSED_INVENTORY_DIR / "landslides_epsg4326.geojson",
}

if not SUSCEPTIBILITY_TIF.exists():
    raise FileNotFoundError(f"Missing raster: {SUSCEPTIBILITY_TIF}")

app = Flask(__name__)

def load_geojson(path: Path, simplify: float | None = None) -> dict:
    if not path.exists():
        return {"type": "FeatureCollection", "features": []}
    gdf = gpd.read_file(path)
    if simplify is not None:
        gdf["geometry"] = gdf.geometry.simplify(simplify, preserve_topology=True)
    return json.loads(gdf.to_json())

def susceptibility_class(score: float) -> str:
    if np.isnan(score):
        return "unknown"
    if score < 0.33:
        return "low"
    if score < 0.66:
        return "moderate"
    return "high"

def raster_value(path: Path, lon: float, lat: float) -> float:
    if not path.exists():
        return float("nan")
    with rasterio.open(path) as src:
        for val in src.sample([(lon, lat)]):
            v = val[0]
            return float(v) if np.isfinite(v) else float("nan")
    return float("nan")

def summarize_risk(raster_path: Path) -> dict:
    with rasterio.open(raster_path) as src:
        data = src.read(1, masked=True)
        flat = data.compressed()
        if flat.size == 0:
            return {"low": 0, "moderate": 0, "high": 0}
        low = np.sum(flat < 0.33)
        moderate = np.sum((flat >= 0.33) & (flat < 0.66))
        high = np.sum(flat >= 0.66)
        total = flat.size
        return {
            "low": round(100.0 * low / total, 2),
            "moderate": round(100.0 * moderate / total, 2),
            "high": round(100.0 * high / total, 2),
        }

@app.route("/")
def index():
    client = TileClient(str(SUSCEPTIBILITY_TIF))
    tile_url = client.get_tile_url()

    boundary = load_geojson(VECTOR_PATHS["boundary"], simplify=0.001)
    roads = load_geojson(VECTOR_PATHS["roads"], simplify=0.001)
    rivers = load_geojson(VECTOR_PATHS["rivers"], simplify=0.001)
    landslides = load_geojson(VECTOR_PATHS["landslides"], simplify=0.0005)

    total_landslides = len(landslides.get("features", []))
    risk_summary = summarize_risk(SUSCEPTIBILITY_TIF)

    top_features = []
    if MODEL_PATH.exists():
        try:
            import joblib
            model = joblib.load(MODEL_PATH)
            if hasattr(model, "feature_importances_"):
                names = ["slope", "aspect", "twi", "rainfall", "ndvi", "landcover", "road_distance", "river_distance"]
                importances = list(zip(names, model.feature_importances_))
                importances.sort(key=lambda x: x[1], reverse=True)
                top_features = [(n, round(float(v), 4)) for n, v in importances[:5]]
        except Exception:
            top_features = []

    return render_template_string(
        TEMPLATE,
        tile_url=tile_url,
        boundary=json.dumps(boundary),
        roads=json.dumps(roads),
        rivers=json.dumps(rivers),
        landslides=json.dumps(landslides),
        total_landslides=total_landslides,
        risk_summary=risk_summary,
        top_features=top_features,
    )

@app.route("/query")
def query():
    lat = float(request.args.get("lat", "0"))
    lon = float(request.args.get("lon", "0"))

    risk = raster_value(SUSCEPTIBILITY_TIF, lon, lat)
    response = {
        "risk_score": round(risk, 4) if np.isfinite(risk) else None,
        "susceptibility_class": susceptibility_class(risk),
        "slope": raster_value(RASTER_PATHS["slope"], lon, lat),
        "rainfall": raster_value(RASTER_PATHS["rainfall"], lon, lat),
        "ndvi": raster_value(RASTER_PATHS["ndvi"], lon, lat),
        "distance_to_road": raster_value(RASTER_PATHS["road_distance"], lon, lat),
        "distance_to_river": raster_value(RASTER_PATHS["river_distance"], lon, lat),
        "landcover": raster_value(RASTER_PATHS["landcover"], lon, lat),
    }

    return jsonify(response)

TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>GeoShield AI Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    #map { height: 100vh; width: calc(100% - 280px); float: right; }
    #sidebar {
      width: 280px; height: 100vh; float: left; padding: 12px; box-sizing: border-box;
      background: #f6f6f6; border-right: 1px solid #ddd; overflow-y: auto;
    }
    .section { margin-bottom: 16px; }
    .legend { background: #fff; padding: 8px; border: 1px solid #ccc; }
    .legend-item { display: flex; align-items: center; margin-bottom: 6px; }
    .box { width: 14px; height: 14px; margin-right: 6px; }
  </style>
</head>
<body>
  <div id="sidebar">
    <h3>GeoShield AI</h3>
    <div class="section">
      <strong>Summary</strong><br/>
      Landslides: {{ total_landslides }}<br/>
      High risk: {{ risk_summary.high }}%<br/>
      Moderate risk: {{ risk_summary.moderate }}%<br/>
      Low risk: {{ risk_summary.low }}%
    </div>
    <div class="section">
      <strong>Top Features</strong><br/>
      {% for name, value in top_features %}
        {{ name }}: {{ value }}<br/>
      {% endfor %}
    </div>
    <div class="section legend">
      <strong>Legend</strong>
      <div class="legend-item"><span class="box" style="background:#2c7bb6"></span>Low</div>
      <div class="legend-item"><span class="box" style="background:#fdae61"></span>Moderate</div>
      <div class="legend-item"><span class="box" style="background:#d7191c"></span>High</div>
    </div>
    <div class="section">
      <strong>Opacity</strong><br/>
      <input id="opacity" type="range" min="0" max="1" step="0.05" value="0.7" />
    </div>
  </div>
  <div id="map"></div>

  <script>
    const map = L.map('map').setView([27.8, 85.8], 9);
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 });
    osm.addTo(map);

    const susceptibility = L.tileLayer('{{ tile_url }}', { opacity: 0.7 });
    susceptibility.addTo(map);

    const boundary = L.geoJSON({{ boundary | safe }}, { color: 'black', weight: 2, fill: false });
    const roads = L.geoJSON({{ roads | safe }}, { color: '#888', weight: 1 });
    const rivers = L.geoJSON({{ rivers | safe }}, { color: '#1f78b4', weight: 1 });
    const landslides = L.geoJSON({{ landslides | safe }}, { color: '#d7191c', radius: 3 });

    boundary.addTo(map);

    const overlays = {
      'Susceptibility': susceptibility,
      'Boundary': boundary,
      'Roads': roads,
      'Rivers': rivers,
      'Landslides': landslides
    };

    L.control.layers({ 'OpenStreetMap': osm }, overlays).addTo(map);

    document.getElementById('opacity').addEventListener('input', (e) => {
      susceptibility.setOpacity(parseFloat(e.target.value));
    });

    map.on('click', function(e) {
      const url = `/query?lat=${e.latlng.lat}&lon=${e.latlng.lng}`;
      fetch(url).then(r => r.json()).then(d => {
        const content = `
          <b>Risk score:</b> ${d.risk_score}<br/>
          <b>Class:</b> ${d.susceptibility_class}<br/>
          <b>Slope:</b> ${d.slope}<br/>
          <b>Rainfall:</b> ${d.rainfall}<br/>
          <b>NDVI:</b> ${d.ndvi}<br/>
          <b>Distance to road:</b> ${d.distance_to_road}<br/>
          <b>Distance to river:</b> ${d.distance_to_river}<br/>
          <b>Landcover:</b> ${d.landcover}
        `;
        L.popup().setLatLng(e.latlng).setContent(content).openOn(map);
      });
    });
  </script>
</body>
</html>
"""

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
