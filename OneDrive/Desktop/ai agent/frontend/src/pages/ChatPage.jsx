import { useState, useRef, useEffect, useCallback } from 'react';
import { sendMessageStream, transcribeAudio, getChatHistory } from '../services/api.js';
import ReactMarkdown from 'react-markdown';
import { Mic, Square, Volume2, VolumeX, Send, RotateCcw } from 'lucide-react';

const QUICK_ACTIONS = [
  { icon: '📄', title: 'Analyze Resume',   desc: 'Get ATS score & feedback',      prompt: 'Analyze my resume and give me the ATS score with improvement suggestions.' },
  { icon: '💼', title: 'Job Match',         desc: 'Compare resume vs JD',          prompt: 'Help me match my resume against a job description. I will paste it next.' },
  { icon: '❓', title: 'Interview Prep',    desc: 'Generate practice questions',   prompt: 'Generate 5 intermediate NLP interview questions with ideal answers.' },
  { icon: '🗺️', title: 'Study Roadmap',    desc: 'Get a personalized plan',       prompt: 'Create a 4-week study roadmap for an ML Engineer role.' },
  { icon: '🧠', title: 'Explain a Concept', desc: 'Deep-dive explanations',        prompt: 'Explain Binary Search with time complexity analysis and a Python example.' },
];

export default function ChatPage() {
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError]             = useState('');

  // Voice
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMode, setVoiceMode]     = useState(false);

  const messagesEndRef    = useRef(null);
  const inputRef          = useRef(null);
  const mediaRecorderRef  = useRef(null);
  const audioChunksRef    = useRef([]);

  // ── Load chat history on mount ──
  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      try {
        const history = await getChatHistory(30);
        if (cancelled) return;
        if (history?.length > 0) {
          setMessages(
            history.map(m => ({
              role: m.role,
              content: m.content,
              intent: m.intent || '',
            }))
          );
        }
      } catch {
        // History load failure is non-fatal — just start fresh
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }
    loadHistory();
    return () => { cancelled = true; };
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cancel TTS when voice mode toggled off
  useEffect(() => {
    if (!voiceMode) window.speechSynthesis.cancel();
  }, [voiceMode]);

  const speakText = useCallback((text) => {
    if (!voiceMode) return;
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }, [voiceMode]);

  // ── Recording ──
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        setLoading(true);
        try {
          const data = await transcribeAudio(audioBlob);
          if (data.text) handleSend(data.text);
          else setLoading(false);
        } catch {
          setError('Transcription failed. Please type your message instead.');
          setLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setError('Microphone access is required for voice features.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ── Send message ──
  const handleSend = async (text = null) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setError('');
    window.speechSynthesis.cancel();

    const userMsg = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', intent: '' }]);
    setInput('');
    setLoading(true);

    let fullResponse = '';

    await sendMessageStream(
      messageText,
      null,
      (chunk) => {
        fullResponse += chunk;
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], content: next[next.length - 1].content + chunk };
          return next;
        });
      },
      (data) => {
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], intent: data.intent || 'general_chat' };
          return next;
        });
        setLoading(false);
        inputRef.current?.focus();
        if (voiceMode) speakText(fullResponse);
      },
      (err) => {
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = {
            ...next[next.length - 1],
            content: next[next.length - 1].content || 'Something went wrong. Please try again.',
            isError: true,
          };
          return next;
        });
        setLoading(false);
        inputRef.current?.focus();
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearConversation = () => {
    window.speechSynthesis.cancel();
    setMessages([]);
    setError('');
  };

  // ── Empty state ──
  const showEmptyState = !historyLoading && messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] w-full max-w-4xl mx-auto bg-surface rounded-2xl shadow-subtle border border-surface-border overflow-hidden">

      {/* Header */}
      <div className="border-b border-surface-border px-5 py-3.5 bg-surface flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">AI</div>
          <h1 className="text-base font-bold text-text-main">AI Prep Agent</h1>
          {messages.length > 0 && (
            <span className="text-xs text-text-muted ml-1">
              {messages.filter(m => m.role === 'user').length} messages
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearConversation}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-main hover:bg-surface-muted rounded-lg transition-all"
              title="Clear conversation"
            >
              <RotateCcw size={14} /> New Chat
            </button>
          )}
          <button
            onClick={() => setVoiceMode(!voiceMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              voiceMode
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-surface border-surface-border text-text-muted hover:text-text-main hover:bg-surface-muted'
            }`}
          >
            {voiceMode ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {voiceMode ? 'Voice On' : 'Voice Off'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-100 px-5 py-2.5 flex items-center justify-between text-sm text-red-600">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-semibold hover:text-red-800 ml-4">✕</button>
        </div>
      )}

      {/* Messages */}
      {historyLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-surface-border border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : showEmptyState ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto bg-surface-muted/40">
          <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center text-2xl mb-4">
            👋
          </div>
          <h2 className="text-xl font-bold text-text-main mb-1">How can I help you prepare?</h2>
          <p className="text-sm text-text-muted max-w-sm mb-7">
            I can analyze your resume, generate interview questions, conduct mock interviews, and create personalized study plans.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                className="bg-surface border border-surface-border rounded-xl p-4 cursor-pointer hover:border-primary-300 hover:shadow-subtle transition-all text-left group"
                onClick={() => handleSend(action.prompt)}
              >
                <div className="text-xl mb-2">{action.icon}</div>
                <h3 className="text-sm font-semibold text-text-main mb-0.5 group-hover:text-primary-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-text-muted">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-surface-muted/40">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 max-w-[88%] animate-fade-in ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-surface border border-surface-border shadow-subtle text-text-muted'
              }`}>
                {msg.role === 'user' ? 'U' : 'AI'}
              </div>

              {/* Bubble */}
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-subtle ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : msg.isError
                  ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-sm'
                  : 'bg-surface border border-surface-border text-text-main rounded-tl-sm'
              }`}>
                <div className={`prose prose-sm max-w-none ${
                  msg.role === 'user' ? 'prose-invert' : 'prose-slate'
                }`}>
                  <ReactMarkdown>{msg.content || (loading && i === messages.length - 1 ? '' : '​')}</ReactMarkdown>
                </div>

                {/* Loading dots when empty assistant message */}
                {msg.role === 'assistant' && msg.content === '' && loading && (
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}

                {/* Intent badge */}
                {msg.intent && msg.role === 'assistant' && msg.intent !== 'general_chat' && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-muted text-text-muted uppercase tracking-wide">
                      {msg.intent.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3 bg-surface border-t border-surface-border shrink-0">
        <div className={`flex gap-2 items-end p-2 bg-surface-muted border rounded-xl transition-all ${
          isRecording
            ? 'border-red-300 bg-red-50'
            : 'border-surface-border focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100'
        }`}>
          {/* Mic */}
          <button
            className={`p-2.5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
              isRecording
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'text-text-muted hover:text-text-main hover:bg-surface-border'
            }`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading && !isRecording}
            title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
          >
            {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
          </button>

          {/* Text input */}
          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent border-none text-text-main text-sm p-2 resize-none max-h-28 min-h-[40px] focus:outline-none placeholder:text-text-muted"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? 'Listening…' : 'Ask me anything about placement prep…'}
            rows={1}
            disabled={loading || isRecording}
          />

          {/* Send */}
          <button
            className="p-2.5 rounded-lg bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 transition-colors"
            onClick={() => handleSend()}
            disabled={(!input.trim() && !isRecording) || loading}
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={16} />
            }
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
