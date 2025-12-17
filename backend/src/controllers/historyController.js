const db = require('../database/db');

async function getLatestLocation(req, res) {
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
    
    const result = await db.query(
      `SELECT * FROM location_points 
       WHERE child_id = $1 
       ORDER BY ts DESC 
       LIMIT 1`,
      [child_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No location data' });
    }
    
    res.json({ location: result.rows[0] });
  } catch (error) {
    console.error('Get latest location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getLocationHistory(req, res) {
  try {
    const { child_id } = req.params;
    const { from, to, limit = 100 } = req.query;
    const userId = req.user.userId;
    
    // Check ownership
    const checkResult = await db.query(
      'SELECT id FROM children WHERE id = $1 AND user_id = $2',
      [child_id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    let query = 'SELECT * FROM location_points WHERE child_id = $1';
    const params = [child_id];
    let paramIndex = 2;
    
    if (from) {
      query += ` AND ts >= $${paramIndex}`;
      params.push(from);
      paramIndex++;
    }
    
    if (to) {
      query += ` AND ts <= $${paramIndex}`;
      params.push(to);
      paramIndex++;
    }
    
    query += ` ORDER BY ts DESC LIMIT $${paramIndex}`;
    params.push(limit);
    
    const result = await db.query(query, params);
    
    res.json({ locations: result.rows });
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getLatestLocation,
  getLocationHistory,
};
