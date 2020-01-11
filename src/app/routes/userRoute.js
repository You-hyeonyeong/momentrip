module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    var admin = require("firebase-admin");
    var serviceAccount = require("../../../config/halfmile-f9907-firebase-adminsdk-t5bbi-ded576e2ab.json");
    const passport = require('passport');


    app.route('/app/signup').post(jwtMiddleware, user.signup);
    app.route('/app/signin').post(jwtMiddleware, user.signin);
    //구글 로그인 테스트 중
    // app.use(session({
    //     secret: SECRET_CODE,
    //     cookie: { maxAge: 60 * 60 * 1000 },
    //     resave: true,
    //     saveUninitialized: false
    //   }));

    app.use(passport.initialize());
    app.get("/auth/google", 
        passport.authenticate("google", {
           scope: ["profile", "email"]
        })
        );
     app.get("/auth/google/callback", 
        passport.authenticate("google", {
            failureRedirect: '/login',
            successRedirect: '/main'
        }
        ));

    

    //파이어 베이스 연동 테스트
    // app.route('/output').post((req, res)=>{
    //     console.log('output 처리함')

    //     admin.initializeApp({
    //         credential: admin.credential.cert(serviceAccount),
    //         databaseURL: "https://halfmile-f9907.firebaseio.com"
    //       });

    //     var db = admin.database();
    //     var ref = db.ref("test");

    //     var usersRef = ref.child("users");
    //     usersRef.set({
    //     alanisawesome: {
    //         date_of_birth: "June 23, 1912",
    //         full_name: "Alan Turing"
    //     },
    //     gracehop: {
    //         date_of_birth: "December 9, 1906",
    //         full_name: "Grace Hopper"
    //     }
    //         });
    //     // ref.once("value", function(snapshot) {
    //     // console.log(snapshot.val());
    //     // });
    // });

};