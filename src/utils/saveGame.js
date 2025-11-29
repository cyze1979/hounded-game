import { Dog } from '../models/Dog';
import { Player } from '../models/Player';

const SAVE_KEY = 'hounded_game_save';

export const saveGame = (gameState) => {
    try {
        const saveData = {
            players: gameState.players.map(p => p.toJSON()),
            currentPlayerIndex: gameState.currentPlayerIndex,
            gameDay: gameState.gameDay,
            stableLimit: gameState.stableLimit,
            raceHistory: gameState.raceHistory,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        return { success: true, message: 'Spiel gespeichert!' };
    } catch (error) {
        console.error('Save error:', error);
        return { success: false, message: 'Fehler beim Speichern!' };
    }
};

export const loadGame = () => {
    try {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (!savedData) {
            return null;
        }
        
        const data = JSON.parse(savedData);
        
        // Reconstruct players with their dogs
        const players = data.players.map(pData => {
            const player = Player.fromJSON(pData);
            player.dogs = pData.dogs.map(dData => Dog.fromJSON(dData, player));
            return player;
        });
        
        return {
            players,
            currentPlayerIndex: data.currentPlayerIndex,
            gameDay: data.gameDay,
            stableLimit: data.stableLimit,
            raceHistory: data.raceHistory || [],
            savedAt: data.savedAt
        };
    } catch (error) {
        console.error('Load error:', error);
        return null;
    }
};

export const deleteSave = () => {
    localStorage.removeItem(SAVE_KEY);
    return { success: true, message: 'Spielstand gelöscht!' };
};

export const hasSave = () => {
    return localStorage.getItem(SAVE_KEY) !== null;
};
