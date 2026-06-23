import { Link } from 'react-router-dom';
import CoatOfArms from '../components/logos/CoatOfArms';

const NotFound = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
    {/* Nigeria flag stripes */}
    <div className="absolute top-0 left-0 right-0 h-1 flex">
      <div className="w-1/3 bg-[#008751]" />
      <div className="w-1/3 bg-white" />
      <div className="w-1/3 bg-[#008751]" />
    </div>
    <CoatOfArms size={72} className="mb-6 opacity-30" />
    <h1 className="text-7xl font-bold text-[#008751] mb-2">404</h1>
    <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
    <p className="text-gray-500 text-sm max-w-sm mb-8">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div className="flex gap-3">
      <Link to="/" className="btn-primary">Go Home</Link>
      <Link to="/results" className="btn-secondary">View Results</Link>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-1 flex">
      <div className="w-1/3 bg-[#008751]" />
      <div className="w-1/3 bg-white" />
      <div className="w-1/3 bg-[#008751]" />
    </div>
  </div>
);

export default NotFound;
