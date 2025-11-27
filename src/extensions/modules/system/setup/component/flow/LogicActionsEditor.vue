<template>
    <div>
      <div class="tabs">
        <button @click="selectTab('true')" :class="{'active-tab': selectedTab === 'true'}">
          <font-awesome-icon :icon="['fas', 'circle-check']" /> True
        </button>
        <button @click="selectTab('false')" :class="{'active-tab': selectedTab === 'false'}">
          <font-awesome-icon :icon="['fas', 'circle-xmark']" /> False
        </button>
      </div>
      <div class="sub-step-container">
        <div class="actions-column">
          <ActionList
            :flow-steps="currentActions[selectedTab + 'Actions']"
            :can-add-action="true"
            @add-action="addAction($event, selectedTab)"
          />
        </div>
        <div class="steps-column">
          <div v-if="selectedTab === 'true'">
            <div v-for="(action, index) in currentActions.trueActions" :key="index" class="step-wrapper">
              <div :class="['step-item', {'inactive-step': !action.status}]">
                <div class="step-header">
                  {{ action.name }} ({{ action.code }})
                  <button @click="removeAction(index, 'true')"><font-awesome-icon :icon="['fas','trash']"/></button>
                </div>
                <div class="step-content">
                  <StepConfig 
                    :action="action" 
                    :mode="'preview'" 
                    :get-available-tags="getAvailableTags"
                    :action-index="index"
                    @update-action="updateAction(index, 'true', $event)" 
                  />
                </div>
                <div class="step-footer">
                  <button @click="moveUp(index, 'true')" :disabled="index === 0"><font-awesome-icon :icon="['fas','chevron-up']"/></button>
                  <button @click="moveDown(index, 'true')" :disabled="index === currentActions.trueActions.length - 1"><font-awesome-icon :icon="['fas','chevron-down']"/></button>
                  <button @click="editSubAction(index, 'true')">Edit x</button>
                </div>
              </div>
              <div v-if="index < currentActions.trueActions.length - 1" class="connector"></div>
            </div>
          </div>
          <div v-if="selectedTab === 'false'">
            <div v-for="(action, index) in currentActions.falseActions" :key="index" class="step-wrapper">
              <div :class="['step-item', {'inactive-step': !action.status}]">
                <div class="step-header">
                  {{ action.name }} ({{ action.code }})
                  <button @click="removeAction(index, 'false')"><font-awesome-icon :icon="['fas','trash']"/></button>
                </div>
                <div class="step-content">
                  <StepConfig 
                    :action="action" 
                    :mode="'preview'" 
                    :get-available-tags="getAvailableTags"
                    :action-index="index"
                    @update-action="updateAction(index, 'false', $event)" 
                  />
                </div>
                <div class="step-footer">
                  <button @click="moveUp(index, 'false')" :disabled="index === 0"><font-awesome-icon :icon="['fas','chevron-up']"/></button>
                  <button @click="moveDown(index, 'false')" :disabled="index === currentActions.falseActions.length - 1"><font-awesome-icon :icon="['fas','chevron-down']"/></button>
                  <button @click="editSubAction(index, 'false')">Edit x</button>
                </div>
              </div>
              <div v-if="index < currentActions.falseActions.length - 1" class="connector"></div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="editingSubAction !== null" class="edit-sub-action-modal">
        <div class="edit-content">
          <div class="modal-header">
            <h3>Edit Sub Action: {{ editingSubAction.name }}</h3>
            <button @click="cancelSubActionEdit"><font-awesome-icon :icon="['fas','times']"/></button>
          </div>
          <div class="modal-body">
            <StepConfig 
              :action="editingSubAction" 
              :mode="'editor'" 
              :get-available-tags="getAvailableTags"
              :action-index="editingSubActionIndex"
              @update-action="updateEditingSubAction($event)" 
            />
          </div>
          <div class="modal-footer">
            <button @click="saveSubActionEdit"><font-awesome-icon :icon="['fas','save']"/> Save</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import StepConfig from './StepConfig.vue';
  import ActionList from './ActionList.vue'; // Import the ActionList component
  
  export default {
    name: 'LogicActionsEditor',
    components: {
      StepConfig,
      ActionList // Register the ActionList component
    },
    props: {
      flowSteps: {
        type: Array,
        required: true
      },
      currentActions: {
        type: Object,
        required: true
      },
      getAvailableTags: {
        type: Function,
        required: true
      }
    },
    data() {
      return {
        selectedTab: 'true',
        editingSubAction: null,
        editingSubActionIndex: null,
        editingSubActionParent: null
      };
    },
    methods: {
      selectTab(tab) {
        this.selectedTab = tab;
      },
      addAction(action, parent) {
        const newAction = { 
          name: action.name, 
          code: action.code,
          config: action.config,
          process: '', 
          request: action.request,
          export: false,
          status: true,
          output: {
            type: 'continue',
            logic: 'true',
            trueActions: [],
            falseActions: []
          }
        };
        if (parent === 'true') {
          this.$emit('update-actions', {
            ...this.currentActions,
            trueActions: [...this.currentActions.trueActions, newAction]
          });
        } else {
          this.$emit('update-actions', {
            ...this.currentActions,
            falseActions: [...this.currentActions.falseActions, newAction]
          });
        }
      },
      moveUp(index, parent) {
        if (parent === 'true' && index > 0) {
          const temp = this.currentActions.trueActions[index - 1];
          const updatedActions = [...this.currentActions.trueActions];
          updatedActions.splice(index - 1, 1, this.currentActions.trueActions[index]);
          updatedActions.splice(index, 1, temp);
          this.$emit('update-actions', { ...this.currentActions, trueActions: updatedActions });
        } else if (parent === 'false' && index > 0) {
          const temp = this.currentActions.falseActions[index - 1];
          const updatedActions = [...this.currentActions.falseActions];
          updatedActions.splice(index - 1, 1, this.currentActions.falseActions[index]);
          updatedActions.splice(index, 1, temp);
          this.$emit('update-actions', { ...this.currentActions, falseActions: updatedActions });
        }
      },
      moveDown(index, parent) {
        if (parent === 'true' && index < this.currentActions.trueActions.length - 1) {
          const temp = this.currentActions.trueActions[index + 1];
          const updatedActions = [...this.currentActions.trueActions];
          updatedActions.splice(index + 1, 1, this.currentActions.trueActions[index]);
          updatedActions.splice(index, 1, temp);
          this.$emit('update-actions', { ...this.currentActions, trueActions: updatedActions });
        } else if (parent === 'false' && index < this.currentActions.falseActions.length - 1) {
          const temp = this.currentActions.falseActions[index + 1];
          const updatedActions = [...this.currentActions.falseActions];
          updatedActions.splice(index + 1, 1, this.currentActions.falseActions[index]);
          updatedActions.splice(index, 1, temp);
          this.$emit('update-actions', { ...this.currentActions, falseActions: updatedActions });
        }
      },
      removeAction(index, parent) {
        if (parent === 'true') {
          const updatedActions = [...this.currentActions.trueActions];
          updatedActions.splice(index, 1);
          this.$emit('update-actions', { ...this.currentActions, trueActions: updatedActions });
        } else {
          const updatedActions = [...this.currentActions.falseActions];
          updatedActions.splice(index, 1);
          this.$emit('update-actions', { ...this.currentActions, falseActions: updatedActions });
        }
      },
      editSubAction(index, parent) {
        this.editingSubActionIndex = index;
        this.editingSubActionParent = parent;
        this.editingSubAction = parent === 'true' 
          ? JSON.parse(JSON.stringify(this.currentActions.trueActions[index])) 
          : JSON.parse(JSON.stringify(this.currentActions.falseActions[index]));
      },
      saveSubActionEdit() {
        if (this.editingSubActionParent === 'true') {
          const updatedActions = [...this.currentActions.trueActions];
          updatedActions.splice(this.editingSubActionIndex, 1, this.editingSubAction);
          this.$emit('update-actions', { ...this.currentActions, trueActions: updatedActions });
        } else {
          const updatedActions = [...this.currentActions.falseActions];
          updatedActions.splice(this.editingSubActionIndex, 1, this.editingSubAction);
          this.$emit('update-actions', { ...this.currentActions, falseActions: updatedActions });
        }
        this.editingSubAction = null;
        this.editingSubActionIndex = null;
        this.editingSubActionParent = null;
      },
      cancelSubActionEdit() {
        this.editingSubAction = null;
        this.editingSubActionIndex = null;
        this.editingSubActionParent = null;
      },
      updateAction(index, parent, action) {
        if (parent === 'true') {
          const updatedActions = [...this.currentActions.trueActions];
          updatedActions.splice(index, 1, action);
          this.$emit('update-actions', { ...this.currentActions, trueActions: updatedActions });
        } else {
          const updatedActions = [...this.currentActions.falseActions];
          updatedActions.splice(index, 1, action);
          this.$emit('update-actions', { ...this.currentActions, falseActions: updatedActions });
        }
      },
      updateEditingSubAction(action) {
        this.editingSubAction = action;
      }
    }
  };
  </script>
  
  <style scoped>
  /* Your styles here */
  .tabs {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 10px;
    margin-top: 20px;
    border-bottom: 1px solid #e0e0e0;
    background: #919191;
    padding-right: 5px;
    padding-left: 5px;
    padding-top: 5px;
  }
  .tabs button {
    padding: 10px;
    cursor: pointer;
    border: 1px solid #e0e0e0;
    border-bottom: 0;
    margin-right: 3px;
    background: #ebebeb;
  
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
  
    -webkit-box-shadow: inset 0px -8px 4px -9px rgba(0, 0, 0, 0.60);
    -moz-box-shadow: inset 0px -8px 4px -9px rgba(0, 0, 0, 0.60);
    box-shadow: inset 0px -8px 4px -9px rgba(0, 0, 0, 0.60);
  }
  .tabs .active-tab {
    background: #ffffff;
    font-weight: bold;
    margin-bottom: -1px;
    -webkit-box-shadow: inset 0px -8px 4px -9px rgba(0, 0, 0, 0);
    -moz-box-shadow: inset 0px -8px 4px -9px rgba(0, 0, 0, 0);
    box-shadow: inset 0px -8px 4px -9px rgba(0, 0, 0, 0);
  }
  .sub-step-container {
    display: flex;
    flex-direction: row;
  }
  .actions-column, .steps-column {
    padding: 0px 10px 10px 10px;
  }
  .actions-column {
    width: 30%;
  }
  .steps-column {
    width: 70%;
    background-color: #f0f0f0;
    padding-top:15px;
  }
  .step-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    padding-top: 0px;
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
    padding: 5px;
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
    width: 600px; /* Fixed width */
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #ccc;
    padding-bottom: 10px;
  }
  .modal-body {
    margin-bottom: 20px;
  }
  .modal-footer {
    display: flex;
    justify-content: flex-end;
  }
  .modal-footer button {
    margin-left: 10px;
  }
  .inactive-step {
    opacity: 0.3;
  }
  </style>