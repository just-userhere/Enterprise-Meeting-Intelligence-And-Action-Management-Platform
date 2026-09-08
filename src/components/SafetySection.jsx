import { SAFETY_FEATURES } from '../data/specs.js'

export default function SafetySection() {
  return (
    <section id="safety" className="relative px-6 py-32 bg-[radial-gradient(ellipse_at_center,rgba(228,0,43,0.08),transparent_65%)]">
      <div className="max-w-7xl mx-auto text-center">
        <div className="text-[11px] tracking-mega text-swiftred reveal">05 — SAFETY</div>
        <h2 className="headline-giant text-5xl md:text-8xl mt-4 gsap-head">CONFIDENCE IN<br />EVERY DRIVE<span className="text-swiftred">.</span></h2>
        <p className="mt-4 text-white/55 font-light reveal">Protective rings orbit the car in 3D as you enter this section.</p>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {SAFETY_FEATURES.map((s, i) => (
            <div key={s.name} className={`reveal ${i === 1 ? 'reveal-delay-1' : i === 2 ? 'reveal-delay-2' : ''} glass rounded-2xl p-7 hover:border-swiftred/50 transition-colors`}>
              <div className="text-2xl text-swiftred">{s.icon}</div>
              <div className="font-display font-extrabold mt-3">{s.name}</div>
              <div className="text-sm text-white/55 mt-2 font-light">{s.desc}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[11px] text-white/30 reveal">No unsupported claims. Ratings / features per official Maruti Suzuki Swift communication — verify with dealer.</p>
      </div>
    </section>
  )
}
