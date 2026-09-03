const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Update cleanDeviceName to cleanFullDeviceName
const sIdxHw = content.indexOf('function isStrictHardwareDevice(str) {');
const eIdxHw = content.indexOf('function isGenericHeaderOrNoiseSpec(text) {', sIdxHw);

if (sIdxHw === -1 || eIdxHw === -1) {
  console.error('Could not find isStrictHardwareDevice');
  process.exit(1);
}

const newHwCode = `function cleanFullDeviceName(name, stt, model, brand) {
      if (!name) return '';
      var s = String(name).replace(/[\\u00a0\\s]+/g, ' ').trim();
      s = s.replace(/phụ lục\\s*\\d*[:\\s-]*(tổng hợp[^(]*)?(\\([^)]*\\))?/gi, '').trim();
      s = s.replace(/^[0-9]+[.\\-\\s:]+/, '').trim();
      s = s.replace(/hoặc\\s+tương\\s+đương/gi, '').trim();
      s = s.replace(/tương\\s+đương/gi, '').trim();
      s = s.replace(/\\(có chế độ scan\\)/gi, '').trim();
      s = s.replace(/\\(máy scan\\)/gi, '').trim();
      s = s.replace(/\\s{2,}/g, ' ').trim();

      var sttNum = parseInt(stt);
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

    function cleanDeviceName(rawName) {
      return cleanFullDeviceName(rawName);
    }

    function isStrictHardwareDevice(str) {
      if (!str || typeof str !== 'string') return false;
      var s = str.trim().toLowerCase().replace(/[\\u00a0\\s]+/g, ' ');
      if (s.length < 3) return false;

      // 1. Blacklist: Non-hardware items (licenses, services, internet lines, maintenance, trainings, legal)
      var nonHardware = [
        'license', 'gia hạn', 'bản quyền', 'thuê đường truyền', 'thuê kênh', 'thuê mạng',
        'đường truyền', 'số liệu chuyên dùng', 'chuyên dùng', 'dịch vụ', 'chi phí', 'đào tạo',
        'bảo trì', 'bảo dưỡng', 'vận chuyển', 'lắp đặt', 'nhân công', 'tháo dỡ', 'kiểm định',
        'chuyển giao', 'bảo hiểm', 'thuyết minh', 'pccc', 'phòng cháy', 'vệ sinh', 'nghiệm thu',
        'kế hoạch', 'hợp đồng', 'bảo lãnh', 'e-hsdt', 'e-hsmt', 'năng lực', 'kinh nghiệm', 'tài chính',
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

fs.writeFileSync('index.html', content, 'utf8');
console.log('Fixed cleanFullDeviceName order successfully!');
