<template>
    <Subhead
      :navigation="[
        {
          name: 'ย้อนกลับ',
          link: '/lesson/home',
          style: 'chevron-left',
          class: 'default-btn',
          visible: true,
          type: 'button',
        },
        {
          name: 'เพิ่มสินค้า',
          function: 'addProduct',
          style: 'plus',
          class: 'primary-btn',
          visible: true,
          type: 'button',
        },
      ]"
      @addProduct="addProduct('main')"
    />
    <div class="mx-auto max-w-7xl px-4 mt-5 mb-8 sm:px-6">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-2">
        <template v-for="(product) in flattenedProducts">
          <div v-if="product.type === 'main'" :key="product._id" class="bg-white rounded-sm shadow-sm">
            <div class="w-full">
              <div class="p-2">


                <div class="grid grid-cols-4 gap-2">
                  <div class="col-span-2">
                    <div class="flex items-start">
                      <div id="image-drop" class="w-20 h-20 overflow-hidden rounded-sm">
                        <img src="https://tailwindui.com/img/ecommerce-images/product-page-01-featured-product-shot.jpg" alt="Product Image" class="h-full w-full object-cover object-center group-hover:opacity-75">
                      </div>
                      <div class="ml-2">
                        <div class="flex items-center">
                          <router-link :to="'/shop/product/' + product._id">
                            <h3 class="text-md font-semibold">{{ getMainProductIndex(product) }}.{{ product.name }}</h3>
                          </router-link>
                          
                        </div>
                        <p class="text-xs text-gray-500 mt-1">SKU {{ product.sku }} Price {{ product.regularPrice }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="text-center">
                    <p class="text-base text-gray-500 mt-1">
                      <template v-if="product.manageStock">
                        {{ product.stock }} Stock
                      </template>
                      <template v-else>
                        Not manage Stock
                      </template>
                    </p>
                    <p class="text-xs text-gray-500 mt-1">{{ product.regularPrice }}/{{ product.salePrice }}</p>
                  </div>
                  <div class="text-right pr-2">
                    <p class="text-lg text-gray-500 mt-1">เผยแพร่</p>
                  </div>
                </div>
                
              </div>
              <div class="bg-gray-100 m-1">
                <ul class="list-none ml-4 space-y-2">
                  <li v-for="subProduct in getSubproducts(product._id)" :key="subProduct._id" class="border-b border-gray-200 py-2">
                    <div class="grid grid-cols-5 gap-2">
                      <div class="col-span-3">
                        <div class="flex items-center justify-between">
                          <h4 class="text-md font-medium">{{ subProduct.order }}.{{ subProduct.name }}</h4>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">SKU {{ subProduct.sku }} Price {{ subProduct.regularPrice }}</p> 
                      </div>
                      <div class="col-span-1">
                        <p class="text-base text-gray-500 mt-1">
                          <template v-if="subProduct.manageStock">
                            {{ subProduct.stock }} Stock
                          </template>
                          <template v-else>
                            Not manage Stock
                          </template>
                        </p>
                      </div>
                      <div class="col-span-1">
                        <button @click="openProductDialog(subProduct)" class="text-sm text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas','edit']" class="pr-2"/>แก้ไข</button>
                        <button @click="openMoveDialog(subProduct)" class="text-sm text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas','arrows-alt']" class="pr-2 pl-2"/>ย้าย</button>
                        <button @click="removeSubproductConfirmation(subProduct)" class="text-sm text-red-500 hover:text-red-700"><font-awesome-icon :icon="['fas','trash']" class="pr-2 pl-2"/>ลบ</button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="flex justify-between p-1">
              <div class="space-x-2">
                <button @click="moveMainProductUp(product)" class="text-sm text-gray-500 hover:text-gray-700">
                  <font-awesome-icon :icon="['fas','chevron-up']" class="pr-2 pl-2"/>
                </button>
                <button @click="moveMainProductDown(product)" class="text-sm text-gray-500 hover:text-gray-700">
                  <font-awesome-icon :icon="['fas','chevron-down']" class="pr-2 pl-2"/>
                </button>
              </div>
              <div class="space-x-2">
                <button v-if="product.option === 'variable'" @click="removeAllSubproducts(product)" class="text-sm text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas','times']" class="pr-2"/>ลบสินค้าทั้งหมด</button>
                <button v-if="product.option === 'variable'" @click="createVariableSubproducts(this.selectedProduct = product)" class="text-sm text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas','plus']" class="pr-2"/>สร้างสินค้าย่อย</button>
                <button @click="summarizeStockByParent(product._id)" class="text-sm text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas','edit']" class="pl-2"/> สินค้าคงคลัง</button>
                <button @click="openProductDialog(product)" class="text-sm text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas','edit']" class="pl-2"/> แก้ไข</button>
                <button @click="addProduct('sub', product)" class="text-sm text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas','plus']" class="pl-2"/> สินค้าย่อย</button>
                <button @click="removeMainProductConfirmation(product)" class="text-sm text-red-500 hover:text-red-700"><font-awesome-icon :icon="['fas','trash']" class="pl-2"/> ลบ</button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Product Edit Dialog -->
    <div v-if="showProductDialog" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="relative bg-white w-[600px] min-h-[500px] rounded-sm z-10">

        <div class="flex">
          <button @click="changeTab('config')" :class="{'bg-white': activeTab === 'config', 'bg-gray-100': activeTab !== 'config'}" class="flex-1 px-4 py-2 h-14 text-md font-medium rounded-l focus:outline-none">ข้อมูลสินค้า</button>
          <button v-if="selectedProduct.option === 'variable'" @click="changeTab('variant')" :class="{'bg-white': activeTab === 'tab3', 'bg-gray-100': activeTab !== 'variant'}" class="flex-1 px-4 py-2 h-14 text-md font-medium focus:outline-none">ตัวเลือกสินค้า</button>
          <button @click="changeTab('gallery')" :class="{'bg-white': activeTab === 'gallery', 'bg-gray-100': activeTab !== 'gallery'}" class="flex-1 px-4 py-2 h-14 text-md font-medium focus:outline-none">รูปภาพ/แกลอลี่</button>
          <button @click="changeTab('stock')" :class="{'bg-white': activeTab === 'stock', 'bg-gray-100': activeTab !== 'stock'}" class="flex-1 px-4 py-2 h-14 text-md font-medium rounded-r focus:outline-none">คลังสินค้า</button>
        </div>

        <!-- Config Tab -->
        <div v-if="activeTab === 'config'">
          <div class="p-4">
            <h4 class="text-xl font-semibold mb-4">Product Details</h4>

            <div class="grid grid-cols-2 gap-2">
              <div class="col-span-2">
                <div>
                  <label for="productName" class="font-medium">Product Name</label>
                  <input v-model="selectedProduct.name" type="text" id="productName" placeholder="Enter the product name" class="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
                </div>
              </div>
              <div class="col-span-2">
                <div>
                  <label for="productSKU" class="font-medium">Product SKU</label>
                  <input v-model="selectedProduct.sku" type="text" id="productSKU" placeholder="Enter the product SKU" class="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-2 mt-3">
              <div>
                <div>
                  <label class="font-medium">Product Option</label>
                  <div class="flex gap-2 items-center">
                    <input type="radio" id="productNormal" value="simple" v-model="selectedProduct.option" @change="handleProductOptionChange" class="border border-gray-300 rounded-full focus:outline-none focus:ring focus:border-blue-500" />
                    <label for="productNormal">Simple</label>
                    <input type="radio" id="productVariable" value="variable" v-model="selectedProduct.option" @change="handleProductOptionChange" class="border border-gray-300 rounded-full focus:outline-none focus:ring focus:border-blue-500" />
                    <label for="productVariable">Variable</label>
                    <input type="radio" id="productVirtual" value="virtual" v-model="selectedProduct.option" @change="handleProductOptionChange" class="border border-gray-300 rounded-full focus:outline-none focus:ring focus:border-blue-500" />
                    <label for="productVirtual">Virtual</label>
                    <input type="radio" id="productGroups" value="groups" v-model="selectedProduct.option" @change="handleProductOptionChange" class="border border-gray-300 rounded-full focus:outline-none focus:ring focus:border-blue-500" />
                    <label for="productGroups">Groups</label>
                    <input type="radio" id="productCredit" value="credit" v-model="selectedProduct.option" @change="handleProductOptionChange" class="border border-gray-300 rounded-full focus:outline-none focus:ring focus:border-blue-500" />
                    <label for="productCredit">Credit</label>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-3">
              <div>
                <div>
                  <label for="productRegularPrice" class="font-medium">Regular Price</label>
                  <input v-model="selectedProduct.regularPrice" type="number" id="productRegularPrice" placeholder="Enter the regular price" class="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
                </div>
              </div>
              <div>
                <div>
                  <label for="productSalePrice" class="font-medium">Sale Price</label>
                  <input v-model="selectedProduct.salePrice" type="number" id="productSalePrice" placeholder="Enter the sale price" class="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
                </div>
              </div>
            </div>

          </div>

        </div>

        <div v-else-if="activeTab === 'gallery'">
          
          <div class="border border-gray-300" id="gallery-drop" @dragover.prevent @drop="handleImageDrop">
            <div class="">
              <div v-for="(image, index) in galleryImages" :key="index" class="grid grid-cols-2 gap-2 p-2 border-b border-gray-300">
                
                <div class="">
                  <img :src="image" :alt="'Gallery Image ' + (index + 1)" class="h-20">
                </div>

                <div class="text-right">
                  <button class="p-1 text-sm font-medium text-gray-500"><font-awesome-icon :icon="['fas', 'chevron-up']" /></button>
                  <button class="ml-1 p-1 text-sm font-medium text-gray-500"><font-awesome-icon :icon="['fas', 'chevron-down']" /></button>
                  <button class="ml-1 p-1 text-sm font-medium text-gray-500"><font-awesome-icon :icon="['fas', 'trash']" /></button>
                </div>

              </div>
            </div>
          </div>
          
        </div>
        
        <div v-else-if="activeTab === 'variant' && selectedProduct.option === 'variable'">
          <div class="p-4">
            <div v-if="selectedProduct.option === 'variable'" class="mt-4">
              <h4 class="text-lg font-semibold mb-2">Variable Items</h4>
              
              <table class="w-full border">
    
                <tbody>
                  <template v-for="(configItem, configIndex) in selectedProduct.configurableOptions" :key="'configOption-' + configIndex">
                    <tr class="bg-gray-300">
                        <th class="text-sm">Name</th>
                        <th class="text-sm">Option</th>
                        <th class="text-sm"></th>
                        <th class="text-sm"></th>
                    </tr>
                    <tr class="mb-2">
                      <td class="">
                        <input v-model="configItem.name" type="text" placeholder="Enter name" class="w-full border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:ring focus:border-blue-500">
                      </td>
                      <td class="">
                        <input v-model="configItem.option" type="text" placeholder="Enter option" class="w-full border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:ring focus:border-blue-500">
                      </td>
                      <td class="">
                        <button @click="removeConfigurableOption(configIndex)" class="px-2 py-1 mr-2 text-sm font-medium text-white bg-red-500 rounded-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <i class="fas fa-times"></i>
                        </button>
                        <button @click="addConfigurableOptionTerm(configIndex)" class="px-2 py-1 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <i class="fas fa-plus"></i>
                        </button>
                      </td>
                    </tr>
                    <tr class="bg-gray-100">
                      <th class="text-sm">Name</th>
                      <th class="text-sm">Option</th>
                      <th class="text-sm">Code</th>
                      <th class="text-sm"></th>
                    </tr>
                    <template v-for="(term, termIndex) in configItem.terms" :key="'configTerm-' + configIndex + '-' + termIndex">
                      <tr>
                        <td class="pl-8">
                          <input v-model="term.name" type="text" placeholder="Enter name" class="w-full border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:ring focus:border-blue-500">
                        </td>
                        <td class="">
                          <input v-model="term.option" type="text" placeholder="Enter option" class="w-full border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:ring focus:border-blue-500">
                        </td>
                        <td class="">
                          <input v-model="term.code" type="text" placeholder="Enter code" class="w-full border border-gray-300 rounded-sm px-2 py-1 focus:outline-none focus:ring focus:border-blue-500">
                        </td>
                        <td class="">
                          <button @click="removeConfigurableOptionTerm(configItem, termIndex)" class="px-2 py-1 mr-2 text-sm font-medium text-white bg-red-500 rounded-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <i class="fas fa-times"></i>
                          </button>
                        </td>
                      </tr>
                    </template>
                  </template>
                  <tr>
                    <td colspan="3" class="">
                      <button @click="addConfigurableOption" class="text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Add Option</button>
                    </td>
                  </tr>
                </tbody>
              </table>
          
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'stock'">
          <div class="p-4">
            <h4 class="text-xl font-semibold mb-4">คลังสินค้า</h4>

            <div class="grid grid-cols-2 gap-2 mt-3">
              <div>
                <div class="flex items-center space-x-2 mt-3">
                  <input v-model="selectedProduct.manageStock" type="checkbox" id="manageStock" class="form-checkbox text-blue-500 focus:outline-none focus:ring focus:border-blue-500">
                  <label for="manageStock" class="font-medium">มีการจัดการคลังสินค้า</label>
                </div>
              </div>
              <div>
                <div>
                  <label for="productStock" v-show="selectedProduct.manageStock" class="font-medium">จำนวนสินค้า</label>
                  <input v-show="selectedProduct.manageStock" v-model="selectedProduct.stock" type="number" id="productStock" placeholder="ระบุจำนวนสินค้าในคลัง" class="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-3">
              <div>
                <div class="flex items-center space-x-2 mt-3">
                  <input v-model="selectedProduct.stockExpire" type="checkbox" id="stockExpire" class="form-checkbox text-blue-500 focus:outline-none focus:ring focus:border-blue-500">
                  <label for="stockExpire" class="font-medium">แจ้งเตือนสินค้าเหลือน้อย</label>
                </div>
              </div>
              <div>
                <div>
                  <label for="stockExpireAmount" v-show="selectedProduct.stockExpire" class="font-medium">จำนวนสินค้าที่ต้องแจ้งเตือน</label>
                  <input v-show="selectedProduct.stockExpire" v-model="selectedProduct.stockExpireAmount" type="number" id="stockExpireAmount" placeholder="ระบุจำนวนที่ต้องการให้แจ้งเตือน" class="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
                </div>
              </div>
            </div>

          </div>
        </div>

        <div v-else>
          <p>No content available for this tab.</p>
        </div>
  
        <div class="p-4 flex justify-end mt-6 bottom-0 space-x-4 bg-gray-100">
          <button @click="updateProduct(selectedProduct)" class="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Save</button>
          <button @click="closeProductDialog" class="px-6 py-2 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-700 focus:outline-none">Close</button>
        </div>
      </div>
    </div>
    
    <!-- Move Dialog -->
    <div v-if="showMoveDialog" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">Move Product</h4>
        <div class="flex flex-col space-y-4">
          <label for="selectedParent" class="font-medium">Select New Parent Product</label>
          <select v-model="selectedProductParent" id="selectedParent" class="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring focus:border-blue-500">
            <option value="">Select a main product</option>
            <option v-for="mainProduct in getMainProducts" :key="mainProduct._id" :value="mainProduct._id">{{ mainProduct.name }}</option>
          </select>
        </div>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="updateSelectedProductParent" class="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Move</button>
          <button @click="closeMoveDialog" class="px-6 py-2 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-700 focus:outline-none">Cancel</button>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Popup for Main Products -->
    <div v-if="showConfirmationPopup" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">Confirm Remove Main Product</h4>
        <p>Are you sure you want to remove the main product?</p>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="confirmRemoveMainProduct" class="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">Confirm</button>
          <button @click="closeConfirmationPopup" class="px-6 py-2 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-700 focus:outline-none">Cancel</button>
        </div>
      </div>
    </div>
  
    <!-- Confirmation Popup for Sub Products -->
    <div v-if="showSubproductConfirmationPopup" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">Confirm Remove Sub Product</h4>
        <p>Are you sure you want to remove the sub product?</p>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="confirmRemoveSubproduct" class="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">Confirm</button>
          <button @click="closeSubproductConfirmationPopup" class="px-6 py-2 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-700 focus:outline-none">Cancel</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  //import { getStock } from '@/plugins/stock.js';

  import Subhead from '@/interface/template/outline/Subhead.vue';
  
  export default {
    name: 'ProductList',
  
    components: {
      Subhead,
    },
  
    data() {
      return {
        session: storageManager.get('session'),
        configs: storageManager.get('configs'),
        products: [],
        uniqueIdCounter: 5, // Initial value for the unique ID counter
        showProductDialog: false,
        selectedProduct: null,
        newProductName: '',
        showMoveDialog: false,
        selectedProductParent: null,
        showConfirmationPopup: false,
        productToRemove: null,
        showSubproductConfirmationPopup: false,
        subProductToRemove: null,
        activeTab: 'config',
        draggedImage: null,
        galleryImages: [
          'https://tailwindui.com/img/ecommerce-images/product-page-01-featured-product-shot.jpg',
          'https://tailwindui.com/img/ecommerce-images/product-page-01-featured-product-shot.jpg',
          'https://tailwindui.com/img/ecommerce-images/product-page-01-featured-product-shot.jpg',
          'https://tailwindui.com/img/ecommerce-images/product-page-01-featured-product-shot.jpg',
          'https://tailwindui.com/img/ecommerce-images/product-page-01-featured-product-shot.jpg',
          'https://tailwindui.com/img/ecommerce-images/product-page-01-featured-product-shot.jpg'
        ]
      };
    },
    computed: {
      flattenedProducts() {
        return this.flattenProducts(this.products);
      },
      getMainProducts() {
        return this.products.filter((product) => product.type === 'main');
      },
      salePrice() {
        if (this.mainProduct.salePrice < this.mainProduct.regularPrice) {
          return this.mainProduct.salePrice;
        }
        return null;
      },
    },
    async mounted() {
      try {
        await this.getProductData();
      } catch (error) {
        console.log(error);
      }
    },
    methods: {
      handleImageDrop(event) {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          this.draggedImage = event.target.result;
        };
        reader.readAsDataURL(file);
      },
      handleDragStart(image) {
        this.draggedImage = image;
      },
      changeTab(tab) {
        this.activeTab = tab;
      },
      async summarizeStockByParent(parentId) {
        const subproducts = this.products.filter(product => product.parent === parentId);
        console.log("subproducts", subproducts);
        const totalStock = subproducts.reduce((sum, product) => sum + (parseInt(product.stock) || 0), 0);
        console.log("totalStock", totalStock);

        await this.updateStock(parentId, totalStock);
        await this.getProductData();
        return totalStock;
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
                   { unit: this.session.current._id },
                  ],
                },
              ],
              paging: { page: 1, limit: 200 },
            }),
          });
  
          if (resAPI.ok) {
            const finalRes = await resAPI.json();
            //console.log("finalRes", finalRes);
            this.products = finalRes.data;
          } else {
            // Handle error condition
          }
        } catch (error) {
          console.error(error);
        }
      },
  
      async addProduct(mode, product) {
        try {
          console.log("product", product);
          const requestData = {
            unit: this.session.current._id,
            name: 'New Product',
            code: 'product-code',
            description: 'Description for New Product',
            type: 'main', // Default type is 'main'
            sku: '',
            stock: '',
            regularPrice: '',
            salePrice: '',
            option: 'simple',
            manageStock: false,

            stockExpireAmount: 0,
            stockExpire: false,

            order: 0,
          };
  
          if (mode === "sub") {
            requestData.type = 'sub';
            requestData.parent = product._id;
          }
  
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/product/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: requestData,
              options: {},
            }),
          });
  
          if (resAPI.ok) {
            await this.getProductData();
            await resAPI.json();
            //console.log("finalRes", finalRes);
          } else {
            // Handle error condition
          }
        } catch (error) {
          console.error(error);
        }
      },
      async updateProduct(product) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/product/" + product._id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: {
                "name": product.name,
                "code": product.code,
                "description": product.description,
                "order": product.order,
                "sku": product.sku,
                "stock": product.stock,
                "regularPrice": product.regularPrice,
                "salePrice": product.salePrice,
                "option": product.option,
                "manageStock": product.manageStock,
                "configurableOptions": product.configurableOptions,
              },
              options: {},
            }),
          });
  
          if (resAPI.ok) {
            await this.getProductData();
            await resAPI.json();
            this.summarizeStockByParent(product.parent);
            this.closeProductDialog();
            //console.log("finalRes", finalRes);
          } else {
            // Handle error condition
          }
        } catch (error) {
          console.error(error);
        }
      },
      async updateStock(product,stock) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/product/" + product, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: {
                "stock": stock,
              },
              options: {},
            }),
          });
  
          if (resAPI.ok) {
            await this.getProductData();
            await resAPI.json();
            this.closeProductDialog();
            //console.log("finalRes", finalRes);
          } else {
            // Handle error condition
          }
        } catch (error) {
          console.error(error);
        }
      },
      async deleteProduct(product) {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/product/" + product._id, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          });
  
          if (resAPI.ok) {
            await this.getProductData();
            await resAPI.json();
            //console.log("finalRes", finalRes);
          } else {
            // Handle error condition
          }
        } catch (error) {
          console.error(error);
        }
      },
      getMainProductIndex(product) {
        const mainProducts = this.flattenedProducts.filter((prod) => prod.type === 'main');
        return mainProducts.findIndex((prod) => prod._id === product._id) + 1;
      },
      flattenProducts(products) {
        return products.reduce((result, product) => {
          result.push(product);
          if (product.type === 'main') {
            const subproducts = this.products.filter((subproduct) => subproduct.type === 'sub' && subproduct.parent === product._id);
            result.push(...subproducts);
          }
          return result;
        }, []);
      },
      getSubproducts(parentId) {
        const subproducts = this.products.filter((product) => product.type === 'sub' && product.parent === parentId);
        // Sort subproducts based on the order property
        subproducts.sort((a, b) => a.order - b.order);
        return subproducts;
      },
      moveMainProductUp(product) {
        const index = this.products.findIndex((p) => p._id === product._id && p.type === 'main');
        if (index > 0) {
          const movedProduct = this.products.splice(index, 1)[0];
          this.products.splice(index - 1, 0, movedProduct);
        }
      },
      moveMainProductDown(product) {
        const index = this.products.findIndex((p) => p._id === product._id && p.type === 'main');
        if (index < this.products.length - 1) {
          const movedProduct = this.products.splice(index, 1)[0];
          this.products.splice(index + 1, 0, movedProduct);
        }
      },
  
      async removeMainProductConfirmation(product) {
        this.productToRemove = product;
        this.showConfirmationPopup = true;
      },
  
      async confirmRemoveMainProduct() {
        try {
          const product = this.productToRemove;
          const index = this.products.findIndex((p) => p._id === product._id && p.type === 'main');
  
          if (index !== -1) {
            // Remove the main product
            const mainProduct = this.products.splice(index, 1)[0];
  
            // Remove the associated subproducts
            const subproducts = this.products.filter((p) => p.type === 'sub' && p.parent === mainProduct._id);
            this.products = this.products.filter((p) => p.type !== 'sub' || p.parent !== mainProduct._id);
  
            // Remove the subproducts from the server using the deleteProduct method
            for (const subproduct of subproducts) {
              await this.deleteProduct(subproduct);
            }
  
            await this.deleteProduct(product);
          }
  
          this.productToRemove = null;
          this.showConfirmationPopup = false;
        } catch (error) {
          console.error(error);
        }
      },
  
      cancelRemoveMainProduct() {
        this.productToRemove = null;
        this.showConfirmationPopup = false;
      },
  
      async removeSubproductConfirmation(subproduct) {
        this.subproductToRemove = subproduct;
        this.showSubproductConfirmationPopup = true;
      },
  
      async confirmRemoveSubproduct() {
        try {
          const subproduct = this.subproductToRemove;
          const index = this.products.findIndex((p) => p._id === subproduct._id && p.type === 'sub');
  
          if (index !== -1) {
            this.products.splice(index, 1);
            await this.deleteProduct(subproduct);
          }
  
          this.subproductToRemove = null;
          this.showSubproductConfirmationPopup = false;
        } catch (error) {
          console.error(error);
        }
      },
  
      cancelRemoveSubproduct() {
        this.subproductToRemove = null;
        this.showSubproductConfirmationPopup = false;
      },
  
      openProductDialog(product) {
        this.selectedProduct = product;
        this.showProductDialog = true;
      },
  
      async renameProduct(product) {
        try {
          await this.updateProduct(product);
          this.selectedProduct = null;
          this.showProductDialog = false;
        } catch (error) {
          console.error(error);
        }
      },
  
      closeProductDialog() {
        this.selectedProduct = null;
        this.showProductDialog = false;
      },
  
      openMoveDialog(product) {
        this.selectedProduct = product;
        this.selectedProductParent = null;
        this.showMoveDialog = true;
      },
  
      async updateSelectedProductParent() {
        try {
          const product = this.selectedProduct;
          const parent = this.selectedProductParent;
  
          if (parent) {
            product.parent = parent;
          } else {
            delete product.parent;
          }
  
          await this.updateProduct(product);
          this.selectedProduct = null;
          this.selectedProductParent = null;
          this.showMoveDialog = false;
        } catch (error) {
          console.error(error);
        }
      },
  
      closeMoveDialog() {
        this.selectedProduct = null;
        this.selectedProductParent = null;
        this.showMoveDialog = false;
      },

      addConfigurableOption() {
            if (!this.selectedProduct.configurableOptions) {
            this.selectedProduct.configurableOptions = [];
            }
            this.selectedProduct.configurableOptions.push({
            name: '',
            option: '',
            code: '',
            terms: [],
            manageStock: false
            });
        },
        removeConfigurableOption(index) {
            this.selectedProduct.configurableOptions.splice(index, 1);
        },
        moveConfigurableOptionUp(index) {
            if (index > 0) {
            const temp = this.selectedProduct.configurableOptions[index];
            this.selectedProduct.configurableOptions.splice(index, 1);
            this.selectedProduct.configurableOptions.splice(index - 1, 0, temp);
            }
        },
        moveConfigurableOptionDown(index) {
            if (index < this.selectedProduct.configurableOptions.length - 1) {
            const temp = this.selectedProduct.configurableOptions[index];
            this.selectedProduct.configurableOptions.splice(index, 1);
            this.selectedProduct.configurableOptions.splice(index + 1, 0, temp);
            }
        },
        addConfigurableOptionTerm(configIndex) {
            // Get the configItem based on the provided index
            const configItem = this.selectedProduct.configurableOptions[configIndex];

            // Check if the terms property is defined, if not, initialize it as an empty array
            if (!configItem.terms) {
            this.$set(configItem, 'terms', []);
            }

            // Create a new term object
            const newTerm = {
            name: "",
            option: "",
            code: "",
            detail: ""
            };

            // Add the new term to the terms array of the configItem
            configItem.terms.push(newTerm);
        },

        removeConfigurableOptionTerm(configItem, termIndex) {
            configItem.terms.splice(termIndex, 1);
        },

        createVariableSubproducts() {
            const selectedProduct = this.selectedProduct;
            const mainProductSKU = selectedProduct.sku;
            const configurableOptions = selectedProduct.configurableOptions;
            // Generate subproducts recursively
            const subProducts = this.generateSubproducts(configurableOptions, selectedProduct, mainProductSKU, []);
            // Call the addVariableProducts function to create the subproducts

            console.log("selectedProduct",selectedProduct);
            console.log("subProducts", subProducts);

            // Modify subProducts array here
            for (const subProduct of subProducts) {
                subProduct.name = `${selectedProduct.name} - (${subProduct.name})`;
            }

            this.addVariableProducts(subProducts);
            // Close the product edit dialog
            this.closeProductDialog();
        },

        generateSubproducts(configOptions, selectedProduct, baseSKU, parentCodes, matchingTerms = []) {
            if (configOptions.length === 0) {
                // Base case: No more configurable options, return an empty array
                return [];
            }

            const [currentOption, ...remainingOptions] = configOptions;
            const subProducts = [];

            // Iterate over the terms of the current configurable option
            for (let i = 0; i < currentOption.terms.length; i++) {
                const term = currentOption.terms[i];
                const termIndex = i + 1; // Adding 1 to the term index to start from 1

                const updatedMatchingTerms = matchingTerms.concat({ option: currentOption.option, code: term.code });

                if (remainingOptions.length > 0) {
                const childSubProducts = this.generateSubproducts(
                    remainingOptions,
                    selectedProduct,
                    baseSKU,
                    [...parentCodes, term.code],
                    updatedMatchingTerms
                );

                const indexedChildSubProducts = childSubProducts.map((childProduct, index) => {
                    const childProductSku = `${baseSKU}${parentCodes.join("")}${term.code}${childProduct.code}`;
                    const childProductName = `${term.name} / ${childProduct.name}`;
                    const childProductConfig = [
                    ...new Set([...childProduct.config, `${currentOption.option} : ${term.code}`])
                    ];

                    return {
                    ...childProduct,
                    sku: childProductSku,
                    name: childProductName,
                    order: parseFloat(`${termIndex}.${index + 1}`),
                    config: childProductConfig,
                    };
                });

                subProducts.push(...indexedChildSubProducts);
                } else {
                const subProduct = {
                    unit: selectedProduct.unit,
                    name: `${term.name}`,
                    code: term.code,
                    description: selectedProduct.description,
                    type: 'sub',
                    parent: selectedProduct._id,
                    sku: `${baseSKU}${parentCodes.join("")}${term.code}`,
                    stock: selectedProduct.stock,
                    regularPrice: selectedProduct.regularPrice,
                    salePrice: selectedProduct.salePrice,
                    option: 'simple',
                    manageStock: selectedProduct.manageStock,
                    order: termIndex,
                    config: updatedMatchingTerms.map(mt => `${mt.option} : ${mt.code}`),
                };

                subProducts.push(subProduct);
                }
            }
            return subProducts;
        },

        addVariableProducts(subProducts) {
            // Send a POST request to create the subproducts
            for (const subProduct of subProducts) {
                this.addVariableProduct(subProduct);
            }
        },

        async addVariableProduct(product) {
            try {
                const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/product/", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
                body: JSON.stringify({
                    data: product,
                    options: {},
                }),
                });

                if (resAPI.ok) {
                await this.getProductData();
                await resAPI.json();
                //console.log("finalRes", finalRes);
                } else {
                // Handle error condition
                }
            } catch (error) {
                console.error(error);
            }
        },

        async removeAllSubproducts(mainProduct) {
            try {
            // Find all sub-products associated with the main product
            const subproducts = this.products.filter((product) => product.type === 'sub' && product.parent === mainProduct._id);

            // Remove the sub-products from the server using the deleteProduct method
            for (const subproduct of subproducts) {
                await this.deleteProduct(subproduct);
            }

            // Update the local products list by filtering out the removed sub-products
            this.products = this.products.filter((product) => product.type !== 'sub' || product.parent !== mainProduct._id);
            } catch (error) {
            console.error(error);
            }
        },
    },
  };
  </script>
  
  <style scoped>
  /* Add your custom styles here */
  </style>
  