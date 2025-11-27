<script>
import storageManager from '@/plugins/storage';
import CryptoJS from 'crypto-js';
export default {
	name: 'Login',
	components: {
	},
	data() {
		return {
      config: storageManager.get('configs'),
      email: '',
      password: '',
		}
	},
	methods: {
    async login() {
        try {
          
            this.activeBlock   = true;

            const resAPILogin   = await fetch("https://gateway.cloudrestfulapi.com/api/user/query", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                body: JSON.stringify({
                  method: 'find',
                  args: [
                    {
                      $and: [
                        { username: this.email }
                      ]
                    }
                  ]
                })
            });
            
            const getLogin  = await resAPILogin.json();
            const loginData = getLogin.length > 0 ? getLogin[0] : null;

            if (loginData === null) {
              console.log("Invalid username or password");
              this.activeBlock  = false;
              return;
            }
            else
            {
              const salt        = loginData.salt;
              const inputHash   = CryptoJS.SHA256(this.password + salt).toString();
              const storedHash  = loginData.password;

              if (inputHash === storedHash) {

                console.log("Login successful");

                // Get Student Enroll

                const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/enroll/query", {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json','client-token-key':this.config.key},
                  body: JSON.stringify({
                    method: 'find',
                    hidden:  ['userID'],
                    args: [
                      {
                        $and: [
                          { userID: loginData._id }
                        ]
                      }
                    ]
                  })
                });

                const getEnroll  = await resAPI.json();

                if(resAPI.status===200)
                {
                  let unitList = [];
                  let currentAccess = "";

                  const session = {
                    active: true,
                    token: loginData._id,
                    refresh: "",
                    login: true,
                    userID: loginData._id,
                    user: loginData,
                    loader: false,
                    role: loginData.role,
                    nav: "normal-nav",
                    layout: "frontend-layout",
                    current: currentAccess,
                    list: unitList,
                    enroll: getEnroll,
                  };
                  storageManager.update('session',session)

                  console.log("session",session);
                  window.location.href = "/student/profile"
                }

                
              } else {
                console.log("Invalid username or password");
              }
            }
            this.activeBlock  = false;
            console.log("getLogin",getLogin);
          
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
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">เข้าสู่ระบบสมาชิก</h2>
        <p class="mt-2 text-center text-md text-gray-600">
          หรือ
          <router-link :to="'/user/register'" class="font-medium text-indigo-600 hover:text-indigo-500">
          ลงทะเบียนสมาชิก
          </router-link>
        </p>
      </div>
  
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form class="space-y-6" @submit.prevent="login">
            <div>
              <label for="email" class="block text-md font-semibold leading-6 text-gray-900">อีเมล์</label>
              <div class="mt-2">
                <input v-model="email" id="email" name="email" type="email" autocomplete="email" required="" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
              </div>
            </div>
  
            <div>
              <label for="password" class="block text-md font-semibold leading-6 text-gray-900">รหัสผ่าน</label>
              <div class="mt-2">
                <input v-model="password" id="password" name="password" type="password" autocomplete="current-password" required="" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
              </div>
            </div>
  
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
                <label for="remember-me" class="ml-2 block text-sm text-gray-900">จำฉันไว้</label>
              </div>
  
              <div class="text-sm">
                <router-link :to="'/student/forgot'" class="font-medium text-indigo-600 hover:text-indigo-500">
                ลืมรหัสผ่าน
                </router-link>
              </div>
            </div>
  
            <div>
              <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-4 text-md font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">เข้าสู่ระบบ</button>
            </div>
          </form>
  
        </div>
      </div>
    </div>
  
    </div>
</template>