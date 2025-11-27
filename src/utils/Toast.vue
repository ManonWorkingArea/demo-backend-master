<template>
  <Transition
    :name="transitionName"
    @enter="onEnter"
    @leave="onLeave"
  >
    <div
      v-if="visible"
      :class="[
        'toast-container',
        `toast-${variant}`,
        `toast-${position}`,
        `toast-${size}`,
        {
          'toast-closable': closable,
          'toast-persistent': persistent
        }
      ]"
      @click="handleClick"
    >
      <!-- Toast Content -->
      <div class="toast-content">
        <!-- Icon -->
        <div v-if="showIcon" class="toast-icon">
          <font-awesome-icon 
            v-if="customIcon"
            :icon="customIcon" 
            :class="iconClass"
          />
          <font-awesome-icon 
            v-else
            :icon="defaultIcon" 
            :class="iconClass"
          />
        </div>

        <!-- Message Content -->
        <div class="toast-message">
          <div v-if="title" class="toast-title">{{ title }}</div>
          <div class="toast-text">{{ message }}</div>
        </div>

        <!-- Action Button -->
        <button
          v-if="actionText"
          @click.stop="handleAction"
          class="toast-action"
        >
          {{ actionText }}
        </button>

        <!-- Close Button -->
        <button
          v-if="closable"
          @click.stop="handleClose"
          class="toast-close"
        >
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
      </div>

      <!-- Progress Bar -->
      <div
        v-if="showProgress && duration"
        class="toast-progress"
        :style="progressStyle"
      ></div>
    </div>
  </Transition>
</template>

<script>
export default {
  props: {
    // Visibility control
    show: {
      type: Boolean,
      default: false
    },
    // Message content
    message: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    // Toast variant/type
    variant: {
      type: String,
      default: 'info',
      validator: value => ['success', 'error', 'warning', 'info'].includes(value)
    },
    // Duration (auto-hide after ms, 0 = no auto-hide)
    duration: {
      type: Number,
      default: 4000
    },
    // Position
    position: {
      type: String,
      default: 'top-right',
      validator: value => ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'].includes(value)
    },
    // Size
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    // Closable
    closable: {
      type: Boolean,
      default: true
    },
    // Persistent (doesn't auto-hide)
    persistent: {
      type: Boolean,
      default: false
    },
    // Custom icon
    customIcon: {
      type: Array,
      default: null
    },
    // Show icon
    showIcon: {
      type: Boolean,
      default: true
    },
    // Show progress bar
    showProgress: {
      type: Boolean,
      default: true
    },
    // Action button
    actionText: {
      type: String,
      default: ''
    },
    // Transition animation
    animation: {
      type: String,
      default: 'slide',
      validator: value => ['slide', 'fade', 'bounce'].includes(value)
    },
    // For backward compatibility
    option: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      progress: 100,
      timeoutId: null,
      progressInterval: null
    }
  },
  computed: {
    // For backward compatibility
    status() {
      return this.option.status || this.variant
    },
    computedMessage() {
      return this.option.message || this.message
    },
    defaultIcon() {
      const iconMap = {
        success: ['fas', 'check-circle'],
        error: ['fas', 'times-circle'],
        warning: ['fas', 'exclamation-triangle'],
        info: ['fas', 'info-circle'],
        sending: ['fas', 'envelope']
      }
      return iconMap[this.variant] || iconMap.info
    },
    iconClass() {
      return `toast-icon-${this.variant}`
    },
    transitionName() {
      return `toast-${this.animation}`
    },
    progressStyle() {
      return {
        width: `${this.progress}%`,
        transition: this.duration ? `width ${this.duration}ms linear` : 'none'
      }
    }
  },
  watch: {
    show: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.showToast()
        } else {
          this.hideToast()
        }
      }
    }
  },
  methods: {
    showToast() {
      this.visible = true
      this.progress = 100

      if (this.duration && !this.persistent) {
        // Start progress animation
        if (this.showProgress) {
          this.startProgress()
        }

        // Auto-hide after duration
        this.timeoutId = setTimeout(() => {
          this.hideToast()
        }, this.duration)
      }
    },
    hideToast() {
      this.visible = false
      this.clearTimers()
      this.$emit('hide')
      this.$emit('hide-toast') // For backward compatibility
    },
    handleClose() {
      this.hideToast()
      this.$emit('close')
    },
    handleClick() {
      this.$emit('click')
    },
    handleAction() {
      this.$emit('action')
    },
    startProgress() {
      this.progress = 100
      const interval = 50 // Update every 50ms
      const decrement = (100 * interval) / this.duration

      this.progressInterval = setInterval(() => {
        this.progress -= decrement
        if (this.progress <= 0) {
          this.progress = 0
          clearInterval(this.progressInterval)
        }
      }, interval)
    },
    clearTimers() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
        this.timeoutId = null
      }
      if (this.progressInterval) {
        clearInterval(this.progressInterval)
        this.progressInterval = null
      }
    },
    onEnter() {
      this.$emit('enter')
    },
    onLeave() {
      this.$emit('leave')
    }
  },
  beforeUnmount() {
    this.clearTimers()
  }
}
</script>
  
<style scoped>
/* Toast Container */
.toast-container {
  position: fixed;
  z-index: 10000;
  max-width: 420px;
  min-width: 300px;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toast-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15), 0 6px 8px rgba(0, 0, 0, 0.08);
}

/* Positioning */
.toast-top-right {
  top: 1rem;
  right: 1rem;
}

.toast-top-left {
  top: 1rem;
  left: 1rem;
}

.toast-bottom-right {
  bottom: 1rem;
  right: 1rem;
}

.toast-bottom-left {
  bottom: 1rem;
  left: 1rem;
}

.toast-top-center {
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.toast-bottom-center {
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

/* Sizes */
.toast-small {
  min-width: 280px;
  max-width: 350px;
}

.toast-medium {
  min-width: 300px;
  max-width: 420px;
}

.toast-large {
  min-width: 380px;
  max-width: 500px;
}

/* Variants */
.toast-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.toast-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.toast-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.toast-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

/* Toast Content */
.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  gap: 0.75rem;
  position: relative;
}

/* Icon */
.toast-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-icon-success {
  color: #d1fae5;
}

.toast-icon-error {
  color: #fecaca;
}

.toast-icon-warning {
  color: #fef3c7;
}

.toast-icon-info {
  color: #dbeafe;
}

/* Message */
.toast-message {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  opacity: 0.95;
}

.toast-text {
  font-size: 0.875rem;
  line-height: 1.4;
  opacity: 0.9;
}

/* Action Button */
.toast-action {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.toast-action:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* Close Button */
.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Progress Bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0 0 0.5rem 0.5rem;
}

/* Persistent indicator */
.toast-persistent .toast-progress {
  display: none;
}

/* Transitions */
.toast-slide-enter-active {
  transition: all 0.3s ease-out;
}

.toast-slide-leave-active {
  transition: all 0.3s ease-in;
}

.toast-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-fade-enter-active {
  transition: all 0.3s ease-out;
}

.toast-fade-leave-active {
  transition: all 0.3s ease-in;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.toast-bounce-enter-active {
  animation: bounce-in 0.6s ease-out;
}

.toast-bounce-leave-active {
  animation: bounce-out 0.3s ease-in;
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
}

/* Responsive Design */
@media (max-width: 640px) {
  .toast-container {
    left: 1rem !important;
    right: 1rem !important;
    transform: none !important;
    max-width: calc(100vw - 2rem);
    min-width: auto;
  }
  
  .toast-content {
    padding: 0.875rem;
  }
  
  .toast-large {
    min-width: auto;
    max-width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .toast-container {
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* Accessibility */
.toast-container:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

/* Legacy fade classes for backward compatibility */
.fade-in {
  opacity: 1;
  transition: opacity 0.3s ease-in;
}

.fade-out {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}
</style>