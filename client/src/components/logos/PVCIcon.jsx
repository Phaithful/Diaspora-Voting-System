const PVCIcon = ({ size = 40, className = '' }) => (
  <svg width={size} height={Math.round(size * 0.65)} viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="80" height="52" rx="6" fill="#008751" />
    <rect x="2" y="2" width="76" height="48" rx="5" fill="#006B3F" />
    {/* White stripe */}
    <rect x="2" y="14" width="76" height="24" fill="white" opacity="0.95" />
    {/* Header */}
    <text x="8" y="11" fill="white" fontSize="6" fontWeight="700" fontFamily="Inter, sans-serif">INDEPENDENT NATIONAL ELECTORAL COMMISSION</text>
    {/* PVC text */}
    <text x="8" y="24" fill="#008751" fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif">PERMANENT VOTER'S CARD</text>
    <text x="8" y="33" fill="#374151" fontSize="5.5" fontFamily="Inter, sans-serif">PVC No: ___________________</text>
    <text x="8" y="41" fill="#6B7280" fontSize="5" fontFamily="Inter, sans-serif">FEDERAL REPUBLIC OF NIGERIA</text>
    {/* Barcode lines */}
    {[60, 62, 64, 66, 68, 70].map((x, i) => (
      <rect key={i} x={x} y="17" width={i % 2 === 0 ? 1.5 : 0.8} height="22" fill="#1A1A1A" opacity="0.7" />
    ))}
    {/* INEC star */}
    <polygon points="36,44 37,47 40,47 38,49 39,52 36,50 33,52 34,49 32,47 35,47" fill="#FFD700" transform="translate(0,-2)" />
  </svg>
);

export default PVCIcon;
