import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

const OfficerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [stage, setStage] = useState('credentials');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/login', { email, password });
      setStage('otp');
      toast.success('OTP sent to your email');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      if (data.user.role !== 'OFFICER') {
        setError('This portal is for polling officers only.');
        return;
      }
      login(data.user, data.accessToken);
      toast.success('Welcome, Officer ' + data.user.full_name?.split(' ')[0]);
      navigate('/officer/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#008751] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">Vote.ng</span>
          </Link>
          <span className="text-xs text-blue-600 px-2 py-0.5 bg-blue-50 rounded-full font-medium">Officer Portal</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Officer Sign In</h1>
            <p className="text-sm text-gray-500 mt-1">Polling Officer Console — INEC Vote.ng</p>
          </div>

          <div className="card">
            {stage === 'credentials' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Officer Email</label>
                  <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="officer@vote.ng" required autoFocus />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full" style={{ background: '#2563EB' }}>
                  {loading ? 'Verifying...' : 'Continue'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTP} className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                  A 6-digit OTP was sent to <strong>{email}</strong>
                </div>
                <div>
                  <label className="label">OTP Code</label>
                  <input
                    className="input text-center text-2xl font-semibold tracking-[0.5em] py-3"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required autoFocus
                  />
                </div>
                {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full" style={{ background: '#2563EB' }}>
                  {loading ? 'Verifying...' : 'Sign In'}
                </button>
                <button type="button" onClick={() => { setStage('credentials'); setOtp(''); setError(''); }} className="w-full text-sm text-gray-500 py-1">
                  ← Back
                </button>
              </form>
            )}
          </div>

          <div className="text-center mt-4 space-y-1">
            <p className="text-xs text-gray-400">
              <Link to="/voter/login" className="hover:text-gray-600">Voter Login</Link>
              {' · '}
              <Link to="/admin/login" className="hover:text-gray-600">Admin Login</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OfficerLogin;
