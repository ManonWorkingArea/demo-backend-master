<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <nav class="flex items-center gap-2 text-gray-500 mb-2">
              <router-link to="/ai/knowledge-base" class="hover:text-gray-700 transition-colors">Knowledge Base</router-link>
              <i class="fas fa-chevron-right text-xs"></i>
              <span class="text-gray-900 font-medium">Categories Management</span>
            </nav>
            <h1 class="text-3xl font-bold text-gray-900">จัดการหมวดหมู่อัจฉริยะ</h1>
            <p class="mt-2 text-gray-600">ระบบจัดหมวดหมู่อัตโนมัติด้วย AI พร้อมการจัดกลุ่มแบบ Semantic</p>
          </div>
          <div class="flex space-x-3">
            <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
              <i class="fas fa-download mr-2"></i>
              Export Categories
            </button>
            <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <i class="fas fa-plus mr-2"></i>
              สร้างหมวดใหม่
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <!-- Category Tree Sidebar -->
        <div class="xl:col-span-1">
          <div class="bg-white rounded-xl shadow-sm p-6 sticky top-6 border border-gray-100">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fas fa-sitemap text-indigo-500"></i>
              Category Tree
            </h3>
            
            <!-- Search Categories -->
            <div class="relative mb-4">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="ค้นหาหมวดหมู่..." 
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                v-model="categorySearch"
              />
            </div>

            <!-- Tree Structure -->
            <div class="space-y-2 max-h-96 overflow-y-auto">
              <div class="category-tree">
                <!-- Business -->
                <div class="category-node">
                  <div @click="toggleCategory('business')" class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <i :class="expandedCategories.business ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" class="text-xs text-gray-400"></i>
                    <i class="fas fa-briefcase text-blue-500"></i>
                    <span class="text-sm font-medium">Business</span>
                    <span class="text-xs text-gray-500 ml-auto">1,245</span>
                  </div>
                  <div v-show="expandedCategories.business" class="ml-6 mt-1 space-y-1">
                    <div class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm">
                      <i class="fas fa-chart-line text-emerald-500"></i>
                      <span>การเงิน</span>
                      <span class="text-xs text-gray-500 ml-auto">847</span>
                    </div>
                    <div class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm">
                      <i class="fas fa-bullhorn text-purple-500"></i>
                      <span>การตลาด</span>
                      <span class="text-xs text-gray-500 ml-auto">398</span>
                    </div>
                  </div>
                </div>

                <!-- Technology -->
                <div class="category-node">
                  <div @click="toggleCategory('technology')" class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <i :class="expandedCategories.technology ? 'fas fa-chevron-down' : 'fas fa-chevron-right'" class="text-xs text-gray-400"></i>
                    <i class="fas fa-laptop-code text-blue-600"></i>
                    <span class="text-sm font-medium">Technology</span>
                    <span class="text-xs text-gray-500 ml-auto">1,234</span>
                  </div>
                  <div v-show="expandedCategories.technology" class="ml-6 mt-1 space-y-1">
                    <div class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm">
                      <i class="fab fa-js-square text-yellow-500"></i>
                      <span>Programming</span>
                      <span class="text-xs text-gray-500 ml-auto">567</span>
                    </div>
                    <div class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-sm">
                      <i class="fas fa-robot text-indigo-500"></i>
                      <span>AI & ML</span>
                      <span class="text-xs text-gray-500 ml-auto">667</span>
                    </div>
                  </div>
                </div>

                <!-- HR -->
                <div class="category-node">
                  <div class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <i class="fas fa-users text-green-500"></i>
                    <span class="text-sm font-medium">HR & People</span>
                    <span class="text-xs text-gray-500 ml-auto">368</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI Suggestions -->
            <div class="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <h4 class="text-sm font-semibold text-indigo-900 mb-2">🤖 AI Suggestions</h4>
              <p class="text-xs text-indigo-700">AI พบหมวดหมู่ใหม่ที่อาจเหมาะสม: "Digital Transformation", "Sustainability"</p>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="xl:col-span-3">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <i class="fas fa-folder text-white text-xl"></i>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">156</p>
                  <p class="text-sm text-gray-600">หมวดหมู่ทั้งหมด</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <i class="fas fa-tag text-white text-xl"></i>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">2,847</p>
                  <p class="text-sm text-gray-600">แท็กที่สร้างโดย AI</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg p-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <i class="fas fa-brain text-white text-xl"></i>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">97.3%</p>
                  <p class="text-sm text-gray-600">ความแม่นยำในการจัดหมวด</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Management Table -->
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-900">การจัดการหมวดหมู่</h2>
                <div class="flex gap-2">
                  <button class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <i class="fas fa-filter mr-2"></i>Filter
                  </button>
                  <button class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <i class="fas fa-sort mr-2"></i>Sort
                  </button>
                </div>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="text-left p-4 font-semibold text-gray-700">Category</th>
                    <th class="text-left p-4 font-semibold text-gray-700">Documents</th>
                    <th class="text-left p-4 font-semibold text-gray-700">AI Confidence</th>
                    <th class="text-left p-4 font-semibold text-gray-700">Last Updated</th>
                    <th class="text-left p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <i class="fas fa-chart-line text-white text-sm"></i>
                        </div>
                        <div>
                          <p class="font-semibold text-gray-900">การเงินและบัญชี</p>
                          <p class="text-sm text-gray-500">Financial & Accounting</p>
                        </div>
                      </div>
                    </td>
                    <td class="p-4">
                      <span class="text-gray-900 font-semibold">847</span>
                      <span class="text-sm text-emerald-600 ml-2">+23 วันนี้</span>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center gap-2">
                        <div class="w-24 h-2 bg-gray-200 rounded-full">
                          <div class="w-[96%] h-full bg-emerald-500 rounded-full"></div>
                        </div>
                        <span class="text-sm text-gray-600">96%</span>
                      </div>
                    </td>
                    <td class="p-4">
                      <span class="text-sm text-gray-600">2 ชั่วโมงที่แล้ว</span>
                    </td>
                    <td class="p-4">
                      <div class="flex gap-2">
                        <button class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <i class="fas fa-bullhorn text-white text-sm"></i>
                        </div>
                        <div>
                          <p class="font-semibold text-gray-900">การตลาดดิจิทัล</p>
                          <p class="text-sm text-gray-500">Digital Marketing</p>
                        </div>
                      </div>
                    </td>
                    <td class="p-4">
                      <span class="text-gray-900 font-semibold">623</span>
                      <span class="text-sm text-emerald-600 ml-2">+15 วันนี้</span>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center gap-2">
                        <div class="w-24 h-2 bg-gray-200 rounded-full">
                          <div class="w-[94%] h-full bg-emerald-500 rounded-full"></div>
                        </div>
                        <span class="text-sm text-gray-600">94%</span>
                      </div>
                    </td>
                    <td class="p-4">
                      <span class="text-sm text-gray-600">5 ชั่วโมงที่แล้ว</span>
                    </td>
                    <td class="p-4">
                      <div class="flex gap-2">
                        <button class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <i class="fas fa-robot text-white text-sm"></i>
                        </div>
                        <div>
                          <p class="font-semibold text-gray-900">ปัญญาประดิษฐ์</p>
                          <p class="text-sm text-gray-500">Artificial Intelligence</p>
                        </div>
                      </div>
                    </td>
                    <td class="p-4">
                      <span class="text-gray-900 font-semibold">667</span>
                      <span class="text-sm text-emerald-600 ml-2">+31 วันนี้</span>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center gap-2">
                        <div class="w-24 h-2 bg-gray-200 rounded-full">
                          <div class="w-[98%] h-full bg-emerald-500 rounded-full"></div>
                        </div>
                        <span class="text-sm text-gray-600">98%</span>
                      </div>
                    </td>
                    <td class="p-4">
                      <span class="text-sm text-gray-600">1 ชั่วโมงที่แล้ว</span>
                    </td>
                    <td class="p-4">
                      <div class="flex gap-2">
                        <button class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <i class="fas fa-eye"></i>
                        </button>
                        <button class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="p-6 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <p class="text-sm text-gray-600">
                  แสดง <span class="font-semibold">1-10</span> จาก <span class="font-semibold">156</span> หมวดหมู่
                </p>
                <div class="flex gap-2">
                  <button class="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button class="px-3 py-2 bg-indigo-500 text-white rounded-lg">1</button>
                  <button class="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">2</button>
                  <button class="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">3</button>
                  <button class="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeCategories',
  data() {
    return {
      categorySearch: '',
      expandedCategories: {
        business: true,
        technology: false,
        hr: false
      }
    }
  },
  methods: {
    toggleCategory(category) {
      this.expandedCategories[category] = !this.expandedCategories[category];
    }
  }
}
</script>

<style scoped>
.category-tree {
  font-size: 14px;
}

.category-node {
  margin-bottom: 4px;
}

table {
  font-size: 14px;
}
</style>