import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QuestionsProvider } from './UploadFormats/QuestionsContext.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QuestionsProvider>
      <App />
    </QuestionsProvider>
  </StrictMode>
  
)
