<template><div class="hr-component"><h4><i class="fas fa-plus"></i> {{ componentTitle }}</h4><p>Component สำหรับ {{ componentTitle }} - พัฒนาด้วย Dynamic Loading</p></div></template>
<script>
export default {
  name: 'EmployeeCreate',
  data() { return { componentTitle: 'เพิ่มพนักงานใหม่' } },
  async mounted() { await this.initComponent() },
  methods: {
    async initComponent() { if (window.ERP_CORE?.modules?.hr?.init) await window.ERP_CORE.modules.hr.init(this) },
    async apiCall(url, options = {}) { return window.ERP_CORE?.modules?.hr?.apiCall ? await window.ERP_CORE.modules.hr.apiCall(url, options) : { success: false } }
  }
}
</script>