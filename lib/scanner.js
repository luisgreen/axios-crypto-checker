const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const os = require('os');

const VULN_AXIOS = ['1.14.1', '0.30.4'];
const VULN_CRYPTO = ['4.2.1'];

const isVulnerable = (pkg, version) => {
  if (pkg === 'axios' && VULN_AXIOS.includes(version)) return true;
  if (pkg === 'plain-crypto-js' && VULN_CRYPTO.includes(version)) return true;
  return false;
};

const parseJsonLock = (filePath, results) => {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const deps = content.dependencies || content.packages || {};
    for (const [key, val] of Object.entries(deps)) {
      const name = key.replace('node_modules/', '');
      const version = val.version;
      if (isVulnerable(name, version)) {
        results.push({ file: filePath, pkg: name, version });
      }
    }
  } catch (e) { }
};

const parseYamlLock = (filePath, results) => {
  try {
    const content = yaml.parse(fs.readFileSync(filePath, 'utf8'));
    const packages = content.packages || {};
    for (const [key, val] of Object.entries(packages)) {
      // pnpm path format is usually /package/version
      const nameMatch = key.match(/^\/([^@]+)@(.*)/);
      if (nameMatch) {
        const name = nameMatch[1];
        const version = nameMatch[2].split('_')[0];
        if (isVulnerable(name, version)) {
          results.push({ file: filePath, pkg: name, version });
        }
      }
    }
  } catch (e) { }
};

const scanDir = (dirPath, results, isRecursive) => {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Avoid scanning heavy dirs unless recursive is true, but normally skip node_modules content scanning, we just check locks
      if (isRecursive && entry.name !== 'node_modules') {
        scanDir(fullPath, results, true);
      }
    } else {
      if (entry.name === 'package.json' || entry.name === 'package-lock.json') {
        parseJsonLock(fullPath, results);
      } else if (entry.name === 'pnpm-lock.yaml') {
        parseYamlLock(fullPath, results);
      } else if (entry.name === 'yarn.lock') {
        // Simple yarn lock check - naive grep style due to complex parsing
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('axios@') || content.includes('plain-crypto-js@')) {
             if (content.includes('version "1.14.1"') || content.includes('version "0.30.4"') || content.includes('version "4.2.1"')) {
                results.push({ file: fullPath, pkg: 'axios or plain-crypto-js', version: 'vulnerable' });
             }
          }
        } catch (e) {}
      }
    }
  }
};

const scanTarget = (targetDir, systemScan) => {
  const results = [];
  scanDir(targetDir, results, false);

  if (systemScan) {
    // System-wide scan starting from root directory
    try {
      const rootDir = path.parse(process.cwd()).root;
      scanDir(rootDir, results, true);
    } catch (e) {
      console.error("System scan failed or partially completed due to permissions.");
    }
  }
  return results;
};

module.exports = { scanTarget, isVulnerable };
