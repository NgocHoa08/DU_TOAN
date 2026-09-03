const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Update cleanDeviceName & isStrictHardwareDevice
const sIdxHw = content.indexOf('function isStrictHardwareDevice(str) {');
const eIdxHw = content.indexOf('function isGenericHeaderOrNoiseSpec(text) {', sIdxHw);

if (sIdxHw === -1 || eIdxHw === -1) {
  console.error('Could not find isStrictHardwareDevice');
  process.exit(1);
}

const newHwCode = `function cleanDeviceName(rawName) {
      if (!rawName) return '';
      var s = String(rawName).replace(/[\\u00a0\\s]+/g, ' ').trim();
      s = s.replace(/phụ lục\\s*\\d*[:\\s-]*(tổng hợp[^(]*)?(\\([^)]*\\))?/gi, '').trim();
      s = s.replace(/^[0-9]+[.\\-\\s:]+/, '').trim();
      s = s.replace(/hoặc\\s+tương\\s+đương/gi, '').trim();
      s = s.replace(/tương\\s+đương/gi, '').trim();
      s = s.replace(/\\(có chế độ scan\\)/gi, '').trim();
      s = s.replace(/\\(máy scan\\)/gi, '').trim();
      s = s.replace(/\\s{2,}/g, ' ').trim();
      return s;
    }

    function isStrictHardwareDevice(str) {
      if (!str || typeof str !== 'string') return false;
      var s = str.trim().toLowerCase().replace(/[\\u00a0\\s]+/g, ' ');
      if (s.length < 3) return false;

      // 1. Blacklist: Non-hardware items (licenses, services, internet lines, maintenance, trainings, legal)
      var nonHardware = [
        'license', 'gia hạn', 'bản quyền', 'thuê đường truyền', 'thuê kênh', 'thuê mạng',
        'đường truyền', 'số liệu chuyên dùng', 'dịch vụ', 'chi phí', 'đào tạo', 'bảo trì',
        'bảo dưỡng', 'vận chuyển', 'lắp đặt', 'nhân công', 'tháo dỡ', 'kiểm định', 'chuyển giao',
        'bảo hiểm', 'thuyết minh', 'pccc', 'phòng cháy', 'vệ sinh', 'nghiệm thu', 'kế hoạch',
        'hợp đồng', 'bảo lãnh', 'e-hsdt', 'e-hsmt', 'năng lực', 'kinh nghiệm', 'tài chính',
        'đại diện', 'ông/bà', 'họ và tên', 'chức vụ', 'kỹ sư', 'cán bộ', 'kế toán',
        'mục lục', 'tổng cộng', 'bằng chữ', 'thời gian thực hiện', 'tiêu chuẩn đánh giá',
        'phạm vi cung cấp', 'danh mục hàng hóa', 'bảng tổng hợp', 'chương ', 'phần '
      ];
      if (nonHardware.some(function (bw) { return s.includes(bw); })) {
        return false;
      }

      // 2. Whitelist: MUST contain explicit hardware device keywords
      var hardwareKeywords = [
        'máy vi tính', 'máy tính', 'pc', 'desktop', 'laptop', 'máy chủ', 'server',
        'máy in', 'máy scan', 'máy quét', 'máy photo', 'máy photocopy', 'máy đa chức năng',
        'màn hình', 'switch', 'bộ chuyển mạch', 'hub', 'router', 'access point', 'wifi',
        'đầu đọc thẻ', 'thẻ từ', 'thẻ nhớ', 'đầu đọc', 'bộ lưu điện', 'ups',
        'máy ảnh', 'camera', 'kiosk', 'ipad', 'tablet', 'ổ cứng', 'tủ rack',
        'máy chiếu', 'loa', 'amply', 'micro', 'webcam', 'bàn phím', 'chuột',
        'cáp mạng', 'cáp', 'cân bằng tải', 'tường lửa', 'firewall', 'phòng họp trực tuyến',
        'hội nghị truyền hình', 'thiết bị mạng', 'thiết bị phòng họp', 'thiết bị'
      ];

      return hardwareKeywords.some(function (hw) { return s.includes(hw); });
    }

    function isRealDevice(name) {
      return isStrictHardwareDevice(name);
    }

    `;

content = content.substring(0, sIdxHw) + newHwCode + content.substring(eIdxHw);

// 2. Update parseSummaryRows to strictly filter non-devices and clean names
const sIdxSummary = content.indexOf('function parseSummaryRows(ws, range, hdrRow) {');
const eIdxSummary = content.indexOf('function isNoiseOrNonDeviceText(text) {', sIdxSummary);

const newParseSummaryRowsCode = `function parseSummaryRows(ws, range, hdrRow) {
      var ds = hdrRow >= 0 ? hdrRow + 1 : range.s.r + 1;

      var colMap = { stt: -1, name: -1, model: -1, brand: -1, origin: -1, unit: -1, qty: -1, price: -1, total: -1 };
      if (hdrRow >= 0) {
        for (var c = range.s.c; c <= range.e.c; c++) {
          var h = String(gv(ws, hdrRow, c)).toLowerCase().replace(/\\s+/g, ' ');
          if (!h) continue;
          if ((h.includes('stt') || h === 'tt') && colMap.stt === -1) colMap.stt = c;
          else if ((h.includes('hạng mục') || h.includes('danh mục') || h.includes('tên thiết bị') || h.includes('tên máy') || h.includes('tên hàng') || h.includes('hàng hóa') || h.includes('nội dung')) && colMap.name === -1) colMap.name = c;
          else if ((h.includes('model') || h.includes('mã hiệu') || h.includes('ký hiệu')) && colMap.model === -1) colMap.model = c;
          else if ((h.includes('hãng') || h.includes('thương hiệu') || h.includes('nhà sản xuất') || h.includes('nsx')) && colMap.brand === -1) colMap.brand = c;
          else if ((h.includes('xuất xứ') || h.includes('nước sản xuất') || h.includes('nơi sản xuất')) && colMap.origin === -1) colMap.origin = c;
          else if ((h.includes('đvt') || h.includes('đơn vị tính') || h === 'đơn vị') && colMap.unit === -1) colMap.unit = c;
          else if ((h.includes('số lượng') || h === 'sl' || h.includes('qty')) && colMap.qty === -1) colMap.qty = c;
          else if (colMap.price === -1 && (h.includes('đơn giá') || h.includes('đơn gia') || h.includes('giá bán') || (h.includes('giá') && !h.includes('đánh giá') && !h.includes('thành tiền')))) colMap.price = c;
          else if ((h.includes('thành tiền') || h.includes('tổng tiền') || h.includes('tổng cộng')) && colMap.total === -1) colMap.total = c;
        }
      }

      for (var r2 = range.s.r; r2 <= Math.min(range.e.r, range.s.r + 7); r2++) {
        var a = String(gv(ws, r2, 0)).trim().toUpperCase();
        var b = gv(ws, r2, 1);
        if (a === 'A' && b && document.getElementById('pjN') && !document.getElementById('pjN').value) document.getElementById('pjN').value = String(b);
        if ((a === 'I' || a === '1') && b && document.getElementById('gpN') && !document.getElementById('gpN').value) document.getElementById('gpN').value = String(b);
      }

      for (var row = ds; row <= range.e.r; row++) {
        var sttColIdx = colMap.stt >= 0 ? colMap.stt : 0;
        var sv = String(gv(ws, row, sttColIdx)).trim().toUpperCase();
        if (['', 'A', 'B', 'C', 'I', 'II', 'III', 'IV', 'V', 'TỔNG CỘNG', 'TOTAL', 'TỔNG'].indexOf(sv) >= 0) continue;

        var rawName = colMap.name >= 0 ? gv(ws, row, colMap.name) : gv(ws, row, 1);
        if (!rawName || rawName.toUpperCase().startsWith('TỔNG')) continue;

        // Strictly filter out non-hardware items (license, internet line, services...)
        if (!isStrictHardwareDevice(rawName)) continue;

        var name = cleanDeviceName(rawName);
        var model = colMap.model >= 0 ? gv(ws, row, colMap.model) : '';
        var brand = colMap.brand >= 0 ? gv(ws, row, colMap.brand) : '';
        var origin = colMap.origin >= 0 ? gv(ws, row, colMap.origin) : '';
        var unit = colMap.unit >= 0 ? gv(ws, row, colMap.unit) : 'Máy';
        var qty = colMap.qty >= 0 ? (gn(ws, row, colMap.qty) || 1) : 1;
        var price = colMap.price >= 0 ? gn(ws, row, colMap.price) : 0;

        if (!price) {
          for (var fc = range.s.c; fc <= range.e.c; fc++) {
            if (fc === colMap.name || fc === colMap.stt || fc === colMap.qty) continue;
            var cellVal = gn(ws, row, fc);
            if (cellVal >= 1000) {
              price = cellVal; break;
            }
          }
        }

        var sttNum = parseInt(sv);
        var devObj = {
          id: ++devCnt,
          stt: !isNaN(sttNum) && sttNum > 0 ? sttNum : (devs.length + 1),
          origStt: !isNaN(sttNum) && sttNum > 0 ? sttNum : (devs.length + 1),
          name: name, model: model, brand: brand,
          origin: origin, unit: unit || 'Máy', qty: qty, price: price,
          warranty: '12 tháng', specs: []
        };

        devs.push(sanitizeDevice(devObj));
      }
    }

    `;

content = content.substring(0, sIdxSummary) + newParseSummaryRowsCode + content.substring(eIdxSummary);

// 3. Update linkSpecsToDevices
const sIdxLink = content.indexOf('function linkSpecsToDevices(allSpecs) {');
const eIdxLink = content.indexOf('/* ═══════════════════════════════════════════\n       STEP 2 UI & EXCEL WORKBOOK VIEWER', sIdxLink);

const newLinkSpecsCode = `function linkSpecsToDevices(allSpecs) {
      if (devs.length === 0) return;

      devs.forEach(function (d, dIdx) {
        var matchedSpec = null;
        var lookupStt = d.origStt || d.stt;

        // Match priority 1: By STT
        if (allSpecs && allSpecs.length > 0) {
          for (var i = 0; i < allSpecs.length; i++) {
            var sp = allSpecs[i];
            if (sp.stt === lookupStt) {
              matchedSpec = sp; break;
            }
          }

          // Match priority 2: By Model or Name
          if (!matchedSpec) {
            var dName = (d.name || '').toLowerCase();
            var dModel = (d.model || '').toLowerCase();
            for (var j = 0; j < allSpecs.length; j++) {
              var sp2 = allSpecs[j];
              var spName = (sp2.name || '').toLowerCase();
              var spModel = (sp2.model || '').toLowerCase();
              if (dModel && spModel && (dModel.includes(spModel) || spModel.includes(dModel))) {
                matchedSpec = sp2; break;
              }
              if (dName && spName && (dName.includes(spName) || spName.includes(dName))) {
                matchedSpec = sp2; break;
              }
            }
          }

          // Match priority 3: By index
          if (!matchedSpec && allSpecs[dIdx]) {
            matchedSpec = allSpecs[dIdx];
          }
        }

        if (matchedSpec && matchedSpec.specs && matchedSpec.specs.length > 0) {
          d.specs = JSON.parse(JSON.stringify(matchedSpec.specs));
          if (!d.model && matchedSpec.model) d.model = matchedSpec.model;
          if (!d.brand && matchedSpec.brand) d.brand = matchedSpec.brand;
          if (!d.origin && matchedSpec.origin) d.origin = matchedSpec.origin;
          if (!d.warranty && matchedSpec.warranty) d.warranty = matchedSpec.warranty;
        }

        // STT 12: Sophos XGS 128
        if (lookupStt === 12 || (d.model && d.model.includes('XGS 128'))) {
          d.name = 'Thiết bị tường lửa Sophos XGS 128';
          d.brand = 'Sophos';
          d.origin = 'Đài Loan';
        }

        // STT 16 & 17: Update name & model to offered device
        if (lookupStt === 16 || d.name.includes('COMMSCOPE') || d.model === 'CAT6') {
          d.name = 'Cáp mạng CAT 6 Việt Hàn CAT6';
          d.model = 'Việt Hàn CAT6';
          d.brand = 'Việt Hàn';
          d.origin = 'Việt Nam';
        } else if (lookupStt === 17 || d.name.includes('Draytek') || d.model === 'ER707-M2') {
          d.name = 'Thiết bị cân bằng tải TP-Link Omada ER707-M2';
          d.model = 'ER707-M2';
          d.brand = 'TP-Link';
          d.origin = 'Trung Quốc';
        }

        // Clean name
        d.name = cleanDeviceName(d.name);

        // If specs still empty, generate smart standardized 26 specs
        if (!d.specs || d.specs.length === 0) {
          d.specs = scrapeSmart26Specs(d.name, d.model, d.brand);
        }

        autoDetectDeviceInfo(d);
        syncDeviceSpecs(d);
      });

      // Renumber STT sequentially: 1, 2, 3...
      devs.forEach(function (d, i) { d.stt = i + 1; });
    }

    `;

content = content.substring(0, sIdxLink) + newLinkSpecsCode + content.substring(eIdxLink);

// 4. Update MODEL_PRESETS and CATALOG_ITEMS with only clean hardware devices
const baoAnDevs = require('./baoan_devs.json');
let presetsObj = {};
let catalogArr = [];

const cleanHardwareList = [
  { name: 'Máy vi tính để bàn', model: 'Cubi B0B1', brand: 'MSI', origin: 'Trung Quốc', cat: 'may_tinh', unit: 'Bộ', price: 17800000, origStt: 1 },
  { name: 'Máy tính xách tay', model: 'MS-14S1', brand: 'MSI', origin: 'Trung Quốc', cat: 'may_tinh', unit: 'Chiếc', price: 17800000, origStt: 2 },
  { name: 'Máy in A4', model: 'B433DN', brand: 'OKI', origin: 'Thái Lan', cat: 'may_in', unit: 'Chiếc', price: 4800000, origStt: 3 },
  { name: 'Máy quét tài liệu số hóa', model: 'SP-2240', brand: 'Ricoh', origin: 'Thái Lan', cat: 'may_scan', unit: 'Chiếc', price: 8800000, origStt: 4 },
  { name: 'Thiết bị mạng CBS350-24S', model: 'CBS350-24S', brand: 'Cisco', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Cái', price: 0, origStt: 6 },
  { name: 'Thiết bị mạng Cisco WS-C2960L', model: 'WS-C2960L', brand: 'Cisco', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Cái', price: 0, origStt: 7 },
  { name: 'Thiết bị mạng Switch Cisco CBS250-48PP', model: 'CBS250-48PP', brand: 'Cisco', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Cái', price: 0, origStt: 8 },
  { name: 'Thiết bị phòng họp trực tuyến', model: 'VC520 PRO3', brand: 'Aver', origin: 'Đài Loan', cat: 'thiet_bi_khac', unit: 'Bộ', price: 56000000, origStt: 9 },
  { name: 'Thiết bị mạng Switch Cisco', model: '24 Port Gigabit', brand: 'Cisco', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Cái', price: 0, origStt: 10 },
  { name: 'Thiết bị tường lửa Sophos XGS 128', model: 'XGS 128', brand: 'Sophos', origin: 'Đài Loan', cat: 'thiet_bi_khac', unit: 'Cái', price: 58000000, origStt: 12 },
  { name: 'Switch Cisco Catalyst 1200 Series', model: 'Catalyst 1200', brand: 'Cisco', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Cái', price: 0, origStt: 13 },
  { name: 'Camera an ninh IP', model: 'IP Dome/Bullet', brand: 'Chính hãng', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Chiếc', price: 0, origStt: 14 },
  { name: 'Máy chiếu', model: 'P162', brand: 'INFOCUS', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Bộ', price: 23000000, origStt: 15 },
  { name: 'Cáp mạng CAT 6 Việt Hàn CAT6', model: 'Việt Hàn CAT6', brand: 'Việt Hàn', origin: 'Việt Nam', cat: 'thiet_bi_khac', unit: 'Thùng', price: 2800000, origStt: 16 },
  { name: 'Thiết bị cân bằng tải TP-Link Omada ER707-M2', model: 'ER707-M2', brand: 'TP-Link', origin: 'Trung Quốc', cat: 'thiet_bi_khac', unit: 'Cái', price: 5000000, origStt: 17 },
  { name: 'Máy in A3', model: 'LaserJet Pro M706n', brand: 'HP', origin: 'Trung Quốc', cat: 'may_in', unit: 'Chiếc', price: 18750000, origStt: 18 },
  { name: 'Máy photocopy', model: 'IM 3500', brand: 'Ricoh', origin: 'Thái Lan', cat: 'photocopy', unit: 'Chiếc', price: 88000000, origStt: 19 }
];

cleanHardwareList.forEach((d, idx) => {
  let pKey = 'hw_item_' + (idx + 1);
  let origDev = baoAnDevs.find(x => x.stt === d.origStt);
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
    price: d.price || 0,
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
    price: d.price || 0,
    qty: 1,
    warranty: '12 tháng',
    unit: d.unit,
    specCount: specs.length
  });
});

const sIdxPresets = content.indexOf('var MODEL_PRESETS = {');
const eIdxPresets = content.indexOf('    function applyModelPreset', sIdxPresets);
const endBracePresets = content.lastIndexOf('};', eIdxPresets);

const newModelPresetsFull = 'var MODEL_PRESETS = ' + JSON.stringify(presetsObj, null, 6) + ';';
content = content.substring(0, sIdxPresets) + newModelPresetsFull + content.substring(endBracePresets + 2);

const sIdxCat = content.indexOf('var CATALOG_ITEMS = [');
const eIdxCat = content.indexOf('];', sIdxCat);
const newCatalogFull = 'var CATALOG_ITEMS = ' + JSON.stringify(catalogArr, null, 6) + ';';
content = content.substring(0, sIdxCat) + newCatalogFull + content.substring(eIdxCat + 2);

fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully updated index.html with clean devices!');
