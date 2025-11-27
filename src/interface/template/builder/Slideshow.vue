<template>
  <div class="relative z-0 slideshow">

    <div class="relative overflow-hidden" @mouseover="stopAutoSlide" @mouseout="startAutoSlide">
      <div class="inner-shadow">
        <a v-if="shouldShowLink" :href="data.slides[currentIndex].link" target="_blank">
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
            <template v-if="data.slides[currentIndex].content">
              <h1 class="text-4xl font-bold text-white mb-4 bg-black p-2">{{ data.slides[currentIndex].title }}</h1>
              <p class="text-lg text-gray-300">{{ data.slides[currentIndex].subtitle }}</p>
              <button v-if="data.slides[currentIndex].button" @click="openLink(data.slides[currentIndex].link)" class="text-white hover:text-gray-300 focus:outline-none mt-4">
                {{ data.slides[currentIndex].buttonText || 'Click Here' }}
              </button>
            </template>
          </div>
          <img :src="data.slides[currentIndex].image" :alt="`Slide ${currentIndex + 1}`" class="w-full h-auto">
        </a>
        <div v-else>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
            <template v-if="data.slides[currentIndex].content">
              <h1 class="text-4xl font-bold text-white mb-4 bg-black p-2">{{ data.slides[currentIndex].title }}</h1>
              <p class="text-lg text-gray-300">{{ data.slides[currentIndex].subtitle }}</p>
              <button v-if="data.slides[currentIndex].button" @click="openLink(data.slides[currentIndex].link)" class="text-white hover:text-gray-300 focus:outline-none mt-4">
                {{ data.slides[currentIndex].buttonText || 'Click Here' }}
              </button>
            </template>
          </div>
          <img :src="data.slides[currentIndex].image" :alt="`Slide ${currentIndex + 1}`" class="w-full h-auto" :style="{ cursor: shouldShowLink ? 'pointer' : 'auto' }" @click="shouldShowLink && openLink(data.slides[currentIndex].link)">
        </div>
      </div>
    </div>


    <div class="absolute inset-y-0 left-0 flex items-center justify-center z-10">
      <button @click="prev" class="text-white hover:text-gray-300 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M13.707 15.707a1 1 0 01-1.414 0L6.293 10l6.414-5.707a1 1 0 111.414 1.414L9.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    <div class="absolute inset-y-0 right-0 flex items-center justify-center z-10">
      <button @click="next" class="text-white hover:text-gray-300 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M6.293 15.707a1 1 0 001.414 0L13.707 10 7.293 4.293a1 1 0 00-1.414 1.414L10.586 10l-4.293 4.293a1 1 0 000 1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <div class="absolute bottom-0 left-0 w-full py-4 flex justify-center space-x-2 z-10">
      <button v-for="(slide, index) in data.slides" :key="index" @click="goTo(index)" :class="{ 'bg-gray-900': currentIndex === index }" class="w-3 h-3 rounded-full border-2 border-gray-900 hover:bg-gray-900 focus:outline-none"></button>
    </div>

  </div>
</template>

<script>
export default {
  name: 'Slideshow',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      currentIndex: 0,
      autoSlideInterval: null,
    };
  },
  mounted() {
    this.startAutoSlide();
  },
  beforeUnmount() {
    this.stopAutoSlide();
  },
  computed: {
    shouldShowLink() {
      return !!this.data.slides[this.currentIndex].link && (!this.data.slides[this.currentIndex].button || this.data.slides[this.currentIndex].button === 'false');
    }
  },
  methods: {
    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.data.slides.length) % this.data.slides.length;
    },
    next() {
      this.currentIndex = (this.currentIndex + 1) % this.data.slides.length;
    },
    goTo(index) {
      this.currentIndex = index;
    },
    startAutoSlide() {
      this.autoSlideInterval = setInterval(() => {
        this.next();
      }, this.data.interval || 5000);
    },
    stopAutoSlide() {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    },
    openLink(link) {
      if (link) {
        window.open(link, '_blank');
      }
    }
  },
};
</script>

<style>
.object-cover {
  object-fit: cover;
}

.aspect-w-2 {
  aspect-ratio: 2;
}

.aspect-h-1 {
  aspect-ratio: 1;
}

.inner-shadow {
  position: relative;
  z-index: 1;
}

.inner-shadow:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px; /* Adjust the height of the shadow as needed */
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
  pointer-events: none;
}


</style>
