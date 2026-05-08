import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

const HF_URL = 'https://router.huggingface.co/v1/chat/completions'

function buildSystemPrompt(data) {
  const namesList = data.astronauts.map((person) => person.name).join(', ') || 'No roster loaded'
  const newsList = data.newsTitles.map((title, index) => `${index + 1}. ${title}`).join('\n') || 'No news loaded'

  return `You are Orbit AI, a dashboard assistant. You can ONLY answer questions about the current dashboard data provided below. Refuse all other questions politely.

Current Dashboard Data:
- ISS Position: ${data.lat ?? 'unknown'}, ${data.lon ?? 'unknown'}
- ISS Speed: ${Number(data.speed || 0).toFixed(2)} km/h
- ISS Location: ${data.locationName}
- People in Space (${data.astronauts.length}): ${namesList}
- Latest News Headlines:
${newsList}

If asked anything outside this data, say: "I can only answer questions about the ISS and news shown on this dashboard."`
}

function Chatbot({ appState, dashboardData, renderChatMessage }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const hfToken = import.meta.env.VITE_HF_TOKEN

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [appState.chatHistory, typing, open])

  async function sendMessage(event) {
    event.preventDefault()
    const text = input.trim()
    if (!text || typing) return

    const nextMessages = [...appState.chatHistory, { role: 'user', content: text }]
    renderChatMessage(nextMessages)
    setInput('')
    setTyping(true)

    try {
      const { data } = await axios.post(
        HF_URL,
        {
          model: 'mistralai/Mistral-7B-Instruct-v0.2:featherless-ai',
          messages: [
            { role: 'system', content: buildSystemPrompt(dashboardData) },
            ...nextMessages.map((message) => ({ role: message.role, content: message.content })),
          ],
        },
        { headers: { Authorization: `Bearer ${hfToken}` } },
      )
      const content = data.choices?.[0]?.message?.content || 'I could not produce a response this time.'
      renderChatMessage([...nextMessages, { role: 'assistant', content }])
      console.log('chat response received')
    } catch (error) {
      renderChatMessage([
        ...nextMessages,
        {
          role: 'assistant',
          content: 'I can only answer questions about the ISS and news shown on this dashboard.',
        },
      ])
      console.error('Chat request failed', error)
    } finally {
      setTyping(false)
    }
  }

  function clearChat() {
    localStorage.removeItem('orbit_chat_history')
    renderChatMessage([])
  }

  return (
    <>
      {open ? (
        <aside className="chat-window">
          <div className="chat-header">
            <strong>🤖 Orbit AI</strong>
            <div>
              <button type="button" onClick={clearChat}>
                Clear Chat
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
                ×
              </button>
            </div>
          </div>

          <div className="messages-area">
            {appState.chatHistory.map((message, index) => (
              <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}>
                {message.role === 'assistant' ? <span className="bot-avatar">🛸</span> : null}
                <p className="message-bubble">{message.content}</p>
              </div>
            ))}
            {typing ? (
              <div className="message-row assistant">
                <span className="bot-avatar">🛸</span>
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={sendMessage}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about ISS or news..." />
            <button type="submit">Send</button>
          </form>
        </aside>
      ) : null}

      <button type="button" className="chat-fab" onClick={() => setOpen((value) => !value)} aria-label="Open Orbit AI">
        🤖
      </button>
    </>
  )
}

export default Chatbot
