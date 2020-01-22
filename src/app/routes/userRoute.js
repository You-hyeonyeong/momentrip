module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    var admin = require("firebase-admin");
    var serviceAccount = require("../../../config/halfmile-f9907-firebase-adminsdk-t5bbi-ded576e2ab.json");
    const passport = require('passport');


    app.route('/app/signup').post(user.signup);
    app.route('/app/signin').post(user.signin);
    
   //파이어 베이스 연동 테스트
    app.route('/output').post((req, res)=>{
        console.log('output 처리함')

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://halfmile-f9907.firebaseio.com"
          });

        var db = admin.database();
        var ref = db.ref("userInfo");
        ref.set(
            {
                "userInfo": 
                        {
                            "userInfoIdx": 34 ,
                            "myProfileImg": "https://~~",
                            "myProfileSubImg": "https://~~",
                            "your": {
                                "profileImg":"dddd",
                                "profileSubImg":"Dddd",
                                "Id": "ted"
                            }
                        }
                    
                });
        // ref.once("value", function(snapshot) {
        // console.log(snapshot.val());
        // });
    });

};