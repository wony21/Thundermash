var express = require('express');
var router = express.Router();

/**************************************************************************
 * PAGES
 **************************************************************************/
 router.get('/', function(req, res, next) {
    res.render('game/index');
});


module.exports = router;