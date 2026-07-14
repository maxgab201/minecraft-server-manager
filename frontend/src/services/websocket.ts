export type WSMessageHandler = (data: string) => void
export type WSCloseHandler = (code: number, reason: string) => void

export class WebSocketService {
  private ws: WebSocket | null = null
  private url: string = ''
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 1000
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private messageHandlers: WSMessageHandler[] = []
  private closeHandlers: WSCloseHandler[] = []
  private intentionalClose: boolean = false

  connect(sessionId: string): void {
    this.intentionalClose = false
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)
    const token = match ? match[1] : ''
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    this.url = `${protocol}//${host}/ws/terminal?token=${token}&sessionId=${sessionId}`
    this.createConnection()
  }

  private createConnection(): void {
    if (this.ws) {
      this.ws.onclose = null
      this.ws.onmessage = null
      this.ws.onerror = null
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close()
      }
    }

    try {
      this.ws = new WebSocket(this.url)
    } catch {
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
    }

    this.ws.onmessage = (event: MessageEvent) => {
      const data = typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data)
      for (const handler of this.messageHandlers) {
        handler(data)
      }
    }

    this.ws.onclose = (event: CloseEvent) => {
      for (const handler of this.closeHandlers) {
        handler(event.code, event.reason)
      }
      if (!this.intentionalClose) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = () => {
      if (this.ws?.readyState === WebSocket.CLOSED || this.ws?.readyState === WebSocket.CLOSING) {
        this.scheduleReconnect()
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000)
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => {
      this.createConnection()
    }, delay)
  }

  send(data: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    }
  }

  sendBinary(data: ArrayBuffer): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    }
  }

  onMessage(handler: WSMessageHandler): () => void {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
    }
  }

  onClose(handler: WSCloseHandler): () => void {
    this.closeHandlers.push(handler)
    return () => {
      this.closeHandlers = this.closeHandlers.filter((h) => h !== handler)
    }
  }

  disconnect(): void {
    this.intentionalClose = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectAttempts = 0
    if (this.ws) {
      this.ws.onclose = null
      this.ws.onmessage = null
      this.ws.onerror = null
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Intentional disconnect')
      }
      this.ws = null
    }
    this.messageHandlers = []
    this.closeHandlers = []
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  get connectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }
}

export const wsService = new WebSocketService()
