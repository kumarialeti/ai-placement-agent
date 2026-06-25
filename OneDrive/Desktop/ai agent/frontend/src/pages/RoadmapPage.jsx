import { useState, useEffect } from 'react';
import { generateRoadmap, getProgress } from '../services/api.js';
import { Target, List, CheckCircle, ChevronRight, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [weeks, setWeeks] = useState(4);
  const [weakAreas, setWeakAreas] = useState('System Design, Dynamic Programming');

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      // First try to fetch progress
      const progress = await getProgress();
      if (progress?.report?.weak_areas?.length > 0) {
        setWeakAreas(progress.report.weak_areas.join(', '));
      }
      
      const weakAreasList = weakAreas.split(',').map(s => s.trim()).filter(Boolean);
      const data = await generateRoadmap(targetRole, weeks, weakAreasList);
      setRoadmap(data.roadmap);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleGenerate = (e) => {
    e.preventDefault();
    fetchRoadmap();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Generating your personalized roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Target className="text-blue-600" /> Study Roadmap
          </h1>
          <p className="text-slate-500">
            A personalized AI-generated study plan based on your target role and weak areas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" /> Customize Plan
          </h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
              <input 
                type="text" 
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Weeks)</label>
              <select 
                value={weeks}
                onChange={(e) => setWeeks(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              >
                <option value={2}>2 Weeks (Crash Course)</option>
                <option value={4}>4 Weeks (Standard)</option>
                <option value={8}>8 Weeks (Comprehensive)</option>
                <option value={12}>12 Weeks (Deep Dive)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Focus Areas (comma separated)</label>
              <input 
                type="text" 
                value={weakAreas}
                onChange={(e) => setWeakAreas(e.target.value)}
                placeholder="e.g. React, SQL, Algorithms"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Regenerate Roadmap
            </button>
          </form>
        </div>

        {/* Roadmap Display */}
        <div className="lg:col-span-2 space-y-4">
          {roadmap && roadmap.weeks ? (
            roadmap.weeks.map((week, index) => (
              <div key={index} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                      W{week.week_number}
                    </span>
                    {week.focus_area}
                  </h3>
                </div>
                <div className="p-0">
                  <ul className="divide-y divide-slate-100">
                    {week.topics.map((topic, idx) => (
                      <li key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-3">
                        <CheckCircle className="text-slate-300 mt-0.5 shrink-0" size={18} />
                        <div>
                          <p className="font-medium text-slate-700">{topic}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
              No roadmap generated yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
