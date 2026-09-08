import { VXI_FEATURES } from '../data/specs.js'

export default function TechnologySection() {
  return (
    <section id="technology" className="relative px-6 py-32">
      <div className="max-w-7xl mx-auto">
        <div className="text-[11px] tracking-mega text-swiftred reveal">04 — TECHNOLOGY</div>
        <h2 className="headline-giant text-5xl md:text-8xl mt-4 gsap-head">SMART<br />BY DESIGN<span className="text-swiftred">.</span></h2>
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-8 reveal">
            <div className="text-[10px] tracking-[0.3em] text-emerald-300/80">✓ VXi CONFIRMED</div>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              {VXI_FEATURES.included.map(f => (
                <li key={f} className="flex gap-3"><span className="text-swiftred">—</span>{f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl p-8 reveal reveal-delay-1 border border-white/10 bg-black/40">
            <div className="text-[10px] tracking-[0.3em] text-white/40">HIGHER VARIANTS ONLY — NOT ON VXi</div>
            <ul className="mt-4 space-y-3 text-sm text-white/45">
              {VXI_FEATURES.higherVariantOnly.map(f => (
                <li key={f} className="flex gap-3"><span className="text-white/25">○</span>{f}</li>
              ))}
            </ul>
            <p className="mt-5 text-[11px] text-white/30">We show variant truth, not fantasy. Ask your dealer for VXi(O) if you need push-start.</p>
          </div>
        </div>
        {/* clean data viz */}
        <div className="mt-6 glass rounded-2xl p-7 reveal flex flex-wrap gap-8 items-center">
          {[['24.8', 'km/l MT'], ['25.75', 'km/l AMT'], ['37L', 'tank'], ['265L', 'boot']].map(([a, b]) => (
            <div key={b} className="flex-1 min-w-[120px]">
              <div className="font-display font-black text-3xl">{a}</div>
              <div className="text-[11px] tracking-[0.25em] text-white/40 mt-1">{b.toUpperCase()}</div>
              <div className="mt-2 h-1 rounded bg-white/10 overflow-hidden"><div className="h-full w-3/4 bg-gradient-to-r from-swiftred to-orange-500" /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
