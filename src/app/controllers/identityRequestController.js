const { query } = require('../../../config/database');
const { logger } = require('../../../config/winston');
const utils = require('../../../modules/resModule')

/**
2020.02.02
정체 공개 요청 API
내가 누구인지 
누구(들)한테 보내는지 (어떤 그룹 몇명)
뭐라고 보내는지

배터리소모 (배터리 있는지 없는지에 따라 광고시청)
 */
exports.reqIdentity = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const friendsIdx = req.body.friendsIdx //array
    const message = req.body.message;
    if (!friendsIdx || !message) return res.send(utils.successFalse(301, "요청 보낼 사람과 메시지를 입력해주세요"));
    try {
        //요청자가 배터리가 friends.length *10 만큼 있는지 확인
        for (var i in friendsIdx) {
            const reqIdentityResult = await query(`
                INSERT INTO identityRequest (requester, responser, message) VALUES (?, ?, ?)
                `, [userInfoIdx, friendsIdx[i], message])
        }
        //배터리 friends.length *10 만큼  소모하기
        return res.send(utils.successTrue(200, "공개 요청 성공"));
        //배터리 없으면 광고 시청 api

    } catch (err) {
        logger.error(`App - reqIdentity Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};

/**
2020.02.02
정체 공개 요청 수락 API
identityRequest 테이블에 수락시간 입력
firestore 채팅방생성

 */
exports.resIdentity = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const requester = req.body.requester
    if(!requester) return res.send(utils.successFalse(301, "요청한 사람을 입력해주세요"));
    try {
        const selectReq = await query(`SELECT requester, responser, message FROM identityRequest WHERE requester = ? AND responser = ?;`, [requester, userInfoIdx])
        console.log(selectReq.length);
        
        if (selectReq.length > 0) {
            const resIdentityResult = await query(`
                    UPDATE identityRequest SET status = 'MATCH', responseAt = current_timestamp 
                    WHERE requester = ? AND responser = ?;`, [requester, userInfoIdx])
            //firestore 채팅방 생성
            return res.send(utils.successTrue(200, "공개요청 수락 후 채팅방 생성"));
        } else return res.send(utils.successFalse(302, "요청받은 내역이 없습니다"));
    } catch (err) {
        logger.error(`App - resIdentity Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};