export default function Vehicle360({ enabled, setEnabled, dragRotation, setDragRotation }) {
  const deg = Math.round(((dragRotation * 180) / Math.PI) % 360)
  const go = (r) => setDragRotation(r)
  return (
    <section id="view360" className="relative px-6 py-32">
      <div className="max-w-5xl mx-auto text-center">
        <div className="text-[11px] tracking-mega text-swiftred reveal">07 — 360° VIEW</div>
        <h2 className="headline-giant text-5xl md:text-7xl mt-4 gsap-head">DRAG TO<br />EXPLORE<span className="text-swiftred">.</span></h2>
        <div className="mt-8 glass rounded-3xl p-8 reveal">
          {!enabled ? (
            <button onClick={() => setEnabled(true)} className="btn-primary bg-white text-black px-10 py-4 rounded-full font-semibold text-sm">ENABLE 360° MODE →</button>
          ) : (
            <>
              <div className="text-[11px] tracking-[0.3em] text-white/50">DRAG HORIZONTALLY • INERTIA ON • {deg}°</div>
              <input
                type="range" min={-Math.PI * 2} max={Math.PI * 2} step={0.01} value={dragRotation}
                onChange={(e) => setDragRotation(parseFloat(e.target.value))}
                className="w-full mt-6"
              />
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={() => go(0.6)} className="btn-ghost border border-white/20 px-5 py-2 rounded-full text-xs tracking-widest">FRONT</button>
                <button onClick={() => go(Math.PI / 2)} className="btn-ghost border border-white/20 px-5 py-2 rounded-full text-xs tracking-widest">SIDE</button>
                <button onClick={() => go(Math.PI)} className="btn-ghost border border-white/20 px-5 py-2 rounded-full text-xs tracking-widest">REAR</button>
                <button onClick={() => { go(0); setEnabled(false) }} className="btn-ghost border border-swiftred/60 text-swiftred px-5 py-2 rounded-full text-xs tracking-widest">RESET / EXIT</button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
