<template>
    <Subhead
      :navigation="[
        {
          name: 'ย้อนกลับ',
          link: '/shop/products',
          style: 'chevron-left',
          class: 'default-btn',
          visible: true,
          type: 'button',
        },
        {
          name: 'เพิ่มหมวดหมู่',
          function: 'addCategory',
          style: 'plus',
          class: 'primary-btn',
          visible: true,
          type: 'button',
        },
      ]"
      @addCategory="addCategory('main')"
    />
    <div class="mx-auto max-w-7xl px-4 mt-5 mb-8 sm:px-6">
  
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <template v-for="(category) in flattenedCategories">
          <div v-if="category.type === 'main'" :key="category._id" class="bg-white p-5 rounded-sm shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-md font-semibold">{{ getMainCategoryIndex(category) }}.{{ category.name }}</h3>
              
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ category.code }}</p>
            <p class="text-sm text-gray-600 mt-1">{{ category.description }}</p>
            <ul class="list-disc ml-8 space-y-4 mt-4">
              <li v-for="subcategory in getSubcategories(category._id)" :key="subcategory._id" class="border-b border-gray-200 py-2">
                <div class="flex items-center justify-between">
                  <h4 class="text-md font-medium">{{ subcategory.name }}</h4>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ subcategory.code }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ subcategory.description }}</p>
                <div class="space-x-2">
                  <button @click="openRenameDialog(subcategory)" class="text-sm text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas','edit']" class="pr-2"/>แก้ไข</button>
                  <button @click="openMoveDialog(subcategory)" class="text-sm text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas','arrows-alt']" class="pr-2 pl-2"/>ย้าย</button>
                  <button @click="removeSubcategoryConfirmation(subcategory)" class="text-sm text-red-500 hover:text-red-700"><font-awesome-icon :icon="['fas','trash']" class="pr-2 pl-2"/>ลบ</button>
                </div>
              </li>
            </ul>
            <div class="mt-4 flex justify-between">
              <div class="space-x-2">
                <button @click="moveMainCategoryUp(category)" class="text-sm text-gray-500 hover:text-gray-700">
                  <font-awesome-icon :icon="['fas','chevron-up']" class="pr-2 pl-2"/>
                </button>
                <button @click="moveMainCategoryDown(category)" class="text-sm text-gray-500 hover:text-gray-700">
                  <font-awesome-icon :icon="['fas','chevron-down']" class="pr-2 pl-2"/>
                </button>
              </div>
              <div class="space-x-2">
                <button @click="openRenameDialog(category)" class="text-sm text-gray-500 hover:text-gray-700">
                  <font-awesome-icon :icon="['fas','edit']" class="pl-2"/> เปลี่ยนชื่อ
                </button>
                <button @click="addCategory('sub', category)" class="text-sm text-gray-500 hover:text-gray-700">
                  <font-awesome-icon :icon="['fas','plus']" class="pl-2"/> หมวดหมู่ย่อย
                </button>
                <button @click="removeMainCategoryConfirmation(category)" class="text-sm text-red-500 hover:text-red-700">
                  <font-awesome-icon :icon="['fas','trash']" class="pl-2"/> ลบ
                </button>
              </div>
            </div>
            
          </div>
        </template>
      </div>
    </div>
  
    <!-- Rename Dialog -->
    <div v-if="showRenameDialog" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">เปลี่ยนชื่อ {{ selectedCategory.type === 'main' ? 'Main Category' : 'Subcategory' }}</h4>
        <div class="flex flex-col space-y-2">
          <label for="newName" class="font-medium font-sm">ชื่อใหม่</label>
          <input v-model="selectedCategory.name" type="text" id="newName" placeholder="Enter the new name" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
          <label for="newCode" class="font-medium">รหัสใหม่</label>
          <input v-model="selectedCategory.code" type="text" id="newCode" placeholder="Enter the new code" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
          <label for="newDescription" class="font-medium">คำอธิบาย</label>
          <textarea v-model="selectedCategory.description" id="newDescription" placeholder="Enter the new description" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500"></textarea>
        </div>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="renameCategory(selectedCategory)" class="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Rename</button>
          <button @click="closeRenameDialog" class="px-6 py-2 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-700 focus:outline-none">Cancel</button>
        </div>
      </div>
    </div>
  
    <!-- Move Dialog -->
    <div v-if="showMoveDialog" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">Move Category</h4>
        <div class="flex flex-col space-y-4">
          <label for="selectedParent" class="font-medium">Select New Parent Category</label>
          <select v-model="selectedCategoryParent" id="selectedParent" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
            <option value="">Select a main category</option>
            <option v-for="mainCategory in getMainCategories" :key="mainCategory._id" :value="mainCategory._id">{{ mainCategory.name }}</option>
          </select>
        </div>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="updateSelectedCategoryParent" class="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Move</button>
          <button @click="closeMoveDialog" class="px-6 py-2 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-700 focus:outline-none">Cancel</button>
        </div>
      </div>
    </div>
  
    <!-- Confirmation Popup for Main Categories -->
    <div v-if="showConfirmationPopup" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">Confirm Remove Main Category</h4>
        <p>Are you sure you want to remove the main category?</p>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="confirmRemoveMainCategory" class="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">Remove</button>
          <button @click="cancelRemoveMainCategory" class="px-6 py-2 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-700 focus:outline-none">Cancel</button>
        </div>
      </div>
    </div>
  
    <!-- Confirmation Popup for Subcategories -->
    <div v-if="showSubcategoryConfirmationPopup" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">Confirm Remove Subcategory</h4>
        <p>Are you sure you want to remove the subcategory?</p>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="confirmRemoveSubcategory" class="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">Remove</button>
          <button @click="cancelRemoveSubcategory" class="px-6 py-2 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-700 focus:outline-none">Cancel</button>
        </div>
      </div>
    </div>
    
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import Subhead from '@/interface/template/outline/Subhead.vue';
  
  export default {
    name: 'CategoryList',
  
    components: {
      Subhead,
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
      async getCategoryData() {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/shop_category/query", {
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
            order: 0,
          };
  
          if (mode === "sub") {
            requestData.type = 'sub';
            requestData.parent = category._id;
          }
  
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/shop_category/", {
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
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/shop_category/" + category._id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: {
                "name": category.name,
                "code": category.code,
                "description": category.description,
                "order": category.order,
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
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/shop_category/" + category._id, {
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
    },
  };
  </script>
  
  <style scoped>
  /* Add your custom styles here */
  </style>
  