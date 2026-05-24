# GeoShield AI — Hackathon Roadmap

For a 24-hour hackathon, focus on a clean, demo-ready frontend that displays your existing model outputs and leaves hooks for future features. Don't try to build a full enterprise system — prioritize clarity, polish, and the judging criteria.

Recommended Tech Stack

Frontend:

- React + TypeScript
- Vite
- Tailwind CSS
- Leaflet (map)
- Recharts (charts)
- Axios (API calls)

Backend:

- FastAPI (Python)
- Rasterio
- GeoPandas
- Scikit-Learn

Suggested React Project Structure

src/
│
├── components/
│   ├── Map/
│   │   ├── RiskMap.tsx
│   │   ├── HotspotLayer.tsx
│   │   └── RouteLayer.tsx
│   
│   ├── Dashboard/
│   │   ├── StatsCards.tsx
│   │   ├── RiskDistributionChart.tsx
│   │   └── MunicipalityRanking.tsx
│   
│   ├── Simulation/
│   │   ├── RainfallSlider.tsx
│   │   ├── VegetationSlider.tsx
│   │   └── SimulationPanel.tsx
│   
│   ├── Hotspots/
│   │   └── HotspotDetails.tsx
│   
│   └── Layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── Footer.tsx
│
├── pages/
│   ├── Dashboard.tsx
│   ├── Analysis.tsx
│   ├── Simulation.tsx
│   └── Routes.tsx
│
├── services/
│   ├── api.ts
│   ├── hotspotApi.ts
│   ├── routeApi.ts
│   └── simulationApi.ts
│
├── hooks/
│
├── types/
│
├── App.tsx
│
└── main.tsx

Main Dashboard Layout
 --------------------------------------------------
| Header                                           |
 --------------------------------------------------
| Sidebar | Stats Cards                            |
|         |-----------------------------------------|
|         |                                         |
|         |      Interactive Landslide Map          |
|         |                                         |
|         |-----------------------------------------|
|         | Risk Chart | Hotspots | Simulation      |
 --------------------------------------------------

Core Data Flow

Backend sends:

{
	"totalArea": 1250,
	"highRiskArea": 214,
	"criticalHotspots": 18,
	"highestRisk": 0.97
}

Frontend displays cards:

<StatsCard
	title="High Risk Area"
	value="214 km²"
/
>

Risk Map Component (example)
import { MapContainer, TileLayer } from "react-leaflet";

export default function RiskMap() {
	return (
		<MapContainer
			center={[27.8, 85.7]}
			zoom={10}
			style={{ height: "600px" }}
		>
			<TileLayer
				url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
		</MapContainer>
	);
}

Later overlays:

- GeoJSON hotspots
- GeoTIFF susceptibility
- Roads
- Routes

Stats Cards (example layout)
<div className="grid grid-cols-4 gap-4">
	<Card title="Total Area" value="1250 km²" />
	<Card title="High Risk" value="214 km²" />
	<Card title="Hotspots" value="18" />
	<Card title="Max Risk" value="0.97" />
</div>

Hotspot Details Panel

When user clicks hotspot:

{
	"id": 1,
	"lat": 27.851,
	"lon": 85.672,
	"risk": 0.91,
	"area": 3.2,
	"factors": [
		"High Rainfall",
		"Steep Slope",
		"Low Vegetation"
	]
}

Display:

Risk Score: 0.91

Area: 3.2 km²

Coordinates:
27.851, 85.672

Main Factors:
✓ High Rainfall
✓ Steep Slope
✓ Low Vegetation

Simulation Panel

This is where judges will spend time.

const [rainfall, setRainfall] = useState(0);
<input
	type="range"
	min="-50"
	max="100"
	value={rainfall}
	onChange={(e) =>
		setRainfall(Number(e.target.value))
	}
/> 

Button:

<button>
	Run Simulation
</button>

Request:

{
	"rainfall": 30
}

Backend returns:

{
	"oldHighRisk": 214,
	"newHighRisk": 321,
	"change": 50
}

Show:

Before:
214 km²

After:
321 km²

Increase:
+50%

Route Planning Page

Inputs:

Source
Destination

Map displays:

Red Route
Shortest Route

Green Route
Safest Route

Statistics:

Shortest Route:
12.4 km

Safest Route:
15.1 km

Risk Reduced:
62%

Backend API Design
GET /dashboard/stats

GET /hotspots

GET /hotspots/{id}

POST /simulation

POST /route

GET /risk-summary

Example:

@app.get("/hotspots")
def get_hotspots():
		return hotspots

What to Build First for the Hackathon
Priority 1 (Must Have)

✅ Dashboard

✅ Interactive Map

✅ Hotspot Detection

✅ Statistics Cards

✅ Hotspot Details

Priority 2

✅ Simulation Slider

✅ Re-run Prediction

✅ Before/After Comparison

Priority 3

✅ Route Planning

✅ Infrastructure Exposure

Prompt for Copilot/Cursor

Paste this into your coding assistant:

Build a modern React + TypeScript + Tailwind + Leaflet dashboard for GeoShield AI. Create a responsive layout with statistics cards, an interactive landslide susceptibility map, hotspot visualization, hotspot detail panel, simulation controls (rainfall and vegetation sliders), risk distribution charts using Recharts, and API integration with a FastAPI backend. Use modular components, clean architecture, dark mode support, and a professional environmental-disaster-management theme suitable for a hackathon demo. Include mock data first, then structure the code so real GIS and ML outputs can be plugged in later through REST APIs.