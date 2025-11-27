<template>
  <div class="flex flex-col flex-grow bg-white border-l border-gray-200 min-h-screen">
    <!-- Featured Image -->
    <div class="px-4 py-4 border-b border-gray-200">
      <h3 class="text-sm font-medium text-gray-700 mb-3">รูปภาพหลัก</h3>
      <div class="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <div
          class="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          @click="$emit('openFileBrowser')"
        >
          <div v-if="!featureImage" class="text-center">
            <i class="fas fa-image text-gray-400 text-lg mb-1"></i>
            <p class="text-xs text-gray-500">คลิกเพื่อเลือกรูปภาพ</p>
          </div>
          <img
            v-else
            :src="featureImage"
            alt="Featured Image"
            class="w-full h-full object-cover"
          />
          <div
            v-if="featureImage"
            class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          >
            <i class="fas fa-edit text-white text-lg"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Publication Settings -->
    <div class="px-4 py-4 border-b border-gray-200">
      <h3 class="text-sm font-medium text-gray-700 mb-3">การเผยแพร่</h3>
      <div class="space-y-2">
        <label class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input
            type="checkbox"
            v-model="localPublishStatus"
            @change="$emit('update:publishStatus', localPublishStatus)"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <div>
            <div class="text-sm font-medium text-gray-900">เผยแพร่</div>
            <div class="text-xs text-gray-500">
              {{ localIsPostType ? 'แสดงบทความนี้ต่อสาธารณะ' : 'แสดงหน้านี้ต่อสาธารณะ' }}
            </div>
          </div>
        </label>

        <label class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input
            type="checkbox"
            v-model="localRequireAuth"
            @change="$emit('update:requireAuth', localRequireAuth)"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <div>
            <div class="text-sm font-medium text-gray-900">สำหรับสมาชิก</div>
            <div class="text-xs text-gray-500">ต้องเข้าสู่ระบบเพื่อดู</div>
          </div>
        </label>

        <!-- Admin Page Main Option - Available for both pages and posts -->
        <label class="flex items-center gap-2 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer" v-if="localContentType==='form'">
          <input
            v-model="localUseAdminPage"
            @change="$emit('update:useAdminPage', localUseAdminPage)"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <div>
            <div class="text-sm font-medium text-gray-900">ใช้งาน Admin Page</div>
            <div class="text-xs text-gray-500">
              {{ localIsPostType ? 'เปิดใช้ฟีเจอร์ผู้ดูแลสำหรับบทความ' : 'เปิดใช้ฟีเจอร์ผู้ดูแลระบบ' }}
            </div>
          </div>
        </label>

        <!-- Admin Page Sub-options -->
        <div v-if="localUseAdminPage" class="ml-6 space-y-2 border-l-2 border-blue-200 pl-3">
          <!-- Password Protection -->
          <label class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <input
              v-model="localUsePassword"
              @change="$emit('update:usePassword', localUsePassword)"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">ใช้รหัสผ่าน</div>
              <div class="text-xs text-gray-500">ป้องกันการเข้าถึงด้วยรหัสผ่าน</div>
            </div>
          </label>

          <!-- Password Input (shows when usePassword is checked) -->
          <div v-if="localUsePassword" class="ml-6">
            <div class="flex gap-2">
              <input
                type="text"
                v-model="localAdminPassword"
                @input="$emit('update:adminPassword', localAdminPassword)"
                class="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="กรอกรหัสผ่าน Admin..."
              />
              <button
                @click="$emit('generateRandomPassword')"
                type="button"
                class="px-2 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                title="สุ่มรหัสผ่าน"
              >
                <i class="fas fa-random"></i>
              </button>
            </div>
          </div>

          <!-- Analytics Dashboard -->
          <label class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <input
              v-model="localEnableAnalytics"
              @change="$emit('update:enableAnalytics', localEnableAnalytics)"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <div>
              <div class="text-sm font-medium text-gray-900">ใช้ Analytics Dashboard</div>
              <div class="text-xs text-gray-500">แสดงสถิติและการวิเคราะห์</div>
            </div>
          </label>

          <!-- Export Options -->
          <label class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <input
              v-model="localEnableExport"
              @change="$emit('update:enableExport', localEnableExport)"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">ใช้ Export</div>
              <div class="text-xs text-gray-500">ส่งออกข้อมูลเป็น CSV และ Excel</div>
            </div>
          </label>

          <!-- Export Format Selection (shows when enableExport is checked) -->
          <div v-if="localEnableExport" class="ml-6 space-y-1">
            <div class="text-xs font-medium text-gray-700 mb-1">รูปแบบการส่งออก:</div>
            <div class="space-y-1 mb-2">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="localExportCSV"
                  @change="$emit('update:exportCSV', localExportCSV)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <i class="fas fa-file-csv text-green-600"></i>
                <span class="text-xs text-gray-700">CSV</span>
              </label>
              
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="localExportExcel"
                  @change="$emit('update:exportExcel', localExportExcel)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <i class="fas fa-file-excel text-blue-600"></i>
                <span class="text-xs text-gray-700">Excel</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Template Option - Only for pages -->
        <label v-if="!localIsPostType" class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <input
            v-model="localIsTemplate"
            @change="$emit('update:isTemplate', localIsTemplate)"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <div>
            <div class="text-sm font-medium text-gray-900">เทมเพลต</div>
            <div class="text-xs text-gray-500">ใช้เป็นแม่แบบ</div>
          </div>
        </label>
      </div>
    </div>

    <!-- Page Settings -->
    <div class="px-4 py-4 border-b border-gray-200">
      <h3 class="text-sm font-medium text-gray-700 mb-3">
        {{ localIsPostType ? 'ตั้งค่าบทความ' : 'ตั้งค่าหน้า' }}
      </h3>
      <div class="space-y-3">
        <!-- Layout Settings - Only for pages -->
        <div v-if="!localIsPostType">
          <label class="block text-xs font-medium text-gray-700 mb-2">Layout</label>
          <div class="grid grid-cols-3 gap-1">
            <label
              class="relative flex flex-col items-center p-2 cursor-pointer border-2 rounded-md hover:bg-gray-50 transition-colors text-center"
              :class="{ 'border-blue-500 bg-blue-50': localLayout === 'standard', 'border-gray-300': localLayout !== 'standard' }"
            >
              <input
                type="radio"
                v-model="localLayout"
                value="standard"
                @change="$emit('update:layout', localLayout)"
                class="sr-only"
              />
              <i class="fas fa-file-alt text-blue-600 mb-1"></i>
              <div class="text-xs font-medium text-gray-900">Standard</div>
              <div class="text-xs text-gray-500">มาตรฐาน</div>
            </label>
            
            <label
              class="relative flex flex-col items-center p-2 cursor-pointer border-2 rounded-md hover:bg-gray-50 transition-colors text-center"
              :class="{ 'border-blue-500 bg-blue-50': localLayout === 'full', 'border-gray-300': localLayout !== 'full' }"
            >
              <input
                type="radio"
                v-model="localLayout"
                value="full"
                @change="$emit('update:layout', localLayout)"
                class="sr-only"
              />
              <i class="fas fa-expand text-green-600 mb-1"></i>
              <div class="text-xs font-medium text-gray-900">Full</div>
              <div class="text-xs text-gray-500">เต็มจอ</div>
            </label>
            
            <label
              class="relative flex flex-col items-center p-2 cursor-pointer border-2 rounded-md hover:bg-gray-50 transition-colors text-center"
              :class="{ 'border-blue-500 bg-blue-50': localLayout === 'block', 'border-gray-300': localLayout !== 'block' }"
            >
              <input
                type="radio"
                v-model="localLayout"
                value="block"
                @change="$emit('update:layout', localLayout)"
                class="sr-only"
              />
              <i class="fas fa-th-large text-purple-600 mb-1"></i>
              <div class="text-xs font-medium text-gray-900">Block</div>
              <div class="text-xs text-gray-500">บล็อก</div>
            </label>
          </div>
        </div>

        <!-- Post-specific settings -->
        <div v-if="localIsPostType">
          <div class="p-3 bg-gray-50 rounded-lg">
            <div class="text-xs font-medium text-gray-700 mb-2">ข้อมูลบทความ</div>
            <div class="space-y-1 text-xs text-gray-600">
              <div>ประเภท: บทความย่อย (Post)</div>
              <div>จัดการโดย: หน้าหลัก</div>
              <div>การแสดงผล: ตามหน้าหลัก</div>
              <div>Content Type: {{ localContentType }}</div>
            </div>
          </div>
        </div>

        <div>
          <label for="pageID" class="block text-xs font-medium text-gray-700 mb-1">
            {{ localIsPostType ? 'Post ID (CSS)' : 'Page ID (CSS)' }}
          </label>
          <input
            v-model="localPageID"
            @input="$emit('update:pageID', localPageID)"
            type="text"
            id="pageID"
            class="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent"
            placeholder="กรอก CSS ID..."
          />
        </div>

        <!-- Password Protection -->
        <div v-if="localIsPasswordModalOpen || localPagePassword">
          <label class="block text-xs font-medium text-gray-700 mb-1">
            {{ localIsPostType ? 'รหัสผ่านบทความ' : 'รหัสผ่านหน้า' }}
          </label>
          <div class="relative">
            <input
              type="text"
              v-model="localPagePassword"
              @input="$emit('update:pagePassword', localPagePassword)"
              class="w-full px-2 py-1.5 pr-12 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent"
              placeholder="กรอกรหัสผ่าน..."
            />
            <button
              @click="$emit('generateRandomPassword')"
              class="absolute right-1 top-0.5 px-1.5 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
            >
              <i class="fas fa-random"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Meta Information -->
    <div class="px-4 py-4 border-b border-gray-200">
      <h3 class="text-sm font-medium text-gray-700 mb-3">ข้อมูลเพิ่มเติม</h3>
      <div class="space-y-1.5 text-xs text-gray-600">
        <div class="flex justify-between">
          <span>สร้างเมื่อ:</span>
          <span>{{ createdDate }}</span>
        </div>
        <div class="flex justify-between">
          <span>แก้ไขล่าสุด:</span>
          <span>{{ updatedDate }}</span>
        </div>
        <div class="flex justify-between">
          <span>จำนวนผู้เยี่ยมชม:</span>
          <span>{{ viewCount }}</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="px-4 py-4 border-b border-gray-200">
      <h3 class="text-sm font-medium text-gray-700 mb-3">การดำเนินการ</h3>
      <div class="space-y-2">
        <button
          @click="$emit('updatePost')"
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <i class="fas fa-save text-xs"></i>
          {{ localIsPostType ? 'บันทึกบทความ' : 'บันทึกข้อมูล' }}
        </button>

        <button
          @click="$emit('togglePasswordModal')"
          v-if="!localPagePassword"
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 rounded-lg transition-colors text-sm"
        >
          <i class="fas fa-lock text-xs"></i>
          ป้องกันด้วยรหัสผ่าน
        </button>

        <button
          @click="$emit('resetPassword')"
          v-else
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 rounded-lg transition-colors text-sm"
        >
          <i class="fas fa-unlock text-xs"></i>
          ลบรหัสผ่าน
        </button>

        <button
          @click="$emit('deleteContent')"
          type="button"
          class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-red-50 text-red-600 font-medium border border-red-300 rounded-lg transition-colors text-sm"
        >
          <i class="fas fa-trash text-xs"></i>
          {{ localIsPostType ? 'ลบบทความนี้' : 'ลบหน้านี้' }}
        </button>

        <!-- Advanced Actions -->
        <div class="pt-2 border-t border-gray-200">
          <button
            @click="$emit('duplicateContent')"
            type="button"
            class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 rounded-lg transition-colors text-sm mb-2"
          >
            <i class="fas fa-copy text-xs"></i>
            {{ localIsPostType ? 'คัดลอกบทความ' : 'คัดลอกเนื้อหา' }}
          </button>

          <button
            @click="$emit('exportContent')"
            type="button"
            class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 rounded-lg transition-colors text-sm mb-2"
          >
            <i class="fas fa-download text-xs"></i>
            ส่งออกเนื้อหา
          </button>

          <label class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 rounded-lg transition-colors text-sm cursor-pointer">
            <i class="fas fa-upload text-xs"></i>
            นำเข้าเนื้อหา
            <input
              type="file"
              accept=".json"
              @change="handleImportFile"
              class="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ContentRightSidebar",
  props: {
    featureImage: {
      type: String,
      default: ''
    },
    publishStatus: {
      type: Boolean,
      default: false
    },
    requireAuth: {
      type: Boolean,
      default: false
    },
    useAdminPage: {
      type: Boolean,
      default: false
    },
    usePassword: {
      type: Boolean,
      default: false
    },
    adminPassword: {
      type: String,
      default: ''
    },
    enableAnalytics: {
      type: Boolean,
      default: false
    },
    enableExport: {
      type: Boolean,
      default: false
    },
    exportCSV: {
      type: Boolean,
      default: false
    },
    exportExcel: {
      type: Boolean,
      default: false
    },
    isTemplate: {
      type: Boolean,
      default: false
    },
    layout: {
      type: String,
      default: 'standard'
    },
    pageID: {
      type: String,
      default: ''
    },
    pagePassword: {
      type: String,
      default: ''
    },
    isPasswordModalOpen: {
      type: Boolean,
      default: false
    },
    createdDate: {
      type: String,
      default: '-'
    },
    updatedDate: {
      type: String,
      default: '-'
    },
    viewCount: {
      type: Number,
      default: 0
    },
    isPostType: {
      type: Boolean,
      default: false
    },
    contentType: {
      type: String,
      default: 'page'
    }
  },
  data() {
    return {
      localPublishStatus: this.publishStatus,
      localRequireAuth: this.requireAuth,
      localUseAdminPage: this.useAdminPage,
      localUsePassword: this.usePassword,
      localAdminPassword: this.adminPassword,
      localEnableAnalytics: this.enableAnalytics,
      localEnableExport: this.enableExport,
      localExportCSV: this.exportCSV,
      localExportExcel: this.exportExcel,
      localIsTemplate: this.isTemplate,
      localLayout: this.layout,
      localPageID: this.pageID,
      localPagePassword: this.pagePassword,
      localIsPasswordModalOpen: this.isPasswordModalOpen,
      localIsPostType: this.isPostType,
      localContentType: this.contentType
    };
  },
  watch: {
    publishStatus(val) {
      this.localPublishStatus = val;
    },
    requireAuth(val) {
      this.localRequireAuth = val;
    },
    useAdminPage(val) {
      this.localUseAdminPage = val;
    },
    usePassword(val) {
      this.localUsePassword = val;
    },
    adminPassword(val) {
      this.localAdminPassword = val;
    },
    enableAnalytics(val) {
      this.localEnableAnalytics = val;
    },
    enableExport(val) {
      this.localEnableExport = val;
    },
    exportCSV(val) {
      this.localExportCSV = val;
    },
    exportExcel(val) {
      this.localExportExcel = val;
    },
    isTemplate(val) {
      this.localIsTemplate = val;
    },
    layout(val) {
      this.localLayout = val;
    },
    pageID(val) {
      this.localPageID = val;
    },
    pagePassword(val) {
      this.localPagePassword = val;
    },
    isPasswordModalOpen(val) {
      this.localIsPasswordModalOpen = val;
    },
    isPostType(val) {
      this.localIsPostType = val;
    },
    contentType(val) {
      this.localContentType = val;
    }
  },
  emits: [
    'openFileBrowser',
    'update:publishStatus',
    'update:requireAuth',
    'update:useAdminPage',
    'update:usePassword',
    'update:adminPassword',
    'update:enableAnalytics',
    'update:enableExport',
    'update:exportCSV',
    'update:exportExcel',
    'update:isTemplate',
    'update:layout',
    'update:pageID',
    'update:pagePassword',
    'generateRandomPassword',
    'togglePasswordModal',
    'resetPassword',
    'updatePost',
    'deleteContent',
    'duplicateContent',
    'exportContent',
    'importContent'
  ],
  methods: {
    handleImportFile(e) {
      if (e.target.files.length > 0) {
        this.$emit('importContent', e.target.files[0]);
      }
    }
  }
}
</script>