// test/setup.js
require('dotenv').config(); // naloži .env za teste

// Če uporabljate chai (kar verjetno, ker je v devDependencies)
const chai = require('chai');
global.expect = chai.expect;
global.should = chai.should;