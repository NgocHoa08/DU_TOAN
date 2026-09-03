using System;
using System.IO;

namespace ToolDuToanCSharp
{
    public static class InsertPresets
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

            string newPresets = @"      },
      'stt1_msi_dp180_ai': {
        name: 'Máy vi tính MSI PRO DP180 AI 8HG',
        model: 'PRO DP180 AI 8HG', brand: 'MSI', origin: '', warranty: '12 tháng', unit: 'Bộ', price: 0,
        specs: [
          { key: 'CPU', value: 'Intel® Core™ Ultra 5 225' },
          { key: 'RAM', value: '16GB DDR5' },
          { key: 'Ổ cứng', value: '512GB SSD' },
          { key: 'Cổng xuất hình', value: 'HDMI' },
          { key: 'Màn hình', value: '23.8 inch' },
          { key: 'Hệ điều hành', value: 'Window 11 Pro 64 bit bản quyền vĩnh viễn' },
          { key: 'Phần mềm văn phòng', value: 'Microsoft Office Home & Business 2024' },
          { key: 'Hình thức cấp phép', value: 'Key điện tử vĩnh viễn' },
          { key: 'Phần mềm diệt virus', value: 'Bản quyền 03 năm' },
          { key: 'Phụ kiện', value: 'Chuột bàn phím đi kèm' },
          { key: 'Kết nối không dây', value: 'Không (theo tiêu chuẩn bảo mật)' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt2_oki_b433dn': {
        name: 'Máy in OKI B433DN',
        model: 'B433DN', brand: 'OKI', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
        specs: [
          { key: 'Tốc độ in A4/Letter', value: 'lên đến 40 trang/phút' },
          { key: 'Loại máy in', value: 'Đơn năng Laser' },
          { key: 'In đảo mặt', value: 'Có' },
          { key: 'Độ phân giải', value: '1200 x 1200 dpi' },
          { key: 'Kết nối', value: 'Ethernet: 1000BASE-T/100BASE-TX/10BASE-T, USB 2.0, USB Host, NFC' },
          { key: 'Nguồn điện', value: '220-240 V AC 50/60Hz' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt3_ricoh_fi8170': {
        name: 'Máy scan RICOH Fi-8170',
        model: 'Fi-8170', brand: 'Ricoh', origin: 'Indonesia', warranty: '12 tháng', unit: 'Cái', price: 0,
        specs: [
          { key: 'Tốc độ quét ADF', value: '70 trang/phút, 140 hình/phút' },
          { key: 'Độ phân giải máy quét', value: '600 x 600 dpi' },
          { key: 'Kết nối', value: 'USB 3.2 Gen1x1 / USB 2.0 / USB 1.1\nLAN: 10BASE-T, 100BASE-TX, 1000BASE-T' },
          { key: 'Bộ nhớ', value: '512 MB' },
          { key: 'Tốc độ xử lý', value: 'GI Processor 666 Mhz' },
          { key: 'Chu kì quét hàng ngày', value: '10000 trang/ ngày' },
          { key: 'Định dạng file quét', value: 'Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt4_canon_eos_r6': {
        name: 'Máy ảnh + phụ kiện Canon EOS R6 Mark II',
        model: 'EOS R6 Mark II', brand: 'Canon', origin: '', warranty: '12 tháng', unit: 'Bộ', price: 0,
        specs: [
          { key: 'Cảm biến', value: 'Full-Frame 24,2MP' },
          { key: 'ISO', value: '100 đến 102.400' },
          { key: 'Quay video', value: '4K' },
          { key: 'Ống kính đi kèm', value: 'RF 50mm' },
          { key: 'Phụ kiện', value: 'Pin, thẻ nhớ 64GB, chân máy ảnh, đèn chụp, phông chụp' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt5_granstream_gwn7813': {
        name: 'Thiết bị Switch layer 3 Granstream GWN7813',
        model: 'GWN7813', brand: 'Granstream', origin: '', warranty: '12 tháng', unit: 'Bộ', price: 0,
        specs: [
          { key: 'Cổng mạng chính', value: '24x10/100/1000BASE-T (RJ-45)' },
          { key: 'Cổng Uplink', value: '4x10GBASE-R (SFP+)/1000BASE-X (SFP)' },
          { key: 'Console', value: '1xConsole port RJ-45' },
          { key: 'Số kết nối SIM', value: '4 sim + 1 Ethernet' },
          { key: 'Băng tần wifi', value: '2.4GHz, 5.8GHz' },
          { key: 'Wifi', value: '802.11b/g/n, tốc độ 300Mb/s' },
          { key: 'Pin tích hợp', value: '10.000 mA' },
          { key: 'Thời gian hoạt động', value: '5,5 giờ' },
          { key: 'Cấp độ bảo vệ', value: 'IP67' },
          { key: 'Thiết kế', value: 'Tích hợp trong valy cứng' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt6_liveu_lu2000': {
        name: 'Máy chủ LiveU LU2000',
        model: 'LU2000', brand: 'LiveU', origin: '', warranty: '12 tháng', unit: 'Bộ', price: 0,
        specs: [
          { key: 'CPU', value: 'Intel Xeon E-2124 tương đương hoặc cao hơn' },
          { key: 'RAM', value: '16 GB DDR 4' },
          { key: 'Ổ cứng', value: '1 TB HDD' },
          { key: 'Giao diện video', value: 'HDMI và Ethernet RJ45 cho IP camera' },
          { key: 'VIDEO encoder', value: 'H.265/HEVC, H.264' },
          { key: 'AUDIO encoder', value: 'AAC-HE/LC, 2 kênh audio' },
          { key: 'Độ phân giải video', value: '1080p50/60/25/30, 720p50/60' },
          { key: 'Kênh truyền', value: 'Cộng gộp: 2x modem trong 4G, 2x modem ngoài 4G, 01 WiFi và 01 Ethernet' },
          { key: 'Mã hóa', value: 'AES256' },
          { key: 'Giao diện', value: '2 x USB 2.0, micro USB, RJ-45 Ethernet, 3.5mm audio jack, micro-SD card, khe SIM' },
          { key: 'Wifi', value: '802.11 a,b,g,n,ac MIMO, 4G / 5G' },
          { key: 'Kích thước', value: '112.5mm x 203mm x 54.5mm' },
          { key: 'Nhiệt độ hoạt động', value: '-5C đến +45C' },
          { key: 'Phần mềm quản lý', value: 'LiveU Central - stream RTSP, MPEG-TS, SRT, RTMP lên Facebook, Youtube, Twitch...' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt7_o_cung_di_dong_wd': {
        name: 'Ổ cứng di động WDBBGB0120HBK-SESN',
        model: 'WDBBGB0120HBK-SESN', brand: 'WD', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
        specs: [
          { key: 'Kích thước', value: '3.5 inch' },
          { key: 'Giao tiếp', value: 'USB 3.0 (tương thích USB 2.0)' },
          { key: 'Tốc độ kết nối', value: '5Gb/s (max)' },
          { key: 'Dung lượng', value: '12 TB' },
          { key: 'Kích thước vật lý', value: '170.6 × 49 × 139.3 mm; nặng: 0.97kg' },
          { key: 'Nhiệt độ hoạt động', value: '5°C to 35°C' },
          { key: 'Tương thích', value: 'Windows/Mac; định dạng exFAT' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt8_sharp_4t_c55fm2x': {
        name: 'Màn hình Tivi 55 inch Sharp 4T-C55FM2X',
        model: '4T-C55FM2X', brand: 'Sharp', origin: '', warranty: '12 tháng', unit: 'Chiếc', price: 0,
        specs: [
          { key: 'Kích cỡ', value: '55 inch' },
          { key: 'Độ phân giải', value: '4K UHD (3840 x 2160)' },
          { key: 'Tấm nền', value: 'Full-Array LED backlighting' },
          { key: 'Độ sáng', value: '300 nits' },
          { key: 'Tần số quét', value: '60 Hz' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt9_kiosk_tc_ai_hcm01': {
        name: 'Hệ thống Kiosk TC AI HCM01',
        model: 'TC AI HCM01', brand: 'TC AI', origin: 'Việt Nam', warranty: '12 tháng', unit: 'Bộ', price: 0,
        specs: [
          { key: 'Màn hình', value: '27"" LED backlit; 1920x1080; 16:9; 300cd/m2; cảm ứng điện dung 10 điểm' },
          { key: 'CPU', value: 'Intel® Core™ Ultra 5 235 (24M, upto 5.00 GHz)' },
          { key: 'RAM', value: '16GB DDR5' },
          { key: 'Ổ cứng', value: 'SSD 512 GB' },
          { key: 'Kết nối', value: '01 x HDMI, 01 x DisplayPort, 06 x USB (2.0, 3.0)' },
          { key: 'Máy in nhiệt', value: 'Khổ giấy 80mm, tốc độ 250mm/s, cắt giấy tự động' },
          { key: 'Đầu đọc CCCD', value: 'Đọc và giải mã dữ liệu chip CCCD (hình ảnh, CCCD, ngày cấp, họ tên, địa chỉ...)' },
          { key: 'Máy Scan A4', value: '40 trang/phút một mặt, 80 hình/phút hai mặt (USB 2.0)' },
          { key: 'Camera', value: 'Full HD 1920x1080, góc nhìn 65°, tự động cân bằng ánh sáng' },
          { key: 'Micro', value: 'Thu âm đẳng hướng, bán kính 2m' },
          { key: 'Khung sườn', value: 'Thép tĩnh điện, CNC Laser, chống gỉ' },
          { key: 'Chứng nhận NSX', value: 'ISO 9001-2015, 14001-2015, 45001-2018, ISO 27001-2013, chứng nhận 5S' },
          { key: 'Phần mềm', value: 'Kiosk Dịch vụ công tự động toàn trình: bốc số, nộp hồ sơ, tra cứu, đánh giá, Chatbox AI' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt10_ipad_air_13': {
        name: 'Máy tính bảng 13 inch iPad Air 13-inch Wi-Fi + Cellular 256GB',
        model: 'iPad Air 13-inch (M4)', brand: 'Apple', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
        specs: [
          { key: 'Kích thước màn hình', value: '13 inches' },
          { key: 'Chipset', value: 'Apple M4' },
          { key: 'Dung lượng RAM', value: '8 GB' },
          { key: 'Bộ nhớ trong', value: '256GB' },
          { key: 'Kết nối', value: 'Wi-Fi + Cellular (Có SIM / eSIM)' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt11_ipad_air_11': {
        name: 'Máy tính bảng 11 inch iPad Air 11-inch Wi-Fi + Cellular 256GB',
        model: 'iPad Air 11-inch (M4)', brand: 'Apple', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
        specs: [
          { key: 'Kích thước màn hình', value: '11 inches' },
          { key: 'Chipset', value: 'Apple M4' },
          { key: 'Dung lượng RAM', value: '8 GB' },
          { key: 'Bộ nhớ trong', value: '256GB' },
          { key: 'Kết nối', value: 'Wi-Fi + Cellular (Có SIM / eSIM)' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt12_van_tay_bkcontech': {
        name: 'Máy thu nhận vân tay BKCONTECH BKCA2020101',
        model: 'BKCA2020101', brand: 'BKCONTECH', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
        specs: [
          { key: 'Kiểu thu nhận', value: 'Lăn, phẳng đơn, 4x4x2 phẳng' },
          { key: 'Độ phân giải', value: '500 dpi' },
          { key: 'Vùng quét vân tay', value: 'Lăn: 1,6"" x 1,6""; Chụm 4/2 ngón: 3,2"" x 3,0""' },
          { key: 'Chuẩn giao tiếp', value: 'USB 2.0' },
          { key: 'Hệ điều hành hỗ trợ', value: 'Microsoft Windows 10 64bit; Linux Ubuntu' },
          { key: 'Tiêu chuẩn IP', value: 'IP 54' },
          { key: 'Nhiệt độ vận hành', value: '0°C ÷ 50°C' },
          { key: 'Màn hình', value: 'LCD 7""' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt13_mong_mat_cmitech': {
        name: 'Máy thu nhận mống mắt CMITech BMT-20',
        model: 'BMT-20', brand: 'CMITech', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
        specs: [
          { key: 'Kích thước', value: '219 x 161 x 58 mm; nặng 680g' },
          { key: 'Độ phân giải pixel', value: '18,4 đến 20 pixel/mm' },
          { key: 'Độ phân giải Iris', value: '640 X 480 pixel' },
          { key: 'Khoảng cách đường quang', value: '350 đến 380 mm' },
          { key: 'Khoảng cách đồng tử', value: '40 đến 90mm' },
          { key: 'Thời gian chụp', value: '~ 0,5 giây' },
          { key: 'Giao diện', value: 'USB 2.0 tốc độ cao (500 mA ở 5V)' },
          { key: 'Nguồn điện', value: 'Không cần nguồn điện bổ sung' },
          { key: 'Nhiệt độ hoạt động', value: '0 đến 50°C; Độ ẩm 10 đến 90% RH' },
          { key: 'Tiêu chuẩn', value: 'IEC 62471, IEC 60825-1; IP64' },
          { key: 'Hệ điều hành', value: 'Windows 7/8/8.1/10 (32/64 bit); Linux Ubuntu; Android 4.0+' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt14_dau_doc_the_tu_identiv': {
        name: 'Đầu đọc thẻ từ Identiv uTrust 4701 F',
        model: 'uTrust 4701 F', brand: 'Identiv', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
        specs: [
          { key: 'Giao diện', value: 'Kép: tiếp xúc ISO/IEC 7816, không tiếp xúc 13,56 MHz và NFC' },
          { key: 'Giao diện máy chủ', value: 'USB 2.0 CCID (USB 1.1/3.0 tương thích)' },
          { key: 'Tốc độ truyền thông', value: '12 Mbps (USB 2.0 full speed)' },
          { key: 'Tiêu chuẩn', value: 'ISO/IEC 7816, ISO/IEC 14443, ISO/IEC 18092' },
          { key: 'Card Protocol', value: 'T=0, T=1; T=CL' },
          { key: 'Tốc độ đọc ghi', value: 'Up to 600 kbps, TA1=97' },
          { key: 'Tốc độ truyền dữ liệu', value: '106/212/424/848 Kbits/S' },
          { key: 'Hệ điều hành', value: 'Windows, MacOS, Linux' },
          { key: 'Nhiệt độ hoạt động', value: '-10° đến 70°C' },
          { key: 'Hệ thống tiêu chuẩn', value: 'ISO/IEC 7816, USB 2.0 Full Speed, CCID, Microsoft WHQL' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt15_thiet_bi_doc_the_nho_aten': {
        name: 'Thiết bị đọc thẻ nhớ ATEN UH3240',
        model: 'UH3240', brand: 'ATEN', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
        specs: [
          { key: 'Dùng cho', value: 'Máy vi tính hỗ trợ cổng Type C' },
          { key: 'Chức năng', value: 'USB-C Multiport Dock: xuất hình + chuyển đổi cổng kết nối' },
          { key: 'Cổng mạng', value: '1 × Gigabit Ethernet' },
          { key: 'USB Type-A', value: '3 × USB 3.2 Gen 1 Type-A' },
          { key: 'Khe thẻ nhớ', value: '1 × SD/SDHC/SDXC (tới 2TB) + 1 × microSD/SDHC/SDXC (tới 2TB)' },
          { key: 'Xuất hình', value: '2 × HDMI' },
          { key: 'USB Type-C', value: '2 Type C' },
          { key: 'Âm thanh', value: '1 × 3.5mm stereo 4-pole microphone/headphone' },
          { key: 'Tốc độ truyền dữ liệu', value: 'USB 3.2 Gen 1, 5Gbps' },
          { key: 'Độ phân giải tối đa', value: 'Single lên 8K; Dual HDMI 4K' },
          { key: 'Jack kết nối', value: 'Type-C' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      },
      'stt16_may_doc_the_nho_aten': {
        name: 'Máy đọc thẻ nhớ ATEN UH3240',
        model: 'UH3240', brand: 'ATEN', origin: 'Đài Loan', warranty: '12 tháng', unit: 'Cái', price: 0,
        specs: [
          { key: 'Dùng cho', value: 'Máy vi tính hỗ trợ cổng Type C' },
          { key: 'Chức năng', value: 'USB-C Multiport Dock: xuất hình ảnh + chuyển đổi cổng kết nối' },
          { key: 'Cổng mạng', value: '1 × Gigabit Ethernet' },
          { key: 'USB Type-A', value: '3 × USB 3.2 Gen 1 Type-A' },
          { key: 'Khe thẻ nhớ SD', value: '1 × SD/SDHC/SDXC, tới 2TB' },
          { key: 'Khe thẻ nhớ microSD', value: '1 × microSD/SDHC/SDXC, tới 2TB' },
          { key: 'Xuất hình', value: '2 × HDMI (Single lên 8K; Dual 4K)' },
          { key: 'USB Type-C', value: '1 × USB-C 3.2 Gen 1 (5 Gbps) + 1 × USB-C PD 3.0 tới 100W' },
          { key: 'Âm thanh', value: '1 × 3.5mm stereo 4-pole microphone/headphone' },
          { key: 'Tốc độ truyền dữ liệu', value: 'USB 3.2 Gen 1, 5Gbps' },
          { key: 'Jack kết nối', value: 'Type-C' },
          { key: 'Bảo hành', value: '12 tháng' }
        ]
      }";

            string markerCRLF = "      }\r\n    };";
            string markerLF = "      }\n    };";

            int idx = content.LastIndexOf(markerCRLF);
            if (idx >= 0)
            {
                content = content.Substring(0, idx) + newPresets + "\r\n    };" + content.Substring(idx + markerCRLF.Length);
                Console.WriteLine("Inserted using CRLF marker");
            }
            else
            {
                idx = content.LastIndexOf(markerLF);
                if (idx >= 0)
                {
                    content = content.Substring(0, idx) + newPresets + "\n    };" + content.Substring(idx + markerLF.Length);
                    Console.WriteLine("Inserted using LF marker");
                }
                else
                {
                    Console.WriteLine("ERROR: marker not found!");
                    return;
                }
            }

            File.WriteAllText(indexPath, content);
            Console.WriteLine("Done! File size: " + content.Length + " bytes");
        }
    }
}
