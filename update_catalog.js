const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const sIdx = content.indexOf('var CATALOG_ITEMS = [');
const eIdx = content.indexOf('];', sIdx) + 2;

if (sIdx === -1 || eIdx <= 1) {
  console.error('Could not find CATALOG_ITEMS in index.html');
  process.exit(1);
}

const newCatalogItemsCode = `var CATALOG_ITEMS = [
      // ── 16 THIẾT BỊ DỰ TOÁN (TỪ BẢNG TUYÊN BỐ ĐÁP ỨNG) ──
      { id: 'stt1_msi_dp180_ai', cat: 'may_tinh', presetKey: 'stt1_msi_dp180_ai', name: 'Máy vi tính MSI PRO DP180 AI 8HG', model: 'PRO DP180 AI 8HG', brand: 'MSI', origin: 'Trung Quốc', price: '', qty: 1, warranty: '12 tháng', unit: 'Bộ', specCount: 12 },
      { id: 'stt2_oki_b433dn', cat: 'may_in', presetKey: 'stt2_oki_b433dn', name: 'Máy in OKI B433DN', model: 'B433DN', brand: 'OKI', origin: 'Thái Lan', price: '', qty: 1, warranty: '12 tháng', unit: 'Máy', specCount: 7 },
      { id: 'stt3_ricoh_fi8170', cat: 'may_scan', presetKey: 'stt3_ricoh_fi8170', name: 'Máy scan RICOH Fi-8170', model: 'Fi-8170', brand: 'Ricoh', origin: 'Indonesia', price: '', qty: 1, warranty: '12 tháng', unit: 'Máy', specCount: 8 },
      { id: 'stt4_canon_eos_r6', cat: 'thiet_bi_khac', presetKey: 'stt4_canon_eos_r6', name: 'Máy ảnh + phụ kiện Canon EOS R6 Mark II', model: 'EOS R6 Mark II', brand: 'Canon', origin: 'Nhật Bản', price: '', qty: 1, warranty: '12 tháng', unit: 'Bộ', specCount: 6 },
      { id: 'stt5_granstream_gwn7813', cat: 'thiet_bi_khac', presetKey: 'stt5_granstream_gwn7813', name: 'Thiết bị Switch layer 3 Granstream GWN7813', model: 'GWN7813', brand: 'Granstream', origin: 'Trung Quốc', price: '', qty: 1, warranty: '12 tháng', unit: 'Bộ', specCount: 11 },
      { id: 'stt6_liveu_lu2000', cat: 'may_tinh', presetKey: 'stt6_liveu_lu2000', name: 'Máy chủ LiveU LU2000', model: 'LU2000', brand: 'LiveU', origin: 'Mỹ / Israel', price: '', qty: 1, warranty: '12 tháng', unit: 'Bộ', specCount: 15 },
      { id: 'stt7_o_cung_di_dong_wd', cat: 'thiet_bi_khac', presetKey: 'stt7_o_cung_di_dong_wd', name: 'Ổ cứng di động WDBBGB0120HBK-SESN 12TB', model: 'WDBBGB0120HBK-SESN', brand: 'WD', origin: 'Thái Lan', price: '', qty: 1, warranty: '12 tháng', unit: 'Cái', specCount: 8 },
      { id: 'stt8_sharp_4t_c55fm2x', cat: 'thiet_bi_khac', presetKey: 'stt8_sharp_4t_c55fm2x', name: 'Màn hình Tivi 55 inch Sharp 4T-C55FM2X', model: '4T-C55FM2X', brand: 'Sharp', origin: 'Thái Lan', price: '', qty: 1, warranty: '12 tháng', unit: 'Chiếc', specCount: 6 },
      { id: 'stt9_kiosk_tc_ai_hcm01', cat: 'may_tinh', presetKey: 'stt9_kiosk_tc_ai_hcm01', name: 'Hệ thống Kiosk TC AI HCM01', model: 'TC AI HCM01', brand: 'TC AI', origin: 'Việt Nam', price: '', qty: 1, warranty: '12 tháng', unit: 'Bộ', specCount: 14 },
      { id: 'stt10_ipad_air_13', cat: 'may_tinh', presetKey: 'stt10_ipad_air_13', name: 'Máy tính bảng 13 inch iPad Air 13-inch Wi-Fi + Cellular 256GB', model: 'iPad Air 13-inch (M4)', brand: 'Apple', origin: 'Trung Quốc', price: '', qty: 1, warranty: '12 tháng', unit: 'Cái', specCount: 6 },
      { id: 'stt11_ipad_air_11', cat: 'may_tinh', presetKey: 'stt11_ipad_air_11', name: 'Máy tính bảng 11 inch iPad Air 11-inch Wi-Fi + Cellular 256GB', model: 'iPad Air 11-inch (M4)', brand: 'Apple', origin: 'Trung Quốc', price: '', qty: 1, warranty: '12 tháng', unit: 'Cái', specCount: 6 },
      { id: 'stt12_van_tay_bkcontech', cat: 'thiet_bi_khac', presetKey: 'stt12_van_tay_bkcontech', name: 'Máy thu nhận vân tay BKCONTECH BKCA2020101', model: 'BKCA2020101', brand: 'BKCONTECH', origin: 'Việt Nam', price: '', qty: 1, warranty: '12 tháng', unit: 'Cái', specCount: 9 },
      { id: 'stt13_mong_mat_cmitech', cat: 'thiet_bi_khac', presetKey: 'stt13_mong_mat_cmitech', name: 'Máy thu nhận mống mắt CMITech BMT-20', model: 'BMT-20', brand: 'CMITech', origin: 'Hàn Quốc', price: '', qty: 1, warranty: '12 tháng', unit: 'Cái', specCount: 12 },
      { id: 'stt14_dau_doc_the_tu_identiv', cat: 'thiet_bi_khac', presetKey: 'stt14_dau_doc_the_tu_identiv', name: 'Đầu đọc thẻ từ Identiv uTrust 4701 F', model: 'uTrust 4701 F', brand: 'Identiv', origin: 'Đức / Mỹ', price: '', qty: 1, warranty: '12 tháng', unit: 'Cái', specCount: 11 },
      { id: 'stt15_thiet_bi_doc_the_nho_aten', cat: 'thiet_bi_khac', presetKey: 'stt15_thiet_bi_doc_the_nho_aten', name: 'Thiết bị đọc thẻ nhớ ATEN UH3240 USB-C Multiport Dock', model: 'UH3240', brand: 'ATEN', origin: 'Đài Loan', price: '', qty: 1, warranty: '12 tháng', unit: 'Cái', specCount: 12 },
      { id: 'stt16_may_doc_the_nho_aten', cat: 'thiet_bi_khac', presetKey: 'stt16_may_doc_the_nho_aten', name: 'Máy đọc thẻ nhớ ATEN UH3240 (Đề xuất)', model: 'UH3240', brand: 'ATEN', origin: 'Đài Loan', price: '', qty: 1, warranty: '12 tháng', unit: 'Cái', specCount: 12 },

      // ── CÁC DÒNG MÁY THAM KHẢO KHÁC ──
      { id: 'msi_cubi_nuc', cat: 'may_tinh', presetKey: 'msi_cubi_nuc', name: 'Máy tính để bàn Mini PC MSI Cubi NUC 1M', model: 'Cubi NUC 1M', brand: 'MSI', origin: 'Trung Quốc', price: '', qty: 1, warranty: '24 tháng', unit: 'Bộ', specCount: 37 },
      { id: 'oki_b513dn', cat: 'may_in', presetKey: 'oki_b513dn', name: 'Máy in A4 đen trắng OKI B513DN', model: 'B513DN', brand: 'OKI', origin: 'Thái Lan', price: '', qty: 1, warranty: '12 tháng', unit: 'Máy', specCount: 23 },
      { id: 'canon_lbp2900', cat: 'may_in', presetKey: 'canon_lbp2900', name: 'Máy in Laser Canon LBP2900', model: 'LBP2900', brand: 'Canon', origin: 'Việt Nam', price: '', qty: 1, warranty: '12 tháng', unit: 'Máy', specCount: 17 },
      { id: 'hp_m404dn', cat: 'may_in', presetKey: 'hp_m404dn', name: 'Máy in HP LaserJet Pro M404dn', model: 'M404dn', brand: 'HP', origin: 'Philippines', price: '', qty: 1, warranty: '12 tháng', unit: 'Máy', specCount: 15 },
      { id: 'ricoh_im2500', cat: 'photocopy', presetKey: 'ricoh_im2500', name: 'Máy đa chức năng đen trắng Ricoh IM 2500', model: 'IM 2500', brand: 'Ricoh', origin: 'Trung Quốc', price: '', qty: 1, warranty: '12 tháng hoặc 80.000 bản', unit: 'Máy', specCount: 24 },
      { id: 'ricoh_sp2240n', cat: 'may_scan', presetKey: 'ricoh_sp2240n', name: 'Máy scan tài liệu A4 Ricoh SP-2240N', model: 'SP-2240N', brand: 'Ricoh', origin: 'Indonesia', price: '', qty: 1, warranty: '12 tháng', unit: 'Máy', specCount: 13 },
      { id: 'man_hinh_24', cat: 'thiet_bi_khac', presetKey: 'man_hinh_24', name: 'Màn hình máy tính 23.8 inch IPS Full HD', model: 'PRO MP241X', brand: 'MSI', origin: 'Trung Quốc', price: '', qty: 1, warranty: '24 tháng', unit: 'Chiếc', specCount: 11 },
      { id: 'ups_santak_1000', cat: 'thiet_bi_khac', presetKey: 'ups_santak_1000', name: 'Bộ lưu điện UPS Santak Blazer 1000 Pro', model: 'Blazer 1000 Pro', brand: 'Santak', origin: 'Trung Quốc', price: '', qty: 1, warranty: '36 tháng', unit: 'Bộ', specCount: 11 }
    ];`;

content = content.substring(0, sIdx) + newCatalogItemsCode + content.substring(eIdx);

// Also make sure mType handles thiet_bi_khac properly
content = content.replace(
  "var mType = curCatType === 'all' || item.cat === curCatType;",
  "var mType = curCatType === 'all' || item.cat === curCatType || (curCatType === 'thiet_bi_khac' && (item.cat === 'thiet_bi_khac' || item.cat === 'khac'));"
);

fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully updated CATALOG_ITEMS in index.html');
