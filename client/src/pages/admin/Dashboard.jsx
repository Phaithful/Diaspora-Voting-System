import { useState, useEffect } from 'react';
import { Users, Vote, BarChart2, CheckCircle, Building, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';

const MetricCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card flex gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: d } = await api.get('/admin/dashboard');
        setData(d);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <AdminLayout><LoadingSpinner center /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">INEC Admin Dashboard</h1>
          <p className="page-subtitle">
            {data?.activeElection
              ? `Active: ${data.activeElection.title}`
              : 'No active election'}
            {' — '}
            Auto-refreshes every 30s
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard icon={Users} label="Registered Voters" value={data?.totalVoters ?? 0} color="bg-blue-600" />
          <MetricCard icon={Vote} label="Total Votes Cast" value={data?.totalVotes ?? 0} color="bg-[#008751]" />
          <MetricCard icon={TrendingUp} label="Voter Turnout" value={`${data?.turnoutPct ?? 0}%`} sub={`${data?.votedVoters} of ${data?.totalVoters} voters`} color="bg-purple-600" />
          <MetricCard icon={CheckCircle} label="Accredited Voters" value={data?.accreditedVoters ?? 0} color="bg-yellow-500" />
          <MetricCard icon={Building} label="Active Units" value={data?.activeUnits ?? 0} color="bg-orange-500" />
          <MetricCard icon={Users} label="Suspended" value={data?.suspendedVoters ?? 0} color="bg-red-500" />
        </div>

        {/* Active Election */}
        {data?.activeElection && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Active Election</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{data.activeElection.title}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>Starts: {new Date(data.activeElection.start_date).toLocaleString('en-GB')}</span>
                  <span>Ends: {new Date(data.activeElection.end_date).toLocaleString('en-GB')}</span>
                  <StatusBadge status={data.activeElection.status} />
                </div>
              </div>
              <div className="flex gap-3">
                <a href="/admin/results" className="btn-primary text-sm px-4 py-2">View Results</a>
                <a href="/admin/elections" className="btn-secondary text-sm px-4 py-2">Manage</a>
              </div>
            </div>
          </div>
        )}

        {/* Turnout Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Voter Turnout Progress</h2>
            <span className="text-sm font-bold text-[#008751]">{data?.turnoutPct ?? 0}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-[#008751] h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(data?.turnoutPct ?? 0, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>{data?.votedVoters} voted</span>
            <span>{data?.totalVoters} registered</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
