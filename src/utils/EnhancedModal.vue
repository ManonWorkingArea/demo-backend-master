<template>
  <Teleport to="body">
    <Transition
      name="modal"
      enter-active-class="modal-enter-active"
      leave-active-class="modal-leave-active"
      enter-from-class="modal-enter-from"
      leave-to-class="modal-leave-to"
    >
      <div
        v-if="modelValue"
        class="enhanced-modal-overlay"
        :class="overlayClasses"
        @click="handleOverlayClick"
        @keydown.esc="handleEscape"
        tabindex="-1"
        ref="overlay"
      >
        <div
          class="enhanced-modal-container"
          :class="containerClasses"
          :style="containerStyles"
          @click.stop
          ref="modal"
          role="dialog"
          :aria-labelledby="titleId"
          :aria-describedby="contentId"
          aria-modal="true"
        >
          <!-- Header -->
          <div
            v-if="!hideHeader"
            class="enhanced-modal-header"
            :class="headerClasses"
          >
            <div class="enhanced-modal-title-section">
              <div v-if="icon" class="enhanced-modal-icon" :class="iconClasses">
                <component :is="icon" v-if="typeof icon === 'object'" />
                <i v-else :class="icon"></i>
              </div>
              <h3
                :id="titleId"
                class="enhanced-modal-title"
                :class="titleClasses"
              >
                <slot name="title">{{ title }}</slot>
              </h3>
            </div>

            <div class="enhanced-modal-actions">
              <slot name="header-actions" />
              <button
                v-if="!hideCloseButton"
                @click="handleClose"
                class="enhanced-modal-close-btn"
                :class="closeBtnClasses"
                :disabled="loading"
                type="button"
                aria-label="Close modal"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div
            class="enhanced-modal-body"
            :class="bodyClasses"
            :id="contentId"
          >
            <div v-if="loading" class="enhanced-modal-loading">
              <div class="loading-spinner"></div>
              <p v-if="loadingText" class="loading-text">{{ loadingText }}</p>
            </div>

            <div v-else-if="error" class="enhanced-modal-error">
              <div class="error-icon">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 class="error-title">{{ errorTitle || 'Error' }}</h4>
              <p class="error-message">{{ error }}</p>
              <button
                v-if="retryAction"
                @click="retryAction"
                class="retry-btn"
              >
                Try Again
              </button>
            </div>

            <div v-else class="enhanced-modal-content">
              <slot :close="handleClose" />
            </div>
          </div>

          <!-- Footer -->
          <div
            v-if="!hideFooter && (hasFooterSlot || actions.length > 0)"
            class="enhanced-modal-footer"
            :class="footerClasses"
          >
            <slot name="footer" :close="handleClose">
              <div class="enhanced-modal-default-actions">
                <button
                  v-for="action in actions"
                  :key="action.key || action.label"
                  @click="handleAction(action)"
                  :disabled="loading || action.disabled"
                  :class="[
                    'enhanced-modal-action-btn',
                    action.variant || 'secondary',
                    action.class
                  ]"
                  :type="action.type || 'button'"
                >
                  <component
                    v-if="action.icon"
                    :is="action.icon"
                    class="w-4 h-4 mr-2"
                  />
                  <i v-else-if="action.iconClass" :class="[action.iconClass, 'mr-2']"></i>
                  {{ action.label }}
                </button>
              </div>
            </slot>
          </div>
        </div>

        <!-- Resize Handle (for resizable modals) -->
        <div
          v-if="resizable"
          class="enhanced-modal-resize-handle"
          @mousedown="startResize"
        ></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

export default {
  name: 'EnhancedModal',
  emits: [
    'update:modelValue',
    'close',
    'open',
    'action',
    'resize',
    'escape',
    'overlay-click'
  ],
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['xs', 'small', 'medium', 'large', 'xl', '2xl', 'full'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: value => ['default', 'success', 'warning', 'error', 'info'].includes(value)
    },
    position: {
      type: String,
      default: 'center',
      validator: value => ['center', 'top', 'bottom', 'left', 'right'].includes(value)
    },
    persistent: {
      type: Boolean,
      default: false
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    hideFooter: {
      type: Boolean,
      default: false
    },
    hideCloseButton: {
      type: Boolean,
      default: false
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    },
    closeOnEscape: {
      type: Boolean,
      default: true
    },
    icon: {
      type: [String, Object],
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: 'Loading...'
    },
    error: {
      type: String,
      default: null
    },
    errorTitle: {
      type: String,
      default: null
    },
    retryAction: {
      type: Function,
      default: null
    },
    actions: {
      type: Array,
      default: () => []
    },
    maxWidth: {
      type: String,
      default: null
    },
    maxHeight: {
      type: String,
      default: null
    },
    resizable: {
      type: Boolean,
      default: false
    },
    draggable: {
      type: Boolean,
      default: false
    },
    zIndex: {
      type: Number,
      default: 1000
    },
    backdrop: {
      type: String,
      default: 'dark',
      validator: value => ['dark', 'light', 'blur', 'none'].includes(value)
    },
    animation: {
      type: String,
      default: 'scale',
      validator: value => ['scale', 'slide', 'fade', 'bounce'].includes(value)
    },
    customClass: {
      type: [String, Object, Array],
      default: ''
    },
    customOverlayClass: {
      type: [String, Object, Array],
      default: ''
    }
  },
  setup(props, { emit, slots }) {
    const overlay = ref(null)
    const modal = ref(null)
    const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
    const contentId = `modal-content-${Math.random().toString(36).substr(2, 9)}`

    // Resize state
    const isResizing = ref(false)
    const modalSize = ref({ width: null, height: null })

    // Drag state
    const isDragging = ref(false)
    const modalPosition = ref({ x: 0, y: 0 })
    const dragOffset = ref({ x: 0, y: 0 })

    // Focus management
    let previousFocusElement = null

    // Computed classes and styles
    const overlayClasses = computed(() => [
      `modal-backdrop-${props.backdrop}`,
      `modal-position-${props.position}`,
      `modal-animation-${props.animation}`,
      props.customOverlayClass
    ])

    const containerClasses = computed(() => [
      'enhanced-modal',
      `modal-size-${props.size}`,
      `modal-variant-${props.variant}`,
      `modal-position-${props.position}`,
      {
        'modal-resizable': props.resizable,
        'modal-draggable': props.draggable,
        'modal-loading': props.loading
      },
      props.customClass
    ])

    const containerStyles = computed(() => {
      const styles = {
        zIndex: props.zIndex
      }

      if (props.maxWidth) styles.maxWidth = props.maxWidth
      if (props.maxHeight) styles.maxHeight = props.maxHeight

      if (modalSize.value.width) styles.width = `${modalSize.value.width}px`
      if (modalSize.value.height) styles.height = `${modalSize.value.height}px`

      if (props.draggable && (modalPosition.value.x || modalPosition.value.y)) {
        styles.transform = `translate(${modalPosition.value.x}px, ${modalPosition.value.y}px)`
      }

      return styles
    })

    const headerClasses = computed(() => [
      `header-variant-${props.variant}`
    ])

    const titleClasses = computed(() => [
      `title-variant-${props.variant}`
    ])

    const iconClasses = computed(() => [
      `icon-variant-${props.variant}`
    ])

    const bodyClasses = computed(() => [
      `body-variant-${props.variant}`
    ])

    const footerClasses = computed(() => [
      `footer-variant-${props.variant}`
    ])

    const closeBtnClasses = computed(() => [
      `close-btn-variant-${props.variant}`,
      {
        'opacity-50 cursor-not-allowed': props.loading
      }
    ])

    const hasFooterSlot = computed(() => !!slots.footer)

    // Methods
    const handleClose = () => {
      if (props.persistent || props.loading) return
      emit('update:modelValue', false)
      emit('close')
    }

    const handleOverlayClick = () => {
      emit('overlay-click')
      if (props.closeOnOverlay) {
        handleClose()
      }
    }

    const handleEscape = () => {
      emit('escape')
      if (props.closeOnEscape) {
        handleClose()
      }
    }

    const handleAction = (action) => {
      if (action.handler) {
        action.handler()
      }
      emit('action', action)
      
      if (action.close !== false) {
        handleClose()
      }
    }

    // Focus management
    const manageFocus = () => {
      if (props.modelValue) {
        previousFocusElement = document.activeElement
        nextTick(() => {
          const focusableElement = modal.value?.querySelector('[autofocus]') ||
                                   modal.value?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
          if (focusableElement) {
            focusableElement.focus()
          } else {
            modal.value?.focus()
          }
        })
      } else if (previousFocusElement) {
        previousFocusElement.focus()
        previousFocusElement = null
      }
    }

    // Resize functionality
    const startResize = (e) => {
      if (!props.resizable) return
      
      isResizing.value = true
      const startX = e.clientX
      const startY = e.clientY
      const startWidth = modal.value.offsetWidth
      const startHeight = modal.value.offsetHeight

      const onMouseMove = (e) => {
        if (!isResizing.value) return
        
        const newWidth = startWidth + (e.clientX - startX)
        const newHeight = startHeight + (e.clientY - startY)
        
        modalSize.value = {
          width: Math.max(300, newWidth),
          height: Math.max(200, newHeight)
        }
        
        emit('resize', modalSize.value)
      }

      const onMouseUp = () => {
        isResizing.value = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    // Drag functionality
    const startDrag = (e) => {
      if (!props.draggable) return
      
      isDragging.value = true
      dragOffset.value = {
        x: e.clientX - modalPosition.value.x,
        y: e.clientY - modalPosition.value.y
      }

      const onMouseMove = (e) => {
        if (!isDragging.value) return
        
        modalPosition.value = {
          x: e.clientX - dragOffset.value.x,
          y: e.clientY - dragOffset.value.y
        }
      }

      const onMouseUp = () => {
        isDragging.value = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    // Body scroll lock
    const lockBodyScroll = () => {
      document.body.style.overflow = 'hidden'
    }

    const unlockBodyScroll = () => {
      document.body.style.overflow = ''
    }

    // Watchers
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        lockBodyScroll()
        manageFocus()
        emit('open')
      } else {
        unlockBodyScroll()
        manageFocus()
      }
    })

    // Lifecycle
    onMounted(() => {
      if (props.draggable && modal.value) {
        const header = modal.value.querySelector('.enhanced-modal-header')
        if (header) {
          header.style.cursor = 'move'
          header.addEventListener('mousedown', startDrag)
        }
      }
    })

    onUnmounted(() => {
      unlockBodyScroll()
      if (previousFocusElement) {
        previousFocusElement.focus()
      }
    })

    return {
      overlay,
      modal,
      titleId,
      contentId,
      overlayClasses,
      containerClasses,
      containerStyles,
      headerClasses,
      titleClasses,
      iconClasses,
      bodyClasses,
      footerClasses,
      closeBtnClasses,
      hasFooterSlot,
      handleClose,
      handleOverlayClick,
      handleEscape,
      handleAction,
      startResize
    }
  }
}
</script>

<style scoped>
/* Base Modal Styles */
.enhanced-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Backdrop Variants */
.modal-backdrop-dark {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-backdrop-light {
  background-color: rgba(255, 255, 255, 0.8);
}

.modal-backdrop-blur {
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

.modal-backdrop-none {
  background-color: transparent;
}

/* Position Variants */
.modal-position-center {
  align-items: center;
  justify-content: center;
}

.modal-position-top {
  align-items: flex-start;
  justify-content: center;
  padding-top: 4rem;
}

.modal-position-bottom {
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4rem;
}

.modal-position-left {
  align-items: center;
  justify-content: flex-start;
  padding-left: 4rem;
}

.modal-position-right {
  align-items: center;
  justify-content: flex-end;
  padding-right: 4rem;
}

/* Modal Container */
.enhanced-modal-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Size Variants */
.modal-size-xs {
  width: 20rem;
  max-width: 90vw;
}

.modal-size-small {
  width: 28rem;
  max-width: 90vw;
}

.modal-size-medium {
  width: 32rem;
  max-width: 90vw;
}

.modal-size-large {
  width: 48rem;
  max-width: 90vw;
}

.modal-size-xl {
  width: 64rem;
  max-width: 90vw;
}

.modal-size-2xl {
  width: 80rem;
  max-width: 95vw;
}

.modal-size-full {
  width: 95vw;
  height: 95vh;
}

/* Variant Styles */
.modal-variant-success .enhanced-modal-header {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.modal-variant-warning .enhanced-modal-header {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.modal-variant-error .enhanced-modal-header {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.modal-variant-info .enhanced-modal-header {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

/* Header */
.enhanced-modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
}

.enhanced-modal-title-section {
  display: flex;
  align-items: center;
  flex: 1;
}

.enhanced-modal-icon {
  margin-right: 0.75rem;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.enhanced-modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.enhanced-modal-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.enhanced-modal-close-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.enhanced-modal-close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

/* Body */
.enhanced-modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.enhanced-modal-content {
  height: 100%;
}

/* Loading State */
.enhanced-modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Error State */
.enhanced-modal-error {
  text-align: center;
  padding: 2rem;
}

.error-icon {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.error-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

/* Footer */
.enhanced-modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.enhanced-modal-default-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.enhanced-modal-action-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  border: 1px solid transparent;
}

.enhanced-modal-action-btn.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.enhanced-modal-action-btn.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.enhanced-modal-action-btn.secondary {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.enhanced-modal-action-btn.secondary:hover {
  background: #f9fafb;
}

.enhanced-modal-action-btn.success {
  background: #10b981;
  color: white;
}

.enhanced-modal-action-btn.success:hover {
  background: #059669;
}

.enhanced-modal-action-btn.warning {
  background: #f59e0b;
  color: white;
}

.enhanced-modal-action-btn.warning:hover {
  background: #d97706;
}

.enhanced-modal-action-btn.danger {
  background: #ef4444;
  color: white;
}

.enhanced-modal-action-btn.danger:hover {
  background: #dc2626;
}

.enhanced-modal-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Resize Handle */
.enhanced-modal-resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 1rem;
  height: 1rem;
  cursor: nw-resize;
  background: linear-gradient(-45deg, transparent 0%, transparent 40%, #6b7280 40%, #6b7280 60%, transparent 60%);
}

/* Responsive */
@media (max-width: 640px) {
  .enhanced-modal-container {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .modal-size-xs,
  .modal-size-small,
  .modal-size-medium,
  .modal-size-large,
  .modal-size-xl,
  .modal-size-2xl {
    width: auto;
    max-width: none;
  }

  .enhanced-modal-header,
  .enhanced-modal-body,
  .enhanced-modal-footer {
    padding: 1rem;
  }

  .enhanced-modal-default-actions {
    flex-direction: column;
  }

  .enhanced-modal-action-btn {
    justify-content: center;
  }
}

/* Animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Scale Animation */
.modal-animation-scale .enhanced-modal-container {
  transition: all 0.3s ease;
}

.modal-animation-scale.modal-enter-from .enhanced-modal-container,
.modal-animation-scale.modal-leave-to .enhanced-modal-container {
  transform: scale(0.9);
}

/* Slide Animation */
.modal-animation-slide .enhanced-modal-container {
  transition: all 0.3s ease;
}

.modal-animation-slide.modal-enter-from .enhanced-modal-container,
.modal-animation-slide.modal-leave-to .enhanced-modal-container {
  transform: translateY(-2rem);
}

/* Fade Animation */
.modal-animation-fade .enhanced-modal-container {
  transition: all 0.3s ease;
}

/* Bounce Animation */
.modal-animation-bounce .enhanced-modal-container {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-animation-bounce.modal-enter-from .enhanced-modal-container,
.modal-animation-bounce.modal-leave-to .enhanced-modal-container {
  transform: scale(0.3);
}

/* Utilities */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .enhanced-modal-container {
    background: #1f2937;
    color: #f9fafb;
  }

  .enhanced-modal-header {
    background: #111827;
    border-bottom-color: #374151;
  }

  .enhanced-modal-footer {
    background: #111827;
    border-top-color: #374151;
  }

  .enhanced-modal-title {
    color: #f9fafb;
  }

  .enhanced-modal-close-btn {
    color: #9ca3af;
  }

  .enhanced-modal-close-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #d1d5db;
  }

  .enhanced-modal-action-btn.secondary {
    background: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }

  .enhanced-modal-action-btn.secondary:hover {
    background: #4b5563;
  }

  .loading-text,
  .error-message {
    color: #9ca3af;
  }
}
</style>
