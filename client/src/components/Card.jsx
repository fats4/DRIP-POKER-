import { getCardImageSrc, getCardBackSrc } from '../utils/cardImages';

const SIZES = {
  xs: 'w-[clamp(2rem,4.5vw,2.75rem)] aspect-[5/7]',
  sm: 'w-[clamp(2.75rem,6vw,4rem)] aspect-[5/7]',
  md: 'w-[clamp(3.25rem,7.5vw,5rem)] aspect-[5/7]',
  lg: 'w-[clamp(4rem,9vw,6.25rem)] aspect-[5/7]',
  xl: 'w-[clamp(4.75rem,11vw,7.5rem)] aspect-[5/7]',
  board: 'w-[clamp(3.5rem,8.5vw,6.5rem)] aspect-[5/7]',
};

export default function Card({ card, size = 'md', small = false }) {
  const sizeClass = small ? SIZES.sm : SIZES[size] || SIZES.md;

  if (!card) return null;

  if (card.hidden) {
    return (
      <div
        className={`${sizeClass} rounded-lg overflow-hidden card-deal shadow-lg shadow-black/50 ring-1 ring-black/20`}
      >
        <img
          src={getCardBackSrc()}
          alt="Card back"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
    );
  }

  const src = getCardImageSrc(card.rank, card.suit);

  if (!src) {
    return (
      <div className={`${sizeClass} rounded-lg bg-drip-cream flex items-center justify-center text-drip-purple font-bold card-deal`}>
        {card.rank}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-lg overflow-hidden card-deal shadow-lg shadow-black/50 ring-1 ring-black/20 hover:ring-drip-purple/50 transition-shadow`}
    >
      <img
        src={src}
        alt={`${card.rank}${card.suit}`}
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}

export { getCardBackSrc };
