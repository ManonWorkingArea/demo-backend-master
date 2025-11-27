<template>
    <div class="relative z-0 w-full h-[600px]" @mouseover="stopAutoSlide" @mouseout="startAutoSlide">
      <div class="absolute top-0 left-0 w-full h-[600px]">
        <img :src="slides[currentIndex].src" :alt="`Slide ${currentIndex + 1}`" class="w-full h-full object-cover">
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
          <h1 class="text-4xl font-bold text-white mb-4 bg-black p-2">{{ slides[currentIndex].text.title }}</h1>
          <p class="text-lg text-gray-300">{{ slides[currentIndex].text.subtitle }}</p>
        </div>
      </div>
      <div class="absolute top-0 left-0 w-full h-[600px] flex items-center justify-between z-10">
        <button @click="prev" class="text-white hover:text-gray-300 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M13.707 15.707a1 1 0 01-1.414 0L6.293 10l6.414-5.707a1 1 0 111.414 1.414L9.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <button @click="next" class="text-white hover:text-gray-300 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6.293 15.707a1 1 0 001.414 0L13.707 10 7.293 4.293a1 1 0 00-1.414 1.414L10.586 10l-4.293 4.293a1 1 0 000 1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <div class="absolute bottom-0 left-0 w-full py-4 flex justify-center space-x-2 z-10">
        <button v-for="(slide, index) in slides" :key="index" @click="goTo(index)" :class="{ 'bg-gray-900': currentIndex === index }" class="w-3 h-3 rounded-full border-2 border-gray-900 hover:bg-gray-900 focus:outline-none"></button>
      </div>
    </div>
  </template>
  
  
  
  <script>
  export default {
    name: 'Slideshow',
    data() {
      return {
        currentIndex: 0,
        slides: [
          {
            src: 'https://img.freepik.com/free-photo/education-concept-student-studying-brainstorming-campus-concept-close-up-students-discussing-their-subject-books-textbooks-selective-focus_1418-627.jpg',
            text: {
              title: 'Slideshow Title 1',
              subtitle: 'Slideshow Subtitle 1 place here',
            },
          },
          {
            src: 'https://img.freepik.com/free-photo/group-happy-friends-student-talking-about-knowledge-cafe_1150-3979.jpg',
            text: {
              title: 'Title 2',
              subtitle: 'Subtitle 2',
            },
          },
          {
            src: 'https://img.freepik.com/premium-photo/abstract-blur-background-conference-hall-seminar-room_7188-569.jpg',
            text: {
              title: 'Title 3',
              subtitle: 'Subtitle 3',
            },
          },
        ],
        autoSlideInterval: null,
      };
    },
    mounted() {
      this.startAutoSlide();
    },
    beforeUnmount() {
      this.stopAutoSlide();
    },
    methods: {
      prev() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
      },
      next() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
      },
      goTo(index) {
        this.currentIndex = index;
      },
      startAutoSlide() {
        this.autoSlideInterval = setInterval(() => {
          this.next();
        }, 5000);
      },
      stopAutoSlide() {
        clearInterval(this.autoSlideInterval);
        this.autoSlideInterval = null;
      },
    },
  };
  </script>
  
  
  <style>
  .object-cover {
    object-fit: cover;
  }
  </style>
  