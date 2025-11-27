<template>
    <div class="year-calendar">
      <div class="grid grid-cols-2">
        <div>
          <h2 class="text-2xl font-bold mb-4">ปฏิทินการฝึกอบรมประจำปี {{ getThaiYear(currentYear) }}</h2>
        </div>
        <div>
          <div class="calendar-nav text-right">
            <button @click="changeYear(-1)" class="mr-2">&#8249;</button>
            <select v-model="currentYear" @change="generateCalendar" class="mr-2">
              <option v-for="year in yearOptions" :value="year" :key="year">{{ getThaiYear(year) }}</option>
            </select>
            <button @click="changeYear(1)" class="ml-2">&#8250;</button>
            <button @click="resetToCurrentYear" class="ml-2">ปีปัจจุบัน</button>
          </div>
        </div>
      </div>
      <div class="month-list">
        <ul>
          <li v-for="filteredMonth in filteredMonths" :key="filteredMonth.name" class="mb-8">
            <h3
              class="text-xl font-bold pl-3 pt-2 pb-2 text-white"
              :class="{'bg-blue-600': !isPastMonth(filteredMonth.name), 'bg-blue-300': isPastMonth(filteredMonth.name)}"
            >
              {{ filteredMonth.name }} {{ getThaiYear(currentYear) }}
            </h3>

            <table class="task-table w-full mt-4">
              <thead>
                <tr>
                  <th>วันที่อบรม</th>
                  <th style="width: 50%;">ชื่อหลักสูตร</th>
                  <th>รูปแบบการอบรม</th>
                  <th>หลักสูตรนี้เหมาะกับ</th>
                  <th>วันที่เปิดรับสมัคร</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="task in filteredMonth.tasks" :key="task.id">
                  <tr :style="{ opacity: isDateInPast(task.startRegistDate) ? '1' : '1' }">
                    <td>{{ formatDateRange(task.startRegistDate, task.endRegistDate) }}</td>
                    <td>
                      <router-link 
                      :to="'/lesson/detail/' + task._id"
                      class="text-gray-600 hover:text-blue-900"
                      >
                      {{ task.name }}
                      </router-link>
                      
                    </td>
                    <td>{{ task.type }}</td>
                    <td>
                        <template v-for="target in task.target" :key="target._id">
                        {{ target.name }}
                        <br v-if="!$last">
                        </template>
                    </td>
                    <td>{{ formatDate(task.startRegistDate) }}</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import debug from '@/plugins/Logger.js';
  export default {
    data() {
      return {
        configs: storageManager.get('configs'),
        months: [],
        currentYear: new Date().getFullYear(),
      };
    },
    computed: {
      yearOptions() {
        const currentYear = new Date().getFullYear();
        const years = [];
  
        for (let i = currentYear - 2; i <= currentYear + 2; i++) {
          years.push(i);
        }
  
        return years;
      },
      filteredMonths() {
        return this.months.filter(month => month.tasks.length > 0);
      },
    },
    created() {
      this.generateCalendar();
    },
    methods: {
      isPastMonth(monthName) {
        const currentMonth = new Date().getMonth();
        const monthNames = [
          "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
          "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
        ];
        const index = monthNames.indexOf(monthName);
        
        return index < currentMonth;
      },
      formatDateRange(startDate, endDate) {
        const start = new Date(startDate).getDate();
        const end = new Date(endDate).getDate();
        return `${start}-${end}`;
      },
      formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
      },
      isDateInPast(dateString) {
        const currentDate = new Date();
        const eventDate = new Date(dateString);
        return eventDate < currentDate;
      },
      async getData() {
        try {
          this.activeBlock = true;
          //debug.log("Loader Start");
  
          let andConditions = [
            { type: "onsite" },
            { unit: this.configs.siteID, status: true },
          ];
  
          const query = { $and: andConditions };
  
          // Modify the API URL and payload as per your requirements
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/course/query", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              method: 'find',
              args: [query],
              paging: { page: this.currentPage, limit: 200 },
            }),
          });
  
          const RestReturn = await resAPI.json();
  
          if (resAPI.status === 200) {

            this.currentPage = RestReturn.paging.page;
            this.totalPages = RestReturn.paging.totalPages;
            this.totalItems = RestReturn.total;
            this.months = this.getMonthsData(RestReturn.data);
  
            //debug.log("Loader Finish");
          }
        } catch (error) {
          debug.log(error);
        } finally {
          this.activeBlock = false;
        }
      },
      getMonthsData(tasksData) {
        const currentMonth = new Date().getMonth(); // Get the current month (0-11)
        
        // Create an array of month names starting from the current month
        const monthNames = [];
        for (let i = 0; i < 12; i++) {
          const monthIndex = (currentMonth + i) % 12;
          monthNames.push(monthIndex);
        }

        const months = monthNames.map((monthIndex) => {
          const monthName = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
          ][monthIndex];

          const tasks = tasksData.filter((task) => {
            const startDate = new Date(task.startRegistDate);
            return startDate.getFullYear() === this.currentYear && startDate.getMonth() === monthIndex;
          });

          return {
            name: monthName,
            tasks: tasks,
          };
        });

        return months;
      },
      async generateCalendar() {
        this.months = []; // Clear the tasks for each month
  
        await this.getData(this.currentYear);
      },
      changeYear(yearOffset) {
        this.currentYear += yearOffset;
        this.generateCalendar();
      },
      resetToCurrentYear() {
        this.currentYear = new Date().getFullYear();
        this.generateCalendar();
      },
      getThaiYear(year) {
        const thaiYear = year + 543;
        return `ปี ${thaiYear}`;
      },
    },
  };
  </script>
  
  <style scoped>
  .year-calendar {
    /* Add your custom styles for the year calendar component */
  }
  
  .calendar-nav {
    /* Add your custom styles for the year navigation section */
  }
  
  .month-list {
    /* Add your custom styles for the month list */
  }
  
  .task-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  
  .task-table th,
  .task-table td {
    padding: 0.5rem;
    border: 1px solid #ddd;
  }
  
  .task-table thead th {
    background-color: #f7fafc;
  }
  
  .task-table tbody tr:nth-child(even) {
    background-color: #f7fafc;
  }
  </style>
  