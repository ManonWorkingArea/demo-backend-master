<template>
  <div class="term-selector-item">
    <!-- Term Card -->
    <div 
      :class="[
        'relative border rounded-lg p-3 cursor-pointer transition-all duration-200',
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
        level > 0 ? 'ml-4' : ''
      ]"
      @click="handleSelectionChange"
    >
      <!-- Selection Checkbox/Radio -->
      <div class="flex items-start gap-3">
        <div class="flex items-center pt-0.5">
          <input
            :type="selectionMode === 'single' ? 'radio' : 'checkbox'"
            :name="selectionMode === 'single' ? `group-${groupId}` : undefined"
            :checked="isSelected"
            @change="handleSelectionChange"
            @click.stop
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>

        <!-- Card Content -->
        <div class="flex-1 min-w-0">
          <!-- Term Title -->
          <div class="flex items-center gap-2 mb-1">
            <!-- Level indicator for sub terms -->
            <div v-if="level > 0" class="w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
            
            <h4 class="font-medium text-gray-900 truncate">
              {{ termDisplayName }}
            </h4>
          </div>

          <!-- Term Code -->
          <div v-if="term.code" class="text-xs text-gray-500 mb-1">
            {{ term.code }}
          </div>

          <!-- Term Description -->
          <div v-if="termDescription" class="text-xs text-gray-600 line-clamp-2">
            {{ termDescription }}
          </div>

          <!-- Custom Data Preview (compact) -->
          <div v-if="hasCustomDataPreview" class="mt-2 flex flex-wrap gap-1">
            <span 
              v-for="(value, key) in customDataPreview" 
              :key="key" 
              class="inline-flex items-center px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
            >
              {{ value }}
            </span>
          </div>

          <!-- Status Badge -->
          <div v-if="term.active === false" class="mt-2">
            <span class="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
              ปิดใช้งาน
            </span>
          </div>
        </div>
      </div>

      <!-- Selected Indicator -->
      <div 
        v-if="isSelected"
        class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
      >
        <i class="fas fa-check text-white text-xs"></i>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'TermSelectorItem',
  
  props: {
    term: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    selectedTerms: {
      type: Array,
      default: () => []
    },
    selectionMode: {
      type: String,
      default: 'multiple' // 'single' or 'multiple'
    },
    groupId: {
      type: String,
      required: true
    }
  },
  
  emits: ['toggle-term'],
  
  setup(props, { emit }) {
    // Computed properties
    const isSelected = computed(() => {
      return props.selectedTerms.includes(props.term._id)
    })
    
    const termDisplayName = computed(() => {
      // Try to get name from customData first, then fallback to name
      return props.term.customData?.name || 
             props.term.customData?.ชื่อ || 
             props.term.name || 
             'ไม่มีชื่อ'
    })
    
    const termDescription = computed(() => {
      return props.term.customData?.description || 
             props.term.customData?.คำอธิบาย || 
             props.term.description || 
             ''
    })
    
    const hasTermDetails = computed(() => {
      return !!(props.term.code || termDescription.value)
    })
    
    const customDataPreview = computed(() => {
      if (!props.term.customData) return {}
      
      // Show max 3 fields, excluding name and description
      const excludeKeys = ['name', 'ชื่อ', 'description', 'คำอธิบาย']
      const preview = {}
      let count = 0
      
      for (const [key, value] of Object.entries(props.term.customData)) {
        if (count >= 3) break
        if (excludeKeys.includes(key)) continue
        if (value && typeof value === 'string' && value.trim()) {
          preview[key] = value.length > 20 ? value.substring(0, 20) + '...' : value
          count++
        }
      }
      
      return preview
    })
    
    const hasCustomDataPreview = computed(() => {
      return Object.keys(customDataPreview.value).length > 0
    })
    
    // Methods
    const handleSelectionChange = () => {
      emit('toggle-term', props.term._id, props.groupId)
    }
    
    return {
      // Computed
      isSelected,
      termDisplayName,
      termDescription,
      hasTermDetails,
      customDataPreview,
      hasCustomDataPreview,
      
      // Methods
      handleSelectionChange
    }
  }
}
</script>

<style scoped>
.term-selector-item {
  position: relative;
}

/* Card hover effects */
.term-selector-item .cursor-pointer:hover {
  transform: translateY(-1px);
}

/* Selected state styling */
.term-selector-item input[type="checkbox"]:checked,
.term-selector-item input[type="radio"]:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Focus states */
.term-selector-item input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Level indentation */
.ml-4 { 
  margin-left: 1rem; 
}

/* Transition effects */
.transition-all {
  transition: all 0.2s ease-in-out;
}

/* Card border colors */
.border-blue-500 {
  border-color: #3b82f6;
}

.border-gray-200 {
  border-color: #e5e7eb;
}

.border-gray-300 {
  border-color: #d1d5db;
}

/* Background colors */
.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-white {
  background-color: #ffffff;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.bg-blue-400 {
  background-color: #60a5fa;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-red-100 {
  background-color: #fee2e2;
}

/* Text colors */
.text-blue-600 {
  color: #2563eb;
}

.text-gray-900 {
  color: #111827;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-700 {
  color: #374151;
}

.text-red-600 {
  color: #dc2626;
}

.text-white {
  color: #ffffff;
}

/* Shadow effects */
.hover\:shadow-sm:hover {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .term-selector-item .text-xs {
    font-size: 0.7rem;
  }
  
  .term-selector-item .gap-3 {
    gap: 0.5rem;
  }
  
  .term-selector-item .p-3 {
    padding: 0.5rem;
  }
}

/* Animation for selected indicator */
.term-selector-item .absolute.top-2.right-2 {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style> 