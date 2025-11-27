<template>
  <div class="bg-white min-h-screen">
    <!-- Header Section -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'cubes']" class="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-semibold text-gray-900">จัดการ Builder Items</h1>
            <p class="text-sm text-gray-500">จัดการองค์ประกอบสำหรับ Builder System</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="showAddModal = true"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'plus']" class="mr-2 h-4 w-4" />
            เพิ่ม Item
          </button>
          <button
            @click="importMasterData"
            :disabled="importingMaster"
            class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <font-awesome-icon 
              :icon="importingMaster ? ['fas', 'spinner'] : ['fas', 'download']" 
              :class="['mr-2 h-4 w-4', { 'animate-spin': importingMaster }]" 
            />
            {{ importingMaster ? 'กำลัง Import...' : 'Import Master Data' }}
          </button>
          <button
            @click="loadItems"
            class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'sync-alt']" class="mr-2 h-4 w-4" />
            รีเฟรช
          </button>
          <button
            @click="checkAllComponents"
            :disabled="checkingComponents"
            class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <font-awesome-icon 
              :icon="checkingComponents ? ['fas', 'spinner'] : ['fas', 'search']" 
              :class="['mr-2 h-4 w-4', { 'animate-spin': checkingComponents }]" 
            />
            {{ checkingComponents ? 'กำลังเช็ค...' : 'เช็ค Components' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div class="bg-white rounded-lg p-3 shadow-sm">
          <div class="flex items-center">
            <div class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
              <font-awesome-icon :icon="['fas', 'cubes']" class="h-3 w-3 text-blue-600" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-600">รวมทั้งหมด</p>
              <p class="text-lg font-semibold text-gray-900">{{ stats.total }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg p-3 shadow-sm">
          <div class="flex items-center">
            <div class="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
              <font-awesome-icon :icon="['fas', 'check-circle']" class="h-3 w-3 text-green-600" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-600">ใช้งานได้</p>
              <p class="text-lg font-semibold text-gray-900">{{ stats.active }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg p-3 shadow-sm">
          <div class="flex items-center">
            <div class="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center mr-2">
              <font-awesome-icon :icon="['fas', 'thumbtack']" class="h-3 w-3 text-amber-600" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-600">Pinned</p>
              <p class="text-lg font-semibold text-gray-900">{{ stats.pinned }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg p-3 shadow-sm">
          <div class="flex items-center">
            <div class="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
              <font-awesome-icon :icon="['fas', 'folder']" class="h-3 w-3 text-purple-600" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-600">หมวดหมู่</p>
              <p class="text-lg font-semibold text-gray-900">{{ stats.categories }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg p-3 shadow-sm">
          <div class="flex items-center">
            <div class="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-2">
              <font-awesome-icon :icon="['fas', 'folder-open']" class="h-3 w-3 text-red-600" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-600">โฟลเดอร์</p>
              <p class="text-lg font-semibold text-gray-900">{{ stats.folders }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg p-3 shadow-sm">
          <div class="flex items-center">
            <div class="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-2">
              <font-awesome-icon :icon="['fas', 'puzzle-piece']" class="h-3 w-3 text-indigo-600" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-600">Elements</p>
              <p class="text-lg font-semibold text-gray-900">{{ stats.elements }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Tab Navigation -->
    <div class="bg-white border-b border-gray-200">
      <nav class="px-6 flex space-x-8">
        <button
          v-for="category in availableCategories"
          :key="category.name"
          @click="activeTab = category.name"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === category.name
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <font-awesome-icon :icon="['fas', category.icon || 'folder']" class="mr-2" />
          {{ category.displayName || category.name }}
          <span class="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
            {{ getItemsByCategory(category.name).length }} 
          </span>
        </button>
        <!-- ปุ่ม tab อื่น ๆ เช่น categories, manage -->
        <button
          @click="activeTab = 'categories'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'categories'
              ? 'border-green-500 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <font-awesome-icon :icon="['fas', 'tags']" class="mr-2" />
          จัดการหมวดหมู่
          <span class="ml-2 bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
            {{ availableCategories.length }}
          </span>
        </button>
        <button
          @click="activeTab = 'manage'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'manage'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <font-awesome-icon :icon="['fas', 'cogs']" class="mr-2" />
          จัดการ
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="px-6 py-4">
      <!-- Categories Management Tab -->
      <div v-if="activeTab === 'categories'" class="space-y-6">
        <!-- Categories Header -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas', 'tags']" class="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">จัดการหมวดหมู่ Builder Items</h3>
                <p class="text-sm text-gray-500">เพิ่ม แก้ไข และลบหมวดหมู่สำหรับจัดกลุ่ม Builder Items</p>
                <p class="text-sm text-gray-500">จัดการ Folder Items ที่ใช้เป็นหมวดหมู่ในระบบ</p>
              </div>
            </div>
            <button
              @click="addNewFolderCategory"
              class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'plus']" class="mr-2 h-4 w-4" />
              เพิ่มหมวดหมู่ (Folder)
            </button>
          </div>

          <!-- Categories List -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="category in availableCategories"
              :key="category._id || category.name"
              class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    :style="{ backgroundColor: category.color || '#6b7280' }"
                  >
                    <font-awesome-icon 
                      :icon="['fas', category.icon || 'folder']" 
                      class="h-5 w-5"
                    />
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">{{ category.displayName || category.name }}</h4>
                    <p class="text-xs text-gray-500">Type: {{ category.name }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-1">
                  <button
                    @click="editFolderCategory(category)"
                    class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="แก้ไข"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" class="h-3 w-3" />
                  </button>
                  <button
                    @click="deleteFolderCategory(category)"
                    :disabled="getItemsByCategory(category.name).length > 0 || isDefaultCategoryType(category.name)"
                    class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    :title="getItemsByCategory(category.name).length > 0 || isDefaultCategoryType(category.name) ? 'ไม่สามารถลบได้' : 'ลบ'"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" class="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">จำนวน Items:</span>
                  <span class="font-medium">{{ getItemsByCategory(category.name).length }}</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">สีหมวดหมู่:</span>
                  <div class="flex items-center space-x-2">
                    <div 
                      class="w-4 h-4 rounded border border-gray-300"
                      :style="{ backgroundColor: category.color || '#6b7280' }"
                    ></div>
                    <span class="font-mono text-xs">{{ category.color || '#6b7280' }}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">สถานะ:</span>
                  <span 
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ category.active ? 'ใช้งาน' : 'ปิดใช้งาน' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Default Categories Notice -->
          <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-start space-x-3">
              <font-awesome-icon :icon="['fas', 'info-circle']" class="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 class="text-sm font-medium text-blue-900">หมายเหตุ</h4>
                <p class="text-sm text-blue-700 mt-1">
                  หมวดหมู่เริ่มต้น (content, form, lesson, nav, dashboard) ไม่สามารถลบได้ แต่สามารถแก้ไขชื่อแสดงผลและสีได้
                  หมวดหมู่คือ Folder Items ที่มี isFolder: true<br>
                  - เพิ่มหมวดหมู่ = เพิ่ม Folder Item ใหม่<br>
                  - แก้ไขหมวดหมู่ = แก้ไข Folder Item<br>
                  - ลบหมวดหมู่ = ลบ Folder Item
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Management Tab -->
      <div v-if="activeTab === 'manage'" class="space-y-6">
        <!-- Import/Export Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            <font-awesome-icon :icon="['fas', 'download']" class="mr-2 text-blue-500" />
            Import/Export ข้อมูล
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 border border-gray-200 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Import Master Data</h4>
              <p class="text-sm text-gray-600 mb-4">นำเข้าข้อมูล Builder Items จาก builderItems.js</p>
              <button
                @click="importMasterData"
                :disabled="importingMaster"
                class="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <font-awesome-icon 
                  :icon="importingMaster ? ['fas', 'spinner'] : ['fas', 'download']" 
                  :class="['mr-2 h-4 w-4', { 'animate-spin': importingMaster }]" 
                />
                {{ importingMaster ? 'กำลัง Import...' : 'Import Master Data' }}
              </button>
            </div>
            <div class="p-4 border border-gray-200 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Export ข้อมูล</h4>
              <p class="text-sm text-gray-600 mb-4">ส่งออกข้อมูลปัจจุบันเป็นไฟล์ JSON</p>
              <button
                @click="exportBuilderData"
                class="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'upload']" class="mr-2 h-4 w-4" />
                Export JSON
              </button>
            </div>
          </div>
        </div>

        <!-- Bulk Actions Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            <font-awesome-icon :icon="['fas', 'tasks']" class="mr-2 text-purple-500" />
            การจัดการแบบกลุ่ม
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              @click="bulkEnableAll"
              class="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left"
            >
              <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-500 mb-2" />
              <h4 class="font-medium text-gray-900 mb-1">เปิดใช้งานทั้งหมด</h4>
              <p class="text-sm text-gray-600">เปิดใช้งาน Builder Items ทั้งหมด</p>
            </button>
            <button
              @click="bulkDisableAll"
              class="p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left"
            >
              <font-awesome-icon :icon="['fas', 'times-circle']" class="text-red-500 mb-2" />
              <h4 class="font-medium text-gray-900 mb-1">ปิดใช้งานทั้งหมด</h4>
              <p class="text-sm text-gray-600">ปิดใช้งาน Builder Items ทั้งหมด</p>
            </button>
            <button
              @click="resetSortOrder"
              class="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
            >
              <font-awesome-icon :icon="['fas', 'sort-numeric-down']" class="text-blue-500 mb-2" />
              <h4 class="font-medium text-gray-900 mb-1">จัดเรียงลำดับใหม่</h4>
              <p class="text-sm text-gray-600">จัดเรียงลำดับตามหมวดหมู่</p>
            </button>
          </div>
        </div>

        <!-- Statistics Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            <font-awesome-icon :icon="['fas', 'chart-bar']" class="mr-2 text-indigo-500" />
            สถิติการใช้งาน
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 class="font-medium text-gray-900 mb-3">จำนวนตามหมวดหมู่</h4>
              <div class="space-y-2">
                <div v-for="category in availableCategories" :key="category._id" class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">{{ category.displayName }}</span>
                  <span class="font-medium">{{ getItemsByCategory(category.name).length }}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 mb-3">สถานะการใช้งาน</h4>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">ใช้งานได้</span>
                  <span class="font-medium text-green-600">{{ stats.active }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">ปิดใช้งาน</span>
                  <span class="font-medium text-red-600">{{ stats.total - stats.active }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Pin ไว้</span>
                  <span class="font-medium text-amber-600">{{ stats.pinned }}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 mb-3">สถานะ Component Files</h4>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Elements ทั้งหมด</span>
                  <span class="font-medium">{{ stats.components.total }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">มี Component</span>
                  <span class="font-medium text-green-600">{{ stats.components.existing }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">ไม่มี Component</span>
                  <span class="font-medium text-red-600">{{ stats.components.missing }}</span>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span class="text-sm text-gray-600">ความครบถ้วน</span>
                  <div class="flex items-center space-x-2">
                    <div class="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        :style="{ width: `${stats.components.percentage}%` }"
                      ></div>
                    </div>
                    <span class="font-medium text-sm">{{ stats.components.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Items List for Category Tabs -->
      <div v-else-if="activeTab !== 'categories' && activeTab !== 'manage'">
        <!-- Filters Section (for non-manage tabs) -->
        <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">สถานะ:</label>
              <select
                v-model="selectedStatus"
                class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="true">ใช้งานได้</option>
                <option value="false">ปิดใช้งาน</option>
              </select>
            </div>
            <div class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">ประเภท:</label>
              <select
                v-model="selectedType"
                class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="folder">โฟลเดอร์</option>
                <option value="element">องค์ประกอบ</option>
              </select>
            </div>
            <div class="flex items-center space-x-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหา..."
                class="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <font-awesome-icon :icon="['fas', 'spinner']" class="h-8 w-8 text-gray-400 animate-spin" />
          <p class="text-gray-500 mt-2">กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="displayItems.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <font-awesome-icon :icon="['fas', 'cube']" class="h-8 w-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูล</h3>
          <p class="text-sm text-gray-500">ไม่มี Builder Item ที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>

        <!-- Items Grid -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            v-for="(item, index) in displayItems"
            :key="item._id || item.id"
            class="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
          >
            <!-- Item Header -->
            <div class="p-4 border-b border-gray-50">
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <div 
                    class="w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300"
                    :style="{ 
                      backgroundColor: `${getCategoryColor(item.category)}15`,
                      color: getCategoryColor(item.category)
                    }"
                  >
                    <font-awesome-icon 
                      :icon="['fas', item.icon || 'cube']" 
                      class="h-6 w-6"
                    />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div>
                      <h3 class="text-base font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {{ item.name }}
                      </h3>
                      <p class="mt-1 text-sm text-gray-500 line-clamp-2">
                        {{ item.description || 'ไม่มีคำอธิบาย' }}
                      </p>
                    </div>
                    <div class="flex items-center space-x-2 ml-4">
                      <button
                        @click="toggleStatus(item)"
                        :class="[
                          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
                          item.status ? 'bg-green-500 focus:ring-green-500' : 'bg-gray-200 focus:ring-gray-500'
                        ]"
                      >
                        <span
                          :class="[
                            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                            item.status ? 'translate-x-5' : 'translate-x-0'
                          ]"
                        />
                      </button>
                      <button
                        @click="togglePin(item)"
                        :class="[
                          'p-1.5 rounded-lg transition-all duration-200',
                          item.pin 
                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                            : 'text-gray-400 hover:bg-gray-50'
                        ]"
                      >
                        <font-awesome-icon :icon="['fas', 'thumbtack']" class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Item Details -->
            <div class="px-4 py-3 bg-gray-50 bg-opacity-50">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">Type:</span>
                    <code class="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-700">
                      {{ item.type }}
                    </code>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">หมวดหมู่:</span>
                    <span 
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :style="{ 
                        backgroundColor: `${getCategoryColor(item.category)}15`,
                        color: getCategoryColor(item.category)
                      }"
                    >
                      {{ getCategoryDisplayName(item.category) }}
                    </span>
                  </div>
                </div>
                <div class="space-y-2">
                  <!-- Component Status -->
                  <div v-if="!item.isFolder" class="flex items-center justify-between">
                    <span class="text-gray-600">Component:</span>
                    <div class="flex items-center space-x-1.5">
                      <span 
                        :class="[
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          getComponentStatus(item.type).exists 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        ]"
                      >
                        <font-awesome-icon 
                          :icon="['fas', getComponentStatus(item.type).exists ? 'check-circle' : 'times-circle']" 
                          class="w-3 h-3 mr-1" 
                        />
                        {{ getComponentStatus(item.type).exists ? 'มี' : 'ไม่มี' }}
                      </span>
                      <button
                        v-if="getComponentStatus(item.type).exists"
                        @click="openComponentFile(getComponentStatus(item.type).path)"
                        class="text-blue-500 hover:text-blue-700 transition-colors"
                        title="ดูไฟล์ component"
                      >
                        <font-awesome-icon :icon="['fas', 'external-link-alt']" class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600">ลำดับ:</span>
                    <div class="flex items-center bg-white rounded-lg border border-gray-200">
                      <button
                        @click="moveUp(index)"
                        :disabled="index === 0"
                        class="px-1.5 py-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-200"
                      >
                        <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-3 w-3" />
                      </button>
                      <span class="px-2 py-0.5 text-xs font-medium text-gray-700">
                        {{ item.sort_order || index + 1 }}
                      </span>
                      <button
                        @click="moveDown(index)"
                        :disabled="index === displayItems.length - 1"
                        class="px-1.5 py-0.5 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed border-l border-gray-200"
                      >
                        <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Item Actions -->
            <div class="px-4 py-3 bg-gray-50 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                @click="editItem(item)"
                class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                title="แก้ไข"
              >
                <font-awesome-icon :icon="['fas', 'edit']" class="h-3.5 w-3.5 mr-1" />
                แก้ไข
              </button>
              <button
                @click="duplicateItem(item)"
                class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                title="คัดลอก"
              >
                <font-awesome-icon :icon="['fas', 'copy']" class="h-3.5 w-3.5 mr-1" />
                คัดลอก
              </button>
              <button
                @click="deleteItem(item)"
                class="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                title="ลบ"
              >
                <font-awesome-icon :icon="['fas', 'trash']" class="h-3.5 w-3.5 mr-1" />
                ลบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-2xl shadow-xl border border-gray-200 rounded-lg overflow-hidden">
        <div class="bg-white border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              {{ showAddModal ? 'เพิ่ม Builder Item' : 'แก้ไข Builder Item' }}
            </h3>
            <button 
              @click="closeModal" 
              class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md p-1"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <form @submit.prevent="saveItem" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ Item</label>
                <input
                  v-model="itemForm.name"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  v-model="itemForm.type"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
              <textarea
                v-model="itemForm.description"
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                <select
                  v-model="itemForm.category"
                  required
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  <option v-for="category in availableCategories" :key="category._id" :value="category.name">
                    {{ category.displayName }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  v-model="itemForm.icon"
                  type="text"
                  placeholder="ชื่อ icon (เช่น cube, image)"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex items-center">
                <input
                  v-model="itemForm.status"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label class="ml-2 text-sm text-gray-700">ใช้งานได้</label>
              </div>
              <div class="flex items-center">
                <input
                  v-model="itemForm.pin"
                  type="checkbox"
                  class="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label class="ml-2 text-sm text-gray-700">Pin ไว้</label>
              </div>
              <div class="flex items-center">
                <input
                  v-model="itemForm.isFolder"
                  type="checkbox"
                  class="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label class="ml-2 text-sm text-gray-700">เป็นโฟลเดอร์</label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ลำดับการแสดงผล</label>
              <input
                v-model="itemForm.sort_order"
                type="number"
                min="0"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>
        </div>

        <div class="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            @click="closeModal"
            type="button"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            @click="saveItem"
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {{ showAddModal ? 'เพิ่ม' : 'บันทึก' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <div v-if="showCategoryModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-lg shadow-xl border border-gray-200 rounded-lg overflow-hidden">
        <div class="bg-white border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              {{ editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่' }}
            </h3>
            <button 
              @click="closeCategoryModal" 
              class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md p-1"
            >
              <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div class="px-6 py-4">
          <form @submit.prevent="saveCategory" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อหมวดหมู่ (Key)</label>
              <input
                v-model="categoryForm.name"
                type="text"
                required
                :disabled="editingCategory && isDefaultCategory(editingCategory.name)"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="เช่น custom_category"
              />
              <p class="text-xs text-gray-500 mt-1">ใช้สำหรับระบบ (ภาษาอังกฤษ, ไม่มีช่องว่าง)</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อแสดงผล</label>
              <input
                v-model="categoryForm.displayName"
                type="text"
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="เช่น หมวดหมู่พิเศษ"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
              <textarea
                v-model="categoryForm.description"
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="อธิบายหมวดหมู่นี้"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  v-model="categoryForm.icon"
                  type="text"
                  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="เช่น star, cog"
                />
                <p class="text-xs text-gray-500 mt-1">ชื่อ FontAwesome icon</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">สี</label>
                <div class="flex items-center space-x-2">
                  <input
                    v-model="categoryForm.color"
                    type="color"
                    class="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    v-model="categoryForm.color"
                    type="text"
                    class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="#6b7280"
                  />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ลำดับการแสดงผล</label>
              <input
                v-model="categoryForm.sortOrder"
                type="number"
                min="0"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div class="flex items-center">
              <input
                v-model="categoryForm.active"
                type="checkbox"
                class="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label class="ml-2 text-sm text-gray-700">เปิดใช้งาน</label>
            </div>
          </form>
        </div>

        <div class="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            @click="closeCategoryModal"
            type="button"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            @click="saveCategory"
            type="submit"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            {{ editingCategory ? 'บันทึก' : 'เพิ่ม' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance, watch } from 'vue';
import storageManager from '@/plugins/storage';
import { getHierarchicalItems } from '@/interface/template/builder/plugin/builderItems.js';

// Instance และ Config
const instance = getCurrentInstance();
const configs = ref(storageManager.get('configs'));

// Reactive Data
const items = ref([]);
const loading = ref(false);
const importingMaster = ref(false);
const checkingComponents = ref(false);
const componentStatus = ref(new Map()); // Map to store component file status
const activeTab = ref('all');
const selectedStatus = ref('');
const selectedType = ref('');
const searchQuery = ref('');

// Modal States
const showAddModal = ref(false);
const showEditModal = ref(false);
const editingItem = ref(null);

// Category Management
const categories = ref([]);
const showCategoryModal = ref(false);
const editingCategory = ref(null);

// Form Data
const itemForm = ref({
  name: '',
  type: '',
  description: '',
  category: '',
  icon: '',
  status: true,
  pin: false,
  isFolder: false,
  sort_order: 0
});

// Category Form Data
const categoryForm = ref({
  name: '',
  displayName: '',
  description: '',
  icon: '',
  color: '#6b7280',
  sortOrder: 0,
  active: true
});

// Available Categories (now from folder items)
const availableCategories = computed(() => {
  // แสดงเฉพาะ folder items ที่เป็นหมวดหมู่จริง
  return items.value
    .filter(item => item.isFolder === true && item.status !== false)
    .map(folder => ({
      name: folder.category, // ใช้ key จริง (เช่น 'content')
      displayName: folder.name, // ชื่อที่แสดงผล (เช่น 'เนื้อหา - 2')
      description: folder.description,
      icon: folder.icon || 'folder',
      color: '#6b7280', // สามารถปรับให้ดึงจาก folder ได้ถ้ามี
      sortOrder: folder.sort_order || 0,
      active: folder.status,
      _id: folder._id
    }))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
});

// Component Registry and Caching
const componentRegistry = ref(new Map());
const registryLoaded = ref(false);

// Initialize component registry with auto-discovery
async function initializeComponentRegistry() {
  if (registryLoaded.value) return;

  try {
    // Vite: ใช้ import.meta.glob
    if (typeof import.meta.glob === 'function') {
      const componentFiles = import.meta.glob('@/interface/template/builder/element/*.vue');
      const discoveredComponents = Object.keys(componentFiles).map(path => {
        return path.split('/').pop().replace('.vue', '');
      });
      discoveredComponents.forEach(name => {
        componentRegistry.value.set(name, {
          exists: true,
          path: `/src/interface/template/builder/element/${name}.vue`,
          discoveryMethod: 'auto'
        });
      });
      registryLoaded.value = true;
      return;
    }

    // Webpack: Use dynamic imports instead of require.context to avoid critical dependency warning
    try {
      // Define known component files to avoid dynamic require
      const knownComponents = [
        'TextInput', 'TextArea', 'Button', 'Image', 'Video', 'Audio',
        'List', 'Table', 'Form', 'Card', 'Modal', 'Tabs', 'Accordion'
      ];
      
      for (const componentName of knownComponents) {
        try {
          // Use dynamic import instead of require
          await import(`@/interface/template/builder/element/${componentName}.vue`);
          componentRegistry.value.set(componentName, {
            exists: true,
            path: `/src/interface/template/builder/element/${componentName}.vue`,
            discoveryMethod: 'predefined'
          });
        } catch (importError) {
          // Component doesn't exist, that's ok
        }
      }
      registryLoaded.value = true;
      return;
    } catch (error) {
      console.log('Dynamic import not available, using fallback');
    }

    // fallback: ไม่พบไฟล์
    registryLoaded.value = true;
  } catch (error) {
    console.error('Error initializing component registry:', error);
    registryLoaded.value = true;
  }
}

// Computed Properties
const stats = computed(() => {
  const total = items.value.length;
  const active = items.value.filter(item => item.status === true).length;
  const pinned = items.value.filter(item => item.pin === true).length;
  const categories = new Set(items.value.map(item => item.category)).size;
  const folders = items.value.filter(item => item.isFolder === true).length;
  const elements = items.value.filter(item => item.isFolder !== true).length;
  
  // Component statistics
  const componentStats = getComponentsStatistics();
  
  return { 
    total, 
    active, 
    pinned, 
    categories, 
    folders, 
    elements,
    components: componentStats
  };
});

const displayItems = computed(() => {
  let filtered = [...items.value];

  // Filter by active tab (category)
  if (
    activeTab.value !== 'all' &&
    activeTab.value !== 'manage' &&
    activeTab.value !== 'categories'
  ) {
    filtered = filtered.filter(item => item.category === activeTab.value);
  }

  // Filter by status
  if (selectedStatus.value !== '') {
    const statusBool = selectedStatus.value === 'true';
    filtered = filtered.filter(item => item.status === statusBool);
  }

  // Filter by type (folder/element)
  if (selectedType.value !== '') {
    if (selectedType.value === 'folder') {
      filtered = filtered.filter(item => item.isFolder === true);
    } else if (selectedType.value === 'element') {
      filtered = filtered.filter(item => item.isFolder !== true);
    }
  }

  // **เพิ่ม filter นี้เพื่อไม่แสดง isFolder = true**
  filtered = filtered.filter(item => item.isFolder !== true);

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
  }

  return filtered.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
});

// Helper function to get items by category
function getItemsByCategory(category) {
  return items.value.filter(item => item.category === category);
}

// API Functions
async function loadItems() {
  try {
    loading.value = true;
    
    // Initialize component registry first
    await initializeComponentRegistry();
    
    const queryBody = {
      method: 'find',
      args: [{}],
      sort: { sort_order: 1, created_at: -1 },
      paging: { page: 1, limit: 1000 }
    };

    const response = await fetch("https://gateway.cloudrestfulapi.com/api/builder_item/query", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'client-token-key': configs.value.key 
      },
      body: JSON.stringify(queryBody)
    });

    if (response.ok) {
      const data = await response.json();
      items.value = data.data || [];
      console.log('Loaded builder items:', items.value.length);
      
      // Auto-check components after loading items (will be fast due to registry)
      setTimeout(() => {
        checkAllComponents();
      }, 500);
    } else {
      throw new Error(`API Error: ${response.status}`);
    }
  } catch (error) {
    console.error('Error loading items:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
  } finally {
    loading.value = false;
  }
}

async function importMasterData() {
  if (!confirm('คุณต้องการ Import Master Data จาก builderItems.js หรือไม่?\n\nข้อมูลที่มีอยู่จะไม่ถูกลบ แต่จะอัปเดตหากมี type ซ้ำกัน')) {
    return;
  }

  try {
    importingMaster.value = true;
    showToast('info', 'เริ่มต้น Import Master Data...');

    // Get hierarchical items from API and convert to flat array
    const hierarchicalItems = await getHierarchicalItems();
    const flatItems = convertHierarchicalToFlat(hierarchicalItems);
    console.log('Converted items:', flatItems.length);

    let successCount = 0;
    let errorCount = 0;
    let updateCount = 0;

    // Import items one by one to handle duplicates properly
    for (const item of flatItems) {
      try {
        // Check if item with same type exists
        const existingItem = await findExistingItemByType(item.type);
        
        if (existingItem) {
          // Update existing item - exclude _id from update data
          const updateData = {
            name: item.name,
            type: item.type,
            description: item.description,
            category: item.category,
            icon: item.icon,
            status: item.status,
            pin: item.pin,
            isFolder: item.isFolder,
            sort_order: item.sort_order,
            updated_at: new Date().toISOString()
          };

          const response = await instance.appContext.config.globalProperties.$Request.PUT(
            `builder_item/${existingItem._id}`,
            { data: updateData, options: {} },
            configs.value.key
          );

          if (response.status === 200) {
            updateCount++;
            console.log(`Updated item: ${item.type}`);
          }
        } else {
          // Create new item
          const newData = {
            ...item,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const response = await instance.appContext.config.globalProperties.$Request.POST(
            'builder_item',
            { data: newData, options: {} },
            configs.value.key
          );

          if (response.status === 200) {
            successCount++;
            console.log(`Created item: ${item.type}`);
          }
        }
      } catch (error) {
        console.error(`Error importing item ${item.type}:`, error);
        errorCount++;
      }
    }

    // Show summary
    const summary = [];
    if (successCount > 0) summary.push(`สร้างใหม่: ${successCount}`);
    if (updateCount > 0) summary.push(`อัปเดต: ${updateCount}`);
    if (errorCount > 0) summary.push(`ข้อผิดพลาด: ${errorCount}`);

    showToast('success', `Import เสร็จสิ้น! ${summary.join(', ')}`);
    
    // Reload items to show updated data
    await loadItems();

  } catch (error) {
    console.error('Error importing master data:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการ Import Master Data');
  } finally {
    importingMaster.value = false;
  }
}

function convertHierarchicalToFlat(hierarchicalItems) {
  const flatItems = [];
  let sortOrder = 1;

  hierarchicalItems.forEach((folder) => {
    // Add folder as an item
    const folderItem = {
      id: folder.id,
      name: folder.name,
      description: folder.description,
      icon: folder.icon,
      type: folder.type || 'folder',
      category: folder.category,
      isFolder: true,
      pin: false,
      status: true,
      sort_order: sortOrder++,
      parent: null,
      // Additional folder properties
      mobile: true,
      tablet: true,
      laptop: true,
      desktop: true,
      position: 'relative',
      customClass: '',
      customId: ''
    };
    
    flatItems.push(folderItem);

    // Add children
    if (folder.children && Array.isArray(folder.children)) {
      folder.children.forEach((child) => {
        const childItem = {
          // Copy all properties from child
          ...child,
          sort_order: sortOrder++,
          parent: folder.id,
          isFolder: false,
          // Ensure required fields have defaults
          pin: child.pin || false,
          status: child.status !== undefined ? child.status : true,
          mobile: child.mobile !== undefined ? child.mobile : true,
          tablet: child.tablet !== undefined ? child.tablet : true,
          laptop: child.laptop !== undefined ? child.laptop : true,
          desktop: child.desktop !== undefined ? child.desktop : true,
          position: child.position || 'relative',
          customClass: child.customClass || '',
          customId: child.customId || '',
          // Remove Vue-specific properties if any
          elements: child.elements || [],
          options: child.options || []
        };

        flatItems.push(childItem);
      });
    }
  });

  return flatItems;
}

async function findExistingItemByType(type) {
  try {
    const queryBody = {
      method: 'findOne',
      args: [{ type: type }]
    };

    const response = await fetch("https://gateway.cloudrestfulapi.com/api/builder_item/query", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'client-token-key': configs.value.key 
      },
      body: JSON.stringify(queryBody)
    });

    if (response.ok) {
      const data = await response.json();
      return data.data || null;
    }
    return null;
  } catch (error) {
    console.error('Error finding existing item:', error);
    return null;
  }
}

async function saveItem() {
  try {
    // Create a copy and exclude _id to avoid immutable field error
    const itemData = {
      name: itemForm.value.name,
      type: itemForm.value.type,
      description: itemForm.value.description,
      category: itemForm.value.category,
      icon: itemForm.value.icon,
      status: itemForm.value.status,
      pin: itemForm.value.pin,
      isFolder: itemForm.value.isFolder,
      sort_order: itemForm.value.sort_order,
      updated_at: new Date().toISOString()
    };

    if (showAddModal.value) {
      // Create new item
      itemData.created_at = new Date().toISOString();
      
      const response = await instance.appContext.config.globalProperties.$Request.POST(
        'builder_item',
        { data: itemData, options: {} },
        configs.value.key
      );

      if (response.status === 200) {
        showToast('success', 'เพิ่ม Builder Item สำเร็จแล้ว');
        closeModal();
        loadItems();
      }
    } else {
      // Update existing item - exclude _id from data
      const response = await instance.appContext.config.globalProperties.$Request.PUT(
        `builder_item/${editingItem.value._id}`,
        { data: itemData, options: {} },
        configs.value.key
      );

      if (response.status === 200) {
        showToast('success', 'แก้ไข Builder Item สำเร็จแล้ว');
        closeModal();
        loadItems();
      }
    }
  } catch (error) {
    console.error('Error saving item:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการบันทึก');
  }
}

async function deleteItem(item) {
  if (!confirm(`คุณต้องการลบ "${item.name}" หรือไม่?`)) {
    return;
  }

  try {
    const response = await instance.appContext.config.globalProperties.$Request.DELETE(
      `builder_item/${item._id}`,
      configs.value.key
    );

    if (response.status === 200) {
      showToast('success', 'ลบ Builder Item สำเร็จแล้ว');
      loadItems();
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการลบ');
  }
}

async function duplicateItem(item) {
  try {
    // Exclude _id from duplicated data to avoid immutable field error
    const duplicatedData = {
      name: `${item.name} (Copy)`,
      type: item.type,
      description: item.description,
      category: item.category,
      icon: item.icon,
      status: item.status,
      pin: item.pin,
      isFolder: item.isFolder,
      sort_order: item.sort_order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const response = await instance.appContext.config.globalProperties.$Request.POST(
      'builder_item',
      { data: duplicatedData, options: {} },
      configs.value.key
    );

    if (response.status === 200) {
      showToast('success', 'คัดลอก Builder Item สำเร็จแล้ว');
      loadItems();
    }
  } catch (error) {
    console.error('Error duplicating item:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการคัดลอก');
  }
}

async function toggleStatus(item) {
  try {
    // Create update data without _id
    const updatedData = {
      name: item.name,
      type: item.type,
      description: item.description,
      category: item.category,
      icon: item.icon,
      status: !item.status,
      pin: item.pin,
      isFolder: item.isFolder,
      sort_order: item.sort_order,
      updated_at: new Date().toISOString()
    };

    const response = await instance.appContext.config.globalProperties.$Request.PUT(
      `builder_item/${item._id}`,
      { data: updatedData, options: {} },
      configs.value.key
    );

    if (response.status === 200) {
      item.status = !item.status;
      showToast('success', `${item.status ? 'เปิด' : 'ปิด'}ใช้งาน "${item.name}" แล้ว`);
    }
  } catch (error) {
    console.error('Error toggling status:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
  }
}

async function togglePin(item) {
  try {
    // Create update data without _id
    const updatedData = {
      name: item.name,
      type: item.type,
      description: item.description,
      category: item.category,
      icon: item.icon,
      status: item.status,
      pin: !item.pin,
      isFolder: item.isFolder,
      sort_order: item.sort_order,
      updated_at: new Date().toISOString()
    };

    const response = await instance.appContext.config.globalProperties.$Request.PUT(
      `builder_item/${item._id}`,
      { data: updatedData, options: {} },
      configs.value.key
    );

    if (response.status === 200) {
      item.pin = !item.pin;
      showToast('success', `${item.pin ? 'Pin' : 'Unpin'} "${item.name}" แล้ว`);
    }
  } catch (error) {
    console.error('Error toggling pin:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการเปลี่ยน Pin');
  }
}

async function moveUp(index) {
  if (index === 0) return;
  
  const currentItem = displayItems.value[index];
  const prevItem = displayItems.value[index - 1];
  
  // Swap sort_order
  const tempOrder = currentItem.sort_order || index;
  currentItem.sort_order = prevItem.sort_order || (index - 1);
  prevItem.sort_order = tempOrder;
  
  await updateSortOrder(currentItem);
  await updateSortOrder(prevItem);
  await loadItems();
}

async function moveDown(index) {
  if (index === displayItems.value.length - 1) return;
  
  const currentItem = displayItems.value[index];
  const nextItem = displayItems.value[index + 1];
  
  // Swap sort_order
  const tempOrder = currentItem.sort_order || index;
  currentItem.sort_order = nextItem.sort_order || (index + 1);
  nextItem.sort_order = tempOrder;
  
  await updateSortOrder(currentItem);
  await updateSortOrder(nextItem);
  await loadItems();
}

async function updateSortOrder(item) {
  try {
    // Create update data without _id
    const updatedData = {
      name: item.name,
      type: item.type,
      description: item.description,
      category: item.category,
      icon: item.icon,
      status: item.status,
      pin: item.pin,
      isFolder: item.isFolder,
      sort_order: item.sort_order,
      updated_at: new Date().toISOString()
    };

    await instance.appContext.config.globalProperties.$Request.PUT(
      `builder_item/${item._id}`,
      { data: updatedData, options: {} },
      configs.value.key
    );
  } catch (error) {
    console.error('Error updating sort order:', error);
  }
}

// Modal Functions
function editItem(item) {
  editingItem.value = item;
  itemForm.value = { ...item };
  showEditModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  showEditModal.value = false;
  editingItem.value = null;
  itemForm.value = {
    name: '',
    type: '',
    description: '',
    category: '',
    icon: '',
    status: true,
    pin: false,
    isFolder: false,
    sort_order: 0
  };
}

// Utility Functions
function getCategoryDisplayName(category) {
  const categoryObj = categories.value.find(cat => cat.name === category);
  return categoryObj?.displayName || category;
}

function getCategoryColor(category) {
  // Find from availableCategories (which now includes folder items)
  const categoryObj = availableCategories.value.find(cat => cat.name === category);
  return categoryObj?.color || '#6b7280';
}

function getComponentsStatistics() {
  const totalElements = items.value.filter(item => !item.isFolder && item.type !== 'folder').length;
  const existingComponents = Array.from(componentStatus.value.values()).filter(status => status.exists).length;
  const missingComponents = totalElements - existingComponents;
  
  return {
    total: totalElements,
    existing: existingComponents,
    missing: missingComponents,
    percentage: totalElements > 0 ? Math.round((existingComponents / totalElements) * 100) : 0
  };
}

function getComponentStatus(elementType) {
  return componentStatus.value.get(elementType) || { exists: false, path: null };
}

function openComponentFile(path) {
  if (path) {
    // Open the component file in a new tab/window
    // This could be enhanced to open in an IDE or editor
    showToast('info', `ไฟล์ component: ${path}`);
    console.log('Component file path:', path);
  }
}

function showToast(type, message) {
  const toast = instance.appContext.config.globalProperties.$Toast({
    type: type,
    message: message
  });
  setTimeout(() => {
    toast.hide();
  }, 2000);
}

// Lifecycle
onMounted(() => {
  loadItems(); // โหลดเฉพาะ items (folder จะเป็นหมวดหมู่)
});

// Management Tab Functions
async function exportBuilderData() {
  try {
    const exportData = {
      metadata: {
        title: 'Builder Items Export',
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        totalItems: items.value.length,
        totalCategories: categories.value.length
      },
      categories: categories.value,
      items: items.value
    };

    const fileName = `builder_items_${new Date().toISOString().split('T')[0]}.json`;
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(dataBlob);
    downloadLink.download = fileName;
    downloadLink.style.display = 'none';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    showToast('success', `ส่งออกข้อมูลสำเร็จ: ${fileName}`);
  } catch (error) {
    console.error('Error exporting data:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการส่งออกข้อมูล');
  }
}

async function bulkEnableAll() {
  if (!confirm('คุณต้องการเปิดใช้งาน Builder Items ทั้งหมดหรือไม่?')) {
    return;
  }

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const item of items.value) {
      if (!item.status) {
        try {
          // Create update data without _id
          const updatedData = {
            name: item.name,
            type: item.type,
            description: item.description,
            category: item.category,
            icon: item.icon,
            status: true,
            pin: item.pin,
            isFolder: item.isFolder,
            sort_order: item.sort_order,
            updated_at: new Date().toISOString()
          };

          const response = await instance.appContext.config.globalProperties.$Request.PUT(
            `builder_item/${item._id}`,
            { data: updatedData, options: {} },
            configs.value.key
          );

          if (response.status === 200) {
            item.status = true;
            successCount++;
          }
        } catch (error) {
          console.error(`Error enabling item ${item.name}:`, error);
          errorCount++;
        }
      }
    }

    if (successCount > 0) {
      showToast('success', `เปิดใช้งานสำเร็จ ${successCount} รายการ${errorCount > 0 ? `, ข้อผิดพลาด ${errorCount} รายการ` : ''}`);
    } else {
      showToast('info', 'ไม่มีรายการที่ต้องเปิดใช้งาน');
    }
  } catch (error) {
    console.error('Error in bulk enable:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการเปิดใช้งานแบบกลุ่ม');
  }
}

async function bulkDisableAll() {
  if (!confirm('คุณต้องการปิดใช้งาน Builder Items ทั้งหมดหรือไม่?\n\nการทำเช่นนี้อาจส่งผลต่อการทำงานของ Builder System')) {
    return;
  }

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const item of items.value) {
      if (item.status) {
        try {
          // Create update data without _id
          const updatedData = {
            name: item.name,
            type: item.type,
            description: item.description,
            category: item.category,
            icon: item.icon,
            status: false,
            pin: item.pin,
            isFolder: item.isFolder,
            sort_order: item.sort_order,
            updated_at: new Date().toISOString()
          };

          const response = await instance.appContext.config.globalProperties.$Request.PUT(
            `builder_item/${item._id}`,
            { data: updatedData, options: {} },
            configs.value.key
          );

          if (response.status === 200) {
            item.status = false;
            successCount++;
          }
        } catch (error) {
          console.error(`Error disabling item ${item.name}:`, error);
          errorCount++;
        }
      }
    }

    if (successCount > 0) {
      showToast('success', `ปิดใช้งานสำเร็จ ${successCount} รายการ${errorCount > 0 ? `, ข้อผิดพลาด ${errorCount} รายการ` : ''}`);
    } else {
      showToast('info', 'ไม่มีรายการที่ต้องปิดใช้งาน');
    }
  } catch (error) {
    console.error('Error in bulk disable:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการปิดใช้งานแบบกลุ่ม');
  }
}

async function resetSortOrder() {
  if (!confirm('คุณต้องการจัดเรียงลำดับใหม่ตามหมวดหมู่หรือไม่?\n\nการทำเช่นนี้จะเปลี่ยนลำดับการแสดงผลทั้งหมด')) {
    return;
  }

  try {
    const categoryOrder = ['content', 'form', 'lesson', 'nav', 'dashboard'];
    let sortOrder = 1;
    let successCount = 0;
    let errorCount = 0;

    // Sort items by category order, then by folder first, then by name
    const sortedItems = [...items.value].sort((a, b) => {
      const categoryA = categoryOrder.indexOf(a.category);
      const categoryB = categoryOrder.indexOf(b.category);
      
      // First sort by category
      if (categoryA !== categoryB) {
        return (categoryA === -1 ? 999 : categoryA) - (categoryB === -1 ? 999 : categoryB);
      }
      
      // Then sort folders first
      if (a.isFolder !== b.isFolder) {
        return a.isFolder ? -1 : 1;
      }
      
      // Finally sort by name
      return a.name.localeCompare(b.name);
    });

    // Update sort_order for each item
    for (const item of sortedItems) {
      try {
        // Create update data without _id
        const updatedData = {
          name: item.name,
          type: item.type,
          description: item.description,
          category: item.category,
          icon: item.icon,
          status: item.status,
          pin: item.pin,
          isFolder: item.isFolder,
          sort_order: sortOrder++,
          updated_at: new Date().toISOString()
        };

        const response = await instance.appContext.config.globalProperties.$Request.PUT(
          `builder_item/${item._id}`,
          { data: updatedData, options: {} },
          configs.value.key
        );

        if (response.status === 200) {
          successCount++;
        }
      } catch (error) {
        console.error(`Error updating sort order for item ${item.name}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      showToast('success', `จัดเรียงลำดับสำเร็จ ${successCount} รายการ${errorCount > 0 ? `, ข้อผิดพลาด ${errorCount} รายการ` : ''}`);
      await loadItems(); // Reload to show new order
    } else {
      showToast('error', 'ไม่สามารถจัดเรียงลำดับได้');
    }
  } catch (error) {
    console.error('Error resetting sort order:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการจัดเรียงลำดับ');
  }
}

// Enhanced component checking with caching
async function checkComponentFile(elementType) {
  try {
    // Initialize registry if not loaded
    if (!registryLoaded.value) {
      await initializeComponentRegistry();
    }
    
    // Check registry first (fast)
    if (componentRegistry.value.has(elementType)) {
      const registryEntry = componentRegistry.value.get(elementType);
      console.log(`Component ${elementType} found in registry:`, registryEntry.discoveryMethod);
      return registryEntry;
    }
    
    // If not in registry, try dynamic import (slower but more accurate)
    try {
      await import(/* webpackChunkName: "element-[request]" */ `@/interface/template/builder/element/${elementType}.vue`);
      
      const result = { 
        exists: true, 
        path: `/src/interface/template/builder/element/${elementType}.vue`,
        discoveryMethod: 'dynamic'
      };
      
      // Cache the result
      componentRegistry.value.set(elementType, result);
      console.log(`Component ${elementType} discovered dynamically and cached`);
      
      return result;
    } catch (importError) {
      // Component doesn't exist
      const result = { exists: false, path: null, discoveryMethod: 'failed' };
      
      // Cache negative result too (to avoid repeated checks)
      componentRegistry.value.set(elementType, result);
      console.log(`Component ${elementType} not found, cached negative result`);
      
      return result;
    }
    
  } catch (error) {
    console.error(`Error checking component for ${elementType}:`, error);
    return { exists: false, path: null, discoveryMethod: 'error' };
  }
}

async function checkAllComponents() {
  try {
    checkingComponents.value = true;
    componentStatus.value.clear();
    
    const elements = items.value.filter(item => !item.isFolder && item.type !== 'folder');
    
    for (const element of elements) {
      const status = await checkComponentFile(element.type);
      componentStatus.value.set(element.type, status);
    }
    
    console.log('Component check completed:', componentStatus.value);
    showToast('success', `เช็คไฟล์ component เสร็จสิ้น: ${elements.length} รายการ`);
  } catch (error) {
    console.error('Error checking components:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการเช็คไฟล์ component');
  } finally {
    checkingComponents.value = false;
  }
}

async function saveCategory() {
  try {
    const categoryData = {
      name: categoryForm.value.displayName,
      description: categoryForm.value.description,
      icon: categoryForm.value.icon,
      color: categoryForm.value.color,
      sort_order: categoryForm.value.sortOrder,
      status: categoryForm.value.active,
      isFolder: true,
      type: categoryForm.value.name,
      updated_at: new Date().toISOString()
    };

    // ใช้ _id จาก editingCategory โดยตรง (robust)
    let folderItem = null;
    if (editingCategory.value && editingCategory.value._id) {
      folderItem = items.value.find(item => item._id === editingCategory.value._id);
    }
    // fallback เดิม
    if (!folderItem) {
      folderItem = items.value.find(item => item.isFolder && item.type === categoryForm.value.name);
    }

    if (editingCategory.value && folderItem) {
      // อัปเดต folder item
      const response = await instance.appContext.config.globalProperties.$Request.PUT(
        `builder_item/${folderItem._id}`,
        { data: categoryData, options: {} },
        configs.value.key
      );

      if (response.status === 200) {
        showToast('success', 'แก้ไขหมวดหมู่สำเร็จแล้ว');
        closeCategoryModal();
        await loadItems();
        await loadCategories();
      }
    } else {
      // เพิ่มหมวดหมู่ใหม่ (สร้าง folder item ใหม่)
      categoryData.created_at = new Date().toISOString();
      categoryData.isFolder = true;
      categoryData.status = true;

      const response = await instance.appContext.config.globalProperties.$Request.POST(
        'builder_item',
        { data: categoryData, options: {} },
        configs.value.key
      );

      if (response.status === 200) {
        showToast('success', 'เพิ่มหมวดหมู่สำเร็จแล้ว');
        closeCategoryModal();
        await loadItems();
        await loadCategories();
      }
    }
  } catch (error) {
    console.error('Error saving category:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการบันทึกหมวดหมู่');
  }
}

// Lifecycle
onMounted(() => {
  loadCategories(); // โหลดหมวดหมู่ก่อน
  loadItems();
});

// Category Management Functions
async function loadCategories() {
  try {
    const queryBody = {
      method: 'find',
      args: [{ isFolder: true }],
      sort: { sort_order: 1, created_at: -1 },
      paging: { page: 1, limit: 100 }
    };

    const response = await fetch("https://gateway.cloudrestfulapi.com/api/builder_item/query", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-token-key': configs.value.key
      },
      body: JSON.stringify(queryBody)
    });

    if (response.ok) {
      const data = await response.json();
      const loadedCategories = (data.data || []).map(folder => ({
        name: folder.type,
        displayName: folder.name,
        description: folder.description || '',
        icon: folder.icon || 'folder',
        color: folder.color || '#6b7280',
        sortOrder: folder.sort_order || 0,
        active: folder.status !== false,
        _id: folder._id
      }));
      categories.value = loadedCategories;
      console.log('Loaded categories:', categories.value.length);
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    categories.value = [];
  }
}


// 2. Remove hardcode default category logic

function isDefaultCategory() {
  return false;
}
function isDefaultCategoryType() {
  return false;
}

// 3. Dynamic Tab Navigation (template)
// (แทนที่ button tab เดิมด้วย v-for)
// <nav class="px-6 flex space-x-8">
//   <button
//     v-for="category in availableCategories"
//     :key="category.name"
//     @click="activeTab = category.name"
//     :class="[ ... ]"
//   >
//     <font-awesome-icon :icon="['fas', category.icon || 'folder']" class="mr-2" />
//     {{ category.displayName || category.name }}
//     <span class="ml-2 ...">{{ getItemsByCategory(category.name).length }}</span>
//   </button>
//   ... (tab อื่น ๆ เช่น categories, manage)
// </nav>
// ... existing code ...

function closeCategoryModal() {
  showCategoryModal.value = false;
  editingCategory.value = null;
  categoryForm.value = {
    name: '',
    displayName: '',
    description: '',
    icon: '',
    color: '#6b7280',
    sortOrder: 0,
    active: true
  };
}

function editFolderCategory(category) {
  // หาใน categories.value ก่อน ถ้าไม่เจอใช้ category ที่ส่งมา
  let cat = categories.value.find(cat => cat.name === category.name);
  if (!cat) cat = category;
  if (cat) {
    editingCategory.value = cat;
    categoryForm.value = {
      name: cat.name,
      displayName: cat.displayName,
      description: cat.description || '',
      icon: cat.icon || 'folder',
      color: cat.color || '#6b7280',
      sortOrder: cat.sortOrder || 0,
      active: cat.active !== false
    };
    showCategoryModal.value = true;
  }
}

async function deleteFolderCategory(category) {
  // ตรวจสอบว่ามี Item ใช้หมวดหมู่นี้อยู่หรือไม่
  const itemsUsingCategory = getItemsByCategory(category.name);
  if (itemsUsingCategory.length > 0) {
    showToast('warning', `ไม่สามารถลบได้ เนื่องจากมี ${itemsUsingCategory.length} รายการใช้หมวดหมู่นี้อยู่`);
    return;
  }

  // ตรวจสอบว่าเป็น default category หรือไม่
  if (isDefaultCategoryType(category.name)) {
    showToast('warning', 'ไม่สามารถลบหมวดหมู่เริ่มต้นได้');
    return;
  }

  if (!confirm(`คุณต้องการลบหมวดหมู่ "${category.displayName || category.name}" หรือไม่?`)) {
    return;
  }

  try {
    // หา folder item ที่ต้องลบ
    const folderItem = items.value.find(item => item.isFolder && item.type === category.name);
    if (folderItem) {
      const response = await instance.appContext.config.globalProperties.$Request.DELETE(
        `builder_item/${folderItem._id}`,
        configs.value.key
      );

      if (response.status === 200) {
        showToast('success', 'ลบหมวดหมู่ (Folder) สำเร็จแล้ว');
        await loadItems(); // รีโหลด items
      }
    }
  } catch (error) {
    console.error('Error deleting folder category:', error);
    showToast('error', 'เกิดข้อผิดพลาดในการลบหมวดหมู่');
  }
}

function addNewFolderCategory() {
  // รีเซ็ต form และเปิด modal สำหรับเพิ่ม folder
  editingItem.value = null;
  itemForm.value = {
    name: '',
    type: '',
    description: '',
    category: 'content', // default category
    icon: 'folder',
    status: true,
    pin: false,
    isFolder: true, // บังคับให้เป็น folder
    sort_order: 0
  };
  showAddModal.value = true;
}

// เพิ่ม watch สำหรับ availableCategories เพื่อ set activeTab อัตโนมัติ
watch(availableCategories, (newVal) => {
  if (newVal.length > 0 && !newVal.some(cat => cat.name === activeTab.value)) {
    activeTab.value = newVal[0].name;
  }
}, { immediate: true });

</script>

<style scoped>
/* Additional styles if needed */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
