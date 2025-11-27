<!-- 
FlowTaskManager.vue 
-->
<template>
    <div>
    
        <!-- Task Item Detail List -->
    <div v-if="newFlowTask.tasks.length > 0">
        <h4>Task List:</h4>
        <ul>
            <li v-for="(task, index) in newFlowTask.tasks" :key="index">
                Action: {{ task.action }},
                Detail: {{ task.action === 'callApi' ? task.apiUrl : task.message }}
            </li>
        </ul>
    </div>
    
    
        <!-- Flow Task Configuration: Selecting Target Status -->
        <div v-if="selectedItem">
            <h4>Configure Flow Task for "{{ selectedItem.name }}"</h4>
            <select v-model="newFlowTask.targetStatus">
                <option disabled value="">Select target status</option>
                <option v-for="status in selectedItem.statuses" :value="status.id" :key="status.id">
                    {{ status.name }}
                </option>
            </select>
    
            <!-- Task Details Configuration -->
            <div>
                <h5>Add Task to Flow Task</h5>
                <select v-model="newTask.action">
                    <option value="showMessage">Show Message</option>
                    <option value="consoleLog">Console Log</option>
                    <option value="showAlert">Show Alert</option>
                    <option value="callApi">Call API</option>
                    <!-- Add more actions as needed -->
                </select>
    
                <!-- Message Input -->
                <input v-if="newTask.action === 'showMessage' || newTask.action === 'consoleLog' || newTask.action === 'showAlert'" type="text" v-model="newTask.message" placeholder="Message" />
    
                <!-- API URL Input for Call API Action -->
                <input v-if="newTask.action === 'callApi'" type="text" v-model="newTask.apiUrl" placeholder="API URL" />
    
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
            selectedItem: Object, // Expecting this to be passed correctly from the parent
        },
        data() {
            return {
                newFlowTask: {
                    targetStatus: '',
                    tasks: [],
                },
                newTask: {
                    action: '',
                    message: ''
                },
            };
        },
        methods: {
            addTaskToFlowTask() {
                const task = {
                    action: this.newTask.action,
                    // Include either message or apiUrl based on the action
                    message: this.newTask.action !== 'callApi' ? this.newTask.message : undefined,
                    apiUrl: this.newTask.action === 'callApi' ? this.newTask.apiUrl : undefined,
                };
    
                if ((task.action === 'showMessage' || task.action === 'consoleLog' || task.action === 'showAlert') && !task.message) {
                    console.error("Message is required for this action.");
                    return;
                }
    
                if (task.action === 'callApi' && !task.apiUrl) {
                    console.error("API URL is required for Call API action.");
                    return;
                }
    
                this.newFlowTask.tasks.push(task);
                // Reset for new input
                this.newTask = {
                    action: '',
                    message: '',
                    apiUrl: ''
                };
            },
    
            finalizeFlowTask() {
                if (this.newFlowTask.targetStatus && this.newFlowTask.tasks.length > 0) {
                    this.$emit('update-flow-task', {
                        workItemId: this.selectedItem.id,
                        flowTask: {
                            ...this.newFlowTask
                        },
                    });
    
                    // Hypothetical immediate execution for demonstration:
                    this.newFlowTask.tasks.forEach(task => {
                        switch (task.action) {
                            case 'consoleLog':
                                console.log(task.message);
                                break;
                            case 'showAlert':
                                alert(task.message);
                                break;
                            case 'callApi':
                                // Placeholder for API call logic
                                console.log('Calling API:', task.message);
                                break;
                                // Handle other actions as needed
                        }
                    });
    
                    this.resetFlowTaskData(); // Reset after emitting
                } else {
                    console.error("Target status and at least one task are required.");
                }
            },
    
            resetFlowTaskData() {
                this.newFlowTask = {
                    targetStatus: '',
                    tasks: []
                };
                this.newTask = {
                    action: '',
                    message: ''
                };
            },
        },
    };
    </script>
      
      
    <style scoped>
    /* Add styling here */
    </style>