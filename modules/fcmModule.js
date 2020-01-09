
var admin = require("firebase-admin");
const {logger} = require('./config/winston');

var serviceAccount = require("../config/halfmile-f9907-firebase-adminsdk-t5bbi-ded576e2ab.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://halfmile-f9907.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("restricted_access/secret_document");
ref.once("value", function(snapshot) {
  console.log(snapshot.val()); //null출력
});

