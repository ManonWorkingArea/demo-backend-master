<template>
    <div>
      <!-- Overlay -->
      <div v-if="showPopup" class="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-50"></div>
  
      <!-- Popup Content -->
      <div v-if="showPopup" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 text-center z-50">
        <!-- Popup Title -->
        <h2 class="text-xl font-bold mb-4">{{ data.title }}</h2>
  
        <!-- Popup Content Type -->
        <div v-if="data.contentType === 'image'" class="mb-4">
          <img :src="data.imageUrl" :alt="data.alt" />
        </div>
        <div v-else-if="data.contentType === 'video'" class="mb-4">
          <video :src="data.videoUrl" controls></video>
        </div>
        <div v-else-if="data.contentType === 'text'" class="text-base leading-relaxed mb-4">
          {{ data.textContent }}
        </div>
  
        <!-- Close Button -->
        <button class="bg-gray-700 text-white px-4 py-2 rounded" @click="closePopup">Close</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        showPopup: false
      };
    },
    mounted() {
      const displayType = this.data.displayType;
  
      if (displayType === 'firstVisit') {
        const isFirstVisit = !localStorage.getItem('visited');
        if (isFirstVisit) {
          localStorage.setItem('visited', 'true');
          setTimeout(() => {
            this.showPopup = true;
            if (this.data.autoclose) {
              setTimeout(() => {
                this.closePopup();
              }, this.data.autocloseDelay);
            }
          }, this.data.delay);
        }
      } else if (displayType === 'everyReload') {
        setTimeout(() => {
          this.showPopup = true;
          if (this.data.autoclose) {
            setTimeout(() => {
              this.closePopup();
            }, this.data.autocloseDelay);
          }
        }, this.data.delay);
      }
    },
    methods: {
      closePopup() {
        this.showPopup = false;
      }
    }
  };
  </script>
  