
var admin = require("firebase-admin");
var serviceAccount = require("../config/halfmile-f9907-firebase-adminsdk-t5bbi-ded576e2ab.json");

const rtdb = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://halfmile-f9907.firebaseio.com"
});

module.exports = { rtdb };