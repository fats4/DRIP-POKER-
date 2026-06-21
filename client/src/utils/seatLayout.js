/** Ring anchors on octagonal DRIPSTER table — index 0 = bottom (hero). */
const RING = [
  { left: 50, top: 86 },
  { left: 16, top: 76 },
  { left: 5, top: 52 },
  { left: 10, top: 24 },
  { left: 28, top: 10 },
  { left: 50, top: 7 },
  { left: 72, top: 10 },
  { left: 90, top: 24 },
  { left: 95, top: 52 },
  { left: 84, top: 76 },
];

const ARC_INDICES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function pickArcRingIndices(count) {
  if (count <= 0) return [];
  if (count === 1) return [5];
  return Array.from({ length: count }, (_, i) =>
    ARC_INDICES[Math.round((i * (ARC_INDICES.length - 1)) / (count - 1))],
  );
}

function directionFromCenter(leftPct, topPct) {
  const x = parseFloat(leftPct);
  const y = parseFloat(topPct);
  const dx = 50 - x;
  const dy = 50 - y;
  const len = Math.hypot(dx, dy) || 1;
  return { dx: dx / len, dy: dy / len, x, y };
}

export function seatPosToStyle(pos) {
  if (!pos) return null;
  return {
    left: `${pos.left}%`,
    top: `${pos.top}%`,
    transform: 'translate(-50%, -50%)',
  };
}

/**
 * Distributes only occupied seats evenly: hero bottom-center,
 * opponents spaced across the top/side arc.
 */
export function buildSeatLayout(seats, heroSeatIndex = 0) {
  const occupied = seats.map((s, i) => (s.occupied ? i : -1)).filter((i) => i >= 0);

  if (occupied.length === 0) {
    return { positionMap: new Map(), displayOrder: new Map() };
  }

  const hero =
    heroSeatIndex >= 0 && seats[heroSeatIndex]?.occupied ? heroSeatIndex : occupied[0];

  const n = seats.length;
  const others = occupied
    .filter((i) => i !== hero)
    .sort((a, b) => ((a - hero + n) % n) - ((b - hero + n) % n));

  const positionMap = new Map();
  const displayOrder = new Map();

  positionMap.set(hero, RING[0]);
  displayOrder.set(hero, 1);

  const arcSlots = pickArcRingIndices(others.length);
  others.forEach((seatIdx, i) => {
    positionMap.set(seatIdx, RING[arcSlots[i]]);
    displayOrder.set(seatIdx, i + 2);
  });

  return { positionMap, displayOrder };
}

/** @deprecated use buildSeatLayout */
export function getSeatPositionStyle(seatIndex, totalSeats, heroSeatIndex = 0) {
  const seats = Array.from({ length: totalSeats }, (_, i) => ({ occupied: true }));
  const { positionMap } = buildSeatLayout(seats, heroSeatIndex);
  return seatPosToStyle(positionMap.get(seatIndex) ?? RING[0]);
}

export function getSeatStructure(style, isHero = false) {
  const { dx, dy } = directionFromCenter(style.left, style.top);
  const outwardX = -dx;
  const outwardY = -dy;
  const badgeDist = 22;
  const cardDist = isHero ? 38 : 26;
  const horizontalCards = Math.abs(dx) > Math.abs(dy);

  return {
    horizontalCards,
    badge: {
      transform: `translate(calc(-50% + ${outwardX * badgeDist}px), calc(-50% + ${outwardY * badgeDist}px))`,
    },
    cards: {
      transform: `translate(calc(-50% + ${dx * cardDist}px), calc(-50% + ${dy * cardDist}px))`,
    },
  };
}

export function getBetChipStyle(seatStyle, seatIndex) {
  const { x, y, dx, dy } = directionFromCenter(seatStyle.left, seatStyle.top);
  // Further toward center than hole cards (cards ~34–48px from anchor).
  const t = 0.42;
  const cx = x + (50 - x) * t;
  const cy = y + (50 - y) * t;
  // Slight perpendicular nudge so stacks don't sit under the card fan.
  const perpSign = seatIndex % 2 === 0 ? 1 : -1;
  const perp = 2.8 * perpSign;
  return {
    left: `${cx - dy * perp}%`,
    top: `${cy + dx * perp}%`,
    transform: 'translate(-50%, -50%)',
  };
}

export function getSeatCardSize(isHero = false) {
  return isHero ? 'sm' : 'xs';
}
