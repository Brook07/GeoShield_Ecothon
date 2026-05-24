import Sidebar from '@/components/sidebar';
import KPICards from '@/components/kpi-cards';
import RiskMap from '@/components/risk-map';
import AIInsightsPanel from '@/components/ai-insights-panel';
import { Search, Bell, User } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="glass-card border-b border-slate-700/50 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Real-time landslide risk assessment</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search locations..."
                className="bg-transparent outline-none text-sm text-white placeholder-slate-500 w-48"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* User Profile */}
            <button className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
              <User className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-8 space-y-8">
            {/* KPI Cards */}
            <section>
              <h2 className="text-xl font-bold text-white mb-4">Key Risk Indicators</h2>
              <KPICards />
            </section>

            {/* Interactive Map */}
            <section>
              <RiskMap />
            </section>

            {/* Additional Metrics */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Distribution */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-white text-lg">Risk Distribution</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Very Low', value: 12, color: '#2E7D32' },
                    { label: 'Low', value: 28, color: '#66BB6A' },
                    { label: 'Moderate', value: 35, color: '#FFD54F' },
                    { label: 'High', value: 18, color: '#FB8C00' },
                    { label: 'Very High', value: 7, color: '#E53935' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-white font-semibold">{item.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${item.value}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monitoring Status */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-white text-lg">System Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Satellite Data', status: 'Active', color: 'text-emerald-400' },
                    { label: 'Weather Monitoring', status: 'Active', color: 'text-emerald-400' },
                    { label: 'Population Tracking', status: 'Active', color: 'text-emerald-400' },
                    { label: 'Alert System', status: 'Armed', color: 'text-yellow-400' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">{item.label}</span>
                      <span className={`text-sm font-semibold ${item.color}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="font-bold text-white text-lg">Recent Alerts</h3>
                <div className="space-y-2">
                  {[
                    { time: '2 hours ago', message: 'Heavy rainfall detected in Zone 3', severity: 'high' },
                    { time: '5 hours ago', message: 'Soil saturation increased in Zone 1', severity: 'medium' },
                    { time: '1 day ago', message: 'New vegetation loss detected', severity: 'medium' },
                  ].map((alert, idx) => (
                    <div key={idx} className="text-xs space-y-1 pb-2 border-b border-slate-700/50 last:border-0">
                      <p className="text-slate-400">{alert.time}</p>
                      <p className="text-slate-300">{alert.message}</p>
                    </div>
                  ))}
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
