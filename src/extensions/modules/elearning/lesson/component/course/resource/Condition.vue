<template>
  <!-- Toast Notifications -->
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <Transition
        v-for="notification in notifications"
        :key="notification.id"
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div class="max-w-sm w-full bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden">
          <div class="p-3">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <div v-if="notification.type === 'success'" class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div v-else-if="notification.type === 'error'" class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div v-else class="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div class="ml-2 w-0 flex-1">
                <p class="text-sm font-medium text-gray-900">{{ notification.message }}</p>
              </div>
              <div class="ml-3 flex-shrink-0">
                <button @click="hideNotification(notification.id)" class="text-gray-400 hover:text-gray-500 transition-colors">
                  <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>

  <!-- Header Section -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas','calendar-days']" class="text-white text-sm" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">ตั้งค่าตารางเวลา</h2>
            <p class="text-xs text-gray-500">จัดการตารางเวลาและกิจกรรมการเรียน ({{ activeScheduleCount }}/{{ schedule.length }} กิจกรรม)</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <!-- Quick Actions -->
          <button 
            @click="enableAllSchedules"
            class="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors shadow-sm">
            <font-awesome-icon :icon="['fas','toggle-on']" class="text-white mr-1.5" />
            เปิดทั้งหมด
          </button>
          
          <button 
            @click="saveAllSchedules"
            class="inline-flex items-center rounded-lg border border-transparent bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm">
            <font-awesome-icon :icon="['fas','save']" class="text-white mr-1.5" />
            บันทึก
          </button>
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
            <strong>หมายเหตุ:</strong> ตั้งค่าตารางเวลาสำหรับกิจกรรมต่างๆ ในหลักสูตร เช่น การลงทะเบียน การเรียน การสอบ และการประกาศผล
          </p>
        </div>
      </div>
    </div>

    <!-- Schedule Management -->
    <div class="p-4">
      <!-- Action Bar -->
      <div class="space-y-3 mb-6">
        <!-- Secondary Actions -->
        <div class="flex flex-wrap items-center gap-3">
          <button 
            @click="disableAllSchedules"
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <font-awesome-icon :icon="['fas','toggle-off']" class="mr-1" />
            ปิดทั้งหมด
          </button>
          
          <button 
            @click="resetAllSchedules"
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors">
            <font-awesome-icon :icon="['fas','refresh']" class="mr-1" />
            รีเซ็ต
          </button>
          
          <div class="border-l border-gray-300 pl-3 ml-3 flex items-center space-x-2">
            <button 
              @click="exportScheduleConfig"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors">
              <font-awesome-icon :icon="['fas','download']" class="mr-1" />
              ส่งออก
            </button>
            
            <label class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-yellow-600 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors cursor-pointer">
              <font-awesome-icon :icon="['fas','upload']" class="mr-1" />
              นำเข้า
              <input type="file" @change="importScheduleConfig" accept=".json" class="hidden">
            </label>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
          <div class="text-xs font-medium text-indigo-600">เปิดใช้งาน</div>
          <div class="text-lg font-semibold text-indigo-900">{{ activeScheduleCount }}</div>
        </div>
        <div class="bg-green-50 rounded-lg p-3 border border-green-100">
          <div class="text-xs font-medium text-green-600">มีเวลา</div>
          <div class="text-lg font-semibold text-green-900">{{ dateScheduleCount }}</div>
        </div>
        <div class="bg-purple-50 rounded-lg p-3 border border-purple-100">
          <div class="text-xs font-medium text-purple-600">รอบทั้งหมด</div>
          <div class="text-lg font-semibold text-purple-900">{{ totalRoundsCount }}</div>
        </div>
        <div class="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <div class="text-xs font-medium text-blue-600">ทั้งหมด</div>
          <div class="text-lg font-semibold text-blue-900">{{ schedule.length }}</div>
        </div>
      </div>

      <!-- Schedule List -->
      <div class="space-y-4">
        <!-- Empty State -->
        <div v-if="schedule.length === 0" class="text-center py-8">
          <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <font-awesome-icon :icon="['fas','calendar-xmark']" class="text-gray-400 text-lg"/>
          </div>
          <h3 class="text-base font-medium text-gray-900 mb-2">ไม่มีตารางเวลา</h3>
          <p class="text-sm text-gray-500 mb-4">เริ่มต้นสร้างตารางเวลาสำหรับหลักสูตรของคุณ</p>
        </div>

        <!-- Schedule Items -->
        <div v-else class="space-y-3">
          <TransitionGroup name="schedule" tag="div" class="space-y-3">
            <div 
              v-for="(item, index) in schedule" 
              :key="item.item"
              class="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
              :class="{ 'border-indigo-300 bg-indigo-50': item.used }"
            >
              <!-- Schedule Header -->
              <div class="p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3 flex-1">
                    <!-- Toggle Switch -->
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        v-model="item.used" 
                        @change="updateScheduleConfig(item)" 
                        class="sr-only peer"
                      />
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>

                    <!-- Schedule Icon & Info -->
                    <div class="flex items-center space-x-3 flex-1">
                      <div class="flex-shrink-0">
                        <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                             :class="getScheduleIconColor(item.item)">
                          <font-awesome-icon 
                            :icon="['fas', getScheduleIcon(item.item)]" 
                            class="text-base"
                          />
                        </div>
                      </div>
                      
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2 mb-1">
                          <h3 class="text-base font-semibold text-gray-900">{{ index + 1 }}. {{ item.name }}</h3>
                          <span v-if="item.optional && item.optional.length > 0" 
                                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {{ item.optional.join(', ') }}
                          </span>
                        </div>
                        
                        <!-- Status Info -->
                        <div v-if="item.used" class="flex items-center space-x-3 text-xs text-gray-500">
                          <span v-if="item.startDateUsed && item.startDate" class="flex items-center">
                            <font-awesome-icon :icon="['fas','play']" class="mr-1 text-green-500 text-xs" />
                            {{ formatDateTime(item.startDate) }}
                          </span>
                          <span v-if="item.endDateUsed && item.endDate" class="flex items-center">
                            <font-awesome-icon :icon="['fas','stop']" class="mr-1 text-red-500 text-xs" />
                            {{ formatDateTime(item.endDate) }}
                          </span>
                          <span v-if="item.roundUsed && item.rounds.length > 0" class="flex items-center">
                            <font-awesome-icon :icon="['fas','repeat']" class="mr-1 text-purple-500 text-xs" />
                            {{ item.rounds.length }} รอบ
                          </span>
                        </div>
                        <p v-else class="text-sm text-gray-500">{{ item.description }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center space-x-1">
                    <button 
                      v-if="item.used"
                      @click="duplicateSchedule(item)"
                      class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                      title="ทำสำเนา">
                      <font-awesome-icon :icon="['fas','copy']" class="mr-1 text-xs" />
                      ทำสำเนา
                    </button>
                    
                    <button 
                      v-if="item.used"
                      @click="resetScheduleItem(item)"
                      class="inline-flex items-center px-2.5 py-1 border border-red-200 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                      title="รีเซ็ต">
                      <font-awesome-icon :icon="['fas','refresh']" class="mr-1 text-xs" />
                      รีเซ็ต
                    </button>
                    
                    <button 
                      v-if="item.used"
                      @click="toggleScheduleExpand(index)"
                      class="inline-flex items-center px-2.5 py-1 border border-gray-200 rounded-md text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors"
                      title="ตั้งค่า">
                      <font-awesome-icon :icon="['fas','edit']" class="mr-1 text-xs" />
                      แก้ไข
                    </button>
                  </div>
                </div>
              </div>

              <!-- Configuration Panel -->
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <div v-if="item.used && expandedSchedules.includes(index)" class="border-t border-gray-200 bg-gray-50">
                  <div class="p-4 space-y-4">
                    
                    <!-- 2 Column Layout: Left (Date) + Right (Rounds) -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      <!-- Left Column: Date Configuration -->
                      <div class="space-y-4">
                        <!-- Start Date -->
                        <div class="bg-white rounded-lg border border-gray-200 p-4">
                          <label class="flex items-center text-sm font-medium text-gray-800 mb-3">
                            <input 
                              type="checkbox" 
                              v-model="item.startDateUsed" 
                              @change="updateScheduleConfig(item)" 
                              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
                            />
                            <div class="flex items-center">
                              <font-awesome-icon :icon="['fas','play']" class="mr-2 text-green-500" />
                              <span>วันเริ่มต้น</span>
                            </div>
                          </label>
                          <div v-if="item.startDateUsed" class="bg-gray-50 rounded-lg border border-gray-200 p-3">
                            <CustomDateTimePicker 
                              v-model="item.startDate" 
                              :value="item.startDate" 
                              @update="completeStartDate(item, $event)" 
                            />
                          </div>
                          <div v-else class="text-center py-6 text-gray-400">
                            <font-awesome-icon :icon="['fas','calendar-xmark']" class="text-2xl mb-2" />
                            <p class="text-sm">ไม่ได้กำหนดวันเริ่มต้น</p>
                          </div>
                        </div>

                        <!-- End Date -->
                        <div class="bg-white rounded-lg border border-gray-200 p-4">
                          <label class="flex items-center text-sm font-medium text-gray-800 mb-3">
                            <input 
                              type="checkbox" 
                              v-model="item.endDateUsed" 
                              @change="updateScheduleConfig(item)" 
                              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
                            />
                            <div class="flex items-center">
                              <font-awesome-icon :icon="['fas','stop']" class="mr-2 text-red-500" />
                              <span>วันสิ้นสุด</span>
                            </div>
                          </label>
                          <div v-if="item.endDateUsed" class="bg-gray-50 rounded-lg border border-gray-200 p-3">
                            <CustomDateTimePicker 
                              v-model="item.endDate" 
                              :value="item.endDate" 
                              @update="completeEndDate(item, $event)" 
                            />
                          </div>
                          <div v-else class="text-center py-6 text-gray-400">
                            <font-awesome-icon :icon="['fas','calendar-xmark']" class="text-2xl mb-2" />
                            <p class="text-sm">ไม่ได้กำหนดวันสิ้นสุด</p>
                          </div>
                        </div>
                      </div>

                      <!-- Right Column: Round Management -->
                      <div class="bg-white rounded-lg border border-gray-200 p-4">
                        <label class="flex items-center text-sm font-medium text-gray-800 mb-3">
                          <input 
                            type="checkbox" 
                            v-model="item.roundUsed" 
                            @change="updateScheduleConfig(item)" 
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
                          />
                          <div class="flex items-center">
                            <font-awesome-icon :icon="['fas','repeat']" class="mr-2 text-purple-500" />
                            <span>จัดการรอบ</span>
                          </div>
                        </label>

                        <div v-if="item.roundUsed" class="space-y-3">
                          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <h4 class="text-sm font-medium text-gray-900 flex items-center">
                              <font-awesome-icon :icon="['fas','list']" class="mr-2 text-indigo-500" />
                              รายการรอบ
                            </h4>
                            <span class="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                              {{ item.rounds.length }} รอบ
                            </span>
                          </div>

                          <!-- Enhanced Add Round -->
                          <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <label class="block text-sm font-medium text-gray-700 mb-2">เพิ่มรอบใหม่</label>
                            <div class="flex space-x-2">
                              <input 
                                type="text" 
                                v-model="item.customRound" 
                                placeholder="ชื่อรอบใหม่..." 
                                class="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                @keyup.enter="addCustomRound(item)"
                              />
                              <button 
                                @click="addCustomRound(item)" 
                                :disabled="!item.customRound.trim()"
                                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors">
                                <font-awesome-icon :icon="['fas','plus']" class="mr-1" />
                                เพิ่ม
                              </button>
                            </div>
                          </div>

                          <!-- Enhanced Rounds List -->
                          <div v-if="item.rounds.length > 0" class="space-y-2">
                            <TransitionGroup name="round" tag="div" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div 
                                v-for="(round, roundIndex) in item.rounds" 
                                :key="round.name" 
                                class="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-sm transition-shadow"
                              >
                                <div class="flex items-center justify-between mb-3">
                                  <h5 class="text-sm font-medium text-gray-900 flex items-center">
                                    <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                                      <font-awesome-icon :icon="['fas','circle']" class="text-purple-600 text-xs" />
                                    </div>
                                    {{ round.name }}
                                  </h5>
                                  <button 
                                    @click="removeRound(item, roundIndex)"
                                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                    <font-awesome-icon :icon="['fas','trash']" class="text-sm" />
                                  </button>
                                </div>

                                <div class="space-y-3">
                                  <!-- Enhanced Round Start Date -->
                                  <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <label class="flex items-center text-xs font-medium text-gray-700 mb-2">
                                      <input 
                                        type="checkbox" 
                                        v-model="round.StartDateUsed" 
                                        @change="updateScheduleConfig(item)"
                                        class="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                                      />
                                      <font-awesome-icon :icon="['fas','play']" class="mr-1 text-green-500 text-xs" />
                                      วันเริ่มรอบ
                                    </label>
                                    <div v-if="round.StartDateUsed" class="bg-white rounded-lg border border-gray-200 p-2">
                                      <CustomDateTimePicker 
                                        v-model="round.StartDate" 
                                        :value="round.StartDate" 
                                        @update="updateRoundStartDate(round, $event)" 
                                      />
                                    </div>
                                    <div v-else class="text-center py-3 text-gray-400">
                                      <font-awesome-icon :icon="['fas','calendar-xmark']" class="text-lg mb-1" />
                                      <p class="text-xs">ไม่ได้กำหนดวันเริ่ม</p>
                                    </div>
                                  </div>

                                  <!-- Enhanced Round End Date -->
                                  <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <label class="flex items-center text-xs font-medium text-gray-700 mb-2">
                                      <input 
                                        type="checkbox" 
                                        v-model="round.EndDateUsed" 
                                        @change="updateScheduleConfig(item)"
                                        class="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                                      />
                                      <font-awesome-icon :icon="['fas','stop']" class="mr-1 text-red-500 text-xs" />
                                      วันสิ้นสุดรอบ
                                    </label>
                                    <div v-if="round.EndDateUsed" class="bg-white rounded-lg border border-gray-200 p-2">
                                      <CustomDateTimePicker 
                                        v-model="round.EndDate" 
                                        :value="round.EndDate" 
                                        @update="updateRoundEndDate(round, $event)" 
                                      />
                                    </div>
                                    <div v-else class="text-center py-3 text-gray-400">
                                      <font-awesome-icon :icon="['fas','calendar-xmark']" class="text-lg mb-1" />
                                      <p class="text-xs">ไม่ได้กำหนดวันสิ้นสุด</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TransitionGroup>
                          </div>

                          <!-- Enhanced Empty Rounds State -->
                          <div v-else class="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <font-awesome-icon :icon="['fas','calendar-plus']" class="text-2xl mb-2 text-gray-400" />
                            <h4 class="text-sm font-medium text-gray-900 mb-1">ยังไม่มีรอบ</h4>
                            <p class="text-xs text-gray-500">เพิ่มรอบใหม่เพื่อเริ่มต้นการจัดการ</p>
                          </div>
                        </div>

                        <div v-else class="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <font-awesome-icon :icon="['fas','repeat']" class="text-2xl mb-2" />
                          <h4 class="text-sm font-medium text-gray-600 mb-1">การจัดการรอบปิดใช้งาน</h4>
                          <p class="text-xs text-gray-500">เปิดใช้งานเพื่อจัดการรอบต่างๆ</p>
                        </div>
                      </div>
                    </div>

                    <!-- Enhanced Action Buttons -->
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button 
                        @click="resetScheduleItem(item)"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <font-awesome-icon :icon="['fas','refresh']" class="mr-2" />
                        รีเซ็ต
                      </button>
                      <button 
                        @click="updateScheduleConfig(item)"
                        class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                        <font-awesome-icon :icon="['fas','save']" class="mr-2" />
                        บันทึก
                      </button>
                    </div>

                  </div>
                </div>
              </Transition>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import CustomDateTimePicker from './plugin/CustomDateTimePicker.vue';
import storageManager from '@/plugins/storage';

export default {
  name: 'Condition',
  components: {
    CustomDateTimePicker,
  },
  data() {
    const route = useRoute();
    return {
      dataItem: this.$route.params.id,
      configs: storageManager.get('configs'),
      PageName: route.meta.title,
      PageIcon: route.meta.icon,
      PagePath: route.meta.path,
      ParentName: route.meta.parent,
      ParentPage: route.meta.page,
      
      // UI State
      expandedSchedules: [],
      isLoading: false,
      
      // Notifications
      notifications: [],
      notificationId: 0,
      
      // Schedule Templates
      scheduleTemplates: [
        {
          name: 'แบบมาตรฐาน',
          description: 'ตารางเวลาพื้นฐานสำหรับหลักสูตรทั่วไป',
          config: ['register', 'learn', 'posttest', 'result']
        },
        {
          name: 'แบบสมบูรณ์',
          description: 'ตารางเวลาครบถ้วนสำหรับหลักสูตรที่มีการประเมินผล',
          config: ['register', 'learn', 'pretest', 'posttest', 'retest', 'result', 'certification']
        },
        {
          name: 'แบบมีรอบ',
          description: 'ตารางเวลาสำหรับหลักสูตรที่มีการจัดรอบ',
          config: ['register', 'learn', 'posttest', 'result'],
          withRounds: true
        }
      ],
      
      schedule: [
        { 
          item: 'register', 
          name: 'ลงทะเบียน', 
          description: 'ช่วงเวลาที่ผู้เรียนสามารถลงทะเบียนเข้าเรียน',
          status: ['open', 'close'], 
          used: false, 
          startDate: '', 
          endDate: '', 
          startDateUsed: false, 
          endDateUsed: false, 
          optional: [], 
          roundUsed: false, 
          customRound: '', 
          rounds: [],
          priority: 1
        },
        { 
          item: 'learn', 
          name: 'เปิดเรียน', 
          description: 'ช่วงเวลาที่ผู้เรียนสามารถเข้าถึงเนื้อหาการเรียน',
          status: ['open', 'close'], 
          used: false, 
          startDate: '', 
          endDate: '', 
          startDateUsed: false, 
          endDateUsed: false, 
          optional: [], 
          roundUsed: false, 
          customRound: '', 
          rounds: [],
          priority: 2
        },
        { 
          item: 'pretest', 
          name: 'สอบก่อนเรียน', 
          description: 'การทดสอบความรู้ก่อนเริ่มเรียน',
          status: ['open', 'close'], 
          used: false, 
          startDate: '', 
          endDate: '', 
          startDateUsed: false, 
          endDateUsed: false, 
          optional: [], 
          roundUsed: false, 
          customRound: '', 
          rounds: [],
          priority: 3
        },
        { 
          item: 'posttest', 
          name: 'สอบวัดผล', 
          description: 'การทดสอบความรู้หลังจากเรียนจบ',
          status: ['open', 'close'], 
          optional: ['round?'], 
          used: false, 
          startDate: '', 
          endDate: '', 
          startDateUsed: false, 
          endDateUsed: false, 
          roundUsed: false, 
          customRound: '', 
          rounds: [],
          priority: 4
        },
        { 
          item: 'retest', 
          name: 'สอบซ่อม', 
          description: 'การทดสอบซ่อมเสริมสำหรับผู้ที่สอบไม่ผ่าน',
          status: ['open', 'close'], 
          optional: ['round?'], 
          used: false, 
          startDate: '', 
          endDate: '', 
          startDateUsed: false, 
          endDateUsed: false, 
          roundUsed: false, 
          customRound: '', 
          rounds: [],
          priority: 5
        },
        { 
          item: 'result', 
          name: 'ประกาศผล', 
          description: 'การประกาศผลการเรียนและการสอบ',
          status: ['open', 'close'], 
          optional: ['round?'], 
          used: false, 
          startDate: '', 
          endDate: '', 
          startDateUsed: false, 
          endDateUsed: false, 
          roundUsed: false, 
          customRound: '', 
          rounds: [],
          priority: 6
        },
        { 
          item: 'certification', 
          name: 'ใบประกาศ', 
          description: 'การออกใบประกาศนียบัตรหรือใบรับรอง',
          status: ['open', 'close'], 
          optional: ['round?'], 
          used: false, 
          startDate: '', 
          endDate: '', 
          startDateUsed: false, 
          endDateUsed: false, 
          roundUsed: false, 
          customRound: '', 
          rounds: [],
          priority: 7
        },
      ],
      scheduleConfig: [],
      
      // Search and Filter
      searchQuery: '',
      filterStatus: 'all', // all, active, inactive
      sortBy: 'priority', // priority, name, date
    }
  },
  computed: {
    activeScheduleCount() {
      return this.schedule.filter(item => item.used).length;
    },
    roundScheduleCount() {
      return this.schedule.filter(item => item.used && item.roundUsed).length;
    },
    dateScheduleCount() {
      return this.schedule.filter(item => item.used && (item.startDateUsed || item.endDateUsed)).length;
    },
    totalRoundsCount() {
      return this.schedule.reduce((total, item) => total + (item.rounds?.length || 0), 0);
    },
    filteredSchedule() {
      let filtered = [...this.schedule];
      
      // Search filter
      if (this.searchQuery) {
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      
      // Status filter
      if (this.filterStatus === 'active') {
        filtered = filtered.filter(item => item.used);
      } else if (this.filterStatus === 'inactive') {
        filtered = filtered.filter(item => !item.used);
      }
      
      // Sort
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'date': {
            const aDate = a.startDate || a.endDate || '';
            const bDate = b.startDate || b.endDate || '';
            return new Date(aDate) - new Date(bDate);
          }
          default:
            return a.priority - b.priority;
        }
      });
      
      return filtered;
    }
  },
  methods: {
    // Schedule Icon Methods
    getScheduleIcon(item) {
      const icons = {
        register: 'user-plus',
        learn: 'book-open',
        pretest: 'clipboard-question',
        posttest: 'clipboard-check',
        retest: 'redo',
        result: 'trophy',
        certification: 'award'
      };
      return icons[item] || 'calendar';
    },

    getScheduleIconColor(item) {
      const colors = {
        register: 'bg-gradient-to-br from-blue-500 to-blue-600',
        learn: 'bg-gradient-to-br from-green-500 to-green-600',
        pretest: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
        posttest: 'bg-gradient-to-br from-purple-500 to-purple-600',
        retest: 'bg-gradient-to-br from-orange-500 to-orange-600',
        result: 'bg-gradient-to-br from-pink-500 to-pink-600',
        certification: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
      };
      return colors[item] || 'bg-gradient-to-br from-gray-500 to-gray-600';
    },

    // Date Formatting
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      try {
        const date = new Date(dateTime.dateTime || dateTime);
        return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return dateTime.toString();
      }
    },

    // UI Methods
    toggleScheduleExpand(index) {
      const expandIndex = this.expandedSchedules.indexOf(index);
      if (expandIndex > -1) {
        this.expandedSchedules.splice(expandIndex, 1);
      } else {
        this.expandedSchedules.push(index);
      }
    },

    // Auto expand/collapse methods
    autoExpandSchedule(item, showNotification = false) {
      const itemIndex = this.schedule.findIndex(s => s.item === item.item);
      if (itemIndex !== -1 && !this.expandedSchedules.includes(itemIndex)) {
        this.expandedSchedules.push(itemIndex);
        if (showNotification) {
          this.showNotification(`ขยายการตั้งค่า ${item.name} โดยอัตโนมัติ`, 'info');
        }
      }
    },

    autoCollapseSchedule(item, showNotification = false) {
      const itemIndex = this.schedule.findIndex(s => s.item === item.item);
      if (itemIndex !== -1) {
        const expandIndex = this.expandedSchedules.indexOf(itemIndex);
        if (expandIndex > -1) {
          this.expandedSchedules.splice(expandIndex, 1);
          if (showNotification) {
            this.showNotification(`ย่อการตั้งค่า ${item.name} โดยอัตโนมัติ`, 'info');
          }
        }
      }
    },

    // Bulk Actions
    enableAllSchedules() {
      this.schedule.forEach(item => {
        item.used = true;
        // Auto expand all enabled schedules
        this.autoExpandSchedule(item, false);
        this.updateScheduleConfig(item);
      });
      this.showNotification('เปิดใช้งานและขยายตารางเวลาทั้งหมดแล้ว', 'success');
    },

    disableAllSchedules() {
      this.schedule.forEach(item => {
        item.used = false;
        this.updateScheduleConfig(item);
      });
      // Auto collapse all schedules when disabled
      this.expandedSchedules = [];
      this.showNotification('ปิดใช้งานตารางเวลาทั้งหมดแล้ว', 'success');
    },

    saveAllSchedules() {
      this.schedule.forEach(item => {
        if (item.used) {
          this.updateScheduleConfig(item);
        }
      });
      this.showNotification('บันทึกตารางเวลาทั้งหมดแล้ว', 'success');
    },

    resetAllSchedules() {
      if (confirm('คุณต้องการรีเซ็ตตารางเวลาทั้งหมดหรือไม่?')) {
        this.schedule.forEach(item => {
          this.resetScheduleItem(item, false);
        });
        this.expandedSchedules = [];
        this.showNotification('รีเซ็ตตารางเวลาทั้งหมดแล้ว', 'success');
      }
    },

    resetScheduleItem(item, showNotification = true) {
      item.startDate = '';
      item.endDate = '';
      item.startDateUsed = false;
      item.endDateUsed = false;
      item.roundUsed = false;
      item.rounds = [];
      item.customRound = '';
      this.updateScheduleConfig(item);
      if (showNotification) {
        this.showNotification(`รีเซ็ต ${item.name} แล้ว`, 'success');
      }
    },

    // Template Methods
    applyTemplate(template) {
      if (confirm(`คุณต้องการใช้เทมเพลต "${template.name}" หรือไม่? การตั้งค่าปัจจุบันจะถูกเขียนทับ`)) {
        // Reset all schedules first
        this.schedule.forEach(item => {
          item.used = false;
          this.resetScheduleItem(item, false);
        });

        // Apply template
        template.config.forEach(itemName => {
          const item = this.schedule.find(s => s.item === itemName);
          if (item) {
            item.used = true;
            if (template.withRounds) {
              item.roundUsed = true;
              item.rounds = [
                { name: 'รอบที่ 1', StartDate: '', EndDate: '', StartDateUsed: false, EndDateUsed: false },
                { name: 'รอบที่ 2', StartDate: '', EndDate: '', StartDateUsed: false, EndDateUsed: false }
              ];
            }
            this.updateScheduleConfig(item);
          }
        });

        this.showNotification(`ใช้เทมเพลต "${template.name}" สำเร็จ`, 'success');
      }
    },

    // Import/Export Methods
    exportScheduleConfig() {
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        scheduleConfig: this.scheduleConfig,
        metadata: {
          courseId: this.dataItem,
          activeCount: this.activeScheduleCount,
          roundCount: this.roundScheduleCount
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schedule-config-${this.dataItem}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showNotification('ส่งออกการตั้งค่าสำเร็จ', 'success');
    },

    importScheduleConfig(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          if (importData.scheduleConfig) {
            this.scheduleConfig = importData.scheduleConfig;
            this.updateScheduleFromConfig();
            this.showNotification('นำเข้าการตั้งค่าสำเร็จ', 'success');
          } else {
            throw new Error('Invalid file format');
          }
        } catch (error) {
          this.showNotification('ไฟล์ไม่ถูกต้อง กรุณาตรวจสอบรูปแบบไฟล์', 'error');
        }
      };
      reader.readAsText(file);
      
      // Reset file input
      event.target.value = '';
    },

    // Duplicate Methods
    duplicateSchedule(item) {
      const duplicatedItem = JSON.parse(JSON.stringify(item));
      duplicatedItem.name = `${item.name} (สำเนา)`;
      duplicatedItem.item = `${item.item}_copy_${Date.now()}`;
      
      this.schedule.push(duplicatedItem);
      this.showNotification(`สำเนา ${item.name} แล้ว`, 'success');
    },

    // Round Management
    removeRound(item, roundIndex) {
      if (confirm('คุณต้องการลบรอบนี้หรือไม่?')) {
        item.rounds.splice(roundIndex, 1);
        this.updateScheduleConfig(item);
        this.showNotification('ลบรอบแล้ว', 'success');
      }
    },

    addCustomRound(item) {
      if (item.customRound && item.customRound.trim()) {
        const newRound = {
          name: item.customRound.trim(),
          StartDate: '',
          EndDate: '',
          StartDateUsed: false,
          EndDateUsed: false,
        };
        item.rounds.push(newRound);
        item.customRound = '';
        this.updateScheduleConfig(item);
        this.showNotification(`เพิ่มรอบ "${newRound.name}" แล้ว`, 'success');
      }
    },

    // Notification System
    showNotification(message, type = 'success') {
      const notification = {
        id: ++this.notificationId,
        message,
        type,
        show: true
      };
      this.notifications.push(notification);
      
      setTimeout(() => {
        this.hideNotification(notification.id);
      }, 5000);
    },

    hideNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    },

    // API Methods
    async loadScheduleConfig() {
      this.isLoading = true;
      try {
        const { data, status } = await this.$Request.GET(`course/${this.dataItem}`, this.configs.key);
        
        if (status === 200) {
          this.scheduleConfig = data.scheduleConfig || [];
          this.updateScheduleFromConfig();
          console.log('Schedule config loaded:', this.scheduleConfig);
          this.showNotification('โหลดข้อมูลตารางเวลาสำเร็จ', 'success');
        }
      } catch (error) {
        console.error('Error loading schedule config:', error);
        this.showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async updateScheduleConfig(item) {
      try {
        console.log("Updating schedule config:", JSON.stringify(this.scheduleConfig, null, 2));

        // Auto expand/collapse when item is enabled/disabled
        if (item.used) {
          this.autoExpandSchedule(item, true);
        } else {
          this.autoCollapseSchedule(item, true);
        }

        const existingConfigIndex = this.scheduleConfig.findIndex(config => config.item === item.item);
        
        const updatedConfig = {
          item: item.item,
          use: item.used,
          startDate: item.startDateUsed ? item.startDate?.dateTime || item.startDate : null,
          endDate: item.endDateUsed ? item.endDate?.dateTime || item.endDate : null,
          round: item.roundUsed,
          rounds: item.rounds.map(round => ({
            name: round.name,
            StartDate: round.StartDateUsed ? round.StartDate?.dateTime || round.StartDate : null,
            EndDate: round.EndDateUsed ? round.EndDate?.dateTime || round.EndDate : null,
          })),
        };

        if (item.used) {
          if (existingConfigIndex === -1) {
            this.scheduleConfig.push(updatedConfig);
          } else {
            this.scheduleConfig[existingConfigIndex] = updatedConfig;
          }
        } else {
          if (existingConfigIndex !== -1) {
            this.scheduleConfig.splice(existingConfigIndex, 1);
          }
        }

        const requestBody = { data: { scheduleConfig: this.scheduleConfig } };
        const { status } = await this.$Request.PUT(`course/${this.dataItem}`, requestBody, this.configs.key);
        
        if (status === 200) {
          console.log('Schedule config updated successfully');
        }
      } catch (error) {
        console.error('Error updating schedule config:', error);
        this.showNotification('เกิดข้อผิดพลาดในการบันทึก', 'error');
      }
    },

    // Date Update Methods
    completeStartDate(item, dateTime) {
      item.startDate = dateTime;
      this.updateScheduleConfig({ ...item });
    },

    completeEndDate(item, dateTime) {
      item.endDate = dateTime;
      this.updateScheduleConfig({ ...item });
    },

    updateRoundStartDate(round, dateTime) {
      console.log("Updating round start date:", round.name, "->", dateTime);
      const item = this.schedule.find(i => i.rounds.includes(round));

      if (item) {
        item.rounds = item.rounds.map(r => 
          r.name === round.name ? { ...r, StartDate: dateTime, StartDateUsed: true } : r
        );
        this.updateScheduleConfig(item);
      }
    },

    updateRoundEndDate(round, dateTime) {
      console.log("Updating round end date:", round.name, "->", dateTime);
      const item = this.schedule.find(i => i.rounds.includes(round));

      if (item) {
        item.rounds = item.rounds.map(r => 
          r.name === round.name ? { ...r, EndDate: dateTime, EndDateUsed: true } : r
        );
        this.updateScheduleConfig(item);
      }
    },

    // Configuration Update
    updateScheduleFromConfig() {
      this.schedule.forEach((item, itemIndex) => {
        const config = this.scheduleConfig.find(config => config.item === item.item);
        if (config) {
          console.log(`Updating ${item.item} from scheduleConfig`, config);

          item.used = config.use;
          item.startDate = config.startDate || '';
          item.endDate = config.endDate || '';
          item.roundUsed = config.round;
          item.rounds = config.rounds || [];

          item.startDateUsed = !!config.startDate;
          item.endDateUsed = !!config.endDate;

          item.rounds.forEach(round => {
            const roundConfig = config.rounds.find(r => r.name === round.name);
            if (roundConfig) {
              round.StartDate = roundConfig.StartDate || '';
              round.EndDate = roundConfig.EndDate || '';
              round.StartDateUsed = !!roundConfig.StartDate;
              round.EndDateUsed = !!roundConfig.EndDate;
            }
          });

          // Auto expand if schedule is used
          if (item.used && !this.expandedSchedules.includes(itemIndex)) {
            this.expandedSchedules.push(itemIndex);
          }
        }
      });
    },

    // Validation Methods
    validateScheduleDates(item) {
      if (item.startDateUsed && item.endDateUsed && item.startDate && item.endDate) {
        const startDate = new Date(item.startDate.dateTime || item.startDate);
        const endDate = new Date(item.endDate.dateTime || item.endDate);
        
        if (startDate >= endDate) {
          this.showNotification('วันเริ่มต้นต้องมาก่อนวันสิ้นสุด', 'error');
          return false;
        }
      }
      return true;
    },

    validateRoundDates(round) {
      if (round.StartDateUsed && round.EndDateUsed && round.StartDate && round.EndDate) {
        const startDate = new Date(round.StartDate.dateTime || round.StartDate);
        const endDate = new Date(round.EndDate.dateTime || round.EndDate);
        
        if (startDate >= endDate) {
          this.showNotification('วันเริ่มรอบต้องมาก่อนวันสิ้นสุดรอบ', 'error');
          return false;
        }
      }
      return true;
    }
  },
  mounted() {
    this.loadScheduleConfig();
  },
}
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
  @apply btn-modern bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500;
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

/* Schedule Card Animations */
.schedule-card {
  @apply transition-all duration-200 hover:shadow-md hover:-translate-y-1;
}

/* Schedule Transitions */
.schedule-enter-active,
.schedule-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.schedule-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.schedule-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.schedule-move {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Round Transitions */
.round-enter-active,
.round-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.round-enter-from {
  opacity: 0;
  transform: translateX(-5px) scale(0.99);
}

.round-leave-to {
  opacity: 0;
  transform: translateX(5px) scale(0.99);
}

.round-move {
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Badge Styles */
.badge-modern {
  @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium;
}

.badge-primary-modern {
  @apply badge-modern bg-indigo-100 text-indigo-800;
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
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.gradient-bg-light {
  background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%);
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
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
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
  @apply text-indigo-600 hover:text-indigo-800 underline;
}

/* Schedule specific styles */
.schedule-icon {
  @apply w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center;
}

.schedule-icon svg {
  @apply text-indigo-600 text-lg;
}

/* Enhanced Schedule Stats */
.schedule-stat-badge {
  @apply inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium;
}

.schedule-stat-badge.has-date {
  @apply bg-green-100 text-green-800;
}

.schedule-stat-badge.no-date {
  @apply bg-gray-100 text-gray-600;
}

.schedule-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.schedule-badge.active {
  @apply bg-green-100 text-green-800;
}

.schedule-badge.inactive {
  @apply bg-gray-100 text-gray-600;
}

.schedule-stats {
  @apply flex items-center space-x-4 text-sm text-gray-500;
}

.schedule-stat-item {
  @apply flex items-center;
}

.schedule-stat-item svg {
  @apply mr-1;
}

.schedule-actions {
  @apply flex items-center justify-between pt-4 border-t border-gray-200;
}

.schedule-action-group {
  @apply flex items-center space-x-4;
}

.schedule-action-button {
  @apply inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium transition-colors;
}

.schedule-action-button.active {
  @apply text-green-600 bg-green-50 border-green-200;
}

.schedule-action-button.normal {
  @apply text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100;
}

.schedule-action-button.edit {
  @apply text-gray-600 bg-white border-gray-200 hover:bg-gray-50;
}

.schedule-action-button.delete {
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

/* Toggle Switch Styles */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 24px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Form Elements */
.form-input {
  @apply block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200;
}

.form-input:focus {
  @apply shadow-sm;
}

.form-checkbox {
  @apply appearance-none w-4 h-4 border border-gray-300 rounded bg-white checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200;
}

.form-checkbox:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e");
}

/* Notification Styles */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Stats Grid */
.stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
}

.stat-card {
  @apply bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow;
}

.stat-value {
  @apply text-2xl font-bold;
}

.stat-label {
  @apply text-sm font-medium text-gray-600;
}

/* Action Bar */
.action-bar {
  @apply flex flex-wrap items-center gap-3 p-4 bg-gray-50 border-b border-gray-200;
}

.action-group {
  @apply flex items-center space-x-2;
}

.action-divider {
  @apply border-l border-gray-300 pl-3 ml-3;
}

/* Configuration Panel */
.config-panel {
  @apply bg-gray-50 border-t border-gray-200;
}

.config-content {
  @apply p-4 space-y-4;
}

.config-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.config-section {
  @apply bg-white rounded-lg border border-gray-200 p-4;
}

.config-header {
  @apply flex items-center text-sm font-medium text-gray-800 mb-3;
}

.config-body {
  @apply space-y-3;
}

/* Round Management */
.round-list {
  @apply space-y-2;
}

.round-item {
  @apply border border-gray-200 rounded-lg p-3 bg-white hover:shadow-sm transition-shadow;
}

.round-header {
  @apply flex items-center justify-between mb-2;
}

.round-name {
  @apply text-sm font-medium text-gray-900 flex items-center;
}

.round-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-2;
}

.round-date-section {
  @apply bg-gray-50 rounded-lg p-3 border border-gray-200;
}

.round-date-label {
  @apply flex items-center text-xs font-medium text-gray-700 mb-2;
}

.round-date-input {
  @apply bg-white rounded-lg border border-gray-200 p-1;
}

/* Empty States */
.empty-rounds {
  @apply text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300;
}

.empty-rounds-icon {
  @apply text-2xl mb-2 text-gray-400;
}

.empty-rounds-title {
  @apply text-sm font-medium text-gray-900 mb-1;
}

.empty-rounds-description {
  @apply text-xs text-gray-500;
}

/* Disabled States */
.disabled-section {
  @apply text-center py-6 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300;
}

.disabled-icon {
  @apply text-2xl mb-2;
}

.disabled-title {
  @apply text-sm font-medium text-gray-600 mb-1;
}

.disabled-description {
  @apply text-xs text-gray-500;
}
</style>