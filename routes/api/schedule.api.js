var express = require('express');
var router = express.Router();

const scheduleService = require('../../service/schedule/schedule.service');

/**************************************************************************
 * PAGES
 **************************************************************************/
router.get('/new', function(req, res, next) {
  res.render('schedule/new/add');
});

router.get('/new/result', async function(req, res, next) {
  const { id } = req.query;
  console.log(`request schedule id: ${id}`);
  let obj = await scheduleService.getSchedule({id : id});
  console.log('-- result page obj --');
  console.log(obj);
  res.render('schedule/new/response', obj.data[0]);
});

router.get('/modify/result', async function(req, res, next) {
  const { id } = req.query;
  console.log(`request schedule id: ${id}`);
  let obj = await scheduleService.getSchedule({id : id});
  console.log('-- result page obj --');
  console.log(obj);
  res.render('schedule/edit/response', obj.data[0]);
});

router.get('/', function(req, res, next) {
    res.render('schedule/search/list');
});

router.get('/modify', async function(req, res, next) {
  const { id } = req.query;
  console.log(`requery id:${id}`);
  var obj = await scheduleService.getSchedule({id: id});
  console.log('response obj data');
  console.log(obj);
  var data = {};
  if (obj.ret) {
      data = obj.data[0];
      data.schYmd = data.schDate.split(' ')[0];
      data.schHm = data.schDate.split(' ')[1];
      data.schHour = data.schHm.split(':')[0];
      data.schMin = data.schHm.split(':')[1];
      res.render('schedule/edit/modify', data);
  } else {
    res.render('error', {message: '잘못된 접근 입니다.', error: {status:'error', stack: 'n/a'}});
  }
  // res.render('schedule/edit/modify');
});

/****************************************************************************
 * API FUNCTIONS
 ***************************************************************************/
router.get('/v1/list', async (req, res, next) => {
  try {
    const { month } = req.query;
    var filter = {
        month: month
    }
    var result = await scheduleService.getSchedule(filter);
    console.log(result);
    res.status(200).send(result);
  } catch (error) {
    res.status(200).send(error.message);
  }
});

router.get('/v1/nearScheduleInfo', async (req, res, next) => {
  try {
    var today = new Date();
    var todayFmt = await today.toFormat('YYYYMMDD');
    console.log(todayFmt);
    var filter = {
        nearDate: todayFmt
    }
    var result = await scheduleService.getSchedule(filter);
    console.log(result);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/v1/get', async (req, res, next) => {
  try {
    const { id } = req.query;
    var userId = req.session.passport.user.userId;
    var filter = {
        id: id,
    }
    var result = await scheduleService.getSchedule(filter);
    if (result.ret == false) {
      res.status(200).send({ret: false, message: '모임정보가 존재하지 않습니다.'});
      return false;
    } else {
      if (result.data[0].creator !== userId) {
        res.status(200).send({ret: false, message: '모임 생성한 회원만 수정/삭제가 불가능 합니다.'});
        return false;
      }
      res.status(200).send(result);
    }
  } catch (error) {
    res.status(200).send({ret: false, message: error.message });
  }
});

router.post('/v1/add', async (req, res, next) => {
    try {
        const {
            name, date, hour, min, location, url1Nm, url2Nm, url1, url2, 
            maxAttLimit, voteDays, teamTreeUrl, coordX, coordY, road, parcel
        } = req.body;
        var schDate = date + ' ' + hour + ':' + min;
        // var creator = req.session.passport.user.userId;
        var creator = req.session.passport.user.userId;
        var newObj = {
            schNm: name,
            schDate: schDate,
            schLoc: location,
            maxAttLimit: maxAttLimit,
            url1Nm: url1Nm,
            url2Nm: url2Nm,
            url1: url1,
            url2: url2,
            teamTreeUrl: teamTreeUrl,
            voteDays: voteDays,
            creator: creator,
            coordX: coordX,
            coordY: coordY,
            addrRoad: road,
            addrParcel: parcel
        }
        console.log(newObj);
        let id = await scheduleService.addSchedule(newObj);
        if (id === 'ERR-EXIST') {
            res.status(500).json({msg: '중복되는 모임 입니다.'});
        } else {
            console.log(`redirect result page id: ${id}`);
            res.redirect(`/schedule/new/result?id=${id}`);
        }
    } catch (error) {
        res.status(200).send(error.message);
    }
});

router.post('/v1/modify', async (req, res, next) => {
  try {
      const {
          schId, name, date, hour, min, location, url1Nm, url2Nm, url1, url2, 
          maxAttLimit, voteDays, teamTreeUrl, coordX, coordY, road, parcel
      } = req.body;
      var schDate = date + ' ' + hour + ':' + min;
      // var creator = req.session.passport.user.userId;
      var creator = req.session.passport.user.userId;
      var obj = {
          id: schId,
          schNm: name,
          schDate: schDate,
          schLoc: location,
          maxAttLimit: maxAttLimit,
          url1Nm: url1Nm,
          url2Nm: url2Nm,
          url1: url1,
          url2: url2,
          teamTreeUrl: teamTreeUrl,
          voteDays: voteDays,
          creator: creator,
          coordX: coordX,
          coordY: coordY,
          addrRoad: road,
          addrParcel: parcel
      }

      let result = await scheduleService.modifySchedule(obj);
      if (result.ret) {
        res.redirect(`/schedule/modify/result?id=${schId}`);  
      } else {
        res.status(200).send(result);
      }
  } catch (error) {
      res.status(500).send(error.message);
  }
});

router.post('/v1/delete', async (req, res, next) => {
  try {
    console.log('-- request delete schedule ---');
    const { id } = req.body;
    var userId = req.session.passport.user.userId;
    var filter = {
        id: id,
        userId: userId
    }
    console.log(filter);
    var obj = await scheduleService.getSchedule(filter);
    console.log(obj);
    if (!obj.ret) {
      res.status(200).send({ret: false, message:'모임생성한 사용자만 삭제할 수 있습니다.'});
      return;
    }
    let result = await scheduleService.deleteSchedule(id);
    res.status(200).send(result);
} catch (error) {
    res.status(500).send(error.message);
}
});



module.exports = router;
