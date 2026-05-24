'use client';

import { useState, useEffect } from 'react';
import { Brain, ChevronUp, ChevronDown, X } from 'lucide-react';

function SummaryBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/analysis/summary')
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => setCount(d.critical_hotspots ?? null))
      .catch(() => setCount(null));
  }, []);

  return (
    <div className="ml-2 text-xs text-slate-200 bg-slate-800/20 px-2 py-1 rounded">
      {count === null ? 'Loading…' : `Critical: ${count}`}
    </div>
  );
}

export default function AIInsightsPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 p-4 rounded-full bg-gradient-blue text-white shadow-2xl hover:scale-110 transition-transform duration-300 group"
        title="Open GeoShield Insight"
      >
        <Brain className="w-6 h-6" />
        <span className="absolute bottom-16 right-0 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          GeoShield Insight
        </span>
      </button>
    );
  }

  const insights = [
    {
      title: 'Critical Alert',
      message:
        'This area shows a high susceptibility score (0.92) due to: heavy rainfall, sparse vegetation, and steep terrain. Risk may increase significantly during monsoon season.',
      icon: '⚠️',
      severity: 'high',
    },
    {
      title: 'Environmental Factor',
      message:
        'Forest cover has decreased by 12% in the past 6 months. Reforestation efforts would reduce landslide risk by approximately 15%.',
      icon: '🌲',
      severity: 'medium',
    },
    {
      title: 'Rainfall Projection',
      message:
        'Upcoming monsoon (in 45 days) is expected to bring 35% above-average precipitation. Pre-positioning resources and issuing early warnings is recommended.',
      icon: '🌧️',
      severity: 'high',
    },
  ];

  return (
    <div
      className={`fixed bottom-8 right-8 transition-all duration-300 ${
        isExpanded ? 'w-96' : 'w-80'
      }`}
    >
      <div className="glass-card shadow-2xl overflow-hidden border border-blue-500/20">
        {/* Header */}
        <div className="bg-gradient-blue p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-white" />
            <span className="font-semibold text-white">GeoShield Insight</span>
            {/* dynamic KPI placeholder */}
            <SummaryBadge />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          <p className="text-xs text-slate-400 italic">
            AI-powered environmental analysis and risk intelligence
          </p>

          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg space-y-2 border-l-4 ${
                insight.severity === 'high'
                  ? 'bg-red-500/10 border-l-red-500'
                  : 'bg-yellow-500/10 border-l-yellow-500'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{insight.icon}</span>
                <p className="font-semibold text-white text-sm">{insight.title}</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{insight.message}</p>
            </div>
          ))}

          {/* Recommendation */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 space-y-2">
            <p className="font-semibold text-emerald-400 text-sm">Recommendation</p>
            <p className="text-xs text-slate-300">
              Implement immediate vegetation restoration in Zone 3. Combined with improved drainage systems, this could reduce
              critical zone risk by 28% within 6 months.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700/50 p-3 flex items-center justify-between bg-slate-900/50">
          <p className="text-xs text-slate-400">Last updated: 2 hours ago</p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-700/50 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
