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

function AppLayout() {
  /**
   * Pure layout component.
   *
   * Kept separate from the provider wrapper to make the render tree easier to
   * reason about.
   */
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-200 font-sans animate-gradient">
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
    <InsightProvider>
      <ErrorBoundary>
        <AppLayout />
      </ErrorBoundary>
    </InsightProvider>
  )
}

export default App