<template>
  <div
    class="bg-white shadow sm:rounded-lg relative"
    :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'"
    :class="[activeBlock ? 'isblock' : 'isunblock']"
  >
    <div class="px-4 py-5 sm:px-6 flex items-center justify-between">
      <h2
        id="applicant-information-title"
        class="text-lg font-bold leading-6 text-gray-900"
      >
        ข้อมูลส่วนตัวผู้สมัคร
      </h2>
      <button @click="toggleEditMode" class="text-blue-600 hover:text-blue-500">
        {{ editMode ? "ยกเลิก" : "แก้ไขข้อมูลส่วนตัว" }}
      </button>
    </div>

    <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
      <form>
        <div class="grid grid-cols-1 gap-3 gap-y-4 sm:grid-cols-2">
          <div>
            <label for="firstname" class="text-sm font-medium text-gray-500">ชื่อ</label>
            <span
              v-if="!editMode"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >{{ formData.firstname }}</span
            >
            <span v-else>
              <input
                type="text"
                id="firstname"
                v-model="formData.firstname"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </span>
          </div>
          <div>
            <label for="lastname" class="text-sm font-medium text-gray-500"
              >นามสกุล</label
            >
            <span
              v-if="!editMode"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >{{ formData.lastname }}</span
            >
            <span v-else>
              <input
                type="text"
                id="lastname"
                v-model="formData.lastname"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </span>
          </div>
          <div>
            <label for="citizen" class="text-sm font-medium text-gray-500"
              >เลขประจำตัวประชาชน</label
            >
            <span
              v-if="!editMode"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >{{ formData.citizen }}</span
            >
            <span v-else>
              <input
                type="text"
                id="citizen"
                v-model="formData.citizen"
                @input="checkCitizen"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                :class="{ 'border-red-500': citizenExists }"
              />
              <div v-if="citizenExists" class="text-red-500 text-sm mt-1">
                มีเลขประจำตัวประชาชนนี้ในระบบแล้ว
              </div>
            </span>
          </div>
          <div>
            <label for="phone" class="text-sm font-medium text-gray-500"
              >เบอร์โทรศัพท์</label
            >
            <span
              v-if="!editMode"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >{{ formData.phone }}</span
            >
            <span v-else>
              <input
                type="text"
                id="phone"
                v-model="formData.phone"
                @input="checkPhone"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                :class="{ 'border-red-500': phoneExists }"
              />
              <div v-if="phoneExists" class="text-red-500 text-sm mt-1">
                มีเบอร์โทรนี้ในระบบแล้ว
              </div>
            </span>
          </div>
          <div>
            <label for="email" class="text-sm font-medium text-gray-500">อีเมล</label>
            <span
              v-if="!editMode"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >{{ formData.email }}</span
            >
            <span v-else>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                @input="checkEmail"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                :class="{ 'border-red-500': emailExists }"
              />
              <div v-if="emailExists" class="text-red-500 text-sm mt-1">
                มีอีเมลนี้ในระบบแล้ว
              </div>
            </span>
          </div>
          <div>
            <label for="username" class="text-sm font-medium text-gray-500"
              >ชื่อผู้ใช้</label
            >
            <span
              v-if="!editMode"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >{{ formData.username }}</span
            >
            <span v-else>
              <input
                type="text"
                id="username"
                v-model="formData.username"
                @input="checkUsername"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                :class="{ 'border-red-500': usernameExists }"
              />
              <div v-if="usernameExists" class="text-red-500 text-sm mt-1">
                มีชื่อผู้ใช้นี้ในระบบแล้ว
              </div>
            </span>
          </div>
          <div>
            <label for="status" class="text-sm font-medium text-gray-500">สถานะ</label>
            <span
              v-if="!editMode"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >{{ formData.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span
            >
            <span v-else>
              <select
                id="status"
                v-model="formData.status"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                <option value="active">เปิดใช้งาน</option>
                <option value="unactive">ปิดใช้งาน</option>
              </select>
            </span>
          </div>
        </div>
      </form>

      <!-- Taxonomy Selector Section -->
      <div v-if="editMode" class="mt-6 border-t border-gray-200 pt-6">
        <div class="mb-4">
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            <i class="fas fa-tags text-blue-600 mr-2"></i>
            การจัดหมวดหมู่สมาชิก
          </h3>
          <p class="text-sm text-gray-600">เลือกหมวดหมู่ที่เหมาะสมสำหรับสมาชิกนี้</p>
        </div>
        
        <!-- Taxonomy Selector Component -->
        <TaxonomySelector
          v-model="selectedTaxonomyTerms"
          content-type="member"
          content-type-label="สมาชิก"
          :max-selections="10"
        />
      </div>

      <!-- แสดง Taxonomy ที่เลือกไว้เมื่อไม่ได้อยู่ในโหมดแก้ไข -->
      <div v-else-if="selectedTaxonomyTerms.length > 0" class="mt-6 border-t border-gray-200 pt-4">
        <div class="mb-3">
          <h3 class="text-sm font-medium text-gray-900 mb-1 flex items-center gap-2">
            <i class="fas fa-tags text-blue-500 text-xs"></i>
            หมวดหมู่ผู้สมัคร
            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{{ selectedTaxonomyTerms.length }}</span>
          </h3>
        </div>
        
        <!-- แสดง Selected Terms แบบกระทัดรัด -->
        <div class="space-y-3">
          <div 
            v-for="group in getGroupedTaxonomyTerms()" 
            :key="group.groupId"
            class="border border-gray-200 rounded-md"
          >
            <!-- Group Header แบบบาง -->
            <div class="bg-gray-50 border-b border-gray-200 px-3 py-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <i class="fas fa-folder text-gray-600 text-xs"></i>
                  <span class="text-sm font-medium text-gray-800">{{ group.groupName }}</span>
                  <span class="text-xs text-gray-500">({{ group.terms.length }})</span>
                </div>
                <span v-if="group.groupCode" class="text-xs text-gray-400 bg-white px-2 py-0.5 rounded border">
                  {{ group.groupCode }}
                </span>
              </div>
            </div>
            
            <!-- Terms แบบแนวนอน -->
            <div class="p-3 bg-white">
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="term in group.terms" 
                  :key="term.termId"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-200 hover:bg-blue-100 transition-colors"
                  :title="term.description || term.displayName"
                >
                  <i class="fas fa-tag text-blue-500" style="font-size: 10px;"></i>
                  {{ term.displayName }}
                  <span v-if="term.code" class="text-blue-500 ml-1">({{ term.code }})</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- สรุปข้อมูลแบบเรียบง่าย -->
        <div class="mt-3 flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
          <span>จำนวนกลุ่ม: {{ getGroupedTaxonomyTerms().length }}</span>
          <span>รายการทั้งหมด: {{ selectedTaxonomyTerms.length }}</span>
        </div>
      </div>

      <div v-if="editMode" class="mt-5">
        <button
          class="bg-blue-500 hover:bg-blue-600 text-sm text-white py-2 px-4 rounded"
          @click="saveData"
        >
          <font-awesome-icon :icon="['fas', 'save']" /> บันทึกข้อมูลส่วนตัว
        </button>

        <button
          class="ml-2 bg-gray-500 hover:bg-gray-600 text-sm text-white py-2 px-4 rounded"
          @click="toggleEditMode"
        >
          <font-awesome-icon :icon="['fas', 'times']" /> ยกเลิก
        </button>
      </div>
    </div>

    <!-- Modal for setting new password -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex justify-center items-center p-4"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 scale-100">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 rounded-t-xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i class="fas fa-key text-white text-lg"></i>
              </div>
              <div>
                <h2 class="text-lg font-semibold text-white">กำหนดรหัสผ่านใหม่</h2>
                <p class="text-blue-100 text-sm">สร้างรหัสผ่านใหม่สำหรับผู้ใช้งาน</p>
              </div>
            </div>
            <button
              @click="closeModal"
              class="text-white hover:text-gray-200 transition-colors duration-200 p-1"
            >
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6">
          <form @submit.prevent="resetPasswordWithNewPassword">
            <div class="mb-6">
              <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่านใหม่
              </label>
              <div class="relative">
                <input
                  id="newPassword"
                  type="password"
                  v-model="newPassword"
                  placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 pr-12"
                  required
                  minlength="6"
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <i class="fas fa-lock text-gray-400"></i>
                </div>
              </div>
              <div class="mt-2 text-xs text-gray-500">
                <i class="fas fa-info-circle mr-1"></i>
                รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร
              </div>
            </div>

            <!-- Password Strength Indicator -->
            <div class="mb-6" v-if="newPassword">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-gray-700">ความแข็งแกร่งของรหัสผ่าน</span>
                <span class="text-xs text-gray-500">{{ getPasswordStrength() }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getPasswordStrengthColor()"
                  :style="{ width: getPasswordStrengthWidth() }"
                ></div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <i class="fas fa-times mr-2"></i>
                ยกเลิก
              </button>
              <button
                type="submit"
                :disabled="!newPassword || newPassword.length < 6"
                class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center transform hover:scale-105 disabled:hover:scale-100"
              >
                <i class="fas fa-check mr-2"></i>
                เปลี่ยนรหัสผ่าน
              </button>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-3 rounded-b-xl">
          <div class="flex items-center text-xs text-gray-500">
            <i class="fas fa-shield-alt text-blue-500 mr-2"></i>
            รหัสผ่านจะถูกเข้ารหัสอย่างปลอดภัยก่อนบันทึก
          </div>
        </div>
      </div>
    </div>

    <footer
      class="border-t border-gray-300 bg-gray-200 py-4 px-6 flex items-center justify-center"
    >
      <div class="flex space-x-4">
        <button
          class="bg-blue-500 hover:bg-blue-600 text-sm text-white py-2 px-4 rounded"
          @click="resetPasswordByPhone"
        >
          <font-awesome-icon :icon="['fas', 'key']" /> แก้รหัสผ่าน (เบอร์โทร)
        </button>
        <button
          class="bg-blue-500 hover:bg-blue-600 text-sm text-white py-2 px-4 rounded"
          @click="showPasswordModal"
        >
          <font-awesome-icon :icon="['fas', 'key']" /> แก้รหัสผ่าน (กำหนดเอง)
        </button>
      </div>
    </footer>
  </div>
</template>

<script>
import storageManager from "@/plugins/storage";
import debug from "@/plugins/Logger.js";
import requestClient from "@/plugins/requestClient";
const Request = new requestClient(false);
import dialog from "@/plugins/Dialog.js";
import CryptoJS from "crypto-js";

// เพิ่ม import สำหรับ taxonomy system
import { useTaxonomy } from '@/composables/useTaxonomy';
import TaxonomySelector from '@/extensions/modules/elearning/lesson/component/course/resource/taxonomy/TaxonomySelector.vue';

export default {
  props: {
    member: Object, // Define the prop and its type
  },
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
  data() {
    return {
      config: storageManager.get("configs"),
      session: storageManager.get("session"),
      enroll: [],
      activeBlock: false,
      editMode: false,
      emailExists: false,
      phoneExists: false,
      citizenExists: false,
      usernameExists: false,
      formData: { ...this.member },
      message: "Profile",
      showModal: false,
      newPassword: "",
      
      // เพิ่มตัวแปรสำหรับ taxonomy
      selectedTaxonomyTerms: [], // Array ของ term IDs ที่ถูกเลือก
    };
  },
  methods: {
    // เพิ่ม method สำหรับโหลดข้อมูล taxonomy terms จาก member data
    loadTaxonomyTermsFromMember(memberData) {
      if (memberData && memberData.taxonomy_terms && Array.isArray(memberData.taxonomy_terms)) {
        this.selectedTaxonomyTerms = memberData.taxonomy_terms;
        console.log('โหลด taxonomy terms จากสมาชิก:', this.selectedTaxonomyTerms);
      } else {
        this.selectedTaxonomyTerms = [];
      }
    },
    
    resetPasswordByPhone() {
      this.resetPassword(this.member.phone);
    },
    // Other methods...
    showPasswordModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.newPassword = ""; // Reset the new password input
    },
    async resetPasswordWithNewPassword() {
      // Validation สำหรับรหัสผ่านใหม่
      if (!this.newPassword || this.newPassword.length < 6) {
        dialog.prompt({
          title: "เกิดข้อผิดพลาด",
          message: "กรุณากรอกรหัสผ่านที่มีความยาวอย่างน้อย 6 ตัวอักษร",
          confirm: async () => {},
          cancel: () => {},
        });
        return;
      }
      
      // Call reset method with the new password
      await this.resetPassword(this.newPassword);
      this.closeModal(); // Close modal after resetting password
    },
    toggleEditMode() {
      if (this.editMode) {
        // If currently in edit mode, reset formData to its original state
        this.formData = { ...this.member }; // Reset formData to original member data
        // รีเซ็ต taxonomy terms เมื่อยกเลิกการแก้ไข
        this.loadTaxonomyTermsFromMember(this.member);
      }
      this.editMode = !this.editMode;
    },
    async checkEmail() {
      if (!this.formData.email) {
        this.emailExists = false;
        return;
      }

      try {
        const payload = {
          method: "find",
          args: [
            {
              $and: [{ email: this.formData.email }],
            },
          ],
        };

        const { data: loginData } = await Request.POST(
          "user/query",
          payload,
          this.config.key
        );
        this.emailExists = loginData.length > 0 && loginData[0]._id != this.formData._id;
      } catch (error) {
        console.error("Error checking email:", error);
      }
    },
    async checkPhone() {
      if (!this.formData.phone) {
        this.phoneExists = false;
        return;
      }

      try {
        const payload = {
          method: "find",
          args: [
            {
              $and: [{ phone: this.formData.phone }],
            },
          ],
        };

        const { data: loginData } = await Request.POST(
          "user/query",
          payload,
          this.config.key
        );
        this.phoneExists = loginData.length > 0 && loginData[0]._id != this.formData._id;
      } catch (error) {
        console.error("Error checking phone:", error);
      }
    },
    async checkCitizen() {
      if (!this.formData.citizen) {
        this.citizenExists = false;
        return;
      }

      try {
        const payload = {
          method: "find",
          args: [
            {
              $and: [{ citizen: this.formData.citizen }],
            },
          ],
        };

        const { data: loginData } = await Request.POST(
          "user/query",
          payload,
          this.config.key
        );
        this.citizenExists =
          loginData.length > 0 && loginData[0]._id != this.formData._id;
      } catch (error) {
        console.error("Error checking citizen:", error);
      }
    },
    async checkUsername() {
      if (!this.formData.username) {
        this.usernameExists = false;
        return;
      }

      try {
        const payload = {
          method: "find",
          args: [
            {
              $and: [{ username: this.formData.username }],
            },
          ],
        };

        const { data: loginData } = await Request.POST(
          "user/query",
          payload,
          this.config.key
        );
        this.usernameExists =
          loginData.length > 0 && loginData[0]._id != this.formData._id;
      } catch (error) {
        console.error("Error checking username:", error);
      }
    },
    async getData() {
      try {
        const pipeline = [
          {
            $match: {
              $and: [{ userID: this.member._id }],
            },
          },
          {
            $set: { courseID: { $toObjectId: "$courseID" } },
          },
          {
            $lookup: {
              from: "course",
              localField: "courseID",
              foreignField: "_id",
              as: "course",
            },
          },
          {
            $unwind: "$course",
          },
          {
            $facet: {
              enroll: [{ $skip: (1 - 1) * 100 }, { $limit: 100 }],
              totalCount: [{ $count: "count" }],
            },
          },
        ];

        const resAPI = await Request.POST(
          "enroll/aggregate",
          { pipeline },
          this.config.key
        );
        const data = resAPI.data;

        this.enroll = data[0].enroll;
        this.activeBlock = false;
      } catch (error) {
        debug.log(error);
      }
    },
    async saveData() {
      try {
        // Check if any of the required fields are blank
        if (
          !this.formData.firstname ||
          !this.formData.lastname ||
          !this.formData.citizen ||
          !this.formData.phone ||
          !this.formData.email ||
          !this.formData.username
        ) {
          dialog.prompt({
            title: "เกิดข้อผิดพลาด",
            message: "กรอกข้อมูลไม่ครบ !",
            confirm: async () => {},
            cancel: () => {},
          });
          return;
        }

        // Check if the citizen number is exactly 13 digits long and contains only numbers
        if (!/^\d{13}$/.test(this.formData.citizen)) {
          console.error(
            "Citizen number must be exactly 13 digits long and contain only numbers."
          );
          dialog.prompt({
            title: "เกิดข้อผิดพลาด",
            message: "เลขประชาชนต้องมี 13 หลัก และเป็นตัวเลขเท่านั้น !",
            confirm: async () => {},
            cancel: () => {},
          });
          return;
        }

        // Check if the phone number is exactly 10 digits long and contains only numbers
        if (!/^\d{10}$/.test(this.formData.phone)) {
          dialog.prompt({
            title: "เกิดข้อผิดพลาด",
            message: "เบอร์โทรต้องมี 10 หลัก และเป็นตัวเลขเท่านั้น !",
            confirm: async () => {},
            cancel: () => {},
          });
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
          dialog.prompt({
            title: "เกิดข้อผิดพลาด",
            message: "รูปแบบอีเมล์ไม่ถูกต้อง !",
            confirm: async () => {},
            cancel: () => {},
          });
          return;
        }

        await Promise.all([
          this.checkEmail(),
          this.checkPhone(),
          this.checkCitizen(),
          this.checkUsername(),
        ]);

        if (
          this.emailExists ||
          this.phoneExists ||
          this.citizenExists ||
          this.usernameExists
        ) {
          return;
        }
        
        const requestBody = {
          data: {
            firstname: this.formData.firstname,
            lastname: this.formData.lastname,
            citizen: this.formData.citizen,
            phone: this.formData.phone,
            email: this.formData.email,
            username: this.formData.username,
            status: this.formData.status,
            // เพิ่มข้อมูล taxonomy terms
            taxonomy_terms: this.selectedTaxonomyTerms,
          },
        };
        
        this.activeBlock = true;
        const { status } = await Request.PUT(
          `user/${this.formData._id}`,
          requestBody,
          this.config.key
        );
        console.log(status);
        this.activeBlock = false;

        dialog.prompt({
          title: "แก้ไขข้อมูล",
          message: "บันทึกข้อมูลสมาชิกเรียบร้อยแล้ว",
          confirm: async () => {
            await this.getData();
            this.editMode = false;
            // อัพเดตข้อมูล member prop ด้วย
            this.$emit('member-updated', { ...this.formData, taxonomy_terms: this.selectedTaxonomyTerms });
          },
          cancel: () => {},
        });
      } catch (error) {
        this.activeBlock = false;
        console.error("Error saving data:", error);
        dialog.prompt({
          title: "เกิดข้อผิดพลาด",
          message: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง",
          confirm: async () => {},
          cancel: () => {},
        });
      }
    },
    async resetPassword(newpass) {
      try {
        // Validation
        if (!newpass || newpass.length < 6) {
          dialog.prompt({
            title: "เกิดข้อผิดพลาด",
            message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
            confirm: async () => {},
            cancel: () => {},
          });
          return;
        }
        
        this.activeBlock = true;
        
        // สร้าง salt และ hash รหัสผ่านด้วย CryptoJS
        const salt = CryptoJS.lib.WordArray.random(16);
        const hash = CryptoJS.SHA256(newpass + salt).toString();
        
        // Check if the username is an email address
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.username);
        // If it's an email, convert it to lowercase
        const username = isEmail
          ? this.formData.username.toLowerCase()
          : this.formData.username;

        const requestBody = {
          data: {
            password: hash,
            email: this.formData.email.toLowerCase(),
            username: username,
            salt: salt.toString(),
          },
        };
        
        const { status } = await Request.PUT(
          `user/${this.formData._id}`,
          requestBody,
          this.config.key
        );
        
        this.activeBlock = false;
        
        if (status === 200) {
          dialog.prompt({
            title: "รีเซ็ตรหัสผ่านเรียบร้อยแล้ว",
            message: "แจ้งผู้สมัครให้สามารถใช้รหัสผ่านใหม่ ในการเข้าสู่ระบบ !",
            confirm: async () => {},
            cancel: () => {},
          });
        } else {
          dialog.prompt({
            title: "เกิดข้อผิดพลาด",
            message: "ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองอีกครั้ง",
            confirm: async () => {},
            cancel: () => {},
          });
        }
      } catch (error) {
        this.activeBlock = false;
        console.error("Error resetting password:", error);
        dialog.prompt({
          title: "เกิดข้อผิดพลาด",
          message: "ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองอีกครั้ง",
          confirm: async () => {},
          cancel: () => {},
        });
      }
    },
    // ปรับปรุง method สำหรับ taxonomy ให้ใช้ API ใหม่
    getTermDisplayName(termId) {
      console.log('Getting term display name for:', termId);
      console.log('Taxonomy state:', this.taxonomyState);
      console.log('Available terms:', this.taxonomyState?.terms || []);
      
      // ตรวจสอบว่า taxonomy พร้อมใช้งานหรือไม่
      if (!this.taxonomyState?.isReady) {
        console.warn('Taxonomy not ready yet, returning fallback');
        return `รายการ ${termId}`;
      }
      
      // หา term จาก state โดยตรง
      const term = this.taxonomyState.terms.find(t => t._id === termId);
      if (!term) {
        console.warn(`⚠️ ไม่พบ term ID: ${termId}`);
        return `รายการ ${termId}`;
      }
      
      // ลำดับความสำคัญในการหาชื่อ
      const displayName = term.customData?.name || 
                         term.customData?.ชื่อ || 
                         term.customData?.title ||
                         term.name || 
                         term.code ||
                         'ไม่มีชื่อ';
      
      console.log(`📄 Display name for term '${termId}':`, displayName);
      return displayName;
    },

    getTermGroupName(termId) {
      console.log('Getting group name for term:', termId);
      console.log('Taxonomy state:', this.taxonomyState);
      
      // ตรวจสอบว่า taxonomy พร้อมใช้งานหรือไม่
      if (!this.taxonomyState?.isReady) {
        console.warn('Taxonomy not ready yet, returning fallback');
        return 'ไม่ระบุกลุ่ม';
      }
      
      // หา term จาก state โดยตรง
      const term = this.taxonomyState.terms.find(t => t._id === termId);
      if (!term || !term.taxonomy) {
        console.warn(`⚠️ ไม่พบ term หรือ taxonomy group สำหรับ ID: ${termId}`);
        return 'ไม่ระบุกลุ่ม';
      }
      
      // หา group จาก state โดยตรง
      const group = this.taxonomyState.groups.find(g => g._id === term.taxonomy);
      if (!group) {
        console.warn(`⚠️ ไม่พบ group ID: ${term.taxonomy}`);
        return 'ไม่ระบุกลุ่ม';
      }
      
      const groupName = group.name || group.code || 'ไม่ระบุกลุ่ม';
      console.log(`📁 Group name for term '${termId}':`, groupName);
      return groupName;
    },
    
    // เพิ่ม method สำหรับ password strength indicator
    getPasswordStrength() {
      const password = this.newPassword;
      if (!password) return '';
      if (password.length < 6) return 'อ่อนแอ';
      if (password.length < 10) return 'ปานกลาง';
      return 'แข็งแรง';
    },
    getPasswordStrengthColor() {
      const strength = this.getPasswordStrength();
      if (strength === 'อ่อนแอ') return 'bg-red-500';
      if (strength === 'ปานกลาง') return 'bg-yellow-500';
      return 'bg-green-500';
    },
    getPasswordStrengthWidth() {
      const strength = this.getPasswordStrength();
      if (strength === 'อ่อนแอ') return '33%';
      if (strength === 'ปานกลาง') return '66%';
      return '100%';
    },

    // Method ใหม่สำหรับการจัดกลุ่ม taxonomy terms
    getGroupedTaxonomyTerms() {
      // สร้าง object สำหรับเก็บกลุ่ม terms
      const groups = {};

      // จัดกลุ่ม terms ตาม taxonomy group
      this.selectedTaxonomyTerms.forEach(termId => {
        // ตรวจสอบว่า taxonomy พร้อมใช้งานหรือไม่
        if (!this.taxonomyState?.isReady) {
          console.warn('Taxonomy not ready yet for grouping');
          return;
        }

        // หา term และ group ข้อมูล
        const term = this.taxonomyState.terms.find(t => t._id === termId);
        if (!term || !term.taxonomy) {
          console.warn(`⚠️ ไม่พบ term หรือ taxonomy group สำหรับ ID: ${termId}`);
          return;
        }

        const group = this.taxonomyState.groups.find(g => g._id === term.taxonomy);
        if (!group) {
          console.warn(`⚠️ ไม่พบ group ID: ${term.taxonomy}`);
          return;
        }

        const groupName = group.name || group.code || 'ไม่ระบุกลุ่ม';
        const groupCode = group.code || '';
        const displayName = term.customData?.name || 
                           term.customData?.ชื่อ || 
                           term.name || 
                           'ไม่มีชื่อ';

        // ถ้ายังไม่มีกลุ่มนี้ใน groups ให้สร้างใหม่
        if (!groups[group._id]) {
          groups[group._id] = {
            groupId: group._id,
            groupName: groupName,
            groupCode: groupCode,
            terms: [],
          };
        }

        // เพิ่ม term เข้าไปในกลุ่มที่ถูกต้อง
        groups[group._id].terms.push({
          termId: termId,
          displayName: displayName,
          code: term.code || '',
          description: term.customData?.description || term.meta || '',
        });
      });

      // แปลงจาก object เป็น array และเรียงลำดับกลุ่มตามชื่อ
      return Object.values(groups).sort((a, b) => a.groupName.localeCompare(b.groupName));
    },

    // Method ใหม่สำหรับการหารหัสกลุ่ม
    getTermGroupCode(termId) {
      console.log('Getting group code for term:', termId);
      
      // ตรวจสอบว่า taxonomy พร้อมใช้งานหรือไม่
      if (!this.taxonomyState?.isReady) {
        console.warn('Taxonomy not ready yet, returning fallback');
        return '';
      }
      
      // หา term จาก state โดยตรง
      const term = this.taxonomyState.terms.find(t => t._id === termId);
      if (!term || !term.taxonomy) {
        console.warn(`⚠️ ไม่พบ term หรือ taxonomy group สำหรับ ID: ${termId}`);
        return '';
      }
      
      // หา group จาก state โดยตรง
      const group = this.taxonomyState.groups.find(g => g._id === term.taxonomy);
      if (!group) {
        console.warn(`⚠️ ไม่พบ group ID: ${term.taxonomy}`);
        return '';
      }
      
      // คืนค่ารหัสกลุ่ม
      return group.code || '';
    },
  },
  async mounted() {
    try {
      // โหลดข้อมูล taxonomy ก่อนทุกอย่าง
      console.log('🔄 กำลังโหลดระบบ Taxonomy...');
      
      // ใช้ fetchTaxonomyData จาก composable
      if (this.fetchTaxonomyData) {
        await this.fetchTaxonomyData(true); // บังคับ refresh
        console.log('✅ โหลด Taxonomy เสร็จแล้ว');
      }
      
      // รอสักครู่เพื่อให้ taxonomy data โหลดเสร็จ
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.getData();
      // โหลด taxonomy terms เมื่อ component ถูกติดตั้ง
      this.loadTaxonomyTermsFromMember(this.member);
      
      this.$setPageTitle(
        this.member.firstname + " " + this.member.lastname + " / ข้อมูลส่วนตัว"
      );
    } catch (error) {
      console.error("Error in mounted:", error);
    }
  },
};
</script>

<style scoped>
.isblock {
  pointer-events: none;
  opacity: 0.5;
}

.sunblock {
  pointer-events: auto;
  opacity: 1;
}
</style>
