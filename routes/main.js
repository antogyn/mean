var express = require('express');
var router = express.Router();
var ctrl = require('../app_server/controllers/main');

router.get('/about', ctrl.about);
router.get('/signin', ctrl.signin);

module.exports = router; 
