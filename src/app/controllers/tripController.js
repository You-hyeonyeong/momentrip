const { logger } = require('../../../config/winston');
const { query } = require('../../../config/database');
const { transaction } = require('../../../config/database');
const { userDB, chatDB, admin } = require('../../../modules/firebaseDBModule');
const jwtMiddleware = require('../../../config/jwtMiddleware');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const utils = require('../../../modules/resModule')

/*
이전 여행 조회
*/
exports.getTripHistory = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    try {
        const tripResult = await query(`
        SELECT tripIdx, title, tripImg, country, city, CONCAT(DATE_FORMAT(startedAt, '%y.%m.%d'),'-',DATE_FORMAT(endedAt, '%y.%m.%d')) as date,
        DATE_FORMAT(startedAt, '%Y') as year
        FROM trip
        WHERE trip.userInfoIdx = ? AND endedAt < current_timestamp ;
        `, [userInfoIdx]);
        if (tripResult.length > 0) return res.send(utils.successTrue(200, "홈 이전 여행 조회 성공", tripResult));
        return res.send(utils.successFalse(301, "이전 여행 목록이 없습니다"));
    } catch (err) {
        logger.error(`App - getTripHistory error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};

/**
이전 여행 상세 조회
 */

exports.getOneTripHistory = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx;
    const tripIdx = req.params.tripIdx;
    try {
        const tripResult = await query(`
        SELECT v.videoIdx, v.categoryIdx, v.thumnail, v.videoLink, v.videoText, v.address, v.latitude, v.longitude, v.days, v.createdAt
        FROM video v JOIN trip t ON v.tripIdx = t.tripIdx
        WHERE v.tripIdx = ? AND t.userInfoIdx = ?;`, [tripIdx, userInfoIdx]);

        if (tripResult.length > 0) return res.send(utils.successTrue(200, "이전 여행 상세조회 성공", tripResult));
        return res.send(utils.successFalse(301, "이전 여행상세 목록이 없습니다"));

    } catch (err) {
        logger.error(`App - getOneTripHistory error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
/**
여행 등록
 */
exports.postTrip = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx;
    const startedAt = req.body.startedAt;
    const endedAt = req.body.endedAt;

    try {
        const insertTripResult = await query(`INSERT INTO trip (userInfoIdx, startedAt, endedAt) VALUES (?, ?, ?)`, [userInfoIdx, startedAt, endedAt])
        return res.send(utils.successTrue(200, "여행 만들기 성공", { tripIdx: insertTripResult.insertId }));
    } catch (err) {
        logger.error(`App - postTrip error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
/**
여행 일별 등록
title tripImg country city
videoLink, videoText, latitude, longitude, days
 */
exports.postTripDay = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx;
    const tripIdx = req.params.tripIdx;
    const categoryIdx = req.body.categoryIdx;
    const thumnail = req.body.thumnail;
    const videoLink = req.body.videoLink;
    const videoText = req.body.videoText;
    const address = req.body.address;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    const days = req.body.days;

    const tripImg = req.body.tripImg;
    const country = req.body.country;
    const city = req.body.city;

    try {
        const checkDay1Result = await query(`SELECT videoIdx FROM video WHERE tripIdx = ? AND days = 1;`, [tripIdx])
        if (checkDay1Result.length == 0) { // trip에 title tripImg country city 넣어줘야해
            if (!tripIdx || !categoryIdx || !thumnail || !videoLink || !videoText || !address || !latitude || !longitude || !days || !tripImg || !country || !city) return res.send(utils.successFalse(301, '입력되지 않은 값이 있습니다.'));
            const updateTripResult = await query(`UPDATE trip SET title = ?, tripImg = ?, country = ?, city = ? WHERE tripIdx = ?`, [country, tripImg, country, city, tripIdx])
            const insertDayResult = await query(
                `INSERT INTO video(tripIdx, categoryIdx, thumnail, videoLink, videoText, address, latitude, longitude, days, createdAt) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)`, [tripIdx, categoryIdx, thumnail, videoLink, videoText, address, latitude, longitude, days])
            return res.send(utils.successTrue(200, `Day${days} 하루 영상 기록 성공`));
        } else {
            if (!tripIdx || !categoryIdx || !thumnail || !videoLink || !videoText || !address || !latitude || !longitude || !days) return res.send(utils.successFalse(301, '입력되지 않은 값이 있습니다.'));
            const insertDayResult = await query(
                `INSERT INTO video(tripIdx, categoryIdx, thumnail, videoLink, videoText, address, latitude, longitude, days, createdAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp)`, [tripIdx, categoryIdx, thumnail, videoLink, videoText, address, latitude, longitude, days])
            return res.send(utils.successTrue(200, `Day${days} 하루 영상 기록 성공`));

        }
    } catch (err) {
        logger.error(`App - postTripDay error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};

/*
여행 제목 수정
*/
exports.patchTripName = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const tripIdx = req.params.tripIdx;
    const title = req.body.title;
    try {
        const tripNameResult = await query(`UPDATE trip SET title = ? WHERE tripIdx = ? AND userInfoIdx = ?;`, [title, tripIdx, userInfoIdx]);
        return res.send(utils.successTrue(200, "여행 제목 수정 성공"));
    } catch (err) {
        logger.error(`App - patchTripName error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
/*
여행 텍스트 수정
*/
exports.patchTripText = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const videoIdx = req.params.videoIdx;
    const videoText = req.body.videoText;

    try {
        const tripTextResult = await query(`UPDATE video SET videoText = ? WHERE videoIdx = ? ;`, [videoText, videoIdx]);
        if(tripTextResult.changedRows == 0) return res.send(utils.successFalse(301, "이미 수정되었거나 수정할 수 없습니다."));
        return res.send(utils.successTrue(200, "여행 텍스트 수정 성공"));
    } catch (err) {
        logger.error(`App - patchTripText error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
/*
여행 기간 수정
*/
exports.patchTripDate = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const tripIdx = req.params.tripIdx;
    const startedAt = req.body.startedAt;
    const endedAt = req.body.endedAt;
    try {
        const tripDateResult = await query(`UPDATE trip SET startedAt = ?, endedAt = ? WHERE tripIdx = ? AND userInfoIdx = ?;`, [startedAt, endedAt, tripIdx, userInfoIdx]);
        if(tripDateResult.changedRows == 0) return res.send(utils.successFalse(301, "이미 수정되었거나 수정할 수 없습니다."));
        return res.send(utils.successTrue(200, "여행 기간 수정 성공"));
    } catch (err) {
        logger.error(`App - patchTripDate error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
/*
여행 상태 체크
*/
exports.checkTripStatus = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    try {
        const tripStatusResult = await query(`SELECT tripIdx FROM trip WHERE current_timestamp BETWEEN startedAt AND endedAt AND userInfoIdx = ?;`, [userInfoIdx]);
        if(tripStatusResult.length > 0 ) return res.send(utils.successTrue(200, "여행 중 입니다",tripStatusResult));
        return res.send(utils.successTrue(201, "여행 중이 아닙니다"));
    } catch (err) {
        logger.error(`App - checkTripStatus error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};






