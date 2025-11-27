<!-- 
SimulationManager.vue 
-->
<template>
    <div>
        <div v-for="(item, index) in demoData" :key="index">
            <!-- <pre>{{ item }}</pre> -->
            <!-- Display Work Item Data -->
            <h2>Workflow Simulation - {{ item.name }}</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Flow</th>
                        <th>Work Item</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{{ item.id }}</td>
                        <td>{{ item.flow }}</td>
                        <td>{{ item.name }}</td>
                        <td>
                            <select v-model="item.status">
                                <option disabled value="">Select Status</option>
                                <option v-for="status in matchedWorkItemStatuses(item.flow)" :key="status.id" :value="status.name">
                                    {{ status.name }}
                                </option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Simulation Log -->
            <div v-if="simulationLog[index] && simulationLog[index].length">

                <h4>Simulation Log:</h4>
                <ul>
                    <li v-for="log in simulationLog[index]" :key="log.id">{{ log.message }}</li>
                </ul>
            </div>
            

            <!-- Button based on targetStatus -->
            <button v-for="actionTask in filteredActionTasks(item.flow, item.status)" :key="actionTask.method" @click="executeTaskWrapper(actionTask, index)">
                {{ actionTask.method }}
            </button>
        </div>
    </div>
</template>

<script>
import workflowFunctions from './workflow.js';
const { executeTask, executeCommand, executeAction, callApi, changeStatus, executeRespond, simulateApiCall } = workflowFunctions;


export default {
    props: {
        workItems: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            demoData: [
                {
                    id: '1234',
                    name: 'Test Name 1',
                    flow: 'order',
                    status: 'hold',
                },
                {
                    id: '5678',
                    name: 'Test Name 2',
                    flow: 'order',
                    status: 'hold',
                },
                // Add more items as needed
            ],
            simulationLog: [],
        };
    },
    computed: {
        matchedWorkItemStatuses() {
            return (flow) => {
                const matchedWorkItem = this.workItems.find(item => item.name === flow) || null;
                return matchedWorkItem ? matchedWorkItem.statuses : [];
            };
        },
        filteredActionTasks() {
            return (flow, status) => {
                const matchedWorkItem = this.workItems.find(item => item.name === flow) || null;
                const statusId = this.matchedWorkItemStatuses(flow).find(s => s.name === status)?.id;

                let actionTasks = [];
                if (statusId === 'all') {
                    actionTasks = matchedWorkItem ? matchedWorkItem.actionTasks : [];
                } else {
                    actionTasks = matchedWorkItem ? matchedWorkItem.actionTasks.filter(task => task.targetStatus === statusId || task.targetStatus === 'all') : [];
                }
                return actionTasks;
            };
        },
    },
    watch: {
        demoData: {
            handler: 'simulateWorkflow',
            deep: true,
            immediate: true,
        },
    },
    methods: {
        simulateWorkflow() {
            this.demoData.forEach((item, index) => {
                const matchedWorkItem = this.workItems.find(item => item.name === this.demoData[index].flow) || null;
                if (!matchedWorkItem) {
                    console.error("No matched work item found for:", this.demoData[index].flow);
                    return;
                }
                
                const statusId = this.matchedWorkItemStatuses(this.demoData[index].flow).find(status => status.name === this.demoData[index].status)?.id;
                const flowTasks = matchedWorkItem.flowTasks.filter(task => task.targetStatus === statusId);

                // Initialize simulationLog at index with an empty array if not already initialized
                if (!Array.isArray(this.simulationLog[index])) {
                    this.simulationLog[index] = [];
                }

                flowTasks.forEach((task, taskIndex) => {
                    task.tasks.forEach((subTask, subIndex) => {
                        let logMessage = `Step ${taskIndex + 1}-${subIndex + 1}: ${subTask.action} - ${subTask.message}`;
                        this.simulationLog[index].push({
                            id: `${taskIndex}-${subIndex}`,
                            message: logMessage,
                        });
                    });
                });
            });
        },
        executeTaskWrapper(actionTask, index) {
            executeTask(actionTask, index, this.demoData, this.matchedWorkItemStatuses, executeCommand, changeStatus, executeRespond, executeAction);
            this.$forceUpdate();
        },

        // Similarly update other wrapper methods to use the directly imported function names
        executeCommandWrapper(command, mapping, index) {
            executeCommand(command, mapping, index, this.demoData);
            this.$forceUpdate();
        },

        executeActionWrapper(action, command, dataKey, index) {
            executeAction(action, command, dataKey, index, this.demoData);
            this.$forceUpdate();
        },

        changeStatusWrapper(newStatus, index) {
            changeStatus(newStatus, index, this.demoData);
            this.$forceUpdate();
        },

        executeRespondWrapper(command, mapping, index) {
            executeRespond(command, mapping, index, this.demoData).then(() => {
                this.$forceUpdate();
            });
        },

        callApiWrapper(endpoint, requestBody) {
            callApi(endpoint, requestBody);
        },

        simulateApiCallWrapper(endpoint) {
            return simulateApiCall(endpoint);
        },
    },
};
</script>
