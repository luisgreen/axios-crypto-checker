const { checkSystemIOCs } = require('../lib/ioc-checker');
const os = require('os');
const fs = require('fs');
const path = require('path');

jest.mock('fs');
jest.mock('os');

describe('IOC Checker Tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('checks macOS IOCs', () => {
    os.platform.mockReturnValue('darwin');
    fs.existsSync.mockImplementation((file) => file === '/Library/Caches/com.apple.act.mond');
    
    const results = checkSystemIOCs();
    expect(results).toContain('/Library/Caches/com.apple.act.mond');
  });

  test('checks Linux IOCs', () => {
    os.platform.mockReturnValue('linux');
    fs.existsSync.mockImplementation((file) => file === '/tmp/ld.py');
    
    const results = checkSystemIOCs();
    expect(results).toContain('/tmp/ld.py');
  });

  test('returns empty when no IOCs found', () => {
    os.platform.mockReturnValue('linux');
    fs.existsSync.mockReturnValue(false);
    
    const results = checkSystemIOCs();
    expect(results.length).toBe(0);
  });
});
