'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import dynamic from 'next/dynamic';
import { MapPin, Navigation2, Check } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DynamicMap = dynamic(() => import('@/components/map-content'), {
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/50 rounded-xl">
      <p className="text-slate-400">Loading map...</p>
    </div>
  ),
  ssr: false,
});

interface Route {
  id: string;
  name: string;
  distance: number;
  riskScore: number;
  duration: number;
  color: string;
  hotspots: number;
}

export default function RoutePlannerPage() {
  const [fromLocation, setFromLocation] = useState('Kathmandu City Center');
  const [toLocation, setToLocation] = useState('Dhulikhel District');
  const [selectedRoute, setSelectedRoute] = useState<string | null>('safest');

  const routes: Record<string, Route> = {
    shortest: {
      id: 'shortest',
      name: 'Shortest Route',
      distance: 12.4,
      riskScore: 73,
      duration: 28,
      color: '#1565C0',
      hotspots: 3,
    },
    safest: {
      id: 'safest',
      name: 'Safest Route',
      distance: 15.1,
      riskScore: 24,
      duration: 34,
      color: '#2E7D32',
      hotspots: 0,
    },
  };

  const elevationData = [
    { km: 0, elevation: 1400, risk: 25 },
    { km: 3, elevation: 1650, risk: 35 },
    { km: 6, elevation: 1850, risk: 45 },
    { km: 9, elevation: 1700, risk: 60 },
    { km: 12, elevation: 1500, risk: 50 },
    { km: 15, elevation: 1300, risk: 20 },
  ];

  const selectedRouteData = routes[selectedRoute || 'safest'];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="glass-card border-b border-slate-700/50 px-8 py-4 sticky top-0 z-20">
          <h1 className="text-2xl font-bold text-white">Route Planner</h1>
          <p className="text-sm text-slate-400 mt-1">Find the safest and most efficient route through high-risk zones</p>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Panel - Route Selection */}
              <div className="space-y-6">
                {/* Location Input */}
                <div className="glass-card p-6 space-y-4">
                  <h2 className="text-lg font-bold text-white">Trip Details</h2>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">From</label>
                      <input
                        type="text"
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex justify-center py-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Navigation2 className="w-4 h-4 text-emerald-400 rotate-90" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-300">To</label>
                      <input
                        type="text"
                        value={toLocation}
                        onChange={(e) => setToLocation(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button className="w-full px-4 py-2 bg-gradient-green text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
                    Find Routes
                  </button>
                </div>

                {/* Route Options */}
                <div className="glass-card p-6 space-y-4">
                  <h2 className="text-lg font-bold text-white">Recommended Routes</h2>

                  <div className="space-y-2">
                    {Object.values(routes).map((route) => (
                      <button
                        key={route.id}
                        onClick={() => setSelectedRoute(route.id)}
                        className={`w-full p-4 rounded-lg transition-all duration-300 text-left space-y-2 ${
                          selectedRoute === route.id
                            ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
                            : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="font-semibold text-white">{route.name}</p>
                          {selectedRoute === route.id && <Check className="w-5 h-5 text-emerald-400" />}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-slate-500 text-xs">Distance</p>
                            <p className="text-white font-semibold">{route.distance} km</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Duration</p>
                            <p className="text-white font-semibold">{route.duration} min</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Risk Score</p>
                            <p
                              className={`font-semibold ${
                                route.riskScore > 50 ? 'text-orange-400' : 'text-emerald-400'
                              }`}
                            >
                              {route.riskScore}%
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Hotspots</p>
                            <p className="text-white font-semibold">{route.hotspots}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Route Details */}
                {selectedRouteData && (
                  <div className="glass-card p-6 space-y-4">
                    <h2 className="text-lg font-bold text-white">Route Details</h2>

                    <div className="space-y-3">
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">Risk Assessment</p>
                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  selectedRouteData.riskScore > 50
                                    ? 'bg-orange-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${selectedRouteData.riskScore}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-lg font-bold text-white">
                            {selectedRouteData.riskScore}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {['Avalanche', 'Flooding', 'Rockfall'].map((hazard) => (
                          <div key={hazard} className="bg-slate-800/50 p-2 rounded text-center">
                            <p className="text-xs text-slate-400">{hazard}</p>
                            <p className="text-sm font-semibold text-white mt-1">
                              {Math.floor(Math.random() * 40 + 10)}%
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-800/50 p-3 rounded-lg text-sm">
                        <p className="text-slate-400 mb-2">Recommended Actions:</p>
                        <ul className="text-slate-300 space-y-1 text-xs">
                          <li>✓ Avoid travel during heavy rain</li>
                          <li>✓ Check road conditions before departure</li>
                          <li>✓ Carry emergency contact numbers</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Map and Elevation */}
              <div className="lg:col-span-2 space-y-6">
                {/* Map */}
                <div className="glass-card p-2 h-96 map-glow overflow-hidden">
                  <DynamicMap
                    hotspots={[
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
                    ]}
                    onSelectHotspot={() => {}}
                  />
                </div>

                {/* Elevation and Risk Profile */}
                <div className="glass-card p-6 space-y-4">
                  <h2 className="text-lg font-bold text-white">Elevation & Risk Profile</h2>

                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={elevationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                      <XAxis
                        dataKey="km"
                        stroke="#94A3B8"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Distance (km)', position: 'insideBottomRight', offset: -5 }}
                      />
                      <YAxis
                        stroke="#94A3B8"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Risk %', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.9)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '0.5rem',
                        }}
                        labelStyle={{ color: '#E8F5E9' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="risk"
                        stroke="#FB8C00"
                        strokeWidth={2}
                        dot={{ fill: '#FB8C00', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div className="bg-slate-800/50 p-3 rounded">
                      <p className="text-slate-400 text-xs mb-1">Max Elevation</p>
                      <p className="text-white font-bold">1850 m</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded">
                      <p className="text-slate-400 text-xs mb-1">Peak Risk Zone</p>
                      <p className="text-orange-400 font-bold">9 km</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded">
                      <p className="text-slate-400 text-xs mb-1">Safe Zones</p>
                      <p className="text-emerald-400 font-bold">40%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
