import Sidebar from '@/components/sidebar';
import { Brain, TrendingUp, AlertTriangle, Zap } from 'lucide-react';

export default function InsightsPage() {
  const insights = [
    {
      id: 1,
      title: 'Critical Rain Pattern Detected',
      description: 'Heavy rainfall expected in the next 48 hours could trigger 15-20% increase in landslide risk',
      severity: 'critical',
      icon: AlertTriangle,
      timestamp: '2 hours ago',
      confidence: 92,
    },
    {
      id: 2,
      title: 'Vegetation Loss Accelerating',
      description: 'Satellite imagery shows 3.2% monthly vegetation loss in Zone 3. Reforestation is critical.',
      severity: 'high',
      icon: TrendingUp,
      timestamp: '4 hours ago',
      confidence: 88,
    },
    {
      id: 3,
      title: 'Road Construction Impact',
      description: 'New road cuts in Hotspot #2 have increased local risk by 8%. Erosion control measures recommended.',
      severity: 'high',
      icon: AlertTriangle,
      timestamp: '6 hours ago',
      confidence: 85,
    },
    {
      id: 4,
      title: 'Monsoon Preparation Status',
      description: 'Based on current preparations, community resilience is at 72%. Target: 90% before monsoon.',
      severity: 'medium',
      icon: Zap,
      timestamp: '8 hours ago',
      confidence: 79,
    },
    {
      id: 5,
      title: 'Positive: Forest Recovery',
      description: 'Recent reforestation efforts in Zone 1 are showing promising results. 15% vegetation increase.',
      severity: 'positive',
      icon: TrendingUp,
      timestamp: '12 hours ago',
      confidence: 91,
    },
    {
      id: 6,
      title: 'Water Resource Status',
      description: 'Watershed health index improved to 76% due to improved management practices.',
      severity: 'positive',
      icon: Zap,
      timestamp: '1 day ago',
      confidence: 87,
    },
  ];

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-500/5';
      case 'high':
        return 'border-l-orange-500 bg-orange-500/5';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-500/5';
      case 'positive':
        return 'border-l-emerald-500 bg-emerald-500/5';
      default:
        return 'border-l-slate-500 bg-slate-500/5';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'positive':
        return 'text-emerald-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="glass-card border-b border-slate-700/50 px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">AI-Powered Insights</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Real-time environmental intelligence and risk analysis</p>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-8 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 space-y-2">
                <p className="text-sm text-slate-400">Active Alerts</p>
                <p className="text-3xl font-bold text-red-400">3</p>
                <p className="text-xs text-slate-500">Critical or High severity</p>
              </div>
              <div className="glass-card p-4 space-y-2">
                <p className="text-sm text-slate-400">AI Confidence Average</p>
                <p className="text-3xl font-bold text-emerald-400">87%</p>
                <p className="text-xs text-slate-500">Across all insights</p>
              </div>
              <div className="glass-card p-4 space-y-2">
                <p className="text-sm text-slate-400">Areas Under Watch</p>
                <p className="text-3xl font-bold text-orange-400">8</p>
                <p className="text-xs text-slate-500">Zones with elevated risk</p>
              </div>
              <div className="glass-card p-4 space-y-2">
                <p className="text-sm text-slate-400">Latest Update</p>
                <p className="text-3xl font-bold text-blue-400">2h</p>
                <p className="text-xs text-slate-500">Real-time satellite data</p>
              </div>
            </div>

            {/* Insights List */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Intelligence Reports</h2>
              <div className="space-y-3">
                {insights.map((insight) => {
                  const Icon = insight.icon;
                  return (
                    <div
                      key={insight.id}
                      className={`glass-card border-l-4 p-6 space-y-3 hover:bg-opacity-80 transition-all ${getSeverityStyles(insight.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`p-3 rounded-lg bg-slate-800/50 ${getSeverityColor(insight.severity)}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h3 className="font-bold text-white text-lg">{insight.title}</h3>
                            <p className="text-slate-300 text-sm">{insight.description}</p>
                            <p className="text-xs text-slate-500 mt-2">{insight.timestamp}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-xs text-slate-400">Confidence</span>
                            <span className={`text-sm font-bold ${getSeverityColor(insight.severity)}`}>
                              {insight.confidence}%
                            </span>
                          </div>
                          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${
                                insight.severity === 'critical'
                                  ? 'from-red-500 to-orange-500'
                                  : insight.severity === 'high'
                                    ? 'from-orange-500 to-yellow-500'
                                    : insight.severity === 'positive'
                                      ? 'from-emerald-500 to-green-500'
                                      : 'from-slate-500 to-slate-600'
                              }`}
                              style={{ width: `${insight.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <section className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">System Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-emerald-400">Immediate Actions</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>✓ Issue Level 2 Alert for Zone 3</li>
                    <li>✓ Pre-position emergency resources</li>
                    <li>✓ Brief community leaders on monsoon prep</li>
                  </ul>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-blue-400">Strategic Initiatives</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>✓ Scale reforestation to 500K trees</li>
                    <li>✓ Improve drainage in critical zones</li>
                    <li>✓ Enhance community resilience training</li>
                  </ul>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
