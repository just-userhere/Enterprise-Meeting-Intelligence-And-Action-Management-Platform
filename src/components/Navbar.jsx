const LINKS = [
  ['hero', 'SWIFT'],
  ['design', 'DESIGN'],
  ['performance', 'PERFORMANCE'],
  ['technology', 'TECHNOLOGY'],
  ['interior', 'INTERIOR'],
  ['color', 'GALLERY'],
  ['final', 'TEST DRIVE']
]

export default function Navbar({ active, onNav, progress }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className={`transition-all duration-500 ${progress > 0.02 ? 'bg-black/60 backdrop-blur-xl border-b border-white/10' : 'bg-transparent border-b border-transparent'}`}>
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => onNav('hero')} className="font-display font-black tracking-tight text-lg">SWIFT<span className="text-swiftred">.</span></button>
          <div className="hidden md:flex items-center gap-7 text-[11px] tracking-[0.2em] text-white/60">
            {LINKS.slice(1).map(([id, label]) => (
              <button
                key={id}
                onClick={() => onNav(id)}
                className={`hover:text-white transition-colors relative pb-1 ${active === id ? 'text-white' : ''}`}
              >
                {label}
                {active === id && <span className="absolute -bottom-0 left-0 right-0 h-px bg-swiftred" />}
              </button>
            ))}
          </div>
          <button onClick={() => onNav('final')} className="btn-primary text-[11px] tracking-[0.2em] bg-swiftred px-5 py-2.5 rounded-full font-semibold">
            TEST DRIVE <span className="arrow">→</span>
          </button>
        </nav>
        <div className="h-px bg-white/5"><div className="h-px bg-swiftred transition-all" style={{ width: `${progress * 100}%` }} /></div>
      </div>
    </header>
  )
}
