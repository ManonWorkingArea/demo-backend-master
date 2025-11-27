<template>
    <div class="hidden lg:ml-10 lg:block">
      <div class="flex space-x-4">
        <router-link
          v-for="item in navigation"
          :key="item.href"
          :to="item.href"
          :class="[item.current ? 'bg-gray-100' : 'hover:bg-gray-100 hover:text-indigo-900', 'px-3 py-2 rounded-md text-sm font-medium text-white']"
          :aria-current="item.current ? 'page' : undefined"
        >
          <font-awesome-icon :icon="['fas',item.icon]"/> {{item.name}} <span v-if="item.counter" class="ml-2 rounded-full bg-red-500 py-0.5 px-2 text-xs text-white">{{item.count}}</span>
        </router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      navigation: {
        type: Array,
        required: true,
      },
    },
  }
  </script>
  