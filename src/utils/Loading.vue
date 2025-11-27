<template>
  <div class="loading-container" :class="containerClasses">
    <!-- Spinner Loading -->
    <div v-if="type === 'spinner'" class="spinner-container">
      <div class="spinner" :class="spinnerClasses"></div>
      <p v-if="showText" class="loading-text">{{ text }}</p>
    </div>

    <!-- Dots Loading -->
    <div v-else-if="type === 'dots'" class="dots-container">
      <div class="dots">
        <div class="dot" v-for="n in 3" :key="n" :style="{ animationDelay: `${(n - 1) * 0.2}s` }"></div>
      </div>
      <p v-if="showText" class="loading-text">{{ text }}</p>
    </div>

    <!-- Pulse Loading -->
    <div v-else-if="type === 'pulse'" class="pulse-container">
      <div class="pulse" :class="pulseClasses"></div>
      <p v-if="showText" class="loading-text">{{ text }}</p>
    </div>

    <!-- Page Loader (Original) -->
    <div v-else-if="type === 'page'" class="page-loader-container">
      <span class="page-loader"></span>
      <p v-if="showText" class="loading-text">{{ text }}</p>
    </div>

    <!-- Skeleton Loading -->
    <div v-else-if="type === 'skeleton'" class="skeleton-container">
      <div class="skeleton-item" v-for="n in lines" :key="n" :class="skeletonClasses"></div>
    </div>

    <!-- Progress Loading -->
    <div v-else-if="type === 'progress'" class="progress-container">
      <div class="progress-bar-bg">
        <div class="progress-bar" :style="{ width: `${progress}%` }" :class="progressClasses"></div>
      </div>
      <p v-if="showText" class="loading-text">{{ text }} {{ progress }}%</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'spinner',
      validator: value => ['spinner', 'dots', 'pulse', 'page', 'skeleton', 'progress'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    color: {
      type: String,
      default: 'blue',
      validator: value => ['blue', 'green', 'red', 'yellow', 'purple', 'gray'].includes(value)
    },
    overlay: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: 'กำลังโหลด...'
    },
    showText: {
      type: Boolean,
      default: true
    },
    lines: {
      type: Number,
      default: 3
    },
    progress: {
      type: Number,
      default: 0
    }
  },
  computed: {
    containerClasses() {
      return {
        'loading-overlay': this.overlay,
        'loading-inline': !this.overlay,
        [`loading-${this.size}`]: true
      }
    },
    spinnerClasses() {
      return {
        [`spinner-${this.size}`]: true,
        [`spinner-${this.color}`]: true
      }
    },
    pulseClasses() {
      return {
        [`pulse-${this.size}`]: true,
        [`pulse-${this.color}`]: true
      }
    },
    skeletonClasses() {
      return {
        [`skeleton-${this.size}`]: true
      }
    },
    progressClasses() {
      return {
        [`progress-${this.color}`]: true
      }
    }
  }
}
</script>
<style>
.preload{
    position: absolute;
    margin-top: 100px;
}
.loading-dot {
    float: right;
    color: #5c5c5c;
    font-weight: normal;
    margin-left: 2px;
}
.loading-text {
    float: left;
    color: #5c5c5c;
    font-weight: normal;
}
.page-loader {
    width: 200px;
    height: 140px;
    background: #8d2020;
    box-sizing: border-box;
    position: relative;
    border-radius: 8px;
    perspective: 1000px;
    zoom: 0.4;
  }

  .page-loader:before{
    content: '';
    position: absolute;
    left: 10px;
    right: 10px;
    top: 10px;
    bottom: 10px;
    border-radius:8px;
    background: #f5f5f5  no-repeat;
    background-size: 60px 10px;
    background-image: 	linear-gradient(#ddd 100px, transparent 0) ,
              linear-gradient(#ddd 100px, transparent 0), 
              linear-gradient(#ddd 100px, transparent 0), 
              linear-gradient(#ddd 100px, transparent 0), 
              linear-gradient(#ddd 100px, transparent 0), 
              linear-gradient(#ddd 100px, transparent 0);
    
    background-position: 15px 30px , 15px 60px , 15px 90px, 
              105px 30px , 105px 60px , 105px 90px;
    box-shadow: 0 0 10px rgba(0,0,0,0.25);
  }
  .page-loader:after {
    content: '';
      position: absolute;
      width: calc(50% - 10px);
      right: 10px;
      top: 10px;
      bottom: 10px;
      border-radius: 8px;
      background: #fff no-repeat;
      background-size: 60px 10px;
      background-image: linear-gradient(#ddd 100px, transparent 0), 
              linear-gradient(#ddd 100px, transparent 0), 
              linear-gradient(#ddd 100px, transparent 0);
      background-position: 50% 30px ,50% 60px , 50%  90px;
      transform: rotateY(0deg );
      transform-origin: left center;
    animation: paging 1s linear infinite;
  }


  @keyframes paging {
    to {
      transform: rotateY( -180deg );
    }
  }

  .dot1 {
    animation: visibility 2s linear infinite;
   }
   
   @keyframes visibility {
    0% {
    opacity: 1;
    }
    65% {
    opacity: 1;
    }
    66% {
    opacity: 0;
    }
    100% {
    opacity: 0;
    }
   }
   
   .dot2 {
    animation: visibility2 2s linear infinite;
   }
   
   @keyframes visibility2 {
    0% {
     opacity: 0;
    }
    21% {
     opacity: 0;
    }
    22% {
     opacity: 1;
    }
    65% {
     opacity: 1;
    }
    66% {
     opacity: 0;
    }
    100% {
     opacity: 0;
    }
   }
   
   .dot3 {
    animation: visibility3 2s linear infinite;
   }
   
   @keyframes visibility3 {
    0% {
     opacity: 0;
    }
    43% {
     opacity: 0;
    }
    44% {
     opacity: 1;
    }
    65% {
     opacity: 1;
    }
    66% {
     opacity: 0;
    }
    100% {
     opacity: 0;
    }
   }

/* Enhanced Loading Component Styles */

/* Container Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  z-index: 9999;
}

.loading-inline {
  padding: 2rem;
}

/* Spinner Styles */
.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.spinner-medium {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

.spinner-large {
  width: 56px;
  height: 56px;
  border-width: 4px;
}

.spinner-blue {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
}

.spinner-green {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #10b981;
}

.spinner-red {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #ef4444;
}

.spinner-yellow {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #f59e0b;
}

.spinner-purple {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #8b5cf6;
}

.spinner-gray {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #6b7280;
}

/* Dots Styles */
.dots-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

/* Pulse Styles */
.pulse-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pulse {
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

.pulse-small {
  width: 24px;
  height: 24px;
}

.pulse-medium {
  width: 40px;
  height: 40px;
}

.pulse-large {
  width: 56px;
  height: 56px;
}

.pulse-blue { background: #3b82f6; }
.pulse-green { background: #10b981; }
.pulse-red { background: #ef4444; }
.pulse-yellow { background: #f59e0b; }
.pulse-purple { background: #8b5cf6; }
.pulse-gray { background: #6b7280; }

/* Skeleton Styles */
.skeleton-container {
  width: 100%;
  max-width: 400px;
}

.skeleton-item {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-small {
  height: 12px;
}

.skeleton-medium {
  height: 16px;
}

.skeleton-large {
  height: 24px;
}

.skeleton-item:last-child {
  width: 60%;
}

/* Progress Styles */
.progress-container {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-blue { background: #3b82f6; }
.progress-green { background: #10b981; }
.progress-red { background: #ef4444; }
.progress-yellow { background: #f59e0b; }
.progress-purple { background: #8b5cf6; }
.progress-gray { background: #6b7280; }

/* Page Loader Container */
.page-loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* Enhanced Text Styles */
.loading-container .loading-text {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  text-align: center;
  float: none;
}

.loading-small .loading-text {
  font-size: 12px;
}

.loading-large .loading-text {
  font-size: 16px;
}

/* Enhanced Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Responsive Design */
@media (max-width: 640px) {
  .loading-overlay {
    padding: 1rem;
  }
  
  .spinner-large {
    width: 40px;
    height: 40px;
  }
  
  .pulse-large {
    width: 40px;
    height: 40px;
  }
  
  .skeleton-container {
    max-width: 280px;
  }
  
  .progress-container {
    max-width: 250px;
  }
}
</style>