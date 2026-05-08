import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const colors = ['#4f8ef7', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

function DistributionChart({ distributionData, onSelect }) {
  const categories = Object.keys(distributionData)
  if (categories.length <= 1) {
    return <div className="distribution-empty">Load more categories to see distribution</div>
  }

  return (
    <div className="distribution-chart">
      <Doughnut
        data={{
          labels: categories.map((category) => category[0].toUpperCase() + category.slice(1)),
          datasets: [
            {
              data: categories.map((category) => distributionData[category]),
              backgroundColor: colors,
              borderColor: 'rgba(255,255,255,0.08)',
              borderWidth: 2,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          onClick: (_, elements) => {
            const first = elements[0]
            if (first) onSelect(categories[first.index])
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: 'rgb(148, 163, 184)', boxWidth: 10, padding: 14 },
            },
          },
        }}
      />
    </div>
  )
}

export default DistributionChart
