import Header from './components/Header'
import ChatList from './components/ChatList'
import InputArea from './components/InputArea'
import { InsightProvider } from './context/InsightContext'

function AppLayout() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-200 font-sans animate-gradient">
      <Header />
      <ChatList />
      <InputArea />
    </div>
  )
}

function App() {
  return (
    <InsightProvider>
      <AppLayout />
    </InsightProvider>
  )
}

export default App