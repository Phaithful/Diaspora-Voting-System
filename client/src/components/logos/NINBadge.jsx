const NINBadge = ({ size = 40, className = '' }) => (
  <svg width={size} height={Math.round(size * 0.65)} viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="80" height="52" rx="6" fill="#1A1A1A" />
    <rect x="2" y="2" width="76" height="48" rx="5" fill="#1F2937" />
    {/* Green stripe at top */}
    <rect x="2" y="2" width="76" height="10" rx="4" fill="#008751" />
    <rect x="2" y="8" width="76" height="4" fill="#008751" />
    {/* NIMC text */}
    <text x="8" y="22" fill="white" fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif">NIMC</text>
    <text x="8" y="31" fill="#9CA3AF" fontSize="5.5" fontFamily="Inter, sans-serif">National Identity Management Commission</text>
    {/* NIN number placeholder */}
    <rect x="8" y="36" width="40" height="8" rx="2" fill="#374151" />
    <text x="11" y="43" fill="#6EE7B7" fontSize="6" fontFamily="monospace" letterSpacing="2">NIN: ___________</text>
    {/* Chip */}
    <rect x="56" y="16" width="16" height="12" rx="2" fill="#FFD700" opacity="0.8" />
    <line x1="60" y1="16" x2="60" y2="28" stroke="#B45309" strokeWidth="0.8" />
    <line x1="64" y1="16" x2="64" y2="28" stroke="#B45309" strokeWidth="0.8" />
    <line x1="68" y1="16" x2="68" y2="28" stroke="#B45309" strokeWidth="0.8" />
    <line x1="56" y1="20" x2="72" y2="20" stroke="#B45309" strokeWidth="0.8" />
    <line x1="56" y1="24" x2="72" y2="24" stroke="#B45309" strokeWidth="0.8" />
  </svg>
);

export default NINBadge;
