var express = require('express');
var router = express.Router();
const passport = require('passport');
const userService = require('../service/users/users.service');

/************************************************
 * 로그인, 회원가입, 회원가입완료 처리
 *************************************************/

/**
 * 로그인 및 로그인 결과 표시
 * (flash 활용)
 */
router.get('/login', function(req, res, next){
    // var message = req.flash('message');
    var message = req.flash().error;
    var msg1 = req.flash();
    console.log(msg1);
    console.log('flash message:', message);
    res.render('login', {message: message});
});

/**
 * 회원가입 폼
 */
router.get('/joinus', function(req, res, next){
    res.render('users/new/add', {title: 'Express'});
});

/**
 * 회원가입완료
 * @todo get방식의 parameter에 사용자id를 입력하면 회원정보가 노출된다. 
 *       회원정보는 query string에서 제외하고, 정상문구만 표시
 *       로그인화면으로 바로가기 버튼만 만들 것.
 */
router.get('/joinus/result', async function(req, res, next){
  const { id } = req.query;
  let obj = await userService.getUserInfo(id, null);
  res.render('users/new/response', obj);
});

/**
 * 로그인 - Passport를 활용한 session 방식
 * 자동로그인 구현을 위한 KEY인증 방식과 쿠키 활용 (향 후)
 */
router.post('/login', 
        passport.authenticate('local', { failureRedirect: '/login', failureFlash: true, }), 
    (req, res) => {
    var userInfo = req.session.passport.user;
    const { userId, userName } = userInfo;
    console.log(`login success: ${userId} ${userName}`);
    console.log('login reuqest and success.')
    res.redirect('/');
});

/**
 * 로그아웃
 */
router.get('/logout', function(req, res){
    req.logout(function(err){
        if (err) { return next(err); }
        res.redirect('/');
    });
});

/**
 * 회원가입처리 - 회원가입실패 시 실패페이지 리다이렉이 없다.(만들 것)
 */
router.post('/member/add', async (req, res, next) => {
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
      res.redirect(`/joinus/result?id=${id}`);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

module.exports = router;