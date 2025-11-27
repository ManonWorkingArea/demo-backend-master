<template>
  <div class="login-button-customizer h-full flex flex-col">
    <!-- Main Content Area -->
    <div class="flex-1 flex gap-6 p-4">
      <!-- Left Panel: Form Controls -->
      <div class="w-1/2 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
        
        <!-- Basic Settings Section -->
        <div class="bg-white p-3 rounded-lg border border-gray-200">
          <h3 class="text-sm font-medium text-gray-900 mb-3 border-b pb-2">การตั้งค่าพื้นฐาน</h3>
          
          <!-- Button Text -->
          <div class="mb-3">
            <label class="block text-xs font-medium text-gray-700 mb-1">ข้อความบนปุ่ม</label>
            <input 
              v-model="localConfig.text" 
              type="text" 
              class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="`เข้าสู่ระบบด้วย ${serviceName}`"
            >
          </div>

          <!-- Debug Sub Text -->
          <div class="mb-3">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-medium text-gray-700">
                <span class="flex items-center">
                  <span>ข้อความย่อย (Debug)</span>
                  <span class="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[9px] rounded font-medium">DEBUG</span>
                </span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="localConfig.enableDebug"
                  class="form-checkbox h-3 w-3 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                >
                <span class="ml-1 text-xs text-gray-600">เปิดใช้งาน</span>
              </label>
            </div>
            <div v-if="localConfig.enableDebug" class="space-y-2">
              <input 
                v-model="localConfig.subText" 
                type="text" 
                class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                placeholder="เช่น: {{service}} {{env}} {{version}}, Development Mode"
              >
              <div class="text-[10px] text-gray-500 space-y-1">
                <p>💡 ข้อความเล็กๆ ที่แสดงใต้ชื่อปุ่ม สำหรับ debug หรือข้อมูลเพิ่มเติม</p>
                <p>🔧 ใช้ template: <code class="bg-gray-100 px-1 rounded">{{service}}</code> <code class="bg-gray-100 px-1 rounded">{{env}}</code> <code class="bg-gray-100 px-1 rounded">{{version}}</code> <code class="bg-gray-100 px-1 rounded">{{size}}</code></p>
                <div class="flex gap-1 mt-2 flex-wrap">
                  <button @click="localConfig.subText = '{{service}} {{env}}'" class="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[9px] hover:bg-purple-200 transition-colors">Service + Env</button>
                  <button @click="localConfig.subText = '{{version}}'" class="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[9px] hover:bg-purple-200 transition-colors">Version</button>
                  <button @click="localConfig.subText = 'Debug Mode'" class="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[9px] hover:bg-purple-200 transition-colors">Debug</button>
                  <button @click="localConfig.subText = ''" class="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] hover:bg-gray-200 transition-colors">ล้าง</button>
                </div>
              </div>
            </div>

            <div v-else class="text-xs text-gray-400 italic py-2 border border-dashed border-gray-200 rounded text-center">
              เปิดใช้งานเพื่อแสดงข้อความ Debug ใต้ปุ่ม
            </div>
          </div>

          <!-- Size and Width in 2 columns -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">ขนาดปุ่ม</label>
              <select 
                v-model="localConfig.size" 
                class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="small">เล็ก</option>
                <option value="medium">กลาง</option>
                <option value="large">ใหญ่</option>
                <option value="xl">ใหญ่พิเศษ</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">ความกว้างปุ่ม</label>
              <select 
                v-model="localConfig.width" 
                class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="auto">ปรับตามเนื้อหา</option>
                <option value="full">เต็มความกว้าง</option>
                <option value="200px">200px</option>
                <option value="250px">250px</option>
                <option value="300px">300px</option>
              </select>
            </div>
          </div>

          <!-- Button Style -->
          <div class="mt-3">
            <label class="block text-xs font-medium text-gray-700 mb-2">รูปแบบปุ่ม</label>
            <div class="flex space-x-4">
              <label class="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  v-model="localConfig.rounded" 
                  value="false" 
                  class="form-radio mr-2"
                >
                <span class="text-xs">มุมแหลม</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  v-model="localConfig.rounded" 
                  value="true" 
                  class="form-radio mr-2"
                >
                <span class="text-xs">มุมมน</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Color Settings Section -->
        <div class="bg-white p-3 rounded-lg border border-gray-200">
          <h3 class="text-sm font-medium text-gray-900 mb-3 border-b pb-2">การตั้งค่าสี</h3>
          
          <div class="space-y-3">
            <!-- Normal State Colors -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">สีพื้นหลัง</label>
                <div class="flex items-center space-x-2">
                  <input 
                    v-model="localConfig.backgroundColor" 
                    type="color" 
                    class="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  >
                  <input 
                    v-model="localConfig.backgroundColor" 
                    type="text" 
                    class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">สีข้อความ</label>
                <div class="flex items-center space-x-2">
                  <input 
                    v-model="localConfig.textColor" 
                    type="color" 
                    class="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  >
                  <input 
                    v-model="localConfig.textColor" 
                    type="text" 
                    class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                </div>
              </div>
            </div>

            <!-- Hover State Colors -->
            <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  <span class="flex items-center">
                    <span>สีพื้นหลัง (Hover)</span>
                    <span class="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[9px] rounded font-medium">HOVER</span>
                  </span>
                </label>
                <div class="flex items-center space-x-2">
                  <input 
                    v-model="localConfig.hoverBackgroundColor" 
                    type="color" 
                    class="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  >
                  <input 
                    v-model="localConfig.hoverBackgroundColor" 
                    type="text" 
                    class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  <span class="flex items-center">
                    <span>สีข้อความ (Hover)</span>
                    <span class="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[9px] rounded font-medium">HOVER</span>
                  </span>
                </label>
                <div class="flex items-center space-x-2">
                  <input 
                    v-model="localConfig.hoverTextColor" 
                    type="color" 
                    class="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                  >
                  <input 
                    v-model="localConfig.hoverTextColor" 
                    type="text" 
                    class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Icon Settings Section -->
        <div class="bg-white p-3 rounded-lg border border-gray-200">
          <h3 class="text-sm font-medium text-gray-900 mb-3 border-b pb-2">การตั้งค่าไอคอน</h3>
          
          <div class="space-y-3">
            <!-- Icon Display and Size -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">แสดงไอคอน</label>
                <select v-model="localConfig.iconDisplay" class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="none">ไม่แสดง</option>
                  <option value="left">แสดงทางซ้าย</option>
                  <option value="right">แสดงทางขวา</option>
                </select>
              </div>
              
              <div v-if="localConfig.iconDisplay !== 'none'">
                <label class="block text-xs font-medium text-gray-700 mb-1">ขนาดไอคอน</label>
                <select v-model="localConfig.iconSize" class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="16">เล็ก (16px)</option>
                  <option value="20">กลาง (20px)</option>
                  <option value="24">ใหญ่ (24px)</option>
                </select>
              </div>
            </div>

            <!-- Icon Color -->
            <div v-if="localConfig.iconDisplay !== 'none'">
              <label class="block text-xs font-medium text-gray-700 mb-1">
                <span class="flex items-center">
                  <span>สีไอคอน</span>
                  <span class="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[9px] rounded font-medium">ICON</span>
                </span>
              </label>
              <div class="flex items-center space-x-2">
                <input 
                  v-model="localConfig.iconColor" 
                  type="color" 
                  class="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                >
                <input 
                  v-model="localConfig.iconColor" 
                  type="text" 
                  class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
              </div>
              <div class="text-[10px] text-gray-500 mt-1 space-y-1">
                <p>💡 เปลี่ยนสีไอคอนจาก Icons8 (ไม่รวม # ใน hex code)</p>
                <div class="flex gap-1 flex-wrap">
                  <button @click="localConfig.iconColor = '#ffffff'" class="px-1.5 py-0.5 bg-white text-gray-800 border border-gray-300 rounded text-[9px] hover:bg-gray-50 transition-colors">ขาว</button>
                  <button @click="localConfig.iconColor = '#000000'" class="px-1.5 py-0.5 bg-black text-white rounded text-[9px] hover:bg-gray-800 transition-colors">ดำ</button>
                  <button @click="localConfig.iconColor = '#3b82f6'" class="px-1.5 py-0.5 bg-blue-500 text-white rounded text-[9px] hover:bg-blue-600 transition-colors">น้ำเงิน</button>
                  <button @click="localConfig.iconColor = '#ef4444'" class="px-1.5 py-0.5 bg-red-500 text-white rounded text-[9px] hover:bg-red-600 transition-colors">แดง</button>
                  <button @click="localConfig.iconColor = '#22c55e'" class="px-1.5 py-0.5 bg-green-500 text-white rounded text-[9px] hover:bg-green-600 transition-colors">เขียว</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Panel: Preview -->
      <div class="w-1/2 p-4 bg-gray-50 rounded-lg">

        <!-- Template Selector -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Templates</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div 
              v-for="template in buttonTemplates" 
              :key="template.name"
              class="cursor-pointer border-2 rounded-lg p-3 hover:shadow-md transition-all relative"
              :class="isCurrentTemplate(template) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
              @click="applyTemplate(template)"
            >
              <!-- Active Template Badge -->
              <div 
                v-if="isCurrentTemplate(template)" 
                class="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
              >
                ✓
              </div>
              <div class="text-center mb-2">
                <div class="text-sm font-medium text-gray-900">{{ template.name }}</div>
              </div>
              
              <!-- Mini Preview -->
              <div class="flex justify-center">
                <div 
                  class="px-3 py-1.5 rounded text-xs font-medium transition-all inline-flex items-center gap-1 template-button-preview"
                  :style="{
                    backgroundColor: template.config.backgroundColor,
                    color: template.config.textColor,
                    borderRadius: template.config.borderRadius === 'none' ? '0' :
                                  template.config.borderRadius === 'small' ? '0.25rem' :
                                  template.config.borderRadius === 'medium' ? '0.375rem' :
                                  template.config.borderRadius === 'large' ? '0.5rem' :
                                  template.config.borderRadius === 'xl' ? '0.75rem' :
                                  template.config.borderRadius === 'full' ? '9999px' : '0.375rem',
                    '--hover-bg': template.config.hoverBackgroundColor,
                    '--hover-color': template.config.hoverTextColor
                  }"
                >
                  <img 
                    v-if="template.config.showIcon"
                    :src="`https://img.icons8.com/color/16/${template.config.iconName}.png`"
                    :alt="serviceName"
                    class="w-3 h-3"
                  />
                  {{ serviceName }}
                </div>
              </div>
              
              <!-- Debug Preview -->
              <div v-if="template.config.enableDebug && template.config.subText" class="text-center mt-1">
                <div class="text-xs text-gray-400">{{ template.config.subText }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">ตัวอย่างปุ่ม</label>
          <p class="text-xs text-gray-500 mb-3">💡 เอาเมาส์ไปชี้เพื่อดู Hover Effect</p>
          <div class="flex justify-center p-6 bg-white rounded-md border-2 border-dashed border-gray-300 mb-4">
            <button 
              :class="[buttonClasses, `preview-button-${serviceType}`]"
              :style="buttonStyles"
              @click.prevent
            >
              <div class="flex items-center justify-center w-full">
                <span v-if="localConfig.iconDisplay === 'left'" class="mr-2 inline-flex items-center">
                  <!-- Dynamic Icon -->
                  <img v-if="['microsoft', 'google', 'line', 'facebook'].includes(serviceType)" 
                       :src="dynamicIconUrl" 
                       :alt="serviceName" 
                       :width="parseInt(localConfig.iconSize) || 20" 
                       :height="parseInt(localConfig.iconSize) || 20"
                       class="inline-block"
                       @error="handleIconError" />
                  <span v-else>📁</span>
                </span>
                
                <!-- Main Content -->
                <div class="flex flex-col items-center">
                  <span class="inline leading-tight">{{ localConfig.text || 'เข้าสู่ระบบ' }}</span>
                  <span v-if="debugInfo" class="text-xs opacity-75 leading-tight mt-0.5 sub-text">{{ debugInfo }}</span>
                </div>
                
                <span v-if="localConfig.iconDisplay === 'right'" class="ml-2 inline-flex items-center">
                  <!-- Dynamic Icon -->
                  <img v-if="['microsoft', 'google', 'line', 'facebook'].includes(serviceType)" 
                       :src="dynamicIconUrl" 
                       :alt="serviceName" 
                       :width="parseInt(localConfig.iconSize) || 20" 
                       :height="parseInt(localConfig.iconSize) || 20"
                       class="inline-block"
                       @error="handleIconError" />
                  <span v-else>📁</span>
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- JSON Configuration Preview -->
        <div class="bg-gray-50 rounded-lg border border-gray-200">
          <div class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg">
            <h4 class="text-xs font-medium text-gray-700 flex items-center">
              <span>📄 JSON Configuration</span>
              <button 
                @click="copyConfigToClipboard" 
                class="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                คัดลอก JSON
              </button>
            </h4>
          </div>
          <div class="p-3 max-h-48 overflow-y-auto">
            <pre class="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">{{ formattedConfigJson }}</pre>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>


export default {
  name: 'LoginButtonCustomizer',
  props: {
    serviceName: {
      type: String,
      required: true
    },
    serviceType: {
      type: String,
      required: true // 'microsoft', 'google', 'facebook', 'line'
    },
    initialConfig: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:config'],
  data() {
    return {
      isInitializing: true,
      localConfig: {
        text: '',
        subText: '',
        enableDebug: false,
        backgroundColor: '#4f46e5',
        textColor: '#ffffff',
        hoverBackgroundColor: '#4338ca',
        hoverTextColor: '#ffffff',
        size: 'medium',
        rounded: 'true',
        iconDisplay: 'left',
        iconSize: '20',
        iconColor: '#ffffff',
        width: 'full'
      }
    };
  },
  computed: {
    defaultConfigs() {
      const configs = {
        microsoft: {
          text: `เข้าสู่ระบบด้วย ${this.serviceName}`,
          subText: '',
          enableDebug: false,
          backgroundColor: '#0078d4',
          textColor: '#ffffff',
          hoverBackgroundColor: '#106ebe',
          hoverTextColor: '#ffffff',
          size: 'medium',
          rounded: 'true',
          iconDisplay: 'left',
          iconSize: '20',
          iconColor: '#ffffff',
          width: 'full'
        },
        google: {
          text: `เข้าสู่ระบบด้วย ${this.serviceName}`,
          subText: '',
          enableDebug: false,
          backgroundColor: '#4285f4',
          textColor: '#ffffff',
          hoverBackgroundColor: '#3367d6',
          hoverTextColor: '#ffffff',
          size: 'medium',
          rounded: 'true',
          iconDisplay: 'left',
          iconSize: '20',
          iconColor: '#ffffff',
          width: 'full'
        },
        facebook: {
          text: `เข้าสู่ระบบด้วย ${this.serviceName}`,
          subText: '',
          enableDebug: false,
          backgroundColor: '#1877f2',
          textColor: '#ffffff',
          hoverBackgroundColor: '#166fe5',
          hoverTextColor: '#ffffff',
          size: 'medium',
          rounded: 'true',
          iconDisplay: 'left',
          iconSize: '20',
          iconColor: '#ffffff',
          width: 'full'
        },
        line: {
          text: `เข้าสู่ระบบด้วย ${this.serviceName}`,
          subText: '',
          enableDebug: false,
          backgroundColor: '#00b900',
          textColor: '#ffffff',
          hoverBackgroundColor: '#009e00',
          hoverTextColor: '#ffffff',
          size: 'medium',
          rounded: 'true',
          iconDisplay: 'left',
          iconSize: '20',
          iconColor: '#ffffff',
          width: 'full'
        }
      };
      return configs[this.serviceType] || configs.microsoft;
    },
    buttonClasses() {
      const sizeClasses = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl'
      };
      
      const baseClasses = 'font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center justify-center';
      const sizeClass = sizeClasses[this.localConfig.size] || sizeClasses.medium;
      const roundedClass = this.localConfig.rounded === 'true' ? 'rounded-full' : 'rounded-md';
      const widthClass = this.localConfig.width === 'full' ? 'w-full' : '';
      
      return `${baseClasses} ${sizeClass} ${roundedClass} ${widthClass}`;
    },
    buttonStyles() {
      const styles = {
        backgroundColor: this.localConfig.backgroundColor,
        color: this.localConfig.textColor,
      };
      
      if (this.localConfig.width !== 'full' && this.localConfig.width !== 'auto') {
        styles.width = this.localConfig.width;
      }
      
      // ไม่ต้องใช้ top position อีกแล้ว เพราะมีแค่ left/right
      
      return styles;
    },
    iconColorHex() {
      // Remove # from color if present
      return this.localConfig.iconColor.replace('#', '').toUpperCase();
    },
    dynamicIconUrl() {
      const iconPaths = {
        microsoft: 'ios-filled/50/{{color}}/microsoft.png',
        google: 'glyph-neue/64/{{color}}/google-logo.png',
        line: 'ios-filled/50/{{color}}/line-me.png',
        facebook: 'ios-filled/50/{{color}}/facebook--v1.png'
      };
      
      const path = iconPaths[this.serviceType] || iconPaths.microsoft;
      return `https://img.icons8.com/${path.replace('{{color}}', this.iconColorHex)}`;
    },
    debugInfo() {
      if (!this.localConfig.enableDebug || !this.localConfig.subText) return '';
      
      if (this.localConfig.subText.includes('{{')) {
        // Replace template variables with actual values
        let debugText = this.localConfig.subText;
        debugText = debugText.replace('{{service}}', this.serviceType.toUpperCase());
        debugText = debugText.replace('{{size}}', this.localConfig.size);
        debugText = debugText.replace('{{version}}', 'v1.0.0');
        debugText = debugText.replace('{{env}}', 'development');
        return debugText;
      }
      
      return this.localConfig.subText;
    },
    buttonTemplates() {
      const serviceName = this.serviceName;
      
      return [
        {
          name: 'Default',
          description: 'ปุ่มมาตรฐานแบบ brand สี',
          config: {
            text: `เข้าสู่ระบบด้วย ${serviceName}`,
            subText: '',
            enableDebug: false,
            backgroundColor: this.defaultConfigs.backgroundColor,
            textColor: this.defaultConfigs.textColor,
            hoverBackgroundColor: this.defaultConfigs.hoverBackgroundColor,
            hoverTextColor: this.defaultConfigs.hoverTextColor,
            size: 'medium',
            rounded: 'true',
            iconDisplay: 'left',
            iconSize: '20',
            iconColor: '#ffffff',
            width: 'full'
          }
        },
        {
          name: 'Minimal',
          description: 'ปุ่มสีขาวขอบเทา สำหรับ secondary',
          config: {
            text: `Login with ${serviceName}`,
            subText: '',
            enableDebug: false,
            backgroundColor: '#ffffff',
            textColor: '#374151',
            hoverBackgroundColor: '#f9fafb',
            hoverTextColor: '#111827',
            size: 'medium',
            rounded: 'true',
            iconDisplay: 'left',
            iconSize: '18',
            iconColor: '#6b7280',
            width: 'full'
          }
        },
        {
          name: 'Dark Mode',
          description: 'ปุ่มโทนสีเข้มสำหรับ dark theme',
          config: {
            text: `${serviceName} Sign In`,
            subText: '',
            enableDebug: false,
            backgroundColor: '#1f2937',
            textColor: '#f9fafb',
            hoverBackgroundColor: '#374151',
            hoverTextColor: '#ffffff',
            size: 'medium',
            rounded: 'true',
            iconDisplay: 'left',
            iconSize: '20',
            iconColor: '#ffffff',
            width: 'full'
          }
        },
        {
          name: 'Compact',
          description: 'ปุ่มขนาดเล็ก เหมาะสำหรับพื้นที่จำกัด',
          config: {
            text: serviceName,
            subText: '',
            enableDebug: false,
            backgroundColor: this.defaultConfigs.backgroundColor,
            textColor: this.defaultConfigs.textColor,
            hoverBackgroundColor: this.defaultConfigs.hoverBackgroundColor,
            hoverTextColor: this.defaultConfigs.hoverTextColor,
            size: 'small',
            rounded: 'true',
            iconDisplay: 'left',
            iconSize: '16',
            iconColor: '#ffffff',
            width: 'auto'
          }
        },
        {
          name: 'Professional',
          description: 'ปุ่มแบบองค์กร มุมแหลม และ formal',
          config: {
            text: `Continue with ${serviceName}`,
            subText: '',
            enableDebug: false,
            backgroundColor: '#0f172a',
            textColor: '#ffffff',
            hoverBackgroundColor: '#334155',
            hoverTextColor: '#ffffff',
            size: 'large',
            rounded: 'false',
            iconDisplay: 'right',
            iconSize: '24',
            iconColor: '#ffffff',
            width: 'full'
          }
        },
        {
          name: 'Developer',
          description: 'ปุ่มสำหรับนักพัฒนา พร้อม debug info',
          config: {
            text: `Dev Login ${serviceName}`,
            subText: '',
            enableDebug: false,
            backgroundColor: '#7c3aed',
            textColor: '#ffffff',
            hoverBackgroundColor: '#6d28d9',
            hoverTextColor: '#ffffff',
            size: 'medium',
            rounded: 'true',
            iconDisplay: 'left',
            iconSize: '20',
            iconColor: '#ffffff',
            width: 'full'
          }
        }
      ];
    },
    completeConfig() {
      // สร้าง config object ที่สมบูรณ์ รวม URL ของไอคอน
      return {
        // Basic Settings
        text: this.localConfig.text || `เข้าสู่ระบบด้วย ${this.serviceName}`,
        subText: this.localConfig.enableDebug ? this.debugInfo : null,
        enableDebug: this.localConfig.enableDebug,
        
        // Styling
        backgroundColor: this.localConfig.backgroundColor,
        textColor: this.localConfig.textColor,
        hoverBackgroundColor: this.localConfig.hoverBackgroundColor,
        hoverTextColor: this.localConfig.hoverTextColor,
        
        // Layout
        size: this.localConfig.size,
        width: this.localConfig.width,
        rounded: this.localConfig.rounded === 'true',
        
        // Icon Settings
        icon: {
          display: this.localConfig.iconDisplay,
          size: parseInt(this.localConfig.iconSize) || 20,
          color: this.localConfig.iconColor,
          url: this.localConfig.iconDisplay !== 'none' ? this.dynamicIconUrl : null
        },
        
        // Meta Information
        serviceType: this.serviceType,
        serviceName: this.serviceName,
        generatedAt: new Date().toISOString(),
        
        // CSS Class Reference
        cssClass: `login-button-${this.serviceType}`,
        
        // Generated Styles (for reference)
        computedStyles: {
          padding: this.getPaddingFromSize(),
          fontSize: this.getFontSizeFromSize(),
          borderRadius: this.localConfig.rounded === 'true' ? '9999px' : '0.375rem'
        }
      };
    },
    formattedConfigJson() {
      return JSON.stringify(this.completeConfig, null, 2);
    },
    generatedCSS() {
      const cssClass = `.login-button-${this.serviceType}`;
      const css = `${cssClass} {
  background-color: ${this.localConfig.backgroundColor};
  color: ${this.localConfig.textColor};
  padding: ${this.getPaddingFromSize()};
  font-size: ${this.getFontSizeFromSize()};
  font-weight: 500;
  border-radius: ${this.localConfig.rounded === 'true' ? '9999px' : '0.375rem'};
  width: ${this.localConfig.width === 'full' ? '100%' : this.localConfig.width === 'auto' ? 'auto' : this.localConfig.width};
  display: inline-flex;
  align-items: center;
  justify-content: center;

  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

${cssClass}:hover {
  background-color: ${this.localConfig.hoverBackgroundColor};
  color: ${this.localConfig.hoverTextColor};
}

${cssClass}:focus {
  outline: none;
  box-shadow: 0 0 0 2px ${this.localConfig.backgroundColor}33;
}

/* Sub text styling */
${cssClass} .sub-text {
  font-size: 0.75rem;
  opacity: 0.75;
  line-height: 1.2;
  margin-top: 0.125rem;
}`;
      return css;
    }
  },
  watch: {
    localConfig: {
      handler(newConfig) {
        // Skip emitting during initialization to prevent infinite loop
        if (this.isInitializing) return;
        
        // Emit both the raw config and the complete config
        this.$emit('update:config', {
          ...newConfig,
          completeConfig: this.completeConfig
        });
        // Emit configuration-changed for parent modal with complete config
        this.$emit('configuration-changed', this.serviceType, { 
          ...newConfig,
          completeConfig: this.completeConfig 
        });
      },
      deep: true
    },
    'localConfig.enableDebug'(newVal) {
      // Clear subText when disabling debug
      if (!newVal) {
        this.localConfig.subText = '';
      }
    },
    initialConfig: {
      handler(newConfig) {
        console.log('initialConfig changed:', newConfig);
        console.log('defaultConfigs:', this.defaultConfigs);
        
        this.isInitializing = true;
        if (Object.keys(newConfig).length > 0) {
          this.localConfig = { ...this.defaultConfigs, ...newConfig };
          console.log('localConfig after merge:', this.localConfig);
        }
        this.$nextTick(() => {
          this.isInitializing = false;
        });
      },
      immediate: true
    }
  },
  mounted() {
    console.log('Component mounted, initialConfig:', this.initialConfig);
    // Don't reset if we have initialConfig with data
    if (!this.initialConfig || Object.keys(this.initialConfig).length === 0) {
      console.log('No initialConfig, resetting to default');
      this.isInitializing = true;
      this.resetToDefault();
      this.$nextTick(() => {
        this.isInitializing = false;
      });
    } else {
      console.log('Has initialConfig, skipping reset');
    }
  },
  methods: {
    resetToDefault() {
      this.localConfig = { ...this.defaultConfigs };
    },
    
    applyTemplate(template) {
      // Temporarily disable watcher to prevent multiple emissions
      this.isInitializing = true;
      
      // Apply template configuration to localConfig
      Object.keys(template.config).forEach(key => {
        if (key !== 'text') { // Keep current service name
          this.localConfig[key] = template.config[key];
        }
      });
      
      // Re-enable watcher and emit once
      this.$nextTick(() => {
        this.isInitializing = false;
        // Manually emit the final configuration
        this.$emit('update:config', {
          ...this.localConfig,
          completeConfig: this.completeConfig
        });
        this.$emit('configuration-changed', this.serviceType, { 
          ...this.localConfig,
          completeConfig: this.completeConfig 
        });
      });
    },
    
    isCurrentTemplate(template) {
      // Check if current config matches template (excluding text)
      const matches = Object.keys(template.config).every(key => {
        if (key === 'text') return true; // Ignore text comparison
        const currentValue = this.localConfig[key];
        const templateValue = template.config[key];
        const isMatch = currentValue === templateValue;
        
        if (!isMatch) {
          console.log(`Template ${template.name} mismatch - ${key}:`, 
            `current=${currentValue}, template=${templateValue}`);
        }
        
        return isMatch;
      });
      
      if (matches) {
        console.log(`✅ Template ${template.name} matches current config`);
      }
      
      return matches;
    },
    
    getPaddingFromSize() {
      const paddingMap = {
        small: '0.375rem 0.75rem',
        medium: '0.5rem 1rem', 
        large: '0.75rem 1.5rem',
        xl: '1rem 2rem'
      };
      return paddingMap[this.localConfig.size] || paddingMap.medium;
    },
    getFontSizeFromSize() {
      const fontSizeMap = {
        small: '0.875rem',
        medium: '1rem',
        large: '1.125rem', 
        xl: '1.25rem'
      };
      return fontSizeMap[this.localConfig.size] || fontSizeMap.medium;
    },
    handleIconError(event) {
      console.warn('Icon failed to load:', event.target.src);
      // Fallback to white icon if color fails
      if (this.localConfig.iconColor !== '#ffffff') {
        event.target.src = event.target.src.replace(this.iconColorHex, 'FFFFFF');
      }
    },
    async copyConfigToClipboard() {
      try {
        await navigator.clipboard.writeText(this.formattedConfigJson);
        
        // Show success notification (you can customize this based on your notification system)
        alert('คัดลอก JSON Configuration สำเร็จ!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        
        // Fallback method for older browsers
        try {
          const textArea = document.createElement('textarea');
          textArea.value = this.formattedConfigJson;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          alert('คัดลอก JSON Configuration สำเร็จ!');
        } catch (fallbackError) {
          console.error('Fallback copy method also failed:', fallbackError);
          alert('ไม่สามารถคัดลอกได้ กรุณาคัดลอกด้วยตนเอง');
        }
      }
    }
  }
};
</script>

<style scoped>
.login-button-customizer {
  max-width: 100%;
}

.form-radio:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.form-checkbox:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Purple checkbox for debug toggle */
.form-checkbox:checked.text-purple-600 {
  background-color: #9333ea;
  border-color: #9333ea;
}

/* JSON viewer styling */
pre {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background-color: #f8f9fa;
  border-radius: 4px;
}

/* Scrollbar styling for JSON viewer */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

<style>
/* Dynamic hover styles for preview buttons */
.preview-button-microsoft:hover:not(:disabled) {
  background-color: v-bind('localConfig.hoverBackgroundColor') !important;
  color: v-bind('localConfig.hoverTextColor') !important;
}

.preview-button-google:hover:not(:disabled) {
  background-color: v-bind('localConfig.hoverBackgroundColor') !important;
  color: v-bind('localConfig.hoverTextColor') !important;
}

.preview-button-facebook:hover:not(:disabled) {
  background-color: v-bind('localConfig.hoverBackgroundColor') !important;
  color: v-bind('localConfig.hoverTextColor') !important;
}

.preview-button-line:hover:not(:disabled) {
  background-color: v-bind('localConfig.hoverBackgroundColor') !important;
  color: v-bind('localConfig.hoverTextColor') !important;
}

/* Template preview hover effects */
.template-button-preview:hover {
  background-color: var(--hover-bg) !important;
  color: var(--hover-color) !important;
}
</style>