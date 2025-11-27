<template>
  <div
    class="content-editor overflow-auto"
    style="
      min-height: 600px;
      max-height: 600px;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
      right: -20px;
    "
  >
    <div class="section-group">
      <div class="border-b border-gray-200 pb-3 mb-3">
        <span class="popup-label block font-bold text-lg"
          >Lesson Categories Config</span
        >
        <span class="popup-label text-gray-500"
          >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
        >
      </div>
    </div>

    <div class="section-group flex flex-col h-full pl-1">
      <!-- Now using the backend component to avoid circular reference -->
      <LessonCategoriesDropdownBackend
        :data-item="item"
        @update="handleChildUpdate"
      />
    </div>
  </div>
</template>

<script>
// Import the actual backend component
import LessonCategoriesDropdownBackend from '../backend/lesson_categories_dropdown.vue';

export default {
  name: 'LessonCategoriesDropdownElement', // Distinct name for this wrapper
  components: {
    LessonCategoriesDropdownBackend,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true, // Expected 'edit' or 'preview'
    },
  },
  methods: {
    handleChildUpdate(updatePayload) {
      // This method adapts the child's update event to the expected 'update-item' event.
      // The backend component emits { field, value } format
      const newItem = { ...this.item };

      if (updatePayload && typeof updatePayload.field === 'string' && 'value' in updatePayload) {
        // Handles { field, value } payload from backend component
        newItem[updatePayload.field] = updatePayload.value;
        
        // Emit the updated item
        this.$emit('update-item', newItem);
      } else {
        console.warn('Unexpected update payload format:', updatePayload);
      }
    },
  },
};
</script>

<style scoped>
/* Add any component-specific styles here if needed */
/* Styles are mostly inline in the template */
</style>
  