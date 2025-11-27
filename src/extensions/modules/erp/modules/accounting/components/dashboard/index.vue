<template>
  <ModuleDashboard
    title="Accounting Module"
    subtitle="ระบบบัญชีและการเงิน"
    module-name="accounting"
    :menu-items="accountingMenuItems"
    footer-icon="calculator"
    footer-text="Accounting Module v.1.0"
  />
</template>

<script>
import { ModuleDashboard } from '@/extensions/modules/erp'

export default {
  name: 'AccountingDashboard',
  
  components: {
    ModuleDashboard
  },
  
  data() {
    return {
      accountingMenuItems: []
    }
  },
  
  async mounted() {
    const moduleRegistry = window.ERP_CORE?.modules
    if (!moduleRegistry) return
    
    await moduleRegistry.autoRegisterModule('accounting')
    const config = await moduleRegistry.getModuleConfig('accounting', 'menuConfig') || 
                   await moduleRegistry.getByPath('accounting.config.menuConfig')
    
    if (config) {
      this.accountingMenuItems = config.default || config.accountingMenuItems || config
    }
  }
}
</script>

