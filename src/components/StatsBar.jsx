function StatsBar({ speed, peopleCount }) {
  const cards = [
    { label: 'ISS Speed', value: `${Number(speed || 0).toFixed(2)}`, unit: 'km/h', tone: 'cyan' },
    { label: 'ISS Altitude', value: '~408', unit: 'km', tone: 'blue' },
    { label: 'People in Space', value: peopleCount, unit: 'active', tone: 'purple' },
  ]

  return (
    <section className="stats-bar">
      {cards.map((card) => (
        <article className={`stat-card ${card.tone}`} key={card.label}>
          <span className="stat-label">{card.label}</span>
          <strong className="stat-value" key={`${card.label}-${card.value}`}>
            {card.value}
          </strong>
          <span className="stat-unit">{card.unit}</span>
        </article>
      ))}
    </section>
  )
}

export default StatsBar
