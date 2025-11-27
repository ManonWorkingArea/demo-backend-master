<template>
  <div>
    <div class="field">
      <label class="label">Condition Value:</label>
      <div class="control">
        <div v-if="tags.length > 0" class="tags-container">
          <strong>Available Tags:</strong>
          <div class="field-row">
            <div class="select">
              <select v-model="selectedTag">
                <option v-for="tag in tags" :key="tag" :value="tag">
                  {{ stripTagFormatting(tag) }}
                </option>
              </select>
            </div>
            <input class="input" type="text" v-model="inputValue" @input="updateAction" placeholder="Type value here" />
          </div>
        </div>
      </div>
    </div>
    <div class="output">
      <strong>Output:</strong> {{ renderOutput }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConditionComponent',
  props: {
    tags: {
      type: Array,
      required: true
    },
    localAction: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedTag: '',
      inputValue: '',
      localLocalAction: { ...this.localAction }
    };
  },
  computed: {
    renderOutput() {
      if (this.selectedTag && this.inputValue) {
        const strippedTag = this.stripTagFormatting(this.selectedTag);
        return `\${${strippedTag}.${this.inputValue}}`;
      }
      return '';
    }
  },
  methods: {
    stripTagFormatting(tag) {
      return tag.replace('${', '').replace('}', '');
    },
    updateAction() {
      // Assign the renderOutput directly to this.localLocalAction.request.value
      this.localLocalAction.request.value = this.renderOutput;
      this.$emit('update-action', { ...this.localLocalAction });
    }
  },
  mounted() {
    // Initialize the default values if localLocalAction.request.value has data
    if (this.localLocalAction.request.value) {
      const match = this.localLocalAction.request.value.match(/^\${(.+)\.(.+)}$/);
      if (match) {
        this.selectedTag = `\${${match[1]}}`; // Retain the ${} format
        this.inputValue = match[2];
      }
    }
  }
};
</script>

<style scoped>
.field {
  width: 100%;
}

.input {
  width: 100%;
  margin-left: 10px;
}

.output {
  margin-top: 20px;
  font-size: 16px;
}

.select {
  width: auto;
}

.tags-container {
  margin-bottom: 10px;
}

.field-row {
  display: flex;
  align-items: center;
}

.field-row .input {
  flex-grow: 1;
}
</style>
