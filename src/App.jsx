import { useState, useEffect } from 'react';
import './App.css';
import './components/GameStyles.css';
import { Player } from './models/Player';
import { Dog } from './models/Dog';
import { dogBreeds, resetUsedNames } from './data/dogData';
import { createGameSession, loadGameSession, saveGameSession, hasSave, loadTrackRecords } from './utils/supabaseGame';

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
    sessionId: null,
    players: [],
    currentPlayerIndex: 0,
    marketDogs: [],
    currentRace: null,
    raceHistory: [],
    currentMonth: 1,
    currentYear: 2048,
    isSetup: true,
    stableLimit: 4,
    raceCompleted: false
  });

  const [currentView, setCurrentView] = useState('stable');
  const [showMenu, setShowMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingSave, setHasExistingSave] = useState(false);

  // Check for existing save on mount
  useEffect(() => {
    hasSave().then(result => setHasExistingSave(result));
  }, []);

  // Auto-save on state change
  useEffect(() => {
    if (!gameState.isSetup && gameState.players.length > 0 && gameState.sessionId && !isSaving) {
      setIsSaving(true);
      saveGameSession(gameState.sessionId, gameState)
        .catch(err => console.error('Save error:', err))
        .finally(() => setIsSaving(false));
    }
  }, [gameState, isSaving]);
  
  // Try to load save on mount
  useEffect(() => {
    const lastSessionKey = localStorage.getItem('hounded_last_session');
    if (lastSessionKey) {
      loadGameSession(lastSessionKey)
        .then(async session => {
          if (session) {
            const trackRecords = await loadTrackRecords(session.sessionId);

            setGameState(prev => ({
              ...prev,
              sessionId: session.sessionId,
              players: session.players,
              raceHistory: session.raceHistory,
              marketDogs: session.marketDogs.length > 0 ? session.marketDogs : generateMarketDogs(),
              currentMonth: session.currentMonth || 1,
              currentYear: session.currentYear || 2048,
              tracks: trackRecords,
              currentRace: null,
              isSetup: false
            }));
          }
        })
        .catch(err => console.error('Load error:', err));
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

  const aiMarketActions = (newGameState) => {
    // AI players make market decisions
    newGameState.players.forEach(player => {
      // Skip if this is the main/human player (index 0)
      if (player.name === newGameState.players[0].name) return;

      // AI Strategy: Sell old/weak dogs, buy young/strong dogs

      // 1. SELL: Remove elder dogs or dogs with low ratings
      const dogsToSell = player.dogs.filter(dog => {
        const category = dog.getAgeCategory();
        const rating = dog.getOverallRating();
        return category === 'elder' || (category === 'veteran' && rating < 60);
      });

      dogsToSell.forEach(dog => {
        const sellPrice = Math.floor(dog.getValue() * 0.7); // Sell for 70% of value
        player.money += sellPrice;
        player.dogs = player.dogs.filter(d => d.id !== dog.id);
      });

      // 2. BUY: Purchase young/prime dogs with good ratings if space and money available
      while (player.dogs.length < newGameState.stableLimit && newGameState.marketDogs.length > 0) {
        // Find best affordable dog
        const affordableDogs = newGameState.marketDogs
          .filter(dog => {
            const price = dog.getValue();
            const category = dog.getAgeCategory();
            const rating = dog.getOverallRating();
            // AI only buys young/prime dogs with decent ratings
            return player.money >= price &&
                   (category === 'young' || category === 'prime') &&
                   rating >= 55;
          })
          .sort((a, b) => b.getOverallRating() - a.getOverallRating()); // Best first

        if (affordableDogs.length === 0) break;

        const dogToBuy = affordableDogs[0];
        const price = dogToBuy.getValue();

        // AI is conservative with money (keeps at least 500€)
        if (player.money - price < 500) break;

        dogToBuy.purchasePrice = price;
        player.money -= price;
        player.dogs.push(dogToBuy);
        newGameState.marketDogs = newGameState.marketDogs.filter(d => d.id !== dogToBuy.id);
      }
    });
  };
  
  const startGame = async (playerNames) => {
    resetUsedNames();

    try {
      const sessionKey = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session = await createGameSession(sessionKey);

      const players = playerNames.map((name, index) =>
        new Player(name, playerColors[index], index)
      );

      setGameState({
        ...gameState,
        sessionId: session.id,
        players,
        currentPlayerIndex: 0,
        marketDogs: generateMarketDogs(),
        isSetup: false,
        raceCompleted: false
      });

      localStorage.setItem('hounded_last_session', sessionKey);
    } catch (err) {
      console.error('Failed to create game session:', err);
      alert('Fehler beim Erstellen der Spielsitzung.');
    }
  };
  
  const handleNewGame = () => {
    resetUsedNames();

    setGameState({
      players: [],
      currentPlayerIndex: 0,
      marketDogs: [],
      currentRace: null,
      raceHistory: [],
      currentMonth: 1,
      currentYear: 2048,
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

    // State 2: Race completed → Next month
    const newGameState = { ...gameState };

    // Increase month/year
    newGameState.currentMonth += 1;
    if (newGameState.currentMonth > 12) {
      newGameState.currentMonth = 1;
      newGameState.currentYear += 1;
    }

    // Age ALL dogs by 1 month
    newGameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        dog.ageInMonths += 1;
      });
    });

    // Fitness regeneration: +20 for all dogs (max 100)
    newGameState.players.forEach(player => {
      player.dogs.forEach(dog => {
        dog.fitness = Math.min(100, dog.fitness + 20);
      });
    });

    // Refresh market
    newGameState.marketDogs = generateMarketDogs();

    // AI market actions (after market refresh, before player sees it)
    aiMarketActions(newGameState);

    // Reset race status
    newGameState.currentRace = null;
    newGameState.raceCompleted = false;

    setGameState(newGameState);

    // Get month name
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const monthName = monthNames[newGameState.currentMonth - 1];

    alert(`⏭️ ${monthName} ${newGameState.currentYear}\n\n🐕 Alle Hunde sind 1 Monat älter\n💚 Alle Hunde: +20 Fitness (Regeneration)\n🤖 AI-Spieler haben gehandelt\n🛒 Neuer Hundemarkt verfügbar!`);
  };
  
  const getCurrentPlayer = () => {
    return gameState.players[gameState.currentPlayerIndex];
  };
  
  const handleLoadGame = async () => {
    const lastSessionKey = localStorage.getItem('hounded_last_session');
    if (lastSessionKey) {
      try {
        const session = await loadGameSession(lastSessionKey);
        if (session) {
          const trackRecords = await loadTrackRecords(session.sessionId);

          setGameState(prev => ({
            ...prev,
            sessionId: session.sessionId,
            players: session.players,
            raceHistory: session.raceHistory,
            marketDogs: session.marketDogs.length > 0 ? session.marketDogs : generateMarketDogs(),
            currentMonth: session.currentMonth || 1,
            currentYear: session.currentYear || 2048,
            tracks: trackRecords,
            currentRace: null,
            isSetup: false
          }));
        }
      } catch (err) {
        console.error('Load error:', err);
        alert('Fehler beim Laden des Spiels.');
      }
    }
  };

  if (gameState.isSetup) {
    return <Setup onStartGame={startGame} hasSave={hasExistingSave} onLoadGame={handleLoadGame} />;
  }
  
  return (
    <div className="game-container">
      <Header
        currentPlayer={getCurrentPlayer()}
        currentMonth={gameState.currentMonth || 1}
        currentYear={gameState.currentYear || 2048}
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
            onRaceComplete={handleNextDay}
            setCurrentView={setCurrentView}
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
