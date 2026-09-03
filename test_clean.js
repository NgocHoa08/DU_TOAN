function cleanDeviceName(rawName) {
  if (!rawName) return '';
  let s = String(rawName).replace(/[\u00a0\s]+/g, ' ').trim();
  s = s.replace(/phụ lục\s*\d*[:\s-]*(tổng hợp[^(]*)?(\([^)]*\))?/gi, '').trim();
  s = s.replace(/^[0-9]+[.\-\s:]+/, '').trim();
  s = s.replace(/hoặc\s+tương\s+đương/gi, '').trim();
  s = s.replace(/tương\s+đương/gi, '').trim();
  s = s.replace(/\(có chế độ scan\)/gi, '').trim();
  s = s.replace(/\(máy scan\)/gi, '').trim();
  s = s.replace(/\s{2,}/g, ' ').trim();
  return s;
}

const names = [
  'Thiết bị mạng tương đương CBS350-24S',
  'Thiết bị mạng tương đương Cisco WS-C2960L',
  'Thiết bị mạng tương đương Switch Cisco\u00A0CBS250-48PP',
  'Thiết bị mạng Switch Cisco\u00A0hoặc tương đương',
  'Thiết bị tường lửa Fortinet hoặc tương đương',
  'Switch tương đương Cisco catalyst 1200 Series',
  'Cáp mạng COMMSCOPE Cat 6 hoặc tương đương',
  'Thiết bị cân bằng tải tương đương Draytek Vigor2962',
  'Máy photocopy (có chế độ Scan)',
  'Máy quét tài liệu số hóa (máy Scan)'
];

names.forEach(n => {
  console.log(n + ' -> ' + cleanDeviceName(n));
});
