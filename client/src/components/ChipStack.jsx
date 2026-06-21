export default function ChipStack({ amount, className = '' }) {
  if (!amount || amount <= 0) return null;

  return (
    <div className={`relative flex flex-col items-center pointer-events-none ${className}`}>
      <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-b from-[#e74c3c] to-[#b91c1c] border-2 border-[#fbbf24] shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
      <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-b from-[#ef4444] to-[#c0392b] border-2 border-[#fbbf24] shadow-[0_2px_4px_rgba(0,0,0,0.5)] -mt-[18px]" />
      <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-b from-[#f87171] to-[#dc2626] border-2 border-[#fde047] shadow-[0_2px_6px_rgba(0,0,0,0.6)] -mt-[18px]" />
      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-white bg-black/75 px-1.5 py-px rounded border border-white/10">
        {amount.toLocaleString()}
      </span>
    </div>
  );
}
