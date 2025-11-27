<template>
  <div>
    <label :for="data.name" class="block font-bold mb-1">{{ data.name }}</label>
    <textarea
      class="w-full rounded-sm border border-gray-200"
      :id="data.name"
      v-model="textareaValue"
      :placeholder="data.placeholder"
      :class="textareaClasses"
      :rows="data.rows"
      :cols="data.cols"
      @input="updateTextareaValue"
    ></textarea>
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
      textareaValue: this.modelValue,
    };
  },
  computed: {
    textareaClasses() {
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
      this.textareaValue = newValue;
    },
  },
  methods: {
    updateTextareaValue(event) {
      const newValue = event.target.value;
      this.textareaValue = newValue;
      this.$emit('update:modelValue', newValue);
    },
  },
};
</script>

<style scoped>
/* Add your component-specific styles here */
</style>
