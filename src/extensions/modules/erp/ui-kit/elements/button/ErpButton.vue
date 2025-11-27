<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <div v-if="loading" class="flex items-center">
      <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span v-if="loadingText">{{ loadingText }}</span>
      <slot v-else></slot>
    </div>
    
    <!-- Normal Content -->
    <div v-else class="flex items-center justify-center">
      <i v-if="icon && iconPosition === 'left'" :class="[icon, { 'mr-2': $slots.default }]"></i>
      <slot></slot>
      <i v-if="icon && iconPosition === 'right'" :class="[icon, { 'ml-2': $slots.default }]"></i>
    </div>
  </button>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ErpButton',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => [
        'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'outline-primary', 'outline-secondary'
      ].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    type: {
      type: String,
      default: 'button',
      validator: (value) => ['button', 'submit', 'reset'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    iconPosition: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'right'].includes(value)
    },
    rounded: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props, { emit }) {

// Computed classes
const buttonClasses = computed(() => {
  const classes = [
    'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ]

  // Size classes
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
    xl: 'px-6 py-3 text-base'
  }
  classes.push(sizeClasses[props.size])

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500',
    light: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500',
    dark: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500',
    'outline-primary': 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
    'outline-secondary': 'border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white focus:ring-gray-500'
  }
  classes.push(variantClasses[props.variant])

  // Rounded
  if (props.rounded) {
    classes.push('rounded-full')
  } else {
    classes.push('rounded-md')
  }

  // Block
  if (props.block) {
    classes.push('w-full')
  }

  return classes
})

    // Handle click
    const handleClick = (event) => {
      if (!props.disabled && !props.loading) {
        emit('click', event)
      }
    }

    return {
      buttonClasses,
      handleClick
    }
  }
}
</script>