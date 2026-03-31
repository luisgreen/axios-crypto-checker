const fs = require('fs');
const os = require('os');
const path = require('path');

const checkSystemIOCs = () => {
  const platform = os.platform();
  const results = [];
  
  const checkFile = (filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        results.push(filePath);
      }
    } catch (e) {}
  };

  if (platform === 'darwin') {
    checkFile('/Library/Caches/com.apple.act.mond');
  } else if (platform === 'linux') {
    checkFile('/tmp/ld.py');
  } else if (platform === 'win32') {
    const programData = process.env.PROGRAMDATA || 'C:\\ProgramData';
    const temp = process.env.TEMP || 'C:\\Users\\Default\\AppData\\Local\\Temp';
    checkFile(path.join(programData, 'wt'));
    checkFile(path.join(temp, '6202033.vbs'));
    checkFile(path.join(temp, '6202033.ps1'));
  }

  return results;
};

module.exports = { checkSystemIOCs };
