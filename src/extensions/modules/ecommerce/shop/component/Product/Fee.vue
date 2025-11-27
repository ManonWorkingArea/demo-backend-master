<template>
    <div>
      <h1>Fee Manager</h1>
      <button @click="fetchFees">Load Fees</button>
      <ul>
        <li v-for="(fee, index) in feeList" :key="fee._id">
          <span>
            {{ fee.code }} - {{ fee.type }} - 
            Conditions: 
            <ul>
              <li v-for="(condition, i) in fee.conditions" :key="i">
                Total Price: {{ condition.total_price }} - 
                Fee Value: {{ condition.fee_value }} ({{ condition.mode }})
                <button @click="removeCondition(index, i)">Remove Condition</button>
              </li>
            </ul>
          </span>
          <button @click="prepareEditFee(fee)">Update</button>
          <button @click="removeFee(fee._id, index)">Delete</button>
        </li>
      </ul>
      <div v-if="showFeeConfig">
        <h2>Edit Fee</h2>
        <label for="feeCode">Code</label>
        <input id="feeCode" v-model="feeData.code" placeholder="Code" />
        
        <label for="feeType">Type</label>
        <select id="feeType" v-model="feeData.type">
          <option value="shipping">Shipping</option>
          <option value="tax">Tax</option>
          <option value="custom">Custom</option>
        </select>
        
        <div>
          <h3>Conditions</h3>
          <button @click="addCondition">Add Condition</button>
          <ul>
            <li v-for="(condition, index) in feeData.conditions" :key="index">
              <label for="totalPrice">Total Price</label>
              <input id="totalPrice" v-model="condition.total_price" type="number" placeholder="Total Price" />
              
              <label for="feeValue">Fee Value</label>
              <input id="feeValue" v-model="condition.fee_value" type="number" placeholder="Fee Value" />
              
              <label for="mode">Mode</label>
              <select id="mode" v-model="condition.mode">
                <option value="fix">Fix</option>
                <option value="percent">Percent</option>
              </select>
              
              <button @click="removeConditionFromEdit(index)">Remove</button>
            </li>
          </ul>
        </div>
        
        <button @click="updateFee">Save Changes</button>
      </div>
      <div>
        <h2>Add Fee</h2>
        <label for="newFeeCode">Code</label>
        <input id="newFeeCode" v-model="newFee.code" placeholder="Code" />
        
        <label for="newFeeType">Type</label>
        <select id="newFeeType" v-model="newFee.type">
          <option value="shipping">Shipping</option>
          <option value="tax">Tax</option>
          <option value="custom">Custom</option>
        </select>
        
        <div>
          <h3>Conditions</h3>
          <button @click="addConditionToNew">Add Condition</button>
          <ul>
            <li v-for="(condition, index) in newFee.conditions" :key="index">
              <label for="newTotalPrice">Total Price</label>
              <input id="newTotalPrice" v-model="condition.total_price" type="number" placeholder="Total Price" />
              
              <label for="newFeeValue">Fee Value</label>
              <input id="newFeeValue" v-model="condition.fee_value" type="number" placeholder="Fee Value" />
              
              <label for="newMode">Mode</label>
              <select id="newMode" v-model="condition.mode">
                <option value="fix">Fix</option>
                <option value="percent">Percent</option>
              </select>
              
              <button @click="removeConditionFromNew(index)">Remove</button>
            </li>
          </ul>
        </div>
        
        <button @click="addFee">Add Fee</button>
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
        feeList: [],
        feeData: { _id: '', code: '', type: 'shipping', conditions: [] },
        newFee: { code: '', type: 'shipping', conditions: [] },
        showFeeConfig: false,
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
      };
    },
    methods: {
      async fetchFees() {
        try {
          const response = await Request.POST('product_fee/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
          if (response.status === 200) this.feeList = response.data;
        } catch (error) {
          console.error('Error fetching fees:', error);
        }
      },
      prepareEditFee(fee) {
        this.feeData = { ...fee };
        this.showFeeConfig = true;
      },
      async updateFee() {
        try {
          const response = await Request.PUT(`product_fee/${this.feeData._id}`, { data: { ...this.feeData, _id: undefined } }, this.configs.key);
          if (response.status === 200) {
            await this.fetchFees();
            this.showFeeConfig = false;
            this.resetFeeData();
          }
        } catch (error) {
          console.error('Error updating fee:', error);
        }
      },
      async removeFee(feeId, index) {
        try {
          const response = await Request.DELETE(`product_fee/${feeId}`, '', this.configs.key);
          if (response.status === 200) this.feeList.splice(index, 1);
        } catch (error) {
          console.error('Error deleting fee:', error);
        }
      },
      async addFee() {
        try {
          const response = await Request.POST('product_fee/', { data: { ...this.newFee, unit: this.session.current._id || this.configs.siteID } }, this.configs.key);
          if (response.status === 200) {
            this.feeList.push(response.data);
            this.resetNewFee();
          }
        } catch (error) {
          console.error('Error adding fee:', error);
        }
      },
      addCondition() {
        this.feeData.conditions.push({ total_price: 0, fee_value: 0, mode: 'fix' });
      },
      removeConditionFromEdit(index) {
        this.feeData.conditions.splice(index, 1);
      },
      addConditionToNew() {
        this.newFee.conditions.push({ total_price: 0, fee_value: 0, mode: 'fix' });
      },
      removeConditionFromNew(index) {
        this.newFee.conditions.splice(index, 1);
      },
      resetFeeData() {
        this.feeData = { _id: '', code: '', type: 'shipping', conditions: [] };
      },
      resetNewFee() {
        this.newFee = { code: '', type: 'shipping', conditions: [] };
      },
    },
    async mounted() {
      await this.fetchFees();
    }
  };
  </script>
  