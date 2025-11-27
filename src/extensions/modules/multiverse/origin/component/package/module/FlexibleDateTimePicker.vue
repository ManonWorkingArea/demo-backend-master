<template>
  <div class="flexible-datetime-picker">
    <!-- Label -->
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input Field -->
    <div class="relative">
      <input
        v-model="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        @click="openPicker"
        @focus="openPicker"
        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer"
        :class="{
          'bg-gray-50 cursor-not-allowed': disabled,
          'border-red-300 focus:border-red-500 focus:ring-red-500': hasError
        }"
      />
      
      <!-- Calendar Icon -->
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <font-awesome-icon :icon="['fas', 'calendar-alt']" class="h-5 w-5 text-gray-400" />
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="hasError" class="mt-1 text-sm text-red-600">{{ errorMessage }}</p>

    <!-- DateTime Picker Panel -->
    <div v-if="showPicker" class="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4" 
         :style="panelStyle">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <h4 class="text-sm font-medium text-gray-900">{{ pickerTitle }}</h4>
        <button @click="closePicker" class="text-gray-400 hover:text-gray-600">
          <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
        </button>
      </div>

      <!-- Quick Date Selection -->
      <div v-if="showQuickDates" class="mb-4">
        <p class="text-xs font-medium text-gray-700 mb-2">วันที่ทั่วไป</p>
        <div class="grid grid-cols-2 gap-2">
          <button v-for="quick in quickDateOptions" :key="quick.key"
                  @click="selectQuickDate(quick)"
                  class="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
            {{ quick.label }}
          </button>
        </div>
      </div>

      <!-- Date Selection -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <!-- Year -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">ปี</label>
          <select v-model="selectedYear" @change="updateCalendar"
                  class="block w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500">
            <option v-for="year in yearOptions" :key="year" :value="year">{{ year + 543 }}</option>
          </select>
        </div>

        <!-- Month -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">เดือน</label>
          <select v-model="selectedMonth" @change="updateCalendar"
                  class="block w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500">
            <option v-for="(month, index) in monthNames" :key="index" :value="index + 1">{{ month }}</option>
          </select>
        </div>

        <!-- Day -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">วัน</label>
          <select v-model="selectedDay"
                  class="block w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500">
            <option v-for="day in daysInMonth" :key="day" :value="day">{{ day }}</option>
          </select>
        </div>
      </div>

      <!-- Time Selection (if enabled) -->
      <div v-if="includeTime" class="grid grid-cols-2 gap-3 mb-4">
        <!-- Hour -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">ชั่วโมง</label>
          <select v-model="selectedHour"
                  class="block w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500">
            <option v-for="hour in hourOptions" :key="hour" :value="hour">
              {{ hour.toString().padStart(2, '0') }}
            </option>
          </select>
        </div>

        <!-- Minute -->
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">นาที</label>
          <select v-model="selectedMinute"
                  class="block w-full text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500">
            <option v-for="minute in minuteOptions" :key="minute" :value="minute">
              {{ minute.toString().padStart(2, '0') }}
            </option>
          </select>
        </div>
      </div>

      <!-- Business Day Options -->
      <div v-if="businessDaysOnly" class="mb-4">
        <label class="flex items-center">
          <input v-model="skipWeekends" type="checkbox" 
                 class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          <span class="ml-2 text-sm text-gray-700">ข้ามวันเสาร์-อาทิตย์</span>
        </label>
      </div>

      <!-- Custom Validation Messages -->
      <div v-if="customValidation && validationMessage" class="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
        <p class="text-xs text-yellow-700">{{ validationMessage }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between space-x-2">
        <button @click="clearDate" 
                class="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
          ล้างค่า
        </button>
        
        <div class="flex space-x-2">
          <button @click="setToday" 
                  class="px-3 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">
            วันนี้
          </button>
          <button @click="confirmSelection" 
                  class="px-3 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors">
            ยืนยัน
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div v-if="showPicker" @click="closePicker" class="fixed inset-0 z-40"></div>
  </div>
</template>

<script>
export default {
  name: 'FlexibleDateTimePicker',
  props: {
    modelValue: {
      type: [String, Date],
      default: null
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'เลือกวันที่'
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    includeTime: {
      type: Boolean,
      default: false
    },
    businessDaysOnly: {
      type: Boolean,
      default: false
    },
    minDate: {
      type: [String, Date],
      default: null
    },
    maxDate: {
      type: [String, Date],
      default: null
    },
    showQuickDates: {
      type: Boolean,
      default: true
    },
    customValidation: {
      type: Function,
      default: null
    },
    format: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    timeFormat: {
      type: String,
      default: 'HH:mm'
    },
    pickerTitle: {
      type: String,
      default: 'เลือกวันที่'
    }
  },
  emits: ['update:modelValue', 'change', 'focus', 'blur'],
  data() {
    return {
      showPicker: false,
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      selectedDay: new Date().getDate(),
      selectedHour: new Date().getHours(),
      selectedMinute: new Date().getMinutes(),
      skipWeekends: false,
      panelStyle: {
        minWidth: '320px',
        maxWidth: '400px'
      },
      monthNames: [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ],
      quickDateOptions: [
        { key: 'today', label: 'วันนี้', days: 0 },
        { key: 'tomorrow', label: 'พรุ่งนี้', days: 1 },
        { key: 'week', label: 'สัปดาห์หน้า', days: 7 },
        { key: 'month', label: 'เดือนหน้า', days: 30 },
        { key: 'quarter', label: '3 เดือน', days: 90 },
        { key: 'year', label: 'ปีหน้า', days: 365 }
      ]
    };
  },
  computed: {
    displayValue() {
      if (!this.modelValue) return '';
      
      const date = new Date(this.modelValue);
      if (isNaN(date.getTime())) return '';
      
      let formatted = this.formatDate(date, this.format);
      
      if (this.includeTime) {
        formatted += ' ' + this.formatTime(date, this.timeFormat);
      }
      
      return formatted;
    },
    yearOptions() {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let i = currentYear - 10; i <= currentYear + 10; i++) {
        years.push(i);
      }
      return years;
    },
    hourOptions() {
      return Array.from({ length: 24 }, (_, i) => i);
    },
    minuteOptions() {
      return Array.from({ length: 60 }, (_, i) => i);
    },
    daysInMonth() {
      const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    },
    hasError() {
      return this.validationMessage !== null;
    },
    errorMessage() {
      return this.validationMessage;
    },
    validationMessage() {
      if (!this.customValidation) return null;
      
      const currentDate = this.getCurrentDate();
      return this.customValidation(currentDate);
    }
  },
  methods: {
    openPicker() {
      if (this.disabled || this.readonly) return;
      
      this.initializeFromValue();
      this.showPicker = true;
      this.$emit('focus');
    },
    closePicker() {
      this.showPicker = false;
      this.$emit('blur');
    },
    initializeFromValue() {
      if (this.modelValue) {
        const date = new Date(this.modelValue);
        if (!isNaN(date.getTime())) {
          this.selectedYear = date.getFullYear();
          this.selectedMonth = date.getMonth() + 1;
          this.selectedDay = date.getDate();
          this.selectedHour = date.getHours();
          this.selectedMinute = date.getMinutes();
        }
      }
    },
    updateCalendar() {
      // Adjust day if it exceeds the days in the new month
      const maxDays = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
      if (this.selectedDay > maxDays) {
        this.selectedDay = maxDays;
      }
    },
    selectQuickDate(option) {
      const date = new Date();
      date.setDate(date.getDate() + option.days);
      
      this.selectedYear = date.getFullYear();
      this.selectedMonth = date.getMonth() + 1;
      this.selectedDay = date.getDate();
      
      if (this.includeTime) {
        this.selectedHour = date.getHours();
        this.selectedMinute = date.getMinutes();
      }
    },
    setToday() {
      const today = new Date();
      this.selectedYear = today.getFullYear();
      this.selectedMonth = today.getMonth() + 1;
      this.selectedDay = today.getDate();
      
      if (this.includeTime) {
        this.selectedHour = today.getHours();
        this.selectedMinute = today.getMinutes();
      }
    },
    clearDate() {
      this.$emit('update:modelValue', null);
      this.$emit('change', null);
      this.closePicker();
    },
    confirmSelection() {
      const selectedDate = this.getCurrentDate();
      
      // Validation checks
      if (this.businessDaysOnly && this.skipWeekends) {
        const dayOfWeek = selectedDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          alert('ไม่สามารถเลือกวันเสาร์หรือวันอาทิตย์ได้');
          return;
        }
      }
      
      if (this.minDate) {
        const minDate = new Date(this.minDate);
        if (selectedDate < minDate) {
          alert('วันที่ที่เลือกต้องไม่น้อยกว่าวันที่ขั้นต่ำ');
          return;
        }
      }
      
      if (this.maxDate) {
        const maxDate = new Date(this.maxDate);
        if (selectedDate > maxDate) {
          alert('วันที่ที่เลือกต้องไม่มากกว่าวันที่สูงสุด');
          return;
        }
      }
      
      // Custom validation
      if (this.customValidation) {
        const validationResult = this.customValidation(selectedDate);
        if (validationResult) {
          alert(validationResult);
          return;
        }
      }
      
      const isoString = selectedDate.toISOString();
      this.$emit('update:modelValue', isoString);
      this.$emit('change', isoString);
      this.closePicker();
    },
    getCurrentDate() {
      return new Date(
        this.selectedYear,
        this.selectedMonth - 1,
        this.selectedDay,
        this.includeTime ? this.selectedHour : 0,
        this.includeTime ? this.selectedMinute : 0
      );
    },
    formatDate(date, format) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const buddhistYear = year + 543;
      
      return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', buddhistYear)
        .replace('YY', buddhistYear.toString().slice(-2));
    },
    formatTime(date, format) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return format
        .replace('HH', hours)
        .replace('mm', minutes);
    }
  },
  watch: {
    modelValue: {
      handler() {
        this.initializeFromValue();
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.flexible-datetime-picker {
  @apply relative;
}

/* Custom select styling */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Animation for panel */
.picker-panel {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .flexible-datetime-picker .absolute {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 350px;
  }
}
</style>
