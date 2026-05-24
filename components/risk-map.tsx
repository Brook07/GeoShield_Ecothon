'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import Leaflet to avoid SSR issues
const DynamicMap = dynamic(() => import('./map-content'), {
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-700/50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto" />
        <p className="text-slate-400">Loading satellite map...</p>
      </div>
    </div>
  ),
  ssr: false,
});

export default function RiskMap() {
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(null);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('http://localhost:8000/api/analysis/hotspots')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load hotspots');
        return res.json();
      })
      .then((gj) => {
        if (!mounted) return;
        const features = Array.isArray(gj.features) ? gj.features : [];
        const parsed = features.map((f: any, i: number) => {
          const props = f.properties || {};
          const geom = f.geometry || {};
          const coords = Array.isArray(geom.coordinates) ? geom.coordinates : [0, 0];
          const lon = coords[0];
          const lat = coords[1];
          const risk = typeof props.simulated_risk === 'number' ? props.simulated_risk : props.risk;
          return {
            id: props.id ?? i + 1,
            name: props.name ?? props.label ?? `Hotspot #${i + 1}`,
            coordinates: [lat, lon],
            risk: typeof risk === 'number' ? risk : 0,
            area: props.area ?? 1,
            severity: props.severity ?? (risk >= 0.9 ? 'Critical' : risk >= 0.7 ? 'High' : 'Moderate'),
          };
        });
        setHotspots(parsed);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Interactive Risk Map</h2>
        <div className="flex gap-2">
          {['Low', 'Moderate', 'High', 'Critical'].map((level) => {
            const colors: Record<string, string> = {
              Low: 'bg-green-500',
              Moderate: 'bg-yellow-500',
              High: 'bg-orange-500',
              Critical: 'bg-red-500',
            };
            return (
              <div key={level} className="flex items-center gap-2 text-sm text-slate-300">
                <div className={`w-3 h-3 rounded-full ${colors[level]}`} />
                {level}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map */}
        <div className="lg:col-span-3 glass-card p-2 h-96 lg:h-full min-h-96 map-glow">
          <DynamicMap hotspots={hotspots} onSelectHotspot={setSelectedHotspot} />
        </div>

        {/* Hotspots List */}
        <div className="glass-card p-4 space-y-3 overflow-y-auto max-h-96">
          <h3 className="font-bold text-white text-lg">Detected Hotspots</h3>
          <div className="space-y-2">
            {loading && <p className="text-sm text-slate-400">Loading hotspots…</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}
            {!loading && !error && hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                onClick={() => setSelectedHotspot(hotspot.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                  selectedHotspot === hotspot.id
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70'
                }`}
              >
                <p className="font-semibold text-white">{hotspot.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Risk: {(hotspot.risk * 100).toFixed(0)}%
                </p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    hotspot.severity === 'Critical'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {hotspot.severity}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-300">
                    {hotspot.area} km²
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Hotspot Details */}
      {selectedHotspot && (
        <div className="glass-card p-6 space-y-4 animate-in slide-in-from-bottom">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                {hotspots.find((h) => h.id === selectedHotspot)?.name}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Coordinates: {hotspots.find((h) => h.id === selectedHotspot)?.coordinates.join(', ')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk Score */}
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Risk Score</p>
              <p className="text-2xl font-bold text-red-400">
                {(hotspots.find((h) => h.id === selectedHotspot)?.risk || 0 * 100).toFixed(0)}%
              </p>
            </div>

            {/* Area */}
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Area</p>
              <p className="text-2xl font-bold text-blue-400">
                {hotspots.find((h) => h.id === selectedHotspot)?.area} km²
              </p>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Severity</p>
              <p className="text-2xl font-bold text-orange-400">
                {hotspots.find((h) => h.id === selectedHotspot)?.severity}
              </p>
            </div>
          </div>

          {/* Main Causes */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-300">Main Risk Factors</p>
            <div className="flex flex-wrap gap-2">
              {['Heavy Rainfall', 'Steep Terrain', 'Road Cut', 'Low Vegetation'].map((cause) => (
                <span
                  key={cause}
                  className="text-xs px-3 py-2 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50"
                >
                  {cause}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
