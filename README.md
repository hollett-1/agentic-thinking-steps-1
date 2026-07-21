<div align="center">
  <img width="1200" height="475" alt="Agentic Thinking Steps Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Agentic Thinking Steps & AI Components

An interactive, high-performance visualizer and component library for **Agentic AI Thinking Steps**, AI loader animations, Material Design 3 UI patterns, and generative particle effects.

Built with React 19, Vite, TypeScript, Canvas API, and Material Color Utilities.

---

## ✨ Features

- 🧠 **Agentic AI Thinking Steps Visualizer**: Interactive UI components showcasing real-time AI reasoning, multi-step progress, expandable status detail cards, and customizable spark states.
- 🌌 **Generative Visual Effects**:
  - **Aurora Particle Mesh**: Dynamic, fluid visual effects rendered with high-frame-rate canvas animations.
  - **Neural Sheet Mesh**: Animated geometric sheet mesh visualizer for neural activity simulation.
  - **Particle Text**: Interactive text rendered with animated particles responding to state transitions.
- 📱 **Multi-Device Presentation Frames**: Showcase components inside realistic device context:
  - **Android Presentation Frame**
  - **Web Browser Frame**
  - **Freeform Canvas**
- 🎨 **Material 3 & Custom Dynamic Themes**: Full light/dark mode support, Material 3 dynamic color generation, and custom surface styles.
- 🎛️ **Interactive GUI & Preset System**:
  - Live parameter tweaks (speed, particle density, color accents, elevation, spacing).
  - Quick-switch presets (List State, Default State, Compact Mode).
  - Floating sidebar with toggle shortcut.
- 🔍 **Showcase Utilities**:
  - Real-time **FPS Counter** performance monitor.
  - **Scale Stepper** (25% to 300% zoom controls with 25% increments).
  - **Replay & Play/Pause** animation triggers.
  - **One-Click Code Exporter**: Instantly copy generated React component props to clipboard.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (or `yarn` / `pnpm`)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create or edit your `.env.local` file in the root directory and add your Gemini API key (if applicable):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server

Start the local Vite server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3003` (or the URL output in your terminal).

### 4. Build for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📂 Project Structure

```text
├── components/               # React UI & Canvas visualizer components
│   ├── ControlCards/         # Sub-panels for tweaking component properties
│   ├── AuroraParticleMesh.tsx # Canvas aurora fluid particle renderer
│   ├── Column.tsx            # Layout & thinking column components
│   ├── Controls.tsx          # Main GUI control sidebar
│   ├── ErrorBoundary.tsx     # React error boundary wrapper
│   ├── GenerativeBackground.tsx # Generative canvas background effects
│   ├── LabsControls.tsx      # Advanced lab mode control panel
│   ├── Loader.tsx            # Main Agentic Thinking Loader component
│   ├── M3Components.tsx      # Material Design 3 UI element library
│   ├── NeuralSheetMesh.tsx   # Canvas 3D neural grid mesh renderer
│   ├── ParticleText.tsx      # Particle-based text animation component
│   └── PresentationFrames.tsx# Android, Web, and Freeform showcase wrappers
├── hooks/                    # Custom React hooks (e.g. useThemeInjection)
├── App.tsx                   # Main application entry & workspace container
├── constants.ts              # App default configuration & initial state
├── presets.ts                # Pre-configured visual presets & themes
├── types.ts                  # TypeScript interfaces and state typings
├── themes.ts                 # Material 3 theme utility definitions
├── index.html                # HTML entry point with Google Fonts & Icons
└── vite.config.ts            # Vite bundler configuration
```

---

## 🛠️ Built With

- **[React 19](https://react.dev/)** - UI Component library
- **[Vite 6](https://vitejs.dev/)** - Fast frontend development & bundler
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Type safety & developer experience
- **[Material Color Utilities](https://github.com/material-foundation/material-color-utilities)** - Material 3 dynamic color palette system
- **[HTML5 Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)** - High performance 60 FPS generative visual effects

---

## 📄 License

This project is licensed under the MIT License - see the repository details for more info.
