const { logger } = require('../../../config/winston');
const { query } = require('../../../config/database');
const { transaction } = require('../../../config/database');
const { userDB, chatDB, admin } = require('../../../modules/firebaseDBModule')

const utils = require('../../../modules/resModule')



exports.test = async function (req, res) {
        userDB.get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    console.log(doc.id , doc.data());
                });
            })
            .catch((err) => {
                console.log('Error getting documents', err);
            });

            userDB.doc('12').update({battery : admin.firestore.FieldValue.increment(-10) })
    return res.send(utils.successTrue(200, "firebaseDB 조회 완료"))
}

exports.minusTest = async function (req, res) {
    //단순 데이터 읽기
    // userDB.get()
    //     .then((snapshot) => {
    //         snapshot.forEach((doc) => {
    //             console.log(doc.id , doc.data());
    //         });
    //     })
    //     .catch((err) => {
    //         console.log('Error getting documents', err);
    //     });

        const selectUser = await query(`
            SELECT userInfoIdx 
            FROM userInfo 
            WHERE hour(createdAt)+1 <> hour(NOW()) AND status = 'ACTIVE' AND battery > 0;`)
            console.log(selectUser.length + "ssssss")

            selectUser.forEach(async (user) => {
                console.log(user.userInfoIdx);
                //뽑아낸 유저 돌면서 insert history
                const tenPercentMinus = await query(`
                INSERT INTO battery (userInfoIdx, variation, percents, type) VALUES (?, ?, ?, ?)`,[user.userInfoIdx, '-', 10, 'SCEDULE' ])

                //뽑아낸 유저 돌면서 firebase에서 배터리 감소
                userDB.doc(`${user.userInfoIdx}`).update({battery : admin.firestore.FieldValue.increment(-10)})
            })

        //userDB.doc(`${유저인덱스}`).update({battery : admin.firestore.FieldValue.increment(-10) })

        //userDB.doc('22').update({battery : admin.firestore.FieldValue.increment(-10) })
        return res.send(utils.successTrue(200, "firebaseDB 테스트중"))
}