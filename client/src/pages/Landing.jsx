import { Link } from 'react-router-dom';
import { Shield, Globe, Lock, ChevronRight, Vote, Users, BarChart2 } from 'lucide-react';
import CoatOfArms from '../components/logos/CoatOfArms';
import INECLogo from '../components/logos/INECLogo';
import NINBadge from '../components/logos/NINBadge';
import PVCIcon from '../components/logos/PVCIcon';

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="flex gap-4 p-5 rounded-lg border border-gray-100 bg-white shadow-card hover:shadow-card-md transition-shadow">
    <div className="w-10 h-10 bg-[#F0FBF4] rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-[#008751]" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Portal = ({ to, title, desc, icon: Icon, color }) => (
  <Link to={to} className="group flex flex-col p-5 rounded-xl border border-gray-200 bg-white shadow-card hover:shadow-card-md hover:border-[#008751] transition-all">
    <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
    <p className="text-xs text-gray-500 mb-3 flex-1">{desc}</p>
    <span className="text-xs font-medium text-[#008751] flex items-center gap-1 group-hover:gap-2 transition-all">
      Access Portal <ChevronRight className="w-3 h-3" />
    </span>
  </Link>
);

const Landing = () => (
  <div className="min-h-screen bg-white">
    {/* Header */}
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#008751] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <span className="font-semibold text-gray-900">Vote.ng</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/results" className="text-sm text-gray-600 hover:text-[#008751] font-medium">Live Results</Link>
          <Link to="/voter/login" className="btn-primary text-sm px-4 py-2">Voter Login</Link>
        </nav>
      </div>
    </header>

    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F0FBF4] to-white">
      {/* Background coat of arms watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
        <CoatOfArms size={500} />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <INECLogo size={60} />
          <CoatOfArms size={72} />
        </div>
        <div className="inline-flex items-center gap-2 bg-[#F0FBF4] border border-[#008751]/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#008751] animate-pulse"></span>
          <span className="text-xs text-[#008751] font-medium">2027 Presidential Election — Diaspora Voting Now Active</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-5 leading-tight">
          Vote<span className="text-[#008751]">.ng</span>
        </h1>
        <p className="text-xl text-gray-600 font-medium mb-3 max-w-2xl mx-auto">
          Empowering Nigeria's Diaspora — One Secure Vote at a Time
        </p>
        <p className="text-sm text-gray-500 max-w-xl mx-auto mb-10">
          The official INEC diaspora voting portal for the 2027 Nigerian Presidential Election. Register with your NIN and PVC, authenticate securely, and cast your vote from anywhere in the world.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/voter/register" className="btn-primary px-8 py-3 text-base">
            Register to Vote
          </Link>
          <Link to="/voter/login" className="btn-secondary px-8 py-3 text-base">
            Already Registered? Login
          </Link>
        </div>

        {/* Credential badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <NINBadge size={100} />
            <span className="text-xs text-gray-400 font-medium">NIN Required</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PVCIcon size={100} />
            <span className="text-xs text-gray-400 font-medium">PVC Required</span>
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Built for Security & Transparency</h2>
        <p className="text-sm text-gray-500">Every vote is anonymous, every action is audited.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Feature icon={Shield} title="End-to-End Security" desc="JWT authentication, bcrypt password hashing, OTP two-factor verification, and rate-limited endpoints protect every action." />
        <Feature icon={Lock} title="Ballot Anonymity" desc="Your vote is permanently separated from your identity. No admin can trace a ballot back to any voter — by design." />
        <Feature icon={Globe} title="Worldwide Access" desc="Cast your vote from any country. Three polling units across London, New York, and Dubai serve the global diaspora." />
        <Feature icon={Vote} title="One Voter, One Vote" desc="NIN and PVC uniqueness constraints, combined with status enforcement, make duplicate voting technically impossible." />
        <Feature icon={Users} title="Officer-Verified Accreditation" desc="Every voter is accredited by a designated polling officer before voting, mirroring in-person election procedures." />
        <Feature icon={BarChart2} title="Live Public Results" desc="Real-time vote tallies are publicly viewable throughout the election, with full candidate breakdowns by percentage." />
      </div>
    </section>

    {/* Portals */}
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Your Portal</h2>
          <p className="text-sm text-gray-500">Four dedicated interfaces for every stakeholder.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Portal to="/voter/register" title="Voter Portal" desc="Register, authenticate, cast your ballot, and receive your secure receipt." icon={Vote} color="bg-[#008751]" />
          <Portal to="/officer/login" title="Officer Portal" desc="Accredit voters, monitor your polling unit, and log incidents." icon={Users} color="bg-blue-600" />
          <Portal to="/admin/login" title="INEC Admin" desc="Manage elections, candidates, voter registry, and view full audit trails." icon={Shield} color="bg-purple-600" />
          <Portal to="/results" title="Live Results" desc="Public real-time vote tallies. No login required. Auto-refreshes every 30s." icon={BarChart2} color="bg-orange-500" />
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-[#1A1A1A] py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CoatOfArms size={40} />
            <div className="text-left">
              <div className="text-white font-semibold text-sm">Federal Republic of Nigeria</div>
              <div className="text-gray-400 text-xs">Independent National Electoral Commission</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-white font-bold text-xl">Vote<span className="text-[#008751]">.ng</span></div>
            <div className="text-gray-400 text-xs mt-1">Diaspora Voting Portal — 2027 General Elections</div>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <div>Powered by INEC Digital Services</div>
            <div className="mt-1">© 2027 All rights reserved</div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-xs text-gray-600">
          This is an official INEC portal. Unauthorized access or vote tampering is a criminal offence under the Electoral Act 2022.
        </div>
      </div>
    </footer>
  </div>
);

export default Landing;
