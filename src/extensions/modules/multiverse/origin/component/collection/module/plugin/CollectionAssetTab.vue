<template>
  <div class="bg-white rounded-lg border border-gray-200">
    <!-- Simple Header -->
    <div class="px-6 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-medium text-gray-900">เว็บไซต์</h2>
          <p class="text-gray-500 text-sm mt-1">รายการเว็บไซต์ในคอลเลกชัน ({{ getFilteredAssets().length }} จาก {{ assetData.length }} รายการ)</p>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center gap-2">          <!-- Bulk Actions -->
          <div v-if="bulkActionMode && selectedAssets.length > 0" class="flex items-center gap-2">
            <span class="text-sm text-gray-600">{{ selectedAssets.length }} รายการที่เลือก</span>
            <button
              @click="showBulkActionsModal = true"
              class="btn-simple text-blue-600 hover:bg-blue-50">
              จัดการแบบกลุ่ม
            </button>
          </div>
          
          <!-- View Mode Toggle -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-white shadow-sm' : ''"
              class="px-3 py-1 rounded-md text-sm transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>
            <button
              @click="viewMode = 'list'"
              :class="viewMode === 'list' ? 'bg-white shadow-sm' : ''"
              class="px-3 py-1 rounded-md text-sm transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
            </button>
          </div>
          
          <!-- Bulk Mode Toggle -->
          <button
            @click="toggleBulkMode"
            :class="bulkActionMode ? 'btn-simple text-blue-600 hover:bg-blue-50' : 'btn-simple'"
            class="">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ bulkActionMode ? 'ยกเลิกการเลือก' : 'เลือกหลายรายการ' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="px-6 py-4 border-b border-gray-100">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex flex-1 items-center gap-4">
          <!-- Search Input -->
          <div class="relative flex-1 max-w-md">
            <input 
              v-model="searchQuery"
              placeholder="ค้นหาเว็บไซต์..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <svg class="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          
          <!-- Advanced Search Toggle -->
          <button
            @click="showAdvancedSearch = !showAdvancedSearch"
            :class="showAdvancedSearch ? 'btn-simple text-blue-600 hover:bg-blue-50' : 'btn-simple'"
            class="">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"/>
            </svg>
            ค้นหาขั้นสูง
          </button>
        </div>
        
        <!-- Sort and Items per page -->
        <div class="flex items-center gap-4">
          <select v-model="sortBy" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="siteName">เรียงตามชื่อ</option>
            <option value="hostname">เรียงตาม hostname</option>
            <option value="createdAt">เรียงตามวันที่สร้าง</option>
            <option value="updatedAt">เรียงตามวันที่อัปเดต</option>
            <option value="status">เรียงตามสถานะ</option>
          </select>
          
          <button
            @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
            class="btn-icon">
            <svg v-if="sortOrder === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"/>
            </svg>
          </button>
          
          <select v-model="itemsPerPage" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option :value="6">6 รายการ</option>
            <option :value="12">12 รายการ</option>
            <option :value="24">24 รายการ</option>
            <option :value="48">48 รายการ</option>
          </select>
        </div>
      </div>
      
      <!-- Advanced Search Panel -->
      <div v-if="showAdvancedSearch" class="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
        <h3 class="text-sm font-medium text-gray-900 mb-4">ตัวกรองขั้นสูง</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="field-group">
            <label class="field-label">สถานะ</label>
            <select v-model="advancedSearchFilters.status" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">ทั้งหมด</option>
              <option value="active">เปิดใช้งาน</option>
              <option value="inactive">ปิดใช้งาน</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="maintenance">ปรับปรุง</option>
            </select>
          </div>
          
          <div class="field-group">
            <label class="field-label">ประเภท</label>
            <select v-model="advancedSearchFilters.siteType" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">ทั้งหมด</option>
              <option value="website">เว็บไซต์</option>
              <option value="api">API</option>
              <option value="app">แอปพลิเคชัน</option>
            </select>
          </div>
          
          <div class="field-group">
            <label class="field-label">วันที่เริ่มต้น</label>
            <input 
              v-model="advancedSearchFilters.dateRange.start"
              type="date"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
          
          <div class="field-group">
            <label class="field-label">วันที่สิ้นสุด</label>
            <input 
              v-model="advancedSearchFilters.dateRange.end"
              type="date"
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
          
          <div class="field-group">
            <label class="field-label">Hostname</label>
            <input 
              v-model="advancedSearchFilters.hostname"
              placeholder="กรอก hostname..."
              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
        
        <div class="flex items-center justify-between mt-4">
          <div class="text-xs text-gray-500">
            พบ {{ getFilteredAssets().length }} รายการจากการกรอง
          </div>
          <div class="flex gap-2">
            <button
              @click="clearAdvancedFilters"
              class="btn-simple text-gray-600">
              ล้างตัวกรอง
            </button>
            <button
              @click="applyAdvancedFilters"
              class="btn-simple text-blue-600 hover:bg-blue-50">
              ใช้ตัวกรอง
            </button>
          </div>
        </div>
      </div>
    </div>
      
    <!-- Asset Content -->
    <div class="border-t border-gray-100">
        <!-- Bulk Select All -->
        <div v-if="bulkActionMode" class="px-6 py-3 bg-blue-50 border-b border-blue-100">
          <div class="flex items-center justify-between">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox"
                :checked="selectedAssets.length === getFilteredAssets().length && getFilteredAssets().length > 0"
                :indeterminate="selectedAssets.length > 0 && selectedAssets.length < getFilteredAssets().length"
                @change="selectAllAssets"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              <span class="text-sm text-blue-700">
                เลือกทั้งหมด ({{ selectedAssets.length }}/{{ getFilteredAssets().length }})
              </span>
            </label>
            
            <div v-if="selectedAssets.length > 0" class="flex space-x-2">
              <button
                v-for="action in bulkActions"
                :key="action.action"
                @click="executeBulkAction(action.action)"
                :class="{
                  'bg-red-100 text-red-700 hover:bg-red-200': action.color === 'red',
                  'bg-blue-100 text-blue-700 hover:bg-blue-200': action.color === 'blue',
                  'bg-yellow-100 text-yellow-700 hover:bg-yellow-200': action.color === 'yellow',
                  'bg-green-100 text-green-700 hover:bg-green-200': action.color === 'green'
                }"
                class="px-3 py-1 rounded-md text-xs transition-colors">
                {{ action.name }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div 
              v-for="asset in getPaginatedAssets()" 
              :key="asset._id"
              class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              @click="!bulkActionMode && $router.push(`/origin/asset/${asset._id}`)">
              
              <!-- Bulk Selection Checkbox -->
              <div v-if="bulkActionMode" class="flex items-center mb-3" @click.stop>
                <input 
                  type="checkbox"
                  :checked="selectedAssets.includes(asset._id)"
                  @change="toggleAssetSelection(asset._id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              </div>
              
              <!-- Asset Image -->
              <div class="flex items-center justify-center h-16 mb-3">
                <img 
                  v-if="asset.loginLogo" 
                  :src="asset.loginLogo" 
                  :alt="asset.siteName"
                  class="h-12 w-12 rounded-lg object-cover">
                <div v-else class="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9V3"/>
                  </svg>
                </div>
              </div>
              
              <!-- Asset Info -->
              <div class="text-center">
                <h3 class="font-medium text-gray-900 text-sm mb-1 truncate" :title="asset.siteName">
                  {{ asset.siteName }}
                </h3>
                <p class="text-xs text-gray-500 mb-2 truncate" :title="asset.hostname">
                  {{ asset.hostname }}
                </p>
                
                <!-- Status Badge -->
                <div class="flex items-center justify-center mb-2">
                  <span :class="getStatusColor(asset.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ asset.status || 'active' }}
                  </span>
                </div>
                
                <!-- Quick Actions -->
                <div class="flex items-center justify-center space-x-2">
                  <button 
                    @click.stop="$router.push(`/origin/asset/${asset._id}`)"
                    class="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button 
                    @click.stop="copyToClipboard(asset.hostname)"
                    class="p-1 text-gray-400 hover:text-green-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- List View -->
        <div v-else class="divide-y divide-gray-100">
          <div 
            v-for="asset in getPaginatedAssets()" 
            :key="asset._id"
            class="p-6 hover:bg-gray-50 transition-colors"
            :class="{ 'cursor-pointer': !bulkActionMode }"
            @click="!bulkActionMode && $router.push(`/origin/asset/${asset._id}`)">
            
            <div class="flex items-center space-x-4">
              <!-- Bulk Selection -->
              <div v-if="bulkActionMode" @click.stop>
                <input 
                  type="checkbox"
                  :checked="selectedAssets.includes(asset._id)"
                  @change="toggleAssetSelection(asset._id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              </div>
              
              <!-- Asset Image -->
              <div class="flex-shrink-0">
                <img 
                  v-if="asset.loginLogo" 
                  :src="asset.loginLogo" 
                  :alt="asset.siteName"
                  class="h-12 w-12 rounded-lg object-cover">
                <div v-else class="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9V3"/>
                  </svg>
                </div>
              </div>
              
              <!-- Asset Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-sm font-medium text-gray-900 truncate">
                      {{ asset.siteName }}
                    </h3>
                    <p class="text-sm text-gray-500 truncate">
                      {{ asset.hostname }}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                      สร้างเมื่อ {{ dateTime(asset.createdAt) }}
                    </p>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <!-- Status -->
                    <div class="flex items-center space-x-2">
                      <span :class="getStatusColor(asset.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ asset.status || 'active' }}
                      </span>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex items-center space-x-2">
                      <button 
                        @click.stop="$router.push(`/origin/asset/${asset._id}`)"
                        class="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button 
                        @click.stop="copyToClipboard(asset.hostname)"
                        class="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="getFilteredAssets().length === 0" class="p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">ไม่พบเว็บไซต์</h3>
          <p class="mt-1 text-sm text-gray-500">ไม่มีเว็บไซต์ในคอลเลกชันนี้ หรือไม่ตรงกับการค้นหา</p>
        </div>
        
        <!-- Pagination -->
        <div v-if="getTotalPages() > 1" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              แสดง {{ ((currentPage - 1) * itemsPerPage) + 1 }} ถึง {{ Math.min(currentPage * itemsPerPage, getFilteredAssets().length) }} 
              จาก {{ getFilteredAssets().length }} รายการ
            </div>
            
            <div class="flex items-center space-x-2">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">
                ก่อนหน้า
              </button>
              
              <div class="flex space-x-1">
                <button
                  v-for="page in Math.min(getTotalPages(), 5)"
                  :key="page"
                  @click="changePage(page)"
                  :class="page === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'"
                  class="px-3 py-1 border border-gray-300 rounded-md text-sm transition-colors">
                  {{ page }}
                </button>
              </div>
              
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === getTotalPages()"
                class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </div>

    <!-- Footer Actions -->
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
      <div class="flex items-center justify-between">
        <div class="text-xs text-gray-500">
          รายการเว็บไซต์ทั้งหมด {{ assetData.length }} รายการ • 
          แสดง {{ getFilteredAssets().length }} รายการ
        </div>
        <div class="flex gap-1">
          <button @click="$emit('refresh')" class="btn-icon" title="รีเฟรช">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
          <button @click="$emit('export')" class="btn-icon" title="ส่งออก">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script>
import moment from 'moment'

export default {
  name: 'CollectionAssetTab',
  props: {
    assetData: {
      type: Array,
      required: true
    }
  },
  emits: ['bulk-action', 'copy-success', 'refresh', 'export'],
  data() {
    return {
      // Search and filtering
      searchQuery: '',
      showAdvancedSearch: false,
      advancedSearchFilters: {
        status: '',
        siteType: '',
        hostname: '',
        dateRange: {
          start: '',
          end: ''
        }
      },
      
      // View options
      viewMode: 'grid', // 'grid' or 'list'
      sortBy: 'siteName',
      sortOrder: 'asc',
      itemsPerPage: 12,
      currentPage: 1,
      
      // Bulk actions
      bulkActionMode: false,
      selectedAssets: [],
      showBulkActionsModal: false,
      bulkActions: [
        { action: 'archive', name: 'เก็บถาวร', color: 'yellow' },
        { action: 'delete', name: 'ลบ', color: 'red' },
        { action: 'export', name: 'ส่งออก', color: 'blue' },
        { action: 'status-active', name: 'เปิดใช้งาน', color: 'green' },
        { action: 'status-inactive', name: 'ปิดใช้งาน', color: 'red' }
      ]
    }
  },
  methods: {
    // Filtering and search methods
    getFilteredAssets() {
      let filtered = this.assetData;
      
      // Basic search
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(asset => 
          asset.siteName?.toLowerCase().includes(query) ||
          asset.hostname?.toLowerCase().includes(query) ||
          asset.description?.toLowerCase().includes(query)
        );
      }
      
      // Advanced filters
      if (this.advancedSearchFilters.status) {
        filtered = filtered.filter(asset => asset.status === this.advancedSearchFilters.status);
      }
      
      if (this.advancedSearchFilters.siteType) {
        filtered = filtered.filter(asset => asset.siteType === this.advancedSearchFilters.siteType);
      }
      
      if (this.advancedSearchFilters.hostname) {
        const hostnameQuery = this.advancedSearchFilters.hostname.toLowerCase();
        filtered = filtered.filter(asset => 
          asset.hostname?.toLowerCase().includes(hostnameQuery)
        );
      }
      
      if (this.advancedSearchFilters.dateRange.start && this.advancedSearchFilters.dateRange.end) {
        const start = new Date(this.advancedSearchFilters.dateRange.start);
        const end = new Date(this.advancedSearchFilters.dateRange.end);
        filtered = filtered.filter(asset => {
          const assetDate = new Date(asset.createdAt);
          return assetDate >= start && assetDate <= end;
        });
      }
      
      // Sorting
      filtered.sort((a, b) => {
        let aVal = a[this.sortBy] || '';
        let bVal = b[this.sortBy] || '';
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (this.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
      
      return filtered;
    },
    
    getPaginatedAssets() {
      const filtered = this.getFilteredAssets();
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    
    getTotalPages() {
      return Math.ceil(this.getFilteredAssets().length / this.itemsPerPage);
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.getTotalPages()) {
        this.currentPage = page;
      }
    },
    
    clearAdvancedFilters() {
      this.advancedSearchFilters = {
        status: '',
        siteType: '',
        hostname: '',
        dateRange: {
          start: '',
          end: ''
        }
      };
    },
    
    applyAdvancedFilters() {
      this.currentPage = 1;
    },
    
    // Bulk actions
    toggleBulkMode() {
      this.bulkActionMode = !this.bulkActionMode;
      if (!this.bulkActionMode) {
        this.selectedAssets = [];
      }
    },
    
    toggleAssetSelection(assetId) {
      const index = this.selectedAssets.indexOf(assetId);
      if (index > -1) {
        this.selectedAssets.splice(index, 1);
      } else {
        this.selectedAssets.push(assetId);
      }
    },
    
    selectAllAssets(event) {
      if (event.target.checked) {
        this.selectedAssets = this.getFilteredAssets().map(asset => asset._id);
      } else {
        this.selectedAssets = [];
      }
    },
    
    executeBulkAction(action) {
      this.$emit('bulk-action', {
        action,
        assetIds: this.selectedAssets
      });
    },
    
    // Utility methods
    getStatusColor(status) {
      const statusColors = {
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-red-100 text-red-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'maintenance': 'bg-blue-100 text-blue-800',
        'archived': 'bg-gray-100 text-gray-800'
      };
      return statusColors[status] || statusColors['active'];
    },
    
    dateTime(date) {
      if (!date) return '';
      return moment(date).format('DD/MM/YYYY HH:mm:ss');
    },
    
    getRelativeTime(date) {
      return moment(date).fromNow();
    },
    
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.$emit('copy-success', text);
      });
    }
  },
  
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    sortBy() {
      this.currentPage = 1;
    },
    sortOrder() {
      this.currentPage = 1;
    },
    itemsPerPage() {
      this.currentPage = 1;
    }
  }
}
</script>

<style scoped>
/* Simple, clean button styles */
.btn-simple {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  background-color: white;
  color: #374151;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
}

.btn-simple:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-icon {
  padding: 0.375rem;
  color: #9ca3af;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  color: #4b5563;
  background-color: #f3f4f6;
}

/* Simple stat cards */
.stat-card {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #f3f4f6;
}

/* Clean field styling */
.field-group {
  margin-bottom: 0.25rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  display: block;
  margin-bottom: 0.25rem;
}

.field-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
}

/* Simple status badge */
.status-badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}
</style>
