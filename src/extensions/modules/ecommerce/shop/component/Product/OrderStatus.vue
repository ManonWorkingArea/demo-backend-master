<template>
    <div>
      <h1>Order Status Manager</h1>
      <button @click="fetchOrderStatuses">Load Order Statuses</button>
      <ul>
        <li v-for="(status, index) in orderStatusList" :key="status._id">
          <span>
            {{ status.name }} - {{ status.code }} - Order: {{ status.order }}
          </span>
          <button @click="moveStatusUp(index)" :disabled="index === 0">Move Up</button>
          <button @click="moveStatusDown(index)" :disabled="index === orderStatusList.length - 1">Move Down</button>
          <button @click="prepareEditStatus(status)">Update</button>
          <button @click="removeOrderStatus(status._id, index)">Delete</button>
        </li>
      </ul>
      <div v-if="showStatusConfig">
        <h2>Edit Order Status</h2>
        <label for="statusName">Name</label>
        <input id="statusName" v-model="orderStatusData.name" placeholder="Name" />
        
        <label for="statusCode">Code</label>
        <input id="statusCode" v-model="orderStatusData.code" placeholder="Code" />
        
        <button @click="updateOrderStatus">Save Changes</button>
      </div>
      <div>
        <h2>Add Order Status</h2>
        <label for="newStatusName">Name</label>
        <input id="newStatusName" v-model="newOrderStatus.name" placeholder="Name" />
        
        <label for="newStatusCode">Code</label>
        <input id="newStatusCode" v-model="newOrderStatus.code" placeholder="Code" />
        
        <button @click="addOrderStatus">Add Status</button>
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
        orderStatusList: [],
        orderStatusData: { _id: '', name: '', code: '', order: 0 },
        newOrderStatus: { name: '', code: '', order: 0 },
        showStatusConfig: false,
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
      };
    },
    methods: {
      async fetchOrderStatuses() {
        try {
          const response = await Request.POST('shop_order_status/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
          if (response.status === 200) {
            this.orderStatusList = response.data.sort((a, b) => a.order - b.order);
          }
        } catch (error) {
          console.error('Error fetching order statuses:', error);
        }
      },
      prepareEditStatus(status) {
        this.orderStatusData = { ...status };
        this.showStatusConfig = true;
      },
      async updateOrderStatus() {
        try {
          const response = await Request.PUT(`shop_order_status/${this.orderStatusData._id}`, { data: { ...this.orderStatusData, _id: undefined } }, this.configs.key);
          if (response.status === 200) {
            await this.fetchOrderStatuses();
            this.showStatusConfig = false;
            this.resetOrderStatusData();
          }
        } catch (error) {
          console.error('Error updating order status:', error);
        }
      },
      async removeOrderStatus(statusId, index) {
        try {
          const response = await Request.DELETE(`shop_order_status/${statusId}`, '', this.configs.key);
          if (response.status === 200) this.orderStatusList.splice(index, 1);
        } catch (error) {
          console.error('Error deleting order status:', error);
        }
      },
      async addOrderStatus() {
        try {
          const response = await Request.POST('shop_order_status/', { data: { ...this.newOrderStatus, order: this.orderStatusList.length, unit: this.session.current._id || this.configs.siteID } }, this.configs.key);
          if (response.status === 200) {
            this.orderStatusList.push(response.data);
            this.resetNewOrderStatus();
          }
        } catch (error) {
          console.error('Error adding order status:', error);
        }
      },
      moveStatusUp(index) {
        if (index > 0) {
          const temp = this.orderStatusList[index - 1];
          this.orderStatusList[index - 1] = this.orderStatusList[index];
          this.orderStatusList[index] = temp;
          this.updateOrderIndices();
        }
      },
      moveStatusDown(index) {
        if (index < this.orderStatusList.length - 1) {
          const temp = this.orderStatusList[index + 1];
          this.orderStatusList[index + 1] = this.orderStatusList[index];
          this.orderStatusList[index] = temp;
          this.updateOrderIndices();
        }
      },
      async updateOrderIndices() {
        try {
          for (let i = 0; i < this.orderStatusList.length; i++) {
            this.orderStatusList[i].order = i;
            await Request.PUT(`shop_order_status/${this.orderStatusList[i]._id}`, { data: { order: i } }, this.configs.key);
          }
        } catch (error) {
          console.error('Error updating order indices:', error);
        }
      },
      resetOrderStatusData() {
        this.orderStatusData = { _id: '', name: '', code: '', order: 0 };
      },
      resetNewOrderStatus() {
        this.newOrderStatus = { name: '', code: '', order: 0 };
      },
    },
    async mounted() {
      await this.fetchOrderStatuses();
    }
  };
  </script>
  
  <style scoped>
  .section {
    margin-bottom: 20px;
  }
  </style>
  