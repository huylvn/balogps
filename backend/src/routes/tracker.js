const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { trackerAuthMiddleware } = require('../middleware/auth');

router.post('/ping', trackerAuthMiddleware, locationController.ping);

module.exports = router;
