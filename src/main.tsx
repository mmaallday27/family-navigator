import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

/**
 * Last-resort safety net: if anything below throws during render, show a calm
 * recovery screen instead of a blank page. The family's record lives on the
 * server, so a reload really does pick up where they left off.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
          <div className="max-w-md text-center">
            <h1 className="font-display text-xl font-semibold text-ink">
              Something went wrong on our side
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Your saved information is safe — reload to pick up where you left off.
            </p>
            <button className="btn-primary mt-6" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
