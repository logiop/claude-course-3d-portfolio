import { create } from 'zustand'
import modulesSeed from '../data/modules.json'

// v2: la progressione va riguadagnata superando le sfide, quindi la chiave
// della versione precedente (moduli pre-sbloccati) viene scartata all'avvio.
const STORAGE_KEY = 'courseProgress:v2'
const LEGACY_KEYS = ['courseProgress']

function loadProgress() {
  try {
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k))
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function persistModules(modules) {
  try {
    const completed = modules
      .filter((m) => m.isCompleted)
      .map((m) => ({ id: m.id, completedDate: m.completedDate }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed))
  } catch {
    // storage non disponibile (private mode, quota): la sessione resta in memoria
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const savedProgress = loadProgress() ?? []

const initialModules = modulesSeed.map((m) => {
  const saved = savedProgress.find((p) => p.id === m.id)
  return saved
    ? { ...m, isCompleted: true, completedDate: saved.completedDate ?? m.completedDate }
    : { ...m, isCompleted: false }
})

export const useStore = create((set, get) => ({
  modules: initialModules,
  selectedModuleId: null,
  hoveredModuleId: null,
  cameraTarget: null, // { position: [x,y,z], lookAt: [x,y,z] } | null
  activeChallengeModuleId: null,
  challengeAttempts: {}, // in-memory, non persistito

  selectModule: (id) => {
    const mod = get().modules.find((m) => m.id === id)
    if (!mod) return
    set({ selectedModuleId: id })
  },

  clearSelection: () => set({ selectedModuleId: null, cameraTarget: null }),

  setHoveredModule: (id) => set({ hoveredModuleId: id }),

  setCameraTarget: (target) => set({ cameraTarget: target }),

  openChallenge: (id) => {
    const mod = get().modules.find((m) => m.id === id)
    if (!mod) return
    set({ activeChallengeModuleId: id, selectedModuleId: null, hoveredModuleId: null })
  },

  closeChallenge: () => set({ activeChallengeModuleId: null, cameraTarget: null }),

  submitChallengeAnswer: (id, optionIndex) => {
    const mod = get().modules.find((m) => m.id === id)
    if (!mod?.challenge) return { correct: false, attempts: 0 }

    if (optionIndex === mod.challenge.correctIndex) {
      set((state) => {
        const modules = state.modules.map((m) =>
          m.id === id ? { ...m, isCompleted: true, completedDate: todayISO() } : m
        )
        persistModules(modules)
        return { modules }
      })
      return { correct: true, attempts: get().challengeAttempts[id] ?? 0 }
    }

    const attempts = (get().challengeAttempts[id] ?? 0) + 1
    set((state) => ({ challengeAttempts: { ...state.challengeAttempts, [id]: attempts } }))
    return { correct: false, attempts }
  },

  toggleComplete: (id) => {
    set((state) => {
      const modules = state.modules.map((m) =>
        m.id === id
          ? { ...m, isCompleted: !m.isCompleted, completedDate: m.isCompleted ? null : todayISO() }
          : m
      )
      persistModules(modules)
      return { modules }
    })
  },

  completedCount: () => get().modules.filter((m) => m.isCompleted).length,
  totalCount: () => get().modules.length,
}))
