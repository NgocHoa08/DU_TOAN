const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Update parseSummaryRows
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

// 2. Update isNoiseOrNonDeviceText to never filter actual hardware items like Camera an ninh
content = content.replace(
  "var s = text.trim().toLowerCase();\n      if (s.length < 2) return true;",
  "var s = text.trim().toLowerCase();\n      if (s.length < 2) return true;\n      if (s.includes('camera') || s.includes('switch') || s.includes('máy ') || s.includes('license') || s.includes('cáp mạng') || s.includes('cân bằng tải')) return false;"
);

// 3. Update linkSpecsToDevices to handle fallback standardized specs if empty
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

fs.writeFileSync('index.html', content, 'utf8');
console.log('Finalized all updates in index.html!');
