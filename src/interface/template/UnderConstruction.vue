<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 class="text-4xl font-bold mb-4 text-gray-800">Under Construction</h1>
      <p class="text-lg text-gray-700 mb-6">We're working on something awesome. Please check back later!</p>
      <div class="flex flex-col items-center">
        <p class="text-gray-700">Estimated Completion: September 2023</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UnderConstruction',
    mounted() {
      this.$setPageTitle('Under Construction');
    },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 640px;
    margin: 0 auto;
    padding: 1rem;
  }
  </style>
  