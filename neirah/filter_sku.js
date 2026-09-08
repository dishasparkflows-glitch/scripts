const fs = require('fs');
const path = require('path');

// Patterns specified in the handwritten note:
// 1. RJ LR L1  -> RJLRL1
// 2. RJ LR L2  -> RJLRL2
// 3. RJ ER L1  -> RJERL1
// 4. RJ ER L2  -> RJERL2
// 5. RJ BR L1  -> RJBRL1
// 6. RJ BR L2  -> RJBRL2
// 7. RJ PN L1  -> RJPNL1 (and RJPML1)
// 8. RJ PN L2  -> RJPNL2

const CATEGORIES = [
  { name: 'RJ LR L1', pattern: 'RJLRL1' },
  { name: 'RJ LR L2', pattern: 'RJLRL2' },
  { name: 'RJ ER L1', pattern: 'RJERL1' },
  { name: 'RJ ER L2', pattern: 'RJERL2' },
  { name: 'RJ BR L1', pattern: 'RJBRL1' },
  { name: 'RJ BR L2', pattern: 'RJBRL2' },
  { name: 'RJ PN L1', pattern: 'RJPNL1', altPatterns: ['RJPML1'] },
  { name: 'RJ PN L2', pattern: 'RJPNL2' }
];

const rawDataPath = path.join(__dirname, 'raw_sku.json');
const outputPath = path.join(__dirname, 'sku.json');

if (!fs.existsSync(rawDataPath)) {
  console.error(`Error: ${rawDataPath} not found.`);
  process.exit(1);W
}

const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

const matchedCounts = {};
CATEGORIES.forEach(c => (matchedCounts[c.name] = 0));

const filtered = rawData.filter(item => {
  const sku = (item.sku || '').toUpperCase().replace(/[\s-]/g, '');

  const matchedCat = CATEGORIES.find(c => {
    if (sku.startsWith(c.pattern)) return true;
    if (c.altPatterns && c.altPatterns.some(alt => sku.startsWith(alt))) return true;
    return false;
  });

  if (matchedCat) {
    matchedCounts[matchedCat.name]++;
    return true;
  }
  return false;
}).map(item => ({
  _id: item._id,
  sku: item.sku
}));

fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2), 'utf8');

console.log('=== SKU FILTER SUMMARY ===');
console.table(
  CATEGORIES.map(c => ({
    Category: c.name,
    Pattern: c.pattern,
    Matched: matchedCounts[c.name]
  }))
);
console.log(`Total Matched & Saved: ${filtered.length} / ${rawData.length}`);
console.log(`Saved to: ${outputPath}`);
