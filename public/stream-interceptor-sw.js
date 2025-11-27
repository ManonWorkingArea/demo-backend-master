// Service Worker เสียง ding-dong และการจัดการ Request
console.log('Stream Interceptor Service Worker starting...');

// ค่าคงที่สำหรับ headers และ session management
const STREAM_TOKEN_HEADER = 'x-stream-token';
const SESSION_KEY_HEADER = 'x-session-key';
const SECURE_TOKEN_HEADER = 'x-secure-token';
const STREAM_KEY_HEADER = 'x-stream-key';
const STREAM_URL_PARAM = 'stream_key';
const SESSION_STORAGE_KEY = 'video_session_key';
const SESSION_EXPIRY_KEY = 'video_session_expiry';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 ชั่วโมง

// Listen for messages from main thread
self.addEventListener('message', (event) => {
  if (event.data.type === 'NEW_SESSION') {
    console.log('Service Worker received new session ID:', event.data.sessionId);
    // Force refresh session cache
    currentSessionId = null;
  }
});

// Cache for current session ID to avoid repeated localStorage access
let currentSessionId = null;

// Store current secure token data
let currentSecureData = null;

// Generate stream key (fallback if secure token not available)
function generateStreamKey() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Generate session key
function generateSessionKey() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${random}`;
}

// Get or create session ID with 24-hour expiration
function getOrCreateSessionId() {
  // Return cached session if available
  if (currentSessionId) {
    return currentSessionId;
  }
  
  try {
    // Check if we can access storage (some browsers may block it in SW)
    const storedSession = self.localStorage ? self.localStorage.getItem(SESSION_STORAGE_KEY) : null;
    
    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      const now = Date.now();
      
      // Check if session is still valid (within 24 hours)
      if (sessionData.expiresAt > now) {
        console.log('🔑 [SW] Using existing session ID:', sessionData.id);
        currentSessionId = sessionData.id;
        return sessionData.id;
      } else {
        console.log('🔑 [SW] Session expired, creating new one');
        if (self.localStorage) {
          self.localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    }
  } catch (error) {
    console.warn('🔑 [SW] Error reading session storage:', error);
  }
  
  // Create new session
  const sessionId = generateSessionKey();
  const sessionData = {
    id: sessionId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION
  };
  
  try {
    if (self.localStorage) {
      self.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    }
    console.log('🔑 [SW] Created new session ID:', sessionId, 'expires at:', new Date(sessionData.expiresAt));
  } catch (error) {
    console.warn('🔑 [SW] Error saving to session storage:', error);
  }
  
  // Cache the session ID
  currentSessionId = sessionId;
  return sessionId;
}

// Check if request is for video chunks
function isVideoChunkRequest(url) {
  const videoChunkPatterns = [
    /\.ts$/i,                          // HLS segments
    /\.m4s$/i,                         // DASH segments
    /segment-\d+/i,                    // Generic segments
    /chunk-\d+/i,                      // Generic chunks
    /range=\d+-\d+/i,                  // Range requests in URL params
    /\/api\/stream\/.*\/\d+$/i,        // API stream chunks
    /content-delivery-api.*stream/i,   // Your specific API
    /68bf95b2e1ebd077525fdeb9/i,      // Your specific video ID
    /manonsanoi\.workers\.dev/i,       // Your workers domain
    /\.mp4/i,                          // MP4 files
    /\.webm/i,                         // WebM files
    /\.m3u8/i,                         // HLS playlists
  ];
  
  return videoChunkPatterns.some(pattern => pattern.test(url));
}

// Check if request has Range header (chunk request)
function hasRangeHeader(request) {
  return request.headers.has('range');
}

// Add stream key to URL
function addStreamKeyToUrl(url, streamKey) {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set(STREAM_URL_PARAM, streamKey);
    // Add cache buster to prevent caching
    urlObj.searchParams.set('_cb', Date.now().toString());
    urlObj.searchParams.set('_t', Date.now().toString());
    return urlObj.toString();
  } catch (error) {
    console.warn('SW: Failed to add stream key to URL:', error);
    const cacheBuster = Date.now();
    return url + (url.includes('?') ? '&' : '?') + `${STREAM_URL_PARAM}=${streamKey}&_cb=${cacheBuster}&_t=${cacheBuster}`;
  }
}

// Add secure token to URL (only stream key in URL, token in header)
function addSecureTokenToUrl(url, secureData) {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set(STREAM_URL_PARAM, secureData.streamKey);
    // Add cache buster to prevent caching
    urlObj.searchParams.set('_cb', Date.now().toString());
    urlObj.searchParams.set('_t', secureData.timestamp || Date.now());
    return urlObj.toString();
  } catch (error) {
    console.warn('SW: Failed to add secure token to URL:', error);
    const separator = url.includes('?') ? '&' : '?';
    const cacheBuster = Date.now();
    return `${url}${separator}${STREAM_URL_PARAM}=${secureData.streamKey}&_cb=${cacheBuster}&_t=${secureData.timestamp || cacheBuster}`;
  }
}

self.addEventListener('install', () => {
  console.log('🔧 [SW] Stream Interceptor Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔧 [SW] Stream Interceptor Service Worker activated');
  // Clear cached token on activation (new page load)
  currentSecureData = null;
  console.log('🔄 [SW] Cleared cached secure token on activation');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;
  
  // Only intercept video chunk requests
  if (isVideoChunkRequest(url) || hasRangeHeader(request)) {
    // Check if this request already has stream key (avoid double processing)
    if (url.includes('stream=')) {
      console.log('🔄 [SW] Request already has stream key, passing through:', url);
      return; // Let it pass through normally
    }
    
    console.log('🌐 [SW] Intercepting video request:', url);
    
    // Use secure token if available, otherwise fallback to simple stream key
    let modifiedUrl, fetchOptions;
    
    if (currentSecureData && currentSecureData.token) {
      // Get or create session ID
      const sessionId = getOrCreateSessionId();
      
      // Use secure token
      modifiedUrl = addSecureTokenToUrl(url, currentSecureData);
      fetchOptions = {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          [SECURE_TOKEN_HEADER]: currentSecureData.token,
          [SESSION_KEY_HEADER]: sessionId,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Cache-Buster': Date.now().toString()
        },
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store'
      };
      console.log(`🔐 [SW] Added x-stream-token header to chunk request`);
      console.log(`🔑 [SW] Stream key: ${currentSecureData.streamKey}`);
    } else {
      // Get or create session ID for fallback too
      const sessionId = getOrCreateSessionId();
      
      // Fallback to simple stream key
      const streamKey = generateStreamKey();
      modifiedUrl = addStreamKeyToUrl(url, streamKey);
      fetchOptions = {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          [STREAM_KEY_HEADER]: streamKey,
          [SESSION_KEY_HEADER]: sessionId,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Cache-Buster': Date.now().toString()
        },
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store'
      };
      console.log(`🔑 [SW] Added stream key: ${streamKey} to chunk request (secure token unavailable)`);
    }
    
    // Add body for POST requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      fetchOptions.body = request.body;
    }
    
    // Send message to main thread about chunk request (non-blocking)
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: currentSecureData ? 'SECURE_CHUNK_REQUEST_INTERCEPTED' : 'CHUNK_REQUEST_INTERCEPTED',
          data: {
            originalUrl: url,
            modifiedUrl: modifiedUrl,
            streamKey: currentSecureData ? currentSecureData.streamKey : null,
            secureToken: currentSecureData ? currentSecureData.token : null,
            sessionId: currentSecureData ? currentSecureData.sessionId : null,
            hasRange: hasRangeHeader(request),
            rangeHeader: request.headers.get('range'),
            timestamp: Date.now()
          }
        });
      });
    }).catch(err => console.warn('Failed to notify clients:', err));
    
    // Forward modified request with error handling
    event.respondWith(
      fetch(modifiedUrl, fetchOptions)
        .then(response => {
          console.log(`✅ [SW] ${currentSecureData ? 'Secure' : 'Standard'} chunk request successful: ${response.status}`);
          return response;
        })
        .catch(error => {
          console.error('❌ [SW] Chunk request failed:', error);
          // Fallback to original request if modified fails
          return fetch(request);
        })
    );
  }
  // For non-video requests, pass through normally
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PING') {
    event.source.postMessage({ type: 'PONG', message: 'Stream Interceptor SW is active' });
  } else if (event.data && event.data.type === 'UPDATE_SECURE_TOKEN') {
    // Update secure token data from main thread
    const previousToken = currentSecureData?.token;
    currentSecureData = event.data.secureData;
    console.log('🔐 [SW] Received secure token update:', {
      streamKey: currentSecureData?.streamKey,
      sessionId: currentSecureData?.sessionId,
      tokenLength: currentSecureData?.token?.length || 0,
      tokenChanged: previousToken !== currentSecureData?.token,
      timestamp: new Date().toISOString()
    });
    event.source.postMessage({ 
      type: 'SECURE_TOKEN_UPDATED', 
      message: 'Secure token updated in Service Worker' 
    });
  } else if (event.data && event.data.type === 'CLEAR_SECURE_TOKEN') {
    // Clear secure token data
    const hadToken = !!currentSecureData;
    currentSecureData = null;
    console.log('🔓 [SW] Secure token cleared', { hadToken, timestamp: new Date().toISOString() });
    event.source.postMessage({ 
      type: 'SECURE_TOKEN_CLEARED', 
      message: 'Secure token cleared from Service Worker' 
    });
  } else if (event.data && event.data.type === 'FORCE_REFRESH_TOKEN') {
    // Force clear and request new token
    currentSecureData = null;
    console.log('🔄 [SW] Forced token refresh - cache cleared');
    event.source.postMessage({ 
      type: 'TOKEN_CACHE_CLEARED', 
      message: 'Token cache cleared - ready for new token' 
    });
  }
});
