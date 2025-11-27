<template>
    <div>
      <h1>Log Data</h1>
      <ul>
        <li v-for="(log, index) in logs" :key="index">{{ log }}</li>
      </ul>
    </div>
  </template>
  
  <script>
import debug from '@/plugins/Logger.js';

export default {
  computed: {
    logs() {
      return debug.display();
    },
  },
};
</script>
