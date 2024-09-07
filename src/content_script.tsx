import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import FloatingButton from './components/ui/FloatingButton';
import RewritePopup from './components/ui/RewritePopup';
import { getSelectionPosition, isEditableElement, getSelectedText } from './utils/domUtils';
import './styles/globals.css';

const ContentScript: React.FC = () => {
    const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number; isBottom: boolean } | null>(null);
    const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
    const [selectedText, setSelectedText] = useState('');

    const popupWidth = 256; // 16 * 16 = 256px (w-64)
    const popupHeight = 320; // 16 * 20 = 320px (h-80)
    const buttonHeight = 24; // 6 * 4 = 24px (h-6)
    const buttonWidth = 60; // Estimated width for the smaller button
    const gap = 10; // 10px gap between selection and button/popup
    const popupOffset = 20; // 20px offset for popup positioning

    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed) {
                const anchorNode = selection.anchorNode;
                if (anchorNode && isEditableElement(anchorNode.parentElement)) {
                    const position = getSelectionPosition();
                    if (position) {
                        const isBottom = position.bottom > window.innerHeight / 2;
                        setButtonPosition({
                            top: isBottom ? position.top - buttonHeight - gap : position.bottom + gap,
                            left: Math.min((position.left + position.right) / 2 - buttonWidth / 2, window.innerWidth - buttonWidth),
                            isBottom
                        });
                        setSelectedText(getSelectedText());
                    }
                } else {
                    setButtonPosition(null);
                }
            } else {
                setButtonPosition(null);
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, []);

    const handleButtonClick = () => {
        if (buttonPosition) {
            let top: number;
            let left: number = Math.min(
                buttonPosition.left,
                window.innerWidth - popupWidth
            );

            if (buttonPosition.isBottom) {
                // If button is in the bottom half, position popup 20px higher
                top = buttonPosition.top - popupHeight + buttonHeight - popupOffset;
            } else {
                // If button is in the top half, position popup 20px lower
                top = buttonPosition.top + popupOffset;
            }

            setPopupPosition({ top, left });
            setButtonPosition(null); // Hide the button when showing the popup
        }
    };

    const handlePopupClose = () => {
        setPopupPosition(null);
    };

    return (
        <>
            {buttonPosition && !popupPosition && (
                <FloatingButton
                    position={{ top: buttonPosition.top, left: buttonPosition.left }}
                    onClick={handleButtonClick}
                />
            )}
            {popupPosition && (
                <RewritePopup
                    initialText={selectedText}
                    onClose={handlePopupClose}
                    initialPosition={popupPosition}
                />
            )}
        </>
    );
};

const root = document.createElement('div');
root.id = 'fast-ai-rewrite-root';
document.body.appendChild(root);

ReactDOM.render(<ContentScript />, root);