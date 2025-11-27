<template>
  <div>
    <button class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50" @click="openModal">
      <font-awesome-icon :icon="['fas', 'key']" class="h-4 w-4 mr-2 flex-shrink-0 text-white"/> เข้าสู่ระบบ เพื่อดำเนินการต่อ
    </button>
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen">
        <div class="fixed inset-0 bg-gray-500 opacity-75"></div>
        <div class="relative bg-white rounded-lg overflow-hidden w-full max-w-md">
          <div class="absolute top-0 right-0 mr-4 mt-4">
            <button class="text-gray-400 hover:text-gray-600" @click="closeModal">
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5 flex-shrink-0 text-gray-400"/>
            </button>
          </div>
          <div class="p-0">
            <component :is="currentLoginComponent" :show-modal="showModal" @login-success="handleLoginSuccess"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import Login    from '../extensions/modules/system/user/component/frontend/Login.vue';
import LoginAd  from '../extensions/modules/system/user/component/frontend/LoginAd.vue';

export default {
  data() {
    return {
      configs: storageManager.get('configs'),
      showModal: false,
      currentLoginComponent: null
    };
  },
  methods: {
    openModal() {
      this.showModal = true;
      if (this.configs.defaultLogin === 'user/AD') {
        this.currentLoginComponent = LoginAd;
      } else {
        this.currentLoginComponent = Login;
      }
    },
    closeModal() {
      this.showModal = false;
    },
  }
};
</script>
