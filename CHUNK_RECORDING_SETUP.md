# Chunk-Based Screen Recording System

ระบบบันทึกหน้าจอแบบ chunk-based ที่แก้ปัญหา browser memory overload โดยใช้ FFmpeg server

## 🚀 วิธีการทำงาน

### 1. **Browser Memory Management**
```
Traditional (ปัญหา):
เวลา 0s: Memory = 0MB
เวลา 10s: Memory = 50MB (เก็บ blobs)
เวลา 20s: Memory = 100MB (เก็บ blobs)  
เวลา 30s: Memory = 150MB (เก็บ blobs)
...
เวลา 10นาที: Memory = 3GB+ → Browser CRASH!

Chunk-Based (แก้ไข):
เวลา 0s: Memory = 0MB
เวลา 10s: Memory = 50MB → Upload → Memory = 0MB
เวลา 20s: Memory = 50MB → Upload → Memory = 0MB  
เวลา 30s: Memory = 50MB → Upload → Memory = 0MB
...
เวลา 10นาที: Memory = 50MB (คงที่) → ไม่ crash!
```

### 2. **Architecture**

```
Frontend (Browser)              Backend (Server)
┌─────────────────┐            ┌──────────────────┐
│ ScreenRecorder  │            │ Express Server   │
│    Component    │            │                  │
│                 │   Chunks   │ ┌──────────────┐ │
│ VideoChunk      │────────────→│ │ Multer       │ │
│   Manager       │  (10s each)│ │ File Upload  │ │
│                 │            │ └──────────────┘ │
│ • Session ID    │            │                  │
│ • Chunk Upload  │            │ ┌──────────────┐ │
│ • Progress      │            │ │ FFmpeg       │ │
│ • Error Retry   │            │ │ Concatenate  │ │
└─────────────────┘            │ └──────────────┘ │
                               │                  │
                               │ Final MP4 Output │
                               └──────────────────┘
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
# Media server dependencies
npm install express multer fluent-ffmpeg uuid

# Make sure FFmpeg is installed on your system
# macOS: brew install ffmpeg  
# Ubuntu: sudo apt install ffmpeg
# Windows: Download from https://ffmpeg.org/
```

### 2. Setup Media Server
```javascript
// In your main server file (app.js or server.js)
const express = require('express');
const mediaServer = require('./api/media-server');

const app = express();

// Add media server routes
app.use('/api/media', mediaServer);

app.listen(3000);
```

### 3. Configure Frontend
```vue
<!-- In your parent component -->
<template>
  <ScreenRecorder 
    v-if="showRecorder"
    @close="showRecorder = false"
    @recorded="handleRecorded"
  />
</template>
```

## 📁 File Structure

```
project/
├── src/
│   ├── components/
│   │   └── ScreenRecorder.vue      # Main component
│   └── utils/
│       └── VideoChunkManager.js    # Chunk management class
├── api/
│   └── media-server.js            # Express server endpoints
└── temp/
    ├── recording-chunks/          # Temporary chunk storage
    │   └── [sessionId]/          # Per-session directories
    └── final-videos/             # Final concatenated videos
```

## 🔧 API Endpoints

### Initialize Session
```http
POST /api/media/recording/init
Content-Type: application/json

{
  "sessionId": "rec_1672531200000_abc123",
  "timestamp": 1672531200000,
  "userAgent": "Mozilla/5.0..."
}
```

### Upload Chunk
```http
POST /api/media/recording/chunk
Content-Type: multipart/form-data

chunk: [WebM video blob]
sessionId: "rec_1672531200000_abc123"
chunkIndex: 0
metadata: {"chunkSize": 1024000, "timestamp": 1672531210000}
```

### Finalize & Concatenate
```http
POST /api/media/recording/finalize
Content-Type: application/json

{
  "sessionId": "rec_1672531200000_abc123",
  "totalChunks": 12,
  "totalSize": 50331648
}
```

### Download Video
```http
GET /api/media/recording/download/[sessionId]
Response: MP4 video file
```

## 💾 Session Management

### Browser Storage (localStorage)
```javascript
{
  "sessionId": "rec_1672531200000_abc123",
  "createdAt": 1672531200000,
  "status": "recording", // initialized, recording, stopped, completed
  "uploadedChunks": 5,
  "failedChunks": 0,
  "totalSizeMB": 25.6
}
```

### Server Storage (in-memory)
```javascript
{
  "sessionId": "rec_1672531200000_abc123",
  "status": "receiving_chunks",
  "chunks": [
    {
      "index": 0,
      "filename": "chunk_rec_1672531200000_abc123_0.webm",
      "path": "/temp/recording-chunks/rec_1672531200000_abc123/chunk_0.webm",
      "size": 5242880,
      "uploadedAt": 1672531210000
    }
  ],
  "finalVideo": {
    "filename": "recording_rec_1672531200000_abc123_2023-01-01T00-00-00.mp4",
    "path": "/temp/final-videos/recording_rec_1672531200000_abc123_2023-01-01T00-00-00.mp4",
    "size": 52428800,
    "sizeMB": 50.0,
    "duration": "5:23"
  }
}
```

## ⚡ Performance Benefits

| Aspect | Traditional | Chunk-Based |
|--------|-------------|-------------|
| Browser Memory | ↗️ Unlimited growth | 📊 Fixed ~50MB |
| Recording Length | ❌ 5-10 min limit | ✅ No limit |
| Browser Crash | ⚠️ High risk | ✅ Safe |
| Upload Reliability | ❌ Single point failure | ✅ Chunk retry |
| Final Quality | 📱 WebM only | 🎬 MP4 + better |

## 🔧 Customization

### Chunk Duration
```javascript
const chunkManager = new VideoChunkManager({
  chunkDurationMs: 5000 // 5 seconds (smaller = more stable)
});
```

### Retry Configuration  
```javascript
const chunkManager = new VideoChunkManager({
  maxRetries: 5,
  retryDelayMs: 2000
});
```

### FFmpeg Options
```javascript
// In media-server.js
ffmpeg()
  .inputOptions('-f', 'concat')
  .inputOptions('-safe', '0')
  .outputOptions('-c:v', 'libx264')  // Re-encode for better compression
  .outputOptions('-crf', '23')       // Quality setting
  .outputOptions('-preset', 'fast')  // Encoding speed
```

## 🐛 Troubleshooting

### Common Issues

1. **FFmpeg not found**
   ```bash
   # Install FFmpeg
   brew install ffmpeg  # macOS
   sudo apt install ffmpeg  # Linux
   ```

2. **Large chunk sizes**
   - ลด `chunkDurationMs` จาก 10000 เป็น 5000ms
   - ลด recording quality จาก 1080p เป็น 720p

3. **Upload failures**
   - เช็ค network connection
   - ดู server logs สำหรับ disk space
   - เพิ่ม `maxRetries` ใน VideoChunkManager

4. **Session recovery**
   ```javascript
   // Check for interrupted sessions
   const existing = VideoChunkManager.getStoredSession();
   if (existing && existing.status === 'recording') {
     // Prompt user to continue or start fresh
   }
   ```

## 🚀 Next Steps

1. **Production Deployment**
   - ใช้ Redis/Database แทน in-memory storage
   - Setup S3/Cloud Storage สำหรับ chunks
   - Add authentication & rate limiting

2. **Performance Optimization**  
   - Parallel chunk uploads
   - Background FFmpeg processing
   - Automatic cleanup policies

3. **User Experience**
   - Real-time upload progress
   - Pause/resume recording
   - Multiple quality presets