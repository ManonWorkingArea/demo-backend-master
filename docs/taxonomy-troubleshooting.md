# Taxonomy System Troubleshooting Guide

## ปัญหาที่พบบ่อยและวิธีแก้ไข

### 1. TaxonomySelector แสดง "กำลังโหลด Taxonomy..." ตลอด

#### สาเหตุที่เป็นไปได้:
- ข้อมูล taxonomy ไม่มีใน database
- API call ไม่สำเร็จ
- Taxonomy groups ไม่มี contentTypes ที่ตรงกับ 'course'
- Network issues

#### วิธีการ Debug:

1. **เปิด Console Browser** และดู logs:
```javascript
// ควรเห็น logs เหล่านี้
TaxonomySelector setup - Content Type: course
TaxonomySelector setup - Loading: true/false
TaxonomySelector - Taxonomy Groups for course: [...]
```

2. **ตรวจสอบ Network Tab**:
   - ดูว่ามี API call ไปที่ `/api/taxonomy/query` หรือไม่
   - ตรวจสอบ response status (ควรเป็น 200)
   - ดู response data ว่ามีข้อมูลหรือไม่

3. **ตรวจสอบ Database**:
```javascript
// ใน MongoDB/Database ควรมีข้อมูลแบบนี้
{
  "_id": "taxonomy_group_id",
  "type": "group",
  "name": "หมวดหมู่คอร์ส",
  "contentTypes": ["course"], // ← สำคัญมาก!
  "active": true,
  "unit": "your_unit_id"
}
```

#### วิธีแก้ไข:

**Option 1: สร้างข้อมูล Taxonomy ใหม่**
1. เข้าสู่ TaxonomyManager (`/taxonomy` หรือ path ที่กำหนด)
2. เพิ่ม Taxonomy Group ใหม่
3. เลือก Content Type = "คอร์สเรียน" (course)
4. สร้าง Terms ในกลุ่มนั้น

**Option 2: แก้ไขข้อมูลที่มีอยู่**
```javascript
// ใน Database, update taxonomy groups เพื่อเพิ่ม contentTypes
db.taxonomy.updateMany(
  { type: "group" },
  { $set: { "contentTypes": ["course"] } }
)
```

**Option 3: Force Refresh**
```javascript
// ใน Console Browser
const taxonomySelector = document.querySelector('[data-component="TaxonomySelector"]');
if (taxonomySelector && taxonomySelector.__vue__) {
  await taxonomySelector.__vue__.refreshTaxonomy();
}
```

### 2. ข้อผิดพลาด "Cannot read property of undefined"

#### สาเหตุ:
- Props ไม่ถูกส่งผ่านอย่างถูกต้อง
- Composable ไม่ return ค่าที่คาดหวัง

#### วิธีแก้ไข:
```vue
<!-- ตรวจสอบ props ใน CourseForm -->
<TaxonomySelector 
  content-type="course"
  content-type-label="คอร์สเรียน"
  v-model="selectedTaxonomyTerms"
/>
```

### 3. การบันทึกไม่สำเร็จ

#### ตรวจสอบ:
```javascript
// ใน CourseForm, method updataData
console.log('Selected taxonomy terms:', this.selectedTaxonomyTerms);
// ควรเป็น array ของ string IDs เช่น ["term_id_1", "term_id_2"]
```

### 4. Performance Issues

#### ปัญหา: โหลดช้า
```javascript
// ใช้ useTaxonomyLite แทน useTaxonomy สำหรับข้อมูลเบื้องต้น
import { useTaxonomyLite } from '@/composables/useTaxonomy';

const { getBasicTerms } = useTaxonomyLite();
```

#### ปัญหา: Memory leaks
```javascript
// ใน component, เพิ่ม cleanup
onUnmounted(() => {
  // Clear any intervals or watchers
});
```

## การทดสอบ System

### 1. Test Taxonomy Creation
```javascript
// ใน Console Browser
const testTaxonomy = {
  type: "group",
  name: "Test Course Categories",
  contentTypes: ["course"],
  active: true,
  fieldConfig: [
    {
      key: "name",
      label: "ชื่อ",
      type: "text",
      required: true
    }
  ]
};

// ส่งไปยัง API
fetch('/api/taxonomy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: testTaxonomy })
});
```

### 2. Test Term Creation
```javascript
const testTerm = {
  type: "term",
  taxonomy: "taxonomy_group_id", // ID ของ group ที่สร้างไว้
  parentId: null,
  sortOrder: 0,
  active: true,
  customData: {
    name: "วิทยาศาสตร์และเทคโนโลยี"
  }
};
```

## Best Practices

### 1. Error Handling
```vue
<template>
  <div>
    <!-- แสดง error message ที่เข้าใจง่าย -->
    <div v-if="error" class="alert alert-error">
      เกิดข้อผิดพลาด: {{ error }}
      <button @click="retry">ลองใหม่</button>
    </div>
  </div>
</template>
```

### 2. Loading States
```vue
<template>
  <!-- ใช้ skeleton loading แทน spinner เมื่อเหมาะสม -->
  <div v-if="loading" class="space-y-3">
    <div class="animate-pulse bg-gray-200 h-4 rounded"></div>
    <div class="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
  </div>
</template>
```

### 3. Data Validation
```javascript
// ตรวจสอบข้อมูลก่อนบันทึก
const validateTaxonomyData = (terms) => {
  if (!Array.isArray(terms)) {
    throw new Error('Taxonomy terms must be an array');
  }
  
  terms.forEach(termId => {
    if (typeof termId !== 'string') {
      throw new Error('Term ID must be a string');
    }
  });
  
  return true;
};
```

## Recovery Methods

### 1. Reset Taxonomy Data
```javascript
// Clear cache และโหลดใหม่
const { resetCache } = useTaxonomy();
await resetCache();
```

### 2. Manual Data Repair
```javascript
// ถ้าข้อมูลเสียหาย สามารถ repair ได้
const repairTaxonomyData = async () => {
  // 1. Backup current data
  // 2. Validate and fix relationships
  // 3. Restore consistent state
};
```

### 3. Fallback UI
```vue
<template>
  <!-- ถ้า taxonomy system ไม่ทำงาน ให้ fallback เป็น select ธรรมดา -->
  <div v-if="taxonomySystemDown">
    <select v-model="fallbackCategory">
      <option value="science">วิทยาศาสตร์</option>
      <option value="tech">เทคโนโลยี</option>
      <option value="business">ธุรกิจ</option>
    </select>
  </div>
</template>
```

## Contact และ Support

หากปัญหายังไม่แก้ไข:
1. ตรวจสอบ logs ใน browser console
2. ตรวจสอบ network requests
3. ตรวจสอบข้อมูลใน database
4. ส่ง error message และ reproduction steps

**Debug Checklist:**
- [ ] Console logs ไม่มี errors
- [ ] API responses เป็น 200 OK
- [ ] Database มีข้อมูล taxonomy groups
- [ ] contentTypes ครอบคลุม 'course'
- [ ] Terms มี taxonomy group ID ที่ถูกต้อง
- [ ] Component props ถูกส่งผ่านครบถ้วน 