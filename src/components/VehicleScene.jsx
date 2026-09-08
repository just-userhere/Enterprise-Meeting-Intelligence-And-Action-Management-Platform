import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshReflectorMaterial, AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import ProceduralSwift from './ProceduralSwift.jsx'

const WAYPOINTS = [
  { pos: [5.8, 2.0, 5.8], look: [0, 0.7, 0] },    // hero front 3/4
  { pos: [-4.2, 1.7, 5.6], look: [0, 0.7, 0] },   // design
  { pos: [-5.6, 1.0, -3.2], look: [0, 0.6, 0] },  // performance tunnel
  { pos: [1.4, 1.55, 2.3], look: [0, 1.0, 0] },   // interior
  { pos: [3.9, 1.35, 1.7], look: [0.6, 0.8, 0] }, // technology
  { pos: [0, 3.4, 7.2], look: [0, 0.7, 0] },      // safety
  { pos: [4.6, 1.8, 4.6], look: [0, 0.7, 0] },    // color
  { pos: [-4.8, 2.0, -4.8], look: [0, 0.7, 0] },  // final rear 3/4
]

const FOCUS_MAP = {
  headlight: { look: [1.9, 0.8, 0.4], dist: 0.45 },
  grille: { look: [1.95, 0.55, 0], dist: 0.5 },
  wheel: { look: [1.3, 0.35, 0.85], dist: 0.5 },
  profile: { look: [0, 0.8, 0], dist: 1.0 },
  rear: { look: [-1.95, 0.85, 0], dist: 0.55 },
  dashboard: { look: [0.2, 1.1, 0], dist: 0.35 },
  steering: { look: [0.4, 1.0, 0.4], dist: 0.35 },
  seat: { look: [-0.6, 0.9, 0], dist: 0.5 },
}

function lerp3(a, b, t, out) {
  out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t)
  return out
}
function smooth(t) { return t * t * (3 - 2 * t) }

function CameraRig({ scrollProgress, focusPoint, mouse }) {
  const { camera } = useThree()
  const curPos = useMemo(() => new THREE.Vector3(...WAYPOINTS[0].pos), [])
  const curLook = useMemo(() => new THREE.Vector3(...WAYPOINTS[0].look), [])
  const tmpP = useMemo(() => new THREE.Vector3(), [])
  const tmpL = useMemo(() => new THREE.Vector3(), [])
  const lookTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const n = WAYPOINTS.length - 1
    const f = Math.min(Math.max(scrollProgress, 0), 1) * n
    const i = Math.min(Math.floor(f), n - 1)
    const t = smooth(f - i)
    lerp3(WAYPOINTS[i].pos, WAYPOINTS[i + 1].pos, t, tmpP)
    lerp3(WAYPOINTS[i].look, WAYPOINTS[i + 1].look, t, tmpL)

    // focus override (hotspots)
    if (focusPoint && FOCUS_MAP[focusPoint]) {
      const fm = FOCUS_MAP[focusPoint]
      tmpL.lerp(new THREE.Vector3(...fm.look), 0.65)
      // pull camera toward focus
      const dir = tmpP.clone().sub(tmpL).normalize()
      const pull = tmpL.clone().add(dir.multiplyScalar(3.2 * fm.dist + 1.4))
      tmpP.lerp(pull, 0.45)
    }

    // mouse parallax + idle float
    const time = state.clock.elapsedTime
    tmpP.x += mouse.current.x * 0.35 + Math.sin(time * 0.25) * 0.08
    tmpP.y += -mouse.current.y * 0.22 + Math.sin(time * 0.4) * 0.05

    const k = 1 - Math.exp(-2.8 * delta)
    curPos.lerp(tmpP, k)
    curLook.lerp(tmpL, k)
    camera.position.copy(curPos)
    lookTarget.copy(curLook)
    camera.lookAt(lookTarget)
  })
  return null
}

function Dust({ count = 220 }) {
  const ref = useRef()
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = Math.random() * 4
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14
    }
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return geo
  }, [count])
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.015
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
  })
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.02} color="#ffffff" transparent opacity={0.35} depthWrite={false} />
    </points>
  )
}

function Scene({ color, scrollProgress, focusPoint, dragRotation, activeSection, mouse, carGroup }) {
  const envColor = color.env || '#1a1c20'
  return (
    <>
      <fog attach="fog" args={['#070708', 9, 22]} />
      <CameraRig scrollProgress={scrollProgress} focusPoint={focusPoint} mouse={mouse} />

      {/* CINEMATIC STUDIO LIGHTING */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[-5, 6, 3]} intensity={2.2} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[5, 3, -4]} intensity={0.9} color="#e4002b" />
      <spotLight position={[4, 5, 4]} angle={0.5} penumbra={1} intensity={60} color="#dfe8ff" />
      <pointLight position={[0, 2.5, -3]} intensity={8} color="#3a5bff" distance={10} />
      <pointLight position={[0, 0.4, 0]} intensity={0.6} color={envColor} distance={8} />

      {/* softbox strips */}
      <mesh position={[-4, 3.5, 2]} rotation={[0.4, 0.6, 0]}>
        <planeGeometry args={[4, 0.6]} />
        <meshBasicMaterial color="#f2f5ff" transparent opacity={0.85} />
      </mesh>
      <mesh position={[4, 3.2, -2]} rotation={[-0.3, -0.7, 0]}>
        <planeGeometry args={[4, 0.5]} />
        <meshBasicMaterial color="#ff2a4d" transparent opacity={0.5} />
      </mesh>

      <ProceduralSwift colorHex={color.hex} scrollProgress={scrollProgress} dragRotation={dragRotation} activeSection={activeSection} groupRef={carGroup} />

      {/* reflective dark floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          blur={[280, 60]}
          resolution={1024}
          mixBlur={1}
          mixStrength={12}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0a0c"
          metalness={0.6}
          mirror={0.45}
        />
      </mesh>
      {/* light streak road for performance feel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[30, 0.06]} />
        <meshBasicMaterial color="#e4002b" transparent opacity={0.28} />
      </mesh>

      <Dust />
    </>
  )
}

export default function VehicleScene(props) {
  const mouse = useRef({ x: 0, y: 0 })
  const carGroup = useRef()
  const drag = useRef({ active: false, x: 0, v: 0, last: 0 })

  const onPointerMove = (e) => {
    mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
    if (props.mode360 && drag.current.active) {
      const dx = e.clientX - drag.current.last
      drag.current.last = e.clientX
      drag.current.v = dx * 0.008
      props.setDragRotation((r) => r + dx * 0.008)
    }
  }
  const onDown = (e) => { if (props.mode360) { drag.current.active = true; drag.current.last = e.clientX } }
  const onUp = () => { drag.current.active = false }

  // inertia after drag
  const Inertia = () => {
    useFrame(() => {
      if (props.mode360 && !drag.current.active && Math.abs(drag.current.v) > 0.0002) {
        props.setDragRotation((r) => r + drag.current.v)
        drag.current.v *= 0.96
      }
    })
    return null
  }

  return (
    <div
      className="fixed inset-0 z-0"
      onPointerMove={onPointerMove}
      onPointerDown={onDown}
      onPointerUp={onUp}
      style={{ cursor: props.mode360 ? 'grab' : 'default' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#181a1f_0%,#0a0a0c_55%,#050506_100%)]" />
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [5.8, 2.0, 5.8], fov: 38, near: 0.1, far: 60 }}
      >
        <Suspense fallback={null}>
          <Scene {...props} mouse={mouse} carGroup={carGroup} />
          <Inertia />
          <AdaptiveDpr />
        </Suspense>
      </Canvas>
      {/* vignette + cinematic bars */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  )
}
