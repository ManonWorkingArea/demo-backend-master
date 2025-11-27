<template>
  <div class="relative" :data-content="'กำลังอัพโหลดไฟล์วีดีโอ กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
    <div class="aspect-w-16 aspect-h-9">
      <div class="absolute inset-0 flex justify-center items-center">
        <div class="w-full h-full bg-gray-900">
          <video ref="videoElement" autoplay playsinline class="w-full h-full object-cover"></video>
          <video v-if="videoURL" :src="videoURL" controls webkit-playsinline playsinline class="absolute top-0 left-0 w-full h-full object-cover"></video>
        </div>
      </div>
    </div>
    <div class="relative bottom-0 left-0 w-full p-4 bg-gray-900 bg-opacity-75 flex justify-center">
      <button @click="activateCamera" :disabled="recording || cameraActive" class="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2">1.เปิดกล้อง</button>
      <button @click="startRecording" :disabled="recording || !cameraActive" class="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 mr-2">
        <span v-if="!recording">2.บันทึกวีดีโอ</span>
        <span v-else>
        กำลังบันทึก...
        </span>
      </button>
      <!-- <button @click="stopRecording" :disabled="!recording" class="py-2 px-4 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2">หยุด</button> -->
      <!-- <button @click="sendBase64" class="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600">ส่ง</button> -->
      <button @click="uploadRecordedVideo" class="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600">3.ส่งวีดีโอ</button>

    </div>
    <!-- <div class="absolute bottom-0 left-0 w-full p-4 bg-gray-900 bg-opacity-75" v-if="videoBase64 !== null">
      <h3 class="text-xl font-bold text-white mb-2">Base64 Representation:</h3>
      <textarea readonly v-model="videoBase64" class="w-full bg-gray-100 p-2"></textarea>
    </div> -->
    <div class="absolute top-0 left-0 w-full p-2" v-if="recording">
      <div class="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full inline-flex items-center">
        <i class="fas fa-circle red-icon mr-1"></i> Recording...
      </div>
    </div>
    <div class="absolute top-0 right-0 m-2 text-white font-bold code-overlay" v-if="recording">{{ currentDateTime }}</div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl font-bold code-overlay" v-if="showCode">{{ code }}</div>
  </div>
</template>

<script>
import { S3 } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import storageManager from "@/plugins/storage";
export default {
  data() {
    const session = storageManager.get("configs");
    const schoolSession = session;
    const s3Client = new S3({
      forcePathStyle: false,
      endpoint: schoolSession.s3EndpointDefault,
      region: schoolSession.s3Region,
      ResponseContentEncoding: "utf-8",
      credentials: {
        accessKeyId: schoolSession.s3Key,
        secretAccessKey: schoolSession.s3Secret,
      },
    });

    return {

      activeBlock: false,

      uploadedFiles: [],
      S3: s3Client,
      schoolSession: schoolSession,
      outputfile: [],
      errorText: "",
      successText: "",
      previewImages: [],
      uploadedFileUrl: '',


      videoElement: null,
      recording: false,
      videoBase64: null,
      mediaRecorder: null,
      recordedChunks: [],
      cameraActive: false,
      videoURL: null,
      mediaStream: null,
      currentDateTime: '',
      showCode: false,
      code: null,
      preview: false
    };
  },
  mounted() {
    this.videoElement = this.$refs.videoElement;
    setInterval(this.updateDateTime, 1000); // Update date and time every second
  },
  methods: {
    async captureImage() {
      const video = this.$refs.videoElement;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to Blob
      canvas.toBlob(async (blob) => {
        try {
          this.activeBlock = true; // Assuming you want to block UI during upload
          const uniqueId = Date.now() + '-' + Math.floor(Math.random() * 10000000000);
          const file_extension = 'png'; // Or 'jpeg', depending on the desired format
          const newFileName = `verified_image/${uniqueId}.${file_extension}`; // Modified key

          const uploadParams = {
            Bucket: this.schoolSession.s3Bucket,
            Key: newFileName,
            Body: blob,
            ACL: "public-read", // Ensure the file is publicly accessible
          };

          // Perform the upload
          await this.S3.send(new PutObjectCommand(uploadParams));

          // Construct the URL to access the uploaded image
          const uploadedImageUrl = `${this.schoolSession.s3Endpoint}${newFileName}`;
          console.log("Image uploaded successfully:", uploadedImageUrl);

          // Emit an event with the image URL for the parent component
          this.$emit('imageUploaded', uploadedImageUrl);

          this.activeBlock = false; // Unblock UI
        } catch (error) {
          console.error("Error uploading image:", error);
          this.activeBlock = false; // Ensure UI is unblocked in case of error
        }
      }, 'image/png'); // Or 'image/jpeg'
    },
    async uploadRecordedVideo() {
      if (!this.videoBlob || this.videoBlob.size === 0) {
        console.error('No video to upload or video is empty.');
        return;
      }

      try {
        await this.uploadVideo(this.videoBlob);
        console.log('Upload successful');
        this.successText = "Video uploaded successfully";
      } catch (error) {
        console.error('Upload failed:', error);
        this.errorText = "Error uploading video";
      }
    },
    async uploadVideo(blob) {
      try {
        this.activeBlock = true;
        const uniqueId = Date.now() + '-' + Math.floor(Math.random() * 10000000000); // Generate unique identifier
        const file_extension = 'mp4';
        const newFileName = `${uniqueId}.${file_extension}`; // New unique filename

        const uploadParams = {
          Bucket: this.schoolSession.s3Bucket,
          Key: "verified/" + newFileName,
          Body: blob,
          ACL: "public-read",
        };

        const data = await this.S3.send(new PutObjectCommand(uploadParams));

        this.uploadedFileUrl = `${this.schoolSession.s3Endpoint}verified/${newFileName}`; // Store or process the URL as needed

        console.log("Video uploaded successfully:", data);
        this.successText = "Video uploaded successfully";
        this.activeBlock = false;
        this.$emit('webcam-recorder', this.uploadedFileUrl);
        // Optionally, emit an event or call another method to handle the successful upload
      } catch (error) {
        console.error("Error uploading video:", error);
        this.errorText = "Error uploading video";
      }
    },
    sendBase64() {
      this.convertToBase64();
    },
    async activateCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        this.videoElement.srcObject = stream;
        this.mediaStream = stream;
        this.cameraActive = true;
        console.log('Camera activated');
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    },
    startRecording() {
      if (!this.cameraActive) {
        console.error('Camera is not active.');
        return;
      }

      this.recordedChunks = [];
      this.videoURL = null;
      try {
        this.mediaRecorder = new MediaRecorder(this.mediaStream);
        this.mediaRecorder.ondataavailable = this.handleDataAvailable;
        this.mediaRecorder.start();
        this.recording = true;
        this.showCode = true;
        this.preview = false;
        this.generateRandomCode();
        console.log('Recording started');
        setTimeout(this.stopRecording, 5000); // Stop recording after 5 seconds
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    },
    stopRecording() {
      if (this.mediaRecorder && this.recording) {
        this.mediaRecorder.stop();
        this.recording = false;
        this.showCode = false;
        console.log('Recording stopped');
        
        // Ensure the MediaRecorder has stopped before creating the blob
        this.mediaRecorder.onstop = () => {
          const videoBlob = new Blob(this.recordedChunks, { type: 'video/mp4' });
          console.log('Blob size:', videoBlob.size); // Log the blob size for debugging
          
          if (videoBlob.size > 0) {
            this.videoBlob = videoBlob; // Save the blob for later use if it contains data
            this.previewRecording(); // Update the preview with the new blob
          } else {
            console.error('No video data available to upload.');
          }
        };
      }
    },

    handleDataAvailable(event) {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
        this.previewRecording();
      }
    },
    async previewRecording() {
      const blob = new Blob(this.recordedChunks, { type: 'video/mp4' });
      this.videoURL = URL.createObjectURL(blob);
      console.log('Preview updated');
    },
    async convertToBase64() {
      if (this.recordedChunks.length === 0) {
        console.error('No video data available.');
        return;
      }

      const blob = new Blob(this.recordedChunks, { type: 'video/mp4' });
      const base64String = await this.blobToBase64(blob);
      this.videoBase64 = base64String;
      this.$emit('webcam-recorder', this.videoBase64);
      console.log('Video converted to Base64');
    },
    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    },
    updateDateTime() {
      const now = new Date();
      this.currentDateTime = now.toLocaleString();
    },
    generateRandomCode() {
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      this.code = randomCode.toString();
    }
  }
};
</script>

<style>
  .red-icon {
    color: red;
    margin-right: 5px;
  }
  .code-overlay {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }
  
</style>
