import { useState } from 'react';
import { generateRoadmap, getProgress } from '../services/api.js';
import { Target, CheckCircle, Zap, RefreshCw, MapPin } from 'lucide-react';

// ── Skeleton row ──
function RoadmapSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="h-4 w-40 bg-slate-200 rounded" />
      </div>
      <ul className="divide-y divide-slate-100">
        {[1, 2, 3].map(i => (
          <li key={i} className="p-4 flex items-center gap-3">
            <div className="w-4 h-4 bg-slate-200 rounded-full shrink-0" />
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RoadmapPage({ userProfile }) {
  const [loading, setLoading]     = useState(false);
  const [roadmap, setRoadmap]     = useState(null);
  const [error, setError]         = useState('');
  const [targetRole, setTargetRole] = useState(
    userProfile?.targetRole || 'Software Engineer'
  );
  const [weeks, setWeeks]         = useState(4);
  const [weakAreas, setWeakAreas] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const fetchRoadmap = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Optionally enrich weak areas from progress API
      let resolvedWeakAreas = weakAreas
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (resolvedWeakAreas.length === 0) {
        try {
          const progress = await getProgress();
          if (progress?.report?.weak_areas?.length > 0) {
            resolvedWeakAreas = progress.report.weak_areas;
          }
        } catch {
          // progress API failure is non-fatal
        }
      }

      const data = await generateRoadmap(targetRole, weeks, resolvedWeakAreas);
      setRoadmap(data.roadmap);
      setHasGenerated(true);
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Target size={22} className="text-blue-600" /> Study Roadmap
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          AI-generated personalized study plan based on your role and weak areas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Settings Panel */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-amber-500" /> Customize Plan
          </h2>
          <form onSubmit={fetchRoadmap} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Duration
              </label>
              <select
                value={weeks}
                onChange={e => setWeeks(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-900"
              >
                <option value={2}>2 Weeks — Crash Course</option>
                <option value={4}>4 Weeks — Standard</option>
                <option value={8}>8 Weeks — Comprehensive</option>
                <option value={12}>12 Weeks — Deep Dive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Focus Areas
                <span className="text-slate-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text"
                value={weakAreas}
                onChange={e => setWeakAreas(e.target.value)}
                placeholder="e.g. React, SQL, Algorithms"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-900"
              />
              <p className="text-xs text-slate-400 mt-1">Leave blank to auto-detect from your history.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {hasGenerated
                    ? <><RefreshCw size={16} /> Regenerate</>
                    : <><Zap size={16} /> Generate Roadmap</>
                  }
                </>
              )}
            </button>
          </form>
        </div>

        {/* Roadmap Display */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <>
              <RoadmapSkeleton />
              <RoadmapSkeleton />
              <RoadmapSkeleton />
            </>
          ) : roadmap?.weeks?.length > 0 ? (
            roadmap.weeks.map((week, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in"
              >
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                    W{week.week_number}
                  </span>
                  <h3 className="font-semibold text-slate-900">{week.focus_area}</h3>
                </div>
                <ul className="divide-y divide-slate-100">
                  {week.topics.map((topic, idx) => (
                    <li key={idx} className="px-5 py-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3">
                      <CheckCircle size={16} className="text-slate-300 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-700">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                <MapPin size={32} className="text-blue-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No roadmap yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Fill in your target role and click "Generate Roadmap" to get a personalized week-by-week study plan.
              </p>
              <p className="text-xs text-slate-400">
                The AI will automatically detect your weak areas from your interview history.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
