export default function LoadingScreen({ progress }) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#070708] flex flex-col items-center justify-center transition-opacity duration-700">
      <div className="font-display font-black tracking-tight text-5xl md:text-7xl">SWIFT</div>
      <div className="mt-2 text-[11px] tracking-mega text-white/50 font-body">LOADING EXPERIENCE</div>
      <div className="mt-8 w-56 h-px bg-white/10 relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-swiftred transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 font-display text-sm text-white/70 tabular-nums">{String(progress).padStart(2, '0')}%</div>
      <div className="mt-1 text-[10px] tracking-[0.25em] text-white/30">BORN TO MOVE</div>
    </div>
  )
}
