const { calculateStatistics } = require('../src/utils/calculatestatistics');

describe('calculateStatistics', () => {
  test('returns no-data when values array is empty', () => {
    const result = calculateStatistics([]);
    expect(result).toEqual({
      trend: 'no-data',
      average: 0,
      change: 0,
      dataPoints: 0,
      startValue: null,
      endValue: null,
    });
  });

  test('returns insufficient-data when only one value is provided', () => {
    const result = calculateStatistics([80]);
    expect(result).toEqual({
      trend: 'insufficient-data',
      average: 80,
      change: 0,
      dataPoints: 1,
      startValue: 80,
      endValue: 80,
    });
  });

  test('calculates decreasing trend correctly', () => {
    const result = calculateStatistics([80, 79, 78]);
    expect(result).toEqual({
      trend: 'decreasing',
      average: 79,
      change: -2,
      dataPoints: 3,
      startValue: 80,
      endValue: 78,
    });
  });

  test('calculates increasing trend correctly', () => {
    const result = calculateStatistics([70, 71, 72]);
    expect(result).toEqual({
      trend: 'increasing',
      average: 71,
      change: 2,
      dataPoints: 3,
      startValue: 70,
      endValue: 72,
    });
  });

  test('returns stable trend when change is below threshold', () => {
    const result = calculateStatistics([80, 80.2]);
    expect(result.trend).toBe('stable');
    expect(result.average).toBeCloseTo(80.1);
    expect(result.change).toBeCloseTo(0.2);
    expect(result.dataPoints).toBe(2);
    expect(result.startValue).toBe(80);
    expect(result.endValue).toBe(80.2);
  });
});
