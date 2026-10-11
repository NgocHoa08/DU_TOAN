/**
 * ══════════════════════════════════════════════════════════════════════
 * FORM BUILDER & SHEET STUDIO (THUẬN PHÁT TOOL DỰ TOÁN)
 * ══════════════════════════════════════════════════════════════════════
 * Chức năng:
 *  1. FORM BUILDER (Tùy biến ô nhập liệu):
 *     - Kéo thả sắp xếp thứ tự ô nhập liệu (HTML5 Drag & Drop)
 *     - Co giãn độ rộng (25%, 33.3%, 50%, 66.6%, 100%)
 *     - Thêm ô mới, ẩn/hiện, sửa nhãn
 *  2. SHEET STUDIO (KÉO TAY TRỰC TIẾP TRÊN TỜ FORM THẬT A4):
 *     - Hiển thị trực quan tờ giấy in thật A4 của Báo Giá & Biên Bản Bàn Giao
 *     - Dùng chuột kéo thả di chuyển vị trí các khối (Logo, Khách hàng, Bảng giá, Điều khoản, Chữ ký...)
 *     - Nút mũi tên ⬆️ ⬇️ di chuyển nhanh giữa các khối
 *     - Lưu thành Mẫu Form Thật riêng biệt (Templates)
 *     - Xuất file Word/Excel tuân thủ 100% thứ tự các khối đã kéo
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'TOOL_DUTOAN_FORM_LAYOUT_TEMPLATES_V1';
  var SHEET_STORAGE_KEY = 'TOOL_DUTOAN_SHEET_LAYOUTS_V1';

  // ══════════════════════════════════════════════════════════════════
  // PHẦN 1: MẪU Ô NHẬP LIỆU CÁC FORM (INPUT FIELD SCHEMAS)
  // ══════════════════════════════════════════════════════════════════
  var DEFAULT_FORM_SCHEMAS = {
    'dutoan_info': {
      title: 'Thông Tin Dự Án / Gói Thầu',
      containerId: 'fgrid-dutoan-info',
      activeTemplateId: 'default',
      templates: {
        'default': {
          name: 'Mẫu chuẩn mặc định',
          fields: [
            { id: 'pjN', label: 'Tên dự án / gói thầu *', type: 'text', width: '100%', placeholder: 'VD: Đầu tư nâng cấp hạ tầng số...', visible: true },
            { id: 'gpN', label: 'Tên nhóm danh mục thiết bị', type: 'text', width: '100%', placeholder: 'VD: Hệ thống trang thiết bị CNTT...', visible: true },
            { id: 'orgN', label: 'Đơn vị lập dự toán', type: 'text', width: '50%', placeholder: 'VD: CÔNG TY TNHH THƯƠNG MẠI...', visible: true },
            { id: 'dtN', label: 'Ngày lập', type: 'date', width: '50%', visible: true }
          ]
        }
      }
    },
    'baogia_info': {
      title: 'Thông Tin Bảng Báo Giá',
      containerId: 'fgrid-baogia-info',
      activeTemplateId: 'default',
      templates: {
        'default': {
          name: 'Mẫu chuẩn mặc định',
          fields: [
            { id: 'bg_to', label: 'Kính gửi (Người nhận / Khách hàng)', type: 'text', width: '50%', placeholder: 'Quý khách hàng...', visible: true },
            { id: 'bg_company', label: 'Tên Công ty / Cơ quan nhận', type: 'text', width: '50%', placeholder: 'Nhập tên đơn vị nhận báo giá...', visible: true },
            { id: 'bg_seller', label: 'Đơn vị gửi báo giá', type: 'text', width: '100%', placeholder: 'Công ty TNHH Thương Mại...', visible: true },
            { id: 'bg_date', label: 'Ngày báo giá', type: 'date', width: '50%', visible: true },
            { id: 'bg_vat_rate', label: 'Thuế suất VAT (%)', type: 'select', width: '50%', options: [{ val: '10', label: '10% (Hiện hành)' }, { val: '8', label: '8% (Ưu đãi)' }, { val: '0', label: '0% (Không VAT)' }], visible: true },
            { id: 'bg_delivery_time', label: 'Thời gian giao hàng', type: 'text', width: '50%', placeholder: 'Trong vòng 03 - 05 ngày làm việc', visible: true },
            { id: 'bg_delivery_loc', label: 'Địa điểm giao hàng', type: 'text', width: '50%', placeholder: 'Tại kho bên mua hoặc chỉ định', visible: true },
            { id: 'bg_validity', label: 'Hiệu lực của báo giá', type: 'text', width: '100%', placeholder: 'Trong vòng 20 ngày...', visible: true }
          ]
        }
      }
    },
    'bbbg_seller': {
      title: 'Bên Bán (Bên A) - Biên Bản Bàn Giao',
      containerId: 'fgrid-bbbg-seller',
      activeTemplateId: 'default',
      templates: {
        'default': {
          name: 'Mẫu chuẩn mặc định',
          fields: [
            { id: 'bbA_name', label: 'Tên công ty bên bán', type: 'text', width: '100%', placeholder: 'CÔNG TY TNHH...', visible: true },
            { id: 'bbA_addr', label: 'Địa chỉ bên bán', type: 'text', width: '100%', placeholder: 'Địa chỉ công ty...', visible: true },
            { id: 'bbA_rep', label: 'Người đại diện', type: 'text', width: '50%', placeholder: 'Họ và tên người đại diện', visible: true },
            { id: 'bbA_pos', label: 'Chức vụ', type: 'text', width: '50%', placeholder: 'Kỹ thuật / Giám đốc', visible: true }
          ]
        }
      }
    },
    'bbbg_buyer': {
      title: 'Bên Mua (Bên B) - Biên Bản Bàn Giao',
      containerId: 'fgrid-bbbg-buyer',
      activeTemplateId: 'default',
      templates: {
        'default': {
          name: 'Mẫu chuẩn mặc định',
          fields: [
            { id: 'bbB_name', label: 'Tên công ty bên mua', type: 'text', width: '100%', placeholder: 'Nhập tên công ty mua...', visible: true },
            { id: 'bbB_addr', label: 'Địa chỉ công ty bên mua', type: 'text', width: '100%', placeholder: 'Địa chỉ bên mua...', visible: true },
            { id: 'bbB_ship', label: 'Địa chỉ nhận hàng thực tế', type: 'text', width: '100%', placeholder: 'Địa chỉ giao/nhận hàng...', visible: true },
            { id: 'bbB_rep', label: 'Người đại diện bên mua', type: 'text', width: '50%', placeholder: 'Đại diện bên nhận', visible: true },
            { id: 'bbB_pos', label: 'Chức vụ', type: 'text', width: '50%', placeholder: 'Giám đốc / Kỹ thuật', visible: true }
          ]
        }
      }
    },
    'tddu_tender': {
      title: 'Thông Tin Hồ Sơ Gói Thầu (TDDU)',
      containerId: 'fgrid-tddu-info',
      activeTemplateId: 'default',
      templates: {
        'default': {
          name: 'Mẫu chuẩn mặc định',
          fields: [
            { id: 'tddu_title', label: 'Tiêu đề bảng đáp ứng', type: 'text', width: '100%', placeholder: 'BẢNG TUYÊN BỐ ĐÁP ỨNG...', visible: true },
            { id: 'tddu_to', label: 'Kính gửi (Bên mời thầu / Chủ đầu tư)', type: 'text', width: '100%', placeholder: 'Tên chủ đầu tư / Bên mời thầu', visible: true },
            { id: 'tddu_bidder', label: 'Tên nhà thầu', type: 'text', width: '50%', placeholder: 'Tên đơn vị dự thầu', visible: true },
            { id: 'tddu_package', label: 'Tên gói thầu', type: 'text', width: '50%', placeholder: 'Tên gói thầu...', visible: true },
            { id: 'tddu_project', label: 'Tên dự toán mua sắm', type: 'text', width: '100%', placeholder: 'Tên dự án / dự toán...', visible: true }
          ]
        }
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════
  // PHẦN 2: MẪU KHỐI TRÊN TỜ FORM THẬT A4 (SHEET BLOCK SCHEMAS)
  // ══════════════════════════════════════════════════════════════════
  var DEFAULT_SHEET_SCHEMAS = {
    // 📄 TỜ GIẤY BÁO GIÁ THẬT (A4)
    'baogia_sheet': {
      title: 'Tờ Báo Giá A4 Chuẩn Mẫu (Thuận Phát / Lynk Core)',
      activeTemplateId: 'default',
      templates: {
        'default': {
          name: 'Mẫu chuẩn A4 gốc',
          blocks: [
            { id: 'bg_logo', title: '🏢 Header & Logo Công Ty', visible: true },
            { id: 'bg_header', title: '📅 Tiêu Đề Báo Giá & Ngày Tháng', visible: true },
            { id: 'bg_customer', title: '👤 Kính Gửi & Thông Tin Khách Hàng', visible: true },
            { id: 'bg_intro', title: '✉️ Lời Chào & Thư Ngỏ', visible: true },
            { id: 'bg_table', title: '📊 Bảng Danh Mục Sản Phẩm & Đơn Giá', visible: true },
            { id: 'bg_terms', title: '📜 Các Điều Khoản (Giao Hàng, Thanh Toán, Bảo Hành...)', visible: true },
            { id: 'bg_closing', title: '🤝 Lời Kết Cảm Ơn', visible: true },
            { id: 'bg_signature', title: '✍️ Chữ Ký & Đại Diện Công Ty', visible: true }
          ]
        }
      }
    },

    // 📄 TỜ GIẤY BIÊN BẢN BÀN GIAO THẬT (WORD A4)
    'bbbg_sheet': {
      title: 'Tờ Biên Bản Bàn Giao Hàng Hóa A4 (Chuẩn Word)',
      activeTemplateId: 'default',
      templates: {
        'default': {
          name: 'Mẫu chuẩn Word gốc',
          blocks: [
            { id: 'bb_country', title: '🇻🇳 Quốc Hiệu & Tiêu Ngữ', visible: true },
            { id: 'bb_title', title: '📋 Tiêu Đề Biên Bản Bàn Giao & Ngày Lập', visible: true },
            { id: 'bb_seller', title: '🏢 Đại Diện Bên Bán (Bên A)', visible: true },
            { id: 'bb_buyer', title: '🏢 Đại Diện Bên Mua (Bên B)', visible: true },
            { id: 'bb_table', title: '📦 Bảng Danh Mục Thiết Bị & Số Serial (2 cột)', visible: true },
            { id: 'bb_terms', title: '⚖️ Điều Khoản Cam Kết & Nghiệm Thu', visible: true },
            { id: 'bb_sign', title: '✍️ Chữ Ký Hai Bên (Đại diện A & B)', visible: true }
          ]
        }
      }
    }
  };

  // State
  var formStore = {};
  var sheetStore = {};
  var editModeState = {};
  var sheetEditState = {};
  var draggedFieldId = null;
  var draggedFormKey = null;
  var draggedBlockId = null;
  var draggedSheetKey = null;

  // Đọc dữ liệu đã lưu
  function loadAllStores() {
    try {
      var savedForms = localStorage.getItem(STORAGE_KEY);
      if (savedForms) {
        formStore = Object.assign(JSON.parse(JSON.stringify(DEFAULT_FORM_SCHEMAS)), JSON.parse(savedForms));
      } else {
        formStore = JSON.parse(JSON.stringify(DEFAULT_FORM_SCHEMAS));
      }

      var savedSheets = localStorage.getItem(SHEET_STORAGE_KEY);
      if (savedSheets) {
        sheetStore = Object.assign(JSON.parse(JSON.stringify(DEFAULT_SHEET_SCHEMAS)), JSON.parse(savedSheets));
      } else {
        sheetStore = JSON.parse(JSON.stringify(DEFAULT_SHEET_SCHEMAS));
      }
    } catch (e) {
      console.error('Lỗi khi tải cấu hình form & sheet:', e);
      formStore = JSON.parse(JSON.stringify(DEFAULT_FORM_SCHEMAS));
      sheetStore = JSON.parse(JSON.stringify(DEFAULT_SHEET_SCHEMAS));
    }
  }
  loadAllStores();

  function saveFormStore() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(formStore)); } catch (e) {}
  }

  function saveSheetStore() {
    try { localStorage.setItem(SHEET_STORAGE_KEY, JSON.stringify(sheetStore)); } catch (e) {}
  }

  // ══════════════════════════════════════════════════════════════════
  // SHEET STUDIO ENGINE (KÉO TAY TRÊN TỜ FORM THẬT A4)
  // ══════════════════════════════════════════════════════════════════
  function getActiveSheetBlocks(sheetKey) {
    if (!sheetStore || Object.keys(sheetStore).length === 0) {
      loadAllStores();
    }
    var sh = sheetStore[sheetKey] || (DEFAULT_SHEET_SCHEMAS && DEFAULT_SHEET_SCHEMAS[sheetKey]);
    if (!sh) return [];
    var tplId = sh.activeTemplateId || 'default';
    var tpl = (sh.templates && (sh.templates[tplId] || sh.templates['default'])) || null;
    return (tpl && tpl.blocks) ? tpl.blocks : [];
  }

  function getSheetBlock(sheetKey, blockId) {
    var blocks = getActiveSheetBlocks(sheetKey);
    var b = blocks.find(function (it) { return it.id === blockId; });
    if (!b) {
      b = { id: blockId, title: blockId, visible: true, fontSize: 13, paddingY: 8 };
      blocks.push(b);
    }
    return b;
  }

  function triggerSheetReRender(sheetKey) {
    if (sheetKey === 'baogia_sheet' && typeof window.renderBaogiaForm === 'function') {
      window.renderBaogiaForm();
    } else if (sheetKey === 'bbbg_sheet') {
      if (typeof window.renderHandoverForm === 'function') window.renderHandoverForm();
      if (typeof window.renderHandoverSheetPreview === 'function') window.renderHandoverSheetPreview();
    }
  }

  function getSheetBlockOrder(sheetKey) {
    var blocks = getActiveSheetBlocks(sheetKey);
    var order = blocks.filter(function (b) { return b.visible !== false; }).map(function (b) { return b.id; });
    if (order.length === 0 && DEFAULT_SHEET_SCHEMAS && DEFAULT_SHEET_SCHEMAS[sheetKey]) {
      var defTpl = DEFAULT_SHEET_SCHEMAS[sheetKey].templates['default'];
      if (defTpl && defTpl.blocks) {
        return defTpl.blocks.map(function (b) { return b.id; });
      }
    }
    return order;
  }

  function isSheetEditing(sheetKey) {
    return !!sheetEditState[sheetKey];
  }

  function toggleSheetEdit(sheetKey) {
    sheetEditState[sheetKey] = !sheetEditState[sheetKey];
    triggerSheetReRender(sheetKey);
    if (sheetEditState[sheetKey]) {
      if (typeof window.toast === 'function') {
        window.toast('🛠️ Đã bật chế độ KÉO TAY & CHỈNH SỬA CHI TIẾT TỜ GIẤY! Bấm A+/A- để chỉnh cỡ chữ, rê chuột kéo vị trí khối.', 'ok');
      }
    } else {
      if (typeof window.toast === 'function') {
        window.toast('✨ Đã hoàn tất chỉnh sửa bố cục tờ giấy thật!', 'ok');
      }
    }
  }

  function switchSheetTemplate(sheetKey, templateId) {
    var sh = sheetStore[sheetKey];
    if (!sh || !sh.templates[templateId]) return;
    sh.activeTemplateId = templateId;
    saveSheetStore();
    triggerSheetReRender(sheetKey);
    if (typeof window.toast === 'function') {
      window.toast('📋 Đã áp dụng mẫu tờ giấy: ' + sh.templates[templateId].name, 'ok');
    }
  }

  function saveSheetTemplatePrompt(sheetKey) {
    var sh = sheetStore[sheetKey];
    if (!sh) return;
    var name = prompt('Nhập tên cho Mẫu Tờ Giấy Form Thật mới (VD: Mẫu Báo Giá Chữ To 14px, Mẫu Báo Giá Tinh Gọn A4, Mẫu Biên Bản Rộng Rãi...):', 'Mẫu Tờ Giấy ' + (Object.keys(sh.templates).length + 1));
    if (!name || !name.trim()) return;

    var tplId = 'sheet_tpl_' + Date.now();
    var currentBlocks = JSON.parse(JSON.stringify(getActiveSheetBlocks(sheetKey)));

    sh.templates[tplId] = {
      name: name.trim(),
      createdAt: new Date().toISOString(),
      blocks: currentBlocks,
      sheetScale: sh.sheetScale || 100,
      fontFamily: sh.fontFamily || ''
    };
    sh.activeTemplateId = tplId;

    saveSheetStore();
    triggerSheetReRender(sheetKey);
    if (typeof window.toast === 'function') {
      window.toast('💾 Đã lưu thành công Mẫu Tờ Giấy mới: ' + name, 'ok');
    }
  }

  function resetSheetTemplate(sheetKey) {
    if (!confirm('Bạn có chắc muốn khôi phục bố cục tờ giấy này về mẫu gốc ban đầu?')) return;
    var def = DEFAULT_SHEET_SCHEMAS[sheetKey];
    if (!def) return;
    sheetStore[sheetKey].templates['default'] = JSON.parse(JSON.stringify(def.templates['default']));
    sheetStore[sheetKey].activeTemplateId = 'default';
    sheetStore[sheetKey].sheetScale = 100;
    saveSheetStore();
    triggerSheetReRender(sheetKey);
    if (typeof window.toast === 'function') {
      window.toast('🔄 Đã khôi phục mẫu tờ giấy gốc thành công!', 'ok');
    }
  }

  function moveSheetBlock(sheetKey, blockId, direction) {
    var blocks = getActiveSheetBlocks(sheetKey);
    var idx = blocks.findIndex(function (b) { return b.id === blockId; });
    if (idx === -1) return;
    var newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= blocks.length) return;

    var item = blocks.splice(idx, 1)[0];
    blocks.splice(newIdx, 0, item);

    saveSheetStore();
    triggerSheetReRender(sheetKey);
  }

  /* ── CÁC HÀM ĐIỀU CHỈNH TO / NHỎ & ĐỊNH DẠNG CHI TIẾT TỪNG KHỐI ── */
  function changeBlockFontSize(sheetKey, blockId, delta) {
    var b = getSheetBlock(sheetKey, blockId);
    var cur = b.fontSize ? parseInt(b.fontSize) : 13;
    b.fontSize = Math.max(9, Math.min(32, cur + delta));
    saveSheetStore();
    triggerSheetReRender(sheetKey);
    if (typeof window.toast === 'function') {
      window.toast('🔤 Cỡ chữ: ' + b.fontSize + 'px (' + b.title + ')', 'ok');
    }
  }

  function changeBlockPaddingY(sheetKey, blockId, delta) {
    var b = getSheetBlock(sheetKey, blockId);
    var cur = b.paddingY !== undefined ? parseInt(b.paddingY) : 8;
    b.paddingY = Math.max(0, Math.min(50, cur + delta));
    saveSheetStore();
    triggerSheetReRender(sheetKey);
    if (typeof window.toast === 'function') {
      window.toast('↕️ Giãn cách: ' + b.paddingY + 'px', 'ok');
    }
  }

  function setBlockAlign(sheetKey, blockId, align) {
    var b = getSheetBlock(sheetKey, blockId);
    b.align = align;
    saveSheetStore();
    triggerSheetReRender(sheetKey);
  }

  function toggleBlockBold(sheetKey, blockId) {
    var b = getSheetBlock(sheetKey, blockId);
    b.isBold = !b.isBold;
    saveSheetStore();
    triggerSheetReRender(sheetKey);
  }

  function changeLogoHeight(sheetKey, blockId, delta) {
    var b = getSheetBlock(sheetKey, blockId);
    var cur = b.logoHeight ? parseInt(b.logoHeight) : 140;
    b.logoHeight = Math.max(50, Math.min(280, cur + delta));
    saveSheetStore();
    triggerSheetReRender(sheetKey);
    if (typeof window.toast === 'function') {
      window.toast('🖼️ Chiều cao Logo: ' + b.logoHeight + 'px', 'ok');
    }
  }

  function changeSignHeight(sheetKey, blockId, delta) {
    var b = getSheetBlock(sheetKey, blockId);
    var cur = b.signHeight ? parseInt(b.signHeight) : 65;
    b.signHeight = Math.max(20, Math.min(200, cur + delta));
    saveSheetStore();
    triggerSheetReRender(sheetKey);
    if (typeof window.toast === 'function') {
      window.toast('✍️ Chỗ ký & đóng dấu: ' + b.signHeight + 'px', 'ok');
    }
  }

  function toggleBlockVisibility(sheetKey, blockId) {
    var b = getSheetBlock(sheetKey, blockId);
    b.visible = (b.visible === false) ? true : false;
    saveSheetStore();
    triggerSheetReRender(sheetKey);
    if (typeof window.toast === 'function') {
      window.toast((b.visible ? '👁️ Đã hiện lại khối: ' : '🙈 Đã ẩn khối: ') + b.title, 'info');
    }
  }

  /* ── SỬA CHỮ TRỰC TIẾP TRÊN MẶT TỜ GIẤY ── */
  function enableContentEdit(sheetKey, blockId) {
    var contentEl = document.getElementById('sb-content-' + blockId);
    var editBar = document.getElementById('sb-editbar-' + blockId);
    if (!contentEl) return;
    contentEl.setAttribute('contenteditable', 'true');
    contentEl.classList.add('is-content-editing');
    if (editBar) editBar.style.display = 'flex';
    contentEl.focus();
    if (typeof window.toast === 'function') {
      window.toast('✏️ Đã bật chế độ sửa chữ! Hãy click chuột trực tiếp vào đoạn văn để gõ chữ theo ý muốn.', 'ok');
    }
  }

  function saveCustomText(sheetKey, blockId) {
    var contentEl = document.getElementById('sb-content-' + blockId);
    if (!contentEl) return;
    var b = getSheetBlock(sheetKey, blockId);
    b.customHtml = contentEl.innerHTML;
    saveSheetStore();
    contentEl.removeAttribute('contenteditable');
    contentEl.classList.remove('is-content-editing');
    var editBar = document.getElementById('sb-editbar-' + blockId);
    if (editBar) editBar.style.display = 'none';
    if (typeof window.toast === 'function') {
      window.toast('💾 Đã lưu thành công nội dung chỉnh sửa của khối: ' + b.title, 'ok');
    }
    triggerSheetReRender(sheetKey);
  }

  function resetCustomText(sheetKey, blockId) {
    if (!confirm('Bạn có chắc muốn khôi phục lại nội dung chữ ban đầu của khối này?')) return;
    var b = getSheetBlock(sheetKey, blockId);
    delete b.customHtml;
    saveSheetStore();
    triggerSheetReRender(sheetKey);
    if (typeof window.toast === 'function') {
      window.toast('🔄 Đã khôi phục nội dung chữ gốc ban đầu!', 'ok');
    }
  }

  /* ── TỶ LỆ PHÓNG TO / THU NHỎ TOÀN TỜ GIẤY A4 ── */
  function changeSheetScale(sheetKey, delta) {
    var sh = sheetStore[sheetKey];
    if (!sh) return;
    var cur = sh.sheetScale ? parseInt(sh.sheetScale) : 100;
    sh.sheetScale = Math.max(70, Math.min(135, cur + delta));
    saveSheetStore();
    applySheetGlobalStyles(sheetKey);
    triggerSheetReRender(sheetKey);
    if (typeof window.toast === 'function') {
      window.toast('🔍 Tỷ lệ tờ giấy in A4: ' + sh.sheetScale + '%', 'ok');
    }
  }

  function setSheetScale(sheetKey, scaleVal) {
    var sh = sheetStore[sheetKey];
    if (!sh) return;
    sh.sheetScale = parseInt(scaleVal) || 100;
    saveSheetStore();
    applySheetGlobalStyles(sheetKey);
    triggerSheetReRender(sheetKey);
  }

  function setSheetFontFamily(sheetKey, fontName) {
    var sh = sheetStore[sheetKey];
    if (!sh) return;
    sh.fontFamily = fontName;
    saveSheetStore();
    applySheetGlobalStyles(sheetKey);
    triggerSheetReRender(sheetKey);
    if (typeof window.toast === 'function') {
      window.toast('🔤 Đã đổi phông chữ tờ giấy: ' + fontName, 'ok');
    }
  }

  function applySheetGlobalStyles(sheetKey) {
    var sh = sheetStore[sheetKey];
    if (!sh) return;
    setTimeout(function () {
      var paper = document.querySelector('.tp-sheet-paper, .real-a4-sheet');
      if (paper) {
        if (sh.sheetScale && sh.sheetScale !== 100) {
          paper.style.transform = 'scale(' + (sh.sheetScale / 100) + ')';
          paper.style.transformOrigin = 'top center';
        } else {
          paper.style.transform = '';
        }
        if (sh.fontFamily) {
          paper.style.fontFamily = sh.fontFamily;
        }
      }
    }, 20);
  }

  // Kéo thả khối (Block Drag & Drop)
  function handleBlockDragStart(e) {
    var wrap = e.target.closest('.sheet-block-item');
    if (!wrap) return;
    draggedBlockId = wrap.getAttribute('data-block-id');
    draggedSheetKey = wrap.getAttribute('data-sheet-key');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedBlockId);
    wrap.classList.add('is-sheet-block-dragging');
  }

  function handleBlockDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    var wrap = e.target.closest('.sheet-block-item');
    if (!wrap) return;
    if (wrap.getAttribute('data-block-id') === draggedBlockId) return;

    var rect = wrap.getBoundingClientRect();
    var midY = rect.top + rect.height / 2;
    if (e.clientY < midY) {
      wrap.classList.add('sheet-drop-before');
      wrap.classList.remove('sheet-drop-after');
    } else {
      wrap.classList.add('sheet-drop-after');
      wrap.classList.remove('sheet-drop-before');
    }
  }

  function handleBlockDragLeave(e) {
    var wrap = e.target.closest('.sheet-block-item');
    if (wrap) wrap.classList.remove('sheet-drop-before', 'sheet-drop-after');
  }

  function handleBlockDrop(e) {
    e.preventDefault();
    var wrap = e.target.closest('.sheet-block-item');
    if (!wrap) return;
    var targetId = wrap.getAttribute('data-block-id');
    var isBefore = wrap.classList.contains('sheet-drop-before');

    wrap.classList.remove('sheet-drop-before', 'sheet-drop-after');
    if (!draggedBlockId || draggedBlockId === targetId) return;

    var blocks = getActiveSheetBlocks(draggedSheetKey);
    var fromIdx = blocks.findIndex(function (b) { return b.id === draggedBlockId; });
    var toIdx = blocks.findIndex(function (b) { return b.id === targetId; });

    if (fromIdx === -1 || toIdx === -1) return;

    var moved = blocks.splice(fromIdx, 1)[0];
    var newIdx = blocks.findIndex(function (b) { return b.id === targetId; });
    if (isBefore) {
      blocks.splice(newIdx, 0, moved);
    } else {
      blocks.splice(newIdx + 1, 0, moved);
    }

    saveSheetStore();
    triggerSheetReRender(draggedSheetKey);
    if (typeof window.toast === 'function') {
      window.toast('✅ Đã di chuyển khối: ' + moved.title, 'ok');
    }
  }

  function handleBlockDragEnd(e) {
    document.querySelectorAll('.sheet-drop-before, .sheet-drop-after, .is-sheet-block-dragging').forEach(function (el) {
      el.classList.remove('sheet-drop-before', 'sheet-drop-after', 'is-sheet-block-dragging');
    });
    draggedBlockId = null;
    draggedSheetKey = null;
  }

  // Render thanh công cụ đầu tờ giấy A4
  function renderSheetTopToolbar(sheetKey) {
    var sh = sheetStore[sheetKey];
    if (!sh) return '';
    var isEditing = isSheetEditing(sheetKey);
    var activeTplId = sh.activeTemplateId || 'default';
    var tplKeys = Object.keys(sh.templates || {});
    var currentScale = sh.sheetScale || 100;
    var currentFont = sh.fontFamily || "'Times New Roman', serif";

    applySheetGlobalStyles(sheetKey);

    var html = '<div class="sheet-studio-top-bar">' +
      '<div class="sst-left">' +
      '  <span class="sst-label">📋 Mẫu in A4:</span>' +
      '  <select class="sst-select" onchange="SheetStudio.switchTemplate(\'' + sheetKey + '\', this.value)">';

    tplKeys.forEach(function (tk) {
      var t = sh.templates[tk];
      html += '<option value="' + tk + '"' + (tk === activeTplId ? ' selected' : '') + '>' + escH(t.name) + (tk === 'default' ? ' (Gốc)' : '') + '</option>';
    });

    html += '  </select>' +
      '  <!-- BỘ PHÓNG TO / THU NHỎ TOÀN TỜ GIẤY -->' +
      '  <div class="sst-zoom-box" title="Co giãn tỷ lệ toàn tờ giấy để vừa khít 1 trang A4 khi in hoặc xuất file">' +
      '    <span style="font-size:12px;font-weight:700;color:var(--t2)">🔍 Cỡ giấy:</span>' +
      '    <button type="button" class="sbh-btn" onclick="SheetStudio.changeSheetScale(\'' + sheetKey + '\', -5)" title="Thu nhỏ cả tờ giấy 5%">➖</button>' +
      '    <span style="font-size:12px;font-weight:800;color:var(--p);min-width:38px;text-align:center">' + currentScale + '%</span>' +
      '    <button type="button" class="sbh-btn" onclick="SheetStudio.changeSheetScale(\'' + sheetKey + '\', 5)" title="Phóng to cả tờ giấy 5%">➕</button>' +
      (currentScale !== 100 ? '    <button type="button" class="sbh-btn" onclick="SheetStudio.setSheetScale(\'' + sheetKey + '\', 100)" title="Về chuẩn 100%">100%</button>' : '') +
      '  </div>' +
      '</div>' +
      '<div class="sst-right">' +
      '  <button type="button" class="btn btn-sm ' + (isEditing ? 'btn-c' : 'btn-p') + ' btn-tune-sheet" onclick="SheetStudio.toggleEdit(\'' + sheetKey + '\')">' +
      (isEditing ? '💾 Xong thiết kế' : '🎨 Chỉnh To/Nhỏ & Kéo bố cục tờ giấy này') +
      '  </button>' +
      '</div>' +
      '</div>';

    if (isEditing) {
      html += '<div class="sheet-edit-banner">' +
        '<div class="seb-info">' +
        '  <span class="fbb-badge">🛠️ ĐANG SỬA BỐ CỤC &amp; TO NHỎ TỜ GIẤY THẬT</span>' +
        '  <span>Bấm <b>A+ / A-</b> chỉnh chữ to nhỏ • Kéo tay nắm <b>⠿ Kéo</b> đổi vị trí • Bấm <b>✏️ Sửa chữ</b> để gõ chữ trực tiếp</span>' +
        '</div>' +
        '<div class="seb-actions">' +
        '  <button type="button" class="btn btn-sm btn-s" onclick="SheetStudio.saveTemplatePrompt(\'' + sheetKey + '\')">💾 Lưu thành Mẫu mới</button>' +
        '  <button type="button" class="btn btn-sm btn-o" onclick="SheetStudio.resetTemplate(\'' + sheetKey + '\')">🔄 Về mặc định</button>' +
        '  <button type="button" class="btn btn-sm btn-c" onclick="SheetStudio.toggleEdit(\'' + sheetKey + '\')">✕ Đóng chế độ sửa</button>' +
        '</div>' +
        '</div>';
    }

    return html;
  }

  // Bọc 1 khối trên tờ giấy thật với các điều khiển to/nhỏ & kéo thả chi tiết
  function wrapSheetBlock(sheetKey, blockId, title, contentHtml) {
    var b = getSheetBlock(sheetKey, blockId);
    var isEditing = isSheetEditing(sheetKey);

    // Nếu khối bị ẩn
    if (b.visible === false) {
      if (!isEditing) return ''; // Ẩn hoàn toàn khỏi bản in / giao diện
      // Khi đang sửa: hiện placeholder mờ để người dùng có thể bấm mở lại
      return '<div class="sheet-block-item is-block-hidden" style="padding:8px 14px;background:#f8fafc;border:1.5px dashed #cbd5e1;border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;opacity:0.65">' +
        '  <span style="font-size:12px;color:#64748b;font-style:italic">🙈 Khối đang ẩn: <b>' + escH(title) + '</b></span>' +
        '  <button type="button" class="btn btn-sm btn-s" onclick="SheetStudio.toggleVisibility(\'' + sheetKey + '\',\'' + blockId + '\')">👁️ Hiện lại khối</button>' +
        '</div>';
    }

    var actualContent = (blockId === 'bg_table' || blockId === 'bb_table') ? contentHtml : (b.customHtml || contentHtml);

    // Xử lý riêng khối Logo (nếu có tùy chỉnh logoHeight)
    if (blockId === 'bg_logo' && b.logoHeight) {
      actualContent = actualContent.replace(/max-height:\s*[0-9]+px/gi, 'max-height:' + b.logoHeight + 'px !important');
    }

    // Xử lý riêng khối Chữ ký (nếu có tùy chỉnh signHeight)
    if ((blockId === 'bg_signature' || blockId === 'bb_sign') && b.signHeight) {
      actualContent = actualContent.replace(/height:\s*[0-9]+px/gi, 'height:' + b.signHeight + 'px !important');
    }

    // Tạo chuỗi Inline CSS cho khối
    var styleRules = [];
    if (b.fontSize) styleRules.push('font-size:' + b.fontSize + 'px !important');
    if (b.paddingY !== undefined) {
      styleRules.push('margin-top:' + b.paddingY + 'px !important');
      styleRules.push('margin-bottom:' + b.paddingY + 'px !important');
    }
    if (b.width) styleRules.push('width:' + b.width + ' !important');
    if (b.align) styleRules.push('text-align:' + b.align + ' !important');
    if (b.isBold) styleRules.push('font-weight:bold !important');
    var blockInlineStyle = styleRules.length > 0 ? ' style="' + styleRules.join(';') + '"' : '';

    if (!isEditing) {
      return '<div class="sheet-block-item" data-block-id="' + blockId + '" data-sheet-key="' + sheetKey + '"' + blockInlineStyle + '>' + actualContent + '</div>';
    }

    // GIAO DIỆN CHỈNH SỬA CHI TIẾT TỪNG KHỐI
    var fontSizeVal = b.fontSize || 13;
    var paddingYVal = b.paddingY !== undefined ? b.paddingY : 8;

    return '<div class="sheet-block-item is-editing-block" data-block-id="' + blockId + '" data-sheet-key="' + sheetKey + '" ' +
      'draggable="true" ondragstart="SheetStudio.handleDragStart(event)" ondragover="SheetStudio.handleDragOver(event)" ondragleave="SheetStudio.handleDragLeave(event)" ondrop="SheetStudio.handleDrop(event)" ondragend="SheetStudio.handleDragEnd(event)">' +
      '<div class="sheet-block-header">' +
      '  <div class="sbh-left">' +
      '    <div class="sbh-drag" title="Nhấn giữ để kéo thả di chuyển vị trí">⠿ Kéo: <b>' + escH(title) + '</b></div>' +
      '    <div class="sbh-tools">' +
      '      <!-- CỠ CHỮ TO / NHỎ -->' +
      '      <div class="sbh-tool-group" title="Chỉnh cỡ chữ to / nhỏ cho khối này">' +
      '        <span class="sbg-label">Cỡ chữ:</span>' +
      '        <button type="button" class="sbh-btn" onclick="SheetStudio.changeFontSize(\'' + sheetKey + '\',\'' + blockId + '\', -1)" title="Giảm cỡ chữ 1px">A-</button>' +
      '        <span class="sbh-val">' + fontSizeVal + 'px</span>' +
      '        <button type="button" class="sbh-btn" onclick="SheetStudio.changeFontSize(\'' + sheetKey + '\',\'' + blockId + '\', 1)" title="Tăng cỡ chữ 1px">A+</button>' +
      '      </div>' +
      '      <!-- GIÃN CÁCH TRÊN DƯỚI -->' +
      '      <div class="sbh-tool-group" title="Khoảng cách trên / dưới">' +
      '        <span class="sbg-label">Giãn cách:</span>' +
      '        <button type="button" class="sbh-btn" onclick="SheetStudio.changePaddingY(\'' + sheetKey + '\',\'' + blockId + '\', -2)" title="Thu hẹp khoảng cách">-</button>' +
      '        <span class="sbh-val">' + paddingYVal + 'px</span>' +
      '        <button type="button" class="sbh-btn" onclick="SheetStudio.changePaddingY(\'' + sheetKey + '\',\'' + blockId + '\', 2)" title="Giãn rộng khoảng cách">+</button>' +
      '      </div>' +
      '      <!-- CĂN LỀ & IN ĐẬM -->' +
      '      <div class="sbh-tool-group">' +
      '        <button type="button" class="sbh-btn ' + (b.align === 'left' ? 'active' : '') + '" onclick="SheetStudio.setAlign(\'' + sheetKey + '\',\'' + blockId + '\',\'left\')" title="Căn trái">⬅️</button>' +
      '        <button type="button" class="sbh-btn ' + (b.align === 'center' ? 'active' : '') + '" onclick="SheetStudio.setAlign(\'' + sheetKey + '\',\'' + blockId + '\',\'center\')" title="Căn giữa">⏺️</button>' +
      '        <button type="button" class="sbh-btn ' + (b.align === 'right' ? 'active' : '') + '" onclick="SheetStudio.setAlign(\'' + sheetKey + '\',\'' + blockId + '\',\'right\')" title="Căn phải">➡️</button>' +
      '        <button type="button" class="sbh-btn ' + (b.isBold ? 'active' : '') + '" onclick="SheetStudio.toggleBold(\'' + sheetKey + '\',\'' + blockId + '\')" title="In đậm (Bold)" style="font-weight:900">B</button>' +
      '      </div>' +
      (blockId === 'bg_logo' ?
        '      <!-- CỠ LOGO -->' +
        '      <div class="sbh-tool-group" title="Chỉnh kích cỡ to / nhỏ của Logo">' +
        '        <span class="sbg-label">Cỡ Logo:</span>' +
        '        <button type="button" class="sbh-btn" onclick="SheetStudio.changeLogoHeight(\'' + sheetKey + '\',\'' + blockId + '\', -15)" title="Thu nhỏ logo">➖</button>' +
        '        <span class="sbh-val">' + (b.logoHeight || 140) + 'px</span>' +
        '        <button type="button" class="sbh-btn" onclick="SheetStudio.changeLogoHeight(\'' + sheetKey + '\',\'' + blockId + '\', 15)" title="Phóng to logo">➕</button>' +
        '      </div>' : '') +
      ((blockId === 'bg_signature' || blockId === 'bb_sign') ?
        '      <!-- ĐỘ CAO CHỖ KÝ -->' +
        '      <div class="sbh-tool-group" title="Chỉnh độ cao khoảng trống để ký tên và đóng dấu">' +
        '        <span class="sbg-label">Chỗ ký:</span>' +
        '        <button type="button" class="sbh-btn" onclick="SheetStudio.changeSignHeight(\'' + sheetKey + '\',\'' + blockId + '\', -15)" title="Thu hẹp khoảng ký">➖</button>' +
        '        <span class="sbh-val">' + (b.signHeight || 65) + 'px</span>' +
        '        <button type="button" class="sbh-btn" onclick="SheetStudio.changeSignHeight(\'' + sheetKey + '\',\'' + blockId + '\', 15)" title="Nới cao khoảng ký">➕</button>' +
        '      </div>' : '') +
      '      <!-- SỬA TRỰC TIẾP CHỮ -->' +
      '      <button type="button" class="sbh-btn btn-edit-text" onclick="SheetStudio.enableContentEdit(\'' + sheetKey + '\',\'' + blockId + '\')" title="Click vào để sửa trực tiếp câu từ trên khối này">✏️ Sửa chữ trực tiếp</button>' +
      '    </div>' +
      '  </div>' +
      '  <div class="sbh-actions">' +
      '    <button type="button" class="sbh-btn" title="Di chuyển lên trên" onclick="SheetStudio.moveBlock(\'' + sheetKey + '\',\'' + blockId + '\', -1)">⬆️ Lên</button>' +
      '    <button type="button" class="sbh-btn" title="Di chuyển xuống dưới" onclick="SheetStudio.moveBlock(\'' + sheetKey + '\',\'' + blockId + '\', 1)">⬇️ Xuống</button>' +
      '    <button type="button" class="sbh-btn sbh-btn-del" title="Ẩn khối này khỏi tờ giấy" onclick="SheetStudio.toggleVisibility(\'' + sheetKey + '\',\'' + blockId + '\')">✕ Ẩn</button>' +
      '  </div>' +
      '</div>' +
      '<!-- THANH LƯU SỬA CHỮ TRỰC TIẾP -->' +
      '<div class="sbh-edit-bar" id="sb-editbar-' + blockId + '" style="display:none">' +
      '  <span>💡 <b>Đang sửa chữ:</b> Nhấp chuột trực tiếp vào dòng chữ bên dưới để gõ sửa câu từ theo ý muốn.</span>' +
      '  <div style="display:flex;gap:6px">' +
      '    <button type="button" class="btn btn-sm btn-p" onclick="SheetStudio.saveCustomText(\'' + sheetKey + '\',\'' + blockId + '\')">💾 Lưu chữ đã sửa</button>' +
      '    <button type="button" class="btn btn-sm btn-o" onclick="SheetStudio.resetCustomText(\'' + sheetKey + '\',\'' + blockId + '\')">↺ Khôi phục gốc</button>' +
      '  </div>' +
      '</div>' +
      '<div class="sheet-block-content" id="sb-content-' + blockId + '"' + blockInlineStyle + '>' + actualContent + '</div>' +
      '</div>';
  }

  // ══════════════════════════════════════════════════════════════════
  // PHẦN 3: LOGIC FORM BUILDER NHẬP LIỆU (CŨ VẪN HOẠT ĐỘNG HOÀN TOÀN)
  // ══════════════════════════════════════════════════════════════════
  function getActiveFields(formKey) {
    var formObj = formStore[formKey];
    if (!formObj) return [];
    var tplId = formObj.activeTemplateId || 'default';
    var tpl = formObj.templates[tplId] || formObj.templates['default'];
    return (tpl && tpl.fields) ? tpl.fields : [];
  }

  function captureFieldValues(formKey) {
    var values = {};
    var fields = getActiveFields(formKey);
    fields.forEach(function (f) {
      var el = document.getElementById(f.id);
      if (el) values[f.id] = el.value;
    });
    return values;
  }

  function restoreFieldValues(values) {
    if (!values) return;
    Object.keys(values).forEach(function (id) {
      var el = document.getElementById(id);
      if (el && values[id] !== undefined) el.value = values[id];
    });
  }

  function triggerFormChange(fieldId) {
    var el = document.getElementById(fieldId);
    if (!el) return;
    if (fieldId.startsWith('bg_') && typeof window.renderBaogiaForm === 'function') {
      window.renderBaogiaForm();
    } else if (fieldId.startsWith('tddu_') && typeof window.renderTdduPreview === 'function') {
      window.renderTdduPreview();
    } else if (fieldId.startsWith('bb') && typeof window.renderHandoverSheetPreview === 'function') {
      window.renderHandoverSheetPreview();
    }
  }

  function renderForm(formKey) {
    var formObj = formStore[formKey];
    if (!formObj) return;
    var container = document.getElementById(formObj.containerId);
    if (!container) return;

    var isEditing = !!editModeState[formKey];
    var oldValues = captureFieldValues(formKey);
    var fields = getActiveFields(formKey);

    container.classList.add('fgrid-custom-container');
    if (isEditing) container.classList.add('form-builder-active');
    else container.classList.remove('form-builder-active');

    var html = '';
    if (isEditing) {
      html += '<div class="form-builder-banner">' +
        '<div class="fbb-info">' +
        '  <span class="fbb-badge">🛠️ CHẾ ĐỘ THIẾT KẾ</span>' +
        '  <span>Kéo ô <b style="color:var(--foc)">⠿</b> để đổi vị trí • Bấm nút <b>%</b> để co giãn độ rộng • Bấm <b>💾 Lưu mẫu</b> khi hoàn thành</span>' +
        '</div>' +
        '<div class="fbb-actions">' +
        '  <button type="button" class="btn btn-sm btn-p" onclick="FormBuilder.openAddCustomFieldModal(\'' + formKey + '\')">➕ Thêm ô mới</button>' +
        '  <button type="button" class="btn btn-sm btn-o" onclick="FormBuilder.openHiddenFieldsModal(\'' + formKey + '\')">👁️ Ô đang ẩn</button>' +
        '  <button type="button" class="btn btn-sm btn-s" onclick="FormBuilder.saveAsTemplatePrompt(\'' + formKey + '\')">💾 Lưu thành Mẫu mới</button>' +
        '  <button type="button" class="btn btn-sm btn-o" onclick="FormBuilder.resetToDefault(\'' + formKey + '\')">🔄 Về mặc định</button>' +
        '  <button type="button" class="btn btn-sm btn-c" onclick="FormBuilder.toggleEditMode(\'' + formKey + '\')">✕ Đóng chế độ sửa</button>' +
        '</div>' +
        '</div>';
    }

    fields.forEach(function (field, idx) {
      if (!field.visible && !isEditing) return;
      var wClass = getWidthClass(field.width);
      var widthPct = field.width || '100%';

      var itemHtml = '<div class="fg fg-custom-item ' + wClass + (isEditing ? ' is-builder-item' : '') + (!field.visible ? ' is-field-hidden' : '') + '" ' +
        'id="fg_wrap_' + field.id + '" ' +
        'data-field-id="' + field.id + '" ' +
        'data-form-key="' + formKey + '" ' +
        'data-idx="' + idx + '" ' +
        'style="width:' + widthPct + ';"' +
        (isEditing ? ' draggable="true" ondragstart="FormBuilder.handleDragStart(event)" ondragover="FormBuilder.handleDragOver(event)" ondragleave="FormBuilder.handleDragLeave(event)" ondrop="FormBuilder.handleDrop(event)" ondragend="FormBuilder.handleDragEnd(event)"' : '') +
        '>';

      if (isEditing) {
        itemHtml += '<div class="builder-item-toolbar">' +
          '<div class="builder-drag-handle" title="Nhấn giữ để kéo thả đổi vị trí ô này">⠿ Kéo</div>' +
          '<div class="builder-width-group" title="Chọn độ rộng của ô">' +
          '  <button type="button" class="bw-btn' + (widthPct === '25%' ? ' active' : '') + '" onclick="FormBuilder.setFieldWidth(\'' + formKey + '\',\'' + field.id + '\',\'25%\')">25%</button>' +
          '  <button type="button" class="bw-btn' + (widthPct === '33.3%' || widthPct === '33%' ? ' active' : '') + '" onclick="FormBuilder.setFieldWidth(\'' + formKey + '\',\'' + field.id + '\',\'33.3%\')">33%</button>' +
          '  <button type="button" class="bw-btn' + (widthPct === '50%' ? ' active' : '') + '" onclick="FormBuilder.setFieldWidth(\'' + formKey + '\',\'' + field.id + '\',\'50%\')">50%</button>' +
          '  <button type="button" class="bw-btn' + (widthPct === '66.6%' || widthPct === '66%' ? ' active' : '') + '" onclick="FormBuilder.setFieldWidth(\'' + formKey + '\',\'' + field.id + '\',\'66.6%\')">66%</button>' +
          '  <button type="button" class="bw-btn' + (widthPct === '100%' ? ' active' : '') + '" onclick="FormBuilder.setFieldWidth(\'' + formKey + '\',\'' + field.id + '\',\'100%\')">100%</button>' +
          '</div>' +
          '<div class="builder-item-actions">' +
          '  <button type="button" class="bia-btn" title="Đổi nhãn / ghi chú" onclick="FormBuilder.editFieldMeta(\'' + formKey + '\',\'' + field.id + '\')">✏️</button>' +
          '  <button type="button" class="bia-btn" title="' + (field.visible ? 'Ẩn ô này' : 'Hiện lại ô này') + '" onclick="FormBuilder.toggleFieldVisibility(\'' + formKey + '\',\'' + field.id + '\')">' + (field.visible ? '👁️' : '🚫') + '</button>' +
          (field.isCustom ? '  <button type="button" class="bia-btn del" title="Xóa ô tự tạo này" onclick="FormBuilder.deleteCustomField(\'' + formKey + '\',\'' + field.id + '\')">🗑️</button>' : '') +
          '</div>' +
          '</div>';
      }

      itemHtml += '<label for="' + field.id + '" style="display:flex;align-items:center;justify-content:space-between">' +
        '<span>' + escH(field.label) + '</span>' +
        (!field.visible && isEditing ? '<span style="font-size:10px;color:#ef4444;font-weight:700">(Đang ẩn)</span>' : '') +
        '</label>';

      var val = (oldValues[field.id] !== undefined) ? oldValues[field.id] : (field.defaultValue || '');
      var onInputAttr = ' oninput="FormBuilder.onFieldChange(\'' + field.id + '\')"';
      var onChangeAttr = ' onchange="FormBuilder.onFieldChange(\'' + field.id + '\')"';

      if (field.type === 'select') {
        itemHtml += '<select id="' + field.id + '"' + onChangeAttr + '>';
        if (field.options) {
          field.options.forEach(function (opt) {
            itemHtml += '<option value="' + escH(opt.val) + '"' + (String(opt.val) === String(val) ? ' selected' : '') + '>' + escH(opt.label) + '</option>';
          });
        }
        itemHtml += '</select>';
      } else if (field.type === 'textarea') {
        itemHtml += '<textarea id="' + field.id + '" rows="2" placeholder="' + escH(field.placeholder || '') + '"' + onInputAttr + '>' + escH(val) + '</textarea>';
      } else {
        itemHtml += '<input id="' + field.id + '" type="' + (field.type || 'text') + '" value="' + escH(val) + '" placeholder="' + escH(field.placeholder || '') + '"' + onInputAttr + ' />';
      }

      itemHtml += '</div>';
      html += itemHtml;
    });

    container.innerHTML = html;
    restoreFieldValues(oldValues);
    renderTemplateSwitcher(formKey);
  }

  function getWidthClass(w) {
    if (!w) return 'w-100';
    if (w === '25%') return 'w-25';
    if (w === '33.3%' || w === '33%') return 'w-33';
    if (w === '50%') return 'w-50';
    if (w === '66.6%' || w === '66%') return 'w-66';
    return 'w-100';
  }

  function renderTemplateSwitcher(formKey) {
    var formObj = formStore[formKey];
    if (!formObj) return;
    var container = document.getElementById(formObj.containerId);
    if (!container) return;

    var headerId = 'fgrid_header_' + formKey;
    var headerEl = document.getElementById(headerId);
    if (!headerEl) {
      headerEl = document.createElement('div');
      headerEl.id = headerId;
      headerEl.className = 'form-builder-header-bar';
      container.parentNode.insertBefore(headerEl, container);
    }

    var isEditing = !!editModeState[formKey];
    var activeTplId = formObj.activeTemplateId || 'default';
    var tplKeys = Object.keys(formObj.templates || {});

    var selectHtml = '<div class="fb-switcher-left">' +
      '  <span class="fb-switcher-lbl">📋 Mẫu bố cục:</span>' +
      '  <select class="fb-switcher-select" onchange="FormBuilder.switchTemplate(\'' + formKey + '\', this.value)">';

    tplKeys.forEach(function (tk) {
      var tpl = formObj.templates[tk];
      selectHtml += '<option value="' + tk + '"' + (tk === activeTplId ? ' selected' : '') + '>' + escH(tpl.name) + (tk === 'default' ? ' (Gốc)' : '') + '</option>';
    });

    selectHtml += '  </select>' +
      '</div>';

    var btnHtml = '<div class="fb-switcher-right">' +
      '  <button type="button" class="btn btn-sm ' + (isEditing ? 'btn-c' : 'btn-o') + ' btn-tune-form" onclick="FormBuilder.toggleEditMode(\'' + formKey + '\')">' +
      (isEditing ? '💾 Xong thiết kế' : '🎨 Tùy biến form này') +
      '  </button>' +
      '</div>';

    headerEl.innerHTML = selectHtml + btnHtml;
  }

  // Kéo thả ô input (Form Fields)
  function handleDragStart(e) {
    var wrap = e.target.closest('.fg-custom-item');
    if (!wrap) return;
    draggedFieldId = wrap.getAttribute('data-field-id');
    draggedFormKey = wrap.getAttribute('data-form-key');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedFieldId);
    wrap.classList.add('is-dragging');
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    var targetWrap = e.target.closest('.fg-custom-item');
    if (!targetWrap) return;
    if (targetWrap.getAttribute('data-field-id') === draggedFieldId) return;

    var rect = targetWrap.getBoundingClientRect();
    var midX = rect.left + rect.width / 2;
    if (e.clientX < midX) {
      targetWrap.classList.add('drop-target-before');
      targetWrap.classList.remove('drop-target-after');
    } else {
      targetWrap.classList.add('drop-target-after');
      targetWrap.classList.remove('drop-target-before');
    }
  }

  function handleDragLeave(e) {
    var targetWrap = e.target.closest('.fg-custom-item');
    if (targetWrap) targetWrap.classList.remove('drop-target-before', 'drop-target-after');
  }

  function handleDrop(e) {
    e.preventDefault();
    var targetWrap = e.target.closest('.fg-custom-item');
    if (!targetWrap) return;
    var targetFieldId = targetWrap.getAttribute('data-field-id');
    var isBefore = targetWrap.classList.contains('drop-target-before');

    targetWrap.classList.remove('drop-target-before', 'drop-target-after');
    if (!draggedFieldId || draggedFieldId === targetFieldId) return;

    var fields = getActiveFields(draggedFormKey);
    var fromIdx = fields.findIndex(function (f) { return f.id === draggedFieldId; });
    var toIdx = fields.findIndex(function (f) { return f.id === targetFieldId; });

    if (fromIdx === -1 || toIdx === -1) return;

    var moved = fields.splice(fromIdx, 1)[0];
    var newIdx = fields.findIndex(function (f) { return f.id === targetFieldId; });
    if (isBefore) {
      fields.splice(newIdx, 0, moved);
    } else {
      fields.splice(newIdx + 1, 0, moved);
    }

    saveFormStore();
    renderForm(draggedFormKey);
    if (typeof window.toast === 'function') {
      window.toast('✅ Đã di chuyển vị trí ô: ' + (moved.label || moved.id), 'ok');
    }
  }

  function handleDragEnd(e) {
    document.querySelectorAll('.drop-target-before, .drop-target-after, .is-dragging').forEach(function (el) {
      el.classList.remove('drop-target-before', 'drop-target-after', 'is-dragging');
    });
    draggedFieldId = null;
    draggedFormKey = null;
  }

  function setFieldWidth(formKey, fieldId, width) {
    var fields = getActiveFields(formKey);
    var f = fields.find(function (x) { return x.id === fieldId; });
    if (!f) return;
    f.width = width;
    saveFormStore();
    renderForm(formKey);
  }

  function toggleFieldVisibility(formKey, fieldId) {
    var fields = getActiveFields(formKey);
    var f = fields.find(function (x) { return x.id === fieldId; });
    if (!f) return;
    f.visible = !f.visible;
    saveFormStore();
    renderForm(formKey);
    if (typeof window.toast === 'function') {
      window.toast(f.visible ? '👁️ Đã hiển thị ô: ' + f.label : '🚫 Đã ẩn ô: ' + f.label, 'ok');
    }
  }

  function toggleEditMode(formKey) {
    editModeState[formKey] = !editModeState[formKey];
    renderForm(formKey);
    if (editModeState[formKey]) {
      if (typeof window.toast === 'function') {
        window.toast('🛠️ Đã mở chế độ tùy biến form! Kéo thả và co giãn kích thước các ô.', 'ok');
      }
    } else {
      if (typeof window.toast === 'function') {
        window.toast('✨ Đã hoàn thành tùy biến form!', 'ok');
      }
    }
  }

  function switchTemplate(formKey, templateId) {
    var formObj = formStore[formKey];
    if (!formObj || !formObj.templates[templateId]) return;
    formObj.activeTemplateId = templateId;
    saveFormStore();
    renderForm(formKey);
    if (typeof window.toast === 'function') {
      window.toast('📋 Đã áp dụng mẫu: ' + formObj.templates[templateId].name, 'ok');
    }
  }

  function saveAsTemplatePrompt(formKey) {
    var formObj = formStore[formKey];
    if (!formObj) return;
    var name = prompt('Nhập tên cho Mẫu Form mới này (VD: Mẫu 2 cột tinh gọn, Mẫu dự án giáo dục...):', 'Mẫu tùy chỉnh ' + (Object.keys(formObj.templates).length + 1));
    if (!name || !name.trim()) return;

    var tplId = 'tpl_' + Date.now();
    var currentFields = JSON.parse(JSON.stringify(getActiveFields(formKey)));

    formObj.templates[tplId] = {
      name: name.trim(),
      createdAt: new Date().toISOString(),
      fields: currentFields
    };
    formObj.activeTemplateId = tplId;

    saveFormStore();
    renderForm(formKey);
    if (typeof window.toast === 'function') {
      window.toast('💾 Đã lưu thành công mẫu form mới: ' + name, 'ok');
    }
  }

  function resetToDefault(formKey) {
    if (!confirm('Bạn có chắc muốn khôi phục bố cục của form này về mẫu gốc ban đầu?')) return;
    var def = DEFAULT_FORM_SCHEMAS[formKey];
    if (!def) return;
    formStore[formKey].templates['default'] = JSON.parse(JSON.stringify(def.templates['default']));
    formStore[formKey].activeTemplateId = 'default';
    saveFormStore();
    renderForm(formKey);
    if (typeof window.toast === 'function') {
      window.toast('🔄 Đã khôi phục bố cục mặc định thành công!', 'ok');
    }
  }

  function editFieldMeta(formKey, fieldId) {
    var fields = getActiveFields(formKey);
    var f = fields.find(function (x) { return x.id === fieldId; });
    if (!f) return;

    var newLabel = prompt('Đổi tiêu đề hiển thị (Label):', f.label);
    if (newLabel === null) return;
    if (newLabel.trim()) f.label = newLabel.trim();

    var newPlaceholder = prompt('Đổi gợi ý mờ (Placeholder):', f.placeholder || '');
    if (newPlaceholder !== null) f.placeholder = newPlaceholder.trim();

    saveFormStore();
    renderForm(formKey);
  }

  function openAddCustomFieldModal(formKey) {
    var label = prompt('Nhập tên ô nhập liệu mới muốn thêm:');
    if (!label || !label.trim()) return;

    var type = prompt('Chọn kiểu dữ liệu:\n- "text": Chữ ngắn\n- "textarea": Ghi chú nhiều dòng\n- "number": Số\n- "date": Ngày tháng', 'text');
    if (!type) type = 'text';
    type = type.trim().toLowerCase();
    if (['text', 'textarea', 'number', 'date'].indexOf(type) === -1) type = 'text';

    var width = prompt('Chọn độ rộng mặc định ("25%", "33.3%", "50%", "100%"):', '50%') || '50%';
    var newId = 'custom_' + formKey + '_' + Date.now();
    var fields = getActiveFields(formKey);
    fields.push({
      id: newId,
      label: label.trim(),
      type: type,
      width: width,
      placeholder: 'Nhập ' + label.trim() + '...',
      visible: true,
      isCustom: true
    });

    saveFormStore();
    renderForm(formKey);
    if (typeof window.toast === 'function') {
      window.toast('➕ Đã thêm ô mới: ' + label, 'ok');
    }
  }

  function deleteCustomField(formKey, fieldId) {
    if (!confirm('Bạn có chắc muốn xóa ô tự tạo này không?')) return;
    var fields = getActiveFields(formKey);
    var idx = fields.findIndex(function (x) { return x.id === fieldId; });
    if (idx !== -1) {
      fields.splice(idx, 1);
      saveFormStore();
      renderForm(formKey);
      if (typeof window.toast === 'function') {
        window.toast('🗑️ Đã xóa ô thành công!', 'ok');
      }
    }
  }

  function openHiddenFieldsModal(formKey) {
    var fields = getActiveFields(formKey);
    var hiddenFields = fields.filter(function (f) { return !f.visible; });
    if (hiddenFields.length === 0) {
      alert('Không có ô nào đang bị ẩn trong form này!');
      return;
    }
    var msg = 'Danh sách các ô đang bị ẩn:\n';
    hiddenFields.forEach(function (f, i) {
      msg += (i + 1) + '. ' + f.label + ' (' + f.id + ')\n';
    });
    msg += '\nNhập số thứ tự của ô bạn muốn hiển thị lại (hoặc bấm Hủy):';
    var choice = prompt(msg);
    if (!choice) return;
    var cIdx = parseInt(choice, 10) - 1;
    if (cIdx >= 0 && cIdx < hiddenFields.length) {
      toggleFieldVisibility(formKey, hiddenFields[cIdx].id);
    }
  }

  function exportTemplatesJson() {
    var data = { forms: formStore, sheets: sheetStore };
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    var a = document.createElement('a');
    a.href = dataStr;
    a.download = 'Mau_Form_Va_Sheet_Du_Toan_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (typeof window.toast === 'function') {
      window.toast('📥 Đã tải về file mẫu Form & Tờ Giấy JSON!', 'ok');
    }
  }

  function importTemplatesJson(fileInput) {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
    var file = fileInput.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var parsed = JSON.parse(e.target.result);
        if (parsed.forms || parsed.sheets) {
          if (parsed.forms) formStore = Object.assign({}, formStore, parsed.forms);
          if (parsed.sheets) sheetStore = Object.assign({}, sheetStore, parsed.sheets);
        } else {
          formStore = Object.assign({}, formStore, parsed);
        }
        saveFormStore();
        saveSheetStore();
        initAllForms();
        if (typeof window.renderBaogiaForm === 'function') window.renderBaogiaForm();
        if (typeof window.renderHandoverSheetPreview === 'function') window.renderHandoverSheetPreview();
        if (typeof window.toast === 'function') {
          window.toast('📤 Đã nhập thành công file mẫu Form & Sheet!', 'ok');
        }
      } catch (err) {
        alert('File không hợp lệ hoặc bị lỗi cú pháp JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function initAllForms() {
    loadAllStores();
    Object.keys(formStore).forEach(function (fk) {
      renderForm(fk);
    });
  }

  function escH(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Render Admin Studio view
  function renderAdminStudio(container) {
    if (!container) return;
    var html = '<div class="admin-studio-wrap">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px">' +
      '  <div>' +
      '    <div style="font-size:18px;font-weight:900;color:var(--t1)">🎨 STUDIO THIẾT KẾ: KÉO TAY TRÊN FORM THẬT A4 &amp; Ô NHẬP LIỆU</div>' +
      '    <div style="font-size:13px;color:var(--t2)">Kéo thả thay đổi thứ tự trực tiếp trên mặt tờ giấy in A4 hoặc các ô nhập liệu, co giãn kích thước và lưu mẫu.</div>' +
      '  </div>' +
      '  <div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '    <button class="btn btn-sm btn-p" onclick="FormBuilder.exportTemplatesJson()">📥 Xuất Toàn Bộ Mẫu (.json)</button>' +
      '    <label class="btn btn-sm btn-o" style="cursor:pointer;margin:0">' +
      '      📤 Nhập File Mẫu (.json)' +
      '      <input type="file" accept=".json" style="display:none" onchange="FormBuilder.importTemplatesJson(this)" />' +
      '    </label>' +
      '  </div>' +
      '</div>';

    // Section 1: Form Thật A4 (Sheet Studio)
    html += '<div style="font-size:15px;font-weight:800;color:var(--t1);margin-bottom:12px;display:flex;align-items:center;gap:6px">' +
      '  <span>📄 1. BỐ CỤC TỜ GIẤY FORM THẬT (A4 BÁO GIÁ &amp; BIÊN BẢN BÀN GIAO)</span>' +
      '</div>' +
      '<div class="admin-studio-grid" style="margin-bottom:24px">';

    Object.keys(sheetStore).forEach(function (sk) {
      var sObj = sheetStore[sk];
      var tplCount = Object.keys(sObj.templates || {}).length;
      var activeTpl = sObj.templates[sObj.activeTemplateId || 'default'] || {};
      var blockCount = (activeTpl.blocks || []).length;

      html += '<div class="admin-studio-card" style="border:1.5px solid #c3a45c;background:linear-gradient(180deg,#ffffff 0%,#fbf7ee 100%)">' +
        '  <div class="asc-header">' +
        '    <div class="asc-title">' + escH(sObj.title) + '</div>' +
        '    <span class="sec-badge amber">' + blockCount + ' khối A4</span>' +
        '  </div>' +
        '  <div class="asc-body">' +
        '    <div style="font-size:12.5px;color:var(--t2);margin-bottom:6px">Mẫu tờ giấy đang dùng: <b style="color:var(--t1)">' + escH(activeTpl.name || 'Mặc định') + '</b></div>' +
        '    <div style="font-size:12px;color:var(--t3);margin-bottom:14px">Cho phép xem trực quan tờ giấy A4 và dùng chuột kéo tay di chuyển các khối Logo, Khách hàng, Bảng giá, Điều khoản, Chữ ký.</div>' +
        '    <div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '      <button class="btn btn-sm btn-p" onclick="SheetStudio.adminQuickLaunch(\'' + sk + '\')">📄 Mở tờ giấy để kéo tay</button>' +
        '      <button class="btn btn-sm btn-o" onclick="SheetStudio.resetTemplate(\'' + sk + '\')">🔄 Về gốc</button>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    });

    html += '</div>';

    // Section 2: Form Ô Nhập Liệu
    html += '<div style="font-size:15px;font-weight:800;color:var(--t1);margin-bottom:12px;display:flex;align-items:center;gap:6px">' +
      '  <span>📋 2. BỐ CỤC CÁC KHUNG Ô NHẬP LIỆU (FORM FIELDS)</span>' +
      '</div>' +
      '<div class="admin-studio-grid">';

    Object.keys(formStore).forEach(function (fk) {
      var fObj = formStore[fk];
      var tplCount = Object.keys(fObj.templates || {}).length;
      var activeTpl = fObj.templates[fObj.activeTemplateId || 'default'] || {};
      var fieldCount = (activeTpl.fields || []).length;

      html += '<div class="admin-studio-card">' +
        '  <div class="asc-header">' +
        '    <div class="asc-title">' + escH(fObj.title) + '</div>' +
        '    <span class="sec-badge blue">' + fieldCount + ' trường</span>' +
        '  </div>' +
        '  <div class="asc-body">' +
        '    <div style="font-size:12.5px;color:var(--t2);margin-bottom:8px">Mẫu đang dùng: <b style="color:var(--t1)">' + escH(activeTpl.name || 'Mặc định') + '</b></div>' +
        '    <div style="font-size:12px;color:var(--t3);margin-bottom:14px">Tổng cộng có <b>' + tplCount + '</b> mẫu đã lưu trong hệ thống.</div>' +
        '    <div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '      <button class="btn btn-sm btn-p" onclick="FormBuilder.adminQuickLaunchEdit(\'' + fk + '\')">🎨 Mở thiết kế ô</button>' +
        '      <button class="btn btn-sm btn-o" onclick="FormBuilder.resetToDefault(\'' + fk + '\')">🔄 Khôi phục gốc</button>' +
        '    </div>' +
        '  </div>' +
        '</div>';
    });

    html += '</div></div>';
    container.innerHTML = html;
  }

  function adminQuickLaunchEdit(formKey) {
    var tabMap = { 'dutoan_info': 'dutoan', 'baogia_info': 'baogia', 'bbbg_seller': 'bbbg', 'bbbg_buyer': 'bbbg', 'tddu_tender': 'tddu' };
    var targetTab = tabMap[formKey] || 'dutoan';
    if (typeof window.switchMainTab === 'function') window.switchMainTab(targetTab);
    editModeState[formKey] = true;
    setTimeout(function () {
      renderForm(formKey);
      var el = document.getElementById(formStore[formKey].containerId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }

  function adminQuickLaunchSheet(sheetKey) {
    var targetTab = (sheetKey === 'baogia_sheet') ? 'baogia' : 'bbbg';
    if (typeof window.switchMainTab === 'function') window.switchMainTab(targetTab);
    sheetEditState[sheetKey] = true;
    setTimeout(function () {
      if (sheetKey === 'baogia_sheet' && typeof window.renderBaogiaForm === 'function') {
        window.renderBaogiaForm();
        var el = document.getElementById('bgTableArea');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (sheetKey === 'bbbg_sheet' && typeof window.renderHandoverSheetPreview === 'function') {
        window.renderHandoverSheetPreview();
        var el = document.getElementById('bbSheetArea');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  }

  function initAllForms() {
    try {
      loadAllStores();
      Object.keys(formStore || {}).forEach(function (fk) {
        renderForm(fk);
      });
    } catch (e) {
      console.warn('FormBuilder init error:', e);
    }
  }

  // EXPORT TO GLOBAL WINDOW
  window.FormBuilder = {
    init: initAllForms,
    renderForm: renderForm,
    toggleEditMode: toggleEditMode,
    setFieldWidth: setFieldWidth,
    toggleFieldVisibility: toggleFieldVisibility,
    switchTemplate: switchTemplate,
    saveAsTemplatePrompt: saveAsTemplatePrompt,
    resetToDefault: resetToDefault,
    editFieldMeta: editFieldMeta,
    openAddCustomFieldModal: openAddCustomFieldModal,
    deleteCustomField: deleteCustomField,
    openHiddenFieldsModal: openHiddenFieldsModal,
    exportTemplatesJson: exportTemplatesJson,
    importTemplatesJson: importTemplatesJson,
    renderAdminStudio: renderAdminStudio,
    adminQuickLaunchEdit: adminQuickLaunchEdit,
    handleDragStart: handleDragStart,
    handleDragOver: handleDragOver,
    handleDragLeave: handleDragLeave,
    handleDrop: handleDrop,
    handleDragEnd: handleDragEnd,
    onFieldChange: triggerFormChange
  };

  window.SheetStudio = {
    getBlockOrder: getSheetBlockOrder,
    getActiveSheetBlocks: getActiveSheetBlocks,
    getSheetBlock: getSheetBlock,
    isEditing: isSheetEditing,
    toggleEdit: toggleSheetEdit,
    switchTemplate: switchSheetTemplate,
    saveTemplatePrompt: saveSheetTemplatePrompt,
    resetTemplate: resetSheetTemplate,
    moveBlock: moveSheetBlock,
    renderTopToolbar: renderSheetTopToolbar,
    wrapBlock: wrapSheetBlock,
    changeFontSize: changeBlockFontSize,
    changePaddingY: changeBlockPaddingY,
    setAlign: setBlockAlign,
    toggleBold: toggleBlockBold,
    changeLogoHeight: changeLogoHeight,
    changeSignHeight: changeSignHeight,
    toggleVisibility: toggleBlockVisibility,
    enableContentEdit: enableContentEdit,
    saveCustomText: saveCustomText,
    resetCustomText: resetCustomText,
    changeSheetScale: changeSheetScale,
    setSheetScale: setSheetScale,
    setSheetFontFamily: setSheetFontFamily,
    handleDragStart: handleBlockDragStart,
    handleDragOver: handleBlockDragOver,
    handleDragLeave: handleBlockDragLeave,
    handleDrop: handleBlockDrop,
    handleDragEnd: handleBlockDragEnd,
    adminQuickLaunch: adminQuickLaunchSheet
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllForms);
  } else {
    setTimeout(initAllForms, 100);
  }

})();
