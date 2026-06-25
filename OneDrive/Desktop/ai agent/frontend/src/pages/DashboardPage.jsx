import { useEffect, useState } from 'react';
import { getProfile } from '../services/api.js';
import { FileText, Briefcase, Calendar, Target, ChevronRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProfile().catch(err => console.error("Profile Error", err)),
      import('../services/api.js').then(api => api.getAnalyticsMetrics()).catch(err => {
        console.error("Analytics Error", err);
        return null;
      })
    ]).then(([profileData, analyticsData]) => {
      if (profileData) setProfile(profileData);
      if (analyticsData) setAnalytics(analyticsData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Mock Interviews', value: analytics?.total_evaluations || '0', icon: Briefcase, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Avg Interview Score', value: `${analytics?.overall_avg || 0}/10`, icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Questions', value: analytics?.total_questions || '0', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Knowledge Searches', value: analytics?.total_searches || '0', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {profile?.full_name || 'User'}! 👋
          </h1>
          <p className="text-slate-500">
            You're making great progress on your placement preparation. Keep it up!
          </p>
        </div>
        <Link 
          to="/chat" 
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 whitespace-nowrap"
        >
          Start New Practice
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-900">
              <Activity size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold">Recent Activity</h2>
            </div>
            <button className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {analytics?.score_history?.length > 0 ? (
                analytics.score_history.slice().reverse().map((activity, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1"></div>
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Interview: {activity.topic}</h4>
                        <p className="text-sm text-slate-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        {activity.score}/10
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No recent activity yet. Start a mock interview!</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Recommended Next Steps</h2>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-3">
            {[
              { text: 'Improve Resume Keywords', link: '/onboarding' },
              { text: 'Practice System Design', link: '/chat' },
              { text: 'Complete Week 2 Roadmap', link: '/roadmap' }
            ].map((item, i) => (
              <Link 
                key={i}
                to={item.link}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <span className="font-medium text-slate-700 group-hover:text-blue-700">{item.text}</span>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600" />
              </Link>
            ))}
            
            <div className="mt-auto pt-6">
               <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white relative overflow-hidden">
                 <div className="absolute -right-4 -top-4 w-16 h-16 bg-white opacity-10 rounded-full blur-xl"></div>
                 <h4 className="font-bold mb-1 relative z-10">Pro Tip</h4>
                 <p className="text-sm text-blue-100 relative z-10">Use Voice Mode in Chat for a more realistic mock interview experience.</p>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
