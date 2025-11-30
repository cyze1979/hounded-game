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
      dogs.push(new Dog(null, breed)); // null = unique name wird automatisch vergeben
    }
    return dogs;
  };
  
  const startGame = (playerNames) => {
    // Reset used names beim Start
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
    // Reset used names beim Neustart
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
