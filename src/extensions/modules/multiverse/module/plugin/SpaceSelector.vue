<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
    <div class="border-b border-gray-200 pb-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🗄️ เลือก Space สำหรับเก็บไฟล์</h2>
      <p class="text-base text-gray-700 font-medium">เลือกพื้นที่จัดเก็บไฟล์ที่เหมาะสมสำหรับเว็บไซต์ของคุณ</p>
      <p class="text-sm text-gray-500 mt-1">ระบบจะใช้ Space นี้ในการจัดเก็บรูปภาพและไฟล์ต่าง ๆ ของเว็บไซต์</p>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="spaceList.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8a2 2 0 00-2-2H7a2 2 0 00-2 2v1m16 0h-2M4 5h2"/>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">ไม่มี Space ที่พร้อมใช้งาน</h3>
      <p class="mt-1 text-sm text-gray-500">กรุณาสร้าง Space ใหม่หรือติดต่อผู้ดูแลระบบ</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="space in spaceList" :key="space._id" 
           class="bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md"
           :class="{'border-blue-500 bg-blue-50 shadow-md': isSpaceSelected(space._id), 'border-gray-200': !isSpaceSelected(space._id)}"
           @click="selectSpace(space._id)">
        
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
              <path d="M3 10a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/>
            </svg>
            <h4 class="font-medium text-gray-900">{{ space.name }}</h4>
          </div>
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full" :class="space.status ? 'bg-green-400' : 'bg-red-400'"></span>
            <svg v-if="isSpaceSelected(space._id)" class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">การใช้งาน</span>
            <span class="font-medium">{{ calculateDiskUsagePercentage(space.size / 1024, space.spaceSize) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                 :style="`width: ${Math.min(calculateDiskUsagePercentage(space.size / 1024, space.spaceSize), 100)}%`">
            </div>
          </div>
          <div class="flex justify-between text-xs text-gray-500">
            <span>{{ formatBytes(space.size) }}</span>
            <span>{{ space.spaceSize }} GB</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';

export default {
  name: 'SpaceSelector',
  props: {
    selectedSpaceId: {
      type: String,
      default: null
    },
    hostkey: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      spaceList: [],
      loading: false
    };
  },
  methods: {
    formatBytes(bytes) {
      var marker = 1024;
      var decimal = 3;
      var kiloBytes = marker;
      var megaBytes = marker * marker;
      var gigaBytes = marker * marker * marker;
      if(bytes < kiloBytes) return bytes + " Bytes";
      else if(bytes < megaBytes) return(bytes / kiloBytes).toFixed(decimal) + " KB";
      else if(bytes < gigaBytes) return(bytes / megaBytes).toFixed(decimal) + " MB";
      else return(bytes / gigaBytes).toFixed(decimal) + " GB";
    },
    
    calculateDiskUsagePercentage(bytes, full) {
      const limitInBytes = full * 1024 * 1024;
      const percentage = (bytes / limitInBytes) * 100;
      return percentage.toFixed(2);
    },
    
    isSpaceSelected(spaceId) {
      return spaceId === this.selectedSpaceId;
    },
    
    selectSpace(spaceId) {
      this.$emit('space-selected', spaceId);
    },

    async getSpace() {
      if (storageManager.get('session', 'login')) {
        this.loading = true;
        try {
          let andConditions = [{}];
          const pipeline = [
            {
              $match: {
                $and: andConditions,
              },
            },
          ];

          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key': this.hostkey },
            body: JSON.stringify({
              pipeline: pipeline,
            }),
          };

          const resAPI = await fetch('https://gateway.cloudrestfulapi.com/api/space/aggregate', requestOptions);
          const restReturn = await resAPI.json();

          const getAndUpdateSpaceData = async (space) => {
            const spaceId = space._id;
            const spaceData = await this.getSpaceData(spaceId);
            return {
              ...space,
              size: spaceData[0]?.totalSize || '0',
              count: spaceData[0]?.itemCount || '0',
            };
          };

          const updatedListItems = await Promise.all(restReturn.map(getAndUpdateSpaceData));
          this.spaceList = updatedListItems;
        } catch (error) {
          console.log(error);
          this.$swal({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดข้อมูล Space ได้',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        } finally {
          this.loading = false;
        }
      }
    },

    async getSpaceData(targetSpaceId) {
      if (storageManager.get('session', 'login')) {
        try {
          const pipeline = [
            {
              $match: {
                spaceId: targetSpaceId,
              },
            },
            {
              $group: {
                _id: null,
                itemCount: { $sum: 1 },
                totalSize: { $sum: '$size' },
              },
            },
          ];

          const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','client-token-key': this.hostkey },
            body: JSON.stringify({
              pipeline: pipeline,
            }),
          };

          const resAPI = await fetch('https://gateway.cloudrestfulapi.com/api/storage/aggregate', requestOptions);
          const restReturn = await resAPI.json();
          return restReturn;

        } catch (error) {
          console.log(error);
          return { itemCount: 0, totalSize: 0 };
        }
      }
    }
  },
  
  async mounted() {
    await this.getSpace();
  }
};
</script> 