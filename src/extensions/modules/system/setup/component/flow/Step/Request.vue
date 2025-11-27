<template>
    <div class="call-component">
      <div class="field-row">
        <div class="field field-url">
          <label class="label">ENDPOINT:</label>
          <div class="control">
            <input class="input" type="text" v-model="localLocalAction.request.endpoint" @input="updateAction" />
          </div>
        </div>
        <div class="field field-method">
          <label class="label">Method:</label>
          <div class="control">
            <select class="input" v-model="localLocalAction.request.method" @change="updateAction">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="OPTIONS">OPTIONS</option>
              <option value="HEAD">HEAD</option>
            </select>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Data:</label>
        <div class="control">
          <textarea class="textarea" v-model="localLocalAction.request.data" rows="3" @input="updateAction"></textarea>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CallComponent',
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
  
  <style scoped>
  .call-component {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    box-sizing: border-box;
  }
  
  .field-row {
    display: flex;
    width: 100%;
  }
  
  .field {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  .field-url {
    flex: 0 0 70%;
  }
  
  .field-method {
    flex: 0 0 30%;
  }
  
  .label {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .control {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  .input, .textarea, select {
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .textarea {
    resize: vertical;
    height: 200px;
  }
  </style>
  