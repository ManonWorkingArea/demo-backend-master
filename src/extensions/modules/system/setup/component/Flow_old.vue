<!-- 
Flow.vue 
-->
<template>
    <pre>{{ workItems }}</pre>
    <div>
        <div>
            <!-- Display Work Item Data -->
            <div v-for="workItem in workItems" :key="workItem.id">
                <h2>Work Item: {{ workItem.name }}</h2>
                <div>
                    <!-- Display Status Data for the Work Item -->
                    <h3>Statuses:</h3>
                    <ul>
                        <li v-for="status in workItem.statuses" :key="status.id">
                            {{ status.id }} {{ status.name }}
                        </li>
                    </ul>
                </div>
    
                <!-- Display Flow Tasks Associated with the Work Item -->
                <div v-for="flowTask in workItem.flowTasks" :key="flowTask.targetStatus">
                    <h3>Flow Task for Status: {{ findStatusNameById(workItem, flowTask.targetStatus) }}</h3>
                    <ul>
                        <li v-for="task in flowTask.tasks" :key="task.action">
                            Action: {{ task.action }}, Message: {{ task.message || task.apiUrl }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <WorkItemManager :workItems="workItems" @add-work-item="handleAddWorkItem" @add-status="handleAddStatus" @configure-flow="handleConfigureFlow" />
        <FlowTaskManager v-if="selectedItem" :selectedItem="selectedItem" @update-flow-task="handleUpdateFlowTask" />
        <ActionTaskManager v-if="selectedItem" :selectedItem="selectedItem" @update-action-task="handleUpdateActionTask" />
        <SimulationManager :workItems="workItems" />
    </div>
</template>
  
<script>
import WorkItemManager from './flow/WorkItemManager.vue';
import FlowTaskManager from './flow/FlowTaskManager.vue';
import ActionTaskManager from './flow/ActionTaskManager.vue';
import SimulationManager from './flow/SimulationManager.vue';

export default {
    components: {
        WorkItemManager,
        FlowTaskManager,
        SimulationManager,
        ActionTaskManager
    },
    data() {
        return {
            workItems: [
  {
    "id": 1710412287621,
    "name": "order",
    "statuses": [
      {
        "id": 1710412292931,
        "name": "hold"
      },
      {
        "id": 1710412297144,
        "name": "pending"
      },
      {
        "id": 1710412301561,
        "name": "complete"
      }
    ],
    "flowTasks": [
      {
        "targetStatus": 1710412297144,
        "tasks": [
          {
            "action": "showMessage",
            "message": "ssss"
          }
        ]
      }
    ],
    "properties": [],
    "actionTasks": [
      {
        "targetStatus": "all",
        "method": "complete",
        "dataKey": "id",
        "tasks": [
            {
            "action": "changeStatus",
            "command": "test",
            "statusId": 1710412301561,
            "mapping": {}
          }
        ]
      }
    ]
  }
],
            selectedItem: null,
        };
    },
    methods: {
        findStatusNameById(workItem, statusId) {
            const status = workItem.statuses.find(status => status.id === statusId);
            return status ? status.name : 'Unknown Status';
        },
        handleAddWorkItem(newWorkItem) {
            this.workItems.push(newWorkItem);
        },
        handleAddStatus({ item, status }) {
            const workItem = this.workItems.find(wi => wi.id === item.id);
            if (workItem) {
                workItem.statuses.push(status);
            }
        },
        handleConfigureFlow(item) {
            this.selectedItem = item;
        },
        handleUpdateFlowTask({ workItemId, flowTask }) {
            const workItem = this.workItems.find(item => item.id === workItemId);
            if (!workItem) {
                console.error("Work item not found.");
                return;
            }
            if (!Array.isArray(workItem.flowTasks)) {
                console.error("flowTasks is not an array.");
                return;
            }

            // Check if a flowTask with the same targetStatus already exists
            const existingFlowTask = workItem.flowTasks.find(ft => ft.targetStatus === flowTask.targetStatus);
            if (existingFlowTask) {
                // If found, push the new tasks into the existing flowTask's tasks array
                flowTask.tasks.forEach(task => existingFlowTask.tasks.push(task));
            } else {
                // If no existing flowTask with the same targetStatus, push the new flowTask into the flowTasks array
                workItem.flowTasks.push(flowTask);
            }
        },
        handleUpdateActionTask({ workItemId, flowTask }) {
            const workItem = this.workItems.find(item => item.id === workItemId);
            if (!workItem) {
                console.error("Work item not found.");
                return;
            }

            // Check if actionTasks key exists, if not, create it
            if (!Array.isArray(workItem.actionTasks)) {
                workItem.actionTasks = [];
            }

            // Check if an actionTask with the same targetStatus and method already exists
            const existingActionTaskIndex = workItem.actionTasks.findIndex(at => at.targetStatus === flowTask.targetStatus && at.method === flowTask.method);

            if (existingActionTaskIndex !== -1) {
                // If found, update the tasks array of the existing actionTask
                const existingActionTask = workItem.actionTasks[existingActionTaskIndex];
                flowTask.tasks.forEach(task => {
                    const existingTaskIndex = existingActionTask.tasks.findIndex(t => t.action === task.action && t.command === task.command);
                    if (existingTaskIndex !== -1) {
                        // If the task already exists, update it
                        existingActionTask.tasks[existingTaskIndex] = task;
                    } else {
                        // If the task doesn't exist, add it
                        existingActionTask.tasks.push(task);
                    }
                });
            } else {
                // If no existing actionTask with the same targetStatus and method, push the new actionTask into the actionTasks array
                workItem.actionTasks.push(flowTask);
            }
        },
    },
};
</script>
  
<style>
/* Your styles here */
</style>
  