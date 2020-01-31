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
2019.01.31
edit profileImg API = 프로필 수정
 **/
exports.patchProfileImg = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const profileImg = req.body.profileImg;
    try {
        if(!profileImg) return res.send(utils.successTrue(303, "프로필 사진을 선택해 주세요"))
        const userResult = await query(`SELECT userInfoIdx, id, profileImg, chatImg 
                                        FROM userInfo WHERE userInfoIdx = ? AND status = 'ACTIVE';`, [userInfoIdx]);
        if(userResult.length == 0) return res.send(utils.successTrue(302, "회원이 존재하지 않습니다."))
        const profileQuery = `
                UPDATE userInfo 
                SET profileImg = ?
                WHERE userInfoIdx = ?
                `
        const profileResult = await query(profileQuery, [profileImg, userInfoIdx])
        if (profileResult.length > 0) return res.send(utils.successFalse(301, "프로필사진 수정 실패"))
        return res.send(utils.successTrue(200, "프로필사진 수정 성공"))

    } catch (err) {
        logger.error(`App - profile Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};

/**
2019.01.31
edit chatImg API = 채팅사진 수정
 **/
exports.patchChatImg = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const chatImg = req.body.chatImg;
    try {
        if(!chatImg) return res.send(utils.successTrue(303, "채팅 사진을 선택해 주세요"))
        const userResult = await query(`SELECT userInfoIdx, id, profileImg, chatImg 
                                        FROM userInfo WHERE userInfoIdx = ? AND status = 'ACTIVE';`, [userInfoIdx]);
        if(userResult.length == 0) return res.send(utils.successTrue(302, "회원이 존재하지 않습니다."))
        const chatQuery = `
                UPDATE userInfo 
                SET chatImg = ?
                WHERE userInfoIdx = ?
                `
        const chatResult = await query(chatQuery, [chatImg, userInfoIdx])

        if (chatResult.length > 0) return res.send(utils.successFalse(301, "채팅사진 수정 실패"))
        return res.send(utils.successTrue(200, "채팅사진 수정 성공"))

    } catch (err) {
        logger.error(`App - profile Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }

};
