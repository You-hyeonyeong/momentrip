module.exports = function(app){
    const public = require('../controllers/identityRequestController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/app/reqidentity').post(jwtMiddleware, public.reqIdentity);
    app.route('/app/residentity').post(jwtMiddleware, public.resIdentity);

};