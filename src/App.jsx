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
import Training from './components/Training';
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
    currentMonth: 1, // NEW: Track current month
    isSetup: true,
    stableLimit: 4,
    raceCompleted: false // Track if current week's race is done
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
        isSetup: false,
        currentMonth: savedGame.currentMonth || 1 // Migration: add currentMonth if missing
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
  
  // Listen for view change events from DogDetail
  useEffect(() => {
    const handleViewChange = (e) => {
      setCurrentView(e.detail);
    };
    window.addEventListener('changeView', handleViewChange);
    return () => window.removeEventListener('changeView', handleViewChange);
  }, []);
  
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
      isSetup: false,
      raceCompleted: false
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
      stableLimit: 4,
      raceCompleted: false
    });
    setCurrentView('stable');
  };
  
  // WEITER Button Logic - 2 States
  const handleNextDay = () => {
    // State 1: Race not completed → Go to race
    if (!gameState.raceCompleted) {
      setCurrentView('race');
      return;
    }
    
    // State 2: Race completed → Next week
    const newGameState = { ...gameState };
    
    // Increase week
    newGameState.gameDay += 1;
    
    // Dogs that raced lose fitness (-20)
    // Dogs that didn't race lose less (-5)
    if (gameState.currentRace && gameState.currentRace.results) {
      const racedDogIds = new Set(
        gameState.currentRace.results.map(result => result.dog.id)
      );
      
      newGameState.players.forEach(player => {
        player.dogs.forEach(dog => {
          if (racedDogIds.has(dog.id)) {
            dog.fitness = Math.max(0, dog.fitness - 20); // Raced: -20
          } else {
            dog.fitness = Math.max(0, dog.fitness - 5);  // Didn't race: -5
          }
        });
      });
    } else {
      // Fallback if no race data: all dogs -5
      newGameState.players.forEach(player => {
        player.dogs.forEach(dog => {
          dog.fitness = Math.max(0, dog.fitness - 5);
        });
      });
    }
    
    // Refresh market
    newGameState.marketDogs = generateMarketDogs();
    
    // Reset race status
    newGameState.currentRace = null;
    newGameState.raceCompleted = false;
    
    setGameState(newGameState);
    
    // Show notification
    alert(`⏭️ Woche ${newGameState.gameDay}\n\n🏥 Gerannte Hunde: -20 Fitness\n🏥 Andere Hunde: -5 Fitness\n🛒 Neuer Hundemarkt verfügbar!`);
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
        raceCompleted={gameState.raceCompleted}
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
        {currentView === 'training' && (
          <Training 
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
