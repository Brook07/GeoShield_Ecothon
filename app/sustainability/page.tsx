'use client';

import Sidebar from '@/components/sidebar';
import AIInsightsPanel from '@/components/ai-insights-panel';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Leaf, Droplets, Wind, Zap } from 'lucide-react';

export default function SustainabilityPage() {
  const forestCoverData = [
    { month: 'Jan', cover: 85 },
    { month: 'Feb', cover: 84.5 },
    { month: 'Mar', cover: 84 },
    { month: 'Apr', cover: 83.2 },
    { month: 'May', cover: 82.5 },
    { month: 'Jun', cover: 81.8 },
    { month: 'Jul', cover: 79.2 },
    { month: 'Aug', cover: 78 },
  ];

  const impactData = [
    { name: 'Forest Conservation', value: 35 },
    { name: 'Watershed Management', value: 28 },
    { name: 'Community Programs', value: 22 },
    { name: 'Infrastructure', value: 15 },
  ];

  const climateRiskData = [
    { metric: 'Temperature Rise', current: 1.2, target: 0.8 },
    { metric: 'CO2 Emissions', current: 450, target: 300 },
    { metric: 'Rainfall Variability', current: 28, target: 15 },
    { metric: 'Soil Degradation', current: 42, target: 20 },
  ];

  const sdgAlignment = [
    { icon: '🌍', title: 'Climate Action', description: 'Reduce climate-related disasters' },
    { icon: '💚', title: 'Life on Land', description: 'Protect and restore ecosystems' },
    { icon: '💧', title: 'Clean Water', description: 'Improve watershed health' },
    { icon: '🏘️', title: 'Sustainable Communities', description: 'Build resilience' },
  ];

  const metrics = [
    {
      title: 'Forest Cover',
      value: '78%',
      target: '85%',
      icon: Leaf,
      color: 'from-emerald-500 to-green-600',
    },
    {
      title: 'Water Quality Index',
      value: '72',
      target: '85',
      icon: Droplets,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Carbon Offset',
      value: '125K',
      target: '200K',
      icon: Wind,
      color: 'from-slate-500 to-slate-600',
      unit: 'tons',
    },
    {
      title: 'Community Health',
      value: '82%',
      target: '95%',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="glass-card border-b border-slate-700/50 px-8 py-4 sticky top-0 z-20">
          <h1 className="text-2xl font-bold text-white">Sustainability Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Environment monitoring linked to ECOTHON 2026 theme: Nature&apos;s Code for a Greener Tomorrow
          </p>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-8 space-y-8">
            {/* Key Metrics */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Environmental Health Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, idx) => {
                  const Icon = metric.icon;
                  const progress = (parseInt(metric.value) / parseInt(metric.target)) * 100;
                  return (
                    <div key={idx} className="glass-card-hover p-6 space-y-4 group">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-slate-400 font-medium">{metric.title}</p>
                          <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold text-emerald-400">{metric.value}</div>
                            <span className="text-xs text-slate-500">
                              / {metric.target}
                              {metric.unit ? ` ${metric.unit}` : ''}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} opacity-20 group-hover:opacity-30 transition-opacity`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${metric.color}`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>

                      <p className="text-xs text-slate-500">
                        {Math.round(progress)}% of target achieved
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Charts and Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Forest Cover Trend */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Forest Cover Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={forestCoverData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey="month" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
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
                      dataKey="cover"
                      stroke="#2E7D32"
                      strokeWidth={3}
                      dot={{ fill: '#2E7D32', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-xs text-slate-400">
                  Forest cover has declined 6% in 8 months. Urgent reforestation needed.
                </p>
              </div>

              {/* Climate Risk Metrics */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Climate Risk vs Targets</h3>
                <div className="space-y-3">
                  {climateRiskData.map((item) => (
                    <div key={item.metric} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{item.metric}</span>
                        <span className="text-white font-semibold">{item.current}</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{ width: `${Math.min((item.current / (item.target * 1.5)) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="w-20 text-xs text-emerald-400 text-right">
                          Target: {item.target}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Impact Allocation and SDG Alignment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Impact Allocation */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Sustainability Investment Allocation</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={impactData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {impactData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={['#2E7D32', '#1565C0', '#FFD54F', '#E53935'][idx]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '0.5rem',
                      }}
                      labelStyle={{ color: '#E8F5E9' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {impactData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#2E7D32', '#1565C0', '#FFD54F', '#E53935'][impactData.indexOf(item)] }} />
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SDG Alignment */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">UN Sustainable Development Goals Alignment</h3>
                <div className="grid grid-cols-2 gap-4">
                  {sdgAlignment.map((sdg) => (
                    <div
                      key={sdg.title}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-2 hover:border-emerald-500/30 transition-colors"
                    >
                      <p className="text-2xl">{sdg.icon}</p>
                      <p className="font-semibold text-white text-sm">{sdg.title}</p>
                      <p className="text-xs text-slate-400">{sdg.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Insights and Recommendations */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Findings */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Key Findings</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-orange-400">⚠️</span>
                    <span>Forest cover declining at 0.75% per month</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-400">⚠️</span>
                    <span>Climate risk increased by 15% year-over-year</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Water quality improved by 8% through new protocols</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Community programs reaching 15,000+ people</span>
                  </li>
                </ul>
              </div>

              {/* Strategic Initiatives */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Active Initiatives</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                    <p className="font-semibold text-emerald-400">Reforestation Project</p>
                    <p className="text-xs text-slate-400 mt-1">500K saplings planted in 2026</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                    <p className="font-semibold text-blue-400">Watershed Protection</p>
                    <p className="text-xs text-slate-400 mt-1">3 major basins under management</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                    <p className="font-semibold text-yellow-400">Community Education</p>
                    <p className="text-xs text-slate-400 mt-1">12 schools engaged in climate literacy</p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Recommended Actions</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex gap-2">
                    <span className="text-emerald-400 font-bold">1.</span>
                    <span>Accelerate reforestation in Zone 3 (target: 100K saplings by Q4)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400 font-bold">2.</span>
                    <span>Strengthen drainage systems before monsoon season</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400 font-bold">3.</span>
                    <span>Launch community conservation incentive program</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400 font-bold">4.</span>
                    <span>Integrate climate adaptation into all development projects</span>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* AI Insights Floating Panel */}
      <AIInsightsPanel />
    </div>
  );
}
