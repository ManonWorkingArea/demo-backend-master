<template>
    <div class="p-5 bg-white rounded shadow-sm">
      <h3 class="text-xl font-bold">{{ influencer.name }}</h3>
      <p class="text-gray-500 mt-2">{{ influencer.code }}</p>
      <p class="text-gray-600 mt-2">{{ influencer.description }}</p>
      <!-- Add more detailed fields as needed -->
      <div class="mt-4 space-x-2">
        <button @click="$emit('back')" class="px-4 py-2 text-sm bg-blue-500 text-white rounded">Back</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "InfluencerDetail",
    props: {
      influencer: {
        type: Object,
        required: true,
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your custom styles here */
  </style>
  