import { useState, useEffect } from 'react';
import { listResumes, matchJD, generateCoverLetter } from '../services/api.js';
import { FileText, Building2, Briefcase, ChevronDown, ChevronUp, CheckCircle, AlertTriangle } from 'lucide-react';

export default function JobMatch() {
  const [loading, setLoading] = useState(false);
  const [clLoading, setClLoading] = useState(false);
  const [resumes, setResumes] = useState([]);
  
  const [jdText, setJdText] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  
  const [matchResult, setMatchResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  
  const [error, setError] = useState('');
  const [clError, setClError] = useState('');

  useEffect(() => {
    async function loadResumes() {
      try {
        const resData = await listResumes();
        setResumes(resData);
      } catch (err) {
        console.error("Failed to load resumes", err);
      }
    }
    loadResumes();
  }, []);

  const latestResume = resumes.length > 0 ? resumes[0] : null;

  const handleMatch = async () => {
    if (!jdText.trim()) {
      setError("Please paste a job description first.");
      return;
    }
    if (!latestResume) {
      setError("No resume found. Please upload a resume first.");
      return;
    }
    
    setLoading(true);
    setError('');
    setMatchResult(null);
    setCoverLetter('');
    
    try {
      const data = await matchJD(jdText);
      setMatchResult(data);
    } catch (err) {
      setError(err.message || "Failed to match job description.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!jdText.trim() || !companyName.trim() || !jobTitle.trim()) {
      setClError("Please provide the Job Description, Company Name, and Job Title.");
      return;
    }
    if (!latestResume) {
      setClError("No resume found. Please upload a resume first.");
      return;
    }

    setClLoading(true);
    setClError('');
    setCoverLetter('');

    try {
      const data = await generateCoverLetter(jdText, companyName, jobTitle);
      setCoverLetter(data.cover_letter);
    } catch (err) {
      setClError(err.message || "Failed to generate cover letter.");
    } finally {
      setClLoading(false);
    }
  };

  return (
    <div className="job-match-container animate-fade-in p-8 h-full overflow-y-auto space-y-6">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Briefcase className="text-blue-600" /> Match Job & Generate Cover Letter
        </h1>
        <p className="text-slate-500">Compare your resume against a target job description and automatically generate a tailored cover letter.</p>
      </div>

      {latestResume ? (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
          <CheckCircle size={20} />
          <span>Using your latest resume: <strong>{latestResume.filename}</strong></span>
        </div>
      ) : (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-xl border border-amber-100 flex items-center gap-3">
          <AlertTriangle size={20} />
          <span>No resume found. Please go to the Onboarding or Resume section to upload one.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Details Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Job Details</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Building2 size={16} className="text-slate-400"/> Company Name
              </label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Briefcase size={16} className="text-slate-400"/> Job Title
              </label>
              <input 
                type="text" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <FileText size={16} className="text-slate-400"/> Job Description
            </label>
            <textarea 
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description text..."
              className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all min-h-[250px] resize-y font-mono text-sm text-slate-700"
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
          {clError && <div className="text-red-500 text-sm font-medium">{clError}</div>}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              onClick={handleMatch} 
              disabled={loading || !latestResume}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Analyze Match'}
            </button>
            <button 
              onClick={handleGenerateCoverLetter} 
              disabled={clLoading || !latestResume}
              className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              {clLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Generate Cover Letter'}
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="space-y-6">
          {matchResult && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Match Analysis</h2>
                <div className={`px-4 py-2 rounded-full font-bold text-lg ${matchResult.match_score > 75 ? 'bg-emerald-100 text-emerald-700' : matchResult.match_score > 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  {matchResult.match_score}% Match
                </div>
              </div>
              
              <p className="text-slate-700 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {matchResult.summary}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <h3 className="font-semibold text-emerald-800 flex items-center gap-2 mb-2">
                    <CheckCircle size={16} /> Matched Skills
                  </h3>
                  <ul className="list-disc pl-4 text-emerald-700 text-sm space-y-1">
                    {matchResult.matching_skills?.map((s, i) => <li key={i}>{s}</li>)}
                    {(!matchResult.matching_skills || matchResult.matching_skills.length === 0) && <li>No specific skills matched.</li>}
                  </ul>
                </div>

                <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} /> Missing Skills
                  </h3>
                  <ul className="list-disc pl-4 text-red-700 text-sm space-y-1">
                    {matchResult.missing_skills?.map((s, i) => <li key={i}>{s}</li>)}
                    {(!matchResult.missing_skills || matchResult.missing_skills.length === 0) && <li>No missing skills identified.</li>}
                  </ul>
                </div>
              </div>

              {matchResult.recommendations?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Improvement Tips</h3>
                  <ul className="list-disc pl-4 text-slate-600 text-sm space-y-1">
                    {matchResult.recommendations.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {coverLetter && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-fade-in max-h-[800px]">
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                <h2 className="font-bold flex items-center gap-2"><FileText size={18} /> Generated Cover Letter</h2>
                <button 
                  onClick={() => navigator.clipboard.writeText(coverLetter)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm whitespace-pre-wrap font-serif text-slate-800 leading-relaxed min-h-full">
                  {coverLetter}
                </div>
              </div>
            </div>
          )}
          
          {!matchResult && !coverLetter && !loading && !clLoading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-12 text-center">
              <Briefcase size={48} className="mb-4 opacity-50" />
              <p className="font-medium text-slate-600">No results yet</p>
              <p className="text-sm mt-1">Paste a job description and click analyze or generate to see results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
