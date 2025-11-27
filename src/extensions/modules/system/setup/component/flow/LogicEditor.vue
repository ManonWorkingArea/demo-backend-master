<template>
    <div>
      <div class="tabs">
        <button @click="selectLogicTab('true')" :class="{'active-tab': selectedLogicTab === 'true'}">True</button>
        <button @click="selectLogicTab('false')" :class="{'active-tab': selectedLogicTab === 'false'}">False</button>
      </div>
      <div v-if="selectedLogicTab === 'true'">
        <strong>Logic True:</strong>
        <LogicActionsEditor
          :actions="actions"
          :current-actions="logicOutput.trueActions"
          @update-actions="updateTrueActions"
        />
      </div>
      <div v-if="selectedLogicTab === 'false'">
        <strong>Logic False:</strong>
        <LogicActionsEditor
          :actions="actions"
          :current-actions="logicOutput.falseActions"
          @update-actions="updateFalseActions"
        />
      </div>
    </div>
  </template>
  
  <script>
  import LogicActionsEditor from './LogicActionsEditor.vue';
  
  export default {
    name: 'LogicEditor',
    components: {
      LogicActionsEditor
    },
    props: {
      logicOutput: {
        type: Object,
        required: true
      },
      actions: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        selectedLogicTab: 'true'
      };
    },
    methods: {
      selectLogicTab(tab) {
        this.selectedLogicTab = tab;
      },
      updateTrueActions(updatedActions) {
        this.$emit('update-output', { ...this.logicOutput, trueActions: updatedActions });
      },
      updateFalseActions(updatedActions) {
        this.$emit('update-output', { ...this.logicOutput, falseActions: updatedActions });
      }
    }
  };
  </script>
  
  <style scoped>
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
  </style>
  