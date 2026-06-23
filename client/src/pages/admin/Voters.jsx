import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Ban, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';

const Voters = () => {
  const [voters, setVoters] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVoters = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/admin/voters?${params}`);
      setVoters(data.voters);
      setTotal(data.total);
      setPages(data.pages);
    } catch { toast.error('Failed to fetch voters'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchVoters(); }, [fetchVoters]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/voters/${id}`, { status });
      toast.success(`Voter ${status.toLowerCase()}`);
      fetchVoters();
    } catch { toast.error('Update failed'); }
  };

  const STATUS_NEXT = { REGISTERED: null, ACCREDITED: null, VOTED: null, SUSPENDED: 'REGISTERED' };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Voter Register</h1>
          <p className="page-subtitle">{total} voters registered · showing page {page} of {pages}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search by name, NIN, PVC, or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="input max-w-[180px]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {['REGISTERED', 'ACCREDITED', 'VOTED', 'SUSPENDED'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={fetchVoters} className="btn-ghost">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <LoadingSpinner center />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Name</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">NIN</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">PVC</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Country</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Registered</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {voters.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No voters found</td></tr>
                  )}
                  {voters.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm text-gray-900">{v.full_name}</div>
                        <div className="text-xs text-gray-400">{v.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{v.nin}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{v.pvc_number}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{v.country_of_residence}</td>
                      <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(v.created_at || v.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3">
                        {v.status !== 'SUSPENDED' ? (
                          <button
                            onClick={() => handleStatusChange(v.id, 'SUSPENDED')}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                          >
                            <Ban className="w-3 h-3" /> Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(v.id, 'REGISTERED')}
                            className="text-xs text-[#008751] hover:text-[#006B3F] flex items-center gap-1 font-medium"
                          >
                            <RefreshCw className="w-3 h-3" /> Reinstate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{total} total voters</p>
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

export default Voters;
