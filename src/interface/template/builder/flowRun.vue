<template>
    <div></div>
  </template>
  
  <script>
  export default {
    props: ['data'],
    mounted() {
      this.runFlow();
    },
    methods: {
      runFlow() {
        if (this.data && this.data.flow) {
          this.$emit('run-flow', this.data.flow);
        }
      }
    }
  };
  </script>
  