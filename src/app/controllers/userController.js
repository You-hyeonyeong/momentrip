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
 2020.1.29
jwtCheck
 */
exports.jwtCheck = async function (req, res) { 
    const userInfoIdx = req.verifiedToken.userInfoIdx
    return res.send(utils.successTrue(200, "jwt 인증이 완료되었습니다.", userInfoIdx))
}

/**
 2020.1.22
 signup API = 회원가입
 */
exports.signup = async function (req, res) {
    const {
        id, password, phoneNum, gender, birthday, nation,
        platformType, isAllowedPush, firebaseToken, fcmToken, cerificationNum
    } = req.body;

    if (!id) return res.send(utils.successFalse(301, "아이디를 입력해주세요."));
    if (!password) return res.send(utils.successFalse(302, "비밀번호를 입력 해주세요."));
    if (password.length < 4 || password.length > 20) return res.send(utils.successFalse(303, "비밀번호는 4~20자리를 입력해주세요."));
    if (!birthday || !gender || !phoneNum || !gender || !nation || !platformType || !firebaseToken || !fcmToken || !cerificationNum) return res.send(utils.successFalse(304, "입력되지 않은 값이 있습니다."));
    try {
        // 아이디 중복 확인
        const selectIdQuery = `
                SELECT id 
                FROM userInfo 
                WHERE id = ?
                AND status != 'DELETE';
                `;
        const idResult = await query(selectIdQuery, [id]);
        if (idResult.length > 0) return res.send(utils.successFalse(305, "아이디가 이미 사용중입니다."));
        // 전화번호 중복 확인
        const selectPhone = await query(`SELECT userInfoIdx
                            FROM userInfo WHERE phoneNum = ? AND status != 'DELETE';`, [phoneNum])
        console.log(`동일전화번호 가진사람 : ${selectPhone.length} 명`)
        if (selectPhone.length == 1) {
            //전화번호 동일하다고 뽑힌 사람의 userInfoIdx 의 status를 DELETE로
            const preAccountDel = await query(`UPDATE userInfo SET status = 'DELETE' WHERE userInfoIdx = ?;`, [selectPhone[0].userInfoIdx])
            logger.info(`기존계정 ${selectPhone[0].userInfoIdx}를 탈퇴 시키고 새로운 계정 만들겠습니다.`)
        }
        //회원가입 성공시 트랜젝션 처리
        const signupProcess = await transaction(async (connection) => {
            const hashedPwd = await crypto.createHash('sha512').update(password).digest('hex');
            //유저 정보 생성
            const insertUser = `
                    INSERT INTO userInfo(id, password, phoneNum, gender, birthday, nation, platformType, isAllowedPush, firebaseToken, fcmToken, cerificationNum)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `
            const userResult = await connection.query(insertUser, [id, hashedPwd, phoneNum, gender, birthday, nation, platformType, isAllowedPush, firebaseToken, fcmToken, cerificationNum]);
            // 유저 그룹 생성
            const insertGroup = `
                    INSERT INTO colorGroup (userInfoIdx)
                    VALUES (?)
                `;
            const groupResult = await connection.query(insertGroup, [userResult.insertId])
            //유저 배터리 생성
            const insertBattery = `
                    INSERT INTO battery (userInfoIdx, variation, percents, type)
                    VALUES (?, ?, ?, ?)
                `
            const batteryResult = await connection.query(insertBattery, [userResult.insertId, '+', 100, 'WELCOME'])
            // fireDB 유저정보 입력 (트랜젝션 처리 포함 안됨)
            const users = userDB.doc(`${userResult.insertId}`)
            let message = users.set({
                userInfoIdx: userResult.insertId,
                battery: 100,
                latitude: null,
                longitude: null
            });
        });
        if (signupProcess === "fail") {
            logger.info("회원가입 트렌젝션 실패")
            return res.send(utils.successFalse(400, "회원가입 실패"));
        }
        else {
            logger.info("회원가입 성공")
            return res.send(utils.successTrue(201, "회원가입 성공"));
        }
    } catch (err) {
        logger.error(`App - signup error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};
/**
 2020.1.22
 signin API = 로그인
 */
exports.signin = async function (req, res) {
    const {
        id, password
    } = req.body;
    if (!id) return res.send(utils.successFalse(301, "아이디를 입력해주세요."));
    if (!password) return res.send(utils.successFalse(302, "비밀번호를 입력해주세요."));
    try {
        const selectUserInfoQuery = `
                SELECT userInfoIdx, id, password, status
                FROM userInfo 
                WHERE id = ? AND status != 'DELETE';
                `
        const userResult = await query(selectUserInfoQuery, [id]);
        console.log(userResult.length)
        if (userResult.length < 1) {
            return res.send(utils.successFalse(305, "아이디와 비밀번호를 확인해주세요."));
        } else {
            if (userResult[0].status === "INACTIVE") {
                return res.send(utils.successFalse(303, "휴면계정입니다."));
            }
            const hashedPwd = await crypto.createHash('sha512').update(password).digest('hex');
            if (userResult[0].password !== hashedPwd) {
                return res.send(utils.successFalse(304, "아이디와 비밀번호를 확인해주세요"));
            } else {
                //토큰 생성
                let token = await jwt.sign({
                    userInfoIdx: userResult[0].userInfoIdx,
                    id: userResult[0].id,
                }, // 토큰의 내용(payload)
                    secret_config.jwtsecret, // 비밀 키
                    {
                        expiresIn: '365d',
                        subject: 'userInfo',
                    } // 유효 시간은 365일
                );
                //마지막 접속시간 업데이트
                const lastloginResult = await query(`UPDATE userInfo SET lastLoginAt = current_timestamp WHERE userInfoIdx = ? ;`, [userResult[0].userInfoIdx])
                logger.info(`idx: ${userResult[0].userInfoIdx}, id: ${userResult[0].id} 로그인 성공`)
                const user = {
                    "token" : token,
                    "userInfoIdx" : userResult[0].userInfoIdx
                }
                res.send(utils.successTrue(200, "로그인 성공", user));
            }
        }
    } catch (err) {
        logger.error(`App - Signin Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

/**
 2020.01.23
 idcheck API = 아이디 중복검사
 */
exports.idCheck = async function (req, res) {
    const id = req.body.id;
    try {
        const selectIdQuery = `
            SELECT id 
            FROM userInfo 
            WHERE id = ? AND status != 'DELETE';
            `;
        const idResult = await query(selectIdQuery, [id]);
        console.log(idResult.length);
        if (idResult.length > 0) return res.send(utils.successFalse(301, "아이디가 이미 사용중입니다"))
        return res.send(utils.successTrue(200, "사용 가능한 아이디 입니다."))

    } catch (err) {
        logger.error(`App - idcheck Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
/**
 2020.01.27
phoneCheck API = 핸드폰 번호 중복확인
 */
exports.phoneCheck = async function (req, res) {
    const phoneNum = req.body.phoneNum;
    if(!phoneNum)  return res.send(utils.successTrue(302, "핸드폰 번호를 입력해주세요"))
    try {
        const selectPhone = await query(`SELECT userInfoIdx, id, phoneNum, status FROM userInfo WHERE phoneNum = ? AND status != 'DELETE';`, [phoneNum])
        console.log(selectPhone.length);
        if (selectPhone.length == 0) return res.send(utils.successFalse(301, "사용 가능한 전화번호 입니다."))
        logger.info(`${selectPhone[0].userInfoIdx} 와 동일한 전화번호로 가입시도`)
        return res.send(utils.successTrue(200, "동일한 전화번호로 가입된 아이디가 있습니다."))

    } catch (err) {
        logger.error(`App - phoneCheck Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
/**
 2020.01.26
phoneNum API = 전화번호 인증
 */
exports.phoneNum = async function (req, res) {
    const userInfoIdx = req.verifiedToken.userInfoIdx
    const phoneNum = req.body.phoneNum;
    const cerificationNum = req.body.cerificationNum
    if(!phoneNum || !cerificationNum ) return res.send(utils.successFalse(301, "전화번호와 인증횟수를 같이 보내주세요"))
    try {
        const userPhoneQuery = await query(`SELECT userInfoIdx, id FROM userInfo WHERE userInfoIdx = ? AND phoneNum = ?`,[userInfoIdx, phoneNum])
        if(userPhoneQuery.length == 1) {
            logger.info(`기존정보로 전화번호 인증완료`)
            return res.send(utils.successTrue(200, "전화번호 인증 완료"))
        } else {
            const userPhoneResult = await query(`SELECT userInfoIdx, id FROM userInfo WHERE phoneNum = ? AND status != 'DELETE';`, [phoneNum])
            if(userPhoneResult.length > 0) {
                const preAccountDel = await query(`UPDATE userInfo SET status = 'DELETE' WHERE userInfoIdx = ? AND userInfoIdx != ?;`, [userPhoneResult[0].userInfoIdx, userInfoIdx ])
                logger.info(`기존계정 ${userPhoneResult[0].userInfoIdx}를 탈퇴 시켰습니다`)
                const updatePhoneQuery = `UPDATE userInfo SET phoneNum = ?, cerificationNum = cerificationNum + ? WHERE userInfoIdx = ?`
                const updatePhoneResult = await query(updatePhoneQuery, [phoneNum, cerificationNum, userInfoIdx])
                return res.send(utils.successTrue(201, "기존 정보 삭제 후 완료"))
            } else {
                const updatePhoneQuery = `UPDATE userInfo SET phoneNum = ?, cerificationNum = cerificationNum + ? WHERE userInfoIdx = ?`
                const updatePhoneResult = await query(updatePhoneQuery, [phoneNum, cerificationNum, userInfoIdx])
                logger.info(`업데이트 후 전화번호 인증완료`)
                return res.send(utils.successTrue(202, "업데이트 후 전화번호 인증 완료"))
            }
        }
    } catch (err) {
        logger.error(`App - phoneNum Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
