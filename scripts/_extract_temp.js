
const fs = require('fs');
const content = fs.readFileSync('src/data/kalams.ts', 'utf-8');
// Strip the import line
const stripped = content.replace(/^import type.*?;\n/, '').replace(/^export\s+/, '');
// Evaluate to get the array
const kalams = eval(stripped);
console.log(JSON.stringify(kalams));
