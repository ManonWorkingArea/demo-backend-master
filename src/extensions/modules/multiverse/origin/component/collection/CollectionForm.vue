<script>
import feather from 'feather-icons';
import FileBrowser from '@/interface/modal/FileBrowser.vue';

import SpaceSelector from '@/extensions/modules/multiverse/module/plugin/SpaceSelector.vue';
import ClientSelector from '@/extensions/modules/multiverse/module/plugin/ClientSelector.vue';
import ThemeSelector from '@/extensions/modules/multiverse/module/plugin/ThemeSelector.vue';
import PluginManager from '@/extensions/modules/multiverse/module/plugin/PluginManager.vue';

import OwnershipManager from './module/plugin/OwnershipManager.vue';
import { markTailwind } from '@/plugins/tailwind-utils';
import storageManager from '@/plugins/storage';

export default {
  name: 'CollectionForm',
  props: {
    mode: {
      type: String,
      required: true,
      validator: value => ['add', 'edit'].includes(value)
    },
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
    data() {
    const configs = storageManager.get('configs');
    return {
      hostkey: this.$Key,
      formData: {
        hostname: '',
        siteName: '',
        siteLogo: '',
        siteFavicon: '',
        siteStyle: '',
        loginLogo: '',
        loginBg: '',
        sitePlugin: '',
        id: '',
        s3Key: '',
        s3Endpoint: '',
        s3Hosting: '',
        s3Secret: '',
        s3Region: '',
        s3EndpointDefault: '',
        s3Bucket: '',
        defaultPlugin: null,
        selectedDesign: '',
        type: configs.siteType,
        parent: configs.siteID,
        packageId: null,
        spaceId: null,
        clientId: null,
        ownerId: null // Reference ไปยัง ownership record
      },
      activeBlock: false,
      FileBrowserOpen: false,
      selectedImage: '',
      packageList: []
    };
  },
  components: {
    FileBrowser,
    SpaceSelector,
    ClientSelector,
    ThemeSelector,
    PluginManager,
    OwnershipManager
  },
  watch: {
    initialData: {
      handler(newData) {
        if (newData && Object.keys(newData).length > 0) {
          this.populateFormData(newData);
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    populateFormData(data) {
      Object.keys(this.formData).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          this.formData[key] = data[key];
        }
      });
      this.formData.selectedDesign = data.siteStyle || this.formData.selectedDesign;
    },
    
    formatBytes(bytes) {
      var marker = 1024;
      var decimal = 3;
      var kiloBytes = marker;
      var megaBytes = marker * marker;
      var gigaBytes = marker * marker * marker;
      if(bytes < kiloBytes) return bytes + " Bytes";
      else if(bytes < megaBytes) return(bytes / kiloBytes).toFixed(decimal) + " KB";
      else if(bytes < gigaBytes) return(bytes / megaBytes).toFixed(decimal) + " MB";
      else return(bytes / gigaBytes).toFixed(decimal) + " GB";
    },
    
    calculateDiskUsagePercentage(bytes, full) {
      const limitInBytes = full * 1024 * 1024;
      const percentage = (bytes / limitInBytes) * 100;
      return percentage.toFixed(2);
    },
    

    


    isPackageSelected(packageId) {
      return packageId === this.formData.packageId;
    },
    
    getClasses(className) {
      const tailwindClasses = markTailwind(className);
      return `${tailwindClasses}`;
    },
    
    OpenFileBrowser(image) {
      this.selectedImage = image;
      this.FileBrowserOpen = true;
    },
    
    changeFileTrigger(payload) {
      this.FileBrowserOpen = payload;
    },
    
    selectFileTrigger(payload) {
      if(payload != undefined) {
        if (this.selectedImage === 'siteLogo') {
          this.formData.siteLogo = payload.file;
          this.updataCover(payload.file, 'siteLogo');
        } else if (this.selectedImage === 'loginLogo') {
          this.formData.loginLogo = payload.file;
          this.updataCover(payload.file, 'loginLogo');
        } else if (this.selectedImage === 'loginBg') {
          this.formData.loginBg = payload.file;
          this.updataCover(payload.file, 'loginBg');
        } else if (this.selectedImage === 'siteFavicon') {
          this.formData.siteFavicon = payload.file;
          this.updataCover(payload.file, 'siteFavicon');
        }
      }
    },
    
    async updataCover(cover, image) {
      if (image === 'siteLogo') {
        this.formData.siteLogo = cover;
      } else if (image === 'loginLogo') {
        this.formData.loginLogo = cover;
      } else if (image === 'loginBg') {
        this.formData.loginBg = cover;
      } else if (image === 'siteFavicon') {
        this.formData.siteFavicon = cover;
      }
    },
    
    async submitForm() {
      this.$emit('submit', this.formData);
    },
    
    goBackToCollectionList() {
      this.$router.push('/origin/collection');
    },
    
    resetForm() {
      // Reset form data to initial state
      this.formData = {
        hostname: '',
        siteName: '',
        siteLogo: '',
        siteFavicon: '',
        siteStyle: '',
        loginLogo: '',
        loginBg: '',
        sitePlugin: '',
        id: '',
        s3Key: '',
        s3Endpoint: '',
        s3Hosting: '',
        s3Secret: '',
        s3Region: '',
        s3EndpointDefault: '',
        spaceId: '',
        packageId: '',
        selectedDesign: '',
        clientId: '',
        packageName: '',
        spaceName: ''
      };
      
      // Re-populate with initial data if in edit mode
      if (this.mode === 'edit' && this.initialData && Object.keys(this.initialData).length > 0) {
        this.populateFormData(this.initialData);
      }
      
      // Reinitialize plugins
      this.initializePlugins();
      
      // Show confirmation
      this.$swal({
        icon: 'success',
        title: 'รีเซ็ตเรียบร้อย',
        text: 'ข้อมูลในฟอร์มได้รับการรีเซ็ตแล้ว',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    },
    
    async getPackages() {
      try {
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/package/query", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'client-token-key': this.hostkey },
          body: JSON.stringify({
            method: 'find',
            args: [{ status: true }]
          })
        });

        const RestReturn = await resAPI.json();
        this.packageList = RestReturn;
      } catch (error) {
        console.log(error);
      }
    },




    
    onPluginChange(event) {
      const name = event.target.name;
      const checked = event.target.checked;
      if (checked) {
        if (Array.isArray(this.formData.sitePlugin)) {
          this.formData.sitePlugin.push(name);
        } else {
          this.formData.sitePlugin = [name];
        }
      } else {
        if (Array.isArray(this.formData.sitePlugin)) {
          const index = this.formData.sitePlugin.indexOf(name);
          if (index !== -1) {
            this.formData.sitePlugin.splice(index, 1);
          }
        }
      }
    },

    handleSpaceSelected(spaceId) {
      this.formData.spaceId = spaceId;
    },

    handleClientSelected(clientToken) {
      this.formData.clientId = clientToken;
    },

    handleThemeSelected(themeValue) {
      this.formData.selectedDesign = themeValue;
    },

    handlePluginsChanged(selectedPlugins) {
      this.formData.sitePlugin = selectedPlugins.join(',');
    },

    getSelectedPlugins() {
      if (typeof this.formData.sitePlugin === 'string') {
        return this.formData.sitePlugin ? this.formData.sitePlugin.split(',') : [];
      }
      return Array.isArray(this.formData.sitePlugin) ? this.formData.sitePlugin : [];
    },

    handleDefaultPluginChanged(pluginValue) {
      this.formData.defaultPlugin = pluginValue;
    },

    handleOwnershipUpdated(ownershipData) {
      // ในระบบใหม่ ownership จะถูกจัดการแยกจาก collection
      // เราจะได้ ownerId กลับมาแทน
      if (ownershipData && ownershipData._id) {
        this.formData.ownerId = ownershipData._id;
      }
      console.log('Ownership updated:', ownershipData);
    },

    showSuccessMessage(message) {
      this.$swal({
        icon: 'success',
        title: 'สำเร็จ',
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    },

    showErrorMessage(message) {
      this.$swal({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000
      });
    }
  },
  
  async mounted() {
    await this.getPackages();
  },
  
  updated() {
    feather.replace();
  },
  
  computed: {
    isEditMode() {
      return this.mode === 'edit';
    },
    
    isAddMode() {
      return this.mode === 'add';
    },
    
    submitButtonText() {
      return this.isEditMode ? 'อัพเดทข้อมูล' : 'บันทึกข้อมูล';
    },

    // Get dashboard-ready plugins from selected plugins
    dashboardPlugins() {
      // For now, return empty array since we need to get this from PluginManager
      // This will be populated when PluginManager emits the selected plugins
      return [];
    },
  },
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="w-full px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <button 
              @click="goBackToCollectionList"
              class="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">
                {{ isEditMode ? 'แก้ไข Collection' : 'สร้าง Collection ใหม่' }}
              </h1>
              <p class="text-sm text-gray-600">{{ isEditMode ? 'จัดการข้อมูลและการตั้งค่า Collection' : 'สร้างและตั้งค่า Collection ใหม่' }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center text-xs text-gray-500">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              System Online
            </div>
            
            <button 
              type="button"
              @click="resetForm"
              class="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              รีเซ็ต
            </button>
            
            <button
              type="button"
              @click="submitForm"
              class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              {{ submitButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- File Browser Modal -->
    <FileBrowser 
      v-if="FileBrowserOpen" 
      :isWindowsOpen="true" 
      :callbackFunction="'cover'"
      :allowFileType="['jpg','gif','png','jpeg']" 
      @file-browser-trigger="changeFileTrigger" 
      @file-browser-callback="selectFileTrigger"/>

    <!-- Form Content -->
    <div class="w-full">
      <form @submit.prevent="submitForm">
        <section aria-labelledby="collection-form-heading" class="relative" 
                 :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" 
                 :class="[(activeBlock?'isblock' : 'isunblock')]">

          <div class="bg-white shadow-sm">
            <div class="px-6 py-8 space-y-10">

            <!-- Logo and Graphics Section -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div class="border-b border-gray-200 pb-4">
                <h2 id="collection-form-heading" class="text-2xl font-bold text-gray-900 mb-2">🎨 โลโก้และกราฟิก</h2>
                <p class="text-base text-gray-700 font-medium">อัปโหลดโลโก้และไฟล์กราฟิกต่าง ๆ สำหรับเว็บไซต์ของคุณ</p>
                <p class="text-sm text-gray-500 mt-1">รองรับไฟล์: JPG, PNG, GIF (ขนาดแนะนำ: 1200x600 พิกเซล)</p>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                <!-- Site Logo -->
                <div class="space-y-3">
                  <div class="aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <button @click="OpenFileBrowser('siteLogo')"
                      v-bind:style="{ 'background-image': 'url(' + formData.siteLogo + ')' }"
                      type="button"
                      class="w-full h-full bg-cover bg-center flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                      style="background-size: cover; background-position: center;">
                      <div class="text-center p-4 bg-white/95 border border-gray-200 rounded-lg shadow-sm">
                        <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <span class="mt-2 block text-sm font-medium text-gray-700">เลือกโลโก้เว็บไซต์</span>
                        <span class="block text-xs text-gray-500 mt-1">คลิกเพื่ออัปโหลด</span>
                      </div>
                    </button>
                  </div>
                  <div>
                    <label for="siteLogo" class="block text-sm font-bold text-gray-800 mb-2">🖼️ Website Logo</label>
                    <p class="text-xs text-gray-500 mb-2">โลโก้หลักของเว็บไซต์ที่จะแสดงในส่วนหัว</p>
                    <input v-model="formData.siteLogo" type="text" name="siteLogo" id="siteLogo" readonly 
                           class="block w-full border border-gray-300 bg-gray-50 text-sm px-3 py-2 rounded-md">
                  </div>
                </div>

                <!-- Login Logo -->
                <div class="space-y-3">
                  <div class="aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <button @click="OpenFileBrowser('loginLogo')" 
                      v-bind:style="{ 'background-image': 'url(' + formData.loginLogo + ')' }"
                      type="button" 
                      class="w-full h-full bg-cover bg-center flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                      <div class="text-center p-4 bg-white/95 border border-gray-200 rounded-lg shadow-sm">
                        <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <span class="mt-2 block text-sm font-medium text-gray-700">เลือกโลโก้ Login</span>
                        <span class="block text-xs text-gray-500 mt-1">คลิกเพื่ออัปโหลด</span>
                      </div>
                    </button>
                  </div>
                  <div>
                    <label for="loginLogo" class="block text-sm font-bold text-gray-800 mb-2">🔐 Login Logo</label>
                    <p class="text-xs text-gray-500 mb-2">โลโก้สำหรับหน้าเข้าสู่ระบบ</p>
                    <input v-model="formData.loginLogo" type="text" name="loginLogo" id="loginLogo" readonly 
                           class="block w-full border border-gray-300 bg-gray-50 text-sm px-3 py-2 rounded-md">
                  </div>
                </div>

                <!-- Login Background -->
                <div class="space-y-3">
                  <div class="aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <button @click="OpenFileBrowser('loginBg')"
                      v-bind:style="{ 'background-image': 'url(' + formData.loginBg + ')' }"
                      type="button"
                      class="w-full h-full bg-cover bg-center flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                      <div class="text-center p-4 bg-white/95 border border-gray-200 rounded-lg shadow-sm">
                        <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span class="mt-2 block text-sm font-medium text-gray-700">เลือกพื้นหลัง Login</span>
                        <span class="block text-xs text-gray-500 mt-1">คลิกเพื่ออัปโหลด</span>
                      </div>
                    </button>
                  </div>
                  <div>
                    <label for="loginBg" class="block text-sm font-bold text-gray-800 mb-2">🌅 Login Background</label>
                    <p class="text-xs text-gray-500 mb-2">รูปพื้นหลังสำหรับหน้าเข้าสู่ระบบ</p>
                    <input v-model="formData.loginBg" type="text" name="loginBg" id="loginBg" readonly 
                           class="block w-full border border-gray-300 bg-gray-50 text-sm px-3 py-2 rounded-md">
                  </div>
                </div>

                <!-- Site Favicon -->
                <div class="space-y-3">
                  <div class="aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                    <button @click="OpenFileBrowser('siteFavicon')" 
                      v-bind:style="{ 'background-image': 'url(' + formData.siteFavicon + ')' }"
                      type="button"
                      class="w-full h-full bg-cover bg-center flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                      <div class="text-center p-4 bg-white/95 border border-gray-200 rounded-lg shadow-sm">
                        <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                        </svg>
                        <span class="mt-2 block text-sm font-medium text-gray-700">เลือก Favicon</span>
                        <span class="block text-xs text-gray-500 mt-1">คลิกเพื่ออัปโหลด</span>
                      </div>
                    </button>
                  </div>
                  <div>
                    <label for="siteFavicon" class="block text-sm font-bold text-gray-800 mb-2">⭐ Site Favicon</label>
                    <p class="text-xs text-gray-500 mb-2">ไอคอนเล็ก ๆ ที่แสดงในแท็บเบราว์เซอร์</p>
                    <input v-model="formData.siteFavicon" type="text" name="siteFavicon" id="siteFavicon" readonly 
                           class="block w-full border border-gray-300 bg-gray-50 text-sm px-3 py-2 rounded-md">
                  </div>
                </div>
              </div>
            </div>

            <!-- System Information Section -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div class="border-b border-gray-200 pb-4">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">⚙️ ข้อมูลระบบ</h2>
                <p class="text-base text-gray-700 font-medium">กำหนดข้อมูลพื้นฐานและการตั้งค่าเริ่มต้นของเว็บไซต์</p>
                <p class="text-sm text-gray-500 mt-1">ข้อมูลเหล่านี้จะใช้ในการแสดงผลและการจัดการเว็บไซต์</p>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div class="space-y-3">
                  <label for="hostname" class="block text-sm font-bold text-gray-800 mb-1">🌐 Hostname</label>
                  <p class="text-xs text-gray-500 mb-2">ชื่อโดเมนหรือ URL ของเว็บไซต์</p>
                  <input v-model="formData.hostname" type="text" name="hostname" id="hostname" 
                         class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors">
                </div>

                <div class="space-y-3">
                  <label for="siteName" class="block text-sm font-bold text-gray-800 mb-1">📝 Site Name</label>
                  <p class="text-xs text-gray-500 mb-2">ชื่อเว็บไซต์ที่จะแสดงในหัวข้อ</p>
                  <input v-model="formData.siteName" type="text" name="siteName" id="siteName" 
                         class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors">
                </div>

                <!-- Site ID (Edit Mode Only) -->
                <div v-if="isEditMode" class="md:col-span-2 space-y-3">
                  <label for="siteId" class="block text-sm font-bold text-gray-800 mb-1">🔗 Site ID</label>
                  <p class="text-xs text-gray-500 mb-2">รหัสเฉพาะของเว็บไซต์ในระบบ (ไม่สามารถแก้ไขได้)</p>
                  <input v-model="formData.id" type="text" name="siteId" id="siteId" readonly 
                         class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed">
                </div>
              </div>
            </div>

            <!-- Space Selection (Edit Mode Only) -->
            <SpaceSelector 
              v-if="isEditMode" 
              :selected-space-id="formData.spaceId"
              :hostkey="hostkey"
              @space-selected="handleSpaceSelected" />

            <!-- Client Selection (Edit Mode Only) -->
            <ClientSelector 
              v-if="isEditMode" 
              :selected-client-id="formData.clientId"
              :hostkey="hostkey"
              @client-selected="handleClientSelected" />

            <!-- Color Theme Selection -->
            <ThemeSelector 
              :selected-theme="formData.selectedDesign"
              @theme-selected="handleThemeSelected" />
            
            <!-- Plugin Management + Dashboard Configuration -->
            <PluginManager 
              :selected-plugins="getSelectedPlugins()"
              :default-plugin="formData.defaultPlugin"
              :hostkey="hostkey"
              @plugins-changed="handlePluginsChanged"
              @default-plugin-changed="handleDefaultPluginChanged" />

            <!-- Ownership Management -->
            <OwnershipManager 
              :collection-id="formData.id || 'new'"
              :initial-ownership="{}"
              :hostkey="hostkey"
              :readonly="false"
              @ownership-updated="handleOwnershipUpdated"
              @success="showSuccessMessage"
              @error="showErrorMessage" />

          </div>

          <!-- Submit Button -->
          <div class="bg-gray-50 border-t border-gray-200">
            <div class="px-6 py-6">
              <div class="flex justify-between items-center">
                <div class="text-sm text-gray-600">
                  <span class="font-medium">{{ isEditMode ? 'อัพเดทข้อมูล Collection' : 'สร้าง Collection ใหม่' }}</span>
                  <p class="text-xs text-gray-500 mt-1">กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก</p>
                </div>
                <div class="flex space-x-3">
                  <button 
                    type="button"
                    @click="resetForm"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    รีเซ็ตฟอร์ม
                  </button>
                  <button type="submit" 
                          class="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {{ submitButtonText }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </form>
  </div>
  </div>
</template>
