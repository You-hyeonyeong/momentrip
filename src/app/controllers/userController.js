const { logger } = require('../../../config/winston');
const { query } = require('../../../config/database');
const { transaction } = require('../../../config/database');
const { rtdb } = require('../../../modules/rtdbModule')

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const utils = require('../../../modules/resModule')
var admin = require("firebase-admin");
var serviceAccount = require("../../../config/halfmile-f9907-firebase-adminsdk-t5bbi-ded576e2ab.json");



/**
 2020.1.22
 signup API = 회원가입
 */
exports.signup = async function (req, res) {
    const {
        id, password, phoneNum, gender, birthday, nation,
        platformType, isAllowedPush, deviceToken, firebaseToken, fcmToken
    } = req.body;

    if (!id) return res.send(utils.successFalse(301, "이메일을 입력해주세요."));
    try {
        try {
            // 아이디 중복 확인
            const selectIdQuery = `
                SELECT id 
                FROM userInfo 
                WHERE id = ?;
                `;
            const idResult = await query(selectIdQuery, [id]);
            console.log(idResult.length);

            if (idResult.length > 0) return res.send(utils.successFalse(304, "아이디가 이미 사용중입니다"));
            if (!password) return res.send(utils.successFalse(302, "비밀번호를 입력 해주세요."));
            if (password.length < 4 || password.length > 20) return res.send(utils.successFalse(303, "비밀번호는 4~20자리를 입력해주세요."));
            else {
                //회원가입 성공시 트랜젝션 처리
                const signupProcess = await transaction(async (connection) => {
                    const hashedPwd = await crypto.createHash('sha512').update(password).digest('hex');
                    //유저 정보 생성
                    const insertUser = `
                    INSERT INTO userInfo(id, password, phoneNum, gender, birthday, nation, platformType, isAllowedPush, deviceToken, firebaseToken, fcmToken)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `
                    const userResult = await connection.query(insertUser, [id, hashedPwd, phoneNum, gender, birthday, nation, platformType, isAllowedPush, deviceToken, firebaseToken, fcmToken]);
                    console.log(userResult.insertId);

                    // 유저 그룹 생성
                    const insertGroup = `
                    INSERT INTO colorGroup (userInfoIdx)
                    VALUES (?)
                `;
                    const groupResult = await connection.query(insertGroup, [userResult.insertId])

                    //유저 배터리 생성
                    const insertBattery = `
                    INSERT INTO battery (userInfoIdx, variation, percents, type, current)
                    VALUES (?, ?, ?, ?, ?)
                `
                    const batteryResult = await connection.query(insertBattery, [userResult.insertId, '+', 100, 'WELCOME',])
                    // RTDB 유저정보 입력

                });
                if (signupProcess === undefined ) return res.send(utils.successFalse(300, "회원가입 실패~"));
                else return res.send(utils.successTrue(201, "회원가입 성공"));
            }
        } catch (err) {
            logger.error(`App - signup Query error\n: ${err.message}`);
            return res.send(utils.successFalse(500, `Error: ${err.message}`));
        }
    } catch (err) {
        logger.error(`App - signup DB Connection error\n: ${err.message}`);
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

    try {
        try {
            const selectUserInfoQuery = `
                SELECT userInfoIdx, id, password, status
                FROM userInfo 
                WHERE id = ?;
                `;
            const userResult = await query(selectUserInfoQuery, [id]);
            if (userResult.length < 1) {
                return res.send(utils.successFalse(310, "아이디와 비밀번호를 확인해주세요"));
            }
            const hashedPwd = await crypto.createHash('sha512').update(password).digest('hex');
            if (userResult[0].password !== hashedPwd) {
                return res.send(utils.successFalse(311, "아이디와 비밀번호를 확인해주세요"));
            }
            if (userResult[0].status === "INACTIVE") {
                return res.send(utils.successFalse(312, "비활성화 된 계정입니다. 고객센터에 문의해주세요."));
            } else if (userResult[0].status === "DELETED") {
                return res.send(utils.successFalse(313, "탈퇴 된 계정입니다. 고객센터에 문의해주세요."));
            }

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
            logger.info(`idx: ${userResult[0].userInfoIdx}, id: ${userResult[0].id} 로그인 성공`)
            res.send(utils.successTrue(200, "로그인 성공", token));
        } catch (err) {
            logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        logger.error(`App - SignIn DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

/**
 2020.1.23
 idcheck API = 아이디 중복검사
 */
exports.idcheck = async function (req, res) {
    const id = req.body.id;
    try {
        const selectIdQuery = `
            SELECT id 
            FROM userInfo 
            WHERE id = ?;
            `;
        const idResult = await query(selectIdQuery, [id]);
        console.log(idResult.length);
        if (idResult.length > 0) return res.send(utils.successFalse(304, "아이디가 이미 사용중입니다"))
        return res.send(utils.successTrue(200, "사용 가능한 아이디 입니다."))

    } catch (err) {
        logger.error(`App - idcheck Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
}

/**
 2020.1.22
 firebaseTest 
 */
exports.firebase = async function (req, res) {
    const {
        userInfoIdx, id, battery, nation
    } = req.body;
    var db = rtdb.database();
    var test = db.ref("user")
    var testtest = db.ref("user/-LzMUaTqsh-F7244Ycl4/userInfo")
    const message = "테스트합니다."
    //작성하는거
    // 1. user 회원가입과 동시에 파이어베이스에 유저정보 입력하기
    function writeUserInfo(userInfoIdx, id, battery, nation) {
        test.push({
            userInfoIdx: userInfoIdx,
            id: id,
            battery : battery,
            nation : nation
        });
      }
      function writeUseChat(userInfoIdx, id, battery, nation) {
        testtest.push({
            userInfoIdx: userInfoIdx,
            id: id,
            battery : battery,
            nation : nation, 
        });
      }
      //writeUserInfo(userInfoIdx, id, battery, nation)
      writeUseChat(userInfoIdx, id, battery, nation)


     // -LzMUaTqsh-F7244Ycl4

    //읽는거
    // test.once("child_added", function (snapshot) {
    //     console.log(snapshot.val());
    //     console.log(snapshot.key);
    // }, function (errorObject) {
    //     console.log("The read failed: " + errorObject.code);
    // })

}


/**
 update : 2019.09.23
 03.check API = token 검증
 **/
exports.check = async function (req, res) {
    res.json({
        isSuccess: true,
        code: 200,
        message: "검증 성공",
        info: req.verifiedToken
    })
};


