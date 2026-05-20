import { useState, useRef, useEffect } from 'react'
import styles from './LessonAIChat.module.css'

const OPENROUTER_API_KEY =
  import.meta.env.VITE_OPENROUTER_API_KEY

function LessonAIChat({
  lessonTitle,
  lessonTopic,
  lessonContent,
}) {
  const [isOpen, setIsOpen] = useState(false)

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi! 👋 I'm your AI tutor for **${lessonTitle}**. Ask me anything about this lesson — concepts, examples, or practice questions!`,
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({
        behavior: 'smooth',
      })

      inputRef.current?.focus()
    }
  }, [messages, isOpen])

  const sendMessage = async () => {
    const trimmed = input.trim()

    if (!trimmed || loading) return

    if (!OPENROUTER_API_KEY) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: '⚠️ OpenRouter API key missing. Check your .env file.',
        },
      ])
      return
    }

    const userMsg = {
      role: 'user',
      text: trimmed,
    }

    setMessages((prev) => [...prev, userMsg])

    setInput('')
    setLoading(true)

    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
             model: 'deepseek/deepseek-chat', 

            messages: [
              {
                role: 'system',
                content: `
You are a helpful AI tutor on the Seekhlo learning platform.

The student is studying:

Lesson: ${lessonTitle}
Topic: ${lessonTopic}

Lesson Content:
${lessonContent || 'No lesson content available.'}

Rules:
- Keep answers concise and educational.
- Use simple examples.
- If code is needed, wrap it in triple backticks.
- Redirect unrelated questions back to the lesson.
                `,
              },

              {
                role: 'user',
                content: trimmed,
              },
            ],
          }),
        }
      )

      const data = await response.json()

      console.log('OpenRouter Response:', data)

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            'Failed to generate response.'
        )
      }

      const aiText =
        data?.choices?.[0]?.message?.content ||
        'Sorry, I could not generate a response.'

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: aiText,
        },
      ])
    } catch (err) {
      console.error(err)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ ${err.message}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(
        /(`[^`]+`|\*\*[^*]+\*\*)/g
      )

      return (
        <span key={i}>
          {parts.map((part, j) => {
            if (
              part.startsWith('`') &&
              part.endsWith('`')
            ) {
              return (
                <code
                  key={j}
                  className={styles.inlineCode}
                >
                  {part.slice(1, -1)}
                </code>
              )
            }

            if (
              part.startsWith('**') &&
              part.endsWith('**')
            ) {
              return (
                <strong key={j}>
                  {part.slice(2, -2)}
                </strong>
              )
            }

            return part
          })}

          {i < text.split('\n').length - 1 && (
            <br />
          )}
        </span>
      )
    })
  }

  const renderMessage = (msg, i) => {
    const parts = msg.text.split(
      /(```[\s\S]*?```)/g
    )

    return (
      <div
        key={i}
        className={`${styles.msg} ${
          msg.role === 'user'
            ? styles.user
            : styles.ai
        }`}
      >
        {msg.role === 'assistant' && (
          <span className={styles.avatar}>🤖</span>
        )}

        <div className={styles.bubble}>
          {parts.map((part, j) => {
            if (
              part.startsWith('```') &&
              part.endsWith('```')
            ) {
              const code = part
                .replace(/^```\w*\n?/, '')
                .replace(/```$/, '')

              return (
                <pre
                  key={j}
                  className={styles.codeBlock}
                >
                  {code}
                </pre>
              )
            }

            return (
              <span key={j}>
                {renderText(part)}
              </span>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.fab} ${
          isOpen ? styles.fabClose : ''
        }`}
        onClick={() =>
          setIsOpen((open) => !open)
        }
        title={
          isOpen
            ? 'Close AI Tutor'
            : 'Ask AI Tutor'
        }
      >
        {isOpen ? '✕' : '🤖'}

        {!isOpen && (
          <span className={styles.fabLabel}>
            AI Tutor
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>🤖 AI Tutor</span>

            <span className={styles.lessonTag}>
              {lessonTitle}
            </span>
          </div>

          <div className={styles.messages}>
            {messages.map(renderMessage)}

            {loading && (
              <div
                className={`${styles.msg} ${styles.ai}`}
              >
                <span className={styles.avatar}>
                  🤖
                </span>

                <div
                  className={`${styles.bubble} ${styles.typing}`}
                >
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className={styles.inputRow}>
            <textarea
              ref={inputRef}
              className={styles.input}
              rows={1}
              placeholder="Ask a question about this lesson…"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={handleKey}
              disabled={loading}
            />

            <button
              type="button"
              className={styles.sendBtn}
              onClick={sendMessage}
              disabled={
                loading || !input.trim()
              }
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default LessonAIChat