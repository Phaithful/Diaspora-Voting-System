import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, LogOut, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const OfficerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/officer/login');
  };

  const navLinks = [
    { to: '/officer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#008751] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">Vote.ng</span>
            <span className="text-xs text-[#008751] px-2 py-0.5 bg-[#F0FBF4] rounded-full">Officer</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:inline">{user?.full_name}</span>
            <button onClick={handleLogout} className="btn-ghost px-3 py-1.5 text-gray-500">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">{children}</main>
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        © 2027 INEC Vote.ng — Polling Officer Console
      </footer>
    </div>
  );
};

export default OfficerLayout;
