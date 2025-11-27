<template>
  <div class="login-component">
    <div class="field">
      <label class="label">Username:</label>
      <div class="control">
        <input class="input" type="text" v-model="localLocalAction.request.username" @input="updateAction" />
      </div>
    </div>
    <div class="field">
      <label class="label">Password:</label>
      <div class="control">
        <input class="input" type="text" v-model="localLocalAction.request.password" @input="updateAction" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginComponent',
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
.login-component {
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

.field {
  display: flex;
  flex-direction: column;
  width: 100%;
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

.input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
