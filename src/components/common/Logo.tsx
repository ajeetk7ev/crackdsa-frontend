interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number;
  textColorClass?: string;
}

export function Logo({ className = "", iconOnly = false, size = 32, textColorClass = "text-foreground" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 font-bold tracking-tight select-none ${className}`}>
      {/* Sleek SVG Icon representing 'Crack' + 'DSA' */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
            <stop offset="50%" stopColor="#8b5cf6" /> {/* Purple */}
            <stop offset="100%" stopColor="#10b981" /> {/* Emerald */}
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Hexagonal Outer Frame */}
        <polygon
          points="50,5 90,25 90,75 50,95 10,75 10,25"
          fill="url(#logo-grad)"
          fillOpacity="0.08"
          stroke="url(#logo-grad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* DSA Nodes/Network subtle background */}
        <circle cx="50" cy="18" r="3" fill="#6366f1" />
        <circle cx="82" cy="32" r="3" fill="#8b5cf6" />
        <circle cx="82" cy="68" r="3" fill="#10b981" />
        <circle cx="18" cy="32" r="3" fill="#6366f1" />
        <circle cx="18" cy="68" r="3" fill="#10b981" />
        
        {/* Left angle bracket < */}
        <path
          d="M 38,32 L 24,50 L 38,68"
          stroke="#6366f1"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right angle bracket > */}
        <path
          d="M 62,32 L 76,50 L 62,68"
          stroke="#10b981"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Glowing Lightning/Crack Bolt in center */}
        <path
          d="M 58,22 L 36,54 L 48,54 L 42,78 L 64,46 L 52,46 Z"
          fill="url(#logo-grad)"
          filter="url(#glow)"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {!iconOnly && (
        <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 bg-clip-text text-transparent font-sans">
          Crack<span className={textColorClass}>DSA</span>
        </span>
      )}
    </div>
  );
}
export default Logo;
