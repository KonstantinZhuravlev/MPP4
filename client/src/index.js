import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app.jsx';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <App className="app" />,
  document.getElementById('root')
);

serviceWorker.unregister();


