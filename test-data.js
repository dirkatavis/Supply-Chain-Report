// Minimal data validation for Supply-Chain-Report
// Usage: node test-data.js
//
// IMPORTANT: Always start by creating a new branch for any changes:
//   git switch -c feature/<your_feature_name>
const fs = require('fs');

function checkCSV(path) {
  try {
    const data = fs.readFileSync(path, 'utf8');
    const lines = data.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error('CSV missing data rows');
    const header = lines[0].split(',');
    if (header.length < 4) throw new Error('CSV header too short');
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length < header.length) throw new Error(`Row ${i+1} has too few columns`);
    }
    console.log('status.csv: OK');
  } catch (e) {
    console.error('status.csv:', e.message);
    process.exit(1);
  }
}

function checkYAML(path) {
  try {
    const data = fs.readFileSync(path, 'utf8');
    if (!/^\s*\w+:/m.test(data)) throw new Error('YAML missing key: value');
    console.log('config.yaml: OK');
  } catch (e) {
    console.error('config.yaml:', e.message);
    process.exit(1);
  }
}

checkCSV('status.csv');
checkYAML('config.yaml');
console.log('All data checks passed.');
