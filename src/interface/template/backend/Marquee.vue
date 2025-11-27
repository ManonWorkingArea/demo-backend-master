<template>
    <div class="marquee">
      <div class="marquee-text" :style="{ animationDuration: duration + 's' }">{{ text }}</div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      text: {
        type: String,
        default: 'Default marquee text',
      },
      duration: {
        type: Number,
        default: 20, // Duration in seconds for one full cycle
      },
    },
  };
  </script>
  
  <style scoped>
  .marquee {
    overflow: hidden;
    white-space: nowrap;
  }
  
  .marquee-text {
    display: inline-block;
    padding-left: 100%; /* Start offscreen */
    animation-name: marqueeAnimation;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  
  @keyframes marqueeAnimation {
    from {
      transform: translateX(0%);
    }
    to {
      transform: translateX(-100%);
    }
  }
  </style>
  