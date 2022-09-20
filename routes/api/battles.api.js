var express = require('express');
var router = express.Router();

const battleService = require('../../service/schedule/schedule.service');

/**************************************************************************
 * PAGES
 **************************************************************************/
 router.get('/', function(req, res, next) {
  var renderObj = {
    title: '모임목록',
    init: 'true',
  }
  res.render('battles/battles', renderObj);
});

router.get('/list', function(req, res, next){
  var renderObj = {
    title: '모임목록',
    init: 'true',
  }
  res.render('battles/battle-list', renderObj)
});

router.get('/v1/add', function(req, res, next) {
  var renderObj = {
    title: '모임생성',
    init: 'false',
  }
  res.render('battles/add-battles', renderObj);
});

router.get('/v2/add', function(req, res, next) {
  var renderObj = {
    title: '모임생성',
    init: 'false',
  }
  res.render('battles/add-battles2', renderObj);
});

router.get('/result', async function(req, res, next) {
  const { id, name, sttdate, enddate } = req.query;
  var battleObj = await battleService.getBattles(id, null, null, null, null);
  res.render('battles/result', battleObj[0]);
});

/****************************************************************************
 * API FUNCTIONS
 ***************************************************************************/
router.get('/list', async (req, res, next) => {
  try {
    const { id, name, sttdate, enddate, location } = req.query;
    console.log(req.query);
    var battles = await battleService.getBattles(id, name, sttdate, enddate, location);
    var dataObj = [];
    battles.forEach((o, i) => {
      var dataItem = new Array();
      dataItem[0] = o.no;
      dataItem[1] = o.name;
      dataItem[2] = o.date;
      dataItem[3] = o.location;
      dataItem[4] = o.creator;
      dataObj.push(dataItem);
    });

    var responseJson = {
      header: [
        { name: 'no', title: 'No', format: 'number' },
        { name: 'name', title: '모임명칭', },
        { name: 'date', title: '시간', format: 'number' },
        { name: 'location', title: '장소', format: 'number' },
        { name: 'creator', title: '만든이' }
      ],
      data: dataObj,
    }
    res.status(200).send(responseJson);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('v1/add', async (req, res, next) => {
  try {
    console.log('request add battle');
    const { name, date, time, location, url1, url2, maxAttend, voteDays, leagueTreeUrl } = req.body;
    // 중복 체크
    // var existObj = await battleService.getBattles(name, date, location);
    // 모임 생성
    // name, date, location, url1, url2, creator
    var dateTime = date + ' ' + time;
    var creator = req.session.passport.user.userId;
    var id = await battleService.addBattle(name, dateTime, location, url1, url2, creator);
    var redirectUrl = 'result?id=' + id;
    console.log(redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    res.status(500).send(error.message);
  }
    
});

module.exports = router;
