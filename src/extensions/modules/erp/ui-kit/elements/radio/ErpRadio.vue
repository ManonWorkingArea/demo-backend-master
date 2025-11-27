<template>
  <div class="space-y-1">
    <!-- Legend/Label -->
    <legend v-if="label" :class="legendClasses">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </legend>

    <!-- Radio Options -->
    <div :class="optionsLayout">
      <div
        v-for="(option, index) in options"
        :key="getOptionValue(option)"
        class="flex items-center"
      >
        <input
          :id="`${radioId}-${index}`"
          type="radio"
          :name="radioName"
          :value="getOptionValue(option)"
          :checked="isOptionChecked(option)"
          :disabled="disabled || isOptionDisabled(option)"
          :required="required"
          :class="radioClasses"
          @change="handleChange(option)"
        />
        <label :for="`${radioId}-${index}`" :class="optionLabelClasses(option)" class="ml-2">
          {{ getOptionLabel(option) }}
          <span v-if="getOptionDescription(option)" class="block text-xs text-gray-500 mt-1">
            {{ getOptionDescription(option) }}
          </span>
        </label>
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
  name: 'ErpRadio',
  props: {
    modelValue: {
      type: [String, Number, Boolean],
      default: null
    },
    options: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    name: {
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
    descriptionKey: {
      type: String,
      default: 'description'
    },
    disabledKey: {
      type: String,
      default: 'disabled'
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    // Reactive data
    const radioId = ref(`radio-${getCurrentInstance().uid}`)
    const radioName = computed(() => props.name || `radio-group-${getCurrentInstance().uid}`)

    // Computed properties
    const legendClasses = computed(() => [
      'block text-sm font-medium mb-3',
      props.error ? 'text-red-700' : 'text-gray-700'
    ])

    const radioClasses = computed(() => [
      'h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500',
      props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      props.error ? 'border-red-300 focus:ring-red-500' : ''
    ])

    const optionsLayout = computed(() => {
      const layouts = {
        vertical: 'space-y-3',
        horizontal: 'flex flex-wrap gap-4',
        grid: 'grid grid-cols-2 gap-3'
      }
      return layouts[props.layout]
    })

    // Methods
    const getOptionValue = (option) => {
      return typeof option === 'object' ? option[props.valueKey] : option
    }

    const getOptionLabel = (option) => {
      return typeof option === 'object' ? option[props.labelKey] : option
    }

    const getOptionDescription = (option) => {
      return typeof option === 'object' ? option[props.descriptionKey] : null
    }

    const isOptionDisabled = (option) => {
      return typeof option === 'object' ? option[props.disabledKey] : false
    }

    const isOptionChecked = (option) => {
      const value = getOptionValue(option)
      return props.modelValue === value
    }

    const optionLabelClasses = (option) => [
      'text-sm font-medium cursor-pointer',
      props.error ? 'text-red-700' : 'text-gray-700',
      (props.disabled || isOptionDisabled(option)) ? 'text-gray-400 cursor-not-allowed' : ''
    ]

    const handleChange = (option) => {
      const value = getOptionValue(option)
      emit('update:modelValue', value)
      emit('change', value)
    }

    return {
      radioId,
      radioName,
      legendClasses,
      radioClasses,
      optionsLayout,
      getOptionValue,
      getOptionLabel,
      getOptionDescription,
      isOptionDisabled,
      isOptionChecked,
      optionLabelClasses,
      handleChange
    }
  }
}
</script>