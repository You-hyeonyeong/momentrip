module.exports = function(app){
    const search = require('../controllers/searchController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/app/searchid', jwtMiddleware, search.getById);
    app.get('/app/searchphonenum', jwtMiddleware, search.getByPhoneNum);


};