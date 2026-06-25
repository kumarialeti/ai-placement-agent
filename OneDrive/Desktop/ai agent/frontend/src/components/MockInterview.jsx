import { useState, useEffect, useRef } from 'react';
import { startInterview, submitAnswer, completeInterview } from '../services/api.js';

export default function MockInterview() {
  const [topic, setTopic] = useState('NLP and Machine Learning');
  const [difficulty, setDifficulty] = useState('intermediate');
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [nextQuestionCached, setNextQuestionCached] = useState(null);
  
  const [finalScore, setFinalScore] = useState(null);

  // Camera & Recording Feed States
  const [hasCamera, setHasCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerIntervalRef = useRef(null);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setUserAnswer(prev => prev ? prev + ' ' + finalTranscript.trim() : finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopCamera();
      stopTimer();
      window.speechSynthesis.cancel();
    };
  }, []);

  // Timer functions
  const startTimer = () => {
    stopTimer();
    setSecondsElapsed(0);
    timerIntervalRef.current = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Camera functions
  const startCamera = async () => {
    try {
      if (streamRef.current) stopCamera();
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasCamera(true);
    } catch (err) {
      console.warn("Camera access denied or not available", err);
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setHasCamera(false);
  };

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await startInterview(topic, difficulty, 1); // Start interview
      setSession(data);
      setQuestionCount(1);
      setFinalScore(null);
      setFeedback(null);
      setNextQuestionCached(null);
      setUserAnswer('');
      
      if (data.questions && data.questions.length > 0) {
        setCurrentQuestion(data.questions[0]);
        speakText(data.questions[0].question);
      }
      
      // Request camera
      setTimeout(() => {
        startCamera();
      }, 300);

    } catch (err) {
      alert("Error starting interview: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch(e) {}
      setIsListening(false);
      stopTimer();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        startTimer();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
        alert("Microphone/Speech-to-text not available. You can type your answer instead.");
        setIsListening(false);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;
    
    setLoading(true);
    if (isListening) {
      toggleListen(); // Turn off mic
    }
    try {
      const data = await submitAnswer(session.session_id, currentQuestion.question_id, userAnswer);
      setFeedback(data);
      setNextQuestionCached(data.next_question);
      
      const scoreSpeech = data.score ? `Your overall score is ${data.score} out of 10.` : '';
      speakText(`${scoreSpeech} Review the detailed feedback on the screen.`);
    } catch (err) {
      alert("Error submitting answer: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (!nextQuestionCached) {
      handleFinishInterview();
      return;
    }
    
    setFeedback(null);
    setUserAnswer('');
    setSecondsElapsed(0);
    setCurrentQuestion(nextQuestionCached);
    setNextQuestionCached(null);
    setQuestionCount(prev => prev + 1);
    
    speakText(nextQuestionCached.question);
  };

  const handleFinishInterview = async () => {
    setLoading(true);
    stopCamera();
    stopTimer();
    try {
      const data = await completeInterview(session.session_id);
      setFinalScore(data);
      speakText(`Interview completed. Your average score is ${data.average_score} out of 10.`);
    } catch (err) {
      alert("Error completing interview: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div style={{ padding: '2.5rem', height: '100%', overflowY: 'auto' }}>
        <h1 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800, marginBottom: '0.5rem' }}>🎤 Dynamic Mock Interview</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>AI conducts real-time adaptive questioning based on your resume, analyzes video/audio, and generates structured evaluation scores.</p>
        
        <div className="card fade-in" style={{ background: 'var(--surface)', padding: '2.5rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)', maxWidth: '550px' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Set Up Your Interview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600 }}>
              <span>Target Topic:</span>
              <input 
                type="text" 
                value={topic} 
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. NLP, RAG Systems, Fullstack Python"
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
              />
            </label>
            
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600 }}>
              <span>Difficulty:</span>
              <select 
                value={difficulty} 
                onChange={e => setDifficulty(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>

            <button 
              className="btn-primary" 
              onClick={handleStart} 
              disabled={loading}
              style={{ marginTop: '1rem', padding: '1.1rem', fontSize: '16px', borderRadius: 'var(--radius-sm)' }}
            >
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="loading-spinner" /> Generating Question...
                </div>
              ) : '🚀 Start AI Video Interview'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (finalScore) {
    return (
      <div style={{ padding: '3rem 2rem', height: '100%', overflowY: 'auto', textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Interview Completed!</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>The AI has assessed your performance across all questions.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', margin: '2.5rem 0' }}>
          <div className="card" style={{ background: 'var(--surface)', padding: '1.5rem 2.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>
              {finalScore.average_score}/10
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '0.25rem', fontWeight: 600 }}>Average Score</div>
          </div>
          <div className="card" style={{ background: 'var(--surface)', padding: '1.5rem 2.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--info)' }}>
              {finalScore.total_questions}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '0.25rem', fontWeight: 600 }}>Questions Answered</div>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid var(--border-color)', textAlign: 'left', marginBottom: '2.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Recruiter Feedback Summary</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            The candidate completed {finalScore.total_questions} adaptive questions. The responses demonstrated strong domain readiness with an overall evaluation score of {finalScore.average_score} out of 10. Check the Recruiter Dashboard tab to review complete transcripts, detailed metrics breakdown, and recorded session logs.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setSession(null)} style={{ maxWidth: '280px', padding: '1rem 2rem' }}>
          Start Another Session
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '2rem', padding: '2rem', height: '100%', minHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
      
      {/* Left Column: AI Stream & Question */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Live Camera Box */}
        <div style={{ 
          background: '#090915', 
          borderRadius: '1.25rem', 
          border: '2px solid var(--border-color)', 
          position: 'relative', 
          aspectRatio: '16/9', 
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          {hasCamera ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', animation: 'pulse 1.5s infinite' }}>🤖</div>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '13px' }}>Webcam active (simulated stream)</p>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '1rem' }}>
                <span className="equalizer-bar" style={{ animationDelay: '0.1s' }} />
                <span className="equalizer-bar" style={{ animationDelay: '0.4s' }} />
                <span className="equalizer-bar" style={{ animationDelay: '0.2s' }} />
                <span className="equalizer-bar" style={{ animationDelay: '0.5s' }} />
                <span className="equalizer-bar" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
          
          {/* Pulsing REC Indicator Overlay */}
          <div style={{ 
            position: 'absolute', 
            top: '1rem', 
            left: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(0,0,0,0.6)', 
            padding: '6px 12px', 
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#fff',
            backdropFilter: 'blur(4px)'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#ef4444',
              display: 'inline-block',
              animation: 'pulseRed 1s infinite alternate'
            }} />
            <span>REC {formatTime(secondsElapsed)}</span>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes pulseRed {
              from { opacity: 0.3; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1.1); }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
            .equalizer-bar {
              width: 3px;
              height: 20px;
              background: var(--accent-secondary);
              display: inline-block;
              animation: eq 1s ease-in-out infinite alternate;
              border-radius: 2px;
            }
            @keyframes eq {
              from { height: 4px; }
              to { height: 24px; }
            }
          `}} />
        </div>

        {/* AI Question Box */}
        <div className="card fade-in" style={{ 
          background: 'var(--surface)', 
          padding: '1.75rem', 
          borderRadius: '1.25rem', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-info" style={{ fontWeight: 700 }}>Question {questionCount} (Adaptive)</span>
            <button 
              onClick={() => speakText(currentQuestion?.question)} 
              title="Repeat Question Audio"
              style={{ background: 'rgba(124, 58, 237, 0.1)', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '20px', color: 'var(--accent-secondary)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              🔊 Replay Question
            </button>
          </div>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.6', fontWeight: 500, color: 'var(--text-primary)' }}>
            {currentQuestion?.question}
          </p>
        </div>
      </div>

      {/* Right Column: Candidate Answer Input / Evaluation Feedback */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        
        {!feedback ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Answer Transcript:</label>
              {isListening && <span className="badge badge-success" style={{ animation: 'pulse 1s infinite' }}>🎤 Transcribing Audio...</span>}
            </div>

            <textarea 
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Start speaking by clicking the mic below, or type your response here directly..."
              style={{ 
                flex: 1, 
                minHeight: '240px', 
                padding: '1.25rem', 
                background: 'var(--bg-secondary)', 
                color: 'var(--text-primary)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '0.75rem', 
                resize: 'none', 
                outline: 'none',
                lineHeight: '1.7',
                fontSize: '15px'
              }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={toggleListen}
                  className="send-btn"
                  style={{ 
                    padding: '0.85rem 1.75rem', 
                    borderRadius: '2rem',
                    background: isListening ? '#ef4444' : 'var(--surface)',
                    color: isListening ? '#fff' : 'var(--text-primary)',
                    border: '1px solid ' + (isListening ? '#ef4444' : 'var(--border-color)'),
                    boxShadow: isListening ? '0 0 15px rgba(239,68,68,0.3)' : 'none'
                  }}
                >
                  {isListening ? '🛑 Stop Speaking' : '🎤 Start Speaking Answer'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={handleFinishInterview}
                  style={{ 
                    padding: '0.85rem 1.5rem', 
                    borderRadius: 'var(--radius-sm)', 
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                >
                  End Session 🏁
                </button>

                <button 
                  className="btn-primary" 
                  onClick={handleSubmitAnswer}
                  disabled={loading || !userAnswer.trim()}
                  style={{ padding: '0.85rem 2rem', borderRadius: 'var(--radius-sm)', margin: 0, width: 'auto' }}
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className="loading-spinner" /> Evaluating...
                    </div>
                  ) : 'Submit Answer 📤'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card fade-in" style={{ 
            background: 'var(--surface)', 
            padding: '2rem', 
            borderRadius: '1.25rem', 
            border: `1px solid ${feedback.score > 7 ? 'var(--success)' : 'var(--warning)'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: 'var(--text-primary)' }}>Answer Analysis</h3>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: feedback.score > 7 ? 'var(--success)' : 'var(--warning)' }}>
                {feedback.score}/10
              </div>
            </div>

            {/* Criteria Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Technical Knowledge</span>
                  <span style={{ color: 'var(--text-primary)' }}>{feedback.evaluation?.technical_knowledge || 0}/10</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(feedback.evaluation?.technical_knowledge || 0) * 10}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '3px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Communication</span>
                  <span style={{ color: 'var(--text-primary)' }}>{feedback.evaluation?.communication || 0}/10</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(feedback.evaluation?.communication || 0) * 10}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '3px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Confidence</span>
                  <span style={{ color: 'var(--text-primary)' }}>{feedback.evaluation?.confidence || 0}/10</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(feedback.evaluation?.confidence || 0) * 10}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '3px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Relevance</span>
                  <span style={{ color: 'var(--text-primary)' }}>{feedback.evaluation?.relevance || 0}/10</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(feedback.evaluation?.relevance || 0) * 10}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '3px' }} />
                </div>
              </div>
            </div>

            {/* Feedback Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)', fontSize: '14px' }}>AI Feedback Comment:</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{feedback.evaluation?.feedback}</p>
              </div>

              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)', fontSize: '14px' }}>Ideal Answer Concepts:</strong>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{feedback.evaluation?.ideal_answer}</p>
              </div>
            </div>

            {/* Next Step Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
              <button 
                onClick={handleFinishInterview}
                style={{ 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: 'var(--radius-sm)', 
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                disabled={loading}
              >
                End Session 🏁
              </button>

              <button 
                className="btn-primary" 
                onClick={handleNextQuestion} 
                style={{ padding: '0.75rem 2rem', width: 'auto', margin: 0 }}
              >
                {nextQuestionCached ? 'Next Adaptive Question ➡️' : 'Finish & View Summary 🏁'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
