import { useState } from 'react';
import { deleteSave } from '../utils/saveGame';

export default function GameMenu({ onNewGame, onClose }) {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleNewGame = () => {
    setShowConfirm(true);
  };
  
  const confirmNewGame = () => {
    deleteSave();
    onNewGame();
    onClose();
  };
  
  const handleSave = () => {
    // Game auto-saves already, so just show confirmation
    alert('✅ Spiel gespeichert!');
    onClose();
  };
  
  return (
    <div className="game-menu-overlay" onClick={onClose}>
      <div className="game-menu-panel" onClick={(e) => e.stopPropagation()}>
        <h2>MENÜ</h2>
        
        <div className="menu-items">
          <button className="menu-item" onClick={handleSave}>
            <span className="menu-icon">💾</span>
            <span className="menu-label">Spiel Speichern</span>
          </button>
          
          <button className="menu-item" onClick={handleNewGame}>
            <span className="menu-icon">🔄</span>
            <span className="menu-label">Neues Spiel</span>
          </button>
          
          <button className="menu-item menu-item-close" onClick={onClose}>
            <span className="menu-icon">❌</span>
            <span className="menu-label">Schließen</span>
          </button>
        </div>
        
        {showConfirm && (
          <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
            <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
              <h3>⚠️ Neues Spiel starten?</h3>
              <p>Dein aktueller Spielstand wird gelöscht!</p>
              <p>Diese Aktion kann nicht rückgängig gemacht werden.</p>
              <div className="confirm-buttons">
                <button className="btn-cta" onClick={confirmNewGame}>
                  Ja, neu starten
                </button>
                <button className="btn-tab" onClick={() => setShowConfirm(false)}>
                  <span>Abbrechen</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
