<script>
// Component
import { translate } from '@/plugins/language.js';
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'
import { loadAndStoreConfigData } from '@/plugins/config';
import storageManager from '@/plugins/storage';
import CryptoJS from 'crypto-js';

import debug from '@/plugins/Logger.js';
import HRService from '@/services/HRService.js';


export default {
  name: 'Login',
  created() {
    debug.option(this.$route);
  },
  data() {
    return {
      hostkey:this.$Key,
      logo:require('@/assets/images/color-logo.png'),
      email: '',
      password: '',
      processing_text: translate('database-connect'),
      showPassword: false,
      passwordFieldType: "password",
      activeBlock: false,
      isLoaded: false,
      siteName:'',
      loginLogo:'',
      loginBg:'',
      configs: storageManager.get('configs'),
      errors: [],
      isLoading: false,
      showForm: false,
    }
  },
  components: {},
  methods: {
    translate,
    
    // Helper function สำหรับ verify password
    verifyPassword(password, hashedPassword, salt) {
      const inputHash = CryptoJS.SHA256(password + salt).toString();
      return inputHash === hashedPassword;
    },
    
    // Helper function สำหรับสร้าง session
    createSession(user, siteType, additional = {}) {
      const navMapping = {
        'origin': 'superadmin-nav',
        'collection': 'admin-nav', 
        'asset': 'admin-nav'
      };
      
      return {
        active: true,
        token: user._id,
        refresh: "",
        login: true,
        userID: user._id,
        user: user,
        loader: false,
        role: user.role,
        nav: navMapping[siteType] || 'admin-nav',
        layout: "backend-layout",
        current: this.configs,
        ...additional
      };
    },
    
    // Helper function สำหรับ redirect หลัง login สำเร็จ
    handleSuccessLogin() {
      this.processing_text = "เข้าสู่ระบบสำเร็จ.....";
      setTimeout(() => {
        window.location.href = "/"
      }, 1000);
    },
    
    // Unified authentication method
    async authenticate(type) {
      // กำหนด query conditions และ error messages ตามแต่ละ type
      const authConfig = {
        origin: {
          query: { $and: [{ role: 'root' }, { username: this.email }] },
          errorMessage: "ไม่พบข้อมูลผู้ใช้งาน/รหัสผ่าน",
          invalidMessage: "ข้อมูลผู้ใช้งาน/รหัสผ่านไม่ถูกต้อง"
        },
        collection: {
          query: { $and: [{ role: 'superadmin' }, { username: this.email }] },
          errorMessage: "Invalid username or password",
          invalidMessage: "Invalid username or password"
        },
        asset: {
          query: { $and: [{ username: this.email }] },
          errorMessage: "Invalid username or password",
          invalidMessage: "Invalid username or password"
        }
      };

      const config = authConfig[type];
      if (!config) {
        throw new Error(`Unsupported authentication type: ${type}`);
      }

      // ดึงข้อมูล user
      const resAPILogin = await fetch("https://gateway.cloudrestfulapi.com/api/user/query", {
        method: 'POST',
        headers: {'Content-Type': 'application/json','client-token-key': this.hostkey},
        body: JSON.stringify({
          method: 'find',
          args: [config.query]
        })
      });
      const loginResponse = await resAPILogin.json();
      const loginData = loginResponse[0] || null;

      if (!loginData) {
        throw new Error(config.errorMessage);
      }

      if (!this.verifyPassword(this.password, loginData.password, loginData.salt)) {
        throw new Error(config.invalidMessage);
      }

      // จัดการ specific logic สำหรับแต่ละ type
      let additionalData = {};

      if (type === 'asset') {
        additionalData = await this.handleAssetAuthentication(loginData);
      }

      return this.createSession(loginData, type, additionalData);
    },

    // แยก asset-specific logic ออกมา
    async handleAssetAuthentication(loginData) {
      let unitList = [];
      let currentAccess = this.configs;

      if (loginData.role === "superadmin") {
        const canAccess = loginData.asset && loginData.asset.includes(this.configs.siteID);
        if (!canAccess) {
          throw new Error("ไม่มีสิทธิ์เข้าถึงระบบนี้");
        }
      } 
      else if (loginData.role === "admin" || loginData.role === "manager") {
        // เช็คว่า siteID อยู่ใน unit หรือ asset หรือไม่
        const hasUnitAccess = loginData.unit && loginData.unit.includes(this.configs.siteID);
        const hasAssetAccess = loginData.asset && loginData.asset.includes(this.configs.siteID);
        const hasParentAccess = loginData.parent === this.configs.siteID;
        
        const canAccess = hasUnitAccess || hasAssetAccess || hasParentAccess;
        if (!canAccess) {

          console.log("unit" , loginData.unit);
          console.log("asset" , loginData.asset);
          console.log("siteID" , this.configs.siteID);
          
          throw new Error("ไม่มีสิทธิ์เข้าถึงระบบนี้" , loginData.unit, this.configs.siteID);
        }
        
        // ดึงข้อมูล unit list
        if (loginData.unit && loginData.unit.length > 0) {
          try {
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/hostname/query", {
              method: 'POST',
              headers: {'Content-Type': 'application/json','client-token-key': this.hostkey},
              body: JSON.stringify({
                method: 'find',
                args: [{ "_id": { "$in": loginData.unit } }]
              })
            });
            unitList = await resAPI.json();
            currentAccess = "none";
          } catch (error) {
            debug.log("Error fetching unit list", error);
          }
        }
      }

      return {
        current: currentAccess,
        list: unitList
      };
    },

    async login() {
      try {
        this.isLoading = true;
        this.activeBlock = true;
        this.errors = [];

        debug.log(`Authenticating with site type: ${this.configs.siteType}`);

        // ใช้ unified authentication method
        const session = await this.authenticate(this.configs.siteType);

        // บันทึก session
        storageManager.update('session', session);
        debug.log("Login successful", session);
        
        // เช็คว่ามี hr plugin หรือไม่ และดึงข้อมูล ERP user (รอให้เสร็จก่อน redirect)
        await this.checkAndSetERPMode(session);
        
        this.handleSuccessLogin();

      } catch (error) {
        debug.log("Login error:", error);
        this.errors.push(error.message);
      } finally {
        this.activeBlock = false;
        this.isLoading = false;
      }
    },
    
    // Transform ERP user data: รวม permissions ของ module เดียวกัน
    transformERPUserData(erpUser) {
      if (!erpUser || !erpUser.job_assignments) {
        return erpUser;
      }
      
      const transformedUser = { ...erpUser };
      
      // Transform แต่ละ job_assignment
      transformedUser.job_assignments = erpUser.job_assignments.map(job => {
        if (!job.permissions || !Array.isArray(job.permissions)) {
          return job;
        }
        
        // Group permissions by module
        const permissionsByModule = {};
        
        job.permissions.forEach(perm => {
          const module = perm.module;
          
          if (!permissionsByModule[module]) {
            permissionsByModule[module] = {
              module: module,
              menus: []
            };
          }
          
          // เพิ่ม menu เข้าไปใน module
          permissionsByModule[module].menus.push({
            menu_key: perm.menu_key,
            menu_title: perm.menu_title || perm.menu_key,
            read: perm.read || false,
            write: perm.write || false,
            visible: perm.visible !== false // default true
          });
        });
        
        // แปลง object เป็น array
        const groupedPermissions = Object.values(permissionsByModule);
        
        return {
          ...job,
          permissions: groupedPermissions
        };
      });
      
      return transformedUser;
    },
    
    // เช็คและตั้งค่า ERP mode ตาม plugins
    async checkAndSetERPMode(session) {
      try {
        // ลบ erp เก่าก่อน (ถ้ามี)
        storageManager.delete('erp');
        
        const currentPlugins = session?.current?.plugins || [];
        const hasHRPlugin = currentPlugins.includes('hr');
        
        if (!hasHRPlugin) {
          // ถ้าไม่มี HR plugin ให้เก็บ false
          storageManager.set('erp', false);
          debug.log('ERP Mode: Disabled (no HR plugin)');
          return;
        }
        
        // ถ้ามี HR plugin ให้ดึงข้อมูล ERP user
        debug.log('ERP Mode: Enabled, fetching ERP user data...');
        
        const userId = session?.user?._id || session?.userID;
        if (!userId) {
          debug.log('Error: No user ID found in session');
          storageManager.set('erp', false);
          return;
        }
        
        // ดึงข้อมูล ERP user ด้วย HRService โดยค้นจาก user_id ของระบบ
        const hrService = new HRService();
        hrService.initialize(this); // Initialize ด้วย Vue instance
        const erpUserResponse = await hrService.getERPUserBySystemUserId(userId);
        
        if (erpUserResponse.success && erpUserResponse.data) {
          // Transform permissions: รวม module เดียวกันเป็นกลุ่ม
          const transformedData = this.transformERPUserData(erpUserResponse.data);
          
          // เก็บข้อมูล ERP user ที่ transform แล้ว
          storageManager.set('erp', transformedData);
          debug.log('✅ ERP user data loaded successfully:', {
            systemUserId: userId,
            erpUserId: transformedData._id,
            username: transformedData.username,
            jobAssignments: transformedData.job_assignments?.length || 0
          });
        } else {
          // ถ้าดึงข้อมูลไม่สำเร็จ ให้เก็บ true (มี HR แต่ยังไม่มีข้อมูล)
          storageManager.set('erp', true);
          debug.log('⚠️ ERP Mode enabled but user data not found:', erpUserResponse.error);
        }
        
      } catch (error) {
        debug.log("Error setting ERP mode:", error);
        // Default to false if error occurs
        storageManager.set('erp', false);
      }
    },
    switchVisibility() {
      try {
        this.passwordFieldType = this.passwordFieldType === "password" ? "text" : "password";
      } catch (error) {
        console.error('Error in switchVisibility:', error);
      }
    },
    clearErrors() {
      this.errors = [];
    }
  },
  setup() {
      const route     = useRoute();
      const routeName = route.meta.title;
      useTitle(routeName);
  },
  async mounted() {
    const route = useRoute();
    const routeName = route.meta.title;
    useTitle(routeName);
    try {
      const data = await loadAndStoreConfigData(true);
      this.siteName  = data.siteName;
      this.loginLogo = data.loginLogo;
      this.loginBg   = data.loginBg;
      this.isLoaded  = true;
      
      // Show form with animation after loading
      setTimeout(() => {
        this.showForm = true;
      }, 300);
    } catch (error) {
      console.error(error);
    }
  },
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex">
    <!-- Loading Overlay -->
    <div v-if="activeBlock" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl transform transition-all duration-300 scale-100">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div class="absolute inset-0 w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto opacity-30 animate-pulse"></div>
        </div>
        <p class="text-gray-700 font-medium animate-pulse">{{ processing_text }}</p>
      </div>
    </div>

    <!-- Left Side - Login Form -->
    <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0 bg-gradient-to-r from-indigo-100 to-cyan-100"></div>
        <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="m 40 0 l 0 40 m -40 0 l 40 0" fill="none" stroke="currentColor" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div class="mx-auto w-full max-w-md lg:w-96 relative z-10">
        <!-- Logo and Title Section -->
        <div class="text-center" :class="showForm ? 'animate-fade-in-up' : 'opacity-0'">
          <div class="relative group">
            <img 
              v-if="isLoaded" 
              class="mx-auto h-28 w-auto transform transition-all duration-500 hover:scale-105 drop-shadow-lg" 
              :src="loginLogo" 
              :alt="siteName"
            >
            <div class="absolute inset-0 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          </div>
          <h1 class="mt-6 text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            {{ siteName }}
          </h1>
          <p class="mt-2 text-gray-600 font-medium">ยินดีต้อนรับเข้าสู่ระบบ</p>
        </div>

        <!-- Login Form -->
        <div class="mt-10" :class="showForm ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'">
          <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-300">
            <form class="space-y-6" @submit.prevent="login">
              <!-- Email Input -->
              <div class="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                  {{ translate('login-user') }}
                </label>
                <div class="relative group">
                  <input 
                    v-model="email" 
                    @focus="clearErrors"
                    id="email" 
                    name="email" 
                    type="text" 
                    autocomplete="email" 
                    :placeholder="translate('login-user')" 
                    required 
                    class="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-50/50 placeholder-gray-400 transition-all duration-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-300"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-40 group-focus-within:opacity-60 transition-opacity">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Password Input -->
              <div class="transform transition-all duration-300 hover:translate-y-[-2px]">
                <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                  {{ translate('login-password') }}
                </label>
                <div class="relative group">
                  <input 
                    v-model="password" 
                    @focus="clearErrors"
                    id="password" 
                    name="password" 
                    :placeholder="translate('login-password')" 
                    :type="passwordFieldType" 
                    autocomplete="off" 
                    required
                    class="block w-full pl-12 pr-16 py-4 border-2 border-gray-200 rounded-xl bg-gray-50/50 placeholder-gray-400 transition-all duration-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/20 focus:outline-none hover:border-gray-300"
                  >
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-40 group-focus-within:opacity-60 transition-opacity">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <button 
                    type="button"
                    @click="switchVisibility" 
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200 focus:outline-none"
                    :title="passwordFieldType === 'password' ? translate('login-show') : translate('login-hide')"
                  >
                    <svg v-if="passwordFieldType === 'password'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Remember & Forgot -->
              <div class="flex items-center justify-between">
                <div class="flex items-center group">
                  <input 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox" 
                    class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors duration-200"
                  >
                  <label for="remember-me" class="ml-3 block text-sm text-gray-700 group-hover:text-gray-900 transition-colors cursor-pointer">
                    {{ translate('login-remember') }}
                  </label>
                </div>

                <div class="text-sm">
                  <a 
                    href="forgot" 
                    class="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200 relative group"
                  >
                    {{ translate('login-forgot') }}?
                    <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </div>
              </div>

              <!-- Error Messages -->
              <transition name="error" mode="out-in">
                <div v-if="errors.length" class="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <ul class="text-sm text-red-700">
                        <li v-for="error in errors" :key="error" class="mb-1">
                          {{ error }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </transition>

              <!-- Submit Button -->
              <div>
                <button 
                  type="submit" 
                  :disabled="isLoading"
                  class="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                >
                  <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                    <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </span>
                  <span :class="{ 'ml-8': isLoading }">
                    {{ isLoading ? 'กำลังเข้าสู่ระบบ...' : translate('login-btn') }}
                  </span>
                  <span v-if="!isLoading" class="absolute right-4 inset-y-0 flex items-center">
                    <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-8 text-center" :class="showForm ? 'animate-fade-in-up animation-delay-400' : 'opacity-0'">
          <p class="text-sm text-gray-500">
            © 2024 {{ siteName }}. ระบบปลอดภัยด้วยเทคโนโลยีการเข้ารหัสขั้นสูง
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side - Background Image -->
    <div class="hidden lg:block relative w-0 flex-1">
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-cyan-900/20"></div>
      <img 
        v-if="isLoaded"
        class="absolute inset-0 h-full w-full object-cover" 
        :src="loginBg" 
        alt=""
      >
      <!-- Overlay Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-transparent to-cyan-600/30"></div>
      <div class="absolute inset-0 bg-black/20"></div>
      
      <!-- Floating Elements -->
      <div class="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
      <div class="absolute top-3/4 right-1/4 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl animate-float-delayed"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(-180deg); }
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 8s ease-in-out infinite;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

.error-enter-active, .error-leave-active {
  transition: all 0.3s ease;
}

.error-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.error-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Custom hover effects */
.hover\:shadow-3xl:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur(12px)) {
  .backdrop-blur-sm {
    background-color: rgba(255, 255, 255, 0.9);
  }
}
</style>