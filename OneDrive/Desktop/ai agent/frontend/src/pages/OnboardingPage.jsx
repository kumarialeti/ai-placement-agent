import { useState, useRef } from 'react';
import { uploadResume, updateProfile } from '../services/api';

function OnboardingPage({ onComplete }) {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('fresher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    window.location.href = '/auth';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload your resume PDF to continue.');
      return;
    }
    if (!targetRole.trim()) {
      setError('Please enter your target job role.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await uploadResume(file);
      await updateProfile(targetRole, experienceLevel);
      
      onComplete({
        resumeId: response.id,
        targetRole,
        experienceLevel,
        isSetup: true
      });
    } catch (err) {
      setError(err.message || 'Failed to upload and analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 min-h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-lg">

        {/* Header with prominent Sign Out */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-slate-400">Setup your profile</span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4 text-3xl">
            🚀
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Aboard!</h1>
          <p className="text-slate-500">Let's set up your profile for personalized interview prep.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm font-medium mb-1">⚠️ Upload Failed</p>
            <p className="text-red-600 text-sm">{error}</p>
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-xs text-red-500 mb-2">If the problem persists, try signing out and logging in again.</p>
              <button
                onClick={handleSignOut}
                className="text-xs font-semibold text-red-600 hover:text-red-800 underline"
              >
                Sign out and go to Login →
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 pl-1">Upload Resume (PDF)</label>
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileClick}
            >
              <div className="text-4xl mb-3 text-slate-400">📄</div>
              {file ? (
                <div>
                  <p className="font-semibold text-blue-600">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Click or drag to replace</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-slate-700">Click to browse or drag PDF here</p>
                  <p className="text-xs text-slate-500 mt-2">Maximum file size: 5MB</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept=".pdf" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 pl-1">Target Job Role</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900" 
              placeholder="e.g., AI Engineer, Frontend Developer" 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 pl-1">Experience Level</label>
            <select 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900" 
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              <option value="fresher">Fresher (0 years)</option>
              <option value="junior">Junior (1-3 years)</option>
              <option value="mid">Mid-Level (3-5 years)</option>
              <option value="senior">Senior (5+ years)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Resume...</span>
              </>
            ) : (
              <span>Analyze Resume & Setup Profile</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingPage;
