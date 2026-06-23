import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, User, CreditCard, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import CoatOfArms from '../../components/logos/CoatOfArms';
import NINBadge from '../../components/logos/NINBadge';

const STEPS = ['Identity Verification', 'Personal Details', 'Account Setup'];

const FieldErr = ({ err }) => err ? <p className="text-xs text-red-500 mt-1">{err}</p> : null;

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    nin: '', pvc_number: '', full_name: '', email: '',
    date_of_birth: '', country_of_residence: '', passport_no: '',
    password: '', confirmPassword: '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const clearErr = (field) => setErrors((e) => ({ ...e, [field]: '' }));

  const validateStep = () => {
    const errs = {};
    if (step === 0) {
      if (!/^\d{11}$/.test(form.nin)) errs.nin = 'NIN must be exactly 11 digits';
      if (!form.pvc_number.trim()) errs.pvc_number = 'PVC number is required';
    }
    if (step === 1) {
      if (form.full_name.trim().length < 3) errs.full_name = 'Full name required';
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required';
      if (!form.country_of_residence.trim()) errs.country_of_residence = 'Country required';
    }
    if (step === 2) {
      if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      await api.post('/auth/register', {
        nin: form.nin, pvc_number: form.pvc_number, full_name: form.full_name,
        email: form.email, password: form.password,
        country_of_residence: form.country_of_residence,
        passport_no: form.passport_no || undefined,
        date_of_birth: form.date_of_birth || undefined,
      });
      toast.success('Registration successful! Please login.');
      navigate('/voter/login');
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.error || 'Registration failed. Check your connection and try again.';
      // Show the dev-mode detail if present (helps debug)
      const detail = data?.detail || '';
      // Show validation field errors if 422
      if (err.response?.status === 422 && data?.details?.length) {
        const fieldErrs = {};
        data.details.forEach(({ field, message }) => { fieldErrs[field] = message; });
        setErrors(fieldErrs);
        toast.error('Please fix the highlighted fields');
      } else {
        toast.error(detail ? `${msg}: ${detail}` : msg);
        if (msg.includes('NIN')) { setErrors({ nin: msg }); setStep(0); }
        else if (msg.includes('PVC')) { setErrors({ pvc_number: msg }); setStep(0); }
        else if (msg.includes('Email') || msg.includes('email')) { setErrors({ email: msg }); setStep(1); }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#008751] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">Vote.ng</span>
          </Link>
          <Link to="/voter/login" className="text-sm text-[#008751] font-medium hover:underline">Already registered?</Link>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10">
        <div className="text-center mb-8">
          <CoatOfArms size={48} className="mx-auto mb-3" />
          <h1 className="text-2xl font-semibold text-gray-900">Voter Registration</h1>
          <p className="text-sm text-gray-500 mt-1">2027 Nigerian Presidential Election — Diaspora Portal</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                i < step ? 'bg-[#008751] text-white' : i === step ? 'bg-[#008751] text-white ring-4 ring-[#008751]/20' : 'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <div className="ml-2 text-xs font-medium text-gray-600 hidden sm:block whitespace-nowrap">{label}</div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-[#008751]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="card">
          {/* Step 0: Identity */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <NINBadge size={50} />
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Identity Verification</h2>
                  <p className="text-xs text-gray-500">Enter your NIN and PVC as issued by NIMC/INEC</p>
                </div>
              </div>
              <div>
                <label className="label">National Identification Number (NIN) *</label>
                <input className={`input ${errors.nin ? 'input-error' : ''}`} value={form.nin} onChange={set('nin')} onFocus={() => clearErr('nin')} placeholder="11-digit NIN e.g. 12345678901" maxLength={11} />
                <FieldErr err={errors.nin} />
              </div>
              <div>
                <label className="label">Permanent Voter's Card (PVC) Number *</label>
                <input className={`input ${errors.pvc_number ? 'input-error' : ''}`} value={form.pvc_number} onChange={set('pvc_number')} onFocus={() => clearErr('pvc_number')} placeholder="e.g. PVC/LG/001/2027" />
                <FieldErr err={errors.pvc_number} />
              </div>
              <div className="bg-[#F0FBF4] rounded-lg p-3 text-xs text-[#006B3F]">
                Your NIN and PVC are verified against the INEC voter register. Each NIN and PVC can only be used once.
              </div>
            </div>
          )}

          {/* Step 1: Personal */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Personal Details</h2>
              <div>
                <label className="label">Full Name (as on NIN slip) *</label>
                <input className={`input ${errors.full_name ? 'input-error' : ''}`} value={form.full_name} onChange={set('full_name')} placeholder="Surname Firstname Othername" />
                <FieldErr err={errors.full_name} />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={set('email')} placeholder="your@email.com" />
                <FieldErr err={errors.email} />
                <p className="text-xs text-gray-400 mt-1">OTP verification codes will be sent here</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date of Birth</label>
                  <input type="date" className="input" value={form.date_of_birth} onChange={set('date_of_birth')} />
                </div>
                <div>
                  <label className="label">Passport Number</label>
                  <input className="input" value={form.passport_no} onChange={set('passport_no')} placeholder="A12345678" />
                </div>
              </div>
              <div>
                <label className="label">Country of Residence *</label>
                <select className={`input ${errors.country_of_residence ? 'input-error' : ''}`} value={form.country_of_residence} onChange={set('country_of_residence')}>
                  <option value="">Select country...</option>
                  {['United Kingdom', 'United States', 'United Arab Emirates', 'Canada', 'Germany', 'France', 'Italy', 'Ireland', 'South Africa', 'Australia', 'Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <FieldErr err={errors.country_of_residence} />
              </div>
            </div>
          )}

          {/* Step 2: Account */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Create Account</h2>
              <div>
                <label className="label">Password *</label>
                <input type="password" className={`input ${errors.password ? 'input-error' : ''}`} value={form.password} onChange={set('password')} placeholder="Minimum 8 characters" />
                <FieldErr err={errors.password} />
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input type="password" className={`input ${errors.confirmPassword ? 'input-error' : ''}`} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat your password" />
                <FieldErr err={errors.confirmPassword} />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-700">Registration Summary</p>
                <p>NIN: {form.nin}</p>
                <p>PVC: {form.pvc_number}</p>
                <p>Name: {form.full_name}</p>
                <p>Email: {form.email}</p>
                <p>Country: {form.country_of_residence}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            {step > 0 ? (
              <button onClick={back} className="btn-ghost">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <Link to="/voter/login" className="btn-ghost text-gray-500">
                <ChevronLeft className="w-4 h-4" /> Login
              </Link>
            )}
            {step < 2 ? (
              <button onClick={next} className="btn-primary">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={submit} disabled={loading} className="btn-primary">
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/voter/login" className="text-[#008751] font-medium hover:underline">Sign in here</Link>
        </p>
      </main>
    </div>
  );
};

export default Register;
