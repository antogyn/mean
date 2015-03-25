var express = require('express');
var router = express.Router();
var ctrl = require('../controllers/locations');

router.get('/api/locations', ctrl.locationsListByDistance);
router.post('/api/locations', ctrl.locationsCreate);
router.get('/api/locations/:locationid', ctrl.locationsReadOne);
router.put('/api/locations/:locationid', ctrl.locationsUpdateOne);
router.delete('/api/locations/:locationid', ctrl.locationsDeleteOne);
// reviews
router.post('/api/locations/:locationid/reviews', ctrl.reviewsCreate);
router.get('/api/locations/:locationid/reviews/:reviewid', ctrl.reviewsReadOne);
router.put('/api/locations/:locationid/reviews/:reviewid', ctrl.reviewsUpdateOne);
router.delete('/api/locations/:locationid/reviews/:reviewid', ctrl.reviewsDeleteOne);

module.exports = router; 