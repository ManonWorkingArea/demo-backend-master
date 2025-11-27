<template>
  <div class="cmd-decryption-test p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">CMD - Video Player & Encryption/Decryption Tester</h2>
    
    <!-- Video Player Section -->
    <div class="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-md">
      <h3 class="text-lg font-medium text-gray-800 mb-4">Video Player</h3>
      
      <!-- Video Controls -->
      <div class="mb-4 flex flex-wrap gap-2">
        <button
          @click="toggleVideoPlay"
          class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          {{ isVideoPlaying ? 'หยุดชั่วคราว' : 'เล่น' }}
        </button>
        <button
          @click="changeVideoUrl"
          class="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          เปลี่ยน URL
        </button>
        <button
          @click="resetChunkCounter"
          class="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
        >
          Reset Chunks
        </button>
        <button
          @click="useMediaSourceAPI"
          class="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
        >
          Use MediaSource API
        </button>
        <button
          @click="testServiceWorker"
          class="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
        >
          Test Service Worker
        </button>
        <button
          @click="testWithoutServiceWorker"
          class="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
        >
          Test Without SW
        </button>
        <span class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm">
          สถานะ: {{ videoStatus }}
        </span>
        <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
          Chunks: {{ $refs.videoPlayer?.chunkCount || chunkRequestCount }}
        </span>
        <span v-if="$refs.videoPlayer?.serviceWorkerActive" class="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
          🔧 SW Active
        </span>
        <span v-if="$refs.videoPlayer?.interceptedRequests?.length > 0" class="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm">
          Intercepted: {{ $refs.videoPlayer.interceptedRequests.length }}
        </span>
      </div>

      <!-- Video URL Input -->
      <div v-if="showUrlInput" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Video URL:
        </label>
        <input
          type="url"
          v-model="newVideoUrl"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/video.mp4"
        >
        <div class="mt-2 flex gap-2">
          <button
            @click="applyNewVideoUrl"
            class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            ใช้ URL นี้
          </button>
          <button
            @click="showUrlInput = false"
            class="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
          >
            ยกเลิก
          </button>
        </div>
      </div>
      
      <div class="video-container">
        <UniversalPlayer
          ref="videoPlayer"
          :src="videoUrl"
          :height="400"
          :autoplay="false"
          :muted="true"
          :show-big-play-button="true"
          :show-quality-selector="true"
          :show-fullscreen-button="true"
          :show-pip-button="true"
          :show-skip-buttons="true"
          :theme-color="'#3b82f6'"
          :overlay-label="'CMD Test Video'"
          :overlay-subtitle="'Content Delivery API'"
          :show-overlay-label="true"
          :show-watermark="true"
          :watermark-title="'CMD'"
          :watermark-text="'Test Video'"
          :watermark-subtitle="'© 2024'"
          :watermark-opacity="'0.1'"
          @ready="onVideoReady"
          @play="onVideoPlay"
          @pause="onVideoPause"
          @error="onVideoError"
          @time-update="onVideoTimeUpdate"
          @chunk-request="onChunkRequest"
          @hls-fragment-loading="onHlsFragmentLoading"
          @hls-fragment-loaded="onHlsFragmentLoaded"
          @range-request="onRangeRequest"
          @progress-chunk-loaded="onProgressChunkLoaded"
          @chunk-loading-prediction="onChunkLoadingPrediction"
          @video-waiting-for-chunk="onVideoWaitingForChunk"
          @video-resumed-after-chunk="onVideoResumedAfterChunk"
        />
      </div>

      <!-- Chunk Tracking Information -->
      <div v-if="chunkRequestCount > 0 || ($refs.videoPlayer?.serviceWorkerActive)" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <h4 class="text-sm font-medium text-blue-800 mb-2">📡 Chunk Request Monitoring</h4>
        <div class="text-xs text-blue-700 space-y-1">
          <p><strong>Total Requests:</strong> {{ chunkRequestCount }}</p>
          <p v-if="lastChunkRequest"><strong>Last Request:</strong> {{ formatChunkInfo(lastChunkRequest) }}</p>
          <p v-if="hlsFragments.length > 0"><strong>HLS Segments:</strong> {{ hlsFragments.length }}</p>
          <p v-if="rangeRequests.length > 0"><strong>Range Requests:</strong> {{ rangeRequests.length }}</p>
          <p v-if="progressChunks.length > 0"><strong>Progress Chunks:</strong> {{ progressChunks.length }}</p>
          <p v-if="chunkPredictions.length > 0"><strong>Predictions:</strong> {{ chunkPredictions.length }}</p>
          <p v-if="waitingEvents.length > 0"><strong>Waiting Events:</strong> {{ waitingEvents.length }}</p>
        </div>
        
        <!-- Service Worker Status -->
        <div v-if="$refs.videoPlayer?.serviceWorkerActive" class="mt-3 pt-2 border-t border-blue-200">
          <h5 class="text-sm font-medium text-green-800 mb-1">🔧 Service Worker Status</h5>
          <div class="text-xs text-green-700 space-y-1">
            <p><strong>Status:</strong> ✅ Active & Intercepting</p>
            <p><strong>Intercepted Requests:</strong> {{ $refs.videoPlayer.interceptedRequests?.length || 0 }}</p>
            <p v-if="$refs.videoPlayer.interceptedRequests?.length > 0"><strong>Latest Stream Key:</strong> {{ $refs.videoPlayer.interceptedRequests[$refs.videoPlayer.interceptedRequests.length - 1]?.streamKey }}</p>
            <p><strong>Method:</strong> Service Worker Network Interception</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="space-y-4">
      <!-- Encryption Method Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          เลือกวิธีการเข้ารหัส:
        </label>
        <div class="flex space-x-4">
          <label class="inline-flex items-center">
            <input
              type="radio"
              v-model="encryptionMethod"
              value="aes"
              class="form-radio h-4 w-4 text-blue-600"
            >
            <span class="ml-2 text-sm text-gray-700">AES-CBC (CryptoJS)</span>
          </label>
          <label class="inline-flex items-center">
            <input
              type="radio"
              v-model="encryptionMethod"
              value="stream"
              class="form-radio h-4 w-4 text-blue-600"
            >
            <span class="ml-2 text-sm text-gray-700">Stream Cipher (Pure Python)</span>
          </label>
        </div>
      </div>

      <!-- Input for encrypted text -->
      <div>
        <label for="ciphertext" class="block text-sm font-medium text-gray-700 mb-2">
          กรอกรหัสที่เข้ามา (Base64 Ciphertext):
        </label>
        <textarea
          id="ciphertext"
          v-model="inputCiphertext"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="กรอกข้อความที่เข้ารหัสแล้ว เช่น kKpGC1dRLnyGM2IjJ+4uQZ3H9n1guWyJ+Q1q+vGVHv8="
        ></textarea>
      </div>

      <!-- Decrypt button -->
      <div>
        <button
          @click="decryptText"
          :disabled="!inputCiphertext.trim()"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          ถอดรหัส
        </button>
        <button
          @click="testWithSample"
          class="ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          ทดสอบด้วยตัวอย่าง
        </button>
        <button
          @click="generateSample"
          class="ml-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          สร้างตัวอย่าง
        </button>
      </div>

      <!-- Text input for encryption -->
      <div v-if="showEncryptSection">
        <label for="plaintext" class="block text-sm font-medium text-gray-700 mb-2">
          ข้อความที่ต้องการเข้ารหัส:
        </label>
        <textarea
          id="plaintext"
          v-model="inputPlaintext"
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="กรอกข้อความที่ต้องการเข้ารหัส"
        ></textarea>
        <button
          @click="encryptText"
          :disabled="!inputPlaintext.trim()"
          class="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          เข้ารหัส
        </button>
      </div>

      <!-- Result display -->
      <div v-if="result || error" class="mt-6">
        <h3 class="text-lg font-medium text-gray-800 mb-2">ผลลัพธ์:</h3>
        
        <div v-if="result" class="p-4 bg-green-50 border border-green-200 rounded-md">
          <p class="text-green-800">
            <strong>ข้อความที่ถอดรหัสได้:</strong> {{ result }}
          </p>
        </div>
        
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-md">
          <p class="text-red-800">
            <strong>เกิดข้อผิดพลาด:</strong> {{ error }}
          </p>
        </div>
      </div>

      <!-- Configuration display -->
      <div class="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 class="text-lg font-medium text-gray-800 mb-2">การตั้งค่าการเข้ารหัส:</h3>
        <div class="text-sm text-gray-600 space-y-1">
          <p><strong>Method:</strong> {{ encryptionMethod === 'aes' ? 'AES-CBC' : 'Stream Cipher' }}</p>
          <p><strong>Key:</strong> {{ keyDisplay }}</p>
          <p><strong>IV:</strong> {{ ivDisplay }}</p>
          <p v-if="encryptionMethod === 'aes'"><strong>Mode:</strong> CBC</p>
          <p v-if="encryptionMethod === 'aes'"><strong>Padding:</strong> PKCS7</p>
          <p v-if="encryptionMethod === 'stream'"><strong>Hash:</strong> SHA-256</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global CryptoJS */
import UniversalPlayer from '@/components/videoplayer/UniversalPlayer.vue'

export default {
  name: 'CMD',
  components: {
    UniversalPlayer
  },
  data() {
    return {
      // Video player data
      videoUrl: 'https://content-delivery-api.manonsanoi.workers.dev/api/stream/68bf95b2e1ebd077525fdeb9',
      newVideoUrl: '',
      showUrlInput: false,
      isVideoPlaying: false,
      videoStatus: 'หยุด',
      
      // Chunk tracking data
      chunkRequestCount: 0,
      lastChunkRequest: null,
      hlsFragments: [],
      rangeRequests: [],
      progressChunks: [],
      chunkPredictions: [],
      waitingEvents: [],
      
      // Encryption/decryption data
      inputCiphertext: '',
      inputPlaintext: '',
      result: '',
      error: '',
      key: null,
      iv: null,
      keyDisplay: 'my16charKey__123',
      ivDisplay: 'iv-1234567890-xyz',
      sampleCiphertext: 'kKpGC1dRLnyGM2IjJ+4uQZ3H9n1guWyJ+Q1q+vGVHv8=',
      encryptionMethod: 'aes', // 'aes' or 'stream'
      showEncryptSection: false
    }
  },
  mounted() {
    this.loadCryptoJS()
  },
  methods: {
    loadCryptoJS() {
      // Load CryptoJS if not already loaded
      if (typeof CryptoJS === 'undefined') {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js'
        script.onload = () => {
          this.initializeCrypto()
        }
        document.head.appendChild(script)
      } else {
        this.initializeCrypto()
      }
    },
    
    initializeCrypto() {
      try {
        this.key = CryptoJS.enc.Utf8.parse("my16charKey__123")
        this.iv = CryptoJS.enc.Utf8.parse("iv-1234567890-xyz")
      } catch (error) {
        this.error = 'ไม่สามารถเริ่มต้น CryptoJS ได้'
        console.error('CryptoJS initialization error:', error)
      }
    },
    
    // Stream cipher functions (Pure Python compatible)
    async createStreamCipher(keyStr, ivStr, length) {
      const cipherStream = new Uint8Array(length)
      let counter = 0
      let streamIndex = 0
      
      while (streamIndex < length) {
        // สร้าง hash จาก key + iv + counter (เหมือนกับ Python)
        const hashInput = `${keyStr}${ivStr}${counter}`
        const encoder = new TextEncoder()
        const hashBytes = await crypto.subtle.digest('SHA-256', encoder.encode(hashInput))
        const hashArray = new Uint8Array(hashBytes)
        
        // คัดลอก hash bytes ลงใน cipher stream
        for (let i = 0; i < hashArray.length && streamIndex < length; i++) {
          cipherStream[streamIndex] = hashArray[i]
          streamIndex++
        }
        counter++
      }
      
      return cipherStream
    },
    
    async streamEncrypt(text, keyStr, ivStr) {
      const encoder = new TextEncoder()
      const textBytes = encoder.encode(text)
      const cipherStream = await this.createStreamCipher(keyStr, ivStr, textBytes.length)
      
      // XOR กับ stream cipher
      const encrypted = new Uint8Array(textBytes.length)
      for (let i = 0; i < textBytes.length; i++) {
        encrypted[i] = textBytes[i] ^ cipherStream[i]
      }
      
      // แปลงเป็น Base64
      return btoa(String.fromCharCode(...encrypted))
    },
    
    async streamDecrypt(ciphertextB64, keyStr, ivStr) {
      // แปลง Base64 กลับเป็น bytes
      const binaryString = atob(ciphertextB64)
      const encrypted = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        encrypted[i] = binaryString.charCodeAt(i)
      }
      
      // สร้าง stream cipher เดียวกัน
      const cipherStream = await this.createStreamCipher(keyStr, ivStr, encrypted.length)
      
      // XOR กับ stream cipher (การถอดรหัสเหมือนกับการเข้ารหัส)
      const decrypted = new Uint8Array(encrypted.length)
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ cipherStream[i]
      }
      
      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    },
    
    decryptFromPython(base64Ciphertext) {
      if (!this.key || !this.iv) {
        throw new Error('CryptoJS ยังไม่ได้เริ่มต้น')
      }
      
      const decrypted = CryptoJS.AES.decrypt(base64Ciphertext, this.key, {
        iv: this.iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      
      return decrypted.toString(CryptoJS.enc.Utf8)
    },
    
    decryptText() {
      this.result = ''
      this.error = ''
      
      if (!this.inputCiphertext.trim()) {
        this.error = 'กรุณากรอกข้อความที่ต้องการถอดรหัส'
        return
      }
      
      try {
        if (this.encryptionMethod === 'aes') {
          // ใช้ AES decryption
          const plaintext = this.decryptFromPython(this.inputCiphertext.trim())
          
          if (!plaintext) {
            this.error = 'ไม่สามารถถอดรหัสได้ กรุณาตรวจสอบข้อมูลที่กรอก'
          } else {
            this.result = plaintext
          }
        } else {
          // ใช้ Stream cipher decryption
          this.streamDecrypt(this.inputCiphertext.trim(), this.keyDisplay, this.ivDisplay)
            .then(plaintext => {
              if (!plaintext) {
                this.error = 'ไม่สามารถถอดรหัสได้ กรุณาตรวจสอบข้อมูลที่กรอก'
              } else {
                this.result = plaintext
              }
            })
            .catch(error => {
              this.error = `เกิดข้อผิดพลาดในการถอดรหัส Stream Cipher: ${error.message}`
              console.error('Stream decryption error:', error)
            })
        }
      } catch (error) {
        this.error = `เกิดข้อผิดพลาดในการถอดรหัส: ${error.message}`
        console.error('Decryption error:', error)
      }
    },
    
    encryptText() {
      this.result = ''
      this.error = ''
      
      if (!this.inputPlaintext.trim()) {
        this.error = 'กรุณากรอกข้อความที่ต้องการเข้ารหัส'
        return
      }
      
      try {
        if (this.encryptionMethod === 'aes') {
          // ใช้ AES encryption
          if (!this.key || !this.iv) {
            this.error = 'CryptoJS ยังไม่ได้เริ่มต้น'
            return
          }
          
          const encrypted = CryptoJS.AES.encrypt(this.inputPlaintext.trim(), this.key, {
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          })
          
          this.result = `เข้ารหัสแล้ว: ${encrypted.toString()}`
          this.inputCiphertext = encrypted.toString()
        } else {
          // ใช้ Stream cipher encryption
          this.streamEncrypt(this.inputPlaintext.trim(), this.keyDisplay, this.ivDisplay)
            .then(ciphertext => {
              this.result = `เข้ารหัสแล้ว: ${ciphertext}`
              this.inputCiphertext = ciphertext
            })
            .catch(error => {
              this.error = `เกิดข้อผิดพลาดในการเข้ารหัส Stream Cipher: ${error.message}`
              console.error('Stream encryption error:', error)
            })
        }
      } catch (error) {
        this.error = `เกิดข้อผิดพลาดในการเข้ารหัส: ${error.message}`
        console.error('Encryption error:', error)
      }
    },
    
    generateSample() {
      this.showEncryptSection = !this.showEncryptSection
      if (this.showEncryptSection) {
        this.inputPlaintext = 'Hello from JavaScript!'
      }
    },
    
    testWithSample() {
      if (this.encryptionMethod === 'aes') {
        this.inputCiphertext = this.sampleCiphertext
      } else {
        // สร้างตัวอย่าง Stream cipher
        const sampleText = "Hello from Python!"
        this.streamEncrypt(sampleText, this.keyDisplay, this.ivDisplay)
          .then(ciphertext => {
            this.inputCiphertext = ciphertext
            this.result = `สร้างตัวอย่าง Stream Cipher จาก: "${sampleText}"`
          })
          .catch(error => {
            this.error = `เกิดข้อผิดพลาดในการสร้างตัวอย่าง: ${error.message}`
          })
        return
      }
      this.decryptText()
    },

    // Video player control methods
    toggleVideoPlay() {
      if (this.$refs.videoPlayer) {
        if (this.isVideoPlaying) {
          this.$refs.videoPlayer.pause()
        } else {
          this.$refs.videoPlayer.play()
        }
      }
    },
    
    changeVideoUrl() {
      this.newVideoUrl = this.videoUrl
      this.showUrlInput = true
    },
    
    applyNewVideoUrl() {
      if (this.newVideoUrl.trim()) {
        this.videoUrl = this.newVideoUrl.trim()
        this.showUrlInput = false
        this.videoStatus = 'กำลังโหลด...'
        
        // Change source using the player's method
        if (this.$refs.videoPlayer) {
          this.$refs.videoPlayer.changeSource(this.videoUrl)
        }
      }
    },

    // Video player event handlers
    onVideoReady(event) {
      console.log('Video ready:', event)
      this.videoStatus = 'พร้อม'
    },
    
    onVideoPlay(event) {
      console.log('Video playing:', event)
      this.isVideoPlaying = true
      this.videoStatus = 'กำลังเล่น'
    },
    
    onVideoPause(event) {
      console.log('Video paused:', event)
      this.isVideoPlaying = false
      this.videoStatus = 'หยุดชั่วคราว'
    },
    
    onVideoTimeUpdate() {
      // You can handle time updates here if needed
      // console.log('Time update:', arguments[0])
    },
    
    onVideoError(error) {
      console.error('Video error:', error)
      this.error = `Video error: ${error.message || 'Unknown video error'}`
      this.videoStatus = 'เกิดข้อผิดพลาด'
      this.isVideoPlaying = false
    },

    // Chunk tracking event handlers
    onChunkRequest(event) {
      this.chunkRequestCount++
      this.lastChunkRequest = event
      console.log('📦 [CMD] Chunk Request:', event)
    },

    onHlsFragmentLoading(event) {
      this.hlsFragments.push({
        ...event,
        status: 'loading'
      })
      console.log('📡 [CMD] HLS Fragment Loading:', event)
    },

    onHlsFragmentLoaded(event) {
      // Update existing fragment or add new one
      const existingIndex = this.hlsFragments.findIndex(f => 
        f.url === event.url && f.sequenceNumber === event.sequenceNumber
      )
      
      if (existingIndex >= 0) {
        this.hlsFragments[existingIndex] = {
          ...this.hlsFragments[existingIndex],
          ...event,
          status: 'loaded'
        }
      } else {
        this.hlsFragments.push({
          ...event,
          status: 'loaded'
        })
      }
      console.log('✅ [CMD] HLS Fragment Loaded:', event)
    },

    onRangeRequest(event) {
      this.chunkRequestCount++
      this.rangeRequests.push(event)
      this.lastChunkRequest = {
        ...event,
        type: 'range-request'
      }
      console.log('📊 [CMD] Range Request:', event)
    },

    formatChunkInfo(chunk) {
      if (!chunk || !chunk.url) return 'N/A'
      
      try {
        const url = new URL(chunk.url)
        const filename = url.pathname.split('/').pop() || 'unknown'
        const time = new Date(chunk.timestamp).toLocaleTimeString()
        
        if (chunk.rangeInfo && chunk.rangeInfo.hasRange) {
          return `${filename} (RANGE: ${chunk.rangeInfo.rangeBytes}) at ${time}`
        }
        
        return `${filename} (${chunk.type.toUpperCase()}) at ${time}`
      } catch (error) {
        console.warn('Invalid URL in chunk:', chunk.url, error)
        const time = new Date(chunk.timestamp).toLocaleTimeString()
        return `${chunk.url || 'unknown'} at ${time}`
      }
    },

    // Progress-based chunk detection event handlers
    onProgressChunkLoaded(event) {
      this.chunkRequestCount++
      this.progressChunks.push(event)
      this.lastChunkRequest = {
        ...event,
        type: 'progress-chunk'
      }
      console.log('📊 [CMD] Progress Chunk Loaded:', event)
    },

    onChunkLoadingPrediction(event) {
      this.chunkPredictions.push(event)
      console.log('⏳ [CMD] Chunk Loading Prediction:', event)
    },

    onVideoWaitingForChunk(event) {
      this.waitingEvents.push(event)
      console.log('⏸️ [CMD] Video Waiting for Chunk:', event)
    },

    onVideoResumedAfterChunk(event) {
      // Update the last waiting event with resume info
      if (this.waitingEvents.length > 0) {
        const lastWaiting = this.waitingEvents[this.waitingEvents.length - 1]
        lastWaiting.resumedAt = event.timestamp
        lastWaiting.waitDuration = event.timestamp - lastWaiting.timestamp
      }
      console.log('▶️ [CMD] Video Resumed After Chunk:', event)
    },

    resetChunkCounter() {
      this.chunkRequestCount = 0
      this.lastChunkRequest = null
      this.hlsFragments = []
      this.rangeRequests = []
      this.progressChunks = []
      this.chunkPredictions = []
      this.waitingEvents = []
      console.log('🔄 Chunk counter reset')
    },

    useMediaSourceAPI() {
      if (this.$refs.videoPlayer) {
        console.log('🎬 Switching to MediaSource API for full chunk control')
        this.videoStatus = 'กำลังเปลี่ยนไปใช้ MediaSource API...'
        
        // Use MediaSource API with current URL
        this.$refs.videoPlayer.changeSource(this.videoUrl, { useMediaSourceAPI: true })
      }
    },

    testServiceWorker() {
      if (this.$refs.videoPlayer) {
        console.log('🔧 Testing Service Worker interception')
        console.log('SW Active:', this.$refs.videoPlayer.serviceWorkerActive)
        console.log('Intercepted Requests:', this.$refs.videoPlayer.interceptedRequests?.length || 0)
        
        this.videoStatus = 'กำลังทดสอบ Service Worker...'
        
        // Reload video to trigger requests
        this.$refs.videoPlayer.changeSource(this.videoUrl)
      }
    },

    async testWithoutServiceWorker() {
      if (this.$refs.videoPlayer && this.$refs.videoPlayer.serviceWorkerRegistration) {
        console.log('🔧 Temporarily unregistering Service Worker for comparison')
        this.videoStatus = 'กำลังทดสอบโดยไม่ใช้ Service Worker...'
        
        try {
          // Unregister SW temporarily
          await this.$refs.videoPlayer.serviceWorkerRegistration.unregister()
          
          console.log('🔧 Service Worker unregistered successfully')
          this.videoStatus = 'Service Worker ถูกยกเลิกแล้ว'
        } catch (error) {
          console.error('Failed to unregister SW:', error)
          this.videoStatus = 'เกิดข้อผิดพลาดในการยกเลิก SW'
        }
      }
    }
  }
}
</script>

<style scoped>
.cmd-decryption-test {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.video-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cmd-decryption-test {
    padding: 1rem;
    margin: 0 0.5rem;
  }
  
  .video-container {
    margin: 0 -1rem;
    border-radius: 0;
  }
}
</style>