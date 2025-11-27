/**
 * Utility functions สำหรับคำนวณความสูงของ header และ container
 */

/**
 * คำนวณความสูงของ header แบบ manual
 * @param {Object} options - ตัวเลือกสำหรับการคำนวณ
 * @returns {number} ความสูงของ header ใน pixels
 */
export function calculateHeaderHeight(options = {}) {
  const {
    baseHeight = 80,        // ความสูงพื้นฐาน
    hasTopbar = false,      // มี topbar หรือไม่
    hasBreadcrumb = false,  // มี breadcrumb หรือไม่
    hasSubHeader = false,   // มี sub header หรือไม่
    customElements = [],    // elements เพิ่มเติม [{ selector: '.custom', height: 40 }]
    extraPadding = 8        // padding เพิ่มเติม
  } = options;

  let totalHeight = baseHeight;

  // เพิ่มความสูงตาม components ต่างๆ
  if (hasTopbar) totalHeight += 40;
  if (hasBreadcrumb) totalHeight += 48;
  if (hasSubHeader) totalHeight += 56;

  // เพิ่มความสูงจาก custom elements
  customElements.forEach(element => {
    if (typeof element.height === 'number') {
      totalHeight += element.height;
    } else if (element.selector) {
      const el = document.querySelector(element.selector);
      if (el) {
        totalHeight += el.offsetHeight;
      }
    }
  });

  return totalHeight + extraPadding;
}

/**
 * สร้าง CSS calc string สำหรับความสูงของ container
 * @param {number} headerHeight - ความสูงของ header
 * @param {string} baseHeight - ความสูงพื้นฐาน (default: '100vh')
 * @returns {string} CSS calc string
 */
export function createHeightCalc(headerHeight, baseHeight = '100vh') {
  return `calc(${baseHeight} - ${headerHeight}px)`;
}

/**
 * ตรวจจับ header elements อัตโนมัติและคำนวณความสูง
 * @param {Array} selectors - array ของ CSS selectors ที่ต้องการตรวจจับ
 * @returns {number} ความสูงรวมของ elements ที่พบ
 */
export function detectHeaderElements(selectors = []) {
  const defaultSelectors = [
    'header',
    '.header',
    '.navbar',
    '.topbar',
    '.breadcrumb',
    '.access-bar',
    '[role="banner"]'
  ];

  const allSelectors = [...defaultSelectors, ...selectors];
  let totalHeight = 0;

  allSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // ตรวจสอบว่า element อยู่ในส่วนบนของหน้าจอ
      const rect = element.getBoundingClientRect();
      if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
        totalHeight += element.offsetHeight;
      }
    });
  });

  return totalHeight;
}

/**
 * สร้าง responsive header height
 * @param {Object} breakpoints - ความสูงตาม breakpoints
 * @returns {number} ความสูงที่เหมาะสมกับหน้าจอปัจจุบัน
 */
export function getResponsiveHeaderHeight(breakpoints = {}) {
  const defaultBreakpoints = {
    mobile: 56,    // <= 768px
    tablet: 72,    // <= 1024px
    desktop: 80    // > 1024px
  };

  const config = { ...defaultBreakpoints, ...breakpoints };
  const width = window.innerWidth;

  if (width <= 768) return config.mobile;
  if (width <= 1024) return config.tablet;
  return config.desktop;
}

/**
 * สร้าง configuration object สำหรับ layouts ต่างๆ
 */
export const LAYOUT_PRESETS = {
  // Layout พื้นฐาน
  basic: {
    baseHeight: 80,
    hasTopbar: false,
    hasBreadcrumb: false,
    hasSubHeader: false
  },

  // Layout สำหรับ admin
  admin: {
    baseHeight: 80,
    hasTopbar: true,
    hasBreadcrumb: true,
    hasSubHeader: false
  },

  // Layout แบบเต็ม
  fullAdmin: {
    baseHeight: 80,
    hasTopbar: true,
    hasBreadcrumb: true,
    hasSubHeader: true
  },

  // Layout สำหรับ mobile
  mobile: {
    baseHeight: 56,
    hasTopbar: false,
    hasBreadcrumb: false,
    hasSubHeader: false
  },

  // Layout แบบกำหนดเอง
  custom: {
    baseHeight: 80,
    customElements: [
      { selector: '.custom-header', height: 60 },
      { selector: '.notification-bar', height: 32 }
    ]
  }
};

/**
 * ใช้ preset configuration
 * @param {string} presetName - ชื่อของ preset
 * @param {Object} overrides - ค่าที่ต้องการ override
 * @returns {number} ความสูงที่คำนวณได้
 */
export function useLayoutPreset(presetName, overrides = {}) {
  const preset = LAYOUT_PRESETS[presetName];
  if (!preset) {
    console.warn(`Layout preset "${presetName}" not found. Using basic preset.`);
    return calculateHeaderHeight({ ...LAYOUT_PRESETS.basic, ...overrides });
  }

  return calculateHeaderHeight({ ...preset, ...overrides });
}

/**
 * Hook สำหรับ Vue composition API
 * @param {Object} options - ตัวเลือกสำหรับการคำนวณ
 * @returns {Object} reactive height values
 */
export function useHeaderHeight(options = {}) {
  const { ref, computed, onMounted, onUnmounted } = require('vue');
  
  const headerHeight = ref(0);
  const containerHeight = ref('100vh');

  const updateHeight = () => {
    headerHeight.value = calculateHeaderHeight(options);
    containerHeight.value = createHeightCalc(headerHeight.value);
  };

  onMounted(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateHeight);
  });

  return {
    headerHeight: computed(() => headerHeight.value),
    containerHeight: computed(() => containerHeight.value),
    updateHeight
  };
} 