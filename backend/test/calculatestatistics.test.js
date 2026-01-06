/* eslint-env mocha */
const { calculateStatistics } = require('../src/utils/calculatestatistics');
const { expect } = require('chai');

describe('calculateStatistics', () => {
  it('returns no-data when values array is empty', () => {
    const result = calculateStatistics([]);
    expect(result).to.deep.equal({ trend: 'no-data' });
  });

  it('returns insufficient-data when only one value is provided', () => {
    const result = calculateStatistics([80]);

    expect(result).to.deep.equal({
      startValue: 80,
      endValue: 80,
      change: 0,
      average: 80,
      trend: 'insufficient-data',
    });
  });

  it('calculates decreasing trend correctly', () => {
    const result = calculateStatistics([80, 79, 78]);

    expect(result.startValue).to.equal(80);
    expect(result.endValue).to.equal(78);
    expect(result.change).to.equal(-2);
    expect(result.average).to.be.closeTo(79, 0.01);
    expect(result.trend).to.equal('decreasing');
    expect(result.dataPoints).to.equal(3);
  });

  it('calculates increasing trend correctly', () => {
    const result = calculateStatistics([70, 71, 72]);

    expect(result.change).to.equal(2);
    expect(result.trend).to.equal('increasing');
  });

  it('returns stable trend when change is below threshold', () => {
    const result = calculateStatistics([80, 80.2]);

    expect(result.trend).to.equal('stable');
  });
});
