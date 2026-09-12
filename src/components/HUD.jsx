import { useMemo, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useStore } from '../store/useStore'
import { getCircularPosition } from '../utils/layout'

const MINIMAP_SIZE = 140

const CONTROLS = [
  ['WASD', 'muovi'],
  ['Drag', 'ruota'],
  ['Click', 'apri isola'],
  ['ESC', 'chiudi'],
]

function Minimap({ modules, activeId }) {
  const center = MINIMAP_SIZE / 2
  const radius = center - 14

  const points = useMemo(
    () =>
      modules.map((m, i) => {
        const [x, , z] = getCircularPosition(i, modules.length, radius)
        return { id: m.id, x: center + x, y: center + z, unlocked: m.isCompleted }
      }),
    [modules, center, radius]
  )

  return (
    <div
      className="relative rounded-full border border-neon-cyan/30 bg-space-900/70 backdrop-blur-sm"
      style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
    >
      {points.map((p) => {
        const isActive = p.id === activeId
        const dotClass = isActive
          ? 'scale-150 bg-neon-amber shadow-[0_0_8px_2px_rgba(255,184,77,0.9)]'
          : p.unlocked
            ? 'bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.8)]'
            : 'bg-gray-600'
        return (
          <span
            key={p.id}
            className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${dotClass}`}
            style={{ left: p.x, top: p.y }}
            title={p.id}
          />
        )
      })}
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-amber" />
    </div>
  )
}

export default function HUD() {
  const modules = useStore((s) => s.modules)
  const hoveredId = useStore((s) => s.hoveredModuleId)
  const selectedId = useStore((s) => s.selectedModuleId)
  const barRef = useRef(null)

  const completed = modules.filter((m) => m.isCompleted).length
  const total = modules.length
  const pct = Math.round((completed / total) * 100)
  const activeId = selectedId ?? hoveredId
  const hovered = hoveredId ? modules.find((m) => m.id === hoveredId) : null

  useEffect(() => {
    if (!barRef.current) return
    gsap.to(barRef.current, { width: `${pct}%`, duration: 0.8, ease: 'power2.out' })
  }, [pct])

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between gap-4 p-4 font-game text-white sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-lg tracking-wider text-neon-cyan drop-shadow-[0_0_8px_rgba(77,243,255,0.8)]">
            CLAUDE API COURSE
          </h1>
          <div className="w-64 rounded-full border border-neon-cyan/40 bg-space-900/70 p-1 backdrop-blur-sm sm:w-72">
            <div
              ref={barRef}
              className="h-3 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple shadow-glow"
              style={{ width: '0%' }}
            />
          </div>
          <div className="text-sm text-white/80">
            {completed}/{total} moduli completati &middot; {pct}%
          </div>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-2 opacity-70 transition-opacity hover:opacity-100">
          <Minimap modules={modules} activeId={activeId} />
          <div className="flex items-center gap-3 text-[10px] text-white/60">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_4px_1px_rgba(255,255,255,0.8)]" />
              sbloccato
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-gray-600" />
              bloccato
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <ul className="flex flex-wrap gap-4 text-xs text-white/60">
          {CONTROLS.map(([key, label]) => (
            <li key={key} className="flex items-center gap-1.5">
              <kbd className="rounded border border-white/20 bg-space-900/70 px-1.5 py-0.5 text-[10px] text-neon-cyan">
                {key}
              </kbd>
              {label}
            </li>
          ))}
        </ul>

        {hovered && !selectedId && (
          <div className="rounded-md border border-white/10 bg-space-900/70 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm">
            <span className="text-neon-cyan">{hovered.id}</span> &middot; {hovered.title}
            <span className="ml-2 text-white/40">
              {hovered.isCompleted ? 'clicca per esplorare' : 'clicca per la sfida'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
