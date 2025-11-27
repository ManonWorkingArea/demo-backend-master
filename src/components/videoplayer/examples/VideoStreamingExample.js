/**
 * ตัวอย่างการใช้งาน SecureStreamManager และ VideoChunkTracker
 * 
 * สำหรับใช้ในโปรเจคอื่นๆ ที่ต้องการ secure video streaming
 */

import SecureStreamManager from './videoplayer/utils/SecureStreamManager.js';
import VideoChunkTracker from './videoplayer/utils/VideoChunkTracker.js';

// ตัวอย่างการใช้งานแยกจาก Vue component
export class VideoStreamingExample {
  constructor() {
    // สร้าง instance ของ managers
    this.secureManager = new SecureStreamManager();
    this.chunkTracker = new VideoChunkTracker(this.secureManager);
    
    // Setup event listeners
    this.setupEventListeners();
  }

  // Initialize secure streaming สำหรับ video element
  async initializeSecureStreaming(videoElement) {
    console.log('🚀 [EXAMPLE] Initializing secure streaming...');
    
    try {
      // 1. Register Service Worker
      const swSuccess = await this.secureManager.registerStreamInterceptor();
      if (!swSuccess) {
        throw new Error('Failed to register Service Worker');
      }
      
      // 2. Initialize chunk tracking
      const trackingSuccess = this.chunkTracker.initializeTracking(videoElement);
      if (!trackingSuccess) {
        throw new Error('Failed to initialize chunk tracking');
      }
      
      // 3. Generate initial secure token
      const secureData = await this.secureManager.generateSecureStreamKey({
        action: 'initialize',
        videoSrc: videoElement.src,
        timestamp: Date.now()
      });
      
      // 4. Update Service Worker with secure token
      await this.secureManager.updateSWSecureToken(secureData);
      
      console.log('✅ [EXAMPLE] Secure streaming initialized successfully');
      console.log('🔐 [EXAMPLE] Initial secure token:', {
        streamKey: secureData.streamKey,
        sessionId: secureData.sessionId
      });
      
      return {
        success: true,
        secureData,
        sessionId: this.secureManager.sessionId
      };
      
    } catch (error) {
      console.error('❌ [EXAMPLE] Failed to initialize secure streaming:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Service Worker events
    this.secureManager.on('serviceWorkerReady', (data) => {
      console.log('🟢 [EXAMPLE] Service Worker ready:', data);
    });
    
    this.secureManager.on('secureChunkIntercepted', (data) => {
      console.log('🔐 [EXAMPLE] Secure chunk intercept:', {
        url: data.modifiedUrl,
        streamKey: data.streamKey,
        hasRange: data.hasRange
      });
    });
    
    // Chunk tracking events
    this.chunkTracker.on('progressChunkLoaded', (data) => {
      console.log('📊 [EXAMPLE] Progress chunk loaded:', {
        bufferedEnd: data.bufferedEnd.toFixed(2) + 's',
        newDataLoaded: data.newDataLoaded.toFixed(2) + 's',
        streamKey: data.streamKey
      });
    });
    
    this.chunkTracker.on('chunkPrediction', (data) => {
      console.log('🔮 [EXAMPLE] Chunk loading prediction:', data.prediction);
    });
  }

  // Get streaming statistics
  getStreamingStats() {
    const secureStatus = this.secureManager.getStatus();
    const trackingStats = this.chunkTracker.getTrackingStats();
    
    return {
      secure: secureStatus,
      tracking: trackingStats,
      combined: {
        isActive: secureStatus.isServiceWorkerActive && trackingStats.isMonitoring,
        sessionId: secureStatus.sessionId,
        totalChunks: trackingStats.totalChunkRequests,
        totalPredictions: trackingStats.totalPredictions
      }
    };
  }

  // Generate new secure token (สำหรับ refresh token)
  async refreshSecureToken(eventData = {}) {
    try {
      const newSecureData = await this.secureManager.generateSecureStreamKey({
        action: 'refresh',
        ...eventData,
        timestamp: Date.now()
      });
      
      await this.secureManager.updateSWSecureToken(newSecureData);
      
      console.log('🔄 [EXAMPLE] Secure token refreshed:', newSecureData.streamKey);
      return newSecureData;
      
    } catch (error) {
      console.error('❌ [EXAMPLE] Failed to refresh secure token:', error);
      throw error;
    }
  }

  // Verify token (for testing)
  async verifyToken(token) {
    return await this.secureManager.verifyStreamToken(token);
  }

  // Reset session
  resetSession() {
    this.secureManager.resetSession();
    this.chunkTracker.clearTrackingData();
    console.log('🔄 [EXAMPLE] Session reset completed');
  }

  // Cleanup
  async destroy() {
    console.log('🧹 [EXAMPLE] Cleaning up streaming example...');
    
    // Stop tracking
    this.chunkTracker.destroy();
    
    // Unregister Service Worker
    await this.secureManager.unregisterStreamInterceptor();
    
    console.log('✅ [EXAMPLE] Cleanup completed');
  }
}

// ตัวอย่างการใช้งานใน HTML/JavaScript vanilla
export function createSimpleVideoPlayer(videoElement, options = {}) {
  const example = new VideoStreamingExample();
  
  // Initialize เมื่อ video พร้อม
  videoElement.addEventListener('loadedmetadata', async () => {
    const result = await example.initializeSecureStreaming(videoElement);
    
    if (result.success) {
      console.log('🎬 [SIMPLE] Video player with secure streaming ready!');
      
      if (options.onReady) {
        options.onReady(result);
      }
    } else {
      console.error('❌ [SIMPLE] Failed to setup secure streaming:', result.error);
      
      if (options.onError) {
        options.onError(result.error);
      }
    }
  });
  
  // Return controls
  return {
    example,
    refreshToken: () => example.refreshSecureToken(),
    getStats: () => example.getStreamingStats(),
    reset: () => example.resetSession(),
    destroy: () => example.destroy()
  };
}

// Export default
export default VideoStreamingExample;
