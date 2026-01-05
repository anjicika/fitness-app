function calculateStatistics(values, threshold = 0.5) {
  if (!values || !Array.isArray(values)) {
    return {
      trend: 'no-data',
      startValue: null,
      endValue: null,
      change: 0,
      average: 0,
      dataPoints: 0,
    };
  }

  values = values.filter(v => v != null && !isNaN(v));

  if (values.length === 0) {
    return {
      trend: 'no-data',
      startValue: null,
      endValue: null,
      change: 0,
      average: 0,
      dataPoints: 0,
    };
  }

  if (values.length === 1) {
    const singleValue = Number(values[0].toFixed(1));
    return {
      startValue: singleValue,
      endValue: singleValue,
      change: 0,
      average: singleValue,
      trend: 'insufficient-data',
      dataPoints: 1,
    };
  }

  const startValue = Number(values[0].toFixed(1));
  const endValue = Number(values[values.length - 1].toFixed(1));
  const change = Number((endValue - startValue).toFixed(1));
  const average = Number(
    (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
  );

  let trend = 'stable';
  if (change > threshold) trend = 'increasing';
  if (change < -threshold) trend = 'decreasing';

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
