<template>
  <div class="kanban-board bg-white rounded-xl shadow-lg overflow-hidden mt-6">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <i class="fas fa-tasks text-white"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold">Kanban Board</h2>
            <p class="text-purple-100 text-sm">จัดการงานแบบ Kanban</p>
          </div>
        </div>
        
        <button 
          @click="fetchCalendarEvents" 
          class="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200"
        >
          <i class="fas fa-sync-alt"></i>
          <span class="hidden sm:inline">รีเฟรช</span>
        </button>
      </div>
    </div>

    <!-- Kanban Columns -->
    <div class="p-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Overdue Column -->
        <div class="kanban-column">
          <div class="column-header bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg mb-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="fas fa-exclamation-triangle"></i>
                <h3 class="font-semibold">เกินกำหนด</h3>
              </div>
              <span class="bg-white/20 px-2 py-1 rounded-full text-sm">{{ overdueTasks.length }}</span>
            </div>
          </div>
          
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div v-if="overdueTasks.length === 0" class="text-center py-8 text-gray-500">
              <i class="fas fa-check-circle text-3xl mb-2"></i>
              <p>ไม่มีงานเกินกำหนด</p>
            </div>
            <div 
              v-for="task in overdueTasks" 
              :key="task._id" 
              class="kanban-task bg-white border border-red-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-semibold text-gray-900 flex-1">{{ task.title }}</h4>
                <span 
                  class="w-3 h-3 rounded-full flex-shrink-0 ml-2" 
                  :style="{ backgroundColor: getColorCode(task.color) }"
                ></span>
              </div>
              
              <div class="text-sm text-gray-600 mb-2">
                <div class="flex items-center gap-1 mb-1">
                  <i class="fas fa-calendar text-xs"></i>
                  <span>{{ formatDate(task.startDate) }} - {{ formatDate(task.endDate) }}</span>
                </div>
                <div class="flex items-center gap-1 text-red-500">
                  <i class="fas fa-clock text-xs"></i>
                  <span>เกิน {{ daysAgo(task.endDate) }} วัน</span>
                </div>
              </div>
              
              <p v-if="task.description" class="text-sm text-gray-600 line-clamp-2">{{ task.description }}</p>
              
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {{ getTypeLabel(task.type) }}
                </span>
                <button 
                  @click="editTask(task)"
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  แก้ไข
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- In Progress Column -->
        <div class="kanban-column">
          <div class="column-header bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg mb-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="fas fa-play-circle"></i>
                <h3 class="font-semibold">กำลังดำเนินการ</h3>
              </div>
              <span class="bg-white/20 px-2 py-1 rounded-full text-sm">{{ tasksInProgress.length }}</span>
            </div>
          </div>
          
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div v-if="tasksInProgress.length === 0" class="text-center py-8 text-gray-500">
              <i class="fas fa-plus-circle text-3xl mb-2"></i>
              <p>ไม่มีงานที่กำลังดำเนินการ</p>
            </div>
            <div 
              v-for="task in tasksInProgress" 
              :key="task._id" 
              class="kanban-task bg-white border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-semibold text-gray-900 flex-1">{{ task.title }}</h4>
                <span 
                  class="w-3 h-3 rounded-full flex-shrink-0 ml-2" 
                  :style="{ backgroundColor: getColorCode(task.color) }"
                ></span>
              </div>
              
              <div class="text-sm text-gray-600 mb-2">
                <div class="flex items-center gap-1">
                  <i class="fas fa-calendar text-xs"></i>
                  <span>{{ formatDate(task.startDate) }} - {{ formatDate(task.endDate) }}</span>
                </div>
              </div>
              
              <p v-if="task.description" class="text-sm text-gray-600 line-clamp-2">{{ task.description }}</p>
              
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ getTypeLabel(task.type) }}
                </span>
                <button 
                  @click="editTask(task)"
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  แก้ไข
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Column -->
        <div class="kanban-column">
          <div class="column-header bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg mb-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <i class="fas fa-calendar-week"></i>
                <h3 class="font-semibold">7 วันข้างหน้า</h3>
              </div>
              <span class="bg-white/20 px-2 py-1 rounded-full text-sm">{{ upcomingTasks.length }}</span>
            </div>
          </div>
          
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div v-if="upcomingTasks.length === 0" class="text-center py-8 text-gray-500">
              <i class="fas fa-calendar-check text-3xl mb-2"></i>
              <p>ไม่มีงานในสัปดาห์นี้</p>
            </div>
            <div 
              v-for="task in upcomingTasks" 
              :key="task._id" 
              class="kanban-task bg-white border border-green-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-semibold text-gray-900 flex-1">{{ task.title }}</h4>
                <span 
                  class="w-3 h-3 rounded-full flex-shrink-0 ml-2" 
                  :style="{ backgroundColor: getColorCode(task.color) }"
                ></span>
              </div>
              
              <div class="text-sm text-gray-600 mb-2">
                <div class="flex items-center gap-1 mb-1">
                  <i class="fas fa-calendar text-xs"></i>
                  <span>{{ formatDate(task.startDate) }} - {{ formatDate(task.endDate) }}</span>
                </div>
                <div class="flex items-center gap-1 text-green-600">
                  <i class="fas fa-clock text-xs"></i>
                  <span>อีก {{ daysUntil(task.startDate) }} วัน</span>
                </div>
              </div>
              
              <p v-if="task.description" class="text-sm text-gray-600 line-clamp-2">{{ task.description }}</p>
              
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {{ getTypeLabel(task.type) }}
                </span>
                <button 
                  @click="editTask(task)"
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  แก้ไข
                </button>
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
      currentCalendar: Object,
  },
  data() {
    return {
      localEventList: [],
      configs: storageManager.get('configs'),
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
    };
  },
  computed: {
      tasksInProgress() {
          const today = new Date();
          const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

          return this.localEventList.filter(event => {
          const eventStartDate = new Date(event.startDate);
          const eventEndDate = new Date(event.endDate);
          const eventStartDateUTC = new Date(Date.UTC(eventStartDate.getUTCFullYear(), eventStartDate.getUTCMonth(), eventStartDate.getUTCDate()));
          const eventEndDateUTC = new Date(Date.UTC(eventEndDate.getUTCFullYear(), eventEndDate.getUTCMonth(), eventEndDate.getUTCDate()));

          return todayUTC >= eventStartDateUTC && todayUTC <= eventEndDateUTC;
          });
      },
      overdueTasks() {
          const today = new Date();
          const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

          return this.localEventList.filter(event => {
          const eventEndDate = new Date(event.endDate);
          const eventEndDateUTC = new Date(Date.UTC(eventEndDate.getUTCFullYear(), eventEndDate.getUTCMonth(), eventEndDate.getUTCDate()));

          return eventEndDateUTC < todayUTC;
          });
      },
      upcomingTasks() {
          const today = new Date();
          const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
          const next7DaysUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 7));

          return this.localEventList.filter(event => {
          const eventStartDate = new Date(event.startDate);
          const eventStartDateUTC = new Date(Date.UTC(eventStartDate.getUTCFullYear(), eventStartDate.getUTCMonth(), eventStartDate.getUTCDate()));

          return eventStartDateUTC > todayUTC && eventStartDateUTC <= next7DaysUTC;
          });
      }
  },
  methods: {
      formatDate(date) {
          const options = { year: 'numeric', month: 'long', day: 'numeric' };
          const dateObj = new Date(date);
          const dateUTC = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate()));
          return dateUTC.toLocaleDateString(undefined, options);
      },
      daysAgo(endDate) {
          const today = new Date();
          const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
          const date = new Date(endDate);
          const dateUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

          const differenceInTime = todayUTC.getTime() - dateUTC.getTime();
          const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
          return differenceInDays;
      },
      daysUntil(startDate) {
          const today = new Date();
          const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
          const date = new Date(startDate);
          const dateUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

          const differenceInTime = dateUTC.getTime() - todayUTC.getTime();
          const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
          return differenceInDays;
      },
      async fetchCalendarEvents() {
          try {
          const startDate = new Date(Date.UTC(this.currentYear, this.currentMonth, 1)); // Start of the current month in UTC
          const endDate = new Date(Date.UTC(this.currentYear, this.currentMonth + 1, 0)); // End of the current month in UTC

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
              this.localEventList = eventResponse.data;
          }
          } catch (error) {
          console.error('Error fetching events:', error);
          }
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
      },
      editTask(task) {
        this.$emit('editEvent', task);
      }
  },
  mounted() {
    this.fetchCalendarEvents(); // Fetch events when the component is mounted
  }
};
</script>

<style scoped>
/* Kanban task animations */
.kanban-task {
  transition: all 0.2s ease-in-out;
}

.kanban-task:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Column header gradient animation */
.column-header {
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
@media (max-width: 1024px) {
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .kanban-column {
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 768px) {
  .text-xl {
    font-size: 1.125rem;
  }
  
  .p-6 {
    padding: 1rem;
  }
}

/* Focus visible for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .border-red-200,
  .border-blue-200,
  .border-green-200 {
    border-color: #000;
  }
  
  .text-gray-600 {
    color: #000;
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

/* Empty state styling */
.text-center i {
  opacity: 0.6;
}

/* Task priority indicators */
.kanban-task[data-priority="true"] {
  border-left: 4px solid #f59e0b;
}

/* Status badges */
.bg-red-100 {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.bg-blue-100 {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.bg-green-100 {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}
</style>
  