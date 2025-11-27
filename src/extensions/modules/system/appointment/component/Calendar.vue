<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h1 class="text-lg font-semibold text-gray-900">{{ title }}</h1>
          <button 
            @click="prepareAddCalendar" 
            class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
            title="เพิ่มปฏิทินใหม่"
          >
            <i class="fas fa-plus text-sm"></i>
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-sm text-gray-700">ปฏิทินทั้งหมด</span>
              </div>
              <span class="text-sm font-semibold text-blue-600">{{ calendarList.length }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-700">กิจกรรม</span>
              </div>
              <span class="text-sm font-semibold text-green-600">{{ eventList ? eventList.length : 0 }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span class="text-sm text-gray-700">เดือนนี้</span>
              </div>
              <span class="text-sm font-semibold text-yellow-600">0</span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">เมนู</h3>
          <nav class="space-y-1">
            <button 
              @click="backToCalendarList" 
              class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 sidebar-menu-item"
              :class="{ 
                'bg-blue-100 text-blue-700 font-medium active': !selectedCalendar,
                'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedCalendar
              }"
            >
              <i class="fas fa-th-large text-sm w-4"></i>
              <span class="flex-1 text-left">ปฏิทินทั้งหมด</span>
              <span 
                v-if="calendarList.length > 0" 
                class="px-2 py-1 text-xs rounded-full status-badge"
                :class="{ 
                  'bg-blue-200 text-blue-800': !selectedCalendar,
                  'bg-gray-200 text-gray-600': selectedCalendar
                }"
              >
                {{ calendarList.length }}
              </span>
            </button>
            <button 
              v-if="selectedCalendar"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 sidebar-menu-item bg-blue-100 text-blue-700 font-medium active"
            >
              <i class="fas fa-calendar text-sm w-4"></i>
              <span class="flex-1 text-left">{{ selectedCalendar.title }}</span>
            </button>
          </nav>
        </div>

        <!-- Quick Actions -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการ</h3>
          <div class="space-y-2">
            <button 
              @click="prepareAddCalendar"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-plus text-sm w-4"></i>
              <span>เพิ่มปฏิทินใหม่</span>
            </button>
            <button 
              @click="fetchCalendars"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-sync-alt text-sm w-4"></i>
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        <!-- User Info -->
        <div class="mt-auto px-4 py-4">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-white text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ session?.current?.name || 'ผู้ใช้' }}</p>
              <p class="text-xs text-gray-500">ผู้ดูแลระบบ</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold text-gray-900">{{ title }}</h1>
          <button 
            @click="toggleMobileSidebar" 
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>

      <!-- Header Section -->
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <!-- Search Input -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input 
                type="text" 
                placeholder="ค้นหาปฏิทิน..." 
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <!-- Add Calendar Button (Mobile) -->
          <button 
            @click="prepareAddCalendar" 
            class="lg:hidden bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <i class="fas fa-plus text-xs"></i>
            เพิ่มปฏิทิน
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="h-full">
          <!-- Current View Info -->
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold text-gray-900">
                {{ selectedCalendar ? selectedCalendar.title : 'ปฏิทินทั้งหมด' }}
              </h2>
              <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {{ selectedCalendar ? (eventList ? eventList.length : 0) + ' กิจกรรม' : calendarList.length + ' ปฏิทิน' }}
              </span>
            </div>
          </div>

          <!-- Calendar Content -->
          <div class="h-full overflow-y-auto">
            <div class="event-view bg-white p-4 rounded-lg shadow">
              <div class="calendar-system">
                <!-- Calendar List View -->
                <div v-if="!selectedCalendar" class="calendar-list bg-white p-2">
                  <ul class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-0">
                    <li
                    v-for="(calendar, index) in calendarList"
                    :key="calendar._id"
                    class="calendar-item flex items-center justify-between bg-white cursor-pointer p-4 relative"
                    :class="{'border-r md:border-gray-100': (index % 3 !== 2)}"
                  >
                    <div @click="selectCalendar(calendar)" class="flex items-center">
                      <time :datetime="parseDate(calendar.createdAt).dateISO" class="icon mr-4">
                        <strong :style="{ backgroundColor: getColorCode(calendar.color) }">{{ parseDate(calendar.createdAt).month }}</strong>
                        <span>{{ parseDate(calendar.createdAt).date }}</span>
                        <em :style="{ color: getColorCode(calendar.color) }">{{ parseDate(calendar.createdAt).day }}</em>
                      </time>
                      <div class="calendar-details">
                        <div class="calendar-title text-lg font-semibold text-blue-600">{{ calendar.title }}</div>
                        <div class="calendar-description text-gray-600">{{ calendar.description }}</div>
                        <div class="calendar-created text-sm text-gray-400 mt-1">{{ calendar.createdAt }}</div>
                        <div class="calendar-events text-sm text-gray-400 mt-1">100 Events</div>
                        <div class="pt-1 border-t border-gray-100">
                          <!-- Edit Button -->
                          <button
                            @click.stop="editCalendar(calendar)"
                            class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs mr-1"
                          >
                            <font-awesome-icon :icon="['fas','edit']" class="text-white"/>
                          </button>
                          <button
                            @click.stop="editCalendar(calendar)"
                            class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                          >
                            <font-awesome-icon :icon="['fas','trash']" class="text-white"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                  </ul>
                </div>

                <!-- Calendar View -->
                <calendar-view
                  v-else
                  :selected-calendar="selectedCalendar"
                  :event-list="eventList"
                  @dateSelected="handleDateSelected"
                  @editEvent="handleEditEvent"
                  @backToList="backToCalendarList"
                ></calendar-view>

                <!-- Calendar configuration modal -->
                <CalendarConfig
                  v-if="showCalendarConfig"
                  :calendar-data="calendarData"
                  :is-editing="calendarData._id !== undefined"
                  @saveCalendar="saveCalendar"
                  @closeCalendarConfig="closeCalendarConfig"
                />

                <Chat/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="showMobileSidebar" 
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
      @click="toggleMobileSidebar"
    >
      <div 
        class="w-64 h-full bg-white transform transition-transform duration-300"
        @click.stop
      >
        <!-- Mobile Sidebar Content (same as desktop sidebar) -->
        <div class="flex flex-col h-full">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h1 class="text-lg font-semibold text-gray-900">{{ title }}</h1>
            <button 
              @click="toggleMobileSidebar"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Quick Stats -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
            <div class="space-y-2">
              <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg stats-card">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">ปฏิทินทั้งหมด</span>
                </div>
                <span class="text-sm font-semibold text-blue-600">{{ calendarList.length }}</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">กิจกรรม</span>
                </div>
                <span class="text-sm font-semibold text-green-600">{{ eventList ? eventList.length : 0 }}</span>
              </div>
            </div>
          </div>

          <!-- Navigation Menu -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">เมนู</h3>
            <nav class="space-y-1">
              <button 
                @click="backToCalendarListAndCloseMobile" 
                class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 sidebar-menu-item"
                :class="{ 
                  'bg-blue-100 text-blue-700 font-medium active': !selectedCalendar,
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedCalendar
                }"
              >
                <i class="fas fa-th-large text-sm w-4"></i>
                <span class="flex-1 text-left">ปฏิทินทั้งหมด</span>
                <span 
                  v-if="calendarList.length > 0" 
                  class="px-2 py-1 text-xs rounded-full status-badge"
                  :class="{ 
                    'bg-blue-200 text-blue-800': !selectedCalendar,
                    'bg-gray-200 text-gray-600': selectedCalendar
                  }"
                >
                  {{ calendarList.length }}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
import CalendarView from './Calendar/View.vue';
import CalendarConfig from './Calendar/Config.vue'; // Import the new CalendarConfig component

import Chat from '@/extensions/modules/system/livesupport/component/Chat.vue'; // Import the new CalendarConfig component

const Request = new requestClient(false);

export default {
  components: {
    CalendarView,
    CalendarConfig,
    Chat
  },
  data() {
    return {
      loader: false,
      calendarList: [],
      selectedCalendar: null,
      showCalendarConfig: false,
      isEditingEvent: false,
      calendarData: this.getEmptyCalendarData(),
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      title:'ปฏิทิน',
      showMobileSidebar: false,
      eventList: [],
      navigationData: [
        {
          name: 'เพิ่มปฏิทินใหม่',
          function: 'callFunction',
          style: 'plus',
          class: 'primary-btn',
          visible: true,
          type: 'call-function',
        },
      ],
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
    };
  },
  methods: {
    toggleMobileSidebar() {
      this.showMobileSidebar = !this.showMobileSidebar;
    },
    backToCalendarListAndCloseMobile() {
      this.backToCalendarList();
      this.toggleMobileSidebar();
    },
    getColorCode(colorValue) {
      const color = this.colors.find(c => c.value === colorValue);
      return color ? color.colorCode : '#000000'; // Default to black if color is not found
    },
    parseDate(dateString) {
      const date = new Date(dateString);
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const [day, month, dateNum] = date.toLocaleDateString('en-US', options).split(' ');

      return {
        day: day || 'Monday',
        month: month || 'August',
        date: dateNum || '13',
        dateISO: date.toISOString().split('T')[0] || '2024-08-13',
      };
    },
    getEmptyCalendarData() {
      return {
        title: '',
        description: '',
        type: 'default',
        color: '#3498db',
        notifications: false,
        viewType: 'month',
        timezone: 'UTC',
        defaultReminders: [15, 30],
        sharingOptions: {
          public: false,
          sharedWith: [],
        },
        recurrenceOptions: {
          allowRecurringEvents: true,
          defaultRecurrence: 'none',
        },
        permissions: {
          canEdit: true,
          canDelete: true,
        },
        customFields: [],
      };
    },
    async fetchCalendars() {
      this.loader = false;
      try {
        const calendarResponse = await Request.POST('calendar/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
        if (calendarResponse.status === 200) this.calendarList = calendarResponse.data;
      } catch (error) {
        console.error('Error fetching calendars:', error);
      } finally {
        this.loader = true;
      }
    },
    selectCalendar(calendar) {
      this.selectedCalendar = calendar;
      this.$router.push({ query: { item: calendar._id } }); // Update the URL with the selected calendar ID
      this.title = 'ปฏิทิน : ' + calendar.title
      this.fetchCalendarEvents();
    },
    backToCalendarList() {
      this.selectedCalendar = null;
      this.$router.push({ query: { item: null } }); // Remove the query parameter from the URL
      this.title = 'ปฏิทิน'
    },
    async fetchCalendarEvents() {
      try {
        const eventResponse = await Request.POST('calendar_event/query', { method: 'find', args: [{ calendarId: this.selectedCalendar._id }] }, this.configs.key);
        if (eventResponse.status === 200) this.eventList = eventResponse.data;
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    },
    prepareAddCalendar() {
      this.backToCalendarList();
      this.calendarData = this.getEmptyCalendarData();
      this.showCalendarConfig = true;
    },
    async saveCalendar(calendar) {
      if (calendar._id) {
        await this.updateCalendar(calendar);
      } else {
        await this.addCalendar(calendar);
      }
    },
    async addCalendar(calendar) {
      try {
        const response = await Request.POST('calendar/', { data: { ...calendar, unit: this.session.current._id || this.configs.siteID } }, this.configs.key);
        if (response.status === 200) {
          this.calendarList.push(response.data);
          this.selectCalendar(response.data); // Automatically select and display the new calendar
          this.showCalendarConfig = false;
        }
      } catch (error) {
        console.error('Error adding calendar:', error);
      }
    },
    async updateCalendar(calendar) {
      try {
        const response = await Request.PUT(
          `calendar/${this.calendarData._id}`, // Replace 'calendar_id' with the actual ID of the calendar
          { 
            data: { 
              ...calendar, 
              _id: undefined, // Remove _id field
              unit: this.session.current._id || this.configs.siteID 
            } 
          },
          this.configs.key
        );

        if (response.status === 200) {
          this.showCalendarConfig = false;
          this.fetchCalendars()
        }
      } catch (error) {
        console.error('Error updating calendar:', error);
      }
    },
    editCalendar(calendar) {
      this.calendarData = { ...calendar }; // Populate the form with the existing calendar data
      this.showCalendarConfig = true; // Show the modal to edit the calendar
    },
    closeCalendarConfig() {
      this.showCalendarConfig = false;
    },
    prepareAddEvent(date) {
      this.eventData = this.getEmptyEventData();
      this.eventData.startDate = date.toISOString().split('T')[0];
      this.eventData.endDate = date.toISOString().split('T')[0];
      this.isEditingEvent = false;
      this.showEventConfig = true;
    },
    closeEventConfig() {
      this.showEventConfig = false;
    },
    handleDateSelected(date) {
      this.prepareAddEvent(date);
    },
    handleEditEvent(event) {
      this.eventData = { ...event };
      this.isEditingEvent = true;
      this.showEventConfig = true;
    },
  },
  mounted() {
    // First, fetch the list of calendars
    this.fetchCalendars().then(() => {
      // After fetching, check if there's a query parameter and select the appropriate calendar
      const itemId = this.$route.query.item;
      if (itemId) {
        const calendar = this.calendarList.find(c => c._id === itemId);
        if (calendar) {
          this.selectCalendar(calendar);
        }
      }
    });
  }
};
</script>

<style scoped>
/* Calendar specific styles */
.calendar-system {
  max-width: 100%;
}

.calendar-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  cursor: pointer;
}

.calendar-item .icon {
  margin-right: 1em;
}

.calendar-details {
  display: flex;
  flex-direction: column;
}

.calendar-title {
  font-size: 1rem;
  color: #3498db; /* Blue text color for title */
}

.calendar-description,
.calendar-created {
  font-size: 0.875rem; /* Smaller font for description and created date */
  color: #555; /* Gray text color for description and created date */
}

.calendar-created {
  margin-top: 0.25rem;
  color: #999; /* Light gray for created date */
}

time.icon {
  font-size: 1em; /* Keep existing size */
  display: block;
  position: relative;
  width: 7em;
  height: 7.5em;
  background-color: #fff;
  margin-right: 1em;
  border-radius: 0.6em;
  box-shadow: 0 1px 0 #bdbdbd, 0 2px 0 #fff, 0 3px 0 #bdbdbd, 0 4px 0 #fff, 0 5px 0 #bdbdbd, 0 0 0 1px #bdbdbd;
  overflow: hidden;
  -webkit-backface-visibility: hidden;
  -webkit-transform: rotate(0deg) skewY(0deg);
  -webkit-transform-origin: 50% 10%;
  transform-origin: 50% 10%;
}

time.icon * {
  display: block;
  width: 100%;
  font-size: 1em;
  font-weight: bold;
  font-style: normal;
  text-align: center;
}

time.icon strong {
  position: absolute;
  top: 0;
  padding: 0.4em 0;
  color: #fff;
  background-color: #fd9f1b; /* Orange header */
  border-bottom: 1px dashed #9f9f9f;
  box-shadow: 0 2px 0 #cbcbcb;
}

time.icon span {
  width: 100%;
  font-size: 2.8em;
  letter-spacing: -0.05em;
  padding-top: 0.8em;
  color: #2f2f2f;
}

time.icon em {
  position: absolute;
  bottom: 0.3em;
  color: #fd9f1b; /* Orange footer */
  font-weight: normal;
}

/* Note.vue inspired styles */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* Smooth transitions */
.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

.transition-transform {
  transition: transform 0.3s ease-in-out;
}

/* Focus states */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Sidebar styles */
.sidebar-menu-item {
  position: relative;
  overflow: hidden;
}

.sidebar-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: transparent;
  transition: background-color 0.2s ease-in-out;
}

.sidebar-menu-item.active::before {
  background: #3b82f6;
}

/* Mobile sidebar animation */
.mobile-sidebar-enter {
  transform: translateX(-100%);
}

.mobile-sidebar-enter-active {
  transition: transform 0.3s ease-out;
}

.mobile-sidebar-enter-to {
  transform: translateX(0);
}

.mobile-sidebar-leave {
  transform: translateX(0);
}

.mobile-sidebar-leave-active {
  transition: transform 0.3s ease-in;
}

.mobile-sidebar-leave-to {
  transform: translateX(-100%);
}

/* Stats cards hover effect */
.stats-card {
  transition: all 0.2s ease-in-out;
}

.stats-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Button hover effects */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Calendar card animations */
.calendar-item {
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
}

.calendar-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease-in-out;
}

.calendar-item:hover::before {
  left: 100%;
}

.calendar-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

/* Status badges */
.status-badge {
  position: relative;
  overflow: hidden;
}

.status-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.3s ease-in-out;
}

.status-badge:hover::before {
  left: 100%;
}

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

/* Loading states */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Pulse animation for new items */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.pulse {
  animation: pulse 2s infinite;
}

/* Mobile responsive adjustments */
@media (max-width: 1024px) {
  .sidebar-desktop {
    display: none;
  }
}

@media (max-width: 768px) {
  .gap-3 {
    gap: 0.5rem;
  }
  
  .p-4 {
    padding: 0.75rem;
  }
  
  .text-sm {
    font-size: 0.8rem;
  }
}

/* Dark mode support (if needed) */
@media (prefers-color-scheme: dark) {
  .dark-mode {
    background-color: #1f2937;
    color: #f9fafb;
  }
  
  .dark-mode .bg-white {
    background-color: #374151;
  }
  
  .dark-mode .border-gray-200 {
    border-color: #4b5563;
  }
  
  .dark-mode .text-gray-900 {
    color: #f9fafb;
  }
  
  .dark-mode .text-gray-700 {
    color: #d1d5db;
  }
  
  .dark-mode .text-gray-600 {
    color: #9ca3af;
  }
}

/* Print styles */
@media print {
  .sidebar,
  .mobile-sidebar,
  .modal-overlay,
  button {
    display: none !important;
  }
  
  .main-content {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
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

/* Focus visible for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #3b82f6;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
</style>
