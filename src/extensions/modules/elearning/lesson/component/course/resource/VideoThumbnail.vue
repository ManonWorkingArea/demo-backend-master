<template>
    <div 
      class="relative cursor-pointer group overflow-hidden rounded-lg shadow-lg" 
      @click="toggleVideoPlay" 
      :class="{'bg-gray-700': isHovering}" 
      @mouseover="isHovering = true" 
      @mouseleave="isHovering = false">
      
      <!-- Thumbnail Image -->
      <img :src="thumbnailUrl" alt="Video Thumbnail" class="w-full h-auto" v-if="!isPlaying">
      
      <!-- Play Icon -->
      <div class="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" v-show="!isPlaying">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-4.908-3.686A1 1 0 008 8.035v7.93a1 1 0 001.844.754l4.908-3.686a1 1 0 000-1.865z" />
        </svg>
      </div>
      
      <!-- Video -->
      <video ref="videoElement" class="relative top-0 left-0 w-full h-full" controls v-if="isPlaying">
        <source :src="videoUrl" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      videoUrl: String,
      thumbnailUrl: String,
    },
    data() {
      return {
        isHovering: false,
        isPlaying: false,
      };
    },
    methods: {
      toggleVideoPlay() {
        if (this.isPlaying) {
          this.pauseVideo();
        } else {
          this.playVideo();
        }
      },
      playVideo() {
        this.isPlaying = true;
        const video = this.$refs.videoElement;
        if (video) {
          video.play().catch(error => console.error("Error trying to play the video:", error));
        }
      },
      pauseVideo() {
        this.isPlaying = false;
        const video = this.$refs.videoElement;
        if (video) {
          video.pause();
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Style adjustments as needed */
  </style>
  