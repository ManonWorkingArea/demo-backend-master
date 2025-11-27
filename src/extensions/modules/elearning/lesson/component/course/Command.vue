<template>
  <div>

    <div>
      <div>
        <label for="start">Start Date:</label>
        <input type="datetime-local" id="start" v-model="start" />
      </div>
      <div>
        <label for="end">End Date:</label>
        <input type="datetime-local" id="end" v-model="end" />
      </div>
      
      <p>Status: {{ status.status }}</p>
      <p>Message: {{ status.message }}</p>
      <hr>
      <button @click="updateStatus">Calculate</button>
    </div>

    <!-- <button @click="batchChangeData">Change Data</button>
    <button @click="findDuplicates">Find Duplicates</button> -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>ID</th>
          <th>score</th>
          <th>User</th>
          <th>Course</th>
          <th>Date</th>
          <th>#</th>
          <!-- Add more table headers as needed -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="(formData, index) in duplicates" :key="index">
            <td>{{ index+1}}</td>
            <td>{{ formData._id }}</td>
            <td>{{ formData.score }}</td>
            <td>{{ formData.userID }}</td>
            <td>{{ formData.courseID }}</td>
            <td><pre>{{ formData.createdAt }}</pre></td>
            <td><button @click="fetchEnrollData(formData.userID,formData.score,formData._id)">Get</button></td>
          <!-- Render other data fields as needed -->
        </tr>
      </tbody>
    </table>
  </div>
</template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import requestClient from '@/plugins/requestClient';
  import { checkDateStatus } from '@/plugins/duedate.js';
  const Request = new requestClient(false);
  export default {
    data() {
      return {
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        message: 'Component with getForm function',
        loadStatus: false,
        form: [],
        userIDsMap:{},
        duplicates:[],
        start: "2024-06-20T02:00:00.000",
        end: "",
        status: { status: '', message: '' }
      };
    },
    methods: {
      updateStatus() {
        this.status = checkDateStatus(this.start, this.end);
      },
      async getForm() {
        try {
          const requestData = {
            method: 'find',
            args: [{ $and: [{courseID:'65d33ba369c3155dfd669617'}] }],
            paging: { page: 1, limit: 2000 }
          };
  
          const { data,status } = await Request.POST('form/query', requestData, this.configs.key);
  
          if (status !== 200) {
            throw new Error(`Failed to fetch player data from API`);
          }
          this.form = data.data;
          this.loadStatus = true
        } catch (error) {
          console.error('An error occurred while fetching player data:', error);
          throw error;
        }
      },
      async findDuplicates() {
        try {
          // Reset duplicates array before finding duplicates
          this.duplicates = [];

          // Iterate through the form data
          for (const formData of this.form) {
            const userID = formData.userID;

            if (!this.userIDsMap[userID]) {
              // Initialize an array for the userID if not already present in the map
              this.userIDsMap[userID] = [formData];
            } else {
              // If the userID already exists in the map, check if the document is a duplicate
              const existingDocs = this.userIDsMap[userID];
              const isDuplicate = existingDocs.some(doc => doc._id !== formData._id);

              if (isDuplicate) {
                // If the document is a duplicate, find its original document and push it first
                const originalDocIndex = existingDocs.findIndex(doc => doc._id === formData._id);
                if (originalDocIndex !== -1) {
                  this.duplicates.push(existingDocs[originalDocIndex]);
                }
                // Then push the duplicate document
                this.duplicates.push(formData);
              } else {
                // If it's not a duplicate, push the document to the array
                existingDocs.push(formData);
              }
            }
          }
        } catch (error) {
          console.error('An error occurred while finding duplicates:', error);
          throw error;
        }
      },

      async batchChangeData() {
        try {
          for (const formData of this.form) {
            const success = await this.changeData(formData._id);
            console.log("Form data updated successfully:", success);
          }
          this.getForm();
          console.log("Batch update completed.");
          // Optionally, perform any actions after the batch update is completed
        } catch (error) {
          console.error('An error occurred during batch update:', error);
          // Optionally, handle the error
        }
      },
      async changeData(id) {
        try {
          const requestBody = {
            data: {
              courseID: '65d33ba369c3155dfd669617'
            }
          };

          const { data, status } = await Request.PUT(`form/${id}`, requestBody, this.configs.key);
          console.log(status, data);
          
          // Optionally, handle the response if needed

          return true; // Return true upon successful update
        } catch (error) {
          console.error('An error occurred while changing data:', error);
          throw error;
        }
      },
      async deleteData(id) {
        try {
          const { data } = await Request.DELETE(`form/${id}`, null, this.configs.key);
          console.log(data);
          await this.getForm();
          this.findDuplicates();
        } catch (error) {
          console.log(error)
        }
      },
      async updateScore(sessionID ) {
        const requestBody = {
          data: {
            courseID: "662ed59188ed41e8351d2da4"
          }
        };

        try {
          const response = await this.$Request.PUT(`score/${sessionID}`, requestBody, this.configs.key);
          const { data, status } = response;

          if (status === 200) {
            console.log(`Successfully updated courseID for session ID: ${sessionID}`);
            console.log('Updated Data:', data);
          } else {
            console.error(`Failed to update courseID for session ID: ${sessionID}. Status: ${status}`);
          }
        } catch (error) {
          console.error(`Error updating courseID for session ID: ${sessionID}`, error);
        }
      },
      async fetchEnrollData(userID,score,scoreID) {
        const andConditions = [
          { userID: userID },
          { courseID: "662ed59188ed41e8351d2da4" }
        ];

        const pipeline = [
          { $match: { $and: andConditions } }
        ];

        try {
          const resAPI = await Request.POST('enroll/aggregate', { pipeline }, this.configs.key);
          const data = resAPI.data;

          const filteredData = data.map(item => {
            if (!item.analytics.post || item.analytics.post.score === null) {

              // call update
              this.updateAnalyticsPost(item._id ,item.analytics,score);
              this.updateScore(scoreID);
              return { ...item, status: "nodata" };
            } else {
              this.updateScore(scoreID);
              return { ...item, status: "hasdata" };
            }
          });
          console.log("Filtered Data:", filteredData);
        } catch (error) {
          console.error('Failed to fetch data:', error);
        }
      },
      async updateAnalyticsPost(itemID, analytics, score) {
        // Determine message and result based on the score
        const newPost = {
          has: true,
          measure: "33",
          message: score < 33 ? "ไม่ผ่านการรับรอง" : "ผ่านการรับรอง",
          req: true,
          result: score >= 33,
          score: score,
          verified: "xxx"
        };

        // Update the analytics.post field while preserving other analytics data
        const updatedAnalytics = {
          ...analytics,  // Spread the existing analytics data
          post: newPost  // Replace the post field with the newPost structure
        };

        try {

          console.log(updatedAnalytics); 
          
          // Send a PUT request to update the item
          await Request.PUT(`enroll/${itemID}`, {
            data: {
              analytics: updatedAnalytics
            }
          }, this.configs.key);

          console.log(`Updated item with ID: ${itemID}`);

          
        } catch (error) {
          console.error(`Failed to update item with ID: ${itemID}`, error);
        }
      },
      async fetchData() {
        const andConditions = [
          { examID: '65eb076bef03bebf9ead6f1c' },
          { courseID: '65d33ba369c3155dfd669617' }
        ];

        const pipeline = [
          { $match: { $and: andConditions } }
        ];

        try {
          const resAPI = await Request.POST('score/aggregate', { pipeline }, this.configs.key);
          const data = resAPI.data;

          // Filter the results by createdAt in JavaScript
          const filteredData = data.filter(item => {
            const createdAt = new Date(item.createdAt);
            return createdAt >= new Date("2024-06-21T00:00:00.000Z") && createdAt < new Date("2024-06-22T00:00:00.000Z");
          });

          this.duplicates = filteredData;
        } catch (error) {
          console.error('Failed to fetch data:', error);
        }
      }
    },
    mounted() {
      //this.getForm();
      this.updateStatus();
      this.fetchData();
    }
  };
  </script>
  
  <style>
  /* Your component's styles go here */
  </style>
  