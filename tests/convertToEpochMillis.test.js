const convertToEpochMillis = require('../lib/convertToEpochMillis');

test('Converts values', () => {
  expect(convertToEpochMillis(364, 3720296937)).toBe(1567088392681);
});
