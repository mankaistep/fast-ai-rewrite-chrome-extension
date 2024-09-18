import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../shadcn/card';
import { Input } from '../shadcn/input';
import { Button } from '../shadcn/button';
import {X, ChevronDown, RotateCw, Sparkles, Check} from 'lucide-react';
import {getAgents, markAsApproved, rewrite} from "../../lib/rewrite-utils";

const HOST = 'http://localhost:3000'

interface RewritePopupProps {
    initialText: string;
    onClose: () => void;
    initialPosition: { top: number; left: number; isBottom: boolean };
    addLog: (message: string) => void;
    onApprove: (rewrittenText: string) => void;
}

const RewritePopup: React.FC<RewritePopupProps> = ({ initialText, onClose, initialPosition, addLog, onApprove }) => {
    const [agents, setAgents] = useState<[{ id: number; name: string }]>([{
        id: -1,
        name: 'Select an agent'
    }])

    const [selectedAgent, setSelectedAgent] = useState(() => {
        const savedOption = localStorage.getItem('lastSelectedOption');
        if (savedOption) {
            const savedId = parseInt(savedOption)
            if (!agents.map((agent) => agent.id).includes(savedId)) {
                if (agents.length > 0) {
                    return agents[0].id
                }
            }
        }
        return -1;
    });

    const [suggestion, setSuggestion] = useState<{
        activityId: string,
        agentId: number,
        original: string,
        prompt: string,
        suggestion: string
    } | null>(null);

    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [extraNote, setExtraNote] = useState('');
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLDivElement>(null);

    const handleRewrite = async () => {
        setIsLoading(true);
        try {
            const suggestion = await rewrite(selectedAgent, initialText, extraNote);
            setSuggestion(suggestion);
        } catch (error) {
            console.error('Error rewriting text:', error);
            addLog('Error rewriting text: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async () => {
        if (suggestion) {
            onApprove(suggestion.suggestion);

            // Send request to mark approve
            try {
                await markAsApproved(suggestion.activityId)
                setSuggestion(null)
            } catch (error) {
                console.error('Error marking as approved:', error);
                addLog('Error marking as approved: ' + (error as Error).message);
            }
        }
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
                    left: e.clientX - dragOffset.x,
                    isBottom: false
                }));
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
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
        localStorage.setItem('lastSelectedOption', selectedAgent.toString());
    }, [selectedAgent]);

    useEffect(() => {
        setSuggestion(null);
        setIsLoading(false);
    }, [initialText, addLog]);

    useEffect(() => {
        getAgents().then((agents) => {
            setAgents(agents)
            if (selectedAgent == -1) {
                setSelectedAgent(agents[0].id)
            }
        });
    }, []);

    const globalStyle = {
        fontSize: '12px',
        fontWeight: 'normal',
    }

    return (
        <div
            ref={popupRef}
            className="fixed z-50"
            style={{
                top: position.isBottom ? 'auto' : `${position.top}px`,
                bottom: position.isBottom ? `${window.innerHeight - position.top}px` : 'auto',
                left: `${position.left}px`,
                cursor: isDragging ? 'grabbing' : 'grab',
                ...globalStyle,
            }}
        >
            <Card className="w-64 bg-white shadow-lg overflow-hidden fastai-border-radius-6px">
                <div
                    className="h-6 bg-gray-100 flex justify-end items-center px-2 cursor-grab active:cursor-grabbing rounded-t-lg"
                    onMouseDown={handleMouseDown}
                    style={globalStyle}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 rounded-full fastai-border-radius-6px"
                        onClick={onClose}
                        style={globalStyle}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
                {
                    agents.length > 0 ? (
                        <CardContent className="p-3 space-y-3" style={globalStyle}>
                            <div
                                className="pl-3 pr-3 bg-gray-100 rounded-md overflow-y-auto fastai-border-radius-6px"
                                style={{
                                    height: 'auto',
                                    maxHeight: 'calc(1.5rem * 4)',
                                    lineHeight: '1.5rem',
                                    ...globalStyle,
                                }}
                            >
                                {initialText}
                            </div>
                            <div ref={selectRef} className="relative">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                                    className="w-full h-8 justify-between px-3 py-1 border border-gray-300 rounded-md fastai-border-radius-6px"
                                    style={globalStyle}
                                >
                                    {selectedAgent ? agents.find(agent => agent.id == selectedAgent)?.name : 'Select agent'}
                                    <ChevronDown className="h-4 w-4 opacity-50 fastai-border-radius-6px" />
                                </Button>
                                {isSelectOpen && (
                                    <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 fastai-border-radius-6px" style={globalStyle}>
                                        {agents.map((agent) => (
                                            <div
                                                key={agent.id}
                                                className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer first:rounded-t-md last:rounded-b-md"
                                                onMouseDown={() => {
                                                    setSelectedAgent(agent.id)
                                                    setIsSelectOpen(false)
                                                }}
                                                style={globalStyle}
                                            >
                                                {agent.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Input
                                placeholder="Extra note"
                                value={extraNote}
                                onChange={(e) => setExtraNote(e.target.value)}
                                className="w-full h-8 border border-gray-300 rounded-md fastai-border-radius-6px"
                                style={globalStyle}
                            />
                            {suggestion && (
                                <div
                                    className="p-3 bg-green-100 rounded-md overflow-y-auto"
                                    style={{
                                        height: 'auto',
                                        maxHeight: 'calc(1.5rem * 7)', // 7 lines
                                        lineHeight: '1.5rem',
                                        whiteSpace: 'pre-wrap', // Preserves line breaks
                                        ...globalStyle,
                                    }}
                                >
                                    {suggestion.suggestion}
                                </div>
                            )}
                            {!suggestion ? (
                                <Button
                                    onClick={handleRewrite}
                                    className="w-full h-8 fastai-primary-button"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                                            <div className="animate-pulse">
                                                Thinking...
                                            </div>
                                        </>
                                    ) : (
                                        'Rewrite'
                                    )}
                                </Button>
                            ) : (
                                <div className="flex justify-between">
                                    <Button
                                        onClick={handleRewrite}
                                        className="w-1/4 h-8 mr-1 fastai-secondary-button"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <RotateCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RotateCw className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleApprove}
                                        className="w-3/4 h-8 ml-1 fastai-primary-button"
                                    >
                                        Looks good
                                        <Check className="w-4 h-4 ml-2"/>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    ) : (
                        <CardContent className="p-3 space-y-3" style={globalStyle}>
                            <p className="text-muted-foreground text-center" style={globalStyle}>
                                Requires agents to start rewriting
                            </p>
                            <Button
                                onClick={() => {
                                    window.open(`${HOST}/a/agents/create`, '_blank');
                                    onClose();
                                }}
                                className="w-full h-8 ml-1 fastai-primary-button"
                            >
                                Create agent
                            </Button>
                        </CardContent>
                    )
                }

            </Card>
        </div>
    )
};

export default RewritePopup;