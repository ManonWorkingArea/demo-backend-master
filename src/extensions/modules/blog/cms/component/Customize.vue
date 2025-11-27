<script>
import Loader from '@/interface/template/Loader.vue';
import Subhead from '@/interface/template/outline/Subhead.vue';
import storageManager from '@/plugins/storage';

import Template from '@/extensions/modules/blog/cms/component/_plugin/customize/Template.vue';
import User from '@/extensions/modules/blog/cms/component/_plugin/customize/User.vue';
import Email from '@/extensions/modules/blog/cms/component/_plugin/customize/Email.vue';
import Menu from '@/extensions/modules/blog/cms/component/_plugin/customize/Menu.vue';
import Config from '@/extensions/modules/blog/cms/component/_plugin/customize/Config.vue';

export default {
  
  data() {
    const accessToken = storageManager.get('session', 'token');
    const session = storageManager.get('session');
    return {
      configs: storageManager.get('configs'),
      hostkey: this.$Key,
      accessToken,
      session,
      loading_sources: true,
      activeTab: 'home',
      tabs: [
        { codeName: 'template', name: 'Template', componentName: 'Component4', icon: 'list', subText: 'ปรับแต่งธีม' },
        { codeName: 'user', name: 'User', componentName: 'Component1', icon: 'file-alt', subText: 'ปรับแต่งหน้าผู้ใช้งาน' },
        { codeName: 'email', name: 'Email', componentName: 'Component2', icon: 'pencil-ruler', subText: 'ปรับอีเมล์เทมเพลต' },
        { codeName: 'menu', name: 'Menu', componentName: 'Component3', icon: 'list', subText: 'เมนูหน้าเว็บ' },
        { codeName: 'config', name: 'การตั้งค่า', componentName: 'Component5', icon: 'cog', subText: 'ตั้งค่าทั่วไป' }
      ],
      selectedTab: 'template',
    };
  },
  components: {
    Loader,
    Subhead,
    Template,
    User,
    Email,
    Menu,
    Config
  },
  methods: {
    selectTab(code) {
      this.selectedTab = code;
      window.location.hash = `#${code}`;
    },
  },
  async mounted() {
    try {
      const hash = window.location.hash;
      if (hash) {
        const tabCode = hash.replace('#', '');
        if (this.tabs.some(tab => tab.codeName === tabCode)) {
          this.selectedTab = tabCode;
        }
      }
    } catch (error) {
      console.log(Error);
    }
  },
}
</script>

<template>
  <div v-if="!loading_sources" class="text-center">
    <Loader/>
  </div>
  <Subhead v-if="loading_sources" 
    :navigation="
    [
      {
        name: 'หน้าเว็บ',
        link: '/cms/pages',
        style: 'globe',
        class: 'primary-btn',
        visible: true,
        type: 'button',
      },
    ]"
    @openPopup="openPopup"
  />

  <div class="flex-1 pb-8 bg-gray-100 pb-5" v-if="loading_sources">
    <div class="mx-auto left-5">

      <div class="tab-folder flex border-gray-400 bg-gray-500 pt-5 pl-2 md:pl-6">
        <div 
          class="tab-folder-item cursor-pointer py-2 px-3 text-gray-700 hover:text-blue-600 transition-colors duration-200 bg-opacity-100 relative rounded-t-lg bg-gray-100 mr-1" 
          v-for="tab in tabs" 
          :key="tab.codeName" 
          @click="selectTab(tab.codeName)" 
          :class="{ 
            'bg-gray-100 text-blue-600': selectedTab === tab.codeName, // Active tab styles
            'bg-gray-100 bg-opacity-30': selectedTab !== tab.codeName // Normal tab styles
          }"
        >
          <div class="flex items-center ">
            <font-awesome-icon :icon="['fas', tab.icon]" class="mr-1 hidden md:block"/>
            <div>{{ tab.name }}</div>
          </div>
          <div class="text-sm text-gray-600 hidden md:block">{{ tab.subText }}</div>
          <div v-if="selectedTab === tab.codeName" class="absolute bottom-0 left-0 w-full"></div>
        </div>
      </div>

      <div class="mx-auto px-6 sm:px-6 lg:px-6">

        <template v-if="selectedTab === 'template'">
          <Template :itemType="selectedTab"/>
        </template>

        <template v-if="selectedTab === 'user'">
          <User :itemType="selectedTab"/>
        </template>

        <template v-if="selectedTab === 'email'">
          <Email :itemType="selectedTab"/>
        </template>

        <template v-if="selectedTab === 'menu'">
          <Menu :itemType="selectedTab"/>
        </template>

        <template v-if="selectedTab === 'config'">
          <Config :itemType="selectedTab"/>
        </template>
        
      </div>
    </div>
  </div>

  
</template>

<style scoped>
.tab-folder {
  display: flex;
}

.tab-folder-item {
  padding: 10px 20px 5px 20px;
  cursor: pointer;
}

.tab-folder-item:hover {
}

.tab-folder-item.active {
  font-weight: bold;
}
</style>