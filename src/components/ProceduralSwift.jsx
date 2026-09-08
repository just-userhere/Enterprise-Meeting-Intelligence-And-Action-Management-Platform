import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

function Wheel({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.24, 32]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.85} metalness={0.2} />
      </mesh>
      {/* steel wheel cover (VXi accurate — no alloys) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
        <cylinderGeometry args={[0.2, 0.2, 0.26, 12]} />
        <meshStandardMaterial color="#b9bec4" roughness={0.35} metalness={0.85} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.05, 0.05, 0.28, 16]} />
        <meshStandardMaterial color="#1a1c1f" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

export default function ProceduralSwift({ colorHex, scrollProgress, dragRotation, activeSection, groupRef }) {
  const paintRef = useRef()
  const localRef = useRef()
  const target = useMemo(() => new THREE.Color(colorHex), [colorHex])
  const spin = useRef(0)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    // Smooth paint transition (premium, not instant)
    if (paintRef.current) {
      paintRef.current.color.lerp(target, 1 - Math.exp(-3 * delta))
    }
    // Cinematic rotation: slow auto-rotate + scroll-driven + user drag
    const auto = t * 0.12
    const scrollRot = scrollProgress * Math.PI * 2.2
    spin.current += ((dragRotation + auto + scrollRot) - spin.current) * (1 - Math.exp(-4 * delta))
    if (localRef.current) {
      localRef.current.rotation.y = spin.current
      // subtle suspension breathing
      localRef.current.position.y = Math.sin(t * 0.8) * 0.015
    }
    if (groupRef?.current) {
      // environment shift per section handled via camera; keep group centered
    }
  })

  const showRings = activeSection === 'safety'
  const ringOpacity = useRef(0)
  useFrame((_, delta) => {
    ringOpacity.current += ((showRings ? 1 : 0) - ringOpacity.current) * (1 - Math.exp(-3 * delta))
    if (localRef.current) {
      localRef.current.traverse((o) => {
        if (o.userData?.isRing) o.material.opacity = ringOpacity.current * 0.35
      })
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={localRef}>
        {/* ---- LOWER BODY ---- */}
        <RoundedBox args={[3.9, 0.62, 1.76]} radius={0.14} smoothness={6} position={[0, 0.68, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial ref={paintRef} color={colorHex} metalness={0.85} roughness={0.28} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.3} />
        </RoundedBox>
        {/* sculpted shoulder line */}
        <RoundedBox args={[3.7, 0.18, 1.8]} radius={0.08} position={[0, 0.92, 0]}>
          <meshPhysicalMaterial color={colorHex} metalness={0.85} roughness={0.25} clearcoat={1} envMapIntensity={1.2} />
        </RoundedBox>
        {/* ---- CABIN ---- */}
        <RoundedBox args={[2.05, 0.52, 1.52]} radius={0.18} smoothness={6} position={[-0.25, 1.22, 0]} castShadow>
          <meshPhysicalMaterial color="#0b0d10" metalness={0.4} roughness={0.15} clearcoat={1} envMapIntensity={1.5} />
        </RoundedBox>
        {/* roof panel (paint) */}
        <RoundedBox args={[1.5, 0.08, 1.4]} radius={0.04} position={[-0.3, 1.5, 0]}>
          <meshPhysicalMaterial color={colorHex} metalness={0.85} roughness={0.25} clearcoat={1} />
        </RoundedBox>
        {/* windshield + rear glass sheen */}
        <mesh position={[0.78, 1.22, 0]} rotation={[0, 0, -0.5]}>
          <planeGeometry args={[0.7, 1.4]} />
          <meshPhysicalMaterial color="#11151c" metalness={0.9} roughness={0.05} transparent opacity={0.92} />
        </mesh>
        {/* ---- FRONT GRILLE + BUMPER ---- */}
        <RoundedBox args={[0.18, 0.32, 1.1]} radius={0.05} position={[1.95, 0.55, 0]}>
          <meshStandardMaterial color="#08090b" roughness={0.6} metalness={0.4} />
        </RoundedBox>
        <mesh position={[2.04, 0.62, 0]}>
          <boxGeometry args={[0.04, 0.06, 0.9]} />
          <meshStandardMaterial color="#2a2d33" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* ---- HEADLIGHTS (halogen VXi - warm glow) ---- */}
        {[-0.62, 0.62].map((z) => (
          <group key={z} position={[1.88, 0.82, z]}>
            <RoundedBox args={[0.12, 0.16, 0.42]} radius={0.05} rotation={[0, z > 0 ? -0.25 : 0.25, 0]}>
              <meshStandardMaterial color="#f5f2e8" emissive="#fff6d8" emissiveIntensity={2.2} roughness={0.2} />
            </RoundedBox>
            <pointLight color="#ffeecc" intensity={6} distance={4} decay={2} position={[0.3, 0, 0]} />
          </group>
        ))}
        {/* ---- TAILLIGHTS ---- */}
        {[-0.62, 0.62].map((z) => (
          <mesh key={z} position={[-1.96, 0.85, z]}>
            <boxGeometry args={[0.08, 0.18, 0.36]} />
            <meshStandardMaterial color="#5a0000" emissive="#e4002b" emissiveIntensity={1.6} />
          </mesh>
        ))}
        <pointLight color="#e4002b" intensity={3} distance={3} position={[-2.3, 0.8, 0]} />
        {/* side character line chrome */}
        {[-0.89, 0.89].map((z, i) => (
          <mesh key={i} position={[0, 0.78, z]}>
            <boxGeometry args={[3.2, 0.02, 0.02]} />
            <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.15} />
          </mesh>
        ))}
        {/* mirrors */}
        {[-0.95, 0.95].map((z) => (
          <group key={z} position={[0.6, 1.15, z]}>
            <mesh><boxGeometry args={[0.16, 0.1, 0.12]} /><meshPhysicalMaterial color={colorHex} metalness={0.8} roughness={0.3} clearcoat={1} /></mesh>
          </group>
        ))}
        {/* door handles */}
        {[0.3, -0.5].map((x) =>
          [-0.9, 0.9].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.9, z]}><boxGeometry args={[0.22, 0.03, 0.02]} /><meshStandardMaterial color="#d7dade" metalness={0.9} roughness={0.25} /></mesh>
          ))
        )}
        {/* wheels */}
        <Wheel position={[1.3, 0.34, 0.85]} />
        <Wheel position={[1.3, 0.34, -0.85]} />
        <Wheel position={[-1.3, 0.34, 0.85]} />
        <Wheel position={[-1.3, 0.34, -0.85]} />
        {/* exhaust */}
        <mesh position={[-1.95, 0.28, 0.5]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.18, 16]} />
          <meshStandardMaterial color="#8a8f96" metalness={1} roughness={0.25} />
        </mesh>
        {/* underbody red ambience */}
        <pointLight color="#e4002b" intensity={1.2} distance={3.5} position={[0, 0.15, 0]} />

        {/* ---- SAFETY RINGS ---- */}
        {[1.6, 2.1, 2.6].map((r, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.8, 0]} userData={{ isRing: true }}>
            <torusGeometry args={[r, 0.008, 8, 96]} />
            <meshBasicMaterial color={i === 1 ? '#e4002b' : '#ffffff'} transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {/* soft blob shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[5.2, 2.8]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.55} depthWrite={false} />
      </mesh>
    </group>
  )
}
