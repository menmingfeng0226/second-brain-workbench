import React from 'react';

export interface IconProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
  strokeWidth?: number;
  fill?: string;
}

const defaultProps = {
  size: 24,
  strokeWidth: 2,
};

const createSvgProps = (props: IconProps) => ({
  width: props.size ?? defaultProps.size,
  height: props.size ?? defaultProps.size,
  viewBox: '0 0 24 24',
  fill: props.fill ?? 'none',
  stroke: props.color ?? 'currentColor',
  strokeWidth: props.strokeWidth ?? defaultProps.strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: props.className,
  style: props.style,
});

export const AlertTriangle: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const RefreshCw: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

export const Home: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const Sparkles: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

export const Search: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const Clock: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const Target: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const UserPlus: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

export const ShieldCheck: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const ArrowRight: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const Eye: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOff: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export const Loader2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const Wallet: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4Z" />
  </svg>
);

export const Handshake: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m11 17 2 2a1 1 0 1 0 3-3" />
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
    <path d="m21 3 1 11h-2" />
    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
    <path d="M3 4h8" />
  </svg>
);

export const CreditCard: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

export const Users: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const Building2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
);

export const Calendar: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const User: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const Mail: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const DollarSign: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const FileText: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

export const CalendarDays: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);

export const MapPin: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const ChevronRight: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const CheckCircle2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const Plus: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const Zap: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const PenTool: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m12 19 7-7 3 3-7 7-3-3z" />
    <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="m2 2 7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

export const Database: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);

export const TrendingUp: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

export const Settings: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const BarChart3: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);

export const Briefcase: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export const CheckCircle: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const Flag: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

export const Compass: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

export const Construction: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect x="2" y="6" width="20" height="8" rx="1" />
    <path d="M17 14v7" />
    <path d="M7 14v7" />
    <path d="M17 3v3" />
    <path d="M7 3v3" />
    <path d="M10 14 2.3 6.3" />
    <path d="m14 6 7.7 7.7" />
    <path d="m8 6 8 8" />
  </svg>
);

export const ArrowLeft: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const PenLine: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export const Upload: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const MessageCircle: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export const FolderKanban: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    <path d="M8 10v4" />
    <path d="M12 10v2" />
    <path d="M16 10v6" />
  </svg>
);

export const LayoutGrid: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

export const Lightbulb: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

export const Bell: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export const Link2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M9 17H7A5 5 0 0 1 7 7h2" />
    <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export const ClipboardList: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);

export const Pencil: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

export const Camera: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

export const Scissors: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="6" cy="6" r="3" />
    <path d="M8.12 8.12 12 12" />
    <path d="M20 4 8.12 15.88" />
    <circle cx="6" cy="18" r="3" />
    <path d="M14.8 14.8 20 20" />
  </svg>
);

export const Rocket: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

export const Archive: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
);

export const Type: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

export const Timer: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="10" y1="2" x2="14" y2="2" />
    <line x1="12" y1="14" x2="12" y2="10" />
    <circle cx="12" cy="14" r="8" />
  </svg>
);

export const Edit3: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export const BookOpen: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const GripVertical: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
);

export const Bolt: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export const Brain: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

export const BookmarkPlus: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    <line x1="12" y1="7" x2="12" y2="13" />
    <line x1="15" y1="10" x2="9" y2="10" />
  </svg>
);

export const BookMarked: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

export const Share2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const Download: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const UploadCloud: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
  </svg>
);

export const Folder: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  </svg>
);

export const ThumbsUp: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

export const Flame: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export const Trophy: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export const ChevronDown: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronUp: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

export const MoreHorizontal: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

export const PlusCircle: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export const MinusCircle: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export const XCircle: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const Star: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const TrendingDown: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

export const Filter: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const Grid3x3: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" />
    <path d="M3 15h18" />
    <path d="M9 3v18" />
    <path d="M15 3v18" />
  </svg>
);

export const LayoutList: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3 3h18v4H3z" />
    <path d="M3 10h18v4H3z" />
    <path d="M3 17h18v4H3z" />
  </svg>
);

export const Columns: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);

export const Pill: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>
);

export const Cloud: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
);

export const CloudRain: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M16 14v6" />
    <path d="M8 14v6" />
    <path d="M12 16v6" />
  </svg>
);

export const CloudSnow: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M8 15h.01" />
    <path d="M8 19h.01" />
    <path d="M12 17h.01" />
    <path d="M12 21h.01" />
    <path d="M16 15h.01" />
    <path d="M16 19h.01" />
  </svg>
);

export const CloudSun: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 2v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="M20 12h2" />
    <path d="m19.07 4.93-1.41 1.41" />
    <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128" />
    <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
  </svg>
);

export const CloudLightning: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
    <path d="m13 12-3 5h4l-3 5" />
  </svg>
);

export const Sun: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

export const Moon: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

export const Sunrise: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 2v8" />
    <path d="m4.93 10.93 1.41 1.41" />
    <path d="M2 18h2" />
    <path d="M20 18h2" />
    <path d="m19.07 10.93-1.41 1.41" />
    <path d="M22 22H2" />
    <path d="m8 6 4-4 4 4" />
    <path d="M16 18a4 4 0 0 0-8 0" />
  </svg>
);

export const Sunset: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 10V2" />
    <path d="m4.93 10.93 1.41 1.41" />
    <path d="M2 18h2" />
    <path d="M20 18h2" />
    <path d="m19.07 10.93-1.41 1.41" />
    <path d="M22 22H2" />
    <path d="m16 6-4 4-4-4" />
    <path d="M16 18a4 4 0 0 0-8 0" />
  </svg>
);

export const Thermometer: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
  </svg>
);

export const Droplets: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M7 16.3a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    <path d="M7.56 11.74A7 7 0 0 1 7 10c0-2.76 2.46-5 5.5-5S18 7.24 18 10a7 7 0 0 1-.56 1.74" />
    <path d="M11.5 6.5a7 7 0 0 0-2 4.24" />
  </svg>
);

export const Wind: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>
);

export const Umbrella: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M22 12a10.06 10.06 0 0 0-20 0Z" />
    <path d="M12 12v8a2 2 0 0 0 4 0" />
    <path d="M12 2v1" />
  </svg>
);

export const Music: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export const Headphones: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </svg>
);

export const Radio: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
  </svg>
);

export const Video: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m22 8-6 4 6 4V8Z" />
    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
  </svg>
);

export const Mic: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="12" height="18" x="6" y="2" rx="6" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

export const Film: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M7 3v18" />
    <path d="M3 7.5h4" />
    <path d="M3 12h18" />
    <path d="M3 16.5h4" />
    <path d="M17 3v18" />
    <path d="M17 7.5h4" />
    <path d="M17 16.5h4" />
  </svg>
);

export const Image: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

export const Play: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

export const Pause: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="4" height="16" x="6" y="4" rx="1" />
    <rect width="4" height="16" x="14" y="4" rx="1" />
  </svg>
);

export const SkipForward: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polygon points="5 4 15 12 5 20 5 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
);

export const SkipBack: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polygon points="19 20 9 12 19 4 19 20" />
    <line x1="5" y1="19" x2="5" y2="5" />
  </svg>
);

export const Volume2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

export const VolumeX: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

export const Heart: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const MessageSquare: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const Share: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

export const Send: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export const Phone: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const Smartphone: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </svg>
);

export const Tablet: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

export const Monitor: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export const Laptop: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
  </svg>
);

export const Printer: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
    <rect width="12" height="8" x="6" y="14" rx="1" />
  </svg>
);

export const Wifi: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M5 13a10 10 0 0 1 14 0" />
    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
    <path d="M2 8.82a15 15 0 0 1 20 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

export const WifiOff: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="2" y1="2" x2="22" y2="22" />
    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
    <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
    <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
    <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
    <path d="M5 13a10 10 0 0 1 5.24-2.76" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

export const Signal: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M2 20h.01" />
    <path d="M7 20v-4" />
    <path d="M12 20v-8" />
    <path d="M17 20V8" />
    <path d="M22 4v16" />
  </svg>
);

export const BatteryFull: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
    <line x1="22" y1="11" x2="22" y2="13" />
    <line x1="6" y1="11" x2="6" y2="13" />
    <line x1="10" y1="11" x2="10" y2="13" />
    <line x1="14" y1="11" x2="14" y2="13" />
  </svg>
);

export const BatteryCharging: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
    <path d="M6 7H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1" />
    <path d="m11 7-3 5h4l-3 5" />
    <line x1="23" y1="11" x2="23" y2="13" />
  </svg>
);

export const Lock: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const Unlock: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

export const Key: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);

export const Shield: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const ShieldAlert: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const UserCheck: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);

export const UserX: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="17" y1="8" x2="22" y2="13" />
    <line x1="22" y1="8" x2="17" y2="13" />
  </svg>
);

export const UserCog: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <circle cx="18" cy="12" r="3" />
    <path d="m18.6 13.4-.2-.2a1.6 1.6 0 0 1 0-2.4l.2-.2" />
    <path d="m16.4 13.4.2-.2a1.6 1.6 0 0 0 0-2.4l-.2-.2" />
    <path d="M20.3 12h1.7" />
    <path d="M14 12h1.7" />
    <circle cx="18" cy="12" r=".5" fill="currentColor" />
  </svg>
);

export const LogIn: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

export const LogOut: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const Sliders: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

export const Menu: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

export const X: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const BellOff: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5" />
    <path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export const ChevronLeft: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const ChevronsLeft: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="11 17 6 12 11 7" />
    <polyline points="18 17 13 12 18 7" />
  </svg>
);

export const ChevronsRight: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="13 17 18 12 13 7" />
    <polyline points="6 17 11 12 6 7" />
  </svg>
);

export const ArrowUp: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

export const ArrowDown: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

export const ArrowUpRight: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

export const ArrowDownRight: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="7" y1="7" x2="17" y2="17" />
    <polyline points="17 7 17 17 7 17" />
  </svg>
);

export const ArrowUpLeft: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="17" y1="17" x2="7" y2="7" />
    <polyline points="17 7 7 7 7 17" />
  </svg>
);

export const ArrowDownLeft: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="17" y1="7" x2="7" y2="17" />
    <polyline points="7 7 7 17 17 17" />
  </svg>
);

export const Maximize: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

export const Minimize: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="4" y1="14" x2="10" y2="14" />
    <line x1="10" y1="10" x2="10" y2="16" />
    <line x1="20" y1="10" x2="14" y2="10" />
    <line x1="14" y1="14" x2="14" y2="8" />
    <line x1="4" y1="14" x2="10" y2="14" />
    <line x1="20" y1="10" x2="14" y2="10" />
  </svg>
);

export const ExternalLink: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

export const Copy: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

export const Clipboard: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);

export const Paste: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
  </svg>
);

export const Edit: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export const Save: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

export const Trash: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export const Trash2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export const Delete: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
    <line x1="18" y1="9" x2="12" y2="15" />
    <line x1="12" y1="9" x2="18" y2="15" />
  </svg>
);

export const Repeat: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

export const RotateCcw: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const RotateCw: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

export const Undo: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
  </svg>
);

export const Redo: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
  </svg>
);

export const ZoomIn: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const ZoomOut: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const Crop: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M6 2v14a2 2 0 0 0 2 2h14" />
    <path d="M18 22V8a2 2 0 0 0-2-2H2" />
  </svg>
);

export const Move: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="5 9 2 12 5 15" />
    <polyline points="9 5 12 2 15 5" />
    <polyline points="15 19 12 22 9 19" />
    <polyline points="19 9 22 12 19 15" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);

export const Layers: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const Box: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m21 8-9 4-9-4 9-4Z" />
    <path d="M3 8v8l9 4 9-4V8" />
    <path d="m12 12 9-4" />
    <path d="m12 12-9-4" />
    <path d="m12 12v8" />
  </svg>
);

export const Package: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M7.5 4.21 12 2.25l4.5 1.96" />
    <path d="m7.5 4.21 4.5 1.96 4.5-1.96" />
    <path d="m7.5 4.21v5.1l4.5 2.01V6.17" />
    <path d="m16.5 4.21v5.1L12 11.32V6.17" />
    <path d="M3.27 6.96 12 11.32l8.73-4.36" />
    <path d="M3.27 6.96A2 2 0 0 0 2 8.83v6.34a2 2 0 0 0 1.27 1.87L12 21.32" />
    <path d="M20.73 6.96A2 2 0 0 1 22 8.83v6.34a2 2 0 0 1-1.27 1.87L12 21.32" />
  </svg>
);

export const Truck: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
);

export const ShoppingCart: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

export const Tag: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);

export const Tags: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m15 5 4.3 4.3a2.4 2.4 0 0 1 0 3.4L13.4 18.6a2.41 2.41 0 0 1-3.4 0l-4.3-4.3a2.41 2.41 0 0 1 0-3.4L11.6 5a2.4 2.4 0 0 1 3.4 0z" />
    <path d="m9.58 9.87 4.95-4.95" />
    <path d="M7 8h.01" />
    <path d="M4.6 12.87a2.41 2.41 0 0 0 0 3.4l2.83 2.83" />
  </svg>
);

export const Receipt: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 17.5V17" />
  </svg>
);

export const FileSpreadsheet: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M8 13h8" />
    <path d="M8 17h8" />
    <path d="M10 11v10" />
    <path d="M14 11v10" />
  </svg>
);

export const FileImage: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <circle cx="9" cy="15" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

export const FileVideo: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="m10 11 5 3-5 3v-6Z" />
  </svg>
);

export const FileAudio: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 17v-4l4-2v4" />
    <path d="M10 15.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    <path d="M14 13.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
  </svg>
);

export const FileArchive: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 12v-1" />
    <path d="M10 18v-2" />
    <path d="M10 16v-2" />
    <path d="M10 14v-2" />
    <path d="M10 10V9" />
    <circle cx="10" cy="20" r="1" fill="currentColor" />
  </svg>
);

export const FileCode: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <polyline points="10 13 8 15 10 17" />
    <polyline points="14 13 16 15 14 17" />
  </svg>
);

export const FolderOpen: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
  </svg>
);

export const Inbox: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export const PieChart: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

export const BarChart: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

export const BarChart2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export const BarChart4: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3 3v18h18" />
    <path d="M7 16V8" />
    <path d="M11 16V5" />
    <path d="M15 16v-5" />
    <path d="M19 16v-9" />
  </svg>
);

export const LineChart: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

export const Activity: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

export const Globe: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

export const Globe2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
  </svg>
);

export const Map: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

export const Navigation: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
);

export const Bookmark: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

export const Book: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

export const GraduationCap: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

export const Award: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

export const BadgeCheck: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const BadgeDollarSign: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 6V4" />
    <path d="M12 20v-2" />
  </svg>
);

export const BadgePercent: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="15" x2="15.01" y2="15" />
  </svg>
);

export const BadgeIndianRupee: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="M8 8h8" />
    <path d="M8 12h8" />
    <path d="m13 17-5-5c0-2 2-4 4-4" />
    <path d="M8 12h2a2 2 0 1 1 0 4" />
  </svg>
);

export const Building: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

export const Factory: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M17 18h1" />
    <path d="M12 18h1" />
    <path d="M7 18h1" />
  </svg>
);

export const Store: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63h-.02a2.7 2.7 0 0 1-3.17 0 2.7 2.7 0 0 1-3.18 0 2.7 2.7 0 0 1-3.18 0 2.7 2.7 0 0 1-3.17 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
  </svg>
);

export const Hotel: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M10 22v-6.57" />
    <path d="M12 11h.01" />
    <path d="M12 7h.01" />
    <path d="M14 15.43V22" />
    <path d="M15 16a5 5 0 0 0-6 0" />
    <path d="M16 11h.01" />
    <path d="M16 7h.01" />
    <path d="M8 11h.01" />
    <path d="M8 7h.01" />
    <path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18Z" />
    <path d="M4 17h16" />
    <path d="M9 22h6" />
  </svg>
);

export const Utensils: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

export const Coffee: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M10 2v2" />
    <path d="M14 2v2" />
    <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
    <path d="M6 2v2" />
  </svg>
);

export const Pizza: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 11h.01" />
    <path d="M11 15h.01" />
    <path d="M16 16h.01" />
    <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
    <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
  </svg>
);

export const Cake: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
    <path d="M2 21h20" />
    <path d="M7 8h.01" />
    <path d="M12 8h.01" />
    <path d="M17 8h.01" />
  </svg>
);

export const Apple: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
    <path d="M10 2c1 .5 2 2 2 5" />
  </svg>
);

export const Cherry: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-5-2.76 0-5 2.24-5 5Z" />
    <path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-5-2.76 0-5 2.24-5 5Z" />
    <path d="M7 12c0-1.5-1-4.5-2-4.5S4 10.5 4 12" />
    <path d="M22 12c0-1.5-1-4.5-2-4.5s-2 3-2 4.5" />
    <path d="M7 12c.5-1.5 2.5-4 4-5 2.5 1.5 3.5 3.5 4 5" />
    <path d="M11 7V3l3 .5L11 7Z" />
  </svg>
);

export const Banana: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 13c3.5-2 8-2 10 2a5.5 5.5 0 0 1 8 5" />
    <path d="M5.15 17.89c5.52-1.52 8.65-6.89 11-11.69 1.55-3.13 2.46-3.77 4.09-3.41" />
  </svg>
);

export const Citrus: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M21.66 17.67a1.08 1.08 0 0 1-.05 1.61A12 12 0 0 1 12 21a12 12 0 0 1-9.67-1.77 1.08 1.08 0 0 1-.05-1.61l3.66-3.49a1.08 1.08 0 0 1 1.61.05 7 7 0 0 0 8.9.05 1.08 1.08 0 0 1 1.61-.05Z" />
    <path d="M8 3.5a6 6 0 0 1 6 6" />
    <path d="M2 2h4" />
    <path d="M2 6h2" />
    <path d="M6 10h2" />
    <path d="M19 19l1.5 1.5" />
    <path d="M12 8v8" />
    <path d="m8 12 4-4" />
  </svg>
);

export const Carrot: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3.34 16.12a2 2 0 0 0 2.54 2.54c1.51-.39 4.06-1.56 6.07-3.56 2-2 3.17-4.56 3.56-6.07a2 2 0 0 0-2.54-2.54C11.36 6.87 6.87 11.36 3.34 16.12Z" />
    <path d="M14.58 3.42 16 2l2 2-1.42 1.42" />
    <path d="M9.5 5.5 11 4l2 2-1.5 1.5" />
    <path d="M6.5 8.5 8 7l2 2-1.5 1.5" />
  </svg>
);

export const Leaf: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

export const TreeDeciduous: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z" />
    <path d="M12 19v3" />
  </svg>
);

export const TreePine: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z" />
    <path d="M12 22v-3" />
  </svg>
);

export const Flower2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1" />
    <circle cx="12" cy="11" r="3" />
    <path d="M12 22v-4a3 3 0 0 0-6 0" />
    <path d="M12 22v-4a3 3 0 0 1 6 0" />
  </svg>
);

export const Sprout: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M7 20h10" />
    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
  </svg>
);

export const Cpu: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="16" height="16" x="4" y="4" rx="2" />
    <rect width="6" height="6" x="9" y="9" />
    <path d="M15 2v2" />
    <path d="M15 20v2" />
    <path d="M2 15h2" />
    <path d="M2 9h2" />
    <path d="M20 15h2" />
    <path d="M20 9h2" />
    <path d="M9 2v2" />
    <path d="M9 20v2" />
  </svg>
);

export const Processor: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="16" height="16" x="4" y="4" rx="2" />
    <rect width="6" height="6" x="9" y="9" />
    <path d="M15 2v2" />
    <path d="M15 20v2" />
    <path d="M2 15h2" />
    <path d="M2 9h2" />
    <path d="M20 15h2" />
    <path d="M20 9h2" />
    <path d="M9 2v2" />
    <path d="M9 20v2" />
  </svg>
);

export const HardDrive: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="22" y1="12" x2="2" y2="12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    <line x1="6" y1="16" x2="6.01" y2="16" />
    <line x1="10" y1="16" x2="10.01" y2="16" />
  </svg>
);

export const Server: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

export const Terminal: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export const Code: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const Binary: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M0 12h3v8H0z" />
    <path d="M18 4h3v16h-3z" />
    <rect width="6" height="16" x="7" y="4" rx="2" />
  </svg>
);

export const Braces: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" />
    <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5c0 1.1-.9 2-2 2h-1" />
  </svg>
);

export const Brackets: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 4h3v16H4z" />
    <path d="M17 4h3v16h-3z" />
  </svg>
);

export const FileJson: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
    <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
  </svg>
);

export const FileType: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M9 13V11h6v2" />
    <path d="M12 11v8" />
    <path d="M9 19h6" />
  </svg>
);

export const GitBranch: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
);

export const GitCommit: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="3" />
    <line x1="3" y1="12" x2="9" y2="12" />
    <line x1="15" y1="12" x2="21" y2="12" />
  </svg>
);

export const GitPullRequest: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
    <line x1="6" y1="9" x2="6" y2="21" />
  </svg>
);

export const GitPullRequestClosed: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="6" cy="6" r="3" />
    <path d="M6 9v12" />
    <path d="m21 3-6 6" />
    <path d="m21 9-6-6" />
    <path d="M18 11.5V15" />
    <circle cx="18" cy="18" r="3" />
  </svg>
);

export const GitPullRequestDraft: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M18 6v6a2 2 0 0 1-2 2H8" />
    <path d="M6 9v12" />
    <line x1="17" y1="6" x2="19" y2="6" />
  </svg>
);

export const Github: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Gitlab: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m22 13.29-3.33-10a.42.42 0 0 0-.41-.29.42.42 0 0 0-.41.29l-2.25 6.73H8.4L6.15 3.3a.42.42 0 0 0-.41-.31.42.42 0 0 0-.4.3L2 13.29a1.54 1.54 0 0 0 .56 1.72L12 22l9.44-7A1.54 1.54 0 0 0 22 13.29Z" />
  </svg>
);

export const Instagram: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export const Twitter: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export const Facebook: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const Linkedin: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const Youtube: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

export const Twitch: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7" />
  </svg>
);

export const Tiktok: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export const AtSign: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
  </svg>
);

export const Hash: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

export const FlowerIcon: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1" />
    <circle cx="12" cy="11" r="3" />
    <path d="M12 22v-4a3 3 0 0 0-6 0" />
    <path d="M12 22v-4a3 3 0 0 1 6 0" />
  </svg>
);

export const LightbulbIcon = Lightbulb;
export const CheckCircle2Icon = CheckCircle2;
export const CameraIcon = Camera;
export const EyeIcon = Eye;
export const EyeOffIcon = EyeOff;
export const UsersIcon = Users;
export const UserIcon = User;
export const SettingsIcon = Settings;
export const MenuIcon = Menu;
export const XIcon = X;
export const BellIcon = Bell;
export const SearchIcon = Search;
export const ScissorsIcon = Scissors;
export const DownloadIcon = Download;
export const UploadIcon = Upload;
export const RefreshCwIcon = RefreshCw;
export const LayersIcon = Layers;
export const ReceiptIcon = Receipt;
export const BarChartIcon = BarChart3;
export const ActivityIcon = Activity;
export const PieChartIcon = PieChart;
export const MapPinIcon = MapPin;
export const MapIcon = Map;
export const CompassIcon = Compass;
export const BookmarkIcon = Bookmark;
export const BookIcon = Book;
export const BookMarkedIcon = BookMarked;
export const AwardIcon = Award;
export const BuildingIcon = Building;
export const Building2Icon = Building2;
export const CpuIcon = Cpu;
export const HardDriveIcon = HardDrive;
export const DatabaseIcon = Database;
export const ServerIcon = Server;
export const CodeIcon = Code;
export const MailIcon = Mail;
export const SendIcon = Send;
export const InboxIcon = Inbox;
export const MessageSquareIcon = MessageSquare;
export const MessageCircleIcon = MessageCircle;
export const FileIcon = FileText;
export const FolderIcon = Folder;
export const ArchiveIcon = Archive;
export const AtSignIcon = AtSign;

export const Circle: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export const History: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

export const Unlink2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M15 7h2a5 5 0 0 1 5 5" />
    <path d="M9 17H7a5 5 0 0 1-5-5" />
    <line x1="8" y1="12" x2="12" y2="12" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export const PlayCircle: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

export const Check: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const Info: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const LockKeyhole: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="16" r="1" />
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const CircleDot: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

export const ListTodo: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect x="3" y="5" width="6" height="6" rx="1" />
    <path d="m3 17 2 2 4-4" />
    <path d="M13 6h8" />
    <path d="M13 12h8" />
    <path d="M13 18h8" />
  </svg>
);

export const CheckSquare: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m9 11 3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

export const MessageSquarePlus: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="12" y1="8" x2="12" y2="14" />
    <line x1="9" y1="11" x2="15" y2="11" />
  </svg>
);

export const BookA: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    <path d="m8 13 4-7 4 7" />
    <path d="M9.1 11h5.7" />
  </svg>
);

export const Wand2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z" />
    <path d="m14 7 3 3" />
    <path d="M5 6v4" />
    <path d="M19 14v4" />
    <path d="M10 2v2" />
    <path d="M7 8H3" />
    <path d="M21 16h-4" />
    <path d="M11 3H9" />
  </svg>
);

export const Shuffle: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
    <path d="m18 2 4 4-4 4" />
    <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
    <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
    <path d="m18 14 4 4-4 4" />
  </svg>
);

export const BrainCircuit: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
    <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
    <path d="M6 18a4 4 0 0 1-1.967-.516" />
    <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    <line x1="12" y1="12" x2="12" y2="13" />
  </svg>
);

export const CalendarCheck2: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="m9 16 2 2 4-4" />
  </svg>
);

export const Quote: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 6 6 0 0 1-6 6v-2a4 4 0 0 0 4-4V5a2 2 0 0 0-2-2Z" />
    <path d="M26 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 6 6 0 0 1-6 6v-2a4 4 0 0 0 4-4V5a2 2 0 0 0-2-2Z" />
  </svg>
);

export const Coins: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);

export const CalendarRange: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M7 14h4" />
    <path d="M13 18h4" />
  </svg>
);

export const Link: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const ListVideo: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 12H3" />
    <path d="M16 6H3" />
    <path d="M12 18H3" />
    <path d="m16 12 5 3-5 3v-6Z" />
  </svg>
);

export const AlignLeft: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="15" y1="12" x2="3" y2="12" />
    <line x1="17" y1="18" x2="3" y2="18" />
  </svg>
);

export const ArrowUpDown: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="m21 16-4 4-4-4" />
    <path d="M17 20V4" />
    <path d="m3 8 4-4 4 4" />
    <path d="M7 4v16" />
  </svg>
);

export const ArrowLeftRight: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M8 3 4 7l4 4" />
    <path d="M4 7h16" />
    <path d="m16 21 4-4-4-4" />
    <path d="M20 17H4" />
  </svg>
);

export const DownloadCloud: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m8 17 4 4 4-4" />
  </svg>
);

export const Kanban: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M6 5v11" />
    <path d="M12 5v6" />
    <path d="M18 5v14" />
    <rect width="20" height="16" x="2" y="3" rx="2" />
  </svg>
);

export const AlertOctagon: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M12 2 22 12 12 22 2 12z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const Layout: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

export const Diamond: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0Z" />
    <path d="M14 7.5h.01" />
    <path d="m9.5 9.5 2.5 5 2.5-5-2.5-5Z" />
  </svg>
);

export const iconMap: Record<string, React.FC<IconProps>> = {
  AlertTriangle,
  RefreshCw,
  Home,
  Sparkles,
  Search,
  Clock,
  Target,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Wallet,
  Handshake,
  CreditCard,
  Users,
  Building2,
  Calendar,
  User,
  Mail,
  DollarSign,
  FileText,
  CalendarDays,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Plus,
  Zap,
  PenTool,
  Database,
  TrendingUp,
  Settings,
  BarChart3,
  Briefcase,
  CheckCircle,
  Flag,
  Compass,
  Construction,
  ArrowLeft,
  PenLine,
  Upload,
  MessageCircle,
  FolderKanban,
  LayoutGrid,
  Lightbulb,
  Bell,
  Link2,
  ClipboardList,
  Pencil,
  Camera,
  Scissors,
  Rocket,
  Archive,
  Type,
  Timer,
  Edit3,
  BookOpen,
  GripVertical,
  Bolt,
  Brain,
  BookmarkPlus,
  BookMarked,
  Share2,
  Download,
  UploadCloud,
  Folder,
  LightbulbIcon,
  ThumbsUp,
  Flame,
  Trophy,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  PlusCircle,
  MinusCircle,
  XCircle,
  CheckCircle2Icon,
  Star,
  TrendingDown,
  Filter,
  Grid3x3,
  LayoutList,
  Columns,
  Pill,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  CloudLightning,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Thermometer,
  Droplets,
  Wind,
  Umbrella,
  Music,
  Headphones,
  Radio,
  Video,
  Mic,
  CameraIcon,
  Film,
  Image,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Heart,
  MessageSquare,
  Share,
  Send,
  Phone,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Printer,
  Wifi,
  WifiOff,
  Signal,
  BatteryFull,
  BatteryCharging,
  Lock,
  Unlock,
  Key,
  Shield,
  ShieldAlert,
  EyeIcon,
  EyeOffIcon,
  UserCheck,
  UserX,
  UserCog,
  UsersIcon,
  UserIcon,
  LogIn,
  LogOut,
  SettingsIcon,
  Sliders,
  Menu,
  X,
  MenuIcon,
  XIcon,
  BellIcon,
  BellOff,
  SearchIcon,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  Maximize,
  Minimize,
  ExternalLink,
  Copy,
  Clipboard,
  Paste,
  ScissorsIcon,
  Edit,
  Save,
  Trash,
  Trash2,
  Delete,
  DownloadIcon,
  UploadIcon,
  RefreshCwIcon,
  Repeat,
  RotateCcw,
  RotateCw,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Crop,
  Move,
  Layers,
  LayersIcon,
  Box,
  Package,
  Truck,
  ShoppingCart,
  Tag,
  Tags,
  Receipt,
  ReceiptIcon,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileIcon,
  FolderOpen,
  FolderIcon,
  Inbox,
  ArchiveIcon,
  PieChart,
  BarChart,
  BarChart2,
  BarChart4,
  BarChartIcon,
  LineChart,
  Activity,
  ActivityIcon,
  PieChartIcon,
  Globe,
  Globe2,
  Map,
  MapPinIcon,
  MapIcon,
  Navigation,
  CompassIcon,
  Bookmark,
  BookmarkIcon,
  BookIcon,
  Book,
  BookMarkedIcon,
  GraduationCap,
  Award,
  AwardIcon,
  BadgeCheck,
  BadgeDollarSign,
  BadgePercent,
  BadgeIndianRupee,
  Building,
  BuildingIcon,
  Building2Icon,
  Factory,
  Store,
  Hotel,
  Utensils,
  Coffee,
  Pizza,
  Cake,
  Apple,
  Cherry,
  Banana,
  Citrus,
  Carrot,
  Leaf,
  TreeDeciduous,
  TreePine,
  Flower2,
  FlowerIcon,
  Sprout,
  Cpu,
  CpuIcon,
  Processor,
  HardDrive,
  HardDriveIcon,
  DatabaseIcon,
  Server,
  ServerIcon,
  Terminal,
  Code,
  CodeIcon,
  Binary,
  Braces,
  Brackets,
  FileJson,
  FileType,
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitPullRequestClosed,
  GitPullRequestDraft,
  Github,
  Gitlab,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Twitch,
  Tiktok,
  MailIcon,
  SendIcon,
  InboxIcon,
  MessageSquareIcon,
  MessageCircleIcon,
  AtSign,
  Hash,
  AtSignIcon,
  Circle,
  History,
  Unlink2,
  PlayCircle,
  Check,
  Info,
  LockKeyhole,
  CircleDot,
  ListTodo,
  CheckSquare,
  MessageSquarePlus,
  BookA,
  Wand2,
  Shuffle,
  BrainCircuit,
  CalendarCheck2,
  Quote,
  Coins,
  CalendarRange,
  Link,
  ListVideo,
  AlignLeft,
  ArrowUpDown,
  ArrowLeftRight,
  DownloadCloud,
  Kanban,
  AlertOctagon,
  Layout,
  Diamond,
};

export type IconName = keyof typeof iconMap;

const QuestionMarkIcon: React.FC<IconProps> = (props) => (
  <svg {...createSvgProps(props)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export function getIcon(name: IconName | string): React.FC<any> {
  return iconMap[name] ?? QuestionMarkIcon;
}
