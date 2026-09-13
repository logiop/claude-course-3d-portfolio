import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { moveInput, resetMoveInput, useIsTouchDevice } from '../utils/touchInput'

const BASE_SIZE = 124
const KNOB_SIZE = 52
const MAX_RADIUS = (BASE_SIZE - KNOB_SIZE) / 2

export default function TouchControls() {
  const isTouch = useIsTouchDevice()
  const challengeOpen = useStore((s) => s.activeChallengeModuleId !== null)
  const baseRef = useRef(null)
  const pointerIdRef = useRef(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })

  useEffect(() => resetMoveInput, [])

  if (!isTouch || challengeOpen) return null

  const updateFrom = (clientX, clientY) => {
    const rect = baseRef.current.getBoundingClientRect()
    let dx = clientX - (rect.left + rect.width / 2)
    let dy = clientY - (rect.top + rect.height / 2)
    const dist = Math.hypot(dx, dy)
    if (dist > MAX_RADIUS) {
      dx = (dx / dist) * MAX_RADIUS
      dy = (dy / dist) * MAX_RADIUS
    }
    setKnob({ x: dx, y: dy })
    moveInput.x = dx / MAX_RADIUS
    moveInput.y = -dy / MAX_RADIUS // sullo schermo y cresce verso il basso
  }

  const handlePointerDown = (e) => {
    pointerIdRef.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFrom(e.clientX, e.clientY)
  }

  const handlePointerMove = (e) => {
    if (pointerIdRef.current !== e.pointerId) return
    updateFrom(e.clientX, e.clientY)
  }

  const handlePointerEnd = (e) => {
    if (pointerIdRef.current !== e.pointerId) return
    pointerIdRef.current = null
    setKnob({ x: 0, y: 0 })
    resetMoveInput()
  }

  const engaged = knob.x !== 0 || knob.y !== 0

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div
        ref={baseRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onContextMenu={(e) => e.preventDefault()}
        style={{ width: BASE_SIZE, height: BASE_SIZE, touchAction: 'none' }}
        className={`pointer-events-auto absolute bottom-6 left-5 select-none rounded-full border bg-space-900/50 backdrop-blur-sm transition-colors ${
          engaged ? 'border-neon-cyan/70' : 'border-neon-cyan/25'
        }`}
        aria-label="Joystick di movimento"
      >
        <span className="absolute left-1/2 top-1/2 h-px w-10 -translate-x-1/2 -translate-y-1/2 bg-neon-cyan/15" />
        <span className="absolute left-1/2 top-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2 bg-neon-cyan/15" />
        <span
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
          }}
          className={`absolute left-1/2 top-1/2 rounded-full border border-neon-cyan/60 bg-neon-cyan/20 ${
            engaged ? 'shadow-glow' : ''
          }`}
        />
      </div>
    </div>
  )
}
