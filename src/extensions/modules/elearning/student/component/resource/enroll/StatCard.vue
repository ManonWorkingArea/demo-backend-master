<template>
    <div class="bg-blue-50 p-2 rounded-md flex items-center">
      <div class="flex-shrink-0 border-r border-gray-200 pr-2 mr-2">
        <i :class="icon" class="text-2xl text-gray-500"></i>
      </div>
      <div class="ml-2">
        <h3 class="text-sm text-gray-400">{{ title }}</h3>
        <p class="text-2xl font-semibold">{{ value }} <small class="text-xs text-gray-500">{{ suffix }}</small></p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      icon: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      value: {
        type: [String, Number],
        required: true
      },
      suffix: {
        type: String,
        default: ''
      }
    }
  }
  </script>
  
  <style scoped>
  </style>
  