import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', election_type: 'Presidential', start_date: '', end_date: '', status: 'UPCOMING' });
  const [saving, setSaving] = useState(false);

  const fetchElections = async () => {
    try {
      const { data } = await api.get('/admin/elections');
      setElections(data.elections);
    } catch { toast.error('Failed to load elections'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchElections(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/elections', form);
      toast.success('Election created');
      setShowForm(false);
      setForm({ title: '', description: '', election_type: 'Presidential', start_date: '', end_date: '', status: 'UPCOMING' });
      fetchElections();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create');
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/elections/${id}`, { status });
      toast.success('Status updated');
      fetchElections();
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <AdminLayout><LoadingSpinner center /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Elections</h1>
            <p className="page-subtitle">Manage elections and their status</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New Election
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="card border-[#008751]/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Create Election</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Election Title *</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. 2027 Nigerian Presidential Election" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.election_type} onChange={(e) => setForm({ ...form, election_type: e.target.value })}>
                  {['Presidential', 'Gubernatorial', 'Senatorial', 'House of Reps'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ACTIVE">Active</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label className="label">Start Date & Time *</label>
                <input type="datetime-local" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
              </div>
              <div>
                <label className="label">End Date & Time *</label>
                <input type="datetime-local" className="input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Election'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Elections List */}
        <div className="space-y-3">
          {elections.length === 0 && <div className="card text-center py-10 text-gray-400">No elections yet. Create one above.</div>}
          {elections.map((e) => (
            <div key={e.id} className="card flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={e.status} />
                  <span className="text-xs text-gray-400">{e.election_type}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{e.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(e.start_date).toLocaleString('en-GB')} → {new Date(e.end_date).toLocaleString('en-GB')}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {e.status !== 'ACTIVE' && <button onClick={() => handleStatusChange(e.id, 'ACTIVE')} className="btn-primary text-xs px-3 py-1.5">Set Active</button>}
                {e.status === 'ACTIVE' && <button onClick={() => handleStatusChange(e.id, 'CLOSED')} className="btn-danger text-xs px-3 py-1.5">Close Election</button>}
                {e.status === 'CLOSED' && <span className="text-xs text-gray-400 py-1.5">Closed</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Elections;
