<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">📝 {{ title }}</h2>
      <div class="bg-white rounded-lg shadow-sm p-12 text-center">
        <i class="fas fa-hammer text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Component Under Construction</h3>
        <p class="text-gray-500 mb-6">This component is being developed and will be available soon.</p>
        <router-link 
          to="/accounting"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <i class="fas fa-arrow-left mr-2"></i>
          Back to Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Component'
    }
  }
}
</script>
