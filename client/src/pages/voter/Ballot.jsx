import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, CheckCircle, AlertTriangle, User } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import VoterLayout from '../../components/layout/VoterLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PARTY_COLORS = {
  APC: '#008751', PDP: '#E53E3E', LP: '#D69E2E', NNPP: '#3182CE', ADC: '#805AD5',
};

const Ballot = () => {
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [voter, setVoter] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eRes, vRes] = await Promise.all([api.get('/voter/election'), api.get('/voter/me')]);
        setElection(eRes.data.election);
        setVoter(vRes.data.voter);
      } catch {
        toast.error('Failed to load ballot');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVote = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/voter/vote', {
        candidate_id: selected,
        election_id: election.id,
      });
      toast.success('Vote cast successfully!');
      navigate('/voter/receipt', { state: { vote_token: data.vote_token, cast_at: data.cast_at } });
    } catch (err) {
      const msg = err.response?.data?.error || 'Vote submission failed';
      toast.error(msg);
      if (msg.includes('already cast')) navigate('/voter/receipt');
    } finally {
      setSubmitting(false);
      setConfirm(false);
    }
  };

  if (loading) return <VoterLayout><LoadingSpinner center /></VoterLayout>;

  if (voter?.status === 'VOTED') {
    return (
      <VoterLayout>
        <div className="card max-w-lg mx-auto text-center py-10">
          <CheckCircle className="w-12 h-12 text-[#008751] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">You have already voted</h2>
          <p className="text-sm text-gray-500 mt-2">Your ballot has been securely recorded.</p>
          <button onClick={() => navigate('/voter/receipt')} className="btn-secondary mt-4">View Receipt</button>
        </div>
      </VoterLayout>
    );
  }

  if (voter?.status !== 'ACCREDITED') {
    return (
      <VoterLayout>
        <div className="card max-w-lg mx-auto text-center py-10">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Accreditation Required</h2>
          <p className="text-sm text-gray-500 mt-2">You must be accredited by a polling officer at your assigned polling unit before you can cast your vote.</p>
          <p className="text-xs text-gray-400 mt-3">Current status: <span className="font-semibold">{voter?.status}</span></p>
        </div>
      </VoterLayout>
    );
  }

  if (!election) {
    return (
      <VoterLayout>
        <div className="card max-w-lg mx-auto text-center py-10">
          <p className="text-sm text-gray-500">No active election at this time.</p>
        </div>
      </VoterLayout>
    );
  }

  const selectedCandidate = election.candidates?.find((c) => c.id === selected);

  return (
    <VoterLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Official Ballot</h1>
          <p className="page-subtitle">{election.title}</p>
        </div>

        {/* Instructions */}
        <div className="bg-[#F0FBF4] border border-[#008751]/20 rounded-lg p-4 text-sm text-[#006B3F]">
          <strong>Instructions:</strong> Select ONE candidate below. Your vote is final once confirmed. This ballot is anonymous — no record will link your identity to your choice.
        </div>

        {/* Candidates */}
        <div className="space-y-3">
          {election.candidates?.map((candidate) => {
            const color = PARTY_COLORS[candidate.party_acronym] || '#6B7280';
            const isSelected = selected === candidate.id;
            return (
              <label
                key={candidate.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-[#008751] bg-[#F0FBF4]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="candidate"
                  value={candidate.id}
                  checked={isSelected}
                  onChange={() => setSelected(candidate.id)}
                  className="sr-only"
                />
                {/* Radio indicator */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'border-[#008751]' : 'border-gray-300'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#008751]" />}
                </div>
                {/* Candidate photo placeholder */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}20`, border: `2px solid ${color}40` }}>
                  <User className="w-6 h-6" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{candidate.full_name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: color }}>
                      {candidate.party_acronym}
                    </span>
                    <span className="text-xs text-gray-500">{candidate.party}</span>
                  </div>
                  {candidate.bio && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{candidate.bio}</p>
                  )}
                </div>
                {isSelected && <CheckCircle className="w-5 h-5 text-[#008751] flex-shrink-0" />}
              </label>
            );
          })}
        </div>

        {/* Submit */}
        <button
          disabled={!selected}
          onClick={() => setConfirm(true)}
          className="btn-primary w-full py-3"
        >
          <Vote className="w-4 h-4" />
          {selected ? `Vote for ${selectedCandidate?.full_name}` : 'Select a candidate to continue'}
        </button>

        {/* Confirm Modal */}
        {confirm && selectedCandidate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Confirm Your Vote</h3>
              <p className="text-sm text-gray-500 mb-4">This action is irreversible. Once submitted, your vote cannot be changed.</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-400 mb-1">Your selection:</p>
                <p className="font-semibold text-gray-900">{selectedCandidate.full_name}</p>
                <p className="text-sm text-gray-600">{selectedCandidate.party} ({selectedCandidate.party_acronym})</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleVote} disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Submitting...' : 'Confirm Vote'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </VoterLayout>
  );
};

export default Ballot;
