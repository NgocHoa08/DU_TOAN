const fs = require('fs');
const XLSX = require('xlsx-js-style');

const wb = XLSX.readFile('Dự toán -Bảo An V1.xlsx');
const ws = wb.Sheets['TSKT'];
const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z1000');

function gv(r, c) {
  const cell = ws[XLSX.utils.encode_cell({ r, c })];
  return cell ? String(cell.w || cell.v || '').trim() : '';
}

function cleanFullDeviceName(name, stt) {
  if (!name) return '';
  let s = String(name).replace(/[\u00a0\s]+/g, ' ').trim();
  s = s.replace(/phụ lục\s*\d*[:\s-]*(tổng hợp[^(]*)?(\([^)]*\))?/gi, '').trim();
  s = s.replace(/^[0-9]+[.\-\s:]+/, '').trim();
  s = s.replace(/hoặc\s+tương\s+đương/gi, '').trim();
  s = s.replace(/tương\s+đương/gi, '').trim();
  s = s.replace(/\(có chế độ scan\)/gi, '').trim();
  s = s.replace(/\(máy scan\)/gi, '').trim();
  s = s.replace(/\s{2,}/g, ' ').trim();

  let sttNum = parseInt(stt);
  if (sttNum === 1 || s.includes('Cubi')) return 'Máy vi tính để bàn MSI Cubi NUC 1M';
  if (sttNum === 2 || s.includes('MS-14S1') || s.includes('Commercial 14')) return 'Máy tính xách tay MSI Commercial 14 B1MG (MS-14S1)';
  if (sttNum === 3 || s.includes('B433DN') || s.includes('OKI')) return 'Máy in A4 đen trắng OKI B433DN';
  if (sttNum === 4 || s.includes('SP-2240') || s.includes('RICOH SP') || s.includes('SP-2240N')) return 'Máy quét tài liệu số hóa RICOH SP-2240N';
  if (sttNum === 6 || s.includes('CBS350')) return 'Thiết bị mạng Switch Cisco CBS350-24S';
  if (sttNum === 7 || s.includes('WS-C2960L') || s.includes('2960L')) return 'Thiết bị mạng Switch Cisco WS-C2960L';
  if (sttNum === 8 || s.includes('CBS250')) return 'Thiết bị mạng Switch Cisco CBS250-48PP';
  if (sttNum === 9 || s.includes('VC520')) return 'Thiết bị phòng họp trực tuyến Aver VC520 PRO3';
  if (sttNum === 13 || s.includes('1200') || s.includes('catalyst')) return 'Switch Cisco Catalyst 1200 Series';
  if (sttNum === 10 || s.includes('Switch Cisco')) return 'Thiết bị mạng Switch Cisco 24 Port Gigabit';
  if (sttNum === 12 || s.includes('Sophos') || s.includes('XGS') || s.includes('tường lửa')) return 'Thiết bị tường lửa Sophos XGS 128';
  if (sttNum === 14 || s.includes('Camera')) return 'Camera an ninh IP';
  if (sttNum === 15 || s.includes('P162') || s.includes('chiếu')) return 'Máy chiếu INFOCUS P162 + phụ kiện';
  if (sttNum === 16 || s.includes('CAT6') || s.includes('Việt Hàn') || s.includes('COMMSCOPE')) return 'Cáp mạng CAT 6 Việt Hàn CAT6';
  if (sttNum === 17 || s.includes('ER707') || s.includes('Draytek') || s.includes('cân bằng tải')) return 'Thiết bị cân bằng tải TP-Link Omada ER707-M2';
  if (sttNum === 18 || s.includes('M706n') || s.includes('Máy in A3')) return 'Máy in A3 HP LaserJet Pro M706n';
  if (sttNum === 19 || s.includes('IM 3500') || s.includes('photocopy')) return 'Máy photocopy Ricoh IM 3500';

  return s;
}

let curDev = null;
const allDevs = [];

for (let r = 1; r <= range.e.r; r++) {
  let stt = gv(r, 1);
  let name = gv(r, 2);
  let req = gv(r, 3);
  let offer = gv(r, 4);

  let sttNum = parseInt(stt);
  if (!isNaN(sttNum) && sttNum > 0 && String(stt).trim() !== '' && (name || req || offer)) {
    if (curDev) allDevs.push(curDev);
    let devName = (sttNum === 16 || sttNum === 17) ? (offer || name || req) : (name || req || offer);
    curDev = {
      stt: sttNum,
      name: cleanFullDeviceName(devName, sttNum),
      specs: []
    };
    continue;
  }

  if (!curDev) continue;

  let isOffer = (curDev.stt === 16 || curDev.stt === 17);
  let specKey = name;
  let specVal = isOffer ? (offer || req) : (req || offer);

  if (!specKey && !specVal) continue;
  if (specKey.toLowerCase().startsWith('thông số kỹ thuật') || specVal.toLowerCase().startsWith('thông số kỹ thuật')) continue;
  if ((specKey + ' ' + specVal).toLowerCase().includes('đại diện hợp pháp')) continue;

  if (specKey && !specVal && specKey.includes(':')) {
    let p = specKey.split(':');
    specKey = p[0].trim();
    specVal = p.slice(1).join(':').trim();
  } else if (!specKey && specVal && specVal.includes(':') && specVal.length < 80) {
    let p = specVal.split(':');
    specKey = p[0].trim();
    specVal = p.slice(1).join(':').trim();
  }

  if (specKey) {
    curDev.specs.push({ key: specKey, value: specVal });
  } else if (specVal) {
    // If no specKey, merge into previous spec item value!
    if (curDev.specs.length > 0) {
      curDev.specs[curDev.specs.length - 1].value += '\n' + specVal;
    } else {
      curDev.specs.push({ key: 'Mô tả chung', value: specVal });
    }
  }
}
if (curDev) allDevs.push(curDev);

// Filter out non-hardware items (STT 5 and 11)
const validDevs = allDevs.filter(d => d.stt !== 5 && d.stt !== 11);

// Update index.html
let content = fs.readFileSync('main.js', 'utf8');

// 1. Update parseSpecSheetUniversal in index.html to use smart merging without 'Thông số'
const sIdxParser = content.indexOf('function parseSpecSheetUniversal(ws, sheetName) {');
const eIdxParser = content.indexOf('function isTuyenBoSheet(ws, range) {', sIdxParser);

if (sIdxParser === -1 || eIdxParser === -1) {
  console.error('Could not find parseSpecSheetUniversal block');
  process.exit(1);
}

const newParserCode = `function parseSpecSheetUniversal(ws, sheetName) {
      var range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z500');
      function gvLocal(r, c) {
        if (c < 0) return '';
        var cell = ws[XLSX.utils.encode_cell({ r: r, c: c })];
        return cell ? String(cell.w || cell.v || '').trim() : '';
      }

      var hdrRow = -1;
      var colMap = { stt: -1, name: -1, req: -1, offer: -1, compare: -1 };

      for (var r = range.s.r; r <= Math.min(range.e.r, range.s.r + 15); r++) {
        var hasStt = false;
        var hasSpecOrOffer = false;
        var tempMap = { stt: -1, name: -1, req: -1, offer: -1, compare: -1 };

        for (var c = range.s.c; c <= range.e.c; c++) {
          var val = gvLocal(r, c).toLowerCase().replace(/\\s+/g, ' ');
          if (!val) continue;
          if ((val === 'stt' || val === 'tt' || val.startsWith('stt ')) && tempMap.stt === -1) {
            tempMap.stt = c; hasStt = true;
          }
          if ((val.includes('hạng mục') || val.includes('danh mục') || val.includes('tên hàng') || val.includes('tên thiết bị')) && !val.includes('thông số') && tempMap.name === -1) {
            tempMap.name = c;
          }
          if ((val.includes('thông số') || val.includes('yêu cầu') || val.includes('e-hsmt') || val.includes('hsmt')) && tempMap.req === -1) {
            tempMap.req = c; hasSpecOrOffer = true;
          }
          if ((val.includes('đề xuất') || val.includes('chào thầu') || val.includes('hàng hóa chào')) && tempMap.offer === -1) {
            tempMap.offer = c; hasSpecOrOffer = true;
          }
          if ((val.includes('so sánh') || val.includes('tuyên bố') || val.includes('đáp ứng')) && tempMap.compare === -1) {
            tempMap.compare = c;
          }
        }

        if (hasStt && hasSpecOrOffer) {
          hdrRow = r;
          colMap = tempMap;
          break;
        }
      }

      if (hdrRow === -1) return null;

      if (colMap.name === -1 && colMap.stt !== -1 && colMap.req > colMap.stt + 1) {
        colMap.name = colMap.stt + 1;
      }

      var sections = [];
      var curDev = null;
      var USE_OFFER_ITEMS = [16, 17];

      function finalize() {
        if (curDev && (curDev.specs.length > 0 || curDev.name)) {
          while (curDev.specs.length > 0) {
            var last = curDev.specs[curDev.specs.length - 1];
            var full = (last.key + ' ' + last.value).toLowerCase();
            if (full.includes('đại diện') || full.includes('đứng đầu') || full.includes('liên danh') || full.includes('ký tên')) {
              curDev.specs.pop();
            } else break;
          }
          autoDetectDeviceInfo(curDev);
          sections.push(curDev);
        }
      }

      for (var r2 = hdrRow + 1; r2 <= range.e.r; r2++) {
        var sttRaw = gvLocal(r2, colMap.stt);
        var nameRaw = gvLocal(r2, colMap.name);
        var reqRaw = gvLocal(r2, colMap.req);
        var offerRaw = gvLocal(r2, colMap.offer);

        var sttNum = parseInt(sttRaw);
        if (!isNaN(sttNum) && sttNum > 0 && String(sttRaw).trim() !== '' && (nameRaw || reqRaw || offerRaw)) {
          finalize();
          var isOfferItem = USE_OFFER_ITEMS.indexOf(sttNum) >= 0;
          var devName = isOfferItem ? (offerRaw || nameRaw || reqRaw) : (nameRaw || reqRaw || offerRaw);

          curDev = {
            sheetName: sheetName,
            stt: sttNum,
            name: cleanFullDeviceName(devName, sttNum),
            isOfferItem: isOfferItem,
            model: '', brand: '', origin: '', warranty: '',
            specs: []
          };
          continue;
        }

        if (!curDev) continue;

        var isOffer = curDev.isOfferItem;
        var specKey = (colMap.name !== -1 && colMap.name !== colMap.req) ? nameRaw : '';
        var specVal = isOffer ? (offerRaw || reqRaw) : (reqRaw || offerRaw);

        if (!specKey && !specVal) continue;
        var rowText = (specKey + ' ' + specVal).toLowerCase();
        if (rowText.startsWith('thông số kỹ thuật') || rowText === 'thông số kỹ thuật:') continue;
        if (rowText.includes('đại diện hợp pháp') || rowText.includes('đứng đầu liên danh') || rowText.includes('ký tên')) continue;

        if (!specKey && specVal.includes(':') && specVal.length < 80) {
          var parts = specVal.split(':');
          specKey = parts[0].trim();
          specVal = parts.slice(1).join(':').trim();
        } else if (specKey && !specVal && specKey.includes(':')) {
          var parts2 = specKey.split(':');
          specKey = parts2[0].trim();
          specVal = parts2.slice(1).join(':').trim();
        }

        if (specKey) {
          var kL = specKey.toLowerCase();
          if (!curDev.model && (kL.includes('model') || kL.includes('mã hiệu'))) curDev.model = specVal;
          if (!curDev.brand && (kL.includes('hãng') || kL.includes('thương hiệu') || kL.includes('nhà sản xuất'))) curDev.brand = specVal;
          if (!curDev.origin && (kL.includes('xuất xứ') || kL.includes('nước sản xuất') || kL.includes('sản xuất tại'))) curDev.origin = specVal;
          if (!curDev.warranty && kL.includes('bảo hành')) curDev.warranty = specVal;

          curDev.specs.push({ key: specKey, value: specVal });
        } else if (specVal) {
          // If no specKey, merge into previous spec item instead of creating a generic 'Thông số' row!
          if (curDev.specs.length > 0) {
            curDev.specs[curDev.specs.length - 1].value += '\\n' + specVal;
          } else {
            curDev.specs.push({ key: 'Mô tả chung', value: specVal });
          }
        }
      }
      finalize();

      return sections;
    }

    `;

content = content.substring(0, sIdxParser) + newParserCode + content.substring(eIdxParser);

// 2. Update MODEL_PRESETS & CATALOG_ITEMS with clean specs (no 'Thông số')
let presetsObj = {};
let catalogArr = [];

const fullCommercialList = [
  { name: 'Máy vi tính để bàn MSI Cubi NUC 1M', model: 'Cubi B0B1', brand: 'MSI', origin: 'Trung Quốc', cat: 'may_tinh', unit: 'Bộ', origStt: 1 },
  { name: 'Máy tính xách tay MSI Commercial 14 B1MG (MS-14S1)', model: 'MS-14S1', brand: 'MSI', origin: 'Trung Quốc', cat: 'may_tinh', unit: 'Chiếc', origStt: 2 },
  { name: 'Máy in A4 đen trắng OKI B433DN', model: 'B433DN', brand: 'OKI', origin: 'Thái Lan', cat: 'may_in', unit: 'Chiếc', origStt: 3 },
  { name: 'Máy quét tài liệu số hóa RICOH SP-2240N', model: 'SP-2240', brand: 'Ricoh', origin: 'Thái Lan', cat: 'may_scan', unit: 'Chiếc', origStt: 4 },
  { name: 'Thiết bị mạng Switch Cisco CBS350-24S', model: 'CBS350-24S', brand: 'Cisco', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Cái', origStt: 6 },
  { name: 'Thiết bị mạng Switch Cisco WS-C2960L', model: 'WS-C2960L', brand: 'Cisco', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Cái', origStt: 7 },
  { name: 'Thiết bị mạng Switch Cisco CBS250-48PP', model: 'CBS250-48PP', brand: 'Cisco', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Cái', origStt: 8 },
  { name: 'Thiết bị phòng họp trực tuyến Aver VC520 PRO3', model: 'VC520 PRO3', brand: 'Aver', origin: 'Đài Loan', cat: 'thiet_bi_khac', unit: 'Bộ', origStt: 9 },
  { name: 'Thiết bị mạng Switch Cisco 24 Port Gigabit', model: '24 Port Gigabit', brand: 'Cisco', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Cái', origStt: 10 },
  { name: 'Thiết bị tường lửa Sophos XGS 128', model: 'XGS 128', brand: 'Sophos', origin: 'Đài Loan', cat: 'thiet_bi_khac', unit: 'Cái', origStt: 12 },
  { name: 'Switch Cisco Catalyst 1200 Series', model: 'Catalyst 1200', brand: 'Cisco', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Cái', origStt: 13 },
  { name: 'Camera an ninh IP', model: 'IP Dome/Bullet', brand: 'Chính hãng', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Chiếc', origStt: 14 },
  { name: 'Máy chiếu INFOCUS P162 + phụ kiện', model: 'P162', brand: 'INFOCUS', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Bộ', origStt: 15 },
  { name: 'Cáp mạng CAT 6 Việt Hàn CAT6', model: 'Việt Hàn CAT6', brand: 'Việt Hàn', origin: 'Việt Nam', cat: 'thiet_bi_khac', unit: 'Thùng', origStt: 16 },
  { name: 'Thiết bị cân bằng tải TP-Link Omada ER707-M2', model: 'ER707-M2', brand: 'TP-Link', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Cái', origStt: 17 },
  { name: 'Máy in A3 HP LaserJet Pro M706n', model: 'LaserJet Pro M706n', brand: 'HP', origin: 'Trung Quốc', cat: 'may_in', unit: 'Chiếc', origStt: 18 },
  { name: 'Máy photocopy Ricoh IM 3500', model: 'IM 3500', brand: 'Ricoh', origin: 'Thái Lan', cat: 'photocopy', unit: 'Chiếc', origStt: 19 }
];

fullCommercialList.forEach((d, idx) => {
  let pKey = 'hw_full_' + (idx + 1);
  let origDev = validDevs.find(x => x.stt === d.origStt);
  let specs = (origDev && origDev.specs && origDev.specs.length > 0) ? origDev.specs : [
    { key: 'Chức năng chuẩn', value: d.name },
    { key: 'Model / Mã hiệu', value: d.model },
    { key: 'Hãng sản xuất', value: d.brand },
    { key: 'Xuất xứ', value: d.origin },
    { key: 'Bảo hành', value: '12 tháng chính hãng' }
  ];

  presetsObj[pKey] = {
    name: d.name,
    model: d.model,
    brand: d.brand,
    origin: d.origin,
    warranty: '12 tháng',
    unit: d.unit,
    price: 0,
    specs: specs
  };

  catalogArr.push({
    id: pKey,
    cat: d.cat,
    presetKey: pKey,
    name: d.name,
    model: d.model,
    brand: d.brand,
    origin: d.origin,
    price: 0,
    qty: 1,
    warranty: '12 tháng',
    unit: d.unit,
    specCount: specs.length
  });
});

const sIdxPresets = content.indexOf('var MODEL_PRESETS = {');
const eIdxPresets = content.indexOf('function applyModelPreset', sIdxPresets);
const endBracePresets = content.lastIndexOf('};', eIdxPresets);

const newModelPresetsFull = 'var MODEL_PRESETS = ' + JSON.stringify(presetsObj, null, 6) + ';';
content = content.substring(0, sIdxPresets) + newModelPresetsFull + content.substring(endBracePresets + 2);

const sIdxCat = content.indexOf('var CATALOG_ITEMS = [');
const eIdxCat = content.indexOf('];', sIdxCat);
const newCatalogFull = 'var CATALOG_ITEMS = ' + JSON.stringify(catalogArr, null, 6) + ';';
content = content.substring(0, sIdxCat) + newCatalogFull + content.substring(eIdxCat + 2);

fs.writeFileSync('main.js', content, 'utf8');
console.log('Successfully eliminated all generic "Thông số" rows and updated index.html!');
