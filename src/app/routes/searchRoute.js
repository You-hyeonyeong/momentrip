module.exports = function(app){
    const search = require('../controllers/searchController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/app/searchId', jwtMiddleware, search.getById);
    app.get('/app/searchPhoneNum', jwtMiddleware, search.getByPhoneNum);


};