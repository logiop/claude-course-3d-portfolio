import Scene from './components/Scene'
import HUD from './components/HUD'
import ModulePanel from './components/ModulePanel'
import ChallengeModal from './components/ChallengeModal'
import TouchControls from './components/TouchControls'

export default function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-space-950">
      <Scene />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,6,15,0.75)_100%)]" />
      <HUD />
      <ModulePanel />
      <TouchControls />
      <ChallengeModal />
    </div>
  )
}
