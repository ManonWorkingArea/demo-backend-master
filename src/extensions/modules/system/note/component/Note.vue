<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h1 class="text-lg font-semibold text-gray-900">ระบบโน้ต</h1>
          <button 
            @click="startAddingNote" 
            class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
            title="เพิ่มโน้ตใหม่"
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
                <span class="text-sm text-gray-700">โน้ตทั้งหมด</span>
              </div>
              <span class="text-sm font-semibold text-blue-600">{{ notes.length }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-700">วันนี้</span>
              </div>
              <span class="text-sm font-semibold text-green-600">{{ todayNotes }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span class="text-sm text-gray-700">สัปดาห์นี้</span>
              </div>
              <span class="text-sm font-semibold text-yellow-600">{{ weekNotes }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-purple-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span class="text-sm text-gray-700">ปักหมุด</span>
              </div>
              <span class="text-sm font-semibold text-purple-600">{{ pinnedNotes }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">เมนู</h3>
          <nav class="space-y-1">
            <button 
              v-for="filter in sidebarMenuItems" 
              :key="filter.value"
              @click="selectFilter(filter.value)" 
              class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 sidebar-menu-item"
              :class="{ 
                'bg-blue-100 text-blue-700 font-medium active': selectedFilter === filter.value,
                'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedFilter !== filter.value
              }"
            >
              <i :class="filter.icon" class="text-sm w-4"></i>
              <span class="flex-1 text-left">{{ filter.label }}</span>
              <span 
                v-if="getFilterCount(filter.value) > 0" 
                class="px-2 py-1 text-xs rounded-full status-badge"
                :class="{ 
                  'bg-blue-200 text-blue-800': selectedFilter === filter.value,
                  'bg-gray-200 text-gray-600': selectedFilter !== filter.value
                }"
              >
                {{ getFilterCount(filter.value) }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Quick Actions -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการ</h3>
          <div class="space-y-2">
            <button 
              @click="startAddingNote"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-plus text-sm w-4"></i>
              <span>เพิ่มโน้ตใหม่</span>
            </button>
            <button 
              @click="refreshNotes"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-sync-alt text-sm w-4"></i>
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        <!-- User Info -->
        <div class="mt-auto px-4 py-4">
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
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold text-gray-900">ระบบโน้ต</h1>
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
                @input="filterNotes" 
                placeholder="ค้นหาโน้ต..." 
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <!-- Add Note Button (Mobile) -->
          <button 
            @click="startAddingNote" 
            class="lg:hidden bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <i class="fas fa-plus text-xs"></i>
            เพิ่มโน้ต
          </button>
        </div>
      </div>

      <!-- Filter Tabs (Mobile) -->
      <div class="lg:hidden bg-white border-b border-gray-200">
        <div class="px-4 py-2">
          <select 
            v-model="selectedFilter" 
            @change="selectFilter(selectedFilter)"
            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option 
              v-for="filter in sidebarMenuItems" 
              :key="filter.value" 
              :value="filter.value"
            >
              {{ filter.label }} ({{ getFilterCount(filter.value) }})
            </option>
          </select>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-4 overflow-hidden">
        <!-- Note List -->
        <div v-if="!editingNote" class="h-full">
          <!-- Current Filter Info -->
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold text-gray-900">
                {{ getFilterLabel(selectedFilter) }}
              </h2>
              <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {{ filteredNotes.length }} รายการ
              </span>
            </div>
            
            <!-- View Toggle -->
            <div class="flex items-center gap-2">
              <button 
                @click="viewMode = 'grid'"
                class="p-2 rounded-lg transition-colors"
                :class="viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
              >
                <i class="fas fa-th text-sm"></i>
              </button>
              <button 
                @click="viewMode = 'list'"
                class="p-2 rounded-lg transition-colors"
                :class="viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'"
              >
                <i class="fas fa-list text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Notes Grid/List -->
          <div class="h-full overflow-y-auto">
            <!-- Grid View -->
            <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div 
                v-for="note in filteredNotes" 
                :key="note._id" 
                class="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer note-card transition-all duration-200"
                :style="{ borderLeftColor: note.color || '#3b82f6', borderLeftWidth: '4px' }"
                @click="startEditingNote(note)"
              >
                <div class="flex items-start justify-between mb-2">
                  <h3 class="font-semibold text-gray-900 text-sm truncate flex-1">{{ note.title || 'ไม่มีชื่อ' }}</h3>
                  <button @click.stop="pinNote(note)" class="ml-2">
                    <i :class="note.pinned ? 'fas fa-thumbtack text-blue-600' : 'fas fa-thumbtack text-gray-300'" class="text-sm"></i>
                  </button>
                </div>
                
                <p class="text-gray-600 text-xs mb-3 line-clamp-3">{{ note.content }}</p>
                
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span class="flex items-center gap-1">
                    <i class="fas fa-calendar-alt"></i>
                    {{ note.date }}
                  </span>
                  <div class="flex items-center gap-2">
                    <button @click.stop="shareNote(note)" class="hover:text-blue-600 transition-colors">
                      <i class="fas fa-share"></i>
                    </button>
                    <button @click.stop="deleteNote(note._id)" class="hover:text-red-600 transition-colors">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- List View -->
            <div v-if="viewMode === 'list'" class="space-y-2">
              <div 
                v-for="note in filteredNotes" 
                :key="note._id" 
                class="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer note-card transition-all duration-200"
                @click="startEditingNote(note)"
              >
                <div class="flex items-start gap-3">
                  <div class="w-1 h-12 rounded-full flex-shrink-0" :style="{ backgroundColor: note.color || '#3b82f6' }"></div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1 min-w-0">
                        <h3 class="font-semibold text-gray-900 text-sm truncate">{{ note.title || 'ไม่มีชื่อ' }}</h3>
                        <p class="text-gray-600 text-xs mt-1 line-clamp-2">{{ note.content }}</p>
                      </div>
                      
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="text-xs text-gray-500">{{ note.date }}</span>
                        <button @click.stop="pinNote(note)">
                          <i :class="note.pinned ? 'fas fa-thumbtack text-blue-600' : 'fas fa-thumbtack text-gray-300'" class="text-sm"></i>
                        </button>
                        <button @click.stop="shareNote(note)" class="text-gray-400 hover:text-blue-600 transition-colors">
                          <i class="fas fa-share text-sm"></i>
                        </button>
                        <button @click.stop="deleteNote(note._id)" class="text-gray-400 hover:text-red-600 transition-colors">
                          <i class="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredNotes.length === 0" class="text-center py-12">
              <i class="fas fa-sticky-note text-gray-300 text-4xl mb-4"></i>
              <p class="text-gray-500">ไม่พบโน้ตที่ตรงกับการค้นหา</p>
            </div>
          </div>
        </div>

        <!-- Note Editor -->
        <div v-if="editingNote" class="h-full flex flex-col">
          <div class="bg-white border border-gray-200 rounded-lg flex-1 flex flex-col">
            <!-- Editor Header -->
            <div class="border-b border-gray-200 p-4 flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <input 
                    v-model="editingNote.title" 
                    placeholder="ชื่อโน้ต..." 
                    class="text-lg font-semibold text-gray-900 bg-transparent border-none outline-none flex-1"
                  />
                  <button @click="pinNote(editingNote)">
                    <i :class="editingNote.pinned ? 'fas fa-thumbtack text-blue-600' : 'fas fa-thumbtack text-gray-300'"></i>
                  </button>
                </div>
                
                <div class="flex items-center gap-2">
                  <!-- Color Picker -->
                  <div class="flex items-center gap-1">
                    <button 
                      v-for="color in noteColors" 
                      :key="color"
                      @click="editingNote.color = color"
                      class="w-6 h-6 rounded-full border-2 transition-all"
                      :style="{ backgroundColor: color }"
                      :class="editingNote.color === color ? 'border-gray-600 scale-110' : 'border-gray-300'"
                    ></button>
                  </div>
                  
                  <button 
                    @click="saveNoteContent(editingNote)"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                  >
                    บันทึก
                  </button>
                  <button 
                    @click="cancelEditing"
                    class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>

            <!-- Editor Content -->
            <div class="flex-1 p-4">
              <textarea 
                v-model="editingNote.content"
                ref="textarea"
                placeholder="เขียนโน้ตของคุณที่นี่..."
                class="w-full h-full resize-none border-none outline-none text-sm leading-relaxed"
                @input="autoResizeTextarea"
              ></textarea>
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
            <h1 class="text-lg font-semibold text-gray-900">ระบบโน้ต</h1>
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
                  <span class="text-sm text-gray-700">โน้ตทั้งหมด</span>
                </div>
                <span class="text-sm font-semibold text-blue-600">{{ notes.length }}</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">วันนี้</span>
                </div>
                <span class="text-sm font-semibold text-green-600">{{ todayNotes }}</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg stats-card">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">สัปดาห์นี้</span>
                </div>
                <span class="text-sm font-semibold text-yellow-600">{{ weekNotes }}</span>
              </div>
            </div>
          </div>

          <!-- Navigation Menu -->
          <div class="px-4 py-4 border-b border-gray-200">
            <h3 class="text-sm font-medium text-gray-700 mb-3">เมนู</h3>
            <nav class="space-y-1">
              <button 
                v-for="filter in sidebarMenuItems" 
                :key="filter.value"
                @click="selectFilterAndCloseMobile(filter.value)" 
                class="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 sidebar-menu-item"
                :class="{ 
                  'bg-blue-100 text-blue-700 font-medium active': selectedFilter === filter.value,
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900': selectedFilter !== filter.value
                }"
              >
                <i :class="filter.icon" class="text-sm w-4"></i>
                <span class="flex-1 text-left">{{ filter.label }}</span>
                <span 
                  v-if="getFilterCount(filter.value) > 0" 
                  class="px-2 py-1 text-xs rounded-full status-badge"
                  :class="{ 
                    'bg-blue-200 text-blue-800': selectedFilter === filter.value,
                    'bg-gray-200 text-gray-600': selectedFilter !== filter.value
                  }"
                >
                  {{ getFilterCount(filter.value) }}
                </span>
              </button>
            </nav>
          </div>
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
  data() {
    return {
      loader: false,
      title: 'Notes',
      notes: [],
      filteredNotes: [],
      editingNote: null,
      configs: storageManager.get('configs'),
      session: storageManager.get('session'),
      viewMode: 'grid',
      searchQuery: '',
      selectedFilter: 'all',
      showMobileSidebar: false,
      sidebarMenuItems: [
        {
          value: 'all',
          label: 'ทั้งหมด',
          icon: 'fas fa-th-large'
        },
        {
          value: 'today',
          label: 'วันนี้',
          icon: 'fas fa-calendar-day'
        },
        {
          value: 'week',
          label: 'สัปดาห์นี้',
          icon: 'fas fa-calendar-week'
        },
        {
          value: 'pinned',
          label: 'ปักหมุด',
          icon: 'fas fa-thumbtack'
        }
      ],
      noteColors: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6b7280', '#ffffff'],
    };
  },
  computed: {
    todayNotes() {
      const today = new Date().toLocaleDateString();
      return this.notes.filter(note => note.date === today).length;
    },
    weekNotes() {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return this.notes.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate >= weekAgo && noteDate <= today;
      }).length;
    },
    pinnedNotes() {
      return this.notes.filter(note => note.pinned).length;
    }
  },
  methods: {
    async fetchNotes() {
      try {
        const response = await Request.POST('notes/query', { 
          method: 'find', 
          args: [{ $and: [{ unit: this.session.current._id }] }] 
        }, this.configs.key);
        if (response.status === 200) {
          this.notes = response.data;
          this.filterNotes();
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        this.loader = true;
        this.checkUrlForItem();
      }
    },
    updateNoteTitle(note) {
      const lines = note.content.split('\n');
      note.title = lines[0] || 'Untitled Note';
    },
    async saveNoteContent(note) {
      this.updateNoteTitle(note);

      if (note._id) {
        await this.updateNoteContent(note);
      } else {
        await this.addNoteContent(note);
      }
      this.editingNote = null;
      this.removeUrlItemParam();
    },
    async addNoteContent(note) {
      try {
        const response = await Request.POST('notes/', {
          data: {
            title: note.title,
            content: note.content,
            date: new Date().toLocaleDateString(),
            unit: this.session.current._id,
            color: note.color,
            pinned: note.pinned || false,
          },
        }, this.configs.key);
        if (response.status === 200) {
          note._id = response.data._id;
          note.date = response.data.date;
          this.notes.push(note);
          this.filterNotes();
        }
      } catch (error) {
        console.error('Error adding note:', error);
      }
    },
    async updateNoteContent(note) {
      try {
        const response = await Request.PUT(`notes/${note._id}`, {
          data: {
            title: note.title,
            content: note.content,
            color: note.color,
            pinned: note.pinned || false,
          },
        }, this.configs.key);
        if (response.status === 200) {
          this.fetchNotes();
        }
      } catch (error) {
        console.error('Error updating note:', error);
      }
    },
    startAddingNote() {
      this.editingNote = {
        title: '',
        content: '',
        date: new Date().toLocaleDateString(),
        color: '#3b82f6',
        pinned: false,
        _id: null,
      };
      this.updateUrlItemParam();
    },
    startEditingNote(note) {
      this.updateNoteTitle(note);
      this.editingNote = { ...note };
      this.updateUrlItemParam(note._id);
    },
    cancelEditing() {
      this.editingNote = null;
      this.removeUrlItemParam();
    },
    async deleteNote(noteId) {
      try {
        const response = await Request.DELETE(`notes/${noteId}`, {}, this.configs.key);
        if (response.status === 200) {
          this.notes = this.notes.filter(note => note._id !== noteId);
          this.filterNotes();
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    },
    checkUrlForItem() {
      const urlParams = new URLSearchParams(window.location.search);
      const itemId = urlParams.get('item');
      if (itemId) {
        const noteToEdit = this.notes.find(note => note._id === itemId);
        if (noteToEdit) {
          this.startEditingNote(noteToEdit);
        }
      }
    },
    updateUrlItemParam(noteId = '') {
      const url = new URL(window.location);
      if (noteId) {
        url.searchParams.set('item', noteId);
      } else {
        url.searchParams.set('item', 'new');
      }
      window.history.pushState({}, '', url);
    },
    removeUrlItemParam() {
      const url = new URL(window.location);
      url.searchParams.delete('item');
      window.history.pushState({}, '', url);
      this.fetchNotes();
    },
    async pinNote(note) {
      note.pinned = !note.pinned;
      if (note._id) {
        await this.updateNoteContent(note);
      }
    },
    shareNote() {
      // Logic to share the note
    },
    editNote(note) {
      this.startEditingNote(note);
    },
    autoResizeTextarea() {
      const textarea = this.$refs.textarea;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    },
    filterNotes() {
      let filtered = this.notes;

      // Filter by search query
      if (this.searchQuery) {
        filtered = filtered.filter(note => 
          note.title?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          note.content?.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      // Filter by selected filter
      if (this.selectedFilter === 'today') {
        const today = new Date().toLocaleDateString();
        filtered = filtered.filter(note => note.date === today);
      } else if (this.selectedFilter === 'week') {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(note => {
          const noteDate = new Date(note.date);
          return noteDate >= weekAgo && noteDate <= today;
        });
      } else if (this.selectedFilter === 'pinned') {
        filtered = filtered.filter(note => note.pinned);
      }

      this.filteredNotes = filtered;
    },
    selectFilter(filterValue) {
      this.selectedFilter = filterValue;
      this.filterNotes();
    },
    getFilterCount(filterValue) {
      if (filterValue === 'all') return this.notes.length;
      if (filterValue === 'today') return this.todayNotes;
      if (filterValue === 'week') return this.weekNotes;
      if (filterValue === 'pinned') return this.pinnedNotes;
      return 0;
    },
    getFilterLabel(filterValue) {
      const filterItem = this.sidebarMenuItems.find(item => item.value === filterValue);
      return filterItem ? filterItem.label : 'ทั้งหมด';
    },
    toggleMobileSidebar() {
      this.showMobileSidebar = !this.showMobileSidebar;
    },
    selectFilterAndCloseMobile(filterValue) {
      this.selectFilter(filterValue);
      this.toggleMobileSidebar();
    },
    refreshNotes() {
      this.fetchNotes();
    }
  },
  mounted() {
    this.fetchNotes();
    this.$nextTick(() => {
      if (this.$refs.textarea) {
        this.autoResizeTextarea();
      }
    });
  },
};
</script>


<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
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

/* Note card animations */
.note-card {
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
}

.note-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease-in-out;
}

.note-card:hover::before {
  left: 100%;
}

.note-card:hover {
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

/* Note specific styles */
.note-editor {
  background: linear-gradient(to bottom, transparent 29px, #e5e7eb 30px);
  background-size: 100% 30px;
  line-height: 30px;
}

/* Color picker styles */
.color-picker-button {
  transition: all 0.2s ease-in-out;
}

.color-picker-button:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
