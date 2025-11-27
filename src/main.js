import { createApp } from 'vue';
import { pageTitle } from 'vue-page-title';
import { key } from './master/host.js';
import mitt from 'mitt';
import App from './App.vue';
import router from './router';
import toast from './utils/toast';

import Toast from "vue-toastification";
import VueSweetalert2 from 'vue-sweetalert2';
import Storage from 'vue-lsp';
import VueCryptojs from 'vue-cryptojs'

import Tooltip from "@programic/vue3-tooltip";
// Import the CSS or use your own!
import '@programic/vue3-tooltip/dist/index.css';

import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
//import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { dom } from "@fortawesome/fontawesome-svg-core";

import 'vue-plyr/dist/vue-plyr.css'
import 'sweetalert2/dist/sweetalert2.min.css';
import './assets/css/app.css';
import "vue-toastification/dist/index.css";
import "css-file-icons/build/css-file-icons.css";

import { loadAndStoreConfigData } from '@/plugins/config';
import store from '@/store'

import TooltipPlugin from '@/plugins/TooltipPlugin';
//import '@/plugins/TooltipPlugin.css';

// import your storageManager and requestClient
import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
import ToastAlert from '@/plugins/ToastUI.js';

import { getCurrentLanguage } from '@/plugins/language.js';
import debug from '@/plugins/Logger.js';
import myTooltip from '@/plugins/myTooltip';
import { ApiRequestPlugin } from '@/plugins/apiRequest.js';

// ✅ Import ERP Core components สำหรับสร้าง instance ใหม่
import { createERPCore } from '@/extensions/modules/erp/core/index.js';

const current = getCurrentLanguage();

debug.log("current",current);

library.add(far,fas);
dom.watch();

const toastOptions = {
  position: "bottom-right",
  timeout: 10000,
  pauseOnHover: true,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  closeButton: "button",
  icon: true,
  rtl: false
};

const feather = require('feather-icons');
feather.replace();

(async function() {
  // Define helper functions at the top
  function hasAccess(itemCode, permissions) {
    return permissions[itemCode] !== false;
  }

  function assertAccess(itemCode, permissions) {
    if (permissions[itemCode] === false) {
      throw new Error('Access denied');
    }
    return true;
  }

  try {
    // Show loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.id = 'app-loading';
    loadingEl.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;">กำลังโหลด...</div>';
    document.body.appendChild(loadingEl);

    const configuration = await loadAndStoreConfigData();
    
    // Safely set favicon
    const favicon = document.querySelector('link[rel="shortcut icon"]') || document.createElement('link');
    favicon.setAttribute('rel', 'shortcut icon');
    favicon.setAttribute('type', 'image/x-icon');
    favicon.setAttribute('href', configuration?.siteFavicon || '/favicon.ico');
    document.head.appendChild(favicon);
    
    const eventBus  = mitt();
    const app       = createApp(App);

  //---------------------------------------------------------------------
  //                   Module Feature Function Permission
  //---------------------------------------------------------------------

  // Define the shared permissions object
  const permissions = {
    'itemcode1': true,
    'itemcode2': false,
  };

  // Directive
  app.directive('access', {
    mounted(el, binding) {
      const itemCode = binding.value;
      if (!hasAccess(itemCode, permissions)) {
        el.remove();
      }
    }
  });

  // Globally available in Vue
  app.config.globalProperties.$access = (itemCode) => assertAccess(itemCode, permissions);
  app.config.globalProperties.$toast = toast;

  // Make toast available globally on window for legacy compatibility
  window.toast = toast;

  // ⚠️ ห้ามสร้าง ERP_CORE ตรงนี้! ต้องรอให้ ApiRequest plugin ถูก register ก่อน
  // window.ERP_CORE จะถูกสร้างหลังจาก app.use(ApiRequestPlugin)
  // Dynamic Module Loader methods จะถูกเพิ่มหลังจากสร้าง ERP_CORE แล้ว

  //---------------------------------------------------------------------
  //                   Module Feature Function Permission
  //---------------------------------------------------------------------

  // ⚠️ ไม่ต้องสร้าง tooltip directive ที่นี่ เพราะมี Tooltip plugin อยู่แล้ว
  // app.directive('tooltip') จะถูก register โดย .use(Tooltip) และ .use(TooltipPlugin)
  
  // Define a global variable
  app.config.globalProperties.hostkey   = key;
  app.config.globalProperties.$Key      = key;
  app.config.globalProperties.$Toast    = ToastAlert;
  app.config.globalProperties.$Storage  = storageManager;
  app.config.globalProperties.$Request  = new requestClient(false);
  
  // Get session data from storage with null safety
  let session = null;
  try {
    session = storageManager.get('session');
  } catch (error) {
    console.warn('Error getting session from storage:', error);
  }
  
  console.log('Session data:', session?.current || 'No session data');
  
  // Get tenant data from hostname if session exists
  let tenantData = null;
  if (session?.current?.hostname) {
    try {
      const tenantResponse = await fetch(`https://multi-tenants.manonsanoi.workers.dev/hostname/${session.current.hostname}`);
      if (tenantResponse.ok) {
        tenantData = await tenantResponse.json();
        console.log('Tenant data:', tenantData);
      } else {
        console.warn('Failed to fetch tenant data:', tenantResponse.status);
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error);
    }
  } else {
    console.log('No session or hostname found, skipping tenant data fetch');
  }
  
  // Hide warnings
  app.config.warnHandler = () => {};

  app
  .use(router)
  .use(Toast, toastOptions)
  //.use(ReadMore)
  .use(VueSweetalert2)
  .use(VueCryptojs)
  .use(myTooltip)
  .provide('apiServerName', "xxx")
  .provide('config', configuration)
  .provide('tenant', tenantData) // Provide tenant data
  .use(ApiRequestPlugin) // Register ApiRequest plugin with hardcoded config
  .use(pageTitle({suffix: '/ ' + configuration.siteName, mixin: true,}))
  // .use(VueMarkdownEditor)
  .use(TooltipPlugin)
  .use(Tooltip)
  .use(ContextMenu, { zIndex: 999999,maxWidth: 200 })
  .use(store) // Use the Vuex store
  .component('font-awesome-icon', FontAwesomeIcon)
  .use(Storage, {
      namespace: '_global_',
      name: 'ls',
      storage: 'local',
    }
  );

  // ✅ สร้าง ERP_CORE หลังจาก ApiRequest plugin ถูก register แล้ว
  console.log('🔍 Checking $Request availability:', {
    hasRequest: !!app.config.globalProperties.$Request,
    hasApiRequest: !!app.config.globalProperties.$apiRequest,
    globalProperties: Object.keys(app.config.globalProperties)
  });
  
  if (!app.config.globalProperties.$Request) {
    console.error('❌ $Request not found! Cannot initialize ERP_CORE with API driver.');
    console.log('Available global properties:', Object.keys(app.config.globalProperties));
  } else {
    console.log('✅ $Request is available, initializing ERP_CORE with API driver...');
    
    // 🔑 ✅ ใช้ key เดียวกับ $Key ที่ register ไว้แล้ว
    const clientKey = key; // ใช้ค่าเดียวกับ app.config.globalProperties.$Key
    console.log('Client key for API driver:', clientKey ? '***' + clientKey.slice(-4) : 'Not found');
    
    // สร้าง ERP_CORE instance ใหม่ที่ใช้ API driver พร้อม Vue app
    const { TransactionEngine, TransactionService } = await import('@/extensions/modules/erp/core/index.js');
    const WorkflowEngine = (await import('@/extensions/modules/erp/core/WorkflowEngine.js')).default;
    
    // สร้าง engine และ service ที่ใช้ API driver - ส่ง app พร้อม clientKey
    const apiEngine = new TransactionEngine('api', { 
      vueApp: app,
      clientKey: clientKey 
    });
    const apiService = new TransactionService('api', { 
      vueApp: app,
      clientKey: clientKey 
    });
    const workflowEngine = new WorkflowEngine(apiEngine);
    
    // สร้าง ERP_CORE object
    window.ERP_CORE = await createERPCore(apiEngine, apiService, workflowEngine);
    console.log('✅ ERP_CORE initialized with API driver successfully!');
    
    // Initialize services that need Vue app context
    if (window.ERP_CORE.positions) {
      try {
        window.ERP_CORE.positions.initialize(app.config.globalProperties);
        console.log('✅ PositionService initialized');
      } catch (error) {
        console.warn('⚠️ PositionService initialization failed:', error);
      }
    }
  }
    
    // 🎯 เพิ่ม Dynamic Module Loader methods (สำหรับ masterdata เท่านั้น)
    window.ERP_CORE.getModule = (moduleName) => {
      try {
        const moduleData = window.ERP_CORE.masterdata[moduleName];
        if (!moduleData) {
          console.warn(`[ERP_CORE] Module '${moduleName}' not found in masterdata`);
          return null;
        }
        
        return new Proxy({}, {
          get(target, property) {
            if (moduleData[property] !== undefined) {
              return moduleData[property];
            }
            const matches = Object.keys(moduleData).filter(key => 
              key.toUpperCase().includes(property.toUpperCase())
            );
            if (matches.length === 1) {
              return moduleData[matches[0]];
            }
            return undefined;
          },
          ownKeys() {
            return Object.keys(moduleData);
          },
          has(target, property) {
            return moduleData[property] !== undefined;
          }
        });
      } catch (error) {
        console.error(`[ERP_CORE] Error loading module '${moduleName}':`, error);
        return null;
      }
    };
    
    // ⚠️ ไม่ต้อง overwrite modules เพราะมี ModuleRegistry อยู่แล้ว
    // window.ERP_CORE.modules ถูกสร้างใน createERPCore แล้ว
    console.log('✅ ERP_CORE.modules (ModuleRegistry):', window.ERP_CORE.modules);
    
    // 🔧 เพิ่ม masterdata modules เข้าไปใน Proxy แบบเก่าผ่าน property อื่น
    window.ERP_CORE.masterdataModules = new Proxy({}, {
      get(target, moduleName) {
        if (!target[moduleName]) {
          target[moduleName] = window.ERP_CORE.getModule(moduleName);
        }
        return target[moduleName];
      },
      ownKeys() {
        return Object.keys(window.ERP_CORE.masterdata || {});
      },
      has(target, moduleName) {
        return window.ERP_CORE.masterdata[moduleName] !== undefined;
      }
    });
    
    console.log('[ERP Core] Dynamic modules initialized:', !!window.ERP_CORE.modules);

  // Mount the app
  app.mount('#app');
  
  // ✅ เก็บ app instance ไว้ใน window สำหรับ CodeManager
  window.vueApp = app.config.globalProperties;
  console.log('✅ window.vueApp set:', {
    hasRequest: !!window.vueApp.$Request,
    hasKey: !!window.vueApp.$Key
  });

  // Debug: Check if ApiRequest plugin was registered
  console.log('ApiRequest Plugin Check:', {
    globalApiRequest: app.config.globalProperties.$apiRequest,
    hasApiRequest: !!app.config.globalProperties.$apiRequest
  });

  app.config.globalProperties.eventBus = eventBus;
  app.provide('eventBus', eventBus);

  await router.isReady();

  app.mixin({
    created() {
      this.eventBus = this.eventBus || this.$appContext.app.config.globalProperties.eventBus;
    },
  });

  // Remove loading indicator after app is ready
  const appLoadingElement = document.getElementById('app-loading');
  if (appLoadingElement) {
    appLoadingElement.remove();
  }

  } catch (error) {
    console.error('Application initialization failed:', error);
    
    // Show error message to user
    const errorEl = document.createElement('div');
    errorEl.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: #fee; color: #d00; padding: 20px; border-radius: 8px; 
                  border: 1px solid #fcc; z-index: 9999; text-align: center;">
        <h3>เกิดข้อผิดพลาดในการโหลดแอปพลิเคชัน</h3>
        <p>กรุณารีเฟรชหน้าเว็บ หรือติดต่อผู้ดูแลระบบ</p>
        <button onclick="location.reload()" style="padding: 8px 16px; margin-top: 10px; 
                background: #d00; color: white; border: none; border-radius: 4px; cursor: pointer;">
          รีเฟรชหน้า
        </button>
      </div>
    `;
    document.body.appendChild(errorEl);

    // Remove loading indicator in case of error
    const errorLoadingElement = document.getElementById('app-loading');
    if (errorLoadingElement) {
      errorLoadingElement.remove();
    }
  }

})();
