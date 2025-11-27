/**
 * VideoChunkTracker - ติดตาม video chunk loading และ buffer management
 */

export class VideoChunkTracker {
  constructor(secureManager = null) {
    this.secureManager = secureManager;
    
    // Tracking data
    this.chunkRequests = [];
    this.chunkLoadingPredictions = [];
    this.lastBufferedEnd = 0;
    this.bufferCheckInterval = null;
    
    // Settings
    this.bufferCheckIntervalMs = 1000; // Check buffer every 1 second
    this.predictionThreshold = 5; // Predict when < 5 seconds remaining
    this.maxStoredRequests = 50; // Limit stored requests
    
    // Event callbacks
    this.eventCallbacks = new Map();
  }

  // Initialize tracking for a video element
  initializeTracking(videoElement, emit = null) {
    if (!videoElement) {
      console.warn('❌ [TRACKER] Video element is required');
      return false;
    }

    this.videoElement = videoElement;
    this.emit = emit; // Optional - จะใช้ internal event system แทน

    // Start buffer monitoring
    this.startBufferMonitoring();

    // Setup video event listeners
    this.setupVideoEventListeners();

    console.log('🎯 [TRACKER] Video chunk tracking initialized');
    return true;
  }

  // Start monitoring video buffer
  startBufferMonitoring() {
    if (this.bufferCheckInterval) {
      clearInterval(this.bufferCheckInterval);
    }

    this.bufferCheckInterval = setInterval(() => {
      this.checkVideoProgress();
    }, this.bufferCheckIntervalMs);

    console.log('📊 [TRACKER] Buffer monitoring started');
  }

  // Stop monitoring
  stopBufferMonitoring() {
    if (this.bufferCheckInterval) {
      clearInterval(this.bufferCheckInterval);
      this.bufferCheckInterval = null;
      console.log('⏹️ [TRACKER] Buffer monitoring stopped');
    }
  }

  // Setup video event listeners
  setupVideoEventListeners() {
    if (!this.videoElement) return;

    // Track when video starts playing
    this.videoElement.addEventListener('playing', async () => {
      await this.handleVideoPlaying();
    });

    // Track seeking events
    this.videoElement.addEventListener('seeking', () => {
      this.handleVideoSeeking();
    });

    // Track loading events
    this.videoElement.addEventListener('loadstart', () => {
      console.log('📥 [TRACKER] Video loading started');
      this.emitEvent('loadStart');
    });

    // Track progress events
    this.videoElement.addEventListener('progress', () => {
      this.handleVideoProgress();
    });
  }

  // Handle video playing event
  async handleVideoPlaying() {
    console.log('▶️ [TRACKER] Video playing event');
    
    if (this.secureManager) {
      try {
        const secureData = await this.secureManager.generateSecureStreamKey({
          event: 'video-playing',
          currentTime: this.videoElement.currentTime,
          duration: this.videoElement.duration
        });

        console.log('🔐 [TRACKER] Generated secure token for playing event');
        
        // Update Service Worker with secure token
        await this.secureManager.updateSWSecureToken(secureData);
        
        this.emitEvent('secureTokenGenerated', secureData);
      } catch (error) {
        console.error('❌ [TRACKER] Failed to generate secure token for playing:', error);
      }
    }

    this.emitEvent('videoPlaying');
  }

  // Handle video seeking
  handleVideoSeeking() {
    const currentTime = this.videoElement.currentTime;
    console.log(`⏭️ [TRACKER] Video seeking to: ${currentTime.toFixed(2)}s`);
    
    this.emitEvent('videoSeeking', { currentTime });
  }

  // Handle video progress
  handleVideoProgress() {
    if (!this.videoElement) return;

    const buffered = this.videoElement.buffered;
    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      const newDataLoaded = bufferedEnd - this.lastBufferedEnd;

      if (newDataLoaded > 0.1) { // Only track significant progress
        console.log(`📈 [TRACKER] Video progress: ${newDataLoaded.toFixed(2)}s new data loaded`);
        
        this.handleProgressChunk(bufferedEnd, newDataLoaded);
        this.lastBufferedEnd = bufferedEnd;
      }
    }
  }

  // Check video progress and predict chunk loading
  async checkVideoProgress() {
    if (!this.videoElement) return;

    try {
      const currentTime = this.videoElement.currentTime;
      const buffered = this.videoElement.buffered;

      if (buffered.length > 0) {
        const currentBufferedEnd = buffered.end(buffered.length - 1);
        const remaining = currentBufferedEnd - currentTime;
        const newDataLoaded = currentBufferedEnd - this.lastBufferedEnd;

        // Detect new chunk loading
        if (newDataLoaded > 0.5) {
          await this.handleProgressChunk(currentBufferedEnd, newDataLoaded, currentTime, remaining);
          this.lastBufferedEnd = currentBufferedEnd;
        }

        // Predict next chunk loading
        if (remaining < this.predictionThreshold && remaining > 0) {
          this.handleChunkPrediction(remaining, currentBufferedEnd, currentTime);
        }
      }
    } catch (error) {
      console.error('❌ [TRACKER] Error in checkVideoProgress:', error);
    }
  }

  // Handle progress chunk detection
  async handleProgressChunk(currentBufferedEnd, newDataLoaded, currentTime = 0, remaining = 0) {
    if (this.secureManager) {
      try {
        // Generate secure token for this progress chunk
        const secureData = await this.secureManager.generateSecureStreamKey({
          event: 'progress-chunk',
          bufferedEnd: currentBufferedEnd,
          newDataLoaded: newDataLoaded,
          currentTime: currentTime
        });

        console.log(`🔑 [TRACKER] Secure stream key: ${secureData.streamKey}`);
        console.log(`🔐 [TRACKER] Token generated for ${newDataLoaded.toFixed(2)}s of new data`);

        // Add to chunk requests list
        this.addChunkRequest({
          type: 'progress-chunk',
          bufferedEnd: currentBufferedEnd,
          newDataLoaded: newDataLoaded,
          streamKey: secureData.streamKey,
          secureToken: secureData.token,
          sessionId: secureData.sessionId,
          currentTime: currentTime,
          remaining: remaining,
          timestamp: Date.now()
        });

        // Update Service Worker
        await this.secureManager.updateSWSecureToken(secureData);

        // Emit progress chunk event
        this.emitEvent('progressChunkLoaded', {
          bufferedEnd: currentBufferedEnd,
          newDataLoaded: newDataLoaded,
          streamKey: secureData.streamKey,
          secureToken: secureData.token,
          sessionId: secureData.sessionId,
          remainingBuffer: remaining,
          currentTime: currentTime,
          timestamp: Date.now()
        });

      } catch (error) {
        console.error('❌ [TRACKER] Failed to generate secure token for progress chunk:', error);
      }
    } else {
      // Fallback without secure token
      this.addChunkRequest({
        type: 'progress-chunk',
        bufferedEnd: currentBufferedEnd,
        newDataLoaded: newDataLoaded,
        currentTime: currentTime,
        remaining: remaining,
        timestamp: Date.now()
      });

      this.emitEvent('progressChunkLoaded', {
        bufferedEnd: currentBufferedEnd,
        newDataLoaded: newDataLoaded,
        remainingBuffer: remaining,
        currentTime: currentTime,
        timestamp: Date.now()
      });
    }
  }

  // Handle chunk loading prediction
  handleChunkPrediction(remaining, bufferedEnd, currentTime) {
    console.log('⏳ [TRACKER] Next chunk will load soon:', {
      remaining: remaining.toFixed(2) + 's',
      bufferedEnd: bufferedEnd.toFixed(2) + 's',
      currentTime: currentTime.toFixed(2) + 's',
      prediction: `New chunk needed in < ${this.predictionThreshold} seconds`
    });

    // Store prediction (avoid duplicates)
    const lastPrediction = this.chunkLoadingPredictions[this.chunkLoadingPredictions.length - 1];
    if (!lastPrediction || Date.now() - lastPrediction.timestamp > 2000) {
      const prediction = {
        predictedAt: Date.now(),
        remaining: remaining,
        bufferedEnd: bufferedEnd,
        currentTime: currentTime,
        prediction: `New chunk needed in ${remaining.toFixed(1)}s`
      };

      this.chunkLoadingPredictions.push(prediction);
      this.emitEvent('chunkPrediction', prediction);

      // Limit stored predictions
      if (this.chunkLoadingPredictions.length > 20) {
        this.chunkLoadingPredictions = this.chunkLoadingPredictions.slice(-20);
      }
    }
  }

  // Add chunk request to tracking list
  addChunkRequest(request) {
    this.chunkRequests.push(request);
    
    // Limit stored requests
    if (this.chunkRequests.length > this.maxStoredRequests) {
      this.chunkRequests = this.chunkRequests.slice(-this.maxStoredRequests);
    }

    console.log(`📊 [TRACKER] Chunk request added. Total: ${this.chunkRequests.length}`);
  }

  // Get tracking statistics
  getTrackingStats() {
    return {
      totalChunkRequests: this.chunkRequests.length,
      totalPredictions: this.chunkLoadingPredictions.length,
      lastBufferedEnd: this.lastBufferedEnd,
      recentRequests: this.chunkRequests.slice(-5),
      recentPredictions: this.chunkLoadingPredictions.slice(-5),
      isMonitoring: !!this.bufferCheckInterval
    };
  }

  // Clear tracking data
  clearTrackingData() {
    this.chunkRequests = [];
    this.chunkLoadingPredictions = [];
    this.lastBufferedEnd = 0;
    console.log('🧹 [TRACKER] Tracking data cleared');
    this.emitEvent('trackingDataCleared');
  }

  // Event system
  on(event, callback) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventCallbacks.has(event)) {
      const callbacks = this.eventCallbacks.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emitEvent(event, data) {
    // Emit to internal callbacks
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ [TRACKER] Error in ${event} callback:`, error);
        }
      });
    }

    // Note: Vue emit is handled by useUniversalPlayer.js through event listeners
    // This keeps the class decoupled from Vue-specific functionality
  }

  // Cleanup
  destroy() {
    this.stopBufferMonitoring();
    this.clearTrackingData();
    this.eventCallbacks.clear();
    this.videoElement = null;
    this.emit = null;
    console.log('🗑️ [TRACKER] VideoChunkTracker destroyed');
  }
}

export default VideoChunkTracker;
