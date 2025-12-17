const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

async function register(req, res) {
  try {
    const { email_or_phone, password } = req.body;
    
    if (!email_or_phone || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await db.query(
      'INSERT INTO users (email_or_phone, password_hash) VALUES ($1, $2) RETURNING id, email_or_phone, created_at',
      [email_or_phone, password_hash]
    );
    
    const user = result.rows[0];
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email_or_phone: user.email_or_phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      user: {
        id: user.id,
        email_or_phone: user.email_or_phone,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'User already exists' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email_or_phone, password } = req.body;
    
    if (!email_or_phone || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required' });
    }
    
    // Find user
    const result = await db.query(
      'SELECT * FROM users WHERE email_or_phone = $1',
      [email_or_phone]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email_or_phone: user.email_or_phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.json({
      user: {
        id: user.id,
        email_or_phone: user.email_or_phone,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getMe(req, res) {
  try {
    const result = await db.query(
      'SELECT id, email_or_phone, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  register,
  login,
  getMe,
};
