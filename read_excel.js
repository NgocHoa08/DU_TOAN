const ExcelJS = require('exceljs');

async function readExcel() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('Du_toan -V1.xlsx');
  
  console.log('Sheets:', wb.worksheets.map(s => s.name));
  
  // Read only the first 2 sheets fully
  const sheets = wb.worksheets;
  for (let i = 0; i < sheets.length; i++) {
    const ws = sheets[i];
    console.log(`\n\n=== Sheet ${i}: "${ws.name}" ===`);
    console.log(`Rows: ${ws.rowCount}, Cols: ${ws.columnCount}`);
    
    ws.eachRow((row, rowNum) => {
      const vals = [];
      row.eachCell({ includeEmpty: true }, (cell, colNum) => {
        let val = cell.value;
        if (val && typeof val === 'object' && val.richText) {
          val = val.richText.map(r => r.text).join('');
        }
        if (val && typeof val === 'object' && val.formula) {
          val = `FORMULA:${val.formula}`;
        }
        vals.push({ col: colNum, val });
      });
      
      const nonEmpty = vals.filter(v => v.val !== null && v.val !== undefined && v.val !== '');
      if (nonEmpty.length > 0) {
        console.log(`Row ${rowNum}:`, JSON.stringify(nonEmpty));
      }
    });
  }
  
  // Show merge info
  console.log('\n\n=== Merged cells per sheet ===');
  for (let i = 0; i < sheets.length; i++) {
    const ws = sheets[i];
    console.log(`Sheet "${ws.name}" merges:`, ws.mergeCells ? 'N/A' : 'check model');
    // Try model
    if (ws.model && ws.model.merges) {
      console.log(ws.model.merges);
    }
  }
}

readExcel().catch(console.error);
