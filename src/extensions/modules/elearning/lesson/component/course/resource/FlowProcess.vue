<template>
    <div v-if="localRequest">
      <div v-if="localRequest.seconds !== undefined">
        <label>Seconds to Wait: <input type="number" v-model.number="localRequest.seconds" @input="updateRequest" /></label>
      </div>
      <div v-if="localRequest.url !== undefined">
        <label>URL: <input type="text" v-model="localRequest.url" @input="updateRequest" /></label>
        <label>Data: <textarea v-model="localRequest.data" @input="updateRequest"></textarea></label>
      </div>
      <div v-if="localRequest.routeOrUrl !== undefined">
        <label>Route or URL: <input type="text" v-model="localRequest.routeOrUrl" @input="updateRequest" /></label>
        <label>Target: 
          <select v-model="localRequest.target" @change="updateRequest">
            <option value="self">Self</option>
            <option value="_blank">Blank</option>
          </select>
        </label>
      </div>
      <div v-if="localRequest.email !== undefined">
        <label>Email: <input type="email" v-model="localRequest.email" @input="updateRequest" /></label>
        <label>Subject: <input type="text" v-model="localRequest.subject" @input="updateRequest" /></label>
        <label>Body: <textarea v-model="localRequest.body" @input="updateRequest"></textarea></label>
      </div>
      <div v-if="localRequest.text !== undefined">
        <label>Text: <input type="text" v-model="localRequest.text" @input="updateRequest" /></label>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'StepProcessEditor',
    props: {
      request: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        localRequest: { ...this.request }
      };
    },
    methods: {
      updateRequest() {
        this.$emit('update:request', this.localRequest);
      }
    }
  };
  </script>
  
  <style scoped>
  label {
    display: block;
    margin-bottom: 10px;
  }
  input,
  textarea,
  select {
    margin-left: 10px;
  }
  </style>
  