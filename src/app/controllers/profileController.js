const { logger } = require('../../../config/winston');
const { query } = require('../../../config/database');
const { transaction } = require('../../../config/database');
const { firebaseDB } = require('../../../modules/firebaseDBModule')

const utils = require('../../../modules/resModule')


/**
2019.01.25
profile API = 프로필 조회
 **/
exports.getProfile = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    try {
        const selectUserQuery = `
            SELECT userInfoIdx, id, profileImg, nation, birthday
            FROM userInfo 
            WHERE userInfoIdx = ? AND status = 'ACTIVE';
            `;
        const userResult = await query(selectUserQuery, [userInfoIdx]);
        console.log(userResult.length);
        if (userResult.length == 0) return res.send(utils.successFalse(301, "해당 회원정보가 없습니다."))
        return res.send(utils.successTrue(200, "프로필 조회 성공", userResult[0]))

    } catch (err) {
        logger.error(`App - profile Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }

};

/**
2019.01.25
editProfile API = 프로필 수정
profileImg, chatImg 만 가능하다고 가정
 **/
exports.patchProfile = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const profileImg = req.body.profileImg;
    const chatImg = req.body.chatImg;
    try {
        const userResult = await query(`SELECT userInfoIdx, id, profileImg, chatImg 
                                        FROM userInfo WHERE userInfoIdx = ? AND status = 'ACTIVE';`, [userInfoIdx]);
        const profileQuery = `
                UPDATE userInfo 
                SET (profileImg, chatImg) = (? ,?)
                WHERE userInfoIdx = ?
                `
        const profileResult = await query(profileQuery, [userInfoIdx])
        //RTDB에서도 수정

        if (idResult.length > 0) return res.send(utils.successFalse(301, "프로필 수정 실패"))
        return res.send(utils.successTrue(200, "프로필 수정 성공"))

    } catch (err) {
        logger.error(`App - profile Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }

};
