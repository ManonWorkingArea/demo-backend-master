<!-- 
WorkItemManager.vue 
-->
<template>
    <div>
      <!-- UI for adding new default keys -->
      <div class="default-keys">
        <input type="text" v-model="newKey" placeholder="Enter new key" />
        <input type="text" v-model="newValue" placeholder="Enter new value" />
        <button @click="addDefaultKey">Add Default Key</button>
      </div>
  
      <!-- UI for adding new work items -->
      <div class="add-work-item">
        <input type="text" v-model="newWorkItemName" placeholder="Enter work item name" />
        <button @click="addWorkItem">Add Work Item</button>
      </div>
  
      <!-- List of work items -->
      <div v-for="item in workItems" :key="item.id" class="work-item">
        <h3>{{ item.name }}</h3>
        <StatusManager :item="item" @add-status="addStatus" />
        <button @click="$emit('configure-flow', item)">Add Flow Task</button>
        <ul>
          <li v-for="property in item.properties" :key="property.key">{{ property.key }}: {{ property.value }}</li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import StatusManager from './StatusManager.vue';

  export default {
    components: {
      StatusManager,
    },
    props: {
      workItems: Array,
    },
    data() {
      return {
        newWorkItemName: '',
        newKey: '',
        newValue: '',
        defaultKeyMappings: [],
      };
    },
    methods: {
      addWorkItem() {
        const newWorkItem = {
          id: Date.now(),
          name: this.newWorkItemName,
          statuses: [],
          flowTasks: [],
          properties: [...this.defaultKeyMappings], // Apply default mappings
        };
        console.log("newWorkItem",newWorkItem);
        this.$emit('add-work-item', newWorkItem);
        this.newWorkItemName = '';
      },
      addStatus(payload) {
        this.$emit('add-status', payload);
      },
      addDefaultKey() {
        if (this.newKey && this.newValue) {
          const index = this.defaultKeyMappings.findIndex(mapping => mapping.key === this.newKey);
          if (index === -1) {
            this.defaultKeyMappings.push({ key: this.newKey, value: this.newValue });
          } else {
            // For Vue 3, recreate the array or object to trigger reactivity
            this.defaultKeyMappings[index] = { key: this.newKey, value: this.newValue };
            this.defaultKeyMappings = [...this.defaultKeyMappings];
          }
          this.newKey = '';
          this.newValue = '';
        }
      },
    },
  };
</script>
