<template>
  <Framework :loader="loader" :navigation="navigationData" :title="title" @callFunction="prepareAddCalendar">

    <div class="event-view bg-white p-4 mt-4 rounded-lg shadow">

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
                  <strong>{{ parseDate(calendar.createdAt).month }}</strong>
                  <span>{{ parseDate(calendar.createdAt).date }}</span>
                  <span>{{ parseDate(calendar.createdAt).day }}</span>
                </time>
                <div class="calendar-details">
                  <div class="calendar-title text-lg font-semibold text-blue-600">{{ calendar.title }}</div>
                  <div class="calendar-description text-gray-600">{{ calendar.description }}</div>
                  <div class="calendar-created text-sm text-gray-400 mt-1">{{ calendar.createdAt }}</div>
                  <div class="calendar-events text-sm text-gray-400 mt-1">100 Events</div>
                  <div class="pt-2">
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
      </div>
    </div>
  </Framework>
</template>

<script>
import Framework from '@/utils/Framework/Body.vue';
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
import CalendarView from './Calendar/View.vue';
import CalendarConfig from './Calendar/Config.vue'; // Import the new CalendarConfig component

const Request = new requestClient(false);

export default {
  components: {
    CalendarView,
    Framework,
    CalendarConfig
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
      navigationData: [
        {
          name: 'เพิ่มปฏิทินใหม่',
          function: 'callFunction',
          style: 'plus',
          class: 'primary-btn',
          visible: true,
          type: 'call-function',
        },
      ]
    };
  },
  methods: {
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
    async saveCalendar() {
      if (this.calendarData._id) {
        await this.updateCalendar();
      } else {
        await this.addCalendar();
      }
    },
    async addCalendar() {
      try {
        const response = await Request.POST('calendar/', { data: { ...this.calendarData, unit: this.session.current._id || this.configs.siteID } }, this.configs.key);
        if (response.status === 200) {
          this.calendarList.push(response.data);
          this.selectCalendar(response.data); // Automatically select and display the new calendar
          this.showCalendarConfig = false;
        }
      } catch (error) {
        console.error('Error adding calendar:', error);
      }
    },
    async updateCalendar() {
      try {
        const response = await Request.PUT(
          `calendar/${this.calendarData._id}`, // Replace 'calendar_id' with the actual ID of the calendar
          { 
            data: { 
              ...this.calendarData, 
              _id: undefined, // Remove _id field
              unit: this.session.current._id || this.configs.siteID 
            } 
          },
          this.configs.key
        );

        if (response.status === 200) {
          // Find the index of the existing calendar in the list
          const index = this.calendarList.findIndex(calendar => calendar._id === this.calendarData._id);
          if (index !== -1) {
            // Update the calendar in the list with the new data
            this.$set(this.calendarList, index, response.data);
            this.selectCalendar(response.data); // Re-select the updated calendar
            this.showCalendarConfig = false;
          }
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
  border-bottom: 1px dashed #f37302;
  box-shadow: 0 2px 0 #fd9f1b;
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
}
</style>
