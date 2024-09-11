import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import FloatingButton from './components/ui/FloatingButton';
import RewritePopup from './components/ui/RewritePopup';
import DebugPanel from './components/ui/DebugPanel';
import { getSelectionPosition, isEditableElement, getSelectedText } from './utils/domUtils';
import './styles/globals.css';

const ContentScript: React.FC = () => {
    const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number; isBottom: boolean } | null>(null);
    const [popupPosition, setPopupPosition] = useState<{ top: number; left: number; isBottom: boolean } | null>(null);
    const [selectedText, setSelectedText] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const [key, setKey] = useState(0);
    const lastSelectionRef = useRef('');
    const currentSelectionRef = useRef<{
        element: HTMLElement | null;
        start: number;
        end: number;
    } | null>(null);

    const addLog = useCallback((message: string) => {
        setLogs(prevLogs => [...prevLogs, `${new Date().toISOString()}: ${message}`]);
        console.log(message);
    }, []);

    const popupWidth = 256;
    const popupHeight = 240;
    const buttonHeight = 24;
    const buttonWidth = 60;
    const gap = 10;

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
                top: isBottom ? position.top - buttonHeight - gap : position.bottom + gap,
                left: position.left,
                isBottom
            };
            setButtonPosition(newButtonPosition);
            setSelectedText(selectionText);
            currentSelectionRef.current = currentSelectionInfo;
            addLog(`New selection in editable element: "${selectionText.substring(0, 20)}..."`);

            if (popupPosition) {
                setKey(prevKey => prevKey + 1);
                addLog('Resetting popup due to new selection');
            }
        } else if (!selectionText || !isEditable) {
            setButtonPosition(null);
            addLog('Selection cleared or not in editable element');
        }
    }, [popupPosition, addLog, buttonHeight, gap]);

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

    const handleButtonClick = useCallback(() => {
        addLog('FloatingButton clicked');
        if (buttonPosition) {
            let top: number;
            let left: number = Math.min(
                buttonPosition.left,
                window.innerWidth - popupWidth
            );

            if (buttonPosition.isBottom) {
                top = buttonPosition.top + buttonHeight;
            } else {
                top = buttonPosition.top;
            }

            setPopupPosition({ top, left, isBottom: buttonPosition.isBottom });
            setButtonPosition(null);
            addLog('Popup opened');
        }
    }, [buttonPosition, addLog]);

    const handlePopupClose = useCallback(() => {
        setPopupPosition(null);
        currentSelectionRef.current = null;
        addLog('Popup closed');
    }, [addLog]);

    const handlePopupReset = useCallback(() => {
        addLog('Popup state reset');
    }, [addLog]);

    const handleApproveRewrite = useCallback((rewrittenText: string) => {
        addLog('handleApproveRewrite called with text: ' + rewrittenText.substring(0, 20) + '...');

        const currentSelection = currentSelectionRef.current

        if (!currentSelection) {
            addLog('Failed to replace text: currentSelection is null');
            handlePopupClose();
            return;
        }

        const { element, start, end } = currentSelection;

        if (!element) {
            addLog('Failed to replace text: element is null');
            handlePopupClose();
            return;
        }

        addLog(`Replacing text in element type: ${element.tagName}, isContentEditable: ${element.isContentEditable}`);

        try {
            if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
                const currentValue = element.value;
                const newValue = currentValue.substring(0, start) + rewrittenText + currentValue.substring(end);
                element.value = newValue;
                element.setSelectionRange(start, start + rewrittenText.length);
                element.focus();
                element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                addLog('Replaced text in input/textarea element');
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
                    addLog('Set selection range in contenteditable element');
                } else {
                    addLog('Failed to set selection range in contenteditable element');
                }

                element.focus();
                element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                addLog('Replaced text in contenteditable element');
            } else {
                addLog(`Failed to replace text: Unsupported element type ${element.tagName}`);
            }
        } catch (error) {
            addLog(`Error during text replacement: ${error}`);
        }

        handlePopupClose();
    }, [handlePopupClose, addLog]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (popupPosition) {
                // Close the popup if it's open and the user starts typing
                // We'll ignore some keys that don't represent typing
                const ignoredKeys = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'NumLock', 'ScrollLock', 'Enter', 'Tab'];
                if (!ignoredKeys.includes(e.key)) {
                    handlePopupClose();
                    addLog('Popup closed due to typing');
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [popupPosition, handlePopupClose, addLog]);

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
                    key={key}
                    initialText={selectedText}
                    onClose={handlePopupClose}
                    initialPosition={popupPosition}
                    onReset={handlePopupReset}
                    addLog={addLog}
                    onApprove={handleApproveRewrite}
                />
            )}
            <DebugPanel logs={logs} />
        </>
    );
};

function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const root = document.createElement('div');
root.id = 'fast-ai-rewrite-root';
document.body.appendChild(root);

ReactDOM.render(<ContentScript />, root);