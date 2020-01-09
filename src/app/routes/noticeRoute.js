module.exports = function(app){
    const noti = require('../controllers/noticeController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/app/noti',noti.getAllNoti);
    app.get('/app/noti/:noticeIdx',noti.getOneNoti);

};