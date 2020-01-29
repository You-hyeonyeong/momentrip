module.exports = function(app){
    const group = require('../controllers/groupController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/app/colorgroup', jwtMiddleware, group.getColorGroup);


};