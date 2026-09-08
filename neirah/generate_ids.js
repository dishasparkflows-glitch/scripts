const fs = require('fs');
const path = require('path');

const items = JSON.parse(fs.readFileSync(path.join(__dirname, 'sku.json'), 'utf8'));
const ids = items.map(it => (it._id && it._id.$oid) ? it._id.$oid : it._id);

// 1. Plain array of string IDs
fs.writeFileSync(path.join(__dirname, 'ids.json'), JSON.stringify(ids, null, 2), 'utf8');

// 2. Ready-to-paste MongoDB Compass ObjectId query
const compassQuery = `{\n  "_id": {\n    "$in": [\n` +
  ids.map(id => `      ObjectId("${id}")`).join(',\n') +
  `\n    ]\n  }\n}`;
fs.writeFileSync(path.join(__dirname, 'compass_id_query.txt'), compassQuery, 'utf8');

// 3. Compass Regex alternative
const regexQuery = `{\n  "sku": {\n    "$regex": "^RJ(LR|ER|BR|PN|PM)L[12]",\n    "$options": "i"\n  }\n}`;
fs.writeFileSync(path.join(__dirname, 'compass_regex_query.txt'), regexQuery, 'utf8');

console.log(`Generated:`);
console.log(`- ids.json (${ids.length} string IDs)`);
console.log(`- compass_id_query.txt (Compass $in ObjectId query)`);
console.log(`- compass_regex_query.txt (Compass regex query)`);
