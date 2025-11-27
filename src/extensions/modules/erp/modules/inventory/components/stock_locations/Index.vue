<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Stock Location Management</h1>
            <p class="mt-2 text-gray-600">จัดการตำแหน่งเก็บสินค้าในคลัง เพิ่ม แก้ไข และดูรายละเอียด</p>
          </div>
          <div class="flex space-x-3">
            <button 
              @click="refreshData"
              :disabled="loading"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-sync mr-2" :class="{ 'fa-spin': loading }"></i>
              รีเฟรช
            </button>
            
            <button 
              @click="showLocationModal = true"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              เพิ่มตำแหน่งใหม่
            </button>
            
            <router-link 
              to="/inventory" 
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <i class="fas fa-arrow-left mr-2"></i>
              กลับสู่ Inventory
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-3">
            <li class="inline-flex items-center">
              <router-link 
                to="/inventory/dashboard" 
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <i class="fas fa-home mr-2"></i>
                Inventory Dashboard
              </router-link>
            </li>
            <li>
              <div class="flex items-center">
                <i class="fas fa-chevron-right text-gray-400 text-xs mx-2"></i>
                <span class="text-sm font-medium text-gray-500">จัดการตำแหน่งคลัง</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-warehouse text-white text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ stockLocations.length }}</div>
              <div class="text-sm text-gray-600">ตำแหน่งทั้งหมด</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-check-circle text-white text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ activeLocationsCount }}</div>
              <div class="text-sm text-gray-600">ตำแหน่งที่ใช้งาน</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-boxes text-white text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ totalCapacity.toLocaleString() }}</div>
              <div class="text-sm text-gray-600">ความจุรวม</div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-chart-line text-white text-xl"></i>
              </div>
            </div>
            <div class="ml-4">
              <div class="text-2xl font-bold text-gray-900">{{ utilizationPercentage }}%</div>
              <div class="text-sm text-gray-600">การใช้งาน</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Locations Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div class="bg-gray-200 h-4 rounded mb-4"></div>
          <div class="bg-gray-200 h-3 rounded mb-2"></div>
          <div class="bg-gray-200 h-3 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="stockLocations.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <i class="fas fa-map-marker-alt text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">ยังไม่มีตำแหน่งคลัง</h3>
        <p class="text-gray-600 mb-6">เริ่มต้นด้วยการเพิ่มตำแหน่งคลังแรกของคุณ เพื่อจัดการสินค้าให้เป็นระบบ</p>
        <button 
          @click="showLocationModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
        >
          <i class="fas fa-plus mr-2"></i>
          เพิ่มตำแหน่งแรก
        </button>
      </div>

      <!-- Locations Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="location in stockLocations" 
          :key="location.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-start flex-1">
              <div :class="`w-10 h-10 bg-${getLocationTypeColor(location.location_type)}-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0`">
                <i :class="`fas ${getLocationTypeIcon(location.location_type)} text-${getLocationTypeColor(location.location_type)}-600`"></i>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ location.location_name }}</h3>
                <p class="text-sm text-gray-500 font-mono">{{ location.location_code }}</p>
              </div>
            </div>
            <span 
              :class="getStatusClass(location.status)"
              class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ getStatusText(location.status) }}
            </span>
          </div>

          <div class="space-y-2 mb-4">
            <p class="text-sm text-gray-600">
              <i class="fas fa-tag mr-2"></i>
              {{ getLocationTypeText(location.location_type) }}
            </p>
            <p class="text-sm text-gray-600">
              <i class="fas fa-map-marker-alt mr-2"></i>
              โซน: {{ location.zone || 'ไม่ระบุ' }}
            </p>
            <p class="text-sm text-gray-600">
              <i class="fas fa-cube mr-2"></i>
              ความจุ: {{ formatCapacity(location) }}
            </p>
            <p class="text-sm text-gray-600">
              <i class="fas fa-chart-bar mr-2"></i>
              การใช้งาน: {{ location.current_usage || 0 }}/{{ location.capacity_numeric || 'ไม่จำกัด' }}
              <span v-if="location.capacity_numeric" class="text-green-600">
                ({{ Math.round(((location.current_usage || 0) / location.capacity_numeric) * 100) }}%)
              </span>
            </p>
            
            <!-- Rack Info -->
            <div v-if="location.has_rack" class="mt-2 p-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded">
              <p class="text-sm font-medium text-purple-900">
                <i class="fas fa-th mr-2 text-purple-600"></i>
                Rack {{ location.rack_side === 'left' ? 'ซ้าย' : 'ขวา' }}: 
                <span class="font-bold">{{ location.rack_rows }}x{{ location.rack_columns }}</span>
                <span class="text-purple-600 ml-1">({{ Object.values(location.rack_positions || {}).filter(p => p).length }} ตำแหน่ง)</span>
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between mb-4">
            <div class="flex space-x-4 text-xs">
              <span class="flex items-center" :class="location.is_receivable ? 'text-green-600' : 'text-gray-400'">
                <i class="fas mr-1" :class="location.is_receivable ? 'fa-check' : 'fa-times'"></i>
                เก็บรับได้
              </span>
              <span class="flex items-center" :class="location.is_pickable ? 'text-green-600' : 'text-gray-400'">
                <i class="fas mr-1" :class="location.is_pickable ? 'fa-check' : 'fa-times'"></i>
                เบิกได้
              </span>
            </div>
          </div>

          <div v-if="location.description" class="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
            {{ location.description }}
          </div>

          <!-- Location Properties -->
          <div v-if="location.storage_condition !== 'normal' || location.access_level !== 'public' || location.priority !== 'normal'" class="mb-4">
            <div class="flex flex-wrap gap-1">
              <span v-if="location.storage_condition !== 'normal'" class="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {{ getStorageConditionText(location.storage_condition) }}
              </span>
              <span v-if="location.access_level !== 'public'" class="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                {{ getAccessLevelText(location.access_level) }}
              </span>
              <span v-if="location.priority !== 'normal'" class="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                {{ getPriorityText(location.priority) }}
              </span>
            </div>
          </div>

          <!-- Rack Design Info -->
          <div v-if="location.rack_design" class="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-purple-900">
                <i class="fas fa-th mr-2"></i>Rack Configuration
              </span>
              <span class="text-xs px-2 py-1 bg-purple-600 text-white rounded">
                {{ getRackLayoutText(location.rack_design.config.layout) }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="text-purple-700">
                <i class="fas fa-arrows-alt-v mr-1"></i>
                แถว: <strong>{{ location.rack_design.config.rows }}</strong>
              </div>
              <div class="text-purple-700">
                <i class="fas fa-arrows-alt-h mr-1"></i>
                คอลัมน์: <strong>{{ location.rack_design.config.columns }}</strong>
              </div>
              <div class="text-purple-700 col-span-2">
                <i class="fas fa-cube mr-1"></i>
                ตำแหน่งทั้งหมด: <strong>{{ location.rack_design.totalPositions }} ช่อง</strong>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button 
              @click="viewLocationDetails(location)"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              <i class="fas fa-eye mr-1"></i>
              ดู
            </button>
            <button 
              @click="openRackDesigner(location)"
              class="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded text-sm font-medium transition-colors"
              :title="location.rack_design ? 'แก้ไข Rack Design' : 'ออกแบบ Rack'"
            >
              <i class="fas fa-th mr-1"></i>
              <span v-if="location.rack_design" class="inline-flex items-center">
                แก้ไข
                <span class="ml-1 bg-purple-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {{ location.rack_design.config.rows }}x{{ location.rack_design.config.columns }}
                </span>
              </span>
              <span v-else>Rack</span>
            </button>
            <button 
              @click="editLocation(location)"
              class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              <i class="fas fa-edit mr-1"></i>
              แก้ไข
            </button>
            <button 
              @click="removeLocation(location)"
              :disabled="(location.current_usage || 0) > 0"
              class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-trash mr-1"></i>
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Location Modal -->
    <div v-if="showLocationModal" class="fixed inset-0 z-50 overflow-y-auto" @click="showLocationModal = false">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full" @click.stop>
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-map-marker-alt text-blue-600 text-xl"></i>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ editingLocation ? 'แก้ไขตำแหน่งคลัง' : 'เพิ่มตำแหน่งคลังใหม่' }}
                </h3>
                <p class="text-sm text-gray-500 mt-1">กรอกข้อมูลตำแหน่งคลังให้ครบถ้วน</p>
              </div>
              <button 
                @click="closeLocationModal"
                class="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span class="sr-only">ปิด</span>
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>

            <form @submit.prevent="saveLocation" class="mt-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">รหัส Location <span class="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    v-model="locationForm.location_code"
                    :class="[
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                      locationErrors.location_code ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    ]"
                    placeholder="เช่น WH-01, ZONE-A"
                    :disabled="editingLocation && savingLocation"
                    required
                  >
                  <div v-if="locationErrors.location_code" class="text-red-600 text-sm mt-1">{{ locationErrors.location_code }}</div>
                  <div class="text-gray-500 text-xs mt-1">รหัสตำแหน่งต้องเป็นตัวอักษรพิมพ์ใหญ่ ตัวเลข และ - เท่านั้น</div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อตำแหน่ง <span class="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    v-model="locationForm.location_name"
                    :class="[
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                      locationErrors.location_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    ]"
                    placeholder="เช่น คลังสินค้าหลัก, ห้องเก็บชั่วคราว"
                    required
                  >
                  <div v-if="locationErrors.location_name" class="text-red-600 text-sm mt-1">{{ locationErrors.location_name }}</div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทตำแหน่ง <span class="text-red-500">*</span></label>
                  <select 
                    v-model="locationForm.location_type"
                    :disabled="editingLocation"
                    :class="[
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                      editingLocation ? 'bg-gray-100 cursor-not-allowed' : '',
                      locationErrors.location_type ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    ]"
                  >
                    <option value="warehouse">คลังสินค้าทั่วไป</option>
                    <option value="virtual">Virtual Location</option>
                    <option value="scrap">คลังของเสีย</option>
                    <option value="sample">คลังตัวอย่าง</option>
                  </select>
                  <div v-if="locationErrors.location_type" class="text-red-600 text-sm mt-1">
                    <i class="fas fa-exclamation-circle mr-1"></i>{{ locationErrors.location_type }}
                  </div>
                  <div v-else class="text-gray-500 text-xs mt-1">{{ getLocationTypeDescription(locationForm.location_type) }}</div>
                  <div v-if="!editingLocation && !locationErrors.location_type" class="text-orange-600 text-xs mt-1">
                    <i class="fas fa-info-circle mr-1"></i>แต่ละประเภทสามารถมีได้เพียง 1 ตำแหน่งเท่านั้น
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">โซน <span class="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    v-model="locationForm.zone"
                    :class="[
                      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                      locationErrors.zone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    ]"
                    placeholder="เช่น A, B, C หรือ ชั้น 1, ชั้น 2"
                    required
                  >
                  <div v-if="locationErrors.zone" class="text-red-600 text-sm mt-1">{{ locationErrors.zone }}</div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ความจุ (ตัวเลข)</label>
                  <input 
                    type="number" 
                    v-model.number="locationForm.capacity_numeric"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1000"
                    min="0"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">หน่วยความจุ</label>
                  <select 
                    v-model="locationForm.capacity_unit"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pieces">ชิ้น</option>
                    <option value="cubic_meter">ลูกบาศก์เมตร</option>
                    <option value="square_meter">ตารางเมตร</option>
                    <option value="pallets">พาเลท</option>
                    <option value="bins">ถัง/ลัง</option>
                    <option value="weight_kg">กิโลกรัม</option>
                    <option value="weight_tons">ตัน</option>
                    <option value="unlimited">ไม่จำกัด</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สภาพการเก็บ</label>
                  <select 
                    v-model="locationForm.storage_condition"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="normal">ปกติ</option>
                    <option value="cold">เย็น</option>
                    <option value="frozen">แข็ง</option>
                    <option value="dry">แห้ง</option>
                    <option value="humid">ชื้น</option>
                    <option value="climate_controlled">ควบคุมอุณหภูมิ</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ระดับการเข้าถึง</label>
                  <select 
                    v-model="locationForm.access_level"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="public">ทั่วไป</option>
                    <option value="restricted">จำกัด</option>
                    <option value="private">ส่วนตัว</option>
                    <option value="high_security">ความปลอดภัยสูง</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ลำดับความสำคัญ</label>
                  <select 
                    v-model="locationForm.priority"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">ต่ำ</option>
                    <option value="normal">ปกติ</option>
                    <option value="high">สูง</option>
                    <option value="critical">วิกฤต</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                  <select 
                    v-model="locationForm.status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">ใช้งาน</option>
                    <option value="inactive">ไม่ใช้งาน</option>
                    <option value="maintenance">บำรุงรักษา</option>
                    <option value="blocked">ถูกบล็อก</option>
                  </select>
                </div>
              </div>

              <!-- Capabilities -->
              <div class="mt-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">ความสามารถ</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="locationForm.is_receivable"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700">รับสินค้าได้</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="locationForm.is_pickable"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700">เบิกสินค้าได้</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="locationForm.allow_mixing"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700">เก็บสินค้าหลายชนิดได้</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="locationForm.allow_negative"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm text-gray-700">อนุญาตยอดติดลบ</span>
                  </label>
                </div>
              </div>

              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                <textarea 
                  v-model="locationForm.description"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับตำแหน่งนี้"
                ></textarea>
              </div>
            </form>
          </div>

          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              @click="saveLocation"
              :disabled="savingLocation"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              <i v-if="savingLocation" class="fas fa-spinner fa-spin mr-2"></i>
              {{ editingLocation ? 'บันทึกการแก้ไข' : 'เพิ่มตำแหน่ง' }}
            </button>
            <button 
              type="button" 
              @click="closeLocationModal"
              :disabled="savingLocation"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rack Position Designer Modal -->
    <div v-if="showRackDesigner" class="fixed inset-0 z-50 overflow-y-auto" @click="closeRackDesigner">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"></div>
        
        <div class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-4" @click.stop>
          <!-- Compact Modal Header -->
          <div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <i class="fas fa-th text-purple-600 text-lg"></i>
              </div>
              <div>
                <h3 class="text-base font-semibold text-gray-900">{{ rackDesignLocation?.location_name }}</h3>
                <p class="text-xs text-gray-500">{{ rackDesignLocation?.location_code }}</p>
              </div>
            </div>
            <button 
              @click="closeRackDesigner"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>

          <RackPositionDesigner
            v-if="rackDesignLocation"
            :initialDesign="rackDesignLocation.rack_design"
            @save="saveRackDesign"
            @close="closeRackDesigner"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ERP_CORE } from '../../../../core/index.js'
import RackPositionDesigner from '../RackPositionDesigner.vue'

// ✅ ใช้ InventoryService จาก window.ERP_CORE (เหมือน AccountingSettings)
const inventoryService = window.ERP_CORE.inventory

export default {
  name: 'StockLocationManager',
  components: {
    RackPositionDesigner
  },
  setup() {
    // Reactive data
    const stockLocations = ref([])
    const loading = ref(false)
    const showLocationModal = ref(false)
    const editingLocation = ref(null)
    const savingLocation = ref(false)
    const showRackDesigner = ref(false)
    const rackDesignLocation = ref(null)

    // Form data - Use stock_locations schema fields
    const locationForm = ref({
      location_code: '',
      location_name: '',
      location_type: 'warehouse',
      zone: '',
      capacity_numeric: null,
      capacity_unit: 'pieces',
      current_usage: 0,
      description: '',
      status: 'active',
      storage_condition: 'normal',
      access_level: 'public',
      priority: 'normal',
      is_receivable: true,
      is_pickable: true,
      allow_mixing: true,
      allow_negative: false,
      parent_location: '',
      sort_order: 0,
      has_rack: false,
      rack_design: null,
      rack_side: null,
      rack_rows: null,
      rack_columns: null,
      rack_positions: null
    })

    const locationErrors = ref({})

    // Computed properties
    const activeLocationsCount = computed(() => {
      return stockLocations.value.filter(loc => loc.status === 'active').length
    })

    const totalCapacity = computed(() => {
      return stockLocations.value
        .filter(loc => loc.capacity_numeric)
        .reduce((sum, loc) => sum + (loc.capacity_numeric || 0), 0)
    })

    const utilizationPercentage = computed(() => {
      const totalUsage = stockLocations.value
        .reduce((sum, loc) => sum + (loc.current_usage || 0), 0)
      
      return totalCapacity.value > 0 
        ? Math.round((totalUsage / totalCapacity.value) * 100)
        : 0
    })

    // Methods
    const loadData = async () => {
      loading.value = true
      try {
        console.log('🔍 Loading stock locations via InventoryService')
        
        // ✅ ใช้ inventoryService (สะดวกกว่าเยอะ!)
        stockLocations.value = await inventoryService.getAllStockLocations()
        
        console.log('✅ Stock locations loaded:', stockLocations.value.length, 'items')
        console.log('📍 First location:', stockLocations.value[0])

      } catch (error) {
        console.error('❌ Error loading stock locations:', error)
        ERP_CORE.showNotification('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message)
        stockLocations.value = []
      } finally {
        loading.value = false
      }
    }

    const getLocationTypeText = (type) => {
      const types = {
        warehouse: 'คลังสินค้าทั่วไป',
        virtual: 'Virtual Location',
        scrap: 'คลังของเสีย',
        sample: 'คลังตัวอย่าง'
      }
      return types[type] || type
    }

    const getLocationTypeDescription = (type) => {
      const descriptions = {
        warehouse: 'คลังหลักสำหรับเก็บสินค้าปกติ',
        virtual: 'สำหรับ adjustment, จอง, หรือการทำงานของระบบ',
        scrap: 'สินค้าเสียหาย/ของเสีย ไม่สามารถขายได้',
        sample: 'สินค้าตัวอย่าง ไม่นับเป็นสต็อกขาย'
      }
      return descriptions[type] || ''
    }

    const getLocationTypeIcon = (type) => {
      const icons = {
        warehouse: 'fa-warehouse',
        virtual: 'fa-cloud',
        scrap: 'fa-trash-alt',
        sample: 'fa-flask'
      }
      return icons[type] || 'fa-map-marker-alt'
    }

    const getLocationTypeColor = (type) => {
      const colors = {
        warehouse: 'blue',
        virtual: 'purple',
        scrap: 'red',
        sample: 'green'
      }
      return colors[type] || 'gray'
    }

    const getRackLayoutText = (layout) => {
      const texts = {
        left: 'ซ้าย (L)',
        right: 'ขวา (R)',
        both: 'ทั้งสองฝั่ง (L+R)'
      }
      return texts[layout] || layout
    }

    const getStatusText = (status) => {
      const statuses = {
        active: 'ใช้งาน',
        inactive: 'ไม่ใช้งาน',
        maintenance: 'บำรุงรักษา',
        blocked: 'ถูกบล็อก'
      }
      return statuses[status] || status
    }

    const getStatusClass = (status) => {
      const classes = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        maintenance: 'bg-blue-100 text-blue-800',
        blocked: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    const getStorageConditionText = (condition) => {
      const conditions = {
        normal: 'ปกติ',
        cold: 'เย็น',
        frozen: 'แข็ง',
        dry: 'แห้ง',
        humid: 'ชื้น',
        climate_controlled: 'ควบคุมอุณหภูมิ'
      }
      return conditions[condition] || condition
    }

    const getAccessLevelText = (level) => {
      const levels = {
        public: 'ทั่วไป',
        restricted: 'จำกัด',
        private: 'ส่วนตัว',
        high_security: 'ความปลอดภัยสูง'
      }
      return levels[level] || level
    }

    const getPriorityText = (priority) => {
      const priorities = {
        low: 'ต่ำ',
        normal: 'ปกติ',
        high: 'สูง',
        critical: 'วิกฤต'
      }
      return priorities[priority] || priority
    }

    const getCapacityUnitText = (unit) => {
      const units = {
        pieces: 'ชิ้น',
        cubic_meter: 'ลูกบาศก์เมตร',
        square_meter: 'ตารางเมตร',
        pallets: 'พาเลท',
        bins: 'ถัง/ลัง',
        weight_kg: 'กิโลกรัม',
        weight_tons: 'ตัน',
        unlimited: 'ไม่จำกัด'
      }
      return units[unit] || unit
    }

    const formatCapacity = (location) => {
      if (!location.capacity_numeric) return 'ไม่จำกัด'
      
      const unit = getCapacityUnitText(location.capacity_unit || 'pieces')
      return `${location.capacity_numeric.toLocaleString()} ${unit}`
    }

    const viewLocationDetails = (location) => {
      const details = [
        `รหัส: ${location.location_code}`,
        `ชื่อ: ${location.location_name}`,
        `ประเภท: ${getLocationTypeText(location.location_type)}`,
        `โซน: ${location.zone || 'ไม่ระบุ'}`,
        `ความจุ: ${formatCapacity(location)}`,
        `การใช้งาน: ${location.current_usage || 0}/${location.capacity_numeric || 'ไม่จำกัด'}`,
        `สภาพการเก็บ: ${getStorageConditionText(location.storage_condition)}`,
        `ระดับการเข้าถึง: ${getAccessLevelText(location.access_level)}`,
        `ลำดับความสำคัญ: ${getPriorityText(location.priority)}`,
        `สถานะ: ${getStatusText(location.status)}`,
        `รับสินค้าได้: ${location.is_receivable ? 'ได้' : 'ไม่ได้'}`,
        `เบิกสินค้าได้: ${location.is_pickable ? 'ได้' : 'ไม่ได้'}`,
        `เก็บสินค้าหลายชนิด: ${location.allow_mixing ? 'ได้' : 'ไม่ได้'}`,
        `อนุญาตยอดติดลบ: ${location.allow_negative ? 'ได้' : 'ไม่ได้'}`
      ]
      
      if (location.description) {
        details.push(`คำอธิบาย: ${location.description}`)
      }
      
      alert(`รายละเอียดตำแหน่งคลัง\n\n${details.join('\n')}`)
    }

    const editLocation = (location) => {
      editingLocation.value = location
      locationForm.value = {
        location_code: location.location_code || '',
        location_name: location.location_name || '',
        location_type: location.location_type || 'warehouse',
        zone: location.zone || '',
        capacity_numeric: location.capacity_numeric || null,
        capacity_unit: location.capacity_unit || '',
        current_usage: location.current_usage || 0,
        description: location.description || '',
        status: location.status || 'active',
        storage_condition: location.storage_condition || 'normal',
        access_level: location.access_level || 'public',
        priority: location.priority || 'normal',
        is_receivable: location.is_receivable !== false,
        is_pickable: location.is_pickable !== false,
        allow_mixing: location.allow_mixing !== false,
        allow_negative: location.allow_negative === true,
        parent_location: location.parent_location || '',
        sort_order: location.sort_order || 0,
        has_rack: location.has_rack || false,
        rack_design: location.rack_design || null,
        rack_side: location.rack_side || null,
        rack_rows: location.rack_rows || null,
        rack_columns: location.rack_columns || null,
        rack_positions: location.rack_positions || null
      }
      showLocationModal.value = true
    }

    const validateLocationForm = () => {
      const errors = {}
      
      if (!locationForm.value.location_code) {
        errors.location_code = 'กรุณาระบุรหัสตำแหน่ง'
      } else if (!/^[A-Z0-9-_]+$/.test(locationForm.value.location_code)) {
        errors.location_code = 'รหัสตำแหน่งต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ ตัวเลข และ - _ เท่านั้น'
      } else if (!editingLocation.value && stockLocations.value.some(loc => loc.location_code === locationForm.value.location_code)) {
        errors.location_code = 'รหัสตำแหน่งนี้มีอยู่แล้ว'
      }
      
      if (!locationForm.value.location_name) {
        errors.location_name = 'กรุณาระบุชื่อตำแหน่ง'
      }
      
      if (!locationForm.value.zone) {
        errors.zone = 'กรุณาระบุโซน'
      }

      // ✅ ตรวจสอบว่าประเภทนี้มีอยู่แล้วหรือไม่ (ยกเว้นตอนแก้ไข)
      if (!editingLocation.value) {
        const existingType = stockLocations.value.find(
          loc => loc.location_type === locationForm.value.location_type
        )
        if (existingType) {
          errors.location_type = `ประเภท "${getLocationTypeText(locationForm.value.location_type)}" มีอยู่แล้ว (${existingType.location_name})`
        }
      }
      
      locationErrors.value = errors
      return Object.keys(errors).length === 0
    }

    const saveLocation = async () => {
      if (!validateLocationForm()) return

      savingLocation.value = true

      try {
        // ✅ Prepare data according to stock_locations schema
        const locationData = {
          ...locationForm.value,
          // Ensure required fields from schema
          location_id: locationForm.value.location_code,
          warehouse_id: 'DEFAULT', // Could be dynamic
          aisle: locationForm.value.zone,
          shelf: '',
          bin: '',
          
          // Capacity fields
          max_weight: locationForm.value.capacity_numeric || 0,
          max_volume: 0,
          weight_unit: locationForm.value.capacity_unit || 'unit',
          volume_unit: 'unit',
          
          // Current usage (will be updated by inventory movements)
          current_weight: locationForm.value.current_usage || 0,
          current_volume: 0,
          current_item_count: locationForm.value.current_usage || 0,
          
          // Location features
          temperature_min: 0,
          temperature_max: 50,
          humidity_min: 0,
          humidity_max: 100,
          
          // Management fields
          created_at: editingLocation.value ? editingLocation.value.created_at : new Date().toISOString(),
          created_by: editingLocation.value ? editingLocation.value.created_by : 'system',
          updated_at: new Date().toISOString(),
          updated_by: 'system',
          
          // Audit fields
          is_active: locationForm.value.status === 'active',
          is_deleted: false,
          version: editingLocation.value ? (editingLocation.value.version || 0) + 1 : 1
        }

        console.log('💾 Saving location data:', locationData)

        let result
        if (editingLocation.value) {
          // Update existing location via InventoryService
          result = await inventoryService.updateStockLocation(editingLocation.value.id, locationData)
        } else {
          // Create new location via InventoryService
          result = await inventoryService.createStockLocation(locationData)
        }

        if (result) {
          ERP_CORE.showNotification(
            'success', 
            editingLocation.value ? 'แก้ไขตำแหน่งเรียบร้อยแล้ว' : 'เพิ่มตำแหน่งเรียบร้อยแล้ว'
          )
          
          closeLocationModal()
          await loadData() // Reload data
        } else {
          throw new Error('Failed to save location')
        }

      } catch (error) {
        console.error('❌ Error saving location:', error)
        ERP_CORE.showNotification('error', 'เกิดข้อผิดพลาดในการบันทึกตำแหน่ง: ' + error.message)
      } finally {
        savingLocation.value = false
      }
    }

    const removeLocation = async (location) => {
      // Check if location has current usage
      if ((location.current_usage || 0) > 0) {
        ERP_CORE.showNotification('warning', 'ไม่สามารถลบตำแหน่งนี้ได้ เนื่องจากยังมีสินค้าอยู่')
        return
      }
      
      const confirmMessage = `ต้องการลบตำแหน่ง "${location.location_name}" (${location.location_code}) หรือไม่?`
      if (confirm(confirmMessage)) {
        try {
          // Delete via InventoryService
          await inventoryService.deleteStockLocation(location.id)
          
          ERP_CORE.showNotification('success', 'ลบตำแหน่งเรียบร้อยแล้ว')
          await loadData() // Reload data
          
        } catch (error) {
          console.error('❌ Error removing location:', error)
          ERP_CORE.showNotification('error', 'เกิดข้อผิดพลาดในการลบตำแหน่ง: ' + error.message)
        }
      }
    }

    const closeLocationModal = () => {
      showLocationModal.value = false
      editingLocation.value = null
      locationForm.value = {
        location_code: '',
        location_name: '',
        location_type: 'warehouse',
        zone: '',
        capacity_numeric: null,
        capacity_unit: 'pieces',
        current_usage: 0,
        description: '',
        status: 'active',
        storage_condition: 'normal',
        access_level: 'public',
        priority: 'normal',
        is_receivable: true,
        is_pickable: true,
        allow_mixing: true,
        allow_negative: false,
        parent_location: '',
        sort_order: 0,
        has_rack: false,
        rack_design: null,
        rack_side: null,
        rack_rows: null,
        rack_columns: null,
        rack_positions: null
      }
      locationErrors.value = {}
    }

    const refreshData = async () => {
      await loadData()
    }

    const openRackDesigner = (location) => {
      rackDesignLocation.value = location
      showRackDesigner.value = true
    }

    const saveRackDesign = async (rackDesign) => {
      try {
        console.log('💾 Saving rack design for location:', rackDesignLocation.value.location_code)
        console.log('📐 Rack design:', rackDesign)

        // Update location with rack design (ห้ามส่ง _id และ id)
        // eslint-disable-next-line no-unused-vars
        const { _id, id, ...locationData } = rackDesignLocation.value
        
        const updatedLocation = {
          ...locationData,
          rack_design: rackDesign,
          updated_at: new Date().toISOString(),
          updated_by: 'system'
        }

        await inventoryService.updateStockLocation(rackDesignLocation.value.id || rackDesignLocation.value._id, updatedLocation)
        
        ERP_CORE.showNotification('success', 'บันทึก Rack Design เรียบร้อยแล้ว')
        closeRackDesigner()
        await loadData()
        
      } catch (error) {
        console.error('❌ Error saving rack design:', error)
        ERP_CORE.showNotification('error', 'เกิดข้อผิดพลาดในการบันทึก Rack Design: ' + error.message)
      }
    }

    const closeRackDesigner = () => {
      showRackDesigner.value = false
      rackDesignLocation.value = null
    }

    // Initialize
    onMounted(async () => {
      // ✅ Initialize InventoryService (เหมือน AccountingSettings)
      await inventoryService.initialize(window.vueApp || { $Request: window.vueApp?.$Request, $Key: window.vueApp?.$Key })
      await loadData()
    })

    return {
      // Data
      stockLocations,
      loading,
      showLocationModal,
      editingLocation,
      savingLocation,
      locationForm,
      locationErrors,
      showRackDesigner,
      rackDesignLocation,
      
      // Computed
      activeLocationsCount,
      totalCapacity,
      utilizationPercentage,
      
      // Methods
      loadData,
      getLocationTypeText,
      getLocationTypeDescription,
      getLocationTypeIcon,
      getLocationTypeColor,
      getRackLayoutText,
      getStatusText,
      getStatusClass,
      getStorageConditionText,
      getAccessLevelText,
      getPriorityText,
      getCapacityUnitText,
      formatCapacity,
      viewLocationDetails,
      editLocation,
      saveLocation,
      removeLocation,
      closeLocationModal,
      refreshData,
      openRackDesigner,
      saveRackDesign,
      closeRackDesigner
    }
  }
}
</script>

<style scoped>
/* Loading animation */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

/* Transitions */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Custom hover effects */
.hover\:bg-gray-50:hover {
  background-color: #f9fafb;
}

.hover\:bg-blue-50:hover {
  background-color: #eff6ff;
}

.hover\:bg-green-50:hover {
  background-color: #f0fdf4;
}

.hover\:bg-red-50:hover {
  background-color: #fef2f2;
}

/* Focus styles */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.focus\:ring-blue-500:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.focus\:border-blue-500:focus {
  border-color: #3b82f6;
}

/* Utility classes for consistent spacing */
.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-x-4 > * + * {
  margin-left: 1rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>