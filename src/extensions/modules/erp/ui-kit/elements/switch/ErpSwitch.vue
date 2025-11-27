<template>
  <div class="space-y-1">
    <!-- Switch Container -->
    <div class="flex items-center justify-between" :class="containerClasses">
      <!-- Label and Description -->
      <div class="flex-1">
        <label v-if="label" :for="switchId" :class="labelClasses">
          {{ label }}
          <span v-if="required" class="text-red-500 ml-1">*</span>
        </label>
        <p v-if="description" class="text-sm text-gray-500 mt-1">
          {{ description }}
        </p>
      </div>

      <!-- Switch Toggle -->
      <button
        :id="switchId"
        type="button"
        :disabled="disabled"
        :class="switchClasses"
        @click="toggle"
        @keydown.space.prevent="toggle"
        @keydown.enter.prevent="toggle"
      >
        <span class="sr-only">{{ label || 'Toggle switch' }}</span>
        <!-- Switch Track -->
        <span :class="trackClasses" aria-hidden="true"></span>
        <!-- Switch Thumb -->
        <span :class="thumbClasses" aria-hidden="true">
          <!-- Icons -->
          <span v-if="showIcons" :class="iconClasses">
            <i v-if="modelValue" :class="onIcon || 'fas fa-check'"></i>
            <i v-else :class="offIcon || 'fas fa-times'"></i>
          </span>
        </span>
      </button>
    </div>

    <!-- Help Text -->
    <p v-if="helpText && !error" class="text-sm text-gray-500">
      {{ helpText }}
    </p>

    <!-- Error Message -->
    <p v-if="error" class="text-sm text-red-600">
      <i class="fas fa-exclamation-circle mr-1"></i>
      {{ error }}
    </p>
  </div>
</template>

<script>
import { computed, ref, getCurrentInstance } from 'vue'

export default {
  name: 'ErpSwitch',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    helpText: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    color: {
      type: String,
      default: 'blue',
      validator: (value) => ['blue', 'green', 'red', 'yellow', 'purple', 'indigo'].includes(value)
    },
    showIcons: {
      type: Boolean,
      default: false
    },
    onIcon: {
      type: String,
      default: ''
    },
    offIcon: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    // Reactive data
    const switchId = ref(`switch-${getCurrentInstance().uid}`)

    // Computed properties
    const containerClasses = computed(() => [
      props.label ? 'items-start' : 'items-center'
    ])

    const labelClasses = computed(() => [
      'block text-sm font-medium cursor-pointer',
      props.error ? 'text-red-700' : 'text-gray-700',
      props.disabled ? 'text-gray-400 cursor-not-allowed' : ''
    ])

    const switchClasses = computed(() => {
      const sizeClasses = {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-14'
      }
      
      return [
        'relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        sizeClasses[props.size],
        props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        props.modelValue ? getOnClasses() : getOffClasses(),
        getFocusClasses()
      ]
    })

    const trackClasses = computed(() => [
      'pointer-events-none relative inline-block h-full w-full rounded-full shadow transform ring-0 transition ease-in-out duration-200',
      props.modelValue ? getOnTrackClasses() : getOffTrackClasses()
    ])

    const thumbClasses = computed(() => {
      const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5', 
        lg: 'h-6 w-6'
      }

      const translateClasses = {
        sm: props.modelValue ? 'translate-x-4' : 'translate-x-0',
        md: props.modelValue ? 'translate-x-5' : 'translate-x-0',
        lg: props.modelValue ? 'translate-x-7' : 'translate-x-0'
      }

      return [
        'pointer-events-none absolute top-0 left-0 inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 flex items-center justify-center',
        sizeClasses[props.size],
        translateClasses[props.size]
      ]
    })

    const iconClasses = computed(() => {
      const sizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
      }

      return [
        'transition-colors duration-200',
        sizeClasses[props.size],
        props.modelValue ? getOnIconClasses() : getOffIconClasses()
      ]
    })

    // Helper methods for classes
    const getOnClasses = () => {
      const colorClasses = {
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        red: 'bg-red-600',
        yellow: 'bg-yellow-600',
        purple: 'bg-purple-600',
        indigo: 'bg-indigo-600'
      }
      return colorClasses[props.color]
    }

    const getOffClasses = () => 'bg-gray-200'

    const getOnTrackClasses = () => {
      const colorClasses = {
        blue: 'bg-blue-600',
        green: 'bg-green-600', 
        red: 'bg-red-600',
        yellow: 'bg-yellow-600',
        purple: 'bg-purple-600',
        indigo: 'bg-indigo-600'
      }
      return colorClasses[props.color]
    }

    const getOffTrackClasses = () => 'bg-gray-200'

    const getFocusClasses = () => {
      const colorClasses = {
        blue: 'focus:ring-blue-500',
        green: 'focus:ring-green-500',
        red: 'focus:ring-red-500', 
        yellow: 'focus:ring-yellow-500',
        purple: 'focus:ring-purple-500',
        indigo: 'focus:ring-indigo-500'
      }
      return colorClasses[props.color]
    }

    const getOnIconClasses = () => {
      const colorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600', 
        purple: 'text-purple-600',
        indigo: 'text-indigo-600'
      }
      return colorClasses[props.color]
    }

    const getOffIconClasses = () => 'text-gray-400'

    // Methods
    const toggle = () => {
      if (!props.disabled) {
        const newValue = !props.modelValue
        emit('update:modelValue', newValue)
        emit('change', newValue)
      }
    }

    return {
      switchId,
      containerClasses,
      labelClasses,
      switchClasses,
      trackClasses,
      thumbClasses,
      iconClasses,
      toggle
    }
  }
}
</script>