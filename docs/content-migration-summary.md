# Content.vue Migration Summary - Request to ApiRequest

## การเปลี่ยนแปลงหลัก

### 1. เพิ่ม ApiRequest Injection
```javascript
export default {
  inject: ['apiRequest'],
  // ... ส่วนอื่นๆ
}
```

### 2. สร้าง Helper Method
```javascript
// Helper method สำหรับ API calls
async makeApiCall(endpoint, method = 'GET', data = null, collection = 'post') {
  if (!this.apiRequest) {
    console.warn('ApiRequest not available');
    throw new Error('ApiRequest service not available');
  }

  try {
    // เพิ่ม /api prefix โดยอัตโนมัติถ้ายังไม่มี
    const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api/${endpoint}`;
    
    console.log(`API Call: ${method} ${apiEndpoint}`);
    
    const response = await this.apiRequest.apiCall(apiEndpoint, {
      method: method,
      body: data,
      collection: collection
    });

    return response;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
},
```

## การเปลี่ยนแปลงแต่ละฟังก์ชัน

### 1. deleteData()
**Before:**
```javascript
const { data } = await this.$Request.DELETE(`post/${id}`, null, this.configs.key);
```

**After:**
```javascript
const response = await this.makeApiCall(`post/${id}`, 'DELETE');
```

### 2. getData() - POST aggregate
**Before:**
```javascript
const { data } = await this.$Request.POST(`post/aggregate`, requestBody, this.configs.key);
```

**After:**
```javascript
const response = await this.makeApiCall('post/aggregate', 'POST', requestBody);
```

### 3. countFormPost()
**Before:**
```javascript
const { data } = await this.$Request.POST(`${formDestination}/count`, requestBody, this.configs.key);
const count = data.count;
```

**After:**
```javascript
const response = await this.makeApiCall(`${formDestination}/count`, 'POST', requestBody);
const count = response.count;
```

### 4. changeLayout() - PUT hostname
**Before:**
```javascript
const { data, status } = await this.$Request.PUT(`hostname/${this.session.current._id}`, requestBody, this.hostkey);
if (status === 200) {
  // success logic
}
```

**After:**
```javascript
const response = await this.makeApiCall(`hostname/${this.session.current._id}`, 'PUT', requestBody, 'hostname');
if (response) {
  // success logic
}
```

### 5. addPost()
**Before:**
```javascript
const { data, status } = await this.$Request.POST('post/', requestBody, this.configs.key);
if (status === 200) {
  console.log(data.data);
}
```

**After:**
```javascript
const response = await this.makeApiCall('post/', 'POST', requestBody);
if (response) {
  console.log(response);
}
```

### 6. bulkDeleteItems()
**Before:**
```javascript
for (const itemId of itemIds) {
  await this.$Request.DELETE(`post/${itemId}`, null, this.configs.key);
}
```

**After:**
```javascript
for (const itemId of itemIds) {
  await this.makeApiCall(`post/${itemId}`, 'DELETE');
}
```

### 7. toggleFavorite()
**Before:**
```javascript
const response = await this.$Request.PUT(`post/${post._id}`, {
  data: {
    isFavorite: post.isFavorite
  }
}, this.configs.key);

if (response.status === 200) {
  // success
}
```

**After:**
```javascript
const response = await this.makeApiCall(`post/${post._id}`, 'PUT', {
  data: {
    isFavorite: post.isFavorite
  }
});

if (response) {
  // success
}
```

### 8. getParentPageInfo()
**Before:**
```javascript
const { data } = await this.$Request.GET(`post/${this.localDataItem.id}`, this.configs.key);
if (data && data.data) {
  this.parentPageInfo = data.data;
}
```

**After:**
```javascript
const response = await this.makeApiCall(`post/${this.localDataItem.id}`, 'GET');
if (response && response.data) {
  this.parentPageInfo = response.data;
}
```

## ข้อดีของการ Migration

### 1. ความสะดวกในการใช้งาน
- ไม่ต้องส่ง `this.configs.key` หรือ `this.hostkey` ทุกครั้ง
- ApiRequest จัดการ authentication โดยอัตโนมัติ

### 2. การจัดการ URL อัตโนมัติ
- เพิ่ม `/api/` prefix โดยอัตโนมัติ
- รองรับ collection ที่แตกต่างกัน (post, hostname)

### 3. Error Handling ที่ดีขึ้น
- Centralized error handling ใน helper method
- Consistent logging

### 4. ลดการ Duplicate Code
- การเรียก API ทั้งหมดใช้ helper method เดียวกัน
- ง่ายต่อการ maintain และแก้ไข

## สิ่งที่ต้องตรวจสอบ

1. ให้แน่ใจว่า ApiRequest plugin ถูก inject ใน main.js
2. ตรวจสอบการทำงานของแต่ละฟังก์ชัน
3. ทดสอบ error handling
4. ตรวจสอบการส่ง data ที่ซับซ้อน (เช่น aggregate pipeline)

## ผลลัพธ์

✅ Migration สำเร็จ - ไม่มี `$Request` ที่เหลืออยู่ในไฟล์  
✅ ทุกฟังก์ชันได้รับการแปลงแล้ว  
✅ มี helper method ที่สะดวกใช้งาน  
✅ รองรับ collection ที่หลากหลาย  
✅ มีการจัดการ URL prefix อัตโนมัติ
