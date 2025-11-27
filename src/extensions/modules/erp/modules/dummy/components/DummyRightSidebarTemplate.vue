<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Main Layout with Right Sidebar -->
    <div class="flex min-h-[calc(100vh-60px)]">
      <!-- Main Content Area -->
      <main class="flex-1 min-w-0">
        <!-- Header Section -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="px-6 lg:px-8 py-6">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Right Sidebar Template</h1>
                <p class="mt-2 text-gray-600">Template แบบมี sidebar ขวา เหมาะสำหรับ content + widgets</p>
              </div>
              <div class="flex space-x-3">
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center">
                  <i class="fas fa-plus mr-2"></i>
                  เพิ่มใหม่
                </button>
                <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                  <i class="fas fa-download mr-2"></i>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 lg:p-8">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center">
                <div class="bg-blue-100 p-3 rounded-lg">
                  <i class="fas fa-eye text-blue-600 text-xl"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Page Views</p>
                  <p class="text-2xl font-bold text-gray-900">45,678</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center">
                <div class="bg-green-100 p-3 rounded-lg">
                  <i class="fas fa-users text-green-600 text-xl"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Visitors</p>
                  <p class="text-2xl font-bold text-gray-900">12,345</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center">
                <div class="bg-purple-100 p-3 rounded-lg">
                  <i class="fas fa-clock text-purple-600 text-xl"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Avg. Time</p>
                  <p class="text-2xl font-bold text-gray-900">2m 43s</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center">
                <div class="bg-yellow-100 p-3 rounded-lg">
                  <i class="fas fa-percentage text-yellow-600 text-xl"></i>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Bounce Rate</p>
                  <p class="text-2xl font-bold text-gray-900">23.5%</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <!-- Large Chart -->
            <div class="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Analytics Overview</h3>
                <div class="flex space-x-2">
                  <button class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg">7 Days</button>
                  <button class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">30 Days</button>
                  <button class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">90 Days</button>
                </div>
              </div>
              <div class="bg-gradient-to-br from-blue-50 to-purple-100 rounded-lg p-12 text-center">
                <i class="fas fa-chart-line text-5xl text-blue-500 mb-4"></i>
                <p class="text-gray-600 text-lg">Large Chart Component</p>
                <p class="text-sm text-gray-500">แสดงกราฟ analytics หรือข้อมูลสำคัญ</p>
              </div>
            </div>

            <!-- Content List -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>
              <div class="space-y-4">
                <div v-for="i in 6" :key="i" class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-file-alt text-gray-500"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900">Article Title {{ i }}</h4>
                    <p class="text-xs text-gray-500 mt-1">Lorem ipsum dolor sit amet consectetur...</p>
                    <div class="flex items-center mt-2 text-xs text-gray-400">
                      <span>2025-10-08</span>
                      <span class="mx-2">•</span>
                      <span>{{ Math.floor(Math.random() * 100) }} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Performance Metrics -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Server Response Time</span>
                  <div class="flex items-center">
                    <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div class="bg-green-600 h-2 rounded-full w-3/4"></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900">245ms</span>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Page Load Speed</span>
                  <div class="flex items-center">
                    <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div class="bg-blue-600 h-2 rounded-full w-4/5"></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900">1.2s</span>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Database Query</span>
                  <div class="flex items-center">
                    <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div class="bg-yellow-600 h-2 rounded-full w-2/3"></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900">89ms</span>
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">API Response</span>
                  <div class="flex items-center">
                    <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div class="bg-red-600 h-2 rounded-full w-1/2"></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900">456ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Table -->
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900">User Activity Log</h3>
                <div class="flex space-x-3">
                  <select class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Activities</option>
                    <option>Login</option>
                    <option>Purchase</option>
                    <option>Update</option>
                  </select>
                  <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    <i class="fas fa-refresh mr-2"></i>Refresh
                  </button>
                </div>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="i in 12" :key="i" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ new Date().toLocaleTimeString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      user{{ i }}@example.com
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ ['Login', 'Purchase', 'Update Profile', 'Logout'][Math.floor(Math.random() * 4)] }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      192.168.1.{{ Math.floor(Math.random() * 255) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Success
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <!-- Right Sidebar -->
      <aside class="w-80 bg-white shadow-sm border-l border-gray-200 flex-shrink-0">
        <div class="p-6">
          <!-- System Status -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">System Status</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span class="text-sm text-green-800">Database</span>
                </div>
                <span class="text-xs text-green-600">Online</span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span class="text-sm text-green-800">API Server</span>
                </div>
                <span class="text-xs text-green-600">Online</span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <span class="text-sm text-yellow-800">Storage</span>
                </div>
                <span class="text-xs text-yellow-600">85% Full</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div class="space-y-2">
              <button class="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium text-blue-700 transition-colors">
                <i class="fas fa-plus mr-2"></i>Add New User
              </button>
              <button class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                <i class="fas fa-download mr-2"></i>Export Report
              </button>
              <button class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                <i class="fas fa-cog mr-2"></i>System Settings
              </button>
              <button class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                <i class="fas fa-chart-bar mr-2"></i>View Analytics
              </button>
            </div>
          </div>

          <!-- Recent Notifications -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Recent Notifications</h3>
            <div class="space-y-3">
              <div v-for="i in 4" :key="i" class="p-3 border border-gray-200 rounded-lg">
                <div class="flex items-start">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-bell text-blue-600 text-xs"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-gray-900">Notification {{ i }}</p>
                    <p class="text-xs text-gray-500 mt-1">Lorem ipsum dolor sit amet...</p>
                    <p class="text-xs text-gray-400 mt-1">{{ Math.floor(Math.random() * 60) }}m ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resource Usage -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Resource Usage</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-xs text-gray-600 mb-1">
                  <span>CPU Usage</span>
                  <span>45%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full w-[45%]"></div>
                </div>
              </div>
              
              <div>
                <div class="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Memory</span>
                  <span>68%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-600 h-2 rounded-full w-[68%]"></div>
                </div>
              </div>
              
              <div>
                <div class="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Storage</span>
                  <span>85%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-yellow-600 h-2 rounded-full w-[85%]"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-4 text-white">
            <h4 class="font-semibold text-sm mb-2">Need Help?</h4>
            <p class="text-xs text-purple-100 mb-3">Contact our support team for assistance.</p>
            <button class="w-full bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded text-xs font-medium transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import { ErpBreadcrumb } from '../../../ui-kit'

export default {
  name: 'DummyRightSidebarTemplate',
  
  components: {
    ErpBreadcrumb
  },
  
  data() {
    return {
      breadcrumbNav: [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Dummy Module', path: '/dummy', icon: 'fas fa-cube' },
        { name: 'Right Sidebar Template' }
      ]
    }
  }
}
</script>

<style scoped>
/* Responsive adjustments */
@media (max-width: 1280px) {
  aside {
    width: 20rem; /* w-80 = 20rem */
  }
}

@media (max-width: 1024px) {
  aside {
    display: none;
  }
}
</style>