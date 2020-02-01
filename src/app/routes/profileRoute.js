module.exports = function(app){
    const profile = require('../controllers/profileController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/app/profile',jwtMiddleware, profile.getProfile);
    app.route('/app/profileimg').patch(jwtMiddleware, profile.patchProfileImg);
    app.route('/app/chatimg').patch(jwtMiddleware, profile.patchChatImg);

};