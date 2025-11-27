<script>
import Subhead from '@/interface/template/outline/Subhead.vue';
import storageManager from '@/plugins/storage';
import { translate } from '@/plugins/language.js';
export default {
  components: {
    Subhead
  },
  data() {
    return {
      playerBackgroundColor: '#1a1a1a',
      logoUrl: '',
      logoLink: '',
      overlayPrefix: '',
      logoPosition: 'top-left',
      overlayPosition: 'bottom-left',
      logoWidth: 100,
      alwaysShowFullScreen: true,
      overlayData: 'ip',
      logoRef: null,
      overlayRef: null,
      positions: {
        'top-left': ['top-2', 'left-2'],
        'top-right': ['top-2', 'right-2'],
        'bottom-left': ['bottom-2', 'left-2'],
        'bottom-right': ['bottom-2', 'right-2'],
        'center': ['top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2']
      },
      mainColor: '#ff0000',
      controlBackgroundColor: '#ff0000',
      controlColor: '#ff0000',
      fileInput: null
    };
  },
  created() {
    this.configs = storageManager.get('configs') || {};
    this.session = storageManager.get('session') || {};
    this.logoUrl = this.configs.logoUrl || 'https://new-logo-url.com/logo.png';
    this.logoLink = this.configs.logoLink || 'https://example.com';
    this.overlayPrefix = this.configs.overlayPrefix || 'Your New Prefix: ';
    this.overlayPosition = this.configs.overlayPosition || 'bottom-left';
    this.logoWidth = this.configs.logoWidth || 100;
    this.alwaysShowFullScreen = this.configs.alwaysShowFullScreen || true;
    this.overlayData = this.configs.overlayData || 'ip';
  },
  watch: {
    logoUrl(newUrl) {
      if (this.logoRef) this.logoRef.src = newUrl;
    },
    overlayPrefix(newPrefix) {
      if (this.overlayRef) this.overlayRef.innerHTML = `${newPrefix} ${this.overlayData}`;
    }
  },
  methods: {
    translate,
    saveToJson() {
      const data = {
        playerBackgroundColor: this.playerBackgroundColor,
        logoUrl: this.logoUrl,
        overlayPrefix: this.overlayPrefix,
        logoPosition: this.logoPosition,
        overlayPosition: this.overlayPosition,
      };
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'player-customization.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    selectFile() {
      this.fileInput.click();
    },
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.logoUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    async updateData() {
      try {
        const requestBody = {
          data: {
            player_theme: {
              logoUrl: this.logoUrl,
              logoLink: this.logoLink,
              logoWidth: this.logoWidth,
              logoPosition: this.logoPosition,
              alwaysShowFullScreen: this.alwaysShowFullScreen,
              overlayPrefix: this.overlayPrefix,
              overlayPosition: this.overlayPosition,
              overlayData: this.overlayData,
              colors: {
                '--plyr-color-main': this.mainColor,
                '--plyr-control-color': this.controlColor, // Assuming this is a constant value
                '--plyr-control-background': this.controlBackgroundColor,
                '--plyr-background': this.playerBackgroundColor
              }
            }
          }
        };

        const { data, status } = await this.$Request.PUT(`hostname/${this.session.current._id}`, requestBody, this.configs.key);

        if (status === 200) {
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'success',
            title: 'บันทึกข้อมูลสำเร็จ',
            text: 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว',
          });

          console.log(data);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async loadData() {
      try {
        const { data, status } = await this.$Request.GET(`hostname/${this.session.current._id}`, this.configs.key);

        if (status === 200) {
          const playerData = data.player_theme || {};

          this.logoUrl = playerData.logoUrl || this.logoUrl;
          this.logoLink = playerData.logoLink || this.logoLink;
          this.logoWidth = playerData.logoWidth || this.logoWidth;
          this.logoPosition = playerData.logoPosition || this.logoPosition;
          this.alwaysShowFullScreen = playerData.alwaysShowFullScreen || this.alwaysShowFullScreen;
          this.overlayPrefix = playerData.overlayPrefix || this.overlayPrefix;
          this.overlayPosition = playerData.overlayPosition || this.overlayPosition;
          this.overlayData = playerData.overlayData || this.overlayData;

          // โหลดค่าของสี
          const colors = playerData.colors || {};
          this.mainColor = colors['--plyr-color-main'] || this.mainColor;
          this.controlBackgroundColor = colors['--plyr-control-background'] || this.controlBackgroundColor;
          this.controlColor = colors['--plyr-control-color'] || this.controlColor;
          this.playerBackgroundColor = colors['--plyr-background'] || this.playerBackgroundColor;

          console.log(data);

          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            icon: 'success',
            title: 'โหลดข้อมูลสำเร็จ',
            text: 'ข้อมูลถูกโหลดเรียบร้อยแล้ว',
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  },
  mounted() {
    this.loadData();
  }
};
</script>

<template>
  <Subhead :navigation="
      [
        {
            name: 'หลักสูตร',
            link: '/lesson',
            style: 'home',
            class: 'default-btn',
            //visible: this.master,
            type: 'button',
        },
        {
            name: 'Player',
            link: '/lesson/player-customize',
            style: 'play',
            class: 'default-btn',
            //visible: this.master,
            type: 'button',
        },
        {
            name: 'Course Detail',
            link: '/lesson/detail-customize',
            style: 'paint-roller',
            class: 'default-btn',
            //visible: this.master,
            type: 'button',
        },
      ]"
  />

  <div class="w-full max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-lg overflow-hidden mt-4 p-2">
    <!-- Dummy Video Player -->
    <div class="relative w-full h-96 flex items-center justify-center" :style="{ backgroundColor: playerBackgroundColor }">
      <button 
        class="absolute w-16 h-16 rounded-full flex items-center justify-center hover:bg-red-700 text-2xl text-white border-none shadow-lg focus:outline-none"
        :style="{ backgroundColor: mainColor }"
      >
        ▶
      </button>
      <div class="absolute" :class="positions[logoPosition]">
        <a :href="logoLink" target="_blank">
          <img ref="logoRef" :src="logoUrl" alt="Logo" :style="{ width: logoWidth + 'px' }" class="h-auto">
        </a>
      </div>
      <div ref="overlayRef" class="absolute bg-gray-800 bg-opacity-75 text-white text-sm px-3 py-1 rounded-lg text-center" 
           :class="positions[overlayPosition]">
          {{ overlayPrefix }} {{ overlayData }}
      </div>
    </div>

    <!-- Controls -->
    <div class="p-0 bg-gray-800 flex items-center gap-3">
      <button class="text-white text-xl focus:outline-none">⏸</button>
      <div class="relative flex-grow h-1 bg-white rounded-lg">
        <div class="h-full" :style="{ backgroundColor: controlColor, width: '30%' }"></div>
        <div class="absolute -top-1 left-[30%] w-4 h-4 bg-white rounded-full transform -translate-x-1/2"></div>
      </div>
      <span class="text-gray-400 min-w-[100px] text-center whitespace-nowrap">
        00:00 / 02:37
      </span>
      <div class="relative w-24 h-1 bg-white rounded-lg">
        <div class="h-full" :style="{ backgroundColor: controlColor, width: '50%' }"></div>
        <div class="absolute -top-1 left-[50%] w-4 h-4 bg-white rounded-full transform -translate-x-1/2"></div>
      </div>
      <button class="text-white text-xl focus:outline-none">⚙️</button>
      <button class="text-white text-xl focus:outline-none">⛶</button>
    </div>
  </div>

  <div class="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mt-4 p-6">
    <h3 class="text-gray-900 text-lg mb-4 font-semibold">Control Panel</h3>
    <div class="flex flex-col gap-6">
      <!-- Group for Logo Configuration -->
      <div>
        <h4 class="text-gray-900 font-medium mb-2">Logo Configuration</h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center">
            <label class="text-gray-900 font-medium w-1/3">Select Logo:</label>
            <input type="file" @change="onFileChange" class="hidden" ref="fileInput" />
            <div 
              class="w-16 h-16 bg-gray-200 border rounded cursor-pointer flex items-center justify-center"
              @click="selectFile"
            >
              <img :src="logoUrl" alt="Logo Thumbnail" class="w-full h-full object-cover" v-if="logoUrl" />
              <span v-else>+</span>
            </div>
          </div>
          <div class="flex items-center">
            <label class="text-gray-900 font-medium w-1/3">Logo URL:</label>
            <input type="text" v-model="logoUrl" class="flex-grow p-2 border rounded" />
          </div>
          <div class="flex items-center">
            <label class="text-gray-900 font-medium w-1/3">Logo Link:</label>
            <input type="text" v-model="logoLink" class="flex-grow p-2 border rounded" />
          </div>
          <div class="flex items-center">
            <label class="text-gray-900 font-medium w-1/3">Logo Position:</label>
            <select v-model="logoPosition" class="flex-grow p-2 border rounded">
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>
          <div class="flex items-center">
            <label class="text-gray-900 font-medium w-1/3">Logo Width:</label>
            <input type="number" v-model="logoWidth" class="flex-grow p-2 border rounded" min="50" />
          </div>
          <div class="flex items-center">
            <input type="checkbox" v-model="alwaysShowFullScreen" class="mr-2" />
            <label class="text-gray-900 font-medium">Always Show in Full Screen</label>
          </div>
        </div>
      </div>

      <!-- Group for Overlay IP Configuration -->
      <div>
        <h4 class="text-gray-900 font-medium mb-2">Overlay IP Configuration</h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center">
            <label class="text-gray-900 font-medium w-1/3">Overlay IP Prefix:</label>
            <input type="text" v-model="overlayPrefix" class="flex-grow p-2 border rounded" />
          </div>
          <div class="flex items-center">
            <label class="text-gray-900 font-medium w-1/3">Overlay IP Position:</label>
            <select v-model="overlayPosition" class="flex-grow p-2 border rounded">
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="center">Center</option>
            </select>
          </div>
          <div class="flex items-center">
            <label class="text-gray-900 font-medium w-1/3">Data to Show:</label>
            <select v-model="overlayData" class="flex-grow p-2 border rounded">
              <option value="ip">IP</option>
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="datetime">Datetime</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Group for Color Configuration -->
      <div>
        <h4 class="text-gray-900 font-medium mb-2">Color Configuration</h4>
        <div class="flex flex-col gap-2">
          <div class="flex items-center">
            <label class="text-gray-900 font-medium w-1/3">Player Background Color:</label>
            <input type="color" v-model="playerBackgroundColor" class="ml-2" />
          </div>
          <div class="flex items-center">
            <label class="text-gray-900 font-medium w-1/3">Play Button Color:</label>
            <input type="color" v-model="mainColor" class="ml-2" />
          </div>
          <div class="flex items-center">
            <label class="text-gray-900 font-medium w-1/3">Seek Bar Color:</label>
            <input type="color" v-model="controlBackgroundColor" class="ml-2" />
          </div>
          <div class="flex items-center">
            <label class="text-gray-900 font-medium w-1/3">Volume Bar Color:</label>
            <input type="color" v-model="controlColor" class="ml-2" />
          </div>
        </div>
      </div>
    </div>
    <button @click="saveToJson" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded shadow">Save to JSON</button>
    <button @click="updateData" class="mt-4 bg-green-600 text-white px-4 py-2 rounded shadow">Update Data</button>
  </div>
</template>
