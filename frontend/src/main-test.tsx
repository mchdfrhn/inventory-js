import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MinimalTest from './MinimalTest'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find the root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <MinimalTest />
  </StrictMode>
)
