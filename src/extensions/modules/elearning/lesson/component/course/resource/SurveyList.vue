<template>
  <!-- Header Section -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas','square-check']" class="text-white text-sm" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">แบบสอบถาม</h2>
            <p class="text-xs text-gray-500">จัดการแบบสอบถามและการประเมินผล ({{ filteredSurveyList.length }}/{{ surveyList.length }} รายการ)</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-3">
          <!-- Bulk Actions -->
          <div v-if="selectedSurveys.length > 0" class="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-100">
            <span class="text-xs text-blue-700 font-medium">{{ selectedSurveys.length }} รายการ</span>
            <button
              @click="bulkDelete"
              class="inline-flex items-center px-2 py-0.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors"
            >
              <font-awesome-icon :icon="['fas','trash']" class="mr-1 text-xs" />
              ลบ
            </button>
            <button
              @click="clearSelection"
              class="inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
          </div>

          <!-- Export Button -->
          <button
            @click="exportSurveys"
            class="inline-flex items-center rounded-lg border border-transparent bg-gray-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <font-awesome-icon :icon="['fas','download']" class="mr-1.5" />
            ส่งออก
          </button>

          <!-- Add Survey Button -->
          <button
            @click="saveSurveyConfig"
            type="button"
            class="inline-flex items-center rounded-lg border border-transparent bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
            เพิ่มแบบสอบถาม
          </button>
        </div>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div v-if="surveyList.length > 0" class="px-4 py-3 bg-gray-50 border-b border-gray-200">
      <div class="flex flex-col lg:flex-row gap-3">
        <!-- Search Input -->
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <font-awesome-icon :icon="['fas','search']" class="text-gray-400 text-sm" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาแบบสอบถาม..."
              class="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button @click="searchQuery = ''" class="text-gray-400 hover:text-gray-600 transition-colors">
                <font-awesome-icon :icon="['fas','times']" class="text-sm" />
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="flex gap-2">
          <!-- Filter Dropdown -->
          <select
            v-model="filterStatus"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
          >
            <option value="all">ทั้งหมด</option>
            <option value="default">Default</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">ไม่ได้ Assign</option>
          </select>

          <!-- Sort Dropdown -->
          <select
            v-model="sortBy"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
          >
            <option value="name">เรียงตามชื่อ</option>
            <option value="created">วันที่สร้าง</option>
            <option value="questions">จำนวนคำถาม</option>
            <option value="score">ระดับคะแนน</option>
          </select>

          <!-- Sort Direction -->
          <button
            @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'"
            class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            <font-awesome-icon 
              :icon="['fas', sortDirection === 'asc' ? 'sort-amount-up' : 'sort-amount-down']" 
              class="text-sm" 
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div v-if="surveyList.length > 0" class="px-4 py-3 bg-emerald-50 border-b border-gray-200">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-lg font-bold text-emerald-600">{{ surveyList.length }}</div>
          <div class="text-xs text-gray-500">แบบสอบถามทั้งหมด</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-blue-600">{{ totalQuestions }}</div>
          <div class="text-xs text-gray-500">คำถามทั้งหมด</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-purple-600">{{ defaultSurveyCount }}</div>
          <div class="text-xs text-gray-500">Default</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-orange-600">{{ assignedSurveyCount }}</div>
          <div class="text-xs text-gray-500">Assigned</div>
        </div>
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
            <strong>หมายเหตุ:</strong> หากไม่มีการ Assign แบบสอบถามให้กับหลักสูตรนี้ หากหลักสูตรนี้มีการตั้งค่าให้แสดงแบบสอบถาม ระบบจะดึงแบบสอบถามที่ถูกต้องค่าเป็น "Default" มาใช้แสดงผล
          </p>
        </div>
        <div class="flex-shrink-0 ml-4">
          <div class="relative group">
            <button class="text-blue-400 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-100 transition-colors">
              <font-awesome-icon :icon="['fas','keyboard']" class="text-sm" />
            </button>
            <div class="absolute right-0 top-8 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
              <h4 class="text-xs font-semibold text-gray-800 mb-2">Keyboard Shortcuts</h4>
              <div class="space-y-1 text-xs text-gray-600">
                <div class="flex justify-between items-center">
                  <span>สร้างแบบสอบถามใหม่</span>
                  <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+N</kbd>
                </div>
                <div class="flex justify-between items-center">
                  <span>เลือกทั้งหมด</span>
                  <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+A</kbd>
                </div>
                <div class="flex justify-between items-center">
                  <span>ลบที่เลือก</span>
                  <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Delete</kbd>
                </div>
                <div class="flex justify-between items-center">
                  <span>ส่งออกข้อมูล</span>
                  <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Ctrl+E</kbd>
                </div>
                <div class="flex justify-between items-center">
                  <span>ยกเลิก/ปิด</span>
                  <kbd class="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">Esc</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Survey List -->
    <div class="p-4">
      <!-- Select All Checkbox -->
      <div v-if="filteredSurveyList.length > 0" class="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <label class="flex items-center cursor-pointer">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 focus:ring-2"
          />
          <span class="ml-2 text-sm font-medium text-gray-700">เลือกทั้งหมด</span>
        </label>
        <div class="text-sm text-gray-500">
          {{ filteredSurveyList.length }} รายการ
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredSurveyList.length === 0 && searchQuery" class="text-center py-8">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <font-awesome-icon :icon="['fas','search']" class="text-gray-400 text-lg" />
        </div>
        <h3 class="text-base font-medium text-gray-900 mb-2">ไม่พบแบบสอบถาม</h3>
        <p class="text-sm text-gray-500 mb-4">ไม่พบแบบสอบถามที่ตรงกับคำค้นหา "{{ searchQuery }}"</p>
        <button
          @click="searchQuery = ''"
          class="inline-flex items-center rounded-lg border border-transparent bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
        >
          ล้างการค้นหา
        </button>
      </div>

      <div v-else-if="surveyList.length === 0" class="text-center py-8">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <font-awesome-icon :icon="['fas','square-check']" class="text-gray-400 text-lg" />
        </div>
        <h3 class="text-base font-medium text-gray-900 mb-2">ยังไม่มีแบบสอบถาม</h3>
        <p class="text-sm text-gray-500 mb-4">เริ่มต้นสร้างแบบสอบถามสำหรับหลักสูตรนี้</p>
        <button
          @click="saveSurveyConfig"
          type="button"
          class="inline-flex items-center rounded-lg border border-transparent bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          สร้างแบบสอบถามแรก
        </button>
      </div>

      <!-- Survey Items -->
      <div v-else class="space-y-3">
        <div 
          v-for="(surveyItem, index) in filteredSurveyList" 
          :key="surveyItem._id" 
          class="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
          :class="{ 'ring-2 ring-emerald-500 border-emerald-300': selectedSurveys.includes(surveyItem._id) }"
        >
          <div class="p-4">
            <!-- Survey Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <!-- Selection Checkbox -->
                <input
                  type="checkbox"
                  :value="surveyItem._id"
                  v-model="selectedSurveys"
                  class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 focus:ring-2"
                />
                
                <!-- Survey Icon with Progress -->
                <div class="flex-shrink-0 relative">
                  <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <font-awesome-icon :icon="['fas','square-check']" class="text-emerald-600 text-base" />
                  </div>
                  <!-- Progress Ring -->
                  <div class="absolute inset-0">
                    <svg class="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        class="text-gray-200"
                        stroke="currentColor"
                        stroke-width="2"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        class="text-emerald-500"
                        stroke="currentColor"
                        stroke-width="2"
                        fill="none"
                        stroke-linecap="round"
                        :stroke-dasharray="`${getCompletionPercentage(surveyItem)}, 100`"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                </div>
                
                <!-- Survey Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-1">
                    <h3 class="text-base font-semibold text-gray-900">
                      {{ getSurveyIndex(surveyItem) }}. {{ surveyItem.name }}
                    </h3>
                    
                    <!-- Status Badges -->
                    <span v-if="surveyItem.default" 
                          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <font-awesome-icon :icon="['fas','star']" class="mr-1 text-xs" />
                      Default
                    </span>
                    <span v-if="courseData.surveyId === surveyItem._id" 
                          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <font-awesome-icon :icon="['fas','check-circle']" class="mr-1 text-xs" />
                      Assigned
                    </span>
                    
                    <!-- Completion Badge -->
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          :class="getCompletionBadgeClass(surveyItem)">
                      {{ getCompletionPercentage(surveyItem) }}% สมบูรณ์
                    </span>
                  </div>
                  
                  <!-- Survey Stats -->
                  <div class="flex items-center space-x-3 text-xs text-gray-500">
                    <span class="flex items-center">
                      <font-awesome-icon :icon="['fas','star']" class="mr-1 text-xs" />
                      คะแนน: <span class="font-medium text-gray-900 ml-1">{{ surveyItem.score || 0 }}</span>
                    </span>
                    <span class="text-gray-300">•</span>
                    <span class="flex items-center">
                      <font-awesome-icon :icon="['fas','folder']" class="mr-1 text-xs" />
                      หัวข้อ: <span class="font-medium text-gray-900 ml-1">{{ surveyItem.choiceGroups?.length || 0 }}</span>
                    </span>
                    <span class="text-gray-300">•</span>
                    <span class="flex items-center">
                      <font-awesome-icon :icon="['fas','question-circle']" class="mr-1 text-xs" />
                      คำถาม: <span class="font-medium text-gray-900 ml-1">{{ getSurveyQuestionCount(surveyItem) }}</span>
                    </span>
                    <span class="text-gray-300">•</span>
                    <span class="certificate-stat-badge" 
                          :class="getSurveyQuestionCount(surveyItem) > 0 ? 'has-questions' : 'no-questions'">
                      <font-awesome-icon :icon="['fas', getSurveyQuestionCount(surveyItem) > 0 ? 'check' : 'times']" class="mr-1 text-xs" />
                      {{ getSurveyQuestionCount(surveyItem) > 0 ? 'มีคำถาม' : 'ไม่มีคำถาม' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-200">
              <div class="flex items-center space-x-2">
                <button
                  @click="setDefaultSurvey(surveyItem._id)"
                  :class="{ 
                    'text-green-600 bg-green-50 border-green-200': surveyItem.default, 
                    'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100': !surveyItem.default 
                  }"
                  class="inline-flex items-center px-2.5 py-1 border rounded-md text-xs font-medium transition-colors"
                >
                  <font-awesome-icon :icon="['fas','bookmark']" class="mr-1 text-xs" />
                  {{ surveyItem.default ? 'Default' : 'ตั้งเป็น Default' }}
                </button>

                <button
                  @click="toggleAssignSurvey(surveyItem._id, index)"
                  :class="{ 
                    'text-blue-600 bg-blue-50 border-blue-200': courseData.surveyId === surveyItem._id,
                    'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100': courseData.surveyId !== surveyItem._id
                  }"
                  class="inline-flex items-center px-2.5 py-1 border rounded-md text-xs font-medium transition-colors"
                >
                  <font-awesome-icon :icon="['fas','link']" class="mr-1 text-xs" />
                  {{ isSurveyAssigned(surveyItem._id) ? 'Unassign' : 'Assign' }}
                </button>

                <!-- Duplicate Button -->
                <button
                  @click="duplicateSurvey(surveyItem)"
                  class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  <font-awesome-icon :icon="['fas','copy']" class="mr-1 text-xs" />
                  คัดลอก
                </button>
              </div>

              <div class="flex items-center space-x-1">
                <!-- Preview Button -->
                <button
                  @click="previewSurvey(surveyItem)"
                  class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  <font-awesome-icon :icon="['fas','eye']" class="mr-1 text-xs" />
                  ดูตัวอย่าง
                </button>
                
                <button 
                  @click="toggleExpand(surveyItem)"
                  type="button" 
                  class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                >
                  <font-awesome-icon :icon="['fas','edit']" class="mr-1 text-xs" />
                  แก้ไข
                </button>
                
                <button
                  @click="deleteSurvey(surveyItem._id, index)"
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

      <!-- Pagination -->
      <div v-if="filteredSurveyList.length > itemsPerPage" class="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div class="flex items-center">
          <span class="text-sm text-gray-600">
            แสดง {{ ((currentPage - 1) * itemsPerPage) + 1 }} ถึง {{ Math.min(currentPage * itemsPerPage, filteredSurveyList.length) }} 
            จาก {{ filteredSurveyList.length }} รายการ
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ก่อนหน้า
          </button>
          <span class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Survey Configuration Panel -->
  <div v-if="showSurveyConfig" class="bg-white rounded-lg shadow-sm border border-gray-200 mt-4 overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-emerald-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas','cog']" class="text-white text-sm" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-800">ตั้งค่าแบบสอบถาม</h3>
            <p class="text-xs text-gray-500">{{ selectedSurveyItem?.name || 'แบบสอบถามใหม่' }}</p>
          </div>
        </div>
        <button 
          @click="closeConfigPanel" 
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
        >
          <font-awesome-icon :icon="['fas','times']" class="text-sm" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Basic Information -->
      <div class="space-y-4 mb-5">
        <!-- Survey Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อแบบสอบถาม</label>
          <input 
            type="text" 
            v-model="surveyData.name" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
            placeholder="กรอกชื่อแบบสอบถาม"
          />
        </div>

        <!-- Description and Score in same row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
            <textarea 
              v-model="surveyData.description" 
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none" 
              placeholder="คำอธิบายแบบสอบถาม"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ระดับคะแนน</label>
            <div class="flex items-center bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
              <button 
                @click="decrementscore" 
                :disabled="surveyData.score <= 1"
                class="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'minus']" class="text-sm" />
              </button>
              <div class="flex-1 text-center py-2 bg-white border-x border-gray-300">
                <span class="text-lg font-semibold text-gray-800">{{ surveyData.score }}</span>
              </div>
              <button 
                @click="incrementscore" 
                :disabled="surveyData.score >= 5"
                class="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'plus']" class="text-sm" />
              </button>
            </div>
          </div>
        </div>

        <!-- Score Labels -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อระดับคะแนน</label>
          <div class="grid grid-cols-5 gap-2">
            <div v-for="(label, index) in scoreItemLabels" :key="index">
              <div class="text-xs text-gray-500 mb-1 text-center">ระดับ {{ index + 1 }}</div>
              <input 
                type="text" 
                v-model="scoreItemLabels[index]" 
                class="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                :placeholder="`ระดับ ${index + 1}`"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Choice Groups -->
      <div class="mb-5">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas','folder']" class="text-white text-xs" />
            </div>
            <h4 class="text-sm font-semibold text-gray-700">หัวข้อคำถาม</h4>
          </div>
          <button 
            @click="addChoiceGroup" 
            class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            <font-awesome-icon :icon="['fas','plus']" class="mr-2 text-xs" />
            เพิ่มหัวข้อ
          </button>
        </div>

        <div class="space-y-3">
          <div 
            v-for="(choiceGroup, groupIndex) in surveyData.choiceGroups" 
            :key="groupIndex" 
            class="border border-gray-200 rounded-lg overflow-hidden"
          >
            <!-- Group Header -->
            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div class="flex items-center space-x-3">
                <input 
                  type="text" 
                  v-model="choiceGroup.groupName" 
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                  placeholder="ชื่อหัวข้อ"
                />
                <select 
                  v-model="choiceGroup.groupType" 
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                >
                  <option value="">เลือกประเภท</option>
                  <option value="custom">Custom</option>
                  <option value="score">Score</option>
                </select>
                
                <!-- Group Actions -->
                <div class="flex items-center space-x-1">
                  <button 
                    @click="moveGroupUp(groupIndex)" 
                    :disabled="groupIndex === 0" 
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <font-awesome-icon :icon="['fas','chevron-up']" class="text-xs" />
                  </button>
                  <button 
                    @click="moveGroupDown(groupIndex)" 
                    :disabled="groupIndex === surveyData.choiceGroups.length - 1" 
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <font-awesome-icon :icon="['fas','chevron-down']" class="text-xs" />
                  </button>
                  <button 
                    @click="removeChoiceGroup(groupIndex)" 
                    class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <font-awesome-icon :icon="['fas','trash']" class="text-xs" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Choices -->
            <div class="p-4">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-gray-600">
                  คำถาม <span class="text-gray-400">{{ choiceGroup.groupName || 'ไม่มีชื่อ' }}</span>
                </span>
                <div class="flex items-center space-x-2">
                  <button 
                    @click="addChoice(groupIndex)" 
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <font-awesome-icon :icon="['fas','plus']" class="mr-1.5 text-xs" />
                    คำถาม
                  </button>
                  <button 
                    @click="addTextareaChoice(groupIndex)" 
                    class="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <font-awesome-icon :icon="['fas','comment']" class="mr-1.5 text-xs" />
                    ข้อความ
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <div 
                  v-for="(choice, choiceIndex) in choiceGroup.choices" 
                  :key="choiceIndex" 
                  class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      v-model="choice.isRequested" 
                      class="rounded border-gray-300 text-red-500 focus:ring-red-500/20 focus:ring-2"
                    />
                    <label class="text-xs text-red-500 font-medium">จำเป็น</label>
                  </div>
                  <input 
                    type="text" 
                    v-model="choice.choiceText" 
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
                    placeholder="ข้อความคำถาม"
                  />
                  <div class="flex items-center space-x-1">
                    <button 
                      @click="moveChoiceUp(groupIndex, choiceIndex)" 
                      :disabled="choiceIndex === 0" 
                      class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <font-awesome-icon :icon="['fas','chevron-up']" class="text-xs" />
                    </button>
                    <button 
                      @click="moveChoiceDown(groupIndex, choiceIndex)" 
                      :disabled="choiceIndex === choiceGroup.choices.length - 1" 
                      class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <font-awesome-icon :icon="['fas','chevron-down']" class="text-xs" />
                    </button>
                    <button 
                      @click="removeChoice(groupIndex, choiceIndex)" 
                      class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <font-awesome-icon :icon="['fas','trash']" class="text-xs" />
                    </button>
                  </div>
                </div>

                <div v-if="choiceGroup.choices.length === 0" class="text-center py-6 text-gray-400">
                  <font-awesome-icon :icon="['fas','question-circle']" class="text-2xl mb-2" />
                  <p class="text-sm">ยังไม่มีคำถามในหัวข้อนี้</p>
                  <p class="text-xs">คลิกปุ่ม "คำถาม" หรือ "ข้อความ" เพื่อเพิ่มคำถาม</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="surveyData.choiceGroups.length === 0" class="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
            <font-awesome-icon :icon="['fas','folder-open']" class="text-3xl mb-3" />
            <h4 class="text-base font-medium text-gray-600 mb-2">ยังไม่มีหัวข้อคำถาม</h4>
            <p class="text-sm text-gray-400 mb-4">เริ่มต้นสร้างหัวข้อคำถามสำหรับแบบสอบถามนี้</p>
            <button 
              @click="addChoiceGroup" 
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <font-awesome-icon :icon="['fas','plus']" class="mr-2 text-xs" />
              เพิ่มหัวข้อแรก
            </button>
          </div>
        </div>
      </div>

      <!-- Survey Preview -->
      <div v-if="surveyData.choiceGroups.length > 0" class="mb-5">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center mb-3">
            <div class="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <font-awesome-icon :icon="['fas','eye']" class="text-white text-xs" />
            </div>
            <h4 class="text-sm font-semibold text-gray-700">ตัวอย่างแบบสอบถาม</h4>
          </div>
          <SurveyResult 
            :surveyData="surveyData"
            :scoreItemLabels="scoreItemLabels"
            :surveyResults="'[]'"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button 
          @click="closeConfigPanel" 
          class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ยกเลิก
        </button>
        <button 
          @click="updateSurvey(selectedSurveyItem)" 
          class="px-6 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
        >
          บันทึกแบบสอบถาม
        </button>
      </div>
    </div>
  </div>

  <!-- Survey Submissions Section -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 mt-4">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <font-awesome-icon :icon="['fas','user-check']" class="text-white text-sm" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-900">แบบสอบถามที่ตอบกลับ</h2>
          <p class="text-xs text-gray-500">ผลการตอบแบบสอบถาม ({{ surveySubmission.length }} รายการ)</p>
        </div>
      </div>
    </div>

    <div class="p-4">
      <SurveySubmission 
        v-if="surveySubmission"
        ref="submissionTable"
        :surveySubmission="surveySubmission" 
        class="mt-2"
      />
    </div>
  </div>

  <!-- Toast Notifications -->
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <div
      v-for="(toast, index) in toasts"
      :key="index"
      class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out"
      :class="{
        'translate-x-0': toast.show,
        'translate-x-full': !toast.show
      }"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <div class="w-6 h-6 rounded-full flex items-center justify-center"
                 :class="{
                   'bg-green-100': toast.type === 'success',
                   'bg-red-100': toast.type === 'error',
                   'bg-blue-100': toast.type === 'info',
                   'bg-yellow-100': toast.type === 'warning'
                 }">
              <font-awesome-icon 
                :icon="getToastIcon(toast.type)" 
                class="text-sm"
                :class="{
                  'text-green-600': toast.type === 'success',
                  'text-red-600': toast.type === 'error',
                  'text-blue-600': toast.type === 'info',
                  'text-yellow-600': toast.type === 'warning'
                }"
              />
            </div>
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium text-gray-900">{{ toast.title }}</p>
            <p v-if="toast.message" class="mt-1 text-sm text-gray-500">{{ toast.message }}</p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="removeToast(index)"
              class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <font-awesome-icon :icon="['fas','times']" class="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Survey Preview Modal -->
  <div v-if="showPreviewModal" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closePreviewModal"></div>
      
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">ตัวอย่างแบบสอบถาม: {{ previewSurveyData?.name }}</h3>
            <button @click="closePreviewModal" class="text-gray-400 hover:text-gray-600">
              <font-awesome-icon :icon="['fas','times']" class="text-xl" />
            </button>
          </div>
          
          <div v-if="previewSurveyData" class="space-y-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">คำอธิบาย</h4>
              <p class="text-gray-700">{{ previewSurveyData.description || 'ไม่มีคำอธิบาย' }}</p>
            </div>
            
            <div v-for="(group, groupIndex) in previewSurveyData.choiceGroups" :key="groupIndex" class="border border-gray-200 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">{{ group.groupName }}</h4>
              <div class="space-y-3">
                <div v-for="(choice, choiceIndex) in group.choices" :key="choiceIndex" class="flex items-start space-x-3">
                  <span class="text-sm text-gray-500 mt-1">{{ choiceIndex + 1 }}.</span>
                  <div class="flex-1">
                    <p class="text-gray-900">{{ choice.choiceText }}</p>
                    <span v-if="choice.isRequested" class="text-xs text-red-500">* จำเป็น</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="closePreviewModal"
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { exam } from "@/master/type";
import storageManager       from '@/plugins/storage';
import SurveySubmission from './SurveySubmission.vue'; 

import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import debug from '@/plugins/Logger.js';
import SurveyResult from '../resource/SurveyResult.vue';

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
      showSurveyConfig: false,
      expandedExams: {},
      surveyData: {},
      surveyResults: [],
      scoreItemLabels: [],
      surveyList:[],
      surveySubmission:[],
      extractedUserIds: [],
      selectedSurveyItem: null,
      submissionTable:null,
      searchQuery: '',
      filterStatus: 'all',
      sortBy: 'name',
      sortDirection: 'asc',
      currentPage: 1,
      itemsPerPage: 10,
      selectedSurveys: [],
      totalPages: 1,
      totalQuestions: 0,
      defaultSurveyCount: 0,
      assignedSurveyCount: 0,
      showPreviewModal: false,
      previewSurveyData: null,
      toasts: [],
    };
  },
  components: {
    SurveySubmission,
    SurveyResult
  },
  watch: {
    surveyList: {
      handler() {
        this.updateStats();
      },
      deep: true
    },
    filteredSurveyList() {
      this.updateStats();
      // Reset to first page when filter changes
      this.currentPage = 1;
    },
    searchQuery() {
      this.currentPage = 1;
    },
    filterStatus() {
      this.currentPage = 1;
    }
  },
  computed: {
    examType() {
      return exam;
    },
    filteredSurveyList() {
      let filtered = this.surveyList.filter(survey => {
        const matchesSearch = survey.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesFilter = this.filterStatus === 'all' ||
          (this.filterStatus === 'default' && survey.default) ||
          (this.filterStatus === 'assigned' && this.courseData.surveyId === survey._id) ||
          (this.filterStatus === 'unassigned' && !this.courseData.surveyId);
        return matchesSearch && matchesFilter;
      });

      // Sorting
      if (this.sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (this.sortBy === 'created') {
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (this.sortBy === 'questions') {
        filtered.sort((a, b) => a.choiceGroups.reduce((total, group) => total + group.choices.length, 0) - b.choiceGroups.reduce((total, group) => total + group.choices.length, 0));
      } else if (this.sortBy === 'score') {
        filtered.sort((a, b) => a.score - b.score);
      }

      // Direction
      if (this.sortDirection === 'desc') {
        filtered.reverse();
      }

      return filtered;
    },
    isAllSelected() {
      return this.selectedSurveys.length === this.filteredSurveyList.length;
    },
  },
  methods: {
    async callbackFunction() {
      try {
        console.log("callbackFunction");
        await this.getQueryData();
      } catch (error) {
        console.error(error);
      }
    },
    updateBadge(badgeValue) {
      this.$emit('update-badge', { code: this.tabs.code, badge: badgeValue });
    },
    incrementscore() {
      if (this.surveyData.score < 5) {
        this.surveyData.score++;
        this.updateScoreItemLabels();
      }
    },
    decrementscore() {
      if (this.surveyData.score > 1) {
        this.surveyData.score--;
        this.updateScoreItemLabels();
      }
    },
    updateScoreItemLabels() {
      const newLength = parseInt(this.surveyData.score);
      const currentLabels = this.scoreItemLabels || [];
      
      if (newLength > currentLabels.length) {
        // เพิ่ม label ใหม่
        const additionalLabels = Array.from({ length: newLength - currentLabels.length }, () => "");
        this.scoreItemLabels = [...currentLabels, ...additionalLabels];
      } else if (newLength < currentLabels.length) {
        // ลด label โดยรักษาข้อมูลเดิมไว้
        this.scoreItemLabels = currentLabels.slice(0, newLength);
      }
      // ถ้าจำนวนเท่าเดิมก็ไม่ต้องทำอะไร
    },
    callParentFunction() {
      if (typeof this.callParentFunctionProp === 'function') {
        this.callParentFunctionProp();
      }
    },
    addChoiceGroup() {
      this.surveyData.choiceGroups.push({
        groupName: "",
        groupType: "", // Added groupType with an empty default value
        choices: [],
      });
    },
    addChoice(groupIndex) {
      this.surveyData.choiceGroups[groupIndex].choices.push({
        choiceText: "",
        type: "radio",
        choiceValue: null,
        isRequested: false,
      });
    },
    addTextareaChoice(groupIndex) {
      this.surveyData.choiceGroups[groupIndex].choices.push({
        choiceText: "",
        type: "textarea",
        choiceValue: null,
        isRequested: false,
      });
    },
    removeChoiceGroup(groupIndex) {
      this.surveyData.choiceGroups.splice(groupIndex, 1);
    },
    removeChoice(groupIndex, choiceIndex) {
      this.surveyData.choiceGroups[groupIndex].choices.splice(choiceIndex, 1);
    },
    moveGroupUp(groupIndex) {
      if (groupIndex > 0) {
        const tempGroup = this.surveyData.choiceGroups[groupIndex];
        this.surveyData.choiceGroups.splice(groupIndex, 1);
        this.surveyData.choiceGroups.splice(groupIndex - 1, 0, tempGroup);
      }
    },
    moveGroupDown(groupIndex) {
      if (groupIndex < this.surveyData.choiceGroups.length - 1) {
        const tempGroup = this.surveyData.choiceGroups[groupIndex];
        this.surveyData.choiceGroups.splice(groupIndex, 1);
        this.surveyData.choiceGroups.splice(groupIndex + 1, 0, tempGroup);
      }
    },
    moveChoiceUp(groupIndex, choiceIndex) {
      if (choiceIndex > 0) {
        const tempChoice = this.surveyData.choiceGroups[groupIndex].choices[choiceIndex];
        this.surveyData.choiceGroups[groupIndex].choices.splice(choiceIndex, 1);
        this.surveyData.choiceGroups[groupIndex].choices.splice(choiceIndex - 1, 0, tempChoice);
      }
    },
    moveChoiceDown(groupIndex, choiceIndex) {
      if (choiceIndex < this.surveyData.choiceGroups[groupIndex].choices.length - 1) {
        const tempChoice = this.surveyData.choiceGroups[groupIndex].choices[choiceIndex];
        this.surveyData.choiceGroups[groupIndex].choices.splice(choiceIndex, 1);
        this.surveyData.choiceGroups[groupIndex].choices.splice(choiceIndex + 1, 0, tempChoice);
      }
    },
    async saveSurveyConfig() {
      try {
        // สร้างข้อมูลแบบสอบถามใหม่
        const newSurveyData = {
          name: 'Survey Name',
          description: 'Survey Description',
          choiceGroups: [],
          score: 1,
          default: false,
          unit: this.session.current._id,
        };

        const requestData = {
          data: {
            ...newSurveyData,
            label: [""], // เริ่มต้นด้วย label เดียว
          },
        };
        
        const resAPILogin = await Request.POST('survey', requestData, this.configs.key);
        if (resAPILogin.status === 200) {
          await this.getSurvey();
          // เปิด config panel สำหรับแบบสอบถามใหม่
          this.toggleExpand(resAPILogin.data);
          this.showToast('success', 'สร้างแบบสอบถามสำเร็จ', 'แบบสอบถามใหม่ถูกสร้างเรียบร้อยแล้ว');
        } else {
          console.error('Error saving survey configuration:', resAPILogin.statusText);
          this.showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถสร้างแบบสอบถามได้');
        }
      } catch (error) {
        console.error('An error occurred while saving survey configuration:', error);
        this.showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถสร้างแบบสอบถามได้');
      }
    },
    async getSurvey() {
      console.log("getSurvey");
      try {
        const requestData = {
          method: 'find',
          args: [{ $and: [{ unit: this.session.current._id }] }],
        };

        const resAPISurvey = await Request.POST('survey/query', requestData, this.configs.key);

        if (resAPISurvey.status !== 200) {
          throw new Error(`Failed to fetch player data from API`);
        }
        console.log("resAPISurvey",resAPISurvey.data);
        this.surveyList = resAPISurvey.data;
        this.updateStats();
      } catch (error) {
        console.error('An error occurred while fetching player data:', error);
        throw error;
      }
    },
    async getSurveySubmission() {
      console.log("getSurveySubmission");
      const course = this.courseData;
      console.log("course",course);
      try {
        const pipeline = [
          {
            $match: {
              $and: [{ courseId: course._id }]
            },
          },
          {
            $set: {userId: { $toObjectId: "$userId" }},
          },
          {
            $lookup: {
              from: "user",
              localField: "userId",
              foreignField: "_id",
              as: "user"
            },
          },
          {
            $unwind: "$user"
          },
          {
            $facet: {
              survey: [{$skip: (1 - 1) * 10,},{$limit: 1600}],
              totalCount: [{$count: 'count'}],
            },
          },
        ];

        const resAPISurvey = await Request.POST('survey_submission/aggregate', {pipeline}, this.configs.key);
        if (resAPISurvey.status===200) {
          const data = resAPISurvey.data;
          console.log("data", data);
          this.surveySubmission = data[0].survey;
          this.updateBadge(data[0].survey.length)
        }
        
      } catch (error) {
        console.error('An error occurred while fetching progress data:', error);
        throw error;
      }
    },
    async setDefaultSurvey(selectedSurveyItemId) {
      try {
        // อัพเดทแต่ละ survey item แยกกัน
        for (const surveyItem of this.surveyList) {
          const updatedSurvey = { ...surveyItem };
          
          if (surveyItem._id === selectedSurveyItemId) {
            updatedSurvey.default = true;
          } else {
            updatedSurvey.default = false;
          }
          
          // ลบ _id ออกจาก data ที่จะส่ง
          const dataWithoutId = { ...updatedSurvey };
          delete dataWithoutId._id;
          
          const requestData = {
            data: dataWithoutId,
          };
          
          const resAPIUpdateSurvey = await Request.PUT(
            `survey/${surveyItem._id}`,
            requestData,
            this.configs.key
          );
          
          if (resAPIUpdateSurvey.status !== 200) {
            console.error('Error updating survey default status:', resAPIUpdateSurvey.statusText);
          }
        }
        
        // รีเฟรชข้อมูลหลังจากอัพเดทเสร็จ
        await this.getSurvey();
        this.showToast('success', 'ตั้งค่า Default สำเร็จ', 'แบบสอบถามถูกตั้งเป็น Default แล้ว');
      } catch (error) {
        console.error('An error occurred while setting default survey:', error);
        this.showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถตั้งค่า Default ได้');
      }
    },
    async updateSurvey(surveyItem) {
      try {
        const dataWithoutId = { ...surveyItem };
        delete dataWithoutId._id;

        // ตรวจสอบว่าเป็นการอัพเดทจาก config panel หรือไม่
        const isConfigUpdate = this.selectedSurveyItem && this.selectedSurveyItem._id === surveyItem._id;
        
        let requestData;
        
        if (isConfigUpdate) {
          // ถ้าเป็นการอัพเดทจาก config panel ให้ใช้ข้อมูลจาก form
          requestData = {
            data: {
              ...dataWithoutId,
              name: this.surveyData.name || surveyItem.name,
              description: this.surveyData.description || surveyItem.description,
              choiceGroups: this.surveyData.choiceGroups || surveyItem.choiceGroups,
              label: this.scoreItemLabels && this.scoreItemLabels.length > 0 ? this.scoreItemLabels : surveyItem.label,
              score: this.surveyData.score || surveyItem.score,
            },
          };
        } else {
          // ถ้าเป็นการอัพเดทอื่นๆ (เช่น set default) ให้ใช้ข้อมูลเดิมของ surveyItem
          requestData = {
            data: {
              ...dataWithoutId,
            },
          };
        }

        const resAPIUpdateSurvey = await Request.PUT(
          `survey/${surveyItem._id}`,
          requestData,
          this.configs.key
        );

        if (resAPIUpdateSurvey.status === 200) {
          await this.getSurvey();
          if (isConfigUpdate) {
            this.showSurveyConfig = false;
            this.showToast('success', 'บันทึกแบบสอบถามสำเร็จ', 'ข้อมูลแบบสอบถามถูกอัพเดทแล้ว');
          }
        } else {
          console.error('Error updating survey:', resAPIUpdateSurvey.statusText);
          this.showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกแบบสอบถามได้');
        }
      } catch (error) {
        console.error('An error occurred while updating survey:', error);
        this.showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกแบบสอบถามได้');
        throw error;
      }
    },
    toggleAssignSurvey(surveyItemId, index) {
      if (this.isSurveyAssigned(surveyItemId)) {
        this.assignSurvey(null, index);
      } else {
        this.assignSurvey(surveyItemId, index);
      }
    },
    isSurveyAssigned(surveyItemId) {
      return this.courseData.surveyId === surveyItemId;
    },
    async assignSurvey(surveyItemId, index) {
      try {
        const surveyItem = this.surveyList[index];
        if (surveyItem.default || !this.courseData) {
          console.error('Cannot assign the survey to the course.');
          return;
        }

        const requestData = {
          data: {
            surveyId: surveyItemId,
          },
        };

        const resAPIUpdateCourse = await Request.PUT(`course/${this.courseData._id}`, requestData, this.configs.key);

        if (resAPIUpdateCourse.status === 200) {
          this.callParentFunction();
          debug.log('Survey assigned to the course.');
          this.showToast('success', 'Assign แบบสอบถามสำเร็จ', 'แบบสอบถามถูก assign ให้กับหลักสูตรแล้ว');
        } else {
          console.error('Error assigning survey to the course:', resAPIUpdateCourse.statusText);
          this.showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถ assign แบบสอบถามได้');
        }
      } catch (error) {
        console.error('An error occurred while assigning the survey to the course:', error);
        this.showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถ assign แบบสอบถามได้');
        throw error;
      }
    },
    async deleteSurvey(surveyItemId, index) {
      try {
        const surveyItem = this.surveyList[index];
        if (surveyItem.default) {
          console.error('Cannot delete the default survey.');
          return;
        }

        const resAPIDeleteSurvey = await Request.DELETE(`survey/${surveyItemId}`, this.configs.key);

        if (resAPIDeleteSurvey.status === 200) {
          this.surveyList.splice(index, 1);
          this.showToast('success', 'ลบแบบสอบถามสำเร็จ', 'แบบสอบถามถูกลบออกจากระบบแล้ว');
        } else {
          console.error('Error deleting survey item:', resAPIDeleteSurvey.statusText);
          this.showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถลบแบบสอบถามได้');
        }
      } catch (error) {
        console.error('An error occurred while deleting survey item:', error);
        this.showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถลบแบบสอบถามได้');
      }
    },
    closeConfigPanel() {
      this.showSurveyConfig = false;
    },
    saveSurveyResult(result) {
      this.surveyResults = result;
      debug.log("Survey Result Saved:", result);
    },
    objectFindByKey(array, key, value) {
      for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
          return array[i];
        }
      }
      return null;
    },
    toggleExpand(survey) {
      // Check if the selectedSurveyItem is the same as the clicked survey
      if (this.selectedSurveyItem && this.selectedSurveyItem._id === survey._id) {
        // Clicked on the same survey item, toggle the configuration panel
        this.showSurveyConfig = !this.showSurveyConfig;
      } else {
        // Clicked on a different survey item, update selectedSurveyItem and show the configuration panel
        this.selectedSurveyItem = { ...survey }; // Deep copy to avoid reference issues
        
        // Copy survey data to form with proper fallbacks
        this.surveyData = {
          name: survey.name || '',
          description: survey.description || '',
          choiceGroups: survey.choiceGroups ? JSON.parse(JSON.stringify(survey.choiceGroups)) : [],
          score: survey.score || 1,
          default: survey.default || false,
          unit: survey.unit || this.session.current._id
        };
        
        // Handle scoreItemLabels properly
        if (survey.label && Array.isArray(survey.label)) {
          this.scoreItemLabels = [...survey.label];
        } else {
          // Initialize with default labels based on score
          this.scoreItemLabels = Array.from({ length: parseInt(survey.score || 1) }, () => "");
        }
        
        this.showSurveyConfig = true;
      }
    },
    isExpanded(examId) {
      // Check if the exam is expanded
      return this.expandedExams[examId];
    },
    getCompletionPercentage(survey) {
      if (!survey.choiceGroups || survey.choiceGroups.length === 0) return 0;
      
      let totalFields = 0;
      let completedFields = 0;
      
      // Check basic fields
      if (survey.name && survey.name.trim() !== '') completedFields++;
      totalFields++;
      
      if (survey.description && survey.description.trim() !== '') completedFields++;
      totalFields++;
      
      // Check choice groups
      survey.choiceGroups.forEach(group => {
        if (group.groupName && group.groupName.trim() !== '') completedFields++;
        totalFields++;
        
        if (group.choices && group.choices.length > 0) {
          group.choices.forEach(choice => {
            if (choice.choiceText && choice.choiceText.trim() !== '') completedFields++;
            totalFields++;
          });
        }
      });
      
      return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    },
    getCompletionBadgeClass(survey) {
      const percentage = this.getCompletionPercentage(survey);
      if (percentage >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      if (percentage >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      return 'bg-red-100 text-red-700 border-red-200';
    },
    getSurveyIndex(survey) {
      return this.filteredSurveyList.findIndex(item => item._id === survey._id) + 1;
    },
    getSurveyQuestionCount(survey) {
      if (!survey.choiceGroups) return 0;
      return survey.choiceGroups.reduce((totalQuestions, group) => {
        return totalQuestions + (group.choices ? group.choices.length : 0);
      }, 0);
    },
    getTimeAgo(timestamp) {
      if (!timestamp) return 'ไม่ทราบ';
      
      const now = new Date();
      const created = new Date(timestamp);
      const diffInSeconds = Math.floor((now - created) / 1000);
      
      if (diffInSeconds < 60) return 'เมื่อสักครู่';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;
      return `${Math.floor(diffInSeconds / 2592000)} เดือนที่แล้ว`;
    },
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedSurveys = [];
      } else {
        this.selectedSurveys = this.filteredSurveyList.map(survey => survey._id);
      }
    },
    async bulkDelete() {
      if (this.selectedSurveys.length === 0) return;
      
      const deleteCount = this.selectedSurveys.length;
      
      if (!confirm(`คุณต้องการลบแบบสอบถาม ${deleteCount} รายการที่เลือกหรือไม่?`)) {
        return;
      }
      
      try {
        for (const surveyId of this.selectedSurveys) {
          const surveyItem = this.surveyList.find(s => s._id === surveyId);
          if (surveyItem && !surveyItem.default) {
            await Request.DELETE(`survey/${surveyId}`, this.configs.key);
          }
        }
        
        await this.getSurvey();
        this.selectedSurveys = [];
        this.showToast('success', 'ลบแบบสอบถามสำเร็จ', `ลบแบบสอบถาม ${deleteCount} รายการเรียบร้อยแล้ว`);
      } catch (error) {
        console.error('Error in bulk delete:', error);
        this.showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถลบแบบสอบถามได้');
      }
    },
    clearSelection() {
      this.selectedSurveys = [];
    },
    async exportSurveys() {
      try {
        const dataToExport = this.filteredSurveyList.map(survey => ({
          name: survey.name,
          description: survey.description,
          choiceGroups: survey.choiceGroups?.length || 0,
          questions: this.getSurveyQuestionCount(survey),
          score: survey.score,
          default: survey.default,
          assigned: this.courseData.surveyId === survey._id
        }));
        
        const csvContent = this.convertToCSV(dataToExport);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `surveys_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showToast('success', 'ส่งออกข้อมูลสำเร็จ', 'ไฟล์ CSV ถูกดาวน์โหลดเรียบร้อยแล้ว');
      } catch (error) {
        console.error('Error exporting surveys:', error);
        this.showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถส่งออกข้อมูลได้');
      }
    },
    convertToCSV(data) {
      const headers = ['ชื่อ', 'คำอธิบาย', 'หัวข้อ', 'คำถาม', 'ระดับคะแนน', 'Default', 'Assigned'];
      const csvRows = [headers.join(',')];
      
      data.forEach(row => {
        const values = [
          `"${row.name}"`,
          `"${row.description}"`,
          row.choiceGroups,
          row.questions,
          row.score,
          row.default ? 'ใช่' : 'ไม่',
          row.assigned ? 'ใช่' : 'ไม่'
        ];
        csvRows.push(values.join(','));
      });
      
      return csvRows.join('\n');
    },
    previewSurvey(survey) {
      // Open preview modal or navigate to preview page
      console.log('Preview survey:', survey.name);
      // You can implement modal or navigation logic here
      this.previewSurveyData = survey;
      this.showPreviewModal = true;
    },
    async duplicateSurvey(survey) {
      try {
        const duplicatedSurvey = {
          name: `${survey.name} (สำเนา)`,
          description: survey.description,
          choiceGroups: survey.choiceGroups ? JSON.parse(JSON.stringify(survey.choiceGroups)) : [],
          score: survey.score,
          label: survey.label ? [...survey.label] : [],
          default: false,
          unit: this.session.current._id,
        };
        
        const requestData = {
          data: duplicatedSurvey,
        };
        
        const response = await Request.POST('survey', requestData, this.configs.key);
        if (response.status === 200) {
          await this.getSurvey();
          console.log('Survey duplicated successfully');
          this.showToast('success', 'คัดลอกแบบสอบถามสำเร็จ', 'แบบสอบถามถูกคัดลอกเรียบร้อยแล้ว');
        }
      } catch (error) {
        console.error('Error duplicating survey:', error);
        this.showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถคัดลอกแบบสอบถามได้');
      }
    },
    updateStats() {
      this.totalQuestions = this.surveyList.reduce((total, survey) => {
        return total + this.getSurveyQuestionCount(survey);
      }, 0);
      
      this.defaultSurveyCount = this.surveyList.filter(survey => survey.default).length;
      this.assignedSurveyCount = this.surveyList.filter(survey => 
        this.courseData.surveyId === survey._id
      ).length;
      
      this.totalPages = Math.ceil(this.filteredSurveyList.length / this.itemsPerPage);
    },
    closePreviewModal() {
      this.showPreviewModal = false;
    },
    removeToast(index) {
      this.toasts.splice(index, 1);
    },
    getToastIcon(type) {
      switch (type) {
        case 'success':
          return 'check-circle';
        case 'error':
          return 'times-circle';
        case 'info':
          return 'info-circle';
        case 'warning':
          return 'exclamation-circle';
        default:
          return 'question-circle';
      }
    },
    showToast(type, title, message = '', duration = 3000) {
      const toast = {
        type,
        title,
        message,
        show: false
      };
      
      this.toasts.push(toast);
      
      // Show toast with animation
      setTimeout(() => {
        toast.show = true;
      }, 100);
      
      // Auto remove toast
      setTimeout(() => {
        toast.show = false;
        setTimeout(() => {
          const index = this.toasts.indexOf(toast);
          if (index > -1) {
            this.toasts.splice(index, 1);
          }
        }, 300);
      }, duration);
    },
    handleKeyboardShortcuts(event) {
      // Ctrl/Cmd + N: New Survey
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        this.saveSurveyConfig();
      }
      
      // Ctrl/Cmd + A: Select All
      if ((event.ctrlKey || event.metaKey) && event.key === 'a' && this.filteredSurveyList.length > 0) {
        event.preventDefault();
        this.toggleSelectAll();
      }
      
      // Delete: Delete selected
      if (event.key === 'Delete' && this.selectedSurveys.length > 0) {
        event.preventDefault();
        this.bulkDelete();
      }
      
      // Escape: Clear selection or close modal
      if (event.key === 'Escape') {
        if (this.showPreviewModal) {
          this.closePreviewModal();
        } else if (this.showSurveyConfig) {
          this.closeConfigPanel();
        } else if (this.selectedSurveys.length > 0) {
          this.clearSelection();
        }
      }
      
      // Ctrl/Cmd + E: Export
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        this.exportSurveys();
      }
    },
  },
  async mounted() {
    try {
      await this.getSurvey();
      await this.getSurveySubmission();
      
      // Add keyboard shortcuts
      document.addEventListener('keydown', this.handleKeyboardShortcuts);
    } catch (error) {
      console.error(error); // Use the 'error' object, not 'Error'
    }
  },
  beforeUnmount() {
    // Remove keyboard shortcuts
    document.removeEventListener('keydown', this.handleKeyboardShortcuts);
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
  @apply btn-modern bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500;
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

/* Survey Card Animations */
.survey-card {
  @apply transition-all duration-200 hover:shadow-md hover:-translate-y-1;
}

/* Badge Styles */
.badge-modern {
  @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium;
}

.badge-primary-modern {
  @apply badge-modern bg-emerald-100 text-emerald-800;
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.gradient-bg-light {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
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
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500;
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
  @apply text-emerald-600 hover:text-emerald-800 underline;
}

/* Survey specific styles */
.survey-icon {
  @apply w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center;
}

.survey-icon svg {
  @apply text-emerald-600 text-lg;
}

/* Enhanced Survey Stats */
.survey-stat-badge {
  @apply inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium;
}

.survey-stat-badge.has-questions {
  @apply bg-green-100 text-green-800;
}

.survey-stat-badge.no-questions {
  @apply bg-gray-100 text-gray-600;
}

.certificate-stat-badge {
  @apply inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium;
}

.certificate-stat-badge.has-questions {
  @apply bg-green-100 text-green-800;
}

.certificate-stat-badge.no-questions {
  @apply bg-gray-100 text-gray-600;
}

.survey-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.survey-badge.default {
  @apply bg-green-100 text-green-800;
}

.survey-badge.assigned {
  @apply bg-blue-100 text-blue-800;
}

.survey-stats {
  @apply flex items-center space-x-4 text-sm text-gray-500;
}

.survey-stat-item {
  @apply flex items-center;
}

.survey-stat-item svg {
  @apply mr-1;
}

.survey-actions {
  @apply flex items-center justify-between pt-4 border-t border-gray-200;
}

.survey-action-group {
  @apply flex items-center space-x-4;
}

.survey-action-button {
  @apply inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium transition-colors;
}

.survey-action-button.default {
  @apply text-green-600 bg-green-50 border-green-200;
}

.survey-action-button.assigned {
  @apply text-blue-600 bg-blue-50 border-blue-200;
}

.survey-action-button.normal {
  @apply text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100;
}

.survey-action-button.edit {
  @apply text-gray-600 bg-white border-gray-200 hover:bg-gray-50;
}

.survey-action-button.delete {
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

/* Hide the up and down arrows (spinner buttons) in number type input */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0; /* Removes the default margin */
}
</style>
  