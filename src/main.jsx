import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'sakura.css'

async function startApp() {
  try {
    // Initialize the mock service worker in all environments
    // Since this is a prototype, we need the mock API in production too
    console.log('Starting Mock Service Worker')
    const { worker } = await import('./mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass' // Ignore unhandled requests
    })
    
    // Render the React application
    console.log('Creating root')
    const root = ReactDOM.createRoot(document.getElementById('root'))
    
    console.log('Rendering app')
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    console.log('App rendered')
  } catch (error) {
    console.error('Error initializing app:', error)
    document.getElementById('root').innerHTML = `
      <h1>Error Loading Application</h1>
      <p>There was an error loading the application: ${error.message}</p>
    `
  }
}

startApp()