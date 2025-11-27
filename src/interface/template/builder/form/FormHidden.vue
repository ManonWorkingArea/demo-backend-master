<template>
    <div>
      <label :for="data.uid" class="block font-bold mb-1 hidden">{{ data.name }}</label>
      <input
        class="w-full rounded-sm border border-gray-200 p-3"
        :id="data.uid"
        :value="inputValue"
        :type="data.type"
        :placeholder="data.placeholder"
        :class="inputClasses"
        @input="updateInputValue"
      >
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
        type: String,
        required: true,
      },
    },
    data() {
      return {
        inputValue: this.modelValue,
      };
    },
    computed: {
      inputClasses() {
        const classes = {
          'text-center': this.data.align === 'center',
        };
        if (this.data.fontSize) {
          classes[`text-${this.data.fontSize}`] = true;
        }
        if (this.data.fontWeight) {
          classes[`font-${this.data.fontWeight}`] = true;
        }
        if (this.data.color) {
          classes[`text-${this.data.color}`] = true;
        }
        return classes;
      },
    },
    watch: {
      modelValue(newValue) {
        this.inputValue = newValue;
      },
    },
    methods: {
      updateInputValue(event) {
        const newValue = event.target.value;
        this.inputValue = newValue;
        this.$emit('update:modelValue', newValue);
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your component-specific styles here */
  </style>
  