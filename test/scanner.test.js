const { isVulnerable } = require('../lib/scanner');

describe('Scanner Tests', () => {
  test('isVulnerable identifies malicious axios versions', () => {
    expect(isVulnerable('axios', '1.14.1')).toBe(true);
    expect(isVulnerable('axios', '0.30.4')).toBe(true);
    expect(isVulnerable('axios', '1.5.0')).toBe(false);
  });

  test('isVulnerable identifies malicious plain-crypto-js versions', () => {
    expect(isVulnerable('plain-crypto-js', '4.2.1')).toBe(true);
    expect(isVulnerable('plain-crypto-js', '1.0.0')).toBe(false);
  });
});
