<template>
    <div>
      <h1>Currency Configuration</h1>
      
      <form @submit.prevent="saveCurrencyConfig">
        <div>
          <label for="currencyName">Currency Name:</label>
          <input id="currencyName" v-model="currency.name" type="text" placeholder="Enter currency name" required />
        </div>
        
        <div>
          <label for="currencyCode">Currency Code:</label>
          <input id="currencyCode" v-model="currency.code" type="text" placeholder="Enter currency code" required />
        </div>
        
        <div>
          <label for="currencySymbol">Currency Symbol:</label>
          <input id="currencySymbol" v-model="currency.symbol" type="text" placeholder="Enter currency symbol" required />
        </div>
        
        <button type="submit">Save Configuration</button>
      </form>
      
      <div v-if="message" class="message">{{ message }}</div>
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
        currency: {
          name: '',
          code: '',
          symbol: ''
        },
        configId: null,
        message: ''
      };
    },
    methods: {
      async saveCurrencyConfig() {
        if (this.configId) {
          await this.updateCurrencyConfig();
        } else {
          await this.addCurrencyConfig();
        }
      },
      async addCurrencyConfig() {
        try {
          const response = await Request.POST('shop_config/', { data: { currency: this.currency, unit: session.current._id || configs.siteID } }, configs.key);
          if (response.status === 200) {
            this.configId = response.data._id; // Save the ID of the new config
            this.message = 'Currency configuration saved!';
          }
        } catch (error) {
          console.error('Error adding currency configuration:', error);
          this.message = 'Error saving configuration';
        }
      },
      async updateCurrencyConfig() {
        try {
          const response = await Request.PUT(`shop_config/${this.configId}`, { data: { currency: this.currency, _id: undefined } }, configs.key);
          if (response.status === 200) {
            this.message = 'Currency configuration updated!';
          }
        } catch (error) {
          console.error('Error updating currency configuration:', error);
          this.message = 'Error updating configuration';
        }
      },
      async loadCurrencyConfig() {
        try {
          const response = await Request.POST('shop_config/query', { method: 'find', args: [{ unit: session.current._id || configs.siteID }] }, configs.key);
          if (response.status === 200 && response.data.length > 0) {
            const config = response.data[0];
            this.currency = config.currency || { name: '', code: '', symbol: '' };
            this.configId = config._id;
          }
        } catch (error) {
          console.error('Error loading currency configuration:', error);
        }
      }
    },
    mounted() {
      this.loadCurrencyConfig();
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
  button {
    padding: 5px;
    font-size: 16px;
  }
  
  button {
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .message {
    margin-top: 10px;
    color: green;
  }
  </style>
  