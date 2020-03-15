module.exports = function(app){
    const trip = require('../controllers/tripController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/trip',jwtMiddleware, trip.getTripHistory);
    app.get('/trip/:tripIdx',jwtMiddleware, trip.getOneTripHistory);
    app.route('/trip').post(jwtMiddleware, trip.postTrip);
    app.route('/trip/:tripIdx').post(jwtMiddleware, trip.postTripDay);
    app.route('/tripname/:tripIdx').patch(jwtMiddleware, trip.patchTripName);
    app.route('/triptext/:videoIdx').patch(jwtMiddleware, trip.patchTripText);
    app.route('/tripdate/:tripIdx').patch(jwtMiddleware, trip.patchTripDate);

    app.get('/tripstatus',jwtMiddleware, trip.checkTripStatus);

   // app.route('/tripdate/:tripIdx').patch(jwtMiddleware, trip.deleteTrip);
  
    
   
};