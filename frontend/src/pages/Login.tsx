import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { getDashboardRoute } from '../utils/roleUtils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    logout(); // Clear any stale/expired token

    try {
      let authData, authError;

      if (isSignUp) {
        const res = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role,
              department: 'Engineering' // default for testing
            }
          }
        });
        authData = res.data;
        authError = res.error;

        // If signup fails with a database trigger error, the auth user was
        // likely still created. Tell the user to sign in instead.
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
        const res = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        authData = res.data;
        authError = res.error;
        if (authError) throw authError;
      }

      if (authData?.session) {
        const token = authData.session.access_token;

        // Backend will auto-create user profile if it doesn't exist
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
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8] px-4">
      <Card className="max-w-md w-full !p-8 border-none shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Nucleus</h2>
        <p className="text-center text-gray-500 mb-8">
          {isSignUp ? 'Create a new account' : 'Sign in to your account'}
        </p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <>
              <Input
                label="Full Name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Select
                label="Role (For Testing)"
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Alert type={error.includes('email') && isSignUp ? 'info' : 'error'} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-6"
            size="lg"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button 
            variant="secondary"
            className="w-full border-none shadow-none text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
