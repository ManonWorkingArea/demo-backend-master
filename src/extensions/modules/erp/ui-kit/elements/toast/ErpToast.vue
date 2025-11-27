<template>
  <teleport to="body">
    <div class="fixed inset-0 pointer-events-none z-50">
      <!-- Center Position -->
      <div
        v-if="position === 'center'"
        class="flex items-center justify-center min-h-screen p-4"
      >
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="visible"
            :class="[
              'pointer-events-auto max-w-md w-full rounded-lg shadow-lg p-4 flex items-center space-x-3',
              toastClasses
            ]"
          >
            <div class="flex-shrink-0">
              <i :class="iconClasses" class="text-xl"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p v-if="title" :class="titleClasses" class="font-semibold">{{ title }}</p>
              <p :class="messageClasses" class="text-sm">{{ message }}</p>
            </div>
            <button
              v-if="closable"
              @click="close"
              :class="closeButtonClasses"
              class="flex-shrink-0 p-1 rounded-md hover:bg-opacity-20 transition-colors"
            >
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
        </transition>
      </div>

      <!-- Top Right Position -->
      <div
        v-if="position === 'top-right'"
        class="fixed top-4 right-4 flex flex-col space-y-2 max-w-sm w-full"
      >
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-x-full"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 translate-x-full"
        >
          <div
            v-if="visible"
            :class="[
              'pointer-events-auto rounded-lg shadow-lg p-4 flex items-start space-x-3',
              toastClasses
            ]"
          >
            <div class="flex-shrink-0 mt-0.5">
              <i :class="iconClasses" class="text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p v-if="title" :class="titleClasses" class="font-semibold text-sm">{{ title }}</p>
              <p :class="messageClasses" class="text-sm mt-1">{{ message }}</p>
              <!-- Progress Bar for Auto-dismiss -->
              <div v-if="duration && duration > 0" class="mt-2">
                <div class="w-full bg-white bg-opacity-30 rounded-full h-1">
                  <div
                    class="bg-white h-1 rounded-full transition-all ease-linear"
                    :style="{ width: progressWidth + '%' }"
                  ></div>
                </div>
              </div>
            </div>
            <button
              v-if="closable"
              @click="close"
              :class="closeButtonClasses"
              class="flex-shrink-0 p-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
        </transition>
      </div>

      <!-- Top Left Position -->
      <div
        v-if="position === 'top-left'"
        class="fixed top-4 left-4 flex flex-col space-y-2 max-w-sm w-full"
      >
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 -translate-x-full"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-full"
        >
          <div
            v-if="visible"
            :class="[
              'pointer-events-auto rounded-lg shadow-lg p-4 flex items-start space-x-3',
              toastClasses
            ]"
          >
            <div class="flex-shrink-0 mt-0.5">
              <i :class="iconClasses" class="text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p v-if="title" :class="titleClasses" class="font-semibold text-sm">{{ title }}</p>
              <p :class="messageClasses" class="text-sm mt-1">{{ message }}</p>
            </div>
            <button
              v-if="closable"
              @click="close"
              :class="closeButtonClasses"
              class="flex-shrink-0 p-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
        </transition>
      </div>

      <!-- Bottom Right Position -->
      <div
        v-if="position === 'bottom-right'"
        class="fixed bottom-4 right-4 flex flex-col space-y-2 max-w-sm w-full"
      >
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-full"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-full"
        >
          <div
            v-if="visible"
            :class="[
              'pointer-events-auto rounded-lg shadow-lg p-4 flex items-start space-x-3',
              toastClasses
            ]"
          >
            <div class="flex-shrink-0 mt-0.5">
              <i :class="iconClasses" class="text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p v-if="title" :class="titleClasses" class="font-semibold text-sm">{{ title }}</p>
              <p :class="messageClasses" class="text-sm mt-1">{{ message }}</p>
            </div>
            <button
              v-if="closable"
              @click="close"
              :class="closeButtonClasses"
              class="flex-shrink-0 p-1 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </teleport>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ErpToast',
  
  props: {
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'success',
      validator: (value) => ['success', 'error', 'warning', 'info', 'dark'].includes(value)
    },
    position: {
      type: String,
      default: 'top-right',
      validator: (value) => ['center', 'top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(value)
    },
    duration: {
      type: Number,
      default: 5000 // 5 seconds, 0 = permanent
    },
    closable: {
      type: Boolean,
      default: true
    }
  },

  emits: ['close'],

  setup(props, { emit }) {
    const visible = ref(false)
    const progressWidth = ref(100)
    let timer = null
    let progressTimer = null

    const toastClasses = computed(() => {
      const classes = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white',
        dark: 'bg-gray-800 text-white'
      }
      return classes[props.type] || classes.success
    })

    const iconClasses = computed(() => {
      const icons = {
        success: 'fas fa-check-circle text-white',
        error: 'fas fa-exclamation-circle text-white',
        warning: 'fas fa-exclamation-triangle text-white',
        info: 'fas fa-info-circle text-white',
        dark: 'fas fa-bell text-white'
      }
      return icons[props.type] || icons.success
    })

    const titleClasses = computed(() => 'text-white')
    const messageClasses = computed(() => 'text-white text-opacity-90')
    const closeButtonClasses = computed(() => 'text-white hover:bg-white')

    const show = () => {
      visible.value = true
      
      if (props.duration && props.duration > 0) {
        // Start progress animation
        progressWidth.value = 100
        progressTimer = setInterval(() => {
          progressWidth.value -= (100 / (props.duration / 100))
          if (progressWidth.value <= 0) {
            clearInterval(progressTimer)
          }
        }, 100)

        // Auto close timer
        timer = setTimeout(() => {
          close()
        }, props.duration)
      }
    }

    const close = () => {
      visible.value = false
      if (timer) clearTimeout(timer)
      if (progressTimer) clearInterval(progressTimer)
      
      setTimeout(() => {
        emit('close')
      }, 300) // Wait for exit animation
    }

    onMounted(() => {
      show()
    })

    onUnmounted(() => {
      if (timer) clearTimeout(timer)
      if (progressTimer) clearInterval(progressTimer)
    })

    return {
      visible,
      progressWidth,
      toastClasses,
      iconClasses,
      titleClasses,
      messageClasses,
      closeButtonClasses,
      close
    }
  }
}
</script>

<style scoped>
/* Custom animations for different positions */
@media (max-width: 640px) {
  .max-w-sm {
    max-width: calc(100vw - 2rem);
  }
  
  .fixed.top-4.right-4,
  .fixed.top-4.left-4,
  .fixed.bottom-4.right-4 {
    left: 1rem;
    right: 1rem;
    width: auto;
    max-width: none;
  }
}

/* Smooth progress bar animation */
.transition-all.ease-linear {
  transition-timing-function: linear;
}
</style>