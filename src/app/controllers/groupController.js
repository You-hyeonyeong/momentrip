const { query } = require('../../../config/database');
const { logger } = require('../../../config/winston');
const utils = require('../../../modules/resModule')

/**
2020.01.26
컬러 그룹 조회
 */
exports.getColorGroup = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    try {
        const groupQuery = `
        SELECT colorGroup.blue, colorGroup.red, colorGroup.yellow, colorGroup.green, colorGroup.purple,
            (SELECT count(1) FROM friends WHERE userInfoIdx = ? AND group = 'BLUE') as blueNum,
            (SELECT count(1) FROM friends WHERE userInfoIdx = ? AND group = 'RED') as redNum,
            (SELECT count(1) FROM friends WHERE userInfoIdx = ? AND group = 'YELLOW') as yellowNum,
            (SELECT count(1) FROM friends WHERE userInfoIdx = ? AND group = 'GREEN') as greenNum,
            (SELECT count(1) FROM friends WHERE userInfoIdx = ? AND group = 'PURPLE') as purpleNum
        FROM colorGroup
        WHERE userInfoIdx = ?;
            `;
        const groupResult = await query(groupQuery, [userInfoIdx]);
        res.send(utils.successTrue(200, "전체 그룹조회 성공", groupResult));
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
/**
2020.01.
그룹별 친구 조회
 */

/**
2020.01.29
그룹이름 변경
*/
exports.changeGroupName = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const groupName = req.body.groupName;
    const customName = req.body.customName;

    try {
        if(!groupName || !customName) return res.send(utils.successFalse(301, "입력되지 않은 값이 있습니다."));
        if (groupName == 'red' || groupName == 'blue' || groupName == 'yellow' || groupName == 'green' || groupName == 'purple') {
            const changeNameQuery = `UPDATE colorGroup SET ${groupName} = ? WHERE userInfoIdx = ?; `;
            const changeNameResult = await query(changeNameQuery, [customName, userInfoIdx]);
            logger.info(`update ${userInfoIdx}'s [${groupName}] groupName change`)
            res.send(utils.successTrue(200, `[${groupName}] 그룹 이름 변경 성공`));
        } else return res.send(utils.successFalse(302, "그룹명을 올바로 입력해주세요"));
    } catch (err) {
        logger.error(`App - changeGroupName error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};


/**
2020.01.
친구 그룹 변경
*/


