import React, { useState } from 'react';

interface OptionsPanelProps {
    onRewrite: (options: { style: string; tone: string }) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({ onRewrite }) => {
    const [style, setStyle] = useState('');
    const [tone, setTone] = useState('');

    const handleRewrite = () => {
        onRewrite({ style, tone });
    };

    return (
        <div className="mb-4">
            <div className="mb-2">
                <label htmlFor="style-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Writing Style
                </label>
                <select
                    id="style-select"
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                >
                    <option value="">Select a style</option>
                    <option value="formal">Formal</option>
                    <option value="casual">Casual</option>
                    <option value="creative">Creative</option>
                </select>
            </div>
            <div className="mb-2">
                <label htmlFor="tone-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Tone
                </label>
                <select
                    id="tone-select"
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                >
                    <option value="">Select a tone</option>
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="enthusiastic">Enthusiastic</option>
                </select>
            </div>
            <button
                className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={handleRewrite}
            >
                Rewrite
            </button>
        </div>
    );
};

export default OptionsPanel;