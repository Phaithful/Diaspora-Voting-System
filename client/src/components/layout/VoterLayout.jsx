import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Vote, FileText, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

const VoterLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    { to: '/voter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/voter/ballot', label: 'Cast Vote', icon: Vote },
    { to: '/voter/receipt', label: 'Receipt', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/voter/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#008751] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">Vote.ng</span>
            <span className="text-xs text-gray-400 hidden sm:inline">Voter Portal</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-[#F0FBF4] text-[#008751]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            <button onClick={handleLogout} className="btn-ghost ml-2 text-gray-500 px-3 py-1.5">
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">{children}</main>
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        © 2027 INEC Vote.ng — Federal Republic of Nigeria
      </footer>
    </div>
  );
};

export default VoterLayout;
