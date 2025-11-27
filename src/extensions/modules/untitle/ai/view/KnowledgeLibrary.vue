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
              <span class="text-gray-900 font-medium">Document Library</span>
            </nav>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">คลังเอกสารดิจิทัล</h1>
            <p class="text-gray-600">จัดเก็บ ค้นหา และจัดการเอกสารทุกรูปแบบด้วย AI</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <i class="fas fa-database"></i>
                <span>ขนาดไลบรารี: <strong>2.4 TB</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search & Filters -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- AI-Powered Search -->
          <div class="flex-1">
            <div class="relative">
              <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="ค้นหาด้วย AI Semantic Search... (เช่น: กลยุทธ์การขาย, รายงานประจำปี)" 
                class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
                v-model="searchQuery"
              />
              <div class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">AI</span>
                <button class="p-1 text-emerald-500 hover:bg-emerald-50 rounded">
                  <i class="fas fa-microphone"></i>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Filter Buttons -->
          <div class="flex gap-2 flex-wrap">
            <select class="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>ทุกประเภทไฟล์</option>
              <option>PDF</option>
              <option>Word</option>
              <option>Excel</option>
              <option>PowerPoint</option>
            </select>
            <select class="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>ทุกหมวดหมู่</option>
              <option>การเงิน</option>
              <option>การตลาด</option>
              <option>เทคโนโลยี</option>
            </select>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <i class="fas fa-filter mr-2"></i>กรองผล
            </button>
          </div>
        </div>

        <!-- AI Search Suggestions -->
        <div class="mt-4 flex flex-wrap gap-2">
          <span class="text-sm text-gray-600">คำแนะนำการค้นหา:</span>
          <button @click="searchQuery = 'รายงานทางการเงินประจำปี'" class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
            รายงานทางการเงินประจำปี
          </button>
          <button @click="searchQuery = 'กลยุทธ์การตลาดดิจิทัล'" class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
            กลยุทธ์การตลาดดิจิทัล
          </button>
          <button @click="searchQuery = 'นโยบายทรัพยากรมนุษย์'" class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
            นโยบายทรัพยากรมนุษย์
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Stats & Categories -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Quick Stats -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 class="font-bold text-gray-900 mb-4">สถิติคลังเอกสาร</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <i class="fas fa-file-pdf text-red-500"></i>
                  <span class="text-sm">PDF</span>
                </div>
                <span class="text-sm font-semibold">1,245</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <i class="fas fa-file-word text-blue-500"></i>
                  <span class="text-sm">Word</span>
                </div>
                <span class="text-sm font-semibold">823</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <i class="fas fa-file-excel text-green-500"></i>
                  <span class="text-sm">Excel</span>
                </div>
                <span class="text-sm font-semibold">456</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <i class="fas fa-file-powerpoint text-orange-500"></i>
                  <span class="text-sm">PowerPoint</span>
                </div>
                <span class="text-sm font-semibold">323</span>
              </div>
            </div>
          </div>

          <!-- Recent Uploads -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fas fa-clock text-blue-500"></i>
              อัพโหลดล่าสุด
            </h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <i class="fas fa-file-pdf text-red-500"></i>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">รายงานประจำปี 2025</p>
                  <p class="text-xs text-gray-500">2 ชั่วโมงที่แล้ว</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <i class="fas fa-file-word text-blue-500"></i>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">แผนการตลาด Q1</p>
                  <p class="text-xs text-gray-500">5 ชั่วโมงที่แล้ว</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <i class="fas fa-file-excel text-green-500"></i>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">Budget Analysis</p>
                  <p class="text-xs text-gray-500">1 วันที่แล้ว</p>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Insights -->
          <div class="bg-blue-50 rounded-xl shadow-sm p-6 border border-blue-100">
            <h3 class="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <i class="fas fa-lightbulb text-blue-600"></i>
              AI Insights
            </h3>
            <div class="space-y-3">
              <div class="p-3 bg-white rounded-lg border border-blue-200">
                <p class="text-sm font-medium text-blue-900">มีเอกสารที่ซ้ำกัน</p>
                <p class="text-xs text-blue-700">พบ 5 ไฟล์ที่มีเนื้อหาคล้ายกัน</p>
              </div>
              <div class="p-3 bg-white rounded-lg border border-blue-200">
                <p class="text-sm font-medium text-blue-900">เนื้อหาล้าสมัย</p>
                <p class="text-xs text-blue-700">18 เอกสารต้องการอัพเดท</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Document Grid -->
        <div class="lg:col-span-3">
          <!-- View Options -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <h2 class="text-xl font-bold text-gray-900">เอกสารทั้งหมด (2,847 ไฟล์)</h2>
              <div class="flex gap-1">
                <button :class="viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'" 
                        @click="viewMode = 'grid'" 
                        class="p-2 rounded-lg transition-colors">
                  <i class="fas fa-th-large"></i>
                </button>
                <button :class="viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'" 
                        @click="viewMode = 'list'" 
                        class="p-2 rounded-lg transition-colors">
                  <i class="fas fa-list"></i>
                </button>
              </div>
            </div>
            <select class="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>เรียงตามวันที่</option>
              <option>เรียงตามชื่อ</option>
              <option>เรียงตามขนาด</option>
              <option>เรียงตามความเกี่ยวข้อง</option>
            </select>
          </div>

          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <!-- Document Card 1 -->
            <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 cursor-pointer border border-gray-100 group">
              <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-file-pdf text-red-600 text-xl"></i>
                </div>
                <div class="flex gap-1">
                  <button class="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <i class="fas fa-download"></i>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <i class="fas fa-share"></i>
                  </button>
                </div>
              </div>
              
              <h3 class="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">รายงานการเงินประจำปี 2025</h3>
              <p class="text-sm text-gray-600 mb-3">รายงานสถานะทางการเงินและผลประกอบการ สำหรับปี 2025 พร้อมการวิเคราะห์แนวโน้ม</p>
              
              <div class="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span><i class="fas fa-calendar mr-1"></i>15 ม.ค. 2025</span>
                <span><i class="fas fa-file mr-1"></i>2.3 MB</span>
                <span><i class="fas fa-eye mr-1"></i>234 views</span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex gap-1">
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">การเงิน</span>
                  <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">รายงาน</span>
                </div>
                <div class="flex items-center gap-1 text-xs text-blue-600">
                  <i class="fas fa-robot"></i>
                  <span>AI: 97%</span>
                </div>
              </div>
            </div>

            <!-- Document Card 2 -->
            <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 cursor-pointer border border-gray-100 group">
              <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-file-word text-blue-600 text-xl"></i>
                </div>
                <div class="flex gap-1">
                  <button class="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <i class="fas fa-download"></i>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <i class="fas fa-share"></i>
                  </button>
                </div>
              </div>
              
              <h3 class="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">แผนกลยุทธ์การตลาดดิจิทัล</h3>
              <p class="text-sm text-gray-600 mb-3">แผนการดำเนินงานการตลาดดิจิทัลสำหรับ Q2 2025 รวมถึง SEO, Social Media และ Content Marketing</p>
              
              <div class="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span><i class="fas fa-calendar mr-1"></i>12 ม.ค. 2025</span>
                <span><i class="fas fa-file mr-1"></i>1.8 MB</span>
                <span><i class="fas fa-eye mr-1"></i>156 views</span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex gap-1">
                  <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">การตลาด</span>
                  <span class="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">กลยุทธ์</span>
                </div>
                <div class="flex items-center gap-1 text-xs text-blue-600">
                  <i class="fas fa-robot"></i>
                  <span>AI: 94%</span>
                </div>
              </div>
            </div>

            <!-- Document Card 3 -->
            <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 cursor-pointer border border-gray-100 group">
              <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-file-excel text-green-600 text-xl"></i>
                </div>
                <div class="flex gap-1">
                  <button class="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <i class="fas fa-download"></i>
                  </button>
                  <button class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <i class="fas fa-share"></i>
                  </button>
                </div>
              </div>
              
              <h3 class="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">วิเคราะห์งบประมาณ Q1 2025</h3>
              <p class="text-sm text-gray-600 mb-3">การวิเคราะห์การใช้งบประมาณในไตรมาสแรกของปี 2025 พร้อมคาดการณ์แนวโน้ม</p>
              
              <div class="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span><i class="fas fa-calendar mr-1"></i>10 ม.ค. 2025</span>
                <span><i class="fas fa-file mr-1"></i>856 KB</span>
                <span><i class="fas fa-eye mr-1"></i>89 views</span>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex gap-1">
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">การเงิน</span>
                  <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">วิเคราะห์</span>
                </div>
                <div class="flex items-center gap-1 text-xs text-blue-600">
                  <i class="fas fa-robot"></i>
                  <span>AI: 96%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-left p-4 font-semibold text-gray-700">Document</th>
                  <th class="text-left p-4 font-semibold text-gray-700">Size</th>
                  <th class="text-left p-4 font-semibold text-gray-700">Modified</th>
                  <th class="text-left p-4 font-semibold text-gray-700">AI Score</th>
                  <th class="text-left p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <i class="fas fa-file-pdf text-red-500 text-lg"></i>
                      <div>
                        <p class="font-semibold text-gray-900">รายงานการเงินประจำปี 2025</p>
                        <p class="text-sm text-gray-500">Financial Report for Year 2025</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 text-gray-600">2.3 MB</td>
                  <td class="p-4 text-gray-600">15 ม.ค. 2025</td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <div class="w-16 h-2 bg-gray-200 rounded-full">
                        <div class="w-[97%] h-full bg-blue-500 rounded-full"></div>
                      </div>
                      <span class="text-sm text-blue-600">97%</span>
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="flex gap-2">
                      <button class="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <i class="fas fa-download"></i>
                      </button>
                      <button class="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <i class="fas fa-share"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <i class="fas fa-file-word text-blue-500 text-lg"></i>
                      <div>
                        <p class="font-semibold text-gray-900">แผนกลยุทธ์การตลาดดิจิทัล</p>
                        <p class="text-sm text-gray-500">Digital Marketing Strategy Plan</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 text-gray-600">1.8 MB</td>
                  <td class="p-4 text-gray-600">12 ม.ค. 2025</td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <div class="w-16 h-2 bg-gray-200 rounded-full">
                        <div class="w-[94%] h-full bg-blue-500 rounded-full"></div>
                      </div>
                      <span class="text-sm text-blue-600">94%</span>
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="flex gap-2">
                      <button class="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <i class="fas fa-download"></i>
                      </button>
                      <button class="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <i class="fas fa-share"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-6">
            <p class="text-sm text-gray-600">
              แสดง <span class="font-semibold">1-12</span> จาก <span class="font-semibold">2,847</span> เอกสาร
            </p>
            <div class="flex gap-2">
              <button class="px-4 py-2 text-gray-600 hover:bg-white hover:shadow-md rounded-lg transition-all">
                <i class="fas fa-chevron-left mr-2"></i>ก่อนหน้า
              </button>
              <button class="px-4 py-2 bg-blue-500 text-white rounded-lg">1</button>
              <button class="px-4 py-2 text-gray-600 hover:bg-white hover:shadow-md rounded-lg transition-all">2</button>
              <button class="px-4 py-2 text-gray-600 hover:bg-white hover:shadow-md rounded-lg transition-all">3</button>
              <button class="px-4 py-2 text-gray-600 hover:bg-white hover:shadow-md rounded-lg transition-all">
                ถัดไป<i class="fas fa-chevron-right ml-2"></i>
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
  name: 'KnowledgeLibrary',
  data() {
    return {
      searchQuery: '',
      viewMode: 'grid'
    }
  }
}
</script>

<style scoped>
.document-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
</style>