import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import VehicleScene from './components/VehicleScene.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import DesignSection from './components/DesignSection.jsx'
import PerformanceSection from './components/PerformanceSection.jsx'
import InteriorSection from './components/InteriorSection.jsx'
import TechnologySection from './components/TechnologySection.jsx'
import SafetySection from './components/SafetySection.jsx'
import ColorSelector from './components/ColorSelector.jsx'
import Vehicle360 from './components/Vehicle360.jsx'
import FinalCTA from './components/FinalCTA.jsx'
import Footer from './components/Footer.jsx'
import SoundToggle from './components/SoundToggle.jsx'
import { COLORS } from './data/specs.js'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [color, setColor] = useState(COLORS[0])
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState('hero')
  const [mode360, setMode360] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [focusPoint, setFocusPoint] = useState(null)
  const [dragRotation, setDragRotation] = useState(0)
  const scrollRef = useRef(null)

  // Simulated premium loading (tied to real window load + min duration)
  useEffect(() => {
    let v = 0
    const t = setInterval(() => {
      v += Math.random() * 14 + 4
      if (v >= 100) {
        v = 100
        clearInterval(t)
        setTimeout(() => setLoading(false), 450)
      }
      setProgress(Math.floor(v))
    }, 140)
    return () => clearInterval(t)
  }, [])

  // Global scroll progress + active section
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      const p = h > 0 ? window.scrollY / h : 0
      setScrollProgress(p)
      const sections = ['hero','design','performance','interior','technology','safety','color','view360','final']
      let current = 'hero'
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.55) current = id
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cinematic text animations with GSAP
  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.gsap-head').forEach((el) => {
        gsap.fromTo(el, { y: 70, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        })
      })
    })
    // Intersection reveal fallback
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.15 })
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    return () => { ctx.revert(); io.disconnect() }
  }, [loading])

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="grain relative bg-graphite text-pearl min-h-screen">
      {loading && <LoadingScreen progress={progress} />}

      {/* Fixed WebGL canvas behind everything */}
      <VehicleScene
        color={color}
        scrollProgress={scrollProgress}
        mode360={mode360}
        focusPoint={focusPoint}
        dragRotation={dragRotation}
        setDragRotation={setDragRotation}
        activeSection={activeSection}
      />

      <Navbar active={activeSection} onNav={scrollTo} progress={scrollProgress} />
      <SoundToggle on={soundOn} setOn={setSoundOn} />

      <main className="relative z-10">
        <Hero onExplore={() => scrollTo('design')} onTestDrive={() => scrollTo('final')} />
        <DesignSection onFocus={setFocusPoint} />
        <PerformanceSection />
        <InteriorSection onFocus={setFocusPoint} />
        <TechnologySection />
        <SafetySection />
        <ColorSelector color={color} setColor={setColor} />
        <Vehicle360
          enabled={mode360}
          setEnabled={setMode360}
          dragRotation={dragRotation}
          setDragRotation={setDragRotation}
        />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  )
}
