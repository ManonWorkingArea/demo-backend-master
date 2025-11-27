<template>
    <div>
      <label class="block font-bold mb-1">{{ data.name }}</label>
      <select
        class="w-full rounded-sm border border-gray-200"
        v-model="selectedOption"
        :class="selectClasses"
        :multiple="data.multiple"
        @change="updateInputValue"
      >
        <template v-if="data.disableFirstOption">
          <option disabled hidden value="">{{ data.placeholder }}</option>
        </template>
        <option v-for="(option, index) in data.options" :key="index" :value="option.value">{{ option.label }}</option>
      </select>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      data: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        selectedOption: '',
      };
    },
    methods: {
      updateInputValue(event) {
        const selectedValue = event.target.value;
        const selectedOption = this.data.options.find(option => option.value === selectedValue);
        
        // Check if an option with the selected value is found
        if (selectedOption) {
          const newValue = {
            value: selectedOption.value,
            label: selectedOption.label
          };
          //this.selectedOption = newValue; // Update selectedOption data property
          this.$emit('update:modelValue', newValue); // Emit the updated value
        }
      },
    },
    computed: {
      selectClasses() {
        return {
          'text-center': this.data.align === 'center',
          [`text-${this.data.fontSize}`]: this.data.fontSize,
          [`font-${this.data.fontWeight}`]: this.data.fontWeight,
          [`text-${this.data.color}`]: this.data.color,
        };
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your component-specific styles here */
  </style>
  