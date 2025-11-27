<template>
  <div class="fixed inset-0 z-[99999] overflow-hidden"
       @mousedown="handleBackdropClick">
    <div class="absolute inset-0 bg-black bg-opacity-50"></div>
    <div class="relative flex items-center justify-center min-h-full p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
           @mousedown.stop>
        <!-- Header -->
        <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <i :class="iconClass" class="text-lg"></i>
            <h4 class="text-lg font-semibold text-gray-800">{{ title }}</h4>
          </div>
          <button 
            @click="$emit('close')" 
            class="text-gray-500 hover:text-gray-700 text-xl"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="flex flex-col h-[calc(90vh-4rem)] overflow-hidden">
          <!-- Body -->
          <div class="flex-1 overflow-y-auto p-6">
            <slot name="content"></slot>
          </div>

          <!-- Progress Section -->
          <div v-if="progress > 0 && progress < 100" class="border-t border-gray-200 bg-gray-50 p-4">
            <div class="flex items-center space-x-2 mb-2">
              <i class="fas fa-cog fa-spin text-indigo-600"></i>
              <h5 class="text-sm font-semibold text-gray-800">{{ status }}</h5>
              <span class="text-xs text-gray-500 ml-auto">{{ progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Results Section -->
          <div v-if="progress >= 100" 
               :key="`results-${Date.now()}`"
               class="border-t border-gray-200">
            <div class="bg-green-50 border-b border-green-200">
              <div class="p-3">
                <div class="flex items-center space-x-2">
                  <i class="fas fa-check-circle text-green-600 text-base"></i>
                  <h5 class="text-sm font-semibold text-green-800">การประมวลผลเสร็จสิ้น!</h5>
                </div>
                
                <div class="p-4">
                  <p class="text-sm text-gray-700">
                    <i class="fas fa-sparkles text-purple-600 mr-1"></i>
                    <span>{{ resultMessage }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIModalBase',
  props: {
    title: {
      type: String,
      required: true
    },
    iconClass: {
      type: String,
      default: 'fas fa-robot text-indigo-600'
    },
    progress: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: ''
    },
    resultMessage: {
      type: String,
      default: ''
    }
  },
  emits: ['close'],
  methods: {
    handleBackdropClick(event) {
      if (event.target === event.currentTarget) {
        this.$emit('close');
      }
    }
  }
};
</script>