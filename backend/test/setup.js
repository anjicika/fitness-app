require('dotenv').config();

async function loadChai() {
  const chai = await import('chai');
  global.expect = chai.expect;
  global.assert = chai.assert;
  global.should = chai.should; 
}

loadChai().catch(err => console.error('Failed to load chai:', err));