import React from 'react';
import { Button } from '../shadcn/button';

interface FloatingButtonProps {
    position: { top: number; left: number };
    onClick: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ position, onClick }) => (
    <div
        className="fixed z-50"
        style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
        }}
    >
        <Button
            onClick={onClick}
            variant="outline"
            size="sm"
            className="h-6 text-xs px-2 bg-white shadow-md hover:bg-gray-100"
        >
            Rewrite
        </Button>
    </div>
);

export default FloatingButton;