import { useState, useRef, useEffect } from 'react';
import { sendMessageStream, transcribeAudio } from '../services/api.js';
import ReactMarkdown from 'react-markdown';
import { Mic, Square, Volume2, VolumeX, Send } from 'lucide-react';

const QUICK_ACTIONS = [
  { icon: '📄', title: 'Analyze Resume', desc: 'Upload & get ATS score', prompt: 'Analyze my resume and give me the ATS score' },
  { icon: '💼', title: 'Match Job', desc: 'Compare resume vs JD', prompt: 'Help me match my resume against a job description' },
  { icon: '❓', title: 'Interview Prep', desc: 'Generate practice questions', prompt: 'Generate 5 intermediate NLP interview questions' },
  { icon: '🗺️', title: 'Study Roadmap', desc: 'Get a personalized plan', prompt: 'Create a 4-week study roadmap for ML Engineer role' },
  { icon: '🧠', title: 'Learn DSA', desc: 'Explain concepts', prompt: 'Explain Binary Search with time complexity analysis' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!voiceMode) {
      window.speechSynthesis.cancel();
    }
  }, [voiceMode]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        setLoading(true);
        try {
          const data = await transcribeAudio(audioBlob);
          if (data.text) {
            handleSend(data.text);
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error("Transcription error", error);
          setLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Microphone access is required for voice features.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const speakText = (text) => {
    if (!voiceMode) return;
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text = null) => {
    const messageText = text || input.trim();
    if (!messageText || (loading && !text)) return;

    window.speechSynthesis.cancel();

    const userMsg = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '', intent: '' }]);
    setInput('');
    setLoading(true);

    let fullAssistantResponse = "";

    await sendMessageStream(
      messageText,
      null, // sessionId
      (chunk) => {
        fullAssistantResponse += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: newMessages[lastIndex].content + chunk
          };
          return newMessages;
        });
      },
      (data) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            intent: data.intent || 'general_chat'
          };
          return newMessages;
        });
        setLoading(false);
        inputRef.current?.focus();
        if (voiceMode) {
          speakText(fullAssistantResponse);
        }
      },
      (err) => {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: newMessages[lastIndex].content + `\n\n❌ Error: ${err.message}`
          };
          return newMessages;
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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-5xl mx-auto relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Chat Header */}
      <div className="border-b border-slate-100 p-4 bg-white flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-blue-600">🎯</span> AI Prep Agent
          </h1>
        </div>
        
        <button
          onClick={() => setVoiceMode(!voiceMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 text-sm font-medium ${
            voiceMode 
              ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
          title={voiceMode ? "Voice Mode Active" : "Enable Voice Mode"}
        >
          {voiceMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
          {voiceMode ? 'Voice Mode' : 'Text Only'}
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-y-auto bg-slate-50/50">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
            👋
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">How can I help you prepare?</h2>
          <p className="text-slate-500 max-w-md mb-8">
            I can analyze resumes, generate interview questions, conduct mock interviews, and create personalized study plans.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
            {QUICK_ACTIONS.map((action, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all text-left group"
                onClick={() => handleSend(action.prompt)}
              >
                <div className="text-2xl mb-3">{action.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{action.title}</h3>
                <p className="text-xs text-slate-500">{action.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              
              {/* Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}>
                <div className={`prose max-w-none prose-p:leading-relaxed prose-pre:p-4 prose-pre:rounded-lg ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.intent && msg.role === 'assistant' && (
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">
                      {msg.intent.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && messages.length > 0 && messages[messages.length - 1].content === '' && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm bg-white border border-slate-200 shadow-sm">
                🤖
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 rounded-tl-none flex items-center h-[52px] shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className={`flex gap-2 items-end p-2 bg-slate-50 border rounded-2xl transition-all ${
          isRecording ? 'border-red-300 bg-red-50' : 'border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
        }`}>
          
          <button
            className={`p-3 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isRecording 
                ? 'bg-red-100 text-red-600 animate-pulse' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading && !isRecording}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
          </button>

          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent border-none text-slate-800 text-sm p-3 resize-none max-h-32 min-h-[48px] focus:outline-none placeholder:text-slate-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening to your voice..." : "Ask me anything about placement prep..."}
            rows={1}
            disabled={loading || isRecording}
          />
          
          <button
            className="p-3 rounded-xl bg-blue-600 text-white flex items-center justify-center transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
            onClick={() => handleSend()}
            disabled={(!input.trim() && !isRecording) || loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
      
    </div>
  );
}
