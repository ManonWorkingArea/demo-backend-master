<template>
    <div class="my-5">
        <div class="px-2 pb-4">
            <h1 class="text-lg font-bold">Header</h1>
            <p class="mt-2 text-gray-600">This is the main body content section.</p>
        </div>
      <!-- Row 1 -->
      <div class="flex flex-col md:flex-row border-b">
        <div class="w-full md:w-9/12 p-2 order-2 md:order-1">
          <!-- Side bar -->
          <header class="bg-white shadow p-5">
            <h1 class="text-lg font-bold">Header</h1>
            <p class="mt-2 text-gray-600">This is the main body content section.</p>
          </header>
        </div>
        <div class="w-full md:w-3/12 p-2 order-1 md:order-2">
          <!-- Main Content -->
          <header class="bg-white shadow p-5">
            <h1 class="text-lg font-bold">Header Config</h1>
            <p class="mt-2 text-gray-600">This is the main body content section.</p>
          </header>
        </div>
      </div>
  
      <!-- Row 2 -->
      <div class="flex flex-col md:flex-row border-b">
          <div class="w-full md:w-9/12 p-2 order-2 md:order-1">
            <!-- Side bar -->
            <header class="bg-white shadow p-5">
              <h1 class="text-lg font-bold">Header</h1>
              <p class="mt-2 text-gray-600">This is the main body content section.</p>
            </header>
          </div>
          <div class="w-full md:w-3/12 p-2 order-1 md:order-2">
            <!-- Main Content -->
            <header class="bg-white shadow p-5">
              <h1 class="text-lg font-bold">Header Config</h1>
              <p class="mt-2 text-gray-600">This is the main body content section.</p>
            </header>
          </div>
        </div>
  
      <!-- Row 3 -->
      <div class="flex flex-col md:flex-row border-b">
          <div class="w-full md:w-9/12 p-2 order-2 md:order-1">
            <!-- Side bar -->
            <header class="bg-white shadow p-5">
              <h1 class="text-lg font-bold">Header</h1>
              <p class="mt-2 text-gray-600">This is the main body content section.</p>
            </header>
          </div>
          <div class="w-full md:w-3/12 p-2 order-1 md:order-2">
            <!-- Main Content -->
            <header class="bg-white shadow p-5">
              <h1 class="text-lg font-bold">Header Config</h1>
              <p class="mt-2 text-gray-600">This is the main body content section.</p>
            </header>
          </div>
        </div>
  
    </div>
  </template>
  
  <script>
  export default {
    name: 'ThemeComponent',
    // ... existing code ...
  }
  </script>
  
  <style scoped>
  .border-b {
    border-bottom: 1px solid #e5e7eb; /* เพิ่มเส้นขอบด้านล่าง */
  }
  </style>
    