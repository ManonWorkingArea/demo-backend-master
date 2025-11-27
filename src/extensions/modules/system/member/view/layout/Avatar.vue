<template>
    <div class="relative">
    <button class="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out">
        <img class="h-8 w-8 rounded-full" :src="avatarSrc" alt="Avatar">
    </button>
    </div>
    <button @click="logout" type="button" class="pt-2 ml-5 flex-shrink-0 rounded-full bg-transparent p-1 text-white hover:text-gray-500">
    <span class="sr-only">ออกจากระบบ</span>
    <font-awesome-icon class="h-6 w-6" aria-hidden="true" :icon="['fas','power-off']"/>
    </button>
  </template>
  
  <script>
  export default {
    name: 'Avatar',
    props: {
      avatarSrc: {
        type: String,
        default: "https://via.placeholder.com/150",
      },
    },
    methods: {
      logout() {
        // handle logout logic here
      },
    },
  };
  </script>
  