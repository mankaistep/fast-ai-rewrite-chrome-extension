import React, { useState } from 'react';
import Popup from './Popup';

interface AppProps {
    selectedText?: string;
    position?: { x: number; y: number };
}

const App: React.FC<AppProps> = ({ selectedText, position }) => {
    const [isPopupOpen, setIsPopupOpen] = useState(!!selectedText);

    const handleClose = () => {
        setIsPopupOpen(false);
    };

    if (!isPopupOpen) {
        return null;
    }

    return (
        <div
            className="App"
            style={{
                position: 'absolute',
                left: position ? `${position.x}px` : '50%',
                top: position ? `${position.y}px` : '50%',
                transform: position ? 'none' : 'translate(-50%, -50%)',
                zIndex: 9999,
            }}
        >
            <Popup
                initialText={selectedText || ''}
                onClose={handleClose}
            />
        </div>
    );
};

export default App;