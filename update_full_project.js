const fs = require('fs');
const XLSX = require('xlsx-js-style');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Fix parseSummaryRows in index.html
content = content.replace(
  "var sv = String(gv(ws, row, 0)).trim().toUpperCase();",
  "var sttColIdx = colMap.stt >= 0 ? colMap.stt : 0;\n        var sv = String(gv(ws, row, sttColIdx)).trim().toUpperCase();"
);

// 2. Read baoan_devs.json to get all 19 items
const baoAnDevs = require('./baoan_devs.json');

// Build presets object for all 19 items
let presetsJs = '';
let catalogJs = '';

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

  // Ensure every device has at least some specs
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
    } else if (d.name.includes('CBS350') || d.name.includes('Switch')) {
      specs = [
        { key: 'Loại thiết bị', value: 'Switch quản trị Layer 2/3 Enterprise Managed Switch' },
        { key: 'Cổng kết nối', value: '24 x Gigabit SFP + 4 x 10G SFP+ Uplink' },
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

  function escStr(s) {
    return (s || '')
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r\n/g, '\\n')
      .replace(/\r/g, '')
      .replace(/\n/g, '\\n');
  }

  let specsLines = specs.map(s => `          { key: '${escStr(s.key)}', value: '${escStr(s.value)}' }`).join(',\n');

  presetsJs += `      '${pKey}': {\n`;
  presetsJs += `        name: '${escStr(d.name)}',\n`;
  presetsJs += `        model: '${escStr(d.model)}', brand: '${escStr(d.brand)}', origin: '${escStr(d.origin)}', warranty: '12 tháng', unit: '${escStr(d.unit)}', price: ${d.price || 0},\n`;
  presetsJs += `        specs: [\n${specsLines}\n        ]\n`;
  presetsJs += `      },\n`;

  catalogJs += `      { id: '${pKey}', cat: '${cat}', presetKey: '${pKey}', name: '${escStr(d.name)}', model: '${escStr(d.model)}', brand: '${escStr(d.brand)}', origin: '${escStr(d.origin)}', price: ${d.price || 0}, qty: ${d.qty || 1}, warranty: '12 tháng', unit: '${escStr(d.unit)}', specCount: ${specs.length} },\n`;
});

// Replace MODEL_PRESETS and CATALOG_ITEMS
const sIdxPresets = content.indexOf('var MODEL_PRESETS = {');
const eIdxPresets = content.indexOf('    function applyModelPreset', sIdxPresets);
const endBracePresets = content.lastIndexOf('};', eIdxPresets);

const newModelPresetsFull = `var MODEL_PRESETS = {\n${presetsJs.trimEnd()}\n    };`;
content = content.substring(0, sIdxPresets) + newModelPresetsFull + content.substring(endBracePresets + 2);

const sIdxCat = content.indexOf('var CATALOG_ITEMS = [');
const eIdxCat = content.indexOf('];', sIdxCat);
const newCatalogFull = `var CATALOG_ITEMS = [\n${catalogJs.trimEnd()}\n    ];`;
content = content.substring(0, sIdxCat) + newCatalogFull + content.substring(eIdxCat + 2);

fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully updated index.html with all 19 Bao An V1 devices, universal parser, and presets!');
