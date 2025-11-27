# Recasens API Proxy Setup Guide

## วิธีแก้ปัญหา CORS Error

เนื่องจาก Recasens API ไม่อนุญาตให้เรียกจาก browser โดยตรง (CORS policy) เราจึงต้องสร้าง **proxy endpoint** ในฝั่ง backend

## ไฟล์ที่เกี่ยวข้อง

```
src/api/proxy/
├── index.js          # Main proxy router
└── recasens.js       # Recasens API proxy
```

## วิธีติดตั้ง

### 1. ติดตั้ง dependencies (ถ้ายังไม่มี)

```bash
npm install node-fetch
```

### 2. เพิ่ม proxy routes ใน Express server

แก้ไขไฟล์ server หลัก (เช่น `server.js` หรือ `app.js`):

```javascript
const express = require('express');
const app = express();

// Import proxy routes
const proxyRoutes = require('./src/api/proxy');

// Mount proxy routes
app.use('/api/proxy', proxyRoutes);

// ... rest of server config
```

### 3. ตรวจสอบว่า Express middleware พร้อมใช้งาน

ตรวจสอบว่ามี middleware เหล่านี้:

```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

## การใช้งาน

### Frontend (Form.vue)

```javascript
// เรียกผ่าน backend proxy
const response = await window.$Request.post('/api/proxy/recasens/search-product-image', {
  ref: 'RS-102'
})

if (response.success && response.data.found) {
  const imageUrl = response.data.imageUrl
  // Use imageUrl...
}
```

### API Endpoint

**POST** `/api/proxy/recasens/search-product-image`

**Request Body:**
```json
{
  "ref": "RS-102"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "ref": "RS-102",
    "imageUrl": "https://recasens.com/wp-content/uploads/2017/02/r_102_0.jpg",
    "source": "Recasens API",
    "found": true
  }
}
```

**Response (Not Found):**
```json
{
  "success": true,
  "data": {
    "ref": "RS-999",
    "imageUrl": null,
    "source": null,
    "found": false
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "HTTP error! status: 500"
}
```

## ทำไมต้องใช้ Proxy?

### ปัญหา: CORS Error
```
Access to fetch at 'https://recasens.com/...' from origin 'http://localhost:8080' 
has been blocked by CORS policy
```

### วิธีแก้: Backend Proxy
1. Browser เรียก → Backend (Same Origin) ✅
2. Backend เรียก → Recasens API (Server-to-Server) ✅
3. Backend ส่งข้อมูลกลับ → Browser ✅

## Flow Diagram

```
┌─────────┐         ┌─────────────┐         ┌──────────────┐
│ Browser │  AJAX   │   Backend   │  HTTP   │   Recasens   │
│ (Form)  │ ─────>  │   Proxy     │ ─────>  │     API      │
└─────────┘         └─────────────┘         └──────────────┘
     │                     │                        │
     │                     │   <─────HTML Response──┤
     │                     │                        │
     │   <────JSON─────    │                        │
     │                     │                        │
```

## Troubleshooting

### 1. CORS ยังมีปัญหา
- ตรวจสอบว่า proxy route ถูก mount ใน Express app แล้ว
- ตรวจสอบว่า URL ที่เรียกคือ `/api/proxy/recasens/...` (ไม่ใช่เรียก Recasens โดยตรง)

### 2. node-fetch not found
```bash
npm install node-fetch@2
```
Note: ใช้ v2 สำหรับ CommonJS (require)

### 3. ไม่พบรูปภาพ
- ตรวจสอบ console.log ใน backend
- ตรวจสอบว่า `ref` ที่ส่งไปถูกต้อง (เช่น "RS-102")
- ลองเรียก API โดยตรงจาก Postman เพื่อดู response

## Security Considerations

- ❌ ไม่ควรเปิด proxy ให้เรียก domain ใดก็ได้ (Open Proxy)
- ✅ จำกัดให้เรียกเฉพาะ Recasens API เท่านั้น
- ✅ Validate input parameters
- ✅ จำกัด rate limit ถ้าจำเป็น

## ตัวอย่างการทดสอบด้วย curl

```bash
curl -X POST http://localhost:3000/api/proxy/recasens/search-product-image \
  -H "Content-Type: application/json" \
  -d '{"ref":"RS-102"}'
```

## สรุป

✅ แก้ปัญหา CORS โดยใช้ Backend Proxy
✅ ใช้ server-to-server communication
✅ ส่ง structured JSON response กลับมาที่ frontend
✅ มี error handling ที่ดี
