<template>
  <div class="calendar-view bg-white rounded-xl shadow-lg overflow-hidden">
    <!-- Calendar Header -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <!-- Left Section -->
        <div class="flex items-center gap-4">
          <button 
            @click="goBackToList" 
            class="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
          >
            <i class="fas fa-arrow-left"></i>
            <span class="hidden sm:inline">กลับไปรายการ</span>
          </button>
          <div class="h-8 w-px bg-white/30"></div>
          <h2 class="text-xl md:text-2xl font-bold">{{ currentMonthYear }}</h2>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-2 flex-wrap">
          <button 
            @click="previousMonth" 
            class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <button 
            @click="goToToday" 
            class="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
          >
            วันนี้
          </button>

          <select 
            v-model="selectedMonth" 
            @change="fetchCalendarEvents" 
            class="px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option v-for="(month, index) in months" :key="index" :value="index" class="text-gray-900">{{ month }}</option>
          </select>

          <select 
            v-model="selectedYear" 
            @change="fetchCalendarEvents" 
            class="px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option v-for="year in yearOptions" :key="year" :value="year" class="text-gray-900">{{ year + 543 }}</option>
          </select>

          <button 
            @click="nextMonth" 
            class="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="p-6">
      <!-- Days of Week Header -->
      <div class="grid grid-cols-7 gap-1 mb-4">
        <div 
          v-for="day in daysOfWeek" 
          :key="day" 
          class="text-center text-sm font-semibold text-gray-600 py-3 bg-gray-50 rounded-lg"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="(day, index) in flattenedDays"
          :key="index"
          class="relative min-h-[120px] p-2 border border-gray-100 rounded-lg cursor-pointer day-block transition-all duration-200 hover:shadow-md"
          :class="{
            'bg-blue-50 border-blue-200 shadow-md': isToday(day),
            'opacity-30 cursor-not-allowed bg-gray-50': !day,
            'bg-gray-50': isWeekend(index) && day,
            'hover:bg-blue-50 hover:border-blue-200': day && !isToday(day)
          }"
          @dragover.prevent
          @dragenter.prevent
          @drop="onDrop(day)"
          @dblclick="createNewEvent(day)"
        >
          <!-- Day Number -->
          <div v-if="day" class="absolute top-2 right-2">
            <span 
              class="inline-flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full transition-all"
              :class="{ 
                'bg-blue-600 text-white shadow-lg': isToday(day),
                'text-gray-700 hover:bg-blue-100': !isToday(day)
              }"
            >
              {{ day }}
            </span>
          </div>

          <!-- Events -->
          <div v-if="day" class="mt-10 space-y-1">
            <template v-for="event in getEventsForDate(day)" :key="event?._id">
              <div
                v-if="event"
                :style="{ backgroundColor: getColorCode(event.color) }"
                class="text-white text-xs rounded-md px-2 py-1 cursor-pointer event-item transition-all duration-200 hover:shadow-md hover:scale-105"
                @dragstart="onDragStart($event, event)"
                draggable="true"
                @click.stop="editTask(event)"
              >
                <div class="flex items-center gap-1">
                  <i v-if="event.priority" class="fas fa-star text-yellow-300 text-xs"></i>
                  <span class="truncate">{{ event?.title || 'ไม่มีชื่อ' }}</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Add Event Hint -->
          <div 
            v-if="day && getEventsForDate(day).length === 0" 
            class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
          >
            <div class="text-gray-400 text-xs text-center">
              <i class="fas fa-plus mb-1"></i>
              <div>เพิ่มกิจกรรม</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Section -->
    <div class="bg-gray-50 p-6 border-t border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <i class="fas fa-chart-bar text-blue-600"></i>
        สถิติวันว่าง
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-calendar text-blue-600"></i>
            </div>
            <div>
              <p class="text-sm text-gray-600">วันว่างทั้งหมด</p>
              <p class="text-xl font-bold text-gray-900">{{ freeDays.freeDaysIncludingWeekends }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-briefcase text-green-600"></i>
            </div>
            <div>
              <p class="text-sm text-gray-600">วันทำงานว่าง</p>
              <p class="text-xl font-bold text-gray-900">{{ freeDays.freeDaysOnlyWeekdays }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-home text-purple-600"></i>
            </div>
            <div>
              <p class="text-sm text-gray-600">วันหยุดว่าง</p>
              <p class="text-xl font-bold text-gray-900">{{ freeDays.freeWeekendDays }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Configuration Modal -->
    <div v-if="showEventConfig" class="fixed inset-0 flex items-center justify-center z-50 modal-overlay">
      <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" @click="closeEventConfig"></div>
      <div class="bg-white rounded-xl p-6 shadow-2xl max-w-2xl w-full mx-4 relative modal-content max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-calendar-plus text-blue-600"></i>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">{{ isEditingEvent ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่' }}</h2>
              <p class="text-sm text-gray-500">{{ isEditingEvent ? 'ปรับแต่งรายละเอียดกิจกรรม' : 'สร้างกิจกรรมใหม่ในปฏิทิน' }}</p>
            </div>
          </div>
          <button 
            @click="closeEventConfig"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-times text-lg"></i>
          </button>
        </div>

        <form @submit.prevent="saveEvent" class="space-y-6">
          <!-- Basic Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
              <i class="fas fa-info-circle text-blue-500"></i>
              ข้อมูลพื้นฐาน
            </h3>
            
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อกิจกรรม *</label>
              <input
                v-model="eventData.title"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="text"
                placeholder="เช่น ประชุมทีม, งานเลี้ยง"
                required
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
              <textarea
                v-model="eventData.description"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows="3"
                placeholder="อธิบายรายละเอียดของกิจกรรม..."
              ></textarea>
            </div>
          </div>

          <!-- Date & Time -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
              <i class="fas fa-clock text-green-500"></i>
              วันที่และเวลา
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มต้น</label>
                <input
                  v-model="eventData.startDate"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="date"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label>
                <input
                  v-model="eventData.endDate"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="date"
                />
              </div>
            </div>
          </div>

          <!-- Event Settings -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
              <i class="fas fa-cog text-purple-500"></i>
              การตั้งค่า
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Event Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทกิจกรรม</label>
                <select v-model="eventData.type" class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option v-for="type in types" :key="type.value" :value="type.value">{{ type.label }}</option>
                </select>
              </div>

              <!-- Priority -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ความสำคัญ</label>
                <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="eventData.priority"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span class="ml-3 text-sm font-medium text-gray-700">ความสำคัญสูง</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Location -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สถานที่</label>
              <input
                v-model="eventData.location"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="text"
                placeholder="เช่น ห้องประชุม A, ออนไลน์"
              />
            </div>

            <!-- Event Color -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สีกิจกรรม</label>
              <div class="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                <label
                  v-for="color in colors"
                  :key="color.value"
                  :style="{ backgroundColor: color.colorCode }"
                  class="color-circle cursor-pointer w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                  :class="{ 'ring-2 ring-offset-2 ring-blue-500': eventData.color === color.value }"
                >
                  <input type="radio" v-model="eventData.color" :value="color.value" class="hidden" />
                  <i v-if="eventData.color === color.value" class="fas fa-check text-white text-xs"></i>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <div class="flex items-center gap-3">
              <button
                type="button"
                @click="closeEventConfig"
                class="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <i class="fas fa-save"></i>
                {{ isEditingEvent ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างกิจกรรม' }}
              </button>
            </div>
            
            <!-- Delete button -->
            <button
              v-if="isEditingEvent"
              @click.prevent="deleteEvent"
              class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <i class="fas fa-trash"></i>
              ลบกิจกรรม
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- API Share Section -->
    <div class="bg-white border-t border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <i class="fas fa-share-alt text-indigo-600"></i>
        แชร์ปฏิทินสาธารณะ
      </h3>
      <div class="flex items-center gap-3">
        <input
          type="text"
          v-model="apiUrl"
          readonly
          class="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm"
          placeholder="URL สำหรับแชร์ปฏิทิน"
        />
        <button
          @click="copyToClipboard"
          class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <i class="fas fa-copy"></i>
          คัดลอก
        </button>
      </div>
    </div>
  </div>

  <!-- Event List View -->
  <event-view
    :event-list="localEventList"
    :current-calendar="currentCalendar"
    @editEvent="editTask"
  ></event-view>

  <task-view
    :event-list="localEventList"
    :current-calendar="currentCalendar"
    @editEvent="editTask"
  ></task-view>
</template>

<script>
import EventView from './Event.vue';
import TaskView from './Task.vue';

import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

export default {
  components: {
    EventView,
    TaskView
  },
  props: {
    selectedCalendar: Object,
    eventList: Array,
  },
  data() {
    return {
      localEventList: [], // Local data property to store the events
      currentCalendar: this.selectedCalendar,
      currentDate: new Date(),
      selectedMonth: (new Date()).getMonth(),
      selectedYear: (new Date()).getFullYear(),
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      showEventConfig: false, // Controls the visibility of the event configuration dialog
      eventData: null, // Placeholder for the event data being edited
      isEditingEvent: false, // Flag to check if we're editing or adding an event
      colors: [
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
      ],
      types: [
        { value: 'event', label: 'Event' },
        { value: 'todo', label: 'Todo' },
        { value: 'job', label: 'Job' },
        { value: 'work', label: 'Work' },
        { value: 'remind', label: 'Remind' },
      ],
    };
  },
  computed: {
    apiUrl() {
      return `https://gateway.cloudrestfulapi.com/api/appointment/${this.selectedCalendar?._id}?key=${this.configs?.key}`;
    },
    currentMonthYear() {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = monthNames[this.selectedMonth];
      const year = this.selectedYear + 543; // Convert to Thai Buddhist Era
      return `${month} ${year} BE`;
    },
    freeDays() {
      const { freeDaysIncludingWeekends, freeDaysOnlyWeekdays } = this.calculateFreeDaysInMonth();
      const freeWeekendDays = this.calculateFreeWeekendDaysInMonth();
      return {
        freeDaysIncludingWeekends,
        freeDaysOnlyWeekdays,
        freeWeekendDays
      };
    },
    daysOfWeek() {
      return ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']; // Shortened Thai days of the week
    },
    weeksInMonth() {
      const year = this.selectedYear;
      const month = this.selectedMonth;
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const weeks = [[]];
      let currentWeek = weeks[0];

      for (let i = 0; i < firstDayOfMonth; i++) {
        currentWeek.push(null); // Push nulls for padding
      }

      for (let day = 1; day <= daysInMonth; day++) {
        if (currentWeek.length === 7) {
          currentWeek = [];
          weeks.push(currentWeek);
        }
        currentWeek.push(day);
      }

      while (currentWeek.length < 7) {
        currentWeek.push(null); // Push nulls to fill the last week
      }

      return weeks;
    },
    flattenedDays() {
      return this.weeksInMonth.flat();
    },
    months() {
      return [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
    },
    yearOptions() {
      const currentYear = new Date().getFullYear();
      return [currentYear - 1, currentYear, currentYear + 1];
    },
  },
  methods: {
    copyToClipboard() {
      const el = document.createElement('textarea');
      el.value = this.apiUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      alert('URL copied to clipboard');
    },
    convertToBangkokTimezone(date) {
      // Convert date to Bangkok timezone (UTC+7)
      const options = {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };

      const formatter = new Intl.DateTimeFormat('en-US', options);
      const formattedParts = formatter.formatToParts(date);

      const year = formattedParts.find(part => part.type === 'year').value;
      const month = formattedParts.find(part => part.type === 'month').value;
      const day = formattedParts.find(part => part.type === 'day').value;
      const hour = formattedParts.find(part => part.type === 'hour').value;
      const minute = formattedParts.find(part => part.type === 'minute').value;
      const second = formattedParts.find(part => part.type === 'second').value;

      // Return date in ISO string format but in Bangkok timezone
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`).toISOString();
    },
    isToday(day) {
      if (!day) return false;

      const today = new Date();
      const selectedDateUTC = new Date(Date.UTC(this.selectedYear, this.selectedMonth, day));
      const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

      return selectedDateUTC.getTime() === todayUTC.getTime();
    },
    isWeekend(index) {
      // If index is 0 (Sunday) or 6 (Saturday), return true
      return index % 7 === 0 || index % 7 === 6;
    },
    async fetchCalendarEvents() {
      try {
        // Set startDate to the start of the selected month in UTC
        const startDate = new Date(Date.UTC(this.selectedYear, this.selectedMonth, 1));

        // Set endDate to the end of the selected month in UTC
        const endDate = new Date(Date.UTC(this.selectedYear, this.selectedMonth + 1, 0, 23, 59, 59, 999));

        // Convert dates to ISO strings for querying
        const startDateISO = startDate.toISOString();
        const endDateISO = endDate.toISOString();

        const eventResponse = await Request.POST(
          'calendar_event/query',
          {
            method: 'find',
            args: [
              {
                calendarId: this.selectedCalendar._id,
                $or: [
                  {
                    startDate: { $gte: startDateISO, $lte: endDateISO }
                  },
                  {
                    endDate: { $gte: startDateISO, $lte: endDateISO }
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
    calculateFreeDaysInMonth() {
      const currentYear = this.selectedYear;
      const currentMonth = this.selectedMonth;
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      let freeDaysIncludingWeekends = 0;
      let freeDaysOnlyWeekdays = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(currentYear, currentMonth, day);
        const dayOfWeek = currentDate.getDay();
        const events = this.getEventsForDate(day);

        if (events.length === 0) {
          freeDaysIncludingWeekends++;
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            freeDaysOnlyWeekdays++;
          }
        }
      }

      return {
        freeDaysIncludingWeekends,
        freeDaysOnlyWeekdays
      };
    },
    calculateFreeWeekendDaysInMonth() {
      const currentYear = this.selectedYear;
      const currentMonth = this.selectedMonth;
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      let freeWeekendDays = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(currentYear, currentMonth, day);
        const dayOfWeek = currentDate.getDay();
        const events = this.getEventsForDate(day);

        // Count if it's a weekend day and has no events
        if (events.length === 0 && (dayOfWeek === 0 || dayOfWeek === 6)) {
          freeWeekendDays++;
        }
      }

      return freeWeekendDays;
    },
     adjustDateForTimeZone(date) {
      const offset = date.getTimezoneOffset();
      return new Date(date.getTime() + offset * 60 * 1000);
    },
    getEventsForDate(day) {
      
      const year = this.selectedYear;
      const month = this.selectedMonth;
      const selectedDate = new Date(Date.UTC(year, month, day));
      
      const events = this.localEventList.filter(event => {
        
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = new Date(event.endDate);

        console.log("day",day);
        console.log("eventStartDate",eventStartDate);
        console.log("eventEndDate",eventEndDate);
        
        // Convert the event start and end dates to Bangkok timezone
        const eventStartDateBangkok = new Date(this.convertToBangkokTimezone(eventStartDate));
        const eventEndDateBangkok = new Date(this.convertToBangkokTimezone(eventEndDate));

        return selectedDate >= eventStartDateBangkok && selectedDate <= eventEndDateBangkok;
      });

      return events;
    },
    onDragStart(event, eventData) {
      event.dataTransfer.setData('eventData', JSON.stringify(eventData));
    },
    async onDrop(day) {
      if (!day) return; // Prevent dropping on empty days

      const eventData = JSON.parse(event.dataTransfer.getData('eventData'));
      
      // Ensure startDate and endDate are Date objects
      const eventStartDate = new Date(eventData.startDate);
      const eventEndDate = new Date(eventData.endDate);

      const newDate = new Date(Date.UTC(this.selectedYear, this.selectedMonth, day)); // Use UTC here

      // Calculate the day difference in milliseconds
      const dayDifference = (newDate - eventStartDate) / (1000 * 60 * 60 * 24);

      // Adjust the startDate and endDate of the event to the new date
      const newStartDate = new Date(Date.UTC(eventStartDate.getUTCFullYear(), eventStartDate.getUTCMonth(), eventStartDate.getUTCDate() + dayDifference));
      const newEndDate = new Date(Date.UTC(eventEndDate.getUTCFullYear(), eventEndDate.getUTCMonth(), eventEndDate.getUTCDate() + dayDifference));

      // Update the event's dates
      this.eventData = { ...eventData, startDate: newStartDate.toISOString(), endDate: newEndDate.toISOString() };
      
      try {
        await this.updateEvent();
        this.fetchCalendarEvents(); // Re-fetch events after updating
      } catch (error) {
        console.error('Failed to update event:', error);
      }
    },
    formatDateForInput(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = ('0' + (d.getMonth() + 1)).slice(-2);
      const day = ('0' + d.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    },
    editTask(event) {
      this.eventData = { ...event };
      this.eventData.startDate = this.formatDateForInput(event.startDate);
      this.eventData.endDate = this.formatDateForInput(event.endDate);
      this.isEditingEvent = true;
      this.showEventConfig = true;
    },
    closeEventConfig() {
      this.showEventConfig = false;
      this.eventData = null;
      this.isEditingEvent = false;
    },
    async saveEvent() {
      if (this.isEditingEvent) {
        await this.updateEvent();
      } else {
        await this.addEvent();
      }
    },
    async addEvent() {
      try {
        // Convert startDate and endDate to Bangkok timezone before saving
        const startDateBangkok = this.convertToBangkokTimezone(new Date(this.eventData.startDate));
        const endDateBangkok = this.convertToBangkokTimezone(new Date(this.eventData.endDate));

        const response = await Request.POST('calendar_event/', {
          data: {
            ...this.eventData,
            startDate: startDateBangkok,
            endDate: endDateBangkok,
            calendarId: this.selectedCalendar._id
          }
        }, this.configs.key);

        if (response.status === 200) {
          this.fetchCalendarEvents();
          this.showEventConfig = false;
        }
      } catch (error) {
        console.error('Error adding event:', error);
      }
    },
    async updateEvent() {
      try {
        // Convert startDate and endDate to Bangkok timezone before updating
        const startDateBangkok = this.convertToBangkokTimezone(new Date(this.eventData.startDate));
        const endDateBangkok = this.convertToBangkokTimezone(new Date(this.eventData.endDate));

        const response = await Request.PUT(`calendar_event/${this.eventData._id}`, {
          data: {
            ...this.eventData,
            startDate: startDateBangkok,
            endDate: endDateBangkok,
            _id: undefined, // Remove _id field
            calendarId: this.selectedCalendar._id
          }
        }, this.configs.key);

        if (response.status === 200) {
          this.fetchCalendarEvents();
          this.showEventConfig = false;
        }
      } catch (error) {
        console.error('Error updating event:', error);
      }
    },
    async deleteEvent() {
      try {
        const response = await Request.DELETE(`calendar_event/${this.eventData._id}`, {}, this.configs.key);
        if (response.status === 200) {
          const index = this.eventList.findIndex(event => event._id === this.eventData._id);
          if (index !== -1) {
            //this.eventList.splice(index, 1); // Remove the deleted event from the list
            this.fetchCalendarEvents();
          }
          this.showEventConfig = false; // Close the modal after deletion
        }
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    },
    createNewEvent(day) {
      if (!day) return;

      const newDate = new Date(Date.UTC(this.selectedYear, this.selectedMonth, day));
      const startDateBangkok = this.convertToBangkokTimezone(newDate);

      this.eventData = {
        title: '',
        startDate: startDateBangkok.substring(0, 10), // Keep only the date part
        endDate: startDateBangkok.substring(0, 10),
        color: this.colors[0].value,
        description: '',
        type: this.types[0].value,
        priority: '',
        location: '',
      };
      this.isEditingEvent = false;
      this.showEventConfig = true;
    },
    selectDate(day) {
      this.$emit('dateSelected', new Date(this.selectedYear, this.selectedMonth, day));
    },
    previousMonth() {
      if (this.selectedMonth === 0) {
        this.selectedMonth = 11;
        this.selectedYear--;
      } else {
        this.selectedMonth--;
      }
      this.fetchCalendarEvents(); // Fetch events for the new month
    },
    nextMonth() {
      if (this.selectedMonth === 11) {
        this.selectedMonth = 0;
        this.selectedYear++;
      } else {
        this.selectedMonth++;
      }
      this.fetchCalendarEvents(); // Fetch events for the new month
    },
    goToToday() {
      const today = new Date();
      this.selectedMonth = today.getMonth();
      this.selectedYear = today.getFullYear();
      this.fetchCalendarEvents(); // Fetch events for the current month
    },
    goBackToList() {
      this.$emit('backToList');
    },
    getColorCode(colorValue) {
      const color = this.colors.find(c => c.value === colorValue);
      return color ? color.colorCode : '#4285f4'; // Default to blue if color is not found
    },
  },
  watch: {
    selectedMonth() {
      this.fetchCalendarEvents();
    },
    selectedYear() {
      this.fetchCalendarEvents();
    }
  },
  mounted() {
    this.fetchCalendarEvents();
  }
};
</script>

<style scoped>
/* Modal animations */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-overlay {
  animation: overlayFadeIn 0.2s ease-out;
}

.modal-content {
  animation: modalFadeIn 0.3s ease-out;
}

/* Calendar Layout */
.calendar-view {
  max-width: 100%;
}

.grid-cols-7 {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.day-block {
  min-height: 120px;
  transition: all 0.2s ease-in-out;
  position: relative;
}

.day-block:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Event items */
.event-item {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  font-weight: 500;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.event-item:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Color picker styles */
.color-circle {
  transition: all 0.2s ease-in-out;
  border: 2px solid transparent;
}

.color-circle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Form input focus effects */
input:focus,
textarea:focus,
select:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
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

/* Statistics cards */
.stats-card {
  transition: all 0.2s ease-in-out;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Today indicator */
.bg-blue-600 {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Weekend styling */
.bg-gray-50 {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

/* Drag and drop effects */
.day-block[draggable="true"] {
  cursor: grab;
}

.day-block:active {
  cursor: grabbing;
}

/* Loading states */
.loading {
  opacity: 0.6;
  pointer-events: none;
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
  .day-block {
    min-height: 80px;
  }
  
  .modal-content {
    margin: 1rem;
    max-height: 95vh;
  }
  
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .text-xl {
    font-size: 1.125rem;
  }
  
  .text-2xl {
    font-size: 1.25rem;
  }
}

@media (max-width: 640px) {
  .day-block {
    min-height: 60px;
  }
  
  .event-item {
    font-size: 0.7rem;
    padding: 2px 4px;
  }
}

/* Focus visible for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .border-gray-100 {
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

/* Print styles */
@media print {
  .modal-overlay,
  button {
    display: none !important;
  }
  
  .calendar-view {
    box-shadow: none !important;
  }
}
</style>

