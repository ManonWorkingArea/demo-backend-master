<template>
  <div>
    <div class="field">
      <label class="label">Route or URL:</label>
      <div class="control">
        <input class="input" type="text" v-model="localLocalAction.request.routeOrUrl" @input="updateAction" />
      </div>
    </div>
    <div class="field">
      <label class="label">Target:</label>
      <div class="control">
        <div class="select">
          <select v-model="localLocalAction.request.target" @change="updateAction">
            <option value="self">Self</option>
            <option value="_blank">Blank</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GotoComponent',
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
