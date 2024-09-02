import React from 'react';
import './Popup.css';

const Popup = ({ visible, onExit, onReturnToLobby }) => {
    if (!visible) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Game Finished</h2>
                <button onClick={onExit}>Exit</button>
                <button onClick={onReturnToLobby}>Return to Lobby</button>
            </div>
        </div>
    );
};

export default Popup;
