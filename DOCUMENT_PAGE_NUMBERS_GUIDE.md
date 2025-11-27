# Document Page Numbers - Preview & Print Implementation

## เพิ่มเลขหน้าใน Document Preview และ Print

### 🎯 ฟีเจอร์ใหม่

#### ✅ **Document Preview Page Numbers**
- แสดงเลขหน้าที่มุมขวาล่างของแต่ละหน้าเอกสาร
- แยกนับหน้าต้นฉบับและสำเนา
- มีพื้นหลังโปร่งใสและเฟรมเล็กน้อย

#### ✅ **Print Page Numbers**  
- แสดงเลขหน้าในเอกสารที่พิมพ์
- รูปแบบเดียวกับ preview แต่ปรับให้เหมาะกับการพิมพ์
- ซ่อน preview page numbers เมื่อพิมพ์

## 🎨 UI Design

### **Document Preview Page Numbers**
```html
<div class="document-page-number">
  <span v-if="pageInfo.type === 'original'">
    {{ getOriginalPageIndex(pageInfo.logicalPageNumber) }}/{{ getOriginalPageCount() }} ต้นฉบับ
  </span>
  <span v-else-if="pageInfo.type === 'copy'">
    {{ getCopyPageIndex(pageInfo.logicalPageNumber) }}/{{ getCopyPageCount() }} สำเนา
  </span>
  <span v-else>
    {{ pageInfo.logicalPageNumber }}/{{ totalPages }}
  </span>
</div>
```

### **CSS Styling**
```css
.document-page-number {
  position: absolute;
  bottom: 10px;
  right: 15px;
  font-size: 10px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
  user-select: none;
  pointer-events: none;
  z-index: 15;
  white-space: nowrap;
}
```

## 📊 Page Counting Logic

### **Page Index Functions**
```javascript
const getOriginalPageIndex = (logicalPageNumber) => {
  const originalPages = pageStructure.value.filter(page => page.type === 'original')
  const pageIndex = originalPages.findIndex(page => page.logicalPageNumber === logicalPageNumber)
  return pageIndex + 1
}

const getCopyPageIndex = (logicalPageNumber) => {
  const copyPages = pageStructure.value.filter(page => page.type === 'copy')
  const pageIndex = copyPages.findIndex(page => page.logicalPageNumber === logicalPageNumber)
  return pageIndex + 1
}
```

### **การนับหน้าแยกประเภท**
| Document Type | Page Structure | Display Format |
|---------------|----------------|----------------|
| Original Pages | [1, 2] original | "1/2 ต้นฉบับ", "2/2 ต้นฉบับ" |
| Copy Pages | [3, 4] copy | "1/2 สำเนา", "2/2 สำเนา" |
| Mixed Types | [1] original, [2,3] copy | "1/1 ต้นฉบับ", "1/2 สำเนา", "2/2 สำเนา" |

## 🖨️ Print Implementation

### **Print Page Numbers CSS**
```css
.print-page-number {
  position: absolute !important;
  bottom: 8px !important;
  right: 12px !important;
  font-size: 10px !important;
  font-weight: 500 !important;
  color: rgba(0, 0, 0, 0.7) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  padding: 3px 6px !important;
  border-radius: 3px !important;
  border: 1px solid rgba(0, 0, 0, 0.15) !important;
  font-family: 'Arial', sans-serif !important;
  z-index: 15 !important;
  white-space: nowrap !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
```

### **Print HTML Generation**
```javascript
${pages.map((pageData, index) => {
  // Calculate page numbers for display
  let pageNumberText = ''
  if (pageData.pageInfo.type === 'original') {
    const originalPageNum = pageData.pageInfo.pageNumber
    pageNumberText = `${originalPageNum}/${printMetadata.originalPages} ต้นฉบับ`
  } else if (pageData.pageInfo.type === 'copy') {
    const copyPageNum = pageData.pageInfo.pageNumber - printMetadata.originalPages
    pageNumberText = `${copyPageNum}/${printMetadata.copyPages} สำเนา`
  } else {
    pageNumberText = `${index + 1}/${printMetadata.totalPages}`
  }
  
  return `<div class="page-break page-${pageData.pageInfo.type}" style="position: relative;">
    ${pageData.content}
    <div class="print-page-number">${pageNumberText}</div>
  </div>`
}).join('')}
```

## 📱 Media Queries

### **Print-specific Styles**
```css
@media print {
  .print-page-number {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    display: block !important;
    visibility: visible !important;
  }
  
  /* Hide preview page numbers in print */
  .document-page-number {
    display: none !important;
  }
}
```

### **Display Control**
- **Preview**: แสดง `.document-page-number`
- **Print**: แสดง `.print-page-number`, ซ่อน `.document-page-number`
- **PDF**: ใช้ debug text ที่ด้านล่างกลางหน้า

## 🎯 Display Examples

### **Document with 2 Original + 2 Copy Pages**

#### **Preview Display:**
```
Page 1: "1/2 ต้นฉบับ"    (ขวาล่าง)
Page 2: "2/2 ต้นฉบับ"    (ขวาล่าง)
Page 3: "1/2 สำเนา"     (ขวาล่าง)
Page 4: "2/2 สำเนา"     (ขวาล่าง)
```

#### **Print Display:**
```
Print Page 1: "1/2 ต้นฉบับ"    (ขวาล่าง)
Print Page 2: "2/2 ต้นฉบับ"    (ขวาล่าง)
Print Page 3: "1/2 สำเนา"     (ขวาล่าง)
Print Page 4: "2/2 สำเนา"     (ขวาล่าง)
```

#### **PDF Debug (Development):**
```
PDF Page 1: "1/2 original"    (ล่างกลาง)
PDF Page 2: "2/2 original"    (ล่างกลาง)
PDF Page 3: "1/2 copy"        (ล่างกลาง)
PDF Page 4: "2/2 copy"        (ล่างกลาง)
```

## 🔧 Technical Details

### **Position & Styling**
- **Position**: `absolute` ที่มุมขวาล่าง
- **Z-index**: `15` (เหนือ watermark ที่ `10`)
- **Typography**: Arial 10px, font-weight 500
- **Background**: ขาวโปร่งใส 90% พร้อมเฟรมบาง
- **Interactions**: `user-select: none`, `pointer-events: none`

### **Responsive Behavior**
- **Desktop**: แสดงชัดเจนที่ขวาล่าง
- **Mobile**: ยังคงแสดงในตำแหน่งเดิม
- **Print**: ปรับขนาดและสีให้เหมาะกับการพิมพ์

### **Performance Considerations**
- ใช้ `findIndex()` แทน `indexOf()` เพื่อความแม่นยำ
- Cache การคำนวณใน computed functions
- ไม่มีผลกระทบต่อ rendering performance

## 📋 Integration Points

### **Component Integration**
```javascript
// ใน template
<div class="document-page-number">
  {{ getOriginalPageIndex(pageInfo.logicalPageNumber) }}/{{ getOriginalPageCount() }} ต้นฉบับ
</div>

// ใน setup()
return {
  getOriginalPageIndex,
  getCopyPageIndex,
  getOriginalPageCount,
  getCopyPageCount
}
```

### **Print Integration**
```javascript
// ใน printMultiplePages()
const pageNumberText = `${originalPageNum}/${printMetadata.originalPages} ต้นฉบับ`
// เพิ่มลงใน HTML content
<div class="print-page-number">${pageNumberText}</div>
```

## สรุป

การเพิ่มเลขหน้านี้ให้:
- ✅ **เลขหน้าใน Preview** - ดูได้ชัดเจนว่าอยู่หน้าไหน
- ✅ **เลขหน้าใน Print** - พิมพ์แล้วมีเลขหน้า
- ✅ **แยกนับประเภท** - ต้นฉบับ/สำเนา นับแยกกัน
- ✅ **Responsive Design** - ทำงานได้ทุกหน้าจอ
- ✅ **Print-friendly** - เหมาะกับการพิมพ์

ผู้ใช้จะรู้ได้ชัดเจนว่าอยู่หน้าไหนของเอกสารแล้ว! 🎯📄