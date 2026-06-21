import { getCardBackSrc, getCardImageSrc } from '../utils/cardImages';

/** Scattered floating cards — spaced apart, not a full grid. */
const CARDS = [
  { src: getCardBackSrc(), top: '5%', left: '4%', rot: -22, size: 'w-28 lg:w-36', opacity: 0.45, delay: '0s', dur: '9s' },
  { src: getCardImageSrc('K', 's'), top: '14%', left: '18%', rot: 12, size: 'w-24 lg:w-32', opacity: 0.4, delay: '-2s', dur: '11s' },
  { src: getCardBackSrc(), top: '8%', right: '6%', rot: 16, size: 'w-32 lg:w-40', opacity: 0.42, delay: '-1s', dur: '10s' },
  { src: getCardImageSrc('Q', 'h'), top: '22%', right: '14%', rot: -10, size: 'w-26 lg:w-34', opacity: 0.38, delay: '-3s', dur: '8s' },
  { src: getCardBackSrc(), top: '38%', left: '2%', rot: 8, size: 'w-32 lg:w-40', opacity: 0.35, delay: '-4s', dur: '12s' },
  { src: getCardImageSrc('A', 'd'), top: '48%', left: '12%', rot: -14, size: 'w-24 lg:w-32', opacity: 0.4, delay: '-1.5s', dur: '9s' },
  { src: getCardBackSrc(), top: '55%', right: '3%', rot: 20, size: 'w-36 lg:w-44', opacity: 0.43, delay: '-2.5s', dur: '10s' },
  { src: getCardImageSrc('J', 'c'), top: '68%', right: '16%', rot: -8, size: 'w-26 lg:w-32', opacity: 0.36, delay: '-5s', dur: '11s' },
  { src: getCardBackSrc(), top: '72%', left: '6%', rot: 6, size: 'w-28 lg:w-36', opacity: 0.38, delay: '-3.5s', dur: '9s' },
  { src: getCardImageSrc('9', 'h'), top: '82%', left: '20%', rot: -16, size: 'w-22 lg:w-28', opacity: 0.32, delay: '-6s', dur: '10s' },
  { src: getCardBackSrc(), top: '86%', right: '8%', rot: 10, size: 'w-32 lg:w-40', opacity: 0.4, delay: '-4.5s', dur: '8s' },
  { src: getCardImageSrc('A', 's'), top: '30%', right: '22%', rot: -18, size: 'w-24 lg:w-32', opacity: 0.33, delay: '-7s', dur: '12s' },
  { src: getCardBackSrc(), top: '42%', left: '22%', rot: 14, size: 'w-22 lg:w-28', opacity: 0.28, delay: '-2s', dur: '11s' },
  { src: getCardImageSrc('K', 'h'), top: '62%', left: '24%', rot: -6, size: 'w-26 lg:w-32', opacity: 0.3, delay: '-5.5s', dur: '9s' },
];

export default function LobbyCardBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-40 dark:opacity-100" aria-hidden>
      {CARDS.map((card, i) => (
        <div
          key={i}
          className={`absolute ${card.size} aspect-[5/7] lobby-card-float`}
          style={{
            top: card.top,
            left: card.left,
            right: card.right,
            opacity: card.opacity,
            animationDelay: card.delay,
            animationDuration: card.dur,
            ['--rot']: `${card.rot}deg`,
          }}
        >
          <img
            src={card.src}
            alt=""
            className="w-full h-full object-cover rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/15"
            draggable={false}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-[#050505]/72" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,5,0.4)_100%)]" />
    </div>
  );
}
