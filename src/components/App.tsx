import React, { useState } from 'react';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"

interface AppProps {
    selectedText?: string;
    position?: { x: number; y: number };
}

const App: React.FC<AppProps> = ({ selectedText, position }) => {
    const [inputText, setInputText] = useState(selectedText || '');
    const [outputText, setOutputText] = useState('');

    const handleRewrite = () => {
        // Here you would typically call your AI rewrite function
        // For now, we'll just reverse the text as a placeholder
        setOutputText(inputText.split('').reverse().join(''));
    };

    return (
        <div className="p-4 bg-background text-foreground">
            <h1 className="text-2xl font-bold mb-4">Fast AI Rewrite</h1>
            <div className="space-y-4">
                <div>
                    <label htmlFor="input-text" className="block text-sm font-medium mb-1">
                        Text to Rewrite
                    </label>
                    <Textarea
                        id="input-text"
                        placeholder="Enter text to rewrite..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full"
                    />
                </div>
                <Button onClick={handleRewrite}>Rewrite</Button>
                {outputText && (
                    <div>
                        <label htmlFor="output-text" className="block text-sm font-medium mb-1">
                            Rewritten Text
                        </label>
                        <Textarea
                            id="output-text"
                            value={outputText}
                            readOnly
                            className="w-full"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;