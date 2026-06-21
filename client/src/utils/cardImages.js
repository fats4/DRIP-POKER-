const SUIT_FOLDERS = { h: 'Hearts', d: 'Diamonds', c: 'Clubs', s: 'Spades' };
const SUIT_FACE_PREFIX = { h: 'Heart', d: 'Diamond', c: 'Club', s: 'Spade' };

const FACE_FILES = {
  'h-J': 'Heart-Jack.png',
  'h-Q': 'Heart-Queen.png',
  'h-K': 'Heart-King.png',
  'd-J': 'Diamond-Jack.png',
  'd-Q': 'Diamond-Queen.png',
  'd-K': 'Diamond-king.png',
  'c-J': 'Club-Jack.png',
  'c-Q': 'Club-Queen.png',
  'c-K': 'Club-King.png',
  's-J': 'Spade-Jack.png',
  's-Q': 'Spade-Queen.png',
  's-K': 'Spade-King.png',
};

function encodePath(path) {
  return path.split('/').map((part) => encodeURIComponent(part)).join('/');
}

export function getCardImageSrc(rank, suit) {
  if (!rank || !suit) return null;

  if (rank === 'J' || rank === 'Q' || rank === 'K') {
    const file = FACE_FILES[`${suit}-${rank}`];
    return file ? encodePath(`/cards/${file}`) : null;
  }

  const folder = SUIT_FOLDERS[suit];
  const rankFile = rank === 'A' ? 'ace' : rank === 'T' ? '10' : rank;
  return encodePath(`/cards/numbers/${folder}/dripster-numbers playing cards-${rankFile}.png`);
}

export function getCardBackSrc() {
  return encodePath('/cards/back-of-card.png');
}

export const SAMPLE_CARDS = [
  { rank: 'A', suit: 's' },
  { rank: 'K', suit: 'h' },
  { rank: 'Q', suit: 'd' },
];
