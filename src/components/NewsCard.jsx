function NewsCard({ article, highlighted }) {
  const published = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown date'

  return (
    <article className={`news-card ${highlighted ? 'highlighted' : ''}`}>
      <div className="news-image-wrap">
        {article.image ? (
          <img src={article.image} alt="" className="news-image" loading="lazy" />
        ) : (
          <div className="news-placeholder">📰</div>
        )}
        <span className="source-badge">{article.source?.name || 'News'}</span>
      </div>
      <div className="news-body">
        <h3>{article.title}</h3>
        <p className="meta">
          {article.author || 'Staff'} • {published}
        </p>
        <p className="description">{article.description || 'No description available.'}</p>
      </div>
      <div className="news-footer">
        <a href={article.url} target="_blank" rel="noreferrer" className="read-more">
          Read More →
        </a>
      </div>
    </article>
  )
}

export default NewsCard
