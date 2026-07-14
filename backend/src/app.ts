import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { CONFIG } from './config/env.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import { sessionManager } from './services/sessionManager.js';
import { createTerminalWebSocket } from './websocket/terminalWs.js';

import authRoutes from './routes/auth.js';
import terminalRoutes from './routes/terminal.js';
import statusRoutes from './routes/status.js';
import logsRoutes from './routes/logs.js';
import shortcutsRoutes from './routes/shortcuts.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: CONFIG.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);
app.use(morgan('short'));
app.use(express.json({ limit: '5mb' }));
app.use(apiRateLimit);

app.use('/api/auth', authRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/shortcuts', shortcutsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    sessions: sessionManager.getSessionCount(),
  });
});

const httpServer = createServer(app);
const wss = createTerminalWebSocket(httpServer);

function gracefulShutdown() {
  sessionManager.destroy();

  wss.close(() => {
    httpServer.close(() => {
      process.exit(0);
    });
  });

  setTimeout(() => {
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

httpServer.listen(CONFIG.PORT, () => {
  console.log(`Minecraft Manager backend listening on port ${CONFIG.PORT}`);
});

export { app, httpServer };
