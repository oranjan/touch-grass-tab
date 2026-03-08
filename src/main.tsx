import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { loadSavedTheme } from './lib/themes'
import { Toaster } from './components/ui/sonner'
import App from './App.tsx'

loadSavedTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="bottom-center" />
  </StrictMode>,
)
