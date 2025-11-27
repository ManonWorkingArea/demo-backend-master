<template>
  <!-- Header Section -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas','certificate']" class="text-white text-sm" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">ใบรับรอง</h2>
            <p class="text-xs text-gray-500">จัดการใบรับรองของหลักสูตร ({{ certList.length }} รายการ)</p>
          </div>
        </div>
        <button
          @click="saveCertConfig"
          type="button"
          class="inline-flex items-center rounded-lg border border-transparent bg-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          เพิ่มใบรับรอง
        </button>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="bg-blue-50 border-l-4 border-blue-400 p-3">
      <div class="flex">
        <div class="flex-shrink-0">
          <font-awesome-icon :icon="['fas','info-circle']" class="text-blue-400 text-sm" />
        </div>
        <div class="ml-2">
          <p class="text-xs text-blue-700">
            <strong>หมายเหตุ:</strong> หากไม่มีการ Assign ใบรับรองให้กับหลักสูตรนี้ หากหลักสูตรนี้มีการตั้งค่าให้แสดง ระบบจะดึงใบรับรองที่ถูกตั้งค่าเป็น "Default" มาใช้แสดงผล
          </p>
        </div>
      </div>
    </div>

    <!-- Certificate List -->
    <div class="p-4">
      <div v-if="certList.length === 0" class="text-center py-8">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <font-awesome-icon :icon="['fas','certificate']" class="text-gray-400 text-lg" />
        </div>
        <h3 class="text-base font-medium text-gray-900 mb-2">ยังไม่มีใบรับรอง</h3>
        <p class="text-sm text-gray-500 mb-4">เริ่มต้นสร้างใบรับรองสำหรับหลักสูตรนี้</p>
        <button
          @click="saveCertConfig"
          type="button"
          class="inline-flex items-center rounded-lg border border-transparent bg-purple-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          สร้างใบรับรองแรก
        </button>
      </div>

      <div v-else class="space-y-3">
        <div 
          v-for="(certItem, index) in certList" 
          :key="certItem._id" 
          class="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
        >
          <div class="p-4">
            <!-- Certificate Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <!-- Thumbnail or Icon -->
                  <div v-if="certItem.pages && certItem.pages[0] && certItem.pages[0].backgroundImage" 
                       class="certificate-thumbnail group cursor-pointer w-12 h-12"
                       @click="toggleExpand(certItem)"
                       :title="`ดูตัวอย่าง ${certItem.name}`">
                    <img 
                      :src="certItem.pages[0].backgroundImage" 
                      :alt="certItem.name"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                    />
                    <div class="certificate-thumbnail-overlay">
                      <font-awesome-icon :icon="['fas','eye']" class="thumbnail-icon text-sm" />
                    </div>
                  </div>
                  <div v-else 
                       class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-200 transition-colors"
                       @click="toggleExpand(certItem)"
                       :title="`แก้ไข ${certItem.name}`">
                    <font-awesome-icon :icon="['fas','certificate']" class="text-purple-600 text-base" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-1">
                    <!-- Editable Certificate Name -->
                    <div v-if="editingCertId === certItem._id" class="flex items-center space-x-2 flex-1">
                      <span class="text-base font-semibold text-gray-900">{{ index + 1 }}.</span>
                      <input
                        :ref="`nameInput_${certItem._id}`"
                        v-model="editingCertName"
                        @blur="saveNameEdit(certItem)"
                        @keyup.enter="saveNameEdit(certItem)"
                        @keyup.escape="cancelNameEdit"
                        class="flex-1 text-base font-semibold bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ชื่อใบรับรอง"
                      />
                      <button
                        @click="saveNameEdit(certItem)"
                        class="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                        title="บันทึก">
                        <font-awesome-icon :icon="['fas','check']" class="text-sm" />
                      </button>
                      <button
                        @click="cancelNameEdit"
                        class="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                        title="ยกเลิก">
                        <font-awesome-icon :icon="['fas','times']" class="text-sm" />
                      </button>
                    </div>
                    
                    <!-- Display Certificate Name -->
                    <div v-else class="flex items-center space-x-2 flex-1 group">
                      <h3 class="text-base font-semibold text-gray-900">
                        {{ index + 1 }}. {{ certItem.name }}
                      </h3>
                      <button
                        @click="startNameEdit(certItem)"
                        class="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="แก้ไขชื่อ">
                        <font-awesome-icon :icon="['fas','edit']" class="text-xs" />
                      </button>
                    </div>
                    
                    <span v-if="certItem.default" 
                          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <font-awesome-icon :icon="['fas','star']" class="mr-1 text-xs" />
                      Default
                    </span>
                    <span v-if="courseData.certificationId === certItem._id" 
                          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <font-awesome-icon :icon="['fas','check-circle']" class="mr-1 text-xs" />
                      Assigned
                    </span>
                  </div>
                  
                  <!-- Certificate Stats -->
                  <div class="flex items-center space-x-3 text-xs text-gray-500">
                    <span class="flex items-center">
                      <font-awesome-icon :icon="['fas','star']" class="mr-1 text-xs" />
                      คะแนน: <span class="font-medium text-gray-900 ml-1">{{ certItem.score || 'ไม่ระบุ' }}</span>
                    </span>
                    <span class="text-gray-300">•</span>
                    <span class="flex items-center">
                      <font-awesome-icon :icon="['fas','file-alt']" class="mr-1 text-xs" />
                      หน้า: <span class="font-medium text-gray-900 ml-1">{{ certItem.pages ? certItem.pages.length : 0 }}</span>
                    </span>
                    <span class="text-gray-300">•</span>
                    <span class="certificate-stat-badge" 
                          :class="certItem.pages && certItem.pages[0] && certItem.pages[0].backgroundImage ? 'has-background' : 'no-background'">
                      <font-awesome-icon :icon="['fas', certItem.pages && certItem.pages[0] && certItem.pages[0].backgroundImage ? 'image' : 'image-slash']" class="mr-1 text-xs" />
                      {{ certItem.pages && certItem.pages[0] && certItem.pages[0].backgroundImage ? 'มีพื้นหลัง' : 'ไม่มีพื้นหลัง' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-200">
              <div class="flex items-center space-x-2">
                <button
                  @click="setDefaultCert(certItem._id)"
                  :class="{ 
                    'text-green-600 bg-green-50 border-green-200': certItem.default, 
                    'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100': !certItem.default 
                  }"
                  class="inline-flex items-center px-2.5 py-1 border rounded-md text-xs font-medium transition-colors"
                >
                  <font-awesome-icon :icon="['fas','bookmark']" class="mr-1 text-xs" />
                  {{ certItem.default ? 'Default' : 'ตั้งเป็น Default' }}
                </button>

                <button
                  @click="toggleAssignCert(certItem._id, index)"
                  :class="{ 
                    'text-blue-600 bg-blue-50 border-blue-200': courseData.certificationId === certItem._id,
                    'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100': courseData.certificationId !== certItem._id
                  }"
                  class="inline-flex items-center px-2.5 py-1 border rounded-md text-xs font-medium transition-colors"
                >
                  <font-awesome-icon :icon="['fas','link']" class="mr-1 text-xs" />
                  {{ isCertAssigned(certItem._id) ? 'Unassign' : 'Assign' }}
                </button>
              </div>

              <div class="flex items-center space-x-1">
                <button 
                  @click="toggleExpand(certItem)"
                  type="button" 
                  class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  <font-awesome-icon :icon="['fas','edit']" class="mr-1 text-xs" />
                  แก้ไข
                </button>
                
                <button
                  @click="cloneCert(certItem)"
                  type="button"
                  class="inline-flex items-center px-2.5 py-1 border border-blue-200 rounded-md text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <font-awesome-icon :icon="['fas','copy']" class="mr-1 text-xs" />
                  Clone
                </button>
                
                <button
                  @click="deleteCert(certItem._id, index)"
                  type="button"
                  class="inline-flex items-center px-2.5 py-1 border border-red-200 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <font-awesome-icon :icon="['fas','trash']" class="mr-1 text-xs" />
                  ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <Transition
    enter-active-class="fullscreen-modal-enter-active"
    leave-active-class="fullscreen-modal-leave-active"
    enter-from-class="fullscreen-modal-enter-from"
    leave-to-class="fullscreen-modal-leave-to"
  >
    <div v-if="showModal" class="fullscreen-modal">
      <!-- Background overlay -->
      <div class="fullscreen-modal-backdrop" @click="closeModal"></div>

      <!-- Modal panel - Full Screen -->
      <div class="fullscreen-modal-container">
        <!-- Modal header -->
        <div class="fullscreen-modal-header">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas','certificate']" class="text-purple-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">ออกแบบใบรับรอง</h3>
                <p class="text-sm text-gray-500">{{ selectedCertItem?.name || 'ใบรับรองใหม่' }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <!-- Fullscreen indicator -->
              <div class="hidden sm:flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                <font-awesome-icon :icon="['fas','expand']" class="mr-1" />
                โหมดเต็มหน้าจอ
              </div>
              <button 
                @click="closeModal" 
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="ปิด (ESC)"
              >
                <font-awesome-icon :icon="['fas','times']" class="text-xl" />
              </button>
            </div>
          </div>
        </div>

        <!-- Modal content - Full height -->
        <div class="fullscreen-modal-content">
          <CertificationBuilder 
            :certItem="selectedCertItem.pages" 
            :certName="selectedCertItem.name"
            @data-emitted="handleDataFromChild"
            class="certificate-builder-container" 
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import storageManager from '@/plugins/storage';
import CertificationBuilder from '../resource/CertificationBuilder.vue'; // Adjust the path as needed
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import debug from '@/plugins/Logger.js';
import Toast from '@/plugins/ToastUI.js';

export default {
  props: {
    courseData: Object,
    callParentFunctionProp: Function,
    tabs: Object,
    updateTabs: Object,
  },
  data() {
      return {
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        showCertConfig: false,
        certData: {},
        certList:[],
        selectedCertItem: null,
        showModal: false,
        editingCertId: null,
        editingCertName: '',
      };
  },
  components: {
      CertificationBuilder
  },
  methods: {
    async callbackFunction() {
      try {
        console.log("callbackFunction");
        await this.getSurvey();
        await this.getSurveySubmission();
      } catch (error) {
        console.error(error);
      }
    },
    updateBadge(badgeValue) {
      this.$emit('update-badge', { code: this.tabs.code, badge: badgeValue });
    },
    openModal(content) {
        this.modalContent = content;
        this.showModal = true;
        // Add body class to prevent scrolling
        document.body.classList.add('modal-open');
        // Add keyboard event listener
        document.addEventListener('keydown', this.handleKeydown);
    },
    closeModal() {
        this.modalContent = null;
        this.showModal = false;
        // Remove body class to restore scrolling
        document.body.classList.remove('modal-open');
        // Remove keyboard event listener
        document.removeEventListener('keydown', this.handleKeydown);
    },
    handleKeydown(event) {
        // Close modal on ESC key
        if (event.key === 'Escape' && this.showModal) {
          this.closeModal();
        }
    },
    handleImageError(event) {
        // Hide the broken image and show fallback icon
        const img = event.target;
        const container = img.parentElement;
        img.style.display = 'none';
        
        // Create fallback icon if it doesn't exist
        if (!container.querySelector('.certificate-thumbnail-fallback')) {
          const fallback = document.createElement('div');
          fallback.className = 'certificate-thumbnail-fallback';
          fallback.innerHTML = '<i class="fas fa-certificate text-purple-600 text-sm"></i>';
          container.appendChild(fallback);
        }
    },
    callParentFunction() {
        if (typeof this.callParentFunctionProp === 'function') {
        this.callParentFunctionProp();
        }
    },
    async handleDataFromChild(childData) {
        debug.log('Data received from child component:', childData);
        await this.updateCert(childData,true);
    },
    async saveCertConfig() {
          try {
              this.certData.name = 'Certification Name';
              this.certData.description = 'Certification Description';
              this.certData.default = false;

              const pagesData = [{
                  landscapeMode: true,
                  padding: '1cm',
                  name: 'Page 1',
                  backgroundImage: '',
                  elements: [],
              }];

              this.certData.pages = pagesData;

              const requestData = {
              data: {
                  ...this.certData,
                  unit: this.session.current._id,
              },
              };

              const resAPILogin = await Request.POST('certification_template', requestData, this.configs.key);

              if (resAPILogin.status === 200) {
              await this.getCert();
              this.toggleExpand(resAPILogin.data);
              } else {
              console.error('Error saving certification configuration:', resAPILogin.statusText);
              }
          } catch (error) {
              console.error('An error occurred while saving certification configuration:', error);
          }
      },
    async getCert() {
      try {
        const requestData = {
          method: 'find',
          args: [{ $and: [{ unit: this.session.current._id }] }],
        };

        const resAPICert = await Request.POST('certification_template/query', requestData, this.configs.key);

        if (resAPICert.status !== 200) {
          throw new Error(`Failed to fetch player data from API`);
        }
        debug.log("resAPICert",resAPICert.data);
        this.certList = resAPICert.data
      } catch (error) {
        console.error('An error occurred while fetching player data:', error);
        throw error;
      }
    },
    async setDefaultCert(selectedCertItemId) {
      this.certList.forEach(async (certItem) => {
        if (certItem._id === selectedCertItemId) {
          this.selectedCertItem = certItem
          certItem.default = true;
        } else {
          this.selectedCertItem = certItem
          certItem.default = false;
        }
        await this.updateCert(certItem, false);
      });
    },
    async updateCert(certItem, mode) {
      try {
        // Check if selectedCertItem exists
        if (!this.selectedCertItem) {
          console.error('No certificate item selected');
          return;
        }
        
        debug.log("selectedCertItem", this.selectedCertItem);
        const dataWithoutId = { ...this.selectedCertItem };
        delete dataWithoutId._id;
      
        let pageData;
        if (mode) {
          pageData = certItem;
        } else {
          pageData = this.selectedCertItem.pages;
        }
        
        const requestData = {
          data: {
            ...dataWithoutId,
            name: this.selectedCertItem.name,
            description: this.selectedCertItem.description,
            pages: pageData,
          },
        };

        const resAPIupdateCert = await Request.PUT(
          `certification_template/${this.selectedCertItem._id}`,
          requestData,
          this.configs.key
        );

        if (resAPIupdateCert.status === 200) {
          await this.getCert();
          
          // ถ้าเป็นการบันทึกจาก CertificationBuilder (mode = true) ไม่ต้องปิด modal
          if (mode) {
            // แสดง Toast notification แทนการปิด modal
            Toast({
              type: 'success',
              message: 'บันทึกใบรับรองสำเร็จ!',
              autohide: true
            });
          } else {
            // กรณีอื่นๆ ให้ปิด modal ตามปกติ
            this.showModal = false;
          }
        } else {
          console.error('Error updating certification:', resAPIupdateCert.statusText);
          Toast({
            type: 'error',
            message: 'เกิดข้อผิดพลาดในการบันทึก',
            autohide: true
          });
        }
      } catch (error) {
        console.error('An error occurred while updating certification:', error);
        throw error;
      }
    },
    toggleAssignCert(certItemId, index) {
      if (this.isCertAssigned(certItemId)) {
        this.assignCert(null, index);
      } else {
        this.assignCert(certItemId, index);
      }
    },
    isCertAssigned(certItemId) {
      return this.courseData.certificationId === certItemId;
    },
    toggleExpand(certItem) {
      this.selectedCertItem = certItem;
      this.showModal = true;
    },
    async assignCert(certItemId, index) {
      try {
        const certItem = this.certList[index];
        if (certItem.default || !this.courseData) {
          console.error('Cannot assign the cerification to the course.');
          return;
        }

        const requestData = {
          data: {
            certificationId: certItemId,
          },
        };

        const resAPIUpdateCourse = await Request.PUT(`course/${this.courseData._id}`, requestData, this.configs.key);

        if (resAPIUpdateCourse.status === 200) {
          this.callParentFunction();
          debug.log('Certification assigned to the course.');
        } else {
          console.error('Error assigning cerification to the course:', resAPIUpdateCourse.statusText);
        }
      } catch (error) {
        console.error('An error occurred while assigning the cerification to the course:', error);
        throw error;
      }
    },
    async deleteCert(certItemId, index) {
      try {
        const certItem = this.certList[index];
        if (certItem.default) {
          console.error('Cannot delete the default cerification.');
          return;
        }
        const resAPIdeleteCert = await Request.DELETE(`certification_template/${certItemId}`, this.configs.key);
        if (resAPIdeleteCert.status === 200) {
          this.certList.splice(index, 1);
        } else {
          console.error('Error deleting cerification item:', resAPIdeleteCert.statusText);
        }
      } catch (error) {
        console.error('An error occurred while deleting cerification item:', error);
        throw error;
      }
    },
    startNameEdit(certItem) {
      this.editingCertId = certItem._id;
      this.editingCertName = certItem.name;
      // Focus the input field after Vue updates the DOM
      this.$nextTick(() => {
        const input = this.$refs[`nameInput_${certItem._id}`];
        // Handle both single element and array cases
        const inputElement = Array.isArray(input) ? input[0] : input;
        if (inputElement && typeof inputElement.focus === 'function') {
          inputElement.focus();
          if (typeof inputElement.select === 'function') {
            inputElement.select(); // Select all text for easy replacement
          }
        }
      });
    },
    saveNameEdit(certItem) {
      certItem.name = this.editingCertName;
      this.editingCertId = null;
      this.editingCertName = '';
      
      // Update the certificate directly without relying on selectedCertItem
      this.updateCertName(certItem);
    },
    async updateCertName(certItem) {
      try {
        const dataWithoutId = { ...certItem };
        delete dataWithoutId._id;
        
        const requestData = {
          data: {
            ...dataWithoutId,
            name: certItem.name,
            description: certItem.description,
            pages: certItem.pages,
          },
        };

        const resAPIupdateCert = await Request.PUT(
          `certification_template/${certItem._id}`,
          requestData,
          this.configs.key
        );

        if (resAPIupdateCert.status === 200) {
          await this.getCert();
          // Update selectedCertItem if it matches the updated item
          if (this.selectedCertItem && this.selectedCertItem._id === certItem._id) {
            this.selectedCertItem.name = certItem.name;
          }
        } else {
          console.error('Error updating certification name:', resAPIupdateCert.statusText);
        }
      } catch (error) {
        console.error('An error occurred while updating certification name:', error);
        throw error;
      }
    },
    cancelNameEdit() {
      this.editingCertId = null;
      this.editingCertName = '';
    },
    async cloneCert(certItem) {
      try {
        // สร้างข้อมูลใหม่จากใบรับรองเดิม โดยไม่เอา _id และปรับชื่อ
        const clonedCertData = {
          name: `${certItem.name} (copy)`,
          description: certItem.description,
          default: false, // ใบรับรองที่ clone จะไม่เป็น default
          pages: JSON.parse(JSON.stringify(certItem.pages)), // Deep copy ของ pages
          unit: this.session.current._id,
        };

        const requestData = {
          data: clonedCertData,
        };

        const resAPIClone = await Request.POST('certification_template', requestData, this.configs.key);

        if (resAPIClone.status === 200) {
          await this.getCert();
          Toast({
            type: 'success',
            message: 'คัดลอกใบรับรองสำเร็จ!',
            autohide: true
          });
          // เปิด modal สำหรับแก้ไขใบรับรองที่ clone ใหม่
          this.toggleExpand(resAPIClone.data);
        } else {
          console.error('Error cloning certification:', resAPIClone.statusText);
          Toast({
            type: 'error',
            message: 'เกิดข้อผิดพลาดในการคัดลอกใบรับรอง',
            autohide: true
          });
        }
      } catch (error) {
        console.error('An error occurred while cloning certification:', error);
        Toast({
          type: 'error',
          message: 'เกิดข้อผิดพลาดในการคัดลอกใบรับรอง',
          autohide: true
        });
      }
    },
  },
  async mounted() {
    try {
      await this.getCert();
    } catch (error) {
      console.error(error); // Use the 'error' object, not 'Error'
    }
  },
  beforeUnmount() {
    // Cleanup when component is destroyed
    if (this.showModal) {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', this.handleKeydown);
    }
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
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Card Hover Effects */
.card-hover {
  @apply transition-all duration-200 hover:shadow-lg hover:scale-[1.02];
}

/* Button Enhancements */
.btn-modern {
  @apply inline-flex items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md;
}

.btn-primary-modern {
  @apply btn-modern bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500;
}

.btn-secondary-modern {
  @apply btn-modern bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500;
}

.btn-success-modern {
  @apply btn-modern bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;
}

.btn-danger-modern {
  @apply btn-modern bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
}

/* Certificate Card Animations */
.certificate-card {
  @apply transition-all duration-200 hover:shadow-md hover:-translate-y-1;
}

/* Modal Enhancements */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300;
}

.modal-content {
  @apply transform transition-all duration-300 scale-100 opacity-100;
}

.modal-enter-from .modal-content {
  @apply scale-95 opacity-0;
}

.modal-leave-to .modal-content {
  @apply scale-95 opacity-0;
}

/* Fullscreen Modal Styles */
.fullscreen-modal {
  @apply fixed inset-0 overflow-hidden;
}

.fullscreen-modal-backdrop {
  @apply fixed inset-0 bg-gray-900 bg-opacity-95 transition-opacity duration-300;
}

.fullscreen-modal-container {
  @apply fixed inset-0 flex flex-col;
}

.fullscreen-modal-header {
  @apply bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0 shadow-sm;
}

.fullscreen-modal-content {
  @apply flex-1 bg-gray-50 overflow-auto;
}

/* Certificate Builder Container */
.certificate-builder-container {
  @apply h-full w-full;
  min-height: calc(100vh - 80px); /* Subtract header height */
}

/* Modal Animation */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Fullscreen Modal Animation */
.fullscreen-modal-enter-active,
.fullscreen-modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fullscreen-modal-enter-from {
  opacity: 0;
}

.fullscreen-modal-enter-from .fullscreen-modal-container {
  transform: translateY(20px);
}

.fullscreen-modal-leave-to {
  opacity: 0;
}

.fullscreen-modal-leave-to .fullscreen-modal-container {
  transform: translateY(-20px);
}

/* Ensure modal content doesn't interfere with scrolling */
.modal-open {
  overflow: hidden;
}

/* Custom scrollbar for modal content */
.fullscreen-modal-content::-webkit-scrollbar {
  width: 8px;
}

.fullscreen-modal-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.fullscreen-modal-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.fullscreen-modal-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Badge Styles */
.badge-modern {
  @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium;
}

.badge-primary-modern {
  @apply badge-modern bg-purple-100 text-purple-800;
}

.badge-success-modern {
  @apply badge-modern bg-green-100 text-green-800;
}

.badge-warning-modern {
  @apply badge-modern bg-yellow-100 text-yellow-800;
}

.badge-danger-modern {
  @apply badge-modern bg-red-100 text-red-800;
}

.badge-info-modern {
  @apply badge-modern bg-blue-100 text-blue-800;
}

/* Loading States */
.loading-spinner {
  @apply inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin;
}

/* Gradient Backgrounds */
.gradient-bg {
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
}

.gradient-bg-light {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
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

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Utility Classes */
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}

.animate-slide-in-right {
  animation: slideInRight 0.4s ease-out;
}

.animate-slide-in-left {
  animation: slideInLeft 0.4s ease-out;
}

.animate-pulse-custom {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Responsive Design */
@media (max-width: 768px) {
  .mobile-stack {
    @apply flex-col space-y-2 space-x-0;
  }
  
  .mobile-full {
    @apply w-full;
  }
  
  .mobile-text-sm {
    @apply text-sm;
  }
  
  .mobile-p-3 {
    @apply p-3;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .dark-mode {
    @apply bg-gray-900 text-white;
  }
  
  .dark-mode .card {
    @apply bg-gray-800 border-gray-700;
  }
  
  .dark-mode .btn-secondary-modern {
    @apply bg-gray-700 hover:bg-gray-600;
  }
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-break {
    page-break-before: always;
  }
  
  .print-avoid-break {
    page-break-inside: avoid;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .high-contrast {
    @apply border-2 border-black;
  }
  
  .high-contrast button {
    @apply border-2 border-black;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus States */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500;
}

/* Aspect Ratio Utilities */
.aspect-video {
  aspect-ratio: 16 / 9;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}

/* Text Utilities */
.prose {
  @apply text-gray-700 leading-relaxed;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  @apply text-gray-900 font-semibold;
}

.prose p {
  @apply mb-4;
}

.prose ul, .prose ol {
  @apply mb-4 pl-6;
}

.prose li {
  @apply mb-2;
}

.prose a {
  @apply text-purple-600 hover:text-purple-800 underline;
}

/* Certificate specific styles */
.certificate-icon {
  @apply w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center;
}

.certificate-icon svg {
  @apply text-purple-600 text-lg;
}

/* Certificate Thumbnail Styles */
.certificate-thumbnail {
  @apply w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100;
  position: relative;
}

.certificate-thumbnail img {
  @apply w-full h-full object-cover transition-opacity duration-200;
}

.certificate-thumbnail img:hover {
  @apply opacity-90;
}

.certificate-thumbnail-fallback {
  @apply absolute inset-0 bg-purple-100 rounded-lg flex items-center justify-center;
}

.certificate-thumbnail-overlay {
  @apply absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center;
}

.certificate-thumbnail-overlay:hover .thumbnail-icon {
  @apply opacity-100;
}

.thumbnail-icon {
  @apply text-white opacity-0 transition-opacity duration-200;
}

/* Enhanced Certificate Stats */
.certificate-stat-badge {
  @apply inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium;
}

.certificate-stat-badge.has-background {
  @apply bg-green-100 text-green-800;
}

.certificate-stat-badge.no-background {
  @apply bg-gray-100 text-gray-600;
}

.certificate-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.certificate-badge.default {
  @apply bg-green-100 text-green-800;
}

.certificate-badge.assigned {
  @apply bg-blue-100 text-blue-800;
}

.certificate-stats {
  @apply flex items-center space-x-4 text-sm text-gray-500;
}

.certificate-stat-item {
  @apply flex items-center;
}

.certificate-stat-item svg {
  @apply mr-1;
}

.certificate-actions {
  @apply flex items-center justify-between pt-4 border-t border-gray-200;
}

.certificate-action-group {
  @apply flex items-center space-x-4;
}

.certificate-action-button {
  @apply inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium transition-colors;
}

.certificate-action-button.default {
  @apply text-green-600 bg-green-50 border-green-200;
}

.certificate-action-button.assigned {
  @apply text-blue-600 bg-blue-50 border-blue-200;
}

.certificate-action-button.normal {
  @apply text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100;
}

.certificate-action-button.edit {
  @apply text-gray-600 bg-white border-gray-200 hover:bg-gray-50;
}

.certificate-action-button.delete {
  @apply text-red-600 bg-red-50 border-red-200 hover:bg-red-100;
}

/* Empty state styles */
.empty-state {
  @apply text-center py-12;
}

.empty-state-icon {
  @apply w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4;
}

.empty-state-icon svg {
  @apply text-gray-400 text-2xl;
}

.empty-state-title {
  @apply text-lg font-medium text-gray-900 mb-2;
}

.empty-state-description {
  @apply text-gray-500 mb-6;
}

/* Info banner styles */
.info-banner {
  @apply bg-blue-50 border-l-4 border-blue-400 p-4;
}

.info-banner-content {
  @apply flex;
}

.info-banner-icon {
  @apply flex-shrink-0;
}

.info-banner-icon svg {
  @apply text-blue-400;
}

.info-banner-text {
  @apply ml-3;
}

.info-banner-text p {
  @apply text-sm text-blue-700;
}
</style>
