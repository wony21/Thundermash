const passport = require('passport');
const LocalStrategy = require('passport-local');
const userService = require('../service/users/users.service');

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    
    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'password',
        session: true,
        passReqToCallback: false,
    }, async (userid, password, done) => { 
        console.log(`requiest login : ${userid} ${password}`);
        var userObj = await userService.getOneUser(userid, null, password);
        if ( userObj ) {
            console.log('passport - find user');
            return done(null, userObj);
        } else {
            console.log('아이디 혹은 비밀번호가 일치하지 않습니다.');
            return done(null, false, {message: '아이디 혹은 비밀번호가 일치하지 않습니다.'});
        }
        
    }));

}
