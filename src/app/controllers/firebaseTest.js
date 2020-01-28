const { logger } = require('../../../config/winston');
const { query } = require('../../../config/database');
const { transaction } = require('../../../config/database');
const { firebaseDB } = require('../../../modules/rtdbModule')

const utils = require('../../../modules/resModule')



exports.test = async function (req, res) {
    
    let db = firebaseDB.firestore();
    const userInfoIdx = 3

    let docRef = db.collection('users').doc(`${userInfoIdx}`);
    let setAda = docRef.set({
        latitude: '37.2222',
        longitude: '231.2222'
    });
    return res.send(utils.successTrue(200, "firebaseDB 추가 완료"))

}