import { useState, useEffect } from 'react';
import { getRecruiterSessions } from '../services/api.js';

export default function RecruiterDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Simulated playback state
  const [isPlayingClip, setIsPlayingClip] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const playbackIntervalRef = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getRecruiterSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to load recruiter data", err);
    } finally {
      setLoading(false);
    }
  };

  // Simulated recording player logic
  useEffect(() => {
    let interval;
    if (isPlayingClip) {
      interval = setInterval(() => {
        setPlaybackTime(prev => {
          if (prev >= 60) {
            setIsPlayingClip(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlayingClip]);

  const handleReview = (session) => {
    setSelectedSession(session);
    setIsPlayingClip(false);
    setPlaybackTime(0);
  };

  const handleTogglePlay = () => {
    setIsPlayingClip(!isPlayingClip);
  };

  const formatPlaybackTime = (secs) => {
    const s = secs % 60;
    return `00:${s.toString().padStart(2, '0')}`;
  };

  // Filters
  const uniqueTopics = ['all', ...new Set(sessions.map(s => s.topic))];

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = 
      s.candidate?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.candidate?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topic?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesTopic = topicFilter === 'all' || s.topic === topicFilter;
    
    return matchesSearch && matchesTopic;
  });

  // Summary Metrics
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const averageOverallScore = completedSessions.length > 0
    ? (completedSessions.reduce((acc, s) => acc + (s.overall_score || 0), 0) / completedSessions.length).toFixed(1)
    : 0.0;
  
  const highPerformers = completedSessions.filter(s => s.overall_score >= 8).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading Candidate Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem', height: '100%', overflowY: 'auto', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📊 Recruiter Evaluation Portal</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Review candidate interviews, transcripts, scoring dimensions, and simulated media responses.</p>
        </div>
        <button 
          onClick={loadSessions}
          style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
        >
          🔄 Refresh Listings
        </button>
      </div>

      {/* Overview Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Evaluated</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{sessions.length} Candidates</div>
        </div>

        <div className="card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Class Rating</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-secondary)', marginTop: '0.5rem' }}>{averageOverallScore}/10</div>
        </div>

        <div className="card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>High Performers (≥ 8)</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--success)', marginTop: '0.5rem' }}>{highPerformers} Candidates</div>
        </div>
      </div>

      {/* Search and Filters Row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input 
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="🔍 Search candidate name, email, or topic..."
          style={{ flex: 1, minWidth: '280px', padding: '0.8rem 1.2rem', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
        />

        <select
          value={topicFilter}
          onChange={e => setTopicFilter(e.target.value)}
          style={{ minWidth: '180px', padding: '0.8rem 1.2rem', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', cursor: 'pointer' }}
        >
          {uniqueTopics.map((topic, i) => (
            <option key={i} value={topic}>{topic === 'all' ? 'All Topics' : topic}</option>
          ))}
        </select>
      </div>

      {/* Candidate Listings Table */}
      <div className="card" style={{ background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Candidate Details</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Topic & Resume</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Averages (Tech / Comm / Conf / Rel)</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Overall Score</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>Status</th>
              <th style={{ padding: '1.2rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No candidate interview records match the filter criteria.
                </td>
              </tr>
            ) : (
              filteredSessions.map((session, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s', hover: { background: 'rgba(255,255,255,0.01)' } }}>
                  {/* Candidate Profile */}
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{session.candidate?.full_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{session.candidate?.email}</div>
                  </td>
                  
                  {/* Topic and Resume */}
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{session.topic}</div>
                    <div style={{ fontSize: '12px', color: 'var(--accent-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📄 {session.candidate?.latest_resume}
                    </div>
                  </td>
                  
                  {/* Score breakdown averages */}
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <div style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      Tech: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{session.averages.technical_knowledge}</span> | 
                      Comm: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{session.averages.communication}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Conf: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{session.averages.confidence}</span> | 
                      Rel: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{session.averages.relevance}</span>
                    </div>
                  </td>

                  {/* Overall Score */}
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    {session.overall_score ? (
                      <div style={{ fontSize: '18px', fontWeight: 800, color: session.overall_score >= 8 ? 'var(--success)' : 'var(--warning)' }}>
                        {session.overall_score}/10
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Unrated</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '1.2rem 1.5rem' }}>
                    <span className={`badge ${session.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                      {session.status}
                    </span>
                  </td>

                  {/* Review Actions */}
                  <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleReview(session)}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '12px', width: 'auto', margin: 0, borderRadius: 'var(--radius-sm)' }}
                    >
                      🔍 Review Candidate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Details Overlay Drawer */}
      {selectedSession && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          right: 0, 
          bottom: 0, 
          width: '600px', 
          background: 'var(--bg-secondary)', 
          borderLeft: '2px solid var(--border-color)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'drawerSlide 0.3s ease-out'
        }}>
          
          {/* Drawer Header */}
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Candidate Review</h3>
              <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '12px' }}>Session #{selectedSession.session_id} • {selectedSession.topic}</p>
            </div>
            <button 
              onClick={() => setSelectedSession(null)}
              style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', fontWeight: 700 }}
            >
              ✕ Close
            </button>
          </div>

          {/* Drawer Body Scroll */}
          <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Candidate Details Card */}
            <div className="card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '0.75rem' }}>Profile Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '14px' }}>
                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>Full Name:</strong>
                  <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>{selectedSession.candidate?.full_name}</div>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>Email:</strong>
                  <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>{selectedSession.candidate?.email}</div>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>Target Role & Topic:</strong>
                  <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>{selectedSession.topic} ({selectedSession.difficulty})</div>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>ATS Resume:</strong>
                  <div style={{ color: 'var(--accent-secondary)', marginTop: '2px' }}>📄 {selectedSession.candidate?.latest_resume}</div>
                </div>
              </div>
            </div>

            {/* Score Breakdown Chart */}
            <div className="card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '1.25rem' }}>Metrics Evaluation</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Technical Knowledge</span>
                    <span style={{ color: 'var(--accent-secondary)' }}>{selectedSession.averages.technical_knowledge}/10</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${selectedSession.averages.technical_knowledge * 10}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '4px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Communication Clarity</span>
                    <span style={{ color: 'var(--accent-secondary)' }}>{selectedSession.averages.communication}/10</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${selectedSession.averages.communication * 10}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '4px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Confidence Index</span>
                    <span style={{ color: 'var(--accent-secondary)' }}>{selectedSession.averages.confidence}/10</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${selectedSession.averages.confidence * 10}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '4px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Relevance & Precision</span>
                    <span style={{ color: 'var(--accent-secondary)' }}>{selectedSession.averages.relevance}/10</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${selectedSession.averages.relevance * 10}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '4px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Candidate Video Playback Console */}
            <div className="card" style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '1rem' }}>Candidate Video Recording Playback</h4>
              
              <div style={{ background: '#000', borderRadius: '8px', position: 'relative', overflow: 'hidden', aspectRatio: '16/9', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {isPlayingClip ? (
                  <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle, #181830 0%, #050510 100%)' }}>
                    {/* Simulated live video waves */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="live-wave" style={{ animationDelay: '0.1s' }} />
                      <span className="live-wave" style={{ animationDelay: '0.4s' }} />
                      <span className="live-wave" style={{ animationDelay: '0.2s' }} />
                      <span className="live-wave" style={{ animationDelay: '0.6s' }} />
                      <span className="live-wave" style={{ animationDelay: '0.3s' }} />
                    </div>
                    
                    <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', color: '#fff', fontSize: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px' }}>
                      🎞️ PLAYING CLIP ({formatPlaybackTime(playbackTime)} / 01:00)
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <button 
                      onClick={handleTogglePlay}
                      style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-gradient)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto', boxShadow: 'var(--accent-glow)' }}
                    >
                      ▶
                    </button>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '1rem' }}>Play recorded video & audio response clip</p>
                  </div>
                )}
                
                <style dangerouslySetInnerHTML={{__html: `
                  .live-wave {
                    width: 4px;
                    height: 30px;
                    background: var(--accent-primary);
                    border-radius: 2px;
                    animation: lwave 0.8s ease-in-out infinite alternate;
                  }
                  @keyframes lwave {
                    from { height: 10px; transform: scaleY(0.5); }
                    to { height: 45px; transform: scaleY(1.2); }
                  }
                `}} />
              </div>
            </div>

            {/* Q&A Transcript */}
            <div>
              <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '1.25rem' }}>Question & Answer Transcript</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {selectedSession.answers.map((ans, idx) => (
                  <div key={idx} style={{ borderBottom: idx < selectedSession.answers.length - 1 ? '1px solid var(--border-color)' : 'none', paddingBottom: '1.5rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Q{idx + 1}: {ans.question}</span>
                      <span style={{ color: 'var(--info)', fontFamily: 'monospace' }}>[{ans.score}/10]</span>
                    </div>

                    <div style={{ marginTop: '0.75rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', fontSize: '14px', fontStyle: 'italic', borderLeft: '3px solid var(--accent-secondary)', color: 'var(--text-secondary)' }}>
                      &ldquo;{ans.user_answer}&rdquo;
                    </div>

                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '13px' }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Technical breakdown:</strong>
                        <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>{ans.metrics.feedback_text}</span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Model Ideal Concepts:</strong>
                        <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>{ans.metrics.ideal_answer}</span>
                      </div>
                      {ans.metrics.improvement_tips?.length > 0 && (
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>Improvement Tips:</strong>
                          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {ans.metrics.improvement_tips.map((tip, tIdx) => (
                              <li key={tIdx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
      
      {/* Drawer Background Dimming Overlay */}
      {selectedSession && (
        <div 
          onClick={() => setSelectedSession(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 999 }}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drawerSlide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />

    </div>
  );
}
