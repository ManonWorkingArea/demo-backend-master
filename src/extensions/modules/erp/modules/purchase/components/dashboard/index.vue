<template>
  <div>
    <ModuleDashboard
      title="Purchase Module"
      subtitle="ระบบจัดการขาซื้อ ตั้งแต่การขอสั่งซื้อจนถึงการรับเข้าและออกใบแจ้งหนี้"
      module-name="purchase"
      :menu-items="purchaseMenuItems"
      footer-icon="shopping-cart"
      footer-text="Purchase Module v.1.0"
    />
    
    <!-- แสดง Accounting Menu ที่ดึงมาจาก ModuleRegistry -->
    <div v-if="accountingMenuItems" style="margin-top: 2rem; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
      <h3 style="margin-bottom: 1rem; color: #333;">
        📊 Accounting Menu (ดึงจาก ModuleRegistry)
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.5rem;">
        <div 
          v-for="item in accountingMenuItems" 
          :key="item.key"
          style="padding: 0.5rem; background: white; border-radius: 4px; font-size: 0.9rem;"
        >
          <strong>{{ item.label }}</strong>
          <div style="font-size: 0.8rem; color: #666;">{{ item.to }}</div>
        </div>
      </div>
    </div>
    
    <!-- แสดงข้อมูล Debug -->
    <div style="margin-top: 1rem; padding: 1rem; background: #e8f5e9; border-radius: 8px; font-family: monospace; font-size: 0.85rem;">
      <h4 style="margin-bottom: 0.5rem;">🔍 ModuleRegistry Debug Info:</h4>
      <div><strong>Registered Modules:</strong> {{ registeredModules.join(', ') }}</div>
      <div><strong>Purchase Registered:</strong> {{ purchaseRegistered ? '✅' : '❌' }}</div>
      <div><strong>Accounting Config Available:</strong> {{ accountingConfigAvailable ? '✅' : '❌' }}</div>
      <div><strong>Accounting Menu Items Count:</strong> {{ accountingMenuItems?.length || 0 }}</div>
    </div>
  </div>
</template>

<script>
import { ModuleDashboard } from '@/extensions/modules/erp'

export default {
  name: 'PurchaseDashboard',
  
  components: {
    ModuleDashboard
  },
  
  data() {
    return {
      purchaseMenuItems: [],
      accountingMenuItems: null,
      registeredModules: [],
      purchaseRegistered: false,
      accountingConfigAvailable: false
    }
  },
  
  mounted() {
    this.loadPurchaseMenu()
    this.registerPurchaseModule()
    this.loadAccountingMenu()
    this.debugModuleRegistry()
  },
  
  methods: {
    /**
     * โหลด Purchase Menu จาก ModuleRegistry
     */
    async loadPurchaseMenu() {
      const ERP_CORE = window.ERP_CORE
      
      if (!ERP_CORE || !ERP_CORE.modules) {
        return
      }
      
      const moduleRegistry = ERP_CORE.modules
      
      try {
        // ลอง auto-register purchase module ก่อน
        await moduleRegistry.autoRegisterModule('purchase')
        
        // ดึง menuConfig ของ purchase
        let purchaseConfig = await moduleRegistry.getModuleConfig('purchase', 'menuConfig')
        
        // ลองวิธีอื่นถ้ายังไม่ได้
        if (!purchaseConfig) {
          purchaseConfig = await moduleRegistry.getByPath('purchase.config.menuConfig')
        }
        
        if (purchaseConfig) {
          // รองรับหลาย export patterns
          if (purchaseConfig.default) {
            this.purchaseMenuItems = purchaseConfig.default
          } else if (Array.isArray(purchaseConfig)) {
            this.purchaseMenuItems = purchaseConfig
          } else if (purchaseConfig.purchaseMenuItems) {
            this.purchaseMenuItems = purchaseConfig.purchaseMenuItems
          } else {
            this.purchaseMenuItems = purchaseConfig
          }
        }
      } catch (error) {
        // Silent error
      }
    },
    
    /**
     * ลงทะเบียน Purchase Module กับ ModuleRegistry
     */
    registerPurchaseModule() {
      const ERP_CORE = window.ERP_CORE
      
      if (!ERP_CORE || !ERP_CORE.modules) {
        return
      }
      
      const moduleRegistry = ERP_CORE.modules
      
      // ตรวจสอบว่า moduleRegistry มี methods หรือไม่
      if (typeof moduleRegistry.registerConfig !== 'function') {
        // Fallback: ลองเข้าถึงแบบ manual
        if (!moduleRegistry.modules) {
          moduleRegistry.modules = {}
        }
        if (!moduleRegistry.modules.purchase) {
          moduleRegistry.modules.purchase = {
            config: { menuConfig: this.purchaseMenuItems },
            version: '1.0.0'
          }
        }
        this.purchaseRegistered = true
        return
      }
      
      // ตรวจสอบว่ามี purchase module แล้วหรือยัง
      if (moduleRegistry.hasModule('purchase')) {
        this.purchaseRegistered = true
        return
      }
      
      // ลงทะเบียนปกติ (ถ้า autoRegisterModule ยังไม่ได้ทำ)
      if (this.purchaseMenuItems.length > 0) {
        moduleRegistry.registerConfig('purchase', 'menuConfig', this.purchaseMenuItems)
        moduleRegistry.registerModule('purchase', {
          config: {
            menuConfig: this.purchaseMenuItems
          },
          version: '1.0.0',
          features: ['purchase_request', 'purchase_order', 'goods_receipt', 'ap_invoice']
        })
      }
      
      this.purchaseRegistered = true
    },
    
    /**
     * ดึง Accounting Menu จาก ModuleRegistry
     */
    async loadAccountingMenu() {
      const ERP_CORE = window.ERP_CORE
      
      if (!ERP_CORE || !ERP_CORE.modules) {
        return
      }
      
      const moduleRegistry = ERP_CORE.modules
      
      try {
        // ลองดึงจาก registry ก่อน
        let accountingConfig = await moduleRegistry.getModuleConfig('accounting', 'menuConfig')
        
        // ถ้ายังไม่มี ลอง auto-register
        if (!accountingConfig) {
          await moduleRegistry.autoRegisterModule('accounting')
          accountingConfig = await moduleRegistry.getModuleConfig('accounting', 'menuConfig')
        }
        
        // ลองวิธีอื่นๆ ในการเข้าถึง
        if (!accountingConfig) {
          accountingConfig = await moduleRegistry.getByPath('accounting.config.menuConfig')
        }
        
        if (accountingConfig) {
          // ถ้าเป็น object ที่มี default export
          if (accountingConfig.default) {
            this.accountingMenuItems = accountingConfig.default
          } else if (Array.isArray(accountingConfig)) {
            this.accountingMenuItems = accountingConfig
          } else if (accountingConfig.accountingMenuItems) {
            this.accountingMenuItems = accountingConfig.accountingMenuItems
          } else {
            this.accountingMenuItems = accountingConfig
          }
          
          this.accountingConfigAvailable = true
        }
      } catch (error) {
        // Silent error
      }
    },
    
    /**
     * แสดงข้อมูล debug จาก ModuleRegistry
     */
    debugModuleRegistry() {
      const ERP_CORE = window.ERP_CORE
      
      if (!ERP_CORE || !ERP_CORE.modules) {
        return
      }
      
      const moduleRegistry = ERP_CORE.modules
      
      // ตรวจสอบว่ามี methods หรือไม่
      if (typeof moduleRegistry.getModuleNames !== 'function') {
        // Fallback: ดึงข้อมูลแบบ manual
        if (moduleRegistry.modules && typeof moduleRegistry.modules === 'object') {
          this.registeredModules = Object.keys(moduleRegistry.modules)
        }
        return
      }
      
      // ดึงรายชื่อ modules ที่ลงทะเบียนแล้ว
      this.registeredModules = moduleRegistry.getModuleNames()
    }
  }
}
</script>
