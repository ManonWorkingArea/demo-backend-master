# Ticket Management Component

## การปรับความสูงให้เหมาะกับ Header

Ticket component ได้รับการปรับปรุงให้สามารถชดเชยความสูงของ header/navbar ที่อยู่ด้านบนได้อัตโนมัติ เหมือนกับ Support component

### วิธีการใช้งาน

#### 1. Auto-detect (แนะนำ)
```vue
<Ticket />
```
Component จะตรวจจับความสูงของ header elements อัตโนมัติ

#### 2. กำหนดประเภท Header
```vue
<Ticket header-type="topbar" />
<Ticket header-type="breadcrumb" />
<Ticket header-type="full-admin" />
```

#### 3. กำหนดความสูงของ Header
```vue
<Ticket :header-height="100" />
<Ticket header-height="120px" />
```

#### 4. กำหนดความสูงทั้งหมด
```vue
<Ticket custom-height="calc(100vh - 120px)" />
<Ticket custom-height="80vh" />
```

#### 5. เพิ่ม CSS Class
```vue
<Ticket custom-class="my-custom-ticket" />
```

## 🛠 การปรับแบบ Manual (Manual Configuration)

### วิธีที่ 1: ใช้ Props ใน View File

```vue
<template>
  <!-- กำหนดความสูงแบบ manual -->
  <Ticket :header-height="manualHeaderHeight" />
  
  <!-- ใช้ computed property -->
  <Ticket :header-height="dynamicHeaderHeight" />
  
  <!-- กำหนดความสูงทั้งหมด -->
  <Ticket :custom-height="customContainerHeight" />
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

### วิธีที่ 2: ใช้ Utility Functions (ใช้ร่วมกับ Support)

```javascript
// Import utility functions จาก Support module
import { 
  calculateHeaderHeight, 
  createHeightCalc, 
  useLayoutPreset,
  LAYOUT_PRESETS 
} from '../livesupport/utils/heightCalculator.js';

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

### วิธีที่ 3: การคำนวณแบบ Real-time

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
    
    <!-- Ticket Component -->
    <Ticket :header-height="calculatedHeight" />
  </div>
</template>

<script>
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
      let height = this.headerHeight;
      if (this.hasTopbar) height += 40;
      if (this.hasBreadcrumb) height += 48;
      return height;
    }
  }
};
</script>
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
.ticket-container {
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
Ticket Component: Calculated header height = 120px
```

### ตัวอย่างการใช้งานในระบบต่างๆ

#### ระบบ Admin ทั่วไป
```vue
<Ticket header-type="full-admin" />
```

#### ระบบที่มี Topbar
```vue
<Ticket header-type="topbar" />
```

#### กำหนดเองสำหรับ Layout พิเศษ
```vue
<Ticket :header-height="headerHeight" />

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

### ความแตกต่างจาก Support Component

1. **UI Layout**: Ticket มี layout แบบ ticket management system
2. **Functionality**: มีฟีเจอร์การจัดการตั๋ว, comments, และ status tracking
3. **Data Structure**: ใช้โครงสร้างข้อมูลสำหรับ tickets แทน conversations
4. **CSS Classes**: ใช้ `.ticket-container` แทน `.support-container`

### การ Share Utility Functions

สามารถใช้ utility functions ร่วมกันระหว่าง Ticket และ Support components ได้:

```javascript
// ใน Ticket component
import { calculateHeaderHeight } from '../livesupport/utils/heightCalculator.js';
```

### Migration จาก Version เก่า

หากคุณมี Ticket component เวอร์ชันเก่า สามารถ migrate ได้โดย:

1. เพิ่ม props ใหม่
2. เพิ่ม methods สำหรับการคำนวณความสูง
3. อัปเดต CSS classes
4. เพิ่ม event listeners สำหรับ resize

```vue
<!-- เก่า -->
<Ticket />

<!-- ใหม่ -->
<Ticket :header-height="120" />
``` 