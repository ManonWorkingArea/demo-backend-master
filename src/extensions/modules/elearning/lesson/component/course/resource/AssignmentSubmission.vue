<template>
    
  <!-- FileBrowser Component -->
  <FileBrowser 
    v-if="fileBrowserOpen" 
    :isWindowsOpen="true" 
    :callbackFunction="'assignment-file'"
    :allowFileType="['pdf','doc','docx','xls','xlsx','ppt','pptx','txt']" 
    @file-browser-trigger="changeFileBrowserTrigger" 
    @file-browser-callback="selectFileBrowserTrigger" 
    style="z-index: 9999 !important;"
  />

  <!-- Header Section -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas','tasks']" class="text-white text-sm" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">ระบบส่งงาน</h2>
            <p class="text-xs text-gray-500">จัดการกิจกรรมและการส่งงานของหลักสูตร ({{ assignments && assignments.length ? assignments.length : 0 }} กิจกรรม)</p>
          </div>
        </div>
        
        <!-- Overall Statistics -->
        <div class="flex items-center space-x-4 mr-4">
          <div class="text-center">
            <div class="text-lg font-bold text-green-600">{{ getTotalSubmissions() }}</div>
            <div class="text-xs text-gray-500">งานที่ส่งมา</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-yellow-600">{{ getTotalScoredSubmissions() }}</div>
            <div class="text-xs text-gray-500">ให้คะแนนแล้ว</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-bold text-blue-600">{{ getAverageCompletionRate() }}%</div>
            <div class="text-xs text-gray-500">อัตราการส่งเฉลี่ย</div>
          </div>
        </div>
        
        <button
          @click="showAddAssignmentModal = true"
          type="button"
          class="inline-flex items-center rounded-lg border border-transparent bg-orange-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          เพิ่มกิจกรรม
        </button>
      </div>
    </div>

    <!-- Settings Section -->
    <div class="px-4 py-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-3">
          <div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
            <font-awesome-icon :icon="['fas','cog']" class="text-white text-xs" />
          </div>
          <h3 class="text-lg font-bold text-gray-900">การตั้งค่าระบบส่งงาน</h3>
        </div>
        <button
          @click="showSettings = !showSettings"
          type="button"
          class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border transition-colors"
          :class="showSettings 
            ? 'bg-blue-100 text-blue-700 border-blue-300' 
            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'"
        >
          <font-awesome-icon :icon="['fas', showSettings ? 'chevron-up' : 'chevron-down']" class="mr-1" />
          {{ showSettings ? 'ซ่อน' : 'แสดง' }}
        </button>
      </div>

      <!-- Settings Panel -->
      <div v-if="showSettings" class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        
        <!-- 1. ประเภทการส่งงาน -->
        <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center space-x-2 mb-3">
            <font-awesome-icon :icon="['fas','upload']" class="text-orange-500" />
            <h4 class="text-base font-bold text-gray-900">ประเภทการส่งงาน</h4>
          </div>
          <div class="space-y-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="globalSettings.submissionType"
                type="radio"
                value="file"
                class="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
              />
              <span class="text-sm text-gray-700">อัพโหลดไฟล์</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="globalSettings.submissionType"
                type="radio"
                value="text"
                class="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
              />
              <span class="text-sm text-gray-700">ข้อความ</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="globalSettings.submissionType"
                type="radio"
                value="both"
                class="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
              />
              <span class="text-sm text-gray-700">ทั้งสองอย่าง</span>
            </label>
          </div>
        </div>

        <!-- 2. การแจ้งเตือน -->
        <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center space-x-2 mb-3">
            <font-awesome-icon :icon="['fas','bell']" class="text-yellow-500" />
            <h4 class="text-base font-bold text-gray-900">การแจ้งเตือน</h4>
          </div>
          <div class="space-y-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="globalSettings.notifications.email"
                type="checkbox"
                class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span class="text-sm text-gray-700">อีเมล</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="globalSettings.notifications.system"
                type="checkbox"
                class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span class="text-sm text-gray-700">แจ้งเตือนในระบบ</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="globalSettings.notifications.reminder"
                type="checkbox"
                class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span class="text-sm text-gray-700">เตือนก่อนครบกำหนด</span>
            </label>
          </div>
          
          <!-- Reminder Days -->
          <div v-if="globalSettings.notifications.reminder" class="mt-3">
            <label class="block text-xs font-medium text-gray-700 mb-1">
              เตือนก่อนกี่วัน
            </label>
            <input
              v-model.number="globalSettings.notifications.reminderDays"
              type="number"
              min="1"
              max="30"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <!-- 3. การให้คะแนน -->
        <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div class="flex items-center space-x-2 mb-3">
            <font-awesome-icon :icon="['fas','star']" class="text-green-500" />
            <h4 class="text-base font-bold text-gray-900">การให้คะแนน</h4>
          </div>
          <div class="space-y-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="globalSettings.scoring.enabled"
                type="checkbox"
                class="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span class="text-sm text-gray-700">เปิดใช้งานการให้คะแนน</span>
            </label>
            
            <!-- Scoring Scale -->
            <div v-if="globalSettings.scoring.enabled" class="mt-3">
              <label class="block text-xs font-medium text-gray-700 mb-1">
                ช่วงคะแนน
              </label>
              <div class="flex items-center space-x-2">
                <input
                  v-model.number="globalSettings.scoring.minScore"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <span class="text-gray-500">ถึง</span>
                <input
                  v-model.number="globalSettings.scoring.maxScore"
                  type="number"
                  min="1"
                  placeholder="100"
                  class="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Settings Button -->
      <div v-if="showSettings" class="mt-4 flex justify-end">
        <button
          @click="saveGlobalSettings"
          type="button"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <font-awesome-icon :icon="['fas','save']" class="mr-2" />
          บันทึกการตั้งค่า
        </button>
      </div>
      
      <!-- Settings Summary (when collapsed) -->
      <div v-if="!showSettings" class="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div class="bg-white rounded-lg p-3 border border-gray-200">
          <div class="flex items-center space-x-2">
            <font-awesome-icon :icon="['fas','upload']" class="text-orange-500" />
            <div>
              <div class="text-xs text-gray-500">ประเภทการส่งงาน</div>
              <div class="font-medium text-gray-900">
                {{ globalSettings.submissionType === 'file' ? 'อัพโหลดไฟล์' : 
                   globalSettings.submissionType === 'text' ? 'ข้อความ' : 'ทั้งสองอย่าง' }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg p-3 border border-gray-200">
          <div class="flex items-center space-x-2">
            <font-awesome-icon :icon="['fas','bell']" class="text-yellow-500" />
            <div>
              <div class="text-xs text-gray-500">การแจ้งเตือน</div>
              <div class="font-medium text-gray-900">
                {{ getNotificationStatus() }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg p-3 border border-gray-200">
          <div class="flex items-center space-x-2">
            <font-awesome-icon :icon="['fas','star']" class="text-green-500" />
            <div>
              <div class="text-xs text-gray-500">การให้คะแนน</div>
              <div class="font-medium text-gray-900">
                {{ globalSettings.scoring.enabled ? `${globalSettings.scoring.minScore}-${globalSettings.scoring.maxScore} คะแนน` : 'ปิดใช้งาน' }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg p-3 border border-gray-200">
          <div class="flex items-center space-x-2">
            <font-awesome-icon :icon="['fas','chart-bar']" class="text-blue-500" />
            <div>
              <div class="text-xs text-gray-500">สถิติการใช้งาน</div>
              <div class="font-medium text-gray-900">
                {{ assignments.length }} กิจกรรม
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assignments List -->
    <div class="p-4">
      <div v-if="!assignments || assignments.length === 0" class="text-center py-8">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <font-awesome-icon :icon="['fas','clipboard-list']" class="text-gray-400 text-lg" />
        </div>
        <h3 class="text-base font-medium text-gray-900 mb-2">ยังไม่มีกิจกรรม</h3>
        <p class="text-sm text-gray-500 mb-4">เริ่มต้นสร้างกิจกรรมสำหรับให้ผู้เรียนส่งงาน</p>
        <button
          @click="showAddAssignmentModal = true"
          type="button"
          class="inline-flex items-center rounded-lg border border-transparent bg-orange-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" />
          สร้างกิจกรรมแรก
        </button>
      </div>

      <!-- Assignment Items -->
      <div v-else-if="assignments && assignments.length > 0" class="space-y-3">
        <div 
          v-for="(assignment, index) in assignments" 
          :key="assignment._id || assignment.id || index" 
          class="bg-white border rounded-lg transition-all duration-200 assignment-item"
          :class="{ 
            'border-orange-400 shadow-lg shadow-orange-100': expandedAssignments.includes(assignment._id || assignment.id),
            'border-gray-200 hover:shadow-md hover:border-gray-300': !expandedAssignments.includes(assignment._id || assignment.id)
          }"
        >
          <!-- Assignment Header -->
          <div 
            @click="toggleAssignmentExpand(assignment._id || assignment.id)"
            class="p-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg"
            :class="{ 'rounded-b-lg': !expandedAssignments.includes(assignment._id || assignment.id) }"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3 flex-1">
                <!-- Expand Icon -->
                <button class="p-1 hover:bg-gray-100 rounded transition-colors">
                  <font-awesome-icon 
                    :icon="['fas', expandedAssignments.includes(assignment._id || assignment.id) ? 'chevron-down' : 'chevron-right']" 
                    class="text-gray-400 transition-transform duration-200"
                  />
                </button>
                
                <!-- Assignment Icon -->
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  assignment.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                ]">
                  <font-awesome-icon 
                    :icon="['fas', 'clipboard-check']" 
                    :class="assignment.status === 'active' ? 'text-green-600' : 'text-gray-500'"
                  />
                </div>

                <!-- Assignment Info -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-base font-semibold text-gray-900">
                    {{ index + 1 }}. {{ assignment.title }}
                  </h4>
                  <div class="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <!-- Due Date -->
                    <span class="flex items-center">
                      <font-awesome-icon :icon="['fas','calendar']" class="mr-1" />
                      กำหนดส่ง: 
                      <span class="font-medium ml-1">
                        {{ assignment.dueType === 'fixed' 
                          ? formatDate(assignment.dueDate) 
                          : `${assignment.dueDays} วันหลังเรียนจบ` 
                        }}
                      </span>
                    </span>
                    
                    <!-- File Settings -->
                    <span class="flex items-center">
                      <font-awesome-icon :icon="['fas','file']" class="mr-1" />
                      ไฟล์: {{ assignment.fileSettings.maxFiles }} ไฟล์ (สูงสุด {{ assignment.fileSettings.maxSizeMB }}MB)
                    </span>
                    
                    <!-- Submissions Count -->
                    <span class="flex items-center">
                      <font-awesome-icon :icon="['fas','users']" class="mr-1" />
                      ส่งแล้ว: 
                      <span class="font-medium ml-1">{{ getSubmissionCount(assignment._id || assignment.id) }} คน</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center space-x-2 ml-4">
                <!-- Status Toggle -->
                <button
                  @click.stop="toggleAssignmentStatus(assignment)"
                  :class="[
                    'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                    assignment.status === 'active' 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  <font-awesome-icon 
                    :icon="['fas', assignment.status === 'active' ? 'toggle-on' : 'toggle-off']" 
                    class="mr-1" 
                  />
                  {{ assignment.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                </button>

                <!-- Edit -->
                <button
                  @click.stop="editAssignment(assignment)"
                  class="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="แก้ไข"
                >
                  <font-awesome-icon :icon="['fas','edit']" class="text-sm" />
                </button>

                <!-- Delete -->
                <button
                  @click.stop="deleteAssignment(assignment._id || assignment.id)"
                  class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="ลบ"
                >
                  <font-awesome-icon :icon="['fas','trash']" class="text-sm" />
                </button>
              </div>
            </div>
          </div>

          <!-- Expanded Content - Submissions -->
          <div v-if="expandedAssignments.includes(assignment._id || assignment.id)" class="border-t border-gray-200 rounded-b-lg overflow-hidden">
            <!-- Assignment Details -->
            <div class="p-4 bg-gray-50">
              <div class="flex flex-col lg:flex-row gap-4 text-sm">
                <!-- รายละเอียดกิจกรรม - ขยายเต็มพื้นที่ -->
                <div class="flex-1">
                  <h5 class="font-semibold text-gray-700 mb-2">รายละเอียดกิจกรรม</h5>
                  <p class="text-gray-600 mb-3">{{ assignment.description || 'ไม่มีคำอธิบาย' }}</p>
                  
                  <!-- Assignment Content Type -->
                  <div class="mb-3">
                    <span class="text-xs font-medium text-gray-500">ประเภทโจทย์:</span>
                    <div class="flex items-center mt-1">
                      <div class="w-4 h-4 rounded-md flex items-center justify-center mr-2"
                           :class="assignment.contentType === 'file' ? 'bg-blue-100' : 'bg-green-100'">
                        <font-awesome-icon 
                          :icon="['fas', assignment.contentType === 'file' ? 'file' : 'edit']" 
                          :class="assignment.contentType === 'file' ? 'text-blue-600' : 'text-green-600'"
                          class="text-xs" 
                        />
                      </div>
                      <span class="text-sm font-medium">{{ 
                        assignment.contentType === 'file' ? 'ไฟล์เอกสาร' : 
                        assignment.contentType === 'text' ? 'ข้อความ (Text Editor)' : 'ไม่ระบุ' 
                      }}</span>
                    </div>
                  </div>
                  
                  <!-- Allowed File Types -->
                  <div class="mt-2">
                    <span class="text-xs font-medium text-gray-500">ประเภทไฟล์ที่อนุญาต:</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <span 
                        v-for="type in assignment.fileSettings.allowedTypes" 
                        :key="type"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        .{{ type }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- สถิติการส่งงาน - ชิดขวา -->
                <div class="w-full lg:w-80 flex-shrink-0">
                  <h5 class="font-semibold text-gray-700 mb-2">สถิติการส่งงาน</h5>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="bg-white p-2 rounded border border-gray-200">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas','check-circle']" class="text-green-500 mr-1 text-xs" />
                          <span class="text-xs text-gray-500">ส่งแล้ว</span>
                        </div>
                        <span class="text-sm font-bold text-green-600">{{ getSubmittedCount(assignment._id || assignment.id) }}</span>
                      </div>
                    </div>
                    <div class="bg-white p-2 rounded border border-gray-200">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas','clock']" class="text-orange-500 mr-1 text-xs" />
                          <span class="text-xs text-gray-500">รอส่ง</span>
                        </div>
                        <span class="text-sm font-bold text-orange-600">{{ getPendingCount(assignment._id || assignment.id) }}</span>
                      </div>
                    </div>
                    <div class="bg-white p-2 rounded border border-gray-200">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas','users']" class="text-blue-500 mr-1 text-xs" />
                          <span class="text-xs text-gray-500">รวมทั้งหมด</span>
                        </div>
                        <span class="text-sm font-bold text-blue-600">{{ getTotalStudents() }}</span>
                      </div>
                    </div>
                    
                    <!-- Completion Rate -->
                    <div class="bg-white p-2 rounded border border-gray-200">
                      <div class="mb-1">
                        <div class="flex items-center justify-between">
                          <span class="text-xs text-gray-500">อัตราส่งงาน</span>
                          <span class="text-sm font-bold text-gray-900">{{ getCompletionRate(assignment._id || assignment.id) }}%</span>
                        </div>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-1.5">
                        <div class="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                             :style="`width: ${getCompletionRate(assignment._id || assignment.id)}%`">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submissions List -->
            <div class="p-4">
              <div class="flex items-center justify-between mb-3">
                <h5 class="font-semibold text-gray-700 flex items-center">
                  <font-awesome-icon :icon="['fas','folder-open']" class="mr-2 text-orange-500" />
                  งานที่ส่งมา ({{ getSubmissions(assignment._id || assignment.id).length }} รายการ)
                </h5>
                
                <!-- Submission Stats Summary -->
                <div class="flex items-center space-x-4 text-xs">
                  <div class="flex items-center space-x-1">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span class="text-gray-600">ส่งแล้ว: {{ getSubmittedCount(assignment._id || assignment.id) }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span class="text-gray-600">ให้คะแนนแล้ว: {{ getScoredCount(assignment._id || assignment.id) }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span class="text-gray-600">เลยกำหนด: {{ getOverdueCount(assignment._id || assignment.id) }}</span>
                  </div>
                </div>
              </div>
              
              <div v-if="getSubmissions(assignment._id || assignment.id).length === 0" class="text-center py-6 text-gray-500">
                <font-awesome-icon :icon="['fas','inbox']" class="text-3xl mb-2" />
                <p>ยังไม่มีผู้ส่งงาน</p>
                <p class="text-xs mt-1">กิจกรรมนี้ยังไม่มีผู้เรียนส่งงานเข้ามา</p>
              </div>
              
              <div v-else class="space-y-2">
                <div 
                  v-for="submission in getSubmissions(assignment._id || assignment.id)" 
                  :key="submission._id"
                  class="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all duration-200"
                  :class="{
                    'border-green-200 bg-green-50': submission.score !== null,
                    'border-red-200 bg-red-50': isOverdue(submission, assignment),
                    'border-yellow-200 bg-yellow-50': submission.status === 'late'
                  }"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <!-- User Avatar -->
                      <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <font-awesome-icon :icon="['fas','user']" class="text-blue-600 text-sm" />
                      </div>
                      
                      <!-- Submission Info -->
                      <div>
                        <h6 class="text-sm font-medium text-gray-900">{{ submission.userName }}</h6>
                        <div class="flex items-center space-x-3 text-xs text-gray-500">
                          <span>
                            <font-awesome-icon :icon="['fas','clock']" class="mr-1" />
                            ส่งเมื่อ: {{ formatDateTime(submission.submittedAt) }}
                          </span>
                          <span v-if="submission.files && submission.files.length > 0">
                            <font-awesome-icon :icon="['fas','paperclip']" class="mr-1" />
                            {{ submission.files.length }} ไฟล์
                          </span>
                          <span v-if="submission.textContent">
                            <font-awesome-icon :icon="['fas','align-left']" class="mr-1" />
                            มีข้อความ
                          </span>
                          <!-- Status badges -->
                          <span v-if="isOverdue(submission, assignment)" class="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                            เลยกำหนด
                          </span>
                          <span v-else-if="submission.status === 'late'" class="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                            ส่งช้า
                          </span>
                          <span v-else class="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            ตรงเวลา
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center space-x-2">
                      <!-- Score Badge -->
                      <span v-if="submission.score !== null" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        <font-awesome-icon :icon="['fas','star']" class="mr-1" />
                        {{ submission.score }} คะแนน
                      </span>
                      <span v-else class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        ยังไม่ให้คะแนน
                      </span>
                      
                      <!-- View Button -->
                      <button
                        @click="viewSubmission(submission)"
                        class="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        <font-awesome-icon :icon="['fas','eye']" class="mr-1" />
                        ดูงาน
                      </button>
                      
                      <!-- Score Button -->
                      <button
                        v-if="globalSettings.scoring.enabled"
                        @click="scoreSubmission(submission)"
                        class="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
                      >
                        <font-awesome-icon :icon="['fas','star']" class="mr-1" />
                        {{ submission.score !== null ? 'แก้ไขคะแนน' : 'ให้คะแนน' }}
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

  <!-- Add/Edit Assignment Modal -->
  <Transition
    enter-active-class="modal-enter-active"
    leave-active-class="modal-leave-active"
    enter-from-class="modal-enter-from"
    leave-to-class="modal-leave-to"
  >
    <div v-if="showAddAssignmentModal" class="fixed inset-0 z-40 overflow-y-auto assignment-modal">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeAssignmentModal"></div>
      
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-2xl">
          <!-- Modal Header -->
          <div class="bg-white px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ editingAssignment ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่' }}
              </h3>
              <button 
                @click="closeAssignmentModal" 
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <font-awesome-icon :icon="['fas','times']" class="text-xl" />
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <form @submit.prevent="saveAssignment" class="space-y-4">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อกิจกรรม <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="assignmentForm.title"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="เช่น การบ้านครั้งที่ 1"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  คำอธิบาย
                </label>
                <textarea
                  v-model="assignmentForm.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="อธิบายรายละเอียดของกิจกรรม"
                ></textarea>
              </div>

              <!-- Assignment Content Type Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">ประเภทโจทย์</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label class="relative flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all"
                         :class="assignmentForm.contentType === 'text' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'">
                    <input 
                      v-model="assignmentForm.contentType"
                      type="radio" 
                      value="text"
                      class="sr-only"
                    />
                    <div class="flex items-center space-x-3">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center"
                           :class="assignmentForm.contentType === 'text' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'">
                        <font-awesome-icon :icon="['fas','edit']" class="text-xs" />
                      </div>
                      <div>
                        <div class="font-medium text-gray-900 text-sm">ข้อความ (Text Editor)</div>
                        <div class="text-xs text-gray-500">เขียนโจทย์ด้วย Text Editor</div>
                      </div>
                    </div>
                  </label>
                  
                  <label class="relative flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all"
                         :class="assignmentForm.contentType === 'file' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'">
                    <input 
                      v-model="assignmentForm.contentType"
                      type="radio" 
                      value="file"
                      class="sr-only"
                    />
                    <div class="flex items-center space-x-3">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center"
                           :class="assignmentForm.contentType === 'file' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'">
                        <font-awesome-icon :icon="['fas','file']" class="text-xs" />
                      </div>
                      <div>
                        <div class="font-medium text-gray-900 text-sm">ไฟล์เอกสาร</div>
                        <div class="text-xs text-gray-500">อัปโหลดไฟล์โจทย์</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Assignment Content -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">เนื้อหาโจทย์</label>
                
                <!-- Text Editor Mode -->
                <div v-if="assignmentForm.contentType === 'text'">
                  <editor 
                    :content="assignmentForm.contentText"
                    @update-content="updateAssignmentContent"
                    height="300px"
                    placeholder="เขียนโจทย์และรายละเอียดของกิจกรรมที่นี่..."
                    class="border border-gray-300 rounded-md"
                  />
                </div>
                
                <!-- File Upload Mode -->
                <div v-else-if="assignmentForm.contentType === 'file'" class="space-y-3">
                  <!-- Current File Display -->
                  <div v-if="assignmentForm.contentFile" class="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <font-awesome-icon :icon="['fas', getFileIcon(assignmentForm.contentFile)]" class="text-blue-600 text-sm" />
                        </div>
                        <div>
                          <div class="font-medium text-gray-900 text-sm">{{ getFileName(assignmentForm.contentFile) }}</div>
                          <div class="text-xs text-gray-500">ไฟล์โจทย์</div>
                        </div>
                      </div>
                      <button
                        @click="clearContentFile"
                        type="button"
                        class="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="ลบไฟล์"
                      >
                        <font-awesome-icon :icon="['fas','trash']" class="text-sm" />
                      </button>
                    </div>
                  </div>
                  
                  <!-- File Upload Button -->
                  <button
                    @click="openFileBrowser"
                    type="button"
                    class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all text-center"
                  >
                    <div class="flex flex-col items-center space-y-2">
                      <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <font-awesome-icon :icon="['fas','cloud-upload']" class="text-gray-500" />
                      </div>
                      <div>
                        <div class="font-medium text-gray-900 text-sm">
                          {{ assignmentForm.contentFile ? 'เปลี่ยนไฟล์โจทย์' : 'เลือกไฟล์โจทย์' }}
                        </div>
                        <div class="text-xs text-gray-500">รองรับไฟล์ PDF, Word, Excel, PowerPoint, Text</div>
                      </div>
                    </div>
                  </button>
                  
                  <!-- Additional Description for File Mode -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">คำแนะนำเพิ่มเติม (ไม่บังคับ)</label>
                    <textarea
                      v-model="assignmentForm.additionalInfo"
                      rows="2"
                      placeholder="คำแนะนำเพิ่มเติมสำหรับผู้เรียน..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Due Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  กำหนดส่ง <span class="text-red-500">*</span>
                </label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input
                      v-model="assignmentForm.dueType"
                      type="radio"
                      value="fixed"
                      class="mr-2 text-orange-600 focus:ring-orange-500"
                    />
                    <span class="text-sm">กำหนดวันที่แน่นอน</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="assignmentForm.dueType"
                      type="radio"
                      value="relative"
                      class="mr-2 text-orange-600 focus:ring-orange-500"
                    />
                    <span class="text-sm">กำหนดตามจำนวนวันหลังเรียนจบ</span>
                  </label>
                </div>
              </div>

              <!-- Due Date/Days Input -->
              <div v-if="assignmentForm.dueType === 'fixed'">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  วันที่กำหนดส่ง <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="assignmentForm.dueDate"
                  type="datetime-local"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div v-else-if="assignmentForm.dueType === 'relative'">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนวันหลังเรียนจบ <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="assignmentForm.dueDays"
                  type="number"
                  min="1"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="เช่น 7"
                />
              </div>

              <!-- File Settings -->
              <div class="border-t pt-4">
                <h4 class="text-sm font-medium text-gray-700 mb-3">การตั้งค่าไฟล์</h4>
                
                <!-- Allowed File Types -->
                <div class="mb-3">
                  <label class="block text-sm text-gray-600 mb-2">ประเภทไฟล์ที่อนุญาต</label>
                  <div class="grid grid-cols-4 gap-2">
                    <label v-for="type in fileTypes" :key="type" class="flex items-center">
                      <input
                        type="checkbox"
                        :value="type"
                        v-model="assignmentForm.fileSettings.allowedTypes"
                        class="mr-2 text-orange-600 focus:ring-orange-500"
                      />
                      <span class="text-sm">.{{ type }}</span>
                    </label>
                  </div>
                </div>

                <!-- Max Files -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">จำนวนไฟล์สูงสุด</label>
                    <input
                      v-model.number="assignmentForm.fileSettings.maxFiles"
                      type="number"
                      min="1"
                      max="10"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <!-- Max Size -->
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">ขนาดไฟล์สูงสุด (MB)</label>
                    <input
                      v-model.number="assignmentForm.fileSettings.maxSizeMB"
                      type="number"
                      min="1"
                      max="100"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Modal Footer -->
          <div class="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            <button
              @click="closeAssignmentModal"
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              @click="saveAssignment"
              type="button"
              class="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              <font-awesome-icon :icon="['fas','save']" class="mr-2" />
              {{ editingAssignment ? 'บันทึกการแก้ไข' : 'สร้างกิจกรรม' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
import FileBrowser from '@/interface/modal/FileBrowser.vue';
import editor from '@/interface/template/editor.vue';

const Request = new requestClient(false);

export default {
  props: {
    courseData: Object,
    callParentFunctionProp: Function,
    tabs: Object,
    updateTabs: Object,
  },
  components: {
    FileBrowser,
    editor,
  },
  data() {
    return {
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      showSettings: false,
      showAddAssignmentModal: false,
      editingAssignment: null,
      expandedAssignments: [],
      
      // Global Settings
      globalSettings: {
        submissionType: 'file',
        notifications: {
          email: true,
          system: true,
          reminder: true,
          reminderDays: 3
        },
        scoring: {
          enabled: true,
          minScore: 0,
          maxScore: 100
        }
      },
      
      // Assignment Form
      assignmentForm: {
        title: '',
        description: '',
        contentType: 'text', // 'text' หรือ 'file'
        contentText: '<p>เขียนโจทย์ของคุณที่นี่...</p>',
        contentFile: '',
        additionalInfo: '',
        dueType: 'relative', // 'fixed' หรือ 'relative'
        dueDate: '',
        dueDays: 7,
        fileSettings: {
          allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'],
          maxFiles: 1,
          maxSizeMB: 10
        },
        status: 'active'
      },
      
      // File types
      fileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'zip', 'rar'],
      
      // Assignments list
      assignments: [],
      
      // Submissions (mock data for now)
      submissions: [],

      // FileBrowser
      fileBrowserOpen: false,
    };
  },
  computed: {
    getSubmissionCount() {
      return (assignmentId) => {
        if (!this.submissions || !Array.isArray(this.submissions)) {
          return 0;
        }
        return this.submissions.filter(s => s.assignmentId === assignmentId).length;
      };
    },
    getSubmittedCount() {
      return (assignmentId) => {
        if (!this.submissions || !Array.isArray(this.submissions)) {
          return 0;
        }
        return this.submissions.filter(s => s.assignmentId === assignmentId && s.status === 'submitted').length;
      };
    },
    getPendingCount() {
      // eslint-disable-next-line no-unused-vars
      return (assignmentId) => {
        // In real app, calculate based on enrolled users
        return 0;
      };
    }
  },
  methods: {
    async loadAssignments() {
      try {
        console.log('loadAssignments called:', {
          courseDataExists: !!this.courseData,
          hasAssignments: !!(this.courseData && this.courseData.assignments),
          assignmentsData: this.courseData && this.courseData.assignments ? this.courseData.assignments : null
        });
        
        // ตรวจสอบว่ามี courseData หรือไม่
        if (!this.courseData) {
          console.log('No courseData available yet, assignments will be empty');
          this.assignments = [];
          this.updateBadge(0);
          return;
        }
        
        // Load assignments from course data directly
        if (this.courseData.assignments && Array.isArray(this.courseData.assignments)) {
          console.log('Loading assignments from courseData:', this.courseData.assignments.length);
          this.assignments = [...this.courseData.assignments]; // ใช้ spread operator เพื่อสร้าง array ใหม่
        } else {
          console.log('No assignments found in courseData or not an array');
          this.assignments = [];
        }
        
        console.log('Final assignments loaded:', this.assignments.length);
        this.updateBadge(this.assignments.length);
        
        // Load submissions from assignment collection
        if (this.assignments.length > 0) {
          await this.loadSubmissions();
        }
        
        // บังคับให้ Vue re-render component
        await this.$nextTick();
        this.$forceUpdate();
        
      } catch (error) {
        console.error("Error loading assignments:", error);
        // Set empty array on error to prevent undefined
        this.assignments = [];
        this.updateBadge(0);
      }
    },
    
    async loadSubmissions() {
      try {
        // Load submissions for all assignments in this course
        const assignmentIds = this.assignments.map(a => a.id || a._id);
        
        const payload = {
          method: 'find',
          args: [{ 
            $and: [
              { courseId: this.courseData._id },
              { assignmentId: { $in: assignmentIds } }
            ] 
          }],
        };
        
        const response = await Request.POST('assignment/query', payload, this.configs.key);
        
        if (response.status === 200) {
          this.submissions = response.data || [];
        }
      } catch (error) {
        console.error("Error loading submissions:", error);
      }
    },
    
    async saveGlobalSettings() {
      try {
        // Save global settings to course
        const payload = {
          data: {
            assignmentSettings: this.globalSettings
          }
        };
        
        const response = await Request.PUT(`course/${this.courseData._id}`, payload, this.configs.key);
        
        if (response.status === 200) {
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 2000,
            icon: 'success',
            title: 'บันทึกการตั้งค่าเรียบร้อย',
          });
          
          // Call parent to refresh course data
          this.callParentFunction();
        }
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    },
    
    toggleAssignmentExpand(assignmentId) {
      console.log('toggleAssignmentExpand called with:', assignmentId);
      console.log('expandedAssignments before:', this.expandedAssignments);
      
      if (!assignmentId) {
        console.warn('No assignmentId provided to toggleAssignmentExpand');
        return;
      }
      
      const index = this.expandedAssignments.indexOf(assignmentId);
      if (index > -1) {
        this.expandedAssignments.splice(index, 1);
      } else {
        this.expandedAssignments.push(assignmentId);
      }
      
      console.log('expandedAssignments after:', this.expandedAssignments);
    },
    
    async toggleAssignmentStatus(assignment) {
      assignment.status = assignment.status === 'active' ? 'inactive' : 'active';
      await this.updateAssignmentInCourse();
    },
    
    editAssignment(assignment) {
      this.editingAssignment = assignment;
      this.assignmentForm = { ...assignment };
      this.showAddAssignmentModal = true;
    },
    
    async deleteAssignment(assignmentId) {
      const result = await this.$swal({
        title: 'ยืนยันการลบ',
        text: 'คุณต้องการลบกิจกรรมนี้หรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
      });
      
      if (result.isConfirmed) {
        try {
          // Remove assignment from array
          const index = this.assignments.findIndex(a => (a.id || a._id) === assignmentId);
          if (index > -1) {
            this.assignments.splice(index, 1);
          }
          
          // Update course with new assignments array
          await this.updateAssignmentInCourse();
          
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 2000,
            icon: 'success',
            title: 'ลบกิจกรรมเรียบร้อย',
          });
        } catch (error) {
          console.error("Error deleting assignment:", error);
        }
      }
    },
    
    async saveAssignment() {
      try {
        // Generate unique ID for new assignment
        if (!this.editingAssignment) {
          this.assignmentForm.id = this.generateUniqueId();
          this.assignmentForm.createdAt = new Date().toISOString();
        } else {
          this.assignmentForm.updatedAt = new Date().toISOString();
        }
        
        if (this.editingAssignment) {
          // Update existing assignment
          const index = this.assignments.findIndex(a => (a.id || a._id) === (this.editingAssignment.id || this.editingAssignment._id));
          if (index > -1) {
            this.assignments[index] = { ...this.assignmentForm };
          }
        } else {
          // Add new assignment
          this.assignments.push({ ...this.assignmentForm });
        }
        
        // Update course with new assignments array
        await this.updateAssignmentInCourse();
        
        this.closeAssignmentModal();
        
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 2000,
          icon: 'success',
          title: this.editingAssignment ? 'แก้ไขกิจกรรมเรียบร้อย' : 'สร้างกิจกรรมเรียบร้อย',
        });
      } catch (error) {
        console.error("Error saving assignment:", error);
      }
    },
    
    async updateAssignmentInCourse() {
      try {
        // Update course with assignments array
        const payload = {
          data: {
            assignments: this.assignments
          }
        };
        
        const response = await Request.PUT(`course/${this.courseData._id}`, payload, this.configs.key);
        
        if (response.status === 200) {
          this.updateBadge(this.assignments.length);
          // Call parent to refresh course data
          this.callParentFunction();
        }
      } catch (error) {
        console.error("Error updating assignments in course:", error);
        throw error;
      }
    },
    
    generateUniqueId() {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    },
    
    closeAssignmentModal() {
      this.showAddAssignmentModal = false;
      this.editingAssignment = null;
      this.resetAssignmentForm();
    },
    
    resetAssignmentForm() {
      this.assignmentForm = {
        title: '',
        description: '',
        contentType: 'text',
        contentText: '<p>เขียนโจทย์ของคุณที่นี่...</p>',
        contentFile: '',
        additionalInfo: '',
        dueType: 'relative',
        dueDate: '',
        dueDays: 7,
        fileSettings: {
          allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'],
          maxFiles: 1,
          maxSizeMB: 10
        },
        status: 'active'
      };
    },
    
    getSubmissions(assignmentId) {
      if (!this.submissions || !Array.isArray(this.submissions) || !assignmentId) {
        return [];
      }
      return this.submissions.filter(s => s.assignmentId === assignmentId);
    },
    
    viewSubmission(submission) {
      // Open submission detail modal or navigate to submission page
      console.log('View submission:', submission);
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    formatDateTime(date) {
      return new Date(date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    updateBadge(badgeValue) {
      this.$emit('update-badge', { code: this.tabs.code, badge: badgeValue });
    },
    
    callParentFunction() {
      if (typeof this.callParentFunctionProp === 'function') {
        this.callParentFunctionProp();
      }
    },
    
    async callbackFunction() {
      try {
        console.log("callbackFunction called - Assignment Submission");
        console.log("courseData in callback:", {
          exists: !!this.courseData,
          hasAssignments: !!(this.courseData && this.courseData.assignments),
          assignmentsLength: this.courseData && this.courseData.assignments ? this.courseData.assignments.length : 0
        });
        
        // รอให้ข้อมูลอัพเดทเสร็จก่อน
        await this.$nextTick();
        
        await this.loadAssignments();
        
        // Load global settings if exists
        if (this.courseData && this.courseData.assignmentSettings) {
          this.globalSettings = { ...this.globalSettings, ...this.courseData.assignmentSettings };
          console.log("Global settings updated:", this.globalSettings);
        }
      } catch (error) {
        console.error("Error in callbackFunction:", error);
      }
    },
    
    // FileBrowser Methods
    openFileBrowser() {
      this.fileBrowserOpen = true;
    },
    
    changeFileBrowserTrigger(payload) {
      this.fileBrowserOpen = payload;
    },
    
    selectFileBrowserTrigger(payload) {
      if (payload && payload.file) {
        this.assignmentForm.contentFile = payload.file;
        this.fileBrowserOpen = false;
      }
    },
    
    clearContentFile() {
      this.assignmentForm.contentFile = '';
    },
    
    // TextEditor Methods
    updateAssignmentContent(content) {
      this.assignmentForm.contentText = content;
    },
    
    // File Utility Methods
    getFileIcon(filePath) {
      if (!filePath) return 'file';
      
      const extension = filePath.split('.').pop().toLowerCase();
      switch (extension) {
        case 'pdf':
          return 'file-pdf';
        case 'doc':
        case 'docx':
          return 'file-word';
        case 'xls':
        case 'xlsx':
          return 'file-excel';
        case 'ppt':
        case 'pptx':
          return 'file-powerpoint';
        case 'txt':
          return 'file-alt';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          return 'file-image';
        default:
          return 'file';
      }
    },
    
    getFileName(filePath) {
      if (!filePath) return '';
      return filePath.split('/').pop();
    },
    
    getNotificationStatus() {
      const { email, system, reminder } = this.globalSettings.notifications;
      const activeCount = [email, system, reminder].filter(Boolean).length;
      
      if (activeCount === 0) return 'ปิดทั้งหมด';
      if (activeCount === 3) return 'เปิดทั้งหมด';
      return `เปิด ${activeCount}/3 ประเภท`;
    },
    
    // Additional utility methods for assignment submission display
    getTotalStudents() {
      // In real app, get from course enrollment data
      // For now, return a mock number or calculate based on submissions
      return this.courseData?.enrollment?.length || 25; // Mock value
    },
    
    getTotalSubmissions() {
      if (!this.submissions || !Array.isArray(this.submissions)) {
        return 0;
      }
      return this.submissions.length;
    },
    
    getTotalScoredSubmissions() {
      if (!this.submissions || !Array.isArray(this.submissions)) {
        return 0;
      }
      return this.submissions.filter(s => s.score !== null && s.score !== undefined).length;
    },
    
    getAverageCompletionRate() {
      if (!this.assignments || this.assignments.length === 0) {
        return 0;
      }
      
      const totalRate = this.assignments.reduce((sum, assignment) => {
        return sum + this.getCompletionRate(assignment._id || assignment.id);
      }, 0);
      
      return Math.round(totalRate / this.assignments.length);
    },
    
    getCompletionRate(assignmentId) {
      const totalStudents = this.getTotalStudents();
      const submittedCount = this.getSubmittedCount(assignmentId);
      if (totalStudents === 0) return 0;
      return Math.round((submittedCount / totalStudents) * 100);
    },
    
    getScoredCount(assignmentId) {
      if (!this.submissions || !Array.isArray(this.submissions)) {
        return 0;
      }
      return this.submissions.filter(s => 
        s.assignmentId === assignmentId && s.score !== null && s.score !== undefined
      ).length;
    },
    
    getOverdueCount(assignmentId) {
      if (!this.submissions || !Array.isArray(this.submissions)) {
        return 0;
      }
      const assignment = this.assignments.find(a => (a.id || a._id) === assignmentId);
      if (!assignment) return 0;
      
      return this.submissions.filter(s => 
        s.assignmentId === assignmentId && this.isOverdue(s, assignment)
      ).length;
    },
    
    isOverdue(submission, assignment) {
      if (!submission.submittedAt || !assignment) return false;
      
      let dueDate;
      if (assignment.dueType === 'fixed') {
        dueDate = new Date(assignment.dueDate);
      } else {
        // For relative due date, calculate based on course completion
        // For now, assume course completion date is available
        const courseCompletionDate = new Date(this.courseData?.completedAt || Date.now());
        dueDate = new Date(courseCompletionDate.getTime() + (assignment.dueDays * 24 * 60 * 60 * 1000));
      }
      
      const submissionDate = new Date(submission.submittedAt);
      return submissionDate > dueDate;
    },
    
    scoreSubmission(submission) {
      // Open scoring modal or handle scoring logic
      this.$swal({
        title: 'ให้คะแนนงาน',
        text: `ให้คะแนนงานของ ${submission.userName}`,
        input: 'number',
        inputLabel: `คะแนน (${this.globalSettings.scoring.minScore}-${this.globalSettings.scoring.maxScore})`,
        inputValue: submission.score || '',
        inputAttributes: {
          min: this.globalSettings.scoring.minScore,
          max: this.globalSettings.scoring.maxScore,
          step: 1
        },
        showCancelButton: true,
        confirmButtonText: 'บันทึกคะแนน',
        cancelButtonText: 'ยกเลิก',
        inputValidator: (value) => {
          const score = parseInt(value);
          if (!value) {
            return 'กรุณาใส่คะแนน';
          }
          if (score < this.globalSettings.scoring.minScore || score > this.globalSettings.scoring.maxScore) {
            return `คะแนนต้องอยู่ระหว่าง ${this.globalSettings.scoring.minScore}-${this.globalSettings.scoring.maxScore}`;
          }
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const score = parseInt(result.value);
          this.updateSubmissionScore(submission, score);
        }
      });
    },
    
    async updateSubmissionScore(submission, score) {
      try {
        // Update submission score in database
        const payload = {
          data: { score: score, scoredAt: new Date().toISOString() }
        };
        
        const response = await Request.PUT(`assignment/${submission._id}`, payload, this.configs.key);
        
        if (response.status === 200) {
          // Update local submission data
          submission.score = score;
          submission.scoredAt = new Date().toISOString();
          
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 2000,
            icon: 'success',
            title: 'บันทึกคะแนนเรียบร้อย',
          });
        }
      } catch (error) {
        console.error("Error updating submission score:", error);
        this.$swal({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกคะแนนได้'
        });
      }
    },
  },
  
  async mounted() {
    try {
      console.log('AssignmentSubmission mounted - courseData:', this.courseData);
      
      // รอสักครู่เพื่อให้ courseData โหลดเสร็จ
      await this.$nextTick();
      
      await this.loadAssignments();
      
      // Load global settings if exists
      if (this.courseData && this.courseData.assignmentSettings) {
        this.globalSettings = { ...this.globalSettings, ...this.courseData.assignmentSettings };
      }
    } catch (error) {
      console.error("Error in mounted:", error);
    }
  },

  watch: {
    courseData: {
      handler(newVal, oldVal) {
        console.log('courseData watch triggered:', {
          newVal: !!newVal,
          oldVal: !!oldVal,
          hasAssignments: !!(newVal && newVal.assignments),
          assignmentsLength: newVal && newVal.assignments ? newVal.assignments.length : 0
        });
        
        if (newVal && newVal !== oldVal) {
          // รอสักครู่เพื่อให้ข้อมูลโหลดเสร็จ
          this.$nextTick(() => {
            this.loadAssignments();
            
            // Load global settings if exists
            if (newVal.assignmentSettings) {
              this.globalSettings = { ...this.globalSettings, ...newVal.assignmentSettings };
            }
          });
        }
      },
      deep: true,
      immediate: true  // เพิ่ม immediate เพื่อเรียกทันทีเมื่อ mount
    },

    // เพิ่ม watcher สำหรับ assignments โดยตรง
    'courseData.assignments': {
      handler(newVal, oldVal) {
        console.log('courseData.assignments watch triggered:', {
          newVal: newVal,
          oldVal: oldVal,
          newLength: newVal ? newVal.length : 0,
          oldLength: oldVal ? oldVal.length : 0
        });
        
        if (newVal !== oldVal) {
          this.$nextTick(() => {
            this.loadAssignments();
          });
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

<style scoped>
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

/* Custom scrollbar */
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

/* FileBrowser z-index override */
:deep(.file-browser-modal) {
  z-index: 9999 !important;
}

:deep(.modal-backdrop) {
  z-index: 9998 !important;
}

/* Assignment Modal z-index */
.assignment-modal {
  z-index: 40 !important;
}

/* Ensure FileBrowser is always on top */
:deep(.file-browser-container) {
  position: fixed !important;
  z-index: 9999 !important;
}

:deep(.file-browser-wrapper) {
  z-index: 9999 !important;
}

/* Assignment Item Styles */
.assignment-item {
  border-radius: 0.5rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.assignment-item:hover {
  transform: translateY(-1px);
}

/* Smooth shadow transitions */
.assignment-item.expanded {
  box-shadow: 0 10px 25px -5px rgba(255, 165, 0, 0.1), 0 10px 10px -5px rgba(255, 165, 0, 0.04);
}

/* Remove any conflicting ring effects */
.assignment-item:focus,
.assignment-item:focus-within {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 165, 0, 0.3);
}

/* Ensure proper border radius on all states */
.assignment-item * {
  border-radius: inherit;
}
</style> 