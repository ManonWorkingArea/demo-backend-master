<template>
    <div class="flex items-center justify-between">
      <!-- Logo and app name -->
      <div class="flex items-center">
        <img v-if="layout === 'horizontal'" src="/path/to/logo.png" alt="Logo" class="h-8">
        <span v-if="layout === 'horizontal'" class="ml-2 text-lg font-bold text-gray-800">My App Name</span>
      </div>
  
      <!-- Menu -->
      <div class="hidden md:block">
        <ul :class="{'flex': layout === 'horizontal', 'flex-col': layout === 'vertical'}">
          <li v-for="item in menuItems" :key="item.label" :class="{'mb-4 md:mb-0': layout === 'vertical'}">
            <a :href="item.link" class="block py-2 md:px-3 md:py-2">{{ item.label }}</a>
          </li>
        </ul>
      </div>
  
      <!-- Avatar and logout button -->
      <div class="flex items-center" v-if="showAvatar">
        <div class="relative">
          <button class="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out">
            <img class="h-8 w-8 rounded-full" :src="avatarSrc" alt="Avatar">
          </button>
        </div>
        <button class="ml-4 bg-gray-600 text-white py-2 px-4 rounded-lg" @click="logout">Logout</button>
      </div>
  
      <!-- Search bar -->
      <div class="hidden md:block" v-if="showSearch">
        <input type="text" placeholder="Search" class="px-2 py-1 rounded-lg border border-gray-400">
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Menu',
    props: {
      menuItems: {
        type: Array,
        required: true,
      },
      layout: {
        type: String,
        required: true,
        validator: value => ['horizontal', 'vertical'].includes(value),
      },
      showSearch: {
        type: Boolean,
        default: false,
      },
      showAvatar: {
        type: Boolean,
        default: true,
      },
      avatarSrc: {
        type: String,
        default: "/path/to/avatar.jpg",
      },
    },
    methods: {
      logout() {
        // Logout logic here
      },
    },
  };
  </script>
  