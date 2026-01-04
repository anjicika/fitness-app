function calculateStatistics(values) {
  if (!values || values.length === 0) {
    return { trend: 'no-data' };
  }

  if (values.length === 1) {
    return {
      startValue: values[0],
      endValue: values[0],
      change: 0,
      average: values[0],
      trend: 'insufficient-data',
    };
  }

  const startValue = values[0];
  const endValue = values[values.length - 1];

  const change = endValue - startValue;
  const average = values.reduce((a, b) => a + b, 0) / values.length;

  let trend = 'stable';
  const THRESHOLD = 0.5;

  if (change > THRESHOLD) trend = 'increasing';
  if (change < -THRESHOLD) trend = 'decreasing';

  return {
    startValue,
    endValue,
    change,
    average,
    trend,
    dataPoints: values.length,
  };
}

module.exports = { calculateStatistics };
