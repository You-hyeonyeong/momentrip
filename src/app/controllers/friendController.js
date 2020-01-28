const { query } = require('../../../config/database');
const { logger } = require('../../../config/winston');
const utils = require('../../../modules/resModule');
const { transaction } = require('../../../config/database');

/**
2020.01.26
친구 전체 조회
 */
exports.getFriends = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    try {
        const friendsQuery = `
            SELECT f.responser responserIdx, r.responserName, u.profileImg,
                (SELECT count(f.responser) FROM friends f WHERE f.requester = responserIdx) as friendNum
            FROM friends f
            JOIN userInfo u ON u.userInfoIdx = f.responser
            WHERE f.requester = ? AND f.status = 'FRIEND' ;
            `;
        const friendsResult = await query(friendsQuery, [userInfoIdx]);
        res.send(utils.successTrue(200, "전체 친구조회 성공", friendsResult));
    } catch (err) {
        logger.error(`App - getFriends Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
/**
2020.01.27
친구 요청
 */
exports.reqFriends = async function (req, res) {
    const requester = req.verifiedToken.userInfoIdx
    const responser = req.body.responser
    try {
        //이미 친구인지 아닌지 확인 필요
        const isFriend = await query(`SELECT responser FROM friends WHERE requester = ? AND responser = ?;`, [requester, responser])
        if (isFriend.length > 0) {
            res.send(utils.successFalse(301, "이미 요청 보낸 상태임으로 친구 요청 보낼 수 없음"));
        } else {
            //친구 이름 가져오기
            const getFriendsName = await query(`SELECT id FROM userInfo WHERE userInfoIdx = ?`, [responser])
            const reqFriendsQuery = `
                INSERT INTO friends(requester, responser, responserName, status, requestAt) VALUES (?, ?, ? ,'REQUEST', current_timestamp);
            `;
            const reqFriendsResult = await query(reqFriendsQuery, [requester, responser, getFriendsName[0].id]);
            res.send(utils.successTrue(200, "친구요청 성공"));

        }

    } catch (err) {
        logger.error(`App - reqFriends Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
/**
2020.01.27
친구 수락
내가 res로 있는걸 보고서
1. res req 로 컬럼 하나 추가하고 상태는 FRIEND로 추가
2. req res 찾아서 상태값을 FRIEND로 변경해줌
 */
exports.resFriends = async function (req, res) {
    const responser = req.verifiedToken.userInfoIdx
    const requester = req.body.requester
    try {
        //요청받은게 있는지 확인
        const isReq = await query(`SELECT responser FROM friends WHERE requester = ? AND responser = ?`, [requester, responser])
        console.log(isReq);
        
        if(isReq.length == 0) return res.send(utils.successFalse(301, "요청 받은 내역이 없습니다."));
        const friend = await transaction(async (connection) => {
            const getFriendsName = await query(`SELECT id FROM userInfo WHERE userInfoIdx = ?`, [requester])
            //응답자 해당하는 컬럼 하나 추가
            const resFriendsQuery = await connection.query(`INSERT INTO friends(requester, responser, responserName, status, responseAt) 
                                                            VALUES (?, ?, ?, 'FRIEND', current_timestamp);`, [responser, requester, getFriendsName[0].id])
            //요청자 상태 변경
            const updateRequester = await connection.query(`UPDATE friends SET status = 'FRIEND' WHERE responser = ? AND requester = ?;`, [responser, requester])
        });
        
        if(friend === "fail") {
            logger.info("트렌젝션 실패");
            return res.send(utils.successFalse(301, "친구 요청 수락 실패"));
        } else return res.send(utils.successTrue(200, "친구 요청 수락 성공"));
        
    } catch (err) {
        logger.error(`App - resFriends Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}

/**
2020.01.
친구 거절
 */

 /**
2020.01.
아직 친구아닌 사람조회
status != 'FRIEND'
 */


/**
2020.01.
전화번호로 친구 검색
*/

/**
2020.01.
아이디로 친구 검색
*/

//응답대기중인 친구 조회
/**
2020.01.
친구 이름 변경
*/



