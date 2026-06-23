import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RefreshCw, Trophy, Clock, Globe } from 'lucide-react';
import api from '../lib/axios';
import CoatOfArms from '../components/logos/CoatOfArms';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const PARTY_COLORS = {
  APC: '#008751', PDP: '#E53E3E', LP: '#D69E2E', NNPP: '#3182CE', ADC: '#805AD5',
};
const DEFAULT_COLOR = '#6B7280';

const PublicResults = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [countdown, setCountdown] = useState(30);

  const fetchResults = async () => {
    try {
      const { data: d } = await api.get('/results');
      setData(d);
      setLastUpdate(new Date());
      setCountdown(30);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 30)), 1000);
    return () => clearInterval(tick);
  }, []);

  const leader = data?.results?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#008751] text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="py-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <CoatOfArms size={60} />
            <div>
              <h1 className="text-2xl font-bold">Federal Republic of Nigeria</h1>
              <p className="text-green-200 text-sm">Independent National Electoral Commission — Official Election Results</p>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-[#006B3F] text-white">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-green-100">
            <Globe className="w-4 h-4" />
            {data?.election ? (
              <span className="font-medium">{data.election.title}</span>
            ) : (
              <span>Loading election data...</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-green-200">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Refreshes in {countdown}s</span>
            <span>Last updated: {lastUpdate.toLocaleTimeString('en-GB')}</span>
            <button onClick={fetchResults} className="flex items-center gap-1 hover:text-white">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <LoadingSpinner center />
        ) : !data?.election ? (
          <div className="card text-center py-16">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-700">No Active Election</h2>
            <p className="text-sm text-gray-500 mt-2">Results will appear here when an election is active.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="card text-center">
                <p className="text-3xl font-bold text-gray-900">{data.totalVotes.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Votes Cast</p>
              </div>
              <div className="card text-center">
                <p className="text-3xl font-bold text-gray-900">{data.unitsReporting}</p>
                <p className="text-xs text-gray-500 mt-1">of {data.totalUnits} Units Reporting</p>
              </div>
              <div className="card text-center col-span-2 md:col-span-1">
                <span className={`badge text-sm px-3 py-1 ${data.election.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>
                  {data.election.status}
                </span>
                <p className="text-xs text-gray-500 mt-2">Election Status</p>
              </div>
            </div>

            {/* Leader Banner */}
            {leader && data.totalVotes > 0 && (
              <div className="card border-l-4 flex items-center gap-4" style={{ borderLeftColor: PARTY_COLORS[leader.party_acronym] || DEFAULT_COLOR }}>
                <Trophy className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Leading Candidate</p>
                  <p className="text-xl font-bold text-gray-900">{leader.full_name}</p>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-[#008751]">{leader.party_acronym}</span> · {leader.votes.toLocaleString()} votes · {leader.percentage}%
                  </p>
                </div>
              </div>
            )}

            {/* Chart */}
            {data.results.length > 0 && (
              <div className="card">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Vote Breakdown</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.results} margin={{ top: 0, right: 0, bottom: 30, left: 0 }}>
                    <XAxis dataKey="party_acronym" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(v, name, props) => [`${v} votes (${props.payload.percentage}%)`, props.payload.full_name]}
                      labelFormatter={(l) => `${l}`}
                    />
                    <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                      {data.results.map((r) => (
                        <Cell key={r.id} fill={PARTY_COLORS[r.party_acronym] || DEFAULT_COLOR} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Detail breakdown */}
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">Full Results Breakdown</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {data.results.map((r, i) => {
                  const color = PARTY_COLORS[r.party_acronym] || DEFAULT_COLOR;
                  return (
                    <div key={r.id} className="px-5 py-4 flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: color }}>
                        {r.party_acronym.slice(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{r.full_name}</p>
                        <p className="text-xs text-gray-500">{r.party}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[200px]">
                            <div className="h-2 rounded-full transition-all" style={{ width: `${r.percentage}%`, background: color }} />
                          </div>
                          <span className="text-xs text-gray-500">{r.percentage}%</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900">{r.votes.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">votes</p>
                      </div>
                    </div>
                  );
                })}
                {data.results.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">No votes have been cast yet.</div>
                )}
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                <span>Total: {data.totalVotes.toLocaleString()} votes</span>
                <span>{data.results.length} candidates</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#1A1A1A] py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-gray-500">
          <p>© 2027 INEC Vote.ng — Official Diaspora Election Results</p>
          <p className="mt-1">Results are updated in real-time. All figures are official INEC tabulations.</p>
          <Link to="/" className="text-[#008751] hover:underline mt-2 inline-block">← Back to Home</Link>
        </div>
      </footer>
    </div>
  );
};

export default PublicResults;
