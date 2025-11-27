<template>
  <div class="event-view bg-white rounded-xl shadow-lg overflow-hidden mt-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <i class="fas fa-calendar-alt text-white"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold">รายการกิจกรรม</h2>
            <p class="text-green-100 text-sm">จัดการและติดตามกิจกรรมทั้งหมด</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            @click="fetchCalendarEvents" 
            class="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <i class="fas fa-sync-alt"></i>
            <span class="hidden sm:inline">รีเฟรช</span>
          </button>
          <select 
            v-model="selectedYear" 
            @change="updateYear" 
            class="px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option v-for="year in yearOptions" :key="year" :value="year" class="text-gray-900">{{ year + 543 }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Empty State -->
      <div v-if="filteredEventList.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-calendar-times text-gray-400 text-2xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีกิจกรรม</h3>
        <p class="text-gray-500">ยังไม่มีกิจกรรมในปีที่เลือก</p>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Statistics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-calendar text-white text-sm"></i>
              </div>
              <div>
                <p class="text-sm text-blue-600 font-medium">กิจกรรมทั้งหมด</p>
                <p class="text-2xl font-bold text-blue-700">{{ totalTasks }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-clock text-white text-sm"></i>
              </div>
              <div>
                <p class="text-sm text-yellow-600 font-medium">กำลังดำเนินการ</p>
                <p class="text-2xl font-bold text-yellow-700">{{ tasksInProgress }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-exclamation-triangle text-white text-sm"></i>
              </div>
              <div>
                <p class="text-sm text-red-600 font-medium">เกินกำหนด</p>
                <p class="text-2xl font-bold text-red-700">{{ overdueTasks }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-calendar-week text-white text-sm"></i>
              </div>
              <div>
                <p class="text-sm text-purple-600 font-medium">7 วันข้างหน้า</p>
                <p class="text-2xl font-bold text-purple-700">{{ upcomingTasks }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Events by Month -->
        <div class="space-y-6">
          <div v-for="(events, monthYear) in groupedEvents" :key="monthYear" class="bg-gray-50 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fas fa-calendar-alt text-blue-600"></i>
              {{ formatMonthYear(monthYear) }}
              <span class="ml-auto text-sm font-normal text-gray-500">{{ events.length }} กิจกรรม</span>
            </h3>
            
            <div class="space-y-3">
              <div 
                v-for="event in events" 
                :key="event._id" 
                class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200 event-card"
                :class="{ 'ring-2 ring-red-200 bg-red-50': event.priority }"
              >
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <!-- Date and Location -->
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <span 
                        class="inline-block w-3 h-3 rounded-full" 
                        :style="{ backgroundColor: getColorCode(event.color) }"
                      ></span>
                      <span class="text-sm font-medium text-gray-700">
                        <span v-if="isSameDate(event.startDate, event.endDate)">
                          {{ formatDate(event.startDate) }}
                        </span>
                        <span v-else>
                          {{ formatDateRange(event.startDate, event.endDate) }}
                        </span>
                      </span>
                      <i v-if="event.priority" class="fas fa-star text-yellow-500 text-xs"></i>
                    </div>
                    
                    <div v-if="event.location" class="flex items-center gap-2 text-sm text-gray-500">
                      <i class="fas fa-map-marker-alt text-xs"></i>
                      <span>{{ event.location }}</span>
                    </div>
                  </div>
                  
                  <!-- Title and Description -->
                  <div class="flex flex-col gap-1">
                    <h4 class="font-semibold text-gray-900">{{ event.title }}</h4>
                    <p v-if="event.description" class="text-sm text-gray-600 line-clamp-2">{{ event.description }}</p>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ getTypeLabel(event.type) }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Actions -->
                  <div class="flex items-center justify-end">
                    <button 
                      @click="editEvent(event)" 
                      class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      <i class="fas fa-edit text-sm"></i>
                      <span class="hidden sm:inline">แก้ไข</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

export default {
  props: {
    eventList: {
      type: Array,
      required: true
    },
    currentCalendar: Object,
  },
  data() {
    return {
      selectedYear: new Date().getFullYear(),
      localEventList: [],
      selectedMonth: 0, // Optional: you can modify to use this in your logic
      configs: storageManager.get('configs'),
    };
  },
  computed: {
    yearOptions() {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 2;
      const endYear = currentYear + 2;
      const years = [];

      for (let year = startYear; year <= endYear; year++) {
        years.push(year);
      }

      return years;
    },
    filteredEventList() {
      return this.localEventList.filter(event => new Date(event.startDate).getFullYear() === this.selectedYear);
    },
    groupedEvents() {
      const eventsByMonthYear = {};

      this.filteredEventList.forEach(event => {
        const date = new Date(event.startDate);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;

        if (!eventsByMonthYear[monthYear]) {
          eventsByMonthYear[monthYear] = [];
        }

        eventsByMonthYear[monthYear].push(event);
      });

      // Sort events within each month by start date
      for (const monthYear in eventsByMonthYear) {
        eventsByMonthYear[monthYear].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      }

      return eventsByMonthYear;
    },
    totalTasks() {
      return this.filteredEventList.length;
    },
    tasksInProgress() {
      const today = new Date();
      return this.filteredEventList.filter(event => {
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = new Date(event.endDate);
        return today >= eventStartDate && today <= eventEndDate;
      }).length;
    },
    overdueTasks() {
      const today = new Date();
      return this.filteredEventList.filter(event => new Date(event.endDate) < today).length;
    },
    upcomingTasks() {
      const today = new Date();
      const next7Days = new Date(today);
      next7Days.setDate(today.getDate() + 7);

      return this.filteredEventList.filter(event => {
        const eventStartDate = new Date(event.startDate);
        return eventStartDate > today && eventStartDate <= next7Days;
      }).length;
    }
  },
  methods: {
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    formatDateRange(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

      if (sameMonth) {
        const startDay = start.getDate();
        const endDay = end.getDate();
        return `${start.toLocaleDateString(undefined, { month: 'long' })} ${startDay}-${endDay}, ${start.getFullYear()}`;
      } else {
        return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
      }
    },
    isSameDate(startDate, endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return start.toDateString() === end.toDateString();
    },
    formatMonthYear(monthYear) {
      const [year, month] = monthYear.split('-');
      const date = new Date(year, month);
      const options = { year: 'numeric', month: 'long' };
      return date.toLocaleDateString(undefined, options);
    },
    async fetchCalendarEvents() {
      try {
        const startDate = new Date(this.selectedYear, 0, 1); // Fetching events for the entire year
        const endDate = new Date(this.selectedYear, 11, 31); // End of the year

        const eventResponse = await Request.POST(
          'calendar_event/query',
          {
            method: 'find',
            args: [
              {
                calendarId: this.currentCalendar._id,
                $or: [
                  {
                    startDate: { $gte: startDate, $lte: endDate }
                  },
                  {
                    endDate: { $gte: startDate, $lte: endDate }
                  }
                ]
              }
            ]
          },
          this.configs.key
        );

        if (eventResponse.status === 200) {
          this.localEventList = eventResponse.data; // Update localEventList
          console.log(this.localEventList); // Debugging: Check if events are correctly fetched
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    },
    updateYear() {
      this.fetchCalendarEvents(); // Fetch the events when the year is changed
    },
    editEvent(event) {
      this.$emit('editEvent', event);
    },
    getColorCode(colorValue) {
      const colors = [
        { value: 'pink', colorCode: '#f28b82' },
        { value: 'red', colorCode: '#ea4335' },
        { value: 'orange', colorCode: '#fbbc04' },
        { value: 'yellow', colorCode: '#fdd835' },
        { value: 'green', colorCode: '#81c995' },
        { value: 'lightBlue', colorCode: '#aecbfa' },
        { value: 'blue', colorCode: '#4285f4' },
        { value: 'purple', colorCode: '#aa66cc' },
        { value: 'gray', colorCode: '#9e9e9e' },
        { value: 'black', colorCode: '#000000' }
      ];
      const color = colors.find(c => c.value === colorValue);
      return color ? color.colorCode : '#4285f4';
    },
    getTypeLabel(type) {
      const types = {
        'event': 'กิจกรรม',
        'todo': 'สิ่งที่ต้องทำ',
        'job': 'งาน',
        'work': 'ทำงาน',
        'remind': 'เตือนความจำ'
      };
      return types[type] || type;
    }
  },
  mounted() {
    this.fetchCalendarEvents(); // Fetch events when the component is mounted
  }
};
</script>

<style scoped>
/* Event card animations */
.event-card {
  transition: all 0.2s ease-in-out;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Statistics cards hover effect */
.bg-gradient-to-br {
  transition: all 0.2s ease-in-out;
}

.bg-gradient-to-br:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Button hover effects */
button {
  transition: all 0.2s ease-in-out;
}

button:hover {
  transform: translateY(-1px);
}

/* Header gradient animation */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .text-2xl {
    font-size: 1.25rem;
  }
}

@media (max-width: 640px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}

/* Focus visible for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .border-gray-200 {
    border-color: #000;
  }
  
  .text-gray-600 {
    color: #000;
  }
  
  .bg-gray-50 {
    background-color: #fff;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
