
/* ── FUZZY SEARCH HELPER ── */
function matchFuzzyKw(text, q) {
  if (!q) return true;
  if (!text) return false;
  var t = String(text).toLowerCase();
  var query = String(q).toLowerCase().trim();
  if (t.includes(query)) return true;

  var tClean = t.replace(/[\s\-_/\\,.]+/g, '');
  var qClean = query.replace(/[\s\-_/\\,.]+/g, '');
  if (qClean && tClean.includes(qClean)) return true;

  var tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    return tokens.every(function (tok) {
      var tokClean = tok.replace(/[\s\-_/\\,.]+/g, '');
      return t.includes(tok) || (tokClean && tClean.includes(tokClean));
    });
  }
  return false;
}

/* ═══════════════════════════════════════════════════════════════════
   ADMIN PRODUCT MANAGEMENT MODULE & MẪU MÁY EXPANSION
   Mật khẩu quản trị Admin: 2208
   Hệ thống Quản Trị Danh Mục Sản Phẩm & Cấu Hình Thông Số Kỹ Thuật
═══════════════════════════════════════════════════════════════════ */

var ADMIN_PASSWORD_VAL = '2208';
var adminIsUnlocked = false;
var adminActiveSubTab = 'catalog';
var adminPendingSubTab = 'catalog';
var LS_CUSTOM_CATALOG_KEY = 'dutoan_custom_catalog';
var adminCurrentSearch = '';
var adminCurrentBrand = '';
var adminCurrentCat = '';
var adminCurrentSource = 'all';
var adminCurrentStatus = 'all'; // 'all' | 'active' | 'locked'
var adminEditingItemId = null;

// 48 Dòng máy bổ sung đầy đủ thông số bóc tách chuẩn xác từ các file Word (.docx) và Excel (.xlsx), bao gồm MSI PRO DP80 A14G, DP21 & Màn hình PRO MP225 E12VL
var EXTRA_MAU_MAY_DEVICES = [
  {
    "key": "ricoh_fi_8040",
    "name": "Máy scan chuyên dụng Ricoh fi-8040",
    "model": "fi-8040",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi 8040.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-8040"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "CIS x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 216 x 355.6 mm; Tối thiểu: 50.8 x 50.8 mmKéo giấy dài: 5.588 mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "40 - 209 g/m2; thẻ nhựa dày 0,76 mm"
      },
      {
        "key": "Tốc độ quét",
        "value": "Một mặt: 40 ppm, Hai mặt: 80 ipm (A4, quét màu, 300dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "50 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "6000 trang/ ngày"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.2 Ethernet: 10BASE-T, 100BASE-TX, 1000BASE-T"
      },
      {
        "key": "Màn hình",
        "value": "LCD 4.3 inch touchscreen"
      },
      {
        "key": "Chế độ direct scan không cần kết nối máy tính",
        "value": "Scan to email, scan to folder"
      },
      {
        "key": "Chế độ Manual Feed",
        "value": "Quét khổ A3 gập đôi, bì thư mà không cần tùy chọn carrier sheet"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      }
    ],
    "sourceFile": "Spec Ricoh fi 8040.docx"
  },
  {
    "key": "ricoh_fi_8150",
    "name": "Máy scan chuyên dụng Ricoh fi-8150",
    "model": "fi-8150",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi 8150.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-8150"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động, có chức năng quét hộ chiếu và boolet"
      },
      {
        "key": "Đèn quét",
        "value": "CIS x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 215,9 x 355,6 mm; Tối thiểu: 48 x 50 mmKéo giấy dài: 6.096 mmKhả năng quét thẻ nhựa chữ nổi, độ dày tối đa 1,4mmQuét sổ/ Hộ chiếu: tối đa dày 7 mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "20 - 465 g/m2"
      },
      {
        "key": "Tốc độ quét",
        "value": "Một mặt: 50 ppm, Hai mặt: 100 ipm (A4, quét màu, 300dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "100 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "8000 trang/ ngày"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.2 Gen1x1/ USB 2.0 / USB 1.1Ethernet: 10BASE-T, 100BASE-TX, 1000BASE-T"
      },
      {
        "key": "Chức năng quét khổ A3, bì thư, hộ chiếu",
        "value": "Có khả năng quét giấy khổ A3 bằng cách gập đôi và quét bì thư, hộ chiếu mà không cần sử dụng phụ kiện"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt, Anh, Hàn Quốc, Nhật Bản, Trung Quốc. Người dùng có thể tự định nghĩa trường văn bản."
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn phần mềm bản nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi 8150.docx"
  },
  {
    "key": "ricoh_fi_8150u",
    "name": "Máy scan chuyên dụng Ricoh fi-8150U",
    "model": "fi-8150U",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi 8150U.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-8150U"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "CIS x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 215,9 x 355,6 mm; Tối thiểu: 48 x 50 mmKéo giấy dài: 6.096 mmKhả năng quét thẻ nhựa chữ nổi, độ dày tối đa 1,4mmQuét sổ/ Hộ chiếu: tối đa dày 7 mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "20 - 465 g/m2"
      },
      {
        "key": "Tốc độ quét",
        "value": "Một mặt: 50 ppm, Hai mặt: 100 ipm (A4, quét màu, 300dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "100 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "8000 trang/ ngày"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.2 Gen1x1 / USB 2.0 / USB 1.1"
      },
      {
        "key": "Chức năng quét khổ A3, bì thư",
        "value": "Có khả năng quét giấy khổ A3 bằng cách gập đôi và quét bì thư mà không cần sử dụng phụ kiện"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi 8150U.docx"
  },
  {
    "key": "ricoh_fi_8170",
    "name": "Máy scan chuyên dụng Ricoh fi-8170",
    "model": "fi-8170",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi 8170.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "fi-8170"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "CIS x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 215,9 x 355,6 mm; Tối thiểu: 48 x 50 mmQuét giấy dài: 6.096 mmCó khả năng quét hộ chiếu và sổ đóng ghim, thẻ nhựa"
      },
      {
        "key": "Định lượng giấy",
        "value": "20 - 465 g/m2Sổ (Booklet): 7 mmThẻ nhựa: 1,4 mm"
      },
      {
        "key": "Tốc độ quét",
        "value": "Một mặt: 70 ppm, Hai mặt: 140 ipm (A4, quét màu, 300dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "100 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "10000 trang/ ngày"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.2 Gen1x1 / USB 2.0 / USB 1.1LAN: 10BASE-T, 100BASE-TX, 1000BASE-T"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi 8170.docx"
  },
  {
    "key": "ricoh_fi_8190",
    "name": "Máy scan chuyên dụng Ricoh fi-8190",
    "model": "fi-8190",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi8190_Rev1.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "fi-8190"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "CIS x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 215,9 x 355,6 mm; Tối thiểu: 48 x 50 mmQuét giấy dài: 6.096 mmCó khả năng quét hộ chiếu và sổ, thẻ nhựa và khổ A3 gập đôi mà không cần phụ kiện carrier sheet"
      },
      {
        "key": "Định lượng giấy",
        "value": "20 - 465 g/m2Sổ (Booklet): 7 mmThẻ nhựa: 1,4 mm"
      },
      {
        "key": "Tốc độ quét",
        "value": "Một mặt: 90 ppm, Hai mặt: 180 ipm (A4, quét màu, 300dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "100 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "13000 trang/ ngày"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.2 Gen1x1 / USB 2.0 / USB 1.1LAN: 10BASE-T, 100BASE-TX, 1000BASE-T"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt, Anh, Hàn Quốc, Nhật Bản, Trung Quốc. Người dùng có thể tự định nghĩa trường văn bản."
      },
      {
        "key": "Nhận dạng trường MRZ trên CCCD/ Hộ chiếu",
        "value": "Chuẩn TD1, TD2, TD3"
      },
      {
        "key": "Phương thức tách bộ tài liệu",
        "value": "Blank page (single /duplex), Page count, Zonal OCR, Patch code, Barcode (1D /2D), Press Ctrl, Specific document (Automatic Profile Selection)"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi8190_Rev1.docx"
  },
  {
    "key": "ricoh_fi_8250",
    "name": "Máy scan chuyên dụng Ricoh fi-8250 (ADF + Flatbed)",
    "model": "fi-8250",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi 8250.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-8250"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động; tích hợp khay quét phẳng (flatbed)"
      },
      {
        "key": "Đèn quét",
        "value": "ADF: CIS x 2Flatbed: Color CCD x 1"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 215,9 x 355,6 mm; Tối thiểu: 48 x 50 mmKéo giấy dài: 6.096 mmKhả năng quét thẻ nhựa chữ nổi, độ dày tối đa 1,4mmQuét sổ/ Hộ chiếu: tối đa dày 7 mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "20 - 465 g/m2"
      },
      {
        "key": "Tốc độ quét",
        "value": "ADF: Một mặt: 50 ppm, Hai mặt: 100 ipm (A4, quét màu, 300dpi)Flatbed: 1,7 giây (200 dpi/ 300 dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "100 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "8000 trang/ ngày"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.1 Gen1 / USB 3.0 / USB 2.0 / USB 1.1Ethernet: 10BASE-T, 100BASE-TX, 1000BASE-T"
      },
      {
        "key": "Chức năng quét khổ A3, bì thư",
        "value": "Có khả năng quét giấy khổ A3 bằng cách gập đôi và quét bì thư mà không cần sử dụng phụ kiện"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi 8250.docx"
  },
  {
    "key": "ricoh_fi_8250u",
    "name": "Máy scan chuyên dụng Ricoh fi-8250U (ADF + Flatbed)",
    "model": "fi-8250U",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi 8250U.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-8250U"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động; tích hợp khay quét phẳng (flatbed)"
      },
      {
        "key": "Đèn quét",
        "value": "ADF: CIS x 2Flatbed: Color CCD x 1"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 215,9 x 355,6 mm; Tối thiểu: 48 x 50 mmKéo giấy dài: 6.096 mmKhả năng quét thẻ nhựa chữ nổi, độ dày tối đa 1,4mmQuét sổ/ Hộ chiếu: tối đa dày 7 mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "20 - 465 g/m2"
      },
      {
        "key": "Tốc độ quét",
        "value": "ADF: Một mặt: 50 ppm, Hai mặt: 100 ipm (A4, quét màu, 300dpi)Flatbed: 1,7 giây (200 dpi/ 300 dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "100 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "8000 trang/ ngày"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.1 Gen1 / USB 3.0 / USB 2.0 / USB 1.1"
      },
      {
        "key": "Chức năng quét khổ A3, bì thư",
        "value": "Có khả năng quét giấy khổ A3 bằng cách gập đôi và quét bì thư mà không cần sử dụng phụ kiện"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi 8250U.docx"
  },
  {
    "key": "ricoh_fi_8270",
    "name": "Máy scan chuyên dụng Ricoh fi-8270 (ADF + Flatbed)",
    "model": "fi-8270",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi8270.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "fi-8270"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động; tích hợp khay quét phẳng (flatbed)"
      },
      {
        "key": "Đèn quét",
        "value": "ADF: CIS x 2Flatbed: Color CCD x 1"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 215,9 x 355,6 mm; Tối thiểu: 48 x 50 mmQuét giấy dài: 6.096 mmCó khả năng quét hộ chiếu và sổ đóng ghim, thẻ nhựa"
      },
      {
        "key": "Định lượng giấy",
        "value": "20 - 465 g/m2Sổ đóng ghim: 7 mmThẻ nhựa: 1,4 mm"
      },
      {
        "key": "Tốc độ quét",
        "value": "Một mặt: 70 ppm, Hai mặt: 140 ipm (A4, quét màu, 300dpi)Flatbed: 1,7 giây (200 dpi/ 300 dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "100 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "10000 trang/ ngày"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.2 Gen1x1 / USB 2.0 / USB 1.1LAN: 10BASE-T, 100BASE-TX, 1000BASE-T"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt, Anh, Hàn Quốc, Nhật Bản, Trung Quốc. Người dùng có thể tự định nghĩa trường văn bản."
      },
      {
        "key": "Nhận dạng trường MRZ trên CCCD/ Hộ chiếu",
        "value": "Chuẩn TD1, TD2, TD3"
      },
      {
        "key": "Phương thức tách bộ tài liệu",
        "value": "Blank page (single /duplex), Page count, Zonal OCR, Patch code, Barcode (1D /2D), Press Ctrl, Specific document (Automatic Profile Selection)"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi8270.docx"
  },
  {
    "key": "ricoh_fi_8290",
    "name": "Máy scan chuyên dụng Ricoh fi-8290 (ADF + Flatbed)",
    "model": "fi-8290",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi8290.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "fi-8290"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động; tích hợp khay quét phẳng (flatbed)"
      },
      {
        "key": "Đèn quét",
        "value": "ADF: CIS x 2Flatbed: Color CCD x 1"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 215,9 x 355,6 mm; Tối thiểu: 48 x 50 mmQuét giấy dài: 6.096 mmCó khả năng quét hộ chiếu và sổ đóng ghim, thẻ nhựa"
      },
      {
        "key": "Định lượng giấy",
        "value": "20 - 465 g/m2Sổ đóng ghim: 7 mmThẻ nhựa: 1,4 mm"
      },
      {
        "key": "Tốc độ quét",
        "value": "ADF: Một mặt: 90 ppm, Hai mặt: 180 ipm (A4, quét màu, 300dpi)Flatbed: 1,7 giây (200 dpi/ 300 dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "100 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "13000 trang/ ngày"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.2 Gen1x1 / USB 2.0 / USB 1.1LAN: 10BASE-T, 100BASE-TX, 1000BASE-T"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt, Anh, Hàn Quốc, Nhật Bản, Trung Quốc. Người dùng có thể tự định nghĩa trường văn bản."
      },
      {
        "key": "Nhận dạng trường MRZ trên CCCD/ Hộ chiếu",
        "value": "Chuẩn TD1, TD2, TD3"
      },
      {
        "key": "Phương thức tách bộ tài liệu",
        "value": "Blank page (single /duplex), Page count, Zonal OCR, Patch code, Barcode (1D /2D), Press Ctrl, Specific document (Automatic Profile Selection)"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi8290.docx"
  },
  {
    "key": "ricoh_fi_800r",
    "name": "Máy scan hộ chiếu / thẻ căn cước Ricoh fi-800R",
    "model": "fi-800R",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi-800R.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-800R"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động, tích hợp khay quét hộ chiếu, sổ, thẻ nhựa tự động"
      },
      {
        "key": "Đèn quét",
        "value": "CIS x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 215.9 x 355.6 mm; Tối thiểu: 50.8 x 50.8 mmKéo giấy dài: 5.588 mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "Khay ADF: 40 - 127 g/m²Khay quét hộ chiếu, sổ dập ghim, thẻ nhựa:Giấy: 20 - 413 g/m²Thẻ nhựa: 1,4 mmHộ chiếu, sổ: 5 mm"
      },
      {
        "key": "Tốc độ quét(A4, quét màu, 300dpi)",
        "value": "Một mặt: 40 ppm, Hai mặt: 80 ipm"
      },
      {
        "key": "Khay giấy",
        "value": "20 tờ (A4 80 g/m²)30 tờ (A4 52 g/m²)"
      },
      {
        "key": "Công suất",
        "value": "4500 tờ/ ngày"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi-800R.docx"
  },
  {
    "key": "ricoh_fi_7300nx",
    "name": "Máy scan mạng không dây Ricoh fi-7300NX",
    "model": "fi-7300NX",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi7300NX.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-7300NX"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 216 x 355,6 mm; Tối thiểu: 50.8 x 54 mmKéo giấy dài: 216 x 5.588 mmKhả năng quét thẻ nhựa chữ nổi, độ dày tối đa 1,4mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "27 - 413 g/m2"
      },
      {
        "key": "Tốc độ quét",
        "value": "Một mặt: 60 ppm, Hai mặt: 120 ipm (A4, quét màu, 300dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "80 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "9000 trang/ ngày"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.1 Gen1 / USB 3.0 / USB 2.0 / USB 1.1Ethernet: 10BASE-T, 100BASE-TX, 1000BASE-TWIFI: IEEE802.11 a/b/g/n/ac"
      },
      {
        "key": "Màn hình",
        "value": "4.3 inch TFT color touch screen, khả năng xem ảnh trên màn hình trước khi xuất file"
      },
      {
        "key": "Hỗ trợ thẻ NFC",
        "value": "Type A và Type B"
      },
      {
        "key": "Chức năng quét khổ A3, bì thư",
        "value": "Có khả năng quét giấy khổ A3 bằng cách gập đôi và quét bì thư mà không cần sử dụng phụ kiện"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi7300NX.docx"
  },
  {
    "key": "ricoh_fi_7460",
    "name": "Máy scan chuyên dụng A3 Ricoh fi-7460",
    "model": "fi-7460",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi7460.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-7460"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "Color CCD (Charge-coupled device) x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 304,8 x 431,8 mm; Tối thiểu: 50.8 x 69 mmKéo giấy dài: 304,8 x 5.588 mmKhả năng quét thẻ nhựa chữ nổi, độ dày tối đa 1,4mmKhả năng quét tài liệu khổ A2 bằng cách gập đôi tài liệu"
      },
      {
        "key": "Định lượng giấy",
        "value": "27 - 413 g/m2"
      },
      {
        "key": "Tốc độ quét(A4 ngang, quét màu, 300dpi)",
        "value": "Một mặt: 60 ppm, Hai mặt: 120 ipm"
      },
      {
        "key": "Khay giấy",
        "value": "100 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "18000 trang/ ngày"
      },
      {
        "key": "Phát hiện kéo đúp, kẹt giấy",
        "value": "Bằng cảm biến siêu âm & Cảm biến giấy & iSOP"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt, Anh, Hàn Quốc, Nhật Bản, Trung Quốc. Người dùng có thể tự định nghĩa trường văn bản."
      },
      {
        "key": "Nhận dạng trường MRZ trên CCCD/ Hộ chiếu",
        "value": "Chuẩn TD1, TD2, TD3"
      },
      {
        "key": "Phương thức tách bộ tài liệu",
        "value": "Blank page (single /duplex), Page count, Zonal OCR, Patch code, Barcode (1D /2D), Press Ctrl, Specific document (Automatic Profile Selection)"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi7460.docx"
  },
  {
    "key": "ricoh_fi_7480",
    "name": "Máy scan chuyên dụng A3 Ricoh fi-7480",
    "model": "fi-7480",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi7480.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-7480"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "Color CCD (Charge-coupled device) x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 304,8 x 431,8 mm; Tối thiểu: 50.8 x 69 mmKéo giấy dài: 304,8 x 5.588 mmKhả năng quét thẻ nhựa chữ nổi, độ dày tối đa 1,4mmKhả năng quét tài liệu khổ A2 bằng cách gập đôi tài liệu"
      },
      {
        "key": "Định lượng giấy",
        "value": "27 - 413 g/m2"
      },
      {
        "key": "Tốc độ quét(A4 ngang, quét màu, 300dpi)",
        "value": "Một mặt: 80 ppm, Hai mặt: 160 ipm"
      },
      {
        "key": "Khay giấy",
        "value": "100 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "24000 trang/ ngày"
      },
      {
        "key": "Phát hiện kéo đúp, kẹt giấy",
        "value": "Bằng cảm biến siêu âm & Cảm biến giấy & iSOP"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi7480.docx"
  },
  {
    "key": "ricoh_fi_7600",
    "name": "Máy scan công nghiệp A3 Ricoh fi-7600 (Khay xoay)",
    "model": "fi-7600",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi7600.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-7600"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "Color CCD (Charge-coupled device) x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 304,8 x 431,8 mm; Tối thiểu: 50.8 x 69 mmKéo giấy dài: 304,8 x 5.588 mmKhả năng quét thẻ nhựa chữ nổi, độ dày tối đa 1,4mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "20 - 413 g/m2"
      },
      {
        "key": "Tốc độ quét(A4 ngang, quét màu, 300dpi)",
        "value": "Một mặt: 100 ppm, Hai mặt: 200 ipm"
      },
      {
        "key": "Khay giấy",
        "value": "300 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "44000 Tờ/ ngày"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt. Người dùng có thể tự định nghĩa trường văn bản."
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi7600.docx"
  },
  {
    "key": "ricoh_fi_7700",
    "name": "Máy scan công nghiệp A3 Ricoh fi-7700 (ADF + Flatbed)",
    "model": "fi-7700",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi7700.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-7700"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động + Mặt quét phẳng Flatbed"
      },
      {
        "key": "Đèn quét",
        "value": "Color CCD (Charge-coupled device) x 3"
      },
      {
        "key": "Khổ giấy",
        "value": "ADF:Tối đa: 304,8 x 431,8 mm; Tối thiểu: 50.8 x 69 mmKéo giấy dài: 304,8 x 5.588 mmKhả năng quét thẻ nhựa chữ nổi, độ dày tối đa 1,4mmFlatbed: Tối đa: 304,8 x 457,2 mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "20 - 413 g/m2"
      },
      {
        "key": "Tốc độ quét(A4 ngang, quét màu, 300dpi)",
        "value": "ADF: Một mặt: 100 ppm, Hai mặt: 200 ipm Flatbed: 0,6 giây"
      },
      {
        "key": "Khay giấy",
        "value": "300 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "44000 trang/ ngày"
      },
      {
        "key": "Phát hiện kéo đúp, bảo vệ giấy",
        "value": "Bằng cảm biến siêu âm & Cảm biến giấy & iSOP"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi7700.docx"
  },
  {
    "key": "ricoh_fi_7700s",
    "name": "Máy scan công nghiệp A3 Ricoh fi-7700S (Flatbed 1 mặt)",
    "model": "fi-7700S",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi7700S.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-7700S"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 1 mặt tự động + Mặt quét phẳng Flatbed"
      },
      {
        "key": "Đèn quét",
        "value": "Color CCD (Charge-coupled device) x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "ADF:Tối đa: 304,8 x 431,8 mm; Tối thiểu: 50.8 x 69 mmKéo giấy dài: 304,8 x 5.588 mmKhả năng quét thẻ nhựa chữ nổi, độ dày tối đa 1,4mmFlatbed: Tối đa: 304,8 x 457,2 mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "20 - 413 g/m2"
      },
      {
        "key": "Tốc độ quét(A4 ngang, quét màu, 300dpi)",
        "value": "ADF: 75 ppm Flatbed: 0,6 giây"
      },
      {
        "key": "Khay giấy",
        "value": "300 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "33000 trang/ ngày"
      },
      {
        "key": "Phát hiện kéo đúp, kẹt giấy",
        "value": "Bằng cảm biến siêu âm & Cảm biến giấy & iSOP"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh fi7700S.docx"
  },
  {
    "key": "ricoh_fi_8820",
    "name": "Máy scan công nghiệp A3 Ricoh fi-8820 (120 ppm)",
    "model": "fi-8820",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh fi8820.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "Fi-8820"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "CISx 2"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 304,8 x 431,8 mm; Tối thiểu: 48 x 70 mmKéo giấy dài: 6.096 mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "Đường giấy thẳng"
      },
      {
        "key": "Tốc độ quét(A4 ngang, quét màu, 300dpi)",
        "value": "Một mặt: 120 ppm, Hai mặt: 240 ipm"
      },
      {
        "key": "Khay giấy",
        "value": "500 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "100.000 trang/ ngày"
      },
      {
        "key": "Giao diện",
        "value": "USB3.2 Gen1/USB 3.0/USB2.0/USB1.110BASE-T/100BASE-TX/1000BASE-T"
      },
      {
        "key": "Màn hình",
        "value": "Cảm ứng 4,3 inch"
      },
      {
        "key": "Phát hiện giấy dẹp díp",
        "value": "Phát hiện chồng chéo (Cảm biến siêu âm), Phát hiện chiều dài"
      },
      {
        "key": "Bảo vệ giấy",
        "value": "Phát hiện tài liệu đã ghim, phát hiện độ trễ"
      },
      {
        "key": "Phương thức tìm kiếm file nhanh",
        "value": "Cài đặt từ khóa PDF"
      },
      {
        "key": "Các phương thức tách bộ tài liệu",
        "value": "Trang trắng (một mặt/hai mặt)Số trangOCR vùngMã bản vá (Patchcode)Mã vạch (1D/2D)Nhấn CtrlTài liệu cụ thể (Chọn hồ sơ tự động)"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt, Anh, Hàn Quốc, Nhật Bản, Trung Quốc. Người dùng có thể tự định nghĩa trường văn bản."
      },
      {
        "key": "Ngôn ngữ OCR được hỗ trợ",
        "value": "Tiếng Anh, tiếng Pháp, tiếng Tây Ban Nha, tiếng Đức, tiếng Ý, tiếng Bồ Đào Nha (Brazil), tiếng Nga, tiếng Nhật, tiếng Hàn, tiếng Trung (giản thể/phồn thể), tiếng Thổ Nhĩ Kỳ, tiếng Ả Rập, tiếng Hy Lạp, tiếng Việt, tiếng Thái, tiếng Indonesia, tiếng Thụy Điển, tiếng Hà Lan, tiếng Ba Lan, tiếng Séc, tiếng Rumani, tiếng Do Thái, tiếng Ukraina"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      },
      {
        "key": "Xuất xứ",
        "value": "Nhật Bản"
      }
    ],
    "sourceFile": "Spec Ricoh fi8820.docx"
  },
  {
    "key": "ricoh_sp1120n",
    "name": "Máy scan văn phòng Ricoh SP-1120N",
    "model": "SP-1120N",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh SP1120N.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "SP-1120N"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "Single line CMOS-CIS x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "A4 (210 x 297 mm) Kéo giấy dài: 3,048 mmKhả năng quét thẻ nhựa, độ dày tối đa 0,76 mm"
      },
      {
        "key": "Tốc độ quét(A4, quét màu, 300dpi)",
        "value": "Một mặt: 20 ppm, Hai mặt: 40 ipm"
      },
      {
        "key": "Khay giấy",
        "value": "50 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất quét",
        "value": "3,000 tờ/ngày"
      },
      {
        "key": "Phát hiện kéo đúp",
        "value": "Bằng cảm biến siêu âm"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.2; RJ45: 1000 base T"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      }
    ],
    "sourceFile": "Spec Ricoh SP1120N.docx"
  },
  {
    "key": "ricoh_sp1125n",
    "name": "Máy scan văn phòng Ricoh SP-1125N",
    "model": "SP-1125N",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh SP1125N.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "SP-1125N"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "Single line CMOS-CIS x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "A4 (210 x 297 mm) Kéo giấy dài: 3,048 mmKhả năng quét thẻ nhựa, độ dày tối đa 0,76 mm"
      },
      {
        "key": "Tốc độ quét(A4, quét màu, 300dpi)",
        "value": "Một mặt: 25 ppm, Hai mặt: 50 ipm"
      },
      {
        "key": "Khay giấy",
        "value": "50 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất quét",
        "value": "4,000 tờ/ngày"
      },
      {
        "key": "Phát hiện kéo đúp",
        "value": "Bằng cảm biến siêu âm"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.2; RJ45: 1000 base T"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Chức năng OCR",
        "value": "Qua phần mềm ABBYY, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Tách bộ tự động",
        "value": "Theo Barcode (1D), Patch Code, theo số lượng trang, theo trang trắng."
      },
      {
        "key": "Đặt tên file tự động",
        "value": "Theo ngày giờ quét, số lượng trang giấy, Zone OCR, Barcode (1D), các dãy ký tự định sẵn"
      },
      {
        "key": "Kết xuất dữ liệu (indexing)",
        "value": "Kèm theo phần mềm tách trường văn bản, khả năng khoanh 20 vùng văn bản tiếng Việt, nhận dạng (OCR) vùng văn bản sau đó kết xuất thông tin vào file chuẩn .txt, .csv, .xml"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      }
    ],
    "sourceFile": "Spec Ricoh SP1125N.docx"
  },
  {
    "key": "ricoh_sp1130n",
    "name": "Máy scan văn phòng Ricoh SP-1130N",
    "model": "SP-1130N",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh SP1130N.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "SP-1130N"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "Single line CMOS-CIS x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "A4 (210 x 297 mm) Kéo giấy dài: 3,048 mmKhả năng quét thẻ nhựa, độ dày tối đa 0,76 mm"
      },
      {
        "key": "Tốc độ quét",
        "value": "Một mặt: 30 ppm, Hai mặt: 60 ipm (A4, quét màu, 300dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "50 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất quét",
        "value": "4.500 tờ/ngày"
      },
      {
        "key": "Phát hiện kéo đúp",
        "value": "Bằng cảm biến siêu âm"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB 3.2 Gen 1x1 / USB 2.0 / USB 1.1Ethernet: 10BASE-T,100BASE-TX,1000BASE-T"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      }
    ],
    "sourceFile": "Spec Ricoh SP1130N.docx"
  },
  {
    "key": "ricoh_sp1425",
    "name": "Máy scan phẳng có khay ADF Ricoh SP-1425",
    "model": "SP-1425",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh SP1425.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "SP-1425"
      },
      {
        "key": "Kiểu máy",
        "value": "ADF + Mặt kính (Flatbed)"
      },
      {
        "key": "Khổ giấy (khay ADF)",
        "value": "Tối đa: 216 x 356 mmTối thiểu: 114 x 140 mmGiấy dài: 216 x 3.048 mm"
      },
      {
        "key": "Tốc độ quét(A4, quét màu)",
        "value": "ADF: Một mặt: 25 ppm, Hai mặt: 50 ipm (200dpi/300dpi)Trên mặt kính: 4 giây (200dpi/300dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "50 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất quét",
        "value": "4.000 tờ/ngày"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường, hỗ trợ font tiếng Việt"
      },
      {
        "key": "Nhận dạng chữ viết tay",
        "value": "Phần mềm có khả năng nâng cấp lên nhận dạng chữ viết tay bằng tùy chọn bản phần mềm nâng cao"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR® và RoHS"
      }
    ],
    "sourceFile": "Spec Ricoh SP1425.docx"
  },
  {
    "key": "ricoh_sp_2230n",
    "name": "Máy scan A4 Ricoh SP-2230N",
    "model": "SP-2230N",
    "brand": "Ricoh",
    "origin": "Thái Lan",
    "unit": "Chiếc",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec thau SP-2230.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "SP-2230"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "CIS x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 215,9 x 355,6 mm; Tối thiểu: 50,8 x 50,8 mmKéo giấy dài: 6.096 mm"
      },
      {
        "key": "Quét khổ A3 gập",
        "value": "Có"
      },
      {
        "key": "Định lượng giấy",
        "value": "27 - 413 g/m2Thẻ nhựa: 1,4 mm"
      },
      {
        "key": "Tốc độ quét",
        "value": "Một mặt: 30 ppm, Hai mặt: 60 ipm (A4, quét màu, 300dpi)"
      },
      {
        "key": "Độ phân giải",
        "value": "600 dpi, tối đa 1200 dpi"
      },
      {
        "key": "Khay giấy",
        "value": "80 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "6.000 trang/ ngày"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB type C (3.2 Gen1x1 / USB 2.0 / USB 1.1)"
      },
      {
        "key": "Các chứng nhận",
        "value": "ENERGY STAR, RoHS, EPEAT"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường"
      },
      {
        "key": "Phần mềm số hóa tiếng Việt đi kèm",
        "value": "Tự động tách file và đặt tên file theo loại văn bản, ngày trên văn bản, số văn bảnChuyển đổi chữ in và chữ viết tay tiếng Việt sang file dạng văn bản (Word)Tự động bóc tách các trường trên văn bản hành chính: Số văn bản, ngày văn bản, tiêu đề, kính gửi, cơ quan ban hành, nơi nhận, người ký.Nguồn tài liệu đầu vào từ máy scan hoặc từ file ảnh."
      },
      {
        "key": "Xuất xứ",
        "value": "Thái Lan"
      }
    ],
    "sourceFile": "Spec thau SP-2230.docx"
  },
  {
    "key": "ricoh_sp_2240n",
    "name": "Máy scan A4 Ricoh SP-2240N",
    "model": "SP-2240N",
    "brand": "Ricoh",
    "origin": "Thái Lan",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec thau SP-2240.docx",
    "specs": [
      {
        "key": "Tên máy",
        "value": "SP-2240"
      },
      {
        "key": "Kiểu máy",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Đèn quét",
        "value": "CIS x 2"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 215,9 x 355,6 mm; Tối thiểu: 50,8 x 50,8 mmKéo giấy dài: 6.096 mm"
      },
      {
        "key": "Quét khổ A3 gập",
        "value": "Có"
      },
      {
        "key": "Định lượng giấy",
        "value": "27 - 413 g/m2Thẻ nhựa: 1,4 mm"
      },
      {
        "key": "Tốc độ quét",
        "value": "Một mặt: 40 ppm, Hai mặt: 80 ipm (A4, quét màu, 300dpi)"
      },
      {
        "key": "Độ phân giải",
        "value": "600 dpi, tối đa 1200 dpi"
      },
      {
        "key": "Khay giấy",
        "value": "80 tờ (A4: 80 g/m2)"
      },
      {
        "key": "Công suất",
        "value": "6.000 trang/ ngày"
      },
      {
        "key": "Bộ nhớ",
        "value": "2048 MB"
      },
      {
        "key": "Cổng kết nối",
        "value": "USB type C (3.2 Gen1x1 / USB 2.0 / USB 1.1"
      },
      {
        "key": "Các chứng nhận",
        "value": "ENERGY STAR, RoHS, EPEAT"
      },
      {
        "key": "Chức năng quản lý máy",
        "value": "Đi kèm phần mềm quản lý cấu hình, theo dõi nhiều máy từ xa cùng lúc dưới dạng phần mềm server - client"
      },
      {
        "key": "Định dạng file",
        "value": "Hỗ trợ các định dạng file: Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint"
      },
      {
        "key": "Hỗ trợ Index file",
        "value": "XML, CSV, TXT"
      },
      {
        "key": "Tính năng tách trường văn bản (Metadata fields)",
        "value": "20 trường"
      },
      {
        "key": "Phần mềm số hóa tiếng Việt đi kèm",
        "value": "Tự động tách file và đặt tên file theo loại văn bản, ngày trên văn bản, số văn bảnChuyển đổi chữ in và chữ viết tay tiếng Việt sang file dạng văn bản (Word)Tự động bóc tách các trường trên văn bản hành chính: Số văn bản, ngày văn bản, tiêu đề, kính gửi, cơ quan ban hành, nơi nhận, người ký.Nguồn tài liệu đầu vào từ máy scan hoặc từ file ảnh."
      },
      {
        "key": "Xuất xứ",
        "value": "Thái Lan"
      }
    ],
    "sourceFile": "Spec thau SP-2240.docx"
  },
  {
    "key": "ricoh_ix1300",
    "name": "Máy scan tài liệu Ricoh ScanSnap iX1300",
    "model": "iX1300",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh iX1300.docx",
    "specs": [
      {
        "key": "Kiểu quét",
        "value": "Máy quét tự động khổ A4, tích hợp khay quét sổ"
      },
      {
        "key": "Chế độ quét",
        "value": "Mầu, thang xám, trắng đen, tự động nhận biết trang màu, thang xám, trắng đen"
      },
      {
        "key": "Tốc độ",
        "value": "30 ppm/ 60 ipm (quét màu, 300 dpi)"
      },
      {
        "key": "Khay giấy",
        "value": "U-turn scanReturn scan (Card, A3, Booklet)"
      },
      {
        "key": "Kết nối",
        "value": "USB 3.2; Wifi IEEE802.11a/b/g/n/ac"
      },
      {
        "key": "Đèn quét",
        "value": "CIS"
      },
      {
        "key": "Nguồn sáng",
        "value": "Led 3 màu"
      },
      {
        "key": "Độ phân giải",
        "value": "Tối đa 1200 dpi"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối thiểu: 50.8 x 50,8 mm (2 x 2 in.)Tối đa: 216 x 355,6 mm (8.5 x 14 in.)"
      },
      {
        "key": "Tính năng thông minh",
        "value": "Công nghệ tự động đặt tên file theo nội dung văn bản, tự động học để chỉnh sửa tên file cho lần quét tiếp theo"
      },
      {
        "key": "Tìm kiếm file",
        "value": "Hỗ trợ tìm kiếm dễ dàng qua Keyword. Sắp xếp các file theo các mục: Tài liệu, biên lai, danh thiếp, ảnh"
      },
      {
        "key": "Trích xuất thông tin trên danh thiếp",
        "value": "Tự động nhận dạng các thông tin trên danh thiếp và khả năng trích xuất thông tin này dưới dạng file: CSV, Text (Tab delimited), vCard, ContactXML, Unicode CSV (Comma delimited), Unicode Text (Tab delimited), Unicode vCard"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR®/RoHS"
      },
      {
        "key": "Phần mềm đi kèm",
        "value": "ScanSnap Home, ABBYY FineReader for ScanSnap™"
      },
      {
        "key": "Hệ điều hành",
        "value": "Windows, Mac, iOS, iPadOS, Android, Chrome OS và Fire OS"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Spec Ricoh iX1300.docx"
  },
  {
    "key": "ricoh_ix1400",
    "name": "Máy scan tài liệu Ricoh ScanSnap iX1400 (USB 1 chạm)",
    "model": "iX1400",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh iX1400.docx",
    "specs": [
      {
        "key": "Kiểu quét",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Loại máy",
        "value": "ADF (Nạp giấy tự động), Quét 2 mặt"
      },
      {
        "key": "Chế độ quét",
        "value": "Mầu, thang xám, trắng đen, tự động nhận biết trang màu, thang xám, trắng đen"
      },
      {
        "key": "Đèn quét",
        "value": "Color CIS x 2"
      },
      {
        "key": "Nguồn sáng",
        "value": "Led 3 màu"
      },
      {
        "key": "Độ phân giải",
        "value": "600 dpi"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 216 x 360 mmTối thiểu: 50,8 x 50,8 mmKéo giấy dài tối đa: 3.000 mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "40 - 209 g/m2 Hỗ trợ quét thẻ nhựa chữ nổi (độ dày tối đa 0,76mm)"
      },
      {
        "key": "Tốc độ quét (quét màu, khổ A4, 300 dpi)",
        "value": "Một mặt: 40 ppm Hai mặt: 80 ipm"
      },
      {
        "key": "Khay giấy",
        "value": "50 tờ (A4, 80 g/m2)"
      },
      {
        "key": "Độ phân giải",
        "value": "600 dpi"
      },
      {
        "key": "Tìm kiếm file",
        "value": "Hỗ trợ tìm kiếm dễ dàng qua Keyword, follder, tag"
      },
      {
        "key": "Trích xuất thông tin trên danh thiếp",
        "value": "Tự động nhận dạng các thông tin trên danh thiếp và khả năng quản lý các thông tin này"
      },
      {
        "key": "Cổng giao tiếp",
        "value": "USB 3.2 / USB 2.0 / USB 1.1"
      },
      {
        "key": "Nguồn điện",
        "value": "AC 100 to 240 V, 50/60 Hz"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR®/RoHS"
      },
      {
        "key": "Phần mềm đi kèm",
        "value": "ScanSnap Home, ScanSnap Manager, Kofax Power PDF Standard, ABBYY FineReader for ScanSnap™"
      },
      {
        "key": "Hệ điều hành",
        "value": "Windows, MAC"
      }
    ],
    "sourceFile": "Spec Ricoh iX1400.docx"
  },
  {
    "key": "ricoh_ix1600",
    "name": "Máy scan màn hình cảm ứng Wi-Fi Ricoh ScanSnap iX1600",
    "model": "iX1600",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh iX1600.docx",
    "specs": [
      {
        "key": "Kiểu quét",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Loại máy",
        "value": "ADF (Nạp giấy tự động)/ Nạp giấy thủ công, Quét 2 mặt"
      },
      {
        "key": "Chế độ quét",
        "value": "Mầu, thang xám, trắng đen, tự động nhận biết trang màu, thang xám, trắng đen"
      },
      {
        "key": "Đèn quét",
        "value": "Color CIS x 2"
      },
      {
        "key": "Nguồn sáng",
        "value": "Led 3 màu"
      },
      {
        "key": "Độ phân giải",
        "value": "600 dpi"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 216 x 360 mmTối thiểu: 50,8 x 50,8 mmKéo giấy dài tối đa: 3.000 mmChế độ quét thủ công: A3 (không cần phụ kiện carrie sheet), B4, 279 x 432 mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "40 - 209 g/m2 Hỗ trợ quét thẻ nhựa chữ nổi (độ dày tối đa 0,76mm)"
      },
      {
        "key": "Tốc độ quét (quét màu, khổ A4, 300 dpi)",
        "value": "Một mặt: 40 ppm Hai mặt: 80 ipm"
      },
      {
        "key": "Khay giấy",
        "value": "50 tờ (A4, 80 g/m2)"
      },
      {
        "key": "Độ phân giải",
        "value": "600 dpi"
      },
      {
        "key": "Cổng giao tiếp",
        "value": "USB 3.2 / USB 2.0 / USB 1.1WIFI: IEEE802.11a/b/g/n, khả năng chia sẻ tối đa cho 4 máy tính qua mạng WIFI"
      },
      {
        "key": "Chế độ WIFI",
        "value": "Access Point Connect Mode (Infrastructure mode)Direct Connect Mode (Ad-hoc mode)"
      },
      {
        "key": "Màn hình",
        "value": "4.3 in. color TFT touch screen"
      },
      {
        "key": "Nguồn điện",
        "value": "AC 100 to 240 V, 50/60 Hz"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR®/RoHS"
      },
      {
        "key": "Phần mềm đi kèm",
        "value": "ScanSnap Home, ScanSnap Manager, Kofax Power PDF Standard, ABBYY FineReader for ScanSnap™"
      },
      {
        "key": "Hệ điều hành",
        "value": "Windows, MAC"
      }
    ],
    "sourceFile": "Spec Ricoh iX1600.docx"
  },
  {
    "key": "ricoh_ix2400",
    "name": "Máy scan tài liệu Ricoh ScanSnap iX2400",
    "model": "iX2400",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Bai thau iX2400.docx",
    "specs": [
      {
        "key": "Kiểu quét",
        "value": "Quét 2 mặt tự động"
      },
      {
        "key": "Loại máy",
        "value": "ADF (Nạp giấy tự động), Quét 2 mặt"
      },
      {
        "key": "Chế độ quét",
        "value": "Mầu, thang xám, trắng đen, tự động nhận biết trang màu, thang xám, trắng đen"
      },
      {
        "key": "Đèn quét",
        "value": "CIS x 2"
      },
      {
        "key": "Nguồn sáng",
        "value": "Led 3 màu"
      },
      {
        "key": "Độ phân giải",
        "value": "600 dpi"
      },
      {
        "key": "Khổ giấy",
        "value": "Tối đa: 216 x 360 mmTối thiểu: 50,8 x 50,8 mmKéo giấy dài tối đa: 3.000 mm"
      },
      {
        "key": "Định lượng giấy",
        "value": "40 - 209 g/m2 Hỗ trợ quét thẻ nhựa chữ nổi (độ dày tối đa 0,76mm)"
      },
      {
        "key": "Hỗ trợ quét nhiều loại giấy tờ",
        "value": "Quét phong bì, thẻ nhựa, tài liệu A3 gấp, và tài liệu có ghi chú dán"
      },
      {
        "key": "Tốc độ quét (quét màu, khổ A4, 300 dpi)",
        "value": "Một mặt: 45 ppm Hai mặt: 90 ipm"
      },
      {
        "key": "Khay giấy",
        "value": "100 tờ (A4, 80 g/m2)"
      },
      {
        "key": "Công suất quét",
        "value": "7000 tờ/ ngày"
      },
      {
        "key": "Độ phân giải",
        "value": "600 dpi"
      },
      {
        "key": "Bộ nhớ",
        "value": "2048 MB"
      },
      {
        "key": "Cổng giao tiếp",
        "value": "USB3.2 Gen1x1 / USB3.1 / USB3.0 / USB2.0 /USB 1.1 (Connector Type: Type-C)"
      },
      {
        "key": "Nguồn điện",
        "value": "AC 100 to 240 V, 50/60 Hz"
      },
      {
        "key": "Chứng chỉ môi trường",
        "value": "ENERGY STAR®/RoHS"
      },
      {
        "key": "Hệ điều hành",
        "value": "Windows, MAC"
      },
      {
        "key": "Xuất xứ",
        "value": "Indonesia"
      }
    ],
    "sourceFile": "Bai thau iX2400.docx"
  },
  {
    "key": "ricoh_sv600",
    "name": "Máy scan sách trên cao Ricoh ScanSnap SV600",
    "model": "SV600",
    "brand": "Ricoh",
    "origin": "Indonesia",
    "unit": "Cái",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec Ricoh SV 600.docx",
    "specs": [
      {
        "key": "Loại máy",
        "value": "Máy quét sách khổ A3"
      },
      {
        "key": "Kiểu quét",
        "value": "Hệ thống Over Head, quét đơn"
      },
      {
        "key": "Các chế độ quét",
        "value": "Màu, xám, đen trắng, tự động (dò tìm màu/xám/đen trắng)"
      },
      {
        "key": "Cảm biến hình ảnh",
        "value": "Lens reduction optics / CCD màu x 1"
      },
      {
        "key": "Nguồn sáng",
        "value": "(Đèn LED trắng + ánh sáng từ ống kính) x 2"
      },
      {
        "key": "Độ phân giải quang học",
        "value": "Quét ngang: 285 đến 218 dpi, Quét dọc: 283 đến 152 dpi"
      },
      {
        "key": "Tốc độ quét (A3 giấy ngang)",
        "value": "Chế độ tự động"
      },
      {
        "key": "Kích cỡ tài liệu quét",
        "value": "Tự động nhận biết khổ giấy, A3 (giấy ngang), A4 (giấy ngang), A5 (giấy ngang), A6 (giấy ngang), B4 (giấy ngang), B5 (giấy ngang), B6 (giấy ngang), Bưu thiếp, Danh thiếp, Thư đôi (giấy ngang, Thư, Văn bản pháp lý (giấy ngang) và Tùy chỉnh kích cỡ ( Tối đa: 432 x 300 mm (17.0 x 11.8 in.), Tối thiểu: 25.4 x 25.4 mm (1 x 1 in.))"
      },
      {
        "key": "Độ dày của tập giấy",
        "value": "30 mm (1.18 in.) hoặc mỏng hơn"
      },
      {
        "key": "Các cách khởi động quét",
        "value": "1. Quét thường: Ấn nút “Quét” để quét từng trang 2. Tự động quét theo chu kỳ thời gian đặt trước3. Tự động quét nhờ cảm biến lật trang"
      },
      {
        "key": "Cổng kết nối máy tính",
        "value": "USB2.0 / USB1.1 (Kết nối: Loại B)"
      },
      {
        "key": "Tính năng xử lý hình ảnh",
        "value": "Giảm độ nghiêng của chữ trên tài liệu, Tự động nhận biết khổ giấy, tự động xoay hình ảnh, tự động nhận biết màu sắc, chỉnh sửa hình ảnh từ sách, dò tìm đa tài liệu"
      },
      {
        "key": "Độ phóng đại khi quét dọc (theo chiều dài)",
        "value": "±1.5"
      },
      {
        "key": "Yêu cầu điện năng",
        "value": "AC 100 đến 240 V, 50 / 60 Hz"
      },
      {
        "key": "Công suất tiêu thụ điện",
        "value": "Chế độ hoạt động: 20 W hoặc ít hơn Chế độ nghỉ: 2.6 W hoặc ít hơnChế độ standby: 0.4 W"
      },
      {
        "key": "Môi trường vận hành",
        "value": "Nhiệt độ: 5 đến 35 °C (41 đến 95 °F) Độ ẩm: 20 đến 80 % (Không ngưng tụ)"
      },
      {
        "key": "Kích thước (Rộng x Sâu x Cao)",
        "value": "210 x 156 x 383 mm"
      },
      {
        "key": "Trọng lượng",
        "value": "3 kg"
      },
      {
        "key": "Tiêu chuẩn về môi trường",
        "value": "ENERGY STAR® / RoHS"
      },
      {
        "key": "Trình điều khiển",
        "value": "Trình điểu khiển đặc biệt (Không hỗ trợ TWAIN / ISIS™)"
      }
    ],
    "sourceFile": "Spec Ricoh SV 600.docx"
  },
  {
    "key": "rowe_scan_450i",
    "name": "Máy quét bản vẽ kỹ thuật khổ lớn A0 ROWE Scan 450i-36''",
    "model": "ROWE Scan 450i-36''",
    "brand": "ROWE",
    "origin": "Đức",
    "unit": "Bộ",
    "cat": "may_scan",
    "price": 0,
    "warranty": "12 tháng",
    "file": "Spec SCAN ROWE 450i-36''11.docx",
    "specs": [
      {
        "key": "TÊN SẢN PHẨM",
        "value": "ĐẶC ĐIỂM KỸ THUẬT"
      },
      {
        "key": "Chân Máy Rowe Scan 450i - 36\"",
        "value": "Chân để máy scan ROWE 450i – 36\" : Chiều cao của bàn để là 960mm"
      },
      {
        "key": "Rowe scan 450i – KIT 60(Quý khách cần tốc độ scan màu lên 5,5 mét có thể mua KIT 60 này)",
        "value": "Phần mềm nâng cao, tăng tốc độ scan+ Scan B/W: 17 mét/phút+Scan Color: 5,5 mét/phút"
      },
      {
        "key": "Rowe scan 450i API(Nếu Quý khách cần kết nối với máy in laser trắng đen khác)",
        "value": "Phần mềm kết nối với các dòng máy in khổ lớn khác để tạo hệ thống in/scan/coppy khi cần nhân bản số lượng lớn"
      },
      {
        "key": "Phần mềm ROWE Scan Manager TWAIN",
        "value": "Các chức năng chính gồm:+ Scan trực tiếp tài liệu với sự hỗ trợ của TWAIN Support.+ Với bộ chỉnh sửa/ điều chỉnh hình ảnh cơ bản, 2 cách xem (xem toàn cảnh và xem điểm chính)+ Bộ quản lý màu Icc"
      },
      {
        "key": "Tổng Cộng",
        "value": "198.000.000 vnđ (có VAT)"
      },
      {
        "key": "TÍNH NĂNG",
        "value": "MIÊU TẢ"
      },
      {
        "key": "Chiều rộng tối đa",
        "value": "36“ (927 mm) / Chiều rộng quét lớn nhất là 39.4“ (1001 mm)"
      },
      {
        "key": "Độ dày bản scan tối đa",
        "value": "Linh hoạt với nhiều vật liệu lên đến 2mm (.08’’)"
      },
      {
        "key": "Độ dài bản scan",
        "value": "Không giới hạn chiều dài bản scan"
      },
      {
        "key": "Độ phân giải",
        "value": "2400 x 1200 dpi"
      },
      {
        "key": "Độ phân giải tối đa",
        "value": "9600 x9600 dpi"
      },
      {
        "key": "Độ chính xác của bản scan",
        "value": "0.1%+/-1Pixel"
      },
      {
        "key": "Độ sắc màu",
        "value": "48 – bit color16 – bit greyscale"
      },
      {
        "key": "Không gian màu",
        "value": "Không gian màu: sRGB, Adobe RGB, Device RGB"
      },
      {
        "key": "Scan màu Color",
        "value": "2.75 mét/phút ở độ phân giải 400dpi"
      },
      {
        "key": "Scan trắng đen B/W",
        "value": "17 mét/phút ở độ phân giải 400dpi"
      },
      {
        "key": "Hệ thống cải thiện tài liệu",
        "value": "Tất cả các thay đổi có thể thực hiện sau khi scan và sẽ được hiển thị ngay lập tức trong trình xem"
      },
      {
        "key": "Superspeed USB 3.0 + RES",
        "value": "Truyền tải thông lượng dữ liệu lên đến 1000% so với HighSpees USB 2.0"
      },
      {
        "key": "Số tài liệu/giờ tại độ phân giải 300x300dpi với size A0,color 24-bit RGB, bao gồm tự động nhận dạng chiều rộng, cổng USB 3.0 với công nghệ RES",
        "value": "113 A0"
      },
      {
        "key": "Số tài liệu/giờ tại độ phân giải 300x300dpi với size A0, trắng đen 1-bit, greyscale 8-bit",
        "value": "427 A0"
      },
      {
        "key": "Ứng dụng (Rowe ScanManager LT)",
        "value": "Có thể sử dụng bất kì ứng dụng CAD hoặc GIS"
      },
      {
        "key": "Định dạng dữ liệu (Rowe ScanManager LT)",
        "value": "TIFF (JPEG,G3,G4,PACKBITS,LZW), MULTIPAE – TIFF, JPEG, PDF, BMP, JPEG2000,PNG,DWF,CALS"
      },
      {
        "key": "Rowe Scan Manager TWAIN",
        "value": "Twain + chỉnh sửa ( Phạm vi cung cấp bao gồm scan trong tất cả các ứng dụng với sự hỗ trợ của Twain, bộ Kit xử lí hình ảnh cơ bản, 02 trình xem : xem tổng quan và xem điểm chính.Quản lí màu Icc và hơn thế nữa"
      },
      {
        "key": "Hệ thống hỗ trợ điều hành",
        "value": "Windows 10, Windows 8.1, Windows 8, Windows 7, Windows Vista, 32-bit và 64-bit"
      },
      {
        "key": "Hỗ trợ đám mây",
        "value": "Với Rowe Scan Cloud dữ liệu có thể được chuyển ngay lập tức cho bất kì ứng dụng đám mây nào"
      },
      {
        "key": "Kết nối nguồn điện",
        "value": "100-240 V 50/60 Hz"
      },
      {
        "key": "Công suất tiêu thụ",
        "value": "Chế độ tiết kiệm năng lượng/ họt động với bộ phận hẹn giờ lập trình, vượt tiêu chuẩn của Energy Star <19W/ < 0.4W"
      },
      {
        "key": "Trọng lượng",
        "value": "16kg"
      },
      {
        "key": "Kích thước dài x rộng x cao",
        "value": "332 x 1201 x 126 mm"
      },
      {
        "key": "Xuất xứ:",
        "value": "Đức"
      }
    ],
    "sourceFile": "Spec SCAN ROWE 450i-36''11.docx"
  },
  {
    "key": "ricoh_im_2702_key",
    "name": "Máy đa chức năng A3 Ricoh IM 2702",
    "model": "IM 2702",
    "brand": "Ricoh",
    "origin": "Thái Lan",
    "unit": "Máy",
    "cat": "photocopy",
    "price": 0,
    "warranty": "12 tháng",
    "specs": [
      {
        "key": "Loại máy",
        "value": "Photocopy trắng đen"
      },
      {
        "key": "Tính năng chính",
        "value": "Copy, Print, Scan"
      },
      {
        "key": "Tốc độ copy/in",
        "value": "27 trang /phút"
      },
      {
        "key": "Thời gian khởi động",
        "value": "27 giây"
      },
      {
        "key": "Bản in đầu tiên",
        "value": "6.5 giây"
      },
      {
        "key": "Bộ nhớ máy",
        "value": "02 GB"
      },
      {
        "key": "Bộ nhớ màn hình",
        "value": "2GB"
      },
      {
        "key": "Thẻ nhớ hỗ trợ",
        "value": "16GB"
      },
      {
        "key": "Bảng điều khiển",
        "value": "Màn hình cảm ứng SOP 7 inch, chạy hệ điều hành Android"
      },
      {
        "key": "Tính năng",
        "value": "Đảo mặt bản gốc tự động"
      },
      {
        "key": "Tính năng",
        "value": "CHỨC NĂNG IN"
      },
      {
        "key": "Bộ xử lý",
        "value": "ARM CortexA53 800 MHz"
      },
      {
        "key": "Ngôn ngữ in",
        "value": "PCL5e/6, PostScript3 ( PS3 )"
      },
      {
        "key": "Cổng kết nối in",
        "value": "Ethernet (1000/100/10 base) - Wireless LAN ( IEEE802.11a/b/g/n), USB 2.0-Device (Type-B), USB 2.0 -Host"
      },
      {
        "key": "Độ phân giải in / copy",
        "value": "600dpi x 600dpi"
      },
      {
        "key": "Ứng dụng hỗ trợ in từ thiết bị di động",
        "value": "Apple AirPrint, Mopria, Google Cloud Print"
      },
      {
        "key": "Hệ điều hành Windows® được hỗ trợ",
        "value": "Windows® Server 2008/2008 R2/2012/2012 R2/2016/2019, Windows® 7/8/8.1/10"
      },
      {
        "key": "Hệ điều hành Mac được hỗ trợ",
        "value": "Mac OS X ( v10.11 hoặc mới hơn)"
      },
      {
        "key": "SAP được hỗ trợ",
        "value": "SAP R/3, SAP S/4"
      },
      {
        "key": "Tính năng",
        "value": "CHỨC NĂNG SCAN"
      },
      {
        "key": "Tốc độ Scan",
        "value": "Trắng đen : lên đến 50 bản/phút , Màu : lên đến 50 bản/phút"
      },
      {
        "key": "Độ phân giải scan",
        "value": "100 x 100 dpi, 200 x 200 dpi (default), 300 x 300 dpi, 400 x 400 dpi, 600 x 600 dpi, 1,200 x 1,200 dpi"
      },
      {
        "key": "Quét vào",
        "value": "Email , Folder, Network Twain, USB"
      },
      {
        "key": "Định dạng tập tin gửi",
        "value": "Single Page TIFF, Multi Page TIFF, Single Page JPEG, Single Page PDF, Multi Page PDF"
      },
      {
        "key": "Tính năng",
        "value": "XỬ LÝ GIẤY"
      },
      {
        "key": "Khổ giấy hỗ trợ các khay ( đảo mặt, khay gầm, khay tiêu  chuẩn ), khay tay",
        "value": "A6 -A3"
      },
      {
        "key": "Dung lượng giấy đầu vào",
        "value": "- Khay giấy tiêu chuẩn : 500 tờ x 1 khay\r\n - Khay tay: 100 tờ\r\n- ARDF (khay nạp đảo bản gốc): 100 tờ"
      },
      {
        "key": "Dung lượng giấy đầu ra",
        "value": "- Tiêu chuẩn : 250 tờ"
      },
      {
        "key": "Định lượng giấy",
        "value": "- Khay tay :  52 - 105g/m2\r\n  - Khay tiêu chuẩn : 60 - 216g/m2"
      },
      {
        "key": "Loại giấy",
        "value": "Thin Paper, Plain Paper 1, Plain Paper 2, Recycled, Color Paper, Special Paper, Middle Thick Paper, Prepunched Paper, Letterhead, Bond Paper, Cardstock, Thick Paper 1, Thick Paper 2, Label Paper, OHP, Envelope"
      },
      {
        "key": "Kích thước máy",
        "value": "Kích thước vật lý (Rộng x Sâu x Cao) - phần máy chính:  587 x 581 x 677 mm - Độ sâu bao gồm cả khay đầu vào\r\nTrọng lượng - thân máy chính: 46.5kg"
      },
      {
        "key": "Tính năng",
        "value": "NGUỒN ĐIỆN"
      },
      {
        "key": "Mức tiêu thụ điện năng",
        "value": "- Tối đa : ít hơn 1.550W\r\n- Chế độ chờ : ít hơn 113W\r\n- Chế độ nghỉ : ít hơn 4W"
      },
      {
        "key": "Chỉ số TEC",
        "value": "1.3 kWh"
      },
      {
        "key": "Tính năng",
        "value": "YÊU CẦU HỒ SƠ HÃNG"
      },
      {
        "key": "- Toàn bộ máy được sản xuất phải được đăng ký thương hiệu theo quy định của pháp luật Việt Nam ( hoặc tương đương)                                                                                               - Cung cấp đầy đủ catalogue của hàng hóa chào thầu",
        "value": "thông số kỹ thuật trong catalogue phải phù hợp, logic với thông số kỹ thuật đề xuất của nhà thầu                                                                                                   - Được sản xuất bởi các tổ chức, doanh nghiệp đạt ít nhất các chuẩn quản lý chất lượng, môi trường sau: TCVN ISO 9001; TCVN ISO 14001 hoặc tương đương\r\n- Các phụ kiện kèm theo đồng bộ do 1 hãng sản xuất ( ngoại trừ chân kệ máy )"
      }
    ],
    "file": "Spec Key RICOH IM 2702.xlsx",
    "sourceFile": "Spec Key RICOH IM 2702.xlsx"
  },
  {
    "key": "ricoh_im_3500_key",
    "name": "Máy đa chức năng đen trắng Ricoh IM 3500",
    "model": "IM 3500",
    "brand": "Ricoh",
    "origin": "Thái Lan",
    "unit": "Cái",
    "cat": "photocopy",
    "price": 0,
    "warranty": "12 tháng",
    "specs": [
      {
        "key": "Thời gian khởi động:",
        "value": "tối đa 18.6 giây"
      },
      {
        "key": "Thời gian in bản đầu tiên:",
        "value": "tối đa 3.8 giây"
      },
      {
        "key": "Tốc độ in:",
        "value": ">= 35 trang/phút"
      },
      {
        "key": "Bộ nhớ máy :",
        "value": ">= 2 GB"
      },
      {
        "key": "Bộ nhớ màn hình :",
        "value": ">= 2 GB"
      },
      {
        "key": "Ổ cứng (tiêu chuẩn):",
        "value": "320 GB tiêu chuẩn kèm theo máy"
      },
      {
        "key": "Bảng điều khiển",
        "value": "Màn hình cảm ứng LCD > = 10.1 inch, chạy hệ điều hành Android"
      },
      {
        "key": "Dung lượng khay nạp đảo bản gốc :",
        "value": ">= 100 tờ (định lượng giấy 80g/m2)"
      },
      {
        "key": "Sao chụp liên tục:",
        "value": "lên đến 999 tờ"
      },
      {
        "key": "Độ phân giải:",
        "value": "600 dpi"
      },
      {
        "key": "Thu phóng:",
        "value": "Từ 25% đến 400% theo bước tăng / giảm 1%"
      },
      {
        "key": "Loại CPU :",
        "value": ">= Intel® Antom Processor ApolloLake-l 1.36GHz"
      },
      {
        "key": "Ngôn ngữ in",
        "value": "Có sẵn: PCL5e, PCL6, PDF Direct ( emulation), PS3 ( emulation)"
      },
      {
        "key": "Độ phân giải in",
        "value": "lên đến 1,200 x 1,200 dpi"
      },
      {
        "key": "Kết nối mạng :",
        "value": "Có sẵn: Ethernet 10 base-T/100\r\nbase-TX/1000 base-T, USB Host I/F Type A ,USB Device I/F Type B"
      },
      {
        "key": "Hệ điều hành Windows hỗ trợ",
        "value": "Windows® 8.1, Windows® 10, Windows® Server 2012, Windows® Serve 2012 R2, Windows® Serve 2016, Windows® Serve 2019"
      },
      {
        "key": "Hệ điều hành Mac hỗ trợ",
        "value": "Macintosh OS X v10.13 or later"
      },
      {
        "key": "Hệ điều hành UNIX hỗ trợ :",
        "value": "UNIX Sun® Solaris, HP-UX, SCO OpenServer, RedHat® Linux, IBM® AIX, Citrix XenApp ( 7.6 LTRS, 7.15 LTRS , VirtualApps / Desktops 71912 LTRS and later )"
      },
      {
        "key": "Hệ điều hành SAP hỗ trợ :",
        "value": "SAP® R/3® , SAP® S/4®"
      },
      {
        "key": "Các môi trường khác :",
        "value": "NDPS Gateway AS/400 using OS/400 Host Print Traform"
      },
      {
        "key": "Tốc độ scan",
        "value": ">= 80 trang/phút (1 mặt) với độ phân giải 200/300dpi"
      },
      {
        "key": "Độ phân giải",
        "value": "Tối đa lên đến 600 dpi"
      },
      {
        "key": "Tiện ích hổ trợ ( có sẵn)",
        "value": "Tính năng nhận diện nhiều bản scan trong 01 lần scan, máy tự động nhận diện nhiều file  scan riêng biệt trong 01 lần scan  nhiều bản trên mặt kiếng."
      },
      {
        "key": "Khổ giấy :",
        "value": "Khay 1 : A3, A4, A5, A6, B4, B5, B6, phong bì thư \r\nKhay 2 : A3, A4, A5, A6, B4, B5, B6, phong bì thư\r\nKhay tay : A3, A4, A5, A6, B4, B5, B6, phong bì thư, kích thước giấy tùy chọn ."
      },
      {
        "key": "Dung lượng giấy đầu vào (định lượng giấy 80g/m2)",
        "value": "Tiêu chuẩn: >= 1.200 tờ ( khay >= 550 tờ x 2 , khay tay : >= 100 tờ)\r\nTối đa : 4.700 tờ (tùy chọn thêm)"
      },
      {
        "key": "Dung lượng giấy đầu ra (định lượng giấy 80g/m2) :",
        "value": "Tiêu chuẩn: 500 tờ \r\nTối đa : 1.625 tờ (tùy chọn thêm)"
      },
      {
        "key": "Định lượng giấy:",
        "value": "Khay chuẩn : 60 - 300 g/m2\r\nKhay tay : 52 - 300 g/m2\r\nĐảo mặt : 52 - 256 g/m2"
      },
      {
        "key": "Loại giấy :",
        "value": "Giấy trơn thường , Giấy tái chế, Giấy đặc biệt, Giấy màu, Giấy viết thư, Giấy bìa cứng, Giấy in sẵn, Giấy bond, Giấy phủ, Bì thư, Giấy nhãn, OHP"
      },
      {
        "key": "Mức tiêu thụ điện:",
        "value": "Tối đa: 1,600 W\r\nChế độ vận hành : 553 W \r\nChế độ chờ: <= 56,4 W\r\nChế độ nghỉ: <= 0.57 W"
      }
    ],
    "file": "Spec RICOH IM 3500 - Key.xlsx",
    "sourceFile": "Spec RICOH IM 3500 - Key.xlsx"
  },
  {
    "key": "kyocera_pa4000x",
    "name": "Máy in A4 laser đen trắng 2 mặt Kyocera PA4000x",
    "model": "PA4000x",
    "brand": "Kyocera",
    "origin": "Việt Nam",
    "unit": "Chiếc",
    "cat": "may_in",
    "price": 0,
    "warranty": "12 tháng",
    "specs": [
      {
        "key": "Chức năng chuẩn",
        "value": "In"
      },
      {
        "key": "CPU",
        "value": "1.0 Ghz"
      },
      {
        "key": "Phương thức in",
        "value": "Laser"
      },
      {
        "key": "Tốc độ in",
        "value": "40 trang/phút(A4)"
      },
      {
        "key": "Bảng điều khiển",
        "value": "LCD 5 dòng"
      },
      {
        "key": "Bộ nhớ RAM tiêu chuẩn",
        "value": "512MB"
      },
      {
        "key": "Thời gian khởi động máy",
        "value": "Khoảng 15 giây"
      },
      {
        "key": "Ngôn ngữ",
        "value": "Tiếng Việt"
      },
      {
        "key": "Khổ giấy",
        "value": "A6R-A4"
      },
      {
        "key": "Trữ lượng giấy (chuẩn)",
        "value": "01 khay gầm x 250 tờ"
      },
      {
        "key": "Định lượng giấy tiêu chuẩn",
        "value": "Khay gầm: 60 – 163 g/m2"
      },
      {
        "key": "Khay giấy ra",
        "value": "250 tờ úp mặt"
      },
      {
        "key": "Công suất tiêu thụ",
        "value": "Chế độ hoạt động: 555,9W"
      },
      {
        "key": "Độ phân giải",
        "value": "300 x 300 dpi, 600 x 600 dpi, Fast1200, Fine1200"
      },
      {
        "key": "Thời gian bản in đầu tiên",
        "value": "6,4 giây hoặc ít hơn"
      },
      {
        "key": "In 2 mặt (Duplex)",
        "value": "Tiêu chuẩn"
      },
      {
        "key": "In di động",
        "value": "AirPrint, Mopria, KYOCERA Mobile Print"
      },
      {
        "key": "Giao diện",
        "value": "USB 2.0 High Speedx1; Ethernet 10BASE-T/100BASE-TX/1,000BASE-T;\r\nUSB Host Interface (USB Host)x1"
      },
      {
        "key": "Giao thức hỗ trợ",
        "value": "TCP/IP, FTP, LPR, Port9100, NetBEUI, Apple Bonjour"
      },
      {
        "key": "Ngôn ngữ in",
        "value": "PCL6 (PCL5e, PCL-XL), KPDL3 (Postscript 3 compatible), PRESCRIBE, Line Printer, IBM Proprinter, Epson LQ-850, PDF Direct Print"
      },
      {
        "key": "Hộp mực",
        "value": "7.200 trang A4"
      },
      {
        "key": "Tuổi thọ cụm trống",
        "value": "70.000 trang A4"
      }
    ],
    "file": "Báo giá máy Scan, Photo.xlsx",
    "sourceFile": "Báo giá máy Scan, Photo.xlsx"
  }
,
  {
    "key": "fujitsu_lifebook_e5412",
    "name": "Máy vi tính xách tay: Fujitsu Lifebook E5412 (Bảo mật vân tay)",
    "model": "Lifebook E5412",
    "brand": "Fujitsu",
    "origin": "Japan",
    "unit": "Chiếc",
    "cat": "may_tinh",
    "price": 0,
    "warranty": "12 tháng",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Màn hình",
        "value": "14 inch, Full-HD LCD, Chống chói"
      },
      {
        "key": "Bộ vi xử lý",
        "value": "Intel® Core™ i7-1255U processor (10 Cores, up to 4.7 GHz), vPro Essentials supported"
      },
      {
        "key": "Bộ nhớ trong",
        "value": "8GB DDR4-3200; 2 khe RAM cho phép nâng cấp lên tới: 64 GB"
      },
      {
        "key": "Ổ đĩa cứng",
        "value": "SSD 1TB Value-PCIe M.2 NVMe"
      },
      {
        "key": "Đồ họa",
        "value": "Intel® UHD Graphics (tích hợp theo CPU)"
      },
      {
        "key": "Âm thanh",
        "value": "HD Audio, Stereo speakers and Dual digital array microphone, AI noise reduction in dual built-in microphones."
      },
      {
        "key": "Camera",
        "value": "Built-in HD Webcam with integrated privacy shutter"
      },
      {
        "key": "Kết nối",
        "value": "Gigabit Ethernet Connection\nIntel® Wi-Fi 6E AX211 802.11ax 2x2\nBluetooth® 5.2"
      },
      {
        "key": "Khe cắm thẻ nhớ",
        "value": "microSD 3.0"
      },
      {
        "key": "Cổng kết nối",
        "value": "1x 3.5mm Audio Combo\n2x USB 3.2 Gen 1 Type-A\n2x USB 4.0 Gen 3 Type-C\n1x HDMI Port\n1x Gigabit Ethernet RJ-45"
      },
      {
        "key": "Nhập liệu",
        "value": "Keyboard & touchpad"
      },
      {
        "key": "An toàn bảo mật",
        "value": "- Tích hợp Bảo mật vân tay.\n- Chip bảo mật: TPM 2.0\n- EraseDisk: Tính năng xóa vĩnh viễn toàn bộ dữ liệu ổ cứng, không thể khôi phục lại.\n- BIOS/ Hard Disk password protection: Bảo vệ BIOS và ổ cứng bằng mật khẩu."
      },
      {
        "key": "Pin",
        "value": "4-cell, công suất: 60Wh"
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng."
      }
    ]
  },
  {
    "key": "hp_laserjet_mfp_m528dn",
    "name": "Máy in chuyên dùng HP LaserJet Enterprise MFP M528dn",
    "model": "LaserJet Enterprise MFP M528dn",
    "brand": "HP",
    "origin": "China",
    "unit": "Chiếc",
    "cat": "may_in",
    "price": 0,
    "warranty": "03 năm theo tiêu chuẩn chính hãng",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Chức năng",
        "value": "Máy in mạng đa năng (Print - Copy - Scan) laser đơn sắc khổ A4 2 mặt tự động."
      },
      {
        "key": "Tốc độ sao chụp liên tục (copy, A4)",
        "value": "Chế độ 1 mặt: 43 trang/phút, tối đa lên tới 50 trang/phút ở chế độ in tốc độ cao;\nChế độ 2 mặt: 34 trang/phút;"
      },
      {
        "key": "Bộ nhớ",
        "value": "1.25 GB"
      },
      {
        "key": "Thời gian in bản đầu tiên (A4)",
        "value": "6 giây"
      },
      {
        "key": "Khổ giấy",
        "value": "A4, A5, A6, B5"
      },
      {
        "key": "Màn hình",
        "value": "LCD cảm ứng 8 inch"
      },
      {
        "key": "In ấn trực tiếp từ ổ USB",
        "value": "Có"
      },
      {
        "key": "Cổng kết nối",
        "value": "1000Base-T/100Base-TX/10Base-T, Wireless LAN WEEE 802.11b/g/n, 3 x USB 2.0"
      },
      {
        "key": "Sao chụp liên tục",
        "value": "Lên đến 9999 tờ"
      },
      {
        "key": "Định lượng hộp mực",
        "value": "7.500 trang"
      },
      {
        "key": "Trữ lượng giấy (tiêu chuẩn)",
        "value": "1 khay 550 tờ; khay tay 100 tờ (khả năng mở rộng lên đến 5 khay giấy)"
      },
      {
        "key": "Mức tiêu thụ điện tối đa khi hoạt động",
        "value": "629W, đạt nhãn năng lượng Energy Star 3.0."
      },
      {
        "key": "Bảo hành",
        "value": "03 năm theo tiêu chuẩn chính hãng, tận nơi sử dụng"
      }
    ]
  },
  {
    "key": "fujitsu_py_rx2540_m7_pyr2547ran",
    "name": "Máy Chủ Fujitsu PY RX2540 M7 12x 3.5 (PYR2547RAN)",
    "model": "PY RX2540 M7",
    "brand": "Fujitsu",
    "origin": "Nhật Bản",
    "unit": "Bộ",
    "cat": "may_chu",
    "price": 0,
    "warranty": "3 Year Onsite 8x6xNBD",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Bộ vi xử lý (CPU)",
        "value": "Intel Xeon Silver 4410T 10C 2.7 GHz (SL: 1)"
      },
      {
        "key": "Chế độ lắp đặt",
        "value": "Independent Mode Installation (SL: 1)"
      },
      {
        "key": "Bộ nhớ trong (RAM)",
        "value": "16GB (1x16GB) 1Rx8 DDR5-4800 R ECC (SL: 2)"
      },
      {
        "key": "Ổ đĩa cứng HĐH",
        "value": "HD SAS 12G 1.2TB 10K 512n HOT PL 3.5' EP (SL: 2)"
      },
      {
        "key": "Ổ đĩa cứng dữ liệu",
        "value": "HD SAS 12G 12TB 7.2K 512e HOT PL 3.5' BC (SL: 10)"
      },
      {
        "key": "Card điều khiển RAID",
        "value": "PRAID EP 3254-8i LP (SL: 1)"
      },
      {
        "key": "Card điều khiển RAID",
        "value": "FBU option for PRAID EP 325x (SL: 1)"
      },
      {
        "key": "Card mạng LAN",
        "value": "PLAN CP 4x1Gbit Cu Intel I350-T4 OCPV3 (SL: 1)"
      },
      {
        "key": "Bộ thanh ray gắn tủ rack",
        "value": "Rack Mount Kit (SL: 1)"
      },
      {
        "key": "Bộ phụ kiện vùng",
        "value": "region kit APAC/EMEA/India (SL: 1)"
      },
      {
        "key": "Gói quản trị máy chủ từ xa",
        "value": "iRMC advanced pack (SL: 1)"
      },
      {
        "key": "Thẻ nhớ quản trị iRMC",
        "value": "iRMC MicroSD card 64GB (SL: 1)"
      },
      {
        "key": "Giấy phép quản trị iRMC eLCM",
        "value": "iRMCS6 eLCM Activation License preloaded (SL: 1)"
      },
      {
        "key": "Bộ nguồn dự phòng",
        "value": "Modular PSU 1600W platinum hp (SL: 2)"
      },
      {
        "key": "Cáp nguồn rack",
        "value": "Cable powercord rack, 2.5m, black (SL: 2)"
      },
      {
        "key": "Mặt nạ bảo vệ mặt trước",
        "value": "Front Bezel on front Base (SL: 1)"
      },
      {
        "key": "Chip an toàn bảo mật",
        "value": "TPM 2.0 Module V1 (SL: 1)"
      },
      {
        "key": "Chính sách bảo hành",
        "value": "Warranty 3 Year Onsite 8x6xNBD (SL: 1)"
      }
    ]
  },
  {
    "key": "fujitsu_py_rx1330m6_sff_pyr1336r2n_32gb",
    "name": "Máy Chủ Fujitsu PY RX1330M6/SFF (PYR1336R2N - 32GB RAM)",
    "model": "PY RX1330M6/SFF (32GB)",
    "brand": "Fujitsu",
    "origin": "Nhật Bản",
    "unit": "Bộ",
    "cat": "may_chu",
    "price": 0,
    "warranty": "3 Year Onsite 8x6xNBD",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Bộ vi xử lý (CPU)",
        "value": "Intel Xeon E-2488 8C/16T 3.20 GHz (SL: 1)"
      },
      {
        "key": "Bộ nhớ trong (RAM)",
        "value": "16GB (1x16GB) 1Rx8 DDR5-4800 U ECC (SL: 2)"
      },
      {
        "key": "Ổ đĩa cứng thể rắn",
        "value": "SSD SATA 6G 1.92TB Read-Int. 2.5' H-P EP (SL: 2)"
      },
      {
        "key": "Card điều khiển RAID",
        "value": "PRAID CP600i LP (SL: 1)"
      },
      {
        "key": "Bộ thanh ray gắn tủ rack",
        "value": "RMK F1 Slimline, Slide-In Rail, QRL (SL: 1)"
      },
      {
        "key": "Bộ phụ kiện vùng",
        "value": "region kit APAC/EMEA/India (SL: 1)"
      },
      {
        "key": "Gói quản trị máy chủ từ xa",
        "value": "iRMC advanced pack (SL: 1)"
      },
      {
        "key": "Giấy phép quản trị iRMC eLCM",
        "value": "iRMCS6 eLCM Activation License preloaded (SL: 1)"
      },
      {
        "key": "Bộ nguồn dự phòng",
        "value": "Modular PSU 500W titanium hp (SL: 2)"
      },
      {
        "key": "Cáp nguồn rack",
        "value": "Cable powercord rack, 2.5m, black (SL: 2)"
      },
      {
        "key": "Chip an toàn bảo mật",
        "value": "TPM 2.0 Module V2 (SL: 1)"
      },
      {
        "key": "Chính sách bảo hành",
        "value": "Warranty 3 Year Onsite 8x6xNBD (SL: 1)"
      }
    ]
  },
  {
    "key": "fujitsu_py_rx1330m6_lff_pyr1336r3n",
    "name": "Máy chủ Fujitsu PY RX1330M6/LFF (PYR1336R3N)",
    "model": "PY RX1330M6/LFF",
    "brand": "Fujitsu",
    "origin": "Nhật Bản",
    "unit": "Bộ",
    "cat": "may_chu",
    "price": 0,
    "warranty": "3 Year Onsite 8x6xNBD",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Bộ vi xử lý (CPU)",
        "value": "Intel Xeon E-2488 8C/16T 3.20 GHz (SL: 1)"
      },
      {
        "key": "Bộ nhớ trong (RAM)",
        "value": "16GB (1x16GB) 1Rx8 DDR5-4800 U ECC (SL: 2)"
      },
      {
        "key": "Ổ đĩa cứng khởi động OS",
        "value": "SSD SATA 6G 240GB Read-Int. 3.5' H-P EP (SL: 2)"
      },
      {
        "key": "Ổ đĩa cứng lưu trữ dữ liệu",
        "value": "HD SAS 12G 4TB 7.2K 512n HOT PL 3.5' BC (SL: 2)"
      },
      {
        "key": "Card điều khiển RAID",
        "value": "PRAID EP 3252-8i LP (SL: 1)"
      },
      {
        "key": "Card điều khiển RAID",
        "value": "FBU option for PRAID EP 325x (SL: 1)"
      },
      {
        "key": "Bộ thanh ray gắn tủ rack",
        "value": "RMK F1 Slimline, Slide-In Rail, QRL (SL: 1)"
      },
      {
        "key": "Bộ phụ kiện vùng",
        "value": "region kit APAC/EMEA/India (SL: 1)"
      },
      {
        "key": "Gói quản trị máy chủ từ xa",
        "value": "iRMC advanced pack (SL: 1)"
      },
      {
        "key": "Giấy phép quản trị iRMC eLCM",
        "value": "iRMCS6 eLCM Activation License preloaded (SL: 1)"
      },
      {
        "key": "Bộ nguồn dự phòng",
        "value": "Modular PSU 500W platinum hp (SL: 2)"
      },
      {
        "key": "Cáp nguồn rack",
        "value": "Cable powercord rack, 2.5m, black (SL: 2)"
      },
      {
        "key": "Chip an toàn bảo mật",
        "value": "TPM 2.0 Module V2 (SL: 1)"
      },
      {
        "key": "Chính sách bảo hành",
        "value": "Warranty 3 Year Onsite 8x6xNBD (SL: 1)"
      }
    ]
  },
  {
    "key": "fujitsu_py_rx1330m6_sff_pyr1336r2n_16gb",
    "name": "Server Fujitsu PY RX1330M6/SFF (PYR1336R2N - 16GB RAM)",
    "model": "PY RX1330M6/SFF (16GB)",
    "brand": "Fujitsu",
    "origin": "Nhật Bản",
    "unit": "Bộ",
    "cat": "may_chu",
    "price": 0,
    "warranty": "3 Year Onsite 8x6xNBD",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Bộ vi xử lý (CPU)",
        "value": "Intel Xeon E-2488 8C/16T 3.20 GHz (SL: 1)"
      },
      {
        "key": "Bộ nhớ trong (RAM)",
        "value": "16GB (1x16GB) 1Rx8 DDR5-4800 U ECC (SL: 1)"
      },
      {
        "key": "Ổ đĩa cứng thể rắn",
        "value": "SSD SATA 6G 1.92TB Read-Int. 2.5' H-P EP (SL: 2)"
      },
      {
        "key": "Card điều khiển RAID",
        "value": "PRAID CP600i LP (SL: 1)"
      },
      {
        "key": "Bộ thanh ray gắn tủ rack",
        "value": "RMK F1 Slimline, Slide-In Rail, QRL (SL: 1)"
      },
      {
        "key": "Bộ phụ kiện vùng",
        "value": "region kit APAC/EMEA/India (SL: 1)"
      },
      {
        "key": "Gói quản trị máy chủ từ xa",
        "value": "iRMC advanced pack (SL: 1)"
      },
      {
        "key": "Giấy phép quản trị iRMC eLCM",
        "value": "iRMCS6 eLCM Activation License preloaded (SL: 1)"
      },
      {
        "key": "Bộ nguồn dự phòng",
        "value": "Modular PSU 500W titanium hp (SL: 2)"
      },
      {
        "key": "Cáp nguồn rack",
        "value": "Cable powercord rack, 2.5m, black (SL: 2)"
      },
      {
        "key": "Chip an toàn bảo mật",
        "value": "TPM 2.0 Module V2 (SL: 1)"
      },
      {
        "key": "Chính sách bảo hành",
        "value": "Warranty 3 Year Onsite 8x6xNBD (SL: 1)"
      }
    ]
  },
  {
    "key": "fujitsu_py_rx2530_m7_pyr2537rdn",
    "name": "Máy chủ Fujitsu PY RX2530 M7 8x 2.5 (PYR2537RDN)",
    "model": "PY RX2530 M7",
    "brand": "Fujitsu",
    "origin": "Nhật Bản",
    "unit": "Bộ",
    "cat": "may_chu",
    "price": 0,
    "warranty": "3 Year Onsite 8x6xNBD",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Bộ vi xử lý (CPU)",
        "value": "Intel Xeon Silver 4410Y 12C 2.0 GHz (SL: 1)"
      },
      {
        "key": "Chế độ lắp đặt",
        "value": "Independent Mode Installation (SL: 1)"
      },
      {
        "key": "Bộ nhớ trong (RAM)",
        "value": "32GB (1x32GB) 1Rx4 DDR5-4800 R ECC (SL: 2)"
      },
      {
        "key": "Ổ đĩa quang",
        "value": "DVD-RW supermulti ultraslim SATA (SL: 1)"
      },
      {
        "key": "Ổ đĩa cứng thể rắn",
        "value": "SSD SATA 6G 240GB Read-Int. 2.5' H-P EP (SL: 2)"
      },
      {
        "key": "Card điều khiển RAID",
        "value": "PRAID CP500i LP (SL: 1)"
      },
      {
        "key": "Card giao tiếp SAN Quang",
        "value": "PFC EP LPe31002 2x 16Gb Emulex LP (SL: 1)"
      },
      {
        "key": "Card mạng LAN",
        "value": "PLAN CP 4x1Gbit Cu Intel I350-T4 OCPV3 (SL: 1)"
      },
      {
        "key": "Bộ thanh ray gắn tủ rack",
        "value": "RMK F1 Slimline, Slide-In Rail, QRL (SL: 1)"
      },
      {
        "key": "Bộ phụ kiện vùng",
        "value": "region kit APAC/EMEA/India (SL: 1)"
      },
      {
        "key": "Gói quản trị máy chủ từ xa",
        "value": "iRMC advanced pack (SL: 1)"
      },
      {
        "key": "Thẻ nhớ lưu trữ iRMC",
        "value": "iRMC MicroSD card 64GB (SL: 1)"
      },
      {
        "key": "Giấy phép quản trị iRMC eLCM",
        "value": "iRMCS6 eLCM Activation License preloaded (SL: 1)"
      },
      {
        "key": "Bộ nguồn dự phòng",
        "value": "Modular PSU 900W titanium hp (SL: 2)"
      },
      {
        "key": "Cáp nguồn rack",
        "value": "Cable powercord rack, 2.5m, black (SL: 2)"
      },
      {
        "key": "Mặt nạ bảo vệ mặt trước",
        "value": "Front Bezel on front Base (SL: 1)"
      },
      {
        "key": "Chip an toàn bảo mật",
        "value": "TPM 2.0 Module V1 (SL: 1)"
      },
      {
        "key": "Chính sách bảo hành",
        "value": "Warranty 3 Year Onsite 8x6xNBD (SL: 1)"
      }
    ]
  },
  {
    "key": "fujitsu_et_dx200s5_et205sau",
    "name": "Thiết bị lưu trữ Fujitsu ET DX200S5 Base 2.5 (ET205SAU)",
    "model": "ET DX200S5 Base 2.5",
    "brand": "Fujitsu",
    "origin": "Nhật Bản",
    "unit": "Bộ",
    "cat": "thiet_bi_luu_tru",
    "price": 0,
    "warranty": "3 Year Onsite 8x6xNBD",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Khay ổ đĩa mở rộng (Drive Enclosure)",
        "value": "ET DX1/200S5 DriveEncl. 3.5 IO Mod. x2 (SL: 1)"
      },
      {
        "key": "Bộ nhớ đệm Controller (Cache)",
        "value": "DX200S5 64G Mem.set 1Contr32x2DIM (SL: 2)"
      },
      {
        "key": "Bộ điều khiển Controller (FC 16Gbps)",
        "value": "DX200S5 Contr.x1 FC 4Port 16G (SL: 2)"
      },
      {
        "key": "Ổ cứng SAS 2.5 inch tốc độ cao",
        "value": "DX1/200S5 HD SAS 2.4TB 10k 2.5 AF (SL: 5)"
      },
      {
        "key": "Ổ cứng NL SAS 3.5 inch dung lượng lớn",
        "value": "DX1/200S5 HD NL 18TB 7.2k 3.5 AF x1 (SL: 10)"
      },
      {
        "key": "Cáp nguồn chuẩn quốc tế",
        "value": "AFS3DXS5Ent PwrCrd IEC60320 C14 3m x2 (SL: 1)"
      },
      {
        "key": "Chính sách bảo hành",
        "value": "Warranty 3 Year Onsite 8x6xNBD (SL: 1)"
      }
    ]
  },
  {
    "key": "hikvision_ds_2sh343v2",
    "name": "Camera quan sát Hikvision DS-2SH343V2",
    "model": "DS-2SH343V2",
    "brand": "Hikvision",
    "origin": "China",
    "unit": "Cái",
    "cat": "camera",
    "price": 0,
    "warranty": "24 tháng",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Loại thiết bị",
        "value": "Camera quan sát IP / Analog hồng ngoại"
      },
      {
        "key": "Độ phân giải",
        "value": "Độ phân giải cao Full HD / 2K sắc nét"
      },
      {
        "key": "Tầm quan sát hồng ngoại",
        "value": "Hồng ngoại ban đêm Smart IR 30m - 50m"
      },
      {
        "key": "Tiêu chuẩn bảo vệ",
        "value": "Chuẩn chống nước bụi IP67 lắp đặt trong nhà & ngoài trời"
      }
    ]
  },
  {
    "key": "hikvision_ds_7604nxi_k1",
    "name": "Đầu ghi hình Hikvision DS-7604NXI-K1",
    "model": "DS-7604NXI-K1",
    "brand": "Hikvision",
    "origin": "China",
    "unit": "Cái",
    "cat": "camera",
    "price": 0,
    "warranty": "24 tháng",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Chủng loại",
        "value": "Đầu ghi hình mạng NVR 4 kênh chuẩn AcuSense thông minh"
      },
      {
        "key": "Số kênh hỗ trợ",
        "value": "4 kênh camera IP, độ phân giải tối đa 12 Megapixel"
      },
      {
        "key": "Chuẩn nén video",
        "value": "H.265+ / H.265 / H.264+ / H.264 tiết kiệm băng thông"
      },
      {
        "key": "Băng thông",
        "value": "Băng thông đầu vào 40 Mbps, đầu ra 80 Mbps"
      },
      {
        "key": "Cổng xuất hình",
        "value": "1 cổng HDMI (4K UHD), 1 cổng VGA độc lập"
      },
      {
        "key": "Dung lượng lưu trữ",
        "value": "1 khe cắm ổ cứng SATA lên đến 10TB"
      },
      {
        "key": "Tính năng AI",
        "value": "Phân tích phát hiện người và phương tiện, lọc báo động giả AcuSense"
      }
    ]
  },
  {
    "key": "hikvision_ds10hkvs_vx2_1tb",
    "name": "Ổ đĩa cứng Hikvision DS10HKVS-VX2 dung lượng 1TB cho đầu ghi hình",
    "model": "DS10HKVS-VX2 1TB",
    "brand": "Hikvision",
    "origin": "China",
    "unit": "Cái",
    "cat": "thiet_bi_luu_tru",
    "price": 0,
    "warranty": "24 tháng",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Chủng loại",
        "value": "Ổ đĩa cứng chuyên dụng cho hệ thống giám sát và đầu ghi hình camera"
      },
      {
        "key": "Dung lượng",
        "value": "1TB (1.000 GB)"
      },
      {
        "key": "Giao diện kết nối",
        "value": "SATA 6Gb/s (SATA 3.0)"
      },
      {
        "key": "Kích thước ổ",
        "value": "3.5 inch tiêu chuẩn"
      },
      {
        "key": "Đặc tính hoạt động",
        "value": "Tối ưu hóa ghi hình liên tục 24/7, giảm rung chấn và chịu nhiệt"
      }
    ]
  },
  {
    "key": "nguon_ads_12fg_12n_12012epg",
    "name": "Nguồn Adapter ADS-12FG-12N 12012EPG (12V-1A / 12V-2A)",
    "model": "ADS-12FG-12N 12012EPG",
    "brand": "Honor",
    "origin": "China",
    "unit": "Cái",
    "cat": "phu_kien",
    "price": 0,
    "warranty": "12 tháng",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Loại phụ kiện",
        "value": "Bộ adapter nguồn chuyển đổi AC/DC"
      },
      {
        "key": "Điện áp vào",
        "value": "100 - 240V AC, 50/60Hz"
      },
      {
        "key": "Điện áp ra",
        "value": "12V DC ổn định"
      },
      {
        "key": "Bảo vệ an toàn",
        "value": "Tích hợp mạch bảo vệ chống quá tải, ngắn mạch và quá áp"
      }
    ]
  },
  {
    "key": "unitek_c9025bk_15m",
    "name": "Dây tín hiệu âm thanh 1-2 có đầu giắc 15m C9025BK Unitek",
    "model": "C9025BK (15m)",
    "brand": "Unitek",
    "origin": "China",
    "unit": "Sợi",
    "cat": "phu_kien",
    "price": 0,
    "warranty": "12 tháng",
    "file": "BANG BAO GIA CLEAR KHO_V2.xlsx",
    "specs": [
      {
        "key": "Chủng loại cáp",
        "value": "Cáp tín hiệu âm thanh Jack 3.5mm sang 2 RCA (Hoa sen)"
      },
      {
        "key": "Chiều dài",
        "value": "15 mét"
      },
      {
        "key": "Đầu giắc tiếp xúc",
        "value": "Đầu giắc đúc mạ vàng 24K truyền tín hiệu chuẩn, chống suy hao"
      },
      {
        "key": "Lõi dẫn tín hiệu",
        "value": "Đồng nguyên chất OFC chống oxy hóa"
      },
      {
        "key": "Lớp bọc bảo vệ",
        "value": "Vỏ nhựa PVC cao cấp dẻo dai, chống nhiễu từ trường"
      }
    ]
  }  ,
  {
  "key": "msi_pro_dp80_a14g",
  "name": "Máy tính để bàn PC MSI PRO DP80 A14G",
  "model": "MSI PRO DP80 A14G",
  "brand": "MSI",
  "origin": "Trung Quốc",
  "unit": "Bộ",
  "cat": "may_tinh",
  "price": 0,
  "warranty": "12 tháng",
  "file": "Báo Giá DP80_V1.xlsx",
  "specs": [
    {
      "key": "Thương hiệu",
      "value": "MSI (Taiwan)"
    },
    {
      "key": "Model",
      "value": "MSI PRO DP B208"
    },
    {
      "key": "Marketing Name",
      "value": "MSI PRO DP80 A14G"
    },
    {
      "key": "Xuất xứ",
      "value": "Trung Quốc"
    },
    {
      "key": "Nhãn sinh thái",
      "value": "Tuân thủ tối thiểu: EPEAT, Energy star"
    },
    {
      "key": "Processor / Bộ Vi Xử Lý",
      "value": "Intel® Core i5-14500  ( 14 Core, 20 luồng, 24M bộ nhớ đệm, lên đến 5,00 GHz)"
    },
    {
      "key": "Chipset",
      "value": "Intel® H610 Chipset"
    },
    {
      "key": "Dung lượng RAM",
      "value": "16G DDR5 4800Mhz/5600Mhz , 2 x DDR5 U-Dimm upto 64GB"
    },
    {
      "key": "Graphic / Đồ họa",
      "value": "Intel® UHD Graphics"
    },
    {
      "key": "Storage / Ổ đĩa lưu trữ",
      "value": "1x 512GB M.2 SSD (NVMe PCIe / SATA Auto switch)"
    },
    {
      "key": "Sound / Âm thanh",
      "value": "Realtek® ALC897, Built-in Speaker"
    },
    {
      "key": "Cổng I/O (Phía trước)",
      "value": "1x USB 3.2 Gen 2 upto 10Gbps Type-C\n2x USB 3.2 Gen 1 upto  5Gbps Type-A\n1x Mic-in\n1x Headphone-out\n1x Card Reader (Support SD & Micro SD Card)"
    },
    {
      "key": "Cổng I/O (Phía sau)",
      "value": "1x USB 3.2 gen 1 up to 5Gbps Type A\n4x USB 2.0 Type-A\n2x RJ45 LAN (1G / 2.5G)\n1x HDMI out (supports 4K @60Hz as specified in HDMI 2.1)\n1x DisplayPort (1.4)\n1x COM port\n1 x PS/2\n1x VGA out\n3x Audio Jack, 1x Kensington Lock, 1x Padlock"
    },
    {
      "key": "Khe mở rộng",
      "value": "1x PCIe 4.0 x16\n1x PCIe 3.0 x1"
    },
    {
      "key": "Bảo mật",
      "value": "- Vi mạch cung cấp chứng năng bảo mật: TPM 2.0.\n- Có chức năng bảo vệ BIOS, có khả năng phát hiện các thay đổi trái phép do bị tấn công hoặc hư lỗi,\n- Có công nghệ quản lý cấu hình BIOS dựa vào chứng chỉ số và mã khóa công khai đảm bảo an toàn thông tin.\n- Có tính năng ngăn chặn máy bị hoàn nguyên/khôi phục về các phiên bản BIOS cũ (tiềm tàng các lỗi, lỗ hổng bảo mật đã được phát hiện trước đó).\n- Có tính năng xóa dữ liệu an toàn trên ổ đĩa, đảm bảo dữ liệu không thể khôi phục."
    },
    {
      "key": "Kensington Lock",
      "value": "Có"
    },
    {
      "key": "PSU / Nguồn",
      "value": "TFX 300W PSU  80 Bronze Plus (ATX 12VO)"
    },
    {
      "key": "Cooling System",
      "value": "Fan Cooler"
    },
    {
      "key": "Volume / Dung tích",
      "value": "8 liter"
    },
    {
      "key": "Form thùng máy",
      "value": "SFF. Kích thước (RxDxC): 95 x 296 x 333 mm"
    },
    {
      "key": "Keyboard/Mouse",
      "value": "Wired Copilot KB+M đồng bộ thương hiệu hãng máy tính"
    },
    {
      "key": "Tính năng máy tính",
      "value": "1.\tHệ thống tích hợp Dual Lan RJ45 onboard gồm 1G & 2.5Gb nhằm tăng cường tốc độ truy suất đường truyền và cho phép người dùng và người quản trị thiết lập hạ tầng mạng  riêng biệt, nâng cao bảo mật giữa internet và local.\n2. Máy tính tích hợp hệ thống AI Engine tự học tự động phát hiện các tình huống của người dùng và điều chỉnh hiệu suất, hiệu ứng âm thanh và chế độ hiển thị cho phù hợp. Chẩn đoán hệ thống và tự động rà soát và nâng cấp Bios và phân mềm khi có bản cập nhật mới.\n3.\tCho phép người dùng kết nối máy tính, điện thoại sao lưu và chia sẽ dữ liệu quan trọng cần thiết qua M-Cloud đến các thiết bị khác như smartphone, máy tính khác\n4.\tHệ thống hiển thị và theo dõi toàn bộ thông số hệ thống CPU về tần số, nhiệt độ, tốc độ quạt, điện năng tiêu thụ theo thời gian thực\n5.\tHệ thống có khả năng tự động tìm kiếm tất cả Driver mới nhất của phần cứng như VGA, Audio, Lan, Wifi, Bluetooth...và các ứng dụng Microsoft để cập nhật theo ý muốn người dùng.\n6.\tMainboard đồng bộ thương hiệu máy tính."
    },
    {
      "key": "Chứng nhận hàng hóa đạt tiêu chuẩn",
      "value": "- ISO 9001: 2015: Hệ thống quản lý chất lượng đạt tiêu chuẩn\n- ISO 14001: 2015: Hệ thống quản lý môi trường doanh nghiệp\n- ISO / IEC 17025: Yêu cầu chung về năng lực của phòng thử nghiệm, hiệu chuẩn\n- ISO 27001:2022: Hệ thống tiêu chuẩn cho quản lý an toàn thông tin\n- ISO 45001: 2018: Hệ thống quản lý an toàn sức khỏe theo tiêu chuẩn\n- ISO 50001: 2018: Nhà sản xuất đạt tiêu chuẩn về hệ thống quản lý năng lượng\n- Sản phẩm máy tính đáp ứng tiêu chuẩn Châu Âu IECQ QC 080000: 2017 về hạn chế chất độc hại theo chỉ thị và quy định Châu Âu gồm:\n               + Phù hợp chỉ thị Châu Âu RoHS 2011/65/EU về hạn chế chất nguy hiểm trong sản phẩm thiết bị điện và điện tử (bao gồm chỉ thị 2006/66/EC về pin và pin thải).\n               + Phù hợp chỉ thị Châu Âu 94/62/EC về chất thải bao bì và đóng gói.\n- Nhà sản xuất đạt tiêu chuẩn hệ thống IATF 16949"
    }
  ],
  "sourceFile": "Báo Giá DP80_V1.xlsx"
  },
  {
  "key": "msi_pro_mp225_e12vl",
  "name": "Màn hình MSI PRO MP225 E12VL 21.45 inch Full HD 120Hz",
  "model": "PRO MP225 E12VL",
  "brand": "MSI",
  "origin": "Trung Quốc",
  "unit": "Cái",
  "cat": "man_hinh",
  "price": 0,
  "warranty": "12 tháng",
  "file": "Báo Giá DP80_V1.xlsx",
  "specs": [
    {
      "key": "Xuất xứ",
      "value": "Trung Quốc"
    },
    {
      "key": "Hãng sản xuất",
      "value": "MSI Taiwan"
    },
    {
      "key": "Model",
      "value": "PRO MP225 E12VL"
    },
    {
      "key": "Type / Size/ Kích thước",
      "value": "21.45\""
    },
    {
      "key": "Active Display Area / Vùng hiển thị (mm)",
      "value": "478.656(H) x 260.28(V)"
    },
    {
      "key": "Panel Type / Màn hình dạng",
      "value": "Phẳng"
    },
    {
      "key": "Panel / Tấm nền",
      "value": "VA"
    },
    {
      "key": "Resolution / Độ phân giải",
      "value": "1920 x 1080 (FHD)"
    },
    {
      "key": "Pixel Pitch / Kích thước điểm ảnh",
      "value": "0.2493(H) x 0.241(V)"
    },
    {
      "key": "Aspect Ratio / Tỉ lệ hình ảnh",
      "value": "16:9"
    },
    {
      "key": "Brightness (nits) / Độ sáng",
      "value": "300 cd/m²"
    },
    {
      "key": "Contrast Ratio / Độ tương phản",
      "value": "4000:1"
    },
    {
      "key": "DCR (Dynamic Contrast Ratio / Độ tương phản động",
      "value": "100000000:1"
    },
    {
      "key": "Refresh Rate / Tần số quét / Tỉ lệ làm tươi",
      "value": "120Hz"
    },
    {
      "key": "Response Time / Thời gian phản hồi",
      "value": "1ms (MPRT) / 4ms (GTG)"
    },
    {
      "key": "View Angles / Góc nhìn",
      "value": "178°(H) / 178°(V)"
    },
    {
      "key": "Surface Treatment / Chóng chói",
      "value": "Anti-glare"
    },
    {
      "key": "Display Colors / Màu hiển thị",
      "value": "16.7M"
    },
    {
      "key": "Color Bit / Bit Màu",
      "value": "8 bits"
    },
    {
      "key": "Video Interface / Cổng kết nối / Giao diện kết nối",
      "value": "1x HDMI™ 1.4b (FHD@120Hz)\n1x D-Sub (VGA)"
    },
    {
      "key": "Power Input / Điện thế đầu vào / Nguồn điện",
      "value": "100~240V, 50~60Hz"
    }
  ],
  "sourceFile": "Báo Giá DP80_V1.xlsx"
  },
  {
  "key": "msi_pro_dp80_combo",
  "name": "Bộ máy tính PC MSI PRO DP80 A14G kèm Màn hình PRO MP225 E12VL",
  "model": "MSI PRO DP80 A14G (Combo)",
  "brand": "MSI",
  "origin": "Trung Quốc",
  "unit": "Bộ",
  "cat": "may_tinh",
  "price": 26000000,
  "warranty": "12 tháng",
  "file": "Báo Giá DP80_V1.xlsx",
  "specs": [
    {
      "key": "Bộ cấu hình chào thầu",
      "value": "Máy tính để bàn PC MSI PRO DP80 A14G/ i5 14500/ RAM 16G DDR5/ SSD 512GB M.2 NVMe/ KB+M/ Màn hình MSI Pro MP225 E12VL 21.45\" Full HD 120Hz"
    },
    {
      "key": "Thương hiệu & Xuất xứ",
      "value": "MSI (Taiwan) - Xuất xứ: Trung Quốc"
    },
    {
      "key": "Processor / Bộ Vi Xử Lý",
      "value": "Intel® Core i5-14500 (14 Core, 20 luồng, 24M Cache, Turbo 5.00 GHz)"
    },
    {
      "key": "Mainboard & Chipset",
      "value": "Intel® H610 Chipset, Mainboard đồng bộ thương hiệu MSI"
    },
    {
      "key": "Bộ nhớ RAM",
      "value": "16G DDR5 4800Mhz/5600Mhz (2 x DDR5 U-Dimm hỗ trợ tối đa 64GB)"
    },
    {
      "key": "Ổ đĩa lưu trữ",
      "value": "512GB M.2 SSD (NVMe PCIe / SATA Auto switch)"
    },
    {
      "key": "Đồ họa & Âm thanh",
      "value": "Intel® UHD Graphics, Realtek® ALC897, Built-in Speaker"
    },
    {
      "key": "Cổng I/O Trước & Sau",
      "value": "Trước: 1x USB 3.2 Gen 2 Type-C, 2x USB 3.2 Gen 1 Type-A, Mic-in, Headphone-out, Card Reader SD/MicroSD\nSau: 1x USB 3.2 Gen 1 Type A, 4x USB 2.0, 2x RJ45 LAN (1G / 2.5G Dual LAN), 1x HDMI out 4K@60Hz, 1x DisplayPort 1.4, 1x COM port, 1x PS/2, 1x VGA out"
    },
    {
      "key": "Bảo mật & Tính năng AI",
      "value": "TPM 2.0 phần cứng, BIOS bảo mật chống tấn công, AI Engine tự học điều chỉnh hiệu năng và quạt làm mát, M-Cloud"
    },
    {
      "key": "Nguồn & Thùng máy",
      "value": "TFX 300W PSU 80 Bronze Plus (ATX 12VO), Thể tích 8L SFF (95 x 296 x 333 mm)"
    },
    {
      "key": "Bàn phím & Chuột",
      "value": "Wired Copilot KB+M đồng bộ thương hiệu hãng máy tính"
    },
    {
      "key": "Màn hình đi kèm",
      "value": "Màn hình MSI PRO MP225 E12VL: Kích thước 21.45 inch, Full HD (1920x1080), Tấm nền VA phẳng, Tần số quét 120Hz, Độ sáng 300 cd/m², Phản hồi 1ms/4ms, Chống chói Anti-glare, Cổng HDMI 1.4b & VGA"
    },
    {
      "key": "Tiêu chuẩn & Chứng nhận",
      "value": "EPEAT, Energy star, ISO 9001:2015, ISO 14001:2015, ISO/IEC 17025, ISO 27001:2022, ISO 45001:2018, ISO 50001:2018, IECQ QC 080000:2017, RoHS 2011/65/EU, IATF 16949"
    }
  ],
  "sourceFile": "Báo Giá DP80_V1.xlsx"
  }  ,
  {
  "key": "msi_pro_dp21",
  "name": "Máy tính để bàn Mini PC MSI PRO DP21",
  "model": "MSI PRO DP21",
  "brand": "MSI",
  "origin": "Trung Quốc",
  "unit": "Bộ",
  "cat": "may_tinh",
  "price": 0,
  "warranty": "12 tháng",
  "file": "Báo Giá DP80_V1.xlsx",
  "specs": [
    {
      "key": "Thương hiệu",
      "value": "MSI (Taiwan)"
    },
    {
      "key": "Model",
      "value": "MSI PRO DP21 13M"
    },
    {
      "key": "Marketing Name",
      "value": "MSI PRO DP21"
    },
    {
      "key": "Xuất xứ",
      "value": "Trung Quốc"
    },
    {
      "key": "Nhãn sinh thái",
      "value": "Tuân thủ tối thiểu: Energy Star, RoHS, EPEAT"
    },
    {
      "key": "Processor / Bộ Vi Xử Lý",
      "value": "Intel® Core™ i5-13400 (10 nhân, 16 luồng, 20MB Cache, xung nhịp lên đến 4.60 GHz)"
    },
    {
      "key": "Chipset",
      "value": "Intel® H610 Chipset"
    },
    {
      "key": "Dung lượng RAM",
      "value": "16GB DDR4 3200MHz, 2 x SO-DIMM upto 64GB"
    },
    {
      "key": "Graphic / Đồ họa",
      "value": "Intel® UHD Graphics 730"
    },
    {
      "key": "Storage / Ổ đĩa lưu trữ",
      "value": "1x 512GB M.2 NVMe PCIe SSD (hỗ trợ mở rộng thêm 2x khay ổ đĩa 2.5\" SATA HDD/SSD)"
    },
    {
      "key": "Sound / Âm thanh",
      "value": "Realtek® ALC897, High Definition Audio"
    },
    {
      "key": "Cổng I/O (Phía trước)",
      "value": "1x USB 3.2 Gen 2 Type-C (10Gbps)\n1x USB 3.2 Gen 2 Type-A (10Gbps)\n2x USB 2.0 Type-A\n1x Mic-in (3.5mm)\n1x Headphone-out (3.5mm)"
    },
    {
      "key": "Cổng I/O (Phía sau)",
      "value": "2x USB 3.2 Gen 1 Type-A (5Gbps)\n2x USB 2.0 Type-A\n1x RJ45 Gigabit LAN (1Gbps)\n1x HDMI out (hỗ trợ 4K @60Hz theo HDMI 2.0b)\n1x DisplayPort (1.4)\n1x COM port (RS-232)\n1x Mic-in\n1x Line-out\n1x DC Jack\n1x Kensington Lock"
    },
    {
      "key": "Kết nối không dây & mở rộng",
      "value": "Intel® Wi-Fi 6E AX211 + Bluetooth 5.3; 1x M.2 2280 PCIe SSD slot, 1x M.2 Wi-Fi slot, 2x 2.5\" Drive Bay"
    },
    {
      "key": "Bảo mật",
      "value": "- Vi mạch bảo mật chuyên dụng: dTPM 2.0 phần cứng\n- Khóa an toàn vật lý Kensington Lock\n- Hỗ trợ giải pháp bảo mật và quản lý BIOS MSI Security\n- Phần mềm MSI Cloud Center sao lưu và bảo mật dữ liệu doanh nghiệp"
    },
    {
      "key": "Kensington Lock",
      "value": "Có"
    },
    {
      "key": "PSU / Nguồn",
      "value": "Adapter 120W AC/DC Adapter chuẩn tiết kiệm điện"
    },
    {
      "key": "Cooling System",
      "value": "Silent Pro Cooling System độc quyền MSI với quạt tản nhiệt thông minh độ ồn thấp"
    },
    {
      "key": "Volume / Dung tích",
      "value": "2.3 liter (Ultra Compact Mini PC)"
    },
    {
      "key": "Form thùng máy",
      "value": "Mini PC siêu nhỏ gọn, hỗ trợ chuẩn treo VESA (75x75mm / 100x100mm). Kích thước (RxDxC): 204 x 208 x 54.8 mm, Trọng lượng: 1.27 kg"
    },
    {
      "key": "Keyboard/Mouse",
      "value": "Wired Copilot KB+M đồng bộ thương hiệu hãng máy tính MSI"
    },
    {
      "key": "Tính năng máy tính",
      "value": "1. Thiết kế siêu nhỏ gọn 2.3L cho phép đặt đứng, nằm ngang hoặc gắn trực tiếp sau lưng màn hình chuẩn VESA tiết kiệm 90% diện tích bàn làm việc.\n2. Tích hợp cổng COM (RS-232) chuyên dụng kết nối nhanh các thiết bị công nghiệp, máy POS, máy quét mã vạch, máy in bill.\n3. Hỗ trợ xuất 2 màn hình độc lập cùng lúc độ phân giải cao 4K qua cổng HDMI và DisplayPort.\n4. Phần mềm MSI Center độc quyền cho phép quản lý tài nguyên phần cứng theo thời gian thực, điều chỉnh chế độ làm việc và tự động cập nhật Driver hệ thống.\n5. Ứng dụng MSI Cloud Center sao lưu và chia sẻ dữ liệu an toàn giữa PC và thiết bị thông minh (Smartphone/Tablet) qua mạng nội bộ.\n6. Bo mạch chủ và linh kiện đồng bộ chính hãng MSI đạt độ bền tiêu chuẩn quân sự."
    },
    {
      "key": "Chứng nhận hàng hóa đạt tiêu chuẩn",
      "value": "- ISO 9001: 2015: Hệ thống quản lý chất lượng đạt tiêu chuẩn\n- ISO 14001: 2015: Hệ thống quản lý môi trường doanh nghiệp\n- ISO / IEC 17025: Yêu cầu chung về năng lực phòng thử nghiệm, hiệu chuẩn\n- ISO 27001: 2022: Hệ thống tiêu chuẩn an toàn thông tin\n- ISO 45001: 2018: Hệ thống quản lý an toàn và sức khỏe nghề nghiệp\n- ISO 50001: 2018: Hệ thống quản lý năng lượng\n- Sản phẩm máy tính đáp ứng tiêu chuẩn Châu Âu IECQ QC 080000: 2017 về hạn chế chất độc hại theo chỉ thị RoHS 2011/65/EU\n- Nhà sản xuất đạt chứng nhận IATF 16949"
    }
  ],
  "sourceFile": "Báo Giá DP80_V1.xlsx"
  }
];

/* ── KHỞI TẠO & HỢP NHẤT DỮ LIỆU SẢN PHẨM ── */
function initAdminAndMauMayCatalog() {
  try {
    // 1. Kiểm tra xem Admin có lưu danh mục tùy chỉnh trước đó không
    var savedCustom = localStorage.getItem(LS_CUSTOM_CATALOG_KEY);
    if (savedCustom) {
      try {
        var parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          CATALOG_ITEMS = parsed;
          console.log('✅ Đã nạp ' + CATALOG_ITEMS.length + ' sản phẩm từ bộ nhớ tùy chỉnh Admin!');
        }
      } catch (e) {
        console.error('Lỗi nạp custom catalog:', e);
      }
    }

    // Đảm bảo tất cả máy trong hệ thống đều để trống giá (0 đ) theo yêu cầu người dùng
    CATALOG_ITEMS.forEach(function (it) { it.price = 0; });
    if (typeof MODEL_PRESETS !== 'undefined') {
      for (var pKey in MODEL_PRESETS) {
        if (MODEL_PRESETS[pKey]) MODEL_PRESETS[pKey].price = 0;
      }
    }

    // 2. Hợp nhất chính xác 32 thiết bị từ file Word/Excel vào CATALOG_ITEMS
    var existingIds = new Set(CATALOG_ITEMS.map(function (it) { return it.id; }));
    var existingModelMap = new Map();
    CATALOG_ITEMS.forEach(function (it) {
      var m = (it.model || '').toLowerCase().trim();
      if (m) existingModelMap.set(m, it);
    });

    var addedCount = 0;
    EXTRA_MAU_MAY_DEVICES.forEach(function (dev) {
      var modL = (dev.model || '').toLowerCase().trim();
      var existing = existingModelMap.get(modL) || CATALOG_ITEMS.find(function (it) { return it.id === dev.key; });

      if (existing) {
        existing.file = dev.file;
        existing.sourceFile = dev.file;
        existing.isFromMauMay = true;
        if (!existing.specs || existing.specs.length < (dev.specs ? dev.specs.length : 0)) {
          existing.specs = dev.specs || [];
          existing.specCount = dev.specs ? dev.specs.length : 0;
        }
      } else {
        var catItem = {
          id: dev.key,
          cat: dev.cat || 'may_scan',
          presetKey: dev.key,
          name: dev.name,
          model: dev.model,
          brand: dev.brand,
          origin: dev.origin,
          price: dev.price || 0,
          qty: 1,
          warranty: dev.warranty || '12 tháng',
          unit: dev.unit || 'Cái',
          specCount: dev.specs ? dev.specs.length : 0,
          specs: dev.specs || [],
          file: dev.file,
          sourceFile: dev.file,
          isFromMauMay: true
        };
        CATALOG_ITEMS.push(catItem);
        existingIds.add(dev.key);
        existingModelMap.set(modL, catItem);
        addedCount++;
      }

      // Đăng ký vào MODEL_PRESETS để tra cứu thông số tự động
      if (typeof MODEL_PRESETS !== 'undefined') {
        MODEL_PRESETS[dev.key] = {
          name: dev.name,
          model: dev.model,
          brand: dev.brand,
          origin: dev.origin,
          warranty: dev.warranty,
          unit: dev.unit,
          price: dev.price,
          file: dev.file,
          specs: dev.specs || []
        };
      }
    });

    if (addedCount > 0) {
      console.log('✨ Đã bổ sung thành công ' + addedCount + ' máy từ Mẫu Máy & Kho vào Catalog!');
      if (savedCustom) {
        try {
          localStorage.setItem(LS_CUSTOM_CATALOG_KEY, JSON.stringify(CATALOG_ITEMS));
          console.log('💾 Đã tự động cập nhật sản phẩm mới vào bộ nhớ trình duyệt!');
        } catch (e) {}
      }
    }

    // 3. Nâng cấp bộ phân loại Brand & Phân hệ (classifyCatalogItem)
    patchCatalogClassifier();

    // 4. Cấu hình ẩn danh sách máy theo yêu cầu - chỉ hiện khi tìm kiếm
    patchCatalogSearchAndHiding();

    // 4. Cập nhật lại giao diện Tab Dự Toán
    if (typeof renderBrandAndSubNav === 'function') renderBrandAndSubNav();
    if (typeof renderCatalogGrid === 'function') renderCatalogGrid();
  } catch (err) {
    console.error('Lỗi khi khởi tạo Admin & Mẫu Máy Catalog:', err);
  }
}

function patchCatalogClassifier() {
  if (typeof classifyCatalogItem !== 'function') return;
  var _origClassify = classifyCatalogItem;

  classifyCatalogItem = function (item) {
    var b = (item.brand || item.manufacturer || '').trim();
    var bL = b.toLowerCase();
    var m = (item.model || '').toLowerCase();
    var n = (item.name || '').toLowerCase();
    var c = item.cat || '';

    // Ricoh Scanners
    if (bL === 'ricoh') {
      if (c === 'may_scan' || n.includes('máy scan') || n.includes('máy quét') || m.startsWith('fi-') || m.startsWith('sp-') || m.startsWith('sp1') || m.startsWith('sp2') || m.startsWith('ix') || m.includes('scansnap') || m.includes('sv600') || m.includes('flatbed')) {
        if (m.includes('8820') || m.includes('8930') || m.includes('8950') || m.includes('7600') || m.includes('7700') || m.includes('7800') || m.includes('7900')) {
          return { brandGroup: "Ricoh", brandIcon: "🔴", brandLabel: "Ricoh", subCatId: "ricoh_scan_ind", subCatName: "🏭 Máy quét công nghiệp A3 (fi-Industrial)", seriesName: "Ricoh fi Production" };
        }
        if (m.includes('ix') || m.includes('sv600') || m.includes('scansnap') || m.includes('s1300')) {
          return { brandGroup: "Ricoh", brandIcon: "🔴", brandLabel: "Ricoh", subCatId: "ricoh_scansnap", subCatName: "📱 Máy quét tài liệu cá nhân (ScanSnap)", seriesName: "Ricoh ScanSnap" };
        }
        if (m.startsWith('sp-') || m.startsWith('sp1') || m.startsWith('sp2')) {
          return { brandGroup: "Ricoh", brandIcon: "🔴", brandLabel: "Ricoh", subCatId: "ricoh_scan_sp", subCatName: "⚡ Máy quét phổ thông văn phòng (SP Series)", seriesName: "Ricoh SP Scanner" };
        }
        if (m.includes('flatbed')) {
          return { brandGroup: "Ricoh", brandIcon: "🔴", brandLabel: "Ricoh", subCatId: "ricoh_flatbed", subCatName: "📑 Phụ kiện mặt gương phẳng rời (Flatbed)", seriesName: "Ricoh Flatbed Unit" };
        }
        return { brandGroup: "Ricoh", brandIcon: "🔴", brandLabel: "Ricoh", subCatId: "ricoh_scan_fi", subCatName: "📄 Máy quét chuyên dụng A4/A3 (fi-Series)", seriesName: "Ricoh fi Scanner" };
      }
    }

    // ROWE Large Format Scanner
    if (bL === 'rowe' || m.includes('rowe') || n.includes('rowe')) {
      return { brandGroup: "Thiết bị mạng & Hội nghị", brandIcon: "📐", brandLabel: "Mạng & Khác", subCatId: "rowe_scanner", subCatName: "📐 Máy quét bản vẽ khổ lớn A0 (ROWE)", seriesName: "ROWE Large Format" };
    }

    // FUJITSU (Laptop, Server PRIMERGY, Storage ETERNUS)
    if (bL === 'fujitsu' || n.includes('fujitsu') || m.includes('fujitsu')) {
      if (c === 'may_tinh' || n.includes('lifebook') || m.includes('lifebook') || n.includes('xách tay') || n.includes('laptop')) {
        return { brandGroup: "Fujitsu", brandIcon: "💻", brandLabel: "Fujitsu", subCatId: "fujitsu_laptop", subCatName: "💻 Máy tính xách tay (Fujitsu Lifebook)", seriesName: "Fujitsu Lifebook" };
      }
      if (c === 'may_chu' || n.includes('máy chủ') || n.includes('server') || m.includes('rx') || n.includes('rx2540') || n.includes('rx1330') || n.includes('rx2530')) {
        return { brandGroup: "Fujitsu", brandIcon: "🖥️", brandLabel: "Fujitsu", subCatId: "fujitsu_server", subCatName: "🖥️ Máy chủ Server (Fujitsu PRIMERGY)", seriesName: "Fujitsu PRIMERGY" };
      }
      if (c === 'thiet_bi_luu_tru' || n.includes('lưu trữ') || m.includes('dx') || n.includes('dx200') || n.includes('eternus')) {
        return { brandGroup: "Fujitsu", brandIcon: "💾", brandLabel: "Fujitsu", subCatId: "fujitsu_storage", subCatName: "💾 Thiết bị lưu trữ SAN (Fujitsu ETERNUS)", seriesName: "Fujitsu ETERNUS" };
      }
      return { brandGroup: "Fujitsu", brandIcon: "🇯🇵", brandLabel: "Fujitsu", subCatId: "fujitsu_other", subCatName: "📑 Thiết bị Fujitsu khác", seriesName: "Fujitsu Device" };
    }

    // HIKVISION (Camera, NVR, Ổ cứng giám sát)
    if (bL === 'hikvision' || n.includes('hikvision') || m.includes('hikvision')) {
      if (c === 'camera' || n.includes('camera') || n.includes('đầu ghi') || m.startsWith('ds-') || m.includes('7604') || m.includes('343')) {
        return { brandGroup: "Hikvision", brandIcon: "📹", brandLabel: "Hikvision", subCatId: "hikvision_cctv", subCatName: "📹 Camera & Đầu ghi hình (Hikvision)", seriesName: "Hikvision Security" };
      }
      if (c === 'thiet_bi_luu_tru' || n.includes('ổ đĩa') || n.includes('ổ cứng')) {
        return { brandGroup: "Hikvision", brandIcon: "💾", brandLabel: "Hikvision", subCatId: "hikvision_storage", subCatName: "💾 Ổ cứng chuyên dụng camera (Hikvision)", seriesName: "Hikvision Surveillance HDD" };
      }
      return { brandGroup: "Hikvision", brandIcon: "📹", brandLabel: "Hikvision", subCatId: "hikvision_other", subCatName: "📑 Thiết bị Hikvision khác", seriesName: "Hikvision Device" };
    }

    // MSI (PC PRO DP80 A14G, DP180, Cubi NUC, Màn hình PRO MP225 E12VL...)
    if (bL === 'msi' || n.includes('msi') || m.includes('msi') || m.includes('dp80') || m.includes('dp21') || m.includes('mp225')) {
      if (c === 'man_hinh' || n.includes('màn hình') || m.includes('mp225') || m.includes('mp241')) {
        return { brandGroup: "MSI", brandIcon: "🖥️", brandLabel: "MSI", subCatId: "msi_screen", subCatName: "🖥️ Màn hình hiển thị (MSI PRO Series)", seriesName: "MSI PRO Monitor" };
      }
      if (c === 'may_tinh' || n.includes('máy tính') || n.includes('pc') || m.includes('dp80') || m.includes('dp21') || m.includes('dp180') || m.includes('cubi')) {
        return { brandGroup: "MSI", brandIcon: "💻", brandLabel: "MSI", subCatId: "msi_pc", subCatName: "💻 Máy tính để bàn & Đồng bộ (MSI PRO Series)", seriesName: "MSI PRO Desktop" };
      }
      return { brandGroup: "MSI", brandIcon: "💻", brandLabel: "MSI", subCatId: "msi_other", subCatName: "📑 Thiết bị MSI", seriesName: "MSI Device" };
    }

    return _origClassify(item);
  };
}

/* ── HOOK VÀO SWITCH MAIN TAB ── */
var _coreSwitchMainTab = typeof switchMainTab === 'function' ? switchMainTab : (typeof window !== 'undefined' ? window.switchMainTab : null);

switchMainTab = function (tab) {
  if (tab === 'admin') {
    currentActiveTab = 'admin';
    document.querySelectorAll('.mtab').forEach(function (el) { el.classList.remove('active'); });
    var tabAdmin = document.getElementById('mtab-admin');
    if (tabAdmin) tabAdmin.classList.add('active');

    // Ẩn tất cả các view công khai
    ['view-dutoan', 'view-bbbg', 'view-tddu', 'view-baogia', 'view-lichsu', 'view-huongdan'].forEach(function (vid) {
      var el = document.getElementById(vid);
      if (el) el.style.display = 'none';
    });

    var adminShell = document.getElementById('admin-shell');
    if (adminShell) adminShell.style.display = 'block';

    if (!adminIsUnlocked) {
      // Luôn yêu cầu mật khẩu khi vào Quản trị hệ thống (không hiển thị mật khẩu trên giao diện)
      var lockScreen = document.getElementById('admin-lock-screen');
      if (lockScreen) lockScreen.style.display = 'block';
      var workspace = document.getElementById('admin-workspace');
      if (workspace) workspace.style.display = 'none';

      var statusEl = document.getElementById('menubarActiveTabStatus');
      if (statusEl) statusEl.innerHTML = '<span class="pulse-dot" style="background:#ef4444"></span> Đang ở: <b>🔒 Xác Thực Quản Trị Hệ Thống</b>';

      var quickBtn = document.getElementById('btnMenuQuickAction');
      if (quickBtn) quickBtn.innerHTML = '🔒 Nhập Mật Khẩu Admin';

      setTimeout(function () {
        var inp = document.getElementById('adminPagePassInput');
        if (inp) {
          inp.value = '';
          inp.focus();
        }
      }, 50);
    } else {
      // Đã mở khóa -> vào thẳng giao diện quản trị
      var lockScreen = document.getElementById('admin-lock-screen');
      if (lockScreen) lockScreen.style.display = 'none';
      var workspace = document.getElementById('admin-workspace');
      if (workspace) workspace.style.display = 'block';

      var catView = document.getElementById('admin-subview-catalog');
      if (catView) {
        catView.style.display = 'block';
        renderAdminDashboard(catView);
      }

      var statusEl = document.getElementById('menubarActiveTabStatus');
      if (statusEl) statusEl.innerHTML = '<span class="pulse-dot" style="background:#ef4444"></span> Đang ở: <b>⚙️ Quản Trị Hệ Thống</b>';

      var quickBtn = document.getElementById('btnMenuQuickAction');
      if (quickBtn) quickBtn.innerHTML = '📊 Xuất Excel Tất Cả Thiết Bị';
    }

    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { }
    return;
  }

  // Khi chuyển sang các tab khác (1. Dự Toán, 2. Báo Giá, 3. Tuyên Bố, 4. Biên Bản, 5. Lịch Sử, 6. Hướng Dẫn)
  // Tự động KHÓA phiên Quản trị hệ thống để bảo mật
  adminIsUnlocked = false;
  sessionStorage.removeItem('admin_authenticated');

  var adminShell = document.getElementById('admin-shell');
  if (adminShell) adminShell.style.display = 'none';
  var av = document.getElementById('view-admin');
  if (av) av.style.display = 'none';

  if (typeof _coreSwitchMainTab === 'function') {
    _coreSwitchMainTab(tab);
  }
};
if (typeof window !== 'undefined') {
  window.switchMainTab = switchMainTab;
}

function isAdminLoggedIn() {
  return adminIsUnlocked === true;
}

/* ── XÁC THỰC MẬT KHẨU ADMIN ── */
function submitAdminPassword() {
  var inp = document.getElementById('adminPagePassInput');
  if (!inp) return;
  var val = inp.value.trim();
  if (val === '2208' || val === ADMIN_PASSWORD_VAL) {
    adminIsUnlocked = true;
    sessionStorage.setItem('admin_authenticated', 'true');
    toast('🔓 Mở khóa Quản trị thành công!', 'ok');
    switchMainTab('admin');
  } else {
    toast('❌ Mật khẩu không chính xác! Vui lòng thử lại.', 'err');
    inp.value = '';
    inp.focus();
    inp.style.borderColor = '#ef4444';
  }
}

/* ── KHÓA & ĐĂNG XUẤT ADMIN ── */
function adminLogout() {
  adminIsUnlocked = false;
  sessionStorage.removeItem('admin_authenticated');
  toast('🔒 Đã khóa phiên Quản trị hệ thống!', 'ok');
  switchMainTab('dutoan');
}

/* ── HOOK VÀO MENU QUICK EXPORT ── */
var _coreMenuQuickExport = typeof menuQuickExport === 'function' ? menuQuickExport : (typeof window !== 'undefined' ? window.menuQuickExport : null);
menuQuickExport = function () {
  if (currentActiveTab === 'admin') {
    adminExportAllDevicesExcel();
    return;
  }
  if (typeof _coreMenuQuickExport === 'function') {
    _coreMenuQuickExport();
  }
};
if (typeof window !== 'undefined') {
  window.menuQuickExport = menuQuickExport;
}

function checkAndRenderAdminView() {
  switchMainTab('admin');
}

if (typeof window !== 'undefined') {
  window.isAdminLoggedIn = isAdminLoggedIn;
  window.submitAdminPassword = submitAdminPassword;
  window.adminLogout = adminLogout;
  window.checkAndRenderAdminView = checkAndRenderAdminView;
  window.adminExportAllDevicesExcel = adminExportAllDevicesExcel;
}

/* ── BẢNG ĐIỀU KHIỂN ADMIN QUẢN LÝ SẢN PHẨM (ĐẦY ĐỦ: TÌM KIẾM, CHỈNH SỬA, KHÓA, XÓA) ── */
function renderAdminDashboard(container) {
  if (!container) {
    container = document.getElementById('admin-subview-catalog') || document.getElementById('view-admin');
  }
  if (!container) return;

  var totalCount = CATALOG_ITEMS.length;
  var lockedCount = CATALOG_ITEMS.filter(function (it) { return !!it.isLocked; }).length;
  var activeCount = totalCount - lockedCount;
  var wordExcelCount = CATALOG_ITEMS.filter(function (it) {
    return it.isFromMauMay || it.file || it.sourceFile;
  }).length;

  // Lọc sản phẩm theo tất cả các tiêu chí (KHÔNG ẨN DANH SÁCH - LUÔN HIỂN THỊ)
  var filtered = CATALOG_ITEMS.filter(function (it) {
    // Lọc theo nguồn
    if (adminCurrentSource === 'word_excel') {
      if (!(it.isFromMauMay || it.file || it.sourceFile)) return false;
    }
    // Lọc theo trạng thái Khóa / Mở
    if (adminCurrentStatus === 'active' && it.isLocked) return false;
    if (adminCurrentStatus === 'locked' && !it.isLocked) return false;

    // Lọc theo Hãng
    if (adminCurrentBrand && (it.brand || '').toLowerCase() !== adminCurrentBrand.toLowerCase()) {
      return false;
    }
    // Lọc theo Phân loại
    if (adminCurrentCat && it.cat !== adminCurrentCat) {
      return false;
    }
    // Tìm kiếm thông minh (Fuzzy keyword: 'dp 80' khớp 'DP80', không dấu, bỏ khoảng trắng)
    if (adminCurrentSearch && adminCurrentSearch.trim()) {
      var text = (it.name || '') + ' ' + (it.model || '') + ' ' + (it.brand || '') + ' ' + (it.origin || '') + ' ' + (it.file || it.sourceFile || '');
      if (!matchFuzzyKw(text, adminCurrentSearch)) return false;
    }
    return true;
  });

  // Danh sách các Hãng để lọc
  var allBrands = Array.from(new Set(CATALOG_ITEMS.map(function (it) { return it.brand; }).filter(Boolean))).sort();

  var html =
    '<div class="admin-page-wrap" style="padding:16px 20px;max-width:1440px;margin:0 auto">' +
    '  <!-- HEADER BAR -->' +
    '  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding-bottom:16px;border-bottom:1.5px solid var(--bdr2)">' +
    '    <div>' +
    '      <div style="font-size:22px;font-weight:900;color:var(--t1);letter-spacing:0.5px">⚙️ TRUNG TÂM QUẢN TRỊ HỆ THỐNG</div>' +
    '      <div style="font-size:13px;color:var(--t2);margin-top:3px">' +
    '        Quản trị toàn diện: Tìm kiếm thông minh, Chỉnh sửa, Khóa/Ẩn sản phẩm, Xóa và xuất dữ liệu dự toán.' +
    '      </div>' +
    '    </div>' +
    '    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
    '      <button class="btn btn-p btn-sm" onclick="adminOpenAddProductModal()" style="font-weight:800;background:var(--p);box-shadow:0 2px 6px rgba(0,0,0,0.15)">➕ Thêm sản phẩm mới</button>' +
    '      <button class="btn btn-sm" onclick="adminExportAllDevicesExcel()" style="background:#0284c7;color:#fff;font-weight:800;border:none;display:inline-flex;align-items:center;gap:5px;box-shadow:0 2px 6px rgba(2,132,199,0.3)" title="Xuất toàn bộ danh mục thiết bị và thông số kỹ thuật ra file Excel (.xlsx)">📊 Xuất Excel Tất Cả</button>' +
    '      <button class="btn btn-sm" onclick="adminSaveCatalogChanges()" style="background:#10b981;color:#fff;font-weight:800;border:none;box-shadow:0 2px 6px rgba(16,185,129,0.3)" title="Lưu toàn bộ thay đổi vào bộ nhớ trình duyệt">💾 Lưu thay đổi</button>' +
    '      <button class="btn btn-o btn-sm" onclick="adminExportJson()" title="Tải file sao lưu danh mục .json">📤 Xuất JSON</button>' +
    '      <button class="btn btn-o btn-sm" onclick="adminResetToDefault()" title="Khôi phục về danh mục sản phẩm gốc">🔄 Khôi phục gốc</button>' +
    '      <button class="btn btn-o btn-sm" onclick="adminLogout()" style="color:#ef4444;border-color:#fca5a5" title="Đăng xuất chế độ Admin">🔒 Đăng xuất</button>' +
    '    </div>' +
    '  </div>' +

    '  <!-- STATS BADGES (THỐNG KÊ NHANH) -->' +
    '  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;margin-bottom:16px">' +
    '    <div onclick="adminCurrentStatus=\'all\';adminCurrentSource=\'all\';renderAdminDashboard()" style="cursor:pointer;background:var(--card);border-radius:10px;border:1.5px solid var(--bdr2);padding:10px 14px;display:flex;align-items:center;gap:12px;transition:all 0.15s ease">' +
    '      <div style="font-size:24px">📦</div>' +
    '      <div><div style="font-size:11px;color:var(--t3);font-weight:700">TỔNG SẢN PHẨM</div><div style="font-size:18px;font-weight:900;color:var(--t1)">' + totalCount + '</div></div>' +
    '    </div>' +
    '    <div onclick="adminCurrentStatus=\'active\';renderAdminDashboard()" style="cursor:pointer;background:var(--card);border-radius:10px;border:1.5px solid #a7f3d0;padding:10px 14px;display:flex;align-items:center;gap:12px;transition:all 0.15s ease">' +
    '      <div style="font-size:24px">✅</div>' +
    '      <div><div style="font-size:11px;color:#059669;font-weight:700">ĐANG MỞ (HIỂN THỊ)</div><div style="font-size:18px;font-weight:900;color:#059669">' + activeCount + '</div></div>' +
    '    </div>' +
    '    <div onclick="adminCurrentStatus=\'locked\';renderAdminDashboard()" style="cursor:pointer;background:var(--card);border-radius:10px;border:1.5px solid ' + (lockedCount > 0 ? '#fca5a5' : 'var(--bdr2)') + ';padding:10px 14px;display:flex;align-items:center;gap:12px;transition:all 0.15s ease">' +
    '      <div style="font-size:24px">🔒</div>' +
    '      <div><div style="font-size:11px;color:#dc2626;font-weight:700">ĐANG KHÓA (ẨN)</div><div style="font-size:18px;font-weight:900;color:#dc2626">' + lockedCount + '</div></div>' +
    '    </div>' +
    '    <div onclick="adminCurrentSource=\'word_excel\';renderAdminDashboard()" style="cursor:pointer;background:var(--card);border-radius:10px;border:1.5px solid #bae6fd;padding:10px 14px;display:flex;align-items:center;gap:12px;transition:all 0.15s ease">' +
    '      <div style="font-size:24px">📑</div>' +
    '      <div><div style="font-size:11px;color:#0284c7;font-weight:700">MẪU TỪ WORD & EXCEL</div><div style="font-size:18px;font-weight:900;color:#0284c7">' + wordExcelCount + '</div></div>' +
    '    </div>' +
    '  </div>' +

    '  <!-- FILTER & SEARCH TOOLBAR -->' +
    '  <div style="background:var(--card);padding:14px;border-radius:12px;border:1.5px solid var(--bdr2);margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.03)">' +
    '    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' +
    '      <!-- Ô tìm kiếm realtime -->' +
    '      <div style="flex:2.5;min-width:260px;position:relative">' +
    '        <input type="text" id="adminSearchInput" class="form-control" style="width:100%;height:38px;padding:0 34px 0 12px;border-radius:8px;border:1px solid var(--bdr2);background:var(--bg);color:var(--t1);font-size:13px;font-weight:600" placeholder="🔍 Tìm theo Model (VD: dp 80, dp 21, mp 225...), Tên máy, Hãng..." value="' + escH(adminCurrentSearch) + '" oninput="adminCurrentSearch=this.value;renderAdminDashboard()" />' +
    (adminCurrentSearch ? '        <button onclick="adminCurrentSearch=\'\';renderAdminDashboard()" style="position:absolute;right:8px;top:8px;background:none;border:none;color:var(--t3);cursor:pointer;font-size:14px">✕</button>' : '') +
    '      </div>' +
    '      <!-- Lọc Hãng -->' +
    '      <div style="flex:1;min-width:140px">' +
    '        <select class="form-control" style="width:100%;height:38px;padding:0 10px;border-radius:8px;border:1px solid var(--bdr2);background:var(--bg);color:var(--t1);font-size:13px;cursor:pointer;font-weight:600" onchange="adminCurrentBrand=this.value;renderAdminDashboard()">' +
    '          <option value="">🏢 Tất cả hãng (' + allBrands.length + ')</option>' +
    allBrands.map(function (b) { return '<option value="' + escH(b) + '"' + (adminCurrentBrand === b ? ' selected' : '') + '>' + escH(b) + '</option>'; }).join('') +
    '        </select>' +
    '      </div>' +
    '      <!-- Lọc Phân loại -->' +
    '      <div style="flex:1;min-width:150px">' +
    '        <select class="form-control" style="width:100%;height:38px;padding:0 10px;border-radius:8px;border:1px solid var(--bdr2);background:var(--bg);color:var(--t1);font-size:13px;cursor:pointer;font-weight:600" onchange="adminCurrentCat=this.value;renderAdminDashboard()">' +
    '          <option value="">📁 Tất cả phân loại</option>' +
    '          <option value="may_tinh"' + (adminCurrentCat === 'may_tinh' ? ' selected' : '') + '>💻 Máy vi tính & Mini PC</option>' +
    '          <option value="man_hinh"' + (adminCurrentCat === 'man_hinh' ? ' selected' : '') + '>🖥️ Màn hình hiển thị</option>' +
    '          <option value="may_in"' + (adminCurrentCat === 'may_in' ? ' selected' : '') + '>🖨️ Máy in Laser</option>' +
    '          <option value="photocopy"' + (adminCurrentCat === 'photocopy' ? ' selected' : '') + '>📠 Máy Photocopy đa năng</option>' +
    '          <option value="may_scan"' + (adminCurrentCat === 'may_scan' ? ' selected' : '') + '>📄 Máy quét (Scanner)</option>' +
    '          <option value="network_av"' + (adminCurrentCat === 'network_av' ? ' selected' : '') + '>🌐 Thiết bị mạng & Hội nghị</option>' +
    '          <option value="phu_kien"' + (adminCurrentCat === 'phu_kien' ? ' selected' : '') + '>🔌 Phụ kiện & Thiết bị khác</option>' +
    '        </select>' +
    '      </div>' +
    '      <!-- Lọc Trạng thái Khóa / Mở -->' +
    '      <div style="flex:1;min-width:140px">' +
    '        <select class="form-control" style="width:100%;height:38px;padding:0 10px;border-radius:8px;border:1.5px solid ' + (adminCurrentStatus === 'locked' ? '#ef4444' : 'var(--bdr2)') + ';background:var(--bg);color:var(--t1);font-size:13px;cursor:pointer;font-weight:700" onchange="adminCurrentStatus=this.value;renderAdminDashboard()">' +
    '          <option value="all"' + (adminCurrentStatus === 'all' ? ' selected' : '') + '>🌐 Tất cả trạng thái</option>' +
    '          <option value="active"' + (adminCurrentStatus === 'active' ? ' selected' : '') + '>✅ Đang mở (hoạt động)</option>' +
    '          <option value="locked"' + (adminCurrentStatus === 'locked' ? ' selected' : '') + '>🔒 Đã khóa (ẩn)</option>' +
    '        </select>' +
    '      </div>' +
    '      <!-- Nút Reset bộ lọc -->' +
    (adminCurrentSearch || adminCurrentBrand || adminCurrentCat || adminCurrentStatus !== 'all' || adminCurrentSource !== 'all'
      ? '<button class="btn btn-o btn-sm" onclick="adminCurrentSearch=\'\';adminCurrentBrand=\'\';adminCurrentCat=\'\';adminCurrentStatus=\'all\';adminCurrentSource=\'all\';renderAdminDashboard()" style="height:38px;padding:0 12px;font-weight:700" title="Đặt lại toàn bộ bộ lọc">🔄 Xóa lọc</button>'
      : '') +
    '    </div>' +
    '  </div>' +

    '  <!-- DATA TABLE BAR INFO -->' +
    '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:12.5px;color:var(--t2)">' +
    '    <div>Đang hiển thị: <b style="color:var(--t1)">' + filtered.length + '</b> / ' + totalCount + ' sản phẩm' +
    (adminCurrentSearch ? ' (Tìm theo: "<b>' + escH(adminCurrentSearch) + '</b>")' : '') + '</div>' +
    '    <div style="font-size:11.5px;color:var(--t3)">💡 Mẹo: Bấm <b>✏️ Sửa</b> để đổi thông số; <b>🔒 Khóa</b> để ẩn máy khỏi Catalog dự toán; <b>🗑️ Xóa</b> để gỡ bỏ.</div>' +
    '  </div>' +

    '  <!-- DATA TABLE -->' +
    '  <div style="background:var(--card);border-radius:12px;border:1.5px solid var(--bdr2);overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.04)">' +
    '    <div style="max-height:720px;overflow-y:auto">' +
    '      <table class="table-admin" style="width:100%;border-collapse:collapse;font-size:12.5px;text-align:left">' +
    '        <thead>' +
    '          <tr style="background:var(--bg);position:sticky;top:0;z-index:2;box-shadow:0 1px 3px rgba(0,0,0,0.05);color:var(--t2);font-weight:800">' +
    '            <th style="padding:10px 10px;width:40px;text-align:center">STT</th>' +
    '            <th style="padding:10px 10px;width:95px;text-align:center">Trạng thái</th>' +
    '            <th style="padding:10px 12px;min-width:240px">Tên thiết bị</th>' +
    '            <th style="padding:10px 12px;width:150px">Model</th>' +
    '            <th style="padding:10px 10px;width:90px">Hãng</th>' +
    '            <th style="padding:10px 10px;width:90px">Xuất xứ</th>' +
    '            <th style="padding:10px 10px;width:65px;text-align:center">ĐVT</th>' +
    '            <th style="padding:10px 12px;width:115px;text-align:right">Giá dự toán</th>' +
    '            <th style="padding:10px 10px;width:95px;text-align:center">Thông số</th>' +
    '            <th style="padding:10px 12px;min-width:140px">Tài liệu mẫu</th>' +
    '            <th style="padding:10px 12px;width:170px;text-align:center">Thao tác</th>' +
    '          </tr>' +
    '        </thead>' +
    '        <tbody>';

  if (filtered.length === 0) {
    html += '<tr><td colspan="11" style="text-align:center;padding:48px 20px;color:var(--t2)">' +
      '<div style="font-size:36px;margin-bottom:8px">🔍</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:6px">Không tìm thấy sản phẩm nào khớp với điều kiện lọc!</div>' +
      '<div style="font-size:12.5px;color:var(--t2);margin-bottom:14px">Bạn có thể thử tìm từ khóa khác hoặc bấm nút đặt lại bộ lọc.</div>' +
      '<button class="btn btn-p btn-sm" onclick="adminCurrentSearch=\'\';adminCurrentBrand=\'\';adminCurrentCat=\'\';adminCurrentStatus=\'all\';adminCurrentSource=\'all\';renderAdminDashboard()">Hiển thị lại toàn bộ sản phẩm</button>' +
      '</td></tr>';
  } else {
    filtered.forEach(function (it, idx) {
      var realIdx = CATALOG_ITEMS.findIndex(function (x) { return x.id === it.id; });
      var specCnt = (it.specs && it.specs.length) || 0;
      var priceStr = (it.price && it.price > 0) ? it.price.toLocaleString('vi-VN') : '';
      var isLocked = !!it.isLocked;

      html +=
        '<tr style="border-bottom:1px solid var(--bdr2);transition:background 0.1s;' + (isLocked ? 'background:#fff1f2;opacity:0.85;' : '') + '" onmouseover="this.style.background=\'rgba(0,0,0,0.02)\'" onmouseout="this.style.background=\'' + (isLocked ? '#fff1f2' : 'transparent') + '\'">' +
        '  <td style="padding:8px 10px;text-align:center;color:var(--t3);font-weight:700">' + (idx + 1) + '</td>' +
        '  <!-- Cột Trạng thái -->' +
        '  <td style="padding:8px 10px;text-align:center">' +
        (isLocked
          ? '<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:10px;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;font-size:11px;font-weight:800" title="Sản phẩm đang bị khóa (Ẩn khỏi Catalog công khai)">🔒 Đã khóa</span>'
          : '<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:10px;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-size:11px;font-weight:800" title="Sản phẩm đang mở hoạt động bình thường">✅ Đang mở</span>') +
        '  </td>' +
        '  <!-- Cột Tên -->' +
        '  <td style="padding:8px 12px">' +
        '    <input type="text" class="cell-inp" style="font-weight:700;color:var(--t1)" value="' + escH(it.name || '') + '" onchange="adminUpdateProductField(' + realIdx + ', \'name\', this.value)" title="Bấm để sửa nhanh tên máy" />' +
        '  </td>' +
        '  <!-- Cột Model -->' +
        '  <td style="padding:8px 12px">' +
        '    <input type="text" class="cell-inp" style="font-weight:800;color:#0284c7;font-family:monospace" value="' + escH(it.model || '') + '" onchange="adminUpdateProductField(' + realIdx + ', \'model\', this.value)" title="Bấm để sửa nhanh Model" />' +
        '  </td>' +
        '  <!-- Cột Hãng -->' +
        '  <td style="padding:8px 10px">' +
        '    <input type="text" class="cell-inp" value="' + escH(it.brand || '') + '" onchange="adminUpdateProductField(' + realIdx + ', \'brand\', this.value)" />' +
        '  </td>' +
        '  <!-- Cột Xuất xứ -->' +
        '  <td style="padding:8px 10px">' +
        '    <input type="text" class="cell-inp" value="' + escH(it.origin || '') + '" onchange="adminUpdateProductField(' + realIdx + ', \'origin\', this.value)" />' +
        '  </td>' +
        '  <!-- Cột ĐVT -->' +
        '  <td style="padding:8px 10px;text-align:center">' +
        '    <input type="text" class="cell-inp" style="text-align:center" value="' + escH(it.unit || 'Cái') + '" onchange="adminUpdateProductField(' + realIdx + ', \'unit\', this.value)" />' +
        '  </td>' +
        '  <!-- Cột Đơn giá -->' +
        '  <td style="padding:8px 12px;text-align:right">' +
        '    <input type="text" class="cell-inp" style="text-align:right;font-weight:700;color:#059669" value="' + priceStr + '" placeholder="0" oninput="formatMoneyInput(this)" onchange="adminUpdateProductField(' + realIdx + ', \'price\', parseNum(this.value))" />' +
        '  </td>' +
        '  <!-- Cột Thông số -->' +
        '  <td style="padding:8px 10px;text-align:center">' +
        '    <button class="btn btn-sm" onclick="adminOpenSpecModal(' + realIdx + ')" style="padding:3px 8px;font-size:11.5px;border-radius:12px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;cursor:pointer;font-weight:700" title="Bấm để xem và sửa chi tiết thông số kỹ thuật">' +
        '      📋 ' + specCnt + ' tiêu chí' +
        '    </button>' +
        '  </td>' +
        '  <!-- Cột Tài liệu -->' +
        '  <td style="padding:8px 12px">' +
        ((it.file || it.sourceFile)
          ? '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-size:11px;font-weight:700" title="' + escH(it.file || it.sourceFile) + '">' + ((it.file || it.sourceFile).endsWith('.xlsx') ? '📊 ' : '📄 ') + escH(it.file || it.sourceFile) + '</span>'
          : '<span style="color:var(--t3);font-size:11px">Mặc định hệ thống</span>') +
        '  </td>' +
        '  <!-- CỘT THAO TÁC (ĐẦY ĐỦ: SỬA, KHÓA/MỞ, XÓA) -->' +
        '  <td style="padding:8px 12px;text-align:center;white-space:nowrap">' +
        '    <button class="btn btn-sm" onclick="adminOpenEditProductModal(' + realIdx + ')" style="padding:3px 8px;font-size:11.5px;background:#f1f5f9;color:#0f172a;border:1px solid #cbd5e1;font-weight:700;margin-right:4px;border-radius:6px" title="Chỉnh sửa toàn diện sản phẩm">✏️ Sửa</button>' +
        (isLocked
          ? '<button class="btn btn-sm" onclick="adminToggleLockProduct(' + realIdx + ')" style="padding:3px 8px;font-size:11.5px;background:#dcfce7;color:#15803d;border:1px solid #86efac;font-weight:700;margin-right:4px;border-radius:6px" title="Mở khóa sản phẩm để hiển thị lại trên Catalog">🔓 Mở</button>'
          : '<button class="btn btn-sm" onclick="adminToggleLockProduct(' + realIdx + ')" style="padding:3px 8px;font-size:11.5px;background:#fef3c7;color:#b45309;border:1px solid #fde68a;font-weight:700;margin-right:4px;border-radius:6px" title="Khóa sản phẩm (Ẩn khỏi Catalog bên ngoài)">🔒 Khóa</button>') +
        '    <button class="btn btn-sm" onclick="adminDeleteProduct(' + realIdx + ')" style="padding:3px 8px;font-size:11.5px;color:#ef4444;background:#fee2e2;border:1px solid #fca5a5;font-weight:700;border-radius:6px" title="Xóa vĩnh viễn thiết bị này">🗑️</button>' +
        '  </td>' +
        '</tr>';
    });
  }

  html +=
    '        </tbody>' +
    '      </table>' +
    '    </div>' +
    '  </div>' +
    '</div>';

  container.innerHTML = html;
}

/* ── CẬP NHẬT FIELD TRONG ADMIN ── */
function adminUpdateProductField(idx, field, val) {
  if (!CATALOG_ITEMS[idx]) return;
  CATALOG_ITEMS[idx][field] = val;
  if (CATALOG_ITEMS[idx].presetKey && typeof MODEL_PRESETS !== 'undefined' && MODEL_PRESETS[CATALOG_ITEMS[idx].presetKey]) {
    MODEL_PRESETS[CATALOG_ITEMS[idx].presetKey][field] = val;
  }
  toast('Đã cập nhật: ' + field, 'ok');
}

/* ── KHÓA / MỞ KHÓA SẢN PHẨM ── */
function adminToggleLockProduct(idx) {
  var it = CATALOG_ITEMS[idx];
  if (!it) return;
  it.isLocked = !it.isLocked;
  var statusText = it.isLocked ? '🔒 Đã khóa sản phẩm' : '🔓 Đã mở khóa sản phẩm';
  adminSaveCatalogChanges();
  renderAdminDashboard(document.getElementById('view-admin'));
  toast(statusText + ': ' + (it.name || it.model), 'ok');
}

/* ── XÓA SẢN PHẨM ── */
function adminDeleteProduct(idx) {
  var it = CATALOG_ITEMS[idx];
  if (!it) return;
  if (confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN sản phẩm [' + (it.name || it.model) + '] khỏi cơ sở dữ liệu? Hành động này không thể hoàn tác.')) {
    var pKey = it.presetKey || it.id;
    CATALOG_ITEMS.splice(idx, 1);
    if (pKey && typeof MODEL_PRESETS !== 'undefined' && MODEL_PRESETS[pKey]) {
      delete MODEL_PRESETS[pKey];
    }
    adminSaveCatalogChanges();
    renderAdminDashboard(document.getElementById('view-admin'));
    toast('🗑️ Đã xóa sản phẩm thành công!', 'ok');
  }
}

/* ── LƯU THAY ĐỔI VÀO LOCALSTORAGE ── */
function adminSaveCatalogChanges() {
  try {
    localStorage.setItem(LS_CUSTOM_CATALOG_KEY, JSON.stringify(CATALOG_ITEMS));
    toast('💾 Đã lưu thay đổi vào bộ nhớ hệ thống!', 'ok');
    if (typeof renderCatalogGrid === 'function') renderCatalogGrid();
    if (typeof renderBrandAndSubNav === 'function') renderBrandAndSubNav();
  } catch (e) {
    toast('❌ Lỗi khi lưu dữ liệu: ' + e.message, 'err');
  }
}

/* ── KHÔI PHỤC DANH MỤC GỐC ── */
function adminResetToDefault() {
  if (confirm('Bạn có chắc muốn khôi phục danh mục về ban đầu? Mọi tùy chỉnh chưa xuất file sẽ bị xóa.')) {
    localStorage.removeItem(LS_CUSTOM_CATALOG_KEY);
    location.reload();
  }
}

/* ═══════════════════════════════════════════════════════════════════
   MODAL CHỈNH SỬA SẢN PHẨM TOÀN DIỆN (EDIT PRODUCT MODAL)
═══════════════════════════════════════════════════════════════════ */
var adminCurrentEditingIdx = null;

function adminOpenEditProductModal(idx) {
  var it = CATALOG_ITEMS[idx];
  if (!it) return;
  adminCurrentEditingIdx = idx;

  var modal = document.getElementById('adminEditProductModal');
  if (!modal) {
    createAdminEditProductModalHtml();
    modal = document.getElementById('adminEditProductModal');
  }

  document.getElementById('editProdName').value = it.name || '';
  document.getElementById('editProdModel').value = it.model || '';
  document.getElementById('editProdBrand').value = it.brand || '';
  document.getElementById('editProdOrigin').value = it.origin || '';
  document.getElementById('editProdCat').value = it.cat || 'may_scan';
  document.getElementById('editProdUnit').value = it.unit || 'Cái';
  document.getElementById('editProdPrice').value = (it.price && it.price > 0) ? it.price.toLocaleString('vi-VN') : '0';
  document.getElementById('editProdWarranty').value = it.warranty || '12 tháng';
  document.getElementById('editProdStatus').value = it.isLocked ? 'locked' : 'active';
  document.getElementById('editProdSourceFile').value = it.file || it.sourceFile || 'Mặc định';

  modal.style.display = 'flex';
}

function closeAdminEditProductModal() {
  var modal = document.getElementById('adminEditProductModal');
  if (modal) modal.style.display = 'none';
  adminCurrentEditingIdx = null;
}

function adminSaveEditProductSubmit() {
  if (adminCurrentEditingIdx === null || !CATALOG_ITEMS[adminCurrentEditingIdx]) return;
  var it = CATALOG_ITEMS[adminCurrentEditingIdx];

  var name = (document.getElementById('editProdName') && document.getElementById('editProdName').value) || '';
  var model = (document.getElementById('editProdModel') && document.getElementById('editProdModel').value) || '';
  if (!name.trim() || !model.trim()) {
    alert('Vui lòng không để trống Tên thiết bị và Model!');
    return;
  }

  it.name = name.trim();
  it.model = model.trim();
  it.brand = (document.getElementById('editProdBrand').value || '').trim();
  it.origin = (document.getElementById('editProdOrigin').value || '').trim();
  it.cat = document.getElementById('editProdCat').value || 'may_scan';
  it.unit = (document.getElementById('editProdUnit').value || 'Cái').trim();
  it.price = parseNum(document.getElementById('editProdPrice').value || 0);
  it.warranty = (document.getElementById('editProdWarranty').value || '12 tháng').trim();
  it.isLocked = (document.getElementById('editProdStatus').value === 'locked');

  // Đồng bộ sang MODEL_PRESETS
  if (it.presetKey && typeof MODEL_PRESETS !== 'undefined' && MODEL_PRESETS[it.presetKey]) {
    MODEL_PRESETS[it.presetKey].name = it.name;
    MODEL_PRESETS[it.presetKey].model = it.model;
    MODEL_PRESETS[it.presetKey].brand = it.brand;
    MODEL_PRESETS[it.presetKey].origin = it.origin;
    MODEL_PRESETS[it.presetKey].unit = it.unit;
    MODEL_PRESETS[it.presetKey].price = it.price;
    MODEL_PRESETS[it.presetKey].warranty = it.warranty;
  }

  adminSaveCatalogChanges();
  closeAdminEditProductModal();
  renderAdminDashboard(document.getElementById('view-admin'));
  toast('💾 Đã lưu thành công sản phẩm: ' + it.name, 'ok');
}

function createAdminEditProductModalHtml() {
  var div = document.createElement('div');
  div.id = 'adminEditProductModal';
  div.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);z-index:99999;display:none;align-items:center;justify-content:center;padding:20px';
  div.innerHTML =
    '<div style="background:var(--card);width:100%;max-width:640px;border-radius:16px;border:1.5px solid var(--bdr2);box-shadow:0 20px 50px rgba(0,0,0,0.3);overflow:hidden;animation:fadeIn 0.2s ease">' +
    '  <div style="padding:16px 20px;border-bottom:1px solid var(--bdr2);display:flex;justify-content:space-between;align-items:center;background:var(--bg)">' +
    '    <div style="font-size:16px;font-weight:900;color:var(--t1)">✏️ Chỉnh sửa thông tin sản phẩm</div>' +
    '    <button onclick="closeAdminEditProductModal()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--t2)">✕</button>' +
    '  </div>' +
    '  <div style="padding:20px;max-height:75vh;overflow-y:auto">' +
    '    <div style="margin-bottom:12px">' +
    '      <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">TÊN THIẾT BỊ (*)</label>' +
    '      <input type="text" id="editProdName" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px;font-weight:700" />' +
    '    </div>' +
    '    <div style="display:flex;gap:12px;margin-bottom:12px">' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">MODEL (*)</label>' +
    '        <input type="text" id="editProdModel" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px;font-weight:800;color:#0284c7;font-family:monospace" />' +
    '      </div>' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">HÃNG SẢN XUẤT</label>' +
    '        <input type="text" id="editProdBrand" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px" />' +
    '      </div>' +
    '    </div>' +
    '    <div style="display:flex;gap:12px;margin-bottom:12px">' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">PHÂN LOẠI DANH MỤC</label>' +
    '        <select id="editProdCat" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px;font-weight:600">' +
    '          <option value="may_tinh">💻 Máy vi tính & Mini PC</option>' +
    '          <option value="man_hinh">🖥️ Màn hình hiển thị</option>' +
    '          <option value="may_in">🖨️ Máy in Laser</option>' +
    '          <option value="photocopy">📠 Máy Photocopy đa năng</option>' +
    '          <option value="may_scan">📄 Máy quét (Scanner)</option>' +
    '          <option value="network_av">🌐 Thiết bị mạng & Hội nghị</option>' +
    '          <option value="phu_kien">🔌 Phụ kiện & Thiết bị khác</option>' +
    '        </select>' +
    '      </div>' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">TRẠNG THÁI KHÓA / MỞ</label>' +
    '        <select id="editProdStatus" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1.5px solid var(--bdr2);border-radius:8px;font-weight:700">' +
    '          <option value="active">✅ Đang mở (Hiển thị ngoài Catalog)</option>' +
    '          <option value="locked">🔒 Đã khóa (Ẩn hoàn toàn khỏi Catalog)</option>' +
    '        </select>' +
    '      </div>' +
    '    </div>' +
    '    <div style="display:flex;gap:12px;margin-bottom:12px">' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">XUẤT XỨ</label>' +
    '        <input type="text" id="editProdOrigin" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px" />' +
    '      </div>' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">ĐƠN VỊ TÍNH</label>' +
    '        <input type="text" id="editProdUnit" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px" />' +
    '      </div>' +
    '    </div>' +
    '    <div style="display:flex;gap:12px;margin-bottom:12px">' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">ĐƠN GIÁ DỰ TOÁN (VNĐ)</label>' +
    '        <input type="text" id="editProdPrice" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px;font-weight:700;color:#059669" oninput="formatMoneyInput(this)" />' +
    '      </div>' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">THỜI HẠN BẢO HÀNH</label>' +
    '        <input type="text" id="editProdWarranty" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px" />' +
    '      </div>' +
    '    </div>' +
    '    <div style="margin-bottom:16px">' +
    '      <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">FILE TÀI LIỆU NGUỒN</label>' +
    '      <input type="text" id="editProdSourceFile" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px;color:var(--t3)" readonly />' +
    '    </div>' +
    '    <div style="background:var(--bg);padding:12px;border-radius:10px;display:flex;justify-content:space-between;align-items:center">' +
    '      <div><span style="font-weight:700">Thông số kỹ thuật:</span> Chỉnh sửa danh sách các tiêu chí chi tiết</div>' +
    '      <button type="button" class="btn btn-o btn-sm" onclick="closeAdminEditProductModal();adminOpenSpecModal(adminCurrentEditingIdx)">📋 Sửa thông số (Specs)</button>' +
    '    </div>' +
    '  </div>' +
    '  <div style="padding:14px 20px;border-top:1px solid var(--bdr2);background:var(--bg);display:flex;justify-content:flex-end;gap:8px">' +
    '    <button class="btn btn-o btn-sm" onclick="closeAdminEditProductModal()">Hủy</button>' +
    '    <button class="btn btn-p btn-sm" onclick="adminSaveEditProductSubmit()" style="font-weight:800">💾 Lưu thay đổi</button>' +
    '  </div>' +
    '</div>';
  document.body.appendChild(div);
}


/* ── XUẤT TẤT CẢ THIẾT BỊ THEO CHUẨN MẪU FILE DỰ TOÁN (SHEET TỔNG HỢP + TỪNG SHEET MÁY) ── */
function adminExportAllDevicesExcel() {
  if (typeof XLSX === 'undefined') {
    toast('❌ Thư viện XLSX chưa sẵn sàng, vui lòng thử lại sau giây lát!', 'err');
    return;
  }

  var allItems = CATALOG_ITEMS || [];
  if (allItems.length === 0) {
    toast('⚠️ Danh mục hiện không có thiết bị nào để xuất!', 'warn');
    return;
  }

  toast('⏳ Đang tạo file Excel Dự Toán chuẩn cho toàn bộ ' + allItems.length + ' thiết bị...', 'info');

  try {
    var wb = XLSX.utils.book_new();

    function adminMkB(c) {
      var b = { style: 'thin', color: { rgb: c || '000000' } };
      return { top: b, bottom: b, left: b, right: b };
    }

    function adminSetCell(ws, r, c, val, style) {
      var ref = XLSX.utils.encode_cell({ r: r, c: c });
      var t = typeof val === 'number' ? 'n' : 's';
      ws[ref] = { t: t, v: val, s: style };
    }

    // STYLES CHUẨN DỰ TOÁN (ĐỒNG BỘ 100% VỚI MẪU DỰ TOÁN)
    var STITLE = { font: { bold: true, name: 'Times New Roman', sz: 14, color: { rgb: '000000' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    var SORG = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, alignment: { horizontal: 'left', vertical: 'center' } };
    var SDATE = { font: { italic: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, alignment: { horizontal: 'right', vertical: 'center' } };
    var SPJ_LEFT = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, alignment: { horizontal: 'left', vertical: 'center', wrapText: true } };
    var SGP_LEFT = { font: { italic: true, bold: true, name: 'Times New Roman', sz: 10.5, color: { rgb: '333333' } }, alignment: { horizontal: 'left', vertical: 'center', wrapText: true } };

    var SH = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, fill: { patternType: 'solid', fgColor: { rgb: 'D9E1F2' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: adminMkB('000000') };
    var SAC = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: adminMkB('000000') };
    var SD = { font: { name: 'Times New Roman', sz: 11 }, border: adminMkB('000000'), alignment: { vertical: 'center', wrapText: true } };
    var SC = { font: { name: 'Times New Roman', sz: 11 }, border: adminMkB('000000'), alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
    var SN = { font: { name: 'Times New Roman', sz: 11 }, border: adminMkB('000000'), alignment: { horizontal: 'right', vertical: 'center' }, numFmt: '#,##0' };
    var SNT = { font: { bold: true, name: 'Times New Roman', sz: 11 }, border: adminMkB('000000'), alignment: { horizontal: 'right', vertical: 'center' }, numFmt: '#,##0' };

    // ══════════════════════════════════════════════════════
    // 1. SHEET "Tổng hợp" (BẢNG TỔNG HỢP DỰ TOÁN THIẾT BỊ)
    // ══════════════════════════════════════════════════════
    var wsTH = {};
    var mgTH = [];
    wsTH['!cols'] = [{ wch: 6 }, { wch: 48 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 8 }, { wch: 20 }, { wch: 20 }];
    wsTH['!rows'] = [];
    var r = 0;

    var orgEl = document.getElementById('orgN');
    var orgVal = (orgEl && orgEl.value ? orgEl.value.trim() : '') || 'CÔNG TY TNHH THƯƠNG MẠI ĐẦU TƯ VÀ SẢN XUẤT THUẬN PHÁT';
    var pjEl = document.getElementById('pjN');
    var pjVal = (pjEl && pjEl.value ? pjEl.value.trim() : '') || 'BẢNG DỰ TOÁN TOÀN BỘ DANH MỤC THIẾT BỊ HỆ THỐNG';
    var now = new Date();
    var dtFormatted = 'Ngày ' + now.getDate() + ' tháng ' + (now.getMonth() + 1) + ' năm ' + now.getFullYear();

    // Hàng 1: ĐƠN VỊ LẬP & NGÀY LẬP
    adminSetCell(wsTH, r, 0, 'ĐƠN VỊ LẬP: ' + orgVal.toUpperCase(), SORG);
    for (var c = 1; c <= 5; c++) adminSetCell(wsTH, r, c, '', SORG);
    mgTH.push({ s: { r: r, c: 0 }, e: { r: r, c: 5 } });

    adminSetCell(wsTH, r, 6, 'NGÀY LẬP: ' + dtFormatted, SDATE);
    for (var c = 7; c <= 8; c++) adminSetCell(wsTH, r, c, '', SDATE);
    mgTH.push({ s: { r: r, c: 6 }, e: { r: r, c: 8 } });
    wsTH['!rows'][r] = { hpt: 22 };
    r++;

    // Hàng 2: DỰ ÁN / GÓI THẦU
    adminSetCell(wsTH, r, 0, 'DỰ ÁN / GÓI THẦU: ' + pjVal, SPJ_LEFT);
    for (var c = 1; c <= 6; c++) adminSetCell(wsTH, r, c, '', SPJ_LEFT);
    mgTH.push({ s: { r: r, c: 0 }, e: { r: r, c: 6 } });
    wsTH['!rows'][r] = { hpt: 22 };
    r++;

    // Hàng 3: NHÓM DANH MỤC
    adminSetCell(wsTH, r, 0, 'NHÓM DANH MỤC: Toàn bộ ' + allItems.length + ' thiết bị đã chuẩn hóa trong cơ sở dữ liệu', SGP_LEFT);
    for (var c = 1; c <= 6; c++) adminSetCell(wsTH, r, c, '', SGP_LEFT);
    mgTH.push({ s: { r: r, c: 0 }, e: { r: r, c: 6 } });
    wsTH['!rows'][r] = { hpt: 20 };
    r++;

    // Spacing
    wsTH['!rows'][r] = { hpt: 8 };
    r++;

    // Hàng 4: Tiêu đề
    adminSetCell(wsTH, r, 0, 'BẢNG TỔNG HỢP DỰ TOÁN THIẾT BỊ', STITLE);
    for (var c = 1; c <= 8; c++) adminSetCell(wsTH, r, c, '', STITLE);
    mgTH.push({ s: { r: r, c: 0 }, e: { r: r, c: 8 } });
    wsTH['!rows'][r] = { hpt: 28 };
    r++;

    // Spacing
    wsTH['!rows'][r] = { hpt: 8 };
    r++;

    // Header bảng
    ['STT', 'Danh mục', 'Model', 'Hãng', 'Xuất xứ', 'ĐVT', 'SL', 'Đơn giá (Đã gồm VAT)', 'Thành tiền'].forEach(function (v, colIdx) {
      adminSetCell(wsTH, r, colIdx, v, SH);
    });
    wsTH['!rows'][r] = { hpt: 32 };
    r++;

    var dataStartRow = r;
    allItems.forEach(function (d, i) {
      var qty = d.qty || 1;
      var price = Number(d.price) || 0;
      var t = qty * price;

      adminSetCell(wsTH, r, 0, i + 1, SC);
      adminSetCell(wsTH, r, 1, d.name || '', SD);
      adminSetCell(wsTH, r, 2, d.model || '', SC);
      adminSetCell(wsTH, r, 3, d.brand || '', SC);
      adminSetCell(wsTH, r, 4, d.origin || '', SC);
      adminSetCell(wsTH, r, 5, d.unit || 'Máy', SC);
      adminSetCell(wsTH, r, 6, qty, SC);

      var gR = XLSX.utils.encode_cell({ r: r, c: 6 });
      var hR = XLSX.utils.encode_cell({ r: r, c: 7 });
      var iR = XLSX.utils.encode_cell({ r: r, c: 8 });

      if (price > 0) {
        wsTH[hR] = { t: 'n', v: price, s: SN };
        wsTH[iR] = { t: 'n', f: gR + '*' + hR, v: t, s: SN };
      } else {
        wsTH[hR] = { t: 's', v: '', s: SN };
        wsTH[iR] = { t: 's', f: 'IF(ISNUMBER(' + hR + '),' + gR + '*' + hR + ',"")', v: '', s: SN };
      }

      // HYPERLINK nhảy trực tiếp sang Sheet chi tiết số '1', '2', '3'...
      var targetSheet = String(i + 1);
      var sttRef = XLSX.utils.encode_cell({ r: r, c: 0 });
      var nameRef = XLSX.utils.encode_cell({ r: r, c: 1 });
      if (wsTH[sttRef]) wsTH[sttRef].l = { Target: "#'" + targetSheet + "'!A1" };
      if (wsTH[nameRef]) wsTH[nameRef].l = { Target: "#'" + targetSheet + "'!A1" };

      var nameLines = Math.ceil(String(d.name || '').length / 42);
      wsTH['!rows'][r] = { hpt: Math.max(24, nameLines * 18 + 6) };
      r++;
    });

    // Dòng TỔNG CỘNG
    var dataEndRow = r - 1;
    adminSetCell(wsTH, r, 0, '', SAC);
    adminSetCell(wsTH, r, 1, 'TỔNG CỘNG', SAC);
    for (var c = 2; c <= 7; c++) adminSetCell(wsTH, r, c, '', SAC);
    var sumFormula = 'SUM(I' + (dataStartRow + 1) + ':I' + (dataEndRow + 1) + ')';
    var totalVal = allItems.reduce(function (s, d) { return s + (d.qty || 1) * (d.price || 0); }, 0);
    var sumRef = XLSX.utils.encode_cell({ r: r, c: 8 });
    wsTH[sumRef] = { t: 'n', f: sumFormula, v: totalVal, s: SNT };
    wsTH['!rows'][r] = { hpt: 26 };
    r++;

    wsTH['!merges'] = mgTH;
    wsTH['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: 8 } });
    XLSX.utils.book_append_sheet(wb, wsTH, 'Tổng hợp');

    // ══════════════════════════════════════════════════════
    // 2. CÁC SHEET CHI TIẾT "1", "2", "3"... CHO TỪNG MÁY
    // ══════════════════════════════════════════════════════
    var SINFO = { font: { italic: true, name: 'Times New Roman', sz: 9.5, color: { rgb: '555555' } }, alignment: { vertical: 'center' } };
    var SH_SPEC = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, fill: { patternType: 'solid', fgColor: { rgb: 'D9E1F2' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: adminMkB('000000') };
    var SHL = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '1F3864' } }, fill: { patternType: 'solid', fgColor: { rgb: 'D9E1F2' } }, alignment: { vertical: 'center', wrapText: true }, border: adminMkB('000000') };
    var SK = { font: { bold: true, name: 'Times New Roman', sz: 11 }, border: adminMkB('000000'), alignment: { vertical: 'center', wrapText: true } };
    var SV = { font: { name: 'Times New Roman', sz: 11 }, border: adminMkB('000000'), alignment: { vertical: 'center', wrapText: true } };
    var SQ = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, fill: { patternType: 'solid', fgColor: { rgb: 'FFFF00' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: adminMkB('000000') };

    allItems.forEach(function (dev, idx) {
      var wsSP = {};
      var mgSP = [];
      wsSP['!cols'] = [{ wch: 38 }, { wch: 38 }, { wch: 38 }, { wch: 4 }, { wch: 16 }];
      wsSP['!rows'] = [];
      var sr = 0;

      // Header info on top
      var infoTxt = 'ĐƠN VỊ LẬP: ' + orgVal + '   |   MODEL: ' + (dev.model || 'N/A') + '   |   HÃNG: ' + (dev.brand || 'N/A') + '   |   XUẤT XỨ: ' + (dev.origin || 'N/A');
      adminSetCell(wsSP, sr, 0, infoTxt, SINFO);
      for (var c = 1; c <= 2; c++) adminSetCell(wsSP, sr, c, '', SINFO);
      mgSP.push({ s: { r: sr, c: 0 }, e: { r: sr, c: 2 } });
      wsSP['!rows'][sr] = { hpt: 20 };
      sr++;

      // Hàng Tiêu đề bảng: Blank (A) | Thông số kỹ thuật (B:C) | Nút QUAY LẠI (E)
      adminSetCell(wsSP, sr, 0, '', SH_SPEC);
      adminSetCell(wsSP, sr, 1, 'Thông số kỹ thuật', SH_SPEC);
      adminSetCell(wsSP, sr, 2, '', SH_SPEC);
      mgSP.push({ s: { r: sr, c: 1 }, e: { r: sr, c: 2 } });

      // Nút QUAY LẠI màu vàng nhảy về Sheet 'Tổng hợp'
      var qRef = XLSX.utils.encode_cell({ r: sr, c: 4 });
      wsSP[qRef] = { t: 's', v: 'QUAY LẠI', l: { Target: "#'Tổng hợp'!A1" }, s: SQ };
      wsSP['!rows'][sr] = { hpt: 28 };
      sr++;

      // Hàng Tên thiết bị (merged A:C)
      adminSetCell(wsSP, sr, 0, dev.name || '', SHL);
      adminSetCell(wsSP, sr, 1, '', SHL);
      adminSetCell(wsSP, sr, 2, '', SHL);
      mgSP.push({ s: { r: sr, c: 0 }, e: { r: sr, c: 2 } });
      var dNameLines = Math.ceil(String(dev.name || '').length / 60);
      wsSP['!rows'][sr] = { hpt: Math.max(26, dNameLines * 18 + 6) };
      sr++;

      // Hàng Thông số kỹ thuật chi tiết
      var devSpecs = dev.specs || [];
      if (devSpecs.length > 0) {
        devSpecs.forEach(function (sp) {
          if (!sp.key && !sp.value) return;
          adminSetCell(wsSP, sr, 0, sp.key || '', SK);
          adminSetCell(wsSP, sr, 1, sp.value || '', SV);
          adminSetCell(wsSP, sr, 2, '', SV);
          mgSP.push({ s: { r: sr, c: 1 }, e: { r: sr, c: 2 } });

          var keyLines = Math.ceil(String(sp.key || '').length / 28);
          var valLines = 0;
          String(sp.value || '').split(/\r?\n/).forEach(function (line) {
            valLines += Math.max(1, Math.ceil((line.length || 1) / 52));
          });
          var totalLines = Math.max(1, keyLines, valLines);
          wsSP['!rows'][sr] = { hpt: Math.max(22, Math.min(260, totalLines * 16 + 8)) };
          sr++;
        });
      } else {
        adminSetCell(wsSP, sr, 0, 'Thông số kỹ thuật', SK);
        adminSetCell(wsSP, sr, 1, 'Đang cập nhật tiêu chí kỹ thuật chi tiết.', SV);
        adminSetCell(wsSP, sr, 2, '', SV);
        mgSP.push({ s: { r: sr, c: 1 }, e: { r: sr, c: 2 } });
        wsSP['!rows'][sr] = { hpt: 26 };
        sr++;
      }

      wsSP['!merges'] = mgSP;
      wsSP['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: sr - 1, c: 4 } });
      XLSX.utils.book_append_sheet(wb, wsSP, String(idx + 1));
    });

    var fileName = 'DuToan_TatCa_' + allItems.length + 'ThietBi_' + (new Date().toISOString().slice(0, 10).replace(/-/g, '')) + '.xlsx';
    XLSX.writeFile(wb, fileName);

    // Ghi nhận vào Lịch Sử File
    if (typeof lsAddEntry === 'function') {
      lsAddEntry('dutoan', 'File Dự toán toàn bộ ' + allItems.length + ' thiết bị', fileName, {
        project: pjVal,
        devices: allItems.length,
        total: totalVal > 0 ? totalVal.toLocaleString('vi-VN') + ' ₫' : 'Đầy đủ thông số bóc tách'
      });
    }

    toast('📊 Đã xuất thành công file Excel Dự Toán chuẩn mẫu (' + fileName + ') gồm Sheet Tổng hợp và ' + allItems.length + ' Sheet thông số chi tiết!', 'ok');
  } catch (err) {
    console.error('Lỗi khi xuất file dự toán tất cả thiết bị:', err);
    toast('❌ Lỗi khi tạo file Excel dự toán: ' + err.message, 'err');
  }
}

/* ── XUẤT FILE JSON SAO LƯU ── */
function adminExportJson() {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(CATALOG_ITEMS, null, 2));
  var a = document.createElement('a');
  a.setAttribute("href", dataStr);
  a.setAttribute("download", "catalog_dutoan_backup_" + (new Date().toISOString().slice(0, 10)) + ".json");
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast('📤 Đã tải xuống file sao lưu JSON!', 'ok');
}

/* ═══════════════════════════════════════════════════════════════════
   MODAL CHỈNH SỬA THÔNG SỐ KỸ THUẬT CHI TIẾT (SPECS EDITOR)
═══════════════════════════════════════════════════════════════════ */
function adminOpenSpecModal(idx) {
  var it = CATALOG_ITEMS[idx];
  if (!it) return;
  adminEditingItemId = it.id;

  var modal = document.getElementById('adminSpecEditorModal');
  if (!modal) {
    createAdminSpecEditorModalHtml();
    modal = document.getElementById('adminSpecEditorModal');
  }

  document.getElementById('adminSpecModalTitle').innerText = '📝 Sửa thông số: ' + (it.name || it.model);
  document.getElementById('adminSpecModalSub').innerText = 'Model: ' + (it.model || 'N/A') + ' | Hãng: ' + (it.brand || 'N/A') + ' | ID: ' + it.id;

  renderAdminSpecList(it);
  modal.style.display = 'flex';
}

function closeAdminSpecModal() {
  var modal = document.getElementById('adminSpecEditorModal');
  if (modal) modal.style.display = 'none';
  adminEditingItemId = null;
}

function renderAdminSpecList(it) {
  var container = document.getElementById('adminSpecListArea');
  if (!container) return;

  var specs = it.specs || [];
  var html = '<table style="width:100%;border-collapse:collapse;font-size:12.5px">' +
    '<thead><tr style="background:var(--bg);color:var(--t2);font-weight:700">' +
    '  <th style="padding:8px;width:35px;text-align:center">#</th>' +
    '  <th style="padding:8px;width:240px">Tên tiêu chí (Key)</th>' +
    '  <th style="padding:8px">Thông số chi tiết (Value)</th>' +
    '  <th style="padding:8px;width:40px;text-align:center">Xóa</th>' +
    '</tr></thead><tbody>';

  if (specs.length === 0) {
    html += '<tr><td colspan="4" style="padding:20px;text-align:center;color:var(--t3)">Chưa có thông số nào. Hãy bấm nút "+ Thêm dòng thông số" bên dưới!</td></tr>';
  } else {
    specs.forEach(function (s, sIdx) {
      html += '<tr style="border-bottom:1px solid var(--bdr2)">' +
        '  <td style="padding:6px;text-align:center;color:var(--t3);font-weight:700">' + (sIdx + 1) + '</td>' +
        '  <td style="padding:6px">' +
        '    <input type="text" class="cell-inp" style="font-weight:700;color:var(--t1)" value="' + escH(s.key || '') + '" onchange="adminUpdateSpecItem(' + sIdx + ', \'key\', this.value)" placeholder="Tên tiêu chí..." />' +
        '  </td>' +
        '  <td style="padding:6px">' +
        '    <textarea class="cell-inp" style="width:100%;min-height:36px;padding:4px 8px;font-size:12px;line-height:1.4;resize:vertical" onchange="adminUpdateSpecItem(' + sIdx + ', \'value\', this.value)" placeholder="Nội dung thông số...">' + escH(s.value || '') + '</textarea>' +
        '  </td>' +
        '  <td style="padding:6px;text-align:center">' +
        '    <button style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:15px" onclick="adminDeleteSpecItem(' + sIdx + ')" title="Xóa tiêu chí này">✕</button>' +
        '  </td>' +
        '</tr>';
    });
  }

  html += '</tbody></table>';
  container.innerHTML = html;
}

function adminUpdateSpecItem(sIdx, field, val) {
  var it = CATALOG_ITEMS.find(function (x) { return x.id === adminEditingItemId; });
  if (!it || !it.specs || !it.specs[sIdx]) return;
  it.specs[sIdx][field] = val;
}

function adminDeleteSpecItem(sIdx) {
  var it = CATALOG_ITEMS.find(function (x) { return x.id === adminEditingItemId; });
  if (!it || !it.specs) return;
  it.specs.splice(sIdx, 1);
  it.specCount = it.specs.length;
  renderAdminSpecList(it);
}

function adminAddSpecRow() {
  var it = CATALOG_ITEMS.find(function (x) { return x.id === adminEditingItemId; });
  if (!it) return;
  if (!it.specs) it.specs = [];
  it.specs.push({ key: 'Tiêu chí mới', value: '' });
  it.specCount = it.specs.length;
  renderAdminSpecList(it);
}

function adminSaveSpecModal() {
  var it = CATALOG_ITEMS.find(function (x) { return x.id === adminEditingItemId; });
  if (it) {
    it.specCount = it.specs ? it.specs.length : 0;
    // Đồng bộ sang MODEL_PRESETS
    if (it.presetKey && typeof MODEL_PRESETS !== 'undefined' && MODEL_PRESETS[it.presetKey]) {
      MODEL_PRESETS[it.presetKey].specs = JSON.parse(JSON.stringify(it.specs));
    }
    adminSaveCatalogChanges();
    renderAdminDashboard(document.getElementById('view-admin'));
    closeAdminSpecModal();
    toast('✅ Đã cập nhật xong ' + it.specCount + ' tiêu chí kỹ thuật!', 'ok');
  }
}

function createAdminSpecEditorModalHtml() {
  var div = document.createElement('div');
  div.id = 'adminSpecEditorModal';
  div.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:99999;display:none;align-items:center;justify-content:center;padding:20px';
  div.innerHTML =
    '<div style="background:var(--card);width:100%;max-width:900px;max-height:90vh;border-radius:16px;border:1.5px solid var(--bdr2);box-shadow:0 20px 50px rgba(0,0,0,0.25);display:flex;flex-direction:column;overflow:hidden">' +
    '  <div style="padding:16px 20px;border-bottom:1px solid var(--bdr2);display:flex;justify-content:space-between;align-items:center;background:var(--bg)">' +
    '    <div>' +
    '      <div id="adminSpecModalTitle" style="font-size:16px;font-weight:900;color:var(--t1)">📝 Sửa thông số kỹ thuật</div>' +
    '      <div id="adminSpecModalSub" style="font-size:12px;color:var(--t2)">Model & Hãng</div>' +
    '    </div>' +
    '    <button onclick="closeAdminSpecModal()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--t2)">✕</button>' +
    '  </div>' +
    '  <div id="adminSpecListArea" style="flex:1;overflow-y:auto;padding:16px 20px"></div>' +
    '  <div style="padding:14px 20px;border-top:1px solid var(--bdr2);background:var(--bg);display:flex;justify-content:space-between;align-items:center">' +
    '    <button class="btn btn-o btn-sm" onclick="adminAddSpecRow()">➕ Thêm dòng thông số</button>' +
    '    <div style="display:flex;gap:8px">' +
    '      <button class="btn btn-o btn-sm" onclick="closeAdminSpecModal()">Đóng</button>' +
    '      <button class="btn btn-p btn-sm" onclick="adminSaveSpecModal()" style="font-weight:800">💾 Lưu thông số</button>' +
    '    </div>' +
    '  </div>' +
    '</div>';
  document.body.appendChild(div);
}

/* ═══════════════════════════════════════════════════════════════════
   MODAL THÊM SẢN PHẨM MỚI
═══════════════════════════════════════════════════════════════════ */
function adminOpenAddProductModal() {
  var modal = document.getElementById('adminAddProductModal');
  if (!modal) {
    createAdminAddProductModalHtml();
    modal = document.getElementById('adminAddProductModal');
  }
  modal.style.display = 'flex';
}

function closeAdminAddProductModal() {
  var modal = document.getElementById('adminAddProductModal');
  if (modal) modal.style.display = 'none';
}

function adminSubmitNewProduct() {
  var name = (document.getElementById('newProdName') && document.getElementById('newProdName').value) || '';
  var model = (document.getElementById('newProdModel') && document.getElementById('newProdModel').value) || '';
  var brand = (document.getElementById('newProdBrand') && document.getElementById('newProdBrand').value) || '';
  var origin = (document.getElementById('newProdOrigin') && document.getElementById('newProdOrigin').value) || '';
  var cat = (document.getElementById('newProdCat') && document.getElementById('newProdCat').value) || 'may_scan';
  var unit = (document.getElementById('newProdUnit') && document.getElementById('newProdUnit').value) || 'Cái';
  var price = parseNum((document.getElementById('newProdPrice') && document.getElementById('newProdPrice').value) || 0);

  if (!name.trim() || !model.trim()) {
    alert('Vui lòng nhập đầy đủ Tên thiết bị và Model!');
    return;
  }

  var id = 'custom_' + model.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + Date.now();
  var newDev = {
    id: id,
    cat: cat,
    presetKey: id,
    name: name.trim(),
    model: model.trim(),
    brand: brand.trim() || 'Chính hãng',
    origin: origin.trim(),
    price: price,
    qty: 1,
    warranty: '12 tháng',
    unit: unit,
    specCount: 0,
    specs: [
      { key: 'Model', value: model.trim() },
      { key: 'Hãng sản xuất', value: brand.trim() || 'Chính hãng' },
      { key: 'Xuất xứ', value: origin.trim() || 'Chính hãng' },
      { key: 'Bảo hành', value: '12 tháng' }
    ]
  };
  newDev.specCount = newDev.specs.length;

  CATALOG_ITEMS.unshift(newDev);
  if (typeof MODEL_PRESETS !== 'undefined') {
    MODEL_PRESETS[id] = newDev;
  }

  adminSaveCatalogChanges();
  closeAdminAddProductModal();
  renderAdminDashboard(document.getElementById('view-admin'));
  toast('🎉 Đã tạo mới sản phẩm: ' + name, 'ok');
}

function createAdminAddProductModalHtml() {
  var div = document.createElement('div');
  div.id = 'adminAddProductModal';
  div.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:99999;display:none;align-items:center;justify-content:center;padding:20px';
  div.innerHTML =
    '<div style="background:var(--card);width:100%;max-width:580px;border-radius:16px;border:1.5px solid var(--bdr2);box-shadow:0 20px 50px rgba(0,0,0,0.25);overflow:hidden">' +
    '  <div style="padding:16px 20px;border-bottom:1px solid var(--bdr2);display:flex;justify-content:space-between;align-items:center;background:var(--bg)">' +
    '    <div style="font-size:16px;font-weight:900;color:var(--t1)">➕ Thêm sản phẩm mới vào danh mục</div>' +
    '    <button onclick="closeAdminAddProductModal()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--t2)">✕</button>' +
    '  </div>' +
    '  <div style="padding:20px;max-height:75vh;overflow-y:auto">' +
    '    <div style="margin-bottom:12px">' +
    '      <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">TÊN THIẾT BỊ (*)</label>' +
    '      <input type="text" id="newProdName" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px" placeholder="VD: Máy scan chuyên dụng Ricoh fi-8150..." />' +
    '    </div>' +
    '    <div style="display:flex;gap:12px;margin-bottom:12px">' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">MODEL (*)</label>' +
    '        <input type="text" id="newProdModel" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px" placeholder="VD: fi-8150, PA4000x..." />' +
    '      </div>' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">HÃNG SẢN XUẤT</label>' +
    '        <input type="text" id="newProdBrand" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px" placeholder="VD: Ricoh, Kyocera, OKI..." />' +
    '      </div>' +
    '    </div>' +
    '    <div style="display:flex;gap:12px;margin-bottom:12px">' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">PHÂN LOẠI DANH MỤC</label>' +
    '        <select id="newProdCat" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px">' +
    '          <option value="may_scan">📄 Máy quét (Scanner)</option>' +
    '          <option value="may_in">🖨️ Máy in Laser</option>' +
    '          <option value="photocopy">📠 Máy Photocopy đa năng</option>' +
    '          <option value="may_tinh">💻 Máy vi tính & Laptop</option>' +
    '          <option value="man_hinh">🖥️ Màn hình hiển thị</option>' +
    '          <option value="network_av">🌐 Thiết bị mạng & Hội nghị</option>' +
    '        </select>' +
    '      </div>' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">XUẤT XỨ</label>' +
    '        <input type="text" id="newProdOrigin" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px" placeholder="VD: Indonesia, Thái Lan, Việt Nam..." />' +
    '      </div>' +
    '    </div>' +
    '    <div style="display:flex;gap:12px;margin-bottom:16px">' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">ĐƠN GIÁ DỰ TOÁN (VNĐ)</label>' +
    '        <input type="text" id="newProdPrice" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px;font-weight:700" placeholder="0" oninput="formatMoneyInput(this)" />' +
    '      </div>' +
    '      <div style="flex:1">' +
    '        <label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;color:var(--t2)">ĐƠN VỊ TÍNH</label>' +
    '        <input type="text" id="newProdUnit" class="cell-inp" style="width:100%;height:38px;padding:0 10px;border:1px solid var(--bdr2);border-radius:8px" value="Cái" />' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '  <div style="padding:14px 20px;border-top:1px solid var(--bdr2);background:var(--bg);display:flex;justify-content:flex-end;gap:8px">' +
    '    <button class="btn btn-o btn-sm" onclick="closeAdminAddProductModal()">Hủy</button>' +
    '    <button class="btn btn-p btn-sm" onclick="adminSubmitNewProduct()" style="font-weight:800">➕ Thêm vào Catalog</button>' +
    '  </div>' +
    '</div>';
  document.body.appendChild(div);
}


/* ═══════════════════════════════════════════════════════════════════
   TÙY CHỈNH ẨN TOÀN BỘ DANH SÁCH MÁY - CHỈ HIỆN KHI TÌM KIẾM MODEL/TÊN
═══════════════════════════════════════════════════════════════════ */
function patchCatalogSearchAndHiding() {
  // 1. Ẩn thanh chọn Brand/Subcategory rườm rà để giao diện tập trung hoàn toàn vào ô tìm kiếm
  var styleEl = document.getElementById('hideCatalogListsStyle');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'hideCatalogListsStyle';
    styleEl.textContent = '#catBrandNav, #catSubNav { display: none !important; }';
    document.head.appendChild(styleEl);
  }

  // 2. Hook getFilteredCatalogItems: Khi chưa nhập từ khóa tìm kiếm -> Trả về mảng rỗng []
  var _origGetFilteredCatalogItems = typeof getFilteredCatalogItems === 'function' ? getFilteredCatalogItems : null;
  getFilteredCatalogItems = function () {
    var s = document.getElementById('catSearch');
    var kw = (s ? s.value : '').toLowerCase().trim();

    // ẨN HẾT TẤT CẢ MÁY KHI CHƯA NHẬP TỪ KHÓA
    if (!kw) {
      return [];
    }

    return CATALOG_ITEMS.filter(function (item) {
      if (item.isLocked) return false; // Ẩn sản phẩm đã bị khóa trong Admin
      var itemBrand = (item.brand || item.manufacturer || '').toLowerCase();
      var itemName = (item.name || '').toLowerCase();
      var itemModel = (item.model || '').toLowerCase();
      var info = typeof classifyCatalogItem === 'function' ? classifyCatalogItem(item) : {};
      var subName = (info.subCatName || '').toLowerCase();
      var serName = (info.seriesName || '').toLowerCase();

      // Sử dụng matchFuzzyKw: 'dp 80' khớp 'DP80', không dấu, bỏ khoảng trắng
      return matchFuzzyKw(itemModel + ' ' + itemName + ' ' + itemBrand + ' ' + subName + ' ' + serName, kw);
    });
  };

  // 3. Hook renderCatalogGrid: Hiển thị giao diện hướng dẫn tìm kiếm và danh sách máy đã chọn
  var _origRenderCatalogGrid = typeof renderCatalogGrid === 'function' ? renderCatalogGrid : null;
  renderCatalogGrid = function () {
    var grid = document.getElementById('catGrid');
    if (!grid) return;

    var s = document.getElementById('catSearch');
    var kw = (s ? s.value : '').toLowerCase().trim();

    // Render thanh hiển thị các máy ĐÃ CHỌN (nếu có)
    renderSelectedItemsBanner();

    if (!kw) {
      // Khi ô tìm kiếm rỗng: ẨN TOÀN BỘ DANH SÁCH MÁY
      var quickButtonsHtml = EXTRA_MAU_MAY_DEVICES.map(function (dev) {
        return '<button type="button" class="btn btn-o btn-sm" onclick="quickSearchCatalog(\'' + escH(dev.model) + '\')" style="padding:4px 10px;font-size:12px;border-radius:16px;background:var(--card);font-weight:600" title="' + escH(dev.name) + '">' + escH(dev.model) + '</button>';
      }).join(' ');

      grid.innerHTML =
        '<div style="text-align:center;padding:36px 20px;background:var(--card);border-radius:14px;border:1.5px dashed var(--bdr2);margin:14px 0">' +
        '  <div style="font-size:38px;margin-bottom:8px">🔍</div>' +
        '  <div style="font-size:13.5px;color:var(--t2);max-width:600px;margin:0 auto 16px auto;line-height:1.5">' +
        '    Vui lòng nhập <b>Model</b> hoặc <b>Tên máy</b> vào ô tìm kiếm ở trên (VD: <b>dp 80</b>, <b>dp 21</b>, <b>mp 225</b>, <b>msi</b>) hoặc bấm chọn mẫu máy tra cứu nhanh bên dưới.' +
        '  </div>' +
        '  <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;max-width:980px;margin:0 auto">' +
        '    <span style="font-size:12px;color:var(--t3);font-weight:800">Mẫu máy tra cứu nhanh:</span>' +
        '    ' + quickButtonsHtml +
        '  </div>' +
        '</div>';
      return;
    }

    // Khi đã nhập từ khóa: Hiển thị các máy tìm được qua hàm gốc
    if (_origRenderCatalogGrid) {
      _origRenderCatalogGrid();
    }
  };
}

// Hàm hiển thị danh sách các thiết bị đã chọn ngay phía trên ô tìm kiếm
function renderSelectedItemsBanner() {
  var drawer = document.getElementById('selectedItemsDrawer');
  var tagsWrap = document.getElementById('selectedTagsWrap');
  var countEl = document.getElementById('drawerCount');
  if (!drawer || !tagsWrap) return;

  var keys = (typeof selectedCatalogItems !== 'undefined') ? Object.keys(selectedCatalogItems || {}) : [];
  if (keys.length === 0) {
    drawer.style.display = 'none';
    tagsWrap.innerHTML = '';
    return;
  }

  drawer.style.display = 'block';
  if (countEl) countEl.innerText = keys.length;

  var html = '';
  keys.forEach(function (id) {
    var obj = selectedCatalogItems[id];
    var it = obj.item;
    var q = obj.qty || 1;
    var priceStr = (it.price && it.price > 0) ? (it.price * q).toLocaleString('vi-VN') + ' đ' : 'Chưa có giá';

    html +=
      '<div style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:var(--card);border:1.5px solid var(--p);border-radius:10px;margin:4px;box-shadow:0 2px 6px rgba(0,0,0,0.06)">' +
      '  <span style="font-weight:800;color:var(--t1);font-size:13px">' + escH(it.name || it.model) + '</span>' +
      '  <span style="font-size:11px;background:#e0f2fe;color:#0369a1;padding:2px 6px;border-radius:6px;font-weight:700">Model: ' + escH(it.model) + '</span>' +
      '  <span style="font-size:12px;font-weight:700;color:#059669">' + priceStr + '</span>' +
      '  <div style="display:inline-flex;align-items:center;gap:4px;background:var(--bg);padding:2px 6px;border-radius:6px">' +
      '    <button style="border:none;background:none;cursor:pointer;font-weight:800;color:var(--t2);padding:0 4px" onclick="event.stopPropagation(); stepCatalogQty(\'' + id + '\', -1, event)">-</button>' +
      '    <span style="font-size:12px;font-weight:800;min-width:16px;text-align:center">' + q + '</span>' +
      '    <button style="border:none;background:none;cursor:pointer;font-weight:800;color:var(--t2);padding:0 4px" onclick="event.stopPropagation(); stepCatalogQty(\'' + id + '\', 1, event)">+</button>' +
      '  </div>' +
      '  <button onclick="event.stopPropagation(); toggleCatalogItem(\'' + id + '\')" style="background:none;border:none;color:#ef4444;font-size:14px;cursor:pointer;font-weight:800;padding:0 4px" title="Bỏ chọn thiết bị này">✕</button>' +
      '</div>';
  });

  html += '<div style="margin-top:8px">' +
    '  <button class="btn btn-p btn-sm" onclick="createProjectFromCatalog()" style="font-weight:800">🚀 Lập Dự Toán Với ' + keys.length + ' Thiết Bị Đã Chọn</button>' +
    '</div>';

  tagsWrap.innerHTML = html;
}

// Hàm hỗ trợ tìm kiếm nhanh từ thẻ gợi ý
window.quickSearchCatalog = function (model) {
  var s = document.getElementById('catSearch');
  if (s) {
    s.value = model;
    if (typeof filterCatalog === 'function') filterCatalog();
    s.focus();
  }
};

// Tự động khởi chạy sau khi tải DOM & main.js
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdminAndMauMayCatalog);
} else {
  initAdminAndMauMayCatalog();
}
