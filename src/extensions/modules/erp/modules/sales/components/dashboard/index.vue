<template>
  <ModuleDashboard
    title="Sales Module"
    subtitle="ระบบขาย: ใบเสนอราคา → ใบสั่งซื้อ → ใบแจ้งหนี้"
    module-name="sales"
    :menu-items="salesMenuItems"
    footer-icon="file-invoice-dollar"
    footer-text="Sales Module v.1.0"
  />
</template>

<script>
import { ModuleDashboard } from '@/extensions/modules/erp'

export default {
  name: 'SalesDashboard',
  
  components: {
    ModuleDashboard
  },
  
  data() {
    return {
      salesMenuItems: []
    }
  },
  
  async mounted() {
    const moduleRegistry = window.ERP_CORE?.modules
    if (!moduleRegistry) return
    
    await moduleRegistry.autoRegisterModule('sales')
    const config = await moduleRegistry.getModuleConfig('sales', 'menuConfig') || 
                   await moduleRegistry.getByPath('sales.config.menuConfig')
    
    if (config) {
      this.salesMenuItems = config.default || config.salesMenuItems || config
    }
  }
}
</script>

