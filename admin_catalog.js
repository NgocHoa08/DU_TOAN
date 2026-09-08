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
var adminEditingItemId = null;

// 32 Dòng máy bổ sung đầy đủ thông số bóc tách chuẩn xác từ các file Word (.docx) và Excel (.xlsx)
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
      console.log('✨ Đã bổ sung thành công ' + addedCount + ' máy từ Mẫu Máy vào Catalog!');
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
      if (quickBtn) quickBtn.innerHTML = '💾 Lưu Thay Đổi Sản Phẩm';
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
    adminSaveCatalogChanges();
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
}

/* ── BẢNG ĐIỀU KHIỂN ADMIN QUẢN LÝ SẢN PHẨM ── */
function renderAdminDashboard(container) {
  if (!container) {
    container = document.getElementById('admin-subview-catalog') || document.getElementById('view-admin');
  }
  if (!container) return;
  var wordExcelCount = CATALOG_ITEMS.filter(function (it) {
    return it.isFromMauMay || it.file || it.sourceFile;
  }).length;

  // Nếu chưa tìm kiếm và đang ở chế độ 'all': Ẩn toàn bộ để giao diện gọn gàng
  var isSearchActive = !!adminCurrentSearch.trim() || !!adminCurrentBrand || !!adminCurrentCat || adminCurrentSource === 'word_excel';

  var filtered = !isSearchActive ? [] : CATALOG_ITEMS.filter(function (it) {
    if (adminCurrentSource === 'word_excel') {
      if (!(it.isFromMauMay || it.file || it.sourceFile)) return false;
    }
    var q = adminCurrentSearch.toLowerCase().trim();
    if (q) {
      var text = ((it.name || '') + ' ' + (it.model || '') + ' ' + (it.brand || '') + ' ' + (it.origin || '') + ' ' + (it.file || it.sourceFile || '')).toLowerCase();
      if (!text.includes(q)) return false;
    }
    if (adminCurrentBrand && (it.brand || '').toLowerCase() !== adminCurrentBrand.toLowerCase()) {
      return false;
    }
    if (adminCurrentCat && it.cat !== adminCurrentCat) {
      return false;
    }
    return true;
  });

  // Danh sách các Hãng để lọc
  var allBrands = Array.from(new Set(CATALOG_ITEMS.map(function (it) { return it.brand; }).filter(Boolean))).sort();

  var html =
    '<div class="admin-page-wrap" style="padding:16px 20px;max-width:1400px;margin:0 auto">' +
    '  <!-- HEADER BAR -->' +
    '  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;padding-bottom:16px;border-bottom:1.5px solid var(--bdr2)">' +
    '    <div>' +
    '      <div style="font-size:22px;font-weight:900;color:var(--t1);letter-spacing:0.5px">⚙️ TRUNG TÂM QUẢN TRỊ HỆ THỐNG</div>' +
    '      <div style="font-size:13px;color:var(--t2);margin-top:3px">' +
    '        Khu vực bảo mật: Quản lý hồ sơ mẫu, công cụ đồng bộ, sao lưu và danh mục thiết bị dự toán.' +
    '      </div>' +
    '    </div>' +
    '    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
    '      <button class="btn btn-p btn-sm" onclick="adminOpenAddProductModal()" style="font-weight:800">➕ Thêm sản phẩm mới</button>' +
    '      <button class="btn btn-sm" onclick="adminSaveCatalogChanges()" style="background:#10b981;color:#fff;font-weight:800;border:none" title="Lưu toàn bộ thay đổi vào bộ nhớ trình duyệt">💾 Lưu thay đổi</button>' +
    '      <button class="btn btn-o btn-sm" onclick="adminExportJson()" title="Tải file sao lưu danh mục .json">📤 Xuất JSON</button>' +
    '      <button class="btn btn-o btn-sm" onclick="adminResetToDefault()" title="Khôi phục về danh mục sản phẩm gốc">🔄 Khôi phục gốc</button>' +
    '      <button class="btn btn-o btn-sm" onclick="adminLogout()" style="color:#ef4444;border-color:#fca5a5" title="Đăng xuất chế độ Admin">🔒 Đăng xuất</button>' +
    '    </div>' +
    '  </div>' +

    '  <!-- SECTION: HỒ SƠ MẪU & CÔNG CỤ QUẢN TRỊ TOÀN DIỆN -->' +
    '  <div style="background:var(--card);border-radius:14px;border:1.5px solid var(--bdr2);padding:16px 20px;margin-bottom:20px;box-shadow:0 4px 12px rgba(0,0,0,0.03)">' +
    '    <div style="font-size:14px;font-weight:800;color:var(--t1);margin-bottom:12px;display:flex;align-items:center;gap:8px">' +
    '      <span>🧰</span> HỒ SƠ MẪU &amp; CÔNG CỤ QUẢN TRỊ HỆ THỐNG' +
    '    </div>' +
    '    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' +
    '      <div style="flex:1;min-width:200px;max-width:260px">' +
    '        <select class="form-control" style="width:100%;height:38px;padding:0 10px;border-radius:8px;border:1px solid var(--bdr2);background:var(--bg);color:var(--t1);font-size:13px;cursor:pointer;font-weight:600" onchange="if(typeof menuApplyPreset===\'function\'){menuApplyPreset(this.value);this.value=\'\';}" title="Chọn nhanh hồ sơ mẫu công ty">' +
    '          <option value="">📁 Chọn hồ sơ mẫu ▾</option>' +
    '          <option value="thuan_phat">🏢 Công ty Thuận Phát</option>' +
    '          <option value="bao_an">🏢 Công ty Bảo An</option>' +
    '          <option value="cahcm">👮 Công an TP. Hồ Chí Minh</option>' +
    '          <option value="hoa_phat">📚 Công ty Hòa Phát</option>' +
    '          <option value="ecoit">🏢 ECOIT / NETSYS</option>' +
    '        </select>' +
    '      </div>' +
    '      <button class="btn btn-o btn-sm" onclick="if(typeof menuTriggerAiScrape===\'function\')menuTriggerAiScrape()" style="height:38px;font-weight:700;display:inline-flex;align-items:center;gap:6px">' +
    '        <span>🤖</span> AI Cào Thông Số Hãng' +
    '      </button>' +
    '      <button class="btn btn-o btn-sm" onclick="if(typeof menuSyncToBaogia===\'function\')menuSyncToBaogia()" style="height:38px;font-weight:700;display:inline-flex;align-items:center;gap:6px">' +
    '        <span>🔄</span> Đồng Bộ ➔ Báo Giá' +
    '      </button>' +
    '      <button class="btn btn-o btn-sm" onclick="if(typeof exportLichSuJson===\'function\')exportLichSuJson()" style="height:38px;font-weight:700;display:inline-flex;align-items:center;gap:6px">' +
    '        <span>💾</span> Sao Lưu Dữ Liệu' +
    '      </button>' +
    '      <button class="btn btn-o btn-sm" onclick="var el=document.getElementById(\'lsImportFileInput\');if(el)el.click()" style="height:38px;font-weight:700;display:inline-flex;align-items:center;gap:6px">' +
    '        <span>📥</span> Khôi Phục Dữ Liệu' +
    '      </button>' +
    '      <button class="btn btn-sm" onclick="if(typeof openAiSettingsModal===\'function\')openAiSettingsModal()" style="height:38px;font-weight:800;display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);color:#15803d;border:1px solid #86efac;cursor:pointer">' +
    '        <span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block"></span> Cài Đặt Google Gemini AI' +
    '      </button>' +
    '    </div>' +
    '  </div>' +

    '  <!-- QUICK SOURCE TABS -->' +
    '  <div style="display:flex;gap:8px;margin-bottom:14px;align-items:center;flex-wrap:wrap">' +
    '    <span style="font-size:12px;font-weight:800;color:var(--t2);margin-right:4px">📂 Phân loại nguồn:</span>' +
    '    <button class="btn btn-sm" onclick="adminCurrentSource=\'all\'; renderAdminDashboard(document.getElementById(\'view-admin\'))" style="border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700;' + (adminCurrentSource === 'all' ? 'background:var(--p);color:#fff;border-color:var(--p);box-shadow:0 2px 6px rgba(0,0,0,0.15)' : 'background:var(--card);color:var(--t2);border:1px solid var(--bdr2)') + '">🌐 Tất cả sản phẩm (' + CATALOG_ITEMS.length + ')</button>' +
    '    <button class="btn btn-sm" onclick="adminCurrentSource=\'word_excel\'; renderAdminDashboard(document.getElementById(\'view-admin\'))" style="border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700;' + (adminCurrentSource === 'word_excel' ? 'background:#059669;color:#fff;border-color:#059669;box-shadow:0 2px 6px rgba(5,150,105,0.25)' : 'background:var(--card);color:#059669;border:1.5px solid #10b981') + '">📑 Chỉ mẫu máy từ file Word & Excel (' + wordExcelCount + ' mẫu)</button>' +
    '  </div>' +

    '  <!-- FILTER TOOLBAR -->' +
    '  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;background:var(--card);padding:12px;border-radius:12px;border:1px solid var(--bdr2)">' +
    '    <div style="flex:2;min-width:240px">' +
    '      <input type="text" class="form-control" style="width:100%;height:36px;padding:0 12px;border-radius:8px;border:1px solid var(--bdr2);background:var(--bg);color:var(--t1);font-size:13px" placeholder="🔍 Tìm kiếm theo tên máy, model, hãng, xuất xứ..." value="' + escH(adminCurrentSearch) + '" oninput="adminCurrentSearch = this.value; renderAdminDashboard(document.getElementById(\'view-admin\'))" />' +
    '    </div>' +
    '    <div style="flex:1;min-width:160px">' +
    '      <select class="form-control" style="width:100%;height:36px;padding:0 10px;border-radius:8px;border:1px solid var(--bdr2);background:var(--bg);color:var(--t1);font-size:13px;cursor:pointer" onchange="adminCurrentBrand = this.value; renderAdminDashboard(document.getElementById(\'view-admin\'))">' +
    '        <option value="">🏢 Tất cả hãng SX (' + allBrands.length + ')</option>' +
    allBrands.map(function (b) { return '<option value="' + escH(b) + '"' + (adminCurrentBrand === b ? ' selected' : '') + '>' + escH(b) + '</option>'; }).join('') +
    '      </select>' +
    '    </div>' +
    '    <div style="flex:1;min-width:160px">' +
    '      <select class="form-control" style="width:100%;height:36px;padding:0 10px;border-radius:8px;border:1px solid var(--bdr2);background:var(--bg);color:var(--t1);font-size:13px;cursor:pointer" onchange="adminCurrentCat = this.value; renderAdminDashboard(document.getElementById(\'view-admin\'))">' +
    '        <option value="">📁 Tất cả phân loại</option>' +
    '        <option value="may_scan"' + (adminCurrentCat === 'may_scan' ? ' selected' : '') + '>📄 Máy quét (Scanner)</option>' +
    '        <option value="may_in"' + (adminCurrentCat === 'may_in' ? ' selected' : '') + '>🖨️ Máy in Laser</option>' +
    '        <option value="photocopy"' + (adminCurrentCat === 'photocopy' ? ' selected' : '') + '>📠 Máy Photocopy đa chức năng</option>' +
    '        <option value="may_tinh"' + (adminCurrentCat === 'may_tinh' ? ' selected' : '') + '>💻 Máy vi tính & Laptop</option>' +
    '        <option value="man_hinh"' + (adminCurrentCat === 'man_hinh' ? ' selected' : '') + '>🖥️ Màn hình hiển thị</option>' +
    '        <option value="network_av"' + (adminCurrentCat === 'network_av' ? ' selected' : '') + '>🌐 Thiết bị mạng & Hội nghị</option>' +
    '      </select>' +
    '    </div>' +
    '  </div>' +

    '  <!-- DATA TABLE -->' +
    '  <div style="background:var(--card);border-radius:12px;border:1px solid var(--bdr2);overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.04)">' +
    '    <div style="max-height:680px;overflow-y:auto">' +
    '      <table class="table-admin" style="width:100%;border-collapse:collapse;font-size:12.5px;text-align:left">' +
    '        <thead>' +
    '          <tr style="background:var(--bg);position:sticky;top:0;z-index:2;box-shadow:0 1px 3px rgba(0,0,0,0.05);color:var(--t2);font-weight:800">' +
    '            <th style="padding:10px 12px;width:45px;text-align:center">STT</th>' +
    '            <th style="padding:10px 12px;min-width:240px">Tên thiết bị</th>' +
    '            <th style="padding:10px 12px;width:120px">Model</th>' +
    '            <th style="padding:10px 12px;width:100px">Hãng</th>' +
    '            <th style="padding:10px 12px;width:90px">Xuất xứ</th>' +
    '            <th style="padding:10px 12px;width:70px">ĐVT</th>' +
    '            <th style="padding:10px 12px;width:120px;text-align:right">Giá dự toán (đ)</th>' +
    '            <th style="padding:10px 12px;width:95px;text-align:center">Thông số</th>' +
    '            <th style="padding:10px 12px;min-width:160px">Tài liệu mẫu</th>' +
    '            <th style="padding:10px 12px;width:125px;text-align:center">Thao tác</th>' +
    '          </tr>' +
    '        </thead>' +
    '        <tbody>';

  if (filtered.length === 0) {
    if (!isSearchActive) {
      html += '<tr><td colspan="10" style="text-align:center;padding:48px 20px;color:var(--t2)">' +
        '<div style="font-size:36px;margin-bottom:8px">🔍</div>' +
        '<div style="font-size:13.5px;color:var(--t2);margin-bottom:14px">Nhập <b>Model</b> hoặc <b>Tên máy</b> vào ô tìm kiếm ở trên để hiển thị sản phẩm cần chỉnh sửa.<br>Hoặc bấm nút <b>[📑 Chỉ mẫu máy từ file Word & Excel (' + wordExcelCount + ' mẫu)]</b> để hiển thị các dòng máy mẫu.</div>' +
        '<button class="btn btn-o btn-sm" onclick="adminCurrentSource=\'word_excel\'; renderAdminDashboard(document.getElementById(\'view-admin\'))">📑 Xem 32 mẫu Word & Excel</button>' +
        '</td></tr>';
    } else {
      html += '<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--t2)">Không tìm thấy sản phẩm nào khớp với điều kiện lọc!</td></tr>';
    }
  } else {
    filtered.forEach(function (it, idx) {
      var realIdx = CATALOG_ITEMS.findIndex(function (x) { return x.id === it.id; });
      var specCnt = (it.specs && it.specs.length) || 0;
      var priceStr = (it.price && it.price > 0) ? it.price.toLocaleString('vi-VN') : '';

      html +=
        '<tr style="border-bottom:1px solid var(--bdr2);transition:background 0.1s" onmouseover="this.style.background=\'rgba(0,0,0,0.02)\'" onmouseout="this.style.background=\'transparent\'">' +
        '  <td style="padding:8px 12px;text-align:center;color:var(--t3);font-weight:700">' + (idx + 1) + '</td>' +
        '  <td style="padding:8px 12px">' +
        '    <input type="text" class="cell-inp" style="font-weight:700;color:var(--t1)" value="' + escH(it.name || '') + '" onchange="adminUpdateProductField(' + realIdx + ', \'name\', this.value)" />' +
        '  </td>' +
        '  <td style="padding:8px 12px">' +
        '    <input type="text" class="cell-inp" style="font-weight:800;color:#0284c7" value="' + escH(it.model || '') + '" onchange="adminUpdateProductField(' + realIdx + ', \'model\', this.value)" />' +
        '  </td>' +
        '  <td style="padding:8px 12px">' +
        '    <input type="text" class="cell-inp" value="' + escH(it.brand || '') + '" onchange="adminUpdateProductField(' + realIdx + ', \'brand\', this.value)" />' +
        '  </td>' +
        '  <td style="padding:8px 12px">' +
        '    <input type="text" class="cell-inp" value="' + escH(it.origin || '') + '" onchange="adminUpdateProductField(' + realIdx + ', \'origin\', this.value)" />' +
        '  </td>' +
        '  <td style="padding:8px 12px">' +
        '    <input type="text" class="cell-inp" style="text-align:center" value="' + escH(it.unit || 'Cái') + '" onchange="adminUpdateProductField(' + realIdx + ', \'unit\', this.value)" />' +
        '  </td>' +
        '  <td style="padding:8px 12px;text-align:right">' +
        '    <input type="text" class="cell-inp" style="text-align:right;font-weight:700;color:#059669" value="' + priceStr + '" placeholder="0" oninput="formatMoneyInput(this)" onchange="adminUpdateProductField(' + realIdx + ', \'price\', parseNum(this.value))" />' +
        '  </td>' +
        '  <td style="padding:8px 12px;text-align:center">' +
        '    <button class="btn btn-sm" onclick="adminOpenSpecModal(' + realIdx + ')" style="padding:2px 8px;font-size:11.5px;border-radius:12px;background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;cursor:pointer;font-weight:700" title="Bấm để xem và sửa chi tiết thông số">' +
        '      📋 ' + specCnt + ' tiêu chí' +
        '    </button>' +
        '  </td>' +
        '  <td style="padding:8px 12px">' +
        ((it.file || it.sourceFile)
          ? '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;font-size:11px;font-weight:700" title="' + escH(it.file || it.sourceFile) + '">' + ((it.file || it.sourceFile).endsWith('.xlsx') ? '📊 ' : '📄 ') + escH(it.file || it.sourceFile) + '</span>'
          : '<span style="color:var(--t3);font-size:11px">Mặc định hệ thống</span>') +
        '  </td>' +
        '  <td style="padding:8px 12px;text-align:center;white-space:nowrap">' +
        '    <button class="btn btn-o btn-sm" onclick="adminOpenSpecModal(' + realIdx + ')" style="padding:3px 7px;font-size:11.5px;margin-right:4px" title="Sửa chi tiết thông số kỹ thuật">📝 Specs</button>' +
        '    <button class="btn btn-sm" onclick="adminDeleteProduct(' + realIdx + ')" style="padding:3px 7px;font-size:11.5px;color:#ef4444;background:#fee2e2;border:1px solid #fca5a5" title="Xóa thiết bị này">🗑️</button>' +
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
  // Đồng bộ presetKey
  if (CATALOG_ITEMS[idx].presetKey && typeof MODEL_PRESETS !== 'undefined' && MODEL_PRESETS[CATALOG_ITEMS[idx].presetKey]) {
    MODEL_PRESETS[CATALOG_ITEMS[idx].presetKey][field] = val;
  }
  toast('Đã cập nhật: ' + field, 'ok');
}

/* ── XÓA SẢN PHẨM ── */
function adminDeleteProduct(idx) {
  var it = CATALOG_ITEMS[idx];
  if (!it) return;
  if (confirm('Bạn có chắc chắn muốn xóa sản phẩm [' + (it.name || it.model) + '] khỏi cơ sở dữ liệu?')) {
    CATALOG_ITEMS.splice(idx, 1);
    toast('🗑️ Đã xóa sản phẩm thành công!', 'ok');
    renderAdminDashboard(document.getElementById('view-admin'));
    if (typeof renderCatalogGrid === 'function') renderCatalogGrid();
  }
}

/* ── LƯU THAY ĐỔI VÀO LOCALSTORAGE ── */
function adminSaveCatalogChanges() {
  try {
    localStorage.setItem(LS_CUSTOM_CATALOG_KEY, JSON.stringify(CATALOG_ITEMS));
    toast('💾 Đã lưu vĩnh viễn toàn bộ ' + CATALOG_ITEMS.length + ' sản phẩm vào hệ thống!', 'ok');
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
      var itemBrand = (item.brand || item.manufacturer || '').toLowerCase();
      var itemName = (item.name || '').toLowerCase();
      var itemModel = (item.model || '').toLowerCase();
      var info = typeof classifyCatalogItem === 'function' ? classifyCatalogItem(item) : {};
      var subName = (info.subCatName || '').toLowerCase();
      var serName = (info.seriesName || '').toLowerCase();

      return itemModel.includes(kw) || itemName.includes(kw) || itemBrand.includes(kw) || subName.includes(kw) || serName.includes(kw);
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
        '    Vui lòng nhập <b>Model</b> hoặc <b>Tên máy</b> vào ô tìm kiếm ở trên để hiển thị sản phẩm và bấm chọn.' +
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
