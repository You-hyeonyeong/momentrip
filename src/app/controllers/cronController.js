const { query } = require('../../../config/database');
const { logger } = require('../../../config/winston');
const utils = require('../../../modules/resModule')
var schedule = require('node-schedule');

/**
2020.01.10
스케줄러 테스트
 */
exports.everyHour = async function (req, res) {
    try {
        let cnt = 0;
        if (cnt = 0) {
            var j = schedule.scheduleJob('00 * * * *', function () {
                cnt++;
                console.log('처음에 들어왔을때 2시간 지난 정시로 측정');
            });
        } else {
            //정시마다 돌아가는 스케줄러
            var j = schedule.scheduleJob('00 * * * *', function () {
                cnt++;
                console.log('1시간마다 돌아가는 스케줄러');
            });
        }

    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
