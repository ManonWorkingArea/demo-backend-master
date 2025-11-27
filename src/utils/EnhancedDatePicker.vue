<template>
  <div class="enhanced-datepicker" :class="pickerClasses">
    <!-- Input Field -->
    <div class="datepicker-input-wrapper" :class="inputWrapperClasses">
      <label v-if="label" :for="inputId" class="datepicker-label" :class="labelClasses">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>

      <div class="relative">
        <input
          :id="inputId"
          ref="input"
          v-model="displayValue"
          :type="inputType"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly || isMobile"
          :class="inputClasses"
          @click="handleInputClick"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
          @keydown="handleInputKeydown"
          @input="handleInputChange"
          autocomplete="off"
        />

        <!-- Calendar Icon -->
        <button
          type="button"
          class="datepicker-trigger"
          :class="triggerClasses"
          @click="togglePicker"
          :disabled="disabled"
          tabindex="-1"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        <!-- Clear Button -->
        <button
          v-if="clearable && modelValue"
          type="button"
          class="datepicker-clear"
          :class="clearClasses"
          @click="clearValue"
          :disabled="disabled"
          tabindex="-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="datepicker-error">
        {{ error }}
      </div>

      <!-- Help Text -->
      <div v-if="helpText && !error" class="datepicker-help">
        {{ helpText }}
      </div>
    </div>

    <!-- Dropdown Calendar -->
    <Teleport to="body">
      <Transition
        name="datepicker-dropdown"
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="isOpen && !isMobile"
          ref="dropdown"
          class="datepicker-dropdown"
          :class="dropdownClasses"
          :style="dropdownStyles"
          @click.stop
        >
          <div class="datepicker-calendar">
            <!-- Calendar Header -->
            <div class="calendar-header" :class="headerClasses">
              <div class="calendar-nav">
                <button
                  type="button"
                  class="nav-btn"
                  @click="previousYear"
                  :disabled="!canNavigatePrevious"
                  title="Previous Year"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="nav-btn"
                  @click="previousMonth"
                  :disabled="!canNavigatePrevious"
                  title="Previous Month"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              <div class="calendar-title">
                <button
                  type="button"
                  class="month-year-btn"
                  @click="toggleMonthYearPicker"
                >
                  {{ monthYearDisplay }}
                </button>
              </div>

              <div class="calendar-nav">
                <button
                  type="button"
                  class="nav-btn"
                  @click="nextMonth"
                  :disabled="!canNavigateNext"
                  title="Next Month"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="nav-btn"
                  @click="nextYear"
                  :disabled="!canNavigateNext"
                  title="Next Year"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <!-- Today Button -->
              <button
                v-if="showTodayButton"
                type="button"
                class="today-btn"
                @click="selectToday"
                :disabled="!canSelectToday"
              >
                Today
              </button>
            </div>

            <!-- Month/Year Picker -->
            <div v-if="showMonthYearPicker" class="month-year-picker">
              <div class="month-grid">
                <button
                  v-for="(month, index) in months"
                  :key="index"
                  type="button"
                  class="month-btn"
                  :class="{ 'active': index === currentMonth }"
                  @click="selectMonth(index)"
                >
                  {{ month }}
                </button>
              </div>
              <div class="year-picker">
                <input
                  v-model.number="yearInput"
                  type="number"
                  class="year-input"
                  :min="minYear"
                  :max="maxYear"
                  @change="selectYear"
                />
              </div>
            </div>

            <!-- Calendar Grid -->
            <div v-else class="calendar-grid">
              <!-- Day Headers -->
              <div class="day-headers">
                <div
                  v-for="day in dayHeaders"
                  :key="day"
                  class="day-header"
                >
                  {{ day }}
                </div>
              </div>

              <!-- Calendar Days -->
              <div class="calendar-days">
                <button
                  v-for="day in calendarDays"
                  :key="`${day.year}-${day.month}-${day.date}`"
                  type="button"
                  class="calendar-day"
                  :class="getDayClasses(day)"
                  @click="selectDate(day)"
                  :disabled="isDayDisabled(day)"
                  :title="getDayTitle(day)"
                >
                  {{ day.date }}
                </button>
              </div>
            </div>

            <!-- Time Picker -->
            <div v-if="includeTime" class="time-picker" :class="timePickerClasses">
              <div class="time-inputs">
                <div class="time-input-group">
                  <label class="time-label">Hour</label>
                  <select
                    v-model="selectedHour"
                    class="time-select"
                    @change="updateTime"
                  >
                    <option
                      v-for="hour in hours"
                      :key="hour.value"
                      :value="hour.value"
                    >
                      {{ hour.label }}
                    </option>
                  </select>
                </div>

                <div class="time-input-group">
                  <label class="time-label">Minute</label>
                  <select
                    v-model="selectedMinute"
                    class="time-select"
                    @change="updateTime"
                  >
                    <option
                      v-for="minute in minutes"
                      :key="minute"
                      :value="minute"
                    >
                      {{ minute.toString().padStart(2, '0') }}
                    </option>
                  </select>
                </div>

                <div v-if="!use24Hour" class="time-input-group">
                  <label class="time-label">Period</label>
                  <select
                    v-model="selectedPeriod"
                    class="time-select"
                    @change="updateTime"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div v-if="showQuickActions" class="calendar-footer">
              <div class="quick-actions">
                <button
                  v-for="action in quickActions"
                  :key="action.label"
                  type="button"
                  class="quick-action-btn"
                  @click="action.handler"
                  :disabled="action.disabled"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Mobile Date Input -->
    <input
      v-if="isMobile"
      ref="mobileInput"
      :type="mobileInputType"
      :value="mobileValue"
      @change="handleMobileChange"
      class="mobile-date-input"
      :disabled="disabled"
      :min="minDateString"
      :max="maxDateString"
    />
  </div>
</template>

<script>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

export default {
  name: 'EnhancedDatePicker',
  emits: ['update:modelValue', 'change', 'open', 'close', 'focus', 'blur'],
  props: {
    modelValue: {
      type: [Date, String, null],
      default: null
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD'
    },
    displayFormat: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: 'Select date'
    },
    label: {
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
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: value => ['default', 'outlined', 'filled'].includes(value)
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
    clearable: {
      type: Boolean,
      default: true
    },
    includeTime: {
      type: Boolean,
      default: false
    },
    use24Hour: {
      type: Boolean,
      default: true
    },
    minuteStep: {
      type: Number,
      default: 15
    },
    minDate: {
      type: [Date, String],
      default: null
    },
    maxDate: {
      type: [Date, String],
      default: null
    },
    disabledDates: {
      type: Array,
      default: () => []
    },
    disabledDays: {
      type: Array,
      default: () => []
    },
    highlightedDates: {
      type: Array,
      default: () => []
    },
    firstDayOfWeek: {
      type: Number,
      default: 0,
      validator: value => value >= 0 && value <= 6
    },
    showTodayButton: {
      type: Boolean,
      default: true
    },
    showQuickActions: {
      type: Boolean,
      default: false
    },
    quickActions: {
      type: Array,
      default: () => []
    },
    locale: {
      type: String,
      default: 'en-US'
    },
    position: {
      type: String,
      default: 'bottom-start',
      validator: value => ['bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(value)
    },
    closeOnSelect: {
      type: Boolean,
      default: true
    },
    customClass: {
      type: [String, Object, Array],
      default: ''
    }
  },
  setup(props, { emit }) {
    // Refs
    const input = ref(null)
    const dropdown = ref(null)
    const mobileInput = ref(null)
    
    // State
    const isOpen = ref(false)
    const isFocused = ref(false)
    const currentMonth = ref(new Date().getMonth())
    const currentYear = ref(new Date().getFullYear())
    const showMonthYearPicker = ref(false)
    const yearInput = ref(new Date().getFullYear())
    const selectedHour = ref(12)
    const selectedMinute = ref(0)
    const selectedPeriod = ref('AM')
    const dropdownPosition = ref({ top: 0, left: 0 })

    // Generate unique ID
    const inputId = `datepicker-${Math.random().toString(36).substr(2, 9)}`

    // Device detection
    const isMobile = computed(() => {
      if (typeof window === 'undefined') return false
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    })

    // Date utilities
    const parseDate = (value) => {
      if (!value) return null
      if (value instanceof Date) return value
      if (typeof value === 'string') {
        const date = new Date(value)
        return isNaN(date.getTime()) ? null : date
      }
      return null
    }

    const formatDate = (date, format) => {
      if (!date) return ''
      
      const d = new Date(date)
      const year = d.getFullYear()
      const month = (d.getMonth() + 1).toString().padStart(2, '0')
      const day = d.getDate().toString().padStart(2, '0')
      const hour = d.getHours()
      const minute = d.getMinutes().toString().padStart(2, '0')
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const period = hour >= 12 ? 'PM' : 'AM'

      return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hour.toString().padStart(2, '0'))
        .replace('hh', hour12.toString().padStart(2, '0'))
        .replace('mm', minute)
        .replace('A', period)
    }

    // Computed properties
    const inputType = computed(() => {
      return isMobile.value && !props.includeTime ? 'date' : 'text'
    })

    const mobileInputType = computed(() => {
      return props.includeTime ? 'datetime-local' : 'date'
    })

    const displayValue = computed({
      get() {
        const date = parseDate(props.modelValue)
        if (!date) return ''
        
        const displayFmt = props.displayFormat || (props.includeTime ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY')
        return formatDate(date, displayFmt)
      },
      set(value) {
        // Handle manual input
        if (!value) {
          emit('update:modelValue', null)
          return
        }

        const parsedDate = parseDate(value)
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          emit('update:modelValue', parsedDate)
        }
      }
    })

    const mobileValue = computed(() => {
      const date = parseDate(props.modelValue)
      if (!date) return ''
      
      if (props.includeTime) {
        return date.toISOString().slice(0, 16)
      } else {
        return date.toISOString().slice(0, 10)
      }
    })

    const minDateString = computed(() => {
      const date = parseDate(props.minDate)
      return date ? date.toISOString().slice(0, 10) : null
    })

    const maxDateString = computed(() => {
      const date = parseDate(props.maxDate)
      return date ? date.toISOString().slice(0, 10) : null
    })

    const monthYearDisplay = computed(() => {
      const date = new Date(currentYear.value, currentMonth.value)
      return date.toLocaleDateString(props.locale, { month: 'long', year: 'numeric' })
    })

    const months = computed(() => {
      const monthNames = []
      for (let i = 0; i < 12; i++) {
        const date = new Date(2000, i, 1)
        monthNames.push(date.toLocaleDateString(props.locale, { month: 'short' }))
      }
      return monthNames
    })

    const dayHeaders = computed(() => {
      const days = []
      const firstDay = props.firstDayOfWeek
      
      for (let i = 0; i < 7; i++) {
        const dayIndex = (firstDay + i) % 7
        const date = new Date(2000, 0, dayIndex + 1) // January 1, 2000 was a Saturday (6)
        days.push(date.toLocaleDateString(props.locale, { weekday: 'short' }))
      }
      return days
    })

    const calendarDays = computed(() => {
      const firstDay = new Date(currentYear.value, currentMonth.value, 1)
      const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
      const startDate = new Date(firstDay)
      const endDate = new Date(lastDay)

      // Adjust start date to show previous month's days
      const startDayOfWeek = (firstDay.getDay() - props.firstDayOfWeek + 7) % 7
      startDate.setDate(1 - startDayOfWeek)

      // Adjust end date to show next month's days
      const endDayOfWeek = (lastDay.getDay() - props.firstDayOfWeek + 7) % 7
      endDate.setDate(lastDay.getDate() + (6 - endDayOfWeek))

      const days = []
      const current = new Date(startDate)

      while (current <= endDate) {
        days.push({
          date: current.getDate(),
          month: current.getMonth(),
          year: current.getFullYear(),
          isCurrentMonth: current.getMonth() === currentMonth.value,
          isPreviousMonth: current.getMonth() < currentMonth.value,
          isNextMonth: current.getMonth() > currentMonth.value,
          isToday: isToday(current),
          isSelected: isSelected(current),
          isDisabled: isDayDisabled({ 
            date: current.getDate(), 
            month: current.getMonth(), 
            year: current.getFullYear() 
          }),
          isHighlighted: isHighlighted(current)
        })
        current.setDate(current.getDate() + 1)
      }

      return days
    })

    const hours = computed(() => {
      const hours = []
      const start = props.use24Hour ? 0 : 1
      const end = props.use24Hour ? 23 : 12

      for (let i = start; i <= end; i++) {
        hours.push({
          value: i,
          label: props.use24Hour ? i.toString().padStart(2, '0') : i.toString()
        })
      }
      return hours
    })

    const minutes = computed(() => {
      const minutes = []
      for (let i = 0; i < 60; i += props.minuteStep) {
        minutes.push(i)
      }
      return minutes
    })

    const minYear = computed(() => {
      const minDate = parseDate(props.minDate)
      return minDate ? minDate.getFullYear() : 1900
    })

    const maxYear = computed(() => {
      const maxDate = parseDate(props.maxDate)
      return maxDate ? maxDate.getFullYear() : 2100
    })

    const canNavigatePrevious = computed(() => {
      if (!props.minDate) return true
      const minDate = parseDate(props.minDate)
      const currentDate = new Date(currentYear.value, currentMonth.value, 1)
      return currentDate > minDate
    })

    const canNavigateNext = computed(() => {
      if (!props.maxDate) return true
      const maxDate = parseDate(props.maxDate)
      const currentDate = new Date(currentYear.value, currentMonth.value + 1, 0)
      return currentDate < maxDate
    })

    const canSelectToday = computed(() => {
      const today = new Date()
      return !isDayDisabled({
        date: today.getDate(),
        month: today.getMonth(),
        year: today.getFullYear()
      })
    })

    // CSS Classes
    const pickerClasses = computed(() => [
      'enhanced-datepicker',
      `datepicker-size-${props.size}`,
      `datepicker-variant-${props.variant}`,
      {
        'datepicker-disabled': props.disabled,
        'datepicker-focused': isFocused.value,
        'datepicker-error': props.error,
        'datepicker-open': isOpen.value
      },
      props.customClass
    ])

    const inputWrapperClasses = computed(() => [
      'datepicker-input-wrapper',
      {
        'has-label': props.label,
        'has-error': props.error,
        'has-help': props.helpText
      }
    ])

    const labelClasses = computed(() => [
      'datepicker-label',
      {
        'required': props.required
      }
    ])

    const inputClasses = computed(() => [
      'datepicker-input',
      {
        'error': props.error,
        'disabled': props.disabled,
        'readonly': props.readonly
      }
    ])

    const triggerClasses = computed(() => [
      'datepicker-trigger',
      {
        'disabled': props.disabled
      }
    ])

    const clearClasses = computed(() => [
      'datepicker-clear',
      {
        'disabled': props.disabled
      }
    ])

    const dropdownClasses = computed(() => [
      'datepicker-dropdown',
      `dropdown-position-${props.position}`
    ])

    const dropdownStyles = computed(() => ({
      top: `${dropdownPosition.value.top}px`,
      left: `${dropdownPosition.value.left}px`
    }))

    const headerClasses = computed(() => [
      'calendar-header'
    ])

    const timePickerClasses = computed(() => [
      'time-picker',
      {
        '24-hour': props.use24Hour
      }
    ])

    // Methods
    const isToday = (date) => {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }

    const isSelected = (date) => {
      const selected = parseDate(props.modelValue)
      if (!selected) return false
      return date.toDateString() === selected.toDateString()
    }

    const isHighlighted = (date) => {
      return props.highlightedDates.some(highlightDate => {
        const highlight = parseDate(highlightDate)
        return highlight && date.toDateString() === highlight.toDateString()
      })
    }

    const isDayDisabled = (day) => {
      const date = new Date(day.year, day.month, day.date)
      
      // Check min/max dates
      const minDate = parseDate(props.minDate)
      const maxDate = parseDate(props.maxDate)
      
      if (minDate && date < minDate) return true
      if (maxDate && date > maxDate) return true
      
      // Check disabled days of week
      if (props.disabledDays.includes(date.getDay())) return true
      
      // Check disabled specific dates
      return props.disabledDates.some(disabledDate => {
        const disabled = parseDate(disabledDate)
        return disabled && date.toDateString() === disabled.toDateString()
      })
    }

    const getDayClasses = (day) => [
      'calendar-day',
      {
        'current-month': day.isCurrentMonth,
        'other-month': !day.isCurrentMonth,
        'today': day.isToday,
        'selected': day.isSelected,
        'disabled': day.isDisabled,
        'highlighted': day.isHighlighted
      }
    ]

    const getDayTitle = (day) => {
      const date = new Date(day.year, day.month, day.date)
      return date.toLocaleDateString(props.locale, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }

    const calculateDropdownPosition = () => {
      if (!input.value) return

      const inputRect = input.value.getBoundingClientRect()
      const dropdownHeight = 400 // Approximate height
      const dropdownWidth = 320 // Approximate width
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      let top = inputRect.bottom + window.scrollY + 4
      let left = inputRect.left + window.scrollX

      // Adjust position based on props.position
      switch (props.position) {
        case 'bottom-end':
          left = inputRect.right + window.scrollX - dropdownWidth
          break
        case 'top-start':
          top = inputRect.top + window.scrollY - dropdownHeight - 4
          break
        case 'top-end':
          top = inputRect.top + window.scrollY - dropdownHeight - 4
          left = inputRect.right + window.scrollX - dropdownWidth
          break
      }

      // Ensure dropdown stays within viewport
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 16
      }
      if (left < 16) {
        left = 16
      }
      if (top + dropdownHeight > viewportHeight + window.scrollY) {
        top = inputRect.top + window.scrollY - dropdownHeight - 4
      }
      if (top < window.scrollY + 16) {
        top = inputRect.bottom + window.scrollY + 4
      }

      dropdownPosition.value = { top, left }
    }

    const openPicker = () => {
      if (props.disabled || props.readonly) return
      
      isOpen.value = true
      emit('open')
      
      if (!isMobile.value) {
        nextTick(() => {
          calculateDropdownPosition()
        })
      }
    }

    const closePicker = () => {
      isOpen.value = false
      showMonthYearPicker.value = false
      emit('close')
    }

    const togglePicker = () => {
      if (isOpen.value) {
        closePicker()
      } else {
        openPicker()
      }
    }

    const selectDate = (day) => {
      if (day.isDisabled) return

      const selectedDate = new Date(day.year, day.month, day.date)
      
      if (props.includeTime && props.modelValue) {
        const currentTime = parseDate(props.modelValue)
        if (currentTime) {
          selectedDate.setHours(currentTime.getHours())
          selectedDate.setMinutes(currentTime.getMinutes())
        }
      } else if (props.includeTime) {
        selectedDate.setHours(selectedHour.value)
        selectedDate.setMinutes(selectedMinute.value)
      }

      emit('update:modelValue', selectedDate)
      emit('change', selectedDate)

      if (props.closeOnSelect && !props.includeTime) {
        closePicker()
      }
    }

    const selectToday = () => {
      const today = new Date()
      selectDate({
        date: today.getDate(),
        month: today.getMonth(),
        year: today.getFullYear(),
        isDisabled: false
      })
    }

    const selectMonth = (month) => {
      currentMonth.value = month
      showMonthYearPicker.value = false
    }

    const selectYear = () => {
      currentYear.value = yearInput.value
      showMonthYearPicker.value = false
    }

    const previousMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
      } else {
        currentMonth.value--
      }
    }

    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
      } else {
        currentMonth.value++
      }
    }

    const previousYear = () => {
      currentYear.value--
    }

    const nextYear = () => {
      currentYear.value++
    }

    const toggleMonthYearPicker = () => {
      showMonthYearPicker.value = !showMonthYearPicker.value
      yearInput.value = currentYear.value
    }

    const updateTime = () => {
      if (!props.modelValue) return

      const date = parseDate(props.modelValue)
      if (!date) return

      let hour = selectedHour.value
      if (!props.use24Hour) {
        if (selectedPeriod.value === 'PM' && hour !== 12) {
          hour += 12
        } else if (selectedPeriod.value === 'AM' && hour === 12) {
          hour = 0
        }
      }

      date.setHours(hour)
      date.setMinutes(selectedMinute.value)

      emit('update:modelValue', new Date(date))
      emit('change', new Date(date))
    }

    const clearValue = () => {
      emit('update:modelValue', null)
      emit('change', null)
      closePicker()
    }

    const handleInputClick = () => {
      if (!props.readonly) {
        openPicker()
      }
    }

    const handleInputFocus = () => {
      isFocused.value = true
      emit('focus')
    }

    const handleInputBlur = () => {
      isFocused.value = false
      emit('blur')
    }

    const handleInputKeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        togglePicker()
      } else if (event.key === 'Escape') {
        closePicker()
      }
    }

    const handleInputChange = (event) => {
      // Handle manual input
      displayValue.value = event.target.value
    }

    const handleMobileChange = (event) => {
      const date = new Date(event.target.value)
      if (!isNaN(date.getTime())) {
        emit('update:modelValue', date)
        emit('change', date)
      }
    }

    const handleClickOutside = (event) => {
      if (isOpen.value && dropdown.value && !dropdown.value.contains(event.target) && 
          input.value && !input.value.contains(event.target)) {
        closePicker()
      }
    }

    // Initialize time values from modelValue
    const initializeTimeFromValue = () => {
      const date = parseDate(props.modelValue)
      if (date && props.includeTime) {
        const hour = date.getHours()
        const minute = date.getMinutes()

        if (props.use24Hour) {
          selectedHour.value = hour
        } else {
          selectedHour.value = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
          selectedPeriod.value = hour >= 12 ? 'PM' : 'AM'
        }

        selectedMinute.value = Math.floor(minute / props.minuteStep) * props.minuteStep
      }
    }

    // Initialize current month/year from modelValue
    const initializeCalendarFromValue = () => {
      const date = parseDate(props.modelValue)
      if (date) {
        currentMonth.value = date.getMonth()
        currentYear.value = date.getFullYear()
      }
    }

    // Watchers
    watch(() => props.modelValue, () => {
      initializeTimeFromValue()
      initializeCalendarFromValue()
    }, { immediate: true })

    // Lifecycle
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      window.addEventListener('resize', calculateDropdownPosition)
      window.addEventListener('scroll', calculateDropdownPosition)
      
      initializeTimeFromValue()
      initializeCalendarFromValue()
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('resize', calculateDropdownPosition)
      window.removeEventListener('scroll', calculateDropdownPosition)
    })

    return {
      // Refs
      input,
      dropdown,
      mobileInput,
      inputId,
      
      // State
      isOpen,
      isFocused,
      currentMonth,
      currentYear,
      showMonthYearPicker,
      yearInput,
      selectedHour,
      selectedMinute,
      selectedPeriod,
      
      // Computed
      isMobile,
      inputType,
      mobileInputType,
      displayValue,
      mobileValue,
      minDateString,
      maxDateString,
      monthYearDisplay,
      months,
      dayHeaders,
      calendarDays,
      hours,
      minutes,
      minYear,
      maxYear,
      canNavigatePrevious,
      canNavigateNext,
      canSelectToday,
      pickerClasses,
      inputWrapperClasses,
      labelClasses,
      inputClasses,
      triggerClasses,
      clearClasses,
      dropdownClasses,
      dropdownStyles,
      headerClasses,
      timePickerClasses,
      
      // Methods
      getDayClasses,
      getDayTitle,
      isDayDisabled,
      openPicker,
      closePicker,
      togglePicker,
      selectDate,
      selectToday,
      selectMonth,
      selectYear,
      previousMonth,
      nextMonth,
      previousYear,
      nextYear,
      toggleMonthYearPicker,
      updateTime,
      clearValue,
      handleInputClick,
      handleInputFocus,
      handleInputBlur,
      handleInputKeydown,
      handleInputChange,
      handleMobileChange
    }
  }
}
</script>

<style scoped>
/* Base Styles */
.enhanced-datepicker {
  position: relative;
  display: inline-block;
  width: 100%;
}

/* Input Wrapper */
.datepicker-input-wrapper {
  position: relative;
  width: 100%;
}

.datepicker-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.datepicker-label.required::after {
  content: ' *';
  color: #ef4444;
}

/* Input Field */
.datepicker-input {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #111827;
  background-color: white;
  transition: all 0.2s;
}

.datepicker-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.datepicker-input.error {
  border-color: #ef4444;
}

.datepicker-input.error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.datepicker-input:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.datepicker-input:read-only {
  background-color: #f9fafb;
  cursor: pointer;
}

/* Size Variants */
.datepicker-size-small .datepicker-input {
  padding: 0.375rem 2rem 0.375rem 0.5rem;
  font-size: 0.75rem;
}

.datepicker-size-large .datepicker-input {
  padding: 0.75rem 3rem 0.75rem 1rem;
  font-size: 1rem;
}

/* Variant Styles */
.datepicker-variant-outlined .datepicker-input {
  background-color: transparent;
  border-width: 2px;
}

.datepicker-variant-filled .datepicker-input {
  background-color: #f3f4f6;
  border: none;
}

.datepicker-variant-filled .datepicker-input:focus {
  background-color: white;
  box-shadow: 0 0 0 2px #3b82f6;
}

/* Trigger Button */
.datepicker-trigger {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: color 0.2s;
}

.datepicker-trigger:hover {
  color: #374151;
}

.datepicker-trigger:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

/* Clear Button */
.datepicker-clear {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: color 0.2s;
}

.datepicker-clear:hover {
  color: #ef4444;
}

/* Error and Help Text */
.datepicker-error {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #ef4444;
}

.datepicker-help {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Mobile Input */
.mobile-date-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Dropdown */
.datepicker-dropdown {
  position: absolute;
  z-index: 1000;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  min-width: 320px;
}

/* Calendar */
.datepicker-calendar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Calendar Header */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.calendar-nav {
  display: flex;
  gap: 0.25rem;
}

.nav-btn {
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-btn:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.calendar-title {
  flex: 1;
  text-align: center;
}

.month-year-btn {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.month-year-btn:hover {
  background: #f3f4f6;
}

.today-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.today-btn:hover {
  background: #2563eb;
}

.today-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* Month/Year Picker */
.month-year-picker {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.month-btn {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.month-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.month-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.year-picker {
  display: flex;
  justify-content: center;
}

.year-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  text-align: center;
  width: 6rem;
  font-size: 0.875rem;
}

/* Calendar Grid */
.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.day-header {
  padding: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.calendar-day {
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  background: transparent;
  color: #374151;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
}

.calendar-day:hover {
  background: #f3f4f6;
}

.calendar-day.other-month {
  color: #d1d5db;
}

.calendar-day.today {
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 600;
}

.calendar-day.selected {
  background: #3b82f6;
  color: white;
}

.calendar-day.selected:hover {
  background: #2563eb;
}

.calendar-day.disabled {
  color: #d1d5db;
  cursor: not-allowed;
  background: transparent;
}

.calendar-day.disabled:hover {
  background: transparent;
}

.calendar-day.highlighted {
  background: #fef3c7;
  color: #92400e;
}

/* Time Picker */
.time-picker {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.time-inputs {
  display: flex;
  gap: 0.75rem;
  align-items: end;
}

.time-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.time-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
}

.time-select {
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  background: white;
}

.time-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Calendar Footer */
.calendar-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-action-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-action-btn:hover {
  background: #e5e7eb;
}

.quick-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transitions */
.datepicker-dropdown-enter-active,
.datepicker-dropdown-leave-active {
  transition: all 0.2s ease;
}

.datepicker-dropdown-enter-from,
.datepicker-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* Responsive */
@media (max-width: 640px) {
  .datepicker-dropdown {
    min-width: 280px;
    padding: 0.75rem;
  }

  .calendar-day {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }

  .time-inputs {
    flex-direction: column;
    gap: 0.5rem;
  }

  .quick-actions {
    justify-content: center;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .datepicker-label {
    color: #f3f4f6;
  }

  .datepicker-input {
    background-color: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .datepicker-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .datepicker-input:disabled {
    background-color: #111827;
    color: #6b7280;
  }

  .datepicker-dropdown {
    background: #1f2937;
    border-color: #374151;
  }

  .calendar-header {
    border-bottom-color: #374151;
  }

  .month-year-btn {
    color: #f9fafb;
  }

  .month-year-btn:hover {
    background: #374151;
  }

  .calendar-day {
    color: #f3f4f6;
  }

  .calendar-day:hover {
    background: #374151;
  }

  .calendar-day.other-month {
    color: #6b7280;
  }

  .calendar-day.today {
    background: #1e40af;
    color: #dbeafe;
  }

  .time-picker {
    border-top-color: #374151;
  }

  .time-select {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .calendar-footer {
    border-top-color: #374151;
  }

  .quick-action-btn {
    background: #374151;
    color: #f3f4f6;
    border-color: #4b5563;
  }

  .quick-action-btn:hover {
    background: #4b5563;
  }
}
</style>
