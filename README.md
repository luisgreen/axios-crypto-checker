# Axios Crypto Checker

A CLI tool to detect Indicators of Compromise (IOCs) related to the `axios`/`plain-crypto-js` supply chain attack.

## Installation

```bash
npm install 
```

## Usage

```bash
node index.js <target_directory> [options]
```

### Options:
- `-s, --system-scan`: Recursively search the file system for vulnerable dependencies.
- `-l, --log-file <path>`: Write detailed scan results to a log file.
- `-h, --help`: Show help.

## Safety
This scanner only performs static analysis of `package.json` and lockfiles. It absolutely **does not execute any code** from the target dependencies.

## License
MIT
