const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authMiddleware } = require('../middleware/auth');

router.post('/:alert_id/read', authMiddleware, alertController.markAlertAsRead);

module.exports = router;
