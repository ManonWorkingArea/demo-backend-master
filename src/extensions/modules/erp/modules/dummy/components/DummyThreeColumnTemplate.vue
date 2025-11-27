<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Breadcrumb Navigation -->
    <ErpBreadcrumb :nav="breadcrumbNav" />

    <!-- Three Column Layout -->
    <div class="flex min-h-[calc(100vh-60px)]">
      <!-- Left Sidebar -->
      <aside class="w-64 bg-white shadow-sm border-r border-gray-200 flex-shrink-0">
        <div class="p-4">
          <!-- Navigation Menu -->
          <nav class="space-y-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Main Menu</h3>
            
            <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700">
              <i class="fas fa-home mr-3 text-blue-600"></i>
              Dashboard
            </a>
            <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
              <i class="fas fa-users mr-3 text-gray-400"></i>
              Users
            </a>
            <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
              <i class="fas fa-box mr-3 text-gray-400"></i>
              Products
            </a>
            <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
              <i class="fas fa-shopping-cart mr-3 text-gray-400"></i>
              Orders
            </a>
            <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
              <i class="fas fa-chart-bar mr-3 text-gray-400"></i>
              Reports
            </a>
            <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-50">
              <i class="fas fa-cog mr-3 text-gray-400"></i>
              Settings
            </a>
          </nav>

          <!-- Quick Stats -->
          <div class="mt-6">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Today</h3>
            <div class="space-y-3">
              <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
                <div class="text-sm">Sales</div>
                <div class="text-lg font-bold">$8,542</div>
                <div class="text-xs text-green-100">+12%</div>
              </div>
              
              <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white">
                <div class="text-sm">Orders</div>
                <div class="text-lg font-bold">124</div>
                <div class="text-xs text-blue-100">+8%</div>
              </div>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="mt-6">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Shortcuts</h3>
            <div class="space-y-1">
              <a href="#" class="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">Add Product</a>
              <a href="#" class="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">View Reports</a>
              <a href="#" class="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">Export Data</a>
            </div>
          </div>
        </div>
      </aside>

      <!-- Center Content Area -->
      <main class="flex-1 min-w-0 bg-white">
        <!-- Header Section -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Three Column Layout</h1>
                <p class="mt-1 text-sm text-gray-600">Left sidebar + Center content + Right widgets</p>
              </div>
              <div class="flex space-x-2">
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors">
                  <i class="fas fa-plus mr-1"></i>New
                </button>
                <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors">
                  <i class="fas fa-filter mr-1"></i>Filter
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="p-6">
          <!-- Stats Bar -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-blue-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">2,543</div>
              <div class="text-sm text-blue-600">Total Items</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-green-600">1,234</div>
              <div class="text-sm text-green-600">Active</div>
            </div>
            <div class="bg-yellow-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-yellow-600">56</div>
              <div class="text-sm text-yellow-600">Pending</div>
            </div>
            <div class="bg-red-50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-red-600">7</div>
              <div class="text-sm text-red-600">Issues</div>
            </div>
          </div>

          <!-- Main Chart/Content Area -->
          <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Main Content Area</h3>
              <div class="flex space-x-2">
                <button class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">Live</button>
                <button class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">1H</button>
                <button class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">1D</button>
              </div>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 text-center">
              <i class="fas fa-chart-area text-4xl text-blue-500 mb-4"></i>
              <p class="text-gray-600 text-lg">Primary Content/Chart Area</p>
              <p class="text-sm text-gray-500">Main focus content goes here</p>
            </div>
          </div>

          <!-- Content Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Recent Activity</h4>
              <div class="space-y-3">
                <div v-for="i in 5" :key="i" class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-gray-500 text-xs"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900">User {{ i }} performed action</p>
                    <p class="text-xs text-gray-500">{{ Math.floor(Math.random() * 60) }} minutes ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h4 class="font-semibold text-gray-900 mb-3">Performance</h4>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Response Time</span>
                  <span class="text-sm font-medium">245ms</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Uptime</span>
                  <span class="text-sm font-medium">99.9%</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Error Rate</span>
                  <span class="text-sm font-medium">0.1%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Table -->
          <div class="mt-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-200">
              <h4 class="font-semibold text-gray-900">Data Records</h4>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="i in 8" :key="i" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">#{{ 1000 + i }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">Item {{ i }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-500">2025-10-08</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <!-- Right Sidebar -->
      <aside class="w-72 bg-white shadow-sm border-l border-gray-200 flex-shrink-0">
        <div class="p-4">
          <!-- System Info -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">System Info</h3>
            <div class="bg-green-50 rounded-lg p-3">
              <div class="flex items-center mb-2">
                <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span class="text-sm font-medium text-green-800">All Systems Operational</span>
              </div>
              <div class="text-xs text-green-600 space-y-1">
                <div>• Database: Online</div>
                <div>• API: Online</div>
                <div>• Storage: 15% used</div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div class="space-y-2">
              <button class="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded text-sm text-blue-700 font-medium">
                <i class="fas fa-plus mr-2"></i>Add Record
              </button>
              <button class="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm text-gray-700">
                <i class="fas fa-download mr-2"></i>Export Data
              </button>
              <button class="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm text-gray-700">
                <i class="fas fa-refresh mr-2"></i>Refresh
              </button>
            </div>
          </div>

          <!-- Notifications -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Notifications</h3>
            <div class="space-y-3">
              <div v-for="i in 3" :key="i" class="flex items-start space-x-2 p-2 border border-gray-200 rounded">
                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i class="fas fa-info text-blue-600 text-xs"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-gray-900">Notification {{ i }}</p>
                  <p class="text-xs text-gray-500">Short message here...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Users -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Recent Users</h3>
            <div class="space-y-2">
              <div v-for="i in 4" :key="i" class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span class="text-xs font-semibold text-white">U{{ i }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">User {{ i }}</p>
                  <p class="text-xs text-gray-500">Active now</p>
                </div>
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Calendar Widget -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Calendar</h3>
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900">08</div>
                <div class="text-sm text-gray-600">October 2025</div>
                <div class="text-xs text-gray-500 mt-2">Tuesday</div>
              </div>
              <div class="mt-3 space-y-1">
                <div class="text-xs text-gray-600">• Meeting at 2:00 PM</div>
                <div class="text-xs text-gray-600">• Report due 5:00 PM</div>
              </div>
            </div>
          </div>

          <!-- Resource Monitor -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Resources</h3>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span>CPU</span><span>34%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div class="bg-blue-600 h-1.5 rounded-full w-[34%]"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span>Memory</span><span>67%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div class="bg-green-600 h-1.5 rounded-full w-[67%]"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span>Storage</span><span>23%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div class="bg-yellow-600 h-1.5 rounded-full w-[23%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import { ErpBreadcrumb } from '../../../ui-kit'

export default {
  name: 'DummyThreeColumnTemplate',
  
  components: {
    ErpBreadcrumb
  },
  
  data() {
    return {
      breadcrumbNav: [
        { name: 'Home', path: '/', icon: 'fas fa-home' },
        { name: 'Dummy Module', path: '/dummy', icon: 'fas fa-cube' },
        { name: 'Three Column Template' }
      ]
    }
  }
}
</script>

<style scoped>
/* Responsive adjustments */
@media (max-width: 1536px) {
  aside:last-child {
    width: 16rem; /* w-64 */
  }
}

@media (max-width: 1280px) {
  aside:last-child {
    display: none;
  }
}

@media (max-width: 1024px) {
  aside:first-child {
    display: none;
  }
}
</style>