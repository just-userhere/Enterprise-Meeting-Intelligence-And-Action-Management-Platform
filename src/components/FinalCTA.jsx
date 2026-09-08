export default function FinalCTA() {
  return (
    <section id="final" className="relative px-6 py-36 text-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(228,0,43,0.16),transparent_60%)]" />
      <div className="relative max-w-4xl mx-auto">
        <div className="text-[11px] tracking-mega text-swiftred reveal">FINAL — READY?</div>
        <h2 className="headline-giant text-[18vw] md:text-[8rem] mt-4 gsap-head">READY<br />TO MOVE?</h2>
        <p className="mt-4 text-white/60 reveal">Experience the Swift for yourself.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 reveal">
          <button className="btn-primary bg-swiftred px-10 py-4 rounded-full text-sm font-semibold">BOOK A TEST DRIVE <span className="arrow">→</span></button>
          <button onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })} className="btn-ghost border border-white/25 px-10 py-4 rounded-full text-sm font-semibold">EXPLORE MORE</button>
        </div>
      </div>
    </section>
  )
}
