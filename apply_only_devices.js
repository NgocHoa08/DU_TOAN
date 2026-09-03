const fs = require('fs');
const XLSX = require('xlsx-js-style');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Update isStrictHardwareDevice in index.html
const sIdxHw = content.indexOf('function isStrictHardwareDevice(str) {');
const eIdxHw = content.indexOf('function isGenericHeaderOrNoiseSpec(text) {', sIdxHw);

if (sIdxHw === -1 || eIdxHw === -1) {
  console.error('Could not find isStrictHardwareDevice');
  process.exit(1);
}

const newHwCode = `function isStrictHardwareDevice(str) {
      if (!str || typeof str !== 'string') return false;
      var s = str.trim().toLowerCase();
      if (s.length < 3) return false;

      // 1. Blacklist: Non-hardware items (licenses, services, internet lines, maintenance, trainings, legal)
      var nonHardware = [
        'license', 'gia hạn', 'bản quyền', 'thuê đường truyền', 'thuê kênh', 'thuê mạng',
        'đường truyền', 'dịch vụ', 'chi phí', 'đào tạo', 'bảo trì', 'bảo dưỡng', 'vận chuyển',
        'lắp đặt', 'nhân công', 'tháo dỡ', 'kiểm định', 'chuyển giao', 'bảo hiểm',
        'thuyết minh', 'pccc', 'phòng cháy', 'vệ sinh', 'nghiệm thu', 'kế hoạch',
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

    function cleanDeviceName(rawName, model, brand) {
      if (!rawName) return '';
      var s = String(rawName).trim();
      s = s.replace(/phụ lục\\s*\\d*[:\\s-]*(tổng hợp[^(]*)?(\\([^)]*\\))?/gi, '').trim();
      s = s.replace(/^[0-9]+[.\\-\\s:]+/, '').trim();
      s = s.replace(/\\(có chế độ scan\\)/gi, '').trim();
      s = s.replace(/\\(máy scan\\)/gi, '').trim();
      s = s.replace(/hoặc tương đương/gi, '').trim();
      s = s.replace(/tương đương/gi, '').trim();
      s = s.replace(/\\s{2,}/g, ' ').trim();
      return s;
    }

    function isRealDevice(name) {
      return isStrictHardwareDevice(name);
    }

    `;

content = content.substring(0, sIdxHw) + newHwCode + content.substring(eIdxHw);

// 2. Update sanitizeDevice to clean device name
content = content.replace(
  "function sanitizeDevice(d) {",
  "function sanitizeDevice(d) {\n      if (d && d.name) d.name = cleanDeviceName(d.name, d.model, d.brand);"
);

// 3. Build MODEL_PRESETS and CATALOG_ITEMS with ONLY actual hardware devices
const baoAnDevs = require('./baoan_devs.json');
let presetsObj = {};
let catalogArr = [];

const hardwareDevs = baoAnDevs.filter(d => {
  let nameL = d.name.toLowerCase();
  return !nameL.includes('license') && !nameL.includes('gia hạn') && !nameL.includes('thuê') && !nameL.includes('đường truyền');
});

hardwareDevs.forEach((d, idx) => {
  let pKey = 'hw_dev_' + (idx + 1);
  let cat = 'thiet_bi_khac';
  let nameL = d.name.toLowerCase();
  if (nameL.includes('máy tính') || nameL.includes('vi tính') || nameL.includes('laptop') || nameL.includes('kiosk') || nameL.includes('máy chủ') || nameL.includes('server') || nameL.includes('ipad')) {
    cat = 'may_tinh';
  } else if (nameL.includes('máy in') || nameL.includes('in laser')) {
    cat = 'may_in';
  } else if (nameL.includes('scan') || nameL.includes('quét')) {
    cat = 'may_scan';
  } else if (nameL.includes('photo') || nameL.includes('đa chức năng')) {
    cat = 'photocopy';
  }

  let cleanN = d.name.replace(/tương đương/gi, '').replace(/hoặc tương đương/gi, '').replace(/\(có chế độ scan\)/gi, '').replace(/\(máy scan\)/gi, '').replace(/\s{2,}/g, ' ').trim();

  presetsObj[pKey] = {
    name: cleanN,
    model: d.model,
    brand: d.brand,
    origin: d.origin,
    warranty: '12 tháng',
    unit: d.unit,
    price: d.price || 0,
    specs: d.specs && d.specs.length > 0 ? d.specs : [
      { key: 'Chức năng chuẩn', value: cleanN },
      { key: 'Model / Mã hiệu', value: d.model || 'Chính hãng' },
      { key: 'Hãng sản xuất', value: d.brand || 'Chính hãng' },
      { key: 'Xuất xứ', value: d.origin || 'Chính hãng' },
      { key: 'Bảo hành', value: '12 tháng chính hãng' }
    ]
  };

  catalogArr.push({
    id: pKey,
    cat: cat,
    presetKey: pKey,
    name: cleanN,
    model: d.model,
    brand: d.brand,
    origin: d.origin,
    price: d.price || 0,
    qty: d.qty || 1,
    warranty: '12 tháng',
    unit: d.unit,
    specCount: presetsObj[pKey].specs.length
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
console.log('Successfully filtered to only hardware devices and cleaned device names!');
