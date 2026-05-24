'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface Hotspot {
  id: number;
  name: string;
  coordinates: [number, number];
  risk: number;
  area: number;
  severity: string;
}

interface MapContentProps {
  hotspots: Hotspot[];
  onSelectHotspot: (id: number) => void;
}

export default function MapContent({ hotspots, onSelectHotspot }: MapContentProps) {
  const getRiskColor = (risk: number) => {
    if (risk >= 0.9) return '#E53935';
    if (risk >= 0.7) return '#FB8C00';
    if (risk >= 0.5) return '#FFD54F';
    return '#66BB6A';
  };

  return (
    <MapContainer
      center={[27.85, 85.67]}
      zoom={11}
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '0.75rem',
        zIndex: 0,
      }}
      className="rounded-lg overflow-hidden"
    >
      {/* Satellite tile layer */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="© Esri"
        maxZoom={19}
      />

      {/* Risk hotspots */}
      {hotspots.map((hotspot) => (
        <CircleMarker
          key={hotspot.id}
          center={hotspot.coordinates}
          radius={Math.max(10, hotspot.area * 3)}
          fillColor={getRiskColor(hotspot.risk)}
          color={getRiskColor(hotspot.risk)}
          weight={2}
          opacity={0.8}
          fillOpacity={0.6}
          eventHandlers={{
            click: () => onSelectHotspot(hotspot.id),
          }}
        >
          <Popup>
            <div className="text-sm space-y-2">
              <p className="font-bold">{hotspot.name}</p>
              <p>Risk: {(hotspot.risk * 100).toFixed(0)}%</p>
              <p>Area: {hotspot.area} km²</p>
              <p>Severity: {hotspot.severity}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
