var express = require('express');
var router = express.Router();
var ctrl = require('../app_server/controllers/locations');

router.get('/', ctrl.homelist);
router.get('/location/:locationid', ctrl.locationInfo);
router.get('/location/:locationid/reviews/new', ctrl.addReview);
router.post('/location/:locationid/reviews/new', ctrl.doAddReview);

module.exports = router; 
