import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api.js';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export default function AuthPage({ setIsAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await login(email, password);
        localStorage.setItem('token', data.access_token);
        setIsAuthenticated(true);
        navigate('/');
      } else {
        await register(email, username, password, fullName);
        const data = await login(email, password);
        localStorage.setItem('token', data.access_token);
        setIsAuthenticated(true);
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* Left Side / Brand Panel */}
      <div className="w-full md:w-1/2 bg-indigo-500 flex flex-col justify-center items-center p-8 md:p-16 relative overflow-hidden rounded-b-3xl md:rounded-b-none md:rounded-r-[3rem] shadow-2xl z-10">
        
        {/* Simple decorative circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-indigo-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-md text-white text-center md:text-left">
          <button className="text-white/80 hover:text-white mb-10 flex items-center gap-1 font-medium transition-colors">
            <span className="text-xl">{'<'}</span> Back
          </button>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-12">
            Empower Your Employment Journey
          </h1>

          {/* Illustration Placeholder (mimicking the screenshot) */}
          <div className="relative w-full max-w-sm mx-auto aspect-square bg-indigo-400/20 rounded-full flex items-center justify-center p-8 border border-white/10">
             <div className="text-8xl">🚀</div>
             {/* Decorative small elements */}
             <div className="absolute top-10 right-10 w-4 h-4 bg-yellow-400 rounded-sm transform rotate-12"></div>
             <div className="absolute bottom-20 left-10 w-6 h-2 bg-emerald-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side / Form Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 bg-slate-50">
        <div className="w-full max-w-md">
          
          {/* Mock Logos matching the reference structure */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-indigo-600">🎯 PrepAI</span>
            </div>
            <div className="h-10 w-px bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 border-2 border-orange-500 rounded-full flex items-center justify-center text-orange-500 font-bold text-xl">A</div>
              <span className="font-bold text-orange-600 leading-tight">ADITYA<br/>UNIVERSITY</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}

            {!isLogin && (
              <>
                <div className="relative border-b-2 border-indigo-600/30 focus-within:border-indigo-600 transition-colors pb-1">
                  <div className="absolute left-0 bottom-2 text-indigo-600">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full bg-transparent border-none pl-8 pr-4 py-2 focus:outline-none text-slate-900 placeholder:text-slate-900/60"
                    placeholder="Full Name*"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="relative border-b-2 border-indigo-600/30 focus-within:border-indigo-600 transition-colors pb-1">
                  <div className="absolute left-0 bottom-2 text-indigo-600">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full bg-transparent border-none pl-8 pr-4 py-2 focus:outline-none text-slate-900 placeholder:text-slate-900/60"
                    placeholder="Username*"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Material Style Underline Input */}
            <div className="relative border-b-2 border-indigo-600/30 focus-within:border-indigo-600 transition-colors pb-1">
              <div className="absolute left-0 bottom-2 text-indigo-600">
                <User size={20} />
              </div>
              <input
                type="email"
                required
                className="w-full bg-transparent border-none pl-8 pr-4 py-2 focus:outline-none text-slate-900 placeholder:text-slate-900/60"
                placeholder="Email id*"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="relative border-b-2 border-indigo-600/30 focus-within:border-indigo-600 transition-colors pb-1">
              <div className="absolute left-0 bottom-2 text-indigo-600">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full bg-transparent border-none pl-8 pr-10 py-2 focus:outline-none text-slate-900 placeholder:text-slate-900/60"
                placeholder="Password*"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="absolute right-0 bottom-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {isLogin && (
              <div className="flex justify-end pt-2">
                <button type="button" className="text-indigo-600 text-sm hover:underline">
                  Forgot Password?
                </button>
              </div>
            )}

            <div className="pt-6 flex flex-col items-center gap-6">
              <button
                type="submit"
                disabled={loading}
                className="w-48 py-3 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
              
              <div className="text-sm text-slate-500">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  {isLogin ? 'Register' : 'Sign in'}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
