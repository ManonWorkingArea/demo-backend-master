<template>
    <div class="kanban-board p-4 mt-4 bg-gray-100 rounded-lg shadow">
        <button @click="fetchCalendarEvents" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded mr-2">
        รีเฟรซ
        </button>
        <div class="kanban-column">
            <h3 class="column-title bg-red-500 text-white p-2 rounded mb-2">Overdue</h3>
            <ul>
                <li v-for="task in overdueTasks" :key="task._id" class="kanban-task bg-white p-3 mb-2 rounded shadow">
                    <h4 class="task-title font-bold">{{ task.title }}</h4>
                    <p class="text-sm text-gray-600">{{ formatDate(task.startDate) }} - {{ formatDate(task.endDate) }}</p>
                    <p class="text-sm text-red-500">({{ daysAgo(task.endDate) }} days ago)</p>
                    <p class="text-sm">{{ task.description }}</p>
                </li>
            </ul>
        </div>

        <div class="kanban-column">
            <h3 class="column-title bg-blue-500 text-white p-2 rounded mb-2">In Progress</h3>
            <ul>
                <li v-for="task in tasksInProgress" :key="task._id" class="kanban-task bg-white p-3 mb-2 rounded shadow">
                    <h4 class="task-title font-bold">{{ task.title }}</h4>
                    <p class="text-sm text-gray-600">{{ formatDate(task.startDate) }} - {{ formatDate(task.endDate) }}</p>
                    <p class="text-sm">{{ task.description }}</p>
                </li>
            </ul>
        </div>
  
        <div class="kanban-column">
            <h3 class="column-title bg-green-500 text-white p-2 rounded mb-2">Upcoming (Next 7 Days)</h3>
            <ul>
                <li v-for="task in upcomingTasks" :key="task._id" class="kanban-task bg-white p-3 mb-2 rounded shadow">
                    <h4 class="task-title font-bold">{{ task.title }}</h4>
                    <p class="text-sm text-gray-600">{{ formatDate(task.startDate) }} - {{ formatDate(task.endDate) }}</p>
                    <p class="text-sm text-green-500">(in {{ daysUntil(task.startDate) }} days)</p>
                    <p class="text-sm">{{ task.description }}</p>
                </li>
            </ul>
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
        }
    },
    mounted() {
      this.fetchCalendarEvents(); // Fetch events when the component is mounted
    }
  };
  </script>
  
  <style scoped>
  .kanban-board {
    display: flex;
    justify-content: space-between;
    gap: 20px;
  }
  
  .kanban-column {
    flex: 1;
    background-color: #f7fafc;
    padding: 10px;
    border-radius: 0.5rem;
  }
  
  .column-title {
    font-size: 1.25rem;
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .kanban-task {
    background-color: #ffffff;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .kanban-task .task-title {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .kanban-task p {
    margin: 0.25rem 0;
    font-size: 0.875rem;
  }
  </style>
  