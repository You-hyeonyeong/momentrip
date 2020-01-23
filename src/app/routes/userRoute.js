module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/app/signup').post(user.signup);
    app.route('/app/signin').post(user.signin);
    app.route('/app/idcheck').post(user.idcheck);
    app.route('/app/firebase').post(user.firebase);

};