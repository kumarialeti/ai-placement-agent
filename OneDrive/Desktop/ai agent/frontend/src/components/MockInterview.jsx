import { useState, useEffect, useRef } from 'react';
import { startInterview, submitAnswer, completeInterview } from '../services/api.js';
import { Mic, MicOff, Volume2, SkipForward, CheckCircle, Flag, RotateCcw, Play, Pause } from 'lucide-react';

// ── Score bar ──
function ScoreBar({ label, value }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 font-medium">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-800">{value}/10</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            value >= 7 ? 'bg-emerald-500' : value >= 5 ? 'bg-amber-400' : 'bg-red-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function MockInterview({ userProfile }) {
  const [topic, setTopic]         = useState(userProfile?.targetRole || 'Software Engineering');
  const [difficulty, setDifficulty] = useState('intermediate');

  const [session, setSession]               = useState(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');

  const [currentQuestion, setCurrentQuestion]   = useState(null);
  const [questionCount, setQuestionCount]       = useState(1);
  const [userAnswer, setUserAnswer]             = useState('');

  const [isListening, setIsListening]           = useState(false);
  const [isSpeaking, setIsSpeaking]             = useState(false);
  const [feedback, setFeedback]                 = useState(null);
  const [nextQuestionCached, setNextQuestionCached] = useState(null);
  const [finalScore, setFinalScore]             = useState(null);

  // Camera
  const [hasCamera, setHasCamera]   = useState(false);
  const videoRef                    = useRef(null);
  const streamRef                   = useRef(null);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerIntervalRef                    = useRef(null);

  // Speech
  const recognitionRef = useRef(null);

  // ── Speech Recognition Setup ──
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) {
          setUserAnswer(prev => prev ? prev + ' ' + finalTranscript.trim() : finalTranscript.trim());
        }
      };
      rec.onerror = () => setIsListening(false);
      rec.onend   = () => setIsListening(false);
      recognitionRef.current = rec;
    }

    return () => {
      recognitionRef.current?.stop();
      stopCamera();
      stopTimer();
      window.speechSynthesis.cancel();
    };
  }, []);

  // ── Timer ──
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

  // ── Camera ──
  const startCamera = async () => {
    try {
      if (streamRef.current) stopCamera();
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = mediaStream;
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setHasCamera(true);
    } catch {
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

  // ── TTS ──
  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // ── Start Interview ──
  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await startInterview(topic, difficulty, 1);
      setSession(data);
      setQuestionCount(1);
      setFinalScore(null);
      setFeedback(null);
      setNextQuestionCached(null);
      setUserAnswer('');

      if (data.questions?.length > 0) {
        setCurrentQuestion(data.questions[0]);
        speakText(data.questions[0].question);
      }
      setTimeout(startCamera, 300);
    } catch (err) {
      setError(err.message || 'Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Voice Toggle ──
  const toggleListen = () => {
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
      stopTimer();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        startTimer();
      } catch {
        setError('Microphone/Speech-to-text not available. You can type your answer instead.');
        setIsListening(false);
      }
    }
  };

  // ── Submit Answer ──
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    setError('');
    if (isListening) toggleListen();
    try {
      const data = await submitAnswer(session.session_id, currentQuestion.question_id, userAnswer);
      setFeedback(data);
      setNextQuestionCached(data.next_question);
      const scoreSpeech = data.score ? `Your score is ${data.score} out of 10. ` : '';
      speakText(`${scoreSpeech}Review the feedback on screen.`);
    } catch (err) {
      setError(err.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Next Question ──
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

  // ── Finish ──
  const handleFinishInterview = async () => {
    setLoading(true);
    stopCamera();
    stopTimer();
    setError('');
    try {
      const data = await completeInterview(session.session_id);
      setFinalScore(data);
      speakText(`Interview completed. Your average score is ${data.average_score} out of 10.`);
    } catch (err) {
      setError(err.message || 'Failed to complete interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════
  // VIEW 1: Setup
  // ══════════════════════════════════════════
  if (!session) {
    return (
      <div className="max-w-lg mx-auto py-8 animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              🎤
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Mock Interview</h1>
            <p className="text-sm text-slate-500">
              AI conducts adaptive questioning, evaluates your answers in real time, and gives structured feedback.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Topic / Role</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. NLP, Fullstack Python, React"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-900"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <button
              onClick={handleStart}
              disabled={loading || !topic.trim()}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Question…
                </>
              ) : (
                '🚀 Start AI Interview'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // VIEW 2: Final Score
  // ══════════════════════════════════════════
  if (finalScore) {
    const avg = finalScore.average_score;
    const scoreColor = avg >= 7 ? 'text-emerald-600' : avg >= 5 ? 'text-amber-500' : 'text-red-500';
    const scoreBg    = avg >= 7 ? 'bg-emerald-50 border-emerald-200' : avg >= 5 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

    return (
      <div className="max-w-2xl mx-auto py-8 animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Interview Complete!</h1>
          <p className="text-slate-500 text-sm mb-8">
            The AI has evaluated your performance across all questions.
          </p>

          <div className="flex justify-center gap-6 mb-8">
            <div className={`flex flex-col items-center p-6 rounded-2xl border ${scoreBg}`}>
              <span className={`text-4xl font-bold ${scoreColor}`}>{avg}/10</span>
              <span className="text-xs text-slate-500 mt-1 font-medium">Average Score</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl border bg-blue-50 border-blue-200">
              <span className="text-4xl font-bold text-blue-600">{finalScore.total_questions}</span>
              <span className="text-xs text-slate-500 mt-1 font-medium">Questions Answered</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 text-left mb-8 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2 text-sm">Recruiter Summary</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Candidate completed {finalScore.total_questions} adaptive questions with an overall score of{' '}
              <strong>{avg}/10</strong>. Check the Recruiter View tab for full transcript and detailed metric breakdown.
            </p>
          </div>

          <button
            onClick={() => { setSession(null); setFinalScore(null); setError(''); }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={18} /> Start Another Session
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════
  // VIEW 3: Active Interview
  // ══════════════════════════════════════════
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-8 animate-fade-in">

      {/* ── LEFT: Camera + Question ── */}
      <div className="flex flex-col gap-4">

        {/* Camera Box */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-700">
          {hasCamera ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-6">
              <div className="text-5xl mb-3 opacity-50">🤖</div>
              <p className="text-slate-400 text-sm">Camera not available</p>
            </div>
          )}

          {/* REC Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-bold">REC {formatTime(secondsElapsed)}</span>
          </div>

          {/* AI Speaking badge */}
          {isSpeaking && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-indigo-600/90 px-3 py-1.5 rounded-full">
              <Volume2 size={12} className="text-white" />
              <span className="text-white text-xs font-semibold">AI Speaking</span>
            </div>
          )}
        </div>

        {/* Question Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Question {questionCount} · Adaptive
            </span>
            <button
              onClick={() => speakText(currentQuestion?.question)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Volume2 size={13} /> Replay
            </button>
          </div>
          <p className="text-base font-medium text-slate-800 leading-relaxed">
            {currentQuestion?.question}
          </p>
        </div>
      </div>

      {/* ── RIGHT: Answer / Feedback ── */}
      <div className="flex flex-col gap-4">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-semibold ml-3">✕</button>
          </div>
        )}

        {!feedback ? (
          /* Answer input */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">Your Answer</label>
              {isListening && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 animate-pulse">
                  🎤 Transcribing…
                </span>
              )}
            </div>

            <textarea
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="Start speaking or type your answer here…"
              className="flex-1 min-h-[200px] p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-slate-800 leading-relaxed"
            />

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={toggleListen}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isListening
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                {isListening ? 'Stop Speaking' : 'Speak Answer'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleFinishInterview}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <Flag size={15} /> End Session
                </button>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={loading || !userAnswer.trim()}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Evaluating…
                    </>
                  ) : (
                    <>Submit Answer</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Feedback */
          <div className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 flex-1 ${
            feedback.score >= 7 ? 'border-emerald-200' : feedback.score >= 5 ? 'border-amber-200' : 'border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Answer Evaluation</h3>
              <span className={`text-2xl font-bold ${
                feedback.score >= 7 ? 'text-emerald-600' : feedback.score >= 5 ? 'text-amber-500' : 'text-red-500'
              }`}>
                {feedback.score}/10
              </span>
            </div>

            {/* Score bars */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <ScoreBar label="Technical Knowledge" value={feedback.evaluation?.technical_knowledge || 0} />
              <ScoreBar label="Communication"       value={feedback.evaluation?.communication || 0} />
              <ScoreBar label="Confidence"          value={feedback.evaluation?.confidence || 0} />
              <ScoreBar label="Relevance"           value={feedback.evaluation?.relevance || 0} />
            </div>

            {/* Feedback text */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">AI Feedback</p>
                <p className="text-sm text-slate-700 leading-relaxed">{feedback.evaluation?.feedback}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Ideal Answer</p>
                <p className="text-sm text-slate-600 leading-relaxed">{feedback.evaluation?.ideal_answer}</p>
              </div>
            </div>

            {/* Next controls */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                onClick={handleFinishInterview}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Flag size={15} /> End Session
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {nextQuestionCached ? (
                  <><SkipForward size={16} /> Next Question</>
                ) : (
                  <><CheckCircle size={16} /> Finish & View Summary</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
