<script>
import Loader from '@/interface/template/Loader.vue';
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';

const Request = new requestClient(false);

export default {
  name: 'PostsComponent',
  components: {
    Loader
  },
  props: {
    headerType: {
      type: String,
      default: null,
      validator: value => ['topbar', 'breadcrumb', 'full-admin', null].includes(value)
    },
    headerHeight: {
      type: [Number, String],
      default: null
    },
    customHeight: {
      type: String,
      default: null
    },
    customClass: {
      type: String,
      default: ''
    }
  },
  data() {
    const session = storageManager.get('session');
    const configs = storageManager.get('configs');
    
    return {
      session,
      configs,
      posts: [],
      filteredPosts: [],
      selectedPost: null,
      loading: false,
      searchQuery: '',
      selectedTab: 'all',
      showMobileSidebar: false,
      sidebarMenuItems: [
        { value: 'all', label: 'ทั้งหมด', icon: 'fas fa-list' },
        { value: 'published', label: 'เผยแพร่', icon: 'fas fa-check-circle' },
        { value: 'draft', label: 'ฉบับร่าง', icon: 'fas fa-edit' }
      ],
      postCounts: {
        all: 0,
        published: 0,
        draft: 0
      }
    };
  },
  methods: {
    async fetchPosts() {
      try {
        this.loading = true;
        const response = await Request.POST('post/query', {
          method: 'find',
          args: [{ 
            $and: [
              { owner: this.session.current._id },
              { type: 'post' }
            ] 
          }]
        }, this.configs.key);

        if (response.status === 200) {
          this.posts = response.data;
          this.calculatePostCounts();
          this.filterPosts();
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        this.loading = false;
      }
    },
    calculatePostCounts() {
      this.postCounts = {
        all: this.posts.length,
        published: this.posts.filter(post => post.status).length,
        draft: this.posts.filter(post => !post.status).length
      };
    },
    selectTab(code) {
      this.selectedTab = code;
      this.filterPosts();
      this.selectedPost = null;
    },
    filterPosts() {
      this.filteredPosts = this.posts.filter(post => {
        const matchesStatus = this.selectedTab === 'all' || 
          (this.selectedTab === 'published' && post.status) || 
          (this.selectedTab === 'draft' && !post.status);
        
        const matchesSearch = this.searchQuery
          ? post.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            post.slug.toLowerCase().includes(this.searchQuery.toLowerCase())
          : true;

        return matchesStatus && matchesSearch;
      });
    },
    selectPost(post) {
      this.selectedPost = post;
      this.updateUrlItemParam(post._id);
    },
    closeDetail() {
      this.selectedPost = null;
      this.removeUrlItemParam();
    },
    updateUrlItemParam(postId = '') {
      const url = new URL(window.location);
      if (postId) {
        url.searchParams.set('item', postId);
      } else {
        url.searchParams.set('item', 'new');
      }
      window.history.pushState({}, '', url);
    },
    removeUrlItemParam() {
      const url = new URL(window.location);
      url.searchParams.delete('item');
      window.history.pushState({}, '', url);
    },
    async deletePost(post) {
      this.$confirm.require({
        message: 'คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?',
        header: 'ยืนยันการลบ',
        icon: 'fas fa-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
          try {
            await Request.DELETE(`post/${post._id}`, {}, this.configs.key);
            this.$toast.success('ลบโพสต์สำเร็จ');
            this.fetchPosts();
          } catch (error) {
            console.error('Error deleting post:', error);
            this.$toast.error('ไม่สามารถลบโพสต์ได้');
          }
        }
      });
    },
    createNewPost() {
      this.$router.push('/cms/posts/create');
    },
    toggleMobileSidebar() {
      this.showMobileSidebar = !this.showMobileSidebar;
    },
    selectTabAndCloseMobile(code) {
      this.selectTab(code);
      this.toggleMobileSidebar();
    },
    goBack() {
      this.$router.push('/cms/pages');
    }
  },
  mounted() {
    this.fetchPosts();
    
    // Check if the URL has a hash for the tab
    if (window.location.hash === '#published') {
      this.selectTab('published');
    } else if (window.location.hash === '#draft') {
      this.selectTab('draft');
    } else {
      this.selectTab('all');
    }
  }
}
</script>

<template>
  <div 
    class="bg-gray-50 flex posts-container" 
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
          <h1 class="text-lg font-semibold text-gray-900">จัดการโพสต์</h1>
          <button 
            @click="createNewPost" 
            class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors duration-200"
            title="เพิ่มโพสต์ใหม่"
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
                <span class="text-sm text-gray-700">โพสต์ทั้งหมด</span>
              </div>
              <span class="text-sm font-semibold text-blue-600">{{ postCounts.all }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-green-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-gray-700">เผยแพร่</span>
              </div>
              <span class="text-sm font-semibold text-green-600">{{ postCounts.published }}</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-yellow-50 rounded-lg stats-card">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span class="text-sm text-gray-700">ฉบับร่าง</span>
              </div>
              <span class="text-sm font-semibold text-yellow-600">{{ postCounts.draft }}</span>
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
                v-if="postCounts[status.value] > 0" 
                class="px-2 py-1 text-xs rounded-full status-badge"
                :class="{ 
                  'bg-blue-200 text-blue-800': selectedTab === status.value,
                  'bg-gray-200 text-gray-600': selectedTab !== status.value
                }"
              >
                {{ postCounts[status.value] }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Quick Actions -->
        <div class="px-4 py-4 border-b border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการ</h3>
          <div class="space-y-2">
            <button 
              @click="createNewPost"
              class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <i class="fas fa-plus text-sm w-4"></i>
              <span>เพิ่มโพสต์ใหม่</span>
            </button>
            <button 
              @click="fetchPosts"
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
          <h1 class="text-lg font-semibold text-gray-900">จัดการโพสต์</h1>
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
                @input="filterPosts" 
                placeholder="ค้นหาโพสต์..." 
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <!-- Add Post Button (Mobile) -->
          <button 
            @click="createNewPost" 
            class="lg:hidden bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <i class="fas fa-plus text-xs"></i>
            เพิ่มโพสต์
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
              v-for="status in ['all', 'published', 'draft']" 
              :key="status" 
              :value="status"
            >
              {{ status === 'all' ? 'ทั้งหมด' : (status === 'published' ? 'เผยแพร่' : 'ฉบับร่าง') }} 
              ({{ postCounts[status] || 0 }})
            </option>
          </select>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 p-4">
        <!-- Post List -->
        <div v-if="!selectedPost" class="h-full">
          <!-- Current Filter Info -->
          <div v-if="loading" class="text-center py-12">
            <Loader />
          </div>
          <template v-else>
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-semibold text-gray-900">
                  {{ 
                    selectedTab === 'all' ? 'ทั้งหมด' : 
                    (selectedTab === 'published' ? 'เผยแพร่' : 'ฉบับร่าง') 
                  }}
                </h2>
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {{ filteredPosts.length }} รายการ
                </span>
              </div>
            </div>

            <!-- Posts Grid -->
            <div class="h-full space-y-3">
              <div 
                v-for="post in filteredPosts" 
                :key="post._id" 
                class="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer post-card"
                @click="selectPost(post)"
              >
                <div class="flex items-start gap-3">
                  <!-- Thumbnail -->
                  <div 
                    v-if="post.feature_image" 
                    class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    <img 
                      :src="post.feature_image" 
                      class="w-full h-full object-cover"
                    />
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex-1 min-w-0">
                        <h3 class="font-semibold text-gray-900 text-sm truncate">{{ post.title }}</h3>
                        <p class="text-gray-600 text-xs mt-1 line-clamp-2">{{ post.slug }}</p>
                      </div>
                      
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="text-xs text-gray-500">
                          {{ new Date(post.createdAt.$date).toLocaleDateString('th-TH') }}
                        </span>
                        <span 
                          class="px-2 py-1 text-xs font-medium rounded-full status-badge"
                          :class="post.status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                        >
                          {{ post.status ? 'เผยแพร่' : 'ฉบับร่าง' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="filteredPosts.length === 0" class="text-center py-12">
                <i class="fas fa-file-alt text-gray-300 text-4xl mb-4"></i>
                <p class="text-gray-500">ไม่พบโพสต์ที่ตรงกับการค้นหา</p>
              </div>
            </div>
          </template>
        </div>

        <!-- Post Detail -->
        <div v-if="selectedPost" class="h-full flex flex-col">
          <div class="bg-white border border-gray-200 rounded-lg flex-1 flex flex-col">
            <!-- Header -->
            <div class="border-b border-gray-200 p-4 flex-shrink-0">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h1 class="text-lg font-semibold text-gray-900">{{ selectedPost.title }}</h1>
                  <div class="flex items-center gap-2 mt-2">
                    <span 
                      class="px-2 py-1 text-xs font-medium rounded-full status-badge"
                      :class="selectedPost.status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                    >
                      {{ selectedPost.status ? 'เผยแพร่' : 'ฉบับร่าง' }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ new Date(selectedPost.createdAt.$date).toLocaleDateString('th-TH') }}
                    </span>
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                  <button 
                    @click="deletePost(selectedPost)"
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
              <div v-if="selectedPost.feature_image" class="mb-4">
                <img 
                  :src="selectedPost.feature_image" 
                  class="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <p class="text-gray-700 text-sm leading-relaxed">{{ selectedPost.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

