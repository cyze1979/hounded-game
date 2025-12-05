import { useState, useEffect } from 'react';
import './App.css';
import './components/GameStyles.css';
import { Player } from './models/Player';
import { Dog } from './models/Dog';
import { dogBreeds, resetUsedNames } from './data/dogData';
import { createGameSession, loadGameSession, saveGameSession, hasSave, loadTrackRecords } from './utils/supabaseGame';
import { aiTrainDogs, aiBuyDogs } from './utils/aiActions';

// Import components
import Setup from './components/Setup';
import Header from './components/Header';
import GameMenu from './components/GameMenu';
import Stable from './components/Stable';
import Market from './components/Market';
import Race from './components/Race';
import Training from './components/Training';
import Leaderboard from './components/Leaderboard';
import Stats from './components/Stats';

const playerColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

function App() {
  const [gameState, setGameState] = useState({
    sessionId: null,
    players: [],
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

  const startGame = async (playerName) => {
    resetUsedNames();

    try {
      const sessionKey = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session = await createGameSession(sessionKey);

      const aiNames = ['Cyber Kennels', 'NeoTech Racing', 'Digital Dogs Inc', 'AI Elite Stable'];
      const aiColors = ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

      const humanPlayer = new Player(playerName, playerColors[0], 0);
      humanPlayer.isAi = false;

      const aiPlayers = aiNames.map((name, idx) => {
        const player = new Player(name, aiColors[idx], idx + 1);
        player.isAi = true;
        return player;
      });

      const players = [humanPlayer, ...aiPlayers];

      setGameState({
        ...gameState,
        sessionId: session.id,
        players,
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

    // AI actions: training and market
    newGameState.players.forEach(player => {
      if (player.isAi) {
        aiTrainDogs(player, newGameState.currentMonth);
        aiBuyDogs(player, newGameState.marketDogs, newGameState.stableLimit);
      }
    });

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
    return gameState.players[0];
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
        {currentView === 'stats' && (
          <Stats gameState={gameState} />
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
