const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// Update linkSpecsToDevices
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
fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully updated linkSpecsToDevices in index.html!');
