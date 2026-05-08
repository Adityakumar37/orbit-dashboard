import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const glowPlugin = {
  id: 'glowLine',
  beforeDatasetDraw(chart) {
    const { ctx } = chart
    ctx.save()
    ctx.shadowColor = 'rgba(6, 182, 212, 0.55)'
    ctx.shadowBlur = 14
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  },
  afterDatasetDraw(chart) {
    chart.ctx.restore()
  },
}

function SpeedChart({ data, theme }) {
  const labels = data.map((point) => point.time)
  const values = data.map((point) => point.speed)

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: '#06b6d4',
        backgroundColor(context) {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return 'rgba(6, 182, 212, 0.25)'
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.3)')
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0)')
          return gradient
        },
        fill: true,
        pointRadius: 0,
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  }

  const gridColor = theme === 'dark' ? '#1e1e2e' : '#dde3f0'
  const textColor = theme === 'dark' ? '#94a3b8' : '#475569'

  return (
    <section className="panel chart-panel">
      <div className="section-title">
        <h2>ISS SPEED</h2>
      </div>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor, maxTicksLimit: 6 } },
            y: { grid: { color: gridColor }, ticks: { color: textColor }, beginAtZero: false },
          },
        }}
        plugins={[glowPlugin]}
      />
    </section>
  )
}

export default SpeedChart
