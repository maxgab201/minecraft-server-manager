import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Send, MessageSquare, X } from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'chat' | 'system' | 'join' | 'leave'
  player?: string
  message: string
  timestamp: number
}

function generateMockMessages(): ChatMessage[] {
  return [
    {
      id: '1',
      type: 'system',
      message: 'Server started. Loading world...',
      timestamp: Date.now() - 120000,
    },
    {
      id: '2',
      type: 'join',
      player: 'Steve',
      message: 'Steve joined the game',
      timestamp: Date.now() - 90000,
    },
    {
      id: '3',
      type: 'chat',
      player: 'Steve',
      message: 'Hey everyone!',
      timestamp: Date.now() - 80000,
    },
    {
      id: '4',
      type: 'join',
      player: 'Alex',
      message: 'Alex joined the game',
      timestamp: Date.now() - 60000,
    },
    {
      id: '5',
      type: 'chat',
      player: 'Alex',
      message: 'morning! building the new spawn area?',
      timestamp: Date.now() - 40000,
    },
    {
      id: '6',
      type: 'chat',
      player: 'Steve',
      message: 'yeah, almost done with the castle walls',
      timestamp: Date.now() - 20000,
    },
  ]
}

const playerColors: Record<string, string> = {
  Steve: 'text-emerald-400',
  Alex: 'text-indigo-400',
}

interface ChatProps {
  onClose: () => void
}

export function Chat({ onClose }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(generateMockMessages)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = useCallback(() => {
    if (!input.trim()) return

    const newMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      type: 'chat',
      player: 'You',
      message: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, newMsg])
    setInput('')
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col h-full glass rounded-xl border border-white/5 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-medium text-text-primary">Server Chat</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-text-muted hover:text-text-primary rounded-md hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-sm bg-black/20">
        {messages.map((msg) => (
          <div key={msg.id} className="leading-relaxed">
            <span className="text-text-muted text-xs mr-2">[{formatTime(msg.timestamp)}]</span>
            {msg.type === 'chat' && msg.player ? (
              <>
                <span className={`font-medium ${playerColors[msg.player] || 'text-text-primary'}`}>
                  &lt;{msg.player}&gt;
                </span>
                <span className="text-text-primary ml-1">{msg.message}</span>
              </>
            ) : msg.type === 'join' ? (
              <span className="text-emerald-400/80">{msg.message}</span>
            ) : msg.type === 'leave' ? (
              <span className="text-red-400/80">{msg.message}</span>
            ) : (
              <span className="text-text-muted">{msg.message}</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-accent/40 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
