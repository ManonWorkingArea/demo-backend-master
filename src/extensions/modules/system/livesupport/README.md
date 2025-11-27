# Live Support Component

## การปรับความสูงให้เหมาะกับ Header

Support component ได้รับการปรับปรุงให้สามารถชดเชยความสูงของ header/navbar ที่อยู่ด้านบนได้อัตโนมัติ

### วิธีการใช้งาน

#### 1. Auto-detect (แนะนำ)
```vue
<Support />
```
Component จะตรวจจับความสูงของ header elements อัตโนมัติ

#### 2. กำหนดประเภท Header
```vue
<Support header-type="topbar" />
<Support header-type="breadcrumb" />
<Support header-type="full-admin" />
```

#### 3. กำหนดความสูงของ Header
```vue
<Support :header-height="100" />
<Support header-height="120px" />
```

#### 4. กำหนดความสูงทั้งหมด
```vue
<Support custom-height="calc(100vh - 120px)" />
<Support custom-height="80vh" />
```

#### 5. เพิ่ม CSS Class
```vue
<Support custom-class="my-custom-support" />
```

## 🛠 การปรับแบบ Manual (Manual Configuration)

### วิธีที่ 1: ใช้ Props ใน View File

```vue
<template>
  <!-- กำหนดความสูงแบบ manual -->
  <Support :header-height="manualHeaderHeight" />
  
  <!-- ใช้ computed property -->
  <Support :header-height="dynamicHeaderHeight" />
  
  <!-- กำหนดความสูงทั้งหมด -->
  <Support :custom-height="customContainerHeight" />
</template>

<script>
export default {
  data() {
    return {
      manualHeaderHeight: 120, // ปรับค่านี้ตามต้องการ
    };
  },
  computed: {
    dynamicHeaderHeight() {
      // คำนวณความสูงแบบ dynamic
      const hasTopbar = document.querySelector('.topbar') !== null;
      const hasBreadcrumb = document.querySelector('.breadcrumb') !== null;
      
      let height = 80; // ความสูงพื้นฐาน
      if (hasTopbar) height += 40;
      if (hasBreadcrumb) height += 40;
      
      return height;
    },
    
    customContainerHeight() {
      return `calc(100vh - ${this.manualHeaderHeight}px)`;
    }
  },
  methods: {
    updateHeaderHeight(newHeight) {
      this.manualHeaderHeight = newHeight;
    }
  }
};
</script>
```

### วิธีที่ 2: ใช้ Utility Functions

```javascript
// Import utility functions
import { 
  calculateHeaderHeight, 
  createHeightCalc, 
  useLayoutPreset,
  LAYOUT_PRESETS 
} from './utils/heightCalculator.js';

export default {
  computed: {
    headerHeight() {
      // วิธีที่ 1: คำนวณแบบ manual
      return calculateHeaderHeight({
        baseHeight: 80,
        hasTopbar: true,
        hasBreadcrumb: true,
        customElements: [
          { selector: '.notification-bar', height: 32 }
        ],
        extraPadding: 8
      });
    },
    
    // วิธีที่ 2: ใช้ preset
    presetHeight() {
      return useLayoutPreset('fullAdmin', {
        extraPadding: 16
      });
    },
    
    containerHeight() {
      return createHeightCalc(this.headerHeight);
    }
  }
};
```

### วิธีที่ 3: ใช้ Layout Presets

```vue
<template>
  <!-- ใช้ preset สำเร็จรูป -->
  <Support :header-height="adminHeight" />
</template>

<script>
import { useLayoutPreset } from './utils/heightCalculator.js';

export default {
  computed: {
    adminHeight() {
      return useLayoutPreset('admin'); // 80 + 40 + 48 = 168px
    },
    
    customHeight() {
      return useLayoutPreset('custom', {
        baseHeight: 100,
        extraPadding: 20
      });
    }
  }
};
</script>
```

### วิธีที่ 4: การคำนวณแบบ Real-time

```vue
<template>
  <div>
    <!-- Control Panel -->
    <div class="control-panel">
      <h3>Manual Height Control</h3>
      <input 
        type="range" 
        min="60" 
        max="200" 
        v-model="headerHeight"
        class="w-full"
      />
      <p>Header Height: {{ headerHeight }}px</p>
      
      <label>
        <input type="checkbox" v-model="hasTopbar" />
        Has Topbar (+40px)
      </label>
      
      <label>
        <input type="checkbox" v-model="hasBreadcrumb" />
        Has Breadcrumb (+48px)
      </label>
    </div>
    
    <!-- Support Component -->
    <Support :header-height="calculatedHeight" />
  </div>
</template>

<script>
import { calculateHeaderHeight } from './utils/heightCalculator.js';

export default {
  data() {
    return {
      headerHeight: 80,
      hasTopbar: false,
      hasBreadcrumb: false
    };
  },
  computed: {
    calculatedHeight() {
      return calculateHeaderHeight({
        baseHeight: this.headerHeight,
        hasTopbar: this.hasTopbar,
        hasBreadcrumb: this.hasBreadcrumb
      });
    }
  }
};
</script>
```

### Layout Presets ที่มีให้ใช้

```javascript
// Basic layout (80px)
useLayoutPreset('basic')

// Admin layout (168px = 80 + 40 + 48)
useLayoutPreset('admin')

// Full admin layout (224px = 80 + 40 + 48 + 56)
useLayoutPreset('fullAdmin')

// Mobile layout (56px)
useLayoutPreset('mobile')

// Custom layout
useLayoutPreset('custom', {
  baseHeight: 100,
  customElements: [
    { selector: '.my-header', height: 60 }
  ]
})
```

### การใช้งานกับ CSS Variables

```vue
<script>
export default {
  mounted() {
    // ตั้งค่า CSS variable แบบ manual
    const headerHeight = 140;
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
  }
};
</script>

<style>
.my-component {
  height: calc(100vh - var(--header-height, 80px));
}
</style>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `headerType` | String | `null` | ประเภทของ header layout (`topbar`, `breadcrumb`, `full-admin`) |
| `headerHeight` | Number/String | `null` | ความสูงของ header |
| `customHeight` | String | `null` | ความสูงทั้งหมดของ component |
| `customClass` | String | `''` | CSS class เพิ่มเติม |

### CSS Variables

Component ใช้ CSS variable `--header-height` ในการคำนวณความสูง:

```css
.support-container {
  height: calc(100vh - var(--header-height, 64px));
}
```

### ความสูงเริ่มต้น

- **Mobile**: 56px
- **Desktop**: 80px
- **With Topbar**: 120px
- **With Breadcrumb**: 140px
- **Full Admin**: 160px

### การ Debug

Component จะแสดง log ใน console เพื่อช่วยในการ debug:
```
Support Component: Calculated header height = 120px
```

### ตัวอย่างการใช้งานในระบบต่างๆ

#### ระบบ Admin ทั่วไป
```vue
<Support header-type="full-admin" />
```

#### ระบบที่มี Topbar
```vue
<Support header-type="topbar" />
```

#### กำหนดเองสำหรับ Layout พิเศษ
```vue
<Support :header-height="headerHeight" />

<script>
export default {
  computed: {
    headerHeight() {
      // คำนวณความสูงตาม layout ปัจจุบัน
      return this.hasTopbar ? 120 : 80;
    }
  }
}
</script>
```

### Utility Functions API

#### `calculateHeaderHeight(options)`
คำนวณความสูงของ header แบบ manual

#### `createHeightCalc(headerHeight, baseHeight)`
สร้าง CSS calc string

#### `useLayoutPreset(presetName, overrides)`
ใช้ preset configuration

#### `detectHeaderElements(selectors)`
ตรวจจับ header elements อัตโนมัติ

#### `getResponsiveHeaderHeight(breakpoints)`
สร้าง responsive header height 