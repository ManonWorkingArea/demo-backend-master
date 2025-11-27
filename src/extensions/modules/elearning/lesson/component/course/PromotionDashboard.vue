<template>
  <div>
    <!-- Promotion Cards View -->
    <div v-if="currentView === 'cards'">
      <!-- Header Section -->
      <div class="bg-white p-4 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-xl font-medium text-gray-900">จัดการโปรโมชั่น</h2>
            <p class="text-sm text-gray-600 mt-1">เลือกโปรโมชั่นเพื่อดูรายละเอียด</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="refreshData" 
                    class="px-3 py-1.5 bg-gray-600 text-white text-sm rounded flex items-center gap-1.5">
              <i class="fas fa-sync-alt text-xs"></i>
              รีเฟรช
            </button>
            <button 
              @click="currentView = 'add'"
              class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded flex items-center gap-1.5">
              <i class="fas fa-plus text-xs"></i>
              เพิ่มโปรโมชั่น
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="bg-gray-50 p-4 border-b border-gray-200">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="bg-white rounded-lg p-3 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-600">ทั้งหมด</p>
                <p class="text-lg font-semibold text-gray-900">{{ totalPromotions }}</p>
              </div>
              <i class="fas fa-tags text-gray-400 text-sm"></i>
            </div>
          </div>

          <div class="bg-white rounded-lg p-3 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-600">ใช้งานได้</p>
                <p class="text-lg font-semibold text-green-700">{{ activePromotions }}</p>
              </div>
              <i class="fas fa-check-circle text-green-500 text-sm"></i>
            </div>
          </div>

          <div class="bg-white rounded-lg p-3 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-600">ถูกใช้</p>
                <p class="text-lg font-semibold text-blue-700">{{ usedPromotions }}</p>
              </div>
              <i class="fas fa-chart-line text-blue-500 text-sm"></i>
            </div>
          </div>

          <div class="bg-white rounded-lg p-3 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-600">หมดอายุ</p>
                <p class="text-lg font-semibold text-red-700">{{ expiredPromotions }}</p>
              </div>
              <i class="fas fa-clock text-red-500 text-sm"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Promotion Cards Grid -->
      <div class="flex-1 p-4">
        <div v-if="loading" class="flex items-center justify-center h-48">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mx-auto mb-3"></div>
            <p class="text-sm text-gray-600">กำลังโหลด...</p>
          </div>
        </div>

        <div v-else-if="promotions.length === 0" class="flex items-center justify-center h-48">
          <div class="text-center text-gray-500">
            <i class="fas fa-tags text-3xl mb-3 text-gray-300"></i>
            <p class="font-medium">ยังไม่มีโปรโมชั่น</p>
            <p class="text-sm text-gray-400">เริ่มต้นสร้างโปรโมชั่นแรก</p>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="promotion in promotions" 
            :key="promotion._id"
            @click="viewPromotionDetails(promotion)"
            class="promotion-card bg-white rounded-lg border border-gray-200 cursor-pointer"
          >
            <!-- Card Header -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-900 line-clamp-2">
                  {{ promotion.name }}
                </h3>
                <span 
                  class="inline-flex px-2 py-1 text-xs font-medium rounded ml-2"
                  :class="getPromotionStatusColor(promotion)"
                >
                  {{ getPromotionStatusLabel(promotion) }}
                </span>
              </div>

              <p class="text-xs text-gray-600 line-clamp-2 mb-3">
                {{ promotion.description }}
              </p>

              <!-- Promotion Code -->
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-flex px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded">
                  {{ promotion.code }}
                </span>
                <button 
                  @click.stop="copyPromotionCode(promotion.code)"
                  class="p-1 text-gray-400"
                  title="คัดลอก"
                >
                  <i class="fas fa-copy text-xs"></i>
                </button>
              </div>

              <!-- Discount Info -->
              <div class="flex items-center gap-3 text-xs">
                <span class="text-gray-600">ส่วนลด:</span>
                <span class="font-medium text-blue-600">
                  {{ formatDiscount(promotion.discount, promotion.discountType) }}
                </span>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-4">
              <!-- Date Range -->
              <div class="flex items-center justify-between mb-3 text-xs text-gray-600">
                <span>{{ formatDate(promotion.startDate) }}</span>
                <span class="text-gray-400">-</span>
                <span>{{ formatDate(promotion.endDate) }}</span>
              </div>

              <!-- Usage Stats -->
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-600">ใช้แล้ว:</span>
                  <span class="font-medium">
                    {{ promotion.usageCount || 0 }}
                    <span v-if="promotion.usageLimit" class="text-gray-400">
                      / {{ promotion.usageLimit }}
                    </span>
                    <span v-else class="text-gray-400">/ ไม่จำกัด</span>
                  </span>
                </div>

                <!-- Usage Progress Bar -->
                <div v-if="promotion.usageLimit" class="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    class="bg-blue-500 h-1.5 rounded-full"
                    :style="{ width: getUsagePercentage(promotion) + '%' }"
                  ></div>
                </div>

                <!-- Quick Stats -->
                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div class="text-center">
                    <div class="text-sm font-medium text-green-600">
                      {{ calculateSavings(promotion) }}
                    </div>
                    <div class="text-xs text-gray-500">ประหยัด</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-medium text-orange-600">
                      {{ getDaysRemaining(promotion) }}
                    </div>
                    <div class="text-xs text-gray-500">เหลือ</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="px-4 py-2 bg-gray-50 border-t border-gray-100 rounded-b-lg">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">
                  {{ formatDate(promotion.createdAt) }}
                </span>
                <div class="flex items-center gap-1">
                  <button 
                    @click.stop="editPromotion(promotion)"
                    class="p-1 text-gray-400"
                    title="แก้ไข"
                  >
                    <i class="fas fa-edit text-xs"></i>
                  </button>
                  <button 
                    @click.stop="togglePromotionStatus(promotion)"
                    class="p-1 text-gray-400"
                    :title="promotion.status === 'active' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'"
                  >
                    <i :class="promotion.status === 'active' ? 'fas fa-pause' : 'fas fa-play'" class="text-xs"></i>
                  </button>
                  <button 
                    @click.stop="deletePromotion(promotion)"
                    class="p-1 text-gray-400"
                    title="ลบ"
                  >
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Promotion Detail Dashboard -->
    <div v-if="currentView === 'dashboard'">
      <!-- Dashboard Header -->
      <div class="bg-white p-4 border-b border-gray-200 sticky top-0 z-10">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button 
              @click="backToCards"
              class="p-1.5 text-gray-600 rounded"
            >
              <i class="fas fa-arrow-left"></i>
            </button>
            <div>
              <h2 class="text-lg font-medium text-gray-900">{{ selectedPromotion?.name }}</h2>
              <p class="text-sm text-gray-600 flex items-center gap-2">
                <span class="inline-flex px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded">
                  {{ selectedPromotion?.code }}
                </span>
                <span 
                  class="inline-flex px-2 py-1 text-xs font-medium rounded"
                  :class="getPromotionStatusColor(selectedPromotion)"
                >
                  {{ getPromotionStatusLabel(selectedPromotion) }}
                </span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="exportCampaignData"
                    v-if="selectedPromotion && selectedPromotion._id === '1' && allCampaignParticipants.length > 0"
                    class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors duration-200 flex items-center gap-1">
              <i class="fas fa-download text-xs"></i>
              ส่งออก
            </button>
            <button 
              class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded"
            >
              <i class="fas fa-edit mr-1"></i>
              แก้ไข
            </button>
            <button 
              class="px-3 py-1.5 bg-gray-600 text-white text-sm rounded"
            >
              <i class="fas fa-share-alt mr-1"></i>
              แชร์
            </button>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="p-4 bg-gray-50">
        <!-- FTI Academy Campaign Analytics (แสดงเสมอถ้ามีข้อมูลหรือกำลังโหลด) -->
        <div v-if="campaignLoading || (selectedPromotion && selectedPromotion._id === '1') || campaignStats.totalParticipants > 0" class="space-y-4 mb-6">
          <!-- Loading State for Campaign Data - Widget Skeleton -->
          <div v-if="campaignLoading">
            <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div class="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div class="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-5 gap-3 animate-pulse">
                <div v-for="widgetIndex in 5" :key="`widget-skeleton-${widgetIndex}`" 
                     class="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div class="w-6 h-6 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded mb-2 w-16 mx-auto"></div>
                  <div class="h-6 bg-gray-200 rounded w-12 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Campaign Data Message -->
          <div v-else-if="!campaignStats" class="bg-white rounded-lg p-8 border border-gray-200">
            <div class="text-center">
              <div class="text-gray-500 mb-4">
                <i class="fas fa-info-circle text-3xl mb-3"></i>
                <p class="font-medium">ไม่พบข้อมูลผู้เข้าร่วมแคมเปญ</p>
                <p class="text-sm mt-2">กรุณาตรวจสอบการเชื่อมต่อ API หรือข้อมูลในระบบ</p>
                <p class="text-xs mt-2 text-gray-400">
                  Debug: allCampaignParticipants.length = {{ allCampaignParticipants.length }}
                </p>
              </div>
              <button @click="getFTIAcademyCampaignData" 
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <i class="fas fa-refresh mr-2"></i>
                ลองอีกครั้ง
              </button>
            </div>
          </div>

          <!-- Campaign Content (when not loading) -->
          <div v-else-if="campaignStats">
            <!-- Campaign Overview Stats -->
          <div class="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <i class="fas fa-graduation-cap text-blue-600"></i>
                FTI Academy NCDs Campaign Dashboard
              </h3>
              <span class="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
                Live Analytics
              </span>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div class="bg-white rounded-lg p-3 text-center border border-gray-200">
                <i class="fas fa-users text-blue-500 mb-1"></i>
                <p class="text-xs text-gray-600">ผู้เข้าร่วม</p>
                <p class="text-lg font-bold text-blue-700">{{ campaignStats.totalParticipants }}</p>
              </div>
              
              <div class="bg-white rounded-lg p-3 text-center border border-gray-200">
                <i class="fas fa-trophy text-green-500 mb-1"></i>
                <p class="text-xs text-gray-600">เรียนครบแล้ว</p>
                <p class="text-lg font-bold text-green-700">{{ campaignStats.completedCount }}</p>
              </div>
              
              <div class="bg-white rounded-lg p-3 text-center border border-gray-200">
                <i class="fas fa-fire text-orange-500 mb-1"></i>
                <p class="text-xs text-gray-600">ใกล้ครบ (80%+)</p>
                <p class="text-lg font-bold text-orange-700">{{ campaignStats.nearCompletionCount }}</p>
              </div>
              
              <div class="bg-white rounded-lg p-3 text-center border border-gray-200">
                <i class="fas fa-gift text-purple-500 mb-1"></i>
                <p class="text-xs text-gray-600">รับรางวัลแล้ว</p>
                <p class="text-lg font-bold text-purple-700">{{ campaignStats.rewardsClaimed }}</p>
              </div>
              
              <div class="bg-white rounded-lg p-3 text-center border border-gray-200">
                <i class="fas fa-percentage text-gray-500 mb-1"></i>
                <p class="text-xs text-gray-600">อัตราสำเร็จ</p>
                <p class="text-lg font-bold text-gray-700">{{ campaignStats.completionRate }}%</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Participants Progress Table (แสดงเสมอเมื่อมีข้อมูลหรือกำลังโหลด) -->
        <div v-if="campaignLoading || allCampaignParticipants.length > 0" class="bg-white rounded-lg p-4 border border-gray-200 mt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <i class="fas fa-chart-line text-green-600"></i>
                สรุปความคืบหน้าผู้เรียนทั้งหมด
              </h3>
              
              <!-- Search and Controls -->
              <div class="flex items-center gap-4">
                <!-- Search Input -->
                <div class="flex items-center gap-2">
                  <i class="fas fa-search text-gray-400 text-sm"></i>
                  <input
                    v-model="participantSearch"
                    type="text"
                    placeholder="ค้นหาจากชื่อ-นามสกุล..."
                    class="text-sm border border-gray-300 rounded px-3 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <!-- Show records options -->
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500">แสดง:</span>
                  <select 
                    v-model="participantPerPage" 
                    @change="participantShowAll = false"
                    class="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="20">20 รายการ</option>
                    <option value="50">50 รายการ</option>
                    <option value="100">100 รายการ</option>
                  </select>
                  <button
                    @click="toggleShowAll()"
                    :class="[
                      'text-xs px-2 py-1 rounded border transition-colors',
                      participantShowAll 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'border-gray-300 hover:bg-gray-50'
                    ]"
                  >
                    ทั้งหมด
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Search Results Info -->
            <div v-if="participantSearch" class="mb-3 text-sm text-gray-600">
              <i class="fas fa-info-circle mr-1"></i>
              พบ {{ filteredParticipants.length }} รายการจากการค้นหา "{{ participantSearch }}"
              <button 
                @click="participantSearch = ''"
                class="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                ล้างการค้นหา
              </button>
            </div>
            
            <div class="flex items-center justify-between mb-4">
              <!-- Sorting Controls and Export Button -->
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-500">เรียงตาม:</span>
                  <select 
                    v-model="campaignSortBy" 
                    @change="changeCampaignSort(campaignSortBy)"
                    class="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="totalProgress">ความคืบหน้า</option>
                    <option value="completedCourses">หลักสูตรที่จบ</option>
                    <option value="enrolledDate">วันที่ลงทะเบียน</option>
                    <option value="name">ชื่อ</option>
                  </select>
                  <button 
                    @click="changeCampaignSort(campaignSortBy)"
                    class="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <i :class="campaignSortOrder === 'desc' ? 'fas fa-sort-down' : 'fas fa-sort-up'"></i>
                  </button>
                </div>
              
                <button 
                  @click="exportCampaignData" 
                  class="px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  <i class="fas fa-download mr-1"></i>
                  ส่งออก CSV
                </button>
                
                <button 
                  @click="refreshCampaignData" 
                  :disabled="campaignLoading"
                  class="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i :class="[
                    'fas mr-1',
                    campaignLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'
                  ]"></i>
                  {{ campaignLoading ? 'กำลังโหลด...' : 'รีเฟรช' }}
                </button>
              </div>
              
              <div class="flex items-center gap-2 text-xs">
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>เรียนครบ</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>ใกล้ครบ</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>กำลังเรียน</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>เริ่มใหม่</span>
                </div>
              </div>
            </div>

            <div class="overflow-x-auto">
              <!-- Skeleton Loading for Table -->
              <div v-if="campaignLoading" class="animate-pulse">
                <!-- Table Header Skeleton -->
                <div class="bg-gray-50 rounded-t-lg border border-gray-200">
                  <div class="grid grid-cols-8 gap-0">
                    <div class="px-3 py-3 text-center border-r border-gray-200">
                      <div class="h-4 bg-gray-200 rounded w-12 mx-auto"></div>
                    </div>
                    <div class="px-3 py-3 border-r border-gray-200">
                      <div class="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div class="px-3 py-3 text-center border-r border-gray-200">
                      <div class="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                    </div>
                    <div class="px-3 py-3 text-center border-r border-gray-200">
                      <div class="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                    </div>
                    <div class="px-3 py-3 text-center border-r border-gray-200">
                      <div class="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                    </div>
                    <div class="px-3 py-3 text-center border-r border-gray-200">
                      <div class="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                    </div>
                    <div class="px-3 py-3 text-center">
                      <div class="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                    </div>
                    <div class="px-3 py-3 text-center">
                      <div class="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                    </div>
                  </div>
                </div>
                
                <!-- Skeleton Table Body -->
                <div class="bg-white border border-t-0 border-gray-200 rounded-b-lg divide-y divide-gray-100">
                  <div v-for="skeletonIndex in parseInt(participantPerPage || 20)" 
                       :key="`skeleton-row-${skeletonIndex}`" 
                       class="grid grid-cols-8 gap-0 hover:bg-gray-50 transition-colors">
                    
                    <!-- Index Column -->
                    <div class="px-3 py-4 text-center border-r border-gray-100">
                      <div class="h-4 w-6 bg-gray-200 rounded mx-auto"></div>
                    </div>
                    
                    <!-- User Info Column -->
                    <div class="px-3 py-4 border-r border-gray-100">
                      <div class="flex items-center gap-3">
                        <div class="w-2 h-2 bg-gray-200 rounded-full"></div>
                        <div class="flex-1 space-y-2">
                          <div class="h-4 bg-gray-200 rounded" 
                               :style="{ width: Math.random() * 40 + 120 + 'px' }"></div>
                          <div class="h-3 bg-gray-200 rounded" 
                               :style="{ width: Math.random() * 60 + 100 + 'px' }"></div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Progress Column -->
                    <div class="px-3 py-4 text-center border-r border-gray-100">
                      <div class="flex items-center justify-center gap-2">
                        <div class="w-16 h-2 bg-gray-200 rounded-full"></div>
                        <div class="h-3 w-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    
                    <!-- Completed Courses Column -->
                    <div class="px-3 py-4 text-center border-r border-gray-100">
                      <div class="h-4 w-8 bg-gray-200 rounded mx-auto"></div>
                    </div>
                    
                    <!-- Status Column -->
                    <div class="px-3 py-4 text-center border-r border-gray-100">
                      <div class="h-6 w-16 bg-gray-200 rounded-full mx-auto"></div>
                    </div>
                    
                    <!-- Date Column -->
                    <div class="px-3 py-4 text-center border-r border-gray-100">
                      <div class="h-3 w-20 bg-gray-200 rounded mx-auto"></div>
                    </div>
                    
                    <!-- Verification Column -->
                    <div class="px-3 py-4 text-center">
                      <div class="space-y-1">
                        <div class="h-4 w-4 bg-gray-200 rounded mx-auto"></div>
                        <div class="h-3 w-16 bg-gray-200 rounded mx-auto"></div>
                      </div>
                    </div>
                    
                    <!-- Action Column -->
                    <div class="px-3 py-4 text-center">
                      <div class="h-8 w-16 bg-gray-200 rounded mx-auto"></div>
                    </div>
                  </div>
                </div>
                
                <!-- Skeleton Pagination -->
                <div class="mt-4 pt-3 border-t border-gray-200">
                  <div class="flex items-center justify-between">
                    <div class="h-4 w-48 bg-gray-200 rounded"></div>
                    <div class="flex items-center space-x-2">
                      <div class="h-8 w-8 bg-gray-200 rounded"></div>
                      <div class="h-8 w-8 bg-gray-200 rounded"></div>
                      <div class="h-8 w-8 bg-gray-200 rounded"></div>
                      <div class="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Empty State -->
              <div v-else-if="!allCampaignParticipants.length" class="flex items-center justify-center py-12">
                <div class="text-center">
                  <i class="fas fa-users text-gray-300 text-4xl mb-3"></i>
                  <p class="text-gray-500 text-sm">ยังไม่มีข้อมูลผู้เข้าร่วมแคมเปญ</p>
                </div>
              </div>
              
              <!-- Data Table -->
              <table class="w-full" v-else>
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้เรียน</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ความคืบหน้า</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">เรียนครบ</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะรางวัล</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่สมัคร</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ตรวจสอบแล้ว</th>
                    <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <template v-for="(participant, index) in displayedParticipants" :key="`participant-${participant?.id || index}`">
                    <!-- Main participant row -->
                    <tr v-if="participant && participant.id" 
                        @click="toggleRowExpansion(participant.id)"
                        :class="[
                          'hover:bg-gray-50 cursor-pointer transition-colors',
                          isRowExpanded(participant.id) ? 'bg-blue-50' : ''
                        ]">
                      <td class="px-3 py-3 text-center">
                        <div class="flex items-center justify-center gap-2">
                          <span class="text-sm font-medium text-gray-600">{{ getRowNumber(index) }}</span>
                          <i :class="[
                            'fas text-xs transition-transform duration-200',
                            isRowExpanded(participant.id) ? 'fa-chevron-up text-blue-600' : 'fa-chevron-down text-gray-400'
                          ]"></i>
                        </div>
                      </td>
                      <td class="px-3 py-3">
                        <div class="flex items-center gap-3">
                          <div 
                            class="w-2 h-2 rounded-full"
                            :class="{
                              'bg-green-500': participant.status === 'completed',
                              'bg-orange-500': participant.totalProgress >= 80 && participant.status !== 'completed',
                              'bg-blue-500': participant.status === 'in_progress' && participant.totalProgress < 80,
                              'bg-gray-400': participant.status === 'just_started'
                            }"
                          ></div>
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ participant.name || 'ไม่ระบุชื่อ' }}</p>
                            <p class="text-xs text-gray-500">{{ participant.email || '' }}</p>
                          </div>
                        </div>
                      </td>
                    
                      <td class="px-3 py-3 text-center">
                        <div class="flex items-center justify-center gap-2">
                          <div class="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              class="h-1.5 rounded-full transition-all duration-300"
                              :class="{
                                'bg-green-500': participant.totalProgress === 100,
                                'bg-orange-500': participant.totalProgress >= 80 && participant.totalProgress < 100,
                                'bg-blue-500': participant.totalProgress >= 40 && participant.totalProgress < 80,
                                'bg-gray-400': participant.totalProgress < 40
                              }"
                              :style="{ width: Math.max(0, Math.min(100, participant.totalProgress || 0)) + '%' }"
                            ></div>
                          </div>
                          <span class="text-xs font-medium text-gray-700">{{ participant.totalProgress || 0 }}%</span>
                        </div>
                      </td>
                    
                      <td class="px-3 py-3 text-center">
                        <span class="text-sm font-medium" :class="{
                          'text-green-700': participant.completedCourses === 5,
                          'text-orange-700': participant.completedCourses >= 3 && participant.completedCourses < 5,
                          'text-blue-700': participant.completedCourses > 0 && participant.completedCourses < 3,
                          'text-gray-600': participant.completedCourses === 0
                        }">
                          {{ participant.completedCourses || 0 }}/5
                        </span>
                      </td>
                    
                      <td class="px-3 py-3 text-center">
                        <span v-if="participant.status === 'completed'" class="inline-flex items-center gap-1">
                          <i class="fas fa-gift text-purple-500 text-xs"></i>
                          <span :class="{
                            'text-purple-700 font-medium': participant.rewardClaimed,
                            'text-orange-600': !participant.rewardClaimed
                          }">
                            {{ participant.rewardClaimed ? 'รับแล้ว' : 'รอรับ' }}
                          </span>
                        </span>
                        <span v-else class="text-gray-400 text-xs">ยังไม่ครบ</span>
                      </td>
                    
                      <td class="px-3 py-3 text-center">
                        <span class="text-xs text-gray-600">{{ formatDate(participant.enrolledDate) }}</span>
                      </td>
                    
                      <td class="px-3 py-3 text-center">
                        <div class="flex flex-col items-center justify-center">
                          <div class="flex items-center justify-center mb-1">
                            <input 
                              type="checkbox" 
                              :id="`verification-${participant.id}`"
                              :checked="participant.isVerified || false"
                              @change="handleVerificationChange(participant, $event)"
                              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            >
                            <label :for="`verification-${participant.id}`" class="ml-1 text-xs select-none">
                              <i class="fas fa-check-circle text-green-500" v-if="participant.isVerified"></i>
                              <i class="fas fa-circle text-gray-300" v-else></i>
                            </label>
                          </div>
                          <div v-if="participant.isVerified && participant.lastVerified" 
                               class="text-xs text-gray-500 text-center leading-tight">
                            {{ formatDateTime(participant.lastVerified) }}
                          </div>
                        </div>
                      </td>
                      
                      <!-- Action column for student detail navigation -->
                      <td class="px-3 py-3 text-center">
                        <button 
                          @click="openStudentDetail(participant.userInfo._id)"
                          class="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          title="ดูข้อมูลผู้เรียน"
                        >
                          <i class="fas fa-user-graduate mr-1.5"></i>
                          ดูข้อมูล
                        </button>
                      </td>
                    </tr>
                    
                    <!-- Expandable course details row -->
                    <tr v-if="participant && participant.id && isRowExpanded(participant.id)" 
                        class="bg-gray-50 border-t border-gray-100">
                      <td colspan="8" class="px-6 py-4">
                        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                          <h4 class="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <i class="fas fa-book-open text-blue-600"></i>
                            รายละเอียดความคืบหน้าแต่ละหลักสูตร
                          </h4>
                          
                          <!-- Course progress in 3 columns -->
                          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <template v-if="participant.courseProgress && participant.courseProgress.length > 0">
                              <div v-for="(course, courseIndex) in participant.courseProgress" 
                                   :key="`course-${courseIndex}`"
                                   class="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div class="flex items-start justify-between mb-2">
                                  <h5 class="text-xs font-medium text-gray-700 leading-tight">
                                    {{ getCourseNameById(course.courseId) || `หลักสูตรที่ ${course.courseId}` }}
                                  </h5>
                                  <span class="text-xs font-bold px-2 py-1 rounded" 
                                        :class="{
                                          'bg-green-100 text-green-800': course.progress === 100,
                                          'bg-orange-100 text-orange-800': course.progress >= 80 && course.progress < 100,
                                          'bg-blue-100 text-blue-800': course.progress >= 40 && course.progress < 80,
                                          'bg-gray-100 text-gray-600': course.progress < 40
                                        }">
                                    {{ course.progress }}%
                                  </span>
                                </div>
                                
                                <!-- Progress bar -->
                                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                  <div class="h-2 rounded-full transition-all duration-300" 
                                       :class="{
                                         'bg-green-500': course.progress === 100,
                                         'bg-orange-500': course.progress >= 80 && course.progress < 100,
                                         'bg-blue-500': course.progress >= 40 && course.progress < 80,
                                         'bg-gray-400': course.progress < 40
                                       }"
                                       :style="{ width: Math.max(0, Math.min(100, course.progress || 0)) + '%' }">
                                  </div>
                                </div>
                                
                                <!-- Status and date info -->
                                <div class="text-xs text-gray-500 space-y-1">
                                  <div class="flex items-center justify-between">
                                    <span class="flex items-center gap-1">
                                      <i :class="[
                                        'fas',
                                        course.progress === 100 ? 'fa-check-circle text-green-500' :
                                        course.progress >= 80 ? 'fa-clock text-orange-500' :
                                        course.progress > 0 ? 'fa-play-circle text-blue-500' :
                                        'fa-circle text-gray-400'
                                      ]"></i>
                                      {{ course.progress === 100 ? 'เสร็จแล้ว' : 
                                         course.progress >= 80 ? 'ใกล้เสร็จ' :
                                         course.progress > 0 ? 'กำลังเรียน' : 'ยังไม่เริ่ม' }}
                                    </span>
                                  </div>
                                  
                                  <!-- Registration Date (use participant's main enrollment date) -->
                                  <div v-if="participant.enrolledDate" class="flex items-center gap-1">
                                    <i class="fas fa-user-plus text-blue-500"></i>
                                    <span class="text-xs">ลงทะเบียน: {{ formatDateTime(participant.enrolledDate) }}</span>
                                  </div>
                                  
                                  <!-- Completion Date (estimated for completed courses) -->
                                  <div v-if="course.progress === 100" class="flex items-center gap-1">
                                    <i class="fas fa-graduation-cap text-green-500"></i>
                                    <span class="text-xs">เรียนจบ: {{ getEstimatedCompletionDate(participant, course) }}</span>
                                  </div>
                                  
                                  <!-- Last Access Date -->
                                  <div v-if="course.lastAccessDate && course.progress < 100" class="flex items-center gap-1">
                                    <i class="fas fa-clock text-gray-500"></i>
                                    <span class="text-xs">เข้าถึงล่าสุด: {{ formatDateTime(course.lastAccessDate) }}</span>
                                  </div>
                                  
                                  <!-- Show progress update date if available -->
                                  <div v-else-if="course.progress < 100 && participant.lastLoginDate" class="flex items-center gap-1">
                                    <i class="fas fa-clock text-gray-500"></i>
                                    <span class="text-xs">เข้าสู่ระบบล่าสุด: {{ formatDateTime(participant.lastLoginDate) }}</span>
                                  </div>
                                </div>
                              </div>
                            </template>
                            
                            <!-- Empty state -->
                            <div v-else class="col-span-full text-center py-6 text-gray-500">
                              <i class="fas fa-book-open text-2xl mb-2 text-gray-300"></i>
                              <p class="text-sm">ยังไม่มีข้อมูลความคืบหน้าหลักสูตร</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
            
            <!-- Pagination Controls -->
            <div v-if="!participantShowAll && totalPages > 1" class="mt-4 pt-3 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-600">
                  แสดง {{ paginationInfo.start }} - {{ paginationInfo.end }} จาก {{ paginationInfo.total }} รายการ
                </div>
                
                <!-- Page navigation -->
                <div class="flex items-center space-x-1">
                  <!-- Previous button -->
                  <button @click="goToPage(currentPage - 1)" 
                          :disabled="currentPage === 1"
                          class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="fas fa-chevron-left"></i>
                  </button>

                  <!-- Page numbers -->
                  <button v-for="page in getVisiblePages()" :key="page"
                          @click="goToPage(page)"
                          :class="{
                            'bg-blue-600 text-white': page === currentPage,
                            'bg-white text-gray-700 hover:bg-gray-50': page !== currentPage
                          }"
                          class="px-3 py-1 text-sm border border-gray-300 rounded">
                    {{ page }}
                  </button>

                  <!-- Next button -->
                  <button @click="goToPage(currentPage + 1)" 
                          :disabled="currentPage === totalPages"
                          class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div class="bg-white rounded-lg p-3 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-600">จำนวนการใช้</p>
                <p class="text-lg font-semibold text-blue-700">{{ selectedPromotion?.usageCount || 0 }}</p>
              </div>
              <i class="fas fa-users text-blue-500 text-sm"></i>
            </div>
          </div>

          <div class="bg-white rounded-lg p-3 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-600">ยอดประหยัด</p>
                <p class="text-lg font-semibold text-green-700">{{ calculateSavings(selectedPromotion) }}</p>
              </div>
              <i class="fas fa-coins text-green-500 text-sm"></i>
            </div>
          </div>

          <div class="bg-white rounded-lg p-3 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-600">อัตราการใช้</p>
                <p class="text-lg font-semibold text-gray-900">{{ getUsageRate(selectedPromotion) }}%</p>
              </div>
              <i class="fas fa-percentage text-gray-500 text-sm"></i>
            </div>
          </div>

          <div class="bg-white rounded-lg p-3 border border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-600">วันที่เหลือ</p>
                <p class="text-lg font-semibold text-orange-700">{{ getDaysRemaining(selectedPromotion) }}</p>
              </div>
              <i class="fas fa-calendar-day text-orange-500 text-sm"></i>
            </div>
          </div>
        </div>

        <!-- Promotion Details -->
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-medium text-gray-900 mb-3">รายละเอียดโปรโมชั่น</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div>
                <label class="text-xs font-medium text-gray-600">ชื่อโปรโมชั่น</label>
                <p class="text-sm text-gray-900">{{ selectedPromotion?.name }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600">รายละเอียด</label>
                <p class="text-sm text-gray-900">{{ selectedPromotion?.description || '-' }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600">ประเภทส่วนลด</label>
                <p class="text-sm text-gray-900">{{ getPromotionTypeLabel(selectedPromotion?.type) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600">จำนวนส่วนลด</label>
                <p class="text-sm text-gray-900">{{ formatDiscount(selectedPromotion?.discount, selectedPromotion?.discountType) }}</p>
              </div>
            </div>
            <div class="space-y-3">
              <div>
                <label class="text-xs font-medium text-gray-600">วันที่เริ่มต้น</label>
                <p class="text-sm text-gray-900">{{ formatDate(selectedPromotion?.startDate) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600">วันที่สิ้นสุด</label>
                <p class="text-sm text-gray-900">{{ formatDate(selectedPromotion?.endDate) }}</p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600">จำกัดการใช้งาน</label>
                <p class="text-sm text-gray-900">
                  {{ selectedPromotion?.usageLimit ? selectedPromotion.usageLimit + ' ครั้ง' : 'ไม่จำกัด' }}
                </p>
              </div>
              <div>
                <label class="text-xs font-medium text-gray-600">สถานะ</label>
                <span 
                  class="inline-flex px-2 py-1 text-xs font-medium rounded"
                  :class="getPromotionStatusColor(selectedPromotion)"
                >
                  {{ getPromotionStatusLabel(selectedPromotion) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Promotion View -->
  <div v-if="currentView === 'add'">
    <!-- Add Form Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
          <button 
            @click="backToCards"
            class="p-1.5 text-gray-600 rounded"
          >
            <i class="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2 class="text-lg font-medium text-gray-900">เพิ่มโปรโมชั่นใหม่</h2>
            <p class="text-sm text-gray-600">กรอกข้อมูลโปรโมชั่นที่ต้องการเพิ่ม</p>
          </div>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="resetForm"
              class="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded"
            >
              <i class="fas fa-undo mr-1"></i>
              รีเซ็ต
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Form Content -->
    <div class="p-4">
      <div class="max-w-4xl mx-auto">
        <form @submit.prevent="savePromotion" class="space-y-4">
          <!-- Basic Information Section -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-sm font-medium text-gray-900 mb-3">ข้อมูลพื้นฐาน</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อโปรโมชั่น *</label>
                <input 
                  v-model="newPromotion.name"
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="เช่น ลดราคาพิเศษสำหรับสมาชิกใหม่"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">รหัสโปรโมชั่น *</label>
                <input 
                  v-model="newPromotion.code"
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  :class="{ 'border-red-500': checkCodeExists(newPromotion.code) && newPromotion.code !== '' }"
                  placeholder="เช่น NEWUSER20"
                  @input="newPromotion.code = newPromotion.code.toUpperCase()"
                >
                <div v-if="checkCodeExists(newPromotion.code) && newPromotion.code !== ''" class="text-red-500 text-xs mt-1">
                  รหัสโปรโมชั่นนี้มีอยู่แล้ว
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="mt-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
              <textarea 
                v-model="newPromotion.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="อธิบายรายละเอียดของโปรโมชั่น"
              ></textarea>
            </div>
          </div>

          <!-- Discount Information Section -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-sm font-medium text-gray-900 mb-3">ข้อมูลส่วนลด</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ประเภทส่วนลด *</label>
                <select 
                  v-model="newPromotion.discountType"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">เลือกประเภท</option>
                  <option value="percentage">เปอร์เซ็นต์ (%)</option>
                  <option value="fixed">จำนวนคงที่ (บาท)</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนส่วนลด * 
                  <span v-if="newPromotion.discountType === 'percentage'" class="text-gray-500">(%)</span>
                  <span v-if="newPromotion.discountType === 'fixed'" class="text-gray-500">(บาท)</span>
                </label>
                <input 
                  v-model.number="newPromotion.discount"
                  type="number" 
                  required
                  min="0"
                  :max="newPromotion.discountType === 'percentage' ? 100 : null"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  :placeholder="newPromotion.discountType === 'percentage' ? 'เช่น 20' : 'เช่น 500'"
                >
              </div>
            </div>
          </div>

          <!-- Date Range Section -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-sm font-medium text-gray-900 mb-3">ช่วงเวลาใช้งาน</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่เริ่มต้น *</label>
                <input 
                  v-model="newPromotion.startDate"
                  type="date" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">วันที่สิ้นสุด *</label>
                <input 
                  v-model="newPromotion.endDate"
                  type="date" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  :class="{ 'border-red-500': isDateRangeInvalid }"
                >
                <div v-if="isDateRangeInvalid" class="text-red-500 text-xs mt-1">
                  วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น
                </div>
              </div>
            </div>
          </div>

          <!-- Usage Settings Section -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-sm font-medium text-gray-900 mb-3">การตั้งค่าการใช้งาน</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">จำกัดการใช้งาน</label>
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      v-model="hasUsageLimit"
                      class="rounded"
                    >
                    <span class="text-sm text-gray-600">จำกัดจำนวนครั้งที่ใช้</span>
                  </div>
                  <input 
                    v-if="hasUsageLimit"
                    v-model.number="newPromotion.usageLimit"
                    type="number" 
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="จำนวนครั้งที่อนุญาต เช่น 1000"
                  >
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทโปรโมชั่น</label>
                <select 
                  v-model="newPromotion.type"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="general">ทั่วไป</option>
                  <option value="new_user">สมาชิกใหม่</option>
                  <option value="vip">สมาชิก VIP</option>
                  <option value="seasonal">ตามฤดูกาล</option>
                  <option value="flash_sale">Flash Sale</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Status Section -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <h3 class="text-sm font-medium text-gray-900 mb-3">สถานะ</h3>
            <div class="flex items-center gap-6">
              <label class="flex items-center gap-2">
                <input 
                  type="radio" 
                  v-model="newPromotion.status" 
                  value="active"
                  class="text-blue-600"
                >
                <span class="text-sm text-gray-700">เปิดใช้งาน</span>
              </label>
              <label class="flex items-center gap-2">
                <input 
                  type="radio" 
                  v-model="newPromotion.status" 
                  value="inactive"
                  class="text-blue-600"
                >
                <span class="text-sm text-gray-700">ปิดใช้งาน</span>
              </label>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="flex justify-end gap-3">
            <button 
              type="button"
              @click="backToCards"
              class="px-6 py-2 border border-gray-300 text-gray-700 text-sm rounded"
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              :disabled="!isFormValid || loading"
              class="px-6 py-2 bg-blue-600 text-white text-sm rounded disabled:bg-gray-400"
            >
              <i v-if="!loading" class="fas fa-save mr-2"></i>
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ loading ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  <!-- Modal ถูกลบออกแล้ว -->
</div>
</template>

<script>
import storageManager from '@/plugins/storage'

export default {
  name: 'PromotionDashboard',
  
  data() {
    return {
      loading: false,
      currentView: 'cards', // 'cards', 'dashboard', หรือ 'add'
      selectedPromotion: null,
      promotions: [],
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      hostkey: null,
      
      // Add Promotion Form
      hasUsageLimit: false,
      newPromotion: {
        name: '',
        code: '',
        description: '',
        discountType: 'percentage',
        discount: null,
        startDate: '',
        endDate: '',
        usageLimit: null,
        type: 'general',
        status: 'active'
      },
      
      // Pagination (ใช้เมื่อมีตาราง)
      promotionsPerPage: 10,
      currentPromotionPage: 1,
      itemsPerPageOptions: [
        { value: 10, label: '10 รายการ' },
        { value: 25, label: '25 รายการ' },
        { value: 50, label: '50 รายการ' },
        { value: 100, label: '100 รายการ' },
        { value: -1, label: 'ทั้งหมด' }
      ],
      
      // FTI Academy NCDs Health Campaign Data
      samplePromotions: [
        {
          _id: '1',
          name: 'กิจกรรมเรียนฟรีปิ้งรางวัลกิน FTI ACADEMY กลับมาอีกครั้ง! กับ Theme สุขภาพดีไม่มี NCDs',
          code: 'FTIACADEMY100',
          description: 'เพียงเข้าเรียนให้ครบ 5 หลักสูตร เริ่มได้ที่นี่...ปิ้น องค์กรสุขภาวะในโครงการป้องกันโรค กับ 5 หลักสูตรสุดฮิต การสร้างแรงบันดาลใจในการป้องกันโรค NCDs และระบบสุขภาพในการส่งเสริมองค์กรสุขภาวะ สุขภาพดี... เริ่มต้นจากอาหาร โภชนาการกับการจัดการ NCDs Workshop ฉลาดกิน ฉลาดเลือก ฉลาดอยู่ ห่างไกลโรค NCDs',
          type: 'free_campaign',
          discount: 100,
          discountType: 'percentage',
          startDate: '2025-09-25',
          endDate: '2025-10-20',
          usageCount: 1247,
          usageLimit: 5000,
          status: 'active',
          createdAt: '2025-09-25T00:00:00Z',
          totalSavings: 249400,
          courseRequirement: 5,
          rewardType: 'gift_voucher',
          rewardValue: 200,
          rewardDescription: 'จู่มรับ Gift Voucher มูลค่า 200 บาท',
          completionRate: 24.94,
          campaignTheme: 'สุขภาพดีไม่มี NCDs',
          organizer: 'FTI Academy',
          lineOfficial: '@doacer',
          phoneContact: '1453 กด 12',
          qrCodeAvailable: true,
          features: [
            'องค์กรสุขภาวะ สร้างวิธาย เริ่มได้ที่นี่...ปิ้น',
            'องค์กรสุขภาวะในโครงการป้องกันโรค',
            'การสร้างแรงบันดาลใจในการป้องกันโรค NCDs และระบบสุขภาพในการส่งเสริมองค์กรสุขภาวะ',
            'สุขภาพดี... เริ่มต้นจากอาหาร',
            'โภชนาการกับการจัดการ NCDs',
            'Workshop ฉลาดกิน ฉลาดเลือก ฉลาดอยู่ ห่างไกลโรค NCDs'
          ]
        }
      ],

      // FTI Academy Campaign Participants Data from API
      campaignParticipants: [],
      campaignLoading: false, // เพิ่ม loading state สำหรับแคมเปญ
      

      
      // ข้อมูลทั้งหมดของผู้เข้าร่วมแคมเปญ (ไม่ใช้ MongoDB pagination)
      allCampaignParticipants: [],
      
      // Sorting และ Pagination แบบใหม่ (ใช้ JavaScript)
      campaignSortBy: 'totalProgress', // 'totalProgress', 'completedCourses', 'enrolledDate', 'name'
      campaignSortOrder: 'desc', // 'asc', 'desc'
      
      // Pagination สำหรับ campaign participants
      campaignCurrentPage: 1,
      campaignPerPage: 10,
      campaignTotalRecords: 0,
      campaignTotalPages: 0,
      
      // Search and pagination for participant table
      participantSearch: '',
      participantPerPage: 20,
      participantShowAll: false,
      
      // New pagination system
      currentPage: 1,
      itemsPerPage: 20,
      
      // Expandable rows for course details
      expandedRows: [] // Track which participant IDs are expanded
    }
  },

  computed: {
    totalPromotions() {
      return this.promotions.length;
    },
    
    activePromotions() {
      return this.promotions.filter(p => this.isPromotionActive(p)).length;
    },
    
    usedPromotions() {
      return this.promotions.reduce((sum, p) => sum + (p.usageCount || 0), 0);
    },
    
    expiredPromotions() {
      return this.promotions.filter(p => this.isPromotionExpired(p)).length;
    },
    
    topUsedPromotions() {
      return [...this.promotions]
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    },
    
    recentPromotions() {
      return [...this.promotions]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    // Pagination (เก็บไว้ใช้ในอนาคต)
    totalPromotionPages() {
      if (this.promotionsPerPage === -1) return 1;
      return Math.ceil(this.promotions.length / this.promotionsPerPage);
    },
    
    paginatedPromotions() {
      if (this.promotionsPerPage === -1) return this.promotions;
      const start = (this.currentPromotionPage - 1) * this.promotionsPerPage;
      const end = start + this.promotionsPerPage;
      return this.promotions.slice(start, end);
    },
    
    // Form validation
    isFormValid() {
      return this.newPromotion.name.trim() !== '' &&
             this.newPromotion.code.trim() !== '' &&
             !this.checkCodeExists(this.newPromotion.code) &&
             this.newPromotion.discountType !== '' &&
             this.newPromotion.discount > 0 &&
             this.newPromotion.startDate !== '' &&
             this.newPromotion.endDate !== '';
    },

    // Campaign Analytics (ใช้ข้อมูลจาก allCampaignParticipants)
    campaignStats() {
      // ถ้ามีข้อมูลจาก allCampaignParticipants ให้คำนวณจากข้อมูลจริง
      if (this.allCampaignParticipants && Array.isArray(this.allCampaignParticipants) && this.allCampaignParticipants.length > 0) {
        const total = this.allCampaignParticipants.length;
        const completed = this.allCampaignParticipants.filter(p => p.completedCourses === 5).length;
        const nearCompletion = this.allCampaignParticipants.filter(p => 
          p.completedCourses >= 3 && p.completedCourses < 5 || 
          (p.totalProgress >= 80 && p.completedCourses < 5)
        ).length;
        const inProgress = this.allCampaignParticipants.filter(p => 
          p.completedCourses < 3 && p.totalProgress >= 20 && p.totalProgress < 80
        ).length;
        const justStarted = this.allCampaignParticipants.filter(p => p.totalProgress < 20).length;
        
        return {
          totalParticipants: total,
          completedCount: completed,
          nearCompletionCount: nearCompletion,
          inProgressCount: inProgress,
          justStartedCount: justStarted,
          completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0',
          rewardsPending: completed, // สมมติว่ายังไม่มีใครรับรางวัล
          rewardsClaimed: 0 // ยังไม่มีการเคลมรางวัล
        };
      }
      
      // ถ้าไม่มีข้อมูลจริง ให้ return ค่า default
      return {
        totalParticipants: 0,
        completedCount: 0,
        nearCompletionCount: 0,
        inProgressCount: 0,
        justStartedCount: 0,
        rewardsClaimed: 0,
        completionRate: '0.0'
      };
    },

    filteredParticipants() {
      // ตรวจสอบข้อมูลพื้นฐาน
      if (!this.allCampaignParticipants || !Array.isArray(this.allCampaignParticipants) || !this.allCampaignParticipants.length) {
        return [];
      }
      
      // กรองเฉพาะข้อมูลที่ถูกต้องและสมบูรณ์
      let validParticipants = this.allCampaignParticipants.filter(p => {
        return p && 
               typeof p === 'object' && 
               p.id && 
               typeof p.id === 'string' && 
               p.name && 
               typeof p.name === 'string' &&
               typeof p.totalProgress === 'number' &&
               typeof p.completedCourses === 'number';
      });
      
      // Apply search filter
      if (this.participantSearch && this.participantSearch.trim()) {
        const searchTerm = this.participantSearch.trim().toLowerCase();
        validParticipants = validParticipants.filter(p => {
          const fullName = (p.name || '').toLowerCase();
          return fullName.includes(searchTerm);
        });
      }
      
      if (!validParticipants.length) {
        console.warn('No valid participants found');
        return [];
      }
      
      // สร้างสำเนาแล้วเรียงลำดับ
      let sorted;
      try {
        sorted = [...validParticipants].sort((a, b) => {
          // 1. ให้คนที่มี check mark (verified) อยู่ด้านบนเสมอ
          const aVerified = a.isVerified || false;
          const bVerified = b.isVerified || false;
          
          if (aVerified && !bVerified) return -1; // a อยู่ด้านบน
          if (!aVerified && bVerified) return 1;  // b อยู่ด้านบน
          
          // 2. ถ้าสถานะ verified เหมือนกัน ให้เรียงตามเงื่อนไขที่เลือก
          let aValue, bValue;
          
          switch (this.campaignSortBy) {
            case 'totalProgress':
              aValue = a.totalProgress || 0;
              bValue = b.totalProgress || 0;
              break;
            case 'completedCourses':
              aValue = a.completedCourses || 0;
              bValue = b.completedCourses || 0;
              break;
            case 'enrolledDate':
              aValue = a.enrolledDate ? new Date(a.enrolledDate) : new Date('1970-01-01');
              bValue = b.enrolledDate ? new Date(b.enrolledDate) : new Date('1970-01-01');
              break;
            case 'name':
              aValue = (a.name || '').toLowerCase();
              bValue = (b.name || '').toLowerCase();
              break;
            default:
              aValue = a.totalProgress || 0;
              bValue = b.totalProgress || 0;
          }
          
          if (this.campaignSortOrder === 'desc') {
            return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
        });
      } catch (sortError) {
        console.error('Error sorting participants:', sortError);
        sorted = validParticipants;
      }
      
      return sorted;
    },
    
    displayedParticipants() {
      const filtered = this.filteredParticipants;
      
      if (this.participantShowAll) {
        return filtered;
      }
      
      const perPage = parseInt(this.participantPerPage) || 20;
      const start = (this.currentPage - 1) * perPage;
      const end = start + perPage;
      
      return filtered.slice(start, end);
    },
    
    totalPages() {
      if (this.participantShowAll) return 1;
      const perPage = parseInt(this.participantPerPage) || 20;
      return Math.ceil(this.filteredParticipants.length / perPage);
    },
    
    paginationInfo() {
      const filtered = this.filteredParticipants;
      const displayed = this.displayedParticipants;
      const start = this.participantShowAll ? 1 : ((this.currentPage - 1) * parseInt(this.participantPerPage)) + 1;
      const end = this.participantShowAll ? filtered.length : Math.min(start + parseInt(this.participantPerPage) - 1, filtered.length);
      
      return {
        showing: displayed.length,
        total: filtered.length,
        start: Math.min(start, filtered.length),
        end: Math.min(end, filtered.length)
      };
    },
    
    sortedParticipants() {
      // Keep for backward compatibility - now just returns displayedParticipants
      return this.displayedParticipants;
    },

    courseCompletionStats() {
      if (!this.selectedPromotion || this.selectedPromotion._id !== '1') {
        return [];
      }
      
      const courseStats = [];
      const courseNames = [
        'องค์กรสุขภาวะในโครงการป้องกันโรค',
        'การสร้างแรงบันดาลใจในการป้องกันโรค NCDs และระบบสุขภาพ',
        'สุขภาพดี... เริ่มต้นจากอาหาร',
        'โภชนาการกับการจัดการ NCDs',
        'Workshop ฉลาดกิน ฉลาดเลือก ฉลาดอยู่ ห่างไกลโรค NCDs'
      ];
      
      courseNames.forEach((courseName, index) => {
        const courseId = index + 1;
        const completedCount = this.allCampaignParticipants.filter(p => 
          p.courseProgress.find(c => c.courseId === courseId && c.progress === 100)
        ).length;
        
        const totalProgress = this.allCampaignParticipants.reduce((sum, p) => {
          const course = p.courseProgress.find(c => c.courseId === courseId);
          return sum + (course ? course.progress : 0);
        }, 0);
        
        const averageProgress = this.allCampaignParticipants.length > 0 ? 
          totalProgress / this.allCampaignParticipants.length : 0;
        
        courseStats.push({
          courseId,
          courseName,
          completedCount,
          completionRate: this.allCampaignParticipants.length > 0 ? 
            ((completedCount / this.allCampaignParticipants.length) * 100).toFixed(1) : '0.0',
          averageProgress: averageProgress.toFixed(1)
        });
      });
      
      return courseStats;
    },
    
    // Campaign Pagination Info (แบบใหม่)
    campaignPaginationInfo() {
      if (!this.allCampaignParticipants.length) return 'ไม่มีข้อมูล';
      const total = this.allCampaignParticipants.length;
      const start = (this.campaignCurrentPage - 1) * this.campaignPerPage + 1;
      const end = Math.min(start + this.campaignPerPage - 1, total);
      return `แสดง ${start}-${end} จากทั้งหมด ${total} คน`;
    },
    
    campaignTotalPagesComputed() {
      return Math.ceil(this.allCampaignParticipants.length / this.campaignPerPage);
    },

    isDateRangeInvalid() {
      if (!this.newPromotion.startDate || !this.newPromotion.endDate) return false;
      return new Date(this.newPromotion.startDate) > new Date(this.newPromotion.endDate);
    },
    
    promotionsPaginationInfo() {
      if (this.promotionsPerPage === -1) {
        return `แสดง ${this.promotions.length} รายการจากทั้งหมด ${this.promotions.length} รายการ`;
      }
      const start = (this.currentPromotionPage - 1) * this.promotionsPerPage + 1;
      const end = Math.min(start + this.promotionsPerPage - 1, this.promotions.length);
      return `แสดง ${start}-${end} จากทั้งหมด ${this.promotions.length} รายการ`;
    }
  },

  watch: {
    // ตรวจสอบข้อมูล participants เมื่อมีการเปลี่ยนแปลง
    allCampaignParticipants: {
      handler(newValue) {
        if (newValue && Array.isArray(newValue)) {
          console.log('Participants data updated:', newValue.length, 'items');
          
          // ตรวจสอบข้อมูลที่อาจเสียหาย
          const invalidItems = newValue.filter(p => !p || !p.id || !p.name);
          if (invalidItems.length > 0) {
            console.warn('Found invalid participant items:', invalidItems.length);
          }
        }
      },
      deep: false,
      immediate: false
    },
    
    participantSearch() {
      // Reset to first page when search changes
      this.currentPage = 1;
    },
    
    participantPerPage() {
      // Reset to first page when items per page changes
      this.currentPage = 1;
      this.participantShowAll = false;
    }
  },

  methods: {
    // Method to open student detail in new tab
    openStudentDetail(userId) {
      if (typeof window !== 'undefined' && window.open) {
        const url = `/student/detail/${userId}`;
        window.open(url, '_blank');
      } else {
        // Fallback to router navigation if window.open is not available
        this.$router.push(`/student/detail/${userId}`);
      }
    },

    async getPromotionData() {
      try {
        this.loading = true;
        console.log('getPromotionData: Starting...');
        console.log('Session:', this.session?.current?._id);
        console.log('Hostkey:', this.hostkey);
        
        // เรียก API เพื่อดึงข้อมูลโปรโมชั่น
        try {
          console.log('กำลังเรียก API ดึงข้อมูลโปรโมชั่น...');
          console.log('$Request available:', !!this.$Request);
          
          if (!this.$Request) {
            throw new Error('$Request is not available');
          }
          
          const { data, status } = await this.$Request.GET(
            `promotion/${this.session.current._id}`,
            this.hostkey
          );
          
          console.log('Promotion API Response:', { data, status });
          
          if (status === 200 && data) {
            this.promotions = Array.isArray(data) ? data : [data];
            console.log('โหลดข้อมูลโปรโมชั่นจาก API สำเร็จ:', this.promotions.length, 'รายการ');
          } else {
            console.warn('API response ไม่ถูกต้อง ใช้ sample data');
            this.promotions = this.samplePromotions; // Fallback to sample data
          }
        } catch (apiError) {
          console.warn('API not available, using sample data:', apiError);
          this.promotions = this.samplePromotions;
        }
        
        // ถ้าเป็น FTI Academy Campaign (ID = '1') ให้ดึงข้อมูลผู้เข้าร่วม
        console.log('ตรวจสอบ FTI Academy Campaign...');
        if (this.promotions.some(p => p._id === '1')) {
          console.log('พบ FTI Academy Campaign ในรายการโปรโมชั่น');
          // ดึงข้อมูลแคมเปญทั้งหมด (widget จะใช้ข้อมูลจาก computed property)
          await this.getFTIAcademyCampaignData();
        } else {
          console.log('ไม่พบ FTI Academy Campaign');
        }
        
      } catch (error) {
        console.error('Error fetching promotion data:', error);
        this.promotions = this.samplePromotions; // Fallback to sample data
      } finally {
        this.loading = false;
        console.log('getPromotionData: Completed');
      }
    },

    refreshData() {
      this.getPromotionData();
    },



    async getFTIAcademyCampaignData() {
      try {
        this.campaignLoading = true;
        console.log('เริ่มดึงข้อมูลแคมเปญ FTI Academy ทั้งหมด...');
        
        // หลักสูตรทั้ง 5 หลักสูตรของแคมเปญ FTI Academy
        const campaignCourseIds = [
          '67ebb7a72740d3df3f37dc69',
          '6899b93319dfbc0079a10894',
          '6899bf5194605e1513c55e74',
          '6899c3e2fe396063e3cf648b',
          '6899c9b419dfbc0079a108a4'
        ];

        console.log('กำลังดึงข้อมูลผู้ลงทะเบียนทั้งหมดจาก 5 หลักสูตร...');
        console.log('Course IDs ที่จะใช้ในการค้นหา:', campaignCourseIds);

        // ดึงข้อมูล enroll ทั้งหมด (ไม่ใช้ pagination)
        const { data, status } = await this.$Request.POST(
          'enroll/aggregate',
          {
            pipeline: [
              {
                $match: {
                  courseID: { $in: campaignCourseIds }
                }
              },
              {
                $addFields: {
                  userObjectId: {
                    $cond: {
                      if: { $type: "$userID" },
                      then: { $toObjectId: "$userID" },
                      else: "$userID"
                    }
                  }
                }
              },
              {
                $lookup: {
                  from: "user",
                  localField: "userObjectId",
                  foreignField: "_id",
                  as: "userInfo"
                }
              },
              {
                $addFields: {
                  userInfo: { $arrayElemAt: ["$userInfo", 0] }
                }
              },
              {
                $group: {
                  _id: "$userID",
                  userInfo: { $first: "$userInfo" },
                  enrollments: {
                    $push: {
                      courseID: "$courseID",
                      progress: { $ifNull: ["$analytics.percent", 0] },
                      status: { $ifNull: ["$analytics.status", "enrolled"] },
                      completedAt: "$completeDateAt",
                      enrolledAt: "$createdAt",
                      updatedAt: { $ifNull: ["$updatedAt", "$createdAt"] },
                      enrollId: "$_id",
                      promotion: { $ifNull: ["$promotion", null] }
                    }
                  }
                }
              }
            ]
          },
          this.configs.key
        );

        console.log('ผลลัพธ์จาก API:', { status, dataLength: data?.length });
        console.log('ข้อมูลตัวอย่าง 3 รายการแรก:', data?.slice(0, 3));

        if (status === 200 && Array.isArray(data) && data.length > 0) {
          console.log(`พบผู้เข้าร่วมทั้งหมด: ${data.length} คน`);
          
          // ประมวลผลข้อมูลผู้เข้าร่วมทั้งหมด
          this.allCampaignParticipants = await this.processAllParticipantsData(data, campaignCourseIds);
          
          // อัปเดต pagination info
          this.campaignTotalRecords = this.allCampaignParticipants.length;
          this.campaignTotalPages = Math.ceil(this.campaignTotalRecords / this.campaignPerPage);
          
          // รีเซ็ตไปหน้าแรก
          this.campaignCurrentPage = 1;
          
          console.log(`ประมวลผลข้อมูลเสร็จ: ${this.allCampaignParticipants.length} คน`);
        } else {
          console.warn('ไม่สามารถดึงข้อมูลแคมเปญได้');
          this.allCampaignParticipants = [];
          this.campaignParticipants = [];
          this.campaignTotalRecords = 0;
          this.campaignTotalPages = 0;
        }
      } catch (error) {
        console.error('Error fetching FTI Academy campaign data:', error);
        this.allCampaignParticipants = [];
        this.campaignParticipants = [];
        this.campaignTotalRecords = 0;
        this.campaignTotalPages = 0;
      } finally {
        this.campaignLoading = false;
      }
    },

    async processAllParticipantsData(participants, campaignCourseIds) {
      console.log('เริ่มประมวลผลข้อมูลผู้เข้าร่วมทั้งหมด...');
      
      const processedParticipants = [];
      let participantIndex = 1;
      
      for (const participant of participants) {
        const enrollments = participant.enrollments || [];
        const userInfo = participant.userInfo || {};
        
        // สร้าง courseProgress สำหรับทุกหลักสูตร (5 หลักสูตร)
        const courseProgress = campaignCourseIds.map((courseId, courseIndex) => {
          const enrollment = enrollments.find(e => e.courseID === courseId);
          const progress = enrollment ? parseFloat(enrollment.progress) || 0 : 0;
          
          return {
            courseId: courseIndex + 1,
            actualCourseId: courseId,
            progress: progress,
            status: enrollment ? enrollment.status : 'not_enrolled',
            completedAt: enrollment ? enrollment.completedAt : null,
            enrolledAt: enrollment ? enrollment.enrolledAt : null,
            courseName: this.getCourseNameById(courseIndex + 1),
            isEnrolled: !!enrollment
          };
        });
        
        // คำนวณสถิติ
        const enrolledCoursesCount = enrollments.length;
        const completedCoursesCount = courseProgress.filter(c => c.progress === 100).length;
        const totalProgress = courseProgress.reduce((sum, c) => sum + c.progress, 0) / campaignCourseIds.length;
        
        // กำหนดสถานะ
        let status;
        if (completedCoursesCount === 5) {
          status = 'completed';
        } else if (completedCoursesCount >= 3 || totalProgress >= 80) {
          status = 'near_completion';
        } else if (enrolledCoursesCount >= 2 || totalProgress >= 20) {
          status = 'in_progress';
        } else {
          status = 'just_started';
        }
        
        // ใช้ข้อมูลจริงจาก user collection
        const displayName = userInfo.firstname && userInfo.lastname ? 
          `${userInfo.firstname} ${userInfo.lastname}` : 
          (userInfo.username || `ผู้เข้าร่วม ${participantIndex}`);
        
        // ตรวจสอบสถานะการตรวจสอบจากข้อมูล enrollment
        const hasVerificationMarker = enrollments.some(e => e.promotion && e.promotion.verified);
        const verificationMarker = enrollments.find(e => e.promotion && e.promotion.verified)?.promotion || null;
        
        processedParticipants.push({
          id: `P${String(participantIndex).padStart(3, '0')}`,
          name: displayName,
          email: userInfo.email || '',
          phone: userInfo.phone || userInfo.tel || '',
          totalProgress: Math.round(totalProgress),
          completedCourses: completedCoursesCount,
          enrolledCourses: enrolledCoursesCount,
          status: status,
          rewardClaimed: completedCoursesCount === 5 ? false : false,
          enrolledDate: enrollments.length > 0 ? 
            new Date(Math.min(...enrollments.map(e => new Date(e.enrolledAt)))).toISOString().split('T')[0] : null,
          completedDate: completedCoursesCount === 5 ? 
            new Date(Math.max(...enrollments.filter(e => e.completedAt).map(e => new Date(e.completedAt)))).toISOString().split('T')[0] : null,
          lastUpdated: enrollments.length > 0 ? 
            new Date(Math.max(...enrollments.map(e => new Date(e.updatedAt || e.enrolledAt)))).toISOString().split('T')[0] : null,
          courseProgress: courseProgress,
          enrollments: enrollments, // เก็บข้อมูล enrollments ไว้ใช้งาน
          userInfo: userInfo, // เก็บข้อมูล user ไว้ใช้งาน
          isVerified: hasVerificationMarker, // สถานะการตรวจสอบจากข้อมูลจริง
          verificationMarker: verificationMarker, // ข้อมูล marker การตรวจสอบ
          lastVerified: verificationMarker ? verificationMarker.verifiedAt : null // วันที่ตรวจสอบล่าสุด
        });
        
        participantIndex++;
      }
      
      return processedParticipants;
    },

    // New pagination methods
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    getVisiblePages() {
      const total = this.totalPages;
      const current = this.currentPage;
      const pages = [];
      
      if (total <= 7) {
        // Show all pages if total is 7 or less
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Show first page, last page, and pages around current
        if (current <= 4) {
          // Show 1, 2, 3, 4, 5, ..., last
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          // Show 1, ..., last-4, last-3, last-2, last-1, last
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) {
            pages.push(i);
          }
        } else {
          // Show 1, ..., current-1, current, current+1, ..., last
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total);
        }
      }
      
      return pages.filter(page => page !== '...' || pages.indexOf(page) === pages.lastIndexOf(page));
    },
    
    // Update items per page and reset to first page
    updateItemsPerPage() {
      this.currentPage = 1;
    },
    
    // Toggle show all functionality
    toggleShowAll() {
      this.participantShowAll = !this.participantShowAll;
      if (!this.participantShowAll) {
        this.currentPage = 1; // Reset to first page when going back to pagination
      }
    },
    
    // Calculate the actual row number for display
    getRowNumber(index) {
      if (this.participantShowAll) {
        return index + 1;
      }
      
      const perPage = parseInt(this.participantPerPage) || 20;
      return ((this.currentPage - 1) * perPage) + index + 1;
    },
    
    // Toggle row expansion
    toggleRowExpansion(participantId) {
      const index = this.expandedRows.indexOf(participantId);
      if (index > -1) {
        this.expandedRows.splice(index, 1);
      } else {
        this.expandedRows.push(participantId);
      }
    },
    
    // Check if row is expanded
    isRowExpanded(participantId) {
      return this.expandedRows.includes(participantId);
    },
    
    // Get estimated completion date for completed courses
    getEstimatedCompletionDate(participant, course) {
      // If we have specific completion date, use it
      if (course.completedDate) {
        return this.formatDateTime(course.completedDate);
      }
      
      // If we have last access date and it's completed, assume completed on last access
      if (course.lastAccessDate && course.progress === 100) {
        return this.formatDateTime(course.lastAccessDate);
      }
      
      // If we have participant's last login and course is completed
      if (participant.lastLoginDate && course.progress === 100) {
        return this.formatDateTime(participant.lastLoginDate);
      }
      
      // Default fallback - estimate based on enrollment date + some days
      if (participant.enrolledDate) {
        const enrollDate = new Date(participant.enrolledDate);
        const estimatedDays = (course.courseId || 1) * 7; // Assume 1 week per course sequence
        const completionDate = new Date(enrollDate.getTime() + (estimatedDays * 24 * 60 * 60 * 1000));
        return this.formatDateTime(completionDate.toISOString());
      }
      
      return 'ไม่ทราบ';
    },
    
    // Refresh campaign data
    async refreshCampaignData() {
      if (this.campaignLoading) return;
      
      try {
        // Clear existing data
        this.allCampaignParticipants = [];
        this.expandedRows = []; // Close all expanded rows
        this.currentPage = 1; // Reset to first page
        this.participantSearch = ''; // Clear search
        
        // Show loading state
        this.campaignLoading = true;
        
        // Fetch fresh data
        await this.getFTIAcademyCampaignData();
        
        console.log('Campaign data refreshed successfully');
        
      } catch (error) {
        console.error('Error refreshing campaign data:', error);
        // You could add a simple alert if needed: alert('เกิดข้อผิดพลาดในการดึงข้อมูลใหม่');
      } finally {
        this.campaignLoading = false;
      }
    },
    
    // Sorting methods
    changeCampaignSort(sortBy) {
      if (this.campaignSortBy === sortBy) {
        // เปลี่ยนทิศทาง sort
        this.campaignSortOrder = this.campaignSortOrder === 'desc' ? 'asc' : 'desc';
      } else {
        // เปลี่ยน field และ reset เป็น desc
        this.campaignSortBy = sortBy;
        this.campaignSortOrder = 'desc';
      }
      // รีเซ็ตไปหน้าแรก
      this.campaignCurrentPage = 1;
    },

    getVisibleCampaignPages() {
      const current = this.campaignCurrentPage;
      const total = this.campaignTotalPagesComputed;
      const delta = 2;
      
      let pages = [];
      for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
        pages.push(i);
      }
      return pages;
    },

    getCampaignPaginationInfo() {
      return this.campaignPaginationInfo;
    },

    groupEnrollmentsByUser(enrollmentData, campaignCourseIds) {
      console.log('เริ่มจัดกลุ่มข้อมูลตาม user...');
      
      // สร้าง Map เพื่อจัดกลุ่มข้อมูลตาม userID
      const userEnrollmentMap = new Map();
      
      enrollmentData.forEach(enrollment => {
        const userId = enrollment.userID._id || enrollment.userID;
        const userInfo = enrollment.userID;
        
        if (!userEnrollmentMap.has(userId)) {
          userEnrollmentMap.set(userId, {
            userInfo: userInfo,
            enrollments: []
          });
        }
        
        userEnrollmentMap.get(userId).enrollments.push({
          courseId: enrollment.courseID,
          progress: parseFloat(enrollment.analytics?.percent) || 0,
          status: enrollment.analytics?.status || 'enrolled',
          completedAt: enrollment.completeDateAt,
          enrolledAt: enrollment.createdAt,
          enrollId: enrollment._id
        });
      });
      
      console.log(`จัดกลุ่มได้ ${userEnrollmentMap.size} คน`);
      
      // แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
      const participants = [];
      let participantIndex = 1;
      
      userEnrollmentMap.forEach((userData) => {
        const { userInfo, enrollments } = userData;
        
        // สร้าง courseProgress สำหรับทุกหลักสูตร (5 หลักสูตร)
        const courseProgress = campaignCourseIds.map((courseId, courseIndex) => {
          const enrollment = enrollments.find(e => e.courseId === courseId);
          return {
            courseId: courseIndex + 1,
            actualCourseId: courseId,
            progress: enrollment ? enrollment.progress : 0,
            status: enrollment ? enrollment.status : 'not_enrolled',
            completedAt: enrollment ? enrollment.completedAt : null,
            enrolledAt: enrollment ? enrollment.enrolledAt : null,
            courseName: this.getCourseNameById(courseIndex + 1),
            isEnrolled: !!enrollment
          };
        });
        
        // คำนวณสถิติ
        const enrolledCoursesCount = enrollments.length;
        const completedCoursesCount = courseProgress.filter(c => c.progress === 100).length;
        const totalProgress = courseProgress.reduce((sum, c) => sum + c.progress, 0) / campaignCourseIds.length;
        
        // กำหนดสถานะ
        let status;
        if (completedCoursesCount === 5) {
          status = 'completed';
        } else if (completedCoursesCount >= 3 || totalProgress >= 80) {
          status = 'near_completion';
        } else if (enrolledCoursesCount >= 2 || totalProgress >= 20) {
          status = 'in_progress';
        } else {
          status = 'just_started';
        }
        
        // วันที่ลงทะเบียนแรกสุดและล่าสุด
        const enrollDates = enrollments.map(e => new Date(e.enrolledAt));
        const firstEnrollDate = enrollDates.length > 0 ? new Date(Math.min(...enrollDates)) : null;
        const completeDates = enrollments.filter(e => e.completedAt).map(e => new Date(e.completedAt));
        const lastCompleteDate = completeDates.length > 0 ? new Date(Math.max(...completeDates)) : null;
        
        participants.push({
          id: `P${String(participantIndex).padStart(3, '0')}`,
          name: `${userInfo.firstname || ''} ${userInfo.lastname || ''}`.trim() || 'ไม่ระบุชื่อ',
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          totalProgress: Math.round(totalProgress),
          completedCourses: completedCoursesCount,
          enrolledCourses: enrolledCoursesCount,
          status: status,
          rewardClaimed: completedCoursesCount === 5 ? false : false,
          enrolledDate: firstEnrollDate ? firstEnrollDate.toISOString().split('T')[0] : null,
          completedDate: lastCompleteDate ? lastCompleteDate.toISOString().split('T')[0] : null,
          courseProgress: courseProgress
        });
        
        participantIndex++;
      });
      
      // เรียงลำดับตามจำนวนหลักสูตรที่ลงทะเบียน แล้วตามจำนวนที่เรียนจบ
      participants.sort((a, b) => {
        if (a.enrolledCourses !== b.enrolledCourses) {
          return b.enrolledCourses - a.enrolledCourses;
        }
        return b.completedCourses - a.completedCourses;
      });
      
      // แสดงสถิติสรุป
      const stats = {
        totalParticipants: participants.length,
        enrolledAll5: participants.filter(p => p.enrolledCourses === 5).length,
        enrolled4: participants.filter(p => p.enrolledCourses === 4).length,
        enrolled3: participants.filter(p => p.enrolledCourses === 3).length,
        enrolled2: participants.filter(p => p.enrolledCourses === 2).length,
        enrolled1: participants.filter(p => p.enrolledCourses === 1).length,
        completedAll5: participants.filter(p => p.completedCourses === 5).length
      };
      
      console.log('สถิติการลงทะเบียน:', stats);
      
      return participants;
    },
    
    getCourseNameById(courseId) {
      const courseNames = {
        1: 'องค์กรสุขภาวะในโครงการป้องกันโรค',
        2: 'การสร้างแรงบันดาลใจในการป้องกันโรค NCDs และระบบสุขภาพ',
        3: 'สุขภาพดี... เริ่มต้นจากอาหาร',
        4: 'โภชนาการกับการจัดการ NCDs',
        5: 'Workshop ฉลาดกิน ฉลาดเลือก ฉลาดอยู่ ห่างไกลโรค NCDs'
      };
      return courseNames[courseId] || `หลักสูตรที่ ${courseId}`;
    },

    // Campaign Analytics Methods
    getParticipantsForCourse(courseId) {
      return this.allCampaignParticipants.sort((a, b) => {
        // Sort by course progress for this specific course (completed first)
        const aProgress = a.courseProgress.find(c => c.courseId === courseId)?.progress || 0;
        const bProgress = b.courseProgress.find(c => c.courseId === courseId)?.progress || 0;
        
        // First sort by completion status (completed first)
        if (aProgress === 100 && bProgress !== 100) return -1;
        if (aProgress !== 100 && bProgress === 100) return 1;
        
        // Then by progress percentage
        return bProgress - aProgress;
      });
    },

    // View Management
    async viewPromotionDetails(promotion) {
      console.log('viewPromotionDetails called with:', promotion);
      console.log('promotion._id:', promotion._id, 'type:', typeof promotion._id);
      console.log('comparing with string "1":', promotion._id === '1');
      console.log('comparing with number 1:', promotion._id === 1);
      
      this.selectedPromotion = promotion;
      this.currentView = 'dashboard';
      
      // ถ้าเป็น FTI Academy Campaign ให้ดึงข้อมูลผู้เข้าร่วม
      if (promotion._id === '1' || promotion._id === 1) {
        console.log('นี่คือ FTI Academy Campaign - เริ่มโหลดข้อมูล...');
        // ดึงข้อมูลแคมเปญทั้งหมด (widget จะใช้ข้อมูลจาก computed property)
        await this.getFTIAcademyCampaignData();
      } else {
        console.log('ไม่ใช่ FTI Academy Campaign - ไม่ต้องโหลดข้อมูลเพิ่มเติม');
        console.log('promotion._id ที่ได้รับ:', promotion._id);
      }
    },

    backToCards() {
      this.currentView = 'cards';
      this.selectedPromotion = null;
      // Reset form if coming from add view
      if (this.currentView === 'add') {
        this.resetForm();
      }
    },

    // Promotion Actions
    copyPromotionCode(code) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
          // Show success message (you can integrate with your notification system)
          console.log('คัดลอกรหัสโปรโมชั่นแล้ว:', code);
        });
      }
    },

    editPromotion(promotion) {
      console.log('แก้ไขโปรโมชั่น:', promotion.name);
      // TODO: Implement edit functionality
      // You can open an edit modal or navigate to edit page
      // For now, just copy data to the form
      this.newPromotion = {
        name: promotion.name,
        code: promotion.code,
        description: promotion.description || '',
        discountType: promotion.discountType,
        discount: promotion.discount,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        usageLimit: promotion.usageLimit,
        type: promotion.type || 'general',
        status: promotion.status
      };
      this.hasUsageLimit = !!promotion.usageLimit;
      this.currentView = 'add';
    },

    async updatePromotion(promotionId) {
      if (!this.isFormValid) return;

      try {
        this.loading = true;

        const updateData = {
          ...this.newPromotion,
          usageLimit: this.hasUsageLimit ? this.newPromotion.usageLimit : null,
          lastUpdated: new Date().toISOString()
        };

        const { data, status } = await this.$Request.PUT(
          `promotion/${promotionId}`,
          { data: updateData },
          this.hostkey
        );

        if (status === 200 && data) {
          // Update local data
          const index = this.promotions.findIndex(p => p._id === promotionId);
          if (index !== -1) {
            this.promotions[index] = { ...this.promotions[index], ...data };
          }
          alert('อัปเดตโปรโมชั่นเรียบร้อยแล้ว');
          this.backToCards();
        } else {
          throw new Error('Failed to update promotion');
        }

      } catch (error) {
        console.error('Error updating promotion:', error);
        alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
      } finally {
        this.loading = false;
      }
    },

    async togglePromotionStatus(promotion) {
      const newStatus = promotion.status === 'active' ? 'inactive' : 'active';
      
      try {
        const { status } = await this.$Request.PUT(
          `promotion/${promotion._id}`,
          { data: { status: newStatus, lastUpdated: new Date().toISOString() } },
          this.hostkey
        );

        if (status === 200) {
          promotion.status = newStatus;
          console.log(`เปลี่ยนสถานะโปรโมชั่น ${promotion.name} เป็น ${newStatus}`);
        } else {
          throw new Error('Failed to update status');
        }
      } catch (error) {
        console.error('Error updating promotion status:', error);
        alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
      }
    },

    async deletePromotion(promotion) {
      if (confirm(`คุณต้องการลบโปรโมชั่น "${promotion.name}" หรือไม่?`)) {
        try {
          const { status } = await this.$Request.DELETE(
            `promotion/${promotion._id}`,
            this.hostkey
          );

          if (status === 200) {
            const index = this.promotions.indexOf(promotion);
            if (index > -1) {
              this.promotions.splice(index, 1);
            }
            console.log('ลบโปรโมชั่นเรียบร้อยแล้ว:', promotion.name);
          } else {
            throw new Error('Failed to delete promotion');
          }
        } catch (error) {
          console.error('Error deleting promotion:', error);
          alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
      }
    },

    // Helper Methods
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Bangkok'
      };
      return date.toLocaleDateString('th-TH', options);
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '-';
      const date = new Date(dateStr);
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Bangkok'
      };
      return date.toLocaleDateString('th-TH', options);
    },

    formatDiscount(discount, discountType) {
      if (!discount) return '-';
      if (discountType === 'percentage') {
        return `${discount}%`;
      } else if (discountType === 'fixed') {
        return `${discount.toLocaleString()} บาท`;
      }
      return discount.toString();
    },

    getPromotionTypeLabel(type) {
      const labels = {
        percentage: 'เปอร์เซ็นต์',
        fixed: 'จำนวนคงที่',
        free: 'ฟรี',
        buy_get: 'ซื้อแถม'
      };
      return labels[type] || type;
    },

    getPromotionTypeColor(type) {
      const colors = {
        percentage: 'bg-blue-100 text-blue-800',
        fixed: 'bg-green-100 text-green-800',
        free: 'bg-purple-100 text-purple-800',
        buy_get: 'bg-orange-100 text-orange-800'
      };
      return colors[type] || 'bg-gray-100 text-gray-800';
    },

    isPromotionActive(promotion) {
      const now = new Date();
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);
      
      return promotion.status === 'active' && 
             now >= startDate && 
             now <= endDate &&
             (!promotion.usageLimit || (promotion.usageCount || 0) < promotion.usageLimit);
    },

    isPromotionExpired(promotion) {
      const now = new Date();
      const endDate = new Date(promotion.endDate);
      
      return now > endDate || 
             promotion.status === 'expired' ||
             (promotion.usageLimit && (promotion.usageCount || 0) >= promotion.usageLimit);
    },

    getPromotionStatusLabel(promotion) {
      if (this.isPromotionExpired(promotion)) {
        return 'หมดอายุ';
      } else if (this.isPromotionActive(promotion)) {
        return 'เปิดใช้งาน';
      } else if (promotion.status === 'inactive') {
        return 'ปิดใช้งาน';
      }
      return 'ไม่ทราบสถานะ';
    },

    getPromotionStatusColor(promotion) {
      if (this.isPromotionExpired(promotion)) {
        return 'bg-red-100 text-red-800';
      } else if (this.isPromotionActive(promotion)) {
        return 'bg-green-100 text-green-800';
      } else if (promotion.status === 'inactive') {
        return 'bg-yellow-100 text-yellow-800';
      }
      return 'bg-gray-100 text-gray-800';
    },

    // Dashboard specific methods
    getUsagePercentage(promotion) {
      if (!promotion.usageLimit) return 0;
      return Math.min((promotion.usageCount / promotion.usageLimit) * 100, 100);
    },

    getUsageRate(promotion) {
      if (!promotion.usageLimit) return 100;
      return Math.min((promotion.usageCount / promotion.usageLimit) * 100, 100).toFixed(1);
    },

    calculateSavings(promotion) {
      // Calculation based on real API data
      if (promotion?.totalSavings) {
        return `${promotion.totalSavings.toLocaleString()} บาท`;
      }
      const estimated = (promotion?.usageCount || 0) * (promotion?.discount || 0) * 5; // Rough estimate
      return `${estimated.toLocaleString()} บาท`;
    },

    getDaysRemaining(promotion) {
      if (!promotion?.endDate) return '-';
      const now = new Date();
      const endDate = new Date(promotion.endDate);
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'หมดอายุ';
      if (diffDays === 0) return 'วันสุดท้าย';
      return `${diffDays} วัน`;
    },

    // Pagination methods (เก็บไว้ใช้ในอนาคต)
    changePromotionPageSize(newSize) {
      this.promotionsPerPage = newSize;
      this.currentPromotionPage = 1;
    },

    goToPromotionPage(page) {
      if (page >= 1 && page <= this.totalPromotionPages) {
        this.currentPromotionPage = page;
      }
    },

    previousPromotionPage() {
      if (this.currentPromotionPage > 1) {
        this.currentPromotionPage--;
      }
    },

    nextPromotionPage() {
      if (this.currentPromotionPage < this.totalPromotionPages) {
        this.currentPromotionPage++;
      }
    },

    // Add Promotion Methods (แทน Modal Methods)
    resetForm() {
      this.newPromotion = {
        name: '',
        code: '',
        description: '',
        discountType: 'percentage',
        discount: null,
        startDate: '',
        endDate: '',
        usageLimit: null,
        type: 'general',
        status: 'active'
      };
      this.hasUsageLimit = false;
      this.setDefaultDates();
    },

    async savePromotion() {
      if (!this.isFormValid) return;

      // Check if code already exists
      if (this.checkCodeExists(this.newPromotion.code)) {
        alert('รหัสโปรโมชั่นนี้มีอยู่แล้ว กรุณาใช้รหัสอื่น');
        return;
      }

      try {
        this.loading = true;

        // Create new promotion object
        const promotionData = {
          ...this.newPromotion,
          usageCount: 0,
          totalSavings: 0,
          usageLimit: this.hasUsageLimit ? this.newPromotion.usageLimit : null,
          parent: this.session.current._id,
          createdBy: this.session.current._id
        };

        // เรียกใช้ API เพื่อสร้างโปรโมชั่นใหม่
        const { data, status } = await this.$Request.POST(
          'promotion/',
          { data: promotionData },
          this.hostkey
        );

        if (status === 201 && data) {
          // เพิ่มข้อมูลใหม่เข้าไปใน array
          this.promotions.unshift(data);
          alert('เพิ่มโปรโมชั่นเรียบร้อยแล้ว');
          this.backToCards();
        } else {
          throw new Error('Failed to create promotion');
        }

      } catch (error) {
        console.error('Error saving promotion:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      } finally {
        this.loading = false;
      }
    },

    checkCodeExists(code) {
      return this.promotions.some(p => p.code.toLowerCase() === code.toLowerCase());
    },

    setDefaultDates() {
      // Set default start date to today
      const today = new Date();
      this.newPromotion.startDate = today.toISOString().split('T')[0];
      
      // Set default end date to 30 days from now
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      this.newPromotion.endDate = endDate.toISOString().split('T')[0];
    },

    getVisiblePromotionPages() {
      const current = this.currentPromotionPage;
      const total = this.totalPromotionPages;
      const delta = 2;
      
      let pages = [];
      for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
        pages.push(i);
      }
      return pages;
    },

    // FTI Academy Campaign specific methods
    async updateRewardClaimStatus(participantId, claimed) {
      try {
        const participant = this.campaignParticipants.find(p => p.id === participantId);
        if (!participant) return;

        // TODO: API call to update reward claim status
        // For now, just update local data
        participant.rewardClaimed = claimed;
        
        console.log(`${claimed ? 'เคลมรางวัล' : 'ยกเลิกการเคลมรางวัล'} สำหรับ ${participant.name}`);
        
      } catch (error) {
        console.error('Error updating reward claim status:', error);
      }
    },

    // ฟังก์ชันจัดการการเปลี่ยนแปลง checkbox อย่างง่าย - เรียก API แล้วรีเฟรชข้อมูล
    async handleVerificationChange(participant, event) {
      if (!participant || !participant.id || !event || !event.target) {
        console.error('Invalid participant or event data');
        return;
      }
      
      const isChecked = event.target.checked;
      console.log('Verification change:', participant.name, 'checked:', isChecked);
      
      try {
        // เรียก API อัปเดต
        await this.updateVerificationStatus(participant.id, isChecked);
        
        // รีเฟรชข้อมูลทั้งหมดใหม่
        console.log('Refreshing campaign data after verification update...');
        await this.getFTIAcademyCampaignData();
        
      } catch (error) {
        console.error('Error in verification update:', error);
        // รีเซ็ต checkbox ถ้าเกิดข้อผิดพลาด
        if (event.target) {
          event.target.checked = !isChecked;
        }
        alert('เกิดข้อผิดพลาดในการอัปเดต กรุณาลองใหม่');
      }
    },

    async updateVerificationStatus(participantId, isVerified) {
      if (!participantId) {
        throw new Error('participantId is required');
      }

      console.log('Updating verification status:', { participantId, isVerified });
      
      // หาผู้เข้าร่วมในข้อมูลปัจจุบัน
      const participant = this.allCampaignParticipants.find(p => p && p.id === participantId);
      if (!participant || !participant.userInfo || !participant.userInfo._id) {
        throw new Error('ไม่พบข้อมูลผู้เข้าร่วมหรือข้อมูลผู้ใช้');
      }

      const promotionCode = this.samplePromotions[0]?.code || 'FTIACADEMY100';
      const currentTime = new Date().toISOString();
      
      // สร้างข้อมูล marker สำหรับการตรวจสอบ
      const verificationMarker = {
        code: promotionCode,
        createdAt: currentTime,
        updatedAt: currentTime,
        verified: isVerified,
        verifiedBy: this.session?.current?._id || 'system',
        verifiedAt: currentTime
      };

      // อัปเดตทุก enrollment ของผู้ใช้คนนี้
      const updatePromises = participant.courseProgress
        .filter(course => course.isEnrolled)
        .map(async (course) => {
          const enrollment = participant.enrollments?.find(e => e.courseID === course.actualCourseId);
          const enrollId = enrollment?.enrollId;
          
          if (!enrollId) {
            console.warn(`ไม่พบ enrollId สำหรับ course ${course.actualCourseId}`);
            return { success: false, courseId: course.actualCourseId, error: 'No enrollId found' };
          }
          
          try {
            const requestBody = { 
              data: { 
                promotion: verificationMarker,
                lastUpdated: currentTime
              } 
            };
            
            const { status } = await this.$Request.PUT(
              `enroll/${enrollId}`,
              requestBody,
              this.configs.key
            );

            if (status === 200) {
              return { success: true, courseId: course.actualCourseId, enrollId };
            } else {
              throw new Error(`API returned status ${status}`);
            }
          } catch (enrollError) {
            console.error(`ข้อผิดพลาดในการอัปเดต enrollment ${course.actualCourseId}:`, enrollError);
            return { success: false, courseId: course.actualCourseId, error: enrollError };
          }
        });

      // รอให้ทุก enrollment update เสร็จ
      const results = await Promise.all(updatePromises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      console.log(`ผลลัพธ์การอัปเดต: สำเร็จ ${successCount}, ล้มเหลว ${failCount}`);

      if (successCount === 0) {
        throw new Error('ไม่สามารถอัปเดต enrollment ได้เลย');
      }

      // แสดงข้อความสำเร็จ
      const message = isVerified ? 
        `✅ ตรวจสอบข้อมูลของ ${participant.name} เรียบร้อยแล้ว (${successCount}/${results.length} หลักสูตร)` :
        `❌ ยกเลิกการตรวจสอบข้อมูลของ ${participant.name} (${successCount}/${results.length} หลักสูตร)`;
      
      console.log(message);
      
      return { success: true, successCount, failCount };
    },

    getParticipantStatusColor(status) {
      const colors = {
        completed: 'bg-green-100 text-green-800',
        near_completion: 'bg-yellow-100 text-yellow-800', 
        in_progress: 'bg-blue-100 text-blue-800',
        just_started: 'bg-gray-100 text-gray-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    },

    getParticipantStatusLabel(status) {
      const labels = {
        completed: 'เรียนจบแล้ว',
        near_completion: 'ใกล้จบ',
        in_progress: 'กำลังเรียน', 
        just_started: 'เริ่มใหม่'
      };
      return labels[status] || 'ไม่ทราบสถานะ';
    },

    async exportCampaignData() {
      if (!this.allCampaignParticipants.length) {
        alert('ไม่มีข้อมูลผู้เข้าร่วมแคมเปญ');
        return;
      }

      try {
        // สร้าง CSV headers
        const headers = [
          'ลำดับ',
          'ชื่อ-นามสกุล',
          'อีเมล',
          'เบอร์โทรศัพท์',
          'วันที่ลงทะเบียน',
          'ความคืบหน้ารวม (%)',
          'หลักสูตรที่เรียนจบ',
          'หลักสูตรที่ลงทะเบียน',
          'สถานะ',
          'วันที่เรียนจบ',
          'สถานะรางวัล',
          'สถานะการตรวจสอบ',
          'วันเวลาตรวจสอบ',
          'หลักสูตรที่ 1 (%)',
          'หลักสูตรที่ 2 (%)',
          'หลักสูตรที่ 3 (%)', 
          'หลักสูตรที่ 4 (%)',
          'หลักสูตรที่ 5 (%)'
        ];

        // สร้าง CSV data
        const csvData = this.allCampaignParticipants.map((participant, index) => {
          return [
            index + 1,
            `"${participant.name}"`,
            `"${participant.email}"`,
            `"${participant.phone}"`,
            `"${participant.enrolledDate || '-'}"`,
            participant.totalProgress,
            participant.completedCourses,
            participant.enrolledCourses,
            `"${this.getParticipantStatusLabel(participant.status)}"`,
            `"${participant.completedDate || '-'}"`,
            `"${participant.rewardClaimed ? 'เคลมแล้ว' : 'ยังไม่เคลม'}"`,
            `"${participant.isVerified ? 'ตรวจสอบแล้ว' : 'ยังไม่ตรวจสอบ'}"`,
            `"${participant.lastVerified ? this.formatDateTime(participant.lastVerified) : '-'}"`,
            participant.courseProgress[0]?.progress || 0,
            participant.courseProgress[1]?.progress || 0,
            participant.courseProgress[2]?.progress || 0,
            participant.courseProgress[3]?.progress || 0,
            participant.courseProgress[4]?.progress || 0
          ];
        });

        // รวม headers และ data
        const allData = [headers, ...csvData];

        // สร้าง CSV string
        const csvContent = allData.map(row => row.join(',')).join('\n');

        // เพิ่ม BOM สำหรับ UTF-8
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;

        // สร้างไฟล์และดาวน์โหลด
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const now = new Date();
        const dateString = now.getFullYear() + 
          String(now.getMonth() + 1).padStart(2, '0') + 
          String(now.getDate()).padStart(2, '0') + '_' +
          String(now.getHours()).padStart(2, '0') + 
          String(now.getMinutes()).padStart(2, '0');
        
        link.setAttribute('href', url);
        link.setAttribute('download', `รายงานแคมเปญ_FTI_Academy_${dateString}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('ส่งออกข้อมูลแคมเปญเรียบร้อย');
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการส่งออกข้อมูล:', error);
        alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
      }
    },

    // เมธอดสำหรับดีบัก DOM และข้อมูล
    debugParticipantsState() {
      console.group('🔍 Debug Participants State');
      console.log('allCampaignParticipants length:', this.allCampaignParticipants?.length || 0);
      console.log('sortedParticipants length:', this.sortedParticipants?.length || 0);
      console.log('campaignLoading:', this.campaignLoading);
      console.log('First 3 participants:', this.sortedParticipants?.slice(0, 3));
      
      // ตรวจสอบ DOM elements
      const tableElement = document.querySelector('table');
      const tbodyElement = document.querySelector('tbody');
      console.log('Table element exists:', !!tableElement);
      console.log('Tbody element exists:', !!tbodyElement);
      
      if (tbodyElement) {
        console.log('Tbody children count:', tbodyElement.children.length);
      }
      
      console.groupEnd();
    }
  },

  mounted() {
    console.log('PromotionDashboard mounted');
    console.log('Session data:', this.session);
    console.log('Available $Key:', this.$Key);
    
    try {
      // ตรวจสอบว่าข้อมูล reactive arrays ถูกเริ่มต้นแล้ว
      if (!Array.isArray(this.allCampaignParticipants)) {
        this.allCampaignParticipants = [];
        console.warn('Initialized allCampaignParticipants as empty array');
      }
      if (!Array.isArray(this.promotions)) {
        this.promotions = [];
        console.warn('Initialized promotions as empty array');
      }
      
      this.hostkey = this.$Key;
      console.log('Hostkey set to:', this.hostkey);
      
      if (!this.session?.current?._id) {
        console.error('ไม่พบ session data หรือ user ID');
      }
      
      // เรียกใช้ data loading
      this.getPromotionData().catch(error => {
        console.error('Error in getPromotionData during mount:', error);
      });
      
      this.setDefaultDates();
      
      // เพิ่ม global error handler สำหรับ Vue errors
      this.$nextTick(() => {
        console.log('Component fully mounted and DOM updated');
        // Debug participants state หลังจาก mount
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => this.debugParticipantsState(), 1000);
        }
      });
      
    } catch (mountError) {
      console.error('Critical error during component mounting:', mountError);
      // Fallback initialization
      this.allCampaignParticipants = [];
      this.promotions = [];
      this.loading = false;
      this.campaignLoading = false;
    }
  }
}
</script>

<style scoped>
/* Card View Styles */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card gradient effects */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-purple-50 {
  --tw-gradient-from: #faf5ff;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(250, 245, 255, 0));
}

.to-pink-50 {
  --tw-gradient-to: #fdf2f8;
}

/* Usage progress bar */
.bg-gradient-to-r.from-blue-500.to-purple-500 {
  background-image: linear-gradient(to right, #3b82f6, #8b5cf6);
}

/* Status badge colors */
.bg-green-100 {
  background-color: #dcfce7;
}

.text-green-800 {
  color: #166534;
}

.bg-red-100 {
  background-color: #fecaca;
}

.text-red-800 {
  color: #991b1b;
}

.bg-yellow-100 {
  background-color: #fef3c7;
}

.text-yellow-800 {
  color: #92400e;
}

.bg-blue-100 {
  background-color: #dbeafe;
}

.text-blue-800 {
  color: #1e40af;
}

.bg-purple-100 {
  background-color: #e9d5ff;
}

.text-purple-800 {
  color: #6b21a8;
}

.bg-orange-100 {
  background-color: #fed7aa;
}

.text-orange-800 {
  color: #9a3412;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .promotion-card {
    margin-bottom: 1rem;
  }
  
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

/* Table row hover effects (for future table view) */
tbody tr:hover {
  background-color: #faf5ff;
}

/* Focus states for accessibility */
button:focus {
  outline: 2px solid #8b5cf6;
  outline-offset: 2px;
}

.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
}

/* Card shadow effects */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Border radius */
.rounded-xl {
  border-radius: 0.75rem;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

/* Text utilities */
.font-mono {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

/* Custom scrollbar for card area */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Dashboard specific styles */
.dashboard-stats-grid {
  display: grid;
  gap: 1rem;
}

/* Promotion code styling */
.promotion-code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  letter-spacing: 0.5px;
}

/* Action button group */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons button {
  opacity: 0.7;
  transition: all 0.2s ease;
}

.action-buttons button:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* Empty state */
.empty-state {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chart placeholder */
.chart-placeholder {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 0.5rem;
}

/* Responsive text sizing */
@media (max-width: 640px) {
  .text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }
  
  .text-lg {
    font-size: 1rem;
    line-height: 1.5rem;
  }
}

/* Print styles */
@media print {
  .action-buttons,
  button {
    display: none !important;
  }
  
  .promotion-card {
    break-inside: avoid;
    margin-bottom: 1rem;
  }
}
</style>