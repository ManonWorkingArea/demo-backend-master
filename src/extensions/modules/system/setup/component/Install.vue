<template>
  <div class="bg-gray-100 py-12">
    <div class="max-w-md mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          ระบบจัดการ
        </h1>
        <p class="text-gray-600">
          ยินดีต้อนรับสู่การติดตั้งระบบครั้งแรก
        </p>
      </div>
        
      <div class="bg-white shadow-lg rounded-lg p-8">
        <font-awesome-icon icon="rocket" class="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          เริ่มต้นการติดตั้ง
        </h2>
        <p class="text-gray-600 mb-6 text-sm">
          ดำเนินการติดตั้งและตั้งค่าระบบให้พร้อมใช้งาน ใช้เวลาเพียงไม่กี่นาที
        </p>
        
        <button 
          @click="showInstaller = true"
          class="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          <font-awesome-icon icon="play" class="mr-2" />
          เริ่มติดตั้งระบบ
        </button>
        
        <div class="mt-6 text-xs text-gray-500 space-y-1">
          <p>✓ ตั้งค่าข้อมูลพื้นฐาน</p>
          <p>✓ อัปโหลดโลโก้และไอคอน</p>
          <p>✓ กำหนดป้ายกำกับข้อมูล</p>
          <p>✓ ตรวจสอบและยืนยันการตั้งค่า</p>
        </div>
      </div>
      
      <!-- แสดงข้อมูลล่าสุดที่ติดตั้ง (ถ้ามี) -->
      <div v-if="lastInstallation" class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center justify-center mb-2">
          <font-awesome-icon icon="check-circle" class="text-green-500 mr-2" />
          <span class="text-green-700 font-medium">ติดตั้งเสร็จสิ้นแล้ว</span>
        </div>
        <div class="text-sm text-green-600">
          <p>ระบบ: {{ lastInstallation.systemInfo.name }}</p>
          <p>URL: {{ lastInstallation.systemInfo.slug }}.domain.com</p>
          <p>ป้ายกำกับ: {{ lastInstallation.labelMappings.length }} รายการ</p>
        </div>
        <button 
          @click="resetSystem"
          class="mt-3 text-xs text-green-600 hover:text-green-800 underline"
        >
          ติดตั้งใหม่อีกครั้ง
        </button>
      </div>
    </div>

    <!-- System Setup Installer Modal -->
    <SystemSetupInstaller 
      :isOpen="showInstaller"
      @close="showInstaller = false"
      @installation-complete="handleInstallationComplete"
    />
  </div>
</template>

<script>
import SystemSetupInstaller from '@/interface/modal/SystemSetupInstaller.vue'

export default {
  name: 'SetupPage',
  components: {
    SystemSetupInstaller
  },
  data() {
    return {
      showInstaller: false,
      lastInstallation: null
    }
  },
  methods: {
    handleInstallationComplete(installationData) {
      this.lastInstallation = installationData;
      console.log('Installation completed:', installationData);
      
      // ที่นี่คุณสามารถส่งข้อมูลไปยัง backend หรือทำการ redirect
      // เช่น this.$router.push('/dashboard')
    },
    
    resetSystem() {
      this.lastInstallation = null;
      this.showInstaller = true;
    }
  }
}
</script>

<style scoped>
/* Custom animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style> 