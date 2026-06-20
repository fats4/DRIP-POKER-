export function decideBotAction(game, seatIndex) {
  const seat = game.room.seats[seatIndex];
  const callAmount = game.getCallAmount(seatIndex);
  const chips = seat.player.chips;
  const roll = Math.random();

  if (callAmount === 0) {
    if (roll < 0.65) return { action: 'check' };
    if (chips > game.minRaise * 2) {
      return { action: 'raise', amount: game.minRaise + Math.floor(Math.random() * game.minRaise * 2) };
    }
    return { action: 'check' };
  }

  if (callAmount >= chips) return { action: roll < 0.35 ? 'fold' : 'all-in' };

  if (callAmount > chips * 0.4) {
    if (roll < 0.45) return { action: 'fold' };
    if (roll < 0.9) return { action: 'call' };
    return { action: 'raise', amount: game.minRaise };
  }

  if (roll < 0.12) return { action: 'fold' };
  if (roll < 0.78) return { action: 'call' };
  if (chips > callAmount + game.minRaise) {
    return { action: 'raise', amount: game.minRaise + Math.floor(Math.random() * game.minRaise) };
  }
  return { action: 'call' };
}

export const BOT_NAMES = ['Ace', 'Bluff', 'Chip', 'Dealer', 'Flush', 'Ghost', 'High', 'Jack', 'King', 'Lucky'];
