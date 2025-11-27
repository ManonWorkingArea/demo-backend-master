<template>
    <div>
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
      <button @click="startStreamingWithAdaptor" :disabled="!webcamStream">Start Streaming</button>
      <button @click="stopStreamingWithAdaptor" :disabled="!webRTCAdaptor">Stop Streaming</button>
      <div id="status_info">Status: {{ streamingStatus }}</div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { WebRTCAdaptor } from "@antmedia/webrtc_adaptor";
  
  export default {
    setup() {
      const webcamVideo = ref(null);
      const screenVideo = ref(null);
      const webcamStream = ref(null);
      const screenCaptureStream = ref(null);
      const webRTCAdaptor = ref(null);
      const streamingStatus = ref("Offline");
      const streamId = ref(null);
  
      const startWebcam = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          webcamVideo.value.srcObject = stream;
          webcamStream.value = stream;
        } catch (error) {
          console.error('Error starting webcam:', error);
        }
      };
  
      const startScreenCapture = async () => {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          screenVideo.value.srcObject = stream;
          screenCaptureStream.value = stream;
        } catch (error) {
          console.error('Error starting screen capture:', error);
        }
      };
  
      const startStreamingWithAdaptor = () => {
        try {
          streamId.value = "stream" + parseInt(Math.random() * 999999);
          streamingStatus.value = "Connecting...";
          
          // Publish the stream
          webRTCAdaptor.value.publish(streamId.value);
        } catch (error) {
          console.error('Error starting streaming with WebRTC Adaptor:', error);
        }
      };
  
      const stopStreamingWithAdaptor = () => {
        if (webRTCAdaptor.value) {
          // Stop the streaming session
          webRTCAdaptor.value.stop(streamId.value);
          streamingStatus.value = "Stopping...";
        }
      };
  
      onMounted(() => {
        // Initialize the WebRTCAdaptor
        webRTCAdaptor.value = new WebRTCAdaptor({
          websocket_url: "wss://ams-22851.antmedia.cloud:5443/RTCLIVE/websocket",
          localVideoElement: screenVideo.value,
          callback: (info) => {
            console.log("callback info: " + info);
            if (info === "publish_started") {
              console.log("publish started");
              streamingStatus.value = "Broadcasting - Stream Id: " + streamId.value;
            } else if (info === "publish_finished") {
              console.log("publish finished");
              streamingStatus.value = "Offline";
            }
          },
        });
      });
  
      return {
        webcamVideo,
        screenVideo,
        webcamStream,
        screenCaptureStream,
        webRTCAdaptor,
        streamingStatus,
        streamId,
        startWebcam,
        startScreenCapture,
        startStreamingWithAdaptor,
        stopStreamingWithAdaptor,
      };
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
  