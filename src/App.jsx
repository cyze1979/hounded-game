import { useState, useEffect } from 'react';
import './App.css';
import './components/GameStyles.css';
import { Player } from './models/Player';
import { Dog } from './models/Dog';
import { dogBreeds, resetUsedNames } from './data/dogData';
import { saveGame, loadGame, hasSave } from './utils/saveGame';

// Import components
import Setup from './components/Setup';
import Header from './components/Header';
import GameMenu from './components/GameMenu';
import Stable from './components/Stable';
import Market from './components/Market';
import Race from './components/Race';
import Leaderboard from './components/Leaderboard';

const playerColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

function App() {
  const [gameState, setGameState] = useState({
    players: [],
    currentPlayerIndex: 0,
    marketDogs: [],
    currentRace: null,
    raceHistory: [],
    gameDay: 1,
    isSetup: true,
    stableLimit: 4
  });
  
  const [currentView, setCurrentView] = useState('stable');
  const [showMenu, setShowMenu] = useState(false);
  
  // Auto-save on state change
  useEffect(() => {
    if (!gameState.isSetup && gameState.players.length > 0) {
      saveGame(gameState);
    }
  }, [gameState]);
  
  // Try to load save on mount
  useEffect(() => {
    const savedGame = loadGame();
    if (savedGame) {
      setGameState({
        ...savedGame,
        marketDogs: generateMarketDogs(),
        currentRace: null,
        isSetup: false
      });
    }
  }, []);
  
  // Close menu on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showMenu) {
        setShowMenu(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showMenu]);
  
  const generateMarketDogs = () => {
    const dogs = [];
    for (let i = 0; i < 8; i++) {
      const breed = dogBreeds[Math.floor(Math.random() * dogBreeds.length)];
      dogs.push(new Dog(null, breed));
    }
    return dogs;
  };
  
  const startGame = (playerNames) => {
    resetUsedNames();
    
    const players = playerNames.map((name, index) => 
      new Player(name, playerColors[index], index)
    );
    
    setGameState({
      ...gameState,
      players,
      currentPlayerIndex: 0,
      marketDogs: generateMarketDogs(),
      isSetup: false
    });
  };
  
  const handleNewGame = () => {
    resetUsedNames();
    
    setGameState({
      players: [],
      currentPlayerIndex: 0,
      marketDogs: [],
      currentRace: null,
      raceHistory: [],
      gameDay: 1,
      isSetup: true,
      stableLimit: 4
    });
    setCurrentView('stable');
  };
  
  // WEITER Button Logic
  const handleNextDay = () => {
    const newGameState = { ...gameState };
    
    // Increase day/week
    newGameState.gameDay += 1;
    
    // All dogs lose fitness
    newGameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        dog.fitness = Math.max(0, dog.fitness - 10);
      });
    });
    
    // Refresh market (new dogs)
    newGameState.marketDogs = generateMarketDogs();
    
    // Clear current race
    newGameState.currentRace = null;
    
    setGameState(newGameState);
    
    // Show notification
    alert(`⏭️ Woche ${newGameState.gameDay}\n\n🏥 Alle Hunde verlieren 10 Fitness\n🛒 Neuer Hundemarkt verfügbar!`);
  };
  
  const getCurrentPlayer = () => {
    return gameState.players[gameState.currentPlayerIndex];
  };
  
  if (gameState.isSetup) {
    return <Setup onStartGame={startGame} hasSave={hasSave()} onLoadGame={() => {
      const savedGame = loadGame();
      if (savedGame) {
        setGameState({
          ...savedGame,
          marketDogs: generateMarketDogs(),
          currentRace: null,
          isSetup: false
        });
      }
    }} />;
  }
  
  return (
    <div className="game-container">
      <Header 
        currentPlayer={getCurrentPlayer()} 
        gameDay={gameState.gameDay}
        players={gameState.players}
        onPlayerSwitch={(index) => setGameState({...gameState, currentPlayerIndex: index})}
        currentView={currentView}
        onViewChange={setCurrentView}
        marketNotifications={0}
        onMenuClick={() => setShowMenu(true)}
        onNextDay={handleNextDay}
      />
      
      <main className="main-content">
        {currentView === 'stable' && (
          <Stable 
            player={getCurrentPlayer()} 
            gameState={gameState}
            setGameState={setGameState}
          />
        )}
        {currentView === 'market' && (
          <Market 
            player={getCurrentPlayer()} 
            marketDogs={gameState.marketDogs}
            stableLimit={gameState.stableLimit}
            gameState={gameState}
            setGameState={setGameState}
          />
        )}
        {currentView === 'race' && (
          <Race 
            gameState={gameState}
            setGameState={setGameState}
            getCurrentPlayer={getCurrentPlayer}
          />
        )}
        {currentView === 'leaderboard' && (
          <Leaderboard players={gameState.players} />
        )}
      </main>
      
      {showMenu && (
        <GameMenu 
          onNewGame={handleNewGame}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

export default App;
