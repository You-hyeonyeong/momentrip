const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var session = require('express-session'); // 추후 사용
var config = require('../config/googleConfig');

var GOOGLE_CLIENT_ID = config.google.clientId;
var GOOGLE_CLIENT_SECRET = config.google.clientSecret;

passport.serializeUser((user, done) => { //미들웨어는 전달받은 객체(정보)를 세션에 저장하는 역할
    done(null, user); // user객체가 deserializeUser로 전달됨.
});
passport.deserializeUser((user, done) => { //미들웨어는 서버로 들어오는 요청마다 세션 정보가 유효한 지를 검사하는 역할
    done(null, user); // 여기의 user가 req.user가 됨
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
    function (accessToken, refreshToken, profile, cb) { //인증에 대한 확인 콜백
        console.log(accessToken);
        console.log(profile);
        console.log(profile.emails[0].value);
        return cb(null, profile);
    }
));



