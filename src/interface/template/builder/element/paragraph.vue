<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2">
        <div v-html="item.text || 'None'"></div>
        <div>{{ item.displayType || 'None' }}</div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-else-if="mode === 'edit'">
      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-paragraph text-blue-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Paragraph Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของย่อหน้า</p>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 space-y-6">
          <!-- Element Type -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <label for="elementType" class="popup-label block font-semibold mb-1">Element Type</label>
            <select v-model="localItem.displayType" id="elementType" class="popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 w-full" @change="updateItem('displayType', $event.target.value)">
              <option value="p">&lt;p/&gt;</option>
              <option value="div">&lt;div/&gt;</option>
              <option value="span">&lt;span/&gt;</option>
              <option value="pre">&lt;pre/&gt;</option>
            </select>
          </div>

          <!-- Paragraph Content -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <label class="popup-label block font-semibold mb-1">เนื้อหา</label>
            <editor :content="localItem.text" @update-content="updateItem3" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import editor from '@/interface/template/editor.vue';

export default {
  name: 'Paragraph',
  components: {
    editor
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true,
      default: 'preview',
    },
  },
  data() {
    return {
      localItem: { ...this.item }, // Directly use item without modifying text
    };
  },
  methods: {
    updateItem3(data) {
      this.localItem.text = data; // Directly update localItem.text
      this.updateItem('text', data); // Emit updated data
    },
    updateItem(key, value) {
      this.localItem[key] = value; // Update localItem property
      this.$emit('update-item', { ...this.localItem }); // Emit updated item
    },
  },
};
</script>

<style>
.ProseMirror:focus {
  outline: none;
}

.ProseMirror {
  font-family: inherit !important; /* Inherit the font-family from the parent */
}

.ProseMirror {
  position: relative;
  padding: 10px;
  border: 0;
}
</style>