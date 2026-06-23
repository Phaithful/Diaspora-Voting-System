import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Copy, Download, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import VoterLayout from '../../components/layout/VoterLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CoatOfArms from '../../components/logos/CoatOfArms';

const Receipt = () => {
  const location = useLocation();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voteToken] = useState(location.state?.vote_token || null);
  const [castAt] = useState(location.state?.cast_at || null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const { data } = await api.get('/voter/receipt');
        setReceipt(data);
      } catch {
        setReceipt(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, []);

  const copyToken = () => {
    if (voteToken) {
      navigator.clipboard.writeText(voteToken);
      toast.success('Vote token copied to clipboard');
    }
  };

  if (loading) return <VoterLayout><LoadingSpinner center /></VoterLayout>;

  if (!receipt) {
    return (
      <VoterLayout>
        <div className="card max-w-lg mx-auto text-center py-10">
          <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-700">No vote record found</h2>
          <p className="text-sm text-gray-400 mt-2">You haven't cast your vote yet.</p>
          <Link to="/voter/ballot" className="btn-primary mt-4 inline-flex">Cast Your Vote</Link>
        </div>
      </VoterLayout>
    );
  }

  const timestamp = castAt || receipt.timestamp;

  return (
    <VoterLayout>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="page-title">Vote Receipt</h1>
          <p className="page-subtitle">Your official voting confirmation</p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white border-2 border-[#008751]/30 rounded-xl overflow-hidden shadow-card-md">
          {/* Header */}
          <div className="bg-[#008751] px-6 py-5 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <CoatOfArms size={160} />
            </div>
            <div className="relative">
              <CheckCircle className="w-10 h-10 mx-auto mb-2" />
              <h2 className="text-lg font-bold">Vote Successfully Recorded</h2>
              <p className="text-green-200 text-sm mt-1">Federal Republic of Nigeria — INEC Diaspora Portal</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="bg-[#F0FBF4] rounded-lg p-4 text-center">
              <p className="text-xs text-[#006B3F] font-medium mb-2">Your Anonymous Vote Token</p>
              <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">
                {voteToken || 'Token not available (stored securely)'}
              </p>
              {voteToken && (
                <button onClick={copyToken} className="mt-2 flex items-center gap-1 text-xs text-[#008751] font-medium mx-auto hover:underline">
                  <Copy className="w-3 h-3" /> Copy Token
                </button>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Voter Name</span>
                <span className="font-medium text-gray-900">{receipt.voter_name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Election</span>
                <span className="font-medium text-gray-900 text-right max-w-[200px]">2027 Presidential Election</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Timestamp</span>
                <span className="font-medium text-gray-900">
                  {timestamp ? new Date(timestamp).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Status</span>
                <span className="badge-green">Confirmed</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 text-center leading-relaxed">
              Your vote is anonymous. This token confirms participation but cannot be used to identify your choice. Retain this receipt for your records.
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <Link to="/voter/dashboard" className="btn-secondary w-full justify-center">
              Return to Dashboard
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          © 2027 INEC Vote.ng — Your vote is your voice.
        </p>
      </div>
    </VoterLayout>
  );
};

export default Receipt;
