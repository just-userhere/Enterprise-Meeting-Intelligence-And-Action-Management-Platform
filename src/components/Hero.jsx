export default function Hero({ onExplore, onTestDrive }) {
  return (
    <section id="hero" className="min-h-screen flex flex-col justify-end pb-16 pt-28 px-6 relative">
      <div className="max-w-7xl mx-auto w-full pointer-events-none">
        <div className="text-[11px] tracking-mega text-swiftred mb-4 gsap-head">MARUTI SUZUKI • SWIFT VXi • INTERACTIVE 3D</div>
        <h1 className="headline-giant text-[16vw] md:text-[9rem] gsap-head">THE SWIFT</h1>
        <h2 className="font-display font-800 font-extrabold text-2xl md:text-5xl tracking-tight mt-2 gsap-head">BORN TO MOVE<span className="text-swiftred">.</span></h2>
        <p className="mt-4 max-w-md text-white/60 font-light gsap-head">Sporty design. Intelligent technology. Everyday excitement.</p>
        <div className="mt-8 flex flex-wrap gap-4 pointer-events-auto">
          <button onClick={onExplore} className="btn-primary bg-white text-black px-8 py-4 rounded-full text-sm font-semibold tracking-wide">EXPLORE SWIFT <span className="arrow">→</span></button>
          <button onClick={onTestDrive} className="btn-ghost border border-white/25 px-8 py-4 rounded-full text-sm font-semibold tracking-wide">BOOK A TEST DRIVE</button>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/40">
        <span className="text-[10px] tracking-[0.3em]">SCROLL TO EXPLORE ↓</span>
        <div className="scroll-line" />
      </div>
      <div className="absolute top-24 right-6 hidden md:block text-right text-[11px] tracking-[0.25em] text-white/35 leading-6">
        Z12E • 1197cc<br />81.58 PS • 111.7 Nm<br />24.8 KM/L MT
      </div>
    </section>
  )
}
