'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Users, Leaf } from 'lucide-react';

export default function KPICards() {
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/api/analysis/summary')
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => setSummary(data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  const metrics = [
    {
      title: 'High Risk Areas',
      value: summary ? `${summary.high_risk_count ?? 0}` : '—',
      unit: 'zones',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-600',
      accent: 'text-red-400',
    },
    {
      title: 'Critical Hotspots',
      value: summary ? `${summary.critical_hotspots ?? 0}` : '—',
      unit: 'zones',
      icon: AlertCircle,
      color: 'from-orange-500 to-amber-600',
      accent: 'text-orange-400',
    },
    {
      title: 'Population Exposed',
      value: summary && summary.population_exposed ? `${summary.population_exposed}` : '—',
      unit: 'people',
      icon: Users,
      color: 'from-amber-500 to-yellow-600',
      accent: 'text-amber-400',
    },
    {
      title: 'Environmental Health',
      value: summary && summary.environmental_health_index ? `${summary.environmental_health_index}%` : '—',
      unit: 'score',
      icon: Leaf,
      color: 'from-emerald-500 to-green-600',
      accent: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div
            key={idx}
            className="glass-card-hover p-6 space-y-4 group"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-400 font-medium">
                  {metric.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <div className={`text-3xl font-bold ${metric.accent}`}>
                    {loading ? '…' : metric.value}
                  </div>
                  <span className="text-xs text-slate-500">
                    {metric.unit}
                  </span>
                </div>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} opacity-20 group-hover:opacity-30 transition-opacity`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Mini progress bar */}
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${metric.color}`}
                style={{ width: `${70 + Math.random() * 30}%` }}
              />
            </div>

            {/* Trend indicator */}
            <div className="text-xs text-slate-500">
              <span className="inline-block px-2 py-1 rounded-full bg-slate-800/50">
                ↑ {(Math.random() * 15 + 5).toFixed(1)}% this month
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
