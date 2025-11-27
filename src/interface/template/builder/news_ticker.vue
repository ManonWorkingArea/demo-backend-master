<template>
    <div class="news-ticker-wrapper overflow-hidden whitespace-nowrap relative">
      <div 
        class="news-ticker inline-block absolute" 
        ref="ticker"
        :style="{ transform: `translateX(${position}px)`, color: textColor }">
        {{ text }}
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
        text: this.data.text,
        position: 0,
        speed: this.data.speed || 2,
        direction: this.data.direction || 'left',
        textColor: this.data.textColor || '#ffffff',
        tickerWidth: 0,
        containerWidth: 0,
        animationFrame: null,
      };
    },
    mounted() {
      this.tickerWidth = this.$refs.ticker.offsetWidth;
      this.containerWidth = this.$el.offsetWidth;
      this.startTicker();
    },
    beforeUnmount() {
      cancelAnimationFrame(this.animationFrame);
    },
    methods: {
      startTicker() {
        this.position = this.direction === 'left' ? this.containerWidth : -this.tickerWidth;
        this.animate();
      },
      animate() {
        if (this.direction === 'left') {
          this.position -= this.speed;
          if (this.position <= -this.tickerWidth) {
            this.position = this.containerWidth;
          }
        } else {
          this.position += this.speed;
          if (this.position >= this.containerWidth) {
            this.position = -this.tickerWidth;
          }
        }
        this.animationFrame = requestAnimationFrame(this.animate);
      },
      stopTicker() {
        cancelAnimationFrame(this.animationFrame);
      },
      resetTicker() {
        this.position = this.direction === 'left' ? this.containerWidth : -this.tickerWidth;
      },
      changeSpeed(newSpeed) {
        this.speed = newSpeed;
      }
    }
  };
  </script>
  
  <style scoped>
  .news-ticker-wrapper {
    width: 100%;
    padding: 10px;
    height: 40px; /* Set a height for consistency */
    box-sizing: border-box;
  }
  
  .news-ticker {
    font-size: 14px;
    color: #fff;
    white-space: nowrap;
  }
  </style>
  