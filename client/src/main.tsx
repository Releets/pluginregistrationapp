import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppSettingsProvider } from './context/AppSettingsContext'
import './styles/main.css'
import { LanguageProvider } from './context/LanguageContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppSettingsProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AppSettingsProvider>
  </StrictMode>
)
