<template>
  <div
    v-if="showModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto add-user-modal">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">เพิ่มผู้เรียนใหม่</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Tab Navigation -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button 
              @click="switchTab('general')"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                activeTab === 'general' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i class="fas fa-user mr-2"></i>
              รายละเอียดทั่วไป
            </button>
            <button 
              @click="switchTab('taxonomy')"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                activeTab === 'taxonomy' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i class="fas fa-tags mr-2"></i>
              หมวดหมู่ข้อมูล
            </button>
          </nav>
        </div>
      </div>
      
      <!-- Form Content -->
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Tab Content: General Information -->
        <div v-show="activeTab === 'general'" class="space-y-6">
          <!-- Personal Information Section -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">ข้อมูลส่วนตัว</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อ *</label>
                <input
                  v-model="formData.firstName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="กรุณากรอกชื่อ"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">นามสกุล *</label>
                <input
                  v-model="formData.lastName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="กรุณากรอกนามสกุล"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">อีเมล *</label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="example@email.com"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">หมายเลขโทรศัพท์</label>
                <input
                  v-model="formData.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="08XXXXXXXX"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">เลขบัตรประชาชน</label>
                <input
                  v-model="formData.idCard"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="X-XXXX-XXXXX-XX-X"
                  maxlength="17"
                />
              </div>
            </div>
          </div>

          <!-- Account Information Section -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">ข้อมูลบัญชี</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านเริ่มต้น *</label>
                <input
                  v-model="formData.password"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="กรุณากรอกรหัสผ่าน"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่าน *</label>
                <input
                  v-model="formData.confirmPassword"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="กรุณายืนยันรหัสผ่าน"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Options Section -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">ตัวเลือกเพิ่มเติม</h3>
            <div class="space-y-3">
              <label class="flex items-center">
                <input 
                  v-model="formData.sendWelcomeEmail"
                  type="checkbox" 
                  class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                >
                <span class="ml-2 text-sm text-gray-700">ส่งอีเมลต้อนรับไปยังผู้เรียน</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="formData.forcePasswordChange"
                  type="checkbox" 
                  class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                >
                <span class="ml-2 text-sm text-gray-700">บังคับให้เปลี่ยนรหัสผ่านในการเข้าใช้งานครั้งแรก</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Tab Content: Taxonomy -->
        <div v-show="activeTab === 'taxonomy'" class="space-y-6">
          <!-- Taxonomy Section -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">หมวดหมู่ข้อมูล</h3>
            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-3">เลือกหมวดหมู่ที่เหมาะสมสำหรับผู้เรียนใหม่</p>
              
              <!-- Taxonomy Selector Component -->
              <TaxonomySelector
                v-model="formData.taxonomyTerms"
                content-type="member"
                content-type-label="สมาชิก"
                :max-selections="10"
              />
            </div>
            
            <!-- แสดงข้อมูลที่เลือกแล้ว -->
            <div v-if="formData.taxonomyTerms && formData.taxonomyTerms.length > 0" class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">หมวดหมู่ที่เลือก:</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="termId in formData.taxonomyTerms" 
                  :key="termId"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {{ getTermDisplayName(termId) }}
                  <button 
                    @click="removeTermFromSelection(termId)"
                    class="ml-1 text-green-600 hover:text-green-800"
                  >
                    <i class="fas fa-times text-xs"></i>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- Modal Footer -->
      <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="closeModal"
          class="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          @click="submitForm"
          :disabled="isSubmitting" 
          class="px-6 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <i class="fas fa-user-plus" v-if="!isSubmitting"></i>
          <i class="fas fa-spinner fa-spin" v-else></i> <!-- Show spinner icon when submitting -->
          เพิ่มผู้เรียน
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// เพิ่ม import สำหรับ taxonomy system
import { useTaxonomy } from '@/composables/useTaxonomy';
import TaxonomySelector from '@/extensions/modules/elearning/lesson/component/course/resource/taxonomy/TaxonomySelector.vue';

export default {
  name: 'AddUserModal',
  components: {
    TaxonomySelector,
  },
  setup() {
    // Setup taxonomy composable
    const { taxonomy, state, loading: taxonomyLoading, error: taxonomyError, fetchTaxonomyData } = useTaxonomy()
    
    return {
      taxonomy,
      taxonomyState: state,
      taxonomyLoading,
      taxonomyError,
      fetchTaxonomyData
    }
  },
  props: {
    showModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeTab: 'general', // 'general' หรือ 'taxonomy'
      isSubmitting: false, // เพิ่ม loading state
      formData: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        idCard: '',
        password: '',
        confirmPassword: '',
        sendWelcomeEmail: false,
        forcePasswordChange: true,
        taxonomyTerms: [] // เพิ่ม array สำหรับ taxonomy terms
      }
    }
  },
  methods: {
    closeModal() {
      this.resetForm();
      this.$emit('close');
    },
    submitForm() {
      // Validate passwords match
      if (this.formData.password !== this.formData.confirmPassword) {
        alert('รหัสผ่านไม่ตรงกัน');
        return;
      }

      // Validate required fields
      if (!this.formData.firstName || !this.formData.lastName || !this.formData.email) {
        alert('กรุณากรอกข้อมูลที่จำเป็น');
        return;
      }

      // Prepare data to send including taxonomy terms
      const userData = {
        ...this.formData,
        taxonomy_terms: this.formData.taxonomyTerms // ส่ง taxonomy terms ไปด้วย
      };

      // Emit the form data to parent component
      this.$emit('submit', userData);
      
      // Reset form and close modal
      this.resetForm();
      this.$emit('close');
    },
    resetForm() {
      this.activeTab = 'general'; // รีเซ็ตกลับไป tab แรก
      this.formData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        idCard: '',
        password: '',
        confirmPassword: '',
        sendWelcomeEmail: false,
        forcePasswordChange: true,
        taxonomyTerms: [] // รีเซ็ต taxonomy terms
      };
    },
    // เพิ่ม methods สำหรับจัดการ taxonomy
    getTermDisplayName(termId) {
      if (!this.taxonomyState?.isReady) {
        return `รายการ ${termId}`;
      }
      
      const term = this.taxonomyState.terms.find(t => t._id === termId);
      if (!term) {
        return `รายการ ${termId}`;
      }
      
      return term.customData?.name || 
             term.customData?.ชื่อ || 
             term.customData?.title ||
             term.name || 
             term.code ||
             'ไม่มีชื่อ';
    },
    getTermGroupName(termId) {
      if (!this.taxonomyState?.isReady) {
        return 'ไม่ระบุกลุ่ม';
      }
      
      const term = this.taxonomyState.terms.find(t => t._id === termId);
      if (!term || !term.taxonomy) {
        return 'ไม่ระบุกลุ่ม';
      }
      
      const group = this.taxonomyState.groups.find(g => g._id === term.taxonomy);
      if (!group) {
        return 'ไม่ระบุกลุ่ม';
      }
      
      return group.name || group.code || 'ไม่ระบุกลุ่ม';
    },
    removeTermFromSelection(termId) {
      // ลบ taxonomy term ที่เลือกออกจาก array
      if (this.formData.taxonomyTerms && Array.isArray(this.formData.taxonomyTerms)) {
        this.formData.taxonomyTerms = this.formData.taxonomyTerms.filter(id => id !== termId);
        console.log(`🗑️ ลบ taxonomy term: ${termId} ออกจากการเลือก`);
        console.log('📋 taxonomy terms ที่เหลือ:', this.formData.taxonomyTerms);
      }
    },
    // เพิ่ม method สำหรับเปลี่ยน tab
    switchTab(tab) {
      this.activeTab = tab;
    }
  },
  async mounted() {
    try {
      // โหลดข้อมูล taxonomy เมื่อ modal เปิด
      console.log('🔄 กำลังโหลดระบบ Taxonomy สำหรับ AddUserModal...');
      
      if (this.fetchTaxonomyData) {
        await this.fetchTaxonomyData(true);
        console.log('✅ โหลด Taxonomy เสร็จแล้ว');
      }
    } catch (error) {
      console.error("Error loading taxonomy in AddUserModal:", error);
    }
  }
}
</script>

<style scoped>
/* Add User Modal Styles */
.add-user-modal {
  animation: modalFadeIn 0.3s ease-out;
}

.add-user-modal .modal-content {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Form field focus styles */
.add-user-modal input:focus {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* Section headers in modal */
.add-user-modal h3 {
  position: relative;
}

.add-user-modal h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 1px;
}

/* Checkbox styles in modal */
.add-user-modal input[type="checkbox"]:checked {
  background-color: #10b981;
  border-color: #10b981;
}

/* Button hover effects */
.add-user-modal button {
  transition: all 0.2s ease;
}

.add-user-modal button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
