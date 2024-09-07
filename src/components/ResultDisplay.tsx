import React from 'react';

interface ResultDisplayProps {
    result: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
    if (!result) return null;

    return (
        <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Rewritten Text:</h2>
            <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
                <p className="text-gray-800">{result}</p>
            </div>
        </div>
    );
};

export default ResultDisplay;