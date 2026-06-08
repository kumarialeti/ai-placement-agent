import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/api.js';
import ReactMarkdown from 'react-markdown';

import Dashboard from '../components/Dashboard.jsx';
import JobMatch from '../components/JobMatch.jsx';
import MockInterview from '../components/MockInterview.jsx';
import RecruiterDashboard from '../components/RecruiterDashboard.jsx';

const QUICK_ACTIONS = [
  { icon: '📄', title: 'Analyze Resume', desc: 'Upload & get ATS score', prompt: 'Analyze my resume and give me the ATS score' },
  { icon: '💼', title: 'Match Job', desc: 'Compare resume vs JD', prompt: 'Help me match my resume against a job description' },
  { icon: '❓', title: 'Interview Prep', desc: 'Generate practice questions', prompt: 'Generate 5 intermediate NLP interview questions' },
  { icon: '🗺️', title: 'Study Roadmap', desc: 'Get a personalized plan', prompt: 'Create a 4-week study roadmap for ML Engineer role' },
  { icon: '🧠', title: 'Learn DSA', desc: 'Explain concepts', prompt: 'Explain Binary Search with time complexity analysis' },
];

const NAV_ITEMS = [
  { icon: '💬', label: 'Chat', id: 'chat' },
  { icon: '💼', label: 'Job Match', id: 'jobs' },
  { icon: '🎤', label: 'Mock Interview', id: 'interview' },
  { icon: '📊', label: 'Progress', id: 'progress' },
  { icon: '🧑‍💼', label: 'Recruiter Dashboard', id: 'recruiter' },
];

export default function ChatPage({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('chat');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text = null) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    if (activeNav !== 'chat') setActiveNav('chat');

    const userMsg = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await sendMessage(messageText);
      const assistantMsg = {
        role: 'assistant',
        content: data.response,
        intent: data.intent,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Error: ${err.message}. Make sure the backend is running.` },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'jobs':
        return <JobMatch />;
      case 'interview':
        return <MockInterview />;
      case 'progress':
        return <Dashboard />;
      case 'recruiter':
        return <RecruiterDashboard />;
      case 'chat':
      default:
        return (
          <div className="chat-container">
            <div className="chat-header">
              <h1>🎯 AI Placement Prep Agent</h1>
              <p>Your personal AI-powered placement preparation assistant</p>
            </div>

            {messages.length === 0 ? (
              <div className="welcome-section">
                <div className="welcome-icon">🚀</div>
                <h1>How can I help you prepare?</h1>
                <p>
                  I can analyze resumes, generate interview questions, conduct mock
                  interviews, and create personalized study plans.
                </p>
                <div className="quick-actions">
                  {QUICK_ACTIONS.map((action, i) => (
                    <div
                      key={i}
                      className="quick-action"
                      onClick={() => {
                      if (action.title === 'Interview Prep') {
                        setActiveNav('interview');
                      } else {
                        handleSend(action.prompt);
                      }
                    }}
                    >
                      <div className="quick-action-icon">{action.icon}</div>
                      <h3>{action.title}</h3>
                      <p>{action.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="messages-area">
                {messages.map((msg, i) => (
                  <div key={i} className={`message ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="message-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                      {msg.intent && msg.role === 'assistant' && (
                        <div style={{ marginTop: '8px' }}>
                          <span className="badge badge-info">{msg.intent}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="message assistant">
                    <div className="message-avatar" style={{ background: 'var(--accent-gradient)' }}>
                      🤖
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            <div className="chat-input-area">
              <div className="chat-input-wrapper">
                <textarea
                  ref={inputRef}
                  id="chat-input"
                  className="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about placement prep..."
                  rows={1}
                  disabled={loading}
                />
                <button
                  id="send-btn"
                  className="send-btn"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                >
                  {loading ? (
                    <div className="loading-spinner" />
                  ) : (
                    <>Send ↑</>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">🎯</div>
          <span className="logo-text">PlacePrep AI</span>
        </div>

        <div className="nav-section">
          <div className="nav-label">Main</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-section">
            <div className="nav-label">Account</div>
            <div className="nav-item" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
              <span>👤</span>
              {user?.username || 'User'}
            </div>
            <button className="nav-item" onClick={onLogout}>
              <span>🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
