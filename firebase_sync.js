/* ═══════════════════════════════════════════════════════════════════
   FIREBASE REALTIME CLOUD SYNC MODULE CHO TOOL DỰ TOÁN
   Tự động đồng bộ sản phẩm, trạng thái Sửa, Xóa, Khóa qua Google Firebase
═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // 1. Cấu hình Firebase Config từ tài khoản Google của bạn
  var firebaseConfig = {
    apiKey: "AIzaSyBGPKvX7I3X8X4AnPvYzhbQRfhpSTilDxg",
    authDomain: "du-toan-f49e6.firebaseapp.com",
    databaseURL: "https://du-toan-f49e6-default-rtdb.firebaseio.com",
    projectId: "du-toan-f49e6",
    storageBucket: "du-toan-f49e6.firebasestorage.app",
    messagingSenderId: "15951334700",
    appId: "1:15951334700:web:a5ac93698e14a6c16e7089",
    measurementId: "G-3DDD4ESWB0"
  };

  var db = null;
  var isCloudReady = false;
  var cloudStatus = 'init'; // 'init' | 'connected' | 'syncing' | 'error'

  window.DU_TOAN_CLOUD = {
    isReady: function () { return isCloudReady; },
    status: function () { return cloudStatus; },
    pushCatalogToCloud: pushCatalogToCloud,
    loadCatalogFromCloud: loadCatalogFromCloud
  };

  function updateCloudStatusBadge(status, message) {
    cloudStatus = status;
    var badge = document.getElementById('cloud-sync-status-badge');
    if (!badge) return;
    if (status === 'connected') {
      badge.style.background = '#ecfdf5';
      badge.style.borderColor = '#10b981';
      badge.style.color = '#065f46';
      badge.innerHTML = '🟢 <span style="font-weight:700">Cloud Realtime:</span> Đã đồng bộ (' + (message || 'Sẵn sàng') + ')';
    } else if (status === 'syncing') {
      badge.style.background = '#eff6ff';
      badge.style.borderColor = '#3b82f6';
      badge.style.color = '#1e40af';
      badge.innerHTML = '🔄 <span style="font-weight:700">Cloud Realtime:</span> Đang tải dữ liệu...';
    } else if (status === 'error') {
      badge.style.background = '#fef2f2';
      badge.style.borderColor = '#ef4444';
      badge.style.color = '#991b1b';
      badge.innerHTML = '⚠️ <span style="font-weight:700">Cloud Realtime:</span> ' + (message || 'Mất kết nối');
    }
  }

  // Khởi tạo Firebase SDK
  function initFirebase() {
    try {
      if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK chưa được nạp.');
        return;
      }
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.database();
      isCloudReady = true;
      console.log('🚀 Firebase Cloud Database đã sẵn sàng kết nối!');
      updateCloudStatusBadge('syncing', 'Đang kết nối...');

      // Bắt đầu lắng nghe thay đổi thời gian thực từ Cloud
      listenToCloudCatalog();
    } catch (e) {
      console.error('Lỗi khởi tạo Firebase:', e);
      updateCloudStatusBadge('error', e.message);
    }
  }

  // Lắng nghe dữ liệu danh mục từ Firebase Realtime Database
  function listenToCloudCatalog() {
    if (!db) return;
    var catalogRef = db.ref('du_toan_catalog');
    catalogRef.on('value', function (snapshot) {
      var data = snapshot.val();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        console.log('⚡ Nhận dữ liệu mới nhất từ Cloud: ' + data.items.length + ' sản phẩm (Cập nhật lúc: ' + (data.updatedAt || 'vừa xong') + ')');
        CATALOG_ITEMS = data.items;

        // Đồng bộ vào localStorage để nếu mất mạng vẫn chạy bình thường
        try {
          localStorage.setItem(typeof LS_CUSTOM_CATALOG_KEY !== 'undefined' ? LS_CUSTOM_CATALOG_KEY : 'dutoan_custom_catalog', JSON.stringify(CATALOG_ITEMS));
        } catch (e) {}

        // Cập nhật MODEL_PRESETS
        if (typeof MODEL_PRESETS !== 'undefined') {
          CATALOG_ITEMS.forEach(function (it) {
            var k = it.presetKey || it.id;
            if (k && !MODEL_PRESETS[k]) {
              MODEL_PRESETS[k] = {
                name: it.name,
                model: it.model,
                brand: it.brand,
                origin: it.origin,
                warranty: it.warranty,
                unit: it.unit,
                price: it.price || 0,
                file: it.file,
                specs: it.specs || []
              };
            }
          });
        }

        // Cập nhật giao diện nếu đang mở
        if (typeof renderCatalogGrid === 'function') renderCatalogGrid();
        if (typeof renderBrandAndSubNav === 'function') renderBrandAndSubNav();
        var adminView = document.getElementById('admin-workspace');
        if (adminView && adminView.style.display !== 'none' && typeof renderAdminDashboard === 'function') {
          renderAdminDashboard();
        }

        updateCloudStatusBadge('connected', data.items.length + ' máy');
      } else {
        // Chưa có dữ liệu trên cloud -> tự động đẩy danh mục hiện tại lên Cloud làm bản gốc
        console.log('Mây Cloud chưa có danh mục, tiến hành nạp danh mục hiện tại lên Cloud...');
        pushCatalogToCloud(false);
      }
    }, function (err) {
      console.error('Lỗi khi lắng nghe Cloud:', err);
      updateCloudStatusBadge('error', 'Lỗi phân quyền hoặc mạng');
    });
  }

  // Đẩy dữ liệu hiện tại lên Cloud (khi Admin Sửa, Khóa/Mở, hoặc Xóa)
  function pushCatalogToCloud(showToast) {
    if (!db) {
      console.warn('Firebase chưa sẵn sàng để đẩy dữ liệu');
      return;
    }
    updateCloudStatusBadge('syncing');
    var catalogRef = db.ref('du_toan_catalog');
    var payload = {
      updatedAt: new Date().toLocaleString('vi-VN'),
      items: CATALOG_ITEMS
    };

    catalogRef.set(payload, function (err) {
      if (err) {
        console.error('Lỗi khi lưu lên Cloud:', err);
        updateCloudStatusBadge('error', 'Lưu thất bại: ' + err.message);
        if (showToast && typeof toast === 'function') {
          toast('❌ Lỗi Cloud: ' + err.message, 'err');
        }
      } else {
        console.log('✅ Đã đồng bộ thành công ' + CATALOG_ITEMS.length + ' sản phẩm lên Cloud!');
        updateCloudStatusBadge('connected', CATALOG_ITEMS.length + ' máy');
        if (showToast && typeof toast === 'function') {
          toast('☁️ Đã đồng bộ toàn bộ sản phẩm lên Cloud Realtime!', 'ok');
        }
      }
    });
  }

  function loadCatalogFromCloud() {
    if (!db) return;
    updateCloudStatusBadge('syncing');
    db.ref('du_toan_catalog').once('value').then(function (snapshot) {
      var data = snapshot.val();
      if (data && Array.isArray(data.items)) {
        CATALOG_ITEMS = data.items;
        if (typeof renderCatalogGrid === 'function') renderCatalogGrid();
        if (typeof renderAdminDashboard === 'function') renderAdminDashboard();
        updateCloudStatusBadge('connected', data.items.length + ' máy');
        if (typeof toast === 'function') toast('✅ Đã tải danh mục từ Cloud thành công!', 'ok');
      }
    }).catch(function (e) {
      updateCloudStatusBadge('error', e.message);
    });
  }

  // Hook vào hàm adminSaveCatalogChanges để tự động đẩy lên Cloud khi Admin bấm Lưu / Sửa / Khóa / Xóa
  function hookAdminSave() {
    if (typeof window.adminSaveCatalogChanges === 'function') {
      var origAdminSave = window.adminSaveCatalogChanges;
      window.adminSaveCatalogChanges = function () {
        origAdminSave();
        pushCatalogToCloud(true);
      };
    }
  }

  // Khởi động khi trang web tải xong
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initFirebase();
      hookAdminSave();
    });
  } else {
    initFirebase();
    hookAdminSave();
  }
})();
