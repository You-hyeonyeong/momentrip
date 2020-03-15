const { logger } = require('../../../config/winston');
const { query } = require('../../../config/database');
const { transaction } = require('../../../config/database');
const { userDB, chatDB, admin } = require('../../../modules/firebaseDBModule');
const jwtMiddleware = require('../../../config/jwtMiddleware');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const utils = require('../../../modules/resModule')

/**
 자동로그인
 */
exports.jwtCheck = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    try {
        const selectUserStatus = await query(`SELECT userInfoIdx FROM userInfo WHERE userInfoIdx = ?;`, [userInfoIdx]);;
        return res.send(utils.successTrue(200, "jwt 인증이 완료되었습니다."))
    } catch (err) {
        logger.error(`App - jwtCheck error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
/*
로컬 회원가입
*/
exports.signup = async function (req, res) {
    const { userEmail, userPw, userBirth, userName, type } = req.body;

    if (!userEmail || !userPw || !userBirth || !userName) return res.send(utils.successFalse(301, "입력되지 않은 값이 있습니다."));
    try {
        // 아이디 중복 확인
        const selectIdResult = await query(`SELECT userEmail FROM userInfo WHERE userEmail = ? `, [userEmail]);
        if (selectIdResult.length > 0) return res.send(utils.successFalse(302, "아이디가 이미 사용중입니다."));

        const hashedPwd = await crypto.createHash('sha512').update(userPw).digest('hex');

        //유저 정보 생성
        const userResult = await query(`INSERT INTO userInfo(userEmail, userPw, userBirth, userName, type)
                                            VALUES (?, ?, ?, ?, ?);`, [userEmail, hashedPwd, userBirth, userName, 'LOCAL']);
        //토큰 생성
        let token = await jwt.sign({
            userInfoIdx: userResult.insertId,
            userEmail: userEmail,
        }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀 키
            {
                expiresIn: '365d',
                subject: 'userInfo',
            } // 유효 시간은 365일
        );
        const userInfo = {
            "token": token,
            "userInfoIdx": userResult.insertId
        }
        logger.info(`${userResult.insertId} 회원가입 성공`);
        return res.send(utils.successTrue(201, "회원가입 성공", userInfo));
    } catch (err) {
        logger.error(`App - signup error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};

/**
로그인
 */

exports.signin = async function (req, res) {
    const { userEmail, userPw } = req.body;
    if (!userEmail || !userPw) return res.send(utils.successFalse(301, "입력되지 않은 값이 있습니다."));
    try {
        const userResult = await query(`SELECT userInfoIdx, userEmail, userPw FROM userInfo WHERE userEmail = ?;`, [userEmail]);
        if (userResult.length < 1) {
            return res.send(utils.successFalse(302, "아이디와 비밀번호를 확인해주세요."));
        } else {
            const hashedPwd = await crypto.createHash('sha512').update(userPw).digest('hex');
            if (userResult[0].userPw !== hashedPwd) {
                return res.send(utils.successFalse(304, "아이디와 비밀번호를 확인해주세요"));
            } else {
                //토큰 생성
                let token = await jwt.sign({
                    userInfoIdx: userResult[0].userInfoIdx,
                    userEmail: userEmail,
                }, // 토큰의 내용(payload)
                    secret_config.jwtsecret, // 비밀 키
                    {
                        expiresIn: '365d',
                        subject: 'userInfo',
                    } // 유효 시간은 365일
                );
                const user = {
                    "token": token,
                    "userInfoIdx": userResult[0].userInfoIdx
                }
                logger.info(`${userResult[0].userInfoIdx} 로그인 성공`);
                res.send(utils.successTrue(200, "로그인 성공", user));
            }
        }
    } catch (err) {
        logger.error(`App - Signin Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

/**
 마이페이지 조회
 여행 횟수, 국가, 도시

 */
exports.getMypage = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    try {
        const tripCount = await query(`SELECT count(1) as tripCount FROM trip WHERE userInfoIdx = ?;`, [userInfoIdx]);
        const countryCount = await query(`SELECT country FROM trip WHERE userInfoIdx = ? GROUP BY country;`, [userInfoIdx]);
        const cityCount = await query(` SELECT city FROM trip WHERE userInfoIdx = ? GROUP BY city;`, [userInfoIdx]);
        const userInfo = {
            tripCount:tripCount[0].tripCount,
            countryCount:countryCount.length,
            cityCount:cityCount.length
        }
        return res.send(utils.successTrue(200, "마이페이지 조회 성공", userInfo))
    } catch (err) {
        logger.error(`App - getMypage error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
/**
카테고리별 조회
 */
exports.getByCategory = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const categoryIdx = req.params.categoryIdx
    try {
        const selectByCategory = await query(`
        SELECT thumnail, country, city, CONCAT(DATE_FORMAT(startedAt, '%y.%m.%d'),'-',DATE_FORMAT(endedAt, '%y.%m.%d')) as date,
        CONCAT(v.days,'DAY') as day
        FROM trip t
        JOIN video v on t.tripIdx = v.tripIdx
        WHERE t.userInfoIdx = ? AND v.categoryIdx = ?;`, [userInfoIdx, categoryIdx]);
        if(selectByCategory.length == 0) return res.send(utils.successTrue(301, "해당 데이터가 없습니다"))
        return res.send(utils.successTrue(200, "카테고리별 조회 성공",selectByCategory))
    } catch (err) {
        logger.error(`App - getByCategory error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}


