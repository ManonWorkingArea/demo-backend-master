<template>
  <div>
    <h1>Payment Gateway Manager</h1>
    <button @click="fetchData">Load Payment Gateways and Order Statuses</button>
    <ul>
      <li v-for="(gateway, index) in paymentGatewayList" :key="gateway._id">
        <span>{{ gateway.name }} ({{ gateway.code }}) - Status: {{ gateway.status }}</span>
        <button @click="prepareEditGateway(gateway)">Update</button>
        <button @click="removePaymentGateway(gateway._id, index)">Delete</button>
      </li>
    </ul>
    <div v-if="showGatewayConfig">
      <h2>Edit Payment Gateway</h2>
      <label for="gatewayName">Name</label>
      <input id="gatewayName" v-model="gatewayData.name" placeholder="Name" />
  
      <label for="gatewayCode">Code</label>
      <input id="gatewayCode" v-model="gatewayData.code" placeholder="Code" />
  
      <label for="gatewayStatus">Status</label>
      <select id="gatewayStatus" v-model="gatewayData.status">
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="unactive">Unactive</option>
      </select>
  
      <label for="defaultOrderStatus">Default Order Status</label>
      <select id="defaultOrderStatus" v-model="gatewayData.defaultOrderStatus">
        <option v-for="status in orderStatusList" :key="status._id" :value="status._id">
          {{ status.name }} ({{ status.code }})
        </option>
      </select>
  
      <button @click="updatePaymentGateway">Save Changes</button>
    </div>
    <div>
      <h2>Add Payment Gateway</h2>
      <label for="newGatewayName">Name</label>
      <input id="newGatewayName" v-model="newGateway.name" placeholder="Name" />
  
      <label for="newGatewayCode">Code</label>
      <input id="newGatewayCode" v-model="newGateway.code" placeholder="Code" />
  
      <label for="newGatewayStatus">Status</label>
      <select id="newGatewayStatus" v-model="newGateway.status">
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="unactive">Unactive</option>
      </select>
  
      <label for="newDefaultOrderStatus">Default Order Status</label>
      <select id="newDefaultOrderStatus" v-model="newGateway.defaultOrderStatus">
        <option v-for="status in orderStatusList" :key="status._id" :value="status._id">
          {{ status.name }} ({{ status.code }})
        </option>
      </select>
  
      <button @click="addPaymentGateway">Add Payment Gateway</button>
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
      paymentGatewayList: [],
      orderStatusList: [],
      gatewayData: { _id: '', name: '', code: '', status: 'active', defaultOrderStatus: '' },
      newGateway: { name: '', code: '', status: 'active', defaultOrderStatus: '' },
      showGatewayConfig: false,
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
    };
  },
  methods: {
    async fetchData() {
      await this.fetchPaymentGateways();
      await this.fetchOrderStatuses();
    },
    async fetchPaymentGateways() {
      try {
        const response = await Request.POST('store_payment/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
        if (response.status === 200) {
          this.paymentGatewayList = response.data;
        }
      } catch (error) {
        console.error('Error fetching payment gateways:', error);
      }
    },
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
    prepareEditGateway(gateway) {
      this.gatewayData = { ...gateway };
      this.showGatewayConfig = true;
    },
    async updatePaymentGateway() {
      try {
        const response = await Request.PUT(`store_payment/${this.gatewayData._id}`, { data: { ...this.gatewayData, _id: undefined } }, this.configs.key);
        if (response.status === 200) {
          await this.fetchPaymentGateways();
          this.showGatewayConfig = false;
          this.resetGatewayData();
        }
      } catch (error) {
        console.error('Error updating payment gateway:', error);
      }
    },
    async removePaymentGateway(gatewayId) {
      try {
        const response = await Request.DELETE(`store_payment/${gatewayId}`, '', this.configs.key);
        if (response.status === 200) this.fetchPaymentGateways();
      } catch (error) {
        console.error('Error deleting payment gateway:', error);
      }
    },
    async addPaymentGateway() {
      try {
        const response = await Request.POST('store_payment/', { data: { ...this.newGateway, unit: this.session.current._id || this.configs.siteID } }, this.configs.key);
        if (response.status === 200) {
          await this.fetchPaymentGateways();
          this.resetNewGateway();
        }
      } catch (error) {
        console.error('Error adding payment gateway:', error);
      }
    },
    resetNewGateway() {
      this.newGateway = { name: '', code: '', status: 'active', defaultOrderStatus: '' };
    },
    resetGatewayData() {
      this.gatewayData = { _id: '', name: '', code: '', status: 'active', defaultOrderStatus: '' };
    }
  },
  async mounted() {
    await this.fetchData();
  }
};
</script>

<style scoped>
.section {
  margin-bottom: 20px;
}
</style>
