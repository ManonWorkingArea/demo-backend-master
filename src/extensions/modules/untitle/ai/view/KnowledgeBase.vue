<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">AI Knowledge Management System</h1>
            <p class="mt-2 text-gray-600">ระบบจัดการคลังความรู้อัจฉริยะที่ขับเคลื่อนด้วย AI</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm font-medium text-green-700">AI Processing Active</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600">
              <i class="fas fa-database"></i>
              <span class="text-sm font-medium">2,847 Documents Processed</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div class="flex items-center">
            <div class="bg-blue-100 p-3 rounded-lg">
              <i class="fas fa-file-alt text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">เอกสารทั้งหมด</p>
              <p class="text-2xl font-bold text-gray-900">2,847</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-blue-500 text-sm font-medium">+15%</span>
            <span class="text-gray-600 text-sm ml-1">from last month</span>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div class="flex items-center">
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="fas fa-folder text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">หมวดหมู่</p>
              <p class="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-green-500 text-sm font-medium">+8%</span>
            <span class="text-gray-600 text-sm ml-1">from last month</span>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div class="flex items-center">
            <div class="bg-purple-100 p-3 rounded-lg">
              <i class="fas fa-search text-purple-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">ความแม่นยำ AI</p>
              <p class="text-2xl font-bold text-gray-900">98.7%</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-green-500 text-sm font-medium">+2.3%</span>
            <span class="text-gray-600 text-sm ml-1">from last month</span>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div class="flex items-center">
            <div class="bg-yellow-100 p-3 rounded-lg">
              <i class="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">เวลาค้นหา</p>
              <p class="text-2xl font-bold text-gray-900">&lt; 2s</p>
            </div>
          </div>
          <div class="mt-4">
            <span class="text-green-500 text-sm font-medium">-0.5s</span>
            <span class="text-gray-600 text-sm ml-1">faster</span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Categories Management -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-blue-100 p-3 rounded-lg">
              <i class="fas fa-sitemap text-blue-600 text-xl"></i>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">จัดการ</p>
              <p class="text-lg font-bold text-gray-900">156 หมวด</p>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">จัดหมวดหมู่อัจฉริยะ</h3>
          <p class="text-gray-600 mb-4 text-sm">AI จัดหมวดหมู่เอกสารอัตโนมัติ พร้อมระบบแท็กและการจัดกลุ่มแบบ Semantic</p>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">การเงิน</span>
              <span class="font-medium text-gray-900">847 เอกสาร</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">การตลาด</span>
              <span class="font-medium text-gray-900">623 เอกสาร</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">เทคโนโลยี</span>
              <span class="font-medium text-gray-900">1,234 เอกสาร</span>
            </div>
          </div>

          <router-link to="/ai/knowledge-base/categories" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            <span>จัดการหมวดหมู่</span>
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>

        <!-- Document Library -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-green-100 p-3 rounded-lg">
              <i class="fas fa-books text-green-600 text-xl"></i>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">ขนาดไลบรารี</p>
              <p class="text-lg font-bold text-gray-900">2.4 TB</p>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">คลังเอกสารดิจิทัล</h3>
          <p class="text-gray-600 mb-4 text-sm">จัดเก็บและจัดการเอกสารทุกรูปแบบ พร้อมการค้นหาแบบ Full-text และ Semantic Search</p>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <i class="fas fa-file-pdf text-red-500"></i>
                <span class="text-gray-600">PDF</span>
              </div>
              <span class="font-medium text-gray-900">1,245 ไฟล์</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <i class="fas fa-file-word text-blue-500"></i>
                <span class="text-gray-600">DOCX</span>
              </div>
              <span class="font-medium text-gray-900">823 ไฟล์</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <i class="fas fa-file-excel text-green-500"></i>
                <span class="text-gray-600">Excel</span>
              </div>
              <span class="font-medium text-gray-900">456 ไฟล์</span>
            </div>
          </div>

          <router-link to="/ai/knowledge-base/library" class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            <span>เรียกดูคลังเอกสาร</span>
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>

        <!-- AI Upload & Processing -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-purple-100 p-3 rounded-lg">
              <i class="fas fa-cloud-upload-alt text-purple-600 text-xl"></i>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">ประมวลผลวันนี้</p>
              <p class="text-lg font-bold text-gray-900">87 ไฟล์</p>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">อัพโหลด & ประมวลผล AI</h3>
          <p class="text-gray-600 mb-4 text-sm">อัพโหลดเอกสารใหม่ ระบบ AI จะแยกข้อความ สกัดคำสำคัญ และจัดหมวดหมู่อัตโนมัติ</p>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">OCR Text Extract</span>
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">Keyword Analysis</span>
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">Auto Categorization</span>
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>

          <router-link to="/ai/knowledge-base/upload" class="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            <span>อัพโหลดเอกสาร</span>
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>

        <!-- Knowledge Review -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-amber-100 p-3 rounded-lg">
              <i class="fas fa-clipboard-check text-amber-600 text-xl"></i>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">รอตรวจสอบ</p>
              <p class="text-lg font-bold text-gray-900">23 รายการ</p>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">ตรวจสอบ & ปรับปรุงความรู้</h3>
          <p class="text-gray-600 mb-4 text-sm">AI ช่วยตรวจสอบคุณภาพ ความถูกต้อง และเสนอแนะการปรับปรุงเนื้อหาอย่างชาญฉลาด</p>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">Quality Score</span>
              <span class="font-medium text-amber-600">94.2%</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">Duplicate Detection</span>
              <span class="font-medium text-gray-900">5 รายการ</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">Outdated Content</span>
              <span class="font-medium text-gray-900">18 รายการ</span>
            </div>
          </div>

          <router-link to="/ai/knowledge-base/review" class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            <span>ตรวจสอบความรู้</span>
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>

        <!-- Analytics & Insights -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-pink-100 p-3 rounded-lg">
              <i class="fas fa-chart-line text-pink-600 text-xl"></i>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">การใช้งานวันนี้</p>
              <p class="text-lg font-bold text-gray-900">2,456</p>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">วิเคราะห์การใช้งาน</h3>
          <p class="text-gray-600 mb-4 text-sm">รายงานการใช้งานแบบเรียลไทม์ พร้อมข้อเสนอแนะการปรับปรุงจาก AI Analytics</p>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">Search Queries</span>
              <span class="font-medium text-gray-900">1,234 ครั้ง</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">Document Views</span>
              <span class="font-medium text-gray-900">3,456 ครั้ง</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">AI Interactions</span>
              <span class="font-medium text-gray-900">987 ครั้ง</span>
            </div>
          </div>

          <router-link to="/ai/knowledge-base/analytics" class="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            <span>ดูรายงาน</span>
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>

        <!-- AI Assistant Integration -->
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div class="bg-indigo-100 p-3 rounded-lg">
              <i class="fas fa-robot text-indigo-600 text-xl"></i>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">AI Confidence</p>
              <p class="text-lg font-bold text-gray-900">98.7%</p>
            </div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">AI Assistant Integration</h3>
          <p class="text-gray-600 mb-4 text-sm">ผนึกกำลังกับ AI Assistant เพื่อตอบคำถาม สร้างเนื้อหาใหม่ และให้คำแนะนำจากคลังความรู้</p>
          
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">Knowledge Q&A</span>
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">Content Generation</span>
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">Smart Recommendations</span>
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>

          <router-link to="/ai/chat" class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            <span>เริ่มแชทกับ AI</span>
            <i class="fas fa-arrow-right"></i>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 class="text-xl font-bold text-gray-900 mb-6">กิจกรรมล่าสุด</h3>
        <div class="space-y-4">
          <div class="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-upload text-white"></i>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900">อัพโหลดเอกสาร "รายงานประจำปี 2025"</p>
              <p class="text-sm text-gray-600">AI ประมวลผลและจัดหมวดหมู่เรียบร้อยแล้ว</p>
            </div>
            <span class="text-sm text-gray-500">5 นาทีที่แล้ว</span>
          </div>

          <div class="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
            <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-check text-white"></i>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900">ตรวจสอบคุณภาพเนื้อหาหมวด "การตลาดดิจิทัล"</p>
              <p class="text-sm text-gray-600">AI พบเนื้อหาที่ต้องปรับปรุง 3 รายการ</p>
            </div>
            <span class="text-sm text-gray-500">15 นาทีที่แล้ว</span>
          </div>

          <div class="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-search text-white"></i>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900">การค้นหา: "กลยุทธ์การขาย B2B"</p>
              <p class="text-sm text-gray-600">พบเอกสารที่เกี่ยวข้อง 24 ฉบับ</p>
            </div>
            <span class="text-sm text-gray-500">32 นาทีที่แล้ว</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeBase',
  data() {
    return {
      stats: {
        totalDocuments: 2847,
        categories: 156,
        accuracy: 98.7,
        searchTime: 2
      }
    }
  }
}
</script>

<style scoped>
.ai-chat-container {
  font-family: 'Inter', sans-serif;
}
</style>