<template>
    <div class="bg-gray-50 flex overflow-hidden taxonomy-manager-container" 
         :class="[
           headerType && `with-${headerType}`,
           customClass
         ]"
         :style="customHeight ? { height: customHeight, maxHeight: customHeight } : {}">
      <!-- Sidebar -->
      <div class="hidden lg:flex lg:w-64 lg:flex-col">
        <div class="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <i class="fas fa-tags text-white text-sm"></i>
              </div>
              <div>
                <h1 class="text-base font-semibold text-gray-900">Taxonomy</h1>
                <p class="text-xs text-gray-500">{{ taxonomyGroups.length }} Taxonomy</p>
              </div>
            </div>
            <button
              @click="addTaxonomyGroup"
              type="button"
              class="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors duration-200"
              title="เพิ่ม Taxonomy ใหม่"
            >
              <i class="fas fa-plus text-sm"></i>
            </button>
          </div>
  
          <!-- Taxonomy Groups List -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-bold text-gray-700 mb-3">กลุ่ม Taxonomy</h3>
            
            <!-- Content Type Filter -->
            <div class="mb-4">
              <label class="block text-xs font-medium text-gray-600 mb-2">กรองตามประเภทเนื้อหา</label>
              <div class="space-y-1">
                <button
                  @click="selectContentType('')"
                  class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors duration-200"
                  :class="{
                    'bg-blue-100 text-blue-700 font-medium': selectedContentType === '',
                    'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedContentType !== ''
                  }"
                >
                  <i class="fas fa-list text-xs w-3"></i>
                  <span>ทั้งหมด</span>
                  <span class="ml-auto px-1.5 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                    {{ taxonomyGroups.length }}
                  </span>
                </button>
                
                <button
                  v-for="ct in getContentTypesDisplay()"
                  :key="ct.key"
                  @click="selectContentType(ct.key)"
                  class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors duration-200"
                  :class="{
                    'bg-blue-100 text-blue-700 font-medium': selectedContentType === ct.key,
                    'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedContentType !== ct.key
                  }"
                >
                  <i :class="ct.icon" :style="{ color: selectedContentType === ct.key ? '' : `var(--${ct.color}-500)` }" class="text-xs w-3"></i>
                  <span>{{ ct.label }}</span>
                  <span class="ml-auto px-1.5 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                    {{ taxonomyGroups.filter(g => g.contentTypes && g.contentTypes.includes(ct.key)).length }}
                  </span>
                </button>
                
                <!-- Unassigned groups -->
                <button
                  v-if="taxonomyGroups.filter(g => !g.contentTypes || g.contentTypes.length === 0).length > 0"
                  @click="selectContentType('unassigned')"
                  class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors duration-200"
                  :class="{
                    'bg-blue-100 text-blue-700 font-medium': selectedContentType === 'unassigned',
                    'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedContentType !== 'unassigned'
                  }"
                >
                  <i class="fas fa-question-circle text-xs w-3 text-gray-400"></i>
                  <span>ไม่ได้ระบุประเภท</span>
                  <span class="ml-auto px-1.5 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                    {{ taxonomyGroups.filter(g => !g.contentTypes || g.contentTypes.length === 0).length }}
                  </span>
                </button>
              </div>
            </div>
            
            <div class="space-y-2">
              <button
                v-for="group in getFilteredTaxonomyGroups()"
                :key="group._id"
                @click="selectTaxonomyGroup(group._id)"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 sidebar-menu-item"
                :class="{
                  'bg-green-100 text-green-700 font-medium active': selectedTaxonomyGroup === group._id,
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedTaxonomyGroup !== group._id
                }"
              >
                <i class="fas fa-folder text-sm w-4"></i>
                <div class="flex-1 text-left truncate">
                  <div class="font-medium">{{ group.name }}</div>
                  <div v-if="group.contentTypes && group.contentTypes.length > 0" class="text-xs opacity-75 mt-0.5">
                    <span 
                      v-for="(ctKey, index) in group.contentTypes" 
                      :key="ctKey"
                      class="inline-flex items-center gap-1"
                    >
                      <i :class="getContentTypeInfo(ctKey).icon" class="text-xs"></i>
                      {{ getContentTypeInfo(ctKey).label }}
                      <span v-if="index < group.contentTypes.length - 1">, </span>
                    </span>
                  </div>
                </div>
                <span 
                  v-if="getTermsCountForGroup(group._id) > 0" 
                  class="px-2 py-1 text-xs rounded-full status-badge"
                  :class="{ 
                    'bg-green-200 text-green-800': selectedTaxonomyGroup === group._id,
                    'bg-gray-200 text-gray-600': selectedTaxonomyGroup !== group._id
                  }"
                >
                  {{ getTermsCountForGroup(group._id) }}
                </span>
              </button>
            </div>
            
            <!-- Empty state for groups -->
            <div v-if="getFilteredTaxonomyGroups().length === 0" class="text-center py-4">
              <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i class="fas fa-folder text-gray-400 text-sm"></i>
              </div>
              <p class="text-xs text-gray-500 mb-2">
                <span v-if="selectedContentType">ไม่มี Taxonomy สำหรับ{{ getContentTypeInfo(selectedContentType).label }}</span>
                <span v-else>ยังไม่มี Taxonomy</span>
              </p>
              <button
                @click="addTaxonomyGroup"
                class="text-xs text-green-600 hover:text-green-700"
              >
                เพิ่ม Taxonomy แรก
              </button>
            </div>
          </div>
  
          <!-- Quick Actions -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการ</h3>
            <div class="space-y-2">
              <button 
                @click="addTaxonomyGroup"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-plus text-sm w-4"></i>
                <span>เพิ่ม Taxonomy</span>
              </button>
              <button 
                v-if="selectedTaxonomyGroup"
                @click="addTerm(null)"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-tag text-sm w-4"></i>
                <span>เพิ่ม Root Term</span>
              </button>
              <button 
                @click="exportData"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-download text-sm w-4"></i>
                <span>Export ข้อมูล</span>
              </button>
            </div>
          </div>
  
          <!-- Tools Section -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">เครื่องมือ</h3>
            <div class="space-y-2">
              <button 
                @click="importData"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-upload text-sm w-4"></i>
                <span>Import ข้อมูล</span>
              </button>
              <button 
                @click="purgeLogs"
                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-200"
              >
                <i class="fas fa-trash text-sm w-4"></i>
                <span>ลบ Logs ทั้งหมด</span>
              </button>
            </div>
          </div>
  
          <!-- User Info -->
          <div class="mt-auto px-4 py-4 flex-shrink-0">
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <i class="fas fa-user text-white text-sm"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ session?.current?.name || 'ผู้ใช้' }}</p>
                <p class="text-xs text-gray-500">ผู้ดูแลระบบ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 h-full">
        <!-- Mobile Header -->
        <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div class="flex items-center justify-between">
            <h1 class="text-lg font-semibold text-gray-900">ระบบจัดการ Taxonomy</h1>
            <button 
              @click="toggleMobileSidebar" 
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>
  
        <!-- Navigation Section -->
        <div class="bg-white border-b border-gray-200 px-4 py-3">
          <div class="flex items-center gap-4">
            <!-- Search Input -->
            <div class="flex-1 relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-search text-gray-400"></i>
              </div>
              <input
                v-model="searchQuery"
                @input="performSearch"
                type="text"
                placeholder="ค้นหา Taxonomy และ Terms..."
                class="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
              />
              <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  @click="clearSearch"
                  class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <i class="fas fa-times text-sm"></i>
                </button>
              </div>
            </div>
            
            <!-- Search Results Summary -->
            <div v-if="searchQuery" class="flex items-center gap-2 text-sm whitespace-nowrap">
              <span class="text-gray-600">
                <span class="font-semibold text-blue-600">{{ searchResults.groups.length }}</span> กลุ่ม,
                <span class="font-semibold text-green-600">{{ searchResults.terms.length }}</span> Terms
              </span>
            </div>
            
            <!-- Back Button (only show when not searching) -->
            <button
              v-if="!searchQuery"
              @click="addTaxonomyGroup"
              type="button"
              class="inline-flex items-center text-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 px-4 py-2 rounded-md font-medium"
            >
              <i class="fas fa-plus mr-1.5 text-xs"></i>
              เพิ่ม Taxonomy
            </button>
          </div>
        </div>

        <!-- Tab Navigation (only show when not in taxonomy details) -->
        <div v-if="!selectedTaxonomyGroup" class="bg-gray-100">
          <!-- Desktop Tab Navigation -->
          <div class="hidden md:block">
            <div class="tab-folder flex border-gray-400 bg-gray-500 pt-5 pl-2 md:pl-6">
              <div 
                v-for="tab in getTabsData()" 
                :key="tab.key" 
                @click="selectContentTypeTab(tab.key)" 
                class="tab-folder-item cursor-pointer py-2 px-3 text-gray-700 hover:text-blue-600 transition-colors duration-200 bg-opacity-100 relative rounded-t-lg bg-gray-100 mr-1"
                :class="{ 
                  'active bg-gray-100 text-blue-600': selectedContentTypeTab === tab.key,
                  'bg-gray-100 bg-opacity-30': selectedContentTypeTab !== tab.key
                }"
              >
                <div class="flex items-center">
                  <i :class="tab.icon" :style="{ color: selectedContentTypeTab === tab.key ? '#2563eb' : `var(--${tab.color}-600)` }" class="mr-2 text-sm"></i>
                  <div>{{ tab.label }}</div>
                  <span class="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                    {{ selectedContentTypeTab === 'all' && tab.key === 'all' ? taxonomyGroups.length : 
                         tab.key === 'all' ? taxonomyGroups.length :
                         taxonomyGroups.filter(g => g.contentTypes && g.contentTypes.includes(tab.key)).length }}
                  </span>
                </div>
                <div class="text-xs text-gray-600 hidden md:block">{{ tab.subText }}</div>
                <div v-if="selectedContentTypeTab === tab.key" class="absolute bottom-0 left-0 w-full"></div>
              </div>
            </div>
          </div>

          <!-- Mobile Dropdown Navigation -->
          <div class="block md:hidden px-4 py-3">
            <div class="relative">
              <!-- Dropdown Button -->
              <button
                @click="toggleMobileDropdown"
                class="mobile-dropdown-button w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <div 
                    class="w-8 h-8 rounded-md flex items-center justify-center"
                    :class="{
                      'bg-blue-100': getCurrentTabInfo().color === 'blue',
                      'bg-green-100': getCurrentTabInfo().color === 'green',
                      'bg-purple-100': getCurrentTabInfo().color === 'purple',
                      'bg-orange-100': getCurrentTabInfo().color === 'orange',
                      'bg-red-100': getCurrentTabInfo().color === 'red',
                      'bg-gray-100': getCurrentTabInfo().color === 'gray'
                    }"
                  >
                    <i 
                      :class="getCurrentTabInfo().icon" 
                      :style="{ color: `var(--${getCurrentTabInfo().color}-600)` }"
                      class="text-sm"
                    ></i>
                  </div>
                  <div class="text-left">
                    <div class="font-medium text-gray-900">{{ getCurrentTabInfo().label }}</div>
                    <div class="text-sm text-gray-500">{{ getCurrentTabInfo().subText }}</div>
                  </div>
                </div>
                <i 
                  :class="showMobileDropdown ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" 
                  class="text-gray-400 text-sm transition-transform duration-200"
                ></i>
              </button>

              <!-- Dropdown Menu -->
              <div 
                v-if="showMobileDropdown"
                class="mobile-dropdown-menu absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              >
                <div class="py-2">
                  <button
                    v-for="tab in getTabsData()"
                    :key="tab.key"
                    @click="selectContentTypeTab(tab.key)"
                    class="mobile-dropdown-item w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    :class="{
                      'selected bg-blue-50 border-r-2 border-blue-500': selectedContentTypeTab === tab.key,
                      'text-blue-600': selectedContentTypeTab === tab.key,
                      'text-gray-700': selectedContentTypeTab !== tab.key
                    }"
                  >
                    <div class="flex items-center space-x-3">
                      <div 
                        class="w-8 h-8 rounded-md flex items-center justify-center"
                        :class="{
                          'bg-blue-100': tab.color === 'blue',
                          'bg-green-100': tab.color === 'green',
                          'bg-purple-100': tab.color === 'purple',
                          'bg-orange-100': tab.color === 'orange',
                          'bg-red-100': tab.color === 'red',
                          'bg-gray-100': tab.color === 'gray'
                        }"
                      >
                        <i 
                          :class="tab.icon" 
                          :style="{ color: `var(--${tab.color}-600)` }"
                          class="text-sm"
                        ></i>
                      </div>
                      <div class="text-left">
                        <div class="font-medium">{{ tab.label }}</div>
                        <div class="text-sm text-gray-500">{{ tab.subText }}</div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                        {{ selectedContentTypeTab === 'all' && tab.key === 'all' ? taxonomyGroups.length : 
                             tab.key === 'all' ? taxonomyGroups.length :
                             taxonomyGroups.filter(g => g.contentTypes && g.contentTypes.includes(tab.key)).length }}
                      </span>
                      <i 
                        v-if="selectedContentTypeTab === tab.key"
                        class="fas fa-check text-blue-600 text-sm"
                      ></i>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Overlay for mobile dropdown -->
          <div 
            v-if="showMobileDropdown"
            @click="closeMobileDropdown"
            class="fixed inset-0 bg-transparent z-40 md:hidden"
          ></div>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 overflow-x-hidden bg-white">
          <!-- Taxonomy Group Selection -->
          <div v-if="!selectedTaxonomyGroup" class="h-full p-4">
            <!-- Tab Content -->
            <div class="bg-white p-3">
              <!-- Search Results -->
              <div v-if="searchQuery && searchResults.groups.length > 0">
                <div class="mb-6">
                  <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i class="fas fa-search text-blue-600"></i>
                    ผลการค้นหากลุ่ม Taxonomy ({{ searchResults.groups.length }} รายการ)
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div
                      v-for="group in searchResults.groups"
                      :key="group._id"
                      @click="selectTaxonomyGroup(group._id)"
                      class="bg-gradient-to-r from-white to-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-300 group"
                    >
                      <div class="flex items-start gap-2.5">
                        <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <i class="fas fa-folder text-blue-600 text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                          <h4 class="text-sm font-semibold text-gray-800 mb-1">{{ group.name }}</h4>
                          <p v-if="group.code" class="text-xs text-gray-500 mb-1">รหัส: {{ group.code }}</p>
                          <p v-if="group.description" class="text-xs text-gray-600 line-clamp-2">{{ group.description }}</p>
                          <div class="flex items-center justify-between mt-2">
                            <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              {{ getTermsCountForGroup(group._id) }} Terms
                            </span>
                            <span :class="group.active ? 'text-green-600' : 'text-red-600'" class="text-xs">
                              {{ group.active ? '✓ เปิดใช้งาน' : '✗ ปิดใช้งาน' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Search Results for Terms -->
              <div v-if="searchQuery && searchResults.terms.length > 0">
                <div class="mb-6">
                  <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i class="fas fa-tags text-green-600"></i>
                    ผลการค้นหา Terms ({{ searchResults.terms.length }} รายการ)
                  </h3>
                  <div class="space-y-2">
                    <div
                      v-for="term in searchResults.terms"
                      :key="term._id"
                      @click="selectTaxonomyGroup(term.taxonomy)"
                      class="bg-gradient-to-r from-white to-green-50 border border-green-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-300"
                    >
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <i class="fas fa-tag text-green-600 text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <h4 class="text-sm font-semibold text-gray-800">
                              {{ term.customData?.name || term.customData?.ชื่อ || term.name || 'ไม่มีชื่อ' }}
                            </h4>
                            <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {{ getTaxonomyGroupName(term.taxonomy) }}
                            </span>
                          </div>
                          <div v-if="term.customData" class="text-xs text-gray-600">
                            <span v-for="(value, key) in term.customData" :key="key" class="mr-3">
                              <strong>{{ key }}:</strong> {{ value }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Search Results -->
              <div v-if="searchQuery && searchResults.groups.length === 0 && searchResults.terms.length === 0" class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-search text-gray-400 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบผลลัพธ์</h3>
                <p class="text-sm text-gray-500 mb-4">ลองใช้คำค้นหาอื่นหรือตรวจสอบการสะกดคำ</p>
                <button
                  @click="clearSearch"
                  class="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ล้างการค้นหา
                </button>
              </div>

              <!-- Show all content types when "all" tab is selected and no search -->
              <div v-else-if="selectedContentTypeTab === 'all'">
                <!-- Content Type Groups -->
                <div v-for="(groupData, contentTypeKey) in getTabContent()" :key="contentTypeKey" class="mb-6">
                  <div v-if="groupData.groups.length > 0">
                    <!-- Content Type Header -->
                    <div class="flex items-center gap-3 mb-3 p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg">
                      <div 
                        class="w-10 h-10 rounded-lg flex items-center justify-center"
                        :class="{
                          'bg-blue-100': groupData.color === 'blue',
                          'bg-green-100': groupData.color === 'green',
                          'bg-purple-100': groupData.color === 'purple',
                          'bg-orange-100': groupData.color === 'orange',
                          'bg-red-100': groupData.color === 'red',
                          'bg-gray-100': groupData.color === 'gray'
                        }"
                      >
                        <i 
                          :class="groupData.icon"
                          :style="{ color: `var(--${groupData.color}-600)` }"
                          class="text-lg"
                        ></i>
                      </div>
                      <div class="flex-1">
                        <h3 class="text-base font-semibold text-gray-900">{{ groupData.label }}</h3>
                        <p class="text-sm text-gray-600">{{ groupData.groups.length }} Taxonomy</p>
                      </div>
                      <button
                        @click="selectContentTypeTab(contentTypeKey)"
                        class="text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        <i class="fas fa-eye mr-1"></i>ดูเฉพาะประเภทนี้
                      </button>
                    </div>

                    <!-- Groups Grid for this content type -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
                      <div
                        v-for="group in groupData.groups"
                        :key="group._id"
                        @click="selectTaxonomyGroup(group._id)"
                        class="bg-gradient-to-r from-white to-gray-50 border border-gray-200/60 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-300 group taxonomy-group-card flex flex-col min-h-[100px] hover:border-blue-300"
                      >
                        <div class="flex items-start gap-2.5 flex-1">
                          <div 
                            class="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 flex-shrink-0"
                            :class="{
                              'bg-gradient-to-br from-blue-100 to-blue-200': groupData.color === 'blue',
                              'bg-gradient-to-br from-green-100 to-green-200': groupData.color === 'green',
                              'bg-gradient-to-br from-purple-100 to-purple-200': groupData.color === 'purple',
                              'bg-gradient-to-br from-orange-100 to-orange-200': groupData.color === 'orange',
                              'bg-gradient-to-br from-red-100 to-red-200': groupData.color === 'red',
                              'bg-gradient-to-br from-gray-100 to-gray-200': groupData.color === 'gray'
                            }"
                          >
                            <i :class="groupData.icon" :style="{ color: `var(--${groupData.color}-600)` }" class="text-sm"></i>
                          </div>
                          <div class="flex-1 min-w-0 flex flex-col">
                            <h3 class="text-sm font-semibold text-gray-800 mb-1.5">{{ group.name }}</h3>
                            <div class="flex-1 mb-2">
                              <p v-if="group.code" class="text-xs text-gray-500 mb-0.5">รหัส: {{ group.code }}</p>
                              <p v-if="group.description" class="text-xs text-gray-600 line-clamp-2">{{ group.description }}</p>
                              <div v-if="!group.code && !group.description" class="h-4"></div>
                            </div>
                            <div class="flex items-center justify-between mt-auto">
                              <span class="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full border border-blue-200">
                                <i class="fas fa-tag mr-1 text-xs"></i>{{ getTermsCountForGroup(group._id) }}
                              </span>
                              <span :class="group.active ? 'bg-gradient-to-r from-emerald-100 to-green-200 text-green-800 border-green-200' : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-200'" 
                                    class="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full border">
                                <i :class="group.active ? 'fas fa-check-circle' : 'fas fa-pause-circle'" class="mr-1 text-xs"></i>
                                {{ group.active ? 'เปิด' : 'ปิด' }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty State for no groups -->
                <div v-if="taxonomyGroups.length === 0" class="text-center py-12">
                  <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-tags text-gray-400 text-xl"></i>
                  </div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">ยังไม่มี Taxonomy</h3>
                  <p class="text-sm text-gray-500 mb-4">เริ่มต้นด้วยการสร้าง Taxonomy แรกและระบุประเภทเนื้อหาที่เกี่ยวข้อง</p>
                  <button
                    @click="addTaxonomyGroup"
                    class="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    <i class="fas fa-plus mr-2"></i>เพิ่ม Taxonomy แรก
                  </button>
                </div>
              </div>

              <!-- Show specific content type when specific tab is selected -->
              <div v-else>
                <div v-for="(groupData, contentTypeKey) in getTabContent()" :key="contentTypeKey">
                  <!-- Specific Content Type Header -->
                  <div class="flex items-center gap-3 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div 
                      class="w-12 h-12 rounded-lg flex items-center justify-center"
                      :class="{
                        'bg-blue-100': groupData.color === 'blue',
                        'bg-green-100': groupData.color === 'green',
                        'bg-purple-100': groupData.color === 'purple',
                        'bg-orange-100': groupData.color === 'orange',
                        'bg-red-100': groupData.color === 'red',
                        'bg-gray-100': groupData.color === 'gray'
                      }"
                    >
                      <i 
                        :class="groupData.icon"
                        :style="{ color: `var(--${groupData.color}-600)` }"
                        class="text-xl"
                      ></i>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900">
                        Taxonomy สำหรับ{{ groupData.label }}
                      </h3>
                      <p class="text-sm text-gray-600">{{ groupData.groups.length }} กลุ่ม</p>
                    </div>
                    <button
                      @click="selectContentTypeTab('all')"
                      class="text-sm px-3 py-1.5 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <i class="fas fa-list mr-1"></i>แสดงทั้งหมด
                    </button>
                  </div>

                  <!-- Groups Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
                    <div
                      v-for="group in groupData.groups"
                      :key="group._id"
                      @click="selectTaxonomyGroup(group._id)"
                      class="bg-gradient-to-r from-white to-gray-50 border border-gray-200/60 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-300 group taxonomy-group-card flex flex-col min-h-[100px] hover:border-blue-300"
                    >
                      <div class="flex items-start gap-2.5 flex-1">
                        <div 
                          class="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 flex-shrink-0"
                          :class="{
                            'bg-gradient-to-br from-blue-100 to-blue-200': groupData.color === 'blue',
                            'bg-gradient-to-br from-green-100 to-green-200': groupData.color === 'green',
                            'bg-gradient-to-br from-purple-100 to-purple-200': groupData.color === 'purple',
                            'bg-gradient-to-br from-orange-100 to-orange-200': groupData.color === 'orange',
                            'bg-gradient-to-br from-red-100 to-red-200': groupData.color === 'red',
                            'bg-gradient-to-br from-gray-100 to-gray-200': groupData.color === 'gray'
                          }"
                        >
                          <i :class="groupData.icon" :style="{ color: `var(--${groupData.color}-600)` }" class="text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0 flex flex-col">
                          <h3 class="text-sm font-semibold text-gray-800 mb-1.5">{{ group.name }}</h3>
                          <div class="flex-1 mb-2">
                            <p v-if="group.code" class="text-xs text-gray-500 mb-0.5">รหัส: {{ group.code }}</p>
                            <p v-if="group.description" class="text-xs text-gray-600 line-clamp-2">{{ group.description }}</p>
                            <div v-if="!group.code && !group.description" class="h-4"></div>
                          </div>
                          <div class="flex items-center justify-between mt-auto">
                            <span class="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full border border-blue-200">
                              <i class="fas fa-tag mr-1 text-xs"></i>{{ getTermsCountForGroup(group._id) }}
                            </span>
                            <span :class="group.active ? 'bg-gradient-to-r from-emerald-100 to-green-200 text-green-800 border-green-200' : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-200'" 
                                  class="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full border">
                              <i :class="group.active ? 'fas fa-check-circle' : 'fas fa-pause-circle'" class="mr-1 text-xs"></i>
                              {{ group.active ? 'เปิด' : 'ปิด' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Terms Management -->
          <div v-if="selectedTaxonomyGroup" class="h-full flex flex-col p-4">
            <!-- Terms Header with Quick Stats -->
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <button 
                    @click="backToGroupSelection"
                    class="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <i class="fas fa-arrow-left text-sm"></i>
                  </button>
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <i class="fas fa-tags text-blue-600"></i>{{ getCurrentTaxonomyGroupTitle() }}
                    </h2>
                    <p v-if="getCurrentTaxonomyGroup()?.description" class="text-sm text-gray-600 mt-1">
                      {{ getCurrentTaxonomyGroup().description }}
                    </p>
                  </div>
                </div>

              </div>

              <!-- Quick Stats Cards -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <!-- Total Terms -->
                <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs text-blue-600 font-medium">Terms ทั้งหมด</p>
                      <p class="text-lg font-bold text-blue-900">{{ getTermsForGroup().length }}</p>
                    </div>
                    <i class="fas fa-tags text-blue-400 text-lg"></i>
                  </div>
                </div>

                <!-- Root Terms -->
                <div class="bg-green-50 border border-green-200 rounded-md p-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs text-green-600 font-medium">Root Terms</p>
                      <p class="text-lg font-bold text-green-900">{{ getRootTerms().length }}</p>
                    </div>
                    <i class="fas fa-layer-group text-green-400 text-lg"></i>
                  </div>
                </div>

                <!-- Sub Terms -->
                <div class="bg-purple-50 border border-purple-200 rounded-md p-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs text-purple-600 font-medium">Sub Terms</p>
                      <p class="text-lg font-bold text-purple-900">{{ getSubTermsCount() }}</p>
                    </div>
                    <i class="fas fa-sitemap text-purple-400 text-lg"></i>
                  </div>
                </div>

                <!-- Active Terms -->
                <div class="bg-orange-50 border border-orange-200 rounded-md p-3">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs text-orange-600 font-medium">Terms ที่ใช้งาน</p>
                      <p class="text-lg font-bold text-orange-900">{{ getActiveTermsCount() }}</p>
                    </div>
                    <i class="fas fa-check-circle text-orange-400 text-lg"></i>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                <button 
                  @click="editTaxonomyGroup"
                  class="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-medium"
                >
                  <i class="fas fa-edit mr-1"></i>แก้ไข Taxonomy
                </button>
                <button 
                  @click="showGroupHistory"
                  class="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors font-medium"
                >
                  <i class="fas fa-history mr-1"></i>ประวัติ
                </button>
                <button 
                  @click="exportData"
                  class="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors font-medium"
                >
                  <i class="fas fa-download mr-1"></i>ส่งออก
                </button>
                <div class="flex-1"></div>
                <button 
                  @click="deleteTaxonomyGroup"
                  class="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors font-medium"
                >
                  <i class="fas fa-trash mr-1"></i>ลบ Taxonomy
                </button>
              </div>
            </div>

            <!-- Terms List -->
            <div class="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-sm">
              <div v-if="getRootTerms().length === 0" class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-tag text-gray-400 text-xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">ยังไม่มี Terms ในกลุ่มนี้</h3>
                <p class="text-sm text-gray-500 mb-4">เริ่มต้นสร้าง Term แรกเพื่อจัดหมวดหมู่ข้อมูล</p>
                <button
                  @click="addTerm(null)"
                  type="button"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                >
                  <i class="fas fa-plus mr-2"></i>สร้าง Term แรก
                </button>
              </div>

              <div v-else class="p-4">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <i class="fas fa-list text-blue-600"></i>รายการ Terms ({{ getRootTerms().length }} รายการ)
                  </h4>
                  <button
                    @click="addTerm(null)"
                    type="button"
                    class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors font-medium"
                  >
                    <i class="fas fa-plus mr-1"></i>เพิ่ม Root Term
                  </button>
                </div>
                
                <div class="space-y-2">
                  <TermItem
                    v-for="term in getRootTerms()"
                    :key="term._id"
                    :term-data="term"
                    :level="0"
                    :all-terms="terms"
                    :expanded-terms="expandedTerms"
                    @update:expandedTerms="expandedTerms = $event"
                    @add-term="addTerm"
                    @edit-term="editTerm"
                    @delete-term="deleteTerm"
                    @clone-term="cloneTerm"
                    @move-term-up="moveTermUp"
                    @move-term-down="moveTermDown"
                    @show-term-history="showTermHistoryHandler"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Mobile Sidebar Overlay -->
      <div 
        v-if="showMobileSidebar" 
        class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
        @click="toggleMobileSidebar"
      >
        <div 
          class="w-64 h-full bg-white transform transition-transform duration-300"
          @click.stop
        >
          <!-- Mobile Sidebar Content (same as desktop sidebar) -->
          <div class="flex flex-col h-full">
            <!-- Sidebar Header -->
            <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <i class="fas fa-tags text-white text-sm"></i>
                </div>
                <div>
                  <h1 class="text-base font-semibold text-gray-900">Taxonomy</h1>
                  <p class="text-xs text-gray-500">{{ taxonomyGroups.length }} กลุ่ม</p>
                </div>
              </div>
              <button 
                @click="toggleMobileSidebar"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
  
            <!-- Taxonomy Groups List -->
            <div class="px-4 py-4 border-b border-gray-200">
              <h3 class="text-sm font-medium text-gray-700 mb-3">กลุ่ม Taxonomy</h3>
              
              <!-- Content Type Filter for Mobile -->
              <div class="mb-4">
                <label class="block text-xs font-medium text-gray-600 mb-2">กรองตามประเภทเนื้อหา</label>
                <div class="space-y-1">
                  <button
                    @click="selectContentType('')"
                    class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors duration-200"
                    :class="{
                      'bg-blue-100 text-blue-700 font-medium': selectedContentType === '',
                      'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedContentType !== ''
                    }"
                  >
                    <i class="fas fa-list text-xs w-3"></i>
                    <span>ทั้งหมด</span>
                    <span class="ml-auto px-1.5 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                      {{ taxonomyGroups.length }}
                    </span>
                  </button>
                  
                  <button
                    v-for="ct in getContentTypesDisplay()"
                    :key="ct.key"
                    @click="selectContentType(ct.key)"
                    class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors duration-200"
                    :class="{
                      'bg-blue-100 text-blue-700 font-medium': selectedContentType === ct.key,
                      'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedContentType !== ct.key
                    }"
                  >
                    <i :class="ct.icon" :style="{ color: selectedContentType === ct.key ? '' : `var(--${ct.color}-500)` }" class="text-xs w-3"></i>
                    <span>{{ ct.label }}</span>
                    <span class="ml-auto px-1.5 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                      {{ taxonomyGroups.filter(g => g.contentTypes && g.contentTypes.includes(ct.key)).length }}
                    </span>
                  </button>
                  
                  <!-- Unassigned groups for Mobile -->
                  <button
                    v-if="taxonomyGroups.filter(g => !g.contentTypes || g.contentTypes.length === 0).length > 0"
                    @click="selectContentType('unassigned')"
                    class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors duration-200"
                    :class="{
                      'bg-blue-100 text-blue-700 font-medium': selectedContentType === 'unassigned',
                      'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedContentType !== 'unassigned'
                    }"
                  >
                    <i class="fas fa-question-circle text-xs w-3 text-gray-400"></i>
                    <span>ไม่ได้ระบุประเภท</span>
                    <span class="ml-auto px-1.5 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600">
                      {{ taxonomyGroups.filter(g => !g.contentTypes || g.contentTypes.length === 0).length }}
                    </span>
                  </button>
                </div>
              </div>
              
              <div class="space-y-2">
                <button
                  v-for="group in getFilteredTaxonomyGroups()"
                  :key="group._id"
                  @click="selectTaxonomyGroupAndCloseMobile(group._id)"
                  class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
                  :class="{
                    'bg-green-100 text-green-700 font-medium': selectedTaxonomyGroup === group._id,
                    'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedTaxonomyGroup !== group._id
                  }"
                >
                  <i class="fas fa-folder text-sm w-4"></i>
                  <div class="flex-1 text-left truncate">
                    <div class="font-medium">{{ group.name }}</div>
                    <div v-if="group.contentTypes && group.contentTypes.length > 0" class="text-xs opacity-75 mt-0.5">
                      <span 
                        v-for="(ctKey, index) in group.contentTypes" 
                        :key="ctKey"
                        class="inline-flex items-center gap-1"
                      >
                        <i :class="getContentTypeInfo(ctKey).icon" class="text-xs"></i>
                        {{ getContentTypeInfo(ctKey).label }}
                        <span v-if="index < group.contentTypes.length - 1">, </span>
                      </span>
                    </div>
                  </div>
                  <span 
                    v-if="getTermsCountForGroup(group._id) > 0" 
                    class="px-2 py-1 text-xs rounded-full"
                    :class="{ 
                      'bg-green-200 text-green-800': selectedTaxonomyGroup === group._id,
                      'bg-gray-200 text-gray-600': selectedTaxonomyGroup !== group._id
                    }"
                  >
                    {{ getTermsCountForGroup(group._id) }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Add/Edit Term Modal -->
      <div v-if="showTermModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
        <div class="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[85vh] overflow-y-auto border border-gray-300">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ editingTerm ? 'แก้ไข Term' : 'เพิ่ม Term ใหม่' }}
            </h3>
            <button @click="closeTermModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-4 bg-white">
            <!-- Custom Fields -->
            <CustomFieldRenderer 
              :fieldConfig="getCurrentFieldConfig()"
              :customData="termForm.customData"
              :showValidation="false"
              :existingTerms="terms"
              :currentTermId="editingTerm?._id"
              :taxonomyGroupId="selectedTaxonomyGroup"
              @update:customData="termForm.customData = $event"
            />

            <!-- Sort Order Field - Hidden -->
            <input 
              v-model.number="termForm.sortOrder" 
              type="hidden"
            />
          </div>

          <!-- Modal Footer -->
          <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-200">
            <button 
              @click="closeTermModal" 
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium"
            >
              ยกเลิก
            </button>
            <button 
              @click="saveTerm" 
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
            >
              {{ editingTerm ? 'อัปเดต' : 'เพิ่ม' }}
            </button>
          </div>
        </div>
      </div>
  
      <!-- Add/Edit Taxonomy Group Modal -->
      <div v-if="showTaxonomyModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
        <div class="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-300">
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 class="text-xl font-semibold text-gray-900">
              {{ editingTaxonomyGroup ? 'แก้ไข Taxonomy' : 'เพิ่ม Taxonomy ใหม่' }}
            </h3>
            <button @click="closeTaxonomyModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>

          <!-- Tab Navigation -->
          <div class="bg-gray-100 px-6 py-3 border-b border-gray-200">
            <div class="flex space-x-1">
              <button
                @click="selectedTaxonomyModalTab = 'basic'"
                class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                :class="{
                  'bg-white text-blue-600 shadow-sm border border-gray-200': selectedTaxonomyModalTab === 'basic',
                  'text-gray-600 hover:text-gray-900 hover:bg-gray-50': selectedTaxonomyModalTab !== 'basic'
                }"
              >
                <i class="fas fa-info-circle mr-2"></i>
                ข้อมูลพื้นฐาน
              </button>
              <button
                @click="selectedTaxonomyModalTab = 'fields'"
                class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200"
                :class="{
                  'bg-white text-blue-600 shadow-sm border border-gray-200': selectedTaxonomyModalTab === 'fields',
                  'text-gray-600 hover:text-gray-900 hover:bg-gray-50': selectedTaxonomyModalTab !== 'fields'
                }"
              >
                <i class="fas fa-cogs mr-2"></i>
                การตั้งค่าฟิลด์
              </button>
            </div>
          </div>

          <!-- Modal Body with Tabs -->
          <div class="overflow-y-auto" style="max-height: calc(90vh - 180px);">
            <!-- Basic Information Tab -->
            <div v-if="selectedTaxonomyModalTab === 'basic'" class="p-6 bg-white">
              <div class="space-y-6">
                <!-- Group Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-tag text-blue-600 mr-2"></i>
                    ชื่อ Taxonomy *
                  </label>
                  <input 
                    v-model="taxonomyGroupForm.name" 
                    type="text" 
                    placeholder="ชื่อกลุ่ม Taxonomy"
                    class="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <!-- Group Code -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-code text-purple-600 mr-2"></i>
                    รหัสกลุ่ม
                  </label>
                  <input 
                    v-model="taxonomyGroupForm.code" 
                    type="text" 
                    placeholder="เช่น SUBJECT, LEVEL, DEPARTMENT (ไม่บังคับ)"
                    class="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <p class="text-xs text-gray-500 mt-2">รหัสสำหรับอ้างอิงในระบบ ควรเป็นภาษาอังกฤษ ไม่มีช่องว่าง</p>
                </div>

                <!-- Active Status -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <label class="flex items-center text-sm text-gray-700">
                    <input 
                      v-model="taxonomyGroupForm.active" 
                      type="checkbox" 
                      class="mr-3 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <i class="fas fa-toggle-on text-green-600 mr-2"></i>
                    เปิดใช้งาน (Active)
                  </label>
                  <p class="text-xs text-gray-500 mt-2 ml-7">ยกเลิกการเลือกเพื่อปิดใช้งานกลุ่มนี้ชั่วคราว</p>
                </div>

                <!-- Content Types Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    <i class="fas fa-layer-group text-orange-600 mr-2"></i>
                    ประเภทเนื้อหาที่เกี่ยวข้อง *
                  </label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <label 
                      v-for="ct in getContentTypesDisplay()" 
                      :key="ct.key"
                      class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200"
                      :class="{
                        'border-blue-500 bg-blue-50 shadow-sm': taxonomyGroupForm.contentTypes.includes(ct.key),
                        'border-gray-200 hover:border-gray-300': !taxonomyGroupForm.contentTypes.includes(ct.key)
                      }"
                    >
                      <input 
                        type="checkbox"
                        :value="ct.key"
                        v-model="taxonomyGroupForm.contentTypes"
                        class="mr-2 h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div 
                        class="w-8 h-8 rounded-lg flex items-center justify-center mr-2 flex-shrink-0"
                        :class="{
                          'bg-blue-100': ct.color === 'blue',
                          'bg-green-100': ct.color === 'green',
                          'bg-purple-100': ct.color === 'purple',
                          'bg-orange-100': ct.color === 'orange',
                          'bg-red-100': ct.color === 'red',
                          'bg-gray-100': ct.color === 'gray'
                        }"
                      >
                        <i 
                          :class="ct.icon" 
                          :style="{ color: `var(--${ct.color}-600)` }"
                          class="text-sm"
                        ></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-sm text-gray-900">{{ ct.label }}</div>
                        <div class="text-xs text-gray-400 uppercase">{{ ct.key }}</div>
                      </div>
                    </label>
                  </div>
                  <p class="text-xs text-gray-500 mt-2">เลือกประเภทเนื้อหาที่ Taxonomy นี้จะใช้งานด้วย (เลือกได้หลายประเภท)</p>
                </div>

                <!-- Selection Mode Configuration -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    <i class="fas fa-mouse-pointer text-purple-600 mr-2"></i>
                    โหมดการเลือก Terms
                  </label>
                  <div class="space-y-4">
                    <!-- Selection Type -->
                    <div class="flex items-center space-x-6">
                      <label class="inline-flex items-center">
                        <input 
                          type="radio" 
                          value="single"
                          v-model="taxonomyGroupForm.selectionMode"
                          class="form-radio text-blue-600 focus:ring-blue-500"
                        />
                        <span class="ml-2 text-sm">
                          <strong>เลือกได้หนึ่งรายการ</strong>
                          <div class="text-xs text-gray-500">ผู้ใช้เลือกได้เพียง term เดียวในกลุ่มนี้</div>
                        </span>
                      </label>
                      <label class="inline-flex items-center">
                        <input 
                          type="radio" 
                          value="multiple"
                          v-model="taxonomyGroupForm.selectionMode"
                          class="form-radio text-blue-600 focus:ring-blue-500"
                        />
                        <span class="ml-2 text-sm">
                          <strong>เลือกได้หลายรายการ</strong>
                          <div class="text-xs text-gray-500">ผู้ใช้สามารถเลือกได้หลาย terms</div>
                        </span>
                      </label>
                      <label class="inline-flex items-center">
                        <input 
                          type="radio" 
                          value="limited"
                          v-model="taxonomyGroupForm.selectionMode"
                          class="form-radio text-blue-600 focus:ring-blue-500"
                        />
                        <span class="ml-2 text-sm">
                          <strong>เลือกได้จำกัด</strong>
                          <div class="text-xs text-gray-500">กำหนดจำนวนสูงสุดที่เลือกได้</div>
                        </span>
                      </label>
                    </div>

                    <!-- Selection Limit (only show when limited mode) -->
                    <div v-if="taxonomyGroupForm.selectionMode === 'limited'" class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <label class="block text-sm font-medium text-purple-800 mb-2">
                        <i class="fas fa-hashtag text-purple-600 mr-1"></i>
                        จำนวนสูงสุดที่เลือกได้
                      </label>
                      <div class="flex items-center space-x-3">
                        <input 
                          v-model.number="taxonomyGroupForm.selectionLimit" 
                          type="number"
                          min="1"
                          max="50"
                          placeholder="เช่น 3"
                          class="w-24 px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                        />
                        <span class="text-sm text-purple-700">รายการ</span>
                      </div>
                      <p class="text-xs text-purple-600 mt-2">
                        ผู้ใช้จะสามารถเลือกได้สูงสุด {{ taxonomyGroupForm.selectionLimit || 1 }} รายการจากกลุ่มนี้
                      </p>
                    </div>

                    <!-- Selection Behavior -->
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 class="text-sm font-medium text-blue-800 mb-2">
                        <i class="fas fa-info-circle text-blue-600 mr-1"></i>
                        ตัวอย่างการใช้งาน
                      </h5>
                      <div class="text-xs text-blue-700 space-y-1">
                        <div v-if="taxonomyGroupForm.selectionMode === 'single'">
                          • เหมาะสำหรับ: ระดับความยาก, ประเภทหลักสูตร, สถานะ
                        </div>
                        <div v-else-if="taxonomyGroupForm.selectionMode === 'multiple'">
                          • เหมาะสำหรับ: หมวดหมู่, แท็ก, ทักษะที่ได้รับ
                        </div>
                        <div v-else-if="taxonomyGroupForm.selectionMode === 'limited'">
                          • เหมาะสำหรับ: หมวดหมู่หลัก (เลือกได้ {{ taxonomyGroupForm.selectionLimit || 1 }} หมวด), ผู้สอนหลัก
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Description -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    <i class="fas fa-align-left text-gray-600 mr-2"></i>
                    คำอธิบาย
                  </label>
                  <textarea 
                    v-model="taxonomyGroupForm.description" 
                    rows="4"
                    placeholder="คำอธิบายกลุ่ม Taxonomy (ไม่บังคับ)"
                    class="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-all duration-200"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Field Configuration Tab -->
            <div v-if="selectedTaxonomyModalTab === 'fields'" class="p-6 bg-white">
              <div class="mb-4">
                <h4 class="text-lg font-semibold text-gray-900 mb-2">
                  <i class="fas fa-cogs text-blue-600 mr-2"></i>
                  การตั้งค่าฟิลด์สำหรับ Terms
                </h4>
                <p class="text-sm text-gray-600 mb-4">
                  กำหนดฟิลด์ที่จะใช้เก็บข้อมูลใน Terms ของ Taxonomy นี้ 
                  เช่น ชื่อ, รหัส, สถานะ, รูปภาพ, คำอธิบาย เป็นต้น
                </p>
              </div>
              
              <!-- Field Configuration Section -->
              <FieldConfigManager 
                :fieldConfig="taxonomyGroupForm.fieldConfig"
                @update:fieldConfig="taxonomyGroupForm.fieldConfig = $event"
              />
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div class="text-sm text-gray-500">
              <span v-if="selectedTaxonomyModalTab === 'basic'">
                <i class="fas fa-info-circle mr-1"></i>
                กรอกข้อมูลพื้นฐานของ Taxonomy
              </span>
              <span v-else>
                <i class="fas fa-cogs mr-1"></i>
                ตั้งค่าฟิลด์สำหรับเก็บข้อมูล Terms
              </span>
            </div>
            <div class="flex gap-3">
              <button 
                @click="closeTaxonomyModal" 
                class="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors duration-200"
              >
                <i class="fas fa-times mr-1"></i>
                ยกเลิก
              </button>
              <button 
                @click="saveTaxonomyGroup" 
                class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200"
              >
                <i class="fas fa-save mr-1"></i>
                {{ editingTaxonomyGroup ? 'อัปเดต' : 'เพิ่ม Taxonomy' }}
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3">
        <div class="bg-white rounded-lg shadow-lg min-w-[500px] max-w-[600px] border border-gray-300">
          <!-- Modal Header -->
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-red-800">
              ยืนยันการลบ
            </h3>
          </div>

          <!-- Modal Body -->
          <div class="p-4 bg-white">
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <p class="text-sm font-medium text-red-800 mb-2">
                <strong>คุณแน่ใจหรือไม่ที่จะลบ:</strong> 
                <span class="font-bold text-red-900">"{{ termToDelete?.name }}"</span>
              </p>
              
              <div v-if="termToDelete && getDeletePreview(termToDelete).count > 0" class="mt-2">
                <p class="text-sm text-red-700 mb-2">
                  <strong>⚠️ การลบนี้จะส่งผลกระทบต่อ:</strong>
                </p>
                <ul class="text-sm text-red-700 bg-red-100 rounded px-3 py-2 border border-red-200">
                  <li class="mb-1">
                    <strong>Sub Terms ที่จะถูกลบ:</strong> {{ getDeletePreview(termToDelete).count }} รายการ
                  </li>
                  <li v-if="getDeletePreview(termToDelete).children && getDeletePreview(termToDelete).children.length > 0" class="text-xs text-red-600 mt-1">
                    {{ getDeletePreview(termToDelete).children.map(c => c?.name || 'ไม่มีชื่อ').join(', ') }}
                  </li>
                </ul>
                <p class="text-sm text-red-800 mt-2 font-medium">
                  รวมทั้งหมด {{ getDeletePreview(termToDelete).count + 1 }} รายการจะถูกลบ
                </p>
              </div>
              
              <div v-else-if="termToDelete" class="mt-2">
                <p class="text-sm text-green-700 bg-green-50 rounded px-2 py-1.5 border border-green-200">
                  Term นี้ไม่มี Sub Terms จะลบเฉพาะ Term เดียวเท่านั้น
                </p>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-200">
            <button 
              @click="cancelDelete" 
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium"
            >
              ยกเลิก
            </button>
            <button 
              @click="confirmDelete" 
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
            >
              ลบแน่นอน {{ termToDelete && getDeletePreview(termToDelete).count > 0 ? `(${getDeletePreview(termToDelete).count + 1} รายการ)` : '' }}
            </button>
          </div>
        </div>
      </div>
  
      <!-- Taxonomy History Viewer -->
      <TaxonomyHistoryViewer 
        :visible="showHistoryModal"
        :targetType="historyTarget.type"
        :targetId="historyTarget.id"
        :targetName="historyTarget.name"
        @close="closeHistoryModal"
        @rollback-complete="onRollbackComplete"
      />
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import storageManager from '@/plugins/storage'
  import toast from '@/plugins/ToastUI.js'
  import dialog from '@/plugins/Dialog.js'
  import FieldConfigManager from './resource/taxonomy/FieldConfigManager.vue'
  import CustomFieldRenderer from './resource/taxonomy/CustomFieldRenderer.vue'
  import TaxonomyHistoryViewer from './resource/taxonomy/TaxonomyHistoryViewer.vue'
  import TermItem from './resource/taxonomy/TermItem.vue'
  
  export default {
    name: 'TaxonomyManager',
    
    components: {
      FieldConfigManager,
      CustomFieldRenderer,
      TaxonomyHistoryViewer,
      TermItem
    },
    
    props: {
      // ประเภทของ header layout
      headerType: {
        type: String,
        default: null,
        validator: value => ['topbar', 'breadcrumb', 'full-admin', null].includes(value)
      },
      // ความสูงของ header แบบกำหนดเอง
      headerHeight: {
        type: [Number, String],
        default: null
      },
      // ความสูงทั้งหมดแบบกำหนดเอง
      customHeight: {
        type: String,
        default: null
      },
      // CSS class เพิ่มเติม
      customClass: {
        type: String,
        default: ''
      }
    },
    
    setup(props) {
      // Session and configs from storage
      const session = storageManager.get('session')
      const configs = storageManager.get('configs')
      
      // Content types definition
      const contentTypes = ref([
        { key: 'course', label: 'คอร์สเรียน', icon: 'fas fa-graduation-cap', color: 'blue' },
        { key: 'post', label: 'โพสต์', icon: 'fas fa-file-alt', color: 'green' },
        { key: 'member', label: 'สมาชิก', icon: 'fas fa-users', color: 'purple' },
        { key: 'resource', label: 'ทรัพยากร', icon: 'fas fa-folder', color: 'orange' },
        { key: 'product', label: 'สินค้า', icon: 'fas fa-box', color: 'red' },
        { key: 'assessment', label: 'แบบประเมินผล', icon: 'fas fa-clipboard-check', color: 'indigo' }
      ])
      
      // Empty data - start fresh
      const taxonomyGroups = ref([])
      const terms = ref([])
  
      // State
      const selectedTaxonomyGroup = ref('')
      const selectedContentType = ref('') // New filter for content type
      const selectedContentTypeTab = ref('all') // New state for tab navigation
      const selectedTaxonomyModalTab = ref('basic') // New state for taxonomy modal tabs
      const expandedTerms = ref([])
      const showTermModal = ref(false)
      const showTaxonomyModal = ref(false)
      const showDeleteModal = ref(false)
      const showHistoryModal = ref(false)
      const showMobileSidebar = ref(false)
      const showMobileDropdown = ref(false) // New state for mobile dropdown
      
      // Search functionality
      const searchQuery = ref('')
      const searchResults = ref({
        groups: [],
        terms: []
      })
      
      const editingTerm = ref(null)
      const editingTaxonomyGroup = ref(null)
      const termToDelete = ref(null)
      const parentTermId = ref(null)
      const historyTarget = ref({ type: '', id: '', name: '' })
      
      const termForm = ref({
        name: '',
        code: '',
        sortOrder: 0,
        active: true,
        meta: '',
        customData: {}
      })
      
      const taxonomyGroupForm = ref({
        name: '',
        code: '',
        active: true,
        description: '',
        fieldConfig: [],
        contentTypes: [], // New field for content types
        selectionMode: 'multiple', // New field: single, multiple, limited
        selectionLimit: 3 // New field: number limit for limited mode
      })
  
      // New methods for content type filtering
      const getContentTypesDisplay = () => {
        return contentTypes.value
      }

      const getContentTypeInfo = (key) => {
        return contentTypes.value.find(ct => ct.key === key) || { label: key, icon: 'fas fa-tag', color: 'gray' }
      }

      const getGroupsByContentType = () => {
        const grouped = {}
        
        contentTypes.value.forEach(ct => {
          grouped[ct.key] = {
            ...ct,
            groups: taxonomyGroups.value.filter(group => 
              group.contentTypes && group.contentTypes.includes(ct.key)
            )
          }
        })
        
        // Add unassigned groups
        const unassignedGroups = taxonomyGroups.value.filter(group => 
          !group.contentTypes || group.contentTypes.length === 0
        )
        
        if (unassignedGroups.length > 0) {
          grouped['unassigned'] = {
            key: 'unassigned',
            label: 'ไม่ได้ระบุประเภท',
            icon: 'fas fa-question-circle',
            color: 'gray',
            groups: unassignedGroups
          }
        }
        
        return grouped
      }

      const getFilteredTaxonomyGroups = () => {
        if (!selectedContentType.value) {
          return taxonomyGroups.value
        }
        
        if (selectedContentType.value === 'unassigned') {
          return taxonomyGroups.value.filter(group => 
            !group.contentTypes || group.contentTypes.length === 0
          )
        }
        
        return taxonomyGroups.value.filter(group => 
          group.contentTypes && group.contentTypes.includes(selectedContentType.value)
        )
      }

      const selectContentType = (contentType) => {
        selectedContentType.value = contentType === selectedContentType.value ? '' : contentType
        selectedTaxonomyGroup.value = '' // Reset selected taxonomy group
      }

      const selectContentTypeTab = (tabKey) => {
        selectedContentTypeTab.value = tabKey
        selectedTaxonomyGroup.value = '' // Reset selected taxonomy group
        showMobileDropdown.value = false // Close mobile dropdown
        // Update hash for tab navigation
        if (typeof window !== 'undefined') {
          window.location.hash = `#${tabKey}`
        }
      }

      const toggleMobileDropdown = () => {
        showMobileDropdown.value = !showMobileDropdown.value
      }

      const closeMobileDropdown = () => {
        showMobileDropdown.value = false
      }

      const getCurrentTabInfo = () => {
        const tabs = getTabsData()
        return tabs.find(tab => tab.key === selectedContentTypeTab.value) || tabs[0]
      }

      const getTabsData = () => {
        const baseTabs = [
          { key: 'all', label: 'ทั้งหมด', icon: 'fas fa-list', color: 'gray', subText: 'Taxonomy ทุกประเภท' }
        ]
        
        const contentTypeTabs = contentTypes.value.map(ct => ({
          key: ct.key,
          label: ct.label,
          icon: ct.icon,
          color: ct.color,
          subText: `Taxonomy สำหรับ${ct.label}`
        }))

        return [...baseTabs, ...contentTypeTabs]
      }

      const getTabContent = () => {
        if (selectedContentTypeTab.value === 'all') {
          return getGroupsByContentType()
        } else {
          const filtered = taxonomyGroups.value.filter(group => 
            group.contentTypes && group.contentTypes.includes(selectedContentTypeTab.value)
          )
          return { [selectedContentTypeTab.value]: { 
            ...getContentTypeInfo(selectedContentTypeTab.value), 
            groups: filtered 
          }}
        }
      }
  
      // New methods for layout
      const selectTaxonomyGroup = (groupId) => {
        selectedTaxonomyGroup.value = groupId
      }
  
      const backToGroupSelection = () => {
        selectedTaxonomyGroup.value = ''
      }
  
      const toggleMobileSidebar = () => {
        showMobileSidebar.value = !showMobileSidebar.value
      }
  
      const selectTaxonomyGroupAndCloseMobile = (groupId) => {
        selectedTaxonomyGroup.value = groupId
        showMobileSidebar.value = false
      }
  
      const getTermsCountForGroup = (groupId) => {
        return terms.value.filter(term => term.taxonomy === groupId).length
      }
  
      const calculateHeaderHeight = () => {
        // ถ้ามี customHeight หรือ headerHeight ที่กำหนดไว้แล้ว ไม่ต้องคำนวณ
        if (props.customHeight || props.headerHeight) {
          if (props.headerHeight) {
            const height = typeof props.headerHeight === 'number' 
              ? `${props.headerHeight}px` 
              : props.headerHeight;
            document.documentElement.style.setProperty('--header-height', height);
          }
          return;
        }
        
        // ตรวจจับความสูงของ header elements ที่อยู่ด้านบน
        let headerHeight = 0;
        
        // ค้นหา header elements ทั่วไป
        const possibleHeaders = [
          'header',
          '.header',
          '.navbar',
          '.topbar',
          '.breadcrumb',
          '.access-bar',
          '[class*="header"]',
          '[class*="navbar"]',
          '[class*="topbar"]',
          '[role="banner"]'
        ];
        
        possibleHeaders.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (isElementAbove(element)) {
              headerHeight += element.offsetHeight;
            }
          });
        });
        
        // ถ้าไม่พบ header ให้ใช้ค่าเริ่มต้นตาม headerType
        if (headerHeight === 0) {
          switch (props.headerType) {
            case 'topbar':
              headerHeight = 120;
              break;
            case 'breadcrumb':
              headerHeight = 140;
              break;
            case 'full-admin':
              headerHeight = 160;
              break;
            default:
              headerHeight = window.innerWidth <= 768 ? 56 : 80;
          }
        }
        
        // เพิ่ม padding เล็กน้อยเพื่อความปลอดภัย
        headerHeight += 8;
        
        // ตั้งค่า CSS variable
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        
        // Log สำหรับ debug
        console.log(`Taxonomy Manager: Calculated header height = ${headerHeight}px`);
      }
      
      const isElementAbove = (element) => {
        // ตรวจสอบว่า element อยู่ด้านบนของคอมโพเนนต์นี้หรือไม่
        const taxonomyElement = document.querySelector('.taxonomy-manager-container');
        if (!taxonomyElement) return false;
        
        const elementRect = element.getBoundingClientRect();
        const taxonomyRect = taxonomyElement.getBoundingClientRect();
        
        return elementRect.bottom <= taxonomyRect.top;
      }
  
      // Computed
      const getCurrentTaxonomyGroup = () => {
        return taxonomyGroups.value.find(g => g._id === selectedTaxonomyGroup.value)
      }
  
      const getCurrentFieldConfig = () => {
        const group = getCurrentTaxonomyGroup()
        return group?.fieldConfig || []
      }
  
      const getRootTerms = () => {
        return terms.value
          .filter(t => t.taxonomy === selectedTaxonomyGroup.value && t.parentId === null)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      }
  
      const getChildTerms = (parentId) => {
        return terms.value
          .filter(t => t.parentId === parentId)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      }
  
      const getAllDescendants = (termId) => {
        const descendants = []
        const findDescendants = (parentId) => {
          const children = terms.value.filter(t => t.parentId === parentId)
          children.forEach(child => {
            descendants.push(child)
            findDescendants(child._id)
          })
        }
        findDescendants(termId)
        return descendants
      }
  
      const getDeletePreview = (term) => {
        if (!term) return { count: 0, items: [], children: [] }
        
        const descendants = getAllDescendants(term._id)
        return {
          count: descendants.length,
          items: descendants,
          children: descendants // เพิ่ม children property เพื่อความเข้ากันได้กับ template
        }
      }
  
      // API Methods
      const getTaxonomyData = async () => {
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/taxonomy/query", {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'client-token-key': configs.key 
            },
            body: JSON.stringify({
              method: 'find',
              args: [
                {
                  $and: [
                    { unit: session.current._id },
                  ],
                },
              ],
              paging: { page: 1, limit: 200 },
            }),
          })
  
          if (resAPI.ok) {
            const finalRes = await resAPI.json()
            console.log("Taxonomy data:", finalRes)
            
            // Separate taxonomy groups and terms
            const groups = finalRes.data.filter(item => item.type === 'group')
            const termItems = finalRes.data.filter(item => item.type === 'term')
            
            taxonomyGroups.value = groups
            terms.value = termItems
          } else {
            console.error('Failed to fetch taxonomy data')
          }
        } catch (error) {
          console.error('Error fetching taxonomy data:', error)
        }
      }
  
      const updateTaxonomyItem = async (id, data) => {
        try {
          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/taxonomy/${id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'client-token-key': configs.key 
            },
            body: JSON.stringify({
              data,
              options: {},
            }),
          })
  
          if (resAPI.ok) {
            await getTaxonomyData()
            const finalRes = await resAPI.json()
            console.log("Updated taxonomy item:", finalRes)
          } else {
            console.error('Failed to update taxonomy item')
          }
        } catch (error) {
          console.error('Error updating taxonomy item:', error)
        }
      }
  
      const deleteTaxonomyItem = async (id) => {
        try {
          const resAPI = await fetch(`https://gateway.cloudrestfulapi.com/api/taxonomy/${id}`, {
            method: 'DELETE',
            headers: { 
              'Content-Type': 'application/json',
              'client-token-key': configs.key 
            },
          })
  
          if (resAPI.ok) {
            await getTaxonomyData()
            const finalRes = await resAPI.json()
            console.log("Deleted taxonomy item:", finalRes)
          } else {
            console.error('Failed to delete taxonomy item')
          }
        } catch (error) {
          console.error('Error deleting taxonomy item:', error)
        }
      }
  
      // Methods
      const addTaxonomyGroup = async () => {
        taxonomyGroupForm.value = { 
          name: '', 
          code: '', 
          active: true, 
          description: '', 
          fieldConfig: [],
          contentTypes: [], // Initialize empty content types
          selectionMode: 'multiple', // Default selection mode
          selectionLimit: 3 // Default limit
        }
        editingTaxonomyGroup.value = null
        showTaxonomyModal.value = true
      }
  
      const editTaxonomyGroup = () => {
        const group = getCurrentTaxonomyGroup()
        if (group) {
          taxonomyGroupForm.value = { 
            name: group.name, 
            code: group.code || '', 
            description: group.description || '',
            active: group.active,
            fieldConfig: group.fieldConfig || [],
            contentTypes: group.contentTypes || [], // Load existing content types
            selectionMode: group.selectionMode || 'multiple', // Load existing selection mode
            selectionLimit: group.selectionLimit || 3 // Load existing selection limit
          }
          editingTaxonomyGroup.value = group
          showTaxonomyModal.value = true
        }
      }
  
      const deleteTaxonomyGroup = () => {
        const group = getCurrentTaxonomyGroup()
        if (group) {
          const termsCount = terms.value.filter(t => t.taxonomy === group._id).length
          if (termsCount > 0) {
            dialog.confirm({
              title: 'ยืนยันการลบกลุ่ม',
              message: `คุณแน่ใจหรือไม่ที่จะลบกลุ่ม "${group.name}"?\n\nจะลบ Terms ทั้งหมด ${termsCount} รายการในกลุ่มนี้ด้วย\n\nการดำเนินการนี้ไม่สามารถยกเลิกได้`,
              confirm: () => {
                const progressToast = toast({ type: 'pending', message: 'กำลังลบ Taxonomy...' })
                
                const termsToDelete = terms.value.filter(t => t.taxonomy === group._id)
                Promise.all(termsToDelete.map(term => deleteTaxonomyItem(term._id)))
                  .then(() => {
                    deleteTaxonomyItem(group._id)
                    selectedTaxonomyGroup.value = ''
                    progressToast.hide('ลบ Taxonomy สำเร็จ', 'success', 300)
                  })
                  .catch((error) => {
                    progressToast.hide(`เกิดข้อผิดพลาด: ${error.message}`, 'error', 300)
                  })
              },
              cancel: () => {
                // ไม่ทำอะไร
              }
            })
          } else {
            dialog.confirm({
              title: 'ยืนยันการลบกลุ่ม',
              message: `คุณแน่ใจหรือไม่ที่จะลบกลุ่ม "${group.name}"?`,
              confirm: () => {
                const progressToast = toast({ type: 'pending', message: 'กำลังลบ Taxonomy...' })
                
                deleteTaxonomyItem(group._id)
                  .then(() => {
                    selectedTaxonomyGroup.value = ''
                    progressToast.hide('ลบ Taxonomy สำเร็จ', 'success', 300)
                  })
                  .catch((error) => {
                    progressToast.hide(`เกิดข้อผิดพลาด: ${error.message}`, 'error', 300)
                  })
              },
              cancel: () => {
                // ไม่ทำอะไร
              }
            })
          }
        }
      }
  
      const moveTermUp = async (termId) => {
        const term = terms.value.find(t => t._id === termId)
        if (!term) return
  
        // Get sibling terms (same parent and taxonomy)
        const siblings = terms.value
          .filter(t => t.taxonomy === term.taxonomy && t.parentId === term.parentId)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  
        const currentIndex = siblings.findIndex(t => t._id === termId)
        if (currentIndex <= 0) return // Can't move up if it's already first
  
        const previousTerm = siblings[currentIndex - 1]
        
        // Swap sortOrder values - exclude _id field
        const tempOrder = term.sortOrder || 0
        // eslint-disable-next-line no-unused-vars
        const { _id, ...termDataWithoutId } = term
        // eslint-disable-next-line no-unused-vars  
        const { _id: _previousId, ...previousTermDataWithoutId } = previousTerm
        
        await updateTaxonomyItem(term._id, {
          ...termDataWithoutId,
          sortOrder: previousTerm.sortOrder || 0
        })
        await updateTaxonomyItem(previousTerm._id, {
          ...previousTermDataWithoutId,
          sortOrder: tempOrder
        })
      }
  
      const moveTermDown = async (termId) => {
        const term = terms.value.find(t => t._id === termId)
        if (!term) return
  
        // Get sibling terms (same parent and taxonomy)
        const siblings = terms.value
          .filter(t => t.taxonomy === term.taxonomy && t.parentId === term.parentId)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  
        const currentIndex = siblings.findIndex(t => t._id === termId)
        if (currentIndex >= siblings.length - 1) return // Can't move down if it's already last
  
        const nextTerm = siblings[currentIndex + 1]
        
        // Swap sortOrder values - exclude _id field
        const tempOrder = term.sortOrder || 0
        // eslint-disable-next-line no-unused-vars
        const { _id, ...termDataWithoutId } = term
        // eslint-disable-next-line no-unused-vars
        const { _id: _nextId, ...nextTermDataWithoutId } = nextTerm
        
        await updateTaxonomyItem(term._id, {
          ...termDataWithoutId,
          sortOrder: nextTerm.sortOrder || 0
        })
        await updateTaxonomyItem(nextTerm._id, {
          ...nextTermDataWithoutId,
          sortOrder: tempOrder
        })
      }
  
      const addTerm = async (parentId) => {
        // Calculate next sortOrder for new term
        const siblingTerms = terms.value
          .filter(t => 
            t.taxonomy === selectedTaxonomyGroup.value && 
            t.parentId === parentId
          )
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        
        const nextSortOrder = siblingTerms.length > 0 
          ? Math.max(...siblingTerms.map(t => t.sortOrder || 0)) + 1 
          : 0
  
        termForm.value = { 
          sortOrder: nextSortOrder, 
          customData: {} 
        }
        parentTermId.value = parentId
        editingTerm.value = null
        showTermModal.value = true
      }
  
      const editTerm = (term) => {
        termForm.value = { 
          sortOrder: term.sortOrder || 0, 
          customData: term.customData || {} 
        }
        editingTerm.value = term
        showTermModal.value = true
      }
  
      const deleteTerm = (term) => {
        termToDelete.value = term
        showDeleteModal.value = true
      }
  
      const cloneTerm = async (term) => {
        try {
          console.log('Starting clone process for term:', term)
          
          // แสดง dialog ยืนยัน
          dialog.confirm({
            title: 'ยืนยันการ Clone',
            message: `คุณต้องการ clone "${term.name}" พร้อมกับ sub terms ทั้งหมดหรือไม่?`,
            confirm: async () => {
              const progressToast = toast({ type: 'pending', message: `กำลัง clone "${term.name}"...` })
              
              try {
                // Clone the main term first
                const clonedTerm = await cloneTermRecursive(term, term.parentId)
                console.log('Successfully cloned term:', clonedTerm)
                
                // Refresh data to show all cloned terms
                await getTaxonomyData()
                
                progressToast.hide(`Clone "${term.name}" สำเร็จแล้ว!`, 'success', 500)
              } catch (error) {
                console.error('Error cloning term:', error)
                progressToast.hide(`เกิดข้อผิดพลาดในการ clone term: ${error.message}`, 'error', 500)
              }
            },
            cancel: () => {
              // ไม่ทำอะไร
            }
          })
        } catch (error) {
          console.error('Error in cloneTerm:', error)
          toast({ type: 'error', message: `เกิดข้อผิดพลาด: ${error.message}`, autohide: true })
        }
      }
  
      const cloneTermRecursive = async (originalTerm, newParentId, isRoot = true) => {
        // Calculate next sortOrder for the cloned term
        const siblingTerms = terms.value
          .filter(t => 
            t.taxonomy === originalTerm.taxonomy && 
            t.parentId === newParentId
          )
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        
        const nextSortOrder = siblingTerms.length > 0 
          ? Math.max(...siblingTerms.map(t => t.sortOrder || 0)) + 1 
          : 0
  
        // Create the cloned term data
        const clonedTermData = {
          type: 'term',
          taxonomy: originalTerm.taxonomy,
          name: isRoot ? `Copy of ${originalTerm.name}` : originalTerm.name,
          code: originalTerm.code ? `${originalTerm.code}_COPY_${Date.now()}` : '',
          parentId: newParentId,
          sortOrder: nextSortOrder,
          active: originalTerm.active !== false,
          meta: originalTerm.meta || '',
          customData: originalTerm.customData || {}
        }
  
        // Create the new term in database
        const response = await fetch("https://gateway.cloudrestfulapi.com/api/taxonomy/", {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'client-token-key': configs.key 
          },
          body: JSON.stringify({
            data: {
              unit: session.current._id,
              ...clonedTermData
            },
            options: {},
          }),
        })
  
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to create cloned term: ${response.status} - ${errorText}`)
        }
  
        const result = await response.json()
        console.log('Clone API response:', result)
        
        // Handle different possible response structures
        let newTermId = null
        if (result && result.data && result.data._id) {
          newTermId = result.data._id
        } else if (result && result._id) {
          newTermId = result._id
        } else if (result && result.insertedId) {
          newTermId = result.insertedId
        } else {
          console.error('Unexpected API response structure:', result)
          throw new Error('ไม่สามารถดึง ID ของ term ที่สร้างใหม่ได้')
        }
  
        console.log('New term ID:', newTermId)
  
        // Find and clone all children of the original term (need to refresh data first)
        await getTaxonomyData()
        const childTerms = terms.value.filter(t => t.parentId === originalTerm._id)
        
        if (childTerms.length > 0) {
          console.log(`Cloning ${childTerms.length} child terms for parent:`, originalTerm.name)
          // Clone each child term recursively
          for (const childTerm of childTerms) {
            await cloneTermRecursive(childTerm, newTermId, false)
          }
        }
  
        return result
      }
  
      const saveTerm = async () => {
        try {
          // Validate required custom fields
          const fieldConfig = getCurrentFieldConfig()
          let validationErrors = []
          
          fieldConfig.forEach(field => {
            const value = termForm.value.customData[field.key]
            
            // Required field validation
            if (field.required) {
              if (!value || (typeof value === 'string' && !value.trim())) {
                validationErrors.push(`${field.label} เป็นฟิลด์บังคับ`)
              }
            }
            
            // Unique field validation
            if (field.unique && value && (typeof value === 'string' ? value.trim() : value)) {
              const isDuplicate = terms.value.some(term => {
                // Skip current term when editing
                if (editingTerm.value && term._id === editingTerm.value._id) return false
                
                // Only check terms in the same taxonomy group
                if (term.taxonomy !== selectedTaxonomyGroup.value) return false
                
                // Check custom data for the field
                const termValue = term.customData?.[field.key]
                if (!termValue) return false
                
                const normalizedValue = typeof value === 'string' ? value.toLowerCase().trim() : value
                const normalizedTermValue = typeof termValue === 'string' 
                  ? termValue.toLowerCase().trim() 
                  : termValue
                  
                return normalizedTermValue === normalizedValue
              })
              
              if (isDuplicate) {
                validationErrors.push(`${field.label} ซ้ำกัน กรุณาใช้ข้อมูลอื่น`)
              }
            }
          })
  
          if (validationErrors.length > 0) {
            toast({ 
              type: 'error', 
              title: 'ข้อมูลไม่ถูกต้อง',
              message: `กรุณาแก้ไขข้อผิดพลาด:\n${validationErrors.join('\n')}`, 
              autohide: true 
            })
            return
          }
  
          const progressToast = toast({ type: 'pending', message: editingTerm.value ? 'กำลังอัปเดต Term...' : 'กำลังสร้าง Term...' })
  
          const isEditing = editingTerm.value !== null
          const beforeData = isEditing ? { ...editingTerm.value } : null
          
          // Get name for display purposes (try to find name field in custom data)
          const nameField = termForm.value.customData?.name || termForm.value.customData?.ชื่อ
          const displayName = nameField || `Term-${Date.now()}`
          
          const termData = {
            type: 'term',
            taxonomy: selectedTaxonomyGroup.value,
            name: displayName.trim(), // Keep for backward compatibility
            parentId: parentTermId.value,
            sortOrder: termForm.value.sortOrder || 0,
            active: true,
            customData: termForm.value.customData || {}
          }
  
          if (isEditing) {
            // Update existing term using the existing updateTaxonomyItem function
            await updateTaxonomyItem(editingTerm.value._id, termData)
            
            // Create audit log
            await createAuditLog(
              'UPDATE',
              'term',
              editingTerm.value._id,
              displayName,
              termData,
              beforeData
            )
            
            // Create cascade audit log for parent if this is a sub term
            if (editingTerm.value && editingTerm.value.parentId) {
              const parentTerm = terms.value.find(t => t._id === editingTerm.value.parentId)
              if (parentTerm) {
                await createCascadeAuditLogDirect('UPDATE', parentTerm, editingTerm.value)
              }
            }
            
            progressToast.hide('อัปเดต Term สำเร็จ', 'success', 300)
          } else {
            // Create new term using the existing taxonomy API
            try {
              const response = await fetch("https://gateway.cloudrestfulapi.com/api/taxonomy/", {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'client-token-key': configs.key 
                },
                body: JSON.stringify({
                  data: {
                    unit: session.current._id,
                    ...termData
                  },
                  options: {},
                }),
              })
  
              if (response.ok) {
                const result = await response.json()
                const newTermId = result.data?._id || result._id
                
                // Create audit log
                await createAuditLog(
                  'CREATE',
                  'term',
                  newTermId,
                  displayName,
                  termData
                )
                
                // Create cascade audit log for parent if this is a sub term  
                if (parentTermId.value) {
                  const parentTerm = terms.value.find(t => t._id === parentTermId.value)
                  if (parentTerm) {
                    // สร้าง object ที่เหมือน sub term ที่ถูกสร้าง
                    const newSubTerm = {
                      _id: newTermId,
                      name: displayName,
                      ...termData
                    }
                    await createCascadeAuditLogDirect('CREATE', parentTerm, newSubTerm)
                  }
                }
                
                progressToast.hide('เพิ่ม Term สำเร็จ', 'success', 300)
                await getTaxonomyData()
              } else {
                const error = await response.json()
                progressToast.hide(`เกิดข้อผิดพลาด: ${error.message}`, 'error', 300)
              }
            } catch (error) {
              console.error('Error creating term:', error)
              progressToast.hide(`เกิดข้อผิดพลาด: ${error.message}`, 'error', 300)
            }
          }
          
          closeTermModal()
          
        } catch (error) {
          console.error('Error saving term:', error)
          toast({ type: 'error', message: `เกิดข้อผิดพลาด: ${error.message}`, autohide: true })
        }
      }
  
      const saveTaxonomyGroup = async () => {
        if (!taxonomyGroupForm.value.name?.trim()) {
          toast({ type: 'error', message: 'กรุณากรอกชื่อ Taxonomy', autohide: true })
          return
        }
  
        if (!taxonomyGroupForm.value.contentTypes || taxonomyGroupForm.value.contentTypes.length === 0) {
          toast({ type: 'error', message: 'กรุณาเลือกประเภทเนื้อหาอย่างน้อย 1 ประเภท', autohide: true })
          return
        }
  
        try {
          const progressToast = toast({ type: 'pending', message: editingTaxonomyGroup.value ? 'กำลังอัปเดตกลุ่ม...' : 'กำลังสร้างกลุ่ม...' })
  
          const isEditing = editingTaxonomyGroup.value !== null
          const beforeData = isEditing ? { ...editingTaxonomyGroup.value } : null
          
          const groupData = {
            type: 'group',
            name: taxonomyGroupForm.value.name.trim(),
            code: taxonomyGroupForm.value.code?.trim() || '',
            description: taxonomyGroupForm.value.description?.trim() || '',
            active: taxonomyGroupForm.value.active !== false,
            fieldConfig: taxonomyGroupForm.value.fieldConfig || [],
            contentTypes: taxonomyGroupForm.value.contentTypes || [], // Save content types
            selectionMode: taxonomyGroupForm.value.selectionMode || 'multiple', // Save selection mode
            selectionLimit: taxonomyGroupForm.value.selectionMode === 'limited' 
              ? (taxonomyGroupForm.value.selectionLimit || 3) 
              : null // Save selection limit only for limited mode
          }
  
          if (isEditing) {
            // Update existing group using the existing updateTaxonomyItem function
            await updateTaxonomyItem(editingTaxonomyGroup.value._id, groupData)
            
            // Create audit log
            await createAuditLog(
              'UPDATE',
              'group',
              editingTaxonomyGroup.value._id,
              groupData.name,
              groupData,
              beforeData
            )
            
            progressToast.hide('อัปเดตกลุ่ม Taxonomy สำเร็จ', 'success', 300)
          } else {
            // Create new group using the existing taxonomy API
            try {
              const response = await fetch("https://gateway.cloudrestfulapi.com/api/taxonomy/", {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'client-token-key': configs.key 
                },
                body: JSON.stringify({
                  data: {
                    unit: session.current._id,
                    ...groupData
                  },
                  options: {},
                }),
              })
  
              if (response.ok) {
                const result = await response.json()
                
                // Create audit log
                await createAuditLog(
                  'CREATE',
                  'group',
                  result.data?._id || result._id,
                  groupData.name,
                  groupData
                )
                
                progressToast.hide('สร้างกลุ่ม Taxonomy สำเร็จ', 'success', 300)
                await getTaxonomyData()
              } else {
                const error = await response.json()
                progressToast.hide(`เกิดข้อผิดพลาด: ${error.message}`, 'error', 300)
              }
            } catch (error) {
              console.error('Error creating taxonomy group:', error)
              progressToast.hide(`เกิดข้อผิดพลาด: ${error.message}`, 'error', 300)
            }
          }
          
          closeTaxonomyModal()
          
        } catch (error) {
          console.error('Error saving taxonomy group:', error)
          toast({ type: 'error', message: `เกิดข้อผิดพลาด: ${error.message}`, autohide: true })
        }
      }
  
      const confirmDelete = async () => {
        try {
          const termData = termToDelete.value
          const termName = termData.name || 'Unknown Term'
          
          const deletePreview = getDeletePreview(termData)
          const totalToDelete = deletePreview.count + 1 // +1 for the main term
          
          const progressToast = toast({ type: 'pending', message: `กำลังลบ "${termName}"...` })
          
          // Get all descendants to delete
          const toDelete = [termToDelete.value._id]
          const findDescendants = (parentId) => {
            const children = terms.value.filter(t => t.parentId === parentId)
            children.forEach(child => {
              toDelete.push(child._id)
              findDescendants(child._id)
            })
          }
          findDescendants(termToDelete.value._id)
  
          console.log(`Deleting ${toDelete.length} terms cascading from "${termName}"`)
  
          // 1. สร้าง audit logs ก่อนลบ (ขณะที่ข้อมูลยังครบ)
          const auditPromises = []
          const cascadeAuditLogs = []
  
          for (const termId of toDelete) {
            const termToAudit = terms.value.find(t => t._id === termId)
            if (termToAudit) {
              auditPromises.push(createAuditLog(
                'DELETE',
                'term',
                termId,
                termToAudit.name || 'Unknown',
                null,
                termToAudit
              ))
  
              // เก็บข้อมูลสำหรับ cascade audit logs
              if (termToAudit.parentId) {
                const parentTerm = terms.value.find(t => t._id === termToAudit.parentId)
                if (parentTerm && !toDelete.includes(parentTerm._id)) {
                  cascadeAuditLogs.push({
                    parentTerm,
                    deletedSubTerm: termToAudit
                  })
                }
              }
            }
          }
  
          await Promise.all(auditPromises)
  
          // 2. สร้าง cascade audit logs ก่อนลบ terms (ขณะที่ข้อมูลยังครบ)
          for (const cascadeInfo of cascadeAuditLogs) {
            await createCascadeAuditLogDirect(
              'DELETE',
              cascadeInfo.parentTerm,
              cascadeInfo.deletedSubTerm
            )
          }
  
          // 3. Delete all terms from database
          for (const id of toDelete) {
            await deleteTaxonomyItem(id)
            console.log(`🗑️ Deleted term from database: ${id}`)
          }
  
          // Show success message
          if (deletePreview.count > 0) {
            progressToast.hide(`ลบ "${termName}" และ Sub Terms ทั้งหมด ${totalToDelete} รายการสำเร็จแล้ว\n📝 บันทึก audit logs สำหรับทุก term แล้ว`, 'success', 500)
          } else {
            progressToast.hide(`ลบ "${termName}" สำเร็จแล้ว\n📝 บันทึก audit log แล้ว`, 'success', 500)
          }
  
          cancelDelete()
          
        } catch (error) {
          console.error('Error deleting terms:', error)
          toast({ type: 'error', message: `เกิดข้อผิดพลาดในการลบ: ${error.message}`, autohide: true })
        }
      }
  
      const cancelDelete = () => {
        termToDelete.value = null
        showDeleteModal.value = false
      }
  
      const closeTermModal = () => {
        showTermModal.value = false
        editingTerm.value = null
        parentTermId.value = null
        termForm.value = { sortOrder: 0, customData: {} }
      }
  
      const closeTaxonomyModal = () => {
        showTaxonomyModal.value = false
        editingTaxonomyGroup.value = null
        selectedTaxonomyModalTab.value = 'basic' // Reset tab when closing
        taxonomyGroupForm.value = { 
          name: '', 
          code: '', 
          description: '', 
          active: true, 
          fieldConfig: [],
          contentTypes: [], // Reset content types
          selectionMode: 'multiple', // Reset selection mode
          selectionLimit: 3 // Reset selection limit
        }
      }
  
      const toggleChildren = (termId) => {
        const index = expandedTerms.value.indexOf(termId)
        if (index === -1) {
          expandedTerms.value.push(termId)
        } else {
          expandedTerms.value.splice(index, 1)
        }
      }
  
      // Global functions for onclick handlers
      // REMOVED: window.taxonomyManager - replaced with TermItem component events
      /*
      if (typeof window !== 'undefined') {
        window.taxonomyManager = {
          addTerm: (parentId) => addTerm(parentId === 'null' ? null : parentId),
          editTerm: (termId) => {
            const term = terms.value.find(t => t._id === termId)
            if (term) editTerm(term)
          },
          deleteTerm: (termId) => {
            const term = terms.value.find(t => t._id === termId)
            if (term) deleteTerm(term)
          },
          cloneTerm: (termId) => {
            const term = terms.value.find(t => t._id === termId)
            if (term) cloneTerm(term)
          },
          moveTermUp: (termId) => moveTermUp(termId),
          moveTermDown: (termId) => moveTermDown(termId),
          toggleChildren: (termId) => toggleChildren(termId),
          showTermHistory: (termId) => {
            const term = terms.value.find(t => t._id === termId)
            if (term) {
              historyTarget.value = { type: 'term', id: termId, name: term.name }
              showHistoryModal.value = true
            }
          }
        }
      }
      */
  
      const exportData = () => {
        const data = {
          taxonomyGroups: taxonomyGroups.value,
          terms: terms.value
        }
        console.log('Export data:', JSON.stringify(data, null, 2))
        
        // Create download link
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'taxonomy-data.json'
        a.click()
        URL.revokeObjectURL(url)
      }
  
      const importData = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = (e) => {
          const file = e.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              try {
                const data = JSON.parse(e.target.result)
                if (data.taxonomyGroups && data.terms) {
                  taxonomyGroups.value = data.taxonomyGroups
                  terms.value = data.terms
                  selectedTaxonomyGroup.value = ''
                  expandedTerms.value = []
                }
              } catch (err) {
                alert('Invalid JSON file')
              }
            }
            reader.readAsText(file)
          }
        }
        input.click()
      }
  
      const purgeLogs = async () => {
        try {
          // First, get count of logs to delete
          const countResponse = await fetch('https://gateway.cloudrestfulapi.com/api/taxonomy_audit/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': configs.key
            },
            body: JSON.stringify({
              method: 'find',
              args: [{ unit: session.current._id }],
              paging: { page: 1, limit: 1 }
            })
          })
  
          if (!countResponse.ok) {
            toast({ type: 'error', message: 'ไม่สามารถตรวจสอบจำนวน logs ได้', autohide: true })
            return
          }
  
          const countResult = await countResponse.json()
          const totalLogs = countResult.total || 0
  
          if (totalLogs === 0) {
            toast({ type: 'info', message: 'ไม่มี audit logs ให้ลบ', autohide: true })
            return
          }
  
          // Confirmation dialog with Dialog.js
          dialog.confirm({
            title: 'ยืนยันการลบ Audit Logs',
            message: `คุณแน่ใจหรือไม่ที่จะลบ Audit Logs ทั้งหมด?\n\nจำนวน logs ที่จะลบ: ${totalLogs} รายการ\n\nการดำเนินการนี้ไม่สามารถยกเลิกได้\nจะลบประวัติการเปลี่ยนแปลงทั้งหมดของ Taxonomy`,
            confirm: async () => {
              const progressToast = toast({ type: 'pending', message: 'กำลังลบ audit logs...' })

              try {
                // Get all logs to delete
                const logsResponse = await fetch('https://gateway.cloudrestfulapi.com/api/taxonomy_audit/query', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'client-token-key': configs.key
                  },
                  body: JSON.stringify({
                    method: 'find',
                    args: [{ unit: session.current._id }],
                    paging: { page: 1, limit: 10000 } // Get all logs
                  })
                })
        
                if (!logsResponse.ok) {
                  progressToast.hide('ไม่สามารถดึงรายการ logs ได้', 'error', 300)
                  return
                }
        
                const logsResult = await logsResponse.json()
                const logIds = logsResult.data?.map(log => log._id) || []
                const actualCount = logIds.length
        
                if (actualCount === 0) {
                  progressToast.hide('ไม่มี audit logs ให้ลบ', 'info', 300)
                  return
                }
        
                // Delete logs one by one
                let deletedCount = 0
                for (const logId of logIds) {
                  try {
                    const deleteResponse = await fetch(`https://gateway.cloudrestfulapi.com/api/taxonomy_audit/${logId}`, {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                        'client-token-key': configs.key
                      }
                    })
        
                    if (deleteResponse.ok) {
                      deletedCount++
                    } else {
                      console.warn(`Failed to delete log: ${logId}`)
                    }
                  } catch (error) {
                    console.warn(`Error deleting log ${logId}:`, error)
                  }
                }
        
                if (deletedCount > 0) {
                  progressToast.hide(`ลบ audit logs สำเร็จ\nลบแล้ว: ${deletedCount}/${actualCount} รายการ`, 'success', 500)
                } else {
                  progressToast.hide('ไม่สามารถลบ audit logs ได้', 'error', 300)
                }
              } catch (error) {
                console.error('Error in delete operation:', error)
                progressToast.hide('เกิดข้อผิดพลาดในการลบ logs', 'error', 300)
              }
            },
            cancel: () => {
              // ไม่ทำอะไร
            }
          })

        } catch (error) {
          console.error('Error purging logs:', error)
          toast({ type: 'error', message: 'เกิดข้อผิดพลาดในการลบ logs', autohide: true })
        }
      }
  
      const showGroupHistory = () => {
        historyTarget.value = { type: 'group', id: selectedTaxonomyGroup.value, name: getCurrentTaxonomyGroup()?.name }
        showHistoryModal.value = true
      }
  
      const showTermHistoryHandler = (term) => {
        historyTarget.value = { type: 'term', id: term._id, name: term.name }
        showHistoryModal.value = true
      }
  
      const closeHistoryModal = () => {
        showHistoryModal.value = false
      }
  
      const onRollbackComplete = async (rollbackInfo) => {
        // Handle rollback complete
        console.log('Rollback completed:', rollbackInfo)
        
        try {
          const progressToast = toast({ type: 'pending', message: 'กำลังรีเฟรชข้อมูล...' })
          
          // Refresh taxonomy data to show the rolled back changes
          await getTaxonomyData()
          
          // Show success message with details
          const targetTypeName = rollbackInfo.targetType === 'group' ? 'กลุ่ม' : 'Term'
          progressToast.hide(`กู้คืน${targetTypeName}สำเร็จ - ข้อมูลได้รับการอัพเดตแล้ว`, 'success', 500)
          
          // Close history modal
          closeHistoryModal()
          
        } catch (error) {
          console.error('Error refreshing data after rollback:', error)
          toast({ type: 'error', message: 'กู้คืนสำเร็จแต่เกิดข้อผิดพลาดในการรีเฟรชข้อมูล', autohide: true })
        }
      }
  
      // Audit Logging Functions
      const createAuditLog = async (action, targetType, targetId, targetName, data, beforeData = null) => {
        try {
          const auditData = {
            action, // CREATE, UPDATE, DELETE, ROLLBACK
            targetType, // 'group' or 'term'
            targetId,
            targetName,
            userId: 'current-user-id', // TODO: Get actual user ID from auth
            userName: 'Current User', // TODO: Get actual user name from auth
            timestamp: new Date().toISOString(),
            data: data,
            diff: beforeData ? {
              before: beforeData,
              after: data
            } : null,
            changesSummary: beforeData ? generateChangesSummary(beforeData, data) : null,
            version: `${Date.now()}`, // Simple version using timestamp
            userAgent: navigator.userAgent,
            ipAddress: 'auto-detect', // TODO: Get actual IP if needed
            unit: session.current._id // Add unit reference for filtering
          }
  
          const response = await fetch('https://gateway.cloudrestfulapi.com/api/taxonomy_audit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': configs.key
            },
            body: JSON.stringify({
              data: auditData,
              options: {}
            })
          })
  
          if (!response.ok) {
            console.warn('Failed to create audit log:', await response.text())
          } else {
            const result = await response.json()
            console.log('Audit log created:', result)
          }
        } catch (error) {
          console.warn('Error creating audit log:', error)
        }
      }
  
      // Create cascade audit log for parent terms when sub terms change
      const createCascadeAuditLog = async (action, termId, termName, subTermData) => {
        try {
          const term = terms.value.find(t => t._id === termId)
          if (!term || !term.parentId) {
            console.log(`⚠️ Skipping cascade audit log - no parent found for term: ${termName} (${termId})`)
            return // Only for sub terms
          }
          
          const parentTerm = terms.value.find(t => t._id === term.parentId)
          if (!parentTerm) {
            console.log(`⚠️ Parent term not found for: ${termName} (Parent ID: ${term.parentId})`)
            return
          }
          
          console.log(`🔗 Creating cascade audit log for parent "${parentTerm.name}" due to sub term "${termName}" ${action}`)
          
          // Create audit log for parent term about sub term changes
          const cascadeAuditData = {
            action: `SUB_${action}`, // SUB_CREATE, SUB_UPDATE, SUB_DELETE
            targetType: 'term',
            targetId: parentTerm._id,
            targetName: `${parentTerm.name} (Sub term activity)`,
            userId: 'current-user-id',
            userName: 'Current User',
            timestamp: new Date().toISOString(),
            data: {
              parentTerm: parentTerm,
              subTermAction: action,
              subTermId: termId,
              subTermName: termName,
              subTermData: subTermData
            },
            version: `${Date.now()}`,
            userAgent: navigator.userAgent,
            ipAddress: 'auto-detect',
            unit: session.current._id
          }
  
          const response = await fetch('https://gateway.cloudrestfulapi.com/api/taxonomy_audit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': configs.key
            },
            body: JSON.stringify({
              data: cascadeAuditData,
              options: {}
            })
          })
  
          if (response.ok) {
            console.log(`✅ Cascade audit log created for parent term: ${parentTerm.name}`)
          } else {
            const error = await response.text()
            console.warn(`❌ Failed to create cascade audit log:`, error)
          }
        } catch (error) {
          console.warn('Error creating cascade audit log:', error)
        }
      }
  
      // Create cascade audit log with direct parent and sub term data
      const createCascadeAuditLogDirect = async (action, parentTerm, subTerm) => {
        try {
          console.log(`🔗 Creating direct cascade audit log for parent "${parentTerm.name}" due to sub term "${subTerm.name}" ${action}`)
          
          // Create audit log for parent term about sub term changes
          const cascadeAuditData = {
            action: `SUB_${action}`, // SUB_CREATE, SUB_UPDATE, SUB_DELETE
            targetType: 'term',
            targetId: parentTerm._id,
            targetName: `${parentTerm.name} (Sub term activity: ${action})`,
            userId: 'current-user-id',
            userName: 'Current User',
            timestamp: new Date().toISOString(),
            data: {
              parentTerm: parentTerm,
              subTermAction: action,
              subTermId: subTerm._id,
              subTermName: subTerm.name,
              subTermData: subTerm
            },
            version: `${Date.now()}`,
            userAgent: navigator.userAgent,
            ipAddress: 'auto-detect',
            unit: session.current._id
          }
  
          const response = await fetch('https://gateway.cloudrestfulapi.com/api/taxonomy_audit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'client-token-key': configs.key
            },
            body: JSON.stringify({
              data: cascadeAuditData,
              options: {}
            })
          })
  
          if (response.ok) {
            console.log(`✅ Direct cascade audit log created for parent term: ${parentTerm.name}`)
          } else {
            const error = await response.text()
            console.warn(`❌ Failed to create direct cascade audit log:`, error)
          }
        } catch (error) {
          console.warn('Error creating direct cascade audit log:', error)
        }
      }
  
      const generateChangesSummary = (before, after) => {
        const changes = []
        const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})])
        
        for (const key of allKeys) {
          const beforeValue = before?.[key]
          const afterValue = after?.[key]
          
          if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
            changes.push({
              field: key,
              from: beforeValue,
              to: afterValue
            })
          }
        }
        
        return changes
      }
  
      // Search functionality methods
      const performSearch = () => {
        if (!searchQuery.value.trim()) {
          searchResults.value = { groups: [], terms: [] }
          return
        }

        const query = searchQuery.value.toLowerCase().trim()
        
        // Search in taxonomy groups
        const filteredGroups = taxonomyGroups.value.filter(group => {
          return (
            group.name?.toLowerCase().includes(query) ||
            group.code?.toLowerCase().includes(query) ||
            group.description?.toLowerCase().includes(query)
          )
        })

        // Search in terms
        const filteredTerms = terms.value.filter(term => {
          const hasMatchInCustomData = term.customData && Object.values(term.customData).some(value => 
            typeof value === 'string' && value.toLowerCase().includes(query)
          )
          
          return (
            term.name?.toLowerCase().includes(query) ||
            term.code?.toLowerCase().includes(query) ||
            hasMatchInCustomData
          )
        })

        searchResults.value = {
          groups: filteredGroups,
          terms: filteredTerms
        }
      }

      const clearSearch = () => {
        searchQuery.value = ''
        searchResults.value = { groups: [], terms: [] }
      }

      const getTaxonomyGroupName = (groupId) => {
        const group = taxonomyGroups.value.find(g => g._id === groupId)
        return group?.name || 'ไม่ระบุกลุ่ม'
      }
  
      // Load data on mount
      getTaxonomyData()
  
      const getCurrentTaxonomyGroupTitle = () => {
        const group = getCurrentTaxonomyGroup()
        if (!group) return ''
        
        if (group.contentTypes && group.contentTypes.length > 0) {
          const contentTypeNames = group.contentTypes.map(ctKey => {
            const ct = getContentTypeInfo(ctKey)
            return ct.label
          }).join(', ')
          return `${contentTypeNames} > ${group.name}`
        }
        
        return group.name
      }
  
      return {
        // Data
        taxonomyGroups,
        terms,
        selectedTaxonomyGroup,
        selectedContentType, // New
        selectedContentTypeTab, // New
        contentTypes, // New
        expandedTerms,
        showTermModal,
        showTaxonomyModal,
        showDeleteModal,
        showHistoryModal,
        showMobileSidebar,
        showMobileDropdown, // New
        editingTerm,
        editingTaxonomyGroup,
        termToDelete,
        termForm,
        taxonomyGroupForm,
        historyTarget,
        session,
        
        // Search variables
        searchQuery,
        searchResults,
        
        // Methods
        getCurrentTaxonomyGroup,
        getRootTerms,
        getChildTerms,
        getTermsForGroup: () => {
          return terms.value.filter(t => t.taxonomy === selectedTaxonomyGroup.value)
        },
        getSubTermsCount: () => {
          return terms.value.filter(t => 
            t.taxonomy === selectedTaxonomyGroup.value && 
            t.parentId !== null
          ).length
        },
        getActiveTermsCount: () => {
          return terms.value.filter(t => 
            t.taxonomy === selectedTaxonomyGroup.value && 
            t.active !== false
          ).length
        },
        getAllDescendants,
        getDeletePreview,
        getCurrentFieldConfig,
        getContentTypesDisplay, // New
        getContentTypeInfo, // New
        getGroupsByContentType, // New
        getFilteredTaxonomyGroups, // New
        selectContentType, // New
        selectContentTypeTab, // New
        selectTaxonomyGroup,
        backToGroupSelection,
        toggleMobileSidebar,
        selectTaxonomyGroupAndCloseMobile,
        getTermsCountForGroup,
        calculateHeaderHeight,
        addTaxonomyGroup,
        editTaxonomyGroup,
        deleteTaxonomyGroup,
        addTerm,
        editTerm,
        deleteTerm,
        saveTerm,
        saveTaxonomyGroup,
        confirmDelete,
        cancelDelete,
        closeTermModal,
        closeTaxonomyModal,
        getTaxonomyData,
        updateTaxonomyItem,
        deleteTaxonomyItem,
        exportData,
        importData,
        moveTermUp,
        moveTermDown,
        cloneTerm,
        toggleChildren,
        showGroupHistory,
        showTermHistoryHandler,
        closeHistoryModal,
        onRollbackComplete,
        createAuditLog,
        createCascadeAuditLog,
        createCascadeAuditLogDirect,
        generateChangesSummary,
        purgeLogs,
        getTabsData,
        getTabContent,
        toggleMobileDropdown,
        closeMobileDropdown,
        getCurrentTabInfo,
        getCurrentTaxonomyGroupTitle,
        performSearch,
        clearSearch,
        getTaxonomyGroupName,
        selectedTaxonomyModalTab
      }
    },
  
    mounted() {
      this.calculateHeaderHeight();
      window.addEventListener('resize', this.calculateHeaderHeight);
      
      // Handle tab navigation from hash (similar to Index.vue)
      try {
        const hash = window.location.hash;
        if (hash) {
          const tabKey = hash.replace('#', '');
          const validTabs = ['all', ...this.contentTypes.map(ct => ct.key)];
          if (validTabs.includes(tabKey)) {
            this.selectedContentTypeTab = tabKey;
          }
        }
      } catch (error) {
        console.log('Hash navigation error:', error);
      }
    },
  
    beforeUnmount() {
      window.removeEventListener('resize', this.calculateHeaderHeight);
    }
  }
  </script>
  
  <style scoped>
  /* Taxonomy Manager container with dynamic height calculation */
  .taxonomy-manager-container {
    height: calc(100vh - var(--header-height, 64px));
    max-height: calc(100vh - var(--header-height, 64px));
    overflow: hidden;
  }
  
  /* Content type color variables */
  :root {
    --blue-500: #3b82f6;
    --blue-600: #2563eb;
    --green-500: #10b981;
    --green-600: #059669;
    --purple-500: #8b5cf6;
    --purple-600: #7c3aed;
    --orange-500: #f59e0b;
    --orange-600: #d97706;
    --red-500: #ef4444;
    --red-600: #dc2626;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
  }
  
  /* Content type specific background colors */
  .bg-blue-100 { background-color: #dbeafe; }
  .bg-green-100 { background-color: #dcfce7; }
  .bg-purple-100 { background-color: #e9d5ff; }
  .bg-orange-100 { background-color: #fed7aa; }
  .bg-red-100 { background-color: #fee2e2; }
  .bg-gray-100 { background-color: #f3f4f6; }
  
  /* Responsive header heights */
  @media (min-width: 1024px) {
    .taxonomy-manager-container {
      height: calc(100vh - var(--header-height, 80px));
      max-height: calc(100vh - var(--header-height, 80px));
    }
  }
  
  @media (max-width: 768px) {
    .taxonomy-manager-container {
      height: calc(100vh - var(--header-height, 56px));
      max-height: calc(100vh - var(--header-height, 56px));
    }
  }
  
  /* Alternative fixed heights for common header sizes */
  .taxonomy-manager-container.with-topbar {
    height: calc(100vh - 120px); /* Header + Topbar */
    max-height: calc(100vh - 120px);
  }
  
  .taxonomy-manager-container.with-breadcrumb {
    height: calc(100vh - 140px); /* Header + Breadcrumb */
    max-height: calc(100vh - 140px);
  }
  
  .taxonomy-manager-container.with-full-admin {
    height: calc(100vh - 160px); /* Full admin layout */
    max-height: calc(100vh - 160px);
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
  
  /* Smooth transitions */
  .transition-all {
    transition: all 0.2s ease-in-out;
  }
  
  .transition-colors {
    transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
  }
  
  .transition-transform {
    transition: transform 0.3s ease-in-out;
  }
  
  /* Focus states */
  .focus\:ring-2:focus {
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.5);
  }
  
  /* Hover effects */
  .hover\:shadow-md:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  /* Sidebar styles */
  .sidebar-menu-item {
    position: relative;
    overflow: hidden;
  }
  
  .sidebar-menu-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: transparent;
    transition: background-color 0.2s ease-in-out;
  }
  
  .sidebar-menu-item.active::before {
    background: #16a34a;
  }
  
  /* Mobile sidebar animation */
  .mobile-sidebar-enter {
    transform: translateX(-100%);
  }
  
  .mobile-sidebar-enter-active {
    transition: transform 0.3s ease-out;
  }
  
  .mobile-sidebar-enter-to {
    transform: translateX(0);
  }
  
  .mobile-sidebar-leave {
    transform: translateX(0);
  }
  
  .mobile-sidebar-leave-active {
    transition: transform 0.3s ease-in;
  }
  
  .mobile-sidebar-leave-to {
    transform: translateX(-100%);
  }
  
  /* Stats cards hover effect */
  .stats-card {
    transition: all 0.2s ease-in-out;
  }
  
  .stats-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* Button hover effects */
  .btn-primary {
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
    transition: all 0.2s ease-in-out;
  }
  
  .btn-primary:hover {
    background: linear-gradient(135deg, #15803d 0%, #166534 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  }
  
  /* Taxonomy group card animations */
  .taxonomy-group-card {
    transition: all 0.2s ease-in-out;
    position: relative;
    overflow: hidden;
  }
  
  .taxonomy-group-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s ease-in-out;
  }
  
  .taxonomy-group-card:hover::before {
    left: 100%;
  }
  
  .taxonomy-group-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #16a34a;
  }
  
  /* Status badges */
  .status-badge {
    position: relative;
    overflow: hidden;
  }
  
  .status-badge::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.3s ease-in-out;
  }
  
  .status-badge:hover::before {
    left: 100%;
  }
  
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
  
  /* Loading states */
  .loading-spinner {
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
  
  /* Pulse animation for new items */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }
  
  /* Mobile responsive adjustments */
  @media (max-width: 1024px) {
    .sidebar-desktop {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    .gap-3 {
      gap: 0.5rem;
    }
    
    .p-4 {
      padding: 0.75rem;
    }
    
    .text-sm {
      font-size: 0.8rem;
    }
  }
  
  /* Dark mode support (if needed) */
  @media (prefers-color-scheme: dark) {
    .dark-mode {
      background-color: #1f2937;
      color: #f9fafb;
    }
    
    .dark-mode .bg-white {
      background-color: #374151;
    }
    
    .dark-mode .border-gray-200 {
      border-color: #4b5563;
    }
    
    .dark-mode .text-gray-900 {
      color: #f9fafb;
    }
    
    .dark-mode .text-gray-700 {
      color: #d1d5db;
    }
    
    .dark-mode .text-gray-600 {
      color: #9ca3af;
    }
  }
  
  /* Print styles */
  @media print {
    .sidebar,
    .mobile-sidebar,
    .modal-overlay,
    button {
      display: none !important;
    }
    
    .main-content {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  }
  
  /* High contrast mode */
  @media (prefers-contrast: high) {
    .border-gray-200 {
      border-color: #000;
    }
    
    .text-gray-600 {
      color: #000;
    }
    
    .bg-gray-50 {
      background-color: #fff;
    }
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* Focus visible for accessibility */
  .focus-visible:focus {
    outline: 2px solid #16a34a;
    outline-offset: 2px;
  }
  
  /* Skip link for accessibility */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #16a34a;
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 1000;
  }
  
  .skip-link:focus {
    top: 6px;
  }
  
  /* Enhanced visual hierarchy for terms */
  .ml-8 {
    margin-left: 2rem;
    position: relative;
  }
  
  .ml-8::before {
    content: '';
    position: absolute;
    left: -1rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #16a34a, #22c55e);
    opacity: 0.3;
  }
  
  /* Gradient backgrounds for terms */
  .bg-gradient-to-r {
    background-image: linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to));
  }
  
  .from-green-50 {
    --tw-gradient-from: #f0fdf4;
    --tw-gradient-to: transparent;
  }
  
  .from-gray-50 {
    --tw-gradient-from: #f9fafb;
    --tw-gradient-to: transparent;
  }
  
  /* Animation for group type indicators */
  .w-6.h-6 {
    transition: all 0.2s ease-in-out;
  }
  
  .w-6.h-6:hover {
    transform: scale(1.1);
  }
  
  /* Better spacing for group hierarchy */
  .border-l-2.border-green-300 {
    transition: border-color 0.2s ease-in-out;
  }
  
  .border-l-2.border-green-300:hover {
    border-color: #16a34a;
  }
  
  /* Custom taxonomy group card styles */
  .taxonomy-group-card .group-hover\:bg-green-100:hover {
    background-color: #dcfce7;
  }
  
  /* Responsive grid adjustments */
  @media (max-width: 640px) {
    .grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }
  
  @media (min-width: 768px) {
    .md\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  
  @media (min-width: 1024px) {
    .lg\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  /* Fix dropdown visibility for TermItem components */
  .space-y-1\.5 {
    overflow: visible !important;
  }

  .space-y-1\.5 > * {
    overflow: visible !important;
  }

  /* Allow dropdowns to extend beyond container bounds */
  .terms-container {
    overflow: visible !important;
  }

  .term-item {
    overflow: visible !important;
  }

  /* Ensure TermItem dropdowns appear above other elements */
  .term-item .relative {
    overflow: visible !important;
  }

  .term-item > div {
    overflow: visible !important;
  }

  /* Tab folder styles (similar to Index.vue) */
  .tab-folder {
    display: flex;
    background: linear-gradient(to bottom, #6b7280, #4b5563);
  }

  .tab-folder-item {
    padding: 10px 20px 8px 20px;
    cursor: pointer;
    position: relative;
    border-radius: 8px 8px 0 0;
    transition: all 0.2s ease-in-out;
    min-width: 120px;
    text-align: left;
    background-color: rgb(169 169 169 / 80%) !important;
  }

  .tab-folder-item:hover {
    background-color: rgba(255, 255, 255, 0.632) !important;
  }

  .tab-folder-item.active {
    background-color: #ffffff !important;
  }

  /* Tab content styling */
  .tab-content {
    background: white;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* Mobile dropdown styles */
  @media (max-width: 767px) {
    .mobile-dropdown-button {
      transition: all 0.2s ease-in-out;
    }
    
    .mobile-dropdown-button:active {
      transform: scale(0.98);
    }z
    
    .mobile-dropdown-menu {
      animation: slideDown 0.2s ease-out;
      transform-origin: top center;
    }
    
    .mobile-dropdown-item {
      transition: all 0.15s ease-in-out;
    }
    
    .mobile-dropdown-item:active {
      background-color: #f3f4f6 !important;
      transform: scale(0.98);
    }
    
    .mobile-dropdown-item.selected {
      background: linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%);
    }
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  </style>