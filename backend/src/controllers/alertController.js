const db = require('../database/db');

async function getAlerts(req, res) {
  try {
    const { child_id } = req.params;
    const { limit = 50, unread_only } = req.query;
    const userId = req.user.userId;
    
    // Check ownership
    const checkResult = await db.query(
      'SELECT id FROM children WHERE id = $1 AND user_id = $2',
      [child_id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    let query = `
      SELECT a.*, z.name as zone_name 
      FROM alerts a
      LEFT JOIN zones z ON a.zone_id = z.id
      WHERE a.child_id = $1 AND a.user_id = $2
    `;
    
    if (unread_only === 'true') {
      query += ' AND a.read_at IS NULL';
    }
    
    query += ' ORDER BY a.ts DESC LIMIT $3';
    
    const result = await db.query(query, [child_id, userId, limit]);
    
    res.json({ alerts: result.rows });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function markAlertAsRead(req, res) {
  try {
    const { alert_id } = req.params;
    const userId = req.user.userId;
    
    const result = await db.query(
      `UPDATE alerts 
       SET read_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2 AND read_at IS NULL
       RETURNING *`,
      [alert_id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found or already read' });
    }
    
    res.json({ alert: result.rows[0] });
  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function markAllAlertsAsRead(req, res) {
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
    
    await db.query(
      'UPDATE alerts SET read_at = CURRENT_TIMESTAMP WHERE child_id = $1 AND user_id = $2 AND read_at IS NULL',
      [child_id, userId]
    );
    
    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    console.error('Mark all alerts as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
};
