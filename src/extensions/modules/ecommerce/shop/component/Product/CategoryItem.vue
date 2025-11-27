<template>
    <li>
      <span>{{ category.name }} ({{ category.code }})</span>
      <button @click="prepareEditSubCategory">Edit</button>
      <button @click="removeSubCategory">Delete</button>
      <button @click="toggleSubcategories">Toggle Subcategories</button>
      <ul v-if="showSubcategories">
        <product-category-item
          v-for="subCategory in category.subCategories"
          :key="subCategory._id"
          :category="subCategory"
          @remove="handleRemoveSubCategory"
          @update="handleUpdateSubCategory"
          @add="handleAddSubCategory"
        />
      </ul>
      <div v-if="showSubCategoryConfig">
        <label for="subCategoryName">Name</label>
        <input id="subCategoryName" v-model="subCategoryData.name" placeholder="Name" />
  
        <label for="subCategoryCode">Code</label>
        <input id="subCategoryCode" v-model="subCategoryData.code" placeholder="Code" />
  
        <button @click="saveSubCategory">{{ editingSubCategory ? 'Update Sub-Category' : 'Add Sub-Category' }}</button>
      </div>
      <button @click="showAddSubCategory">Add New Sub-Category</button>
    </li>
  </template>
  
  <script>
  export default {
    props: {
      category: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        subCategoryData: { _id: '', name: '', code: '', subCategories: [] },
        showSubCategoryConfig: false,
        editingSubCategory: false,
        showSubcategories: false,
      };
    },
    methods: {
      prepareEditSubCategory() {
        this.subCategoryData = { ...this.category };
        this.showSubCategoryConfig = true;
        this.editingSubCategory = true;
      },
      saveSubCategory() {
        if (this.editingSubCategory) {
          this.$emit('update', this.subCategoryData);
        } else {
          const newSubCategory = { ...this.subCategoryData, _id: new Date().getTime().toString() }; // Generate a temporary ID
          this.$emit('add', newSubCategory);
        }
        this.showSubCategoryConfig = false;
        this.resetSubCategoryData();
      },
      removeSubCategory() {
        this.$emit('remove', this.category._id);
      },
      showAddSubCategory() {
        this.resetSubCategoryData();
        this.showSubCategoryConfig = true;
        this.editingSubCategory = false;
      },
      resetSubCategoryData() {
        this.subCategoryData = { _id: '', name: '', code: '', subCategories: [] };
      },
      toggleSubcategories() {
        this.showSubcategories = !this.showSubcategories;
      },
      handleRemoveSubCategory(subCategoryId) {
        const subCategories = this.category.subCategories.filter(sc => sc._id !== subCategoryId);
        this.$emit('update', { ...this.category, subCategories });
      },
      handleUpdateSubCategory(subCategory) {
        const subCategoryIndex = this.category.subCategories.findIndex(sc => sc._id === subCategory._id);
        if (subCategoryIndex !== -1) {
          const subCategories = [...this.category.subCategories];
          subCategories.splice(subCategoryIndex, 1, subCategory);
          this.$emit('update', { ...this.category, subCategories });
        }
      },
      handleAddSubCategory(subCategory) {
        const subCategories = [...this.category.subCategories, subCategory];
        this.$emit('update', { ...this.category, subCategories });
      },
    },
  };
  </script>
  