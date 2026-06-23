import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, RefreshCw, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PARTY_COLORS = {
  APC: '#008751', PDP: '#E53E3E', LP: '#D69E2E', NNPP: '#3182CE', ADC: '#805AD5',
};
const DEFAULT_COLOR = '#6B7280';

const AdminResults = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data: d } = await api.get('/admin/results');
      setData(d);
      setLastRefresh(new Date());
    } catch { toast.error('Failed to load results'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/export-results', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `results_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch { toast.error('Export failed'); }
  };

  if (loading && !data) return <AdminLayout><LoadingSpinner center /></AdminLayout>;

  const leader = data?.results?.[0];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Election Results</h1>
            <p className="page-subtitle">
              {data?.election?.title} · Last updated: {lastRefresh.toLocaleTimeString('en-GB')} · Auto-refreshes every 30s
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchResults} className="btn-secondary">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleExport} className="btn-primary">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-3xl font-bold text-gray-900">{data?.totalVotes ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total Votes Cast</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-gray-900">{data?.results?.length ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Candidates</p>
          </div>
          <div className="card text-center">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              data?.election?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
            }`}>
              {data?.election?.status || 'N/A'}
            </span>
            <p className="text-xs text-gray-500 mt-2">Election Status</p>
          </div>
        </div>

        {/* Leader */}
        {leader && data.totalVotes > 0 && (
          <div className="card border-l-4" style={{ borderLeftColor: PARTY_COLORS[leader.party_acronym] || DEFAULT_COLOR }}>
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Current Leader</p>
                <p className="font-bold text-gray-900">{leader.full_name}</p>
                <p className="text-sm text-gray-600">{leader.party_acronym} · {leader.votes} votes · {leader.percentage}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Bar Chart */}
        {data?.results?.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Vote Distribution</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.results} margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                <XAxis dataKey="party_acronym" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(v, name, props) => [v, props.payload.full_name]}
                  labelFormatter={(l) => `Party: ${l}`}
                />
                <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                  {data.results.map((r, i) => (
                    <Cell key={r.id} fill={PARTY_COLORS[r.party_acronym] || DEFAULT_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detail Table */}
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Candidate</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Party</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Votes</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">%</th>
                <th className="px-4 py-3 w-48"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data?.results || []).map((r, i) => {
                const color = PARTY_COLORS[r.party_acronym] || DEFAULT_COLOR;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500 font-medium">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-sm text-gray-900">{r.full_name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: color }}>
                        {r.party_acronym}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{r.votes.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{r.percentage}%</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: `${r.percentage}%`, background: color }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(data?.results || []).length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No votes cast yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminResults;
