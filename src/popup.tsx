import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

import './index.css'; // Assuming you'll add some global styles

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);