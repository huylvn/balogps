const express = require('express');
const router = express.Router();
const childController = require('../controllers/childController');
const trackerController = require('../controllers/trackerController');
const zoneController = require('../controllers/zoneController');
const historyController = require('../controllers/historyController');
const alertController = require('../controllers/alertController');
const { authMiddleware } = require('../middleware/auth');

// Children routes
router.post('/', authMiddleware, childController.createChild);
router.get('/', authMiddleware, childController.getChildren);
router.get('/:child_id', authMiddleware, childController.getChild);
router.put('/:child_id', authMiddleware, childController.updateChild);
router.delete('/:child_id', authMiddleware, childController.deleteChild);

// Tracker token routes
router.post('/:child_id/tracker-token', authMiddleware, trackerController.createTrackerToken);

// Zone routes
router.post('/:child_id/zones', authMiddleware, zoneController.createZone);
router.get('/:child_id/zones', authMiddleware, zoneController.getZones);

// Location routes
router.get('/:child_id/location/latest', authMiddleware, historyController.getLatestLocation);
router.get('/:child_id/location/history', authMiddleware, historyController.getLocationHistory);

// Alert routes
router.get('/:child_id/alerts', authMiddleware, alertController.getAlerts);
router.post('/:child_id/alerts/read-all', authMiddleware, alertController.markAllAlertsAsRead);

module.exports = router;
