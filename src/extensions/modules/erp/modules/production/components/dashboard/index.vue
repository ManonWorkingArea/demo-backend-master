<template>
  <ModuleDashboard
    title="Production Module"
    subtitle="ระบบควบคุมงานผลิต ตั้งแต่แผนจนถึงสินค้าเสร็จ"
    module-name="production"
    :menu-items="productionMenuItems"
    footer-icon="industry"
    footer-text="Production Module v.1.0"
  />
</template>

<script>
import { ModuleDashboard } from '@/extensions/modules/erp'

export default {
  name: 'ProductionDashboard',
  
  components: {
    ModuleDashboard
  },
  
  data() {
    return {
      productionMenuItems: []
    }
  },
  
  async mounted() {
    const moduleRegistry = window.ERP_CORE?.modules
    if (!moduleRegistry) return
    
    await moduleRegistry.autoRegisterModule('production')
    const config = await moduleRegistry.getModuleConfig('production', 'menuConfig') || 
                   await moduleRegistry.getByPath('production.config.menuConfig')
    
    if (config) {
      this.productionMenuItems = config.default || config.productionMenuItems || config
    }
  }
}
</script>

