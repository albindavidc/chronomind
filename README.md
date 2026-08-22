# Chronos (Chronomind)

A smart, aesthetic timer and stopwatch application built with React, Vite, and Tailwind CSS.

## 🌟 Overview

Chronos is a beautifully designed time management tool that offers a suite of features including a classic countdown timer, a complex sequence timer for routines, a stopwatch with lap tracking, and customizable sound notifications. It features a sleek, minimalist UI with smooth transitions, ambient glassmorphism effects, and a mobile-first responsive design.

## ✨ Features

- **Timer View**: Quick countdown timer with predefined presets (1m, 2m, 3m, 5m, 10m, 25m, 1h) and manual adjustment. Features a beautiful circular progress indicator.
- **Sequence View**: Create and run multi-step timer sequences. Perfect for workout routines (like Yoga flows) or productivity methods (like Pomodoro).
  - Built-in templates: Yoga (1m, 3m, 5m) and Work (25m/5m).
  - Bulk add steps and customize individual durations.
  - Duplicate, reorder, and remove steps.
  - Save and manage custom sequences in local storage.
- **Stopwatch View**: Track elapsed time with millisecond precision and record unlimited laps.
- **Settings & Customization**: Choose from multiple ambient notification sounds (Classic, Ethereal, Cosmic, Zen, Digital).
- **Gestures & Navigation**: Intuitive swipe navigation between views on touch devices.
- **Wake Lock**: Prevents your device screen from sleeping while a timer or sequence is actively running (using the Screen Wake Lock API).
- **PWA Ready**: Includes `manifest.json` and icons for a native app-like experience on mobile devices.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript (v5.9.0)

## 📁 Project Structure

```text
/
├── components/          # React components
│   ├── CircularProgress.tsx # SVG circular progress indicator
│   ├── SequenceView.tsx     # Multi-step sequence timer UI
│   ├── SettingsView.tsx     # Preferences and sound selection
│   ├── SmartSetup.tsx       # AI/Smart setup interface (if enabled)
│   ├── StopwatchView.tsx    # Stopwatch and lap tracking
│   ├── Tabs.tsx             # Bottom navigation bar
│   └── TimerView.tsx        # Standard countdown timer
├── hooks/
│   └── useWakeLock.ts       # Hook to manage Screen Wake Lock API
├── services/
│   └── geminiService.ts     # Service for AI integrations
├── utils/
│   ├── soundEngine.ts       # Audio synthesis and playback utility
│   └── time.ts              # Time formatting utilities
├── public/                  # Static assets (icons, manifest)
├── App.tsx                  # Main application component and routing
├── index.html               # Entry HTML file
├── index.tsx                # React root rendering
├── types.ts                 # TypeScript interfaces and types
├── vite.config.ts           # Vite configuration
└── package.json             # Project metadata and dependencies
```

## 🚀 Setup and Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation Steps

1. **Clone the repository** (if applicable) or download the project files.
2. **Navigate to the project directory**:
   ```bash
   cd path/to/chronos
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000` (or the port specified by your environment).

## 🔨 Build for Production

To create a production-ready build, run:
```bash
npm run build
```
This will generate optimized static files in the `dist` directory, which can be deployed to any static hosting service (like Vercel, Netlify, or GitHub Pages).

## 📖 Usage Guidelines

- **Navigation**: Use the bottom tab bar to switch between Timer, Sequence, Stopwatch, and Settings. On touch devices, you can also swipe left or right across the main screen.
- **Timer**: Tap a preset button below the timer ring to set a quick duration, or use the `+` and `-` buttons for precise adjustments. Tap the "Play" button to start.
- **Sequences**: 
  - Go to the Sequence tab.
  - Use "Step" to add individual steps, or "Batch" to add multiple steps at once.
  - Click on a step's name to rename it, and use the controls to adjust its duration.
  - Save your custom flow using the "Save Sequence" button for future use.
  - Try out the quick templates (Yoga, Work) for common workflows.
- **Stopwatch**: Press Play to start tracking time. Press the Flag icon to record a lap.
- **Sound Settings**: Navigate to the Settings tab to select your preferred alarm sound. The application synthesizes these sounds in the browser, and your choice is saved locally.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to modify the codebase to add new timer templates, custom sound effects via the Web Audio API, or UI enhancements.
