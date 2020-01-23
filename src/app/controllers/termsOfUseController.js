const { query } = require('../../../config/database');
const {logger} = require('../../../config/winston');
const utils = require('../../../modules/resModule')

/**
2020.01.23
이용약관 전체 조회
 */
exports.getAllTerms = async function (req, res) {
    try {
        const selectTermsQuery = `
                SELECT title, contents
                FROM termsOfUse
                `; 
        const termsResult = await query(selectTermsQuery);
        res.send(utils.successTrue(200, "이용약관 조회 성공", termsResult));
    } catch (err) {
        logger.error(`App - getAllTerms Query error\n: ${err.message}`);
        return res.send(utils.successFalse(500, `Error: ${err.message}`));
    }
};