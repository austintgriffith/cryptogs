import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './pogs.css'
import './styles/App.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
