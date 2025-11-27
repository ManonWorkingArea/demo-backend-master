<template>
  <div>
    <Subhead />
    <div v-if="selectedFlow === null">
      <FlowList @select-flow="selectFlow" />
    </div>
    <div v-else class="bg-white border-b border-gray-200 relative">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div class="flex justify-between items-center mb-4">
          <button @click="deselectFlow" class="btn btn-secondary">Back to Flow List</button>
          <button @click="saveFlow" class="btn btn-primary">Save</button>
        </div>
        <div id="output"></div>
        <div class="flow-container">
          <div :class="{'actions-panel': true, 'hidden': editingStep !== null}">
            <div class="column actions-column">
              <ActionList
                :flow-steps="flowSteps"
                :can-add-action="canAddAction"
                @add-action="addAction"
              />
              <Preview :flow-steps="flowSteps" @run-flow="runFlow" />
            </div>
          </div>
          <div :class="{'left-panel': true, 'expanded-left-panel': editingStep !== null}">
            <div class="column flow-steps-column">
              <div class="flow-steps">
                <div
                  v-for="(step, index) in flowSteps"
                  :key="index"
                  :class="['flow-step', {'inactive-step': !step.status}]"
                  @click="updateUrlWithItem(step._id)"
                >
                  <div
                    :class="['step-item', { 'active-step': index === editingStep }]">
                    <div class="step-header">
                      Step {{ index + 1 }}: {{ step.name }}
                      <button @click.stop="removeStep(index)"><font-awesome-icon :icon="['fas','trash']" /></button>
                    </div>
                    <div class="step-content">
                      <div class="sub-step">
                        <StepConfig
                          :action="step"
                          :mode="'preview'"
                          :get-available-tags="getAvailableTags"
                          :action-index="index"
                          :active-step="editingContent"
                          @update-action="updateStep(index, $event)"
                        />
                      </div>
                      <!-- <div class="status-toggle">
                        <label>Status:</label>
                        <input type="checkbox" v-model="step.status" @change="updateStep(index, step)" />
                      </div> -->
                    </div>
                    <div class="step-footer">
                      <button @click.stop="moveUp(index)" :disabled="index === 0">
                        <font-awesome-icon :icon="['fas','chevron-up']" />
                      </button>
                      <button @click.stop="moveDown(index)" :disabled="index === flowSteps.length - 1">
                        <font-awesome-icon :icon="['fas','chevron-down']" />
                      </button>
                      <button 
                        @click.stop="editStep(index)" 
                        :disabled="!step.config" 
                        :class="{ 'disabled-button': !step.config }">
                        <font-awesome-icon :icon="['fas', 'pencil']" />
                      </button>
                    </div>
                  </div>
                  <div v-if="index < flowSteps.length - 1" class="connector"></div>
                </div>
              </div>
            </div>
          </div>
          <div :class="{'right-panel': true, 'expanded-right-panel': editingStep !== null}">
            <div class="edit-step-item" v-if="editingStep !== null">
              <div class="step-header">
                <div class="header-left">
                  <h3>Edit Step: {{ editingContent.name }}</h3>
                </div>
                <div class="header-right">
                  <button @click="saveEdit"><font-awesome-icon :icon="['fas','save']" /></button>
                  <button @click="cancelEdit"><font-awesome-icon :icon="['fas','times']" /></button>
                </div>
              </div>
              <StepConfig
                :action="editingContent"
                :mode="'editor'"
                :get-available-tags="getAvailableTags"
                :action-index="editingStep"
                @update-action="updateEditingContent"
              />
              <LogicActionsEditor
                v-if="editingContent.output.type === 'logic'"
                :flow-steps="flowSteps"
                :current-actions="{
                  trueActions: editingContent.output.trueActions,
                  falseActions: editingContent.output.falseActions
                }"
                :get-available-tags="getAvailableTags"
                @update-actions="updateActions"
                @edit-sub-action="editSubAction"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Subhead from '@/interface/template/outline/Subhead.vue';
import Flow from './flow/Flow.js';
import StepConfig from './flow/StepConfig.vue';
import LogicActionsEditor from './flow/LogicActionsEditor.vue';
import Preview from './flow/Preview.vue';
import ActionList from './flow/ActionList.vue';
import FlowList from './flow/FlowList.vue';
import requestClient from '@/plugins/requestClient';
import storageManager from '@/plugins/storage';

const Request = new requestClient(false);
const configs = storageManager.get('configs');
const session = storageManager.get('session');

export default {
  name: 'Flow',
  components: {
    Subhead,
    StepConfig,
    LogicActionsEditor,
    Preview,
    ActionList,
    FlowList
  },
  data() {
    return {
      flowSteps: [],
      editingStep: null,
      editingContent: {
        name: '',
        code: '',
        input: '',
        export: false,
        process: '',
        request: null,
        output: {
          type: 'continue',
          logic: 'true',
          trueActions: [],
          falseActions: []
        },
        status: true // Initialize status
      },
      selectedFlow: null
    };
  },
  computed: {
    canAddAction() {
      return !(this.flowSteps.length > 0 && this.flowSteps[this.flowSteps.length - 1].code === 'goto');
    }
  },
  methods: {
    async selectFlow(flow) {
      this.selectedFlow = flow;
      this.flowSteps = flow.steps || [];
      this.updateUrlWithItem(flow._id);
    },
    deselectFlow() {
      const url = new URL(window.location);
      const backUrl = url.searchParams.get('back');
      this.selectedFlow = null;
      this.removeQueryParams();
      if (backUrl) {
        this.$router.push(decodeURIComponent(backUrl));
      }
    },
    async saveFlow() {
      if (this.selectedFlow) {
        try {
          const response = await Request.PUT(
            `flow/${this.selectedFlow._id}`,
            { data: { steps: this.flowSteps, unit: session.current._id || configs.siteID } },
            configs.key
          );
          if (response.status === 200) {
            this.selectedFlow.steps = this.flowSteps;
            this.deselectFlow(); // Return to flow list after saving
          }
        } catch (error) {
          console.error('Error saving flow:', error);
        }
      }
    },
    addAction(action) {
      this.flowSteps.push({
        name: action.name,
        code: action.code,
        config: action.config,
        input: '',
        export: false,
        process: '',
        request: action.request,
        output: {
          type: 'continue',
          logic: 'true',
          trueActions: [],
          falseActions: []
        },
        status: true // Initialize status
      });
    },
    moveUp(index) {
      if (index > 0) {
        const temp = this.flowSteps[index - 1];
        this.flowSteps.splice(index - 1, 1, this.flowSteps[index]);
        this.flowSteps.splice(index, 1, temp);
      }
    },
    moveDown(index) {
      if (index < this.flowSteps.length - 1) {
        const temp = this.flowSteps[index + 1];
        this.flowSteps.splice(index + 1, 1, this.flowSteps[index]);
        this.flowSteps.splice(index, 1, temp);
      }
    },
    removeStep(index) {
      this.flowSteps.splice(index, 1);
    },
    editStep(index) {
      this.editingStep = index;
      this.editingContent = JSON.parse(JSON.stringify(this.flowSteps[index]));
    },
    saveEdit() {
      if (this.editingStep !== null) {
        this.flowSteps.splice(this.editingStep, 1, this.editingContent);
        this.editingStep = null;
        this.resetEditingContent();
      }
    },
    cancelEdit() {
      this.editingStep = null;
      this.resetEditingContent();
    },
    resetEditingContent() {
      this.editingContent = {
        name: '',
        code: '',
        input: '',
        export: false,
        process: '',
        request: null,
        output: {
          type: 'continue',
          logic: 'true',
          trueActions: [],
          falseActions: []
        },
        status: true // Reset status
      };
    },
    getAvailableTags(stepCode) {
      const tags = ['${data}'];
      this.flowSteps.forEach((step) => {
        if (step.export && step.code !== stepCode) {
          tags.push(`\${export.${step.code}}`);
          const exportData = step.input;
          try {
            const parsedExportData = JSON.parse(exportData);
            for (let key in parsedExportData) {
              tags.push(`\${export.${step.code}.${key}}`);
            }
          } catch (e) {
            // Handle non-JSON export data
          }
        }
      });
      return tags;
    },
    runFlow() {
      const flow = new Flow(this.flowSteps);
      const initialData = { status: false }; // Replace with actual initial data
      flow.run(initialData);
    },
    updateStep(index, updatedAction) {
      this.flowSteps.splice(index, 1, updatedAction);
    },
    updateEditingContent(updatedAction) {
      this.editingContent = updatedAction;
    },
    updateActions(updatedActions) {
      this.editingContent.output.trueActions = updatedActions.trueActions;
      this.editingContent.output.falseActions = updatedActions.falseActions;
    },
    isEditing(index) {
      return this.editingStep === index;
    },
    updateUrlWithItem(itemId) {
      const url = new URL(window.location);
      url.searchParams.set('itemid', itemId);
      window.history.pushState({}, '', url);
    },
    removeQueryParams() {
      const url = new URL(window.location);
      url.searchParams.delete('itemid');
      window.history.pushState({}, '', url);
    },
    async fetchFlowById(itemId) {
      try {
        const response = await Request.GET(`flow/${itemId}`, configs.key);
        if (response.status === 200) {
          this.selectFlow(response.data);
        }
      } catch (error) {
        console.error('Error fetching flow:', error);
      }
    }
  },
  async mounted() {
    const url = new URL(window.location);
    const itemId = url.searchParams.get('itemid');
    if (itemId) {
      await this.fetchFlowById(itemId);
    }
  }
};
</script>

<style scoped>
.flow-container {
  display: flex;
  min-height: 100vh;
}
.actions-panel {
  display: flex;
  width: 30%;
  padding: 0px;
  box-sizing: border-box;
}
.hidden {
  width: 0;
  overflow: hidden;
  padding: 0;
  border: none;
}
.left-panel {
  display: flex;
  width: 70%;
  border-right: 1px solid #ccc;
  padding: 0px;
  box-sizing: border-box;
}
.expanded-left-panel {
  width: 30%;
}
.column {
  padding: 0px;
}
.actions-column {
  width: 100%;
}
.flow-steps-column {
  width: 100%;
}
.right-panel {
  width: 70%;
  padding: 10px;
  box-sizing: border-box;
  background-color: #f9f9f9;
}
.expanded-right-panel {
  width: 80%;
}
.left-panel ul {
  list-style: none;
  padding: 0;
}
.left-panel li {
  padding: 5px;
  cursor: pointer;
}
.left-panel li:hover {
  background-color: #f0f0f0;
}
.disabled {
  pointer-events: none;
  color: grey;
}
.flow-steps {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f0f0f0;
  padding: 25px;
  height: 100%;
}
.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.step-item {
  width: 220px;
  border: 1px solid #7a7a7a;
  position: relative;
  margin-bottom: 0px;
  padding: 0px;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 3px;
}
.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  border-bottom: 1px solid #ccc;
  padding-bottom: 0px;
  margin-bottom: 0px;
  font-size: 12px;
  padding-left: 5px;
  padding-right: 5px;
  color: #4a5464;
}
.step-content {
  margin-bottom: 0px;
}
.step-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #ccc;
  font-size: 12px;
  padding-left: 5px;
  padding-right: 5px;
  color: #4a5464;
}
.connector {
  width: 2px;
  height: 20px;
  background-color: #000;
  position: relative;
  margin-bottom: 0px;
}
.step-item button {
  margin: 5px;
}
.sub-step {
  margin-top: 0px;
}
.tags-container {
  margin-top: 10px;
}
.tags-container ul {
  list-style: none;
  padding: 0;
}
.tags-container li {
  display: inline-block;
  background-color: #f0f0f0;
  padding: 5px;
  margin: 2px;
  border-radius: 5px;
}
.edit-step-item {
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #ccc;
  padding: 10px;
  box-sizing: border-box;
}
.edit-step-item .step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
  margin-bottom: 10px;
}
.edit-step-item .step-content {
  margin-bottom: 10px;
}
.edit-step-item .step-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #ccc;
  font-size: 12px;
  padding-left: 5px;
  padding-right: 5px;
  color: #4a5464;
}
.edit-content label {
  display: block;
  margin-bottom: 10px;
}
.edit-content input,
.edit-content textarea,
.edit-content select {
  margin-left: 10px;
  width: 100%;
}
.true-action-container,
.false-action-container {
  display: flex;
  flex-direction: row;
}
.true-action-container .actions-column,
.false-action-container .actions-column {
  width: 10%;
  padding: 10px;
}
.true-action-container .true-steps-column,
.false-action-container .false-steps-column {
  width: 30%;
  padding: 10px;
}
.true-action-container .edit-column,
.false-action-container .edit-column {
  width: 60%;
  padding: 10px;
}
.true-steps,
.false-steps {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.true-step,
.false-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.tabs {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
}
.tabs button {
  padding: 10px;
  cursor: pointer;
  border: 1px solid #ccc;
  background: #f9f9f9;
}
.tabs .active-tab {
  background: #e0e0e0;
  font-weight: bold;
}
.edit-sub-action-modal {
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
.edit-sub-action-modal .edit-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
}
.header-right {
  display: flex;
  gap: 10px; /* Adjust the gap value as needed */
}

.header-right button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  margin: 0 5px; /* Adjust the margin value as needed */
}

.header-right button:hover {
}

/* Add this rule to adjust width when actions-panel is hidden */
.actions-panel.hidden ~ .left-panel .flow-step .step-item {
  width: 200px; /* Adjusted width */
}

.inactive-step {
  opacity: 0.3;
}

/* Styles for active step */
.active-step {
  position: relative;
  border: 3px solid #298d60;
  scale: 1.09;
  z-index: 99999;
}

.disabled-button {
  opacity: 0.5;
  pointer-events: none;
}
</style>
