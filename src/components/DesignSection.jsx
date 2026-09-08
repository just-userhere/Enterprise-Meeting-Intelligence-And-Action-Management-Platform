const FEATURES = [
  { label: 'LED LIGHTING', desc: 'Sleek wraparound lamps. VXi: halogen with manual levelling.', focus: 'headlight' },
  { label: 'SPORTY PROFILE', desc: 'Floating roof, sculpted shoulders, 3860 mm stance.', focus: 'profile' },
  { label: 'PRECISION DETAILS', desc: 'Chrome accents, electric ORVMs, body lines.', focus: 'grille' },
  { label: 'ALLOY-LOOK WHEELS', desc: 'VXi: 165/80 R14 steel + covers. Alloys on ZXi/ZXi+.', focus: 'wheel' },
]

export default function DesignSection({ onFocus }) {
  return (
    <section id="design" className="relative min-h-[160vh] px-6 py-32">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <div className="text-[11px] tracking-mega text-swiftred reveal">01 — DESIGN</div>
          <h2 className="headline-giant text-5xl md:text-8xl mt-4 gsap-head">DESIGNED<br />TO STAND OUT<span className="text-swiftred">.</span></h2>
          <p className="mt-6 text-white/60 font-light reveal">Slow orbit. Sculpted body. Roofline that means business. Scroll — the camera walks around the car.</p>
        </div>
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <button
              key={f.label}
              onMouseEnter={() => onFocus(f.focus)}
              onMouseLeave={() => onFocus(null)}
              onClick={() => onFocus(f.focus)}
              className={`reveal ${i === 1 ? 'reveal-delay-1' : ''} glass rounded-2xl p-7 text-left hover:border-swiftred/50 transition-colors group`}
            >
              <div className="text-[11px] tracking-[0.3em] text-white/40">0{i + 1}</div>
              <div className="font-display font-extrabold text-xl mt-2 group-hover:text-white">{f.label}</div>
              <div className="text-sm text-white/55 mt-2 font-light">{f.desc}</div>
            </button>
          ))}
        </div>
        <p className="mt-6 text-[11px] text-white/30 reveal">Hover a card to move the camera to that component.</p>
      </div>
    </section>
  )
}
