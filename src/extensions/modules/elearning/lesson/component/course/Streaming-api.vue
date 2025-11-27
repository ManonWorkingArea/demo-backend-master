<template>
    <div id="streaming-desk">
      <h1>Streaming Desk</h1>
      <div class="video-container">
        <div class="block">
          <h2>Webcam</h2>
          <video ref="webcamVideo" autoplay muted></video>
          <button @click="startWebcam">Open Webcam</button>
        </div>
        <div class="block">
          <h2>Screen Capture</h2>
          <video ref="screenVideo" autoplay muted></video>
          <button @click="startScreenCapture">Share Screen</button>
        </div>
      </div>
      <button @click="startStreaming">Start Streaming to API.video</button>
    </div>
  </template>
  
  <script>
  
  export default {
    data() {
      return {
        webcamStream: null,
        screenCaptureStream: null,
        apiVideoStreamId: null,
        mediaRecorder: null,
      };
    },
    methods: {
      async startWebcam() {
        try {
          const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
          this.$refs.webcamVideo.srcObject = webcamStream;
          this.webcamStream = webcamStream;
        } catch (error) {
          console.error('Error starting webcam:', error);
        }
      },
      async startScreenCapture() {
        try {
          const screenCaptureStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          this.$refs.screenVideo.srcObject = screenCaptureStream;
          this.screenCaptureStream = screenCaptureStream;
        } catch (error) {
          console.error('Error starting screen capture:', error);
        }
      },
      async startStreaming() {
        if (!this.webcamStream && !this.screenCaptureStream) {
          console.error('No webcam or screen capture streams available');
          return;
        }
  
        // Step 1: Create a live stream on API.video
        try {
          const response = await fetch('https://ws.api.video/live-streams', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer boc7bUNFCfQsZIAnr4CQPdh1QdLzXbarbGbONErQ2Hs',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: 'My Live Stream',
            }),
          });
  
          if (response.status === 201) {
            const data = await response.json();
            this.apiVideoStreamId = data.liveStreamId;
            console.log('Live stream created:', this.apiVideoStreamId);
  
            // Step 2: Start the live stream
            await this.startLiveStream();
          } else {
            console.error('Failed to create a live stream on API.video');
            return;
          }
        } catch (error) {
          console.error('Error creating a live stream on API.video:', error);
          return;
        }
      },
      async startLiveStream() {
        if (this.apiVideoStreamId) {
          try {
            await fetch(`https://ws.api.video/live-streams/${this.apiVideoStreamId}/start`, {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer boc7bUNFCfQsZIAnr4CQPdh1QdLzXbarbGbONErQ2Hs',
              },
            });
            console.log('Live stream started:', this.apiVideoStreamId);
          } catch (error) {
            console.error('Error starting live stream:', error);
          }
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .video-container {
    display: flex;
    justify-content: space-between;
  }
  
  .block {
    flex: 1;
    margin: 0 10px;
    padding: 10px;
    border: 1px solid #ccc;
    text-align: center;
  }
  
  video {
    max-width: 100%;
  }
  </style>
  