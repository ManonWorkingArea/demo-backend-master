<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/40" @click="closeModal"></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[85vh] overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">จัดการผู้ดูแลระบบ</h3>
            <div class="flex items-center space-x-2">
              <button 
                @click="toggleCreateForm" 
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium">
                {{ showCreateForm ? 'ยกเลิก' : 'เพิ่มใหม่' }}
              </button>
              <button 
                @click="closeModal" 
                class="text-gray-400 hover:text-gray-600 p-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="!loading_sources" class="flex items-center justify-center py-12">
          <div class="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
          <span class="text-gray-600">กำลังโหลด...</span>
        </div>

        <!-- Content -->
        <div v-else class="max-h-[60vh] overflow-y-auto">
          <!-- Create Admin Form -->
          <div v-if="showCreateForm" class="border-b border-gray-200 bg-gray-50 p-6">
            <h4 class="text-base font-medium text-gray-900 mb-4">เพิ่มผู้ดูแลใหม่</h4>
            <form @submit.prevent="createNewAdmin" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                  <input 
                    v-model="newAdminForm.firstname" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ชื่อ"
                  />
                  <p v-if="formErrors.firstname" class="mt-1 text-sm text-red-600">{{ formErrors.firstname }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                  <input 
                    v-model="newAdminForm.lastname" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="นามสกุล"
                  />
                  <p v-if="formErrors.lastname" class="mt-1 text-sm text-red-600">{{ formErrors.lastname }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label>
                  <input 
                    v-model="newAdminForm.username" 
                    type="text" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ชื่อผู้ใช้"
                  />
                  <p v-if="formErrors.username" class="mt-1 text-sm text-red-600">{{ formErrors.username }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                  <input 
                    v-model="newAdminForm.email" 
                    type="email" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="อีเมล"
                  />
                  <p v-if="formErrors.email" class="mt-1 text-sm text-red-600">{{ formErrors.email }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
                  <input 
                    v-model="newAdminForm.phone" 
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="เบอร์โทร"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                  <input 
                    v-model="newAdminForm.password" 
                    type="password" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="รหัสผ่าน"
                  />
                  <p v-if="formErrors.password" class="mt-1 text-sm text-red-600">{{ formErrors.password }}</p>
                </div>
              </div>
              
              <div class="flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  @click="resetForm"
                  class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium">
                  รีเซ็ต
                </button>
                <button 
                  type="submit" 
                  :disabled="creatingAdmin"
                  class="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded text-sm font-medium">
                  {{ creatingAdmin ? 'กำลังเพิ่ม...' : 'เพิ่ม' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Admin List -->
          <div v-if="listItems.length === 0" class="text-center py-12">
            <div class="text-gray-400 mb-2">
              <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-1">ไม่มีผู้ดูแลระบบ</h3>
            <p class="text-gray-500 text-sm">คลิก "เพิ่มใหม่" เพื่อเพิ่มผู้ดูแลคนแรก</p>
          </div>

          <div v-else class="divide-y divide-gray-200">
            <div v-for="admin in listItems" :key="admin._id" class="p-4 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <!-- Avatar -->
                  <div class="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {{ (admin.firstname?.charAt(0) || '') + (admin.lastname?.charAt(0) || '') }}
                  </div>
                  
                  <!-- Admin Info -->
                  <div>
                    <div class="flex items-center space-x-2">
                      <p class="font-medium text-gray-900">{{ admin.firstname }} {{ admin.lastname }}</p>
                      <span class="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                        {{ admin.role || 'Admin' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600">{{ admin.email }}</p>
                    <p class="text-xs text-gray-500">{{ admin.collection ? admin.collection.length : 0 }} collections</p>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center space-x-2">
                  <template v-if="!isAdminAssignedToCollection(admin)">
                    <button 
                      @click="assignAdmin(admin._id)" 
                      :disabled="assigningId === admin._id"
                      class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded text-sm font-medium">
                      {{ assigningId === admin._id ? 'กำลังเพิ่ม...' : 'เลือก' }}
                    </button>
                  </template>

                  <template v-else>
                    <span class="text-sm text-green-600 font-medium mr-2">เพิ่มแล้ว</span>
                    <button 
                      @click="removeAdmin(admin._id)" 
                      :disabled="removingId === admin._id"
                      class="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-2 rounded text-sm font-medium">
                      {{ removingId === admin._id ? 'กำลังลบ...' : 'ลบ' }}
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="flex justify-end">
            <button 
              @click="closeModal" 
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium">
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';

export default {
  name: 'CollectionAdminModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    collectionId: {
      type: String,
      required: true
    },
    hostkey: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'admin-assigned', 'admin-removed', 'admin-created'],
  data() {
    return {
      listItems: [],
      loading_sources: true,
      assigningId: null,
      removingId: null,
      showCreateForm: false,
      creatingAdmin: false,
      newAdminForm: {
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        phone: '',
        password: ''
      },
      formErrors: {
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: ''
      }
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.getData();
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },

    async getData() {
      if (storageManager.get('session', 'login')) {
        try {
          this.loading_sources = false;

          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/query", {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'client-token-key': 'DU1eYMDG7j8yb199YDPg4'},
            body: JSON.stringify({
              "method": "find",
              "args": [{ "role": "superadmin" }]
            })
          });

          const RestReturn = await resAPI.json();
          console.log(RestReturn);

          this.listItems = RestReturn;
          this.loading_sources = true;

        } catch (error) {
          console.log(error);
          this.loading_sources = true;
        }
      }
    },

    async assignAdmin(id) {
      try {
        this.assigningId = id;
        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/" + id + "/collection", {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'client-token-key': 'DU1eYMDG7j8yb199YDPg4'},
          body: JSON.stringify({
            action: "add",
            element: this.collectionId,
            type: "string",
          })
        });

        if (resAPI.status === 200) {
          console.log("Admin assigned successfully");
          await this.getData(); // Refresh the list
          this.$emit('admin-assigned'); // Notify parent component
        } else {
          console.log("Error assigning admin");
        }

      } catch (error) {
        console.log(error);
      } finally {
        this.assigningId = null;
      }
    },

    async removeAdmin(id) {
      if (storageManager.get('session', 'login')) {
        try {
          this.removingId = id;
          console.log("Removing admin with id:", id);
          
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/" + id + "/collection", {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'client-token-key': 'DU1eYMDG7j8yb199YDPg4'},
            body: JSON.stringify({
              action: "remove",
              element: this.collectionId,
              type: "string",
            })
          });

          if (resAPI.status === 200) {
            console.log("Admin removed successfully");
            await this.getData(); // Refresh the list
            this.$emit('admin-removed'); // Notify parent component
          } else {
            console.log("Error removing admin");
          }

        } catch (error) {
          console.log(error);
        } finally {
          this.removingId = null;
        }
      }
    },

    isAdminAssignedToCollection(admin) {
      return admin.collection && admin.collection.includes(this.collectionId);
    },

    toggleCreateForm() {
      this.showCreateForm = !this.showCreateForm;
      if (!this.showCreateForm) {
        this.resetForm();
      }
    },

    resetForm() {
      this.newAdminForm = {
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        phone: '',
        password: ''
      };
      this.formErrors = {
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: ''
      };
    },

    validateForm() {
      this.formErrors = {
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: ''
      };

      let isValid = true;

      // Validate required fields
      if (!this.newAdminForm.firstname.trim()) {
        this.formErrors.firstname = 'กรุณากรอกชื่อ';
        isValid = false;
      }

      if (!this.newAdminForm.lastname.trim()) {
        this.formErrors.lastname = 'กรุณากรอกนามสกุล';
        isValid = false;
      }

      if (!this.newAdminForm.username.trim()) {
        this.formErrors.username = 'กรุณากรอกชื่อผู้ใช้';
        isValid = false;
      } else if (this.newAdminForm.username.length < 3) {
        this.formErrors.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร';
        isValid = false;
      }

      if (!this.newAdminForm.email.trim()) {
        this.formErrors.email = 'กรุณากรอกอีเมล';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newAdminForm.email)) {
        this.formErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        isValid = false;
      }

      if (!this.newAdminForm.password.trim()) {
        this.formErrors.password = 'กรุณากรอกรหัสผ่าน';
        isValid = false;
      } else if (this.newAdminForm.password.length < 6) {
        this.formErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        isValid = false;
      }

      return isValid;
    },

    async createNewAdmin() {
      if (!storageManager.get('session', 'login')) {
        return;
      }

      // Validate form first
      if (!this.validateForm()) {
        return;
      }

      try {
        this.creatingAdmin = true;

        // Import CryptoJS for password hashing
        const CryptoJS = (await import('crypto-js')).default;
        const salt = CryptoJS.lib.WordArray.random(16);
        const hash = CryptoJS.SHA256(this.newAdminForm.password + salt).toString();

        // Get the configs for parent site ID
        const configs = storageManager.get('configs');

        const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/user/", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'client-token-key': 'DU1eYMDG7j8yb199YDPg4'
          },
          body: JSON.stringify({
            data: {
              firstname: this.newAdminForm.firstname,
              lastname: this.newAdminForm.lastname,
              phone: this.newAdminForm.phone,
              email: this.newAdminForm.email,
              username: this.newAdminForm.username,
              password: hash,
              parent: configs.siteID,
              salt: salt.toString(),
              role: "superadmin",
            },
            options: {
              uniqueFields: [
                ["username", "email"]
              ]
            }
          })
        });

        const result = await resAPI.json();
        
        if (resAPI.status === 200 && result.success) {
          console.log("New admin created successfully");
          
          // Automatically assign the new admin to the collection
          await this.assignAdmin(result._id);
          
          // Reset form and hide it
          this.resetForm();
          this.showCreateForm = false;
          
          // Show success message (you can customize this based on your notification system)
          console.log("สร้างและเพิ่มผู้ดูแลใหม่สำเร็จแล้ว");
          
          // Emit events to notify parent component
          this.$emit('admin-created', result);
          
          // Refresh the admin list
          await this.getData();
          
        } else if (resAPI.status === 400 && result.message === "duplicate") {
          console.log("Duplicate user detected");
          
          // Set appropriate error messages
          if (result.field === 'username' || result.duplicateFields?.includes('username')) {
            this.formErrors.username = 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว';
          }
          if (result.field === 'email' || result.duplicateFields?.includes('email')) {
            this.formErrors.email = 'อีเมลนี้มีอยู่ในระบบแล้ว';
          }
          
        } else {
          console.log("Error creating admin:", result);
          alert("เกิดข้อผิดพลาดในการสร้างผู้ดูแลใหม่");
        }

      } catch (error) {
        console.log("Error creating new admin:", error);
        alert("เกิดข้อผิดพลาดในการสร้างผู้ดูแลใหม่");
      } finally {
        this.creatingAdmin = false;
      }
    }
  }
}
</script>

<style scoped>
/* Basic scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
