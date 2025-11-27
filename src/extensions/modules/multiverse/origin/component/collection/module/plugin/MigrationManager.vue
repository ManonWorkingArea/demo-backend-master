<template>
  <div class="migration-manager bg-white rounded-lg shadow-lg p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">การย้ายข้อมูลเจ้าของ</h2>
        <p class="text-gray-600 mt-1">ย้ายข้อมูลเจ้าของจากแบบ embedded ไปเป็นแบบ normalized</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="checkStatus"
          :disabled="loading"
          class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 disabled:opacity-50"
        >
          <i class="fas fa-refresh mr-2"></i>
          รีเฟรชสถานะ
        </button>
      </div>
    </div>

    <!-- Status Card -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ migrationStatus.migrated || 0 }}</div>
          <div class="text-sm text-gray-600 mt-1">ย้ายข้อมูลแล้ว</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-orange-600">{{ migrationStatus.pendingMigration || 0 }}</div>
          <div class="text-sm text-gray-600 mt-1">รอการย้าย</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold" :class="migrationStatus.needsMigration ? 'text-yellow-600' : 'text-green-600'">
            {{ migrationStatus.needsMigration ? 'ต้องย้าย' : 'เสร็จแล้ว' }}
          </div>
          <div class="text-sm text-gray-600 mt-1">สถานะ</div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Dry Run -->
      <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          <i class="fas fa-flask text-orange-500 mr-2"></i>
          ทดสอบการย้าย
        </h3>
        <p class="text-gray-600 text-sm mb-4">
          ตรวจสอบข้อมูลที่จะย้ายโดยไม่ทำการเปลี่ยนแปลงจริง
        </p>
        <button
          @click="runDryRun"
          :disabled="loading || dryRunning"
          class="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 disabled:opacity-50"
        >
          <i v-if="dryRunning" class="fas fa-spinner fa-spin mr-2"></i>
          <i v-else class="fas fa-play mr-2"></i>
          {{ dryRunning ? 'กำลังทดสอบ...' : 'เริ่มทดสอบ' }}
        </button>
      </div>

      <!-- Start Migration -->
      <div class="bg-red-50 rounded-lg p-6 border border-red-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          <i class="fas fa-rocket text-red-500 mr-2"></i>
          เริ่มการย้าย
        </h3>
        <p class="text-gray-600 text-sm mb-4">
          ย้ายข้อมูลจริง (ไม่สามารถยกเลิกได้)
        </p>
        <button
          @click="startMigration"
          :disabled="loading || migrating || !migrationStatus.needsMigration"
          class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
        >
          <i v-if="migrating" class="fas fa-spinner fa-spin mr-2"></i>
          <i v-else class="fas fa-rocket mr-2"></i>
          {{ migrating ? 'กำลังย้าย...' : 'เริ่มการย้าย' }}
        </button>
      </div>
    </div>

    <!-- Dry Run Results -->
    <div v-if="dryRunResults" class="bg-yellow-50 rounded-lg p-6 mb-6 border border-yellow-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        <i class="fas fa-clipboard-list text-yellow-600 mr-2"></i>
        ผลการทดสอบ
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="bg-white rounded-lg p-4">
          <div class="text-sm text-gray-600">จำนวน Collections ที่จะย้าย</div>
          <div class="text-2xl font-bold text-blue-600">{{ dryRunResults.totalCollections }}</div>
        </div>
        <div class="bg-white rounded-lg p-4">
          <div class="text-sm text-gray-600">เวลาที่คาดว่าจะใช้</div>
          <div class="text-2xl font-bold text-green-600">{{ dryRunResults.estimatedTime }}</div>
        </div>
      </div>

      <div v-if="dryRunResults.collectionsToMigrate.length > 0" class="bg-white rounded-lg overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 border-b">
          <h4 class="font-medium text-gray-900">Collections ที่จะย้าย</h4>
        </div>
        <div class="max-h-64 overflow-y-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ชื่อเว็บไซต์</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">เจ้าของ</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">อีเมล</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="collection in dryRunResults.collectionsToMigrate" :key="collection.id">
                <td class="px-4 py-2 text-sm text-gray-900">{{ collection.siteName }}</td>
                <td class="px-4 py-2 text-sm text-gray-600">{{ collection.ownerName }}</td>
                <td class="px-4 py-2 text-sm text-gray-600">{{ collection.ownerEmail }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Migration Progress -->
    <div v-if="migrating" class="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        <i class="fas fa-cogs text-blue-600 mr-2"></i>
        กำลังดำเนินการ
      </h3>
      
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">ความคืบหน้า</span>
          <span class="text-sm font-medium text-blue-600">{{ migrationProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: migrationProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Migration Results -->
    <div v-if="migrationResults" class="rounded-lg p-6 mb-6 border" :class="migrationResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        <i :class="['mr-2', migrationResults.success ? 'fas fa-check-circle text-green-600' : 'fas fa-exclamation-circle text-red-600']"></i>
        ผลการย้าย
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="bg-white rounded-lg p-4">
          <div class="text-sm text-gray-600">สำเร็จ</div>
          <div class="text-2xl font-bold text-green-600">{{ migrationResults.migrated || 0 }}</div>
        </div>
        <div class="bg-white rounded-lg p-4">
          <div class="text-sm text-gray-600">ผิดพลาด</div>
          <div class="text-2xl font-bold text-red-600">{{ migrationResults.errors || 0 }}</div>
        </div>
        <div class="bg-white rounded-lg p-4">
          <div class="text-sm text-gray-600">สถานะ</div>
          <div class="text-lg font-bold" :class="migrationResults.success ? 'text-green-600' : 'text-red-600'">
            {{ migrationResults.success ? 'สำเร็จ' : 'ผิดพลาด' }}
          </div>
        </div>
      </div>

      <button
        @click="showMigrationLog = !showMigrationLog"
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
      >
        <i class="fas fa-list mr-2"></i>
        {{ showMigrationLog ? 'ซ่อน' : 'แสดง' }}รายละเอียด
      </button>
    </div>

    <!-- Migration Log -->
    <div v-if="showMigrationLog && migrationResults?.log" class="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        <i class="fas fa-file-alt text-gray-600 mr-2"></i>
        Log การย้าย
      </h3>
      
      <div class="bg-black rounded-lg p-4 max-h-64 overflow-y-auto">
        <div v-for="(logEntry, index) in migrationResults.log" :key="index" class="text-sm font-mono text-green-400 mb-1">
          {{ logEntry }}
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div class="flex items-center justify-center mb-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div class="text-center text-gray-700">กำลังโหลด...</div>
      </div>
    </div>
  </div>
</template>

<script>
import OwnershipMigration from './OwnershipMigration.js';

export default {
  name: 'MigrationManager',
  inject: ['apiServerName', 'saltSecret'],
  data() {
    return {
      hostkey: this.$Key,
      migrationService: null,
      loading: false,
      migrating: false,
      dryRunning: false,
      migrationStatus: {
        migrated: 0,
        pendingMigration: 0,
        needsMigration: false
      },
      dryRunResults: null,
      migrationResults: null,
      migrationProgress: 0,
      showMigrationLog: false
    };
  },
  mounted() {
    this.migrationService = new OwnershipMigration(this.hostkey);
    this.checkStatus();
  },
  methods: {
    async checkStatus() {
      this.loading = true;
      try {
        this.migrationStatus = await this.migrationService.checkMigrationStatus();
      } catch (error) {
        console.error('Error checking migration status:', error);
        this.$emit('error', 'ไม่สามารถตรวจสอบสถานะการย้ายได้');
      } finally {
        this.loading = false;
      }
    },

    async runDryRun() {
      this.dryRunning = true;
      this.dryRunResults = null;
      
      try {
        this.dryRunResults = await this.migrationService.dryRun();
        this.$emit('success', 'ทดสอบการย้ายเสร็จสิ้น');
      } catch (error) {
        console.error('Dry run failed:', error);
        this.$emit('error', 'การทดสอบผิดพลาด: ' + error.message);
      } finally {
        this.dryRunning = false;
      }
    },

    async startMigration() {
      if (!confirm('คุณแน่ใจหรือไม่ที่จะเริ่มการย้ายข้อมูล? การดำเนินการนี้ไม่สามารถยกเลิกได้')) {
        return;
      }

      this.migrating = true;
      this.migrationResults = null;
      this.migrationProgress = 0;
      
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          if (this.migrationProgress < 90) {
            this.migrationProgress += Math.random() * 10;
          }
        }, 1000);

        this.migrationResults = await this.migrationService.startMigration();
        
        clearInterval(progressInterval);
        this.migrationProgress = 100;
        
        if (this.migrationResults.success) {
          this.$emit('success', `การย้ายเสร็จสิ้น! ย้ายสำเร็จ ${this.migrationResults.migrated} รายการ`);
          await this.checkStatus(); // Refresh status
        } else {
          this.$emit('error', 'การย้ายผิดพลาด: ' + this.migrationResults.error);
        }
        
      } catch (error) {
        console.error('Migration failed:', error);
        this.$emit('error', 'การย้ายผิดพลาด: ' + error.message);
      } finally {
        this.migrating = false;
      }
    }
  }
};
</script>

<style scoped>
.migration-manager {
  max-width: 1200px;
  margin: 0 auto;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style> 