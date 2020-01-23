const { query } = require('../../../config/database');
const { logger } = require('../../../config/winston');
const utils = require('../../../modules/resModule')
var schedule = require('node-schedule');

/**
2020.01.10
스케줄러 테스트
 */

 // 인앱결제, 광고시청으로 베터리가 10%씩 차감

schedule.scheduleJob('00 * * * *', function () {
    logger.info(`App - Query error\n: ${err.message}`);
});
                
schedule.scheduleJob('0 * * * *', function () {
    console.log('1시간마다 돌아가는 스케줄러');
})

schedule.scheduleJob('0 */12 * * *', function () {
    logger.info('회원가입 12시간 이후 선물해주는 스케쥴러 작동');
    
});


