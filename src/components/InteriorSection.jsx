import { useState } from 'react'

const HOTSPOTS = [
  { id: 'dashboard', x: '58%', y: '42%', title: 'SmartPlay Studio', desc: '7" touchscreen with smartphone connectivity (VXi confirmed).' },
  { id: 'steering', x: '46%', y: '55%', title: 'Flat-bottom Steering', desc: 'Steering-mounted audio + calling controls, tilt adjust.' },
  { id: 'seat', x: '34%', y: '62%', title: 'Dual-tone Cabin', desc: 'Headrest-adjustable seats, rear defogger, USB Type-A front.' },
]

export default function InteriorSection({ onFocus }) {
  const [active, setActive] = useState(HOTSPOTS[0])
  return (
    <section id="interior" className="relative px-6 py-32">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-[11px] tracking-mega text-swiftred reveal">03 — INTERIOR</div>
          <h2 className="headline-giant text-5xl md:text-7xl mt-4 gsap-head">YOUR SPACE.<br />YOUR RHYTHM<span className="text-swiftred">.</span></h2>
          <p className="mt-5 text-white/60 font-light reveal">Camera glides into the cabin. Tap a hotspot — the view moves, the cabin dims, the story appears.</p>
          <div className="mt-8 space-y-3">
            {HOTSPOTS.map(h => (
              <button
                key={h.id}
                onClick={() => { setActive(h); onFocus(h.id) }}
                onMouseEnter={() => onFocus(h.id)}
                className={`w-full text-left glass rounded-xl px-5 py-4 transition-all ${active.id === h.id ? 'border-swiftred/60' : 'hover:border-white/25'}`}
              >
                <div className="font-display font-bold">{h.title}</div>
                <div className={`text-sm text-white/55 mt-1 overflow-hidden transition-all ${active.id === h.id ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>{h.desc}</div>
              </button>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-white/30">Note: Auto AC + rear vents are ZXi and above. VXi gets manual AC — shown honestly.</p>
        </div>
        {/* stylised cabin visual with hotspots (3D camera also reacts) */}
        <div className="reveal relative glass rounded-3xl overflow-hidden aspect-[4/3] bg-[radial-gradient(ellipse_at_center,#1c1e24,#0a0a0c)]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-1/2 rounded-2xl bg-gradient-to-b from-[#23262d] to-[#101216] border border-white/10 relative">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-10 rounded bg-[#0a0c12] border border-cyan-200/20 shadow-[0_0_30px_rgba(100,200,255,0.25)]" />
              <div className="absolute bottom-6 left-8 right-8 h-8 rounded-full bg-black/60" />
            </div>
          </div>
          {HOTSPOTS.map(h => (
            <button
              key={h.id}
              style={{ left: h.x, top: h.y }}
              onClick={() => { setActive(h); onFocus(h.id) }}
              className={`hotspot-dot absolute w-4 h-4 rounded-full ${active.id === h.id ? 'bg-swiftred' : 'bg-white'} shadow-lg hover:scale-125 transition-transform`}
              aria-label={h.title}
            />
          ))}
          <div className="absolute bottom-4 left-4 right-4 glass rounded-xl px-4 py-3">
            <div className="text-[10px] tracking-[0.3em] text-swiftred">{active.title.toUpperCase()}</div>
            <div className="text-sm text-white/70 mt-1">{active.desc}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
