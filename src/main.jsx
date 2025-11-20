import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { WatchLaterProvider } from './context/WatchLaterContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WatchLaterProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WatchLaterProvider>
  </StrictMode>,
)
