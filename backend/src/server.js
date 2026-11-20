const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed Origins for CORS (Vercel production, local dev, custom)
const allowedOrigins = [
  'https://vibe-todo-gray.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : []),
];

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);

      // Check allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel deployment/preview subdomain
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // If user specified wildcard in environment variable
      if (process.env.CORS_ORIGIN === '*') {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Helper to inspect DB connectivity for health checks
const checkHealth = async () => {
  let dbStatus = 'disconnected';
  try {
    const start = Date.now();
    await db.query('SELECT 1');
    const latencyMs = Date.now() - start;
    dbStatus = `connected (${latencyMs}ms)`;
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  return {
    status: 'ok',
    service: 'vibe-todo-backend',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: dbStatus,
    environment: process.env.NODE_ENV || 'production',
  };
};

// 1. Root probe (Render default health check)
app.get('/', async (req, res) => {
  res.json({
    status: 'ok',
    service: 'vibe-todo-backend',
    docs: 'https://github.com/soumajitverse/vibe-todo',
    frontend: 'https://vibe-todo-gray.vercel.app',
    health: '/health',
  });
});

// 2. Dedicated health endpoints (/health and /api/health)
app.get(['/health', '/api/health'], async (req, res) => {
  try {
    const health = await checkHealth();
    res.json(health);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Vibe Todo Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
