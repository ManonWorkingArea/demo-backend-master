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
      antMediaStreamId: null,
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

      // Step 1: Create a stream in Ant Media Server (via HTTP request)
      try {
        const response = await fetch('https://your-ant-media-server-url:5080/LiveApp/rest/v2/broadcasts/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            streamId: 'mystream', // Change this to your desired stream name
          }),
        });

        const data = await response.json();

        if (data.streamId) {
          this.antMediaStreamId = data.streamId;
          console.log('Stream created:', this.antMediaStreamId);

          // Step 2: Publish the stream (via HTTP request)
          await this.publishStream();
        } else {
          console.error('Failed to create a stream in Ant Media Server');
          return;
        }
      } catch (error) {
        console.error('Error creating a stream in Ant Media Server:', error);
        return;
      }
    },
    async publishStream() {
      if (this.antMediaStreamId) {
        try {
          const response = await fetch('https://your-ant-media-server-url:5080/LiveApp/rest/v2/broadcasts/' + this.antMediaStreamId + '/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.status === 200) {
            console.log('Stream published:', this.antMediaStreamId);
          } else {
            console.error('Failed to publish the stream in Ant Media Server');
          }
        } catch (error) {
          console.error('Error publishing stream:', error);
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
  