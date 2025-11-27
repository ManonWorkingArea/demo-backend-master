<!-- 
ActionTaskManager.vue 
-->
<template>
    <div>
      <!-- Task Item Detail List -->
      <div v-if="newFlowTask.tasks.length > 0">
        <h4>Task List:</h4>
        <ul>
          <li v-for="(task, index) in newFlowTask.tasks" :key="index">
            Method: {{ task.method }},
            Action: {{ task.action }},
            Command: {{ task.command }}
            <span v-if="task.action === 'changeStatus'">Status ID: {{ task.statusId }}</span>
          </li>
        </ul>
      </div>
  
      <!-- Flow Task Configuration: Selecting Target Status -->
      <div v-if="selectedItem">
        <h4>Configure Flow Task for "{{ selectedItem.name }}"</h4>
        <select v-model="newFlowTask.targetStatus">
          <option disabled value="">Select target status</option>
          <option value="all">All</option>
          <option v-for="status in selectedItem.statuses" :value="status.id" :key="status.id">
            {{ status.name }}
          </option>
        </select>
  
        <!-- Method and DataKey Inputs -->
        <div v-if="newFlowTask.targetStatus">
          <label>Method:</label>
          <select v-model="newFlowTask.method">
            <option v-for="method in methodOptions" :key="method" :value="method">{{ method }}</option>
          </select>
  
          <label>Data Key:</label>
          <input type="text" v-model="newFlowTask.dataKey" placeholder="Data Key" />
        </div>
  
        <!-- Task Details Configuration -->
        <div>
          <h5>Add Task to Flow Task</h5>
          <select v-model="newTask.action">
            <option v-for="action in actionList" :key="action.value" :value="action.value">{{ action.label }}</option>
          </select>
          <input type="text" v-model="newTask.command" placeholder="Command" />
          <!-- Display Data Mapping section only when action is 'executeCommand' -->
          <div v-if="newTask.action === 'executeCommand'">
            <h5>Add Data Mapping</h5>
            <input type="text" v-model="dataMappingKey" placeholder="Key" />
            <input type="text" v-model="dataMappingValue" placeholder="Value" />
            <button @click="addDataMapping">Add Mapping</button>
          </div>
          <div v-if="newTask.action === 'respond'">
            <h5>Add Data Mapping for Response</h5>
            <input type="text" v-model="dataMappingKey" placeholder="Key" />
            <input type="text" v-model="dataMappingValue" placeholder="Value" />
            <button @click="addDataMapping">Add Mapping</button>
          </div>
          <!-- Display Status List when action is 'changeStatus' -->
          <div v-if="newTask.action === 'changeStatus'">
            <h5>Select Status</h5>
            <select v-model="newTask.statusId">
              <option disabled value="">Select status</option>
              <option v-for="status in selectedItem.statuses" :value="status.id" :key="status.id">
                {{ status.name }}
              </option>
            </select>
          </div>
          <button @click="addTaskToFlowTask">Add Task</button>
        </div>
  
        <!-- Finalize and Emit Flow Task Configuration -->
        <button @click="finalizeFlowTask">Finalize Flow Task</button>
      </div>
    </div>
    <hr>
  </template>
  
  <script>
  export default {
    props: {
      selectedItem: Object // Expecting this to be passed correctly from the parent
    },
    data() {
      return {
        newFlowTask: {
          targetStatus: '',
          method: '',
          dataKey: '',
          tasks: []
        },
        newTask: {
          action: '',
          command: '',
          statusId: '', // Added statusId for 'changeStatus' action
          mapping: {} // Data mappings added to the newTask object
        },
        dataMappingKey: '',
        dataMappingValue: '',
        actionList: [
          { label: 'Call API', value: 'callApi' },
          { label: 'Execute Command', value: 'executeCommand' },
          { label: 'Change Status', value: 'changeStatus' },
          { label: 'Respond', value: 'respond' },
          // Add more action tasks as needed
        ],
        methodOptions: ['edit', 'delete', 'complete', 'cancel']
      };
    },
    methods: {
      addTaskToFlowTask() {
        const task = {
          action: this.newTask.action,
          command: this.newTask.command,
          statusId: this.newTask.statusId, // Include statusId for 'changeStatus' action
          mapping: { ...this.newTask.mapping } // Include data mappings in the task
        };
  
        this.newFlowTask.tasks.push(task);
        // Reset for new input
        this.newTask = {
          action: '',
          command: '',
          statusId: '', // Reset statusId for new task
          mapping: {} // Reset data mapping for new task
        };
      },
  
      addDataMapping() {
        if (this.dataMappingKey && this.dataMappingValue) {
          // Add the mapping to the newTask.mapping object directly
          this.newTask.mapping[this.dataMappingKey] = this.dataMappingValue;
          // Reset inputs
          this.dataMappingKey = '';
          this.dataMappingValue = '';
        } else {
          console.error("Both key and value are required for data mapping.");
        }
      },
  
      finalizeFlowTask() {
        if (this.newFlowTask.targetStatus && this.newFlowTask.tasks.length > 0) {
          this.$emit('update-action-task', {
            workItemId: this.selectedItem.id,
            flowTask: { ...this.newFlowTask }
          });
  
          this.resetFlowTaskData(); // Reset after emitting
        } else {
          console.error("Target status and at least one task are required.");
        }
      },
  
      resetFlowTaskData() {
        this.newFlowTask = {
          targetStatus: '',
          method: '',
          dataKey: '',
          tasks: []
        };
        this.newTask = {
          action: '',
          command: '',
          statusId: '', // Reset statusId for new task
          mapping: {} // Reset data mappings for new task
        };
      }
    }
  };
  </script>
  