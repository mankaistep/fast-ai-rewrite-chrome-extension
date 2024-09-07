import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../shadcn/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shadcn/select';
import { Input } from '../shadcn/input';
import { Label } from '../shadcn/label';
import { Button } from '../shadcn/button';
import { X } from 'lucide-react';

interface RewritePopupProps {
    initialText: string;
    onClose: () => void;
    initialPosition: { top: number; left: number };
}

const RewritePopup: React.FC<RewritePopupProps> = ({ initialText, onClose, initialPosition }) => {
    const [selectedOption, setSelectedOption] = useState('');
    const [extraNote, setExtraNote] = useState('');
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const popupRef = useRef<HTMLDivElement>(null);

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

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

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
                    <div className="space-y-1">
                        <Label htmlFor="rewrite-option" className="text-xs font-medium">Rewrite Option</Label>
                        <Select value={selectedOption} onValueChange={setSelectedOption}>
                            <SelectTrigger id="rewrite-option" className="w-full h-8 text-xs">
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="formal">Formal</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="professional">Professional</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="extra-note" className="text-xs font-medium">Extra Note</Label>
                        <Input
                            id="extra-note"
                            placeholder="Extra note"
                            value={extraNote}
                            onChange={(e) => setExtraNote(e.target.value)}
                            className="w-full h-8 text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs font-medium">Selected Text</Label>
                        <div className="p-1 bg-gray-100 rounded-md text-xs h-16 overflow-y-auto">{initialText}</div>
                    </div>
                    <Button onClick={handleRewrite} className="w-full h-8 text-xs">Rewrite</Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default RewritePopup;