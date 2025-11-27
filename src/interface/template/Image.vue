<script>
import storageManager from '@/plugins/storage';
import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import html2canvas from 'html2canvas';

// Constants
const MOVE_AMOUNT = 5;
const ZOOM_STEP = 5;

export default {
  name: 'ImageEditor',
  
  props: {
    imageUrl: {
      type: String,
      default: ''
    },
    uploadPath: {
      type: String,
      required: true
    },
    filePrefix: {
      type: String,
      default: 'image'
    },
    cropImageWidth: {
      type: String,
      default: '400px'
    },
    cropImageHeight: {
      type: String,
      default: '300px'
    },
  },

  emits: ['close-popup-event', 'fileUrlUpdated'],

  data() {
    return {
      // S3 Configuration
      s3Client: null,
      schoolSession: null,
      
      // Image States
      currentImageUrl: '',
      originalImageUrl: '',
      capturedImageSrc: null,
      base64Image: null,
      
      // Transform States
      transform: {
        rotation: 0,
        zoom: 100,
        positionX: 0,
        positionY: 0,
        flipX: false,
        flipY: false
      },
      
      // Crop States
      crop: {
        enabled: false,
        x: 0,
        y: 0,
        width: 200,
        height: 200
      },
      
      // Drag States
      drag: {
        isDragging: false,
        isResizing: false,
        startX: 0,
        startY: 0,
        startCropX: 0,
        startCropY: 0,
        startCropWidth: 0,
        startCropHeight: 0,
        resizeHandle: null // 'se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w'
      },
      
      // Image Information
      imageInfo: {
        size: null,
        width: null,
        height: null
      },
      
      // UI States
      isProcessing: false,
      error: null,
      processingStatus: '',
      
      // Hold button states
      holdInterval: null,
      holdTimeout: null,
      isHolding: false
    }
  },

  computed: {
    imageStyle() {
      const { positionX, positionY, zoom, rotation, flipX, flipY } = this.transform;
      const scaleX = flipX ? -1 : 1;
      const scaleY = flipY ? -1 : 1;
      
      return {
        transform: `translate(calc(-50% + ${positionX}px), calc(-50% + ${positionY}px)) scale(${(zoom / 100) * scaleX}, ${(zoom / 100) * scaleY}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        position: 'absolute',
        top: '50%',
        left: '50%'
      };
    },

    formattedImageSize() {
      return this.imageInfo.size 
        ? `${Math.round(this.imageInfo.size / 1024)}KB` 
        : 'N/A';
    },

    formattedImageDimensions() {
      const { width, height } = this.imageInfo;
      return `${width || 'N/A'}X${height || 'N/A'}`;
    },

    // อัตราส่วนภาพ (Aspect Ratio)
    imageAspectRatio() {
      const { width, height } = this.imageInfo;
      if (!width || !height) return 'N/A';
      
      const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(width, height);
      const ratioW = width / divisor;
      const ratioH = height / divisor;
      
      return `${ratioW}:${ratioH}`;
    },

    // ความหนาแน่นของพิกเซล (Megapixels)
    imageMegapixels() {
      const { width, height } = this.imageInfo;
      if (!width || !height) return 'N/A';
      
      const megapixels = (width * height) / 1000000;
      return `${megapixels.toFixed(1)}MP`;
    },

    // ประเภทการวางแนว (Orientation)
    imageOrientation() {
      const { width, height } = this.imageInfo;
      if (!width || !height) return 'N/A';
      
      if (width === height) return 'สี่เหลี่ยมจัตุรัส';
      return width > height ? 'แนวนอน' : 'แนวตั้ง';
    },

    // สถานะการแก้ไข
    editStatus() {
      const { rotation, zoom, positionX, positionY, flipX, flipY } = this.transform;
      const isEdited = rotation !== 0 || zoom !== 100 || positionX !== 0 || positionY !== 0 || flipX || flipY;
      return isEdited ? 'แก้ไขแล้ว' : 'ต้นฉบับ';
    },

    canSave() {
      return this.currentImageUrl && !this.isProcessing;
    }
  },

  async created() {
    await this.initializeS3Client();
    await this.loadInitialImage();
    
    // เพิ่ม global event listeners
    document.addEventListener('mouseup', this.stopHold);
    document.addEventListener('touchend', this.stopHold);
  },

  beforeUnmount() {
    // ล้าง intervals และ timeouts
    this.stopHold();
    
    // ลบ global event listeners
    document.removeEventListener('mouseup', this.stopHold);
    document.removeEventListener('touchend', this.stopHold);
    
    // ลบ drag event listeners
    this.stopDrag();
  },

  methods: {
    // ==================== Initialization ====================
    async initializeS3Client() {
      try {
        const session = storageManager.get('session');
        this.schoolSession = session.current;
        
        this.s3Client = new S3({
          forcePathStyle: false,
          endpoint: this.schoolSession.s3EndpointDefault,
          region: this.schoolSession.s3Region,
          ResponseContentEncoding: "utf-8",
          credentials: {
            accessKeyId: this.schoolSession.s3Key,
            secretAccessKey: this.schoolSession.s3Secret
          },
          params: {
            CacheControl: "no-cache",
          },
        });
      } catch (error) {
        this.handleError('Failed to initialize S3 client', error);
      }
    },

    async loadInitialImage() {
      if (this.imageUrl) {
        await this.processImageFromUrl(this.imageUrl);
      }
    },

    // ==================== Event Handlers ====================
    handleClose() {
      this.$emit('close-popup-event');
    },

    async handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        this.isProcessing = true;
        await this.processImageFromFile(file);
      } catch (error) {
        this.handleError('Failed to process image file', error);
      } finally {
        this.isProcessing = false;
      }
    },

    handleFileInputClick() {
      this.$refs.fileInput.click();
    },

    // ==================== Image Processing ====================
    async processImageFromFile(file) {
      const base64Url = await this.fileToBase64(file);
      const dimensions = await this.getImageDimensions(base64Url);
      
      this.updateImageState({
        url: base64Url,
        size: file.size,
        dimensions
      });
    },

    async processImageFromUrl(url) {
      try {
        const { base64Url, size, dimensions } = await this.urlToImageData(url);
        this.updateImageState({
          url: base64Url,
          size,
          dimensions
        });
      } catch (error) {
        this.handleError('Failed to load image from URL', error);
      }
    },

    updateImageState({ url, size, dimensions }) {
      this.currentImageUrl = url;
      this.base64Image = url;
      this.capturedImageSrc = null;
      this.imageInfo = {
        size,
        width: dimensions.width,
        height: dimensions.height
      };
      this.resetTransform();
    },

    // ==================== Transform Operations ====================
    rotateImage(degrees) {
      this.transform.rotation += degrees;
      this.clearCapture();
    },

    flipImage(axis) {
      if (axis === 'horizontal') {
        this.transform.flipX = !this.transform.flipX;
      } else if (axis === 'vertical') {
        this.transform.flipY = !this.transform.flipY;
      }
      this.clearCapture();
    },

    zoomImage(direction) {
      const step = direction === 'in' ? ZOOM_STEP : -ZOOM_STEP;
      this.transform.zoom = Math.max(10, this.transform.zoom + step);
      this.clearCapture();
    },

    moveImage(direction) {
      const { positionX, positionY } = this.transform;
      
      switch (direction) {
        case 'up':
          this.transform.positionY = positionY - MOVE_AMOUNT;
          break;
        case 'down':
          this.transform.positionY = positionY + MOVE_AMOUNT;
          break;
        case 'left':
          this.transform.positionX = positionX - MOVE_AMOUNT;
          break;
        case 'right':
          this.transform.positionX = positionX + MOVE_AMOUNT;
          break;
        case 'up-left':
          this.transform.positionX = positionX - MOVE_AMOUNT;
          this.transform.positionY = positionY - MOVE_AMOUNT;
          break;
        case 'up-right':
          this.transform.positionX = positionX + MOVE_AMOUNT;
          this.transform.positionY = positionY - MOVE_AMOUNT;
          break;
        case 'down-left':
          this.transform.positionX = positionX - MOVE_AMOUNT;
          this.transform.positionY = positionY + MOVE_AMOUNT;
          break;
        case 'down-right':
          this.transform.positionX = positionX + MOVE_AMOUNT;
          this.transform.positionY = positionY + MOVE_AMOUNT;
          break;
      }
      this.clearCapture();
    },

    resetTransform() {
      // คำนวณ zoom เริ่มต้นให้พอดีกับ container
      let initialZoom = 100;
      
      if (this.imageInfo.width && this.imageInfo.height) {
        const containerWidth = parseInt(this.cropImageWidth) || 400;
        const containerHeight = parseInt(this.cropImageHeight) || 300;
        const imageWidth = this.imageInfo.width;
        const imageHeight = this.imageInfo.height;

        // คำนวณอัตราส่วนการย่อขยาย
        const scaleX = containerWidth / imageWidth;
        const scaleY = containerHeight / imageHeight;
        const scale = Math.min(scaleX, scaleY, 1); // ไม่ให้ขยายเกินขนาดจริง
        
        initialZoom = Math.round(scale * 100);
      }

      this.transform = {
        rotation: 0,
        zoom: initialZoom,
        positionX: 0,
        positionY: 0,
        flipX: false,
        flipY: false
      };
      this.clearCapture();
    },

    clearCapture() {
      this.capturedImageSrc = null;
    },

    // ปรับขนาดรูปให้เต็มหน้าจอ
    fitToScreen() {
      console.log('fitToScreen called', {
        width: this.imageInfo.width,
        height: this.imageInfo.height,
        cropWidth: this.cropImageWidth,
        cropHeight: this.cropImageHeight
      });

      if (!this.imageInfo.width || !this.imageInfo.height) {
        console.warn('Image dimensions not available for fitToScreen');
        return;
      }

      const containerWidth = parseInt(this.cropImageWidth) || 400;
      const containerHeight = parseInt(this.cropImageHeight) || 300;
      const imageWidth = this.imageInfo.width;
      const imageHeight = this.imageInfo.height;

      // คำนวณอัตราส่วนการขยายให้เต็มหน้าจอ
      const scaleX = containerWidth / imageWidth;
      const scaleY = containerHeight / imageHeight;
      const scale = Math.max(scaleX, scaleY); // ใช้ค่าที่ใหญ่กว่าเพื่อให้เต็มหน้าจอ

      const newZoom = Math.round(scale * 100);
      
      console.log('fitToScreen calculation', {
        scaleX,
        scaleY,
        scale,
        newZoom,
        currentZoom: this.transform.zoom
      });

      this.transform.zoom = newZoom;
      this.transform.positionX = 0;
      this.transform.positionY = 0;
      this.clearCapture();
    },

    // ปรับขนาดให้พอดีกับหน้าจอ (Fit to Screen)
    fitToContainer() {
      if (!this.imageInfo.width || !this.imageInfo.height) return;

      const containerWidth = parseInt(this.cropImageWidth) || 400;
      const containerHeight = parseInt(this.cropImageHeight) || 300;
      const imageWidth = this.imageInfo.width;
      const imageHeight = this.imageInfo.height;

      // คำนวณอัตราส่วนการย่อให้พอดีกับ container
      const scaleX = containerWidth / imageWidth;
      const scaleY = containerHeight / imageHeight;
      const scale = Math.min(scaleX, scaleY, 1); // ใช้ค่าที่เล็กกว่าเพื่อให้พอดี

      this.transform.zoom = Math.round(scale * 100);
      this.transform.positionX = 0;
      this.transform.positionY = 0;
      this.clearCapture();
    },

    // ซูมเป็น 100% (ขนาดจริง)
    actualSize() {
      this.transform.zoom = 100;
      this.transform.positionX = 0;
      this.transform.positionY = 0;
      this.clearCapture();
    },

    // บังคับรีเฟรชและปรับขนาดใหม่
    async forceRefreshAndFit() {
      if (!this.currentImageUrl) return;
      
      try {
        // โหลดข้อมูลรูปภาพใหม่
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            this.imageInfo.width = img.naturalWidth;
            this.imageInfo.height = img.naturalHeight;
            console.log('Image reloaded with dimensions:', {
              width: img.naturalWidth,
              height: img.naturalHeight
            });
            resolve();
          };
          img.onerror = reject;
          img.src = this.currentImageUrl;
        });
        
        // รอให้ DOM อัปเดต
        await this.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // ปรับขนาดให้เต็มหน้าจอ
        this.fitToScreen();
        
      } catch (error) {
        console.error('Failed to refresh image:', error);
      }
    },

    // ==================== Hold Button Methods ====================
    startHold(direction) {
      if (this.isProcessing || this.isHolding) return;
      
      this.isHolding = true;
      
      // เลื่อนครั้งแรกทันที
      this.moveImage(direction);
      
      // รอ 300ms แล้วเริ่มเลื่อนต่อเนื่อง
      this.holdTimeout = setTimeout(() => {
        this.holdInterval = setInterval(() => {
          if (this.isHolding) {
            this.moveImage(direction);
          }
        }, 50); // เลื่อนทุก 50ms
      }, 300);
    },

    stopHold() {
      this.isHolding = false;
      
      if (this.holdTimeout) {
        clearTimeout(this.holdTimeout);
        this.holdTimeout = null;
      }
      
      if (this.holdInterval) {
        clearInterval(this.holdInterval);
        this.holdInterval = null;
      }
    },

    // ==================== Image Capture & Upload ====================
    async captureImage() {
      const container = this.$refs.imageContainer;
      if (!container) {
        throw new Error('Image container not found');
      }

      try {
        // ใช้วิธีการจับภาพแบบใหม่ที่เร็วกว่า
        return await this.captureImageWithCanvas();
      } catch (error) {
        console.error('Canvas capture failed, falling back to html2canvas:', error);
        // ถ้า Canvas API ล้มเหลว ให้ fallback ไป html2canvas
        return await this.captureImageWithHtml2Canvas();
      }
    },

    async captureImageWithCanvas() {
      const imageElement = this.$refs.imageContainer.querySelector('img');
      if (!imageElement) {
        throw new Error('No image found to capture');
      }

      // รอให้รูปภาพโหลดเสร็จ
      await imageElement.decode();

      // สร้าง canvas ใหม่
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // กำหนดขนาด canvas - ถ้าเปิด crop ให้ใช้ขนาด crop
      if (this.crop.enabled) {
        canvas.width = this.crop.width;
        canvas.height = this.crop.height;
      } else {
        canvas.width = parseInt(this.cropImageWidth) || 400;
        canvas.height = parseInt(this.cropImageHeight) || 300;
      }

      // เคลียร์ canvas ด้วยสีขาว
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // คำนวณการ transform
      const { positionX, positionY, zoom, rotation, flipX, flipY } = this.transform;
      
      // บันทึกสถานะ context
      ctx.save();
      
      if (this.crop.enabled) {
        // สำหรับ crop: คำนวณ offset ให้ตรงกับพื้นที่ที่เลือก
        const containerWidth = parseInt(this.cropImageWidth) || 400;
        const containerHeight = parseInt(this.cropImageHeight) || 300;
        
        // คำนวณตำแหน่งกลางของ container และ crop area
        const containerCenterX = containerWidth / 2;
        const containerCenterY = containerHeight / 2;
        const cropCenterX = this.crop.x + (this.crop.width / 2);
        const cropCenterY = this.crop.y + (this.crop.height / 2);
        
        // คำนวณ offset ที่ต้องปรับ
        const offsetX = (canvas.width / 2) + (containerCenterX - cropCenterX);
        const offsetY = (canvas.height / 2) + (containerCenterY - cropCenterY);
        
        ctx.translate(offsetX, offsetY);
      } else {
        // สำหรับไม่ crop: ใช้กลางหน้าจอ
        ctx.translate(canvas.width / 2, canvas.height / 2);
      }
      
      // ใช้ transform ต่างๆ
      ctx.translate(positionX, positionY);
      ctx.scale(flipX ? -(zoom / 100) : (zoom / 100), flipY ? -(zoom / 100) : (zoom / 100));
      ctx.rotate((rotation * Math.PI) / 180);

      // วาดรูปภาพ
      const imgWidth = imageElement.naturalWidth;
      const imgHeight = imageElement.naturalHeight;
      
      ctx.drawImage(
        imageElement,
        -imgWidth / 2,
        -imgHeight / 2,
        imgWidth,
        imgHeight
      );

      // คืนสถานะ context
      ctx.restore();

      return canvas.toDataURL('image/png', 0.9);
    },

    async captureImageWithHtml2Canvas() {
      const container = this.$refs.imageContainer;
      
      try {
        // รอให้รูปภาพโหลดเสร็จก่อน
        const imageElement = container.querySelector('img');
        if (imageElement) {
          await imageElement.decode();
          // รอเพิ่มเติมเพื่อให้แน่ใจว่าจะปรับขนาดได้ถูกต้อง
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // ใช้ config ที่เรียบง่ายกว่า
        const simpleConfig = {
          useCORS: true,
          allowTaint: true,
          backgroundColor: 'white',
          scale: 1,
          width: parseInt(this.cropImageWidth) || 400,
          height: parseInt(this.cropImageHeight) || 300,
          logging: false,
          timeout: 5000 // ลด timeout เหลือ 5 วินาที
        };

        // เพิ่ม timeout wrapper ที่สั้นลง
        const capturePromise = html2canvas(container, simpleConfig);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Html2canvas timeout - การจับภาพใช้เวลานานเกินไป')), 8000);
        });

        const canvas = await Promise.race([capturePromise, timeoutPromise]);
        return canvas.toDataURL('image/png', 0.9);
      } catch (error) {
        console.error('Html2canvas capture error:', error);
        throw new Error(`Failed to capture image: ${error.message}`);
      }
    },

    async saveAndUploadImage() {
      if (!this.canSave) return;

      try {
        this.isProcessing = true;
        this.error = null; // ล้าง error เก่า
        
        // แสดงสถานะการประมวลผล
        this.processingStatus = 'กำลังจับภาพรูปภาพ...';
        console.log('เริ่มจับภาพรูปภาพ...');
        
        // Capture the edited image
        const capturedImage = await this.captureImage();
        
        this.processingStatus = 'กำลังอัปโหลดไปยัง S3...';
        console.log('เริ่มอัปโหลดไปยัง S3...');
        
        // Upload to S3
        const fileUrl = await this.uploadToS3(capturedImage);
        
        this.processingStatus = 'บันทึกสำเร็จ!';
        console.log('อัปโหลดสำเร็จ:', fileUrl);
        
        // Update state and emit event
        await this.updateAfterUpload(fileUrl);
        
        this.$emit('fileUrlUpdated', fileUrl);
        
      } catch (error) {
        console.error('Save error:', error);
        this.processingStatus = '';
        this.handleError('Failed to save and upload image', error);
      } finally {
        setTimeout(() => {
          this.isProcessing = false;
          this.processingStatus = '';
        }, 1000); // แสดงข้อความสำเร็จ 1 วินาทีก่อนซ่อน
      }
    },

    async uploadToS3(base64Image) {
      try {
        const response = await fetch(base64Image);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        const filename = this.generateFilename();
        const key = `${this.uploadPath}${filename}`;

        const params = {
          Bucket: this.schoolSession.s3Bucket,
          Key: key,
          Body: new Uint8Array(arrayBuffer),
          ACL: 'public-read',
          ContentType: 'image/png'
        };

        // เพิ่ม timeout สำหรับการอัปโหลด
        const uploadPromise = this.s3Client.send(new PutObjectCommand(params));
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Upload timeout - การอัปโหลดใช้เวลานานเกินไป')), 30000);
        });

        await Promise.race([uploadPromise, timeoutPromise]);
        
        return `https://${this.schoolSession.s3Bucket}.sgp1.digitaloceanspaces.com/${key}`;
      } catch (error) {
        console.error('S3 Upload error:', error);
        throw new Error(`การอัปโหลดล้มเหลว: ${error.message}`);
      }
    },

    async updateAfterUpload(fileUrl) {
      this.base64Image = fileUrl;
      this.currentImageUrl = fileUrl;
      this.originalImageUrl = fileUrl;
      this.capturedImageSrc = null;
      
      // ปิด crop function หลังบันทึกสำเร็จ
      this.crop.enabled = false;
      
      // ใช้ forceRefreshAndFit เพื่อให้แน่ใจว่าจะปรับขนาดได้ถูกต้อง
      await this.forceRefreshAndFit();
    },

    // ==================== Utility Methods ====================
    generateFilename() {
      const timestamp = Date.now();
      return `${this.filePrefix}_${timestamp}.png`;
    },

    async fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    async getImageDimensions(src) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height
          });
        };
        img.src = src;
      });
    },

    async urlToImageData(url) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.overrideMimeType('image/png');
        
        xhr.onload = async () => {
          try {
            const blob = xhr.response;
            const base64Url = await this.blobToBase64(blob);
            const dimensions = await this.getImageDimensions(base64Url);
            
            resolve({
              base64Url,
              size: blob.size,
              dimensions
            });
          } catch (error) {
            reject(error);
          }
        };
        
        xhr.onerror = () => reject(new Error('Failed to load image'));
        xhr.open('GET', url);
        xhr.send();
      });
    },

    async blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },

    handleError(message, error) {
      console.error(message, error);
      this.error = message;
      // You can add toast notification here
    },

    // ==================== Crop Functions ====================
    toggleCrop() {
      this.crop.enabled = !this.crop.enabled;
      if (this.crop.enabled) {
        // ตั้งค่า crop ให้อยู่กลางหน้าจอ
        const containerWidth = parseInt(this.cropImageWidth) || 400;
        const containerHeight = parseInt(this.cropImageHeight) || 300;
        this.crop.x = (containerWidth - this.crop.width) / 2;
        this.crop.y = (containerHeight - this.crop.height) / 2;
      }
      this.clearCapture();
    },

    // ==================== Drag Functions ====================
    startDrag(event, type = 'move', handle = null) {
      if (!this.crop.enabled) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      const rect = this.$refs.imageContainer.getBoundingClientRect();
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      
      this.drag.startX = clientX - rect.left;
      this.drag.startY = clientY - rect.top;
      this.drag.startCropX = this.crop.x;
      this.drag.startCropY = this.crop.y;
      this.drag.startCropWidth = this.crop.width;
      this.drag.startCropHeight = this.crop.height;
      
      if (type === 'resize') {
        this.drag.isResizing = true;
        this.drag.resizeHandle = handle;
      } else {
        this.drag.isDragging = true;
      }
      
      // Add global event listeners
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('mouseup', this.stopDrag);
      document.addEventListener('touchmove', this.handleDrag);
      document.addEventListener('touchend', this.stopDrag);
    },

    handleDrag(event) {
      if (!this.drag.isDragging && !this.drag.isResizing) return;
      
      event.preventDefault();
      
      const rect = this.$refs.imageContainer.getBoundingClientRect();
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      
      const currentX = clientX - rect.left;
      const currentY = clientY - rect.top;
      const deltaX = currentX - this.drag.startX;
      const deltaY = currentY - this.drag.startY;
      
      const containerWidth = parseInt(this.cropImageWidth) || 400;
      const containerHeight = parseInt(this.cropImageHeight) || 300;
      
      if (this.drag.isDragging) {
        // Move crop area
        let newX = this.drag.startCropX + deltaX;
        let newY = this.drag.startCropY + deltaY;
        
        // Constrain to container bounds
        newX = Math.max(0, Math.min(newX, containerWidth - this.crop.width));
        newY = Math.max(0, Math.min(newY, containerHeight - this.crop.height));
        
        this.crop.x = newX;
        this.crop.y = newY;
        
      } else if (this.drag.isResizing) {
        // Resize crop area - แบบสี่เหลี่ยมจัตุรัส
        let newSize = Math.min(this.drag.startCropWidth, this.drag.startCropHeight);
        let newX = this.drag.startCropX;
        let newY = this.drag.startCropY;
        
        const handle = this.drag.resizeHandle;
        const minSize = 50;
        
        // คำนวณขนาดใหม่จาก delta ที่ใหญ่กว่า
        let sizeDelta = 0;
        
        if (handle.includes('e') || handle.includes('w')) {
          sizeDelta = Math.abs(deltaX);
        } else if (handle.includes('n') || handle.includes('s')) {
          sizeDelta = Math.abs(deltaY);
        } else {
          // สำหรับมุม ใช้ค่าที่ใหญ่กว่า
          sizeDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
        }
        
        // กำหนดทิศทางการขยาย/หด
        let expanding = false;
        if (handle.includes('e') && deltaX > 0) expanding = true;
        if (handle.includes('w') && deltaX < 0) expanding = true;
        if (handle.includes('s') && deltaY > 0) expanding = true;
        if (handle.includes('n') && deltaY < 0) expanding = true;
        if (handle === 'se' && (deltaX > 0 || deltaY > 0)) expanding = true;
        if (handle === 'sw' && (deltaX < 0 || deltaY > 0)) expanding = true;
        if (handle === 'ne' && (deltaX > 0 || deltaY < 0)) expanding = true;
        if (handle === 'nw' && (deltaX < 0 || deltaY < 0)) expanding = true;
        
        // คำนวณขนาดใหม่
        if (expanding) {
          newSize = this.drag.startCropWidth + sizeDelta;
        } else {
          newSize = this.drag.startCropWidth - sizeDelta;
        }
        
        // จำกัดขนาดขั้นต่ำ
        newSize = Math.max(minSize, newSize);
        
        // ปรับตำแหน่งตาม handle
        if (handle.includes('w')) {
          newX = this.drag.startCropX - (newSize - this.drag.startCropWidth);
        }
        if (handle.includes('n')) {
          newY = this.drag.startCropY - (newSize - this.drag.startCropHeight);
        }
        
        // จำกัดไม่ให้เกินขอบ container
        const maxSize = Math.min(
          containerWidth - newX,
          containerHeight - newY,
          containerWidth,
          containerHeight
        );
        newSize = Math.min(newSize, maxSize);
        
        // ปรับตำแหน่งถ้าขนาดถูกจำกัด
        if (newX < 0) {
          newSize = Math.min(newSize, newSize + newX);
          newX = 0;
        }
        if (newY < 0) {
          newSize = Math.min(newSize, newSize + newY);
          newY = 0;
        }
        if (newX + newSize > containerWidth) {
          newSize = containerWidth - newX;
        }
        if (newY + newSize > containerHeight) {
          newSize = containerHeight - newY;
        }
        
        // อัปเดตค่า crop
        this.crop.x = newX;
        this.crop.y = newY;
        this.crop.width = newSize;
        this.crop.height = newSize;
      }
      
      this.clearCapture();
    },

    stopDrag() {
      this.drag.isDragging = false;
      this.drag.isResizing = false;
      this.drag.resizeHandle = null;
      
      // Remove global event listeners
      document.removeEventListener('mousemove', this.handleDrag);
      document.removeEventListener('mouseup', this.stopDrag);
      document.removeEventListener('touchmove', this.handleDrag);
      document.removeEventListener('touchend', this.stopDrag);
    },
  }
};
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-lg shadow-xl w-3/5 max-w-2xl h-auto max-h-[90vh] relative flex flex-col">
      
      <!-- Header -->
      <header class="bg-gray-300 px-3 py-2 rounded-t-lg flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="text-xs font-bold text-gray-800">Image Editor</h2>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Close Button -->
          <button 
            @click="handleClose" 
            class="text-gray-600 hover:text-gray-800 transition-colors p-1"
            :disabled="isProcessing"
          >
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>
      </header>

      <!-- Sub Top Bar -->
      <div class="bg-gray-200 px-3 py-2 border-b flex justify-between items-center">
        <div class="flex items-center gap-4">
          <!-- Image Information -->
          <div class="text-xs text-gray-600 flex items-center gap-3">
            <span class="font-medium">{{ formattedImageSize }}</span>
            <span>{{ formattedImageDimensions }}</span>
            <span>{{ imageAspectRatio }}</span>
            <span>{{ imageMegapixels }}</span>
            <span class="px-2 py-0.5 bg-gray-300 rounded">{{ imageOrientation }}</span>
            <span class="px-2 py-0.5 rounded" :class="editStatus === 'แก้ไขแล้ว' ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'">
              {{ editStatus }}
            </span>
          </div>
          <!-- Reset Button -->
          <button 
            v-if="transform.rotation !== 0 || transform.zoom !== 100 || transform.positionX !== 0 || transform.positionY !== 0"
            @click="resetTransform"
            class="text-blue-600 hover:text-blue-800 text-xs px-2 py-0.5 rounded hover:bg-blue-50"
            :disabled="isProcessing"
          >
            รีเซ็ต
          </button>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- File Input -->
          <input 
            type="file" 
            @change="handleFileChange" 
            class="hidden" 
            ref="fileInput"
            accept="image/*"
          />
          <!-- Select Image Button -->
          <button 
            @click="handleFileInputClick" 
            class="flex items-center justify-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors text-xs"
            :disabled="isProcessing"
          >
            <i class="fas fa-upload text-xs"></i>
            <span>เลือกรูป</span>
          </button>
          
          <!-- Save Button -->
          <button 
            @click="saveAndUploadImage" 
            class="flex items-center justify-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded transition-colors disabled:bg-gray-500 text-xs"
            :disabled="!canSave"
          >
            <i class="fas fa-save text-xs" :class="{ 'fa-spinner fa-spin': isProcessing }"></i>
            <span v-if="processingStatus">{{ processingStatus }}</span>
            <span v-else>{{ isProcessing ? 'บันทึก...' : 'บันทึก' }}</span>
          </button>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-3 py-2 mx-3 mt-2 rounded text-xs">
        {{ error }}
        <button @click="error = null" class="float-right font-bold">&times;</button>
      </div>

      <!-- Processing Status -->
      <div v-if="isProcessing" class="bg-blue-100 border border-blue-400 text-blue-700 px-3 py-2 mx-3 mt-2 rounded text-xs">
        <div class="flex items-center gap-2">
          <i class="fas fa-spinner fa-spin"></i>
          <span>{{ processingStatus || 'กำลังประมวลผล...' }}</span>
        </div>
        <div class="w-full bg-blue-200 rounded-full h-1 mt-2">
          <div class="bg-blue-600 h-1 rounded-full animate-pulse" style="width: 100%"></div>
        </div>
      </div>

      <!-- Image Preview Area -->
      <main class="flex-1 bg-gray-100 flex items-center justify-center p-3 overflow-hidden">
        <div 
          class="bg-white border border-gray-300 overflow-hidden shadow-inner"
          :style="{ width: cropImageWidth, height: cropImageHeight }"
        >
          <div 
            ref="imageContainer"
            class="w-full h-full overflow-hidden relative"
            :style="{ width: cropImageWidth, height: cropImageHeight }"
          >
            <img 
              v-if="capturedImageSrc" 
              :src="capturedImageSrc" 
              alt="Captured Preview" 
              class="w-full h-full object-contain"
            />
            <img 
              v-else-if="currentImageUrl"
              :src="currentImageUrl" 
              alt="Image Preview" 
              class="max-w-none"
              :style="imageStyle" 
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <i class="fas fa-image text-2xl"></i>
            </div>
            
            <!-- Crop Overlay -->
            <div 
              v-if="crop.enabled && currentImageUrl"
              class="absolute border-2 border-red-500 bg-red-500 bg-opacity-20 cursor-move select-none"
              :style="{
                left: crop.x + 'px',
                top: crop.y + 'px',
                width: crop.width + 'px',
                height: crop.height + 'px'
              }"
              @mousedown="startDrag($event, 'move')"
              @touchstart="startDrag($event, 'move')"
            >
              <!-- Crop Info -->
              <div class="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded pointer-events-none">
                {{ crop.width }}×{{ crop.height }}
              </div>
              
              <!-- Resize Handles -->
              <!-- Corner handles -->
              <div 
                class="absolute w-3 h-3 bg-red-500 border border-white cursor-nw-resize"
                style="top: -4px; left: -4px;"
                @mousedown.stop="startDrag($event, 'resize', 'nw')"
                @touchstart.stop="startDrag($event, 'resize', 'nw')"
              ></div>
              <div 
                class="absolute w-3 h-3 bg-red-500 border border-white cursor-ne-resize"
                style="top: -4px; right: -4px;"
                @mousedown.stop="startDrag($event, 'resize', 'ne')"
                @touchstart.stop="startDrag($event, 'resize', 'ne')"
              ></div>
              <div 
                class="absolute w-3 h-3 bg-red-500 border border-white cursor-sw-resize"
                style="bottom: -4px; left: -4px;"
                @mousedown.stop="startDrag($event, 'resize', 'sw')"
                @touchstart.stop="startDrag($event, 'resize', 'sw')"
              ></div>
              <div 
                class="absolute w-3 h-3 bg-red-500 border border-white cursor-se-resize"
                style="bottom: -4px; right: -4px;"
                @mousedown.stop="startDrag($event, 'resize', 'se')"
                @touchstart.stop="startDrag($event, 'resize', 'se')"
              ></div>
              
              <!-- Edge handles -->
              <div 
                class="absolute w-3 h-3 bg-red-500 border border-white cursor-n-resize"
                style="top: -4px; left: 50%; transform: translateX(-50%);"
                @mousedown.stop="startDrag($event, 'resize', 'n')"
                @touchstart.stop="startDrag($event, 'resize', 'n')"
              ></div>
              <div 
                class="absolute w-3 h-3 bg-red-500 border border-white cursor-s-resize"
                style="bottom: -4px; left: 50%; transform: translateX(-50%);"
                @mousedown.stop="startDrag($event, 'resize', 's')"
                @touchstart.stop="startDrag($event, 'resize', 's')"
              ></div>
              <div 
                class="absolute w-3 h-3 bg-red-500 border border-white cursor-w-resize"
                style="left: -4px; top: 50%; transform: translateY(-50%);"
                @mousedown.stop="startDrag($event, 'resize', 'w')"
                @touchstart.stop="startDrag($event, 'resize', 'w')"
              ></div>
              <div 
                class="absolute w-3 h-3 bg-red-500 border border-white cursor-e-resize"
                style="right: -4px; top: 50%; transform: translateY(-50%);"
                @mousedown.stop="startDrag($event, 'resize', 'e')"
                @touchstart.stop="startDrag($event, 'resize', 'e')"
              ></div>
            </div>
          </div>
        </div>
      </main>

      <!-- Controls -->
      <section class="bg-gray-700 text-white p-2">
        <div class="grid grid-cols-4 gap-2 text-xs">
          
          <!-- Rotation Controls -->
          <div class="space-y-1">
            <h3 class="text-xs text-gray-300 font-medium">หมุน</h3>
            <div class="grid grid-cols-2 gap-1">
              <button 
                @click="rotateImage(-90)" 
                class="flex items-center justify-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors text-xs"
                :disabled="isProcessing"
              >
                <i class="fas fa-undo text-xs"></i>
                <span>ซ้าย</span>
              </button>
              <button 
                @click="rotateImage(90)" 
                class="flex items-center justify-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors text-xs"
                :disabled="isProcessing"
              >
                <i class="fas fa-redo text-xs"></i>
                <span>ขวา</span>
              </button>
              <button 
                @click="flipImage('horizontal')" 
                class="flex items-center justify-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors text-xs"
                :disabled="isProcessing"
              >
                <i class="fas fa-arrows-alt-h text-xs"></i>
                <span>แนวนอน</span>
              </button>
              <button 
                @click="flipImage('vertical')" 
                class="flex items-center justify-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors text-xs"
                :disabled="isProcessing"
              >
                <i class="fas fa-arrows-alt-v text-xs"></i>
                <span>แนวตั้ง</span>
              </button>
            </div>
          </div>

          <!-- Zoom Controls -->
          <div class="space-y-1">
            <h3 class="text-xs text-gray-300 font-medium">ซูม {{ transform.zoom }}%</h3>
            <div class="space-y-1">
              <div class="flex gap-1">
                <button 
                  @click="zoomImage('in')" 
                  class="flex items-center justify-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors text-xs"
                  :disabled="isProcessing"
                >
                  <i class="fas fa-search-plus text-xs"></i>
                  <span>+</span>
                </button>
                <button 
                  @click="zoomImage('out')" 
                  class="flex items-center justify-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors text-xs"
                  :disabled="isProcessing || transform.zoom <= 10"
                >
                  <i class="fas fa-search-minus text-xs"></i>
                  <span>-</span>
                </button>
              </div>
              <div class="flex gap-1">
                <button 
                  @click="fitToContainer" 
                  class="flex items-center justify-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors text-xs"
                  :disabled="isProcessing"
                >
                  <i class="fas fa-compress text-xs"></i>
                  <span>พอดี</span>
                </button>
                <button 
                  @click="actualSize" 
                  class="flex items-center justify-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors text-xs"
                  :disabled="isProcessing"
                >
                  <i class="fas fa-expand-arrows-alt text-xs"></i>
                  <span>100%</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Position Controls -->
          <div class="space-y-1">
            <h3 class="text-xs text-gray-300 font-medium">ตำแหน่ง</h3>
            <div class="grid grid-cols-3 gap-0.5">
              <!-- Row 1 -->
              <button 
                @mousedown="startHold('up-left')"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('up-left')"
                @touchend="stopHold"
                class="flex items-center justify-center p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors select-none"
                :disabled="isProcessing"
              >
                <i class="fas fa-arrow-up text-xs transform -rotate-45"></i>
              </button>
              <button 
                @mousedown="startHold('up')"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('up')"
                @touchend="stopHold"
                class="flex items-center justify-center p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors select-none"
                :disabled="isProcessing"
              >
                <i class="fas fa-arrow-up text-xs"></i>
              </button>
              <button 
                @mousedown="startHold('up-right')"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('up-right')"
                @touchend="stopHold"
                class="flex items-center justify-center p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors select-none"
                :disabled="isProcessing"
              >
                <i class="fas fa-arrow-up text-xs transform rotate-45"></i>
              </button>
              
              <!-- Row 2 -->
              <button 
                @mousedown="startHold('left')"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('left')"
                @touchend="stopHold"
                class="flex items-center justify-center p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors select-none"
                :disabled="isProcessing"
              >
                <i class="fas fa-arrow-left text-xs"></i>
              </button>
              <!-- Center fit to screen button -->
              <button 
                @click="fitToScreen"
                class="flex items-center justify-center p-1 bg-purple-600 hover:bg-purple-500 rounded transition-colors select-none"
                :disabled="isProcessing || !currentImageUrl"
              >
                <i class="fas fa-expand text-xs text-white"></i>
              </button>
              <button 
                @mousedown="startHold('right')"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('right')"
                @touchend="stopHold"
                class="flex items-center justify-center p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors select-none"
                :disabled="isProcessing"
              >
                <i class="fas fa-arrow-right text-xs"></i>
              </button>
              
              <!-- Row 3 -->
              <button 
                @mousedown="startHold('down-left')"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('down-left')"
                @touchend="stopHold"
                class="flex items-center justify-center p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors select-none"
                :disabled="isProcessing"
              >
                <i class="fas fa-arrow-down text-xs transform rotate-45"></i>
              </button>
              <button 
                @mousedown="startHold('down')"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('down')"
                @touchend="stopHold"
                class="flex items-center justify-center p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors select-none"
                :disabled="isProcessing"
              >
                <i class="fas fa-arrow-down text-xs"></i>
              </button>
              <button 
                @mousedown="startHold('down-right')"
                @mouseup="stopHold"
                @mouseleave="stopHold"
                @touchstart="startHold('down-right')"
                @touchend="stopHold"
                class="flex items-center justify-center p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors select-none"
                :disabled="isProcessing"
              >
                <i class="fas fa-arrow-down text-xs transform -rotate-45"></i>
              </button>
            </div>
          </div>

          <!-- Crop Controls -->
          <div class="space-y-1">
            <h3 class="text-xs text-gray-300 font-medium">ครอป</h3>
            <div class="space-y-1">
              <button 
                @click="toggleCrop" 
                class="flex items-center justify-center gap-1 px-2 py-1 rounded transition-colors text-xs w-full"
                :class="crop.enabled ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-600 hover:bg-gray-500'"
                :disabled="isProcessing"
              >
                <i class="fas fa-crop text-xs"></i>
                <span>{{ crop.enabled ? 'ปิด' : 'เปิด' }}</span>
              </button>
              <div v-if="crop.enabled" class="text-xs text-gray-300 text-center">
                <div>{{ crop.width }}×{{ crop.height }}</div>
                <div class="text-gray-400 mt-1">ลากเพื่อย้าย</div>
                <div class="text-gray-400">ลากมุมเพื่อปรับขนาด</div>
                <div class="text-gray-400">(สี่เหลี่ยมจัตุรัส)</div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Smooth transitions for transforms */
img {
  transition: transform 0.2s ease-out;
}

/* Better button states */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  transform: translateY(-1px);
}

/* Image container positioning */
[ref="imageContainer"] {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>