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
              <span class="text-gray-900 font-medium">Quality Review & Enhancement</span>
            </nav>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">ตรวจสอบและปรับปรุงความรู้</h1>
            <p class="text-gray-600">AI ช่วยตรวจสอบคุณภาพ ความถูกต้อง และเสนอแนะการปรับปรุงเนื้อหา</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-2xl font-bold text-gray-900">94.2%</p>
              <p class="text-sm text-gray-500">Quality Score</p>
            </div>
            <div class="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-clipboard-check text-2xl text-amber-600"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Dashboard -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center">
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">ผ่านการตรวจสอบ</p>
              <p class="text-2xl font-bold text-gray-900">2,692</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center">
            <div class="bg-amber-100 p-3 rounded-lg">
              <i class="fas fa-exclamation-triangle text-amber-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">ต้องปรับปรุง</p>
              <p class="text-2xl font-bold text-gray-900">155</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <i class="fas fa-times-circle text-white text-xl"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-red-600">23</p>
              <p class="text-sm text-gray-600">มีปัญหา</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-lg p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <i class="fas fa-robot text-white text-xl"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-purple-600">94.2%</p>
              <p class="text-sm text-gray-600">AI Confidence</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- Main Review Panel -->
        <div class="xl:col-span-2 space-y-8">
          <!-- Quality Issues -->
          <div class="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <i class="fas fa-search text-white"></i>
                  </div>
                  ประเด็นที่ต้องตรวจสอบ
                </h2>
                <div class="flex gap-2">
                  <select class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option>ทุกประเภท</option>
                    <option>เนื้อหาซ้ำ</option>
                    <option>ข้อมูลล้าสมัย</option>
                    <option>คุณภาพต่ำ</option>
                  </select>
                  <select class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option>ความสำคัญสูง</option>
                    <option>ทั้งหมด</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="divide-y divide-gray-200">
              <!-- Critical Issue -->
              <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-exclamation-triangle text-white"></i>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="font-bold text-gray-900">เนื้อหาขัดแย้งกันในเอกสาร</h3>
                      <span class="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Critical</span>
                    </div>
                    <p class="text-gray-600 mb-3">พบข้อมูลทางการเงินที่ขัดแย้งกันในรายงาน Q3 และ Q4 เรื่องรายได้จากการขาย</p>
                    
                    <div class="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 class="font-semibold text-gray-900 mb-2">เอกสารที่เกี่ยวข้อง:</h4>
                      <div class="space-y-2">
                        <div class="flex items-center gap-3 text-sm">
                          <i class="fas fa-file-pdf text-red-500"></i>
                          <span>รายงานการเงิน Q3-2024.pdf</span>
                          <span class="text-gray-500">• รายได้ 15.2M</span>
                        </div>
                        <div class="flex items-center gap-3 text-sm">
                          <i class="fas fa-file-pdf text-red-500"></i>
                          <span>รายงานการเงิน Q4-2024.pdf</span>
                          <span class="text-gray-500">• รายได้ 14.8M (ขัดแย้ง)</span>
                        </div>
                      </div>
                    </div>

                    <div class="bg-blue-50 rounded-lg p-4 mb-4">
                      <div class="flex items-start gap-3">
                        <i class="fas fa-lightbulb text-blue-600 mt-1"></i>
                        <div>
                          <h5 class="font-semibold text-blue-900 mb-1">คำแนะนำจาก AI:</h5>
                          <p class="text-sm text-blue-800">ควรตรวจสอบข้อมูลต้นฉบับและปรับปรุงให้สอดคล้องกัน หรือเพิ่มหมายเหตุอธิบาย</p>
                        </div>
                      </div>
                    </div>

                    <div class="flex gap-3">
                      <button class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                        <i class="fas fa-edit mr-2"></i>แก้ไข
                      </button>
                      <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <i class="fas fa-eye mr-2"></i>ดูรายละเอียด
                      </button>
                      <button class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                        <i class="fas fa-check mr-2"></i>ทำเครื่องหมายแก้แล้ว
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Duplicate Content -->
              <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-copy text-white"></i>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="font-bold text-gray-900">เนื้อหาที่ซ้ำกัน</h3>
                      <span class="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Medium</span>
                    </div>
                    <p class="text-gray-600 mb-3">พบเนื้อหาที่คล้ายกัน 87% ในเอกสาร 3 ไฟล์เกี่ยวกับนโยบายการลา</p>
                    
                    <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span><i class="fas fa-percentage mr-1"></i>87% Similarity</span>
                      <span><i class="fas fa-files mr-1"></i>3 Documents</span>
                      <span><i class="fas fa-clock mr-1"></i>Last updated 2 weeks ago</span>
                    </div>

                    <div class="flex gap-3">
                      <button class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                        <i class="fas fa-compress-alt mr-2"></i>รวมเอกสาร
                      </button>
                      <button class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                        <i class="fas fa-eye mr-2"></i>เปรียบเทียบ
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Outdated Content -->
              <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-clock text-white"></i>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="font-bold text-gray-900">เนื้อหาล้าสมัย</h3>
                      <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Low</span>
                    </div>
                    <p class="text-gray-600 mb-3">เอกสารคู่มือ IT Support มีการอัพเดทครั้งสุดท้ายเมื่อ 8 เดือนที่แล้ว</p>
                    
                    <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span><i class="fas fa-calendar mr-1"></i>Last updated: 8 months ago</span>
                      <span><i class="fas fa-eye mr-1"></i>High view count: 1,234</span>
                    </div>

                    <div class="flex gap-3">
                      <button class="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                        <i class="fas fa-sync mr-2"></i>ส่งแจ้งเตือนอัพเดท
                      </button>
                      <button class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                        <i class="fas fa-archive mr-2"></i>เก็บถาวร
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Enhancement Suggestions -->
          <div class="bg-white rounded-3xl shadow-xl p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <i class="fas fa-magic text-white"></i>
              </div>
              ข้อเสนอแนะการปรับปรุงจาก AI
            </h2>

            <div class="space-y-6">
              <div class="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-lightbulb text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-purple-900 mb-2">สร้าง Knowledge Graph</h3>
                    <p class="text-purple-800 mb-3">AI แนะนำให้สร้าง Knowledge Graph เชื่อมโยงข้อมูลระหว่างเอกสารเพื่อให้เข้าใจบริบทได้ดีขึ้น</p>
                    <button class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm">
                      <i class="fas fa-project-diagram mr-2"></i>สร้าง Graph
                    </button>
                  </div>
                </div>
              </div>

              <div class="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-tags text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-emerald-900 mb-2">ปรับปรุงการจัดหมวดหมู่</h3>
                    <p class="text-emerald-800 mb-3">พบ 23 เอกสารที่จัดหมวดหมู่ไม่เหมาะสม AI แนะนำการจัดกลุ่มใหม่</p>
                    <button class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm">
                      <i class="fas fa-sitemap mr-2"></i>ปรับหมวดหมู่
                    </button>
                  </div>
                </div>
              </div>

              <div class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <div class="flex items-start gap-4">
                  <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-compress text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-blue-900 mb-2">สร้าง Executive Summary</h3>
                    <p class="text-blue-800 mb-3">AI สามารถสร้างสรุปสำหรับผู้บริหารจากเอกสารรายงานยาวๆ เพื่อให้อ่านง่ายขึ้น</p>
                    <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                      <i class="fas fa-file-alt mr-2"></i>สร้างสรุป
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="xl:col-span-1 space-y-6">
          <!-- Quality Metrics -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fas fa-chart-line text-amber-500"></i>
              Quality Metrics
            </h3>
            
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Content Accuracy</span>
                  <span class="font-semibold text-emerald-600">96.3%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-emerald-500 h-full rounded-full" style="width: 96.3%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Information Freshness</span>
                  <span class="font-semibold text-yellow-600">78.5%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-yellow-500 h-full rounded-full" style="width: 78.5%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Content Completeness</span>
                  <span class="font-semibold text-blue-600">92.1%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-500 h-full rounded-full" style="width: 92.1%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>Consistency Score</span>
                  <span class="font-semibold text-purple-600">89.7%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-purple-500 h-full rounded-full" style="width: 89.7%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Review Schedule -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fas fa-calendar-check text-indigo-500"></i>
              Review Schedule
            </h3>
            
            <div class="space-y-3">
              <div class="p-3 bg-red-50 rounded-lg border border-red-200">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-red-900">Overdue Reviews</span>
                  <span class="text-sm font-bold text-red-600">8 items</span>
                </div>
                <p class="text-xs text-red-700">ต้องตรวจสอบด่วน</p>
              </div>

              <div class="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-yellow-900">Due This Week</span>
                  <span class="text-sm font-bold text-yellow-600">15 items</span>
                </div>
                <p class="text-xs text-yellow-700">กำหนดสัปดาห์นี้</p>
              </div>

              <div class="p-3 bg-green-50 rounded-lg border border-green-200">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-green-900">Up to Date</span>
                  <span class="text-sm font-bold text-green-600">2,692 items</span>
                </div>
                <p class="text-xs text-green-700">เป็นปัจจุบัน</p>
              </div>
            </div>
          </div>

          <!-- AI Review Tools -->
          <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-indigo-100">
            <h3 class="font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <i class="fas fa-robot text-indigo-600"></i>
              AI Review Tools
            </h3>
            
            <div class="space-y-3">
              <button class="w-full p-3 bg-white text-left rounded-lg border border-indigo-200 hover:border-indigo-400 transition-colors">
                <div class="flex items-center gap-3">
                  <i class="fas fa-search-plus text-indigo-500"></i>
                  <div>
                    <p class="font-medium text-gray-900 text-sm">Deep Content Analysis</p>
                    <p class="text-xs text-gray-600">วิเคราะห์เนื้อหาเชิงลึก</p>
                  </div>
                </div>
              </button>

              <button class="w-full p-3 bg-white text-left rounded-lg border border-indigo-200 hover:border-indigo-400 transition-colors">
                <div class="flex items-center gap-3">
                  <i class="fas fa-spell-check text-emerald-500"></i>
                  <div>
                    <p class="font-medium text-gray-900 text-sm">Grammar & Style Check</p>
                    <p class="text-xs text-gray-600">ตรวจไวยากรณ์และรูปแบบ</p>
                  </div>
                </div>
              </button>

              <button class="w-full p-3 bg-white text-left rounded-lg border border-indigo-200 hover:border-indigo-400 transition-colors">
                <div class="flex items-center gap-3">
                  <i class="fas fa-link text-purple-500"></i>
                  <div>
                    <p class="font-medium text-gray-900 text-sm">Cross-Reference Check</p>
                    <p class="text-xs text-gray-600">ตรวจสอบการอ้างอิง</p>
                  </div>
                </div>
              </button>

              <button class="w-full p-3 bg-white text-left rounded-lg border border-indigo-200 hover:border-indigo-400 transition-colors">
                <div class="flex items-center gap-3">
                  <i class="fas fa-balance-scale text-amber-500"></i>
                  <div>
                    <p class="font-medium text-gray-900 text-sm">Bias Detection</p>
                    <p class="text-xs text-gray-600">ตรวจจับความลำเอียง</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fas fa-bolt text-yellow-500"></i>
              Quick Actions
            </h3>
            
            <div class="space-y-3">
              <button class="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                <i class="fas fa-magic mr-2"></i>
                Auto-Fix Issues
              </button>
              <button class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <i class="fas fa-download mr-2"></i>
                Export Report
              </button>
              <button class="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                <i class="fas fa-cog mr-2"></i>
                Review Settings
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
  name: 'KnowledgeReview',
  data() {
    return {
      qualityScore: 94.2,
      issues: {
        critical: 23,
        medium: 87,
        low: 45
      }
    }
  }
}
</script>

<style scoped>
.quality-meter {
  background: conic-gradient(#10b981 0deg 340deg, #e5e7eb 340deg 360deg);
}
</style>