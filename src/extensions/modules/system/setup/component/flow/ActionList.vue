<template>
  <div class="action-list-container">
    <h3 class="title">Actions</h3>
    <ul class="action-list">
      <template v-if="currentGroup === null">
        <li 
          v-for="(group, index) in actionGroups" 
          :key="index" 
          @click="selectGroup(index)"
          class="folder"
        >
          {{ group.name }}
        </li>
      </template>
      <template v-else>
        <li @click="currentGroup = null" class="back-button">Back</li>
        <li 
          v-for="(action, index) in filteredActions" 
          :key="index" 
          @click="canAddAction ? addAction(action) : null"
          :class="{'disabled': !canAddAction, 'document': true}"
        >
          {{ action.name }}
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import { actionGroups } from './action.js'; // Adjust the path as necessary

export default {
  name: 'ActionList',
  props: {
    flowSteps: {
      type: Array,
      required: true
    },
    canAddAction: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      currentGroup: null,
      actionGroups: actionGroups // Assign imported actionGroups
    };
  },
  computed: {
    filteredActions() {
      const nonRepeatableActions = ['prompt', 'debug', 'alert', 'wait', 'display', 'visible'];
      if (this.currentGroup !== null) {
        return this.actionGroups[this.currentGroup].actions.filter(action => 
          nonRepeatableActions.includes(action.code) || !this.flowSteps.some(step => step.code === action.code)
        );
      }
      return [];
    }
  },
  methods: {
    selectGroup(index) {
      this.currentGroup = index;
    },
    addAction(action) {
      this.$emit('add-action', action);
    }
  }
};
</script>


<style scoped>
.action-list-container {
  border: 1px solid #ccc;
  padding: 10px;
  background-color: #ffffff;
}

.title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.action-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr; /* Single column layout within the fixed width */
  gap: 5px; /* Spacing between items */
}

.action-list li {
  width: 100%; /* Ensure items take the full width of the container */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
  font-size: 12px;
  text-align: center;
}

.action-list li:hover {
  background-color: #f0f0f0;
  border-color: #999;
}

.action-list li.disabled {
  pointer-events: none;
  color: grey;
  border-color: #e0e0e0;
}

.action-list li.disabled:hover {
  background-color: inherit;
  border-color: #e0e0e0;
}

.folder {
  background-color: #ffd700; /* Yellow background for folders */
  color: black;
  border: 2px solid #ffcc00;
}

.document {
  background-color: #ffffff; /* White background for documents */
  border: 2px solid #007bff; /* Blue border for documents */
}

.back-button {
  cursor: pointer;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 4px;
  display: inline-block;
  grid-column: span 1; /* Make back button span across the single column */
}
</style>
