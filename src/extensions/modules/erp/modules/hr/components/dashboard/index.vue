<template>
  <ModuleDashboard
    title="Human Resources Module"
    subtitle="ระบบจัดการทรัพยากรบุคคล"
    module-name="hr"
    :menu-items="hrMenuItems"
    footer-icon="users"
    footer-text="Human Resources Module v.1.0"
  />
</template>

<script>
import { ModuleDashboard } from '@/extensions/modules/erp'

export default {
  name: 'HRDashboard',
  
  components: {
    ModuleDashboard
  },
  
  data() {
    return {
      hrMenuItems: []
    }
  },
  
  async mounted() {
    const moduleRegistry = window.ERP_CORE?.modules
    if (!moduleRegistry) return
    
    await moduleRegistry.autoRegisterModule('hr')
    const config = await moduleRegistry.getModuleConfig('hr', 'menuConfig') || 
                   await moduleRegistry.getByPath('hr.config.menuConfig')
    
    if (config) {
      this.hrMenuItems = config.default || config.hrMenuItems || config
    }
  }
}
</script>

