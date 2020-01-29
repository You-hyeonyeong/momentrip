
var admin = require("firebase-admin");
var serviceAccount = require("../config/halfmile-f9907-firebase-adminsdk-t5bbi-ded576e2ab.json");

const firebaseDB = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
let db = firebaseDB.firestore();
//유저정보 관련된 링크로 접속하는 함수
let userDB = db.collection('users')

//채팅방 관련된 링크로 접속하는 함수
let chatDB = db.collection('chat')

module.exports = { userDB, chatDB, admin };