module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    
    app.get('/jwt', jwtMiddleware, user.jwtCheck);
    app.route('/signin').post(user.signin);
    app.route('/signup').post(user.signup);

    app.get('/mypage', jwtMiddleware, user.getMypage);
    app.get('/mypage/:categoryIdx', jwtMiddleware, user.getByCategory);
   
  
    //app.route('/feedback').post(user.feedBack)
   
};