using System.Collections.Generic;

namespace ToolDuToanBlazor.Models
{
    public class DeviceModel
    {
        public int Id { get; set; }
        public int Stt { get; set; }
        public int OrigStt { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Origin { get; set; } = string.Empty;
        public string Warranty { get; set; } = "12 tháng";
        public string Unit { get; set; } = "Máy";
        public int Qty { get; set; } = 1;
        public decimal Price { get; set; }
        
        public List<DeviceSpec> Specs { get; set; } = new();
    }

    public class DeviceSpec
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}
