const fs = require('fs');
const XLSX = require('xlsx-js-style');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Build the updated universal Spec Sheet parser and parseXlsxSmart
// Let's replace the block from `function isTuyenBoSheet` to the end of `parseXlsxSmart`
const sIdxTuyenBo = content.indexOf('function isTuyenBoSheet');
const eIdxParseXlsxSmart = content.indexOf('function parseSingleSpecSheet(ws, sheetName)', sIdxTuyenBo);

if (sIdxTuyenBo === -1 || eIdxParseXlsxSmart === -1) {
  console.error('Could not find isTuyenBoSheet / parseXlsxSmart block');
  process.exit(1);
}

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

      // If name col not found but req col is separated
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

content = content.substring(0, sIdxTuyenBo) + newParserCode + content.substring(eIdxParseXlsxSmart);

// 2. Also remove the redundant first parseXlsxSmart around line 2969 if it was there
const firstParseIdx = content.indexOf('function parseXlsxSmart(wb, fileName, allSpecs)');
const secondParseIdx = content.indexOf('function parseXlsxSmart(wb, fileName, allSpecs)', firstParseIdx + 30);

if (secondParseIdx !== -1) {
  // Replace the first parseXlsxSmart with a simple delegate or remove duplicate
  console.log('Found duplicate parseXlsxSmart, removing the first one');
  const eIdxFirstParse = content.indexOf('function parseSummaryRows(ws, range, hdrRow)', firstParseIdx);
  content = content.substring(0, firstParseIdx) + content.substring(eIdxFirstParse);
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Updated parser in index.html successfully');
