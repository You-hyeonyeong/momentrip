const { query } = require('../../../config/database');
const { logger } = require('../../../config/winston');
const utils = require('../../../modules/resModule')

/**
2020.01.31
친구 아이디로 검색
 */
exports.getById = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const id = req.query.id
    try {
        const getIdQuery = `
        SELECT userInfo.userInfoIdx, userInfo.id, userInfo.profileImg,
            (SELECT count(1) FROM friends WHERE requester = userInfo.userInfoIdx AND friends.status = 'FRIEND') as friendNum,
            IFNULL((SELECT status FROM friends WHERE requester = ? AND responser = userInfo.userInfoIdx),0) as friendStatus
        FROM userInfo WHERE id LIKE ? AND status != 'DELETE';
        `
       const getIdResult = await query(getIdQuery, [userInfoIdx, '%' + id + '%'])

       if(getIdResult.length == 0) return res.send(utils.successFalse(301, "검색결과 없습니다."));
       return res.send(utils.successTrue(200, "친구 아이디로 검색 성공", getIdResult));
    } catch (err) {
        logger.error(`App - getById error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
/**
2020.01.31
친구 전화번호로 검색
 */
exports.getByPhoneNum = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const phoneNum = req.query.phoneNum

    try {
        const getPhoneQuery = `
        SELECT userInfo.userInfoIdx, userInfo.id, userInfo.profileImg,
            (SELECT count(1) FROM friends WHERE requester = userInfo.userInfoIdx AND friends.status = 'FRIEND') as friendNum,
            IFNULL((SELECT status FROM friends WHERE requester = ? AND responser = userInfo.userInfoIdx),0) as friendStatus
        FROM userInfo WHERE phoneNum = ? AND status != 'DELETE';`
        const getPhoneResult = await query(getPhoneQuery,[userInfoIdx, '+'+phoneNum])
       console.log(getPhoneResult);
       if(getPhoneResult.length == 0) return res.send(utils.successFalse(301, "검색결과 없습니다."));
        res.send(utils.successTrue(200, "친구 핸드폰 번호로 검색 성공", getPhoneResult));
    } catch (err) {
        logger.error(`App - getByPhoneNum error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
