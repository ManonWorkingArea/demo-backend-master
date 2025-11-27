# ApiRequest Migration Guide - ContentForm.vue

## การเปลี่ยนแปลงที่ทำไป

### 1. เพิ่ม Injection ของ ApiRequest
```javascript
// Before
inject: ["apiServer"],

// After  
inject: ["apiServer", "apiRequest"],
```

### 2. เพิ่ม Helper Method สำหรับ API Calls
```javascript
// Helper method for API calls with consistent response handling
async makeApiCall(endpoint, method = 'GET', body = null) {
  if (!this.apiRequest) {
    throw new Error('ApiRequest service not available');
  }

  // Add /api prefix if endpoint doesn't start with http and doesn't already have /api
  let fullEndpoint = endpoint;
  if (!endpoint.startsWith('http') && !endpoint.startsWith('/api')) {
    fullEndpoint = `/api/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
  }

  try {
    const response = await this.apiRequest.apiCall(fullEndpoint, method, null, body);
    console.log('API Response:', { originalEndpoint: endpoint, fullEndpoint, method, response });
    
    // Handle different response formats from apiRequest
    return response?.data || response;
  } catch (error) {
    console.error('API Call Error:', { originalEndpoint: endpoint, fullEndpoint, method, error });
    throw error;
  }
}
```

**สิ่งที่ Helper Method ทำ:**
- ตรวจสอบ ApiRequest availability
- เพิ่ม `/api` prefix อัตโนมัติให้กับ endpoint
- จัดการ response format ที่แตกต่างกัน
- เพิ่ม detailed logging สำหรับ debugging
- จัดการ error handling อย่างสม่ำเสมอ

### 3. แทนที่การใช้งาน $Request ทั้งหมดด้วย ApiRequest

#### 3.1 GET Requests
```javascript
// Before
const { data } = await this.$Request.GET(`post/${this.dataItem}`, this.configs.key);

// After
const data = await this.makeApiCall(`post/${this.dataItem}`, "GET");
// จะเรียก: /api/post/{id} อัตโนมัติ
```

#### 3.2 POST Requests
```javascript
// Before
const { data } = await this.$Request.POST("post/query", requestBody, this.configs.key);

// After
const data = await this.makeApiCall("post/query", "POST", requestBody);
// จะเรียก: /api/post/query อัตโนมัติ
```

#### 3.3 PUT Requests  
```javascript
// Before
const response = await this.$Request[method](url, requestBody, this.configs.key);

// After
const response = await this.makeApiCall(url, method, requestBody);
// จะเรียก: /api/{url} อัตโนมัติ
```

#### 3.4 Data Wrapper Removal
```javascript
// Before (with data wrapper)
const requestBody = {
  data: saveData,
  options: {
    uniqueFields: [],
  },
};
const response = await this.$Request.POST('post', requestBody, this.configs.key);

// After (direct data)
const response = await this.makeApiCall('post', 'POST', saveData);
// ส่งข้อมูลตรงๆ ไม่ต้องใช้ wrapper
```

#### 3.4 Endpoint ที่มี /api อยู่แล้ว
```javascript
// หาก endpoint มี /api อยู่แล้ว จะไม่เพิ่ม prefix ซ้ำ
const data = await this.makeApiCall("/api/post/123", "GET");
// จะเรียก: /api/post/123 (ไม่เปลี่ยนแปลง)
```

### 4. ฟังก์ชันที่ได้รับการปรับปรุง

#### 4.1 checkSlugExists()
- แทนที่ $Request.POST ด้วย makeApiCall
- ปรับปรุงการจัดการ response format

#### 4.2 getPost()
- แทนที่ $Request.GET ด้วย makeApiCall
- เพิ่มการตรวจสอบ response format

#### 4.3 updatePost()
- แทนที่ $Request[method] ด้วย makeApiCall
- ปรับปรุงการตรวจสอบ success condition
- **ลบ data wrapper** - ส่งข้อมูลตรงๆ แทนที่จะใช้ `{data: ..., options: ...}`

#### 4.4 getParentData()
- แทนที่ $Request.GET ด้วย makeApiCall

#### 4.5 duplicateContent()
- แทนที่ $Request.POST ด้วย makeApiCall
- **ลบ data wrapper** - ส่งข้อมูลตรงๆ แทนที่จะใช้ `{data: ..., options: ...}`

#### 4.6 loadAnalyticsData()
- แทนที่ $Request.GET ด้วย makeApiCall

#### 4.7 checkApiConnection()
- แทนที่ $Request.GET ด้วย makeApiCall

### 5. การตรวจสอบ ApiRequest Availability

เพิ่มการตรวจสอบใน mounted lifecycle:
```javascript
// ตรวจสอบ ApiRequest injection
if (!this.apiRequest) {
  console.warn('ApiRequest not injected, check main.js configuration');
  this.$swal({
    title: "ข้อผิดพลาด",
    text: "ระบบ API ไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง",
    type: "error",
    confirmButtonText: "ตกลง",
  });
  return;
}
```

## ข้อดีของการใช้ ApiRequest

### 1. **Centralized Error Handling**
- จัดการ error อย่างสม่ำเสมอ
- Logging และ debugging ที่ดีกว่า

### 2. **Response Format Consistency**
- Helper method จัดการ response format ที่แตกต่างกัน
- ไม่ต้องกังวลเรื่อง `response.data` vs `response`

### 3. **Better Performance**
- Connection pooling
- Request deduplication
- Retry mechanism
- Performance monitoring

### 4. **Enhanced Security**
- Token management
- Tenant isolation
- Request validation

### 5. **Improved Debugging**
- Detailed logging
- Request tracking
- Performance metrics

## การใช้งาน ApiRequest Methods

### Basic API Call
```javascript
const data = await this.makeApiCall('/api/endpoint', 'GET');
```

### POST with Body
```javascript
const result = await this.makeApiCall('/api/endpoint', 'POST', requestBody);
```

### PUT with Body
```javascript
const response = await this.makeApiCall('/api/endpoint', 'PUT', updateData);
```

### DELETE Request
```javascript
const result = await this.makeApiCall('/api/endpoint', 'DELETE');
```

## การตรวจสอบและ Debug

### 1. ตรวจสอบ ApiRequest Injection
```javascript
if (!this.apiRequest) {
  console.error('ApiRequest not available');
}
```

### 2. ดู Logs
```javascript
console.log('API Response:', { endpoint, method, response });
```

### 3. ตรวจสอบ Error Handling
```javascript
try {
  const data = await this.makeApiCall(endpoint, method, body);
} catch (error) {
  console.error('API Error:', error);
}
```

## Migration Checklist

- [x] เพิ่ม apiRequest ใน inject array
- [x] สร้าง makeApiCall helper method
- [x] แทนที่ $Request.GET ทั้งหมด
- [x] แทนที่ $Request.POST ทั้งหมด  
- [x] แทนที่ $Request.PUT ทั้งหมด
- [x] แทนที่ $Request.DELETE ทั้งหมด
- [x] ปรับปรุงการจัดการ response format
- [x] เพิ่มการตรวจสอบ apiRequest availability
- [x] ทดสอบฟังก์ชันทั้งหมด
- [x] ตรวจสอบ error handling

## สิ่งที่ควรระวัง

1. **Response Format**: ApiRequest อาจจะ return response ในรูปแบบที่ต่างจาก $Request
2. **Error Handling**: จำเป็นต้องจัดการ error ใน try-catch block
3. **Authentication**: ApiRequest จัดการ token automatically
4. **Configuration**: ไม่ต้องส่ง configs.key เหมือน $Request

## การทดสอบ

1. ทดสอบการโหลดข้อมูล (GET)
2. ทดสอบการบันทึกข้อมูล (POST/PUT)
3. ทดสอบการลบข้อมูล (DELETE)
4. ทดสอบ error scenarios
5. ตรวจสอบ performance และ logging
