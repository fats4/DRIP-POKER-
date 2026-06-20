import { createDeck, shuffleDeck } from './Deck.js';
import { evaluateHand, compareHands } from './HandEvaluator.js';

const SMALL_BLIND = 10;
const BIG_BLIND = 20;
const STARTING_CHIPS = 1000;
const ACTION_TIMEOUT_MS = 30000;

const PHASES = ['preflop', 'flop', 'turn', 'river', 'showdown'];

export class PokerGame {
  constructor(room) {
    this.room = room;
    this.phase = 'waiting';
    this.deck = [];
    this.communityCards = [];
    this.pot = 0;
    this.sidePots = [];
    this.currentBet = 0;
    this.minRaise = BIG_BLIND;
    this.dealerIndex = -1;
    this.activeIndex = -1;
    this.lastRaiserIndex = -1;
    this.actionDeadline = null;
    this.winners = [];
    this.winMessage = '';
    this.handNumber = 0;
    this.actedThisRound = new Set();
  }

  resetForNewHand() {
    this.phase = 'waiting';
    this.deck = [];
    this.communityCards = [];
    this.pot = 0;
    this.sidePots = [];
    this.currentBet = 0;
    this.minRaise = BIG_BLIND;
    this.activeIndex = -1;
    this.lastRaiserIndex = -1;
    this.actionDeadline = null;
    this.winners = [];
    this.winMessage = '';
    this.actedThisRound = new Set();

    for (const seat of this.room.seats) {
      if (seat.player) {
        seat.holeCards = [];
        seat.currentBet = 0;
        seat.totalBetThisHand = 0;
        seat.hasFolded = false;
        seat.isAllIn = false;
        seat.lastAction = null;
        seat.handResult = null;
      }
    }
  }

  getActiveSeats() {
    return this.room.seats.filter((s) => s.player && s.player.chips > 0);
  }

  getPlayersInHand() {
    return this.room.seats.filter((s) => s.player && !s.hasFolded && (s.player.chips > 0 || s.isAllIn));
  }

  getPlayersWhoCanAct() {
    return this.room.seats.filter(
      (s) => s.player && !s.hasFolded && !s.isAllIn && s.player.chips > 0
    );
  }

  canStart() {
    const active = this.getActiveSeats();
    return active.length >= 2 && this.phase === 'waiting';
  }

  startHand() {
    if (!this.canStart()) return { ok: false, error: 'At least 2 players with chips are required' };

    this.handNumber++;
    this.resetForNewHand();
    this.phase = 'preflop';

    const activeIndices = this.room.seats
      .map((s, i) => (s.player && s.player.chips > 0 ? i : -1))
      .filter((i) => i >= 0);

    this.dealerIndex = activeIndices[(this.dealerIndex + 1) % activeIndices.length] ||
      activeIndices[0];
    const dealerPos = activeIndices.indexOf(this.dealerIndex);

    const sbIndex = activeIndices[(dealerPos + 1) % activeIndices.length];
    const bbIndex = activeIndices[(dealerPos + 2) % activeIndices.length];

    this.deck = shuffleDeck(createDeck());

    for (const idx of activeIndices) {
      this.room.seats[idx].holeCards = [this.deck.pop(), this.deck.pop()];
    }

    this.postBlind(sbIndex, SMALL_BLIND, 'small blind');
    this.postBlind(bbIndex, BIG_BLIND, 'big blind');

    this.currentBet = BIG_BLIND;
    this.minRaise = BIG_BLIND;

    const firstToAct = activeIndices.length === 2
      ? sbIndex
      : activeIndices[(dealerPos + 3) % activeIndices.length];

    this.activeIndex = firstToAct;
    this.lastRaiserIndex = bbIndex;
    this.actedThisRound = new Set([sbIndex, bbIndex]);
    this.setActionDeadline();

    return { ok: true };
  }

  postBlind(seatIndex, amount, label) {
    const seat = this.room.seats[seatIndex];
    const posted = Math.min(amount, seat.player.chips);
    seat.player.chips -= posted;
    seat.currentBet = posted;
    seat.totalBetThisHand = posted;
    this.pot += posted;
    seat.lastAction = label;
    if (seat.player.chips === 0) seat.isAllIn = true;
  }

  setActionDeadline() {
    this.actionDeadline = Date.now() + ACTION_TIMEOUT_MS;
  }

  getSeatIndex(playerId) {
    return this.room.seats.findIndex((s) => s.player?.id === playerId);
  }

  getCallAmount(seatIndex) {
    const seat = this.room.seats[seatIndex];
    return this.currentBet - seat.currentBet;
  }

  processAction(playerId, action, raiseAmount = 0) {
    const seatIndex = this.getSeatIndex(playerId);
    if (seatIndex < 0) return { ok: false, error: 'Player not found' };
    if (this.phase === 'waiting' || this.phase === 'showdown') {
      return { ok: false, error: 'No action available right now' };
    }
    if (seatIndex !== this.activeIndex) return { ok: false, error: 'Not your turn' };

    const seat = this.room.seats[seatIndex];
    if (seat.hasFolded || seat.isAllIn) return { ok: false, error: 'Cannot act' };

    const callAmount = this.getCallAmount(seatIndex);
    let result;

    switch (action) {
      case 'fold':
        seat.hasFolded = true;
        seat.lastAction = 'fold';
        result = { ok: true };
        break;

      case 'check':
        if (callAmount > 0) return { ok: false, error: 'Cannot check — call or raise instead' };
        seat.lastAction = 'check';
        result = { ok: true };
        break;

      case 'call': {
        if (callAmount <= 0) return { ok: false, error: 'Already matched — use check' };
        const toCall = Math.min(callAmount, seat.player.chips);
        this.placeBet(seatIndex, toCall);
        seat.lastAction = toCall < callAmount ? 'all-in' : 'call';
        result = { ok: true };
        break;
      }

      case 'raise': {
        const totalRaise = callAmount + raiseAmount;
        if (raiseAmount < this.minRaise && seat.player.chips > totalRaise) {
          return { ok: false, error: `Minimum raise is ${this.minRaise}` };
        }
        const betTotal = Math.min(callAmount + raiseAmount, callAmount + seat.player.chips);
        const raisePart = betTotal - callAmount;
        this.placeBet(seatIndex, betTotal);
        if (betTotal > callAmount) {
          this.minRaise = Math.max(this.minRaise, raisePart);
          this.currentBet = seat.currentBet;
          this.lastRaiserIndex = seatIndex;
          this.actedThisRound = new Set([seatIndex]);
        }
        seat.lastAction = seat.isAllIn ? 'all-in' : `raise ${raisePart}`;
        result = { ok: true };
        break;
      }

      case 'all-in': {
        const chips = seat.player.chips;
        if (chips <= 0) return { ok: false, error: 'No chips left' };
        const prevTableBet = this.currentBet;
        this.placeBet(seatIndex, chips);
        if (seat.currentBet > prevTableBet) {
          this.minRaise = Math.max(this.minRaise, seat.currentBet - prevTableBet);
          this.currentBet = seat.currentBet;
          this.lastRaiserIndex = seatIndex;
          this.actedThisRound = new Set([seatIndex]);
        }
        seat.lastAction = 'all-in';
        result = { ok: true };
        break;
      }

      default:
        return { ok: false, error: 'Invalid action' };
    }

    this.actedThisRound.add(seatIndex);
    this.advanceTurn();
    return result;
  }

  placeBet(seatIndex, amount) {
    const seat = this.room.seats[seatIndex];
    const actual = Math.min(amount, seat.player.chips);
    seat.player.chips -= actual;
    seat.currentBet += actual;
    seat.totalBetThisHand += actual;
    this.pot += actual;
    if (seat.player.chips === 0) seat.isAllIn = true;
  }

  advanceTurn() {
    const inHand = this.getPlayersInHand();
    const canAct = this.getPlayersWhoCanAct();

    if (inHand.length === 1) {
      this.awardPotToWinner(inHand[0]);
      return;
    }

    if (canAct.length === 0) {
      this.runOutBoard();
      return;
    }

    if (canAct.length === 1 && canAct[0].currentBet >= this.currentBet) {
      this.runOutBoard();
      return;
    }

    if (this.isBettingRoundComplete()) {
      this.advancePhase();
      return;
    }

    this.activeIndex = this.nextActiveSeat(this.activeIndex);
    this.setActionDeadline();
  }

  isBettingRoundComplete() {
    const canAct = this.getPlayersWhoCanAct();
    if (canAct.length === 0) return true;

    for (const seat of canAct) {
      if (seat.currentBet < this.currentBet) return false;
      if (!this.actedThisRound.has(this.room.seats.indexOf(seat))) return false;
    }
    return true;
  }

  nextActiveSeat(fromIndex) {
    const len = this.room.seats.length;
    for (let i = 1; i <= len; i++) {
      const idx = (fromIndex + i) % len;
      const seat = this.room.seats[idx];
      if (seat.player && !seat.hasFolded && !seat.isAllIn && seat.player.chips > 0) {
        return idx;
      }
    }
    return fromIndex;
  }

  advancePhase() {
    for (const seat of this.room.seats) {
      seat.currentBet = 0;
    }
    this.currentBet = 0;
    this.minRaise = BIG_BLIND;
    this.actedThisRound = new Set();

    const phaseIdx = PHASES.indexOf(this.phase);
    if (phaseIdx >= 3) {
      this.showdown();
      return;
    }

    const nextPhase = PHASES[phaseIdx + 1];
    this.phase = nextPhase;

    if (nextPhase === 'flop') {
      this.deck.pop();
      this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
    } else if (nextPhase === 'turn' || nextPhase === 'river') {
      this.deck.pop();
      this.communityCards.push(this.deck.pop());
    }

    const firstActive = this.getPlayersWhoCanAct();
    if (firstActive.length === 0) {
      this.advancePhase();
      return;
    }

    this.activeIndex = this.room.seats.indexOf(firstActive[0]);
    this.setActionDeadline();
  }

  runOutBoard() {
    while (this.communityCards.length < 5) {
      this.deck.pop();
      if (this.communityCards.length === 0) {
        this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
      } else {
        this.communityCards.push(this.deck.pop());
      }
    }
    this.phase = 'river';
    this.showdown();
  }

  showdown() {
    this.phase = 'showdown';

    const contenders = this.room.seats.filter((s) => s.player && !s.hasFolded);

    for (const seat of contenders) {
      seat.handResult = evaluateHand(seat.holeCards, this.communityCards);
    }

    let bestHand = null;
    let winnerSeats = [];

    for (const seat of contenders) {
      if (!bestHand) {
        bestHand = seat.handResult;
        winnerSeats = [seat];
      } else {
        const cmp = compareHands(seat.handResult, bestHand);
        if (cmp > 0) {
          bestHand = seat.handResult;
          winnerSeats = [seat];
        } else if (cmp === 0) {
          winnerSeats.push(seat);
        }
      }
    }

    const share = Math.floor(this.pot / winnerSeats.length);
    const remainder = this.pot % winnerSeats.length;

    this.winners = winnerSeats.map((s) => ({
      playerId: s.player.id,
      name: s.player.name,
      amount: share,
      hand: s.handResult.name,
    }));

    winnerSeats.forEach((s, i) => {
      s.player.chips += share + (i === 0 ? remainder : 0);
    });

    this.winMessage = winnerSeats.length > 1
      ? `Split pot! ${winnerSeats.map((s) => s.player.name).join(' & ')} — ${bestHand.name}`
      : `${winnerSeats[0].player.name} wins with ${bestHand.name}`;

    this.pot = 0;
  }

  awardPotToWinner(seat) {
    this.phase = 'showdown';
    seat.player.chips += this.pot;
    this.winners = [{ playerId: seat.player.id, name: seat.player.name, amount: this.pot, hand: 'Everyone folded' }];
    this.winMessage = `${seat.player.name} wins (everyone else folded)`;
    this.pot = 0;
  }

  handleTimeout() {
    if (this.phase === 'waiting' || this.phase === 'showdown') return;
    if (Date.now() < this.actionDeadline) return;

    const seat = this.room.seats[this.activeIndex];
    if (!seat?.player) return;

    const callAmount = this.getCallAmount(this.activeIndex);
    if (callAmount === 0) {
      this.processAction(seat.player.id, 'check');
    } else {
      this.processAction(seat.player.id, 'fold');
    }
  }

  getPublicState(forPlayerId = null) {
    const mySeatIndex = forPlayerId ? this.getSeatIndex(forPlayerId) : -1;

    return {
      phase: this.phase,
      handNumber: this.handNumber,
      communityCards: this.communityCards,
      pot: this.pot,
      currentBet: this.currentBet,
      minRaise: this.minRaise,
      dealerIndex: this.dealerIndex,
      activeIndex: this.activeIndex,
      actionDeadline: this.actionDeadline,
      winners: this.winners,
      winMessage: this.winMessage,
      seats: this.room.seats.map((seat, index) => ({
        index,
        occupied: !!seat.player,
        playerId: seat.player?.id || null,
        name: seat.player?.name || null,
        chips: seat.player?.chips ?? 0,
        currentBet: seat.currentBet,
        hasFolded: seat.hasFolded,
        isAllIn: seat.isAllIn,
        lastAction: seat.lastAction,
        isDealer: index === this.dealerIndex,
        isActive: index === this.activeIndex,
        holeCards: seat.player && (index === mySeatIndex || this.phase === 'showdown')
          ? seat.holeCards
          : seat.player && seat.holeCards.length
            ? [{ hidden: true }, { hidden: true }]
            : [],
        handResult: this.phase === 'showdown' ? seat.handResult?.name : null,
      })),
    };
  }
}

export { STARTING_CHIPS, SMALL_BLIND, BIG_BLIND };
