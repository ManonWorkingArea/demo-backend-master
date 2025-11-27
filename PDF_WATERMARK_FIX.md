# PDF Watermark Visibility Fix

## ปัญหาที่พบ

ลายน้ำ (Watermarks) ไม่แสดงใน PDF ที่สร้างจาก image-based rendering แม้ว่า PDF จะถูกสร้างจากรูปภาพแล้ว

## สาเหตุของปัญหา

### 1. Opacity ต่ำเกินไป
```css
/* Original opacity values - ต่ำมาก */
.document-watermark[data-type="original"] {
  color: rgba(37, 99, 235, 0.12); /* opacity เพียง 12% */
}

.document-watermark[data-type="copy"] {
  color: rgba(239, 68, 68, 0.12); /* opacity เพียง 12% */
}

.document-watermark {
  color: rgba(0, 0, 0, 0.08); /* opacity เพียง 8% */
}
```

### 2. การบีบอัด JPEG
- html2canvas แปลงเป็นรูปภาพ
- บีบอัดเป็น JPEG quality 95%
- Opacity ต่ำ + การบีบอัด = ลายน้ำหายไป

## วิธีแก้ไข

### 1. เพิ่ม Opacity ชั่วคราวสำหรับ PDF Generation

```javascript
// ใน downloadWithJsPDF()
const watermarks = element.querySelectorAll('.document-watermark')
const originalWatermarkStyles = []

watermarks.forEach((watermark, index) => {
  // เก็บ style เดิม
  originalWatermarkStyles[index] = {
    color: watermark.style.color,
    opacity: watermark.style.opacity
  }
  
  // เพิ่ม opacity สำหรับ PDF
  if (watermark.hasAttribute('data-type')) {
    const type = watermark.getAttribute('data-type')
    if (type === 'original') {
      watermark.style.color = 'rgba(37, 99, 235, 0.35)' // เพิ่มจาก 0.12 เป็น 0.35
    } else if (type === 'copy') {
      watermark.style.color = 'rgba(239, 68, 68, 0.35)' // เพิ่มจาก 0.12 เป็น 0.35
    }
  } else {
    watermark.style.color = 'rgba(0, 0, 0, 0.25)' // เพิ่มจาก 0.08 เป็น 0.25
  }
  watermark.style.opacity = '1'
})

// ... html2canvas capture ...

// คืน style เดิม
watermarks.forEach((watermark, index) => {
  if (originalWatermarkStyles[index]) {
    watermark.style.color = originalWatermarkStyles[index].color
    watermark.style.opacity = originalWatermarkStyles[index].opacity
  }
})
```

### 2. ใช้วิธีเดียวกันใน downloadWithCombinedPages()

```javascript
// เพิ่ม opacity สำหรับทุก watermarks ในหน้าเอกสาร
const allWatermarks = documentSequence.querySelectorAll('.document-watermark')
const originalWatermarkStyles = []

// ... เพิ่ม opacity ...
// ... สร้าง PDF ...
// ... คืน style เดิม ...
```

## ผลลัพธ์ที่ได้

### ✅ ลายน้ำแสดงใน PDF
- **"ต้นฉบับ"**: สีน้ำเงิน opacity 35%
- **"สำเนา"**: สีแดง opacity 35%
- **ลายน้ำทั่วไป**: สีดำ opacity 25%

### ✅ ไม่กระทบการแสดงผลหน้าจอ
- เปลี่ยน opacity ชั่วคราวเฉพาะตอนสร้าง PDF
- คืน style เดิมหลังสร้าง PDF เสร็จ
- การแสดงผลใน browser ยังคงเดิม

### ✅ รองรับทุกวิธี PDF Generation
- `downloadWithJsPDF()`: แปลงแต่ละหน้าเป็นรูปภาพ
- `downloadWithCombinedPages()`: ใช้ html2pdf.js

## การใช้งาน

ลายน้ำจะแสดงใน PDF โดยอัตโนมัติเมื่อ:

1. **มี Page Structure Array** ที่กำหนด `watermarkText`
2. **เรียกฟังก์ชัน** `downloadDocument()` หรือ `printDocument()`
3. **ระบบจะ**:
   - เพิ่ม opacity ชั่วคราว
   - สร้าง PDF พร้อมลายน้ำ
   - คืน opacity เดิม

## คำแนะนำเพิ่มเติม

### หากต้องการปรับ Opacity เพิ่ม
```javascript
// ปรับค่าใน code
watermark.style.color = 'rgba(37, 99, 235, 0.45)' // เพิ่มเป็น 45%
```

### หากต้องการ PNG แทน JPEG
```javascript
// เปลี่ยนใน html2canvas options
const imgData = canvas.toDataURL('image/png') // PNG ไม่มีการบีบอัด
```

### หากต้องการ Text-based PDF
- ต้องใช้ server-side generation
- หรือใช้ PDF libraries ที่สร้าง text โดยตรง
- แต่จะเสีย styling และ watermark visuals

## สรุป

การแก้ไขนี้ทำให้:
- ✅ ลายน้ำแสดงชัดเจนใน PDF
- ✅ ไม่กระทบการแสดงผลหน้าจอ  
- ✅ รองรับทุกประเภทเอกสาร
- ✅ ใช้งานได้โดยอัตโนมัติ