<template>
    <div class="bg-white border-b border-gray-200">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div class="pt-3">
          <label for="pageInput">Page: </label>
          <input type="number" id="pageInput" v-model="currentPage" placeholder="Enter page number" min="1" @change="getEnrollments">
          <br />
          <label for="limitInput">Limit: </label>
          <input type="number" id="limitInput" v-model="limitItem" placeholder="Enter limit per page" min="1" @change="getEnrollments">
          <br />
          <button @click="getEnrollments">Get Enrollments</button>
          <button @click="deleteAllEnrollments" v-if="enrollments.length > 0">Delete All</button>
          
          <div>
            <p>Duplicate Items: {{ duplicateCount }}</p>
            <p>Unique Items: {{ uniqueCount }}</p>
          </div>
        
          
          <table v-if="enrollments.length > 0" class="table mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>User ID</th>
                <th>Course ID</th>
                <th>Form ID</th>
                <th>Unit</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(enrollment, index) in enrollments" :key="enrollment._id" :class="{'highlight': isDuplicate(enrollment.userID) && !isMaster(enrollment)}">
                <td>{{ (currentPage - 1) * limitItem + index + 1 }}</td>
                <td>{{ enrollment._id }}</td>
                <td>{{ enrollment.userID }}</td>
                <td>{{ enrollment.courseID }}</td>
                <td>{{ enrollment.formID }}</td>
                <td>{{ enrollment.unit }}</td>
                <td>{{ new Date(enrollment.createdAt).toLocaleString() }}</td>
                <td>
                  <button v-if="isDuplicate(enrollment.userID) && !isMaster(enrollment)" @click="deleteEnrollment(enrollment._id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else>
            No enrollments data available.
          </div>
  
          <div v-if="paging.totalPages > 1" class="pagination-controls">
            <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
            <span>Page {{ currentPage }} of {{ paging.totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === paging.totalPages">Next</button>
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
    data() {
      return {
        session: storageManager.get('session'),
        configs: storageManager.get('configs'),
        enrollments: [], // Store enrollments data
        currentPage: 1, // Current page for pagination
        limitItem: 10, // Limit items per page
        paging: {
          totalPages: 1,
          total: 0
        }, // Store pagination details
        duplicates: new Set(), // Store duplicate userIDs
        masters: {} // Store master of each duplicate group
      };
    },
    computed: {
      duplicateCount() {
        return this.enrollments.filter(enrollment => this.isDuplicate(enrollment.userID) && !this.isMaster(enrollment)).length;
      },
      uniqueCount() {
        return this.enrollments.length - this.duplicateCount;
      }
    },
    methods: {
      async getEnrollments() {
        try {
          const requestData = {
            method: 'find',
            args: [{ $and: [{ courseID: '668c94ea7fb1dd8057b5f360' }] }],
            paging: { page: this.currentPage, limit: this.limitItem },
          };
  
          const response = await Request.POST('enroll/query', requestData, this.configs.key);
          console.log('Enrollments', response.data.data);
          this.enrollments = response.data.data;
          this.paging = response.data.paging;
          this.findDuplicates(); // Call the method to find duplicates
  
        } catch (error) {
          console.error('Failed to fetch enrollments data:', error);
        }
      },
      findDuplicates() {
        const userIdCount = {};
        const masters = {};
  
        this.enrollments.forEach((enrollment) => {
          if (userIdCount[enrollment.userID]) {
            userIdCount[enrollment.userID]++;
            if (!masters[enrollment.userID]) {
              masters[enrollment.userID] = this.enrollments.findIndex(e => e.userID === enrollment.userID);
            }
          } else {
            userIdCount[enrollment.userID] = 1;
          }
        });
  
        this.duplicates = new Set(
          Object.keys(userIdCount).filter(userID => userIdCount[userID] > 1)
        );
  
        this.masters = masters;
      },
      isDuplicate(userID) {
        return this.duplicates.has(userID);
      },
      isMaster(enrollment) {
        return this.enrollments[this.masters[enrollment.userID]]._id === enrollment._id;
      },
      async deleteEnrollment(id) {
        try {
            console.log(id);
          await Request.DELETE(`enroll/${id}`, '', this.configs.key);
          //this.getEnrollments(); // Refresh the list after deletion
        } catch (error) {
          console.error('Failed to delete enrollment:', error);
        }
      },
      async deleteAllEnrollments() {
        const deletePromises = this.enrollments
          .filter(enrollment => this.isDuplicate(enrollment.userID) && !this.isMaster(enrollment))
          .map(enrollment => this.deleteEnrollment(enrollment._id));
        await Promise.all(deletePromises);
        this.getEnrollments(); // Refresh the list after deletion
      },
      prevPage() {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.getEnrollments();
        }
      },
      nextPage() {
        if (this.currentPage < this.paging.totalPages) {
          this.currentPage++;
          this.getEnrollments();
        }
      }
    },
    mounted() {
      this.getEnrollments(); // Load enrollments when the component is mounted
    }
  };
  </script>
  
  <style scoped>
  .table {
    border-collapse: collapse;
    width: 100%;
  }
  
  .table th, .table td {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
  }
  
  .table th {
    background-color: #f2f2f2;
  }
  
  .highlight {
    background-color: yellow;
  }
  
  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
  }
  
  .pagination-controls button {
    margin: 0 5px;
    padding: 5px 10px;
    cursor: pointer;
  }
  
  .pagination-controls button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  </style>
  