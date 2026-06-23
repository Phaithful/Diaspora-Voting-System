import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ProtectedRoute from './components/ui/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import PublicResults from './pages/PublicResults';
import NotFound from './pages/NotFound';

// Voter
import Register from './pages/voter/Register';
import VoterLogin from './pages/voter/Login';
import VoterDashboard from './pages/voter/Dashboard';
import Ballot from './pages/voter/Ballot';
import Receipt from './pages/voter/Receipt';

// Officer
import OfficerLogin from './pages/officer/Login';
import OfficerDashboard from './pages/officer/Dashboard';

// Admin
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Elections from './pages/admin/Elections';
import Candidates from './pages/admin/Candidates';
import Voters from './pages/admin/Voters';
import AdminResults from './pages/admin/Results';
import AuditLogPage from './pages/admin/AuditLog';

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'OFFICER') return <Navigate to="/officer/dashboard" replace />;
  return <Navigate to="/voter/dashboard" replace />;
};

const App = () => (
  <ErrorBoundary>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', borderRadius: '8px' },
        success: { iconTheme: { primary: '#008751', secondary: '#fff' } },
      }}
    />
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/results" element={<PublicResults />} />

      {/* Voter portal */}
      <Route path="/voter/register" element={<Register />} />
      <Route path="/voter/login" element={<VoterLogin />} />
      <Route path="/voter/dashboard" element={<ProtectedRoute role="VOTER"><VoterDashboard /></ProtectedRoute>} />
      <Route path="/voter/ballot" element={<ProtectedRoute role="VOTER"><Ballot /></ProtectedRoute>} />
      <Route path="/voter/receipt" element={<ProtectedRoute role="VOTER"><Receipt /></ProtectedRoute>} />

      {/* Officer portal */}
      <Route path="/officer/login" element={<OfficerLogin />} />
      <Route path="/officer/dashboard" element={<ProtectedRoute role="OFFICER"><OfficerDashboard /></ProtectedRoute>} />

      {/* Admin portal */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/elections" element={<ProtectedRoute role="ADMIN"><Elections /></ProtectedRoute>} />
      <Route path="/admin/candidates" element={<ProtectedRoute role="ADMIN"><Candidates /></ProtectedRoute>} />
      <Route path="/admin/voters" element={<ProtectedRoute role="ADMIN"><Voters /></ProtectedRoute>} />
      <Route path="/admin/results" element={<ProtectedRoute role="ADMIN"><AdminResults /></ProtectedRoute>} />
      <Route path="/admin/audit-log" element={<ProtectedRoute role="ADMIN"><AuditLogPage /></ProtectedRoute>} />

      {/* Redirects */}
      <Route path="/voter" element={<Navigate to="/voter/login" replace />} />
      <Route path="/officer" element={<Navigate to="/officer/login" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/dashboard" element={<RoleRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </ErrorBoundary>
);

export default App;
