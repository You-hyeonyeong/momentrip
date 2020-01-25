const { query } = require('../config/database');
const {logger} = require('../config/winston');


/**
2020.01.24
스케줄러 모듈
 */
//1. 활성화되어 있고 배터러가 0 이상인 회원중에서 10%씩 차감
exports.batteryDeduction = async function (req, res) {
    const deductionQuery = `UPDATE userInfo
                            SET battery = battery-10
                            WHERE hour(createdAt)+1 <> hour(NOW())
                            AND status = 'ACTIVE'
                            AND battery > 0 ;
    `
    const deductionResult= await query(deductionQuery);
    //RTDB에도 적용 
    logger.info("-10% battery once an hour")
}
//3.회원 미접속 30일 알람
//마지막 접속시간와 현재 접속시간과 비교하여 30일이 지났으면 휴면경고 알람
exports.alarmThirtyDay = async function (req, res) {
    const inactiveQuery = `SELECT userInfoIdx, id, fcmToken
                            FROM userInfo
                            WHERE status = 'ACTIVE';
    `
    const inactiveResult= await query(inactiveQuery);
    logger().info("unused member warning push message") 
}


//3.회원의 휴면여부 확인
//마지막 접속시간와 현재 접속시간과 비교하여 37일이 지났으면 휴면으로 전환
exports.turnInactive = async function (req, res) {
    const inactiveQuery = `UPDATE userInfo
                            SET status = 'INACTIVE'
                            WHERE lastLoginAt = now() - day(37) 
                            AND status = 'ACTIVE';
    `
    const inactiveResult= await query(inactiveQuery); 
}



