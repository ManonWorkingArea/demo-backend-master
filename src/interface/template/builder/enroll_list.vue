<template>
    <div class="order-list-table">
      <table class="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th class="py-2 px-4 border-b">Order ID</th>
            <th class="py-2 px-4 border-b">Customer Name</th>
            <th class="py-2 px-4 border-b">Date</th>
            <th class="py-2 px-4 border-b">Status</th>
            <th class="py-2 px-4 border-b">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-100">
            <td class="py-2 px-4 border-b">{{ order.id }}</td>
            <td class="py-2 px-4 border-b">{{ order.customerName }}</td>
            <td class="py-2 px-4 border-b">{{ order.date }}</td>
            <td class="py-2 px-4 border-b">{{ order.status }}</td>
            <td class="py-2 px-4 border-b">{{ order.total }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        orders: [
          { id: '1001', customerName: 'John Doe', date: '2024-08-12', status: 'Shipped', total: '$120.00' },
          { id: '1002', customerName: 'Jane Smith', date: '2024-08-11', status: 'Pending', total: '$85.00' },
          { id: '1003', customerName: 'Alice Johnson', date: '2024-08-10', status: 'Delivered', total: '$150.00' },
          // Add more mock orders here
        ]
      };
    }
  };
  </script>
  
  <style scoped>
  .order-list-table {
    width: 100%;
    margin: 1rem 0;
    border-collapse: collapse;
  }
  
  th {
    background-color: #f9fafb;
    font-weight: 600;
    text-align: left;
  }
  
  td, th {
    border: 1px solid #e5e7eb;
    padding: 8px 16px;
  }
  
  tbody tr:hover {
    background-color: #f3f4f6;
  }
  </style>
  