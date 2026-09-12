import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Text, Sparkles, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useStore } from '../store/useStore'
import { getModuleColor, LOCKED_COLOR } from '../utils/colors'

const LABEL_GRAY = '#6b7280'
const UNLOCK_FX_MS = 1500

export default function ModuleIsland({ module, position, onSelect }) {
  const groupRef = useRef()
  const coreRef = useRef()
  const ringMatRef = useRef()
  const prevCompletedRef = useRef(module.isCompleted)
  const poppingRef = useRef(false)
  const [hovered, setHovered] = useState(false)
  const [justUnlocked, setJustUnlocked] = useState(false)
  const setHoveredModule = useStore((s) => s.setHoveredModule)
  const isSelected = useStore((s) => s.selectedModuleId === module.id)

  const unlocked = module.isCompleted
  const active = hovered || isSelected
  const accent = unlocked ? getModuleColor(module) : LOCKED_COLOR

  const { baseColor, glowColor } = useMemo(() => {
    const c = new THREE.Color(accent)
    return {
      baseColor: c.clone().multiplyScalar(unlocked ? 0.35 : 0.6),
      glowColor: active ? c.clone().lerp(new THREE.Color('#ffffff'), unlocked ? 0.15 : 0.5) : c,
    }
  }, [accent, unlocked, active])

  const emissiveIntensity = justUnlocked ? 2.2 : unlocked ? (active ? 1.0 : 0.7) : active ? 0.35 : 0.04
  const phase = position[0] + position[2]

  // Scale-pop + boost temporaneo degli effetti quando il modulo passa a sbloccato
  useEffect(() => {
    const was = prevCompletedRef.current
    prevCompletedRef.current = module.isCompleted
    if (was || !module.isCompleted) return

    setJustUnlocked(true)
    poppingRef.current = true
    const tl = gsap.timeline({ onComplete: () => (poppingRef.current = false) })
    if (groupRef.current) {
      tl.to(groupRef.current.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.22, ease: 'power2.out' })
        .to(groupRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.0, ease: 'elastic.out(1, 0.35)' })
    }
    const timer = setTimeout(() => setJustUnlocked(false), UNLOCK_FX_MS)
    return () => {
      clearTimeout(timer)
      tl.kill()
      poppingRef.current = false
    }
  }, [module.isCompleted])

  useFrame((state, delta) => {
    const g = groupRef.current
    if (!g) return
    g.rotation.y += delta * (justUnlocked ? 1.2 : unlocked ? 0.25 : 0.04)
    if (!poppingRef.current) {
      g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, unlocked && active ? 1.1 : 1, 6, delta))
    }

    const t = state.clock.elapsedTime
    if (unlocked && coreRef.current) {
      coreRef.current.position.y = 1.4 + Math.sin(t * 1.5 + phase) * 0.15
    }
    if (ringMatRef.current) {
      const base = justUnlocked ? 0.95 : active ? 0.6 : 0.4
      ringMatRef.current.opacity = base + Math.sin(t * 2 + phase) * 0.1
    }
  })

  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    setHoveredModule(module.id)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    setHovered(false)
    setHoveredModule(null)
    document.body.style.cursor = 'auto'
  }

  const handleClick = (e) => {
    e.stopPropagation()
    onSelect(module)
  }

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.6, 2, 0.6, 8]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={glowColor}
            emissiveIntensity={emissiveIntensity * 0.6}
            roughness={0.45}
            metalness={0.35}
          />
        </mesh>

        <mesh ref={coreRef} position={[0, 1.4, 0]}>
          <icosahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={emissiveIntensity}
            wireframe={!unlocked}
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>

        {unlocked && (
          <pointLight
            color={accent}
            intensity={justUnlocked ? 40 : active ? 9 : 6}
            distance={justUnlocked ? 12 : 7}
            decay={2}
          />
        )}
      </group>

      {unlocked && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.32, 0]}>
            <ringGeometry args={[1.75, 2.15, 48]} />
            <meshBasicMaterial
              ref={ringMatRef}
              color={accent}
              transparent
              opacity={0.45}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh position={[0, 4.3, 0]}>
            <cylinderGeometry args={[0.25, 0.9, 8, 12, 1, true]} />
            <meshBasicMaterial
              color={accent}
              transparent
              opacity={active ? 0.14 : 0.07}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          <Sparkles
            count={justUnlocked ? 90 : 30}
            scale={justUnlocked ? [5, 4.5, 5] : [3.5, 3, 3.5]}
            size={justUnlocked ? 7 : active ? 4 : 2.5}
            speed={justUnlocked ? 1.4 : 0.35}
            color={accent}
            position={[0, 1.4, 0]}
          />
        </>
      )}

      <Billboard position={[0, 3.4, 0]}>
        <Text
          fontSize={0.85}
          color={unlocked ? '#ffffff' : LABEL_GRAY}
          anchorX="center"
          anchorY="middle"
          outlineWidth={unlocked ? 0.05 : 0}
          outlineColor={accent}
          outlineOpacity={0.9}
        >
          {module.id}
        </Text>
      </Billboard>

      <Billboard position={[0, 2.55, 0]}>
        <Text
          fontSize={0.34}
          maxWidth={5}
          textAlign="center"
          color={unlocked ? '#ffffff' : LABEL_GRAY}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#05060f"
        >
          {module.title}
        </Text>
      </Billboard>

      {!unlocked && (
        <Billboard position={[0, 4.1, 0]}>
          <Text fontSize={0.4} color={LABEL_GRAY} anchorX="center" anchorY="middle">
            🔒
          </Text>
        </Billboard>
      )}

      {hovered && (
        <Html position={[0, 4.4, 0]} center distanceFactor={10}>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-white/20 bg-space-900/90 px-3 py-1 font-game text-xs text-white shadow-glow">
            {unlocked ? 'Clicca per esplorare' : 'Clicca per la sfida'}
          </div>
        </Html>
      )}
    </group>
  )
}
