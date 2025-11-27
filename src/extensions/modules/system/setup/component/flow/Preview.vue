<template>
  <div>
    <button @click="showModal = true" class="show-modal-button">Show Modal</button>
    
    <div class="modal" :class="{ 'is-active': showModal }">
      <div class="modal-background" @click="showModal = false"></div>
      <div class="modal-content">
        <div id="selector"></div>
        <div class="box">
          <button @click="runFlow" class="run-flow-button">Run Flow</button>
          <div class="flow-steps-container">
            <pre>{{ flowSteps }}</pre>
          </div>
        </div>
      </div>
      <button class="modal-close is-large" @click="showModal = false"></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Preview',
  props: {
    flowSteps: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      showModal: false
    };
  },
  methods: {
    runFlow() {
      this.$emit('run-flow');
    }
  }
};
</script>

<style scoped>
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal.is-active {
  display: flex;
}
.modal-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 10, 0.86);
}
.modal-content {
  position: relative;
  width: 20%;
  max-height: 90%;
  overflow: auto;
  background: white;
  padding: 20px;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: white;
}
.flow-steps-container {
  max-height: 300px; /* Fixed height */
  overflow-y: auto; /* Scrollable */
  margin-top: 10px; /* Margin for better spacing */
}
pre {
  white-space: pre-wrap; /* Ensure long text wraps */
  word-wrap: break-word; /* Ensure long words break */
}
.show-modal-button,
.run-flow-button {
  display: inline-block;
  margin: 10px 0;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  background-color: #3273dc;
  color: white;
  border: none;
  border-radius: 4px;
}
.show-modal-button:hover,
.run-flow-button:hover {
  background-color: #275aa8;
}
</style>
