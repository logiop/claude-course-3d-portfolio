import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useStore } from '../store/useStore'

export default function ModulePanel() {
  const selectedModuleId = useStore((s) => s.selectedModuleId)
  const modules = useStore((s) => s.modules)
  const clearSelection = useStore((s) => s.clearSelection)
  const panelRef = useRef(null)

  const module = modules.find((m) => m.id === selectedModuleId) ?? null

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') clearSelection()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [clearSelection])

  useEffect(() => {
    if (module && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      )
    }
  }, [module])

  if (!module) return null

  return (
    <div
      ref={panelRef}
      className="pointer-events-auto absolute right-6 top-1/2 z-20 w-80 -translate-y-1/2 rounded-lg border border-neon-cyan/40 bg-space-900/95 p-5 font-game text-white shadow-glow"
    >
      <button
        onClick={clearSelection}
        className="absolute right-3 top-3 text-white/50 hover:text-white"
        aria-label="Chiudi pannello"
      >
        ✕
      </button>

      <div className="mb-1 text-xs uppercase tracking-widest text-neon-cyan">
        Modulo {module.id}
      </div>
      <h2 className="mb-3 text-xl font-bold">{module.title}</h2>

      <p className="mb-4 text-sm leading-relaxed text-white/80">{module.description}</p>

      {module.codeSnippet && (
        <pre className="mb-4 max-h-40 overflow-auto rounded-md border border-white/10 bg-black/50 p-3 text-xs text-neon-cyan">
          <code>{module.codeSnippet}</code>
        </pre>
      )}

      <div className="text-xs text-white/50">
        Completato il {module.completedDate ?? '—'}
      </div>
    </div>
  )
}
