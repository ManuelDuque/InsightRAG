import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ErrorBoundary from './ErrorBoundary'

function BrokenComponent() {
  throw new Error('Boom')
}

describe('ErrorBoundary', () => {
  it('renders fallback UI when a child crashes', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('La aplicación encontró un error')).toBeInTheDocument()
    consoleSpy.mockRestore()
  })
})
