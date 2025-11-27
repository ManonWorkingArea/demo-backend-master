<template>
  <!-- Header Section -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas','folder']" class="text-white text-sm" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">หมวดหมู่</h2>
            <p class="text-xs text-gray-500">{{ getMainCategories.length }} หมวดหมู่หลัก</p>
          </div>
        </div>
        <button
          @click="addCategory('main')"
          type="button"
          class="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          เพิ่มหมวดหมู่
        </button>
      </div>
    </div>

    <!-- Navigation Section -->
    <div class="bg-gray-50 border-b border-gray-200 px-4 py-2">
      <button
        @click="$router.push('/lesson/home')"
        type="button"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <font-awesome-icon :icon="['fas', 'chevron-left']" class="mr-1.5 text-xs" />
        ย้อนกลับ
      </button>
    </div>

    <!-- Category List -->
    <div class="p-4">
      <div v-if="getMainCategories.length === 0" class="text-center py-8">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <font-awesome-icon :icon="['fas','folder']" class="text-gray-400 text-lg" />
        </div>
        <h3 class="text-base font-medium text-gray-900 mb-2">ยังไม่มีหมวดหมู่</h3>
        <p class="text-sm text-gray-500 mb-4">เริ่มต้นสร้างหมวดหมู่สำหรับจัดระเบียบเนื้อหา</p>
        <button
          @click="addCategory('main')"
          type="button"
          class="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          สร้างหมวดหมู่แรก
        </button>
      </div>

      <div v-else class="space-y-3">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <template v-for="(category) in flattenedCategories">
            <div v-if="category.type === 'main'" :key="category._id" class="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group">
              <div class="p-4">
                <!-- Category Header -->
                <div class="flex items-start space-x-3 mb-3">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                      <font-awesome-icon :icon="['fas','folder']" class="text-blue-600" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-base font-semibold text-gray-900 mb-1">{{ getMainCategoryIndex(category) }}. {{ category.name }}</h3>
                    <p class="text-xs text-gray-500 mb-1">{{ category.code }}</p>
                    <p class="text-sm text-gray-600">{{ category.description }}</p>
                  </div>
                </div>

                <!-- Subcategories Panel -->
                <div class="mb-3">
                  <!-- Subcategories Header -->
                  <div class="flex items-center justify-between py-2 border-t border-gray-100">
                    <div class="flex items-center space-x-2">
                      <button 
                        @click="toggleSubcategories(category._id)"
                        class="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                      >
                        <font-awesome-icon 
                          :icon="['fas', expandedCategories.includes(category._id) ? 'chevron-down' : 'chevron-right']" 
                          class="text-xs transition-transform duration-200"
                        />
                        <span>หมวดหมู่ย่อย ({{ getSubcategories(category._id).length }})</span>
                      </button>
                    </div>
                    <button 
                      @click="addCategory('sub', category)" 
                      class="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-all duration-200"
                    >
                      <font-awesome-icon :icon="['fas','plus']" class="mr-1 text-xs" />
                      เพิ่ม
                    </button>
                  </div>

                  <!-- Subcategories Content (Collapsible) -->
                  <Transition
                    enter-active-class="transition-all duration-300 ease-out"
                    leave-active-class="transition-all duration-300 ease-in"
                    enter-from-class="opacity-0 max-h-0"
                    leave-to-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-96"
                    leave-from-class="opacity-100 max-h-96"
                  >
                    <div v-if="expandedCategories.includes(category._id)" class="overflow-hidden">
                      <div v-if="getSubcategories(category._id).length > 0" class="space-y-2 pt-2">
                        <div v-for="subcategory in getSubcategories(category._id)" :key="subcategory._id" class="bg-gray-50 rounded-md p-3 border border-gray-100">
                          <div class="flex items-center justify-between mb-1">
                            <h4 class="text-sm font-medium text-gray-900">{{ subcategory.name }}</h4>
                            <div class="flex items-center space-x-1">
                              <button @click="openRenameDialog(subcategory)" class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200" title="แก้ไข">
                                <font-awesome-icon :icon="['fas','edit']" class="text-xs" />
                              </button>
                              <button @click="openMoveDialog(subcategory)" class="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-all duration-200" title="ย้าย">
                                <font-awesome-icon :icon="['fas','arrows-alt']" class="text-xs" />
                              </button>
                              <button @click="removeSubcategoryConfirmation(subcategory)" class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200" title="ลบ">
                                <font-awesome-icon :icon="['fas','trash']" class="text-xs" />
                              </button>
                            </div>
                          </div>
                          <p class="text-xs text-gray-500 mb-1">{{ subcategory.code }}</p>
                          <p class="text-xs text-gray-600">{{ subcategory.description }}</p>
                        </div>
                      </div>
                      <div v-else class="pt-2">
                        <div class="text-center py-4 text-xs text-gray-500 bg-gray-50 rounded-md border border-gray-100">
                          ยังไม่มีหมวดหมู่ย่อย
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div class="flex items-center space-x-1">
                    <button @click="moveMainCategoryUp(category)" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200" title="เลื่อนขึ้น">
                      <font-awesome-icon :icon="['fas','chevron-up']" class="text-xs" />
                    </button>
                    <button @click="moveMainCategoryDown(category)" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200" title="เลื่อนลง">
                      <font-awesome-icon :icon="['fas','chevron-down']" class="text-xs" />
                    </button>
                  </div>
                  <div class="flex items-center space-x-1">
                    <button @click="openRenameDialog(category)" class="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200">
                      <font-awesome-icon :icon="['fas','edit']" class="mr-1 text-xs" />
                      แก้ไข
                    </button>
                    <button @click="removeMainCategoryConfirmation(category)" class="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200">
                      <font-awesome-icon :icon="['fas','trash']" class="mr-1 text-xs" />
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- Modern Rename Dialog -->
  <Transition
    enter-active-class="modal-enter-active"
    leave-active-class="modal-leave-active"
    enter-from-class="modal-enter-from"
    leave-to-class="modal-leave-to"
  >
    <div v-if="showRenameDialog" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-25 transition-opacity" @click="closeRenameDialog"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas','edit']" class="text-blue-600 text-sm" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900">แก้ไขข้อมูล</h3>
                <p class="text-xs text-gray-500">{{ selectedCategory?.type === 'main' ? 'หมวดหมู่หลัก' : 'หมวดหมู่ย่อย' }}</p>
              </div>
            </div>
            <button @click="closeRenameDialog" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200">
              <font-awesome-icon :icon="['fas','times']" class="text-sm" />
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อ</label>
              <input 
                v-model="selectedCategory.name" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                placeholder="ระบุชื่อหมวดหมู่"
              />
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">รหัส</label>
              <input 
                v-model="selectedCategory.code" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                placeholder="ระบุรหัสหมวดหมู่"
              />
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">คำอธิบาย</label>
              <textarea 
                v-model="selectedCategory.description" 
                rows="2"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-sm"
                placeholder="ระบุคำอธิบายหมวดหมู่"
              ></textarea>
            </div>
            
            <div class="flex items-center space-x-2">
              <input 
                v-model="selectedCategory.visible" 
                type="checkbox" 
                id="visible-checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label for="visible-checkbox" class="text-xs font-medium text-gray-700">แสดงหมวดหมู่นี้</label>
            </div>
          </div>

          <div class="flex justify-end space-x-2 mt-5">
            <button 
              @click="closeRenameDialog" 
              class="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
            >
              ยกเลิก
            </button>
            <button 
              @click="renameCategory(selectedCategory)" 
              class="px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modern Move Dialog -->
  <Transition
    enter-active-class="modal-enter-active"
    leave-active-class="modal-leave-active"
    enter-from-class="modal-enter-from"
    leave-to-class="modal-leave-to"
  >
    <div v-if="showMoveDialog" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-25 transition-opacity" @click="closeMoveDialog"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas','arrows-alt']" class="text-amber-600 text-sm" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900">ย้ายหมวดหมู่</h3>
                <p class="text-xs text-gray-500">เลือกหมวดหมู่หลักใหม่</p>
              </div>
            </div>
            <button @click="closeMoveDialog" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200">
              <font-awesome-icon :icon="['fas','times']" class="text-sm" />
            </button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">หมวดหมู่หลัก</label>
              <select 
                v-model="selectedCategoryParent" 
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              >
                <option value="">เลือกหมวดหมู่หลัก</option>
                <option v-for="mainCategory in getMainCategories" :key="mainCategory._id" :value="mainCategory._id">
                  {{ mainCategory.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex justify-end space-x-2 mt-5">
            <button 
              @click="closeMoveDialog" 
              class="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
            >
              ยกเลิก
            </button>
            <button 
              @click="updateSelectedCategoryParent" 
              class="px-3 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-all duration-200"
            >
              ย้าย
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modern Confirmation Dialog for Main Categories -->
  <Transition
    enter-active-class="modal-enter-active"
    leave-active-class="modal-leave-active"
    enter-from-class="modal-enter-from"
    leave-to-class="modal-leave-to"
  >
    <div v-if="showConfirmationPopup" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-25 transition-opacity" @click="cancelRemoveMainCategory"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas','exclamation-triangle']" class="text-red-600 text-sm" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900">ยืนยันการลบ</h3>
                <p class="text-xs text-gray-500">หมวดหมู่หลัก</p>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-600">คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่หลักนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
          </div>

          <div class="flex justify-end space-x-2">
            <button 
              @click="cancelRemoveMainCategory" 
              class="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
            >
              ยกเลิก
            </button>
            <button 
              @click="confirmRemoveMainCategory" 
              class="px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modern Confirmation Dialog for Subcategories -->
  <Transition
    enter-active-class="modal-enter-active"
    leave-active-class="modal-leave-active"
    enter-from-class="modal-enter-from"
    leave-to-class="modal-leave-to"
  >
    <div v-if="showSubcategoryConfirmationPopup" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-25 transition-opacity" @click="cancelRemoveSubcategory"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas','exclamation-triangle']" class="text-red-600 text-sm" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900">ยืนยันการลบ</h3>
                <p class="text-xs text-gray-500">หมวดหมู่ย่อย</p>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-600">คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ย่อยนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
          </div>

          <div class="flex justify-end space-x-2">
            <button 
              @click="cancelRemoveSubcategory" 
              class="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
            >
              ยกเลิก
            </button>
            <button 
              @click="confirmRemoveSubcategory" 
              class="px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import storageManager from '@/plugins/storage';

export default {
  name: 'CategoryList',

  components: {
    // Removed Subhead component
  },

  data() {
    return {
      session: storageManager.get('session'),
      configs: storageManager.get('configs'),
      categories: [],
      uniqueIdCounter: 5, // Initial value for the unique ID counter
      showRenameDialog: false,
      selectedCategory: null,
      newCategoryName: '',
      showMoveDialog: false,
      selectedCategoryParent: null,
      showConfirmationPopup: false,
      categoryToRemove: null,
      showSubcategoryConfirmationPopup: false,
      subcategoryToRemove: null,
      rawData: ``,
      tableHeaders: [],
      tableData: [],
      expandedCategories: [],
    };
  },

  computed: {
    flattenedCategories() {
      return this.flattenCategories(this.categories);
    },

    getMainCategories() {
      return this.categories.filter((category) => category.type === 'main');
    },
  },

  async mounted() {
    try {
      await this.getCategoryData();
    } catch (error) {
      console.log(error);
    }
  },

  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.rawData = e.target.result;
        this.convertToTable(); // Call convertToTable after file upload
      };
      reader.readAsText(file);
    },
    convertToTable() {
      const lines = this.rawData.trim().split("\n");
      if (lines.length === 0) return;
      const tableData = [];
      const columnHeaders = lines[0].trim().split(/\s+/);
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].startsWith('H0000010140963012502')) continue; // Skip the line
        const line = lines[i].trim();
        const column1EndIndex = line.indexOf('88011');
        if (column1EndIndex === -1) continue; // Skip the line if "88011" is not found
        const column1 = line.slice(0, column1EndIndex).trim();
        const column2 = line.slice(column1EndIndex).trim();
        const remainingColumns = line.slice(column1EndIndex + 1).trim().split(/\s+/);
        tableData.push([column1, column2, ...remainingColumns]);
      }
      this.tableHeaders = columnHeaders;
      this.tableData = tableData;
    },
    async getCategoryData() {
      try {
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/category/query", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            method: 'find',
            args: [
              {
                $and: [
                  { unit: this.session.current._id },
                ],
              },
            ],
            paging: { page: 1, limit: 200 },
          }),
        });

        if (resAPI.ok) {
          const finalRes = await resAPI.json();
          console.log("finalRes", finalRes);
          this.categories = finalRes.data;
        } else {
          // Handle error condition
        }
      } catch (error) {
        console.error(error);
      }
    },

    async addCategory(mode, category) {
      try {
        console.log("category", category);
        const requestData = {
          unit: this.session.current._id,
          name: 'New Category',
          code: 'category-code',
          description: 'Description for New Category',
          type: 'main', // Default type is 'main'
          visible: true, // Default type is 'main'
          order: 0,
        };

        if (mode === "sub") {
          requestData.type = 'sub';
          requestData.parent = category._id;
        }

        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/category/", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            data: requestData,
            options: {},
          }),
        });

        if (resAPI.ok) {
          await this.getCategoryData();
          const finalRes = await resAPI.json();
          console.log("finalRes", finalRes);
        } else {
          // Handle error condition
        }
      } catch (error) {
        console.error(error);
      }
    },

    async updateCategory(category) {
      try {
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/category/" + category._id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            data: {
              "name": category.name,
              "code": category.code,
              "description": category.description,
              "order": category.order,
              "visible": category.visible,
            },
            options: {},
          }),
        });

        if (resAPI.ok) {
          await this.getCategoryData();
          const finalRes = await resAPI.json();
          console.log("finalRes", finalRes);
        } else {
          // Handle error condition
        }
      } catch (error) {
        console.error(error);
      }
    },

    async deleteCategory(category) {
      try {
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/category/" + category._id, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
        });

        if (resAPI.ok) {
          await this.getCategoryData();
          const finalRes = await resAPI.json();
          console.log("finalRes", finalRes);
        } else {
          // Handle error condition
        }
      } catch (error) {
        console.error(error);
      }
    },

    getMainCategoryIndex(category) {
      const mainCategories = this.flattenedCategories.filter((cat) => cat.type === 'main');
      return mainCategories.findIndex((cat) => cat._id === category._id) + 1;
    },

    flattenCategories(categories) {
      return categories.reduce((result, category) => {
        result.push(category);
        if (category.type === 'main') {
          const subcategories = this.categories.filter((subcategory) => subcategory.type === 'sub' && subcategory.parent === category._id);
          result.push(...subcategories);
        }
        return result;
      }, []);
    },

    getSubcategories(parentId) {
      return this.categories.filter((category) => category.type === 'sub' && category.parent === parentId);
    },

    moveMainCategoryUp(category) {
      const index = this.categories.findIndex((c) => c._id === category._id && c.type === 'main');
      if (index > 0) {
        const movedCategory = this.categories.splice(index, 1)[0];
        this.categories.splice(index - 1, 0, movedCategory);
      }
    },

    moveMainCategoryDown(category) {
      const index = this.categories.findIndex((c) => c._id === category._id && c.type === 'main');
      if (index < this.categories.length - 1) {
        const movedCategory = this.categories.splice(index, 1)[0];
        this.categories.splice(index + 1, 0, movedCategory);
      }
    },

    async removeMainCategoryConfirmation(category) {
      this.categoryToRemove = category;
      this.showConfirmationPopup = true;
    },

    async confirmRemoveMainCategory() {
      try {
        const category = this.categoryToRemove;
        const index = this.categories.findIndex((c) => c._id === category._id && c.type === 'main');

        if (index !== -1) {
          // Remove the main category
          const mainCategory = this.categories.splice(index, 1)[0];

          // Remove the associated subcategories
          const subcategories = this.categories.filter((c) => c.type === 'sub' && c.parent === mainCategory._id);
          this.categories = this.categories.filter((c) => c.type !== 'sub' || c.parent !== mainCategory._id);

          // Remove the subcategories from the server using the deleteCategory method
          for (const subcategory of subcategories) {
            await this.deleteCategory(subcategory);
          }

          await this.deleteCategory(category);
        }

        this.categoryToRemove = null;
        this.showConfirmationPopup = false;
      } catch (error) {
        console.error(error);
      }
    },

    cancelRemoveMainCategory() {
      this.categoryToRemove = null;
      this.showConfirmationPopup = false;
    },

    async removeSubcategoryConfirmation(subcategory) {
      this.subcategoryToRemove = subcategory;
      this.showSubcategoryConfirmationPopup = true;
    },

    async confirmRemoveSubcategory() {
      try {
        const subcategory = this.subcategoryToRemove;
        const index = this.categories.findIndex((c) => c._id === subcategory._id && c.type === 'sub');

        if (index !== -1) {
          this.categories.splice(index, 1);
          await this.deleteCategory(subcategory);
        }

        this.subcategoryToRemove = null;
        this.showSubcategoryConfirmationPopup = false;
      } catch (error) {
        console.error(error);
      }
    },

    cancelRemoveSubcategory() {
      this.subcategoryToRemove = null;
      this.showSubcategoryConfirmationPopup = false;
    },

    openRenameDialog(category) {
      this.selectedCategory = category;
      this.showRenameDialog = true;
    },

    async renameCategory(category) {
      try {
        await this.updateCategory(category);
        this.selectedCategory = null;
        this.showRenameDialog = false;
      } catch (error) {
        console.error(error);
      }
    },

    closeRenameDialog() {
      this.selectedCategory = null;
      this.showRenameDialog = false;
    },

    openMoveDialog(category) {
      this.selectedCategory = category;
      this.selectedCategoryParent = null;
      this.showMoveDialog = true;
    },

    async updateSelectedCategoryParent() {
      try {
        const category = this.selectedCategory;
        const parent = this.selectedCategoryParent;

        if (parent) {
          category.parent = parent;
          await this.updateCategory(category);
        }

        this.selectedCategory = null;
        this.selectedCategoryParent = null;
        this.showMoveDialog = false;
      } catch (error) {
        console.error(error);
      }
    },

    closeMoveDialog() {
      this.selectedCategory = null;
      this.selectedCategoryParent = null;
      this.showMoveDialog = false;
    },

    toggleSubcategories(categoryId) {
      if (this.expandedCategories.includes(categoryId)) {
        this.expandedCategories = this.expandedCategories.filter((id) => id !== categoryId);
      } else {
        this.expandedCategories.push(categoryId);
      }
    },
  },
};
</script>

<style scoped>
/* Modern Design Enhancements */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

/* Collapsible Panel Transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

.ease-in {
  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
}

.duration-300 {
  transition-duration: 300ms;
}

.max-h-0 {
  max-height: 0;
}

.max-h-96 {
  max-height: 24rem;
}

.opacity-0 {
  opacity: 0;
}

.opacity-100 {
  opacity: 1;
}

.overflow-hidden {
  overflow: hidden;
}

/* Card Hover Effects */
.group:hover .group-hover\:bg-blue-100 {
  background-color: #dbeafe;
}

/* Button Hover Effects */
button {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

/* Input Focus States */
input:focus,
textarea:focus,
select:focus {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

/* Smooth Animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Category Card Enhancements */
.category-card {
  @apply bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Subcategory Panel */
.subcategory-panel {
  @apply border-t border-gray-100;
}

.subcategory-header {
  @apply flex items-center justify-between py-2;
}

.subcategory-toggle {
  @apply flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200;
}

.subcategory-content {
  @apply overflow-hidden;
}

/* Subcategory Card */
.subcategory-card {
  @apply bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-all duration-200;
}

/* Icon Containers */
.icon-container {
  @apply flex items-center justify-center rounded-lg transition-all duration-200;
}

.icon-container:hover {
  transform: scale(1.05);
}

/* Action Buttons */
.action-btn {
  @apply inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-all duration-200;
}

.action-btn-primary {
  @apply action-btn text-blue-600 hover:text-blue-700 hover:bg-blue-50;
}

.action-btn-secondary {
  @apply action-btn text-gray-600 hover:text-gray-700 hover:bg-gray-50;
}

.action-btn-danger {
  @apply action-btn text-red-600 hover:text-red-700 hover:bg-red-50;
}

/* Icon Buttons */
.icon-btn {
  @apply p-1 text-gray-400 hover:bg-gray-100 rounded transition-all duration-200;
}

.icon-btn:hover {
  transform: scale(1.1);
}

.icon-btn-blue:hover {
  @apply text-blue-600 bg-blue-50;
}

.icon-btn-amber:hover {
  @apply text-amber-600 bg-amber-50;
}

.icon-btn-red:hover {
  @apply text-red-600 bg-red-50;
}

/* Form Elements */
.form-input {
  @apply w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm;
}

.form-textarea {
  @apply form-input resize-none;
}

.form-select {
  @apply form-input;
}

.form-checkbox {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

/* Modal Backdrop */
.modal-backdrop {
  @apply fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300;
}

/* Modal Container */
.modal-container {
  @apply relative bg-white rounded-xl shadow-xl max-w-md w-full p-5;
}

/* Button Variants */
.btn-primary {
  @apply px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200;
}

.btn-secondary {
  @apply px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200;
}

.btn-danger {
  @apply px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200;
}

.btn-warning {
  @apply px-3 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-all duration-200;
}

/* Empty State */
.empty-state {
  @apply text-center py-8;
}

.empty-state-icon {
  @apply w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3;
}

.empty-state-title {
  @apply text-base font-medium text-gray-900 mb-2;
}

.empty-state-description {
  @apply text-sm text-gray-500 mb-4;
}

/* Chevron Animation */
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Loading States */
.loading-spinner {
  @apply inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    @apply mx-4;
  }
  
  .grid {
    @apply grid-cols-1;
  }
  
  .action-btn {
    @apply px-2 py-1 text-xs;
  }
  
  .max-h-96 {
    max-height: 16rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .dark-mode {
    @apply bg-gray-900 text-white;
  }
  
  .dark-mode .modal-container {
    @apply bg-gray-800 border-gray-700;
  }
  
  .dark-mode .form-input {
    @apply bg-gray-700 border-gray-600 text-white;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus States */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}

/* Animation Keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Utility Classes */
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.4s ease-out;
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .high-contrast {
    @apply border-2 border-black;
  }
}

/* Subcategory Panel Specific Styles */
.subcategory-panel-header {
  @apply flex items-center justify-between py-2 border-t border-gray-100;
}

.subcategory-toggle-btn {
  @apply flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200;
}

.subcategory-add-btn {
  @apply inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-all duration-200;
}

.subcategory-empty-state {
  @apply text-center py-4 text-xs text-gray-500 bg-gray-50 rounded-md border border-gray-100;
}

/* Enhanced Collapsible Animation */
.collapsible-enter-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}

.collapsible-leave-active {
  transition: all 0.3s ease-in;
  overflow: hidden;
}

.collapsible-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.collapsible-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.collapsible-enter-to {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

.collapsible-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}
</style>
