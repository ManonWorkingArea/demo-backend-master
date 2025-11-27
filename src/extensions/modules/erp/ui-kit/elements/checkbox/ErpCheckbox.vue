<template>
  <div class="space-y-1">
    <!-- Single Checkbox -->
    <div v-if="!options.length" class="flex items-center">
      <input
        :id="checkboxId"
        type="checkbox"
        :value="value"
        :checked="isChecked"
        :disabled="disabled"
        :required="required"
        :class="checkboxClasses"
        @change="handleChange"
      />
      <label :for="checkboxId" :class="labelClasses" class="ml-2">
        {{ label }}
        <span v-if="required" class="text-red-500 ml-1">*</span>
      </label>
    </div>

    <!-- Multiple Checkboxes -->
    <div v-else class="space-y-2">
      <legend v-if="label" :class="legendClasses">
        {{ label }}
        <span v-if="required" class="text-red-500 ml-1">*</span>
      </legend>
      
      <div :class="optionsLayout">
        <div
          v-for="(option, index) in options"
          :key="getOptionValue(option)"
          class="flex items-center"
        >
          <input
            :id="`${checkboxId}-${index}`"
            type="checkbox"
            :value="getOptionValue(option)"
            :checked="isOptionChecked(option)"
            :disabled="disabled || isOptionDisabled(option)"
            :class="checkboxClasses"
            @change="handleOptionChange(option, $event)"
          />
          <label :for="`${checkboxId}-${index}`" :class="optionLabelClasses(option)" class="ml-2">
            {{ getOptionLabel(option) }}
          </label>
        </div>
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
  </div>
</template>

<script>
import { computed, ref, getCurrentInstance } from 'vue'

export default {
  name: 'ErpCheckbox',
  props: {
    modelValue: {
      type: [Boolean, Array],
      default: false
    },
    value: {
      type: [String, Number, Boolean],
      default: true
    },
    label: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
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
    layout: {
      type: String,
      default: 'vertical',
      validator: (value) => ['vertical', 'horizontal', 'grid'].includes(value)
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    disabledKey: {
      type: String,
      default: 'disabled'
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    // Reactive data
    const checkboxId = ref(`checkbox-${getCurrentInstance().uid}`)

    // Computed properties
    const legendClasses = computed(() => [
      'block text-sm font-medium mb-2',
      props.error ? 'text-red-700' : 'text-gray-700'
    ])

    const labelClasses = computed(() => [
      'text-sm font-medium cursor-pointer',
      props.error ? 'text-red-700' : 'text-gray-700',
      props.disabled ? 'text-gray-400 cursor-not-allowed' : ''
    ])

    const checkboxClasses = computed(() => [
      'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
      props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      props.error ? 'border-red-300 focus:ring-red-500' : ''
    ])

    const optionsLayout = computed(() => {
      const layouts = {
        vertical: 'space-y-2',
        horizontal: 'flex flex-wrap gap-4',
        grid: 'grid grid-cols-2 gap-2'
      }
      return layouts[props.layout]
    })

    const isChecked = computed(() => {
      if (Array.isArray(props.modelValue)) {
        return props.modelValue.includes(props.value)
      }
      return props.modelValue
    })

    // Methods
    const getOptionValue = (option) => {
      return typeof option === 'object' ? option[props.valueKey] : option
    }

    const getOptionLabel = (option) => {
      return typeof option === 'object' ? option[props.labelKey] : option
    }

    const isOptionDisabled = (option) => {
      return typeof option === 'object' ? option[props.disabledKey] : false
    }

    const isOptionChecked = (option) => {
      const value = getOptionValue(option)
      return Array.isArray(props.modelValue) 
        ? props.modelValue.includes(value)
        : props.modelValue === value
    }

    const optionLabelClasses = (option) => [
      'text-sm font-medium cursor-pointer',
      props.error ? 'text-red-700' : 'text-gray-700',
      (props.disabled || isOptionDisabled(option)) ? 'text-gray-400 cursor-not-allowed' : ''
    ]

    const handleChange = (event) => {
      const checked = event.target.checked
      if (Array.isArray(props.modelValue)) {
        const newValue = [...props.modelValue]
        if (checked && !newValue.includes(props.value)) {
          newValue.push(props.value)
        } else if (!checked) {
          const index = newValue.indexOf(props.value)
          if (index > -1) {
            newValue.splice(index, 1)
          }
        }
        emit('update:modelValue', newValue)
        emit('change', newValue)
      } else {
        emit('update:modelValue', checked)
        emit('change', checked)
      }
    }

    const handleOptionChange = (option, event) => {
      const value = getOptionValue(option)
      const checked = event.target.checked
      
      if (Array.isArray(props.modelValue)) {
        const newValue = [...props.modelValue]
        if (checked && !newValue.includes(value)) {
          newValue.push(value)
        } else if (!checked) {
          const index = newValue.indexOf(value)
          if (index > -1) {
            newValue.splice(index, 1)
          }
        }
        emit('update:modelValue', newValue)
        emit('change', newValue)
      } else {
        emit('update:modelValue', checked ? value : null)
        emit('change', checked ? value : null)
      }
    }

    return {
      checkboxId,
      legendClasses,
      labelClasses,
      checkboxClasses,
      optionsLayout,
      isChecked,
      getOptionValue,
      getOptionLabel,
      isOptionDisabled,
      isOptionChecked,
      optionLabelClasses,
      handleChange,
      handleOptionChange
    }
  }
}
</script>