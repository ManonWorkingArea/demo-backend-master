# สรุปการใช้งาน Page Structure Array ในระบบ

## 📊 การใช้งานปัจจุบันของ Page Structure Array

### 1. **ใน DocumentPreview.vue (หลัก)**

#### 🔸 **การแสดง Thumbnail Sidebar**
```vue
<!-- แสดงรายการ thumbnails จาก page structure -->
<div v-for="pageInfo in (pageStructure || [])" 
     :key="pageInfo.id"
     @click="selectPage(pageInfo.logicalPageNumber)">
  
  <!-- ใช้ข้อมูลจาก pageInfo -->
  <div class="thumbnail-label">{{ pageInfo.displayName }}</div>
  
  <!-- ส่ง page options ที่มี pageInfo ไปให้ document component -->
  <component :options="getPageOptions(pageInfo.pageNumber, pageInfo.copyType)" />
</div>
```

#### 🔸 **การแสดงเอกสารหลายหน้า**
```vue
<!-- แสดงเอกสารตาม page structure -->
<div v-for="(pageInfo, index) in (pageStructure || [])" 
     :class="[...pageInfo.cssClasses]">
  
  <!-- Page divider พร้อมชื่อหน้า -->
  <div class="divider-label">{{ pageInfo.displayName }}</div>
  
  <!-- Document component พร้อม watermark -->
  <component :options="getPageOptions(pageInfo.pageNumber, pageInfo.copyType)">
    <div class="document-watermark" 
         :style="{ color: pageInfo.watermarkColor }">
      {{ pageInfo.watermarkText }}
    </div>
  </component>
</div>
```

#### 🔸 **แสดงข้อมูลสถานะหน้า**
```vue
<!-- แสดงข้อมูลหน้าปัจจุบัน -->
<span v-if="currentPageInfo">{{ currentPageInfo.displayName }}</span>

<!-- นับจำนวนหน้าแต่ละประเภท -->
<span>{{ getOriginalPageCount() }} หน้าต้นฉบับ</span>
<span v-if="getCopyPageCount() > 0">{{ getCopyPageCount() }} หน้าสำเนา</span>
```

### 2. **การส่งข้อมูลให้ Document Components**

#### 🔸 **ผ่าน `getPageOptions()` function**
```javascript
const getPageOptions = (pageNumber, copyType = 'original') => {
  const pageInfo = pageStructure.value.find(page => 
    page.pageNumber === pageNumber && page.type === copyType
  )
  
  return {
    ...props.documentOptions,
    currentPage: pageNumber,
    copyType: copyType,
    pageInfo: pageInfo,           // ← ข้อมูลหน้าจาก structure
    pageStructure: pageStructure.value  // ← ข้อมูลทั้ง structure
  }
}
```

#### 🔸 **ผ่าน `mergedDocumentOptions` computed**
```javascript
const mergedDocumentOptions = computed(() => {
  return {
    ...props.documentOptions,
    pageStructure: pageStructure.value,    // ← ส่ง structure ทั้งหมด
    currentPageInfo: currentPageInfo.value // ← ข้อมูลหน้าปัจจุบัน
  }
})
```

### 3. **ใช้งานใน Components อื่น**

#### 🔸 **Purchase Request Detail**
```javascript
// ใช้ DocumentPreview จาก ERP_CORE
const DocumentPreview = core.components.DocumentPreview

// Mount DocumentPreview component
return h(DocumentPreview, {
  documentType: 'purchase_request',
  documentData: documentData,
  // ↓ Page structure จะถูกสร้างใน DocumentPreview
  // และส่งต่อไปยัง PurchaseRequestDocument
})
```

#### 🔸 **PurchaseRequestDocument.vue**
```javascript
// รับข้อมูลจาก DocumentPreview ผ่าน props.options
const currentPage = computed(() => props.options?.currentPage || 1)
const itemsPerPage = computed(() => props.options?.itemsPerPage || 12)

// ยังไม่ได้ใช้ pageStructure โดยตรง แต่รับข้อมูลผ่าน options
// สามารถเพิ่มการใช้งาน pageStructure ได้:
// const pageStructure = computed(() => props.options?.pageStructure || [])
// const currentPageInfo = computed(() => props.options?.currentPageInfo)
```

## 🎯 **ระบบที่ใช้งาน Page Structure Array**

### 1. **ERP Core System**
- `DocumentPreview.vue` - ใช้เป็นหลัก
- `PurchaseRequestDocument.vue` - รับข้อมูลผ่าน options
- Document components อื่นๆ - รับข้อมูลผ่าน options

### 2. **Purchase Module**
- `Purchase/Request/Detail.vue` - เรียกใช้ DocumentPreview
- การแสดงเอกสารใบขอซื้อ

### 3. **Inventory Module** 
- `Inventory/Products/Detail.vue` - มี DocumentPreview integration
- การแสดงเอกสารสินค้า

### 4. **Test Components**
- `TestPurchaseRequest2Pages.vue` - ใช้ทดสอบ DocumentPreview

## 📋 **ข้อมูลที่ส่งผ่าน Page Structure**

### 1. **ข้อมูลพื้นฐานหน้า**
```javascript
{
  id: "original-1",
  pageNumber: 1,
  logicalPageNumber: 1,
  type: "original",          // original | copy
  displayName: "ต้นฉบับ หน้า 1",
  copyType: "original"       // ส่งไปให้ document components
}
```

### 2. **ข้อมูล Watermark**
```javascript
{
  watermarkText: "ต้นฉบับ",
  watermarkColor: "rgba(37, 99, 235, 0.12)",
  // ใช้ในการแสดง watermark บนเอกสาร
}
```

### 3. **ข้อมูล CSS และ Styling**
```javascript
{
  cssClasses: ["page-original"],
  // ใช้ในการกำหนด CSS classes ของ container
}
```

### 4. **Metadata เพิ่มเติม**
```javascript
{
  metadata: {
    section: "original",
    basePage: 1,
    totalBasePages: 2
  }
  // ใช้ในการจัดการและคำนวณข้อมูลเพิ่มเติม
}
```

## 🔄 **Flow การทำงาน**

```
1. DocumentPreview.vue
   ↓ buildPageStructure()
   
2. สร้าง pageStructure array
   ↓ getPageOptions(pageNumber, copyType)
   
3. ส่งข้อมูลให้ Document Component
   ↓ PurchaseRequestDocument.vue
   
4. รับ props.options ที่มี pageInfo และ pageStructure
   ↓ ใช้ในการแสดงผลและจัดการหน้า
   
5. แสดงเอกสารตาม currentPage และ copyType
```

## 🚀 **การใช้งานในอนาคต**

### 1. **การขยายไปยัง Document Types อื่น**
- Invoice Document
- Delivery Note Document
- Purchase Order Document

### 2. **การเพิ่มฟีเจอร์ใหม่**
- Page bookmarks
- Page annotations
- Custom page layouts
- Dynamic page generation

### 3. **API Integration**
- ส่ง pageStructure ไปยัง backend
- บันทึกสถานะหน้าในฐานข้อมูล
- การแชร์ page structure ระหว่าง users

### 4. **Performance Optimization**
- Lazy loading ของแต่ละหน้า
- Virtual scrolling สำหรับ thumbnails
- Caching page structure

## 📈 **สถิติการใช้งานปัจจุบัน**

- **Components ที่ใช้งาน**: 4 components
- **Document Types ที่รองรับ**: Purchase Request (หลัก)
- **Features ที่ใช้ Page Structure**:
  - ✅ Thumbnail navigation
  - ✅ Multi-page display
  - ✅ Copy/Original mode
  - ✅ Watermark system
  - ✅ Page info display
  - 🔄 Print/Download (ใช้บางส่วน)
  - ⏳ API export (ยังไม่ได้ใช้)

## 🔧 **การปรับปรุงที่แนะนำ**

### 1. **เพิ่มการใช้งานใน Document Components**
```javascript
// ใน PurchaseRequestDocument.vue
const pageStructure = computed(() => props.options?.pageStructure || [])
const currentPageInfo = computed(() => props.options?.currentPageInfo)

// ใช้ในการแสดงข้อมูลเพิ่มเติม
const isOriginalPage = computed(() => currentPageInfo.value?.type === 'original')
const pageWatermark = computed(() => currentPageInfo.value?.watermarkText)
```

### 2. **เพิ่ม Type Safety**
```typescript
interface PageInfo {
  id: string
  pageNumber: number
  logicalPageNumber: number
  type: 'original' | 'copy'
  displayName: string
  watermarkText: string
  watermarkColor: string
  cssClasses: string[]
  metadata: PageMetadata
}
```

### 3. **เพิ่ม Event System**
```javascript
// ส่ง events เมื่อ page structure เปลี่ยน
emit('page-structure-changed', pageStructure.value)
emit('current-page-changed', currentPageInfo.value)
```