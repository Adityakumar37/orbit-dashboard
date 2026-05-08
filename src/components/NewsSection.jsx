import DistributionChart from './DistributionChart.jsx'
import NewsCard from './NewsCard.jsx'

const categories = ['general', 'technology', 'science', 'health', 'sports']

function NewsSection({
  activeCategory,
  articles,
  distributionData,
  error,
  loading,
  query,
  sortBy,
  onCategoryChange,
  onDistributionSelect,
  onQueryChange,
  onRefresh,
  onRetry,
  onSearch,
  onSortChange,
}) {
  return (
    <section className="news-section">
      <div className="news-header">
        <div className="section-title">
          <h2>📰 LATEST NEWS</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <form className="search-bar" onSubmit={onSearch}>
        <span>⌕</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search headlines..."
          aria-label="Search headlines"
        />
      </form>

      <div className="news-controls">
        <div className="sort-row">
          <span>Sort by:</span>
          <button type="button" className={sortBy === 'date' ? 'active' : ''} onClick={() => onSortChange('date')}>
            Date
          </button>
          <button
            type="button"
            className={sortBy === 'source' ? 'active' : ''}
            onClick={() => onSortChange('source')}
          >
            Source
          </button>
        </div>
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              type="button"
              className={activeCategory === category ? 'active' : ''}
              key={category}
              onClick={() => onCategoryChange(category)}
            >
              {category[0].toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <DistributionChart distributionData={distributionData} onSelect={onDistributionSelect} />

      {error ? (
        <div className="error-card">
          <span>{error}</span>
          <button type="button" className="ghost-button" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="news-grid">
        {loading
          ? Array.from({ length: 6 }, (_, index) => <div className="skeleton-card" key={index} />)
          : articles.map((article) => (
              <NewsCard
                article={article}
                highlighted={article.source?.name?.toLowerCase().includes(activeCategory)}
                key={article.url || article.title}
              />
            ))}
      </div>
    </section>
  )
}

export default NewsSection
