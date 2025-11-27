<template>
    <div class="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div class="text-4xl font-bold mb-8">404 Not Found</div>
      <div class="text-lg mb-8">Sorry, the page you are looking for could not be found.</div>
      <router-link to="/" class="text-blue-500 hover:underline">Go back to the homepage</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: "NotFound",
  };
  </script>
  
  <style scoped>
  /* Add this class to stretch the container to full viewport height */
  .container {
    min-height: 100vh;
  }
  </style>
  