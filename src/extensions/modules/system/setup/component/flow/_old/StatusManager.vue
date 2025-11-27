<!-- 
StatusManager.vue 
-->
<template>
    <div>
      <!-- Add Status to Work Item -->
      <div class="add-status">
        <input type="text" v-model="newStatusName" placeholder="Enter status name" />
        <button @click="addStatus">Add Status</button>
      </div>
  
      <!-- List of Statuses -->
      <div v-if="item.statuses && item.statuses.length" class="statuses-list">
        <h4>Statuses:</h4>
        <ul>
          <li v-for="status in item.statuses" :key="status.id">{{ status.name }}</li>
        </ul>
      </div>
    </div>
    <hr>
  </template>
  
  <script>
  export default {
    props: ['item'],
    data() {
      return {
        newStatusName: '',
      };
    },
    methods: {
      addStatus() {
        if (this.newStatusName.trim()) {
          // Emit event with status details and the work item it belongs to
          this.$emit('add-status', { item: this.item, status: { id: Date.now(), name: this.newStatusName } });
          this.newStatusName = ''; // Reset for next input
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .add-status, .statuses-list {
    margin-bottom: 20px;
  }
  </style>
  