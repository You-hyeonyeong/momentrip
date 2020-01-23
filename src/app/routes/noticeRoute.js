module.exports = function(app){
    const noti = require('../controllers/noticeController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/app/notice',noti.getAllNoti);
    app.get('/app/notice/:noticeIdx',noti.getOneNoti);

};