<template>
  <div class="bg-white rounded-lg border border-gray-200">
    <!-- Simple Header -->
    <div class="px-6 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-medium text-gray-900">รายละเอียดคอลเลกชัน</h2>
          <p class="text-gray-500 text-sm mt-1">ข้อมูลทั่วไปและรายละเอียดของคอลเลกชัน</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="$emit('edit')"
            class="btn-simple">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            แก้ไข
          </button>
          <button
            @click="$emit('delete')"
            class="btn-simple text-red-600 hover:bg-red-50">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            ลบ
          </button>
        </div>
      </div>
    </div>

    <!-- Simple Stats Cards -->
    <div class="p-6 border-b border-gray-100">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="stat-card">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide">สถานะ</p>
              <p class="text-sm font-medium text-gray-900">{{ collectionData.status || 'Active' }}</p>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide">ทรัพยากร</p>
              <p class="text-sm font-medium text-gray-900">{{ (assetData && assetData.length) || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide">ผู้ดูแล</p>
              <p class="text-sm font-medium text-gray-900">{{ (collectionAdmin && collectionAdmin.length) || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide">อายุ</p>
              <p class="text-sm font-medium text-gray-900">{{ getTimeSinceCreated() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Information -->
    <div class="p-6 space-y-6">
      <!-- Primary Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="field-group">
          <label class="field-label">ชื่อเว็บไซต์</label>
          <p class="field-value">{{ collectionData.siteName || 'ไม่ระบุ' }}</p>
        </div>

        <div class="field-group">
          <label class="field-label">Hostname</label>
          <p class="field-value font-mono text-sm bg-gray-50 px-2 py-1 rounded">
            {{ collectionData.hostname || 'ไม่ระบุ' }}
          </p>
        </div>

        <div class="field-group">
          <label class="field-label">ID</label>
          <div class="flex items-center gap-2">
            <p class="field-value font-mono text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
              {{ collectionData._id }}
            </p>
            <button 
              @click="$emit('copy', collectionData._id)" 
              class="btn-icon">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">สถานะ</label>
          <span :class="getStatusClass(collectionData.status)" class="status-badge">
            {{ collectionData.status || 'Active' }}
          </span>
        </div>

        <div class="field-group">
          <label class="field-label">วันที่สร้าง</label>
          <div>
            <p class="field-value">{{ dateTime(collectionData.createdAt) }}</p>
            <p class="text-xs text-gray-500">{{ getRelativeTime(collectionData.createdAt) }}</p>
          </div>
        </div>

        <div class="field-group">
          <label class="field-label">อัพเดทล่าสุด</label>
          <div>
            <p class="field-value">{{ dateTime(collectionData.updatedAt) }}</p>
            <p class="text-xs text-gray-500">{{ getRelativeTime(collectionData.updatedAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div v-if="collectionData.relation" class="field-group">
        <label class="field-label">รายละเอียดเพิ่มเติม</label>
        <div class="bg-gray-50 rounded-lg p-4 border">
          <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ collectionData.relation }}</pre>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
      <div class="flex items-center justify-between">
        <div class="text-xs text-gray-500">
          สร้างเมื่อ {{ getRelativeTime(collectionData.createdAt) }} • 
          อัพเดทเมื่อ {{ getRelativeTime(collectionData.updatedAt) }}
        </div>
        <div class="flex gap-1">
          <button @click="$emit('refresh')" class="btn-icon" title="รีเฟรช">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
          <button @click="$emit('export')" class="btn-icon" title="ส่งออก">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'CollectionDetailTab',
  props: {
    collectionData: {
      type: Object,
      default: () => ({})
    },
    assetData: {
      type: Array,
      default: () => []
    },
    collectionAdmin: {
      type: Array,
      default: () => []
    }
  },
  emits: ['edit', 'delete', 'copy', 'refresh', 'export'],
  methods: {
    dateTime(value) {
      return moment(value).format("DD/MM/YYYY HH:mm:ss");
    },
    getStatusClass(status) {
      const classes = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800',
        pending: 'bg-yellow-100 text-yellow-800',
        maintenance: 'bg-gray-100 text-gray-800'
      };
      return classes[status?.toLowerCase()] || classes.active;
    },
    getRelativeTime(date) {
      return moment(date).fromNow();
    },
    getTimeSinceCreated() {
      if (!this.collectionData?.createdAt) return '';
      const now = new Date();
      const created = new Date(this.collectionData.createdAt);
      const diffTime = Math.abs(now - created);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'วันนี้';
      if (diffDays === 1) return '1 วัน';
      if (diffDays < 30) return `${diffDays} วัน`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} เดือน`;
      return `${Math.floor(diffDays / 365)} ปี`;
    }
  }
}
</script>

<style scoped>
/* Simple, clean button styles */
.btn-simple {
  @apply px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 flex items-center;
}

.btn-icon {
  @apply p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200;
}

/* Simple stat cards */
.stat-card {
  @apply bg-gray-50 rounded-lg p-3 border border-gray-100;
}

/* Clean field styling */
.field-group {
  @apply space-y-1;
}

.field-label {
  @apply text-xs font-medium text-gray-500 uppercase tracking-wide;
}

.field-value {
  @apply text-sm text-gray-900 font-medium;
}

/* Simple status badge */
.status-badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}
</style>
