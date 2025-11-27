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
      configs: storageManager.get('configs'),
      routeName: this.routeName,
      pluginNamesArray: [],
      hostname: '',
      siteName: '',
      siteLogo: '',
      siteFavicon: '',
      siteStyle:'',
      loginLogo: '',
      loginBg: '',
      sitePlugin: '',
      siteTheme: '',
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
      dataItem: this.$route.params.id,
      selectedlayout: '',
      selectedposition: '',
      selectedlogotype: '',
      usermenutype: '',
      usermenuendpoint:'',
      logosize: '',

      logoType: [
        { label: 'Image', value: 'image' },
        { label: 'Text', value: 'text' },
      ],
      userMenu: [
        { label: 'Icon', value: 'icon' },
        { label: 'Text', value: 'text' },
      ],
      layoutPositions: [
        { label: 'Fixed', value: 'fixed' },
        { label: 'Relative', value: 'relative' },
      ],
      layoutOption: [
        { label: 'Layout 1', value: 'layout1' },
        { label: 'Layout 2', value: 'layout2' },
        { label: 'Layout 3', value: 'layout3' },
      ],
      layoutLists: [
        {
          label: 'Layout 1',
          value: 'layout1',
          description: 'โลโก้ซ้าย เมนูกลาง สมาชิกขวา',
        },
        {
          label: 'layout 2',
          value: 'layout2',
          description: 'โลโก้บน-กลาง เมนู-สมาชิกล่าง',
        },
        {
          label: 'Layout 3',
          value: 'layout3',
          description: 'โลโก้กลาง เมนูซ้าย สมาชิก ขวา',
        },
      ],
      groupsName: [
        {
          code: 'default',
          name: 'ปลั๊กอินมาตรฐาน'
        },
        {
          code: 'system',
          name: 'จัดการระบบ'
        },
        {
          code: 'origin',
          name: 'ศูนย์กลางระบบ'
        },
        {
          code: 'academy',
          name: 'การเรียนออนไลน์'
        },
        {
          code: 'ecommerce',
          name: 'ขายของออนไลน์'
        },
        {
          code: 'payment',
          name: 'ระบบชำระเงิน'
        },
        {
          code: 'blog',
          name: 'เนื้อหา'
        }
      ],
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
    async fetchData() {
      try {
        let item              = this.$route.params.id;
        const response = await fetch('https://gateway.cloudrestfulapi.com/api/hostname/' + item, {
          method: 'GET',
          headers: {'Content-Type': 'application/json','client-token-key':this.configs.key}
        });
        const data = await response.json();
        const layout = data.layout;

        this.hostname           = data.hostname;
        this.siteName           = data.siteName;
        this.siteLogo           = data.siteLogo;
        this.siteFavicon        = data.siteFavicon;
        this.siteStyle          = data.siteStyle;
        this.siteTheme          = data.siteTheme;
        this.selectedDesign     = data.siteStyle;
        this.loginLogo          = data.loginLogo;
        this.loginBg            = data.loginBg;
        this.sitePlugin         = data.plugins;
        this.defaultPlugin      = data.defaultPlugin;
        this.id                 = data._id;
        this.s3Key              = data.s3Key;
        this.s3Endpoint         = data.s3Endpoint;
        this.s3Hosting          = data.s3Hosting;
        this.s3Secret           = data.s3Secret;
        this.s3Region           = data.s3Region;
        this.s3EndpointDefault  = data.s3EndpointDefault;
        this.s3Bucket           = data.s3Bucket;
        this.selectedlayout     = layout?.selectedlayout ?? '';
        this.selectedposition   = layout?.selectedposition ?? '';
        this.selectedlogotype   = layout?.selectedlogotype ?? '';
        this.usermenutype       = layout?.usermenutype ?? '';
        this.usermenuendpoint   = layout?.usermenuendpoint ?? '';
        this.logosize           = layout?.logosize ?? '';

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
              groups: plugin.groups,
              checked: checked,
            };
          });
        }
        this.pluginNamesArray = pluginNamesArray;
      } catch (error) {
        console.error(error);
      }
    },
    async updateData() {
      try {
        this.activeBlock = true
        const response = await fetch('https://gateway.cloudrestfulapi.com/api/hostname/' + this.id, {
          method: 'PUT',
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
              siteTheme: this.siteTheme,
              siteSubStyle: this.selectedDesign.match(/bg-(\w+)-\d+/)[1],
              loginLogo: this.loginLogo,
              loginBg: this.loginBg,
              plugins: this.sitePlugin,
              defaultPlugin: this.defaultPlugin,
              s3Key: this.s3Key,
              s3Endpoint: this.s3Endpoint,
              s3Hosting: this.s3Hosting,
              s3Secret: this.s3Secret,
              s3Region: this.s3Region,
              s3EndpointDefault: this.s3EndpointDefault,
              s3Bucket: this.s3Bucket,
              layout: {
                selectedlayout: this.selectedlayout,
                selectedposition: this.selectedposition,
                selectedlogotype: this.selectedlogotype,
                usermenutype: this.usermenutype,
                usermenuendpoint: this.usermenuendpoint,
                logosize: this.logosize,
              }
            },
            options: {
              unique: 'hostname'
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
    this.fetchData();
  },
  updated() {
    feather.replace();
  },
  computed: {
    defaultPlugins() {
      return this.pluginNamesArray.filter((plugin) => plugin.default);
    },
    groupedDefaultPlugins() {
      const groups = [];
      this.defaultPlugins.forEach(plugin => {
        const groupName = plugin.groups;
        const group = this.groupsName.find(group => group.code === groupName);
        const groupNameDisplay = group ? group.name : groupName;
        const index = groups.findIndex(group => group.groupName === groupNameDisplay);
        if (index >= 0) {
          groups[index].plugins.push(plugin);
        } else {
          groups.push({
            groupName: groupNameDisplay,
            plugins: [plugin]
          });
        }
      });
      return groups;
    },
    optionalPlugins() {
      return this.pluginNamesArray.filter((plugin) => !plugin.default);
    },
    groupedOptionalPlugins() {
      const groups = [];
      this.optionalPlugins.forEach(plugin => {
        const groupName = plugin.groups;
        const group = this.groupsName.find(group => group.code === groupName);
        const groupNameDisplay = group ? group.name : groupName;
        const index = groups.findIndex(group => group.groupName === groupNameDisplay);
        if (index >= 0) {
          groups[index].plugins.push(plugin);
        } else {
          groups.push({
            groupName: groupNameDisplay,
            plugins: [plugin]
          });
        }
      });
      return groups;
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

  <Subhead 
      :navigation="
      [
        {
          name: 'ปรับแต่งเมนู',
          link: '/school/menu/' + this.dataItem,
          style: 'list',
          class: 'primary-btn',
          visible: true,
          type: 'button',
        },
        {
          name: 'ย้อนกลับ',
          link: '/school/home',
          style: 'chevron-left',
          class: 'primary-btn',
          visible: true,
          type: 'button',
        }
      ]"
  />

  <main class="flex-1 pb-8">
    <div class="mt-8">
        <div class="flex-1 bg-gray-100">
            <div class="mt-8">
                <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
                    <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
                      <form @submit.prevent="updateData">
                        <section aria-labelledby="payment-details-heading" class="relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">

                          <div class="shadow sm:overflow-hidden sm:rounded-md">
                              <div class="bg-white py-6 px-4 sm:p-6">

                                <div>
                                  <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">โลโก้และกราฟิก - {{this.type}}</h2>
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
                                        <label for="id" class="block text-sm font-medium text-gray-700">Site ID</label>
                                        <input v-model="id" type="text" name="id" id="id" autocomplete="id" readonly :class="getClasses('input-plaintext')" class="mt-1 text-gray-300 block w-full rounded-md py-2 px-3">
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
                                      <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">Theme</h2>
                                      <p class="mt-1 text-sm text-gray-500">Customize your website's visual elements with ease using Logo & Graphic Setting.</p>
                                    </div>

                                    <div class="mt-5 grid grid-cols-4 gap-6">
                                      <div class="col-span-4 sm:col-span-4">
                                          <div class="grid grid-cols-1 lg:grid-cols-2 gap-1 justify-evenly">
                                              <div class="w-26 h-12">
                                                  <div class="flex items-start">
                                                      <div class="flex h-5 items-center">
                                                          <input v-model="siteTheme" id="theme1" value="yes" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                      </div>
                                                      <div class="ml-3 text-sm w-[90%]">
                                                          <label for="theme1" class="font-bold text-gray-900">ใช้ Custom Theme</label>
                                                          <p class="invisible lg:visible text-[16px] text-gray-500 truncate">ดึงข้อมูลบางส่วนจาก Theme ของเว็บไซต์</p>
                                                      </div>
                                                  </div>
                                              </div>
                                              <div class="w-26 h-12">
                                                  <div class="flex items-start">
                                                      <div class="flex h-5 items-center">
                                                          <input v-model="siteTheme" id="theme2" value="no" type="radio" class="h-4 w-4 cursor-pointer rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500">
                                                      </div>
                                                      <div class="ml-3 text-sm w-[90%]">
                                                          <label for="theme2" class="font-bold text-gray-900">ไม่ใช้ Custom Theme</label>
                                                          <p class="invisible lg:visible text-[16px] text-gray-500 truncate">ดึงข้อมูลจาก System ทั้งหมด</p>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                </div>

                                <div class="border-b border-1 border-dashed border-gray-300 mb-10 mt-10"></div>

                                <div class="mt-6">
                                  <h2 id="payment-details-heading" class="text-lg font-bold leading-6 text-gray-900">Header Option</h2>
                                  <p class="mt-1 text-sm text-gray-500">Manage your website's system information and settings with ease using System Information Config.</p>
                                </div>

                                <div class="mt-6 grid grid-cols-8 gap-6">

                                  <div class="col-span-4">
                                    <div class="grid grid-cols-1 md:grid-cols-1 gap-6">

                                      <div class="space-y-3">
                                        <legend class="text-base font-semibold leading-6 text-gray-900">เลือกตำแหน่ง Header</legend>
                                        <div class="mt-2">
                                          <div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
                                            <div
                                              v-for="(option, index) in layoutOption"
                                              :key="index"
                                              :class="[ selectedlayout === option.value ? 'cursor-pointer ring-2 ring-indigo-600 ring-offset-2 bg-indigo-600 text-white hover:bg-indigo-500' : 'cursor-pointer ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50',
                                                'cursor-pointer flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold sm:flex-1'
                                              ]"
                                              @click="selectedlayout = option.value"
                                            >
                                              <input type="radio" class="sr-only" :value="option.value" v-model="selectedlayout">
                                              {{ option.label }}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                    </div>

                                    <div class="border-b border-1 border-dashed border-gray-300 mt-5"></div>
                                  </div>

                                  <div class="col-span-4">
                                    <div class="grid grid-cols-1 md:grid-cols-1 gap-6">

                                      <div class="space-y-3">
                                        <legend class="text-base font-semibold leading-6 text-gray-900">เลือกตำแหน่ง Header</legend>
                                        <div class="mt-2">
                                          <div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
                                            <div
                                              v-for="(option, index) in layoutPositions"
                                              :key="index"
                                              :class="[ selectedposition === option.value ? 'cursor-pointer ring-2 ring-indigo-600 ring-offset-2 bg-indigo-600 text-white hover:bg-indigo-500' : 'cursor-pointer ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50',
                                                'cursor-pointer flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold sm:flex-1'
                                              ]"
                                              @click="selectedposition = option.value"
                                            >
                                              <input type="radio" class="sr-only" :value="option.value" v-model="selectedposition">
                                              {{ option.label }}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                    </div>
                                    <div class="border-b border-1 border-dashed border-gray-300 mt-5"></div>
                                  </div>

                                  <div class="col-span-4">
                                    <div class="grid grid-cols-1 md:grid-cols-1 gap-6">

                                      <div class="space-y-3">

                                        <legend class="text-base font-semibold leading-6 text-gray-900">ตั้งค่า Logo</legend>
                                      
                                        <div class="mt-2">
     
                                          <div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
                                            <div
                                              v-for="(option, index) in logoType"
                                              :key="index"
                                              :class="[ selectedlogotype === option.value ? 'cursor-pointer ring-2 ring-indigo-600 ring-offset-2 bg-indigo-600 text-white hover:bg-indigo-500' : 'cursor-pointer ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50',
                                                'cursor-pointer flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold sm:flex-1'
                                              ]"
                                              @click="selectedlogotype = option.value"
                                            >
                                              <input type="radio" class="sr-only" :value="option.value" v-model="selectedlogotype">
                                              {{ option.label }}
                                            </div>

                                          </div>
                                          <div class="mt-5">
                                            <label for="logosize" class="block text-sm font-semibold text-gray-700">ขนาดโลโก้ <span class="font-normal">( h-10 )</span></label>
                                            <input v-model="logosize" type="text" name="logosize" id="logosize" autocomplete="h-10" class="mt-1 block w-28 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                          </div>
                                        </div>
                                      </div>

                                    </div>
                                  </div>

                                  <div class="col-span-4">
                                    <div class="grid grid-cols-1 md:grid-cols-1 gap-6">

                                      <div class="space-y-3">

                                        <legend class="text-base font-semibold leading-6 text-gray-900">ตั้งค่า User Menu</legend>
                                      
                                        <div class="mt-2">
     
                                          <div class="grid grid-cols-3 gap-3 sm:grid-cols-5">
                                            <div
                                              v-for="(option, index) in userMenu"
                                              :key="index"
                                              :class="[ usermenutype === option.value ? 'cursor-pointer ring-2 ring-indigo-600 ring-offset-2 bg-indigo-600 text-white hover:bg-indigo-500' : 'cursor-pointer ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50',
                                                'cursor-pointer flex items-center justify-center rounded-md py-3 px-3 text-sm font-semibold sm:flex-1'
                                              ]"
                                              @click="usermenutype = option.value"
                                            >
                                              <input type="radio" class="sr-only" :value="option.value" v-model="usermenutype">
                                              {{ option.label }}
                                            </div>
                                          </div>

                                          <div class="mt-5">
                                            <label for="usermenuendpoint" class="block text-sm font-semibold text-gray-700">Endpoint <span class="font-normal">( user )</span></label>
                                            <input v-model="usermenuendpoint" type="text" name="usermenuendpoint" id="usermenuendpoint" autocomplete="h-10" class="mt-1 block w-28 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 sm:text-sm">
                                          </div>

                                        </div>
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
                                    <h2 class="text-lg text-gray-600 font-bold mb-2"><font-awesome-icon :icon="['fas','folder-open']" class="mx-auto"/> Default Plugins <small class="font-normal text-gray-600">(ไม่สามารถแก้ไขได้)</small></h2>
                                    <template v-for="group in groupedDefaultPlugins" :key="group.groupName">
                                      <div class="ml-2">
                                        <h3 class="text-md font-semibold mb-4 mt-4 text-gray-500"><font-awesome-icon :icon="['fas','file']" class="mx-auto"/> {{ group.groupName }}</h3>
                                        <div class="grid grid-cols-3 gap-4">
                                          <template v-for="plugin in group.plugins" :key="plugin.value">
                                            <label class="flex items-center space-x-2 align-middle">
                                              <input
                                                type="checkbox"
                                                :name="plugin.value"
                                                :value="plugin.value"
                                                :checked="plugin.checked"
                                                @change="onPluginChange"
                                                class="h-5 w-5 mb-6 text-indigo-500 focus:ring-indigo-400 border-gray-300 rounded ml-1"
                                              />
                                              <div>
                                                <span class="block text-blue-900 text-md font-semibold">{{ plugin.name }} <small class="font-normal text-gray-500 mr-1">({{ plugin.value }})</small> 
                                                  <span v-for="(role, index) in plugin.role" :key="index" class="inline-block bg-indigo-100 rounded-sm px-1 py-1 text-xs font-medium text-gray-700 mr-1 mb-1">
                                                    {{ role }}
                                                  </span>
                                                </span>
                                                <span class="block text-gray-400 text-sm">{{ plugin.description }}</span>
                                              </div>
                                            </label>
                                          </template>
                                        </div>
                                      </div>
                                      <div class="border-b border-1 border-dashed border-gray-300 mb-5 mt-5"></div>
                                    </template>
                                  </div>
                                  
                                  <div class="mt-6">
                                    <h2 class="text-lg text-gray-600 font-bold mb-2"><font-awesome-icon :icon="['fas','folder-open']" class="mx-auto"/> Optional Plugins <small class="font-normal text-gray-600">(เลือกใช้งานตามความต้องการ)</small></h2>
                                    <template v-for="(group, groupName) in groupedOptionalPlugins" :key="groupName">
                                      <div class="ml-2">
                                        <h3 class="text-md font-semibold mb-4 mt-4 text-gray-500"><font-awesome-icon :icon="['fas','file']" class="mx-auto"/> {{ group.groupName }}</h3>
                                        <div class="grid grid-cols-3 gap-4">
                                          <template v-for="plugin in group.plugins" :key="plugin.value">
                                            <label class="flex items-center space-x-2 align-middle">
                                              <input
                                                type="checkbox"
                                                :name="plugin.value"
                                                :value="plugin.value"
                                                :checked="plugin.checked"
                                                @change="onPluginChange"
                                                class="h-5 w-5 mb-6 text-indigo-500 focus:ring-indigo-400 border-gray-300 rounded ml-1"
                                              />
                                              <div>
                                                <span class="block text-blue-900 text-md font-semibold">{{ plugin.name }} <small class="font-normal text-gray-500 mr-1">({{ plugin.value }})</small> 
                                                  <span v-for="(role, index) in plugin.role" :key="index" class="inline-block bg-indigo-100 rounded-sm px-1 py-1 text-xs font-medium text-gray-700 mr-1 mb-1">
                                                    {{ role }}
                                                  </span>
                                                </span>
                                                <span class="block text-gray-500 text-sm">{{ plugin.description }}</span>
                                              </div>
                                            </label>
                                          </template>
                                        </div>
                                      </div>
                                      <div class="border-b border-1 border-dashed border-gray-300 mb-10 mt-5"></div>
                                    </template>
                                  </div>

                                </div>


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
                                              <span v-for="(role, index) in plugin.role" :key="index" class="inline-block bg-indigo-100 rounded-sm px-1 py-1 text-xs font-medium text-gray-700 mr-1 mb-1">
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