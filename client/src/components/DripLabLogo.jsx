import { useTheme } from '../hooks/useTheme';

const HEIGHTS = {
  sm: 'h-5',
  md: 'h-7',
  lg: 'h-9',
  xl: 'h-12',
};

export default function DripLabLogo({ size = 'md', className = '' }) {
  const { theme } = useTheme();
  const src = theme === 'dark' ? '/driplab-logo-white.png' : '/driplab-logo-black.png';

  return (
    <img
      src={src}
      alt="DRIP LAB"
      className={`${HEIGHTS[size] ?? HEIGHTS.md} w-auto object-contain ${className}`}
      draggable={false}
    />
  );
}
