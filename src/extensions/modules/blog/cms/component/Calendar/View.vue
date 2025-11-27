<template>
  <div class="calendar-view bg-white p-4">

    <!-- Calendar Header -->
    <div class="flex justify-between items-center mb-4">
      <!-- Left Column -->
      <div class="flex items-center">
        <button @click="goBackToList" class="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded">
          Back to List
        </button>
      </div>

      <!-- Center Column -->
      <div class="flex justify-center flex-grow">
        <h2 class="text-lg font-bold text-center">{{ currentMonthYear }}</h2>
      </div>

      <!-- Right Column -->
      <div class="flex items-center">
        <button @click="previousMonth" class="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded mr-2">
          &lt;
        </button>

        <button @click="goToToday" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2">
          วันนี้
        </button>

        <select v-model="selectedMonth" @change="fetchCalendarEvents" class="bg-white border-gray-300 text-gray-700 px-2 py-1 rounded mr-2">
          <option v-for="(month, index) in months" :key="index" :value="index">{{ month }}</option>
        </select>

        <select v-model="selectedYear" @change="fetchCalendarEvents" class="bg-white border-gray-300 text-gray-700 px-2 py-1 rounded">
          <option v-for="year in yearOptions" :key="year" :value="year">{{ year + 543 }}</option>
        </select>

        <button @click="nextMonth" class="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded ml-2">
          &gt;
        </button>
      </div>
    </div>

    <!-- Calendar view -->
    <div class="grid grid-cols-7 gap-1 text-center mb-2">
      <div v-for="day in daysOfWeek" :key="day" class="text-gray-500">{{ day }}</div>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="(day, index) in flattenedDays"
        :key="index"
        class="relative flex flex-col p-2 border cursor-pointer day-block"
        :class="{
          'bg-blue-200 text-white': isToday(day),
          'opacity-50 cursor-not-allowed': !day,
          'bg-gray-200': isWeekend(index) && day
        }"
        @dragover.prevent
        @dragenter.prevent
        @drop="onDrop(day)"
        @dblclick="createNewEvent(day)"
      >
        <div v-if="day" class="absolute top-0 right-0 p-1 text-sm font-bold">
          <span :class="{ 'red-circle': isToday(day) }">{{ day }}</span>
        </div>
        <div v-if="day" class="flex-1 flex flex-col items-start justify-start">
          <template v-for="event in getEventsForDate(day)" :key="event?._id">
            <div
              v-if="event"
              :style="{ backgroundColor: event.color }"
              class="text-white text-xs rounded mt-1 px-1 py-0.5 cursor-pointer event-item"
              @dragstart="onDragStart($event, event)"
              draggable="true"
              @click.stop="editTask(event)"
            >
              {{ event?.title || 'ไม่มีชื่อ' }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Display free day counts below the calendar -->
    <div class="mt-4 p-4 border-t">
      <p class="text-gray-700">
        <font-awesome-icon :icon="['fas','calendar']" class="text-gray-500"/> Free days including weekends: <strong>{{ freeDays.freeDaysIncludingWeekends }}</strong>
      </p>
      <p class="text-gray-700">
        <font-awesome-icon :icon="['fas','calendar']" class="text-gray-500"/> Free days only on weekdays: <strong>{{ freeDays.freeDaysOnlyWeekdays }}</strong>
      </p>
      <p class="text-gray-700">
        <font-awesome-icon :icon="['fas','calendar']" class="text-gray-500"/> Free weekend days: <strong>{{ freeDays.freeWeekendDays }}</strong>
      </p>
    </div>

    <!-- Event configuration modal -->
    <div v-if="showEventConfig" class="fixed inset-0 flex items-center justify-center z-10">
      <div class="fixed inset-0 bg-black opacity-50" @click="closeEventConfig"></div>
      <div class="bg-white rounded-sm p-4 shadow-sm max-w-md relative">
        <h2 class="text-lg font-bold mb-4">{{ isEditingEvent ? 'Edit Event' : 'Add Event' }}</h2>
        <form @submit.prevent="saveEvent">
          <!-- Form fields to edit event data -->
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Title</label>
            <input
              v-model="eventData.title"
              class="border rounded w-full py-2 px-3 text-gray-700"
              type="text"
            />
          </div>
    
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              v-model="eventData.description"
              class="border rounded w-full py-2 px-3 text-gray-700"
              rows="3"
            ></textarea>
          </div>
    
          <!-- Start Date and End Date in a 2-column grid -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
              <input
                v-model="eventData.startDate"
                class="border rounded w-full py-2 px-3 text-gray-700"
                type="date"
              />
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">End Date</label>
              <input
                v-model="eventData.endDate"
                class="border rounded w-full py-2 px-3 text-gray-700"
                type="date"
              />
            </div>
          </div>
    
          <!-- Event Type and Priority in a 2-column grid -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Event Type</label>
              <select v-model="eventData.type" class="border rounded w-full py-2 px-3 text-gray-700">
                <option v-for="type in types" :key="type.value" :value="type.value">{{ type.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Priority</label>
              <div class="pt-2">
              <input
                type="checkbox"
                v-model="eventData.priority"
                class="border rounded text-gray-700"
              /> Higth Priority</div>
            </div>
          </div>
    
          <!-- Additional event data fields -->
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Location</label>
            <input
              v-model="eventData.location"
              class="border rounded w-full py-2 px-3 text-gray-700"
              type="text"
            />
          </div>
  
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Event Color</label>
            <div class="color-picker">
              <label
                v-for="color in colors"
                :key="color.value"
                :style="{ backgroundColor: color.colorCode }"
                class="color-circle"
              >
                <input type="radio" v-model="eventData.color" :value="color.value" class="hidden" />
                <span v-if="eventData.color === color.value" class="color-check">&#10003;</span>
              </label>
            </div>
          </div>
          
          <div class="flex justify-between items-center">
            <!-- Save and Cancel buttons -->
            <div>
              <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Save
              </button>
              <button
                @click="closeEventConfig"
                class="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
            <!-- Delete button, shown only when editing an event -->
            <button
              v-if="isEditingEvent"
              @click.prevent="deleteEvent"
              class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
    
      <!-- Label and Copy Button Inside Input -->
      <div class="mt-2 p-4 bg-gray-50 text-sm">
        <label class="text-gray-700 mb-1 block">Public Calendar Share</label>
        <div class="relative">
          <input
            type="text"
            v-model="apiUrl"
            readonly
            class="border border-gray-200 rounded-sm w-full py-2 px-3 pr-16 text-gray-500 bg-gray-100 text-sm"
          />
          <button
            @click="copyToClipboard"
            class="absolute inset-y-0 right-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg"
          >
            Copy URL
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
/* Basic Layout */
.calendar-view {
  max-width: 100%;
}
.grid-cols-7 {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
.day-block {
  height: 0;
  padding-bottom: 50%; /* Creates a height that is 50% of the width */
  position: relative;
  padding-top: 40px; /* Add padding at the top to prevent overlap */
}

.day-block > .absolute {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.red-circle {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: 50%;
  background-color: red;
  color: white;
  text-align: center;
  font-weight: bold;
}

/* Ensure event items are displayed properly */
.event-item {
  width: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  margin-top: 2px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer; /* Ensure cursor changes to pointer */
  position: relative; /* Ensure it is positioned correctly */
}

/* Adjust the day number positioning */
.day-block .text-sm {
  position: absolute;
  top: 4px;
  right: 4px;
}

/* Color picker circles */
.color-picker {
  display: flex;
  flex-wrap: wrap;
}
.color-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 4px;
  margin-bottom: 4px;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.color-check {
  color: white;
  font-weight: bold;
}

/* Stacking event items vertically on small screens */
@media (max-width: 640px) {
  .calendar-view {
    padding: 2px;
  }
  .grid-cols-7 {
    grid-template-columns: repeat(7, 1fr);
  }
  .p-4 {
    padding: 1rem;
  }
  
  /* Stack circles for event items */
  .event-item {
    width: 100%;
    height: auto;
    background-color: #4CAF50;
    margin-top: 2px;
    padding: 2px;
    font-size: 0.75rem;
  }
  
  /* Flexbox column to stack items */
  .flex-1 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}

</style>
