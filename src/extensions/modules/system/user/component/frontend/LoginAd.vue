<script>
import storageManager from '@/plugins/storage';
export default {
	name: 'Login',
	components: {
	},
  props: {
    showModal: {
      type: Boolean,
      default: false
    }
  },
	data() {
		return {
      config: storageManager.get('configs'),
      username: '',
      password: '',
      errorStage: false,
      errorMessage: '',
      activeBlock: false,
      passwordVisible:false
		}
	},
	methods: {
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    async login() {
        try {
            this.activeBlock  = true;
            this.errorStage  = false
            const resAPILogin = await fetch("https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-34d16f42-4718-42b0-814e-08d23fecd2ce/default/login-fti-employee", {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                username: this.username,
                password: this.password
              })
            });
            
            const getLogin  = await resAPILogin.json();
            console.log("getLogin",getLogin);

            if(getLogin.status===200) {
              
              let unitList = [];
              let currentAccess = "";

              const session = {
                active: true,
                token: getLogin.user._id,
                refresh: "",
                login: true,
                userID: getLogin.user._id,
                user: getLogin.user,
                loader: false,
                role: getLogin.user.role,
                nav: "normal-nav",
                layout: "frontend-layout",
                current: currentAccess,
                list: unitList,
                enroll: getLogin.enroll,
                mode: getLogin.mode,
              };
              storageManager.update('session',session)
              console.log("session",session);

              if (this.showModal) {
                window.location.reload();
              }
              else
              {
                this.$swal({
                  toast: true,
                  position: 'bottom-end',
                  showConfirmButton: false,
                  timer: 1000,
                  icon: 'success',
                  title: 'แจ้งเตือน',
                  text: 'เข้าสู่ระบบเรียบร้อยแล้ว',
                }).then(() => 
                {
                  window.location.href = "/user/employee"
                });
              }
            } else {
              this.errorStage   = true
              this.errorMessage = getLogin;
            }
            this.activeBlock  = false;
        } catch (error) {
          console.log(error)
        }
    }
	},
};
</script>

<template>
  <div class="bg-gray-50">
    
    <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-lg">
        <img class="mx-auto h-24 w-auto" :src="this.config.siteLogo" alt="Your Company" v-if="!this.showModal">
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">เข้าสู่ระบบฝึกอบรม (HR)</h2>
        <p class="mt-2 text-center text-base text-gray-600">
        ใช้บัญชีสำหรับ K2 ในการล็อคอิน
        </p>
      </div>
  
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
          <form class="space-y-6" @submit.prevent="login">
            <div>
              <label for="email" class="block text-md font-semibold leading-6 text-gray-900">ชื่อผู้ใช้ในระบบ K2</label>
              <div class="mt-2">
                <input v-model="username" id="username" name="username" type="text" autocomplete="username" required="" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
              </div>
            </div>
  
            <div>
              <label for="password" class="block text-md font-semibold leading-6 text-gray-900">รหัสผ่าน</label>
              <div class="mt-2 relative">
                <input
                  v-model="password"
                  id="password"
                  name="password"
                  :type="passwordVisible ? 'text' : 'password'"
                  autocomplete="current-password"
                  required=""
                  class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-2 border border-gray-400 rounded shadow m-1"
                  @click="togglePasswordVisibility"
                >
                <font-awesome-icon :icon="passwordVisible ? ['fas', 'eye-slash'] : ['fas', 'eye']" class="text-black hover:text-gray-600 text-xs"/>
                </button>
              </div>
            </div>
  
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
                <label for="remember-me" class="ml-2 block text-sm text-gray-900">จำฉันไว้</label>
              </div>
  
              <div class="text-sm">
                <router-link :to="'/user/forgot'" class="font-medium text-indigo-600 hover:text-indigo-500">
                ลืมรหัสผ่าน
                </router-link>
              </div>
            </div>
  
            <div>
              <div v-if="this.errorStage" class="col-span-2">
                  <div class=" items-center px-3 py-1 rounded-md bg-red-100 text-sm text-black pb-5 mb-5">
                    <div class="font-semibold pt-3 pb-3">เกิดข้อผิดพลาด</div>
                    <div  class="w-full">{{this.errorMessage}}</div>
                  </div>
              </div>
              <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-4 text-md font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">เข้าสู่ระบบ</button>
            </div>
          </form>
  
        </div>
      </div>
    </div>
  
    </div>
</template>