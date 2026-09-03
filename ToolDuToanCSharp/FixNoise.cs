using System;
using System.IO;

namespace ToolDuToanCSharp
{
    public static class FixNoise
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

            int sIdxNoise = content.IndexOf("function isNoiseOrNonDeviceText(text) {");
            int eIdxNoise = content.IndexOf("function isStrictHardwareDevice(str) {", sIdxNoise);

            if (sIdxNoise == -1 || eIdxNoise == -1)
            {
                Console.WriteLine("Could not find isNoiseOrNonDeviceText block");
                return;
            }

            string newNoiseCode = @"function isNoiseOrNonDeviceText(text) {
      if (!text || typeof text !== 'string') return true;
      var s = text.trim().toLowerCase();
      if (s.length < 2) return true;

      // Ưu tiên giữ lại nếu chứa tên thiết bị phần cứng
      if (s.includes('camera') || s.includes('switch') || s.includes('máy ') || s.includes('máy vi tính') || s.includes('máy in') || s.includes('scan') || s.includes('license') || s.includes('cáp') || s.includes('cân bằng tải') || s.includes('hub') || s.includes('router') || s.includes('tường lửa') || s.includes('server') || s.includes('kiosk') || s.includes('ipad') || s.includes('tivi') || s.includes('ổ cứng') || s.includes('chiếu') || s.includes('photo')) {
        return false;
      }

      // 1. Safety, Fire protection, PCCC, Labor safety, Environment, Method statements, Acceptance
      var noiseSafetyKeywords = [
        'pccc', 'phòng cháy', 'chữa cháy', 'an toàn', 'vệ sinh lao động', 'bảo hộ lao động',
        'thuyết minh', 'biện pháp tổ chức', 'biện pháp thi công', 'giải pháp kỹ thuật',
        'tổ chức cung cấp', 'phương án', 'nghiệm thu', 'bàn giao', 'thủ tục nghiệm thu',
        'quy chuẩn xây dựng', 'quy chuẩn việt nam', 'quy định pháp luật', 'văn bản pháp lý',
        'tài liệu pháp lý', 'áp dụng trong quá trình', 'yêu cầu đối với nhà thầu',
        'yêu cầu khác', 'tài liệu pháp lý khác', 'trong quá trình đăng tải', 'thông báo mời thầu',
        'làm rõ e-hsmt', 'khói bụi', 'tiếng ồn', 'bảo vệ môi trường', 'trật tự',
        'thực hiện đúng theo quy định', 'mọi thủ tục nghiệm thu'
      ];
      if (noiseSafetyKeywords.some(function (kw) { return s.includes(kw); })) {
        return true;
      }

      // 2. People, Personnel, Roles, Signatures, Organizations
      var noisePeopleKeywords = [
        'đại diện', 'người đại diện', 'ông/bà', 'họ và tên', 'họ tên', 'chức vụ',
        'giám đốc', 'phó giám đốc', 'trưởng phòng', 'kỹ sư', 'kỹ thuật viên', 'cán bộ',
        'kế toán', 'thủ quỹ', 'chỉ huy trưởng', 'nhân sự', 'nhân lực', 'nhân viên',
        'người giao', 'người nhận', 'bên giao', 'bên nhận', 'bên a', 'bên b',
        'bên mời thầu', 'chủ đầu tư', 'nhà thầu', 'liên danh', 'thành viên liên danh',
        'tổ chuyên gia', 'tổ chấm thầu', 'chữ ký', 'ký tên', 'đóng dấu', 'ký, ghi rõ',
        'người lập biểu', 'người duyệt', 'trưởng ban', 'đoàn kiểm tra'
      ];
      if (noisePeopleKeywords.some(function (kw) {
        return s.startsWith(kw) || s === kw || s.includes('chức vụ:') || s.includes('họ và tên:');
      })) {
        return true;
      }

      // 3. Geographical names, distribution tables, allocation of communes/wards/districts
      var noiseGeoKeywords = [
        'tên xã', 'tên phường', 'tên thị trấn', 'tên huyện', 'tên quận', 'tên tỉnh',
        'tên đặc khu', 'xã/phường', 'phường/xã', 'xã, phường', 'phường, xã', 'quận/huyện', 'huyện/quận',
        'địa bàn', 'đặc khu', 'phân bổ', 'bảng phân bổ', 'danh sách phân bổ', 'địa điểm giao',
        'nơi nhận', 'đơn vị nhận', 'đơn vị thụ hưởng', 'điểm giao hàng', 'danh sách địa điểm',
        'công an xã', 'công an phường', 'công an thị trấn', 'công an huyện', 'công an quận',
        'công an tỉnh', 'công an thành phố', 'công an tp', 'đội cảnh sát', 'đồn công an',
        'xã ', 'phường ', 'thị trấn ', 'thị xã ', 'thôn ', 'ấp ', 'bản ', 'buôn ', 'khu phố '
      ];
      if (noiseGeoKeywords.some(function (kw) {
        return s.startsWith(kw) || s.includes(kw);
      })) {
        return true;
      }

      // 4. Matrix count rows like ""| 12 | 6 | 18 | 4 | 0 | 0"" or ""100: Xã Nam Đà | 12...""
      if (/(\b0\s*\|\s*0\b|\b\d+\s*\|\s*\d+\s*\|\s*\d+\b)/.test(s) && !/(gb|tb|hz|ghz|dpi|ppm|ipm|watt|mah|inch)/.test(s)) {
        return true;
      }

      // 5. Legal, Administrative, Contractual, General clauses
      var noiseAdminKeywords = [
        'cộng hòa xã hội', 'độc lập - tự do', 'độc lập tự do', 'hạnh phúc', 'kính gửi',
        'căn cứ luật', 'căn cứ nghị định', 'căn cứ quyết định', 'căn cứ thông tư',
        'điều khoản', 'điều kiện hợp đồng', 'bảo đảm dự thầu', 'bảo lãnh dự thầu',
        'hiệu lực của e-hsdt', 'hiệu lực e-hsdt', 'năng lực tài chính', 'kinh nghiệm hợp đồng',
        'doanh thu bình quân', 'nghị quyết số', 'kế hoạch số', 'quyết định số', 'báo cáo đánh giá',
        'phần 1', 'phần 2', 'chương i', 'chương ii', 'chương iii', 'chương iv', 'chương v',
        'mục lục', 'danh mục viết tắt', 'bảng biểu', 'lời nói đầu', 'phụ lục hợp đồng',
        'tổng cộng', 'tổng số tiền', 'bằng chữ', 'thời gian thực hiện', 'địa điểm giao hàng'
      ];
      if (noiseAdminKeywords.some(function (kw) { return s.includes(kw); })) {
        return true;
      }

      return false;
    }

    ";

            content = content.Substring(0, sIdxNoise) + newNoiseCode + content.Substring(eIdxNoise);

            File.WriteAllText(indexPath, content);
            Console.WriteLine("Updated isNoiseOrNonDeviceText successfully!");
        }
    }
}
