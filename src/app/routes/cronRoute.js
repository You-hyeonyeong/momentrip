module.exports = function(app){
    const cron = require('../controllers/cronController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/cron', cron.everyHour);

};