import { useState, useRef, useEffect } from 'react';
import { sendMessageStream, transcribeAudio } from '../services/api.js';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize, Play } from 'lucide-react';

export default function InterviewPage() {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [isAITalking, setIsAITalking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("Click 'Start Interview' when you are ready.");
  const [aiMessage, setAiMessage] = useState("");
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Initialize Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: cameraActive, 
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Mute audio track initially if mic is off
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = micActive;
      }
    } catch (err) {
      console.error("Camera/Mic access denied", err);
      setTranscript("Please allow camera and microphone access to start the interview.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraActive;
        setCameraActive(!cameraActive);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micActive;
        setMicActive(!micActive);
      }
    }
  };

  const startInterview = () => {
    setIsInterviewActive(true);
    handleSend("Hi, I'm ready to start the interview.");
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setTranscript("Interview ended. Good job!");
    window.speechSynthesis.cancel();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
  };

  const speakText = (text) => {
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    
    utterance.onstart = () => setIsAITalking(true);
    utterance.onend = () => {
      setIsAITalking(false);
      // Automatically start listening after AI finishes speaking
      startListening();
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Listen to user
  const startListening = () => {
    if (!streamRef.current || !micActive || !isInterviewActive) return;
    
    setTranscript("Listening...");
    const audioStream = new MediaStream(streamRef.current.getAudioTracks());
    const mediaRecorder = new MediaRecorder(audioStream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      setLoading(true);
      setTranscript("Processing...");
      try {
        const data = await transcribeAudio(audioBlob);
        if (data.text) {
          setTranscript(`You: "${data.text}"`);
          handleSend(data.text);
        } else {
          setTranscript("Could not hear you properly. Please try again.");
          setLoading(false);
          if (isInterviewActive) startListening(); // Retry
        }
      } catch (error) {
        console.error("Transcription error", error);
        setTranscript("Error processing audio.");
        setLoading(false);
      }
    };

    mediaRecorder.start();
    
    // Stop recording after 10 seconds of silence/speech max for turn taking
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    }, 10000); 
  };

  const handleSend = async (text) => {
    setLoading(true);
    let fullResponse = "";
    
    await sendMessageStream(
      text,
      null, 
      (chunk) => {
        fullResponse += chunk;
        setAiMessage(fullResponse);
      },
      (data) => {
        setLoading(false);
        speakText(fullResponse);
      },
      (err) => {
        setLoading(false);
        setTranscript("Error: " + err.message);
      }
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] w-full flex flex-col lg:flex-row gap-6">
      
      {/* Video Area (Main) */}
      <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden relative shadow-lg flex flex-col">
        
        {/* User Camera */}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-opacity duration-300 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Camera Off Placeholder */}
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <VideoOff size={48} className="mb-4" />
            <p>Camera is turned off</p>
          </div>
        )}

        {/* Overlay AI Avatar (PIP Style) */}
        <div className={`absolute top-6 right-6 w-32 md:w-48 aspect-[3/4] bg-slate-800 rounded-2xl border-2 shadow-2xl overflow-hidden flex items-center justify-center transition-colors duration-300 ${isAITalking ? 'border-indigo-500 shadow-indigo-500/50' : 'border-slate-700'}`}>
           <div className="text-center">
             <div className="text-4xl md:text-6xl mb-2">🤖</div>
             {isAITalking && (
               <div className="flex gap-1 justify-center mt-2 h-4 items-end">
                 <span className="w-1.5 bg-indigo-400 rounded-full animate-[pulse_1s_ease-in-out_infinite] h-full"></span>
                 <span className="w-1.5 bg-indigo-400 rounded-full animate-[pulse_1.2s_ease-in-out_infinite_0.2s] h-2/3"></span>
                 <span className="w-1.5 bg-indigo-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s] h-full"></span>
               </div>
             )}
           </div>
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-4">
          <button 
            onClick={toggleMic}
            className={`p-4 rounded-full transition-colors ${micActive ? 'bg-slate-700/80 text-white hover:bg-slate-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
          >
            {micActive ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          {!isInterviewActive ? (
            <button 
              onClick={startInterview}
              className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/30"
            >
              <Play size={20} fill="currentColor" /> Start Interview
            </button>
          ) : (
            <button 
              onClick={endInterview}
              className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
            >
              <PhoneOff size={24} />
            </button>
          )}

          <button 
            onClick={toggleCamera}
            className={`p-4 rounded-full transition-colors ${cameraActive ? 'bg-slate-700/80 text-white hover:bg-slate-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
          >
            {cameraActive ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
        </div>
      </div>

      {/* Side Panel (Live Captions & Feedback) */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex-1 flex flex-col">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-indigo-600">💬</span> Live Interview Transcript
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 text-sm">
            {/* AI Message */}
            {aiMessage && (
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl rounded-tl-none">
                <p className="text-indigo-900 font-semibold mb-1">AI Interviewer</p>
                <p className="text-indigo-800 leading-relaxed">{aiMessage}</p>
              </div>
            )}
          </div>

          {/* User Status / Status Text */}
          <div className="mt-4 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : isInterviewActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
               <p className="text-sm font-medium text-slate-600 italic">
                 {transcript}
               </p>
             </div>
          </div>
        </div>

      </div>

    </div>
  );
}
