import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from './components/ui/sonner'
import { BlockedApp } from './BlockedApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlockedApp />
    <Toaster position="bottom-center" />
  </StrictMode>,
)
