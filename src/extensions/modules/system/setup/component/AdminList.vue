<template>
  <!-- Header Section -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas','users-cog']" class="text-white text-sm" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">เจ้าหน้าที่</h2>
            <p class="text-xs text-gray-500">{{ users.filter(u => u.role === 'manager').length }} เจ้าหน้าที่</p>
          </div>
        </div>
        <button
          @click="openUserDialog(null)"
          type="button"
          class="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          เพิ่มเจ้าหน้าที่
        </button>
      </div>
    </div>

    <!-- Navigation Section -->
    <div class="bg-gray-50 border-b border-gray-200 px-4 py-2">
      <button
        @click="$router.push('/setup/dashboard')"
        type="button"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <font-awesome-icon :icon="['fas', 'chevron-left']" class="mr-1.5 text-xs" />
        ย้อนกลับ
      </button>
    </div>

    <!-- Admin List -->
    <div class="p-4">
      <div v-if="users.filter(u => u.role === 'manager').length === 0" class="text-center py-8">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <font-awesome-icon :icon="['fas','users-cog']" class="text-gray-400 text-lg" />
        </div>
        <h3 class="text-base font-medium text-gray-900 mb-2">ยังไม่มีเจ้าหน้าที่</h3>
        <p class="text-sm text-gray-500 mb-4">เริ่มต้นเพิ่มเจ้าหน้าที่สำหรับจัดการระบบ</p>
        <button
          @click="openUserDialog(null)"
          type="button"
          class="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          เพิ่มเจ้าหน้าที่คนแรก
        </button>
      </div>

      <div v-else class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <template v-for="(user, index) in users" :key="index">
            <div v-if="user.role === 'manager'" :key="user._id" class="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group overflow-hidden">
              <!-- Header with gradient background -->
              <div class="h-20 bg-gradient-to-br from-blue-500 to-blue-600 relative">
                <div class="absolute inset-0 bg-black bg-opacity-10"></div>
              </div>

              <div class="p-4 relative">
                <!-- Avatar -->
                <div class="absolute -top-8 left-4">
                  <div class="w-16 h-16 bg-white rounded-full border-2 border-white shadow-lg overflow-hidden">
                    <img 
                      :src="user.logo || 'https://dummyimage.com/400x400/dbdbdb/6e6e6e.jpg&text=++USER++'" 
                      alt="Avatar" 
                      class="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <!-- User Info -->
                <div class="pt-10">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <h3 class="text-base font-semibold text-gray-900 mb-1">
                        {{ user.firstname }} {{ user.lastname }}
                      </h3>
                      <p class="text-xs text-gray-500 mb-1">{{ user.email }}</p>
                      <div v-if="user && user.unit && user.unit.length > 0" class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
                        <font-awesome-icon :icon="['fas','graduation-cap']" class="mr-1" />
                        {{ user.unit.length }} หลักสูตร
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center justify-end pt-3 border-t border-gray-100 space-x-1">
                    <button 
                      @click="openUserDialog(user)" 
                      class="inline-flex items-center px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                    >
                      <font-awesome-icon :icon="['fas','edit']" class="mr-1 text-xs" />
                      แก้ไข
                    </button>
                    <button 
                      @click="deleteUserConfirmation(user)" 
                      class="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-200"
                    >
                      <font-awesome-icon :icon="['fas','trash']" class="mr-1 text-xs" />
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

  <!-- Modern User Dialog -->
  <Transition
    enter-active-class="modal-enter-active"
    leave-active-class="modal-leave-active"
    enter-from-class="modal-enter-from"
    leave-to-class="modal-leave-to"
  >
    <div v-if="showUserDialog" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-25 transition-opacity" @click="closeUserDialog"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', selectedUser._id ? 'edit' : 'plus']" class="text-blue-600 text-sm" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ selectedUser._id ? 'แก้ไขข้อมูลเจ้าหน้าที่' : 'เพิ่มเจ้าหน้าที่ใหม่' }}
                  </h3>
                  <p class="text-sm text-gray-500">จัดการข้อมูลส่วนตัวและบัญชีผู้ใช้</p>
                </div>
              </div>
              <button @click="closeUserDialog" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <font-awesome-icon :icon="['fas','times']" class="text-lg" />
              </button>
            </div>
          </div>

          <!-- Personal Information Section -->
          <div class="px-6 py-4 border-b border-gray-100">
            <h4 class="text-base font-semibold text-gray-900 mb-4">ข้อมูลส่วนตัว</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                <input
                  v-model="selectedUser.firstname"
                  type="text"
                  placeholder="กรอกชื่อ"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                <input
                  v-model="selectedUser.lastname"
                  type="text"
                  placeholder="กรอกนามสกุล"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                <div class="relative">
                  <input
                    v-model="selectedUser.email"
                    @input="checkField('email', selectedUser.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'กรุณากรอกอีเมล์ให้ถูกต้อง', 'emailExists', 'emailValid')"
                    type="email"
                    placeholder="กรอกอีเมล"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <span class="absolute top-2.5 right-3" v-if="emailValid">
                    <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-500" />
                  </span>
                </div>
                <p v-if="emailExists" class="text-red-500 text-sm mt-1">{{ emailError }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">เบอร์โทร</label>
                <div class="relative">
                  <input
                    v-model="selectedUser.phone"
                    @input="checkField('phone', selectedUser.phone, /^[\d]{10}$/, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง', 'phoneExists', 'phoneValid')"
                    type="tel"
                    placeholder="กรอกเบอร์โทรศัพท์"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <span class="absolute top-2.5 right-3" v-if="phoneValid">
                    <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-500" />
                  </span>
                </div>
                <p v-if="phoneExists" class="text-red-500 text-sm mt-1">{{ phoneError }}</p>
              </div>
            </div>
          </div>

          <!-- Account Information Section -->
          <div class="px-6 py-4">
            <h4 class="text-base font-semibold text-gray-900 mb-4">บัญชีผู้ใช้งาน</h4>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้ใช้งาน</label>
                <div class="relative">
                  <input
                    v-model="selectedUser.username"
                    :disabled="selectedUser._id"
                    @input="checkField('username', selectedUser.username, /^[a-zA-Z0-9_-]{6,}$/, 'ชื่อผู้ใช้งานต้องมีอย่างน้อย 6 ตัวอักษรและเป็นอักษรหรือตัวเลขเท่านั้น', 'usernameExists', 'usernameValid')"
                    type="text"
                    placeholder="กรอกชื่อผู้ใช้งาน"
                    :class="{ 'bg-gray-100 text-gray-500': selectedUser._id }"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <span class="absolute top-2.5 right-3" v-if="usernameValid">
                    <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-500" />
                  </span>
                </div>
                <p v-if="usernameExists" class="text-red-500 text-sm mt-1">{{ usernameError }}</p>
              </div>

              <div v-if="!selectedUser._id" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                    <button 
                      @click="showPassword = !showPassword" 
                      class="text-xs text-blue-600 hover:text-blue-700"
                    >
                      {{ showPassword ? 'ซ่อน' : 'แสดง' }}
                    </button>
                  </div>
                  <div class="relative">
                    <input
                      v-model="selectedUser.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="กรอกรหัสผ่าน"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                    <span class="absolute top-2.5 right-3" v-if="passwordsMatch && selectedUser.password">
                      <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-500" />
                    </span>
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
                    <button 
                      @click="showPassword = !showPassword" 
                      class="text-xs text-blue-600 hover:text-blue-700"
                    >
                      {{ showPassword ? 'ซ่อน' : 'แสดง' }}
                    </button>
                  </div>
                  <div class="relative">
                    <input
                      v-model="selectedUser.cpassword"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                    <span class="absolute top-2.5 right-3" v-if="passwordsMatch && selectedUser.cpassword">
                      <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-500" />
                    </span>
                  </div>
                </div>
                <div class="col-span-full">
                  <p v-if="!passwordsMatch && selectedUser.password && selectedUser.cpassword" class="text-red-500 text-sm">รหัสผ่านไม่ตรงกัน</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div class="flex justify-end space-x-3">
              <button 
                @click="closeUserDialog" 
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                ยกเลิก
              </button>
              <button 
                @click="selectedUser._id ? updateUser() : addUser()"
                :disabled="!(usernameValid && passwordsMatch)"
                :class="{
                  'bg-blue-600 hover:bg-blue-700 text-white': usernameValid && passwordsMatch,
                  'bg-gray-300 text-gray-500 cursor-not-allowed': !(usernameValid && passwordsMatch)
                }"
                class="px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <font-awesome-icon :icon="['fas', 'save']" class="mr-2" />
                {{ selectedUser._id ? 'บันทึกการแก้ไข' : 'เพิ่มเจ้าหน้าที่' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modern Confirmation Dialog -->
  <Transition
    enter-active-class="modal-enter-active"
    leave-active-class="modal-leave-active"
    enter-from-class="modal-enter-from"
    leave-to-class="modal-leave-to"
  >
    <div v-if="showConfirmationPopup" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-25 transition-opacity" @click="cancelDeleteUser"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas','exclamation-triangle']" class="text-red-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">ยืนยันการลบ</h3>
                <p class="text-sm text-gray-500">เจ้าหน้าที่</p>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <p class="text-gray-600">คุณแน่ใจหรือไม่ที่จะลบเจ้าหน้าที่นี้? การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
          </div>

          <div class="flex justify-end space-x-3">
            <button 
              @click="cancelDeleteUser" 
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            >
              ยกเลิก
            </button>
            <button 
              @click="confirmDeleteUser" 
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import storageManager from '@/plugins/storage';
import CryptoJS from 'crypto-js';

export default {
  name: 'UserList',
  data() {
    return {
      hostkey:this.$Key,
      session: storageManager.get('session'),
      configs: storageManager.get('configs'),
      selectedUser: {},
      showUserDialog: false,
      users: [],
      passwordsMatch: false,
      showPassword: false,
      showConfirmationPopup: false,
      userToDelete: null,

      usernameExists: false,
      usernameValid: false,
      usernameError:'',

      emailExists: false,
      emailValid: false,
      emailError:'',

      phoneExists: false,
      phoneValid: false,
      phoneError:'',
    };
  },
  async mounted() {
    try {
      await this.getUserData();
    } catch (error) {
      console.error(error);
    }
  },
  watch: {
    'selectedUser.password'(newPassword) {
      if (!this.selectedUser._id) {
        this.checkPasswordMatch(newPassword, this.selectedUser.cpassword);
      }
    },
    'selectedUser.cpassword'(confirmPassword) {
      if (!this.selectedUser._id) {
        this.checkPasswordMatch(this.selectedUser.password, confirmPassword);
      }
    },
  },
  methods: {
    showPasswordToggle() {
      this.showPassword = !this.showPassword;
    },
    checkPasswordMatch(password, confirmPassword) {
      if (password === confirmPassword) {
        this.passwordsMatch = true;
      } else {
        this.passwordsMatch = false;
      }
    },
    async getUserData() {
      try {
        const response = await fetch("https://gateway.cloudrestfulapi.com/api/user/query", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','client-token-key':this.hostkey },
          body: JSON.stringify({
            method: 'find',
            args: [{ $and: [{ parent: this.configs.siteID, role: 'manager' }] }],
            paging: { page: 1, limit: 200 },
          })
        });

        if (response.ok) {
          this.users = (await response.json()).data;
        } else {
          console.error("API error:", response.status, response.statusText);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async checkField(fieldName, value, validationPattern, errorMessage, existsProperty, validProperty) {
      console.log(`check${fieldName}`);
      // Validate the field value
      this.validateField(fieldName, value, validationPattern, errorMessage, existsProperty, validProperty);
      // Only proceed with the API request if the field value is valid
      if (!this[`${fieldName}Error`]) {
        await this.checkFieldExists(fieldName, value, existsProperty, validProperty);
      }
    },
    validateField(fieldName, value, validationPattern, errorMessage, existsProperty, validProperty) {
      const isValidField = validationPattern.test(value);
      if (!isValidField) {
        this[`${fieldName}Error`] = errorMessage;
        this[existsProperty] = true;
      } else {
        this[`${fieldName}Error`] = '';
        this[existsProperty] = false;
        this[validProperty] = true;
      }
    },
    async checkFieldExists(fieldName, value, existsProperty, validProperty) {
      try {
        const response = await fetch("https://gateway.cloudrestfulapi.com/api/user/query", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','client-token-key':this.hostkey },
          body: JSON.stringify({
            method: 'find',
            args: [{ $and: [{ [fieldName]: value }] }],
            paging: { page: 1, limit: 200 },
          })
        });

        if (response.ok) {
          const userData = (await response.json()).data;
          if (userData.length > 0) {
            this[existsProperty] = true;
            this[`${fieldName}Error`] = `มี ${fieldName} นี้ในระบบแล้ว`;
            this[validProperty] = false;
          } else {
            this[existsProperty] = false;
            this[`${fieldName}Error`] = '';
            this[validProperty] = true;
          }
        } else {
          console.error("API error:", response.status, response.statusText);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async addUser() {
      try {
        const salt = CryptoJS.lib.WordArray.random(16);
        const hash = CryptoJS.SHA256(this.selectedUser.password + salt).toString();
        const unit = [this.session.current._id];
        const response = await fetch("https://gateway.cloudrestfulapi.com/api/user/", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json','client-token-key':this.hostkey },
          body: JSON.stringify({
            data: {
              ...this.selectedUser,
              parent: this.configs.siteID,
              role: "manager",
              password: hash,
              salt: salt.toString(),
              unit: unit,
            },
            options: {},
          })
        });
        if (response.ok) {
          await this.getUserData();
          this.closeUserDialog();
        } else {
          console.error("API error:", response.status, response.statusText);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async updateUser() {
      try {
        const response = await fetch(`https://gateway.cloudrestfulapi.com/api/user/${this.selectedUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json','client-token-key':this.hostkey },
          body: JSON.stringify({
            data: {
              firstname: this.selectedUser.firstname,
              lastname: this.selectedUser.lastname,
            },
            options: {},
          })
        });

        if (response.ok) {
          await this.getUserData();
          this.closeUserDialog();
        } else {
          console.error("API error:", response.status, response.statusText);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async deleteUser(user) {
      try {
        const response = await fetch(`https://gateway.cloudrestfulapi.com/api/user/${user._id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json','client-token-key':this.hostkey },
        });

        if (response.ok) {
          await this.getUserData();
        } else {
          console.error("API error:", response.status, response.statusText);
        }
      } catch (error) {
        console.error(error);
      }
    },
    deleteUserConfirmation(user) {
      this.userToDelete = user;
      this.showConfirmationPopup = true;
    },
    async confirmDeleteUser() {
      if (this.userToDelete) {
        await this.deleteUser(this.userToDelete);
        this.userToDelete = null;
      }
      this.showConfirmationPopup = false;
    },
    cancelDeleteUser() {
      this.userToDelete = null;
      this.showConfirmationPopup = false;
    },
    openUserDialog(user) {
      this.selectedUser = { ...user };

      // Check if the user object has data and update the properties accordingly
      if (user) {
        this.passwordsMatch = true;
        this.usernameValid = true;
        // Set other properties as needed
      } else {
        this.passwordsMatch = false;
        this.usernameValid = false;
        // Set other properties as needed
      }

      this.showUserDialog = true;

      this.showPassword= false;

      this.usernameExists= false;
      this.usernameError='';

      this.emailExists= false;
      this.emailValid= false;
      this.emailError='';

      this.phoneExists= false;
      this.phoneValid= false;
      this.phoneError='';
    },
    closeUserDialog() {
      this.selectedUser = {};
      this.showUserDialog = false;

      this.passwordsMatch= false;
      this.showPassword= false;

      this.usernameExists= false;
      this.usernameValid= false;
      this.usernameError='';

      this.emailExists= false;
      this.emailValid= false;
      this.emailError='';

      this.phoneExists= false;
      this.phoneValid= false;
      this.phoneError='';
    },
  },
};
</script>

<style scoped>
/* Modern Design Enhancements */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

/* Card Hover Effects */
.group:hover .group-hover\:bg-blue-100 {
  background-color: #dbeafe;
}

/* Button Hover Effects */
button {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

/* Input Focus States */
input:focus,
textarea:focus,
select:focus {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

/* Smooth Animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Admin Card Enhancements */
.admin-card {
  @apply bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 overflow-hidden;
}

.admin-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Header with gradient */
.admin-header {
  @apply h-20 bg-gradient-to-br from-blue-500 to-blue-600 relative;
}

/* Avatar Container */
.avatar-container {
  @apply w-16 h-16 bg-white rounded-full border-2 border-white shadow-lg overflow-hidden;
}

/* Icon Containers */
.icon-container {
  @apply flex items-center justify-center rounded-lg transition-all duration-200;
}

.icon-container:hover {
  transform: scale(1.05);
}

/* Action Buttons */
.action-btn {
  @apply inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-all duration-200;
}

.action-btn-primary {
  @apply action-btn text-blue-600 hover:text-blue-700 hover:bg-blue-50;
}

.action-btn-secondary {
  @apply action-btn text-gray-600 hover:text-gray-700 hover:bg-gray-50;
}

.action-btn-danger {
  @apply action-btn text-red-600 hover:text-red-700 hover:bg-red-50;
}

/* Form Elements */
.form-input {
  @apply w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200;
}

/* Modal Backdrop */
.modal-backdrop {
  @apply fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300;
}

/* Modal Container */
.modal-container {
  @apply relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto;
}

/* Button Variants */
.btn-primary {
  @apply px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200;
}

.btn-secondary {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200;
}

.btn-danger {
  @apply px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200;
}

/* Empty State */
.empty-state {
  @apply text-center py-8;
}

.empty-state-icon {
  @apply w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3;
}

.empty-state-title {
  @apply text-base font-medium text-gray-900 mb-2;
}

.empty-state-description {
  @apply text-sm text-gray-500 mb-4;
}

/* Course Badge */
.course-badge {
  @apply text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    @apply mx-4;
  }
  
  .grid {
    @apply grid-cols-1;
  }
  
  .action-btn {
    @apply px-2 py-1 text-xs;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .dark-mode {
    @apply bg-gray-900 text-white;
  }
  
  .dark-mode .modal-container {
    @apply bg-gray-800 border-gray-700;
  }
  
  .dark-mode .form-input {
    @apply bg-gray-700 border-gray-600 text-white;
  }
}

/* Focus States */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}

/* Blue Theme Variants */
.bg-blue-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.text-blue-primary {
  color: #2563eb;
}

.bg-blue-primary {
  background-color: #2563eb;
}

.border-blue-primary {
  border-color: #2563eb;
}

/* Admin Specific Styles */
.admin-header-section {
  @apply px-4 py-3 border-b border-gray-200;
}

.admin-nav {
  @apply bg-gray-50 border-b border-gray-200 px-4 py-2;
}

.admin-content {
  @apply p-4;
}

.admin-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3;
}

.admin-info {
  @apply pt-10;
}

.admin-actions {
  @apply flex items-center justify-end pt-3 border-t border-gray-100 space-x-1;
}

/* Modal Sections */
.modal-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.modal-section {
  @apply px-6 py-4 border-b border-gray-100;
}

.modal-footer {
  @apply px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl;
}

/* Form Sections */
.form-section-title {
  @apply text-base font-semibold text-gray-900 mb-4;
}

.form-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

/* Validation States */
.input-valid {
  @apply border-green-300 focus:border-green-500 focus:ring-green-500;
}

.input-invalid {
  @apply border-red-300 focus:border-red-500 focus:ring-red-500;
}

.validation-icon {
  @apply absolute top-2.5 right-3;
}

.validation-message {
  @apply text-red-500 text-sm mt-1;
}

/* Password Toggle */
.password-toggle {
  @apply text-xs text-blue-600 hover:text-blue-700;
}

/* Confirmation Dialog */
.confirmation-dialog {
  @apply relative bg-white rounded-xl shadow-xl max-w-md w-full p-6;
}

.confirmation-header {
  @apply flex items-center justify-between mb-4;
}

.confirmation-content {
  @apply mb-6;
}

.confirmation-actions {
  @apply flex justify-end space-x-3;
}

/* Loading States */
.loading-spinner {
  @apply inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin;
}

/* Hover Effects */
.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale:hover {
  transform: scale(1.02);
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus Visible */
.focus-visible:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Animation Keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Utility Classes */
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
