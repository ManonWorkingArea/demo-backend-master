<template>
    <FileBrowser
      v-if="FileBannerOpen"
      :isWindowsOpen="true"
      :callbackFunction="'banner'"
      :allowFileType="['jpg','gif','png','jpeg']"
      @file-browser-trigger="changeFileTrigger"
      @file-browser-callback="selectFileTrigger"
    />
  
    <FileBrowser
      v-if="FileLogoOpen"
      :isWindowsOpen="true"
      :callbackFunction="'logo'"
      :allowFileType="['jpg','gif','png','jpeg']"
      @file-browser-trigger="changeFileTriggerLogo"
      @file-browser-callback="selectFileTriggerLogo"
    />
  
    <Subhead
      :navigation="[
        {
          name: 'Back',
          link: '/shop/products',
          style: 'chevron-left',
          class: 'default-btn',
          visible: true,
          type: 'button',
        },
        {
          name: 'Add Shipping',
          function: 'addShipping',
          style: 'plus',
          class: 'primary-btn',
          visible: true,
          type: 'button',
        },
      ]"
      @addShipping="addShipping('main')"
    />
  
    <div class="mx-auto max-w-7xl px-4 mt-5 mb-8 sm:px-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <template v-for="(shipping) in flattenedShippings">
          <div v-if="shipping.type === 'main'" :key="shipping._id" class="bg-white p-5 rounded-sm shadow-sm">
            <div class="object-cover object-center w-full h-40 bg-gray-100" :style="{ backgroundImage: `url(${shipping.banner})`, backgroundSize: 'cover' }"></div>
            <div class="flex items-center">
              <div class="pt-5 mr-4">
                <div class="bg-white w-16 h-16 flex items-center justify-center relative border border-gray-200">
                  <img :src="shipping.logo || 'https://dummyimage.com/400x400/dbdbdb/6e6e6e.jpg&text=++LOGO++'" alt="Logo" class="w-full h-auto object-cover">
                </div>
              </div>
              <div class="pt-5">
                <h3 class="text-lg font-semibold">{{ getMainShippingIndex(shipping) }}. {{ shipping.name }}</h3>
                <p class="text-sm text-gray-500">{{ shipping.description }}</p>
              </div>
            </div>
            <div class="flex justify-end mt-4">
              <button @click="openRenameDialog(shipping)" class="text-sm text-gray-500 hover:text-gray-700"><font-awesome-icon :icon="['fas','edit']" class="pl-1"/> Edit Shipping</button>
              <button @click="removeMainShippingConfirmation(shipping)" class="text-sm text-red-500 hover:text-red-700"><font-awesome-icon :icon="['fas','trash']" class="pl-1"/> Delete</button>
            </div>
          </div>
        </template>
      </div>
    </div>
  
    <!-- Rename Dialog -->
    <div v-if="showRenameDialog" class="fixed inset-0 flex items-center justify-center z-10">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white w-[500px] z-10 max-w-md mx-auto">
  
        <div class="bg-gray-100 h-40 mb-4 relative">
          <div class="w-full h-full relative">
            <div class="object-cover object-center w-full h-full" :style="{ backgroundImage: `url(${selectedShipping.banner})`, backgroundSize: 'cover' }"></div>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <button class="bg-black rounded text-white text-sm p-2 pr-3 pl-3" @click="OpenFileBrowser">
                <font-awesome-icon :icon="['fas','image']" class="mr-2"/> Change Image
              </button>
            </div>
          </div>
          <div class="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
            <div class="bg-white rounded-full w-20 h-20 flex items-center justify-center relative border border-gray-200">
              <img :src="selectedShipping.logo || 'https://dummyimage.com/400x400/dbdbdb/6e6e6e.jpg&text=++LOGO++'" alt="Logo" class="rounded-full w-20 h-auto">
              <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <button class="bg-black rounded-full text-white w-10 h-10" @click="OpenFileBrowserLogo">
                  <font-awesome-icon :icon="['fas','image']" class=""/>
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <div class="p-4">
          <h4 class="text-1xl font-semibold mb-4">Edit {{ selectedShipping.type === 'main' ? 'Shipping' : 'Subshipping' }} Information</h4>
          <div class="space-y-4">
            <div>
              <label for="newName" class="font-medium">Shipping Name</label>
              <input v-model="selectedShipping.name" type="text" id="newName" placeholder="Enter the new name" class="px-4 py-2 border border-gray-300 rounded-sm w-full focus:outline-none focus:ring focus:border-blue-500">
            </div>
            <div>
              <label for="newCode" class="font-medium">Shipping Code</label>
              <input v-model="selectedShipping.code" type="text" id="newCode" placeholder="Enter the new code" class="px-4 py-2 border border-gray-300 rounded-sm w-full focus:outline-none focus:ring focus:border-blue-500">
            </div>
            <div>
              <label for="newDescription" class="font-medium">Description</label>
              <textarea v-model="selectedShipping.description" rows="4" cols="50" id="newDescription" placeholder="Enter the new description" class="px-4 py-2 border border-gray-300 rounded-sm w-full focus:outline-none focus:ring focus:border-blue-500"></textarea>
            </div>
            <div>
              <input v-model="selectedShipping.logo" type="hidden" id="newLogo" accept="image/*" class="px-4 py-2 border border-gray-300 rounded-sm w-full focus:outline-none focus:ring focus:border-blue-500">
              <input v-model="selectedShipping.banner" type="hidden" id="newBanner" accept="image/*" class="px-4 py-2 border border-gray-300 rounded-sm w-full focus:outline-none focus:ring focus:border-blue-500">
            </div>
          </div>
          <div class="flex justify-end mt-6 space-x-4">
            <button @click="renameShipping(selectedShipping)" class="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"><font-awesome-icon :icon="['fas','save']" class="pr-2 pl-2"/> Save</button>
            <button @click="closeRenameDialog" class="px-6 py-2 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-700 focus:outline-none">Close</button>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Confirmation Popup for Main Categories -->
    <div v-if="showConfirmationPopup" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black opacity-75"></div>
      <div class="bg-white rounded p-5 z-10">
        <h4 class="text-xl font-semibold mb-4">Confirm Remove Main Shipping</h4>
        <p>Are you sure you want to remove the main shipping?</p>
        <div class="flex justify-end mt-6 space-x-4">
          <button @click="removeMainShipping" class="px-6 py-2 text-sm font-medium text-white bg-red-500 rounded-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">Remove</button>
          <button @click="cancelRemoveMainCategory" class="px-6 py-2 text-sm font-medium text-gray-500 rounded-sm hover:text-gray-700 focus:outline-none">Cancel</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import Subhead from '@/interface/template/outline/Subhead.vue';
  import FileBrowser from '@/interface/modal/FileBrowser.vue';
  
  export default {
    name: 'ShippingList',
    data() {
      return {
        session: storageManager.get('session'),
        configs: storageManager.get('configs'),
        shippings: [],
        uniqueIdCounter: 5,
        showRenameDialog: false,
        selectedShipping: null,
        showMoveDialog: false,
        selectedShippingParent: null,
        FileBannerOpen: false,
        FileLogoOpen: false,
        showConfirmationPopup: false,
        shippingToRemove: null,
      };
    },
    components: {
      Subhead,
      FileBrowser
    },
    computed: {
      flattenedShippings() {
        return this.flattenShippings(this.shippings);
      },
      getMainShippings() {
        return this.shippings.filter(shipping => shipping.type === 'main');
      },
    },
    async mounted() {
      try {
        await this.getShippingData();
      } catch (error) {
        console.log(error);
      }
    },
    methods: {
      // Update Banner
      OpenFileBrowser() {
        this.FileBannerOpen = true;
      },
      changeFileTrigger(payload) {
        this.FileBannerOpen = payload;
      },
      selectFileTrigger(payload) {
        console.log("selectFileTrigger");
        if (payload != undefined) {
          console.log("selectFileReturnFunction", payload.file);
          this.updateBanner(payload.file);
        }
      },
      async updateBanner(banner) {
        try {
          const shipping = this.selectedShipping;
  
          const updatedShipping = {
            ...shipping,
            banner: banner,
          };
          delete updatedShipping._id;
  
          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/shop_payment/${shipping._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: updatedShipping,
              options: {},
            }),
          });
  
          if (resAPI.ok) {
            this.selectedShipping.banner = banner;
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'success',
              title: 'Edit Banner',
              text: 'Banner edited successfully',
            });
          }
        } catch (error) {
          console.log(error);
        }
      },
      // Update Logo
      OpenFileBrowserLogo() {
        this.FileLogoOpen = true;
      },
      changeFileTriggerLogo(payload) {
        this.FileLogoOpen = payload;
      },
      selectFileTriggerLogo(payload) {
        console.log("selectFileTrigger");
        if (payload != undefined) {
          console.log("selectFileReturnFunction", payload.file);
          this.updateLogo(payload.file);
        }
      },
      async updateLogo(logo) {
        try {
          const shipping = this.selectedShipping;
  
          const updatedShipping = {
            ...shipping,
            logo: logo,
          };
          delete updatedShipping._id;
  
          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/shop_payment/${shipping._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: updatedShipping,
              options: {},
            }),
          });
  
          if (resAPI.ok) {
            this.selectedShipping.logo = logo;
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'success',
              title: 'Edit Logo',
              text: 'Logo edited successfully',
            });
          }
        } catch (error) {
          console.log(error);
        }
      },
      async getShippingData() {
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/shop_payment/query", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
          body: JSON.stringify({
            method: 'find',
            args: [
              {
                $and: [
                  { unit: this.session.current._id }
                ]
              }
            ],
            paging: { page: 1, limit: 200 }
          })
        });
        if (resAPI.ok) {
          const finalRes = await resAPI.json();
          console.log("finalRes", finalRes);
          this.shippings = finalRes.data;
        } else {
          // Handle error condition
        }
      },
      async addShipping(mode, shipping) {
        try {
          const requestData = {
            unit: this.session.current._id,
            name: 'New Payment',
            code: 'payment-code',
            description: 'Description for New Payment',
            type: 'main', // Default type is 'main'
            order: 0
          };
  
          if (mode === "sub") {
            requestData.type = 'sub';
            requestData.parent = shipping._id;
          }
  
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/shop_payment", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: requestData,
              options: {}
            })
          });
          if (resAPI.ok) {
            const finalRes = await resAPI.json();
            console.log("finalRes", finalRes);
  
            await this.getShippingData();
  
            if (finalRes.success) {
              if (mode === "main") {
                this.shippings.push(finalRes.data);
              } else {
                const mainShippingIndex = this.shippings.findIndex(shipping => shipping._id === requestData.parent);
                if (mainShippingIndex !== -1) {
                  if (!this.shippings[mainShippingIndex].subShippings) {
                    this.shippings[mainShippingIndex].subShippings = [];
                  }
                  this.shippings[mainShippingIndex].subShippings.push(finalRes.data);
                }
              }
              this.$swal({
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Add Payment',
                text: 'Payment added successfully',
              });
            }
          } else {
            // Handle error condition
          }
        } catch (error) {
          console.log(error);
        }
      },
      async openRenameDialog(shipping) {
        this.selectedShipping = { ...shipping };
        this.showRenameDialog = true;
      },
      async renameShipping(shipping) {
        try {
          const updatedShipping = {
            ...shipping,
          };
          delete updatedShipping._id;
  
          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/shop_payment/${shipping._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: updatedShipping,
              options: {},
            }),
          });
  
          if (resAPI.ok) {
            this.showRenameDialog = false;
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'success',
              title: 'Rename Payment',
              text: 'Payment renamed successfully',
            });
          }
        } catch (error) {
          console.log(error);
        }
      },
      closeRenameDialog() {
        this.showRenameDialog = false;
      },
      async removeMainShippingConfirmation(shipping) {
        this.showConfirmationPopup = true;
        this.shippingToRemove = shipping;
      },
      async removeMainShipping() {
        try {
          const shipping = this.shippingToRemove;
          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/shop_payment/${shipping._id}`, {
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            method: 'DELETE',
          });
          if (resAPI.ok) {
            const mainShippingIndex = this.shippings.findIndex(p => p._id === shipping._id);
            if (mainShippingIndex !== -1) {
              this.shippings.splice(mainShippingIndex, 1);
            } 
            this.showConfirmationPopup = false;
            this.$swal({
              toast: true,
              position: 'bottom-end',
              showConfirmButton: false,
              timer: 3000,
              icon: 'success',
              title: 'Remove Payment',
              text: 'Payment removed successfully',
            });
          } else {
            // Handle error condition
          }
        } catch (error) {
          console.log(error);
        }
      },
      cancelRemoveMainCategory() {
        this.showConfirmationPopup = false;
        this.shippingToRemove = null;
      },
      getMainShippingIndex(shipping) {
        const mainShippings = this.getMainShippings;
        const index = mainShippings.findIndex(p => p._id === shipping._id);
        return index !== -1 ? index + 1 : '';
      },
      flattenShippings(shippings) {
        const flattened = [];
        shippings.forEach(shipping => {
          flattened.push(shipping);
          if (shipping.subShippings && shipping.subShippings.length > 0) {
            flattened.push(...this.flattenShippings(shipping.subShippings));
          }
        });
        return flattened;
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your custom styles here */
  </style>  