# 🐕 HOUNDED - Hunderennen Manager

Ein strategisches Hunderennen-Management-Spiel, gebaut mit React und Supabase. Kaufe Hunde, trainiere sie, tritt gegen KI-Gegner an und werde zum Champion!

## Features

### 🎮 Gameplay
- **Hundemarkt**: Kaufe und verkaufe Hunde mit verschiedenen Attributen
- **Rennstall-Management**: Trainiere deine Hunde mit 6 verschiedenen Trainern
- **Rennsystem**: Realistische Rennsimulation mit Physik und Strategie
- **Hot-Seat Multiplayer**: 1-4 Spieler können lokal gegeneinander spielen
- **KI-Gegner**: Intelligente Computer-Spieler mit eigenem Verhalten
- **Rangliste**: Vergleiche deine Leistung mit anderen

### 📊 Progression System
- **XP & Level System**: Sammle Erfahrung durch Rennen und steige auf
- **Attribute-System**: Speed, Stamina, Acceleration, Focus
- **Fitness-Management**: Halte deine Hunde in Topform
- **Tagesform**: Zufällige Faktoren beeinflussen die Leistung
- **Race-History**: Detaillierte Statistiken und Verlauf

### 💾 Persistenz
- **Auto-Save**: Automatisches Speichern bei jeder Änderung
- **Supabase Backend**: Zuverlässige Cloud-Datenbank
- **Load Game**: Fortschritt wird beim nächsten Besuch geladen
- **Race-History Tracking**: Alle Rennen werden gespeichert

## Installation & Setup

### 1. Repository klonen
```bash
git clone <your-repo-url>
cd project
npm install
```

### 2. Supabase Setup

#### Neues Supabase-Projekt erstellen
1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Notiere dir die **Project URL** und den **anon/public key**

#### Umgebungsvariablen konfigurieren
Erstelle eine `.env` Datei im Root-Verzeichnis:

```env
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key
```

#### Datenbank-Migrationen ausführen
Die Migrationen befinden sich in `supabase/migrations/`. Du kannst sie entweder:

**Option A: Über Supabase Dashboard (SQL Editor)**
1. Öffne dein Supabase-Projekt
2. Gehe zu SQL Editor
3. Führe die Migrationen in der richtigen Reihenfolge aus (001 → 008)

**Option B: Mit Supabase CLI**
```bash
# Supabase CLI installieren
npm install -g supabase

# Mit deinem Projekt verbinden
supabase link --project-ref dein-projekt-ref

# Migrationen ausführen
supabase db push
```

### 3. Development Server starten
```bash
npm run dev
```

Der Server läuft unter `http://localhost:5173`

### 4. Production Build
```bash
npm run build
npm run preview
```

## Datenbank-Schema

### Tabellen

#### `players`
- Spielerdaten (Name, Geld, XP, Level)
- Zeitstempel für Game-Loop
- Auto-incrementing Level-System

#### `player_dogs`
- Hunde im Besitz eines Spielers
- Attribute (Speed, Stamina, Acceleration, Focus)
- Fitness, Experience, Rennen gewonnen
- Trainer-Zuordnung

#### `market_dogs`
- Verfügbare Hunde auf dem Markt
- Preise und Attribute
- Wird dynamisch von AI-Playern gefüllt

#### `races`
- Race-History
- Platzierungen und Zeiten
- Verknüpfung zu Spieler und Hund

#### `ai_players`
- KI-Gegner mit Namen und Budget
- Spielverhalten (defensiv, aggressiv, etc.)

#### `player_stats`
- Erweiterte Statistiken pro Spieler
- Gesamterfolge, Geld verdient, etc.

### Row Level Security (RLS)
Alle Tabellen haben RLS-Policies aktiviert für sichere Multi-User-Umgebungen.

## Projekt-Struktur

```
project/
├── public/
│   ├── assets/              # Spielgrafiken
│   │   ├── backgrounds/     # Hintergrundbilder
│   │   ├── dogs/            # Hundegrafiken
│   │   └── platform/        # UI-Elemente
│   └── fonts.css            # Custom Fonts
├── src/
│   ├── components/          # React Components
│   │   ├── Setup.jsx        # Spielerstellung
│   │   ├── GameMenu.jsx     # Hauptmenü
│   │   ├── Header.jsx       # Header mit Stats
│   │   ├── Navigation.jsx   # Navigation
│   │   ├── Stable.jsx       # Hundestall
│   │   ├── Market.jsx       # Hundemarkt
│   │   ├── Race.jsx         # Rennen
│   │   ├── RaceAnimation.jsx # Race Visualisierung
│   │   ├── RaceResults.jsx  # Rennergebnisse
│   │   ├── DogDetail.jsx    # Hundedetails
│   │   ├── Stats.jsx        # Statistiken
│   │   └── Leaderboard.jsx  # Rangliste
│   ├── models/              # Game Logic
│   │   ├── Dog.js           # Hund-Klasse
│   │   └── Player.js        # Spieler-Klasse
│   ├── data/                # Game Data
│   │   ├── dogData.js       # Hundenamen & Basis-Daten
│   │   └── trackData.js     # Rennstrecken
│   ├── utils/               # Utilities
│   │   ├── supabaseGame.js  # Supabase Game-Logik
│   │   ├── aiActions.js     # KI-Verhalten
│   │   └── assetLoader.js   # Asset-Loading
│   ├── lib/                 # External Services
│   │   └── supabase.js      # Supabase Client
│   ├── App.jsx              # Haupt-App
│   ├── App.css              # Global Styles
│   └── main.jsx             # Entry Point
├── supabase/
│   └── migrations/          # DB Migrationen (001-008)
├── .env                     # Umgebungsvariablen (nicht in Git!)
├── package.json
├── vite.config.js
└── README.md
```

## Gameplay-Guide

### Spielstart
1. Erstelle 1-4 Spieler
2. Kaufe deinen ersten Hund im Markt
3. Trainiere ihn im Stall
4. Tritt im Rennen an

### Strategien
- **Frühe Phase**: Kaufe günstige Hunde und trainiere sie
- **Training**: Jeder Trainer verbessert andere Attribute
- **Fitness**: Halte Fitness zwischen 70-100 für beste Leistung
- **Markt**: Verkaufe alte Hunde, kaufe bessere
- **XP**: Je mehr Rennen, desto mehr XP und Level

### Tipps
- Hohe **Speed** ist gut für kurze Strecken
- Hohe **Stamina** ist wichtig für lange Strecken
- **Acceleration** hilft beim Start
- **Focus** reduziert Fehler im Rennen

## Technologie-Stack

- **Frontend**: React 19, Vite
- **Backend**: Supabase (PostgreSQL)
- **Animation**: Framer Motion
- **Styling**: Pure CSS (keine Frameworks)
- **State Management**: React Hooks

## Weiterentwicklung

### Geplante Features
- [ ] Saison-System mit Playoffs
- [ ] Alterungssystem für Hunde
- [ ] Züchtung (Breeding)
- [ ] Verletzungssystem
- [ ] Sound-Effekte und Musik
- [ ] Achievements und Quests
- [ ] Multiplayer-Mode (Online)
- [ ] Mobile Responsive Design

### Bekannte Probleme
- Balancing zwischen verschiedenen Hundetypen
- KI-Verhalten könnte noch intelligenter sein
- Performance-Optimierung für viele gleichzeitige Rennen

## Mitwirken

Contributions sind willkommen! Bitte:
1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'Add AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## Lizenz

Dieses Projekt ist ein persönliches Projekt. Alle Assets und Grafiken sind Eigentum ihrer jeweiligen Besitzer.

## Support

Bei Fragen oder Problemen öffne bitte ein Issue im Repository.

---

**Viel Spaß beim Spielen! 🐕💨**
