const fs = require('fs');
const XLSX = require('xlsx-js-style');

let content = fs.readFileSync('main.js', 'utf8');

// 1. Update isNoiseOrNonDeviceText
content = content.replace(
  "function isNoiseOrNonDeviceText(text) {\n      if (!text || typeof text !== 'string') return true;\n      var s = text.trim().toLowerCase();\n      if (s.length < 2) return true;",
  "function isNoiseOrNonDeviceText(text) {\n      if (!text || typeof text !== 'string') return true;\n      var s = text.trim().toLowerCase();\n      if (s.length < 2) return true;\n      if (s.includes('camera') || s.includes('switch') || s.includes('máy ') || s.includes('máy vi tính') || s.includes('máy in') || s.includes('scan') || s.includes('license') || s.includes('cáp') || s.includes('cân bằng tải') || s.includes('hub') || s.includes('router') || s.includes('tường lửa') || s.includes('server') || s.includes('kiosk') || s.includes('ipad') || s.includes('tivi') || s.includes('ổ cứng') || s.includes('chiếu') || s.includes('photo')) return false;"
);

// 2. Update parseSummaryRows
const sIdxSummary = content.indexOf('function parseSummaryRows(ws, range, hdrRow) {');
const eIdxSummary = content.indexOf('function isNoiseOrNonDeviceText(text) {', sIdxSummary);

if (sIdxSummary === -1 || eIdxSummary === -1) {
  console.error('Could not find parseSummaryRows block');
  process.exit(1);
}

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

        var name = colMap.name >= 0 ? gv(ws, row, colMap.name) : gv(ws, row, 1);
        if (!name || name.toUpperCase().startsWith('TỔNG')) continue;

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
          name: name, model: model, brand: brand,
          origin: origin, unit: unit || 'Máy', qty: qty, price: price,
          warranty: '12 tháng', specs: []
        };

        if (!isNoiseOrNonDeviceText(name)) {
          devs.push(sanitizeDevice(devObj));
        }
      }
    }

    `;

content = content.substring(0, sIdxSummary) + newParseSummaryRowsCode + content.substring(eIdxSummary);

// 3. Replace isTuyenBoSheet / parseTuyenBoSheet / parseXlsxSmart with Universal Spec Sheet Parser
const sIdxTuyenBo = content.indexOf('function isTuyenBoSheet');
const eIdxSingleSpec = content.indexOf('function parseSingleSpecSheet(ws, sheetName)', sIdxTuyenBo);

const newParserCode = `function parseSpecSheetUniversal(ws, sheetName) {
      var range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z500');
      function gvLocal(r, c) {
        if (c < 0) return '';
        var cell = ws[XLSX.utils.encode_cell({ r: r, c: c })];
        return cell ? String(cell.w || cell.v || '').trim() : '';
      }

      // 1. Detect header row & columns
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

      if (hdrRow === -1) {
        return null;
      }

      if (colMap.name === -1 && colMap.stt !== -1 && colMap.req > colMap.stt + 1) {
        colMap.name = colMap.stt + 1;
      }

      var sections = [];
      var curDev = null;
      // STT 16 & 17 use offer column (cột Đề xuất)
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
          var devName = '';
          if (isOfferItem) {
            devName = offerRaw || nameRaw || reqRaw;
          } else {
            devName = nameRaw || reqRaw || offerRaw;
          }

          curDev = {
            sheetName: sheetName,
            stt: sttNum,
            name: devName,
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

        if (!specKey && specVal.includes(':')) {
          var parts = specVal.split(':');
          specKey = parts[0].trim();
          specVal = parts.slice(1).join(':').trim();
        } else if (specKey && !specVal && specKey.includes(':')) {
          var parts2 = specKey.split(':');
          specKey = parts2[0].trim();
          specVal = parts2.slice(1).join(':').trim();
        }

        if (!specKey && specVal.length > 2) {
          specKey = 'Thông số';
        }

        if (specKey || specVal) {
          var kL = (specKey || '').toLowerCase();
          if (!curDev.model && (kL.includes('model') || kL.includes('mã hiệu'))) curDev.model = specVal;
          if (!curDev.brand && (kL.includes('hãng') || kL.includes('thương hiệu') || kL.includes('nhà sản xuất'))) curDev.brand = specVal;
          if (!curDev.origin && (kL.includes('xuất xứ') || kL.includes('nước sản xuất') || kL.includes('sản xuất tại'))) curDev.origin = specVal;
          if (!curDev.warranty && kL.includes('bảo hành')) curDev.warranty = specVal;

          curDev.specs.push({ key: specKey || 'Thông số', value: specVal });
        }
      }
      finalize();

      return sections;
    }

    function isTuyenBoSheet(ws, range) {
      return parseSpecSheetUniversal(ws, '') !== null;
    }

    function parseTuyenBoSheet(ws, range, allSpecs) {
      var parsed = parseSpecSheetUniversal(ws, '');
      if (parsed && parsed.length > 0) {
        parsed.forEach(function (sec) { allSpecs.push(sec); });
      }
    }

    function parseXlsxSmart(wb, fileName, allSpecs) {
      wb.SheetNames.forEach(function (nm) {
        var ws = wb.Sheets[nm];
        var nmL = nm.toLowerCase().replace(/\\s+/g, '');
        var isSummarySheet = nmL.includes('tonghop') || nmL.includes('tổnghợp') || nmL.includes('baogia') || nmL.includes('báogiá') || nmL.includes('dutoan') || nmL.includes('dựtoán');

        var range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z500');

        // 1. Try Universal Spec Sheet Parser first (e.g. TSKT, Tuyên bố đáp ứng)
        var specSections = parseSpecSheetUniversal(ws, nm);
        if (specSections && specSections.length > 0) {
          specSections.forEach(function (sec) { allSpecs.push(sec); });
          return;
        }

        // 2. Check if this is a Summary Sheet
        var hasSummaryHeader = false;
        var hdrRow = -1;
        for (var r = range.s.r; r <= Math.min(range.e.r, range.s.r + 8); r++) {
          var c0 = String(gv(ws, r, 0)).toLowerCase();
          var c1 = String(gv(ws, r, 1)).toLowerCase();
          if (c0.includes('stt') || c0 === 'tt' || c1.includes('stt') || c1 === 'tt' || c1.includes('danh mục') || c1.includes('tên thiết bị') || c1.includes('tên hàng') || c1.includes('hạng mục')) {
            hasSummaryHeader = true; hdrRow = r; break;
          }
        }

        if (isSummarySheet || hasSummaryHeader) {
          parseSummaryRows(ws, range, hdrRow);
        } else {
          var parsedSections = parseSingleSpecSheet(ws, nm);
          parsedSections.forEach(function (sec) {
            if (sec && (sec.specs.length > 0 || sec.name)) {
              allSpecs.push(sec);
            }
          });
        }
      });
    }

    `;

content = content.substring(0, sIdxTuyenBo) + newParserCode + content.substring(eIdxSingleSpec);

// 4. Update linkSpecsToDevices
const sIdxLink = content.indexOf('function linkSpecsToDevices(allSpecs) {');
const eIdxLink = content.indexOf('/* ═══════════════════════════════════════════\n       STEP 2 UI & EXCEL WORKBOOK VIEWER', sIdxLink);

if (sIdxLink !== -1 && eIdxLink !== -1) {
  const newLinkSpecsCode = `function linkSpecsToDevices(allSpecs) {
      if (devs.length === 0) return;

      devs.forEach(function (d, dIdx) {
        var matchedSpec = null;

        // Match priority 1: By STT
        if (allSpecs && allSpecs.length > 0) {
          for (var i = 0; i < allSpecs.length; i++) {
            var sp = allSpecs[i];
            if (sp.stt === d.stt) {
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

          // Match priority 3: By exact index
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

        // STT 16 & 17: Update name & model to offered device if available
        if (d.stt === 16 && (!d.model || d.model === 'CAT6')) {
          d.name = 'Cáp mạng CAT 6 Việt Hàn CAT6';
          d.model = 'Việt Hàn CAT6';
          d.brand = 'Việt Hàn';
          d.origin = 'Việt Nam';
        } else if (d.stt === 17 && (!d.model || d.model.includes('2962'))) {
          d.name = 'Thiết bị cân bằng tải TP-Link Omada ER707-M2';
          d.model = 'ER707-M2';
          d.brand = 'TP-Link';
          d.origin = 'Trung Quốc';
        }

        // If specs still empty, generate smart standardized 26 specs
        if (!d.specs || d.specs.length === 0) {
          d.specs = scrapeSmart26Specs(d.name, d.model, d.brand);
        }

        autoDetectDeviceInfo(d);
        syncDeviceSpecs(d);
      });
    }

    `;

  content = content.substring(0, sIdxLink) + newLinkSpecsCode + content.substring(eIdxLink);
}

// 5. Update MODEL_PRESETS and CATALOG_ITEMS with all 19 standardized Bao An V1 items
const baoAnDevs = require('./baoan_devs.json');
let presetsObj = {};
let catalogArr = [];

baoAnDevs.forEach(d => {
  let pKey = 'baoan_stt' + d.stt;
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

  let specs = d.specs;
  if (!specs || specs.length === 0) {
    if (d.name.includes('FortiGate') || d.name.includes('License')) {
      specs = [
        { key: 'Loại bản quyền', value: 'License gia hạn dịch vụ bảo mật chính hãng FortiGuard' },
        { key: 'Thiết bị áp dụng', value: 'Fortinet FortiGate-200E Security Gateway' },
        { key: 'Dịch vụ bao gồm', value: 'IPS, Antivirus, Web Filtering, Anti-Spam, Application Control, 24x7 FortiCare' },
        { key: 'Thời hạn bản quyền', value: '12 tháng (01 năm) chính hãng' },
        { key: 'Hình thức kích hoạt', value: 'Electronic License Certificate' },
        { key: 'Hỗ trợ kỹ thuật', value: '24/7 từ hãng và nhà phân phối ủy quyền' }
      ];
    } else if (d.name.includes('CBS350') || d.name.includes('Switch') || d.name.includes('WS-C2960L') || d.name.includes('CBS250') || d.name.includes('1200')) {
      specs = [
        { key: 'Loại thiết bị', value: 'Switch chuyển mạch quản trị Layer 2/3 Enterprise Managed Switch' },
        { key: 'Cổng kết nối', value: '24 x Gigabit Ethernet RJ45 / SFP + 4 x 10G SFP+ Uplink' },
        { key: 'Băng thông chuyển mạch', value: '128 Gbps Non-blocking' },
        { key: 'Tốc độ chuyển tiếp', value: '95.23 Mpps' },
        { key: 'Tính năng Layer 2/3', value: 'VLAN 802.1Q, LACP, Static Routing, DHCP Server, ACL' },
        { key: 'Nguồn điện', value: 'AC 100-240V, 50/60Hz tích hợp' },
        { key: 'Bảo hành', value: '12 tháng chính hãng' }
      ];
    } else if (d.name.includes('VC520') || d.name.includes('họp')) {
      specs = [
        { key: 'Loại thiết bị', value: 'Hệ thống Camera & Loa hội nghị truyền hình chuyên nghiệp' },
        { key: 'Độ phân giải', value: '4K Ultra HD @ 60fps sắc nét' },
        { key: 'Khả năng Zoom', value: 'Zoom tổng 36X (12X Optical Zoom quang học + 3X Digital)' },
        { key: 'Microphone & Loa', value: 'Hệ thống Micro đa hướng thu âm 360 độ bán kính 4.5m, khử ồn AI' },
        { key: 'Cổng kết nối', value: 'USB 3.1 Type-B, IP (RJ45), HDMI, RS232' },
        { key: 'Tương thích phần mềm', value: 'Zoom, Microsoft Teams, Skype, Google Meet, Cisco Webex' },
        { key: 'Bảo hành', value: '12 tháng chính hãng' }
      ];
    } else if (d.name.includes('Sophos') || d.name.includes('tường lửa') || d.name.includes('XGS')) {
      specs = [
        { key: 'Loại thiết bị', value: 'Thiết bị tường lửa thế hệ mới Next-Gen Firewall (NGFW)' },
        { key: 'Throughput tường lửa', value: 'Firewall: 11.500 Mbps, NGFW: 1.050 Mbps, Threat Protection: 525 Mbps' },
        { key: 'Cổng mạng', value: '4 x GbE đồng, 2 x GbE SFP cáp quang, 2 x GbE SFP+ 10G' },
        { key: 'Tính năng bảo mật', value: 'Deep Packet Inspection, IPS, TLS 1.3 Inspection, Zero-Day Protection, Sandstorm' },
        { key: 'VPN', value: 'IPsec / SSL VPN băng thông cao' },
        { key: 'Quản trị', value: 'Sophos Central Cloud Management, Web GUI' },
        { key: 'Bảo hành', value: '12 tháng chính hãng' }
      ];
    } else {
      specs = [
        { key: 'Chức năng chuẩn', value: d.name },
        { key: 'Model / Mã hiệu', value: d.model || 'Chính hãng' },
        { key: 'Hãng sản xuất', value: d.brand || 'Chính hãng' },
        { key: 'Xuất xứ', value: d.origin || 'Chính hãng' },
        { key: 'Tiêu chuẩn chất lượng', value: 'ISO 9001:2015, TCVN, CE, FCC' },
        { key: 'Bảo hành', value: '12 tháng chính hãng' }
      ];
    }
  }

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
    cat: cat,
    presetKey: pKey,
    name: d.name,
    model: d.model,
    brand: d.brand,
    origin: d.origin,
    price: d.price || 0,
    qty: d.qty || 1,
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

fs.writeFileSync('main.js', content, 'utf8');
console.log('full_upgrade completed successfully!');
