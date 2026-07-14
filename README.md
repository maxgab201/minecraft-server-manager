# Minecraft Server Manager

Modern web application for **remotely managing a Minecraft server** via SSH.

![Version](https://img.shields.io/badge/version-1.0.0-emerald)
![License](https://img.shields.io/badge/license-MIT-blue)

**Built with:** React • TypeScript • Vite • TailwindCSS • Framer Motion • Express • ssh2 • xterm.js

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Deployment](#deployment)
  - [Docker (Recommended)](#docker-recommended)
  - [Manual Setup (Linux VM)](#manual-setup-linux-vm)
  - [Vercel + Reverse Proxy](#vercel--reverse-proxy)
- [Security](#security)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Features

### 🔐 SSH-Only Authentication
- No web app users or passwords — only SSH private key authentication
- Private keys **never stored on disk** — kept in memory only during the session
- Optional passphrase support
- Session timeout (30 min inactivity auto-disconnect)

### 🖥️ Web Terminal
- Full xterm.js terminal with colors, copy/paste, scroll, resize
- **Directory confinement** — shell restricted to `/opt/minecraft/server`
- Blocks dangerous commands: `sudo`, `su`, `cd /`, `cd ..`, path traversal, etc.
- Real-time bidirectional communication via WebSocket
- Command history (up/down arrows)

### ⚡ Quick Actions
One-click buttons for common server tasks:
| Action | Description |
|--------|-------------|
| ▶ Start | Start Minecraft server |
| ■ Stop | Graceful server shutdown |
| ⟳ Restart | Full server restart |
| 💾 Save | Force world save |
| 👥 Players | List online players |
| 📊 TPS | Server TPS |
| 💾 Memory | RAM usage |
| 📝 Logs | View latest logs |
| 🧹 Clear | Clear terminal |
| 📥 Download | Download latest.log |

### 📊 Real-Time Status
- Server online/offline indicator
- CPU usage
- RAM usage (used / max)
- TPS with color coding (green >18, amber 15-18, red <15)
- Player count
- Uptime
- Minecraft version & server type (Fabric/Vanilla/Paper)
- Port and IP

### 📋 Advanced Log Viewer
- Color-coded log lines (INFO/WARN/ERROR)
- Auto-scroll with pause
- Text search with highlighting
- Filter by log level
- Copy single lines or entire log
- Download latest.log
- Virtual scrolling for performance

### 🎨 Design
- Dark glassmorphism UI inspired by Vercel, Railway, Cursor, Warp
- Smooth animations with Framer Motion
- Fully responsive (mobile, tablet, desktop)
- Notification system with elegant toast messages

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Terminal  │  │   Logs   │  │  Status  │  │ Actions  │  │
│  └─────┬────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│        │             │             │             │         │
│  ┌─────┴─────────────┴─────────────┴─────────────┴─────┐  │
│  │              React (Vite + TypeScript)              │  │
│  │           Zustand • Axios • Framer Motion           │  │
│  └───────────────────────┬─────────────────────────────┘  │
│                          │                                 │
│                    HTTP / WebSocket                        │
└──────────────────────────┼─────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────┐
│            ┌─────────────┴─────────────┐                   │
│            │    Express (Node.js)      │                   │
│            │  JWT Auth Middleware      │                   │
│            │  Command Validator        │                   │
│            │  Rate Limiter             │                   │
│            └─────────────┬─────────────┘                   │
│                          │                                 │
│            ┌─────────────┴─────────────┐                   │
│            │    SSH2 (ssh2 library)    │                   │
│            │  Session Manager          │                   │
│            │  In-memory sessions       │                   │
│            └─────────────┬─────────────┘                   │
│                          │                                 │
│                          ▼                                 │
│            ┌──────────────────────────┐                    │
│            │  /opt/minecraft/server   │                    │
│            │  (Minecraft Server VM)   │                    │
│            └──────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- **Node.js** 18+ (for development)
- **npm** 9+
- **A remote Linux server** running your Minecraft server at `/opt/minecraft/server`
- **SSH access** to that server with a valid key pair

---

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url> minecraft-manager
cd minecraft-manager

# Install all dependencies (root + backend + frontend)
npm run install:all
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your settings
```

### 3. Run in Development

```bash
# Start both backend and frontend concurrently
npm run dev

# Or individually:
npm run dev:backend   # Backend on :3001
npm run dev:frontend  # Frontend on :5173
```

Open **http://localhost:5173** in your browser.

### 4. Build for Production

```bash
npm run build
```

---

## Configuration

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `JWT_SECRET` | *(required)* | Secret for signing JWTs |
| `JWT_EXPIRY` | `15m` | JWT token expiry |
| `SERVER_DIR` | `/opt/minecraft/server` | Minecraft server directory |
| `MAX_SESSION_IDLE` | `1800000` | Session idle timeout (ms) |
| `RATE_LIMIT_WINDOW` | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

### Server Preparation

On your Minecraft server, ensure:
1. The server runs at `/opt/minecraft/server/`
2. Your SSH user has access to this directory
3. The server can be started with: `java -Xms2G -Xmx4G -jar server.jar nogui`
4. `screen` is installed for background server management

---

## Deployment

### Docker (Recommended)

```bash
# Build and start
docker compose up -d --build

# Or with custom environment
JWT_SECRET=your-strong-secret docker compose up -d --build
```

The app will be available on **port 80**.

### Manual Setup (Linux VM)

```bash
# 1. Build backend
cd backend
npm run build

# 2. Build frontend
cd ../frontend
npm run build

# 3. Serve frontend with nginx
# Copy frontend/dist/* to your web server directory

# 4. Run backend with process manager
cd ../backend
npm install -g pm2
pm2 start dist/backend/src/app.js --name mc-manager
pm2 save
pm2 startup
```

### Nginx Reverse Proxy

The included `nginx/default.conf` provides:
- Static file serving for the frontend
- API proxy to the backend
- WebSocket proxy for real-time terminal
- Security headers
- Gzip compression

### Vercel + Backend on VM

1. Deploy the frontend to Vercel:
   - Set root directory to `frontend/`
   - Build command: `npm run build`
   - Output directory: `dist`

2. Run the backend on your VM:
   ```bash
   cd backend
   npm run build
   pm2 start dist/backend/src/app.js
   ```

3. Set `CORS_ORIGIN` to your Vercel domain in the backend `.env`

---

## Security

### Design Principles

| Principle | Implementation |
|-----------|---------------|
| **No stored keys** | Private keys are parsed in memory only, never written to disk |
| **Directory confinement** | Shell is restricted to `/opt/minecraft/server` |
| **Command validation** | Every command is validated before execution |
| **Blocked commands** | `sudo`, `su`, `cd /`, `cd ..`, `ssh`, path traversal |
| **Session isolation** | Each session is isolated in a unique SSH connection |
| **Auto-timeout** | Sessions expire after 30 minutes of inactivity |
| **Rate limiting** | 100 requests per 15 minutes per IP |
| **JWT auth** | Short-lived tokens (15 min) with HttpOnly cookies |
| **No persistent sessions** | All session data in memory, cleaned on disconnect |

### What Gets Blocked

- `cd /`, `cd /etc`, `cd /var`, `cd ~`
- `cd ..` (and `cd ../..` etc.)
- Any absolute path outside `/opt/minecraft/server`
- `sudo`, `su`, `ssh`, `scp`, `rsync`, `telnet`, `rlogin`
- `rm -rf /`, `chmod /`, `chown`, `mount`, `umount`
- Path traversal with `..`
- `!` (bang) commands

---

## API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/connect` | POST | Authenticate via SSH and create session |
| `/api/auth/disconnect` | POST | Terminate session |
| `/api/auth/status` | GET | Check session status |

### Terminal

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ws/terminal` | WebSocket | Real-time terminal I/O |
| `/api/terminal/resize` | POST | Resize terminal |
| `/api/terminal/execute` | POST | Execute single command |

### Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | Get server status |

### Logs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/logs` | GET | Get log content |
| `/api/logs/search` | GET | Search logs |
| `/api/logs/download` | GET | Download latest.log |

### Shortcuts

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/shortcuts` | GET | List available shortcuts |
| `/api/shortcuts/execute` | POST | Execute a shortcut action |

---

## Project Structure

```
minecraft-manager/
├── frontend/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # Base components (Button, Card, Input...)
│   │   │   ├── layout/          # Sidebar, Header, DashboardLayout
│   │   │   ├── terminal/        # xterm.js terminal wrapper
│   │   │   ├── logs/            # Log viewer components
│   │   │   ├── status/          # Server status components
│   │   │   └── shortcuts/       # Quick action buttons
│   │   ├── pages/               # Login, Dashboard pages
│   │   ├── hooks/               # Custom hooks (useAuth, useTerminal...)
│   │   ├── services/            # API client, WebSocket service
│   │   ├── stores/              # Zustand state stores
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Utilities
│   │   └── styles/              # Global CSS
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── backend/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/              # Environment configuration
│   │   ├── controllers/         # Route handlers
│   │   ├── services/            # Business logic (SSH, validation...)
│   │   ├── middleware/           # Auth, rate limiting
│   │   ├── routes/              # API routes
│   │   ├── websocket/           # WebSocket handlers
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utilities
│   ├── package.json
│   └── tsconfig.json
├── shared/                      # Shared types & constants
│   ├── types/                   # SSH, terminal, logs, status, shortcuts
│   └── constants/               # Command mappings
├── nginx/                       # Nginx configuration
├── docker-compose.yml           # Development Docker setup
├── docker-compose.prod.yml      # Production Docker setup
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

---

## Troubleshooting

### Connection fails

1. Verify the SSH credentials are correct
2. Ensure the private key format is valid (PEM or OpenSSH)
3. Check that the SSH server is running on the target host
4. Verify the SSH user has access to `/opt/minecraft/server`

### Terminal shows "Access denied"

The terminal is restricted to `/opt/minecraft/server`. Commands that try to navigate outside this directory are blocked.

### Build errors

```bash
# Clear dependencies and rebuild
rm -rf backend/node_modules frontend/node_modules node_modules
npm run install:all
npm run build
```

---

## License

MIT

---

*Built with ❤️ for Minecraft server administrators.*
