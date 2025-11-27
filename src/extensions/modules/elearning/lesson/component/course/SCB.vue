<template>
    <div class="bg-white border-b border-gray-200">
        <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <div class="pt-3">
                <input type="file" @change="handleFileUpload">
                <br/>
                <button @click="callApiForAllItems" v-if="parsedData.length > 0">Call API for All Items</button>
                
                <!-- <button @click="getEnrollData">Get Enroll</button>https://espada-fashion.com/
                <button @click="deleteAllEnrollItems">Delete Enroll</button> -->

                <pre>{{enroll}}</pre>
                <br/>
                <div v-if="apiProgress > 0">
                  Progress: {{ apiProgress }}/ {{ parsedData.length }}
                </div>

                <table v-if="parsedData.length > 0" class="table mt-3">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Price</th>
                        <th>Ref1</th>
                        <th>Ref2</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(row, index) in parsedData" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ row.date }},{{ row.formattedTime }}</td>
                        <td>{{ row.price }}</td>
                        <td>{{ row.ref1 }}</td>
                        <td>{{ row.ref2 }}</td>
                    </tr>
                    </tbody>
                </table>
                <div v-else>
                    No data available. Please upload a file.
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
      parsedData: [],
      enroll: [],
      columnLabels: ['Ref1', 'Ref2', 'Price'],
      apiProgress: 0 // Track API call progress
    };
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.parseTextFile(file);
      }
    },
    parseTextFile(file) {
      const reader = new FileReader();
      reader.onload = () => {
        const textData = reader.result;
        const rows = textData.trim().split('\n');
        this.parsedData = rows.map(row => {
          // Check if the row contains the identifier "10397026"
          if (row.includes('10397030')) {
            // Split the row into two parts based on the identifier "10397026"
            const splitIndex = row.indexOf('10397030');
            const before = row.substring(0, splitIndex).trim();
            const firstPart = before.substring(0, 34).trim(); // First 31 characters
            const secondPart = before.substring(34).trim(); // Remaining characters
            const dateField = firstPart.substring(20, 28); // Extracting the date from the specific position in the row
            // Extracting the timeField from the specific position in the row and formatting as hh:mm:ss
            const timeField = firstPart.substring(28, 34); 
            const hours = timeField.substring(0, 2);
            const minutes = timeField.substring(2, 4);
            const seconds = timeField.substring(4, 6);
            const formattedTime = `${hours}:${minutes}:${seconds}`;
            const date = `${dateField.substring(0, 2)}/${dateField.substring(2, 4)}/${dateField.substring(4, 8)}`; // Formatting as dd/mm/yyyy
            const after = row.substring(splitIndex).trim();
            const columns = after.split(/\s+/); // Split the part after the identifier by one or more spaces or tabs
            const price = columns[2].substring(27, 30); // Extracting the price from the specific position in the row
            const ref1 = columns[0];
            const ref2 = columns[1];
            return {
              firstPart,
              date,
              formattedTime,
              secondPart,
              price,
              ref1,
              ref2,
              afterIdentifier: after,
              columns: columns
            };
          } else {
            // If the row does not contain the identifier, return null or an empty object to skip it
            return null;
          }
        }).filter(row => row !== null); // Filter out null values to remove skipped rows
      };
      reader.readAsText(file);
    },
    async callApiForAllItems() {
      // Iterate over parsedData and call API for each item
      this.apiProgress = 0;
      for (let index = 0; index < this.parsedData.length; index++) {
        const item = this.parsedData[index];
        try {
          // Call your API with ref1, ref2, date, formattedTime, and index+1
          const response = await this.callYourApiFunction(item.ref1, item.ref2, item.date, item.formattedTime, index + 1);
          console.log('API Response:', response);
          this.apiProgress++;
          // Handle the API response as needed
        } catch (error) {
          console.error('API Error:', error);
          // Handle errors if any
        }
      }
    },
    async getEnrollData() {
      try {
        const requestData2 = {
          method: 'find',
          args: [{ $and: [{ "courseID": '65d33ba369c3155dfd669617'}] }],
          paging: { page: 1, limit: 1000 },
        };
        // Assuming you have axios imported as 'axios' and 'Request' is defined
        const enroll = await Request.POST(`enroll/query`, requestData2, this.configs.key);

        this.enroll = enroll.data.data

      } catch (error) {
        throw new Error('Failed to fetch data from API');
      }
    },

    async deleteAllEnrollItems() {
      try {
        // Ensure there's an enroll array to work with
        if (!this.enroll || !Array.isArray(this.enroll)) {
          console.error('No enroll data available for deletion.');
          return;
        }

        // Loop through the enroll array
        for (const item of this.enroll) {
          const id = item._id; // Assuming each item has an _id field for its identifier

          // Perform the delete operation for each item
          const { status } = await Request.DELETE(`enroll/${id}`, null, this.configs.key);

          // Optional: Check the status to ensure the deletion was successful
          if (status !== 200) {
            console.error(`Failed to delete item with id ${id}. Status: ${status}`);
          } else {
            console.log(`Successfully deleted item with id ${id}`);
          }
        }

        // After the loop, you may want to clear the enroll array or perform additional actions
        console.log('Completed deletion of all enroll items');
        this.enroll = []; // Clearing the enroll array after deletion

      } catch (error) {
        console.error('Failed to delete enroll items:', error);
        throw new Error('Failed to delete enroll items');
      }
    },
    async callYourApiFunction(ref1, ref2, date, time, order) {
      try {
        const requestData = {
          method: 'find',
          args: [{ $and: [{ ref1: ref1,ref2: ref2, process:'pending'}] }],
        };
        
        // Assuming you have axios imported as 'axios' and 'Request' is defined
        const response = await Request.POST(`order/query`, requestData, this.configs.key);
        console.log("Order",response.data);

        console.log(date,time);
        if (response.status !== 200) {
          throw new Error('Failed to fetch data from API');
        }

        const requestData2 = {
          method: 'find',
          args: [{ $and: [{ "formData.input-13-6-6.value": ref2,"formData.hidden-15-6-6.value": ref1, process:'approve'}] }],
        };
        
        // Assuming you have axios imported as 'axios' and 'Request' is defined
        const response2 = await Request.POST(`form/query`, requestData2, this.configs.key);

        console.log("Form",response2.data);

        console.log(date,time);
        if (response2.status !== 200) {
          throw new Error('Failed to fetch data from API');
        }

        const requestBody = {
          data: {
            //process: 'pending',
            //pendingDate: date,
            //date: date,
            //time: time,
            order: order,
            //formID:response2.data[0]._id
          }
        };
        const { data, status } = await Request.PUT(`order/${response.data[0]._id}`, requestBody, this.configs.key);
        console.log(data,status);


        // Copy the existing formData into a new object
        let newFormData = { ...response2.data[0].formData };

        // Define the new field
        let newField = {
          name: "วันที่ชำระเงิน",
          value: date+" "+time, // You can set the initial value here or leave it empty
          type: "datetime",
          mode: "datetime"
        };

        // Add the new field to the new formData object
        newFormData["input-30-9-9"] = newField;

        const requestBody2 = {
          data: {
            //process: 'pending',
            //date: date,
            //time: time,
            //orderID:response.data[0]._id,
            //formData: newFormData,
            order: order,
          }
        };
        const { data2, status2 } = await Request.PUT(`form/${response2.data[0]._id}`, requestBody2, this.configs.key);
        console.log(data2,status2);

        //return response.data[0]; // Assuming your response contains the data you need
      } catch (error) {
        throw new Error('Failed to fetch data from API');
      }
    }

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
  </style>