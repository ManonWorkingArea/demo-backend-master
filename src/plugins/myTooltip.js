let tooltipEl = null;

function createTooltip() {
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'my-tooltip';
    tooltipEl.style.position = 'fixed';
    tooltipEl.style.zIndex = '9999';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.padding = '6px 12px';
    tooltipEl.style.background = '#222';
    tooltipEl.style.color = '#fff';
    tooltipEl.style.borderRadius = '6px';
    tooltipEl.style.fontSize = '13px';
    tooltipEl.style.fontWeight = '500';
    tooltipEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    tooltipEl.style.transition = 'opacity 0.15s, transform 0.15s';
    tooltipEl.style.opacity = '0';
    tooltipEl.style.transform = 'scale(0.95)';
    tooltipEl.style.whiteSpace = 'nowrap';
    tooltipEl.style.display = 'flex';
    tooltipEl.style.flexDirection = 'column';
    tooltipEl.style.alignItems = 'center';

    // สร้าง span สำหรับข้อความ
    const textSpan = document.createElement('span');
    textSpan.className = 'my-tooltip-text';
    tooltipEl.appendChild(textSpan);

    // arrow
    const arrow = document.createElement('div');
    arrow.className = 'my-tooltip-arrow';
    arrow.style.position = 'absolute';
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    arrow.style.width = '16px';
    arrow.style.height = '8px';
    arrow.style.overflow = 'hidden';
    arrow.innerHTML = `<svg width="16" height="8"><polygon points="0,0 8,8 16,0" style="fill:#222;" /></svg>`;
    tooltipEl.appendChild(arrow);

    document.body.appendChild(tooltipEl);
  }
}

function showTooltip(text, el) {
  createTooltip();
  tooltipEl.querySelector('.my-tooltip-text').textContent = text;
  tooltipEl.style.opacity = '1';
  tooltipEl.style.transform = 'scale(1)';
  const rect = el.getBoundingClientRect();
  const tooltipRect = tooltipEl.getBoundingClientRect();
  let left = rect.left + (rect.width - tooltipRect.width) / 2;
  let top = rect.top - tooltipRect.height - 8;

  // Default: arrow อยู่ข้างล่าง
  let arrowOnTop = false;
  if (top < 0) {
    // ถ้า tooltip จะล้นขอบบนจอ ให้แสดง tooltip ด้านล่าง element และ arrow อยู่ข้างบน
    top = rect.bottom + 8;
    arrowOnTop = true;
  }

  if (left < 8) left = 8;
  if (left + tooltipRect.width > window.innerWidth - 8) left = window.innerWidth - tooltipRect.width - 8;
  tooltipEl.style.left = left + 'px';
  tooltipEl.style.top = top + 'px';

  // arrow
  const arrow = tooltipEl.querySelector('.my-tooltip-arrow');
  if (arrow) {
    if (arrowOnTop) {
      // arrow อยู่ข้างบน
      arrow.style.top = '-8px';
      arrow.style.bottom = '';
      arrow.innerHTML = `<svg width="16" height="8"><polygon points="0,8 8,0 16,8" style="fill:#222;" /></svg>`;
    } else {
      // arrow อยู่ข้างล่าง (default)
      arrow.style.bottom = '-8px';
      arrow.style.top = '';
      arrow.innerHTML = `<svg width="16" height="8"><polygon points="0,0 8,8 16,0" style="fill:#222;" /></svg>`;
    }
  }
}

function hideTooltip() {
  if (tooltipEl) {
    tooltipEl.style.opacity = '0';
    tooltipEl.style.transform = 'scale(0.95)';
  }
}

export default {
  install(app) {
    app.directive('mytooltip', {
      mounted(el, binding) {
        const text = binding.value;
        if (!text) return;
        el._showTooltip = () => showTooltip(text, el);
        el._hideTooltip = hideTooltip;
        el.addEventListener('mouseenter', el._showTooltip);
        el.addEventListener('mouseleave', el._hideTooltip);
        el.addEventListener('focus', el._showTooltip);
        el.addEventListener('blur', el._hideTooltip);
      },
      updated(el, binding) {
        // อัปเดตข้อความ tooltip ถ้าเปลี่ยน
        el._showTooltip = () => showTooltip(binding.value, el);
      },
      unmounted(el) {
        el.removeEventListener('mouseenter', el._showTooltip);
        el.removeEventListener('mouseleave', el._hideTooltip);
        el.removeEventListener('focus', el._showTooltip);
        el.removeEventListener('blur', el._hideTooltip);
      }
    });
  }
}; 