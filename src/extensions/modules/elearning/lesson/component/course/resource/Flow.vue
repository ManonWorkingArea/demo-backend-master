<template>
  <div id="output"></div>
  <div class="flow-container">
    <div :class="{'actions-panel': true, 'hidden': editingStep !== null}">
      <div class="column actions-column">
        <h3>Actions</h3>
        <ul>
          <li 
            v-for="(action, index) in filteredActions" 
            :key="index" 
            @click="canAddAction ? addAction(action) : null"
            :class="{'disabled': !canAddAction}"
          >
            {{ action.name }} ({{ action.code }})
          </li>
        </ul>
      </div>
    </div>
    <div :class="{'left-panel': true, 'expanded-left-panel': editingStep !== null}">
      <div class="column flow-steps-column">
        <h3>Flow Steps</h3>
        <div class="flow-steps">
          <div v-for="(step, index) in flowSteps" :key="index" class="flow-step">
            <div class="step-item">
              <div class="step-header">
                {{ step.name }}
                <button @click="removeStep(index)">Delete</button>
              </div>
              <div class="step-content">
                <StepConfig 
                  :action="step" 
                  :mode="'preview'" 
                  :step-index="index" 
                  :flow-steps="flowSteps" 
                  @update-action="updateStep(index, $event)" 
                />
              </div>
              <div class="step-footer">
                <button @click="moveUp(index)" :disabled="index === 0">Up</button>
                <button @click="moveDown(index)" :disabled="index === flowSteps.length - 1">Down</button>
                <button @click="editStep(index)">Edit</button>
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
            <button @click="saveEdit">Save</button>
            <button @click="cancelEdit">Cancel</button>
          </div>
        </div>
        <StepConfig 
          :action="editingContent" 
          :mode="'editor'" 
          :step-index="editingStep" 
          :flow-steps="flowSteps" 
          @update-action="updateEditingContent" 
        />
        <LogicActionsEditor
          v-if="editingContent.output.type === 'logic'"
          :actions="actions"
          :current-actions="{
            trueActions: editingContent.output.trueActions,
            falseActions: editingContent.output.falseActions
          }"
          @update-actions="updateActions"
          @edit-sub-action="editSubAction"
        />
      </div>
    </div>
    <div>
      <button @click="runFlow">Run Flow</button>
      <pre>{{ flowSteps }}</pre>
    </div>
  </div>
</template>

<script>
import Flow from './flow/Flow.js';
import StepConfig from './flow/StepConfig.vue';
import LogicActionsEditor from './flow/LogicActionsEditor.vue';

export default {
  name: 'Flow',
  components: {
    StepConfig,
    LogicActionsEditor
  },
  data() {
    return {
      actions: [
        { name: 'Continue', code: 'continue' },
        { name: 'Stop', code: 'stop' },
        { name: 'Wait', code: 'wait', request: { seconds: 0 } },
        { name: 'Call', code: 'call', request: { url: '', data: '', method:'' } },
        { name: 'Goto', code: 'goto', request: { routeOrUrl: '', target: 'self' } },
        { name: 'Email', code: 'email', request: { email: '', subject: '', body: '' } },
        { name: 'Alert', code: 'alert', request: { text: '' } },
        { name: 'Debug', code: 'debug', request: { text: '' } },
        { name: 'Prompt', code: 'prompt', request: { text: '' } },
        { name: 'Condition', code: 'condition', request: { value: '' } },
        { name: 'Display', code: 'display', request: { selector: '', text: '' } }
      ],
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
        }
      }
    };
  },
  computed: {
    filteredActions() {
      const nonRepeatableActions = ['prompt', 'debug', 'alert', 'wait'];
      return this.actions.filter(action => nonRepeatableActions.includes(action.code) || !this.flowSteps.some(step => step.code === action.code));
    },
    canAddAction() {
      return !(this.flowSteps.length > 0 && this.flowSteps[this.flowSteps.length - 1].code === 'goto');
    }
  },
  methods: {
    addAction(action) {
      this.flowSteps.push({ 
        name: action.name, 
        code: action.code,
        input: '', 
        export: false,
        process: '', 
        request: action.request,
        output: {
          type: 'continue',
          logic: 'true',
          trueActions: [],
          falseActions: []
        }
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
        }
      };
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
    }
  }
};
</script>

<style scoped>
.flow-container {
  display: flex;
  height: 100vh;
}
.actions-panel {
  display: flex;
  width: 30%;
  border-right: 1px solid #ccc;
  padding: 10px;
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
  padding: 10px;
  box-sizing: border-box;
}
.expanded-left-panel {
  width: 20%;
}
.column {
  padding: 10px;
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
}
.flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.step-item {
  width: 200px;
  border: 1px solid #000;
  position: relative;
  margin-bottom: 0px;
  padding: 10px;
  box-sizing: border-box;
  background-color: #fff;
}
.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
  margin-bottom: 10px;
}
.step-content {
  margin-bottom: 10px;
}
.step-footer {
  display: flex;
  justify-content: space-between;
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
  margin-top: 10px;
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
.true-action-container, .false-action-container {
  display: flex;
  flex-direction: row;
}
.true-action-container .actions-column, .false-action-container .actions-column {
  width: 10%;
  padding: 10px;
}
.true-action-container .true-steps-column, .false-action-container .false-steps-column {
  width: 30%;
  padding: 10px;
}
.true-action-container .edit-column, .false-action-container .edit-column {
  width: 60%;
  padding: 10px;
}
.true-steps, .false-steps {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.true-step, .false-step {
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
</style>
