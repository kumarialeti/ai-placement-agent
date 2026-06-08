import { useState, useEffect } from 'react';
import { listResumes, matchJD } from '../services/api.js';

export default function JobMatch() {
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [jdText, setJdText] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState('');

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
    
    try {
      const data = await matchJD(jdText);
      setMatchResult(data);
    } catch (err) {
      setError(err.message || "Failed to match job description.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-match-container" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <h1>💼 Match Job Description</h1>
      <p style={{ color: 'var(--text-muted)' }}>Compare your uploaded resume against a target job description.</p>

      {latestResume ? (
        <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', marginBottom: '2rem' }}>
          <span style={{ color: 'var(--success)', marginRight: '0.5rem' }}>✓</span>
          Using your latest resume: <strong>{latestResume.filename}</strong>
        </div>
      ) : (
        <div style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          ⚠️ No resume found. Please go to the Onboarding or Resume section to upload one.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <label style={{ fontWeight: 'bold' }}>Paste Job Description here:</label>
        <textarea 
          style={{ 
            width: '100%', 
            minHeight: '200px', 
            padding: '1rem', 
            background: 'var(--bg-color)', 
            color: 'var(--text-color)', 
            border: '1px solid var(--border)', 
            borderRadius: '0.5rem',
            resize: 'vertical'
          }}
          placeholder="Paste the full job description text..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />
        
        {error && <div style={{ color: 'red' }}>{error}</div>}
        
        <button 
          className="btn-primary" 
          onClick={handleMatch} 
          disabled={loading || !latestResume}
          style={{ alignSelf: 'flex-start', padding: '0.75rem 2rem' }}
        >
          {loading ? 'Analyzing Match...' : 'Match Resume'}
        </button>
      </div>

      {loading && (
        <div className="loading-spinner" style={{ margin: '2rem auto' }} />
      )}

      {matchResult && (
        <div className="match-results fade-in">
          <h2>Match Results</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '1rem' }}>
            
            <div className="card" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'center' }}>
              <h3>Match Score</h3>
              <div style={{ fontSize: '4rem', fontWeight: 'bold', color: matchResult.match_score > 75 ? 'var(--success)' : matchResult.match_score > 50 ? 'var(--warning)' : 'red', margin: '1rem 0' }}>
                {matchResult.match_score}%
              </div>
            </div>

            <div className="card" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <p><strong>Summary:</strong> {matchResult.summary}</p>
            </div>
            
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
            <div className="card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--success)' }}>Matched Skills</h3>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', lineHeight: '1.6' }}>
                {matchResult.matched_skills?.map((s, i) => <li key={i}>{s}</li>)}
                {(!matchResult.matched_skills || matchResult.matched_skills.length === 0) && <li>No specific skills matched.</li>}
              </ul>
            </div>

            <div className="card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
              <h3 style={{ color: 'red' }}>Missing Skills</h3>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', lineHeight: '1.6' }}>
                {matchResult.missing_skills?.map((s, i) => <li key={i}>{s}</li>)}
                {(!matchResult.missing_skills || matchResult.missing_skills.length === 0) && <li>No missing skills identified!</li>}
              </ul>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', marginTop: '2rem' }}>
            <h3>Improvement Suggestions</h3>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', lineHeight: '1.6' }}>
              {matchResult.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

        </div>
      )}

    </div>
  );
}
