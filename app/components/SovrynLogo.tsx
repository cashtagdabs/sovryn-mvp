/**
 * Sovryn AI Logo Component
 * Custom SVG-based logo with purple/fuchsia gradient branding
 */
export function SovrynLogo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" /> {/* purple-600 */}
          <stop offset="100%" stopColor="#ec4899" /> {/* pink-500 */}
        </linearGradient>
      </defs>

      {/* Outer Ring */}
      <circle cx="100" cy="100" r="95" stroke="url(#logoGradient)" strokeWidth="3" opacity="0.6" />

      {/* Inner Decorative Circle */}
      <circle cx="100" cy="100" r="70" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.3" />

      {/* Center Icon: Stylized "S" Shape */}
      <g transform="translate(100, 100)">
        {/* Top Arc */}
        <path
          d="M -20 -15 Q -20 -25 -10 -25 Q 0 -25 0 -15"
          stroke="url(#logoGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Middle Bridge */}
        <line x1="-8" y1="0" x2="8" y2="0" stroke="url(#logoGradient)" strokeWidth="5" strokeLinecap="round" />
        {/* Bottom Arc */}
        <path
          d="M 20 15 Q 20 25 10 25 Q 0 25 0 15"
          stroke="url(#logoGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Accent Dots */}
      <circle cx="160" cy="50" r="4" fill="url(#logoGradient)" opacity="0.7" />
      <circle cx="40" cy="160" r="4" fill="url(#logoGradient)" opacity="0.7" />
    </svg>
  );
}
