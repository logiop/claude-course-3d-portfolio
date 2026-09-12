import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import { useStore } from '../store/useStore'

const MOVE_SPEED = 10

export default function CameraRig() {
  const controlsRef = useRef()
  const { camera } = useThree()
  const keys = useRef({ w: false, a: false, s: false, d: false })
  const animatingRef = useRef(false)
  const cameraTarget = useStore((s) => s.cameraTarget)

  useEffect(() => {
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase()
      if (k in keys.current) keys.current[k] = true
    }
    const onKeyUp = (e) => {
      const k = e.key.toLowerCase()
      if (k in keys.current) keys.current[k] = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  // Transizione fluida della camera verso il modulo selezionato
  useEffect(() => {
    if (!cameraTarget || !controlsRef.current) return
    animatingRef.current = true
    const controls = controlsRef.current
    const { position, lookAt } = cameraTarget

    gsap.to(camera.position, {
      x: position[0],
      y: position[1],
      z: position[2],
      duration: 1.4,
      ease: 'power3.inOut',
      onUpdate: () => camera.updateProjectionMatrix(),
    })

    gsap.to(controls.target, {
      x: lookAt[0],
      y: lookAt[1],
      z: lookAt[2],
      duration: 1.4,
      ease: 'power3.inOut',
      onComplete: () => {
        animatingRef.current = false
      },
    })
  }, [cameraTarget, camera])

  useFrame((_, delta) => {
    if (animatingRef.current || !controlsRef.current) return

    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize()

    const move = new THREE.Vector3()
    if (keys.current.w) move.add(forward)
    if (keys.current.s) move.sub(forward)
    if (keys.current.d) move.add(right)
    if (keys.current.a) move.sub(right)

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(MOVE_SPEED * delta)
      camera.position.add(move)
      controlsRef.current.target.add(move)
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={4}
      maxDistance={40}
      maxPolarAngle={Math.PI / 2 - 0.05}
    />
  )
}
