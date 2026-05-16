import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { LogOut, Target, Users, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'My Goals', icon: Target, roles: ['employee', 'manager', 'admin'] },
    { path: '/manager', label: 'Team Review', icon: Users, roles: ['manager', 'admin'] },
    { path: '/admin', label: 'Admin', icon: Shield, roles: ['admin'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo + Nav Links */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="font-bold text-lg text-slate-900 tracking-tight">
            Nu<span className="text-blue-600">cleus</span>
          </Link>
          <div className="flex items-center gap-1">
            {visibleItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{user.role}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
