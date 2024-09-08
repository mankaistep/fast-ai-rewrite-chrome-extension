import React, { useState } from 'react';
import {Button} from "../shadcn/button";

interface DebugPanelProps {
    logs: string[];
}

const DebugPanel: React.FC<DebugPanelProps> = ({ logs }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? 'Hide Debug' : 'Show Debug'}
            </Button>
            {isOpen && (
                <div className="mt-2 p-4 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-auto">
                    <h3 className="text-lg font-semibold mb-2">Debug Logs</h3>
                    {logs.map((log, index) => (
                        <div key={index} className="text-sm mb-1">
                            {log}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DebugPanel;