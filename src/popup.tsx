/*
    This is the Extension HTML (Show when clicking on the icon)
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {Card, CardContent, CardHeader, CardTitle} from "./components/shadcn/card";

const Popup: React.FC = () => {
    return (
        <Card className="w-64">
            <CardHeader>
                <CardTitle>Fast AI Rewrite</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Select text on any page to rewrite it!</p>
            </CardContent>
        </Card>
    );
};

ReactDOM.render(<Popup />, document.getElementById('root'));