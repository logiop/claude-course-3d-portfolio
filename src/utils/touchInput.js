import { useEffect, useState } from 'react'

// Vettore di movimento condiviso tra il joystick touch e CameraRig: viene mutato
// direttamente (come il ref dei tasti WASD) per non innescare render a ogni frame.
// x = strafe destra/sinistra, y = avanti/indietro, entrambi in [-1, 1].
export const moveInput = { x: 0, y: 0 }

export function resetMoveInput() {
  moveInput.x = 0
  moveInput.y = 0
}

const COARSE_POINTER = '(pointer: coarse)'

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(COARSE_POINTER).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(COARSE_POINTER)
    const onChange = (e) => setIsTouch(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isTouch
}
