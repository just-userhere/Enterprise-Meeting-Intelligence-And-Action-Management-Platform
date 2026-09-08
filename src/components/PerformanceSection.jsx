import { useEffect, useRef, useState } from 'react'
import { VERIFIED_SPECS } from '../data/specs.js'

function CountUp({ end, decimals = 1, suffix = '' }) {
  const [v, setV] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      const t0 = performance.now()
      const dur = 1400
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setV(end * eased)
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      io.disconnect()
    }, { threshold: 0.4 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [end])
  return <span ref={ref} className="tabular-nums">{v.toFixed(decimals)}{suffix}</span>
}

const CARDS = [
  { k: 'ENGINE', big: '1.2L Z-Series', sub: 'Z12E • 1197cc • 3-cyl Dual Jet Dual VVT' },
  { k: 'POWER', num: 81.58, unit: 'PS @ 5700 rpm', decimals: 2, sub: '60 kW • 111.7 Nm @ 4300 rpm' },
  { k: 'FUEL EFFICIENCY', num: 24.8, unit: 'km/l MT', decimals: 1, sub: '25.75 km/l AMT • ISS standard' },
  { k: 'TRANSMISSION', big: '5MT / 5AMT', sub: 'Front-wheel drive • Gear-shift indicator' },
  { k: 'DIMENSIONS', big: '3860 × 1735', sub: '× 1520 mm • WB 2450 mm • Turn 4.8 m' },
  { k: 'GROUND CLEARANCE', num: 163, unit: 'mm', decimals: 0, sub: 'Boot 265 L • Tank 37 L • 5 seats' },
]

export default function PerformanceSection() {
  return (
    <section id="performance" className="relative px-6 py-32 bg-gradient-to-b from-transparent via-[#0d0508]/80 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-[11px] tracking-mega text-swiftred reveal">02 — PERFORMANCE</div>
        <h2 className="headline-giant text-5xl md:text-8xl mt-4 gsap-head">MADE FOR<br />THE CITY<span className="text-swiftred">.</span></h2>
        <p className="mt-5 max-w-xl text-white/60 font-light reveal">Z-Series punch for traffic-light getaways, ISS for signals. All figures verified — Maruti Suzuki official.</p>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CARDS.map((c, i) => (
            <div key={c.k} className={`reveal ${i % 3 === 1 ? 'reveal-delay-1' : i % 3 === 2 ? 'reveal-delay-2' : ''} glass rounded-2xl p-7`}>
              <div className="text-[10px] tracking-[0.3em] text-white/40">{c.k}</div>
              <div className="font-display font-black text-3xl md:text-4xl mt-3">
                {c.num !== undefined ? <><CountUp end={c.num} decimals={c.decimals} /> <span className="text-base font-semibold text-white/60">{c.unit}</span></> : c.big}
              </div>
              <div className="text-xs text-white/50 mt-2">{c.sub}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 text-[11px] text-white/30 reveal">Source: {VERIFIED_SPECS.source}. VXi tyres: {VERIFIED_SPECS.tyreVXi} steel. No invented figures.</div>
      </div>
    </section>
  )
}
