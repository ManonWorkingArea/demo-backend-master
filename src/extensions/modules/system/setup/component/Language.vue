<template>
    <div class="bg-gray-50 flex overflow-hidden language-container" 
         :class="[
           headerType && `with-${headerType}`,
           customClass
         ]"
         :style="customHeight ? { height: customHeight, maxHeight: customHeight } : {}">
        <!-- Sidebar -->
        <div class="hidden lg:flex lg:w-80 lg:flex-col">
            <div class="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
                <!-- Sidebar Header -->
                <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
                    <h1 class="text-lg font-semibold text-gray-900">ระบบจัดการการแปลภาษา</h1>
                </div>

                <!-- Statistics Cards in Sidebar -->
                <div class="px-4 py-4 border-b border-gray-200">
                    <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg stats-card">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span class="text-xs text-gray-700">ภาษาทั้งหมด</span>
                            </div>
                            <span class="text-xs font-semibold text-blue-600">{{ languages.length }}</span>
                        </div>
                        <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span class="text-xs text-gray-700">กลุ่มคำแปล</span>
                            </div>
                            <span class="text-xs font-semibold text-green-600">{{ totalGroups }}</span>
                        </div>
                        <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg stats-card">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span class="text-xs text-gray-700">คีย์แปลทั้งหมด</span>
                            </div>
                            <span class="text-xs font-semibold text-yellow-600">{{ totalKeys }}</span>
                        </div>
                        <div class="flex items-center justify-between p-2 bg-purple-50 rounded-lg stats-card">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span class="text-xs text-gray-700">ความสมบูรณ์</span>
                            </div>
                            <span class="text-xs font-semibold text-purple-600">{{ completionPercentage }}%</span>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions Widget -->
                <div class="px-4 py-4 border-b border-gray-200">
                    <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการด่วน</h3>
                    <div class="space-y-2">
                        <button @click="showAddLanguageModal = true" 
                                class="w-full flex items-center gap-3 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                            <font-awesome-icon :icon="['fas', 'plus']" class="text-sm w-4" />
                            <span>เพิ่มภาษาใหม่</span>
                        </button>
                        <button @click="showAddGroupModal = true" 
                                class="w-full flex items-center gap-3 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                            <font-awesome-icon :icon="['fas', 'layer-group']" class="text-sm w-4" />
                            <span>เพิ่มกลุ่มใหม่</span>
                        </button>
                        <button @click="validateAndSaveLang" 
                                :disabled="isSaving"
                                class="w-full flex items-center gap-3 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-200">
                            <font-awesome-icon :icon="isSaving ? ['fas', 'spinner'] : ['fas', 'save']" 
                                               :class="{ 'animate-spin': isSaving }" class="text-sm w-4" />
                            <span>{{ isSaving ? 'กำลังบันทึก...' : 'บันทึกทั้งหมด' }}</span>
                        </button>
                    </div>
                </div>

                <!-- Translation Progress Widget -->
                <div class="px-4 py-4 border-b border-gray-200">
                    <h3 class="text-sm font-medium text-gray-700 mb-3">ความคืบหน้าการแปล</h3>
                    <div class="space-y-3 max-h-48 overflow-y-auto">
                        <div v-for="lang in languages" :key="lang.code" class="space-y-2">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2">
                                    <span v-if="isValidEmoji(lang.flag)" class="text-sm">{{ lang.flag }}</span>
                                    <span v-else class="text-sm">🌐</span>
                                    <span class="text-xs font-medium text-gray-700 truncate">{{ lang.name }}</span>
                                </div>
                                <span class="text-xs text-gray-500">{{ getLanguageCompletion(lang) }}%</span>
                            </div>
                            <div class="bg-gray-200 rounded-full h-1.5">
                                <div class="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full transition-all duration-300" 
                                     :style="{ width: getLanguageCompletion(lang) + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Translation Tips Widget -->
                <div class="px-4 py-4 border-b border-gray-200">
                    <h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <font-awesome-icon :icon="['fas', 'lightbulb']" class="mr-2 text-yellow-600" />
                        เคล็ดลับการแปล
                    </h3>
                    <div class="space-y-2">
                        <div class="text-xs text-gray-700">
                            <p class="font-medium mb-1">💡 การตั้งชื่อคีย์:</p>
                            <p class="text-xs">ใช้ชื่อที่สื่อความหมายชัดเจน</p>
                        </div>
                        <div class="text-xs text-gray-700">
                            <p class="font-medium mb-1">🎯 การจัดกลุ่ม:</p>
                            <p class="text-xs">จัดกลุ่มตามหน้าหรือฟีเจอร์</p>
                        </div>
                        <div class="text-xs text-gray-700">
                            <p class="font-medium mb-1">✅ ความสม่ำเสมอ:</p>
                            <p class="text-xs">ใช้รูปแบบการเขียนที่เหมือนกัน</p>
                        </div>
                    </div>
                </div>

                <!-- Export/Import Widget -->
                <div class="px-4 py-4 border-b border-gray-200">
                    <h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <font-awesome-icon :icon="['fas', 'exchange-alt']" class="mr-2 text-indigo-600" />
                        นำเข้า/ส่งออก
                    </h3>
                    <div class="space-y-2">
                        <button @click="exportTranslations" 
                                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200">
                            <font-awesome-icon :icon="['fas', 'download']" class="text-sm w-4" />
                            <span>ส่งออก JSON</span>
                        </button>
                        <button @click="importTranslations" 
                                class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200">
                            <font-awesome-icon :icon="['fas', 'upload']" class="text-sm w-4" />
                            <span>นำเข้าไฟล์</span>
                        </button>
                    </div>
                </div>

                <!-- Recent Activity Widget -->
                <div class="mt-auto px-4 py-4 flex-shrink-0">
                    <h3 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <font-awesome-icon :icon="['fas', 'clock']" class="mr-2 text-orange-600" />
                        กิจกรรมล่าสุด
                    </h3>
                    <div class="space-y-2 max-h-32 overflow-y-auto">
                        <div v-for="activity in recentActivities.slice(0, 3)" :key="activity.id" 
                             class="flex items-start space-x-2 p-2 rounded-md hover:bg-gray-50">
                            <div class="flex-shrink-0">
                                <div :class="[
                                    'w-1.5 h-1.5 rounded-full mt-1.5',
                                    activity.type === 'add' ? 'bg-green-500' :
                                    activity.type === 'edit' ? 'bg-blue-500' :
                                    activity.type === 'delete' ? 'bg-red-500' : 'bg-gray-500'
                                ]"></div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-gray-900">{{ activity.message }}</p>
                                <p class="text-xs text-gray-500">{{ activity.time }}</p>
                            </div>
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
                    <h1 class="text-lg font-semibold text-gray-900">ระบบจัดการการแปลภาษา</h1>
                    <button 
                        @click="toggleMobileSidebar" 
                        class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <font-awesome-icon :icon="['fas', 'bars']" />
                    </button>
                </div>
            </div>

            <!-- Notification -->
            <div v-if="notification.show" 
                 :class="[
                     'mx-4 mt-4 p-4 rounded-lg border-l-4 transition-all duration-300',
                     notification.type === 'success' ? 'bg-green-50 border-green-400 text-green-700' : 
                     notification.type === 'error' ? 'bg-red-50 border-red-400 text-red-700' : 
                     'bg-blue-50 border-blue-400 text-blue-700'
                 ]">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <font-awesome-icon 
                            :icon="notification.type === 'success' ? ['fas', 'check-circle'] : 
                                   notification.type === 'error' ? ['fas', 'exclamation-circle'] : 
                                   ['fas', 'info-circle']" 
                            class="h-5 w-5" />
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium">{{ notification.message }}</p>
                    </div>
                    <div class="ml-auto pl-3">
                        <button @click="hideNotification" class="text-gray-400 hover:text-gray-600">
                            <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Tab Navigation (Mobile) -->
            <div class="lg:hidden bg-white border-b border-gray-200">
                <div class="px-4 py-2">
                    <select 
                        v-model="activeTab" 
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option 
                            v-for="tab in tabs" 
                            :key="tab.id" 
                            :value="tab.id"
                        >
                            {{ tab.name }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- Tab Navigation (Desktop) -->
            <div class="hidden lg:block border-b border-gray-200 bg-white">
                <div class="px-4">
                    <nav class="-mb-px flex space-x-8">
                        <button 
                            v-for="tab in tabs" 
                            :key="tab.id"
                            @click="activeTab = tab.id"
                            :class="[
                                'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                                activeTab === tab.id 
                                    ? 'border-indigo-500 text-indigo-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            ]">
                            <font-awesome-icon :icon="tab.icon" class="mr-2" />
                            {{ tab.name }}
                        </button>
                    </nav>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="flex-1 p-4 overflow-hidden">
                <!-- Tab Content -->
                <div class="h-full">
                    <!-- Languages Tab -->
                    <div v-show="activeTab === 'languages'" class="h-full">
                        <div class="bg-white shadow rounded-lg p-6 h-full flex flex-col">
                            <div class="flex justify-between items-center mb-6 flex-shrink-0">
                                <h2 class="text-xl font-semibold text-gray-900">จัดการภาษา</h2>
                                <button @click="showAddLanguageModal = true" 
                                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
                                    <font-awesome-icon :icon="['fas', 'plus']" class="mr-2" />
                                    เพิ่มภาษาใหม่
                                </button>
                            </div>
                            
                            <!-- Languages List -->
                            <div class="flex-1 overflow-y-auto">
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div v-for="lang in languages" :key="lang.code" 
                                         class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                                        <div class="flex items-center justify-between mb-3">
                                            <div class="flex items-center space-x-3 flex-1 min-w-0">
                                                <div class="flex-shrink-0">
                                                    <!-- แสดงธงชาติ หากเป็น URL ให้แสดงเป็น emoji default -->
                                                    <span v-if="isValidEmoji(lang.flag)" class="text-2xl">{{ lang.flag }}</span>
                                                    <span v-else class="text-2xl">🌐</span>
                                                </div>
                                                <div class="flex-1 min-w-0">
                                                    <h3 class="font-medium text-gray-900 truncate">{{ lang.name }}</h3>
                                                    <p class="text-sm text-gray-500 truncate">{{ lang.code.toUpperCase() }}</p>
                                                    <!-- แสดง URL ธงชาติถ้าไม่ใช่ emoji -->
                                                    <p v-if="!isValidEmoji(lang.flag)" class="text-xs text-gray-400 truncate mt-1" :title="lang.flag">
                                                        {{ truncateText(lang.flag, 30) }}
                                                    </p>
                                                </div>
                                            </div>
                                            <div class="flex items-center space-x-2 flex-shrink-0">
                                                <button @click="editLanguage(lang)" 
                                                        class="text-indigo-600 hover:text-indigo-900 text-sm p-1">
                                                    <font-awesome-icon :icon="['fas', 'edit']" />
                                                </button>
                                                <button @click="confirmDeleteLanguage(lang)" 
                                                        class="text-red-600 hover:text-red-900 text-sm p-1">
                                                    <font-awesome-icon :icon="['fas', 'trash']" />
                                                </button>
                                            </div>
                                        </div>
                                        <div class="mt-3">
                                            <div class="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>ความสมบูรณ์</span>
                                                <span>{{ getLanguageCompletion(lang) }}%</span>
                                            </div>
                                            <div class="bg-gray-200 rounded-full h-2">
                                                <div class="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                                     :style="{ width: getLanguageCompletion(lang) + '%' }"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Groups Tab -->
                    <div v-show="activeTab === 'groups'" class="h-full">
                        <div class="bg-white shadow rounded-lg p-6 h-full flex flex-col">
                            <div class="flex justify-between items-center mb-6 flex-shrink-0">
                                <h2 class="text-xl font-semibold text-gray-900">จัดการกลุ่มคำแปล</h2>
                                <button @click="showAddGroupModal = true" 
                                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                                    <font-awesome-icon :icon="['fas', 'plus']" class="mr-2" />
                                    เพิ่มกลุ่มใหม่
                                </button>
                            </div>
                            
                            <!-- Groups List -->
                            <div class="flex-1 overflow-y-auto">
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div v-for="(groupKeys, groupName) in getGroupsData" :key="groupName" 
                                         class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                                        <div class="flex items-center justify-between mb-3">
                                            <h3 class="font-medium text-gray-900 capitalize">{{ groupName }}</h3>
                                            <div class="flex items-center space-x-2">
                                                <button @click="showAddKeyModal = true; selectedGroup = groupName" 
                                                        class="text-indigo-600 hover:text-indigo-900 text-sm">
                                                    <font-awesome-icon :icon="['fas', 'plus']" />
                                                </button>
                                                <button @click="confirmDeleteGroup(groupName)" 
                                                        class="text-red-600 hover:text-red-900 text-sm">
                                                    <font-awesome-icon :icon="['fas', 'trash']" />
                                                </button>
                                            </div>
                                        </div>
                                        <div class="text-sm text-gray-500">
                                            <p>{{ Object.keys(groupKeys).length }} คีย์แปล</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Translations Tab -->
                    <div v-show="activeTab === 'translations'" class="h-full">
                        <div class="bg-white shadow rounded-lg h-full flex flex-col">
                            <div class="px-4 py-3 border-b border-gray-200 flex-shrink-0">
                                <div class="flex justify-between items-center">
                                    <h2 class="text-lg font-medium text-gray-900">จัดการคำแปล</h2>
                                    <div class="flex items-center space-x-3">
                                        <!-- Search -->
                                        <div class="relative">
                                            <input type="text" v-model="searchQuery" 
                                                   placeholder="ค้นหาคีย์แปล..." 
                                                   class="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                                            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                                <font-awesome-icon :icon="['fas', 'search']" class="h-3 w-3 text-gray-400" />
                                            </div>
                                        </div>
                                        <!-- Filter by Group -->
                                        <select v-model="selectedGroupFilter" 
                                                class="text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-1.5">
                                            <option value="">ทุกกลุ่ม</option>
                                            <option v-for="(groupKeys, groupName) in getGroupsData" :key="groupName" :value="groupName">
                                                {{ groupName }}
                                            </option>
                                        </select>
                                        <button @click="validateAndSaveLang" 
                                                :disabled="isSaving"
                                                class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-200">
                                            <font-awesome-icon :icon="isSaving ? ['fas', 'spinner'] : ['fas', 'save']" 
                                                               :class="{ 'animate-spin': isSaving }" class="mr-1.5" />
                                            {{ isSaving ? 'กำลังบันทึก...' : 'บันทึก' }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Translations Table -->
                            <div class="flex-1 overflow-hidden">
                                <div class="h-full overflow-auto">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead class="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-64">
                                                    คีย์แปล
                                                </th>
                                                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48" 
                                                    v-for="lang in languages" :key="lang.code">
                                                    <div class="flex items-center space-x-1.5">
                                                        <span v-if="isValidEmoji(lang.flag)" class="text-sm">{{ lang.flag }}</span>
                                                        <span v-else class="text-sm">🌐</span>
                                                        <span class="truncate text-xs">{{ lang.name }}</span>
                                                    </div>
                                                </th>
                                                <th scope="col" class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                                    จัดการ
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white divide-y divide-gray-100">
                                            <template v-if="languages.length > 0">
                                                <template v-for="(groupKeys, groupName) in filteredTranslations" :key="groupName">
                                                    <!-- Group Header -->
                                                    <tr class="bg-gray-50 border-t border-gray-200">
                                                        <td colspan="100%" class="px-4 py-2 text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                                            @click="toggleGroupExpansion(groupName)">
                                                            <div class="flex items-center justify-between">
                                                                <div class="flex items-center space-x-2">
                                                                    <font-awesome-icon 
                                                                        :icon="expandedGroups[groupName] ? ['fas', 'chevron-down'] : ['fas', 'chevron-right']" 
                                                                        class="h-3 w-3 text-gray-500" />
                                                                    <span class="bg-gray-700 text-white px-2 py-0.5 rounded text-xs font-medium">
                                                                        {{ groupName }}
                                                                    </span>
                                                                    <span class="text-xs text-gray-500">
                                                                        {{ Object.keys(groupKeys).length }} คีย์
                                                                    </span>
                                                                </div>
                                                                <button @click.stop="showAddKeyModal = true; selectedGroup = groupName" 
                                                                        class="text-indigo-600 hover:text-indigo-900 text-xs p-1">
                                                                    <font-awesome-icon :icon="['fas', 'plus']" class="mr-1" />
                                                                    เพิ่ม
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    
                                                    <!-- Translation Keys -->
                                                    <template v-if="expandedGroups[groupName]">
                                                        <template v-for="key in Object.keys(groupKeys)" :key="key">
                                                            <tr class="hover:bg-gray-50 transition-colors duration-200" 
                                                                v-show="!searchQuery || key.toLowerCase().includes(searchQuery.toLowerCase())">
                                                                <td class="px-4 py-2 text-sm text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100">
                                                                    <div :class="{'pl-4': isSubKey(key)}">
                                                                        <div class="flex items-start space-x-2">
                                                                            <div class="flex-shrink-0 mt-1">
                                                                                <div v-if="isSubKey(key)" class="w-3 h-3 border-l border-b border-gray-300"></div>
                                                                            </div>
                                                                            <div class="flex-1 min-w-0">
                                                                                <div class="font-medium text-gray-900 text-sm truncate">{{ key }}</div>
                                                                                <div class="mt-1">
                                                                                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-700">
                                                                                        {{ `${groupName}-${key}` }}
                                                                                    </span>
                                                                                    <copy-button class="ml-1 text-gray-500 text-xs" 
                                                                                                 :text="`translate('${groupName}-${key}')`" 
                                                                                                 :buttonText="`คัดลอก`" 
                                                                                                 :buttonTextDone="`✓`"/>
                                                                                </div>
                                                                                <div v-if="!isSubKey(key)" class="mt-1">
                                                                                    <button @click="showAddSubKeyModal = true; selectedGroup = groupName; selectedParentKey = key" 
                                                                                            class="text-xs text-indigo-600 hover:text-indigo-900">
                                                                                        <font-awesome-icon :icon="['fas', 'plus']" class="mr-1" />
                                                                                        ซับคีย์
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                
                                                                <!-- Translation inputs for each language -->
                                                                <td class="px-3 py-2 text-sm text-gray-500" v-for="lang in languages" :key="lang.code">
                                                                    <div :class="{'pl-4': isSubKey(key)}">
                                                                        <textarea v-model="lang.translations[groupName][key]" 
                                                                                  rows="1"
                                                                                  :placeholder="`${lang.name}...`"
                                                                                  class="block w-full text-sm rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none"
                                                                                  @input="markAsChanged"
                                                                                  @focus="$event.target.rows = 2"
                                                                                  @blur="$event.target.rows = 1"></textarea>
                                                                    </div>
                                                                </td>
                                                                
                                                                <!-- Actions -->
                                                                <td class="px-3 py-2 text-center">
                                                                    <div class="flex items-center justify-center space-x-1">
                                                                        <button v-if="canMoveUp(groupName, key)" 
                                                                                @click="moveKeyUp(groupName, key)" 
                                                                                class="text-gray-400 hover:text-gray-600 p-1">
                                                                            <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-3 w-3" />
                                                                        </button>
                                                                        <button v-if="canMoveDown(groupName, key)" 
                                                                                @click="moveKeyDown(groupName, key)" 
                                                                                class="text-gray-400 hover:text-gray-600 p-1">
                                                                            <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-3 w-3" />
                                                                        </button>
                                                                        <button @click="confirmDeleteKey(groupName, key)" 
                                                                                class="text-red-500 hover:text-red-700 p-1">
                                                                            <font-awesome-icon :icon="['fas', 'trash']" class="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </template>
                                                    </template>
                                                </template>
                                            </template>
                                        </tbody>
                                    </table>
                                </div>
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
                class="w-80 h-full bg-white transform transition-transform duration-300"
                @click.stop
            >
                <!-- Mobile Sidebar Content (same as desktop sidebar) -->
                <div class="flex flex-col h-full">
                    <!-- Sidebar Header -->
                    <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
                        <h1 class="text-lg font-semibold text-gray-900">ระบบจัดการการแปลภาษา</h1>
                        <button 
                            @click="toggleMobileSidebar"
                            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <font-awesome-icon :icon="['fas', 'times']" />
                        </button>
                    </div>

                    <!-- Statistics Cards in Mobile Sidebar -->
                    <div class="px-4 py-4 border-b border-gray-200">
                        <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span class="text-xs text-gray-700">ภาษาทั้งหมด</span>
                                </div>
                                <span class="text-xs font-semibold text-blue-600">{{ languages.length }}</span>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span class="text-xs text-gray-700">กลุ่มคำแปล</span>
                                </div>
                                <span class="text-xs font-semibold text-green-600">{{ totalGroups }}</span>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span class="text-xs text-gray-700">คีย์แปล</span>
                                </div>
                                <span class="text-xs font-semibold text-yellow-600">{{ totalKeys }}</span>
                            </div>
                            <div class="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                                <div class="flex items-center gap-2">
                                    <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span class="text-xs text-gray-700">ความสมบูรณ์</span>
                                </div>
                                <span class="text-xs font-semibold text-purple-600">{{ completionPercentage }}%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tab Navigation Menu in Mobile -->
                    <div class="px-4 py-4 border-b border-gray-200">
                        <h3 class="text-sm font-medium text-gray-700 mb-3">เมนู</h3>
                        <nav class="space-y-1">
                            <button 
                                v-for="tab in tabs" 
                                :key="tab.id"
                                @click="selectTabAndCloseMobile(tab.id)" 
                                class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
                                :class="{ 
                                    'bg-blue-100 text-blue-700 font-medium': activeTab === tab.id,
                                    'text-gray-600 hover:bg-gray-100 hover:text-gray-900': activeTab !== tab.id
                                }"
                            >
                                <font-awesome-icon :icon="tab.icon" class="text-sm w-4" />
                                <span class="flex-1 text-left">{{ tab.name }}</span>
                            </button>
                        </nav>
                    </div>

                    <!-- Quick Actions in Mobile -->
                    <div class="px-4 py-4 border-b border-gray-200">
                        <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการ</h3>
                        <div class="space-y-2">
                            <button @click="showAddLanguageModal = true; toggleMobileSidebar()" 
                                    class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200">
                                <font-awesome-icon :icon="['fas', 'plus']" class="text-sm w-4" />
                                <span>เพิ่มภาษาใหม่</span>
                            </button>
                            <button @click="showAddGroupModal = true; toggleMobileSidebar()" 
                                    class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200">
                                <font-awesome-icon :icon="['fas', 'layer-group']" class="text-sm w-4" />
                                <span>เพิ่มกลุ่มใหม่</span>
                            </button>
                            <button @click="validateAndSaveLang; toggleMobileSidebar()" 
                                    class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200">
                                <font-awesome-icon :icon="['fas', 'save']" class="text-sm w-4" />
                                <span>บันทึกทั้งหมด</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Language Modal -->
        <div v-if="showAddLanguageModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="showAddLanguageModal = false">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">เพิ่มภาษาใหม่</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อภาษา</label>
                            <input v-model="newLanguage.name" type="text" placeholder="เช่น ภาษาไทย" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสภาษา</label>
                            <input v-model="newLanguage.code" type="text" placeholder="เช่น th" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">ธงชาติ/Emoji</label>
                            <input v-model="newLanguage.flag" type="text" placeholder="เช่น 🇹🇭" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button @click="showAddLanguageModal = false" 
                                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                            ยกเลิก
                        </button>
                        <button @click="addLanguage" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            เพิ่มภาษา
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Group Modal -->
        <div v-if="showAddGroupModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="showAddGroupModal = false">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">เพิ่มกลุ่มคำแปลใหม่</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อกลุ่ม</label>
                            <input v-model="newGroup.name" type="text" placeholder="เช่น navigation, buttons" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button @click="showAddGroupModal = false" 
                                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                            ยกเลิก
                        </button>
                        <button @click="addGroup" 
                                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                            เพิ่มกลุ่ม
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Key Modal -->
        <div v-if="showAddKeyModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="showAddKeyModal = false">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">เพิ่มคีย์แปลใหม่</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">กลุ่ม</label>
                            <input :value="selectedGroup" readonly 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อคีย์</label>
                            <input v-model="newKeyName" type="text" placeholder="เช่น home, save, cancel" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button @click="showAddKeyModal = false" 
                                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                            ยกเลิก
                        </button>
                        <button @click="addKeyToGroupModal" 
                                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                            เพิ่มคีย์
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Sub Key Modal -->
        <div v-if="showAddSubKeyModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="showAddSubKeyModal = false">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">เพิ่มซับคีย์ใหม่</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">กลุ่ม</label>
                            <input :value="selectedGroup" readonly 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">คีย์หลัก</label>
                            <input :value="selectedParentKey" readonly 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อซับคีย์</label>
                            <input v-model="newSubKeyName" type="text" placeholder="เช่น title, description" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                        </div>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button @click="showAddSubKeyModal = false" 
                                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                            ยกเลิก
                        </button>
                        <button @click="addSubKeyModal" 
                                class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                            เพิ่มซับคีย์
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Confirm Modal -->
        <div v-if="showConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="showConfirmModal = false">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
                <div class="mt-3">
                    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="h-6 w-6 text-red-600" />
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 text-center mb-2">{{ confirmModal.title }}</h3>
                    <p class="text-sm text-gray-500 text-center mb-6">{{ confirmModal.message }}</p>
                    <div class="flex justify-center space-x-3">
                        <button @click="showConfirmModal = false" 
                                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                            ยกเลิก
                        </button>
                        <button @click="executeConfirmAction" 
                                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                            ยืนยัน
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
import { key } from '@/master/host.js';
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import CopyButton from '@/utils/Clipboard.vue';

export default {
    components: {
        CopyButton
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
    data() {
        return {
            configs: key,
            newLanguage: {
                name: '',
                flag: '',
                code: '',
                translations: {}
            },
            newGroup: {
                name: ''
            },
            translationKey: '',
            group: '',
            languages: [],
            expandedGroups: {},
            showAddLanguageModal: false,
            showAddGroupModal: false,
            showAddKeyModal: false,
            showAddSubKeyModal: false,
            showConfirmModal: false,
            selectedGroup: null,
            selectedParentKey: null,
            newKeyName: '',
            newSubKeyName: '',
            searchQuery: '',
            selectedGroupFilter: '',
            notification: {
                show: false,
                message: '',
                type: 'info'
            },
            confirmModal: {
                title: '',
                message: '',
                action: null
            },
            isSaving: false,
            hasChanges: false,
            autoSaveTimeout: null,
            tabs: [
                { id: 'languages', name: 'ภาษา', icon: ['fas', 'language'] },
                { id: 'groups', name: 'กลุ่มคำแปล', icon: ['fas', 'layer-group'] },
                { id: 'translations', name: 'คำแปล', icon: ['fas', 'key'] },
            ],
            activeTab: 'languages',
            recentActivities: [
                {
                    id: 1,
                    type: 'add',
                    message: 'เพิ่มภาษาใหม่: ภาษาไทย',
                    time: '5 นาทีที่แล้ว'
                },
                {
                    id: 2,
                    type: 'edit',
                    message: 'แก้ไขคำแปล: navigation-home',
                    time: '10 นาทีที่แล้ว'
                },
                {
                    id: 3,
                    type: 'add',
                    message: 'เพิ่มกลุ่มใหม่: buttons',
                    time: '15 นาทีที่แล้ว'
                },
                {
                    id: 4,
                    type: 'delete',
                    message: 'ลบคีย์: old-key',
                    time: '20 นาทีที่แล้ว'
                },
                {
                    id: 5,
                    type: 'edit',
                    message: 'อัปเดตคำแปลภาษาอังกฤษ',
                    time: '25 นาทีที่แล้ว'
                }
            ],
            showMobileSidebar: false
        };
    },
    computed: {
        groupedTranslationKeys() {
            const groupedKeys = {};
            for (const lang of this.languages) {
                for (const [key, value] of Object.entries(lang.translations)) {
                    if (!groupedKeys[value.group]) {
                        groupedKeys[value.group] = [];
                    }
                    if (!groupedKeys[value.group].includes(key)) {
                        groupedKeys[value.group].push(key);
                    }
                }
            }
            return groupedKeys;
        },
        totalGroups() {
            if (this.languages.length === 0) return 0;
            return Object.keys(this.languages[0].translations || {}).length;
        },
        totalKeys() {
            if (this.languages.length === 0) return 0;
            let total = 0;
            for (const group in this.languages[0].translations) {
                total += Object.keys(this.languages[0].translations[group]).length;
            }
            return total;
        },
        completionPercentage() {
            if (this.languages.length === 0 || this.totalKeys === 0) return 0;
            let totalTranslations = 0;
            let completedTranslations = 0;
            
            for (const lang of this.languages) {
                for (const group in lang.translations) {
                    for (const key in lang.translations[group]) {
                        totalTranslations++;
                        if (lang.translations[group][key] && lang.translations[group][key].trim() !== '') {
                            completedTranslations++;
                        }
                    }
                }
            }
            return totalTranslations > 0 ? Math.round((completedTranslations / totalTranslations) * 100) : 0;
        },
        getGroupsData() {
            if (this.languages.length === 0) return {};
            return this.languages[0].translations || {};
        },
        filteredTranslations() {
            const groups = this.getGroupsData;
            if (this.selectedGroupFilter) {
                return { [this.selectedGroupFilter]: groups[this.selectedGroupFilter] };
            }
            return groups;
        }
    },
    mounted() {
        this.getLang();
        this.calculateHeaderHeight();
        window.addEventListener('resize', this.calculateHeaderHeight);
        this.$nextTick(() => {
            // Default to 'languages' tab if no active tab
            if (!this.activeTab) {
                this.activeTab = 'languages';
            }
        });
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.calculateHeaderHeight);
        
        // Clear auto-save timeout
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        // Save any pending changes before unmounting
        if (this.hasChanges) {
            this.saveLang();
        }
    },
    methods: {
        // Notification methods
        showNotification(message, type = 'info') {
            this.notification = {
                show: true,
                message,
                type
            };
            setTimeout(() => {
                this.hideNotification();
            }, 5000);
        },
        hideNotification() {
            this.notification.show = false;
        },

        // Language methods
        getLanguageCompletion(lang) {
            if (!lang.translations) return 0;
            let total = 0;
            let completed = 0;
            
            for (const group in lang.translations) {
                for (const key in lang.translations[group]) {
                    total++;
                    if (lang.translations[group][key] && lang.translations[group][key].trim() !== '') {
                        completed++;
                    }
                }
            }
            return total > 0 ? Math.round((completed / total) * 100) : 0;
        },

        editLanguage(lang) {
            this.newLanguage = { ...lang };
            this.showAddLanguageModal = true;
        },

        confirmDeleteLanguage(lang) {
            this.confirmModal = {
                title: 'ยืนยันการลบภาษา',
                message: `คุณต้องการลบภาษา "${lang.name}" หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
                action: () => this.deleteLanguage(lang._id)
            };
            this.showConfirmModal = true;
        },

        // Group methods
        confirmDeleteGroup(groupName) {
            this.confirmModal = {
                title: 'ยืนยันการลบกลุ่ม',
                message: `คุณต้องการลบกลุ่ม "${groupName}" และคีย์แปลทั้งหมดในกลุ่มนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
                action: () => this.deleteGroup(groupName)
            };
            this.showConfirmModal = true;
        },

        // Key methods
        confirmDeleteKey(groupName, keyName) {
            this.confirmModal = {
                title: 'ยืนยันการลบคีย์',
                message: `คุณต้องการลบคีย์ "${keyName}" จากกลุ่ม "${groupName}" หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
                action: () => this.deleteKey(groupName, keyName)
            };
            this.showConfirmModal = true;
        },

        addKeyToGroupModal() {
            if (this.newKeyName && this.selectedGroup) {
                this.addKeyToGroup(this.selectedGroup);
                this.addActivity('add', `เพิ่มคีย์ใหม่: ${this.selectedGroup}-${this.newKeyName}`);
                this.newKeyName = '';
                this.showAddKeyModal = false;
                this.showNotification('เพิ่มคีย์สำเร็จ', 'success');
            }
        },

        addSubKeyModal() {
            if (this.newSubKeyName && this.selectedGroup && this.selectedParentKey) {
                this.addSubkeyToKey(this.selectedGroup, this.selectedParentKey);
                this.addActivity('add', `เพิ่มซับคีย์ใหม่: ${this.selectedParentKey}-${this.newSubKeyName}`);
                this.newSubKeyName = '';
                this.showAddSubKeyModal = false;
                this.showNotification('เพิ่มซับคีย์สำเร็จ', 'success');
            }
        },

        // Utility methods
        isSubKey(key) {
            return (key.match(/-/g) || []).length > 1;
        },

        isValidEmoji(text) {
            if (!text) return false;
            // ตรวจสอบว่าเป็น emoji หรือไม่ (ไม่ใช่ URL)
            const emojiRegex = /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u;
            return emojiRegex.test(text.trim()) && !text.includes('http') && !text.includes('www') && text.length <= 10;
        },

        truncateText(text, maxLength) {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        },

        canMoveUp(groupName, key) {
            if (!this.languages.length || !this.languages[0].translations[groupName]) return false;
            const keys = Object.keys(this.languages[0].translations[groupName]);
            const index = keys.indexOf(key);
            return index > 0;
        },

        canMoveDown(groupName, key) {
            if (!this.languages.length || !this.languages[0].translations[groupName]) return false;
            const keys = Object.keys(this.languages[0].translations[groupName]);
            const index = keys.indexOf(key);
            return index < keys.length - 1;
        },

        markAsChanged() {
            this.hasChanges = true;
            this.addActivity('edit', 'แก้ไขคำแปล');
            
            // Auto-save after a delay (debounced)
            if (this.autoSaveTimeout) {
                clearTimeout(this.autoSaveTimeout);
            }
            
            this.autoSaveTimeout = setTimeout(() => {
                if (this.hasChanges) {
                    this.saveLang();
                }
            }, 2000); // Auto-save after 2 seconds of inactivity
        },

        toggleGroupExpansion(groupName) {
            const isExpanded = this.expandedGroups[groupName];
            this.expandedGroups = {
                ...this.expandedGroups,
                [groupName]: !isExpanded,
            };
        },

        async addLanguage() {
            // Validation
            if (!this.newLanguage.name || !this.newLanguage.code || !this.newLanguage.flag) {
                this.showNotification('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
                return;
            }

            // Normalize code
            const normalizedCode = this.newLanguage.code.toLowerCase().trim();
            
            // Check for existing language
            const existingLanguage = this.languages.find(lang => 
                lang.code.toLowerCase() === normalizedCode
            );
            if (existingLanguage) {
                this.showNotification('รหัสภาษานี้มีอยู่แล้ว', 'error');
                return;
            }

            // Prepare translations structure
            const translations = {};
            if (this.languages.length > 0) {
                const templateLang = this.languages[0];
                for (const groupName in templateLang.translations) {
                    translations[groupName] = {};
                    for (const key in templateLang.translations[groupName]) {
                        translations[groupName][key] = '';
                    }
                }
            }

            // Create new language object
            const newLanguage = {
                name: this.newLanguage.name.trim(),
                code: normalizedCode,
                flag: this.newLanguage.flag.trim(),
                translations: translations
            };

            try {
                // Add to local array first for immediate UI feedback
                this.languages.push(newLanguage);
                
                // Save to backend
                await this.saveSingleLanguage(newLanguage);
                
                // Update activity and notifications
                this.addActivity('add', `เพิ่มภาษาใหม่: ${newLanguage.name}`);
                this.showNotification('เพิ่มภาษาสำเร็จ', 'success');
                
                // Reset form and close modal
                this.newLanguage = { name: '', code: '', flag: '', translations: {} };
                this.showAddLanguageModal = false;
                
                // Refresh data to ensure consistency
                await this.getLang();
                
            } catch (error) {
                // Remove from local array if save failed
                const index = this.languages.findIndex(lang => lang.code === normalizedCode);
                if (index > -1) {
                    this.languages.splice(index, 1);
                }
                
                console.error('Error adding language:', error);
                this.showNotification('เกิดข้อผิดพลาดในการเพิ่มภาษา', 'error');
            }
        },

        async addGroup() {
            if (!this.newGroup.name || this.newGroup.name.trim() === '') {
                this.showNotification('กรุณาใส่ชื่อกลุ่ม', 'error');
                return;
            }

            const groupNameNormalized = this.newGroup.name.toLowerCase().trim();
            
            // Check if group already exists
            if (this.languages.length > 0) {
                const existingGroup = Object.keys(this.languages[0].translations).find(
                    group => group.toLowerCase() === groupNameNormalized
                );
                if (existingGroup) {
                    this.showNotification('กลุ่มนี้มีอยู่แล้ว', 'error');
                    return;
                }
            }

            try {
                // Add group to all languages
                for (const lang of this.languages) {
                    if (!lang.translations[groupNameNormalized]) {
                        lang.translations[groupNameNormalized] = {};
                    }
                }
                
                // Mark as changed and save
                this.markAsChanged();
                await this.saveLang();
                
                // Update activity and notifications
                this.addActivity('add', `เพิ่มกลุ่มใหม่: ${this.newGroup.name}`);
                this.showNotification('เพิ่มกลุ่มสำเร็จ', 'success');
                
                // Reset form and close modal
                this.newGroup.name = '';
                this.showAddGroupModal = false;
                
                // Auto-expand the new group
                this.expandedGroups[groupNameNormalized] = true;
                
            } catch (error) {
                console.error('Error adding group:', error);
                this.showNotification('เกิดข้อผิดพลาดในการเพิ่มกลุ่ม', 'error');
            }
        },

        async addKeyToGroup(groupName) {
            const newKeyName = this.newKeyName || prompt('Enter the name for the new key:');
            if (!newKeyName || newKeyName.trim() === '') {
                this.showNotification('กรุณาใส่ชื่อคีย์', 'error');
                return;
            }

            const newKeyNameNormalized = newKeyName.toLowerCase().trim();
            
            // Check if key already exists in the group
            const keyExists = this.languages.some(lang => 
                lang.translations[groupName] && 
                Object.prototype.hasOwnProperty.call(lang.translations[groupName], newKeyNameNormalized)
            );
            
            if (keyExists) {
                this.showNotification('คีย์นี้มีอยู่แล้วในกลุ่ม', 'error');
                return;
            }

            try {
                const initialValue = '';

                // Add key to all languages
                this.languages.forEach(lang => {
                    if (!lang.translations[groupName]) {
                        lang.translations[groupName] = {};
                    }
                    lang.translations[groupName][newKeyNameNormalized] = initialValue;
                });
                
                // Force reactivity update
                this.languages = [...this.languages];
                
                // Mark as changed and save
                this.markAsChanged();
                await this.saveLang();
                
                // Update activity and notifications
                this.addActivity('add', `เพิ่มคีย์ใหม่: ${groupName}-${newKeyNameNormalized}`);
                this.showNotification('เพิ่มคีย์สำเร็จ', 'success');
                
                // Ensure group is expanded to show the new key
                this.expandedGroups[groupName] = true;
                
            } catch (error) {
                console.error('Error adding key to group:', error);
                this.showNotification('เกิดข้อผิดพลาดในการเพิ่มคีย์', 'error');
            }
        },

        async deleteGroup(groupName) {
            try {
                // Remove group from all languages
                for (const lang of this.languages) {
                    delete lang.translations[groupName];
                }
                
                // Remove from expanded groups
                delete this.expandedGroups[groupName];
                
                // Mark as changed and save
                this.markAsChanged();
                await this.saveLang();
                
                this.addActivity('delete', `ลบกลุ่ม: ${groupName}`);
                this.showNotification('ลบกลุ่มสำเร็จ', 'success');
                
            } catch (error) {
                console.error('Error deleting group:', error);
                this.showNotification('เกิดข้อผิดพลาดในการลบกลุ่ม', 'error');
            }
        },

        async deleteKey(groupName, keyName) {
            try {
                // Remove key from all languages
                this.languages.forEach(lang => {
                    if (lang.translations[groupName] && lang.translations[groupName][keyName] !== undefined) {
                        delete lang.translations[groupName][keyName];
                    }
                });
                
                // Force reactivity update
                this.languages = [...this.languages];
                
                // Mark as changed and save
                this.markAsChanged();
                await this.saveLang();
                
                this.addActivity('delete', `ลบคีย์: ${groupName}-${keyName}`);
                this.showNotification('ลบคีย์สำเร็จ', 'success');
                
            } catch (error) {
                console.error('Error deleting key:', error);
                this.showNotification('เกิดข้อผิดพลาดในการลบคีย์', 'error');
            }
        },

        async deleteLanguage(langId) {
            try {
                const langToDelete = this.languages.find(lang => lang._id === langId);
                await Request.DELETE(`translate/${langId}`, null, this.configs);
                this.getLang();
                this.addActivity('delete', `ลบภาษา: ${langToDelete ? langToDelete.name : 'ไม่ทราบชื่อ'}`);
                this.showNotification('ลบภาษาสำเร็จ', 'success');
            } catch (error) {
                console.error('Error deleting language:', error);
                this.showNotification('เกิดข้อผิดพลาดในการลบภาษา', 'error');
            }
        },

        async getLang() {
            try {
                const { data } = await Request.GET(`translate`, this.configs);
                
                this.languages = data.map(translationData => {
                    if (!translationData.translations || Object.keys(translationData.translations).length === 0) {
                        translationData.translations = {};
                        return translationData;
                    }

                    const hasUngrouped = Object.values(translationData.translations).some(value => typeof value === 'string');

                    if (hasUngrouped) {
                        const untitledGroup = {};
                        for (const [key, value] of Object.entries(translationData.translations)) {
                            if (typeof value === 'string') {
                                untitledGroup[key] = value;
                                delete translationData.translations[key];
                            }
                        }
                        translationData.translations['Untitled'] = untitledGroup;
                    }

                    return translationData;
                });
            } catch (error) {
                console.error("Error fetching translation data:", error);
                this.showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
            }
        },

        async saveLang() {
            this.isSaving = true;
            try {
                const savePromises = this.languages.map(async (lang) => {
                    const requestData = {
                        data: {
                            name: lang.name,
                            code: lang.code,
                            flag: lang.flag,
                            translations: lang.translations
                        }
                    };
                    
                    if (lang._id) {
                        return await Request.PUT(`translate/${lang._id}`, requestData, this.configs);
                    } else {
                        return await Request.POST('translate', requestData, this.configs);
                    }
                });

                // Wait for all save operations to complete
                await Promise.all(savePromises);
                
                // Refresh data to ensure consistency
                await this.getLang();
                
                this.hasChanges = false;
                this.showNotification('บันทึกข้อมูลสำเร็จ', 'success');
                
            } catch (error) {
                console.error('Error saving languages:', error);
                this.showNotification('เกิดข้อผิดพลาดในการบันทึก', 'error');
            } finally {
                this.isSaving = false;
            }
        },

        async saveSingleLanguage(language) {
            const requestData = {
                data: {
                    name: language.name,
                    code: language.code,
                    flag: language.flag,
                    translations: language.translations
                }
            };
            
            if (language._id) {
                return await Request.PUT(`translate/${language._id}`, requestData, this.configs);
            } else {
                return await Request.POST('translate', requestData, this.configs);
            }
        },

        validateAndSaveLang() {
            if (this.isValid()) {
                this.saveLang();
            } else {
                this.showNotification('ข้อมูลไม่ถูกต้อง', 'error');
            }
        },

        isValid() {
            return this.languages.every(lang => lang.name && Object.keys(lang.translations).length > 0);
        },

        canHaveSubKeys(key) {
            return (key.match(/-/g) || []).length === 1;
        },

        moveKeyUp(groupName, key) {
            this.languages = this.languages.map(lang => {
                const keys = Object.keys(lang.translations[groupName]);
                const index = keys.indexOf(key);
                if (index > 0) {
                    const newKeys = this.arrayMove(keys, index, index - 1);
                    lang.translations[groupName] = this.reorderKeys(lang, groupName, newKeys);
                }
                return lang;
            });
        },

        moveKeyDown(groupName, key) {
            this.languages = this.languages.map(lang => {
                const keys = Object.keys(lang.translations[groupName]);
                const index = keys.indexOf(key);
                if (index < keys.length - 1) {
                    const newKeys = this.arrayMove(keys, index, index + 1);
                    lang.translations[groupName] = this.reorderKeys(lang, groupName, newKeys);
                }
                return lang;
            });
        },

        arrayMove(arr, old_index, new_index) {
            if (new_index >= arr.length) {
                let k = new_index - arr.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr;
        },

        reorderKeys(lang, groupName, newKeys) {
            const newTranslations = {};
            newKeys.forEach(key => {
                newTranslations[key] = lang.translations[groupName][key];
            });
            return newTranslations;
        },

        async addSubkeyToKey(groupName, parentKey = null) {
            let newKeyName = this.newSubKeyName || prompt('Enter the name for the new key:');
            if (!newKeyName || newKeyName.trim() === '') {
                this.showNotification('กรุณาใส่ชื่อซับคีย์', 'error');
                return;
            }

            if (!parentKey) {
                this.showNotification('กรุณาเลือกคีย์หลักที่ถูกต้อง', 'error');
                return;
            }

            // Format the new sub-key as 'parentKey-newKeyName'
            const formattedSubKeyName = `${parentKey}-${newKeyName.toLowerCase().trim()}`;

            // Check if the new key name is unique within the group
            const isUnique = this.languages.every(lang => 
                !Object.prototype.hasOwnProperty.call(lang.translations[groupName] || {}, formattedSubKeyName)
            );

            if (!isUnique) {
                this.showNotification('ชื่อคีย์นี้มีอยู่แล้วในกลุ่ม กรุณาเลือกชื่ออื่น', 'error');
                return;
            }

            try {
                const initialValue = '';
                
                this.languages.forEach(lang => {
                    // Convert translations[groupName] object into an array of [key, value] pairs
                    const entries = Object.entries(lang.translations[groupName] || {});

                    // Find the index of the parent key
                    const parentIndex = entries.findIndex(([key]) => key === parentKey);
                    if (parentIndex === -1) {
                        console.warn(`Parent key "${parentKey}" not found in group "${groupName}" for language ${lang.name}`);
                        return;
                    }

                    // Insert the new sub-key right after the parent key
                    entries.splice(parentIndex + 1, 0, [formattedSubKeyName, initialValue]);

                    // Convert the entries back into an object and assign it back
                    lang.translations[groupName] = Object.fromEntries(entries);
                });

                // Force reactivity update
                this.languages = [...this.languages];
                
                // Mark as changed and save
                this.markAsChanged();
                await this.saveLang();
                
                // Update activity and notifications
                this.addActivity('add', `เพิ่มซับคีย์ใหม่: ${formattedSubKeyName}`);
                this.showNotification('เพิ่มซับคีย์สำเร็จ', 'success');
                
                // Ensure group is expanded
                this.expandedGroups[groupName] = true;
                
            } catch (error) {
                console.error('Error adding sub-key:', error);
                this.showNotification('เกิดข้อผิดพลาดในการเพิ่มซับคีย์', 'error');
            }
        },

        // Activity tracking methods
        addActivity(type, message) {
            const newActivity = {
                id: Date.now(),
                type: type,
                message: message,
                time: 'เมื่อสักครู่'
            };
            this.recentActivities.unshift(newActivity);
            // Keep only last 10 activities
            if (this.recentActivities.length > 10) {
                this.recentActivities = this.recentActivities.slice(0, 10);
            }
        },

        // Export/Import methods
        exportTranslations() {
            try {
                const exportData = {
                    languages: this.languages,
                    exportDate: new Date().toISOString(),
                    version: '1.0'
                };
                
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(dataBlob);
                link.download = `translations-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                
                this.addActivity('export', 'ส่งออกข้อมูลการแปลเป็นไฟล์ JSON');
                this.showNotification('ส่งออกข้อมูลสำเร็จ', 'success');
            } catch (error) {
                console.error('Export error:', error);
                this.showNotification('เกิดข้อผิดพลาดในการส่งออก', 'error');
            }
        },

        importTranslations() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const importData = JSON.parse(e.target.result);
                            if (importData.languages && Array.isArray(importData.languages)) {
                                this.languages = importData.languages;
                                this.addActivity('import', `นำเข้าข้อมูลจากไฟล์: ${file.name}`);
                                this.showNotification('นำเข้าข้อมูลสำเร็จ', 'success');
                            } else {
                                this.showNotification('รูปแบบไฟล์ไม่ถูกต้อง', 'error');
                            }
                        } catch (error) {
                            console.error('Import error:', error);
                            this.showNotification('เกิดข้อผิดพลาดในการนำเข้าไฟล์', 'error');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        },

        toggleMobileSidebar() {
            this.showMobileSidebar = !this.showMobileSidebar;
        },

        selectTabAndCloseMobile(tabId) {
            this.activeTab = tabId;
            this.toggleMobileSidebar();
        },

        calculateHeaderHeight() {
            // ถ้ามี customHeight หรือ headerHeight ที่กำหนดไว้แล้ว ไม่ต้องคำนวณ
            if (this.customHeight || this.headerHeight) {
                if (this.headerHeight) {
                    const height = typeof this.headerHeight === 'number' 
                        ? `${this.headerHeight}px` 
                        : this.headerHeight;
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
                    if (this.isElementAbove(element)) {
                        headerHeight += element.offsetHeight;
                    }
                });
            });
            
            // ถ้าไม่พบ header ให้ใช้ค่าเริ่มต้นตาม headerType
            if (headerHeight === 0) {
                switch (this.headerType) {
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
            console.log(`Language Component: Calculated header height = ${headerHeight}px`);
        },
        
        isElementAbove(element) {
            // ตรวจสอบว่า element อยู่ด้านบนของคอมโพเนนต์นี้หรือไม่
            const languageElement = this.$el;
            if (!languageElement) return false;
            
            const elementRect = element.getBoundingClientRect();
            const languageRect = languageElement.getBoundingClientRect();
            
            return elementRect.bottom <= languageRect.top;
        },

        executeConfirmAction() {
            if (this.confirmModal.action && typeof this.confirmModal.action === 'function') {
                this.confirmModal.action();
            }
            this.showConfirmModal = false;
        },
    }
};
</script>
  
<style scoped>
/* Language container with dynamic height calculation */
.language-container {
  height: calc(100vh - var(--header-height, 64px));
  max-height: calc(100vh - var(--header-height, 64px));
  overflow: hidden;
}

/* Responsive header heights */
@media (min-width: 1024px) {
  .language-container {
    height: calc(100vh - var(--header-height, 80px));
    max-height: calc(100vh - var(--header-height, 80px));
  }
}

@media (max-width: 768px) {
  .language-container {
    height: calc(100vh - var(--header-height, 56px));
    max-height: calc(100vh - var(--header-height, 56px));
  }
}

/* Alternative fixed heights for common header sizes */
.language-container.with-topbar {
  height: calc(100vh - 120px); /* Header + Topbar */
  max-height: calc(100vh - 120px);
}

.language-container.with-breadcrumb {
  height: calc(100vh - 140px); /* Header + Breadcrumb */
  max-height: calc(100vh - 140px);
}

.language-container.with-full-admin {
  height: calc(100vh - 160px); /* Full admin layout */
  max-height: calc(100vh - 160px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
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
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
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
  background: #3b82f6;
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
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Language card animations */
.language-card {
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
}

.language-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease-in-out;
}

.language-card:hover::before {
  left: 100%;
}

.language-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
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
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #3b82f6;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
</style>
