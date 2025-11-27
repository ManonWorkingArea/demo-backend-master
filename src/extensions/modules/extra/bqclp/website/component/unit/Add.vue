<script>
import feather from 'feather-icons';
import FileBrowser from '@/interface/modal/FileBrowser.vue';
import Subhead from '@/interface/template/outline/Subhead.vue';
import { loadAndStoreConfigData } from '@/plugins/config';
import { markTailwind } from '@/plugins/tailwind-utils';
import storageManager from '@/plugins/storage';


export default {
    name: 'Blank',
    data() {
    const configs = storageManager.get('configs')
    return {
      routeName: this.routeName,
      configs: storageManager.get('configs'),
      pluginNamesArray: [],
      hostname: '',
      siteName: '',
      siteLogo: '',
      siteFavicon: '',
      siteStyle:'',
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
      activeBlock: false,
      FileBrowserOpen: false,
      defaultPlugin: null,
      selectedDesign: this.siteStyle,
      type: configs.siteType,
      parent: configs.siteID,
      colorOptions: [
        {
          color: "Mountain",
          description: "A rich, deep indigo",
          value: "bg-indigo-900",
          code: "indigo",
        },
        {
          color: "Ocean",
          description: "A cool, calming blue",
          value: "bg-blue-900",
          code: "blue",
        },
        {
          color: "Midnight",
          description: "A deep, dark blue, like the night sky",
          value: "bg-indigo-600",
          code: "indigo",
        },
        {
          color: "Sky",
          description: "A light, airy blue, like a clear sky",
          value: "bg-blue-700",
          code: "blue",
        },
        {
          color: "Sunset",
          description: "A warm, fiery red",
          value: "bg-red-900",
          code: "red",
        },
        {
          color: "Sunrise",
          description: "A soft, rosy pink",
          value: "bg-pink-900",
          code: "pink",
        },
        {
          color: "Desert Sun",
          description: "A warm, sandy yellow",
          value: "bg-yellow-900",
          code: "yellow",
        },
        {
          color: "Mustard",
          description: "Warm yellow with a hint of brown",
          value: "bg-yellow-700",
          code: "yellow",
        },
        {
          color: "Banana",
          description: "Bright, yellow, like bananas",
          value: "bg-yellow-600",
          code: "yellow",
        },
        {
          color: "Lemon",
          description: "Fresh, bright yellow, like a juicy lemon",
          value: "bg-yellow-500",
          code: "yellow",
        },
        {
          color: "Forest",
          description: "A deep green, reminiscent of a dense forest",
          value: "bg-green-800",
          code: "green",
        },
        {
          color: "Meadow",
          description: "A bright green, like a lush meadow on a sunny",
          value: "bg-green-700",
          code: "green",
        },
        {
          color: "Lime",
          description: "A bright, zesty green, like a freshly squeezed lime",
          value: "bg-green-600",
          code: "green",
        },
        {
          color: "Midnight",
          description: "A deep, dark black like a midnight sky",
          value: "bg-gray-900",
          code: "gray",
        },
        {
          color: "Charcoal",
          description: "A rich, dark black with gray undertones",
          value: "bg-gray-700",
          code: "gray",
        },
      ],
    };
  },
  components: {
      FileBrowser,Subhead
    },
  methods: {
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
      console.log("selectFileTrigger");
      if(payload!=undefined) {
        if (this.selectedImage === 'siteLogo') {
          this.siteLogo = payload.file;
          this.updataCover(payload.file, 'siteLogo');
        } else if (this.selectedImage === 'loginLogo') {
          this.loginLogo = payload.file;
          this.updataCover(payload.file, 'loginLogo');
        } else if (this.selectedImage === 'loginBg') {
          this.loginBg = payload.file;
          this.updataCover(payload.file, 'loginBg');
        } else if (this.selectedImage === 'siteFavicon') {
          this.siteFavicon = payload.file;
          this.updataCover(payload.file, 'siteFavicon');
        }
      }
    },
    async updataCover(cover, image) {
      console.log("cover",cover);
      if (image === 'siteLogo') {
        this.siteLogo = cover;
      } else if (image === 'loginLogo') {
        this.loginLogo = cover;
      } else if (image === 'loginBg') {
        this.loginBg = cover;
      } else if (image === 'siteFavicon') {
        this.siteFavicon = cover;
      }
    },
    async addCollection() {
      try {
        this.activeBlock = true
        const response = await fetch('https://gateway.cloudrestfulapi.com/api/hostname', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json','client-token-key':this.configs.key
          },
          body: JSON.stringify({
            data: {
              hostname: this.hostname,
              siteName: this.siteName,
              siteLogo: this.siteLogo,
              siteFavicon: this.siteFavicon,
              siteStyle: this.selectedDesign,
              siteType: "unit",
              siteSubStyle: this.selectedDesign.match(/bg-(\w+)-\d+/)[1],
              loginLogo: this.loginLogo,
              loginBg: this.loginBg,
              plugins: this.sitePlugin,
              parent: this.parent,
              defaultPlugin: this.defaultPlugin,
              s3Key: this.s3Key,
              s3Endpoint: this.s3Endpoint,
              s3Hosting: this.s3Hosting,
              s3Secret: this.s3Secret,
              s3Region: this.s3Region,
              s3EndpointDefault: this.s3EndpointDefault,
              s3Bucket: this.s3Bucket
            },
            options: {
              fieldType: [],
              uniqueFields: [
                ["hostname"]
              ]
            }
          })
        });
        const data = await response.json();
        this.activeBlock = false;
        console.log((await loadAndStoreConfigData(true)).siteName);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    },
    onPluginChange(event) {
      const name = event.target.name;
      const checked = event.target.checked;
      if (checked) {
        if (Array.isArray(this.sitePlugin)) {
          this.sitePlugin.push(name);
        } else {
          this.sitePlugin = [name];
        }
      } else {
        if (Array.isArray(this.sitePlugin)) {
          const index = this.sitePlugin.indexOf(name);
          if (index !== -1) {
            this.sitePlugin.splice(index, 1);
          }
        }
      }
      console.log(this.sitePlugin);
    },
  },
  mounted() {
    //this.fetchData();
    const storedPluginNames = storageManager.get('plugins');
        let pluginNamesArray = [];
        if (storedPluginNames) {
          const parsedPluginNames = storedPluginNames;
          pluginNamesArray = parsedPluginNames.data.map((plugin) => {
            const checked = Array.isArray(this.sitePlugin) ? this.sitePlugin.includes(plugin.slug) : this.sitePlugin.split(',').includes(plugin.slug);
            return {
              name: plugin.name,
              value: plugin.slug,
              dashboard: plugin.dashboard,
              description: plugin.description,
              default: plugin.default,
              role: plugin.role,
              checked: checked,
            };
          });
        }
        this.pluginNamesArray = pluginNamesArray;
  },
  updated() {
    feather.replace();
  },
  computed: {
    defaultPlugins() {
      return this.pluginNamesArray.filter((plugin) => plugin.default);
    },
    optionalPlugins() {
      return this.pluginNamesArray.filter((plugin) => !plugin.default);
    },
    filteredPlugins() {
      return this.pluginNamesArray.filter((plugin) => plugin.dashboard);
    },
  },

};
</script>


<template>

  <FileBrowser 
  v-if="FileBrowserOpen" 
  :isWindowsOpen="true" 
  :callbackFunction="'cover'"
  :allowFileType="['jpg','gif','png','jpeg']" 
  @file-browser-trigger="changeFileTrigger" 
  @file-browser-callback="selectFileTrigger"/>

  <Subhead :button="true" :name="'ย้อนกลับ'" :style="'chevron-left'" :link="'/asset/index'" /> 

  <main class="flex-1 pb-8">
    <div class="mt-8">
        <div class="flex-1 bg-gray-100">
            <div class="mt-8">
                <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
                    <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
                      <form @submit.prevent="addCollection">
                        <section aria-labelledby="payment-details-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">

                          <div class="shadow sm:overflow-hidden sm:rounded-md">
                              <div class="bg-white py-6 px-4 sm:p-6">

                                <div>
                                  <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">โลโก้และกราฟิก</h2>
                                  <p class="mt-1 text-sm text-gray-500">Customize your website's visual elements with ease using Logo & Graphic Setting.</p>
                                </div>

                                <div class="mt-6 flex gap-6">
                                  <div class="w-2/5 bg-gray-200/80 rounded-lg">
                                    <button @click="OpenFileBrowser('siteLogo')"
                                      v-bind:style="{ 'background-image': 'url(' + this.siteLogo + ')' }"
                                      type="button"
                                      class="relative bg-cover block w-full h-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                      style="background-size: cover; background-position: center;">
                                      <div class="p-3 bg-white bg-opacity-80 rounded-lg">
                                        <font-awesome-icon :icon="['fas','cloud-upload']" class="mx-auto h-12 w-12 text-gray-600"/>
                                        <span class="mt-2 block text-sm font-semibold text-gray-600">เปลี่ยนโลโก้</span>
                                      </div>
                                    </button>
                                  </div>
                                  <div class="w-3/5">
                                    <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
                                      <div>
                                        <label for="siteLogo" class="block text-sm font-semibold text-gray-700">Website Logo</label>
                                        <input v-model="siteLogo" type="text" name="siteLogo" id="siteLogo" autocomplete="siteLogo" readonly :class="getClasses('input-plaintext')" class="mt-1 block w-full rounded-md py-2 px-3">
                                        <p class="mt-1 text-sm text-gray-500">Please upload a logo image file in JPEG or PNG format, with a recommended file size of 200x200 pixels or larger.</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div class="w-2/5 bg-gray-200/80 rounded-lg">
                                    <button @click="OpenFileBrowser('loginLogo')" 
                                      v-bind:style="{ 'background-image': 'url(' + this.loginLogo + ')' }"
                                      type="button" 
                                      class="relative bg-cover block w-full h-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                      style="background-size: cover; background-position: center;">
                                      <div class="p-3 bg-white bg-opacity-80 rounded-lg">
                                        <font-awesome-icon :icon="['fas','cloud-upload']" class="mx-auto h-12 w-12 text-gray-600"/>
                                        <span class="mt-2 block text-sm font-semibold text-gray-600">เปลี่ยนโลโก้ Login</span>
                                      </div>
                                    </button>
                                  </div>
                                  <div class="w-3/5">
                                    <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
                                      <div>
                                        <label for="loginLogo" class="block text-sm font-semibold text-gray-700">Login Logo</label>
                                        <input v-model="loginLogo" type="text" name="loginLogo" id="loginLogo" autocomplete="loginLogo" readonly :class="getClasses('input-plaintext')" class="mt-1 block w-full rounded-md py-2 px-3">
                                        <p class="mt-1 text-sm text-gray-500">Please upload a logo image file in JPEG or PNG format, with a recommended file size of 200x200 pixels or larger.</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div class="mt-6 flex gap-6">

                                  <div class="w-2/5 bg-gray-200/80 rounded-lg">
                                    <button @click="OpenFileBrowser('loginBg')"
                                      v-bind:style="{ 'background-image': 'url(' + this.loginBg + ')' }"
                                      type="button"
                                      class="relative bg-cover block w-full h-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                      style="background-size: cover; background-position: center;">
                                      <div class="p-3 bg-white bg-opacity-80 rounded-lg">
                                        <font-awesome-icon :icon="['fas','cloud-upload']" class="mx-auto h-12 w-12 text-gray-600"/>
                                        <span class="mt-2 block text-sm font-semibold text-gray-600">เปลี่ยน Login Bg</span>
                                      </div>
                                    </button>
                                  </div>
                                  <div class="w-3/5">
                                    <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
                                      <div>
                                        <label for="loginBg" class="block text-sm font-semibold text-gray-700">Login Background</label>
                                        <input v-model="loginBg" type="text" name="loginBg" id="loginBg" autocomplete="loginBg" readonly :class="getClasses('input-plaintext')" class="mt-1 block w-full rounded-md py-2 px-3">
                                        <p class="mt-1 text-sm text-gray-500">Upload a JPEG/PNG image (max 5MB) for website background.</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div class="w-2/5 bg-gray-200/80 rounded-lg">
                                    <button @click="OpenFileBrowser('siteFavicon')" 
                                      v-bind:style="{ 'background-image': 'url(' + this.siteFavicon + ')' }"
                                      type="button" 
                                      class="relative bg-cover block w-full h-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                      style="background-size: cover; background-position: center;">
                                      <div class="p-3 bg-white bg-opacity-80 rounded-lg">
                                        <font-awesome-icon :icon="['fas','cloud-upload']" class="mx-auto h-12 w-12 text-gray-600"/>
                                        <span class="mt-2 block text-sm font-semibold text-gray-600">เปลี่ยนไอค่อน Favicon</span>
                                      </div>
                                    </button>
                                  </div>
                                  <div class="w-3/5">
                                    <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
                                      <div>
                                        <label for="siteFavicon" class="block text-sm font-semibold text-gray-700">Favicon</label>
                                        <input v-model="siteFavicon" type="text" name="siteFavicon" id="siteFavicon" autocomplete="siteFavicon" readonly :class="getClasses('input-plaintext')" class="mt-1 block w-full rounded-md py-2 px-3">
                                        <p class="mt-1 text-sm text-gray-500">Upload a 16x16 pixel image file in ICO or PNG format.</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div class="border-b border-1 border-dashed border-gray-300 mb-10 mt-10"></div>

                                <div class="mt-6">
                                  <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">ข้อมูลระบบ</h2>
                                  <p class="mt-1 text-sm text-gray-500">Manage your website's system information and settings with ease using System Information Config.</p>
                                </div>

                                <div class="mt-6 grid grid-cols-4 gap-6">

                                  <div class="col-span-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                                      <div>
                                        <label for="parent" class="block text-sm font-medium text-gray-700">Parent ID</label>
                                        <input v-model="parent" type="text" name="parent" id="parent" autocomplete="parent" readonly :class="getClasses('input-plaintext')" class="mt-1 block w-full rounded-md py-2 px-3">
                                      </div>
                                      
                                    </div>
                                  </div>

                                  <div class="col-span-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                                      <div>
                                        <label for="siteName" class="block text-sm font-medium text-gray-700">Site Name</label>
                                        <input v-model="siteName" type="text" name="siteName" id="siteName" autocomplete="siteName" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                      </div>

                                      <div>
                                        <label for="hostname" class="block text-sm font-medium text-gray-700">Hostname</label>
                                        <input v-model="hostname" type="text" name="hostname" id="hostname" autocomplete="hostname" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                      </div>

                                    </div>
                                  </div>

                                  <div class="col-span-4">
                                    <div class="grid grid-cols-4 md:grid-cols-4 gap-6">

                                      <div>
                                        <label for="s3Key" class="block text-sm font-medium text-gray-700">s3Key</label>
                                        <input v-model="s3Key" type="text" name="s3Key" id="s3Key" autocomplete="s3Key" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                      </div>

                                      <div>
                                        <label for="s3Endpoint" class="block text-sm font-medium text-gray-700">s3Endpoint</label>
                                        <input v-model="s3Endpoint" type="text" name="s3Endpoint" id="s3Endpoint" autocomplete="s3Endpoint" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                      </div>

                                      <div>
                                        <label for="s3Hosting" class="block text-sm font-medium text-gray-700">s3Hosting</label>
                                        <input v-model="s3Hosting" type="text" name="s3Hosting" id="s3Hosting" autocomplete="s3Hosting" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                      </div>

                                      <div>
                                        <label for="s3Secret" class="block text-sm font-medium text-gray-700">s3Secret</label>
                                        <input v-model="s3Secret" type="text" name="s3Secret" id="s3Secret" autocomplete="s3Secret" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                      </div>

                                    </div>
                                  </div>

                                  <div class="col-span-4">
                                    <div class="grid grid-cols-4 md:grid-cols-4 gap-6">

                                      <div>
                                        <label for="s3Region" class="block text-sm font-medium text-gray-700">s3Region</label>
                                        <input v-model="s3Region" type="text" name="s3Region" id="s3Region" autocomplete="s3Region" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                      </div>

                                      <div>
                                        <label for="s3EndpointDefault" class="block text-sm font-medium text-gray-700">s3EndpointDefault</label>
                                        <input v-model="s3EndpointDefault" type="text" name="s3EndpointDefault" id="s3EndpointDefault" autocomplete="s3EndpointDefault" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                      </div>

                                      <div>
                                        <label for="s3Bucket" class="block text-sm font-medium text-gray-700">s3Bucket</label>
                                        <input v-model="s3Bucket" type="text" name="s3Bucket" id="s3Bucket" autocomplete="s3Bucket" class="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                      </div>

                                    </div>
                                  </div>

                                </div>

                                <div class="border-b border-1 border-dashed border-gray-300 mb-10 mt-10"></div>

                                <div>
                                  <div>
                                    <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">สีของเว็บไซต์</h2>
                                    <p class="mt-1 text-sm text-gray-500">Customize your website's visual elements with ease using Logo & Graphic Setting.</p>
                                  </div>

                                  <div class="mt-5 grid grid-cols-3 gap-4">
                                    <label v-for="(option, index) in colorOptions" :key="index" class="flex items-center p-2 border border-gray-200 rounded-md cursor-pointer" :class="{ ['border-blue-900 border-1']: selectedDesign === option.value}">
                                      <input type="radio" name="design-selector" :value="option.value" v-model="selectedDesign" class="hidden">
                                      <div class="flex items-center justify-center w-8 h-8 rounded-md" :class="option.value"></div>
                                      <div class="ml-2">
                                        <span class="font-medium block">{{ option.color }}</span>
                                        <span class="text-gray-500 text-sm block">{{ option.description }}</span>
                                      </div>
                                    </label>
                                  </div>

                                </div>

                                <div class="border-b border-1 border-dashed border-gray-300 mb-10 mt-10"></div>
                                
                                <div class="mt-6">
                                  <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">รายชื่อโมดูลที่มีในระบบ</h2>
                                  <p class="mt-1 text-sm text-gray-500">Enabling and Disabling Plugins in a System Configuration</p>
                                </div>
        
                                <div class="mt-6">
                                  <div>
                                    <h2 class="text-lg font-medium mb-2">Default Plugins <small class="text-gray-600">(ไม่สามารถแก้ไขได้)</small></h2>
                                    <div class="grid grid-cols-3 gap-4">
                                      <!-- Default plugins section -->
                                      <template v-for="plugin in defaultPlugins" :key="plugin.value">
                                        <label class="flex items-center space-x-2 align-middle">
                                          <input
                                            type="checkbox"
                                            :name="plugin.value"
                                            :value="plugin.value"
                                            :checked="plugin.checked"
                                            @change="onPluginChange"
                                            class="h-5 w-5 mb-6 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ml-1"
                                          />
                                          <div>
                                            <span class="block text-gray-700 text-md font-semibold">{{ plugin.name }} 
                                              <span v-for="(role, index) in plugin.role" :key="index" class="inline-block bg-red-100 rounded-sm px-1 py-1 text-xs font-medium text-gray-700 mr-1 mb-1">
                                              {{ role }}
                                              </span>
                                            </span>
                                            <span class="block text-gray-500 text-sm">{{ plugin.description }}</span>
                                          </div>
                                        </label>
                                      </template>
                                    </div>
                                  </div>
                                  <div class="mt-6">
                                    <h2 class="text-lg font-medium mb-2">Optional Plugins <small class="text-gray-600">(เลือกใช้งานตามความต้องการ)</small></h2>
                                    <div class="grid grid-cols-3 gap-4">
                                      <!-- Optional plugins section -->
                                      <template v-for="plugin in optionalPlugins" :key="plugin.value">
                                        <label class="flex items-center space-x-2 align-middle">
                                          <input
                                            type="checkbox"
                                            :name="plugin.value"
                                            :value="plugin.value"
                                            :checked="plugin.checked"
                                            @change="onPluginChange"
                                            class="h-5 w-5 mb-6 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ml-1"
                                          />
                                          <div>
                                            <span class="block text-gray-700 text-md font-semibold">{{ plugin.name }} 
                                              <span v-for="(role, index) in plugin.role" :key="index" class="inline-block bg-red-100 rounded-sm px-1 py-1 text-xs font-medium text-gray-700 mr-1 mb-1">
                                              {{ role }}
                                              </span>
                                            </span>
                                            <span class="block text-gray-500 text-sm">{{ plugin.description }}</span>
                                          </div>
                                        </label>
                                      </template>
                                    </div>
                                  </div>
                                </div>

                                <div class="border-b border-1 border-dashed border-gray-300 mb-10 mt-10"></div>

                                <div class="mt-6">
                                  <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">ตั้งค่า Dashboard</h2>
                                  <p class="mt-1 text-sm text-gray-500">Shortlisting and configuring the active plugins for display on the dashboard.</p>
                                </div>

                                <div class="pt-3 w-full">
                                  <fieldset>
                                    <div class="mt-1 grid grid-cols-3 gap-4">
                                      <template v-for="plugin in filteredPlugins" :key="plugin.value">
                                        <div class="flex items-center">
                                          <input
                                            type="radio"
                                            :id="plugin.value"
                                            :value="plugin.value"
                                            v-model="defaultPlugin"
                                            class="focus:ring-gray-900 h-5 w-5 mb-6 text-gray-900 border-gray-300 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                          />
                                          <label :for="plugin.value" class="ml-3">
                                            <span class="block text-gray-700 text-md font-semibold">{{ plugin.name }}
                                              <span v-for="(role, index) in plugin.role" :key="index" class="inline-block bg-red-100 rounded-sm px-1 py-1 text-xs font-medium text-gray-700 mr-1 mb-1">
                                              {{ role }}
                                              </span>
                                            </span>
                                            <span class="block text-gray-500 text-sm">{{ plugin.description }}</span>
                                          </label>
                                        </div>
                                      </template>
                                    </div>
                                  </fieldset>
                                </div>
        
                              </div>
        
                              <div class="bg-gray-50 px-4 py-3 text-right sm:px-6 border-t">
                                <button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                                  <font-awesome-icon :icon="['fas','save']" class="pr-2 pl-2"/>บันทึกข้อมูล</button>
                              </div>
                          </div>
                        </section>
                      </form>
                    </div>
                </div>
            </div>
        </div>

    </div>
  </main>
</template>