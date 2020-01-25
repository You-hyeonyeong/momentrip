const { query } = require('../../../config/database');
const { logger } = require('../../../config/winston');
const utils = require('../../../modules/resModule')
const schedule = require('../../../modules/scheduleModule')
var schedule = require('node-schedule');

/**
2020.01.10
스케줄러 테스트
 */
// 초 분 시간 년 월 일

 // 인앱결제, 광고시청으로 베터리가 10%씩 차감
schedule.scheduleJob('0 * * * *', function () {
    schedule.batteryDeduction();
    logger.info();
});
                
schedule.scheduleJob('0 * * * *', function () {

    logger.info('1시간마다 돌아가는 스케줄러');
})

schedule.scheduleJob('0 */12 * * *', function () {
    logger.info('');
    
});


