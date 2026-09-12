let ctx = null

function getContext() {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || window.webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(ac, { freq, type = 'sine', start, duration, gain = 0.18, endFreq }) {
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration)
  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.015)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(amp).connect(ac.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export function playCorrect() {
  const ac = getContext()
  if (!ac) return
  const t = ac.currentTime
  tone(ac, { freq: 523.25, start: t, duration: 0.14 })
  tone(ac, { freq: 783.99, start: t + 0.13, duration: 0.28, gain: 0.2 })
}

export function playWrong() {
  const ac = getContext()
  if (!ac) return
  const t = ac.currentTime
  tone(ac, { freq: 140, endFreq: 90, type: 'sawtooth', start: t, duration: 0.28, gain: 0.12 })
}
