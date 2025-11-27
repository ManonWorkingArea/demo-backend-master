<template>
    <div class="user-profile-widget flex items-center space-x-4">
      <div class="relative">
        <img :src="mockData.avatar" alt="User Avatar" class="w-12 h-12 rounded-full">
        <span class="status-dot absolute right-0 bottom-0 w-3 h-3 bg-green-500 rounded-full border-white border-2"></span>
      </div>
      <div class="user-details">
        <p class="text-white text-sm">{{ mockData.email }}</p>
        <h2 class="text-white font-bold">{{ mockData.name }}</h2>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      data: {
        type: Object,
        required: false,
        default: null
      }
    },
    data() {
      return {
        mockData: {
          avatar: 'https://doa-academy.sgp1.digitaloceanspaces.com/upload/1721201928175-8123610343.jpg',
          name: 'นิรันดร์ จันทร์ดี',
          email: 'Usa26a@gmail.com',
          role: 'User'
        }
      };
    },
    computed: {
      displayData() {
        return this.data && Object.keys(this.data).length > 0 ? this.data : this.mockData;
      }
    }
  };
  </script>
  
  <style scoped>
  .user-profile-widget {
    max-width: 300px;
    padding: 1rem;
    background-color: transparent; /* No background */
  }
  .user-details p {
    margin: 0;
  }
  .status-dot {
    position: absolute;
    right: 0;
    bottom: 0;
  }
  </style>
  