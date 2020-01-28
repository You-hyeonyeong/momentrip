
var admin = require("firebase-admin");
var serviceAccount = require("../config/halfmile-f9907-firebase-adminsdk-t5bbi-ded576e2ab.json");

const firebaseDB = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = { firebaseDB };