const { calculateStatistics } = require('../src/utils/calculatestatistics');

describe('calculateStatistics', () => {

  test('returns no-data when values array is empty', () => {
    const result = calculateStatistics([]);
    expect(result).toEqual({ trend: 'no-data' });
  });

  test('returns insufficient-data when only one value is provided', () => {
    const result = calculateStatistics([80]);

    expect(result).toEqual({
      startValue: 80,
      endValue: 80,
      change: 0,
      average: 80,
      trend: 'insufficient-data'
    });
  });

  test('calculates decreasing trend correctly', () => {
    const result = calculateStatistics([80, 79, 78]);

    expect(result.startValue).toBe(80);
    expect(result.endValue).toBe(78);
    expect(result.change).toBe(-2);
    expect(result.average).toBeCloseTo(79);
    expect(result.trend).toBe('decreasing');
    expect(result.dataPoints).toBe(3);
  });

  test('calculates increasing trend correctly', () => {
    const result = calculateStatistics([70, 71, 72]);

    expect(result.change).toBe(2);
    expect(result.trend).toBe('increasing');
  });

  test('returns stable trend when change is below threshold', () => {
    const result = calculateStatistics([80, 80.2]);

    expect(result.trend).toBe('stable');
  });

});
