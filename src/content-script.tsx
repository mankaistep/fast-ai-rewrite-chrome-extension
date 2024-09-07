import React from 'react';
import ReactDOM from 'react-dom';
import SelectionHandler from './components/SelectionHandler';

const root = document.createElement('div');
root.id = 'fast-ai-rewrite-root';
document.body.appendChild(root);

ReactDOM.render(
    <React.StrictMode>
        <SelectionHandler />
    </React.StrictMode>,
    root
);