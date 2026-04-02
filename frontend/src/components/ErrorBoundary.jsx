import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('ErrorBoundary capturo un error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6 text-slate-200">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-6 text-center shadow-xl">
            <h1 className="mb-2 text-lg font-semibold text-white">La aplicación encontró un error</h1>
            <p className="text-sm text-slate-300">Recarga la página para continuar. Si persiste, revisa la configuración del frontend y backend.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
