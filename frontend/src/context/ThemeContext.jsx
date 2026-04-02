/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const THEME_KEY = 'insight-theme'
const ThemeContext = createContext(null)

const getSystemTheme = () =>
  globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'

const getInitialTheme = () => {
  const savedTheme = globalThis.localStorage?.getItem(THEME_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }
  return getSystemTheme()
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.setAttribute('data-theme', theme)
    globalThis.localStorage?.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    const media = globalThis.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) {
      return undefined
    }

    const onSystemThemeChange = (event) => {
      const savedTheme = globalThis.localStorage?.getItem(THEME_KEY)
      if (!savedTheme) {
        setTheme(event.matches ? 'dark' : 'light')
      }
    }

    media.addEventListener?.('change', onSystemThemeChange)
    return () => media.removeEventListener?.('change', onSystemThemeChange)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}
