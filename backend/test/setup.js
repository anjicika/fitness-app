// test/setup.js
require('dotenv').config();

// Naloži Jest-style expect globalno (kot v obstoječih testih projekta)
const { expect } = require('@jest/globals');
global.expect = expect;