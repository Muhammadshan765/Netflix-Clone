import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const WatchLaterContext = createContext(null)
const STORAGE_KEY = 'watchLaterList'

const parseStoredList = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.warn('Unable to parse stored watch later list', error)
    return []
  }
}

export const WatchLaterProvider = ({ children }) => {
  const [watchLater, setWatchLater] = useState(() => parseStoredList())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchLater))
  }, [watchLater])

  const addToWatchLater = movie => {
    setWatchLater(prev => (prev.some(item => item.id === movie.id) ? prev : [...prev, movie]))
  }

  const removeFromWatchLater = movieId => {
    setWatchLater(prev => prev.filter(item => item.id !== movieId))
  }

  const toggleWatchLater = movie => {
    setWatchLater(prev => {
      const exists = prev.some(item => item.id === movie.id)
      if (exists) {
        return prev.filter(item => item.id !== movie.id)
      }

      return [...prev, movie]
    })
  }

  const isSaved = movieId => watchLater.some(item => item.id === movieId)

  const value = useMemo(
    () => ({
      watchLater,
      addToWatchLater,
      removeFromWatchLater,
      toggleWatchLater,
      isSaved
    }),
    [watchLater]
  )

  return <WatchLaterContext.Provider value={value}>{children}</WatchLaterContext.Provider>
}

export const useWatchLater = () => {
  const context = useContext(WatchLaterContext)

  if (!context) {
    throw new Error('useWatchLater must be used within a WatchLaterProvider')
  }

  return context
}


