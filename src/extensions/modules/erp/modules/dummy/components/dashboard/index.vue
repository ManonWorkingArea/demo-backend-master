<template>
  <ModuleDashboard
    title="Dummy Module"
    subtitle="Template module สำหรับการพัฒนาโมดูลใหม่ด้วย Tailwind CSS"
    module-name="dummy"
    :menu-items="dummyMenuItems"
    footer-icon="cube"
    footer-text="Dummy Module v.1.0"
  />
</template>

<script>
import { ModuleDashboard } from '@/extensions/modules/erp'

export default {
  name: 'DummyDashboard',
  
  components: {
    ModuleDashboard
  },
  
  data() {
    return {
      dummyMenuItems: []
    }
  },
  
  async mounted() {
    const moduleRegistry = window.ERP_CORE?.modules
    if (!moduleRegistry) return
    
    await moduleRegistry.autoRegisterModule('dummy')
    const config = await moduleRegistry.getModuleConfig('dummy', 'menuConfig') || 
                   await moduleRegistry.getByPath('dummy.config.menuConfig')
    
    if (config) {
      this.dummyMenuItems = config.default || config.dummyMenuItems || config
    }
  }
}
</script>
