import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Target, Users, Shield, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click — must be before any conditional return
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Early return AFTER all hooks
  if (!user) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'My Sheet', icon: Target, roles: ['employee', 'manager', 'admin'] },
    { path: '/manager', label: 'Team', icon: Users, roles: ['manager', 'admin'] },
    { path: '/admin', label: 'Admin', icon: Shield, roles: ['admin'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <nav className="bg-[var(--n-bg-card)] border-b border-[var(--n-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          {/* Logomark */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative h-8 w-8 flex items-center justify-center">
              {/* Atom orbit SVG */}
              <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
                <circle cx="16" cy="16" r="3.5" fill="var(--n-primary)" />
                <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="var(--n-primary)" strokeWidth="1.2" opacity="0.4" transform="rotate(-30 16 16)" />
                <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="var(--n-primary)" strokeWidth="1.2" opacity="0.4" transform="rotate(30 16 16)" />
                <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="var(--n-primary)" strokeWidth="1.2" opacity="0.4" transform="rotate(90 16 16)" />
              </svg>
            </div>
            <span className="font-semibold text-[16px] tracking-tight text-[var(--n-text)]">
              Nucleus
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {visibleItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--n-radius-sm)] text-[14px] font-medium transition-all duration-[var(--n-transition)] ${
                    isActive
                      ? 'bg-[var(--n-primary-light)] text-[var(--n-primary)]'
                      : 'text-[var(--n-text-secondary)] hover:text-[var(--n-text)] hover:bg-[var(--n-bg-subtle)]'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: User */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-2 py-1 rounded-[var(--n-radius-sm)] hover:bg-[var(--n-bg-subtle)] transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-[var(--n-accent-light)] flex items-center justify-center text-[var(--n-accent)] font-semibold text-[13px]">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-medium text-[var(--n-text)] leading-tight">{user.name}</p>
              <p className="text-[11px] text-[var(--n-text-tertiary)] capitalize">{user.role}</p>
            </div>
            <ChevronDown size={14} className="text-[var(--n-text-tertiary)] hidden sm:block" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-[var(--n-bg-card)] border border-[var(--n-border)] rounded-[var(--n-radius-sm)] shadow-[var(--n-shadow-lg)] py-1 animate-fade-in z-50">
              <div className="px-3 py-2 border-b border-[var(--n-border)]">
                <p className="text-[13px] font-medium text-[var(--n-text)]">{user.name}</p>
                <p className="text-[12px] text-[var(--n-text-tertiary)]">{user.email}</p>
              </div>
              {/* Mobile nav items */}
              <div className="md:hidden border-b border-[var(--n-border)]">
                {visibleItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--n-text-secondary)] hover:bg-[var(--n-bg-subtle)] hover:text-[var(--n-text)] transition-colors"
                  >
                    <item.icon size={14} />
                    {item.label}
                  </Link>
                ))}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[var(--n-danger)] hover:bg-[var(--n-danger-light)] transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
