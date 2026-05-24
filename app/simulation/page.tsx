'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import RiskSlider from '@/components/risk-slider';
import dynamic from 'next/dynamic';
import { RotateCcw } from 'lucide-react';

const DynamicMap = dynamic(() => import('@/components/map-content'), {
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto" />
        <p className="text-slate-400 mt-2">Loading simulation map...</p>
      </div>
    </div>
  ),
  ssr: false,
});

interface SimulationState {
  rainfall: number;
  vegetation: number;
  roadExpansion: number;
  riverErosion: number;
}

export default function SimulationPage() {
  const [simulation, setSimulation] = useState<SimulationState>({
    rainfall: 0,
    vegetation: 0,
    roadExpansion: 0,
    riverErosion: 0,
  });

  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(null);

  // Calculate risk multiplier based on simulation changes
  const riskMultiplier =
    1 +
    (simulation.rainfall * 0.5) / 100 +
    (simulation.roadExpansion * 0.4) / 100 -
    (simulation.vegetation * 0.3) / 100 +
    (simulation.riverErosion * 0.35) / 100;

  const baselineHotspots = [
    {
      id: 1,
      name: 'Hotspot #1',
      coordinates: [27.851, 85.672],
      risk: 0.92,
      area: 2.8,
      severity: 'Critical',
    },
    {
      id: 2,
      name: 'Hotspot #2',
      coordinates: [27.775, 85.34],
      risk: 0.78,
      area: 1.5,
      severity: 'High',
    },
    {
      id: 3,
      name: 'Hotspot #3',
      coordinates: [27.92, 85.89],
      risk: 0.91,
      area: 3.2,
      severity: 'Critical',
    },
  ];
  const [simulatedHotspots, setSimulatedHotspots] = useState<any[]>(
    baselineHotspots.map((h) => ({ ...h, risk: Math.min(1, h.risk * riskMultiplier), area: h.area * riskMultiplier }))
  );
  const [running, setRunning] = useState(false);

  const runSimulation = async () => {
    setRunning(true);
    try {
      const res = await fetch('http://localhost:8000/api/analysis/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulation),
      });
      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();
      const features = Array.isArray(data.features) ? data.features : [];
      const parsed = features.map((f: any, i: number) => {
        const props = f.properties || {};
        const geom = f.geometry || {};
        const coords = Array.isArray(geom.coordinates) ? geom.coordinates : [85.67, 27.85];
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
      setSimulatedHotspots(parsed);
    } catch (err) {
      // keep client-side fallback
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const resetSimulation = () => {
    setSimulation({
      rainfall: 0,
      vegetation: 0,
      roadExpansion: 0,
      riverErosion: 0,
    });
  };

  const getTotalRiskArea = (hotspots: typeof baselineHotspots) => {
    return hotspots.reduce((sum, h) => sum + h.area, 0).toFixed(1);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="glass-card border-b border-slate-700/50 px-8 py-4 sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-white">What-If Simulation</h1>
            <p className="text-sm text-slate-400 mt-1">Adjust environmental factors to see impact on risk</p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Panel - Controls */}
              <div className="space-y-6">
                <div className="glass-card p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Simulation Parameters</h2>
                    <button
                      onClick={resetSimulation}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-sm text-slate-300"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  </div>

                  {/* Rainfall */}
                  <RiskSlider
                    label="Rainfall Increase"
                    value={simulation.rainfall}
                    onChange={(v) => setSimulation({ ...simulation, rainfall: v })}
                    max={100}
                    unit="%"
                    description="Increase in precipitation levels"
                  />

                  {/* Vegetation Loss */}
                  <RiskSlider
                    label="Vegetation Loss"
                    value={simulation.vegetation}
                    onChange={(v) => setSimulation({ ...simulation, vegetation: v })}
                    max={100}
                    unit="%"
                    description="Decrease in forest cover"
                  />

                  {/* Road Expansion */}
                  <RiskSlider
                    label="Road Expansion"
                    value={simulation.roadExpansion}
                    onChange={(v) => setSimulation({ ...simulation, roadExpansion: v })}
                    max={100}
                    unit="%"
                    description="New road cutting and land disruption"
                  />

                  {/* River Erosion */}
                  <RiskSlider
                    label="River Erosion"
                    value={simulation.riverErosion}
                    onChange={(v) => setSimulation({ ...simulation, riverErosion: v })}
                    max={100}
                    unit="%"
                    description="Increased waterway erosion"
                  />
                </div>

                {/* Risk Impact Summary */}
                <div className="glass-card p-6 space-y-4">
                  <h2 className="text-xl font-bold text-white">Impact Summary</h2>
                  <p className="text-sm text-slate-400">
                    Risk Multiplier: <span className="text-emerald-400 font-bold">{riskMultiplier.toFixed(2)}x</span>
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg space-y-1">
                      <p className="text-xs text-slate-400">Baseline Risk Area</p>
                      <p className="text-2xl font-bold text-slate-300">
                        {getTotalRiskArea(baselineHotspots)}
                      </p>
                      <p className="text-xs text-slate-500">km²</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg space-y-1">
                      <p className="text-xs text-slate-400">Simulated Risk Area</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {getTotalRiskArea(simulatedHotspots)}
                      </p>
                      <p className="text-xs text-slate-500">km²</p>
                    </div>
                  </div>

                  {/* Change percentage */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-slate-300">
                      <span className="text-red-400 font-bold text-lg">
                        +{((riskMultiplier - 1) * 100).toFixed(1)}%
                      </span>{' '}
                      increase in high-risk zones
                    </p>
                    <p className="text-xs text-slate-500">
                      This represents the environmental impact of current parameter changes
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Panel - Map */}
              <div className="space-y-6">
                <div className="glass-card p-2 h-96 map-glow overflow-hidden">
                  <DynamicMap hotspots={simulatedHotspots} onSelectHotspot={setSelectedHotspot} />
                </div>

                {/* Comparison Cards */}
                <div className="glass-card p-6 space-y-4">
                  <h2 className="text-lg font-bold text-white">Before vs After</h2>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-semibold text-slate-300">Baseline Scenario</p>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="text-slate-400">Risk Area:</span>
                          <span className="text-white font-bold ml-2">{getTotalRiskArea(baselineHotspots)} km²</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-slate-400">Hotspots:</span>
                          <span className="text-white font-bold ml-2">{baselineHotspots.length}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-slate-400">Avg Risk:</span>
                          <span className="text-emerald-400 font-bold ml-2">
                            {((baselineHotspots.reduce((sum, h) => sum + h.risk, 0) / baselineHotspots.length) * 100).toFixed(0)}%
                          </span>
                        </p>
                          {/* Simulation controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={runSimulation}
                              disabled={running}
                              className="px-4 py-2 rounded-lg bg-gradient-green text-white font-semibold hover:opacity-90 transition-opacity"
                            >
                              {running ? 'Running…' : 'Run Simulation'}
                            </button>
                            <button
                              onClick={resetSimulation}
                              className="px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-sm text-slate-300"
                            >
                              Reset
                            </button>
                            <div className="text-sm text-slate-400">Risk Multiplier: <span className="text-emerald-400 font-bold">{riskMultiplier.toFixed(2)}x</span></div>
                          </div>

                          {/* Change percentage */}
                    </div>

                              <span className="text-red-400 font-bold text-lg">
                                +{((riskMultiplier - 1) * 100).toFixed(1)}%
                              </span>{' '}
                              increase in high-risk zones
                        <p className="text-sm">
                          <span className="text-slate-400">Risk Area:</span>
                          <span className="text-orange-400 font-bold ml-2">{getTotalRiskArea(simulatedHotspots)} km²</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-slate-400">Hotspots:</span>
                          <span className="text-white font-bold ml-2">{simulatedHotspots.length}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-slate-400">Avg Risk:</span>
                          <span className="text-red-400 font-bold ml-2">
                            {((simulatedHotspots.reduce((sum, h) => sum + h.risk, 0) / simulatedHotspots.length) * 100).toFixed(0)}%
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insights */}
                {riskMultiplier > 1 && (
                  <div className="glass-card p-4 border-l-4 border-orange-500 space-y-2 bg-orange-500/5">
                    <p className="text-sm font-semibold text-orange-400">Simulation Insight</p>
                    <p className="text-xs text-slate-400">
                      A {simulation.rainfall}% increase in rainfall combined with {simulation.roadExpansion}% road expansion results
                      in a {((riskMultiplier - 1) * 100).toFixed(1)}% increase in landslide susceptibility. Consider mitigation
                      strategies such as increased vegetation coverage or erosion control measures.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
