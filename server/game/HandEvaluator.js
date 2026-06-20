import { cardValue } from './Deck.js';

const HAND_NAMES = [
  'High Card',
  'One Pair',
  'Two Pair',
  'Three of a Kind',
  'Straight',
  'Flush',
  'Full House',
  'Four of a Kind',
  'Straight Flush',
  'Royal Flush',
];

function combinations(arr, k) {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map((c) => [first, ...c]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

function isStraight(values) {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  if (sorted.length < 5) return null;

  for (let i = 0; i <= sorted.length - 5; i++) {
    const slice = sorted.slice(i, i + 5);
    if (slice[4] - slice[0] === 4) return slice[4];
  }

  // Wheel: A-2-3-4-5
  if (sorted.includes(14) && sorted.includes(2) && sorted.includes(3) &&
      sorted.includes(4) && sorted.includes(5)) {
    return 5;
  }
  return null;
}

function evaluateFive(cards) {
  const values = cards.map(cardValue).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);
  const isFlush = suits.every((s) => s === suits[0]);

  const counts = {};
  for (const v of values) counts[v] = (counts[v] || 0) + 1;
  const groups = Object.entries(counts)
    .map(([v, c]) => ({ value: +v, count: c }))
    .sort((a, b) => b.count - a.count || b.value - a.value);

  const straightHigh = isStraight(values);

  if (isFlush && straightHigh) {
    const isRoyal = straightHigh === 14 && values.includes(13);
    return {
      rank: isRoyal ? 9 : 8,
      name: isRoyal ? HAND_NAMES[9] : HAND_NAMES[8],
      tiebreak: [straightHigh],
    };
  }

  if (groups[0].count === 4) {
    const kicker = groups.find((g) => g.count === 1)?.value || 0;
    return { rank: 7, name: HAND_NAMES[7], tiebreak: [groups[0].value, kicker] };
  }

  if (groups[0].count === 3 && groups[1]?.count === 2) {
    return { rank: 6, name: HAND_NAMES[6], tiebreak: [groups[0].value, groups[1].value] };
  }

  if (isFlush) {
    return { rank: 5, name: HAND_NAMES[5], tiebreak: values };
  }

  if (straightHigh) {
    return { rank: 4, name: HAND_NAMES[4], tiebreak: [straightHigh] };
  }

  if (groups[0].count === 3) {
    const kickers = groups.filter((g) => g.count === 1).map((g) => g.value);
    return { rank: 3, name: HAND_NAMES[3], tiebreak: [groups[0].value, ...kickers] };
  }

  if (groups[0].count === 2 && groups[1]?.count === 2) {
    const pairs = [groups[0].value, groups[1].value].sort((a, b) => b - a);
    const kicker = groups.find((g) => g.count === 1)?.value || 0;
    return { rank: 2, name: HAND_NAMES[2], tiebreak: [...pairs, kicker] };
  }

  if (groups[0].count === 2) {
    const kickers = groups.filter((g) => g.count === 1).map((g) => g.value);
    return { rank: 1, name: HAND_NAMES[1], tiebreak: [groups[0].value, ...kickers] };
  }

  return { rank: 0, name: HAND_NAMES[0], tiebreak: values };
}

function compareTiebreak(a, b) {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function evaluateHand(holeCards, communityCards) {
  const all = [...holeCards, ...communityCards];
  if (all.length < 5) {
    return { rank: 0, name: 'Incomplete', tiebreak: all.map(cardValue).sort((a, b) => b - a) };
  }

  let best = null;
  for (const combo of combinations(all, 5)) {
    const result = evaluateFive(combo);
    if (!best || result.rank > best.rank ||
        (result.rank === best.rank && compareTiebreak(result.tiebreak, best.tiebreak) > 0)) {
      best = result;
    }
  }
  return best;
}

export function compareHands(handA, handB) {
  if (handA.rank !== handB.rank) return handA.rank - handB.rank;
  return compareTiebreak(handA.tiebreak, handB.tiebreak);
}

export { HAND_NAMES };
