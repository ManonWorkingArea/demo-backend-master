<template>
  <div class="max-w-full mx-auto">
    <!-- Main Dashboard -->
    <div class="space-y-0">
      <!-- Header Section -->
      <div class="bg-white rounded-lg ">
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas', 'square-check']" class="text-white text-sm" />
              </div>
              <div>
                <h2 class="text-base font-semibold text-gray-900">แบบฟอร์ม ({{ examCount }})</h2>
                <p class="text-xs text-gray-500">{{courseData.formID}} - {{ loadStatus }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="toggleExpandForm()"
                type="button"
                class="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                <font-awesome-icon :icon="expandedForm ? ['fas', 'caret-up'] : ['fas', 'caret-down']" class="mr-1.5" />
                เลือกแบบฟอร์ม
              </button>
              <button 
                @click="refreshData" 
                class="inline-flex items-center rounded-lg border border-transparent bg-blue-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'sync']" class="mr-1.5" />
                รีเฟรชข้อมูล
              </button>
            </div>
          </div>
        </div>

        <!-- Form Selection Panel -->
        <div v-if="expandedForm" class="bg-blue-50 border-l-4 border-blue-400 p-3">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <!-- Progressive Loading Controls -->
            <div class="bg-gray-100 border-b border-gray-200 px-4 py-2">
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-600">
                  แสดง {{ visibleForm.length }} จาก {{ form.length }} แบบฟอร์ม
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="toggleLazyMode"
                    class="px-3 py-1 text-white text-xs font-semibold rounded shadow transition-colors"
                    :class="[lazy ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700']"
                  >
                    <i class="fas fa-rocket mr-1"></i>
                    {{ lazy ? 'Progressive (เปิด)' : 'แสดงทั้งหมด (ปิด)' }}
                  </button>
                </div>
              </div>
            </div>
            
            <div class="divide-y divide-gray-200">
              <div v-for="(formItem, index) in visibleForm" :key="formItem._id" class="bg-white">
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                      <a class="font-bold text-gray-900 cursor-pointer hover:text-blue-600" @click="toggleExpand(formItem._id)">
                        {{ index + 1 }}.{{ formItem.title }}
                      </a>
                    </div>
                    
                    <div class="flex items-center space-x-3 text-sm">
                      <button
                        @click="setDefaultForm(formItem._id)"
                        :class="{ 'text-green-500': formItem.default, 'text-gray-400': !formItem.default }"
                        class="inline-flex items-center"
                      >
                        <font-awesome-icon :icon="['fas', 'bookmark']" :class="{ 'text-green-500': formItem.default, 'text-gray-400': !formItem.default }" class="mr-1" />
                        Set Default
                      </button>
                      <span class="font-medium text-gray-300">&middot;</span>
                      <button
                        @click="toggleAssignForm(formItem._id, index)"
                        type="button"
                        :class="{'text-red-500': courseData.formID === formItem._id}"
                        class="inline-flex items-center font-medium text-gray-900"
                      >
                        <font-awesome-icon :icon="['far', 'circle-check']" :class="{'text-gray-500': courseData.formID !== formItem._id}" class="mr-1" />
                        {{ isFormAssigned(formItem._id) ? 'Unassign' : 'Assign' }}
                      </button>
                      <span class="font-medium text-gray-300">&middot;</span>
                      <button
                        @click="$router.push('/lesson/exam/edit/' + formItem._id + '/' + dataItem)"
                        type="button"
                        class="inline-flex items-center font-medium text-gray-900"
                      >
                        <font-awesome-icon :icon="['fas', 'pencil']" class="text-gray-500 mr-1" />
                        แก้ไข
                      </button>
                      <span class="font-medium text-gray-300">&middot;</span>
                      <button
                        @click="deleteExam(formItem._id, index)"
                        type="button"
                        class="inline-flex items-center font-medium text-gray-900"
                      >
                        <font-awesome-icon :icon="['fas', 'trash']" class="text-gray-500 mr-1" />
                        ลบ
                      </button>
                    </div>
                  </div>

                  <div v-if="expandedStatus[formItem._id]" class="mt-4">
                    <div class="bg-gray-50 rounded-lg border border-gray-200">
                      <!-- Status Management Header -->
                      <div class="bg-gray-100 border-b border-gray-200 p-3">
                        <div class="flex items-center justify-between">
                          <div>
                            <div class="flex items-center space-x-2">
                              <font-awesome-icon :icon="['fas', 'cogs']" class="text-gray-600" />
                              <p class="font-bold text-sm text-gray-900">จัดการสถานะการทำรายการ</p>
                            </div>
                            <pre class="text-xs text-gray-600 mt-1">{{ statusArray }}</pre>
                          </div>
                          <div class="flex space-x-2">
                            <button
                              @click="addStatus"
                              class="inline-flex items-center px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                            >
                              <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
                              เพิ่มสถานะใหม่
                            </button>
                            <button
                              @click="saveFormStatus(formItem._id)"
                              class="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                              <font-awesome-icon :icon="['fas', 'save']" class="mr-1.5" />
                              บันทึกข้อมูล
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Status Cards Grid -->
                      <div class="p-3">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div
                            class="bg-white border border-gray-200 rounded-sm shadow-sm"
                            v-for="(status, statusIndex) in statusArray"
                            :key="statusIndex"
                          >
                            <div class="flex flex-col">
                              <!-- Status Card Header -->
                              <div class="bg-[#dfe9ff] flex justify-between items-center p-2 border-b border-gray-200">
                                <icon-picker
                                  v-model="status.icon"
                                  :statusIndex="statusIndex"
                                  :icon="status.icon"
                                  @input="updateIcon"
                                  class="relative bg-white"
                                />
                                <div class="flex-grow px-2">
                                  <div class="text-center font-bold text-sm">{{ status.name }}</div>
                                </div>
                                <div class="flex space-x-1">
                                  <button
                                    @click="moveStatusUp(statusIndex)"
                                    :disabled="statusIndex === 0"
                                    class="p-1 text-black text-sm hover:bg-blue-100 rounded"
                                  >
                                    <font-awesome-icon :icon="['fas', 'chevron-left']" />
                                  </button>
                                  <button
                                    @click="moveStatusDown(statusIndex)"
                                    :disabled="statusIndex === statusArray.length - 1"
                                    class="p-1 text-black text-sm hover:bg-blue-100 rounded"
                                  >
                                    <font-awesome-icon :icon="['fas', 'chevron-right']" />
                                  </button>
                                  <button @click="deleteStatus(statusIndex)" class="p-1 text-black text-sm hover:bg-red-100 rounded">
                                    <font-awesome-icon :icon="['fas', 'trash']" />
                                  </button>
                                </div>
                              </div>

                              <!-- Status Card Content -->
                              <div class="p-3 space-y-3">
                                <div class="relative">
                                  <span class="input-label">ชื่อสถานะ <small class="text-red-400">(*จำเป็นต้องกรอก)</small></span>
                                  <input
                                    v-model="status.name"
                                    type="text"
                                    placeholder="ชื่อสถานะ"
                                    class="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div class="relative">
                                  <span class="input-label">รหัสสถานะ</span>
                                  <input
                                    v-model="status.code"
                                    type="text"
                                    placeholder="รหัสสถานะ"
                                    class="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div class="relative">
                                  <span class="input-label">คำอธิบาย</span>
                                  <input
                                    v-model="status.description"
                                    type="text"
                                    placeholder="คำอธิบาย"
                                    class="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>

                              <!-- Status Options -->
                              <div class="p-3 border-t border-gray-200">
                                <button @click="addOption(statusIndex)" class="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
                                  ตั้งค่าเพิ่มเติม
                                </button>
                                <div
                                  v-for="(option, optionIndex) in status.options"
                                  :key="optionIndex"
                                  class="flex items-center mt-2 space-x-2"
                                >
                                  <input
                                    type="text"
                                    v-model="status.options[optionIndex]"
                                    class="flex-1 p-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Option"
                                  />
                                  <button @click="deleteOption(statusIndex, optionIndex)" class="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors">
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progressive Loading Indicators for Forms -->
      <template v-if="lazy && expandedForm">
        <!-- Loading More Indicator -->
        <div v-if="isLoadingMore" class="flex justify-center items-center py-4 mx-6">
          <div class="flex items-center gap-3 text-blue-600">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span class="text-xs font-medium">กำลังโหลดแบบฟอร์มเพิ่ม...</span>
          </div>
        </div>
        
        <!-- All Items Loaded -->
        <div v-else-if="!hasMoreItems && form.length > initialDisplayCount" class="flex justify-center items-center py-4 mx-6">
          <div class="flex items-center gap-2 text-green-600">
            <i class="fas fa-check-circle text-sm"></i>
            <span class="text-xs font-medium">แสดงครบทั้งหมด {{ form.length }} แบบฟอร์มแล้ว</span>
          </div>
        </div>
        
        <!-- Auto-scroll hint for remaining items -->
        <div v-else-if="hasMoreItems && expandedForm" class="flex justify-center items-center py-3 mx-6">
          <div class="flex flex-col items-center gap-2">
            <div class="flex items-center gap-2 text-gray-500 text-xs">
              <i class="fas fa-mouse"></i>
              <span>เลื่อนลงเพื่อดูแบบฟอร์มเพิ่ม (เหลือ {{ form.length - currentDisplayCount }} รายการ)</span>
            </div>
            <div class="flex gap-2">
              <!-- Manual Load More Button for Testing -->
              <button
                @click="loadMoreItems"
                class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                :disabled="isLoadingMore"
              >
                <i class="fas fa-plus mr-1"></i>
                โหลดเพิ่ม (+{{ loadMoreCount }})
              </button>
              <!-- Emergency show all button -->
              <button
                @click="currentDisplayCount = form.length"
                class="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                title="กรณีที่ auto-scroll ไม่ทำงาน"
              >
                <i class="fas fa-eye mr-1"></i>
                แสดงทั้งหมดเลย
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Data Status Component -->
      <div v-if="loadStatus" class="bg-white">
        <data-status 
          :status-array="formStatus" 
          :all-item-badge="allitemCount" 
          :update-trigger="updateTrigger"
          :active-status="currentActiveStatus"
          @status-selected="handleStatusSelected"
          @update-status="handleStatusUpdate" 
          :debug="false"
        />
      </div>

      <!-- Data Submit Component -->
      <div v-if="loadStatus" class="bg-white ">
        <data-submit 
          :form="formAssign._id" 
          :course="courseData._id" 
          :parent="courseData" 
          :status="formAssign.status" 
          :active-form-status="selectedStatusFromFirstChild" 
          :return-form-status="returnStatusArray"
          @update-viewer="updateStatusViewer"
          :debug="false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import dataStatus from "./FormStatus.vue";
import dataSubmit from "./FormSubmit.vue";
import IconPicker from "./IconPicker.vue";

export default {
  props: {
    examCount: Number,
    courseData: Object,
    dataItem: String,
    examData: Array,
    examTypeProp: Array, // Rename the prop to examTypeProp
    tabs: Object,
  },
  data() {
    return {
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      expandedStatus: {}, // Store the expanded state for each exam
      form:[],
      formAssign:[],
      expandedForm:false,
      loadStatus:false,
      updateTrigger:false,
      statusArray: [],
      formStatus: [],
      codeArray:[],
      returnStatusArray: [],
      newStatus: {
        name: '',
        description: '',
        code: '',
        icon: '',
      },
      selectedStatusFromFirstChild: null,
      allitemCount:0,
      currentActiveStatus:'all',

      // Performance & Progressive Loading Options  
      activeBlock: false,
      lazy: true,
      initialDisplayCount: 20,
      loadMoreCount: 10,
      currentDisplayCount: 20,
      isLoadingMore: false,
      scrollCleanup: null,
    };
  },
  components: {
    dataStatus,
    dataSubmit,
    IconPicker
  },
  async mounted() {
    try {
      await this.getForm();
      await this.aggregateFormCounts();
      
      // Setup lazy loading scroll detection
      if (this.lazy) {
        this.$nextTick(() => {
          this.setupScrollDetection();
        });
      }
    } catch (error) {
      console.error(error); // Use the 'error' object, not 'Error'
    }
  },
  beforeUnmount() {
    // Cleanup scroll listener
    if (this.scrollCleanup) {
      this.scrollCleanup();
    }
  },
  methods: {
    async updateStatusViewer(data) {
      await this.getForm(false); // Wait for getForm to complete
      this.currentActiveStatus = data.status
    },
    handleStatusUpdate(statusObject) {
      this.returnStatusArray = statusObject;
      //('Received status update:', this.returnStatusArray);
    },
    updateStatusBadges(dynamicStatusArray, countsByCode) {
      return dynamicStatusArray.map(status => {
        const badgeCount = countsByCode[status.code] || 0;
        return {
          ...status,
          badge: badgeCount,
        };
      });
    },
    async countStatus() {
      try {
        // สร้าง object สำหรับเก็บจำนวนแต่ละสถานะ เริ่มต้นที่ 0
        const defaultCounts = {};
        this.codeArray.forEach(code => {
          defaultCounts[code] = 0;
        });

        const groupStage = {
          $group: {
            _id: null,
            total: { $sum: 1 },
            byStatus: {
              $push: {
                status: { $ifNull: ["$process", "processing"] },
                count: { $literal: 1 }
              }
            }
          }
        };

        const pipeline = [
          {
            $match: {
              formID: this.formAssign._id,
              courseID: this.courseData._id
            }
          },
          groupStage
        ];

        const requestBody = {
          pipeline: pipeline
        };

        console.log(`⏱️ countStatus started - FormID: ${this.formAssign._id}, CourseID: ${this.courseData._id}`);

        const { data, status } = await this.$Request.POST(`form/aggregate`, requestBody, this.configs.key);

        if (status === 200 && data.length > 0) {
          const result = data[0];
          
          // รวมจำนวนตาม status
          const statusCounts = { ...defaultCounts };
          result.byStatus.forEach(item => {
            const status = item.status || "processing";
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });

          // อัพเดท badges
          this.formStatus = this.updateStatusBadges(this.formStatus, statusCounts);
          this.allitemCount = result.total;

          console.log("Status counts:", statusCounts);
        }
      } catch (error) {
        console.error("Error in countStatus:", error);
      }
    },
    handleStatusSelected(selectedStatus) {
      //console.log("Selected Status in Parent:", selectedStatus);
      this.selectedStatusFromFirstChild = selectedStatus;
    },
    toggleAssignForm(formID, index) {
      if (this.isFormAssigned(formID)) {
        this.assignForm(null, index);
      } else {
        this.assignForm(formID, index);
      }
    },
    isFormAssigned(formID) {
      return this.courseData.formID === formID;
    },
    async assignForm(formID, index) {
      try {
        const formItem = this.form[index];
        if (formItem.default || !this.courseData) {
          console.error('Cannot assign the cerification to the course.');
          //return;
        }

        const requestData = {
          data: {
            formID: formID,
          },
        };

        const resAPIUpdateCourse = await Request.PUT(`course/${this.courseData._id}`, requestData, this.configs.key);

        if (resAPIUpdateCourse.status === 200) {
          //this.callParentFunction();
          await this.getForm();
        } else {
          console.error('Error assigning cerification to the course:', resAPIUpdateCourse.statusText);
        }
      } catch (error) {
        console.error('An error occurred while assigning the cerification to the course:', error);
        throw error;
      }
    },
    async setDefaultForm(selectedFormItemId) {
      this.form.forEach(async (formItem) => {
        if (formItem._id === selectedFormItemId) {
          this.selectedFormItem = formItem
          formItem.default = true;
          await this.updateForm(formItem, true);
        } else {
          this.selectedFormItem = formItem
          formItem.default = false;
          await this.updateForm(formItem, false);
        }
      });
    },
    async updateForm(formItem,mode) {
      try {
        const requestData = {
          data: {
            default:mode
          },
        };
        const resAPIupdateForm = await Request.PUT(
          `post/${this.selectedFormItem._id}`,
          requestData,
          this.configs.key
        );

        if (resAPIupdateForm.status === 200) {
          await this.getForm();
        } else {
          console.error('Error updating cerification:', resAPIupdateForm.statusText);
        }
      } catch (error) {
        console.error('An error occurred while updating cerification:', error);
        throw error;
      }
    },
    async saveFormStatus(id) {
      try {
        const requestData = {
          data: {
            status:this.statusArray
          },
        };
        const resAPIupdateForm = await Request.PUT(
          `post/${id}`,
          requestData,
          this.configs.key
        );

        if (resAPIupdateForm.status === 200) {
          await this.getForm();
        } else {
          console.error('Error updating cerification:', resAPIupdateForm.statusText);
        }
      } catch (error) {
        console.error('An error occurred while updating cerification:', error);
        throw error;
      }
    },
    async getForm() {
      const startTime = performance.now();
      try {
        console.log(`⏱️ getForm started - Fetching forms for user: ${this.session.current._id}`);

        const requestData = {
          method: 'find',
          args: [{ $and: [{ owner: this.session.current._id, type: 'form', action: 'course' }] }],
        };

        const mongoStartTime = performance.now();
        const resAPISurvey = await Request.POST('post/query', requestData, this.configs.key);
        const mongoEndTime = performance.now();
        const mongoTime = (mongoEndTime - mongoStartTime).toFixed(2);

        if (resAPISurvey.status !== 200) {
          throw new Error(`Failed to fetch form data from API`);
        }

        const transformStartTime = performance.now();
        this.form = resAPISurvey.data;

        if (this.courseData.formID) {
          await this.getAssignForm(this.courseData.formID);
        } else {
          // Find the first form with 'default' set to true, if available
          const formItemsWithDefaultTrue = this.form.filter((formItem) => formItem.default === true);
          if (formItemsWithDefaultTrue.length > 0) {
            this.setFormAssignData(formItemsWithDefaultTrue[0]);
          }
        }

        const transformEndTime = performance.now();
        const transformTime = (transformEndTime - transformStartTime).toFixed(2);

        // Reset display count สำหรับ lazy loading
        if (this.lazy) {
          this.resetDisplayCount();
        }

        const endTime = performance.now();
        const processingTime = (endTime - startTime).toFixed(2);
        
        console.log(`✅ getForm completed - Total: ${processingTime}ms`);
        console.log(`📈 Performance breakdown:`);
        console.log(`  🗄️  MongoDB Processing: ${mongoTime}ms`);
        console.log(`  🔄 Data Transformation: ${transformTime}ms`);
        console.log(`  📊 Forms loaded: ${this.form.length}`);

      } catch (error) {
        const endTime = performance.now();
        const processingTime = (endTime - startTime).toFixed(2);
        console.log(`❌ getForm error - Time: ${processingTime}ms, Error:`, error);
        console.error('An error occurred while fetching form data:', error);
      }
    },
    async getAssignForm(formID) {
      try {
        const { status, data } = await this.$Request.GET(`post/${formID}`, this.configs.key);

        if (status === 200) {
          this.setFormAssignData(data); // Call the helper method to set form data
        }
      } catch (error) {
        console.log(error);
      }
    },
    // Helper method to set formAssign data and related fields
    setFormAssignData(formItem) {
      console.log("formItem",formItem.status);
      this.formAssign = formItem;
      
      this.formStatus = Array.isArray(formItem.status) 
      ? formItem.status.filter(item => typeof item === 'object' && item.icon) 
      : [];
      this.statusArray = [...this.formStatus];
      this.codeArray = this.formStatus.map((status) => status.code); // Extract codes from the status array
      this.loadStatus = true;
      this.countStatus(); // Call countStatus to update the status counts
    },
    toggleExpand(examId) {
      //console.log("Expand",this.expandedStatus);
      this.expandedStatus[examId] = !this.expandedStatus[examId];
    },
    toggleExpandForm() {
      this.expandedForm = !this.expandedForm;
    },
    isExpanded(examId) {
      return this.expandedStatus[examId];
    },
    updateIcon({ icon, statusIndex }) {
      this.statusArray[statusIndex].icon = icon;
    },
    isDuplicateCode() {
      const codeSet = new Set();

      for (const status of this.statusArray) {
        if (codeSet.has(status.code)) {
          return true;
        }
        codeSet.add(status.code);
      }

      return false;
    },
    addStatus() {
      //const hasDuplicateCode = this.isDuplicateCode();
      const hasDuplicateCode = false;

      if (!hasDuplicateCode) {
        this.statusArray.push({
          name: this.newStatus.name,
          description: this.newStatus.description,
          code: this.newStatus.code,
          icon: this.newStatus.icon,
          options: [],
        });

        this.newStatus.name = '';
        this.newStatus.description = '';
        this.newStatus.code = '';
        this.newStatus.icon = '';
      } else {
        alert('Status with a duplicate code already exists!');

        if (this.statusArray.length > 0) {
          this.statusArray[this.statusArray.length - 1].code = '';
        }
      }
    },
    deleteStatus(statusIndex) {
      this.statusArray.splice(statusIndex, 1);
    },
    addOption(statusIndex) {
      this.statusArray[statusIndex].options.push("");
    },
    deleteOption(statusIndex, optionIndex) {
      this.statusArray[statusIndex].options.splice(optionIndex, 1);
    },
    moveStatusUp(statusIndex) {
      if (statusIndex > 0) {
        const temp = this.statusArray[statusIndex];
        this.statusArray[statusIndex] = this.statusArray[statusIndex - 1];
        this.statusArray[statusIndex - 1] = temp;
      }
    },
    moveStatusDown(statusIndex) {
      if (statusIndex < this.statusArray.length - 1) {
        const temp = this.statusArray[statusIndex];
        this.statusArray[statusIndex] = this.statusArray[statusIndex + 1];
        this.statusArray[statusIndex + 1] = temp;
      }
    },

    // =============== Progressive/Lazy Loading Methods ===============
    loadMoreItems() {
      if (!this.lazy || this.isLoadingMore || !this.hasMoreItems) return;
      
      this.isLoadingMore = true;
      console.log(`📦 Auto-loading more form items: ${this.currentDisplayCount} + ${this.loadMoreCount}`);
      
      setTimeout(() => {
        const newCount = Math.min(
          this.currentDisplayCount + this.loadMoreCount,
          this.form.length
        );
        this.currentDisplayCount = newCount;
        this.isLoadingMore = false;
        console.log(`✅ Auto-loaded more form items. Showing: ${this.currentDisplayCount}/${this.form.length}`);
        
        // ถ้ายังมีเหลืออยู่ และใกล้จะหมด ให้โหลดต่อทันที
        if (this.hasMoreItems && (this.form.length - this.currentDisplayCount) <= this.loadMoreCount) {
          console.log(`🚀 Near end, loading remaining form items...`);
          setTimeout(() => {
            this.loadMoreItems();
          }, 100);
        }
      }, 150);
    },
    
    setupScrollDetection() {
      if (!this.lazy) return;
      
      this.$nextTick(() => {
        // ลองหา scroll container หลายรูปแบบ
        const possibleContainers = [
          this.$el?.querySelector('.overflow-y-auto'),
          this.$el?.querySelector('.bg-blue-50'),
          document.querySelector('.overflow-y-auto'),
          document.querySelector('[data-content]'),
          document.querySelector('.divide-y'),
          document.body,
          window
        ];
        
        let scrollContainer = null;
        for (const container of possibleContainers) {
          if (container && container !== document.body) {
            scrollContainer = container;
            break;
          }
        }
        
        if (!scrollContainer) {
          console.warn('Form scroll container not found, using window');
          scrollContainer = window;
        }
        
        console.log(`📋 Form using scroll container:`, scrollContainer === window ? 'window' : scrollContainer);
        
        const handleScroll = () => {
          if (!this.hasMoreItems || this.isLoadingMore) return;
          
          let scrollPercent;
          
          if (scrollContainer === window) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            scrollPercent = (scrollTop + clientHeight) / scrollHeight;
          } else {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            scrollPercent = (scrollTop + clientHeight) / scrollHeight;
          }
          
          // 🎯 เปลี่ยนจาก 60% เป็น 80% เพื่อให้ scroll มากกว่าถึงจะ auto-load
          if (scrollPercent > 0.8) {
            console.log(`📊 Form scroll reached ${(scrollPercent * 100).toFixed(1)}%, auto-loading more items...`);
            this.loadMoreItems();
          }
        };
        
        // ติดตั้ง scroll listeners
        const containers = [scrollContainer];
        if (scrollContainer !== window) {
          containers.push(window);
          containers.push(document.body);
        }
        
        containers.forEach(container => {
          container.addEventListener('scroll', handleScroll, { passive: true });
          container.addEventListener('wheel', handleScroll, { passive: true });
        });
        
        // 🎯 เปลี่ยน fallback timer จาก 2 วินาที เป็น 5 วินาที เพื่อให้ช้าลง
        const autoLoadTimer = setInterval(() => {
          if (this.hasMoreItems && !this.isLoadingMore) {
            console.log(`⏰ Form fallback timer triggered auto-load`);
            this.loadMoreItems();
          } else if (!this.hasMoreItems) {
            clearInterval(autoLoadTimer);
            console.log(`✅ All form items loaded, clearing fallback timer`);
          }
        }, 5000); // เปลี่ยนจาก 2000ms เป็น 5000ms
        
        // เก็บ reference เพื่อ cleanup
        this.scrollCleanup = () => {
          containers.forEach(container => {
            container.removeEventListener('scroll', handleScroll);
            container.removeEventListener('wheel', handleScroll);
          });
          clearInterval(autoLoadTimer);
        };
        
        console.log(`✅ Form scroll detection setup complete with 80% trigger + 5s fallback timer`);
        
        // 🎯 เปลี่ยน auto-trigger จาก 1 วินาที เป็น 3 วินาที
        setTimeout(() => {
          if (this.hasMoreItems && !this.isLoadingMore) {
            console.log(`🚀 Form initial auto-load trigger (delayed)`);
            this.loadMoreItems();
          }
        }, 3000); // เปลี่ยนจาก 1000ms เป็น 3000ms
      });
    },
    
    resetDisplayCount() {
      this.currentDisplayCount = this.initialDisplayCount;
      this.isLoadingMore = false;
      
      // 🎯 เปลี่ยนจาก <= 50 เป็น <= 10 เพื่อให้ progressive loading ทำงานกับข้อมูลมากขึ้น
      if (this.form.length <= 10) {
        console.log(`📊 Very small form dataset (${this.form.length} items), showing all immediately`);
        this.currentDisplayCount = this.form.length;
      } else {
        console.log(`📊 Form dataset (${this.form.length} items), using progressive loading - Initial: ${this.initialDisplayCount}`);
        // ❌ ปิด auto-load ทันทีหลัง reset เพื่อให้ user เห็นการทำงาน
        // setTimeout(() => {
        //   if (this.hasMoreItems && !this.isLoadingMore) {
        //     console.log(`🚀 Form auto-triggering first load after reset`);
        //     this.loadMoreItems();
        //   }
        // }, 500);
      }
    },
    
    toggleLazyMode() {
      this.lazy = !this.lazy;
      console.log(`🔄 Form lazy rendering: ${this.lazy ? 'Enabled' : 'Disabled'}`);
      
      if (this.lazy) {
        this.resetDisplayCount();
        this.$nextTick(() => {
          this.setupScrollDetection();
        });
      } else {
        if (this.scrollCleanup) {
          this.scrollCleanup();
        }
      }
    },
    async aggregateFormCounts() {
      try {
        if (!this.formAssign._id || !this.courseData._id) {
          console.warn('Missing required IDs for form counts');
          return;
        }

        const pipeline = [
          {
            $match: {
              formID: this.formAssign._id,
              courseID: this.courseData._id
            }
          },
          {
            $facet: {
              total: [
                { $count: "count" }
              ],
              byStatus: [
                {
                  $group: {
                    _id: "$process",
                    count: { $sum: 1 }
                  }
                }
              ]
            }
          }
        ];

        const requestBody = {
          pipeline: pipeline
        };

        console.log(`⏱️ aggregateFormCounts started - FormID: ${this.formAssign._id}, CourseID: ${this.courseData._id}`);

        const { data, status } = await this.$Request.POST(`form/aggregate`, requestBody, this.configs.key);

        if (status === 200 && data && data[0]) {
          const result = data[0];
          const totalCount = result.total[0]?.count || 0;
          const statusCounts = {};

          // Initialize all status counts to 0
          this.formStatus.forEach(status => {
            statusCounts[status.code] = 0;
          });

          // Update counts from aggregation results
          result.byStatus.forEach(item => {
            if (item._id) {
              statusCounts[item._id] = item.count;
            }
          });

          // Update badges for each status
          this.formStatus = this.formStatus.map(status => ({
            ...status,
            badge: statusCounts[status.code] || 0
          }));

          this.allitemCount = totalCount;
          
          console.log(`✅ Form counts updated - Total: ${totalCount}`, statusCounts);
        }
      } catch (error) {
        console.error('Error in aggregateFormCounts:', error);
      }
    },
    async refreshData() {
      try {
        // รีเซ็ตข้อมูลทั้งหมด
        this.form = [];
        this.formAssign = [];
        this.formStatus = [];
        this.statusArray = [];
        this.codeArray = [];
        this.allitemCount = 0;
        this.loadStatus = false;
        
        // โหลดข้อมูลใหม่
        await this.getForm();
        
        if (this.courseData.formID) {
          await this.getAssignForm(this.courseData.formID);
        }
        
        // อัพเดทจำนวน
        await this.countStatus();
        
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          icon: 'success',
          title: 'รีเฟรชข้อมูล',
          text: 'อัพเดทข้อมูลเรียบร้อยแล้ว',
        });
      } catch (error) {
        console.error('Error refreshing data:', error);
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถรีเฟรชข้อมูลได้',
        });
      }
    },
  },
  computed: {
    // Progressive/Lazy rendering computed
    visibleForm() {
      if (!this.lazy) {
        console.log(`👁️ Showing ALL forms (lazy disabled): ${this.form.length} items`);
        return this.form; // แสดงทั้งหมดถ้าไม่ใช้ lazy
      }
      const visible = this.form.slice(0, this.currentDisplayCount);
      console.log(`👁️ Showing forms: ${visible.length}/${this.form.length} (displayCount: ${this.currentDisplayCount})`);
      return visible;
    },
    
    hasMoreItems() {
      const hasMore = this.lazy && this.currentDisplayCount < this.form.length;
      if (this.lazy) {
        console.log(`❓ hasMoreItems: ${hasMore} (displayCount: ${this.currentDisplayCount}, total: ${this.form.length})`);
      }
      return hasMore;
    },
  }
};
</script>

<style scoped>
.input-label{
    font-size: 12px;
    background: #fff;
    position: absolute;
    left: 5px;
    top: -8px;
    padding-left: 2px;
    padding-right: 5px;
    color: #c2c2c2;
}
</style>
  