<template>
    <div class="bg-white border-b border-gray-200">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div class="pt-3">
          <input type="file" @change="handleFileUpload">
          <br />
          <label for="processInput">Process: </label>
          <input type="text" id="processInput" v-model="process" placeholder="Enter process value">
          <br />
          <label for="limitInput">Limit: </label>
          <input type="number" id="limitInput" v-model="limit" placeholder="Enter limit" min="1">
          <br />
          <button @click="callApiForAllItems" v-if="parsedData.length > 0">Call API for All Items</button>
          
          <pre>{{ enroll }}</pre>
          <br />
          <div v-if="apiProgress > 0">
            Progress: {{ apiProgress }}/ {{ parsedData.length }}
          </div>
  
          <table v-if="parsedData.length > 0" class="table mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Ref1</th>
                <th>Ref2</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in parsedData" :key="index">
                <td>{{ index + 1 }}</td>
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
        apiProgress: 0, // Track API call progress
        process: 'draft', // Default process value
        limit: null // Limit value
      };
    },
    methods: {
      handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
          this.parseCSVFile(file);
        }
      },
      parseCSVFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
          const textData = reader.result;
          const rows = textData.trim().split('\n').slice(1); // Skip the header row
          this.parsedData = rows.map(row => {
            const columns = row.split(',').map(col => col.trim().replace('\r', ''));
            return {
              ref1: columns[0],
              ref2: columns[1]
            };
          });
        };
        reader.readAsText(file);
      },
      async callApiForAllItems() {
        this.apiProgress = 0;
        const limit = this.limit ? parseInt(this.limit) : this.parsedData.length;
        for (let index = 0; index < Math.min(this.parsedData.length, limit); index++) {
          const item = this.parsedData[index];
          try {
            const response = await this.callYourApiFunction(item.ref1, item.ref2, index + 1);
            console.log('API Response:', response);
            this.apiProgress++;
          } catch (error) {
            console.error('API Error:', error);
          }
        }
      },
      async callYourApiFunction(ref1, ref2) {
        try {
          const requestData = {
            method: 'find',
            args: [{ $and: [{ ref1: ref1, ref2: ref2, process: this.process }] }],
          };
  
          const response = await Request.POST('order/query', requestData, this.configs.key);
          console.log('Order', response.data);
  
          if (response.status !== 200) {
            throw new Error('Failed to fetch data from API');
          }
  
          const requestData2 = {
            method: 'find',
            args: [{ $and: [{ "formData.input-13-6-6.value": ref2, "formData.hidden-15-6-6.value": ref1, process: 'draft' }] }],
          };
  
          const response2 = await Request.POST('form/query', requestData2, this.configs.key);
          console.log('Form', response2.data);
  
          if (response2.status !== 200) {
            throw new Error('Failed to fetch data from API');
          }
  
          const requestBody = {
            data: {
                process: 'pending',
                date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
                time: new Date().toTimeString().split(' ')[0], // Current time in HH:MM:SS format
                formID:response2.data[0]._id
            }
            };
          const { data, status } = await Request.PUT(`order/${response.data[0]._id}`, requestBody, this.configs.key);
          console.log(data, status);
  
          let newFormData = { ...response2.data[0].formData };
  
          let newField = {
            name: "วันที่ชำระเงิน",
            value: '', // You can set the initial value here or leave it empty
            type: "datetime",
            mode: "datetime"
          };
  
          newFormData["input-30-9-9"] = newField;
  
          const requestBody2 = {
            data: {
                process: 'pending',
                date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
                time: new Date().toTimeString().split(' ')[0], // Current time in HH:MM:SS format
                orderID:response.data[0]._id,
                formData: newFormData
            }
            };
          const { data2, status2 } = await Request.PUT(`form/${response2.data[0]._id}`, requestBody2, this.configs.key);
          console.log(data2, status2);
  
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
  