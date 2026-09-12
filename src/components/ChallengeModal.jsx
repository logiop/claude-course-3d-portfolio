import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useStore } from '../store/useStore'
import { playCorrect, playWrong } from '../utils/sound'

const SUCCESS_DELAY_MS = 1300
const WRONG_RESET_MS = 650
const HINT_AFTER_ATTEMPTS = 2

function ChallengeCard({ module }) {
  const closeChallenge = useStore((s) => s.closeChallenge)
  const selectModule = useStore((s) => s.selectModule)
  const submitChallengeAnswer = useStore((s) => s.submitChallengeAnswer)
  const attempts = useStore((s) => s.challengeAttempts[module.id] ?? 0)

  const cardRef = useRef(null)
  const timerRef = useRef(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'correct' | 'wrong'

  const { challenge } = module
  const showHint = attempts >= HINT_AFTER_ATTEMPTS && challenge.hint

  useEffect(() => {
    if (!cardRef.current) return
    gsap.fromTo(
      cardRef.current,
      { y: 24, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' }
    )
    return () => clearTimeout(timerRef.current)
  }, [])

  const handleAnswer = (index) => {
    if (status !== 'idle') return
    setSelectedIndex(index)
    const { correct } = submitChallengeAnswer(module.id, index)

    if (correct) {
      setStatus('correct')
      playCorrect()
      gsap.fromTo(cardRef.current, { scale: 1 }, { scale: 1.03, duration: 0.18, yoyo: true, repeat: 1 })
      timerRef.current = setTimeout(() => {
        closeChallenge()
        selectModule(module.id)
      }, SUCCESS_DELAY_MS)
      return
    }

    setStatus('wrong')
    playWrong()
    gsap.fromTo(
      cardRef.current,
      { x: -10 },
      { x: 0, duration: 0.45, ease: 'elastic.out(1, 0.3)' }
    )
    timerRef.current = setTimeout(() => {
      setStatus('idle')
      setSelectedIndex(null)
    }, WRONG_RESET_MS)
  }

  const optionClass = (index) => {
    const base =
      'w-full rounded-md border px-4 py-3 text-left text-sm transition-colors duration-200 disabled:cursor-default'
    if (status === 'correct' && index === selectedIndex) {
      return `${base} border-emerald-400 bg-emerald-400/20 text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.6)]`
    }
    if (status === 'wrong' && index === selectedIndex) {
      return `${base} border-red-400 bg-red-400/20 text-red-100 shadow-[0_0_16px_rgba(248,113,113,0.6)]`
    }
    return `${base} border-white/15 bg-space-800/60 text-white/85 hover:border-neon-cyan/60 hover:bg-neon-cyan/10`
  }

  return (
    <div
      ref={cardRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="challenge-title"
      onClick={(e) => e.stopPropagation()}
      className={`relative w-[min(92vw,34rem)] rounded-lg border p-6 font-game text-white shadow-glow transition-colors duration-300 ${
        status === 'correct'
          ? 'border-emerald-400/70 bg-emerald-950/95'
          : status === 'wrong'
            ? 'border-red-400/70 bg-space-900/95'
            : 'border-neon-cyan/40 bg-space-900/95'
      }`}
    >
      <button
        onClick={closeChallenge}
        className="absolute right-3 top-3 text-white/50 hover:text-white"
        aria-label="Chiudi sfida"
      >
        ✕
      </button>

      <div className="mb-1 text-xs uppercase tracking-widest text-neon-cyan">
        Sfida · Modulo {module.id}
      </div>
      <h2 id="challenge-title" className="mb-3 text-lg font-bold">
        {module.title}
      </h2>

      <p className="mb-4 text-sm leading-relaxed text-white/85">{challenge.question}</p>

      {challenge.type === 'code' && challenge.code && (
        <pre className="mb-4 max-h-52 overflow-auto rounded-md border border-white/10 bg-black/60 p-3 font-mono text-xs leading-relaxed text-neon-cyan">
          <code>{challenge.code}</code>
        </pre>
      )}

      <div className="flex flex-col gap-2">
        {challenge.options.map((option, index) => (
          <button
            key={index}
            type="button"
            disabled={status !== 'idle'}
            onClick={() => handleAnswer(index)}
            className={optionClass(index)}
          >
            <span className="mr-2 text-neon-cyan/80">{String.fromCharCode(65 + index)}.</span>
            {option}
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-[1.5rem] text-sm" aria-live="polite">
        {status === 'correct' && (
          <span className="text-emerald-300">Corretto! Isola sbloccata.</span>
        )}
        {status === 'wrong' && <span className="text-red-300">Non è questa. Riprova!</span>}
        {status === 'idle' && showHint && (
          <span className="text-neon-amber/90">Suggerimento: {challenge.hint}</span>
        )}
      </div>
    </div>
  )
}

export default function ChallengeModal() {
  const activeChallengeModuleId = useStore((s) => s.activeChallengeModuleId)
  const modules = useStore((s) => s.modules)
  const closeChallenge = useStore((s) => s.closeChallenge)

  const module = modules.find((m) => m.id === activeChallengeModuleId) ?? null

  useEffect(() => {
    if (!module) return
    document.body.style.cursor = 'auto'
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeChallenge()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [module, closeChallenge])

  if (!module?.challenge) return null

  return (
    <div
      onClick={closeChallenge}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
    >
      <ChallengeCard key={module.id} module={module} />
    </div>
  )
}
