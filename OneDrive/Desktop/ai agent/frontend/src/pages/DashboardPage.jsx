import { useEffect, useState } from 'react';
import { getProfile, getAnalyticsMetrics } from '../services/api.js';
import { FileText, Briefcase, Target, MessageSquare, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Skeleton card ──
function StatSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="h-8 w-16 bg-slate-100 rounded" />
        </div>
        <div className="w-12 h-12 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function DashboardPage({ userProfile }) {
  const [profile, setProfile]   = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [profileData, analyticsData] = await Promise.all([
          getProfile().catch(() => null),
          getAnalyticsMetrics().catch(() => null),
        ]);
        if (cancelled) return;
        if (profileData) setProfile(profileData);
        if (analyticsData) setAnalytics(analyticsData);
      } catch {
        if (!cancelled) setError('Failed to load dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const stats = [
    {
      label: 'Mock Interviews',
      value: analytics?.total_evaluations ?? '—',
      icon: Briefcase,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Avg Interview Score',
      value: analytics ? `${analytics.overall_avg ?? 0}/10` : '—',
      icon: Target,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Questions Answered',
      value: analytics?.total_questions ?? '—',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'AI Chats',
      value: analytics?.total_searches ?? '—',
      icon: MessageSquare,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  const nextSteps = [
    { text: 'Practice System Design', link: '/chat', desc: 'Ask the AI prep agent' },
    { text: 'Run a Mock Interview', link: '/interview', desc: 'Adaptive questioning' },
    { text: 'Generate Study Roadmap', link: '/roadmap', desc: 'Personalized plan' },
  ];

  const displayName = profile?.full_name || userProfile?.targetRole || 'there';

  return (
    <div className="space-y-6 animate-fade-in pb-8">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {userProfile?.targetRole
              ? `Preparing for ${userProfile.targetRole} · ${userProfile.experienceLevel} level`
              : 'Start practicing to track your progress.'}
          </p>
        </div>
        <Link
          to="/chat"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          Start Practice →
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                    </div>
                    <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <Activity size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Recent Interviews</h2>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="h-3 w-36 bg-slate-100 rounded" />
                      <div className="h-2.5 w-24 bg-slate-100 rounded" />
                    </div>
                    <div className="h-6 w-14 bg-slate-100 rounded-full" />
                  </div>
                ))}
              </div>
            ) : analytics?.score_history?.length > 0 ? (
              <div className="space-y-4">
                {analytics.score_history
                  .slice()
                  .reverse()
                  .slice(0, 6)
                  .map((activity, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            Interview: {activity.topic}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${activity.score >= 7
                          ? 'bg-emerald-100 text-emerald-700'
                          : activity.score >= 5
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                        }
                      `}>
                        {activity.score}/10
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <TrendingUp size={36} className="text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-600 mb-1">No interviews yet</p>
                <p className="text-xs text-slate-400 mb-4">
                  Complete your first mock interview to see your progress here.
                </p>
                <Link
                  to="/interview"
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  Start a Mock Interview →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Recommended Next Steps</h2>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-2">
            {nextSteps.map((item, i) => (
              <Link
                key={i}
                to={item.link}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 block">
                    {item.text}
                  </span>
                  <span className="text-xs text-slate-400">{item.desc}</span>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 shrink-0" />
              </Link>
            ))}

            <div className="mt-auto pt-4">
              <div className="p-4 rounded-xl bg-blue-600 text-white">
                <h4 className="font-bold text-sm mb-1">Pro Tip</h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Use the AI Prep Agent chat for realistic mock interviews — it knows your resume.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
