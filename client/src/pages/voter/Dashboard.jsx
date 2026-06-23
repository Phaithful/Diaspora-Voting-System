import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Vote, CheckCircle, Clock, AlertTriangle, User, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import VoterLayout from '../../components/layout/VoterLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';

const VoterDashboard = () => {
  const { user } = useAuth();
  const [voter, setVoter] = useState(null);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, eRes] = await Promise.all([
          api.get('/voter/me'),
          api.get('/voter/election').catch(() => ({ data: { election: null } })),
        ]);
        setVoter(vRes.data.voter);
        setElection(eRes.data.election);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <VoterLayout><LoadingSpinner center /></VoterLayout>;

  const statusSteps = [
    { key: 'REGISTERED', label: 'Registered', icon: CheckCircle, done: true },
    { key: 'ACCREDITED', label: 'Accredited', icon: User, done: ['ACCREDITED', 'VOTED'].includes(voter?.status) },
    { key: 'VOTED', label: 'Voted', icon: Vote, done: voter?.status === 'VOTED' },
  ];

  return (
    <VoterLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="page-header">
          <h1 className="page-title">Welcome, {voter?.full_name?.split(' ')[0] || 'Voter'}</h1>
          <p className="page-subtitle">Your voter dashboard for the 2027 Nigerian Presidential Election</p>
        </div>

        {/* Status Banner */}
        {voter?.status === 'SUSPENDED' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Account Suspended</p>
              <p className="text-xs text-red-600 mt-0.5">Your voting account has been suspended. Contact INEC support.</p>
            </div>
          </div>
        )}

        {voter?.status === 'VOTED' && (
          <div className="bg-[#F0FBF4] border border-[#008751]/30 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-[#008751] flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#006B3F]">Vote Successfully Cast</p>
              <p className="text-xs text-[#008751] mt-0.5">Your ballot has been securely recorded. View your receipt for confirmation.</p>
            </div>
          </div>
        )}

        {voter?.status === 'REGISTERED' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Awaiting Accreditation</p>
              <p className="text-xs text-yellow-700 mt-0.5">Visit your assigned polling unit to be accredited by a polling officer before you can vote.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Voter Card */}
          <div className="card md:col-span-2">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#008751]" /> Voter Profile
            </h2>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div><span className="text-gray-400 text-xs">Full Name</span><p className="font-medium text-gray-900">{voter?.full_name}</p></div>
              <div><span className="text-gray-400 text-xs">Status</span><p className="mt-0.5"><StatusBadge status={voter?.status} /></p></div>
              <div><span className="text-gray-400 text-xs">NIN</span><p className="font-medium text-gray-900 font-mono">{voter?.nin}</p></div>
              <div><span className="text-gray-400 text-xs">PVC Number</span><p className="font-medium text-gray-900">{voter?.pvc_number}</p></div>
              <div><span className="text-gray-400 text-xs">Email</span><p className="text-gray-700">{voter?.email}</p></div>
              <div><span className="text-gray-400 text-xs">Country</span><p className="flex items-center gap-1 text-gray-700"><MapPin className="w-3 h-3" />{voter?.country_of_residence}</p></div>
            </div>
          </div>

          {/* Status Steps */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Voting Progress</h2>
            <div className="space-y-3">
              {statusSteps.map(({ key, label, icon: Icon, done }, i) => (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-[#008751]' : 'bg-gray-100'}`}>
                    <Icon className={`w-4 h-4 ${done ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Election Info + CTA */}
        {election && (
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#008751]" /> Active Election
                </h2>
                <h3 className="text-base font-semibold text-gray-900">{election.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{election.description?.slice(0, 150)}...</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>Closes: {new Date(election.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <StatusBadge status={election.status} />
                </div>
              </div>
              {voter?.status === 'ACCREDITED' && (
                <Link to="/voter/ballot" className="btn-primary whitespace-nowrap">
                  <Vote className="w-4 h-4" /> Cast Your Vote
                </Link>
              )}
              {voter?.status === 'VOTED' && (
                <Link to="/voter/receipt" className="btn-secondary whitespace-nowrap">
                  View Receipt
                </Link>
              )}
            </div>
          </div>
        )}

        {!election && (
          <div className="card text-center py-8 text-gray-400">
            <Vote className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No active election at this time.</p>
          </div>
        )}
      </div>
    </VoterLayout>
  );
};

export default VoterDashboard;
