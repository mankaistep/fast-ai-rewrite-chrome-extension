import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import FloatingButton from './components/ui/FloatingButton';
import RewritePopup from './components/ui/RewritePopup';
import DebugPanel from './components/ui/DebugPanel';
import { getSelectionPosition, isEditableElement, getSelectedText } from './utils/domUtils';
import './styles/globals.css';

const ContentScript: React.FC = () => {
    const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number; isBottom: boolean } | null>(null);
    const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
    const [selectedText, setSelectedText] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = useCallback((message: string) => {
        setLogs(prevLogs => [...prevLogs, `${new Date().toISOString()}: ${message}`]);
        console.log(message); // Also log to console for easier debugging
    }, []);

    const popupWidth = 256;
    const popupHeight = 240;
    const buttonHeight = 24;
    const buttonWidth = 60;
    const gap = 10;
    const popupOffset = 20;

    const handleSelectionChange = useCallback(() => {
        const selection = window.getSelection();
        const activeElement = document.activeElement;
        let selectionText = '';
        let position = null;

        if (activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement) {
            const start = activeElement.selectionStart;
            const end = activeElement.selectionEnd;
            if (start !== null && end !== null && start !== end) {
                selectionText = activeElement.value.substring(start, end);
                const rect = activeElement.getBoundingClientRect();
                const textareaStyles = window.getComputedStyle(activeElement);
                const lineHeight = parseInt(textareaStyles.lineHeight) || 20;
                const paddingTop = parseInt(textareaStyles.paddingTop);
                const scrollTop = activeElement.scrollTop;

                const lines = activeElement.value.substr(0, start).split('\n');
                const startLine = lines.length;
                const startTop = rect.top + paddingTop + (startLine - 1) * lineHeight - scrollTop;

                position = {
                    top: startTop,
                    bottom: startTop + lineHeight,
                    left: rect.left,
                    right: rect.right
                };
            }
        } else if (selection && !selection.isCollapsed) {
            selectionText = selection.toString();
            position = getSelectionPosition();
        }

        if (selectionText && position) {
            const isBottom = position.bottom > window.innerHeight / 2;
            const newButtonPosition = {
                top: isBottom ? position.top - buttonHeight - gap : position.top + gap,
                left: position.left,
                isBottom
            };
            setButtonPosition(newButtonPosition);
            setSelectedText(selectionText);
        } else {
            setButtonPosition(null);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('selectionchange', handleSelectionChange);
        document.addEventListener('mouseup', handleSelectionChange);
        document.addEventListener('keyup', handleSelectionChange);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.removeEventListener('mouseup', handleSelectionChange);
            document.removeEventListener('keyup', handleSelectionChange);
        };
    }, [handleSelectionChange]);

    const handleButtonClick = useCallback(() => {
        addLog('handleButtonClick called in ContentScript');
        if (buttonPosition) {
            let top: number;
            let left: number = Math.min(
                buttonPosition.left,
                window.innerWidth - popupWidth
            );

            if (buttonPosition.isBottom) {
                top = buttonPosition.top - popupHeight + buttonHeight - popupOffset;
            } else {
                top = buttonPosition.top + popupOffset;
            }

            setPopupPosition({ top, left });
            setButtonPosition(null);
        }
    }, [buttonPosition, addLog]);

    const handlePopupClose = useCallback(() => {
        setPopupPosition(null);
    }, []);

    return (
        <>
            {buttonPosition && !popupPosition && (
                <FloatingButton
                    position={{ top: buttonPosition.top, left: buttonPosition.left }}
                    onClick={handleButtonClick}
                    addLog={addLog}
                />
            )}
            {popupPosition && (
                <RewritePopup
                    initialText={selectedText}
                    onClose={handlePopupClose}
                    initialPosition={popupPosition}
                />
            )}
            <DebugPanel logs={logs} />
        </>
    );
};

const root = document.createElement('div');
root.id = 'fast-ai-rewrite-root';
document.body.appendChild(root);

ReactDOM.render(<ContentScript />, root);