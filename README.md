# Claude Course 3D Portfolio

Un portfolio 3D in stile videogioco che traccia il mio percorso nel corso **Claude API** di Anthropic.

I 12 moduli del corso sono rappresentati come isole disposte in un cerchio nello spazio. Ogni isola parte bloccata: per sbloccarla bisogna superare una piccola sfida sul contenuto reale di quel modulo — un quiz a risposta multipla oppure uno snippet di codice in cui individuare il bug. Quando rispondi correttamente l'isola si illumina con un'esplosione di particelle, un suono sintetizzato e un pop animato, e si apre il pannello con descrizione, codice e data di completamento.

Il progresso viene salvato nel `localStorage` del browser.

## Live demo

**https://claude-course-3d-portfolio.vercel.app**

## Stack tecnico

- **[React Three Fiber](https://github.com/pmndrs/react-three-fiber)** + **[drei](https://github.com/pmndrs/drei)** — scena 3D dichiarativa
- **[Three.js](https://threejs.org/)** — rendering engine WebGL
- **[Vite](https://vitejs.dev/)** — build tool e dev server
- **[GSAP](https://gsap.com/)** — animazioni di camera e transizioni UI
- **[Tailwind CSS](https://tailwindcss.com/)** — styling di HUD e pannelli
- **[Zustand](https://github.com/pmndrs/zustand)** — stato dell'applicazione
- **Web Audio API** (nativa) — effetti sonori sintetizzati, senza file audio né librerie

## Eseguirlo in locale

Serve Node.js 18 o superiore.

```bash
npm install
npm run dev
```

Il dev server parte su `http://localhost:5173`. Per esporlo sulla rete locale (per esempio per aprirlo dal telefono) usa `npm run dev -- --host`.

Per la build di produzione:

```bash
npm run build
npm run preview
```

## Controlli

| Input | Azione |
| --- | --- |
| `WASD` | Muovi la camera |
| Trascina con il mouse | Ruota la vista |
| Rotella / pinch | Zoom |
| Click su un'isola | Apri la sfida (se bloccata) o il pannello info (se sbloccata) |
| `ESC` | Chiudi pannello o sfida |

## Struttura

```
src/
├── components/
│   ├── Scene.jsx           # Canvas, luci, campo stellare, terreno
│   ├── ModuleIsland.jsx    # Isola 3D: glow, particelle, label, effetto di sblocco
│   ├── CameraRig.jsx       # OrbitControls + movimento WASD + transizioni GSAP
│   ├── Nebula.jsx          # Sfondo shader (gradiente + bagliori)
│   ├── HUD.jsx             # Barra di progresso, minimappa, controlli
│   ├── ModulePanel.jsx     # Pannello informativo del modulo sbloccato
│   └── ChallengeModal.jsx  # Modal della sfida con quiz / debug di codice
├── store/useStore.js       # Stato Zustand + persistenza localStorage
├── data/modules.json       # I 12 moduli con le relative sfide
└── utils/                  # Layout circolare, palette colori, audio
```
