const crypto = require('crypto');
const os = require('os');
const db = require('../database/db');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  // Prioritize WiFi and Ethernet interfaces
  for (const name of Object.keys(interfaces)) {
    if (name.toLowerCase().includes('wi-fi') || 
        name.toLowerCase().includes('wireless') || 
        name.toLowerCase().includes('ethernet') ||
        name.toLowerCase().includes('en0') ||
        name.toLowerCase().includes('eth0')) {
      for (const iface of interfaces[name]) {
        // Skip internal/loopback and non-IPv4 addresses
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  
  // Fallback: get any non-internal IPv4 address
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return null;
}

async function createTrackerToken(req, res) {
  try {
    const { child_id } = req.params;
    const userId = req.user.userId;
    
    // Check ownership
    const checkResult = await db.query(
      'SELECT id FROM children WHERE id = $1 AND user_id = $2',
      [child_id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Delete old tracker if exists
    await db.query('DELETE FROM trackers WHERE child_id = $1', [child_id]);
    
    // Create new tracker
    await db.query(
      'INSERT INTO trackers (child_id, token_hash, status) VALUES ($1, $2, $3)',
      [child_id, token_hash, 'active']
    );
    
    // Generate tracker URL with local IP address
    let host = req.get('host');
    
    // If request comes from localhost, try to use actual local IP
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      const localIP = getLocalIPAddress();
      if (localIP) {
        // Replace localhost with actual IP, keep the port
        const port = host.includes(':') ? host.split(':')[1] : '3000';
        host = `${localIP}:${port}`;
      }
    }
    
    const trackerUrl = `${req.protocol}://${host}/tracker.html?token=${token}`;
    
    res.status(201).json({
      token,
      tracker_url: trackerUrl,
      message: 'Token will only be shown once. Save it securely.',
    });
  } catch (error) {
    console.error('Create tracker token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createTrackerToken,
};
