import { useEffect, useRef, useState } from 'react';
import ChipStack from './ChipStack';
import { getBetChipStyle, seatPosToStyle } from '../utils/seatLayout';

export default function TableChipLayer({ gameState, layoutMap, tableRef }) {
  const [flyers, setFlyers] = useState([]);
  const prevBetsRef = useRef({});
  const prevHandRef = useRef(0);

  useEffect(() => {
    if (gameState.handNumber !== prevHandRef.current) {
      prevHandRef.current = gameState.handNumber;
      prevBetsRef.current = {};
    }
  }, [gameState.handNumber]);

  useEffect(() => {
    if (gameState.phase === 'waiting') {
      prevBetsRef.current = {};
      return;
    }

    const newFlyers = [];
    gameState.seats.forEach((seat, i) => {
      const prev = prevBetsRef.current[i] ?? 0;
      const curr = seat.currentBet ?? 0;
      if (curr > prev && seat.occupied) {
        newFlyers.push({
          id: `${gameState.handNumber}-${i}-${Date.now()}-${Math.random()}`,
          seatIndex: i,
          amount: curr - prev,
        });
      }
      prevBetsRef.current[i] = curr;
    });

    if (newFlyers.length) {
      setFlyers((f) => [...f, ...newFlyers]);
      newFlyers.forEach((f) => {
        setTimeout(() => {
          setFlyers((list) => list.filter((x) => x.id !== f.id));
        }, 700);
      });
    }
  }, [gameState.seats, gameState.phase, gameState.handNumber]);

  if (gameState.phase === 'waiting') return null;

  return (
    <>
      {gameState.seats.map((seat, i) => {
        if (!seat.occupied || !seat.currentBet) return null;
        const seatStyle = seatPosToStyle(layoutMap.get(i));
        if (!seatStyle) return null;
        const chipStyle = getBetChipStyle(seatStyle, i);
        return (
          <div key={`bet-${i}-${seat.currentBet}`} className="absolute z-[35] pointer-events-none chip-pop" style={chipStyle}>
            <ChipStack amount={seat.currentBet} />
          </div>
        );
      })}

      {flyers.map((fly) => {
        const seatStyle = seatPosToStyle(layoutMap.get(fly.seatIndex));
        if (!seatStyle) return null;
        const chipStyle = getBetChipStyle(seatStyle, fly.seatIndex);
        return (
          <FlyingChip
            key={fly.id}
            seatStyle={seatStyle}
            chipStyle={chipStyle}
            amount={fly.amount}
            tableRef={tableRef}
          />
        );
      })}
    </>
  );
}

function FlyingChip({ seatStyle, chipStyle, amount, tableRef }) {
  const chipRef = useRef(null);

  useEffect(() => {
    const table = tableRef?.current;
    const chip = chipRef.current;
    if (!table || !chip) return;

    const tableRect = table.getBoundingClientRect();
    const seatX = (parseFloat(seatStyle.left) / 100) * tableRect.width;
    const seatY = (parseFloat(seatStyle.top) / 100) * tableRect.height;
    const endX = (parseFloat(chipStyle.left) / 100) * tableRect.width;
    const endY = (parseFloat(chipStyle.top) / 100) * tableRect.height;

    chip.style.setProperty('--from-x', `${seatX - endX}px`);
    chip.style.setProperty('--from-y', `${seatY - endY}px`);
    chip.classList.add('chip-fly');
  }, [seatStyle, chipStyle, tableRef]);

  return (
    <div ref={chipRef} className="absolute z-[40] pointer-events-none" style={chipStyle}>
      <ChipStack amount={amount} />
    </div>
  );
}
