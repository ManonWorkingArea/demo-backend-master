<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <form class="p-2 border rounded-md shadow-sm">
        <div class="mb-2">
          <label class="block popup-label font-semibold mb-1">{{ localItem.name || 'Select Date/Time' }}<span v-if="localItem.required" class="text-xs text-red-500 ml-1">* จำเป็น</span></label>
          <input
            :type="localItem.showDateTime === 'datetime' ? 'datetime-local' : 'date'"
            class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            :required="localItem.required"
          />
        </div>
      </form>
    </template>

    <!-- Edit Mode -->
    <template v-else-if="mode === 'edit'">
      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-calendar-alt text-blue-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Date/Time Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของฟิลด์วันที่/เวลา</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mb-3">
            <div>
              <label class="popup-label block font-semibold mb-1">ชื่อ:</label>
              <input v-model="localItem.name" type="text" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="popup-label block font-semibold mb-1">Show:</label>
              <select v-model="localItem.showDateTime" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                <option value="date">Date</option>
                <option value="datetime">Date & Time</option>
              </select>
            </div>
          </div>
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mt-4">
            <div class="flex items-center">
              <input v-model="localItem.required" type="checkbox" class="popup-checkbox mr-2" id="required" />
              <label for="required" class="popup-label text-sm">ต้องกรอกข้อมูลนี้</label>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'Datetime',
  props: {
    item: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      required: true,
      default: 'preview' // or 'edit'
    }
  },
  data() {
    return {
      localItem: { ...this.item } // Create a local copy of the item prop
    };
  },
  computed: {
    previewDatetimeLabel() {
      if (this.localItem.showDateTime === 'datetime') {
        return 'Date & Time Picker';
      } else if (this.localItem.showDateTime === 'date') {
        return 'Date Picker';
      } else {
        return 'Select Date/Time';
      }
    }
  },
  methods: {
    updateItem(key, value) {
      this.$emit('update-item', { ...this.localItem, [key]: value });
    }
  },
  watch: {
    item: {
      handler(newVal) {
        this.localItem = { ...newVal };
      },
      deep: true
    }
  }
};
</script>

<style scoped>
/* Add any necessary styles here */
.simulation {
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 8px;
  display: inline-block;
}
</style>
