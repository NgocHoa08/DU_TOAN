using System.Collections.Generic;
using System.IO;
using OfficeOpenXml;
using ToolDuToanBlazor.Models;

namespace ToolDuToanBlazor.Services
{
    public class ExcelParserService
    {
        public List<DeviceModel> ParseExcel(Stream excelStream)
        {
            var devices = new List<DeviceModel>();
            
            using (var package = new ExcelPackage(excelStream))
            {
                // This is where all the logic from update_all_specs_clean.js and full_upgrade.js goes.
                // We read the worksheets and parse the rows/columns.
                // 
                // var ws = package.Workbook.Worksheets[0];
                // var rowCount = ws.Dimension.Rows;
                // for (int row = 1; row <= rowCount; row++)
                // {
                //      ... extraction logic ...
                // }
            }
            
            return devices;
        }
        
        public bool IsStrictHardwareDevice(string str)
        {
            if (string.IsNullOrWhiteSpace(str)) return false;
            string s = str.Trim().ToLower();
            
            var nonHardware = new[] { "license", "gia hạn", "bản quyền", "dịch vụ" };
            foreach(var nh in nonHardware)
            {
                if (s.Contains(nh)) return false;
            }
            
            var hardwareKeywords = new[] { "máy vi tính", "máy tính", "switch", "máy in" };
            foreach(var hw in hardwareKeywords)
            {
                if (s.Contains(hw)) return true;
            }
            
            return false;
        }
    }
}
