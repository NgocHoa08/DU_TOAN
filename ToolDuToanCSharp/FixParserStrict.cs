using System;
using System.IO;

namespace ToolDuToanCSharp
{
    public static class FixParserStrict
    {
        public static void Run(string basePath)
        {
            string indexPath = Path.Combine(basePath, "index.html");
            if (!File.Exists(indexPath))
            {
                Console.WriteLine("File index.html not found.");
                return;
            }

            string content = File.ReadAllText(indexPath);

            // 1. Update isStrictHardwareDevice
            int sIdxHw = content.IndexOf("function isStrictHardwareDevice(str) {");
            int eIdxHw = content.IndexOf("function isGenericHeaderOrNoiseSpec(text) {", sIdxHw);

            string newHwCode = @"function cleanDeviceName(rawName) {
      if (!rawName) return '';
      var s = String(rawName).replace(/[\u00a0\s]+/g, ' ').trim();
      s = s.replace(/phụ lục\s*\d*[:\s-]*(tổng hợp[^(]*)?(\([^)]*\))?/gi, '').trim();
      s = s.replace(/^[0-9]+[.\-\s:]+/, '').trim();
      s = s.replace(/hoặc\s+tương\s+đương/gi, '').trim();
      s = s.replace(/tương\s+đương/gi, '').trim();
      s = s.replace(/\(có chế độ scan\)/gi, '').trim();
      s = s.replace(/\(máy scan\)/gi, '').trim();
      s = s.replace(/\s{2,}/g, ' ').trim();
      return s;
    }

    function isStrictHardwareDevice(str) {
      if (!str || typeof str !== 'string') return false;
      var s = str.trim().toLowerCase().replace(/[\u00a0\s]+/g, ' ');
      if (s.length < 3) return false;

      // 1. Blacklist: Non-hardware items
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

    ";

            if (sIdxHw != -1 && eIdxHw != -1)
            {
                content = content.Substring(0, sIdxHw) + newHwCode + content.Substring(eIdxHw);
            }

            // 2. Update parseSummaryRows
            int sIdxSummary = content.IndexOf("function parseSummaryRows(ws, range, hdrRow) {");
            int eIdxSummary = content.IndexOf("function isNoiseOrNonDeviceText(text) {", sIdxSummary);

            string newParseSummaryRowsCode = @"function parseSummaryRows(ws, range, hdrRow) {
      var ds = hdrRow >= 0 ? hdrRow + 1 : range.s.r + 1;

      var colMap = { stt: -1, name: -1, model: -1, brand: -1, origin: -1, unit: -1, qty: -1, price: -1, total: -1 };
      if (hdrRow >= 0) {
        for (var c = range.s.c; c <= range.e.c; c++) {
          var h = String(gv(ws, hdrRow, c)).toLowerCase().replace(/\s+/g, ' ');
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

        // Strictly filter out non-hardware items
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

    ";

            if (sIdxSummary != -1 && eIdxSummary != -1)
            {
                content = content.Substring(0, sIdxSummary) + newParseSummaryRowsCode + content.Substring(eIdxSummary);
            }

            File.WriteAllText(indexPath, content);
            Console.WriteLine("Updated parseSummaryRows and isStrictHardwareDevice successfully!");
        }
    }
}
