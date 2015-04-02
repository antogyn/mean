var express = require('express');
var router = express.Router();
var ctrl = require('../app_server/controllers/locations');

router.get('/', ctrl.homelist);
router.get('/location/:locationid', ctrl.locationInfo);
router.get('/location/review/new', ctrl.addReview);

module.exports = router; 
