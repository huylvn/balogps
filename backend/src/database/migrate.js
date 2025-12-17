const db = require('./db');

const migrations = [
  {
    name: '01_create_users_table',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email_or_phone VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: '02_create_children_table',
    sql: `
      CREATE TABLE IF NOT EXISTS children (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: '03_create_trackers_table',
    sql: `
      CREATE TABLE IF NOT EXISTS trackers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: '04_create_zones_table',
    sql: `
      CREATE TABLE IF NOT EXISTS zones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        center_lat DECIMAL(10, 8) NOT NULL,
        center_lng DECIMAL(11, 8) NOT NULL,
        radius_m INTEGER NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: '05_create_location_points_table',
    sql: `
      CREATE TABLE IF NOT EXISTS location_points (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
        ts TIMESTAMP NOT NULL,
        lat DECIMAL(10, 8) NOT NULL,
        lng DECIMAL(11, 8) NOT NULL,
        accuracy_m DECIMAL(10, 2),
        speed_mps DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_location_points_child_ts ON location_points(child_id, ts DESC);
    `
  },
  {
    name: '06_create_geofence_state_table',
    sql: `
      CREATE TABLE IF NOT EXISTS geofence_state (
        child_id UUID PRIMARY KEY REFERENCES children(id) ON DELETE CASCADE,
        last_safe_state VARCHAR(50) DEFAULT 'UNKNOWN',
        last_zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
        last_ts TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: '07_create_alerts_table',
    sql: `
      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        ts TIMESTAMP NOT NULL,
        type VARCHAR(50) NOT NULL,
        zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        message TEXT,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_alerts_child_ts ON alerts(child_id, ts DESC);
      CREATE INDEX IF NOT EXISTS idx_alerts_user_read ON alerts(user_id, read_at);
    `
  }
];

async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    for (const migration of migrations) {
      console.log(`Running migration: ${migration.name}`);
      await db.query(migration.sql);
      console.log(`✓ ${migration.name} completed`);
    }
    
    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
