<template>
  <div>
    <div v-if="mode === 'preview'" class="preview-container">
      <!-- Display step configuration in preview mode -->
      <div class="grid-item">
        <div class="icon-label">
          <span class="icon-export">
            <font-awesome-icon
            :icon="localAction.export ? ['fas', 'file-circle-check'] : ['fas', 'file-circle-xmark']" 
            :class="{ 'export-active': localAction.export }" />
          </span>
          <label>Export</label>
        </div>
      </div>

      <div class="grid-item">
        <div class="icon-label">
          <template v-if="localAction.output.type === 'logic'">
            <span class="icon">
              <font-awesome-icon :icon="['fas', 'sitemap']" />
            </span>
            <label>Logic</label>
          </template>

          <template v-if="localAction.output.type === 'continue'">
            <span class="icon">
              <font-awesome-icon :icon="['fas', 'arrow-right']" />
            </span>
            <label>Continue</label>
          </template>
        </div>
      </div>

      <div v-if="localAction.export" class="grid-item full-width">
        <code>{{ exportPlaceholder }}</code>
      </div>
    </div>
    <div v-else>
      <!-- Edit step configuration in editor mode -->

      <component :is="currentComponent" :local-action="localAction" @update-action="handleUpdateAction" :tags="availableTags"></component>

      <div class="form-grid">
        <!-- New checkbox to show/hide the Input field -->
        <div class="field export-output">
          <div class="field">
            <label class="label">Input Data:</label>
            <div class="control">
              <label class="checkbox">
                <input type="checkbox" v-model="showInput" @change="updateAction" />
                Show Input
              </label>
            </div>
          </div>

          <div class="field">
            <label class="label">Export Data:</label>
            <div class="control">
              <label class="checkbox">
                <input type="checkbox" v-model="localAction.export" @change="updateAction" />
                Export
              </label>
            </div>
          </div>
          
          <div class="field">
            <label class="label">Step Status:</label>
            <div class="control">
              <label class="checkbox">
                <input type="checkbox" v-model="localAction.status" @change="updateAction" />
                {{ localAction.status }}
              </label>
            </div>
          </div>
          <div class="field">
            <label class="label">Output Type:</label>
            <div class="control">
              <div class="select">
                <select v-model="localAction.output.type" @change="updateAction" :disabled="!['prompt', 'condition'].includes(localAction.code)">
                  <option value="continue">Continue</option>
                  <option value="logic">Logic</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Conditionally display the Input field based on the showInput checkbox -->
        <div v-if="showInput" class="field full-width">
          <label class="label"><strong>Input:</strong></label>
          <div class="control">
            <textarea class="textarea" v-model="localAction.input" rows="3" @input="updateAction"></textarea>
          </div>
        </div>

        <!-- Display available tags if present -->
        <div v-if="availableTags.length > 0" class="tags-container">
          <strong>Available Tags:</strong>
          <ul>
            <li v-for="tag in availableTags" :key="tag">{{ tag }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StepConfig',
  props: {
    action: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      default: 'editor' // Default mode is 'editor'
    },
    getAvailableTags: {
      type: Function,
      required: true
    },
    actionIndex: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      localAction: { ...this.action },
      showInput: false, // New data property, hidden by default
      componentMap: this.importAllComponents(),
    };
  },
  computed: {
    exportPlaceholder() {
      return `\${export.${this.localAction.code}}`;
    },
    currentComponent() {
      return this.componentMap[this.localAction.code] || 'Default';
    },
    availableTags() {
      return this.getAvailableTags(this.localAction.code);
    }
  },
  methods: {
    importAllComponents() {
      const context = require.context('./Step', false, /\.vue$/);
      const components = {};
      context.keys().forEach((fileName) => {
        const componentName = fileName.replace(/^\.\//, '').replace(/\.vue$/, '').toLowerCase();
        components[componentName] = context(fileName).default;
      });
      return components;
    },
    updateAction() {
      this.$emit('update-action', { ...this.localAction, showInput: this.showInput });
    },
    handleUpdateAction(updatedAction) {
      this.localAction = updatedAction;
      this.updateAction();
    }
  },
  watch: {
    action: {
      handler(newValue) {
        this.localAction = { ...newValue };
        this.showInput = newValue.showInput !== undefined ? newValue.showInput : false;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
}
.field {
  width: 100%;
}
.full-width {
  grid-column: span 3;
}
.label {
  font-weight: bold;
  margin-bottom: 5px;
}
.input, .textarea, .select select {
  width: 100%;
  box-sizing: border-box;
}
.tags-container {
  margin-top: 10px;
  grid-column: span 3;
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
.export-output {
  display: flex;
  align-items: center;
  justify-content: space-between;
  grid-column: span 3;
}
.export-output .field {
  width: auto;
}
.inactive-step {
  opacity: 0.3;
}

.preview-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  padding: 4px;
  background-color: #f9f9f9;
  font-size: 12px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; /* Center align items horizontally */
  padding: 10px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.grid-item.full-width {
  grid-column: span 2;
}

.icon-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* Center align items vertically */
}

.icon-label .icon {
  font-size: 15px;
  text-align: center;
  background: #636363;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #636363;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.icon-label .icon-export {
  font-size: 24px;
  text-align: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: #636363;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.icon-label label {
  text-align: center;
  color: #636363;
}

.export-active {
  color: green;
}

.font-awesome-icon {
  color: black;
}
</style>
