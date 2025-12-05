# 🐕 HOUNDED - Hunderennen Manager

React-basiertes Hunderennen-Management-Spiel

## Features

✅ **Vollständiges Spiel**
- Hundemarkt (Hunde kaufen)
- Rennstall-Management (Training, Pflege, Trainer)
- Rennsystem mit realistischer Simulation
- Hot-Seat Multiplayer (1-4 Spieler)
- Rangliste

✅ **Speichersystem**
- Auto-Save bei jedem State-Change
- Supabase-basiert
- Load Game auf Start-Screen
- Race-History Tracking

✅ **Strategische Tiefe**
- 6 verschiedene Trainer
- Attribute: Speed, Stamina, Acceleration, Focus
- Fitness-Management
- Tagesform
- Renn-Historie

## Installation & Start

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build
npm run build
```

## Projekt-Struktur

```
src/
├── components/     # React Components
│   ├── Setup.jsx
│   ├── Header.jsx
│   ├── Navigation.jsx
│   ├── Stable.jsx
│   ├── Market.jsx
│   ├── Race.jsx
│   ├── DogDetail.jsx
│   └── Leaderboard.jsx
├── models/         # Game Logic Classes
│   ├── Dog.js
│   └── Player.js
├── data/           # Game Data
│   ├── dogData.js
│   └── trainers.js
├── utils/          # Utilities
│   ├── supabaseGame.js
│   └── assetLoader.js
├── lib/            # External Services
│   └── supabase.js
├── App.jsx         # Main App Component
└── main.jsx        # Entry Point
```

## Nächste Schritte

- [ ] Grafiken einfügen (Nano Banana Assets)
- [ ] Saison-System
- [ ] Alterungssystem
- [ ] Besseres Balancing
- [ ] Sound-Effekte

## Tech Stack

- React 19
- Vite
- Supabase (Database & Auth)
- Framer Motion
- Pure CSS (no frameworks)
