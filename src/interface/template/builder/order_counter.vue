<template>
    <div class="stats-card flex items-center space-x-4">
      <div class="icon-container flex items-center justify-center w-12 h-12 rounded-full">
        <i class="icon" :class="iconClass"></i>
      </div>
      <div class="text-content">
        <div class="count text-2xl font-bold">{{ count }}</div>
        <div class="label text-gray-600">{{ label }}</div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        count: this.data.count || '154k+', // Default example count
        label: this.data.label || 'Customers we have served', // Default example label
        iconClass: this.data.iconClass || 'fas fa-shopping-cart', // Default example icon class
      };
    }
  };
  </script>
  
  <style scoped>
  .stats-card {
    padding: 1rem;
    border: 1px solid #e0e0e0;
    margin: 5px;
    border-radius: 5px;
    background: #f9f9f9;
  }
  
  .icon-container {
    color: #6b7280; /* Icon color (gray) */
  }
  
  .text-content {
    color: #4a4a4a; /* Text color */
  }
  
  .icon {
    font-size: 32px; /* Icon size */
  }
  </style>
  