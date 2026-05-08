function ISSInfo({ position, speed, locationName, count, astronauts, error, onRetry }) {
  return (
    <section className="panel info-panel">
      <div className="section-title">
        <h2>🛰️ ISS TELEMETRY</h2>
      </div>

      <div className="telemetry-grid">
        <Telemetry label="Latitude" value={position ? position.lat.toFixed(6) : 'Waiting...'} />
        <Telemetry label="Longitude" value={position ? position.lon.toFixed(6) : 'Waiting...'} />
        <Telemetry label="Speed" value={`${Number(speed || 0).toFixed(2)} km/h`} />
        <Telemetry label="Location" value={locationName || 'Over Ocean'} />
        <Telemetry
          label="Last Updated"
          value={
            position
              ? new Date(position.timestamp).toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' })
              : 'Waiting...'
          }
        />
        <Telemetry label="Positions Tracked" value={`${count} / 15`} />
      </div>

      <div className="astronaut-card">
        <div className="astronaut-total">
          <span>👨‍🚀</span>
          <strong>{astronauts.length}</strong>
          <small>People in Space</small>
        </div>
        {error ? (
          <div className="inline-error">
            <span>{error}</span>
            <button type="button" onClick={onRetry}>
              Retry
            </button>
          </div>
        ) : (
          <div className="astronaut-list">
            {astronauts.map((person) => (
              <span className="astronaut-pill" key={`${person.name}-${person.craft}`}>
                {person.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Telemetry({ label, value }) {
  return (
    <div className="telemetry-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default ISSInfo
