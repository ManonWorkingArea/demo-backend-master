<template>
  <div class="space-y-1">
    <!-- Label -->
    <label v-if="label" :for="selectId" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Select Container -->
    <div class="relative">
      <!-- Search Input (for searchable) -->
      <input
        v-if="searchable"
        :id="selectId"
        v-model="searchQuery"
        type="text"
        :placeholder="searchPlaceholder"
        :disabled="disabled"
        :class="inputClasses"
        @focus="openDropdown"
        @blur="handleBlur"
        @keydown="handleKeydown"
        autocomplete="off"
      />

      <!-- Display Input (for non-searchable) -->
      <button
        v-else
        :id="selectId"
        type="button"
        :disabled="disabled"
        :class="inputClasses"
        @click="toggleDropdown"
        @keydown="handleKeydown"
      >
        <span class="block truncate text-left">
          {{ displayValue || placeholder }}
        </span>
        <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <i class="fas fa-chevron-down text-gray-400 transform transition-transform duration-200" :class="{ 'rotate-180': isOpen }"></i>
        </span>
      </button>

      <!-- Dropdown -->
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        >
          <!-- No results -->
          <div v-if="filteredOptions.length === 0" class="px-3 py-2 text-gray-500 text-center">
            {{ searchable ? 'No results found' : 'No options available' }}
          </div>

          <!-- Options -->
          <div
            v-for="(option, index) in filteredOptions"
            :key="getOptionValue(option)"
            :class="[
              'cursor-pointer select-none relative px-3 py-2 hover:bg-blue-50',
              index === highlightedIndex ? 'bg-blue-100 text-blue-900' : 'text-gray-900',
              isSelected(option) ? 'bg-blue-500 text-white hover:bg-blue-600' : ''
            ]"
            @click="selectOption(option)"
            @mouseenter="highlightedIndex = index"
          >
            <div class="flex items-center">
              <span class="block truncate" :class="{ 'font-semibold': isSelected(option) }">
                {{ getOptionLabel(option) }}
              </span>
              <i v-if="isSelected(option)" class="fas fa-check ml-auto text-current"></i>
            </div>
            <span v-if="getOptionDescription(option)" class="block text-sm opacity-75 truncate">
              {{ getOptionDescription(option) }}
            </span>
          </div>
        </div>
      </transition>
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
import { computed, ref, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue'

export default {
  name: 'ErpSelect',
  props: {
    modelValue: {
      type: [String, Number, Object, Array],
      default: null
    },
    options: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Select an option...'
    },
    searchPlaceholder: {
      type: String,
      default: 'Search options...'
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
    searchable: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
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
    }
  },
  emits: ['update:modelValue', 'change', 'search'],
  setup(props, { emit }) {

// Reactive data
const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const selectId = ref(`select-${getCurrentInstance().uid}`)

// Computed properties
const labelClasses = computed(() => [
  'block text-sm font-medium',
  props.error ? 'text-red-700' : 'text-gray-700'
])

const inputClasses = computed(() => {
  const baseClasses = [
    'relative w-full cursor-pointer rounded-md border bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 sm:text-sm',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed'
  ]

  if (props.error) {
    baseClasses.push('border-red-300 focus:ring-red-500 focus:border-red-500')
  } else {
    baseClasses.push('border-gray-300 focus:ring-blue-500 focus:border-blue-500')
  }

  return baseClasses
})

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.length > 0 ? `${props.modelValue.length} selected` : ''
  }

  const option = props.options.find(opt => getOptionValue(opt) === props.modelValue)
  return option ? getOptionLabel(option) : props.modelValue
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option => {
    const label = getOptionLabel(option).toLowerCase()
    const description = getOptionDescription(option)?.toLowerCase() || ''
    return label.includes(query) || description.includes(query)
  })
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

const isSelected = (option) => {
  const value = getOptionValue(option)
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(value)
  }
  return props.modelValue === value
}

const selectOption = (option) => {
  const value = getOptionValue(option)
  
  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = currentValue.indexOf(value)
    
    if (index > -1) {
      currentValue.splice(index, 1)
    } else {
      currentValue.push(value)
    }
    
    emit('update:modelValue', currentValue)
    emit('change', currentValue)
  } else {
    emit('update:modelValue', value)
    emit('change', value)
    closeDropdown()
  }
}

const openDropdown = () => {
  if (!props.disabled) {
    isOpen.value = true
    highlightedIndex.value = -1
  }
}

const closeDropdown = () => {
  isOpen.value = false
  highlightedIndex.value = -1
}

const toggleDropdown = () => {
  isOpen.value ? closeDropdown() : openDropdown()
}

const handleBlur = () => {
  // Delay to allow click events to fire
  setTimeout(() => {
    closeDropdown()
  }, 150)
}

const handleKeydown = (event) => {
  if (props.disabled) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        openDropdown()
      } else {
        highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (isOpen.value) {
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      }
      break
    case 'Enter':
      event.preventDefault()
      if (isOpen.value && highlightedIndex.value >= 0) {
        selectOption(filteredOptions.value[highlightedIndex.value])
      } else {
        openDropdown()
      }
      break
    case 'Escape':
      closeDropdown()
      break
  }
}

// Watch search query
watch(searchQuery, (newQuery) => {
  emit('search', newQuery)
  highlightedIndex.value = -1
})

// Close dropdown on outside click
const handleOutsideClick = (event) => {
  const element = document.getElementById(selectId.value)
  if (element && !element.contains(event.target)) {
    closeDropdown()
  }
}

    onMounted(() => {
      document.addEventListener('click', handleOutsideClick)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleOutsideClick)
    })

    return {
      isOpen,
      searchQuery,
      highlightedIndex,
      selectId,
      labelClasses,
      inputClasses,
      displayValue,
      filteredOptions,
      getOptionValue,
      getOptionLabel,
      getOptionDescription,
      isSelected,
      selectOption,
      openDropdown,
      closeDropdown,
      toggleDropdown,
      handleBlur,
      handleKeydown
    }
  }
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>