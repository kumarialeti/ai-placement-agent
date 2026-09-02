import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api.js';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export default function AuthPage({ onLogin }) {
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
        onLogin(data.access_token, data.user);
        navigate('/');
      } else {
        await register(email, username, password, fullName);
        const data = await login(email, password);
        onLogin(data.access_token, data.user);
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface-muted">
      
      {/* Left Side / Brand Panel */}
      <div className="hidden md:flex w-full md:w-1/2 bg-primary-900 flex-col justify-center items-start p-12 lg:p-24 relative overflow-hidden">
        {/* Subtle background patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        
        <div className="relative z-10 w-full max-w-lg text-white">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-900 text-xl font-bold">P</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">PrepAI</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-white">
            Nail your next interview with AI.
          </h1>
          <p className="text-primary-100 text-lg max-w-md leading-relaxed">
            Get personalized mock interviews, ATS resume scoring, and AI-driven study roadmaps to land your dream job faster.
          </p>
        </div>
      </div>

      {/* Right Side / Form Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-surface relative">
        <div className="w-full max-w-md">
          
          <div className="md:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-subtle">
              <span className="text-white text-xl font-bold">P</span>
            </div>
            <span className="text-2xl font-bold text-text-main">PrepAI</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-text-main mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-text-muted">
              {isLogin ? 'Enter your details to access your dashboard.' : 'Start your prep journey for free.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 border border-red-100 animate-fade-in">
                <span className="font-semibold shrink-0">Error:</span> 
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full bg-surface-muted border border-surface-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-text-main placeholder:text-slate-400"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">Username</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full bg-surface-muted border border-surface-border rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-text-main placeholder:text-slate-400"
                      placeholder="johndoe123"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full bg-surface border border-surface-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-text-main placeholder:text-slate-400"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-surface border border-surface-border rounded-xl pl-4 pr-11 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-text-main placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-between items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-surface-border text-primary-600 focus:ring-primary-500 w-4 h-4" />
                  <span className="text-sm text-text-muted">Remember me</span>
                </label>
                <button type="button" className="text-primary-600 font-medium text-sm hover:text-primary-700">
                  Forgot password?
                </button>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-subtle flex justify-center items-center"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  isLogin ? 'Sign in' : 'Create account'
                )}
              </button>
            </div>
            
            <div className="text-center text-sm text-text-muted pt-4">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
