<template>
    <div>
      <div class="field">
        <label class="label">Selector:</label>
        <div class="control">
          <input class="input" type="text" v-model="localLocalAction.request.selector" @input="updateAction" />
        </div>
      </div>
      <div class="field">
        <label class="label">Mode:</label>
        <div class="control">
          <div class="select">
            <select v-model="localLocalAction.request.mode" @change="updateAction">
              <option value="hide">Hide</option>
              <option value="show">Show</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'VisibleComponent',
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
  