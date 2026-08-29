import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Target, LogOut, Menu, X, Video, Briefcase, Users } from 'lucide-react';
import { useState, useMemo } from 'react';

// Derives initials from a full name string
function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MainLayout({ user, userProfile, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('user');
    onLogout();
    navigate('/auth');
  };

  const navItems = [
    { path: '/',           icon: Home,          label: 'Dashboard' },
    { path: '/interview',  icon: Video,         label: 'Mock Interview' },
    { path: '/chat',       icon: MessageSquare, label: 'AI Prep Agent' },
    { path: '/roadmap',    icon: Target,        label: 'Study Roadmap' },
    { path: '/jobs',       icon: Briefcase,     label: 'Job Match' },
    { path: '/recruiter',  icon: Users,         label: 'Recruiter View' },
  ];

  // Real user data
  const userName  = user?.full_name || userProfile?.targetRole || 'User';
  const userEmail = user?.email || '';
  const initials  = useMemo(() => getInitials(userName), [userName]);
  const targetRole = userProfile?.targetRole || '';

  return (
    <div className="flex h-screen bg-slate-50">

      {/* ── Mobile Menu Toggle ── */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200
          flex flex-col transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:flex
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">PrepAI</h1>
              <p className="text-xs text-slate-400 mt-0.5">Placement Agent</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-blue-600' : 'text-slate-400'}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
            <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
              {targetRole && (
                <p className="text-xs text-slate-500 truncate">{targetRole}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-red-500" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
          {/* Left spacer for mobile hamburger */}
          <div className="w-8 lg:hidden" />

          {/* Page breadcrumb */}
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-slate-700">
              {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </p>
          </div>

          {/* Right: user chip */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm border border-blue-200">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-none">{userName}</p>
                {userEmail && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">{userEmail}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50">
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
