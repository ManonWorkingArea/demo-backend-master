/**
 * SecureStreamManager - จัดการ secure token และ Service Worker สำหรับ video streaming
 * แบบ 2-way encoding/decoding แบบง่ายๆ
 */

class SecureStreamManager {
  constructor() {
    this.SHARED_SALT = 'UniversalPlayer2024';
    this.sessionId = this.generateSessionId();
    this.serviceWorkerRegistration = null;
    this.isServiceWorkerActive = false;
    
    // One-time token management
    this.TOKEN_EXPIRES_IN = 15 * 1000; // 15 seconds in milliseconds
    this.usedTokens = new Set(); // Track used tokens to prevent replay
    this.tokenCleanupInterval = null;
    
    // เก็บ callbacks สำหรับ events
    this.eventCallbacks = new Map();
    
    // Start token cleanup
    this.startTokenCleanup();
  }

  // Generate unique session ID
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
  }

  // Start token cleanup to remove expired tokens from memory
  startTokenCleanup() {
    if (this.tokenCleanupInterval) {
      clearInterval(this.tokenCleanupInterval);
    }
    
    this.tokenCleanupInterval = setInterval(() => {
      const now = Date.now();
      const expiredTokens = Array.from(this.usedTokens).filter(tokenData => {
        const [, timestamp] = tokenData.split('_');
        return now - parseInt(timestamp) > this.TOKEN_EXPIRES_IN * 2; // Keep for 2x expiry time
      });
      
      expiredTokens.forEach(token => this.usedTokens.delete(token));
      
      if (expiredTokens.length > 0) {
        console.log(`🧹 [TOKEN-CLEANUP] Removed ${expiredTokens.length} expired tokens`);
      }
    }, 30000); // Cleanup every 30 seconds
  }

  // Stop token cleanup
  stopTokenCleanup() {
    if (this.tokenCleanupInterval) {
      clearInterval(this.tokenCleanupInterval);
      this.tokenCleanupInterval = null;
    }
  }

  // Simple XOR encoding (2-way)
  encodeTimestamp(timestamp, salt = this.SHARED_SALT) {
    const timestampStr = timestamp.toString();
    let encoded = '';
    
    for (let i = 0; i < timestampStr.length; i++) {
      const charCode = timestampStr.charCodeAt(i);
      const saltCharCode = salt.charCodeAt(i % salt.length);
      const encodedChar = charCode ^ saltCharCode;
      encoded += encodedChar.toString(16).padStart(2, '0');
    }
    
    return encoded;
  }

  // Decode timestamp back from encoded string (2-way)
  decodeTimestamp(encoded, salt = this.SHARED_SALT) {
    try {
      let decoded = '';
      
      for (let i = 0; i < encoded.length; i += 2) {
        const hexChar = encoded.substr(i, 2);
        const encodedChar = parseInt(hexChar, 16);
        const saltCharCode = salt.charCodeAt((i / 2) % salt.length);
        const originalChar = encodedChar ^ saltCharCode;
        decoded += String.fromCharCode(originalChar);
      }
      
      return parseInt(decoded);
    } catch (error) {
      throw new Error('Failed to decode timestamp: ' + error.message);
    }
  }

  // Generate one-time stream key (15 seconds expiry) - 2-way encoded
  async generateSecureStreamKey() {
    try {
      // บังคับใช้ UTC timestamp
      const utcNow = new Date();
      const timestamp = utcNow.getTime(); // UTC timestamp in milliseconds
      
      // Encode timestamp with salt (2-way encoding)
      const encodedTimestamp = this.encodeTimestamp(timestamp);
      
      // Create stream key: just the encoded timestamp
      const streamKey = encodedTimestamp;
      
      console.log('🔑 [UTC-ENCODE] Generated encoded stream key:', {
        originalTimestamp: timestamp,
        utcISO: new Date(timestamp).toISOString(), // UTC format
        localTime: new Date(timestamp).toString(), // Local time for comparison
        encodedTimestamp: encodedTimestamp,
        expiresIn: '15 seconds',
        streamKeyLength: streamKey.length,
        timezone: 'UTC (forced)'
      });
      
      return {
        streamKey,
        token: streamKey, // Same as streamKey for backward compatibility
        sessionId: this.sessionId,
        timestamp: timestamp,
        payload: { timestamp, expiresAt: timestamp + 15000 } // 15 seconds
      };
    } catch (error) {
      console.error('❌ [UTC-ENCODE] Failed to generate encoded stream key:', error);
      throw error;
    }
  }

  // Verify encoded stream key (for server-side validation)
  async verifyEncodedStreamKey(streamKey, salt = this.SHARED_SALT) {
    try {
      // Decode timestamp from stream key
      const timestamp = this.decodeTimestamp(streamKey, salt);
      // บังคับใช้ UTC timestamp สำหรับการเปรียบเทียบ
      const now = new Date().getTime(); // UTC timestamp
      const age = now - timestamp;
      const maxAge = 15 * 1000; // 15 seconds
      
      // Check expiry first
      if (age > maxAge) {
        return { 
          valid: false, 
          error: 'Stream key expired',
          reason: `Key expired ${Math.round(age / 1000)}s ago (max 15s)`,
          timestamp: new Date(timestamp).toISOString(),
          age: age
        };
      }
      
      // Check if timestamp is from future (clock skew protection)
      if (age < -5000) { // Allow 5s clock skew
        return { 
          valid: false, 
          error: 'Stream key from future',
          reason: 'Timestamp is too far in the future',
          timestamp: new Date(timestamp).toISOString()
        };
      }
      
      return {
        valid: true,
        timestamp: timestamp,
        age: age,
        remainingTime: maxAge - age,
        issuedAt: new Date(timestamp).toISOString(),
        expiresAt: new Date(timestamp + maxAge).toISOString()
      };
      
    } catch (error) {
      return { 
        valid: false, 
        error: 'Stream key verification failed',
        reason: error.message
      };
    }
  }

  // Decode and show encoded stream key contents (for debugging) 
  decodeEncodedStreamKey(streamKey) {
    try {
      const timestamp = this.decodeTimestamp(streamKey);
      const now = Date.now();
      const age = now - timestamp;
      
      return {
        success: true,
        originalTimestamp: timestamp,
        encodedKey: streamKey,
        age: age,
        ageSeconds: Math.round(age / 1000),
        isExpired: age > 15000,
        remainingSeconds: Math.max(0, Math.round((15000 - age) / 1000)),
        issuedAt: new Date(timestamp).toISOString(),
        expiresAt: new Date(timestamp + 15000).toISOString()
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Static method for server to decode stream key
  static decodeServerStreamKey(encodedStreamKey, sharedSalt = 'UniversalPlayer2024') {
    try {
      let decoded = '';
      
      for (let i = 0; i < encodedStreamKey.length; i += 2) {
        const hexChar = encodedStreamKey.substr(i, 2);
        const encodedChar = parseInt(hexChar, 16);
        const saltCharCode = sharedSalt.charCodeAt((i / 2) % sharedSalt.length);
        const originalChar = encodedChar ^ saltCharCode;
        decoded += String.fromCharCode(originalChar);
      }
      
      const timestamp = parseInt(decoded);
      // บังคับใช้ UTC timestamp สำหรับ server
      const now = new Date().getTime(); // UTC timestamp
      const age = now - timestamp;
      
      return {
        success: true,
        timestamp: timestamp,
        age: age,
        isExpired: age > 15000, // 15 seconds
        remainingTime: Math.max(0, 15000 - age),
        issuedAt: new Date(timestamp).toISOString(),
        expiresAt: new Date(timestamp + 15000).toISOString()
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Service Worker Management
  async registerStreamInterceptor() {
    if (!('serviceWorker' in navigator)) {
      console.warn('🔧 [SW] Service Worker not supported');
      return false;
    }

    try {
      console.log('🔧 [SW] Registering Stream Interceptor Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/stream-interceptor-sw.js', {
        scope: '/'
      });

      this.serviceWorkerRegistration = registration;
      console.log('🔧 [SW] Service Worker registered successfully');

      // Listen for Service Worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });

      // Handle Service Worker state changes
      if (registration.installing) {
        registration.installing.addEventListener('statechange', (event) => {
          const newWorker = event.target;
          console.log('🔧 [SW] Installing worker state:', newWorker.state);
          
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔧 [SW] New Service Worker installed, will activate after refresh');
          }
        });
      }

      if (registration.waiting) {
        registration.waiting.addEventListener('statechange', (event) => {
          const newWorker = event.target;
          console.log('🔧 [SW] Waiting worker state:', newWorker.state);
          
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔧 [SW] Service Worker waiting to activate');
          }
        });
      }

      if (registration.active) {
        console.log('🔧 [SW] Service Worker is active');
        this.isServiceWorkerActive = true;
        
        // Emit ready event
        this.emit('serviceWorkerReady', { registration });
      }

      // Handle updates
      registration.addEventListener('updatefound', () => {
        console.log('🔧 [SW] Service Worker update found');
        this.emit('serviceWorkerUpdate', { registration });
      });

      // Test SW communication
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'PING' });
      }

      return true;
    } catch (error) {
      console.error('🔧 [SW] Failed to register Service Worker:', error);
      return false;
    }
  }

  async unregisterStreamInterceptor() {
    if (this.serviceWorkerRegistration) {
      try {
        await this.serviceWorkerRegistration.unregister();
        this.serviceWorkerRegistration = null;
        this.isServiceWorkerActive = false;
        console.log('🔧 [SW] Service Worker unregistered successfully');
        this.emit('serviceWorkerUnregistered');
      } catch (error) {
        console.error('🔧 [SW] Failed to unregister Service Worker:', error);
      }
    }
  }

  // Update secure token in Service Worker
  async updateSWSecureToken(secureData) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_SECURE_TOKEN',
        secureData: secureData
      });
      console.log('🔐 [SW-COMM] Secure token sent to Service Worker:', {
        streamKey: secureData.streamKey,
        sessionId: secureData.sessionId,
        tokenLength: secureData.token.length
      });
      
      this.emit('secureTokenUpdated', secureData);
    }
  }

  // Clear secure token from Service Worker
  async clearSWSecureToken() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_SECURE_TOKEN'
      });
      console.log('🔓 [SW-COMM] Secure token cleared from Service Worker');
      
      this.emit('secureTokenCleared');
    }
  }

  // Force refresh token cache in Service Worker
  async forceRefreshSWToken() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'FORCE_REFRESH_TOKEN'
      });
      console.log('🔄 [SW-COMM] Forced token refresh in Service Worker');
      
      this.emit('tokenCacheCleared');
    }
  }

  // Handle Service Worker messages
  handleServiceWorkerMessage(event) {
    const { type, data, message } = event.data;
    
    console.log('📨 [SW-MSG] Received message from Service Worker:', { type, data });
    
    switch (type) {
      case 'PONG':
        console.log('🏓 [SW-COMM] Service Worker is responsive');
        this.emit('serviceWorkerPong', { message });
        break;
        
      case 'SECURE_CHUNK_REQUEST_INTERCEPTED':
        console.log('🔐 [SW-CHUNK] Secure chunk request intercepted:', data);
        this.emit('secureChunkIntercepted', data);
        break;
        
      case 'CHUNK_REQUEST_INTERCEPTED':
        console.log('🔑 [SW-CHUNK] Standard chunk request intercepted:', data);
        this.emit('chunkIntercepted', data);
        break;
        
      case 'SECURE_TOKEN_UPDATED':
        console.log('✅ [SW-TOKEN] Secure token updated in Service Worker');
        this.emit('serviceWorkerTokenUpdated', { message });
        break;
        
      case 'SECURE_TOKEN_CLEARED':
        console.log('🔓 [SW-TOKEN] Secure token cleared from Service Worker');
        this.emit('serviceWorkerTokenCleared', { message });
        break;
        
      default:
        console.log('❓ [SW-MSG] Unknown message type:', type);
    }
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

  emit(event, data) {
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ [EVENT] Error in ${event} callback:`, error);
        }
      });
    }
  }

  // Utility methods
  getStatus() {
    return {
      sessionId: this.sessionId,
      isServiceWorkerActive: this.isServiceWorkerActive,
      hasServiceWorkerRegistration: !!this.serviceWorkerRegistration,
      eventListeners: Array.from(this.eventCallbacks.keys())
    };
  }

  // Reset session
  resetSession() {
    this.sessionId = this.generateSessionId();
    this.usedTokens.clear(); // Clear used tokens for new session
    console.log('🔄 [SESSION] New session started:', this.sessionId);
    this.emit('sessionReset', { sessionId: this.sessionId });
  }

  // Cleanup and destroy
  destroy() {
    this.stopTokenCleanup();
    this.usedTokens.clear();
    this.eventCallbacks.clear();
    console.log('🗑️ [SECURE-MANAGER] SecureStreamManager destroyed');
  }
}

// Export both default and named exports for compatibility
export { SecureStreamManager };
export default SecureStreamManager;
