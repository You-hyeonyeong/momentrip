const { query } = require('../../../config/database');
const {logger} = require('../../../config/winston');
const utils = require('../../../modules/resModule')

const jwt = require('jsonwebtoken');
const secret_config = require('../../../config/secret');

/**
2020.01.10
공지사항 전체 조회
 */
exports.getAllNoti = async function (req, res) {
    try {
        const selectNoticeQuery = `
                SELECT noticeIdx, contents, DATE_FORMAT(createdAt, '%Y.%m.%d %H:%i') as createdAt
                FROM notice
                WHERE type = "NOTI";
                `;
        const notiResult = await query(selectNoticeQuery);
        res.send(utils.successTrue(200, "전체 공지조회 성공", notiResult));
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};

/**
2020.01.10
공지사항 세부 조회
 */
exports.getOneNoti = async function (req, res) {
    try {
        const selectNoticeQuery = `
                SELECT noticeIdx, contents, DATE_FORMAT(createdAt, '%Y.%m.%d') as createdAt
                FROM notice
                WHERE type = "NOTI" AND noticeIdx = ?;
                `;
        const notiResult = await query(selectNoticeQuery,[req.params.noticeIdx]);
        res.send(utils.successTrue(200, "세부 공지조회 성공", notiResult[0]));
    } catch (err) {
        logger.error(`App - Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};