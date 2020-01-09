const { query } = require('../../../config/database');
const {logger} = require('../../../config/winston');
const utils = require('../../../modules/resModule')
var schedule = require('node-schedule');

/**
2020.01.10
스케줄러 테스트
 */
exports.everyHour = async function (req, res) {
    try {
                     //분 시 일 월 요
        var j = schedule.scheduleJob('*/1 * * * *', function(){
        console.log('The answer to life, the universe, and everything!');
        });
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
