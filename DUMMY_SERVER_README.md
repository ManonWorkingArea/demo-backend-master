# VideoChunkManager - Dummy Server Mode

## Overview
VideoChunkManager ขณะนี้ถูกกำหนดให้ทำงานในโหมด **Dummy Server** ซึ่งจะจำลองการทำงานของ media server โดยไม่ต้องมี backend จริง

## Features ในโหมด Dummy Server

### ✅ การทำงานที่ใช้ได้
- **Chunk Recording**: บันทึกวิดีโอเป็น chunks (10 วินาทีต่อ chunk)
- **Memory Management**: จัดการหน่วยความจำอย่างมีประสิทธิภาพ (~50MB ไม่ว่าจะบันทึกนานแค่ไหน)
- **Session Management**: จัดการ session การบันทึกผ่าน localStorage
- **Progress Tracking**: แสดงความคืบหน้าการอัพโหลด chunk
- **Error Handling**: จัดการ error และ retry logic
- **Dummy Upload Simulation**: จำลองการอัพโหลด chunk ด้วย network delay

### 🔧 การตั้งค่าปัจจุบัน

```javascript
// ใน ScreenRecorder.vue
const chunkManager = new VideoChunkManager({
  mediaServerUrl: '/api/media',
  chunkDurationMs: 10000, // 10 วินาที
  useDummyServer: true,   // ✅ เปิดใช้งาน dummy mode
  maxRetries: 3,
  retryDelayMs: 1000
});
```

### 📋 Log Messages ที่จะเห็นใน Console

```
🎬 VideoChunkManager initialized: { useDummyServer: true }
📡 Creating dummy recording session: rec_1234567890_abc123
📤 Uploading chunk 0 (245KB)...
📡 Uploading to dummy server: { sessionId, chunkIndex, chunkSize }
✅ Dummy chunk 0 uploaded successfully: /dummy/chunks/rec_1234567890_abc123/chunk_0.webm
📊 Progress: 1 chunks, 0.24MB, 0 failed
🏁 Finalizing recording session...
📡 Finalizing with dummy server: { totalChunks: 5, totalSizeMB: 1.2 }
✅ Dummy session finalized: { finalVideoUrl: "/dummy/final/rec_1234567890_abc123_final.mp4" }
```

### 💾 การ Download

เมื่อบันทึกเสร็จแล้ว ระบบจะสร้างไฟล์ dummy (PNG image) แทนวิดีโอจริง:
- สร้าง canvas พร้อมข้อมูล session
- แสดงจำนวน chunks และ file size
- ดาวน์โหลดเป็นไฟล์ `dummy_recording_[sessionId].png`

## 🔄 การเปลี่ยนไปใช้ Real Server

เมื่อพร้อมใช้งาน media server จริง:

1. **ปิด Dummy Mode**:
```javascript
const chunkManager = new VideoChunkManager({
  mediaServerUrl: '/api/media',
  chunkDurationMs: 10000,
  useDummyServer: false, // ⚠️ เปลี่ยนเป็น false
  // ... other options
});
```

2. **ติดตั้ง Media Server Dependencies**:
```bash
npm install express multer fluent-ffmpeg uuid
```

3. **เพิ่ม Media Server Routes** ตาม `CHUNK_RECORDING_SETUP.md`

## 📊 Dummy Response Format

### Session Creation Response
```json
{
  "success": true,
  "message": "Dummy server response",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "sessionId": "rec_1234567890_abc123",
  "status": "initialized"
}
```

### Chunk Upload Response
```json
{
  "success": true,
  "message": "Dummy server response",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "chunkIndex": 0,
  "sessionId": "rec_1234567890_abc123",
  "uploadedSize": 245760,
  "status": "uploaded",
  "totalChunks": 1
}
```

### Session Finalization Response
```json
{
  "success": true,
  "message": "Dummy server response",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "sessionId": "rec_1234567890_abc123",
  "status": "completed",
  "finalVideoUrl": "/dummy/final/rec_1234567890_abc123_final.mp4",
  "totalChunks": 5,
  "totalSizeMB": 1.2,
  "processingStatus": "ready_for_download",
  "message": "Session completed successfully (dummy mode)"
}
```

## 🧪 Testing

1. เปิด ScreenRecorder component
2. เลือกหน้าจอที่ต้องการบันทึก
3. กดปุ่ม "เริ่ม" เพื่อเริ่มบันทึก
4. ดู console logs เพื่อติดตาม dummy upload process
5. กดปุ่ม "หยุด" เพื่อจบการบันทึก
6. ระบบจะแสดง post-recording modal
7. กดปุ่ม "ดาวน์โหลด" เพื่อทดสอบ dummy download

## ⚡ Performance Benefits

- **Memory Usage**: คงที่ ~50MB ไม่ว่าจะบันทึกนานแค่ไหน
- **No Server Dependency**: ทำงานได้โดยไม่ต้องมี backend
- **Development Friendly**: สามารถ develop UI และ UX ได้เต็มที่
- **Realistic Simulation**: จำลอง network delay และ error scenarios

## 🔧 Configuration Options

```javascript
const chunkManager = new VideoChunkManager({
  useDummyServer: true,     // เปิด/ปิด dummy mode
  chunkDurationMs: 10000,   // ระยะเวลาต่อ chunk (ms)
  maxRetries: 3,            // จำนวนครั้งที่ retry เมื่อ upload fail
  retryDelayMs: 1000,       // หน่วงเวลาก่อน retry (ms)
  mediaServerUrl: '/api/media' // URL สำหรับ real server
});
```

เมื่อพร้อมจะใช้งาน real server ก็แค่เปลี่ยน `useDummyServer: false` และ implement media server endpoints ตาม architecture ที่ออกแบบไว้แล้วครับ!