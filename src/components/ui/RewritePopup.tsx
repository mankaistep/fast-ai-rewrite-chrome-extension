import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../shadcn/card';
import { Input } from '../shadcn/input';
import { Button } from '../shadcn/button';
import { X, ChevronDown } from 'lucide-react';

interface RewritePopupProps {
    initialText: string;
    onClose: () => void;
    initialPosition: { top: number; left: number };
}

const RewritePopup: React.FC<RewritePopupProps> = ({ initialText, onClose, initialPosition }) => {
    const [selectedOption, setSelectedOption] = useState(() => {
        const savedOption = localStorage.getItem('lastSelectedOption');
        return savedOption || '';
    });
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [extraNote, setExtraNote] = useState('');
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const popupRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLDivElement>(null);

    const handleRewrite = () => {
        // TODO: Implement AI rewrite logic here
        console.log('Rewriting with option:', selectedOption, 'and extra note:', extraNote);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (popupRef.current && e.target === e.currentTarget) {
            const rect = popupRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
            setIsDragging(true);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    top: e.clientY - dragOffset.y,
                    left: e.clientX - dragOffset.x
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
                setIsSelectOpen(false);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDragging, dragOffset]);

    useEffect(() => {
        localStorage.setItem('lastSelectedOption', selectedOption);
    }, [selectedOption]);

    const options = [
        { value: 'formal', label: 'Formal' },
        { value: 'casual', label: 'Casual' },
        { value: 'professional', label: 'Professional' },
    ];

    return (
        <div
            ref={popupRef}
            className="fixed z-50"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
        >
            <Card className="w-64 bg-white shadow-lg overflow-hidden">
                <div
                    className="h-6 bg-gray-100 flex justify-end items-center px-2 cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={onClose}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
                <CardContent className="p-3 space-y-3">
                    <div ref={selectRef} className="relative">
                        <Button
                            variant="outline"
                            onClick={() => setIsSelectOpen(!isSelectOpen)}
                            className="w-full h-8 text-xs justify-between px-3 py-1"
                        >
                            {selectedOption ? options.find(opt => opt.value === selectedOption)?.label : 'Select agent'}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                        {isSelectOpen && (
                            <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                {options.map((option) => (
                                    <div
                                        key={option.value}
                                        className="px-3 py-1.5 text-xs hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setSelectedOption(option.value);
                                            setIsSelectOpen(false);
                                        }}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <Input
                        placeholder="Extra note"
                        value={extraNote}
                        onChange={(e) => setExtraNote(e.target.value)}
                        className="w-full h-8 text-xs"
                    />
                    <div className="p-1 bg-gray-100 rounded-md text-xs h-16 overflow-y-auto">
                        {initialText}
                    </div>
                    <Button onClick={handleRewrite} className="w-full h-8 text-xs">
                        Rewrite
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default RewritePopup;