// Track definitions for racing
export const TRACKS = {
  "STADTPARK SPRINT": {
    id: "stadtpark",
    name: "STADTPARK SPRINT",
    distance: 800,
    terrain: "grass",
    difficulty: "easy",
    description: "Kurze Sprint-Strecke durch den Stadtpark",
    prizes: {
      1: 1000,
      2: 750,
      3: 500
    },
    bestTime: null,
    bestTimeHolder: null,
    unlocked: true
  },
  
  "HARBOR HUSTLE": {
    id: "harbor",
    name: "HARBOR HUSTLE",
    distance: 1200,
    terrain: "asphalt",
    difficulty: "medium",
    description: "Mittlere Distanz entlang der Hafenpromenade",
    prizes: {
      1: 2000,
      2: 1500,
      3: 1000
    },
    bestTime: null,
    bestTimeHolder: null,
    unlocked: true
  },
  
  "FOREST FEVER": {
    id: "forest",
    name: "FOREST FEVER",
    distance: 1000,
    terrain: "forest",
    difficulty: "medium",
    description: "Technische Strecke durch dichten Wald",
    prizes: {
      1: 1800,
      2: 1200,
      3: 800
    },
    bestTime: null,
    bestTimeHolder: null,
    unlocked: true,
    special: "focus_important" // Focus attribute wichtiger
  },
  
  "DESERT DASH": {
    id: "desert",
    name: "DESERT DASH",
    distance: 1500,
    terrain: "sand",
    difficulty: "hard",
    description: "Lange Strecke durch sandiges Gelände",
    prizes: {
      1: 3500,
      2: 2500,
      3: 1500
    },
    bestTime: null,
    bestTimeHolder: null,
    unlocked: true,
    special: "stamina_important" // Stamina critical
  },
  
  "MOUNTAIN MADNESS": {
    id: "mountain",
    name: "MOUNTAIN MADNESS",
    distance: 2000,
    terrain: "mountain",
    difficulty: "hard",
    description: "Brutale Berg-Strecke mit Steigungen",
    prizes: {
      1: 5000,
      2: 3500,
      3: 2000
    },
    bestTime: null,
    bestTimeHolder: null,
    unlocked: true,
    special: "acceleration_important" // Acceleration für Hügel
  },
  
  "NEON NIGHTS": {
    id: "neon",
    name: "NEON NIGHTS",
    distance: 1100,
    terrain: "city",
    difficulty: "medium",
    description: "Nächtliche Stadt-Strecke unter Neonlichtern",
    prizes: {
      1: 2500,
      2: 1800,
      3: 1200
    },
    bestTime: null,
    bestTimeHolder: null,
    unlocked: true,
    special: "focus_important" // Dunkelheit = Focus wichtig
  }
};

// Get all tracks as array
export const getAllTracks = () => {
  return Object.values(TRACKS);
};

// Get track for specific month (fixed calendar)
export const getTrackForMonth = (month) => {
  const trackOrder = [
    "STADTPARK SPRINT",    // Month 1, 7, 13...
    "HARBOR HUSTLE",       // Month 2, 8, 14...
    "FOREST FEVER",        // Month 3, 9, 15...
    "DESERT DASH",         // Month 4, 10, 16...
    "MOUNTAIN MADNESS",    // Month 5, 11, 17...
    "NEON NIGHTS"          // Month 6, 12, 18...
  ];
  
  const index = (month - 1) % 6; // Cycle through 6 tracks
  return TRACKS[trackOrder[index]];
};

// Get track by id
export const getTrackById = (id) => {
  return Object.values(TRACKS).find(track => track.id === id);
};

// Get track by name
export const getTrackByName = (name) => {
  return TRACKS[name];
};

// Get unlocked tracks
export const getUnlockedTracks = () => {
  return Object.values(TRACKS).filter(track => track.unlocked);
};

// Prize money structure for each track
export const RACE_PRIZES = Object.fromEntries(
  Object.entries(TRACKS).map(([name, track]) => [name, track.prizes])
);
