<template>
    <div>
      <h1>Category Manager</h1>
      <button @click="fetchCategories">Load Categories</button>
      <ul>
        <li v-for="(category, index) in nestedCategoryList" :key="category._id">
          <span>{{ category.name }} ({{ category.code }}) - Parent: {{ getCategoryName(category.parent) }}</span>
          <button @click="prepareEditCategory(category)">Update</button>
          <button @click="removeCategory(category._id, index)">Delete</button>
          <ul v-if="category.subCategories && category.subCategories.length">
            <li v-for="(subCategory, subIndex) in category.subCategories" :key="subCategory._id">
              <span>{{ subCategory.name }} ({{ subCategory.code }})</span>
              <button @click="prepareEditCategory(subCategory)">Update</button>
              <button @click="removeCategory(subCategory._id, subIndex)">Delete</button>
            </li>
          </ul>
        </li>
      </ul>
      <div v-if="showCategoryConfig">
        <h2>Edit Category</h2>
        <label for="categoryName">Name</label>
        <input id="categoryName" v-model="categoryData.name" placeholder="Name" />
  
        <label for="categoryCode">Code</label>
        <input id="categoryCode" v-model="categoryData.code" placeholder="Code" />
  
        <label for="categoryParent">Parent</label>
        <select id="categoryParent" v-model="categoryData.parent">
          <option value="">None</option>
          <option v-for="parentCategory in categoryList" :key="parentCategory._id" :value="parentCategory._id">{{ parentCategory.name }}</option>
        </select>
  
        <button @click="updateCategory">Save Changes</button>
      </div>
      <div>
        <h2>Add Category</h2>
        <label for="newCategoryName">Name</label>
        <input id="newCategoryName" v-model="newCategory.name" placeholder="Name" />
  
        <label for="newCategoryCode">Code</label>
        <input id="newCategoryCode" v-model="newCategory.code" placeholder="Code" />
  
        <label for="newCategoryParent">Parent</label>
        <select id="newCategoryParent" v-model="newCategory.parent">
          <option value="">None</option>
          <option v-for="parentCategory in categoryList" :key="parentCategory._id" :value="parentCategory._id">{{ parentCategory.name }}</option>
        </select>
  
        <button @click="addCategory">Add Category</button>
      </div>
    </div>
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import requestClient from '@/plugins/requestClient';
  const Request = new requestClient(false);
  
  export default {
    data() {
      return {
        categoryList: [],
        nestedCategoryList: [],
        categoryData: { _id: '', name: '', code: '', parent: '' },
        newCategory: { name: '', code: '', parent: '' },
        showCategoryConfig: false,
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
      };
    },
    methods: {
      async fetchCategories() {
        try {
          const response = await Request.POST('product_category/query', { method: 'find', args: [{ $and: [{ unit: this.session.current._id }] }] }, this.configs.key);
          if (response.status === 200) {
            this.categoryList = response.data;
            this.nestedCategoryList = this.createNestedCategoryList(this.categoryList);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      },
      createNestedCategoryList(categories) {
        const categoryMap = {};
        categories.forEach(category => {
          categoryMap[category._id] = { ...category, subCategories: [] };
        });
  
        const nestedList = [];
        categories.forEach(category => {
          if (category.parent) {
            if (categoryMap[category.parent]) {
              categoryMap[category.parent].subCategories.push(categoryMap[category._id]);
            }
          } else {
            nestedList.push(categoryMap[category._id]);
          }
        });
  
        return nestedList;
      },
      prepareEditCategory(category) {
        this.categoryData = { ...category };
        this.showCategoryConfig = true;
      },
      async updateCategory() {
        try {
          const response = await Request.PUT(`product_category/${this.categoryData._id}`, { data: { ...this.categoryData, _id: undefined } }, this.configs.key);
          if (response.status === 200) {
            await this.fetchCategories();
            this.showCategoryConfig = false;
            this.resetCategoryData();
          }
        } catch (error) {
          console.error('Error updating category:', error);
        }
      },
      async removeCategory(categoryId) {
        try {
          const response = await Request.DELETE(`product_category/${categoryId}`, '', this.configs.key);
          if (response.status === 200) this.fetchCategories();
        } catch (error) {
          console.error('Error deleting category:', error);
        }
      },
      async addCategory() {
        try {
          const response = await Request.POST('product_category/', { data: { ...this.newCategory, unit: this.session.current._id || this.configs.siteID } }, this.configs.key);
          if (response.status === 200) {
            await this.fetchCategories();
            this.resetNewCategory();
          }
        } catch (error) {
          console.error('Error adding category:', error);
        }
      },
      resetNewCategory() {
        this.newCategory = { name: '', code: '', parent: '' };
      },
      resetCategoryData() {
        this.categoryData = { _id: '', name: '', code: '', parent: '' };
      },
      getCategoryName(categoryId) {
        const category = this.categoryList.find(cat => cat._id === categoryId);
        return category ? category.name : 'None';
      }
    },
    async mounted() {
      await this.fetchCategories();
    }
  };
  </script>
  