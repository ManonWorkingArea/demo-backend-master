<template>
  <div>
    <!-- Modal Backdrop -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <!-- Modal Content -->
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-modal-in">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-600">
              <img v-if="currentService.iconType === 'image'" 
                   :src="currentService.iconUrl" 
                   :alt="currentService.name" 
                   class="w-6 h-6"/>
              <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path :d="currentService.icon"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ currentService.name }}</h3>
              <p class="text-sm text-gray-500">{{ currentService.description }}</p>
            </div>
          </div>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-6">
          <!-- Section 1: วิธีการตั้งค่า -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">วิธีการตั้งค่า</h3>
            
            <div class="space-y-3">
              <div v-for="(step, index) in getSetupSteps(currentService.steps)" :key="index" class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 text-xs font-medium rounded-full flex items-center justify-center bg-gray-200 text-gray-700">
                  {{ index + 1 }}
                </span>
                <div class="flex-1">
                  <p class="text-sm text-gray-800 leading-relaxed mb-1" v-html="step.text"></p>
                  <p v-if="step.detail" class="text-xs text-gray-500 leading-relaxed" v-html="step.detail"></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-gray-200"></div>

          <!-- Section 2: ข้อมูลที่ต้องนำมาใช้ -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">ข้อมูลที่ต้องนำมาใช้</h3>
            
            <div class="space-y-4">
              <!-- Redirect URI -->
              <div>
                <label class="text-sm font-medium text-gray-700 mb-2 block">Redirect URI</label>
                <div class="relative">
                  <input type="text" 
                         :value="redirectUrl" 
                         readonly
                         class="w-full px-3 py-2 pr-10 text-sm font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded focus:outline-none">
                  <button @click="copyUrl" 
                          class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="คัดลอก Redirect URI">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Required Fields -->
              <div>
                <label class="text-sm font-medium text-gray-700 mb-2 block">ข้อมูลที่ต้องกรอกในฟอร์ม</label>
                <div class="space-y-2">
                  <div v-for="field in getRequiredFields(currentService.id)" :key="field.name" 
                       class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded border border-gray-200">
                    <span class="text-sm text-gray-800">{{ field.name }}</span>
                    <span class="text-xs text-gray-500">{{ field.source }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-gray-200"></div>

          <!-- Section 3: เอกสารและคู่มือ -->
          <div v-if="currentService.documentation">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              <svg class="w-5 h-5 inline mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              เอกสารและคู่มือ
            </h3>
            
            <div class="grid gap-4 sm:grid-cols-2">
              <div v-for="doc in currentService.documentation" :key="doc.title" 
                   class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div class="flex items-start gap-3">
                  <div :class="['w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium', doc.bgColor || 'bg-blue-600']">
                    <svg v-if="doc.type === 'official'" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5z"/>
                    </svg>
                    <svg v-else-if="doc.type === 'guide'" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 mb-1 truncate">{{ doc.title }}</h4>
                    <p class="text-xs text-gray-500 mb-2 line-clamp-2">{{ doc.description }}</p>
                    <a :href="doc.url" target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium">
                      เปิดดู
                      <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200">
          <button @click="closeModal" 
                  class="w-full px-4 py-2 text-white bg-gray-800 hover:bg-gray-900 font-medium rounded transition-colors">
            รับทราบ
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="showToast" class="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50 animate-toast-in">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        คัดลอกสำเร็จ!
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginServiceHelper',
  data() {
    return {
      showModal: false,
      showToast: false,
      currentService: {},
      currentHostname: '',
      loginServices: [
        {
          id: 'microsoft',
          name: 'Microsoft Office 365',
          description: 'คำแนะนำการตั้งค่า OAuth Application',
          path: 'microsoft',
          icon: 'M2 2h9v9H2V2zm0 11h9v9H2v-9zm11-11h9v9h-9V2zm0 11h9v9h-9v-9z',
          colors: {
            gradient: 'from-blue-500 to-blue-600',
            primary: 'blue-600',
            secondary: 'blue-100',
            border: 'blue-500',
            text: 'blue-800',
            bg: 'from-blue-50 to-blue-100',
            borderColor: 'blue-200',
            buttonBg: 'blue-600',
            buttonHover: 'blue-700',
            confirmButton: '#3b82f6'
          },
          steps: [
            { 
              text: 'เข้าสู่ <strong>Azure Portal</strong> ที่ <a href="https://portal.azure.com" target="_blank" class="text-blue-600 hover:underline">portal.azure.com</a>',
              detail: 'ใช้บัญชี Microsoft ที่มีสิทธิ์ Administrator ในการจัดการ Azure Active Directory'
            },
            { 
              text: 'ไปที่ <strong>Azure Active Directory</strong> → <strong>App registrations</strong> → <strong>New registration</strong>',
              detail: 'ตั้งชื่อแอปพลิเคชัน และเลือก "Accounts in this organizational directory only"'
            },
            { 
              text: 'ในหน้า <strong>Authentication</strong> เพิ่ม <strong>Redirect URI</strong> ประเภท <strong>Web</strong>',
              detail: 'คัดลอก URL ข้างบนและวางในช่อง Redirect URIs'
            },
            { 
              text: 'ไปที่ <strong>Certificates & secrets</strong> → <strong>New client secret</strong>',
              detail: 'สร้าง Client Secret ใหม่และบันทึกค่าที่ได้ทันที (จะไม่แสดงอีก)'
            },
            { 
              text: 'คัดลอก <strong>Application (client) ID</strong>, <strong>Client Secret</strong>, และ <strong>Directory (tenant) ID</strong>',
              detail: 'ค่าเหล่านี้จะใช้ในการตั้งค่าระบบ OAuth ของคุณ'
            }
          ],
          documentation: [
            {
              type: 'official',
              title: 'Azure App Registration Portal',
              description: 'หน้าจัดการแอปพลิเคชัน Azure AD',
              url: 'https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps',
              bgColor: 'bg-blue-600'
            },
            {
              type: 'guide',
              title: 'OAuth 2.0 Authorization Code Flow',
              description: 'คู่มือการใช้งาน OAuth 2.0 Authorization Code Flow',
              url: 'https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow',
              bgColor: 'bg-indigo-600'
            }
          ]
        },
        {
          id: 'google',
          name: 'Google GSuite',
          description: 'คำแนะนำการตั้งค่า Google OAuth',
          path: 'google',
          icon: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z',
          colors: {
            gradient: 'from-green-500 to-green-600',
            primary: 'green-600',
            secondary: 'green-100',
            border: 'green-500',
            text: 'green-800',
            bg: 'from-green-50 to-emerald-100',
            borderColor: 'green-200',
            buttonBg: 'green-600',
            buttonHover: 'green-700',
            confirmButton: '#22c55e'
          },
          steps: [
            { 
              text: 'เข้าสู่ <strong>Google Cloud Console</strong> ที่ <a href="https://console.cloud.google.com" target="_blank" class="text-blue-600 hover:underline">console.cloud.google.com</a>',
              detail: 'สร้างโปรเจ็กต์ใหม่หรือเลือกโปรเจ็กต์ที่มีอยู่แล้ว'
            },
            { 
              text: 'เปิดใช้งาน <strong>Google+ API</strong> ใน <strong>APIs & Services</strong> → <strong>Library</strong>',
              detail: 'ค้นหา "Google+ API" และคลิก "Enable" เพื่อเปิดใช้งาน'
            },
            { 
              text: 'ไปที่ <strong>APIs & Services</strong> → <strong>Credentials</strong> → <strong>Create Credentials</strong>',
              detail: 'เลือก "OAuth client ID" และตั้งค่า OAuth consent screen ก่อน (ถ้าจำเป็น)'
            },
            { 
              text: 'เลือก <strong>Web application</strong> และตั้งชื่อ',
              detail: 'ในส่วน "Authorized redirect URIs" เพิ่ม URL ที่แสดงข้างบน'
            },
            { 
              text: 'บันทึก <strong>Client ID</strong> และ <strong>Client Secret</strong>',
              detail: 'ค่าทั้งสองนี้จะใช้ในการตั้งค่าระบบ Google OAuth'
            }
          ],
          documentation: [
            {
              type: 'official',
              title: 'Google Cloud Console',
              description: 'หน้าจัดการโปรเจ็กต์และ API ของ Google Cloud',
              url: 'https://console.cloud.google.com/',
              bgColor: 'bg-blue-600'
            },
            {
              type: 'guide',
              title: 'OAuth 2.0 for Web Server Applications',
              description: 'เอกสารการใช้งาน OAuth 2.0 สำหรับเว็บแอปพลิเคชัน',
              url: 'https://developers.google.com/identity/protocols/oauth2/web-server',
              bgColor: 'bg-green-600'
            }
          ]
        },
        {
          id: 'facebook',
          name: 'Facebook Login',
          description: 'คำแนะนำการตั้งค่า Facebook App',
          path: 'facebook',
          icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
          colors: {
            gradient: 'from-indigo-500 to-purple-600',
            primary: 'indigo-600',
            secondary: 'indigo-100',
            border: 'indigo-500',
            text: 'indigo-800',
            bg: 'from-indigo-50 to-purple-100',
            borderColor: 'indigo-200',
            buttonBg: 'indigo-600',
            buttonHover: 'indigo-700',
            confirmButton: '#6366f1'
          },
          steps: [
            { 
              text: 'เข้าสู่ <strong>Facebook for Developers</strong> ที่ <a href="https://developers.facebook.com" target="_blank" class="text-blue-600 hover:underline">developers.facebook.com</a>',
              detail: 'ใช้บัญชี Facebook ของคุณในการเข้าสู่ระบบ'
            },
            { 
              text: 'ไปที่ <strong>My Apps</strong> → <strong>Create App</strong>',
              detail: 'เลือกประเภท "Consumer" และใส่ชื่อแอปพลิเคชัน'
            },
            { 
              text: 'เพิ่ม <strong>Facebook Login</strong> product',
              detail: 'ในหน้า Dashboard ของแอป คลิก "Add Product" และเลือก "Facebook Login"'
            },
            { 
              text: 'ไปที่ <strong>Facebook Login</strong> → <strong>Settings</strong>',
              detail: 'ในส่วน "Valid OAuth Redirect URIs" เพิ่ม URL ที่แสดงข้างบน'
            },
            { 
              text: 'ไปที่ <strong>Settings</strong> → <strong>Basic</strong>',
              detail: 'คัดลอก "App ID" และ "App Secret" (คลิก Show เพื่อดู Secret)'
            },
            { 
              text: 'เปลี่ยนโหมดแอปเป็น <strong>Live</strong>',
              detail: 'ในหน้า Dashboard เปลี่ยนจาก "In development" เป็น "Live" เพื่อให้ผู้ใช้ทั่วไปเข้าถึงได้'
            }
          ],
          documentation: [
            {
              type: 'official',
              title: 'Facebook for Developers',
              description: 'หน้าหลักสำหรับนักพัฒนา Facebook',
              url: 'https://developers.facebook.com/',
              bgColor: 'bg-blue-600'
            },
            {
              type: 'guide',
              title: 'Facebook Login Documentation',
              description: 'เอกสารการใช้งาน Facebook Login',
              url: 'https://developers.facebook.com/docs/facebook-login/',
              bgColor: 'bg-indigo-600'
            }
          ]
        },
        {
          id: 'line',
          name: 'LINE Login',
          description: 'คำแนะนำการตั้งค่า LINE Login Channel',
          path: 'line',
          iconType: 'image',
          iconUrl: 'https://img.icons8.com/fluency-systems-regular/48/FFFFFF/line-me.png',
          colors: {
            gradient: 'from-green-400 to-green-600',
            primary: 'green-600',
            secondary: 'green-100',
            border: 'green-500',
            text: 'green-800',
            bg: 'from-green-50 to-emerald-100',
            borderColor: 'green-200',
            buttonBg: 'green-600',
            buttonHover: 'green-700',
            confirmButton: '#22c55e'
          },
          steps: [
            { 
              text: 'เข้าสู่ <strong>LINE Developers Console</strong> ที่ <a href="https://developers.line.biz" target="_blank" class="text-blue-600 hover:underline">developers.line.biz</a>',
              detail: 'ใช้บัญชี LINE ของคุณในการเข้าสู่ระบบ'
            },
            { 
              text: 'สร้าง <strong>Provider</strong> ใหม่ (ถ้ายังไม่มี)',
              detail: 'Provider คือชื่อบริษัทหรือองค์กรที่จะแสดงให้ผู้ใช้เห็นเมื่อเข้าสู่ระบบ'
            },
            { 
              text: 'คลิก <strong>Create a LINE Login channel</strong>',
              detail: 'ใส่ชื่อ Channel, คำอธิบาย, และข้อมูลอื่นๆ ตามที่ต้องการ'
            },
            { 
              text: 'ไปที่แท็บ <strong>LINE Login</strong> → <strong>App settings</strong>',
              detail: 'เพิ่ม Callback URL ที่แสดงข้างบนในส่วน "Callback URL"'
            },
            { 
              text: 'ไปที่แท็บ <strong>Basic settings</strong>',
              detail: 'คัดลอก "Channel ID" และ "Channel secret" มาใช้ในระบบ'
            },
            { 
              text: 'ตั้งค่า <strong>OpenID Connect</strong> (ถ้าต้องการ)',
              detail: 'เปิดใช้งาน OpenID Connect เพื่อรับข้อมูลโปรไฟล์ผู้ใช้เพิ่มเติม'
            }
          ],
          documentation: [
            {
              type: 'official',
              title: 'LINE Developers Console',
              description: 'หน้าจัดการแอปพลิเคชัน LINE',
              url: 'https://developers.line.biz/console/',
              bgColor: 'bg-green-600'
            },
            {
              type: 'guide',
              title: 'LINE Login Documentation',
              description: 'เอกสารการใช้งาน LINE Login',
              url: 'https://developers.line.biz/en/docs/line-login/',
              bgColor: 'bg-green-700'
            }
          ]
        }
      ]
    }
  },
  computed: {
    redirectUrl() {
      return `https://${this.currentHostname}/user/authen/${this.currentService.path}/callback`;
    },
    headerStyle() {
      return `background: linear-gradient(135deg, ${this.getColor('primary')}, ${this.getColor('secondary')})`;
    },
    uriSectionStyle() {
      return `background: ${this.getColor('background')}; border-left-color: ${this.getColor('border')}`;
    },
    iconColor() {
      return `color: ${this.getColor('primary')}`;
    },
    textColor() {
      return `color: ${this.getColor('text')}`;
    },
    buttonStyle() {
      return `background-color: ${this.getColor('primary')}`;
    },
    stepStyle() {
      return `background-color: ${this.getColor('primary')}`;
    },
    confirmStyle() {
      return `background-color: ${this.getColor('primary')}`;
    }
  },
  methods: {
    getColor(type) {
      if (!this.currentService.colors) return '#3b82f6';
      
      const colorMap = {
        primary: this.currentService.colors.confirmButton || '#3b82f6',
        secondary: this.currentService.colors.confirmButton + '20' || '#3b82f620',
        background: this.currentService.colors.confirmButton + '10' || '#3b82f610',
        border: this.currentService.colors.confirmButton || '#3b82f6',
        text: this.currentService.colors.confirmButton || '#3b82f6'
      };
      
      return colorMap[type] || '#3b82f6';
    },

    getSetupSteps(steps) {
      // แยกเฉพาะขั้นตอนการตั้งค่า (ไม่รวมขั้นตอนสุดท้ายที่เป็นการคัดลอกข้อมูล)
      return steps.slice(0, -1);
    },

    getRequiredFields(serviceId) {
      const fieldsMap = {
        microsoft: [
          { name: 'Client ID', source: 'Application (client) ID' },
          { name: 'Client Secret', source: 'Client secrets' },
          { name: 'Tenant ID', source: 'Directory (tenant) ID' }
        ],
        google: [
          { name: 'Client ID', source: 'OAuth 2.0 Client IDs' },
          { name: 'Client Secret', source: 'OAuth 2.0 Client IDs' }
        ],
        facebook: [
          { name: 'App ID', source: 'App Dashboard → Settings → Basic' },
          { name: 'App Secret', source: 'App Dashboard → Settings → Basic' }
        ],
        line: [
          { name: 'Channel ID', source: 'Basic settings' },
          { name: 'Channel Secret', source: 'Basic settings' }
        ]
      };
      
      return fieldsMap[serviceId] || [];
    },

    showServiceHelp(serviceId, hostname) {
      const service = this.loginServices.find(s => s.id === serviceId);
      if (!service) return;

      this.currentService = service;
      this.currentHostname = hostname;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    async copyUrl() {
      try {
        await navigator.clipboard.writeText(this.redirectUrl);
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    },

    // Backward compatibility methods
    showMicrosoftHelp(hostname) {
      this.showServiceHelp('microsoft', hostname);
    },

    showGoogleHelp(hostname) {
      this.showServiceHelp('google', hostname);
    },

    showFacebookHelp(hostname) {
      this.showServiceHelp('facebook', hostname);
    },

    showLineHelp(hostname) {
      this.showServiceHelp('line', hostname);
    }
  }
}
</script>

<style scoped>
/* Modal animation */
@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-in {
  animation: modal-in 0.3s ease-out;
}

/* Toast animation */
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-toast-in {
  animation: toast-in 0.3s ease-out;
}

/* Text clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

/* Smooth transitions */
button {
  transition: color 0.2s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .max-w-2xl {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }
}
</style>