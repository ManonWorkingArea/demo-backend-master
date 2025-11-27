<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:flex xl:items-center xl:justify-between">
    <div class="w-full">
      <h1 class="text-2xl font-bold mb-4">Flows</h1>
      <ul class="mb-6">
        <li v-for="group in groups" :key="group._id" class="mb-4">
          <div class="flex items-center justify-between">
            <strong>{{ group.name }}</strong>
            <div>
              <button class="btn btn-primary" @click="editGroup(group)">Edit Group</button>
              <button class="btn btn-danger" @click="deleteGroup(group._id)">Delete Group</button>
            </div>
          </div>
          <ul class="pl-6 mt-2">
            <li v-for="flow in group.items" :key="flow._id" class="mb-2 flex items-center justify-between">
              <a href="#" @click.prevent="selectFlow(flow)" class="text-blue-600">{{ flow.name }}</a>
              <div>
                <button class="btn btn-primary" @click="editFlow(flow)">Edit</button>
                <button class="btn btn-danger" @click="deleteFlow(flow._id)">Delete</button>
                <button class="btn btn-secondary" @click="showMoveToGroup(flow)">Move to Group</button>
              </div>
            </li>
          </ul>
        </li>
        <li v-for="flow in ungroupedFlows" :key="flow._id" class="mb-2 flex items-center justify-between">
          <a href="#" @click.prevent="selectFlow(flow)" class="text-blue-600">{{ flow.name }}</a>
          <div>
            <button class="btn btn-primary" @click="editFlow(flow)">Edit</button>
            <button class="btn btn-danger" @click="deleteFlow(flow._id)">Delete</button>
            <button class="btn btn-secondary" @click="showMoveToGroup(flow)">Move to Group</button>
          </div>
        </li>
      </ul>
      <button class="btn btn-primary mb-4" @click="showAddFlowModal">Add New Flow</button>
    </div>

    <!-- Add Flow Modal -->
    <div v-if="showAddFlow" class="modal">
      <div class="modal-content">
        <span class="close" @click="hideAddFlowModal">&times;</span>
        <h2>Add New Flow</h2>
        <form @submit.prevent="addFlow">
          <input v-model="newFlow.name" placeholder="Flow Name" required class="input" />
          <select v-model="newFlow.type" class="input">
            <option value="item">Item</option>
            <option value="group">Group</option>
          </select>
          <select v-if="newFlow.type === 'item'" v-model="newFlow.group" class="input">
            <option value="">No Group</option>
            <option v-for="group in groups" :key="group._id" :value="group._id">{{ group.name }}</option>
          </select>
          <button type="submit" class="btn btn-primary">Add Flow</button>
        </form>
      </div>
    </div>

    <!-- Edit Flow Modal -->
    <div v-if="showEditFlow" class="modal">
      <div class="modal-content">
        <span class="close" @click="hideEditFlowModal">&times;</span>
        <h2>Edit Flow</h2>
        <form @submit.prevent="updateFlow">
          <input v-model="editingFlow.name" placeholder="Flow Name" required class="input" />
          <select v-model="editingFlow.type" disabled class="input">
            <option value="item">Item</option>
            <option value="group">Group</option>
          </select>
          <select v-if="editingFlow.type === 'item'" v-model="editingFlow.group" class="input">
            <option value="">No Group</option>
            <option v-for="group in groups" :key="group._id" :value="group._id">{{ group.name }}</option>
          </select>
          <button type="submit" class="btn btn-primary">Update Flow</button>
        </form>
      </div>
    </div>

    <!-- Edit Group Modal -->
    <div v-if="showEditGroup" class="modal">
      <div class="modal-content">
        <span class="close" @click="hideEditGroupModal">&times;</span>
        <h2>Edit Group</h2>
        <form @submit.prevent="updateGroup">
          <input v-model="editingGroup.name" placeholder="Group Name" required class="input" />
          <button type="submit" class="btn btn-primary">Update Group</button>
        </form>
      </div>
    </div>

    <!-- Move Flow to Group Modal -->
    <div v-if="moveToGroupFlow" class="modal">
      <div class="modal-content">
        <span class="close" @click="cancelMoveToGroup">&times;</span>
        <h2>Move Item to Group</h2>
        <select v-model="selectedGroup" class="input">
          <option value="">Select Group</option>
          <option v-for="group in groups" :key="group._id" :value="group._id">{{ group.name }}</option>
        </select>
        <button @click="moveFlowToGroup" class="btn btn-primary">Move</button>
        <button @click="cancelMoveToGroup" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import requestClient from '@/plugins/requestClient';
import storageManager from '@/plugins/storage';

const Request = new requestClient(false);
const configs = storageManager.get('configs');
const session = storageManager.get('session');

export default {
  data() {
    return {
      flows: [],
      groups: [],
      ungroupedFlows: [],
      newFlow: { name: '', type: 'item', group: '' },
      editingFlow: null,
      editingGroup: null,
      moveToGroupFlow: null,
      selectedGroup: '',
      showAddFlow: false,
      showEditFlow: false,
      showEditGroup: false,
    };
  },
  methods: {
    async fetchFlows() {
      try {
        const response = await Request.POST(
          'flow/query',
          { method: 'find', args: [{ unit: session.current._id || configs.siteID }] },
          configs.key
        );
        if (response.status === 200) {
          this.flows = response.data;
          this.groups = this.flows.filter(flow => flow.type === 'group');
          this.ungroupedFlows = this.flows.filter(flow => flow.type === 'item' && !flow.group);
          this.groups.forEach(group => {
            group.items = this.flows.filter(flow => flow.group === group._id);
          });
        }
      } catch (error) {
        console.error('Error fetching flows:', error);
      }
    },
    showAddFlowModal() {
      this.showAddFlow = true;
    },
    hideAddFlowModal() {
      this.showAddFlow = false;
      this.newFlow = { name: '', type: 'item', group: '' };
    },
    async addFlow() {
      try {
        const response = await Request.POST(
          'flow/',
          { data: { name: this.newFlow.name, type: this.newFlow.type, group: this.newFlow.group, unit: session.current._id || configs.siteID } },
          configs.key
        );
        if (response.status === 200) {
          this.hideAddFlowModal();
          this.fetchFlows();
        }
      } catch (error) {
        console.error('Error adding flow:', error);
      }
    },
    editFlow(flow) {
      this.editingFlow = { ...flow };
      this.showEditFlow = true;
    },
    hideEditFlowModal() {
      this.showEditFlow = false;
      this.editingFlow = null;
    },
    async updateFlow() {
      try {
        const response = await Request.PUT(
          `flow/${this.editingFlow._id}`,
          { data: { name: this.editingFlow.name, group: this.editingFlow.group, unit: session.current._id || configs.siteID } },
          configs.key
        );
        if (response.status === 200) {
          this.hideEditFlowModal();
          this.fetchFlows();
        }
      } catch (error) {
        console.error('Error updating flow:', error);
      }
    },
    async deleteFlow(flowId) {
      try {
        const response = await Request.DELETE(
          `flow/${flowId}`,
          { unit: session.current._id || configs.siteID },
          configs.key
        );
        if (response.status === 200) {
          this.fetchFlows();
        }
      } catch (error) {
        console.error('Error deleting flow:', error);
      }
    },
    editGroup(group) {
      this.editingGroup = { ...group };
      this.showEditGroup = true;
    },
    hideEditGroupModal() {
      this.showEditGroup = false;
      this.editingGroup = null;
    },
    async updateGroup() {
      try {
        const response = await Request.PUT(
          `flow/${this.editingGroup._id}`,
          { data: { name: this.editingGroup.name, unit: session.current._id || configs.siteID } },
          configs.key
        );
        if (response.status === 200) {
          this.hideEditGroupModal();
          this.fetchFlows();
        }
      } catch (error) {
        console.error('Error updating group:', error);
      }
    },
    async deleteGroup(groupId) {
      try {
        // Remove group ID from items in the group before deleting the group
        const itemsToUpdate = this.flows.filter(flow => flow.group === groupId);
        for (const item of itemsToUpdate) {
          await Request.PUT(
            `flow/${item._id}`,
            { data: { group: '', unit: session.current._id || configs.siteID } },
            configs.key
          );
        }

        const response = await Request.DELETE(
          `flow/${groupId}`,
          { unit: session.current._id || configs.siteID },
          configs.key
        );
        if (response.status === 200) {
          this.fetchFlows();
        }
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    },
    selectFlow(flow) {
      this.$emit('select-flow', flow);
      this.updateQueryParams(flow._id);
    },
    showMoveToGroup(flow) {
      this.moveToGroupFlow = flow;
    },
    cancelMoveToGroup() {
      this.moveToGroupFlow = null;
      this.selectedGroup = '';
    },
    async moveFlowToGroup() {
      if (!this.selectedGroup) return;
      try {
        const response = await Request.PUT(
          `flow/${this.moveToGroupFlow._id}`,
          { data: { group: this.selectedGroup, unit: session.current._id || configs.siteID } },
          configs.key
        );
        if (response.status === 200) {
          this.moveToGroupFlow = null;
          this.selectedGroup = '';
          this.fetchFlows();
        }
      } catch (error) {
        console.error('Error moving flow to group:', error);
      }
    },
    updateQueryParams(itemId) {
      const url = new URL(window.location);
      url.searchParams.set('itemid', itemId);
      window.history.pushState({}, '', url);
    }
  },
  mounted() {
    this.fetchFlows();
  },
};
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
  margin-bottom: 5px;
}

li {
  margin-bottom: 0px;
}

a {
  text-decoration: none;
  color: #007bff;
}

a:hover {
  text-decoration: underline;
}

button {
  margin-left: 10px;
}

form {
  margin-top: 20px;
}

input,
select {
  margin-right: 10px;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
  cursor: pointer;
}

/* Button styles */
.btn {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: #fff;
  border: none;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-danger {
  background-color: #dc3545;
  color: #fff;
  border: none;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-secondary {
  background-color: #6c757d;
  color: #fff;
  border: none;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

/* Input styles */
.input {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  margin-bottom: 10px;
  width: 100%;
}
</style>
