<template>
  <div>
    <label class="block font-bold mb-1">{{ data.name }}</label>
    <div :class="{ 'flex flex-row': data.inline }">
      <div
        v-for="(option, index) in data.options"
        :key="index"
        class="flex items-center mb-2"
        :class="{ 'mr-4': data.inline && index !== data.options.length - 1 }"
      >
        <input
          :id="getOptionId(option)"
          class="mr-2"
          v-model="selectedOption"
          :value="option.value"
          :name="data.uid"
          type="checkbox"
        >
        <label :for="getOptionId(option)">{{ option.label }}</label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    modelValue: {
      required: true,
    },
  },
  data() {
    return {
      selectedOption: this.modelValue ? [this.modelValue] : [],
    };
  },
  methods: {
    getOptionId(option) {
      return `${this.data.name}-${option.value}`;
    },
  },
  watch: {
    selectedOption(newValue) {
      const filteredOptions = newValue.filter(option => option !== undefined && option !== '' && option.trim() !== '');
      const emitData = filteredOptions.map(value => {
        const option = this.data.options.find(option => option.value === value);
        return option ? { label: option.label, value: option.value } : null;
      }).filter(option => option !== null);
      
      this.$emit('update:modelValue', emitData); // Emit array of selected options with label and value
    },
  },
};
</script>

<style scoped>
/* Add your component-specific styles here */
</style>
