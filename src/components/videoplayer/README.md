# Secure Video Streaming Classes

แยก secure token และ video chunk tracking ออกมาเป็น class ใหม่เพื่อให้จัดการและใช้งานได้ง่ายขึ้น

## 📁 Structure

```
src/components/videoplayer/
├── utils/
│   ├── SecureStreamManager.js     # จัดการ secure token และ Service Worker
│   └── VideoChunkTracker.js       # ติดตาม video chunk loading
├── examples/
│   └── VideoStreamingExample.js   # ตัวอย่างการใช้งาน
└── composables/
    └── useUniversalPlayer.js      # Vue composable (ใช้ class ใหม่)
```

## 🔐 SecureStreamManager

จัดการ secure token generation, Service Worker registration, และ network interception

### Features:
- ✅ SHA-256 token generation with shared salt
- ✅ Service Worker registration และ message handling  
- ✅ Token verification และ expiration checking
- ✅ Event system สำหรับ communication
- ✅ Session management

### การใช้งาน:

```javascript
import SecureStreamManager from './utils/SecureStreamManager.js';

const secureManager = new SecureStreamManager();

// Register Service Worker
await secureManager.registerStreamInterceptor();

// Generate secure token
const secureData = await secureManager.generateSecureStreamKey({
  event: 'video-playing',
  currentTime: 10.5,
  duration: 120.0
});

// Update Service Worker with token
await secureManager.updateSWSecureToken(secureData);

// Listen for events
secureManager.on('secureChunkIntercepted', (data) => {
  console.log('Secure chunk intercepted:', data);
});
```

## 🎯 VideoChunkTracker  

ติดตาม video buffer, chunk loading, และ predict การโหลด chunk ถัดไป

### Features:
- ✅ Real-time buffer monitoring
- ✅ Chunk loading detection
- ✅ Loading prediction algorithm
- ✅ Integration กับ SecureStreamManager
- ✅ Event-driven architecture

### การใช้งาน:

```javascript
import VideoChunkTracker from './utils/VideoChunkTracker.js';
import SecureStreamManager from './utils/SecureStreamManager.js';

const secureManager = new SecureStreamManager();
const chunkTracker = new VideoChunkTracker(secureManager);

// Initialize tracking
chunkTracker.initializeTracking(videoElement, emitFunction);

// Listen for events
chunkTracker.on('progressChunkLoaded', (data) => {
  console.log('New chunk loaded:', data.newDataLoaded + 's');
});

chunkTracker.on('chunkPrediction', (data) => {
  console.log('Next chunk needed in:', data.remaining + 's');
});
```

## 🎬 VideoStreamingExample

ตัวอย่างการใช้งานรวม class ทั้งสอง สำหรับใช้ในโปรเจคอื่นๆ

### การใช้งาน:

```javascript
import VideoStreamingExample from './examples/VideoStreamingExample.js';

const streaming = new VideoStreamingExample();

// Initialize secure streaming
const result = await streaming.initializeSecureStreaming(videoElement);

if (result.success) {
  console.log('Secure streaming ready!');
  console.log('Session ID:', result.sessionId);
}

// Get statistics
const stats = streaming.getStreamingStats();
console.log('Streaming stats:', stats);

// Refresh token
await streaming.refreshSecureToken({ action: 'user-seek' });
```

## 🔧 Service Worker Integration

Service Worker (`/public/stream-interceptor-sw.js`) ได้รับการอัปเดตให้รองรับ secure token:

### Features:
- ✅ Intercept video chunk requests
- ✅ Add secure token to URL parameters
- ✅ Add security headers (X-Stream-Token, X-Session-Id)
- ✅ Fallback สำหรับ simple stream key
- ✅ Message communication กับ main thread

## 🎛️ Vue Composable Updates

`useUniversalPlayer.js` ได้รับการ refactor:

### Changes:
- ✅ ใช้ SecureStreamManager แทนฟังก์ชัน token เดิม
- ✅ ใช้ VideoChunkTracker สำหรับ chunk monitoring  
- ✅ Simplified code structure
- ✅ Better error handling
- ✅ Maintained backward compatibility

## 📋 API Reference

### SecureStreamManager

```javascript
// Constructor
const manager = new SecureStreamManager();

// Methods
await manager.registerStreamInterceptor()     // Register SW
await manager.unregisterStreamInterceptor()   // Unregister SW
await manager.generateSecureStreamKey(data)   // Generate token
await manager.updateSWSecureToken(data)       // Update SW token
await manager.verifyStreamToken(token)        // Verify token
manager.resetSession()                        // Reset session
manager.getStatus()                           // Get status

// Events
manager.on('serviceWorkerReady', callback)
manager.on('secureChunkIntercepted', callback)
manager.on('serviceWorkerUpdate', callback)
```

### VideoChunkTracker

```javascript
// Constructor  
const tracker = new VideoChunkTracker(secureManager);

// Methods
tracker.initializeTracking(videoElement, emit) // Start tracking
tracker.startBufferMonitoring()               // Start monitoring
tracker.stopBufferMonitoring()                // Stop monitoring
tracker.getTrackingStats()                    // Get statistics
tracker.clearTrackingData()                   // Clear data
tracker.destroy()                             // Cleanup

// Events
tracker.on('progressChunkLoaded', callback)
tracker.on('chunkPrediction', callback)
tracker.on('videoPlaying', callback)
tracker.on('videoSeeking', callback)
```

## 🚀 Migration Guide

### From Old useUniversalPlayer

```javascript
// เดิม
const { generateSecureStreamKey, updateSWSecureToken } = useUniversalPlayer(emit);

// ใหม่  
const { secureManager, chunkTracker } = useUniversalPlayer(emit);
await secureManager.generateSecureStreamKey(data);
await secureManager.updateSWSecureToken(data);
```

### Direct Class Usage

```javascript
// สำหรับใช้นอก Vue
import SecureStreamManager from './utils/SecureStreamManager.js';
import VideoChunkTracker from './utils/VideoChunkTracker.js';
import VideoStreamingExample from './examples/VideoStreamingExample.js';

// เลือกใช้แบบไหน
const manager = new SecureStreamManager();           // แค่ token + SW
const tracker = new VideoChunkTracker(manager);     // แค่ tracking  
const example = new VideoStreamingExample();        // ครบเซต
```

## 🔍 Debug & Testing

### Debug Mode

```javascript
// Enable debug logging
localStorage.setItem('debug', 'streaming');

// Check Service Worker status
console.log('SW Status:', secureManager.getStatus());

// Check tracking stats  
console.log('Tracking:', chunkTracker.getTrackingStats());
```

### Token Verification

```javascript
// Verify token
const result = await secureManager.verifyStreamToken(token);
console.log('Token valid:', result.valid);
console.log('Token age:', result.age + 'ms');
```

## 🎯 Benefits

### Code Organization
- ✅ แยก concerns ออกจากกันชัดเจน
- ✅ Reusable classes สำหรับโปรเจคอื่น
- ✅ Easy testing และ debugging
- ✅ Better maintainability

### Performance  
- ✅ Efficient event handling
- ✅ Memory management
- ✅ Optimized Service Worker communication
- ✅ Smart chunk prediction

### Security
- ✅ **One-time tokens** with 15-second expiry
- ✅ **Replay attack prevention** - tokens can only be used once
- ✅ Secure token with SHA-256 + shared salt
- ✅ Session management with unique IDs
- ✅ Automatic token cleanup
- ✅ Client fingerprinting (origin, user agent, screen resolution)
- ✅ Tamper detection and integrity verification
