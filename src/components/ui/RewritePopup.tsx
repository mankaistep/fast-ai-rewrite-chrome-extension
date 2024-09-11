import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../shadcn/card';
import { Input } from '../shadcn/input';
import { Button } from '../shadcn/button';
import { X, ChevronDown, RotateCw } from 'lucide-react';

interface RewritePopupProps {
    initialText: string;
    onClose: () => void;
    initialPosition: { top: number; left: number; isBottom: boolean };
    onReset: () => void;
    addLog: (message: string) => void;
    onApprove: (rewrittenText: string) => void;
}

const RewritePopup: React.FC<RewritePopupProps> = ({ initialText, onClose, initialPosition, onReset, addLog, onApprove }) => {
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
        addLog('Rewrite button clicked');
        setIsLoading(true);
        try {
            // Simulating an API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            const newText = "This is a simulated rewritten text. It's just a placeholder for now.";
            setRewrittenText(newText);
            addLog('Rewrite completed: ' + newText);
        } catch (error) {
            console.error('Error rewriting text:', error);
            addLog('Error rewriting text: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = () => {
        addLog('Approved rewritten text: ' + rewrittenText);
        onApprove(rewrittenText);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (popupRef.current && e.target === e.currentTarget) {
            const rect = popupRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
            setIsDragging(true);
            addLog('Started dragging popup');
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
            if (isDragging) {
                setIsDragging(false);
                addLog('Stopped dragging popup');
            }
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
    }, [isDragging, dragOffset, addLog]);

    useEffect(() => {
        localStorage.setItem('lastSelectedOption', selectedOption);
    }, [selectedOption]);

    useEffect(() => {
        setRewrittenText('');
        setIsLoading(false);
        onReset();
        addLog('Popup state reset');
    }, [initialText, onReset, addLog]);

    const options = [
        { value: 'formal', label: 'Formal' },
        { value: 'casual', label: 'Casual' },
        { value: 'professional', label: 'Professional' },
    ];

    const popupStyle: React.CSSProperties = {
        fontSize: '14px',
        lineHeight: '1.5',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
    };

    const buttonStyle: React.CSSProperties = {
        fontSize: '12px',
        lineHeight: '1',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
    };

    return (
        <div
            ref={popupRef}
            className="fixed z-50"
            style={{
                top: position.isBottom ? 'auto' : `${position.top}px`,
                bottom: position.isBottom ? `${window.innerHeight - position.top}px` : 'auto',
                left: `${position.left}px`,
                cursor: isDragging ? 'grabbing' : 'grab',
                ...popupStyle,
            }}
        >
            <Card className="w-64 bg-white shadow-lg overflow-hidden">
                <div
                    className="h-6 bg-gray-100 flex justify-end items-center px-2 cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                    style={popupStyle}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={onClose}
                        style={buttonStyle}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
                <CardContent className="p-3 space-y-3" style={popupStyle}>
                    <div
                        className="p-1 bg-gray-100 rounded-md overflow-y-auto"
                        style={{
                            height: 'auto',
                            maxHeight: 'calc(1.5rem * 4)',
                            lineHeight: '1.5rem',
                            fontSize: '12px',
                        }}
                    >
                        {initialText}
                    </div>
                    <div ref={selectRef} className="relative">
                        <Button
                            variant="outline"
                            onClick={() => setIsSelectOpen(!isSelectOpen)}
                            className="w-full h-8 justify-between px-3 py-1"
                            style={buttonStyle}
                        >
                            {selectedOption ? options.find(opt => opt.value === selectedOption)?.label : 'Select agent'}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                        {isSelectOpen && (
                            <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10" style={popupStyle}>
                                {options.map((option) => (
                                    <div
                                        key={option.value}
                                        className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setSelectedOption(option.value);
                                            setIsSelectOpen(false);
                                            addLog(`Selected option: ${option.label}`);
                                        }}
                                        style={{ fontSize: '12px' }}
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
                        className="w-full h-8"
                        style={{ fontSize: '12px' }}
                    />
                    {rewrittenText && (
                        <div
                            className="p-1 bg-green-100 rounded-md overflow-y-auto"
                            style={{
                                height: 'auto',
                                maxHeight: 'calc(1.5rem * 4)',
                                lineHeight: '1.5rem',
                                fontSize: '12px',
                            }}
                        >
                            {rewrittenText}
                        </div>
                    )}
                    {!rewrittenText ? (
                        <Button
                            onClick={handleRewrite}
                            className="w-full h-8"
                            disabled={isLoading}
                            style={buttonStyle}
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
                                className="w-3/4 h-8 mr-1"
                                style={buttonStyle}
                            >
                                Looks good
                            </Button>
                            <Button
                                onClick={handleRewrite}
                                className="w-1/4 h-8 ml-1"
                                variant="outline"
                                disabled={isLoading}
                                style={buttonStyle}
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