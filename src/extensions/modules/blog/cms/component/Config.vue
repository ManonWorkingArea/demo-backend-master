<template>
    <div class="container mx-auto p-8">
      <h2 class="text-lg font-semibold mb-4">ตั้งค่าการแสดงผล</h2>
  
      <div>
        <!-- Tabs -->
        <div class="flex border-b border-gray-200">
          <button
            class="py-2 px-4"
            :class="{'text-blue-500 border-blue-500': activeTab === 'home', 'text-gray-500 hover:text-blue-500': activeTab !== 'home'}"
            @click="activeTab = 'home'"
          >
            Layout Control
          </button>
          <button
            class="py-2 px-4"
            :class="{'text-blue-500 border-blue-500': activeTab === 'mapPage', 'text-gray-500 hover:text-blue-500': activeTab !== 'mapPage'}"
            @click="activeTab = 'mapPage'"
          >
            User Page
          </button>
          <button
            class="py-2 px-4"
            :class="{'text-blue-500 border-blue-500': activeTab === 'theme', 'text-gray-500 hover:text-blue-500': activeTab !== 'theme'}"
            @click="activeTab = 'theme'"
          >
            Theme
          </button>
        </div>
  
        <!-- Tab Content -->
        <div class="p-2 border border-gray-200 mt-4">
          <!-- Tab 1 Content: Layout Control -->
          <div v-if="activeTab === 'home'">
            <div class="p-2 border border-b-0 border-gray-200">
              <div class="mb-4">
                <label class="font-semibold">เมนู:</label>
                <select v-model="selectedNavigator" class="block w-full mt-1">
                  <option value="" disabled selected>เลือกเมนูหลัก</option>
                  <option v-for="item in menuItems" :key="item._id" :value="item._id">{{ item.title }}</option>
                </select>
              </div>
            </div>
  
            <div class="p-2 border border-b-0 border-gray-200">
              <div class="mb-4">
                <label class="font-semibold">เลือก Page สำหรับหน้าหลัก:</label>
                <select v-model="selectedHome" class="block w-full mt-1">
                  <option value="" disabled selected>เลือกหน้าสำหรับหน้าหลัก</option>
                  <option v-for="item in pageItems" :key="item._id" :value="item._id">{{ item.title }}</option>
                </select>
              </div>
            </div>
          </div>
  
          <!-- Tab 2 Content: User Page -->
          <div v-if="activeTab === 'mapPage'">
            <div class="p-2 border border-b-0 border-gray-200">
              <div class="mb-4">
                <label class="font-semibold">User Login:</label>
                <select v-model="selectedLoginPage" class="block w-full mt-1">
                  <option value="" disabled selected>เลือกหน้าสำหรับ User Login</option>
                  <option v-for="item in pageItems" :key="item._id" :value="item._id">{{ item.title }}</option>
                </select>
              </div>
            </div>
  
            <div class="p-2 border border-b-0 border-gray-200">
              <div class="mb-4">
                <label class="font-semibold">User Reset Password:</label>
                <select v-model="selectedResetPasswordPage" class="block w-full mt-1">
                  <option value="" disabled selected>เลือกหน้าสำหรับ User Reset Password</option>
                  <option v-for="item in pageItems" :key="item._id" :value="item._id">{{ item.title }}</option>
                </select>
              </div>
            </div>
  
            <div class="p-2 border border-b-0 border-gray-200">
              <div class="mb-4">
                <label class="font-semibold">User Forgot Password:</label>
                <select v-model="selectedForgotPasswordPage" class="block w-full mt-1">
                  <option value="" disabled selected>เลือกหน้าสำหรับ User Forgot Password</option>
                  <option v-for="item in pageItems" :key="item._id" :value="item._id">{{ item.title }}</option>
                </select>
              </div>
            </div>
  
            <div class="p-2 border border-b-0 border-gray-200">
              <div class="mb-4">
                <label class="font-semibold">User Dashboard:</label>
                <select v-model="selectedDashboardPage" class="block w-full mt-1">
                  <option value="" disabled selected>เลือกหน้าสำหรับ User Dashboard</option>
                  <option v-for="item in pageItems" :key="item._id" :value="item._id">{{ item.title }}</option>
                </select>
              </div>
            </div>
          </div>
  
          <!-- Tab 3 Content: Theme -->
          <div v-if="activeTab === 'theme'">
            <div class="p-2 border border-b-0 border-gray-200">
              <div class="mb-4">
                <label class="font-semibold">ส่วนหัว:</label>
                <select v-model="selectedHeader" class="block w-full mt-1">
                  <option value="" disabled selected>เลือกเลย์เอาต์ส่วนหัว</option>
                  <option v-for="item in layoutItems" :key="item._id" :value="item._id">{{ item.title }}</option>
                </select>
              </div>
            </div>
  
            <div class="p-2 border border-b-0 border-gray-200">
              <div class="mb-4">
                <label class="font-semibold">Sub-Head:</label>
                <select v-model="selectedSubheader" class="block w-full mt-1">
                  <option value="" disabled selected>เลือกSub-Head</option>
                  <option v-for="item in layoutItems" :key="item._id" :value="item._id">{{ item.title }}</option>
                </select>
              </div>
            </div>
  
            <div class="p-2 border border-gray-200">
              <div class="mb-4">
                <label class="font-semibold">ส่วนท้าย:</label>
                <select v-model="selectedFooter" class="block w-full mt-1">
                  <option value="" disabled selected>เลือกเลย์เอาต์ส่วนท้าย</option>
                  <option v-for="item in layoutItems" :key="item._id" :value="item._id">{{ item.title }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
  
        <div class="flex justify-end mt-4">
          <button class="px-4 py-2 bg-blue-500 text-white rounded-md" @click="savePopup">Save</button>
          <button class="px-4 py-2 ml-4 bg-gray-300 text-gray-700 rounded-md" @click="cancelPopup">Cancel</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      pageItems: {
        type: Array,
        required: true
      },
      layoutItems: {
        type: Array,
        required: true
      },
      menuItems: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        activeTab: 'home',
        selectedHome: '',
        selectedHeader: '',
        selectedSubheader: '',
        selectedFooter: '',
        selectedNavigator: '',
        selectedLoginPage: '',
        selectedResetPasswordPage: '',
        selectedForgotPasswordPage: '',
        selectedDashboardPage: ''
      };
    },
    methods: {
      savePopup() {
        const layouts = {
          homepage: this.selectedHome,
          header: this.selectedHeader,
          subheader: this.selectedSubheader,
          footer: this.selectedFooter,
          navigator: this.selectedNavigator,
          dashboard: this.selectedDashboardPage,
          login: this.selectedLoginPage,
          resetpassword: this.selectedResetPasswordPage,
          changepassword: this.selectedForgotPasswordPage
        };
  
        // Emit an event to the parent component to save the layout configurations
        this.$emit('save-layouts', layouts);
      },
      cancelPopup() {
        // Logic for cancel, perhaps to reset fields or navigate away
        this.$emit('cancel');
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add any necessary styles */
  </style>
  