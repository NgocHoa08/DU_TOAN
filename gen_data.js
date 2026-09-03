const XLSX = require('xlsx-js-style');
const fs = require('fs');

const wb = XLSX.readFile('Bảng tuyên bố đáp ứng.xlsx');
const ws = wb.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

// Mục 16 & 17 dùng cột C (Đề xuất); các mục còn lại dùng cột B (Yêu cầu)
const USE_COL_C = [16, 17];

const NOISE_ROWS = [
  'đại diện hợp pháp', 'đứng đầu liên danh', 'ký tên', 'đóng dấu',
  'đại diện hợp', 'đứng đầu', 'liên danh'
];

let items = [];
let cur = null;

function finalize() {
  if (!cur) return;
  // Remove trailing noise
  while (cur.specs.length) {
    const last = (cur.specs[cur.specs.length - 1].value || '').toLowerCase();
    if (NOISE_ROWS.some(n => last.includes(n))) cur.specs.pop();
    else break;
  }
  if (cur.specs.length > 0 || cur.name) items.push(cur);
}

data.forEach(row => {
  const colA = String(row[0] || '').trim();
  const colB = String(row[1] || '').trim();
  const colC = String(row[2] || '').trim();

  const sttNum = parseInt(colA);
  if (!isNaN(sttNum) && sttNum > 0 && colA !== '' && colB) {
    finalize();
    const devName = colC && colC.length > colB.length ? colC : (colB || colC);
    cur = { stt: sttNum, name: devName, specs: [], useColC: USE_COL_C.includes(sttNum) };
    return;
  }
  if (!cur) return;
  if (!colB && !colC) return;

  const rowText = (colB + ' ' + colC).toLowerCase();
  if (NOISE_ROWS.some(n => rowText.includes(n))) return;
  if (rowText.trim().startsWith('thông số kỹ thuật')) return;

  const useColC = cur.useColC;
  const specText = useColC ? (colC || colB) : colB;
  if (!specText || specText.length < 2) return;

  if (specText.includes(':')) {
    const parts = specText.split(':');
    let k = parts[0].trim();
    let v = parts.slice(1).join(':').trim();
    // With non-colC items: if col C has a more specific value for same key, use it
    if (!useColC && colC && colC !== colB) {
      if (colC.includes(':')) {
        const cp = colC.split(':');
        if (cp[0].trim().toLowerCase() === k.toLowerCase()) {
          v = cp.slice(1).join(':').trim();
        }
      } else if (colC.length > 2) {
        v = colC;
      }
    }
    if (k && !NOISE_ROWS.some(n => k.toLowerCase().includes(n.split(' ')[0]))) {
      cur.specs.push({ key: k, value: v });
    }
  } else if (specText.length > 3) {
    let displayVal = specText;
    if (!useColC && colC && colC !== colB && colC.length > 2 && !colC.includes(':')) {
      displayVal = colC;
    }
    if (!NOISE_ROWS.some(n => displayVal.toLowerCase().startsWith(n.split(' ')[0]))) {
      cur.specs.push({ key: 'Thông số', value: displayVal });
    }
  }
});
finalize();

// Detect brand from name
const BRAND_MAP = {
  'MSI': 'MSI', 'OKI': 'OKI', 'Ricoh': 'Ricoh', 'RICOH': 'Ricoh',
  'Fi-8170': 'Ricoh', 'Fi-8150': 'Ricoh', 'Canon': 'Canon',
  'Granstream': 'Granstream', 'GWN': 'Granstream',
  'LiveU': 'LiveU', 'WD': 'WD', 'Sharp': 'Sharp',
  'iPad': 'Apple', 'Apple': 'Apple', 'BKCONTECH': 'BKCONTECH',
  'CMITech': 'CMITech', 'Identiv': 'Identiv', 'ATEN': 'ATEN'
};

function detectBrand(name) {
  for (const [k, v] of Object.entries(BRAND_MAP)) {
    if (name.includes(k)) return v;
  }
  return '';
}

function makeKey(stt, name) {
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 25);
  return `stt${stt}_${slug}`;
}

function escStr(s) {
  return (s || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r\n/g, '\\n')
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n');
}

let out = '';

items.forEach(item => {
  let model = '', brand = '', origin = '', warranty = '';
  item.specs.forEach(s => {
    const kl = s.key.toLowerCase();
    if (!model && (kl.includes('model') || kl.includes('mã hiệu'))) model = s.value;
    if (!brand && (kl.includes('hãng') || kl.includes('thương hiệu') || kl.includes('nhà sản xuất'))) brand = s.value;
    if (!origin && (kl.includes('xuất xứ') || kl.includes('nước sản xuất') || kl.includes('sản xuất tại'))) origin = s.value;
    if (!warranty && kl.includes('bảo hành')) warranty = s.value;
  });
  if (!brand) brand = detectBrand(item.name);

  const key = makeKey(item.stt, item.name);
  const specsLines = item.specs.map(s =>
    `          { key: '${escStr(s.key)}', value: '${escStr(s.value)}' }`
  ).join(',\n');

  out += `      '${key}': {\n`;
  out += `        name: '${escStr(item.name)}',\n`;
  out += `        model: '${escStr(model)}', brand: '${escStr(brand)}', origin: '${escStr(origin)}', warranty: '${escStr(warranty)}', unit: 'Cái', price: 0,\n`;
  out += `        specs: [\n${specsLines}\n        ]\n`;
  out += `      },\n`;
});

fs.writeFileSync('output_presets.js', out, 'utf8');
console.log('Done! Items:', items.length);
items.forEach(i => console.log(`  STT ${i.stt}: ${i.name} - ${i.specs.length} specs`));
