import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Vote, Users, BarChart2, FileText, LogOut, Settings, AlertCircle, Building
} from 'lucide-react';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/elections', label: 'Elections', icon: Vote },
  { to: '/admin/candidates', label: 'Candidates', icon: Users },
  { to: '/admin/voters', label: 'Voters', icon: Users },
  { to: '/admin/results', label: 'Results', icon: BarChart2 },
  { to: '/admin/audit-log', label: 'Audit Log', icon: FileText },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#008751] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm leading-none">Vote.ng</div>
              <div className="text-xs text-[#008751] mt-0.5">Admin Portal</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname.startsWith(to)
                  ? 'bg-[#F0FBF4] text-[#008751]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200">
          <div className="px-3 py-2 mb-1">
            <div className="text-xs font-medium text-gray-900 truncate">{user?.full_name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.email}</div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 ml-56 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
