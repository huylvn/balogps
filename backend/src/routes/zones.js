const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');
const alertController = require('../controllers/alertController');
const { authMiddleware } = require('../middleware/auth');

// Zone routes
router.put('/:zone_id', authMiddleware, zoneController.updateZone);
router.delete('/:zone_id', authMiddleware, zoneController.deleteZone);

module.exports = router;
