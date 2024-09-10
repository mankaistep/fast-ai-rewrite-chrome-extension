import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../shadcn/card';
import { Input } from '../shadcn/input';
import { Button } from '../shadcn/button';
import { X, ChevronDown, RotateCw } from 'lucide-react';

interface RewritePopupProps {
    initialText: string;
    onClose: () => void;
    initialPosition: { top: number; left: number; isBottom: boolean };
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
    const [isLoading, setIsLoading] = useState(false);
    const [rewrittenText, setRewrittenText] = useState('');
    const popupRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLDivElement>(null);

    const handleRewrite = async () => {
        setIsLoading(true);
        // Simulating an API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setRewrittenText("This is a simulated rewritten text. It's just a placeholder for now.");
        setIsLoading(false);
    };

    const handleApprove = () => {
        // TODO: Implement approval logic
        console.log('Approved rewritten text:', rewrittenText);
        onClose();
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
                setPosition(prev => ({
                    ...prev,
                    top: e.clientY - dragOffset.y,
                    left: e.clientX - dragOffset.x
                }));
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
                top: position.isBottom ? 'auto' : `${position.top}px`,
                bottom: position.isBottom ? `${window.innerHeight - position.top}px` : 'auto',
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
                    <div
                        className="p-1 bg-gray-100 rounded-md text-xs overflow-y-auto"
                        style={{
                            height: 'auto',
                            maxHeight: 'calc(1.5rem * 4)',
                            lineHeight: '1.5rem'
                        }}
                    >
                        {initialText}
                    </div>
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
                    {rewrittenText && (
                        <div
                            className="p-1 bg-green-100 rounded-md text-xs overflow-y-auto"
                            style={{
                                height: 'auto',
                                maxHeight: 'calc(1.5rem * 4)',
                                lineHeight: '1.5rem'
                            }}
                        >
                            {rewrittenText}
                        </div>
                    )}
                    {!rewrittenText ? (
                        <Button
                            onClick={handleRewrite}
                            className="w-full h-8 text-xs"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                                    Rewriting...
                                </>
                            ) : (
                                'Rewrite'
                            )}
                        </Button>
                    ) : (
                        <div className="flex justify-between">
                            <Button
                                onClick={handleApprove}
                                className="w-3/4 h-8 text-xs mr-1"
                            >
                                Looks good
                            </Button>
                            <Button
                                onClick={handleRewrite}
                                className="w-1/4 h-8 text-xs ml-1"
                                variant="outline"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <RotateCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RotateCw className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RewritePopup;