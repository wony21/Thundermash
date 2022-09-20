var express = require('express');
var router = express.Router();

const battleService = require('../../service/battles/battles.service');

/**************************************************************************
 * PAGES
 **************************************************************************/
router.get('/', function(req, res, next) {
  var renderObj = {
    title: '모임생성',
    init: 'true',
  }
  res.render('meeting/create', renderObj);
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

router.post('/v1/add', async (req, res, next) => {
  try {
    console.log('request create schedule..');
    const { name, date, hour, min, location, url1, url2, maxAttend, voteDays, leagueTreeUrl } = req.body;
    // 중복 체크
    // var existObj = await battleService.getBattles(name, date, location);
    // 모임 생성
    // name, date, location, url1, url2, creator
    var dateTime = date + ' ' + hour + ':' + min;
    console.log('get user infomation in session..');
    var creator = req.session.passport.user.userId;

    var id = await battleService.addBattle(name, dateTime, location, url1, url2, creator, maxAttend, voteDays, leagueTreeUrl);
    var meet = await battleService.getBattles(id, null, null, null, null);
    res.render('meeting/create-result', meet[0]);

  } catch (error) {
    res.status(500).send(error.message);
  }
    
});

module.exports = router;
