<template>
  <div class="space-y-1">
    <!-- Label -->
    <label v-if="label" :for="textareaId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Textarea Container -->
    <div class="relative">
      <!-- Textarea Element -->
      <textarea
        :id="textareaId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="rows"
        :maxlength="maxlength"
        :class="textareaClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      ></textarea>

      <!-- Character Count -->
      <div v-if="showCount && maxlength" class="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1 rounded">
        {{ characterCount }}/{{ maxlength }}
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
  name: 'ErpTextarea',
  props: {
    modelValue: {
      type: String,
      default: ''
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
    rows: {
      type: Number,
      default: 3
    },
    maxlength: {
      type: Number,
      default: null
    },
    showCount: {
      type: Boolean,
      default: false
    },
    resize: {
      type: String,
      default: 'vertical',
      validator: (value) => ['none', 'vertical', 'horizontal', 'both'].includes(value)
    }
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    // Reactive data
    const textareaId = ref(`textarea-${getCurrentInstance().uid}`)

    // Computed properties
    const labelClasses = computed(() => [
      'block text-sm font-medium',
      props.error ? 'text-red-700' : 'text-gray-700'
    ])

    const textareaClasses = computed(() => {
      const baseClasses = [
        'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors',
        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
        'readonly:bg-gray-50 readonly:text-gray-500'
      ]

      // Resize classes
      const resizeClasses = {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize'
      }
      baseClasses.push(resizeClasses[props.resize])

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

    const characterCount = computed(() => {
      return props.modelValue ? props.modelValue.length : 0
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

    return {
      textareaId,
      labelClasses,
      textareaClasses,
      characterCount,
      handleInput,
      handleFocus,
      handleBlur
    }
  }
}
</script>