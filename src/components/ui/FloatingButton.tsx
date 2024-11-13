import React, { useCallback } from 'react';
import { Button } from '../shadcn/button';
import {Sparkles} from "lucide-react";

interface FloatingButtonProps {
    position: { top: number; left: number };
    onClick: () => void;
    addLog: (message: string) => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ position, onClick, addLog }) => {
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addLog('FloatingButton clicked');
        onClick();
    }, [onClick, addLog]);

    return (
        <div
            className="fixed z-[99999]"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            <Button
                onClick={handleClick}
                size="sm"
                className="h-6 text-xs px-2 shadow-md fastai-primary-button"
            >
                Rewrite
            </Button>
        </div>
    );
};

export default FloatingButton;