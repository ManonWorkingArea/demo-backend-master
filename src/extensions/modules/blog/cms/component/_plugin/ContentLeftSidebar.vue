<template>
  <div class="flex flex-col flex-grow bg-white border-r border-gray-200 min-h-screen">
    <!-- Sidebar Header -->
    <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0">
      <h1 class="text-lg font-semibold text-gray-900">จัดการเนื้อหา</h1>
      <button 
        @click="$emit('goBack')"
        class="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors duration-200"
        title="กลับไปหน้าหลัก"
      >
        <i class="fas fa-arrow-left text-sm"></i>
      </button>
    </div>

    <!-- Content Analytics -->
    <div class="px-4 py-3 border-b border-gray-200">
      <h3 class="text-xs font-medium text-gray-700 mb-2">Analytics</h3>
      <div class="space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-600">คำ:</span>
          <span class="font-medium">{{ contentAnalytics.wordCount }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">เวลาอ่าน:</span>
          <span class="font-medium">{{ contentAnalytics.readingTime }} นาที</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">SEO:</span>
          <span :class="['font-medium', contentAnalytics.seoScore >= 70 ? 'text-green-600' : contentAnalytics.seoScore >= 40 ? 'text-yellow-600' : 'text-red-600']">
            {{ contentAnalytics.seoScore }}%
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">อ่านง่าย:</span>
          <span :class="['font-medium', contentAnalytics.readabilityScore >= 70 ? 'text-green-600' : contentAnalytics.readabilityScore >= 40 ? 'text-yellow-600' : 'text-red-600']">
            {{ contentAnalytics.readabilityScore }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Content Quality -->
    <div class="px-4 py-4 border-b border-gray-200">
      <h3 class="text-sm font-medium text-gray-700 mb-3">คุณภาพเนื้อหา</h3>
      
      <!-- Quality Score -->
      <div class="mb-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-gray-600">คะแนนรวม</span>
          <span :class="['text-xs font-bold', contentValidation.score >= 80 ? 'text-green-600' : contentValidation.score >= 60 ? 'text-yellow-600' : 'text-red-600']">
            {{ contentValidation.score }}%
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            :class="['h-1.5 rounded-full', contentValidation.score >= 80 ? 'bg-green-500' : contentValidation.score >= 60 ? 'bg-yellow-500' : 'bg-red-500']" 
            :style="{ width: contentValidation.score + '%' }"
          ></div>
        </div>
      </div>

      <!-- Quality Checklist -->
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <i :class="['fas text-xs', contentValidation.hasTitle ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500']"></i>
          <span class="text-xs text-gray-700">ชื่อเรื่องเหมาะสม</span>
        </div>
        <div class="flex items-center gap-2">
          <i :class="['fas text-xs', contentValidation.hasSlug ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500']"></i>
          <span class="text-xs text-gray-700">URL เหมาะสม</span>
        </div>
        <div class="flex items-center gap-2">
          <i :class="['fas text-xs', contentValidation.hasContent ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500']"></i>
          <span class="text-xs text-gray-700">เนื้อหาเพียงพอ</span>
        </div>
        <div class="flex items-center gap-2">
          <i :class="['fas text-xs', contentValidation.hasImage ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500']"></i>
          <span class="text-xs text-gray-700">มีรูปภาพ</span>
        </div>
        <div class="flex items-center gap-2">
          <i :class="['fas text-xs', contentValidation.hasSEO ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500']"></i>
          <span class="text-xs text-gray-700">ตั้งค่า SEO</span>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="px-4 py-4 border-b border-gray-200">
      <h3 class="text-sm font-medium text-gray-700 mb-3">ลิงก์ด่วน</h3>
      <div class="space-y-1">
        <router-link 
          :to="'/cms/builder/' + postId"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
        >
          <i class="fas fa-palette text-blue-500 w-4"></i>
          <span>เปิด Page Builder</span>
        </router-link>
        <router-link 
          :to="'/preview/' + slug"
          target="_blank"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
        >
          <i class="fas fa-external-link-alt text-green-500 w-4"></i>
          <span>ดูตัวอย่าง</span>
        </router-link>
        <router-link 
          to="/cms/content"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
        >
          <i class="fas fa-list text-purple-500 w-4"></i>
          <span>กลับไปรายการ</span>
        </router-link>
      </div>
    </div>

    <!-- Tools & Utilities -->
    <div class="px-4 py-4 border-b border-gray-200">
      <h3 class="text-sm font-medium text-gray-700 mb-3">เครื่องมือ</h3>
      <div class="space-y-1">
        <button 
          @click="$emit('importData')"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
        >
          <i class="fas fa-download text-blue-500 w-4"></i>
          <span>นำเข้าข้อมูล</span>
        </button>
        <button 
          @click="$emit('exportData')"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
        >
          <i class="fas fa-upload text-green-500 w-4"></i>
          <span>ส่งออกข้อมูล</span>
        </button>
        <button 
          @click="$emit('manageTemplates')"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
        >
          <i class="fas fa-copy text-purple-500 w-4"></i>
          <span>จัดการเทมเพลต</span>
        </button>
        <button
          @click="$emit('openMediaLibrary')"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
        >
          <i class="fas fa-images text-pink-500 w-4"></i>
          <span>คลังสื่อ</span>
        </button>
        <button 
          @click="handleGenerateQRCode"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
        >
          <i class="fas fa-qrcode text-indigo-500 w-4"></i>
          <span>สร้าง QR Code</span>
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
          <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
          <p class="text-xs text-gray-500">ผู้ดูแลระบบ</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ContentLeftSidebar",
  props: {
    postId: {
      type: String,
      default: ""
    },
    slug: {
      type: String,
      default: ""
    },
    userName: {
      type: String,
      default: "ผู้ใช้"
    },
    contentAnalytics: {
      type: Object,
      default: () => ({
        wordCount: 0,
        readingTime: 0,
        seoScore: 0,
        readabilityScore: 0
      })
    },
    contentValidation: {
      type: Object,
      default: () => ({
        hasTitle: false,
        hasSlug: false,
        hasContent: false,
        hasImage: false,
        hasSEO: false,
        score: 0
      })
    }
  },
  emits: [
    'goBack',
    'importData',
    'exportData',
    'manageTemplates',
    'openMediaLibrary',
    'generate-qr-code'
  ],
  methods: {
    handleGenerateQRCode() {
      console.log('=== QR Code Button Clicked in ContentLeftSidebar ===');
      console.log('Slug:', this.slug);
      console.log('Post ID:', this.postId);
      
      if (!this.slug || this.slug.trim() === '') {
        console.warn('No slug available for QR Code generation');
        alert('กรุณากรอก URL Slug ก่อนสร้าง QR Code');
        return;
      }
      
      console.log('Emitting generateQRCode event...');
      this.$emit('generate-qr-code');
    }
  }
}
</script>