const { logger } = require('../../../config/winston');
const { query } = require('../../../config/database');
const { transaction } = require('../../../config/database');
const { rtdb } = require('../../../modules/rtdbModule')

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const utils = require('../../../modules/resModule')

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
        const selectPhoneQuery = `
                SELECT phoneNum 
                FROM userInfo 
                WHERE id = ?
                AND status != 'DELETE';
                `;
        const phoneResult = await query(selectPhoneQuery, [phoneNum]);
        if (phoneResult.length > 0) return res.send(utils.successFalse(306, "동일한 전화번호로 가입된 아이디가 있습니다"));

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
            // RTDB 유저정보 입력

        });
        if (signupProcess === "fail") {
            logger.info("회원가입 트렌젝션 실패")
            return res.send(utils.successFalse(400, "회원가입 실패"));
        }
        else return res.send(utils.successTrue(201, "회원가입 성공"));
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
                return res.send(utils.successFalse(306, "아이디와 비밀번호를 확인해주세요"));
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
                res.send(utils.successTrue(200, "로그인 성공", token));
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
    try {
        const selectPhone = await query(`SELECT userInfoIdx, id, phoneNum, status FROM userInfo WHERE phoneNum = ? AND status != 'DELETE';`, [phoneNum])
        console.log(selectPhone.length);
        if (selectPhone.length == 0) return res.send(utils.successFalse(301, "사용 가능한 전화번호 입니다."))
        return res.send(utils.successTrue(200, "동일한 전화번호로 가입된 아이디가 있습니다.", selectPhone[0]))

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
    if(!phoneNum || !cerificationNum ) return res.send(utils.successFalse(302, "전화번호와 인증횟수를 같이 보내주세요"))
    try {
        const userQuery = `SELECT userInfoIdx, id FROM userInfo WHERE userInfoIdx = ?`
        const userResult = await query(userQuery, [userInfoIdx])

        if (userResult.length == 1) {
            //update phoneNum
            const updatePhoneQuery = `UPDATE userInfo SET phoneNum = ?, cerificationNum = cerificationNum + ? WHERE userInfoIdx = ?`
            const updatePhoneResult = await query(updatePhoneQuery, [phoneNum, cerificationNum, userInfoIdx])
            return res.send(utils.successTrue(200, "전화번호 인증 완료", userResult[0]))
        } else return res.send(utils.successFalse(301, "등록되어 있지 않은 회원입니다."))
    } catch (err) {
        logger.error(`App - phoneNum Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}
/**
 2020.01.27
preAccount API = 기존회원의 이전 계정 삭제
 */
exports.preAccount = async function (req, res) {
    const phoneNum = req.body.phoneNum;
    try {
        const selectPhone = await query(`SELECT userInfoIdx, id, phoneNum, status FROM userInfo WHERE phoneNum = ? AND status != 'DELETE'`, [phoneNum])
        if (selectPhone.length == 0) return res.send(utils.successFalse(301, "기존 계정이 존재하지 않습니다."))
        const updatePhoneQuery = `
            UPDATE userInfo
            SET status = 'DELETE'
            WHERE phoneNum = ?;
            `;
        const phoneNumResult = await query(updatePhoneQuery, [phoneNum]);
        return res.send(utils.successTrue(200, "기존 계정을 삭제 했습니다.", selectPhone[0]))

    } catch (err) {
        logger.error(`App - preAccount Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}


/**
 2020.1.22
 firebaseTest 
 */
exports.firebase = async function (req, res) {
    const {
        userInfoIdx, id, battery, nation, group
    } = req.body;
    var database = rtdb.database();
    var userDB = database.ref("user");

    const message = "테스트합니다."
    //작성하는거
    // 1. user 회원가입과 동시에 파이어베이스에 유저정보 입력하기
    //userInfoIdx, 
    function writeUserInfo(userInfoIdx, id, battery, nation) {
        const result = userDB.push({
            userInfo: {
                userInfoIdx: userInfoIdx,
                id: id,
                battery: battery,
                nation: nation,
            }
        });
        return res.send(utils.successTrue(200, "RTDB 추가 완료", result))
    }
    //writeUserInfo(userInfoIdx, id, battery, nation);

    // 위의 userInfoIdx = 2 인 사람의 채팅방이 추가되었다고 했을때

    function writeUserInfo(userInfoIdx, id, battery, nation) {
        const result = userDB.push({
            userInfo: {
                userInfoIdx: userInfoIdx,
                id: id,
                battery: battery,
                nation: nation,
            }
        });
        return res.send(utils.successTrue(200, "RTDB 유저정보 추가 완료", result))
    }

    var userFriendDB = database.ref("user/-Lz_ISPpMBxRjL9NWi60/friends");
    function writeUserFriendInfo(userInfoIdx, group) {
        const result = userFriendDB.push(
            {
                userInfoIdx: userInfoIdx,
                group: group
            });
        userFriendDB.on("value", function (snapshot) {
            console.log(snapshot.getPriority())
            console.log(snapshot.val().key)


        })
        return res.send(utils.successTrue(200, "RTDB 친구 추가 완료", result))
    }
    writeUserFriendInfo(userInfoIdx, group);

}
// function writeUseChat(userInfoIdx, id, battery, nation) {
//     testtest.push({
//         userInfoIdx: userInfoIdx,
//         id: id,
//         battery: battery,
//         nation: nation,
//     });
// }


// test.once("child_changed", function (snapshot) {
//     console.log(snapshot.val());
//     console.log(snapshot.key);
// }, function (errorObject) {
//     console.log("The read failed: " + errorObject.code);
// })



