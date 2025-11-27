# Universal Player Logo Usage

## การใช้งาน Logo ใน Universal Player

Universal Player รองรับการแสดงผล logo ในมุมขวาบนของ player ได้โดยการตั้งค่าผ่าน props

## Props สำหรับ Logo

### Props พื้นฐาน
- `showLogo` (Boolean, default: false) - เปิด/ปิดการแสดงผล logo
- `logoUrl` (String, default: '') - URL ของไฟล์ logo
- `logoAlt` (String, default: 'Logo') - Alt text สำหรับ accessibility

### Props สำหรับขนาดและแสดงผล
- `logoWidth` (String, default: '60px') - กำหนดความกว้างของ logo
- `logoHeight` (String, default: '30px') - กำหนดความสูงของ logo
- `logoMaxWidth` (String, default: '100px') - กำหนดความกว้างสูงสุด
- `logoMaxHeight` (String, default: '50px') - กำหนดความสูงสูงสุด
- `logoBackgroundClass` (String, default: '') - CSS class เพิ่มเติมสำหรับพื้นหลังของ logo
- `alwaysShowLogo` (Boolean, default: false) - แสดง logo ตลอดเวลาแม้ในขณะเล่นวิดีโอ

## ตัวอย่างการใช้งาน

### การใช้งานพื้นฐาน
```vue
<template>
  <UniversalPlayer
    :src="videoUrl"
    :show-logo="true"
    logo-url="https://example.com/logo.png"
    logo-alt="Company Logo"
  />
</template>
```

### การใช้งานแบบปรับแต่งขนาด
```vue
<template>
  <UniversalPlayer
    :src="videoUrl"
    :show-logo="true"
    logo-url="https://example.com/logo.png"
    logo-width="80px"
    logo-height="40px"
    logo-max-width="120px"
    logo-max-height="60px"
    :always-show-logo="true"
  />
</template>
```

### การใช้งานกับ Custom Background
```vue
<template>
  <UniversalPlayer
    :src="videoUrl"
    :show-logo="true"
    logo-url="https://example.com/logo.png"
    logo-background-class="bg-white/90 border border-gray-200"
    @logo-error="handleLogoError"
  />
</template>

<script setup>
const handleLogoError = (error) => {
  console.error('Logo loading failed:', error);
  // จัดการ error เช่น ใช้ logo สำรอง
}
</script>
```

## Events

### logo-error
จะถูก emit เมื่อ logo ไม่สามารถโหลดได้

```javascript
// Event payload
{
  url: 'https://example.com/logo.png',
  error: Event,
  message: 'Logo image failed to load'
}
```

## การจัดตำแหน่งและแสดงผล

### ตำแหน่ง
- Logo จะแสดงที่มุมขวาบน (top-4 right-4)
- มี z-index: 20 เพื่อให้แสดงบน control bar

### พฤติกรรมการแสดงผล
- **ปกติ**: Logo จะซ่อนเมื่อเล่นวิดีโอและ UI ไม่แสดง
- **alwaysShowLogo=true**: Logo จะแสดงตลอดเวลา
- **เมื่อ hover หรือ UI แสดง**: Logo จะแสดงเสมอ

### Style เริ่มต้น
- พื้นหลัง: `bg-black/50 backdrop-blur-sm rounded-lg p-2 shadow-lg`
- Transition: `transition-all duration-300`
- Object fit: `object-contain`

## ตัวอย่างการใช้งานจริง

```vue
<template>
  <div class="video-container">
    <UniversalPlayer
      :src="videoSource"
      :show-logo="showCompanyLogo"
      :logo-url="companyLogoUrl"
      logo-alt="บริษัท ABC จำกัด"
      logo-width="100px"
      logo-height="50px"
      :always-show-logo="true"
      logo-background-class="bg-white/95 border border-gray-200 shadow-xl"
      @logo-error="onLogoLoadError"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UniversalPlayer from '@/components/videoplayer/UniversalPlayer.vue'

const videoSource = ref('https://example.com/video.mp4')
const showCompanyLogo = ref(true)
const companyLogoUrl = ref('https://example.com/company-logo.png')

const onLogoLoadError = (error) => {
  console.warn('Cannot load company logo:', error)
  // ใช้ logo สำรอง
  companyLogoUrl.value = '/fallback-logo.png'
}
</script>
```

## หมายเหตุ

1. รองรับไฟล์รูปภาพทุกรูปแบบที่ browser รองรับ (PNG, JPG, SVG, WebP, etc.)
2. ควรใช้รูป logo ที่มีขนาดเหมาะสม เพื่อไม่ให้กระทบต่อประสิทธิภาพ
3. สามารถใช้ CSS class เพิ่มเติมผ่าน `logoBackgroundClass` เพื่อปรับแต่งรูปลักษณ์
4. Logo จะ responsive ตามขนาดที่กำหนด
