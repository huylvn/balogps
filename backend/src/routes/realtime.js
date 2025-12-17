const express = require('express');
const router = express.Router();
const sseService = require('../services/sseService');
const { authMiddleware } = require('../middleware/auth');

router.get('/children/:child_id/events', authMiddleware, (req, res) => {
  sseService.handleSSEConnection(req, res);
});

module.exports = router;
