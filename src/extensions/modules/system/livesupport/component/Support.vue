<template>
  <div class="bg-gray-50 flex overflow-hidden support-container" 
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
          <h1 class="text-lg font-semibold text-gray-900">Live Support</h1>
          <div class="flex items-center gap-2">
            <select 
              v-model="conversationLimit" 
              @change="loadConversations(false, conversationLimit)"
              class="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              title="จำนวนการสนทนาที่แสดง"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <button 
              @click="loadConversations(false, conversationLimit)" 
              class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
              title="รีเฟรชการสนทนา"
            >
              <i class="fas fa-sync-alt text-sm"></i>
            </button>
          </div>
        </div>


        <!-- Quick Stats -->
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-2">สถิติรวม</h3>
          <div class="space-y-1">
            <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-xs text-gray-700">การสนทนาทั้งหมด</span>
              </div>
              <span class="text-xs font-semibold text-blue-600">{{ conversations.length }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span class="text-xs text-gray-700">ยังไม่ได้รับมอบหมาย</span>
              </div>
              <span class="text-xs font-semibold text-yellow-600">{{ unassignedCount }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-xs text-gray-700">ได้รับมอบหมายแล้ว</span>
              </div>
              <span class="text-xs font-semibold text-green-600">{{ assignedCount }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-2">สถานะ</h3>
          <nav class="space-y-1">
            <button 
              v-for="status in sidebarMenuItems" 
              :key="status.value"
              @click="selectStatusAndCloseMobile(status.value)" 
              class="w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors duration-200 sidebar-menu-item"
              :class="{ 
                'bg-blue-100 text-blue-700 font-medium active': selectedStatus === status.value,
                'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedStatus !== status.value
              }"
            >
              <i :class="status.icon" class="text-xs w-3"></i>
              <span class="flex-1 text-left">{{ status.label }}</span>
              <span 
                v-if="getStatusCount(status.value) > 0" 
                class="px-1.5 py-0.5 text-[10px] rounded-full status-badge"
                :class="{ 
                  'bg-blue-200 text-blue-800': selectedStatus === status.value,
                  'bg-gray-200 text-gray-600': selectedStatus !== status.value
                }"
              >
                {{ getStatusCount(status.value) }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Quick Actions -->
        <div class="px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <h3 class="text-sm font-medium text-gray-700 mb-2">การดำเนินการ</h3>
          <div class="space-y-1">
            <button 
              @click="loadConversations(false, conversationLimit)"
              class="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-sync-alt text-xs w-3"></i>
              <span>รีเฟรช ({{ conversationLimit }} รายการ)</span>
            </button>
            <button 
              @click="toggleFullscreen"
              class="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-expand text-xs w-3"></i>
              <span>{{ isFullscreen ? 'ออกจากเต็มจอ' : 'เต็มจอ' }}</span>
            </button>
          </div>
        </div>

        <!-- User Info -->
        <div class="mt-auto px-4 py-3 flex-shrink-0">
          <div class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-white text-xs"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-900 truncate">{{ session?.current?.name || 'ผู้ใช้' }}</p>
              <p class="text-[10px] text-gray-500">เจ้าหน้าที่ Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 h-full" :class="{ 'fixed inset-0 z-50': isFullscreen }">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h1 class="text-base font-semibold text-gray-900">Live Support</h1>
          <button 
            @click="toggleMobileSidebar" 
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>

      <!-- Header Section -->
      <div class="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <!-- Search Input -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input 
                type="text" 
                v-model="conversationSearch" 
                placeholder="ค้นหาการสนทนา..." 
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2">
            <button 
              v-if="selectedConversation" 
              @click="resolveConversation" 
              :disabled="getConversationStatus(selectedConversation) === 'solved'"
              class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs flex items-center gap-1"
            >
              <i class="fas fa-check text-xs"></i>
              แก้ไขแล้ว
            </button>
            
            <!-- Mode Toggle Switch -->
            <div v-if="selectedConversation" class="flex items-center gap-3">
              <!-- Current Mode Icon -->
              <div class="flex items-center gap-2">
                <div :class="[
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200',
                  selectedConversation.mode === 'bot' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600'
                ]">
                  <i :class="[
                    'text-xs',
                    selectedConversation.mode === 'bot' ? 'fas fa-robot' : 'fas fa-user-tie'
                  ]"></i>
                </div>
                <span class="text-xs font-medium text-gray-700">
                  {{ selectedConversation.mode === 'bot' ? 'AI Mode' : 'Manual Mode' }}
                </span>
              </div>
              
              <div class="flex items-center space-x-2">
                <!-- Toggle Button -->
                <button
                  @click="selectedConversation.mode === 'bot' ? switchToAdminMode() : switchToAIMode()"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
                    selectedConversation.mode === 'bot' 
                      ? 'bg-green-500 focus:ring-green-500' 
                      : 'bg-gray-300 focus:ring-gray-500'
                  ]"
                  :title="selectedConversation.mode === 'bot' 
                    ? 'คลิกเพื่อเปลี่ยนเป็น Manual Mode - เจ้าหน้าที่ตอบเอง' 
                    : 'คลิกเพื่อเปลี่ยนเป็น AI Mode - AI จะตอบอัตโนมัติ'"
                >
                  <!-- Toggle Circle -->
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm',
                      selectedConversation.mode === 'bot' ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  ></span>
                  
                  <!-- ON/OFF Labels inside toggle -->
                  <span class="absolute inset-0 flex items-center justify-between px-1 text-[10px] font-medium pointer-events-none">
                    <span :class="selectedConversation.mode === 'bot' ? 'text-white' : 'text-transparent'">ON</span>
                    <span :class="selectedConversation.mode !== 'bot' ? 'text-gray-600' : 'text-transparent'">OFF</span>
                  </span>
                </button>
                
                <!-- Reload Button -->
                <button
                  @click="reloadConversations"
                  :class="[
                    'flex items-center justify-center h-6 w-6 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
                    isReloading 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
                  ]"
                  :disabled="isReloading"
                  :title="isReloading ? 'กำลังโหลดข้อมูล...' : 'รีเฟรชข้อมูลบทสนทนา'"
                >
                  <i 
                    :class="[
                      'text-white text-xs',
                      isReloading ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'
                    ]"
                  ></i>
                </button>
                
                <!-- WebSocket Status Indicator -->
                <button
                  @click="reconnectWebSocket"
                  :class="[
                    'flex items-center justify-center h-6 w-6 rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2',
                    wsConnectionStatus === 'connected' 
                      ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500' 
                      : wsConnectionStatus === 'connecting' 
                        ? 'bg-yellow-500 focus:ring-yellow-500 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
                  ]"
                  :disabled="wsConnectionStatus === 'connecting'"
                  :title="wsConnectionStatus === 'connected' 
                    ? 'WebSocket เชื่อมต่อแล้ว - คลิกเพื่อเชื่อมต่อใหม่' 
                    : wsConnectionStatus === 'connecting' 
                      ? 'กำลังเชื่อมต่อ WebSocket...'
                      : 'WebSocket ขาดการเชื่อมต่อ - คลิกเพื่อเชื่อมต่อใหม่'"
                >
                  <i 
                    :class="[
                      'text-white text-xs',
                      wsConnectionStatus === 'connecting' 
                        ? 'fas fa-spinner fa-spin' 
                        : wsConnectionStatus === 'connected' 
                          ? 'fas fa-wifi' 
                          : 'fas fa-wifi text-red-300'
                    ]"
                  ></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Tabs (Mobile) -->
      <div class="lg:hidden bg-white border-b border-gray-200 flex-shrink-0">
        <div class="px-4 py-2">
          <select 
            v-model="selectedStatus" 
            @change="selectStatus(selectedStatus)"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option 
              v-for="status in sidebarMenuItems" 
              :key="status.value" 
              :value="status.value"
            >
              {{ status.label }} ({{ getStatusCount(status.value) }})
            </option>
          </select>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Conversation List -->
        <div class="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full"
             :class="{ 'hidden lg:flex': isMobileChatView }">
          <!-- Conversation Header -->
          <div class="px-4 py-2 border-b border-gray-200 flex-shrink-0">
            <div class="flex items-center justify-between">
              <h3 class="font-medium text-gray-900 text-sm">การสนทนา</h3>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">{{ filteredConversationsBySearch.length }} รายการ</span>
                <div v-if="!loader" class="flex items-center">
                  <i class="fas fa-spinner fa-spin text-xs text-blue-500"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Conversation List -->
          <div class="flex-1 overflow-y-auto conversation-list-container">
            <transition-group name="conversation-list" tag="div">
              <div 
                v-for="conversation in filteredConversationsBySearch" 
                :key="conversation._id" 
                class="p-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all duration-300 ease-in-out conversation-card"
                :class="{ 'bg-blue-50 border-blue-200': selectedConversation?._id === conversation._id }"
                @click="selectConversation(conversation)"
              >
              <div class="flex items-center gap-2">
                <!-- Avatar -->
                <div class="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-white text-xs font-medium">{{ getCustomerInitials(conversation) }}</span>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-gray-900 text-xs truncate">{{ getCustomerFullName(conversation) }}</h4>
                      <p class="text-gray-500 text-xs truncate">{{ conversation.preview }}</p>
                    </div>
                    
                    <div class="flex items-center gap-1 flex-shrink-0">
                      <span class="text-xs text-gray-400">{{ formatTime(conversation.lastUpdate) }}</span>
                      <transition name="unread-badge" mode="out-in">
                        <span 
                          v-if="conversation.unreadCount > 0" 
                          :key="conversation.unreadCount"
                          class="bg-red-500 text-white text-xs px-1 py-0.5 rounded-full min-w-[14px] text-center text-[10px] ml-1 unread-badge"
                        >
                          {{ conversation.unreadCount }}
                        </span>
                      </transition>
                    </div>
                  </div>
                  
                  <!-- Status moved to bottom -->
                  <div class="mt-1">
                    <span 
                      class="px-1.5 py-0.5 text-[9px] rounded-full"
                      :class="getStatusClass(getConversationStatus(conversation))"
                    >
                      {{ getStatusLabel(getConversationStatus(conversation)) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </transition-group>

            <!-- Empty State -->
            <div v-if="filteredConversationsBySearch.length === 0" class="text-center py-6">
              <i class="fas fa-comments text-gray-300 text-2xl mb-2"></i>
              <p class="text-gray-500 text-xs">ไม่พบการสนทนาที่ตรงกับการค้นหา</p>
            </div>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="flex-1 flex flex-col bg-white h-full overflow-hidden" 
             v-if="selectedConversation"
             :class="{ 
               'fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto': isMobileChatView
             }">
          <!-- Chat Header -->
          <div class="px-4 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div class="flex items-center justify-between">
              <!-- Mobile Back Button (แสดงเฉพาะ mobile) -->
              <button 
                v-if="isMobileChatView"
                @click="closeMobileChatView"
                class="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-2"
              >
                <i class="fas fa-arrow-left text-sm"></i>
              </button>
              
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
                  <span class="text-white text-xs font-medium">{{ getCustomerInitials(selectedConversation) }}</span>
                </div>
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900 text-sm">{{ getCustomerFullName(selectedConversation) }}</h3>
                  <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span>{{ selectedConversation.email || 'ไม่มีอีเมล' }}</span>
                    <span v-if="selectedConversation.message && selectedConversation.message.length > 0" class="text-blue-600">
                      ({{ selectedConversation.message.length }} ข้อความ)
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <!-- Status Management Dropdown -->
                <div class="relative" v-if="selectedConversation">
                  <button 
                    @click="showStatusDropdown = !showStatusDropdown"
                    class="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                    :class="getStatusButtonClass(getConversationStatus(selectedConversation))"
                  >
                    <i :class="getStatusIcon(getConversationStatus(selectedConversation))" class="text-xs"></i>
                    <span class="text-xs hidden sm:inline">{{ getStatusText(getConversationStatus(selectedConversation)) }}</span>
                    <i class="fas fa-chevron-down text-[10px]"></i>
                  </button>
                  
                  <!-- Status Dropdown Menu -->
                  <div v-if="showStatusDropdown" 
                       ref="statusDropdownMenu"
                       class="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] min-w-[200px] status-dropdown">
                    <div class="py-1">
                      <!-- Primary Statuses -->
                      <button 
                        @click="changeConversationStatus('unread'); showStatusDropdown = false"
                        class="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                        :class="getConversationStatus(selectedConversation) === 'unread' ? 'bg-gray-50 text-gray-700' : 'text-gray-700'"
                      >
                        <i class="fas fa-envelope text-gray-500"></i>
                        ยังไม่อ่าน (Unread)
                      </button>
                      <button 
                        @click="changeConversationStatus('read'); showStatusDropdown = false"
                        class="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                        :class="getConversationStatus(selectedConversation) === 'read' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'"
                      >
                        <i class="fas fa-envelope-open text-blue-500"></i>
                        อ่านแล้ว (Read)
                      </button>
                      <button 
                        @click="changeConversationStatus('in-progress'); showStatusDropdown = false"
                        class="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                        :class="getConversationStatus(selectedConversation) === 'in-progress' ? 'bg-orange-50 text-orange-700' : 'text-gray-700'"
                      >
                        <i class="fas fa-spinner text-orange-500"></i>
                        กำลังดำเนินการ (In Progress)
                      </button>
                      
                      <hr class="my-1">
                      
                      <!-- Resolution Statuses -->
                      <button 
                        @click="changeConversationStatus('solved'); showStatusDropdown = false"
                        class="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                        :class="getConversationStatus(selectedConversation) === 'solved' ? 'bg-green-50 text-green-700' : 'text-gray-700'"
                      >
                        <i class="fas fa-check-circle text-green-500"></i>
                        แก้ไขแล้ว (Solved)
                      </button>
                      <button 
                        @click="changeConversationStatus('pending'); showStatusDropdown = false"
                        class="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                        :class="getConversationStatus(selectedConversation) === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-700'"
                      >
                        <i class="fas fa-clock text-yellow-500"></i>
                        รอดำเนินการ (Pending)
                      </button>
                      
                      <hr class="my-1">
                      
                      <!-- Administrative Statuses -->
                      <button 
                        @click="showTransferDialog = true; showStatusDropdown = false"
                        class="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <i class="fas fa-exchange-alt text-indigo-500"></i>
                        โอนให้ทีมอื่น (Transfer)
                      </button>
                      <button 
                        @click="changeConversationStatus('archived'); showStatusDropdown = false"
                        class="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                        :class="getConversationStatus(selectedConversation) === 'archived' ? 'bg-gray-50 text-gray-600' : 'text-gray-700'"
                      >
                        <i class="fas fa-archive text-gray-500"></i>
                        เก็บถาวร (Archived)
                      </button>
                      <hr class="my-1">
                      <button 
                        @click="showStatusDialog = true; showStatusDropdown = false"
                        class="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <i class="fas fa-edit text-gray-500"></i>
                        เพิ่มหมายเหตุ
                      </button>
                    </div>
                  </div>
                </div>
                
                <button 
                  @click="toggleSearchPanel"
                  class="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i class="fas fa-search text-xs"></i>
                </button>
                <button 
                  @click="toggleCustomerPanel"
                  class="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i class="fas fa-info-circle text-xs"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Tools Sub Panel (แสดงเฉพาะ mobile) -->
          <div v-if="isMobileChatView && selectedConversation" class="px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0 mobile-tools-panel">
            <div class="flex items-center justify-between">
              <!-- AI Mode Section -->
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 ai-mode-indicator">
                  <div :class="[
                    'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200',
                    selectedConversation.mode === 'bot' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  ]">
                    <i :class="[
                      'text-xs',
                      selectedConversation.mode === 'bot' ? 'fas fa-robot' : 'fas fa-user-tie'
                    ]"></i>
                  </div>
                  <span class="text-sm font-medium text-gray-700">
                    {{ selectedConversation.mode === 'bot' ? 'AI Mode' : 'Manual Mode' }}
                  </span>
                </div>
                
                <!-- AI Mode Toggle Switch -->
                <button
                  @click="selectedConversation.mode === 'bot' ? switchToAdminMode() : switchToAIMode()"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 toggle-switch',
                    selectedConversation.mode === 'bot' 
                      ? 'bg-green-500 focus:ring-green-500 active' 
                      : 'bg-gray-300 focus:ring-gray-500 inactive'
                  ]"
                  :title="selectedConversation.mode === 'bot' 
                    ? 'คลิกเพื่อเปลี่ยนเป็น Manual Mode' 
                    : 'คลิกเพื่อเปลี่ยนเป็น AI Mode'"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out shadow-sm',
                      selectedConversation.mode === 'bot' ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  ></span>
                  
                  <!-- ON/OFF Labels -->
                  <span class="absolute inset-0 flex items-center justify-between px-1 text-[10px] font-medium pointer-events-none">
                    <span :class="selectedConversation.mode === 'bot' ? 'text-white' : 'text-transparent'">ON</span>
                    <span :class="selectedConversation.mode !== 'bot' ? 'text-gray-600' : 'text-transparent'">OFF</span>
                  </span>
                </button>
              </div>
              
              <!-- Quick Actions -->
              <div class="flex items-center gap-2">
                <!-- Status Badge -->
                <span :class="getStatusClass(getConversationStatus(selectedConversation))" 
                      class="text-xs px-2 py-1 rounded-full status-badge">
                  {{ getStatusLabel(getConversationStatus(selectedConversation)) }}
                </span>
                
                <!-- Quick Solve Button -->
                <button 
                  @click="changeConversationStatus('solved')" 
                  :disabled="getConversationStatus(selectedConversation) === 'solved'"
                  class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs flex items-center gap-1 quick-action-btn"
                  title="แก้ไขแล้ว"
                >
                  <i class="fas fa-check text-xs"></i>
                  <span>แก้ไขแล้ว</span>
                </button>
                
                <!-- More Actions Dropdown -->
                <div class="relative">
                  <button 
                    @click="showStatusDropdown = !showStatusDropdown"
                    class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 quick-action-btn"
                  >
                    <i class="fas fa-ellipsis-v text-sm"></i>
                  </button>
                  
                  <!-- Dropdown Menu (ใช้ dropdown เดียวกับที่มีอยู่แล้ว) -->
                </div>
              </div>
            </div>
          </div>

          <!-- Search Panel -->
          <div v-if="isSearchPanelOpen" class="px-4 py-2 bg-yellow-50 border-b border-gray-200 flex-shrink-0">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
              <input 
                v-model="messageSearch" 
                placeholder="ค้นหาข้อความ..." 
                class="w-full pl-8 pr-4 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-3 space-y-2 chat-window" ref="chatWindow">
            <!-- Loading History Indicator -->
            <transition name="loading-history-transition">
              <div v-if="loadingHistory" class="flex justify-center items-center py-4">
                <div class="flex items-center gap-2 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-sm"></i>
                  <span class="text-xs">กำลังโหลดประวัติการสนทนา...</span>
                </div>
              </div>
            </transition>
            
            <!-- Messages -->
            <transition-group name="message" tag="div" class="space-y-2">
              <div 
                v-for="message in filteredMessagesBySearch" 
                :key="message._id" 
                class="flex chat-message transition-all duration-200 ease-in-out"
                :class="message.sender === 'customer' ? 'justify-end' : 'justify-start'"
              >
              <div 
                class="max-w-xs px-3 py-2 rounded-lg transition-all duration-500 ease-in-out"
                :class="[
                  message.sender === 'customer' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900',
                  message.isNew ? 'new-message-highlight' : ''
                ]"
              >
                <p class="text-xs">{{ message.text }}</p>
                <p class="text-[10px] mt-1 opacity-70">{{ message.time }}</p>
              </div>
            </div>
            </transition-group>
            
            <!-- No Messages Indicator -->
            <transition name="no-messages-transition">
              <div v-if="!loadingHistory && (!filteredMessagesBySearch || filteredMessagesBySearch.length === 0)" 
                   class="flex justify-center items-center py-8">
                <div class="text-center text-gray-500">
                  <i class="fas fa-comments text-2xl mb-2"></i>
                  <p class="text-sm">ยังไม่มีข้อความในการสนทนานี้</p>
                  <p class="text-xs mt-1">เริ่มสนทนาโดยพิมพ์ข้อความด้านล่าง</p>
                </div>
              </div>
            </transition>
          </div>

          <!-- Message Input -->
          <div class="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div class="flex items-center gap-2">
              <button 
                @click="toggleEmojiPicker"
                :disabled="selectedConversation.mode === 'bot'"
                class="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <i class="fas fa-smile text-xs"></i>
              </button>
              <button 
                @click="addFile"
                :disabled="selectedConversation.mode === 'bot'"
                class="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <i class="fas fa-paperclip text-xs"></i>
              </button>
              <input 
                v-model="newMessage" 
                placeholder="พิมพ์ข้อความ..." 
                @keyup.enter="sendMessage"
                :disabled="selectedConversation.mode === 'bot'"
                class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs disabled:bg-gray-100"
              />
              <button 
                @click="sendMessage"
                :disabled="selectedConversation.mode === 'bot' || !newMessage.trim()"
                class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-1.5 rounded-lg transition-colors"
              >
                <i class="fas fa-paper-plane text-xs"></i>
              </button>
            </div>
          </div>

          <!-- New Message Indicator -->
          <transition name="fade">
            <div 
              v-if="showNewMessageIndicator" 
              @click="forceScrollToEnd"
              class="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full cursor-pointer shadow-lg transition-all duration-200 flex items-center space-x-2 z-10"
            >
              <i class="fas fa-arrow-down text-xs"></i>
              <span class="text-xs">ข้อความใหม่</span>
            </div>
          </transition>

          <!-- Emoji Picker -->
          <EmojiPicker 
            :isOpen="isEmojiPickerOpen" 
            @select-emoji="addEmojiToMessage" 
            :disabled="selectedConversation.mode === 'bot'"
          />
        </div>

        <!-- No Conversation Selected -->
        <div v-else class="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
          <div class="text-center">
            <i class="fas fa-comments text-gray-300 text-4xl mb-3"></i>
            <h3 class="text-base font-medium text-gray-900 mb-2">เลือกการสนทนา</h3>
            <p class="text-gray-500 text-sm">เลือกการสนทนาจากรายการเพื่อเริ่มต้น</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Detail Side Panel -->
    <div 
      v-if="isCustomerPanelOpen && selectedConversation" 
      class="fixed bg-white shadow-lg transform transition-transform duration-300 customer-panel-mobile lg:customer-panel-desktop"
      :class="[
        { 'translate-x-0': isCustomerPanelOpen, 'translate-x-full': !isCustomerPanelOpen },
        // Mobile view (full screen)
        'lg:inset-y-0 lg:right-0 lg:w-80 lg:z-50 lg:border-l lg:border-gray-200',
        // Mobile: full screen overlay
        'inset-0 w-full h-full z-70 lg:inset-auto lg:w-auto lg:h-auto'
      ]"
      @click.stop
    >
      <div class="flex flex-col h-full">
        <!-- Panel Header -->
        <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 customer-panel-header-mobile">
          <div class="flex items-center justify-between">
            <!-- Mobile Back Button -->
            <button 
              v-if="isMobileChatView"
              @click="toggleCustomerPanel"
              class="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-2"
            >
              <i class="fas fa-arrow-left text-sm"></i>
            </button>
            
            <h3 class="font-medium text-gray-900">ข้อมูลลูกค้า</h3>
            <button 
              @click="toggleCustomerPanel"
              class="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Panel Content -->
        <div class="flex-1 p-4 space-y-4 customer-panel-content-mobile relative z-10">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <span class="text-white text-xl font-medium">{{ getCustomerInitials(selectedConversation) }}</span>
            </div>
            <h4 class="font-medium text-gray-900">{{ getCustomerFullName(selectedConversation) }}</h4>
          </div>

          <!-- Customer Data Edit/View Mode -->
          <div class="space-y-3 relative z-10">
            <!-- Edit Mode Header -->
            <div v-if="!isEditingCustomer" class="flex items-center justify-between">
              <h5 class="text-sm font-medium text-gray-700">ข้อมูลลูกค้า</h5>
              <button
                @click="startEditingCustomer"
                class="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              >
                <i class="fas fa-edit text-xs"></i>
                <span>แก้ไข</span>
              </button>
            </div>
            
            <div v-if="isEditingCustomer" class="flex items-center justify-between customer-edit-actions">
              <div class="flex items-center gap-2">
                <h5 class="text-sm font-medium text-gray-700">แก้ไขข้อมูลลูกค้า</h5>
                <div class="relative group">
                  <i class="fas fa-question-circle text-xs text-gray-400 cursor-help"></i>
                  <div class="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    <div>Ctrl+S = บันทึก</div>
                    <div>Esc = ยกเลิก</div>
                  </div>
                </div>
              </div>
              <div class="flex gap-1">
                <button
                  @click="saveCustomerData"
                  class="flex items-center gap-1 px-2 py-1 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors customer-edit-btn save-btn"
                  title="บันทึก (Ctrl+S)"
                >
                  <i class="fas fa-save text-xs"></i>
                  <span>บันทึก</span>
                </button>
                <button
                  @click="cancelEditingCustomer"
                  class="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors customer-edit-btn cancel-btn"
                  title="ยกเลิก (Esc)"
                >
                  <i class="fas fa-times text-xs"></i>
                  <span>ยกเลิก</span>
                </button>
              </div>
            </div>

            <!-- View Mode -->
            <div v-if="!isEditingCustomer" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                <p class="text-sm text-gray-900">{{ selectedConversation.firstname || 'ไม่มีข้อมูล' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                <p class="text-sm text-gray-900">{{ selectedConversation.lastname || 'ไม่มีข้อมูล' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <p class="text-sm text-gray-900">{{ selectedConversation.email || 'ไม่มีข้อมูล' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <p class="text-sm text-gray-900">{{ selectedConversation.phone || 'ไม่มีข้อมูล' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                <p class="text-sm text-gray-900">{{ selectedConversation.remark || 'ไม่มีข้อมูล' }}</p>
              </div>
            </div>

            <!-- Edit Mode -->
            <div v-if="isEditingCustomer" class="space-y-3 customer-edit-form" @click.stop>
              <div class="customer-field-highlight">
                <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                <input
                  v-model="editingCustomerData.firstname"
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ชื่อ"
                  @click.stop
                  @focus="console.log('Input focused!')"
                />
              </div>
              <div class="customer-field-highlight">
                <label class="block text-sm font-medium text-gray-700 mb-1">นามสกุล</label>
                <input
                  v-model="editingCustomerData.lastname"
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="นามสกุล"
                  @click.stop
                />
              </div>
              <div class="customer-field-highlight">
                <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input
                  v-model="editingCustomerData.email"
                  type="email"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="อีเมล"
                  @click.stop
                />
              </div>
              <div class="customer-field-highlight">
                <label class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <input
                  v-model="editingCustomerData.phone"
                  type="tel"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="เบอร์โทรศัพท์"
                  @click.stop
                />
              </div>
              <div class="customer-field-highlight">
                <label class="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                <textarea
                  v-model="editingCustomerData.remark"
                  rows="3"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="หมายเหตุเพิ่มเติม"
                  @click.stop
                ></textarea>
              </div>
            </div>

            <!-- Separator -->
            <div class="border-t border-gray-200 pt-3 mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <div class="space-y-2">
                <span 
                  class="inline-block px-2 py-1 text-xs rounded-full"
                  :class="getStatusClass(getConversationStatus(selectedConversation))"
                >
                  {{ getStatusLabel(getConversationStatus(selectedConversation)) }}
                </span>
                
                <!-- Status Details -->
                <div v-if="selectedConversation.conversation_status" class="text-xs text-gray-600 space-y-1">
                  <div>
                    <span class="font-medium">อัพเดตล่าสุด:</span>
                    {{ formatTime(getStatusUpdatedAt(selectedConversation)) }}
                    <span class="text-gray-500 ml-1">({{ getStatusTimeAgo(selectedConversation) }})</span>
                  </div>
                  <div>
                    <span class="font-medium">โดย:</span>
                    {{ getStatusUpdatedBy(selectedConversation) }}
                  </div>
                  <div>
                    <span class="font-medium">ลำดับความสำคัญ:</span>
                    <span 
                      class="ml-1 px-1.5 py-0.5 text-[9px] rounded-full"
                      :class="{
                        'bg-red-100 text-red-600': getStatusPriority(selectedConversation) === 'high',
                        'bg-yellow-100 text-yellow-600': getStatusPriority(selectedConversation) === 'medium',
                        'bg-green-100 text-green-600': getStatusPriority(selectedConversation) === 'normal',
                        'bg-gray-100 text-gray-600': getStatusPriority(selectedConversation) === 'low'
                      }"
                    >
                      {{ getStatusPriority(selectedConversation) }}
                    </span>
                  </div>
                  <div v-if="getStatusTags(selectedConversation).length > 0">
                    <span class="font-medium">Tags:</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <span 
                        v-for="tag in getStatusTags(selectedConversation)" 
                        :key="tag"
                        class="px-1.5 py-0.5 text-[9px] bg-blue-100 text-blue-600 rounded-full"
                      >
                        #{{ tag }}
                      </span>
                    </div>
                  </div>
                  <div v-if="getStatusNotes(selectedConversation)">
                    <span class="font-medium">หมายเหตุ:</span>
                    <p class="mt-1 text-xs bg-gray-50 p-2 rounded border">{{ getStatusNotes(selectedConversation) }}</p>
                  </div>
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
        class="w-64 h-full bg-white transform transition-transform duration-300"
        @click.stop
      >
        <!-- Mobile Sidebar Content (same as desktop sidebar) -->
        <div class="flex flex-col h-full">
          <!-- Sidebar Header -->
          <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h1 class="text-lg font-semibold text-gray-900">Live Support</h1>
            <button 
              @click="toggleMobileSidebar"
              class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Quick Stats -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
            <div class="space-y-2">
              <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg stats-card">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">การสนทนาทั้งหมด</span>
                </div>
                <span class="text-sm font-semibold text-blue-600">{{ conversations.length }}</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg stats-card">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">ยังไม่ได้รับมอบหมาย</span>
                </div>
                <span class="text-sm font-semibold text-yellow-600">{{ unassignedCount }}</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">ได้รับมอบหมายแล้ว</span>
                </div>
                <span class="text-sm font-semibold text-green-600">{{ assignedCount }}</span>
              </div>
            </div>
          </div>

          <!-- Navigation Menu -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">สถานะ</h3>
            <nav class="space-y-1">
              <button 
                v-for="status in sidebarMenuItems" 
                :key="status.value"
                @click="selectStatusAndCloseMobile(status.value)" 
                class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 sidebar-menu-item"
                :class="{ 
                  'bg-blue-100 text-blue-700 font-medium active': selectedStatus === status.value,
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedStatus !== status.value
                }"
              >
                <i :class="status.icon" class="text-sm w-4"></i>
                <span class="flex-1 text-left">{{ status.label }}</span>
                <span 
                  v-if="getStatusCount(status.value) > 0" 
                  class="px-2 py-1 text-xs rounded-full status-badge"
                  :class="{ 
                    'bg-blue-200 text-blue-800': selectedStatus === status.value,
                    'bg-gray-200 text-gray-600': selectedStatus !== status.value
                  }"
                >
                  {{ getStatusCount(status.value) }}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Overlay for customer panel -->
    <div 
      v-if="isCustomerPanelOpen" 
      class="fixed inset-0 bg-black bg-opacity-25 z-40 lg:z-20 customer-panel-overlay"
      @click="toggleCustomerPanel"
    ></div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'toast',
          'toast-' + toast.type,
          toast.show ? 'toast-show' : 'toast-hide'
        ]"
      >
        <div class="toast-content">
          <!-- Toast Icon -->
          <div class="toast-icon">
            <i :class="[
              toast.type === 'success' ? 'fas fa-check-circle' : '',
              toast.type === 'error' ? 'fas fa-exclamation-circle' : '',
              toast.type === 'warning' ? 'fas fa-exclamation-triangle' : '',
              toast.type === 'info' ? 'fas fa-info-circle' : ''
            ]"></i>
          </div>
          
          <!-- Toast Text -->
          <div class="toast-text">
            <div v-if="toast.title" class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          
          <!-- Close Button -->
          <button
            @click="removeToast(toast.id)"
            class="toast-close"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Progress Bar -->
        <div v-if="toast.duration" class="toast-progress">
          <div
            class="toast-progress-bar"
            :class="'toast-progress-' + toast.type"
            :style="{ width: toast.progress + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Transfer Dialog -->
    <div v-if="showTransferDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">โอนการสนทนา</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">โอนไปยังทีม</label>
            <select v-model="transferTo" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">เลือกทีม</option>
              <option value="tech_team">ทีมเทคนิค</option>
              <option value="support_team">ทีมซัพพอร์ต</option>
              <option value="billing_team">ทีมบิลลิ่ง</option>
              <option value="management">ผู้จัดการ</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ</label>
            <textarea 
              v-model="transferNotes" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
              rows="3"
              placeholder="ระบุเหตุผลหรือรายละเอียดการโอน..."
            ></textarea>
          </div>
        </div>
        
        <div class="flex gap-2 mt-6">
          <button 
            @click="showTransferDialog = false; transferTo = ''; transferNotes = ''"
            class="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button 
            @click="handleTransfer"
            :disabled="!transferTo"
            class="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            โอน
          </button>
        </div>
      </div>
    </div>

    <!-- Status Dialog -->
    <div v-if="showStatusDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">เพิ่มหมายเหตุ</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุสถานะ</label>
            <textarea 
              v-model="statusNotes" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
              rows="4"
              placeholder="เพิ่มหมายเหตุเกี่ยวกับสถานะการสนทนา..."
            ></textarea>
          </div>
        </div>
        
        <div class="flex gap-2 mt-6">
          <button 
            @click="showStatusDialog = false; statusNotes = ''"
            class="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button 
            @click="showStatusDialog = false"
            class="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { getAblyChannel, subscribeToMessages, publishMessage } from '@/services/ably';
import storageManager from '@/plugins/storage';
import EmojiPicker from './EmojiPicker.vue'; // Import the EmojiPicker component
import { 
  fetchConversations, 
  fetchConversationHistory, 
  updateConversation, 
  switchConversationMode, 
  sendAdminReply,
  markConversationUnread,
  markConversationRead,
  markConversationInProgress,
  markConversationSolved, 
  markConversationPending, 
  markConversationArchived,
  getHostname,
  // WebSocket functions
  connectWebSocket,
  disconnectWebSocket,
  sendWebSocketMessage,
  onWebSocketEvent,
  getWebSocketStatus
} from './conversation'; // Import all conversation methods from single file
import { generateCustomMessage } from "./ai";

export default {
  components: {
    EmojiPicker
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
      userInput: "",
      generatedMessage: "",

      loader: true,
      loadingHistory: false, // สำหรับแสดง loading เมื่อดึง message history
      isReloading: false, // สำหรับ reload button
      showNewMessageIndicator: false, // สำหรับแสดง indicator ข้อความใหม่
      title: 'Live Support Chat',
      conversationSearch: '',
      messageSearch: '',
      conversationLimit: 20, // จำนวนการสนทนาที่จะดึงมา
      isSearchPanelOpen: false,
      conversations: [],
      selectedConversation: null,
      selectedStatus: 'all',
      newMessage: '',
      isCustomerPanelOpen: false,
      isFullscreen: false,
      isEmojiPickerOpen: false,
      isAgentMode: false,
      session: storageManager.get('session'),
      showMobileSidebar: false,
      isMobileChatView: false, // สำหรับ mobile chat view
      toasts: [], // สำหรับ toast notifications
      
      // WebSocket Management
      wsConnectionStatus: 'disconnected', // disconnected, connecting, connected, error
      wsEventListeners: [], // Array to store unsubscribe functions
      wsRefreshTimeout: null, // สำหรับ debounce การ refresh conversations
      
      // Status Management
      showStatusDropdown: false,
      showStatusDialog: false,
      showTransferDialog: false,
      statusNotes: '',
      transferTo: '',
      transferNotes: '',
      
      // Customer Data Edit Mode
      isEditingCustomer: false,
      editingCustomerData: {
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
        remark: ''
      },
      dropdownPosition: { top: '0px', left: '0px' }, // สำหรับตำแหน่ง dropdown
      
      sidebarMenuItems: [
        { value: 'all', label: 'ทั้งหมด', icon: 'fas fa-list' },
        { value: 'unread', label: 'ยังไม่อ่าน', icon: 'fas fa-envelope' },
        { value: 'read', label: 'อ่านแล้ว', icon: 'fas fa-envelope-open' },
        { value: 'in-progress', label: 'กำลังดำเนินการ', icon: 'fas fa-spinner' },
        { value: 'solved', label: 'แก้ไขแล้ว', icon: 'fas fa-check-circle' },
        { value: 'pending', label: 'รอดำเนินการ', icon: 'fas fa-clock' },
        { value: 'transferred', label: 'โอนแล้ว', icon: 'fas fa-exchange-alt' },
        { value: 'archived', label: 'เก็บถาวร', icon: 'fas fa-archive' }
      ]
    };
  },
  created() {
    // โหลดการสนทนาครั้งแรกด้วย limit เริ่มต้น
    this.loadConversations(false, this.conversationLimit);
  },
  computed: {
    filteredConversationsBySearch() {
      if (!this.conversationSearch) {
        return this.sortedFilteredConversations;
      }
      return this.sortedFilteredConversations.filter(conversation => {
        const customerName = this.getCustomerFullName(conversation);
        const searchTerm = this.conversationSearch.toLowerCase();
        
        return (
          customerName.toLowerCase().includes(searchTerm) ||
          (conversation.firstname || '').toLowerCase().includes(searchTerm) ||
          (conversation.lastname || '').toLowerCase().includes(searchTerm) ||
          (conversation.phone || '').toLowerCase().includes(searchTerm) ||
          (conversation.email || '').toLowerCase().includes(searchTerm) ||
          conversation.preview.toLowerCase().includes(searchTerm)
        );
      });
    },
    filteredMessagesBySearch() {
      if (!this.selectedConversation) {
        console.log('No selected conversation for message filtering');
        return [];
      }
      
      // ตรวจสอบว่า selectedConversation.message มีค่าหรือไม่
      const messages = this.selectedConversation.message || [];
      console.log(`Displaying ${messages.length} messages for conversation ${this.selectedConversation._id}`);
      
      if (!this.messageSearch) {
        return messages; // แสดงข้อความทั้งหมด
      }
      
      // กรองข้อความตามคำค้นหา
      const filtered = messages.filter(message => {
        return message.text && message.text.toLowerCase().includes(this.messageSearch.toLowerCase());
      });
      
      console.log(`Filtered ${filtered.length} messages from ${messages.length} total messages`);
      return filtered;
    },
    sortedFilteredConversations() {
      return this.filteredConversations
        .slice()
        .sort((a, b) => {
          // เรียงตาม lastUpdate ใหม่ที่สุดไปเก่าที่สุด (conversation ล่าสุดอยู่บนสุด)
          const dateA = new Date(a.lastUpdate || a.updatedAt);
          const dateB = new Date(b.lastUpdate || b.updatedAt);
          return dateB.getTime() - dateA.getTime();
        });
    },
    filteredConversations() {
      if (this.selectedStatus === 'all') {
        return this.conversations;
      }
      return this.conversations.filter((conversation) => this.getConversationStatus(conversation) === this.selectedStatus);
    },
    // Computed properties for status counts using conversation_status
    unreadCount() {
      return this.conversations.filter(conv => this.getConversationStatus(conv) === 'unread').length;
    },
    readCount() {
      return this.conversations.filter(conv => this.getConversationStatus(conv) === 'read').length;
    },
    inProgressCount() {
      return this.conversations.filter(conv => this.getConversationStatus(conv) === 'in-progress').length;
    },
    solvedCount() {
      return this.conversations.filter(conv => this.getConversationStatus(conv) === 'solved').length;
    },
    pendingCount() {
      return this.conversations.filter(conv => this.getConversationStatus(conv) === 'pending').length;
    },
    transferredCount() {
      return this.conversations.filter(conv => this.getConversationStatus(conv) === 'transferred').length;
    },
    archivedCount() {
      return this.conversations.filter(conv => this.getConversationStatus(conv) === 'archived').length;
    },
    
    // Customer name computed properties
    getCustomerFullName() {
      return (conversation) => {
        if (!conversation) return 'ลูกค้า';
        
        const firstname = conversation.firstname || '';
        const lastname = conversation.lastname || '';
        
        if (firstname && lastname) {
          return `${firstname} ${lastname}`.trim();
        } else if (firstname) {
          return firstname;
        } else if (conversation.sender && conversation.sender !== 'ลูกค้า') {
          return conversation.sender;
        } else {
          return 'ลูกค้า';
        }
      };
    },
    
    getCustomerInitials() {
      return (conversation) => {
        if (!conversation) return 'L';
        
        const fullName = this.getCustomerFullName(conversation);
        return this.getInitials(fullName);
      };
    },
    
    // Legacy counts for backward compatibility  
    unassignedCount() {
      return this.conversations.filter(conv => this.getConversationStatus(conv) === 'unassigned').length;
    },
    assignedCount() {
      return this.conversations.filter(conv => this.getConversationStatus(conv) === 'assigned').length;
    },
    resolvedCount() {
      return this.conversations.filter(conv => this.getConversationStatus(conv) === 'resolved').length;
    }
  },
  mounted() {
    this.subscribeToHostChannel(this.session.current._id, this.handleHostMessages);
    this.calculateHeaderHeight();
    window.addEventListener('resize', this.calculateHeaderHeight);
    window.addEventListener('resize', this.handleResize);
    
    // เพิ่ม event listener สำหรับปิด dropdown เมื่อคลิกภายนอก
    document.addEventListener('click', this.handleClickOutside);
    
    // เพิ่ม keyboard shortcut สำหรับบันทึกข้อมูลลูกค้า (Ctrl+S)
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Initialize WebSocket connection
    this.initializeWebSocket();
    
    // Make component globally accessible for WebSocket callbacks
    window.supportComponent = this;
    
    // เลือก conversation ล่าสุดเมื่อ component โหลดเสร็จ
    this.$nextTick(() => {
      if (this.conversations && this.conversations.length > 0) {
        console.log('Auto-selecting latest conversation on mount');
        this.selectLastConversation();
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateHeaderHeight);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Cleanup WebSocket timeout
    if (this.wsRefreshTimeout) {
      clearTimeout(this.wsRefreshTimeout);
      this.wsRefreshTimeout = null;
    }
    
    // Cleanup WebSocket
    this.cleanupWebSocket();
    
    // Remove global reference
    if (window.supportComponent === this) {
      delete window.supportComponent;
    }
  },
  methods: {
    // Helper methods for conversation_status
    getConversationStatus(conversation) {
      // รับสถานะจาก status.current (จาก API response)
      if (conversation.status && conversation.status.current) {
        return conversation.status.current;
      }
      // รับสถานะจาก conversation_status object (local format)
      if (conversation.conversation_status && conversation.conversation_status.status) {
        return conversation.conversation_status.status;
      }
      // fallback ใช้ status เดิม
      return conversation.status || 'unread';
    },

    setConversationStatus(conversation, status, notes = null, updatedBy = 'admin', priority = 'normal', tags = []) {
      // ตั้งค่าสถานะใหม่ในรูปแบบ conversation_status ที่สมบูรณ์
      if (!conversation.conversation_status) {
        conversation.conversation_status = {};
      }
      
      const timestamp = Date.now();
      
      conversation.conversation_status.status = status;
      conversation.conversation_status.updated_at = timestamp;
      conversation.conversation_status.updated_by = updatedBy;
      conversation.conversation_status.priority = priority;
      conversation.conversation_status.tags = Array.isArray(tags) ? tags : [];
      conversation.conversation_status.status_time_ago = 'just now';
      
      if (notes) {
        conversation.conversation_status.notes = notes;
      }
      
      // อัพเดต status เก่าด้วยเพื่อ backward compatibility
      conversation.status = status;
      
      console.log(`📝 Status updated:`, {
        conversationId: conversation._id,
        newStatus: status,
        timestamp: conversation.conversation_status.updated_at,
        updatedBy: updatedBy,
        notes: notes
      });
    },

    getStatusUpdatedAt(conversation) {
      // จาก status.updated_at (API format)
      if (conversation.status && conversation.status.updated_at) {
        return new Date(conversation.status.updated_at);
      }
      // จาก conversation_status.updated_at (local format)
      if (conversation.conversation_status && conversation.conversation_status.updated_at) {
        return new Date(conversation.conversation_status.updated_at);
      }
      return new Date(conversation.updatedAt || conversation.lastUpdate);
    },

    getStatusUpdatedBy(conversation) {
      // จาก status.updated_by (API format)
      if (conversation.status && conversation.status.updated_by) {
        return conversation.status.updated_by;
      }
      // จาก conversation_status.updated_by (local format)
      if (conversation.conversation_status && conversation.conversation_status.updated_by) {
        return conversation.conversation_status.updated_by;
      }
      return 'system';
    },

    getStatusTags(conversation) {
      // จาก status.tags (API format)
      if (conversation.status && Array.isArray(conversation.status.tags)) {
        return conversation.status.tags;
      }
      // จาก conversation_status.tags (local format)
      if (conversation.conversation_status && Array.isArray(conversation.conversation_status.tags)) {
        return conversation.conversation_status.tags;
      }
      return [];
    },

    getStatusNotes(conversation) {
      // จาก status.notes (API format)
      if (conversation.status && conversation.status.notes) {
        return conversation.status.notes;
      }
      // จาก conversation_status.notes (local format)
      if (conversation.conversation_status && conversation.conversation_status.notes) {
        return conversation.conversation_status.notes;
      }
      return null;
    },

    getStatusPriority(conversation) {
      // จาก status.priority (API format) 
      if (conversation.status && conversation.status.priority) {
        return conversation.status.priority;
      }
      // จาก conversation_status.priority (local format)
      if (conversation.conversation_status && conversation.conversation_status.priority) {
        return conversation.conversation_status.priority;
      }
      return 'normal';
    },

    getStatusTimeAgo(conversation) {
      if (conversation.conversation_status && conversation.conversation_status.status_time_ago) {
        return conversation.conversation_status.status_time_ago;
      }
      return 'unknown';
    },

    // Reload conversations method
    async reloadConversations() {
      console.log('🔄 Reloading conversations...');
      this.isReloading = true;
      
      try {
        // รีเซ็ต search และ filters
        this.conversationSearch = '';
        this.messageSearch = '';
        this.selectedStatus = 'all';
        
        // โหลดข้อมูลใหม่
        await this.loadConversations(false, this.conversationLimit);
        
        // หากมีการสนทนาที่เลือกอยู่ ให้โหลด message history ใหม่ด้วย
        if (this.selectedConversation) {
          console.log('Reloading messages for selected conversation:', this.selectedConversation._id);
          const historyResult = await fetchConversationHistory(this.selectedConversation._id);
          
          if (historyResult && historyResult.messages && historyResult.messages.length > 0) {
            this.selectedConversation.message = historyResult.messages;
            console.log(`Reloaded ${historyResult.messages.length} messages for conversation ${this.selectedConversation._id}`);
          }
        }
        
        this.showToast('โหลดข้อมูลใหม่สำเร็จ', 'success');
        console.log('✅ Conversations reloaded successfully');
        
      } catch (error) {
        console.error('❌ Error reloading conversations:', error);
        this.showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
      } finally {
        this.isReloading = false;
      }
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
      console.log(`Support Component: Calculated header height = ${headerHeight}px`);
    },
    
    isElementAbove(element) {
      // ตรวจสอบว่า element อยู่ด้านบนของคอมโพเนนต์นี้หรือไม่
      const supportElement = this.$el;
      if (!supportElement) return false;
      
      const elementRect = element.getBoundingClientRect();
      const supportRect = supportElement.getBoundingClientRect();
      
      return elementRect.bottom <= supportRect.top;
    },
    async getCustomMessage() {
      if (this.userInput.trim() !== "") {
        try {
          this.generatedMessage = await generateCustomMessage(this.userInput);
        } catch (error) {
          console.error("Error generating message:", error);
          this.generatedMessage = "Sorry, an error occurred.";
        }
      }
    },
    
    // Toast Notification Methods
    showToast(message, type = 'info', title = null, duration = 5000) {
      const id = Date.now() + Math.random();
      const toast = {
        id,
        message,
        type, // 'success', 'error', 'warning', 'info'
        title,
        duration,
        show: false,
        progress: 100
      };
      
      this.toasts.push(toast);
      
      // Show animation
      this.$nextTick(() => {
        const toastElement = this.toasts.find(t => t.id === id);
        if (toastElement) {
          toastElement.show = true;
        }
      });
      
      // Auto remove with progress bar
      if (duration > 0) {
        const startTime = Date.now();
        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.max(0, 100 - (elapsed / duration) * 100);
          
          const toastElement = this.toasts.find(t => t.id === id);
          if (toastElement) {
            toastElement.progress = progress;
          }
          
          if (elapsed >= duration) {
            clearInterval(interval);
            this.removeToast(id);
          }
        }, 50);
      }
    },
    
    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index > -1) {
        // Hide animation
        this.toasts[index].show = false;
        
        // Remove after animation
        setTimeout(() => {
          const currentIndex = this.toasts.findIndex(t => t.id === id);
          if (currentIndex > -1) {
            this.toasts.splice(currentIndex, 1);
          }
        }, 300);
      }
    },
    
    // Convenience methods for different toast types
    showSuccessToast(message, title = 'สำเร็จ') {
      this.showToast(message, 'success', title);
    },
    
    showErrorToast(message, title = 'เกิดข้อผิดพลาด') {
      this.showToast(message, 'error', title);
    },
    
    showWarningToast(message, title = 'คำเตือน') {
      this.showToast(message, 'warning', title);
    },
    
    showInfoToast(message, title = 'ข้อมูล') {
      this.showToast(message, 'info', title);
    },
    // Ably Socket Function
    unsubscribeFromConversationChannel(conversationId) {
      const conversationChannel = getAblyChannel(`conversation-${conversationId}`);
      if (conversationChannel) {
        conversationChannel.unsubscribe();
      } else {
        console.warn(`Conversation channel not found: conversation-${conversationId}`);
      }
    },
    subscribeToHostChannel(hostId) {
      const hostChannel = getAblyChannel(`host-${hostId}`);
      subscribeToMessages(hostChannel, (msg) => {
        this.handleHostMessages(msg);
      });
    },
    subscribeToConversationChannel(conversationId) {
      const conversationChannel = getAblyChannel(`conversation-${conversationId}`);
      subscribeToMessages(conversationChannel, (msg) => {
        this.handleConversationMessages(msg);
      });
    },
    handleHostMessages(msg) {
      if (msg.data && msg.data.type === 'conversation_update') {
        // โหลดการสนทนาใหม่เมื่อมีการอัปเดต
        this.loadConversations(true, 20);
      }
    },
    handleConversationMessages(msg) {
      if (msg.data && msg.data.type === 'client_reply') {
        //this.addAgentMessage(msg.data.message);
      }
    },
    async publishToHostChannel(messageType, messageData) {
      const hostChannel = getAblyChannel(`host-${this.session.host_id}`);
      try {
        await publishMessage(hostChannel, {
          type: messageType,
          data: messageData,
        });
      } catch (error) {
        console.error(error);
      }
    },
    async publishToConversationChannel(conversationId, messageType, messageData) {
      const conversationChannel = getAblyChannel(`conversation-${conversationId}`);
      try {
        await publishMessage(conversationChannel, {
          type: messageType,
          data: messageData,
        });
      } catch (error) {
        console.error(error);
      }
    },
    // Ably Socket Function
    async loadConversations(silent=false, limit=20) {
      try {
        console.log('🔄 loadConversations called with:', { silent, limit });
        if(!silent) { this.loader = false; }
        
        const response = await fetchConversations(limit);
        console.log('✅ fetchConversations returned:', response);
        console.log('✅ Response structure:', {
          hasSuccess: 'success' in response,
          hasData: 'data' in response,
          dataType: typeof response.data,
          dataIsArray: Array.isArray(response.data),
          dataLength: response.data?.length,
          firstItem: response.data?.[0],
          firstItemKeys: response.data?.[0] ? Object.keys(response.data[0]) : null
        });
        
        // ตรวจสอบ response format ใหม่
        if (!response || !response.success || !Array.isArray(response.data)) {
          console.warn('⚠️ Invalid response format from fetchConversations:', response);
          this.conversations = [];
          if(!silent) { this.loader = true; }
          return;
        }
        
        const data = response.data;
        console.log('🔍 Raw API data:', data);
        console.log('🔍 First item from API:', data[0]);
        
        // Process the raw API data and map to local format
        const newConversations = data.map(conv => {
          console.log('🔍 Processing conversation:', {
            session_id: conv.session_id,
            hasSessionId: !!conv.session_id,
            user: conv.user,
            convKeys: Object.keys(conv)
          });
          
          // Map ข้อมูลจาก API format ใหม่ไปเป็น format ที่ component ใช้
          const mappedConv = {
            _id: conv.session_id,
            hostname: conv.hostname,
            messageCount: conv.message_count,
            unreadCount: conv.unread_count,
            
            // ข้อมูลลูกค้าจาก user object
            firstname: conv.user?.firstname || '',
            lastname: conv.user?.lastname || '',
            phone: conv.user?.phone || '',
            email: conv.user?.email || '',
            remark: conv.user?.remark || '',
            sender: conv.user?.firstname ? 
              `${conv.user.firstname} ${conv.user.lastname || ''}`.trim() : 
              (conv.user?.email?.split('@')[0] || 'ลูกค้า'), // ใช้ส่วนหน้า @ ของ email หรือ 'ลูกค้า'
            
            // ข้อมูลข้อความล่าสุด
            preview: conv.last_user_message?.content || '',
            lastUpdate: new Date(conv.last_message_timestamp || conv.updated_at),
            
            // สถานะการสนทนา
            status: conv.status?.current || 'unread',
            conversation_status: {
              status: conv.status?.current || 'unread',
              updated_at: conv.status?.updated_at,
              updated_by: conv.status?.updated_by,
              priority: 'normal',
              tags: conv.status?.tags || [],
              status_time_ago: conv.last_user_message?.time_ago || 'unknown'
            },
            
            // การตั้งค่า session
            session_settings: conv.session_settings,
            
            // Mode (จะอัปเดตจาก history API ภายหลัง)
            mode: 'bot', // default mode
            
            // ข้อความ (จะโหลดจาก history API แยก)
            message: []
          };
          
          console.log(`📋 Mapped conversation ${conv.session_id}:`, {
            _id: mappedConv._id,
            session_id: conv.session_id,
            sender: mappedConv.sender,
            firstname: mappedConv.firstname,
            lastname: mappedConv.lastname,
            unreadCount: mappedConv.unreadCount,
            status: mappedConv.status
          });
          
          console.log('🔍 Final mappedConv _id:', mappedConv._id);
          console.log('🔍 Final mappedConv keys:', Object.keys(mappedConv));
          
          return mappedConv;
        });
        
        
        if (silent) {
          // แบบ Silent: อัปเดตข้อมูลแบบ smooth ไม่ให้กระพริบ
          this.updateConversationsSmooth(newConversations);
        } else {
          // แบบปกติ: แทนที่ข้อมูลทั้งหมด
          this.conversations = newConversations;
          this.selectLastConversation();
        }
        
        console.log(`✅ Successfully loaded ${newConversations.length} conversations (silent: ${silent})`);
        if(!silent) { this.loader = true; }
        
      } catch (error) {
        console.error('❌ Error loading conversations:', error);
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        // แสดง error toast ให้ user เห็น
        this.showToast(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}`, 'error');
        
        // เซ็ต conversations เป็น array ว่างเพื่อป้องกัน undefined error
        this.conversations = [];
        
        if(!silent) { this.loader = true; }
      }
    },
    formatTime(date) {
      return date instanceof Date && !isNaN(date)
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Invalid Date';
    },
    toggleEmojiPicker() {
      this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
    },
    toggleSearchPanel() {
      this.isSearchPanelOpen = !this.isSearchPanelOpen;
    },
    addEmojiToMessage(emoji) {
      this.newMessage += emoji;
      this.isEmojiPickerOpen = false;
    },
    async selectLastConversation() {
      console.log('selectLastConversation called');
      console.log('Available conversations:', this.conversations.length);
      console.log('🔍 Raw conversations _ids:', this.conversations.map(c => ({ _id: c._id, session_id: c.session_id })));
      console.log('Sorted filtered conversations:', this.sortedFilteredConversations.length);
      console.log('🔍 Sorted conversations _ids:', this.sortedFilteredConversations.map(c => ({ _id: c._id, session_id: c.session_id })));
      
      // เลือก conversation บนสุด (ล่าสุด) จาก sortedFilteredConversations
      const sortedConversations = this.sortedFilteredConversations;
      if (sortedConversations.length === 0) {
        console.log('No conversations available to select');
        this.selectedConversation = null;
        return;
      }
      
      // เลือกการสนทนาแรก (ใหม่ที่สุด)
      const latestConversation = sortedConversations[0];
      console.log('Selecting latest conversation:', latestConversation._id, 'last updated:', latestConversation.lastUpdate);
      console.log('🔍 Debug latestConversation:', {
        _id: latestConversation._id,
        session_id: latestConversation.session_id,
        sender: latestConversation.sender,
        firstname: latestConversation.firstname
      });
      
      this.selectedConversation = latestConversation;
      // ไม่ต้อง reset unread count ให้ใช้ข้อมูลจาก API ตรงๆ
      this.isCustomerPanelOpen = false;
      this.isAgentMode = this.selectedConversation.mode === 'agent';
      
      // โหลด full message history จาก AI Gateway สำหรับ conversation ที่เลือก
      this.loadingHistory = true;
      try {
        console.log('Loading full message history for latest conversation:', this.selectedConversation._id);
        const historyResult = await fetchConversationHistory(this.selectedConversation._id);
        
        if (historyResult && historyResult.messages && historyResult.messages.length > 0) {
          // อัปเดต conversation ด้วย full message history (ทั้งหมด)
          this.selectedConversation.message = historyResult.messages;
          console.log(`Loaded ALL ${historyResult.messages.length} messages for conversation ${this.selectedConversation._id}`);
          
          // อัปเดต mode จาก control_status
          if (historyResult.mode) {
            this.selectedConversation.mode = historyResult.mode;
            this.isAgentMode = historyResult.mode === 'agent';
            console.log(`Updated conversation mode to: ${historyResult.mode}`);
          }
          
          // เก็บข้อมูล control_status
          if (historyResult.controlStatus) {
            this.selectedConversation.controlStatus = historyResult.controlStatus;
          }
        } else {
          console.log('No full message history found for first conversation, using existing messages');
          // ถ้าไม่มี history ให้ใช้ message ที่มีอยู่ใน conversation
          if (!this.selectedConversation.message || this.selectedConversation.message.length === 0) {
            this.selectedConversation.message = [];
          }
        }
      } catch (error) {
        console.error('Error loading first conversation history:', error);
        // ถ้าโหลด full history ไม่ได้ ให้ใช้ข้อมูลที่มีอยู่
        if (!this.selectedConversation.message || this.selectedConversation.message.length === 0) {
          this.selectedConversation.message = [];
        }
      } finally {
        this.loadingHistory = false;
      }
      
      this.$nextTick(() => {
        this.scrollToEnd();
      });
    },
    async selectConversation(conversation) {
      // Cancel customer editing if active
      if (this.isEditingCustomer) {
        this.cancelEditingCustomer();
      }
      
      this.selectedConversation = conversation;
      // ไม่ต้อง reset unread count ให้ใช้ข้อมูลจาก API ตรงๆ
      this.isCustomerPanelOpen = false;
      this.isAgentMode = this.selectedConversation.mode === 'agent';
      
      // สำหรับ mobile: เปิด chat view
      if (window.innerWidth < 1024) { // lg breakpoint
        this.isMobileChatView = true;
      }
      
      // โหลด conversation history โดยใช้ฟังก์ชั่น loadConversationHistory
      await this.loadConversationHistory(conversation);
      
      this.$nextTick(() => {
        this.scrollToEnd();
      });
    },

    /**
     * ปิด mobile chat view และกลับไปที่ conversation list
     */
    closeMobileChatView() {
      this.isMobileChatView = false;
      this.selectedConversation = null;
    },

    /**
     * จัดการเมื่อขนาดหน้าจอเปลี่ยน
     */
    handleResize() {
      // ถ้าขนาดหน้าจอใหญ่ขึ้น (เป็น desktop) ให้ปิด mobile chat view
      if (window.innerWidth >= 1024 && this.isMobileChatView) {
        this.isMobileChatView = false;
      }
    },

    /**
     * โหลด conversation history สำหรับ conversation ที่กำหนด
     */
    async loadConversationHistory(conversation) {
      if (!conversation) {
        console.warn('No conversation provided for loading history');
        return;
      }

      this.loadingHistory = true;
      try {
        console.log('Loading full message history for session:', conversation._id);
        const historyResult = await fetchConversationHistory(conversation._id);
        
        if (historyResult && historyResult.messages && historyResult.messages.length > 0) {
          // อัปเดต conversation ด้วย full message history (ทั้งหมด)
          conversation.message = historyResult.messages;
          
          // อัปเดต mode ถ้ามีข้อมูล control status
          if (historyResult.mode) {
            conversation.mode = historyResult.mode;
            this.isAgentMode = conversation.mode === 'agent';
          }
          
          console.log(`Loaded ${historyResult.messages.length} messages for conversation ${conversation._id}`);
        } else {
          // ถ้าไม่มี message history ให้ใช้ข้อมูลที่มีอยู่
          if (!conversation.message || conversation.message.length === 0) {
            conversation.message = [];
          }
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
        // ถ้าโหลด full history ไม่ได้ ให้ใช้ข้อมูลที่มีอยู่
        if (!conversation.message || conversation.message.length === 0) {
          conversation.message = [];
        }
      } finally {
        this.loadingHistory = false;
      }
      
      // ถ้าเป็น conversation ที่เลือกอยู่ ให้ scroll ไปข้อความล่าสุด
      if (this.selectedConversation && this.selectedConversation._id === conversation._id) {
        this.$nextTick(() => {
          this.scrollToEnd();
        });
      }
    },

    /**
     * โหลด conversation history แบบ smooth (ไม่แสดง loading spinner ถ้าไม่จำเป็น)
     */
    async loadConversationHistorySmooth(conversation) {
      if (!conversation) {
        console.warn('No conversation provided for loading history');
        return;
      }

      // ไม่แสดง loading indicator ถ้ามี message อยู่แล้ว
      const showLoading = !conversation.message || conversation.message.length === 0;
      
      if (showLoading) {
        this.loadingHistory = true;
      }
      
      try {
        console.log('Loading conversation history (smooth mode) for session:', conversation._id);
        const historyResult = await fetchConversationHistory(conversation._id);
        
        if (historyResult && historyResult.messages && historyResult.messages.length > 0) {
          // เก็บ scroll position เดิมไว้
          const chatWindow = this.$refs.chatWindow;
          const oldScrollHeight = chatWindow ? chatWindow.scrollHeight : 0;
          const wasAtBottom = chatWindow ? 
            (chatWindow.scrollHeight - chatWindow.scrollTop - chatWindow.clientHeight < 50) : true;
          
          // อัปเดต conversation ด้วย message history ใหม่
          const oldMessageCount = conversation.message ? conversation.message.length : 0;
          conversation.message = historyResult.messages;
          const newMessageCount = historyResult.messages.length;
          
          // อัปเดต mode ถ้ามีข้อมูล control status
          if (historyResult.mode) {
            conversation.mode = historyResult.mode;
            this.isAgentMode = conversation.mode === 'agent';
          }
          
          console.log(`Loaded ${historyResult.messages.length} messages (smooth) for conversation ${conversation._id}`);
          
          // จัดการ scroll position แบบ smooth
          this.$nextTick(() => {
            if (this.selectedConversation && this.selectedConversation._id === conversation._id && chatWindow) {
              if (newMessageCount > oldMessageCount) {
                // มี message ใหม่เพิ่มเข้ามา
                if (wasAtBottom) {
                  // ถ้าผู้ใช้อยู่ด้านล่าง ให้ scroll ไปด้านล่างต่อ
                  this.scrollToEnd();
                } else {
                  // ถ้าผู้ใช้ไม่ได้อยู่ด้านล่าง ให้รักษา position เดิม
                  const newScrollHeight = chatWindow.scrollHeight;
                  const scrollDiff = newScrollHeight - oldScrollHeight;
                  chatWindow.scrollTop += scrollDiff;
                }
              } else if (wasAtBottom) {
                // ถ้าไม่มี message ใหม่แต่ผู้ใช้อยู่ด้านล่าง ให้ scroll ไปด้านล่าง
                this.scrollToEnd();
              }
            }
          });
        }
      } catch (error) {
        console.error('Error loading conversation history (smooth):', error);
      } finally {
        if (showLoading) {
          this.loadingHistory = false;
        }
      }
    },

    /**
     * เพิ่มข้อความใหม่แบบ smooth โดยไม่ต้อง reload ทั้งหมด
     */
    async addNewMessageSmooth(sessionId, notification) {
      if (!this.selectedConversation || this.selectedConversation._id !== sessionId) {
        return;
      }

      try {
        console.log('🆕 Adding new message smoothly for session:', sessionId, notification);
        
        // ดึงข้อความใหม่จาก notification หรือเรียก API เพื่อดึงข้อความล่าสุด
        const { message, content, text, sender, role, timestamp } = notification;
        
        if (message || content || text) {
          // สร้าง message object
          const newMessage = {
            _id: `msg-${sessionId}-${Date.now()}`,
            text: message || content || text,
            time: timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: sender === 'user' || role === 'user' ? 'customer' : 'agent',
            read: true,
            isNew: true // เพื่อ highlight
          };

          // ตรวจสอบว่าข้อความนี้มีอยู่แล้วหรือไม่ (ป้องกันการซ้ำ)
          const existingMessage = this.selectedConversation.message.find(msg => 
            msg.text === newMessage.text && 
            Math.abs(new Date(msg.time) - new Date(newMessage.time)) < 5000 // ภายใน 5 วินาที
          );

          if (!existingMessage) {
            // เพิ่มข้อความใหม่เข้าไปในรายการ
            this.selectedConversation.message.push(newMessage);
            
            // อัปเดต lastUpdate
            this.selectedConversation.lastUpdate = new Date();
            
            // อัปเดต preview
            this.updateConversationPreview(this.selectedConversation);
            
            // Scroll ไปข้อความใหม่
            this.$nextTick(() => {
              this.scrollToEnd();
              
              // ลบ highlight หลังจาก 2 วินาที
              setTimeout(() => {
                newMessage.isNew = false;
              }, 2000);
            });
            
            console.log('✅ New message added smoothly:', newMessage);
          } else {
            console.log('⚠️ Message already exists, skipping duplicate');
          }
        } else {
          // ถ้าไม่มีข้อความใน notification ให้ดึงข้อความล่าสุดจาก API
          console.log('📥 No message content in notification, fetching latest messages from API');
          await this.loadLatestMessagesOnly(sessionId);
        }
        
      } catch (error) {
        console.error('Error adding new message smoothly:', error);
        // ถ้าเกิดข้อผิดพลาด ให้ fallback ไป reload ทั้งหมด
        console.log('🔄 Falling back to full reload due to error');
        this.loadConversationHistorySmooth(this.selectedConversation, false);
      }
    },

    /**
     * ดึงเฉพาะข้อความล่าสุดโดยไม่แทนที่ข้อความเดิม
     */
    async loadLatestMessagesOnly(sessionId) {
      try {
        console.log('📥 Loading latest messages only for session:', sessionId);
        
        const historyResult = await fetchConversationHistory(sessionId);
        
        if (historyResult && historyResult.messages && historyResult.messages.length > 0) {
          const currentMessageCount = this.selectedConversation.message.length;
          const newMessages = historyResult.messages;
          
          // เปรียบเทียบและเพิ่มเฉพาะข้อความใหม่
          if (newMessages.length > currentMessageCount) {
            const latestMessages = newMessages.slice(currentMessageCount);
            
            latestMessages.forEach((newMsg, index) => {
              // ตรวจสอบว่าข้อความนี้มีอยู่แล้วหรือไม่
              const existingMessage = this.selectedConversation.message.find(msg => 
                msg._id === newMsg._id || (msg.text === newMsg.text && msg.sender === newMsg.sender)
              );
              
              if (!existingMessage) {
                // เพิ่ม flag สำหรับ highlight
                newMsg.isNew = true;
                this.selectedConversation.message.push(newMsg);
                
                // ลบ highlight หลังจาก 2 วินาที (delay แต่ละข้อความ)
                setTimeout(() => {
                  newMsg.isNew = false;
                }, 2000 + (index * 500));
              }
            });
            
            // อัปเดต lastUpdate
            this.selectedConversation.lastUpdate = new Date();
            
            // อัปเดต preview
            this.updateConversationPreview(this.selectedConversation);
            
            // Scroll ไปข้อความใหม่
            this.$nextTick(() => {
              this.scrollToEnd();
            });
            
            console.log(`✅ Added ${latestMessages.length} new messages smoothly`);
          } else {
            console.log('📝 No new messages to add');
          }
        }
        
      } catch (error) {
        console.error('Error loading latest messages only:', error);
      }
    },

    /**
     * Debounced refresh conversations เพื่อป้องกันการเรียก API บ่อยเกินไป
     */
    debouncedRefreshConversations() {
      // ยกเลิก timeout เดิม (ถ้ามี)
      if (this.wsRefreshTimeout) {
        clearTimeout(this.wsRefreshTimeout);
      }
      
      // ตั้ง timeout ใหม่
      this.wsRefreshTimeout = setTimeout(() => {
        console.log('🔄 Debounced: Silently refreshing conversations to update unread counts');
        this.loadConversations(true, this.conversationLimit);
        this.wsRefreshTimeout = null;
      }, 1000); // รอ 1 วินาทีก่อนเรียก API
    },

    /**
     * อัปเดต conversation list แบบ smooth ไม่ให้กระพริบ
     */
    updateConversationsSmooth(newConversations) {
      // ตรวจสอบ parameter ก่อนใช้งาน
      if (!Array.isArray(newConversations)) {
        console.error('❌ updateConversationsSmooth: newConversations is not an array:', newConversations);
        return;
      }
      
      // ตรวจสอบว่า this.conversations มีค่าแล้วหรือไม่
      if (!this.conversations) {
        console.log('🔧 this.conversations is undefined, initializing as empty array');
        this.conversations = [];
      }
      
      console.log(`🔄 Updating ${newConversations.length} conversations smoothly`);
      
      // เก็บ scroll position ปัจจุบัน
      const conversationListElement = document.querySelector('.conversation-list-container');
      const currentScrollTop = conversationListElement ? conversationListElement.scrollTop : 0;
      
      // เก็บข้อมูลเดิมไว้เพื่อเปรียบเทียบ
      const oldConversationsMap = new Map();
      this.conversations.forEach(conv => {
        oldConversationsMap.set(conv._id, conv);
      });

      // อัปเดตข้อมูลที่มีอยู่และเพิ่มใหม่
      const updatedConversations = newConversations.map(newConv => {
        const oldConv = oldConversationsMap.get(newConv._id);
        
        if (oldConv) {
          // อัปเดต conversation ที่มีอยู่แล้ว (เฉพาะข้อมูลที่จำเป็น)
          const updated = {
            ...oldConv, // เก็บข้อมูลเดิมที่สำคัญ (เช่น message array)
            
            // อัปเดตข้อมูลจาก API
            unreadCount: newConv.unreadCount,
            messageCount: newConv.messageCount,
            preview: newConv.preview,
            lastUpdate: newConv.lastUpdate,
            status: newConv.status,
            conversation_status: {
              ...oldConv.conversation_status,
              ...newConv.conversation_status
            },
            
            // อัปเดตข้อมูลลูกค้า (ถ้ามีการเปลี่ยนแปลง)
            firstname: newConv.firstname || oldConv.firstname,
            lastname: newConv.lastname || oldConv.lastname,
            phone: newConv.phone || oldConv.phone,
            email: newConv.email || oldConv.email,
            remark: newConv.remark || oldConv.remark,
            sender: newConv.sender || oldConv.sender
          };
          
          // Log การเปลี่ยนแปลง unread count
          if (oldConv.unreadCount !== newConv.unreadCount) {
            console.log(`📊 Unread count updated for ${newConv._id}: ${oldConv.unreadCount} → ${newConv.unreadCount}`);
          }
          
          // Log การเปลี่ยนแปลงข้อมูลลูกค้า
          if (oldConv.firstname !== newConv.firstname || oldConv.lastname !== newConv.lastname) {
            console.log(`👤 Customer info updated for ${newConv._id}:`, {
              old: `${oldConv.firstname} ${oldConv.lastname}`,
              new: `${newConv.firstname} ${newConv.lastname}`
            });
          }
          
          return updated;
        } else {
          // เป็น conversation ใหม่
          console.log(`🆕 New conversation added: ${newConv._id}`);
          return newConv;
        }
      });

      // แทนที่ conversations array แบบ smooth
      this.conversations = updatedConversations;
      
      // รักษา scroll position
      this.$nextTick(() => {
        if (conversationListElement && currentScrollTop > 0) {
          conversationListElement.scrollTop = currentScrollTop;
        }
      });
      
      console.log('🔄 Conversations updated smoothly without UI flicker');
    },

    /**
     * รีเฟรช conversations โดยดึงข้อมูลใหม่แล้วอัปเดตแบบ smooth
     */
    async refreshConversationsSmooth() {
      try {
        console.log('🔄 Fetching fresh conversation data for smooth update...');
        const response = await fetchConversations(this.conversationLimit);
        
        if (response && response.success && Array.isArray(response.data)) {
          console.log(`📊 Received ${response.data.length} conversations from API`);
          
          // Process the raw API data and map to local format (same as in loadConversations)
          const newConversations = response.data.map(conv => {
            // Map ข้อมูลจาก API format ใหม่ไปเป็น format ที่ component ใช้
            const mappedConv = {
              _id: conv.session_id,
              hostname: conv.hostname,
              messageCount: conv.message_count,
              unreadCount: conv.unread_count,
              
              // ข้อมูลลูกค้าจาก user object
              firstname: conv.user?.firstname || '',
              lastname: conv.user?.lastname || '',
              phone: conv.user?.phone || '',
              email: conv.user?.email || '',
              remark: conv.user?.remark || '',
              sender: conv.user?.firstname ? 
                `${conv.user.firstname} ${conv.user.lastname || ''}`.trim() : 
                (conv.user?.email?.split('@')[0] || 'ลูกค้า'), // ใช้ส่วนหน้า @ ของ email หรือ 'ลูกค้า'
              
              // ข้อมูลข้อความล่าสุด
              preview: conv.last_user_message?.content || '',
              lastUpdate: new Date(conv.last_message_timestamp || conv.updated_at),
              
              // สถานะการสนทนา
              status: conv.status?.current || 'unread',
              conversation_status: {
                status: conv.status?.current || 'unread',
                updated_at: conv.status?.updated_at,
                updated_by: conv.status?.updated_by,
                priority: 'normal',
                tags: conv.status?.tags || [],
                status_time_ago: conv.last_user_message?.time_ago || 'unknown'
              },
              
              // การตั้งค่า session
              session_settings: conv.session_settings,
              
              // Mode (จะอัปเดตจาก history API ภายหลัง)
              mode: 'bot', // default mode
              
              // ข้อความ (จะโหลดจาก history API แยก)
              message: []
            };
            
            return mappedConv;
          });
          
          this.updateConversationsSmooth(newConversations);
        } else {
          console.error('❌ Invalid response format for refreshConversationsSmooth:', response);
        }
      } catch (error) {
        console.error('❌ Error in refreshConversationsSmooth:', error);
      }
    },

    /**
     * อัปเดต conversation แบบ smart (ไม่ reload ทั้งหมด)
     */
    async updateConversationSmart(sessionId, notification) {
      try {
        // หา conversation ที่ต้องอัปเดต
        const conversationIndex = this.conversations.findIndex(conv => conv._id === sessionId);
        
        if (conversationIndex !== -1) {
          // อัปเดต conversation ที่มีอยู่
          const conversation = this.conversations[conversationIndex];
          
          // อัปเดต lastUpdate และ preview
          conversation.lastUpdate = new Date();
          if (notification.message && notification.message.text) {
            conversation.preview = notification.message.text;
          }
          
          // ย้าย conversation ไปด้านบนสุดของ list
          this.conversations.splice(conversationIndex, 1);
          this.conversations.unshift(conversation);
          
          console.log(`Smart updated conversation ${sessionId} without full reload`);
          console.log(`ℹ️ unread_count will be updated from API /conversations/all on next reload`);
        } else {
          // ถ้าไม่เจอ conversation ใน list ให้ reload แค่บางส่วน
          console.log(`Conversation ${sessionId} not found, performing minimal reload`);
          await this.loadNewConversationsOnly();
        }
      } catch (error) {
        console.error('Error in smart conversation update:', error);
        // Fallback ไป full reload ถ้า smart update ล้มเหลว
        this.loadConversations(true, this.conversationLimit);
      }
    },

    /**
     * เพิ่ม conversation ใหม่แบบ smooth
     */
    async addNewConversationSmooth(notification) {
      try {
        console.log('Adding new conversation smooth:', notification);
        
        // โหลด conversation ใหม่จาก API
        const newConversations = await fetchConversations(5); // โหลดแค่ 5 รายการล่าสุด
        
        if (newConversations && newConversations.length > 0) {
          // เช็คว่า conversation ไหนใหม่ที่ยังไม่มีใน list
          const existingIds = this.conversations.map(conv => conv._id);
          const trulyNewConversations = newConversations.filter(conv => !existingIds.includes(conv._id));
          
          if (trulyNewConversations.length > 0) {
            // เพิ่ม conversation ใหม่ไปด้านบนสุด
            this.conversations.unshift(...trulyNewConversations);
            
            // แสดง notification
            this.showToast(`มีการสนทนาใหม่ ${trulyNewConversations.length} รายการ`, 'info');
            
            console.log(`Added ${trulyNewConversations.length} new conversations smoothly`);
          }
        }
      } catch (error) {
        console.error('Error adding new conversation smooth:', error);
        // Fallback ไป full reload
        this.loadConversations(false, this.conversationLimit);
      }
    },

    /**
     * โหลดเฉพาะ conversation ใหม่ๆ
     */
    async loadNewConversationsOnly() {
      try {
        // โหลด conversation ใหม่ 10 รายการล่าสุด
        const newConversations = await fetchConversations(10);
        
        if (newConversations && newConversations.length > 0) {
          // เช็คว่า conversation ไหนใหม่
          const existingIds = this.conversations.map(conv => conv._id);
          const trulyNewConversations = newConversations.filter(conv => !existingIds.includes(conv._id));
          
          if (trulyNewConversations.length > 0) {
            // เพิ่ม conversation ใหม่ไปด้านบนสุด
            this.conversations.unshift(...trulyNewConversations);
            console.log(`Loaded ${trulyNewConversations.length} new conversations only`);
          }
        }
      } catch (error) {
        console.error('Error loading new conversations only:', error);
      }
    },

    selectStatus(status) {
      this.selectedStatus = status;
    },
    async sendMessage() {
      if (this.newMessage.trim() && this.selectedConversation) {
        // สร้าง message object สำหรับแสดงใน UI ทันที
        const newMessage = {
          _id: `temp-${Date.now()}`,
          text: this.newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'agent',
          read: true,
          isNew: true, // เพิ่ม flag สำหรับ highlight ข้อความใหม่
        };

        // เก็บข้อความที่จะส่ง
        const messageToSend = this.newMessage;
        
        // เพิ่มข้อความใน UI ทันที
        this.selectedConversation.message.push(newMessage);
        this.selectedConversation.lastUpdate = new Date();
        
        // ล้างช่องพิมพ์ข้อความ
        this.newMessage = '';

        // อัปเดต preview
        this.updateConversationPreview(this.selectedConversation);

        // 🎯 Scroll ไปข้อความใหม่ทันทีที่เพิ่มใน UI (ก่อนส่งไปเซิร์ฟเวอร์)
        this.$nextTick(() => {
          this.scrollToEnd();
          
          // ลบ highlight หลังจาก 2 วินาที
          setTimeout(() => {
            newMessage.isNew = false;
          }, 2000);
        });

        try {
          // ถ้าอยู่ใน Admin mode และเป็น AI Gateway conversation ให้ใช้ AI Gateway API
          if (this.selectedConversation.mode === 'agent' && this.selectedConversation._id.includes('chat-')) {
            console.log('Sending admin reply via AI Gateway for session:', this.selectedConversation._id);
            
            const result = await sendAdminReply(this.selectedConversation._id, messageToSend);
            
            if (result.success) {
              console.log('Successfully sent admin reply via AI Gateway');
              
              // อัปเดต message ID จาก AI Gateway response
              if (result.messageId) {
                newMessage._id = result.messageId;
              }
              
              // อัปเดต timestamp จาก AI Gateway response
              if (result.timestamp) {
                newMessage.time = new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }
              
              // รีเฟรช conversations เพื่ออัพเดต unread count หลังจากส่งข้อความสำเร็จ
              console.log('🔄 Refreshing conversations after admin reply to update unread count');
              await this.refreshConversationsSmooth();
            }
          } else {
            // ใช้ระบบเดิมสำหรับ conversation ทั่วไป
            await updateConversation(this.selectedConversation._id, {
              message: this.selectedConversation.message,
              lastUpdate: this.selectedConversation.lastUpdate,
              preview: this.selectedConversation.preview
            });
            
            // รีเฟรช conversations เพื่ออัพเดต unread count หลังจากส่งข้อความสำเร็จ
            console.log('🔄 Refreshing conversations after admin reply (legacy system) to update unread count');
            await this.refreshConversationsSmooth();
          }

          // ส่งข้อความผ่าน Ably (สำหรับระบบแจ้งเตือนภายใน)
          const messageData = {
            text: messageToSend,
            timestamp: new Date().toISOString(),
          };
          await this.publishToConversationChannel(this.selectedConversation._id, 'agent_reply', messageData);

          // ส่งการแจ้งเตือนผ่าน WebSocket
          this.sendWebSocketMessage({
            action: 'agent_reply',
            session_id: this.selectedConversation._id,
            message: {
              content: messageToSend,
              timestamp: new Date().toISOString(),
              sender_type: 'agent'
            },
            admin_id: this.session?.current?._id || 'admin'
          });

        } catch (error) {
          console.error('Error sending message:', error);
          
          // ถ้าส่งไม่สำเร็จ ให้ลบข้อความที่เพิ่มไปใน UI
          const messageIndex = this.selectedConversation.message.findIndex(msg => msg._id === newMessage._id);
          if (messageIndex > -1) {
            this.selectedConversation.message.splice(messageIndex, 1);
          }
          
          // แสดงข้อความผิดพลาด
          this.showErrorToast('ไม่สามารถส่งข้อความได้: ' + error.message);
        }
      }
    },
    updateConversationPreview(conversation) {
      const lastCustomerMessage = conversation.message
        .slice()
        .reverse()
        .find((msg) => msg.sender === 'customer');
      conversation.preview = lastCustomerMessage ? lastCustomerMessage.text : '';
    },
    scrollToEnd() {
      const chatWindow = this.$refs.chatWindow;
      if (chatWindow) {
        // ตรวจสอบว่าผู้ใช้อยู่ใกล้ด้านล่างหรือไม่ (ภายใน 100px)
        const isNearBottom = chatWindow.scrollHeight - chatWindow.scrollTop - chatWindow.clientHeight < 100;
        
        if (isNearBottom) {
          // ใช้ smooth scrolling behavior สำหรับ UX ที่ดีขึ้น
          chatWindow.scrollTo({
            top: chatWindow.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          // ถ้าผู้ใช้อยู่ไกลจากด้านล่าง ให้แสดง indicator ว่ามีข้อความใหม่
          this.showNewMessageIndicator = true;
          setTimeout(() => {
            this.showNewMessageIndicator = false;
          }, 5000);
        }
      }
    },

    /**
     * Force scroll ไปด้านล่าง (เมื่อคลิก indicator)
     */
    forceScrollToEnd() {
      const chatWindow = this.$refs.chatWindow;
      if (chatWindow) {
        chatWindow.scrollTo({
          top: chatWindow.scrollHeight,
          behavior: 'smooth'
        });
        this.showNewMessageIndicator = false;
      }
    },
    async resolveConversation() {
      if (this.selectedConversation) {
        // ใช้ helper function ใหม่
        this.setConversationStatus(this.selectedConversation, 'solved', 'Conversation resolved by admin', this.session?.current?.name || 'admin');
        
        try {
          // เรียกใช้ markConversationSolved จาก conversationStatus.js
          const result = await markConversationSolved(
            this.selectedConversation._id, 
            this.session?.current?._id || 'admin_user',
            'Conversation marked as solved from resolve button'
          );
          
          this.selectStatus('solved');
          this.showSuccessToast('เปลี่ยนสถานะเป็น "แก้ไขแล้ว" สำเร็จ');
          console.log('✅ Conversation resolved via markConversationSolved:', result);
        } catch (error) {
          console.error('❌ Error resolving conversation:', error);
          // revert กลับสถานะเดิม
          this.setConversationStatus(this.selectedConversation, 'unread', 'Error: reverted to unread', 'system');
          this.showErrorToast('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ: ' + error.message);
        }
      }
    },
    toggleCustomerPanel() {
      console.log('toggleCustomerPanel called, current state:', this.isCustomerPanelOpen);
      console.log('isMobileChatView:', this.isMobileChatView);
      console.log('selectedConversation exists:', !!this.selectedConversation);
      this.isCustomerPanelOpen = !this.isCustomerPanelOpen;
      console.log('new isCustomerPanelOpen state:', this.isCustomerPanelOpen);
    },
    getInitials(name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('');
    },
    addFile() {
      this.showInfoToast('ฟีเจอร์แนบไฟล์กำลังพัฒนา', 'ข้อมูล');
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
    },
    async switchToAgentMode() {
      if (this.selectedConversation && this.selectedConversation.mode === 'bot') {
        this.selectedConversation.mode = 'agent';

        try {
          await updateConversation(this.selectedConversation._id, { mode: 'agent' });
          this.isAgentMode = true;
        } catch (error) {
          console.error('Failed to switch to agent mode:', error);
          this.selectedConversation.mode = 'bot';
        }
      }
    },
    async switchToAIMode() {
      if (this.selectedConversation) {
        try {
          console.log('Switching to AI mode for session:', this.selectedConversation._id);
          const result = await switchConversationMode(this.selectedConversation._id, 'ai');
          
          if (result.success) {
            this.selectedConversation.mode = 'bot';
            this.isAgentMode = false;
            console.log('Successfully switched to AI mode');
            
            // แสดงข้อความแจ้งเตือน
            this.showSuccessToast('AI จะตอบข้อความอัตโนมัติ', 'เปลี่ยนเป็น AI Mode แล้ว');
          }
        } catch (error) {
          console.error('Failed to switch to AI mode:', error);
          this.showErrorToast('ไม่สามารถเปลี่ยนเป็น AI Mode ได้: ' + error.message);
        }
      }
    },
    async switchToAdminMode() {
      if (this.selectedConversation) {
        try {
          console.log('Switching to Admin mode for session:', this.selectedConversation._id);
          const result = await switchConversationMode(this.selectedConversation._id, 'admin');
          
          if (result.success) {
            this.selectedConversation.mode = 'agent';
            this.isAgentMode = true;
            console.log('Successfully switched to Admin mode');
            
            // แสดงข้อความแจ้งเตือน
            this.showSuccessToast('เจ้าหน้าที่สามารถตอบข้อความได้', 'เปลี่ยนเป็น Manual Mode แล้ว');
          }
        } catch (error) {
          console.error('Failed to switch to Admin mode:', error);
          this.showErrorToast('ไม่สามารถเปลี่ยนเป็น Manual Mode ได้: ' + error.message);
        }
      }
    },
    getStatusCount(status) {
      if (status === 'all') return this.conversations.length;
      
      // ใช้ computed properties ใหม่สำหรับ conversation_status
      if (status === 'unread') return this.unreadCount;
      if (status === 'read') return this.readCount;
      if (status === 'in-progress') return this.inProgressCount;
      if (status === 'solved') return this.solvedCount;
      if (status === 'pending') return this.pendingCount;
      if (status === 'transferred') return this.transferredCount;
      if (status === 'archived') return this.archivedCount;
      
      // Legacy counts for backward compatibility
      if (status === 'unassigned') return this.unassignedCount;
      if (status === 'assigned') return this.assignedCount;
      if (status === 'resolved') return this.resolvedCount;
      
      // นับสถานะจาก conversation_status
      return this.conversations.filter(conv => this.getConversationStatus(conv) === status).length;
    },
    getStatusLabel(status) {
      const statusLabels = {
        // Original statuses
        unassigned: 'ยังไม่ได้รับมอบหมาย',
        assigned: 'ได้รับมอบหมายแล้ว',
        resolved: 'แก้ไขแล้ว',
        all: 'ทั้งหมด',
        
        // Complete conversation statuses
        'unread': 'ยังไม่อ่าน',
        'read': 'อ่านแล้ว',
        'in-progress': 'กำลังดำเนินการ',
        'solved': 'แก้ไขแล้ว',
        'pending': 'รอดำเนินการ',
        'transferred': 'โอนแล้ว',
        'archived': 'เก็บถาวร',
        'new': 'ใหม่',
        'active': 'กำลังตอบ'
      };
      return statusLabels[status] || status;
    },
    getStatusClass(status) {
      const statusClasses = {
        // Original statuses
        unassigned: 'bg-yellow-100 text-yellow-800',
        assigned: 'bg-green-100 text-green-800',
        resolved: 'bg-red-100 text-red-800',
        
        // Complete conversation statuses
        'unread': 'bg-gray-100 text-gray-800',
        'read': 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-orange-100 text-orange-800',
        'solved': 'bg-green-100 text-green-800',
        'pending': 'bg-yellow-100 text-yellow-800',
        'transferred': 'bg-indigo-100 text-indigo-800',
        'archived': 'bg-gray-100 text-gray-600',
        'new': 'bg-purple-100 text-purple-800',
        'active': 'bg-orange-100 text-orange-800'
      };
      return statusClasses[status] || 'bg-gray-100 text-gray-800';
    },
    toggleMobileSidebar() {
      this.showMobileSidebar = !this.showMobileSidebar;
    },
    selectStatusAndCloseMobile(status) {
      this.selectStatus(status);
      this.toggleMobileSidebar();
    },

    // ===== Status Management Methods =====
    
    // ===== Customer Data Management Methods =====
    
    /**
     * เริ่มการแก้ไขข้อมูลลูกค้า
     */
    startEditingCustomer() {
      this.isEditingCustomer = true;
      
      // ดึงข้อมูลปัจจุบันจาก selectedConversation
      const conversation = this.selectedConversation;
      this.editingCustomerData = {
        firstname: conversation.firstname || conversation.sender || '',
        lastname: conversation.lastname || '',
        phone: conversation.phone || '',
        email: conversation.email || '',
        remark: conversation.remark || ''
      };
      
      console.log('Started editing customer data:', this.editingCustomerData);
      
      // Focus ไปที่ input แรกหลังจาก DOM update
      this.$nextTick(() => {
        const firstInput = document.querySelector('.customer-edit-form input');
        if (firstInput) {
          console.log('Attempting to focus first input...');
          firstInput.focus();
          console.log('Input focused, activeElement:', document.activeElement);
        } else {
          console.warn('First input not found for focus');
        }
      });
    },
    
    /**
     * ยกเลิกการแก้ไขข้อมูลลูกค้า
     */
    cancelEditingCustomer() {
      this.isEditingCustomer = false;
      this.editingCustomerData = {
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
        remark: ''
      };
    },
    
    /**
     * บันทึกข้อมูลลูกค้าผ่าน API
     */
    async saveCustomerData() {
      if (!this.selectedConversation) {
        this.showToast('ไม่พบการสนทนาที่เลือก', 'error');
        return;
      }

      // Basic validation
      if (!this.editingCustomerData.firstname.trim()) {
        this.showToast('กรุณากรอกชื่อ', 'warning');
        return;
      }

      // Email validation (if provided)
      if (this.editingCustomerData.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.editingCustomerData.email.trim())) {
          this.showToast('รูปแบบอีเมลไม่ถูกต้อง', 'warning');
          return;
        }
      }

      try {
        const sessionId = this.selectedConversation._id;
        const adminName = this.session?.current?.name || 'admin';
        
        console.log('Saving customer data for session:', sessionId);
        console.log('Customer data:', this.editingCustomerData);

        const response = await fetch('https://ai-gateway.manonsanoi.workers.dev/conversation/user/set', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Hostname': getHostname(),
          },
          body: JSON.stringify({
            session_id: sessionId,
            firstname: this.editingCustomerData.firstname.trim(),
            lastname: this.editingCustomerData.lastname.trim(),
            phone: this.editingCustomerData.phone.trim(),
            email: this.editingCustomerData.email.trim(),
            remark: this.editingCustomerData.remark.trim(),
            updated_by: adminName
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Customer data update response:', result);

        if (result.success) {
          // อัปเดตข้อมูลใน selectedConversation
          this.selectedConversation.firstname = this.editingCustomerData.firstname;
          this.selectedConversation.lastname = this.editingCustomerData.lastname;
          this.selectedConversation.phone = this.editingCustomerData.phone;
          this.selectedConversation.email = this.editingCustomerData.email;
          this.selectedConversation.remark = this.editingCustomerData.remark;
          
          // อัปเดต sender name ถ้ามีการเปลี่ยนชื่อ
          if (this.editingCustomerData.firstname) {
            const fullName = `${this.editingCustomerData.firstname} ${this.editingCustomerData.lastname}`.trim();
            this.selectedConversation.sender = fullName || this.editingCustomerData.firstname;
          }

          // ออกจากโหมดแก้ไข
          this.isEditingCustomer = false;
          
          // แสดงข้อความสำเร็จ
          this.showSuccessToast('บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว');
          
          console.log('✅ Customer data updated successfully');
        } else {
          throw new Error(result.error || 'Unknown error occurred');
        }

      } catch (error) {
        console.error('❌ Error saving customer data:', error);
        this.showErrorToast(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message}`);
      }
    },

    /**
     * จัดการ keyboard shortcuts
     */
    handleKeyDown(event) {
      // Ctrl+S สำหรับบันทึกข้อมูลลูกค้า
      if (event.ctrlKey && event.key === 's' && this.isEditingCustomer) {
        event.preventDefault();
        this.saveCustomerData();
      }
      // Escape สำหรับยกเลิกการแก้ไข
      if (event.key === 'Escape' && this.isEditingCustomer) {
        event.preventDefault();
        this.cancelEditingCustomer();
      }
    },

    // ===== Status Management Methods =====
    
    /**
     * อัปเดตสถานะของการสนทนา
     */
    async updateStatus(status) {
      console.log('updateStatus called with:', status);
      console.log('selectedConversation:', this.selectedConversation);
      
      if (!this.selectedConversation) {
        this.showToast('ไม่พบการสนทนาที่เลือก', 'error');
        return;
      }

      try {
        const sessionId = this.selectedConversation._id;
        const adminId = this.session.current._id || 'admin_user';
        
        console.log('Calling API with:', { sessionId, adminId, status });

        let result;
        try {
          switch (status) {
            case 'unread':
              result = await markConversationUnread(sessionId, adminId, this.statusNotes);
              this.showToast('อัปเดตสถานะเป็น "ยังไม่อ่าน" เรียบร้อย', 'success');
              break;
            case 'read':
              result = await markConversationRead(sessionId, adminId, this.statusNotes);
              this.showToast('อัปเดตสถานะเป็น "อ่านแล้ว" เรียบร้อย', 'success');
              break;
            case 'in-progress':
              result = await markConversationInProgress(sessionId, adminId, this.statusNotes);
              this.showToast('อัปเดตสถานะเป็น "กำลังดำเนินการ" เรียบร้อย', 'success');
              break;
            case 'solved':
              result = await markConversationSolved(sessionId, adminId, this.statusNotes);
              this.showToast('อัปเดตสถานะเป็น "แก้ไขแล้ว" เรียบร้อย', 'success');
              break;
            case 'pending':
              result = await markConversationPending(sessionId, adminId, this.statusNotes, 'normal');
              this.showToast('อัปเดตสถานะเป็น "รอดำเนินการ" เรียบร้อย', 'success');
              break;
            case 'archived':
              result = await markConversationArchived(sessionId, adminId, this.statusNotes);
              this.showToast('อัปเดตสถานะเป็น "เก็บถาวร" เรียบร้อย', 'success');
              break;
            default:
              throw new Error(`Unknown status: ${status}`);
          }
        } catch (apiError) {
          console.warn('API call failed, updating status locally only:', apiError);
          // Fallback: อัปเดตสถานะ local เฉย ๆ เมื่อ API ไม่พร้อม
          this.showToast(`อัปเดตสถานะเป็น "${this.getStatusText(status)}" (รอการซิงค์)`, 'warning');
        }

        // อัปเดตสถานะใน local state ด้วย helper function
        this.setConversationStatus(
          this.selectedConversation, 
          status, 
          this.statusNotes || `Status changed to ${status}`,
          this.session?.current?.name || 'admin'
        );
        
        // ปิด dropdown
        this.showStatusDropdown = false;
        this.statusNotes = '';

        console.log('Status updated successfully:', result);
      } catch (error) {
        console.error('Error updating status:', error);
        this.showToast(`เกิดข้อผิดพลาดในการอัปเดตสถานะ: ${error.message}`, 'error');
      }
    },



    /**
     * ฟังก์ชันช่วยสำหรับแสดงไอคอนสถานะ
     */
    getStatusIcon(status) {
      const statusIcons = {
        'unread': 'fas fa-envelope',
        'read': 'fas fa-envelope-open',
        'in-progress': 'fas fa-spinner',
        'solved': 'fas fa-check-circle',
        'pending': 'fas fa-clock',
        'transferred': 'fas fa-exchange-alt',
        'archived': 'fas fa-archive',
        'new': 'fas fa-star',
        'active': 'fas fa-comment-dots'
      };
      return statusIcons[status] || 'fas fa-circle';
    },

    /**
     * ฟังก์ชันช่วยสำหรับแสดงข้อความสถานะ
     */
    getStatusText(status) {
      const statusTexts = {
        'unread': 'ยังไม่อ่าน',
        'read': 'อ่านแล้ว',
        'in-progress': 'กำลังดำเนินการ',
        'solved': 'แก้ไขแล้ว',
        'pending': 'รอดำเนินการ',
        'transferred': 'โอนแล้ว',
        'archived': 'เก็บถาวร',
        'new': 'ใหม่',
        'active': 'กำลังตอบ'
      };
      return statusTexts[status] || 'ไม่ระบุ';
    },

    /**
     * ฟังก์ชันช่วยสำหรับ CSS class ของปุ่มสถานะ
     */
    getStatusButtonClass(status) {
      const statusClasses = {
        'unread': 'text-gray-600 hover:text-gray-700 hover:bg-gray-50',
        'read': 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
        'in-progress': 'text-orange-600 hover:text-orange-700 hover:bg-orange-50',
        'solved': 'text-green-600 hover:text-green-700 hover:bg-green-50',
        'pending': 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50',
        'transferred': 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
        'archived': 'text-gray-600 hover:text-gray-700 hover:bg-gray-50',
        'new': 'text-purple-600 hover:text-purple-700 hover:bg-purple-50',
        'active': 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
      };
      return statusClasses[status] || 'text-gray-600 hover:text-gray-700 hover:bg-gray-50';
    },

    /**
     * ปิด dropdown เมื่อคลิกที่อื่น
     */
    handleClickOutside(event) {
      if (this.showStatusDropdown) {
        const dropdown = this.$refs.statusDropdownMenu;
        const button = event.target.closest('.relative');
        
        // ปิด dropdown ถ้าคลิกภายนอก
        if (dropdown && !dropdown.contains(event.target) && !button) {
          this.showStatusDropdown = false;
        }
      }
    },

    /**
     * เปลี่ยนสถานะการสนทนาโดยเรียก API
     */
    async changeConversationStatus(status) {
      console.log('🔄 Changing conversation status to:', status);
      
      if (!this.selectedConversation) {
        this.showToast('ไม่พบการสนทนาที่เลือก', 'error');
        return;
      }

      try {
        const sessionId = this.selectedConversation._id;
        const adminName = this.session?.current?.name || 'admin';
        
        // สำหรับ transfer status ใช้ API แยกต่างหาก
        if (status === 'transferred') {
          // เปิด dialog สำหรับ transfer แทน
          this.showTransferDialog = true;
          return;
        }

        // เรียก API เปลี่ยนสถานะ
        const response = await fetch('https://ai-gateway.manonsanoi.workers.dev/conversation/status/set', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Hostname': getHostname(),
          },
          body: JSON.stringify({
            session_id: sessionId,
            status: status,
            updated_by: adminName,
            notes: `Status changed to ${status}`,
            priority: 'normal',
            tags: ['admin-action', `status-${status}`]
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Status change response:', result);

        // อัปเดต local state
        this.setConversationStatus(
          this.selectedConversation,
          status,
          `Status changed to ${status}`,
          adminName,
          'normal',
          ['admin-action', `status-${status}`]
        );

        // ส่งการแจ้งเตือนผ่าน WebSocket
        this.sendWebSocketMessage({
          action: 'status_change',
          session_id: sessionId,
          status: status,
          updated_by: adminName,
          timestamp: new Date().toISOString(),
          notes: `Status changed to ${status}`
        });

        // แสดงข้อความสำเร็จ
        const statusMessages = {
          'unread': 'เปลี่ยนเป็นยังไม่อ่าน',
          'read': 'เปลี่ยนเป็นอ่านแล้ว',
          'in-progress': 'เปลี่ยนเป็นกำลังดำเนินการ',
          'solved': 'เปลี่ยนเป็นแก้ไขแล้ว',
          'pending': 'เปลี่ยนเป็นรอดำเนินการ',
          'archived': 'เปลี่ยนเป็นเก็บถาวร'
        };

        this.showToast(statusMessages[status] || `เปลี่ยนสถานะเป็น ${status}`, 'success');

      } catch (error) {
        console.error('❌ Error changing status:', error);
        this.showToast(`เกิดข้อผิดพลาดในการเปลี่ยนสถานะ: ${error.message}`, 'error');
      }
    },

    /**
     * จัดการการโอนการสนทนา
     */
    async handleTransfer() {
      if (!this.transferTo) {
        this.showToast('กรุณาเลือกทีมที่จะโอน', 'warning');
        return;
      }

      try {
        const sessionId = this.selectedConversation._id;
        const adminId = this.session?.current?._id || 'admin';

        // เรียก API โอนการสนทนา
        const response = await fetch('https://ai-gateway.manonsanoi.workers.dev/admin/status/transfer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Hostname': getHostname(),
          },
          body: JSON.stringify({
            session_id: sessionId,
            assigned_to: this.transferTo,
            admin_id: adminId,
            notes: this.transferNotes || 'Transferring to specialist'
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Transfer response:', result);

        // อัปเดต local state
        this.setConversationStatus(
          this.selectedConversation,
          'transferred',
          this.transferNotes || 'Transferring to specialist',
          adminId,
          'normal',
          ['transferred', this.transferTo]
        );

        this.selectedConversation.assignedTo = this.transferTo;
        
        // ส่งการแจ้งเตือนผ่าน WebSocket
        this.sendWebSocketMessage({
          action: 'status_change',
          session_id: sessionId,
          status: 'transferred',
          updated_by: adminId,
          assigned_to: this.transferTo,
          timestamp: new Date().toISOString(),
          notes: this.transferNotes || 'Conversation transferred'
        });
        
        this.showToast(`โอนการสนทนาไปยัง ${this.transferTo} เรียบร้อย`, 'success');
        
        // ปิด dialog และ reset ค่า
        this.showTransferDialog = false;
        this.transferTo = '';
        this.transferNotes = '';

      } catch (error) {
        console.error('❌ Error transferring conversation:', error);
        this.showToast(`เกิดข้อผิดพลาดในการโอนการสนทนา: ${error.message}`, 'error');
      }
    },

    /**
     * ฟังก์ชันทดสอบการเปลี่ยนสถานะแบบไม่เรียก API
     */
    testStatusChange(status) {
      console.log('🧪 Testing status change to:', status);
      console.log('📍 Current conversation:', this.selectedConversation?._id);
      console.log('📋 Current status:', this.getConversationStatus(this.selectedConversation));
      
      if (!this.selectedConversation) {
        console.log('❌ No selected conversation');
        this.showToast('ไม่พบการสนทนาที่เลือก', 'error');
        return;
      }

      // อัปเดตสถานะใน local state ด้วย helper function
      const oldStatus = this.getConversationStatus(this.selectedConversation);
      this.setConversationStatus(
        this.selectedConversation, 
        status, 
        `Test status change from ${oldStatus} to ${status}`,
        'admin_test'
      );
      
      // ปิด dropdown
      this.showStatusDropdown = false;
      
      // แสดง toast
      this.showToast(`เปลี่ยนสถานะจาก "${this.getStatusText(oldStatus)}" เป็น "${this.getStatusText(status)}" แล้ว (ทดสอบ)`, 'success');
      
      console.log('✅ Status changed successfully:', {
        from: oldStatus,
        to: status,
        conversationId: this.selectedConversation._id,
        timestamp: this.selectedConversation.conversation_status.updated_at,
        updatedBy: this.selectedConversation.conversation_status.updated_by
      });
    },

    // WebSocket Methods
    /**
     * Initialize WebSocket connection
     */
    initializeWebSocket() {
      console.log('🔌 Initializing WebSocket connection...');
      this.wsConnectionStatus = 'connecting';
      
      try {
        // Connect to WebSocket
        connectWebSocket();
        
        // Register event listeners
        this.registerWebSocketEventListeners();
        
        // Check connection status periodically
        this.startWebSocketStatusCheck();
        
        this.showToast('กำลังเชื่อมต่อ WebSocket...', 'info');
        
      } catch (error) {
        console.error('❌ Failed to initialize WebSocket:', error);
        this.wsConnectionStatus = 'error';
        this.showToast('ไม่สามารถเชื่อมต่อ WebSocket ได้', 'error');
      }
    },

    /**
     * Register WebSocket event listeners
     */
    registerWebSocketEventListeners() {
      // Listen for new sessions
      const unsubscribeNewSession = onWebSocketEvent('new_session', () => {
        console.log('📨 New session event received');
        this.handleWebSocketNewSession();
      });
      this.wsEventListeners.push(unsubscribeNewSession);

      // Listen for new messages
      const unsubscribeNewMessage = onWebSocketEvent('new_message', (notification) => {
        console.log('📨 New message event received:', notification);
        this.handleWebSocketNewMessage(notification);
      });
      this.wsEventListeners.push(unsubscribeNewMessage);

      // Listen for status changes (currently not handled by WebSocket - for future use)
      const unsubscribeStatusChange = onWebSocketEvent('status_change', (notification) => {
        console.log('📨 Status change event received (ignored):', notification);
        // Currently not processing status_change events
        // this.handleWebSocketStatusChange(notification);
      });
      this.wsEventListeners.push(unsubscribeStatusChange);

      // Listen for connection confirmation (currently not handled by WebSocket - for future use)
      const unsubscribeConnected = onWebSocketEvent('connected', (notification) => {
        console.log('📨 Connection confirmed (ignored):', notification);
        // Set connection status without parsing notification content
        this.wsConnectionStatus = 'connected';
        this.showToast('เชื่อมต่อ WebSocket สำเร็จ', 'success');
      });
      this.wsEventListeners.push(unsubscribeConnected);
    },

    /**
     * Handle WebSocket new session event
     */
    handleWebSocketNewSession() {
      // Refresh conversations to show new session
      this.loadConversations(false, this.conversationLimit);
      this.showToast('มีการสนทนาใหม่!', 'info');
    },

    /**
     * Handle WebSocket new message event (trigger only - no data parsing)
     */
    handleWebSocketNewMessage(notification) {
      console.log('🔔 WebSocket new message trigger received:', notification);
      
      const { session_id } = notification;
      
      // เพียงแค่ trigger reload ไม่ต้อง parse message content
      if (this.selectedConversation && this.selectedConversation._id === session_id) {
        console.log('🔄 Reloading active conversation due to WebSocket trigger');
        this.loadConversationHistorySmooth(this.selectedConversation);
      }
      
      // ดึงข้อมูล conversations ใหม่แบบ silent เพื่ออัปเดต unread_count (with debounce)
      this.debouncedRefreshConversations();
      
      // Show notification if not in focus (generic message)
      if (document.hidden && this.selectedConversation?.sender) {
        this.showToast(`มีข้อความใหม่จาก ${this.getCustomerFullName(this.selectedConversation)}`, 'info');
      }
    },

    /**
     * Handle WebSocket status change event
     */
    handleWebSocketStatusChange(notification) {
      const { session_id, status, updated_by } = notification;
      
      // Find the conversation and update its status
      const conversation = this.conversations.find(conv => conv._id === session_id);
      if (conversation) {
        this.setConversationStatus(
          conversation,
          status,
          `Status updated remotely by ${updated_by}`,
          updated_by
        );
        
        // Show notification
        this.showToast(`สถานะการสนทนาถูกเปลี่ยนเป็น ${status} โดย ${updated_by}`, 'info');
      }
    },

    /**
     * Send message through WebSocket
     */
    sendWebSocketMessage(message) {
      const success = sendWebSocketMessage(message);
      if (!success) {
        this.showToast('ไม่สามารถส่งข้อความผ่าน WebSocket ได้', 'warning');
      }
      return success;
    },

    /**
     * Start WebSocket status monitoring
     */
    startWebSocketStatusCheck() {
      this.wsStatusInterval = setInterval(() => {
        const status = getWebSocketStatus();
        if (this.wsConnectionStatus !== status) {
          this.wsConnectionStatus = status;
          console.log('🔌 WebSocket status changed:', status);
          
          // Show status change notifications
          switch (status) {
            case 'connected':
              this.showToast('WebSocket เชื่อมต่อแล้ว', 'success');
              break;
            case 'disconnected':
              this.showToast('WebSocket ขาดการเชื่อมต่อ', 'warning');
              break;
            case 'error':
              this.showToast('WebSocket เกิดข้อผิดพลาด', 'error');
              break;
          }
        }
      }, 2000); // Check every 2 seconds
    },

    /**
     * Cleanup WebSocket connection and listeners
     */
    cleanupWebSocket() {
      console.log('🧹 Cleaning up WebSocket...');
      
      // Clear status check interval
      if (this.wsStatusInterval) {
        clearInterval(this.wsStatusInterval);
        this.wsStatusInterval = null;
      }
      
      // Unsubscribe from all event listeners
      this.wsEventListeners.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing WebSocket listener:', error);
        }
      });
      this.wsEventListeners = [];
      
      // Disconnect WebSocket
      disconnectWebSocket();
      this.wsConnectionStatus = 'disconnected';
    },

    /**
     * Reconnect WebSocket manually
     */
    reconnectWebSocket() {
      console.log('🔄 Manually reconnecting WebSocket...');
      this.cleanupWebSocket();
      setTimeout(() => {
        this.initializeWebSocket();
      }, 1000);
    }
  },
  watch: {
    conversations: {
      handler(newConversations) {
        newConversations.forEach((conversation) => {
          if (this.selectedConversation && this.selectedConversation._id !== conversation._id) {
            const lastMessage = conversation.message[conversation.message.length - 1];
            if (lastMessage && lastMessage.sender !== 'agent') {
              // unread_count มาจาก API แล้ว ไม่ต้องคำนวณใหม่
              this.updateConversationPreview(conversation);
            }
          }
        });
      },
      deep: true,
    },
    selectedConversation: {
      handler(newConversation, oldConversation) {
        if (oldConversation) {
          this.unsubscribeFromConversationChannel(oldConversation._id);
        }
        if (newConversation && newConversation._id) {
          this.subscribeToConversationChannel(newConversation._id);
        }
      },
      immediate: true,
    },
  },
};
</script>


<style scoped>
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

/* Conversation card animations */
.conversation-card {
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
}

.conversation-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease-in-out;
}

.conversation-card:hover::before {
  left: 100%;
}

.conversation-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

/* Status Dropdown */
.status-dropdown {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Chat message animations */
.chat-message {
  animation: slideInMessage 0.3s ease-out;
}

@keyframes slideInMessage {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Fullscreen mode */
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999 !important;
  background: white;
}

/* Chat bubbles */
.chat-bubble {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Emoji picker positioning */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 1000;
}

/* Mobile responsive adjustments */
@media (max-width: 1024px) {
  .sidebar-desktop {
    display: none;
  }
  
  /* Conversation list height limit on mobile */
  .conversation-list-mobile {
    max-height: 40vh;
  }
  
  /* Compact mobile conversation cards */
  .conversation-card {
    padding: 0.375rem 0.5rem;
  }
}

@media (max-width: 768px) {
  .gap-3 {
    gap: 0.375rem;
  }
  
  .p-4 {
    padding: 0.5rem;
  }
  
  .text-sm {
    font-size: 0.75rem;
  }
  
  .conversation-card {
    padding: 0.25rem 0.5rem;
  }
  
  /* Further reduce conversation list height on small screens */
  .conversation-list-mobile {
    max-height: 35vh;
  }
  
  /* Ultra compact for small screens */
  .conversation-card .avatar-ultra-small {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .conversation-card .text-ultra-small {
    font-size: 0.65rem;
    line-height: 1;
  }
}

/* Conversation list specific styles */
.conversation-list {
  height: 100%;
  max-height: 100%;
}

@media (min-width: 1024px) {
  .conversation-list {
    max-height: calc(100vh - 200px);
  }
}

/* Compact conversation cards */
.conversation-card-compact {
  padding: 0.25rem 0.5rem;
}

.conversation-card-compact .avatar-small {
  width: 1.5rem;
  height: 1.5rem;
}

.conversation-card-compact .text-compact {
  font-size: 0.7rem;
  line-height: 1.1;
}

/* Line clamp utilities */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  .customer-panel,
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

/* Customer panel slide animation */
.customer-panel-enter-active,
.customer-panel-leave-active {
  transition: transform 0.3s ease-in-out;
}

.customer-panel-enter-from,
.customer-panel-leave-to {
  transform: translateX(100%);
}

/* Notification badge pulse */
.notification-badge {
  animation: badgePulse 2s infinite;
}

@keyframes badgePulse {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 12px;
  margin: 8px 0;
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typingDot 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typingDot {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Online status indicator */
.online-indicator {
  position: relative;
}

.online-indicator::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
}

/* Message status indicators */
.message-status {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 4px;
}

.message-status.sent {
  color: #9ca3af;
}

.message-status.delivered {
  color: #3b82f6;
}

.message-status.read {
  color: #10b981;
}

/* Smooth scrolling */
.smooth-scroll {
  scroll-behavior: smooth;
}

/* Custom focus styles for better accessibility */
.custom-focus:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  border-color: #3b82f6;
}

/* Glassmorphism effect for panels */
.glass-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Floating action button */
.fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
}

.fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.6);
}

/* Skeleton loading */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Tooltip */
.tooltip {
  position: relative;
}

.tooltip::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 1000;
}

.tooltip:hover::before {
  opacity: 1;
}

/* Success/Error states */
.success-state {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.error-state {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.warning-state {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

/* Micro-interactions */
.micro-bounce:active {
  transform: scale(0.95);
}

.micro-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Progress indicators */
.progress-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}

/* Connection status */
.connection-status {
  position: fixed;
  top: 10px;
  right: 10px;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  z-index: 1000;
}

.connection-status.online {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.connection-status.offline {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.connection-status.reconnecting {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

/* Chat area specific styles */
.chat-area {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.chat-messages {
  height: 100%;
  max-height: 100%;
  overflow-y: auto;
}

/* Message container improvements */
.message-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 0.75rem;
}

.message-input-area {
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 0.75rem;
}

/* Improved scrollbar for chat */
.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Chat message animations */
.chat-message {
  animation: slideInMessage 0.3s ease-out;
}

@keyframes slideInMessage {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* New message highlight animation */
@keyframes newMessageHighlight {
  0% {
    transform: scale(1);
    background-color: #dcfce7;
    border-color: #22c55e;
  }
  50% {
    transform: scale(1.02);
    background-color: #bbf7d0;
    border-color: #16a34a;
  }
  100% {
    transform: scale(1);
    background-color: #dcfce7;
    border-color: #22c55e;
  }
}

.new-message-highlight {
  animation: newMessageHighlight 1s ease-in-out;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
}

/* Smooth message addition animation */
@keyframes slideInFromBottom {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  50% {
    opacity: 0.7;
    transform: translateY(5px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: slideInFromBottom 0.4s ease-out;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.message-leave-active {
  transition: all 0.3s ease-in;
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Fade transition for indicators */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Auto scroll to bottom */
.auto-scroll {
  scroll-behavior: smooth;
}

/* Message bubble improvements */
.message-bubble {
  max-width: 70%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Remove all max-height constraints for full screen */
.conversation-list {
  height: 100%;
  max-height: 100%;
}

/* Ensure no scrolling on main container */
.h-screen {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

/* Compact mobile styles */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }
  
  .conversation-card {
    padding: 0.375rem 0.5rem;
  }
  
  .stats-card {
    padding: 0.375rem 0.5rem;
  }
}

/* Support container with dynamic height calculation */
.support-container {
  height: calc(100vh - var(--header-height, 64px));
  max-height: calc(100vh - var(--header-height, 64px));
  overflow: hidden;
}

/* Responsive header heights */
@media (min-width: 1024px) {
  .support-container {
    height: calc(100vh - var(--header-height, 80px));
    max-height: calc(100vh - var(--header-height, 80px));
  }
}

@media (max-width: 768px) {
  .support-container {
    height: calc(100vh - var(--header-height, 56px));
    max-height: calc(100vh - var(--header-height, 56px));
  }
}

/* Alternative fixed heights for common header sizes */
.support-container.with-topbar {
  height: calc(100vh - 120px); /* Header + Topbar */
  max-height: calc(100vh - 120px);
}

.support-container.with-breadcrumb {
  height: calc(100vh - 140px); /* Header + Breadcrumb */
  max-height: calc(100vh - 140px);
}

.support-container.full-admin {
  height: calc(100vh - 160px); /* Full admin layout */
  max-height: calc(100vh - 160px);
}

/* Chat area specific styles */
.chat-area {
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}

/* Mode Toggle Switch Styles */
.mode-toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-toggle-switch:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.mode-toggle-switch:active {
  transform: scale(0.98);
}

/* Mode Icon Styles */
.mode-icon-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.mode-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mode-icon.ai-mode {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #16a34a;
  border: 2px solid #22c55e;
}

.mode-icon.manual-mode {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #6b7280;
  border: 2px solid #9ca3af;
}

.mode-icon:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Toggle Switch Improvements */
.toggle-switch-modern {
  position: relative;
  background: transparent;
  border: 2px solid;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-switch-modern.active {
  border-color: #22c55e;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.3);
  animation: pulse-green 2s infinite;
}

.toggle-switch-modern.inactive {
  border-color: #d1d5db;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.toggle-circle-modern {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

/* Toggle Labels */
.toggle-labels {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  pointer-events: none;
  z-index: 0;
}

.toggle-label {
  transition: all 0.2s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Animations */
@keyframes pulse-green {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
  }
}

@keyframes mode-change {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.mode-change-animation {
  animation: mode-change 0.3s ease-in-out;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .mode-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .mode-icon i {
    font-size: 0.625rem;
  }
  
  .toggle-switch-modern {
    height: 1.25rem;
    width: 2.25rem;
  }
  
  .toggle-circle-modern {
    height: 0.875rem;
    width: 0.875rem;
  }
  
  .toggle-labels {
    padding: 0 0.125rem;
    font-size: 0.5rem;
  }
}

/* Toast Notification Styles */
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toast {
  pointer-events: auto;
  min-width: 320px;
  max-width: 400px;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-show {
  transform: translateX(0) scale(1);
  opacity: 1;
}

.toast-hide {
  transform: translateX(120%) scale(0.95);
  opacity: 0;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  gap: 0.75rem;
}

.toast-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-bottom: 0.25rem;
}

.toast-message {
  font-size: 0.875rem;
  line-height: 1.5rem;
  opacity: 0.9;
}

.toast-close {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
  opacity: 0.6;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.1);
  opacity: 1;
}

.toast-progress {
  height: 0.25rem;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  transition: width 0.1s linear;
  border-radius: 0 0 0.75rem 0.75rem;
}

/* Toast Type Styles */
.toast-success {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-left: 4px solid #22c55e;
}

.toast-success .toast-icon {
  background: #22c55e;
  color: white;
}

.toast-success .toast-title {
  color: #166534;
}

.toast-success .toast-message {
  color: #15803d;
}

.toast-success .toast-close {
  color: #166534;
}

.toast-progress-success {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}

.toast-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-left: 4px solid #ef4444;
}

.toast-error .toast-icon {
  background: #ef4444;
  color: white;
}

.toast-error .toast-title {
  color: #991b1b;
}

.toast-error .toast-message {
  color: #dc2626;
}

.toast-error .toast-close {
  color: #991b1b;
}

.toast-progress-error {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.toast-warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-left: 4px solid #f59e0b;
}

.toast-warning .toast-icon {
  background: #f59e0b;
  color: white;
}

.toast-warning .toast-title {
  color: #92400e;
}

.toast-warning .toast-message {
  color: #d97706;
}

.toast-warning .toast-close {
  color: #92400e;
}

.toast-progress-warning {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.toast-info {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 4px solid #3b82f6;
}

.toast-info .toast-icon {
  background: #3b82f6;
  color: white;
}

.toast-info .toast-title {
  color: #1e40af;
}

.toast-info .toast-message {
  color: #2563eb;
}

.toast-info .toast-close {
  color: #1e40af;
}

.toast-progress-info {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

/* Toast Animations */
@keyframes toast-slide-in {
  from {
    transform: translateX(100%) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes toast-slide-out {
  from {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateX(100%) scale(0.9);
    opacity: 0;
  }
}

.toast-show {
  animation: toast-slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .toast-container {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }
  
  .toast {
    min-width: auto;
    max-width: none;
    width: 100%;
  }
  
  .toast-content {
    padding: 0.875rem;
    gap: 0.625rem;
  }
  
  .toast-icon {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.8125rem;
  }
  
  .toast-title {
    font-size: 0.8125rem;
  }
  
  .toast-message {
    font-size: 0.8125rem;
  }
}

/* Hover Effects */
.toast:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.toast:hover .toast-progress-bar {
  animation-play-state: paused;
}

/* Focus States */
.toast-close:focus {
  outline: 2px solid currentColor;
  outline-offset: 1px;
}

/* Responsive Mode Toggle */
@media (max-width: 768px) {
  .toggle-switch-container {
    padding: 0.125rem;
  }
  
  .toggle-button {
    padding: 0.25rem 0.5rem;
    font-size: 0.6875rem;
    gap: 0.25rem;
  }
  
  .toggle-indicator {
    width: 0.375rem;
    height: 0.375rem;
  }
  
  .toast {
    max-width: 20rem;
    margin: 0 1rem 0.5rem 1rem;
  }
}

/* Transition animations for smooth conversations list updates */
.conversation-list-enter-active,
.conversation-list-leave-active {
  transition: all 0.3s ease-in-out;
}

.conversation-list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.conversation-list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.conversation-list-move {
  transition: transform 0.3s ease-in-out;
}

/* Smooth transitions for message loading */
.loading-history-transition-enter-active,
.loading-history-transition-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.loading-history-transition-enter-from,
.loading-history-transition-leave-to {
  opacity: 0;
}

/* Smooth scrolling for chat window */
.chat-window {
  scroll-behavior: smooth;
}

/* Prevent layout shift during updates */
.conversation-card {
  min-height: 72px; /* Fixed height to prevent layout shift */
}

/* Smooth unread count changes */
.unread-badge {
  transition: all 0.2s ease-in-out;
}

.unread-badge-enter-active,
.unread-badge-leave-active {
  transition: all 0.2s ease-in-out;
}

.unread-badge-enter-from,
.unread-badge-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/* Conversation item smooth updates */
.conversation-card {
  transition: all 0.2s ease-in-out;
}

.conversation-card:hover {
  transform: translateX(2px);
}

/* Unread badge enhanced transitions */
.unread-badge {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.8);
  }
}

/* Message list transitions */
.message-list-enter-active,
.message-list-leave-active {
  transition: all 0.3s ease-in-out;
}

.message-list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.message-list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.message-list-move {
  transition: transform 0.3s ease-in-out;
}

/* No messages transition */
.no-messages-transition-enter-active,
.no-messages-transition-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.no-messages-transition-enter-from,
.no-messages-transition-leave-to {
  opacity: 0;
}

/* Customer Panel Mobile Optimization */
@media (max-width: 1024px) {
  .customer-panel-mobile {
    position: fixed !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100vh !important;
    z-index: 60 !important;
    background: white !important;
  }
  
  .customer-panel-header-mobile {
    position: sticky;
    top: 0;
    z-index: 61;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .customer-panel-content-mobile {
    height: calc(100vh - 60px);
    overflow-y: auto;
  }
}

/* Customer Panel Desktop Styles */
@media (min-width: 1024px) {
  .customer-panel-desktop {
    width: 320px !important;
    height: 100vh !important;
    z-index: 40 !important;
  }
}

/* Mobile Tools Sub Panel */
.mobile-tools-panel {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mobile-tools-panel .ai-mode-indicator {
  transition: all 0.3s ease;
}

.mobile-tools-panel .ai-mode-indicator:hover {
  transform: scale(1.05);
}

.mobile-tools-panel .toggle-switch {
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.mobile-tools-panel .quick-action-btn {
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mobile-tools-panel .quick-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.mobile-tools-panel .status-badge {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border: 1px solid currentColor;
}

/* Mobile Tools Panel Animation */
.mobile-tools-enter-active,
.mobile-tools-leave-active {
  transition: all 0.3s ease;
}

.mobile-tools-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.mobile-tools-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Enhanced Mobile Toggle Switch */
@media (max-width: 1024px) {
  .mobile-tools-panel .toggle-switch {
    position: relative;
    background: transparent;
    border: 2px solid;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .mobile-tools-panel .toggle-switch.active {
    border-color: #22c55e;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.3);
    animation: pulse-green 2s infinite;
  }
  
  .mobile-tools-panel .toggle-switch.inactive {
    border-color: #d1d5db;
    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  }
}

@keyframes pulse-green {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
  }
}

/* Customer Edit Form Styles */
.customer-edit-form {
  animation: fadeIn 0.3s ease-in-out;
  position: relative;
  z-index: 10;
}

.customer-edit-form input,
.customer-edit-form textarea {
  transition: all 0.2s ease;
  border: 1px solid #d1d5db;
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

.customer-edit-form input:focus,
.customer-edit-form textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
  outline: none;
  z-index: 20;
}

.customer-edit-form input:hover,
.customer-edit-form textarea:hover {
  border-color: #9ca3af;
}

.customer-edit-actions {
  animation: slideInRight 0.3s ease-out;
  position: relative;
  z-index: 10;
}

.customer-edit-btn {
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  z-index: 10;
  pointer-events: auto;
}

.customer-edit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.customer-edit-btn:active {
  transform: translateY(0);
}

/* Edit button animations */
.customer-edit-btn.save-btn:hover {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.customer-edit-btn.cancel-btn:hover {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

/* Fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Slide in animation */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Overlay should not interfere with panel interactions */
.customer-panel-overlay {
  pointer-events: auto;
}

/* Customer panel should have higher z-index than overlay */
.customer-panel-mobile,
.customer-panel-desktop {
  z-index: 70 !important;
  pointer-events: auto;
}

.customer-panel-mobile .customer-panel-content-mobile,
.customer-panel-desktop .customer-panel-content-mobile {
  position: relative;
  z-index: 80;
  pointer-events: auto;
}

/* Ensure overlay doesn't interfere with panel content */
.customer-panel-mobile *,
.customer-panel-desktop * {
  position: relative;
  z-index: inherit;
}

/* Customer panel specific z-index fix */
.customer-panel-content-mobile {
  position: relative;
  z-index: 10;
}

.customer-panel-content-mobile * {
  pointer-events: auto;
}

/* Ensure inputs are always clickable and focusable */
.customer-edit-form input,
.customer-edit-form textarea,
.customer-edit-form button {
  pointer-events: auto !important;
  position: relative;
  z-index: 15;
}

/* Field highlight effect with proper z-index */
.customer-field-highlight {
  position: relative;
  z-index: 10;
}

.customer-field-highlight::before {
  content: '';
  position: absolute;
  top: 0;
  left: -8px;
  right: -8px;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent);
  border-radius: 6px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  pointer-events: none;
}

.customer-field-highlight:hover::before {
  opacity: 1;
}

/* Validation feedback */
.field-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.field-success {
  border-color: #22c55e !important;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1) !important;
}
</style>
