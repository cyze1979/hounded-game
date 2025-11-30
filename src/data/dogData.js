// Hommage an das originale Hounded Game aus den 80ern!
export const dogNames = [
    // Original Hounded Namen (hier kannst du die Namen aus dem 80er Spiel eintragen!)
'Sidewinder', 'Refracter', 'Manic Drive', 'Jasmine´s Fancy', 'Atomic Habit', 'Missy', 'Prime Mover', 'Realtime', 'Gazzas Champ', 'Lunatic', 'Kings Pride', 'Ram Runner', 'Electroblast', 'Power On', 'Holding On', 'Master Blaster', 'Short Circuit', 'Overload', 'Loco', 'Timewarp', 'Jaws', 'Ozzi Battler', 'Hotdog', 'Flying Pixels', 'Coffee Time', 'Spriteflight', 'Star Tracker', 'Byte Bandit', 'Harehunter', 'Trackeater', 'Solomun Gundy', 'Ghostdog', ' Twilight', 'Guybrush', 'Doc Snyder', 'Megalodon', 'Shadow', 'Zeus X', 'Mister Mister'   
    // Füge hier mehr Namen hinzu aus dem Original-Spiel!
    // z.B.: 'Sparky', 'Flash', 'Thunder', 'Lightning', etc.
];

export const dogBreeds = [
    'Greyhound', 'Whippet', 'Saluki', 'Afghan Hound', 'Borzoi',
    'Irish Wolfhound', 'Deerhound', 'Vizsla', 'Weimaraner', 'Dalmatian'
];

export const playerColors = ['#9f7aea', '#48bb78', '#f56565', '#ed8936'];

// Tracker für verwendete Namen - verhindert Duplikate
let usedNames = new Set();

export const getUniqueDogName = () => {
    // Verfügbare Namen (noch nicht verwendet)
    const availableNames = dogNames.filter(name => !usedNames.has(name));
    
    // Wenn alle Namen verwendet wurden, setze zurück
    if (availableNames.length === 0) {
        usedNames.clear();
        return dogNames[Math.floor(Math.random() * dogNames.length)];
    }
    
    // Wähle zufälligen Namen aus verfügbaren
    const name = availableNames[Math.floor(Math.random() * availableNames.length)];
    usedNames.add(name);
    return name;
};

export const resetUsedNames = () => {
    usedNames.clear();
};

// X Syndicate - Hommage an das Original!
export const AI_OWNER_NAME = 'X Syndicate';
