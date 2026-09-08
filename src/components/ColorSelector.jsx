import { COLORS } from '../data/specs.js'

export default function ColorSelector({ color, setColor }) {
  return (
    <section id="color" className="relative px-6 py-32">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-[11px] tracking-mega text-swiftred reveal">06 — COLOR</div>
        <h2 className="headline-giant text-5xl md:text-7xl mt-4 gsap-head">PICK YOUR<br />ENERGY<span className="text-swiftred">.</span></h2>
        <p className="mt-4 text-white/55 reveal">Paint transitions smoothly. Reflections preserved. Lighting adapts.</p>
        <div className="mt-10 glass rounded-3xl px-8 py-10 reveal">
          <div className="font-display font-black text-3xl" style={{ color: color.hex === '#e8e8e6' ? '#fff' : color.hex }}>{color.name.toUpperCase()}</div>
          <div className="text-[11px] tracking-[0.3em] text-white/40 mt-2">SWIFT VXi • METALLIC • CLEARCOAT</div>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setColor(c)}
                title={c.name}
                aria-label={c.name}
                className={`w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 ${color.id === c.id ? 'ring-2 ring-white ring-offset-4 ring-offset-black scale-110' : 'ring-1 ring-white/20'}`}
                style={{ background: `radial-gradient(circle at 30% 30%, ${c.hex}, #000 130%)` }}
              />
            ))}
          </div>
          <div className="mt-6 h-1 rounded-full bg-white/10 overflow-hidden max-w-xs mx-auto">
            <div className="h-full bg-swiftred transition-all duration-700" style={{ width: `${((COLORS.findIndex(c => c.id === color.id) + 1) / COLORS.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}
