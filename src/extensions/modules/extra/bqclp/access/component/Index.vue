<template>
  <div v-if="!loading_sources" class="text-center">
    <Loader/>
  </div>

  <Subhead 
    :navigation="[
      {
        name: 'ลงทะเบียน',
        link: '/enroll/new',
        style: 'plus',
        type: 'button',
        class: 'primary-btn'
      }
    ]"
    @toggleStatus="toggleStatus"
  />

  <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">เข้าสู่ระบบ BQCLP's LIMs</h2>
      <p class="mt-5 text-center text-gray-500">ลูกค้าผู้ส่งตัวอย่าง</p>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="login">
        <div>
          <label for="email" class="block text-sm font-medium leading-6 text-gray-900">Username</label>
          <div class="mt-2">
            <input v-model="username" id="username" name="username" type="text" autocomplete="username" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900">Password</label>
            <div class="text-sm">
              <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
            </div>
          </div>
          <div class="mt-2">
            <input v-model="password" id="password" name="password" type="password" autocomplete="current-password" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
          </div>
        </div>

        <div>
          <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign in</button>
        </div>
      </form>

    </div>
  </div>
</template>

<script>
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import storageManager from '@/plugins/storage';
import Subhead from '@/interface/template/outline/Subhead.vue';

export default {
  inject: ['apiServer', 'saltSecret'],
  data() {
    return {
      accessToken: storageManager.get('session', 'token'),
      listItems: [],
      loading_sources: true,
      username: '',
      password: '',
    }
  },
  components: {
    Loader,
    Subhead
  },
  methods: {
    async login() {
      try {
        const response = await fetch('https://sea-turtle-app-hit8g.ondigitalocean.app/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            users_code: this.username,
            pass_word: this.password,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate user');
        }

        const data = await response.json();
        const { success, result } = data;

        if (success) {
          console.log(result);

          const bqclp = {
            uss_id: result.uss_id,
            user_login: result.uss_login,
            user_image: result.uss_image,
            user_name: result.uss_name,
            user_profile: result.uss_name + ' (' + result.uss_name + ')',
          };
          
          const bqclpData = storageManager.get('bqclp');
          if (bqclpData) {
            storageManager.update('bqclp',bqclp)
          } else {
            storageManager.set('bqclp',bqclp)
          }
          window.location.href = "/"
        } else {
          throw new Error('Invalid username or password');
        }
      } catch (error) {
        console.error('Error accessing API:', error);
      }
    },
    updated() {
      feather.replace();
    },
  },
  async mounted () {
    try {
      await this.getAccess();
    } catch (error) {
      console.log(Error);
    }
  },
  setup() {
    //console.log("Setup");
  },
};
</script>
