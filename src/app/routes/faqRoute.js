module.exports = function(app){
    const faq = require('../controllers/faqController');

    app.get('/app/faq',faq.getAllFaq);
};