<template>
    <div>
      <div v-if="data && data.youtubeurl" class="video-container">
        <iframe
          :src="'https://www.youtube.com/embed/' + extractYouTubeId(data.youtubeurl)"
          class="w-full aspect-video"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
      <h1
        v-else
        :class="[getHeaderClasses(), styles.classes]"
        :style="styles.style"
      >
        {{ data && data.text ? data.text : '' }}
      </h1>
    </div>
  </template>
  
  <script>
  import { generateStyles } from '@/plugins/builder.js';
  
  export default {
    props: {
      data: {
        type: Object,
        required: true,
      },
    },
    methods: {
      getHeaderClasses() {
        const classes = [
          'text-' + this.data.color,
          'text-' + this.data.fontSize,
          'font-' + this.data.fontWeight,
          'text-' + this.data.align,
        ];
  
        if (this.data.heightOption === 'auto') {
          classes.push('h-auto');
        } else if (this.data.heightOption === 'full') {
          classes.push('h-full');
          if (this.data.alignH === 'top') {
            classes.push('align-top');
          } else if (this.data.alignH === 'middle') {
            classes.push('align-middle');
          } else if (this.data.alignH === 'bottom') {
            classes.push('align-bottom');
          }
  
          if (this.data.alignH === 'middle' || this.data.alignH === 'bottom') {
            classes.push('leading-normal');
          }
        } else if (this.data.heightOption === 'manual') {
          const heightValue = this.data.height + this.data.heightUnit;
          classes.push('h-' + heightValue);
          if (this.data.heightUnit === 'px') {
            classes.push('leading-' + heightValue);
          }
        }
  
        return classes;
      },
      extractYouTubeId(url) {
        if (!url || typeof url !== 'string') {
          return '';
        }
        const match = url.match(
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        return match ? match[1] : '';
      },
    },
    computed: {
      styles() {
        return generateStyles(this.data);
      },
    },
  };
  </script>
  
  <style>
  .video-container {
    width: 100%;
    position: relative;
  }
  .aspect-video {
    aspect-ratio: 16 / 9;
  }
  </style>
  