var express = require('express');
var router = express.Router();

const dateUtils = require('date-utils');
const scheduleService = require('../service/schedule/schedule.service');

/* GET home page. */
router.get('/', async function(req, res, next) {
  var today = new Date();
  var todayFmt = today.toFormat('YYYYMMDD');
  var obj = await scheduleService.getSchedule({nearDate: todayFmt});
  if (obj.ret) {
    var data = obj.data;
    var totalAttendCount = Number(data[0].attendCount) + Number(data[0].guestCount);
    var param = {
      schId: data[0].id,
      schLoc: data[0].schLoc,
      schDate: data[0].schDate,
      totalAttendCount: totalAttendCount,
      maxAttLimit: data[0].maxAttLimit,
      url1Nm: data[0].url1Nm,
      url1: data[0].url1,
      url2Nm: data[0].url2Nm,
      url2: data[0].url2,
      coordX: data[0].coordX,
      coordY: data[0].coordY,
      road: data[0].addrRoad,
      parcel: data[0].addrParcel,
    }
    console.log('--- schedule object in index page ---');
    console.log(param);
    res.render('index', param);
  } else {
    res.render('controls/no-has-schedule');
  }
  
});

module.exports = router;
