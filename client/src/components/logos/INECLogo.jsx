const INECLogo = ({ size = 48, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="24" cy="24" r="22" fill="#008751" stroke="#006B3F" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="17" fill="white" />
    <circle cx="24" cy="24" r="13" fill="#008751" />
    {/* Eagle silhouette simplified */}
    <path d="M24 12 L20 18 L14 16 L18 22 L14 28 L20 26 L24 32 L28 26 L34 28 L30 22 L34 16 L28 18 Z" fill="white" />
    <circle cx="24" cy="23" r="3" fill="#008751" />
    {/* Stars */}
    <circle cx="24" cy="39" r="1.5" fill="white" />
    <circle cx="18" cy="37" r="1.2" fill="white" />
    <circle cx="30" cy="37" r="1.2" fill="white" />
    {/* Text band */}
    <path d="M8 24 A16 16 0 0 1 40 24" stroke="white" strokeWidth="0" fill="none" />
  </svg>
);

export default INECLogo;
