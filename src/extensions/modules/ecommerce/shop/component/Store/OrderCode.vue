<template>
    <div>
      <h1>Store Configuration</h1>
  
      <form @submit.prevent="saveConfig">
        <div>
          <label for="numDigits">Total Number of Digits:</label>
          <input id="numDigits" v-model.number="config.custom_order_code.numDigits" type="number" min="1" placeholder="Enter total number of digits" required />
        </div>
  
        <div>
          <label for="groups">Groups Configuration:</label>
          <div v-for="(group, index) in config.custom_order_code.groups" :key="index" class="group-config">
            <select v-model="group.type" @change="updateGroupDigit(group)">
              <option value="text">Text</option>
              <option value="year">Year</option>
              <option value="month">Month</option>
              <option value="auto">Auto Number</option>
            </select>
  
            <input v-if="group.type === 'text'" v-model="group.value" type="text" placeholder="Enter text" />
  
            <div v-if="group.type === 'year'">
              <label>Year Format:</label>
              <select v-model="group.format">
                <option value="4">4 Digits</option>
                <option value="2">2 Digits</option>
              </select>
            </div>
  
            <input v-if="group.type !== 'year' && group.type !== 'month'" v-model.number="group.digits" type="number" min="1" placeholder="Digits" />
  
            <button @click="removeGroup(index)">Remove</button>
          </div>
          <button type="button" @click="addGroup">Add Group</button>
        </div>
  
        <div v-if="totalGroupDigits > config.custom_order_code.numDigits" class="error">
          The sum of group digits exceeds the total number of digits.
        </div>
  
        <button type="submit" :disabled="totalGroupDigits > config.custom_order_code.numDigits">Save Configuration</button>
      </form>
  
      <hr>
  
      <div>
        <h2>Sample Order Codes</h2>
        <ul>
          <li>{{ generateOrderCode(1) }}</li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import requestClient from '@/plugins/requestClient';
  import storageManager from '@/plugins/storage';
  
  const Request = new requestClient(false);
  const configs = storageManager.get('configs');
  const session = storageManager.get('session');
  
  export default {
    data() {
      return {
        config: {
          custom_order_code: {
            numDigits: 10,
            groups: [
              { type: 'text', value: 'A', digits: 1 },
              { type: 'year', format: '4', digits: 4 },
              { type: 'month', digits: 2 },
              { type: 'auto', digits: 3 }
            ],
            autoNumber: 1
          }
        },
        configId: null // Add this to keep track of the config ID
      };
    },
    computed: {
      totalGroupDigits() {
        return this.config.custom_order_code.groups.reduce((sum, group) => {
          if (group.type === 'year') return sum + parseInt(group.format);
          if (group.type === 'month') return sum + 2;
          return sum + group.digits;
        }, 0);
      }
    },
    methods: {
      async saveConfig() {
        if (this.configId) {
          await this.updateConfig();
        } else {
          await this.addConfig();
        }
      },
      async addConfig() {
        try {
          const response = await Request.POST('shop_config/', { data: { custom_order_code: this.config.custom_order_code, unit: session.current._id || configs.siteID } }, configs.key);
          if (response.status === 200) {
            this.configId = response.data._id; // Save the ID of the new config
            alert('Configuration saved!');
          }
        } catch (error) {
          console.error('Error adding configuration:', error);
        }
      },
      async updateConfig() {
        try {
          const response = await Request.PUT(`shop_config/${this.configId}`, { data: { custom_order_code: this.config.custom_order_code, _id: undefined } }, configs.key);
          if (response.status === 200) {
            alert('Configuration updated!');
          }
        } catch (error) {
          console.error('Error updating configuration:', error);
        }
      },
      async loadConfig() {
        try {
          const response = await Request.POST('shop_config/query', { method: 'find', args: [{ unit: session.current._id || configs.siteID }] }, configs.key);
          if (response.status === 200 && response.data.length > 0) {
            const config = response.data[0];
            this.config.custom_order_code = config.custom_order_code;
            this.configId = config._id;
          }
        } catch (error) {
          console.error('Error loading configuration:', error);
        }
      },
      addGroup() {
        this.config.custom_order_code.groups.push({ type: 'text', value: '', digits: 1 });
      },
      removeGroup(index) {
        this.config.custom_order_code.groups.splice(index, 1);
      },
      updateGroupDigit(group) {
        if (group.type === 'year') group.format = '4';
        if (group.type === 'month') group.digits = 2;
      },
      generateOrderCode(index) {
        const date = new Date();
        let orderCode = '';
        let autoNumber = this.config.custom_order_code.autoNumber + index - 1;
  
        for (const group of this.config.custom_order_code.groups) {
          if (group.type === 'text') {
            orderCode += group.value.padEnd(group.digits, ' ');
          } else if (group.type === 'year') {
            const year = group.format === '4' ? date.getFullYear().toString() : date.getFullYear().toString().slice(-2);
            orderCode += year;
          } else if (group.type === 'month') {
            orderCode += ('0' + (date.getMonth() + 1)).slice(-2);
          } else if (group.type === 'auto') {
            orderCode += autoNumber.toString().padStart(group.digits, '0');
          }
        }
  
        return orderCode;
      }
    },
    mounted() {
      this.loadConfig();
    }
  };
  </script>
  
  <style scoped>
  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
    margin: auto;
  }
  
  label {
    font-weight: bold;
  }
  
  input[type="text"],
  input[type="number"],
  select {
    padding: 5px;
    font-size: 16px;
  }
  
  button {
    padding: 10px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .group-config {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .error {
    color: red;
  }
  </style>
  