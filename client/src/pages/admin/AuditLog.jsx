import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ACTION_COLORS = {
  VOTE_CAST: 'badge-green',
  VOTER_REGISTER: 'badge-blue',
  VOTER_ACCREDITED: 'badge-yellow',
  LOGIN_SUCCESS: 'badge-gray',
  LOGIN_FAILED: 'badge-red',
  VOTER_STATUS_CHANGED: 'badge-yellow',
  ELECTION_CREATED: 'badge-blue',
  ELECTION_UPDATED: 'badge-blue',
  CANDIDATE_ADDED: 'badge-blue',
  CANDIDATE_REMOVED: 'badge-red',
  INCIDENT_REPORTED: 'badge-yellow',
};

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 25 });
      if (actionFilter) params.append('action', actionFilter);
      const { data } = await api.get(`/admin/audit-log?${params}`);
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to load audit log'); }
    finally { setLoading(false); }
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const ACTIONS = ['VOTE_CAST', 'VOTER_REGISTER', 'VOTER_ACCREDITED', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'VOTER_STATUS_CHANGED', 'ELECTION_CREATED', 'INCIDENT_REPORTED'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Audit Log</h1>
            <p className="page-subtitle">{total} events recorded</p>
          </div>
          <button onClick={fetchLogs} className="btn-ghost">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3">
          <select className="input max-w-[220px]" value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
            <option value="">All Actions</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? <LoadingSpinner center /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Timestamp</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Action</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Actor</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Role</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">IP</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No audit events yet</td></tr>
                  )}
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`badge ${ACTION_COLORS[log.action] || 'badge-gray'} text-[10px]`}>{log.action}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-700">{log.actor_name || log.actor_id?.slice(0, 8) || '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          log.actor_role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                          log.actor_role === 'OFFICER' ? 'bg-blue-100 text-blue-700' :
                          log.actor_role === 'VOTER' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>{log.actor_role || '—'}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{log.ip_address || '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-400 max-w-[200px] truncate">
                        {log.metadata && Object.keys(log.metadata).length > 0
                          ? Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(', ')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{total} total events</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-2 py-2 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">Page {page} of {pages}</span>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="btn-ghost px-2 py-2 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AuditLogPage;
