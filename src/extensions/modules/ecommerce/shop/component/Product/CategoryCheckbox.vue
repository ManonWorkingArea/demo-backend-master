<template>
    <li>
      <input
        type="checkbox"
        :value="category._id"
        v-model="selectedCategories"
      />
      {{ category.name }}
      <ul v-if="category.subCategories && category.subCategories.length">
        <category-checkbox
          v-for="subCategory in category.subCategories"
          :key="subCategory._id"
          :category="subCategory"
          v-model="selectedCategories"
        ></category-checkbox>
      </ul>
    </li>
  </template>
  
  <script>
  export default {
    name: 'CategoryCheckbox',
    props: {
      category: Object,
      value: Array,
    },
    computed: {
      selectedCategories: {
        get() {
          return this.value;
        },
        set(val) {
          this.$emit('input', val);
        },
      },
    },
  };
  </script>
  