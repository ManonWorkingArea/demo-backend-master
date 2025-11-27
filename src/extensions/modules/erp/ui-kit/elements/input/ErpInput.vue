<template>
  <div class="space-y-1">
    <!-- Label -->
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input Container -->
    <div class="relative">
      <!-- Left Icon -->
      <div v-if="leftIcon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i :class="[leftIcon, 'text-gray-400']"></i>
      </div>

      <!-- Input Element -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />

      <!-- Right Icon/Action -->
      <div v-if="rightIcon || showPassword" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <!-- Password Toggle -->
        <button
          v-if="showPassword && type === 'password'"
          type="button"
          class="text-gray-400 hover:text-gray-600 focus:outline-none"
          @click="togglePasswordVisibility"
        >
          <i :class="passwordVisible ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
        </button>
        
        <!-- Right Icon -->
        <i v-else-if="rightIcon" :class="[rightIcon, 'text-gray-400']"></i>
      </div>
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

    <!-- Success Message -->
    <p v-if="success" class="text-sm text-green-600">
      <i class="fas fa-check-circle mr-1"></i>
      {{ success }}
    </p>
  </div>
</template>

<script>
import { computed, ref, getCurrentInstance } from 'vue'

export default {
  name: 'ErpInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text',
      validator: (value) => [
        'text', 'email', 'password', 'number', 'tel', 'url', 'search'
      ].includes(value)
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
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
    success: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
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
    },
    showPassword: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    }
  },
  emits: ['update:modelValue', 'focus', 'blur', 'keydown'],
  setup(props, { emit }) {

// Reactive data
const passwordVisible = ref(false)
const inputId = ref(`input-${getCurrentInstance().uid}`)

// Computed classes
const labelClasses = computed(() => [
  'block text-sm font-medium',
  props.error ? 'text-red-700' : 'text-gray-700'
])

const inputClasses = computed(() => {
  const baseClasses = [
    'block w-full border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'readonly:bg-gray-50 readonly:text-gray-500'
  ]

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  }
  baseClasses.push(sizeClasses[props.size])

  // Icon padding
  if (props.leftIcon) {
    baseClasses.push('pl-10')
  }
  if (props.rightIcon || (props.showPassword && props.type === 'password')) {
    baseClasses.push('pr-10')
  }

  // State classes
  if (props.error) {
    baseClasses.push('border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500')
  } else if (props.success) {
    baseClasses.push('border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500')
  } else {
    baseClasses.push('border-gray-300 focus:ring-blue-500 focus:border-blue-500')
  }

  return baseClasses
})

// Methods
const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleFocus = (event) => {
  emit('focus', event)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleKeydown = (event) => {
  emit('keydown', event)
}

    const togglePasswordVisibility = () => {
      passwordVisible.value = !passwordVisible.value
      const input = document.getElementById(inputId.value)
      if (input) {
        input.type = passwordVisible.value ? 'text' : 'password'
      }
    }

    return {
      passwordVisible,
      inputId,
      labelClasses,
      inputClasses,
      handleInput,
      handleFocus,
      handleBlur,
      handleKeydown,
      togglePasswordVisibility
    }
  }
}
</script>