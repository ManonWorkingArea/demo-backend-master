<template><div class="hr-component"><h4><i class="fas fa-eye"></i> {{ componentTitle }}</h4><p>Component สำหรับ {{ componentTitle }} - พัฒนาด้วย Dynamic Loading</p></div></template>
<script>
export default {
  name: 'EmployeeDetail',
  data() { return { componentTitle: 'รายละเอียดพนักงาน' } },
  async mounted() { await this.initComponent() },
  methods: {
    async initComponent() { if (window.ERP_CORE?.modules?.hr?.init) await window.ERP_CORE.modules.hr.init(this) },
    async apiCall(url, options = {}) { return window.ERP_CORE?.modules?.hr?.apiCall ? await window.ERP_CORE.modules.hr.apiCall(url, options) : { success: false } }
  }
}
</script>