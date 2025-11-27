<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <nav class="flex items-center gap-2 text-gray-500 mb-4 text-sm">
              <router-link to="/ai/knowledge-base" class="hover:text-gray-700 transition-colors">Knowledge Base</router-link>
              <i class="fas fa-chevron-right text-xs"></i>
              <span class="text-gray-900 font-medium">Analytics & Insights</span>
            </nav>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">วิเคราะห์การใช้งานและข้อมูลเชิงลึก</h1>
            <p class="text-gray-600">รายงานการใช้งานแบบเรียลไทม์ พร้อมข้อเสนอแนะจาก AI Analytics</p>
          </div>
          <div class="flex items-center gap-4">
            <select class="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>This month</option>
              <option>This year</option>
            </select>
            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              <i class="fas fa-download mr-2"></i>Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center">
            <div class="bg-blue-100 p-3 rounded-lg">
              <i class="fas fa-search text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">การค้นหาทั้งหมด</p>
              <p class="text-2xl font-bold text-gray-900">15,247</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-green-500 text-sm font-medium">+12.5%</span>
            <span class="text-gray-600 text-sm ml-1">เมื่อเทียบกับเดือนที่แล้ว</span>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center">
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="fas fa-eye text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">การเข้าดูเอกสาร</p>
              <p class="text-2xl font-bold text-gray-900">43,526</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-green-500 text-sm font-medium">+8.3%</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">89,432</h3>
          <p class="text-gray-600">การเข้าชมเอกสาร</p>
          <div class="mt-2 text-xs text-gray-500">มีการเข้าชมเพิ่มขึ้น</div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <i class="fas fa-users text-white text-xl"></i>
            </div>
            <span class="text-sm text-emerald-600 font-medium">+5.7%</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">1,234</h3>
          <p class="text-gray-600">ผู้ใช้งานที่ใช้งานจริง</p>
          <div class="mt-2 text-xs text-gray-500">ผู้ใช้เพิ่มขึ้นต่อเนื่อง</div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <i class="fas fa-clock text-white text-xl"></i>
            </div>
            <span class="text-sm text-red-600 font-medium">-0.3s</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">1.7s</h3>
          <p class="text-gray-600">เวลาตอบสนองเฉลี่ย</p>
          <div class="mt-2 text-xs text-gray-500">ปรับปรุงได้ดีขึ้น</div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- Main Analytics -->
        <div class="xl:col-span-2 space-y-8">
          <!-- Usage Trends Chart -->
          <div class="bg-white rounded-3xl shadow-xl p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900">แนวโน้มการใช้งาน</h2>
              <div class="flex gap-2">
                <button class="px-3 py-1 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium">Searches</button>
                <button class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">Views</button>
                <button class="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">Downloads</button>
              </div>
            </div>

            <!-- Mock Chart Area -->
            <div class="h-80 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 flex items-center justify-center border border-pink-100">
              <div class="text-center">
                <div class="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-chart-line text-white text-2xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Interactive Analytics Chart</h3>
                <p class="text-gray-600 mb-4">แสดงกราฟการใช้งานแบบโต้ตอบได้ด้วย Chart.js หรือ D3.js</p>
                <div class="flex justify-center gap-4 text-sm text-gray-500">
                  <span>📈 Trending up 12.5%</span>
                  <span>👥 1,234 active users</span>
                  <span>🔍 15K searches</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Content -->
          <div class="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">เนื้อหายอดนิยม</h2>
              <p class="text-gray-600">เอกสารที่มีการเข้าชมมากที่สุด</p>
            </div>

            <div class="divide-y divide-gray-200">
              <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="text-2xl font-bold text-pink-600">#1</div>
                  <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <i class="fas fa-file-pdf text-white"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-900">รายงานการเงินประจำปี 2025</h3>
                    <p class="text-sm text-gray-600">Financial Report • การเงิน</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-bold text-gray-900">12,456</p>
                    <p class="text-sm text-gray-500">views</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-emerald-600 font-medium">+23.5%</p>
                    <p class="text-xs text-gray-500">vs last month</p>
                  </div>
                </div>
              </div>

              <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="text-2xl font-bold text-pink-600">#2</div>
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <i class="fas fa-file-word text-white"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-900">คู่มือพนักงานใหม่ 2025</h3>
                    <p class="text-sm text-gray-600">Employee Handbook • HR</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-bold text-gray-900">8,932</p>
                    <p class="text-sm text-gray-500">views</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-emerald-600 font-medium">+45.2%</p>
                    <p class="text-xs text-gray-500">vs last month</p>
                  </div>
                </div>
              </div>

              <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="text-2xl font-bold text-pink-600">#3</div>
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <i class="fas fa-file-powerpoint text-white"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-gray-900">กลยุทธ์การตลาดดิจิทัล Q2</h3>
                    <p class="text-sm text-gray-600">Marketing Strategy • การตลาด</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-bold text-gray-900">6,721</p>
                    <p class="text-sm text-gray-500">views</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-emerald-600 font-medium">+12.8%</p>
                    <p class="text-xs text-gray-500">vs last month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Search Analytics -->
          <div class="bg-white rounded-3xl shadow-xl p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">การวิเคราะห์คำค้นหา</h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Top Search Terms -->
              <div>
                <h3 class="font-bold text-gray-900 mb-4">คำค้นหายอดนิยม</h3>
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span class="font-medium">รายงานการเงิน</span>
                    <div class="flex items-center gap-2">
                      <div class="w-20 h-2 bg-gray-200 rounded-full">
                        <div class="bg-pink-500 h-full rounded-full" style="width: 85%"></div>
                      </div>
                      <span class="text-sm text-gray-600">1,234</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span class="font-medium">นโยบายบริษัท</span>
                    <div class="flex items-center gap-2">
                      <div class="w-20 h-2 bg-gray-200 rounded-full">
                        <div class="bg-pink-500 h-full rounded-full" style="width: 72%"></div>
                      </div>
                      <span class="text-sm text-gray-600">987</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span class="font-medium">การตลาดดิจิทัล</span>
                    <div class="flex items-center gap-2">
                      <div class="w-20 h-2 bg-gray-200 rounded-full">
                        <div class="bg-pink-500 h-full rounded-full" style="width: 68%"></div>
                      </div>
                      <span class="text-sm text-gray-600">876</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Search Success Rate -->
              <div>
                <h3 class="font-bold text-gray-900 mb-4">ประสิทธิภาพการค้นหา</h3>
                <div class="space-y-4">
                  <div class="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div class="text-3xl font-bold text-emerald-600 mb-1">94.7%</div>
                    <div class="text-sm text-emerald-800">Success Rate</div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="text-center p-3 bg-blue-50 rounded-lg">
                      <div class="text-xl font-bold text-blue-600">1.7s</div>
                      <div class="text-xs text-blue-800">Avg Response</div>
                    </div>
                    <div class="text-center p-3 bg-purple-50 rounded-lg">
                      <div class="text-xl font-bold text-purple-600">98.2%</div>
                      <div class="text-xs text-purple-800">AI Accuracy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="xl:col-span-1 space-y-6">
          <!-- Real-time Activity -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Real-time Activity
            </h3>
            
            <div class="space-y-3">
              <div class="flex items-center gap-3 text-sm">
                <i class="fas fa-search text-blue-500"></i>
                <span class="text-gray-600">ค้นหา "รายงาน Q4"</span>
                <span class="text-xs text-gray-400 ml-auto">now</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <i class="fas fa-download text-emerald-500"></i>
                <span class="text-gray-600">ดาวน์โหลด budget.xlsx</span>
                <span class="text-xs text-gray-400 ml-auto">2m</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <i class="fas fa-eye text-purple-500"></i>
                <span class="text-gray-600">เปิดดูคู่มือพนักงาน</span>
                <span class="text-xs text-gray-400 ml-auto">3m</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <i class="fas fa-upload text-orange-500"></i>
                <span class="text-gray-600">อัพโหลด policy.pdf</span>
                <span class="text-xs text-gray-400 ml-auto">5m</span>
              </div>
            </div>
          </div>

          <!-- User Engagement -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="font-bold text-gray-900 mb-4">User Engagement</h3>
            
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Daily Active Users</span>
                  <span class="font-semibold">324</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-500 h-full rounded-full" style="width: 78%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Session Duration</span>
                  <span class="font-semibold">8.5 min</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-emerald-500 h-full rounded-full" style="width: 85%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Return Rate</span>
                  <span class="font-semibold">67.3%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-purple-500 h-full rounded-full" style="width: 67%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Insights -->
          <div class="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl shadow-lg p-6 border border-pink-100">
            <h3 class="font-bold text-pink-900 mb-4 flex items-center gap-2">
              <i class="fas fa-lightbulb text-pink-600"></i>
              AI Insights
            </h3>
            
            <div class="space-y-4">
              <div class="p-4 bg-white rounded-lg border border-pink-200">
                <h4 class="font-semibold text-pink-900 mb-2">📈 Trending Topic</h4>
                <p class="text-sm text-pink-800">"Digital Transformation" มีการค้นหาเพิ่มขึ้น 145% ในสัปดาห์นี้</p>
              </div>

              <div class="p-4 bg-white rounded-lg border border-pink-200">
                <h4 class="font-semibold text-pink-900 mb-2">🎯 Recommendation</h4>
                <p class="text-sm text-pink-800">ควรเพิ่มเนื้อหาเกี่ยวกับ "Remote Work Policy" เนื่องจากมีการค้นหาสูง</p>
              </div>

              <div class="p-4 bg-white rounded-lg border border-pink-200">
                <h4 class="font-semibold text-pink-900 mb-2">⚡ Performance Alert</h4>
                <p class="text-sm text-pink-800">เวลาค้นหาปรับปรุงขึ้น 23% หลังจากการปรับแต่ง AI Algorithm</p>
              </div>
            </div>
          </div>

          <!-- Export Options -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="font-bold text-gray-900 mb-4">Export Reports</h3>
            
            <div class="space-y-3">
              <button class="w-full px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-left">
                <div class="flex items-center gap-3">
                  <i class="fas fa-chart-line"></i>
                  <div>
                    <p class="font-medium">Analytics Dashboard</p>
                    <p class="text-xs opacity-90">PDF Report</p>
                  </div>
                </div>
              </button>

              <button class="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-left">
                <div class="flex items-center gap-3">
                  <i class="fas fa-table"></i>
                  <div>
                    <p class="font-medium">Usage Data</p>
                    <p class="text-xs opacity-90">Excel Export</p>
                  </div>
                </div>
              </button>

              <button class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-left">
                <div class="flex items-center gap-3">
                  <i class="fas fa-search"></i>
                  <div>
                    <p class="font-medium">Search Analytics</p>
                    <p class="text-xs opacity-90">JSON Data</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeAnalytics',
  data() {
    return {
      timeRange: 'last30days',
      metrics: {
        searches: 15247,
        views: 89432,
        users: 1234,
        responseTime: 1.7
      }
    }
  }
}
</script>

<style scoped>
.metric-card {
  transition: transform 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
}
</style>