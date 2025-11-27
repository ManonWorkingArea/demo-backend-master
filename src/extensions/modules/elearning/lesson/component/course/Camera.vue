<template>
    <div class="camera-container">
      <h1>Camera Preview</h1>
      <div class="camera-preview">
        <video ref="video" autoplay></video>
        <button @click="startCamera" :disabled="isCameraActive">Start Camera</button>
        <button @click="captureImage" :disabled="!isCameraActive">Capture Image</button>
      </div>
      <img v-if="capturedImage" :src="capturedImage" alt="Captured" class="captured-image" />
    </div>


    <div>
        <div>
          <p>Press any key to start tracking:</p>
        </div>
        <div>
          <button @click="clearLog">Clear Log</button>
        </div>
        <div>
          <ul>
            <li v-for="(log, index) in keyLog" :key="index">{{ log }}</li>
          </ul>
        </div>
      </div>

  </template>
  
  <script>
  import hotkeys from 'hotkeys-js';
  export default {
    data() {
      return {
        keyLog: [],
        videoStream: null,
        capturedImage: null,
      };
    },
    computed: {
      isCameraActive() {
        return !!this.videoStream;
      },
    },
    methods: {
        trackKeys() {
            hotkeys('*', (event) => {
        // Log the detected key combination
        const keyCombination = event.key;
        const timestamp = new Date().toLocaleString();
        this.keyLog.push(`${keyCombination} detected - ${timestamp}`);
      });
    },
        clearLog() {
            this.keyLog = [];
        },
      async startCamera() {
        try {
          this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          this.$refs.video.srcObject = this.videoStream;
        } catch (error) {
          console.error('Error accessing camera:', error);
        }
      },
      captureImage() {
        if (this.videoStream) {
            const video = this.$refs.video;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Add current date and time text to the image
            const currentDateTime = new Date().toLocaleString();
            ctx.fillStyle = 'white'; // Text color
            ctx.font = '16px Arial'; // Text font
            ctx.fillText(currentDateTime, 10, 20); // Adjust text position as needed

            const capturedImageDataUrl = canvas.toDataURL('image/png');
            this.capturedImage = capturedImageDataUrl;
        }
        },
    },
    mounted() {
    this.trackKeys();
  },
    beforeUnmount() {
        hotkeys.unbind();
      if (this.videoStream) {
        this.videoStream.getTracks().forEach((track) => track.stop());
      }
    },
  };
  </script>
  
  <style scoped>
  .camera-container {
    text-align: center;
    padding: 20px;
  }
  
  .camera-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
  }
  
  video {
    max-width: 100%;
  }
  
  button {
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .captured-image {
    max-width: 100%;
  }
  </style>
  