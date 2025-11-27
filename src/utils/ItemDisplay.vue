<template>
    <div class="p-0 border">

      <pre>Form : {{ item.formCount }} Post : {{ item.subItemCount }}</pre>
      <!-- Unified Item View -->
      <div :class="itemContainerClasses">
        <!-- Image -->
        <div :class="imageContainerClasses">
            <!-- Check if item has an image -->
            <template v-if="item.image">
              <img :src="item.image" alt="Item Image" :class="imageClasses">
            </template>
            <template v-else>
              <!-- Dummy placeholder when no image is present -->
              <div class="dummy-image flex items-center justify-center bg-gray-200" :class="imageClasses">
                <span class="text-gray-700">No Image</span>
              </div>
            </template>
          </div>
  
        <!-- Content -->
        <div :class="contentContainerClasses">
          
            <div v-if="viewMode === 'list'">
                <div class="thumbnail-title font-semibold text-gray-800">{{ item.title }}</div>
                <div class="thumbnail-title font-semibold text-gray-800">{{ item.type }}</div>
            </div>

            <div v-if="viewMode === 'thumbnail'">
                <div class="thumbnail-title font-semibold text-gray-800">{{ item.title }}</div>
                <div class="thumbnail-title font-semibold text-gray-800">{{ item.type }}</div>
            </div>
    
        </div>
  
        <!-- Button Group -->
        <div :class="buttonGroupContainerClasses">
          <div class="flex space-x-2">
            <button class="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150">view</button>
            <button class="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150">edit</button>
            <button class="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150">delete</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      viewMode: {
        type: String,
        required: true,
      },
      item: {
        type: Object,
        required: true,
      },
    },
    computed: {
      itemContainerClasses() {
        return {
          'flex flex-col md:grid md:grid-cols-5 gap-4 items-center bg-white p-4 shadow-sm': this.viewMode === 'list',
          'shadow-sm overflow-hidden': this.viewMode === 'thumbnail'
        };
      },
      imageContainerClasses() {
        return {
          'md:col-span-1 flex justify-center': this.viewMode === 'list',
          'p-0': this.viewMode === 'thumbnail'
        };
      },
      imageClasses() {
        return {
          'h-20 w-20 object-cover': this.viewMode === 'list',
          'w-full object-cover': this.viewMode === 'thumbnail',
          'style="height: 200px;"': this.viewMode === 'thumbnail',
        };
      },
      contentContainerClasses() {
        return {
          'md:col-span-3 flex flex-col justify-center': this.viewMode === 'list',
          'px-4 py-2 bg-white': this.viewMode === 'thumbnail'
        };
      },
      buttonGroupContainerClasses() {
        return {
          'md:col-span-1 flex justify-center': this.viewMode === 'list',
          'px-4 py-2 bg-gray-50 flex justify-center space-x-2': this.viewMode === 'thumbnail'
        };
      },
    },
  };
  </script>
  
  <style scoped>

  </style>
  