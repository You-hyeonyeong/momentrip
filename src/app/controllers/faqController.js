const { query } = require('../../../config/database');
const {logger} = require('../../../config/winston');
const utils = require('../../../modules/resModule')

/**
2020.01.23
FAQ 전체 조회
 */
exports.getAllFaq= async function (req, res) {
    try {
        const selectFaqQuery = `
                SELECT faqIdx, question, answer
                FROM faq
                `; 
        const faqResult = await query(selectFaqQuery);
        res.send(utils.successTrue(200, "FAQ 조회 성공", faqResult));
    } catch (err) {
        logger.error(`App - getAllTerms Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};