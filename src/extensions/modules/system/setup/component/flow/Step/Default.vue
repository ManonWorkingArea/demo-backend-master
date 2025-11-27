<template>
    <div>
      <div class="field">
        <label class="label">Default Field:</label>
        <div class="control">
          <input class="input" type="text" v-model="localLocalAction.request.defaultField" @input="updateAction" />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'DefaultComponent',
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
  