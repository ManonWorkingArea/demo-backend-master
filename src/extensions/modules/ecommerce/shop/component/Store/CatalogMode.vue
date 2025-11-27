<template>
    <div>
      <h1>Catalog Mode Configuration</h1>
  
      <form @submit.prevent="saveCatalogModeConfig">
        <div>
          <label for="catalogMode">Catalog Mode:</label>
          <input id="catalogMode" v-model="catalogMode" type="checkbox" />
        </div>
  
        <div v-if="catalogMode">
          <div>
            <label for="callMeButton">Call Me Button:</label>
            <input id="callMeButton" v-model="callMeButton" type="checkbox" />
          </div>
  
          <div v-if="callMeButton">
            <label for="buttonText">Button Text:</label>
            <input id="buttonText" v-model="buttonText" type="text" placeholder="Enter button text" />
          </div>
  
          <div>
            <label for="contactMethod">Contact Method:</label>
            <select id="contactMethod" v-model="contactMethod">
              <option value="lineid">Line ID</option>
              <option value="contactform">Contact Form</option>
              <option value="email">Email</option>
            </select>
          </div>
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
        catalogMode: false,
        callMeButton: false,
        buttonText: '',
        contactMethod: 'lineid',
        configId: null,
        message: ''
      };
    },
    methods: {
      async saveCatalogModeConfig() {
        if (this.configId) {
          await this.updateCatalogModeConfig();
        } else {
          await this.addCatalogModeConfig();
        }
      },
      async addCatalogModeConfig() {
        try {
          const response = await Request.POST('shop_config/', { data: { catalog_mode: this.catalogMode, call_me_button: this.callMeButton, button_text: this.buttonText, contact_method: this.contactMethod, unit: session.current._id || configs.siteID } }, configs.key);
          if (response.status === 200) {
            this.configId = response.data._id; // Save the ID of the new config
            this.message = 'Catalog mode configuration saved!';
          }
        } catch (error) {
          console.error('Error adding catalog mode configuration:', error);
          this.message = 'Error saving configuration';
        }
      },
      async updateCatalogModeConfig() {
        try {
          const response = await Request.PUT(`shop_config/${this.configId}`, { data: { catalog_mode: this.catalogMode, call_me_button: this.callMeButton, button_text: this.buttonText, contact_method: this.contactMethod, _id: undefined } }, configs.key);
          if (response.status === 200) {
            this.message = 'Catalog mode configuration updated!';
          }
        } catch (error) {
          console.error('Error updating catalog mode configuration:', error);
          this.message = 'Error updating configuration';
        }
      },
      async loadCatalogModeConfig() {
        try {
          const response = await Request.POST('shop_config/query', { method: 'find', args: [{ unit: session.current._id || configs.siteID }] }, configs.key);
          if (response.status === 200 && response.data.length > 0) {
            const config = response.data[0];
            this.catalogMode = config.catalog_mode || false;
            this.callMeButton = config.call_me_button || false;
            this.buttonText = config.button_text || '';
            this.contactMethod = config.contact_method || 'lineid';
            this.configId = config._id;
          }
        } catch (error) {
          console.error('Error loading catalog mode configuration:', error);
        }
      }
    },
    mounted() {
      this.loadCatalogModeConfig();
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
  input[type="checkbox"],
  select,
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
  