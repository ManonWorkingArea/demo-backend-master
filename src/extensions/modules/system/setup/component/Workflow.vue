<template>
    <div>
        <!-- Add New Work Item -->
        <div>
            <input type="text" v-model="newWorkItemName" placeholder="Enter work item name" />
            <button @click="addWorkItem">Add Work Item</button>
        </div>

        <hr>
    
        <!-- Work Items -->
        <div v-for="item in workItems" :key="item.id">
            <h3>{{ item.name }}</h3>
    
            <!-- Add Status to Work Item -->
            <div>
                <input type="text" v-model="newStatusName" placeholder="Enter status name" />
                <button @click="addStatus(item)">Add Status</button>
            </div>
    
            <!-- List of Statuses -->
            <div v-if="item.statuses.length">
                <h4>Statuses:</h4>
                <ul>
                    <li v-for="status in item.statuses" :key="status.id">{{ status.name }}</li>
                </ul>
            </div>
    
            <!-- Add Flow Task Item -->
            <div>
                <button @click="prepareAddFlowItem(item)">Add Flow Task</button>
            </div>
    
            <!-- Flow Tasks Configuration: Selecting Status -->
            <div v-if="item === currentItemConfiguring">
                <h4>Configure Flow Task:</h4>
                <select v-model="newFlowTask.targetStatus">
                <option disabled value="">Select target status</option>
                <option v-for="status in item.statuses" :value="status.id" :key="status.id">
                  {{ status.name }}
                </option>
              </select>
                <button @click="finalizeFlowTask(item)">Finalize Flow Task</button>
            </div>
    
            <!-- Displaying Configured Flow Tasks -->
            <div v-if="item.flowTasks.length">
                <h4>Flow Tasks:</h4>
                <ul>
                    <li v-for="flowTask in item.flowTasks" :key="flowTask.id">
                        On status "{{ findStatusNameById(item, flowTask.targetStatus) }}":
                        <ul>
                            <li v-for="task in flowTask.tasks" :key="task.id">
                                {{ task.action }}: {{ task.message }}
                            </li>
                        </ul>
                    </li>
                </ul>
                <!-- Add Task to Flow Item -->
                <div v-if="currentFlowTaskId">
                    <h4>Add Task to Flow:</h4>
                    <select v-model="newTask.action">
                  <option value="showMessage">Show Message</option>
                  <!-- Additional actions as needed -->
                </select>
                    <input type="text" v-model="newTask.message" placeholder="Message" />
                    <button @click="addTaskToFlowItem(item)">Add Task</button>
                </div>
            </div>
        </div>

        <hr>
    
        <!-- Simulation Area -->
        <div v-if="workItems.length">
            <h2>Workflow Simulation</h2>
            <select v-model="selectedWorkItem">
              <option disabled value="">Select Work Item</option>
              <option v-for="item in workItems" :value="item.id" :key="item.id">
                {{ item.name }}
              </option>
            </select>
    
            <select v-if="selectedWorkItem" v-model="simulationStatus">
              <option disabled value="">Change Status To</option>
              <option v-for="status in findWorkItemById(selectedWorkItem).statuses" :value="status.id" :key="status.id">
                {{ status.name }}
              </option>
            </select>
    
            <button v-if="simulationStatus" @click="simulateWorkflow">Simulate</button>
        </div>
    
        <!-- Simulation Log -->
        <div v-if="simulationLog.length">
            <h4>Simulation Log:</h4>
            <ul>
                <li v-for="log in simulationLog" :key="log.id">
                    {{ log.message }}
                </li>
            </ul>
        </div>
    </div>
</template>
  
<script>
export default {
    data() {
        return {
            workItems: [],
            newWorkItemName: '',
            newStatusName: '',
            currentItemConfiguring: null,
            currentFlowTaskId: null,
            newFlowTask: {
                targetStatus: '',
                tasks: [],
            },
            newTask: { action: '', message: '' },
            selectedWorkItem: '',
            simulationStatus: '',
            simulationLog: [],
        };
    },
    methods: {
        addWorkItem() {
            this.workItems.push({
                id: Date.now(),
                name: this.newWorkItemName,
                statuses: [],
                flowTasks: [],
            });
            this.newWorkItemName = '';
        },
        addStatus(item) {
            if (this.newStatusName.trim()) {
                item.statuses.push({
                    id: Date.now(),
                    name: this.newStatusName,
                });
                this.newStatusName = '';
            }
        },
        prepareAddFlowItem(item) {
            this.currentItemConfiguring = item;
            this.newFlowTask = { targetStatus: '', tasks: [] };
        },
        finalizeFlowTask(item) {
            if (this.newFlowTask.targetStatus) {
                const flowTask = {
                    ...this.newFlowTask,
                    id: Date.now(),
                };
                item.flowTasks.push(flowTask);
                this.currentFlowTaskId = flowTask.id; // Set for adding tasks
                this.currentItemConfiguring = null;
            }
        },
        addTaskToFlowItem(item) {
            const flowTask = item.flowTasks.find(task => task.id === this.currentFlowTaskId);
            if (flowTask && this.newTask.action) {
                flowTask.tasks.push({
                    ...this.newTask,
                    id: Date.now(),
                });
                this.newTask = { action: '', message: '' }; // Reset task form
            }
        },
        findStatusNameById(item, statusId) {
            const status = item.statuses.find(status => status.id === statusId);
            return status ? status.name : 'Unknown';
        },
        findWorkItemById(id) {
            return this.workItems.find(item => item.id === id) || null;
        },
        simulateWorkflow() {
            console.log("simulateWorkflow is called");
            const item = this.findWorkItemById(this.selectedWorkItem);
            if (!item) {
                console.error('Selected work item not found');
                this.simulationLog.push({ id: Date.now(), message: 'Selected work item not found' });
                return;
            }

            console.log("Selected item:", item);
            console.log("Simulation status:", this.simulationStatus);

            if (!Array.isArray(item.flowTasks)) {
                console.error('Flow tasks are undefined or not an array');
                this.simulationLog.push({ id: Date.now(), message: 'Flow tasks are undefined or not an array' });
                return;
            }

            this.simulationLog = []; // Reset simulation log

            item.flowTasks.forEach(flowTask => {
                console.log("FlowTask targetStatus:", flowTask.targetStatus);
                if (flowTask.targetStatus === this.simulationStatus) {
                    console.log("flowTask",flowTask)
                    if (Array.isArray(flowTask.tasks)) {
                        flowTask.tasks.forEach((step, index) => {
                            console.log(`Executing step ${index + 1}:`, step);
                            const logMessage = `Executing step ${index + 1} of flow task '${flowTask.targetStatus}': ${step.description}`;
                            switch (step.action) {
                                case 'showMessage':
                                    this.simulationLog.push({ id: Date.now() + index, message: `Message: ${step.message}` });
                                    break;
                                default:
                                    this.simulationLog.push({ id: Date.now() + index, message: logMessage });
                                    break;
                            }
                        });
                    }
                } else {
                    console.log("No steps found for this flowTask or steps not an array");
                }
            });

            this.simulationStatus = ''; 
        }
    },
};
</script>