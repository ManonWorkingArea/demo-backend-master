<template>
    <div>
      <h1>Price Manager</h1>
      <button @click="fetchPrices">Load Prices</button>
      <ul>
        <li v-for="(price, index) in priceList" :key="price._id">
          <span>{{ price.name }} ({{ price.code }}) - Category: {{ getCategoryName(price.category) }} - Type: {{ price.type }} - Mode: {{ price.mode }} - Period: {{ price.period.start }} to {{ price.period.end }} - Value: {{ price.value }}</span>
          <button @click="prepareEditPrice(price)">Update</button>
          <button @click="removePrice(price._id, index)">Delete</button>
        </li>
      </ul>
      <div v-if="showPriceConfig">
        <h2>Edit Price</h2>
        <label for="priceName">Name</label>
        <input id="priceName" v-model="priceData.name" placeholder="Name" />
    
        <label for="priceCode">Code</label>
        <input id="priceCode" v-model="priceData.code" placeholder="Code" />
    
        <label for="priceCategory">Category</label>
        <select id="priceCategory" v-model="priceData.category">
          <option v-for="category in categoryList" :key="category._id" :value="category._id">{{ category.name }}</option>
        </select>
    
        <label for="priceType">Type</label>
        <select id="priceType" v-model="priceData.type">
          <option value="one">One</option>
          <option value="multiple">Multiple</option>
        </select>
    
        <label for="priceMode">Mode</label>
        <select id="priceMode" v-model="priceData.mode">
          <option value="fix">Fix</option>
          <option value="percent">Percent</option>
        </select>
    
        <label for="pricePeriodStart">Period Start</label>
        <input id="pricePeriodStart" v-model="priceData.period.start" type="date" />
    
        <label for="pricePeriodEnd">Period End</label>
        <input id="pricePeriodEnd" v-model="priceData.period.end" type="date" />
    
        <label for="priceValue">Value</label>
        <input id="priceValue" v-model="priceData.value" type="number" placeholder="Value" />
    
        <button @click="updatePrice">Save Changes</button>
      </div>
      <div>
        <h2>Add Price</h2>
        <label for="newPriceName">Name</label>
        <input id="newPriceName" v-model="newPrice.name" placeholder="Name" />
    
        <label for="newPriceCode">Code</label>
        <input id="newPriceCode" v-model="newPrice.code" placeholder="Code" />
    
        <label for="newPriceCategory">Category</label>
        <select id="newPriceCategory" v-model="newPrice.category">
          <option v-for="category in categoryList" :key="category._id" :value="category._id">{{ category.name }}</option>
        </select>
    
        <label for="newPriceType">Type</label>
        <select id="newPriceType" v-model="newPrice.type">
          <option value="one">One</option>
          <option value="multiple">Multiple</option>
        </select>
    
        <label for="newPriceMode">Mode</label>
        <select id="newPriceMode" v-model="newPrice.mode">
          <option value="fix">Fix</option>
          <option value="percent">Percent</option>
        </select>
    
        <label for="newPricePeriodStart">Period Start</label>
        <input id="newPricePeriodStart" v-model="newPrice.period.start" type="date" />
    
        <label for="newPricePeriodEnd">Period End</label>
        <input id="newPricePeriodEnd" v-model="newPrice.period.end" type="date" />
    
        <label for="newPriceValue">Value</label>
        <input id="newPriceValue" v-model="newPrice.value" type="number" placeholder="Value" />
    
        <button @click="addPrice">Add Price</button>
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
        priceList: [],
        categoryList: [],
        priceData: { _id: '', name: '', code: '', category: '', type: 'one', mode: 'fix', period: { start: '', end: '' }, value: 0 },
        newPrice: { name: '', code: '', category: '', type: 'one', mode: 'fix', period: { start: '', end: '' }, value: 0 },
        showPriceConfig: false,
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
      };
    },
    methods: {
      async fetchPrices() {
        try {
          const priceResponse = await Request.POST('product_price/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
          if (priceResponse.status === 200) this.priceList = priceResponse.data;
    
          const categoryResponse = await Request.POST('product_category/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
          if (categoryResponse.status === 200) this.categoryList = categoryResponse.data;
        } catch (error) { console.error('Error fetching data:', error); }
      },
      prepareEditPrice(price) {
        this.priceData = { ...price, period: { ...price.period } };
        this.showPriceConfig = true;
      },
      async updatePrice() {
        try {
          const response = await Request.PUT(`product_price/${this.priceData._id}`, { data: { ...this.priceData, _id: undefined } }, this.configs.key);
          if (response.status === 200) {
            await this.fetchPrices();
            this.showPriceConfig = false;
            this.resetPriceData();
          }
        } catch (error) { console.error('Error updating price:', error); }
      },
      async removePrice(priceId, index) {
        try {
          const response = await Request.DELETE(`product_price/${priceId}`, '', this.configs.key);
          if (response.status === 200) this.priceList.splice(index, 1);
        } catch (error) { console.error('Error deleting price:', error); }
      },
      async addPrice() {
        try {
          const response = await Request.POST('product_price/', { data: { ...this.newPrice, unit: this.session.current._id || this.configs.siteID } }, this.configs.key);
          if (response.status === 200) {
            this.priceList.push(response.data);
            this.resetNewPrice();
          }
        } catch (error) { console.error('Error adding price:', error); }
      },
      resetNewPrice() {
        this.newPrice = { name: '', code: '', category: '', type: 'one', mode: 'fix', period: { start: '', end: '' }, value: 0 };
      },
      resetPriceData() {
        this.priceData = { _id: '', name: '', code: '', category: '', type: 'one', mode: 'fix', period: { start: '', end: '' }, value: 0 };
      },
      getCategoryName(categoryId) {
        const category = this.categoryList.find(cat => cat._id === categoryId);
        return category ? category.name : 'None';
      }
    },
    async mounted() {
      await this.fetchPrices();
    }
  };
  </script>
  