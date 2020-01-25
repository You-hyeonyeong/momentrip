module.exports = function(app){
    const faq = require('../controllers/faqController');
    const sce = require('../../../modules/scheduleModule')

    app.get('/app/faq',faq.getAllFaq);
};