import { Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars, Grid } from '@react-three/drei'
import * as THREE from 'three'
import ModuleIsland from './ModuleIsland'
import CameraRig from './CameraRig'
import Nebula from './Nebula'
import { useStore } from '../store/useStore'
import { getCircularPosition } from '../utils/layout'

const FOG_COLOR = '#070a1c'

export default function Scene() {
  const modules = useStore((s) => s.modules)
  const selectModule = useStore((s) => s.selectModule)
  const setCameraTarget = useStore((s) => s.setCameraTarget)
  const openChallenge = useStore((s) => s.openChallenge)

  const handleSelect = useCallback(
    (module) => {
      const index = modules.findIndex((m) => m.id === module.id)
      const [x, y, z] = getCircularPosition(index, modules.length)
      const dir = new THREE.Vector3(x, 0, z).normalize()
      const camPos = [x + dir.x * 5, 4.5, z + dir.z * 5]
      if (module.isCompleted) selectModule(module.id)
      else openChallenge(module.id)
      setCameraTarget({ position: camPos, lookAt: [x, 1.2, z] })
    },
    [modules, selectModule, openChallenge, setCameraTarget]
  )

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 12, 26], fov: 55, near: 0.1, far: 200 }}
      className="!absolute inset-0"
    >
      <fog attach="fog" args={[FOG_COLOR, 28, 95]} />

      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#6f7cff', '#0a0e1f', 0.5]} />
      <directionalLight
        position={[12, 22, 8]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-camera-far={60}
      />
      <pointLight position={[-20, 10, -12]} color="#4df3ff" intensity={90} distance={60} decay={2} />
      <pointLight position={[20, 10, -12]} color="#b967ff" intensity={90} distance={60} decay={2} />
      <pointLight position={[0, 8, 24]} color="#ffb84d" intensity={60} distance={50} decay={2} />

      <Suspense fallback={null}>
        <Nebula />
        <Stars radius={110} depth={60} count={6000} factor={7} saturation={0.4} fade speed={0.3} />
        <Stars radius={45} depth={25} count={1500} factor={3.5} saturation={0} fade speed={0.8} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <circleGeometry args={[22, 64]} />
          <meshStandardMaterial color="#0c1230" roughness={0.85} metalness={0.2} />
        </mesh>
        <Grid
          position={[0, -0.97, 0]}
          args={[60, 60]}
          cellSize={2}
          cellThickness={0.6}
          cellColor="#182246"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#2c3f7a"
          fadeDistance={50}
          fadeStrength={1.2}
          infiniteGrid
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.96, 0]}>
          <ringGeometry args={[21.5, 22.2, 96]} />
          <meshBasicMaterial
            color="#4df3ff"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {modules.map((module, index) => (
          <ModuleIsland
            key={module.id}
            module={module}
            position={getCircularPosition(index, modules.length)}
            onSelect={handleSelect}
          />
        ))}

        <CameraRig />
      </Suspense>
    </Canvas>
  )
}
