import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Users, Vote, Flag, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import OfficerLayout from '../../components/layout/OfficerLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const OfficerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pvc, setPvc] = useState('');
  const [accrediting, setAccrediting] = useState(false);
  const [accreditResult, setAccreditResult] = useState(null);
  const [incident, setIncident] = useState('');
  const [incidentType, setIncidentType] = useState('General');
  const [reportingIncident, setReportingIncident] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/officer/stats');
      setStats(data);
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleAccredit = async (e) => {
    e.preventDefault();
    if (!pvc.trim()) return;
    setAccrediting(true);
    setAccreditResult(null);
    try {
      const { data } = await api.post('/officer/accredit', { pvc_number: pvc.trim() });
      setAccreditResult({ success: true, voter: data.voter });
      toast.success(`${data.voter.full_name} accredited successfully`);
      setPvc('');
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.error || 'Accreditation failed';
      setAccreditResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setAccrediting(false);
    }
  };

  const handleIncident = async (e) => {
    e.preventDefault();
    if (incident.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }
    setReportingIncident(true);
    try {
      await api.post('/officer/incident', { description: incident, incident_type: incidentType });
      toast.success('Incident reported successfully');
      setIncident('');
      fetchStats();
    } catch {
      toast.error('Failed to report incident');
    } finally {
      setReportingIncident(false);
    }
  };

  if (loading) return <OfficerLayout><LoadingSpinner center /></OfficerLayout>;

  return (
    <OfficerLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Officer Dashboard</h1>
          <p className="page-subtitle">{stats?.pollingUnit?.name || 'Polling Unit'}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard icon={Vote} label="Votes Cast" value={stats?.voteCount ?? 0} color="bg-[#008751]" />
          <StatCard icon={Users} label="Accredited" value={stats?.accreditedCount ?? 0} color="bg-blue-600" />
          <StatCard icon={Flag} label="Incidents" value={stats?.incidents?.length ?? 0} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Accreditation */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#008751]" /> Voter Accreditation
            </h2>
            <form onSubmit={handleAccredit} className="space-y-4">
              <div>
                <label className="label">PVC Number</label>
                <input
                  className="input"
                  value={pvc}
                  onChange={(e) => { setPvc(e.target.value); setAccreditResult(null); }}
                  placeholder="e.g. PVC/LG/001/2027"
                  autoFocus
                />
              </div>
              {accreditResult && (
                <div className={`rounded-lg p-3 text-sm flex items-start gap-2 ${
                  accreditResult.success ? 'bg-[#F0FBF4] border border-[#008751]/20' : 'bg-red-50 border border-red-200'
                }`}>
                  {accreditResult.success ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-[#008751] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#006B3F]">{accreditResult.voter.full_name}</p>
                        <p className="text-[#008751] text-xs">PVC: {accreditResult.voter.pvc_number} — Accredited ✓</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700">{accreditResult.message}</p>
                    </>
                  )}
                </div>
              )}
              <button type="submit" disabled={accrediting || !pvc.trim()} className="btn-primary w-full">
                {accrediting ? 'Verifying...' : 'Accredit Voter'}
              </button>
            </form>
          </div>

          {/* Incident Report */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Flag className="w-5 h-5 text-orange-500" /> Report Incident
            </h2>
            <form onSubmit={handleIncident} className="space-y-4">
              <div>
                <label className="label">Incident Type</label>
                <select className="input" value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
                  {['General', 'Voter Dispute', 'System Issue', 'Suspicious Activity', 'Technical Problem'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[90px] resize-none"
                  value={incident}
                  onChange={(e) => setIncident(e.target.value)}
                  placeholder="Describe the incident in detail (minimum 10 characters)..."
                  rows={4}
                />
              </div>
              <button type="submit" disabled={reportingIncident || incident.trim().length < 10} className="btn-primary w-full" style={{ background: '#EA580C' }}>
                {reportingIncident ? 'Reporting...' : 'Submit Incident Report'}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Incidents */}
        {stats?.incidents?.length > 0 && (
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" /> Recent Incidents
            </h2>
            <div className="space-y-3">
              {stats.incidents.map((inc) => (
                <div key={inc.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-600">{inc.incident_type}</span>
                      <StatusBadge status={inc.status} />
                    </div>
                    <p className="text-sm text-gray-700">{inc.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(inc.createdAt || inc.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </OfficerLayout>
  );
};

export default OfficerDashboard;
