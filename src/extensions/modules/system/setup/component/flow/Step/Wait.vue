<template>
    <div>
      <div class="field">
        <label class="label">Seconds to Wait:</label>
        <div class="control">
          <input class="input" type="number" v-model.number="localLocalAction.request.seconds" @input="updateAction" />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'WaitComponent',
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
  