import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import FloatingButton from './components/ui/FloatingButton';
import RewritePopup from './components/ui/RewritePopup';
import { getSelectionPosition, debounce } from './utils/domUtils';
import './styles/globals.css';

const POPUP_WIDTH = 256;
const BUTTON_HEIGHT = 24;
const BUTTON_POPUP_GAP = 10;

const ContentScript: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number; isBottom: boolean } | null>(null);
    const [popupPosition, setPopupPosition] = useState<{ top: number; left: number; isBottom: boolean } | null>(null);
    const [selectedText, setSelectedText] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const lastSelectionRef = useRef('');
    const currentSelectionRef = useRef<{
        element: HTMLElement | null;
        start: number;
        end: number;
    } | null>(null);

    // Write console.log
    const addLog = useCallback((message: string) => {
        setLogs(prevLogs => [...prevLogs, `${new Date().toISOString()}: ${message}`]);
        console.log(message);
    }, []);

    // Check when selection change
    const handleSelectionChange = useCallback(() => {
        const selection = window.getSelection();
        const activeElement = document.activeElement;
        let selectionText = '';
        let position = null;
        let currentSelectionInfo = null;
        let isEditable = false;

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
                currentSelectionInfo = { element: activeElement, start, end };
                isEditable = true;
            }
        } else if (selection && !selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const commonAncestor = range.commonAncestorContainer;
            const editableElement = commonAncestor.nodeType === Node.ELEMENT_NODE
                ? (commonAncestor as Element).closest('[contenteditable="true"]')
                : (commonAncestor.parentElement as Element)?.closest('[contenteditable="true"]');

            if (editableElement) {
                selectionText = selection.toString();
                position = getSelectionPosition();
                currentSelectionInfo = {
                    element: editableElement as HTMLElement,
                    start: range.startOffset,
                    end: range.endOffset
                };
                isEditable = true;
            }
        }

        if (selectionText && position && isEditable && selectionText !== lastSelectionRef.current) {
            lastSelectionRef.current = selectionText;
            const isBottom = position.bottom > window.innerHeight / 2;
            const newButtonPosition = {
                top: isBottom ? position.top - BUTTON_HEIGHT - BUTTON_POPUP_GAP : position.bottom + BUTTON_POPUP_GAP,
                left: position.left,
                isBottom
            };
            setButtonPosition(newButtonPosition);
            setSelectedText(selectionText);
            currentSelectionRef.current = currentSelectionInfo;

        } else if (!selectionText || !isEditable) {
            setButtonPosition(null);
        }
    }, [popupPosition, addLog, BUTTON_HEIGHT, BUTTON_POPUP_GAP]);
    useEffect(() => {
        const handleSelectionChangeDebounced = debounce(handleSelectionChange, 100);

        document.addEventListener('selectionchange', handleSelectionChangeDebounced);
        document.addEventListener('mouseup', handleSelectionChangeDebounced);
        document.addEventListener('keyup', handleSelectionChangeDebounced);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChangeDebounced);
            document.removeEventListener('mouseup', handleSelectionChangeDebounced);
            document.removeEventListener('keyup', handleSelectionChangeDebounced);
        };
    }, [handleSelectionChange]);

    // FloatingButton click
    const handleButtonClick = useCallback(() => {
        addLog('FloatingButton clicked');
        if (!isLoggedIn) {
            window.open('http://localhost:3000/auth?callbackUrl=/auth/success', '_blank');
            return
        }

        if (buttonPosition) {
            let top: number;
            let left: number = Math.min(
                buttonPosition.left,
                window.innerWidth - POPUP_WIDTH
            );

            if (buttonPosition.isBottom) {
                top = buttonPosition.top + BUTTON_HEIGHT;
            } else {
                top = buttonPosition.top;
            }

            setPopupPosition({ top, left, isBottom: buttonPosition.isBottom });
            setButtonPosition(null);
            addLog('Popup opened');
        }
    }, [buttonPosition, addLog]);

    // Popup close
    const handlePopupClose = useCallback(() => {
        setPopupPosition(null);
        currentSelectionRef.current = null;
    }, [addLog]);

    // Close popup when user starts typing
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (popupPosition) {
                // Close the popup if it's open and the user starts typing
                const ignoredKeys = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'NumLock', 'ScrollLock', 'Enter', 'Tab'];
                if (!ignoredKeys.includes(e.key) && (e.target as HTMLElement).id !== "fast-ai-rewrite-root") {
                    handlePopupClose();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [popupPosition, handlePopupClose, addLog]);

    // When approve rewrite
    const handleApproveRewrite = useCallback((rewrittenText: string) => {
        const currentSelection = currentSelectionRef.current

        if (!currentSelection) {
            handlePopupClose();
            return;
        }

        const { element, start, end } = currentSelection;

        if (!element) {
            handlePopupClose();
            return;
        }

        try {
            if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
                const currentValue = element.value;
                const newValue = currentValue.substring(0, start) + rewrittenText + currentValue.substring(end);
                element.value = newValue;
                element.setSelectionRange(start, start + rewrittenText.length);
                element.focus();
                element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            } else if (element.isContentEditable) {
                const currentHTML = element.innerHTML;
                const beforeSelection = currentHTML.substring(0, start);
                const afterSelection = currentHTML.substring(end);
                const newHTML = beforeSelection + rewrittenText + afterSelection;
                element.innerHTML = newHTML;

                // Set the cursor position or select the replaced text
                const range = document.createRange();
                const selection = window.getSelection();

                // Find the text node containing the rewritten text
                const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
                let currentNode;
                let currentOffset = 0;

                while ((currentNode = walker.nextNode())) {
                    const nodeLength = currentNode.textContent?.length || 0;
                    if (currentOffset + nodeLength >= start) {
                        const startOffset = start - currentOffset;
                        const endOffset = Math.min(startOffset + rewrittenText.length, nodeLength);
                        range.setStart(currentNode, startOffset);
                        range.setEnd(currentNode, endOffset);
                        break;
                    }
                    currentOffset += nodeLength;
                }

                if (range.startContainer && range.endContainer) {
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                } else {
                }

                element.focus();
                element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            } else {
                addLog(`Failed to replace text: Unsupported element type ${element.tagName}`);
            }
        } catch (error) {
            addLog(`Error during text replacement: ${error}`);
        }

        handlePopupClose();
    }, [handlePopupClose, addLog]);

    // Check auth
    useEffect(() => {
        // Inject auth token
        const injectToken = () => {
            chrome.runtime.sendMessage({action: "getToken"}, (response) => {
                if (response.token) {
                    // @ts-ignore
                    window.fastAiRewriteToken = response.token;
                    setIsLoggedIn(true)
                } else {
                    // @ts-ignore
                    window.fastAiRewriteToken = null
                    setIsLoggedIn(false)
                }
            });
        }
        setTimeout(injectToken, 100)

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                injectToken()
            }
        }

        // Set up listener for future token injections
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Clean up listeners
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
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
                    addLog={addLog}
                    onApprove={handleApproveRewrite}
                />
            )}
        </>
    );
};

// Create a container for the Shadow DOM
const root = document.createElement('div');
root.id = 'fast-ai-rewrite-root';
document.body.appendChild(root);

// Create a shadow root
const shadowRoot = root.attachShadow({ mode: 'open' });

// Create a container for your React app inside the shadow root
const container = document.createElement('div');
shadowRoot.appendChild(container);

// Inject your styles into the shadow root
const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = chrome.runtime.getURL('content_script.css');
shadowRoot.appendChild(style);

// Render your React app
ReactDOM.render(<ContentScript />, container);