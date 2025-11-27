<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">Layout Templates Gallery</h1>
          <p class="mt-2 text-gray-600 max-w-2xl mx-auto">
            เลือก layout template ที่เหมาะสมกับงานของคุณ แต่ละแบบออกแบบมาสำหรับการใช้งานที่แตกต่างกัน
          </p>
        </div>
      </div>
    </div>

    <!-- Template Gallery -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Layout Categories -->
      <div class="mb-8">
        <div class="flex flex-wrap justify-center gap-4">
          <button 
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="selectedCategory === category.id 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'"
            class="px-4 py-2 rounded-lg border border-gray-200 font-medium transition-colors"
          >
            <i :class="category.icon" class="mr-2"></i>
            {{ category.name }}
          </button>
        </div>
      </div>

      <!-- Template Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Block Layout (Original) -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div class="p-1 bg-gradient-to-br from-blue-500 to-indigo-600">
            <div class="bg-white rounded-lg p-4">
              <!-- Mini Preview -->
              <div class="space-y-2">
                <div class="h-2 bg-blue-100 rounded"></div>
                <div class="flex space-x-2">
                  <div class="flex-1 h-16 bg-gray-100 rounded"></div>
                  <div class="flex-1 h-16 bg-gray-100 rounded"></div>
                  <div class="flex-1 h-16 bg-gray-100 rounded"></div>
                </div>
                <div class="h-12 bg-gray-50 rounded"></div>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900">Block Layout</h3>
              <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Original</span>
            </div>
            <p class="text-gray-600 text-sm mb-4">
              Layout แบบดั้งเดิม เนื้อหาอยู่ในกล่องที่มีขนาดจำกัด เหมาะสำหรับเนื้อหาทั่วไป
            </p>
            
            <div class="flex items-center justify-between mb-4">
              <div class="flex space-x-2">
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Dashboard</span>
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Forms</span>
              </div>
              <div class="text-sm text-gray-500">
                <i class="fas fa-desktop mr-1"></i>Responsive
              </div>
            </div>

            <div class="flex space-x-2">
              <router-link 
                to="/dummy"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <i class="fas fa-eye mr-2"></i>ดูตัวอย่าง
              </router-link>
              <button class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors">
                <i class="fas fa-info-circle"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Fullwidth Layout -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div class="p-1 bg-gradient-to-br from-green-500 to-emerald-600">
            <div class="bg-white rounded-lg p-4">
              <!-- Mini Preview -->
              <div class="space-y-2">
                <div class="h-2 bg-green-100 rounded"></div>
                <div class="grid grid-cols-6 gap-1">
                  <div class="h-8 bg-green-100 rounded"></div>
                  <div class="h-8 bg-green-100 rounded"></div>
                  <div class="h-8 bg-green-100 rounded"></div>
                  <div class="h-8 bg-green-100 rounded"></div>
                  <div class="h-8 bg-green-100 rounded"></div>
                  <div class="h-8 bg-green-100 rounded"></div>
                </div>
                <div class="h-12 bg-gray-50 rounded"></div>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900">Fullwidth Layout</h3>
              <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Popular</span>
            </div>
            <p class="text-gray-600 text-sm mb-4">
              เต็มความกว้างหน้าจอ เหมาะสำหรับตาราง dashboard และการแสดงข้อมูลจำนวนมาก
            </p>
            
            <div class="flex items-center justify-between mb-4">
              <div class="flex space-x-2">
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Tables</span>
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Charts</span>
              </div>
              <div class="text-sm text-gray-500">
                <i class="fas fa-arrows-alt-h mr-1"></i>Wide
              </div>
            </div>

            <div class="flex space-x-2">
              <router-link 
                to="/dummy/templates/fullwidth"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <i class="fas fa-eye mr-2"></i>ดูตัวอย่าง
              </router-link>
              <button class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors">
                <i class="fas fa-info-circle"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Left Sidebar Layout -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div class="p-1 bg-gradient-to-br from-purple-500 to-pink-600">
            <div class="bg-white rounded-lg p-4">
              <!-- Mini Preview -->
              <div class="flex space-x-2">
                <div class="w-6 bg-purple-100 rounded">
                  <div class="space-y-1 p-1">
                    <div class="h-1 bg-purple-300 rounded"></div>
                    <div class="h-1 bg-purple-200 rounded"></div>
                    <div class="h-1 bg-purple-200 rounded"></div>
                  </div>
                </div>
                <div class="flex-1 space-y-2">
                  <div class="h-2 bg-purple-100 rounded"></div>
                  <div class="flex space-x-1">
                    <div class="flex-1 h-8 bg-gray-100 rounded"></div>
                    <div class="flex-1 h-8 bg-gray-100 rounded"></div>
                  </div>
                  <div class="h-8 bg-gray-50 rounded"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900">Left Sidebar</h3>
              <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">App</span>
            </div>
            <p class="text-gray-600 text-sm mb-4">
              มี navigation sidebar ทางซ้าย เหมาะสำหรับ application และ admin panel
            </p>
            
            <div class="flex items-center justify-between mb-4">
              <div class="flex space-x-2">
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Navigation</span>
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Admin</span>
              </div>
              <div class="text-sm text-gray-500">
                <i class="fas fa-bars mr-1"></i>Nav
              </div>
            </div>

            <div class="flex space-x-2">
              <router-link 
                to="/dummy/templates/left-sidebar"
                class="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <i class="fas fa-eye mr-2"></i>ดูตัวอย่าง
              </router-link>
              <button class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors">
                <i class="fas fa-info-circle"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Sidebar Layout -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div class="p-1 bg-gradient-to-br from-orange-500 to-red-500">
            <div class="bg-white rounded-lg p-4">
              <!-- Mini Preview -->
              <div class="flex space-x-2">
                <div class="flex-1 space-y-2">
                  <div class="h-2 bg-orange-100 rounded"></div>
                  <div class="flex space-x-1">
                    <div class="flex-1 h-8 bg-gray-100 rounded"></div>
                    <div class="flex-1 h-8 bg-gray-100 rounded"></div>
                  </div>
                  <div class="h-8 bg-gray-50 rounded"></div>
                </div>
                <div class="w-6 bg-orange-100 rounded">
                  <div class="space-y-1 p-1">
                    <div class="h-1 bg-orange-300 rounded"></div>
                    <div class="h-1 bg-orange-200 rounded"></div>
                    <div class="h-1 bg-orange-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900">Right Sidebar</h3>
              <span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">Widgets</span>
            </div>
            <p class="text-gray-600 text-sm mb-4">
              มี widget sidebar ทางขวา เหมาะสำหรับ content พร้อม tools และ information panel
            </p>
            
            <div class="flex items-center justify-between mb-4">
              <div class="flex space-x-2">
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Content</span>
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Tools</span>
              </div>
              <div class="text-sm text-gray-500">
                <i class="fas fa-puzzle-piece mr-1"></i>Widget
              </div>
            </div>

            <div class="flex space-x-2">
              <router-link 
                to="/dummy/templates/right-sidebar"
                class="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <i class="fas fa-eye mr-2"></i>ดูตัวอย่าง
              </router-link>
              <button class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors">
                <i class="fas fa-info-circle"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Three Column Layout -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div class="p-1 bg-gradient-to-br from-indigo-500 to-purple-600">
            <div class="bg-white rounded-lg p-4">
              <!-- Mini Preview -->
              <div class="flex space-x-1">
                <div class="w-4 bg-indigo-100 rounded">
                  <div class="space-y-1 p-0.5">
                    <div class="h-0.5 bg-indigo-300 rounded"></div>
                    <div class="h-0.5 bg-indigo-200 rounded"></div>
                  </div>
                </div>
                <div class="flex-1 space-y-1">
                  <div class="h-1.5 bg-indigo-100 rounded"></div>
                  <div class="h-6 bg-gray-100 rounded"></div>
                  <div class="h-6 bg-gray-50 rounded"></div>
                </div>
                <div class="w-4 bg-indigo-100 rounded">
                  <div class="space-y-1 p-0.5">
                    <div class="h-0.5 bg-indigo-300 rounded"></div>
                    <div class="h-0.5 bg-indigo-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900">Three Column</h3>
              <span class="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded">Pro</span>
            </div>
            <p class="text-gray-600 text-sm mb-4">
              Layout 3 คอลัมน์ Left sidebar + Center content + Right widgets เหมาะสำหรับ complex application
            </p>
            
            <div class="flex items-center justify-between mb-4">
              <div class="flex space-x-2">
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">CRM</span>
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">ERP</span>
              </div>
              <div class="text-sm text-gray-500">
                <i class="fas fa-columns mr-1"></i>3-Col
              </div>
            </div>

            <div class="flex space-x-2">
              <router-link 
                to="/dummy/templates/three-column"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <i class="fas fa-eye mr-2"></i>ดูตัวอย่าง
              </router-link>
              <button class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors">
                <i class="fas fa-info-circle"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Other Templates (Existing) -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div class="p-1 bg-gradient-to-br from-gray-400 to-gray-600">
            <div class="bg-white rounded-lg p-4">
              <!-- Mini Preview -->
              <div class="space-y-2">
                <div class="h-2 bg-gray-200 rounded"></div>
                <div class="grid grid-cols-3 gap-1">
                  <div class="h-8 bg-gray-100 rounded"></div>
                  <div class="h-8 bg-gray-100 rounded"></div>
                  <div class="h-8 bg-gray-100 rounded"></div>
                </div>
                <div class="h-12 bg-gray-50 rounded"></div>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900">Other Templates</h3>
              <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">More</span>
            </div>
            <p class="text-gray-600 text-sm mb-4">
              Template อื่นๆ ที่มีอยู่แล้ว เช่น Items Manager, Data Table, Forms และอื่นๆ
            </p>
            
            <div class="flex items-center justify-between mb-4">
              <div class="flex space-x-2">
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Forms</span>
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Tables</span>
              </div>
              <div class="text-sm text-gray-500">
                <i class="fas fa-list mr-1"></i>Various
              </div>
            </div>

            <div class="flex space-x-2">
              <router-link 
                to="/dummy/items"
                class="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <i class="fas fa-eye mr-2"></i>ดูตัวอย่าง
              </router-link>
              <button class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors">
                <i class="fas fa-info-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Comparison -->
      <div class="mt-12 bg-white rounded-xl shadow-sm p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">เปรียบเทียบ Layout Templates</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 font-semibold text-gray-900">Layout</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-900">เหมาะสำหรับ</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-900">Screen Size</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-900">Complexity</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-900">Best Use</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr>
                <td class="py-3 px-4 font-medium text-blue-600">Block Layout</td>
                <td class="py-3 px-4 text-gray-600">เนื้อหาทั่วไป, Forms</td>
                <td class="py-3 px-4 text-gray-600">All devices</td>
                <td class="py-3 px-4"><span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Simple</span></td>
                <td class="py-3 px-4 text-gray-600">Standard pages</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium text-green-600">Fullwidth</td>
                <td class="py-3 px-4 text-gray-600">Tables, Charts, Dashboard</td>
                <td class="py-3 px-4 text-gray-600">Large screens</td>
                <td class="py-3 px-4"><span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Simple</span></td>
                <td class="py-3 px-4 text-gray-600">Data visualization</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium text-purple-600">Left Sidebar</td>
                <td class="py-3 px-4 text-gray-600">Applications, Admin panels</td>
                <td class="py-3 px-4 text-gray-600">Desktop/Tablet</td>
                <td class="py-3 px-4"><span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Medium</span></td>
                <td class="py-3 px-4 text-gray-600">Navigation heavy</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium text-orange-600">Right Sidebar</td>
                <td class="py-3 px-4 text-gray-600">Content + Widgets</td>
                <td class="py-3 px-4 text-gray-600">Desktop/Tablet</td>
                <td class="py-3 px-4"><span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Medium</span></td>
                <td class="py-3 px-4 text-gray-600">Tool-rich interfaces</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-medium text-indigo-600">Three Column</td>
                <td class="py-3 px-4 text-gray-600">CRM, ERP, Complex apps</td>
                <td class="py-3 px-4 text-gray-600">Large desktop</td>
                <td class="py-3 px-4"><span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Complex</span></td>
                <td class="py-3 px-4 text-gray-600">Information dense</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ErpBreadcrumb } from '../../../ui-kit'

export default {
  name: 'DummyTemplateGallery',
  
  components: {
    ErpBreadcrumb
  },
  
  data() {
    return {
      selectedCategory: 'all',
      breadcrumbNav: [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Dummy Module', path: '/dummy', icon: 'fas fa-cube' },
        { name: 'Template Gallery' }
      ],
      categories: [
        { id: 'all', name: 'All Templates', icon: 'fas fa-th' },
        { id: 'simple', name: 'Simple', icon: 'fas fa-square' },
        { id: 'sidebar', name: 'With Sidebar', icon: 'fas fa-columns' },
        { id: 'complex', name: 'Complex', icon: 'fas fa-puzzle-piece' }
      ]
    }
  }
}
</script>

<style scoped>
.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>