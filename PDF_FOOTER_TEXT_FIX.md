# PDF Footer Text - Format & Center Fix

## ปัญหาที่แก้ไข

### ❌ **ปัญหาเดิม**
- PDF แสดง text "1 / 2 original" ที่มีช่องว่างไม่สวย
- Text อยู่ชิดซ้าย (position x=5) ไม่ได้อยู่ตรงกลาง
- รูปแบบไม่เป็นมาตรฐาน

### ✅ **หลังแก้ไข**
- แสดง text "1/2 original" (ไม่มีช่องว่าง)
- Text อยู่ตรงกลางหน้า PDF
- รูปแบบชัดเจนและเป็นมาตรฐาน

## 🔧 การแก้ไข Code

### **Before (Original Code)**
```javascript
if (process.env.NODE_ENV === 'development') {
  pdf.setFontSize(8)
  pdf.setTextColor(200, 200, 200)
  pdf.text(`${pageInfo.displayName} - ${pageInfo.type}`, 5, 292)
}
```

### **After (Fixed Code)**
```javascript
if (process.env.NODE_ENV === 'development') {
  pdf.setFontSize(8)
  pdf.setTextColor(200, 200, 200)
  
  // Create formatted page text (e.g., "1/2 original")
  const originalPages = getOriginalPageCount()
  const copyPages = getCopyPageCount()
  
  let pageText = ''
  if (pageInfo.type === 'original') {
    const originalPageNum = pageInfo.pageNumber || (i + 1)
    pageText = `${originalPageNum}/${originalPages} original`
  } else if (pageInfo.type === 'copy') {
    const copyPageNum = pageInfo.pageNumber || (i + 1 - originalPages)
    pageText = `${copyPageNum}/${copyPages} copy`
  } else {
    pageText = `${i + 1}/${structure.length} ${pageInfo.type || 'page'}`
  }
  
  // Center the text
  const textWidth = pdf.getTextWidth(pageText)
  const pageWidth = 210 // A4 width in mm
  const xPosition = (pageWidth - textWidth) / 2
  
  pdf.text(pageText, xPosition, 292)
}
```

## 📐 Centering Calculation

### **Text Centering Formula**
```javascript
const textWidth = pdf.getTextWidth(pageText)  // ความกว้างของข้อความ
const pageWidth = 210                         // ความกว้าง A4 (210mm)
const xPosition = (pageWidth - textWidth) / 2 // จัดกึ่งกลาง
```

### **Positioning Details**
- **Y Position**: `292` (ใกล้ด้านล่างของหน้า A4 297mm)
- **X Position**: คำนวณให้อยู่กลางหน้า
- **Font Size**: `8pt` (เล็กพอสมควร ไม่รบกวน content)
- **Color**: `rgb(200, 200, 200)` (สีเทาอ่อน)

## 🎯 Page Text Format

### **Original Pages**
```
1/2 original  (หน้าที่ 1 จาก 2 หน้าต้นฉบับ)
2/2 original  (หน้าที่ 2 จาก 2 หน้าต้นฉบับ)
```

### **Copy Pages**
```
1/2 copy      (หน้าที่ 1 จาก 2 หน้าสำเนา)
2/2 copy      (หน้าที่ 2 จาก 2 หน้าสำเนา)
```

### **Logic การนับหน้า**
```javascript
if (pageInfo.type === 'original') {
  // นับหน้าต้นฉบับ: 1/2, 2/2
  const originalPageNum = pageInfo.pageNumber || (i + 1)
  pageText = `${originalPageNum}/${originalPages} original`
  
} else if (pageInfo.type === 'copy') {
  // นับหน้าสำเนา: 1/2, 2/2 (เริ่มนับใหม่)
  const copyPageNum = pageInfo.pageNumber || (i + 1 - originalPages)
  pageText = `${copyPageNum}/${copyPages} copy`
}
```

## 🎨 Visual Improvements

### **Typography**
- **Font Size**: 8pt (เหมาะสมไม่รบกวน)
- **Color**: Light gray (200, 200, 200)
- **Position**: ด้านล่างกลางหน้า

### **Format Standards**
- **No spaces**: "1/2" แทน "1 / 2"
- **Lowercase**: "original", "copy" (consistent)
- **Centered**: อยู่กลางหน้า A4

### **Development Mode Only**
```javascript
if (process.env.NODE_ENV === 'development') {
  // แสดงเฉพาะใน development mode
  // Production จะไม่มี footer text
}
```

## 📱 Use Cases

### **เอกสาร 1 หน้า Original**
```
PDF Footer: "1/1 original"
```

### **เอกสาร 2 หน้า Original + 2 หน้า Copy**
```
Page 1: "1/2 original"
Page 2: "2/2 original"  
Page 3: "1/2 copy"
Page 4: "2/2 copy"
```

### **เอกสาร Mixed Types**
```
Page 1: "1/1 original"
Page 2: "1/3 copy"
Page 3: "2/3 copy"
Page 4: "3/3 copy"
```

## 🔍 Debug Information

### **Footer Text ช่วย Debug**
- **ประเภทหน้า**: original/copy
- **ลำดับหน้า**: ในแต่ละประเภท
- **จำนวนรวม**: ของแต่ละประเภท

### **ตัวอย่างการใช้งาน**
เมื่อมี PDF generation error สามารถดูที่ footer text ได้ว่า:
- หน้าไหนเป็น original/copy
- ลำดับหน้าถูกต้องหรือไม่
- จำนวนหน้ารวมตรงกับที่คาดหวังหรือไม่

## สรุป

การแก้ไขนี้ทำให้:
- ✅ **Format สวยงาม**: "1/2 original" (ไม่มีช่องว่าง)
- ✅ **จัดกึ่งกลาง**: อยู่ตรงกลางหน้า PDF
- ✅ **นับหน้าถูกต้อง**: แยกนับ original/copy
- ✅ **Debug ได้ง่าย**: เห็นประเภทและลำดับหน้าชัดเจน

Footer text จะดูเป็นระเบียบและใช้งานได้ดีขึ้นมาก! 🎯