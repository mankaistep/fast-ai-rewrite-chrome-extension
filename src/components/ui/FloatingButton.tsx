import React, { useCallback } from 'react';
import { Button } from '../shadcn/button';

interface FloatingButtonProps {
    position: { top: number; left: number };
    onClick: () => void;
    addLog: (message: string) => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ position, onClick, addLog }) => {
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        addLog('FloatingButton mousedown event');
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        onClick();
    }, [onClick, addLog]);

    const handleMouseUp = useCallback((e: React.MouseEvent) => {
        addLog('FloatingButton mouseup event');
    }, [addLog]);

    return (
        <div
            className="fixed z-[99999]"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
            onMouseEnter={() => addLog('Mouse entered FloatingButton')}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <Button
                onMouseDown={(e) => {
                    addLog('Button mousedown event');
                    e.nativeEvent.stopImmediatePropagation();
                    handleMouseDown(e);
                }}
                onMouseUp={(e) => {
                    addLog('Button mouseup event');
                    e.nativeEvent.stopImmediatePropagation();
                }}
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2 bg-red-500 text-white shadow-md hover:bg-red-600"
                style={{
                    fontSize: '12px',
                    lineHeight: '1',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: 'normal',
                }}
            >
                Rewrite
            </Button>
        </div>
    );
};

export default FloatingButton;