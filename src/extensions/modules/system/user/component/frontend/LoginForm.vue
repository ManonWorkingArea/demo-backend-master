<script>
import storageManager from '@/plugins/storage';
import CryptoJS from 'crypto-js';

import debug from '@/plugins/Logger.js';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import { translate } from '@/plugins/language.js';

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
      configs: storageManager.get('configs'),
      hostname: storageManager.get('hostname'),
      email: '',
      password: '',
      errorStage: false,
      errorMessage: '',
      activeBlock:false
		}
	},
	methods: {
    translate,
    generateRandomString(length) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    },
    generateStateWithRedirect(redirectPath) {
      const stateData = { 
        random: this.generateRandomString(12),
        redirect: redirectPath,
        siteID: this.configs.siteID
      };
      return btoa(JSON.stringify(stateData)); 
    },
    loginWithLine() {
      const clientId        = this.configs.line?.client_id;
      const redirectUri     = encodeURIComponent(this.configs.line?.callback);
      const state           = this.generateStateWithRedirect('/user/profile');
      const scope           = 'profile openid';
      const botPrompt       = 'aggressive'; // Or 'aggressive', depending on how prominently you want to prompt users to add the bot
      window.location.href  = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}&bot_prompt=${botPrompt}`;
    },
    
    async login() {
        try {
          
            this.activeBlock   = true;

            const resAPILogin = await Request.POST('user/query', {
              method: 'find',
              args: [
                {
                  $and: [
                    { username: this.email }
                  ]
                }
              ]
            }, this.configs.key);

            const getLogin  = resAPILogin.data;
            const loginData = getLogin.length > 0 ? getLogin[0] : null;

            debug.log("loginData",loginData)

            if (loginData === null || loginData === '' || loginData === undefined) {
              this.errorStage   = true
              this.errorMessage = "ไม่พบข้อมูลบัญชีผู้ใช้นี้";
              this.activeBlock  = false;
              return;
            } else {
              const salt        = loginData.salt;
              const inputHash   = CryptoJS.SHA256(this.password + salt).toString();
              const storedHash  = loginData.password;

              debug.log(inputHash,storedHash)

              if (inputHash === storedHash) {

                if(loginData.role!="user") {
                  this.errorStage   = true
                  this.errorMessage = "ไม่มีสิทธิ์เข้าใช้งานเว็บไซต์นี้";
                } else {
                  // Get User Enroll
                  const resAPI = await Request.POST('enroll/query', {
                    method: 'find',
                    hidden:  ['userID'],
                    args: [
                      {
                        $and: [
                          { userID: loginData._id }
                        ]
                      }
                    ]
                  }, this.configs.key);

                  const getEnroll  = resAPI.data;
                  if(resAPI.status===200) {
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
                      channel: 'web',
                    };
                    storageManager.update('session',session)
                    debug.log("session",session);

                    if (this.showModal) {
                      window.location.reload();
                    }
                    else
                    {
                      this.$swal({
                        toast: true,
                        position: 'bottom-end',
                        showConfirmButton: false,
                        timer: 500,
                        icon: 'success',
                        title: 'แจ้งเตือน',
                        text: 'เข้าสู่ระบบเรียบร้อยแล้ว',
                      }).then(() => 
                      {
                        if(loginData.req_reset)
                        {
                            window.location.href = "/user/reset"
                        }
                        else {
                            window.location.reload();
                        }
                      });
                    }
                    
                  }
                }
              } else {
                this.errorStage   = true
                this.errorMessage = "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง";
              }
            }
            this.activeBlock  = false;
        } catch (error) {
          debug.log(error)
        }
    }
	},
};
</script>

<template>

<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 relative" :data-content="translate('database-connect')" :class="[(activeBlock?'isblock' : 'isunblock')]">
        <form class="space-y-6" @submit.prevent="login">

          <div>
            <div class="relative mt-2">
              <span class="input-label">{{translate('form-username')}} <small class="text-red-400">({{translate('form-request')}})</small></span>
              <input
                v-model="email"
                type="text"
                :placeholder="translate('form-username')"
                class="w-full p-4 border border-gray-200 text-sm"
              />
            </div>
          </div>

          <div>
            <div class="relative mt-2">
              <span class="input-label">{{translate('form-password')}} <small class="text-red-400">({{ translate('form-request') }})</small></span>
              <input
                v-model="password"
                type="password"
                :placeholder="translate('form-password')"
                class="w-full p-4 border border-gray-200 text-sm"
              />
            </div>
          </div>

        <div class="flex items-center justify-between">
            <div class="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">{{translate('login-remember')}}</label>
            </div>

            <div class="text-sm">
            <router-link :to="'/user/forgot'" class="font-medium text-indigo-600 hover:text-indigo-500">
            {{ translate('login-forgot') }}
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
            <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-4 text-md font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              <font-awesome-icon :icon="['fas', 'key']" class="mr-2"/> {{ translate('login-btn')	 }}
            </button>
        </div>
        </form>

    </div>
</div>

</template>
<style scoped>
.input-label{
    font-size: 15px;
    background: #fff;
    position: absolute;
    left: 10px;
    top: -10px;
    padding-left: 4px;
    padding-right: 5px;
    color: #000000;
    font-weight: bold;
}
</style>