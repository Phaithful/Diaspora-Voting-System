import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, ScanFace } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import CoatOfArms from '../../components/logos/CoatOfArms';
import INECLogo from '../../components/logos/INECLogo';

const FaceScanner = ({ onVerified }) => {
  const [scanPhase, setScanPhase] = useState('requesting'); // 'requesting' | 'aligning' | 'scanning' | 'verified' | 'denied'
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera on mount
  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setScanPhase('aligning');
      })
      .catch((err) => {
        if (cancelled) return;
        setCameraError(err.name === 'NotAllowedError' ? 'Camera permission denied.' : 'Camera not available.');
        setScanPhase('denied');
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // All phase transitions in one effect so cleanup never cancels the wrong timer
  useEffect(() => {
    let timer;
    if (scanPhase === 'aligning') {
      timer = setTimeout(() => setScanPhase('scanning'), 2000);
    } else if (scanPhase === 'scanning') {
      timer = setTimeout(() => setScanPhase('verified'), 2800);
    } else if (scanPhase === 'verified') {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      timer = setTimeout(() => onVerified(), 900);
    }
    return () => clearTimeout(timer);
  }, [scanPhase, onVerified]);

  const borderColor =
    scanPhase === 'verified' ? '#008751'
    : scanPhase === 'scanning' ? '#f59e0b'
    : scanPhase === 'denied' ? '#ef4444'
    : '#6b7280';

  const label =
    scanPhase === 'requesting' ? 'Accessing camera…'
    : scanPhase === 'aligning' ? 'Position your face in the frame'
    : scanPhase === 'scanning' ? 'Scanning biometrics…'
    : scanPhase === 'verified' ? 'Face Verified!'
    : cameraError;

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="relative w-56 h-56 rounded-2xl overflow-hidden bg-gray-900">
        {/* Live webcam feed */}
        <video
          ref={videoRef}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          style={{ opacity: scanPhase === 'denied' || scanPhase === 'requesting' ? 0 : 1 }}
        />

        {/* Dark overlay when not yet streaming */}
        {(scanPhase === 'requesting' || scanPhase === 'denied') && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            {scanPhase === 'denied'
              ? <ScanFace className="w-16 h-16 text-red-400" strokeWidth={1} />
              : <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin" />}
          </div>
        )}

        {/* Green tint flash on verified */}
        {scanPhase === 'verified' && (
          <div className="absolute inset-0 bg-[#008751]/30 flex items-center justify-center">
            <CheckCircle className="w-20 h-20 text-white drop-shadow-lg" strokeWidth={1.5} />
          </div>
        )}

        {/* Scan line */}
        {scanPhase === 'scanning' && (
          <div className="absolute inset-x-0 h-0.5 bg-amber-400/80 shadow-[0_0_8px_2px_rgba(251,191,36,0.6)] animate-scan" />
        )}

        {/* Corner brackets (on top of video) */}
        {[['top-2 left-2', 'border-t-2 border-l-2 rounded-tl-md'],
          ['top-2 right-2', 'border-t-2 border-r-2 rounded-tr-md'],
          ['bottom-2 left-2', 'border-b-2 border-l-2 rounded-bl-md'],
          ['bottom-2 right-2', 'border-b-2 border-r-2 rounded-br-md']].map(([pos, cls], i) => (
          <div
            key={i}
            className={`absolute ${pos} w-6 h-6 ${cls} transition-colors duration-500`}
            style={{ borderColor }}
          />
        ))}

        {/* Pulse ring overlay on verified */}
        {scanPhase === 'verified' && (
          <div className="absolute inset-4 rounded-full border-2 border-white/50 animate-ping" />
        )}
      </div>

      {/* Dot indicators */}
      <div className="flex gap-2">
        {['aligning', 'scanning', 'verified'].map((p) => (
          <div
            key={p}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{ background: scanPhase === p || (p === 'aligning' && scanPhase !== 'aligning' && scanPhase !== 'requesting') || (p === 'scanning' && scanPhase === 'verified') ? borderColor : '#d1d5db' }}
          />
        ))}
      </div>

      <p className="text-sm font-medium transition-colors duration-300" style={{ color: borderColor }}>{label}</p>

      <p className="text-xs text-gray-400 text-center max-w-xs">
        Keep your face centred and ensure good lighting for accurate biometric verification.
      </p>
    </div>
  );
};

const VoterLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [stage, setStage] = useState('credentials'); // 'credentials' | 'otp' | 'faceid'
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [pendingAuth, setPendingAuth] = useState(null); // holds { user, accessToken } between OTP and face scan

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/login', { email, password });
      setStage('otp');
      toast.success('OTP sent to your email address');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
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
      setPendingAuth({ user: data.user, accessToken: data.accessToken });
      setStage('faceid');
      toast.success('OTP verified — Face ID check required');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleFaceVerified = () => {
    if (!pendingAuth) return;
    login(pendingAuth.user, pendingAuth.accessToken);
    toast.success(`Welcome, ${pendingAuth.user.full_name || pendingAuth.user.email}!`);
    navigate('/voter/dashboard');
  };

  const subtitles = {
    credentials: 'Enter your registered credentials',
    otp: 'Enter the 6-digit OTP sent to your email',
    faceid: 'Biometric Face ID Verification',
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
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <INECLogo size={44} />
              <CoatOfArms size={52} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Voter Sign In</h1>
            <p className="text-sm text-gray-500 mt-1">{subtitles[stage]}</p>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {['credentials', 'otp', 'faceid'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  s === stage ? 'bg-[#008751] scale-125' : ['credentials', 'otp', 'faceid'].indexOf(stage) > i ? 'bg-[#008751]' : 'bg-gray-300'
                }`} />
                {i < 2 && <div className={`w-8 h-px ${['credentials', 'otp', 'faceid'].indexOf(stage) > i ? 'bg-[#008751]' : 'bg-gray-300'}`} />}
              </div>
            ))}
          </div>

          <div className="card">
            {stage === 'credentials' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required autoFocus />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
                </div>
                {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Verifying...' : 'Continue to OTP Verification'}
                </button>
              </form>
            )}

            {stage === 'otp' && (
              <form onSubmit={handleOTP} className="space-y-4">
                <div className="bg-[#F0FBF4] rounded-lg p-3 flex items-start gap-2 text-sm">
                  <Shield className="w-4 h-4 text-[#008751] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#006B3F] font-medium">Check your email</p>
                    <p className="text-[#008751] text-xs mt-0.5">A 6-digit code was sent to <strong>{email}</strong>. Valid for 10 minutes.</p>
                  </div>
                </div>
                <div>
                  <label className="label">OTP Verification Code</label>
                  <input
                    className="input text-center text-2xl font-semibold tracking-[0.5em] py-3"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-1">Maximum 3 attempts before lockout</p>
                </div>
                {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full">
                  {loading ? 'Verifying OTP...' : 'Verify & Continue to Face ID'}
                </button>
                <button type="button" onClick={() => { setStage('credentials'); setOtp(''); setError(''); }} className="w-full text-sm text-gray-500 hover:text-gray-700 py-1">
                  ← Back to credentials
                </button>
              </form>
            )}

            {stage === 'faceid' && (
              <div className="space-y-4">
                <div className="bg-[#F0FBF4] rounded-lg p-3 flex items-start gap-2 text-sm">
                  <Shield className="w-4 h-4 text-[#008751] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#006B3F] font-medium">Step 3 of 3 — Biometric Verification</p>
                    <p className="text-[#008751] text-xs mt-0.5">Your face will be matched against your registered biometric data.</p>
                  </div>
                </div>
                <FaceScanner onVerified={handleFaceVerified} />
              </div>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Not registered yet?{' '}
            <Link to="/voter/register" className="text-[#008751] font-medium hover:underline">Create an account</Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            <Link to="/officer/login" className="text-gray-400 hover:text-gray-600">Officer Login</Link>
            {' · '}
            <Link to="/admin/login" className="text-gray-400 hover:text-gray-600">Admin Login</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default VoterLogin;
