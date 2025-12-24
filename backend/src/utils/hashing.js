const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Hashira plain text geslo.
 * @param {string} password - Geslo v normalnem tekstu
 * @returns {Promise<string>} - Hashirano geslo
 */
async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Primerja plain text geslo s hashiranim geslom.
 * @param {string} password - Geslo v normalnem tekstu
 * @param {string} hash - Hashirano geslo iz baze
 * @returns {Promise<boolean>} - Vrne true, če se ujema
 */
async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

module.exports = { hashPassword, comparePassword };
