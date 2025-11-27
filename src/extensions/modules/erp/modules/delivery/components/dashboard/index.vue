<template>
  <ModuleDashboard
    title="Delivery Module"
    subtitle="ระบบจัดการการจัดส่งสินค้า"
    module-name="delivery"
    :menu-items="deliveryMenuItems"
    footer-icon="truck"
    footer-text="Delivery Module v.1.0"
  />
</template>

<script>
import { ModuleDashboard } from '@/extensions/modules/erp'

export default {
  name: 'DeliveryDashboard',
  
  components: {
    ModuleDashboard
  },
  
  data() {
    return {
      deliveryMenuItems: []
    }
  },
  
  async mounted() {
    const moduleRegistry = window.ERP_CORE?.modules
    if (!moduleRegistry) return
    
    await moduleRegistry.autoRegisterModule('delivery')
    const config = await moduleRegistry.getModuleConfig('delivery', 'menuConfig') || 
                   await moduleRegistry.getByPath('delivery.config.menuConfig')
    
    if (config) {
      this.deliveryMenuItems = config.default || config.deliveryMenuItems || config
    }
  }
}
</script>

