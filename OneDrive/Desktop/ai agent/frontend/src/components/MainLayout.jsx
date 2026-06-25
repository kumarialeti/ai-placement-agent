import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Briefcase, User, LogOut } from 'lucide-react';

const MainLayout = ({ userProfile, onLogout }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Mock Interview', path: '/interview', icon: Briefcase },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-bg-primary text-gray-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-bg-secondary border-r border-gray-800 flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg">
            <span className="font-bold text-lg text-white">AI</span>
          </div>
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
            Placement Prep
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
            Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-primary/20 text-accent-secondary border-l-4 border-accent-primary'
                    : 'text-gray-400 hover:bg-bg-card hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-bg-card border border-gray-800">
            <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-secondary font-bold">
              {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold truncate">{userProfile?.name || 'User'}</div>
              <div className="text-xs text-gray-400 truncate">{userProfile?.targetRole || 'Student'}</div>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-y-auto bg-bg-primary">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
