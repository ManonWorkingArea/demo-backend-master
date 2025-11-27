<template>
  <div class="bg-gray-50 flex ticket-container" 
       :class="[
         headerType && `with-${headerType}`,
         customClass
       ]"
       >
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
          <h1 class="text-lg font-semibold text-gray-900">ระบบตั๋ว</h1>
          <button 
            @click="makeSupportRequest" 
            class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
            title="เพิ่มตั๋วใหม่"
          >
            <i class="fas fa-plus text-sm"></i>
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">สถิติรวม</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-sm text-gray-700">ตั๋วทั้งหมด</span>
              </div>
              <span class="text-sm font-semibold text-blue-600">{{ tickets.length }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-700">ใหม่</span>
              </div>
              <span class="text-sm font-semibold text-green-600">{{ ticketCounts.new }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span class="text-sm text-gray-700">กำลังดำเนินการ</span>
              </div>
              <span class="text-sm font-semibold text-yellow-600">{{ ticketCounts.process }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-red-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                <span class="text-sm text-gray-700">ปิดแล้ว</span>
              </div>
              <span class="text-sm font-semibold text-red-600">{{ ticketCounts.close }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">เมนู</h3>
          <nav class="space-y-1">
            <button 
              v-for="status in sidebarMenuItems" 
              :key="status.value"
              @click="selectTab(status.value)" 
              class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 sidebar-menu-item"
              :class="{ 
                'bg-blue-100 text-blue-700 font-medium active': selectedTab === status.value,
                'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedTab !== status.value
              }"
            >
              <i :class="status.icon" class="text-sm w-4"></i>
              <span class="flex-1 text-left">{{ status.label }}</span>
              <span 
                v-if="ticketCounts[status.value] > 0" 
                class="px-2 py-1 text-xs rounded-full status-badge"
                :class="{ 
                  'bg-blue-200 text-blue-800': selectedTab === status.value,
                  'bg-gray-200 text-gray-600': selectedTab !== status.value
                }"
              >
                {{ ticketCounts[status.value] }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Quick Actions -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการ</h3>
          <div class="space-y-2">
            <button 
              @click="makeSupportRequest"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-plus text-sm w-4"></i>
              <span>เพิ่มตั๋วใหม่</span>
            </button>
            <button 
              @click="refreshTickets"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-sync-alt text-sm w-4"></i>
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        <!-- User Info -->
        <div class="mt-auto px-4 py-4 flex-shrink-0">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
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
          <h1 class="text-lg font-semibold text-gray-900">ระบบตั๋ว</h1>
          <button 
            @click="toggleMobileSidebar" 
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>

      <!-- Header Section -->
      <div class="bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <!-- Search Input -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                @input="filterTickets" 
                placeholder="ค้นหาตั๋ว..." 
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <!-- Add Ticket Button (Mobile) -->
          <button 
            @click="makeSupportRequest" 
            class="lg:hidden bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <i class="fas fa-plus text-xs"></i>
            เพิ่มตั๋ว
          </button>
        </div>
      </div>

      <!-- Tabs Section (Mobile) -->
      <div class="lg:hidden bg-white border-b border-gray-200">
        <div class="px-4 py-2">
          <select 
            v-model="selectedTab" 
            @change="selectTab(selectedTab)"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option 
              v-for="status in ['all', 'new', 'open', 'process', 'close']" 
              :key="status" 
              :value="status"
            >
              {{ getStatusLabel(status) }} ({{ ticketCounts[status] || 0 }})
            </option>
          </select>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-4">
        <!-- Ticket List -->
        <div v-if="!selectedTicket" class="h-full">
          <!-- Current Filter Info -->
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold text-gray-900">
                {{ getStatusLabel(selectedTab) }}
              </h2>
              <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {{ filteredTickets.length }} รายการ
              </span>
            </div>
          </div>

          <!-- Tickets Grid -->
          <div class="h-full space-y-3">
            <div 
              v-for="ticket in filteredTickets" 
              :key="ticket._id" 
              class="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer ticket-card"
              @click="selectTicket(ticket)"
            >
              <div class="flex items-start gap-3">
                <!-- Pin Icon -->
                <button @click.stop="pinTicket(ticket)" class="mt-1">
                  <i :class="ticket.pinned ? 'fas fa-thumbtack text-blue-600' : 'fas fa-thumbtack text-gray-300'" class="text-sm"></i>
                </button>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-gray-900 text-sm truncate">{{ ticket.title }}</h3>
                      <p class="text-gray-600 text-xs mt-1 line-clamp-2">{{ ticket.content }}</p>
                    </div>
                    
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span class="text-xs text-gray-500">{{ ticket.date }}</span>
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded-full status-badge"
                        :class="getStatusClass(ticket.status)"
                      >
                        {{ getStatusLabel(ticket.status) }}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center gap-3 text-xs text-gray-500">
                      <span class="flex items-center gap-1">
                        <i class="fas fa-comments"></i>
                        {{ ticket.comments ? ticket.comments.length : 0 }}
                      </span>
                      <span 
                        class="px-2 py-1 rounded-full text-xs status-badge"
                        :class="getLevelClass(ticket.level)"
                      >
                        {{ getLevelLabel(ticket.level) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredTickets.length === 0" class="text-center py-12">
              <i class="fas fa-ticket-alt text-gray-300 text-4xl mb-4"></i>
              <p class="text-gray-500">ไม่พบตั๋วที่ตรงกับการค้นหา</p>
            </div>
          </div>
        </div>

        <!-- Ticket Detail -->
        <div v-if="selectedTicket" class="h-full flex flex-col">
          <div class="bg-white border border-gray-200 rounded-lg flex-1 flex flex-col">
            <!-- Header -->
            <div class="border-b border-gray-200 p-4 flex-shrink-0">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-3 flex-1 min-w-0">
                  <button @click="pinTicket(selectedTicket)" class="mt-1">
                    <i :class="selectedTicket.pinned ? 'fas fa-thumbtack text-blue-600' : 'fas fa-thumbtack text-gray-300'"></i>
                  </button>
                  <div class="flex-1 min-w-0">
                    <h1 class="text-lg font-semibold text-gray-900">{{ selectedTicket.title }}</h1>
                    <div class="flex items-center gap-2 mt-2">
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded-full status-badge"
                        :class="getStatusClass(selectedTicket.status)"
                      >
                        {{ getStatusLabel(selectedTicket.status) }}
                      </span>
                      <span 
                        class="px-2 py-1 text-xs rounded-full status-badge"
                        :class="getLevelClass(selectedTicket.level)"
                      >
                        {{ getLevelLabel(selectedTicket.level) }}
                      </span>
                      <span class="text-xs text-gray-500">{{ selectedTicket.date }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                  <button 
                    v-if="selectedTicket.status !== 'close'" 
                    @click="closeTicket(selectedTicket)"
                    class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                  >
                    ปิดเคส
                  </button>
                  <button 
                    @click="deleteTicket(selectedTicket._id)"
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                  <button 
                    @click="closeDetail"
                    class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                  >
                    กลับ
                  </button>
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="p-4 flex-shrink-0">
              <p class="text-gray-700 text-sm leading-relaxed">{{ selectedTicket.content }}</p>
            </div>

            <!-- Comments -->
            <div class="border-t border-gray-200 p-4 flex-1 flex flex-col">
              <h3 class="font-medium text-gray-900 mb-3">ความคิดเห็น</h3>
              
              <div class="flex-1 space-y-3 mb-4">
                <div 
                  v-for="comment in selectedTicket.comments" 
                  :key="comment.id"
                  class="flex gap-3"
                >
                  <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-user text-gray-500 text-xs"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="bg-gray-50 rounded-lg p-3">
                      <div class="flex items-center justify-between mb-1">
                        <span class="font-medium text-gray-900 text-sm">{{ comment.user }}</span>
                        <span class="text-xs text-gray-500">3 ชั่วโมงที่แล้ว</span>
                      </div>
                      <p class="text-gray-700 text-sm">{{ comment.text }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add Comment -->
              <div class="border-t border-gray-200 pt-4 flex-shrink-0">
                <textarea 
                  v-model="newCommentText" 
                  placeholder="เพิ่มความคิดเห็น..." 
                  class="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                ></textarea>
                <div class="flex justify-end mt-2">
                  <button 
                    @click="addComment"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    ส่งความคิดเห็น
                  </button>
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
            <h1 class="text-lg font-semibold text-gray-900">ระบบตั๋ว</h1>
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
              <div class="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">ตั๋วทั้งหมด</span>
                </div>
                <span class="text-sm font-semibold text-blue-600">{{ tickets.length }}</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">ใหม่</span>
                </div>
                <span class="text-sm font-semibold text-green-600">{{ ticketCounts.new }}</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">กำลังดำเนินการ</span>
                </div>
                <span class="text-sm font-semibold text-yellow-600">{{ ticketCounts.process }}</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">ปิดแล้ว</span>
                </div>
                <span class="text-sm font-semibold text-red-600">{{ ticketCounts.close }}</span>
              </div>
            </div>
          </div>

          <!-- Navigation Menu -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">เมนู</h3>
            <nav class="space-y-1">
              <button 
                v-for="status in sidebarMenuItems" 
                :key="status.value"
                @click="selectTabAndCloseMobile(status.value)" 
                class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
                :class="{ 
                  'bg-blue-100 text-blue-700 font-medium': selectedTab === status.value,
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedTab !== status.value
                }"
              >
                <i :class="status.icon" class="text-sm w-4"></i>
                <span class="flex-1 text-left">{{ status.label }}</span>
                <span 
                  v-if="ticketCounts[status.value] > 0" 
                  class="px-2 py-1 text-xs rounded-full"
                  :class="{ 
                    'bg-blue-200 text-blue-800': selectedTab === status.value,
                    'bg-gray-200 text-gray-600': selectedTab !== status.value
                  }"
                >
                  {{ ticketCounts[status.value] }}
                </span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Ticket Modal -->
    <div v-if="showAddTicketPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg w-full max-w-md">
        <div class="border-b border-gray-200 p-4">
          <h2 class="text-lg font-semibold text-gray-900">เพิ่มตั๋วใหม่</h2>
        </div>
        
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">หัวข้อ</label>
            <input 
              v-model="newTicket.subject" 
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="หัวข้อตั๋ว"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
            <textarea 
              v-model="newTicket.message" 
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="4"
              placeholder="รายละเอียดปัญหา"
            ></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select 
                v-model="newTicket.status" 
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">ใหม่</option>
                <option value="open">เปิด</option>
                <option value="process">กำลังดำเนินการ</option>
                <option value="close">ปิด</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ระดับความสำคัญ</label>
              <select 
                v-model="newTicket.level" 
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">ต่ำ</option>
                <option value="mid">กลาง</option>
                <option value="hi">สูง</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-200 p-4 flex justify-end gap-2">
          <button 
            @click="closeAddTicketPopup"
            class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            @click="addNewTicket"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            เพิ่มตั๋ว
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';

const Request = new requestClient(false);

export default {
  components: {
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
      loader: false,
      title: 'Ticket Management',
      navigationData: [
        {
          name: 'Add Ticket',
          function: 'callFunction',
          style: 'plus',
          class: 'primary-btn',
          visible: true,
          type: 'call-function',
        },
      ],
      tickets: [],
      filteredTickets: [],
      selectedTicket: null,
      selectedStatus: '', // State for the selected status filter
      editingTicket: null,
      showAddTicketPopup: false,
      newTicket: {
        subject: '',
        message: '',
        status: 'new',
        level: 'low',
        image: null,
      },
      newCommentText: '', // For new comment input
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      tabs: [
        { codeName: 'e_learning', name: 'E-Learning', componentName: 'Component4', icon: 'list', subText: 'หลักสูตร E-Learning' },
        { codeName: 'onsite', name: 'On-site', componentName: 'Component1', icon: 'file-alt', subText: 'หลักสูตร On-site' },
        { codeName: 'online_course', name: 'On-line', componentName: 'Component2', icon: 'pencil-ruler', subText: 'หลักสูตร On-line' }
      ],
      selectedTab: '',
      searchQuery: '', // สำหรับการค้นหา
      showMobileSidebar: false,
      sidebarMenuItems: [
        { value: 'all', label: 'ทั้งหมด', icon: 'fas fa-list' },
        { value: 'new', label: 'ใหม่', icon: 'fas fa-plus-circle' },
        { value: 'open', label: 'เปิด', icon: 'fas fa-folder-open' },
        { value: 'process', label: 'กำลังดำเนินการ', icon: 'fas fa-spinner' },
        { value: 'close', label: 'ปิด', icon: 'fas fa-check-circle' }
      ],
    };
  },
  computed: {
    ticketCounts() {
      return {
        all: this.tickets.length,
        new: this.tickets.filter(ticket => ticket.status === 'new').length,
        open: this.tickets.filter(ticket => ticket.status === 'open').length,
        process: this.tickets.filter(ticket => ticket.status === 'process').length,
        close: this.tickets.filter(ticket => ticket.status === 'close').length,
      };
    },
  },
  methods: {
    selectTab(code) {
      this.selectedTab = code;
      this.filterTickets();
      this.selectedTicket = null;
      this.closeDetail();
    },
    async fetchTickets() {
      try {
        const response = await Request.POST('tickets/query', {
          method: 'find',
          args: [{ $and: [{ unit: this.session.current._id }] }]
        }, this.configs.key);

        if (response.status === 200) {
          this.tickets = response.data;
          this.tickets = this.sortTickets(this.tickets); // Sort tickets after fetching
          this.filterTickets(); // Call filter after fetching
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    },
    sortTickets(tickets) {
      return tickets.sort((a, b) => {
        // Sort by pinned status first, then by status
        const statusOrder = { new: 1, open: 2, process: 3, close: 4 };
        if (a.pinned === b.pinned) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return a.pinned ? -1 : 1; // Pinned tickets come first
      });
    },
    selectTicket(ticket) {
      this.selectedTicket = ticket;
      this.updateUrlItemParam(ticket._id); // Update URL with selected ticket ID
      this.logAction(ticket, `Selected ticket: ${ticket.title}`); // Log action
    },
    closeDetail() {
      this.selectedTicket = null; // Clear selected ticket
      this.removeUrlItemParam(); // Remove URL parameter
    },
    async updateTicketStatus(ticket) {
      try {
        const response = await Request.PUT(`tickets/${ticket._id}`, {
          data: {
            status: ticket.status,
            pinned: ticket.pinned, // Include pinned status in the update
          },
        }, this.configs.key);
        if (response.status === 200) {
          this.fetchTickets(); // Refresh the ticket list after updating status
          this.logAction(ticket, `Change status: ${ticket.status}, pinned: ${ticket.pinned}`); // Log action
        }
      } catch (error) {
        console.error('Error updating ticket status:', error);
      }
    },
    startAddingTicket() {
      this.showAddTicketPopup = true;
      this.newTicket = { subject: '', message: '', status: 'new', level: 'low', image: null };
    },
    closeAddTicketPopup() {
      this.showAddTicketPopup = false;
    },
    onImageSelected(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.newTicket.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    async addNewTicket() {
      try {
        const response = await Request.POST('tickets/', {
          data: {
            title: this.newTicket.subject,
            content: this.newTicket.message,
            status: this.newTicket.status,
            level: this.newTicket.level,
            date: new Date().toLocaleDateString(),
            unit: this.session.current._id,
            image: this.newTicket.image,
            logs: [], // Initialize logs for new ticket
          },
        }, this.configs.key);
        if (response.status === 200) {
          this.tickets.push(response.data);
          this.closeAddTicketPopup();
          this.filterTickets(); // Refresh the filtered ticket list
          this.logAction(response.data, 'Add Ticket'); // Log action
        }
      } catch (error) {
        console.error('Error adding new ticket:', error);
      }
    },
    async deleteTicket(ticketId) {
      try {
        const response = await Request.DELETE(`tickets/${ticketId}`, {}, this.configs.key);
        if (response.status === 200) {
          this.tickets = this.tickets.filter(ticket => ticket._id !== ticketId);
          this.selectedTicket = null;
          this.closeDetail();
          this.fetchTickets(); // เรียก fetchTickets อีกครั้งหลังจากลบตั๋ว
        }
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    },
    async addComment() {
      if (this.newCommentText.trim() === '') return; // Prevent empty comments
      const comment = {
        id: Date.now(), // Simple ID generation
        user: 'User', // Replace with actual user data
        text: this.newCommentText,
        replies: [],
      };
      if (!this.selectedTicket.comments) {
        this.selectedTicket.comments = []; // Initialize comments if undefined
      }
      this.selectedTicket.comments.push(comment); // Add the new comment
      this.newCommentText = ''; // Clear the input
      // Update ticket data in API
      await this.updateTicketContent(this.selectedTicket);

      // Change status to 'process' if it's the first comment
      if (this.selectedTicket.comments.length === 1) {
        this.selectedTicket.status = 'process'; // Change status to 'process'
        await this.updateTicketStatus(this.selectedTicket); // Update ticket status in API
        this.logAction(this.selectedTicket, 'Add first comment'); // Log action
      }
      this.logAction(this.selectedTicket, 'Add comment'); // Log action for every comment added
    },
    toggleReply(comment) {
      comment.showReply = !comment.showReply; // Toggle the reply textarea
      if (!comment.replyText) {
        comment.replyText = ''; // Initialize reply text if undefined
      }
    },
    async addReply(comment) {
      if (comment.replyText.trim() === '') return; // Prevent empty replies
      const reply = {
        id: Date.now(), // Simple ID generation
        user: 'User', // Replace with actual user data
        text: comment.replyText,
      };
      if (!comment.replies) {
        comment.replies = []; // Initialize replies if undefined
      }
      comment.replies.push(reply); // Add the reply to the comment
      comment.replyText = ''; // Clear the reply input
      comment.showReply = false; // Hide the reply textarea after submission

      // Update ticket data in API
      await this.updateTicketContent(this.selectedTicket);
    },
    checkUrlForItem() {
      const urlParams = new URLSearchParams(window.location.search);
      const itemId = urlParams.get('item');
      if (itemId) {
        const ticketToEdit = this.tickets.find(ticket => ticket._id === itemId);
        if (ticketToEdit) {
          this.selectTicket(ticketToEdit);
        }
      }
    },
    updateUrlItemParam(ticketId = '') {
      const url = new URL(window.location);
      if (ticketId) {
        url.searchParams.set('item', ticketId);
      } else {
        url.searchParams.set('item', 'new');
      }
      window.history.pushState({}, '', url);
    },
    removeUrlItemParam() {
      const url = new URL(window.location);
      url.searchParams.delete('item');
      window.history.pushState({}, '', url);
      this.fetchTickets();
    },
    async pinTicket(ticket) {
      ticket.pinned = !ticket.pinned; // Toggle the pinned status
      await this.updateTicketStatus(ticket); // Update the ticket status in API
      this.fetchTickets(); // Refresh the ticket list after pinning
    },
    shareTicket() {
      // Logic to share the ticket, you can modify according to your needs.
    },
    editTicket(ticket) {
      this.startEditingTicket(ticket);
    },
    autoResizeTextarea() {
      const textarea = this.$refs.textarea;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    },
    filterTickets() {
      console.log("Filtering tickets for tab:", this.selectedTab);
      console.log("Search Query:", this.searchQuery);

      this.filteredTickets = this.tickets.filter(ticket => {
        const matchesStatus = this.selectedTab === 'all' || ticket.status === this.selectedTab;
        const matchesSearch = this.searchQuery
          ? ticket.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            ticket.content.toLowerCase().includes(this.searchQuery.toLowerCase())
          : true;

        return matchesStatus && matchesSearch;
      });

      console.log("Filtered tickets:", this.filteredTickets);
    },
    makeSupportRequest() {
      // ฟังก์ชันสำหรับสร้างคำขอสนับสนุนใหม่
      this.startAddingTicket();
    },
    async updateTicketContent(ticket) {
      try {
        const response = await Request.PUT(`tickets/${ticket._id}`, {
          data: {
            comments: ticket.comments,
            status: ticket.status,
            image: ticket.image,
            logs: ticket.logs, // Include logs in the update
          },
        }, this.configs.key);
        if (response.status === 200) {
          this.fetchTickets(); // Refresh the ticket list after updating content
        }
      } catch (error) {
        console.error('Error updating ticket content:', error);
      }
    },
    logAction(ticket, action) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: action,
      };
      if (!ticket.logs) {
        ticket.logs = []; // Initialize logs if undefined
      }
      ticket.logs.push(logEntry); // Add the new log entry

      // Update the ticket in the API to save the logs
      this.updateTicketContent(ticket);
    },
    closeTicket(ticket) {
      ticket.status = 'close'; // เปลี่ยนสถานะเป็น "ปิด"
      this.updateTicketStatus(ticket); // อัปเดตข้อมูลตั๋วใน API
      this.logAction(ticket, 'Close ticket'); // Log action
    },
    getStatusLabel(status) {
      const statusLabels = {
        new: 'ใหม่',
        open: 'เปิด',
        process: 'กำลังดำเนินการ',
        close: 'ปิด',
      };
      return statusLabels[status] || status;
    },
    getStatusClass(status) {
      const statusClasses = {
        new: 'bg-green-100 text-green-800',
        open: 'bg-yellow-100 text-yellow-800',
        process: 'bg-blue-100 text-blue-800',
        close: 'bg-red-100 text-red-800',
      };
      return statusClasses[status] || '';
    },
    getLevelLabel(level) {
      const levelLabels = {
        low: 'ต่ำ',
        mid: 'กลาง',
        hi: 'สูง',
      };
      return levelLabels[level] || level;
    },
    getLevelClass(level) {
      const levelClasses = {
        low: 'bg-green-100 text-green-800',
        mid: 'bg-yellow-100 text-yellow-800',
        hi: 'bg-red-100 text-red-800',
      };
      return levelClasses[level] || '';
    },
    toggleMobileSidebar() {
      this.showMobileSidebar = !this.showMobileSidebar;
    },
    selectTabAndCloseMobile(code) {
      this.selectTab(code);
      this.toggleMobileSidebar();
    },
    refreshTickets() {
      this.fetchTickets();
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
      
      // ตรวจสอบว่า component element พร้อมแล้วหรือไม่
      if (!this.$el || typeof this.$el.getBoundingClientRect !== 'function') {
        console.log('Ticket Component: Element not ready yet, using default height');
        const defaultHeight = window.innerWidth <= 768 ? 56 : 80;
        document.documentElement.style.setProperty('--header-height', `${defaultHeight}px`);
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
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (element && this.isElementAbove(element)) {
              headerHeight += element.offsetHeight;
            }
          });
        } catch (error) {
          console.warn(`Error checking element with selector ${selector}:`, error);
        }
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
            // ใช้ค่า default ที่เหมาะสม หรืออาจจะคำนวณจาก topbar ของระบบถ้ามี
            headerHeight = window.innerWidth <= 768 ? 56 : 80; // Default fallback
        }
      }
      
      // เพิ่ม padding เล็กน้อยเพื่อความปลอดภัย
      headerHeight += 8;
      
      // ตั้งค่า CSS variable
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      
      // Log สำหรับ debug
      console.log(`Ticket Component: Calculated header height = ${headerHeight}px`);
    },
    
    isElementAbove(element) {
      if (!element || !this.$el || typeof this.$el.getBoundingClientRect !== 'function') {
        return false;
      }
      try {
        const elementRect = element.getBoundingClientRect();
        const listRect = this.$el.getBoundingClientRect();
        return elementRect.bottom <= listRect.top;
      } catch (error) {
        console.warn('Error in isElementAbove (Ticket):', error);
        return false;
      }
    },
  },
  mounted() {
    this.fetchTickets();
    // Calculate header height for dynamic layout after DOM is ready
    this.$nextTick(() => {
      // รอให้ DOM พร้อมอย่างสมบูรณ์ก่อนคำนวณ header height
      setTimeout(() => {
        if (this.$el && typeof this.$el.getBoundingClientRect === 'function') {
          this.calculateHeaderHeight();
          window.addEventListener('resize', this.calculateHeaderHeight);
        } else {
          console.warn('Ticket DOM element not ready, skipping header height calculation');
          const defaultHeight = window.innerWidth <= 768 ? 56 : 80;
          document.documentElement.style.setProperty('--header-height', `${defaultHeight}px`);
        }
      }, 100); // Delayเล็กน้อยเพื่อให้ DOM render สมบูรณ์
    });

    this.$nextTick(() => {
        // Check if the URL has a hash for the tab
        if (window.location.hash === '#open') {
            this.selectTab('open'); // Call selectTab to filter by 'open'
        } else {
            this.selectTab('all'); // Default to 'all' if no hash
        }
        if (this.$refs.textarea) {
            //this.autoResizeTextarea();
        }
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateHeaderHeight);
  },
};
</script>

<style scoped>
/* Ticket container with dynamic height calculation */
.ticket-container {
  height: calc(100vh - var(--header-height, 80px)); /* Default to 80px if not set, adjust as needed */
  max-height: calc(100vh - var(--header-height, 80px));
  /* overflow: hidden; REMOVED by class change */
}

/* Responsive header heights - these might become redundant if --header-height is always calculated correctly */
/* It's better to rely on the JS calculation for --header-height */
@media (min-width: 1024px) { 
  /* .ticket-container { ... } */ 
}

@media (max-width: 768px) { 
  /* .ticket-container { ... } */
}

/* Alternative fixed heights - these are likely no longer needed if --header-height is set */
/* .ticket-container.with-topbar { ... } */
/* .ticket-container.with-breadcrumb { ... } */
/* .ticket-container.with-full-admin { ... } */

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar - REMOVING */
/* .overflow-y-auto::-webkit-scrollbar { ... } */
/* .overflow-y-auto::-webkit-scrollbar-track { ... } */
/* .overflow-y-auto::-webkit-scrollbar-thumb { ... } */
/* .overflow-y-auto::-webkit-scrollbar-thumb:hover { ... } */

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

/* Ticket card animations */
.ticket-card {
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
}

.ticket-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease-in-out;
}

.ticket-card:hover::before {
  left: 100%;
}

.ticket-card:hover {
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
