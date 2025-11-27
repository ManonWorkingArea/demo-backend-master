<template>
    <div class="custom-back-to-top" @click="scrollToTop" 
         v-show="showBackToTop">
         <font-awesome-icon
         :icon="['fas', 'chevron-up']"
         class="icon"
       />
    </div>
  </template>
  
  <script>
  export default {
    name: 'BackToTop',
    
    data() {
      return {
        showBackToTop: false
      }
    },
  
    methods: {
      scrollToTop() {
        const currentPosition = window.pageYOffset
        const scrollStep = Math.PI / (500 / 15) // ปรับความเร็วตรงนี้
        let count = 0

        const cosParameter = currentPosition / 2
        
        const scrollInterval = requestAnimationFrame(function step() {
          if (window.pageYOffset <= 0) {
            cancelAnimationFrame(scrollInterval)
            return
          }

          count = count + 1
          window.scrollTo(0, Math.round(cosParameter * Math.cos(count * scrollStep)))

          requestAnimationFrame(step)
        })
      },
  
      handleScroll() {
        this.showBackToTop = window.scrollY > 500
      }
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll)
    },

    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll)
    }
  }
  </script>
  
  <style scoped>
  .custom-back-to-top {
    position: fixed;
    right: 30px;
    bottom: 30px;
    cursor: pointer;
    padding: 12px;
    background: rgba(31, 41, 55, 0.9); /* สีพื้นหลังแบบ dark */
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 999;
    border: 2px solid rgba(55, 65, 81, 0.5); /* สีขอบแบบ dark */
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
  }
  
  .custom-back-to-top:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
    background: rgba(17, 24, 39, 1); /* สีเข้มขึ้นเมื่อ hover */
    border-color: rgba(75, 85, 99, 0.7);
  }
  
  .custom-back-to-top:active {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .custom-back-to-top .icon {
    width: 16px;
    height: 16px;
    color: rgba(229, 231, 235, 0.9); /* สีไอคอนแบบ light */
    transition: color 0.3s ease;
  }
  
  .custom-back-to-top:hover .icon {
    color: rgba(255, 255, 255, 1); /* สีไอคอนสว่างขึ้นเมื่อ hover */
  }
  
  @media (max-width: 768px) {
    .custom-back-to-top {
      right: 20px;
      bottom: 20px;
      width: 36px;
      height: 36px;
      padding: 10px;
    }
    
    .custom-back-to-top .icon {
      width: 14px;
      height: 14px;
    }
  }
  </style>