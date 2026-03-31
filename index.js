#!/usr/bin/env node
const { program } = require('commander');
const chalk = require('chalk');
const { scanTarget } = require('./lib/scanner');
const { checkSystemIOCs } = require('./lib/ioc-checker');
const fs = require('fs');

program
  .version('1.0.0')
  .description('Detect IOCs related to the Axios/plain-crypto-js supply chain attack.')
  .argument('<target>', 'Target directory to scan')
  .option('-s, --system-scan', 'Perform a system-wide scan for vulnerable dependencies')
  .option('-l, --log-file <path>', 'Write detailed scan results to a log file');

program.parse(process.argv);

const options = program.opts();
const target = program.args[0];

console.log(chalk.blue(`Scanning target: ${target}`));

let logData = '';

const appendLog = (msg) => {
  logData += msg + '\n';
};

const runScan = () => {
  let isCompromised = false;

  const depResults = scanTarget(target, options.systemScan);
  if (depResults.length > 0) {
    isCompromised = true;
    console.log(chalk.red('Vulnerable dependencies found!'));
    depResults.forEach(r => {
      const msg = `Found in ${r.file}: ${r.pkg} version ${r.version}`;
      console.log(chalk.red(` - ${msg}`));
      appendLog(msg);
    });
  } else {
    const msg = 'No vulnerable dependencies found in target.';
    console.log(chalk.green(msg));
    appendLog(msg);
  }

  const iocResults = checkSystemIOCs();
  if (iocResults.length > 0) {
    isCompromised = true;
    console.log(chalk.red('System IOCs found!'));
    iocResults.forEach(r => {
      const msg = `Malicious file detected: ${r}`;
      console.log(chalk.red(` - ${msg}`));
      appendLog(msg);
    });
  } else {
    const msg = 'No system IOCs found.';
    console.log(chalk.green(msg));
    appendLog(msg);
  }

  if (isCompromised) {
    const remediation = `
REMEDIATION ADVICE:
1. Isolate the machine immediately to prevent lateral movement.
2. Rotate all credentials that may have been exposed on this machine.
3. Remove the detected malicious files.
4. Update or remove the vulnerable dependencies listed above.
`;
    console.log(chalk.yellow(remediation));
    appendLog(remediation);
  }

  if (options.logFile) {
    fs.writeFileSync(options.logFile, logData);
    console.log(chalk.blue(`Log written to ${options.logFile}`));
  }
};

runScan();
