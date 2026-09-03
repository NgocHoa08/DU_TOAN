using System;
using System.IO;

namespace ToolDuToanCSharp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Tool Du Toan C# Version");
            Console.WriteLine("1. Gen Data (gen_data.js)");
            Console.WriteLine("2. Full Upgrade (full_upgrade.js)");
            Console.WriteLine("3. Update All Specs Clean (update_all_specs_clean.js)");
            Console.WriteLine("4. Fix Parser Strict (fix_parser_strict.js)");
            Console.WriteLine("5. Fix Noise (fix_noise.js)");
            Console.WriteLine("6. Insert Presets (insert_presets.js)");
            Console.WriteLine("0. Exit");
            Console.Write("Choose an option: ");

            var choice = Console.ReadLine();
            
            // Allow EPPlus Commercial usage
            OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

            string basePath = @"w:\Tool_Du_Toan\"; // You can change this to relative path if running from that folder

            try
            {
                switch (choice)
                {
                    case "1":
                        GenData.Run(basePath);
                        break;
                    case "2":
                        FullUpgrade.Run(basePath);
                        break;
                    case "3":
                        UpdateAllSpecsClean.Run(basePath);
                        break;
                    case "4":
                        FixParserStrict.Run(basePath);
                        break;
                    case "5":
                        FixNoise.Run(basePath);
                        break;
                    case "6":
                        InsertPresets.Run(basePath);
                        break;
                    case "0":
                        return;
                    default:
                        Console.WriteLine("Invalid option.");
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            
            Console.WriteLine("Done.");
        }
    }
}
