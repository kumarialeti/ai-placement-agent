import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center animate-fade-in">
      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-4xl">
        🔍
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Page not found</h1>
      <p className="text-slate-500 mb-8 max-w-sm">
        The page you're looking for doesn't exist or was moved.
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          <Home size={18} /> Go to Dashboard
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={18} /> Go Back
        </button>
      </div>
    </div>
  );
}
