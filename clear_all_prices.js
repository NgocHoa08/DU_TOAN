const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. In MODEL_PRESETS, replace all price: <number> with price: 0
content = content.replace(/"price":\s*\d+/g, '"price": 0');

// 2. In CATALOG_ITEMS, replace all "price": <number> with "price": 0
content = content.replace(/"price":\s*\d+/g, '"price": 0');

// 3. In parseSummaryRows, ensure price default is 0 and does not force old values
content = content.replace(
  "var price = colMap.price >= 0 ? gn(ws, row, colMap.price) : 0;",
  "var price = 0;"
);

// 4. In sanitizeDevice and devObj creation, ensure price is 0
content = content.replace(
  "if (cellVal >= 1000) {\n              price = cellVal; break;\n            }",
  "// No default prices\n            price = 0;"
);

fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully cleared all prices to 0 across the entire application!');
