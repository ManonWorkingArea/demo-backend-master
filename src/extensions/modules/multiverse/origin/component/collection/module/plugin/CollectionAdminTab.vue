<template>
  <div class="bg-white rounded-lg border border-gray-200">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-medium text-gray-900">ทีมงาน</h2>
          <p class="text-gray-500 text-sm mt-1">ผู้ดูแลระบบและทีมงาน ({{ collectionAdmin.length }} คน)</p>
        </div>
        
        <button 
          @click="openAdminModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          เพิ่มสมาชิก
        </button>
      </div>
    </div>
    
    <!-- Content -->
    <div class="border-t border-gray-100">
      <div class="divide-y divide-gray-100">
        <!-- Admin List -->
        <div v-for="(admin, index) in collectionAdmin" :key="index" class="p-6 hover:bg-gray-50 transition-colors group">
          <div class="flex items-center justify-between">
            <div 
              @click="navigateToUser(admin._id)"
              class="flex items-center space-x-4 cursor-pointer hover:bg-blue-50 rounded-lg p-2 -m-2 transition-colors">
              <!-- Avatar -->
              <img 
                :src="admin.avatar_img || `https://ui-avatars.com/api/?name=${encodeURIComponent((admin.firstname || '') + ' ' + (admin.lastname || ''))}&background=e5e7eb&color=374151&size=48`"
                class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" 
                :alt="admin.firstname">
              
              <!-- Admin Info -->
              <div class="flex-1">
                <p class="font-medium text-gray-900 hover:text-blue-600 transition-colors">{{ admin.firstname }} {{ admin.lastname }}</p>
                <p class="text-gray-500 text-sm">{{ admin.email }}</p>
                <div class="flex items-center space-x-2 mt-1">
                  <span class="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full">
                    {{ admin.role || 'Admin' }}
                  </span>
                  <span class="text-xs text-gray-500">เข้าร่วมเมื่อ {{ dateTime(admin.joinedAt || admin.createdAt) }}</span>
                </div>
              </div>
              
              <!-- Click indicator -->
              <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center space-x-2" @click.stop>
              <!-- Status -->
              <div class="flex items-center space-x-1 text-sm text-gray-500">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span>Active</span>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex space-x-1">
                <button 
                  @click="navigateToUser(admin._id)"
                  class="text-blue-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  title="ดูรายละเอียดผู้ใช้">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </button>
                <button 
                  class="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="แก้ไข">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button 
                  @click="deleteData(admin._id)" 
                  class="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="ลบออกจากทีม">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="collectionAdmin.length === 0" class="p-12 text-center">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่มีทีมงาน</h3>
          <p class="text-gray-500 mb-4">ยังไม่มีสมาชิกในทีมงาน</p>
          <button 
            @click="openAdminModal" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            เพิ่มสมาชิกแรก
          </button>
        </div>
      </div>
    </div>

    <!-- Admin Modal -->
    <CollectionAdminModal 
      :isOpen="showAdminModal"
      :collectionId="dataItem"
      :hostkey="collectionKey"
      @close="closeAdminModal"
      @admin-assigned="handleAdminAssigned"
      @admin-removed="handleAdminRemoved"
      @admin-created="handleAdminCreated"
    />
  </div>
</template>

<script>
import moment from 'moment'
import CollectionAdminModal from './CollectionAdminModal.vue'

export default {
  name: 'CollectionAdminTab',
  components: {
    CollectionAdminModal
  },
  props: {
    collectionAdmin: {
      type: Array,
      required: true
    },
    dataItem: {
      type: String,
      required: true
    },
    collectionKey: {
      type: String,
      required: true
    }
  },
  emits: ['delete-admin', 'refresh-data'],
  data() {
    return {
      showAdminModal: false
    }
  },
  methods: {
    dateTime(date) {
      if (!date) return '';
      return moment(date).format('DD/MM/YYYY HH:mm:ss');
    },
    
    deleteData(id) {
      this.$emit('delete-admin', id);
    },

    openAdminModal() {
      this.showAdminModal = true;
    },

    closeAdminModal() {
      this.showAdminModal = false;
    },

    handleAdminAssigned() {
      // Refresh parent component data when admin is assigned
      this.$emit('refresh-data');
    },

    handleAdminRemoved() {
      // Refresh parent component data when admin is removed
      this.$emit('refresh-data');
    },

    handleAdminCreated() {
      // Refresh parent component data when new admin is created
      this.$emit('refresh-data');
    },

    navigateToUser(userId) {
      if (userId) {
        this.$router.push(`/origin/user/detail/${userId}`);
      } else {
        console.warn('User ID not found');
      }
    }
  }
}
</script>

<style scoped>
/* Clean button hover effects */
button {
  transition: all 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
</style>
