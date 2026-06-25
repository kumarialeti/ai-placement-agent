import { useState, useEffect } from 'react';
import { getProfile, listResumes, getInterviewHistory } from '../services/api.js';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, resData, intData] = await Promise.all([
          getProfile(),
          listResumes(),
          getInterviewHistory()
        ]);
        setProfile(profData);
        setResumes(resData);
        setInterviews(intData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="loading-spinner" style={{ margin: 'auto' }} />;

  const latestResume = resumes.length > 0 ? resumes[0] : null;

  return (
    <div className="dashboard-container" style={{ padding: '2rem', overflowY: 'auto' }}>
      <h1>Dashboard</h1>
      <p style={{ color: 'var(--text-muted)' }}>Welcome back, {profile?.full_name}</p>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        {/* ATS Score Card */}
        <div className="card" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3>Latest ATS Score</h3>
          {latestResume ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                {latestResume.ats_score || 0}%
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Based on: <br /><strong>{latestResume.filename}</strong>
              </div>
            </div>
          ) : (
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>No resume uploaded yet.</p>
          )}
        </div>

        {/* Profile Card */}
        <div className="card" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
          <h3>Target Role</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem' }}>{profile?.target_role || 'Not Set'}</p>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Experience: {profile?.experience_level || 'Not Set'}</p>
        </div>

      </div>

      <h2 style={{ marginTop: '3rem', marginBottom: '1rem' }}>Recent Interviews</h2>
      {interviews.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No mock interviews completed yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {interviews.map(inv => (
            <div key={inv.session_id} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0 }}>{inv.topic}</h4>
                <small style={{ color: 'var(--text-muted)' }}>{new Date(inv.created_at).toLocaleDateString()}</small>
              </div>
              <div style={{ fontWeight: 'bold', color: inv.score > 70 ? 'var(--success)' : 'var(--warning)' }}>
                Score: {inv.score || 0}/100
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
