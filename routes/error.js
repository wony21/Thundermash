var express = require('express');
var router = express.Router();

const dateUtils = require('date-utils');

router.get('/', async function(req, res, next) {
    res.render('error/display');
});

module.exports = router;
