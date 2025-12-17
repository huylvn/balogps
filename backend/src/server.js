const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const childrenRoutes = require('./routes/children');
const zonesRoutes = require('./routes/zones');
const alertsRoutes = require('./routes/alerts');
const trackerRoutes = require('./routes/tracker');
const realtimeRoutes = require('./routes/realtime');

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend and tracker)
app.use(express.static(path.join(__dirname, '../../frontend/build')));
app.use(express.static(path.join(__dirname, '../../tracker')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/tracker', trackerRoutes);
app.use('/api/realtime', realtimeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve tracker.html for tracker route
app.get('/tracker.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../../tracker/tracker.html'));
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Try to load SSL certificate
let httpsServer = null;
const certPath = path.join(__dirname, '../ssl/server.crt');
const keyPath = path.join(__dirname, '../ssl/server.key');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  try {
    const httpsOptions = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    };
    
    httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`🔒 HTTPS Server running on port ${HTTPS_PORT}`);
      console.log(`📍 API: https://localhost:${HTTPS_PORT}/api`);
      console.log(`🌐 Frontend: https://localhost:${HTTPS_PORT}`);
      console.log(`📱 Tracker: https://localhost:${HTTPS_PORT}/tracker.html`);
    });
  } catch (error) {
    console.error('❌ Failed to start HTTPS server:', error.message);
    console.log('💡 Run: npm run generate-cert to create SSL certificate');
  }
} else {
  console.log('⚠️  SSL certificate not found');
  console.log('💡 Run: npm run generate-cert to create SSL certificate');
  console.log('📝 For production, use real SSL certificate (Let\'s Encrypt)');
}

// Also start HTTP server for development/backwards compatibility
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
  console.log(`🚀 HTTP Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`📱 Tracker: http://localhost:${PORT}/tracker.html`);
  if (!httpsServer) {
    console.log('\n⚠️  WARNING: Running without HTTPS - GPS may not work on mobile devices!');
  }
});

module.exports = app;
