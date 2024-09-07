import React from 'react';

interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange }) => {
    return (
        <div className="mb-4">
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                Text to Rewrite
            </label>
            <textarea
                id="text-input"
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                rows={4}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter text to rewrite..."
            />
        </div>
    );
};

export default TextInput;