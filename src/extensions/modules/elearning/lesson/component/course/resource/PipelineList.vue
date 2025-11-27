<template>
  <!-- Header Section -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas','sitemap']" class="text-white text-sm" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">จัดการเส้นทางการเรียนรู้</h2>
            <p class="text-sm text-gray-600">กำหนดลำดับการเรียนรู้ของหลักสูตร ({{ learningPathItems.length }} ขั้นตอน)</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <!-- Statistics Toggle -->
          <button
            v-if="learningPathItems.length > 0"
            @click="showlearningPathStats = !showlearningPathStats"
            type="button"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
            :class="showlearningPathStats 
              ? 'bg-blue-100 text-blue-700 border-blue-300' 
              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'"
          >
            <font-awesome-icon :icon="['fas','chart-bar']" class="mr-1.5" />
            สถิติ
          </button>

          <!-- Export Pipeline -->
          <button
            v-if="learningPathItems.length > 0"
            @click="exportLearningPath"
            type="button"
            class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <font-awesome-icon :icon="['fas','download']" class="mr-1.5" />
            Export
          </button>

          <!-- Add Course Button -->
          <button
            @click="openCourseSelector"
            type="button"
            class="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
            เพิ่มหลักสูตร
          </button>
        </div>
      </div>

      <!-- Pipeline Statistics Panel -->
      <div v-if="showlearningPathStats && learningPathStats" class="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ learningPathStats.totalCourses }}</div>
            <div class="text-xs text-gray-600">หลักสูตรทั้งหมด</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ learningPathStats.totalHours }}</div>
            <div class="text-xs text-gray-600">ชั่วโมงรวม</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ learningPathStats.totalEnrollments }}</div>
            <div class="text-xs text-gray-600">ผู้ลงทะเบียนรวม</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-600">{{ Math.round(learningPathStats.completionRate) }}%</div>
            <div class="text-xs text-gray-600">อัตราเปิดใช้งาน</div>
          </div>
        </div>
        
        <!-- Validation Warnings -->
        <div v-if="!validateLearningPath().isValid" class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-center text-xs text-yellow-800">
            <font-awesome-icon :icon="['fas','exclamation-triangle']" class="mr-2 text-yellow-600" />
            <span class="font-medium">คำเตือน:</span>
            <span class="ml-1">{{ validateLearningPath().issues.join(', ') }}</span>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Toolbar -->
      <div v-if="hasSelectedItems" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-blue-900">
              เลือกแล้ว {{ selectedItemsCount }} รายการ
            </span>
            <button
              @click="clearSelection"
              type="button"
              class="text-xs text-blue-700 hover:text-blue-900 underline"
            >
              ยกเลิกการเลือก
            </button>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="bulkMoveUp"
              :disabled="!canMoveSelectedUp"
              type="button"
              :class="[
                'px-2 py-1 text-xs font-medium rounded border transition-colors',
                canMoveSelectedUp
                  ? 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
                  : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
              ]"
            >
              <font-awesome-icon :icon="['fas','arrow-up']" class="mr-1" />
              ย้ายขึ้น
            </button>
            <button
              @click="bulkMoveDown"
              :disabled="!canMoveSelectedDown"
              type="button"
              :class="[
                'px-2 py-1 text-xs font-medium rounded border transition-colors',
                canMoveSelectedDown
                  ? 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
                  : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
              ]"
            >
              <font-awesome-icon :icon="['fas','arrow-down']" class="mr-1" />
              ย้ายลง
            </button>
            <button
              @click="bulkRemove"
              type="button"
              class="px-2 py-1 text-xs font-medium text-red-700 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
            >
              <font-awesome-icon :icon="['fas','trash']" class="mr-1" />
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pipeline Settings Section -->
    <div class="px-4 py-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-md flex items-center justify-center">
            <font-awesome-icon :icon="['fas','cog']" class="text-white text-xs" />
          </div>
          <h3 class="text-lg font-bold text-gray-900">การตั้งค่าเส้นทางการเรียนรู้</h3>
        </div>
        <button
          @click="showPipelineSettings = !showPipelineSettings"
          type="button"
          class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border transition-colors"
          :class="showPipelineSettings 
            ? 'bg-green-100 text-green-700 border-green-300' 
            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'"
        >
          <font-awesome-icon :icon="['fas', showPipelineSettings ? 'chevron-up' : 'chevron-down']" class="mr-1" />
          {{ showPipelineSettings ? 'ซ่อน' : 'แสดง' }}
        </button>
      </div>

      <!-- Settings Panel -->
      <div v-if="showPipelineSettings" class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        <!-- 1. ลำดับการเรียน -->
        <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center space-x-2 mb-3">
            <font-awesome-icon :icon="['fas','list-ol']" class="text-blue-500" />
            <h4 class="text-base font-bold text-gray-900">ลำดับการเรียน</h4>
          </div>
          <div class="space-y-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="pipelineSettings.learningOrder"
                type="radio"
                value="sequential"
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">เรียงตามลำดับ</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="pipelineSettings.learningOrder"
                type="radio"
                value="flexible"
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">อิสระ</span>
            </label>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            <span v-if="pipelineSettings.learningOrder === 'sequential'">
              ผู้เรียนต้องเรียนตามลำดับที่กำหนด
            </span>
            <span v-else>
              ผู้เรียนสามารถเรียนได้ในลำดับใดก็ได้
            </span>
          </div>
        </div>

        <!-- 2. ใบรับรอง -->
        <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center space-x-2 mb-3">
            <font-awesome-icon :icon="['fas','certificate']" class="text-yellow-500" />
            <h4 class="text-base font-bold text-gray-900">ใบรับรอง</h4>
          </div>
          <div class="space-y-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="pipelineSettings.certificate"
                type="radio"
                value="issue"
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">แจกใบรับรอง</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="pipelineSettings.certificate"
                type="radio"
                value="no_issue"
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">ไม่แจก</span>
            </label>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            <span v-if="pipelineSettings.certificate === 'issue'">
              ออกใบรับรองเมื่อผ่าน Pipeline ครบ
            </span>
            <span v-else>
              ไม่ออกใบรับรองสำหรับ Pipeline นี้
            </span>
          </div>
        </div>

        <!-- 3. ระยะเวลาในการเรียน -->
        <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center space-x-2 mb-3">
            <font-awesome-icon :icon="['fas','clock']" class="text-red-500" />
            <h4 class="text-base font-bold text-gray-900">ระยะเวลาในการเรียน</h4>
          </div>
          <div class="space-y-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="pipelineSettings.timeLimit"
                type="radio"
                value="unlimited"
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">ไม่จำกัด</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="pipelineSettings.timeLimit"
                type="radio"
                value="limited"
                class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="text-sm text-gray-700">จำกัด</span>
            </label>
          </div>
          
          <!-- Days Input -->
          <div v-if="pipelineSettings.timeLimit === 'limited'" class="mt-3">
            <label class="block text-xs font-medium text-gray-700 mb-1">
              จำนวนวันหลังลงทะเบียน
            </label>
            <div class="flex items-center space-x-2">
              <input
                v-model.number="pipelineSettings.timeLimitDays"
                type="number"
                min="1"
                max="365"
                class="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span class="text-xs text-gray-600">วัน</span>
            </div>
          </div>
          
          <div class="mt-2 text-xs text-gray-500">
            <span v-if="pipelineSettings.timeLimit === 'unlimited'">
              ผู้เรียนสามารถเรียนได้ไม่จำกัดเวลา
            </span>
            <span v-else-if="pipelineSettings.timeLimitDays">
              ผู้เรียนมีเวลา {{ pipelineSettings.timeLimitDays }} วันในการเรียน Pipeline นี้
            </span>
            <span v-else>
              กรุณาระบุจำนวนวัน
            </span>
          </div>
        </div>
      </div>

      <!-- Save Settings Button -->
      <div v-if="showPipelineSettings" class="mt-4 flex justify-end">
        <button
          @click="saveLearningPathSettings"
          type="button"
          class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          :disabled="isReordering"
        >
          <font-awesome-icon :icon="['fas','save']" class="mr-2" />
          บันทึกการตั้งค่า
        </button>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="bg-blue-50 border-l-4 border-blue-400 p-3">
      <div class="flex items-center justify-between">
        <div class="flex">
          <div class="flex-shrink-0">
            <font-awesome-icon :icon="['fas','info-circle']" class="text-blue-400 text-sm" />
          </div>
          <div class="ml-2">
            <p class="text-xs text-blue-700">
              <strong>หมายเหตุ:</strong> กำหนดลำดับหลักสูตรที่ผู้เรียนต้องผ่านก่อนจึงจะสามารถเข้าเรียนหลักสูตรนี้ได้
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <!-- Keyboard Shortcuts Help -->
          <button
            @click="showShortcutsHelp = !showShortcutsHelp"
            type="button"
            class="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            คีย์ลัด
          </button>
        </div>
      </div>
      
      <!-- Keyboard Shortcuts Panel -->
      <div v-if="showShortcutsHelp" class="mt-3 p-3 bg-white rounded border border-blue-200">
        <h4 class="text-xs font-semibold text-blue-900 mb-2">🎯 คีย์บอร์ดลัด</h4>
        <div class="grid grid-cols-2 gap-2 text-xs text-blue-800">
          <div><kbd class="px-1 py-0.5 bg-blue-100 rounded">Ctrl+A</kbd> เลือกทั้งหมด</div>
          <div><kbd class="px-1 py-0.5 bg-blue-100 rounded">Delete</kbd> ลบรายการที่เลือก</div>
          <div><kbd class="px-1 py-0.5 bg-blue-100 rounded">Ctrl+↑</kbd> ย้ายขึ้น</div>
          <div><kbd class="px-1 py-0.5 bg-blue-100 rounded">Ctrl+↓</kbd> ย้ายลง</div>
          <div><kbd class="px-1 py-0.5 bg-blue-100 rounded">Esc</kbd> ยกเลิกการเลือก</div>
          <div><kbd class="px-1 py-0.5 bg-blue-100 rounded">?</kbd> แสดงความช่วยเหลือ</div>
        </div>
      </div>
    </div>

    <!-- Pipeline List -->
    <div class="p-4 relative">
      <!-- Loading Overlay -->
      <div v-if="isReordering" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20 rounded-lg">
        <div class="flex flex-col items-center space-y-3">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span class="text-sm font-medium text-blue-600">กำลังบันทึกเส้นทางการเรียนรู้...</span>
        </div>
      </div>

      <div v-if="learningPathItems.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <font-awesome-icon :icon="['fas','sitemap']" class="text-blue-500 text-2xl" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-3">ยังไม่มีเส้นทางการเรียนรู้</h3>
        <p class="text-base text-gray-600 mb-6 max-w-md mx-auto">เริ่มต้นสร้างเส้นทางการเรียนรู้สำหรับหลักสูตรนี้ เพื่อกำหนดลำดับการเรียนรู้ที่ผู้เรียนต้องผ่าน</p>
        <button
          @click="openCourseSelector"
          type="button"
          class="inline-flex items-center rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-2" />
          สร้างเส้นทางการเรียนรู้แรก
        </button>
      </div>

      <!-- Pipeline Items (Horizontal Flow Design) -->
      <div v-else class="relative">
        <!-- Pipeline Flow Container (Horizontal) -->
        <div class="space-y-6 relative">
          <div 
            v-for="(item, index) in learningPathItems" 
            :key="item._id"
            class="relative flex items-center"
            :class="{ 'pipeline-step-inactive': !item.status }"
            :style="{ animationDelay: `${index * 0.15}s` }"
          >
            <!-- Step Number Node (Left Side) -->
            <div class="relative z-10 flex-shrink-0">
              <div 
                :class="[
                  'w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-3 border-white pipeline-node ring-2 transition-all duration-300',
                  item.status 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-700 ring-blue-100' 
                    : 'bg-gradient-to-br from-gray-400 to-gray-600 ring-gray-100 opacity-60'
                ]"
              >
                <span class="text-white font-bold text-sm">{{ index + 1 }}</span>
                
                <!-- Status Indicator Badge -->
                <div 
                  :class="[
                    'absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center',
                    item.status ? 'bg-green-500' : 'bg-red-500'
                  ]"
                >
                  <font-awesome-icon 
                    :icon="['fas', item.status ? 'check' : 'times']" 
                    :class="item.status ? 'text-white' : 'text-white'"
                    class="text-xs"
                  />
                </div>
              </div>
              
              <!-- Vertical Connecting Line (from this node to next node) -->
              <div v-if="index < learningPathItems.length - 1" 
                   class="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 pipeline-flow-line"
                   :style="{ 
                     top: '48px', 
                     height: '230px',
                     animationDelay: `${index * 0.15 + 0.6}s`
                   }"></div>
            </div>

            <!-- Horizontal Connecting Line to Card -->
            <div class="w-6 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 flex-shrink-0 connecting-line rounded-full"
                 :style="{ animationDelay: `${index * 0.15 + 0.3}s` }"></div>

            <!-- Course Card (Right Side) -->
            <div class="flex-1 bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden course-card"
                 :class="{ 
                   'ring-2 ring-blue-400 bg-blue-50 border-blue-300': selectedItems.includes(index),
                   'pipeline-item-inactive': !item.status
                 }">
              <div class="p-5">
                <!-- Course Header -->
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-4 flex-1">
                    <!-- Selection Checkbox -->
                    <div class="flex-shrink-0">
                      <input
                        type="checkbox"
                        :checked="selectedItems.includes(index)"
                        @change="toggleItemSelection(index)"
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        :title="selectedItems.includes(index) ? 'ยกเลิกการเลือก' : 'เลือกรายการนี้'"
                      />
                    </div>

                    <!-- Course Thumbnail -->
                    <div class="flex-shrink-0">
                      <div v-if="item.cover" 
                           class="w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm"
                           :title="`ดูรายละเอียด ${item.name}`">
                        <img 
                          :src="item.cover" 
                          :alt="item.name"
                          class="w-full h-full object-cover"
                          @error="handleImageError"
                        />
                      </div>
                      <div v-else 
                           class="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center border-2 border-blue-300"
                           :title="`${item.name}`">
                        <font-awesome-icon :icon="['fas','book']" class="text-blue-600 text-xl" />
                      </div>
                    </div>

                    <!-- Course Info -->
                    <div class="flex-1 min-w-0">
                      <h3 class="text-xl font-bold text-gray-900 mb-2 truncate" :title="item.name">
                        {{ item.name }}
                      </h3>
                      
                      <!-- Course Stats (Enhanced) -->
                      <div class="flex items-center space-x-4 text-sm text-gray-600">
                        <div class="flex items-center bg-blue-50 px-2 py-1 rounded-full">
                          <font-awesome-icon :icon="['fas','clock']" class="mr-1.5 text-blue-500" />
                          <span class="font-medium">{{ item.hours || 'ไม่ระบุ' }} ชม.</span>
                        </div>
                        <div class="flex items-center bg-green-50 px-2 py-1 rounded-full">
                          <font-awesome-icon :icon="['fas','users']" class="mr-1.5 text-green-500" />
                          <span class="font-medium">{{ item.enrollUserCount || 0 }}</span>
                        </div>
                        <div class="flex items-center px-2 py-1 rounded-full"
                             :class="item.status ? 'bg-green-50' : 'bg-red-50'">
                          <font-awesome-icon 
                            :icon="['fas', item.status ? 'check-circle' : 'times-circle']" 
                            :class="item.status ? 'text-green-500' : 'text-red-500'"
                            class="mr-1.5" 
                          />
                          <span :class="item.status ? 'text-green-700 font-medium' : 'text-red-700 font-medium'" class="text-sm">
                            {{ item.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons (Enhanced) -->
                  <div class="flex items-center space-x-2 ml-4">
                    <!-- Move Up -->
                    <button
                      @click="moveUp(index)"
                      :disabled="index === 0"
                      type="button"
                      :class="[
                        'p-2 rounded-xl border text-sm transition-all duration-200',
                        index === 0 
                          ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' 
                          : 'border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:scale-105'
                      ]"
                      title="ย้ายขึ้น"
                    >
                      <font-awesome-icon :icon="['fas','arrow-up']" class="text-sm" />
                    </button>
                    
                    <!-- Move Down -->
                    <button
                      @click="moveDown(index)"
                      :disabled="index === learningPathItems.length - 1"
                      type="button"
                      :class="[
                        'p-2 rounded-xl border text-sm transition-all duration-200',
                        index === learningPathItems.length - 1 
                          ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' 
                          : 'border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:scale-105'
                      ]"
                      title="ย้ายลง"
                    >
                      <font-awesome-icon :icon="['fas','arrow-down']" class="text-sm" />
                    </button>

                    <!-- View Detail -->
                    <button 
                      @click="viewCourseDetail(item)"
                      type="button" 
                      class="p-2 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:scale-105 transition-all duration-200 text-sm"
                      title="ดูรายละเอียด"
                    >
                      <font-awesome-icon :icon="['fas','eye']" class="text-sm" />
                    </button>

                    <!-- Toggle Status -->
                    <button
                      @click="toggleLearningPathItemStatus(index)"
                      type="button"
                      :class="[
                        'p-2 rounded-xl border text-sm transition-all duration-200',
                        item.status 
                          ? 'border-green-200 text-green-600 bg-green-50 hover:bg-green-100 hover:scale-105' 
                          : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:scale-105'
                      ]"
                      :title="item.status ? 'ปิดใช้งานเส้นทางการเรียนรู้นี้' : 'เปิดใช้งานเส้นทางการเรียนรู้นี้'"
                    >
                      <font-awesome-icon 
                        :icon="['fas', item.status ? 'toggle-on' : 'toggle-off']" 
                        class="text-sm" 
                      />
                    </button>
                    
                    <!-- Remove -->
                    <button
                      @click="removeLearningPathItem(index)"
                      type="button"
                      class="p-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:scale-105 transition-all duration-200 text-sm"
                      title="ลบออกจากเส้นทางการเรียนรู้"
                    >
                      <font-awesome-icon :icon="['fas','trash']" class="text-sm" />
                    </button>
                  </div>
                </div>

                <!-- Course Categories (Enhanced) -->
                <div v-if="item.categoryData && item.categoryData.length > 0" class="flex flex-wrap gap-2 mb-3">
                  <span 
                    v-for="category in item.categoryData.slice(0, 3)" 
                    :key="category._id"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200"
                  >
                    {{ category.name }}
                  </span>
                  <span 
                    v-if="item.categoryData.length > 3"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    +{{ item.categoryData.length - 3 }} เพิ่มเติม
                  </span>
                </div>

                <!-- Prerequisites Info (Enhanced) -->
                <div v-if="index > 0" class="mt-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
                  <div class="flex items-center text-sm text-amber-800">
                    <font-awesome-icon :icon="['fas','link']" class="mr-2 text-amber-600" />
                    <span class="font-semibold">ต้องผ่าน:</span>
                    <span class="ml-2 font-bold truncate text-amber-900">{{ learningPathItems[index - 1].name }}</span>
                  </div>
                </div>
              </div>

              <!-- Progress Bar Footer (Enhanced) -->
              <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-t border-gray-200">
                <div class="flex items-center justify-between text-sm text-gray-600">
                  <span class="font-medium">ขั้นตอนที่ {{ index + 1 }} จาก {{ learningPathItems.length }}</span>
                  <div class="flex items-center">
                    <div class="w-20 bg-gray-300 rounded-full h-2 mr-3 overflow-hidden">
                      <div 
                        class="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 progress-bar" 
                        :style="{ width: `${((index + 1) / learningPathItems.length) * 100}%` }"
                      ></div>
                    </div>
                    <span class="font-bold text-blue-600">{{ Math.round(((index + 1) / learningPathItems.length) * 100) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pipeline Summary -->
        <div class="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <font-awesome-icon :icon="['fas','flag-checkered']" class="text-white text-sm" />
              </div>
              <div>
                <h4 class="text-lg font-bold text-gray-900">เส้นทางการเรียนรู้สมบูรณ์</h4>
                <p class="text-sm text-gray-600">ผู้เรียนต้องผ่านทั้งหมด {{ learningPathItems.length }} ขั้นตอน</p>
              </div>
            </div>
            <button
              @click="openCourseSelector"
              type="button"
              class="inline-flex items-center px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 transition-all"
              :aria-label="`เพิ่มขั้นตอนใหม่ในเส้นทางการเรียนรู้ ปัจจุบันมี ${learningPathItems.length} ขั้นตอน`"
            >
              <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
              เพิ่มขั้นตอน
            </button>
          </div>

          <!-- Pipeline Settings Summary -->
          <div class="mb-4 p-3 bg-white rounded-lg border border-blue-200">
            <h5 class="text-sm font-bold text-gray-800 mb-3 flex items-center">
              <font-awesome-icon :icon="['fas','cog']" class="mr-2 text-blue-500" />
              การตั้งค่าปัจจุบัน
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas','list-ol']" class="text-blue-500" />
                <span class="text-gray-600">ลำดับการเรียน:</span>
                <span class="font-semibold" :class="pipelineSettings.learningOrder === 'sequential' ? 'text-blue-700' : 'text-green-700'">
                  {{ pipelineSettings.learningOrder === 'sequential' ? 'เรียงตามลำดับ' : 'อิสระ' }}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas','certificate']" class="text-yellow-500" />
                <span class="text-gray-600">ใบรับรอง:</span>
                <span class="font-semibold" :class="pipelineSettings.certificate === 'issue' ? 'text-green-700' : 'text-red-700'">
                  {{ pipelineSettings.certificate === 'issue' ? 'แจก' : 'ไม่แจก' }}
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <font-awesome-icon :icon="['fas','clock']" class="text-red-500" />
                <span class="text-gray-600">ระยะเวลา:</span>
                <span class="font-semibold" :class="pipelineSettings.timeLimit === 'unlimited' ? 'text-green-700' : 'text-orange-700'">
                  {{ pipelineSettings.timeLimit === 'unlimited' ? 'ไม่จำกัด' : `${pipelineSettings.timeLimitDays} วัน` }}
                </span>
              </div>
            </div>
          </div>

          <!-- Pipeline Completion Summary -->
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="p-3 bg-white rounded-lg border border-blue-200">
              <div class="text-lg font-bold text-blue-600">{{ learningPathStats?.totalHours || 0 }}</div>
              <div class="text-xs text-gray-600">ชั่วโมงรวม</div>
            </div>
            <div class="p-3 bg-white rounded-lg border border-green-200">
              <div class="text-lg font-bold text-green-600">{{ learningPathStats?.activeCount || 0 }}</div>
              <div class="text-xs text-gray-600">หลักสูตรเปิดใช้งาน</div>
            </div>
            <div class="p-3 bg-white rounded-lg border border-purple-200">
              <div class="text-lg font-bold text-purple-600">{{ learningPathStats?.uniqueCategories || 0 }}</div>
              <div class="text-xs text-gray-600">หมวดหมู่</div>
            </div>
          </div>

          <!-- Learning Path Visualization -->
          <div class="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <h5 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span class="text-xl mr-3">🎯</span>
              เส้นทางการเรียนรู้
            </h5>
            <div class="flex flex-wrap items-center gap-3 pt-4">
              <template v-for="(item, index) in learningPathItems" :key="item._id">
                <div class="flex items-center gap-4 overflow-x-auto pb-2">
                  <!-- Step Card -->
                  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 relative learning-path-card w-48 min-w-48 mt-4"
                       :class="{ 'opacity-60 grayscale': !item.status }">
                    <!-- Step Number Badge -->
                    <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg step-badge z-10">
                      {{ index + 1 }}
                    </div>
                    
                    <!-- Card Content -->
                    <div class="ml-2">
                      <h6 class="text-base font-bold text-gray-900 mb-2 truncate w-full" :title="item.name">
                        {{ item.name }}
                      </h6>
                      
                      <!-- Course Details -->
                      <div class="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <div class="flex items-center bg-white px-1.5 py-0.5 rounded-full border border-blue-100">
                          <font-awesome-icon :icon="['fas','clock']" class="mr-1 text-blue-500" />
                          <span class="font-medium">{{ item.hours || 'ไม่ระบุ' }} ชม.</span>
                        </div>
                        <div class="flex items-center bg-white px-1.5 py-0.5 rounded-full border border-green-100">
                          <font-awesome-icon :icon="['fas','users']" class="mr-1 text-green-500" />
                          <span class="font-medium">{{ item.enrollUserCount || 0 }}</span>
                        </div>
                      </div>

                      <!-- Status Badge -->
                      <div class="flex justify-center">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              :class="item.status 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'">
                          <font-awesome-icon 
                            :icon="['fas', item.status ? 'check-circle' : 'times-circle']" 
                            class="mr-1"
                          />
                          {{ item.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Arrow to Next Step -->
                  <font-awesome-icon 
                    v-if="index < learningPathItems.length - 1" 
                    :icon="['fas','arrow-right']" 
                    class="mx-3 text-blue-400 text-lg flex-shrink-0"
                  />
                </div>
              </template>
            </div>

            <!-- Summary Footer -->
            <div v-if="learningPathItems.length > 1" class="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div class="flex items-center justify-center text-sm text-green-800">
                <font-awesome-icon :icon="['fas','trophy']" class="mr-2 text-green-600" />
                <span class="font-semibold">
                  เมื่อผ่านครบ {{ learningPathItems.length }} ขั้นตอน ผู้เรียนจะได้รับใบประกาศ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Course Selector Modal -->
  <Transition
    enter-active-class="modal-enter-active"
    leave-active-class="modal-leave-active"
    enter-from-class="modal-enter-from"
    leave-to-class="modal-leave-to"
  >
    <div v-if="showCourseSelector" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeCourseSelector"></div>

      <!-- Modal panel -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-4xl max-h-[80vh] overflow-x-hidden">
          <!-- Modal header -->
          <div class="bg-white px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <font-awesome-icon :icon="['fas','search']" class="text-blue-600" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900">เลือกหลักสูตรเพิ่มในเส้นทางการเรียนรู้</h3>
                  <p class="text-sm text-gray-600">เลือกหลักสูตรที่ต้องการเพิ่มเข้าเส้นทางการเรียนรู้</p>
                </div>
              </div>
              <button 
                @click="closeCourseSelector" 
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas','times']" class="text-xl" />
              </button>
            </div>
          </div>

          <!-- Search and Filter -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center space-x-4 mb-4">
              <div class="flex-1">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="ค้นหาหลักสูตร..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                @click="loadAvailableCourses"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <font-awesome-icon :icon="['fas','search']" class="mr-2" />
                ค้นหา
              </button>
            </div>

            <!-- Bulk Selection Controls -->
            <div v-if="selectableCoursesCount > 0" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <input
                  type="checkbox"
                  :checked="allSelectableCoursesSelected"
                  :indeterminate="hasSelectedCourses && !allSelectableCoursesSelected"
                  @change="toggleSelectAll"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm text-gray-700">
                  เลือกทั้งหมด ({{ selectableCoursesCount }} รายการ)
                </span>
                <span v-if="hasSelectedCourses" class="text-sm text-blue-600 font-medium">
                  - เลือกแล้ว {{ selectedCoursesCount }} รายการ
                </span>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  v-if="hasSelectedCourses"
                  @click="clearCourseSelection"
                  type="button"
                  class="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 underline"
                >
                  ยกเลิกการเลือก
                </button>
                <button
                  v-if="hasSelectedCourses"
                  @click="addSelectedCoursesToPipeline"
                  type="button"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <font-awesome-icon :icon="['fas','plus']" class="mr-2" />
                  เพิ่ม {{ selectedCoursesCount }} หลักสูตร
                </button>
              </div>
            </div>
          </div>

          <!-- Course List -->
          <div class="px-6 py-4 max-h-96 overflow-y-auto overflow-x-hidden">
            <div v-if="loading" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="text-gray-500 mt-2">กำลังโหลดหลักสูตร...</p>
            </div>

            <div v-else-if="availableCourses.length === 0" class="text-center py-8">
              <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <font-awesome-icon :icon="['fas','search']" class="text-gray-400 text-lg" />
              </div>
              <p class="text-gray-500">ไม่พบหลักสูตรที่ตรงกับการค้นหา</p>
            </div>

            <div v-else class="grid gap-3">
              <div 
                v-for="course in filteredCourses" 
                :key="course._id"
                class="p-3 border rounded-lg transition-colors w-full overflow-hidden"
                :class="{
                  'border-gray-200 hover:border-blue-300 hover:bg-blue-50': !isInLearningPath(course._id),
                  'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60': isInLearningPath(course._id),
                  'border-blue-300 bg-blue-50 ring-2 ring-blue-200': selectedCourses.includes(course._id) && !isInLearningPath(course._id)
                }"
              >
                <div class="flex items-center space-x-3">
                  <!-- Checkbox for selectable courses -->
                  <div v-if="!isInLearningPath(course._id)" class="flex-shrink-0">
                    <input
                      type="checkbox"
                      :checked="selectedCourses.includes(course._id)"
                      @change="toggleCourseSelection(course._id)"
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      @click.stop
                    />
                  </div>
                  <!-- Placeholder for inactive courses to maintain alignment -->
                  <div v-else class="flex-shrink-0 w-4 h-4"></div>

                  <div 
                    @click="!isInLearningPath(course._id) ? toggleCourseSelection(course._id) : null"
                    class="flex items-center space-x-3 flex-1 min-w-0"
                    :class="{ 'cursor-pointer': !isInLearningPath(course._id) }"
                  >
                    <div class="flex-shrink-0">
                      <div v-if="course.cover" class="w-10 h-10">
                        <img 
                          :src="course.cover" 
                          :alt="course.name"
                          class="w-full h-full object-cover rounded-lg border border-gray-200"
                          :class="{ 'filter grayscale opacity-60': isInLearningPath(course._id) }"
                        />
                      </div>
                      <div v-else class="w-10 h-10 rounded-lg flex items-center justify-center"
                           :class="isInLearningPath(course._id) ? 'bg-gray-200' : 'bg-gray-100'">
                        <font-awesome-icon :icon="['fas','book']" 
                                         :class="isInLearningPath(course._id) ? 'text-gray-400' : 'text-gray-500'" />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center space-x-2 mb-1">
                        <h4 class="text-sm font-medium truncate flex-1 min-w-0"
                            :class="isInLearningPath(course._id) ? 'text-gray-500' : 'text-gray-900'"
                            :title="course.name">
                          {{ course.name }}
                        </h4>
                        <span v-if="isInLearningPath(course._id)" 
                              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600 flex-shrink-0">
                          <font-awesome-icon :icon="['fas','check']" class="mr-1" />
                          อยู่ในเส้นทางการเรียนรู้แล้ว
                        </span>
                      </div>
                      <div class="flex items-center space-x-3 text-xs mt-1"
                           :class="isInLearningPath(course._id) ? 'text-gray-400' : 'text-gray-500'">
                        <span>{{ course.hours || 'ไม่ระบุ' }} ชม.</span>
                        <span>•</span>
                        <span>{{ course.enrollUserCount || 0 }} ผู้เรียน</span>
                        <span>•</span>
                        <span :class="course.status ? (isInLearningPath(course._id) ? 'text-green-500' : 'text-green-600') : (isInLearningPath(course._id) ? 'text-red-500' : 'text-red-600')">
                          {{ course.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="flex-shrink-0">
                    <button v-if="!isInLearningPath(course._id)"
                            @click="addToLearningPath(course)"
                            class="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="เพิ่มทันที">
                      <font-awesome-icon :icon="['fas','plus']" />
                    </button>
                    <div v-else class="p-1 text-gray-400">
                      <font-awesome-icon :icon="['fas','check']" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="bg-gray-50 px-6 py-3">
            <div class="flex justify-end space-x-3">
              <button
                @click="closeCourseSelector"
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Confirmation Dialog -->
  <Transition
    enter-active-class="modal-enter-active"
    leave-active-class="modal-leave-active"
    enter-from-class="modal-enter-from"
    leave-to-class="modal-leave-to"
  >
    <div v-if="showConfirmDialog" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeConfirmDialog"></div>

      <!-- Modal panel -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-4xl max-h-[80vh] overflow-x-hidden">
          <!-- Modal header -->
          <div class="bg-white px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <font-awesome-icon :icon="['fas','exclamation-circle']" class="text-blue-600" />
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ confirmTitle }}</h3>
                  <p class="text-sm text-gray-500">{{ confirmMessage }}</p>
                </div>
              </div>
              <button 
                @click="closeConfirmDialog" 
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas','times']" class="text-xl" />
              </button>
            </div>
          </div>

          <!-- Confirmation Buttons -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-end space-x-3">
              <button
                @click="executeConfirmAction"
                type="button"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                ยืนยัน
              </button>
              <button
                @click="closeConfirmDialog"
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
/**
 * Pipeline Management Component
 * 
 * Features:
 * - Manages course learning pipeline/prerequisites 
 * - Stores pipeline data directly in course.pipeline field
 * - Drag & drop reordering (with fallback buttons)
 * - Course selection modal with search
 * 
 * Data Structure:
 * courseData.pipeline = [
 *   {
 *     _id: "course_id",
 *     name: "Course Name", 
 *     cover: "image_url",
 *     hours: 10,
 *     enrollUserCount: 25,
 *     status: true,
 *     categoryData: [...],
 *     pipelineOrder: 0
 *   },
 *   ...
 * ]
 */
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';

const Request = new requestClient(false);

export default {
  props: {
    courseData: Object,
    callParentFunctionProp: Function,
    tabs: Object,
    updateTabs: Object,
  },
  components: {
    // Removed draggable component since we're not using drag & drop
  },
  data() {
    return {
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      learningPathItems: [],
      showCourseSelector: false,
      availableCourses: [],
      searchQuery: '',
      loading: false,
      showConfirmDialog: false,
      confirmAction: null,
      confirmMessage: '',
      confirmTitle: '',
      selectedItems: [],
      showBulkActions: false,
      isReordering: false,
      draggedIndex: null,
      showlearningPathStats: false,
      shortcutsEnabled: true,
      showShortcutsHelp: false,
      selectedCourses: [], // เพิ่มสำหรับเก็บหลักสูตรที่เลือกใน modal
      showPipelineSettings: false,
      pipelineSettings: {
        learningOrder: 'sequential', // sequential | flexible
        certificate: 'issue', // issue | no_issue
        timeLimit: 'unlimited', // unlimited | limited
        timeLimitDays: 30
      },
    };
  },
  computed: {
    filteredCourses() {
      if (!this.searchQuery) return this.availableCourses;
      
      const query = this.searchQuery.toLowerCase();
      return this.availableCourses.filter(course => 
        course.name.toLowerCase().includes(query) ||
        (course.categoryData && course.categoryData.some(cat => 
          cat.name.toLowerCase().includes(query)
        ))
      );
    },

    // Pipeline Statistics
    learningPathStats() {
      if (!this.learningPathItems.length) return null;
      
      // นับเฉพาะ active items (status: true)
      const activeItems = this.learningPathItems.filter(item => item.status);
      
      const totalHours = activeItems.reduce((sum, item) => sum + (parseInt(item.hours) || 0), 0);
      const totalEnrollments = activeItems.reduce((sum, item) => sum + (item.enrollUserCount || 0), 0);
      const activeCount = activeItems.length;
      const categories = [...new Set(activeItems.flatMap(item => 
        item.categoryData ? item.categoryData.map(cat => cat.name) : []
      ))];

      return {
        totalCourses: activeCount, // เปลี่ยนจาก this.pipelineItems.length เป็น activeCount
        totalHours,
        totalEnrollments,
        activeCount,
        inactiveCount: this.learningPathItems.length - activeCount,
        uniqueCategories: categories.length,
        categories,
        averageEnrollment: activeCount > 0 ? Math.round(totalEnrollments / activeCount) : 0,
        completionRate: this.learningPathItems.length > 0 ? (activeCount / this.learningPathItems.length * 100) : 0
      };
    },

    // Bulk Actions
    hasSelectedItems() {
      return this.selectedItems.length > 0;
    },

    selectedItemsCount() {
      return this.selectedItems.length;
    },

    canMoveSelectedUp() {
      if (!this.hasSelectedItems) return false;
      const minIndex = Math.min(...this.selectedItems);
      return minIndex > 0;
    },

    canMoveSelectedDown() {
      if (!this.hasSelectedItems) return false;
      const maxIndex = Math.max(...this.selectedItems);
      return maxIndex < this.learningPathItems.length - 1;
    },

    // Validation
    hasDuplicateCourses() {
      const courseIds = this.learningPathItems.map(item => item._id);
      return courseIds.length !== new Set(courseIds).size;
    },

    hasInactiveCourses() {
      return this.learningPathItems.some(item => !item.status);
    },

    // Course Selection
    hasSelectedCourses() {
      return this.selectedCourses.length > 0;
    },

    selectedCoursesCount() {
      return this.selectedCourses.length;
    },

    selectableCoursesCount() {
      return this.filteredCourses.filter(course => !this.isInLearningPath(course._id)).length;
    },

    allSelectableCoursesSelected() {
      const selectableCourses = this.filteredCourses.filter(course => !this.isInLearningPath(course._id));
      return selectableCourses.length > 0 && selectableCourses.every(course => 
        this.selectedCourses.includes(course._id)
      );
    }
  },
  methods: {
    async loadLearningPath() {
      try {
        // Load pipeline data from courseData directly
        console.log('loadLearningPath called - courseData exists:', !!this.courseData);
        
        if (this.courseData && this.courseData.pipeline) {
          console.log('Found pipeline data, length:', this.courseData.pipeline.length);
          this.learningPathItems = [...this.courseData.pipeline]; // ใช้ spread operator เพื่อสร้าง array ใหม่
        } else {
          console.log('No pipeline data found');
          this.learningPathItems = [];
        }
        
        this.updateBadge(this.learningPathItems.length);
        
        // บังคับให้ Vue re-render component
        await this.$nextTick();
        this.$forceUpdate();
      } catch (error) {
        console.error("Error loading pipeline:", error);
      }
    },

    async saveLearningPathOrder() {
      try {
        this.isReordering = true; // เพิ่ม loading state
        
        const payload = {
          data: {
            pipeline: this.learningPathItems
          }
        };

        console.log('Saving pipeline:', this.learningPathItems);
        const response = await Request.PUT(`course/${this.courseData._id}`, payload, this.configs.key);
        
        if (response.status === 200) {
          // Call parent to refresh course data
          this.callParentFunction();
          
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 2000,
            icon: 'success',
            title: 'สำเร็จ',
            text: 'บันทึกลำดับเส้นทางการเรียนรู้เรียบร้อยแล้ว',
          });
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error saving pipeline order:", error);
        
        // Provide more specific error messages
        let errorMessage = 'ไม่สามารถบันทึกลำดับเส้นทางการเรียนรู้ได้';
        if (error.message.includes('403')) {
          errorMessage = 'ไม่มีสิทธิ์ในการแก้ไขเส้นทางการเรียนรู้';
        } else if (error.message.includes('404')) {
          errorMessage = 'ไม่พบหลักสูตรที่ต้องการแก้ไข';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        }
        
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 4000,
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: errorMessage,
        });

        // Revert changes on error
        await this.loadLearningPath();
      } finally {
        this.isReordering = false;
      }
    },

    async loadAvailableCourses() {
      try {
        this.loading = true;
        
        let andConditions = [
          { unit: this.session.current._id },
          { _id: { $ne: this.courseData._id } }, // Exclude current course
          { status: true } // Only active courses
        ];

        // ลบการ exclude หลักสูตรที่อยู่ใน pipeline แล้วออก เพื่อให้แสดงสถานะ inactive แทน
        // if (this.pipelineItems.length > 0) {
        //   const existingIds = this.pipelineItems.map(item => item._id);
        //   andConditions.push({ _id: { $nin: existingIds } });
        // }

        if (this.searchQuery) {
          andConditions.push({
            name: { $regex: `.*${this.searchQuery}.*`, $options: 'i' }
          });
        }

        const pipeline = [
          {
            $match: { $and: andConditions }
          },
          {
            $lookup: {
              from: "category",
              localField: "category",
              foreignField: "code",
              as: "categoryData"
            }
          },
          {
            $lookup: {
              from: "enroll",
              let: { courseId: { $toString: "$_id" } },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: [ "$courseID", "$$courseId" ] }
                  }
                },
                {
                  $count: "userCount"
                }
              ],
              as: "enrollInfo"
            }
          },
          {
            $addFields: {
              enrollUserCount: {
                $ifNull: [{ $arrayElemAt: ["$enrollInfo.userCount", 0] }, 0]
              }
            }
          },
          {
            $sort: { name: 1 }
          },
          {
            $limit: 50
          }
        ];

        const { data: response } = await Request.POST(
          'course/aggregate',
          { pipeline },
          this.configs.key
        );

        this.availableCourses = response || [];
      } catch (error) {
        console.error("Error loading available courses:", error);
      } finally {
        this.loading = false;
      }
    },

    openCourseSelector() {
      this.showCourseSelector = true;
      this.loadAvailableCourses();
    },

    closeCourseSelector() {
      this.showCourseSelector = false;
      this.searchQuery = '';
      this.availableCourses = [];
      this.selectedCourses = []; // เคลียร์การเลือกเมื่อปิด modal
    },

    addToLearningPath(course) {
      // Add course to learning path with default status = true
      this.learningPathItems.push({
        ...course,
        status: true, // Default เป็น true เสมอ
        pipelineOrder: this.learningPathItems.length
      });
      
      this.saveLearningPathOrder();
      this.closeCourseSelector();
      this.updateBadge(this.learningPathItems.length);
      
      this.$swal({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: 'สำเร็จ',
        text: `เพิ่ม "${course.name}" เข้าเส้นทางการเรียนรู้แล้ว`,
      });
    },

    removeLearningPathItem(index) {
      this.confirmTitle = 'ยืนยันการลบ';
      this.confirmMessage = `คุณต้องการลบ "${this.learningPathItems[index].name}" ออกจากเส้นทางการเรียนรู้หรือไม่?`;
      this.confirmAction = () => this.doremoveLearningPathItem(index);
      this.showConfirmDialog = true;
    },

    doremoveLearningPathItem(index) {
      const removedItem = this.learningPathItems.splice(index, 1)[0];
      this.saveLearningPathOrder();
      this.updateBadge(this.learningPathItems.length);
      
      this.$swal({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: 'สำเร็จ',
        text: `ลบ "${removedItem.name}" ออกจากเส้นทางการเรียนรู้แล้ว`,
      });
    },

    viewCourseDetail(course) {
      // Open course detail in new tab
      const routeData = this.$router.resolve(`/lesson/detail/${course._id}`);
      window.open(routeData.href, '_blank');
    },

    handleImageError(event) {
      // Hide broken image and show fallback
      const img = event.target;
      const container = img.parentElement;
      img.style.display = 'none';
      
      if (!container.querySelector('.course-thumbnail-fallback')) {
        const fallback = document.createElement('div');
        fallback.className = 'course-thumbnail-fallback w-full h-full bg-gray-100 rounded-lg flex items-center justify-center';
        fallback.innerHTML = '<i class="fas fa-book text-gray-400"></i>';
        container.appendChild(fallback);
      }
    },

    updateBadge(badgeValue) {
      this.$emit('update-badge', { code: this.tabs.code, badge: badgeValue });
    },

    callParentFunction() {
      if (typeof this.callParentFunctionProp === 'function') {
        this.callParentFunctionProp();
      }
    },

    moveUp(index) {
      if (index > 0) {
        const item = this.learningPathItems.splice(index, 1)[0];
        this.learningPathItems.splice(index - 1, 0, item);
        this.saveLearningPathOrder();
      }
    },

    moveDown(index) {
      if (index < this.learningPathItems.length - 1) {
        const item = this.learningPathItems.splice(index, 1)[0];
        this.learningPathItems.splice(index + 1, 0, item);
        this.saveLearningPathOrder();
      }
    },

    // Confirmation Dialog Methods
    executeConfirmAction() {
      if (this.confirmAction && typeof this.confirmAction === 'function') {
        this.confirmAction();
      }
      this.closeConfirmDialog();
    },

    closeConfirmDialog() {
      this.showConfirmDialog = false;
      this.confirmAction = null;
      this.confirmMessage = '';
      this.confirmTitle = '';
    },

    // Bulk Actions
    toggleItemSelection(index) {
      const selectedIndex = this.selectedItems.indexOf(index);
      if (selectedIndex > -1) {
        this.selectedItems.splice(selectedIndex, 1);
      } else {
        this.selectedItems.push(index);
      }
    },

    selectAllItems() {
      this.selectedItems = this.learningPathItems.map((_, index) => index);
    },

    clearSelection() {
      this.selectedItems = [];
    },

    bulkRemove() {
      if (!this.hasSelectedItems) return;
      
      const selectedItems = this.selectedItems
        .map(index => this.learningPathItems[index])
        .filter(Boolean);
      
      this.confirmTitle = 'ยืนยันการลบหลายรายการ';
      this.confirmMessage = `คุณต้องการลบ ${selectedItems.length} รายการที่เลือกออกจากเส้นทางการเรียนรู้หรือไม่?`;
      this.confirmAction = this.doBulkRemove;
      this.showConfirmDialog = true;
    },

    doBulkRemove() {
      const sortedIndices = [...this.selectedItems].sort((a, b) => b - a);
      sortedIndices.forEach(index => {
        this.learningPathItems.splice(index, 1);
      });
      
      // Update order
      this.learningPathItems.forEach((item, idx) => {
        item.pipelineOrder = idx;
      });
      
      this.clearSelection();
      this.saveLearningPathOrder();
      this.updateBadge(this.learningPathItems.length);
      
      this.$swal({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: 'สำเร็จ',
        text: `ลบ ${sortedIndices.length} รายการออกจากเส้นทางการเรียนรู้แล้ว`,
      });
    },

    bulkMoveUp() {
      if (!this.canMoveSelectedUp) return;
      
      const sortedIndices = [...this.selectedItems].sort((a, b) => a - b);
      sortedIndices.forEach(index => {
        if (index > 0) {
          const item = this.learningPathItems.splice(index, 1)[0];
          this.learningPathItems.splice(index - 1, 0, item);
        }
      });
      
      // Update selected indices
      this.selectedItems = this.selectedItems.map(index => Math.max(0, index - 1));
      this.saveLearningPathOrder();
    },

    bulkMoveDown() {
      if (!this.canMoveSelectedDown) return;
      
      const sortedIndices = [...this.selectedItems].sort((a, b) => b - a);
      sortedIndices.forEach(index => {
        if (index < this.learningPathItems.length - 1) {
          const item = this.learningPathItems.splice(index, 1)[0];
          this.learningPathItems.splice(index + 1, 0, item);
        }
      });
      
      // Update selected indices
      this.selectedItems = this.selectedItems.map(index => 
        Math.min(this.learningPathItems.length - 1, index + 1)
      );
      this.saveLearningPathOrder();
    },

    // Keyboard Shortcuts
    handleKeydown(event) {
      if (!this.shortcutsEnabled) return;
      
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'a':
            event.preventDefault();
            this.selectAllItems();
            break;
          case 'Delete':
          case 'Backspace':
            event.preventDefault();
            if (this.hasSelectedItems) {
              this.bulkRemove();
            }
            break;
          case 'ArrowUp':
            event.preventDefault();
            this.bulkMoveUp();
            break;
          case 'ArrowDown':
            event.preventDefault();
            this.bulkMoveDown();
            break;
        }
      }
      
      if (event.key === 'Escape') {
        this.clearSelection();
        if (this.showCourseSelector) {
          this.closeCourseSelector();
        }
        if (this.showConfirmDialog) {
          this.closeConfirmDialog();
        }
      }
    },

    // Export/Import Pipeline
    exportLearningPath() {
      const exportData = {
        pipeline: this.learningPathItems.map(item => ({
          id: item._id,
          name: item.name,
          order: item.pipelineOrder
        })),
        metadata: {
          exportedAt: new Date().toISOString(),
          courseId: this.courseData._id,
          courseName: this.courseData.name,
          totalItems: this.learningPathItems.length
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learning-path-${this.courseData.slug || 'export'}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.$swal({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: 'สำเร็จ',
        text: 'Export เส้นทางการเรียนรู้เรียบร้อยแล้ว',
      });
    },

    // Validation Methods
    validateLearningPath() {
      const issues = [];
      
      if (this.hasDuplicateCourses) {
        issues.push('มีหลักสูตรซ้ำในเส้นทางการเรียนรู้');
      }
      
      if (this.hasInactiveCourses) {
        issues.push('มีหลักสูตรที่ไม่ได้เปิดใช้งาน');
      }
      
      if (this.learningPathItems.length === 0) {
        issues.push('เส้นทางการเรียนรู้ว่างเปล่า');
      }
      
      return {
        isValid: issues.length === 0,
        issues
      };
    },

    // Toggle Pipeline Item Status
    async toggleLearningPathItemStatus(index) {
      if (index < 0 || index >= this.learningPathItems.length) return;
      
      const item = this.learningPathItems[index];
      const oldStatus = item.status;
      const newStatus = !oldStatus;
      
      try {
        // Toggle status
        this.learningPathItems[index].status = newStatus;
        
        // Save changes
        await this.saveLearningPathOrder();
        
        // Show success message
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 2500,
          icon: 'success',
          title: newStatus ? 'เปิดใช้งานแล้ว' : 'ปิดใช้งานแล้ว',
          text: `"${item.name}" ${newStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}ในเส้นทางการเรียนรู้แล้ว`,
        });
        
      } catch (error) {
        // Revert status on error
        this.learningPathItems[index].status = oldStatus;
        
        console.error("Error toggling pipeline item status:", error);
        
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: 'ไม่สามารถเปลี่ยนสถานะได้ กรุณาลองใหม่อีกครั้ง',
        });
      }
    },

    isInLearningPath(courseId) {
      return this.learningPathItems.some(item => item._id === courseId);
    },

    toggleSelectAll() {
      if (this.allSelectableCoursesSelected) {
        this.selectedCourses = [];
      } else {
        // เลือกเฉพาะหลักสูตรที่ยังไม่อยู่ใน pipeline
        this.selectedCourses = this.filteredCourses
          .filter(course => !this.isInLearningPath(course._id))
          .map(course => course._id);
      }
    },

    clearCourseSelection() {
      this.selectedCourses = [];
    },

    addSelectedCoursesToPipeline() {
      const selectedCoursesToAdd = this.filteredCourses.filter(course => 
        this.selectedCourses.includes(course._id) && !this.isInLearningPath(course._id)
      );
      
      if (selectedCoursesToAdd.length === 0) return;
      
      // เพิ่มหลักสูตรทีละตัวเข้า learning path
      selectedCoursesToAdd.forEach(course => {
        this.learningPathItems.push({
          ...course,
          status: true, // Default เป็น true เสมอ
          pipelineOrder: this.learningPathItems.length
        });
      });
      
      this.saveLearningPathOrder();
      this.updateBadge(this.learningPathItems.length);
      this.closeCourseSelector();
      
      this.$swal({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        icon: 'success',
        title: 'สำเร็จ',
        text: `เพิ่ม ${selectedCoursesToAdd.length} หลักสูตรเข้าเส้นทางการเรียนรู้แล้ว`,
      });
    },

    toggleCourseSelection(courseId) {
      if (this.isInLearningPath(courseId)) return;
      
      const index = this.selectedCourses.indexOf(courseId);
      if (index > -1) {
        this.selectedCourses.splice(index, 1);
      } else {
        this.selectedCourses.push(courseId);
      }
    },

    // Pipeline Settings Methods
    loadLearningPathSettings() {
      if (this.courseData && this.courseData.pipelineSettings) {
        this.pipelineSettings = {
          ...this.pipelineSettings,
          ...this.courseData.pipelineSettings
        };
      }
    },

    async saveLearningPathSettings() {
      try {
        this.isReordering = true;
        
        const payload = {
          data: {
            pipelineSettings: this.pipelineSettings
          }
        };

        console.log('Saving pipeline settings:', this.pipelineSettings);
        const response = await Request.PUT(`course/${this.courseData._id}`, payload, this.configs.key);
        
        if (response.status === 200) {
          // Call parent to refresh course data
          this.callParentFunction();
          
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 2000,
            icon: 'success',
            title: 'สำเร็จ',
            text: 'บันทึกการตั้งค่าเส้นทางการเรียนรู้เรียบร้อยแล้ว',
          });
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error saving pipeline settings:", error);
        
        let errorMessage = 'ไม่สามารถบันทึกการตั้งค่าได้';
        if (error.message.includes('403')) {
          errorMessage = 'ไม่มีสิทธิ์ในการแก้ไขการตั้งค่า';
        } else if (error.message.includes('404')) {
          errorMessage = 'ไม่พบหลักสูตรที่ต้องการแก้ไข';
        }
        
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 4000,
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: errorMessage,
        });
      } finally {
        this.isReordering = false;
      }
    },
  },

  async mounted() {
    try {
      await this.loadLearningPath();
      this.loadLearningPathSettings();
      this.updateBadge(this.learningPathItems.length);
      
      // Add keyboard event listeners
      if (this.shortcutsEnabled) {
        document.addEventListener('keydown', this.handleKeydown);
      }
      
      // Initial validation
      const validation = this.validateLearningPath();
      if (!validation.isValid && this.learningPathItems.length > 0) {
        console.warn('Learning Path validation issues:', validation.issues);
      }
    } catch (error) {
      console.error("Error mounting PipelineList:", error);
    }
  },

  beforeUnmount() {
    // Remove keyboard event listeners
    if (this.shortcutsEnabled) {
      document.removeEventListener('keydown', this.handleKeydown);
    }
  },

  watch: {
    courseData: {
      handler(newVal) {
        if (newVal) {
          console.log('courseData updated, reloading pipeline');
          this.loadLearningPath();
          this.loadLearningPathSettings();
        }
      },
      deep: true,
      immediate: true  // เปลี่ยนเป็น true เพื่อเรียกทันทีเมื่อ mount
    },
    
    // เพิ่ม watcher สำหรับ pipeline โดยตรง
    'courseData.pipeline': {
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          console.log('courseData.pipeline changed, reloading');
          this.loadLearningPath();
        }
      },
      deep: true
    }
  }
};
</script>

<style scoped>
/* Pipeline Flow Styles - Static Layout */
.pipeline-flow-line {
  background: linear-gradient(to bottom, #3b82f6, #1d4ed8, #1e40af);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

/* Pipeline Node Styles - Static */
.pipeline-node {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.pipeline-node:hover {
  transform: scale(1.15);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.4);
}

/* Course Card Hover Effects - Static */
.course-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.course-card:hover {
  transform: translateX(8px) translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

/* Enhanced selection state */
.course-card.ring-2 {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.6);
}

/* Horizontal Connecting Line - Static */
.connecting-line {
  position: relative;
  overflow: hidden;
}

/* Progress Bar - Static */
.progress-bar {
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* Enhanced Interactive Elements */
input[type="checkbox"] {
  transition: all 0.2s ease;
}

/* Course Selection Enhancements */
input[type="checkbox"]:indeterminate {
  background-color: #3b82f6;
  border-color: #3b82f6;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3e%3c/svg%3e");
}

/* Selected course card highlight */
.ring-2.ring-blue-200 {
  transform: scale(1);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Modal animations */
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

/* Draggable transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
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

/* Hide horizontal scrollbar */
::-webkit-scrollbar:horizontal {
  display: none;
}

/* Ensure text truncation works properly */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* Prevent horizontal overflow */
.overflow-x-hidden {
  overflow-x: hidden !important;
}

/* Inactive Pipeline Items - จางลงเมื่อ status = false */
.pipeline-item-inactive {
  opacity: 0.5;
  filter: grayscale(30%);
  transition: all 0.3s ease;
}

.pipeline-item-inactive:hover {
  opacity: 0.7;
  filter: grayscale(15%);
}

.pipeline-step-inactive .pipeline-node {
  opacity: 0.7;
  filter: grayscale(40%);
}

.pipeline-step-inactive .connecting-line {
  opacity: 0.5;
  filter: grayscale(50%);
}

.pipeline-step-inactive .course-card {
  background-color: #fafafa;
  border-color: #e5e7eb;
}

.pipeline-step-inactive .progress-bar {
  opacity: 0.6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pipeline-node {
    transform: scale(0.8);
  }
  
  .course-card {
    margin-left: 0.5rem;
  }
  
  /* Stack vertically on mobile */
  .space-y-6 > div {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .course-card {
    margin-top: 1rem;
    margin-left: 0;
    width: 100%;
  }
}

/* Learning Path Card Enhancements */
.learning-path-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.learning-path-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

/* Learning Path Step Badge */
.step-badge {
  box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
}

/* Learning Path Responsive Adjustments */
@media (max-width: 768px) {
  .learning-path-card {
    width: 160px !important;
    min-width: 160px !important;
  }
}

@media (max-width: 640px) {
  .learning-path-card {
    width: 140px !important;
    min-width: 140px !important;
  }
}
</style> 