var express = require('express');
var router = express.Router();
const userService = require('../../service/users/users.service');

/**************************************************************************
 * PAGES
 **************************************************************************/


/****************************************************************************
 * API FUNCTIONS
 ***************************************************************************/
router.post('/v1/add', async (req, res, next) => {
  try {
    console.log('-- request add user --');
    const { id, username, password, mobile, gender, grade, age } = req.body;
    // 중복체크
    var checkUserId = await userService.getUsers(id, null, null);
    console.log(checkUserId);
    if (checkUserId.length > 0) {
      res.status(500).send('이미 존재하는 아이디');
      return;
    }
    var userId = await userService.addUser(id, username, password, mobile, gender, grade, age);
    // var userInfo = await userService.getUserInfo(id, null);
    // var redirectUrl = 'result?id=' + id;
    // console.log(redirectUrl);
    // res.redirect(redirectUrl);
    console.log(userInfo);
    res.redirect(`/users/add/result?id=${id}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/checkId', async (req, res, next) => {
  try {
    const { userId } = req.body;
    console.log(`check id: ${userId}`);
    var checkUserId = await userService.getUsers(userId, null, null);
    var checkValue = false;
    if (checkUserId.length > 0) {
      checkValue = true;
    } else {
      checkValue = false;
    }
    res.status(200).json({ checked: checkValue });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/auth', async (req, res, next) => {
  try {
    //console.log('request auth');
    const { userid, password } = req.body;
    //console.log(`request authenticate: ${userid} ${password}`);
    var userObj = await userService.authentication(userid, password);
    if (userObj) {
      res.status(200).json({ status: 200, msg: 'OK' });
    } else {
      res.status(200).json({ status: 500, msg: '비밀번호가 일치하지 않습니다.' });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
