import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { init } from '@dash0/sdk-web';

// Initialize Dash0 browser monitoring
init({
  serviceName: 'willful-waste-frontend',
  endpoint: {
    url: 'https://ingress.us-west-2.aws.dash0.com:4318',
    authToken: 'auth_dl66TFbFB1rl3Mzo4WtKWMv63dHlwkyM',
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
