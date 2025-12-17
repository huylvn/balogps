const crypto = require('crypto');
const db = require('../database/db');
const geofenceEngine = require('../services/geofenceEngine');
const sseService = require('../services/sseService');

async function ping(req, res) {
  try {
    const token = req.trackerToken;
    const { lat, lng, ts, accuracy_m, speed_mps } = req.body;
    
    if (!lat || !lng || !ts) {
      return res.status(400).json({ error: 'lat, lng, and ts are required' });
    }
    
    // Verify token and get child_id
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');
    
    const trackerResult = await db.query(
      'SELECT child_id FROM trackers WHERE token_hash = $1 AND status = $2',
      [token_hash, 'active']
    );
    
    if (trackerResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid tracker token' });
    }
    
    const child_id = trackerResult.rows[0].child_id;
    
    // Filter by accuracy if configured
    const MAX_ACCURACY = 50; // meters
    if (accuracy_m && accuracy_m > MAX_ACCURACY) {
      console.log(`Location ignored: accuracy ${accuracy_m}m > ${MAX_ACCURACY}m`);
      return res.json({ 
        status: 'ignored', 
        reason: 'accuracy_too_low',
        message: 'Location saved but not processed due to low accuracy'
      });
    }
    
    // Save location point
    await db.query(
      'INSERT INTO location_points (child_id, ts, lat, lng, accuracy_m, speed_mps) VALUES ($1, $2, $3, $4, $5, $6)',
      [child_id, ts, lat, lng, accuracy_m || null, speed_mps || null]
    );
    
    // Process geofence
    await geofenceEngine.processLocation(child_id, { lat, lng, ts, accuracy_m, speed_mps });
    
    // Notify parent via SSE
    sseService.sendEvent(child_id, {
      type: 'location_update',
      data: { child_id, lat, lng, ts, accuracy_m, speed_mps }
    });
    
    res.json({ status: 'ok', message: 'Location received' });
  } catch (error) {
    console.error('Tracker ping error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  ping,
};
