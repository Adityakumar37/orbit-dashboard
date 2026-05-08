import { useEffect, useState } from 'react'

function Navbar({ theme, onToggleTheme }) {
  const [utcTime, setUtcTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setUtcTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-icon">🛸</span>
        <span className="brand-text">ORBIT DASHBOARD</span>
      </div>

      <div className="utc-clock">
        {utcTime.toLocaleTimeString('en-US', {
          hour12: false,
          timeZone: 'UTC',
          timeZoneName: 'short',
        })}
      </div>

      <div className="nav-actions">
        <button type="button" className="icon-toggle" onClick={onToggleTheme} aria-label="Toggle color theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span className="live-badge">
          <span />
          LIVE
        </span>
      </div>
    </header>
  )
}

export default Navbar
