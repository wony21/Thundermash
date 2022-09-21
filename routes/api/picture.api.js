var express = require('express');
var router = express.Router();

/**************************************************************************
 * PAGES
 **************************************************************************/
 router.get('/', function(req, res, next) {
  res.render('pictures/search/list');
});

/****************************************************************************
 * API FUNCTIONS
 ***************************************************************************/
router.get('/search', async (req, res, next) => {
  try {
    const { location } = req.query;
    console.log('request find location service');
    var result = await mapService.findLocation(location);
    console.log('response find location service');
    res.status(200).send(result);
  } catch (error) {
    res.status(200).send(error.message);
  }
});

module.exports = router;
