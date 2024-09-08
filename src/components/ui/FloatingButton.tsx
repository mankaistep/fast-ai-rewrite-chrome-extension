import React, { useCallback } from 'react';
import { Button } from '../shadcn/button';

interface FloatingButtonProps {
    position: { top: number; left: number };
    onClick: () => void;
    addLog: (message: string) => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ position, onClick, addLog }) => {
    const handleClick = useCallback((e: React.MouseEvent) => {
        addLog('FloatingButton handleClick called');
        e.preventDefault();
        e.stopPropagation();
        onClick();
    }, [onClick, addLog]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        addLog('FloatingButton mousedown event');
    }, [addLog]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        addLog('FloatingButton mouseup event');
    }, [addLog]);

    return (
        <div
            className="fixed z-[9999]"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
            onMouseEnter={() => addLog('Mouse entered FloatingButton')}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={(e) => {
                addLog('Div onClick event');
                handleClick(e);
            }}
        >
            <Button
                onClick={handleClick}
                onMouseDown={(e) => {
                    addLog('Button mousedown event');
                    e.stopPropagation();
                }}
                onMouseUp={(e) => {
                    addLog('Button mouseup event');
                    e.stopPropagation();
                }}
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2 bg-red-500 text-white shadow-md hover:bg-red-600"
            >
                Rewrite
            </Button>
        </div>
    );
};

export default FloatingButton;