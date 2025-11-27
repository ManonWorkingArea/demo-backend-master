<script>

import convertUtils from "@/plugins/convertUtils";
import { addToCart } from '@/plugins/cart.js';
import LoginPopup from '@/utils/LoginPopup.vue';
import storageManager from '@/plugins/storage';
import deviceUtils from "@/plugins/DeviceUtils";

export default {
  inject: ['eventBus'],
  name: 'ProductDetail',
  components: {
    LoginPopup,
	},
  data() {
    return {
      login: storageManager.get('session','login'),
      configs: storageManager.get('configs'),
      deviceType: deviceUtils.deviceDetect(),
      mainSKU: this.$route.params.id,
      variantSKU: this.$route.params.variant,
      mainProduct: [],
      isLoading: true,
      isError: false,
      selectedTerms: {},
      matchingItem: {},
      quantity: 1,
    };
  },
  mounted() {
    this.fetchMainProduct();
  },
  watch: {
  selectedTerms: {
    handler() {
      if (this.selectedTermCount === this.totalTermOptionsCount) {
        this.findMatchingItem();
      }
    },
    deep: true,
  },
  variantSKU: {
    handler() {
      if (this.variantSKU) {
        console.log("variantSKU found");
      }
    },
    immediate: true,
  },
},
  computed: {
    availableOptions() {
      return this.mainProduct?.configurableOptions?.map(option => {
        const selectedTerm = this.selectedTerms[option.option];
        const filteredTerms = option.terms.filter(term => this.shouldShowOption(option.option, term.code));
        return {
          ...option,
          filteredTerms,
          selectedTerm: selectedTerm || null
        };
      });
    },
    selectedTermCount() {
      return Object.keys(this.selectedTerms).length;
    },
    totalTermOptionsCount() {
      if (!this.availableOptions || !Array.isArray(this.availableOptions)) {
        return 0;
      }
      return this.availableOptions.length;
    },
    productName() {
      if (this.selectedTermCount < this.totalTermOptionsCount) {
        return this.mainProduct.name;
      } else if (this.matchingItem) {
        return this.matchingItem.name;
      } else {
        return this.mainProduct.name;
      }
    }
  },
  methods: {
    emitEvent() {
      this.eventBus.emit('cart-event', 'Event payload');
    },
    handleLoginSuccess() {
      console.log("Login Success");
    },
    changePageName()
    {
      console.log("changePageName" , this.matchingItem.name);
      this.$setPageTitle(this.matchingItem.name);
    },
    resetSelectedTerms() {
      this.selectedTerms = {};
      this.matchingItem = {};

      const updatedUrl = `/shop/product/${this.$route.params.id}`;
      window.history.replaceState({}, '', updatedUrl);
    },
    formatPrice(regular,sale) {
      return convertUtils.formatPriceRaw(regular,sale);
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    increaseQuantity() {
      if (this.matchingItem && this.quantity < this.matchingItem.stock) {
        this.quantity++;
      }
    },
    findMatchingItem() {
      const matchingItem = this.mainProduct.subProducts.find((subProduct) => {
        return Object.entries(this.selectedTerms).every(([option, term]) => {
          return subProduct.config.includes(`${option} : ${term}`);
        });
      });

      if (matchingItem) {
      this.variantSKU = matchingItem.sku;
      console.log("Matching item found:", matchingItem);
      const skuParam = matchingItem.sku; // Get the SKU value
      // Update the URL parameter
      const updatedUrl = `/shop/product/${this.$route.params.id}/${skuParam}`;
      window.history.replaceState({}, '', updatedUrl);
    } else {
      const updatedUrl = `/shop/product/${this.$route.params.id}`;
      window.history.replaceState({}, '', updatedUrl);
    }

      this.matchingItem = matchingItem;
      this.changePageName()
    },
    shouldShowOption(option, term) {
      const selectedTerms = { ...this.selectedTerms };
      selectedTerms[option] = term;
      return this.mainProduct.subProducts.some(subProduct => {
        return Object.entries(selectedTerms).every(([option, term]) => {
        return subProduct[option] === term;
        });
      });
    },
    selectTerm(option, term) {
      this.selectedTerms = {
        ...this.selectedTerms,
        [option]: term
      };
      this.quantity = 1;
      const selectedTerms = { ...this.selectedTerms };
      const subProduct = this.mainProduct?.subProducts?.find(product => {
        return Object.entries(selectedTerms).every(([option, term]) => {
          return product[option] === term;
        });
      });
      if (subProduct) {
        this.mainProduct = { ...subProduct };
      }
    },
    async fetchMainProduct() {
      const mainProductId = this.mainSKU; // Replace <mainProductId> with the actual main product ID
      const pipeline = [
        {
          $match: {
            _id: mainProductId,
            type: "main",
          },
        },
        {
          $lookup: {
            from: "product",
            let: { mainId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$parent", { $toString: "$$mainId" }],
                  },
                },
              },
            ],
            as: "subProducts",
          },
        },
      ];
  
      try {
        const response = await fetch(
          `https://gateway.cloudrestfulapi.com/api/product/aggregate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",'client-token-key':this.configs.key,
            },
            body: JSON.stringify({ pipeline }),
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to fetch main product");
        }
  
        const data = await response.json();
        this.mainProduct = data[0];
        //console.log("Main Product", this.mainProduct);
        this.$setPageTitle(this.mainProduct.name);

        if(this.mainProduct.option==='simple')
        {
          this.selectedTerms = this.mainProduct
          this.matchingItem = this.mainProduct
        }

        if (this.variantSKU) {
          const matchingItem = this.mainProduct.subProducts.find((subProduct) => subProduct.sku === this.variantSKU);
          if (matchingItem && matchingItem.config) {
            this.selectedTerms = matchingItem.config.reduce((terms, option) => {
              const [key, value] = option.split(" : ");
              terms[key] = value;
              return terms;
            }, {});
          } else {
            this.selectedTerms = {};
          }
          this.$setPageTitle(matchingItem.name);
        }
        this.isLoading = false;
      } catch (error) {
        //console.error("Error fetching main product:", error);
        this.isError = true;
        this.isLoading = false;
      }
    },
    addToCart() {

      let price;

      if (this.matchingItem.salePrice === 0 || this.matchingItem.salePrice === null || this.matchingItem.salePrice === undefined || this.matchingItem.salePrice === '' || (typeof this.matchingItem.salePrice === 'string' && this.matchingItem.salePrice.trim() === '')) {
        price = this.matchingItem.regularPrice;
      } else if (this.matchingItem.salePrice < this.matchingItem.regularPrice) {
        price = this.matchingItem.salePrice;
      } else {
        price = this.matchingItem.regularPrice;
      }

      const item = {
        productId: this.matchingItem._id,
        name: this.matchingItem.name,
        price: price,
        quantity: this.quantity,
      };

      console.log(this.matchingItem)
      console.log(price)

      addToCart(item, item.quantity)
        .then(async (message) => {
          await this.fetchMainProduct();

          this.eventBus.emit('cart-event', 'Event payload');

          this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 4000,
              icon: 'success',
              title: 'เพิ่มสินค้า',
              text: 'เพิ่ม ' + item.name + ' จำนวน '+ item.quantity +' ชิ้น เข้าตะกร้าเรียบร้อยแล้ว',
          }).then(() => 
          {
            
          });
          console.log(message);
        })
        .catch((error) => {
          console.error('Error adding item to cart:', error);
        });
    }

  },
};
</script>

<template>
    <!-- Loading state -->
    <div v-if="isLoading" class="absolute text-center"></div>

    <!-- Error state -->
    <div v-if="isError" class="text-center text-red-500">Error occurred while fetching data.</div>

    <div class="bg-gray-100 border-b border-gray-200">
      <div v-if="this.deviceType==='desktop'" class="mx-auto max-w-2xl px-4 pt-3 pb-3 sm:px-18 sm:pt-3 sm:pb-3 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-4 ">


        <div class="lg:flex lg:items-center lg:justify-between">
          <div>
            <nav class="flex" aria-label="Breadcrumb">
              <ol role="list" class="flex items-center space-x-4">
                <li>
                  <div>
                    <router-link :to="'/'" class="text-gray-400 hover:text-gray-500">
                      <svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
                      </svg>
                      <span class="sr-only">หน้าหลัก</span>
                    </router-link>
                  </div>
                </li>
        
                <li>
                  <div class="flex items-center">
                    <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                    <router-link :to="'/shop/products'" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 truncate">รายการสินค้า</router-link>
                  </div>
                </li>
        
                <li>
                  <div class="flex items-center">
                    <svg class="h-5 w-5 flex-shrink-0 text-gray-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                    <span class="ml-4 text-sm font-bold text-gray-600 hover:text-gray-700 truncate">{{productName}}</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>
        

      </div>

      <div v-if="this.deviceType==='mobile'" class="mx-auto max-w-2xl px-4 pt-3 pb-3 sm:px-18 sm:pt-3 sm:pb-3 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-4 ">

        <div class="grid grid-cols-2 gap-x-4">
          <router-link :to="'/'" class="text-sm font-medium text-gray-500 hover:text-gray-700 justify-self-start">
            <font-awesome-icon :icon="['fas', 'home']" />
            <span class="ml-1">หน้าหลัก</span>
          </router-link>
          <router-link :to="'/shop/products'" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 justify-self-end">
            <font-awesome-icon :icon="['fas', 'chevron-left']" />
            <span class="ml-1">รายการสินค้า</span>
          </router-link>
        </div>

      </div>
    </div>
    
    <div class="bg-white">
        <div class="pb-16 pt-6 sm:pb-24">

          <div class="mx-auto mt-4 sm:mt-8 max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <div class="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
              <div class="lg:col-span-5 lg:col-start-8">
                <div class="flex justify-between">
                  <h1 class="text-xl font-medium text-gray-900">
                    {{ productName }}
                  </h1>
                  
                </div>                
                <p class="text-gray-500"><font-awesome-icon :icon="['fas','box-open']" class="w-4 h-4 text-gray-400"/> มีสินค้าทั้งหมด : <span class="font-bold">{{mainProduct.stock}}</span> ชิ้น</p>

                <p class="block relative text-3xl mt-2 font-medium text-gray-900">
                  <template v-for="(item, index) in formatPrice(mainProduct.regularPrice, mainProduct.salePrice)" :key="index">
                    <span :class="item.size" v-html="item.text"></span>
                  </template>
                </p>
                
                <!-- Reviews -->
                <div class="mt-4">
                  <h2 class="sr-only">Reviews</h2>
                  <div class="flex items-center">
                    <p class="text-sm text-gray-700">
                      3.9
                      <span class="sr-only"> out of 5 stars</span>
                    </p>
                    <div class="ml-1 flex items-center">
                      <!-- Active: "text-yellow-400", Inactive: "text-gray-200" -->
                      <svg class="text-yellow-400 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd" />
                      </svg>
                      <svg class="text-yellow-400 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd" />
                      </svg>
                      <svg class="text-yellow-400 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd" />
                      </svg>
                      <svg class="text-yellow-400 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd" />
                      </svg>
                      <svg class="text-gray-200 h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div aria-hidden="true" class="ml-4 text-sm text-gray-300">·</div>
                    <div class="ml-4 flex">
                      <a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">See all 512 reviews</a>
                    </div>
                  </div>
                </div>
              </div>
      
              <!-- Image gallery -->
              <div class="mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0">
                <h2 class="sr-only">Images</h2>
      
                <div class="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-3 lg:gap-8">
                  <img src="https://tailwindui.com/img/ecommerce-images/product-page-01-featured-product-shot.jpg" alt="Back of women&#039;s Basic Tee in black." class="lg:col-span-2 lg:row-span-2 rounded-lg">
                  <img src="https://tailwindui.com/img/ecommerce-images/product-page-01-product-shot-01.jpg" alt="Side profile of women&#039;s Basic Tee in black." class="hidden lg:block rounded-lg">
                  <img src="https://tailwindui.com/img/ecommerce-images/product-page-01-product-shot-02.jpg" alt="Front of women&#039;s Basic Tee in black." class="hidden lg:block rounded-lg">
                </div>
              </div>
      
              <div class="mt-4 border-t border-gray-100 lg:col-span-5">
                
                <div v-if="!isLoading && !isError">
                    <div v-for="option in availableOptions" :key="option.option">
                      <h2 class="text-md mt-2 font-medium text-gray-500">{{ option.name }} :</h2>
                      <fieldset class="mt-2">
                          <legend class="sr-only">Choose a {{ option.name.toLowerCase() }}</legend>
                          <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
                              <label
                              v-for="term in option.terms"
                              :key="term.code"
                              :class="{
                                'flex items-center justify-center rounded-md border py-2 px-2 text-sm font-medium uppercase sm:flex-1 cursor-pointer focus:outline-none': true,
                                'cursor-not-allowed opacity-25': term.disabled,
                                'bg-blue-500 text-white': option.selectedTerm === term.code
                              }"
                              >
                              <input
                                type="radio"
                                :name="option.option"
                                :value="term.code"
                                class="sr-only"
                                :aria-labelledby="`${option.option}-choice-${term.code}-label`"
                                @change="selectTerm(option.option, term.code)"
                                :checked="option.selectedTerm === term.code"
                                :disabled="term.disabled"
                              >
                              <span
                                :id="`${option.option}-choice-${term.code}-label`"
                                class="select-none"
                              >{{ term.name }}</span>
                              </label>
                          </div>
                      </fieldset>
                    </div>

                    <div class="mt-4 pt-4 border-t border-gray-100 flex flex-col items-center sm:flex-row sm:w-full ">
                      <label for="quantity" class="block text-md font-medium text-gray-500 mr-2 sm:w-auto w-full">จำนวน</label>
                    
                      <div class="flex mt-1 w-full sm:w-auto">
                        <button
                          type="button"
                          class="px-3 py-2 border-l border-t border-b border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-600"
                          @click="decreaseQuantity"
                          :disabled="quantity <= 1"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          id="quantity"
                          class="w-full sm:w-14 px-3 py-2 border-t border-b border-gray-300 text-center rounded-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          v-model.number="quantity"
                          :max="matchingItem ? matchingItem.stock : 1"
                          :disabled="!matchingItem || matchingItem.stock <= 0"
                        />
                        <button
                          type="button"
                          class="px-3 py-2 border-r border-t border-b border-gray-300 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-600"
                          @click="increaseQuantity"
                          :disabled="!matchingItem || matchingItem.stock <= 0 || quantity >= matchingItem.stock"
                        >
                          +
                        </button>
                      </div>
                    
                      <p class="flex w-full sm:w-auto ml-3 mt-2 text-md font-medium text-gray-500" v-if="matchingItem">
                        <span v-if="matchingItem.stock > 0" class="mr-2">
                          มีสินค้าทั้งหมด : <span class="font-bold">{{ matchingItem.stock }} ชิ้น</span>
                        </span>
                        <span v-else class="text-red-500">
                          <span v-if="matchingItem.stock <= 0">
                            สินค้าหมด
                          </span>
                        </span>
                      </p>
                    </div>
                    
                    <div class="mt-4 pt-4 border-t border-gray-100">
                      <!-- Reset button -->
                      <button v-if="selectedTermCount > 0 && totalTermOptionsCount > 0" type="button" class="mb-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" @click="resetSelectedTerms" >
                        <font-awesome-icon :icon="['fas','times']" class="text-orange-600"/> ยกเลิกการเลือก
                      </button>
                      
                      <template v-if="this.login">
                        <button
                          v-if="selectedTermCount < totalTermOptionsCount"
                          type="button"
                          class="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-400 px-8 py-3 text-base font-medium text-gray-600 cursor-not-allowed bg-opacity-50"
                        >
                          <font-awesome-icon :icon="['fas','info']" class="w-4 h-4 text-gray-600 mr-2"/> ต้องเลือกตัวเลือกสินค้าก่อน
                        </button>
                  
                        <button
                          v-else-if="selectedTermCount >= totalTermOptionsCount && matchingItem && matchingItem.stock > 0"
                          type="button"
                          class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          @click="addToCart"
                        >
                          <font-awesome-icon :icon="['fas','shopping-cart']" class="w-4 h-4 text-white mr-2"/> เพิ่มไปยังรถเข็น
                        </button>
                      </template>
                      
                      <template v-else>
                        <!-- <button
                          v-if="selectedTermCount < totalTermOptionsCount"
                          type="button"
                          class="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-400 px-8 py-3 text-base font-medium text-gray-600 cursor-not-allowed bg-opacity-50"
                        >
                          <font-awesome-icon :icon="['fas','info']" class="w-4 h-4 text-gray-600 mr-2"/> ต้องเลือกตัวเลือกสินค้าก่อน
                        </button> -->
                  
                        <LoginPopup @login-success="handleLoginSuccess"/>
                  
                      </template>

                    </div>
                    
                  </div>

                  <p v-if="matchingItem && Object.keys(matchingItem).length" class="mt-3">SKU: <span class="font-bold">{{ matchingItem.sku }}</span></p>
                  
                  <!--

                  <strong>Product</strong>
                  <pre>{{ mainProduct }}</pre>
                  
                  <strong>availableOptions</strong>
                  <pre>{{ availableOptions }}</pre> 

                  <strong>selectedTerms</strong>
                  <pre>{{ selectedTerms }}</pre> 

                  <strong>matchingItem</strong>
                  <pre>{{ matchingItem }}</pre>

                  -->

                  <!-- Product details -->
                  <div class="mt-10">
                    <h2 class="text-sm font-medium text-gray-900">Description</h2>
        
                    <div class="prose prose-sm mt-4 text-gray-500">
                      <p>The Basic tee is an honest new take on a classic. The tee uses super soft, pre-shrunk cotton for true comfort and a dependable fit. They are hand cut and sewn locally, with a special dye technique that gives each tee it's own look.</p>
                      <p>Looking to stock your closet? The Basic tee also comes in a 3-pack or 5-pack at a bundle discount.</p>
                    </div>
                  </div>
        
                  <div class="mt-8 border-t border-gray-200 pt-8">
                    <h2 class="text-sm font-medium text-gray-900">Fabric &amp; Care</h2>
        
                    <div class="prose prose-sm mt-4 text-gray-500">
                      <ul role="list">
                        <li>Only the best materials</li>
                        <li>Ethically and locally made</li>
                        <li>Pre-washed and pre-shrunk</li>
                        <li>Machine wash cold with similar colors</li>
                      </ul>
                    </div>
                  </div>
      
                  <!-- Policies -->
                  <section aria-labelledby="policies-heading" class="mt-10">
                    <h2 id="policies-heading" class="sr-only">Our Policies</h2>
        
                    <dl class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      <div class="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                        <dt>
                          <svg class="mx-auto h-6 w-6 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
                          </svg>
                          <span class="mt-4 text-sm font-medium text-gray-900">International delivery</span>
                        </dt>
                        <dd class="mt-1 text-sm text-gray-500">Get your order in 2 years</dd>
                      </div>
                      <div class="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                        <dt>
                          <svg class="mx-auto h-6 w-6 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span class="mt-4 text-sm font-medium text-gray-900">Loyalty rewards</span>
                        </dt>
                        <dd class="mt-1 text-sm text-gray-500">Don&#039;t look at other tees</dd>
                      </div>
                    </dl>
                  </section>

                </div>
              </div>
          </div>
        </div>
      </div>
      
      </template>
