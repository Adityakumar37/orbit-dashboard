export default async function handler(req, res) {
  try {
    const response = await fetch('http://api.open-notify.org/astros.json')
    const data = await response.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json(data)
  } catch {
    res.status(500).json({ error: 'Failed to fetch astronaut data' })
  }
}
