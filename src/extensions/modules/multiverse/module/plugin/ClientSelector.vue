<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
    <div class="border-b border-gray-200 pb-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🗃️ เลือกฐานข้อมูล Client</h2>
      <p class="text-base text-gray-700 font-medium">เลือกฐานข้อมูลที่เหมาะสมสำหรับเว็บไซต์ของคุณ</p>
      <p class="text-sm text-gray-500 mt-1">ฐานข้อมูลนี้จะใช้ในการจัดเก็บข้อมูลผู้ใช้และเนื้อหาของเว็บไซต์</p>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="clientList.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">ไม่มีฐานข้อมูลที่พร้อมใช้งาน</h3>
      <p class="mt-1 text-sm text-gray-500">กรุณาสร้างฐานข้อมูลใหม่หรือติดต่อผู้ดูแลระบบ</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="client in clientList" :key="client._id" 
           class="bg-white border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md"
           :class="{'border-blue-500 bg-blue-50 shadow-md': isClientSelected(client.clientToken), 'border-gray-200': !isClientSelected(client.clientToken)}"
           @click="selectClient(client.clientToken)">
        
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z"/>
              <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z"/>
              <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z"/>
            </svg>
            <h4 class="font-medium text-gray-900">{{ client.clientId }}</h4>
          </div>
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full" :class="client.status ? 'bg-green-400' : 'bg-red-400'"></span>
            <svg v-if="isClientSelected(client.clientToken)" class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Database Type</span>
            <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">{{ client.source }}</span>
          </div>
          <div class="text-xs text-gray-500">
            Token: {{ client.clientToken.substring(0, 12) }}...
          </div>
          <div v-if="client.description" class="text-xs text-gray-500">
            {{ client.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storageManager from '@/plugins/storage';

export default {
  name: 'ClientSelector',
  props: {
    selectedClientId: {
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
      clientList: [],
      loading: false
    };
  },
  methods: {
    isClientSelected(clientToken) {
      return clientToken === this.selectedClientId;
    },
    
    selectClient(clientToken) {
      this.$emit('client-selected', clientToken);
    },

    async getClient() {
      if(storageManager.get('session','login')) {
        this.loading = true;
        try {
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/clients/query", {
            method: 'POST',
            headers: {'Content-Type':'application/json','client-token-key': this.hostkey},
            body: JSON.stringify({
              method: 'find',
              args: [{$and: [{status:true}]}]
            })
          });

          const RestReturn = await resAPI.json();
          this.clientList = RestReturn;

        } catch (error) {
          console.log(error);
          this.$swal({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดข้อมูลฐานข้อมูลได้',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        } finally {
          this.loading = false;
        }
      }
    }
  },
  
  async mounted() {
    await this.getClient();
  }
};
</script> 