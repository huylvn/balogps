const db = require('../database/db');
const sseService = require('./sseService');

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Check if point is inside zone
function isInsideZone(point, zone) {
  const distance = calculateDistance(
    point.lat,
    point.lng,
    parseFloat(zone.center_lat),
    parseFloat(zone.center_lng)
  );
  return distance <= zone.radius_m;
}

// Find which zone (if any) contains the point
function findContainingZone(point, zones) {
  for (const zone of zones) {
    if (zone.active && isInsideZone(point, zone)) {
      return zone;
    }
  }
  return null;
}

// Create alert
async function createAlert(child_id, user_id, type, zone_id, lat, lng, ts, message) {
  try {
    const result = await db.query(
      `INSERT INTO alerts (child_id, user_id, ts, type, zone_id, lat, lng, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [child_id, user_id, ts, type, zone_id, lat, lng, message]
    );
    
    const alert = result.rows[0];
    
    // Get zone name for alert
    if (zone_id) {
      const zoneResult = await db.query('SELECT name FROM zones WHERE id = $1', [zone_id]);
      if (zoneResult.rows.length > 0) {
        alert.zone_name = zoneResult.rows[0].name;
      }
    }
    
    // Send SSE event
    sseService.sendEvent(child_id, {
      type: 'alert_created',
      data: alert
    });
    
    console.log(`Alert created: ${type} for child ${child_id}`);
    return alert;
  } catch (error) {
    console.error('Create alert error:', error);
    throw error;
  }
}

// Process location and check geofence
async function processLocation(child_id, location) {
  try {
    const { lat, lng, ts } = location;
    
    // Get child's user_id
    const childResult = await db.query('SELECT user_id FROM children WHERE id = $1', [child_id]);
    if (childResult.rows.length === 0) {
      console.error('Child not found:', child_id);
      return;
    }
    const user_id = childResult.rows[0].user_id;
    
    // Get active zones for this child
    const zonesResult = await db.query(
      'SELECT * FROM zones WHERE child_id = $1 AND active = true',
      [child_id]
    );
    const zones = zonesResult.rows;
    
    // Get current geofence state
    const stateResult = await db.query(
      'SELECT * FROM geofence_state WHERE child_id = $1',
      [child_id]
    );
    
    let currentState = stateResult.rows.length > 0 
      ? stateResult.rows[0] 
      : { last_safe_state: 'UNKNOWN', last_zone_id: null };
    
    // Find which zone (if any) contains current point
    const containingZone = findContainingZone({ lat, lng }, zones);
    const currentlyInside = containingZone !== null;
    
    let newState = currentState.last_safe_state;
    let newZoneId = currentState.last_zone_id;
    let alertType = null;
    let alertMessage = null;
    
    // State machine logic
    if (currentState.last_safe_state === 'UNKNOWN') {
      // First location - initialize state without alert
      newState = currentlyInside ? 'IN_SAFE' : 'OUT_SAFE';
      newZoneId = containingZone ? containingZone.id : null;
      console.log(`Initialized state for child ${child_id}: ${newState}`);
    } else if (currentState.last_safe_state === 'IN_SAFE' && !currentlyInside) {
      // EXIT: was inside, now outside
      newState = 'OUT_SAFE';
      newZoneId = null;
      alertType = 'EXIT';
      
      // Get the zone name they left
      if (currentState.last_zone_id) {
        const zoneResult = await db.query('SELECT name FROM zones WHERE id = $1', [currentState.last_zone_id]);
        const zoneName = zoneResult.rows.length > 0 ? zoneResult.rows[0].name : 'vùng an toàn';
        alertMessage = `Đã rời khỏi ${zoneName}`;
      } else {
        alertMessage = 'Đã rời khỏi vùng an toàn';
      }
      
      await createAlert(child_id, user_id, alertType, currentState.last_zone_id, lat, lng, ts, alertMessage);
    } else if (currentState.last_safe_state === 'OUT_SAFE' && currentlyInside) {
      // ENTER: was outside, now inside
      newState = 'IN_SAFE';
      newZoneId = containingZone.id;
      alertType = 'ENTER';
      alertMessage = `Đã vào ${containingZone.name}`;
      
      await createAlert(child_id, user_id, alertType, containingZone.id, lat, lng, ts, alertMessage);
    } else if (currentState.last_safe_state === 'IN_SAFE' && currentlyInside) {
      // Still inside - might have moved to different zone
      newState = 'IN_SAFE';
      newZoneId = containingZone.id;
    }
    
    // Update geofence state
    await db.query(
      `INSERT INTO geofence_state (child_id, last_safe_state, last_zone_id, last_ts, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (child_id) 
       DO UPDATE SET 
         last_safe_state = $2,
         last_zone_id = $3,
         last_ts = $4,
         updated_at = CURRENT_TIMESTAMP`,
      [child_id, newState, newZoneId, ts]
    );
    
    // Send state change event
    if (newState !== currentState.last_safe_state) {
      sseService.sendEvent(child_id, {
        type: 'state_changed',
        data: {
          child_id,
          old_state: currentState.last_safe_state,
          new_state: newState,
          zone_id: newZoneId,
          ts
        }
      });
    }
    
  } catch (error) {
    console.error('Process location error:', error);
    throw error;
  }
}

module.exports = {
  processLocation,
  calculateDistance,
  isInsideZone,
};
