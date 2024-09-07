import React, { useState, useEffect } from 'react';
import TextInput from './TextInput';
import OptionsPanel from './OptionsPanel';
import ResultDisplay from './ResultDisplay';
import useAIRewrite from '../hooks/useAIRewrite';

interface PopupProps {
    initialText: string;
    onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ initialText, onClose }) => {
    const [inputText, setInputText] = useState(initialText);
    const [result, setResult] = useState('');
    const { rewrite, isLoading, error } = useAIRewrite();

    useEffect(() => {
        setInputText(initialText);
    }, [initialText]);

    const handleRewrite = async (options: { style: string; tone: string }) => {
        const rewrittenText = await rewrite(inputText, options);
        setResult(rewrittenText);
    };

    return (
        <div className="popup bg-white shadow-lg rounded-lg p-4 w-80">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Fast AI Rewrite</h1>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    ✕
                </button>
            </div>
            <TextInput value={inputText} onChange={setInputText} />
            <OptionsPanel onRewrite={handleRewrite} />
            {isLoading && (
                <p className="text-blue-500 text-center">Rewriting in progress...</p>
            )}
            {error && <p className="text-red-500 text-center">{error}</p>}
            <ResultDisplay result={result} />
        </div>
    );
};

export default Popup;