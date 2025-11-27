<template>
  <main>
    <div class="bg-gray-100 border-b border-gray-200">

      <div v-if="this.deviceType==='desktop'" class="mx-auto max-w-2xl px-4 pt-3 pb-3 sm:px-18 sm:pt-3 sm:pb-3 d lg:max-w-7xl">
        <div class="flex items-center justify-between">
          <div class="relative inline-block text-left">
            <div>
              <button type="button" class="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900" id="sort-menu-button" aria-expanded="false" aria-haspopup="true" @click="toggleSortMenu">
                เรียงสินค้า
                <svg class="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          
            <div v-if="sortMenuOpen" class="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="sort-menu-button" tabindex="-1">
              <div class="py-1" role="none">
                <!-- Active: "bg-gray-100", Not Active: "" -->
                <a href="#" class="block px-4 py-2 text-sm font-medium text-gray-900" role="menuitem" tabindex="-1" id="sort-menu-item-0">Most Popular</a>
                <a href="#" class="block px-4 py-2 text-sm font-medium text-gray-900" role="menuitem" tabindex="-1" id="sort-menu-item-1">Best Rating</a>
                <a href="#" class="block px-4 py-2 text-sm font-medium text-gray-900" role="menuitem" tabindex="-1" id="sort-menu-item-2">Newest</a>
                <a href="#" class="block px-4 py-2 text-sm font-medium text-gray-900" role="menuitem" tabindex="-1" id="sort-menu-item-3">Price: Low to High</a>
                <a href="#" class="block px-4 py-2 text-sm font-medium text-gray-900" role="menuitem" tabindex="-1" id="sort-menu-item-4">Price: High to Low</a>
              </div>
            </div>
          </div>

          <div class="inline-block text-sm font-bold text-gray-700">รายการสินค้า</div>

          <div class="hidden sm:flex sm:items-baseline sm:space-x-8">
            <div id="category-menu" class="relative inline-block text-left">
              <div>
                <button type="button" class="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900" aria-expanded="false" @click="toggleCategoryMenu">
                  <span>หมวดหมู่สินค้า</span>
                  <span class="ml-1.5 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-gray-700">{{ selectedCategories.length }}</span>
                  <svg class="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            
              <div v-if="categoryMenuOpen" class="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                <form class="space-y-4">
                  <div v-for="category in categories" :key="category.id" class="flex items-center">
                    <input :id="`filter-category-${category.id}`" :name="`category[]`" :value="category.value" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" @change="toggleCategory(category.value)">
                    <label :for="`filter-category-${category.id}`" class="ml-3 whitespace-nowrap pr-6 text-sm font-medium text-gray-900">{{ category.label }}</label>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="this.deviceType==='mobile'" class="mx-auto max-w-2xl px-4 pt-3 pb-3 sm:px-18 sm:pt-3 sm:pb-3 d lg:max-w-7xl">
        <div class="flex items-center justify-between">
          <div class="relative inline-block text-left">
            <div>
              <button type="button" class="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900" id="sort-menu-button" aria-expanded="false" aria-haspopup="true" @click="toggleCategoryMenu">
                หมวดหมู่สินค้า
                <svg class="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          
            <div v-if="categoryMenuOpen" class="absolute left-0 z-10 mt-2 w-40 origin-top-left rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="sort-menu-button" tabindex="-1">
              <form class="space-y-4">
                <div v-for="category in categories" :key="category.id" class="flex items-center">
                  <input :id="`filter-category-${category.id}`" :name="`category[]`" :value="category.value" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" @change="toggleCategory(category.value)">
                  <label :for="`filter-category-${category.id}`" class="ml-3 whitespace-nowrap pr-6 text-sm font-medium text-gray-900">{{ category.label }}</label>
                </div>
              </form>
            </div>
          </div>

          <div class="inline-block text-sm font-bold text-gray-700">รายการสินค้า</div>

        </div>
      </div>

    </div>

    <div class="mx-auto max-w-3xl px-2 sm:px-3 lg:max-w-7xl lg:px-4 mb-12">

      <!-- Product grid -->
      <section aria-labelledby="products-heading" class="mt-8">
        <h2 id="products-heading" class="sr-only">Products</h2>
      
        <div class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          <router-link v-for="(product) in products" :key="product._id" :to="'/shop/product/' + product._id" class="group relative flex flex-col justify-between">
            <span v-if="product.regularPrice > product.salePrice && product.salePrice > 0" class="absolute top-2 right-2 z-10 px-2 py-1 bg-red-500 text-white text-xs rounded">Sale</span>
            <div class="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg sm:aspect-h-3 sm:aspect-w-2">
              <img src="https://tailwindui.com/img/ecommerce-images/product-page-01-featured-product-shot.jpg" alt="Person using a pen to cross a task off a productivity paper card." class="h-full w-full object-cover object-center group-hover:opacity-75">
            </div>
            <div class="mt-4">
              <h3 :class="['text-base', 'h-12', 'font-medium', 'text-gray-900', 'clamp-lines-2', {'align-top': product.name.length < 26}]">{{ product.name }}</h3>
              <p class="mt-3 text-lg text-gray-900 flex-grow">
                <template v-for="(item, index) in formatPrice(product.regularPrice, product.salePrice)" :key="index">
                  <span :class="item.size" v-html="item.text"></span>
                </template>
              </p>
            </div>
          </router-link>
        </div>
        
      </section>
      
    </div>
  </main>

  </template>
  
  <script>

  import storageManager from '@/plugins/storage';
  import convertUtils from "@/plugins/convertUtils";
  import deviceUtils from "@/plugins/DeviceUtils";

  export default {
    data() {
      return {
        configs: storageManager.get('configs'),
        deviceType: deviceUtils.deviceDetect(),
        sortMenuOpen: false,
        categoryMenuOpen: false,
        categories: [
          { id: 0, value: "tees", label: "Tees" },
          { id: 1, value: "crewnecks", label: "Crewnecks" },
          { id: 2, value: "hats", label: "Hats" },
          { id: 3, value: "bundles", label: "Bundles" },
          { id: 4, value: "carry", label: "Carry" },
          { id: 5, value: "objects", label: "Objects" }
        ],
        selectedCategories: [],
        products: [],
      };
    },
    async mounted() {
      try {
        await this.getProductData();
      } catch (error) {
        console.log(error);
      }
    },
    methods: {
      toggleSortMenu() {
        this.sortMenuOpen = !this.sortMenuOpen;
      },
      toggleCategoryMenu() {
        this.categoryMenuOpen = !this.categoryMenuOpen;
      },
      toggleCategory(value) {
        const index = this.selectedCategories.indexOf(value);
        if (index > -1) {
          this.selectedCategories.splice(index, 1);
        } else {
          this.selectedCategories.push(value);
        }
      },
      formatPrice(regular,sale) {
        return convertUtils.formatPriceRaw(regular,sale);
      },
      async getProductData() {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/product/query", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              method: 'find',
              args: [
                {
                  $and: [
                   { 
                    unit: this.configs.siteID,
                    type: 'main'
                   },
                  ],
                },
              ],
              paging: { page: 1, limit: 200 },
            }),
          });
          if (resAPI.ok) {
            const finalRes = await resAPI.json();
            this.products = finalRes.data;
          } else {
            // Handle error condition
          }
        } catch (error) {
          console.error(error);
        }
      },
    }
  };
  </script>
  
  <style>
  .clamp-lines-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .align-top {
    display: flex;
    align-items: flex-start;
  }
  </style>
  