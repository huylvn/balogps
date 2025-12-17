const db = require('../database/db');

async function createChild(req, res) {
  try {
    const { name } = req.body;
    const userId = req.user.userId;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await db.query(
      'INSERT INTO children (user_id, name) VALUES ($1, $2) RETURNING *',
      [userId, name]
    );
    
    // Initialize geofence state
    await db.query(
      'INSERT INTO geofence_state (child_id, last_safe_state) VALUES ($1, $2)',
      [result.rows[0].id, 'UNKNOWN']
    );
    
    res.status(201).json({ child: result.rows[0] });
  } catch (error) {
    console.error('Create child error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getChildren(req, res) {
  try {
    const userId = req.user.userId;
    
    const result = await db.query(
      `SELECT c.*, 
              gs.last_safe_state, 
              gs.last_zone_id,
              gs.last_ts,
              lp.lat as last_lat, 
              lp.lng as last_lng,
              lp.ts as last_location_ts,
              lp.accuracy_m,
              lp.speed_mps
       FROM children c
       LEFT JOIN geofence_state gs ON c.id = gs.child_id
       LEFT JOIN LATERAL (
         SELECT lat, lng, ts, accuracy_m, speed_mps
         FROM location_points
         WHERE child_id = c.id
         ORDER BY ts DESC
         LIMIT 1
       ) lp ON true
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );
    
    res.json({ children: result.rows });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getChild(req, res) {
  try {
    const { child_id } = req.params;
    const userId = req.user.userId;
    
    const result = await db.query(
      `SELECT c.*, 
              gs.last_safe_state, 
              gs.last_zone_id,
              gs.last_ts,
              lp.lat as last_lat, 
              lp.lng as last_lng,
              lp.ts as last_location_ts,
              lp.accuracy_m,
              lp.speed_mps
       FROM children c
       LEFT JOIN geofence_state gs ON c.id = gs.child_id
       LEFT JOIN LATERAL (
         SELECT lat, lng, ts, accuracy_m, speed_mps
         FROM location_points
         WHERE child_id = c.id
         ORDER BY ts DESC
         LIMIT 1
       ) lp ON true
       WHERE c.id = $1 AND c.user_id = $2`,
      [child_id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    res.json({ child: result.rows[0] });
  } catch (error) {
    console.error('Get child error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateChild(req, res) {
  try {
    const { child_id } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;
    
    // Check ownership
    const checkResult = await db.query(
      'SELECT id FROM children WHERE id = $1 AND user_id = $2',
      [child_id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    const result = await db.query(
      'UPDATE children SET name = $1 WHERE id = $2 RETURNING *',
      [name, child_id]
    );
    
    res.json({ child: result.rows[0] });
  } catch (error) {
    console.error('Update child error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function deleteChild(req, res) {
  try {
    const { child_id } = req.params;
    const userId = req.user.userId;
    
    const result = await db.query(
      'DELETE FROM children WHERE id = $1 AND user_id = $2 RETURNING id',
      [child_id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    res.json({ message: 'Child deleted successfully' });
  } catch (error) {
    console.error('Delete child error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createChild,
  getChildren,
  getChild,
  updateChild,
  deleteChild,
};
