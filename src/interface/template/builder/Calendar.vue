<template>
    <div class="calendar bg-white p-4">
      <div class="header flex items-center justify-between mb-4">
        <button @click.prevent="previousMonth" class="text-sm border border-gray-300 text-white rounded px-1 py-2 text-gray-500 hover:text-gray-700 focus:outline-none">
          <font-awesome-icon :icon="['fas','chevron-left']" class="text-black text-[12px] ml-1 mr-1"/>
        </button>
        <div class="month-year-select flex items-center">
          <select v-model="selectedMonth" @change="changeMonth" class="mr-2 w-full border border-gray-300 rounded px-2 py-1">
            <option v-for="(month, index) in months" :value="index" :key="index">{{ month }}</option>
          </select>
          <select v-model="selectedYear" @change="changeYear" class="w-full border border-gray-300 rounded px-2 py-1">
            <option v-for="year in years" :value="year" :key="year">{{ year }}</option>
          </select>
          <button class="today-button ml-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2" @click.prevent="goToToday">Today</button>
        </div>
        <button @click.prevent="nextMonth" class="text-sm border border-gray-300 text-white rounded px-1 py-2 text-gray-500 hover:text-gray-700 focus:outline-none">
          <font-awesome-icon :icon="['fas','chevron-right']" class="text-black text-[12px] ml-1 mr-1"/>
        </button>
      </div>

      <div class="month-year-select flex items-center">
        <span class="current-month">{{ months[selectedMonth] }}</span>
        <span class="current-year">{{ selectedYear }}</span>
      </div>

      <table class="calendar-table w-full border-collapse">
        <thead>
          <tr>
            <th v-for="day in daysOfWeek" :key="day" class="calendar-head p-2 text-center text-gray-500">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, index) in weeksInMonth" :key="index">
            <td v-for="day in week" :key="day" :class="{ 'today bg-blue-200 text-white': isToday(day) }" class="p-2 pt-8 text-left relative">
                <div class="absolute top-0 right-0 w-6 h-6 bg-white text-md text-gray-800">{{ day }}</div>
                <div class="grid gap-2">
                    <template v-if="getTasksInRange(day).length <= 2">
                      <div
                        v-for="task in getTasksInRange(day)"
                        :key="task.title"
                        :class="['border-l-8', 'cursor-pointer', 'text-left', 'border-' + task.color]"
                        :style="{ opacity: isPastTask(task) ? '0.8' : '1' }"
                        @click="showTaskDetails(task)"
                      >
                        <div class="w-full bg-white p-2 border-t border-b border-r border-gray-200">
                          <div class="text-xs text-gray-900">{{ task.title }}</div>
                          <div class="text-xs text-gray-600">{{ getTaskStatus(task) }}</div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <div class="grid grid-cols-2 gap-1">
                        <div 
                          v-for="(task) in getTasksInRange(day)" 
                          :key="task.title" 
                          :class="['border-l-8','cursor-pointer', 'text-left', 'border-' + task.color]"
                          :style="{ opacity: isPastTask(task) ? '0.8' : '1' }"
                          @click="showTaskDetails(task)"
                        >
                          <div class="w-full bg-white p-2 border-t border-b border-r border-gray-200">
                            <div class="text-xs">{{ task.title }}</div>
                            <!-- <div class="text-sm">{{ getTaskStatus(task) }}</div> -->
                          </div>
                        </div>
                      </div>
                    </template>
                </div>
              </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="task-table bg-white p-4">
      
      <div class="task-counts grid grid-cols-4 gap-4">
        <div class="task-count p-5 border border-gray-200">
          <span class="task-count-label">Total Tasks:</span>
          <span class="task-count-value">{{ tasks.length }}</span>
        </div>
        <div class="task-count p-5 border border-gray-200">
          <span class="task-count-label">In Progress:</span>
          <span class="task-count-value">{{ getTaskCountByStatus('In Progress') }}</span>
        </div>
        <div class="task-count p-5 border border-gray-200">
          <span class="task-count-label">Overdue:</span>
          <span class="task-count-value">{{ getTaskCountByStatus('Overdue') }}</span>
        </div>
        <div class="task-count p-5 border border-gray-200">
          <span class="task-count-label">Upcoming:</span>
          <span class="task-count-value">{{ getTaskCountByStatus('Upcoming') }}</span>
        </div>
      </div>

      <div class="task-state-chart mb-4">
        <div class="bar" :style="{ width: getTaskStatePercentage('In Progress') + '%' }">
          <span class="bar-text">{{ getTaskStatePercentage('In Progress') }}%</span>
        </div>
        <div class="bar" :style="{ width: getTaskStatePercentage('Overdue') + '%' }">
          <span class="bar-text">{{ getTaskStatePercentage('Overdue') }}%</span>
        </div>
        <div class="bar" :style="{ width: getTaskStatePercentage('Upcoming') + '%' }">
          <span class="bar-text">{{ getTaskStatePercentage('Upcoming') }}%</span>
        </div>
      </div>
    
      <table class="w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th class="py-2 px-4 bg-gray-100">Title</th>
            <th class="py-2 px-4 bg-gray-100">Start Date</th>
            <th class="py-2 px-4 bg-gray-100">Due Date</th>
            <th class="py-2 px-4 bg-gray-100">Description</th>
            <th class="py-2 px-4 bg-gray-100">Assigned To</th>
            <th class="py-2 px-4 bg-gray-100">Priority</th>
            <th class="py-2 px-4 bg-gray-100">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in getCurrentMonthTasks" :key="task.title" class="border-b border-gray-200">
            <td class="py-2 px-4">{{ task.title }}</td>
            <td class="py-2 px-4">{{ formatTaskDate(new Date(task.startDate)) }}</td>
            <td class="py-2 px-4">{{ formatTaskDate(new Date(task.dueDate)) }}</td>
            <td class="py-2 px-4">{{ task.description }}</td>
            <td class="py-2 px-4">{{ task.assignedTo }}</td>
            <td class="py-2 px-4">{{ task.priority }}</td>
            <td class="py-2 px-4">
              <span :class="{
                'text-green-500': getTaskStatus(task) === 'In Progress',
                'text-red-500': getTaskStatus(task) === 'Overdue',
                'text-blue-500': getTaskStatus(task) === 'Upcoming'
              }">{{ getTaskStatus(task) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="kanban-board">
      <div class="kanban-column">
        <h2 class="kanban-column-title">In Progress</h2>
        <div class="kanban-column-content">
          <div v-for="task in getAllTasks['In Progress']" :key="task.title" class="kanban-card priority-high">
            <div class="kanban-card-header">{{ task.title }}</div>
            <div class="kanban-card-body">{{ task.description }}</div>
          </div>
        </div>
      </div>
    
      <div class="kanban-column">
        <h2 class="kanban-column-title">Overdue</h2>
        <div class="kanban-column-content">
          <div v-for="task in getAllTasks['Overdue']" :key="task.title" class="kanban-card priority-medium">
            <div class="kanban-card-header">{{ task.title }}</div>
            <div class="kanban-card-body">{{ task.description }}</div>
          </div>
        </div>
      </div>
    
      <div class="kanban-column">
        <h2 class="kanban-column-title">Upcoming</h2>
        <div class="kanban-column-content">
          <div v-for="task in getAllTasks['Upcoming']" :key="task.title" class="kanban-card priority-low">
            <div class="kanban-card-header">{{ task.title }}</div>
            <div class="kanban-card-body">{{ task.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isPopupOpen" class="fixed inset-0 flex items-center justify-center z-10">
      <div class="fixed inset-0 bg-black opacity-50" @click="closePopup"></div>
      <div class="bg-white rounded-sm p-4 shadow-sm max-w-md relative">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold mb-4 flex items-center">
            <span :class="['w-3', 'h-3', 'rounded-full', 'mr-2', 'bg-' + selectedTask.color]"></span>
            {{ selectedTask.title }}
          </h2>
          <h2 class="text-sm font-normal mb-4 flex items-center">
            <span :class="{
              'text-green-500': getTaskStatus(selectedTask) === 'In Progress',
              'text-red-500': getTaskStatus(selectedTask) === 'Overdue',
              'text-blue-500': getTaskStatus(selectedTask) === 'Upcoming'
            }">{{ getTaskStatus(selectedTask) }}</span>
          </h2>
          
        </div>
        <div class="border-b border-gray-200 mb-4"></div>
        <div class="grid grid-cols-2 gap-2">
          <div class="text-sm">
            <p class="font-bold">Start Date:</p>
            <p>{{ formatThaidate(selectedTask.startDate) }}</p>
          </div>
          <div class="text-sm">
            <p class="font-bold">Due Date:</p>
            <p>{{ formatThaidate(selectedTask.dueDate) }}</p>
          </div>
          <div class="text-sm">
            <p class="font-bold">Description:</p>
            <p>{{ selectedTask.description }}</p>
          </div>
          <div class="text-sm">
            <p class="font-bold">Assigned To:</p>
            <p>{{ selectedTask.assignedTo }}</p>
          </div>
          <div class="text-sm">
            <p class="font-bold">Priority:</p>
            <p>{{ selectedTask.priority }}</p>
          </div>
        </div>
        <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded absolute bottom-4 right-4 text-md" @click="closePopup">Close</button>
      </div>
    </div>

  </template>
  
  <script>
  import convertUtils from "@/plugins/convertUtils";
  export default {
    data() {
        return {
            currentDate: new Date(),
            selectedMonth: null,
            selectedYear: null,
            selectedTask: null,
            isPopupOpen: false,
            tasks: [
            {
              title: 'Task 1',
              startDate: '2023-06-01T00:00:00.000Z',
              dueDate: '2023-06-05T00:00:00.000Z',
              color: 'red-500',
              description: 'This is the first task.',
              assignedTo: 'John Doe',
              priority: 'High',
            },
            {
              title: 'Task 2',
              startDate: '2023-06-16T00:00:00.000Z',
              dueDate: '2023-06-16T00:00:00.000Z',
              color: 'blue-500',
              description: 'This is the second task.',
              assignedTo: 'Jane Smith',
              priority: 'Medium',
            },
            {
              title: 'Task 3',
              startDate: '2023-06-03T00:00:00.000Z',
              dueDate: '2023-06-07T00:00:00.000Z',
              color: 'green-600',
              description: 'This is the third task.',
              assignedTo: 'Alex Johnson',
              priority: 'Low',
            },
            {
              title: 'Task 4',
              startDate: '2023-06-03T00:00:00.000Z',
              dueDate: '2023-06-07T00:00:00.000Z',
              color: 'gray-500',
              description: 'This is the fourth task.',
              assignedTo: 'Emily Brown',
              priority: 'High',
            },
            {
              title: 'Task 5',
              startDate: '2023-06-02T00:00:00.000Z',
              dueDate: '2023-06-04T00:00:00.000Z',
              color: 'black',
              description: 'This is the fifth task.',
              assignedTo: 'John Doe',
              priority: 'Medium',
            },
            {
              title: 'Task 6',
              startDate: '2023-06-04T00:00:00.000Z',
              dueDate: '2023-06-10T00:00:00.000Z',
              color: 'orange-500',
              description: 'This is the sixth task.',
              assignedTo: 'Jane Smith',
              priority: 'Low',
            },
            {
              title: 'Task 7',
              startDate: '2023-10-12T00:00:00.000Z',
              dueDate: '2023-10-15T00:00:00.000Z',
              color: 'yellow-500',
              description: 'This is the seventh task.',
              assignedTo: 'Alex Johnson',
              priority: 'High',
            },
            {
              title: 'Task 8',
              startDate: '2023-11-18T00:00:00.000Z',
              dueDate: '2023-11-22T00:00:00.000Z',
              color: 'pink-500',
              description: 'This is the eighth task.',
              assignedTo: 'Emily Brown',
              priority: 'Medium',
            },
            {
              title: 'Task 9',
              startDate: '2023-12-05T00:00:00.000Z',
              dueDate: '2023-12-09T00:00:00.000Z',
              color: 'indigo-500',
              description: 'This is the ninth task.',
              assignedTo: 'John Doe',
              priority: 'Low',
            },
            {
              title: 'Task 10',
              startDate: '2024-01-08T00:00:00.000Z',
              dueDate: '2024-01-12T00:00:00.000Z',
              color: 'teal-500',
              description: 'This is the tenth task.',
              assignedTo: 'Jane Smith',
              priority: 'High',
            },
            {
              title: 'Task 11',
              startDate: '2024-02-15T00:00:00.000Z',
              dueDate: '2024-02-18T00:00:00.000Z',
              color: 'purple-500',
              description: 'This is the eleventh task.',
              assignedTo: 'Alex Johnson',
              priority: 'Medium',
            },
            {
              title: 'Task 12',
              startDate: '2024-03-22T00:00:00.000Z',
              dueDate: '2024-03-26T00:00:00.000Z',
              color: 'yellow-800',
              description: 'This is the twelfth task.',
              assignedTo: 'Emily Brown',
              priority: 'Low',
            },
          ]

        };
    },
    computed: {
      getAllTasks() {
    const tasksByStatus = {
      'In Progress': [],
      'Overdue': [],
      'Upcoming': []
    };

    this.tasks.forEach(task => {
      const status = this.getTaskStatus(task);
      tasksByStatus[status].push(task);
    });

    return tasksByStatus;
  },
      tasksToDo() {
        if (this.getAllTasks) {
          return this.getAllTasks.filter(task => this.getTaskStatus(task) === 'To Do');
        }
        return [];
      },
      tasksInProgress() {
        if (this.getAllTasks) {
          return this.getAllTasks.filter(task => this.getTaskStatus(task) === 'In Progress');
        }
        return [];
      },
      tasksDone() {
        if (this.getAllTasks) {
          return this.getAllTasks.filter(task => this.getTaskStatus(task) === 'Done');
        }
        return [];
      },
      getCurrentMonthTasks() {
          const currentMonth = this.selectedMonth;
          const currentYear = this.selectedYear;
          
          return this.tasks.filter((task) => {
            const startDate = new Date(task.startDate);
            // const dueDate = new Date(task.dueDate);
            const taskMonth = startDate.getMonth();
            const taskYear = startDate.getFullYear();
            
            return taskMonth === currentMonth && taskYear === currentYear;
          });
        },
        formattedMonth() {
          return this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        },
        daysOfWeek() {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return days;
        },
      weeksInMonth() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const weeks = [[]];
        let currentWeek = weeks[0];
  
        for (let i = 0; i < firstDayOfMonth; i++) {
          currentWeek.push('');
        }
  
        for (let day = 1; day <= daysInMonth; day++) {
          if (currentWeek.length === 7) {
            currentWeek = [];
            weeks.push(currentWeek);
          }
          currentWeek.push(day);
        }
        if (currentWeek.length < 7) {
          const remainingDays = 7 - currentWeek.length;
          for (let i = 0; i < remainingDays; i++) {
            currentWeek.push('');
          }
        }
        return weeks;
      },
      months() {
        const months = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        return months;
      },
      years() {
        const currentYear = new Date().getFullYear();
        const pastYears = Array.from({ length: 5 }, (_, index) => currentYear - index - 1);
        const futureYears = Array.from({ length: 5 }, (_, index) => currentYear + index);
        const years = [...pastYears.reverse(), currentYear, ...futureYears];
        return years;
      }
    },
    mounted() {
      this.selectedMonth = this.currentDate.getMonth();
      this.selectedYear = this.currentDate.getFullYear();
    },
    methods: {
      formatThaidate(date) {
        return convertUtils.toThaiDatetime(date,"short");
      },
      getTaskCountByStatus(status) {
        return this.tasks.filter(task => this.getTaskStatus(task) === status).length;
      },
      getTaskStatePercentage(state) {
        const totalTasks = this.tasks.length;
        const tasksWithState = this.tasks.filter(task => this.getTaskStatus(task) === state);
        const tasksPercentage = (tasksWithState.length / totalTasks) * 100;
        return Math.round(tasksPercentage * 100) / 100; // Round to 2 decimal places
      },
      showTaskDetails(task) {
        this.selectedTask = task;
        this.isPopupOpen = true;
      },

      closePopup() {
        this.selectedTask = null;
        this.isPopupOpen = false;
      },
      isPastTask(task) {
        const currentDate = new Date();
        const dueDate = new Date(task.dueDate);
        return dueDate < currentDate;
        },
      goToToday() {
        this.currentDate = new Date();
        this.selectedMonth = this.currentDate.getMonth();
        this.selectedYear = this.currentDate.getFullYear();
      },
      previousMonth() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
        this.selectedMonth = this.currentDate.getMonth();
        this.selectedYear = this.currentDate.getFullYear();
        this.$nextTick(() => {
          this.changeMonth();
        });
      },
      nextMonth() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
        this.selectedMonth = this.currentDate.getMonth();
        this.selectedYear = this.currentDate.getFullYear();
        this.$nextTick(() => {
          this.changeMonth();
        });
      },
      changeMonth() {
        const year = this.currentDate.getFullYear();
        this.currentDate = new Date(year, this.selectedMonth);
      },
      changeYear() {
        const month = this.currentDate.getMonth();
        const day = this.currentDate.getDate();
        this.currentDate = new Date(this.selectedYear, month, day);
      },
      isToday(day) {
        const today = new Date();
        return (
          day === today.getDate() &&
          this.selectedMonth === today.getMonth() &&
          this.selectedYear === today.getFullYear()
        );
      },
      getTasksInRange(day) {
        const currentMonth = this.selectedMonth;
        const currentYear = this.selectedYear;

        const currentTasks = this.tasks.filter((task) => {
            const startDate = new Date(task.startDate);
            const dueDate = new Date(task.dueDate);

            const startDateYear = startDate.getFullYear();
            const startDateMonth = startDate.getMonth();
            const startDateDay = startDate.getDate();

            const dueDateYear = dueDate.getFullYear();
            const dueDateMonth = dueDate.getMonth();
            const dueDateDay = dueDate.getDate();

            return (
            (startDateYear < currentYear || (startDateYear === currentYear && startDateMonth <= currentMonth)) &&
            (dueDateYear > currentYear || (dueDateYear === currentYear && dueDateMonth >= currentMonth)) &&
            day >= startDateDay &&
            day <= dueDateDay
            );
        });

        return currentTasks;
        },
        getTaskDuration(task) {
            const startDate = new Date(task.startDate);
            const dueDate = new Date(task.dueDate);
            const durationInDays = Math.floor((dueDate - startDate) / (1000 * 60 * 60 * 24));
            return `${durationInDays} days`;
        },
        getTaskStatus(task) {
            const currentDate = new Date();
            const startDate = new Date(task.startDate);
            const dueDate = new Date(task.dueDate);
            if (currentDate < startDate) {
            return 'Upcoming';
            } else if (currentDate > dueDate) {
            return 'Overdue';
            } else {
            return 'In Progress';
            }
        },
      formatTaskDate(date) {
        return this.formatThaidate(date.toLocaleString('default', { month: 'short', day: 'numeric' }));
      },
    },
  };
  </script>
  
  <style scoped>
  .current-month {
    font-size: 2rem;
    font-weight: bold;
    margin-right: 0.5rem;
  }
  
  .current-year {
    font-size: 1.8rem;
    color: #888;
  }
.month-year-select {
  display: flex;
  align-items: center;
}

.month-year-select select {
  margin-right: 1rem;
}

.calendar-table {
  width: 100%;
  border-collapse: collapse;
}

.calendar-table th,
.calendar-table td {
  text-align: center;
  border: 1px solid #e2e8f0;
  height: 90px;
  width: 14.28%;
}

.calendar-table th.calendar-head{
  height: 45px;
}

.calendar-table th {
  background-color: #f0f0f0;
}
.today-button {
  transition: background-color 0.3s;
}

.today-button:hover {
  background-color: #2b6cb0;
}

.today-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px #2b6cb0;
}

.task-state-chart {
  display: flex;
  width: 100%;
  height: 20px;
  margin-top: 1rem;
}

.bar {
  height: 100%;
}

.bar:nth-child(1) {
  background-color: #38a169;
}

.bar:nth-child(2) {
  background-color: #e53e3e;
}

.bar:nth-child(3) {
  background-color: #4299e1;
}
.task-state-chart {
  display: flex;
  width: 100%;
  height: 20px;
  margin-top: 1rem;
}

.bar {
  height: 100%;
  position: relative;
}

.bar-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 0.75rem;
}

.task-counts {
  margin-top: 1rem;
}

.task-count {
  margin-bottom: 0.5rem;
}

.task-count-label {
  font-weight: bold;
  margin-right: 0.5rem;
}

.task-count-value {
  font-weight: normal;
}

.task-counts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.task-count {
  text-align: center;
}

.task-count-label {
  font-size: 0.8rem;
}

.task-count-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.kanban-board {
  display: flex;
  justify-content: space-between;
}

.kanban-column {
  flex: 1;
  margin: 0 1rem;
}

.kanban-column-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.kanban-column-content {
  background-color: #f8f8f8;
  padding: 1rem;
  border-radius: 4px;
}

.kanban-card {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

.kanban-card-header {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.kanban-card-body {
  font-size: 0.9rem;
}

/* Optional styling for card colors based on priority */
.kanban-card.priority-high {
  border-left: 4px solid red;
}

.kanban-card.priority-medium {
  border-left: 4px solid orange;
}

.kanban-card.priority-low {
  border-left: 4px solid green;
}

</style>
