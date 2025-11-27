<template>
  <div class="fixed inset-0 flex items-center justify-center z-50 modal-overlay">
    <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" @click="closeCalendarConfig"></div>
    <div class="bg-white rounded-xl p-6 shadow-2xl max-w-2xl w-full mx-4 relative modal-content max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-calendar-plus text-blue-600"></i>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ isEditing ? 'แก้ไขปฏิทิน' : 'เพิ่มปฏิทินใหม่' }}</h2>
            <p class="text-sm text-gray-500">{{ isEditing ? 'ปรับแต่งการตั้งค่าปฏิทิน' : 'สร้างปฏิทินใหม่สำหรับจัดการกิจกรรม' }}</p>
          </div>
        </div>
        <button 
          @click="closeCalendarConfig"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <i class="fas fa-times text-lg"></i>
        </button>
      </div>

      <form @submit.prevent="saveCalendar" class="space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
            <i class="fas fa-info-circle text-blue-500"></i>
            ข้อมูลพื้นฐาน
          </h3>
          
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อปฏิทิน *</label>
            <input
              v-model="localCalendarData.title"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              type="text"
              placeholder="เช่น ปฏิทินงาน, ปฏิทินส่วนตัว"
              required
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
            <textarea
              v-model="localCalendarData.description"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows="3"
              placeholder="อธิบายเกี่ยวกับปฏิทินนี้..."
            ></textarea>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
            <i class="fas fa-palette text-purple-500"></i>
            การแสดงผล
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทปฏิทิน</label>
              <select v-model="localCalendarData.type" class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <option value="default">ทั่วไป</option>
                <option value="work">งาน</option>
                <option value="personal">ส่วนตัว</option>
                <option value="holiday">วันหยุด</option>
              </select>
            </div>

            <!-- Color -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สีปฏิทิน</label>
              <div class="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                <label
                  v-for="color in colors"
                  :key="color.value"
                  :style="{ backgroundColor: color.colorCode }"
                  class="color-circle cursor-pointer w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg"
                  :class="{ 'ring-2 ring-offset-2 ring-blue-500': localCalendarData.color === color.value }"
                >
                  <input
                    type="radio"
                    v-model="localCalendarData.color"
                    :value="color.value"
                    class="hidden"
                  />
                  <i v-if="localCalendarData.color === color.value" class="fas fa-check text-white text-xs"></i>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- View Settings -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
            <i class="fas fa-eye text-green-500"></i>
            การตั้งค่าการแสดงผล
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Default View -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">มุมมองเริ่มต้น</label>
              <select v-model="localCalendarData.viewType" class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <option value="day">รายวัน</option>
                <option value="week">รายสัปดาห์</option>
                <option value="month">รายเดือน</option>
                <option value="agenda">รายการกิจกรรม</option>
              </select>
            </div>

            <!-- Timezone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">เขตเวลา</label>
              <select v-model="localCalendarData.timezone" class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                <option value="UTC">UTC</option>
                <option value="Asia/Bangkok">เวลาประเทศไทย</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="Europe/London">London</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
            <i class="fas fa-bell text-yellow-500"></i>
            การแจ้งเตือน
          </h3>
          
          <!-- Default Reminders -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">การแจ้งเตือนเริ่มต้น (นาที)</label>
            <div class="space-y-2">
              <div v-for="(reminder, index) in localCalendarData.defaultReminders" :key="index" class="flex items-center gap-2">
                <input
                  v-model.number="localCalendarData.defaultReminders[index]"
                  class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="number"
                  placeholder="เช่น 15"
                  min="0"
                />
                <button
                  type="button"
                  @click="removeReminder(index)"
                  class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  v-if="localCalendarData.defaultReminders.length > 1"
                >
                  <i class="fas fa-trash text-sm"></i>
                </button>
              </div>
              <button
                type="button"
                class="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                @click="addReminder"
              >
                <i class="fas fa-plus text-sm"></i>
                เพิ่มการแจ้งเตือน
              </button>
            </div>
          </div>
        </div>

        <!-- Sharing Settings -->
        <div class="space-y-4" v-if="localCalendarData.sharingOptions">
          <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
            <i class="fas fa-share-alt text-indigo-500"></i>
            การแชร์
          </h3>
          
          <div class="p-4 bg-gray-50 rounded-lg space-y-4">
            <!-- Public Calendar Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-700">ปฏิทินสาธารณะ</label>
                <p class="text-xs text-gray-500">อนุญาตให้ผู้อื่นเข้าถึงปฏิทินนี้ได้</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="localCalendarData.sharingOptions.public"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Shared Users -->
            <div v-if="!localCalendarData.sharingOptions.public">
              <label class="block text-sm font-medium text-gray-700 mb-2">แชร์กับผู้ใช้</label>
              <div class="space-y-2">
                <div v-for="(user, index) in localCalendarData.sharingOptions.sharedWith" :key="index" class="flex items-center gap-2">
                  <input
                    v-model="localCalendarData.sharingOptions.sharedWith[index]"
                    class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    type="text"
                    placeholder="ID ผู้ใช้หรืออีเมล"
                  />
                  <button
                    type="button"
                    @click="removeSharedUser(index)"
                    class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    v-if="localCalendarData.sharingOptions.sharedWith.length > 1"
                  >
                    <i class="fas fa-trash text-sm"></i>
                  </button>
                </div>
                <button
                  type="button"
                  class="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  @click="addSharedUser"
                >
                  <i class="fas fa-plus text-sm"></i>
                  เพิ่มผู้ใช้
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="closeCalendarConfig"
            class="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <i class="fas fa-save"></i>
            {{ isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างปฏิทิน' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    calendarData: Object,
    isEditing: Boolean,
  },
  data() {
    return {
      localCalendarData: { ...this.calendarData },
      colors: [
        { value: 'pink', colorCode: '#f28b82' },
        { value: 'red', colorCode: '#ea4335' },
        { value: 'orange', colorCode: '#fbbc04' },
        { value: 'yellow', colorCode: '#fdd835' },
        { value: 'green', colorCode: '#81c995' },
        { value: 'lightBlue', colorCode: '#aecbfa' },
        { value: 'blue', colorCode: '#4285f4' },
        { value: 'purple', colorCode: '#aa66cc' },
        { value: 'gray', colorCode: '#9e9e9e' },
        { value: 'black', colorCode: '#000000' }
      ],
    };
  },
  methods: {
    saveCalendar() {
      this.$emit('saveCalendar', this.localCalendarData);
    },
    closeCalendarConfig() {
      this.$emit('closeCalendarConfig');
    },
    addReminder() {
      this.localCalendarData.defaultReminders.push(15);
    },
    removeReminder(index) {
      if (this.localCalendarData.defaultReminders.length > 1) {
        this.localCalendarData.defaultReminders.splice(index, 1);
      }
    },
    addSharedUser() {
      this.localCalendarData.sharingOptions.sharedWith.push('');
    },
    removeSharedUser(index) {
      if (this.localCalendarData.sharingOptions.sharedWith.length > 1) {
        this.localCalendarData.sharingOptions.sharedWith.splice(index, 1);
      }
    },
  },
};
</script>

<style scoped>
/* Modal animations */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-overlay {
  animation: overlayFadeIn 0.2s ease-out;
}

.modal-content {
  animation: modalFadeIn 0.3s ease-out;
}

/* Color picker styles */
.color-circle {
  transition: all 0.2s ease-in-out;
}

.color-circle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Form input focus effects */
input:focus,
textarea:focus,
select:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Button hover effects */
button {
  transition: all 0.2s ease-in-out;
}

button:hover {
  transform: translateY(-1px);
}

/* Toggle switch animation */
.peer:checked + div {
  background-color: #2563eb;
}

.peer:checked + div:after {
  transform: translateX(100%);
  border-color: white;
}

/* Section headers */
h3 {
  position: relative;
  padding-left: 0;
}

h3::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
  border-radius: 2px;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-height: 95vh;
  }
  
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}

/* Focus visible for accessibility */
.focus-visible:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Loading state */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Error state */
.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

/* Success state */
.success {
  border-color: #10b981;
  background-color: #f0fdf4;
}
</style>
  