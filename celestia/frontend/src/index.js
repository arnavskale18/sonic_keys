import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // This line imports all the global styles from your index.css file.
import App from './App'; // This line imports your main App component.

// This is the standard starting point for a modern React application.
// 1. It finds the <div id="root"></div> element in your public/index.html file.
const root = ReactDOM.createRoot(document.getElementById('root'));

// 2. It tells React to render your entire <App /> component inside that div.
// <React.StrictMode> is a wrapper that helps find potential problems in your app.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
