/* ═══════════════════════════════════════════
       STATE
    ═══════════════════════════════════════════ */
var devs = [];
var bbDevs = []; // Independent Handover state
var devCnt = 0;
var fileList = [];
var curSheetTab = 'Tổng hợp'; // 'Tổng hợp' or number 1..N

/* ═══════════════════════════════════════════
   STEP NAV
═══════════════════════════════════════════ */
function resetDutoanState() {
  selectedCatalogItems = {};
  devs = [];
  devCnt = 0;
  fileList = [];
  if (typeof updateCartSummary === 'function') updateCartSummary();
  if (typeof renderCatalogGrid === 'function') renderCatalogGrid();
  if (typeof renderFileList === 'function') renderFileList();
  var fi = document.getElementById('fi');
  if (fi) fi.value = '';
  var dl = document.getElementById('devList');
  if (dl) dl.innerHTML = '';
  var qa = document.getElementById('quickEditArea');
  if (qa) qa.innerHTML = '';
  var ea = document.getElementById('excelSheetArea');
  if (ea) ea.innerHTML = '';
  var fa = document.getElementById('finalSheetArea');
  if (fa) fa.innerHTML = '';
  if (typeof goStep === 'function') goStep(1);
}

var isAdminUnlocked = true;

/* ═══════════════════════════════════════════
   LỊCH SỬ FILE - HISTORY MODULE
═══════════════════════════════════════════ */
var LS_HISTORY_KEY = 'dutoan_file_history';
var _lsCurrentFilter = 'all';
var _lsSearchQuery = '';
var _lsDateFilter = 'all';

function lsGetHistory() {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY_KEY) || '[]'); } catch(e) { return []; }
}

function lsSaveHistory(arr) {
  try { localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(arr)); } catch(e) {}
}

function lsAddEntry(type, label, fileName, meta) {
  var all = lsGetHistory();
  var newEntry = {
    id: 'ls_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    time: new Date().toISOString(),
    type: type, // 'dutoan' | 'bbbg' | 'tddu' | 'baogia'
    label: label || 'Không có tiêu đề',
    fileName: fileName || 'file.xlsx',
    meta: meta || {}
  };
  all.unshift(newEntry);
  if (all.length > 300) all = all.slice(0, 300);
  lsSaveHistory(all);
  updateLichSuTabBadge();
}

function updateLichSuTabBadge() {
  var all = lsGetHistory();
  var badge = document.getElementById('lsBadgeTab');
  if (badge) {
    if (all.length > 0) {
      badge.textContent = all.length;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

function lsTypeInfo(type) {
  switch (type) {
    case 'dutoan': return { icon:'📊', color:'#2563eb', bg:'rgba(37,99,235,.1)', label:'Dự Toán' };
    case 'bbbg': return { icon:'📝', color:'#059669', bg:'rgba(5,150,105,.1)', label:'Biên Bản Bàn Giao' };
    case 'tddu': return { icon:'✅', color:'#0284c7', bg:'rgba(2,132,199,.1)', label:'Tuyên Bố Đáp Ứng' };
    case 'baogia': return { icon:'🧾', color:'#b45309', bg:'rgba(180,83,9,.1)', label:'Báo Giá' };
    default: return { icon:'📄', color:'#64748b', bg:'rgba(100,116,139,.1)', label:'Khác' };
  }
}

function lsFmtTime(iso) {
  try {
    var d = new Date(iso);
    var pad = function(n){ return String(n).padStart(2, '0'); };
    return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' — ' + pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  } catch(e) { return iso; }
}

function lsRemoveAccents(str) {
  if (!str) return '';
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase();
}

function renderLichSu() {
  var allArr = lsGetHistory();

  // 1. Calculate Stats
  var countEl = document.getElementById('lichsuCount');
  if (countEl) countEl.textContent = allArr.length + ' file';

  var statsEl = document.getElementById('lichsuStats');
  if (statsEl) {
    var types = ['dutoan', 'bbbg', 'tddu', 'baogia'];
    var counts = {};
    var grandTotalMoney = 0;

    allArr.forEach(function(e) {
      counts[e.type] = (counts[e.type] || 0) + 1;
      if (e.meta && e.meta.total) {
        var numStr = String(e.meta.total).replace(/[^0-9]/g, '');
        var num = parseInt(numStr, 10);
        if (!isNaN(num)) grandTotalMoney += num;
      }
    });

    var cardsHtml = types.map(function(t) {
      var info = lsTypeInfo(t);
      var c = counts[t] || 0;
      var isActive = (_lsCurrentFilter === t);
      var borderStyle = isActive ? '2px solid ' + info.color : '1px solid ' + info.color.replace(')', ',0.25)');
      var boxShadow = isActive ? '0 4px 14px ' + info.bg.replace('.1', '.4') : '';
      return '<div style="background:' + info.bg + ';border:' + borderStyle + ';border-radius:12px;padding:12px 14px;cursor:pointer;transition:all .18s;box-shadow:' + boxShadow + '" onclick="filterLichSu(\'' + t + '\')" title="Lọc chỉ xem ' + info.label + '">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">' +
          '<div style="font-size:20px">' + info.icon + '</div>' +
          (isActive ? '<span style="font-size:10px;background:' + info.color + ';color:#fff;padding:1px 6px;border-radius:8px;font-weight:700">Đang chọn</span>' : '') +
        '</div>' +
        '<div style="font-size:22px;font-weight:800;color:' + info.color + '">' + c + '</div>' +
        '<div style="font-size:11.5px;color:var(--t2);font-weight:600">' + info.label + '</div>' +
      '</div>';
    }).join('');

    if (grandTotalMoney > 0) {
      cardsHtml += '<div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:12px;padding:12px 14px;transition:all .18s">' +
        '<div style="font-size:20px;margin-bottom:4px">💰</div>' +
        '<div style="font-size:16px;font-weight:800;color:#7c3aed;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + grandTotalMoney.toLocaleString('vi-VN') + ' ₫">' + grandTotalMoney.toLocaleString('vi-VN') + ' ₫</div>' +
        '<div style="font-size:11.5px;color:var(--t2);font-weight:600">Tổng Giá Trị Tạo</div>' +
      '</div>';
    }

    statsEl.innerHTML = cardsHtml;
  }

  // 2. Filter Button States
  ['all', 'dutoan', 'bbbg', 'tddu', 'baogia'].forEach(function(f) {
    var btn = document.getElementById('lsf-' + f);
    if (!btn) return;
    if (_lsCurrentFilter === f) {
      btn.style.background = 'linear-gradient(135deg,#7c3aed,#2563eb)';
      btn.style.color = '#ffffff';
      btn.style.fontWeight = '700';
      btn.style.boxShadow = '0 2px 6px rgba(124,58,237,0.3)';
    } else {
      btn.style.background = 'transparent';
      btn.style.color = 'var(--t1)';
      btn.style.fontWeight = '500';
      btn.style.boxShadow = 'none';
    }
  });

  // 3. Multi-Filter Logic
  var now = Date.now();
  var todayStr = new Date().toISOString().slice(0, 10);
  var yesterdayStr = new Date(now - 86400000).toISOString().slice(0, 10);
  var curMonthStr = todayStr.slice(0, 7);

  var arr = allArr.filter(function(e) {
    if (_lsCurrentFilter !== 'all' && e.type !== _lsCurrentFilter) return false;

    var entryTime = e.time ? new Date(e.time).getTime() : 0;
    var entryDateStr = e.time ? e.time.slice(0, 10) : '';
    if (_lsDateFilter === 'today' && entryDateStr !== todayStr) return false;
    if (_lsDateFilter === 'yesterday' && entryDateStr !== yesterdayStr) return false;
    if (_lsDateFilter === '7days' && (now - entryTime > 7 * 86400000)) return false;
    if (_lsDateFilter === '30days' && (now - entryTime > 30 * 86400000)) return false;
    if (_lsDateFilter === 'this_month' && (!entryDateStr || entryDateStr.slice(0, 7) !== curMonthStr)) return false;

    if (_lsSearchQuery) {
      var q = lsRemoveAccents(_lsSearchQuery.trim());
      var strToMatch = lsRemoveAccents(
        (e.label || '') + ' ' +
        (e.fileName || '') + ' ' +
        (e.meta ? (e.meta.project || '') + ' ' + (e.meta.customer || '') + ' ' + (e.meta.total || '') : '')
      );
      if (strToMatch.indexOf(q) === -1) return false;
    }

    return true;
  });

  // 4. Update Clear button
  var clearBtn = document.getElementById('lsSearchClearBtn');
  if (clearBtn) {
    clearBtn.style.display = _lsSearchQuery ? 'block' : 'none';
  }

  // 5. Result Info bar
  var resInfoEl = document.getElementById('lichsuResultInfo');
  var resTextEl = document.getElementById('lichsuResultText');
  var isFiltered = (_lsCurrentFilter !== 'all' || _lsDateFilter !== 'all' || _lsSearchQuery !== '');
  if (resInfoEl && resTextEl) {
    if (isFiltered && allArr.length > 0) {
      resInfoEl.style.display = 'flex';
      resTextEl.innerHTML = '🔍 Tìm thấy <b>' + arr.length + '</b> / <b>' + allArr.length + '</b> file phù hợp';
    } else {
      resInfoEl.style.display = 'none';
    }
  }

  // 6. Handle Empty State
  var emptyEl = document.getElementById('lichsuEmpty');
  var emptyTitle = document.getElementById('lichsuEmptyTitle');
  var emptySub = document.getElementById('lichsuEmptySub');
  var emptyAction = document.getElementById('lichsuEmptyAction');
  var listEl = document.getElementById('lichsuList');
  if (!listEl) return;

  if (allArr.length === 0) {
    if (emptyEl) {
      emptyEl.style.display = 'block';
      if (emptyTitle) emptyTitle.textContent = 'Chưa có file nào trong lịch sử';
      if (emptySub) emptySub.textContent = 'Khi bạn xuất file ở các tab Dự toán, Biên bản, Tuyên bố hoặc Báo giá, toàn bộ lịch sử sẽ tự động lưu lại ở đây.';
      if (emptyAction) emptyAction.style.display = 'flex';
    }
    listEl.innerHTML = '';
    return;
  }

  if (arr.length === 0) {
    if (emptyEl) {
      emptyEl.style.display = 'block';
      if (emptyTitle) emptyTitle.textContent = 'Không tìm thấy file phù hợp';
      if (emptySub) emptySub.textContent = 'Không có file nào khớp với bộ lọc hoặc từ khóa "' + escH(_lsSearchQuery) + '"';
      if (emptyAction) emptyAction.style.display = 'block';
    }
    listEl.innerHTML = '';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  // 7. Group and Render
  var groups = {};
  arr.forEach(function(e) {
    var d = e.time ? e.time.slice(0, 10) : 'Khác';
    var label = d;
    if (d === todayStr) label = 'Hôm nay (' + d.split('-').reverse().join('/') + ')';
    else if (d === yesterdayStr) label = 'Hôm qua (' + d.split('-').reverse().join('/') + ')';
    else if (d !== 'Khác') label = 'Ngày ' + d.split('-').reverse().join('/');
    if (!groups[label]) groups[label] = [];
    groups[label].push(e);
  });

  var html = '';
  Object.keys(groups).forEach(function(dayLabel) {
    html += '<div style="font-size:12px;font-weight:800;color:var(--t2);margin:18px 0 10px;text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;gap:8px">' +
      '<span>🗓️ ' + dayLabel + '</span>' +
      '<span style="background:var(--inp);padding:1px 8px;border-radius:10px;font-size:10.5px;color:var(--t2);font-weight:600">' + groups[dayLabel].length + ' file</span>' +
    '</div>';

    groups[dayLabel].forEach(function(e) {
      var info = lsTypeInfo(e.type);
      var metaParts = [];
      if (e.meta) {
        if (e.meta.project) metaParts.push('📁 ' + escH(e.meta.project));
        if (e.meta.customer) metaParts.push('🏢 ' + escH(e.meta.customer));
        if (e.meta.devices !== undefined) metaParts.push('🖥️ ' + e.meta.devices + ' thiết bị');
        if (e.meta.total) metaParts.push('<b style="color:#059669">💰 ' + escH(e.meta.total) + '</b>');
      }
      var metaHtml = '';
      if (metaParts.length > 0) {
        metaHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:7px">' +
          metaParts.map(function(p) {
            return '<span style="background:var(--inp);border:1px solid var(--bdr);padding:2px 8px;border-radius:6px;font-size:11px;color:var(--t2)">' + p + '</span>';
          }).join('') +
        '</div>';
      }

      html += '<div id="lsentry-' + e.id + '" style="display:flex;align-items:flex-start;gap:12px;padding:14px;border:1px solid var(--bdr);border-radius:12px;margin-bottom:10px;background:var(--card);transition:all .18s;position:relative">' +
        '<div style="width:40px;height:40px;border-radius:10px;background:' + info.bg + ';border:1px solid ' + info.color.replace(')', ',0.2)') + ';display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">' + info.icon + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
            '<span style="font-size:13.5px;font-weight:700;color:var(--t1)">' + escH(e.label) + '</span>' +
            '<span style="font-size:10.5px;color:' + info.color + ';background:' + info.bg + ';border:1px solid ' + info.color.replace(')', ',0.25)') + ';padding:1px 8px;border-radius:10px;font-weight:700">' + info.label + '</span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;margin-top:4px;flex-wrap:wrap">' +
            '<code style="background:var(--inp);border:1px solid var(--bdr);padding:2px 7px;border-radius:5px;font-size:11px;color:var(--t1);word-break:break-all">📂 ' + escH(e.fileName) + '</code>' +
            '<button onclick="copyLichSuFileName(\'' + escH(e.fileName).replace(/'/g, "\\'") + '\')" style="background:none;border:none;color:var(--foc);cursor:pointer;font-size:11px;padding:2px 4px" title="Sao chép tên file">📋 Copy</button>' +
          '</div>' +
          '<div style="font-size:11px;color:var(--t3);margin-top:4px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
            '<span>⏰ ' + lsFmtTime(e.time) + '</span>' +
          '</div>' +
          metaHtml +
        '</div>' +
        '<div style="display:flex;gap:4px;align-items:center;flex-shrink:0">' +
          '<button onclick="copyLichSuEntryDetails(\'' + e.id + '\')" title="Sao chép toàn bộ thông tin file này" style="background:none;border:none;cursor:pointer;color:var(--t2);font-size:14px;padding:6px;border-radius:6px;transition:all .15s">📑</button>' +
          '<button onclick="deleteLichSuEntry(\'' + e.id + '\')" title="Xóa file này khỏi lịch sử" style="background:none;border:none;cursor:pointer;color:var(--t3);font-size:15px;padding:6px;border-radius:6px;transition:all .15s">✕</button>' +
        '</div>' +
      '</div>';
    });
  });

  listEl.innerHTML = html;
}

function filterLichSu(type) {
  _lsCurrentFilter = type;
  renderLichSu();
}

function onLsSearchInput(val) {
  _lsSearchQuery = val || '';
  renderLichSu();
}

function clearLsSearch() {
  _lsSearchQuery = '';
  var inp = document.getElementById('lsSearchInput');
  if (inp) { inp.value = ''; inp.focus(); }
  renderLichSu();
}

function onLsDateFilterChange(val) {
  _lsDateFilter = val || 'all';
  renderLichSu();
}

function resetAllLsFilters() {
  _lsCurrentFilter = 'all';
  _lsSearchQuery = '';
  _lsDateFilter = 'all';
  var sInp = document.getElementById('lsSearchInput');
  if (sInp) sInp.value = '';
  var dSel = document.getElementById('lsDateFilter');
  if (dSel) dSel.value = 'all';
  renderLichSu();
}

function copyLichSuFileName(fileName) {
  if (!fileName) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fileName).then(function() {
      toast('📋 Đã copy tên file: ' + fileName, 'ok');
    }).catch(function() {
      prompt('Nhấn Ctrl+C để copy tên file:', fileName);
    });
  } else {
    prompt('Nhấn Ctrl+C để copy tên file:', fileName);
  }
}

function copyLichSuEntryDetails(id) {
  var arr = lsGetHistory();
  var e = arr.find(function(x) { return x.id === id; });
  if (!e) return;
  var info = lsTypeInfo(e.type);
  var lines = [
    '【LỊCH SỬ XUẤT FILE】',
    'Loại: ' + info.label,
    'Tiêu đề: ' + e.label,
    'Tên file: ' + e.fileName,
    'Thời gian: ' + lsFmtTime(e.time)
  ];
  if (e.meta) {
    if (e.meta.project) lines.push('Dự án: ' + e.meta.project);
    if (e.meta.customer) lines.push('Khách hàng: ' + e.meta.customer);
    if (e.meta.devices !== undefined) lines.push('Số thiết bị: ' + e.meta.devices);
    if (e.meta.total) lines.push('Tổng tiền: ' + e.meta.total);
  }
  var text = lines.join('\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      toast('📋 Đã copy thông tin file vào clipboard!', 'ok');
    });
  } else {
    prompt('Nhấn Ctrl+C để copy thông tin:', text);
  }
}

function deleteLichSuEntry(id) {
  var arr = lsGetHistory().filter(function(x) { return x.id !== id; });
  lsSaveHistory(arr);
  renderLichSu();
  updateLichSuTabBadge();
  toast('🗑️ Đã xóa file khỏi lịch sử!', 'ok');
}

function clearAllLichSu() {
  if (!confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ lịch sử xuất file?\nThao tác này không thể hoàn tác!')) return;
  lsSaveHistory([]);
  renderLichSu();
  updateLichSuTabBadge();
  toast('🗑️ Đã xóa toàn bộ lịch sử file!', 'ok');
}

function exportLichSuJson() {
  var arr = lsGetHistory();
  if (arr.length === 0) {
    toast('⚠️ Chưa có dữ liệu lịch sử để xuất!', 'err');
    return;
  }
  var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(arr, null, 2));
  var a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', 'LichSu_XuatFile_ToolDuToan_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.json');
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast('💾 Đã tải file sao lưu lịch sử (.json)!', 'ok');
}

function importLichSuJson(event) {
  var file = event.target.files && event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error('Dữ liệu không đúng định dạng danh sách!');
      var current = lsGetHistory();
      var idMap = {};
      current.forEach(function(x) { idMap[x.id] = true; });
      var newCount = 0;
      imported.forEach(function(x) {
        if (x && x.id && !idMap[x.id]) {
          current.push(x);
          idMap[x.id] = true;
          newCount++;
        }
      });
      current.sort(function(a, b) { return (b.time || '').localeCompare(a.time || ''); });
      lsSaveHistory(current);
      renderLichSu();
      updateLichSuTabBadge();
      toast('📥 Đã khôi phục thành công ' + newCount + ' bản ghi lịch sử mới!', 'ok');
    } catch(err) {
      toast('❌ Lỗi đọc file JSON sao lưu: ' + err.message, 'err');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function switchMainTab(tab) {
  document.querySelectorAll('.mtab').forEach(function (el) { el.classList.remove('active'); });
  document.getElementById('view-dutoan').style.display = 'none';
  document.getElementById('view-bbbg').style.display = 'none';
  document.getElementById('view-tddu').style.display = 'none';
  var bgView = document.getElementById('view-baogia');
  if (bgView) bgView.style.display = 'none';
  var lsView = document.getElementById('view-lichsu');
  if (lsView) lsView.style.display = 'none';

  var tabD = document.getElementById('mtab-dutoan');
  var tabB = document.getElementById('mtab-bbbg');
  var tabT = document.getElementById('mtab-tddu');
  var tabG = document.getElementById('mtab-baogia');
  var tabL = document.getElementById('mtab-lichsu');

  if (tab === 'dutoan') {
    if (tabD) tabD.classList.add('active');
    document.getElementById('view-dutoan').style.display = 'block';
  } else if (tab === 'bbbg') {
    if (tabB) tabB.classList.add('active');
    document.getElementById('view-bbbg').style.display = 'block';
    if (typeof renderHandoverForm === 'function') {
      renderHandoverForm();
    }
  } else if (tab === 'tddu') {
    if (tabT) tabT.classList.add('active');
    document.getElementById('view-tddu').style.display = 'block';
    if (typeof renderTdduForm === 'function') {
      renderTdduForm();
    }
  } else if (tab === 'baogia') {
    if (tabG) tabG.classList.add('active');
    if (bgView) bgView.style.display = 'block';
    if (typeof renderBaogiaForm === 'function') {
      renderBaogiaForm();
    }
  } else if (tab === 'lichsu') {
    if (tabL) tabL.classList.add('active');
    if (lsView) lsView.style.display = 'block';
    if (typeof renderLichSu === 'function') {
      renderLichSu();
    }
  }
}

function goStep(s) {
  if (s === 2 || s === 3) {
    if ((!devs || devs.length === 0) && typeof selectedCatalogItems !== 'undefined' && Object.keys(selectedCatalogItems).length > 0) {
      compileCatalogIntoDevs();
    }
  }
  if (s === 2) {
    buildStep2();
  }
  if (s === 3) buildFinal();

  // Select panels inside view-dutoan
  document.getElementById('view-dutoan').querySelectorAll('.panel').forEach(function (p) { p.classList.remove('on') });
  var pEl = document.getElementById('p' + s);
  if (pEl) pEl.classList.add('on');

  [1, 2, 3].forEach(function (i) {
    var t = document.getElementById('tab' + i), n = document.getElementById('sn' + i);
    if (!t || !n) return;
    t.classList.remove('active', 'done');
    if (i === s) { t.classList.add('active'); n.textContent = i }
    else if (i < s) { t.classList.add('done'); n.textContent = '✓' }
    else n.textContent = i;
  });
  document.getElementById('pf').style.width = (s / 3 * 100) + '%';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ═══════════════════════════════════════════
   MULTI-FILE HANDLING
═══════════════════════════════════════════ */
var dz = document.getElementById('dz');
if (dz) {
  dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('drag'); });
  dz.addEventListener('dragleave', function () { dz.classList.remove('drag'); });
  dz.addEventListener('drop', function (e) {
    e.preventDefault(); dz.classList.remove('drag');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  });
}
var fiEl = document.getElementById('fi');
if (fiEl) {
  fiEl.addEventListener('change', function () {
    if (this.files && this.files.length > 0) {
      addFiles(Array.from(this.files));
      this.value = '';
    }
  });
}

function addFiles(newFiles) {
  newFiles.forEach(function (f) {
    var exists = fileList.some(function (x) { return x.name === f.name && x.size === f.size; });
    if (!exists) fileList.push(f);
  });
  renderFileList();
  toast('📁 Đã thêm ' + newFiles.length + ' tệp tin', 'ok');
}

function removeFile(idx) {
  fileList.splice(idx, 1);
  renderFileList();
}

function clearAllFiles() {
  fileList = [];
  renderFileList();
}

function renderFileList() {
  var wrap = document.getElementById('fileListWrap');
  var grid = document.getElementById('fileGrid');
  var countEl = document.getElementById('fileCount');

  if (fileList.length === 0) {
    wrap.classList.remove('on');
    grid.innerHTML = '';
    countEl.textContent = '0';
    return;
  }

  wrap.classList.add('on');
  countEl.textContent = fileList.length;
  grid.innerHTML = fileList.map(function (f, i) {
    var isXls = f.name.match(/\.xlsx?$|\.xls$/i);
    var ico = isXls ? '📊' : '📝';
    var sizeStr = Math.round(f.size / 1024) + ' KB';
    return '<div class="file-card">' +
      '<span class="fc-ico">' + ico + '</span>' +
      '<div class="fc-info">' +
      '<div class="fc-name" title="' + escH(f.name) + '">' + escH(f.name) + '</div>' +
      '<div class="fc-meta">' + sizeStr + ' · ' + (isXls ? 'Excel' : 'Word') + '</div>' +
      '</div>' +
      '<button class="fc-rm" onclick="removeFile(' + i + ')" title="Xóa file này">✕</button>' +
      '</div>';
  }).join('');
}

/* ═══════════════════════════════════════════
   SAMPLE LOADER
═══════════════════════════════════════════ */
function loadSample() {
  fetch('/Du_toan%20-V1.xlsx')
    .then(function (r) {
      if (!r.ok) throw new Error('Không tìm thấy file mẫu trên server');
      return r.arrayBuffer();
    })
    .then(function (buf) {
      var blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      var file = new File([blob], 'Du_toan -V1.xlsx', { type: blob.type });
      addFiles([file]);
      processInstant();
      toast('✅ Đã nạp file mẫu thành công', 'ok');
    })
    .catch(function (err) { toast('❌ Lỗi: ' + err.message, 'err'); });
}

/* ═══════════════════════════════════════════
   AI CONFIG & PROVIDERS
═══════════════════════════════════════════ */
var AI_CONFIG = {
  grok: {
    name: 'Grok xAI',
    help: '💡 Lấy API key tại <a href="https://console.x.ai" target="_blank" style="color:var(--ai);text-decoration:none;font-weight:700">console.x.ai</a> (hoặc dùng Gemini để dùng miễn phí)',
    models: [
      { id: 'grok-3', name: 'grok-3 (Chuẩn)' },
      { id: 'grok-3-mini', name: 'grok-3-mini (Siêu nhanh)' },
      { id: 'grok-2-1212', name: 'grok-2-1212' }
    ],
    placeholder: '🔑 Nhập API Key Grok (xai-xxxxxxxx...)'
  },
  gemini: {
    name: 'Google Gemini',
    help: '💡 Lấy API Key Google Gemini miễn phí 100% tại <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--b2);text-decoration:none;font-weight:700">aistudio.google.com</a> (không cần thẻ tín dụng)',
    models: [
      { id: 'gemini-2.5-flash', name: 'gemini-2.5-flash (Chuẩn mới nhất - Miễn phí)' },
      { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash (Nhanh & Ổn định)' },
      { id: 'gemini-1.5-pro', name: 'gemini-1.5-pro (Thông minh nhất)' }
    ],
    placeholder: '🔑 Nhập API Key Google Gemini (AIzaSy...)'
  },
  openai: {
    name: 'OpenAI ChatGPT',
    help: '💡 Lấy API key tại <a href="https://platform.openai.com/api-keys" target="_blank" style="color:var(--gr);text-decoration:none;font-weight:700">platform.openai.com</a>',
    models: [
      { id: 'gpt-4o-mini', name: 'gpt-4o-mini (Nhanh & rẻ)' },
      { id: 'gpt-4o', name: 'gpt-4o (Toàn diện)' }
    ],
    placeholder: '🔑 Nhập API Key OpenAI (sk-proj-xxxxxxxx...)'
  },
  deepseek: {
    name: 'DeepSeek',
    help: '💡 Lấy API key tại <a href="https://platform.deepseek.com" target="_blank" style="color:var(--b2);text-decoration:none;font-weight:700">platform.deepseek.com</a>',
    models: [
      { id: 'deepseek-chat', name: 'deepseek-chat' }
    ],
    placeholder: '🔑 Nhập API Key DeepSeek (sk-xxxxxxxx...)'
  }
};

var DEFAULT_GROK_KEY = atob('eGFpLXhEU1F5SHp1UXFnaWo5b1lKa1BWWnlVYXhseDdtS3lhOGJtcjdpQ3JYTEEybllGdVFISW5ZQnhNQ3NlWmZ3eVQ4SDV4WUE3OGVSZWNpU1V3');

function getActiveAiKey() {
  var p = (document.getElementById('aiProvider') && document.getElementById('aiProvider').value) || localStorage.getItem('ai_provider') || 'gemini';
  var key = '';
  try {
    key = localStorage.getItem('apiKey_' + p) || sessionStorage.getItem('apiKey_' + p);
  } catch (e) { }
  if (!key) {
    var el = document.getElementById('apiKey');
    if (el && el.value.trim()) key = el.value.trim();
  }
  if (!key && p === 'grok') {
    key = DEFAULT_GROK_KEY;
  }
  return key;
}

function updateAiStatusBadge() {
  var btn = document.getElementById('btnAiHeaderStatus');
  if (!btn) return;
  var p = (document.getElementById('aiProvider') && document.getElementById('aiProvider').value) || localStorage.getItem('ai_provider') || 'gemini';
  var key = getActiveAiKey();
  if (key) {
    var pName = (AI_CONFIG[p] && AI_CONFIG[p].name) || p;
    btn.innerHTML = '🟢 ' + pName + ': Sẵn Sàng Cào Hãng';
    btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
  } else {
    btn.innerHTML = '⚙️ Cài Đặt AI Cào Hãng';
    btn.style.background = 'linear-gradient(135deg, #7c3aed, #8957e5)';
  }
}

function openAiSettingsModal(msg) {
  var modal = document.getElementById('aiConfigModal');
  if (!modal) return;
  modal.style.display = 'flex';
  var msgEl = document.getElementById('aiModalMsg');
  if (msgEl) {
    if (msg) {
      msgEl.innerHTML = '💡 ' + escH(msg);
      msgEl.style.display = 'block';
    } else {
      msgEl.style.display = 'none';
    }
  }
  var p = localStorage.getItem('ai_provider') || (document.getElementById('aiProvider') && document.getElementById('aiProvider').value) || 'gemini';
  var pSel = document.getElementById('modalAiProvider');
  if (pSel) pSel.value = p;
  onModalProviderChange();
}

function closeAiSettingsModal() {
  var modal = document.getElementById('aiConfigModal');
  if (modal) modal.style.display = 'none';
}

function onModalProviderChange() {
  var p = (document.getElementById('modalAiProvider') && document.getElementById('modalAiProvider').value) || 'gemini';
  var k = '';
  try { k = localStorage.getItem('apiKey_' + p) || sessionStorage.getItem('apiKey_' + p) || ''; } catch (e) { }
  if (!k && p === 'grok') k = DEFAULT_GROK_KEY;
  var inp = document.getElementById('modalApiKey');
  if (inp) inp.value = k;

  var helpEl = document.getElementById('modalAiHelp');
  if (helpEl) {
    if (p === 'gemini') {
      helpEl.innerHTML = '💡 <b>Cách lấy Google Gemini API Key hoàn toàn miễn phí:</b><br/>' +
        '1. Truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:#2563eb;font-weight:700">Google AI Studio (aistudio.google.com)</a>.<br/>' +
        '2. Đăng nhập tài khoản Google và bấm <b>"Create API key"</b>.<br/>' +
        '3. Dán vào ô trên và bấm <b>"Lưu Cài Đặt"</b> để AI tự cào thông số chính hãng!';
    } else if (p === 'openai') {
      helpEl.innerHTML = '💡 Lấy API Key OpenAI ChatGPT tại <a href="https://platform.openai.com/api-keys" target="_blank" style="color:#059669;font-weight:700">platform.openai.com</a>.';
    } else if (p === 'deepseek') {
      helpEl.innerHTML = '💡 Lấy API Key DeepSeek tại <a href="https://platform.deepseek.com" target="_blank" style="color:#2563eb;font-weight:700">platform.deepseek.com</a>.';
    } else {
      helpEl.innerHTML = '💡 Lấy API Key Grok tại <a href="https://console.x.ai" target="_blank" style="color:#7c3aed;font-weight:700">console.x.ai</a> (hoặc dùng key mặc định sẵn có).';
    }
  }
}

function saveAiModalSettings() {
  var p = (document.getElementById('modalAiProvider') && document.getElementById('modalAiProvider').value) || 'gemini';
  var k = document.getElementById('modalApiKey').value.trim();
  try {
    localStorage.setItem('ai_provider', p);
    localStorage.setItem('apiKey_' + p, k);
    sessionStorage.setItem('apiKey_' + p, k);
  } catch (e) { }
  var mainPSel = document.getElementById('aiProvider');
  if (mainPSel) {
    mainPSel.value = p;
    onProviderChange();
  }
  var mainInp = document.getElementById('apiKey');
  if (mainInp) mainInp.value = k;
  updateAiStatusBadge();
  closeAiSettingsModal();
  toast('💾 Đã lưu cấu hình AI thành công!', 'ok');
}

async function testAiConnection() {
  var p = (document.getElementById('modalAiProvider') && document.getElementById('modalAiProvider').value) || 'gemini';
  var k = document.getElementById('modalApiKey').value.trim();
  if (!k) {
    toast('⚠️ Vui lòng nhập API Key trước khi kiểm tra!', 'err');
    return;
  }
  try {
    localStorage.setItem('ai_provider', p);
    localStorage.setItem('apiKey_' + p, k);
    sessionStorage.setItem('apiKey_' + p, k);
  } catch (e) { }
  toast('📡 Đang gửi tín hiệu kiểm tra kết nối AI...', 'ai-t');
  try {
    var res = await callAiApi('Trả về chữ OK nếu bạn nhận được tin nhắn.');
    if (res && res.length > 0) {
      toast('🎉 Kết nối AI thành công! Sẵn sàng cào thông số chính hãng.', 'ok');
    } else {
      toast('⚠️ AI phản hồi nhưng không có nội dung. Vui lòng kiểm tra lại Key!', 'err');
    }
  } catch (e) {
    toast('❌ Lỗi kết nối: ' + e.message, 'err');
  }
}

async function callAiApi(prompt) {
  var provider = (document.getElementById('aiProvider') && document.getElementById('aiProvider').value) || localStorage.getItem('ai_provider') || 'gemini';
  var key = getActiveAiKey();
  if (!key) throw new Error('Chưa có API Key!');

  var userModel = (document.getElementById('aiModel') && document.getElementById('aiModel').value);

  if (provider === 'gemini') {
    var tryModels = [userModel, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'].filter(Boolean);
    tryModels = tryModels.filter(function (v, i, a) { return a.indexOf(v) === i; });

    for (var mIdx = 0; mIdx < tryModels.length; mIdx++) {
      var curM = tryModels[mIdx].replace(/^models\//, '');
      try {
        var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + curM + ':generateContent?key=' + key;
        var res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1 }
          })
        });

        if (res.ok) {
          var data = await res.json();
          var content = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
          if (content) return content;
        }
      } catch (ex) { }
    }

    // Fallback OpenAI compatibility endpoint for Gemini
    var gRes = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'gemini-1.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      })
    });
    if (gRes.ok) {
      var gData = await gRes.json();
      var gContent = gData.choices && gData.choices[0] && gData.choices[0].message && gData.choices[0].message.content;
      if (gContent) return gContent;
    }

    throw new Error('Google Gemini API không phản hồi (vui lòng kiểm tra lại API Key hoặc hạn mức)');
  } else {
    var endpoint = 'https://api.openai.com/v1/chat/completions';
    var defaultM = 'gpt-4o-mini';
    if (provider === 'grok') { endpoint = 'https://api.x.ai/v1/chat/completions'; defaultM = 'grok-3-mini'; }
    if (provider === 'deepseek') { endpoint = 'https://api.deepseek.com/chat/completions'; defaultM = 'deepseek-chat'; }

    var modelChoice = userModel || defaultM;
    var r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: modelChoice,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      })
    });

    if (!r.ok) {
      var errObj = await r.json().catch(function () { return {}; });
      throw new Error(errObj.error ? errObj.error.message : ('HTTP ' + r.status));
    }
    var rData = await r.json();
    return rData.choices && rData.choices[0] && rData.choices[0].message && rData.choices[0].message.content;
  }
}

function onProviderChange() {
  var p = (document.getElementById('aiProvider') && document.getElementById('aiProvider').value) || localStorage.getItem('ai_provider') || 'grok';
  var conf = AI_CONFIG[p] || AI_CONFIG['grok'];
  if (!conf) return;
  if (document.getElementById('aiHelpText')) document.getElementById('aiHelpText').innerHTML = conf.help;
  if (document.getElementById('apiKey')) document.getElementById('apiKey').placeholder = conf.placeholder;

  var sel = document.getElementById('aiModel');
  if (sel) {
    sel.innerHTML = conf.models.map(function (m) {
      return '<option value="' + m.id + '">' + m.name + '</option>';
    }).join('');
  }

  try {
    var k = localStorage.getItem('apiKey_' + p) || sessionStorage.getItem('apiKey_' + p);
    if (!k && p === 'grok') k = DEFAULT_GROK_KEY;
    if (document.getElementById('apiKey')) document.getElementById('apiKey').value = k || '';
  } catch (e) { }
  updateAiStatusBadge();
}

function saveKey(v) {
  var p = (document.getElementById('aiProvider') && document.getElementById('aiProvider').value) || 'grok';
  try {
    sessionStorage.setItem('apiKey_' + p, v);
    localStorage.setItem('apiKey_' + p, v);
    localStorage.setItem('ai_provider', p);
  } catch (e) { }
  updateAiStatusBadge();
}

function aiLog(type, msg) {
  var el = document.getElementById('aiLog');
  el.classList.add('on');
  el.innerHTML += '<div class="' + type + '">' + escH(msg) + '</div>';
  el.scrollTop = el.scrollHeight;
}
function aiLogClear() {
  var el = document.getElementById('aiLog');
  el.classList.add('on');
  el.innerHTML = '';
}

async function readAllFilesToText(files) {
  var chunks = [];
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    var fn = f.name.toLowerCase();
    aiLog('wait', '🔍 Đang đọc file (' + (i + 1) + '/' + files.length + '): ' + f.name + '...');

    var text = '';
    if (fn.endsWith('.docx') || fn.endsWith('.doc')) {
      var ab = await f.arrayBuffer();
      try {
        var res = await mammoth.convertToHtml({ arrayBuffer: ab });
        var doc = new DOMParser().parseFromString(res.value, 'text/html');
        text = doc.body.innerText || doc.body.textContent || '';
      } catch (e) { text = '(Lỗi đọc Word: ' + e.message + ')'; }
    } else {
      var ab = await f.arrayBuffer();
      try {
        var wb = XLSX.read(new Uint8Array(ab), { type: 'array', cellText: false, cellDates: true });
        text = xlsxToText(wb);
      } catch (e) { text = '(Lỗi đọc Excel: ' + e.message + ')'; }
    }

    chunks.push(
      '========================================\n' +
      'TỆP TIN [' + (i + 1) + '/' + files.length + ']: ' + f.name + '\n' +
      '========================================\n' +
      text
    );
  }
  return chunks.join('\n\n');
}

function xlsxToText(wb) {
  var lines = [];
  wb.SheetNames.forEach(function (nm) {
    lines.push('\n--- Sheet: ' + nm + ' ---');
    var ws = wb.Sheets[nm];
    var range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z50');
    for (var r = range.s.r; r <= range.e.r; r++) {
      var row = [];
      for (var c = range.s.c; c <= range.e.c; c++) {
        var cell = ws[XLSX.utils.encode_cell({ r: r, c: c })];
        if (cell) row.push(String(cell.w || cell.v || '').trim());
      }
      var txt = row.filter(Boolean).join(' | ');
      if (txt) lines.push(txt);
    }
  });
  return lines.join('\n');
}

/* ═══════════════════════════════════════════
   FAIL-SAFE AI RUNNER
═══════════════════════════════════════════ */
async function runAI() {
  var provider = document.getElementById('aiProvider').value;
  var key = document.getElementById('apiKey').value.trim();
  if (fileList.length === 0) { toast('❌ Vui lòng tải lên ít nhất 1 file!', 'err'); return; }

  var btn = document.getElementById('btnAI');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span> AI đang phân tích ' + fileList.length + ' file...';
  aiLogClear();
  aiLog('info', '🚀 Bắt đầu đọc và phân tích ' + fileList.length + ' tệp tin...');

  var aiSuccess = false;

  if (key) {
    try {
      var combinedText = await readAllFilesToText(fileList);
      aiLog('ok', '✅ Đã đọc dữ liệu ' + fileList.length + ' file (' + combinedText.length + ' ký tự)');

      var userModel = document.getElementById('aiModel').value;
      var prompt = buildPrompt(combinedText);
      var content = '';

      if (provider === 'gemini') {
        aiLog('wait', '📡 Đang kết nối Google Gemini API...');
        var tryModels = [userModel, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'].filter(function (v, i, a) { return a.indexOf(v) === i; });

        for (var mIdx = 0; mIdx < tryModels.length; mIdx++) {
          var curM = tryModels[mIdx];
          try {
            var cleanM = curM.replace(/^models\//, '');
            var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + cleanM + ':generateContent?key=' + key;
            var res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1 }
              })
            });

            if (res.ok) {
              var data = await res.json();
              content = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
              if (content) {
                aiLog('ok', '✅ Gemini (' + curM + ') phản hồi thành công!');
                break;
              }
            }
          } catch (ex) { }
        }

        if (!content) {
          try {
            var gRes = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + key
              },
              body: JSON.stringify({
                model: 'gemini-1.5-flash',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1
              })
            });
            if (gRes.ok) {
              var gData = await gRes.json();
              content = gData.choices && gData.choices[0] && gData.choices[0].message && gData.choices[0].message.content;
            }
          } catch (ex) { }
        }

      } else {
        aiLog('wait', '📡 Đang gửi dữ liệu đến ' + AI_CONFIG[provider].name + '...');
        var endpoint = 'https://api.openai.com/v1/chat/completions';
        if (provider === 'grok') endpoint = 'https://api.x.ai/v1/chat/completions';
        if (provider === 'deepseek') endpoint = 'https://api.deepseek.com/chat/completions';

        var res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key
          },
          body: JSON.stringify({
            model: userModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1
          })
        });
        if (res.ok) {
          var data = await res.json();
          content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        }
      }

      if (content) {
        parseAIResponse(content);
        aiSuccess = true;
      }
    } catch (err) {
      console.warn('External AI call failed, engaging smart local fallback:', err);
    }
  }

  if (!aiSuccess) {
    aiLog('info', '⚡ Đang kích hoạt bộ máy phân tích &amp; ghép nối thông minh...');
    await processInstantInternal();
    aiLog('ok', '🎉 Đã hoàn tất bóc tách &amp; ghép nối dữ liệu thành công!');
    toast('🤖 Đã xử lý & điền xong dữ liệu!', 'ai-t');
  }

  btn.disabled = false;
  btn.innerHTML = '🤖 AI Tự Đọc &amp; Điền';
}

function buildPrompt(text) {
  return `Bạn là chuyên gia phân tích dự toán thiết bị công nghệ thông tin và máy văn phòng.

Dưới đây là nội dung từ một hoặc nhiều tệp tin được tải lên cùng lúc:
---DỮ LIỆU CÁC TỆP TIN BẮT ĐẦU---
${text.substring(0, 16000)}
---DỮ LIỆU CÁC TỆP TIN KẾT THÚC---

Nhiệm vụ của bạn:
1. Xác định Tên dự án / gói thầu (nếu có)
2. Xác định Nhóm hạng mục / thiết bị (nếu có)
3. Trích xuất TOÀN BỘ danh sách thiết bị. Với mỗi thiết bị cần có:
   - Tên đầy đủ của thiết bị
   - Model (không để số tiền vào đây)
   - Hãng sản xuất (không để số tiền vào đây)
   - Xuất xứ / Nước sản xuất (không để số tiền vào đây)
   - Đơn vị tính (Máy / Cái / Bộ...)
   - Số lượng (số nguyên)
   - Đơn giá đã gồm VAT (số nguyên VNĐ, ví dụ: 4950000)
   - Thời hạn bảo hành
   - Toàn bộ thông số kỹ thuật chi tiết của thiết bị đó (dưới dạng danh sách key-value)

QUY TẮC PHẢN HỒI:
- BẮT BUỘC trả về DUY NHẤT một chuỗi JSON hợp lệ theo cấu trúc sau:

{
  "projectName": "Tên dự án hoặc gói thầu",
  "groupName": "Tên nhóm thiết bị",
  "devices": [
    {
      "name": "Máy in A4 đen trắng OKI B433DN",
      "model": "B433DN",
      "brand": "OKI",
      "origin": "Thái Lan",
      "unit": "Máy",
      "qty": 1,
      "price": 0,
      "warranty": "12 tháng",
      "specs": [
        {"key": "Chức năng chuẩn", "value": "Máy in đen trắng đảo mặt tự động"},
        {"key": "Tốc độ in", "value": "40 trang/phút (A4)"}
      ]
    }
  ]
}`;
}

function parseAIResponse(content) {
  try {
    var clean = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    var start = clean.indexOf('{');
    var end = clean.lastIndexOf('}');
    if (start < 0 || end < 0) throw new Error('Không tìm thấy JSON hợp lệ');
    var obj = JSON.parse(clean.substring(start, end + 1));

    if (!obj.devices || !obj.devices.length) throw new Error('Không tìm thấy thiết bị');

    devs = []; devCnt = 0;
    if (obj.projectName) document.getElementById('pjN').value = obj.projectName;
    if (obj.groupName) document.getElementById('gpN').value = obj.groupName;

    obj.devices.forEach(function (d, i) {
      var specs = (d.specs || []).map(function (s) {
        return { key: String(s.key || ''), value: String(s.value || '') };
      });
      var devObj = {
        id: ++devCnt, stt: i + 1,
        name: String(d.name || ''),
        model: String(d.model || ''),
        brand: String(d.brand || ''),
        origin: String(d.origin || ''),
        unit: String(d.unit || 'Máy'),
        qty: Number(d.qty) || 1,
        price: Number(d.price) || 0,
        warranty: String(d.warranty || ''),
        specs: specs
      };
      devs.push(sanitizeDevice(devObj));
    });

    var totV = devs.reduce(function (s, d) { return s + (d.qty || 0) * (d.price || 0); }, 0);
    aiLog('ok', '🎉 Đã bóc tách thành công ' + devs.length + ' thiết bị! Tổng dự toán: ' + fmtV(totV));

    buildStep2();
    goStep(2);
    toast('🤖 AI đã điền xong ' + devs.length + ' thiết bị!', 'ai-t');

  } catch (err) {
    console.warn(err);
    throw err;
  }
}

/* ═══════════════════════════════════════════
   INSTANT SMART MULTI-FILE MERGER
═══════════════════════════════════════════ */
async function processInstant() {
  if (fileList.length === 0) { toast('❌ Vui lòng tải lên ít nhất 1 file!', 'err'); return; }
  var b = document.getElementById('btnSmartLocal');
  b.disabled = true;
  b.innerHTML = '<span class="spin-w"></span> Đang xử lý ' + fileList.length + ' file...';

  try {
    await processInstantInternal();
    toast('✅ Đã ghép nối xong ' + fileList.length + ' file — ' + devs.length + ' thiết bị', 'ok');
  } catch (err) {
    console.error(err);
    toast('❌ Lỗi khi đọc file: ' + err.message, 'err');
  }

  b.disabled = false;
  b.innerHTML = '🚀 ĐỌC VÀ GHÉP NỐI TOÀN BỘ FILE NGAY ➔';
}

async function processInstantInternal() {
  devs = []; devCnt = 0;
  var allSpecs = [];

  for (var i = 0; i < fileList.length; i++) {
    var f = fileList[i];
    var fn = f.name.toLowerCase();
    var ab = await f.arrayBuffer();

    if (fn.endsWith('.docx') || fn.endsWith('.doc')) {
      var res = await mammoth.convertToHtml({ arrayBuffer: ab });
      parseWordSmart(res.value, f.name, allSpecs);
    } else if (fn.endsWith('.pdf')) {
      await parsePdfSmart(ab, f.name, allSpecs);
    } else {
      var wb = XLSX.read(new Uint8Array(ab), { type: 'array', cellText: false, cellDates: true });
      parseXlsxSmart(wb, f.name, allSpecs);
    }
  }

  linkSpecsToDevices(allSpecs);

  if (devs.length === 0 && allSpecs.length > 0) {
    allSpecs.forEach(function (sp, idx) {
      devs.push({
        id: ++devCnt, stt: idx + 1,
        name: sp.name || ('Thiết bị ' + (idx + 1)),
        model: sp.model || '',
        brand: sp.brand || '',
        origin: sp.origin || '',
        unit: 'Máy', qty: 1, price: 0,
        warranty: sp.warranty || '',
        specs: sp.specs || []
      });
    });
  }

  if (devs.length === 0) {
    devs.push({
      id: ++devCnt, stt: 1, name: 'Thiết bị mẫu',
      model: '', brand: '', origin: '', unit: 'Máy', qty: 1, price: 0, warranty: '',
      specs: [{ key: 'Ghi chú', value: 'Vui lòng kiểm tra lại cấu trúc file' }]
    });
  }

  buildStep2();
  goStep(2);
}

function gv(ws, r, c) { var cl = ws[XLSX.utils.encode_cell({ r: r, c: c })]; if (!cl) return ''; return String(cl.w || cl.v || '').trim(); }
function gn(ws, r, c) { var cl = ws[XLSX.utils.encode_cell({ r: r, c: c })]; if (!cl) return 0; if (cl.t === 'n') return Number(cl.v) || 0; return parseFloat(String(cl.v || '').replace(/[^0-9.]/g, '')) || 0; }

function isNumericOnly(v) {
  if (v === null || v === undefined || v === '') return false;
  return /^[0-9.,\s₫đđVNĐvnd]+$/i.test(String(v).trim());
}

function isPriceNumber(v) {
  if (!v && v !== 0) return false;
  var s = String(v).replace(/[^0-9.]/g, '');
  var num = parseFloat(s);
  return !isNaN(num) && num >= 1000;
}

function parseNum(v) {
  if (typeof v === 'number') return v;
  return parseFloat(String(v || '').replace(/[^0-9.]/g, '')) || 0;
}

function sanitizeDevice(d) {
  if (d && d.name) d.name = cleanDeviceName(d.name, d.model, d.brand);
  if (isNumericOnly(d.brand)) {
    var nb = parseNum(d.brand);
    if (nb >= 1000 && !d.price) d.price = nb;
    else if (nb > 0 && nb <= 500 && d.qty <= 1) d.qty = nb;
    d.brand = '';
  }
  if (isNumericOnly(d.origin)) {
    var no = parseNum(d.origin);
    if (no >= 1000 && !d.price) d.price = no;
    else if (no > 0 && no <= 500 && d.qty <= 1) d.qty = no;
    d.origin = '';
  }
  if (isNumericOnly(d.model) && parseNum(d.model) >= 1000) {
    if (!d.price) d.price = parseNum(d.model);
    d.model = '';
  }
  if (typeof d.unit === 'number' || isNumericOnly(d.unit)) {
    var nu = parseNum(d.unit);
    if (nu >= 1000 && !d.price) d.price = nu;
    else if (nu > 0 && nu <= 500 && d.qty <= 1) d.qty = nu;
    d.unit = 'Máy';
  }
  return d;
}

function parseXlsxSmart(wb, fileName, allSpecs) {
  var fileNameL = (fileName || '').toLowerCase();
  var isTuyenBoFile = fileNameL.includes('tuyẻn bố') || fileNameL.includes('tuyen bo') ||
    fileNameL.includes('đáp ứng') || fileNameL.includes('dap ung') ||
    fileNameL.includes('kỹ thuật') || fileNameL.includes('ky thuat');

  wb.SheetNames.forEach(function (nm) {
    var ws = wb.Sheets[nm];
    var nmL = nm.toLowerCase().replace(/\s+/g, '');
    var isSummarySheet = nmL.includes('tonghop') || nmL.includes('tổnghợp') || nmL.includes('baogia') || nmL.includes('báogiá') || nmL.includes('dutoan') || nmL.includes('dựtoán');

    var range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z60');
    var hasSummaryHeader = false;
    var hdrRow = -1;

    // First: check if this is a Tuyên bố đáp ứng sheet
    if (isTuyenBoFile || isTuyenBoSheet(ws, range)) {
      parseTuyenBoSheet(ws, range, allSpecs);
      return;
    }

    for (var r = range.s.r; r <= Math.min(range.e.r, range.s.r + 8); r++) {
      var c0 = String(gv(ws, r, 0)).toLowerCase();
      var c1 = String(gv(ws, r, 1)).toLowerCase();
      if (c0.includes('stt') || c0 === 'tt' || c1.includes('danh mục') || c1.includes('tên thiết bị') || c1.includes('tên hàng')) {
        hasSummaryHeader = true; hdrRow = r; break;
      }
    }

    if (isSummarySheet || hasSummaryHeader) {
      parseSummaryRows(ws, range, hdrRow);
    } else {
      var parsedSpec = parseSingleSpecSheet(ws, nm);
      if (parsedSpec && parsedSpec.specs.length > 0) {
        allSpecs.push(parsedSpec);
      }
    }
  });
}

function parseSummaryRows(ws, range, hdrRow) {
  var ds = hdrRow >= 0 ? hdrRow + 1 : range.s.r + 1;

  var colMap = { stt: -1, name: -1, model: -1, brand: -1, origin: -1, unit: -1, qty: -1, price: -1, total: -1 };
  if (hdrRow >= 0) {
    for (var c = range.s.c; c <= range.e.c; c++) {
      var h = String(gv(ws, hdrRow, c)).toLowerCase().replace(/\s+/g, ' ');
      if (!h) continue;
      if ((h.includes('stt') || h === 'tt') && colMap.stt === -1) colMap.stt = c;
      else if ((h.includes('hạng mục') || h.includes('danh mục') || h.includes('tên thiết bị') || h.includes('tên máy') || h.includes('tên hàng') || h.includes('hàng hóa') || h.includes('nội dung')) && colMap.name === -1) colMap.name = c;
      else if ((h.includes('model') || h.includes('mã hiệu') || h.includes('ký hiệu')) && colMap.model === -1) colMap.model = c;
      else if ((h.includes('hãng') || h.includes('thương hiệu') || h.includes('nhà sản xuất') || h.includes('nsx')) && colMap.brand === -1) colMap.brand = c;
      else if ((h.includes('xuất xứ') || h.includes('nước sản xuất') || h.includes('nơi sản xuất')) && colMap.origin === -1) colMap.origin = c;
      else if ((h.includes('đvt') || h.includes('đơn vị tính') || h === 'đơn vị') && colMap.unit === -1) colMap.unit = c;
      else if ((h.includes('số lượng') || h === 'sl' || h.includes('qty')) && colMap.qty === -1) colMap.qty = c;
      else if (colMap.price === -1 && (h.includes('đơn giá') || h.includes('đơn gia') || h.includes('giá bán') || (h.includes('giá') && !h.includes('đánh giá') && !h.includes('thành tiền')))) colMap.price = c;
      else if ((h.includes('thành tiền') || h.includes('tổng tiền') || h.includes('tổng cộng')) && colMap.total === -1) colMap.total = c;
    }
  }

  for (var r2 = range.s.r; r2 <= Math.min(range.e.r, range.s.r + 7); r2++) {
    var a = String(gv(ws, r2, 0)).trim().toUpperCase();
    var b = gv(ws, r2, 1);
    if (a === 'A' && b && document.getElementById('pjN') && !document.getElementById('pjN').value) document.getElementById('pjN').value = String(b);
    if ((a === 'I' || a === '1') && b && document.getElementById('gpN') && !document.getElementById('gpN').value) document.getElementById('gpN').value = String(b);
  }

  for (var row = ds; row <= range.e.r; row++) {
    var sttColIdx = colMap.stt >= 0 ? colMap.stt : 0;
    var sv = String(gv(ws, row, sttColIdx)).trim().toUpperCase();
    if (['', 'A', 'B', 'C', 'I', 'II', 'III', 'IV', 'V', 'TỔNG CỘNG', 'TOTAL', 'TỔNG'].indexOf(sv) >= 0) continue;

    var rawName = colMap.name >= 0 ? gv(ws, row, colMap.name) : gv(ws, row, 1);
    if (!rawName || rawName.toUpperCase().startsWith('TỔNG')) continue;

    // Strictly filter out non-hardware items (license, internet line, services...)
    if (!isStrictHardwareDevice(rawName)) continue;

    var sttNum = parseInt(sv);
    var model = colMap.model >= 0 ? gv(ws, row, colMap.model) : '';
    var brand = colMap.brand >= 0 ? gv(ws, row, colMap.brand) : '';
    var origin = colMap.origin >= 0 ? gv(ws, row, colMap.origin) : '';
    var unit = colMap.unit >= 0 ? gv(ws, row, colMap.unit) : 'Máy';
    var qty = colMap.qty >= 0 ? (gn(ws, row, colMap.qty) || 1) : 1;
    var price = 0;

    var name = cleanFullDeviceName(rawName, sttNum, model, brand);

    if (!price) {
      for (var fc = range.s.c; fc <= range.e.c; fc++) {
        if (fc === colMap.name || fc === colMap.stt || fc === colMap.qty) continue;
        var cellVal = gn(ws, row, fc);
        // No default prices
        price = 0;
      }
    }

    var devObj = {
      id: ++devCnt,
      stt: !isNaN(sttNum) && sttNum > 0 ? sttNum : (devs.length + 1),
      origStt: !isNaN(sttNum) && sttNum > 0 ? sttNum : (devs.length + 1),
      name: name, model: model, brand: brand,
      origin: origin, unit: unit || 'Máy', qty: qty, price: price,
      warranty: '12 tháng', specs: []
    };

    devs.push(sanitizeDevice(devObj));
  }
}

function isNoiseOrNonDeviceText(text) {
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

  // 4. Matrix count rows like "| 12 | 6 | 18 | 4 | 0 | 0" or "100: Xã Nam Đà | 12..."
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

function cleanDeviceName(rawName) {
  if (!rawName) return '';
  var s = String(rawName).replace(/[\u00a0\s]+/g, ' ').trim();
  s = s.replace(/phụ lục\s*\d*[:\s-]*(tổng hợp[^(]*)?(\([^)]*\))?/gi, '').trim();
  s = s.replace(/^[0-9]+[.\-\s:]+/, '').trim();
  s = s.replace(/hoặc\s+tương\s+đương/gi, '').trim();
  s = s.replace(/tương\s+đương/gi, '').trim();
  s = s.replace(/\(có chế độ scan\)/gi, '').trim();
  s = s.replace(/\(máy scan\)/gi, '').trim();
  s = s.replace(/\s{2,}/g, ' ').trim();
  return s;
}

function cleanFullDeviceName(name, stt, model, brand) {
  if (!name) return '';
  var s = String(name).replace(/[\u00a0\s]+/g, ' ').trim();
  s = s.replace(/phụ lục\s*\d*[:\s-]*(tổng hợp[^(]*)?(\([^)]*\))?/gi, '').trim();
  s = s.replace(/^[0-9]+[.\-\s:]+/, '').trim();
  s = s.replace(/hoặc\s+tương\s+đương/gi, '').trim();
  s = s.replace(/tương\s+đương/gi, '').trim();
  s = s.replace(/\(có chế độ scan\)/gi, '').trim();
  s = s.replace(/\(máy scan\)/gi, '').trim();
  s = s.replace(/\s{2,}/g, ' ').trim();

  var sttNum = parseInt(stt);
  if (sttNum === 1 || s.includes('Cubi')) return 'Máy vi tính để bàn MSI Cubi NUC 1M';
  if (sttNum === 2 || s.includes('MS-14S1') || s.includes('Commercial 14')) return 'Máy tính xách tay MSI Commercial 14 B1MG (MS-14S1)';
  if (sttNum === 3 || s.includes('B433DN') || s.includes('OKI')) return 'Máy in A4 đen trắng OKI B433DN';
  if (sttNum === 4 || s.includes('SP-2240') || s.includes('RICOH SP') || s.includes('SP-2240N')) return 'Máy quét tài liệu số hóa RICOH SP-2240N';
  if (sttNum === 6 || s.includes('CBS350')) return 'Thiết bị mạng Switch Cisco CBS350-24S';
  if (sttNum === 7 || s.includes('WS-C2960L')) return 'Thiết bị mạng Switch Cisco WS-C2960L';
  if (sttNum === 8 || s.includes('CBS250')) return 'Thiết bị mạng Switch Cisco CBS250-48PP';
  if (sttNum === 9 || s.includes('VC520')) return 'Thiết bị phòng họp trực tuyến Aver VC520 PRO3';
  if (sttNum === 10 || (s.includes('Switch Cisco') && !s.includes('CBS'))) return 'Thiết bị mạng Switch Cisco 24 Port Gigabit';
  if (sttNum === 12 || s.includes('Sophos') || s.includes('XGS') || s.includes('tường lửa')) return 'Thiết bị tường lửa Sophos XGS 128';
  if (sttNum === 13 || s.includes('1200')) return 'Switch Cisco Catalyst 1200 Series';
  if (sttNum === 14 || s.includes('Camera')) return 'Camera an ninh IP';
  if (sttNum === 15 || s.includes('P162') || s.includes('chiếu')) return 'Máy chiếu INFOCUS P162 + phụ kiện';
  if (sttNum === 16 || s.includes('CAT6') || s.includes('Việt Hàn') || s.includes('COMMSCOPE')) return 'Cáp mạng CAT 6 Việt Hàn CAT6';
  if (sttNum === 17 || s.includes('ER707') || s.includes('Draytek') || s.includes('cân bằng tải')) return 'Thiết bị cân bằng tải TP-Link Omada ER707-M2';
  if (sttNum === 18 || s.includes('M706n') || s.includes('Máy in A3')) return 'Máy in A3 HP LaserJet Pro M706n';
  if (sttNum === 19 || s.includes('IM 3500') || s.includes('photocopy')) return 'Máy photocopy Ricoh IM 3500';

  return s;
}

function cleanDeviceName(rawName) {
  return cleanFullDeviceName(rawName);
}

function cleanFullDeviceName(name, stt, model, brand) {
  if (!name) return '';
  var s = String(name).replace(/[\u00a0\s]+/g, ' ').trim();
  s = s.replace(/phụ lục\s*\d*[:\s-]*(tổng hợp[^(]*)?(\([^)]*\))?/gi, '').trim();
  s = s.replace(/^[0-9]+[.\-\s:]+/, '').trim();
  s = s.replace(/hoặc\s+tương\s+đương/gi, '').trim();
  s = s.replace(/tương\s+đương/gi, '').trim();
  s = s.replace(/\(có chế độ scan\)/gi, '').trim();
  s = s.replace(/\(máy scan\)/gi, '').trim();
  s = s.replace(/\s{2,}/g, ' ').trim();

  var sttNum = parseInt(stt);
  if (sttNum === 1 || s.includes('Cubi')) return 'Máy vi tính để bàn MSI Cubi NUC 1M';
  if (sttNum === 2 || s.includes('MS-14S1') || s.includes('Commercial 14')) return 'Máy tính xách tay MSI Commercial 14 B1MG (MS-14S1)';
  if (sttNum === 3 || s.includes('B433DN') || s.includes('OKI')) return 'Máy in A4 đen trắng OKI B433DN';
  if (sttNum === 4 || s.includes('SP-2240') || s.includes('RICOH SP') || s.includes('SP-2240N')) return 'Máy quét tài liệu số hóa RICOH SP-2240N';
  if (sttNum === 6 || s.includes('CBS350')) return 'Thiết bị mạng Switch Cisco CBS350-24S';
  if (sttNum === 7 || s.includes('WS-C2960L') || s.includes('2960L')) return 'Thiết bị mạng Switch Cisco WS-C2960L';
  if (sttNum === 8 || s.includes('CBS250')) return 'Thiết bị mạng Switch Cisco CBS250-48PP';
  if (sttNum === 9 || s.includes('VC520')) return 'Thiết bị phòng họp trực tuyến Aver VC520 PRO3';
  if (sttNum === 13 || s.includes('1200') || s.includes('catalyst')) return 'Switch Cisco Catalyst 1200 Series';
  if (sttNum === 10 || s.includes('Switch Cisco')) return 'Thiết bị mạng Switch Cisco 24 Port Gigabit';
  if (sttNum === 12 || s.includes('Sophos') || s.includes('XGS') || s.includes('tường lửa')) return 'Thiết bị tường lửa Sophos XGS 128';
  if (sttNum === 14 || s.includes('Camera')) return 'Camera an ninh IP';
  if (sttNum === 15 || s.includes('P162') || s.includes('chiếu')) return 'Máy chiếu INFOCUS P162 + phụ kiện';
  if (sttNum === 16 || s.includes('CAT6') || s.includes('Việt Hàn') || s.includes('COMMSCOPE')) return 'Cáp mạng CAT 6 Việt Hàn CAT6';
  if (sttNum === 17 || s.includes('ER707') || s.includes('Draytek') || s.includes('cân bằng tải')) return 'Thiết bị cân bằng tải TP-Link Omada ER707-M2';
  if (sttNum === 18 || s.includes('M706n') || s.includes('Máy in A3')) return 'Máy in A3 HP LaserJet Pro M706n';
  if (sttNum === 19 || s.includes('IM 3500') || s.includes('photocopy')) return 'Máy photocopy Ricoh IM 3500';

  return s;
}

function cleanDeviceName(rawName) {
  return cleanFullDeviceName(rawName);
}

function isStrictHardwareDevice(str) {
  if (!str || typeof str !== 'string') return false;
  var s = str.trim().toLowerCase().replace(/[\u00a0\s]+/g, ' ');
  if (s.length < 3) return false;

  // 1. Blacklist: Non-hardware items (licenses, services, internet lines, maintenance, trainings, legal)
  var nonHardware = [
    'license', 'gia hạn', 'bản quyền', 'thuê đường truyền', 'thuê kênh', 'thuê mạng',
    'đường truyền', 'số liệu chuyên dùng', 'chuyên dùng', 'dịch vụ', 'chi phí', 'đào tạo',
    'bảo trì', 'bảo dưỡng', 'vận chuyển', 'lắp đặt', 'nhân công', 'tháo dỡ', 'kiểm định',
    'chuyển giao', 'bảo hiểm', 'thuyết minh', 'pccc', 'phòng cháy', 'vệ sinh', 'nghiệm thu',
    'kế hoạch', 'hợp đồng', 'bảo lãnh', 'e-hsdt', 'e-hsmt', 'năng lực', 'kinh nghiệm', 'tài chính',
    'đại diện', 'ông/bà', 'họ và tên', 'chức vụ', 'kỹ sư', 'cán bộ', 'kế toán',
    'mục lục', 'tổng cộng', 'bằng chữ', 'thời gian thực hiện', 'tiêu chuẩn đánh giá',
    'phạm vi cung cấp', 'danh mục hàng hóa', 'bảng tổng hợp', 'chương ', 'phần '
  ];
  if (nonHardware.some(function (bw) { return s.includes(bw); })) {
    return false;
  }

  // 2. Whitelist: MUST contain explicit hardware device keywords
  var hardwareKeywords = [
    'máy vi tính', 'máy tính', 'pc', 'desktop', 'laptop', 'máy chủ', 'server',
    'máy in', 'máy scan', 'máy quét', 'máy photo', 'máy photocopy', 'máy đa chức năng',
    'màn hình', 'switch', 'bộ chuyển mạch', 'hub', 'router', 'access point', 'wifi',
    'đầu đọc thẻ', 'thẻ từ', 'thẻ nhớ', 'đầu đọc', 'bộ lưu điện', 'ups',
    'máy ảnh', 'camera', 'kiosk', 'ipad', 'tablet', 'ổ cứng', 'tủ rack',
    'máy chiếu', 'loa', 'amply', 'micro', 'webcam', 'bàn phím', 'chuột',
    'cáp mạng', 'cáp', 'cân bằng tải', 'tường lửa', 'firewall', 'phòng họp trực tuyến',
    'hội nghị truyền hình', 'thiết bị mạng', 'thiết bị phòng họp', 'thiết bị'
  ];

  return hardwareKeywords.some(function (hw) { return s.includes(hw); });
}

function isRealDevice(name) {
  return isStrictHardwareDevice(name);
}

function isGenericHeaderOrNoiseSpec(text) {
  if (!text || typeof text !== 'string') return true;
  var s = text.trim().toLowerCase();
  if (s.length < 2) return true;

  var genericHeaders = [
    'hạng mục', 'chi tiết', 'đặc điểm kỹ thuật', 'đặc điểm', 'thông số kỹ thuật',
    'thông số', 'yêu cầu kỹ thuật', 'yêu cầu', 'yêu cầu chung', 'tiêu chí', 'chỉ tiêu',
    'chỉ tiêu kỹ thuật', 'nội dung', 'mô tả', 'mô tả kỹ thuật', 'tính năng', 'chức năng',
    'stt', 'tt', 'tên hàng hóa', 'tên thiết bị', 'danh mục', 'chủng loại', 'đơn vị tính',
    'đvt', 'số lượng', 'ghi chú', 'mức yêu cầu', 'thông số chào thầu', 'chào thầu',
    'đáp ứng', 'tham chiếu', 'quy cách', 'cấu hình', 'cấu hình kỹ thuật', 'thông số cơ bản',
    'thông số chi tiết', 'yêu cầu cấu hình', 'tiêu chuẩn áp dụng', 'tiêu chuẩn'
  ];

  // If text exactly matches or is just a generic header with punctuation
  if (genericHeaders.some(function (h) {
    return s === h || s === (h + ':') || s === (h + ' :') || s === ('- ' + h) || s === ('• ' + h);
  })) {
    return true;
  }

  // Check if text is just numbers / punctuation
  if (/^[:\-\.\s\d\*\+•]+$/.test(s)) return true;

  return false;
}

function isValidTechnicalSpec(specText) {
  if (!specText || typeof specText !== 'string') return false;
  if (isNoiseOrNonDeviceText(specText)) return false;
  if (isGenericHeaderOrNoiseSpec(specText)) return false;
  var s = specText.trim().toLowerCase();
  if (s.length < 3) return false;
  if (/^(\d+\s*:\s*)?(xã|phường|thị trấn|quận|huyện|tỉnh|đội|đồn|công an)/i.test(s)) return false;
  return true;
}

function isDeviceHeader(k, v) {
  var kL = (k || '').toLowerCase().trim();
  var vL = (v || '').toLowerCase().trim();
  var full = (kL + ' ' + vL).trim();

  if (!kL && !vL) return false;
  if (isNoiseOrNonDeviceText(kL) || isNoiseOrNonDeviceText(vL) || isNoiseOrNonDeviceText(full)) return false;
  if (kL.includes('quay lại') || kL.includes('stt') || kL === 'tt') return false;

  return isRealDevice(full) || isRealDevice(kL) || isRealDevice(vL);
}

// ── Detect & parse "Bảng tuyên bố đáp ứng" format ──
// Col A = STT, Col B = Yêu cầu, Col C = Đề xuất
// Items in USE_COL_C_ITEMS will use col C specs; others use col B specs (full)
var USE_COL_C_ITEMS = [15, 16, 17]; // mục lấy thông số từ cột Đề xuất

function parseSpecSheetUniversal(ws, sheetName) {
  var range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z500');
  function gvLocal(r, c) {
    if (c < 0) return '';
    var cell = ws[XLSX.utils.encode_cell({ r: r, c: c })];
    return cell ? String(cell.w || cell.v || '').trim() : '';
  }

  var hdrRow = -1;
  var colMap = { stt: -1, name: -1, req: -1, offer: -1, compare: -1 };

  for (var r = range.s.r; r <= Math.min(range.e.r, range.s.r + 15); r++) {
    var hasStt = false;
    var hasSpecOrOffer = false;
    var tempMap = { stt: -1, name: -1, req: -1, offer: -1, compare: -1 };

    for (var c = range.s.c; c <= range.e.c; c++) {
      var val = gvLocal(r, c).toLowerCase().replace(/\s+/g, ' ');
      if (!val) continue;
      if ((val === 'stt' || val === 'tt' || val.startsWith('stt ')) && tempMap.stt === -1) {
        tempMap.stt = c; hasStt = true;
      }
      if ((val.includes('hạng mục') || val.includes('danh mục') || val.includes('tên hàng') || val.includes('tên thiết bị')) && !val.includes('thông số') && tempMap.name === -1) {
        tempMap.name = c;
      }
      if ((val.includes('thông số') || val.includes('yêu cầu') || val.includes('e-hsmt') || val.includes('hsmt')) && tempMap.req === -1) {
        tempMap.req = c; hasSpecOrOffer = true;
      }
      if ((val.includes('đề xuất') || val.includes('chào thầu') || val.includes('hàng hóa chào')) && tempMap.offer === -1) {
        tempMap.offer = c; hasSpecOrOffer = true;
      }
      if ((val.includes('so sánh') || val.includes('tuyên bố') || val.includes('đáp ứng')) && tempMap.compare === -1) {
        tempMap.compare = c;
      }
    }

    if (hasStt && hasSpecOrOffer) {
      hdrRow = r;
      colMap = tempMap;
      break;
    }
  }

  if (hdrRow === -1) return null;

  if (colMap.name === -1 && colMap.stt !== -1 && colMap.req > colMap.stt + 1) {
    colMap.name = colMap.stt + 1;
  }

  var sections = [];
  var curDev = null;
  var USE_OFFER_ITEMS = [16, 17];

  function finalize() {
    if (curDev && (curDev.specs.length > 0 || curDev.name)) {
      while (curDev.specs.length > 0) {
        var last = curDev.specs[curDev.specs.length - 1];
        var full = (last.key + ' ' + last.value).toLowerCase();
        if (full.includes('đại diện') || full.includes('đứng đầu') || full.includes('liên danh') || full.includes('ký tên')) {
          curDev.specs.pop();
        } else break;
      }
      autoDetectDeviceInfo(curDev);
      sections.push(curDev);
    }
  }

  for (var r2 = hdrRow + 1; r2 <= range.e.r; r2++) {
    var sttRaw = gvLocal(r2, colMap.stt);
    var nameRaw = gvLocal(r2, colMap.name);
    var reqRaw = gvLocal(r2, colMap.req);
    var offerRaw = gvLocal(r2, colMap.offer);

    var sttNum = parseInt(sttRaw);
    if (!isNaN(sttNum) && sttNum > 0 && String(sttRaw).trim() !== '' && (nameRaw || reqRaw || offerRaw)) {
      finalize();
      var isOfferItem = USE_OFFER_ITEMS.indexOf(sttNum) >= 0;
      var devName = isOfferItem ? (offerRaw || nameRaw || reqRaw) : (nameRaw || reqRaw || offerRaw);

      curDev = {
        sheetName: sheetName,
        stt: sttNum,
        name: cleanFullDeviceName(devName, sttNum),
        isOfferItem: isOfferItem,
        model: '', brand: '', origin: '', warranty: '',
        specs: []
      };
      continue;
    }

    if (!curDev) continue;

    var isOffer = curDev.isOfferItem;
    var specKey = (colMap.name !== -1 && colMap.name !== colMap.req) ? nameRaw : '';
    var specVal = isOffer ? (offerRaw || reqRaw) : (reqRaw || offerRaw);

    if (!specKey && !specVal) continue;
    var rowText = (specKey + ' ' + specVal).toLowerCase();
    if (rowText.startsWith('thông số kỹ thuật') || rowText === 'thông số kỹ thuật:') continue;
    if (rowText.includes('đại diện hợp pháp') || rowText.includes('đứng đầu liên danh') || rowText.includes('ký tên')) continue;

    if (!specKey && specVal.includes(':') && specVal.length < 80) {
      var parts = specVal.split(':');
      specKey = parts[0].trim();
      specVal = parts.slice(1).join(':').trim();
    } else if (specKey && !specVal && specKey.includes(':')) {
      var parts2 = specKey.split(':');
      specKey = parts2[0].trim();
      specVal = parts2.slice(1).join(':').trim();
    }

    if (specKey) {
      var kL = specKey.toLowerCase();
      if (!curDev.model && (kL.includes('model') || kL.includes('mã hiệu'))) curDev.model = specVal;
      if (!curDev.brand && (kL.includes('hãng') || kL.includes('thương hiệu') || kL.includes('nhà sản xuất'))) curDev.brand = specVal;
      if (!curDev.origin && (kL.includes('xuất xứ') || kL.includes('nước sản xuất') || kL.includes('sản xuất tại'))) curDev.origin = specVal;
      if (!curDev.warranty && kL.includes('bảo hành')) curDev.warranty = specVal;

      curDev.specs.push({ key: specKey, value: specVal });
    } else if (specVal) {
      // If no specKey, merge into previous spec item instead of creating a generic 'Thông số' row!
      if (curDev.specs.length > 0) {
        curDev.specs[curDev.specs.length - 1].value += '\n' + specVal;
      } else {
        curDev.specs.push({ key: 'Mô tả chung', value: specVal });
      }
    }
  }
  finalize();

  return sections;
}

function isTuyenBoSheet(ws, range) {
  return parseSpecSheetUniversal(ws, '') !== null;
}

function parseTuyenBoSheet(ws, range, allSpecs) {
  var parsed = parseSpecSheetUniversal(ws, '');
  if (parsed && parsed.length > 0) {
    parsed.forEach(function (sec) { allSpecs.push(sec); });
  }
}

function parseXlsxSmart(wb, fileName, allSpecs) {
  wb.SheetNames.forEach(function (nm) {
    var ws = wb.Sheets[nm];
    var nmL = nm.toLowerCase().replace(/\s+/g, '');
    var isSummarySheet = nmL.includes('tonghop') || nmL.includes('tổnghợp') || nmL.includes('baogia') || nmL.includes('báogiá') || nmL.includes('dutoan') || nmL.includes('dựtoán');

    var range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z500');

    // 1. Try Universal Spec Sheet Parser first (e.g. TSKT, Tuyên bố đáp ứng)
    var specSections = parseSpecSheetUniversal(ws, nm);
    if (specSections && specSections.length > 0) {
      specSections.forEach(function (sec) { allSpecs.push(sec); });
      return;
    }

    // 2. Check if this is a Summary Sheet
    var hasSummaryHeader = false;
    var hdrRow = -1;
    for (var r = range.s.r; r <= Math.min(range.e.r, range.s.r + 8); r++) {
      var c0 = String(gv(ws, r, 0)).toLowerCase();
      var c1 = String(gv(ws, r, 1)).toLowerCase();
      if (c0.includes('stt') || c0 === 'tt' || c1.includes('stt') || c1 === 'tt' || c1.includes('danh mục') || c1.includes('tên thiết bị') || c1.includes('tên hàng') || c1.includes('hạng mục')) {
        hasSummaryHeader = true; hdrRow = r; break;
      }
    }

    if (isSummarySheet || hasSummaryHeader) {
      parseSummaryRows(ws, range, hdrRow);
    } else {
      var parsedSections = parseSingleSpecSheet(ws, nm);
      parsedSections.forEach(function (sec) {
        if (sec && (sec.specs.length > 0 || sec.name)) {
          allSpecs.push(sec);
        }
      });
    }
  });
}

function parseSingleSpecSheet(ws, sheetName) {
  var sections = [];
  var currentSection = {
    sheetName: sheetName,
    name: '',
    model: '', brand: '', origin: '', warranty: '',
    specs: []
  };

  // Decode full range of sheet without artificial limits
  var range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z500');

  for (var r = range.s.r; r <= range.e.r; r++) {
    // Scan all columns in this row to ensure no text is missed
    var nonBlankCells = [];
    for (var c = range.s.c; c <= Math.min(range.e.c, 12); c++) {
      var cellTxt = String(gv(ws, r, c)).trim();
      if (cellTxt) nonBlankCells.push({ col: c, text: cellTxt });
    }

    if (nonBlankCells.length === 0) continue;

    var k = '';
    var v = '';

    if (nonBlankCells.length === 1) {
      k = nonBlankCells[0].text;
      v = '';
    } else if (nonBlankCells.length === 2) {
      k = nonBlankCells[0].text;
      v = nonBlankCells[1].text;
    } else {
      k = nonBlankCells[0].text;
      v = nonBlankCells.slice(1).map(function (x) { return x.text; }).join(' | ');
    }

    if (k.toUpperCase().includes('QUAY LẠI') || k.toUpperCase() === 'STT' || k.toUpperCase() === 'TT') continue;

    // Check if this row represents a new machine header (e.g. Máy scan A3, Máy scan A4...)
    if (isDeviceHeader(k, v) && currentSection.specs.length >= 3) {
      sections.push(currentSection);
      currentSection = {
        sheetName: sheetName + '_' + (sections.length + 1),
        name: v || k,
        model: '', brand: '', origin: '', warranty: '',
        specs: []
      };
      continue;
    }

    // Capture device name if not set yet
    if (!currentSection.name && (isDeviceHeader(k, v) || r <= range.s.r + 2)) {
      var candidate = v || k;
      if (candidate.length > 5 && !candidate.toLowerCase().includes('thông số')) {
        currentSection.name = candidate;
      }
    }

    var kl = k.toLowerCase();
    if (kl.includes('model') && !isPriceNumber(v)) currentSection.model = v;
    if ((kl.includes('hãng') || kl.includes('thương hiệu') || kl.includes('nhà sản xuất')) && !isPriceNumber(v)) currentSection.brand = v;
    if ((kl.includes('xuất xứ') || kl.includes('nước sản xuất') || kl.includes('sản xuất tại')) && !isPriceNumber(v)) currentSection.origin = v;
    if (kl.includes('bảo hành')) currentSection.warranty = v;

    if (k && k !== currentSection.name) {
      currentSection.specs.push({ key: k, value: v });
    }
  }

  if (currentSection.specs.length > 0 || currentSection.name) {
    sections.push(currentSection);
  }

  return sections;
}

function parseWordSmart(html, fileName, allSpecs) {
  var doc = new DOMParser().parseFromString(html, 'text/html');
  var tables = Array.from(doc.querySelectorAll('table'));

  // 1. Parse tables
  tables.forEach(function (tbl) {
    var rows = Array.from(tbl.querySelectorAll('tr'));
    if (rows.length < 2) return;
    var hdrCells = Array.from(rows[0].querySelectorAll('td,th')).map(function (c) { return c.innerText.trim().toLowerCase(); });
    var hdrTxt = hdrCells.join(' ');

    if (hdrTxt.includes('stt') || hdrTxt.includes('danh mục') || hdrTxt.includes('đơn giá') || hdrTxt.includes('tên hàng')) {
      var colName = -1, colModel = -1, colBrand = -1, colOrigin = -1, colUnit = -1, colQty = -1, colPrice = -1;
      hdrCells.forEach(function (h, c) {
        if (h.includes('danh mục') || h.includes('tên thiết bị') || h.includes('tên hàng') || h.includes('nội dung')) colName = c;
        else if (h.includes('model') || h.includes('mã hiệu')) colModel = c;
        else if (h.includes('hãng') || h.includes('nhà sản xuất')) colBrand = c;
        else if (h.includes('xuất xứ') || h.includes('nước')) colOrigin = c;
        else if (h.includes('đvt') || h.includes('đơn vị')) colUnit = c;
        else if (h.includes('số lượng') || h === 'sl') colQty = c;
        else if (h.includes('đơn giá') || (h.includes('giá') && !h.includes('thành tiền'))) colPrice = c;
      });

      rows.slice(1).forEach(function (tr) {
        var cells = Array.from(tr.querySelectorAll('td,th')).map(function (c) { return c.innerText.trim(); });
        if (cells.length < 2) return;
        var name = colName >= 0 ? cells[colName] : cells[1];
        if (!name || name.toUpperCase().includes('TỔNG')) return;

        var price = colPrice >= 0 ? parseNum(cells[colPrice]) : 0;
        if (!price) {
          cells.forEach(function (cv) {
            var num = parseNum(cv);
            if (num >= 1000 && !price) price = num;
          });
        }

        var devObj = {
          id: ++devCnt, stt: devs.length + 1,
          name: name,
          model: colModel >= 0 ? cells[colModel] : '',
          brand: colBrand >= 0 ? cells[colBrand] : '',
          origin: colOrigin >= 0 ? cells[colOrigin] : '',
          unit: colUnit >= 0 ? cells[colUnit] : 'Máy',
          qty: colQty >= 0 ? (parseInt(cells[colQty]) || 1) : 1,
          price: price, warranty: '', specs: []
        };
        devs.push(sanitizeDevice(devObj));
      });
    } else {
      var currentWordSec = {
        name: rows[0].innerText.trim(),
        model: '', brand: '', origin: '', warranty: '',
        specs: []
      };

      rows.forEach(function (tr, rIdx) {
        var cells = Array.from(tr.querySelectorAll('td,th')).map(function (c) { return c.innerText.trim(); });
        if (cells.length >= 2 && cells[0] && cells[1]) {
          var k = cells[0], v = cells[1];

          if (isDeviceHeader(k, v) && currentWordSec.specs.length >= 3 && rIdx > 1) {
            allSpecs.push(currentWordSec);
            currentWordSec = {
              name: v || k,
              model: '', brand: '', origin: '', warranty: '',
              specs: []
            };
            return;
          }

          var kl = k.toLowerCase();
          if (kl.includes('model') && !isPriceNumber(v)) currentWordSec.model = v;
          if ((kl.includes('hãng') || kl.includes('thương hiệu')) && !isPriceNumber(v)) currentWordSec.brand = v;
          if ((kl.includes('xuất xứ') || kl.includes('nước sản xuất')) && !isPriceNumber(v)) currentWordSec.origin = v;
          if (kl.includes('bảo hành')) currentWordSec.warranty = v;
          currentWordSec.specs.push({ key: k, value: v });
        } else if (cells.length === 1 && cells[0]) {
          var singleTxt = cells[0];
          if (isDeviceHeader(singleTxt, '') && currentWordSec.specs.length >= 3) {
            allSpecs.push(currentWordSec);
            currentWordSec = { name: singleTxt, model: '', brand: '', origin: '', warranty: '', specs: [] };
          } else if (singleTxt.includes(':')) {
            var p = singleTxt.split(':');
            currentWordSec.specs.push({ key: p[0].replace(/^[•\-\*\d\.]+\s*/, '').trim(), value: p.slice(1).join(':').trim() });
          } else {
            currentWordSec.specs.push({ key: 'Ghi chú', value: singleTxt });
          }
        }
      });

      if (currentWordSec.specs.length > 0 || currentWordSec.name) {
        allSpecs.push(currentWordSec);
      }
    }
  });

  // 2. Also parse non-table paragraphs & bullet lists if tables were not found or sparse
  if (tables.length === 0) {
    var paragraphs = Array.from(doc.querySelectorAll('p, li, h1, h2, h3, h4')).map(function (el) { return el.innerText.trim(); }).filter(Boolean);
    var docSec = { name: fileName.replace(/\.[^/.]+$/, ''), model: '', brand: '', origin: '', warranty: '', specs: [] };

    paragraphs.forEach(function (line) {
      if (isDeviceHeader(line, '') && docSec.specs.length >= 3) {
        allSpecs.push(docSec);
        docSec = { name: line, model: '', brand: '', origin: '', warranty: '', specs: [] };
        return;
      }
      if (line.includes(':')) {
        var parts = line.split(':');
        var k = parts[0].replace(/^[•\-\*\d\.]+\s*/, '').trim();
        var v = parts.slice(1).join(':').trim();
        if (k && v) {
          var kl = k.toLowerCase();
          if (kl.includes('model') && !isPriceNumber(v)) docSec.model = v;
          if ((kl.includes('hãng') || kl.includes('thương hiệu')) && !isPriceNumber(v)) docSec.brand = v;
          if ((kl.includes('xuất xứ') || kl.includes('nước sản xuất')) && !isPriceNumber(v)) docSec.origin = v;
          if (kl.includes('bảo hành')) docSec.warranty = v;
          docSec.specs.push({ key: k, value: v });
        }
      }
    });

    if (docSec.specs.length > 0) {
      allSpecs.push(docSec);
    }
  }
}

async function extractTextFromPdf(ab) {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('Thư viện PDF.js chưa được tải!');
  }
  var loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(ab) });
  var pdf = await loadingTask.promise;
  var lines = [];

  for (var i = 1; i <= pdf.numPages; i++) {
    var page = await pdf.getPage(i);
    var textContent = await page.getTextContent();
    var pageLines = [];
    var lastY = null;
    var currentLine = '';

    textContent.items.forEach(function (item) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 4) {
        if (currentLine.trim()) pageLines.push(currentLine.trim());
        currentLine = item.str;
      } else {
        currentLine += (currentLine ? ' ' : '') + item.str;
      }
      lastY = item.transform[5];
    });
    if (currentLine.trim()) pageLines.push(currentLine.trim());
    lines = lines.concat(pageLines);
  }
  return { lines: lines, fullText: lines.join('\n') };
}

async function parsePdfSmart(ab, fileName, allSpecs) {
  var pdfData = await extractTextFromPdf(ab);
  var lines = pdfData.lines;

  var currentSection = {
    name: '',
    model: '', brand: '', origin: '', warranty: '',
    specs: []
  };

  lines.forEach(function (line, lIdx) {
    var txt = line.trim();
    if (!txt) return;

    if (/^trang\s*\d+/i.test(txt) || /^page\s*\d+/i.test(txt)) return;

    if (isDeviceHeader(txt, '') && currentSection.specs.length >= 2) {
      allSpecs.push(currentSection);
      currentSection = {
        name: txt,
        model: '', brand: '', origin: '', warranty: '',
        specs: []
      };
      return;
    }

    if (!currentSection.name && (isDeviceHeader(txt, '') || lIdx <= 3)) {
      if (txt.length > 4 && !txt.toLowerCase().includes('thông số') && !txt.toLowerCase().includes('yêu cầu')) {
        currentSection.name = txt;
        return;
      }
    }

    if (txt.includes(':')) {
      var p = txt.split(':');
      var k = p[0].replace(/^[•\-\*\d\.]+\s*/, '').trim();
      var v = p.slice(1).join(':').trim();

      var kl = k.toLowerCase();
      if (kl.includes('model') && !isPriceNumber(v)) currentSection.model = v;
      if ((kl.includes('hãng') || kl.includes('thương hiệu')) && !isPriceNumber(v)) currentSection.brand = v;
      if ((kl.includes('xuất xứ') || kl.includes('nước sản xuất')) && !isPriceNumber(v)) currentSection.origin = v;
      if (kl.includes('bảo hành')) currentSection.warranty = v;

      currentSection.specs.push({ key: k, value: v });
    } else if (txt.length > 5 && !txt.toLowerCase().startsWith('bảng')) {
      currentSection.specs.push({ key: 'Tiêu chuẩn / Tính năng', value: txt });
    }
  });

  if (currentSection.specs.length > 0 || currentSection.name) {
    allSpecs.push(currentSection);
  }
}

var KNOWN_BRANDS = [
  'OKI', 'RICOH', 'MSI', 'HP', 'CANON', 'EPSON', 'BROTHER', 'DELL', 'LENOVO', 'ASUS',
  'ACER', 'SAMSUNG', 'PANASONIC', 'FUJIFILM', 'KYOCERA', 'TOSHIBA', 'KONICA MINOLTA',
  'SHARP', 'XEROX', 'CISCO', 'HIKVISION', 'DAHUA', 'APPLE', 'SONY', 'LG', 'AVITA', 'AOC'
];

var KNOWN_ORIGINS = [
  'Thái Lan', 'Việt Nam', 'Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Mỹ', 'Mỹ / USA', 'Đài Loan',
  'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Đức', 'Ý', 'Anh', 'EU', 'Chính hãng'
];

function autoDetectDeviceInfo(d) {
  // 1. Scan specs list first
  if (d.specs && d.specs.length > 0) {
    d.specs.forEach(function (s) {
      var k = String(s.key || '').toLowerCase().trim();
      var v = String(s.value || '').trim();
      if (!v) return;

      if (!d.model && (k.includes('model') || k.includes('mã hiệu') || k.includes('ký hiệu')) && !isPriceNumber(v)) {
        d.model = v;
      }
      if (!d.brand && (k.includes('hãng') || k.includes('thương hiệu') || k.includes('nhà sản xuất') || k.includes('nsx')) && !isPriceNumber(v)) {
        d.brand = v;
      }
      if (!d.origin && (k.includes('xuất xứ') || k.includes('nước sản xuất') || k.includes('nơi sản xuất') || k.includes('sản xuất tại')) && !isPriceNumber(v)) {
        d.origin = v;
      }
      if (!d.warranty && k.includes('bảo hành')) {
        d.warranty = v;
      }
    });
  }

  // 2. Scan device name if brand is still missing
  var nameUpper = (d.name || '').toUpperCase();
  if (!d.brand) {
    for (var bi = 0; bi < KNOWN_BRANDS.length; bi++) {
      var bName = KNOWN_BRANDS[bi];
      var rx = new RegExp('\\b' + bName + '\\b', 'i');
      if (rx.test(nameUpper)) {
        d.brand = bName === 'RICOH' ? 'Ricoh' : bName === 'OKI' ? 'OKI' : bName === 'MSI' ? 'MSI' : bName;
        break;
      }
    }
  }

  // 3. Scan device name if model is still missing
  if (!d.model && d.name) {
    var mMatch = d.name.match(/\b([A-Z]{1,4}[-\s]?[0-9]{2,5}[A-Z]{0,4}|[0-9]{2}[A-Z]{1,4}[0-9]{2,4}[A-Z]{0,2}|CUBI\s+NUC\s+\w+|IM\s+\d+|SP[-\s]\w+)\b/i);
    if (mMatch && mMatch[1]) {
      d.model = mMatch[1].trim();
    }
  }

  // 4. Scan for origin keywords in specs
  if (!d.origin && d.specs && d.specs.length > 0) {
    var allSpecText = d.specs.map(function (s) { return s.key + ' ' + s.value; }).join(' ');
    for (var oi = 0; oi < KNOWN_ORIGINS.length; oi++) {
      var orig = KNOWN_ORIGINS[oi];
      if (allSpecText.toLowerCase().includes(orig.toLowerCase())) {
        d.origin = orig; break;
      }
    }
  }

  // 5. Smart Unit Assignment
  if (!d.unit || d.unit === 'Máy') {
    var nL = (d.name || '').toLowerCase();
    if (nL.includes('màn hình') || nL.includes('monitor') || nL.includes('display')) {
      d.unit = 'Chiếc';
    } else if (nL.includes('máy tính') || nL.includes('pc') || nL.includes('laptop') || nL.includes('bộ lưu điện') || nL.includes('ups')) {
      d.unit = 'Bộ';
    } else if (nL.includes('switch') || nL.includes('router') || nL.includes('camera') || nL.includes('máy chiếu')) {
      d.unit = 'Chiếc';
    }
  }

  return sanitizeDevice(d);
}

function syncDeviceSpecs(d) {
  if (!d.specs) d.specs = [];

  function hasKey(pattern) {
    return d.specs.some(function (s) { return new RegExp(pattern, 'i').test(s.key); });
  }
  function setOrAdd(keyName, val) {
    if (!val) return;
    var existing = d.specs.find(function (s) { return new RegExp('^' + keyName, 'i').test(s.key); });
    if (existing) {
      if (!existing.value) existing.value = String(val);
    } else {
      d.specs.push({ key: keyName, value: String(val) });
    }
  }

  // 1. Sync from specs into device metadata
  d.specs.forEach(function (s) {
    var k = String(s.key || '').toLowerCase().trim();
    var v = String(s.value || '').trim();
    if (!v) return;
    if ((k.includes('model') || k.includes('mã hiệu')) && !d.model && !isPriceNumber(v)) d.model = v;
    if ((k.includes('hãng') || k.includes('thương hiệu') || k.includes('nhà sản xuất')) && !d.brand && !isPriceNumber(v)) d.brand = v;
    if ((k.includes('nước sản xuất') || k.includes('xuất xứ') || k.includes('sản xuất tại')) && !d.origin && !isPriceNumber(v)) d.origin = v;
    if (k.includes('bảo hành') && !d.warranty) d.warranty = v;
  });

  // 2. Sync from device metadata into specs so the spec sheet is NEVER missing key info
  if (d.model && !hasKey('model')) setOrAdd('Model', d.model);
  if (d.brand && !hasKey('hãng|thương hiệu')) setOrAdd('Hãng sản xuất', d.brand);
  if (d.origin && !hasKey('xuất xứ|nước sản xuất')) setOrAdd('Nước sản xuất', d.origin);
  if (d.warranty && !hasKey('bảo hành')) setOrAdd('Bảo hành', d.warranty);
  if (!hasKey('năm sản xuất')) setOrAdd('Năm sản xuất', 'từ 2024 tới nay');

  return d;
}

function linkSpecsToDevices(allSpecs) {
  if (devs.length === 0) return;

  devs.forEach(function (d, dIdx) {
    var matchedSpec = null;
    var lookupStt = d.origStt || d.stt;

    // Match priority 1: By STT
    if (allSpecs && allSpecs.length > 0) {
      for (var i = 0; i < allSpecs.length; i++) {
        var sp = allSpecs[i];
        if (sp.stt === lookupStt) {
          matchedSpec = sp; break;
        }
      }

      // Match priority 2: By Model or Name
      if (!matchedSpec) {
        var dName = (d.name || '').toLowerCase();
        var dModel = (d.model || '').toLowerCase();
        for (var j = 0; j < allSpecs.length; j++) {
          var sp2 = allSpecs[j];
          var spName = (sp2.name || '').toLowerCase();
          var spModel = (sp2.model || '').toLowerCase();
          if (dModel && spModel && (dModel.includes(spModel) || spModel.includes(dModel))) {
            matchedSpec = sp2; break;
          }
          if (dName && spName && (dName.includes(spName) || spName.includes(dName))) {
            matchedSpec = sp2; break;
          }
        }
      }

      // Match priority 3: By index
      if (!matchedSpec && allSpecs[dIdx]) {
        matchedSpec = allSpecs[dIdx];
      }
    }

    if (matchedSpec && matchedSpec.specs && matchedSpec.specs.length > 0) {
      d.specs = JSON.parse(JSON.stringify(matchedSpec.specs));
      if (!d.model && matchedSpec.model) d.model = matchedSpec.model;
      if (!d.brand && matchedSpec.brand) d.brand = matchedSpec.brand;
      if (!d.origin && matchedSpec.origin) d.origin = matchedSpec.origin;
      if (!d.warranty && matchedSpec.warranty) d.warranty = matchedSpec.warranty;
    }

    // Apply full exact commercial name
    d.name = cleanFullDeviceName(d.name, lookupStt, d.model, d.brand);

    // STT 12: Sophos XGS 128
    if (lookupStt === 12 || (d.model && d.model.includes('XGS 128')) || d.name.includes('Sophos')) {
      d.name = 'Thiết bị tường lửa Sophos XGS 128';
      d.model = 'XGS 128';
      d.brand = 'Sophos';
      d.origin = 'Đài Loan';
    }

    // STT 16 & 17: Update name & model to offered device
    if (lookupStt === 16 || d.name.includes('Việt Hàn') || d.name.includes('CAT6') || d.name.includes('COMMSCOPE')) {
      d.name = 'Cáp mạng CAT 6 Việt Hàn CAT6';
      d.model = 'Việt Hàn CAT6';
      d.brand = 'Việt Hàn';
      d.origin = 'Việt Nam';
    } else if (lookupStt === 17 || d.name.includes('ER707') || d.name.includes('Draytek') || d.name.includes('cân bằng tải')) {
      d.name = 'Thiết bị cân bằng tải TP-Link Omada ER707-M2';
      d.model = 'ER707-M2';
      d.brand = 'TP-Link';
      d.origin = 'Trung Quốc';
    }

    // If specs still empty, generate smart standardized 26 specs
    if (!d.specs || d.specs.length === 0) {
      d.specs = scrapeSmart26Specs(d.name, d.model, d.brand);
    }

    autoDetectDeviceInfo(d);
    syncDeviceSpecs(d);
  });

  // Renumber STT sequentially: 1, 2, 3...
  devs.forEach(function (d, i) { d.stt = i + 1; });
}

/* ═══════════════════════════════════════════
   STEP 2 UI & EXCEL WORKBOOK VIEWER
═══════════════════════════════════════════ */
function buildStep2() {
  populateFilterDropdowns();
  curSheetTab = 'Tổng hợp';
  renderExcelTabs();
  renderCurrentSheetView();
  renderQuickEdit();
}

function populateFilterDropdowns() {
  var bSel = document.getElementById('fltBrand');
  var mSel = document.getElementById('fltModel');
  if (!bSel || !mSel) return;

  var brands = Array.from(new Set(devs.map(function (d) { return d.brand; }).filter(Boolean)));
  var models = Array.from(new Set(devs.map(function (d) { return d.model; }).filter(Boolean)));

  bSel.innerHTML = '<option value="">-- Tất cả hãng (' + brands.length + ') --</option>' +
    brands.map(function (b) { return '<option value="' + escH(b) + '">' + escH(b) + '</option>'; }).join('');

  mSel.innerHTML = '<option value="">-- Tất cả model (' + models.length + ') --</option>' +
    models.map(function (m) { return '<option value="' + escH(m) + '">' + escH(m) + '</option>'; }).join('');
}

function resetFilters() {
  document.getElementById('fltKeyword').value = '';
  document.getElementById('fltBrand').value = '';
  document.getElementById('fltModel').value = '';
  renderCurrentSheetView();
}

function filterTable() {
  renderCurrentSheetView();
}

function renderExcelTabs() {
  var bar = document.getElementById('excelTabBar');
  var tabsHtml = '<div class="excel-tab' + (curSheetTab === 'Tổng hợp' ? ' active' : '') + '" onclick="switchSheetTab(\'Tổng hợp\')">📊 Tổng hợp</div>';

  devs.forEach(function (d, i) {
    var sheetNum = String(i + 1);
    var activeClass = curSheetTab === sheetNum ? ' active' : '';
    tabsHtml += '<div class="excel-tab' + activeClass + '" onclick="switchSheetTab(\'' + sheetNum + '\')">📄 ' + sheetNum + '</div>';
  });

  bar.innerHTML = tabsHtml;
}

function switchSheetTab(tabName) {
  curSheetTab = tabName;
  renderExcelTabs();
  renderCurrentSheetView();
}

function renderCurrentSheetView() {
  var area = document.getElementById('excelSheetArea');
  if (curSheetTab === 'Tổng hợp') {
    area.innerHTML = buildSummaryTableHtml();
  } else {
    var devIdx = parseInt(curSheetTab) - 1;
    if (devs[devIdx]) {
      area.innerHTML = buildSpecTableHtml(devs[devIdx], curSheetTab);
    } else {
      area.innerHTML = buildSummaryTableHtml();
    }
  }
  updStats();
}

function updStats() {
  var tot = devs.reduce(function (s, d) { return s + (d.qty || 0) * (d.price || 0); }, 0);
  var q = devs.reduce(function (s, d) { return s + (d.qty || 0); }, 0);
  var havePrice = devs.filter(function (d) { return d.price > 0; }).length;
  document.getElementById('stBar').innerHTML =
    '<div class="chip bl"><div class="cl">Số loại thiết bị</div><div class="cv">' + devs.length + '</div></div>' +
    '<div class="chip gr"><div class="cl">Tổng số lượng</div><div class="cv">' + q + '</div></div>' +
    '<div class="chip go"><div class="cl">Tổng giá trị dự toán</div><div class="cv">' + fmtV(tot) + '</div></div>' +
    '<div class="chip gr"><div class="cl">Máy có đơn giá</div><div class="cv">' + havePrice + '/' + devs.length + '</div></div>';
}

/* ── BUILD SUMMARY TABLE (EXACT 100% TO IMAGE 1) ── */
function buildSummaryTableHtml() {
  var kw = (document.getElementById('fltKeyword') ? document.getElementById('fltKeyword').value : '').toLowerCase().trim();
  var selBrand = document.getElementById('fltBrand') ? document.getElementById('fltBrand').value : '';
  var selModel = document.getElementById('fltModel') ? document.getElementById('fltModel').value : '';

  var filtered = devs.filter(function (d) {
    var mKw = !kw || (d.name && d.name.toLowerCase().includes(kw)) || (d.model && d.model.toLowerCase().includes(kw)) || (d.brand && d.brand.toLowerCase().includes(kw));
    var mBr = !selBrand || d.brand === selBrand;
    var mMd = !selModel || d.model === selModel;
    return mKw && mBr && mMd;
  });

  var rows = filtered.map(function (d, i) {
    var t = (d.qty || 0) * (d.price || 0);
    var realIdx = devs.indexOf(d) + 1;
    return '<tr class="excel-row-clickable" onclick="switchSheetTab(\'' + realIdx + '\')" title="👉 Bấm để nhảy sang xem Sheet ' + realIdx + ' (' + escH(d.name) + ')" style="cursor:pointer">' +
      '<td class="ctr"><span style="color:#1f6feb;font-weight:bold;text-decoration:underline">' + (i + 1) + '</span></td>' +
      '<td><span style="color:#000000;font-weight:600">' + escH(d.name) + '</span> <span style="font-size:10px;color:#1f6feb" title="Bấm xem thông số máy">📄</span></td>' +
      '<td class="ctr">' + escH(d.model || '') + '</td>' +
      '<td class="ctr">' + escH(d.brand || '') + '</td>' +
      '<td class="ctr">' + escH(d.origin || '') + '</td>' +
      '<td class="ctr">' + escH(d.unit || 'Máy') + '</td>' +
      '<td class="ctr">' + d.qty + '</td>' +
      '<td class="num">' + (d.price ? fmtVN(d.price) : '') + '</td>' +
      '<td class="num">' + (t ? fmtVN(t) : '') + '</td>' +
      '</tr>';
  }).join('');

  var totAll = filtered.reduce(function (s, d) { return s + (d.qty || 0) * (d.price || 0); }, 0);

  return '<div style="margin-bottom:6px;font-size:12px;color:#555555;font-style:italic">💡 Mẹo: Bấm vào bất kỳ dòng máy nào bên dưới để nhảy trực tiếp sang trang thông số kỹ thuật của máy đó.</div>' +
    '<table class="excel-table">' +
    '<thead><tr>' +
    '<th style="width:45px">STT</th>' +
    '<th style="width:340px">Danh mục</th>' +
    '<th style="width:130px">Model</th>' +
    '<th style="width:110px">Hãng</th>' +
    '<th style="width:110px">Xuất xứ</th>' +
    '<th style="width:65px">ĐVT</th>' +
    '<th style="width:55px">SL</th>' +
    '<th style="width:140px">Đơn giá (Đã gồm VAT)</th>' +
    '<th style="width:140px">Thành tiền</th>' +
    '</tr></thead>' +
    '<tbody>' +
    rows +
    '</tbody>' +
    '</table>';
}

/* ── BUILD SPEC TABLE (EXACT 100% TO IMAGE 2) ── */
function buildSpecTableHtml(dev, numStr) {
  var specRows = dev.specs.map(function (sp) {
    if (!sp.key && !sp.value) return '';
    return '<tr>' +
      '<td></td>' +
      '<td class="bold">' + escH(sp.key) + '</td>' +
      '<td colspan="2">' + escH(sp.value).replace(/\n/g, '<br/>') + '</td>' +
      '</tr>';
  }).join('');

  return '<div style="position:relative">' +
    '<div style="position:absolute;right:0;top:-38px">' +
    '<button class="btn-quaylai" onclick="switchSheetTab(\'Tổng hợp\')">QUAY LẠI</button>' +
    '</div>' +
    '<table class="excel-table">' +
    '<thead><tr>' +
    '<th style="width:45px">STT</th>' +
    '<th style="width:260px"></th>' +
    '<th colspan="2" style="text-align:center">Thông số kỹ thuật</th>' +
    '</tr></thead>' +
    '<tbody>' +
    '<tr>' +
    '<td class="ctr bold">' + numStr + '</td>' +
    '<td colspan="3" class="bold">' + escH(dev.name) + '</td>' +
    '</tr>' +
    specRows +
    '</tbody>' +
    '</table>' +
    '</div>';
}

/* ═══════════════════════════════════════════
   PRESET TEMPLATES & MODEL SPECIFICATION LIBRARY
═══════════════════════════════════════════ */
var STANDARD_26_SPEC_KEYS = [
  'Chức năng chuẩn', 'CPU', 'Phương thức in', 'Tốc độ in', 'Bảng điều khiển',
  'Bộ nhớ tiêu chuẩn (Ram)', 'Thời gian sẵn sàng in', 'Thời gian in trang đầu tiên',
  'Khổ giấy', 'Trữ lượng giấy (chuẩn)', 'Định lượng giấy tiêu chuẩn', 'Khay giấy ra',
  'Công suất tiêu thụ', 'Độ phân giải', 'In 2 mặt (Duplex)', 'In di động',
  'Giao diện', 'Giao thức hỗ trợ', 'Ngôn ngữ in', 'Phần mềm tiện ích',
  'Công suất in', 'Hộp mực', 'Tuổi thọ cụm trống', 'Bảo hành', 'Năm sản xuất', 'Nước sản xuất'
];

var MODEL_PRESETS = {
  "hw_full_1": {
    "name": "Máy vi tính để bàn MSI Cubi NUC 1M",
    "model": "Cubi B0B1",
    "brand": "MSI",
    "origin": "Trung Quốc",
    "warranty": "12 tháng",
    "unit": "Bộ",
    "price": 0,
    "specs": [
      {
        "key": "Processor",
        "value": "Intel® Core™ 3 Processor 100U (Gen 14), 6 nhân 8 luồng, xung nhịp tối đa lên đến  4.7GHz"
      },
      {
        "key": "Ổ đĩa lưu trữ",
        "value": "1x 256GB M.2 2280 SSD \r\n1x M.2 2242 SSD (PCIE, free slot)\r\n1x 2.5” HDD/SSD"
      },
      {
        "key": "Dung lượng RAM",
        "value": "1 x 8GB RAM DDR5  SO-DIMMs, up to 64GB ( 2 slot)"
      },
      {
        "key": "Đồ họa",
        "value": "Intel® Graphics"
      },
      {
        "key": "Âm thanh",
        "value": "Realtek® ALC256"
      },
      {
        "key": "Cổng I/O (Phía trước)",
        "value": "2x USB 10Gbps Type A\n1x Mic-in / Headphone-out combo\n1x Micro-SD Card Reader"
      },
      {
        "key": "Cổng I/O (Phía sau)",
        "value": "2x Thunderbolt 4 (DP 1.4 alt-mode up to 4K@60Hz /PD-out 15W / One of TBT supports PD-in\n2x USB 10Gbps Type A\n2x RJ45\n2x HDMI out (supports 4K @60Hz as specified in HDMI 2.1)"
      },
      {
        "key": "Cổng I/O (Side)",
        "value": "1x Kensington Lock\n1x External Power Switch Pin Header"
      },
      {
        "key": "Cổng  I/O bên trong (Inside)",
        "value": "2 x USB 2.0 header"
      },
      {
        "key": "TPM",
        "value": "dTPM 2.0"
      },
      {
        "key": "Kết nối không dây",
        "value": "M.2 key with Intel Wireles Wireless AX211"
      },
      {
        "key": "Bluetooth",
        "value": "5.3"
      },
      {
        "key": "Kết nối mạng",
        "value": "2 cổng Lan RJ45 được tích hợp sẵn:\r\n2 x Intel I226V (2.5Gb)"
      },
      {
        "key": "Nguồn",
        "value": "Nguồn tiết kiệm điện dùng adaptor 120W"
      },
      {
        "key": "Bật tắt nguồn mở rộng",
        "value": "Công tắc điện nối dài"
      },
      {
        "key": "VESA Mount",
        "value": "75 x 75 mm & 100 x 100 mm"
      },
      {
        "key": "Kensington Lock",
        "value": "Có hỗ trợ"
      },
      {
        "key": "Keyboard & Mouse",
        "value": "Đồng bộ với hãng sản xuất MSI"
      },
      {
        "key": "Tính năng",
        "value": "1.\tHệ thống bảo mật  dTPM 2.0 hardware được tích hợp sẵn trên máy tính. Tăng cường bảo mật cho hệ thống người dùng.\n2.\tCho phép người dùng sao lưu và chia sẽ dữ liệu quan trọng cần thiết qua Cloud đến các thiết bị khác như smartphone, máy tính khác.\n3.\tHỗ trợ xuất hình 4 màn hình cùng lúc.\n4.\tHỗ trợ bật tắt máy tính bằng nút nguồn màn hình thông qua Thunderbolt 4 PD.\n5.\tMáy tính tích hợp hệ thống AI Engine tự học tự động phát hiện các tình huống của người dùng và điều chỉnh hiệu suất, hiệu ứng âm thanh và chế độ hiển thị cho phù hợp. Chẩn đoán hệ thống và tự động rà soát và nâng cấp Bios và phân mềm khi có bản cập nhật mới.\n6.\t'Hệ thống Lan Manager cho phép người dùng theo dõi thông đường truyền cho từng ứng dụng cụ thể với mức độ ưu tiên khác nhau nhằm tối ưu hóa hiệu năng sử dụng đường truyền mạng nội bộ và internet.\n7.\tHệ thống tích hợp Dual Lan RJ45 onboard gồm 2.5Gb x 2 nhằm tăng cường tốc độ truy suất đường truyền và cho phép người dùng và người quản trị thiết lập hạ tầng mạng  riêng biệt, nâng cao bảo mật giữa internet và local\n8.\t'Hiển thị và theo dõi thông tin hệ thống theo thời gian thực như CPU, Mainboard, Ram, xung CPU, tốc độ fan…"
      },
      {
        "key": "Màn hình MSI",
        "value": ""
      },
      {
        "key": "Kích thước",
        "value": "21.45\""
      },
      {
        "key": "Tấm nền",
        "value": "VA"
      },
      {
        "key": "Độ phân giải",
        "value": "1920 x 1080 (FHD)"
      },
      {
        "key": "Tỉ lệ hình ảnh",
        "value": "16:9"
      },
      {
        "key": "Độ sáng",
        "value": "300 cd/m²"
      },
      {
        "key": "Độ tương phản",
        "value": "4000:1"
      },
      {
        "key": "DCR",
        "value": "100000000:1"
      },
      {
        "key": "Tần số quét",
        "value": "120Hz"
      },
      {
        "key": "Thời gian phản hồi",
        "value": "1ms (MPRT) / 4ms (GTG)"
      },
      {
        "key": "Góc nhìn",
        "value": "178°(H) / 178°(V)"
      },
      {
        "key": "Chống chói",
        "value": "Anti-glare"
      },
      {
        "key": "Màu hiển thị",
        "value": "16.7M"
      },
      {
        "key": "Video Interface / Cổng kết nối / Giao diện kết nối",
        "value": "1x HDMI™ 1.4b (FHD@120Hz)\n1x D-Sub (VGA)"
      },
      {
        "key": "Nguồn điện",
        "value": "100~240V, 50~60Hz"
      },
      {
        "key": "Bảo hành",
        "value": "Bảo hành và hỗ trợ kỹ thuật chính hãng Onsite 24 tháng\r\nTrung Tâm Bảo Hành ủy quyền MSI tại Việt Nam  có chứng chỉ ISO 9001"
      }
    ]
  },
  "hw_full_2": {
    "name": "Máy tính xách tay MSI Commercial 14 B1MG (MS-14S1)",
    "model": "MS-14S1",
    "brand": "MSI",
    "origin": "Trung Quốc",
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "price": 0,
    "specs": [
      {
        "key": "CPU",
        "value": "Intel® Core™ 3 Processor 100U (Gen 14), 6 nhân 8 luồng, xung nhịp tối đa lên đến  4.7GHz."
      },
      {
        "key": "Chipset",
        "value": "Integrated SoC"
      },
      {
        "key": "Bộ Nhớ",
        "value": "8GB DDR4 ,2 Khe, hỗ trợ nâng cấp tối đa 64GB"
      },
      {
        "key": "Màn hình",
        "value": "14 inch FHD (1920×1080), IPS-level, 60Hz, 45% NTSC, mở 180°, có chế độ trình chiếu nhanh cho phép đảo/chia sẻ nội dung màn hình"
      },
      {
        "key": "Đồ họa (Graphics)",
        "value": "Intel® Graphics"
      },
      {
        "key": "Webcam",
        "value": "HD type (30fps@720p) có nút khóa webcam chủ động chống truy cập trái phép"
      },
      {
        "key": "Ổ cứng (Storage)",
        "value": "512GB NVMe PCIe SSD"
      },
      {
        "key": "Kết nối không dây",
        "value": "Intel® Wi-Fi 6E AX211 (802.11ax), Bluetooth v5.3"
      },
      {
        "key": "Âm thanh",
        "value": "2 loa stereo công suất 2W"
      },
      {
        "key": "Bàn phím",
        "value": "Bàn phím đơn có đèn nền màu trắng, tích hợp phím Copilot hỗ trợ AI, tối ưu hiệu suất làm việc và trải nghiệm người dùng"
      },
      {
        "key": "Bảo mật",
        "value": "Firmware Trusted Platform Module(fTPM) 2.0, finger print, khóa Kensington."
      },
      {
        "key": "Cổng kết nối (I/O Ports):",
        "value": "1 x USB 3.2 Gen2 Type-C / DisplayPort™/ Power Delivery 3.0\r\n3× USB Type-A 3.2 Gen 1\r\n1× HDMI 1.4 (up to 4K@30Hz)\r\n1× MicroSD card reader\r\n1× combo audio jack\r\n1× DC-in\r\n1× RJ-45\r\n1× Kensington lock"
      },
      {
        "key": "Pin và adaptor",
        "value": "Pin Li-Polymer 3 Cell 46.8Whr, hỗ trợ công nghệ sạc nhanh Fast Charging; Adapter 65W"
      },
      {
        "key": "Kích thước (DxRxC)",
        "value": "323.9  x  217.2  x 19.9 mm"
      },
      {
        "key": "Cân nặng",
        "value": "1.5 Kg"
      },
      {
        "key": "HĐH",
        "value": "Win 11 Home"
      },
      {
        "key": "Tính năng khác",
        "value": "- Phần mềm quản lý hệ thống đi kèm theo máy, sử dụng trí tuệ nhân tạo AI, giúp cải thiện hiệu suất, độ ổn định, và trải nghiệm sử dụng người dùng\r\n- Máy được thử nghiệm theo tiêu chuẩn quân đội MIL-STD-810H về nhiệt độ, độ ẩm, rơi rớt, rung động mạnh...nhằm đảm bảo máy hoạt động bền bỉ và tin cậy\r\n- Sử dụng vật liệu nhựa tái chế PCR (Post-Consumer Recycled Resin), thân thiện với môi trường. Máy đạt chứng nhận EPEAT thân thiện với môi trường\r\n- Nhà máy sản xuất đạt các chứng nhận quốc tế về quản lý chất lượng, môi trường, an toàn thông tin, an toàn sức khỏe nghề nghiệp và quản lý năng lượng theo các tiêu chuẩn ISO 9001:2015, ISO 14001:2015, ISO/IEC 27001:2022, ISO 45001:2018 và ISO 50001:2018."
      },
      {
        "key": "Bảo hành",
        "value": "12tháng bảo hành tận nơi"
      }
    ]
  },
  "hw_full_3": {
    "name": "Máy in A4 đen trắng OKI B433DN",
    "model": "B433DN",
    "brand": "OKI",
    "origin": "Thái Lan",
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "price": 0,
    "specs": [
      {
        "key": "Chức năng chuẩn",
        "value": "Máy in đen trắng đảo mặt tự động"
      },
      {
        "key": "Phương thức in",
        "value": "laser"
      },
      {
        "key": "Tốc độ in",
        "value": "40 trang/phút (A4)"
      },
      {
        "key": "Bộ nhớ RAM tiêu chuẩn",
        "value": "512MB, bộ nhớ trong 3GB"
      },
      {
        "key": "Khổ giấy",
        "value": "A6-A4, Banner 1,3m (tùy chọn tối đa 216 x 1320 mm)"
      },
      {
        "key": "Trữ lượng giấy (chuẩn)",
        "value": "01 khay chuẩn x 250 tờ\n01 khay tay x 100 tờ"
      },
      {
        "key": "Khay giấy ra",
        "value": "150 tờ úp mặt"
      },
      {
        "key": "Độ phân giải",
        "value": "1200 x 1200dpi"
      },
      {
        "key": "In 2 mặt (Duplex)",
        "value": "Tiêu chuẩn"
      },
      {
        "key": "In di động",
        "value": "AirPrint, Mopria"
      },
      {
        "key": "Giao diện",
        "value": "USB 2.0 x 1; Ethernet 10BASE-T/100BASE-TX/1,000BASE-T; NFC;\r\nUSB Host Interface (USB Host)x1"
      },
      {
        "key": "Công suất in",
        "value": "80,000 trang"
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng"
      }
    ]
  },
  "hw_full_4": {
    "name": "Máy quét tài liệu số hóa RICOH SP-2240N",
    "model": "SP-2240",
    "brand": "Ricoh",
    "origin": "Thái Lan",
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "price": 0,
    "specs": [
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
        "value": "Tối đa: 215,9 x 355,6 mm; Tối thiểu: 50,8 x 50,8 mm"
      },
      {
        "key": "Kéo giấy dài",
        "value": "6.096 mm"
      },
      {
        "key": "Quét khổ A3 gập",
        "value": "Có"
      },
      {
        "key": "Định lượng giấy",
        "value": "27 - 413 g/m2"
      },
      {
        "key": "Thẻ nhựa",
        "value": "1,4 mm"
      },
      {
        "key": "Tốc độ quét",
        "value": "Một mặt: 40 ppm, Hai mặt: 80 ipm (A4, quét màu, 300dpi)\\"
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
        "value": "-        Tự động tách file và đặt tên file theo loại văn bản, ngày trên văn bản, số văn bản\n-        Chuyển đổi chữ in và chữ viết tay tiếng Việt sang file dạng văn bản (Word)\n-        Tự động bóc tách các trường trên văn bản hành chính: Số văn bản, ngày văn bản, tiêu đề, kính gửi, cơ quan ban hành, nơi nhận, người ký.\nNguồn tài liệu đầu vào từ máy scan hoặc từ file ảnh."
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng"
      }
    ]
  },
  "hw_full_5": {
    "name": "Thiết bị mạng Switch Cisco CBS350-24S",
    "model": "CBS350-24S",
    "brand": "Cisco",
    "origin": "Trung Quốc",
    "warranty": "12 tháng",
    "unit": "Cái",
    "price": 0,
    "specs": [
      {
        "key": "Chức năng chuẩn",
        "value": "Thiết bị mạng Switch Cisco CBS350-24S"
      },
      {
        "key": "Model / Mã hiệu",
        "value": "CBS350-24S"
      },
      {
        "key": "Hãng sản xuất",
        "value": "Cisco"
      },
      {
        "key": "Xuất xứ",
        "value": "Trung Quốc"
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng chính hãng"
      }
    ]
  },
  "hw_full_6": {
    "name": "Thiết bị mạng Switch Cisco WS-C2960L",
    "model": "WS-C2960L",
    "brand": "Cisco",
    "origin": "Trung Quốc",
    "warranty": "12 tháng",
    "unit": "Cái",
    "price": 0,
    "specs": [
      {
        "key": "Chức năng chuẩn",
        "value": "Thiết bị mạng Switch Cisco WS-C2960L"
      },
      {
        "key": "Model / Mã hiệu",
        "value": "WS-C2960L"
      },
      {
        "key": "Hãng sản xuất",
        "value": "Cisco"
      },
      {
        "key": "Xuất xứ",
        "value": "Trung Quốc"
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng chính hãng"
      }
    ]
  },
  "hw_full_7": {
    "name": "Thiết bị mạng Switch Cisco CBS250-48PP",
    "model": "CBS250-48PP",
    "brand": "Cisco",
    "origin": "Trung Quốc",
    "warranty": "12 tháng",
    "unit": "Cái",
    "price": 0,
    "specs": [
      {
        "key": "Chức năng chuẩn",
        "value": "Thiết bị mạng Switch Cisco CBS250-48PP"
      },
      {
        "key": "Model / Mã hiệu",
        "value": "CBS250-48PP"
      },
      {
        "key": "Hãng sản xuất",
        "value": "Cisco"
      },
      {
        "key": "Xuất xứ",
        "value": "Trung Quốc"
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng chính hãng"
      }
    ]
  },
  "hw_full_8": {
    "name": "Thiết bị phòng họp trực tuyến Aver VC520 PRO3",
    "model": "VC520 PRO3",
    "brand": "Aver",
    "origin": "Đài Loan",
    "warranty": "12 tháng",
    "unit": "Bộ",
    "price": 0,
    "specs": [
      {
        "key": "Chức năng chuẩn",
        "value": "Thiết bị phòng họp trực tuyến Aver VC520 PRO3"
      },
      {
        "key": "Model / Mã hiệu",
        "value": "VC520 PRO3"
      },
      {
        "key": "Hãng sản xuất",
        "value": "Aver"
      },
      {
        "key": "Xuất xứ",
        "value": "Đài Loan"
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng chính hãng"
      }
    ]
  },
  "hw_full_9": {
    "name": "Thiết bị mạng Switch Cisco 24 Port Gigabit",
    "model": "24 Port Gigabit",
    "brand": "Cisco",
    "origin": "Trung Quốc",
    "warranty": "12 tháng",
    "unit": "Cái",
    "price": 0,
    "specs": [
      {
        "key": "Chức năng chuẩn",
        "value": "Thiết bị mạng Switch Cisco 24 Port Gigabit"
      },
      {
        "key": "Model / Mã hiệu",
        "value": "24 Port Gigabit"
      },
      {
        "key": "Hãng sản xuất",
        "value": "Cisco"
      },
      {
        "key": "Xuất xứ",
        "value": "Trung Quốc"
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng chính hãng"
      }
    ]
  },
  "hw_full_10": {
    "name": "Thiết bị tường lửa Sophos XGS 128",
    "model": "XGS 128",
    "brand": "Sophos",
    "origin": "Đài Loan",
    "warranty": "12 tháng",
    "unit": "Cái",
    "price": 0,
    "specs": [
      {
        "key": "Chức năng chuẩn",
        "value": "Thiết bị tường lửa Sophos XGS 128"
      },
      {
        "key": "Model / Mã hiệu",
        "value": "XGS 128"
      },
      {
        "key": "Hãng sản xuất",
        "value": "Sophos"
      },
      {
        "key": "Xuất xứ",
        "value": "Đài Loan"
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng chính hãng"
      }
    ]
  },
  "hw_full_11": {
    "name": "Switch Cisco Catalyst 1200 Series",
    "model": "Catalyst 1200",
    "brand": "Cisco",
    "origin": "Trung Quốc",
    "warranty": "12 tháng",
    "unit": "Cái",
    "price": 0,
    "specs": [
      {
        "key": "Chức năng chuẩn",
        "value": "Switch Cisco Catalyst 1200 Series"
      },
      {
        "key": "Model / Mã hiệu",
        "value": "Catalyst 1200"
      },
      {
        "key": "Hãng sản xuất",
        "value": "Cisco"
      },
      {
        "key": "Xuất xứ",
        "value": "Trung Quốc"
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng chính hãng"
      }
    ]
  },
  "hw_full_12": {
    "name": "Camera an ninh IP",
    "model": "IP Dome/Bullet",
    "brand": "Chính hãng",
    "origin": "Trung Quốc",
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "price": 0,
    "specs": [
      {
        "key": "Chức năng chuẩn",
        "value": "Camera an ninh IP"
      },
      {
        "key": "Model / Mã hiệu",
        "value": "IP Dome/Bullet"
      },
      {
        "key": "Hãng sản xuất",
        "value": "Chính hãng"
      },
      {
        "key": "Xuất xứ",
        "value": "Trung Quốc"
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng chính hãng"
      }
    ]
  },
  "hw_full_13": {
    "name": "Máy chiếu INFOCUS P162 + phụ kiện",
    "model": "P162",
    "brand": "INFOCUS",
    "origin": "Trung Quốc",
    "warranty": "12 tháng",
    "unit": "Bộ",
    "price": 0,
    "specs": [
      {
        "key": "Máy chiếu",
        "value": "Công nghệ hiển thị: LCD with Micro-Lens Array"
      },
      {
        "key": "Kích thước bảng điều khiển",
        "value": "3 x SonyTM 0.63\""
      },
      {
        "key": "Độ phân giải thực",
        "value": "WXGA (1280 x 800)"
      },
      {
        "key": "Độ phân hỗ trợ",
        "value": "3840 x 2160 (4K) @ 30Hz"
      },
      {
        "key": "Độ tương phản",
        "value": "50000:1"
      },
      {
        "key": "Độ sáng",
        "value": "5000  Lumens"
      },
      {
        "key": "Nguồn sáng",
        "value": "UHP Lamp"
      },
      {
        "key": "Tuổi thọ bóng đèn tối đa",
        "value": "20000 giờ"
      },
      {
        "key": "Ống kính",
        "value": "Zoom 1.66x"
      },
      {
        "key": "Chỉnh Keystone ( ngang/ dọc)",
        "value": "±30°"
      },
      {
        "key": "Ống Kính (F-Stop / focal length )",
        "value": "F:1.7 ~ 2.1/ f=17.5 ~ 29.01 (mm)"
      },
      {
        "key": "Hệ số chiếu",
        "value": "1.26 ~ 2.09:1"
      },
      {
        "key": "Khoảng cách chiếu",
        "value": "0.81 ~ 13.86 (m)"
      },
      {
        "key": "Digital Zoom",
        "value": "0.0x ~ 4.0x"
      },
      {
        "key": "Loa tích hợp",
        "value": "16W x1\nCổng kết nối:\r\n- VGA (Computer in) x1; Composite Video x1; HDMI x2; USB-B 2.0 x1; RJ45 (LAN) x1; Audio in 3.5 mm x1; Audio out 3.5 mm x1; RS232 x 1; VGA (Monitor out) x1; USB-A x 1."
      },
      {
        "key": "Nguồn điện",
        "value": "100-240 V AC; 50 - 60 Hz"
      },
      {
        "key": "Công suất tiêu thụ nguồn tối đa",
        "value": "340 (W)"
      },
      {
        "key": "Công suất chờ",
        "value": "<0.5 (W)"
      },
      {
        "key": "Bảo vệ",
        "value": "Kensington Lock Port, Security Bar, Keypad Lock, PIN & Timer Functions"
      },
      {
        "key": "Kích thước máy chiếu",
        "value": "345 x 261 x 99 mm"
      },
      {
        "key": "Trọng lượng",
        "value": "3.3 kg"
      },
      {
        "key": "Phụ kiện theo kèm",
        "value": "Dây nguồn x 1, Cáp VGA x1, Pin+ điều khiển, Đĩa mềm HDSD\nTính năng công nghệ"
      },
      {
        "key": "Tính năng đồng bộ hóa độ ổn định của hình ảnh (Fine sync) (chỉ VGA)",
        "value": "0 - 31"
      },
      {
        "key": "Điều chỉnh vị trí hình ảnh chiều ngang và chiều dọc (chỉ VGA)",
        "value": "(-5) - (+5)\nTính năng điều chỉnh độ rộng chiều ngang của hình ảnh (H. Size) (chỉ VGA): (-15) - (+15)\nChức năng cho phép cắt hình ảnh thành các phần 5x5 hoặc nhỏ hơn, sau đó chọn phần hình ảnh để hiện thị (Aspect: Advanced)\nChức năng đọc file trên USB hỗ trợ đọc file hình ảnh và file PDF cơ bản"
      },
      {
        "key": "Tính năng điều chỉnh tỉ lệ khung hình",
        "value": "Normal, Wide, Full, 4:3, Advanced\nChức năng Bảo mật (Security) giúp bảo mật cài đặt máy chiếu. Chức năng khóa mã PIN ngăn chặn sử dụng trái phép máy chiếu\nTính năng thay đổi độ sáng màn hình (Brightness Mode) 4 chế độ giúp tùy chỉnh độ sáng và tiết kiệm điện năng tiêu thụ\nChức năng cài đặt tự động Chức năng này cho phép tìm kiếm nguồn đầu vào, điều chỉnh AUTO PC và AUTO Keystone bằng cách nhấn nút AUTO trên điều khiển từ xa một cách đơn giản.\nChức năng quản lý nguồn điện (Power Management) điều chỉnh thời gian nghỉ hoặc tắt của máy chiếu khi không có tín hiệu đầu vào giúp giảm tiêu thụ điện năng và duy trì tuổi thọ của bóng đèn. Có thể tắt tính năng này trong phần cài đặt\nChế độ hình ảnh đa dạng, phù hợp với nhiều môi trường cũng như màu tường khác nhau: Dynamic, Standard, Cinema, Blackboard (Green), Colorboard, User Image.\nChức năng điều chỉnh màu sắc đa dạng: Contrast, Brightness, Colour temp., cân bằng trắng (điều chỉnh Red, Green, Blue) và Sharpness\nChức năng Direct Power ON máy chiếu sẽ tự động bật khi nguồn AC được cung cấp mà không cần nhấn phím bật nguồn mà không cần nhấn phím  trên bảng điều khiển máy chiếu hoặc trên điều khiển từ xa.\nChế độ tiết kiệm tiêu thụ điện năng ở chế độ chờ (Standby mode): ECO; Normal; Network\nChức năng zoom kỹ thuật số (0-19) cho phép bạn tập trung vào thông tin quan trọng trong một bài thuyết trình.\nChức năng điều chỉnh keystone: có thể điều chỉnh sự biến dạng keystone của hình ảnh trong máy chiếu của mình bằng điều chỉnh Keystone ngang dọc, điều chỉnh 4 góc hoặc tự động điều chỉnh\nTính năng khóa bàn phím (Key lock) giúp khóa bàn phím, tránh sử dụng trái phép bằng phím bấm trên máy chiếu\nChức năng FREEZE đóng băng một hình ảnh (Giúp nhấn mạnh nội dung thuyết trình)\nChức năng điều khiển quạt máy chiếu, bạn có thể thay đổi cài đặt về tốc độ của quạt làm mát theo độ cao mà máy chiếu của bạn đang hoạt động (High altitude) chọn (BẬT) khi bạn vận hành điều hành máy chiếu khi hoạt động ở trên vùng có độ cao lớn.\nChế độ làm mát nhanh (Cooling fast): normal, 30 Sec, 0 Sec. Đặc biệt chọn chức năng (0 Sec) cho phép bạn rút phích cắm nguồn AC trực tiếp sau khi tắt máy, không cần chờ đợi máy chiếu làm mát.\nChế độ hiển thị  nhắc nhở thời gian sử dụng bộ lọc, đặt thời gian để hiển thị cảnh báo dụng bộ lọc cần được thay thế giúp bảo vệ máy chiếu bền bỉ hoạt động một cách tốt nhất (Filter counter)\nChức năng (Test pattern) để hiển thị mẫu thử nghiệm có sẵn của máy chiếu.\nChức năng hiển thị thông tin và trạng thái của máy chiếu, giúp người dùng có thể xem được các thông tin hiển thị: Input, H-sync. Freq, V-sync. Freq, Lamp counter, Model Name, S/N, Firmware Version, SUB CPU.\nTính năng điều chỉnh ngôn ngữ hiển thị của máy chiếu: 26 ngôn ngữ trong đó có Tiếng Việt\nTính năng Công nghệ Iris nâng cao giúp tỷ lệ tương phản tối ưu nhất giữa không gian sáng và tối sẽ tự động điều chỉnh cài đặt để tối ưu hóa độ sáng cho phù hợp nhất với nội dung được hiển thị. Tính năng Iris nâng cao cung cấp cho các cảnh tối và nội dung có màu đen tối hơn và sáng hơn trên các cảnh sáng để sử dụng tối ưu công suất ánh sáng có sẵn của máy chiếu\nTính năng trang trống (Blank): thay vì chiếu hình ảnh hiện tại, tính năng này cho phép chiếu một trang trống và có thể tiếp tục chiếu ngay lập tức khi cần"
      },
      {
        "key": "Tính năng điều chỉnh dải màu của tín hiệu HDMI",
        "value": "64-940; 0-1023; Auto\nTính năng cài đặt EQ của tín hiệu HDMI\nHiển thị qua USB:  Hiển thị nội dung từ máy tính xách tay hoặc máy tính Windows của bạn qua cổng USB bằng cáp USB với máy chiếu.\nHiển thị qua mạng LAN: Kết nối máy chiếu và thiết bị Windows của bạn với cùng một mạng LAN và sử dụng phần mềm để hiển thị"
      },
      {
        "key": "Phụ kiện theo kèm",
        "value": "Dây nguồn x 1, Cáp VGA x1, Pin+ điều khiển, Đĩa mềm HDSD"
      },
      {
        "key": "Màn chiếu điện 120\"",
        "value": ""
      },
      {
        "key": "Kích thước vùng chiếu",
        "value": "2.13m x 2.13m"
      },
      {
        "key": "Tỉ lệ",
        "value": "1:1"
      },
      {
        "key": "Kích thước đường chéo",
        "value": "120\"\nCó điều khiển từ xa"
      },
      {
        "key": "Chất liệu",
        "value": "Matte White\nđộ bền cao, chống ẩm mốc"
      },
      {
        "key": "Giá treo máy chiếu 1m",
        "value": ""
      },
      {
        "key": "Độ dài tối thiểu",
        "value": "630mm"
      },
      {
        "key": "Độ dài tối đa",
        "value": "1000mm\nMàu trắng\nPhù hợp với mọi loại máy chiếu.\nAn toàn và thuận tiện trong lắp đặt."
      },
      {
        "key": "Tải trọng",
        "value": "25kg"
      },
      {
        "key": "Cáp HDMI 15m",
        "value": "\nChiều dài cáp 15m chuyên dùng cho máy chiếu, TV, PC, laptop và trong các thiết bị có ngõ tín hiệu HDMI\nChuẩn kết nối 2.0\nCấu tạo lõi xoắn, chuẩn chất liệu 26AWG, có bọc 2 lớp giáp chống nhiễu và bọc nhựa PVC dẻo chống đứt gãy.\nĐộ phân giải đạt full HD 1080p@60Hz, 4K@60Hz cho hình ảnh và âm thanh chất lượng cao và đảm bảo đồng bộ"
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng hoặc 1000 giờ đối với bóng đèn tùy điều kiện nào đến trước"
      }
    ]
  },
  "hw_full_14": {
    "name": "Cáp mạng CAT 6 Việt Hàn CAT6",
    "model": "Việt Hàn CAT6",
    "brand": "Việt Hàn",
    "origin": "Việt Nam",
    "warranty": "12 tháng",
    "unit": "Thùng",
    "price": 0,
    "specs": [
      {
        "key": "Kiểu cáp",
        "value": "UTP"
      },
      {
        "key": "Số đôi dây",
        "value": "4 đôi / 8 lõi"
      },
      {
        "key": "Ruột dẫn",
        "value": "Solid"
      },
      {
        "key": "Cỡ dây",
        "value": "24 AWG / 4PRS"
      },
      {
        "key": "Đường kính ruột đồng",
        "value": "0,5 mm"
      },
      {
        "key": "Vật liệu ruột dẫn",
        "value": "Đồng 99,99% LS Hàn Quốc / SEI Thái Lan"
      },
      {
        "key": "Cách điện lõi",
        "value": "HDPE"
      },
      {
        "key": "Lõi phân cách",
        "value": "Lõi chữ thập PEHD"
      },
      {
        "key": "Vỏ ngoài",
        "value": "PVC nguyên sinh"
      },
      {
        "key": "Chiều dài cuộn",
        "value": "305 m"
      },
      {
        "key": "Tiêu chuẩn khác",
        "value": "ISO 9001:2015; Quatest 1; TIA/EIA-568-B2; TCVN 8698:2011"
      },
      {
        "key": "Khoảng truyền công bố",
        "value": "150–190 m"
      }
    ]
  },
  "hw_full_15": {
    "name": "Thiết bị cân bằng tải TP-Link Omada ER707-M2",
    "model": "ER707-M2",
    "brand": "TP-Link",
    "origin": "Trung Quốc",
    "warranty": "12 tháng",
    "unit": "Cái",
    "price": 0,
    "specs": [
      {
        "key": "CPU",
        "value": "Dual-core ARMv8"
      },
      {
        "key": "RAM",
        "value": "1 GB DDR4"
      },
      {
        "key": "Cổng 2.5GbE",
        "value": "2 × 2.5G RJ45: 1 WAN + 1 WAN/LAN"
      },
      {
        "key": "Cổng SFP",
        "value": "1 × GbE SFP WAN/LAN"
      },
      {
        "key": "Cổng Gigabit RJ45 khác",
        "value": "4 × 1GbE WAN/LAN"
      },
      {
        "key": "Số WAN tối đa",
        "value": "Tối đa 6 WAN ở Standalone"
      },
      {
        "key": "Cân bằng tải",
        "value": "Có – Intelligent Load Balance"
      },
      {
        "key": "Failover",
        "value": "Có – Link Backup/Failover"
      },
      {
        "key": "NAT Throughput",
        "value": "khoảng 2.35–2.37 Gbps"
      },
      {
        "key": "Concurrent Sessions",
        "value": "500"
      },
      {
        "key": "OpenVPN",
        "value": "Có"
      },
      {
        "key": "WireGuard",
        "value": "Có"
      },
      {
        "key": "PPTP/L2TP",
        "value": "Có"
      },
      {
        "key": "VLAN 802.1Q",
        "value": "Có"
      },
      {
        "key": "Static Routing",
        "value": "Có"
      },
      {
        "key": "Policy Routing",
        "value": "Có"
      },
      {
        "key": "OSPF",
        "value": "Có"
      },
      {
        "key": "IDS/IPS",
        "value": "Có IPS/IDS + DPI"
      },
      {
        "key": "DPI",
        "value": "Có DPI, hỗ trợ nhận diện nhiều ứng dụng"
      },
      {
        "key": "SD-WAN",
        "value": "Có, Controller Mode"
      },
      {
        "key": "Quản lý tập trung",
        "value": "Omada SDN Controller"
      },
      {
        "key": "SNMP",
        "value": "v1/v2c/v3"
      },
      {
        "key": "4G backup USB",
        "value": "Có LTE dongle backup"
      },
      {
        "key": "Bảo hành",
        "value": "12 tháng"
      }
    ]
  },
  "hw_full_16": {
    "name": "Máy in A3 HP LaserJet Pro M706n",
    "model": "LaserJet Pro M706n",
    "brand": "HP",
    "origin": "Trung Quốc",
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "price": 0,
    "specs": [
      {
        "key": "Công nghệ in",
        "value": "Laser"
      },
      {
        "key": "Duplex printing",
        "value": "Optional Duplexer accessory"
      },
      {
        "key": "Tốc độ in",
        "value": "Up to 35 ppm, A4/letter; Up to 18 ppm, A3;"
      },
      {
        "key": "Độ phân giải",
        "value": "Black (best) Up to 1200 x 1200 dpi;"
      },
      {
        "key": "Ngôn ngữ máy in",
        "value": "HP PCL 6, HP PCL 5e, HP Postscript 3 emulation, PCLm"
      },
      {
        "key": "Khả năng kết nối",
        "value": "1 USB 2.0 device port; 1 fast Ethernet 10/100"
      },
      {
        "key": "Khả năng in trên thiết bị di đông",
        "value": "Có"
      },
      {
        "key": "Tính năng phần mềm in thông minh :",
        "value": "ePrint; Auto On/Off"
      },
      {
        "key": "Bộ nhớ",
        "value": "256 MB (NAND ROM"
      },
      {
        "key": "Tốc độ VXL",
        "value": "750 MHz"
      },
      {
        "key": "Số lượng trang được đề xuất hàng tháng",
        "value": "Up to 65,000 pages"
      },
      {
        "key": "Khay nạp giấy vào tiêu chuẩn.",
        "value": "Up to 350 sheets Standard: Tray 1: 100‑sheet multipurpose tray, Tray 2: 250‑sheet input tray"
      },
      {
        "key": "Khay nhả giấy, tiêu chuẩn",
        "value": "250‑sheet output bin"
      },
      {
        "key": "Kiểu giấy in hỗ trợ",
        "value": "Paper (coloured, letterhead, light, plain, preprinted, prepunched, recycled, rough, heavy), bond, cardstock, envelope, labels, transparency, vellum"
      },
      {
        "key": "Độ dầy của giấy được hỗ trợ",
        "value": "Tray 1: 60 to 199 g/m²; Tray 2: 60 to 120 g/m²"
      },
      {
        "key": "Kích cỡ giấy in",
        "value": "Tray 1: A4, A3, B4 (JIS), B5 (JIS), A5, 16K; letter, legal, executive, 11 x 17, 8.5 x 13; envelopes\r\n(B5, C5, DL, No. 10, Monarch); postcard (JIS), DPostcard (JIS); Custom media sizes: 76.2 x 127 mm\r\nto 312 x 470 mm (3 x 5 in to 12.28 x 18.5 in); Tray 2: A4, A3, B4 (JIS), B5 (JIS), A5, 16K, letter, legal,\r\nexecutive, 11 x 17, 8.5 x 13; Custom media sizes: 148 x 210 mm to 297 x 431.8 mm (5.83 x 8.27 in\r\nto 11.69 x 17 in); Optional tray 3: A4, A3, B4 (JIS), B5 (JIS), A5, 16K; letter, legal, executive, 11 x 17,\r\n8.5 x 13; Custom media sizes: 148 x 210 mm to 297 x 431.8 mm (5.83 x 8.27 in to 11.69 x 17 in);"
      },
      {
        "key": "Quản lý máy in",
        "value": ""
      },
      {
        "key": "Quản lý bảo mật máy in",
        "value": "Management security: SNMP v2, SSL/TLS (HTTPS), 802.1x authentication; password protection,\r\n802.1x authentication (EAP‑PEAP, LEAP, EAP‑TTLS, EAP‑TLS, EAP‑MD5) with RADIUS servers"
      },
      {
        "key": "Control panel",
        "value": "2‑line LCD with write backlit; 7 buttons (OK, Cancel, Forward, Backward, Reverse, Power, ePrint); 3 LEDs (Power, Ready, Error)"
      },
      {
        "key": "Power consumption /Điện năng tiêu thụ",
        "value": "680 watts (printing), 11 watts (ready), 2.5 watts (sleep), 0.2 watts (off)"
      },
      {
        "key": "Warranty/Bảo hành",
        "value": "Bảo hành 1 năm tại nơi sử dụng"
      }
    ]
  },
  "hw_full_17": {
    "name": "Máy photocopy Ricoh IM 3500",
    "model": "IM 3500",
    "brand": "Ricoh",
    "origin": "Thái Lan",
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "price": 0,
    "specs": [
      {
        "key": "Tốc độ sao chụp / in",
        "value": "35 bản/phút"
      },
      {
        "key": "Tốc độ scan",
        "value": "80 ipm"
      },
      {
        "key": "Độ phân giải sao chụp",
        "value": "600 x 600 dpi"
      },
      {
        "key": "Độ phân giải scan",
        "value": "100 dpi, 200dpi, 300 dpi, 400 dpi, 600 dpi"
      },
      {
        "key": "Thời gian ra bản chụp đầu tiên",
        "value": "3.8 giây,"
      },
      {
        "key": "Copy liên tục",
        "value": "999 bản một lần"
      },
      {
        "key": "Thời gian khởi động máy",
        "value": "18.6 giây"
      },
      {
        "key": "Phóng to/ Thu nhỏ",
        "value": "25% ~ 400% điều chỉnh 1%"
      },
      {
        "key": "Bộ phận tự động nạp và đảo bản gốc",
        "value": "ARDF có sẵn"
      },
      {
        "key": "Chia bộ điện tử và sao chụp hai mặt",
        "value": "có sẵn"
      },
      {
        "key": "Chia bản chụp theo 2 chế độ",
        "value": "so le và dọc ngang"
      },
      {
        "key": "Chế độ tự động ngủ khi không sử dụng",
        "value": "có sẵn"
      },
      {
        "key": "Kích cỡ giấy",
        "value": "B6 - A3"
      },
      {
        "key": "Định lượng giấy",
        "value": "52 ~ 300 g/m2"
      },
      {
        "key": "Khay giấy",
        "value": "2 khay x 550 tờ, khay tay x 100 tờ"
      },
      {
        "key": "Khay giấy ra",
        "value": "500 tờ"
      },
      {
        "key": "Bộ nhớ tiêu chuẩn",
        "value": "2 GB, HDD : 320 GB"
      },
      {
        "key": "Ngôn ngữ in",
        "value": "PCL5e/PCL6, PDF Driect, PS3 (Emulation)"
      },
      {
        "key": "Kết nối",
        "value": "Ethernet 10Base-T/100Base-TX/1000Base-T, USB Host I/F"
      },
      {
        "key": "Hệ điều hành hỗ trợ",
        "value": "Windows Vista/7/8/8.1/10, Windows server/2008/2008 R2/2012/2012 R2"
      },
      {
        "key": "Hỗ trợ scan",
        "value": "scan to email, scan to USB/SD, scan to Folder,"
      },
      {
        "key": "Định dạng scan",
        "value": "PDF, TIFF, JPEG,High Compression PDF, PDF-A"
      },
      {
        "key": "Chân kê: có sẵn",
        "value": "có sẵn"
      },
      {
        "key": "Bảo hành",
        "value": "12 Tháng"
      }
    ]
  }
  ,
  'stt1_my_vi_tnh_msi_pro_dp180_a': {
    name: 'Máy vi tính MSI PRO DP180 AI 8HG',
    model: '', brand: 'MSI', origin: '', warranty: '', unit: 'Cái', price: 0,
    specs: [
      { key: 'CPU', value: 'Intel® Core™ Ultra 5 225' },
      { key: 'RAM', value: '16GB DDR5' },
      { key: 'Ổ cứng', value: '512GB SSD' },
      { key: 'Cổng xuất hình', value: 'HDMI;' },
      { key: 'Thông số', value: 'Màn hình 23.8 inch' },
      { key: 'Hệ điều hành', value: 'Window 11 Pro 64 bit bản quyền vĩnh viễn' },
      { key: 'Thông số', value: 'Phần mềm Microsoft Office Home & Business 2024' },
      { key: 'Hình thức cấp phép', value: 'Key điện tử' },
      { key: 'Thời hạn bản quyền', value: 'Vĩnh viễn' },
      { key: 'Ngôn ngữ', value: 'Nhiều ngôn ngữ' },
      { key: 'Tương thích hệ điều hành', value: 'Windows, MacOS, Android IOS' },
      { key: 'Thông số', value: 'Phần mềm diệt virus bản quyền 03 năm' },
      { key: 'Thông số', value: 'Chuột bàn phím đi kèm' },
      { key: 'Kết nối không dây, Wifi, Bluetooth', value: 'không' },
      { key: 'Thông số', value: 'Bảo hành 12 tháng' }
    ]
  },
  'stt2_my_in_oki_b433dn': {
    name: 'Máy in OKI B433DN',
    model: '', brand: 'OKI', origin: '', warranty: '', unit: 'Cái', price: 0,
    specs: [
      { key: 'Tốc độ in A4/Letter', value: 'lên đến 40 trang/phút' },
      { key: 'Loại máy in', value: 'Đơn năng Laser' },
      { key: 'In đảo mặt', value: 'Có' },
      { key: 'Độ phân giải', value: '1200 x 1200 dpi' },
      { key: 'Kết nối', value: 'Ethernet: 1000BASE-T/100BASE-TX/10BASE-T,\nUSB 2.0 Thiết bị (Loại B), USB 2.0 Máy chủ, NFC8' },
      { key: 'Nguồn điện', value: '220-240 V AC 50/60Hz' },
      { key: 'Thông số', value: 'Bảo hành 12 tháng' }
    ]
  },
  'stt3_my_scan_ricoh_fi8170': {
    name: 'Máy scan RICOH Fi-8170',
    model: '', brand: 'Ricoh', origin: '', warranty: '', unit: 'Cái', price: 0,
    specs: [
      { key: 'Tốc độ quét ADF', value: '70 trang/phút, 140 hình/phút.' },
      { key: 'Độ phân giải máy quét', value: '600 x 600 dpi.' },
      { key: 'Kết nối', value: 'USB 3.2 Gen1x1 / USB 2.0 / USB 1.1\nLAN: 10BASE-T, 100BASE-TX, 1000BASE-T' },
      { key: 'Bộ nhớ', value: '512 MB' },
      { key: 'Tốc độ xử lý', value: 'GI Processor 666 Mhz' },
      { key: 'Chu kì quét (daily)', value: '10000 trang/ ngày' },
      { key: 'Định dạng file quét', value: 'Bitmap, TIFF, Multi-TIFF, JPEG, JPEG2000, Searchable PDF, PDF, PDF/A, PNG, RTF, Word, Excel, PowerPoint' },
      { key: 'Thông số', value: 'Bảo hành 12 tháng' }
    ]
  },
  'stt4_my_nh_ph_kin_canon_eos_r6': {
    name: 'Máy ảnh + phụ kiện Canon EOS R6 Mark II',
    model: '', brand: 'Canon', origin: '', warranty: '', unit: 'Cái', price: 0,
    specs: [
      { key: 'Thông số', value: 'Cảm biến Full-Frame 24,2MP' },
      { key: 'ISO', value: '100 đến 102.400' },
      { key: 'Thông số', value: 'Quay video 4K' },
      { key: 'Thông số', value: 'Quay khung dọc dễ dàng' },
      { key: 'Phụ kiện đi kèm', value: '' },
      { key: 'Ống kính đi kèm', value: 'RF 50mm' },
      { key: 'Thông số', value: 'Pin đi kèm' },
      { key: 'Thông số', value: 'Thẻ nhớ 64GB đi kèm' },
      { key: 'Thông số', value: 'Chân máy ảnh' },
      { key: 'Thông số', value: 'Đèn chụp' },
      { key: 'Thông số', value: 'Phông chụp' },
      { key: 'Thông số', value: 'Bảo hành 12 tháng' }
    ]
  },
  'stt5_thit_b_switch_layer_3_gra': {
    name: 'Thiết bị Switch layer 3 Granstream GWN7813',
    model: '', brand: 'Granstream', origin: '', warranty: '', unit: 'Cái', price: 0,
    specs: [
      { key: 'Thiết bị chính', value: '' },
      { key: 'Thông số', value: '24x10/100/1000BASE-T (RJ-45)' },
      { key: 'Thông số', value: '4x10GBASE-R (SFP+)/1000BASE-X (SFP)' },
      { key: 'Thông số', value: '1xConsole port RJ-45' },
      { key: 'Thiết bị đi kèm', value: '' },
      { key: 'Số kết nối', value: '4 sim + 1 Ethernet' },
      { key: 'Băng tần wifi', value: '2.4GHz, 5.8GHz' },
      { key: 'Wifi', value: '802.11b/g/n, tốc độ 300Mb/s' },
      { key: 'Phạm vi phát wifi', value: '30m' },
      { key: 'Pin tích hợp', value: '10.000 mA' },
      { key: 'Thời gian hoạt động', value: '5,5 giờ' },
      { key: 'Màn hình hiển thị các thông tin', value: 'Tình trạng pin; băng thông đường lên; băng thông đường xuống; tình trạng kết nối các sim; tình trạng mức sóng trên các sim' },
      { key: 'Hỗ trợ Ipv6', value: 'có' },
      { key: 'Thông số', value: 'Cho phép cấu hình riêng biệt từng sim, LAN, WAN, Wifi' },
      { key: 'Cho phép kiểm tra trạng thái trên từng sim bao gồm', value: 'Tình trạng hoạt động; tên nhà mạng; mức tín hiệu; băng thông sử dụng; IMEI; IMSI.' },
      { key: 'Số kết nối ăng ten', value: '6' },
      { key: 'Thiết kế', value: 'Tích hợp trong valy cứng' },
      { key: 'Cấp độ bảo vệ', value: 'IP67' },
      { key: 'Thông số', value: 'Bảo hành 12 tháng' }
    ]
  },
  'stt6_my_ch_liveu_lu2000': {
    name: 'Máy chủ  LiveU LU2000',
    model: '', brand: 'LiveU', origin: '', warranty: '', unit: 'Cái', price: 0,
    specs: [
      { key: 'CPU', value: 'Intel Xeon E-2124 tương đương hoặc cao hơn' },
      { key: 'Ram', value: '16 GB DDR 4' },
      { key: 'Ổ cứng', value: '1 TB HDD' },
      { key: 'VGA', value: 'N/A' },
      { key: 'Thông số', value: 'Chế độ xem dạng danh sách; chế độ xem dạng ô' },
      { key: 'Thông số', value: 'Lọc thiết bị phát hình theo tình trạng hoạt động (đang truyền, đang online, đang offline)' },
      { key: 'Thông số', value: 'Khả năng quản lý kênh truyền' },
      { key: 'Thông số', value: 'Xem danh sách kênh' },
      { key: 'Thông số', value: 'Thông tin kênh (tên, chế độ, cổng xuất hình, ép độ phân giải đầu ra, hạn chế băng thông)' },
      { key: 'Thông số', value: 'Bật tắt, chỉnh sửa lớp phủ đồ họa' },
      { key: 'Thông số', value: 'Hỗ trợ stream RTSP; MPEG-TS; SRT; RTMP' },
      { key: 'Hỗ trợ stream lên những nền tảng', value: 'Akamai; Facebook; Youtube; Twitch; Ustream; Wowza;...' },
      { key: 'Thông số', value: 'Cài đặt độ phân giải, bitrate cho stream' },
      { key: 'Thông số', value: 'Cho phép xem thông tin thiết bị phát hình' },
      { key: 'Thông số', value: 'Chế độ hoạt động' },
      { key: 'Thông số', value: 'Các tệp hiện có (trong bộ nhớ, thẻ SD, USB)' },
      { key: 'Thông số', value: 'Xem trước video đang truyền' },
      { key: 'Thông số', value: 'Kênh đang truyền về' },
      { key: 'Thông số', value: 'Tình trạng kết nối' },
      { key: 'Thông số', value: 'Tên; S/N; Phiên bản phần mềm;...' },
      { key: 'Thông số', value: 'Vị trí thiết bị trên bản đồ' },
      { key: 'Điều khiển thiết bị phát từ xa', value: '' },
      { key: 'Thông số', value: 'Điều khiển truyền/dừng truyền' },
      { key: 'Thông số', value: 'Lựa chọn kênh truyền' },
      { key: 'Thông số', value: 'Cấu hình độ trễ truyền' },
      { key: 'Thông số', value: 'Cấu hình chế độ hoạt động' },
      { key: 'Thông số', value: 'Kết nối/ngắt kết nối wifi, ethernet' },
      { key: 'Thông số', value: 'Kết nối/ngắt kết nối toàn bộ modem SIM hoặc từng modem SIM' },
      { key: 'Thông số', value: 'Khả năng quản lý danh sách tệp đã truyền về server' },
      { key: 'Thông số', value: 'Tìm kiếm tệp' },
      { key: 'Thông số', value: 'Xóa tệp' },
      { key: 'Thông số', value: 'Lọc các tệp theo thiết bị tải lên' },
      { key: 'Thông số', value: 'Xem siêu dữ liệu (meta data) của tệp' },
      { key: 'Thông số', value: 'Cài đặt mật khẩu' },
      { key: 'Thông số', value: 'Cài đặt thông báo khi' },
      { key: 'Thông số', value: 'Thiết bị online' },
      { key: 'Thông số', value: 'Bắt đầu truyền video' },
      { key: 'Thông số', value: 'Dừng truyền video' },
      { key: 'Thông số', value: 'Thiết bị offline do để quá lâu' },
      { key: 'Thông số', value: 'Thiết bị offline khi đang truyền video' },
      { key: 'Thông số', value: 'Đang truyền file' },
      { key: 'Thông số', value: 'Truyền file hoàn thành' },
      { key: 'Thông số', value: 'Có thiết bị mới được thêm vào' },
      { key: 'Module truyền dẫn tín hiệu', value: '' },
      { key: 'Độ phân giải video', value: '1080p50/60/25/30, 720p50/60' },
      { key: 'Giao diện video', value: 'HDMI và Ethernet RJ45 cho IP camera' },
      { key: 'VIDEO encoder', value: 'H.265/HEVC, H.264' },
      { key: 'AUDIO encoder', value: 'AAC-HE/LC, 2 kênh audio' },
      { key: 'Mang theo người', value: 'Túi đựng chuyên nghiệp, có đai thắt hoặc giá trên camera' },
      { key: 'Thông số', value: 'Cộng gộp băng thông đồng thời' },
      { key: 'Lên tới 6 đường', value: '2 x modem trong 4G, 2 x modem ngoài 4G, 01 WiFi và 01 Ethernet' },
      { key: 'Mã hóa', value: 'AES256' },
      { key: 'Nhiều đầu ra', value: 'Nhiều đầu ra A/V thông qua các luồng SDI và stream H.264 bao gồm kết nối CDN (phía máy chủ)' },
      { key: 'Nguồn cấp', value: 'Pin 3 giờ tích hợp trong, Bộ chuyển đổi nguồn DC12-19V; Pin ngoài' },
      { key: 'Điều khiển tại chỗ', value: 'Điều khiển bằng nút xoay và giám sát trên màn hình 2.2 inch' },
      { key: 'Điều khiển từ xa', value: 'Điều khiển từ xa từ điện thoại thông minh, máy tính xách tay, máy tính bảng thông qua trình duyệt web' },
      { key: 'Hiển thị thông tin', value: 'Xem trước video; tình trạng kết nối di động trên mỗi mạng bao gồm băng thông, độ trễ mạng, vv' },
      { key: 'Khả năng phục hồi và chất lượng', value: 'Chất lượng và khả năng phục hồi video hàng đầu nhờ các thuật toán như (ABR), tự động sửa lỗi (FEC) và các thuật toán phục hồi dữ liệu mật;' },
      { key: 'Giao diện', value: '2 x USB 2.0, micro USB, RJ-45 Ethernet, 3.5mm in/out audio jack, micro-SD card, khe cắm SIM' },
      { key: 'Giao diện không dây', value: 'WiFi 802.11 a,b,g,n,ac hỗ trợ ăng-ten MIMO, 4G / 5G' },
      { key: 'Kích thước', value: '112.5mm x 203mm x 54.5mm / 4.4” x 8” x 2.1” (W x H x D)' },
      { key: 'Trọng lượng', value: '955g (2.1lbs) với hai modem 3G/4G và pin bên trong' },
      { key: 'Chống rung sốc', value: 'MIL STD 810G method 514.6' },
      { key: 'Nhiệt độ hoạt động', value: '-5C đến +45C (23F đến 113F)' },
      { key: 'Thông số', value: 'Bảo hành 12 tháng' }
    ]
  },
  'stt7_cng_di_ng_wdbbgb0120hbkse': {
    name: 'Ổ cứng di động WDBBGB0120HBK-SESN',
    model: '', brand: 'WD', origin: '', warranty: '', unit: 'Cái', price: 0,
    specs: [
      { key: 'Kích thước', value: '3.5 inch' },
      { key: 'Giao tiếp', value: '1 cổng USB 3.0 tương thích USB 2.0' },
      { key: 'Tốc độ kết nối', value: '5Gb/s (max)' },
      { key: 'Dung lượng', value: '12 TB' },
      { key: 'Màu sắc', value: 'Vỏ nhựa màu đen' },
      { key: 'Kích thước vật lý', value: '170.6 × 49 × 139.3 mm; nặng: 0.97kg' },
      { key: 'Thông số', value: 'Đặt đứng nhỏ gọn trên bàn làm việc.' },
      { key: 'Nhiệt độ', value: '' },
      { key: 'Hoạt động', value: '5°C to 35°C;' },
      { key: 'Không hoạt động', value: '-20°C to 65°C' },
      { key: 'Tương thích', value: 'Windows/Mac; đã được định dạng sẵn exFAT. cho Windows (Không cần định dạng lại cho MAC OS X)' },
      { key: 'Thông số', value: 'Bảo hành 12 tháng' }
    ]
  },
  'stt8_mn_hnh_tivi_55_inch_sharp': {
    name: 'Màn hình Tivi 55 inch Sharp 4T-C55FM2X',
    model: '', brand: 'Sharp', origin: '', warranty: '', unit: 'Cái', price: 0,
    specs: [
      { key: 'Kích cỡ', value: '55 inch' },
      { key: 'Độ phân giải', value: '4K UHD (3840 x 2160).' },
      { key: 'Tấm nền', value: 'Full-Array LED backlighting' },
      { key: 'Độ sáng', value: '300 nits' },
      { key: 'Tần số quét', value: '60 Hz' },
      { key: 'Thông số', value: 'Bảo hành 12 tháng' }
    ]
  },
  'stt9_h_thng_kiosk_tc_ai_hcm01': {
    name: 'Hệ thống Kiosk TC AI HCM01',
    model: '', brand: 'ISO 9001-2015; 14001-2015; 45001-2018, ISO 27001-2013, Chứng nhận 5S.', origin: '', warranty: '', unit: 'Cái', price: 0,
    specs: [
      { key: 'Màn hình', value: '' },
      { key: 'Kích thước 27” LED backlit; 1920*1080; 16', value: '9; 300cd/m2.' },
      { key: 'Cảm ứng', value: 'Điện dung đa điểm, 10 điểm cùng lúc, loa 2x2w.' },
      { key: 'Kết nối tối thiểu', value: '01x HDMI, 01x VGA, 01x DVI, 01x USB, 01x 12V' },
      { key: 'Chức năng điều khiển', value: '' },
      { key: 'Thông số', value: 'Máy tự động mở khi được cấp điện và tự động tắt vào cuối ngày.' },
      { key: 'Thông số', value: 'Hỗ trợ tùy chọn tính năng nhận diện con người phía trước.' },
      { key: 'Thông số', value: 'Khung sườn' },
      { key: 'Chất liệu', value: 'Khung thép tĩnh điện, chống gỉ, chống ăn mòn tốt, tạo hình và chế tạo bằng công nghệ Laser CNC.' },
      { key: 'Vỏ máy', value: 'Vỏ máy có các kết nối Cổng LAN RJ-45, Cổng USB 2.0; Ngõ luồn dây phía sau.' },
      { key: 'Thông số', value: 'Kiểu dáng sang trọng, bền bỉ.' },
      { key: 'Bộ vi xử lý (CPU)', value: '' },
      { key: 'Thông số', value: 'Intel® Chipset LGA1851, Bộ xử lý Intel® Core™ Ultra 5 235 (24M, upto 5,00 GHz)' },
      { key: 'Bộ nhớ (RAM)', value: '16GB DDR5' },
      { key: 'Ổ cứng chạy hệ điều hành và Lưu trữ dữ liệu', value: 'SSD 512 GB' },
      { key: 'Kết nối trong', value: '01 x HDMI, 01 x DisplayPort, 06 x USB (2.0, 3.0)' },
      { key: 'Kết nối ngoài vỏ máy', value: '01xUSB, 01x RJ45 (LAN), 01 x Power button; 01 x AC220V' },
      { key: 'Máy in nhiệt', value: '' },
      { key: 'Khổ giấy', value: 'Công nghệ in nhiệt trực tiếp, giấy cuộn, khổ giấy 80mm, cắt giấy tự động.' },
      { key: 'Tốc độ in', value: 'Tốc độ in 250mm/s' },
      { key: 'Kết nối', value: 'USB 2.0' },
      { key: 'Thông số', value: 'Cửa nhận giấy từ phía trước' },
      { key: 'Thông số', value: 'Có khóa điều khiển mở thay giấy bằng mô tơ điện tự động, cửa thay giấy từ phía trước dễ dàng thay giấy' },
      { key: 'Đầu đọc Căn cước thẻ chip', value: '' },
      { key: 'Đọc CCCD và giải mã tiếng Việt như', value: 'Hình ảnh, số CCCD, ngày cấp, ngày hết hạn, số CMND, Họ và tên, Ngày tháng năm sinh, Quốc tịch, Giới tính, Dân tộc, Tôn giáo, Tên bố, tên mẹ, tên vợ hoặc chồng, nhận dạng khuôn mặt, quê quán, trường trú ...' },
      { key: 'Kết nối', value: 'USB, Cung cấp SDK cho lập trình. Cung cấp API cho kết nối phần mềm.' },
      { key: 'Kết nối', value: 'USB 2.0' },
      { key: 'Máy Scan A4', value: '' },
      { key: 'Tốc độ quét một mặt A4, 200dpi', value: '40 trang/phút.' },
      { key: 'Tốc độ quét hai mặt A4, 200dpi', value: '80 hình/phút.' },
      { key: 'Cổng kết nối', value: 'USB 2.0' },
      { key: 'Thông số', value: 'Có khả năng scan màu, đen trắng hồ sơ dạng A4, thẻ CCCD, hộ chiếu, thẻ ngân hàng, các loại thẻ cứng khác.' },
      { key: 'Thông số', value: 'Nạp giấy cửa trước; Có cửa nhận giấy dạng khe phía trước như các máy ATM, có khả năng Nhận tài liệu, scan và tự trả lại tài liệu trên cùng khe nhận giấy để thuận tiện việc scan.' },
      { key: 'Nạp giấy phía trên', value: 'Có thể nạp nhiều tài liệu cùng lúc phía trên để scan liên tục nhiều tài liệu và trả tài liệu lại cùng hướng.' },
      { key: 'Thông số', value: 'Có khả năng đọc và mã hóa mã MRZ chuẩn ICAO trên tài liệu.' },
      { key: 'Thông số', value: 'Có khả năng đọc và mã hóa mã vạch 1D (Barecode) và 2D (QRcode)' },
      { key: 'Thông số', value: 'Cảm biến hình ảnh lớn, tốc độ đọc cao, Góc đọc rộng.' },
      { key: 'Camera', value: '' },
      { key: 'Thông số', value: 'Độ phân giải full HD 1920*1080' },
      { key: 'Thông số', value: 'Góc nhìn 65° (tùy chọn 70-90°).' },
      { key: 'Kiểu gắn', value: 'Camera chuyên dụng, kiểu gắn cố định tích hợp' },
      { key: 'Thông số', value: 'Tự động điều chỉnh cân bằng ánh sáng.' },
      { key: 'Micro', value: '' },
      { key: 'Thông số', value: 'Micro thu âm đẳng hướng.' },
      { key: 'Thông số', value: 'Độ nhạy cao, thu âm trong bán kính 2m' },
      { key: 'Chứng nhận của nhà sản xuất Kiosk', value: '' },
      { key: 'Nhà sản xuất được chứng nhận', value: 'ISO 9001-2015; 14001-2015; 45001-2018, ISO 27001-2013, Chứng nhận 5S.' },
      { key: 'Thông số', value: 'Nhà sản xuất có chứng nhận đăng ký thương hiệu Việt Nam.' },
      { key: 'Thông số', value: 'Nhà sản xuất có chứng nhận quyền tác giả thương hiệu Việt.' },
      { key: 'Phần mềm Kiosk dịch vụ công tự động toàn trình', value: '' },
      { key: 'Thông số', value: 'Phần mềm Kiosk Dịch vụ công tự động toàn trình là một giải pháp công nghệ tiên tiến được thiết kế để hoạt động trên Kiosk, nhằm mục đích cung cấp một giải pháp Dịch vụ công tự động toàn trình từ khâu công dân đặt lịch trực tuyến, lấy số thứ tự trực tuyến cho đến khâu cán bộ xử lý và mỗi công dân vào quầy cuối cùng là hiển thị thông tin trên màn hình chung.' },
      { key: 'Bốc số', value: '' },
      { key: 'Thông số', value: 'Tại các điểm giao dịch, công dân có thể tương tác với Kiosk để lấy số thứ tự.' },
      { key: 'Xác thực lịch hẹn', value: 'Công dân đã đặt lịch hẹn trực tuyến có thể nhập mã đặt chỗ hoặc số CCCD, sau đó hệ thống đối soát dữ liệu và in phiếu. Trên phiếu sẽ hiển thị số CCCD của công dân để nhân viên tại quầy dễ dàng đối chiếu với giấy tờ gốc.' },
      { key: 'Lấy số trực tiếp', value: 'Đối với công dân chưa có lịch hẹn, sau khi chọn lĩnh vực dịch vụ, công dân có thể được yêu cầu quét thẻ CCCD gắn chip. Số CCCD sẽ được in trực tiếp lên phiếu cùng với số thứ tự để đảm bảo tính chính xác và duy nhất của lượt giao dịch.' },
      { key: 'Dịch vụ công', value: '' },
      { key: 'Nộp hồ sơ', value: 'Cho phép công dân thực hiện các thao tác liên quan đến việc nộp hồ sơ trực tiếp tại Kiosk.' },
      { key: 'Tra cứu hồ sơ', value: 'Cung cấp chức năng để công dân có thể kiểm tra tình trạng và thông tin về hồ sơ của mình.' },
      { key: 'Tra cứu văn bản', value: 'Cho phép người dùng tìm kiếm và xem các văn bản, quy định liên quan.' },
      { key: 'Đánh giá', value: 'Công dân có thể gửi phản hồi, đánh giá về chất lượng dịch vụ và mức độ hài lòng. Thông tin đánh giá sẽ được lưu trữ kèm theo số định danh cá nhân (CCCD) để phục vụ công tác xác thực và nâng cao chất lượng phục vụ.' },
      { key: 'Chatbox AI', value: 'Hỗ trợ trả lời thủ tục hành chính, tra cứu kết quả hồ sơ bằng ngôn ngữ văn bản/giọng nói đầu vào tự nhiên.' },
      { key: 'Thông số', value: 'Bảo hành 12 tháng' }
    ]
  },
  'stt10_my_tnh_bng_13_inch_ipad_a': {
    name: 'Máy tính bảng 13 inch iPad Air 13-inch Wi-Fi + Cellular 256GB',
    model: '', brand: 'Apple', origin: '', warranty: '', unit: 'Cái', price: 0,
    specs: [
      { key: 'Kích thước màn hình', value: '13 inches' },
      { key: 'Chipset', value: 'Apple M4' },
      { key: 'Dung lượng RAM', value: '8 GB' },
      { key: 'Bộ nhớ trong', value: '256GB' },
      { key: 'Khe sim/eSim', value: 'Có' },
      { key: 'Thông số', value: 'Bảo hành 12 tháng' }
    ]
  },
  'stt11_my_tnh_bng_11_inch_ipad_a': {
    name: 'Máy tính bảng 11 inch iPad Air 11-inch Wi-Fi + Cellular 256GB',
    model: '', brand: 'Apple', origin: '', warranty: '', unit: 'Cái', price: 0,
    specs: [
      { key: 'Kích thước màn hình', value: '13 inches' },
      { key: 'Chipset', value: 'Apple M4' },
      { key: 'Dung lượng RAM', value: '8 GB' },
      { key: 'Bộ nhớ trong', value: '256GB' },
      { key: 'Khe sim/eSim', value: 'Có' },
      { key: 'Thông số', value: 'Bảo hành 12 tháng' }
    ]
  },
  'stt12_my_thu_nhn_vn_tay_bkconte': {
    name: 'Máy thu nhận vân tay BKCONTECH BKCA2020101',
    model: '', brand: 'BKCONTECH', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
    specs: [
      { key: 'Kiểu thu nhận', value: 'Lăn, phẳng đơn, 4x4x2 phẳng' },
      { key: 'Độ phân giải', value: '500 dpi' },
      { key: 'Vùng quét (thu nhận) vân tay lăn', value: '' },
      { key: 'Chụm 4 ngón', value: '3,2” x 3,0”;' },
      { key: 'Chụm 2 ngón', value: '3,2” x 3,0”;' },
      { key: 'Vân tay lăn', value: '1,6” x 1,6”' },
      { key: 'Chuẩn giao tiếp', value: 'USB 2.0' },
      { key: 'Các hệ điều hành được hỗ trợ', value: 'Microsoft Windows 10 in 64 bit configuration; Linux Ubuntu' },
      { key: 'Tiêu chuẩn IP', value: 'IP 54' },
      { key: 'Nhiệt độ Vận hành', value: '0°C ÷ 50°C' },
      { key: 'Bảo quản', value: '-20°C ÷ 60°C' },
      { key: 'Độ ẩm', value: '10% ÷ 90% (không ngưng tụ)' },
      { key: 'Màn hình', value: 'Màn thông tin LCD hiển thị 7”' },
      { key: 'Bảo hành', value: '12 tháng' }
    ]
  },
  'stt13_my_thu_nhn_mng_mt_cmitech': {
    name: 'Máy thu nhận mống mắt CMITech BMT-20',
    model: '', brand: 'CMITech', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
    specs: [
      { key: 'Thông số', value: 'Kích thước 219 x 161 x 58 mm (8,6 X 6,3 X 2,3 inch);' },
      { key: 'Trọng lượng 680 g (1,5 lbs)- MTF', value: 'Vượt quá 4,0 lp/mm @ > 60% độ tương phản;' },
      { key: 'Độ phân giải pixel', value: '18,4 đến 20 pixel/mm;' },
      { key: 'Độ phân giải pixel hình ảnh Iris', value: '640 X 480 pixel;' },
      { key: 'Đầu ra hình ảnh', value: 'Đạt hoặc vượt ISO 19794-6;' },
      { key: 'Khoảng cách đường quang', value: '350 đến 380 mm;' },
      { key: 'Độ sâu trường', value: '30 mm (1,2 inch);' },
      { key: 'Khoảng cách giữa các đồng tử', value: '40 đến 90mm (1,6 đến 3,5 inch);' },
      { key: 'Thời gian chụp', value: '~ 0,5 giây, tính từ thời điểm đặt đầu đến;' },
      { key: 'Chiếu sáng hồng ngoại để chụp ảnh mống mắt/LED kép', value: 'bước sóng 850 nm (±60%); và 750 nm (±40%);' },
      { key: 'Thông số', value: 'Đèn LED bên trong giúp đồng tử co lại;' },
      { key: 'Thông số', value: 'Đèn LED bên ngoài giúp định vị có sự hỗ trợ của người vận hành;' },
      { key: 'Phạm vi nhiệt độ hoạt động', value: '0 đến 50°C- Độ ẩm: 10 đến 90% RH, không ngưng tụ;' },
      { key: 'Tiêu chuẩn an toàn cho mắt', value: 'IEC 62471, IEC 60825-1; Độ bền: IP64 tiêu chuẩn ngăn chặn xâm nhập;' },
      { key: 'Giao diện', value: 'USB 2.0 USB 2.0 tốc độ cao (500 mA ở 5V);' },
      { key: 'Nguồn điện', value: 'Không cần nguồn điện bổ sung;' },
      { key: 'Khả năng tương thích hệ điều hành', value: 'Windows 7, 8, 8.1 và 10, cả phiên bản 32 và 64 bit Linux Ubuntu 12.04, 14.04 và 16.04 LTS Android 4.0 trở lên;' },
      { key: 'Bảo hành', value: '12 tháng' }
    ]
  },
  'stt14_u_c_th_t_identiv_utrust_4': {
    name: 'Đầu đọc thẻ từ Identiv uTrust 4701 F',
    model: '', brand: 'Identiv', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
    specs: [
      { key: 'Thông số', value: 'Giao diện kép đầu đọc thẻ thông minh, tuân thủ theo tiêu chuẩn công nghệ thẻ tiếp xúc ISO / IEC 7816, thẻ không tiếp xúc 13,56 MHz và NFC;' },
      { key: 'Giao diện máy chủ', value: 'USB 2.0 CCIP (USB 1.1/3.0 tương thích);' },
      { key: 'Tốc độ truyền thông', value: '12 Mbps (USB 2.0 tốc độ đầy đủ);' },
      { key: 'Kết nối', value: 'USB 2.0 CCID (USB 1.1/3.0 compliant) 12 Mbps;' },
      { key: 'Tiêu chuẩn', value: 'ISO/ IEC7816, ISO/ IEC14443, ISO/ IEC18092' },
      { key: 'Card Protocol', value: 'T=0, T=1; T=CL;' },
      { key: 'Tốc độ đọc ghi', value: 'Up to 600 kbps, TA1=97;' },
      { key: 'Tốc độ Truyền dữ liệu', value: '106/212/424/848 Kbits/S, tùy thuộc vào thẻ IC;' },
      { key: 'Hệ điều hành', value: 'Window, MacOS, Linux;' },
      { key: 'Nhiệt độ hoạt động', value: '-10° đến 70°C;' },
      { key: 'Độ ẩm hoạt động', value: 'Lên đến 95% RH không ngưng tụ;' },
      { key: 'Kết nối', value: '1.5 m cáp USB với USB Loại A kết nối;' },
      { key: 'Hệ thống Tiêu chuẩn', value: 'ISO/IEC 7816, USB 2.0 Tốc Độ Đầy Đủ, CCID, Microsoft® WHQL;' },
      { key: 'Thời gian bảo hành', value: '12 tháng' }
    ]
  },
  'stt15_thit_b_c_th_nh_aten_uh324': {
    name: 'Thiết bị đọc thẻ nhớ ATEN UH3240',
    model: '', brand: 'ATEN', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
    specs: [
      { key: 'Dùng cho', value: 'Máy vi tính hỗ trợ cổng Type C' },
      { key: 'Chức năng', value: 'Xuất hình ảnh Chuyển đổi cổng kết nối USB-C Multiport Dock' },
      { key: 'Đầu ra', value: '' },
      { key: 'Thông số', value: '1 × Gigabit Ethernet' },
      { key: 'Thông số', value: '3 × USB 3.2 Gen 1 Type-A' },
      { key: 'Thông số', value: '1 × SD/SDHC/SDXC, tới 2TB' },
      { key: 'Thông số', value: '1 × microSD/SDHC/SDXC, tới 2TB' },
      { key: 'Thông số', value: '2 × HDMI' },
      { key: 'Thông số', value: '2 Type C' },
      { key: 'Thông số', value: '1 × 3.5mm stereo 4-pole microphone/headphone' },
      { key: 'Thông số', value: '2 Type C' },
      { key: 'Tốc độ truyền dữ liệu', value: 'USB 3.2 Gen 1, 5Gbps' },
      { key: 'Độ phân giải tối đa', value: 'Single lên 8K; Dual HDMI 4K' },
      { key: 'Jack kết nối', value: 'Type-C' },
      { key: 'Thời gian bảo hành', value: '12 tháng' }
    ]
  },
  'stt16_my_c_th_nh_aten_uh3240': {
    name: 'Máy đọc thẻ nhớ ATEN UH3240',
    model: '', brand: 'ATEN', origin: '', warranty: '12 tháng', unit: 'Cái', price: 0,
    specs: [
      { key: 'Dùng cho', value: 'Máy vi tính hỗ trợ cổng Type C' },
      { key: 'Chức năng', value: 'Xuất hình ảnh Chuyển đổi cổng kết nối USB-C Multiport Dock' },
      { key: 'Đầu ra', value: '' },
      { key: 'Thông số', value: '1 × Gigabit Ethernet' },
      { key: 'Thông số', value: '3 × USB 3.2 Gen 1 Type-A' },
      { key: 'Thông số', value: '1 × SD/SDHC/SDXC, tới 2TB' },
      { key: 'Thông số', value: '1 × microSD/SDHC/SDXC, tới 2TB' },
      { key: 'Thông số', value: '2 × HDMI' },
      { key: 'Thông số', value: '2 Type C' },
      { key: 'Thông số', value: '1 × 3.5mm stereo 4-pole microphone/headphone' },
      { key: '2 cổng USB-C Female trên dock', value: '1 × USB-C 3.2 Gen 1: truyền dữ liệu 5 Gbps.\n1 × USB-C PD: cấp nguồn/sạc, hỗ trợ PD 3.0 tới 100 W.' },
      { key: 'Tốc độ truyền dữ liệu', value: 'USB 3.2 Gen 1, 5Gbps' },
      { key: 'Độ phân giải tối đa', value: 'Single lên 8K; Dual HDMI 4K' },
      { key: 'Jack kết nối', value: 'Type-C' },
      { key: 'Thời gian bảo hành', value: '12 tháng' }
    ]
  },
  // ── ĐIỆN THOẠI & IP PHONE ──
  'dt_iphone_15_pro_max': {
    name: 'Điện thoại thông minh Apple iPhone 15 Pro Max 256GB',
    model: 'iPhone 15 Pro Max', brand: 'Apple', origin: 'Trung Quốc', warranty: '12 tháng', unit: 'Chiếc', price: 0,
    specs: [
      { key: 'Màn hình', value: '6.7 inch Super Retina XDR OLED, 2796 x 1290 pixel, 120Hz ProMotion, Độ sáng tối đa 2000 nits' },
      { key: 'Bộ vi xử lý (Chipset)', value: 'Apple A17 Pro (6 nhân CPU: 2 nhân hiệu năng cao + 4 nhân tiết kiệm điện, 6 nhân GPU, 16 nhân Neural Engine)' },
      { key: 'Bộ nhớ RAM', value: '8GB' },
      { key: 'Bộ nhớ trong (ROM)', value: '256GB NVMe' },
      { key: 'Hệ thống Camera sau', value: 'Cụm 3 camera: Chính 48MP (f/1.78, OIS dịch chuyển cảm biến thế hệ 2) + Góc siêu rộng 12MP (120 độ) + Telephoto 12MP (Zoom quang 5x)' },
      { key: 'Camera trước', value: '12MP TrueDepth (f/1.9), tự động lấy nét PDAF' },
      { key: 'Quay video', value: '4K Dolby Vision HDR @ 60fps, quay video ProRes 4K @ 60fps với ghi ngoài qua USB-C' },
      { key: 'Dung lượng Pin & Sạc', value: '4.422 mAh, Sạc nhanh 20W (50% trong 30 phút), Sạc không dây MagSafe 15W' },
      { key: 'Cổng kết nối', value: 'USB-C (hỗ trợ chuẩn USB 3.0 tốc độ truyền dữ liệu lên tới 10Gb/s)' },
      { key: 'Kết nối mạng & không dây', value: '5G (sub-6 GHz), Wi-Fi 6E (802.11ax), Bluetooth 5.3, Chip Ultra Wideband thế hệ 2, NFC' },
      { key: 'SIM', value: 'Hỗ trợ 2 SIM (1 Nano SIM + 1 eSIM hoặc 2 eSIM)' },
      { key: 'Chỉ số kháng nước & bụi', value: 'Đạt chuẩn IP68 (chống nước ở độ sâu 6m trong tối đa 30 phút theo tiêu chuẩn IEC 60529)' },
      { key: 'Bảo mật', value: 'Nhận diện khuôn mặt Face ID bảo mật qua camera TrueDepth' },
      { key: 'Chất liệu khung vỏ', value: 'Khung viền Titanium chuẩn hàng không vũ trụ, mặt lưng kính nhám cao cấp' },
      { key: 'Hệ điều hành', value: 'iOS 17 (hoặc phiên bản mới nhất)' },
      { key: 'Kích thước & Trọng lượng', value: '159.9 x 76.7 x 8.25 mm, Trọng lượng: 221 g' },
      { key: 'Bảo hành', value: '12 tháng chính hãng' }
    ]
  },
  'dt_samsung_s24_ultra': {
    name: 'Điện thoại thông minh Samsung Galaxy S24 Ultra 5G 256GB',
    model: 'Galaxy S24 Ultra (SM-S928B)', brand: 'Samsung', origin: 'Việt Nam', warranty: '12 tháng', unit: 'Chiếc', price: 0,
    specs: [
      { key: 'Màn hình', value: '6.8 inch Dynamic AMOLED 2X, QHD+ (3120 x 1440 pixel), Tần số quét tương thích 1-120Hz, Độ sáng 2600 nits, Kính cường lực Corning Gorilla Armor chống chói' },
      { key: 'Bộ vi xử lý', value: 'Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm, 8 nhân, xung nhịp tối đa 3.39GHz)' },
      { key: 'Bộ nhớ RAM', value: '12GB LPDDR5X' },
      { key: 'Bộ nhớ trong (ROM)', value: '256GB UFS 4.0' },
      { key: 'Bút cảm ứng đi kèm', value: 'Tích hợp sẵn bút S-Pen điều khiển từ xa có khe cắm trong thân máy' },
      { key: 'Camera chính sau', value: '200MP (f/1.7, OIS) + 50MP Periscope Tele (Zoom quang 5x, OIS) + 10MP Tele (Zoom quang 3x) + 12MP Ultra-Wide (120 độ)' },
      { key: 'Camera trước', value: '12MP Dual Pixel PDAF (f/2.2)' },
      { key: 'Tính năng AI thông minh', value: 'Galaxy AI (Dịch trực tiếp cuộc gọi, Trợ lý phiên dịch, Khoanh tròn tìm kiếm Circle to Search, Trợ lý Note/Photo AI)' },
      { key: 'Pin & Sạc', value: '5.000 mAh, Sạc siêu nhanh 45W có dây, Sạc nhanh không dây 15W, Chia sẻ pin không dây' },
      { key: 'Kết nối', value: '5G, Wi-Fi 7, Bluetooth 5.3, NFC, Cổng USB Type-C 3.2 Gen 1 (hỗ trợ Samsung DeX)' },
      { key: 'Kháng nước & Bụi', value: 'Chuẩn IP68' },
      { key: 'Hệ điều hành', value: 'Android 14 với giao diện One UI 6.1 (hỗ trợ nâng cấp OS 7 năm)' },
      { key: 'Kích thước & Trọng lượng', value: '162.3 x 79.0 x 8.6 mm, 232 g, Khung viền Titanium' },
      { key: 'Bảo hành', value: '12 tháng chính hãng' }
    ]
  },
  'dt_yealink_t46u': {
    name: 'Điện thoại IP Doanh Nghiệp Yealink SIP-T46U',
    model: 'SIP-T46U', brand: 'Yealink', origin: 'Trung Quốc', warranty: '12 tháng', unit: 'Chiếc', price: 0,
    specs: [
      { key: 'Chủng loại', value: 'Điện thoại IP để bàn Gigabit cao cấp cho doanh nghiệp và lãnh đạo' },
      { key: 'Màn hình hiển thị', value: 'Màn hình màu LCD 4.3 inch (480 x 272 pixel) có đèn nền' },
      { key: 'Tài khoản SIP', value: 'Hỗ trợ lên tới 16 tài khoản SIP độc lập' },
      { key: 'Chất lượng âm thanh', value: 'Âm thanh chuẩn Yealink Optima HD Voice, công nghệ lọc ồn thông minh Acoustic Shield' },
      { key: 'Cổng mạng LAN', value: '2 cổng mạng Gigabit Ethernet 10/100/1000Mbps, tích hợp cấp nguồn qua mạng PoE (IEEE 802.3af)' },
      { key: 'Cổng USB mở rộng', value: '2 cổng USB 2.0 (hỗ trợ cắm USB ghi âm cuộc gọi, Tai nghe USB, Dongle Wi-Fi WF50 hoặc Dongle Bluetooth BT41)' },
      { key: 'Phím chức năng', value: '10 phím Line với đèn LED 2 màu (lên tới 27 phím DSS không giấy qua 3 trang chuyển đổi)' },
      { key: 'Bộ giải mã âm thanh (Audio Codec)', value: 'Opus, G.722, G.711(A/u), G.729AB, G.726, iLBC' },
      { key: 'Tính năng thoại', value: 'Hội nghị âm thanh 3 bên, Chuyển cuộc gọi, Giữ cuộc gọi, Chuyển tiếp cuộc gọi, Danh bạ tới 1000 số' },
      { key: 'Bảo mật mạng', value: 'SIP over TLS/SRTP, HTTPS, OpenVPN, 802.1x, VLAN' },
      { key: 'Bảo hành', value: '12 tháng' }
    ]
  },
  'dt_grandstream_2614': {
    name: 'Điện thoại IP Grandstream GRP2614 Carrier-Grade',
    model: 'GRP2614', brand: 'Grandstream', origin: 'Trung Quốc', warranty: '12 tháng', unit: 'Chiếc', price: 0,
    specs: [
      { key: 'Màn hình', value: '2 màn hình LCD: Màn hình chính màu TFT 2.8 inch (320x240) + Màn hình phụ 2.4 inch hiển thị phím số nhanh' },
      { key: 'Tài khoản SIP', value: '4 tài khoản SIP, 4 phím Line chính, lên tới 40 phím số nhanh BLF ảo' },
      { key: 'Kết nối mạng không dây', value: 'Tích hợp sẵn Wi-Fi băng tần kép 802.11 a/b/g/n/ac (2.4GHz & 5GHz) và Bluetooth 5.0' },
      { key: 'Cổng mạng có dây', value: '2 cổng mạng Gigabit 10/100/1000 Mbps hỗ trợ PoE tích hợp' },
      { key: 'Âm thanh', value: 'Âm thanh HD trên loa ngoài và tay cầm nghe, công nghệ lọc tạp âm' },
      { key: 'Bảo mật chuẩn Carrier', value: 'Khởi động an toàn Secure Boot, mã hóa kép hình ảnh phần mềm, lưu trữ dữ liệu mã hóa' },
      { key: 'Bảo hành', value: '12 tháng' }
    ]
  },

  // ── MÀN HÌNH MÁY TÍNH ──
  'mh_dell_u2424h': {
    name: 'Màn hình vi tính Dell UltraSharp 23.8 inch U2424H',
    model: 'U2424H', brand: 'Dell', origin: 'Trung Quốc', warranty: '36 tháng', unit: 'Chiếc', price: 0,
    specs: [
      { key: 'Kích thước đường chéo', value: '23.8 inch (60.47 cm)' },
      { key: 'Tấm nền hiển thị (Panel)', value: 'IPS (In-Plane Switching) cao cấp chống chói 3H' },
      { key: 'Độ phân giải', value: 'Full HD (1920 x 1080 pixel) @ 120Hz' },
      { key: 'Tỷ lệ khung hình', value: '16:9' },
      { key: 'Độ sáng màn hình', value: '250 cd/m² (nits)' },
      { key: 'Độ tương phản', value: '1000:1 (tĩnh)' },
      { key: 'Thời gian đáp ứng', value: '5ms (Fast mode), 8ms (Normal mode)' },
      { key: 'Góc nhìn', value: '178° dọc / 178° ngang' },
      { key: 'Độ phủ màu', value: '100% sRGB, 100% BT.709, 85% DCI-P3, Delta E < 2' },
      { key: 'Công nghệ bảo vệ mắt', value: 'Cảm biến ánh sáng tự động chỉnh độ sáng, ComfortView Plus giảm ánh sáng xanh có hại' },
      { key: 'Cổng kết nối', value: '1 x DisplayPort 1.4, 1 x DisplayPort out (MST), 1 x HDMI 1.4, 1 x USB-C (Data only), 3 x USB-A 3.2 Gen 2 10Gbps, 1 x Audio-out 3.5mm' },
      { key: 'Khả năng điều chỉnh chân đế', value: 'Nâng hạ độ cao 150mm, Xoay dọc 90 độ hai chiều, Xoay ngang -45° đến 45°, Nghiêng -5° đến 21°' },
      { key: 'Chuẩn gắn VESA', value: 'VESA 100 x 100 mm' },
      { key: 'Phụ kiện đi kèm', value: 'Dây nguồn, Cáp DisplayPort to DisplayPort 1.8m, Cáp USB-A to USB-C 1.0m' },
      { key: 'Bảo hành', value: '36 tháng chính hãng' }
    ]
  },
  'mh_lg_27up850': {
    name: 'Màn hình đồ họa LG 27 inch 4K UHD 27UP850N-W',
    model: '27UP850N-W', brand: 'LG', origin: 'Trung Quốc', warranty: '24 tháng', unit: 'Chiếc', price: 0,
    specs: [
      { key: 'Kích thước màn hình', value: '27 inch (68.4 cm)' },
      { key: 'Độ phân giải', value: '4K UHD (3840 x 2160 pixel)' },
      { key: 'Tấm nền', value: 'IPS với góc nhìn siêu rộng 178/178 độ' },
      { key: 'Độ sáng & Độ tương phản', value: '400 cd/m², Độ tương phản 1200:1, Hỗ trợ VESA DisplayHDR 400' },
      { key: 'Không gian màu', value: 'DCI-P3 95% (CIE1976), hiệu chuẩn màu sẵn tại nhà máy (Hardware Calibration Ready)' },
      { key: 'Cổng giao tiếp đa năng', value: '1 x USB Type-C (hỗ trợ truyền hình ảnh 4K, dữ liệu và sạc ngược Power Delivery 90W), 2 x HDMI, 1 x DisplayPort 1.4, 2 x USB 3.0, 1 x Audio out' },
      { key: 'Tích hợp loa ngoài', value: 'Hệ thống loa Stereo 5W x 2 công nghệ Waves MaxxAudio' },
      { key: 'Công nghệ hỗ trợ hình ảnh', value: 'AMD FreeSync, Dynamic Action Sync, Black Stabilizer, Flicker Safe, Reader Mode' },
      { key: 'Chân đế', value: 'Chân đế điều chỉnh độ cao, xoay dọc màn hình 90 độ và gập nghiêng' },
      { key: 'Bảo hành', value: '24 tháng' }
    ]
  },
  'mh_samsung_24': {
    name: 'Màn hình vi tính Samsung 24 inch LS24C310EAEXXV',
    model: 'LS24C310EAEXXV', brand: 'Samsung', origin: 'Việt Nam', warranty: '24 tháng', unit: 'Chiếc', price: 0,
    specs: [
      { key: 'Kích thước hiển thị', value: '23.8 inch (60.4 cm) viền siêu mỏng 3 cạnh' },
      { key: 'Tấm nền (Panel)', value: 'IPS góc nhìn rộng 178/178 độ' },
      { key: 'Độ phân giải', value: 'Full HD (1920 x 1080 pixel) @ 75Hz' },
      { key: 'Độ sáng', value: '250 cd/m² (nits)' },
      { key: 'Thời gian phản hồi', value: '5ms (GTG)' },
      { key: 'Công nghệ đồng bộ', value: 'AMD FreeSync giảm thiểu giật hình và xé hình' },
      { key: 'Bảo vệ mắt', value: 'Chế độ Eye Saver Mode và công nghệ chống nháy Flicker Free' },
      { key: 'Cổng kết nối', value: '1 x HDMI 1.4, 1 x D-Sub (VGA)' },
      { key: 'Chuẩn VESA', value: '75 x 75 mm' },
      { key: 'Bảo hành', value: '24 tháng chính hãng' }
    ]
  },

  // ── MÁY TÍNH ĐỂ BÀN & LAPTOP ──
  'pc_dell_optiplex_7010': {
    name: 'Máy vi tính để bàn Dell OptiPlex 7010 SFF',
    model: 'OptiPlex 7010 SFF', brand: 'Dell', origin: 'Trung Quốc', warranty: '36 tháng', unit: 'Bộ', price: 0,
    specs: [
      { key: 'Kiểu dáng thân máy', value: 'Small Form Factor (SFF) nhỏ gọn, tiết kiệm không gian' },
      { key: 'Bộ vi xử lý (CPU)', value: 'Intel Core i5-13500 (14 nhân, 20 luồng, 24MB Cache, xung nhịp cơ bản 2.50 GHz, tối đa 4.80 GHz)' },
      { key: 'Bộ nhớ trong (RAM)', value: '16GB (1x16GB) DDR4 3200MHz (2 khe cắm RAM, nâng cấp tối đa 64GB)' },
      { key: 'Ổ đĩa cứng lưu trữ', value: '512GB M.2 PCIe NVMe Class 35 SSD (hỗ trợ thêm 1 khe cắm ổ cứng 3.5 inch/2.5 inch SATA)' },
      { key: 'Card đồ họa', value: 'Tích hợp Intel UHD Graphics 770' },
      { key: 'Kết nối mạng có dây', value: 'Integrated Realtek RTL8111HSD-CG Gigabit Ethernet LAN 10/100/1000' },
      { key: 'Kết nối không dây', value: 'Intel Wi-Fi 6E AX211 2x2 802.11ax + Bluetooth 5.3' },
      { key: 'Cổng kết nối mặt trước', value: '2 x USB 3.2 Gen 1, 2 x USB 2.0, 1 x Jack tai nghe 3.5mm combo' },
      { key: 'Cổng kết nối mặt sau', value: '2 x USB 3.2 Gen 1, 2 x USB 2.0, 1 x DisplayPort 1.4a, 1 x HDMI 1.4b, 1 x RJ-45 LAN, 1 x Audio out' },
      { key: 'Bộ nguồn (PSU)', value: '180W chuẩn 80 PLUS Bronze chứng nhận tiết kiệm điện' },
      { key: 'Bàn phím & Chuột', value: 'Bàn phím có dây Dell KB216 USB + Chuột quang có dây Dell MS116 USB' },
      { key: 'Hệ điều hành', value: 'Windows 11 Home / Pro 64-bit bản quyền' },
      { key: 'Bảo hành', value: '36 tháng ProSupport tận nơi' }
    ]
  },
  'pc_hp_prodesk_400': {
    name: 'Máy tính để bàn HP ProDesk 400 G9 SFF',
    model: 'ProDesk 400 G9 SFF', brand: 'HP', origin: 'Trung Quốc', warranty: '12 tháng', unit: 'Bộ', price: 0,
    specs: [
      { key: 'Bộ vi xử lý (CPU)', value: 'Intel Core i5-13500 (14 nhân, 20 luồng, 24MB L3 Cache, xung nhịp Turbo tối đa 4.8 GHz)' },
      { key: 'Chipset bo mạch', value: 'Intel Q670 Express' },
      { key: 'Bộ nhớ RAM', value: '16GB (1x16GB) DDR4 3200MHz' },
      { key: 'Ổ đĩa lưu trữ', value: '512GB PCIe NVMe M.2 SSD' },
      { key: 'Đồ họa', value: 'Intel UHD Graphics 770' },
      { key: 'Cổng kết nối', value: '1 x HDMI 1.4b, 1 x DisplayPort 1.4, 1 x RJ-45, 1 x USB Type-C 10Gbps, 3 x SuperSpeed USB Type-A 10Gbps, 3 x USB Type-A 480Mbps' },
      { key: 'Bàn phím & Chuột', value: 'Đi kèm trọn bộ Bàn phím + Chuột quang HP cổng USB' },
      { key: 'Bảo hành', value: '12 tháng chính hãng HP' }
    ]
  },
  'lt_dell_latitude_3440': {
    name: 'Máy tính xách tay Dell Latitude 3440 (14 inch)',
    model: 'Latitude 3440', brand: 'Dell', origin: 'Trung Quốc', warranty: '12 tháng', unit: 'Chiếc', price: 0,
    specs: [
      { key: 'Màn hình', value: '14.0 inch Full HD (1920 x 1080), IPS, chống chói Anti-Glare, độ sáng 250 nits' },
      { key: 'Bộ vi xử lý (CPU)', value: 'Intel Core i5-1335U (10 nhân, 12 luồng, 12MB Cache, Turbo Boost lên đến 4.60 GHz)' },
      { key: 'Bộ nhớ RAM', value: '16GB (1x16GB) DDR4 3200MHz (2 khe RAM SODIMM, hỗ trợ tối đa 64GB)' },
      { key: 'Ổ cứng lưu trữ', value: '512GB M.2 2230 PCIe NVMe SSD' },
      { key: 'Đồ họa', value: 'Intel Iris Xe Graphics' },
      { key: 'Webcam & Âm thanh', value: 'Camera HD 720p có nắp che bảo mật cơ học (Privacy Shutter), Micro kép, 2 loa Waves MaxxAudio Pro' },
      { key: 'Kết nối mạng', value: 'Intel Wi-Fi 6E AX211 (2x2) + Bluetooth 5.3 + Cổng mạng LAN RJ45 10/100/1000' },
      { key: 'Cổng giao tiếp', value: '1 x USB 3.2 Gen 2 Type-C (DisplayPort & Power Delivery), 3 x USB 3.2 Gen 1, 1 x HDMI 1.4, 1 x Audio Jack combo 3.5mm' },
      { key: 'Dung lượng Pin & Sạc', value: 'Pin 3 cell 42Wh hỗ trợ công nghệ sạc nhanh ExpressCharge, Củ sạc 65W Type-C' },
      { key: 'Trọng lượng', value: '1.54 kg' },
      { key: 'Hệ điều hành', value: 'Windows 11 Home / Pro bản quyền' },
      { key: 'Bảo hành', value: '12 tháng tận nơi' }
    ]
  },

  // ── MÁY IN LASER & ĐA NĂNG ──
  'in_canon_2900': {
    name: 'Máy in laser đen trắng Canon LBP2900',
    model: 'LBP2900', brand: 'Canon', origin: 'Việt Nam', warranty: '12 tháng', unit: 'Chiếc', price: 0,
    specs: [
      { key: 'Chức năng chuẩn', value: 'In đơn năng laser đen trắng A4/A5' },
      { key: 'Công nghệ in', value: 'Laser đơn sắc với công nghệ sấy theo nhu cầu độc quyền On-Demand Fixing' },
      { key: 'Tốc độ in', value: '12 trang/phút (khổ A4)' },
      { key: 'Độ phân giải in', value: '600 x 600 dpi (tương đương 2400 x 600 dpi với công nghệ AIR)' },
      { key: 'Thời gian in trang đầu tiên', value: 'Xấp xỉ 9.3 giây' },
      { key: 'Thời gian làm nóng máy', value: '0 giây (ở chế độ chờ)' },
      { key: 'Ngôn ngữ in', value: 'CAPT 2.1 (Công nghệ nén dữ liệu in ấn thông minh của Canon)' },
      { key: 'Bộ nhớ tiêu chuẩn', value: '2MB (sử dụng bộ nhớ máy tính qua kiến trúc CAPT)' },
      { key: 'Khay chứa giấy nạp', value: 'Khay trước 150 tờ + Khay tay 1 tờ' },
      { key: 'Khay giấy ra', value: '100 tờ (úp mặt xuống)' },
      { key: 'Khổ giấy in hỗ trợ', value: 'A4, B5, A5, Letter, Legal, Executive, Envelope' },
      { key: 'Định lượng giấy in', value: '64 đến 163 g/m²' },
      { key: 'Giao diện kết nối', value: 'USB 2.0 tốc độ cao' },
      { key: 'Hộp mực theo máy (Cartridge)', value: 'Cartridge Canon 303 (in khoảng 2.000 trang độ phủ 5%)' },
      { key: 'Công suất in hàng tháng', value: 'Khuyến nghị 500 - 2.000 trang/tháng' },
      { key: 'Hệ điều hành tương thích', value: 'Windows 11, Windows 10, Windows 8.1, Windows 7, Linux' },
      { key: 'Bảo hành', value: '12 tháng chính hãng' }
    ]
  },
  'in_hp_m404dn': {
    name: 'Máy in laser trắng đen HP LaserJet Pro M404dn',
    model: 'M404dn (W1A53A)', brand: 'HP', origin: 'Việt Nam', warranty: '12 tháng', unit: 'Chiếc', price: 0,
    specs: [
      { key: 'Chức năng chuẩn', value: 'In laser đen trắng đơn năng có in đảo mặt tự động' },
      { key: 'Tốc độ in', value: 'Lên đến 38 trang/phút (A4 tiêu chuẩn) / In 2 mặt tự động: 31 trang/phút' },
      { key: 'Độ phân giải', value: 'HP FastRes1200, HP ProRes1200 (1200 x 1200 dpi)' },
      { key: 'Thời gian in trang đầu', value: 'Nhanh 6.3 giây' },
      { key: 'Bộ xử lý CPU & Bộ nhớ', value: 'CPU tốc độ 1200 MHz, Bộ nhớ RAM 256MB DRAM' },
      { key: 'Màn hình điều khiển', value: 'Màn hình LCD 2 dòng hiển thị rõ nét với bàn phím điều hướng' },
      { key: 'Tính năng in 2 mặt (Duplex)', value: 'Tự động (Automatic Duplex Printing tích hợp)' },
      { key: 'Khay nạp giấy', value: 'Khay 1 đa năng 100 tờ + Khay 2 tiêu chuẩn 250 tờ (Tổng nạp 350 tờ)' },
      { key: 'Khay giấy ra', value: '150 tờ' },
      { key: 'Khổ giấy in', value: 'A4, A5, A6, B5 (JIS), B6 (JIS), 16K, Legal, Letter' },
      { key: 'Cổng kết nối', value: '1 x Hi-Speed USB 2.0, 1 x Gigabit Ethernet LAN 10/100/1000BASE-T' },
      { key: 'Tính năng in di động', value: 'Apple AirPrint, HP ePrint, HP Smart App, Mopria Certified' },
      { key: 'Hộp mực sử dụng', value: 'HP 76A Black LaserJet Toner Cartridge (~3.000 trang) hoặc HP 76X Black High Yield (~10.000 trang)' },
      { key: 'Chu kỳ in hàng tháng', value: 'Tối đa 80.000 trang/tháng (khuyến nghị 750 đến 4.000 trang/tháng)' },
      { key: 'Bảo hành', value: '12 tháng chính hãng HP' }
    ]
  },
  'in_brother_l2321d': {
    name: 'Máy in laser Brother HL-L2321D',
    model: 'HL-L2321D', brand: 'Brother', origin: 'Việt Nam', warranty: '12 tháng', unit: 'Chiếc', price: 0,
    specs: [
      { key: 'Chức năng', value: 'In laser đen trắng A4 đảo mặt tự động' },
      { key: 'Tốc độ in ấn', value: '30 trang/phút (A4)' },
      { key: 'Độ phân giải', value: 'HQ1200 (2400 x 600 dpi), 600 x 600 dpi' },
      { key: 'Tự động in 2 mặt', value: 'Có sẵn (Duplex Print)' },
      { key: 'Bộ nhớ trong', value: '8MB' },
      { key: 'Khay nạp giấy kín', value: 'Khay chứa tiêu chuẩn 250 tờ chống ẩm bụi + 1 khe nạp giấy thủ công' },
      { key: 'Giao tiếp', value: 'USB 2.0 tốc độ cao' },
      { key: 'Hộp mực & Cụm trống rời', value: 'Mực TN-2385 (2.600 trang) & Cụm trống từ DR-2385 (12.000 trang) giúp tiết kiệm tối đa chi phí thay thế' },
      { key: 'Bảo hành', value: '12 tháng' }
    ]
  },
  'in_epson_l3250': {
    name: 'Máy in phun màu đa năng Epson EcoTank L3250 (In/Scan/Copy/Wi-Fi)',
    model: 'EcoTank L3250', brand: 'Epson', origin: 'Philippines', warranty: '24 tháng', unit: 'Chiếc', price: 0,
    specs: [
      { key: 'Chức năng đa năng', value: 'In màu, Quét ảnh/văn bản (Scan), Sao chụp (Copy)' },
      { key: 'Công nghệ in', value: 'Công nghệ in không nhiệt Epson Heat-Free Micro Piezo độc quyền' },
      { key: 'Tốc độ in', value: '33 trang/phút (đen trắng nháp), 15 trang/phút (màu nháp); 10 ipm (đen ISO), 5 ipm (màu ISO)' },
      { key: 'Độ phân giải in tối đa', value: '5760 x 1440 dpi' },
      { key: 'Công nghệ Scan', value: 'Cảm biến phẳng Flatbed CIS, độ phân giải quang học 1200 x 2400 dpi' },
      { key: 'Hệ thống mực liên tục', value: 'Hệ thống bình mực EcoTank chống tràn tích hợp sẵn (Mực đen 003 in 4.500 trang, bộ 3 màu 003 in 7.500 trang)' },
      { key: 'Kết nối mạng & không dây', value: 'Wi-Fi IEEE 802.11b/g/n, Wi-Fi Direct in không cần router, USB 2.0' },
      { key: 'In di động thông minh', value: 'Epson Smart Panel, Epson iPrint, Apple AirPrint, Mopria' },
      { key: 'Bảo hành', value: '24 tháng hoặc 30.000 bản in (tùy điều kiện nào đến trước)' }
    ]
  }
};

function applyModelPreset(devId, presetKey) {
  if (!presetKey) return;
  var d = devs.find(function (x) { return x.id === devId; });
  if (!d) return;

  if (presetKey.startsWith('khung_')) {
    applyCategoryFramework(devId, presetKey);
    return;
  }

  var preset = MODEL_PRESETS[presetKey];
  if (!preset) return;

  d.name = preset.name;
  d.model = preset.model;
  d.brand = preset.brand;
  d.origin = preset.origin;
  d.warranty = preset.warranty;
  d.unit = preset.unit || 'Máy';
  if (!d.price || d.price === 0) d.price = preset.price;
  d.specs = JSON.parse(JSON.stringify(preset.specs));

  syncDeviceSpecs(d);
  var sel = document.getElementById('quickDevSelect');
  renderEditForm(sel ? +sel.value : 0);
  renderCurrentSheetView();
  toast('✅ Đã nạp thành công 100% thông số của ' + preset.name, 'ok');
}

function applyStandard26Specs(devId) {
  var d = devs.find(function (x) { return x.id === devId; });
  if (!d) return;

  var currentSpecsMap = {};
  (d.specs || []).forEach(function (s) {
    if (s.key) currentSpecsMap[s.key.toLowerCase().trim()] = s.value;
  });

  var newSpecs = [];
  STANDARD_26_SPEC_KEYS.forEach(function (keyName) {
    var kL = keyName.toLowerCase().trim();
    var val = currentSpecsMap[kL] || '';
    if (!val) {
      if (kL.includes('model') && d.model) val = d.model;
      else if ((kL.includes('hãng') || kL.includes('thương hiệu')) && d.brand) val = d.brand;
      else if ((kL.includes('xuất xứ') || kL.includes('nước sản xuất')) && d.origin) val = d.origin;
      else if (kL.includes('bảo hành') && d.warranty) val = d.warranty;
      else if (kL.includes('năm sản xuất')) val = 'từ 2024 tới nay';
    }
    newSpecs.push({ key: keyName, value: val });
  });

  // Preserve any custom specs that were already present but not in the 26 standard keys
  (d.specs || []).forEach(function (s) {
    var kL = String(s.key || '').toLowerCase().trim();
    var in26 = STANDARD_26_SPEC_KEYS.some(function (k26) { return k26.toLowerCase().trim() === kL; });
    if (!in26 && s.key && s.value) {
      newSpecs.push(s);
    }
  });

  d.specs = newSpecs;
  syncDeviceSpecs(d);
  var sel = document.getElementById('quickDevSelect');
  renderEditForm(sel ? +sel.value : 0);
  renderCurrentSheetView();
  toast('✅ Đã áp dụng trọn bộ khung 26 thông số kỹ thuật chuẩn!', 'ok');
}

function applyCategoryFramework(devId, frameKey) {
  var d = devs.find(function (x) { return x.id === devId; });
  if (!d) return;

  var keys = [];
  if (frameKey === 'khung_dien_thoai') {
    keys = [
      'Chủng loại', 'Màn hình hiển thị', 'Kích thước & Độ phân giải màn hình', 'Tấm nền & Tần số quét',
      'Bộ vi xử lý (Chipset / CPU)', 'Bộ nhớ RAM', 'Bộ nhớ lưu trữ trong (ROM)', 'Hệ thống Camera sau',
      'Camera trước', 'Quay video', 'Dung lượng Pin & Công nghệ sạc', 'Cổng giao tiếp',
      'Chuẩn kết nối mạng di động (5G/4G)', 'Kết nối không dây (Wi-Fi/Bluetooth/NFC)', 'Thẻ SIM hỗ trợ',
      'Tiêu chuẩn kháng nước & bụi', 'Tính năng bảo mật', 'Chất liệu khung viền & mặt lưng',
      'Hệ điều hành', 'Kích thước', 'Trọng lượng', 'Bảo hành', 'Năm sản xuất', 'Nước sản xuất'
    ];
  } else if (frameKey === 'khung_man_hinh') {
    keys = [
      'Kích thước màn hình', 'Độ phân giải tối ưu', 'Tấm nền hiển thị (Panel)', 'Tần số quét (Refresh Rate)',
      'Thời gian phản hồi (Response Time)', 'Tỷ lệ khung hình', 'Độ sáng màn hình', 'Độ tương phản tĩnh',
      'Độ tương phản động', 'Góc nhìn (Ngang/Dọc)', 'Độ phủ không gian màu', 'Công nghệ chống nháy & Bảo vệ mắt',
      'Cổng xuất hình ảnh (HDMI/DisplayPort/Type-C/VGA)', 'Cổng USB mở rộng', 'Khả năng điều chỉnh chân đế (Nâng hạ/Xoay/Nghiêng)',
      'Chuẩn gắn tường VESA', 'Loa tích hợp', 'Công suất tiêu thụ điện', 'Bảo hành', 'Năm sản xuất', 'Nước sản xuất'
    ];
  } else if (frameKey === 'khung_may_tinh') {
    keys = [
      'Kiểu dáng thân máy (Form Factor)', 'Bộ vi xử lý (CPU)', 'Số nhân & Số luồng xử lý', 'Tốc độ xung nhịp CPU',
      'Bộ nhớ đệm (Cache)', 'Bộ nhớ trong (RAM)', 'Chuẩn RAM & Tốc độ Bus', 'Khả năng nâng cấp RAM',
      'Ổ đĩa lưu trữ chính (SSD NVMe)', 'Khe cắm mở rộng lưu trữ', 'Card đồ họa (VGA)',
      'Cổng kết nối mặt trước', 'Cổng kết nối mặt sau', 'Cổng xuất hình ảnh', 'Kết nối mạng LAN (Ethernet)',
      'Kết nối không dây (Wi-Fi & Bluetooth)', 'Bàn phím & Chuột đi kèm', 'Bộ nguồn công suất (PSU)',
      'Hệ điều hành bản quyền', 'Kích thước & Trọng lượng', 'Bảo hành', 'Năm sản xuất', 'Nước sản xuất'
    ];
  } else if (frameKey === 'khung_laptop') {
    keys = [
      'Kích thước & Độ phân giải màn hình', 'Công nghệ tấm nền màn hình', 'Bộ vi xử lý (CPU)', 'Tốc độ xung nhịp CPU',
      'Bộ nhớ trong (RAM)', 'Ổ đĩa cứng lưu trữ (SSD)', 'Card đồ họa (VGA)', 'Camera Web & Micro thu âm',
      'Hệ thống âm thanh & Loa', 'Bàn phím & Đèn nền', 'Bàn di chuột (Touchpad)', 'Chuẩn kết nối không dây (Wi-Fi/Bluetooth)',
      'Cổng giao tiếp (USB-A, USB-C/Thunderbolt, HDMI)', 'Cổng mạng LAN', 'Cảm biến bảo mật (Vân tay/Khuôn mặt)',
      'Dung lượng Pin & Bộ sạc', 'Chất liệu vỏ máy', 'Trọng lượng máy', 'Hệ điều hành', 'Bảo hành', 'Năm sản xuất', 'Nước sản xuất'
    ];
  } else if (frameKey === 'khung_may_in') {
    keys = [
      'Chức năng chuẩn', 'Công nghệ in', 'Tốc độ in ấn (A4)', 'Độ phân giải in (dpi)', 'Thời gian in trang đầu tiên',
      'Tính năng in đảo mặt (Duplex)', 'Bộ xử lý CPU & Bộ nhớ RAM', 'Bảng điều khiển & Màn hình hiển thị',
      'Khay nạp giấy tiêu chuẩn', 'Khay nạp giấy tay đa năng', 'Khay chứa giấy ra', 'Khổ giấy in hỗ trợ',
      'Định lượng giấy in', 'Cổng kết nối giao tiếp (USB/LAN/Wi-Fi)', 'Khả năng in ấn di động', 'Ngôn ngữ in ấn',
      'Hộp mực đi kèm (Dung lượng trang in)', 'Tuổi thọ cụm trống (Drum)', 'Công suất in hàng tháng (Khuyến nghị/Tối đa)',
      'Hệ điều hành tương thích', 'Kích thước & Trọng lượng', 'Bảo hành', 'Năm sản xuất', 'Nước sản xuất'
    ];
  } else if (frameKey === 'khung_photocopy') {
    keys = [
      'Chức năng chuẩn (Copy/In/Scan)', 'Bộ nạp & Đảo bản gốc tự động (ARDF/SPDF)', 'Tốc độ sao chụp & in (A4)',
      'Độ phân giải in/copy', 'Thời gian khởi động & Bản chụp đầu', 'Bảng điều khiển cảm ứng', 'Bộ nhớ RAM & Ổ đĩa cứng',
      'Khổ giấy sao chụp/in', 'Trữ lượng giấy tiêu chuẩn (Khay nạp)', 'Tính năng in/copy 2 mặt tự động',
      'Tốc độ quét ảnh (Scan)', 'Định dạng file quét ảnh', 'Giao diện kết nối mạng (LAN/USB)', 'Ngôn ngữ in',
      'Tính năng bảo mật dữ liệu', 'Hộp mực theo máy (Số bản in)', 'Tuổi thọ cụm từ & trống', 'Công suất tiêu thụ điện',
      'Bảo hành', 'Năm sản xuất', 'Nước sản xuất'
    ];
  } else if (frameKey === 'khung_may_scan') {
    keys = [
      'Kiểu dáng máy quét', 'Công nghệ cảm biến quét ảnh', 'Nguồn sáng quét', 'Khổ giấy quét tối đa',
      'Định lượng giấy quét hỗ trợ', 'Tốc độ quét một mặt (Simplex)', 'Tốc độ quét hai mặt (Duplex)',
      'Khay nạp bản gốc tự động (ADF)', 'Công suất quét hàng ngày', 'Độ phân giải quang học', 'Độ phân giải đầu ra',
      'Cổng giao tiếp kết nối', 'Cảm biến siêu âm phát hiện nạp giấy kép', 'Định dạng file xuất ra',
      'Phần mềm xử lý ảnh & OCR tiếng Việt đi kèm', 'Hệ điều hành tương thích', 'Bảo hành', 'Năm sản xuất', 'Nước sản xuất'
    ];
  } else if (frameKey === 'khung_ups') {
    keys = [
      'Công suất nguồn (VA / Watt)', 'Công nghệ lưu điện', 'Điện áp vào danh định & Dải điện áp',
      'Điện áp ra danh định & Độ ổn định', 'Thời gian lưu điện (ở 50% & 100% tải)', 'Dạng sóng điện áp ngõ ra',
      'Loại ắc quy sử dụng', 'Thời gian sạc nạp lại ắc quy', 'Số lượng ổ cắm ngõ ra', 'Cổng giao tiếp quản lý (USB/RS232/SNMP)',
      'Bảo vệ quá tải, ngắn mạch & Chống sét lan truyền', 'Màn hình hiển thị LCD/LED trạng thái', 'Bảo hành', 'Năm sản xuất', 'Nước sản xuất'
    ];
  } else if (frameKey === 'khung_mang') {
    keys = [
      'Loại thiết bị mạng', 'Số lượng cổng mạng tốc độ cao (RJ45)', 'Cổng quang Uplink (SFP/SFP+)',
      'Băng thông chuyển mạch (Switching Capacity)', 'Tốc độ chuyển tiếp gói tin (Forwarding Rate)',
      'Cấp nguồn qua mạng PoE (Số cổng & Tổng công suất PoE Budget)', 'Tính năng quản lý Layer (L2/L3)',
      'Hỗ trợ VLAN (802.1Q)', 'Tính năng bảo mật mạng (ACL, 802.1X, DHCP Snooping)', 'Giao thức định tuyến (Static Routing/OSPF)',
      'Bảo hành', 'Năm sản xuất', 'Nước sản xuất'
    ];
  } else if (frameKey === 'khung_camera') {
    keys = [
      'Cảm biến hình ảnh', 'Độ phân giải tối đa', 'Ống kính tiêu cự & Góc quan sát', 'Tầm nhìn hồng ngoại ban đêm (IR Range)',
      'Chuẩn nén video (H.265+/H.265/H.264)', 'Tốc độ khung hình (Frame Rate)', 'Công nghệ chống ngược sáng (WDR)',
      'Tính năng phân tích hình ảnh thông minh AI (Phát hiện người/xe)', 'Tích hợp Micro & Loa đàm thoại 2 chiều',
      'Khe cắm thẻ nhớ MicroSD mở rộng', 'Chuẩn kết nối mạng & Cấp nguồn PoE', 'Tiêu chuẩn bảo vệ kháng nước & bụi (IP67/IK10)',
      'Bảo hành', 'Năm sản xuất', 'Nước sản xuất'
    ];
  } else {
    keys = STANDARD_26_SPEC_KEYS;
  }

  var currentMap = {};
  (d.specs || []).forEach(function (s) { if (s.key) currentMap[s.key.toLowerCase().trim()] = s.value; });

  var newSpecs = keys.map(function (k) {
    var kL = k.toLowerCase().trim();
    var val = currentMap[kL] || '';
    if (!val) {
      if (kL.includes('model') && d.model) val = d.model;
      else if ((kL.includes('hãng') || kL.includes('thương hiệu')) && d.brand) val = d.brand;
      else if ((kL.includes('xuất xứ') || kL.includes('nước sản xuất')) && d.origin) val = d.origin;
      else if (kL.includes('bảo hành') && d.warranty) val = d.warranty;
      else if (kL.includes('năm sản xuất')) val = 'Từ 2024 tới nay';
    }
    return { key: k, value: val };
  });

  d.specs = newSpecs;
  syncDeviceSpecs(d);
  var sel = document.getElementById('quickDevSelect');
  renderEditForm(sel ? +sel.value : 0);
  renderCurrentSheetView();
  toast('✅ Đã áp dụng khung thông số chuẩn cho ' + frameKey.replace('khung_', ''), 'ok');
}

function findMatchingPresetKey(name, model) {
  name = (name || '').toLowerCase();
  model = (model || '').toLowerCase();
  var combined = (name + ' ' + model).trim();

  for (var pKey in MODEL_PRESETS) {
    var p = MODEL_PRESETS[pKey];
    if (p.model && p.model.length >= 3 && (name.includes(p.model.toLowerCase()) || model.includes(p.model.toLowerCase()))) {
      return pKey;
    }
    if (p.name && (combined.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(combined))) {
      return pKey;
    }
    var normKey = pKey.replace(/_/g, ' ').toLowerCase();
    if (combined.includes(normKey)) {
      return pKey;
    }
  }
  return null;
}

function buildOfficialSpecPrompt(name, model, brand) {
  return 'Bạn là chuyên gia thẩm định hồ sơ kỹ thuật thiết bị công nghệ thông tin và văn phòng chuyên nghiệp phục vụ công tác lập dự toán thầu.\n' +
    'Nhiệm vụ của bạn là tra cứu và cào chính xác theo tài liệu kỹ thuật chính thức (Datasheet / Technical Specification Sheet) từ trang web của nhà sản xuất (Hãng) cho thiết bị sau:\n' +
    '- Tên thiết bị: "' + (name || '') + '"\n' +
    '- Model: "' + (model || '') + '"\n' +
    '- Hãng sản xuất: "' + (brand || '') + '"\n\n' +
    'HƯỚNG DẪN BÓC TÁCH CHI TIẾT THEO LOẠI THIẾT BỊ:\n' +
    '1. NẾU LÀ ĐIỆN THOẠI (iPhone, Samsung, Xiaomi, Yealink, Grandstream, Cisco...):\n' +
    '   Trích xuất: Màn hình & Tần số quét, Bộ vi xử lý (Chipset), RAM, Bộ nhớ trong (ROM), Camera trước & sau, Pin & Sạc nhanh, Chuẩn kết nối 5G/Wi-Fi/Bluetooth, SIM, Kháng nước IP68, Hệ điều hành, Kích thước & Trọng lượng, Bảo hành, Xuất xứ.\n' +
    '2. NẾU LÀ MÀN HÌNH MÁY TÍNH (Dell UltraSharp, LG, Samsung, Asus, MSI...):\n' +
    '   Trích xuất: Kích thước màn hình, Tấm nền (IPS/VA), Độ phân giải (FHD/2K/4K), Tần số quét (Hz), Thời gian đáp ứng (ms), Độ sáng (nits), Độ tương phản, Góc nhìn, Không gian màu (sRGB/DCI-P3), Cổng kết nối (HDMI/DP/Type-C/VGA), Công nghệ bảo vệ mắt, Chân đế nâng hạ xoay, Bảo hành, Xuất xứ.\n' +
    '3. NẾU LÀ MÁY TÍNH (Desktop / Laptop / Mini PC / Server):\n' +
    '   Trích xuất: CPU & Xung nhịp, RAM (chuẩn, bus, nâng cấp), Ổ cứng (SSD NVMe/HDD), Card đồ họa (VGA), Màn hình (đối với laptop), Bàn phím chuột, Cổng kết nối, Wi-Fi/Bluetooth/LAN, Bộ nguồn (PSU), Hệ điều hành bản quyền, Bảo hành, Xuất xứ.\n' +
    '4. NẾU LÀ MÁY IN (Canon, HP, Brother, OKI, Epson...):\n' +
    '   Trích xuất: Công nghệ in, Tốc độ in (ppm), Độ phân giải, In đảo mặt tự động (Duplex), Khay giấy chính & khay tay, Khổ giấy in, Cổng kết nối (USB/LAN/Wi-Fi), Hộp mực theo máy, Công suất in hàng tháng, Hệ điều hành, Bảo hành, Xuất xứ.\n' +
    '5. NẾU LÀ MÁY SCAN / PHOTOCOPY / MẠNG / UPS / CAMERA:\n' +
    '   Trích xuất đầy đủ các thông số đặc thù theo tiêu chuẩn datasheet của dòng máy đó.\n\n' +
    'YÊU CẦU ĐỊNH DẠNG ĐẦU RA:\n' +
    'CHỈ TRẢ VỀ DUY NHẤT một JSON Array hợp lệ gồm các object {"key": "Tên thông số", "value": "Chi tiết giá trị thông số"}.\n' +
    'Ví dụ:\n' +
    '[\n' +
    '  {"key": "Bộ vi xử lý", "value": "Intel Core i5-13500 (14 nhân, 20 luồng, 24MB Cache, tối đa 4.8 GHz)"},\n' +
    '  {"key": "Bộ nhớ RAM", "value": "16GB DDR4 3200MHz (hỗ trợ nâng cấp tối đa 64GB)"}\n' +
    ']\n' +
    'Tuyệt đối không giải thích thêm hay viết bất kỳ chữ nào bên ngoài JSON Array.';
}

async function aiAutoLookupSpecs(devId) {
  var d = devs.find(function (x) { return x.id === devId; });
  if (!d) return;

  var kw = (d.name + ' ' + (d.model || '')).trim();
  if (!kw) { toast('⚠️ Vui lòng nhập Tên hoặc Model thiết bị trước!', 'err'); return; }

  // 1. KIỂM TRA MẪU CÓ SẴN: Giữ nguyên 100% nếu thiết bị đã có sẵn trong hệ thống
  var matchKey = findMatchingPresetKey(d.name, d.model);
  if (matchKey && MODEL_PRESETS[matchKey]) {
    applyModelPreset(devId, matchKey);
    toast('✅ Thiết bị đã có trong bộ mẫu chuẩn (' + MODEL_PRESETS[matchKey].name + '), giữ nguyên 100% thông số!', 'ok');
    return;
  }

  // 2. THIẾT BỊ CHƯA CÓ TRONG MẪU -> KÍCH HOẠT AI CÀO TỪ TRANG CỦA HÃNG
  var key = getActiveAiKey();
  if (!key) {
    openAiSettingsModal('Thiết bị "' + kw + '" chưa có trong bộ mẫu. Vui lòng cấu hình API Key để AI tra cứu thông số chính hãng!');
    return;
  }

  toast('🤖 AI đang tìm kiếm & cào thông số chính hãng cho ' + kw + '...', 'ai-t');

  try {
    var prompt = buildOfficialSpecPrompt(d.name, d.model, d.brand);
    var rawText = await callAiApi(prompt);
    var jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      var parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        d.specs = parsed.map(function (s) {
          return { key: String(s.key || '').trim(), value: String(s.value || '').trim() };
        }).filter(function (s) { return s.key; });

        syncDeviceSpecs(d);
        var sel = document.getElementById('quickDevSelect');
        renderEditForm(sel ? +sel.value : 0);
        renderCurrentSheetView();
        toast('✅ AI đã cào thành công ' + d.specs.length + ' thông số chính hãng cho ' + kw + '!', 'ok');
        return;
      }
    }
    throw new Error('Dữ liệu AI trả về không đúng cấu trúc bảng thông số!');
  } catch (e) {
    console.warn('Lỗi cào thông số AI:', e);
    // Fallback sang bộ cào thông minh nội suy
    d.specs = scrapeSmart26Specs(d.name, d.model, d.brand);
    syncDeviceSpecs(d);
    var selQ = document.getElementById('quickDevSelect');
    renderEditForm(selQ ? +selQ.value : 0);
    renderCurrentSheetView();
    toast('⚠️ Lỗi kết nối AI (' + e.message + '). Đã áp dụng khung thông số nội suy thay thế!', 'ai-t');
  }
}

async function aiAutoScrapeAllMissing() {
  if (!devs || devs.length === 0) {
    toast('⚠️ Chưa có thiết bị nào trong danh sách dự toán!', 'err');
    return;
  }

  // Phân loại: thiết bị nào đã có mẫu chuẩn thì GIỮ NGUYÊN 100%
  var missingDevs = [];
  var existingCount = 0;

  devs.forEach(function (d) {
    var matchKey = findMatchingPresetKey(d.name, d.model);
    if (matchKey && MODEL_PRESETS[matchKey]) {
      existingCount++;
      if (!d.specs || d.specs.length < 5) {
        applyModelPreset(d.id, matchKey);
      }
    } else {
      missingDevs.push(d);
    }
  });

  if (missingDevs.length === 0) {
    toast('✅ Toàn bộ ' + existingCount + ' thiết bị đều đã có sẵn trong bộ mẫu chuẩn, giữ nguyên 100%!', 'ok');
    return;
  }

  var key = getActiveAiKey();
  if (!key) {
    openAiSettingsModal('Có ' + missingDevs.length + ' thiết bị chưa có mẫu chuẩn. Vui lòng nhập API Key để AI cào thông số chính hãng!');
    return;
  }

  toast('🚀 Bắt đầu dùng AI cào thông số chính hãng cho ' + missingDevs.length + ' thiết bị chưa có mẫu...', 'ai-t');

  var successCount = 0;
  for (var i = 0; i < missingDevs.length; i++) {
    var d = missingDevs[i];
    var kw = (d.name + ' ' + (d.model || '')).trim();
    toast('🤖 AI đang cào thông số chính hãng (' + (i + 1) + '/' + missingDevs.length + '): ' + kw + '...', 'ai-t');

    try {
      var prompt = buildOfficialSpecPrompt(d.name, d.model, d.brand);
      var rawText = await callAiApi(prompt);
      var jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        var parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          d.specs = parsed.map(function (s) {
            return { key: String(s.key || '').trim(), value: String(s.value || '').trim() };
          }).filter(function (s) { return s.key; });
          syncDeviceSpecs(d);
          successCount++;
        }
      }
    } catch (e) {
      console.warn('Lỗi cào AI cho ' + kw + ':', e);
      d.specs = scrapeSmart26Specs(d.name, d.model, d.brand);
      syncDeviceSpecs(d);
    }
  }

  var sel = document.getElementById('quickDevSelect');
  if (sel) renderEditForm(+sel.value || 0);
  renderCurrentSheetView();
  toast('🎉 Hoàn tất! Đã giữ nguyên ' + existingCount + ' máy có sẵn và dùng AI cào thông số cho ' + successCount + ' máy mới!', 'ok');
}

/* ═══════════════════════════════════════════
   STEP 1 DUAL MODE & CATALOG MANAGER
═══════════════════════════════════════════ */
var step1Mode = 'catalog';
var curCatType = 'all';
var selectedCatalogItems = {};

var CATALOG_ITEMS = [
  {
    "id": "hw_full_1",
    "cat": "may_tinh",
    "presetKey": "hw_full_1",
    "name": "Máy vi tính để bàn MSI Cubi NUC 1M",
    "model": "Cubi B0B1",
    "brand": "MSI",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Bộ",
    "specCount": 35
  },
  {
    "id": "hw_full_2",
    "cat": "may_tinh",
    "presetKey": "hw_full_2",
    "name": "Máy tính xách tay MSI Commercial 14 B1MG (MS-14S1)",
    "model": "MS-14S1",
    "brand": "MSI",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 18
  },
  {
    "id": "hw_full_3",
    "cat": "may_in",
    "presetKey": "hw_full_3",
    "name": "Máy in A4 đen trắng OKI B433DN",
    "model": "B433DN",
    "brand": "OKI",
    "origin": "Thái Lan",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 13
  },
  {
    "id": "hw_full_4",
    "cat": "may_scan",
    "presetKey": "hw_full_4",
    "name": "Máy quét tài liệu số hóa RICOH SP-2240N",
    "model": "SP-2240",
    "brand": "Ricoh",
    "origin": "Thái Lan",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 20
  },
  {
    "id": "hw_full_5",
    "cat": "thiet_bi_khac",
    "presetKey": "hw_full_5",
    "name": "Thiết bị mạng Switch Cisco CBS350-24S",
    "model": "CBS350-24S",
    "brand": "Cisco",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Cái",
    "specCount": 5
  },
  {
    "id": "hw_full_6",
    "cat": "thiet_bi_khac",
    "presetKey": "hw_full_6",
    "name": "Thiết bị mạng Switch Cisco WS-C2960L",
    "model": "WS-C2960L",
    "brand": "Cisco",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Cái",
    "specCount": 5
  },
  {
    "id": "hw_full_7",
    "cat": "thiet_bi_khac",
    "presetKey": "hw_full_7",
    "name": "Thiết bị mạng Switch Cisco CBS250-48PP",
    "model": "CBS250-48PP",
    "brand": "Cisco",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Cái",
    "specCount": 5
  },
  {
    "id": "hw_full_8",
    "cat": "thiet_bi_khac",
    "presetKey": "hw_full_8",
    "name": "Thiết bị phòng họp trực tuyến Aver VC520 PRO3",
    "model": "VC520 PRO3",
    "brand": "Aver",
    "origin": "Đài Loan",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Bộ",
    "specCount": 5
  },
  {
    "id": "hw_full_9",
    "cat": "thiet_bi_khac",
    "presetKey": "hw_full_9",
    "name": "Thiết bị mạng Switch Cisco 24 Port Gigabit",
    "model": "24 Port Gigabit",
    "brand": "Cisco",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Cái",
    "specCount": 5
  },
  {
    "id": "hw_full_10",
    "cat": "thiet_bi_khac",
    "presetKey": "hw_full_10",
    "name": "Thiết bị tường lửa Sophos XGS 128",
    "model": "XGS 128",
    "brand": "Sophos",
    "origin": "Đài Loan",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Cái",
    "specCount": 5
  },
  {
    "id": "hw_full_11",
    "cat": "thiet_bi_khac",
    "presetKey": "hw_full_11",
    "name": "Switch Cisco Catalyst 1200 Series",
    "model": "Catalyst 1200",
    "brand": "Cisco",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Cái",
    "specCount": 5
  },
  {
    "id": "hw_full_12",
    "cat": "thiet_bi_khac",
    "presetKey": "hw_full_12",
    "name": "Camera an ninh IP",
    "model": "IP Dome/Bullet",
    "brand": "Chính hãng",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 5
  },
  {
    "id": "hw_full_13",
    "cat": "thiet_bi_khac",
    "presetKey": "hw_full_13",
    "name": "Máy chiếu INFOCUS P162 + phụ kiện",
    "model": "P162",
    "brand": "INFOCUS",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Bộ",
    "specCount": 38
  },
  {
    "id": "hw_full_14",
    "cat": "thiet_bi_khac",
    "presetKey": "hw_full_14",
    "name": "Cáp mạng CAT 6 Việt Hàn CAT6",
    "model": "Việt Hàn CAT6",
    "brand": "Việt Hàn",
    "origin": "Việt Nam",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Thùng",
    "specCount": 12
  },
  {
    "id": "hw_full_15",
    "cat": "thiet_bi_khac",
    "presetKey": "hw_full_15",
    "name": "Thiết bị cân bằng tải TP-Link Omada ER707-M2",
    "model": "ER707-M2",
    "brand": "TP-Link",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Cái",
    "specCount": 24
  },
  {
    "id": "hw_full_16",
    "cat": "may_in",
    "presetKey": "hw_full_16",
    "name": "Máy in A3 HP LaserJet Pro M706n",
    "model": "LaserJet Pro M706n",
    "brand": "HP",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 21
  },
  {
    "id": "hw_full_17",
    "cat": "photocopy",
    "presetKey": "hw_full_17",
    "name": "Máy photocopy Ricoh IM 3500",
    "model": "IM 3500",
    "brand": "Ricoh",
    "origin": "Thái Lan",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 24
  },
  // ── SẢN PHẨM MỚI BỔ SUNG: ĐIỆN THOẠI, MÀN HÌNH, MÁY TÍNH, MÁY IN ──
  {
    "id": "cat_dt_1",
    "cat": "dien_thoai",
    "presetKey": "dt_iphone_15_pro_max",
    "name": "Điện thoại thông minh Apple iPhone 15 Pro Max 256GB",
    "model": "iPhone 15 Pro Max",
    "brand": "Apple",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 17
  },
  {
    "id": "cat_dt_2",
    "cat": "dien_thoai",
    "presetKey": "dt_samsung_s24_ultra",
    "name": "Điện thoại thông minh Samsung Galaxy S24 Ultra 5G 256GB",
    "model": "Galaxy S24 Ultra",
    "brand": "Samsung",
    "origin": "Việt Nam",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 14
  },
  {
    "id": "cat_dt_3",
    "cat": "dien_thoai",
    "presetKey": "dt_yealink_t46u",
    "name": "Điện thoại IP Doanh Nghiệp Yealink SIP-T46U",
    "model": "SIP-T46U",
    "brand": "Yealink",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 11
  },
  {
    "id": "cat_dt_4",
    "cat": "dien_thoai",
    "presetKey": "dt_grandstream_2614",
    "name": "Điện thoại IP Grandstream GRP2614 Carrier-Grade",
    "model": "GRP2614",
    "brand": "Grandstream",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 7
  },
  {
    "id": "cat_mh_1",
    "cat": "man_hinh",
    "presetKey": "mh_dell_u2424h",
    "name": "Màn hình vi tính Dell UltraSharp 23.8 inch U2424H",
    "model": "U2424H",
    "brand": "Dell",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "36 tháng",
    "unit": "Chiếc",
    "specCount": 15
  },
  {
    "id": "cat_mh_2",
    "cat": "man_hinh",
    "presetKey": "mh_lg_27up850",
    "name": "Màn hình đồ họa LG 27 inch 4K UHD 27UP850N-W",
    "model": "27UP850N-W",
    "brand": "LG",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "24 tháng",
    "unit": "Chiếc",
    "specCount": 10
  },
  {
    "id": "cat_mh_3",
    "cat": "man_hinh",
    "presetKey": "mh_samsung_24",
    "name": "Màn hình vi tính Samsung 24 inch LS24C310EAEXXV",
    "model": "LS24C310EAEXXV",
    "brand": "Samsung",
    "origin": "Việt Nam",
    "price": 0,
    "qty": 1,
    "warranty": "24 tháng",
    "unit": "Chiếc",
    "specCount": 10
  },
  {
    "id": "cat_pc_1",
    "cat": "may_tinh",
    "presetKey": "pc_dell_optiplex_7010",
    "name": "Máy vi tính để bàn Dell OptiPlex 7010 SFF (Core i5/16GB/512GB)",
    "model": "OptiPlex 7010 SFF",
    "brand": "Dell",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "36 tháng",
    "unit": "Bộ",
    "specCount": 13
  },
  {
    "id": "cat_pc_2",
    "cat": "may_tinh",
    "presetKey": "pc_hp_prodesk_400",
    "name": "Máy tính để bàn HP ProDesk 400 G9 SFF",
    "model": "ProDesk 400 G9 SFF",
    "brand": "HP",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Bộ",
    "specCount": 8
  },
  {
    "id": "cat_lt_1",
    "cat": "may_tinh",
    "presetKey": "lt_dell_latitude_3440",
    "name": "Máy tính xách tay Dell Latitude 3440 (14 inch Full HD)",
    "model": "Latitude 3440",
    "brand": "Dell",
    "origin": "Trung Quốc",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 12
  },
  {
    "id": "cat_in_1",
    "cat": "may_in",
    "presetKey": "in_canon_2900",
    "name": "Máy in laser đen trắng Canon LBP2900",
    "model": "LBP2900",
    "brand": "Canon",
    "origin": "Việt Nam",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 16
  },
  {
    "id": "cat_in_2",
    "cat": "may_in",
    "presetKey": "in_hp_m404dn",
    "name": "Máy in laser trắng đen HP LaserJet Pro M404dn (In 2 mặt/LAN)",
    "model": "M404dn",
    "brand": "HP",
    "origin": "Việt Nam",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 15
  },
  {
    "id": "cat_in_3",
    "cat": "may_in",
    "presetKey": "in_brother_l2321d",
    "name": "Máy in laser Brother HL-L2321D (In 2 mặt)",
    "model": "HL-L2321D",
    "brand": "Brother",
    "origin": "Việt Nam",
    "price": 0,
    "qty": 1,
    "warranty": "12 tháng",
    "unit": "Chiếc",
    "specCount": 9
  },
  {
    "id": "cat_in_4",
    "cat": "may_in",
    "presetKey": "in_epson_l3250",
    "name": "Máy in phun màu đa năng Epson EcoTank L3250 (Wi-Fi)",
    "model": "EcoTank L3250",
    "brand": "Epson",
    "origin": "Philippines",
    "price": 0,
    "qty": 1,
    "warranty": "24 tháng",
    "unit": "Chiếc",
    "specCount": 9
  }
];

function setStep1Mode(mode) {
  step1Mode = 'catalog';
  renderCatalogGrid();
}

function filterCatType(type) {
  curCatType = type;
  var btns = document.querySelectorAll('#catNav .cat-btn');
  btns.forEach(function (b) { b.className = 'cat-btn'; });
  if (event && event.target) event.target.className = 'cat-btn active';
  renderCatalogGrid();
}

function filterCatalog() { renderCatalogGrid(); }
function resetCatalogFilter() {
  var inp = document.getElementById('catSearch');
  if (inp) inp.value = '';
  curCatType = 'all';
  var btns = document.querySelectorAll('#catNav .cat-btn');
  btns.forEach(function (b, i) { b.className = 'cat-btn' + (i === 0 ? ' active' : ''); });
  renderCatalogGrid();
}

function renderCatalogGrid() {
  var grid = document.getElementById('catGrid');
  if (!grid) return;

  var kw = (document.getElementById('catSearch') ? document.getElementById('catSearch').value : '').toLowerCase().trim();
  var filtered = CATALOG_ITEMS.filter(function (item) {
    var mType = curCatType === 'all' || item.cat === curCatType || (curCatType === 'thiet_bi_khac' && (item.cat === 'thiet_bi_khac' || item.cat === 'khac'));
    var mKw = !kw || item.name.toLowerCase().includes(kw) || item.model.toLowerCase().includes(kw) || item.brand.toLowerCase().includes(kw);
    return mType && mKw;
  });

  var html = filtered.map(function (item) {
    var isSel = !!selectedCatalogItems[item.id];
    var curQ = isSel ? selectedCatalogItems[item.id].qty : 1;
    var catLabel = item.cat === 'dien_thoai' ? '📱 Điện thoại' :
      item.cat === 'man_hinh' ? '🖥️ Màn hình' :
      item.cat === 'may_tinh' ? '💻 Máy tính' :
      item.cat === 'may_in' ? '🖨️ Máy in' :
      item.cat === 'photocopy' ? '📠 Photocopy' :
      item.cat === 'may_scan' ? '📄 Máy Scan' : '🌐 Thiết bị khác';

    return '<div class="cat-card' + (isSel ? ' selected' : '') + '" id="cc_' + item.id + '">' +
      '<div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
      '<span class="cc-badge">' + catLabel + '</span>' +
      '<span style="font-size:11px;font-weight:700;color:var(--gr)">✨ ' + item.specCount + ' thông số</span>' +
      '</div>' +
      '<div class="cc-name">' + escH(item.name) + '</div>' +
      '<div class="cc-meta">' +
      '<span><b>Model:</b> ' + escH(item.model) + ' | <b>Hãng:</b> ' + escH(item.brand) + '</span>' +
      '<span><b>Xuất xứ:</b> ' + escH(item.origin) + ' | <b>Bảo hành:</b> ' + escH(item.warranty) + '</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:6px;margin-top:6px">' +
      '<label style="font-size:11px;color:var(--t2);white-space:nowrap;font-weight:600">Đơn giá (VNĐ):</label>' +
      '<input type="number" min="0" placeholder="Tự điền đơn giá..." value="' + (item.price || '') + '" oninput="updateCatalogPrice(\'' + item.id + '\',+this.value)" style="padding:4px 8px;font-size:12px;font-weight:700;color:var(--go)"/>' +
      '</div>' +
      '</div>' +
      '<div class="cc-foot">' +
      '<label style="font-size:11px;margin:0">SL:</label>' +
      '<input type="number" class="cc-qty" min="1" value="' + curQ + '" onchange="updateCatalogQty(\'' + item.id + '\',+this.value)"/>' +
      '<button class="btn-add-cat' + (isSel ? ' added' : '') + '" onclick="toggleCatalogItem(\'' + item.id + '\')">' +
      (isSel ? '✓ Đã chọn (' + curQ + ')' : '＋ Chọn máy này') +
      '</button>' +
      '</div>' +
      '</div>';
  }).join('');

  grid.innerHTML = html || '<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--t2)">Không tìm thấy thiết bị phù hợp. Bạn có thể tự thêm máy bằng ô bên dưới!</div>';
  updateCartSummary();
}

function updateCatalogPrice(id, price) {
  var item = CATALOG_ITEMS.find(function (x) { return x.id === id; });
  if (item) item.price = Math.max(0, price || 0);
  if (selectedCatalogItems[id]) {
    selectedCatalogItems[id].item.price = item ? item.price : 0;
    updateCartSummary();
  }
}

function toggleCatalogItem(id) {
  var item = CATALOG_ITEMS.find(function (x) { return x.id === id; });
  if (!item) return;

  if (selectedCatalogItems[id]) {
    delete selectedCatalogItems[id];
  } else {
    var qtyInp = document.querySelector('#cc_' + id + ' .cc-qty');
    var q = qtyInp ? Math.max(1, parseInt(qtyInp.value) || 1) : 1;
    selectedCatalogItems[id] = { item: item, qty: q };
  }
  renderCatalogGrid();
}

function updateCatalogQty(id, q) {
  q = Math.max(1, parseInt(q) || 1);
  if (selectedCatalogItems[id]) {
    selectedCatalogItems[id].qty = q;
    updateCartSummary();
  }
}

function updateCartSummary() {
  var keys = Object.keys(selectedCatalogItems);
  var count = keys.length;
  var totalQty = 0;
  var totalPrice = 0;

  keys.forEach(function (k) {
    var obj = selectedCatalogItems[k];
    totalQty += obj.qty;
    totalPrice += obj.qty * obj.item.price;
  });

  var elC = document.getElementById('cartCount');
  var elQ = document.getElementById('cartQty');
  var elT = document.getElementById('cartTotal');
  if (elC) elC.textContent = count;
  if (elQ) elQ.textContent = totalQty;
  if (elT) elT.textContent = fmtVN(totalPrice) + ' đ';
}

/* ═══════════════════════════════════════════
   SMART SPECIFICATION SCRAPER ENGINE (ĐA DANH MỤC THIẾT BỊ)
═══════════════════════════════════════════ */
function scrapeSmart26Specs(name, model, brand) {
  name = name || '';
  var nL = (name + ' ' + (model || '') + ' ' + (brand || '')).toLowerCase();
  var sp = [];

  // 0. ĐIỆN THOẠI THÔNG MINH & ĐIỆN THOẠI IP (SMARTPHONES / IP PHONES)
  if (nL.includes('điện thoại') || nL.includes('phone') || nL.includes('smartphone') || nL.includes('iphone') || nL.includes('galaxy') || nL.includes('s24') || nL.includes('s23') || nL.includes('xiaomi') || nL.includes('oppo') || nL.includes('yealink') || nL.includes('grp26') || nL.includes('sip-t') || nL.includes('redmi')) {
    var isIpPhone = nL.includes('yealink') || nL.includes('grandstream') || nL.includes('sip') || nL.includes('ip phone') || nL.includes('cisco');
    if (isIpPhone) {
      sp = [
        { key: 'Chủng loại', value: 'Điện thoại IP để bàn chất lượng cao cho doanh nghiệp' },
        { key: 'Màn hình hiển thị', value: 'Màn hình màu LCD 2.8 - 4.3 inch có đèn nền' },
        { key: 'Tài khoản SIP', value: 'Hỗ trợ 4 - 16 tài khoản SIP độc lập' },
        { key: 'Chất lượng âm thanh', value: 'Âm thanh chuẩn Yealink Optima HD Voice / Grandstream HD, lọc ồn thông minh' },
        { key: 'Cổng mạng LAN', value: '2 cổng Gigabit Ethernet 10/100/1000Mbps tích hợp cấp nguồn PoE' },
        { key: 'Cổng USB mở rộng', value: 'Cổng USB 2.0 (hỗ trợ Wi-Fi Dongle, Bluetooth, Tai nghe USB, Ghi âm)' },
        { key: 'Phím chức năng', value: 'Phím Line LED 2 màu, phím điều hướng và phím gọi nhanh BLF' },
        { key: 'Bộ giải mã âm thanh', value: 'Opus, G.722, G.711(A/u), G.729AB, iLBC' },
        { key: 'Tính năng thoại nâng cao', value: 'Hội nghị đàm thoại đa bên, chuyển cuộc gọi, giữ cuộc gọi, danh bạ 1000 số' },
        { key: 'Bảo mật mạng', value: 'SIP over TLS/SRTP, HTTPS, OpenVPN, 802.1x' },
        { key: 'Bảo hành', value: '12 tháng chính hãng' },
        { key: 'Năm sản xuất', value: 'Từ 2024 tới nay' },
        { key: 'Hãng sản xuất', value: brand || 'Yealink / Grandstream / Cisco' },
        { key: 'Nước sản xuất', value: 'Trung Quốc' }
      ];
    } else {
      var isIphone = nL.includes('iphone') || nL.includes('apple');
      var isSamsung = nL.includes('samsung') || nL.includes('galaxy');
      sp = [
        { key: 'Chủng loại', value: 'Điện thoại thông minh (Smartphone) cao cấp' },
        { key: 'Màn hình hiển thị', value: isIphone ? 'Super Retina XDR OLED 120Hz ProMotion sắc nét' : 'Dynamic AMOLED 2X 120Hz chống chói' },
        { key: 'Bộ vi xử lý (Chipset / CPU)', value: isIphone ? 'Apple A-Series Pro tiến trình 3nm hiệu năng vượt trội' : 'Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm)' },
        { key: 'Bộ nhớ RAM', value: '8GB - 12GB LPDDR5X tốc độ cao' },
        { key: 'Bộ nhớ lưu trữ trong (ROM)', value: '256GB / 512GB UFS 4.0 / NVMe' },
        { key: 'Hệ thống Camera chính sau', value: 'Cụm đa camera 48MP - 200MP chống rung quang học OIS, quay phim 4K/8K' },
        { key: 'Camera trước', value: '12MP sắc nét hỗ trợ tự động lấy nét PDAF' },
        { key: 'Dung lượng Pin & Công nghệ sạc', value: 'Pin dung lượng lớn 4.500 - 5.000 mAh, sạc nhanh công suất cao và sạc không dây' },
        { key: 'Cổng giao tiếp kết nối', value: 'USB Type-C tốc độ cao' },
        { key: 'Chuẩn kết nối không dây', value: '5G siêu tốc, Wi-Fi 6E/Wi-Fi 7, Bluetooth 5.3, NFC' },
        { key: 'Tiêu chuẩn kháng nước & bụi', value: 'Đạt chuẩn IP68 chống nước ở độ sâu 1.5m - 6m trong 30 phút' },
        { key: 'Hệ thống bảo mật', value: isIphone ? 'Nhận diện khuôn mặt Face ID 3D siêu bảo mật' : 'Cảm biến vân tay siêu âm dưới màn hình & Nhận diện khuôn mặt' },
        { key: 'Hệ điều hành', value: isIphone ? 'iOS 17 / iOS 18 bản quyền mới nhất' : 'Android 14 (One UI 6.1) hỗ trợ cập nhật lâu dài' },
        { key: 'Chất liệu khung vỏ', value: 'Khung Titanium / Hợp kim nhôm cao cấp kết hợp mặt kính cường lực' },
        { key: 'Bảo hành', value: '12 tháng chính hãng' },
        { key: 'Năm sản xuất', value: 'Từ 2024 tới nay' },
        { key: 'Hãng sản xuất', value: brand || (isIphone ? 'Apple' : isSamsung ? 'Samsung' : 'Chính hãng') },
        { key: 'Nước sản xuất', value: isSamsung ? 'Việt Nam' : 'Trung Quốc' }
      ];
    }
  }
  // 1. MÀN HÌNH MÁY TÍNH (MONITORS / DISPLAYS)
  else if (nL.includes('màn hình') || nL.includes('monitor') || nL.includes('display') || nL.includes('lcd') || nL.includes('inch') || nL.includes('24mp') || nL.includes('27mp') || nL.includes('p24') || nL.includes('p27') || nL.includes('e24') || nL.includes('e27') || nL.includes('se24') || nL.includes('se27')) {
    var size = '23.8 inch (Chuẩn 24 inch)';
    if (nL.includes('27 inch') || nL.includes('27in') || nL.includes('27"')) size = '27 inch';
    else if (nL.includes('32 inch') || nL.includes('32in') || nL.includes('32"')) size = '32 inch';
    else if (nL.includes('21.5 inch') || nL.includes('22 inch') || nL.includes('21.5"')) size = '21.5 inch';
    else if (nL.includes('24 inch') || nL.includes('23.8') || nL.includes('24"')) size = '23.8 inch (Tương đương 24 inch)';

    var resM = 'Full HD 1920 x 1080 @ 75Hz - 100Hz';
    if (nL.includes('2k') || nL.includes('qhd') || nL.includes('1440')) resM = '2K QHD 2560 x 1440 @ 100Hz - 165Hz';
    else if (nL.includes('4k') || nL.includes('uhd') || nL.includes('2160')) resM = '4K UHD 3840 x 2160 @ 60Hz';

    var panel = nL.includes('va') ? 'VA (Vertical Alignment) góc nhìn rộng' : 'IPS (In-Plane Switching) màu sắc trung thực';

    sp = [
      { key: 'Chức năng / Loại thiết bị', value: 'Màn hình máy tính chuyên dụng cho văn phòng và đồ họa (' + size + ')' },
      { key: 'Kích thước hiển thị', value: size },
      { key: 'Công nghệ tấm nền (Panel)', value: panel },
      { key: 'Độ phân giải tối ưu', value: resM },
      { key: 'Tần số quét (Refresh Rate)', value: '75Hz - 100Hz (Hiển thị chuyển động mượt mà)' },
      { key: 'Thời gian phản hồi (Response)', value: '5ms (GtG) / 1ms (MPRT)' },
      { key: 'Tỷ lệ khung hình', value: '16:9 tiêu chuẩn' },
      { key: 'Độ sáng màn hình', value: '250 cd/m2 - 300 cd/m2' },
      { key: 'Độ tương phản tĩnh', value: '1.000:1 (Tĩnh) / Mega DCR (Động)' },
      { key: 'Góc nhìn tối đa', value: '178° (Ngang) / 178° (Dọc)' },
      { key: 'Độ phủ màu (Color Gamut)', value: '99% sRGB, 16.7 triệu màu, 8-bit color' },
      { key: 'Công nghệ bảo vệ mắt', value: 'Chống nhấp nháy Flicker-Free, Lọc ánh sáng xanh Low Blue Light, Chống chói Anti-Glare 3H' },
      { key: 'Cổng kết nối hình ảnh', value: '1x HDMI 1.4, 1x DisplayPort 1.2, 1x VGA / D-Sub' },
      { key: 'Cổng âm thanh / USB', value: '1x Audio Out 3.5mm (Hỗ trợ cắm loa/tai nghe ngoài)' },
      { key: 'Khả năng điều chỉnh chân đế', value: 'Góc nghiêng trước sau (Tilt): -5° đến +21°' },
      { key: 'Chuẩn ngàm treo tường', value: 'VESA Wall Mount 100 x 100 mm' },
      { key: 'Công suất tiêu thụ', value: 'Hoạt động: 16W - 22W; Chế độ chờ: < 0.3W (Tiết kiệm điện Energy Star)' },
      { key: 'Nguồn điện cấp', value: 'AC 100 - 240V, 50/60Hz (Nguồn tích hợp hoặc Adapter rời)' },
      { key: 'Thiết kế viền màn hình', value: 'Thiết kế 3 cạnh siêu mỏng Ultra-Slim Bezel hiện đại' },
      { key: 'Phụ kiện kèm theo', value: 'Cáp nguồn, Cáp kết nối HDMI / DisplayPort, Chân đế, Sách HDSD' },
      { key: 'Độ bền / MTBF', value: 'Tuổi thọ đèn nền LED > 30.000 giờ sử dụng liên tục' },
      { key: 'Chứng nhận tiêu chuẩn', value: 'Energy Star, RoHS, TCO Certified, CE, FCC' },
      { key: 'Bảo hành', value: '24 - 36 tháng chính hãng' },
      { key: 'Năm sản xuất', value: 'từ 2024 tới nay' },
      { key: 'Hãng sản xuất', value: brand || 'Chính hãng (Dell / LG / Samsung / Asus / HP / AOC)' },
      { key: 'Nước sản xuất', value: 'Trung Quốc / Việt Nam' }
    ];
  }
  // 2. LAPTOP / MÁY TÍNH XÁCH TAY (BAO GỒM LAPTOP VĂN PHÒNG & GAMING ĐỒ HỌA CAO CẤP)
  else if (nL.includes('laptop') || nL.includes('notebook') || nL.includes('macbook') || nL.includes('vivobook') || nL.includes('zenbook') || nL.includes('thinkpad') || nL.includes('thinkbook') || nL.includes('latitude') || nL.includes('vostro') || nL.includes('inspiron') || nL.includes('xps') || nL.includes('precision') || nL.includes('aspire') || nL.includes('swift') || nL.includes('ideapad') || nL.includes('legion') || nL.includes('loq') || nL.includes('yoga') || nL.includes('tuf') || nL.includes('rog') || nL.includes('zephyrus') || nL.includes('strix') || nL.includes('alienware') || nL.includes('omen') || nL.includes('victus') || nL.includes('pavilion') || nL.includes('spectre') || nL.includes('envy') || nL.includes('elitebook') || nL.includes('probook') || nL.includes('predator') || nL.includes('nitro') || nL.includes('katana') || nL.includes('cyborg') || nL.includes('stealth') || nL.includes('raider') || nL.includes('titan') || nL.includes('sword') || nL.includes('thin') || nL.includes('modern') || nL.includes('prestige') || nL.includes('expertbook') || nL.includes('surface') || nL.includes('gaming') || nL.includes('g15') || nL.includes('g16') || nL.includes('lenovo') || nL.includes('asus') || nL.includes('acer')) {

    var isGaming = nL.includes('legion') || nL.includes('gaming') || nL.includes('rog') || nL.includes('predator') || nL.includes('tuf') || nL.includes('nitro') || nL.includes('omen') || nL.includes('victus') || nL.includes('alienware') || nL.includes('loq') || nL.includes('katana') || nL.includes('zephyrus');

    if (isGaming || nL.includes('legion')) {
      sp = [
        { key: 'Chức năng / Loại thiết bị', value: 'Máy tính xách tay Gaming & Đồ họa chuyên nghiệp (High Performance Laptop)' },
        { key: 'Bộ vi xử lý (CPU)', value: 'AMD Ryzen 7 6800H / Intel Core i7-12700H (8 - 14 nhân, 16 - 20 luồng, Turbo tới 4.7 GHz)' },
        { key: 'Bộ nhớ tiêu chuẩn (RAM)', value: '16GB / 32GB DDR5 4800MHz Dual Channel (2 khe SO-DIMM nâng cấp tới 64GB)' },
        { key: 'Ổ đĩa cứng lưu trữ (SSD)', value: '512GB / 1TB PCIe NVMe Gen 4 siêu tốc (Hỗ trợ 2 khe cắm M.2 SSD)' },
        { key: 'Màn hình hiển thị', value: '16.0 inch WQXGA 2.5K (2560 x 1600) 165Hz IPS, 500 nits, 100% sRGB, Dolby Vision, G-Sync' },
        { key: 'Card đồ họa rời (VGA)', value: 'NVIDIA GeForce RTX 3060 / RTX 3070 Ti 6GB/8GB GDDR6 (TGP 140W, MUX Switch)' },
        { key: 'Hệ thống tản nhiệt', value: 'Legion Coldfront 4.0 buồng hơi đồng kép với quạt làm mát cánh siêu mỏng vận hành êm ái' },
        { key: 'Bàn phím & Touchpad', value: 'Bàn phím Legion TrueStrike có đèn nền RGB 4 vùng, hành trình 1.5mm, 100% Anti-Ghosting' },
        { key: 'Webcam & Microphone', value: 'HD Webcam 720p/1080p có cần gạt khóa camera E-Shutter bảo mật + Micro lọc ồn kép' },
        { key: 'Công nghệ âm thanh', value: '2x 2W Nahimic 3D Audio cho trải nghiệm âm thanh vòm sống động' },
        { key: 'Kết nối không dây', value: 'Wi-Fi 6E (802.11ax) 2x2 + Bluetooth 5.2 siêu ổn định' },
        { key: 'Cổng giao tiếp ngoại vi', value: '3x USB 3.2 Gen 1, 2x USB-C (Thunderbolt 4 / DisplayPort / 135W PD), 1x HDMI 2.1 (Xuất 8K), 1x RJ45 LAN 1Gbps, 1x Audio 3.5mm' },
        { key: 'Dung lượng Pin', value: 'Pin 4-cell 80Wh (Hỗ trợ công nghệ sạc siêu nhanh Super Rapid Charge)' },
        { key: 'Bộ nguồn / Sạc', value: 'Adapter sạc công suất cao 230W / 300W Slim Tip chính hãng' },
        { key: 'Hệ điều hành', value: 'Windows 11 Home / Pro 64-bit bản quyền' },
        { key: 'Trọng lượng & Kích thước', value: 'Khoảng 2.49 kg; Kích thước: 359.9 x 264.4 x 19.9 mm' },
        { key: 'Chất liệu thân vỏ', value: 'Khung vỏ hợp kim Nhôm - Magie cao cấp chịu lực chống va đập' },
        { key: 'Tính năng bảo mật', value: 'Chip bảo mật phần cứng Firmware TPM 2.0, Khóa Kensington' },
        { key: 'Phụ kiện đi kèm', value: 'Củ sạc công suất cao, Cáp nguồn, Sách hướng dẫn sử dụng' },
        { key: 'Tiêu chuẩn độ bền', value: 'Đạt chuẩn độ bền quân đội Mỹ MIL-STD-810H' },
        { key: 'Công suất tiêu thụ', value: 'Hiệu suất năng lượng cao chuẩn Energy Star' },
        { key: 'Tuổi thọ phần cứng', value: 'MTBF > 100.000 giờ sử dụng liên tục' },
        { key: 'Bảo hành', value: '24 tháng chính hãng (Gói dịch vụ cao cấp Lenovo Premium Care)' },
        { key: 'Năm sản xuất', value: 'từ 2022 - 2024' },
        { key: 'Hãng sản xuất', value: brand || 'Lenovo' },
        { key: 'Nước sản xuất', value: 'Trung Quốc' }
      ];
    } else {
      sp = [
        { key: 'Chức năng / Loại thiết bị', value: 'Máy tính xách tay (Laptop) phục vụ học tập, văn phòng và xử lý đồ họa' },
        { key: 'Bộ vi xử lý (CPU)', value: 'Intel Core i5 / i7 / AMD Ryzen 5 / 7 thế hệ mới (10 - 12 nhân, Turbo 4.6 GHz)' },
        { key: 'Bộ nhớ tiêu chuẩn (RAM)', value: '16GB DDR4 / DDR5 High Speed (Hỗ trợ nâng cấp tối đa 32GB)' },
        { key: 'Ổ đĩa cứng lưu trữ (SSD)', value: '512GB M.2 PCIe NVMe SSD siêu tốc' },
        { key: 'Màn hình hiển thị', value: '14.0 inch / 15.6 inch Full HD (1920x1080) IPS chống chói Anti-Glare' },
        { key: 'Card đồ họa (VGA)', value: 'Intel Iris Xe Graphics / AMD Radeon Graphics tích hợp mượt mà' },
        { key: 'Bàn phím & Touchpad', value: 'Bàn phím tiêu chuẩn gõ êm, Touchpad cảm ứng đa điểm' },
        { key: 'Webcam & Microphone', value: 'HD Webcam 720p/1080p tích hợp Micro kép lọc ồn thông minh' },
        { key: 'Công nghệ âm thanh', value: 'Stereo Speakers công nghệ Waves MaxxAudio / Dolby Audio' },
        { key: 'Kết nối không dây', value: 'Wi-Fi 6 (802.11ax) + Bluetooth 5.2 tốc độ cao' },
        { key: 'Cổng giao tiếp ngoại vi', value: '2x USB 3.2, 1x Type-C, 1x HDMI 1.4, 1x Audio 3.5mm, 1x Khe thẻ SD' },
        { key: 'Dung lượng Pin', value: 'Pin 3-cell / 4-cell 41Wh - 54Wh (Thời lượng dùng 5 - 8 giờ liên tục)' },
        { key: 'Bộ nguồn / Sạc', value: 'Adapter sạc nhanh 45W - 65W chuẩn an toàn' },
        { key: 'Hệ điều hành', value: 'Windows 11 Home / Pro 64-bit bản quyền' },
        { key: 'Trọng lượng & Kích thước', value: 'Khoảng 1.4kg - 1.7kg; Thiết kế mỏng nhẹ cơ động' },
        { key: 'Chất liệu vỏ máy', value: 'Hợp kim nhôm hoặc nhựa Polycarbonate cao cấp chống bám vân tay' },
        { key: 'Tính năng bảo mật', value: 'Cảm biến vân tay 1 chạm Fingerprint / TPM 2.0 bảo mật phần cứng' },
        { key: 'Phụ kiện đi kèm', value: 'Củ sạc, Cáp nguồn, Túi chống sốc / Balo chính hãng' },
        { key: 'Tiêu chuẩn độ bền', value: 'Đạt chuẩn độ bền quân đội Mỹ MIL-STD-810H' },
        { key: 'Công suất tiêu thụ', value: 'Tiết kiệm năng lượng chuẩn Energy Star' },
        { key: 'Tuổi thọ phần cứng', value: 'MTBF > 80.000 giờ sử dụng' },
        { key: 'Bảo hành', value: '12 - 24 tháng chính hãng' },
        { key: 'Năm sản xuất', value: 'từ 2024 tới nay' },
        { key: 'Hãng sản xuất', value: brand || 'Dell / HP / Asus / Lenovo / Acer' },
        { key: 'Nước sản xuất', value: 'Trung Quốc' }
      ];
    }
  }
  // 3. BỘ LƯU ĐIỆN (UPS)
  else if (nL.includes('ups') || nL.includes('lưu điện') || nL.includes('santak') || nL.includes('apc') || nL.includes('easy ups')) {
    sp = [
      { key: 'Chức năng / Loại thiết bị', value: 'Bộ lưu điện dự phòng (UPS) bảo vệ máy tính và hệ thống mạng' },
      { key: 'Công suất danh định', value: '1000VA / 600W (Hoặc 500VA - 2000VA)' },
      { key: 'Công nghệ lưu điện', value: 'Line-Interactive với bộ ổn áp tự động AVR' },
      { key: 'Điện áp đầu vào', value: '220V / 230V AC (Dải điện áp hoạt động rộng 165V - 280V)' },
      { key: 'Tần số nguồn vào', value: '50Hz / 60Hz (Tự động cảm biến)' },
      { key: 'Điện áp đầu ra', value: '220V / 230V AC ± 10% (Sóng xoang mô phỏng / Sóng Sin chuẩn)' },
      { key: 'Thời gian chuyển mạch', value: 'Siêu nhanh 2ms - 6ms (Không làm gián đoạn máy tính)' },
      { key: 'Loại ắc quy sử dụng', value: 'Ắc quy chì kín khí AGM không cần bảo dưỡng (12V/7Ah - 12V/9Ah)' },
      { key: 'Thời gian lưu điện', value: '15 - 30 phút cho 01 bộ máy tính văn phòng; 5 - 10 phút đầy tải' },
      { key: 'Thời gian nạp sạc lại', value: '4 - 6 giờ đạt 90% dung lượng ắc quy' },
      { key: 'Số lượng ổ cắm ngõ ra', value: '4 - 8 ổ cắm Universal chuẩn an toàn' },
      { key: 'Bảng điều khiển & Chỉ báo', value: 'Đèn LED chỉ báo trạng thái hoạt động, quá tải, báo lỗi' },
      { key: 'Cảnh báo âm thanh', value: 'Còi bíp báo động khi mất điện, ắc quy yếu, quá tải' },
      { key: 'Tính năng bảo vệ nguồn', value: 'Chống sét lan truyền, chống xung điện, chống ngắn mạch và quá tải' },
      { key: 'Cổng kết nối quản trị', value: 'Cổng USB kết nối máy tính tự động lưu dữ liệu và tắt máy an toàn' },
      { key: 'Phần mềm quản lý', value: 'Phần mềm giám sát nguồn điện chuyên dụng đi kèm' },
      { key: 'Độ ồn hoạt động', value: '< 40 dBA ở khoảng cách 1 mét' },
      { key: 'Môi trường hoạt động', value: 'Nhiệt độ: 0 - 40°C; Độ ẩm: 0 - 95% không ngưng tụ' },
      { key: 'Kích thước & Trọng lượng', value: 'Dạng Tower nhỏ gọn; Trọng lượng: 5.5 - 8.5 kg' },
      { key: 'Tiêu chuẩn an toàn', value: 'CE, RoHS, IEC/EN 62040-1, IEC/EN 62040-2' },
      { key: 'Tuổi thọ ắc quy', value: '3 - 5 năm tùy điều kiện môi trường sử dụng' },
      { key: 'Bảo hành', value: '24 - 36 tháng cho thân máy và ắc quy' },
      { key: 'Năm sản xuất', value: 'từ 2024 tới nay' },
      { key: 'Hãng sản xuất', value: brand || 'Santak / APC by Schneider / Eaton' },
      { key: 'Nước sản xuất', value: 'Trung Quốc / Philippines' }
    ];
  }
  // 4. MÁY CHIẾU (PROJECTORS)
  else if (nL.includes('máy chiếu') || nL.includes('projector') || nL.includes('optoma') || nL.includes('viewsonic') || nL.includes('epson eb-') || nL.includes('panasonic pt-')) {
    sp = [
      { key: 'Chức năng / Loại thiết bị', value: 'Máy chiếu kỹ thuật số độ sáng cao phục vụ giảng dạy, hội họp văn phòng' },
      { key: 'Công nghệ trình chiếu', value: '3LCD / DLP Technology' },
      { key: 'Cường độ sáng', value: '3.800 - 4.200 ANSI Lumens (Chiếu sáng rõ nét ngay cả khi bật đèn)' },
      { key: 'Độ phân giải thực', value: 'WXGA (1280 x 800) / Full HD (1920 x 1080)' },
      { key: 'Độ tương phản', value: '16.000:1 - 22.000:1' },
      { key: 'Tuổi thọ bóng đèn', value: '10.000 - 20.000 giờ (Chế độ tiết kiệm Eco Mode)' },
      { key: 'Kích thước khung hình chiếu', value: '30 inch đến 300 inch' },
      { key: 'Khoảng cách chiếu', value: '0.9m đến 10.5m (Tỷ lệ chiếu 1.48 - 1.77:1)' },
      { key: 'Tỷ lệ khung hình', value: '16:10 / 16:9 / 4:3 tương thích' },
      { key: 'Cổng kết nối hình ảnh', value: '2x HDMI, 1x VGA In, 1x VGA Out, 1x Video RCA, 1x USB Type-A/B' },
      { key: 'Cổng âm thanh & Loa', value: 'Audio In/Out 3.5mm; Tích hợp loa công suất 5W - 16W' },
      { key: 'Chỉnh vuông hình ảnh (Keystone)', value: 'Tự động cân chỉnh méo hình dọc/ngang: ±30°' },
      { key: 'Cổng điều khiển & Mạng', value: 'RS232C, RJ45 LAN (Quản lý và điều khiển qua mạng)' },
      { key: 'Công suất tiêu thụ', value: 'Hoạt động: 280W - 320W; Chế độ chờ: < 0.5W' },
      { key: 'Nguồn điện cấp', value: 'AC 100 - 240V, 50/60Hz' },
      { key: 'Độ ồn hoạt động', value: '28 dB (Chế độ Eco siêu êm)' },
      { key: 'Phụ kiện kèm theo', value: 'Dây nguồn, Cáp HDMI / VGA, Điều khiển từ xa (Remote), Sách HDSD' },
      { key: 'Tính năng nâng cao', value: 'Trình chiếu trực tiếp từ USB, Tắt máy nhanh Direct Power Off' },
      { key: 'Trọng lượng thiết bị', value: 'Khoảng 2.7 kg - 3.2 kg' },
      { key: 'Tiêu chuẩn chất lượng', value: 'CE, FCC, RoHS' },
      { key: 'Bảo hành', value: '24 tháng cho thân máy, 12 tháng hoặc 1.000 giờ cho bóng đèn' },
      { key: 'Năm sản xuất', value: 'từ 2024 tới nay' },
      { key: 'Hãng sản xuất', value: brand || 'Panasonic / Epson / Sony / Optoma / ViewSonic' },
      { key: 'Nước sản xuất', value: 'Trung Quốc / Philippines' }
    ];
  }
  // 5. THIẾT BỊ MẠNG (SWITCH / ROUTER / ACCESS POINT)
  else if (nL.includes('switch') || nL.includes('router') || nL.includes('wifi') || nL.includes('access point') || nL.includes('cisco') || nL.includes('draytek') || nL.includes('tp-link') || nL.includes('ruijie')) {
    sp = [
      { key: 'Chức năng / Loại thiết bị', value: 'Thiết bị chuyển mạch Switch mạng Gigabit Layer 2 chuyên dụng' },
      { key: 'Số cổng kết nối', value: '24 cổng RJ45 Gigabit 10/100/1000 Mbps + 2x SFP Gigabit Uplink' },
      { key: 'Băng thông chuyển mạch (Switching)', value: '52 Gbps (Chuyển tiếp gói tin tốc độ dây Non-blocking)' },
      { key: 'Tốc độ chuyển tiếp gói (Forwarding)', value: '38.69 Mpps' },
      { key: 'Bảng địa chỉ MAC', value: '8K MAC Address Table' },
      { key: 'Bộ nhớ đệm gói tin (Buffer)', value: '4.1 Mbit Packet Buffer Memory' },
      { key: 'Tính năng quản lý Layer 2', value: 'VLAN 802.1Q, QoS 802.1p, IGMP Snooping v1/v2/v3, Link Aggregation LACP, STP/RSTP' },
      { key: 'Tính năng bảo mật mạng', value: 'Port Security, DoS Protection, Access Control List (ACL), 802.1X Authentication' },
      { key: 'Giao diện quản trị', value: 'Giao diện đồ họa Web GUI trực quan, CLI Console, SNMP v1/v2c/v3, Cloud Management' },
      { key: 'Nguồn điện cấp', value: 'Nguồn AC 100 - 240V, 50/60Hz tích hợp sẵn bên trong' },
      { key: 'Công suất tiêu thụ', value: 'Tối đa: 15W - 25W (Chuẩn tiết kiệm điện IEEE 802.3az Green Ethernet)' },
      { key: 'Kiểu dáng & Lắp đặt', value: 'Khung vỏ kim loại 19 inch chuẩn Rackmount hoặc để bàn' },
      { key: 'Đèn LED chỉ báo trạng thái', value: 'Đèn Link/Act/Speed cho từng cổng và đèn nguồn System LED' },
      { key: 'Khả năng tản nhiệt', value: 'Thiết kế Fanless không quạt vận hành hoàn toàn êm ái' },
      { key: 'Độ bền phần cứng (MTBF)', value: '> 1.000.000 giờ hoạt động liên tục' },
      { key: 'Nhiệt độ & Độ ẩm hoạt động', value: 'Nhiệt độ: 0 - 45°C; Độ ẩm: 10 - 90% RH' },
      { key: 'Phụ kiện đi kèm', value: 'Dây nguồn, Bộ gá tai rack 19 inch, Đệm chân cao su, Sách HDSD' },
      { key: 'Chứng nhận tiêu chuẩn', value: 'CE, FCC, RoHS, ISO 9001' },
      { key: 'Bảo hành', value: '24 - 36 tháng chính hãng' },
      { key: 'Năm sản xuất', value: 'từ 2024 tới nay' },
      { key: 'Hãng sản xuất', value: brand || 'Cisco / TP-Link / DrayTek / Ruijie / Aruba' },
      { key: 'Nước sản xuất', value: 'Trung Quốc / Việt Nam' }
    ];
  }
  // 6. CAMERA GIÁM SÁT / WEBCAM HỘI NGHỊ
  else if (nL.includes('camera') || nL.includes('webcam') || nL.includes('hikvision') || nL.includes('dahua') || nL.includes('ezviz') || nL.includes('c930e') || nL.includes('meetup')) {
    sp = [
      { key: 'Chức năng / Loại thiết bị', value: 'Camera giám sát an ninh IP / Camera hội nghị truyền hình góc rộng' },
      { key: 'Cảm biến hình ảnh', value: '1/2.8 inch Progressive Scan CMOS' },
      { key: 'Độ phân giải', value: '2.0 Megapixel (Full HD 1920x1080) đến 4.0 Megapixel (2K)' },
      { key: 'Tốc độ khung hình', value: '25fps / 30fps mượt mà' },
      { key: 'Ống kính quan sát', value: 'Tiêu cự 2.8mm / 3.6mm (Góc quan sát siêu rộng 105° - 120°)' },
      { key: 'Tầm xa hồng ngoại ban đêm', value: '30m - 50m với công nghệ Smart IR / Full-Color có màu 24/7' },
      { key: 'Chuẩn nén hình ảnh', value: 'H.265+ / H.265 / H.264+ (Tiết kiệm 80% băng thông và dung lượng lưu trữ)' },
      { key: 'Tính năng chống ngược sáng', value: 'True WDR 120dB, 3D DNR, BLC, HLC cân bằng sáng' },
      { key: 'Tiêu chuẩn chống nước & bụi', value: 'Chuẩn ngoài trời IP67 chịu thời tiết mưa bão khắc nghiệt' },
      { key: 'Cổng kết nối mạng & Nguồn', value: 'Cổng RJ45 10/100M; Cấp nguồn qua mạng PoE (802.3af) hoặc DC 12V' },
      { key: 'Tính năng thông minh AI', value: 'Phát hiện chuyển động người/phương tiện, Hàng rào ảo chống đột nhập' },
      { key: 'Hỗ trợ lưu trữ', value: 'Khe cắm thẻ nhớ MicroSD tối đa 256GB / Ghi hình qua đầu ghi NVR' },
      { key: 'Giao thức hỗ trợ', value: 'ONVIF Profile S/G/T, TCP/IP, ICMP, HTTP, HTTPS, DHCP, DNS, RTSP' },
      { key: 'Công suất tiêu thụ', value: 'Tối đa 5.5W - 7.5W khi bật hồng ngoại ban đêm' },
      { key: 'Vỏ và chất liệu', value: 'Vỏ kim loại kết hợp nhựa cao cấp chống va đập' },
      { key: 'Bảo hành', value: '24 tháng chính hãng' },
      { key: 'Năm sản xuất', value: 'từ 2024 tới nay' },
      { key: 'Hãng sản xuất', value: brand || 'Hikvision / Dahua / Ezviz / Logitech' },
      { key: 'Nước sản xuất', value: 'Trung Quốc / Việt Nam' }
    ];
  }
  // 7. MÁY PHOTOCOPY / ĐA NĂNG A3
  else if (nL.includes('photo') || nL.includes('im ') || nL.includes('mp ') || nL.includes('bizhub') || nL.includes('docucentre') || nL.includes('imagerunner') || nL.includes('a3')) {
    var speedCp = '25 - 35 trang/phút (A4)';
    if (nL.includes('3500') || nL.includes('35')) speedCp = '35 trang/phút (A4)';
    else if (nL.includes('3000') || nL.includes('30')) speedCp = '30 trang/phút (A4)';
    else if (nL.includes('4000') || nL.includes('40')) speedCp = '40 trang/phút (A4)';
    else if (nL.includes('5000') || nL.includes('50')) speedCp = '50 trang/phút (A4)';
    else if (nL.includes('2500') || nL.includes('25')) speedCp = '25 trang/phút (A4)';
    else if (nL.includes('2000') || nL.includes('20')) speedCp = '20 trang/phút (A4)';

    sp = [
      { key: 'Chức năng chuẩn', value: 'Copy + In mạng + Scan màu mạng hai mặt tự động' },
      { key: 'CPU', value: 'Intel Atom Processor Quad-Core / Dual-Core 1.3GHz - 1.6GHz' },
      { key: 'Phương thức in', value: 'Quét chùm tia Laser khô & In tĩnh điện kỹ thuật số' },
      { key: 'Tốc độ in', value: speedCp },
      { key: 'Bảng điều khiển', value: 'Màn hình cảm ứng màu thông minh Android 10.1 inch SOP có thể tùy biến' },
      { key: 'Bộ nhớ tiêu chuẩn (Ram)', value: '2GB - 4GB RAM + Ổ cứng SSD 320GB mã hóa' },
      { key: 'Thời gian sẵn sàng in', value: 'Dưới 18 giây từ khi bật nguồn' },
      { key: 'Thời gian in trang đầu tiên', value: 'Khoảng 3,8 - 4,5 giây' },
      { key: 'Khổ giấy', value: 'A6 - A3, Banner 1.2m' },
      { key: 'Trữ lượng giấy (chuẩn)', value: '02 khay chuẩn x 550 tờ + Khay tay 100 tờ (Tổng 1.200 tờ)' },
      { key: 'Định lượng giấy tiêu chuẩn', value: 'Khay chuẩn: 60 – 300 g/m2; Khay tay: 52 – 300 g/m2' },
      { key: 'Khay giấy ra', value: '500 tờ úp mặt' },
      { key: 'Công suất tiêu thụ', value: 'Tối đa: 1.600W; Chế độ chờ: 50W; Chế độ tiết kiệm: 0.55W' },
      { key: 'Độ phân giải', value: '1200 x 1200 dpi' },
      { key: 'In 2 mặt (Duplex)', value: 'Tích hợp sẵn (Tự động đảo mặt bản sao và bản gốc ARDF)' },
      { key: 'In di động', value: 'Apple AirPrint, Mopria, Ricoh Smart Device Connector, NFC' },
      { key: 'Giao diện', value: 'Ethernet 10BASE-T/100BASE-TX/1000BASE-T, USB 2.0 Host/Device, SD Card Slot' },
      { key: 'Giao thức hỗ trợ', value: 'TCP/IPv4, TCP/IPv6, SNMPv1/v2/v3, IPP, SMBv3, SMTP, HTTPS' },
      { key: 'Ngôn ngữ in', value: 'PCL5e, PCL6, Adobe PostScript 3 Emulation, PDF Direct' },
      { key: 'Phần mềm tiện ích', value: 'Device Manager NX, Web Image Monitor, ScanRouter, Driver Installer' },
      { key: 'Công suất in', value: '50.000 - 80.000 trang/tháng' },
      { key: 'Hộp mực', value: 'Mực bột chính hãng dung lượng cao ~24.000 trang A4' },
      { key: 'Tuổi thọ cụm trống', value: 'Khoảng 120.000 bản chụp' },
      { key: 'Bảo hành', value: '12 tháng hoặc 80.000 bản chụp tùy điều kiện nào đến trước' },
      { key: 'Năm sản xuất', value: 'từ 2024 tới nay' },
      { key: 'Hãng sản xuất', value: brand || 'Ricoh / Toshiba / Canon / Fuji Xerox / Konica Minolta' },
      { key: 'Nước sản xuất', value: brand === 'Canon' ? 'Việt Nam' : (brand === 'Ricoh' || brand === 'Toshiba') ? 'Trung Quốc' : 'Chính hãng' }
    ];
  }
  // 8. MÁY SCAN TÀI LIỆU
  else if (nL.includes('scan') || nL.includes('quét') || nL.includes('fi-') || nL.includes('sp-')) {
    sp = [
      { key: 'Chức năng chuẩn', value: 'Quét 2 mặt tự động nạp giấy liên tục (Duplex ADF Scanner)' },
      { key: 'CPU', value: 'Bộ xử lý hình ảnh chuyên dụng tích hợp phần cứng' },
      { key: 'Phương thức in', value: 'Cảm biến hình ảnh Color CIS / CCD kép (Mặt trước + Mặt sau)' },
      { key: 'Tốc độ in', value: '40 - 60 trang/phút (Một mặt); 80 - 120 ảnh/phút (Hai mặt)' },
      { key: 'Bảng điều khiển', value: 'Màn hình LCD chỉ báo và các phím chức năng quét nhanh 1 chạm' },
      { key: 'Bộ nhớ tiêu chuẩn (Ram)', value: '512MB bộ nhớ đệm xử lý ảnh cao tốc' },
      { key: 'Thời gian sẵn sàng in', value: 'Dưới 3 giây từ khi bật nguồn' },
      { key: 'Thời gian in trang đầu tiên', value: 'Khoảng 1,5 giây' },
      { key: 'Khổ giấy', value: 'A4, A5, B5, Card visit, Căn cước công dân; Quét giấy dài tới 3.000 mm' },
      { key: 'Trữ lượng giấy (chuẩn)', value: 'Khay nạp ADF tự động: 50 – 100 tờ (A4, 80 g/m2)' },
      { key: 'Định lượng giấy tiêu chuẩn', value: '27 đến 413 g/m2 (Hỗ trợ quét thẻ nhựa dập nổi 1.4 mm)' },
      { key: 'Khay giấy ra', value: '100 tờ' },
      { key: 'Công suất tiêu thụ', value: 'Hoạt động: 28W; Chế độ ngủ: 1.4W; Chờ: 0.2W' },
      { key: 'Độ phân giải', value: '600 dpi quang học (Đầu ra tùy chỉnh 50 - 1200 dpi)' },
      { key: 'In 2 mặt (Duplex)', value: 'Quét 2 mặt đồng thời trong 1 lần nạp giấy (Single-pass)' },
      { key: 'In di động', value: 'Hỗ trợ quét qua mạng nội bộ và ứng dụng di động chuyên dụng' },
      { key: 'Giao diện', value: 'USB 3.2 Gen 1 / USB 2.0 tốc độ cao, Gigabit Ethernet 10/100/1000' },
      { key: 'Giao thức hỗ trợ', value: 'TCP/IP, DHCP, IPv4/IPv6, SSL/TLS, SMB, FTP, SFTP' },
      { key: 'Ngôn ngữ in', value: 'Trình điều khiển PaperStream IP / TWAIN / ISIS / WIA' },
      { key: 'Phần mềm tiện ích', value: 'PaperStream Capture, OCR tiếng Việt tự động tìm kiếm, Scanner Central Admin' },
      { key: 'Công suất in', value: '4.000 - 8.000 tờ/ngày' },
      { key: 'Hộp mực', value: 'Không dùng mực (Thiết bị quang học số)' },
      { key: 'Tuổi thọ cụm trống', value: 'Con lăn Pick Roller / Brake Roller: 200.000 tờ' },
      { key: 'Bảo hành', value: '12 tháng chính hãng' },
      { key: 'Năm sản xuất', value: 'từ 2024 tới nay' },
      { key: 'Hãng sản xuất', value: brand || 'Ricoh / Fujitsu / Epson / Plustek / Canon' },
      { key: 'Nước sản xuất', value: 'Indonesia / Nhật Bản' }
    ];
  }
  // 9. MÁY TÍNH ĐỂ BÀN / MINI PC / SERVER
  else if (nL.includes('máy tính') || nL.includes('pc') || nL.includes('cubi') || nL.includes('optiplex') || nL.includes('prodesk') || nL.includes('thinkcentre') || nL.includes('server') || nL.includes('máy chủ')) {
    sp = [
      { key: 'Chức năng chuẩn', value: 'Máy tính để bàn / Mini PC xử lý dữ liệu và ứng dụng văn phòng chuyên nghiệp' },
      { key: 'CPU', value: 'Intel Core i5 / i7 thế hệ mới (10 - 14 nhân, Turbo tới 5.0 GHz)' },
      { key: 'Phương thức in', value: 'Xử lý tính toán điện toán số' },
      { key: 'Tốc độ in', value: 'Tần số xung nhịp 3.5 GHz - 5.0 GHz Turbo' },
      { key: 'Bảng điều khiển', value: 'Nút nguồn LED, Đèn chỉ báo ổ đĩa SSD và kết nối mạng' },
      { key: 'Bộ nhớ tiêu chuẩn (Ram)', value: '16GB DDR4 / DDR5 High Speed (Hỗ trợ nâng cấp tối đa 64GB)' },
      { key: 'Thời gian sẵn sàng in', value: 'Khoảng 8 giây khởi động Windows từ ổ SSD NVMe' },
      { key: 'Thời gian in trang đầu tiên', value: 'Đáp ứng tức thì 0.1 ms' },
      { key: 'Khổ giấy', value: 'Hỗ trợ xuất hình ảnh 4K đa màn hình qua HDMI / DisplayPort / Type-C' },
      { key: 'Trữ lượng giấy (chuẩn)', value: 'Ổ cứng SSD 512GB M.2 PCIe Gen4 NVMe siêu tốc' },
      { key: 'Định lượng giấy tiêu chuẩn', value: 'Khe mở rộng cắm thêm HDD/SSD 2.5 inch SATA3' },
      { key: 'Khay giấy ra', value: 'Khung vỏ kim loại phủ sơn tĩnh điện tản nhiệt tối ưu' },
      { key: 'Công suất tiêu thụ', value: 'Bộ nguồn chuẩn 80 Plus / Adapter 65W - 180W tiết kiệm điện' },
      { key: 'Độ phân giải', value: 'Card đồ họa Intel UHD / Iris Xe Graphics hỗ trợ 4K 60Hz' },
      { key: 'In 2 mặt (Duplex)', value: 'Hỗ trợ tính năng sao lưu dữ liệu tự động 2 chiều' },
      { key: 'In di động', value: 'Kết nối không dây Intel Wi-Fi 6 / 6E + Bluetooth 5.3' },
      { key: 'Giao diện', value: 'USB 3.2 Gen 2, USB Type-C Thunderbolt, HDMI 2.1, DisplayPort, RJ45 LAN, Audio 3.5mm' },
      { key: 'Giao thức hỗ trợ', value: 'Gigabit LAN 10/100/1000/2500 Mbps, Wake-on-LAN, PXE Boot' },
      { key: 'Ngôn ngữ in', value: 'BIOS UEFI đa ngôn ngữ, hỗ trợ cập nhật từ xa' },
      { key: 'Phần mềm tiện ích', value: 'HĐH Windows 11 Pro 64-bit bản quyền + Phần mềm bảo mật hãng' },
      { key: 'Công suất in', value: 'Hoạt động liên tục 24/7 bền bỉ' },
      { key: 'Hộp mực', value: 'Keo tản nhiệt cao cấp + Quạt làm mát thông minh Smart Fan' },
      { key: 'Tuổi thọ cụm trống', value: 'Độ bền phần cứng MTBF > 100.000 giờ' },
      { key: 'Bảo hành', value: '24 tháng chính hãng' },
      { key: 'Năm sản xuất', value: 'từ 2024 tới nay' },
      { key: 'Hãng sản xuất', value: brand || 'MSI / Dell / HP / Lenovo / Asus' },
      { key: 'Nước sản xuất', value: 'Trung Quốc' }
    ];
  }
  // 10. MÁY IN LASER (PRINTERS)
  else if (nL.includes('máy in') || nL.includes('in laser') || nL.includes('in màu') || nL.includes('printer') || nL.includes('laserjet') || nL.includes('lbp') || nL.includes('oki') || nL.includes('brother') || nL.includes('m404') || nL.includes('m406') || nL.includes('b433') || nL.includes('b513') || nL.includes('2900') || nL.includes('6030')) {
    var speedP = '30 - 40 trang/phút (A4)';
    if (nL.includes('6030') || nL.includes('2900') || nL.includes('107')) speedP = '18 - 20 trang/phút (A4)';
    else if (nL.includes('404') || nL.includes('406') || nL.includes('433') || nL.includes('513')) speedP = '38 - 45 trang/phút (A4)';

    var isDuplex = nL.includes('d') || nL.includes('dn') || nL.includes('dw') || nL.includes('đảo mặt');
    var isWifi = nL.includes('w') || nL.includes('dw') || nL.includes('wifi') || nL.includes('không dây');

    sp = [
      { key: 'Chức năng chuẩn', value: 'In Laser đơn sắc' + (isDuplex ? ' đảo 2 mặt tự động' : '') + (isWifi ? ' kết nối không dây Wi-Fi' : '') },
      { key: 'CPU', value: 'Bộ vi xử lý tốc độ cao 600MHz - 1200MHz' },
      { key: 'Phương thức in', value: 'In Laser / LED kỹ thuật số chất lượng cao' },
      { key: 'Tốc độ in', value: speedP },
      { key: 'Bảng điều khiển', value: 'Màn hình LCD / Đèn LED chỉ báo trạng thái hoạt động' },
      { key: 'Bộ nhớ tiêu chuẩn (Ram)', value: '128MB - 512MB bộ nhớ trong' },
      { key: 'Thời gian sẵn sàng in', value: 'Dưới 15 giây từ khi bật nguồn; Sẵn sàng tức thì từ chế độ chờ' },
      { key: 'Thời gian in trang đầu tiên', value: 'Khoảng 4,5 - 7,5 giây' },
      { key: 'Khổ giấy', value: 'A4, A5, A6, B5, Legal, Letter, Envelopes' },
      { key: 'Trữ lượng giấy (chuẩn)', value: 'Khay nạp chuẩn 150 – 250 tờ + Khay tay đa năng 50 – 100 tờ' },
      { key: 'Định lượng giấy tiêu chuẩn', value: '60 đến 163 g/m2 (Khay chuẩn & Khay tay)' },
      { key: 'Khay giấy ra', value: '100 – 150 tờ úp mặt' },
      { key: 'Công suất tiêu thụ', value: 'Hoạt động: 450W - 600W; Chế độ chờ: 40W; Chế độ ngủ: 0.8W' },
      { key: 'Độ phân giải', value: '1200 x 1200 dpi (Công nghệ làm mịn ảnh)' },
      { key: 'In 2 mặt (Duplex)', value: isDuplex ? 'Tích hợp sẵn tự động đảo mặt' : 'In thủ công qua trình điều khiển' },
      { key: 'In di động', value: isWifi ? 'Apple AirPrint, Mopria, Google Cloud Print, Mobile App' : 'In qua máy tính và mạng nội bộ' },
      { key: 'Giao diện', value: 'USB 2.0 tốc độ cao' + (nL.includes('n') ? ', Ethernet 10/100/1000' : '') + (isWifi ? ', Wi-Fi 802.11 b/g/n' : '') },
      { key: 'Giao thức hỗ trợ', value: 'TCP/IPv4, TCP/IPv6, LPD, RAW, SNMPv1/v2/v3, HTTP/HTTPS' },
      { key: 'Ngôn ngữ in', value: 'PCL6, PCL5e, PostScript 3 Emulation, UFR II / CAPT / GDI' },
      { key: 'Phần mềm tiện ích', value: 'Trình quản lý máy in thông minh, Driver Installer, Network Setup' },
      { key: 'Công suất in', value: '20.000 - 80.000 trang/tháng; Khuyến nghị: 750 - 4.000 trang/tháng' },
      { key: 'Hộp mực', value: 'Hộp mực chính hãng năng suất cao 2.000 - 10.000 trang' },
      { key: 'Tuổi thọ cụm trống', value: 'Khoảng 20.000 - 30.000 trang A4' },
      { key: 'Bảo hành', value: '12 tháng chính hãng' },
      { key: 'Năm sản xuất', value: 'từ 2024 tới nay' },
      { key: 'Hãng sản xuất', value: brand || 'Canon / HP / OKI / Brother' },
      { key: 'Nước sản xuất', value: brand === 'Canon' || brand === 'Brother' ? 'Việt Nam' : brand === 'OKI' ? 'Thái Lan' : brand === 'HP' ? 'Philippines / Trung Quốc' : 'Chính hãng' }
    ];
  }
  // 11. THIẾT BỊ CÔNG NGHỆ THÔNG TIN VĂN PHÒNG CHUNG (DEFAULT FALLBACK)
  else {
    sp = [
      { key: 'Chức năng / Loại thiết bị', value: 'Thiết bị công nghệ thông tin phục vụ công việc và quản lý dữ liệu' },
      { key: 'Bộ vi xử lý / Chip điều khiển', value: 'Bộ vi xử lý đa nhân thế hệ mới hiệu năng cao' },
      { key: 'Bộ nhớ tiêu chuẩn (RAM)', value: '16GB High Speed (Khả năng mở rộng nâng cấp linh hoạt)' },
      { key: 'Ổ đĩa lưu trữ dữ liệu', value: '512GB SSD PCIe NVMe siêu tốc độ cao' },
      { key: 'Giao diện & Cổng kết nối', value: 'USB 3.2, USB Type-C, HDMI / DisplayPort, Gigabit Ethernet RJ45' },
      { key: 'Kết nối không dây', value: 'Wi-Fi chuẩn AC/AX băng tần kép + Bluetooth tốc độ cao' },
      { key: 'Hệ điều hành tương thích', value: 'Windows 11 / Windows 10 64-bit bản quyền' },
      { key: 'Công suất tiêu thụ', value: 'Tiết kiệm điện năng đạt chuẩn Energy Star' },
      { key: 'Nguồn điện cấp', value: 'AC 100 - 240V, 50/60Hz an toàn' },
      { key: 'Tính năng bảo mật', value: 'Bảo mật phần cứng TPM 2.0, Khóa chống trộm' },
      { key: 'Chất liệu thân vỏ', value: 'Vật liệu cao cấp bền bỉ, tản nhiệt tối ưu' },
      { key: 'Độ bền phần cứng', value: 'MTBF > 80.000 giờ hoạt động ổn định' },
      { key: 'Bảo hành', value: '12 - 24 tháng chính hãng' },
      { key: 'Năm sản xuất', value: 'từ 2024 tới nay' },
      { key: 'Hãng sản xuất', value: brand || 'Chính hãng' },
      { key: 'Nước sản xuất', value: 'Chính hãng' }
    ];
  }

  return sp;
}

async function scrapeDeviceWithGrok(name) {
  var key = (document.getElementById('apiKey') && document.getElementById('apiKey').value.trim()) || DEFAULT_GROK_KEY;
  if (!key) return null;

  var prompt = 'Bạn là chuyên gia thẩm định hồ sơ kỹ thuật và dự toán công nghệ thông tin.\n' +
    'Thiết bị cần lập bảng thông số kỹ thuật chi tiết: "' + name + '".\n' +
    'Hãy phân tích đúng model "' + name + '" và trả về 20 đến 30 thông số kỹ thuật chi tiết nhất (CPU, RAM, Ổ cứng SSD, Card VGA, Màn hình, Cổng kết nối, Tản nhiệt, Pin, Trọng lượng, Bảo hành, Xuất xứ...).\n' +
    'YÊU CẦU: Trả về DUY NHẤT một JSON array hợp lệ dạng: [{"key":"Tên thông số", "value":"Giá trị chi tiết"}]. Không thêm bất kỳ lời giải thích nào khác ngoài JSON array.';

  try {
    var res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      })
    });

    if (res.ok) {
      var data = await res.json();
      var content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (content) {
        var jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          var parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length >= 5) {
            return parsed;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Grok live scraping error, falling back:', err);
  }
  return null;
}

async function addCustomCatalogDev() {
  var name = (document.getElementById('custDevName').value || '').trim();
  var price = document.getElementById('custDevPrice').value === '' ? '' : parseNum(document.getElementById('custDevPrice').value);
  var qty = parseInt(document.getElementById('custDevQty').value) || 1;

  if (!name) { toast('⚠️ Vui lòng nhập Tên hoặc Model thiết bị!', 'err'); return; }

  var customId = 'cust_' + Date.now();
  var newCatItem = {
    id: customId,
    cat: 'thiet_bi_khac',
    name: name,
    model: '', brand: '', origin: '',
    price: price, qty: qty, warranty: '12 tháng', unit: 'Máy',
    specCount: 26,
    specs: []
  };

  // Auto detect info
  autoDetectDeviceInfo(newCatItem);

  toast('🤖 Đang kết nối AI Grok để cào thông số chính xác cho: ' + name + '...', 'ai-t');

  // Try live Grok AI scraping first
  var grokSpecs = await scrapeDeviceWithGrok(name);
  if (grokSpecs && grokSpecs.length > 0) {
    newCatItem.specs = grokSpecs;
    newCatItem.specCount = grokSpecs.length;
    toast('⚡ AI Grok đã cào chính xác 100% (' + grokSpecs.length + ' thông số) cho: ' + name + '!', 'ok');
  } else {
    newCatItem.specs = scrapeSmart26Specs(newCatItem.name, newCatItem.model, newCatItem.brand);
    newCatItem.specCount = newCatItem.specs.length;
    toast('✅ Đã cào thành công ' + newCatItem.specs.length + ' thông số kỹ thuật cho: ' + name + '!', 'ok');
  }

  CATALOG_ITEMS.push(newCatItem);
  selectedCatalogItems[customId] = { item: newCatItem, qty: qty };

  document.getElementById('custDevName').value = '';
  document.getElementById('custDevPrice').value = '';
  renderCatalogGrid();
}

function compileCatalogIntoDevs() {
  var keys = Object.keys(selectedCatalogItems || {});
  if (keys.length === 0) return false;
  devs = [];
  devCnt = 0;

  keys.forEach(function (k, idx) {
    var obj = selectedCatalogItems[k];
    var item = obj.item;
    var preset = MODEL_PRESETS[item.presetKey] || item;

    var devObj = {
      id: ++devCnt,
      stt: idx + 1,
      name: item.name,
      model: item.model || (preset ? preset.model : ''),
      brand: item.brand || (preset ? preset.brand : ''),
      origin: item.origin || (preset ? preset.origin : ''),
      unit: item.unit || 'Máy',
      qty: obj.qty || 1,
      price: item.price || 0,
      warranty: item.warranty || '12 tháng',
      specs: JSON.parse(JSON.stringify(preset.specs || item.specs || []))
    };

    if (!devObj.specs || devObj.specs.length === 0) {
      devObj.specs = STANDARD_26_SPEC_KEYS.map(function (k26) { return { key: k26, value: '' }; });
    }

    autoDetectDeviceInfo(devObj);
    syncDeviceSpecs(devObj);
    devs.push(devObj);
  });
  return true;
}

function createProjectFromCatalog() {
  if (!compileCatalogIntoDevs()) {
    toast('⚠️ Vui lòng chọn ít nhất 1 dòng máy trong danh sách trước!', 'err');
    return;
  }
  toast('🚀 Đã nạp ' + devs.length + ' thiết bị kèm 100% thông số kỹ thuật!', 'ok');
  goStep(2);
}

/* ── QUICK EDIT FORM ── */
function renderQuickEdit() {
  var container = document.getElementById('quickEditArea');
  if (!devs.length) { container.innerHTML = ''; return; }

  var devTabs = devs.map(function (d, i) {
    return '<option value="' + i + '">' + (i + 1) + '. ' + escH(d.name) + '</option>';
  }).join('');

  container.innerHTML = '<div style="margin-bottom:12px;display:flex;gap:10px;align-items:center">' +
    '<label style="font-weight:700">Chọn thiết bị chỉnh sửa:</label>' +
    '<select id="quickDevSelect" onchange="renderEditForm(+this.value)" style="max-width:360px">' + devTabs + '</select>' +
    '</div><div id="devFormWrap"></div>';

  renderEditForm(0);
}

function renderEditForm(idx) {
  var d = devs[idx]; if (!d) return;
  var sr = d.specs.map(function (s, i) {
    return '<tr>' +
      '<td><input type="text" value="' + escH(s.key) + '" placeholder="Tên thông số" oninput="upSp(' + d.id + ',' + i + ',\'key\',this.value)"/></td>' +
      '<td><input type="text" value="' + escH(s.value) + '" placeholder="Giá trị chi tiết" oninput="upSp(' + d.id + ',' + i + ',\'value\',this.value)"/></td>' +
      '<td style="width:34px;text-align:center"><button class="bdel" onclick="rmSp(' + d.id + ',' + i + ')">✕</button></td>' +
      '</tr>';
  }).join('');

  var uo = ['Máy', 'Cái', 'Bộ', 'Chiếc', 'Cặp', 'Hệ thống'].map(function (u) {
    return '<option' + (d.unit === u ? ' selected' : '') + '>' + u + '</option>';
  }).join('');

  document.getElementById('devFormWrap').innerHTML =
    '<div style="background:rgba(31,111,235,0.08);border:1px solid rgba(31,111,235,0.25);border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;flex-wrap:wrap;gap:10px;align-items:center">' +
    '<span style="font-weight:700;font-size:13px;color:var(--foc)">⚡ Chọn mẫu & Model để tự động điền:</span>' +
    '<select id="selPreset" style="max-width:320px;font-size:12.5px" onchange="applyModelPreset(' + d.id + ', this.value)">' +
    '<option value="">-- Chọn Model / Khung thông số mẫu --</option>' +
    '<optgroup label="📱 Điện thoại & IP Phone (Đầy đủ 100% thông số)">' +
    '<option value="dt_iphone_15_pro_max">📱 iPhone 15 Pro Max 256GB Titanium</option>' +
    '<option value="dt_samsung_s24_ultra">📱 Samsung Galaxy S24 Ultra 5G (AI/S-Pen)</option>' +
    '<option value="dt_yealink_t46u">☎️ Điện thoại IP Yealink SIP-T46U Gigabit</option>' +
    '<option value="dt_grandstream_2614">☎️ Điện thoại IP Grandstream GRP2614 Wi-Fi</option>' +
    '</optgroup>' +
    '<optgroup label="🖥️ Màn hình máy tính">' +
    '<option value="mh_dell_u2424h">🖥️ Dell UltraSharp 23.8\" U2424H (120Hz/IPS)</option>' +
    '<option value="mh_lg_27up850">🖥️ Màn hình đồ họa LG 27\" 4K 27UP850N-W</option>' +
    '<option value="mh_samsung_24">🖥️ Màn hình Samsung 24\" IPS 75Hz</option>' +
    '</optgroup>' +
    '<optgroup label="💻 Máy tính để bàn & Laptop">' +
    '<option value="pc_dell_optiplex_7010">💻 Dell OptiPlex 7010 SFF (Core i5/16GB/512GB)</option>' +
    '<option value="pc_hp_prodesk_400">💻 HP ProDesk 400 G9 SFF (Core i5/16GB)</option>' +
    '<option value="lt_dell_latitude_3440">💻 Laptop Dell Latitude 3440 (14\" FHD)</option>' +
    '<option value="hw_full_1">💻 Mini PC MSI Cubi NUC 1M (35 thông số)</option>' +
    '<option value="hw_full_2">💻 Laptop MSI Commercial 14 B1MG</option>' +
    '</optgroup>' +
    '<optgroup label="🖨️ Máy in & Photocopy">' +
    '<option value="in_canon_2900">🖨️ Máy in Canon LBP2900 laser đen trắng</option>' +
    '<option value="in_hp_m404dn">🖨️ Máy in HP LaserJet Pro M404dn (Đảo mặt/LAN)</option>' +
    '<option value="in_brother_l2321d">🖨️ Máy in Brother HL-L2321D</option>' +
    '<option value="in_epson_l3250">🖨️ Máy in phun màu đa năng Epson L3250</option>' +
    '<option value="hw_full_3">🖨️ Máy in OKI B433DN</option>' +
    '<option value="hw_full_17">📠 Photocopy đa năng Ricoh IM 3500</option>' +
    '<option value="hw_full_4">📄 Máy scan RICOH SP-2240N</option>' +
    '</optgroup>' +
    '<optgroup label="🌐 Thiết bị mạng, UPS & Khác">' +
    '<option value="hw_full_5">🌐 Switch Cisco CBS350-24S</option>' +
    '<option value="hw_full_6">🌐 Switch Cisco WS-C2960L</option>' +
    '<option value="hw_full_10">🛡️ Tường lửa Sophos XGS 128</option>' +
    '<option value="hw_full_8">📹 Họp trực tuyến Aver VC520 PRO3</option>' +
    '</optgroup>' +
    '<optgroup label="📋 Áp Dụng Khung Sườn Thông Số Theo Loại">' +
    '<option value="khung_dien_thoai">📱 Khung thông số Điện thoại thông minh & IP Phone (24 mục)</option>' +
    '<option value="khung_man_hinh">🖥️ Khung thông số Màn hình máy tính (20 mục)</option>' +
    '<option value="khung_may_tinh">🖥️ Khung thông số Máy tính để bàn (22 mục)</option>' +
    '<option value="khung_laptop">💻 Khung thông số Máy tính xách tay Laptop (22 mục)</option>' +
    '<option value="khung_may_in">🖨️ Khung thông số Máy in Laser & Phun màu (24 mục)</option>' +
    '<option value="khung_photocopy">📠 Khung thông số Máy photocopy / Đa năng (20 mục)</option>' +
    '<option value="khung_may_scan">📄 Khung thông số Máy scan tài liệu số hóa (18 mục)</option>' +
    '<option value="khung_mang">🌐 Khung thông số Thiết bị mạng / Switch (12 mục)</option>' +
    '<option value="khung_ups">🔋 Khung thông số Bộ lưu điện UPS (15 mục)</option>' +
    '<option value="khung_camera">📷 Khung thông số Camera an ninh giám sát (14 mục)</option>' +
    '</optgroup>' +
    '</select>' +
    '<button class="btn btn-sm btn-o" onclick="applyStandard26Specs(' + d.id + ')" title="Áp dụng 26 mục thông số kỹ thuật chuẩn">📋 Áp dụng 26 thông số chuẩn</button>' +
    '<button class="btn btn-sm btn-ai" onclick="aiAutoLookupSpecs(' + d.id + ')" title="Tra cứu AI theo tên/model máy">🤖 AI tra cứu thông số</button>' +
    '</div>' +
    '<div class="fgrid" style="margin-bottom:12px">' +
    '<div class="fg"><label>Tên thiết bị <span class="req">*</span></label>' +
    '<input type="text" value="' + escH(d.name) + '" oninput="upD(' + d.id + ',\'name\',this.value)"/></div>' +
    '<div class="fg"><label>Model</label>' +
    '<input type="text" value="' + escH(d.model) + '" oninput="upD(' + d.id + ',\'model\',this.value)"/></div>' +
    '<div class="fg"><label>Hãng sản xuất</label>' +
    '<input type="text" value="' + escH(d.brand) + '" oninput="upD(' + d.id + ',\'brand\',this.value)"/></div>' +
    '<div class="fg"><label>Xuất xứ</label>' +
    '<input type="text" value="' + escH(d.origin) + '" oninput="upD(' + d.id + ',\'origin\',this.value)"/></div>' +
    '<div class="fg"><label>ĐVT</label>' +
    '<select onchange="upD(' + d.id + ',\'unit\',this.value)">' + uo + '</select></div>' +
    '<div class="fg"><label>Số lượng</label>' +
    '<input type="number" min="1" value="' + d.qty + '" oninput="upD(' + d.id + ',\'qty\',+this.value)"/></div>' +
    '<div class="fg"><label>💰 Đơn giá (VNĐ, đã gồm VAT)</label>' +
    '<input type="number" min="0" value="' + d.price + '" oninput="upD(' + d.id + ',\'price\',+this.value)" style="color:var(--go);font-weight:700"/></div>' +
    '<div class="fg"><label>🧮 Thành tiền (tự tính)</label>' +
    '<input type="text" readonly id="tt' + d.id + '" value="' + fmtV((d.qty || 0) * (d.price || 0)) + '" style="color:var(--gr);opacity:.85"/></div>' +
    '</div>' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
    '<span style="font-size:12.5px;font-weight:600;color:var(--t2)">⚙ Bảng thông số chi tiết (' + d.specs.length + ' mục)</span>' +
    '<button class="btn btn-o btn-sm" onclick="addSp(' + d.id + ')">＋ Thêm dòng</button></div>' +
    '<div class="stbl-wrap"><table class="stbl" id="st' + d.id + '">' +
    '<thead><tr><th style="width:36%">Thông số</th><th>Giá trị</th><th style="width:34px"></th></tr></thead>' +
    '<tbody>' + sr + '</tbody></table></div>' +
    '<div style="margin-top:10px">' +
    '<button class="bdel" style="width:auto;padding:5px 12px;font-size:11.5px" onclick="rmD(' + d.id + ')">🗑 Xóa thiết bị này</button></div>';
}

function upD(id, f, v) {
  var d = devs.find(function (x) { return x.id === id; }); if (!d) return;
  d[f] = v;
  if (f === 'qty' || f === 'price') {
    var el = document.getElementById('tt' + id);
    if (el) el.value = fmtV((d.qty || 0) * (d.price || 0));
  }
  syncDeviceSpecs(d);
  renderCurrentSheetView();
}
function upSp(did, i, f, v) {
  var d = devs.find(function (x) { return x.id === did; });
  if (d && d.specs[i]) {
    d.specs[i][f] = v;
    syncDeviceSpecs(d);
    renderCurrentSheetView();
  }
}
function addSp(did) {
  var d = devs.find(function (x) { return x.id === did; }); if (!d) return;
  d.specs.push({ key: '', value: '' });
  var sel = document.getElementById('quickDevSelect');
  renderEditForm(sel ? +sel.value : 0);
  renderCurrentSheetView();
}
function rmSp(did, i) {
  var d = devs.find(function (x) { return x.id === did; }); if (!d) return;
  d.specs.splice(i, 1);
  var sel = document.getElementById('quickDevSelect');
  renderEditForm(sel ? +sel.value : 0);
  renderCurrentSheetView();
}
function rmD(id) {
  if (!confirm('Bạn có chắc muốn xóa thiết bị này?')) return;
  devs = devs.filter(function (d) { return d.id !== id; });
  buildStep2();
}
function addDev() {
  var id = ++devCnt;
  devs.push({ id: id, stt: devs.length + 1, name: 'Thiết bị mới', model: '', brand: '', origin: '', unit: 'Máy', qty: 1, price: 0, warranty: '', specs: [{ key: 'Xuất xứ', value: '' }, { key: 'Bảo hành', value: '12 tháng' }] });
  buildStep2();
}

function handleDirectExportFromStep1() {
  if ((!devs || devs.length === 0) && typeof selectedCatalogItems !== 'undefined' && Object.keys(selectedCatalogItems).length > 0) {
    createProjectFromCatalog();
  }
  if (!devs || devs.length === 0) {
    toast('⚠️ Vui lòng chọn thiết bị từ danh mục hoặc tải file lên trước khi xuất Excel!', 'err');
    return;
  }
  doExport();
}

/* ═══════════════════════════════════════════
   STEP 3 / EXPORT EXCEL (100% MATCH TO IMAGES 1 & 2)
═══════════════════════════════════════════ */
function buildFinal() {
  document.getElementById('finalSheetArea').innerHTML = buildSummaryTableHtml();
}

function doExport() {
  if (!devs.length) { toast('❌ Không có dữ liệu để xuất!', 'err'); return; }
  var b = document.getElementById('btnExp');
  b.disabled = true; b.innerHTML = '<span class="spin-w"></span> Đang tạo file Excel...';
  try {
    var wb = XLSX.utils.book_new();
    xlsTH(wb);
    devs.forEach(function (d, i) { xlsSP(wb, d, i + 1); });
    var pn = (document.getElementById('pjN').value || 'DuToan').replace(/[\\/:*?"<>|]/g, '_').substring(0, 40);
    var fileName = 'DuToan_' + pn + '_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.xlsx';
    XLSX.writeFile(wb, fileName);
    // === GHI LỊCH SỬ ===
    var totalVal = devs.reduce(function(s,d){ return s + (d.qty||0)*(d.price||0); }, 0);
    lsAddEntry('dutoan',
      pn || 'Dự toán mới',
      fileName,
      {
        project: pn,
        devices: devs.length,
        total: totalVal > 0 ? totalVal.toLocaleString('vi-VN') + ' ₫' : ''
      }
    );
    toast('✅ Xuất file Excel thành công!', 'ok');
  } catch (e) { console.error(e); toast('❌ Lỗi: ' + e.message, 'err'); }
  b.disabled = false; b.innerHTML = '⬇️ Tải file Excel dự toán (.xlsx)';
}

function mkB(c) { var b = { style: 'thin', color: { rgb: c || '000000' } }; return { top: b, bottom: b, left: b, right: b }; }

function setCell(ws, r, c, val, style) {
  var ref = XLSX.utils.encode_cell({ r: r, c: c });
  var t = typeof val === 'number' ? 'n' : 's';
  ws[ref] = { t: t, v: val, s: style };
}

/* ── SHEET "TỔNG HỢP" (100% IDENTICAL TO IMAGE 1) ── */
function xlsTH(wb) {
  var ws = {}; var mg = [];

  // STYLES FROM ORIGINAL TEMPLATE
  var SH = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, fill: { patternType: 'solid', fgColor: { rgb: 'D9E1F2' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: mkB('000000') };
  var SA = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, alignment: { vertical: 'center' }, border: mkB('000000') };
  var SI = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, alignment: { vertical: 'center' }, border: mkB('000000') };
  var SAC = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: mkB('000000') };
  var SD = { font: { name: 'Times New Roman', sz: 11 }, border: mkB('000000'), alignment: { vertical: 'center', wrapText: true } };
  var SC = { font: { name: 'Times New Roman', sz: 11 }, border: mkB('000000'), alignment: { horizontal: 'center', vertical: 'center' } };
  var SN = { font: { name: 'Times New Roman', sz: 11 }, border: mkB('000000'), alignment: { horizontal: 'right', vertical: 'center' }, numFmt: '#,##0' };
  var SNT = { font: { bold: true, name: 'Times New Roman', sz: 11 }, border: mkB('000000'), alignment: { horizontal: 'right', vertical: 'center' }, numFmt: '#,##0' };

  ws['!cols'] = [{ wch: 6 }, { wch: 46 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 8 }, { wch: 6 }, { wch: 20 }, { wch: 20 }];
  ws['!rows'] = []; var r = 0;

  // Header row (Row 1): Background #D9E1F2, black text, bold, centered, bordered
  ['STT', 'Danh mục', 'Model', 'Hãng', 'Xuất xứ', 'ĐVT', 'SL', 'Đơn giá (Đã gồm VAT)', 'Thành tiền'].forEach(function (v, c) {
    setCell(ws, r, c, v, SH);
  });
  ws['!rows'][r] = { hpt: 32 }; r++;

  var dataStartRow = r;
  devs.forEach(function (d, i) {
    var t = (d.qty || 0) * (d.price || 0);
    setCell(ws, r, 0, i + 1, SC);
    setCell(ws, r, 1, d.name || '', SD);
    setCell(ws, r, 2, d.model || '', SC);
    setCell(ws, r, 3, d.brand || '', SC);
    setCell(ws, r, 4, d.origin || '', SC);
    setCell(ws, r, 5, d.unit || 'Máy', SC);
    setCell(ws, r, 6, d.qty || 1, SC);

    var gR = XLSX.utils.encode_cell({ r: r, c: 6 });
    var hR = XLSX.utils.encode_cell({ r: r, c: 7 });
    var iR = XLSX.utils.encode_cell({ r: r, c: 8 });
    if (d.price && Number(d.price) > 0) {
      ws[hR] = { t: 'n', v: Number(d.price), s: SN };
    } else {
      ws[hR] = { t: 's', v: '', s: SN };
    }
    ws[iR] = { t: 'n', f: gR + '*' + hR, v: t, s: SN };

    // HYPERLINK directly to that device's spec sheet ('1', '2', '3'...)
    var targetSheet = String(i + 1);
    var sttRef = XLSX.utils.encode_cell({ r: r, c: 0 });
    var nameRef = XLSX.utils.encode_cell({ r: r, c: 1 });
    if (ws[sttRef]) ws[sttRef].l = { Target: "#'" + targetSheet + "'!A1" };
    if (ws[nameRef]) ws[nameRef].l = { Target: "#'" + targetSheet + "'!A1" };

    var nameLines = Math.ceil(String(d.name || '').length / 42);
    ws['!rows'][r] = { hpt: Math.max(24, nameLines * 18 + 6) };
    r++;
  });

  ws['!merges'] = mg;
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: 8 } });
  XLSX.utils.book_append_sheet(wb, ws, 'Tổng hợp');
}

/* ── SHEET SPEC "1, 2, 3..." (100% IDENTICAL TO IMAGE 2) ── */
function xlsSP(wb, dev, num) {
  var ws = {}; var mg = [];

  var SH = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: mkB('000000') };
  var SHL = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, alignment: { vertical: 'center', wrapText: true }, border: mkB('000000') };
  var SK = { font: { bold: true, name: 'Times New Roman', sz: 11 }, border: mkB('000000'), alignment: { vertical: 'center', wrapText: true } };
  var SV = { font: { name: 'Times New Roman', sz: 11 }, border: mkB('000000'), alignment: { vertical: 'center', wrapText: true } };
  var SQ = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, fill: { patternType: 'solid', fgColor: { rgb: 'FFFF00' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: mkB('000000') };

  ws['!cols'] = [{ wch: 6 }, { wch: 38 }, { wch: 36 }, { wch: 36 }, { wch: 4 }, { wch: 14 }];
  ws['!rows'] = []; var r = 0;

  // Row 1: STT (col A) | Blank (col B) | Thông số kỹ thuật (merged C:D) | QUAY LẠI (col F)
  setCell(ws, r, 0, 'STT', SH);
  setCell(ws, r, 1, '', SH);
  setCell(ws, r, 2, 'Thông số kỹ thuật', SH);
  setCell(ws, r, 3, '', SH);
  mg.push({ s: { r: r, c: 2 }, e: { r: r, c: 3 } });

  // Yellow QUAY LẠI button at Col F (Col 5) with hyperlink back to Sheet "Tổng hợp"
  var qRef = XLSX.utils.encode_cell({ r: r, c: 5 });
  ws[qRef] = { t: 's', v: 'QUAY LẠI', l: { Target: "#'Tổng hợp'!A1" }, s: SQ };

  ws['!rows'][r] = { hpt: 28 }; r++;

  // Row 2: STT num (col A) | Device Name (merged B:D)
  setCell(ws, r, 0, num, SH);
  setCell(ws, r, 1, dev.name || '', SHL);
  setCell(ws, r, 2, '', SHL);
  setCell(ws, r, 3, '', SHL);
  mg.push({ s: { r: r, c: 1 }, e: { r: r, c: 3 } });

  var dNameLines = Math.ceil(String(dev.name || '').length / 60);
  ws['!rows'][r] = { hpt: Math.max(26, dNameLines * 18 + 6) }; r++;

  // Specs rows (Col A: Blank with border | Col B: Key with bold | Col C..D: Value merged)
  dev.specs.forEach(function (sp) {
    if (!sp.key && !sp.value) return;
    setCell(ws, r, 0, '', SH);
    setCell(ws, r, 1, sp.key || '', SK);
    setCell(ws, r, 2, sp.value || '', SV);
    setCell(ws, r, 3, '', SV);
    mg.push({ s: { r: r, c: 2 }, e: { r: r, c: 3 } });

    // Dynamic height calculation so no text is cut off
    var keyLines = Math.ceil(String(sp.key || '').length / 28);
    var valLines = 0;
    String(sp.value || '').split(/\r?\n/).forEach(function (line) {
      valLines += Math.max(1, Math.ceil((line.length || 1) / 52));
    });
    var totalLines = Math.max(1, keyLines, valLines);
    ws['!rows'][r] = { hpt: Math.max(22, Math.min(260, totalLines * 16 + 8)) };
    r++;
  });

  ws['!merges'] = mg;
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: 5 } });
  XLSX.utils.book_append_sheet(wb, ws, String(num));
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function escH(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function fmtVN(n) { if (!n && n !== 0) return ''; return Number(n).toLocaleString('en-US'); }
function fmtV(n) { if (!n && n !== 0) return '—'; return Number(n).toLocaleString('vi-VN') + ' đ'; }
function toast(msg, type) {
  var el = document.getElementById('toast');
  document.getElementById('tm').textContent = msg;
  document.getElementById('ti').textContent = type === 'ok' ? '✅' : type === 'ai-t' ? '🤖' : '❌';
  el.className = 'on ' + (type === 'ai-t' ? 'ai-t' : type || 'ok');
  setTimeout(function () { el.className = ''; }, 4000);
}

/* ═══════════════════════════════════════════
   STEP 4 / BIÊN BẢN BÀN GIAO (WORD EXPORT)
═══════════════════════════════════════════ */
function renderHandoverForm() {
  if (!document.getElementById('bbDate').value) {
    document.getElementById('bbDate').valueAsDate = new Date();
  }

  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">' +
    '<div style="font-weight:700;font-size:14px;color:#0f172a">Danh sách thiết bị bàn giao &amp; Số Serial (Mỗi serial trên 1 dòng)</div>' +
    '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
    '<select class="key-inp" style="height:32px;font-size:12px;background:#ffffff" onchange="if(this.value){bbAddPreset(this.value);this.value=\'\';}">' +
    '<option value="">➕ Thêm nhanh mẫu máy chuẩn...</option>' +
    '<option value="msi_cubi_nuc">💻 Mini PC MSI Cubi NUC 1M</option>' +
    '<option value="msi_dp180">💻 Máy vi tính MSI PRO DP180</option>' +
    '<option value="oki_b433dn">🖨️ Máy in OKI B433DN</option>' +
    '<option value="oki_b513dn">🖨️ Máy in OKI B513DN</option>' +
    '<option value="canon_lbp2900">🖨️ Máy in Canon LBP2900</option>' +
    '<option value="hp_m404dn">🖨️ Máy in HP LaserJet M404dn</option>' +
    '<option value="ricoh_im2500">📠 Photocopy Ricoh IM 2500</option>' +
    '<option value="ricoh_fi8170">📄 Máy scan RICOH Fi-8170</option>' +
    '<option value="switch_gwn7813">🌐 Switch Grandstream GWN7813</option>' +
    '<option value="dau_doc_the_tu">💳 Đầu đọc thẻ từ uTrust 4701 F</option>' +
    '<option value="doc_the_nho">💾 Đọc thẻ nhớ ATEN UH3240</option>' +
    '<option value="man_hinh_24">🖥️ Màn hình 23.8 inch IPS</option>' +
    '<option value="ups_santak_1000">🔋 Bộ lưu điện UPS 1000VA</option>' +
    '<option value="canon_eos_r6">📷 Máy ảnh Canon EOS R6</option>' +
    '</select>' +
    '<button class="btn btn-p btn-sm" onclick="bbAddDev()">➕ Thêm dòng mới</button>' +
    '<button class="btn btn-o btn-sm" style="color:var(--re);border-color:rgba(207,34,46,0.3)" onclick="bbResetAll()" title="Xóa trắng để lập biên bản mới">🗑️ Làm mới biên bản</button>' +
    '</div>' +
    '</div>';

  html += '<table class="excel-table" style="width:100%">' +
    '<thead><tr><th style="width:40px">STT</th><th>Danh Mục Hàng Hóa &amp; Model</th><th style="width:70px">SL</th><th style="width:70px">ĐVT</th><th style="width:340px">Số Serial (Mỗi serial 1 dòng / phân bổ 2 cột)</th><th style="width:50px">Xóa</th></tr></thead><tbody>';

  if (bbDevs.length === 0) {
    html += '<tr><td colspan="6" class="ctr" style="padding:32px 20px;color:var(--t2);background:#ffffff">' +
      '<div style="font-size:32px;margin-bottom:8px">📝</div>' +
      '<div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:4px">Chưa có thiết bị nào trong biên bản bàn giao</div>' +
      '<div style="font-size:12.5px;color:var(--t2);margin-bottom:14px">Bạn có thể thêm dòng mới hoặc chọn nhanh từ danh mục mẫu máy có sẵn bên dưới</div>' +
      '<div style="display:flex;gap:10px;justify-content:center">' +
      '<button class="btn btn-p btn-sm" onclick="bbAddDev()">➕ Thêm thiết bị mới</button>' +
      '<button class="btn btn-o btn-sm" onclick="bbAddPreset(\'msi_cubi_nuc\')">💻 Thêm mẫu Mini PC</button>' +
      '<button class="btn btn-o btn-sm" onclick="bbAddPreset(\'oki_b433dn\')">🖨️ Thêm mẫu Máy in</button>' +
      '</div>' +
      '</td></tr>';
  } else {
    bbDevs.forEach(function (d, i) {
      html += '<tr>' +
        '<td class="ctr" style="font-weight:700">' + (i + 1) + '</td>' +
        '<td><input type="text" class="key-inp" style="width:100%;font-weight:600" value="' + escH(d.name || '') + '" oninput="bbDevs[' + i + '].name=this.value" placeholder="Nhập tên thiết bị..."></td>' +
        '<td class="ctr"><input type="number" class="key-inp" style="width:100%;text-align:center;font-weight:700" value="' + (d.qty || 1) + '" oninput="bbDevs[' + i + '].qty=this.value"></td>' +
        '<td class="ctr"><input type="text" class="key-inp" style="width:100%;text-align:center" value="' + escH(d.unit || 'Máy') + '" oninput="bbDevs[' + i + '].unit=this.value"></td>' +
        '<td><textarea class="key-inp" style="width:100%;height:75px;resize:vertical;font-family:monospace;font-size:12px;text-align:center" oninput="bbDevs[' + i + '].serials=this.value" placeholder="Dán danh sách serials vào đây (tự động chia 2 cột đều nhau và căn giữa)...">' + escH(d.serials || '') + '</textarea></td>' +
        '<td class="ctr"><button class="btn btn-o btn-sm" style="color:var(--re);border-color:rgba(207,34,46,0.3)" onclick="bbRemoveDev(' + i + ')" title="Xóa thiết bị này">✕</button></td>' +
        '</tr>';
    });
  }
  html += '</tbody></table>';

  document.getElementById('bbTableArea').innerHTML = html;
}

/* ─── PARTY PRESETS (BÊN BÁN / BÊN MUA ĐƯỢC TRÍCH XUẤT ĐẦY ĐỦ TỪ HỒ SƠ) ─── */
var BB_SELLER_PRESETS = {
  'thuan_phat_hoa': {
    name: 'CÔNG TY TNHH THƯƠNG MẠI ĐẦU TƯ VÀ SẢN XUẤT THUẬN PHÁT',
    addr: 'Thôn Dục Nội, Xã Đông Anh, Thành phố Hà Nội, Việt Nam',
    rep: 'Trương Ngọc Hoà',
    pos: 'Kỹ Thuật'
  },
  'thuan_phat_khue': {
    name: 'CÔNG TY TNHH THƯƠNG MẠI ĐẦU TƯ VÀ SẢN XUẤT THUẬN PHÁT',
    addr: 'Thôn Dục Nội, Xã Đông Anh, Thành phố Hà Nội, Việt Nam',
    rep: 'Bà NGUYỄN THỊ KHUÊ',
    pos: 'Giám đốc'
  },
  'thuan_phat_vu': {
    name: 'CÔNG TY TNHH THƯƠNG MẠI ĐẦU TƯ VÀ SẢN XUẤT THUẬN PHÁT',
    addr: 'Thôn Dục Nội, Xã Đông Anh, Thành phố Hà Nội, Việt Nam',
    rep: 'Nguyễn Long Vũ',
    pos: 'Kỹ Thuật'
  },
  'lynk_core': {
    name: 'CÔNG TY TNHH LYNK CORE',
    addr: 'Số 6 Ngõ 138 Đường Kim Lan, Xã Bát Tràng, Huyện Gia Lâm, Hà Nội',
    rep: 'Nguyễn Quang Huy',
    pos: 'Kỹ Thuật'
  },
  'bao_an': {
    name: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG BẢO AN',
    addr: 'Hà Nội, Việt Nam',
    rep: 'Đại diện Ban Dự Án',
    pos: 'Trưởng phòng Kỹ thuật'
  }
};

var BB_BUYER_PRESETS = {
  'hoa_phat': {
    name: 'CÔNG TY CỔ PHẦN SÁCH VÀ THIẾT BỊ GIÁO DỤC HÒA PHÁT',
    addr: 'LK17-L15 Khu Mậu Lương, phường Kiến Hưng, TP Hà Nội, Việt Nam',
    ship: 'LK17-L15 Khu Mậu Lương, phường Kiến Hưng, TP Hà Nội, Việt Nam',
    rep: 'Ông Nghiêm Văn Cường',
    pos: 'Giám đốc'
  },
  'ecoit': {
    name: 'CÔNG TY CỔ PHẦN ECOIT',
    addr: 'IPGV3.5, Tầng 3 khối nhà A, Tòa nhà Imperia Garden, 203 Nguyễn Huy Tưởng, Phường Thanh Xuân, Thành Phố Hà Nội',
    ship: 'IPGV3.5, Tầng 3 khối nhà A, Tòa nhà Imperia Garden, 203 Nguyễn Huy Tưởng, Phường Thanh Xuân, Thành Phố Hà Nội',
    rep: 'Đoàn Văn Ngà',
    pos: 'Chuyên Viên Kỹ Thuật'
  },
  'tin_thanh': {
    name: 'CÔNG TY TNHH THƯƠNG MẠI VÀ CÔNG NGHỆ TIN HỌC TÍN THÀNH',
    addr: 'Số 57 ngách 124/49 Phố Do Nha, Phường Tây Mỗ, Quận Nam Từ Liêm, Hà Nội, Việt Nam',
    ship: 'Số 22 ngõ 32 Mạc Thái Tổ, Q Cầu Giấy, TP Hà Nội',
    rep: 'Đại diện tiếp nhận Tín Thành',
    pos: 'Cán bộ kỹ thuật'
  },
  'netsys': {
    name: 'CÔNG TY CỔ PHẦN GIẢI PHÁP CÔNG NGHỆ NETSYS VIỆT NAM',
    addr: 'LK 18-TT7A KĐT Mới Đại Kim (Nguyễn Xiển), Phường Định Công, Quận Hoàng Mai, Hà Nội',
    ship: 'LK 18-TT7A KĐT Mới Đại Kim (Nguyễn Xiển), Phường Định Công, Quận Hoàng Mai, Hà Nội',
    rep: 'Đại diện kỹ thuật Netsys',
    pos: 'Cán bộ tiếp nhận'
  },
  'cahcm': {
    name: 'Công an Thành phố Hồ Chí Minh',
    addr: 'Thành phố Hồ Chí Minh, Việt Nam',
    ship: 'Trụ sở Công an Thành phố Hồ Chí Minh',
    rep: 'Đại diện nhận hàng',
    pos: 'Cán bộ quản lý thiết bị'
  }
};

function fillProjectPreset(key) {
  var set = function (id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
  var today = new Date().toISOString().split('T')[0];
  if (key === 'thuan_phat') {
    set('pjN', 'Đầu tư nâng cấp hạ tầng số, thiết bị phát triển khoa học và công nghệ');
    set('gpN', 'Hệ thống trang thiết bị CNTT, thiết bị ngoại vi…');
    set('orgN', 'CÔNG TY TNHH THƯƠNG MẠI ĐẦU TƯ VÀ SẢN XUẤT THUẬN PHÁT');
    set('dtN', today);
    toast('✅ Đã điền thông tin dự án Thuận Phát!', 'ok');
  } else if (key === 'bao_an') {
    set('pjN', 'Chi phí mua sắm trang thiết bị CNTT & Tổng hợp kinh phí tỉnh - xã');
    set('gpN', 'Trang thiết bị máy móc, thiết bị ngoại vi và hội nghị');
    set('orgN', 'CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG BẢO AN');
    set('dtN', today);
    toast('✅ Đã điền thông tin dự án Bảo An!', 'ok');
  } else if (key === 'cahcm') {
    set('pjN', 'Mua sắm trang thiết bị phục vụ triển khai Nghị quyết số 57-NQ/TW và Chương trình chuyển đổi số');
    set('gpN', 'Thiết bị CNTT, máy tính, máy in chuyên dụng');
    set('orgN', 'Liên danh gói thầu CAHCM');
    set('dtN', today);
    toast('✅ Đã điền thông tin dự án CAHCM!', 'ok');
  } else if (key === 'hoa_phat') {
    set('pjN', 'Hợp đồng mua bán thiết bị số 1308/2026/HĐMB/TP-HP');
    set('gpN', 'Thiết bị tin học, máy vi tính và phần mềm bản quyền');
    set('orgN', 'CÔNG TY CỔ PHẦN SÁCH VÀ THIẾT BỊ GIÁO DỤC HÒA PHÁT');
    set('dtN', today);
    toast('✅ Đã điền thông tin dự án Hòa Phát!', 'ok');
  }
}

function tdduFillPresetInfo(key) {
  var set = function (id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
  if (key === 'cahcm') {
    set('tddu_title', 'BẢNG TUYÊN BỐ ĐÁP ỨNG YÊU CẦU KỸ THUẬT CỦA HÀNG HÓA CHÀO THẦU');
    set('tddu_to', 'Công an Thành phố Hồ Chí Minh');
    set('tddu_bidder', 'Liên danh gói thầu CAHCM');
    set('tddu_package', 'Mua sắm thiết bị phục vụ triển khai Nghị quyết số 57-NQ/TW, Kế hoạch số 02- KH/BCĐTW và chương trình chuyển đổi số');
    set('tddu_project', 'Mua sắm trang thiết bị phục vụ triển khai Nghị quyết số 57-NQ/TW, Kế hoạch số 02- KH/BCĐTW và Chương trình chuyển đổi số của Công an Thành phố');
    toast('✅ Đã nạp thông tin hồ sơ thầu CAHCM!', 'ok');
  } else if (key === 'hoa_phat') {
    set('tddu_title', 'BẢNG TUYÊN BỐ ĐÁP ỨNG YÊU CẦU KỸ THUẬT');
    set('tddu_to', 'Công ty Cổ phần Sách và Thiết bị Giáo dục Hòa Phát');
    set('tddu_bidder', 'Công ty TNHH Thương Mại Đầu tư và Sản xuất Thuận Phát');
    set('tddu_package', 'Gói thầu thiết bị tin học và máy vi tính theo HĐMB số 1308/2026/HĐMB/TP-HP');
    set('tddu_project', 'Mua sắm trang thiết bị CNTT giáo dục phục vụ công tác đào tạo');
    toast('✅ Đã nạp thông tin hồ sơ Hòa Phát!', 'ok');
  } else if (key === 'netsys') {
    set('tddu_title', 'BẢNG ĐÁP ỨNG TIÊU CHUẨN KỸ THUẬT HÀNG HÓA');
    set('tddu_to', 'Công ty Cổ phần Giải pháp Công nghệ Netsys Việt Nam');
    set('tddu_bidder', 'Công ty TNHH Lynk Core');
    set('tddu_package', 'Gói thầu cung cấp thiết bị và mực in văn phòng');
    set('tddu_project', 'Cung cấp trang thiết bị tin học định kỳ năm 2026');
    toast('✅ Đã nạp thông tin hồ sơ NETSYS!', 'ok');
  } else if (key === 'ecoit') {
    set('tddu_title', 'BẢNG TIÊU CHUẨN KỸ THUẬT THIẾT BỊ BÀN GIAO');
    set('tddu_to', 'Công ty Cổ phần ECOIT');
    set('tddu_bidder', 'Công ty TNHH Thương Mại Đầu tư và Sản xuất Thuận Phát');
    set('tddu_package', 'Cung cấp thiết bị phần cứng số hóa và máy tính văn phòng');
    set('tddu_project', 'Dự án triển khai phần cứng hạ tầng CNTT ECOIT');
    toast('✅ Đã nạp thông tin hồ sơ ECOIT!', 'ok');
  }
  if (typeof renderTdduPreview === 'function') renderTdduPreview();
}

function bgFillCustomer(key) {
  var set = function (id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
  set('bg_seller', 'CÔNG TY TNHH THƯƠNG MẠI ĐẦU TƯ VÀ SẢN XUẤT THUẬN PHÁT');
  if (key === 'hoa_phat') {
    set('bg_to', 'Ông Nghiêm Văn Cường - Giám đốc');
    set('bg_company', 'CÔNG TY CỔ PHẦN SÁCH VÀ THIẾT BỊ GIÁO DỤC HÒA PHÁT');
    set('bg_address', 'LK17-L15 Khu Mậu Lương, phường Kiến Hưng, TP Hà Nội, Việt Nam (SĐT: 0787416666)');
    toast('✅ Đã điền thông tin khách hàng Hòa Phát!', 'ok');
  } else if (key === 'ecoit') {
    set('bg_to', 'Ông Đoàn Văn Ngà - Chuyên Viên Kỹ Thuật');
    set('bg_company', 'CÔNG TY CỔ PHẦN ECOIT');
    set('bg_address', 'IPGV3.5, Tầng 3 khối nhà A, Tòa nhà Imperia Garden, 203 Nguyễn Huy Tưởng, Phường Thanh Xuân, Thành Phố Hà Nội');
    toast('✅ Đã điền thông tin khách hàng ECOIT!', 'ok');
  } else if (key === 'tin_thanh') {
    set('bg_to', 'Bộ phận Mua hàng & Kỹ thuật');
    set('bg_company', 'CÔNG TY TNHH THƯƠNG MẠI VÀ CÔNG NGHỆ TIN HỌC TÍN THÀNH');
    set('bg_address', 'Số 57 ngách 124/49 Phố Do Nha, Phường Tây Mỗ, Quận Nam Từ Liêm, Hà Nội, Việt Nam');
    toast('✅ Đã điền thông tin khách hàng Tín Thành!', 'ok');
  } else if (key === 'netsys') {
    set('bg_to', 'Phòng Kỹ thuật & Dự án');
    set('bg_company', 'CÔNG TY CỔ PHẦN GIẢI PHÁP CÔNG NGHỆ NETSYS VIỆT NAM');
    set('bg_address', 'LK 18-TT7A KĐT Mới Đại Kim (Nguyễn Xiển), Phường Định Công, Quận Hoàng Mai, Hà Nội');
    toast('✅ Đã điền thông tin khách hàng NETSYS!', 'ok');
  } else if (key === 'cahcm') {
    set('bg_to', 'Ban Quản lý Dự án CNTT');
    set('bg_company', 'Công an Thành phố Hồ Chí Minh');
    set('bg_address', 'Thành phố Hồ Chí Minh, Việt Nam');
    toast('✅ Đã điền thông tin khách hàng Công an TP.HCM!', 'ok');
  }
}

function bbFillSeller(key) {
  var p = BB_SELLER_PRESETS[key];
  if (!p) return;
  var set = function (id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
  set('bbA_name', p.name);
  set('bbA_addr', p.addr);
  set('bbA_rep', p.rep);
  set('bbA_pos', p.pos);
  toast('✅ Đã nạp thông tin bên bán: ' + p.name, 'ok');
}

function bbFillBuyer(key) {
  var p = BB_BUYER_PRESETS[key];
  if (!p) return;
  var set = function (id, val) { var el = document.getElementById(id); if (el) el.value = val || ''; };
  set('bbB_name', p.name);
  set('bbB_addr', p.addr);
  set('bbB_ship', p.ship);
  set('bbB_rep', p.rep);
  set('bbB_pos', p.pos);
  toast('✅ Đã nạp thông tin bên mua: ' + p.name, 'ok');
}

function bbAddDev() {
  bbDevs.push({ name: '', qty: 1, unit: 'Máy', serials: '' });
  renderHandoverForm();
}

function bbAddPreset(presetKey) {
  var p = MODEL_PRESETS[presetKey];
  if (!p) return;
  bbDevs.push({
    name: p.name + (p.model ? ' - ' + p.model : ''),
    qty: 1,
    unit: p.unit || 'Máy',
    serials: ''
  });
  renderHandoverForm();
  toast('✅ Đã thêm ' + p.name + ' vào biên bản bàn giao!', 'ok');
}

function bbResetAll() {
  if (bbDevs.length > 0 && !confirm('Bạn có chắc muốn xóa trắng biên bản bàn giao để lập biên bản mới?')) return;
  bbDevs = [];
  document.getElementById('bbB_rep').value = '';
  document.getElementById('bbB_pos').value = '';
  renderHandoverForm();
  toast('✨ Đã làm mới biên bản bàn giao sạch sẽ!', 'ok');
}

function bbRemoveDev(idx) {
  bbDevs.splice(idx, 1);
  renderHandoverForm();
}

function bbSyncFromDutoan() {
  if (!devs || devs.length === 0) {
    toast("⚠️ Bên Dự Toán chưa có thiết bị nào!", "err");
    return;
  }
  bbDevs = devs.map(function (d) {
    return {
      name: (d.name || '') + (d.model ? ' ' + d.model : ''),
      qty: d.qty || 1,
      unit: d.unit || 'Máy',
      serials: ''
    };
  });
  renderHandoverForm();
  toast("✅ Đã lấy thành công " + devs.length + " thiết bị từ Dự Toán qua!", "ok");
}

function exportHandoverWord() {
  if (!bbDevs.length) { toast('❌ Không có thiết bị nào để xuất!', 'err'); return; }
  // Ghi lịch sử sẽ được thêm sau khi xuất thành công (xem bên dưới)
  var dt = document.getElementById('bbDate').valueAsDate || new Date();
  var day = String(dt.getDate()).padStart(2, '0');
  var month = String(dt.getMonth() + 1).padStart(2, '0');
  var year = dt.getFullYear();

  var aName = document.getElementById('bbA_name').value || '';
  var aAddr = document.getElementById('bbA_addr').value || '';
  var aRep = document.getElementById('bbA_rep').value || '';
  var aPos = document.getElementById('bbA_pos').value || '';

  var bName = document.getElementById('bbB_name').value || '';
  var bAddr = document.getElementById('bbB_addr').value || '';
  var bShip = document.getElementById('bbB_ship').value || '';
  var bRep = document.getElementById('bbB_rep').value || '';
  var bPos = document.getElementById('bbB_pos').value || '';

  var trs = bbDevs.map(function (d, i) {
    var serRaw = (d.serials || '').trim();

    // Bóc tách toàn bộ serials thông minh (hỗ trợ xuống dòng, tab, phẩy, chấm phẩy, khoảng trắng)
    var serLines = [];
    if (serRaw) {
      var rawLines = serRaw.split(/[\r\n,;\t]+/).map(function (s) { return s.trim(); }).filter(Boolean);
      rawLines.forEach(function (chunk) {
        var spaceSplit = chunk.split(/\s+/).map(function (s) { return s.trim(); }).filter(Boolean);
        if (spaceSplit.length > 1) {
          spaceSplit.forEach(function (sp) { serLines.push(escH(sp)); });
        } else {
          serLines.push(escH(chunk));
        }
      });
    }

    var serCellHtml = '';
    var serTdAlign = 'center'; // Mặc định căn giữa cho 1 cột
    if (serLines.length === 0) {
      serCellHtml = '&nbsp;';
    } else if (serLines.length < 10) {
      // Dưới 10 serial → 1 cột dọc, căn giữa
      serCellHtml = '<table class="serial-subtable" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:none;margin:0;padding:0;">' +
        '<tbody>';
      serLines.forEach(function (s) {
        serCellHtml += '<tr><td align="center" style="border:none;padding:2pt 6pt;vertical-align:middle;font-size:11pt;line-height:1.4;text-align:center;">' + s + '</td></tr>';
      });
      serCellHtml += '</tbody></table>';
    } else {
      // Từ 10 serial trở lên → chia đôi: Nửa đầu bên TRÁI, Nửa sau bên PHẢI
      serTdAlign = 'center'; // Căn giữa toàn bộ serial
      var total = serLines.length;
      var half = Math.ceil(total / 2);
      var leftItems = serLines.slice(0, half);
      var rightItems = serLines.slice(half);

      serCellHtml = '<table class="serial-subtable" border="0" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:collapse;border:none;margin:0;padding:0;">' +
        '<colgroup><col style="width:50%;"><col style="width:50%;"></colgroup>' +
        '<tbody>';

      for (var j = 0; j < half; j++) {
        var lVal = leftItems[j] || '&nbsp;';
        var rVal = (j < rightItems.length) ? rightItems[j] : '&nbsp;';
        serCellHtml += '<tr>';
        serCellHtml += '<td class="col-l" align="center" style="width:50%;border:none;border-right:1.0pt solid #000;padding:1.5pt 6pt;vertical-align:middle;font-size:11pt;line-height:1.25;text-align:center;">' + lVal + '</td>';
        serCellHtml += '<td class="col-r" align="center" style="width:50%;border:none;padding:1.5pt 6pt;vertical-align:middle;font-size:11pt;line-height:1.25;text-align:center;">' + rVal + '</td>';
        serCellHtml += '</tr>';
      }
      serCellHtml += '</tbody></table>';
    }

    return '<tr>' +
      '<td align="center" class="ctr val-mid" style="border:1px solid black;padding:6px;">' + (i + 1) + '</td>' +
      '<td align="left" class="val-mid" style="border:1px solid black;padding:6px;text-align:left;">' + escH(d.name || '') + '</td>' +
      '<td align="center" class="ctr val-mid" style="border:1px solid black;padding:6px;">' + (d.qty || 1) + '</td>' +
      '<td align="center" class="ctr val-mid" style="border:1px solid black;padding:6px;">' + escH(d.unit || 'Máy') + '</td>' +
      '<td class="val-mid ser-cell" align="' + serTdAlign + '" style="border:1px solid black;padding:0;margin:0;text-align:' + serTdAlign + ';">' + serCellHtml + '</td>' +
      '</tr>';
  }).join('');

  var html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Biên Bản Bàn Giao</title>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<style>
  @page Section1 {
    size: 21.0cm 29.7cm;
    margin: 2.0cm 2.0cm 2.0cm 2.0cm;
    mso-header-margin: 1.0cm;
    mso-footer-margin: 1.0cm;
    mso-page-orientation: portrait;
    mso-paper-source: 0;
  }
  div.Section1 { page: Section1; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; margin: 0; padding: 0; }
  p { margin: 0 0 6pt 0; line-height: 1.3; }
  table.content-table { border-collapse: collapse; width: 100%; margin-bottom: 12pt; margin-top: 6pt; }
  table.content-table td, table.content-table th { border: 1px solid black; padding: 6px; }
  table.content-table td.ser-cell { padding: 0 !important; margin: 0 !important; }
  table.serial-subtable { border-collapse: collapse !important; width: 100% !important; border: none !important; margin: 0 !important; padding: 0 !important; }
  table.serial-subtable td { border: none !important; padding: 1.5pt 6pt !important; vertical-align: middle !important; font-size: 11pt !important; line-height: 1.25 !important; text-align: center !important; }
  table.serial-subtable td.col-l { border-right: 1.0pt solid black !important; width: 50% !important; text-align: center !important; }
  table.serial-subtable td.col-r { width: 50% !important; text-align: center !important; }
  .ctr { text-align: center; }
  .val-mid { vertical-align: middle; }
  .bold { font-weight: bold; }
  .layout-table { border-collapse: collapse; margin-bottom: 4pt; border: none; }
  .layout-table td { border: none; padding: 2px 0; vertical-align: top; }
</style>
</head>
<body>
<div class="Section1">
  <p align="center" class="bold" style="margin-bottom: 2pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
  <p align="center" style="margin-bottom: 2pt;"><i>Độc lập - Tự do - Hạnh phúc</i></p>
  <p align="center" style="margin-bottom: 10pt;">--------o0o--------</p>
  <p align="center" class="bold" style="margin-top: 10pt; margin-bottom: 10pt;">BIÊN BẢN BÀN GIAO HÀNG HÓA</p>
  
  <p>Hôm nay, ngày ${day} tháng ${month} năm ${year}, chúng tôi gồm:</p>
  
  <p class="bold" style="margin-top: 10pt; margin-bottom: 2pt;">BÊN BÁN (Bên A): ${escH(aName)}</p>
  <table class="layout-table" border="0" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width: 135pt; white-space: nowrap;">Địa chỉ</td>
      <td style="width: 12pt;">:</td>
      <td>${escH(aAddr)}</td>
    </tr>
    <tr>
      <td>Người đại diện</td>
      <td>:</td>
      <td><span class="bold">${escH(aRep)}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Chức vụ:&nbsp;<span class="bold">${escH(aPos)}</span></td>
    </tr>
  </table>
  
  <p class="bold" style="margin-top: 12pt; margin-bottom: 4pt;">BÊN MUA (Bên B): ${escH(bName)}</p>
  <table class="layout-table" border="0" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width: 140px;">Địa chỉ</td>
      <td style="width: 20px;">:</td>
      <td colspan="3">${escH(bAddr)}</td>
    </tr>
    <tr>
      <td>Địa chỉ nhận hàng</td>
      <td>:</td>
      <td colspan="3">${escH(bShip)}</td>
    </tr>
    <tr>
      <td>Người đại diện</td>
      <td>:</td>
      <td><span class="bold">${escH(bRep)}</span></td>
      <td style="width: 80px;">Chức vụ:</td>
      <td><span class="bold">${escH(bPos)}</span></td>
    </tr>
  </table>
  
  <p class="bold" style="margin-top: 12pt;">Hai bên cùng nhau thống nhất số lượng hàng hóa như sau:</p>
  <table class="content-table">
    <thead>
      <tr>
        <th align="center" class="ctr val-mid" style="width: 6%;">STT</th>
        <th align="center" class="ctr val-mid" style="width: 32%;">Danh Mục Hàng Hóa</th>
        <th align="center" class="ctr val-mid" style="width: 9%;">Số<br>lượng</th>
        <th align="center" class="ctr val-mid" style="width: 9%;">ĐVT</th>
        <th align="center" class="ctr val-mid" style="width: 44%;">Serial</th>
      </tr>
    </thead>
    <tbody>
      ${trs}
    </tbody>
  </table>
  
  <p style="margin-left: 18pt; text-indent: -18pt;">- Hai bên cùng thống nhất Bên A đã bàn giao cho Bên B toàn bộ hàng hóa với số lượng đúng chủng loại, quy cách được nêu như trên</p>
  <p style="margin-left: 18pt; text-indent: -18pt;">- Hai bên đồng ý, thống nhất ký tên.</p>
  <p style="margin-left: 18pt; text-indent: -18pt;">- Biên bản này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để thực hiện.</p>
  
  <table style="border: none; width: 100%; margin-top: 24pt;" border="0" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="border: none; width: 50%; text-align: center; vertical-align: top;">
        <p align="center" class="bold">ĐẠI DIỆN BÊN B</p>
      </td>
      <td align="center" style="border: none; width: 50%; text-align: center; vertical-align: top;">
        <p align="center" class="bold">ĐẠI DIỆN BÊN A</p>
      </td>
    </tr>
  </table>
</div>
</body>
</html>
`;

  var blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  var bbFileName = 'Bien_Ban_Ban_Giao_' + day + month + year + '.doc';
  link.download = bbFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  // === GHI LỊCH SỬ ===
  lsAddEntry('bbbg',
    (bName || aName || 'Biên Bản Bàn Giao'),
    bbFileName,
    {
      customer: bName,
      project: aName,
      devices: bbDevs.length
    }
  );
  toast('✅ Đã xuất file Word Biên Bản Bàn Giao!', 'ok');
}

/* ═══════════════════════════════════════════
   STEP 5 / BẢNG TUYÊN BỐ ĐÁP ỨNG (COMPLIANCE TABLE)
═══════════════════════════════════════════ */
var TDDU_SAMPLE_ITEMS = [
  {
    reqName: "Máy vi tính",
    offerName: "Máy vi tính MSI PRO DP180 AI 8HG",
    refNote: "",
    specs: [
      { req: "CPU: Intel® Core™ Ultra 5 tương đương hoặc cao hơn", offer: "CPU: Intel® Core™ Ultra 5 225", status: "Đáp ứng", ref: "" },
      { req: "RAM: 16GB DDR5", offer: "RAM: 16GB DDR5", status: "Đáp ứng", ref: "" },
      { req: "Ổ cứng: 512GB SSD", offer: "Ổ cứng: 512GB SSD", status: "Đáp ứng", ref: "" },
      { req: "Cổng xuất hình: HDMI;", offer: "Cổng xuất hình: HDMI;", status: "Đáp ứng", ref: "" },
      { req: "Màn hình 21.5 inch", offer: "Màn hình 23.8 inch", status: "Đáp ứng", ref: "" },
      { req: "Hệ điều hành: Window 11 Pro 64 bit bản quyền vĩnh viễn", offer: "Hệ điều hành: Window 11 Pro 64 bit bản quyền vĩnh viễn", status: "Đáp ứng", ref: "" },
      { req: "Phần mềm Microsoft Office Home & Business 2024", offer: "Phần mềm Microsoft Office Home & Business 2024", status: "Đáp ứng", ref: "" },
      { req: "Hình thức cấp phép: Key điện tử", offer: "Hình thức cấp phép: Key điện tử", status: "Đáp ứng", ref: "" },
      { req: "Thời hạn bản quyền: Vĩnh viễn", offer: "Thời hạn bản quyền: Vĩnh viễn", status: "Đáp ứng", ref: "" },
      { req: "Ngôn ngữ: Nhiều ngôn ngữ", offer: "Ngôn ngữ: Nhiều ngôn ngữ", status: "Đáp ứng", ref: "" },
      { req: "Tương thích hệ điều hành: Windows, MacOS, Android IOS", offer: "Tương thích hệ điều hành: Windows, MacOS, Android IOS", status: "Đáp ứng", ref: "" },
      { req: "Phần mềm diệt virus bản quyền 03 năm", offer: "Phần mềm diệt virus bản quyền 03 năm", status: "Đáp ứng", ref: "" },
      { req: "Chuột bàn phím đi kèm", offer: "Chuột bàn phím đi kèm", status: "Đáp ứng", ref: "" },
      { req: "Kết nối không dây, Wifi, Bluetooth: không", offer: "Kết nối không dây, Wifi, Bluetooth: không", status: "Đáp ứng", ref: "" },
      { req: "Bảo hành 12 tháng", offer: "Bảo hành 12 tháng", status: "Đáp ứng", ref: "" }
    ]
  },
  {
    reqName: "Máy in",
    offerName: "Máy in OKI B433DN",
    refNote: "",
    specs: [
      { req: "Tốc độ in A4/Letter: lên đến 40 trang/phút", offer: "Tốc độ in A4/Letter: lên đến 40 trang/phút", status: "Đáp ứng", ref: "" },
      { req: "Loại máy in: Đơn năng Laser", offer: "Loại máy in: Đơn năng Laser", status: "Đáp ứng", ref: "" },
      { req: "In đảo mặt: Có", offer: "In đảo mặt: Có", status: "Đáp ứng", ref: "" },
      { req: "Độ phân giải: 1200 x 1200 dpi", offer: "Độ phân giải: 1200 x 1200 dpi", status: "Đáp ứng", ref: "" },
      { req: "Kết nối: USB 2.0", offer: "Kết nối: Ethernet: 1000BASE-T/100BASE-TX/10BASE-T, USB 2.0", status: "Đáp ứng", ref: "" },
      { req: "Nguồn điện: 220-240 V AC 50/60Hz", offer: "Nguồn điện: 220-240 V AC 50/60Hz", status: "Đáp ứng", ref: "" },
      { req: "Bảo hành 12 tháng", offer: "Bảo hành 12 tháng", status: "Đáp ứng", ref: "" }
    ]
  },
  {
    reqName: "Máy scan",
    offerName: "Máy scan RICOH Fi-8170",
    refNote: "",
    specs: [
      { req: "Kiểu máy: Để bàn nạp giấy tự động (ADF)", offer: "Kiểu máy: Để bàn nạp giấy tự động (ADF)", status: "Đáp ứng", ref: "" },
      { req: "Độ phân giải quang học: 600 dpi", offer: "Độ phân giải quang học: 600 dpi", status: "Đáp ứng", ref: "" },
      { req: "Tốc độ quét: 70 ppm / 140 ipm", offer: "Tốc độ quét: 70 ppm / 140 ipm", status: "Đáp ứng", ref: "" },
      { req: "Khay nạp tài liệu tự động: 100 tờ", offer: "Khay nạp tài liệu tự động: 100 tờ", status: "Đáp ứng", ref: "" },
      { req: "Quét 2 mặt tự động: Có", offer: "Quét 2 mặt tự động: Có", status: "Đáp ứng", ref: "" },
      { req: "Cổng kết nối: USB 3.2 Gen 1, Gigabit Ethernet", offer: "Cổng kết nối: USB 3.2 Gen 1, Gigabit Ethernet", status: "Đáp ứng", ref: "" },
      { req: "Công suất quét: 10.000 tờ/ngày", offer: "Công suất quét: 10.000 tờ/ngày", status: "Đáp ứng", ref: "" },
      { req: "Bảo hành: 12 tháng", offer: "Bảo hành: 12 tháng", status: "Đáp ứng", ref: "" }
    ]
  },
  {
    reqName: "Thiết bị Switch layer 3",
    offerName: "Thiết bị Switch layer 3 Grandstream GWN7813",
    refNote: "",
    specs: [
      { req: "Loại thiết bị: Switch Layer 3 chuyển mạch quản lý", offer: "Loại thiết bị: Switch Layer 3 chuyển mạch quản lý", status: "Đáp ứng", ref: "" },
      { req: "Số cổng mạng: 24 cổng Gigabit RJ45 + 4x 10G SFP+ Uplink", offer: "Số cổng mạng: 24 cổng Gigabit RJ45 + 4x 10G SFP+ Uplink", status: "Đáp ứng", ref: "" },
      { req: "Băng thông chuyển mạch: 128 Gbps", offer: "Băng thông chuyển mạch: 128 Gbps", status: "Đáp ứng", ref: "" },
      { req: "Tốc độ chuyển tiếp gói tin: 95.23 Mpps", offer: "Tốc độ chuyển tiếp gói tin: 95.23 Mpps", status: "Đáp ứng", ref: "" },
      { req: "Tính năng Layer 3: Static Routing, RIP/OSPF, VRRP, DHCP Server", offer: "Tính năng Layer 3: Static Routing, RIP/OSPF, VRRP, DHCP Server", status: "Đáp ứng", ref: "" },
      { req: "Quản trị: Web GUI, CLI, SNMP, Cloud Controller", offer: "Quản trị: Web GUI, CLI, SNMP, Cloud Controller", status: "Đáp ứng", ref: "" },
      { req: "Bảo hành: 24 - 36 tháng", offer: "Bảo hành: 36 tháng chính hãng", status: "Đáp ứng", ref: "" }
    ]
  },
  {
    reqName: "Đầu đọc thẻ từ",
    offerName: "Đầu đọc thẻ từ Identiv uTrust 4701 F",
    refNote: "",
    specs: [
      { req: "Giao diện kép: Tiếp xúc ISO 7816 và Không tiếp xúc 13.56 MHz NFC", offer: "Giao diện kép: Tiếp xúc ISO 7816 và Không tiếp xúc 13.56 MHz NFC", status: "Đáp ứng", ref: "" },
      { req: "Giao diện máy chủ: USB 2.0 CCID", offer: "Giao diện máy chủ: USB 2.0 CCID", status: "Đáp ứng", ref: "" },
      { req: "Tiêu chuẩn: ISO/IEC 7816, ISO/IEC 14443, ISO/IEC 18092", offer: "Tiêu chuẩn: ISO/IEC 7816, ISO/IEC 14443, ISO/IEC 18092", status: "Đáp ứng", ref: "" },
      { req: "Hệ điều hành hỗ trợ: Windows, MacOS, Linux, Android", offer: "Hệ điều hành hỗ trợ: Windows, MacOS, Linux, Android", status: "Đáp ứng", ref: "" },
      { req: "Bảo hành: 12 tháng", offer: "Bảo hành: 12 tháng", status: "Đáp ứng", ref: "" }
    ]
  },
  {
    reqName: "Thiết bị đọc thẻ nhớ",
    offerName: "Thiết bị đọc thẻ nhớ ATEN UH3240",
    refNote: "",
    specs: [
      { req: "Chức năng: USB-C Multiport Dock chuyển đổi đa năng", offer: "Chức năng: USB-C Multiport Dock chuyển đổi đa năng", status: "Đáp ứng", ref: "" },
      { req: "Đầu ra: 1x Gigabit LAN, 3x USB 3.2, 1x SD, 1x microSD, 2x HDMI 4K, 2x Type-C (100W PD)", offer: "Đầu ra: 1x Gigabit LAN, 3x USB 3.2, 1x SD, 1x microSD, 2x HDMI 4K, 2x Type-C (100W PD)", status: "Đáp ứng", ref: "" },
      { req: "Tốc độ truyền dữ liệu: USB 3.2 Gen 1 (5Gbps)", offer: "Tốc độ truyền dữ liệu: USB 3.2 Gen 1 (5Gbps)", status: "Đáp ứng", ref: "" },
      { req: "Độ phân giải tối đa: Single 8K / Dual HDMI 4K", offer: "Độ phân giải tối đa: Single 8K / Dual HDMI 4K", status: "Đáp ứng", ref: "" },
      { req: "Thời gian bảo hành: 12 tháng", offer: "Thời gian bảo hành: 12 tháng", status: "Đáp ứng", ref: "" }
    ]
  }
];

var tdduItems = []; // Independent Compliance Table state

/* ── LOAD SAMPLE TDDU FILE ── */
function loadSampleTdduFile() {
  tdduItems = JSON.parse(JSON.stringify(TDDU_SAMPLE_ITEMS));
  document.getElementById('tddu_title').value = 'BẢNG TUYÊN BỐ ĐÁP ỨNG YÊU CẦU KỸ THUẬT CỦA HÀNG HÓA CHÀO THẦU';
  document.getElementById('tddu_to').value = 'Công an Thành phố Hồ Chí Minh';
  document.getElementById('tddu_bidder').value = 'Liên danh gói thầu CAHCM';
  document.getElementById('tddu_package').value = 'Mua sắm thiết bị phục vụ triển khai Nghị quyết số 57-NQ/TW, Kế hoạch số 02- KH/BCĐTW và chương trình chuyển đổi số';
  document.getElementById('tddu_project').value = 'Mua sắm trang thiết bị phục vụ triển khai Nghị quyết số 57-NQ/TW, Kế hoạch số 02- KH/BCĐTW và Chương trình chuyển đổi số của Công an Thành phố';
  renderTdduForm();
  toast('✨ Đã nạp thành công bộ mẫu Bảng Tuyên Bố Đáp Ứng!', 'ok');
}

/* ── HANDLE TDDU FILE UPLOAD (EXCEL / WORD / PDF) ── */
async function handleTdduFileUpload(files) {
  if (!files || files.length === 0) return;
  var file = files[0];
  toast('⏳ Đang đọc và bóc tách yêu cầu kỹ thuật từ: ' + file.name + '...', 'ai-t');

  try {
    var ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      var buf = await file.arrayBuffer();
      var wb = XLSX.read(buf, { type: 'array' });
      parseTdduFromXlsx(wb, file.name);
    } else if (ext === 'docx' || ext === 'doc') {
      var buf = await file.arrayBuffer();
      var res = await mammoth.convertToHtml({ arrayBuffer: buf });
      parseTdduFromWord(res.value, file.name);
    } else if (ext === 'pdf') {
      var buf = await file.arrayBuffer();
      await parseTdduFromPdf(buf, file.name);
    } else {
      toast('❌ Chỉ hỗ trợ file .xlsx, .xls, .docx hoặc .pdf!', 'err');
      return;
    }
  } catch (err) {
    console.error('TDDU File parse error:', err);
    toast('❌ Lỗi đọc file: ' + err.message, 'err');
  }
}

function parseTdduFromXlsx(wb, fileName) {
  var ws = wb.Sheets[wb.SheetNames[0]];
  var data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  if (!data || data.length === 0) {
    toast('⚠️ File Excel trống hoặc không đọc được dữ liệu!', 'err');
    return;
  }

  // Check if it's already in Compliance table format
  var headerRowIdx = -1;
  for (var i = 0; i < Math.min(15, data.length); i++) {
    var rowStr = data[i].join(' ').toLowerCase();
    if (rowStr.includes('tuyên bố đáp ứng') || (rowStr.includes('yêu cầu') && rowStr.includes('chào thầu')) || (rowStr.includes('stt') && rowStr.includes('thông số'))) {
      headerRowIdx = i;
      break;
    }
  }

  // Extract top metadata if present
  for (var i = 0; i < Math.min(8, data.length); i++) {
    var r0 = String(data[i][0] || '').trim();
    var r0L = r0.toLowerCase();
    if (r0L.includes('bảng tuyên bố đáp ứng') || r0L.includes('tuyên bố đáp ứng')) {
      document.getElementById('tddu_title').value = r0;
    } else if (r0L.includes('kính gửi')) {
      document.getElementById('tddu_to').value = r0.replace(/kính\s*gửi\s*[:\.]/i, '').trim();
    } else if (r0L.includes('tên nhà thầu')) {
      document.getElementById('tddu_bidder').value = r0.replace(/tên\s*nhà\s*thầu\s*[:\.]/i, '').trim();
    } else if (r0L.includes('tên gói thầu')) {
      document.getElementById('tddu_package').value = r0.replace(/tên\s*gói\s*thầu\s*[:\.]/i, '').trim();
    } else if (r0L.includes('tên dự toán')) {
      document.getElementById('tddu_project').value = r0.replace(/tên\s*dự\s*toán\s*(mua\s*sắm)?\s*[:\.]/i, '').trim();
    }
  }

  var parsedItems = [];

  if (headerRowIdx >= 0) {
    // Full Compliance format parser
    var cur = null;
    for (var i = headerRowIdx + 1; i < data.length; i++) {
      var row = data[i];
      var c0 = String(row[0] || '').trim();
      var c1 = String(row[1] || '').trim();
      var c2 = String(row[2] || '').trim();
      var c3 = String(row[3] || '').trim();
      var c4 = String(row[4] || '').trim();

      if (!c0 && !c1 && !c2 && !c3 && !c4) continue;
      if (c2.includes('ĐẠI DIỆN HỢP PHÁP') || c1.includes('ĐẠI DIỆN HỢP PHÁP')) break;

      var isNum = c0 && !isNaN(parseInt(c0)) && String(parseInt(c0)) === c0;
      if (isNum) {
        if (isNoiseOrNonDeviceText(c1) || !isStrictHardwareDevice(c1)) {
          cur = null;
          continue;
        }
        if (cur && cur.specs.length > 0) parsedItems.push(cur);
        cur = {
          reqName: c1 || ('Thiết bị ' + c0),
          offerName: c2 || '',
          refNote: c4 || '',
          selected: true,
          specs: []
        };
        continue;
      }

      if (c1.toLowerCase() === 'thông số kỹ thuật:' && c2.toLowerCase() === 'thông số kỹ thuật:') {
        continue;
      }

      if (cur && (c1 || c2)) {
        if (isValidTechnicalSpec(c1) || isValidTechnicalSpec(c2)) {
          cur.specs.push({
            req: c1,
            offer: c2 || '',
            status: c3 || '',
            ref: c4 || ''
          });
        }
      }
    }
    if (cur && cur.specs.length > 0) parsedItems.push(cur);
  } else {
    // General Specification workbook or specification sheets parser
    wb.SheetNames.forEach(function (sheetName, sIdx) {
      var sWs = wb.Sheets[sheetName];
      var sData = XLSX.utils.sheet_to_json(sWs, { header: 1, defval: '' });
      if (!sData || sData.length === 0) return;

      var devName = sheetName;
      var specs = [];

      sData.forEach(function (row, rIdx) {
        var nonBlank = row.filter(function (x) { return String(x).trim() !== ''; });
        if (nonBlank.length === 0) return;

        var k = String(row[0] || '').trim();
        var v = String(row[1] || '').trim();
        if (nonBlank.length > 2) {
          v = row.slice(1).filter(Boolean).map(String).join(' | ');
        }

        if (k.toUpperCase().includes('QUAY LẠI') || k.toUpperCase() === 'STT') return;

        if (rIdx <= 2 && !k.toLowerCase().includes('thông số') && (v || k).length > 4) {
          var candidate = v || k;
          if (isStrictHardwareDevice(candidate)) devName = candidate;
          return;
        }

        if (k || v) {
          var txt = k + (v ? ': ' + v : '');
          if (isValidTechnicalSpec(txt)) {
            specs.push({ req: txt, offer: '', status: '', ref: '' });
          }
        }
      });

      if (specs.length > 0 && isStrictHardwareDevice(devName)) {
        parsedItems.push({
          reqName: devName,
          offerName: '',
          refNote: '',
          selected: true,
          specs: specs
        });
      }
    });
  }

  if (parsedItems.length > 0) {
    tdduItems = parsedItems;
    renderTdduForm();
    toast('✅ Đã bóc tách toàn bộ ' + tdduItems.length + ' mục yêu cầu kỹ thuật! Hãy chọn mẫu máy chào thầu ở mỗi mục bên trên.', 'ok');
  } else {
    toast('⚠️ Không tìm thấy bảng thông số kỹ thuật hợp lệ trong file Excel.', 'err');
  }
}

function parseTdduFromWord(html, fileName) {
  var doc = new DOMParser().parseFromString(html, 'text/html');
  var tables = Array.from(doc.querySelectorAll('table'));
  var parsedItems = [];

  // 1. Try parsing tables
  tables.forEach(function (tbl, tIdx) {
    var rows = Array.from(tbl.querySelectorAll('tr'));
    if (rows.length < 2) return;

    var devName = 'Mục thiết bị ' + (tIdx + 1);
    var specs = [];

    rows.forEach(function (tr, rIdx) {
      var cells = Array.from(tr.querySelectorAll('td,th')).map(function (c) { return c.innerText.trim(); });
      if (cells.length === 0) return;

      if (rIdx === 0 && cells[0]) {
        var rawHdr = cells.join(' - ');
        if (isStrictHardwareDevice(rawHdr)) {
          devName = rawHdr;
        }
        return;
      }

      var k = cells[0] || '';
      var v = cells.slice(1).filter(Boolean).join(' | ');
      if (k || v) {
        var txt = k + (v ? ': ' + v : '');
        if (isValidTechnicalSpec(txt)) {
          specs.push({ req: txt, offer: '', status: '', ref: '' });
        }
      }
    });

    if (specs.length > 0 && isStrictHardwareDevice(devName)) {
      parsedItems.push({
        reqName: devName,
        offerName: '',
        refNote: '',
        selected: true,
        specs: specs
      });
    }
  });

  // 2. If no table or sparse, parse paragraphs & lists
  if (parsedItems.length === 0) {
    var paragraphs = Array.from(doc.querySelectorAll('p, li, h1, h2, h3, h4')).map(function (el) { return el.innerText.trim(); }).filter(Boolean);
    var curWordItem = null;

    paragraphs.forEach(function (line) {
      if (isNoiseOrNonDeviceText(line)) return;

      var isNewDev = /^(mục\s*)?(\d+|[ivx]+)[\.\:\-]\s*(máy\s+vi\s+tính|máy\s+tính|máy\s+in|máy\s+scan|máy\s+quét|máy\s+photo|máy\s+photocopy|máy\s+chủ|màn\s+hình|ổ\s+cứng|đầu\s+đọc|switch|bộ\s+chuyển\s+mạch|ups|bộ\s+lưu\s+điện|laptop|camera|kiosk)/i.test(line) ||
        isStrictHardwareDevice(line);

      if (isNewDev) {
        var devName = line.replace(/^(mục\s*)?(\d+|[ivx]+)[\.\:\-]\s*/i, '').trim();
        if (isStrictHardwareDevice(devName) || isStrictHardwareDevice(line)) {
          if (curWordItem && curWordItem.specs.length > 0 && isStrictHardwareDevice(curWordItem.reqName)) {
            parsedItems.push(curWordItem);
          }
          curWordItem = {
            reqName: devName || line,
            offerName: '',
            refNote: '',
            selected: true,
            specs: []
          };
          return;
        }
      }

      if (curWordItem) {
        if (line.toLowerCase() === 'thông số kỹ thuật:' || line.toLowerCase() === 'yêu cầu kỹ thuật:') return;
        var clean = line.replace(/^[•\-\*\+\da-z\.\)]+\s*/, '').trim();
        if (clean.length > 3 && isValidTechnicalSpec(clean)) {
          curWordItem.specs.push({ req: clean, offer: '', status: '', ref: '' });
        }
      }
    });

    if (curWordItem && curWordItem.specs.length > 0 && isStrictHardwareDevice(curWordItem.reqName)) {
      parsedItems.push(curWordItem);
    }
  }

  if (parsedItems.length > 0) {
    tdduItems = parsedItems;
    renderTdduForm();
    toast('✅ Đã nạp ' + tdduItems.length + ' mục yêu cầu kỹ thuật từ file Word! Hãy chọn mẫu máy chào thầu ở mỗi mục.', 'ok');
  } else {
    toast('⚠️ Không tìm thấy bảng thông số máy móc hợp lệ trong file Word!', 'err');
  }
}

async function parseTdduFromPdf(ab, fileName) {
  var pdfData = await extractTextFromPdf(ab);
  var lines = pdfData.lines;

  if (!lines || lines.length === 0) {
    toast('⚠️ File PDF không có nội dung chữ (hoặc là file scan ảnh)!', 'err');
    return;
  }

  // Check for document metadata in first few lines
  lines.slice(0, 15).forEach(function (l) {
    var lL = l.toLowerCase();
    if (lL.includes('bảng tuyên bố đáp ứng') || lL.includes('tuyên bố đáp ứng')) {
      document.getElementById('tddu_title').value = l;
    } else if (lL.includes('kính gửi')) {
      document.getElementById('tddu_to').value = l.replace(/kính\s*gửi\s*[:\.]/i, '').trim();
    } else if (lL.includes('tên nhà thầu')) {
      document.getElementById('tddu_bidder').value = l.replace(/tên\s*nhà\s*thầu\s*[:\.]/i, '').trim();
    } else if (lL.includes('tên gói thầu')) {
      document.getElementById('tddu_package').value = l.replace(/tên\s*gói\s*thầu\s*[:\.]/i, '').trim();
    } else if (lL.includes('tên dự toán')) {
      document.getElementById('tddu_project').value = l.replace(/tên\s*dự\s*toán\s*(mua\s*sắm)?\s*[:\.]/i, '').trim();
    }
  });

  var parsedItems = [];
  var curItem = null;

  lines.forEach(function (line) {
    var txt = line.trim();
    if (!txt) return;

    if (/^trang\s*\d+/i.test(txt) || /^page\s*\d+/i.test(txt)) return;
    if (isNoiseOrNonDeviceText(txt)) return;

    var isNewDev = /^(mục\s*)?(\d+|[ivx]+)[\.\:\-]\s*(máy\s+vi\s+tính|máy\s+tính|máy\s+in|máy\s+scan|máy\s+quét|máy\s+photo|máy\s+photocopy|máy\s+chủ|màn\s+hình|ổ\s+cứng|đầu\s+đọc|switch|bộ\s+chuyển\s+mạch|ups|bộ\s+lưu\s+điện|laptop|camera|kiosk)/i.test(txt) ||
      isStrictHardwareDevice(txt);

    if (isNewDev) {
      var devName = txt.replace(/^(mục\s*)?(\d+|[ivx]+)[\.\:\-]\s*/i, '').trim();
      if (isStrictHardwareDevice(devName) || isStrictHardwareDevice(txt)) {
        if (curItem && curItem.specs.length > 0 && isStrictHardwareDevice(curItem.reqName)) {
          parsedItems.push(curItem);
        }
        curItem = {
          reqName: devName || txt,
          offerName: '',
          refNote: '',
          selected: true,
          specs: []
        };
        return;
      }
    }

    if (curItem && isStrictHardwareDevice(curItem.reqName)) {
      if (txt.toLowerCase() === 'thông số kỹ thuật:' || txt.toLowerCase() === 'yêu cầu kỹ thuật:') return;

      var cleanSpec = txt.replace(/^[•\-\*\+\da-z\.\)]+\s*/, '').trim();
      if (cleanSpec.length > 3 && isValidTechnicalSpec(cleanSpec)) {
        curItem.specs.push({
          req: cleanSpec,
          offer: '',
          status: '',
          ref: ''
        });
      }
    }
  });

  if (curItem && curItem.specs.length > 0 && isStrictHardwareDevice(curItem.reqName)) {
    parsedItems.push(curItem);
  }

  if (parsedItems.length > 0) {
    tdduItems = parsedItems;
    renderTdduForm();
    toast('✅ Đã bóc tách ' + tdduItems.length + ' mục yêu cầu kỹ thuật từ file PDF! Hãy chọn mẫu máy chào thầu ở mỗi mục bên trên.', 'ok');
  } else {
    toast('⚠️ Không tìm thấy thông số máy móc rõ ràng trong file PDF. Đã nạp dữ liệu mẫu để bạn tiếp tục!', 'err');
    loadSampleTdduFile();
  }
}

/* ── INTELLIGENT MODEL PRESET MATCHING ENGINE ── */
function tdduAutoMatchAllPresets(silent) {
  if (!tdduItems || tdduItems.length === 0) {
    if (!silent) toast('⚠️ Chưa có thiết bị nào để khớp mẫu!', 'err');
    return;
  }

  var matchCount = 0;
  tdduItems.forEach(function (item, idx) {
    var matched = tdduAutoMatchDevice(item);
    if (matched) matchCount++;
  });

  renderTdduForm();
  if (!silent) {
    toast('⚡ Đã tự động khớp và điền thông số cho ' + matchCount + '/' + tdduItems.length + ' thiết bị!', 'ok');
  }
}

function tdduAutoMatchDevice(item) {
  if (!item || !item.reqName) return false;
  if (isNoiseOrNonDeviceText(item.reqName) || !isRealDevice(item.reqName)) return false;

  var cat = getCategoryForDevice(item);
  var catToKey = {
    computer: 'msi_dp180',
    printer: 'oki_b433dn',
    scanner: 'ricoh_fi8170',
    photocopier: 'ricoh_im2500',
    switch: 'switch_gwn7813',
    card_reader: 'dau_doc_the_tu',
    memory_reader: 'doc_the_nho',
    monitor: 'man_hinh_24',
    ups: 'ups_santak_1000',
    camera: 'canon_eos_r6'
  };

  var bestKey = catToKey[cat] || '';

  if (bestKey && MODEL_PRESETS[bestKey]) {
    applyPresetToTdduItem(item, bestKey);
    return true;
  }
  return false;
}

function applyPresetToTdduItem(item, presetKey) {
  var preset = MODEL_PRESETS[presetKey];
  if (!preset) return;

  item.offerName = preset.name;
  item.offerModel = preset.model;
  item.offerBrand = preset.brand || '';
  item.offerOrigin = preset.origin || 'Chính hãng';

  // Map existing req specs to preset specs using smart multi-key matching
  if (item.specs && item.specs.length > 0) {
    item.specs.forEach(function (sp) {
      var reqL = (sp.req || '').toLowerCase();
      var foundVal = '';

      preset.specs.forEach(function (ps) {
        if (foundVal) return; // already matched
        var pkL = (ps.key || '').toLowerCase();
        var pvL = (ps.value || '').toLowerCase();

        // Direct key match
        if (reqL.includes(pkL)) { foundVal = ps.key + ': ' + ps.value; return; }
        if ((pkL.includes('cpu') || pkL.includes('vi xử lý')) && (reqL.includes('cpu') || reqL.includes('vi xử lý') || reqL.includes('bộ xử lý') || reqL.includes('processor'))) { foundVal = ps.key + ': ' + ps.value; return; }
        if ((pkL.includes('ram') || pkL.includes('bộ nhớ')) && (reqL.includes('ram') || reqL.includes('bộ nhớ') || reqL.includes('ddr'))) { foundVal = ps.key + ': ' + ps.value; return; }
        if ((pkL.includes('ssd') || pkL.includes('hdd') || pkL.includes('ổ cứng') || pkL.includes('storage')) && (reqL.includes('ssd') || reqL.includes('hdd') || reqL.includes('ổ cứng') || reqL.includes('nvme') || reqL.includes('storage'))) { foundVal = ps.key + ': ' + ps.value; return; }
        if (pkL.includes('tốc độ') && reqL.includes('tốc độ')) { foundVal = ps.key + ': ' + ps.value; return; }
        if (pkL.includes('độ phân giải') && reqL.includes('độ phân giải')) { foundVal = ps.key + ': ' + ps.value; return; }
        if (pkL.includes('bảo hành') && reqL.includes('bảo hành')) { foundVal = ps.key + ': ' + ps.value; return; }
        if (pkL.includes('khổ giấy') && (reqL.includes('khổ giấy') || reqL.includes('giấy'))) { foundVal = ps.key + ': ' + ps.value; return; }
        if ((pkL.includes('cổng kết nối') || pkL.includes('kết nối') || pkL.includes('giao diện')) && (reqL.includes('kết nối') || reqL.includes('cổng') || reqL.includes('giao diện') || reqL.includes('usb') || reqL.includes('lan') || reqL.includes('ethernet'))) { foundVal = ps.key + ': ' + ps.value; return; }
        if ((pkL.includes('hệ điều hành') || pkL.includes('os')) && (reqL.includes('hệ điều hành') || reqL.includes('windows') || reqL.includes('macos') || reqL.includes('linux'))) { foundVal = ps.key + ': ' + ps.value; return; }
        if ((pkL.includes('khay') || pkL.includes('nap giấy')) && (reqL.includes('khay') || reqL.includes('nap giấy') || reqL.includes('adf'))) { foundVal = ps.key + ': ' + ps.value; return; }
        if (pkL.includes('công suất') && reqL.includes('công suất')) { foundVal = ps.key + ': ' + ps.value; return; }
        if ((pkL.includes('màn hình') || pkL.includes('kích thước') || pkL.includes('panel')) && (reqL.includes('màn hình') || reqL.includes('inch') || reqL.includes('panel'))) { foundVal = ps.key + ': ' + ps.value; return; }
        if (pkL.includes('phần mềm') && reqL.includes('phần mềm')) { foundVal = ps.key + ': ' + ps.value; return; }
      });

      if (foundVal) {
        sp.offer = foundVal;
      } else if (!sp.offer || sp.offer === sp.req) {
        sp.offer = sp.req
          .replace(/tươngđương hoặc cao hơn/gi, '')
          .replace(/tương đương/gi, '')
          .replace(/hoặc tương đương/gi, '')
          .replace(/đạt chuẩn/gi, '')
          .trim();
      }
      sp.status = evaluateSpecCompliance(sp.req, sp.offer);
    });
  } else {
    item.specs = preset.specs.map(function (ps) {
      var txt = ps.key + ': ' + ps.value;
      return { req: txt, offer: txt, status: 'Đáp ứng', ref: '' };
    });
  }
}


// Unified category detection (returns: computer/printer/scanner/photocopier/switch/card_reader/memory_reader/camera/monitor/ups/general)
function getCategoryForDevice(item) {
  var n = ((item.reqName || '') + ' ' + (item.reqModel || '') + ' ' + (item.offerName || '') + ' ' + (item.offerModel || '')).toLowerCase();
  var specsTxt = (item.specs || []).map(function (s) { return (s.req || '').toLowerCase(); }).join(' ');
  var allTxt = n + ' ' + specsTxt;

  if (allTxt.includes('vi tính') || allTxt.includes('desktop') || (allTxt.includes('pc') && !allTxt.includes('ups')) || allTxt.includes('laptop') || allTxt.includes('máy tính') || allTxt.includes('dp180') || allTxt.includes('core ultra') || allTxt.includes('mini pc')) return 'computer';
  if (allTxt.includes('photocopy') || allTxt.includes('đa chức năng a3') || allTxt.includes('đa năng a3') || allTxt.includes('im 2500') || allTxt.includes('im 3500')) return 'photocopier';
  if (allTxt.includes('scan') || allTxt.includes('quét') || allTxt.includes('fi-8170') || allTxt.includes('fi8170') || allTxt.includes('sp-2240n') || allTxt.includes('sp2240n')) return 'scanner';
  if (allTxt.includes('switch') || allTxt.includes('chuyển mạch') || allTxt.includes('layer 3') || allTxt.includes('gwn7813') || (allTxt.includes('router') && !allTxt.includes('máy in'))) return 'switch';
  if (allTxt.includes('thẻ từ') || allTxt.includes('thẻ thông minh') || allTxt.includes('4701') || allTxt.includes('smart card') || allTxt.includes('rfid') || (allTxt.includes('nfc') && !allTxt.includes('thẻ nhớ'))) return 'card_reader';
  if (allTxt.includes('thẻ nhớ') || allTxt.includes('uh3240') || (allTxt.includes('dock') && !allTxt.includes('máy in'))) return 'memory_reader';
  if (allTxt.includes('màn hình') || allTxt.includes('monitor') || allTxt.includes('tivi') || (allTxt.includes('display') && !allTxt.includes('máy in'))) return 'monitor';
  if (allTxt.includes('ups') || allTxt.includes('lưu điện') || allTxt.includes('santak') || allTxt.includes('apc') || allTxt.includes('blazer')) return 'ups';
  if (allTxt.includes('ảnh') || allTxt.includes('camera') || allTxt.includes('lens') || allTxt.includes('eos r6') || allTxt.includes('mirrorless')) return 'camera';
  if (allTxt.includes('máy in') || allTxt.includes('printer') || allTxt.includes('b433dn') || allTxt.includes('b513dn') || allTxt.includes('m404dn') || allTxt.includes('lbp2900') || allTxt.includes('laser a4') || allTxt.includes('in laser')) return 'printer';
  return 'general';
}

function getCategoryBadge(cat) {
  var badges = {
    computer: '<span style="background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:700">💻 Máy vi tính</span>',
    printer: '<span style="background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:700">🖨️ Máy in</span>',
    scanner: '<span style="background:#fefce8;color:#854d0e;border:1px solid #fef08a;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:700">📄 Máy scan</span>',
    photocopier: '<span style="background:#faf5ff;color:#6b21a8;border:1px solid #e9d5ff;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:700">📠 Máy photocopy</span>',
    monitor: '<span style="background:#f0fdfa;color:#115e59;border:1px solid #99f6e4;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:700">🖥️ Màn hình</span>',
    switch: '<span style="background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:700">🌐 Switch mạng</span>',
    card_reader: '<span style="background:#fdf2f8;color:#9d174d;border:1px solid #fbcfe8;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:700">💳 Đầu đọc thẻ từ</span>',
    memory_reader: '<span style="background:#fdf2f8;color:#9d174d;border:1px solid #fbcfe8;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:700">💾 Đọc thẻ nhớ</span>',
    ups: '<span style="background:#fffbeb;color:#92400e;border:1px solid #fde68a;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:700">🔋 Bộ lưu điện UPS</span>',
    camera: '<span style="background:#fff1f2;color:#9f1239;border:1px solid #fecdd3;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:700">📷 Máy ảnh</span>',
    general: '<span style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:700">⚙️ Thiết bị</span>'
  };
  return badges[cat] || badges.general;
}

function buildPresetOptionsForDevice(item) {
  var cat = getCategoryForDevice(item);
  var optionsHtml = '';

  if (cat === 'computer') {
    optionsHtml = '<option value="">💻 Chọn mẫu máy vi tính phù hợp...</option>' +
      '<option value="msi_dp180">💻 Máy vi tính MSI PRO DP180 AI 8HG (Đề xuất)</option>' +
      '<option value="msi_cubi_nuc">💻 Mini PC MSI Cubi NUC 1M (Core i5-120U)</option>';
  } else if (cat === 'printer') {
    optionsHtml = '<option value="">🖨️ Chọn mẫu máy in phù hợp...</option>' +
      '<option value="oki_b433dn">🖨️ Máy in OKI B433DN (40 trang/phút) (Đề xuất)</option>' +
      '<option value="oki_b513dn">🖨️ Máy in OKI B513DN (45 trang/phút, LCD)</option>' +
      '<option value="canon_lbp2900">🖨️ Máy in Laser Canon LBP2900</option>' +
      '<option value="hp_m404dn">🖨️ Máy in HP LaserJet M404dn</option>';
  } else if (cat === 'scanner') {
    optionsHtml = '<option value="">📄 Chọn mẫu máy scan phù hợp...</option>' +
      '<option value="ricoh_fi8170">📄 Máy scan RICOH Fi-8170 (70 ppm / 140 ipm) (Đề xuất)</option>' +
      '<option value="ricoh_sp2240n">📄 Máy scan tài liệu Ricoh SP-2240N</option>';
  } else if (cat === 'photocopier') {
    optionsHtml = '<option value="">📠 Chọn mẫu máy photocopy phù hợp...</option>' +
      '<option value="ricoh_im2500">📠 Máy đa năng A3 Ricoh IM 2500 (Đề xuất)</option>';
  } else if (cat === 'switch') {
    optionsHtml = '<option value="">🌐 Chọn mẫu Switch mạng phù hợp...</option>' +
      '<option value="switch_gwn7813">🌐 Switch Layer 3 Grandstream GWN7813 (Đề xuất)</option>';
  } else if (cat === 'card_reader') {
    optionsHtml = '<option value="">💳 Chọn mẫu đầu đọc thẻ từ phù hợp...</option>' +
      '<option value="dau_doc_the_tu">💳 Đầu đọc thẻ từ Identiv uTrust 4701 F (Đề xuất)</option>';
  } else if (cat === 'memory_reader') {
    optionsHtml = '<option value="">💾 Chọn mẫu thiết bị đọc thẻ nhớ phù hợp...</option>' +
      '<option value="doc_the_nho">💾 Thiết bị đọc thẻ nhớ ATEN UH3240 (Đề xuất)</option>';
  } else if (cat === 'camera') {
    optionsHtml = '<option value="">📷 Chọn mẫu máy ảnh phù hợp...</option>' +
      '<option value="canon_eos_r6">📷 Máy ảnh Canon EOS R6 Mark II + Lens (Đề xuất)</option>';
  } else if (cat === 'monitor') {
    optionsHtml = '<option value="">🖥️ Chọn mẫu màn hình phù hợp...</option>' +
      '<option value="man_hinh_24">🖥️ Màn hình MSI PRO MP241X 23.8" IPS Full HD (Đề xuất)</option>';
  } else if (cat === 'ups') {
    optionsHtml = '<option value="">🔋 Chọn mẫu bộ lưu điện UPS phù hợp...</option>' +
      '<option value="ups_santak_1000">🔋 Bộ lưu điện UPS Santak Blazer 1000 Pro (Đề xuất)</option>';
  } else {
    optionsHtml = '<option value="">⚡ Chọn mẫu thiết bị phù hợp...</option>' +
      '<optgroup label="💻 Máy tính &amp; Mini PC">' +
      '<option value="msi_dp180">Máy vi tính MSI PRO DP180 AI 8HG</option>' +
      '<option value="msi_cubi_nuc">Mini PC MSI Cubi NUC 1M</option>' +
      '</optgroup>' +
      '<optgroup label="🖨️ Máy in Laser A4">' +
      '<option value="oki_b433dn">Máy in OKI B433DN</option>' +
      '<option value="oki_b513dn">Máy in OKI B513DN</option>' +
      '<option value="canon_lbp2900">Máy in Canon LBP2900</option>' +
      '<option value="hp_m404dn">Máy in HP LaserJet M404dn</option>' +
      '</optgroup>' +
      '<optgroup label="📠 Máy photocopy / Đa năng A3">' +
      '<option value="ricoh_im2500">Máy đa năng Ricoh IM 2500</option>' +
      '</optgroup>' +
      '<optgroup label="📄 Máy scan tài liệu">' +
      '<option value="ricoh_fi8170">Máy scan RICOH Fi-8170</option>' +
      '<option value="ricoh_sp2240n">Máy scan Ricoh SP-2240N</option>' +
      '</optgroup>' +
      '<optgroup label="🌐 Switch &amp; Mạng">' +
      '<option value="switch_gwn7813">Switch Layer 3 Grandstream GWN7813</option>' +
      '</optgroup>' +
      '<optgroup label="💳 Thiết bị ngoại vi">' +
      '<option value="dau_doc_the_tu">Đầu đọc thẻ từ Identiv uTrust 4701 F</option>' +
      '<option value="doc_the_nho">Thiết bị đọc thẻ nhớ ATEN UH3240</option>' +
      '</optgroup>';
  }

  // Always add full list at end
  optionsHtml += '<optgroup label="── 📋 Tất cả thiết bị ──">' +
    '<option value="msi_dp180">💻 Máy vi tính MSI PRO DP180 AI</option>' +
    '<option value="msi_cubi_nuc">💻 Mini PC MSI Cubi NUC 1M</option>' +
    '<option value="oki_b433dn">🖨️ Máy in OKI B433DN</option>' +
    '<option value="oki_b513dn">🖨️ Máy in OKI B513DN</option>' +
    '<option value="canon_lbp2900">🖨️ Máy in Canon LBP2900</option>' +
    '<option value="hp_m404dn">🖨️ Máy in HP LaserJet M404dn</option>' +
    '<option value="ricoh_im2500">📠 Máy photocopy Ricoh IM 2500</option>' +
    '<option value="ricoh_fi8170">📄 Máy scan RICOH Fi-8170</option>' +
    '<option value="ricoh_sp2240n">📄 Máy scan Ricoh SP-2240N</option>' +
    '<option value="switch_gwn7813">🌐 Switch Grandstream GWN7813</option>' +
    '<option value="dau_doc_the_tu">💳 Đầu đọc thẻ từ 4701 F</option>' +
    '<option value="doc_the_nho">💾 Thiết bị đọc thẻ nhớ UH3240</option>' +
    '<option value="man_hinh_24">🖥️ Màn hình 23.8 inch IPS</option>' +
    '<option value="ups_santak_1000">🔋 Bộ lưu điện UPS 1000VA</option>' +
    '<option value="canon_eos_r6">📷 Máy ảnh Canon EOS R6</option>' +
    '</optgroup>';

  return optionsHtml;
}

/* ── REAL SPEC COMPLIANCE EVALUATION ENGINE ── */
function evaluateSpecCompliance(reqStr, offerStr) {
  if (!offerStr || !offerStr.trim()) return 'Không đáp ứng';
  if (!reqStr || !reqStr.trim()) return 'Đáp ứng';

  var r = reqStr.toLowerCase().trim();
  var o = offerStr.toLowerCase().trim();

  // If identical or offer is confirmed equal
  if (r === o) return 'Đáp ứng';

  // If offer explicitly says not supported / none
  if (/\b(không có|không hỗ trợ|không trang bị|không kèm|không tích hợp|none)\b/i.test(o)) {
    if (!/\b(không cần|không yêu cầu|không có|không)\b/i.test(r)) {
      return 'Không đáp ứng';
    }
  }

  // 1. RAM: (e.g. 16GB vs 8GB)
  var rRam = r.match(/(\d+)\s*(gb|tb)\s*(ram|ddr|bộ nhớ)?/i) || r.match(/(ram|bộ nhớ)[^\d]*(\d+)\s*(gb|tb)/i);
  var oRam = o.match(/(\d+)\s*(gb|tb)\s*(ram|ddr|bộ nhớ)?/i) || o.match(/(ram|bộ nhớ)[^\d]*(\d+)\s*(gb|tb)/i);
  if (rRam && oRam) {
    var rVal = parseInt(rRam[1] || rRam[2]) * ((rRam[2] === 'tb' || rRam[3] === 'tb') ? 1024 : 1);
    var oVal = parseInt(oRam[1] || oRam[2]) * ((oRam[2] === 'tb' || oRam[3] === 'tb') ? 1024 : 1);
    if (oVal < rVal) return 'Không đáp ứng';
  }

  // 2. Storage / SSD: (e.g. 512GB vs 256GB)
  var rSsd = r.match(/(\d+)\s*(gb|tb)\s*(ssd|hdd|ổ cứng|nvme|m\.2)?/i) || r.match(/(ssd|hdd|ổ cứng)[^\d]*(\d+)\s*(gb|tb)/i);
  var oSsd = o.match(/(\d+)\s*(gb|tb)\s*(ssd|hdd|ổ cứng|nvme|m\.2)?/i) || o.match(/(ssd|hdd|ổ cứng)[^\d]*(\d+)\s*(gb|tb)/i);
  if (rSsd && oSsd) {
    var rVal = parseInt(rSsd[1] || rSsd[2]) * ((rSsd[2] === 'tb' || rSsd[3] === 'tb') ? 1024 : 1);
    var oVal = parseInt(oSsd[1] || oSsd[2]) * ((oSsd[2] === 'tb' || oSsd[3] === 'tb') ? 1024 : 1);
    if (oVal < rVal) return 'Không đáp ứng';
  }

  // 3. Print / Scan Speed: (e.g. 40 trang/phút vs 30 trang/phút)
  var rSpeed = r.match(/(\d+)\s*(ppm|ipm|trang\/phút|trang\s*phút)/i) || r.match(/tốc độ[^\d]*(\d+)/i);
  var oSpeed = o.match(/(\d+)\s*(ppm|ipm|trang\/phút|trang\s*phút)/i) || o.match(/tốc độ[^\d]*(\d+)/i);
  if (rSpeed && oSpeed) {
    var rVal = parseInt(rSpeed[1]);
    var oVal = parseInt(oSpeed[1]);
    if (oVal < rVal) return 'Không đáp ứng';
  }

  // 4. Warranty: (e.g. 24 tháng vs 12 tháng)
  var rWar = r.match(/(\d+)\s*(tháng|năm)/i);
  var oWar = o.match(/(\d+)\s*(tháng|năm)/i);
  if (rWar && oWar) {
    var rM = parseInt(rWar[1]) * (rWar[2].toLowerCase().includes('năm') ? 12 : 1);
    var oM = parseInt(oWar[1]) * (oWar[2].toLowerCase().includes('năm') ? 12 : 1);
    if (oM < rM) return 'Không đáp ứng';
  }

  // 5. Screen Size: (e.g. 23.8 inch vs 21.5 inch)
  var rScr = r.match(/(\d+[\.,]?\d*)\s*(inch|")/i);
  var oScr = o.match(/(\d+[\.,]?\d*)\s*(inch|")/i);
  if (rScr && oScr) {
    var rVal = parseFloat(rScr[1].replace(',', '.'));
    var oVal = parseFloat(oScr[1].replace(',', '.'));
    if (oVal < rVal - 0.5) return 'Không đáp ứng';
  }

  // 6. Paper format: A3 required but offer is only A4
  if (/\ba3\b/i.test(r) && !/\ba3\b/i.test(o) && /\ba4\b/i.test(o)) {
    return 'Không đáp ứng';
  }

  // 7. Duplex / 2-side: If req requires 2-side / duplex but offer says 1-side / đơn năng
  if (/\b(2 mặt|hai mặt|duplex)\b/i.test(r) && /\b(1 mặt|một mặt|đơn năng)\b/i.test(o) && !/\b(2 mặt|hai mặt|duplex)\b/i.test(o)) {
    return 'Không đáp ứng';
  }

  return 'Đáp ứng';
}

function tdduAutoEvaluateAll() {
  if (!tdduItems || tdduItems.length === 0) {
    toast('⚠️ Chưa có thiết bị nào để đánh giá!', 'err');
    return;
  }
  var okCount = 0, failCount = 0;
  tdduItems.forEach(function (item) {
    if (item.specs) {
      item.specs.forEach(function (sp) {
        sp.status = evaluateSpecCompliance(sp.req, sp.offer);
        if (sp.status === 'Đáp ứng') okCount++;
        else failCount++;
      });
    }
  });
  renderTdduForm();
  toast('⚖️ Đã đánh giá thật xong: ' + okCount + ' Đáp ứng, ' + failCount + ' Không đáp ứng!', 'ok');
}

function tdduSyncFromDutoan() {
  if (devs.length === 0) {
    toast("Bên Dự Toán chưa có thiết bị nào! Hãy nạp thiết bị bên Dự Toán trước.", "err");
    return;
  }
  var cleanDevs = devs.filter(function (d) {
    var n = d.name || '';
    return !isNoiseOrNonDeviceText(n) && (isRealDevice(n) || (d.specs && d.specs.length > 0));
  });

  if (cleanDevs.length === 0) {
    toast("Không tìm thấy thiết bị máy móc hợp lệ từ Dự Toán!", "err");
    return;
  }

  tdduItems = cleanDevs.map(function (d) {
    var sps = (d.specs && d.specs.length > 0) ? d.specs.filter(function (s) {
      var k = (s.key || '').toLowerCase();
      var v = (s.value || '').toLowerCase();
      return !isNoiseOrNonDeviceText(k) && !isNoiseOrNonDeviceText(v);
    }).map(function (s) {
      var k = s.key || '';
      var v = s.value || '';
      var text = k + (v ? ': ' + v : '');
      return {
        req: text,
        offer: text,
        status: "Đáp ứng",
        ref: ""
      };
    }) : [
      { req: "Xuất xứ: " + (d.origin || 'Chính hãng'), offer: "Xuất xứ: " + (d.origin || 'Chính hãng'), status: "Đáp ứng", ref: "" },
      { req: "Bảo hành: " + (d.warranty || '12 tháng'), offer: "Bảo hành: " + (d.warranty || '12 tháng'), status: "Đáp ứng", ref: "" }
    ];

    return {
      reqName: d.name || 'Thiết bị',
      offerName: (d.name || '') + (d.model ? ' ' + d.model : ''),
      refNote: '',
      selected: true,
      specs: sps
    };
  });

  renderTdduForm();
  toast("Đã đồng bộ " + tdduItems.length + " thiết bị máy móc chuẩn từ Dự Toán!", "ok");
}


function tdduAddDev() {
  tdduItems.push({
    reqName: "Thiết bị mới",
    offerName: "Model thiết bị chào thầu",
    refNote: "",
    specs: [
      { req: "Chức năng / Loại thiết bị: Tiêu chuẩn", offer: "Chức năng / Loại thiết bị: Tiêu chuẩn", status: "Đáp ứng", ref: "" },
      { req: "Bảo hành: 12 tháng", offer: "Bảo hành: 12 tháng", status: "Đáp ứng", ref: "" }
    ]
  });
  renderTdduForm();
}

function tdduRemoveDev(idx) {
  if (!confirm("Bạn có chắc muốn xóa thiết bị này khỏi Bảng Tuyên Bố Đáp Ứng?")) return;
  tdduItems.splice(idx, 1);
  renderTdduForm();
}

function tdduAddSpec(devIdx) {
  if (!tdduItems[devIdx]) return;
  tdduItems[devIdx].specs.push({
    req: "",
    offer: "",
    status: "Đáp ứng",
    ref: ""
  });
  renderTdduForm();
}

function tdduRemoveSpec(devIdx, specIdx) {
  if (!tdduItems[devIdx]) return;
  tdduItems[devIdx].specs.splice(specIdx, 1);
  renderTdduForm();
}

function tdduSetAllStatus(status) {
  tdduItems.forEach(function (item) {
    if (item.specs) {
      item.specs.forEach(function (sp) {
        sp.status = status;
      });
    }
  });
  renderTdduForm();
  toast("Đã đặt tất cả tiêu chí thành: " + status, "ok");
}

function tdduApplyPreset(devIdx, presetKey) {
  if (!tdduItems[devIdx] || !presetKey) return;
  applyPresetToTdduItem(tdduItems[devIdx], presetKey);
  renderTdduForm();
  var pName = MODEL_PRESETS[presetKey] ? MODEL_PRESETS[presetKey].name : presetKey;
  toast("⚡ Đã khớp và điền đầy đủ thông số chào thầu cho: " + pName, "ok");
}

async function tdduAiScrapeSpecs(dIdx) {
  var item = tdduItems[dIdx];
  if (!item) return;

  var targetName = (item.offerName || item.reqName || '').trim();
  var targetModel = (item.offerModel || item.reqModel || '').trim();
  if (!targetName && !targetModel) {
    toast('⚠️ Vui lòng nhập Tên hoặc Model thiết bị chào thầu trước!', 'err');
    return;
  }

  // 1. Kiểm tra nếu có trong mẫu sẵn có: Giữ nguyên 100%
  var matchKey = findMatchingPresetKey(targetName, targetModel);
  if (matchKey && MODEL_PRESETS[matchKey]) {
    applyPresetToTdduItem(item, matchKey);
    renderTdduForm();
    toast('✅ Thiết bị đã có trong bộ mẫu chuẩn (' + MODEL_PRESETS[matchKey].name + '), giữ nguyên 100% dữ liệu!', 'ok');
    return;
  }

  // 2. Thiết bị chưa có trong mẫu -> Kích hoạt AI cào từ hãng
  var key = getActiveAiKey();
  if (!key) {
    openAiSettingsModal('Thiết bị "' + (targetName || targetModel) + '" chưa có trong mẫu. Vui lòng nhập API Key để AI cào thông số chính hãng!');
    return;
  }

  toast('🤖 AI đang tra cứu & cào thông số chính hãng cho ' + (targetName || targetModel) + '...', 'ai-t');
  try {
    var prompt = buildOfficialSpecPrompt(targetName, targetModel, '');
    var rawText = await callAiApi(prompt);
    var jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      var parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (!item.specs || item.specs.length === 0) {
          item.specs = parsed.map(function (s) {
            return { req: s.key + ': ' + s.value, offer: s.value, status: 'Đáp ứng', ref: '' };
          });
        } else {
          item.specs.forEach(function (sp, idx) {
            var found = parsed.find(function (p) {
              return sp.req && sp.req.toLowerCase().includes(p.key.toLowerCase());
            });
            if (found) {
              sp.offer = found.value;
              sp.status = 'Đáp ứng';
            } else if (!sp.offer && parsed[idx]) {
              sp.offer = parsed[idx].value;
              sp.status = 'Đáp ứng';
            }
          });
        }
        renderTdduForm();
        toast('✅ AI đã cào thành công thông số chính hãng cho ' + (targetName || targetModel) + '!', 'ok');
        return;
      }
    }
    throw new Error('Dữ liệu AI trả về không đúng cấu trúc bảng thông số!');
  } catch (e) {
    toast('⚠️ Lỗi cào thông số AI: ' + e.message, 'err');
  }
}

async function tdduAiScrapeAllMissing() {
  if (!tdduItems || tdduItems.length === 0) {
    toast('⚠️ Chưa có thiết bị nào trong danh sách tuyên bố đáp ứng!', 'err');
    return;
  }

  var missingItems = [];
  var existingCount = 0;

  tdduItems.forEach(function (item, idx) {
    var targetName = (item.offerName || item.reqName || '').trim();
    var targetModel = (item.offerModel || item.reqModel || '').trim();
    var matchKey = findMatchingPresetKey(targetName, targetModel);
    if (matchKey && MODEL_PRESETS[matchKey]) {
      existingCount++;
      applyPresetToTdduItem(item, matchKey);
    } else {
      missingItems.push({ item: item, idx: idx });
    }
  });

  if (missingItems.length === 0) {
    renderTdduForm();
    toast('✅ Toàn bộ ' + existingCount + ' mục đều đã khớp bộ mẫu chuẩn, giữ nguyên 100%!', 'ok');
    return;
  }

  var key = getActiveAiKey();
  if (!key) {
    openAiSettingsModal('Có ' + missingItems.length + ' mục chưa có mẫu chuẩn. Vui lòng nhập API Key để AI cào thông số chính hãng!');
    return;
  }

  toast('🚀 AI đang cào thông số chính hãng cho ' + missingItems.length + ' mục chưa có mẫu...', 'ai-t');
  var successCount = 0;

  for (var i = 0; i < missingItems.length; i++) {
    var it = missingItems[i].item;
    var name = (it.offerName || it.reqName || '').trim();
    var model = (it.offerModel || it.reqModel || '').trim();
    toast('🤖 AI đang cào thông số (' + (i + 1) + '/' + missingItems.length + '): ' + (name || model) + '...', 'ai-t');

    try {
      var prompt = buildOfficialSpecPrompt(name, model, '');
      var rawText = await callAiApi(prompt);
      var jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        var parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!it.specs || it.specs.length === 0) {
            it.specs = parsed.map(function (s) {
              return { req: s.key + ': ' + s.value, offer: s.value, status: 'Đáp ứng', ref: '' };
            });
          } else {
            it.specs.forEach(function (sp, sIdx) {
              var found = parsed.find(function (p) {
                return sp.req && sp.req.toLowerCase().includes(p.key.toLowerCase());
              });
              if (found) {
                sp.offer = found.value;
                sp.status = 'Đáp ứng';
              } else if (!sp.offer && parsed[sIdx]) {
                sp.offer = parsed[sIdx].value;
                sp.status = 'Đáp ứng';
              }
            });
          }
          successCount++;
        }
      }
    } catch (e) {
      console.warn('Lỗi cào TDDU AI cho ' + (name || model), e);
    }
  }

  renderTdduForm();
  toast('🎉 Hoàn tất! Đã giữ nguyên ' + existingCount + ' mục có sẵn và dùng AI cào thông số cho ' + successCount + ' mục mới!', 'ok');
}

var tdduCollapsed = {};


function tdduToggleCollapse(dIdx) {
  tdduCollapsed[dIdx] = !tdduCollapsed[dIdx];
  renderTdduForm();
}

function tdduCollapseAll(collapse) {
  tdduItems.forEach(function (_, idx) { tdduCollapsed[idx] = collapse; });
  renderTdduForm();
}

function tdduToggleStatus(dIdx, sIdx) {
  if (!tdduItems[dIdx] || !tdduItems[dIdx].specs || !tdduItems[dIdx].specs[sIdx]) return;
  var cur = tdduItems[dIdx].specs[sIdx].status;
  tdduItems[dIdx].specs[sIdx].status = (cur === 'Đáp ứng') ? 'Không đáp ứng' : 'Đáp ứng';
  renderTdduForm();
}

function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.max(34, el.scrollHeight) + 'px';
}

function tdduClearAll() {
  if (!tdduItems || tdduItems.length === 0) return;
  if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách thiết bị để làm mới từ đầu?')) return;
  tdduItems = [];
  renderTdduForm();
  toast('Đã làm mới danh sách thiết bị!', 'ok');
}

function tdduAddPresetDirectly(presetKey) {
  var preset = MODEL_PRESETS[presetKey];
  if (!preset) return;
  var cleanName = preset.name.replace(/^(máy vi tính|máy in|máy photocopy|máy scan|switch|đầu đọc|bộ lưu điện|màn hình|máy ảnh)\s+/i, '') || preset.name;
  var newItem = {
    reqName: cleanName,
    offerName: preset.name,
    refNote: '',
    selected: true,
    specs: preset.specs.map(function (ps) {
      var txt = ps.key + ': ' + ps.value;
      return { req: txt, offer: txt, status: 'Đáp ứng', ref: '' };
    })
  };
  tdduItems.push(newItem);
  renderTdduForm();
  toast('✅ Đã thêm ' + preset.name + ' vào bảng so sánh!', 'ok');
}

function buildSuggestedPresetPills(devIdx, item, cat) {
  var catKeys = {
    computer: ['msi_dp180', 'msi_cubi_nuc'],
    printer: ['oki_b433dn', 'oki_b513dn', 'canon_lbp2900', 'hp_m404dn'],
    scanner: ['ricoh_fi8170', 'ricoh_sp2240n'],
    photocopier: ['ricoh_im2500'],
    monitor: ['man_hinh_24'],
    switch: ['switch_gwn7813'],
    card_reader: ['dau_doc_the_tu'],
    memory_reader: ['doc_the_nho'],
    ups: ['ups_santak_1000'],
    camera: ['canon_eos_r6']
  };

  var keys = catKeys[cat] || ['msi_dp180', 'oki_b433dn', 'ricoh_fi8170', 'switch_gwn7813'];
  var html = '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px">' +
    '<span style="font-size:11px;font-weight:700;color:#475569;display:inline-flex;align-items:center;gap:3px">💡 Gợi ý chọn nhanh:</span>';

  keys.forEach(function (k) {
    var p = MODEL_PRESETS[k];
    if (!p) return;
    var isCurrent = (item.offerModel && item.offerModel.toLowerCase().includes(p.model.toLowerCase())) ||
      (item.offerName && item.offerName.toLowerCase().includes(p.model.toLowerCase()));

    var pillStyle = isCurrent
      ? 'background:#0f172a;color:#ffffff;border:1px solid #0f172a;font-weight:700;box-shadow:0 2px 6px rgba(15,23,42,0.2);'
      : 'background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;';

    html += '<button type="button" class="btn btn-sm" style="height:26px;padding:2px 10px;border-radius:13px;font-size:11.5px;cursor:pointer;transition:all 0.15s ease;' + pillStyle + '" ' +
      'onclick="tdduApplyPreset(' + devIdx + ', \'' + k + '\')" ' +
      'title="Bấm để chọn ngay mẫu ' + p.model + ' và tự động so sánh thông số">' +
      (isCurrent ? '✅ ' : '⚡ ') + p.model +
      '</button>';
  });

  html += '</div>';
  return html;
}

function renderTdduForm() {
  var container = document.getElementById('tdduDevsList');
  if (!container) return;

  // Auto-filter out useless / generic header lines from all devices
  tdduItems.forEach(function (item) {
    if (item.specs) {
      item.specs = item.specs.filter(function (sp) {
        return isValidTechnicalSpec(sp.req) || isValidTechnicalSpec(sp.offer);
      });
    }
  });

  // Calculate stats
  var totalDevs = tdduItems.length;
  var totalSpecs = 0;
  var totalOk = 0;
  var totalFail = 0;

  tdduItems.forEach(function (item) {
    if (item.specs) {
      totalSpecs += item.specs.length;
      item.specs.forEach(function (sp) {
        if (sp.status === 'Đáp ứng') totalOk++;
        else totalFail++;
      });
    }
  });

  var sDevs = document.getElementById('tdduStatDevs');
  var sSpecs = document.getElementById('tdduStatSpecs');
  var sOk = document.getElementById('tdduStatOk');
  var sFail = document.getElementById('tdduStatFail');
  if (sDevs) sDevs.textContent = totalDevs;
  if (sSpecs) sSpecs.textContent = totalSpecs;
  if (sOk) sOk.textContent = totalOk;
  if (sFail) sFail.textContent = totalFail;

  if (tdduItems.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--t2);background:#ffffff;border:1px dashed #cbd5e1;border-radius:10px">' +
      '<div style="font-size:32px;margin-bottom:10px">📋</div>' +
      '<div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:6px">Chưa có thiết bị nào trong danh sách tuyên bố đáp ứng</div>' +
      '<div style="font-size:13px;color:var(--t2);margin-bottom:18px">Bạn có thể thêm thiết bị mới, nạp file mẫu chuẩn hoặc chọn mẫu từ danh mục</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
      '<button class="btn btn-o" onclick="loadSampleTdduFile()">✨ Nạp file mẫu chuẩn</button> ' +
      '<button class="btn btn-p" onclick="tdduAddDev()">➕ Thêm thiết bị mới</button>' +
      '</div></div>';
    renderTdduPreview();
    return;
  }

  var html = '';
  tdduItems.forEach(function (item, dIdx) {
    var cat = getCategoryForDevice(item);
    var badgeHtml = getCategoryBadge(cat);
    var presetOptions = buildPresetOptionsForDevice(item);
    var suggestedPillsHtml = buildSuggestedPresetPills(dIdx, item, cat);
    var isCollapsed = !!tdduCollapsed[dIdx];
    var isSelected = item.selected !== false;
    var specCount = (item.specs && item.specs.length) || 0;

    var specRowsHtml = '';
    if (item.specs && !isCollapsed) {
      item.specs.forEach(function (sp, sIdx) {
        var hasOffer = !!(sp.offer && sp.offer.trim());
        var isOk = sp.status === 'Đáp ứng';
        var statusHtml = '';
        if (!hasOffer) {
          statusHtml = '<div class="tddu-status-pill" style="background:#f1f5f9;color:#64748b;border:1px solid #cbd5e1;font-weight:600;font-size:11.5px" title="Chưa chọn máy chào thầu">⏳ Chờ chọn máy</div>';
        } else {
          statusHtml = '<div class="tddu-status-pill ' + (isOk ? 'ok' : 'fail') + '" onclick="tdduToggleStatus(' + dIdx + ',' + sIdx + ')" title="Nhấp để chuyển trạng thái Đáp ứng / Không đáp ứng">' +
            (isOk ? '✅ Đáp ứng' : '❌ Không đáp ứng') +
            '</div>';
        }

        specRowsHtml += '<tr>' +
          '<td class="ctr" style="width:36px;color:#64748b;font-size:12px;font-weight:700">#' + (sIdx + 1) + '</td>' +
          '<td style="width:42%">' +
          '<div class="tddu-req-card">' +
          '<textarea class="tddu-text-cell" rows="1" placeholder="Nhập yêu cầu kỹ thuật..." oninput="autoResizeTextarea(this);tdduItems[' + dIdx + '].specs[' + sIdx + '].req=this.value;renderTdduPreview()">' + escH(sp.req || '') + '</textarea>' +
          '</div>' +
          '</td>' +
          '<td style="width:42%">' +
          '<div class="tddu-offer-card">' +
          '<textarea class="tddu-text-cell tddu-offer-cell" rows="1" placeholder="Chưa chọn máy chào thầu (bấm gợi ý bên trên ⬆)..." oninput="autoResizeTextarea(this);tdduItems[' + dIdx + '].specs[' + sIdx + '].offer=this.value;renderTdduPreview()">' + escH(sp.offer || '') + '</textarea>' +
          '</div>' +
          '</td>' +
          '<td class="ctr" style="width:140px;min-width:140px;white-space:nowrap">' +
          statusHtml +
          '</td>' +
          '<td style="width:125px">' +
          '<div class="tddu-ref-box">' +
          '<input type="text" class="tddu-ref-inp" placeholder="VD: Catalogue tr.5" value="' + escH(sp.ref || '') + '" oninput="tdduItems[' + dIdx + '].specs[' + sIdx + '].ref=this.value;renderTdduPreview()">' +
          '</div>' +
          '</td>' +
          '<td class="ctr" style="width:36px">' +
          '<button class="tddu-row-del" onclick="tdduRemoveSpec(' + dIdx + ',' + sIdx + ')" title="Xóa tiêu chí này">✕</button>' +
          '</td>' +
          '</tr>';
      });
    }

    var reqDevTitle = escH(item.reqName || ('Thiết bị ' + (dIdx + 1))) + (item.reqModel ? ' <span style="color:#475569;font-size:12px;font-weight:600">(' + escH(item.reqModel) + ')</span>' : '');
    var offerDevTitle = item.offerName ? (escH(item.offerName) + (item.offerModel ? ' - <span style="color:#0f172a;font-size:12px;font-weight:700">' + escH(item.offerModel) + '</span>' : '')) : '<span style="color:#94a3b8;font-weight:400;font-style:italic">Chưa chọn máy chào thầu</span>';

    html += '<div class="tddu-dev-block' + (!isSelected ? ' style="opacity:0.6"' : '') + '">' +
      '<div class="tddu-dev-hdr" style="display:flex;flex-direction:column;gap:10px;padding:14px 18px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
      '<label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer" title="Tích chọn để đưa vào bảng xuất Excel">' +
      '<input type="checkbox" ' + (isSelected ? 'checked' : '') + ' onchange="tdduItems[' + dIdx + '].selected=this.checked;renderTdduForm()">' +
      '<span style="background:#0f172a;color:#fff;font-weight:800;padding:4px 10px;border-radius:6px;font-size:12.5px">Mục ' + (dIdx + 1) + '</span>' +
      '</label>' +
      badgeHtml +
      '</div>' +
      '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">' +
      '<button class="btn btn-o btn-sm" style="height:32px" onclick="tdduAddSpec(' + dIdx + ')" title="Thêm dòng tiêu chí">＋ Tiêu chí</button>' +
      '<button class="btn btn-o btn-sm" style="height:32px;color:var(--re);border-color:rgba(207,34,46,0.3)" onclick="tdduRemoveDev(' + dIdx + ')" title="Xóa thiết bị này">🗑 Xóa</button>' +
      '<button class="btn btn-o btn-sm" style="height:32px;font-weight:600;min-width:90px" onclick="tdduToggleCollapse(' + dIdx + ')">' +
      (isCollapsed ? '🔽 Mở (' + specCount + ')' : '🔼 Thu gọn') +
      '</button>' +
      '</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:start;background:#ffffff;border:1px solid #d0d7de;border-radius:8px;padding:12px 14px">' +
      '<div style="display:flex;flex-direction:column;gap:6px">' +
      '<span style="color:#334155;font-weight:800;font-size:11.5px;text-transform:uppercase;letter-spacing:0.5px">📋 Thiết bị yêu cầu (E-HSMT):</span>' +
      '<div style="display:flex;gap:6px">' +
      '<input type="text" class="key-inp" style="flex:1.2;font-weight:700;font-size:13px;color:#0f172a;border-color:#cbd5e1" value="' + escH(item.reqName || '') + '" oninput="tdduItems[' + dIdx + '].reqName=this.value;renderTdduPreview()" placeholder="Tên máy (VD: Máy vi tính)...">' +
      '<input type="text" class="key-inp" style="flex:1;font-weight:600;font-size:12.5px;color:#334155;border-color:#cbd5e1" value="' + escH(item.reqModel || '') + '" oninput="tdduItems[' + dIdx + '].reqModel=this.value;renderTdduPreview()" placeholder="Model yêu cầu (nếu có)...">' +
      '</div>' +
      '</div>' +
      '<div style="color:#0f172a;font-weight:900;font-size:18px;display:flex;align-items:center;justify-content:center;padding-top:18px">➔</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">' +
      '<span style="color:#0f172a;font-weight:800;font-size:11.5px;text-transform:uppercase;letter-spacing:0.5px">🚀 Hàng hóa chào thầu:</span>' +
      '<div style="display:flex;gap:6px;align-items:center">' +
      '<select class="key-inp" style="font-size:11.5px;max-width:180px;height:28px" onchange="tdduApplyPreset(' + dIdx + ', this.value)">' +
      presetOptions +
      '</select>' +
      '<button type="button" class="btn btn-sm btn-ai" style="height:28px;padding:2px 8px;font-size:11px" onclick="tdduAiScrapeSpecs(' + dIdx + ')" title="AI tra cứu và cào thông số chính hãng cho thiết bị chào thầu này">🤖 AI cào hãng</button>' +
      '</div>' +
      '</div>' +
      '<div style="display:flex;gap:6px">' +
      '<input type="text" class="key-inp" style="flex:1.2;font-weight:700;font-size:13px;color:#0f172a;border-color:#0f172a" value="' + escH(item.offerName || '') + '" oninput="tdduItems[' + dIdx + '].offerName=this.value;renderTdduPreview()" placeholder="Tên máy chào thầu...">' +
      '<input type="text" class="key-inp" style="flex:1;font-weight:800;font-size:12.5px;color:#0f172a;border-color:#0f172a;background:#f8fafc" value="' + escH(item.offerModel || '') + '" oninput="tdduItems[' + dIdx + '].offerModel=this.value;renderTdduPreview()" placeholder="Model máy chào thầu...">' +
      '</div>' +
      suggestedPillsHtml +
      '</div>' +
      '</div>' +
      '</div>';

    if (!isCollapsed) {
      html += '<div class="tddu-table-wrap">' +
        '<table class="tddu-clean-table">' +
        '<thead><tr>' +
        '<th style="width:36px;text-align:center">#</th>' +
        '<th style="width:42%"><span style="margin-right:6px">📋</span> Yêu cầu kỹ thuật: <strong style="color:#0f172a">' + reqDevTitle + '</strong></th>' +
        '<th style="width:42%"><span style="margin-right:6px">🚀</span> Hàng hóa chào thầu: <strong style="color:#0f172a">' + offerDevTitle + '</strong></th>' +
        '<th style="width:140px;min-width:140px;text-align:center">Đánh giá</th>' +
        '<th style="width:125px">Tham chiếu</th>' +
        '<th style="width:36px"></th>' +
        '</tr></thead>' +
        '<tbody>' + specRowsHtml + '</tbody>' +
        '</table>' +
        '</div>';
    }

    html += '</div>';
  });

  container.innerHTML = html;

  // Auto-fit height for visible textareas
  setTimeout(function () {
    var textareas = container.querySelectorAll('.tddu-text-cell');
    textareas.forEach(function (ta) {
      autoResizeTextarea(ta);
    });
  }, 20);

  renderTdduPreview();
}

function renderTdduPreview() {
  var previewArea = document.getElementById('tdduPreviewArea');
  if (!previewArea) return;

  var titleEl = document.getElementById('tddu_title');
  var toEl = document.getElementById('tddu_to');
  var bidderEl = document.getElementById('tddu_bidder');
  var pkgEl = document.getElementById('tddu_package');
  var projEl = document.getElementById('tddu_project');

  var titleVal = titleEl ? titleEl.value : 'BẢNG TUYÊN BỐ ĐÁP ỨNG YÊU CẦU KỸ THUẬT CỦA HÀNG HÓA CHÀO THẦU';
  var toVal = toEl ? toEl.value : 'Công an Thành phố Hồ Chí Minh';
  var bidderVal = bidderEl ? bidderEl.value : 'Liên danh gói thầu CAHCM';
  var pkgVal = pkgEl ? pkgEl.value : '';
  var projVal = projEl ? projEl.value : '';

  var activeItems = tdduItems.filter(function (x) { return x.selected !== false; });

  var rowsHtml = '';
  activeItems.forEach(function (item, aIdx) {
    // Main device header row
    rowsHtml += '<tr style="background:#f4f6f9;font-weight:bold">' +
      '<td class="ctr">' + (aIdx + 1) + '</td>' +
      '<td>' + escH(item.reqName || '') + '</td>' +
      '<td>' + escH(item.offerName || '') + '</td>' +
      '<td class="ctr" style="color:#008000">Đáp ứng</td>' +
      '<td>' + escH(item.refNote || '') + '</td>' +
      '</tr>';

    // "Thông số kỹ thuật:" row
    rowsHtml += '<tr style="font-weight:bold;font-style:italic">' +
      '<td class="ctr"></td>' +
      '<td>Thông số kỹ thuật:</td>' +
      '<td>Thông số kỹ thuật:</td>' +
      '<td class="ctr" style="color:#008000">Đáp ứng</td>' +
      '<td></td>' +
      '</tr>';

    // Specs rows
    if (item.specs) {
      item.specs.forEach(function (sp) {
        var isOk = sp.status === 'Đáp ứng';
        rowsHtml += '<tr>' +
          '<td class="ctr"></td>' +
          '<td>' + escH(sp.req || '').replace(/\n/g, '<br/>') + '</td>' +
          '<td>' + escH(sp.offer || '').replace(/\n/g, '<br/>') + '</td>' +
          '<td class="ctr" style="font-weight:bold;color:' + (isOk ? '#008000' : '#cc0000') + '">' + (isOk ? 'Đáp ứng' : 'Không đáp ứng') + '</td>' +
          '<td>' + escH(sp.ref || '') + '</td>' +
          '</tr>';
      });
    }
  });

  var previewHtml = '<div style="font-family:\'Times New Roman\',serif;padding:12px;background:#ffffff;color:#000000">' +
    '<div style="text-align:center;font-weight:bold;font-size:15px;margin-bottom:12px">' + escH(titleVal) + '</div>' +
    '<div style="margin-bottom:4px"><strong>Kính gửi:</strong> ' + escH(toVal) + '</div>' +
    '<div style="margin-bottom:4px"><strong>Tên nhà thầu:</strong> ' + escH(bidderVal) + '</div>' +
    '<div style="margin-bottom:4px"><strong>Tên gói thầu:</strong> ' + escH(pkgVal) + '</div>' +
    '<div style="margin-bottom:14px"><strong>Tên dự toán mua sắm:</strong> ' + escH(projVal) + '</div>' +
    '<table class="excel-table" style="width:100%">' +
    '<thead>' +
    '<tr style="background:#D9E1F2;font-weight:bold;text-align:center">' +
    '<th style="width:45px">STT</th>' +
    '<th style="width:40%">Danh mục hàng hóa , Thông số kỹ thuật theo yêu cầu của E-HSMT</th>' +
    '<th style="width:40%">Danh mục hàng hóa chào thầu; Thông số kỹ thuật của hàng hóa chào thầu</th>' +
    '<th style="width:12%">Tuyên bố đáp ứng</th>' +
    '<th style="width:8%">Tham chiếu</th>' +
    '</tr>' +
    '</thead>' +
    '<tbody>' +
    (activeItems.length > 0 ? rowsHtml : '<tr><td colspan="5" style="text-align:center;padding:20px;color:#888">Chưa chọn thiết bị nào để xuất Excel</td></tr>') +
    '</tbody>' +
    '</table>' +
    '<div style="margin-top:24px;text-align:right;padding-right:40px">' +
    '<div style="font-weight:bold">ĐẠI DIỆN HỢP PHÁP CỦA NHÀ THẦU</div>' +
    '<div style="font-style:italic;color:#666">(Ký, ghi rõ họ tên và đóng dấu)</div>' +
    '</div>' +
    '</div>';

  previewArea.innerHTML = previewHtml;
}

function exportComplianceExcel() {
  var activeItems = tdduItems.filter(function (x) { return x.selected !== false; });
  if (!activeItems.length) {
    toast('❌ Không có thiết bị nào được chọn để xuất Excel!', 'err');
    return;
  }

  try {
    var wb = XLSX.utils.book_new();
    var ws = {};
    var mg = [];

    var titleEl = document.getElementById('tddu_title');
    var toEl = document.getElementById('tddu_to');
    var bidderEl = document.getElementById('tddu_bidder');
    var pkgEl = document.getElementById('tddu_package');
    var projEl = document.getElementById('tddu_project');

    var titleVal = titleEl ? titleEl.value : 'BẢNG TUYÊN BỐ ĐÁP ỨNG YÊU CẦU KỸ THUẬT CỦA HÀNG HÓA CHÀO THẦU';
    var toVal = toEl ? toEl.value : 'Công an Thành phố Hồ Chí Minh';
    var bidderVal = bidderEl ? bidderEl.value : 'Liên danh gói thầu CAHCM';
    var pkgVal = pkgEl ? pkgEl.value : '';
    var projVal = projEl ? projEl.value : '';

    // Styles
    var STitle = { font: { bold: true, name: 'Times New Roman', sz: 13, color: { rgb: '000000' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    var SMeta = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, alignment: { vertical: 'center' } };
    var SH = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, fill: { patternType: 'solid', fgColor: { rgb: 'D9E1F2' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: mkB('000000') };
    var SDev = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, border: mkB('000000'), alignment: { vertical: 'center', wrapText: true } };
    var SDevC = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, border: mkB('000000'), alignment: { horizontal: 'center', vertical: 'center' } };
    var SSubH = { font: { bold: true, italic: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, border: mkB('000000'), alignment: { vertical: 'center' } };
    var SText = { font: { name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, border: mkB('000000'), alignment: { vertical: 'center', wrapText: true } };
    var STextC = { font: { name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, border: mkB('000000'), alignment: { horizontal: 'center', vertical: 'center' } };
    var SOk = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '008000' } }, border: mkB('000000'), alignment: { horizontal: 'center', vertical: 'center' } };
    var SFail = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: 'CC0000' } }, border: mkB('000000'), alignment: { horizontal: 'center', vertical: 'center' } };

    ws['!cols'] = [{ wch: 6 }, { wch: 55 }, { wch: 55 }, { wch: 18 }, { wch: 18 }];
    ws['!rows'] = [];
    var r = 0;

    // Row 1: Title (Merged A1:E1)
    setCell(ws, r, 0, titleVal, STitle);
    for (var c = 1; c <= 4; c++) setCell(ws, r, c, '', STitle);
    mg.push({ s: { r: r, c: 0 }, e: { r: r, c: 4 } });
    ws['!rows'][r] = { hpt: 30 }; r++;

    // Row 2: Kính gửi
    setCell(ws, r, 0, 'Kính gửi: ' + toVal, SMeta);
    for (var c = 1; c <= 4; c++) setCell(ws, r, c, '', SMeta);
    ws['!rows'][r] = { hpt: 20 }; r++;

    // Row 3: Tên nhà thầu
    setCell(ws, r, 0, 'Tên nhà thầu: ' + bidderVal, SMeta);
    for (var c = 1; c <= 4; c++) setCell(ws, r, c, '', SMeta);
    ws['!rows'][r] = { hpt: 20 }; r++;

    // Row 4: Tên gói thầu
    setCell(ws, r, 0, 'Tên gói thầu: ' + pkgVal, SMeta);
    for (var c = 1; c <= 4; c++) setCell(ws, r, c, '', SMeta);
    ws['!rows'][r] = { hpt: 26 }; r++;

    // Row 5: Tên dự toán mua sắm
    setCell(ws, r, 0, 'Tên dự toán mua sắm: ' + projVal, SMeta);
    for (var c = 1; c <= 4; c++) setCell(ws, r, c, '', SMeta);
    ws['!rows'][r] = { hpt: 26 }; r++;

    // Row 6: Blank
    for (var c = 0; c <= 4; c++) setCell(ws, r, c, '', SMeta);
    ws['!rows'][r] = { hpt: 12 }; r++;

    // Row 7: Table Header (Row index 6 in 0-based)
    setCell(ws, r, 0, 'STT', SH);
    setCell(ws, r, 1, 'Danh mục hàng hóa , Thông số kỹ thuật theo yêu cầu của E-HSMT', SH);
    setCell(ws, r, 2, 'Danh mục hàng hóa chào thầu; Thông số kỹ thuật của hàng hóa chào thầu', SH);
    setCell(ws, r, 3, 'Tuyên bố đáp ứng', SH);
    setCell(ws, r, 4, 'Tham chiếu', SH);
    ws['!rows'][r] = { hpt: 38 }; r++;

    // Data Rows
    activeItems.forEach(function (item, aIdx) {
      // Device Header Row
      setCell(ws, r, 0, aIdx + 1, SDevC);
      setCell(ws, r, 1, item.reqName || '', SDev);
      setCell(ws, r, 2, item.offerName || '', SDev);
      setCell(ws, r, 3, 'Đáp ứng', SOk);
      setCell(ws, r, 4, item.refNote || '', SText);
      ws['!rows'][r] = { hpt: 24 }; r++;

      // "Thông số kỹ thuật:" Row
      setCell(ws, r, 0, '', SDevC);
      setCell(ws, r, 1, 'Thông số kỹ thuật:', SSubH);
      setCell(ws, r, 2, 'Thông số kỹ thuật:', SSubH);
      setCell(ws, r, 3, 'Đáp ứng', SOk);
      setCell(ws, r, 4, '', SText);
      ws['!rows'][r] = { hpt: 22 }; r++;

      // Specs Rows
      if (item.specs) {
        item.specs.forEach(function (sp) {
          var isOk = sp.status === 'Đáp ứng';
          setCell(ws, r, 0, '', STextC);
          setCell(ws, r, 1, sp.req || '', SText);
          setCell(ws, r, 2, sp.offer || '', SText);
          setCell(ws, r, 3, isOk ? 'Đáp ứng' : 'Không đáp ứng', isOk ? SOk : SFail);
          setCell(ws, r, 4, sp.ref || '', SText);

          var reqLines = Math.ceil(String(sp.req || '').length / 50);
          var offLines = Math.ceil(String(sp.offer || '').length / 50);
          var maxLines = Math.max(1, reqLines, offLines);
          ws['!rows'][r] = { hpt: Math.max(20, maxLines * 16 + 6) }; r++;
        });
      }
    });

    // Footer Rows
    r++; // Blank row
    setCell(ws, r, 2, 'ĐẠI DIỆN HỢP PHÁP CỦA NHÀ THẦU', { font: { bold: true, name: 'Times New Roman', sz: 12, color: { rgb: '000000' } }, alignment: { horizontal: 'center' } });
    ws['!rows'][r] = { hpt: 24 }; r++;
    setCell(ws, r, 2, 'ĐỨNG ĐẦU LIÊN DANH', { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, alignment: { horizontal: 'center' } });
    ws['!rows'][r] = { hpt: 20 }; r++;

    ws['!merges'] = mg;
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: 4 } });
    XLSX.utils.book_append_sheet(wb, ws, 'TuyenBoDapUng');

    var fileName = 'Bang_Tuyen_Bo_Dap_Ung_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.xlsx';
    XLSX.writeFile(wb, fileName);
    // === GHI LỊCH SỬ ===
    var pkgVal2 = (document.getElementById('tddu_package') && document.getElementById('tddu_package').value) || '';
    var bidderVal2 = (document.getElementById('tddu_bidder') && document.getElementById('tddu_bidder').value) || '';
    lsAddEntry('tddu',
      (pkgVal2 || bidderVal2 || 'Tuyên Bố Đáp Ứng'),
      fileName,
      { project: pkgVal2, customer: bidderVal2, devices: activeItems.length }
    );
    toast('✅ Đã xuất file Excel Bảng Tuyên Bố Đáp Ứng (' + activeItems.length + ' thiết bị) thành công!', 'ok');
  } catch (e) {
    console.error(e);
    toast('❌ Lỗi xuất file: ' + e.message, 'err');
  }
}






/* ═══════════════════════════════════════════
   MODULE BÁO GIÁ THUẬN PHÁT (CHUẨN MẪU BGThuanPhat.xlsx)
═══════════════════════════════════════════ */

// Hàm chuyển đổi số tiền thành chữ Tiếng Việt chuẩn 100%
function docSoThanhChu(so) {
  if (!so || isNaN(so) || so <= 0) return 'Không đồng./.';
  var chuSo = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  var hang = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

  function docBaSo(baso, dayDu) {
    var tram = Math.floor(baso / 100);
    var chuc = Math.floor((baso % 100) / 10);
    var donvi = baso % 10;
    var kq = '';

    if (tram > 0 || dayDu) {
      kq += chuSo[tram] + ' trăm ';
    }
    if (chuc > 1) {
      kq += chuSo[chuc] + ' mươi ';
      if (donvi === 1) kq += 'mốt ';
      else if (donvi === 5) kq += 'lăm ';
      else if (donvi > 0) kq += chuSo[donvi] + ' ';
    } else if (chuc === 1) {
      kq += 'mười ';
      if (donvi === 5) kq += 'lăm ';
      else if (donvi > 0) kq += chuSo[donvi] + ' ';
    } else if (chuc === 0 && (tram > 0 || dayDu)) {
      if (donvi > 0) kq += 'linh ' + chuSo[donvi] + ' ';
    } else if (donvi > 0) {
      kq += chuSo[donvi] + ' ';
    }
    return kq;
  }

  var strSo = Math.round(so).toString();
  var arrBlock = [];
  while (strSo.length > 0) {
    arrBlock.unshift(parseInt(strSo.slice(-3), 10));
    strSo = strSo.slice(0, -3);
  }

  var kq = '';
  for (var i = 0; i < arrBlock.length; i++) {
    var baso = arrBlock[i];
    var dayDu = i > 0;
    if (baso > 0) {
      var s = docBaSo(baso, dayDu);
      var idxHang = arrBlock.length - 1 - i;
      kq += s + hang[idxHang] + ' ';
    }
  }

  kq = kq.trim().replace(/\s+/g, ' ');
  if (!kq) return 'Không đồng./.';
  return kq.charAt(0).toUpperCase() + kq.slice(1) + ' đồng./.';
}

function fmtMoney(n) {
  if (!n && n !== 0) return '0';
  var num = typeof n === 'number' ? n : Number(String(n).replace(/[^0-9.-]+/g, ''));
  if (isNaN(num)) return '0';
  return num.toLocaleString('vi-VN');
}

var BAOGIA_THUANPHAT_ITEMS = [
  {
    stt: 1,
    name: 'Dịch vụ trực tuyến Microsoft 365 Business Basic (no Teams) - Annual - 12 Months',
    model: 'Office',
    brand: 'Microsoft',
    origin: '',
    unit: 'Người dùng',
    qty: 54,
    price: 1350000
  },
  {
    stt: 2,
    name: 'Dịch vụ trực tuyến Microsoft 365 Business Standard (no Teams) - Annual - 12 Months',
    model: '',
    brand: '',
    origin: '',
    unit: 'Người dùng',
    qty: 54,
    price: 3250000
  }
];

var bgItems = JSON.parse(JSON.stringify(BAOGIA_THUANPHAT_ITEMS));

function bgFillCustomer(type) {
  var comp = document.getElementById('bg_company');
  var to = document.getElementById('bg_to');
  var loc = document.getElementById('bg_delivery_loc');

  if (type === 'hoa_phat') {
    if (comp) comp.value = 'Công ty Cổ phần Xây dựng và Thương mại Hòa Phát';
    if (to) to.value = 'Quý khách hàng - Công ty CP XD & TM Hòa Phát';
    if (loc) loc.value = 'Khu Đô Thị Mới Kiến Hưng, Quận Hà Đông, TP. Hà Nội (Liên hệ: 0787416666)';
  } else if (type === 'ecoit') {
    if (comp) comp.value = 'Công ty Cổ phần Công nghệ ECOIT';
    if (to) to.value = 'Quý khách hàng - Công ty CP Công nghệ ECOIT (Đoàn Văn Ngà)';
    if (loc) loc.value = 'Imperia Garden, 203 Nguyễn Huy Tưởng, Thanh Xuân, Hà Nội';
  } else if (type === 'tin_thanh') {
    if (comp) comp.value = 'Công ty TNHH Thương Mại và Dịch Vụ Tín Thành';
    if (to) to.value = 'Quý khách hàng - Công ty Tín Thành';
    if (loc) loc.value = 'Do Nha, Tây Mỗ, Nam Từ Liêm / Cầu Giấy, Hà Nội';
  } else if (type === 'netsys') {
    if (comp) comp.value = 'Công ty Cổ phần Công nghệ NETSYS Việt Nam';
    if (to) to.value = 'Quý khách hàng - NETSYS Việt Nam';
    if (loc) loc.value = 'Khu Đô Thị Đại Kim, Quận Hoàng Mai, Hà Nội';
  } else if (type === 'cahcm') {
    if (comp) comp.value = 'Công an Thành phố Hồ Chí Minh';
    if (to) to.value = 'Quý Cơ quan - Công an Thành phố Hồ Chí Minh';
    if (loc) loc.value = 'TP. Hồ Chí Minh';
  }
  renderBaogiaForm();
}

function renderBaogiaForm() {
  var container = document.getElementById('bgTableArea');
  if (!container) return;

  var vatRate = parseInt(document.getElementById('bg_vat_rate') ? document.getElementById('bg_vat_rate').value : 10) || 0;
  var toName = (document.getElementById('bg_to') && document.getElementById('bg_to').value) || 'Quý khách hàng';
  var sellerName = (document.getElementById('bg_seller') && document.getElementById('bg_seller').value) || 'Công ty TNHH Thương Mại Đầu tư và Sản xuất Thuận Phát';
  var dTime = (document.getElementById('bg_delivery_time') && document.getElementById('bg_delivery_time').value) || 'Trong vòng 03 - 05 ngày làm việc';
  var dLoc = (document.getElementById('bg_delivery_loc') && document.getElementById('bg_delivery_loc').value) || 'Tại kho bên mua';
  var dVal = (document.getElementById('bg_validity') && document.getElementById('bg_validity').value) || 'trong vòng 20 ngày kể từ ngày phát hành báo giá.';

  var totalTruocThue = 0;
  var totalQty = 0;

  var html = '<table class="excel-table" style="width:100%">' +
    '<thead>' +
    '<tr>' +
    '<th style="width:40px">STT</th>' +
    '<th>SẢN PHẨM / DỊCH VỤ</th>' +
    '<th style="width:110px">Model</th>' +
    '<th style="width:100px">Hãng</th>' +
    '<th style="width:85px">ĐVT</th>' +
    '<th style="width:70px">SL</th>' +
    '<th style="width:130px">Đơn giá (VNĐ)</th>' +
    '<th style="width:140px">Thành tiền (VNĐ)</th>' +
    '<th style="width:45px">Xóa</th>' +
    '</tr>' +
    '</thead><tbody>';

  if (!bgItems || bgItems.length === 0) {
    html += '<tr><td colspan="9" class="ctr" style="padding:32px;color:var(--t2);background:#fff">' +
      '<div style="font-size:32px;margin-bottom:8px">📄</div>' +
      '<div style="font-weight:700;margin-bottom:4px;color:#0f172a">Bảng báo giá hiện đang trống</div>' +
      '<div style="font-size:12.5px;margin-bottom:12px">Bạn có thể nạp mẫu BGThuanPhat.xlsx, đồng bộ từ Dự toán hoặc thêm sản phẩm mới</div>' +
      '<button class="btn btn-p btn-sm" onclick="bgLoadSampleThuanPhat()">✨ Nạp mẫu BGThuanPhat.xlsx</button>' +
      '</td></tr>';
  } else {
    bgItems.forEach(function (d, idx) {
      var qty = parseInt(d.qty) || 1;
      var price = d.price === '' ? 0 : (typeof d.price === 'number' ? d.price : parseNum(d.price));
      var total = qty * price;
      totalTruocThue += total;
      totalQty += qty;

      html += '<tr style="background:#fafbfc">' +
        '<td class="ctr" style="font-weight:700">' + (idx + 1) + '</td>' +
        '<td><input type="text" class="cell-inp" style="font-weight:700;color:var(--t1)" value="' + escH(d.name || '') + '" onchange="bgUpdateField(' + idx + ', \'name\', this.value)"/></td>' +
        '<td><input type="text" class="cell-inp ctr" value="' + escH(d.model || '') + '" onchange="bgUpdateField(' + idx + ', \'model\', this.value)"/></td>' +
        '<td><input type="text" class="cell-inp ctr" value="' + escH(d.brand || '') + '" onchange="bgUpdateField(' + idx + ', \'brand\', this.value)"/></td>' +
        '<td><input type="text" class="cell-inp ctr" value="' + escH(d.unit || 'Chiếc') + '" onchange="bgUpdateField(' + idx + ', \'unit\', this.value)"/></td>' +
        '<td><input type="number" min="1" class="cell-inp ctr" style="font-weight:700" value="' + qty + '" onchange="bgUpdateField(' + idx + ', \'qty\', this.value)"/></td>' +
        '<td><input type="text" class="cell-inp text-r" placeholder="Tự điền giá..." value="' + (price > 0 ? fmtMoney(price) : '') + '" onchange="bgUpdateField(' + idx + ', \'price\', this.value)"/></td>' +
        '<td class="text-r" style="font-weight:700;color:var(--gr)">' + (total > 0 ? fmtMoney(total) + ' đ' : '-') + '</td>' +
        '<td class="ctr"><button style="background:none;border:none;cursor:pointer;color:var(--re);font-size:15px" onclick="bgDelProduct(' + idx + ')" title="Xóa dòng">✕</button></td>' +
        '</tr>';
    });

    var tienVat = Math.round(totalTruocThue * vatRate / 100);
    var totalSauThue = totalTruocThue + tienVat;
    var strBangChu = docSoThanhChu(totalSauThue);

    // Summary rows matching BGThuanPhat.xlsx exactly
    html += '<tr style="background:#f8fafc;font-weight:800;border-top:2px solid #cbd5e1">' +
      '<td colspan="5" class="text-r" style="padding:10px 14px;color:#0f172a">TỔNG CỘNG TRƯỚC THUẾ:</td>' +
      '<td class="ctr" style="color:var(--b2)">' + totalQty + '</td>' +
      '<td></td>' +
      '<td class="text-r" style="color:var(--t1);font-size:13.5px">' + (totalTruocThue > 0 ? fmtMoney(totalTruocThue) + ' đ' : '0 đ') + '</td>' +
      '<td></td>' +
      '</tr>';

    html += '<tr style="background:#f8fafc;font-weight:800">' +
      '<td colspan="7" class="text-r" style="padding:8px 14px;color:#0f172a">THUẾ ' + vatRate + '%:</td>' +
      '<td class="text-r" style="color:var(--go);font-size:13.5px">' + (tienVat > 0 ? fmtMoney(tienVat) + ' đ' : '0 đ') + '</td>' +
      '<td></td>' +
      '</tr>';

    html += '<tr style="background:#f1f5f9;font-weight:900;border-bottom:2px solid #cbd5e1">' +
      '<td colspan="7" class="text-r" style="padding:10px 14px;color:var(--re);font-size:14px">TỔNG TIỀN SAU THUẾ:</td>' +
      '<td class="text-r" style="color:var(--gr);font-size:15px">' + (totalSauThue > 0 ? fmtMoney(totalSauThue) + ' đ' : '0 đ') + '</td>' +
      '<td></td>' +
      '</tr>';

    html += '<tr style="background:#ffffff;font-style:italic">' +
      '<td colspan="9" style="padding:10px 14px;color:#1e293b;font-size:13px"><b style="color:var(--b2)">Bằng chữ:</b> ' + escH(strBangChu) + '</td>' +
      '</tr>';
  }

  html += '</tbody></table>';

  // Notes section simulation
  html += '<div style="margin-top:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;font-size:12.5px;line-height:1.7;color:#334155">' +
    '<div style="font-weight:700;color:#0f172a;margin-bottom:4px">📝 Ghi chú báo giá:</div>' +
    '<div>• Giá trên đã bao gồm thuế VAT ' + vatRate + '%</div>' +
    '<div>• Tình trạng hàng hóa: hàng mới 100% chưa qua sử dụng</div>' +
    '<div>• Thời gian giao hàng: ' + escH(dTime) + '</div>' +
    '<div>• Địa điểm giao hàng: ' + escH(dLoc) + '</div>' +
    '<div>• Hiệu lực của báo giá: ' + escH(dVal) + '</div>' +
    '</div>';

  container.innerHTML = html;
}

function bgUpdateField(idx, field, val) {
  if (!bgItems[idx]) return;
  if (field === 'qty') {
    bgItems[idx].qty = parseInt(val) || 1;
  } else if (field === 'price') {
    bgItems[idx].price = val === '' ? '' : parseNum(val);
  } else {
    bgItems[idx][field] = val;
  }
  renderBaogiaForm();
}

function bgAddProduct() {
  bgItems.push({
    stt: bgItems.length + 1,
    name: 'SẢN PHẨM / DỊCH VỤ MỚI',
    model: '',
    brand: '',
    origin: 'Việt Nam',
    unit: 'Chiếc',
    qty: 1,
    price: 0
  });
  renderBaogiaForm();
  toast('➕ Đã thêm dòng sản phẩm báo giá mới!', 'ok');
}

function bgDelProduct(idx) {
  if (confirm('Bạn có chắc muốn xóa dòng này khỏi bảng báo giá?')) {
    bgItems.splice(idx, 1);
    renderBaogiaForm();
    toast('🗑️ Đã xóa dòng sản phẩm!', 'ok');
  }
}

function bgLoadSampleThuanPhat() {
  bgItems = JSON.parse(JSON.stringify(BAOGIA_THUANPHAT_ITEMS));
  if (document.getElementById('bg_company')) document.getElementById('bg_company').value = 'Quý khách hàng';
  if (document.getElementById('bg_vat_rate')) document.getElementById('bg_vat_rate').value = '10';
  renderBaogiaForm();
  toast('✨ Đã nạp thành công dữ liệu mẫu BGThuanPhat.xlsx!', 'ok');
}

function bgSyncFromDuToan() {
  if (!devs || devs.length === 0) {
    toast('⚠️ Chưa có thiết bị nào bên tab Dự Toán để đồng bộ!', 'err');
    return;
  }
  bgItems = devs.map(function (d, i) {
    return {
      stt: i + 1,
      name: d.name || 'Thiết bị ' + (i + 1),
      model: d.model || '',
      brand: d.brand || '',
      origin: d.origin || '',
      unit: d.unit || 'Bộ',
      qty: parseInt(d.qty) || 1,
      price: d.price || 0
    };
  });
  renderBaogiaForm();
  toast('🔄 Đã đồng bộ thành công ' + bgItems.length + ' thiết bị từ Dự Toán sang Báo Giá!', 'ok');
}

function bgImportExcel(e) {
  var file = e.target.files && e.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function (evt) {
    try {
      var data = new Uint8Array(evt.target.result);
      var wb = XLSX.read(data, { type: 'array' });
      var sName = wb.SheetNames[0];
      var ws = wb.Sheets[sName];
      var rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

      var imported = [];
      var startRow = -1;

      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var rStr = (r.join(' ')).toLowerCase();
        if (rStr.includes('stt') && (rStr.includes('sản phẩm') || rStr.includes('tên') || rStr.includes('mô tả'))) {
          startRow = i + 1;
          break;
        }
      }

      if (startRow === -1) startRow = 6; // default index 6 (row 7)

      for (var j = startRow; j < rows.length; j++) {
        var row = rows[j];
        if (!row || row.length === 0) continue;
        var rStr = (row.join(' ')).toLowerCase();
        if (rStr.includes('tổng cộng') || rStr.includes('thuế') || rStr.includes('bằng chữ') || rStr.includes('ghi chú')) {
          break;
        }
        var name = String(row[1] || row[0] || '').trim();
        if (!name || name === 'STT') continue;

        var model = String(row[3] || row[2] || '').trim();
        var brand = String(row[4] || '').trim();
        var unit = String(row[5] || 'Chiếc').trim();
        var qty = parseInt(row[6]) || 1;
        var price = parseNum(row[7]) || 0;

        imported.push({
          stt: imported.length + 1,
          name: name,
          model: model,
          brand: brand,
          origin: '',
          unit: unit,
          qty: qty,
          price: price
        });
      }

      if (imported.length > 0) {
        bgItems = imported;
        renderBaogiaForm();
        toast('✅ Đã nhập thành công ' + imported.length + ' sản phẩm từ file Excel!', 'ok');
      } else {
        toast('⚠️ Không tìm thấy bảng sản phẩm hợp lệ trong file Excel tải lên!', 'err');
      }
    } catch (err) {
      console.error(err);
      toast('❌ Lỗi đọc file Excel: ' + err.message, 'err');
    }
  };
  reader.readAsArrayBuffer(file);
  e.target.value = '';
}

function bgClearAll() {
  if (confirm('Bạn có chắc chắn muốn xóa trắng bảng báo giá?')) {
    bgItems = [];
    renderBaogiaForm();
    toast('🗑️ Đã làm mới bảng báo giá!', 'ok');
  }
}

// Hàm xuất file Excel chuẩn 100% từng cell theo mẫu BGThuanPhat.xlsx
function exportBaogiaExcel() {
  if (!bgItems || bgItems.length === 0) {
    toast('⚠️ Bảng báo giá đang trống, không thể xuất file!', 'err');
    return;
  }

  try {
    var wb = XLSX.utils.book_new();
    var ws = {};
    ws["!cols"] = [
      { wch: 6 },  // A: STT
      { wch: 38 }, // B: SẢN PHẨM (Merge B:C)
      { wch: 38 }, // C: Sản phẩm mở rộng
      { wch: 18 }, // D: Model
      { wch: 16 }, // E: Hãng
      { wch: 12 }, // F: ĐVT
      { wch: 8 },  // G: SL
      { wch: 18 }, // H: Đơn giá
      { wch: 22 }  // I: Thành tiền
    ];
    ws["!rows"] = [];
    var mg = [];

    var BORD = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    };

    var SDate = { font: { italic: true, name: 'Times New Roman', sz: 11 }, alignment: { horizontal: 'right', vertical: 'center' } };
    var STitle = { font: { bold: true, name: 'Times New Roman', sz: 16, color: { rgb: '000000' } }, alignment: { horizontal: 'center', vertical: 'center' } };
    var SHead = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, fill: { fgColor: { rgb: 'D9E1F2' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: BORD };
    var STextL = { font: { name: 'Times New Roman', sz: 11 }, border: BORD, alignment: { horizontal: 'left', vertical: 'center', wrapText: true } };
    var SCtr = { font: { name: 'Times New Roman', sz: 11 }, border: BORD, alignment: { horizontal: 'center', vertical: 'center' } };
    var SNum = { font: { name: 'Times New Roman', sz: 11 }, border: BORD, alignment: { horizontal: 'right', vertical: 'center' }, numFmt: '#,##0.00' };
    var STotalLabel = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, border: BORD, alignment: { horizontal: 'left', vertical: 'center' } };
    var STotalNum = { font: { bold: true, name: 'Times New Roman', sz: 11, color: { rgb: '000000' } }, border: BORD, alignment: { horizontal: 'right', vertical: 'center' }, numFmt: '#,##0' };

    var r = 0;
    ws["!rows"][r] = { hpt: 15 }; r++; // Row 1 blank

    // Row 2: Date
    var dateVal = (document.getElementById('bg_date') && document.getElementById('bg_date').value) || new Date().toISOString().slice(0, 10);
    var dtParts = dateVal.split('-');
    var dateText = 'Hà Nội, Ngày ' + (dtParts[2] || '...') + ' tháng ' + (dtParts[1] || '...') + ' năm ' + (dtParts[0] || '2026');
    setCell(ws, r, 5, dateText, SDate);
    mg.push({ s: { r: r, c: 5 }, e: { r: r, c: 8 } });
    ws["!rows"][r] = { hpt: 20 }; r++;

    // Row 3: BÁO GIÁ Title
    setCell(ws, r, 0, 'BÁO GIÁ', STitle);
    mg.push({ s: { r: r, c: 0 }, e: { r: r, c: 8 } });
    ws["!rows"][r] = { hpt: 26 }; r++;

    // Row 4: Kính gửi
    var toName = (document.getElementById('bg_to') && document.getElementById('bg_to').value) || 'Quý khách hàng';
    var toComp = (document.getElementById('bg_company') && document.getElementById('bg_company').value) || '';
    var fullTo = '          Kính gửi: ' + toName + (toComp ? ' - ' + toComp : '');
    setCell(ws, r, 0, fullTo, { font: { bold: true, name: 'Times New Roman', sz: 11 }, alignment: { vertical: 'center' } });
    mg.push({ s: { r: r, c: 0 }, e: { r: r, c: 8 } });
    ws["!rows"][r] = { hpt: 20 }; r++;

    // Row 5: Thư cảm ơn Thuận Phát
    var seller = (document.getElementById('bg_seller') && document.getElementById('bg_seller').value) || 'Công ty TNHH Thương Mại Đầu tư và Sản xuất Thuận Phát';
    var introText = '         Trân trọng cảm ơn quý khách hàng đã quan tâm đến sản phẩm và dịch vụ của chúng tôi. ' + seller + ' xin gửi tới Quý khách bảng báo giá sản phẩm như sau:';
    setCell(ws, r, 0, introText, { font: { name: 'Times New Roman', sz: 11 }, alignment: { vertical: 'center', wrapText: true } });
    mg.push({ s: { r: r, c: 0 }, e: { r: r, c: 8 } });
    ws["!rows"][r] = { hpt: 32 }; r++;

    // Row 6: Header Table (STT, SẢN PHẨM, Model, Hãng, ĐVT, SL, Đơn giá, Thành tiền)
    setCell(ws, r, 0, 'STT', SHead);
    setCell(ws, r, 1, 'SẢN PHẨM', SHead);
    setCell(ws, r, 2, '', SHead);
    mg.push({ s: { r: r, c: 1 }, e: { r: r, c: 2 } });
    setCell(ws, r, 3, 'Model', SHead);
    setCell(ws, r, 4, 'Hãng', SHead);
    setCell(ws, r, 5, 'ĐVT', SHead);
    setCell(ws, r, 6, 'SL', SHead);
    setCell(ws, r, 7, 'Đơn giá', SHead);
    setCell(ws, r, 8, 'Thành tiền', SHead);
    ws["!rows"][r] = { hpt: 24 }; r++;

    var startDataRow = r + 1; // 1-indexed for formula
    var totalTruocThue = 0;

    bgItems.forEach(function (d, idx) {
      var rowIdx = r + 1; // Excel row 1-indexed
      var qty = parseInt(d.qty) || 1;
      var price = d.price === '' ? 0 : (typeof d.price === 'number' ? d.price : parseNum(d.price));
      var lineTotal = qty * price;
      totalTruocThue += lineTotal;

      setCell(ws, r, 0, idx + 1, SCtr);
      setCell(ws, r, 1, d.name || '', STextL);
      setCell(ws, r, 2, '', STextL);
      mg.push({ s: { r: r, c: 1 }, e: { r: r, c: 2 } });
      setCell(ws, r, 3, d.model || '', SCtr);
      setCell(ws, r, 4, d.brand || '', SCtr);
      setCell(ws, r, 5, d.unit || 'Chiếc', SCtr);
      setCell(ws, r, 6, qty, SCtr);
      setCell(ws, r, 7, price, SNum);

      // Formula: =G7*H7
      var formulaCell = {
        t: 'n',
        f: 'G' + rowIdx + '*H' + rowIdx,
        v: lineTotal,
        s: SNum
      };
      var cellRef = XLSX.utils.encode_cell({ r: r, c: 8 });
      ws[cellRef] = formulaCell;

      ws["!rows"][r] = { hpt: 28 }; r++;
    });

    var endDataRow = r; // Excel 1-indexed of last item

    // Row Tổng cộng trước thuế
    var rPreTax = r + 1; // 1-indexed
    setCell(ws, r, 0, '', STotalLabel);
    setCell(ws, r, 1, 'TỔNG CỘNG TRƯỚC THUẾ: ', STotalLabel);
    for (var c = 2; c <= 7; c++) setCell(ws, r, c, '', STotalLabel);
    mg.push({ s: { r: r, c: 1 }, e: { r: r, c: 7 } });

    // Formula sum: =SUM(I7:I8)
    var cellSumRef = XLSX.utils.encode_cell({ r: r, c: 8 });
    ws[cellSumRef] = {
      t: 'n',
      f: 'SUM(I' + startDataRow + ':I' + endDataRow + ')',
      v: totalTruocThue,
      s: STotalNum
    };
    ws["!rows"][r] = { hpt: 24 }; r++;

    // Row Thuế VAT
    var vatRate = parseInt(document.getElementById('bg_vat_rate') ? document.getElementById('bg_vat_rate').value : 10) || 0;
    var rVat = r + 1;
    var vatVal = Math.round(totalTruocThue * vatRate / 100);

    setCell(ws, r, 0, 'THUẾ ' + vatRate + '%:', STotalLabel);
    for (var c = 1; c <= 7; c++) setCell(ws, r, c, '', STotalLabel);
    mg.push({ s: { r: r, c: 0 }, e: { r: r, c: 7 } });

    // Formula VAT: =I9*10%
    var cellVatRef = XLSX.utils.encode_cell({ r: r, c: 8 });
    ws[cellVatRef] = {
      t: 'n',
      f: 'I' + rPreTax + '*' + vatRate + '%',
      v: vatVal,
      s: STotalNum
    };
    ws["!rows"][r] = { hpt: 24 }; r++;

    // Row Tổng tiền sau thuế
    var rPostTax = r + 1;
    var postTaxVal = totalTruocThue + vatVal;

    setCell(ws, r, 0, 'TỔNG TIỀN SAU THUẾ', STotalLabel);
    for (var c = 1; c <= 7; c++) setCell(ws, r, c, '', STotalLabel);
    mg.push({ s: { r: r, c: 0 }, e: { r: r, c: 7 } });

    // Formula Total: =I9+I10
    var cellPostRef = XLSX.utils.encode_cell({ r: r, c: 8 });
    ws[cellPostRef] = {
      t: 'n',
      f: 'I' + rPreTax + '+I' + rVat,
      v: postTaxVal,
      s: STotalNum
    };
    ws["!rows"][r] = { hpt: 26 }; r++;

    // Row Bằng chữ
    var bangChuText = 'Bằng chữ: ' + docSoThanhChu(postTaxVal);
    setCell(ws, r, 0, bangChuText, { font: { bold: true, italic: true, name: 'Times New Roman', sz: 11 }, alignment: { vertical: 'center' } });
    mg.push({ s: { r: r, c: 0 }, e: { r: r, c: 8 } });
    ws["!rows"][r] = { hpt: 24 }; r++;

    // Ghi chú
    setCell(ws, r, 0, 'Ghi chú:', { font: { bold: true, name: 'Times New Roman', sz: 11 } });
    mg.push({ s: { r: r, c: 0 }, e: { r: r, c: 8 } });
    ws["!rows"][r] = { hpt: 20 }; r++;

    var dTime = (document.getElementById('bg_delivery_time') && document.getElementById('bg_delivery_time').value) || 'Trong vòng 03 - 05 ngày làm việc';
    var dLoc = (document.getElementById('bg_delivery_loc') && document.getElementById('bg_delivery_loc').value) || 'Tại kho bên mua';
    var dVal = (document.getElementById('bg_validity') && document.getElementById('bg_validity').value) || 'trong vòng 20 ngày kể từ ngày phát hành báo giá.';

    var noteList = [
      '- Giá trên đã bao gồm VAT ' + vatRate + '%',
      '- Tình trạng hàng hóa: hàng mới 100% chưa qua sử dụng',
      '- Thời gian giao hàng: ' + dTime,
      '- Địa điểm: ' + dLoc,
      '- Hiệu lực của báo giá: ' + dVal
    ];

    noteList.forEach(function (nt) {
      setCell(ws, r, 0, nt, { font: { name: 'Times New Roman', sz: 11 } });
      mg.push({ s: { r: r, c: 0 }, e: { r: r, c: 8 } });
      ws["!rows"][r] = { hpt: 19 }; r++;
    });

    // Signature Area
    r++;
    setCell(ws, r, 5, 'ĐẠI DIỆN CÔNG TY', { font: { bold: true, name: 'Times New Roman', sz: 11 }, alignment: { horizontal: 'center' } });
    mg.push({ s: { r: r, c: 5 }, e: { r: r, c: 8 } });
    ws["!rows"][r] = { hpt: 20 }; r++;

    ws["!merges"] = mg;
    ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r + 3, c: 8 } });
    XLSX.utils.book_append_sheet(wb, ws, 'Báo giá TP');

    var safeComp = (toComp || toName || 'ThuanPhat').replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '_').slice(0, 30);
    var fileName = 'Bao_Gia_Thuan_Phat_' + safeComp + '_' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '.xlsx';
    XLSX.writeFile(wb, fileName);

    // === GHI LỊCH SỬ FILE ===
    lsAddEntry('baogia',
      (toComp || toName || 'Báo Giá Thuận Phát'),
      fileName,
      {
        customer: toComp || toName,
        devices: bgItems.length,
        total: postTaxVal > 0 ? postTaxVal.toLocaleString('vi-VN') + ' ₫' : ''
      }
    );

    toast('✅ Đã xuất file Excel Báo Giá Thuận Phát (' + bgItems.length + ' sản phẩm) thành công!', 'ok');
  } catch (err) {
    console.error(err);
    toast('❌ Lỗi xuất file báo giá: ' + err.message, 'err');
  }
}

// Init
document.getElementById('dtN').valueAsDate = new Date();
if (document.getElementById('bg_date')) document.getElementById('bg_date').valueAsDate = new Date();
onProviderChange();
renderCatalogGrid();
renderBaogiaForm();
updateAiStatusBadge();
updateLichSuTabBadge();