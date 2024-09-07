import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import Popup from './Popup';

interface Position {
    x: number;
    y: number;
}

const SelectionHandler: React.FC = () => {
    const [selectedText, setSelectedText] = useState<string>('');
    const [popupPosition, setPopupPosition] = useState<Position | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const isPopoverLive = () => {
        return !!popupRef.current;
    };

    const isEditingGoogleDocs = () => {
        return window.location.href.startsWith('https://docs.google.com/document');
    };

    const isCursorInTypableField = () => {
        const activeElement = document.activeElement as HTMLElement;
        return (
            activeElement instanceof HTMLInputElement ||
            activeElement instanceof HTMLTextAreaElement ||
            activeElement?.isContentEditable
        );
    };

    const getUniqueSelector = (element: Element): string => {
        if (element.id) {
            return `#${element.id}`;
        }
        if (element.className) {
            return `.${element.className.split(' ').join('.')}`;
        }
        return element.tagName.toLowerCase();
    };

    const showButton = (selection: Selection, activeElementSelector: string) => {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const buttonPosition = {
            x: rect.left + window.scrollX,
            y: rect.bottom + window.scrollY,
        };

        if (!buttonRef.current) {
            const button = document.createElement('button');
            button.textContent = 'Rewrite ✦';
            button.className = 'rewrite-button';
            button.style.position = 'absolute';
            button.style.left = `${buttonPosition.x}px`;
            button.style.top = `${buttonPosition.y}px`;
            button.addEventListener('click', () => showPopup(selection.toString(), buttonPosition));
            document.body.appendChild(button);
            buttonRef.current = button;
        } else {
            buttonRef.current.style.left = `${buttonPosition.x}px`;
            buttonRef.current.style.top = `${buttonPosition.y}px`;
        }
    };

    const hideButton = () => {
        if (buttonRef.current) {
            document.body.removeChild(buttonRef.current);
            buttonRef.current = null;
        }
    };

    const showPopup = (text: string, position: Position) => {
        setSelectedText(text);
        setPopupPosition(position);
    };

    const hidePopup = () => {
        setSelectedText('');
        setPopupPosition(null);
    };

    const handleSelectionComplete = () => {
        if (isPopoverLive()) {
            return;
        }
        if (!isEditingGoogleDocs() && !isCursorInTypableField()) {
            return;
        }

        const selection = window.getSelection();
        if (selection && selection.toString()) {
            const activeElement = document.activeElement as Element;
            showButton(selection, getUniqueSelector(activeElement));
        }
    };

    const handleDeselect = (event: MouseEvent) => {
        if (isPopoverLive()) {
            return;
        }
        if (event.target instanceof Element && event.target.matches('.rewrite-button')) {
            return;
        }
        hideButton();
    };

    useEffect(() => {
        const handleMouseUp = () => {
            setTimeout(handleSelectionComplete, 50);
        };

        const handleMouseDown = (event: MouseEvent) => {
            handleDeselect(event);
        };

        const handleInput = () => {
            handleDeselect(new MouseEvent('mousedown'));
            // Additional logic for forced input and last input selector can be added here
        };

        const handleKeyUp = () => {
            handleDeselect(new MouseEvent('mousedown'));
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
                setTimeout(handleSelectionComplete, 50);
            }
        };

        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('input', handleInput);

        const iframe = document.querySelector('.docs-texteventtarget-iframe') as HTMLIFrameElement;
        const documentToAddListener = isEditingGoogleDocs()
            ? iframe?.contentWindow?.document || document
            : document;

        documentToAddListener.addEventListener('keyup', handleKeyUp);
        documentToAddListener.addEventListener('keydown', handleKeyDown);

        // Add listeners to text areas and input fields
        setTimeout(() => {
            const inputElements = document.querySelectorAll<HTMLElement>('textarea, input[type="text"]');
            inputElements.forEach(element => {
                element.addEventListener('input', handleInput);
            });
        }, 2500);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('input', handleInput);
            documentToAddListener.removeEventListener('keyup', handleKeyUp);
            documentToAddListener.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <>
            {popupPosition && (
                <div
                    ref={popupRef}
                    style={{
                        position: 'absolute',
                        left: `${popupPosition.x}px`,
                        top: `${popupPosition.y}px`,
                        zIndex: 9999,
                    }}
                >
                    <Popup
                        initialText={selectedText}
                        onClose={hidePopup}
                    />
                </div>
            )}
        </>
    );
};

export default SelectionHandler;