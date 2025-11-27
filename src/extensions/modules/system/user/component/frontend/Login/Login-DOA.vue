<script>
import storageManager from '@/plugins/storage';
import CryptoJS from 'crypto-js';

import debug from '@/plugins/Logger.js';

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import dialog from '@/plugins/Dialog.js';

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
            username: '',
            password: '',
            errorStage: false,
            errorMessage: '',
            newmember:false,
            showForm: false,
            activeBlock:false,
            memberMode:'login'
		}
	},
	methods: {
        toggleForm() {
            this.showForm = !this.showForm;
        },
        resetPassword(mode) {
            this.memberMode = mode;
        },
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
    isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    },
    transformUsername(username) {
        const isEmail = this.isValidEmail(username);
        if (isEmail) {
            username = username.toLowerCase().replace(/^\w/, c => c.toUpperCase());
        } else {
            username = username.replace(/^\w/, c => c.toUpperCase());
        }
        const usernameFirstLower = username.replace(/^\w/, c => c.toLowerCase());
        const usernameLowercase = username.toLowerCase();
        const usernameUppercase = username.toUpperCase();
        return [username, usernameFirstLower, usernameLowercase, usernameUppercase];
    },
    async login() {
        try {

            if (!this.username || !this.password) {
                this.errorStage = true;
                this.errorMessage = "โปรดกรอกชื่อผู้ใช้งานและรหัสผ่าน";
                this.activeBlock = false;
                return;
            }
          
            this.activeBlock   = true;
            const [
                transformedUsername,
                transformedUsernameFirstLower,
                transformedUsernameLowercase,
                transformedUsernameUppercase
            ] = this.transformUsername(this.username);

            const resAPILogin = await Request.POST('user/query', {
              method: 'find',
              args: [
                {
                    $or: [
                        { username: transformedUsername },
                        { username: transformedUsernameFirstLower },
                        { username: transformedUsernameLowercase },
                        { username: transformedUsernameUppercase }
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
                  this.activeBlock  = false;
                  this.errorMessage = "ไม่มีสิทธิ์เข้าใช้งานเว็บไซต์นี้";
                } else {
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
                          window.location.href = "/user/profile"
                        }
                      });
                    }
                    
                  }
                }
              } else {
                this.errorStage   = true
                this.activeBlock  = false;
                this.errorMessage = "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง";
              }
            }
        } catch (error) {
          debug.log(error)
        }
    },
    async reset() {
        try {
            this.errorStage   = false
            this.activeBlock  = true;
            const [
                transformedUsername,
                transformedUsernameFirstLower,
                transformedUsernameLowercase,
                transformedUsernameUppercase
            ] = this.transformUsername(this.username);

            const resAPILogin = await Request.POST('user/query', {
              method: 'find',
              args: [
                {
                    $or: [
                        { username: transformedUsername },
                        { username: transformedUsernameFirstLower },
                        { username: transformedUsernameLowercase },
                        { username: transformedUsernameUppercase }
                    ]
                }
              ]
            }, this.configs.key);

            const getLogin  = resAPILogin.data;
            const loginData = getLogin.length > 0 ? getLogin[0] : null;

            if (loginData === null || loginData === '' || loginData === undefined) {
              this.errorStage   = true
              this.errorMessage = "ไม่พบข้อมูลบัญชีผู้ใช้นี้";
              this.activeBlock  = false;
              return;
            } else {
                const salt = CryptoJS.lib.WordArray.random(16);
                const hash = CryptoJS.SHA256(loginData.phone + salt).toString();
                const requestBody = {
                    data: {
                        password: hash,
                        salt: salt.toString(),
                    }
                };
                const { status } = await Request.PUT(`user/${loginData._id}`, requestBody, this.configs.key);
                if(status===200) {
                    this.activeBlock  = false;
                    dialog.prompt({
                        title: 'รีเซ็ตรหัสผ่านเรียบร้อยแล้ว',
                        message: 'คุณสามารถใช้เบอร์โทรที่ลงทะเบียนไว้ ในการเข้าสู่ระบบ !',
                        confirm: async () => {
                            this.newmember  = false,
                            this.memberMode = 'login'
                        },
                        cancel: () => {}
                    });
                }
            }
        } catch (error) {
          debug.log(error)
        }
    }
	},
    
};
</script>

<template>
  <div class="bg-gray-50">
    
    <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-lg">
            <img class="mx-auto h-14 w-auto" :src="this.configs.siteLogo" alt="Your Company" v-if="!this.showModal">
            <h2 class="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
                {{ newmember ? 'เข้าสูระบบสมาชิกใหม่' : 'เข้าสู่ระบบสมาชิกเก่า' }}
            </h2>            
            <p class="mt-2 text-center text-sm text-gray-600">
            หรือ
            <router-link :to="'/user/register'" class="font-medium text-indigo-600 hover:text-indigo-500">
            ลงทะเบียนสมาชิกใหม่
            </router-link>
            </p>
        </div>

        <!-- Show buttons only if form is not visible -->
        <div v-if="!showForm" class="mt-8 sm:mx-auto sm:w-full sm:max-w-md p-2">
            <div class="bg-white">
                <div class="grid grid-cols-1 gap-2 mt-4">
                    <button @click="newmember = false; toggleForm()" class="flex flex-col items-center justify-center px-4 py-4 rounded-md bg-white border-2 border-indigo-600 text-indigo-600 font-semibold w-full sm:w-auto">
                        <font-awesome-icon :icon="['fas', 'key']" class="h-10 w-10 mb-2"/>
                        <span class="text-2xl leading-6 text-center">สมาชิกเก่า</span>
                        <span class="font-normal text-black leading-6 text-center">ลงทะเบียนตั้งแต่ปี 65-66</span>
                    </button>
                    <button @click="newmember = true; toggleForm()" class="flex flex-col items-center justify-center px-4 py-4 rounded-md bg-white border-2 border-indigo-600 text-indigo-600 font-semibold w-full sm:w-auto">
                        <font-awesome-icon :icon="['fas', 'key']" class="h-10 w-10 mb-2"/>
                        <span class="text-2xl leading-6 text-center">สมาชิกใหม่</span>
                        <span class="font-normal text-black leading-6 text-center">ลงทะเบียนตั้งแต่ปี 67</span>
                    </button>
                </div>
            </div>
        </div>

        <template v-if="showForm">

            <template v-if="newmember">

                <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">

                        <template v-if="memberMode==='login'">

                            <form class="space-y-6" @submit.prevent="login">
                                <div>
                                    <div class="relative mt-2">
                                        <span class="input-label">อีเมล์ <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                                        <input
                                          v-model="username"
                                          type="text"
                                          placeholder="อีเมล์"
                                          class="w-full p-4 border border-gray-200 text-sm"
                                        />
                                      </div>
                                </div>

                                <div>
                                    <div class="relative mt-2">
                                        <span class="input-label">รหัสผ่าน <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                                        <input
                                          v-model="password"
                                          type="password"
                                          placeholder="รหัสผ่าน"
                                          class="w-full p-4 border border-gray-200 text-sm"
                                        />
                                      </div>
                                </div>
                    
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
                                        <label for="remember-me" class="ml-2 block text-sm text-gray-900">จำฉันไว้</label>
                                    </div>
                        
                                    <!-- <div class="text-sm">
                                        <router-link :to="'/user/forgot'" class="font-medium text-indigo-600 hover:text-indigo-500">
                                        ลืมรหัสผ่าน
                                        </router-link>
                                    </div> -->
                                    <div class="text-sm">
                                        <button @click="resetPassword('reset')" class="font-medium text-indigo-600 hover:text-indigo-500">
                                            ลืมรหัสผ่าน
                                        </button>
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
                                    <font-awesome-icon :icon="['fas', 'key']" class="mr-2"/> เข้าสู่ระบบ
                                </button>
                                <button @click="newmember = false; toggleForm()" class="flex w-full justify-center rounded-md bg-gray-300 text-md font-semibold text-gray-700 shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 mt-4 py-2">ย้อนกลับ</button>
                                </div>
                            </form>

                        </template>
        
                        <template v-if="memberMode==='reset'">

                            <form class="space-y-6" @submit.prevent="reset">
                                <div>
                                    <div class="relative mt-2">
                                        <span class="input-label">อีเมล์ที่ลงทะเบียน <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                                        <input
                                          v-model="username"
                                          type="text"
                                          placeholder="อีเมล์ที่ลงทะเบียน"
                                          class="w-full p-4 border border-gray-200 text-sm"
                                        />
                                      </div>
                                </div>
                                <div>
                                    <strong>*หมายเหตุ*</strong><br/>
                                    กรอกอีเมล์ที่ลงทะเบียนไว้ในระบบ หลังจากคลิ๊ก "ตั้งค่ารหัสผ่าน" เรียบร้อยแล้ว ระบบจะทำการสร้างรหัสผ่านเป็นเบอร์โทรที่ลงทะเบียนไว้ในระบบ หากจำเบอร์โทรไม่ได้ กรุณาแจ้งทีมงานที่ @doacer
                                </div>
                    
                                <div>
                                <div v-if="this.errorStage" class="col-span-2">
                                    <div class=" items-center px-3 py-1 rounded-md bg-red-100 text-sm text-black pb-5 mb-5">
                                        <div class="font-semibold pt-3 pb-3">เกิดข้อผิดพลาด</div>
                                        <div  class="w-full">{{this.errorMessage}}</div>
                                    </div>
                                </div>
                                <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-4 text-md font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                    <font-awesome-icon :icon="['fas', 'refresh']" class="mr-2"/> ตั้งค่ารหัสผ่าน
                                </button>
                                <button @click="resetPassword('login')" class="flex w-full justify-center rounded-md bg-gray-300 text-md font-semibold text-gray-700 shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 mt-4 py-2">ย้อนกลับ</button>
                                </div>
                            </form>
        
                        </template>
                
                        </div>
                    </div>
                
            </template>

            <template v-if="!newmember">

                <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 relative" :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'" :class="[(activeBlock?'isblock' : 'isunblock')]">
                    
                        <template v-if="memberMode==='login'">

                            <form class="space-y-6" @submit.prevent="login">

                                <div>
                                    <div class="relative mt-2">
                                        <span class="input-label">เลขที่ประจำตัวประชาชน <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                                        <input
                                          v-model="username"
                                          type="text"
                                          placeholder="เลขที่ประจำตัวประชาชน"
                                          class="w-full p-4 border border-gray-200 text-sm"
                                        />
                                      </div>
                                </div>

                                <div>
                                    <div class="relative mt-2">
                                        <span class="input-label">รหัสผ่าน <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                                        <input
                                          v-model="password"
                                          type="password"
                                          placeholder="รหัสผ่าน"
                                          class="w-full p-4 border border-gray-200 text-sm"
                                        />
                                      </div>
                                </div>
                    
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center">
                                        <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
                                        <label for="remember-me" class="ml-2 block text-sm text-gray-900">จำฉันไว้</label>
                                    </div>
                        
                                    <div class="text-sm">
                                        <button @click="resetPassword('reset')" class="font-medium text-indigo-600 hover:text-indigo-500">
                                            ลืมรหัสผ่าน
                                        </button>
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
                                    <font-awesome-icon :icon="['fas', 'key']" class="mr-2"/> เข้าสู่ระบบ
                                </button>
                                <button @click="newmember = false; toggleForm()" class="flex w-full justify-center rounded-md bg-gray-300 text-md font-semibold text-gray-700 shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 mt-4 py-2">ย้อนกลับ</button>
                                </div>
                            </form>

                        </template>
        
                        <template v-if="memberMode==='reset'">
                            
                            <form class="space-y-6" @submit.prevent="reset">
                                <div>
                                    <div class="relative mt-2">
                                        <span class="input-label">เลขที่ประจำตัวประชาชน <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                                        <input
                                          v-model="username"
                                          type="text"
                                          placeholder="เลขที่ประจำตัวประชาชน"
                                          class="w-full p-4 border border-gray-200 text-sm"
                                        />
                                      </div>
                                </div>
                                <div>
                                    <strong>*หมายเหตุ*</strong><br/>
                                    กรอกเลขที่บัตรประชาชนที่ลงทะเบียนไว้ในระบบ หลังจากคลิ๊ก "ตั้งค่ารหัสผ่าน" เรียบร้อยแล้ว ระบบจะทำการสร้างรหัสผ่านเป็นเบอร์โทรที่ลงทะเบียนไว้ในระบบ หากจำเบอร์โทรไม่ได้ กรุณาแจ้งทีมงานที่ @doacer
                                </div>
                    
                                <div>
                                <div v-if="this.errorStage" class="col-span-2">
                                    <div class=" items-center px-3 py-1 rounded-md bg-red-100 text-sm text-black pb-5 mb-5">
                                        <div class="font-semibold pt-3 pb-3">เกิดข้อผิดพลาด</div>
                                        <div  class="w-full">{{this.errorMessage}}</div>
                                    </div>
                                </div>
                                <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-4 text-md font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                    <font-awesome-icon :icon="['fas', 'refresh']" class="mr-2"/> ตั้งค่ารหัสผ่าน
                                </button>
                                <button @click="resetPassword('login')" class="flex w-full justify-center rounded-md bg-gray-300 text-md font-semibold text-gray-700 shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 mt-4 py-2">ย้อนกลับ</button>
                                </div>
                            </form>

                        </template>

                    </div>
                </div>
            </template>
        </template>

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