/**
 * Page Mascot Component (Vanilla JS & Web Component)
 * Based on 'page-mascot' (nilbuild / koboyo.com)
 * Faithful sprite-sheet animation, cursor direction tracking, squashing physics,
 * boop payoffs, dizzy reactions, and cheerful assistant features.
 */

(function () {
  'use strict';

  const DIRECTIONS = [
    'up-left',
    'up',
    'up-right',
    'left',
    'center',
    'right',
    'down-left',
    'down',
    'down-right',
  ];

  const REACTIONS = [
    'blink',
    'heart',
    'sparkle',
    'surprised',
    'wink',
    'bashful',
    'sleepy',
    'dizzy',
    'delighted',
  ];

  const CLOCKWISE = [
    'right',
    'down-right',
    'down',
    'down-left',
    'left',
    'up-left',
    'up',
    'up-right',
  ];

  const SECTOR = (Math.PI * 2) / CLOCKWISE.length;
  const HYSTERESIS = 0.12;
  const DEAD_ZONE = 70;
  const PAYOFFS = ['heart', 'sparkle', 'delighted'];
  const BOOP_PAYOFF = 120;
  const BOOP_END = 560;
  const SQUASH_MS = 420;
  const DIZZY_AFTER = 4;
  const DIZZY_WINDOW = 1600;
  const DIZZY_END = 1100;

  const SQUASH = [
    { transform: 'scale(1, 1)', easing: 'ease-in' },
    { transform: 'scale(1.10, 0.86)', offset: 0.18, easing: 'ease-out' },
    { transform: 'scale(0.95, 1.08)', offset: 0.45, easing: 'ease-in-out' },
    { transform: 'scale(1.03, 0.97)', offset: 0.72, easing: 'ease-in-out' },
    { transform: 'scale(1, 1)' },
  ];

  function cellPosition(index) {
    if (index < 0) return '50% 50%';
    const col = index % 3;
    const row = Math.floor(index / 3);
    return `${col * 50}% ${row * 50}%`;
  }

  function wrap(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  // Audio synthesizer for joyful clicks (Boop sound)
  let audioCtx = null;
  function playBoopSound(type = 'boop') {
    if (!window.mascotSoundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === 'dizzy') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.35);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        osc.type = 'sine';
        const startFreq = 480 + Math.random() * 80;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.35, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch (e) {
      // Audio context might be restricted before first gesture
    }
  }

  // Fun helper quotes for estimating & cheerleading
  const FUN_QUOTES = [
    'Chào bạn! Em là Gấu Trúc trợ lý dự toán đây 🐼✨',
    'Hôm nay tính toán nhanh gọn, xuất file chuẩn đét nha! 📊',
    'Báo giá Thuận Phát chuẩn mẫu V1 - chuyên nghiệp số 1! 🧾',
    'Boop em hoài vậy... nhưng mà em thích lắm! 🥰❤️',
    'Nhớ kiểm tra kỹ tỷ lệ lợi nhuận trước khi xuất Excel nhé! 💡',
    'Cố lên bạn ơi, sắp xong dự toán rồi về sớm nào! 🚀',
    'Gấu trúc chúc bạn chốt được nhiều hợp đồng lớn! 🍀💰',
    'Thèm lá trúc quá... lát tan làm đi ăn thôi! 🎋🍜',
    'Em luôn dõi theo từng bước con trỏ chuột của bạn đó nha 👀',
  ];

  const DIZZY_QUOTES = [
    '😵 Á á hoa cả mắt rồi bạn ơiii! Đừng chọc em nữa hihi!',
    '😵‍💫 Chóng mặt quá trời luôn nè! Cho em nghỉ xíu đi 🐼',
    '😵 Vòng xoay vũ trụ... sao nhiều số dự toán bay lượn thế này!',
  ];

  class PageMascotCore {
    constructor(container, options = {}) {
      this.container = container;
      this.directions = options.directions || 'mascots/panda-directions.webp';
      this.reactions = options.reactions || 'mascots/panda-reactions.webp';
      this.size = options.size || 120;
      this.label = options.label || 'panda mascot';
      this.onBoop = options.onBoop || null;

      this.direction = 'center';
      this.reaction = null;
      this.timers = [];
      this.boops = { count: 0, at: 0 };
      this.sector = -1;
      this.pointer = null;
      this.isDestroyed = false;

      this.buildDOM();
      this.bindEvents();
    }

    buildDOM() {
      this.button = document.createElement('button');
      this.button.type = 'button';
      this.button.className = 'page-mascot-btn';
      this.button.setAttribute('aria-label', `Boop the ${this.label}`);
      Object.assign(this.button.style, {
        position: 'relative',
        display: 'block',
        flexShrink: '0',
        width: `${this.size}px`,
        height: `${this.size}px`,
        padding: '0',
        border: '0',
        background: 'transparent',
        appearance: 'none',
        cursor: 'pointer',
        userSelect: 'none',
        outline: 'none',
        margin: '0 auto',
      });

      this.squashSpan = document.createElement('span');
      this.squashSpan.className = 'page-mascot-squash';
      Object.assign(this.squashSpan.style, {
        position: 'relative',
        display: 'block',
        width: '100%',
        height: '100%',
        transformOrigin: '50% 78%',
      });

      // Layer 1: Directions
      this.dirLayer = document.createElement('span');
      this.dirLayer.className = 'page-mascot-layer page-mascot-directions';
      Object.assign(this.dirLayer.style, {
        position: 'absolute',
        inset: '0',
        backgroundSize: '300% 300%',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url("${this.directions}")`,
        backgroundPosition: cellPosition(DIRECTIONS.indexOf('center')),
        opacity: '1',
        transition: 'opacity 0.08s ease',
        pointerEvents: 'none',
      });

      // Layer 2: Reactions
      this.reactLayer = document.createElement('span');
      this.reactLayer.className = 'page-mascot-layer page-mascot-reactions';
      Object.assign(this.reactLayer.style, {
        position: 'absolute',
        inset: '0',
        backgroundSize: '300% 300%',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url("${this.reactions}")`,
        backgroundPosition: cellPosition(REACTIONS.indexOf('blink')),
        opacity: '0',
        transition: 'opacity 0.08s ease',
        pointerEvents: 'none',
      });

      this.squashSpan.appendChild(this.dirLayer);
      this.squashSpan.appendChild(this.reactLayer);
      this.button.appendChild(this.squashSpan);

      this.container.appendChild(this.button);
    }

    setSize(newSize) {
      this.size = newSize;
      this.button.style.width = `${newSize}px`;
      this.button.style.height = `${newSize}px`;
    }

    setDirection(dir) {
      if (this.direction === dir) return;
      this.direction = dir;
      const idx = DIRECTIONS.indexOf(dir);
      this.dirLayer.style.backgroundPosition = cellPosition(idx >= 0 ? idx : 4);
    }

    setReaction(react) {
      this.reaction = react;
      if (react) {
        const idx = REACTIONS.indexOf(react);
        this.reactLayer.style.backgroundPosition = cellPosition(idx >= 0 ? idx : 0);
        this.reactLayer.style.opacity = '1';
        this.dirLayer.style.opacity = '0';
      } else {
        this.reactLayer.style.opacity = '0';
        this.dirLayer.style.opacity = '1';
      }
    }

    aim() {
      if (!this.button || !this.pointer || this.isDestroyed) return;
      const box = this.button.getBoundingClientRect();
      const dx = this.pointer.x - (box.left + box.width / 2);
      const dy = this.pointer.y - (box.top + box.height / 2);

      if (Math.hypot(dx, dy) < DEAD_ZONE) {
        this.sector = -1;
        this.setDirection('center');
        return;
      }

      // Angle calculation matching original atan2
      const angle = Math.atan2(dy, dx);
      if (
        this.sector !== -1 &&
        Math.abs(wrap(angle - this.sector * SECTOR)) < SECTOR / 2 + HYSTERESIS
      ) {
        return;
      }

      this.sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length;
      this.setDirection(CLOCKWISE[this.sector]);
    }

    boop() {
      this.timers.forEach((t) => window.clearTimeout(t));
      this.timers = [];

      const later = (ms, next) => {
        const t = window.setTimeout(() => {
          if (!this.isDestroyed) this.setReaction(next);
        }, ms);
        this.timers.push(t);
      };

      const now = Date.now();
      this.boops.count = now - this.boops.at < DIZZY_WINDOW ? this.boops.count + 1 : 1;
      this.boops.at = now;

      const isDizzy = this.boops.count >= DIZZY_AFTER;
      if (isDizzy) {
        this.boops.count = 0;
        this.setReaction('dizzy');
        playBoopSound('dizzy');
        later(DIZZY_END, null);
      } else {
        this.setReaction('blink');
        playBoopSound('boop');
        const payoff = PAYOFFS[(this.boops.count - 1) % PAYOFFS.length];
        later(BOOP_PAYOFF, payoff);
        later(BOOP_END, null);
      }

      // Squash bounce animation
      if (
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        this.squashSpan.animate
      ) {
        this.squashSpan.animate(SQUASH, { duration: SQUASH_MS, easing: 'linear' });
      }

      if (typeof this.onBoop === 'function') {
        this.onBoop({ count: this.boops.count, isDizzy });
      }
    }

    bindEvents() {
      this.button.addEventListener('click', (e) => {
        e.preventDefault();
        this.boop();
      });

      this.onPointerMove = (e) => {
        this.pointer = { x: e.clientX, y: e.clientY };
        this.aim();
      };

      this.onScroll = () => {
        this.aim();
      };

      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        window.addEventListener('pointermove', this.onPointerMove, { passive: true });
        window.addEventListener('scroll', this.onScroll, { passive: true });
      }
    }

    destroy() {
      this.isDestroyed = true;
      this.timers.forEach((t) => window.clearTimeout(t));
      this.timers = [];
      window.removeEventListener('pointermove', this.onPointerMove);
      window.removeEventListener('scroll', this.onScroll);
      if (this.button && this.button.parentNode) {
        this.button.parentNode.removeChild(this.button);
      }
    }
  }

  // Web Component <page-mascot>
  class PageMascotElement extends HTMLElement {
    connectedCallback() {
      const directions = this.getAttribute('directions') || 'mascots/panda-directions.webp';
      const reactions = this.getAttribute('reactions') || 'mascots/panda-reactions.webp';
      const size = parseInt(this.getAttribute('size') || '120', 10);
      const label = this.getAttribute('label') || 'panda mascot';

      this.core = new PageMascotCore(this, {
        directions,
        reactions,
        size,
        label,
      });
    }

    disconnectedCallback() {
      if (this.core) {
        this.core.destroy();
      }
    }
  }

  if (!customElements.get('page-mascot')) {
    customElements.define('page-mascot', PageMascotElement);
  }

  // Expose Core Class to Global Window
  window.PageMascot = PageMascotCore;
  window.mascotSoundEnabled = localStorage.getItem('mascot_sound_muted') !== 'true';

  // ═════════════════════════════════════════════════════════════════
  // THUẬN PHÁT MASCOT WIDGET MANAGER
  // Handles Sidebar integration, Floating badge, Speech bubbles,
  // drag & drop, and cheerful user interactions
  // ═════════════════════════════════════════════════════════════════
  class PandaMascotWidget {
    constructor() {
      this.mode = localStorage.getItem('mascot_display_mode') || 'sidebar'; // 'sidebar' | 'floating' | 'hidden'
      this.currentMascot = null;
      this.bubbleTimeout = null;
      this.init();
    }

    init() {
      this.injectStyles();
      this.createSidebarWidget();
      this.createFloatingWidget();
      this.applyMode(this.mode);
      this.setupIdleSpeech();
    }

    injectStyles() {
      const style = document.createElement('style');
      style.id = 'page-mascot-styles';
      style.textContent = `
        /* Mascot Sidebar Card (Clean & Borderless) */
        .sidebar-mascot-card {
          margin: 6px 0 4px 0;
          background: transparent !important;
          border: none !important;
          border-radius: 0 !important;
          padding: 2px 0 !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          box-shadow: none !important;
          transition: all 0.25s ease;
          overflow: visible;
        }

        [data-theme="dark"] .sidebar-mascot-card {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        .app-sidebar.collapsed .sidebar-mascot-card {
          display: none !important;
        }

        .mascot-header-bar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
          margin-bottom: 2px;
          padding: 0 4px;
        }

        .mascot-title-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 800;
          color: #001A4C;
          letter-spacing: -0.2px;
        }

        [data-theme="dark"] .mascot-title-badge {
          color: #dfc27e;
        }

        .mascot-actions-strip {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .mascot-action-btn {
          background: transparent;
          border: 1px solid var(--bdr, #e2e8f0);
          border-radius: 6px;
          width: 22px;
          height: 22px;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--t2, #64748b);
          transition: all 0.15s ease;
        }

        .mascot-action-btn:hover {
          background: var(--card, #fff);
          color: var(--t1, #0f172a);
          border-color: var(--gr, #c3a45c);
          transform: scale(1.08);
        }

        /* Mascot Speech Bubble */
        .mascot-speech-bubble {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(6px) scale(0.92);
          background: #ffffff;
          color: #001A4C;
          border: 1.5px solid #c3a45c;
          border-radius: 12px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.35;
          text-align: center;
          width: 210px;
          box-shadow: 0 8px 24px rgba(0, 26, 76, 0.18);
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          transition: all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 10001;
        }

        [data-theme="dark"] .mascot-speech-bubble {
          background: #0f1c30;
          color: #f1f5f9;
          border-color: #c3a45c;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        }

        .mascot-speech-bubble::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 6px 6px 0 6px;
          border-style: solid;
          border-color: #ffffff transparent transparent transparent;
        }

        [data-theme="dark"] .mascot-speech-bubble::after {
          border-color: #0f1c30 transparent transparent transparent;
        }

        .mascot-speech-bubble.active {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0) scale(1);
        }

        /* Mascot Sub-Text / Prompt */
        .mascot-subtext {
          font-size: 10.5px;
          color: var(--t3, #64748b);
          font-weight: 600;
          margin-top: 4px;
          text-align: center;
        }

        /* Floating Mode Overlay */
        .mascot-floating-wrapper {
          position: fixed;
          bottom: 22px;
          right: 22px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: grab;
          filter: drop-shadow(0 10px 25px rgba(0, 26, 76, 0.22));
          transition: transform 0.15s ease;
        }

        .mascot-floating-wrapper:active {
          cursor: grabbing;
        }

        .mascot-floating-inner {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1.5px solid rgba(195, 164, 92, 0.4);
          border-radius: 50%;
          padding: 6px;
          position: relative;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
        }

        [data-theme="dark"] .mascot-floating-inner {
          background: rgba(11, 21, 38, 0.85);
          border-color: rgba(195, 164, 92, 0.35);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
        }

        .mascot-floating-inner:hover {
          transform: scale(1.05);
          border-color: #c3a45c;
        }

        .mascot-floating-controls {
          position: absolute;
          top: -10px;
          right: -8px;
          display: flex;
          gap: 3px;
        }

        .mascot-floating-mini-btn {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid var(--bdr, #cbd5e1);
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: all 0.15s;
        }

        [data-theme="dark"] .mascot-floating-mini-btn {
          background: #1e293b;
          border-color: #334155;
          color: #f8fafc;
        }

        .mascot-floating-mini-btn:hover {
          transform: scale(1.15);
          background: #c3a45c;
          color: #fff;
        }

        /* Minimized floating button when hidden */
        .mascot-minimized-launcher {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9998;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #001A4C 0%, #002b66 60%, #c3a45c 100%);
          border: 2px solid #ffffff;
          box-shadow: 0 4px 15px rgba(0, 26, 76, 0.3);
          color: #fff;
          font-size: 20px;
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mascot-minimized-launcher:hover {
          transform: scale(1.12);
        }
      `;
      document.head.appendChild(style);
    }

    createSidebarWidget() {
      const sidebarNav = document.getElementById('mainTabsBar');
      const sidebarFooter = document.querySelector('.sidebar-footer');
      if (!sidebarNav && !sidebarFooter) return;

      const card = document.createElement('div');
      card.className = 'sidebar-mascot-card';
      card.id = 'sidebarMascotCard';

      card.innerHTML = `
        <div class="mascot-speech-bubble" id="sidebarMascotBubble">
          Xin chào! Em là Gấu Trúc Thuận Phát 🐼
        </div>
        <div class="mascot-header-bar">
          <div class="mascot-actions-strip">
            <button class="mascot-action-btn" id="btnMascotSoundToggle" title="Bật / Tắt âm thanh boop">
              ${window.mascotSoundEnabled ? '🔊' : '🔇'}
            </button>
            <button class="mascot-action-btn" id="btnMascotFloatToggle" title="Chuyển chế độ bay góc màn hình">
              ↗️
            </button>
          </div>
        </div>
        <div id="sidebarMascotMount" style="position:relative; width:100%; display:flex; justify-content:center; min-height:105px;"></div>
      `;

      // Insert before sidebar footer if available, otherwise append to sidebar
      if (sidebarFooter && sidebarFooter.parentNode) {
        sidebarFooter.parentNode.insertBefore(card, sidebarFooter);
      } else if (sidebarNav && sidebarNav.parentNode) {
        sidebarNav.parentNode.appendChild(card);
      }

      const soundBtn = document.getElementById('btnMascotSoundToggle');
      if (soundBtn) {
        soundBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleSound();
        });
      }

      const floatBtn = document.getElementById('btnMascotFloatToggle');
      if (floatBtn) {
        floatBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.applyMode('floating');
        });
      }
    }

    createFloatingWidget() {
      // Floating container
      const wrap = document.createElement('div');
      wrap.className = 'mascot-floating-wrapper';
      wrap.id = 'mascotFloatingWrapper';
      wrap.style.display = 'none';

      wrap.innerHTML = `
        <div class="mascot-speech-bubble" id="floatingMascotBubble">
          Em ở góc này cổ vũ bạn nhé! 🐼✨
        </div>
        <div class="mascot-floating-controls">
          <button class="mascot-floating-mini-btn" id="btnFloatToSidebar" title="Đưa gấu về lại menu bên trái">📌</button>
          <button class="mascot-floating-mini-btn" id="btnFloatMinimize" title="Thu nhỏ gấu">✕</button>
        </div>
        <div class="mascot-floating-inner" id="floatingMascotMount"></div>
      `;

      document.body.appendChild(wrap);

      // Minimized launcher button
      const launcher = document.createElement('button');
      launcher.className = 'mascot-minimized-launcher';
      launcher.id = 'mascotMinimizedLauncher';
      launcher.title = 'Mở lại bé Gấu Trúc Thuận Phát';
      launcher.innerHTML = '🐼';
      launcher.addEventListener('click', () => {
        this.applyMode('floating');
      });
      document.body.appendChild(launcher);

      const btnToSidebar = document.getElementById('btnFloatToSidebar');
      if (btnToSidebar) {
        btnToSidebar.addEventListener('click', (e) => {
          e.stopPropagation();
          this.applyMode('sidebar');
        });
      }

      const btnMin = document.getElementById('btnFloatMinimize');
      if (btnMin) {
        btnMin.addEventListener('click', (e) => {
          e.stopPropagation();
          this.applyMode('hidden');
        });
      }

      // Dragging support for floating mode
      this.makeDraggable(wrap);
    }

    makeDraggable(elem) {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let initialRight = 22;
      let initialBottom = 22;

      elem.addEventListener('mousedown', (e) => {
        if (e.target.closest('.page-mascot-btn') || e.target.closest('button')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = elem.getBoundingClientRect();
        initialRight = window.innerWidth - rect.right;
        initialBottom = window.innerHeight - rect.bottom;
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newRight = Math.max(10, Math.min(window.innerWidth - 120, initialRight - dx));
        const newBottom = Math.max(10, Math.min(window.innerHeight - 120, initialBottom - dy));
        elem.style.right = `${newRight}px`;
        elem.style.bottom = `${newBottom}px`;
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });
    }

    applyMode(mode) {
      this.mode = mode;
      localStorage.setItem('mascot_display_mode', mode);

      if (this.currentMascot) {
        this.currentMascot.destroy();
        this.currentMascot = null;
      }

      const sidebarCard = document.getElementById('sidebarMascotCard');
      const floatingWrap = document.getElementById('mascotFloatingWrapper');
      const launcher = document.getElementById('mascotMinimizedLauncher');

      if (sidebarCard) sidebarCard.style.display = 'none';
      if (floatingWrap) floatingWrap.style.display = 'none';
      if (launcher) launcher.style.display = 'none';

      if (mode === 'sidebar') {
        if (sidebarCard) sidebarCard.style.display = 'flex';
        const mount = document.getElementById('sidebarMascotMount');
        if (mount) {
          mount.innerHTML = '';
          this.currentMascot = new PageMascotCore(mount, {
            directions: 'mascots/panda-directions.webp',
            reactions: 'mascots/panda-reactions.webp',
            size: 105,
            label: 'Thuận Phát panda mascot',
            onBoop: (data) => this.handleBoop(data, 'sidebar'),
          });
        }
      } else if (mode === 'floating') {
        if (floatingWrap) floatingWrap.style.display = 'flex';
        const mount = document.getElementById('floatingMascotMount');
        if (mount) {
          mount.innerHTML = '';
          this.currentMascot = new PageMascotCore(mount, {
            directions: 'mascots/panda-directions.webp',
            reactions: 'mascots/panda-reactions.webp',
            size: 110,
            label: 'Thuận Phát floating panda',
            onBoop: (data) => this.handleBoop(data, 'floating'),
          });
        }
      } else if (mode === 'hidden') {
        if (launcher) launcher.style.display = 'flex';
      }
    }

    toggleSound() {
      window.mascotSoundEnabled = !window.mascotSoundEnabled;
      localStorage.setItem('mascot_sound_muted', (!window.mascotSoundEnabled).toString());
      const btn = document.getElementById('btnMascotSoundToggle');
      if (btn) btn.textContent = window.mascotSoundEnabled ? '🔊' : '🔇';
      this.showSpeechBubble(
        window.mascotSoundEnabled ? 'Đã bật âm thanh boop! 🔊🎶' : 'Đã tắt âm thanh! 🔇'
      );
    }

    handleBoop(data, source = 'sidebar') {
      let quote;
      if (data.isDizzy) {
        quote = DIZZY_QUOTES[Math.floor(Math.random() * DIZZY_QUOTES.length)];
      } else {
        quote = FUN_QUOTES[Math.floor(Math.random() * FUN_QUOTES.length)];
      }
      this.showSpeechBubble(quote, source);
    }

    showSpeechBubble(text, source = this.mode) {
      const bubbleId = source === 'floating' ? 'floatingMascotBubble' : 'sidebarMascotBubble';
      const bubble = document.getElementById(bubbleId);
      if (!bubble) return;

      bubble.textContent = text;
      bubble.classList.add('active');

      if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
      this.bubbleTimeout = setTimeout(() => {
        bubble.classList.remove('active');
      }, 3400);
    }

    setupIdleSpeech() {
      // Periodically encourage user every 2-3 minutes when active
      setInterval(() => {
        if (this.mode !== 'hidden' && Math.random() > 0.4) {
          const idleQuotes = [
            '🐼 Đang làm dự toán gì đó bạn ơi?',
            '⭐ Thuận Phát thuanphat8.vn luôn đồng hành cùng bạn!',
            '🎋 Giải lao chút uống ngụm nước nha!',
            '✨ File dự toán cần em kiểm tra cùng không nè?',
          ];
          const q = idleQuotes[Math.floor(Math.random() * idleQuotes.length)];
          this.showSpeechBubble(q);
        }
      }, 120000);
    }
  }

  // Initialize widget when DOM is ready
  function initMascotWidget() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => new PandaMascotWidget());
    } else {
      new PandaMascotWidget();
    }
  }

  initMascotWidget();
})();
