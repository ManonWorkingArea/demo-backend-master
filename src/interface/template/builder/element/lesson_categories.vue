<template>
    <div>
      <!-- Preview Mode -->
      <template v-if="mode === 'preview'">
        <div class="p-2">
          <h1>{{ localItem.text || 'None' }}</h1>
        </div>
      </template>
  
      <!-- Edit Mode -->
      <template v-else-if="mode === 'edit'">
        <div class="content-editor overflow-auto" style="min-height: 600px; max-height: 600px; scrollbar-width: thin; scrollbar-color: rgba(0, 0, 0, 0.2) transparent; right: -20px;">
          <div class="section-group">
            <div class="border-b border-gray-200 pb-3 mb-3">
              <span class="popup-label block font-bold text-lg">Lesson Categories Config</span>
              <span class="popup-label text-gray-500">แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span>
            </div>
          </div>
  
          <div class="section-group flex flex-col h-full">
            <div class="pl-2 pb-2">Select : {{ localItem.categoriesCode }}</div>
  
            <label class="popup-label">หัวข้อ:</label>
            <input
              v-model="localItem.categoriesName"
              type="text"
              class="w-full popup-input"
              @input="updateItem('categoriesName', localItem.categoriesName)"
            />
  
            <div class="col-span-2 mt-4">
              <label class="popup-label">วิธีแสดงผล:</label>
              <div class="flex items-center mt-2">
                <label class="radio-label flex items-center mr-4">
                  <input
                    type="radio"
                    v-model="localItem.categoriesDisplay"
                    value="all"
                    class="radio-input"
                    @change="updateItem('categoriesDisplay', 'all')"
                  />
                  <span class="radio-icon mr-2"></span>
                  <span class="text-sm text-gray-500">ทั้งหมด</span>
                </label>
                <label class="radio-label flex items-center mr-4">
                  <input
                    type="radio"
                    v-model="localItem.categoriesDisplay"
                    value="select"
                    class="radio-input"
                    @change="updateItem('categoriesDisplay', 'select')"
                  />
                  <span class="radio-icon mr-2"></span>
                  <span class="text-sm text-gray-500">เลือกหมวดหมู่</span>
                </label>
              </div>
            </div>
  
            <div class="grid grid-cols-2 gap-4 mt-5">
              <template v-for="(category, index) in flattenedCategories" :key="category._id">
                <div v-if="category.type === 'main'" class="bg-white pl-2 rounded-sm shadow-sm">
                  <div class="flex items-center justify-between">
                    <label class="text-md font-semibold">
                      <input
                        type="radio"
                        :value="category.code"
                        v-model="localItem.categoriesCode"
                        @change="updateItem('categoriesCode', category.code)"
                      />
                      {{ getMainCategoryIndex(index) }}.{{ category.name }}
                    </label>
                  </div>
                  <ul class="list-disc ml-8 space-y-4 mt-2">
                    <li v-for="subcategory in getSubcategories(category._id)" :key="subcategory._id">
                      <div class="flex items-center justify-between">
                        <label class="text-md font-medium">
                          <input
                            type="radio"
                            :value="subcategory.code"
                            v-model="localItem.categoriesCode"
                            @change="updateItem('categoriesCode', subcategory.code)"
                          />
                          {{ subcategory.name }}
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      item: {
        type: Object,
        required: true,
      },
      mode: {
        type: String,
        required: true,
        default: 'preview', // or 'edit'
      },
      selectedItem: {
        type: Object,
        required: true,
      },
      flattenedCategories: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        localItem: { ...this.selectedItem }, // Create a local copy of selectedItem
      };
    },
    methods: {
      updateItem(key, value) {
        this.localItem[key] = value;
        console.log('Emitting update-item with:', { ...this.localItem }); // Debugging log
        this.$emit('update-item', { ...this.localItem });
      },
      getMainCategoryIndex(index) {
        return index + 1;
      },
      getSubcategories(parentId) {
        return this.flattenedCategories.filter(category => category.parentId === parentId);
      },
    },
    watch: {
      selectedItem: {
        handler(newVal) {
          this.localItem = { ...newVal };
        },
        deep: true,
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add any necessary styles here */
  </style>
  