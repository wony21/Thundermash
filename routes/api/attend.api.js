var express = require('express');
var router = express.Router();

const attendService = require('../../service/attend/attend.service');

/**************************************************************************
 * PAGES
 **************************************************************************/

/****************************************************************************
 * API FUNCTIONS
 ***************************************************************************/
router.get('/v1/get', async (req, res, next) => {
  console.log('request attend list.');
  try {
    const { schId } = req.query;
    var filter = {
      schId: schId
    }
    var result = await attendService.getAttends(filter);
    res.status(200).send(result);
  } catch (error) {
    res.status(200).send(error.message);
  }
});

router.get('/v1/my', async (req, res, next) => {
  console.log('request attend list.');
  try {
    const { schId } = req.query;
    var userId = req.session.passport.user.userId;
    var filter = {
      schId: schId,
      userId: userId
    }
    var result = await attendService.getMyAttend(filter);
    res.status(200).send(result);
  } catch (error) {
    res.status(200).send(error.message);
  }
});

router.get('/v1/get/guest', async (req, res, next) => {
  console.log('request attend list.');
  try {
    const { schId, guestNm } = req.query;
    var userId = req.session.passport.user.userId;
    var filter = {
      schId: schId,
      guestNm: guestNm
    }
    var result = await attendService.getGuest(filter);
    res.status(200).send(result);
  } catch (error) {
    res.status(200).send({ ret:false, data:null, message: error.message});
  }
});

router.post('/v1/add', async (req, res, next) => {
    try {
      const { schId, attend } = req.body;
      var userId = req.session.passport.user.userId;
      var newObj = {
          schId: schId,
          userId: userId,
          attendFg: attend
      }
      var result = await attendService.attendSchedule(newObj);
      res.status(200).send(result);
    } catch (error) {
      res.status(200).send({ ret:false, data:null, message: error.message});
    }
});

router.post('/v1/add/guest', async (req, res, next) => {
    try {
      const { schId, guestname, attend, grade, age, gender } = req.body;
      var userId = req.session.passport.user.userId;
      var newObj = {
          schId: schId,
          guestNm: guestname,
          userId: userId,
          attendFg: attend,
          grade: grade,
          age: age,
          gender: gender,
      }
      var dup = await attendService.duplicateCheck(newObj);
      if (dup) {
        res.status(200).send({ ret:false, data:null, message: '동일 이름의 게스트가 등록되어 있습니다.' });
        return;
      }
      var result = await attendService.attendGuestSchedule(newObj);
      res.status(200).send(result);
    } catch (error) {
      res.status(200).send({ ret:false, data:null, message: error.message});
    }
});

router.post('/v1/delete/guest', async (req, res, next) => {
  console.log('request remove guest');
  try {
    const { schId, guestname } = req.body;
    var userId = req.session.passport.user.userId;
    var filter = {
        schId: schId,
        guestNm: guestname,
        userId: userId,
    }
    var retObj = await attendService.getGuest(filter);
    if (!retObj.ret) {
      res.status(200).send({ ret:false, data:null, message: '게스트 신청회원이 아니시거나, 없는 게스트 정보입니다.'});
      return;
    }
    var result = await attendService.deleteGuestSchedule(filter);
    res.status(200).send(result);
  } catch (error) {
    res.status(200).send({ ret:false, data:null, message: error.message});
  }
});

module.exports = router;
