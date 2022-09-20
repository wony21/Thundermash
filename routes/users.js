var express = require('express');
var router = express.Router();
const userService = require('../service/users/users.service');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/change', async function(req, res, next) {
  var userInfo = req.session.passport.user;
  //console.log(userInfo);
  var userObj = await userService.getUsers(userInfo.userId, null, null);
  //console.log(userObj);
  res.render('users/edit/modify', userObj[0]);
});

router.get('/change/result', async (req, res, next) => {
  var userInfo = req.session.passport.user;
  var userObj = await userService.getUserInfo(userInfo.userId, null);
  console.log(userObj);
  res.render('users/edit/response', userObj);
});

router.post('/change', async (req, res, next) => {
  console.log('-- request user change --');
  try {
    const {
      userid, username, changePassword, password, mobile, gender, grade, age
    } = req.body;
    var obj = {
      userId: userid,
      userName: username,
      password: password,
      changePassword: changePassword,
      mobile: mobile,
      gender: gender,
      grade: grade,
      age: age
    }
    // console.log(obj);
    var userObj = await userService.authentication(obj.userId, obj.password);
    if (!userObj) {
      res.status(500).json({ msg: '계정 인증에 실패 하였습니다. 올바른 비밀번호를 입력하세요.' });
      return;
    }
    var result = await userService.updateUserInfo(obj);
    if (result.ret) {
      res.redirect(`/users/change/result`);
    } else {
      // res.render('/common/error', )
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

router.post('/change/test', async (req, res, next) => {
  console.log('-- request user change --');
  try {
    const {
      userid, username, changePassword, password, mobile, gender, grade, age
    } = req.body;
    var obj = {
      userId: userid,
      userName: username,
      password: password,
      changePassword: changePassword,
      mobile: mobile,
      gender: gender,
      grade: grade,
      age: age
    }
    // console.log(obj);
    var result = await userService.updateUserInfo(obj);
    if (result.ret) {
      res.redirect(`/users/change/result`);
    } else {
      res.redirect(`/users/change/result`);
    } 
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});



module.exports = router;
