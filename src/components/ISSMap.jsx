import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'

const tileLayers = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
}

const issIcon = L.divIcon({
  className: 'iss-div-icon',
  html: '<span class="iss-pulse"></span><span class="iss-emoji">🛸</span>',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
})

function FollowISS({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lon], map.getZoom(), { animate: true, duration: 1 })
    }
  }, [map, position])

  return null
}

function ThemedTiles({ theme }) {
  const map = useMap()
  const tileLayer = tileLayers[theme] || tileLayers.dark

  useEffect(() => {
    map.invalidateSize()
  }, [map, theme])

  return (
    <TileLayer
      key={`tiles-${theme}`}
      attribution={tileLayer.attribution}
      className={`map-tiles map-tiles-${theme}`}
      detectRetina
      maxZoom={19}
      url={tileLayer.url}
    />
  )
}

function ISSMap({ positions, theme }) {
  const latest = positions.at(-1)
  const segments = useMemo(
    () =>
      positions.slice(1).map((point, index) => ({
        points: [
          [positions[index].lat, positions[index].lon],
          [point.lat, point.lon],
        ],
        opacity: 0.25 + (index / Math.max(positions.length - 1, 1)) * 0.75,
        color: index > positions.length / 2 ? '#06b6d4' : '#8b5cf6',
      })),
    [positions],
  )

  return (
    <section className="panel map-panel">
      <MapContainer center={[0, 0]} zoom={3} minZoom={2} worldCopyJump className="iss-map">
        <ThemedTiles theme={theme} />
        {segments.map((segment, index) => (
          <Polyline
            color={segment.color}
            key={`${index}-${segment.opacity}`}
            opacity={segment.opacity}
            pathOptions={{ weight: 3 }}
            positions={segment.points}
          />
        ))}
        {latest ? <Marker icon={issIcon} position={[latest.lat, latest.lon]} /> : null}
        <FollowISS position={latest} />
      </MapContainer>
    </section>
  )
}

export default ISSMap
