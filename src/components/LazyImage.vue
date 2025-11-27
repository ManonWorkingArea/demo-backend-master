<template>
  <div 
    ref="imageContainer" 
    class="lazy-image-container"
    :class="containerClass"
  >
    <!-- Loading skeleton หรือ validation -->
    <div 
      v-if="isValidating || isUrlValid === null" 
      class="lazy-image-skeleton"
      :class="skeletonClass"
    >
      <div class="skeleton-animation">
        <slot name="loading">
          <div class="flex items-center justify-center h-full">
            <i v-if="isValidating" class="fas fa-spinner fa-spin text-blue-400" :class="iconSize"></i>
            <i v-else class="fas fa-image text-gray-400" :class="iconSize"></i>
          </div>
        </slot>
      </div>
    </div>

    <!-- Actual image - แสดงทันทีหลัง validation ผ่าน -->
    <img
      v-show="isUrlValid === true && !imageError"
      ref="lazyImage"
      :src="src"
      :alt="alt"
      :class="imageClass"
      @load="onImageLoad"
      @error="onImageError"
      referrerpolicy="no-referrer"
      decoding="async"
    />

    <!-- Error state -->
    <div 
      v-if="imageError" 
      class="lazy-image-error"
      :class="errorClass"
    >
      <slot name="error">
        <div class="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
          <i class="fas fa-exclamation-triangle text-gray-400" :class="iconSize"></i>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LazyImage',
  props: {
    src: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    containerClass: {
      type: String,
      default: ''
    },
    imageClass: {
      type: String,
      default: 'w-full h-full object-cover'
    },
    skeletonClass: {
      type: String,
      default: 'w-full h-full'
    },
    errorClass: {
      type: String,
      default: 'w-full h-full'
    },
    iconSize: {
      type: String,
      default: 'text-lg'
    },
    // Intersection Observer options
    rootMargin: {
      type: String,
      default: '50px'
    },
    threshold: {
      type: Number,
      default: 0.1
    },
    // Option to disable lazy loading (for testing)
    eager: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imageLoaded: false,
      imageError: false,
      imageSrc: '',
      observer: null,
      isIntersecting: false,
      isValidating: false,
      isUrlValid: null,
      retryCount: 0,
      maxRetries: 2
    }
  },
  async mounted() {
    try {
      if (this.eager) {
        // Load immediately if eager loading is enabled
        await this.loadImage();
      } else {
        // Setup intersection observer for lazy loading
        this.$nextTick(() => {
          this.setupIntersectionObserver();
        });
      }
    } catch (error) {
      console.warn('LazyImage mounted error:', error);
      this.imageError = true;
    }
  },
  beforeUnmount() {
    // Clean up observer and any pending operations
    try {
      this.cleanup();
    } catch (error) {
      console.warn('LazyImage beforeUnmount error:', error);
    }
  },
  methods: {
    async isValidS3ImageUrl(url) {
      try {
        // ตรวจสอบว่าเป็น HTTP URL ก่อน
        if (!url || !url.startsWith('http')) {
          console.log('❌ Invalid URL - not HTTP:', url);
          return false;
        }

        // ใช้ HEAD request เพื่อตรวจสอบ URL โดยไม่ต้องดาวน์โหลดไฟล์ทั้งหมด
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'cors', // Allow cross-origin requests
          cache: 'no-cache', // ไม่ cache เพื่อให้ได้ผลลัพธ์ล่าสุด
          headers: {
            'Accept': 'image/*'
          }
        });
        
        // ตรวจสอบว่า response สำเร็จ
        const isValidResponse = response.ok;
        const contentType = response.headers.get('Content-Type');
        
        // ปรับเงื่อนไข image type ให้ยืดหยุ่นมากขึ้น
        const isImageType = contentType && (
          contentType.startsWith('image/') || 
          contentType === 'application/octet-stream' || // S3 บางครั้งใช้ octet-stream สำหรับรูป
          contentType === 'multipart/form-data' || // S3 บางครั้งส่ง multipart/form-data
          contentType === 'binary/octet-stream' ||
          contentType === 'application/binary' ||
          !contentType // ถ้าไม่มี content-type ให้ลองโหลดดู
        );
        
        console.log('🔍 S3 URL Validation result:', {
          url: url.substring(0, 60) + '...',
          status: response.status,
          statusText: response.statusText,
          ok: isValidResponse,
          contentType,
          isImage: isImageType,
          result: isValidResponse && isImageType
        });
        
        // ถ้า response สำเร็จ (200) ให้อนุญาตการโหลดรูป แม้ content-type จะไม่ถูกต้อง
        // เพราะ S3 บางครั้งส่ง content-type ผิด
        return isValidResponse;
      } catch (error) {
        console.log('❌ S3 URL Validation error:', {
          url: url.substring(0, 60) + '...',
          error: error.message,
          name: error.name
        });
        
        // ถ้ามี CORS error หรือ network error ให้ลองโหลดรูปตรงๆ แทน
        if (error.name === 'TypeError' && error.message.includes('CORS')) {
          console.log('⚠️ CORS detected, allowing image load to proceed');
          return true; // อนุญาตให้ลองโหลดรูป
        }
        
        return false;
      }
    },

    setupIntersectionObserver() {
      // Check if Intersection Observer is supported
      if (!('IntersectionObserver' in window)) {
        // Fallback: load image immediately
        this.loadImage();
        return;
      }

      const options = {
        rootMargin: this.rootMargin,
        threshold: this.threshold
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting && !this.isIntersecting && entry.target) {
            this.isIntersecting = true;
            await this.loadImage();
            // Stop observing once image starts loading
            if (this.observer && entry.target) {
              try {
                this.observer.unobserve(entry.target);
              } catch (error) {
                console.warn('LazyImage unobserve error:', error);
              }
            }
          }
        });
      }, options);

      // Start observing the container
      if (this.$refs.imageContainer && this.observer) {
        this.observer.observe(this.$refs.imageContainer);
      }
    },

    async loadImage() {
      if (!this.src || this.isUrlValid !== null) {
        return; // Already processed or no source
      }

      // Start validation
      this.isValidating = true;
      this.isUrlValid = null;

      console.log(`🔍 Validating URL: ${this.src.substring(0, 60)}...`);

      // Validate S3 URL first using HEAD request
      const urlValid = await this.isValidS3ImageUrl(this.src);
      this.isUrlValid = urlValid;
      this.isValidating = false;

      if (!urlValid) {
        console.log(`❌ URL validation failed, marking as error: ${this.src.substring(0, 60)}...`);
        this.imageError = true;
        this.$emit('error', {
          src: this.src,
          element: this.$refs.lazyImage,
          reason: 'URL validation failed'
        });
        return;
      }

      // If URL is valid, preload the image for better performance
      console.log(`✅ URL validated, preloading image: ${this.src.substring(0, 60)}...`);
      this.preloadImage();
    },

    preloadImage() {
      // Create a hidden image element to preload
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      
      img.onload = () => {
        console.log(`📥 Image preloaded successfully: ${this.src.substring(0, 60)}... (${img.width}x${img.height})`);
        // Preload success - the actual img element will load faster now
      };
      
      img.onerror = (error) => {
        console.log(`⚠️ Image preload failed: ${this.src.substring(0, 60)}...`, error);
        // Even if preload fails, still show the image - let the actual img handle it
      };
      
      console.log(`📤 Starting preload for: ${this.src.substring(0, 60)}...`);
      img.src = this.src;
    },

    onImageLoad() {
      console.log('🎉 LazyImage: onImageLoad fired!', this.src?.substring(0, 60) + '...');
      console.log('🖼️ Image dimensions:', this.$refs.lazyImage?.naturalWidth, 'x', this.$refs.lazyImage?.naturalHeight);
      this.imageLoaded = true;
      this.imageError = false;
      this.retryCount = 0; // Reset retry count on success
      this.$emit('loaded', {
        src: this.src,
        element: this.$refs.lazyImage
      });
    },

    onImageError() {
      console.log('LazyImage: onImageError fired!', this.src?.substring(0, 60) + '...', 'Retry count:', this.retryCount);
      
      // ถ้ายังไม่ถึงจำนวน retry สูงสุด ให้ลองใหม่
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 Retrying image load (${this.retryCount}/${this.maxRetries}):`, this.src?.substring(0, 60) + '...');
        
        // รอสักครู่แล้วลองใหม่
        setTimeout(() => {
          // Reset states และลองโหลดใหม่
          this.imageLoaded = false;
          this.imageError = false;
          
          // Force browser to reload by adding timestamp
          const img = this.$refs.lazyImage;
          if (img && this.isUrlValid === true) {
            const separator = this.src.includes('?') ? '&' : '?';
            img.src = this.src + separator + '_retry=' + Date.now();
          }
        }, 1000 * this.retryCount); // เพิ่มเวลารอทีละครั้ง
        
        return;
      }
      
      // ถ้า retry หมดแล้วยังไม่ได้ ให้แสดง error
      console.log('❌ Image failed after all retries:', this.src?.substring(0, 60) + '...');
      this.imageError = true;
      this.imageLoaded = false;
      this.$emit('error', {
        src: this.src,
        element: this.$refs.lazyImage,
        reason: 'Image load failed after retries'
      });
    },

    cleanup() {
      if (this.observer) {
        try {
          this.observer.disconnect();
        } catch (error) {
          console.warn('LazyImage cleanup error:', error);
        } finally {
          this.observer = null;
        }
      }
    },

    // Public method to force reload
    async reload() {
      this.imageLoaded = false;
      this.imageError = false;
      this.imageSrc = '';
      this.isUrlValid = null; // Reset validation state
      this.isValidating = false;
      this.retryCount = 0; // Reset retry count
      await this.loadImage();
    }
  }
}
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
}

.lazy-image-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton-animation {
  width: 100%;
  height: 100%;
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.lazy-image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* Smooth fade-in transition */
img {
  transition: opacity 0.3s ease-in-out;
}

img[v-show="false"] {
  opacity: 0;
}

img[v-show="true"] {
  opacity: 1;
}
</style>
