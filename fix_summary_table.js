const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const sIdx = content.indexOf('function buildSummaryTableHtml() {');
const eIdx = content.indexOf('var rows = filtered.map', sIdx);

if (sIdx === -1 || eIdx === -1) {
  console.error('Could not find buildSummaryTableHtml');
  process.exit(1);
}

const headerCode = `function buildSummaryTableHtml() {
      var kw = (document.getElementById('fltKeyword') ? document.getElementById('fltKeyword').value : '').toLowerCase().trim();
      var selBrand = document.getElementById('fltBrand') ? document.getElementById('fltBrand').value : '';
      var selModel = document.getElementById('fltModel') ? document.getElementById('fltModel').value : '';

      var filtered = devs.filter(function (d) {
        var mKw = !kw || (d.name && d.name.toLowerCase().includes(kw)) || (d.model && d.model.toLowerCase().includes(kw)) || (d.brand && d.brand.toLowerCase().includes(kw));
        var mBr = !selBrand || d.brand === selBrand;
        var mMd = !selModel || d.model === selModel;
        return mKw && mBr && mMd;
      });

      `;

content = content.substring(0, sIdx) + headerCode + content.substring(eIdx);

fs.writeFileSync('index.html', content, 'utf8');
console.log('Fixed buildSummaryTableHtml successfully!');
