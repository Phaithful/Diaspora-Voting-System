import { useState, useEffect } from 'react';
import { Plus, Trash2, X, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PARTY_COLORS = {
  APC: '#008751', PDP: '#E53E3E', LP: '#D69E2E', NNPP: '#3182CE', ADC: '#805AD5',
};

const Candidates = () => {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ election_id: '', full_name: '', party: '', party_acronym: '', bio: '', photo_url: '', manifesto_url: '', position: 0 });

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const { data } = await api.get('/admin/elections');
        setElections(data.elections);
        if (data.elections[0]) setSelectedElection(data.elections[0].id);
      } catch {}
      finally { setLoading(false); }
    };
    fetchElections();
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    const fetchCandidates = async () => {
      try {
        const { data } = await api.get(`/admin/candidates?election_id=${selectedElection}`);
        setCandidates(data.candidates);
      } catch {}
    };
    fetchCandidates();
  }, [selectedElection]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/candidates', { ...form, election_id: selectedElection, position: parseInt(form.position) || 0 });
      toast.success('Candidate added');
      setShowForm(false);
      setForm({ election_id: '', full_name: '', party: '', party_acronym: '', bio: '', photo_url: '', manifesto_url: '', position: 0 });
      const { data } = await api.get(`/admin/candidates?election_id=${selectedElection}`);
      setCandidates(data.candidates);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add candidate');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this candidate?')) return;
    try {
      await api.delete(`/admin/candidates/${id}`);
      toast.success('Candidate removed');
      setCandidates(candidates.filter((c) => c.id !== id));
    } catch { toast.error('Failed to remove'); }
  };

  if (loading) return <AdminLayout><LoadingSpinner center /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Candidates</h1>
            <p className="page-subtitle">Manage election candidates</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary" disabled={!selectedElection}>
            <Plus className="w-4 h-4" /> Add Candidate
          </button>
        </div>

        {/* Election selector */}
        <div className="card">
          <label className="label">Select Election</label>
          <select className="input max-w-sm" value={selectedElection} onChange={(e) => setSelectedElection(e.target.value)}>
            {elections.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card border-[#008751]/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Add Candidate</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Full Name *</label>
                <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required placeholder="Candidate full name" />
              </div>
              <div>
                <label className="label">Party Name *</label>
                <input className="input" value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} required placeholder="e.g. All Progressives Congress" />
              </div>
              <div>
                <label className="label">Party Acronym *</label>
                <input className="input" value={form.party_acronym} onChange={(e) => setForm({ ...form, party_acronym: e.target.value })} required placeholder="e.g. APC" maxLength={10} />
              </div>
              <div>
                <label className="label">Ballot Position</label>
                <input type="number" className="input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} min={0} />
              </div>
              <div>
                <label className="label">Manifesto URL</label>
                <input type="url" className="input" value={form.manifesto_url} onChange={(e) => setForm({ ...form, manifesto_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className="label">Bio</label>
                <textarea className="input resize-none" rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short candidate bio..." />
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Adding...' : 'Add Candidate'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Candidates list */}
        <div className="space-y-3">
          {candidates.length === 0 && <div className="card text-center py-10 text-gray-400">No candidates for this election.</div>}
          {candidates.map((c) => {
            const color = PARTY_COLORS[c.party_acronym] || '#6B7280';
            return (
              <div key={c.id} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `2px solid ${color}40` }}>
                  <User className="w-6 h-6" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{c.full_name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: color }}>{c.party_acronym}</span>
                    <span className="text-xs text-gray-500">{c.party}</span>
                  </div>
                  {c.bio && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{c.bio}</p>}
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Candidates;
