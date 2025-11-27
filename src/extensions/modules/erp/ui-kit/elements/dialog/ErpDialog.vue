<template>
  <teleport to="body">
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
        @click.self="handleBackdropClick"
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
            class="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto"
            @click.stop
          >
            <!-- Header -->
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div v-if="icon" :class="iconClasses" class="flex-shrink-0">
                    <i :class="icon" class="text-xl"></i>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
                </div>
                <button
                  v-if="closable"
                  @click="handleClose"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="px-6 py-4">
              <p class="text-gray-700 mb-4">{{ message }}</p>
              
              <!-- Input for prompt type -->
              <input
                v-if="type === 'prompt'"
                ref="promptInput"
                v-model="inputValue"
                :placeholder="placeholder"
                @keydown.enter="handleConfirm"
                @keydown.escape="handleClose"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Actions -->
            <div class="px-6 py-4 bg-gray-50 rounded-b-lg">
              <div class="flex justify-end space-x-3">
                <!-- Cancel Button (for confirm and prompt) -->
                <button
                  v-if="type !== 'alert'"
                  @click="handleClose"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {{ cancelText }}
                </button>
                
                <!-- Confirm Button -->
                <button
                  @click="handleConfirm"
                  :class="confirmButtonClasses"
                  class="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                >
                  {{ confirmText }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { ref, computed, nextTick, onMounted } from 'vue'

export default {
  name: 'ErpDialog',
  
  props: {
    type: {
      type: String,
      default: 'alert',
      validator: (value) => ['alert', 'confirm', 'prompt'].includes(value)
    },
    title: {
      type: String,
      default: 'Dialog'
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: 'OK'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    placeholder: {
      type: String,
      default: 'Enter value...'
    },
    defaultValue: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'success', 'warning', 'danger'].includes(value)
    },
    closable: {
      type: Boolean,
      default: true
    }
  },

  emits: ['confirm', 'cancel', 'close'],

  setup(props, { emit }) {
    const visible = ref(false)
    const inputValue = ref(props.defaultValue)
    const promptInput = ref(null)

    const icon = computed(() => {
      const icons = {
        alert: {
          primary: 'fas fa-info-circle',
          success: 'fas fa-check-circle',
          warning: 'fas fa-exclamation-triangle',
          danger: 'fas fa-exclamation-circle'
        },
        confirm: {
          primary: 'fas fa-question-circle',
          success: 'fas fa-check-circle',
          warning: 'fas fa-exclamation-triangle',
          danger: 'fas fa-exclamation-triangle'
        },
        prompt: {
          primary: 'fas fa-edit',
          success: 'fas fa-edit',
          warning: 'fas fa-edit',
          danger: 'fas fa-edit'
        }
      }
      return icons[props.type]?.[props.variant]
    })

    const iconClasses = computed(() => {
      const classes = {
        primary: 'text-blue-500',
        success: 'text-green-500',
        warning: 'text-yellow-500',
        danger: 'text-red-500'
      }
      return classes[props.variant]
    })

    const confirmButtonClasses = computed(() => {
      const classes = {
        primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      }
      return classes[props.variant]
    })

    const show = async () => {
      visible.value = true
      if (props.type === 'prompt') {
        await nextTick()
        promptInput.value?.focus()
      }
    }

    const hide = () => {
      visible.value = false
    }

    const handleConfirm = () => {
      const result = props.type === 'prompt' ? inputValue.value : true
      emit('confirm', result)
      emit('close', { action: 'confirm', value: result })
      hide()
    }

    const handleClose = () => {
      const result = props.type === 'prompt' ? null : false
      emit('cancel', result)
      emit('close', { action: 'cancel', value: result })
      hide()
    }

    const handleBackdropClick = () => {
      if (props.closable) {
        handleClose()
      }
    }

    onMounted(() => {
      show()
    })

    return {
      visible,
      inputValue,
      promptInput,
      icon,
      iconClasses,
      confirmButtonClasses,
      show,
      hide,
      handleConfirm,
      handleClose,
      handleBackdropClick
    }
  }
}
</script>

<style scoped>
/* Focus trap for accessibility */
.dialog-content {
  outline: none;
}

/* Smooth animations */
.transition {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>