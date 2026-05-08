export default async function handler(req, res) {
  try {
    const { category = 'general', q } = req.query
    let url
    if (q) {
      url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&country=us&max=10&apikey=0293c762064973eb3e3c26adadddecbc`
    } else {
      url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=us&max=10&apikey=0293c762064973eb3e3c26adadddecbc`
    }
    const response = await fetch(url)
    const data = await response.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json(data)
  } catch {
    res.status(500).json({ error: 'Failed to fetch news' })
  }
}
