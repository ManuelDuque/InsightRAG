/**
 * InsightRAG Frontend - Application root.
 *
 * Author: ManuelDuque
 * Date: 02/02/2026
 *
 * This module composes the page-level layout and wraps the UI with the
 * Insight state provider.
 */

import Header from './components/Header'
import ChatList from './components/ChatList'
import InputArea from './components/InputArea'
import ErrorBoundary from './components/ErrorBoundary'
import { InsightProvider } from './context/InsightContext'
import { ThemeProvider } from './context/ThemeContext'

function AppLayout() {
  /**
   * Pure layout component.
   *
   * Kept separate from the provider wrapper to make the render tree easier to
   * reason about.
   */
  return (
    <div className="app-shell flex h-screen flex-col">
      <Header />
      <ChatList />
      <InputArea />
    </div>
  )
}

function App() {
  /**
   * Application entry component.
   *
   * Provides global InsightRAG state via React Context.
   */
  return (
    <ThemeProvider>
      <InsightProvider>
        <ErrorBoundary>
          <AppLayout />
        </ErrorBoundary>
      </InsightProvider>
    </ThemeProvider>
  )
}

export default App