const XLSX = require('xlsx-js-style');
const fs = require('fs');

// 1. Read Bao An V1 to get all 19 items
const wb = XLSX.readFile('Dự toán -Bảo An V1.xlsx');
const wsTH = wb.Sheets['Tổng hợp'];
const wsTSKT = wb.Sheets['TSKT'];

function gv(ws, r, c) {
  if (c < 0) return '';
  const cell = ws[XLSX.utils.encode_cell({ r, c })];
  return cell ? String(cell.w || cell.v || '').trim() : '';
}
function gn(ws, r, c) {
  const cell = ws[XLSX.utils.encode_cell({ r, c })];
  if (!cell) return 0;
  if (cell.t === 'n') return Number(cell.v) || 0;
  return parseFloat(String(cell.v || '').replace(/[^0-9.]/g, '')) || 0;
}

// Parse TSKT
const rangeTSKT = XLSX.utils.decode_range(wsTSKT['!ref'] || 'A1:Z500');
const USE_OFFER = [16, 17];
let curDev = null;
let tsktMap = {};

for (let r = 1; r <= rangeTSKT.e.r; r++) {
  let sttVal = gv(wsTSKT, r, 1);
  let nameVal = gv(wsTSKT, r, 2);
  let reqVal = gv(wsTSKT, r, 3);
  let offerVal = gv(wsTSKT, r, 4);

  let sttNum = parseInt(sttVal);
  if (!isNaN(sttNum) && sttNum > 0 && sttVal !== '' && nameVal !== '') {
    let isOffer = USE_OFFER.includes(sttNum);
    curDev = {
      stt: sttNum,
      name: nameVal,
      reqModel: reqVal,
      offerModel: offerVal,
      isOffer: isOffer,
      specs: []
    };
    tsktMap[sttNum] = curDev;
    continue;
  }

  if (!curDev) continue;

  let specKey = nameVal;
  let specVal = curDev.isOffer ? (offerVal || reqVal) : (reqVal || offerVal);

  if (!specKey && specVal) {
    if (specVal.includes(':')) {
      let p = specVal.split(':');
      specKey = p[0].trim();
      specVal = p.slice(1).join(':').trim();
    } else {
      specKey = 'Thông số';
    }
  }

  if (specKey || specVal) {
    // clean noise
    let txt = (specKey + ' ' + specVal).toLowerCase();
    if (!txt.startsWith('thông số kỹ thuật') && !txt.includes('đại diện hợp pháp') && !txt.includes('đứng đầu liên danh')) {
      curDev.specs.push({ key: specKey || 'Thông số', value: specVal });
    }
  }
}

// Parse Tổng hợp
const rangeTH = XLSX.utils.decode_range(wsTH['!ref'] || 'A1:Z50');
const baoAnDevs = [];
for (let r = 2; r <= rangeTH.e.r; r++) {
  let stt = gv(wsTH, r, 1);
  let name = gv(wsTH, r, 2);
  let model = gv(wsTH, r, 3);
  let brand = gv(wsTH, r, 4);
  let origin = gv(wsTH, r, 5);
  let qty = gn(wsTH, r, 6);
  let unit = gv(wsTH, r, 7) || 'Cái';
  let price = gn(wsTH, r, 8);

  let sttNum = parseInt(stt);
  if (!isNaN(sttNum) && sttNum > 0 && name) {
    let specs = (tsktMap[sttNum] && tsktMap[sttNum].specs) || [];
    
    // For 16 & 17, use offer model and name
    if (sttNum === 16) {
      name = 'Cáp mạng CAT 6 Việt Hàn CAT6';
      model = 'Việt Hàn CAT6';
      brand = 'Việt Hàn';
      origin = 'Việt Nam';
      unit = 'Thùng';
    } else if (sttNum === 17) {
      name = 'Thiết bị cân bằng tải TP-Link Omada ER707-M2';
      model = 'ER707-M2';
      brand = 'TP-Link';
      origin = 'Trung Quốc';
      unit = 'Cái';
    }

    baoAnDevs.push({
      stt: sttNum,
      name: name,
      model: model,
      brand: brand,
      origin: origin,
      qty: qty || 1,
      unit: unit,
      price: price,
      warranty: '12 tháng',
      specs: specs
    });
  }
}

console.log('Total Bao An Devs:', baoAnDevs.length);
fs.writeFileSync('baoan_devs.json', JSON.stringify(baoAnDevs, null, 2), 'utf8');
console.log('Saved to baoan_devs.json');
