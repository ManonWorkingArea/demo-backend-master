<template>
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Sidebar - Widgets -->
      <div class="w-full lg:w-80 space-y-4">
        <!-- Overall Statistics Widget -->
        <div v-if="enrolls.length > 0" class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center">
              <font-awesome-icon :icon="['fas','chart-line']" class="mr-2 text-purple-600" />
              สถิติรวม
            </h3>
            <span class="text-xs text-gray-500">{{ enrolls.length }} หลักสูตร</span>
          </div>
          
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 text-center">
              <div class="text-lg font-bold text-purple-600">{{ overallStats.totalCourses }}</div>
              <div class="text-xs text-gray-600">หลักสูตรทั้งหมด</div>
            </div>
            <div class="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 text-center">
              <div class="text-lg font-bold text-green-600">{{ overallStats.completedCourses }}</div>
              <div class="text-xs text-gray-600">เรียนจบแล้ว</div>
            </div>
            <div class="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 text-center">
              <div class="text-lg font-bold text-blue-600">{{ Math.round(overallStats.averageProgress) }}%</div>
              <div class="text-xs text-gray-600">ความคืบหน้าเฉลี่ย</div>
            </div>
            <div class="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 text-center">
              <div class="text-lg font-bold text-amber-600">{{ overallStats.certificatesAvailable }}</div>
              <div class="text-xs text-gray-600">ใบรับรองได้รับ</div>
            </div>
          </div>
        </div>

        <!-- Progress Distribution Widget -->
        <div v-if="enrolls.length > 0" class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center mb-3">
            <font-awesome-icon :icon="['fas','chart-pie']" class="mr-2 text-indigo-600" />
            การกระจายความคืบหน้า
          </h3>
          
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">เรียนจบ (100%)</span>
              <span class="font-medium text-green-600">{{ progressDistribution.completed }} หลักสูตร</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div class="bg-green-500 h-1.5 rounded-full" :style="{ width: (progressDistribution.completed / enrolls.length * 100) + '%' }"></div>
            </div>
            
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">กำลังเรียน (1-99%)</span>
              <span class="font-medium text-blue-600">{{ progressDistribution.inProgress }} หลักสูตร</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div class="bg-blue-500 h-1.5 rounded-full" :style="{ width: (progressDistribution.inProgress / enrolls.length * 100) + '%' }"></div>
            </div>
            
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">ยังไม่เริ่ม (0%)</span>
              <span class="font-medium text-gray-600">{{ progressDistribution.notStarted }} หลักสูตร</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div class="bg-gray-400 h-1.5 rounded-full" :style="{ width: (progressDistribution.notStarted / enrolls.length * 100) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Exam Performance Widget -->
        <div v-if="enrolls.length > 0" class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center mb-3">
            <font-awesome-icon :icon="['fas','clipboard-check']" class="mr-2 text-emerald-600" />
            ผลการสอบ
          </h3>
          
          <div class="space-y-3">
            <div class="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
              <div class="flex items-center justify-between">
                <span class="text-xs text-emerald-700">ผ่านการสอบ</span>
                <span class="text-sm font-bold text-emerald-800">{{ examStats.passed }}</span>
              </div>
            </div>
            
            <div class="bg-red-50 rounded-lg p-2 border border-red-100">
              <div class="flex items-center justify-between">
                <span class="text-xs text-red-700">ไม่ผ่านการสอบ</span>
                <span class="text-sm font-bold text-red-800">{{ examStats.failed }}</span>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-2 border border-gray-100">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-700">ยังไม่ได้สอบ</span>
                <span class="text-sm font-bold text-gray-800">{{ examStats.notTaken }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Certificate Status Widget -->
        <div v-if="enrolls.length > 0" class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center mb-3">
            <font-awesome-icon :icon="['fas','award']" class="mr-2 text-amber-600" />
            สถานะใบรับรอง
          </h3>
          
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center text-xs">
                <div class="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
                <span class="text-gray-600">ได้รับแล้ว</span>
              </div>
              <span class="text-xs font-medium text-amber-600">{{ certificateStats.available }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center text-xs">
                <div class="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span class="text-gray-600">กำลังดำเนินการ</span>
              </div>
              <span class="text-xs font-medium text-blue-600">{{ certificateStats.pending }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center text-xs">
                <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                <span class="text-gray-600">ไม่มีใบรับรอง</span>
              </div>
              <span class="text-xs font-medium text-gray-600">{{ certificateStats.none }}</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions Widget -->
        <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center mb-3">
            <font-awesome-icon :icon="['fas','lightning-bolt']" class="mr-2 text-yellow-600" />
            การดำเนินการด่วน
          </h3>
          
          <div class="space-y-2">
            <button 
              v-if="inProgressCourses.length > 0"
              class="w-full flex items-center justify-between p-2 text-xs bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <span class="text-blue-700">ดูหลักสูตรที่กำลังเรียน</span>
              <font-awesome-icon :icon="['fas','arrow-right']" class="text-blue-600" />
            </button>
            
            <button 
              v-if="overallStats.certificatesAvailable > 0"
              class="w-full flex items-center justify-between p-2 text-xs bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
            >
              <span class="text-amber-700">ดาวน์โหลดใบรับรอง</span>
              <font-awesome-icon :icon="['fas','download']" class="text-amber-600" />
            </button>
            
            <button class="w-full flex items-center justify-between p-2 text-xs bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <span class="text-purple-700">ส่งออกรายงาน</span>
              <font-awesome-icon :icon="['fas','file-export']" class="text-purple-600" />
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 space-y-4">
        <!-- Empty State -->
        <div v-if="enrolls.length === 0" class="text-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <font-awesome-icon :icon="['fas','graduation-cap']" class="text-purple-500 text-xl" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีหลักสูตรที่ลงทะเบียน</h3>
          <p class="text-sm text-gray-500">เริ่มต้นการเรียนรู้ด้วยการลงทะเบียนหลักสูตรใหม่</p>
        </div>

        <!-- Course Cards -->
        <div v-else class="space-y-3">
          <div 
            v-for="(enrollItem, index) in enrolls" 
            :key="index" 
            class="group bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-purple-200 transition-all duration-300"
          >
            <div class="p-4">
              <!-- Course Header - Compact -->
              <div class="flex items-start space-x-3 mb-3">
                <div class="flex-shrink-0 relative">
                  <div class="w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-100 group-hover:border-purple-200 transition-colors">
                    <img 
                      :src="enrollItem.course.cover" 
                      :alt="enrollItem.course.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <!-- Progress Ring Overlay -->
                  <div class="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center">
                    <div 
                      class="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                      :class="progressPercentage(enrollItem.analytics) === 100 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'"
                    >
                      {{ progressPercentage(enrollItem.analytics) }}
                    </div>
                  </div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <h3 class="text-sm font-semibold text-gray-900 truncate pr-2">
                        {{ enrollItem.course.name }}
                      </h3>
                      <div class="flex items-center space-x-2 mt-1">
                        <span 
                          :class="enrollItem.course.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                          class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium"
                        >
                          <div 
                            :class="enrollItem.course.status ? 'bg-green-400' : 'bg-red-400'"
                            class="w-1.5 h-1.5 rounded-full mr-1"
                          ></div>
                          {{ enrollItem.course.status ? 'Active' : 'Inactive' }}
                        </span>
                        
                        <!-- Result Badge -->
                        <span 
                          v-if="hasResult(enrollItem.analytics)"
                          :class="calculateResult(enrollItem.analytics) ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                          class="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium"
                        >
                          <font-awesome-icon 
                            :icon="['fas', calculateResult(enrollItem.analytics) ? 'check' : 'times']" 
                            class="mr-1 text-xs" 
                          />
                          {{ calculateResult(enrollItem.analytics) ? 'ผ่าน' : 'ไม่ผ่าน' }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Certificate Button - Compact -->
                    <div class="flex-shrink-0 flex items-center space-x-2">
                      <!-- Certification Config Button -->
                      <button
                        @click="openCertificationConfig(enrollItem)"
                        class="inline-flex items-center px-2 py-1 border border-purple-200 rounded-lg text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                        title="ตั้งค่าใบรับรอง"
                      >
                        <font-awesome-icon :icon="['fas','cog']" class="mr-1" />
                        ตั้งค่าใบรับรอง
                      </button>
                      
                      <!-- Reset Certification Button (only show if certification exists and has data) -->
                      <button
                        v-if="enrollItem.certification?.type"
                        @click="resetCertificationConfig(enrollItem)"
                        class="inline-flex items-center px-2 py-1 border border-red-200 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                        title="รีเซ็ตการตั้งค่า"
                      >
                        <font-awesome-icon :icon="['fas','trash']" class="mr-1" />
                        รีเซ็ต
                      </button>
                      
                      <button
                        v-if="enrollItem.course.certification === 'yes' && calculateResult(enrollItem.analytics)"
                        @click="openCertification('www.xxx.com/lesson/certification/yyy/zzzz')"
                        class="inline-flex items-center px-2 py-1 border border-amber-200 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                      >
                        <font-awesome-icon :icon="['fas','award']" class="mr-1" />
                        ใบรับรอง
                      </button>
                      <span
                        v-else-if="enrollItem.course.certification === 'no'"
                        class="inline-flex items-center px-2 py-1 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 bg-gray-50"
                      >
                        <font-awesome-icon :icon="['fas','minus-circle']" class="mr-1" />
                        ไม่มีใบรับรอง
                      </span>
                    </div>
                  </div>
                  
                  <!-- Progress Bar - Compact -->
                  <div v-if="enrollItem.analytics" class="mt-2">
                    <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>ความคืบหน้า</span>
                      <span class="font-medium">{{ progressPercentage(enrollItem.analytics) }}%</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        class="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                        :style="{ width: progressPercentage(enrollItem.analytics) + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Compact Stats Grid -->
              <div class="grid grid-cols-6 gap-2 mb-3">
                <!-- Learning Stats -->
                <div class="col-span-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-2 border border-slate-100">
                  <div class="text-xs text-gray-500 mb-1 flex items-center">
                    <font-awesome-icon :icon="['fas','book-open']" class="mr-1" />
                    การเรียน
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-600">ทั้งหมด: <strong>{{ enrollItem.analytics?.total || '0' }}</strong></span>
                    <span class="text-blue-600">กำลัง: <strong>{{ enrollItem.analytics?.processing || '0' }}</strong></span>
                    <span class="text-green-600">จบ: <strong>{{ enrollItem.analytics?.complete || '0' }}</strong></span>
                  </div>
                </div>
                
                <!-- Exam Stats -->
                <div class="col-span-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-100">
                  <div class="text-xs text-blue-600 mb-1 flex items-center">
                    <font-awesome-icon :icon="['fas','clipboard-check']" class="mr-1" />
                    คะแนนสอบ
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-yellow-600">ก่อน: <strong>{{ getScore(enrollItem.analytics?.pre) }}</strong></span>
                    <span class="text-blue-600">หลัง: <strong>{{ getScore(enrollItem.analytics?.post) }}</strong></span>
                    <span class="text-orange-600">ซ่อม: <strong>{{ getScore(enrollItem.analytics?.retest) }}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Message Section - Compact -->
              <div v-if="enrollItem.analytics?.message" class="bg-blue-50 rounded-lg p-2 border border-blue-100 mb-2">
                <div class="flex items-start space-x-2">
                  <font-awesome-icon :icon="['fas','info-circle']" class="text-blue-500 text-xs mt-0.5 flex-shrink-0" />
                  <p class="text-xs text-blue-700 leading-relaxed">{{ enrollItem.analytics.message }}</p>
                </div>
              </div>

              <!-- Certification Status Section -->
              <div v-if="getCertificationType(enrollItem.certification)" class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-2 border border-purple-100">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <font-awesome-icon :icon="['fas','award']" class="text-purple-500 text-xs" />
                    <div class="text-xs">
                      <span class="text-purple-700 font-medium">
                        ใบรับรอง: {{ getCertificationType(enrollItem.certification) }}
                      </span>
                      <div v-if="enrollItem.certification?.corporateName" class="text-purple-600 text-xs">
                        {{ enrollItem.certification.corporateName }}
                      </div>
                    </div>
                  </div>
                  <div class="text-xs text-purple-600">
                    แก้ไขได้ {{ enrollItem.certification?.remainingUpdateLimit || 0 }} ครั้ง
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Certification Config Modal -->
    <div v-if="showCertificationModal" class="fixed inset-0 z-50 overflow-y-auto" @click="closeCertificationModal">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" @click.stop>
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                <font-awesome-icon :icon="['fas','award']" class="text-purple-600" />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  ตั้งค่าใบรับรอง
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    หลักสูตร: {{ selectedEnroll?.course?.name }}
                  </p>
                  <p v-if="selectedEnroll?.certification?.type && session.user.role !== 'admin'" class="text-xs text-orange-600 mt-1">
                    ⚠️ คุณได้เลือกประเภทใบรับรองแล้ว ไม่สามารถเปลี่ยนแปลงได้
                  </p>
                  <p v-else-if="selectedEnroll?.certification?.type && session.user.role === 'admin'" class="text-xs text-blue-600 mt-1">
                    ℹ️ Admin สามารถแก้ไขการตั้งค่าได้
                  </p>
                </div>
              </div>
            </div>

            <!-- Form Content -->
            <div class="mt-5 space-y-4">
              <!-- Certification Type -->
              <div>
                <label class="text-sm font-medium text-gray-700 block mb-2">ประเภทใบรับรอง</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input 
                      type="radio" 
                      v-model="certificationForm.type" 
                      value="personal" 
                      :disabled="selectedEnroll?.certification?.type && session.user.role !== 'admin'"
                      class="text-purple-600 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    <span class="ml-2 text-sm" :class="selectedEnroll?.certification?.type && session.user.role !== 'admin' ? 'text-gray-400' : 'text-gray-700'">ส่วนบุคคล (Personal)</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      type="radio" 
                      v-model="certificationForm.type" 
                      value="corporate" 
                      :disabled="selectedEnroll?.certification?.type && session.user.role !== 'admin'"
                      class="text-purple-600 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    <span class="ml-2 text-sm" :class="selectedEnroll?.certification?.type && session.user.role !== 'admin' ? 'text-gray-400' : 'text-gray-700'">องค์กร (Corporate)</span>
                  </label>
                </div>
              </div>

              <!-- Corporate Name (only show when corporate is selected) -->
              <div v-if="certificationForm.type === 'corporate'" class="space-y-2">
                <label for="corporateName" class="text-sm font-medium text-gray-700 block">
                  ชื่อองค์กร
                </label>
                <input
                  id="corporateName"
                  type="text"
                  v-model="certificationForm.corporateName"
                  :disabled="selectedEnroll?.certification?.type && session.user.role !== 'admin'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="ระบุชื่อองค์กรที่จะแสดงในใบรับรอง"
                />
              </div>

              <!-- Current Status Display -->
              <div v-if="selectedEnroll?.certification?.type" class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h4 class="text-sm font-medium text-gray-700 mb-2">สถานะปัจจุบัน</h4>
                <div class="space-y-1 text-sm text-gray-600">
                  <div>ประเภท: <span class="font-medium">{{ selectedEnroll.certification.type === 'corporate' ? 'องค์กร' : 'ส่วนบุคคล' }}</span></div>
                  <div v-if="selectedEnroll.certification.corporateName">
                    ชื่อองค์กร: <span class="font-medium">{{ selectedEnroll.certification.corporateName }}</span>
                  </div>
                  <div>สิทธิ์แก้ไขเหลือ: <span class="font-medium">{{ selectedEnroll.certification.remainingUpdateLimit || 0 }} ครั้ง</span></div>
                  <div>อัปเดตล่าสุด: <span class="font-medium">{{ formatDate(selectedEnroll.certification.updatedAt) }}</span></div>
                </div>
              </div>

              <!-- Warning -->
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div class="flex">
                  <font-awesome-icon :icon="['fas','exclamation-triangle']" class="text-yellow-400 mt-0.5 mr-2" />
                  <div class="text-sm text-yellow-700">
                    <p class="font-medium">หมายเหตุ:</p>
                    <p v-if="!selectedEnroll?.certification?.type">
                      • คุณสามารถเลือกประเภทใบรับรองได้เพียงครั้งเดียว<br>
                      • ทั้ง "ส่วนบุคคล" และ "องค์กร" มีการทำงานเหมือนกัน<br>
                      • แตกต่างเพียงชื่อที่แสดงในใบรับรอง
                    </p>
                    <p v-else-if="session.user.role === 'admin'">
                      • Admin สามารถแก้ไขการตั้งค่าได้<br>
                      • การแก้ไขจะรีเซ็ตสิทธิ์การเปลี่ยนแปลงของผู้เรียน
                    </p>
                    <p v-else>
                      • คุณได้เลือกประเภทใบรับรองแล้ว<br>
                      • หากต้องการเปลี่ยนแปลงกรุณาติดต่อผู้ดูแลระบบ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="saveCertificationConfig"
              :disabled="isLoading || (certificationForm.type === 'corporate' && !certificationForm.corporateName.trim())"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <font-awesome-icon v-if="isLoading" :icon="['fas','spinner']" class="animate-spin mr-2" />
              {{ isLoading ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
            <button
              @click="closeCertificationModal"
              :disabled="isLoading"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
</template>
  
<script>
import { calculateResult, checkProgress } from '@/plugins/analytics.js';
import toast from '@/plugins/ToastUI.js';
import storageManager from '@/plugins/storage';
import debug from '@/plugins/Logger.js';
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);
export default {
    props: {
        member: Object,
        tabs: Object,
    },
    data() {
        return {
            config: storageManager.get('configs'),
            session: storageManager.get('session'),
            enrolls: [],
            
            // Certification Modal
            showCertificationModal: false,
            selectedEnroll: null,
            certificationForm: {
                type: 'personal',
                corporateName: ''
            },
            isLoading: false,
        };
    },
    computed: {
        overallStats() {
            if (!this.enrolls.length) return { totalCourses: 0, completedCourses: 0, averageProgress: 0, certificatesAvailable: 0 };
            
            let totalProgress = 0;
            let completedCourses = 0;
            let certificatesAvailable = 0;
            
            this.enrolls.forEach(enroll => {
                const progress = this.progressPercentage(enroll.analytics);
                totalProgress += progress;
                
                if (progress === 100) {
                    completedCourses++;
                }
                
                if (enroll.course.certification === 'yes' && this.calculateResult(enroll.analytics)) {
                    certificatesAvailable++;
                }
            });
            
            return {
                totalCourses: this.enrolls.length,
                completedCourses,
                averageProgress: this.enrolls.length > 0 ? totalProgress / this.enrolls.length : 0,
                certificatesAvailable
            };
        },
        progressDistribution() {
            if (!this.enrolls.length) return { completed: 0, inProgress: 0, notStarted: 0 };
            
            let completed = 0;
            let inProgress = 0;
            let notStarted = 0;
            
            this.enrolls.forEach(enroll => {
                const progress = this.progressPercentage(enroll.analytics);
                if (progress === 100) {
                    completed++;
                } else if (progress > 0) {
                    inProgress++;
                } else {
                    notStarted++;
                }
            });
            
            return { completed, inProgress, notStarted };
        },
        examStats() {
            if (!this.enrolls.length) return { passed: 0, failed: 0, notTaken: 0 };
            
            let passed = 0;
            let failed = 0;
            let notTaken = 0;
            
            this.enrolls.forEach(enroll => {
                if (this.hasResult(enroll.analytics)) {
                    if (this.calculateResult(enroll.analytics)) {
                        passed++;
                    } else {
                        failed++;
                    }
                } else {
                    notTaken++;
                }
            });
            
            return { passed, failed, notTaken };
        },
        certificateStats() {
            if (!this.enrolls.length) return { available: 0, pending: 0, none: 0 };
            
            let available = 0;
            let pending = 0;
            let none = 0;
            
            this.enrolls.forEach(enroll => {
                if (enroll.course.certification === 'no') {
                    none++;
                } else if (enroll.course.certification === 'yes') {
                    if (this.calculateResult(enroll.analytics)) {
                        available++;
                    } else {
                        pending++;
                    }
                }
            });
            
            return { available, pending, none };
        },
        inProgressCourses() {
            return this.enrolls.filter(enroll => {
                const progress = this.progressPercentage(enroll.analytics);
                return progress > 0 && progress < 100;
            });
        }
    },
    methods: {
        calculateResult,
        checkProgress,
        async callbackFunction() {
            try {
                console.log("callbackFunction");
            } catch (error) {
                console.error(error);
            }
        },
        progressPercentage(analytics) {
            const totalLessons = analytics?.total || 0;
            const completedLessons = analytics?.complete || 0;
            return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        },
        hasScore(test) {
            return test?.score !== null && test?.score !== undefined;
        },
        getScore(test) {
            return this.hasScore(test) ? test.score : '-';
        },
        hasResult(analytics) {
            return analytics?.post?.has || analytics?.retest?.has;
        },
        openCertification(url) {
            window.open(url, '_blank');
        },
        
        getCertificationType(certification) {
            // If no certification data, empty object, or no type, return null
            if (!certification || !certification.type) {
                return null;
            }
            return certification.type === 'corporate' ? 'องค์กร' : 'ส่วนบุคคล';
        },
        
        // Certification Config Methods
        openCertificationConfig(enrollItem) {
            this.selectedEnroll = enrollItem;
            this.showCertificationModal = true;
            
            // Pre-fill form with existing data if available, otherwise default to personal
            if (enrollItem.certification?.type) {
                this.certificationForm = {
                    type: enrollItem.certification.type,
                    corporateName: enrollItem.certification.corporateName || ''
                };
            } else {
                // Default to personal if no existing data
                this.certificationForm = {
                    type: 'personal',
                    corporateName: ''
                };
            }
        },
        
        closeCertificationModal() {
            this.showCertificationModal = false;
            this.selectedEnroll = null;
            this.certificationForm = {
                type: 'personal',
                corporateName: ''
            };
            this.isLoading = false;
        },
        
        async saveCertificationConfig() {
            if (!this.selectedEnroll) return;
            
            try {
                this.isLoading = true;
                console.log('Starting saveCertificationConfig with type:', this.certificationForm.type);
                
                // Check if already configured (one-time selection)
                if (this.selectedEnroll.certification?.type && this.session.user.role !== 'admin') {
                    toast({ type: 'error', message: 'คุณได้เลือกประเภทใบรับรองแล้ว ไม่สามารถเปลี่ยนแปลงได้' });
                    this.isLoading = false;
                    return;
                }
                
                // Validate corporate name if corporate type is selected
                if (this.certificationForm.type === 'corporate' && !this.certificationForm.corporateName.trim()) {
                    toast({ type: 'error', message: 'กรุณาระบุชื่อองค์กร' });
                    this.isLoading = false;
                    return;
                }
                
                console.log('Validation passed, preparing certification data...');
                
                // Prepare certification data
                const certificationData = {
                    type: this.certificationForm.type,
                    remainingUpdateLimit: this.session.user.role === 'admin' ? 0 : 1,
                    timestamp: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                // Add corporate name if corporate type
                if (this.certificationForm.type === 'corporate') {
                    certificationData.corporateName = this.certificationForm.corporateName.trim();
                }
                
                // API request body
                const requestBody = {
                    data: {
                        certification: certificationData,
                        lastUpdated: new Date().toISOString()
                    }
                };
                
                console.log('Making API request with data:', requestBody);
                
                // Make API request
                const { status } = await Request.PUT(`enroll/${this.selectedEnroll._id}`, requestBody, this.config.key);
                
                console.log('API response status:', status);
                
                if (status === 200) {
                    // Update local data
                    const enrollIndex = this.enrolls.findIndex(e => e._id === this.selectedEnroll._id);
                    if (enrollIndex !== -1) {
                        this.enrolls[enrollIndex].certification = certificationData;
                    }
                    
                    toast({ type: 'success', message: 'บันทึกการตั้งค่าใบรับรองเรียบร้อย' });
                    this.closeCertificationModal();
                } else {
                    throw new Error('Failed to save certification config');
                }
                
            } catch (error) {
                console.error('Error saving certification config:', error);
                toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่' });
            } finally {
                this.isLoading = false;
            }
        },
        
        formatDate(dateString) {
            if (!dateString) return '-';
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                return '-';
            }
        },
        
        async resetCertificationConfig(enrollItem) {
            if (!enrollItem) return;
            
            // Show confirmation dialog
            const confirmed = confirm('คุณต้องการลบการตั้งค่าใบรับรองนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้');
            if (!confirmed) return;
            
            try {
                this.isLoading = true;
                
                // API request body to clear certification
                const requestBody = {
                    data: {
                        certification: {},
                        lastUpdated: new Date().toISOString()
                    }
                };
                
                // Make API request
                const { status } = await Request.PUT(`enroll/${enrollItem._id}`, requestBody, this.config.key);
                
                if (status === 200) {
                    // Update local data - clear certification
                    const enrollIndex = this.enrolls.findIndex(e => e._id === enrollItem._id);
                    if (enrollIndex !== -1) {
                        this.enrolls[enrollIndex].certification = {};
                        // Force reactivity
                        this.$forceUpdate();
                    }
                    
                    toast({ type: 'success', message: 'ลบการตั้งค่าใบรับรองเรียบร้อยแล้ว' });
                } else {
                    throw new Error('Failed to reset certification config');
                }
                
            } catch (error) {
                console.error('Error resetting certification config:', error);
                toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการลบ กรุณาลองใหม่' });
            } finally {
                this.isLoading = false;
            }
        },
        // updateBadge(badgeValue) {
        //     this.$emit('update-badge', { code: this.tabs.code, badge: badgeValue });
        // },
        async getData() {
            try {
                this.toast = toast({ type: 'pending', message: 'กำลังดึงข้อมูล..' });
                const pipeline = [{
                        $match: {
                            $and: [{ userID: this.member._id }]
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
                            as: "course"
                        },
                    },
                    {
                        $unwind: "$course"
                    },
                    {
                        $facet: {
                            enroll: [{ $skip: (1 - 1) * 100, }, { $limit: 100 }],
                            totalCount: [{ $count: 'count' }],
                        },
                    },
                ];

                const resAPI = await Request.POST('enroll/aggregate', { pipeline }, this.config.key);
                const data = resAPI.data;

                this.toast.hide('ดึงข้อมูลเสร็จแล้ว.', 'success', 30, () => {
                    this.enrolls = data[0].enroll;
                    this.$setPageTitle(this.member.firstname + " " + this.member.lastname + " / หลักสูตร");
                    this.activeBlock = false;
                    //this.updateBadge(data[0].enroll.length)
                });
            } catch (error) {
                debug.log(error)
            }
        }
    },
    async mounted() {
        try {
            await this.getData();
        } catch (error) {
            debug.log(Error);
        }
    },
};
</script>
  
<style scoped>
.styled-text {
    color: blue;
    font-size: 20px;
}

/* Modal animations */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

/* Smooth transitions */
.transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
}

/* Focus styles */
.focus\:ring-2:focus {
    --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
    --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
</style>
  