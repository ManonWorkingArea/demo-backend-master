import { ref, computed, watch, onMounted, onBeforeUnmount, toRefs } from 'vue';
import Hls from 'hls.js';
import SecureStreamManager from '../utils/SecureStreamManager.js';
import VideoChunkTracker from '../utils/VideoChunkTracker.js';

/**
 * Reusable Universal video player composable.
 * Supports HLS streams, MP4 files, and other video formats.
 *
 * Contract
 * - Inputs: reactive props (src, autoplay, muted, loop, height, objectFit, showQuality, showSpeed, speeds)
 * - Outputs: refs for DOM (videoEl, containerEl), reactive state, computed values, and control methods
 * - Emits: error, quality-changed, rate-changed (via provided emit)
 */
export function useUniversalPlayer(props, emit) {
  const {
    height,
    objectFit,
    poster,
    coverUrl,
    autoCover,
  } = toRefs(props);

  // DOM refs
  const videoEl = ref(null);
  const containerEl = ref(null);

  // Player core state
  const hls = ref(null);
  const levels = ref([]);
  const selectedQuality = ref('auto');
  const playbackRate = ref(1);

  // Media state
  const isPlaying = ref(false);
  const isMuted = ref(false);
  const volume = ref(1);
  const duration = ref(0);
  const currentTime = ref(0);
  const seekingTime = ref(null);
  
  // Cover/Poster state
  const autoCoverUrl = ref('');
  const isCoverLoaded = ref(false);
  const isCoverLoading = ref(false);

  // UI state
  const isFullscreen = ref(false);
  const isCustomFullscreen = ref(false);
  const isPictureInPicture = ref(false);
  const showQualityDropdown = ref(false);
  const showSpeedDropdown = ref(false);
  const showSettingsDropdown = ref(false);
  const uiVisible = ref(true);
  const uiTimer = ref(null);
  const isSeeking = ref(false);
  
  // Loading states
  const isLoading = ref(false);
  const isBuffering = ref(false);
  const loadingProgress = ref(0);

  // Chunk tracking states
  const chunkRequests = ref([]);
  const totalChunksRequested = ref(0);
  const chunkCount = ref(0);
  const lastBufferedEnd = ref(0);
  const lastWaitingTime = ref(0);
  const chunkLoadingPredictions = ref([]);

  // Initialize secure stream and chunk tracking managers
  const secureManager = new SecureStreamManager();
  const chunkTracker = new VideoChunkTracker(secureManager);

  // MediaSource states
  const mediaSource = ref(null);
  const sourceBuffer = ref(null);
  const useMediaSource = ref(false);
  const chunkSize = ref(1024 * 1024); // 1MB chunks
  const totalSize = ref(0);
  const loadedChunks = ref(new Set());

  // Service Worker states
  const serviceWorkerActive = ref(false);
  const interceptedRequests = ref([]);

  // Session management
  const currentSessionId = ref(null);
  const sessionCreatedAt = ref(null);
  const sessionExpiresAt = ref(null);

  // Seeking optimization
  let seekTimeout = null;
  const lastSeekTime = ref(0);

  // Computed helpers
  const computedStyle = computed(() => {
    const h = typeof height.value === 'number' ? `${height.value}px` : height.value;
    return { 
      height: h, 
      backgroundColor: '#000', 
      objectFit: objectFit.value,
      width: '100%'
    };
  });

  const canSelectQuality = computed(() => !!hls.value && levels.value && levels.value.length > 0);

  const qualityOptions = computed(() => {
    const seen = new Set();
    const opts = [];
    (levels.value || []).forEach((lvl, idx) => {
      const h = lvl && typeof lvl.height === 'number' ? lvl.height : 0;
      const bw = lvl && (lvl.bitrate || lvl.bandwidth) ? (lvl.bitrate || lvl.bandwidth) : 0;
      const label = h ? `${h}p` : `${Math.round(bw / 1000)}kbps`;
      const key = h || label;
      if (!seen.has(key)) {
        seen.add(key);
        opts.push({ value: idx, label });
      }
    });
    return opts.sort((a, b) => {
      const an = parseInt(a.label, 10);
      const bn = parseInt(b.label, 10);
      if (isNaN(an) && isNaN(bn)) return 0;
      if (isNaN(an)) return 1;
      if (isNaN(bn)) return -1;
      return bn - an;
    });
  });

  const currentQualityLabel = computed(() => {
    if (!canSelectQuality.value) return '';
    if (selectedQuality.value === 'auto') return 'AUTO';
    const opt = qualityOptions.value.find(q => String(q.value) === selectedQuality.value);
    return opt ? opt.label : '';
  });

  const qualityOptionsWithAuto = computed(() => [{ value: 'auto', label: 'อัตโนมัติ' }, ...qualityOptions.value]);

  const volumeLevel = computed(() => {
    if (isMuted.value || volume.value === 0) return 'muted';
    if (volume.value <= 0.3) return 'low';
    if (volume.value <= 0.6) return 'medium';
    return 'high';
  });

  const timeText = computed(() => `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`);
  const progressPercent = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0));
  const seekPreviewPercent = computed(() => (duration.value && seekingTime.value != null ? (seekingTime.value / duration.value) * 100 : 0));
  
  const bufferedPercentage = computed(() => {
    if (!videoEl.value || !duration.value) return 0;
    try {
      const buffered = videoEl.value.buffered;
      if (buffered.length > 0) {
        const bufferedEnd = buffered.end(buffered.length - 1);
        return (bufferedEnd / duration.value) * 100;
      }
    } catch (err) {
      // ignore buffer errors
    }
    return 0;
  });

  const containerStyle = computed(() => {
    if (isCustomFullscreen.value) {
      return {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: 9999,
        backgroundColor: 'black'
      };
    }
    return computedStyle.value;
  });

  // Using SecureStreamManager for all token operations
  // Token generation, verification, and stream key creation are now handled by secureManager

  // Service Worker functions (using SecureStreamManager)
  async function registerStreamInterceptor() {
    const success = await secureManager.registerStreamInterceptor();
    serviceWorkerActive.value = secureManager.isServiceWorkerActive;
    
    if (success) {
      // Listen for chunk interception events
      secureManager.on('chunkIntercepted', (data) => {
        console.log('� [SW] Standard chunk intercepted:', data);
        interceptedRequests.value.push({
          ...data,
          interceptedAt: Date.now()
        });
        chunkCount.value++;
        totalChunksRequested.value++;
      });
      
      secureManager.on('secureChunkIntercepted', (data) => {
        console.log('� [SW] Secure chunk intercepted:', data);
        interceptedRequests.value.push({
          ...data,
          interceptedAt: Date.now(),
          secure: true
        });
        chunkCount.value++;
        totalChunksRequested.value++;
      });
      
      // Limit stored requests
      secureManager.on('chunkIntercepted', () => {
        if (interceptedRequests.value.length > 50) {
          interceptedRequests.value = interceptedRequests.value.slice(-50);
        }
      });
      
      secureManager.on('secureChunkIntercepted', () => {
        if (interceptedRequests.value.length > 50) {
          interceptedRequests.value = interceptedRequests.value.slice(-50);
        }
      });
    }
    
    return success;
  }

  async function unregisterStreamInterceptor() {
    await secureManager.unregisterStreamInterceptor();
    serviceWorkerActive.value = false;
  }

  // updateSWSecureToken function is now handled by secureManager.updateSWSecureToken

  // MediaSource API functions
  async function initializeMediaSource(videoUrl) {
    if (!window.MediaSource) {
      console.warn('MediaSource API not supported');
      return false;
    }

    try {
      // Get video info first
      const response = await fetch(videoUrl, { method: 'HEAD' });
      totalSize.value = parseInt(response.headers.get('content-length') || '0');
      
      console.log('🎬 [MediaSource] Video size:', totalSize.value, 'bytes');

      // Create MediaSource
      mediaSource.value = new MediaSource();
      const videoElement = videoEl.value;
      
      if (!videoElement) return false;

      videoElement.src = URL.createObjectURL(mediaSource.value);

      return new Promise((resolve) => {
        mediaSource.value.addEventListener('sourceopen', () => {
          console.log('🎬 [MediaSource] Source opened');
          
          // Add source buffer with better codec detection
          try {
            // Try different codec combinations
            const codecsToTry = [
              'video/mp4; codecs="avc1.42E01E,mp4a.40.2"',
              'video/mp4; codecs="avc1.64001E,mp4a.40.2"',
              'video/mp4; codecs="avc1.42001E,mp4a.40.2"',
              'video/mp4',
            ];
            
            let sourceBufferCreated = false;
            for (const codec of codecsToTry) {
              if (MediaSource.isTypeSupported(codec)) {
                console.log('🎬 [MediaSource] Using codec:', codec);
                sourceBuffer.value = mediaSource.value.addSourceBuffer(codec);
                sourceBufferCreated = true;
                break;
              }
            }
            
            if (!sourceBufferCreated) {
              throw new Error('No supported codec found');
            }
            
            sourceBuffer.value.addEventListener('updateend', () => {
              console.log('🎬 [MediaSource] Buffer updated');
              
              // Load next chunks automatically
              const currentChunk = Math.floor(loadedChunks.value.size);
              preloadNextChunks(currentChunk, 2);
            });
            
            sourceBuffer.value.addEventListener('error', (e) => {
              console.error('🎬 [MediaSource] Source buffer error:', e);
            });
            
            resolve(true);
          } catch (error) {
            console.error('🎬 [MediaSource] Failed to add source buffer:', error);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error('🎬 [MediaSource] Initialization failed:', error);
      return false;
    }
  }

  async function loadChunk(chunkIndex) {
    if (!sourceBuffer.value || loadedChunks.value.has(chunkIndex)) {
      return;
    }

    const start = chunkIndex * chunkSize.value;
    const end = Math.min(start + chunkSize.value - 1, totalSize.value - 1);
    
    if (start >= totalSize.value) return;

    const streamKey = generateStreamKey();
    const videoUrl = props.src;
    const urlWithStream = addStreamKeyToUrl(videoUrl, streamKey);

    console.log(`🔑 [MediaSource] Loading chunk ${chunkIndex} with stream key: ${streamKey}`);
    console.log(`📊 [MediaSource] Range: bytes=${start}-${end}`);
    console.log(`🌐 [MediaSource] URL with stream: ${urlWithStream}`);

    try {
      // Use original fetch to ensure it bypasses our interceptors
      const response = await originalFetch(urlWithStream, {
        headers: {
          'Range': `bytes=${start}-${end}`,
          'x-stream-key': streamKey
        }
      });

      if (response.status === 206) {
        const arrayBuffer = await response.arrayBuffer();
        
        chunkCount.value++;
        loadedChunks.value.add(chunkIndex);
        
        // Track chunk request
        chunkRequests.value.push({
          type: 'mediasource-chunk',
          chunkIndex: chunkIndex,
          range: `${start}-${end}`,
          streamKey: streamKey,
          url: urlWithStream,
          timestamp: Date.now(),
          size: arrayBuffer.byteLength
        });
        totalChunksRequested.value++;

        // Append to source buffer
        if (!sourceBuffer.value.updating) {
          sourceBuffer.value.appendBuffer(arrayBuffer);
        }

        // Emit chunk event
        if (emit) {
          emit('chunk-request', {
            chunkIndex,
            streamKey,
            range: `${start}-${end}`,
            url: urlWithStream,
            timestamp: Date.now()
          });
        }

        console.log(`✅ [MediaSource] Chunk ${chunkIndex} loaded successfully`);
      } else {
        console.error(`❌ [MediaSource] Failed to load chunk ${chunkIndex}:`, response.status);
      }
    } catch (error) {
      console.error(`❌ [MediaSource] Error loading chunk ${chunkIndex}:`, error);
    }
  }

  function preloadNextChunks(currentChunk, count = 3) {
    for (let i = 1; i <= count; i++) {
      const nextChunk = currentChunk + i;
      if (!loadedChunks.value.has(nextChunk)) {
        loadChunk(nextChunk);
      }
    }
  }

  // Network request interceptor for chunk detection
  const originalFetch = window.fetch;
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  let networkInterceptorsInstalled = false;

  // Generate random stream key for chunk requests
  function generateStreamKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Add stream key to URL
  function addStreamKeyToUrl(url, streamKey) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('stream', streamKey);
      return urlObj.toString();
    } catch (error) {
      console.warn('Failed to add stream key to URL:', error);
      return url + (url.includes('?') ? '&' : '?') + `stream=${streamKey}`;
    }
  }

  // Session Management Functions
  const SESSION_STORAGE_KEY = 'video_session_id';
  const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  function generateSessionKey() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}_${random}`;
  }

  function createNewSession() {
    const sessionId = generateSessionKey();
    const createdAt = Date.now();
    const expiresAt = createdAt + SESSION_DURATION;
    
    const sessionData = {
      id: sessionId,
      createdAt: createdAt,
      expiresAt: expiresAt
    };
    
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      currentSessionId.value = sessionId;
      sessionCreatedAt.value = createdAt;
      sessionExpiresAt.value = expiresAt;
      
      console.log('🔑 [Player] Created new session ID:', sessionId);
      console.log('🔑 [Player] Session expires at:', new Date(expiresAt));
      
      return sessionId;
    } catch (error) {
      console.error('🔑 [Player] Error saving session to storage:', error);
      return sessionId; // Return anyway, just without persistence
    }
  }

  function refreshSessionOnPlay() {
    // Create new session every time play is triggered
    console.log('🎬 [Player] Play triggered - creating new session');
    return createNewSession();
  }

  // Add stream parameter to URL
  function addStreamParamToUrl(url, streamKey) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('stream', streamKey);
      return urlObj.toString();
    } catch (error) {
      // If URL parsing fails, append manually
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}stream=${streamKey}`;
    }
  }

  function installNetworkInterceptors() {
    if (networkInterceptorsInstalled) return;
    networkInterceptorsInstalled = true;
    
    console.log('🔧 [NETWORK] Installing network interceptors for chunk detection and stream key injection');

    // Intercept fetch requests
    window.fetch = function(...args) {
      const [url, options] = args;
      
      console.log('🌐 [FETCH INTERCEPT] Request to:', url);
      
      // Check if this is a video chunk request or range request
      const isVideoChunk = isVideoChunkRequest(url);
      const isRange = isRangeRequest(url, options);
      
      console.log('🔍 [FETCH INTERCEPT] isVideoChunk:', isVideoChunk, 'isRange:', isRange);
      
      if (isVideoChunk || isRange) {
        // Generate stream key for this chunk request
        const streamKey = generateStreamKey();
        
        // Add stream parameter to URL
        const modifiedUrl = addStreamParamToUrl(url, streamKey);
        
        // Add x-stream-key header to options
        const modifiedOptions = { ...options };
        if (!modifiedOptions.headers) {
          modifiedOptions.headers = {};
        }
        
        // Convert Headers object to plain object if needed
        if (modifiedOptions.headers instanceof Headers) {
          const headersObj = {};
          modifiedOptions.headers.forEach((value, key) => {
            headersObj[key] = value;
          });
          modifiedOptions.headers = headersObj;
        }
        
        modifiedOptions.headers['x-stream-key'] = streamKey;
        
        console.log(`🔑 [FETCH] Adding stream key: ${streamKey} to chunk request URL: ${modifiedUrl}`);
        
        logChunkRequest('FETCH', modifiedUrl, modifiedOptions, { isRange, streamKey });
        chunkRequests.value.push({
          type: 'fetch',
          url: modifiedUrl,
          originalUrl: url,
          timestamp: Date.now(),
          method: modifiedOptions?.method || 'GET',
          isRangeRequest: isRange,
          streamKey: streamKey,
          headers: modifiedOptions?.headers || {}
        });
        totalChunksRequested.value++;
        
        // Use modified URL and options with stream key
        return originalFetch.apply(this, [modifiedUrl, modifiedOptions]);
      }
      
      return originalFetch.apply(this, args);
    };

    // Intercept XMLHttpRequest
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._requestUrl = url;
      this._requestMethod = method;
      
      console.log('🌐 [XHR INTERCEPT] Request to:', url);
      
      const isVideoChunk = isVideoChunkRequest(url);
      
      console.log('🔍 [XHR INTERCEPT] isVideoChunk:', isVideoChunk);
      
      if (isVideoChunk) {
        // Generate stream key for XHR chunk request
        this._streamKey = generateStreamKey();
        
        // Add stream parameter to URL
        const modifiedUrl = addStreamParamToUrl(url, this._streamKey);
        this._modifiedUrl = modifiedUrl;
        
        console.log(`🔑 [XHR] Generated stream key: ${this._streamKey} for chunk request URL: ${modifiedUrl}`);
        
        logChunkRequest('XHR', modifiedUrl, { method, streamKey: this._streamKey });
        chunkRequests.value.push({
          type: 'xhr',
          url: modifiedUrl,
          originalUrl: url,
          timestamp: Date.now(),
          method: method,
          streamKey: this._streamKey
        });
        totalChunksRequested.value++;
        
        // Use modified URL for the actual request
        return originalXHROpen.call(this, method, modifiedUrl, ...args);
      }
      
      return originalXHROpen.call(this, method, url, ...args);
    };

    // Override setRequestHeader to catch Range headers and add stream key
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
      // Check for Range header
      if (name.toLowerCase() === 'range' && this._requestUrl && isVideoChunkRequest(this._requestUrl)) {
        const requestUrl = this._modifiedUrl || this._requestUrl;
        
        console.log('🎬 [XHR] RANGE REQUEST DETECTED:', {
          originalUrl: this._requestUrl,
          modifiedUrl: requestUrl,
          method: this._requestMethod,
          rangeHeader: value,
          streamKey: this._streamKey,
          timestamp: new Date().toISOString()
        });
        
        // Update existing request or add new one
        chunkRequests.value.push({
          type: 'xhr-range',
          url: requestUrl,
          originalUrl: this._requestUrl,
          timestamp: Date.now(),
          method: this._requestMethod,
          rangeHeader: value,
          streamKey: this._streamKey
        });
        totalChunksRequested.value++;
        
        if (emit) {
          emit('range-request', {
            url: this._modifiedUrl || this._requestUrl,
            originalUrl: this._requestUrl,
            method: this._requestMethod,
            rangeHeader: value,
            streamKey: this._streamKey,
            timestamp: Date.now()
          });
        }
      }
      
      return originalSetRequestHeader.call(this, name, value);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      // Auto-add stream key header for video chunk requests
      if (this._requestUrl && isVideoChunkRequest(this._requestUrl) && this._streamKey) {
        console.log(`🔑 [XHR] Auto-adding x-stream-key header: ${this._streamKey}`);
        originalSetRequestHeader.call(this, 'x-stream-key', this._streamKey);
      }
      
      return originalXHRSend.apply(this, args);
    };
  }

  function uninstallNetworkInterceptors() {
    if (!networkInterceptorsInstalled) return;
    networkInterceptorsInstalled = false;

    // Restore original functions
    window.fetch = originalFetch;
    XMLHttpRequest.prototype.open = originalXHROpen;
    XMLHttpRequest.prototype.send = originalXHRSend;
    // Note: setRequestHeader is restored when the page reloads or the interceptor is reinstalled
  }

  function isVideoChunkRequest(url) {
    if (typeof url !== 'string') return false;
    
    // Check for common video chunk patterns
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

  function isRangeRequest(url, options = {}) {
    // Check if this is a range request by looking at headers or URL
    if (options.headers) {
      const headers = options.headers;
      if (headers.Range || headers.range || headers['Range'] || headers['range']) {
        return true;
      }
    }
    
    // Check URL for range parameters
    if (url.includes('range=') || url.includes('bytes=')) {
      return true;
    }
    
    return false;
  }

  function logChunkRequest(type, url, options = {}, extra = {}) {
    const timestamp = new Date().toISOString();
    const chunkInfo = extractChunkInfo(url);
    const rangeInfo = extractRangeInfo(options);
    
    console.log(`🎬 [${timestamp}] VIDEO CHUNK REQUEST DETECTED:`, {
      type: type,
      url: url,
      method: options.method || 'GET',
      chunkNumber: chunkInfo.chunkNumber,
      segmentNumber: chunkInfo.segmentNumber,
      quality: chunkInfo.quality,
      isRangeRequest: extra.isRange || rangeInfo.hasRange,
      rangeHeader: rangeInfo.rangeHeader,
      rangeBytes: rangeInfo.rangeBytes,
      totalRequested: totalChunksRequested.value + 1
    });

    // Also emit event to parent component
    if (emit) {
      emit('chunk-request', {
        type: type.toLowerCase(),
        url: url,
        timestamp: Date.now(),
        chunkInfo: chunkInfo,
        rangeInfo: rangeInfo,
        isRangeRequest: extra.isRange || rangeInfo.hasRange,
        totalRequested: totalChunksRequested.value + 1
      });
    }
  }

  function extractRangeInfo(options = {}) {
    const info = {
      hasRange: false,
      rangeHeader: null,
      rangeBytes: null,
      startByte: null,
      endByte: null
    };

    // Check headers for Range
    if (options.headers) {
      const headers = options.headers;
      const rangeHeader = headers.Range || headers.range || headers['Range'] || headers['range'];
      
      if (rangeHeader) {
        info.hasRange = true;
        info.rangeHeader = rangeHeader;
        
        // Parse bytes=start-end
        const bytesMatch = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        if (bytesMatch) {
          info.startByte = parseInt(bytesMatch[1]);
          info.endByte = bytesMatch[2] ? parseInt(bytesMatch[2]) : null;
          info.rangeBytes = `${info.startByte}-${info.endByte || ''}`;
        }
      }
    }

    return info;
  }

  function extractChunkInfo(url) {
    const info = {
      chunkNumber: null,
      segmentNumber: null,
      quality: null,
      extension: null
    };

    // Extract chunk/segment number
    const chunkMatch = url.match(/(?:chunk|segment)[-_]?(\d+)/i);
    if (chunkMatch) {
      info.chunkNumber = parseInt(chunkMatch[1]);
      info.segmentNumber = parseInt(chunkMatch[1]);
    }

    // Extract file extension
    const extMatch = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
    if (extMatch) {
      info.extension = extMatch[1];
    }

    // Extract quality indicators
    const qualityMatch = url.match(/(\d{3,4}p|\d+x\d+|\d+k)/i);
    if (qualityMatch) {
      info.quality = qualityMatch[1];
    }

    return info;
  }

  // Computed poster - ใช้ cover URL หรือ poster หรือ auto cover
  const computedPoster = computed(() => {
    if (coverUrl.value) return coverUrl.value;
    if (poster.value) return poster.value;
    if (autoCover.value && autoCoverUrl.value) return autoCoverUrl.value;
    return '';
  });

  // Picture-in-Picture support check
  const canPictureInPicture = computed(() => {
    return document.pictureInPictureEnabled && 
           videoEl.value && 
           !videoEl.value.disablePictureInPicture;
  });

  // Function to extract cover from video
  async function extractCoverFromVideo() {
    const video = videoEl.value;
    if (!video || !autoCover.value) return;

    isCoverLoading.value = true;
    
    try {
      // Wait for video metadata to load
      if (video.readyState < 1) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            reject(new Error('Timeout waiting for video metadata'));
          }, 5000);
          
          const onLoadedMetadata = () => {
            clearTimeout(timeout);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            resolve();
          };
          video.addEventListener('loadedmetadata', onLoadedMetadata);
        });
      }

      // Check if video has valid dimensions
      if (!video.videoWidth || !video.videoHeight) {
        console.warn('Video has no valid dimensions for cover extraction');
        return;
      }

      // Create canvas and extract frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Save original time and seek to a good frame
      const originalTime = video.currentTime;
      const seekTime = Math.min(Math.max(1, video.duration * 0.1), 5); // Between 1-5 seconds
      
      if (video.currentTime !== seekTime) {
        video.currentTime = seekTime;
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            video.removeEventListener('seeked', onSeeked);
            reject(new Error('Timeout waiting for video seek'));
          }, 3000);
          
          const onSeeked = () => {
            clearTimeout(timeout);
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked);
        });
      }

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob URL with better quality
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          autoCoverUrl.value = url;
          isCoverLoaded.value = true;
          console.log('Auto cover extracted successfully', {
            width: canvas.width,
            height: canvas.height,
            size: Math.round(blob.size / 1024) + 'KB'
          });
        }
        isCoverLoading.value = false;
      }, 'image/jpeg', 0.85);

      // Restore original time
      if (originalTime !== seekTime) {
        video.currentTime = originalTime;
      }
    } catch (error) {
      console.warn('Failed to extract auto cover:', error.message);
      isCoverLoading.value = false;
    }
  }

  // Core behaviors
  function setup(customSrc = null) {
    const video = videoEl.value;
    const srcToUse = customSrc || props.src;
    if (!video || !srcToUse) return;

    destroy();
    
    // เซ็ต current video source สำหรับ cookie tracking
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('currentVideoSrc', srcToUse);
    }

    const isHls = srcToUse.includes('.m3u8') || srcToUse.includes('application/vnd.apple.mpegurl');

    // Register Service Worker for network interception
    registerStreamInterceptor();

    if (Hls.isSupported() && isHls) {
      // Install network interceptors for chunk detection
      installNetworkInterceptors();
      
      hls.value = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.value.loadSource(srcToUse);
      hls.value.attachMedia(video);

      const onReadyAutoplay = async () => {
        if (props.autoplay) {
          try {
            await video.play();
            console.log('Autoplay started successfully');
          } catch (error) {
            console.warn('Autoplay failed, user interaction required:', error.message);
            // แสดง UI hint ให้ user กดเล่น
            emit('autoplay-blocked', { 
              reason: error.message,
              requiresUserInteraction: true 
            });
          }
        }
      };

      hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
        levels.value = hls.value.levels || [];
        onReadyAutoplay();
        // Extract cover after manifest is parsed
        if (autoCover.value && !computedPoster.value) {
          extractCoverFromVideo();
        }
        // Emit ready event to parent for HLS
        if (emit) {
          emit('ready', {
            duration: video.duration || 0,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            levels: levels.value
          });
        }
      });
      hls.value.on(Hls.Events.LEVEL_LOADED, () => {
        levels.value = hls.value.levels || [];
      });

      // HLS-specific chunk detection events
      hls.value.on(Hls.Events.FRAG_LOADING, (event, data) => {
        console.log('🎬 [HLS] FRAGMENT LOADING:', {
          url: data.frag.url,
          level: data.frag.level,
          sn: data.frag.sn,
          duration: data.frag.duration,
          start: data.frag.start,
          timestamp: new Date().toISOString()
        });
        
        chunkRequests.value.push({
          type: 'hls-fragment',
          url: data.frag.url,
          timestamp: Date.now(),
          level: data.frag.level,
          sequenceNumber: data.frag.sn,
          duration: data.frag.duration
        });
        totalChunksRequested.value++;

        if (emit) {
          emit('hls-fragment-loading', {
            url: data.frag.url,
            level: data.frag.level,
            sequenceNumber: data.frag.sn,
            duration: data.frag.duration,
            totalRequested: totalChunksRequested.value
          });
        }
      });

      hls.value.on(Hls.Events.FRAG_LOADED, (event, data) => {
        console.log('✅ [HLS] FRAGMENT LOADED:', {
          url: data.frag.url,
          level: data.frag.level,
          sn: data.frag.sn,
          loadTime: data.stats.loading.end - data.stats.loading.start,
          size: data.stats.total,
          timestamp: new Date().toISOString()
        });

        if (emit) {
          emit('hls-fragment-loaded', {
            url: data.frag.url,
            level: data.frag.level,
            sequenceNumber: data.frag.sn,
            loadTime: data.stats.loading.end - data.stats.loading.start,
            size: data.stats.total
          });
        }
      });

      hls.value.on(Hls.Events.ERROR, (event, data) => emit && emit('error', data));
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Install network interceptors for Safari HLS
      installNetworkInterceptors();
      video.src = srcToUse; // Native HLS (Safari)
      video.addEventListener('loadedmetadata', () => {
        if (props.autoplay) video.play().catch(() => {});
        // Extract cover for Safari
        if (autoCover.value && !computedPoster.value) {
          setTimeout(() => extractCoverFromVideo(), 500);
        }
        // Emit ready event to parent
        if (emit) {
          emit('ready', {
            duration: video.duration || 0,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight
          });
        }
      }, { once: true });
      video.addEventListener('error', (e) => emit && emit('error', e));
    } else {
      // Install network interceptors for range-based streaming
      installNetworkInterceptors();
      video.src = srcToUse; // Fallback
      video.addEventListener('loadedmetadata', () => {
        // Extract cover for regular video
        if (autoCover.value && !computedPoster.value) {
          setTimeout(() => extractCoverFromVideo(), 500);
        }
      }, { once: true });
    }
  }

  function applyQuality() {
    if (!hls.value) return;
    const sel = selectedQuality.value;
    if (sel === 'auto') {
      hls.value.currentLevel = -1;
    } else {
      const idx = parseInt(sel, 10);
      if (!Number.isNaN(idx)) hls.value.currentLevel = idx;
    }
    emit && emit('quality-changed', selectedQuality.value);
  }

  function applySpeed() {
    const video = videoEl.value;
    if (!video) return;
    try {
      video.playbackRate = playbackRate.value;
      emit && emit('rate-changed', playbackRate.value);
    } catch (err) {
      // ignore playbackRate set errors
    }
  }

  // Event bindings
  function bindVideoEvents() {
    const v = videoEl.value;
    if (!v) return;
    v.addEventListener('timeupdate', onTimeUpdate);
    v.addEventListener('durationchange', onDurationChange);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('volumechange', onVideoVolumeChange);
    v.addEventListener('ended', onEnded);
    v.addEventListener('enterpictureinpicture', onEnterPiP);
    v.addEventListener('leavepictureinpicture', onLeavePiP);
    
    // Loading events
    v.addEventListener('loadstart', onLoadStart);
    v.addEventListener('loadeddata', onLoadedData);
    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('playing', onPlaying);
    v.addEventListener('seeking', onSeeking);
    v.addEventListener('seeked', onSeeked);
    v.addEventListener('progress', onProgress);
    
    // initialize
    onVideoVolumeChange();
  }

  function unbindVideoEvents() {
    const v = videoEl.value;
    if (!v) return;
    v.removeEventListener('timeupdate', onTimeUpdate);
    v.removeEventListener('durationchange', onDurationChange);
    v.removeEventListener('play', onPlay);
    v.removeEventListener('pause', onPause);
    v.removeEventListener('volumechange', onVideoVolumeChange);
    v.removeEventListener('ended', onEnded);
    v.removeEventListener('enterpictureinpicture', onEnterPiP);
    v.removeEventListener('leavepictureinpicture', onLeavePiP);
    
    // Loading events
    v.removeEventListener('loadstart', onLoadStart);
    v.removeEventListener('loadeddata', onLoadedData);
    v.removeEventListener('canplay', onCanPlay);
    v.removeEventListener('waiting', onWaiting);
    v.removeEventListener('playing', onPlaying);
    v.removeEventListener('seeking', onSeeking);
    v.removeEventListener('seeked', onSeeked);
    v.removeEventListener('progress', onProgress);
  }

  // Native event handlers
  let lastTimeUpdateEmit = 0;
  let lastTimeSaved = 0;
  function onTimeUpdate() { 
    const video = videoEl.value;
    if (!video) return;
    
    currentTime.value = video.currentTime || 0;
    
    // บันทึกเวลาเล่นล่าสุดทุก 10 วินาที
    const now = Date.now();
    if (now - lastTimeSaved >= 10000 && currentTime.value > 5) { // บันทึกทุก 10 วินาที และข้าม 5 วินาทีแรก
      lastTimeSaved = now;
      saveLastPlayedTimeToStorage(currentTime.value, props.src);
    }
    
    // MediaSource chunk preloading
    if (useMediaSource.value && totalSize.value > 0) {
      const currentChunk = Math.floor((currentTime.value / duration.value) * (totalSize.value / chunkSize.value));
      preloadNextChunks(currentChunk);
    }

    // Emit time-update event to parent (throttle to every 250ms for performance)
    if (emit && (now - lastTimeUpdateEmit >= 250)) {
      lastTimeUpdateEmit = now;
      emit('time-update', {
        currentTime: currentTime.value,
        duration: duration.value,
        progress: duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0,
        isPlaying: !video.paused,
        buffered: video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0
      });
    }
  }
  
  function onDurationChange() { 
    duration.value = videoEl.value?.duration || 0;
  }
  
  function onPlay() { 
    isPlaying.value = true;
    // Emit play event to parent
    if (emit) {
      emit('play', {
        currentTime: currentTime.value,
        duration: duration.value
      });
    }
  }

  function onPlaying() {
    // Video is now actively playing (not paused or waiting for data)
    const now = Date.now();
    console.log(`[UniversalPlayer] Video playing at ${currentTime.value}s, chunks detected: ${chunkCount.value}`);
    
    // Generate secure token for playing event and update Service Worker
    secureManager.generateSecureStreamKey().then(secureData => {
      console.log(`🎬 [PLAYING] NEW Secure stream key: ${secureData.streamKey}`);
      console.log(`🔐 [PLAYING] Token generated for playing event at ${new Date().toISOString()}`);
      
      // Update Service Worker with the new secure token
      secureManager.updateSWSecureToken(secureData);
    }).catch(error => {
      console.error('❌ Failed to generate secure token for playing event:', error);
    });
    
    // Check if this follows a waiting period (potential chunk load completion)
    if (lastWaitingTime.value && (now - lastWaitingTime.value) < 2000) {
      // Generate secure token for chunk completion
      secureManager.generateSecureStreamKey().then(secureData => {
        console.log(`[UniversalPlayer] Playing resumed after ${now - lastWaitingTime.value}ms wait - chunk loaded with NEW secure token`);
        console.log(`🔐 [TOKEN] NEW Secure stream key: ${secureData.streamKey} at ${new Date().toISOString()}`);
        
        chunkCount.value++;
        lastWaitingTime.value = 0;
        
        // Emit chunk completion event with secure token
        if (emit) {
          emit('video-resumed-after-chunk', {
            resumeDelay: now - lastWaitingTime.value,
            chunkStreamKey: secureData.streamKey,
            secureToken: secureData.token,
            sessionId: secureData.sessionId,
            timestamp: now
          });
        }
      }).catch(error => {
        console.error('Failed to generate secure token:', error);
        // Fallback to simple key
        const fallbackKey = Math.random().toString(36).substring(2, 15);
        console.log(`[UniversalPlayer] Using fallback key: ${fallbackKey}`);
      });
    }
  }
  
  function onPause() { 
    isPlaying.value = false;
    // Emit pause event to parent
    if (emit) {
      emit('pause', {
        currentTime: currentTime.value,
        duration: duration.value
      });
    }
  }
  
  function onEnded() { 
    isPlaying.value = false;
    
    // ล้าง last played time เมื่อวิดีโอจบ
    if (typeof localStorage !== 'undefined' && props.src) {
      try {
        const key = `lastPlayed_${btoa(props.src)}`;
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Error clearing last played time:', error);
      }
    }
    
    // Emit stop event to parent (when video ends)
    if (emit) {
      emit('stop', {
        currentTime: currentTime.value,
        duration: duration.value
      });
    }
  }
  
  function onVideoVolumeChange() {
    const v = videoEl.value; if (!v) return;
    volume.value = v.volume; isMuted.value = v.muted || v.volume === 0;
  }

  // Picture-in-Picture event handlers
  function onEnterPiP() {
    isPictureInPicture.value = true;
    emit('enter-pip');
  }

  function onLeavePiP() {
    isPictureInPicture.value = false;
    emit('leave-pip');
  }

  // Loading event handlers
  function onLoadStart() {
    isLoading.value = true;
    loadingProgress.value = 0;
    emit('loadstart');
  }

  function onLoadedData() {
    isLoading.value = false;
    emit('loadeddata');
  }

  function onCanPlay() {
    isLoading.value = false;
    emit('canplay');
  }

  function onWaiting() {
    isBuffering.value = true;
    
    const v = videoEl.value;
    if (v) {
      // Generate stream key for expected chunk request
      const expectedStreamKey = generateStreamKey();
      
      console.log('⏸️ [WAITING] Video waiting for data - chunk loading expected:', {
        currentTime: v.currentTime.toFixed(2) + 's',
        bufferedEnd: v.buffered.length > 0 ? v.buffered.end(v.buffered.length - 1).toFixed(2) + 's' : '0s',
        expectedStreamKey: expectedStreamKey,
        timestamp: new Date().toISOString()
      });

      // Store waiting time for later detection
      lastWaitingTime.value = Date.now();

      if (emit) {
        emit('video-waiting-for-chunk', {
          currentTime: v.currentTime,
          bufferedEnd: v.buffered.length > 0 ? v.buffered.end(v.buffered.length - 1) : 0,
          expectedStreamKey: expectedStreamKey,
          timestamp: Date.now()
        });
      }
    }
    
    emit('waiting');
  }

  async function onSeeking() {
    isBuffering.value = true;
    isSeeking.value = true;
    
    console.log('🎯 [SEEKING] Video seeking started - generating fresh token');
    
    // Generate fresh token when seeking starts (chunk requests will need it)
    try {
      const freshToken = await secureManager.generateSecureStreamKey();
      await secureManager.updateSWSecureToken(freshToken);
      console.log(`🔑 [SEEKING-TOKEN] Fresh token generated: ${freshToken.streamKey}`);
    } catch (error) {
      console.error('❌ [SEEKING-TOKEN] Failed to generate token during seeking:', error);
    }
    
    emit('seeking');
  }

  async function onSeeked() {
    isBuffering.value = false;
    isSeeking.value = false;
    
    console.log('✅ [SEEKED] Video seek completed - ensuring fresh token');
    
    // Generate another fresh token after seek completes (in case chunks are loaded after seek)
    try {
      const freshToken = await secureManager.generateSecureStreamKey();
      await secureManager.updateSWSecureToken(freshToken);
      console.log(`🔑 [SEEKED-TOKEN] Fresh token after seek: ${freshToken.streamKey}`);
    } catch (error) {
      console.error('❌ [SEEKED-TOKEN] Failed to generate token after seek:', error);
    }
    
    emit('seeked');
  }

  function onProgress() {
    const v = videoEl.value;
    if (!v) return;
    
    if (v.buffered.length > 0) {
      const currentBufferedEnd = v.buffered.end(v.buffered.length - 1);
      const currentTime = v.currentTime;
      const remaining = currentBufferedEnd - currentTime;
      
      // Check if buffer increased (new chunk loaded)
      if (currentBufferedEnd > lastBufferedEnd.value) {
        const newDataLoaded = currentBufferedEnd - lastBufferedEnd.value;
        console.log('📊 [PROGRESS] New chunk data loaded:', {
          previousBufferedEnd: lastBufferedEnd.value.toFixed(2) + 's',
          currentBufferedEnd: currentBufferedEnd.toFixed(2) + 's',
          newDataLoaded: newDataLoaded.toFixed(2) + 's',
          remainingBuffer: remaining.toFixed(2) + 's',
          currentTime: currentTime.toFixed(2) + 's',
          timestamp: new Date().toISOString()
        });

        // Update tracking
        lastBufferedEnd.value = currentBufferedEnd;
        totalChunksRequested.value++;
        chunkCount.value++;
        
        // Generate secure token for this progress chunk
        secureManager.generateSecureStreamKey().then(secureData => {
          console.log(`🔑 [PROGRESS] NEW Secure stream key: ${secureData.streamKey}`);
          console.log(`🔐 [PROGRESS] Token generated for ${newDataLoaded.toFixed(2)}s of new data at ${new Date().toISOString()}`);
          
          // Add to chunk requests list
          chunkRequests.value.push({
            type: 'progress-chunk',
            bufferedEnd: currentBufferedEnd,
            newDataLoaded: newDataLoaded,
            streamKey: secureData.streamKey,
            secureToken: secureData.token,
            sessionId: secureData.sessionId,
            timestamp: Date.now()
          });
          
          // Emit progress chunk event
          if (emit) {
            emit('progress-chunk-loaded', {
              bufferedEnd: currentBufferedEnd,
              newDataLoaded: newDataLoaded,
              streamKey: secureData.streamKey,
              secureToken: secureData.token,
              sessionId: secureData.sessionId,
              remainingBuffer: remaining,
              currentTime: currentTime,
              timestamp: Date.now()
            });
          }
        }).catch(error => {
          console.error('❌ Failed to generate secure token for progress chunk:', error);
        });
      }

      // Predict next chunk loading
      if (remaining < 5 && remaining > 0) {
        console.log('⏳ [PREDICTION] Next chunk will load soon:', {
          remaining: remaining.toFixed(2) + 's',
          bufferedEnd: currentBufferedEnd.toFixed(2) + 's',
          currentTime: currentTime.toFixed(2) + 's',
          prediction: 'New chunk needed in < 5 seconds'
        });

        // Store prediction (avoid duplicates)
        const lastPrediction = chunkLoadingPredictions.value[chunkLoadingPredictions.value.length - 1];
        if (!lastPrediction || Date.now() - lastPrediction.timestamp > 2000) {
          chunkLoadingPredictions.value.push({
            predictedAt: Date.now(),
            currentTime: currentTime,
            bufferedEnd: currentBufferedEnd,
            remaining: remaining
          });

          if (emit) {
            emit('chunk-loading-prediction', {
              remaining: remaining,
              bufferedEnd: currentBufferedEnd,
              currentTime: currentTime,
              message: 'New chunk needed soon'
            });
          }
        }
      }
      
      loadingProgress.value = (currentBufferedEnd / v.duration) * 100;
    }
    emit('progress', { loadingProgress: loadingProgress.value });
  }

  // Public handlers for template
  function togglePlay() {
    const v = videoEl.value; 
    if (!v) return;
    
    if (v.paused) {
      play(); // ใช้ play() function ที่มีการเช็ค last played time
    } else {
      pause();
    }
  }

  // Additional control methods for parent component
  async function play() {
    const v = videoEl.value; 
    if (!v) {
      console.warn('Video element not found for play');
      return;
    }
    
    try {
      // Create new session ID every time play is triggered
      const sessionId = refreshSessionOnPlay();
      
      // Notify Service Worker about new session
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'NEW_SESSION',
          sessionId: sessionId
        });
      }
      
      // เช็ค cookie สำหรับเวลาเล่นล่าสุดก่อนเล่น
      const lastPlayedTime = getLastPlayedTimeFromCookie();
      
      await v.play();
      console.log('Video played successfully with session ID:', sessionId);
      
      // ถ้ามีเวลาเล่นล่าสุด ให้ jump ไปที่เวลานั้น
      if (lastPlayedTime && lastPlayedTime > 5) { // ข้าม 5 วินาทีแรก
        setTimeout(() => {
          jumpTo(lastPlayedTime);
          console.log(`Jumped to last played time: ${lastPlayedTime}s`);
        }, 500); // รอให้ video load พร้อมก่อน
      }
      
    } catch (error) {
      console.error('Error playing video:', error);
      if (emit) {
        emit('error', { 
          type: 'play', 
          message: error.message,
          requiresUserInteraction: error.name === 'NotAllowedError'
        });
      }
    }
  }

  function pause() {
    const v = videoEl.value; if (!v) return;
    v.pause();
  }

  function stop() {
    const v = videoEl.value; if (!v) return;
    v.pause();
    v.currentTime = 0;
  }

  async function jumpTo(time) {
    const v = videoEl.value; 
    if (!v) {
      console.warn('Video element not found for jumpTo');
      return;
    }
    
    const targetTime = Math.max(0, Math.min(time, v.duration || 0));
    const previousTime = v.currentTime;
    
    console.log(`🎯 [SEEK] Jumping from ${previousTime}s to ${targetTime}s`);
    
    // Generate fresh token before seeking (chunk requests will need it)
    try {
      const freshToken = await secureManager.generateSecureStreamKey();
      await secureManager.updateSWSecureToken(freshToken);
      console.log(`🔑 [SEEK-TOKEN] Fresh token generated for seek: ${freshToken.streamKey}`);
    } catch (error) {
      console.error('❌ [SEEK-TOKEN] Failed to generate token for seek:', error);
    }
    
    // ใช้ try-catch และ promise เพื่อจัดการ async behavior
    try {
      v.currentTime = targetTime;
      
      // รอให้ video seek เสร็จ
      const onSeeked = () => {
        v.removeEventListener('seeked', onSeeked);
        console.log(`Successfully jumped to ${v.currentTime}s`);
        
        // Emit seek event to parent
        if (emit) {
          emit('seek', {
            from: previousTime,
            to: targetTime,
            currentTime: v.currentTime,
            duration: v.duration || 0,
            progress: v.duration ? (v.currentTime / v.duration) * 100 : 0
          });
        }
      };
      
      v.addEventListener('seeked', onSeeked);
      
    } catch (error) {
      console.error('Error jumping to time:', error);
    }
  }

  async function changeSource(newSrc, options = {}) {
    if (!newSrc) return;
    
    const { useMediaSourceAPI = false } = options;
    
    // ทำลาย HLS instance เก่า
    if (hls.value) {
      hls.value.destroy();
      hls.value = null;
    }
    
    // ทำลาย MediaSource เก่า
    if (mediaSource.value) {
      mediaSource.value = null;
      sourceBuffer.value = null;
      loadedChunks.value.clear();
    }
    
    // รีเซ็ตสถานะ
    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
    levels.value = [];
    selectedQuality.value = 'auto';
    chunkCount.value = 0;
    totalChunksRequested.value = 0;
    chunkRequests.value = [];
    
    useMediaSource.value = useMediaSourceAPI;
    
    if (useMediaSourceAPI) {
      console.log('🎬 [MediaSource] Using MediaSource API for chunk control');
      const success = await initializeMediaSource(newSrc);
      if (success) {
        // Load first chunk
        await loadChunk(0);
        return;
      } else {
        console.warn('🎬 [MediaSource] Failed to initialize, falling back to regular setup');
        useMediaSource.value = false;
      }
    }
    
    // โหลด source ใหม่แบบปกติ
    setup(newSrc);
  }

  async function skipBackward() {
    const v = videoEl.value; if (!v) return;
    
    const newTime = Math.max(0, v.currentTime - 10);
    console.log(`⏪ [SKIP-BACK] Skipping back to ${newTime.toFixed(2)}s`);
    
    // Generate fresh token for skip back
    try {
      const freshToken = await secureManager.generateSecureStreamKey();
      await secureManager.updateSWSecureToken(freshToken);
      console.log(`🔑 [SKIP-BACK-TOKEN] Fresh token for skip back: ${freshToken.streamKey}`);
    } catch (error) {
      console.error('❌ [SKIP-BACK-TOKEN] Failed to generate token for skip back:', error);
    }
    
    v.currentTime = newTime;
  }

  async function skipForward() {
    const v = videoEl.value; if (!v) return;
    
    const newTime = Math.min(v.duration || 0, v.currentTime + 10);
    console.log(`⏩ [SKIP-FORWARD] Skipping forward to ${newTime.toFixed(2)}s`);
    
    // Generate fresh token for skip forward
    try {
      const freshToken = await secureManager.generateSecureStreamKey();
      await secureManager.updateSWSecureToken(freshToken);
      console.log(`🔑 [SKIP-FORWARD-TOKEN] Fresh token for skip forward: ${freshToken.streamKey}`);
    } catch (error) {
      console.error('❌ [SKIP-FORWARD-TOKEN] Failed to generate token for skip forward:', error);
    }
    
    v.currentTime = newTime;
  }

  async function onSeekInput(e) {
    const targetTime = parseFloat(e.target.value);
    seekingTime.value = targetTime;
    currentTime.value = targetTime;
    
    // Clear previous timeout
    if (seekTimeout) {
      clearTimeout(seekTimeout);
    }
    
    // Generate fresh token for seek operation
    console.log(`🎯 [SEEK-INPUT] Preparing to seek to ${targetTime.toFixed(2)}s`);
    
    try {
      const freshToken = await secureManager.generateSecureStreamKey();
      await secureManager.updateSWSecureToken(freshToken);
      console.log(`🔑 [SEEK-INPUT-TOKEN] Fresh token for seek input: ${freshToken.streamKey}`);
    } catch (error) {
      console.error('❌ [SEEK-INPUT-TOKEN] Failed to generate token for seek input:', error);
    }
    
    // Immediate visual feedback
    const v = videoEl.value;
    if (v) {
      // Debounce actual video seeking to reduce duplicate requests
      seekTimeout = setTimeout(() => {
        if (Math.abs(targetTime - lastSeekTime.value) > 0.5) { // Only seek if significant change
          v.currentTime = targetTime;
          lastSeekTime.value = targetTime;
          console.log(`🎯 [SEEK] Debounced seek to ${targetTime.toFixed(2)}s with fresh token`);
        }
      }, 100); // 100ms debounce
    }
  }

  function onSeekCommit() {
    const v = videoEl.value; if (!v) return;
    if (seekingTime.value != null) {
      const oldTime = v.currentTime;
      const targetTime = seekingTime.value;
      
      // Force immediate seek
      v.currentTime = targetTime;
      
      // Clear any pending buffer to ensure immediate response
      if (v.buffered.length > 0) {
        console.log('🔄 [SEEK] Clearing buffer for immediate seek response');
      }
      
      // Emit seek event to parent
      if (emit) {
        emit('seek', {
          from: oldTime,
          to: targetTime,
          duration: v.duration || 0,
          immediate: true
        });
      }
      
      console.log(`🎯 [SEEK] Seeking from ${oldTime.toFixed(2)}s to ${targetTime.toFixed(2)}s`);
    }
    seekingTime.value = null;
  }

  function toggleMute() {
    const v = videoEl.value; if (!v) return;
    v.muted = !v.muted; isMuted.value = v.muted;
  }

  function onVolumeChange(e) {
    const v = videoEl.value; if (!v) return;
    const newVolume = parseFloat(e.target.value);
    volume.value = newVolume; v.volume = newVolume; v.muted = newVolume === 0;
  }

  function setVolumeLevel(level) {
    const v = videoEl.value; if (!v) return;
    volume.value = level; v.volume = level; v.muted = level === 0;
    isMuted.value = level === 0;
  }

  function toggleFullscreen() {
    isCustomFullscreen.value = !isCustomFullscreen.value;
    isFullscreen.value = isCustomFullscreen.value;
    document.body.style.overflow = isCustomFullscreen.value ? 'hidden' : '';
  }

  // Picture-in-Picture controls
  async function togglePictureInPicture() {
    const v = videoEl.value;
    if (!v || !canPictureInPicture.value) return;

    try {
      if (isPictureInPicture.value) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Error toggling Picture-in-Picture:', error);
      emit('pip-error', error);
    }
  }

  async function enterPictureInPicture() {
    const v = videoEl.value;
    if (!v || !canPictureInPicture.value || isPictureInPicture.value) return;

    try {
      await v.requestPictureInPicture();
    } catch (error) {
      console.error('Error entering Picture-in-Picture:', error);
      emit('pip-error', error);
    }
  }

  async function exitPictureInPicture() {
    if (!isPictureInPicture.value) return;

    try {
      await document.exitPictureInPicture();
    } catch (error) {
      console.error('Error exiting Picture-in-Picture:', error);
      emit('pip-error', error);
    }
  }

  function onKeyDown(event) {
    const v = videoEl.value;
    if (!v) return;

    // ป้องกันการทำงานเมื่อ focus อยู่ใน input fields
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;

    switch (event.key) {
      case 'Escape':
        if (isCustomFullscreen.value) toggleFullscreen();
        break;
        
      case ' ': // Space bar
      case 'k': // YouTube style
        event.preventDefault();
        togglePlay();
        showUiTemporarily(); // แสดง UI เมื่อกด keyboard
        break;
        
      case 'ArrowLeft':
        event.preventDefault();
        jumpTo(Math.max(0, currentTime.value - 10)); // -10 seconds
        showUiTemporarily(); // แสดง UI เมื่อกด keyboard
        break;
        
      case 'ArrowRight':
        event.preventDefault();
        jumpTo(Math.min(duration.value, currentTime.value + 10)); // +10 seconds
        showUiTemporarily(); // แสดง UI เมื่อกด keyboard
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setVolumeLevel(Math.min(1, volume.value + 0.1)); // +10% volume
        showUiTemporarily(); // แสดง UI เมื่อกด keyboard
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        setVolumeLevel(Math.max(0, volume.value - 0.1)); // -10% volume
        showUiTemporarily(); // แสดง UI เมื่อกด keyboard
        break;
        
      case 'f':
      case 'F':
        event.preventDefault();
        toggleFullscreen();
        break;
        
      case 'm':
      case 'M':
        event.preventDefault();
        toggleMute();
        break;
        
      case 'j':
        event.preventDefault();
        jumpTo(Math.max(0, currentTime.value - 10)); // -10 seconds (YouTube style)
        break;
        
      case 'l':
        event.preventDefault();
        jumpTo(Math.min(duration.value, currentTime.value + 10)); // +10 seconds (YouTube style)
        break;
        
      case '0':
      case 'Home':
        event.preventDefault();
        jumpTo(0); // Jump to start
        break;
        
      case 'End':
        event.preventDefault();
        jumpTo(duration.value); // Jump to end
        break;
        
      // Number keys for percentage seeking
      case '1': case '2': case '3': case '4': case '5':
      case '6': case '7': case '8': case '9': {
        event.preventDefault();
        const percentage = parseInt(event.key) / 10;
        jumpTo(duration.value * percentage);
        break;
      }
      
      // Frame-by-frame seeking (comma and period)
      case ',':
        event.preventDefault();
        jumpTo(Math.max(0, currentTime.value - 1)); // -1 second
        break;
        
      case '.':
        event.preventDefault();
        jumpTo(Math.min(duration.value, currentTime.value + 1)); // +1 second
        break;
        
      // Playback speed controls
      case '<':
      case 'Shift,': {
        event.preventDefault();
        // Decrease speed (0.25x, 0.5x, 0.75x, 1x)
        const newSlowSpeed = Math.max(0.25, playbackRate.value - 0.25);
        playbackRate.value = newSlowSpeed;
        applySpeed();
        break;
      }
        
      case '>':
      case 'Shift.': {
        event.preventDefault();
        // Increase speed (1x, 1.25x, 1.5x, 2x)
        const newFastSpeed = Math.min(2, playbackRate.value + 0.25);
        playbackRate.value = newFastSpeed;
        applySpeed();
        break;
      }
    }
  }

  function selectQuality(quality) {
    selectedQuality.value = String(quality);
    applyQuality();
    showSettingsDropdown.value = false;
  }

  function selectSpeed(speed) {
    playbackRate.value = speed;
    applySpeed();
    showSpeedDropdown.value = false;
  }

  function showUiTemporarily() {
    uiVisible.value = true;
    if (uiTimer.value) clearTimeout(uiTimer.value);
    uiTimer.value = setTimeout(() => { uiVisible.value = false; }, 2000);
  }

  function hideUiAfterDelay() {
    if (uiTimer.value) clearTimeout(uiTimer.value);
    uiTimer.value = setTimeout(() => {
      uiVisible.value = false;
      closeAllDropdowns();
    }, 2000);
  }

  function closeAllDropdowns() {
    showQualityDropdown.value = false;
    showSpeedDropdown.value = false;
    showSettingsDropdown.value = false;
  }

  function destroy() {
    if (hls.value) {
      try { hls.value.destroy(); } catch (err) { /* ignore destroy errors */ }
      hls.value = null;
    }
    const video = videoEl.value;
    if (video) {
      try { video.pause(); video.removeAttribute('src'); video.load(); } catch (err) { /* ignore cleanup errors */ }
    }
    // Cleanup auto cover URL
    if (autoCoverUrl.value) {
      try { URL.revokeObjectURL(autoCoverUrl.value); } catch (err) { /* ignore revoke errors */ }
      autoCoverUrl.value = '';
    }
    
    // Cleanup network interceptors and chunk tracking
    uninstallNetworkInterceptors();
    chunkRequests.value = [];
    totalChunksRequested.value = 0;
    
    levels.value = [];
    selectedQuality.value = 'auto';
    isCoverLoaded.value = false;
    isCoverLoading.value = false;
    if (uiTimer.value) clearTimeout(uiTimer.value);
  }

  // Lifecycle
  watch(() => props.src, () => { 
    selectedQuality.value = 'auto'; 
    // Reset cover when source changes
    if (autoCoverUrl.value) {
      try { URL.revokeObjectURL(autoCoverUrl.value); } catch (err) { /* ignore */ }
      autoCoverUrl.value = '';
      isCoverLoaded.value = false;
      isCoverLoading.value = false;
    }
    setup(); 
  }, { immediate: true });
  watch(playbackRate, () => applySpeed());

  onMounted(async () => {
    // Ensure setup if immediate watcher missed
    if (!hls.value && props.src) setup();
    applySpeed();
    bindVideoEvents();
    document.addEventListener('keydown', onKeyDown);
    
    // Force clear Service Worker token cache on mount
    await secureManager.clearSWSecureToken();
    console.log('🔄 [MOUNT] Service Worker token cache cleared');
    
    // Generate fresh token on every mount
    try {
      const freshToken = await secureManager.generateSecureStreamKey();
      await secureManager.updateSWSecureToken(freshToken);
      console.log('🆕 [MOUNT] Fresh token generated and updated:', {
        streamKey: freshToken.streamKey,
        timestamp: new Date(freshToken.timestamp).toISOString()
      });
    } catch (error) {
      console.error('❌ [MOUNT] Failed to generate fresh token:', error);
    }
    
    // Auto-refresh token every 10 seconds (before 15s expiry)
    const tokenRefreshInterval = setInterval(async () => {
      try {
        const autoToken = await secureManager.generateSecureStreamKey();
        await secureManager.updateSWSecureToken(autoToken);
        console.log('🔄 [AUTO-REFRESH] Token auto-refreshed:', {
          streamKey: autoToken.streamKey,
          timestamp: new Date(autoToken.timestamp).toISOString()
        });
      } catch (error) {
        console.error('❌ [AUTO-REFRESH] Failed to auto-refresh token:', error);
      }
    }, 10000); // Every 10 seconds
    
    // Store interval for cleanup
    window.tokenRefreshInterval = tokenRefreshInterval;
    
    // Initialize chunk tracker when video element is ready
    if (videoEl.value) {
      chunkTracker.initializeTracking(videoEl.value); // ไม่ส่ง emit function
      
      // Listen for chunk tracker events และ emit เป็น Vue events ที่ประกาศแล้ว
      chunkTracker.on('progressChunkLoaded', (data) => {
        // Emit as chunk-request event ที่มีอยู่แล้ว
        if (emit) {
          emit('chunk-request', {
            type: 'progress-chunk',
            ...data
          });
        }
      });
      
      chunkTracker.on('chunkPrediction', (data) => {
        console.log('🔮 [PREDICTION] Next chunk predicted:', data.prediction);
      });
      
      console.log('🎯 [INIT] Chunk tracker initialized');
    }
  });

  onBeforeUnmount(() => {
    destroy();
    unbindVideoEvents();
    unregisterStreamInterceptor();
    
    // Clear token refresh interval
    if (window.tokenRefreshInterval) {
      clearInterval(window.tokenRefreshInterval);
      window.tokenRefreshInterval = null;
      console.log('🔄 [CLEANUP] Token refresh interval cleared');
    }
    
    // Cleanup managers
    chunkTracker.destroy();
    secureManager.unregisterStreamInterceptor();
    console.log('🧹 [CLEANUP] Managers cleaned up');
    
    if (isCustomFullscreen.value) document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeyDown);
  });

  return {
    // DOM
    videoEl,
    containerEl,

    // State
    hls,
    levels,
    selectedQuality,
    playbackRate,
    isPlaying,
    isMuted,
    volume,
    duration,
    currentTime,
    seekingTime,
    isFullscreen,
    isCustomFullscreen,
    isPictureInPicture,
    showQualityDropdown,
    showSpeedDropdown,
    showSettingsDropdown,
    uiVisible,
    isSeeking,
    isLoading,
    isBuffering,
    loadingProgress,
    
    // Cover/Poster state
    autoCoverUrl,
    isCoverLoaded,
    isCoverLoading,

    // Computed
    computedStyle,
    computedPoster,
    canSelectQuality,
    canPictureInPicture,
    qualityOptions,
    currentQualityLabel,
    qualityOptionsWithAuto,
    volumeLevel,
    timeText,
    progressPercent,
    seekPreviewPercent,
    bufferedPercentage,
    containerStyle,

    // Chunk tracking
    chunkRequests,
    totalChunksRequested,
    chunkCount,
    lastBufferedEnd,
    lastWaitingTime,
    chunkLoadingPredictions,

    // MediaSource API
    useMediaSource,
    mediaSource,
    sourceBuffer,
    chunkSize,
    totalSize,
    loadedChunks,

    // Service Worker
    serviceWorkerActive,
    interceptedRequests,

    // Secure Token Functions (via secureManager)
    // generateSecureStreamKey and updateSWSecureToken now available via secureManager

    // Methods
    togglePlay,
    play,
    pause,
    stop,
    jumpTo,
    changeSource,
    skipBackward,
    skipForward,
    onSeekInput,
    onSeekCommit,
    toggleMute,
    onVolumeChange,
    setVolumeLevel,
    toggleFullscreen,
    togglePictureInPicture,
    enterPictureInPicture,
    exitPictureInPicture,
    selectQuality,
    selectSpeed,
    showUiTemporarily,
    hideUiAfterDelay,
    closeAllDropdowns,
    formatTime,
    
    // Expose class instances for external use
    secureManager,
    chunkTracker
  };
}

// Cookie utilities for last played time
function getLastPlayedTimeFromCookie() {
  if (typeof document === 'undefined') return null;
  
  try {
    const currentVideoSrc = localStorage.getItem('currentVideoSrc');
    if (!currentVideoSrc) return null;
    
    const lastPlayedData = localStorage.getItem(`lastPlayed_${btoa(currentVideoSrc)}`);
    if (!lastPlayedData) return null;
    
    const data = JSON.parse(lastPlayedData);
    const now = Date.now();
    
    // เช็คว่าข้อมูลไม่เก่าเกิน 7 วัน
    if (now - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(`lastPlayed_${btoa(currentVideoSrc)}`);
      return null;
    }
    
    return data.time;
  } catch (error) {
    console.warn('Error reading last played time from localStorage:', error);
    return null;
  }
}

function saveLastPlayedTimeToStorage(time, videoSrc) {
  if (typeof document === 'undefined' || !videoSrc || time < 5) return;
  
  try {
    const key = `lastPlayed_${btoa(videoSrc)}`;
    const data = {
      time: time,
      timestamp: Date.now()
    };
    
    localStorage.setItem('currentVideoSrc', videoSrc);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Error saving last played time to localStorage:', error);
  }
}

function formatTime(t) {
  if (!isFinite(t)) return '0:00';
  const total = Math.max(0, Math.floor(t));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const two = (n) => (n < 10 ? '0' + n : '' + n);
  return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
}

export default useUniversalPlayer;
