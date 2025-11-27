// CustomInput.vue
<template>
  <input
    v-model="value"
    type="text"
    class="w-full border border-gray-300 rounded-md px-2 py-1"
  />
</template>

<script>
export default {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
};
</script>
