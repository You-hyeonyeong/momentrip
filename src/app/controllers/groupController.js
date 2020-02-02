const { query } = require('../../../config/database');
const { logger } = require('../../../config/winston');
const utils = require('../../../modules/resModule')

/**
2020.01.26
컬러 그룹 조회
변경하는거 생각해보아야함
 */
exports.getColorGroup = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    try {
        //그룹 테스트 
        const getGroupName = await query(`
        SELECT colorGroup.blue, colorGroup.red, colorGroup.yellow, colorGroup.green, colorGroup.purple
        FROM colorGroup
        WHERE userInfoIdx = ?;
        `, [userInfoIdx])
        const getGroupNumName = await query(`SELECT groupName, count(1) FROM friends WHERE requester = ? GROUP BY groupName;`, [userInfoIdx])
        const groupResult = {
            "groupName" : getGroupName,
            "groupNum" : getGroupNumName

        }



        // const customName = await query(`select blue, red, yellow, green, purple from colorGroup where userInfoIdx = ?;`,[userInfoIdx]) //이름
        // const groupQuery = `
        // SELECT colorGroup.blue, colorGroup.red, colorGroup.yellow, colorGroup.green, colorGroup.purple,
        //     (SELECT count(1) FROM friends WHERE requester = ? AND groupName = 'blue' AND status = 'FRIEND') as blueNum,
        //     (SELECT count(1) FROM friends WHERE requester = ? AND groupName = 'red' AND status = 'FRIEND') as redNum,
        //     (SELECT count(1) FROM friends WHERE requester = ? AND groupName = 'yellow' AND status = 'FRIEND') as yellowNum,
        //     (SELECT count(1) FROM friends WHERE requester = ? AND groupName = 'green' AND status = 'FRIEND') as greenNum,
        //     (SELECT count(1) FROM friends WHERE requester = ? AND groupName = 'purple' AND status = 'FRIEND') as purpleNum
        // FROM colorGroup
        // WHERE userInfoIdx = ?;
        // `;
        // const groupResult = await query(groupQuery, [userInfoIdx, userInfoIdx, userInfoIdx, userInfoIdx, userInfoIdx, userInfoIdx]);
        return res.send(utils.successTrue(200, "전체 그룹조회 성공", groupResult));
    } catch (err) {
        logger.error(`App - getColorGroup error\n: ${err.message}`);
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
        if (!groupName || !customName) return res.send(utils.successFalse(301, "입력되지 않은 값이 있습니다."));
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


