<template>
    <div>
      <label for="comment" class="block text-sm font-medium leading-6 text-gray-900">Text</label>
      <div class="mt-2">
        <textarea rows="4" name="comment" id="comment" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" v-model="localLocalAction.request.text" @input="updateAction"></textarea>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'DebugComponent',
    props: {
      localAction: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        localLocalAction: { ...this.localAction }
      };
    },
    methods: {
      updateAction() {
        this.$emit('update-action', { ...this.localLocalAction });
      }
    }
  };
  </script>
  