<template>
  <div class="datetime-picker-compact">
    <!-- Compact Input -->
    <div class="input-container-compact">
      <input 
        type="text" 
        :value="formattedDateTime" 
        @focus="showPanel = true" 
        readonly 
        class="w-full px-3 py-2 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
        placeholder="เลือกวันที่และเวลา"
      />
      <div class="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
    </div>

    <!-- Compact Panel -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="showPanel" class="panel-compact">
        <!-- Header -->
        <div class="panel-header">
          <h4 class="text-xs font-medium text-gray-900 flex items-center">
            <svg class="w-3 h-3 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            เลือกวันที่และเวลา
          </h4>
          <button 
            @click="closePanel" 
            class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Date Selection -->
        <div class="selection-section">
          <label class="section-label">
            <svg class="w-3 h-3 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            วันที่
          </label>
          <div class="date-selection-compact">
            <select v-model="selectedDay" class="select-compact">
              <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
            </select>
            <select v-model="selectedMonth" class="select-compact">
              <option v-for="(month, index) in thaiMonths" :key="index" :value="index + 1">{{ month }}</option>
            </select>
            <select v-model="selectedYear" class="select-compact">
              <option v-for="year in years" :key="year" :value="year">{{ year + 543 }}</option>
            </select>
          </div>
        </div>

        <!-- Time Selection -->
        <div class="selection-section">
          <label class="section-label">
            <svg class="w-3 h-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            เวลา
          </label>
          <div class="time-selection-compact">
            <select v-model="selectedHour" class="select-compact">
              <option v-for="hour in hours" :key="hour" :value="hour">{{ hour }}</option>
            </select>
            <span class="time-separator">:</span>
            <select v-model="selectedMinute" class="select-compact">
              <option v-for="minute in minutes" :key="minute" :value="minute">{{ minute }}</option>
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="button-row-compact">
          <button @click="closePanel" class="btn-secondary-compact">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            ยกเลิก
          </button>
          <button @click="updateDateTime" class="btn-primary-compact">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            ตกลง
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div v-if="showPanel" @click="closePanel" class="panel-backdrop"></div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: false,
      default: "",
    },
  },
  data() {
    return {
      showPanel: false,
      selectedDay: new Date().getDate(),
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),
      selectedHour: new Date().getHours(),
      selectedMinute: new Date().getMinutes(),
      days: Array.from({ length: 31 }, (_, i) => i + 1),
      thaiMonths: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
      years: Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i),
      hours: Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')),
      minutes: Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
    };
  },
  computed: {
    formattedDateTime() {
      const formattedHour = String(this.selectedHour).padStart(2, '0');
      const formattedMinute = String(this.selectedMinute).padStart(2, '0');
      return `${this.selectedDay} ${this.thaiMonths[this.selectedMonth - 1]} ${this.selectedYear + 543} ${formattedHour}:${formattedMinute}`;
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          const date = new Date(newValue);
          if (!isNaN(date)) {
            this.selectedDay = date.getUTCDate();
            this.selectedMonth = date.getUTCMonth() + 1;
            this.selectedYear = date.getUTCFullYear();
            this.selectedHour = String(date.getUTCHours()).padStart(2, '0');
            this.selectedMinute = String(date.getUTCMinutes()).padStart(2, '0');
          }
        }
      }
    }
  },
  methods: {
    updateDateTime() {
      const dateTime = new Date(
        Date.UTC(
          this.selectedYear,
          this.selectedMonth - 1,
          this.selectedDay,
          parseInt(this.selectedHour, 10),
          parseInt(this.selectedMinute, 10)
        )
      );
      this.$emit('update', dateTime.toISOString());
      this.$emit('complete', { dateTime: dateTime.toISOString() });
      this.showPanel = false;
    },
    closePanel() {
      this.showPanel = false;
    },
  },
};
</script>

<style scoped>
/* Compact DateTime Picker Styles */
.datetime-picker-compact {
  @apply relative w-full;
}

.input-container-compact {
  @apply relative;
}

.panel-compact {
  @apply absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3;
  min-width: 280px;
}

.panel-backdrop {
  @apply fixed inset-0 z-40;
}

.panel-header {
  @apply flex items-center justify-between mb-3 pb-2 border-b border-gray-200;
}

.selection-section {
  @apply mb-3;
}

.section-label {
  @apply flex items-center text-xs font-medium text-gray-700 mb-2;
}

.date-selection-compact {
  @apply grid grid-cols-3 gap-2;
}

.time-selection-compact {
  @apply flex items-center gap-2;
}

.time-separator {
  @apply text-sm font-medium text-gray-500;
}

.select-compact {
  @apply w-full px-2 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all;
}

.select-compact:focus {
  @apply shadow-sm;
}

.button-row-compact {
  @apply flex justify-end space-x-2 pt-2 border-t border-gray-200;
}

.btn-primary-compact {
  @apply inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500;
}

.btn-secondary-compact {
  @apply inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-500;
}

/* Responsive Design */
@media (max-width: 640px) {
  .panel-compact {
    @apply left-0 right-0;
    min-width: auto;
  }
  
  .date-selection-compact {
    @apply grid-cols-1 gap-1;
  }
  
  .time-selection-compact {
    @apply flex-col gap-1;
  }
  
  .time-separator {
    @apply hidden;
  }
  
  .button-row-compact {
    @apply flex-col space-x-0 space-y-1;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .panel-compact {
    @apply bg-gray-800 border-gray-700;
  }
  
  .section-label {
    @apply text-gray-300;
  }
  
  .select-compact {
    @apply bg-gray-700 border-gray-600 text-white;
  }
  
  .select-compact:focus {
    @apply border-indigo-400 ring-indigo-400;
  }
  
  .btn-secondary-compact {
    @apply bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600;
  }
}

/* Animation Enhancements */
.select-compact {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.select-compact:hover {
  @apply border-gray-400;
}

.btn-primary-compact:hover {
  transform: translateY(-1px);
  @apply shadow-sm;
}

.btn-secondary-compact:hover {
  transform: translateY(-1px);
  @apply shadow-sm;
}

/* Focus States */
.select-compact:focus {
  @apply ring-2 ring-indigo-500 ring-opacity-50;
}

.btn-primary-compact:focus {
  @apply ring-2 ring-indigo-500 ring-opacity-50;
}

.btn-secondary-compact:focus {
  @apply ring-2 ring-gray-500 ring-opacity-50;
}

/* Loading State */
.select-compact:disabled {
  @apply opacity-50 cursor-not-allowed bg-gray-100;
}

/* Custom Scrollbar for Select */
.select-compact {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f8fafc;
}

.select-compact::-webkit-scrollbar {
  width: 4px;
}

.select-compact::-webkit-scrollbar-track {
  background: #f8fafc;
}

.select-compact::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.select-compact::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>