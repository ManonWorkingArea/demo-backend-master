<script>
import Loader from '@/interface/template/Loader.vue';
import Subhead from '@/interface/template/outline/Subhead.vue';
import storageManager from '@/plugins/storage';

import Content from '@/extensions/modules/elearning/lesson/component/course/resource/plugin/CourseList.vue';
import CourseBuilderModal from './CourseBuilderModalMinimal.vue';
import { translate } from '@/plugins/language.js';
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
        { codeName: 'e_learning', name: 'E-Learning', componentName: 'Component4', icon: 'list', subText: 'หลักสูตร E-Learning' },
        { codeName: 'onsite', name: 'On-site', componentName: 'Component1', icon: 'file-alt', subText: 'หลักสูตร On-site' },
        { codeName: 'online_course', name: 'On-line', componentName: 'Component2', icon: 'pencil-ruler', subText: 'หลักสูตร On-line' }
      ],
      selectedTab: 'e_learning',
      showCourseBuilder: false,
    };
  },
  components: {
    Loader,
    Subhead,
    Content,
    CourseBuilderModal
  },
  methods: {
    translate,
    selectTab(code) {
      this.selectedTab = code;
      window.location.hash = `#${code}`;
    },
    openCourseBuilder() {
      this.showCourseBuilder = true;
    },
    closeCourseBuilder() {
      this.showCourseBuilder = false;
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
    @openCourseBuilder="openCourseBuilder"
    :navigation="
    [
        {
            name: translate('lesson-new'),
            link: '/lesson/add',
            style: 'plus',
            class: 'default-btn',
            //visible: this.master,
            type: 'button',
        },{
            name: 'Course Builder',
            function: 'openCourseBuilder',
            style: 'magic',
            class: 'default-btn',
            //visible: this.master,
            type: 'call-function',
        },{
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

        <template v-if="selectedTab === 'e_learning'">
          <Content :itemType="selectedTab"/>
        </template>

        <template v-if="selectedTab === 'onsite'">
          <Content :itemType="selectedTab"/>
        </template>

        <template v-if="selectedTab === 'online_course'">
          <Content :itemType="selectedTab"/>
        </template>

      </div>
    </div>
  </div>

  <!-- Course Builder Modal -->
  <CourseBuilderModal 
    v-show="showCourseBuilder"
    @close="closeCourseBuilder"
  />
</template>

<style scoped>
.tab-folder {
  display: flex;
}

.tab-folder-item {
  padding: 10px 20px 5px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.tab-folder-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.tab-folder-item.active {
  font-weight: bold;
}
</style>