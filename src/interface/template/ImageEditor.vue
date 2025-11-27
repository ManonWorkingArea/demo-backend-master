<template>
    <div  class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white rounded shadow-lg w-screen/2 h-screen/2 relative">
            <button @click="closePopup" class="z-50 absolute top-2 right-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-full">
            <i class="fas fa-times"></i>
            </button>
            <div class="flex bg-gray-100 items-center justify-center p-5">
            <!-- Your image editing interface goes here -->
            <div class="w-[600px] h-[600px] bg-white border border-gray-300 overflow-hidden">
                <div ref="myDiv" class="w-[600px] h-[600px] overflow-hidden imageProcess">
                <!-- Display the captured image as a preview -->
                <img v-if="capturedImageSrc" :src="capturedImageSrc" alt="Captured Image Preview" class="w-full"/>
                <img v-if="!capturedImageSrc" :src="rotatedImageUrl" alt="Master Image" :style="imageStyle" />
                </div>
            </div>
            <!-- Your image editing controls go here -->
            <div class="top-0 relative overflow-hidden hidden">
                <img :src="base64Image" alt="Result Image" class="w-full max-h-full" v-if="base64Image" />
            </div>
            <div class="w-full p-2 bg-gray-600 border-b border-t border-gray-200">
                <!-- Your image editing buttons go here -->
            </div>
            </div>
            <div class="w-full p-2 text-gray-500 text-sm border-b border-t border-gray-200">
            Image Detail : {{ imageDetail.size ? imageDetail.size / 1024 + 'KB' : 'N/A' }} | Image Dimension : {{ imageDetail.width || 'N/A' }}X{{ imageDetail.height || 'N/A' }}
            </div>
        </div>
    </div>
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import { S3 } from "@aws-sdk/client-s3";
  import { PutObjectCommand } from "@aws-sdk/client-s3";
  import html2canvas from 'html2canvas';
  
  export default {
    inject: ['apiServer', 'saltSecret'],
    data() {
      const session = storageManager.get('session');
      const schoolSession = session.current;
      const s3Client = new S3({
        forcePathStyle: false,
        endpoint: schoolSession.s3EndpointDefault,
        region: schoolSession.s3Region,
        ResponseContentEncoding: "utf-8",
        credentials: {
          accessKeyId: schoolSession.s3Key,
          secretAccessKey: schoolSession.s3Secret
        },
        params: {
          CacheControl: "no-cache", // Set Cache-Control header to no-cache
        },
      });
      return {
        configs: storageManager.get('configs'),
        S3: s3Client,
        capturedImageSrc: null,
        base64Image: null,
        rotatedImageUrl: '',
        originalImageUrl: '',
        zoomPercentage: 100,
        imagePositionX: 0,
        imagePositionY: 0,
        rotationAngle: 0,
        imageDetail: { size: null, width: null, height: null },
      };
    },
    computed: {
      imageStyle() {
        return {
          transform: `translate(${this.imagePositionX}px, ${this.imagePositionY}px) scale(${this.zoomPercentage / 100}) rotate(${this.rotationAngle}deg)`,
        };
      },
    },
    methods: {
      resetCropArea() {
        this.rotationAngle = 0;
        this.zoomPercentage = 100;
        this.imagePositionX = 0;
        this.imagePositionY = 0;
      },
      async convertToBase64() {
        try {
          const div = this.$refs.myDiv;
          div.style.margin = '-1px'; // Apply a negative margin
          const canvas = await html2canvas(div, {
            useCORS: true,
            backgroundColor: null,
            scale: 2,
            dpi: 300,
            letterRendering: true
          });
          const base64Image = canvas.toDataURL();
          this.base64Image = base64Image;
        } catch (error) {
          console.error(error);
        }
      },
      async someAction() {
        await this.convertToBase64();
      },
      zoomIn() {
        this.capturedImageSrc = null;
        this.zoomPercentage += 5;
      },
      zoomOut() {
        this.capturedImageSrc = null;
        this.zoomPercentage -= 5;
      },
      moveImage(direction) {
        this.capturedImageSrc = null;
        const moveAmount = 5;
        switch (direction) {
          case 'up':
            this.imagePositionY -= moveAmount;
            break;
          case 'down':
            this.imagePositionY += moveAmount;
            break;
          case 'left':
            this.imagePositionX -= moveAmount;
            break;
          case 'right':
            this.imagePositionX += moveAmount;
            break;
        }
      },
      reloadImage() {
        const randomQueryParam = `?timestamp=${Date.now()}`;
        this.profile.avatar_img = this.profile.avatar_img + randomQueryParam;
      },
      rotateBy(degrees) {
        this.capturedImageSrc = null;
        this.rotationAngle += degrees;
  
        const scaleMultiplier = this.zoomPercentage / 100;
  
        const tempImg = new Image();
        tempImg.src = this.imageUrl;
  
        tempImg.onload = () => {
          this.imageStyle.transform = `
            translate(${this.imagePositionX}px, ${this.imagePositionY}px)
            scale(${scaleMultiplier})
            rotate(${this.rotationAngle}deg)
          `;
        };
      },
      async captureAndDisplayImage() {
        // Get a reference to the imageProcess container with the "imageProcess" class
        const imageProcessContainer = document.querySelector('.imageProcess');
        if (!imageProcessContainer) {
          console.error('ImageProcess container not found.');
          return;
        }
        try {
          // Wait for the image to load
          const imageElement = this.$refs.myDiv.querySelector('img');
          await imageElement.decode();
          // Capture the content of the imageProcess container as a canvas
          const canvas = await html2canvas(imageProcessContainer);
          // Convert the canvas to a data URL (base64 encoded image)
          const base64Image = canvas.toDataURL('image/png'); // You can specify the desired image format
          // Update the captured image source for preview
          this.capturedImageSrc = base64Image;
        } catch (error) {
          console.error('Capture error:', error);
        }
      },
      async processAndUploadImage() {
        try {
          await this.captureAndDisplayImage();

          if (!this.capturedImageSrc) {
            console.error('Captured image not available after captureAndDisplayImage.');
            return;
          }

          // Convert the base64 image to a Blob
          const blob = await (await fetch(this.capturedImageSrc)).blob();

          // Construct the filename with the profile ID as a prefix
          const filenamePrefix = this.profile._id;
          const uniqueFilename = `${filenamePrefix}_${Date.now()}.png`; // Always save as PNG

          const path = 'Upload/_profile/';

          const params = {
            Bucket: this.schoolSession.s3Bucket,
            Key: path + uniqueFilename,
            Body: blob,
            ACL: 'public-read'
          };

          console.log("params", params);

          // Upload the captured image to S3
          const data = await this.S3.send(new PutObjectCommand(params));

          // Construct the file URL
          const fileUrl = `https://${this.schoolSession.s3Bucket}.sgp1.digitaloceanspaces.com/${path}${uniqueFilename}`;

          this.base64Image = fileUrl; // Set base64Image to the newly uploaded image URL
          this.profile.avatar_img = fileUrl;

          await this.updataData(fileUrl);
          await this.getData(false);

          this.reloadImage();
          this.imageBlock = false;
          this.someAction();
          this.originalImageUrl = fileUrl;
          this.rotatedImageUrl = fileUrl;
          this.imageUrl = fileUrl;
          this.showPopup = false;

          // Reset the preview
          this.capturedImageSrc = null;
          this.imageStyle = null;

          this.resetCropArea();

          console.log('Upload successful. File URL:', data, fileUrl);
        } catch (error) {
          console.error('Upload error:', error);
        }
      },
      async updataData(image) {
        const callApi = await fetch("https://gateway.cloudrestfulapi.com/api/user/" + this.profile._id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json','client-token-key':this.configs.key
          },
          body: JSON.stringify({
            data: {
              "avatar_img": image,
            },
            options: {}
          })
        });
        await callApi.json();
  
        if (callApi.status === 200) {
          console.log("Update Profile Image");
        }
      },
      openFileInput() {
        this.$refs.fileInput.click();
      },
      processImageToBase64(url, callback) {
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
  
        // Set the expected content type to image/png (or the appropriate type)
        xhr.overrideMimeType('image/png');
  
        xhr.onload = () => {
          const blob = xhr.response;
          const reader = new FileReader();
  
          reader.onload = () => {
            const base64Result = reader.result;
            const dimensions = { width: 0, height: 0 }; // Initialize dimensions
  
            // Create an image element to get dimensions
            const img = new Image();
            img.src = base64Result;
            img.onload = () => {
              dimensions.width = img.width;
              dimensions.height = img.height;
              callback(base64Result, blob.size, dimensions); // Pass result, file size, and dimensions to the callback
            };
          };
  
          reader.readAsDataURL(blob);
        };
  
        xhr.open('GET', url);
        xhr.send();
      },
      handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            this.rotatedImageUrl = reader.result;
            this.base64Image = reader.result;
            this.capturedImageSrc = null;
            console.log('File size:', file.size, 'bytes'); // Log the file size
  
            // Create an image element to get dimensions
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
              console.log('Image width:', img.width, 'pixels');
              console.log('Image height:', img.height, 'pixels');
              // Update imageDetail array
              this.imageDetail = {
                size: file.size,
                width: img.width,
                height: img.height,
              };
  
              this.imageWidth = img.width;
              this.imageHeight = img.height;
            };
  
            this.someAction();
          };
          reader.readAsDataURL(file);
        } else if (this.profile.avatar_img) {
          console.log('handleFileChange');
          // Process image URL into base64
          this.processImageToBase64(this.profile.avatar_img, (base64Url, fileSize, dimensions) => {
            this.rotatedImageUrl = base64Url;
            this.base64Image = base64Url;
            this.capturedImageSrc = null;
            console.log('base64', base64Url);
            console.log('File size:', fileSize, 'bytes'); // Log the file size
            console.log('Image width:', dimensions.width, 'pixels'); // Log the image width
            console.log('Image height:', dimensions.height, 'pixels'); // Log the image height
            // Update imageDetail array
            this.imageDetail = {
              size: fileSize,
              width: dimensions.width,
              height: dimensions.height,
            };
  
            this.imageWidth = dimensions.width;
            this.imageHeight = dimensions.height;
  
            // this.someAction();
          });
        } else {
          console.error('No file or image URL provided.');
        }
      },
    },
  };
  </script>
  