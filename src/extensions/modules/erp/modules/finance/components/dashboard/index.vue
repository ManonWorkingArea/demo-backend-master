<template>
  <ModuleDashboard
    title="Finance Module"
    subtitle="ระบบการเงินและบัญชี"
    module-name="finance"
    :menu-items="financeMenuItems"
    footer-icon="calculator"
    footer-text="Finance Module v.1.0"
  />
</template>

<script>
import { ModuleDashboard } from '@/extensions/modules/erp'

export default {
  name: 'FinanceDashboard',
  
  components: {
    ModuleDashboard
  },
  
  data() {
    return {
      financeMenuItems: []
    }
  },
  
  async mounted() {
    const moduleRegistry = window.ERP_CORE?.modules
    if (!moduleRegistry) return
    
    await moduleRegistry.autoRegisterModule('finance')
    const config = await moduleRegistry.getModuleConfig('finance', 'menuConfig') || 
                   await moduleRegistry.getByPath('finance.config.menuConfig')
    
    if (config) {
      this.financeMenuItems = config.default || config.financeMenuItems || config
    }
  }
}
</script>

