<template>
  <div class="event-view bg-white p-4 mt-4 rounded-lg shadow">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-bold">Events</h2>
      <div>
        <button @click="fetchCalendarEvents" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2">
          รีเฟรซ
        </button>
        <select v-model="selectedYear" @change="updateYear" class="border rounded px-2 py-1">
          <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
    </div>

    <div v-if="filteredEventList.length === 0" class="text-gray-500">
      No events to display.
    </div>
    <div v-else>
      <!-- Task Summary Widget -->
      <div class="task-summary mt-6 grid grid-cols-4 gap-4 text-center">
        <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p>Total Tasks:</p>
          <strong class="text-xl">{{ totalTasks }}</strong>
        </div>
        <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p>In Progress:</p>
          <strong class="text-xl">{{ tasksInProgress }}</strong>
        </div>
        <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p>Overdue:</p>
          <strong class="text-xl">{{ overdueTasks }}</strong>
        </div>
        <div class="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p>Upcoming (Next 7 Days):</p>
          <strong class="text-xl">{{ upcomingTasks }}</strong>
        </div>
      </div>

      <div v-for="(events, monthYear) in groupedEvents" :key="monthYear" class="mb-6 mt-6">
        <h3 class="font-semibold text-lg text-blue-600">{{ formatMonthYear(monthYear) }}</h3>
        <ul class="mt-2">
          <li 
            v-for="event in events" 
            :key="event._id" 
            class="border-b p-2 grid grid-cols-3 gap-4 items-center"
            :class="{ 'bg-red-50': event.priority }"
          >
            <!-- Circle Color, Date, and Location on the left -->
            <div class="flex flex-col items-start text-sm text-gray-600">
              <div class="flex items-center">
                <span class="inline-block w-4 h-4 rounded-full mr-2" :style="{ backgroundColor: event.color }"></span>
                <span v-if="isSameDate(event.startDate, event.endDate)">
                  {{ formatDate(event.startDate) }}
                </span>
                <span v-else>
                  {{ formatDateRange(event.startDate, event.endDate) }}
                </span>
              </div>
              <div v-if="event.location" class="flex items-center mt-1">
                <font-awesome-icon :icon="['fas','map-marker-alt']" class="mr-1"/>
                <span class="text-gray-500">{{ event.location }}</span>
              </div>
            </div>
            <!-- Title and Description in the center -->
            <div class="flex flex-col">
              <span class="font-semibold">{{ event.title }}</span>
              <span class="text-gray-500 text-sm">{{ event.description }}</span>
            </div>
            <!-- Button on the right -->
            <div class="text-right">
              <button @click="editEvent(event)" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded">
                Edit Event
              </button>
            </div>
          </li>
        </ul>
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
    }
  },
  mounted() {
    this.fetchCalendarEvents(); // Fetch events when the component is mounted
  }
};
</script>
