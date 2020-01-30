module.exports = function(app){
    const user = require('../controllers/userController');
    const firebase = require('../../app/controllers/firebaseTest')
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/jwt', jwtMiddleware, user.jwtCheck);
    app.route('/app/signup').post(user.signup);
    app.route('/app/signin').post(user.signin);
    app.route('/app/idcheck').post(user.idCheck);
    app.route('/app/phonecheck').post(user.phoneCheck);
    app.route('/app/phonenum').post(jwtMiddleware, user.phoneNum);

};