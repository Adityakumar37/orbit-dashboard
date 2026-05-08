import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import Navbar from './components/Navbar.jsx'
import StatsBar from './components/StatsBar.jsx'
import ISSMap from './components/ISSMap.jsx'
import ISSInfo from './components/ISSInfo.jsx'
import SpeedChart from './components/SpeedChart.jsx'
import NewsSection from './components/NewsSection.jsx'
import Chatbot from './components/Chatbot.jsx'
import Toast from './components/Toast.jsx'

const ISS_URL = '/api/iss'
const ASTROS_URL = '/api/astros'
const NEWS_URL = '/api/news'
const GEOCODE_BASE = 'https://nominatim.openstreetmap.org/reverse'
const MAX_POSITIONS = 15
const MAX_SPEED_POINTS = 30
const CACHE_TTL = 15 * 60 * 1000

const initialTheme = localStorage.getItem('orbit_theme') || 'dark'
const initialChatHistory = JSON.parse(localStorage.getItem('orbit_chat_history') || '[]')

const initialAppState = {
  issPositions: [],
  issSpeed: 0,
  issLocation: 'Acquiring signal...',
  astronauts: [],
  news: {},
  chatHistory: initialChatHistory.slice(-30),
  theme: initialTheme,
}

function haversineDistanceKm(a, b) {
  const earthRadius = 6371
  const toRadians = (value) => (Number(value) * Math.PI) / 180
  const dLat = toRadians(b.lat - a.lat)
  const dLon = toRadians(b.lon - a.lon)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2

  return 2 * earthRadius * Math.asin(Math.sqrt(h))
}

function calculateSpeed(previous, current) {
  if (!previous || !current || previous.timestamp === current.timestamp) return 0
  const distance = haversineDistanceKm(previous, current)
  const hours = (current.timestamp - previous.timestamp) / 3600000
  return hours > 0 ? distance / hours : 0
}

function getReadableLocation(address) {
  if (!address) return 'Over Ocean'
  return (
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state ||
    address.country ||
    'Over Ocean'
  )
}

function App() {
  const [appState, setAppState] = useState(initialAppState)
  const [activeCategory, setActiveCategory] = useState('general')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsError, setNewsError] = useState('')
  const [issError, setIssError] = useState('')
  const [astroError, setAstroError] = useState('')
  const [toasts, setToasts] = useState([])
  const [speedHistory, setSpeedHistory] = useState([])
  const lastGeocodeAt = useRef(0)

  useEffect(() => {
    document.documentElement.dataset.theme = appState.theme
    localStorage.setItem('orbit_theme', appState.theme)
  }, [appState.theme])

  useEffect(() => {
    localStorage.setItem('orbit_chat_history', JSON.stringify(appState.chatHistory.slice(-30)))
  }, [appState.chatHistory])

  const showToast = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, type }])
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  const renderISSStats = useCallback((updater) => {
    setAppState((current) => (typeof updater === 'function' ? updater(current) : { ...current, ...updater }))
  }, [])

  const reverseGeocode = useCallback(async (position) => {
    const now = Date.now()
    if (now - lastGeocodeAt.current < 30000) return null
    lastGeocodeAt.current = now

    try {
      const { data } = await axios.get(GEOCODE_BASE, {
        params: { lat: position.lat, lon: position.lon, format: 'json' },
      })
      return getReadableLocation(data?.address)
    } catch (error) {
      console.warn('Reverse geocode failed', error)
      return null
    }
  }, [])

  const fetchISS = useCallback(async () => {
    try {
      const { data } = await axios.get(ISS_URL)
      const currentPosition = {
        lat: Number(data.iss_position.latitude),
        lon: Number(data.iss_position.longitude),
        timestamp: Number(data.timestamp) * 1000,
      }

      let latestSpeed = 0
      renderISSStats((current) => {
        const previous = current.issPositions.at(-1)
        latestSpeed = calculateSpeed(previous, currentPosition) || current.issSpeed
        return {
          ...current,
          issPositions: [...current.issPositions, currentPosition].slice(-MAX_POSITIONS),
          issSpeed: latestSpeed,
        }
      })

      setSpeedHistory((current) => {
        const point = {
          time: new Date(currentPosition.timestamp).toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }),
          speed: Number(latestSpeed.toFixed(2)),
        }
        return [...current, point].slice(-MAX_SPEED_POINTS)
      })

      const location = await reverseGeocode(currentPosition)
      if (location) renderISSStats({ issLocation: location })
      setIssError('')
      console.log('ISS fetch success', currentPosition)
    } catch (error) {
      setIssError('Unable to fetch the live ISS position.')
      showToast('ISS tracking update failed', 'error')
      console.error('ISS fetch failed', error)
    }
  }, [renderISSStats, reverseGeocode, showToast])

  const fetchAstronauts = useCallback(async () => {
    try {
      const { data } = await axios.get(ASTROS_URL)
      renderISSStats({ astronauts: data.people || [] })
      setAstroError('')
    } catch (error) {
      setAstroError('Unable to load people in space.')
      showToast('Astronaut roster failed to load', 'error')
      console.error('Astronaut fetch failed', error)
    }
  }, [renderISSStats, showToast])

  const renderNewsGrid = useCallback((category, articles) => {
    setAppState((current) => ({
      ...current,
      news: {
        ...current.news,
        [category]: articles,
      },
    }))
  }, [])

  const fetchNews = useCallback(
    async ({ category = activeCategory, search = '', force = false } = {}) => {
      const cacheKey = `gnews_cache_${category}`
      if (!search && !force) {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null')
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          console.log('cache hit', cacheKey)
          renderNewsGrid(category, cached.data)
          showToast('Loaded cached headlines', 'info')
          return
        }
      }

      setNewsLoading(true)
      setNewsError('')
      try {
        const { data } = await axios.get(NEWS_URL, {
          params: {
            q: search || undefined,
            category: search ? undefined : category,
          },
        })
        const articles = data.articles || []
        renderNewsGrid(category, articles)
        if (!search) localStorage.setItem(cacheKey, JSON.stringify({ data: articles, timestamp: Date.now() }))
        showToast('News refreshed', 'success')
      } catch (error) {
        setNewsError('Unable to load news headlines.')
        showToast('News request failed', 'error')
        console.error('News fetch failed', error)
      } finally {
        setNewsLoading(false)
      }
    },
    [activeCategory, renderNewsGrid, showToast],
  )

  useEffect(() => {
    const timeout = setTimeout(fetchISS, 0)
    const interval = setInterval(fetchISS, 15000)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [fetchISS])

  useEffect(() => {
    const timeout = setTimeout(fetchAstronauts, 0)
    return () => clearTimeout(timeout)
  }, [fetchAstronauts])

  useEffect(() => {
    const timeout = setTimeout(() => fetchNews({ category: activeCategory }), 0)
    return () => clearTimeout(timeout)
  }, [activeCategory, fetchNews])

  const latestPosition = appState.issPositions.at(-1)
  const activeNews = useMemo(() => {
    const articles = appState.news[activeCategory] || []
    const sorted = [...articles].sort((a, b) => {
      if (sortBy === 'source') return (a.source?.name || '').localeCompare(b.source?.name || '')
      return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
    })
    return sorted
  }, [activeCategory, appState.news, sortBy])

  const distributionData = useMemo(
    () =>
      Object.entries(appState.news).reduce((acc, [category, articles]) => {
        acc[category] = articles.length
        return acc
      }, {}),
    [appState.news],
  )

  const dashboardData = useMemo(
    () => ({
      lat: latestPosition?.lat,
      lon: latestPosition?.lon,
      speed: appState.issSpeed,
      locationName: appState.issLocation,
      astronauts: appState.astronauts,
      newsTitles: activeNews.map((article) => article.title).slice(0, 10),
    }),
    [activeNews, appState.astronauts, appState.issLocation, appState.issSpeed, latestPosition],
  )

  return (
    <div className="app-shell">
      <Navbar
        theme={appState.theme}
        onToggleTheme={() =>
          renderISSStats((current) => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }))
        }
      />
      <main className="dashboard">
        <StatsBar speed={appState.issSpeed} peopleCount={appState.astronauts.length} />

        <section className="main-grid">
          <div className="left-column">
            {issError ? <ErrorCard message={issError} onRetry={fetchISS} /> : null}
            <ISSMap positions={appState.issPositions} theme={appState.theme} />
            <SpeedChart data={speedHistory} theme={appState.theme} />
          </div>

          <div className="right-column">
            <ISSInfo
              position={latestPosition}
              speed={appState.issSpeed}
              locationName={appState.issLocation}
              count={appState.issPositions.length}
              astronauts={appState.astronauts}
              error={astroError}
              onRetry={fetchAstronauts}
            />
          </div>
        </section>

        <NewsSection
          activeCategory={activeCategory}
          articles={activeNews}
          distributionData={distributionData}
          error={newsError}
          loading={newsLoading}
          query={query}
          sortBy={sortBy}
          onCategoryChange={setActiveCategory}
          onDistributionSelect={setActiveCategory}
          onQueryChange={setQuery}
          onRefresh={() => fetchNews({ category: activeCategory, search: query.trim(), force: true })}
          onRetry={() => fetchNews({ category: activeCategory, search: query.trim(), force: true })}
          onSearch={(event) => {
            event.preventDefault()
            fetchNews({ category: activeCategory, search: query.trim(), force: true })
          }}
          onSortChange={setSortBy}
        />
      </main>

      <Chatbot
        appState={appState}
        dashboardData={dashboardData}
        renderChatMessage={(messages) =>
          renderISSStats((current) => ({ ...current, chatHistory: messages.slice(-30) }))
        }
      />
      <Toast toasts={toasts} />
    </div>
  )
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="error-card">
      <span>{message}</span>
      <button type="button" className="ghost-button" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

export default App
