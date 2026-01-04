import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Version - bump this with each release!
const VERSION = '2.16.2'
console.log(`%c🚀 DetectorApp v${VERSION}`, 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
