<template>
    <div>
      <div>
        <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" :style="{ filter: filterStyle }"></canvas>
        <img :width="canvasWidth" :height="canvasHeight" :src="base64Image" alt="Image" :style="{ filter: filterStyle }" />
        <input v-model="text" placeholder="Enter text" />
        <button @click="convertToImage">Convert to Image</button>
        <button @click="toggleBlur">Toggle Blur</button>
        <button @click="toggleGrayscale">Toggle Grayscale</button>
        <button @click="saveAsFile">Save as File</button>
      </div>
  
      <!-- Input for image URL -->
      <input v-model="imageUrl" placeholder="Enter Image URL" />
      <button @click="convertImageUrlToBase64">Convert URL to Base64</button>
  
      
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        text: '',
        canvasWidth: 600,
        canvasHeight: 600,
        blur: 'blur(0px)',
        blurEnabled: false,
        grayscaleEnabled: false,
        base64Image: '',
        imageUrl: 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D',
      };
    },
    computed: {
      filterStyle() {
        return `${this.blur} ${this.grayscaleEnabled ? 'grayscale(100%)' : ''}`;
      },
    },
    methods: {
      imageToBase64(url, callback) {
        fetch(url)
          .then(response => response.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              const base64String = reader.result;
              callback(base64String);
            };
          });
      },
      convertToImage() {
        if (this.base64Image) {
          const canvas = this.$refs.canvas;
          const context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
  
          const img = new Image();
  
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            const newHeight = canvas.width / aspectRatio;
            canvas.height = newHeight;
            context.filter = this.filterStyle;
            context.drawImage(img, 0, 0, canvas.width, newHeight);
          };
  
          img.src = this.base64Image;
        }
      },
      toggleBlur() {
        if (this.blurEnabled) {
          this.blur = 'blur(0px)';
        } else {
          this.blur = 'blur(10px)';
        }
        this.blurEnabled = !this.blurEnabled;
      },
      toggleGrayscale() {
        this.grayscaleEnabled = !this.grayscaleEnabled;
      },
      async saveAsFile() {
        const canvas = this.$refs.canvas;
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        const offscreenContext = offscreenCanvas.getContext('2d');
        offscreenContext.filter = this.filterStyle;
        offscreenContext.drawImage(canvas, 0, 0);
        const dataURL = offscreenCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'image.png';
        link.click();
      },
      convertImageUrlToBase64() {
        if (this.imageUrl) {
          this.imageToBase64(this.imageUrl, (base64String) => {
            this.base64Image = base64String;
            this.convertToImage();
          });
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your component-specific styles here */
  </style>
  