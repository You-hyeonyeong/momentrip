module.exports = function(app){
    const friend = require('../controllers/friendController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/app/friends',jwtMiddleware, friend.getFriends);
    app.route('/app/reqfriend').post(jwtMiddleware, friend.reqFriends);
    app.route('/app/resfriend').post(jwtMiddleware, friend.resFriends);
   // app.route('/app/rejfriend').post(jwtMiddleware, friend.rejFriends);

};