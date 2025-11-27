<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="handleBackdropClick">
    <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[95vh] overflow-hidden" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">
          การปรับแต่งปุ่มเข้าสู่ระบบ
        </h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Service Header (No Tabs) -->
      <div v-if="currentService" class="flex items-center border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4">
        <component :is="currentService.icon" class="w-8 h-8 mr-3" />
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ currentService.name }} Login Button</h3>
          <p class="text-sm text-gray-600">ปรับแต่งรูปแบบปุ่มเข้าสู่ระบบสำหรับ {{ currentService.name }}</p>
        </div>
      </div>

      <!-- Modal Content -->
      <div class="flex-1 overflow-hidden">
        <!-- Button Customizer -->
        <LoginButtonCustomizer
          v-if="currentService"
          :serviceName="currentService.name"
          :serviceType="activeTab"
          :initialConfig="getServiceConfig(activeTab)"
          @configuration-changed="handleConfigurationChange"
        />
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center space-x-4">
          <button
            @click="resetCurrentService"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            รีเซ็ตการตั้งค่า {{ currentService ? currentService.name : '' }}
          </button>
          <button
            @click="copyCurrentServiceCSS"
            class="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            คัดลอก CSS
          </button>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            ปิด
          </button>
          <button
            @click="saveCurrentService"
            class="px-6 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            บันทึกการตั้งค่า {{ currentService ? currentService.name : '' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoginButtonCustomizer from '@/components/LoginButtonCustomizer.vue';

export default {
  name: 'LoginButtonModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    services: {
      type: Array,
      default: () => []
    },
    initialConfigs: {
      type: Object,
      default: () => ({})
    },
    defaultService: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'save', 'config-changed'],
  data() {
    return {
      activeTab: 'microsoft',
      localConfigs: {},
      availableServices: [
        {
          type: 'microsoft',
          name: 'Microsoft',
          icon: 'MicrosoftIcon'
        },
        {
          type: 'google',
          name: 'Google',
          icon: 'GoogleIcon'
        },
        {
          type: 'facebook',
          name: 'Facebook',
          icon: 'FacebookIcon'
        },
        {
          type: 'line',
          name: 'LINE',
          icon: 'LineIcon'
        }
      ]
    };
  },
  computed: {
    currentService() {
      return this.availableServices.find(service => service.type === this.activeTab);
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        console.log('Modal opened with initialConfigs:', this.initialConfigs);
        // Initialize local configs when modal opens
        this.localConfigs = { ...this.initialConfigs };
        console.log('localConfigs after initialization:', this.localConfigs);
        // Set active tab to the specific service passed in
        if (this.defaultService) {
          this.activeTab = this.defaultService;
        } else if (this.services.length > 0) {
          this.activeTab = this.services[0];
        }
      }
    },
    services: {
      handler(newServices) {
        // Use defaultService if provided, otherwise use first service
        if (this.defaultService && newServices.includes(this.defaultService)) {
          this.activeTab = this.defaultService;
        } else if (newServices.length > 0) {
          this.activeTab = newServices[0];
        }
      },
      immediate: true
    },
    defaultService: {
      handler(newService) {
        if (newService && this.services.includes(newService)) {
          this.activeTab = newService;
        }
      },
      immediate: true
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },

    handleBackdropClick() {
      this.closeModal();
    },

    getServiceConfig(serviceType) {
      const config = this.localConfigs[serviceType] || {};
      console.log(`getServiceConfig(${serviceType}):`, config);
      return config;
    },

    handleConfigurationChange(serviceType, config) {
      this.localConfigs[serviceType] = config;
      this.$emit('config-changed', serviceType, config);
    },

    resetCurrentService() {
      this.$swal({
        title: 'รีเซ็ตการตั้งค่า',
        text: `ต้องการรีเซ็ตการตั้งค่าปุ่ม ${this.currentService.name} หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'รีเซ็ต',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#ef4444'
      }).then((result) => {
        if (result.isConfirmed) {
          delete this.localConfigs[this.activeTab];
          this.$emit('config-changed', this.activeTab, {});
          
          this.$swal({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 2000,
            icon: 'success',
            title: `รีเซ็ตการตั้งค่าปุ่ม ${this.currentService.name} เรียบร้อย`
          });
        }
      });
    },

    async copyCurrentServiceCSS() {
      const config = this.localConfigs[this.activeTab];
      const css = this.generateCSS(config, this.activeTab);
      const serviceName = this.currentService?.name || this.activeTab;

      try {
        await navigator.clipboard.writeText(`/* ${serviceName} Login Button */\n${css}`);
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 2000,
          icon: 'success',
          title: `คัดลอก CSS ของ ${serviceName} เรียบร้อย`
        });
      } catch (err) {
        console.error('Failed to copy CSS:', err);
      }
    },

    async copyAllConfigs() {
      const allCSS = Object.keys(this.localConfigs)
        .filter(serviceType => this.services.includes(serviceType))
        .map(serviceType => {
          const config = this.localConfigs[serviceType];
          const serviceName = this.availableServices.find(s => s.type === serviceType)?.name || serviceType;
          return `/* ${serviceName} Login Button */\n${this.generateCSS(config, serviceType)}`;
        })
        .join('\n\n');

      try {
        await navigator.clipboard.writeText(allCSS);
        this.$swal({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 2000,
          icon: 'success',
          title: 'คัดลอก CSS ทั้งหมดเรียบร้อย'
        });
      } catch (err) {
        console.error('Failed to copy CSS:', err);
      }
    },

    generateCSS(config, serviceType) {
      if (!config || Object.keys(config).length === 0) return '';

      const selector = `.${serviceType}-login-button`;
      const styles = [];

      if (config.primaryColor) styles.push(`background-color: ${config.primaryColor}`);
      if (config.textColor) styles.push(`color: ${config.textColor}`);
      if (config.borderColor) styles.push(`border: 2px solid ${config.borderColor}`);
      
      if (config.buttonSize) {
        const sizes = {
          small: 'padding: 8px 16px; font-size: 14px',
          medium: 'padding: 12px 24px; font-size: 16px',
          large: 'padding: 16px 32px; font-size: 18px'
        };
        if (sizes[config.buttonSize]) styles.push(sizes[config.buttonSize]);
      }

      if (config.buttonShape) {
        const shapes = {
          rounded: 'border-radius: 8px',
          square: 'border-radius: 0px',
          pill: 'border-radius: 50px'
        };
        if (shapes[config.buttonShape]) styles.push(shapes[config.buttonShape]);
      }

      return `${selector} {\n  ${styles.join(';\n  ')};\n}`;
    },

    saveCurrentService() {
      const serviceName = this.currentService?.name || this.activeTab;
      this.$emit('save', this.localConfigs);
      this.$swal({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 2000,
        icon: 'success',
        title: `บันทึกการตั้งค่าปุ่ม ${serviceName} เรียบร้อย`
      });
      this.closeModal();
    },

    saveAllConfigs() {
      this.$emit('save', this.localConfigs);
      this.$swal({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 2000,
        icon: 'success',
        title: 'บันทึกการตั้งค่าปุ่มทั้งหมดเรียบร้อย'
      });
      this.closeModal();
    }
  },
  components: {
    LoginButtonCustomizer,
    // Service Icons
    MicrosoftIcon: {
      template: `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
        </svg>
      `
    },
    GoogleIcon: {
      template: `
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      `
    },
    FacebookIcon: {
      template: `
        <svg viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      `
    },
    LineIcon: {
      template: `
        <svg viewBox="0 0 24 24" fill="#00B900">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.630-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771z"/>
        </svg>
      `
    }
  }
};
</script>

<style scoped>
/* Modal Animation */
.fixed {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.bg-white {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Tab Styling */
.border-b-2 {
  border-bottom-width: 2px;
}

/* Scrollbar Styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>