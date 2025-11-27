<script>
import storageManager from '@/plugins/storage';
import Login from '../extensions/modules/system/user/component/frontend/LoginForm.vue';
import Register from '../extensions/modules/system/user/component/frontend/RegisterForm.vue';
import { translate } from '@/plugins/language.js';
export default {
	name: 'Authen',
	components: {
        Login,Register
	},
  props: {
    showModal: {
      type: Boolean,
      default: false
    }
  },
	data() {
		return {
      configs: storageManager.get('configs'),
      hostname: storageManager.get('hostname'),
      showRegisterForm:false
		}
	},
	methods: {
    translate,
    toggleRegisterForm() {
        this.showRegisterForm = !this.showRegisterForm;
    },
	},
};
</script>

<template>
  <div class="bg-gray-50">
    
    <div class="flex min-h-full flex-col justify-center py-6 sm:px-3 lg:px-4">
      <div class="sm:mx-auto sm:w-full sm:max-w-lg">
        <img class="mx-auto h-16 w-auto" :src="this.configs.siteLogo" alt="Your Company" v-if="!this.showModal">
        <h2 class="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">{{translate('member-login')}}</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ translate('general-or')	 }}
          <button @click="toggleRegisterForm" class="font-medium text-indigo-600 hover:text-indigo-500">
            {{ translate('member-register')	 }}
          </button>
        </p>
      </div>

      <template v-if="!showRegisterForm">
        <Login/>
      </template>

      <template v-if="showRegisterForm">
        <Register/>
      </template>
  
    </div>
</div>
</template>