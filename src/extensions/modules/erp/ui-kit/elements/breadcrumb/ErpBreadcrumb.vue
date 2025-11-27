<template>
  <div class="bg-gray-100 border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-2 text-sm">
          <!-- Dynamic Navigation Items -->
          <li v-for="(item, index) in breadcrumbItems" :key="index">
            <!-- First item (Home) - special case -->
            <div v-if="index === 0" class="flex items-center">
              <router-link 
                v-if="item.path && index < breadcrumbItems.length - 1"
                :to="item.path"
                class="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
              >
                <i v-if="item.icon" :class="item.icon" class="text-lg"></i>
                <span v-if="item.name && item.name !== 'Home'" class="ml-1">{{ item.name }}</span>
              </router-link>
              <span 
                v-else
                class="text-gray-600 font-medium flex items-center"
              >
                <i v-if="item.icon" :class="item.icon" class="text-lg"></i>
                <span v-if="item.name && item.name !== 'Home'" class="ml-1">{{ item.name }}</span>
              </span>
            </div>
            
            <!-- Other items -->
            <div v-else class="flex items-center">
              <!-- Separator -->
              <svg class="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
              </svg>
              
              <!-- Link or Text -->
              <router-link 
                v-if="item.path && index < breadcrumbItems.length - 1"
                :to="item.path"
                class="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center"
              >
                <i v-if="item.icon" :class="item.icon" class="text-sm mr-1"></i>
                {{ item.name }}
              </router-link>
              
              <!-- Current Page (no link) -->
              <span 
                v-else
                class="text-gray-600 font-medium flex items-center"
              >
                <i v-if="item.icon" :class="item.icon" class="text-sm mr-1"></i>
                {{ item.name }}
              </span>
            </div>
          </li>
        </ol>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErpBreadcrumb',
  
  props: {
    nav: {
      type: Array,
      required: true,
      validator: function (value) {
        // Validate that each nav item has required properties
        return value.every(item => 
          typeof item === 'object' && 
          item.name && 
          typeof item.name === 'string'
        )
      }
    }
  },

  computed: {
    breadcrumbItems() {
      return this.nav.map((item, index) => {
        // Process each navigation item
        return {
          name: item.name,
          path: item.path || null,
          icon: item.icon || null,
          isActive: item.active || index === this.nav.length - 1
        }
      })
    }
  }
}
</script>

<style scoped>
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>