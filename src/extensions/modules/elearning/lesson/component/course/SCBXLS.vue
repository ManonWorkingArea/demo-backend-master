<template>
    <div class="bg-white border-b border-gray-200">
        <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <div class="pt-3">
                <input type="file" @change="handleFileUpload">
                <br/>
                <button @click="callApiForAllItems" v-if="parsedData.length > 0">Call API for All Items</button>
                <br/>
                <div v-if="apiProgress > 0">
                  Progress: {{ apiProgress }}/ {{ parsedData.length }}
                </div>

                <table v-if="parsedData.length > 0" class="table mt-3">
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>amount</th>
                        <th>Ref1</th>
                        <th>Ref2</th>
                        <th>hasData</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(row, index) in parsedData" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>{{ row.date }}</td>
                        <td>{{ row.amount }}</td>
                        <td>{{ row.ref1 }}</td>
                        <td>{{ row.ref2 }}</td>
                        <td>{{ row.hasData }}</td>
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
      columnLabels: ['Customer No / Ref.1', 'Ref.2', 'Amount'],
      apiProgress: 0 // Track API call progress
    };
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.parseCsvFile(file);
      }
    },
    parseCsvFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split(/\r?\n/); // Split the file content by new line
        this.parsedData = rows.slice(1) // Skip the header row
        .map(row => {
          const columns = row.split(','); // Split each row by the comma delimiter
          // Extract and format the data as needed
          const ref1 = columns[4]; // Assuming the 'Customer No / Ref.1' is in the 5th column
          const ref2 = columns[5]; // Assuming 'Ref.2' is in the 6th column
          const amount = columns[9]; // Assuming 'Amount' is in the 10th column
          const date = columns[2]; // Assuming 'Amount' is in the 10th column
          return { ref1, ref2, amount ,date };
        }).filter(row => row.ref1 && row.ref2); // Filter out rows without necessary data
      };
      reader.readAsText(file);
    },
    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    },

    async callApiForAllItems() {
        this.apiProgress = 0;
        // Use a regular for loop instead of forEach to ensure sequential execution
        for (let index = 0; index < this.parsedData.length; index++) {
            const item = this.parsedData[index];
            try {
                // Call your API with ref1, ref2, and index for each item
                const response = await this.callYourApiFunction(item.ref1, item.ref2, item.date, item.formattedTime, index);
                console.log('API Response:', response);
                this.apiProgress++;
                // Handle the API response as needed

                // Wait for 1 second before proceeding to the next iteration
                await this.delay(1000);
            } catch (error) {
                console.error('API Error:', error);
                // Handle errors if any
                // Optionally, continue to the next iteration even if there's an error
                await this.delay(1000); // Delay also applied here to respect the rate limit after an error
            }
        }
    },
    markRowAsHavingData(index, hasData) {
        this.parsedData[index] = { ...this.parsedData[index], hasData: hasData };
    },
    async callYourApiFunction(ref1, ref2, date, time, index) {
    try {
        // Example API request data
        const requestData = {
        method: 'find',
        args: [{ $and: [{ ref1: ref1, ref2: ref2 }] }],
        };
        
        // Perform the API call
        const response = await Request.POST(`order/query`, requestData, this.configs.key);
        console.log("response",response);
        // Check the response status and data length to determine if data exists
        if (response.status === 200 && response.data.length > 0) {
        // Data found, mark the row accordingly
        this.markRowAsHavingData(index, true);
        } else {
        // Data not found, mark the row accordingly
        this.markRowAsHavingData(index, false);
        }
    } catch (error) {
        console.error('API Error for item at index', index, ':', error);
        // Optionally, mark the row as not having data in case of error
        this.markRowAsHavingData(index, false);
        throw error; // Rethrow or handle the error as needed
    }
    },
    async callYourApiFunction2(ref1, ref2, date, time) {
      try {
        const requestData = {
          method: 'find',
          args: [{ $and: [{ ref1: ref1,ref2: ref2, process:'draft'}] }],
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
          args: [{ $and: [{ "formData.input-13-6-6.value": ref2,"formData.hidden-15-6-6.value": ref1, process:'draft'}] }],
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
            process: 'pending',
            date: date,
            time: time,
            formID:response2.data[0]._id
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
            process: 'pending',
            date: date,
            time: time,
            orderID:response.data[0]._id,
            formData: newFormData
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