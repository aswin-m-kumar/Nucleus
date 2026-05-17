import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { getDashboardRoute } from '../utils/roleUtils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Alert } from '../components/ui/Alert';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    logout();

    try {
      let authData, authError;

      if (isSignUp) {
        const res = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, role, department: 'Engineering' }
          }
        });
        authData = res.data;
        authError = res.error;

        if (authError) {
          const msg = authError.message || '';
          if (msg.toLowerCase().includes('database') || msg.toLowerCase().includes('trigger')) {
            setError("Account created! Please switch to Sign In and log in with your credentials.");
            setLoading(false);
            return;
          }
          throw authError;
        }

        if (!authData.session) {
          setError("Check your email for the confirmation link, then come back and Sign In!");
          setLoading(false);
          return;
        }
      } else {
        const res = await supabase.auth.signInWithPassword({ email, password });
        authData = res.data;
        authError = res.error;
        if (authError) throw authError;
      }

      if (authData?.session) {
        const token = authData.session.access_token;
        const response = await apiClient.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAuth(response.data, token);
        navigate(getDashboardRoute(response.data.role));
      }
    } catch (err: any) {
      const backendError = err.response?.data?.detail;
      setError(backendError || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden bg-[var(--n-bg)]">
        {/* Subtle radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--n-primary-light)_0%,transparent_60%)] opacity-60" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(var(--n-text-tertiary) 1px, transparent 1px), linear-gradient(90deg, var(--n-text-tertiary) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          {/* Atom logomark */}
          <svg viewBox="0 0 100 100" className="w-28 h-28 mb-8" aria-hidden="true">
            <circle cx="50" cy="50" r="10" fill="var(--n-primary)" />
            <ellipse cx="50" cy="50" rx="44" ry="16" fill="none" stroke="var(--n-primary)" strokeWidth="1.5" opacity="0.3" transform="rotate(-30 50 50)" />
            <ellipse cx="50" cy="50" rx="44" ry="16" fill="none" stroke="var(--n-primary)" strokeWidth="1.5" opacity="0.3" transform="rotate(30 50 50)" />
            <ellipse cx="50" cy="50" rx="44" ry="16" fill="none" stroke="var(--n-primary)" strokeWidth="1.5" opacity="0.3" transform="rotate(90 50 50)" />
            {/* Orbiting electrons */}
            <circle cx="50" cy="34" r="2.5" fill="var(--n-primary)" opacity="0.6" />
            <circle cx="72" cy="58" r="2.5" fill="var(--n-secondary)" opacity="0.6" />
            <circle cx="28" cy="58" r="2.5" fill="var(--n-accent)" opacity="0.6" />
          </svg>

          <h1 className="text-[36px] font-semibold text-[var(--n-text)] tracking-tight mb-3">
            Nucleus
          </h1>
          <p className="text-[15px] text-[var(--n-text-secondary)] leading-relaxed max-w-sm">
            Core of the organization.
            <br />
            <span className="text-[var(--n-text-tertiary)]">Everything revolves around it.</span>
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--n-bg-card)]">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
              <circle cx="16" cy="16" r="3.5" fill="var(--n-primary)" />
              <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="var(--n-primary)" strokeWidth="1.2" opacity="0.4" transform="rotate(-30 16 16)" />
              <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="var(--n-primary)" strokeWidth="1.2" opacity="0.4" transform="rotate(30 16 16)" />
              <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="var(--n-primary)" strokeWidth="1.2" opacity="0.4" transform="rotate(90 16 16)" />
            </svg>
            <span className="font-semibold text-[18px] text-[var(--n-text)]">Nucleus</span>
          </div>

          <h2 className="text-[24px] font-semibold text-[var(--n-text)] mb-1">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="text-[14px] text-[var(--n-text-tertiary)] mb-8">
            {isSignUp ? 'Get started with Nucleus' : 'Sign in to your workspace'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Select
                  label="Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  options={[
                    { label: 'Employee', value: 'employee' },
                    { label: 'Manager', value: 'manager' },
                    { label: 'Admin', value: 'admin' },
                  ]}
                />
              </>
            )}

            <Input
              label="Email"
              type="email"
              required
              placeholder="you@atomberg.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <Alert
                type={error.includes('email') && isSignUp ? 'info' : 'error'}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="lg"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              className="text-[14px] text-[var(--n-text-tertiary)] hover:text-[var(--n-primary)] transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
