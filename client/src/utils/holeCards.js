const PAIR_LABELS = {
  '2': 'Pair of 2s',
  '3': 'Pair of 3s',
  '4': 'Pair of 4s',
  '5': 'Pair of 5s',
  '6': 'Pair of 6s',
  '7': 'Pair of 7s',
  '8': 'Pair of 8s',
  '9': 'Pair of 9s',
  T: 'Pair of 10s',
  J: 'Pair of Jacks',
  Q: 'Pair of Queens',
  K: 'Pair of Kings',
  A: 'Pair of Aces',
};

/** Returns pocket pair info when both hole cards share the same rank. */
export function getHolePair(cards) {
  if (!cards || cards.length < 2) return null;
  if (cards[0]?.hidden || cards[1]?.hidden) return null;
  if (!cards[0]?.rank || cards[0].rank !== cards[1].rank) return null;

  return {
    rank: cards[0].rank,
    label: PAIR_LABELS[cards[0].rank] || `Pair of ${cards[0].rank}s`,
  };
}
