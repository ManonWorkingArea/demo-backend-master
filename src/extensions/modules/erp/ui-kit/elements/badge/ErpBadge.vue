<template>
  <span :class="badgeClasses">
    <!-- Left Icon -->
    <i v-if="leftIcon" :class="[leftIcon, 'mr-1']"></i>
    
    <!-- Badge Content -->
    <slot>{{ text }}</slot>
    
    <!-- Right Icon or Close Button -->
    <i v-if="rightIcon && !closable" :class="[rightIcon, 'ml-1']"></i>
    <button
      v-if="closable"
      type="button"
      class="ml-1 -mr-0.5 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 focus:outline-none"
      @click="handleClose"
    >
      <i class="fas fa-times text-xs"></i>
    </button>
    
    <!-- Dot indicator -->
    <span v-if="dot" class="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
  </span>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ErpBadge',
  props: {
    text: {
      type: [String, Number],
      default: ''
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => [
        'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'
      ].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
    },
    rounded: {
      type: Boolean,
      default: false
    },
    outline: {
      type: Boolean,
      default: false
    },
    closable: {
      type: Boolean,
      default: false
    },
    dot: {
      type: Boolean,
      default: false
    },
    leftIcon: {
      type: String,
      default: ''
    },
    rightIcon: {
      type: String,
      default: ''
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    // Computed classes
    const badgeClasses = computed(() => {
      const classes = [
        'inline-flex items-center font-medium transition-colors focus:outline-none relative'
      ]

      // Size classes
      const sizeClasses = {
        xs: 'px-2 py-0.5 text-xs',
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
      }
      classes.push(sizeClasses[props.size])

      // Rounded
      if (props.rounded) {
        classes.push('rounded-full')
      } else {
        classes.push('rounded-md')
      }

      // Variant classes
      if (props.outline) {
        const outlineVariants = {
          primary: 'border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100',
          secondary: 'border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100',
          success: 'border border-green-200 text-green-700 bg-green-50 hover:bg-green-100',
          danger: 'border border-red-200 text-red-700 bg-red-50 hover:bg-red-100',
          warning: 'border border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100',
          info: 'border border-cyan-200 text-cyan-700 bg-cyan-50 hover:bg-cyan-100',
          light: 'border border-gray-200 text-gray-800 bg-white hover:bg-gray-50',
          dark: 'border border-gray-700 text-gray-200 bg-gray-800 hover:bg-gray-700'
        }
        classes.push(outlineVariants[props.variant])
      } else {
        const solidVariants = {
          primary: 'bg-blue-500 text-white hover:bg-blue-600',
          secondary: 'bg-gray-500 text-white hover:bg-gray-600',
          success: 'bg-green-500 text-white hover:bg-green-600',
          danger: 'bg-red-500 text-white hover:bg-red-600',
          warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
          info: 'bg-cyan-500 text-white hover:bg-cyan-600',
          light: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
          dark: 'bg-gray-800 text-white hover:bg-gray-900'
        }
        classes.push(solidVariants[props.variant])
      }

      return classes
    })

    // Methods
    const handleClose = () => {
      emit('close')
    }

    return {
      badgeClasses,
      handleClose
    }
  }
}
</script>