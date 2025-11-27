<template>
  <div class="space-y-4">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="text-lg font-medium text-gray-900">ตารางการจัดกิจกรรม</h3>
        <p class="text-sm text-gray-500">จัดการกำหนดการและช่วงเวลาของแต่ละกิจกรรม - วางแผนขั้นตอนการดำเนินงานตั้งแต่รับสมัครจนถึงติดตามผล</p>
      </div>
      <button
        @click="addItem"
        type="button"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
      >
        <i class="fas fa-plus text-sm"></i>
        เพิ่มรายการ
      </button>
    </div>

    <!-- Schedule Cards -->
    <div class="space-y-3" v-if="scheduleData.length > 0">
      <div
        v-for="(item, index) in scheduleData"
        :key="'card-' + (item._id || index)"
        class="bg-white border border-gray-200 rounded-lg"
        :class="{ 'ring-2 ring-blue-500 border-blue-500': item.isEditing }"
      >
        <!-- Card Header -->
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                   :class="item.taskType ? 'bg-' + getTaskTypeInfo(item.taskType).color + '-100' : 'bg-blue-100'">
                <i :class="item.taskType ? [getTaskTypeInfo(item.taskType).icon, 'text-' + getTaskTypeInfo(item.taskType).color + '-600'] : 'fas fa-calendar-alt text-blue-600'" class="text-sm"></i>
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="font-medium text-gray-900 truncate">{{ item.header || 'ไม่มีหัวข้อ' }}</h4>
                <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500 mt-1">
                  <span v-if="item.taskType" class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        :class="'bg-' + getTaskTypeInfo(item.taskType).color + '-100 text-' + getTaskTypeInfo(item.taskType).color + '-700'">
                    <i :class="[getTaskTypeInfo(item.taskType).icon]" class="text-xs"></i>
                    {{ getTaskTypeInfo(item.taskType).label }}
                  </span>
                  <span v-if="formattedStartDate(item)" class="flex items-center gap-1">
                    <i class="fas fa-play text-green-600"></i>
                    <span class="hidden sm:inline">เริ่ม:</span>
                    {{ formattedStartDate(item) }}
                  </span>
                  <span v-if="formattedEndDate(item)" class="flex items-center gap-1">
                    <i class="fas fa-stop text-red-600"></i>
                    <span class="hidden sm:inline">สิ้นสุด:</span>
                    {{ formattedEndDate(item) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                @click="toggleEdit(index)"
                type="button"
                class="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                :title="item.isEditing ? 'ยกเลิก' : 'แก้ไข'"
              >
                <i :class="item.isEditing ? 'fas fa-times' : 'fas fa-edit'" class="text-sm"></i>
              </button>
              <div class="relative">
                <button
                  @click="toggleActionMenu(index)"
                  type="button"
                  class="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors action-menu-button"
                  title="เมนูเพิ่มเติม"
                >
                  <i class="fas fa-ellipsis-v text-sm"></i>
                </button>
                
                <!-- Action Menu -->
                <div
                  v-if="item.showActionMenu"
                  class="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]"
                >
                  <button
                    @click="cloneItem(index)"
                    type="button"
                    class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <i class="fas fa-copy text-xs"></i>
                    คัดลอก
                  </button>
                  <button
                    @click="moveItemUp(index)"
                    type="button"
                    :disabled="index === 0"
                    class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-arrow-up text-xs"></i>
                    ย้ายขึ้น
                  </button>
                  <button
                    @click="moveItemDown(index)"
                    type="button"
                    :disabled="index === scheduleData.length - 1"
                    class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i class="fas fa-arrow-down text-xs"></i>
                    ย้ายลง
                  </button>
                  <hr class="my-1">
                  <button
                    @click="deleteItem(item._id, index)"
                    type="button"
                    class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <i class="fas fa-trash text-xs"></i>
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div v-if="item.isEditing" class="p-4 bg-gray-50">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Basic Info -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">หัวข้อกิจกรรม</label>
                <input
                  v-model="item.header"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ระบุหัวข้อกิจกรรม..."
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ประเภทงาน/Task</label>
                <select
                  v-model="item.taskType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- เลือกประเภทงาน --</option>
                  <option value="registration">การลงทะเบียน</option>
                  <option value="training">การอบรม/สัมมนา</option>
                  <option value="testing">การทดสอบและประเมิน</option>
                  <option value="certification">ใบรับรองและเอกสาร</option>
                  <option value="payment">การชำระเงิน</option>
                  <option value="social_activity">กิจกรรมสังสรรค์</option>
                  <option value="follow_up">การติดตามผล</option>
                  <option value="management">การจัดการ</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                  v-model="item.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ระบุรายละเอียดกิจกรรม..."
                ></textarea>
              </div>
            </div>

            <!-- Date Settings -->
            <div class="space-y-4">
              <!-- วันที่เริ่มต้นและสิ้นสุดในแถวเดียวกัน -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="item.scheduleType !== 'enddate'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น</label>
                  <input
                    v-if="item.dateType === 'full'"
                    v-model="item.startdate"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    v-else-if="item.dateType === 'month_year'"
                    v-model="item.startdate"
                    type="month"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    v-else-if="item.dateType === 'year'"
                    v-model="item.startdate"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ปี ค.ศ."
                  />
                </div>

                <div v-if="item.scheduleType !== 'startdate'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                  <input
                    v-if="item.dateType === 'full'"
                    v-model="item.enddate"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    v-else-if="item.dateType === 'month_year'"
                    v-model="item.enddate"
                    type="month"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    v-else-if="item.dateType === 'year'"
                    v-model="item.enddate"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ปี ค.ศ."
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Option Groups -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <!-- Date Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">รูปแบบวันที่</label>
              <div class="space-y-2">
                <label
                  v-for="type in dateTypes"
                  :key="type.value"
                  class="flex items-center p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  :class="{ 'border-blue-500 bg-blue-50': item.dateType === type.value }"
                >
                  <input
                    v-model="item.dateType"
                    :value="type.value"
                    type="radio"
                    class="mr-3 text-blue-600"
                  />
                  <span class="text-sm">{{ type.label }}</span>
                </label>
              </div>
            </div>

            <!-- Schedule Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">การแสดงผล</label>
              <div class="space-y-2">
                <label
                  v-for="type in scheduleTypes"
                  :key="type.value"
                  class="flex items-center p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  :class="{ 'border-blue-500 bg-blue-50': item.scheduleType === type.value }"
                >
                  <input
                    v-model="item.scheduleType"
                    :value="type.value"
                    type="radio"
                    class="mr-3 text-blue-600"
                  />
                  <span class="text-sm">{{ type.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Save/Cancel Buttons -->
          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              @click="toggleEdit(index)"
              type="button"
              class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm"
            >
              ยกเลิก
            </button>
            <button
              @click="saveItem(item)"
              type="button"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm"
            >
              บันทึก
            </button>
          </div>
        </div>

        <!-- Card Summary (when not editing) -->
        <div v-else class="px-4 py-3">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-500">ประเภทงาน:</span>
              <span class="ml-2 font-medium">
                {{ getTaskTypeInfo(item.taskType).label || 'ไม่ระบุ' }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">รูปแบบวันที่:</span>
              <span class="ml-2 font-medium">
                {{ dateTypes.find(type => type.value === item.dateType)?.label }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">การแสดงผล:</span>
              <span class="ml-2 font-medium">
                {{ scheduleTypes.find(type => type.value === item.scheduleType)?.label }}
              </span>
            </div>
          </div>
          <div v-if="item.description" class="mt-3 pt-3 border-t border-gray-100">
            <span class="text-gray-500 text-sm">รายละเอียด:</span>
            <p class="mt-1 text-sm text-gray-700">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-calendar-plus text-gray-400 text-xl"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">ยังไม่มีตารางกิจกรรม</h3>
      <p class="text-gray-500 mb-6">เริ่มต้นโดยการเพิ่มรายการตารางกิจกรรมแรกของคุณ</p>
      <button
        @click="addItem"
        type="button"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
      >
        <i class="fas fa-plus text-sm"></i>
        เพิ่มรายการแรก
      </button>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';

export default {
  data() {
    return {
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      dataItem: this.$route.params.id,
      scheduleData: [],
      taskTypes: [
        { label: 'การลงทะเบียน', value: 'registration', icon: 'fas fa-user-plus', color: 'blue' },
        { label: 'การอบรม/สัมมนา', value: 'training', icon: 'fas fa-chalkboard-teacher', color: 'green' },
        { label: 'การทดสอบและประเมิน', value: 'testing', icon: 'fas fa-clipboard-check', color: 'indigo' },
        { label: 'ใบรับรองและเอกสาร', value: 'certification', icon: 'fas fa-certificate', color: 'purple' },
        { label: 'การชำระเงิน', value: 'payment', icon: 'fas fa-credit-card', color: 'rose' },
        { label: 'กิจกรรมสังสรรค์', value: 'social_activity', icon: 'fas fa-glass-cheers', color: 'amber' },
        { label: 'การติดตามผล', value: 'follow_up', icon: 'fas fa-chart-line', color: 'teal' },
        { label: 'การจัดการ', value: 'management', icon: 'fas fa-tools', color: 'gray' }
      ],
      dateTypes: [
        { label: 'วัน/เดือน/ปี', value: 'full' },
        { label: 'เดือน/ปี', value: 'month_year' },
        { label: 'ปี', value: 'year' }
      ],
      scheduleTypes: [
        { label: 'วันเริ่มดำเนินการ', value: 'startdate' },
        { label: 'วันสิ้นสุดการดำเนินการ', value: 'enddate' },
        { label: 'ช่วงดำเนินการ (เริ่ม-สิ้นสุด)', value: 'startdate_enddate' }
      ]
    };
  },
  async mounted() {
    await this.getData();
    
    // เพิ่ม event listener สำหรับปิดเมนูเมื่อคลิกข้างนอก
    document.addEventListener('click', this.closeAllMenus);
  },
  beforeUnmount() {
    // ลบ event listener เมื่อ component ถูกทำลาย
    document.removeEventListener('click', this.closeAllMenus);
  },
  methods: {
    closeAllMenus(event) {
      // ตรวจสอบว่าการคลิกไม่ได้เกิดขึ้นจากปุ่มเมนู
      if (!event.target.closest('.action-menu-button')) {
        this.scheduleData.forEach(item => {
          item.showActionMenu = false;
        });
      }
    },
    async getData() {
      try {
        const response = await this.$Request.POST(
          `course_schedule/query`,
          {
            method: 'find',
            args: [{ courseId: this.dataItem }],
          },
          this.configs.key
        );
        this.scheduleData = (response.data || []).map(item => ({
          ...item,
          taskType: item.taskType || '',
          description: item.description || '',
          showActionMenu: false
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
        this.scheduleData = [];
      }
    },
    toggleActionMenu(index) {
      this.scheduleData.forEach((item, i) => {
        item.showActionMenu = i === index ? !item.showActionMenu : false;
      });
    },
    toggleEdit(index) {
      if (this.scheduleData[index]) {
        this.scheduleData[index].showActionMenu = false;
        
        this.scheduleData.forEach((item, i) => {
          item.isEditing = i === index ? !item.isEditing : false;
        });
      }
    },
    async addItem() {
      const newItem = {
        header: "",
        description: "",
        startdate: "",
        enddate: "",
        courseId: this.dataItem,
        isEditing: true,
        showActionMenu: false,
        taskType: "",
        dateType: this.dateTypes[0].value,
        scheduleType: this.scheduleTypes[2].value
      };

      try {
        const response = await this.$Request.POST(`course_schedule`, { data: newItem }, this.configs.key);
        if (response.status === 200 && response.data.insertedId) {
          this.scheduleData.push({ ...newItem, _id: response.data.insertedId });
        } else {
          console.error("Failed to create new item. Response:", response);
        }
      } catch (error) {
        console.error("Error adding item:", error);
      }
      await this.getData();
    },
    async saveItem(item) {
      if (!item._id) {
        console.error("Error: Cannot update item without an ID.");
        return;
      }
      
      item.isEditing = false;
      item.showActionMenu = false;

      const { _id, ...updateData } = item;
      updateData.dateType = item.dateType;
      updateData.scheduleType = item.scheduleType;
      updateData.taskType = item.taskType;
      updateData.description = item.description;
      
      try {
        const response = await this.$Request.PUT(
          `course_schedule/${_id}`,
          { data: updateData },
          this.configs.key
        );
        if (response.status !== 200) {
          console.error("Failed to update item. Response:", response);
        }
      } catch (error) {
        console.error("Error updating item:", error);
      }
      await this.getData();
    },
    async deleteItem(id, index) {
      if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
        return;
      }
      
      try {
        const response = await this.$Request.DELETE(`course_schedule/${id}`, {}, this.configs.key);
        if (response.status === 200) {
          this.scheduleData.splice(index, 1);
        } else {
          console.error("Failed to delete item.");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
      }
      await this.getData();
    },
    async moveItemUp(index) {
      if (index > 0) {
        this.scheduleData[index].showActionMenu = false;
        
        [this.scheduleData[index - 1], this.scheduleData[index]] = 
        [this.scheduleData[index], this.scheduleData[index - 1]];
      }
      await this.getData();
    },
    async moveItemDown(index) {
      if (index < this.scheduleData.length - 1) {
        this.scheduleData[index].showActionMenu = false;
        
        [this.scheduleData[index + 1], this.scheduleData[index]] = 
        [this.scheduleData[index], this.scheduleData[index + 1]];
      }
      await this.getData();
    },
    async cloneItem(index) {
      const clonedItem = { 
        ...this.scheduleData[index], 
        isEditing: false, 
        showActionMenu: false,
        _id: undefined,
        header: `${this.scheduleData[index].header} (สำเนา)`
      };
      
      this.scheduleData[index].showActionMenu = false;
      
      try {
        const response = await this.$Request.POST(`course_schedule`, { data: clonedItem }, this.configs.key);
        if (response.status === 200) {
          this.scheduleData.splice(index + 1, 0, { ...clonedItem, _id: response.data.insertedId });
          await this.getData();
        } else {
          console.error("Failed to clone item.");
        }
      } catch (error) {
        console.error("Error cloning item:", error);
      }
    },
    formattedStartDate(item) {
      return item.startdate ? item.startdate.split('T')[0] : '';
    },
    formattedEndDate(item) {
      return item.enddate ? item.enddate.split('T')[0] : '';
    },
    getTaskTypeInfo(taskTypeValue) {
      if (!taskTypeValue) {
        return { label: 'ไม่ระบุ', icon: 'fas fa-question', color: 'gray' };
      }
      const taskType = this.taskTypes.find(type => type.value === taskTypeValue);
      return taskType || { label: 'ไม่ระบุ', icon: 'fas fa-question', color: 'gray' };
    }
  }
};
</script>
  