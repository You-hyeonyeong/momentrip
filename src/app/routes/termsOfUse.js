module.exports = function(app){
    const terms = require('../controllers/termsOfUseController');

    app.get('/app/terms',terms.getAllTerms);
};