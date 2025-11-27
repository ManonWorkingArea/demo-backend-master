# 🎥 Screen Recording Init Update

## 📋 สรุปการอัปเดต Screen Recording System

### ✅ การเปลี่ยนแปลงหลัก

#### 1. **สร้างไฟล์วีดีโอล่วงหน้าในฐานข้อมูล**
- เพิ่มฟังก์ชัน `createPreVideoFile()` ใน VideoSegmentManager
- สร้างไฟล์ในฐานข้อมูล `storage` collection ก่อนเริ่มบันทึก
- ได้ `storage ID` สำหรับใช้ในขั้นตอนต่อไป

#### 2. **ส่งข้อมูล site, space, storage ไปยัง Media Server**
```javascript
// ข้อมูลที่ส่งไปในทุก API call
{
  site: hostnameData,      // hostname จาก configs
  space: spaceData,        // spaceId จาก session
  storage: storageId,      // ID ของไฟล์ในฐานข้อมูล
  filename: videoFilename  // ชื่อไฟล์วีดีโอ
}
```

#### 3. **API Endpoints ที่ได้รับการอัปเดต**
- `/recording/init` - เริ่ม session พร้อมข้อมูลไฟล์
- `/recording/chunk` - อัพโหลด chunks พร้อมข้อมูลไฟล์  
- `/recording/finalize` - จบการบันทึกพร้อมข้อมูลไฟล์

### 🔧 การทำงานของระบบใหม่

#### ขั้นตอน 1: Initialize Session
```javascript
const sessionInfo = await segmentManager.initializeNewSession({
  quality: '1080p',
  frameRate: 30,
  includeAudio: true,
  videoBitsPerSecond: 8000000,
  audioBitsPerSecond: 128000
});

// ได้ผลลัพธ์
{
  sessionId: "session_1696118400000_abc123",
  storageId: "670b8f3d2e1a4c5d6e7f8901",
  filename: "screen_recording_2025-09-30T12-00-00.mp4",
  site: "fti.academy",
  space: "user_space_id"
}
```

#### ขั้นตอน 2: การสร้างไฟล์ในฐานข้อมูล
```javascript
const filePayload = {
  data: {
    owner: session.current._id,
    name: "screen_recording_2025-09-30T12-00-00.mp4",
    original: "recording/screen_recording_2025-09-30T12-00-00.mp4",
    path: "recording/screen_recording_2025-09-30T12-00-00.mp4",
    parent: "",
    size: estimatedSize,
    type: "media",
    mimetype: "video/mp4",
    spaceId: spaceData,
    
    // ข้อมูลเฉพาะการบันทึกหน้าจอ
    recordingType: "screen",
    sessionId: sessionId,
    recordingStatus: "initializing",
    recordingSettings: { ... }
  }
}
```

#### ขั้นตอน 3: การส่งข้อมูลไปยัง Media Server
```javascript
// Session Init
POST /recording/init
{
  sessionId: "session_xxx",
  site: "fti.academy",
  space: "space_id", 
  storage: "storage_id",
  filename: "video.mp4",
  recordingSettings: { ... }
}

// Chunk Upload  
POST /recording/chunk
FormData:
- chunk: [MP4 blob]
- sessionId: "session_xxx"
- site: "fti.academy"
- space: "space_id"
- storage: "storage_id"
- filename: "video.mp4"

// Finalize
POST /recording/finalize
{
  sessionId: "session_xxx",
  site: "fti.academy", 
  space: "space_id",
  storage: "storage_id",
  filename: "video.mp4",
  totalChunks: 25,
  totalSize: 52428800,
  outputFormat: "mp4"
}
```

#### ขั้นตอน 4: อัปเดตไฟล์หลังจากเสร็จสิ้น
```javascript
// อัปเดตไฟล์ในฐานข้อมูลด้วยข้อมูลจริง
PUT /storage/{storageId}
{
  data: {
    path: "https://cdn.example.com/final_video.mp4",
    original: "https://cdn.example.com/final_video.mp4", 
    url: "https://cdn.example.com/final_video.mp4",
    size: 52428800,
    duration: 300,
    recordingStatus: "completed",
    completedAt: "2025-09-30T12:05:00.000Z",
    totalChunks: 25,
    sessionMetadata: { ... }
  }
}
```

### 🎯 ประโยชน์ของการอัปเดต

1. **ติดตาม Recording Session ได้** - มี storage ID สำหรับอ้างอิง
2. **รองรับ Multi-tenant** - ส่ง site และ space ไปด้วย  
3. **จัดการไฟล์ได้ครบวงจร** - สร้าง → บันทึก → อัปเดต
4. **Integration กับ FileManager** - ไฟล์ปรากฏในระบบทันที
5. **เหมือน Convert/Trim Pattern** - ใช้โครงสร้างเดียวกัน

### 🔄 Flow การทำงานที่สมบูรณ์

```
1. กดปุ่ม "เริ่มบันทึก"
   ↓
2. createPreVideoFile() - สร้างไฟล์ในฐานข้อมูล  
   ↓
3. initializeNewSession() - ได้ storage ID
   ↓ 
4. POST /recording/init พร้อม site, space, storage
   ↓
5. เริ่มบันทึกและแบ่ง chunks (5 วินาที/chunk)
   ↓
6. POST /recording/chunk พร้อม site, space, storage (ทุก chunk)
   ↓
7. หยุดบันทึก → POST /recording/finalize พร้อมข้อมูลเดิม
   ↓  
8. updateVideoFileInDatabase() - อัปเดตไฟล์จริง
   ↓
9. รีเฟรช FileManager → ไฟล์ปรากฏในรายการ
```

### 📁 ไฟล์ที่แก้ไข

1. **VideoSegmentManager.js**
   - เพิ่ม `createPreVideoFile()`
   - เพิ่ม `calculateEstimatedFileSize()`
   - เพิ่ม `updateVideoFileInDatabase()`
   - อัปเดต `initializeNewSession()`
   - อัปเดต `createSession()`, `uploadSegmentToServer()`, `finalizeSession()`

2. **ScreenRecorder.vue**
   - อัปเดต `initializeNewSession()` ให้ส่ง recording settings
   - แสดงข้อมูล storage ID ใน toast message
   - เพิ่ม `getPreVideoFileInfo()` helper

### 🎉 สำเร็จแล้ว!

ตอนนี้ระบบ Screen Recording จะทำงานแบบ end-to-end โดย:
- สร้างไฟล์ในฐานข้อมูลก่อนเริ่มบันทึก ✅
- ส่งข้อมูล site, space, storage ไปยัง Media Server ✅  
- อัปเดตไฟล์ด้วยข้อมูลจริงหลังเสร็จสิ้น ✅
- ผสานกับ FileManager อย่างสมบูรณ์ ✅

พร้อมใช้งานแล้ว! 🚀