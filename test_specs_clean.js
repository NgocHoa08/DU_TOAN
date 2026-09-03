const fs = require('fs');
const XLSX = require('xlsx-js-style');
const vm = require('vm');

const content = fs.readFileSync('index.html', 'utf8');

const scripts = [];
let idx = 0;
while (true) {
  const s = content.indexOf('<script>', idx);
  if (s === -1) break;
  const e = content.indexOf('<\/script>', s);
  if (e === -1) break;
  scripts.push(content.substring(s + 8, e));
  idx = e + 9;
}

const mainScript = scripts.reduce((a,b) => a.length > b.length ? a : b, '');

const createMockEl = () => ({
  value: '',
  addEventListener: () => {},
  classList: { add: () => {}, remove: () => {} },
  style: {},
  innerHTML: '',
  querySelectorAll: () => [],
  querySelector: () => null
});

const sandbox = {
  console: console,
  XLSX: XLSX,
  atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  devs: [],
  devCnt: 0,
  toast: console.log,
  document: {
    getElementById: () => createMockEl(),
    querySelectorAll: () => [],
    querySelector: () => null
  },
  window: { addEventListener: () => {}, scrollTo: () => {} }
};

const context = vm.createContext(sandbox);
vm.runInContext(mainScript, context);

const wb1 = XLSX.readFile('Dự toán -Bảo An V1.xlsx');
let allSpecs1 = [];
context.parseXlsxSmart(wb1, 'Dự toán -Bảo An V1.xlsx', allSpecs1);
context.linkSpecsToDevices(allSpecs1);

console.log('=== STT 1: Máy vi tính để bàn MSI Cubi NUC 1M ===');
context.devs[0].specs.forEach((sp, i) => {
  console.log((i+1) + '. [' + sp.key + ']: ' + sp.value.slice(0, 60).replace(/\n/g, ' ') + '...');
});

let thongSoRowsCount = 0;
context.devs.forEach(d => {
  d.specs.forEach(sp => {
    if (sp.key === 'Thông số' || sp.key === 'Thông số:') thongSoRowsCount++;
  });
});
console.log('\nTổng số dòng bị dính chữ "Thông số" trên toàn bộ 17 máy:', thongSoRowsCount);
