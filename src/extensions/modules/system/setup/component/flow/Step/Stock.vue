<template>
    <div>
      <div class="field">
        <label class="label">Product ID:</label>
        <div class="control">
          <input class="input" type="text" v-model="localLocalAction.request.product" @input="updateAction" />
        </div>
      </div>
      <div class="field">
        <label class="label">Volume:</label>
        <div class="control">
          <input class="input" type="text" v-model="localLocalAction.request.volume" @input="updateAction" />
        </div>
      </div>
      <div class="field">
        <label class="label">Mode:</label>
        <div class="control">
          <input class="input" type="text" v-model="localLocalAction.request.mode" @input="updateAction" />
        </div>
      </div>
      <!-- <div class="field">
        <label class="label">Mode:</label>
        <div class="control">
          <div class="select">
            <select v-model="localLocalAction.request.mode" @change="updateAction">
              <option value="in">In</option>
              <option value="out">Out</option>
              <option value="adjust">Adjust</option>
            </select>
          </div>
        </div>
      </div> -->
    </div>
  </template>
  
  <script>
  export default {
    name: 'StockComponent',
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
  