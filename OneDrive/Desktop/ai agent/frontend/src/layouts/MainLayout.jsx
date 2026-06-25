import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, LayoutDashboard, Target, LogOut, Bell, Search, Menu, X, Video } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/interview', icon: Video, label: 'Video Interview' },
    { path: '/chat', icon: MessageSquare, label: 'AI Prep Agent' },
    { path: '/onboarding', icon: LayoutDashboard, label: 'My Resume' },
    { path: '/roadmap', icon: Target, label: 'Study Roadmap' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm">🎯</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">PrepAI</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} className={isActive ? "text-blue-600" : "text-slate-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <LogOut size={20} className="text-slate-400 group-hover:text-red-500" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-4 lg:hidden ml-10">
            {/* Space for mobile menu button */}
          </div>
          
          <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search features..." 
              className="bg-transparent border-none outline-none ml-2 text-sm w-full text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm border border-blue-200">
                JD
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-700">John Doe</p>
                <p className="text-xs text-slate-500">Student</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
