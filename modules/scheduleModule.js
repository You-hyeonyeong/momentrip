const { query } = require('../config/database');
const { logger } = require('../config/winston');
const { userDB, chatDB, admin } = require('../modules/firebaseDBModule')


/**
2020.01.24
스케줄러 모듈
 */
//1. 활성화되어 있고 배터러가 0 이상인 회원중에서 10%씩 차감
exports.minusBatteryPerHour = async function (req, res) {
    const minusResult = await query(`UPDATE userInfo
                            SET battery = battery-10
                            WHERE hour(createdAt)+1 <> hour(NOW())
                            AND status = 'ACTIVE'
                            AND battery > 0 ;`)
    const selectUser = await query(`
            SELECT userInfoIdx 
            FROM userInfo 
            WHERE hour(createdAt)+1 <> hour(NOW()) AND status = 'ACTIVE' AND battery > 0;`)

            //enumerated for iterater
    selectUser.forEach(async (user) => {
        //console.log(user.userInfoIdx);
        //battery 에 history 남기기
        const tenPercentMinus = await query(`
                INSERT INTO battery (userInfoIdx, variation, percents, type) VALUES (?, ?, ?, ?)`, [user.userInfoIdx, '-', 10, 'SCEDULE'])
        //뽑아낸 유저 돌면서 firebase에서 배터리 감소
        userDB.doc(`${user.userInfoIdx}`).update({ battery: admin.firestore.FieldValue.increment(-10) })
    })
    logger.info("-10% battery once an hour")
}
//2. 휴면계정 체크
//마지막 접속시간와 현재 접속시간과 비교하여 30일이 지났으면 휴면경고 알람
exports.checkInactiveUser = async function (req, res) {
    const inactiveUserQuery = await query(`SELECT userInfoIdx, id
                            FROM userInfo
                            WHERE status = 'ACTIVE'
                            AND WHERE timestampdiff(hour, userInfo.lastLoginAt, now()) = 720;`)

    //inactiveUserQuery.userInfoIdx 사람들에게 push 메시지 보내기
    //push 메시지 히스토리 쌓이기
    logger.info("inactive member warning push message")
}




//2.회원 미접속 30일 알람
//마지막 접속시간와 현재 접속시간과 비교하여 30일이 지났으면 휴면경고 알람
exports.alarmThirtyDay = async function (req, res) {
    const inactiveQuery = `SELECT userInfoIdx, id
                            FROM userInfo
                            WHERE status = 'ACTIVE'
                            AND WHERE timestampdiff(hour, userInfo.lastLoginAt, now()) = 720;
    `
    //push 메시지 보내기
    logger.info("unused member warning push message")
}
//3.회원의 휴면여부 확인
//마지막 접속시간와 현재 접속시간과 비교하여 37일이 지났으면 휴면으로 전환
exports.turnInactive = async function (req, res) {
    const blockQuery = `UPDATE userInfo
                            SET status = 'INACTIVE'
                            WHERE timestampdiff(hour, userInfo.lastLoginAt, now()) = 888
                            AND status != 'DELETE';
    `
    const inactiveResult = await query(inactiveQuery);
}



