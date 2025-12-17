const db = require('../database/db');

async function createZone(req, res) {
  try {
    const { child_id } = req.params;
    const { name, center_lat, center_lng, radius_m } = req.body;
    const userId = req.user.userId;
    
    // Check ownership
    const checkResult = await db.query(
      'SELECT id FROM children WHERE id = $1 AND user_id = $2',
      [child_id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    if (!name || !center_lat || !center_lng || !radius_m) {
      return res.status(400).json({ error: 'All zone fields are required' });
    }
    
    const result = await db.query(
      'INSERT INTO zones (child_id, name, center_lat, center_lng, radius_m) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [child_id, name, center_lat, center_lng, radius_m]
    );
    
    res.status(201).json({ zone: result.rows[0] });
  } catch (error) {
    console.error('Create zone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getZones(req, res) {
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
      'SELECT * FROM zones WHERE child_id = $1 ORDER BY created_at DESC',
      [child_id]
    );
    
    res.json({ zones: result.rows });
  } catch (error) {
    console.error('Get zones error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateZone(req, res) {
  try {
    const { zone_id } = req.params;
    const { name, center_lat, center_lng, radius_m, active } = req.body;
    const userId = req.user.userId;
    
    // Check ownership
    const checkResult = await db.query(
      `SELECT z.id FROM zones z
       INNER JOIN children c ON z.child_id = c.id
       WHERE z.id = $1 AND c.user_id = $2`,
      [zone_id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    
    const result = await db.query(
      `UPDATE zones 
       SET name = COALESCE($1, name),
           center_lat = COALESCE($2, center_lat),
           center_lng = COALESCE($3, center_lng),
           radius_m = COALESCE($4, radius_m),
           active = COALESCE($5, active)
       WHERE id = $6
       RETURNING *`,
      [name, center_lat, center_lng, radius_m, active, zone_id]
    );
    
    res.json({ zone: result.rows[0] });
  } catch (error) {
    console.error('Update zone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function deleteZone(req, res) {
  try {
    const { zone_id } = req.params;
    const userId = req.user.userId;
    
    // Check ownership
    const result = await db.query(
      `DELETE FROM zones z
       USING children c
       WHERE z.child_id = c.id AND z.id = $1 AND c.user_id = $2
       RETURNING z.id`,
      [zone_id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    
    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Delete zone error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createZone,
  getZones,
  updateZone,
  deleteZone,
};
