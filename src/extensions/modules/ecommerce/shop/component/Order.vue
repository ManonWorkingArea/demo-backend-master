<template>
    <div>
      <h1>Orders</h1>
      
      <!-- Tabs for Order Status -->
      <div class="tabs">
        <button
          v-for="status in orderStatuses"
          :key="status.code"
          :class="{ active: selectedStatus === status.code }"
          @click="selectStatus(status.code)"
        >
          {{ status.name }}
        </button>
      </div>
      
      <!-- Orders List -->
      <div v-if="orders.length">
        <h2>{{ getStatusName(selectedStatus) }} Orders</h2>
        <ul>
          <li v-for="order in orders" :key="order._id">
            <span>Order ID: #{{ order.code }}</span><br>
            <span>Total: ${{ order.total }}</span><br>
            <span>Status: {{ getStatusName(order.status) }}</span><br>
            <button @click="changeOrderStatus(order)">Next Status</button>
          </li>
        </ul>
      </div>
      <div v-else>
        <p>No orders found for this status.</p>
      </div>
    </div>
  </template>
  
  <script>
  import { fetchOrderStatuses, fetchOrdersByStatus, updateOrderStatus } from './order/order_front';
  
  export default {
    data() {
      return {
        orderStatuses: [],
        orders: [],
        selectedStatus: '',
      };
    },
    async created() {
      await this.loadOrderStatuses();
      if (this.orderStatuses.length) {
        this.selectedStatus = this.orderStatuses[0].code;
        await this.loadOrdersByStatus();
      }
    },
    methods: {
      async loadOrderStatuses() {
        try {
          this.orderStatuses = await fetchOrderStatuses();
        } catch (error) {
          console.error('Error loading order statuses:', error);
        }
      },
      async loadOrdersByStatus() {
        try {
          this.orders = await fetchOrdersByStatus(this.selectedStatus);
        } catch (error) {
          console.error('Error loading orders:', error);
        }
      },
      selectStatus(statusCode) {
        this.selectedStatus = statusCode;
        this.loadOrdersByStatus();
      },
      getStatusName(statusCode) {
        const status = this.orderStatuses.find(status => status.code === statusCode);
        return status ? status.name : statusCode;
      },
      getNextStatus(currentStatus) {
        const currentIndex = this.orderStatuses.findIndex(status => status.code === currentStatus);
        if (currentIndex >= 0 && currentIndex < this.orderStatuses.length - 1) {
          return this.orderStatuses[currentIndex + 1].code;
        }
        return null;
      },
      async changeOrderStatus(order) {
        const nextStatus = this.getNextStatus(order.status);
        if (nextStatus) {
          try {
            await updateOrderStatus(order._id, nextStatus);
            this.loadOrdersByStatus();
          } catch (error) {
            console.error('Error updating order status:', error);
          }
        } else {
          alert('This order is already at the final status.');
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .tabs button {
    padding: 10px;
    border: none;
    background-color: #f0f0f0;
    cursor: pointer;
  }
  
  .tabs button.active {
    background-color: #007bff;
    color: white;
  }
  
  .tabs button:hover {
    background-color: #007bff;
    color: white;
  }
  </style>
  