const CoatOfArms = ({ size = 64, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Shield */}
    <path d="M32 4 L58 16 L58 44 C58 60 32 76 32 76 C32 76 6 60 6 44 L6 16 Z" fill="white" stroke="#008751" strokeWidth="2" />
    {/* Green vertical stripe */}
    <path d="M22 4.5 L22 75 C22 75 17 72 12 68 L12 16 Z" fill="#008751" />
    <path d="M42 4.5 L42 75 C42 75 47 72 52 68 L52 16 Z" fill="#008751" />
    {/* Black eagle / Y shape */}
    <path d="M32 28 L24 20 M32 28 L40 20 M32 28 L32 42" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
    {/* Eagle wings */}
    <path d="M20 18 C20 18 24 22 28 24 C28 24 26 28 24 30" stroke="#1A1A1A" strokeWidth="2" fill="none" />
    <path d="M44 18 C44 18 40 22 36 24 C36 24 38 28 40 30" stroke="#1A1A1A" strokeWidth="2" fill="none" />
    {/* Base flowers / horses */}
    <ellipse cx="16" cy="76" rx="8" ry="5" fill="#008751" />
    <ellipse cx="48" cy="76" rx="8" ry="5" fill="#008751" />
    {/* Wreath */}
    <path d="M12 56 C8 52 6 46 6 44" stroke="#FFD700" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M52 56 C56 52 58 46 58 44" stroke="#FFD700" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Stars above */}
    <polygon points="32,2 33,5 36,5 34,7 35,10 32,8 29,10 30,7 28,5 31,5" fill="#FFD700" />
  </svg>
);

export default CoatOfArms;
